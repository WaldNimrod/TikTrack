"""
Password Reset Token Model - TikTrack
מודל טוקן איפוס סיסמה

This model stores password reset tokens for users who request password reset.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any
from datetime import datetime, timedelta


class PasswordResetToken(BaseModel):
    """
    Password reset token model
    
    Stores temporary tokens for password reset requests.
    Tokens expire after 24 hours by default.
    
    Attributes:
        user_id (int): User ID who requested password reset
        token (str): Unique token string
        expires_at (datetime): Token expiration time
        used (bool): Whether token has been used
        created_at (datetime): Token creation time
        
    Relationships:
        user: User who owns this token
        
    Example:
        >>> token = PasswordResetToken(user_id=1, token="abc123")
        >>> token.is_valid()
        True
    """
    __tablename__ = "password_reset_tokens"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User ID who requested password reset")
    token = Column(String(255), unique=True, nullable=False, index=True,
                  comment="Unique reset token")
    expires_at = Column(DateTime, nullable=False,
                        comment="Token expiration time")
    used = Column(Boolean, default=False, nullable=False,
                 comment="Whether token has been used")
    created_at = Column(DateTime, default=datetime.utcnow,
                       comment="Token creation time")
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self) -> str:
        return f"<PasswordResetToken(user_id={self.user_id}, token='{self.token[:10]}...', expires_at={self.expires_at})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert token to dictionary"""
        result = super().to_dict()
        # Don't expose the full token in API responses
        if 'token' in result:
            result['token'] = result['token'][:10] + '...' if len(result['token']) > 10 else result['token']
        return result
    
    def is_valid(self) -> bool:
        """
        Check if token is valid (not used and not expired)
        
        Returns:
            bool: True if token is valid, False otherwise
        """
        if self.used:
            return False
        if datetime.utcnow() > self.expires_at:
            return False
        return True
    
    def mark_as_used(self):
        """Mark token as used"""
        self.used = True
        self.updated_at = datetime.utcnow()

