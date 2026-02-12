"""
Cash Flows Schemas - Pydantic Models
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Pydantic schemas for Cash Flows API requests and responses.
All external IDs use ULID (converted from UUID in models).
"""

from datetime import datetime, date as date_type
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field


class CashFlowResponse(BaseModel):
    """Cash Flow response schema."""
    external_ulid: str = Field(..., description="External ULID identifier")
    transaction_date: date_type = Field(..., description="Transaction date")
    flow_type: str = Field(..., description="Flow type (DEPOSIT, WITHDRAWAL, etc.)")
    subtype: Optional[str] = Field(None, description="Flow subtype (from metadata)")
    trading_account_id: str = Field(..., description="Trading account ULID")
    account_name: str = Field(..., description="Trading account name")
    amount: Decimal = Field(..., description="Transaction amount")
    currency: str = Field(..., description="Currency")
    status: Optional[str] = Field(None, description="Status (VERIFIED, PENDING, from metadata)")
    description: Optional[str] = Field(None, description="Transaction description")
    
    class Config:
        json_schema_extra = {
            "example": {
                "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "transaction_date": "2026-01-20",
                "flow_type": "DEPOSIT",
                "subtype": "BANK_TRANSFER",
                "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "account_name": "חשבון מסחר מרכזי (IBKR)",
                "amount": 5000.00,
                "currency": "USD",
                "status": "VERIFIED",
                "description": "הפקדה מהבנק"
            }
        }


class CashFlowSummaryResponse(BaseModel):
    """Cash Flow summary schema."""
    total_deposits: Decimal = Field(..., description="Total deposits")
    total_withdrawals: Decimal = Field(..., description="Total withdrawals")
    net_flow: Decimal = Field(..., description="Net cash flow")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_deposits": 5000.00,
                "total_withdrawals": 1200.00,
                "net_flow": 3800.00
            }
        }


class CashFlowCreateRequest(BaseModel):
    """Cash Flow create request schema."""
    trading_account_id: str = Field(..., description="Trading account ULID")
    flow_type: str = Field(..., description="Flow type (DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER, CURRENCY_CONVERSION)")
    amount: Decimal = Field(..., description="Transaction amount")
    currency: str = Field(default="USD", description="Currency code (ISO 3-letter)", max_length=3)
    transaction_date: date_type = Field(..., description="Transaction date")
    description: Optional[str] = Field(None, description="Transaction description")
    external_reference: Optional[str] = Field(None, description="External system reference", max_length=100)
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "flow_type": "DEPOSIT",
                "amount": 5000.00,
                "currency": "USD",
                "transaction_date": "2026-01-20",
                "description": "הפקדה מהבנק",
                "external_reference": "BANK_TXN_12345",
                "metadata": {
                    "subtype": "BANK_TRANSFER",
                    "status": "VERIFIED"
                }
            }
        }


class CashFlowUpdateRequest(BaseModel):
    """Cash Flow update request schema."""
    trading_account_id: Optional[str] = Field(None, description="Trading account ULID")
    flow_type: Optional[str] = Field(None, description="Flow type (DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER, CURRENCY_CONVERSION)")
    amount: Optional[Decimal] = Field(None, description="Transaction amount")
    currency: Optional[str] = Field(None, description="Currency code (ISO 3-letter)", max_length=3)
    transaction_date: Optional[date_type] = Field(None, description="Transaction date")
    description: Optional[str] = Field(None, description="Transaction description")
    external_reference: Optional[str] = Field(None, description="External system reference", max_length=100)
    metadata: Optional[dict] = Field(None, description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 5500.00,
                "description": "הפקדה מעודכנת מהבנק",
                "metadata": {
                    "status": "VERIFIED"
                }
            }
        }


class CurrencyConversionResponse(BaseModel):
    """Currency Conversion response schema."""
    id: str = Field(..., description="External ULID identifier")
    date: date_type = Field(..., description="Transaction date")
    account: str = Field(..., description="Trading account name")
    from_currency: str = Field(..., description="Source currency code")
    from_amount: Decimal = Field(..., description="Source amount")
    to_currency: str = Field(..., description="Target currency code")
    to_amount: Decimal = Field(..., description="Converted amount")
    rate: Decimal = Field(..., description="Exchange rate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "date": "2026-01-20",
                "account": "חשבון מסחר מרכזי (IBKR)",
                "from_currency": "USD",
                "from_amount": 1000.00,
                "to_currency": "EUR",
                "to_amount": 920.00,
                "rate": 0.92
            }
        }


class CurrencyConversionListResponse(BaseModel):
    """Currency Conversions list response schema."""
    data: List[CurrencyConversionResponse] = Field(..., description="List of currency conversions")
    total: int = Field(..., description="Total count")
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "date": "2026-01-20",
                        "account": "חשבון מסחר מרכזי (IBKR)",
                        "from_currency": "USD",
                        "from_amount": 1000.00,
                        "to_currency": "EUR",
                        "to_amount": 920.00,
                        "rate": 0.92
                    }
                ],
                "total": 1
            }
        }


class CashFlowListResponse(BaseModel):
    """Cash Flows list response schema."""
    data: List[CashFlowResponse] = Field(..., description="List of cash flows")
    total: int = Field(..., description="Total count")
    summary: CashFlowSummaryResponse = Field(..., description="Summary statistics")
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "transaction_date": "2026-01-20",
                        "flow_type": "DEPOSIT",
                        "subtype": "BANK_TRANSFER",
                        "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "account_name": "חשבון מסחר מרכזי (IBKR)",
                        "amount": 5000.00,
                        "currency": "USD",
                        "status": "VERIFIED",
                        "description": "הפקדה מהבנק"
                    }
                ],
                "total": 1,
                "summary": {
                    "total_deposits": 5000.00,
                    "total_withdrawals": 1200.00,
                    "net_flow": 3800.00
                }
            }
        }
