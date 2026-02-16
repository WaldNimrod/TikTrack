"""Unified Pydantic Models - v1.0.0"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import re

ULID_PATTERN = r"^[0-7][0-9A-HJKMNP-TV-Z]{25}$"

class UserResponse(BaseModel):
    external_ulids: str = Field(..., regex=ULID_PATTERN)
    phone_numbers: str
    user_tier_levels: str

class TradeResponse(BaseModel):
    external_ulids: str = Field(..., regex=ULID_PATTERN)
    parent_id: Optional[str] = None
    calculated_statuses: str
    aggregated_pnl_amounts: float
    children: List['TradeResponse'] = []

TradeResponse.update_forward_refs()