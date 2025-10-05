"""
Quote Model - External Data Integration
SQLAlchemy model for storing market quotes and price data.

This model represents the latest price information for financial instruments
(tickers). It stores comprehensive market data including price, volume,
high/low values, and change information. Each quote is associated with
a specific ticker and data provider.

Key Features:
- Latest price tracking for each ticker
- Comprehensive market data (price, volume, high/low)
- Change tracking (amount and percentage)
- Provider attribution for data source tracking
- Timestamp tracking for data freshness
- Relationship with ticker model

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class Quote(Base):
    """
    Quote model for market data and price information.
    
    This model stores the most recent price and market data for each
    financial instrument. It maintains a one-to-many relationship with
    tickers, where each ticker can have multiple quotes over time.
    
    Attributes:
        id: Primary key for the quote
        ticker_id: Foreign key to the associated ticker
        price: Current market price (required)
        change_amount: Price change from previous close
        change_percent: Percentage change from previous close
        volume: Trading volume for the period
        high_24h: 24-hour high price
        low_24h: 24-hour low price
        open_price: Opening price for the period
        previous_close: Previous closing price
        provider: Data source provider (e.g., 'yahoo_finance')
        asof_utc: Timestamp when the data was valid (UTC)
        fetched_at: Timestamp when the data was retrieved
        last_updated: Timestamp when the record was last updated
        created_at: Timestamp when the record was created
        ticker: Relationship to the associated ticker
    """
    __tablename__ = 'quotes_last'

    # Primary key - auto-incrementing integer
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to the ticker this quote belongs to
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    
    # Current market price - this is the core data point
    price = Column(Numeric(10, 4), nullable=False)
    
    # Price change information
    change_amount = Column(Numeric(10, 4))  # Absolute change in price
    change_percent = Column(Numeric(5, 2))  # Percentage change
    
    # Volume information - using Integer for SQLite compatibility
    volume = Column(Integer)
    
    # Price range information
    high_24h = Column(Numeric(10, 4))  # 24-hour high
    low_24h = Column(Numeric(10, 4))   # 24-hour low
    open_price = Column(Numeric(10, 4))  # Opening price
    previous_close = Column(Numeric(10, 4))  # Previous closing price
    
    # Data source information
    provider = Column(String(50), nullable=False)  # e.g., 'yahoo_finance', 'alpha_vantage'
    
    # Timestamp information
    asof_utc = Column(DateTime)  # When the data was valid (provider timestamp)
    fetched_at = Column(DateTime, nullable=False, default=func.current_timestamp())  # When we retrieved it
    last_updated = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())  # When we last updated
    created_at = Column(DateTime, default=func.current_timestamp())  # When we first created

    # Relationships - each quote belongs to one ticker
    ticker = relationship("Ticker", back_populates="quotes")

    def __repr__(self):
        """
        String representation of the quote for debugging and logging.
        
        Returns:
            str: Human-readable representation of the quote
        """
        return f"<Quote(ticker_id={self.ticker_id}, price={self.price}, provider='{self.provider}')>"

    def to_dict(self):
        """
        Convert quote object to dictionary for API responses.
        
        This method serializes the quote object into a format suitable
        for JSON API responses, handling data type conversions and
        timestamp formatting.
        
        Returns:
            dict: Dictionary representation of the quote
        """
        return {
            'id': self.id,
            'ticker_id': self.ticker_id,
            'price': float(self.price) if self.price else None,
            'change_amount': float(self.change_amount) if self.change_amount else None,
            'change_percent': float(self.change_percent) if self.change_percent else None,
            'volume': self.volume,
            'high_24h': float(self.high_24h) if self.high_24h else None,
            'low_24h': float(self.low_24h) if self.low_24h else None,
            'open_price': float(self.open_price) if self.open_price else None,
            'previous_close': float(self.previous_close) if self.previous_close else None,
            'provider': self.provider,
            'asof_utc': self.asof_utc.isoformat() if self.asof_utc else None,
            'fetched_at': self.fetched_at.isoformat() if self.fetched_at else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def get_latest_quote(cls, db_session, ticker_id):
        """
        Get the latest quote for a specific ticker.
        
        This method retrieves the most recent price data for a given ticker.
        Since we store only the latest quote per ticker, this returns
        the current price information.
        
        Args:
            db_session: Database session for querying
            ticker_id (int): The ID of the ticker to get quote for
            
        Returns:
            Quote or None: The latest quote object if found, None otherwise
        """
        return db_session.query(cls).filter(cls.ticker_id == ticker_id).first()

    @classmethod
    def update_quote(cls, db_session, ticker_id, price_data):
        """
        Update or create a quote for a ticker.
        
        This method handles both creating new quotes and updating existing ones.
        It's the primary method for storing new price data from external providers.
        
        Args:
            db_session: Database session for database operations
            ticker_id (int): The ID of the ticker to update
            price_data (dict): Dictionary containing the new price data
            
        Returns:
            Quote: The updated or created quote object
        """
        quote = cls.get_latest_quote(db_session, ticker_id)
        
        if quote:
            # Update existing quote with new data
            for key, value in price_data.items():
                if hasattr(quote, key):
                    setattr(quote, key, value)
            quote.last_updated = func.current_timestamp()
        else:
            # Create new quote if none exists
            quote = cls(ticker_id=ticker_id, **price_data)
            db_session.add(quote)
        
        db_session.commit()
        return quote

    @classmethod
    def get_quote_history(cls, db_session, ticker_id, days=30):
        """
        Get quote history for a ticker (placeholder for future implementation).
        
        This method will be implemented when the intraday_slots table is added
        to store historical price data.
        
        Args:
            db_session: Database session for querying
            ticker_id (int): The ID of the ticker to get history for
            days (int): Number of days of history to retrieve
            
        Returns:
            list: Currently returns empty list, will be implemented in Stage-2
        """
        # This will be implemented when intraday_slots table is added
        return []

    @classmethod
    def delete_old_quotes(cls, db_session, days=90):
        """
        Delete quotes older than specified days (placeholder).
        
        This method will be implemented when we have historical data
        and need to clean up old records for performance.
        
        Args:
            db_session: Database session for database operations
            days (int): Age threshold for deletion (default: 90 days)
        """
        # This will be implemented when we have historical data
        pass
