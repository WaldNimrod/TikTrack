"""
Email Service - TikTrack
שירות שליחת מיילים

This service handles sending emails for password reset and other notifications.

Function Index:
==============
INITIALIZATION:
- __init__() - Initialize email service with default settings

SETTINGS MANAGEMENT:
- load_settings_from_db(db_session) - Load SMTP settings from SystemSettings
- validate_settings() - Validate current SMTP settings

EMAIL SENDING:
- send_email(to_email, subject, body_html, body_text=None) - Send email via SMTP
- send_password_reset_email(to_email, username, reset_token, reset_url) - Send password reset email

TESTING:
- test_connection(db_session=None) - Test SMTP connection

Author: TikTrack Development Team
Version: 2.0.0
Last Updated: January 28, 2025
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
import os
from sqlalchemy.orm import Session

from services.system_settings_service import SystemSettingsService
from services.email_templates import render_template
from models.email_log import EmailLog

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service for sending emails
    
    Supports SMTP email sending with configurable settings from SystemSettings
    or environment variables (fallback).
    """
    
    def __init__(self):
        # Email configuration from environment variables (fallback)
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('SMTP_FROM_EMAIL', self.smtp_user)
        self.from_name = os.getenv('SMTP_FROM_NAME', 'TikTrack')
        self.use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        self.smtp_enabled = os.getenv('SMTP_ENABLED', 'true').lower() == 'true'
        
        # Development mode - log emails instead of sending
        self.dev_mode = os.getenv('TIKTRACK_DEV_MODE', 'true').lower() == 'true'
        
        # Flag to track if settings were loaded from DB
        self._settings_loaded_from_db = False
    
    def load_settings_from_db(self, db_session: Session) -> bool:
        """
        Load SMTP settings from SystemSettings
        
        Args:
            db_session: Database session
            
        Returns:
            bool: True if settings were loaded successfully
        """
        try:
            settings_service = SystemSettingsService(db_session)
            smtp_settings = settings_service.get_group_settings('smtp_settings')
            
            if not smtp_settings:
                logger.debug("No SMTP settings found in SystemSettings, using environment variables")
                return False
            
            # Update settings from database
            if 'smtp_host' in smtp_settings:
                self.smtp_host = smtp_settings['smtp_host'] or self.smtp_host
            if 'smtp_port' in smtp_settings:
                self.smtp_port = int(smtp_settings['smtp_port']) if smtp_settings['smtp_port'] else self.smtp_port
            if 'smtp_user' in smtp_settings:
                self.smtp_user = smtp_settings['smtp_user'] or self.smtp_user
            if 'smtp_password' in smtp_settings and smtp_settings['smtp_password']:
                # Password is encrypted in DB, need to decrypt it for use
                from services.smtp_settings_service import SMTPSettingsService
                smtp_service = SMTPSettingsService()
                try:
                    # Decrypt password for use
                    encrypted_password = smtp_settings['smtp_password']
                    # Check if it's encrypted (Fernet encrypted strings start with 'gAAAAAB')
                    if encrypted_password.startswith('gAAAAAB'):
                        self.smtp_password = smtp_service.decrypt_password(encrypted_password)
                    else:
                        # Not encrypted, use as-is (backward compatibility)
                        self.smtp_password = encrypted_password
                except Exception as e:
                    logger.warning(f"Failed to decrypt SMTP password, using as-is: {e}")
                    self.smtp_password = smtp_settings['smtp_password']
            if 'smtp_from_email' in smtp_settings:
                self.from_email = smtp_settings['smtp_from_email'] or self.from_email
            if 'smtp_from_name' in smtp_settings:
                self.from_name = smtp_settings['smtp_from_name'] or self.from_name
            if 'smtp_use_tls' in smtp_settings:
                self.use_tls = bool(smtp_settings['smtp_use_tls']) if smtp_settings['smtp_use_tls'] is not None else self.use_tls
            if 'smtp_enabled' in smtp_settings:
                self.smtp_enabled = bool(smtp_settings['smtp_enabled']) if smtp_settings['smtp_enabled'] is not None else self.smtp_enabled
            
            self._settings_loaded_from_db = True
            logger.info("SMTP settings loaded from SystemSettings", extra={
                'smtp_host': self.smtp_host,
                'smtp_port': self.smtp_port,
                'smtp_user': self.smtp_user,
                'smtp_enabled': self.smtp_enabled
            })
            return True
            
        except Exception as e:
            logger.error(f"Error loading SMTP settings from database: {e}", exc_info=True)
            return False
    
    def validate_settings(self) -> Dict[str, Any]:
        """
        Validate current SMTP settings
        
        Returns:
            Dict with 'valid' (bool) and 'errors' (list) if invalid
        """
        errors = []
        
        if not self.smtp_host:
            errors.append("SMTP host is required")
        
        if not self.smtp_port or self.smtp_port < 1 or self.smtp_port > 65535:
            errors.append("SMTP port must be between 1 and 65535")
        
        if not self.smtp_user:
            errors.append("SMTP user is required")
        
        if not self.smtp_password:
            errors.append("SMTP password is required")
        
        if not self.from_email:
            errors.append("From email is required")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def test_connection(self, db_session: Optional[Session] = None) -> Dict[str, Any]:
        """
        Test SMTP connection
        
        Args:
            db_session: Database session (optional, for loading settings)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        try:
            # Load settings from DB if session provided and not already loaded
            if db_session and not self._settings_loaded_from_db:
                self.load_settings_from_db(db_session)
            
            # Validate settings
            validation = self.validate_settings()
            if not validation['valid']:
                return {
                    'success': False,
                    'error': f"Invalid SMTP settings: {', '.join(validation['errors'])}"
                }
            
            # Test connection
            # Handle both TLS (port 587) and SSL (port 465)
            if self.smtp_port == 465:
                # Port 465 uses SSL, not TLS
                import ssl
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=30, context=context) as server:
                    server.login(self.smtp_user, self.smtp_password)
            else:
                # Port 587 uses TLS
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                    if self.use_tls:
                        server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
            
            logger.info("SMTP connection test successful", extra={
                'smtp_host': self.smtp_host,
                'smtp_port': self.smtp_port
            })
            return {
                'success': True,
                'message': 'SMTP connection successful'
            }
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP authentication failed: {e}", extra={
                'smtp_host': self.smtp_host,
                'smtp_user': self.smtp_user
            })
            return {
                'success': False,
                'error': f'SMTP authentication failed: {str(e)}'
            }
        except smtplib.SMTPException as e:
            logger.error(f"SMTP connection error: {e}", extra={
                'smtp_host': self.smtp_host,
                'smtp_port': self.smtp_port
            })
            return {
                'success': False,
                'error': f'SMTP connection error: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Error testing SMTP connection: {e}", exc_info=True, extra={
                'smtp_host': self.smtp_host,
                'smtp_port': self.smtp_port
            })
            return {
                'success': False,
                'error': f'Failed to test SMTP connection: {str(e)}'
            }
    
    def _log_email(
        self,
        db_session: Optional[Session],
        recipient: str,
        subject: str,
        status: str,
        error_message: Optional[str] = None,
        email_type: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> None:
        """
        Log email sending attempt to database
        
        Args:
            db_session: Database session (optional)
            recipient: Recipient email address
            subject: Email subject
            status: Status (success, failed, pending)
            error_message: Error message if failed (optional)
            email_type: Type of email (optional)
            user_id: User ID who triggered the email (optional)
        """
        if not db_session:
            # If no session provided, just log to logger
            logger.debug(f"Email log (no DB session): {status} - {recipient} - {subject}")
            return
        
        try:
            email_log = EmailLog(
                recipient=recipient,
                subject=subject,
                status=status,
                error_message=error_message,
                email_type=email_type,
                user_id=user_id
            )
            db_session.add(email_log)
            db_session.commit()
            logger.debug(f"Email logged to database: {status} - {recipient}")
        except Exception as e:
            logger.error(f"Failed to log email to database: {e}", exc_info=True)
            db_session.rollback()
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        db_session: Optional[Session] = None,
        email_type: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Send an email
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body_html: HTML email body
            body_text: Plain text email body (optional)
            db_session: Database session for logging (optional)
            email_type: Type of email for logging (optional)
            user_id: User ID who triggered the email (optional)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        try:
            # Check if SMTP is enabled
            if not self.smtp_enabled:
                logger.warning("SMTP is disabled, email not sent", extra={
                    'recipient': to_email,
                    'subject': subject
                })
                return {
                    'success': False,
                    'error': 'SMTP is disabled'
                }
            
            if self.dev_mode:
                # In development mode, just log the email
                logger.info("📧 [DEV MODE] Email would be sent", extra={
                    'recipient': to_email,
                    'subject': subject,
                    'body_preview': (body_text or body_html[:200]) if body_text or body_html else None
                })
                # Log to database even in dev mode
                self._log_email(db_session, to_email, subject, 'success', 
                              email_type=email_type, user_id=user_id)
                return {
                    'success': True,
                    'message': 'Email logged (dev mode)'
                }
            
            # Validate settings
            validation = self.validate_settings()
            if not validation['valid']:
                logger.error("Invalid SMTP settings", extra={
                    'errors': validation['errors'],
                    'recipient': to_email
                })
                return {
                    'success': False,
                    'error': f"Invalid SMTP settings: {', '.join(validation['errors'])}"
                }
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if body_text:
                text_part = MIMEText(body_text, 'plain', 'utf-8')
                msg.attach(text_part)
            
            html_part = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Send email via SMTP
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info("✅ Email sent successfully", extra={
                'recipient': to_email,
                'subject': subject,
                'smtp_host': self.smtp_host
            })
            
            # Log email to database
            self._log_email(db_session, to_email, subject, 'success',
                          email_type=email_type, user_id=user_id)
            
            return {
                'success': True,
                'message': 'Email sent successfully'
            }
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f'SMTP authentication failed: {str(e)}'
            logger.error("❌ SMTP authentication failed", extra={
                'recipient': to_email,
                'error': str(e),
                'smtp_host': self.smtp_host,
                'smtp_user': self.smtp_user
            })
            # Log failure to database
            self._log_email(db_session, to_email, subject, 'failed', 
                          error_message=error_msg, email_type=email_type, user_id=user_id)
            return {
                'success': False,
                'error': error_msg
            }
        except smtplib.SMTPException as e:
            error_msg = f'SMTP error: {str(e)}'
            logger.error("❌ SMTP error", extra={
                'recipient': to_email,
                'error': str(e),
                'smtp_host': self.smtp_host,
                'smtp_port': self.smtp_port
            })
            # Log failure to database
            self._log_email(db_session, to_email, subject, 'failed', 
                          error_message=error_msg, email_type=email_type, user_id=user_id)
            return {
                'success': False,
                'error': error_msg
            }
        except Exception as e:
            error_msg = f'Failed to send email: {str(e)}'
            logger.error("❌ Error sending email", extra={
                'recipient': to_email,
                'error': str(e),
                'subject': subject
            }, exc_info=True)
            # Log failure to database
            self._log_email(db_session, to_email, subject, 'failed', 
                          error_message=error_msg, email_type=email_type, user_id=user_id)
            return {
                'success': False,
                'error': error_msg
            }
    
    def send_password_reset_email(
        self,
        to_email: str,
        username: str,
        reset_token: str,
        reset_url: str,
        db_session: Optional[Session] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Send password reset email using template system
        
        Args:
            to_email: User email address
            username: Username
            reset_token: Password reset token (not used in template, kept for compatibility)
            reset_url: Full URL for password reset
            db_session: Database session for logging (optional)
            user_id: User ID for logging (optional)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        try:
            # Use template system
            html_content = render_template('password_reset', {
                'username': username,
                'reset_url': reset_url
            })
            
            # Generate plain text version
            body_text = f"""
איפוס סיסמה - TikTrack

שלום {username},

קיבלנו בקשה לאיפוס הסיסמה שלך במערכת TikTrack.

לחץ על הקישור הבא כדי לאפס את הסיסמה שלך:
{reset_url}

הקישור תקף ל-24 שעות בלבד.

אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם מהמייל הזה.

זהו מייל אוטומטי, אנא אל תשיב למייל זה.
            """
            
            subject = "איפוס סיסמה - TikTrack"
            
            return self.send_email(
                to_email, 
                subject, 
                html_content, 
                body_text,
                db_session=db_session,
                email_type='password_reset',
                user_id=user_id
            )
            
        except Exception as e:
            logger.error(f"Error generating password reset email: {e}", exc_info=True, extra={
                'recipient': to_email,
                'username': username
            })
            return {
                'success': False,
                'error': f'Failed to generate password reset email: {str(e)}'
            }

