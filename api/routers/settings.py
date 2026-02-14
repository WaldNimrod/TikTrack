"""
Settings API — Market Data Rate-Limit & Scaling
TEAM_90_RATELIMIT_SCALING_LOCK, TEAM_10_TO_TEAM_20_RATELIMIT_SCALING_MANDATE
SSOT: MARKET_DATA_PIPE_SPEC §8.3
System Management page — Admin-only (Type D).
"""

from fastapi import APIRouter, Depends

from ..utils.dependencies import require_admin_role
from ..models.identity import User
from pydantic import BaseModel, Field

from ..integrations.market_data.market_data_settings import (
    get_max_active_tickers,
    get_intraday_interval_minutes,
    get_provider_cooldown_minutes,
    get_max_symbols_per_request,
)

router = APIRouter(prefix="/settings", tags=["settings"])


class MarketDataSettingsResponse(BaseModel):
    """Market Data System Settings — read-only from env."""

    max_active_tickers: int = Field(..., description="Max active tickers for intraday refresh")
    intraday_interval_minutes: int = Field(..., description="Intraday refresh interval (minutes)")
    provider_cooldown_minutes: int = Field(..., description="Cooldown after 429 (minutes)")
    max_symbols_per_request: int = Field(..., description="Max symbols per batch request")


@router.get("/market-data", response_model=MarketDataSettingsResponse)
async def get_market_data_settings(
    current_user: User = Depends(require_admin_role),
):
    """
    Get Market Data Rate-Limit & Scaling settings (Admin-only).
    Values from env (MAX_ACTIVE_TICKERS, INTRADAY_INTERVAL_MINUTES, etc.)
    """
    return MarketDataSettingsResponse(
        max_active_tickers=get_max_active_tickers(),
        intraday_interval_minutes=get_intraday_interval_minutes(),
        provider_cooldown_minutes=get_provider_cooldown_minutes(),
        max_symbols_per_request=get_max_symbols_per_request(),
    )
