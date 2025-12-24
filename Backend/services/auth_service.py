#!/usr/bin/env python3
"""
Authentication Service – User registration and authentication
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from config.database import SessionLocal
from models.user import User

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service for user registration and login.
    """

    def __init__(self):
        self._SessionLocal = SessionLocal

    # ------------------------------------------------------------------
    # Session helper
    # ------------------------------------------------------------------
    @contextmanager
    def _session_scope(self, commit: bool = False) -> Session:
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

    # ------------------------------------------------------------------
    # Password hashing
    # ------------------------------------------------------------------
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt
        
        Args:
            password: Plain text password
            
        Returns:
            str: Hashed password string
            
        Example:
            >>> hashed = AuthService.hash_password("mypassword")
            >>> len(hashed) > 0
            True
        """
        import bcrypt
        if not password:
            raise ValueError("Password cannot be empty")
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """
        Verify a password against a hash
        
        Args:
            password: Plain text password to verify
            password_hash: Stored password hash
            
        Returns:
            bool: True if password matches, False otherwise
            
        Example:
            >>> hashed = AuthService.hash_password("mypassword")
            >>> AuthService.verify_password("mypassword", hashed)
            True
            >>> AuthService.verify_password("wrong", hashed)
            False
        """
        import bcrypt
        if not password or not password_hash:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False

    # ------------------------------------------------------------------
    # User registration
    # ------------------------------------------------------------------
    def register_user(
        self,
        username: str,
        password: str,
        email: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Register a new user
        
        Args:
            username: Unique username
            password: Plain text password (will be hashed)
            email: User email (optional)
            first_name: First name (optional)
            last_name: Last name (optional)
            
        Returns:
            Dict with 'success' (bool) and 'user' (dict) or 'error' (str)
            
        Example:
            >>> result = auth_service.register_user("testuser", "password123", "test@example.com")
            >>> result['success']
            True
        """
        with self._session_scope() as session:
            # Check if username already exists
            existing = session.scalars(
                select(User.id).where(User.username == username)
            ).first()
            if existing:
                return {
                    'success': False,
                    'error': 'Username already exists'
                }
            
            # Check if email already exists (if provided)
            if email:
                existing_email = session.scalars(
                    select(User.id).where(User.email == email)
                ).first()
                if existing_email:
                    return {
                        'success': False,
                        'error': 'Email already exists'
                    }
        
        # Create user with hashed password
        with self._session_scope(commit=True) as session:
            try:
                user = User(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,
                    is_default=False,
                    updated_at=datetime.utcnow(),
                )
                # Set password using model method
                user.set_password(password)
                
                session.add(user)
                session.flush()
                
                logger.info(f"Registered new user: {username}")
                
                # CRITICAL: Create default profile for new user
                # Profile name format: username + " פרופיל 1"
                from models.preferences import PreferenceProfile
                profile_name = f"{username} פרופיל 1"
                default_profile = PreferenceProfile(
                    user_id=user.id,
                    profile_name=profile_name,
                    is_active=True,
                    is_default=False,  # User profile, not system default
                    description=f"פרופיל ברירת מחדל למשתמש {username}",
                    created_by=user.id,
                )
                session.add(default_profile)
                session.flush()
                logger.info(f"Created default profile '{profile_name}' for user {username} (ID: {user.id})")
                
                return {
                    'success': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_active': user.is_active,
                    }
                }
            except Exception as e:
                logger.error(f"Error registering user {username}: {e}")
                return {
                    'success': False,
                    'error': f'Registration failed: {str(e)}'
                }

    # ------------------------------------------------------------------
    # User authentication
    # ------------------------------------------------------------------
    def authenticate_user(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate a user by username and password
        
        Args:
            username: Username to authenticate
            password: Plain text password
            
        Returns:
            Dict with 'success' (bool) and 'user' (dict) or 'error' (str)
            
        Example:
            >>> result = auth_service.authenticate_user("testuser", "password123")
            >>> result['success']
            True
        """
        with self._session_scope() as session:
            # Find user by username
            user = session.scalars(
                select(User).where(User.username == username)
            ).first()
            
            if not user:
                logger.warning(f"Authentication failed: user '{username}' not found")
                return {
                    'success': False,
                    'error': 'Invalid username or password'
                }
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Authentication failed: user '{username}' is inactive")
                return {
                    'success': False,
                    'error': 'User account is inactive'
                }
            
            # Verify password
            if not user.check_password(password):
                logger.warning(f"Authentication failed: invalid password for user '{username}'")
                return {
                    'success': False,
                    'error': 'Invalid username or password'
                }
            
            # Update last login time (if we add that field later)
            user.updated_at = datetime.utcnow()
            session.commit()
            
            logger.info(f"User '{username}' authenticated successfully")
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                    'is_default': user.is_default,
                    'full_name': user.full_name,
                    'display_name': user.display_name,
                }
            }

