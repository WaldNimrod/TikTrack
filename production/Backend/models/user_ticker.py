from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
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
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False,
                       comment="When the ticker was added to user's list")
    
    # Relationships
    user = relationship("User", backref="user_tickers")
    ticker = relationship("Ticker", backref="user_tickers")
    
    def __repr__(self) -> str:
        """String representation of the UserTicker"""
        return f"<UserTicker(user_id={self.user_id}, ticker_id={self.ticker_id})>"
    
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
        
        # Add related data if available
        if hasattr(self, 'ticker') and self.ticker:
            result['ticker_symbol'] = self.ticker.symbol
            result['ticker_name'] = self.ticker.name
        if hasattr(self, 'user') and self.user:
            result['username'] = self.user.username
        
        return result

