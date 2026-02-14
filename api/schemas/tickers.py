"""
Tickers Schemas - Pydantic Models
Task: Management - Tickers CRUD
Status: IN PROGRESS

Pydantic schemas for Tickers API. External IDs use ULID.
"""

from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


TICKER_TYPES = ("STOCK", "ETF", "OPTION", "FUTURE", "FOREX", "CRYPTO", "INDEX")


class TickerResponse(BaseModel):
    """Ticker response schema."""
    id: str = Field(..., description="External ULID identifier")
    symbol: str = Field(..., description="Ticker symbol (e.g., AAPL, BTC)")
    company_name: Optional[str] = Field(None, description="Company name")
    ticker_type: str = Field(..., description="Ticker type (STOCK, CRYPTO, ETF, etc.)")
    is_active: bool = Field(..., description="Active status")
    delisted_date: Optional[date] = Field(None, description="Delisting date")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    current_price: Optional[Decimal] = Field(None, description="Last known price from ticker_prices")
    daily_change_pct: Optional[Decimal] = Field(None, description="Daily change percentage")


class TickerCreateRequest(BaseModel):
    """Ticker create request schema."""
    symbol: str = Field(..., min_length=1, max_length=20, description="Ticker symbol")
    company_name: Optional[str] = Field(None, max_length=255, description="Company name")
    ticker_type: str = Field(default="STOCK", description="Ticker type")
    is_active: bool = Field(default=True, description="Active status")

    @field_validator("ticker_type")
    @classmethod
    def validate_ticker_type(cls, v: str) -> str:
        if v.upper() not in TICKER_TYPES:
            raise ValueError(f"ticker_type must be one of: {TICKER_TYPES}")
        return v.upper()


class TickerUpdateRequest(BaseModel):
    """Ticker update request schema."""
    symbol: Optional[str] = Field(None, min_length=1, max_length=20)
    company_name: Optional[str] = Field(None, max_length=255)
    ticker_type: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)

    @field_validator("ticker_type")
    @classmethod
    def validate_ticker_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if v.upper() not in TICKER_TYPES:
            raise ValueError(f"ticker_type must be one of: {TICKER_TYPES}")
        return v.upper()


class AddMyTickerRequest(BaseModel):
    """Request for POST /me/tickers — add existing (ticker_id) or create new (symbol)."""
    ticker_id: Optional[str] = Field(None, description="Existing ticker ULID (add to list)")
    symbol: Optional[str] = Field(None, min_length=1, max_length=20, description="Symbol for new ticker (creates + adds)")
    company_name: Optional[str] = Field(None, max_length=255)
    ticker_type: str = Field(default="STOCK", description="Ticker type for new ticker")

    @field_validator("ticker_type")
    @classmethod
    def validate_ticker_type(cls, v: str) -> str:
        if v.upper() not in TICKER_TYPES:
            raise ValueError(f"ticker_type must be one of: {TICKER_TYPES}")
        return v.upper()


class TickerListResponse(BaseModel):
    """Ticker list response schema."""
    data: List[TickerResponse]
    total: int


class TickerSummaryResponse(BaseModel):
    """Ticker summary for top section."""
    total_tickers: int
    active_tickers: int


# --- Ticker Data Integrity (בקרת תקינות נתונים) ---

class DataDomainOverview(BaseModel):
    """Overview of a single data domain (EOD, Intraday, History)."""
    row_count: int = Field(..., description="Number of rows in DB")
    latest_price_timestamp: Optional[datetime] = Field(None, description="Timestamp of latest price/as_of")
    latest_fetched_at: Optional[datetime] = Field(None, description="When the data was last fetched")
    has_data: bool = Field(..., description="Whether any data exists")
    gap_status: str = Field(..., description="OK | NO_DATA | INSUFFICIENT | STALE")
    note: Optional[str] = Field(None, description="Optional clarification")


class LastUpdateEntry(BaseModel):
    """Single entry in the update log."""
    price_timestamp: datetime = Field(..., description="Price as-of timestamp")
    fetched_at: datetime = Field(..., description="When fetched")
    price: Optional[Decimal] = Field(None, description="Price value")


class IndicatorsOverview(BaseModel):
    """Indicators from 250d OHLC — ATR, MA, CCI. Per MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC."""
    atr_14: Optional[Decimal] = Field(None, description="ATR(14)")
    ma_20: Optional[Decimal] = Field(None, description="MA(20)")
    ma_50: Optional[Decimal] = Field(None, description="MA(50)")
    ma_150: Optional[Decimal] = Field(None, description="MA(150)")
    ma_200: Optional[Decimal] = Field(None, description="MA(200)")
    cci_20: Optional[Decimal] = Field(None, description="CCI(20)")
    market_cap: Optional[Decimal] = Field(None, description="Market Cap from latest EOD")


class TickerDataIntegrityResponse(BaseModel):
    """Ticker data integrity report — for UI verification widget."""
    ticker_id: str = Field(..., description="Ticker ULID")
    symbol: str = Field(..., description="Ticker symbol")
    company_name: Optional[str] = Field(None, description="Company name")

    eod_prices: DataDomainOverview = Field(..., description="EOD prices (ticker_prices)")
    intraday_prices: DataDomainOverview = Field(..., description="Intraday (ticker_prices_intraday; active only)")
    history_250d: DataDomainOverview = Field(..., description="250d history for Indicators")

    indicators: Optional[IndicatorsOverview] = Field(
        None,
        description="ATR/MA/CCI + Market Cap (מחושב מ־250d; null אם חסרה היסטוריה)",
    )

    gaps_summary: List[str] = Field(default_factory=list, description="Human-readable list of gaps")
    last_updates: List[LastUpdateEntry] = Field(
        default_factory=list,
        description="Last N price updates (price_timestamp, fetched_at)",
    )


# --- History Backfill (TEAM_30_TO_TEAM_20_HISTORY_BACKFILL_API_REQUEST) ---


class HistoryBackfillResponse(BaseModel):
    """Response for POST /tickers/{ticker_id}/history-backfill."""

    ticker_id: str = Field(..., description="Ticker ULID")
    symbol: str = Field(..., description="Ticker symbol")
    rows_inserted: int = Field(..., ge=0, description="Rows inserted (0 for no_op)")
    status: str = Field(..., description="completed | no_op | failed")
    message: str = Field(..., description="Human-readable message")
