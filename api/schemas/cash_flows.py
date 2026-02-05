"""
Cash Flows Schemas - Pydantic Models
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Pydantic schemas for Cash Flows API requests and responses.
All external IDs use ULID (converted from UUID in models).
"""

from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field


class CashFlowResponse(BaseModel):
    """Cash Flow response schema."""
    external_ulid: str = Field(..., description="External ULID identifier")
    transaction_date: date = Field(..., description="Transaction date")
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
