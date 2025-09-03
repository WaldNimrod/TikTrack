"""
Ticker Model - External Data Integration
Ticker model for market symbols and instruments.

This model represents financial instruments (stocks, currencies, commodities)
that can be tracked for market data. Each ticker has a unique symbol and
can be associated with multiple price quotes over time.

Key Features:
- Unique symbol identification
- Status tracking (active/inactive/watch)
- Active trades tracking
- Relationship with price quotes
- Timestamp tracking for auditing

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class Ticker(Base):
    """
    Ticker model for market symbols and financial instruments.
    
    This model represents any financial instrument that can be tracked
    for market data, including stocks, currencies, commodities, and ETFs.
    
    Attributes:
        id: Primary key for the ticker
        symbol: Unique symbol identifier (e.g., 'AAPL', 'USD/EUR')
        name: Human-readable name of the instrument
        status: Current status (active, inactive, watch)
        active_trades: Whether this ticker has active trades (0/1 for SQLite)
        created_at: Timestamp when the ticker was created
        updated_at: Timestamp when the ticker was last updated
        quotes: Relationship to price quotes for this ticker
    """
    __tablename__ = 'tickers'

    # Primary key - auto-incrementing integer
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Symbol must be unique and not null (e.g., 'AAPL', 'GOOGL', 'USD/EUR')
    symbol = Column(String(10), nullable=False, unique=True)
    
    # Human-readable name (e.g., 'Apple Inc.', 'Alphabet Inc.', 'US Dollar/Euro')
    name = Column(String(100))
    
    # Status: 'active' (tracking), 'inactive' (not tracking), 'watch' (monitoring)
    status = Column(String(20), default='active')
    
    # Whether this ticker has active trades (0 = no, 1 = yes)
    # Using Integer instead of Boolean for SQLite compatibility
    active_trades = Column(Integer, default=0)
    
    # Timestamps for auditing and tracking changes
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relationships - one ticker can have many quotes
    quotes = relationship("Quote", back_populates="ticker")

    def __repr__(self):
        """
        String representation of the ticker for debugging and logging.
        
        Returns:
            str: Human-readable representation of the ticker
        """
        return f"<Ticker(symbol='{self.symbol}', name='{self.name}', status='{self.status}')>"

    def to_dict(self):
        """
        Convert ticker object to dictionary for API responses.
        
        This method serializes the ticker object into a format suitable
        for JSON API responses, handling data type conversions and
        timestamp formatting.
        
        Returns:
            dict: Dictionary representation of the ticker
        """
        return {
            'id': self.id,
            'symbol': self.symbol,
            'name': self.name,
            'status': self.status,
            'active_trades': bool(self.active_trades),  # Convert 0/1 to True/False
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def get_by_symbol(cls, db_session, symbol: str):
        """
        Get ticker by its symbol.
        
        Args:
            db_session: Database session for querying
            symbol (str): The ticker symbol to search for
            
        Returns:
            Ticker or None: The ticker object if found, None otherwise
        """
        return db_session.query(cls).filter(cls.symbol == symbol).first()

    @classmethod
    def get_active_tickers(cls, db_session):
        """
        Get all tickers with 'active' status.
        
        This method is commonly used to get all tickers that should
        be actively monitored for price updates.
        
        Args:
            db_session: Database session for querying
            
        Returns:
            list: List of active ticker objects
        """
        return db_session.query(cls).filter(cls.status == 'active').all()

    @classmethod
    def get_tickers_with_active_trades(cls, db_session):
        """
        Get tickers that have active trades.
        
        This method is used to prioritize tickers that have ongoing
        trades for more frequent price updates.
        
        Args:
            db_session: Database session for querying
            
        Returns:
            list: List of ticker objects with active trades
        """
        return db_session.query(cls).filter(cls.active_trades == 1).all()
