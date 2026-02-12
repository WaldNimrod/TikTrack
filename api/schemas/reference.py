"""
Reference Data Schemas
Task: GET /api/v1/reference/brokers (ADR-013, ADR-015)
Status: COMPLETED

Schemas for reference/lookup endpoints.
"""

from decimal import Decimal
from typing import List
from pydantic import BaseModel, Field


class DefaultFeeItem(BaseModel):
    """Default fee suggestion for broker (ADR-015)."""
    commission_type: str = Field(..., description="TIERED or FLAT")
    commission_value: Decimal = Field(..., ge=0, description="Commission value")
    minimum: Decimal = Field(..., ge=0, description="Minimum per transaction (USD)")


class BrokerReferenceItem(BaseModel):
    """Single broker option for select dropdown (ADR-015 extended)."""
    value: str = Field(..., max_length=100, description="Broker value (form submit)")
    display_name: str = Field(..., max_length=100, description="Display label (UI)")
    label: str = Field(..., max_length=100, description="Alias for display_name (D16/D18 backward compat)")
    is_supported: bool = Field(..., description="True if broker supports import; 'other' is false")
    default_fees: List[DefaultFeeItem] = Field(default_factory=list, description="Suggested fees for prefill")

    model_config = {
        "json_schema_extra": {
            "example": {
                "value": "Interactive Brokers",
                "display_name": "Interactive Brokers",
                "label": "Interactive Brokers",
                "is_supported": True,
                "default_fees": [
                    {"commission_type": "FLAT", "commission_value": 1.0, "minimum": 0},
                    {"commission_type": "TIERED", "commission_value": 0.005, "minimum": 0.5}
                ]
            }
        }
    }


class BrokerReferenceResponse(BaseModel):
    """Response for GET /api/v1/reference/brokers."""
    data: List[BrokerReferenceItem] = Field(..., description="List of broker options")
    total: int = Field(..., description="Total count")

    model_config = {
        "json_schema_extra": {
            "example": {
                "data": [
                    {
                        "value": "Interactive Brokers",
                        "display_name": "Interactive Brokers",
                        "label": "Interactive Brokers",
                        "is_supported": True,
                        "default_fees": [{"commission_type": "FLAT", "commission_value": 1.0, "minimum": 0}]
                    },
                    {"value": "other", "display_name": "אחר", "label": "אחר", "is_supported": False, "default_fees": []}
                ],
                "total": 2
            }
        }
    }
