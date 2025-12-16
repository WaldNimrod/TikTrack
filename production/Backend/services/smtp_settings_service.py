"""
SMTP Settings Service - TikTrack
שירות ניהול הגדרות SMTP

This service manages SMTP settings in SystemSettings with password encryption.

Function Index:
==============
SETTINGS MANAGEMENT:
- get_smtp_settings(db_session) - Get all SMTP settings
- update_smtp_settings(db_session, settings, updated_by) - Update SMTP settings
- validate_smtp_settings(settings) - Validate SMTP settings

PASSWORD ENCRYPTION:
- encrypt_password(password) - Encrypt password using Fernet
- decrypt_password(encrypted_password) - Decrypt password (for testing only)

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import logging
import os
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64

from services.system_settings_service import SystemSettingsService

logger = logging.getLogger(__name__)


class SMTPSettingsService:
    """
    Service for managing SMTP settings with password encryption
    """
    
    def __init__(self):
        # Get encryption key from environment or generate default
        # In production, this should be set via environment variable
        encryption_key = os.getenv('TIKTRACK_SMTP_ENCRYPTION_KEY')
        if not encryption_key:
            # Default key for development (should be changed in production)
            # This is a base64-encoded 32-byte key
            default_key = b'TikTrackSMTPEncryptionKey2025!SecureKey32Bytes'
            # Convert to Fernet-compatible key
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'tiktrack_smtp_salt',
                iterations=100000,
                backend=default_backend()
            )
            key = base64.urlsafe_b64encode(kdf.derive(default_key))
            self._fernet = Fernet(key)
            logger.warning("Using default SMTP encryption key. Set TIKTRACK_SMTP_ENCRYPTION_KEY in production!")
        else:
            # Use provided key (should be base64-encoded)
            try:
                key = encryption_key.encode() if isinstance(encryption_key, str) else encryption_key
                self._fernet = Fernet(key)
            except Exception as e:
                logger.error(f"Invalid encryption key format: {e}")
                raise ValueError(f"Invalid encryption key: {e}")
    
    def encrypt_password(self, password: str) -> str:
        """
        Encrypt password using Fernet encryption
        
        Args:
            password: Plain text password
            
        Returns:
            str: Encrypted password (base64-encoded)
        """
        if not password:
            return ''
        try:
            encrypted = self._fernet.encrypt(password.encode('utf-8'))
            return encrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"Error encrypting password: {e}")
            raise
    
    def decrypt_password(self, encrypted_password: str) -> str:
        """
        Decrypt password (for testing/validation only)
        
        Args:
            encrypted_password: Encrypted password string
            
        Returns:
            str: Decrypted password
            
        Warning:
            This method should only be used for testing or validation.
            Never log or expose decrypted passwords.
        """
        if not encrypted_password:
            return ''
        try:
            decrypted = self._fernet.decrypt(encrypted_password.encode('utf-8'))
            return decrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"Error decrypting password: {e}")
            raise
    
    def get_smtp_settings(self, db_session: Session) -> Dict[str, Any]:
        """
        Get all SMTP settings from SystemSettings
        
        Args:
            db_session: Database session
            
        Returns:
            Dict with all SMTP settings (password is encrypted)
        """
        try:
            settings_service = SystemSettingsService(db_session)
            settings = settings_service.get_group_settings('smtp_settings')
            
            # Password is stored encrypted, return as-is
            # Decryption happens only when needed (in EmailService)
            return settings
        except Exception as e:
            logger.error(f"Error getting SMTP settings: {e}", exc_info=True)
            return {}
    
    def update_smtp_settings(
        self,
        db_session: Session,
        settings: Dict[str, Any],
        updated_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update SMTP settings in SystemSettings
        
        Args:
            db_session: Database session
            settings: Dict with settings to update
            updated_by: User who updated the settings (optional)
            
        Returns:
            Dict with 'success' (bool) and 'message' (str) or 'error' (str)
        """
        try:
            settings_service = SystemSettingsService(db_session)
            
            # Encrypt password if provided
            if 'smtp_password' in settings and settings['smtp_password']:
                # Only encrypt if it's not already encrypted (doesn't start with 'gAAAAAB')
                password = settings['smtp_password']
                if not password.startswith('gAAAAAB'):
                    settings['smtp_password'] = self.encrypt_password(password)
            
            # Update each setting
            updated_count = 0
            for key, value in settings.items():
                if value is not None:  # Only update non-None values
                    success = settings_service.set_setting(key, value, updated_by=updated_by)
                    if success:
                        updated_count += 1
                        logger.debug(f"Updated SMTP setting: {key}")
                    else:
                        logger.warning(f"Failed to update SMTP setting: {key}")
            
            if updated_count > 0:
                logger.info(f"Updated {updated_count} SMTP settings", extra={
                    'updated_by': updated_by,
                    'settings_updated': list(settings.keys())
                })
                return {
                    'success': True,
                    'message': f'Updated {updated_count} SMTP settings'
                }
            else:
                return {
                    'success': False,
                    'error': 'No settings were updated'
                }
                
        except Exception as e:
            logger.error(f"Error updating SMTP settings: {e}", exc_info=True)
            return {
                'success': False,
                'error': f'Failed to update SMTP settings: {str(e)}'
            }
    
    def validate_smtp_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate SMTP settings
        
        Args:
            settings: Dict with SMTP settings to validate
            
        Returns:
            Dict with 'valid' (bool) and 'errors' (list) if invalid
        """
        errors = []
        
        # Validate host
        if 'smtp_host' in settings:
            host = settings.get('smtp_host', '').strip()
            if not host:
                errors.append("SMTP host is required")
        
        # Validate port
        if 'smtp_port' in settings:
            try:
                port = int(settings.get('smtp_port', 0))
                if port < 1 or port > 65535:
                    errors.append("SMTP port must be between 1 and 65535")
            except (ValueError, TypeError):
                errors.append("SMTP port must be a valid integer")
        
        # Validate user
        if 'smtp_user' in settings:
            user = settings.get('smtp_user', '').strip()
            if not user:
                errors.append("SMTP user is required")
        
        # Validate from_email
        if 'smtp_from_email' in settings:
            from_email = settings.get('smtp_from_email', '').strip()
            if from_email and '@' not in from_email:
                errors.append("From email must be a valid email address")
        
        # Validate from_name
        if 'smtp_from_name' in settings:
            from_name = settings.get('smtp_from_name', '').strip()
            if not from_name:
                errors.append("From name is required")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }

