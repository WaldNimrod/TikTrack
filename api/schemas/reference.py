"""
Reference Data Schemas
Task: GET /api/v1/reference/brokers (ADR-013)
Status: COMPLETED

Schemas for reference/lookup endpoints.
"""

from pydantic import BaseModel, Field


class BrokerReferenceItem(BaseModel):
    """Single broker option for select dropdown."""
    value: str = Field(..., max_length=100, description="Broker name (form value)")
    label: str = Field(..., max_length=100, description="Display label (UI)")

    model_config = {"json_schema_extra": {"example": {"value": "Interactive Brokers", "label": "Interactive Brokers"}}}


class BrokerReferenceResponse(BaseModel):
    """Response for GET /api/v1/reference/brokers."""
    data: list[BrokerReferenceItem] = Field(..., description="List of broker options")
    total: int = Field(..., description="Total count")

    model_config = {
        "json_schema_extra": {
            "example": {
                "data": [
                    {"value": "Interactive Brokers", "label": "Interactive Brokers"},
                    {"value": "Fidelity", "label": "Fidelity"}
                ],
                "total": 2
            }
        }
    }
