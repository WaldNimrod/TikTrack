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
    target_type: str = Field(
        ..., description="ticker|trade|trade_plan|account|datetime — required (BF-G7-017)"
    )
    target_id: Optional[str] = None
    target_datetime: Optional[datetime] = None
    ticker_id: Optional[str] = None
    alert_type: str = Field(..., description="PRICE|VOLUME|TECHNICAL|NEWS|CUSTOM")
    priority: str = Field(default="MEDIUM", description="LOW|MEDIUM|HIGH|CRITICAL")
    condition_field: Optional[str] = Field(
        None, description="price|open_price|high_price|low_price|close_price|volume|market_cap"
    )
    condition_operator: Optional[str] = Field(
        None, description=">|<|>=|<=|=|crosses_above|crosses_below"
    )
    condition_value: Optional[float] = None
    title: str = Field(..., max_length=200)
    message: Optional[str] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_target_and_general(self):
        """BF-G7-014: Reject 'general'. BF-G7-017: linked entity mandatory (target_id/ticker_id for entity types)."""
        tt = (self.target_type or "").strip().lower()
        if tt == "general":
            raise ValueError(
                "target_type 'general' is not allowed. Use ticker, trade, trade_plan, account, or datetime."
            )
        if tt and tt not in VALID_TARGET_TYPES:
            raise ValueError(
                f"target_type must be one of {sorted(VALID_TARGET_TYPES)}, got '{self.target_type}'"
            )
        # BF-G7-017: Entity types require target_id or ticker_id
        if tt in ("ticker", "trade", "trade_plan", "account"):
            has_ticker = bool(self.ticker_id and str(self.ticker_id).strip())
            has_target = bool(self.target_id and str(self.target_id).strip())
            if tt == "ticker" and not has_ticker and not has_target:
                raise ValueError(
                    "ticker_id or target_id required when target_type=ticker. Please select a linked entity."
                )
            if tt != "ticker" and not has_target:
                raise ValueError(
                    "target_id required when target_type is trade, trade_plan, or account. Please select a linked entity."
                )
        return self

    @model_validator(mode="after")
    def validate_condition_canonical(self):
        if self.condition_field is not None and self.condition_field not in CONDITION_FIELDS:
            raise ValueError(f"condition_field must be one of {sorted(CONDITION_FIELDS)}")
        if (
            self.condition_operator is not None
            and self.condition_operator not in CONDITION_OPERATORS
        ):
            raise ValueError(f"condition_operator must be one of {sorted(CONDITION_OPERATORS)}")
        # BF-G7-013: Entity alerts require condition; datetime may omit
        has_field = self.condition_field is not None and str(self.condition_field).strip() != ""
        has_op = self.condition_operator is not None and str(self.condition_operator).strip() != ""
        has_val = self.condition_value is not None
        filled = sum([has_field, has_op, has_val])
        if filled > 0 and filled < 3:
            raise ValueError(
                "Condition requires all three fields (condition_field, condition_operator, condition_value) "
                "or all empty. Partial condition is invalid."
            )
        # BF-G7-013: Entity alerts (ticker, trade, trade_plan, account) require condition; datetime may omit
        if filled == 0 and self.target_type and self.target_type != "datetime":
            raise ValueError(
                "Condition is required for entity alerts. Provide condition_field, condition_operator, and condition_value."
            )
        return self


class AlertUpdate(BaseModel):
    """BF-G7-018: Supports linked_entity change via target_type, target_id, ticker_id, target_datetime."""

    target_type: Optional[str] = Field(None, description="ticker|trade|trade_plan|account|datetime")
    target_id: Optional[str] = None
    ticker_id: Optional[str] = None
    target_datetime: Optional[datetime] = None
    is_active: Optional[bool] = None
    trigger_status: Optional[str] = Field(
        None, description="untriggered|triggered_read|triggered_unread|rearmed"
    )
    title: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = None
    condition_field: Optional[str] = Field(None, description="price|open_price|...|market_cap")
    condition_operator: Optional[str] = Field(
        None, description=">|<|>=|<=|=|crosses_above|crosses_below"
    )
    condition_value: Optional[float] = None
    expires_at: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_target_update(self):
        """BF-G7-014: Reject 'general'; BF-G7-018: validate linked entity fields."""
        if self.target_type is not None:
            tt = str(self.target_type).strip().lower()
            if tt == "general":
                raise ValueError("target_type 'general' is not allowed.")
            if tt not in VALID_TARGET_TYPES:
                raise ValueError(f"target_type must be one of {sorted(VALID_TARGET_TYPES)}")
        return self

    @model_validator(mode="after")
    def validate_condition_canonical(self):
        if self.condition_field is not None and self.condition_field not in CONDITION_FIELDS:
            raise ValueError(f"condition_field must be one of {sorted(CONDITION_FIELDS)}")
        if (
            self.condition_operator is not None
            and self.condition_operator not in CONDITION_OPERATORS
        ):
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
    target_display_name: Optional[str] = None
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
