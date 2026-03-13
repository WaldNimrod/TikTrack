"""
Positions Schemas - Pydantic Models
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Pydantic schemas for Positions API requests and responses.
Positions are derived from trades table (aggregated by ticker_id and trading_account_id).
All external IDs use ULID (converted from UUID in models).
"""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field


class PositionResponse(BaseModel):
    """Position response schema."""

    external_ulid: str = Field(..., description="External ULID identifier (ticker_id)")
    symbol: str = Field(..., description="Ticker symbol")
    ticker_id: str = Field(..., description="Ticker ULID")
    quantity: Decimal = Field(..., description="Total quantity (aggregated)")
    avg_price: Decimal = Field(..., alias="avg_entry_price", description="Average entry price")
    current_price: Decimal = Field(..., description="Current market price")
    daily_change: Decimal = Field(..., description="Daily price change")
    daily_change_percent: Decimal = Field(..., description="Daily price change percentage")
    market_value: Decimal = Field(
        ..., description="Current market value (quantity * current_price)"
    )
    unrealized_pl: Decimal = Field(..., description="Unrealized P/L")
    unrealized_pl_percent: Decimal = Field(..., description="Unrealized P/L percentage")
    percent_of_account: Decimal = Field(..., description="Percentage of account value")
    status: str = Field(..., description="Position status (OPEN, CLOSED, etc.)")
    direction: str = Field(..., description="Trade direction (LONG, SHORT)")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "symbol": "AAPL",
                "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "quantity": 100,
                "avg_price": 150.25,
                "current_price": 155.34,
                "daily_change": 3.22,
                "daily_change_percent": 2.11,
                "market_value": 15534.00,
                "unrealized_pl": 509.00,
                "unrealized_pl_percent": 3.39,
                "percent_of_account": 10.8,
                "status": "OPEN",
                "direction": "LONG",
            }
        }


class PositionListResponse(BaseModel):
    """Positions list response schema."""

    data: List[PositionResponse] = Field(..., description="List of positions")
    total: int = Field(..., description="Total count")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "symbol": "AAPL",
                        "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "quantity": 100,
                        "avg_price": 150.25,
                        "current_price": 155.34,
                        "daily_change": 3.22,
                        "daily_change_percent": 2.11,
                        "market_value": 15534.00,
                        "unrealized_pl": 509.00,
                        "unrealized_pl_percent": 3.39,
                        "percent_of_account": 10.8,
                        "status": "OPEN",
                        "direction": "LONG",
                    }
                ],
                "total": 1,
            }
        }
