"""
Password Reset Service - TikTrack
שירות איפוס סיסמה

This service handles password reset requests and token management.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import logging
import secrets
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from config.database import SessionLocal
from models.user import User
from models.password_reset_token import PasswordResetToken
from services.email_service import EmailService

logger = logging.getLogger(__name__)


class PasswordResetService:
    """
    Password reset service for managing password reset requests
    """
    
    def __init__(self):
        self._SessionLocal = SessionLocal
        self.email_service = EmailService()
        self.token_expiry_hours = 24  # Tokens expire after 24 hours
    
    @contextmanager
    def _session_scope(self, commit: bool = False):
        """Provide a transactional scope around a series of operations."""
        session = self._SessionLocal()
        try:
            yield session
            if commit:
                session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def generate_reset_token(self) -> str:
        """
        Generate a secure random token for password reset
        
        Returns:
            str: Secure random token
        """
        return secrets.token_urlsafe(32)
    
    def request_password_reset(
        self,
        email: Optional[str] = None,
        username: Optional[str] = None,
        base_url: str = "http://localhost:8080"
    ) -> Dict[str, Any]:
        """
        Request password reset - sends email with reset link
        
        Args:
            email: User email address (optional if username provided)
            username: Username (optional if email provided)
            base_url: Base URL for reset link (default: http://localhost:8080)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        with self._session_scope() as session:
            # Find user by email or username
            user = None
            if email:
                user = session.scalars(
                    select(User).where(User.email == email)
                ).first()
            elif username:
                user = session.scalars(
                    select(User).where(User.username == username)
                ).first()
            
            if not user:
                # Don't reveal if user exists or not (security best practice)
                logger.warning(f"Password reset requested for non-existent user: {email or username}")
                return {
                    'success': True,  # Return success even if user doesn't exist (security)
                    'message': 'If the email exists, a password reset link has been sent.'
                }
            
            if not user.email:
                logger.warning(f"User {user.username} has no email address")
                return {
                    'success': False,
                    'error': 'User has no email address configured'
                }
            
            if not user.is_active:
                logger.warning(f"Password reset requested for inactive user: {user.username}")
                return {
                    'success': False,
                    'error': 'User account is inactive'
                }
            
            # Generate token
            token = self.generate_reset_token()
            expires_at = datetime.utcnow() + timedelta(hours=self.token_expiry_hours)
            
            # Invalidate any existing tokens for this user
            existing_tokens = session.scalars(
                select(PasswordResetToken).where(
                    PasswordResetToken.user_id == user.id,
                    PasswordResetToken.used == False
                )
            ).all()
            for existing_token in existing_tokens:
                existing_token.used = True
                existing_token.updated_at = datetime.utcnow()
            
            # Create new token
            reset_token = PasswordResetToken(
                user_id=user.id,
                token=token,
                expires_at=expires_at,
                used=False
            )
            session.add(reset_token)
            session.commit()
            
            # Generate reset URL
            reset_url = f"{base_url}/reset-password.html?token={token}"
            
            # Load SMTP settings from database
            self.email_service.load_settings_from_db(session)
            
            # Send email with logging
            email_result = self.email_service.send_password_reset_email(
                to_email=user.email,
                username=user.username,
                reset_token=token,
                reset_url=reset_url,
                db_session=session,
                user_id=user.id
            )
            
            if email_result['success']:
                logger.info(f"Password reset email sent to {user.email} for user {user.username}")
                return {
                    'success': True,
                    'message': 'If the email exists, a password reset link has been sent.'
                }
            else:
                logger.error(f"Failed to send password reset email: {email_result.get('error')}")
                return {
                    'success': False,
                    'error': email_result.get('error', 'Failed to send email')
                }
    
    def reset_password(
        self,
        token: str,
        new_password: str
    ) -> Dict[str, Any]:
        """
        Reset password using token
        
        Args:
            token: Password reset token
            new_password: New password (must be at least 6 characters)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        # Validate password
        if not new_password or len(new_password) < 6:
            return {
                'success': False,
                'error': 'Password must be at least 6 characters'
            }
        
        with self._session_scope(commit=True) as session:
            # Find token
            reset_token = session.scalars(
                select(PasswordResetToken).where(PasswordResetToken.token == token)
            ).first()
            
            if not reset_token:
                logger.warning(f"Invalid password reset token used: {token[:10]}...")
                return {
                    'success': False,
                    'error': 'Invalid or expired reset token'
                }
            
            # Check if token is valid
            if not reset_token.is_valid():
                logger.warning(f"Expired or used password reset token: {token[:10]}...")
                return {
                    'success': False,
                    'error': 'Invalid or expired reset token'
                }
            
            # Get user
            user = session.scalars(
                select(User).where(User.id == reset_token.user_id)
            ).first()
            
            if not user:
                logger.error(f"User not found for reset token: {token[:10]}...")
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # Update password
            user.set_password(new_password)
            user.updated_at = datetime.utcnow()
            
            # Mark token as used
            reset_token.mark_as_used()
            
            session.commit()
            
            logger.info(f"Password reset successful for user {user.username}")
            return {
                'success': True,
                'message': 'Password reset successfully'
            }
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate password reset token without using it
        
        Args:
            token: Password reset token
            
        Returns:
            Dict with 'success' (bool) and 'valid' (bool) or 'error' (str)
        """
        with self._session_scope() as session:
            reset_token = session.scalars(
                select(PasswordResetToken).where(PasswordResetToken.token == token)
            ).first()
            
            if not reset_token:
                return {
                    'success': True,
                    'valid': False,
                    'error': 'Invalid token'
                }
            
            if not reset_token.is_valid():
                return {
                    'success': True,
                    'valid': False,
                    'error': 'Token expired or already used'
                }
            
            return {
                'success': True,
                'valid': True,
                'user_id': reset_token.user_id
            }

