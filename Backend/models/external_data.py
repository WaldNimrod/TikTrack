"""
External Data Integration Models
Models for external data providers, market data, and user preferences
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel


class ExternalDataProvider(BaseModel):
    """External data provider configuration and status"""
    __tablename__ = 'external_data_providers'
    name = Column(String(50), nullable=False, unique=True)  # 'yahoo_finance', 'google_finance'
    display_name = Column(String(100), nullable=False)      # 'Yahoo Finance', 'Google Finance'
    is_active = Column(Boolean, default=True, nullable=False)
    provider_type = Column(String(50), nullable=False)      # 'finance', 'news', 'economic'
    
    # Configuration
    api_key = Column(String(255), nullable=True)            # API key if required
    base_url = Column(String(255), nullable=False)          # Base API URL
    rate_limit_per_hour = Column(Integer, default=900)      # Rate limit per hour
    timeout_seconds = Column(Integer, default=20)           # Request timeout
    retry_attempts = Column(Integer, default=2)             # Retry attempts on failure
    
    # Cache settings
    cache_ttl_hot = Column(Integer, default=60)             # Hot cache TTL in seconds
    cache_ttl_warm = Column(Integer, default=300)           # Warm cache TTL in seconds
    
    # Batching settings
    max_symbols_per_batch = Column(Integer, default=50)     # Max symbols per batch
    preferred_batch_size = Column(Integer, default=25)      # Preferred batch size
    
    # Status tracking
    last_successful_request = Column(DateTime(timezone=True), nullable=True)
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, default=0)
    is_healthy = Column(Boolean, default=True)
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    quotes = relationship("MarketDataQuote", back_populates="provider")
    refresh_logs = relationship("DataRefreshLog", back_populates="provider")
    
    def __repr__(self):
        return f"<ExternalDataProvider(name='{self.name}', is_active={self.is_active})>"


class MarketDataQuote(BaseModel):
    """Market data quotes from external providers"""
    __tablename__ = 'market_data_quotes'
    
    # Core data
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    provider_id = Column(Integer, ForeignKey('external_data_providers.id'), nullable=False)
    
    # Quote data (UTC timestamps)
    asof_utc = Column(DateTime(timezone=True), nullable=False)      # When the quote was valid
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())  # When we fetched it
    
    # Price data
    price = Column(Float, nullable=False)                           # Current price
    change_pct_day = Column(Float, nullable=True)                   # Daily change percentage
    change_amount_day = Column(Float, nullable=True)                # Daily change amount
    volume = Column(Integer, nullable=True)                         # Trading volume
    
    # Open price data (from market open)
    open_price = Column(Float, nullable=True)                      # Daily open price
    change_pct_from_open = Column(Float, nullable=True)             # Change percentage from open
    change_amount_from_open = Column(Float, nullable=True)         # Change amount from open
    
    # Additional data
    currency = Column(String(10), nullable=False, default='USD')    # Currency code
    source = Column(String(50), nullable=False)                     # Data source identifier
    
    # Metadata
    is_stale = Column(Boolean, default=False)                       # Marked as stale data
    quality_score = Column(Float, default=1.0)                      # Data quality score (0-1)
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    ticker = relationship("Ticker", back_populates="market_quotes")
    provider = relationship("ExternalDataProvider", back_populates="quotes")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_market_data_quotes_ticker_provider', 'ticker_id', 'provider_id'),
        Index('idx_market_data_quotes_asof_utc', 'asof_utc'),
        Index('idx_market_data_quotes_fetched_at', 'fetched_at'),
        Index('idx_market_data_quotes_stale', 'is_stale'),
    )
    
    def __repr__(self):
        return f"<MarketDataQuote(ticker_id={self.ticker_id}, price={self.price}, asof_utc={self.asof_utc})>"


class DataRefreshLog(BaseModel):
    """Log of data refresh operations"""
    __tablename__ = 'data_refresh_logs'
    
    # Operation details
    provider_id = Column(Integer, ForeignKey('external_data_providers.id'), nullable=True)  # Made nullable for group operations
    operation_type = Column(String(50), nullable=False)             # 'batch_fetch', 'single_fetch', 'cache_refresh'
    
    # Group refresh tracking (new fields)
    category = Column(String(50), nullable=True)                    # 'active_trades', 'no_active_trades', 'closed'
    time_period = Column(String(50), nullable=True)                 # 'in_hours', 'off_hours'
    ticker_count = Column(Integer, nullable=True)                   # Number of tickers in group
    successful_count = Column(Integer, nullable=True)               # Number of successful refreshes
    failed_count = Column(Integer, nullable=True)                   # Number of failed refreshes
    message = Column(Text, nullable=True)                           # Additional message
    
    # Request details
    symbols_requested = Column(Integer, nullable=False)             # Number of symbols requested
    symbols_successful = Column(Integer, nullable=False)            # Number of symbols successfully fetched
    symbols_failed = Column(Integer, nullable=False)                # Number of symbols that failed
    
    # Performance metrics
    start_time = Column(DateTime(timezone=True), nullable=False)    # When operation started
    end_time = Column(DateTime(timezone=True), nullable=True)       # When operation completed
    total_duration_ms = Column(Integer, nullable=True)              # Total duration in milliseconds
    
    # Status and errors
    status = Column(String(20), nullable=False)                     # 'success', 'partial_success', 'failed'
    error_message = Column(Text, nullable=True)                     # Error message if failed
    error_code = Column(String(50), nullable=True)                  # Error code if applicable
    
    # Rate limiting info
    rate_limit_remaining = Column(Integer, nullable=True)           # Remaining rate limit after operation
    rate_limit_reset_time = Column(DateTime(timezone=True), nullable=True)  # When rate limit resets
    
    # Cache info
    cache_hit_count = Column(Integer, default=0)                    # Number of cache hits
    cache_miss_count = Column(Integer, default=0)                   # Number of cache misses
    
    # Relationships
    provider = relationship("ExternalDataProvider", back_populates="refresh_logs")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_data_refresh_logs_provider', 'provider_id'),
        Index('idx_data_refresh_logs_operation_type', 'operation_type'),
        Index('idx_data_refresh_logs_status', 'status'),
        Index('idx_data_refresh_logs_start_time', 'start_time'),
    )
    
    def __repr__(self):
        return f"<DataRefreshLog(provider_id={self.provider_id}, operation_type='{self.operation_type}', status='{self.status}')>"


class IntradayDataSlot(BaseModel):
    """Intraday data aggregation slots (optional for Stage-1)"""
    __tablename__ = 'intraday_data_slots'
    
    # Slot identification
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    provider_id = Column(Integer, ForeignKey('external_data_providers.id'), nullable=False)
    slot_start_utc = Column(DateTime(timezone=True), nullable=False)  # Start of time slot (UTC)
    
    # Aggregated data
    open_price = Column(Float, nullable=False)                      # Opening price for slot
    high_price = Column(Float, nullable=False)                      # Highest price in slot
    low_price = Column(Float, nullable=False)                       # Lowest price in slot
    close_price = Column(Float, nullable=False)                     # Closing price for slot
    volume = Column(Integer, nullable=False)                        # Total volume for slot
    
    # Slot metadata
    slot_duration_minutes = Column(Integer, nullable=False)          # Duration of slot in minutes
    is_complete = Column(Boolean, default=False)                    # Whether slot data is complete
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    ticker = relationship("Ticker", back_populates="intraday_slots")
    provider = relationship("ExternalDataProvider")
    
    # Unique constraint
    __table_args__ = (
        Index('idx_intraday_data_slots_ticker_provider_slot', 'ticker_id', 'provider_id', 'slot_start_utc', unique=True),
        Index('idx_intraday_data_slots_slot_start_utc', 'slot_start_utc'),
    )
    
    def __repr__(self):
        return f"<IntradayDataSlot(ticker_id={self.ticker_id}, slot_start_utc={self.slot_start_utc})>"
