"""
Quotes Last Model - Last known quote per ticker

This model represents the last known quote for each ticker, providing
a quick lookup table for the most recent price data without querying
the full market_data_quotes history.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-11-16
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Index, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel


class QuotesLast(BaseModel):
    """
    Last known quote per ticker - denormalized cache table
    
    This table maintains the most recent quote for each ticker,
    providing fast access to current prices without querying
    the full market_data_quotes history.
    
    Attributes:
        ticker_id: Reference to ticker
        price: Last known price
        change_amount: Change amount from previous close
        change_percent: Change percentage from previous close
        volume: Trading volume
        high_24h: 24-hour high
        low_24h: 24-hour low
        open_price: Opening price
        previous_close: Previous close price
        provider: Data provider name
        asof_utc: When the quote was valid (UTC)
        fetched_at: When we fetched the quote
        last_updated: Last update timestamp
        source: Data source identifier
        currency: Currency code
        is_stale: Whether data is stale
        quality_score: Data quality score (0-1)
    """
    __tablename__ = 'quotes_last'
    
    # Core reference
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False, unique=True)
    
    # Price data
    price = Column(Numeric(10, 4), nullable=False)
    change_amount = Column(Numeric(10, 4), nullable=True)
    change_percent = Column(Numeric(5, 2), nullable=True)
    volume = Column(Integer, nullable=True)
    
    # 24-hour data
    high_24h = Column(Numeric(10, 4), nullable=True)
    low_24h = Column(Numeric(10, 4), nullable=True)
    open_price = Column(Numeric(10, 4), nullable=True)
    previous_close = Column(Numeric(10, 4), nullable=True)
    
    # Provider and source
    provider = Column(String(50), nullable=False)
    source = Column(String(50), nullable=True)
    
    # Timestamps
    asof_utc = Column(DateTime(timezone=True), nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Metadata
    currency = Column(String(10), default='USD', nullable=False)
    is_stale = Column(Boolean, default=False)
    quality_score = Column(Float, default=1.0)
    
    # Relationships
    ticker = relationship("Ticker", back_populates="last_quote")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_quotes_last_ticker_id', 'ticker_id'),
        Index('idx_quotes_last_asof_utc', 'asof_utc'),
        Index('idx_quotes_last_fetched_at', 'fetched_at'),
        Index('idx_quotes_last_provider', 'provider'),
        Index('idx_quotes_last_stale', 'is_stale'),
    )
    
    def __repr__(self):
        return f"<QuotesLast(ticker_id={self.ticker_id}, price={self.price}, provider='{self.provider}')>"

