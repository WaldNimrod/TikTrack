"""
Trade Plans Schemas - Pydantic (Phase C Carryover)
TEAM_10_PHASE_C_CARRYOVER — entityOptionLoader list contract
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TradePlanListOption(BaseModel):
    """Minimal trade plan item for entity option loader (alerts target_id, notes parent_id)."""

    id: str = Field(..., description="Trade plan ULID (external)")
    label: str = Field(..., description="Display label for dropdown")
    symbol: Optional[str] = Field(None, description="Ticker symbol (optional)")


class TradePlanListResponse(BaseModel):
    """List response for GET /trade_plans — entity loader contract."""

    data: List[TradePlanListOption] = Field(default_factory=list)
    total: int = Field(0, description="Total count")
