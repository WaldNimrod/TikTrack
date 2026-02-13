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


class TickerListResponse(BaseModel):
    """Ticker list response schema."""
    data: List[TickerResponse]
    total: int


class TickerSummaryResponse(BaseModel):
    """Ticker summary for top section."""
    total_tickers: int
    active_tickers: int
