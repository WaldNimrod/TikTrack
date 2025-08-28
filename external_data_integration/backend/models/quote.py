"""
Quote Model - External Data Integration
Handles market price data from external providers
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base


class Quote(Base):
    """Quote model for storing market price data"""
    __tablename__ = 'quotes_last'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    price = Column(Numeric(10, 4), nullable=False)
    change_amount = Column(Numeric(10, 4))
    change_percent = Column(Numeric(5, 2))
    volume = Column(Integer)  # Using INTEGER instead of BIGINT for SQLite
    high_24h = Column(Numeric(10, 4))
    low_24h = Column(Numeric(10, 4))
    open_price = Column(Numeric(10, 4))
    previous_close = Column(Numeric(10, 4))
    provider = Column(String(50), nullable=False)
    asof_utc = Column(DateTime)  # UTC timestamp of the data
    fetched_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    last_updated = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    created_at = Column(DateTime, default=func.current_timestamp())

    # Relationships
    ticker = relationship("Ticker", back_populates="quotes")

    def __repr__(self):
        return f"<Quote(ticker_id={self.ticker_id}, price={self.price}, provider='{self.provider}')>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
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
        """Get the latest quote for a ticker"""
        return db_session.query(cls).filter(cls.ticker_id == ticker_id).first()

    @classmethod
    def update_quote(cls, db_session, ticker_id, price_data):
        """Update or create a quote for a ticker"""
        quote = cls.get_latest_quote(db_session, ticker_id)
        
        if quote:
            # Update existing quote
            for key, value in price_data.items():
                if hasattr(quote, key):
                    setattr(quote, key, value)
            quote.last_updated = func.current_timestamp()
        else:
            # Create new quote
            quote = cls(ticker_id=ticker_id, **price_data)
            db_session.add(quote)
        
        db_session.commit()
        return quote

    @classmethod
    def get_quote_history(cls, db_session, ticker_id, days=30):
        """Get quote history for a ticker (placeholder for future implementation)"""
        # This will be implemented when intraday_slots table is added
        return []

    @classmethod
    def delete_old_quotes(cls, db_session, days=90):
        """Delete quotes older than specified days (placeholder)"""
        # This will be implemented when we have historical data
        pass
