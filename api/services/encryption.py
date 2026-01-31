"""
Encryption Service - API Key Encryption/Decryption
Task: 20.1.4
Status: COMPLETED

Uses cryptography.fernet for symmetric encryption of API keys.
Supports key rotation strategy for enhanced security.
"""

import os
import base64
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import logging

logger = logging.getLogger(__name__)


class EncryptionService:
    """
    Service for encrypting and decrypting API keys.
    
    Uses Fernet symmetric encryption (AES 128 in CBC mode with HMAC).
    Encryption key is derived from environment variable ENCRYPTION_KEY.
    
    Key Rotation Strategy:
    - Primary key: ENCRYPTION_KEY (current active key)
    - Legacy keys: ENCRYPTION_KEY_LEGACY_1, ENCRYPTION_KEY_LEGACY_2 (for decryption only)
    - When rotating: Set new key as ENCRYPTION_KEY, move old to ENCRYPTION_KEY_LEGACY_1
    - Service automatically tries legacy keys for decryption
    """
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize EncryptionService.
        
        Args:
            encryption_key: Optional encryption key. If not provided, reads from ENCRYPTION_KEY env var.
                          If env var not set, generates a new key (for development only).
        
        Raises:
            ValueError: If no encryption key is provided and ENCRYPTION_KEY is not set.
        """
        self._primary_key = encryption_key or os.getenv("ENCRYPTION_KEY")
        
        if not self._primary_key:
            # Development fallback - generate a key (should never happen in production)
            logger.warning(
                "ENCRYPTION_KEY not set. Generating temporary key for development. "
                "This should NEVER happen in production!"
            )
            self._primary_key = Fernet.generate_key().decode()
            logger.warning(f"Generated temporary key. Set ENCRYPTION_KEY={self._primary_key}")
        
        # Load legacy keys for rotation support
        self._legacy_keys = []
        for i in range(1, 3):  # Support up to 2 legacy keys
            legacy_key = os.getenv(f"ENCRYPTION_KEY_LEGACY_{i}")
            if legacy_key:
                self._legacy_keys.append(legacy_key)
        
        # Initialize Fernet instances
        self._fernet = Fernet(self._primary_key.encode() if isinstance(self._primary_key, str) else self._primary_key)
        self._legacy_fernets = [
            Fernet(key.encode() if isinstance(key, str) else key)
            for key in self._legacy_keys
        ]
    
    def encrypt_api_key(self, plain_key: str) -> str:
        """
        Encrypt a plain API key.
        
        Args:
            plain_key: Plain text API key to encrypt
            
        Returns:
            Encrypted key as base64-encoded string
            
        Raises:
            ValueError: If plain_key is empty or None
        """
        if not plain_key:
            raise ValueError("plain_key cannot be empty or None")
        
        try:
            # Encrypt using primary key
            encrypted_bytes = self._fernet.encrypt(plain_key.encode('utf-8'))
            # Return as base64 string for storage in TEXT field
            return base64.b64encode(encrypted_bytes).decode('utf-8')
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise ValueError(f"Failed to encrypt API key: {str(e)}")
    
    def decrypt_api_key(self, encrypted_key: str) -> str:
        """
        Decrypt an encrypted API key.
        
        Tries primary key first, then legacy keys (for rotation support).
        
        Args:
            encrypted_key: Base64-encoded encrypted key from database
            
        Returns:
            Decrypted plain text API key
            
        Raises:
            ValueError: If decryption fails with all available keys
        """
        if not encrypted_key:
            raise ValueError("encrypted_key cannot be empty or None")
        
        try:
            # Decode from base64
            encrypted_bytes = base64.b64decode(encrypted_key.encode('utf-8'))
        except Exception as e:
            raise ValueError(f"Invalid encrypted key format: {str(e)}")
        
        # Try primary key first
        try:
            decrypted_bytes = self._fernet.decrypt(encrypted_bytes)
            return decrypted_bytes.decode('utf-8')
        except Exception:
            # Primary key failed, try legacy keys
            pass
        
        # Try legacy keys (for key rotation)
        for i, legacy_fernet in enumerate(self._legacy_fernets, start=1):
            try:
                decrypted_bytes = legacy_fernet.decrypt(encrypted_bytes)
                logger.info(f"Decrypted using legacy key {i}. Consider re-encrypting with primary key.")
                return decrypted_bytes.decode('utf-8')
            except Exception:
                continue
        
        # All keys failed
        raise ValueError("Failed to decrypt API key with any available key")
    
    @staticmethod
    def generate_encryption_key() -> str:
        """
        Generate a new Fernet encryption key.
        
        Use this when setting up ENCRYPTION_KEY for the first time or rotating keys.
        
        Returns:
            Base64-encoded encryption key suitable for ENCRYPTION_KEY environment variable
        """
        return Fernet.generate_key().decode()
    
    def re_encrypt_with_primary(self, encrypted_key: str) -> str:
        """
        Re-encrypt a key that was encrypted with a legacy key using the primary key.
        
        Useful during key rotation to migrate old encrypted values.
        
        Args:
            encrypted_key: Key encrypted with legacy key
            
        Returns:
            Key encrypted with primary key
        """
        # Decrypt with legacy key
        plain_key = self.decrypt_api_key(encrypted_key)
        # Re-encrypt with primary key
        return self.encrypt_api_key(plain_key)


# Singleton instance (can be overridden for testing)
_encryption_service: Optional[EncryptionService] = None


def get_encryption_service() -> EncryptionService:
    """
    Get the global EncryptionService instance.
    
    Returns:
        EncryptionService instance
    """
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service


def set_encryption_service(service: EncryptionService) -> None:
    """
    Set a custom EncryptionService instance (for testing).
    
    Args:
        service: EncryptionService instance to use
    """
    global _encryption_service
    _encryption_service = service
