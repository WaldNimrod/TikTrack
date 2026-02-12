"""
Brokers Fees Schemas - Pydantic Models
Task: Phase 2.1 - Brokers Fees (D18)
Status: IN PROGRESS

Pydantic schemas for Brokers Fees API requests and responses.
All external IDs use ULID (converted from UUID in models).
"""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class BrokerFeeResponse(BaseModel):
    """Broker Fee response schema (ADR-015: fees per trading account)."""
    id: str = Field(..., description="External ULID identifier")
    trading_account_id: str = Field(..., description="Trading account ULID (fees belong to account)")
    account_name: str = Field(..., description="Account display name (for UI)")
    commission_type: str = Field(..., description="Commission type (TIERED or FLAT)")
    commission_value: Decimal = Field(..., description="Commission value (numeric)", ge=0)
    minimum: Decimal = Field(..., description="Minimum commission per transaction (USD)")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    @field_validator('commission_type')
    @classmethod
    def validate_commission_type(cls, v: str) -> str:
        """Validate commission_type is TIERED or FLAT."""
        if v.upper() not in ('TIERED', 'FLAT'):
            raise ValueError("commission_type must be 'TIERED' or 'FLAT'")
        return v.upper()
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
                "account_name": "IBKR Main",
                "commission_type": "TIERED",
                "commission_value": 0.0035,
                "minimum": 0.35,
                "created_at": "2026-01-31T10:00:00Z",
                "updated_at": "2026-01-31T10:00:00Z"
            }
        }


class BrokerFeeCreateRequest(BaseModel):
    """Broker Fee create request schema (ADR-015: trading_account_id required)."""
    trading_account_id: str = Field(..., description="Trading account ULID (fees belong to this account)")
    commission_type: str = Field(..., description="Commission type (TIERED or FLAT)")
    commission_value: Decimal = Field(..., description="Commission value (numeric)", ge=0)
    minimum: Decimal = Field(..., description="Minimum commission per transaction (USD)", ge=0)
    
    @field_validator('commission_type')
    @classmethod
    def validate_commission_type(cls, v: str) -> str:
        """Validate commission_type is TIERED or FLAT."""
        if v.upper() not in ('TIERED', 'FLAT'):
            raise ValueError("commission_type must be 'TIERED' or 'FLAT'")
        return v.upper()
    
    class Config:
        json_schema_extra = {
            "example": {
                "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
                "commission_type": "TIERED",
                "commission_value": 0.0035,
                "minimum": 0.35
            }
        }


class BrokerFeeUpdateRequest(BaseModel):
    """Broker Fee update request schema."""
    trading_account_id: Optional[str] = Field(None, description="Trading account ULID")
    commission_type: Optional[str] = Field(None, description="Commission type (TIERED or FLAT)")
    commission_value: Optional[Decimal] = Field(None, description="Commission value (numeric)", ge=0)
    minimum: Optional[Decimal] = Field(None, description="Minimum commission per transaction (USD)", ge=0)
    
    @field_validator('commission_type')
    @classmethod
    def validate_commission_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate commission_type is TIERED or FLAT."""
        if v is not None and v.upper() not in ('TIERED', 'FLAT'):
            raise ValueError("commission_type must be 'TIERED' or 'FLAT'")
        return v.upper() if v else None
    
    class Config:
        json_schema_extra = {
            "example": {
                "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
                "commission_type": "FLAT",
                "commission_value": 0.00,
                "minimum": 0.00
            }
        }


class BrokerFeeSummaryResponse(BaseModel):
    """Broker Fee summary schema (ADR-015: per trading account)."""
    total_brokers: int = Field(..., description="Total number of distinct accounts with fees")
    active_brokers: int = Field(..., description="Number of active accounts with fees")
    avg_commission_per_trade: Decimal = Field(default=Decimal("0"), description="Average commission per trade")
    monthly_fixed_commissions: Decimal = Field(default=Decimal("0"), description="Total monthly fixed commissions")
    yearly_fixed_commissions: Decimal = Field(default=Decimal("0"), description="Total yearly fixed commissions")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_brokers": 5,
                "active_brokers": 3,
                "avg_commission_per_trade": 0.35,
                "monthly_fixed_commissions": 50.00,
                "yearly_fixed_commissions": 600.00
            }
        }


class BrokerFeeListResponse(BaseModel):
    """Brokers Fees list response schema."""
    data: List[BrokerFeeResponse] = Field(..., description="List of broker fees")
    total: int = Field(..., description="Total count")
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                        "trading_account_id": "01ARZ3NDEKTSV4RRFFQ69G5FB",
                        "account_name": "IBKR Main",
                        "commission_type": "TIERED",
                        "commission_value": 0.0035,
                        "minimum": 0.35,
                        "created_at": "2026-01-31T10:00:00Z",
                        "updated_at": "2026-01-31T10:00:00Z"
                    }
                ],
                "total": 1
            }
        }
