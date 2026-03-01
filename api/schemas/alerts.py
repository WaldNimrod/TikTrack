"""
Alerts Schemas - Pydantic (D34)
TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS
"""

from datetime import datetime
from typing import Optional, List, Any
from decimal import Decimal
from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    target_type: str = Field(..., description="ticker|trade|trade_plan|account|general")
    target_id: Optional[str] = None
    ticker_id: Optional[str] = None
    alert_type: str = Field(..., description="PRICE|VOLUME|TECHNICAL|NEWS|CUSTOM")
    priority: str = Field(default="MEDIUM", description="LOW|MEDIUM|HIGH|CRITICAL")
    condition_field: Optional[str] = None
    condition_operator: Optional[str] = None
    condition_value: Optional[float] = None
    title: str = Field(..., max_length=200)
    message: Optional[str] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None


class AlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    trigger_status: Optional[str] = Field(None, description="untriggered|triggered_read|triggered_unread")
    title: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = None
    condition_field: Optional[str] = None
    condition_operator: Optional[str] = None
    condition_value: Optional[float] = None
    expires_at: Optional[datetime] = None


class AlertResponse(BaseModel):
    id: str
    target_type: str
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
