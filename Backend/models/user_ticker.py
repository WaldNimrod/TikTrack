from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any
from datetime import datetime

class UserTicker(BaseModel):
    """
    UserTicker model - junction table for many-to-many relationship between users and tickers
    
    This allows multiple users to share the same ticker while each user maintains
    their own list of tickers. The tickers table itself remains shared (no user_id).
    
    Attributes:
        user_id (int): Reference to the user
        ticker_id (int): Reference to the ticker
        created_at (datetime): When the ticker was added to user's list
        
    Relationships:
        user: The user who has this ticker
        ticker: The ticker in the user's list
        
    Constraints:
        - (user_id, ticker_id) must be unique (user can't have same ticker twice)
        
    Example:
        >>> user_ticker = UserTicker(
        ...     user_id=1,
        ...     ticker_id=5
        ... )
    """
    __tablename__ = "user_tickers"
    __table_args__ = (
        UniqueConstraint('user_id', 'ticker_id', name='uq_user_tickers_user_ticker'),
        {'extend_existing': True}
    )
    
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True,
                    comment="User who has this ticker in their list")
    ticker_id = Column(Integer, ForeignKey('tickers.id', ondelete='CASCADE'), nullable=False, index=True,
                     comment="Ticker in the user's list")
    name_custom = Column(String(100), nullable=True,
                        comment="Custom company name for this user")
    type_custom = Column(String(20), nullable=True,
                        comment="Custom asset type for this user")
    status = Column(String(20), default='open', nullable=False,
                   comment="User-ticker association status: open, closed, cancelled")
    # Note: created_at is inherited from BaseModel, but we override it here for timezone support
    # The server_default should work, but we'll set it explicitly in code to be safe
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False,
                       comment="When the ticker was added to user's list")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True,
                       comment="Last update timestamp")
    
    # Relationships
    user = relationship("User", backref="user_tickers")
    ticker = relationship("Ticker", backref="user_tickers")
    
    def __repr__(self) -> str:
        """String representation of the UserTicker"""
        return f"<UserTicker(user_id={self.user_id}, ticker_id={self.ticker_id}, status={self.status})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert UserTicker to JSON dictionary
        
        Returns:
            Dict[str, Any]: Dictionary with all UserTicker fields
            
        Example:
            >>> user_ticker = UserTicker(user_id=1, ticker_id=5)
            >>> user_ticker.to_dict()
            {'id': 1, 'user_id': 1, 'ticker_id': 5, 'created_at': '...'}
        """
        result = super().to_dict()
        
        # Add custom fields
        if hasattr(self, 'name_custom'):
            result['name_custom'] = self.name_custom
        if hasattr(self, 'type_custom'):
            result['type_custom'] = self.type_custom
        if hasattr(self, 'status'):
            result['status'] = self.status
        if hasattr(self, 'updated_at'):
            result['updated_at'] = self.updated_at
        
        # Add related data if available
        if hasattr(self, 'ticker') and self.ticker:
            result['ticker_symbol'] = self.ticker.symbol
            result['ticker_name'] = self.ticker.name
            # Add default name/type if custom not set
            if not result.get('name_custom') and self.ticker.name:
                result['name_custom'] = None  # Explicitly show it's not set
            if not result.get('type_custom') and self.ticker.type:
                result['type_custom'] = None  # Explicitly show it's not set
        if hasattr(self, 'user') and self.user:
            result['username'] = self.user.username
        
        return result

