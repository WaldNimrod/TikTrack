"""
Trading Accounts Schemas - Pydantic Models
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Pydantic schemas for Trading Accounts API requests and responses.
All external IDs use ULID (converted from UUID in models).
"""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field

from ..utils.identity import uuid_to_ulid


class TradingAccountResponse(BaseModel):
    """Trading Account response schema."""
    external_ulid: str = Field(..., description="External ULID identifier")
    display_name: str = Field(..., alias="account_name", description="Account display name")
    broker: Optional[str] = Field(None, description="Broker name")
    currency: str = Field(..., description="Account currency")
    balance: Decimal = Field(..., alias="cash_balance", description="Current cash balance")
    positions_count: int = Field(..., description="Number of open positions")
    total_pl: Decimal = Field(..., description="Total unrealized P/L")
    account_value: Decimal = Field(..., description="Total account value (cash + holdings)")
    holdings_value: Decimal = Field(..., description="Total holdings value")
    is_active: bool = Field(..., description="Account active status")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "display_name": "חשבון מסחר מרכזי (IBKR)",
                "broker": "Interactive Brokers",
                "currency": "USD",
                "balance": 142500.42,
                "positions_count": 5,
                "total_pl": 1250.50,
                "account_value": 143750.92,
                "holdings_value": 1250.50,
                "is_active": True,
                "updated_at": "2026-02-02T10:30:00Z"
            }
        }


class TradingAccountListResponse(BaseModel):
    """Trading Accounts list response schema."""
    data: List[TradingAccountResponse] = Field(..., description="List of trading accounts")
    total: int = Field(..., description="Total count")
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "display_name": "חשבון מסחר מרכזי (IBKR)",
                        "broker": "Interactive Brokers",
                        "currency": "USD",
                        "balance": 142500.42,
                        "positions_count": 5,
                        "total_pl": 1250.50,
                        "account_value": 143750.92,
                        "holdings_value": 1250.50,
                        "is_active": True,
                        "updated_at": "2026-02-02T10:30:00Z"
                    }
                ],
                "total": 1
            }
        }
