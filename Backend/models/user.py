from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class User(BaseModel):
    """
    User model - represents a user in the system
    
    Attributes:
        username (str): Unique username
        email (str): User email address
        first_name (str): User first name
        last_name (str): User last name
        is_active (bool): Whether user is active
        is_default (bool): Whether this is the default user
        preferences (str): JSON string with user preferences
        
    Relationships:
        accounts: List of accounts owned by this user
        trades: List of trades created by this user
        alerts: List of alerts created by this user
        
    Constraints:
        - username must be unique
        - email must be unique
        - is_default must be unique (only one default user)
        
    Example:
        >>> user = User(
        ...     username="nimrod",
        ...     email="nimrod@example.com",
        ...     first_name="Nimrod",
        ...     last_name="User",
        ...     is_default=True
        ... )
    """
    __tablename__ = "users"
    
    # Primary fields
    username = Column(String(50), unique=True, nullable=False, 
                     comment="Unique username")
    email = Column(String(100), unique=True, nullable=True, 
                  comment="User email address")
    first_name = Column(String(50), nullable=False, 
                       comment="User first name")
    last_name = Column(String(50), nullable=False, 
                      comment="User last name")
    is_active = Column(Boolean, default=True, nullable=False,
                      comment="Whether user is active")
    is_default = Column(Boolean, default=False, nullable=False,
                       comment="Whether this is the default user")
    preferences = Column(Text, nullable=True,
                        comment="JSON string with user preferences")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)
    
    # Relationships - will be added when we implement user system in next phase
    # accounts = relationship("Account", back_populates="user")
    # trades = relationship("Trade", back_populates="user")
    # alerts = relationship("Alert", back_populates="user")
    # notes = relationship("Note", back_populates="user")
    
    def __repr__(self) -> str:
        """String representation of the user"""
        return f"<User(username='{self.username}', name='{self.first_name} {self.last_name}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert user to JSON dictionary
        
        Returns:
            Dict[str, Any]: Dictionary with all user fields
            
        Example:
            >>> user = User(username="nimrod", first_name="Nimrod")
            >>> user.to_dict()
            {'id': 1, 'username': 'nimrod', 'first_name': 'Nimrod', ...}
        """
        # Call parent to_dict method first
        result = super().to_dict()
        
        # Add any user-specific formatting if needed
        return result
    
    @property
    def full_name(self) -> str:
        """
        Full name of the user
        
        Returns:
            str: Full name in format "First Last"
            
        Example:
            >>> user = User(first_name="Nimrod", last_name="User")
            >>> user.full_name
            'Nimrod User'
        """
        return f"{self.first_name} {self.last_name}"
    
    @property
    def display_name(self) -> str:
        """
        Display name of the user - username or full name
        
        Returns:
            str: Display name
            
        Example:
            >>> user = User(username="nimrod", first_name="Nimrod")
            >>> user.display_name
            'nimrod'
        """
        return self.username
    
    def get_preferences(self) -> Dict[str, Any]:
        """
        Get user preferences as dictionary
        
        Returns:
            Dict[str, Any]: User preferences
            
        Example:
            >>> user = User(preferences='{"theme": "dark"}')
            >>> user.get_preferences()
            {'theme': 'dark'}
        """
        if not self.preferences:
            return {}
        
        try:
            import json
            return json.loads(self.preferences)
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_preferences(self, preferences: Dict[str, Any]) -> None:
        """
        Set user preferences from dictionary
        
        Args:
            preferences (Dict[str, Any]): User preferences
            
        Example:
            >>> user = User()
            >>> user.set_preferences({'theme': 'dark'})
        """
        import json
        self.preferences = json.dumps(preferences, ensure_ascii=False)
        self.updated_at = datetime.utcnow()
    

