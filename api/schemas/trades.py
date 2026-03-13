"""
Trades Schemas - Pydantic (Phase C Carryover)
TEAM_10_PHASE_C_CARRYOVER — entityOptionLoader list contract
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TradeListOption(BaseModel):
    """Minimal trade item for entity option loader (alerts target_id, notes parent_id)."""

    id: str = Field(..., description="Trade ULID (external)")
    label: str = Field(..., description="Display label for dropdown")
    symbol: Optional[str] = Field(None, description="Ticker symbol (optional)")


class TradeListResponse(BaseModel):
    """List response for GET /trades — entity loader contract."""

    data: List[TradeListOption] = Field(default_factory=list)
    total: int = Field(0, description="Total count")
