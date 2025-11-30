"""
API Key Encryption Service
Service for encrypting/decrypting LLM API keys
"""

import logging
import os
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64

logger = logging.getLogger(__name__)


class APIKeyEncryptionService:
    """
    Service for encrypting/decrypting API keys
    """
    
    def __init__(self):
        # Get encryption key from environment or generate default
        encryption_key = os.getenv('TIKTRACK_LLM_ENCRYPTION_KEY')
        if not encryption_key:
            # Default key for development (should be changed in production)
            default_key = b'TikTrackLLMEncryptionKey2025!SecureKey32Bytes'
            # Convert to Fernet-compatible key
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'tiktrack_llm_salt',
                iterations=100000,
                backend=default_backend()
            )
            key = base64.urlsafe_b64encode(kdf.derive(default_key))
            self._fernet = Fernet(key)
            logger.warning("Using default LLM encryption key. Set TIKTRACK_LLM_ENCRYPTION_KEY in production!")
        else:
            # Use provided key (should be base64-encoded)
            try:
                key = encryption_key.encode() if isinstance(encryption_key, str) else encryption_key
                self._fernet = Fernet(key)
            except Exception as e:
                logger.error(f"Invalid encryption key format: {e}")
                raise ValueError(f"Invalid encryption key: {e}")
    
    def encrypt_api_key(self, api_key: str) -> str:
        """
        Encrypt API key using Fernet encryption
        
        Args:
            api_key: Plain text API key
            
        Returns:
            str: Encrypted API key (base64-encoded)
        """
        if not api_key:
            return ''
        try:
            encrypted = self._fernet.encrypt(api_key.encode('utf-8'))
            return encrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"Error encrypting API key: {e}")
            raise
    
    def decrypt_api_key(self, encrypted_api_key: str) -> str:
        """
        Decrypt API key
        
        Args:
            encrypted_api_key: Encrypted API key string
            
        Returns:
            str: Decrypted API key
        """
        if not encrypted_api_key:
            return ''
        try:
            decrypted = self._fernet.decrypt(encrypted_api_key.encode('utf-8'))
            return decrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"Error decrypting API key: {e}")
            raise

