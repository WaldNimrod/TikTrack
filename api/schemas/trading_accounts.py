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


class TradingAccountSummaryResponse(BaseModel):
    """Trading Account summary schema."""
    total_accounts: int = Field(..., description="Total number of trading accounts")
    active_accounts: int = Field(..., description="Number of active trading accounts")
    total_account_value: Decimal = Field(..., description="Total account value across all accounts")
    total_cash_balance: Decimal = Field(..., description="Total cash balance across all accounts")
    total_holdings_value: Decimal = Field(..., description="Total holdings value across all accounts")
    total_unrealized_pl: Decimal = Field(..., description="Total unrealized P/L across all accounts")
    total_positions: int = Field(..., description="Total number of open positions across all accounts")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_accounts": 5,
                "active_accounts": 3,
                "total_account_value": "500000.00",
                "total_cash_balance": "450000.00",
                "total_holdings_value": "50000.00",
                "total_unrealized_pl": "2500.50",
                "total_positions": 15
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


class TradingAccountCreateRequest(BaseModel):
    """Trading Account create request schema."""
    account_name: str = Field(..., description="Account display name", max_length=100)
    broker: Optional[str] = Field(None, description="Broker name", max_length=100)
    account_number: Optional[str] = Field(None, description="Account number", max_length=50)
    initial_balance: Decimal = Field(..., description="Initial account balance", ge=0)
    currency: str = Field(default="USD", description="Account currency (ISO 3-letter)", max_length=3)
    is_active: bool = Field(default=True, description="Account active status")
    external_account_id: Optional[str] = Field(None, description="External account ID", max_length=100)
    account_metadata: Optional[dict] = Field(default_factory=dict, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "account_name": "חשבון מסחר מרכזי (IBKR)",
                "broker": "Interactive Brokers",
                "account_number": "U1234567",
                "initial_balance": 100000.00,
                "currency": "USD",
                "is_active": True,
                "external_account_id": "IBKR_ACC_123",
                "account_metadata": {
                    "account_type": "MARGIN",
                    "country": "US"
                }
            }
        }


class TradingAccountUpdateRequest(BaseModel):
    """Trading Account update request schema."""
    account_name: Optional[str] = Field(None, description="Account display name", max_length=100)
    broker: Optional[str] = Field(None, description="Broker name", max_length=100)
    account_number: Optional[str] = Field(None, description="Account number", max_length=50)
    initial_balance: Optional[Decimal] = Field(None, description="Initial account balance", ge=0)
    currency: Optional[str] = Field(None, description="Account currency (ISO 3-letter)", max_length=3)
    is_active: Optional[bool] = Field(None, description="Account active status")
    external_account_id: Optional[str] = Field(None, description="External account ID", max_length=100)
    account_metadata: Optional[dict] = Field(None, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "account_name": "חשבון מסחר מעודכן",
                "broker": "TD Ameritrade",
                "is_active": False
            }
        }
