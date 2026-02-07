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
    """Broker Fee response schema."""
    id: str = Field(..., description="External ULID identifier")
    broker: str = Field(..., description="Broker name", max_length=100)
    commission_type: str = Field(..., description="Commission type (TIERED or FLAT)")
    commission_value: str = Field(..., description="Commission value (e.g., '0.0035 $ / Share')", max_length=255)
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
                "broker": "Interactive Brokers",
                "commission_type": "TIERED",
                "commission_value": "0.0035 $ / Share",
                "minimum": 0.35,
                "created_at": "2026-01-31T10:00:00Z",
                "updated_at": "2026-01-31T10:00:00Z"
            }
        }


class BrokerFeeCreateRequest(BaseModel):
    """Broker Fee create request schema."""
    broker: str = Field(..., description="Broker name", max_length=100)
    commission_type: str = Field(..., description="Commission type (TIERED or FLAT)")
    commission_value: str = Field(..., description="Commission value (e.g., '0.0035 $ / Share')", max_length=255)
    minimum: Decimal = Field(..., description="Minimum commission per transaction (USD)", ge=0)
    
    @field_validator('commission_type')
    @classmethod
    def validate_commission_type(cls, v: str) -> str:
        """Validate commission_type is TIERED or FLAT."""
        if v.upper() not in ('TIERED', 'FLAT'):
            raise ValueError("commission_type must be 'TIERED' or 'FLAT'")
        return v.upper()
    
    @field_validator('broker')
    @classmethod
    def validate_broker(cls, v: str) -> str:
        """Validate broker is not empty."""
        if not v or not v.strip():
            raise ValueError("broker cannot be empty")
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "broker": "Interactive Brokers",
                "commission_type": "TIERED",
                "commission_value": "0.0035 $ / Share",
                "minimum": 0.35
            }
        }


class BrokerFeeUpdateRequest(BaseModel):
    """Broker Fee update request schema."""
    broker: Optional[str] = Field(None, description="Broker name", max_length=100)
    commission_type: Optional[str] = Field(None, description="Commission type (TIERED or FLAT)")
    commission_value: Optional[str] = Field(None, description="Commission value (e.g., '0.0035 $ / Share')", max_length=255)
    minimum: Optional[Decimal] = Field(None, description="Minimum commission per transaction (USD)", ge=0)
    
    @field_validator('commission_type')
    @classmethod
    def validate_commission_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate commission_type is TIERED or FLAT."""
        if v is not None and v.upper() not in ('TIERED', 'FLAT'):
            raise ValueError("commission_type must be 'TIERED' or 'FLAT'")
        return v.upper() if v else None
    
    @field_validator('broker')
    @classmethod
    def validate_broker(cls, v: Optional[str]) -> Optional[str]:
        """Validate broker is not empty if provided."""
        if v is not None and (not v or not v.strip()):
            raise ValueError("broker cannot be empty")
        return v.strip() if v else None
    
    class Config:
        json_schema_extra = {
            "example": {
                "broker": "Interactive Brokers",
                "commission_type": "FLAT",
                "commission_value": "$0.00",
                "minimum": 0.00
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
                        "broker": "Interactive Brokers",
                        "commission_type": "TIERED",
                        "commission_value": "0.0035 $ / Share",
                        "minimum": 0.35,
                        "created_at": "2026-01-31T10:00:00Z",
                        "updated_at": "2026-01-31T10:00:00Z"
                    }
                ],
                "total": 1
            }
        }
