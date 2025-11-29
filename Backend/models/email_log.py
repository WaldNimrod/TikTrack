"""
Email Log Model - TikTrack
מודל לוגים של מיילים

This model stores logs of all email sending attempts for monitoring and debugging.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime


class EmailLog(BaseModel):
    """
    Email log model - stores logs of email sending attempts
    
    Attributes:
        recipient (str): Recipient email address
        subject (str): Email subject
        status (str): Status of email sending (success, failed, pending)
        sent_at (datetime): Timestamp when email was sent (or attempted)
        error_message (str): Error message if sending failed
        email_type (str): Type of email (password_reset, system_notification, etc.)
        user_id (int): ID of user who triggered the email (optional)
        
    Relationships:
        user: User who triggered the email (optional)
        
    Example:
        >>> email_log = EmailLog(
        ...     recipient="user@example.com",
        ...     subject="איפוס סיסמה - TikTrack",
        ...     status="success",
        ...     email_type="password_reset",
        ...     user_id=1
        ... )
    """
    __tablename__ = "email_logs"
    
    recipient = Column(String(255), nullable=False, index=True,
                      comment="Recipient email address")
    subject = Column(String(255), nullable=False,
                    comment="Email subject")
    status = Column(String(50), nullable=False, index=True,
                   comment="Status: success, failed, pending")
    sent_at = Column(DateTime, server_default=func.now(), nullable=False,
                    comment="Timestamp when email was sent")
    error_message = Column(Text, nullable=True,
                          comment="Error message if sending failed")
    email_type = Column(String(100), nullable=True, index=True,
                       comment="Type of email (password_reset, system_notification, etc.)")
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True,
                    comment="ID of user who triggered the email")
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary
        
        Returns:
            Dict with all fields
        """
        result = super().to_dict()
        # Convert datetime to ISO format string
        if result.get('sent_at') and isinstance(result['sent_at'], datetime):
            result['sent_at'] = result['sent_at'].isoformat()
        if result.get('created_at') and isinstance(result['created_at'], datetime):
            result['created_at'] = result['created_at'].isoformat()
        return result
    
    def __repr__(self) -> str:
        return f"<EmailLog(id={self.id}, recipient='{self.recipient}', status='{self.status}', sent_at={self.sent_at})>"

