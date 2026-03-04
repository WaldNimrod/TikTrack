"""
Alerts Schemas - Pydantic (D34)
TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS
Phase C: 7 fields × 7 operators including crosses_above/crosses_below
"""

from datetime import datetime
from typing import Optional, List, Any
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator

from .alert_conditions import CONDITION_FIELDS, CONDITION_OPERATORS


VALID_TARGET_TYPES = frozenset(("ticker", "trade", "trade_plan", "account", "datetime"))
VALID_TRIGGER_STATUS = frozenset(("untriggered", "triggered_unread", "triggered_read", "rearmed"))


class AlertCreate(BaseModel):
    target_type: Optional[str] = Field(None, description="ticker|trade|trade_plan|account|datetime|null")
    target_id: Optional[str] = None
    target_datetime: Optional[datetime] = None
    ticker_id: Optional[str] = None
    alert_type: str = Field(..., description="PRICE|VOLUME|TECHNICAL|NEWS|CUSTOM")
    priority: str = Field(default="MEDIUM", description="LOW|MEDIUM|HIGH|CRITICAL")
    condition_field: Optional[str] = Field(None, description="price|open_price|high_price|low_price|close_price|volume|market_cap")
    condition_operator: Optional[str] = Field(None, description=">|<|>=|<=|=|crosses_above|crosses_below")
    condition_value: Optional[float] = None
    title: str = Field(..., max_length=200)
    message: Optional[str] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_condition_canonical(self):
        if self.condition_field is not None and self.condition_field not in CONDITION_FIELDS:
            raise ValueError(f"condition_field must be one of {sorted(CONDITION_FIELDS)}")
        if self.condition_operator is not None and self.condition_operator not in CONDITION_OPERATORS:
            raise ValueError(f"condition_operator must be one of {sorted(CONDITION_OPERATORS)}")
        # G7R Batch2: all-or-none — partial condition is validation error
        has_field = self.condition_field is not None and str(self.condition_field).strip() != ""
        has_op = self.condition_operator is not None and str(self.condition_operator).strip() != ""
        has_val = self.condition_value is not None
        filled = sum([has_field, has_op, has_val])
        if filled > 0 and filled < 3:
            raise ValueError(
                "Condition requires all three fields (condition_field, condition_operator, condition_value) "
                "or all empty. Partial condition is invalid."
            )
        return self


class AlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    trigger_status: Optional[str] = Field(None, description="untriggered|triggered_read|triggered_unread|rearmed")
    title: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = None
    condition_field: Optional[str] = Field(None, description="price|open_price|...|market_cap")
    condition_operator: Optional[str] = Field(None, description=">|<|>=|<=|=|crosses_above|crosses_below")
    condition_value: Optional[float] = None
    expires_at: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_condition_canonical(self):
        if self.condition_field is not None and self.condition_field not in CONDITION_FIELDS:
            raise ValueError(f"condition_field must be one of {sorted(CONDITION_FIELDS)}")
        if self.condition_operator is not None and self.condition_operator not in CONDITION_OPERATORS:
            raise ValueError(f"condition_operator must be one of {sorted(CONDITION_OPERATORS)}")
        # G7R Batch2: all-or-none for updates
        has_field = self.condition_field is not None and str(self.condition_field).strip() != ""
        has_op = self.condition_operator is not None and str(self.condition_operator).strip() != ""
        has_val = self.condition_value is not None
        filled = sum([has_field, has_op, has_val])
        if filled > 0 and filled < 3:
            raise ValueError("Condition requires all three fields or all empty.")
        return self


class AlertResponse(BaseModel):
    id: str
    target_type: Optional[str] = None
    target_datetime: Optional[datetime] = None
    target_id: Optional[str] = None
    ticker_id: Optional[str] = None
    ticker_symbol: Optional[str] = None
    alert_type: str
    priority: str
    condition_field: Optional[str] = None
    condition_operator: Optional[str] = None
    condition_value: Optional[float] = None
    condition_summary: Optional[str] = None
    title: str
    message: Optional[str] = None
    is_active: bool
    is_triggered: bool
    trigger_status: Optional[str] = None
    triggered_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertsListResponse(BaseModel):
    data: List[dict]
    total: int


class AlertsSummaryResponse(BaseModel):
    total_alerts: int
    active_alerts: int
    new_alerts: int
    triggered_alerts: int
