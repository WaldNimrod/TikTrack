"""
Settings API — Market Data Rate-Limit & Scaling (MD-SETTINGS)
TEAM_90_RATELIMIT_SCALING_LOCK, TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE
SSOT: TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT
System Management page — Admin-only. Resolution: DB > env.
"""

from typing import Optional, List, Tuple

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..utils.dependencies import require_admin_role
from ..models.identity import User
from ..integrations.market_data.market_data_settings import (
    get_all_settings,
    get_ssot_constraints,
)

router = APIRouter(prefix="/settings", tags=["settings"])

_ALLOWED_KEYS = {
    "max_active_tickers",
    "intraday_interval_minutes",
    "provider_cooldown_minutes",
    "max_symbols_per_request",
    "delay_between_symbols_seconds",
    "intraday_enabled",
}


class MarketDataSettingsResponse(BaseModel):
    """Market Data System Settings — DB > env."""

    max_active_tickers: int = Field(..., description="Max active tickers for intraday refresh")
    intraday_interval_minutes: int = Field(..., description="Intraday refresh interval (minutes)")
    provider_cooldown_minutes: int = Field(..., description="Cooldown after 429 (minutes)")
    max_symbols_per_request: int = Field(..., description="Max symbols per batch request")
    delay_between_symbols_seconds: int = Field(
        ..., description="Delay (seconds) between symbol fetches in sync scripts"
    )
    intraday_enabled: bool = Field(..., description="Whether intraday job should run")


class MarketDataSettingsPatch(BaseModel):
    """Partial update — only provided keys are updated."""

    max_active_tickers: Optional[int] = None
    intraday_interval_minutes: Optional[int] = None
    provider_cooldown_minutes: Optional[int] = None
    max_symbols_per_request: Optional[int] = None
    delay_between_symbols_seconds: Optional[int] = None
    intraday_enabled: Optional[bool] = None


def _validate_patch(body: MarketDataSettingsPatch) -> List[Tuple[str, str]]:
    """Return list of (key, error) for invalid values. Empty = valid."""
    errors: List[Tuple[str, str]] = []
    constraints = get_ssot_constraints()
    for key in _ALLOWED_KEYS:
        val = getattr(body, key, None)
        if val is None:
            continue
        c = constraints.get(key, {})
        if "min" in c and "max" in c:
            try:
                v = int(val)
                if v < c["min"] or v > c["max"]:
                    errors.append((key, f"must be between {c['min']} and {c['max']}"))
            except (TypeError, ValueError):
                errors.append((key, "must be an integer"))
        elif key == "intraday_enabled":
            if not isinstance(val, bool):
                errors.append((key, "must be a boolean"))
    return errors


@router.get("/market-data", response_model=MarketDataSettingsResponse)
async def get_market_data_settings(
    current_user: User = Depends(require_admin_role),
):
    """
    Get Market Data System Settings (Admin-only).
    Resolution: DB > env. TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.
    """
    settings = get_all_settings()
    return MarketDataSettingsResponse(**settings)


@router.patch("/market-data", response_model=MarketDataSettingsResponse)
async def patch_market_data_settings(
    body: MarketDataSettingsPatch,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """
    Update Market Data System Settings (Admin-only).
    Persists to market_data.system_settings with audit (updated_by, updated_at).
    Validates min/max per SSOT. Returns 422 (validation / no fields), 403 (non-admin from dependency).
    """
    # Check at least one field provided
    provided = {k for k in _ALLOWED_KEYS if getattr(body, k, None) is not None}
    if not provided:
        raise HTTPException(status_code=422, detail="No fields to update")

    errors = _validate_patch(body)
    if errors:
        raise HTTPException(
            status_code=422,
            detail={"validation_errors": [{"key": k, "error": e} for k, e in errors]},
        )

    try:
        for key in provided:
            val = getattr(body, key)
            value_str = "true" if val is True else "false" if val is False else str(val)
            value_type = "boolean" if isinstance(val, bool) else "integer"
            await db.execute(
                text(
                    """
                    INSERT INTO market_data.system_settings (key, value, value_type, updated_by, updated_at)
                    VALUES (:key, :value, :value_type, :updated_by, NOW())
                    ON CONFLICT (key) DO UPDATE SET
                        value = EXCLUDED.value,
                        value_type = EXCLUDED.value_type,
                        updated_by = EXCLUDED.updated_by,
                        updated_at = NOW()
                """
                ),
                {
                    "key": key,
                    "value": value_str,
                    "value_type": value_type,
                    "updated_by": current_user.id,
                },
            )
    except Exception as e:
        await db.rollback()
        err = str(e).lower()
        # 503 only for "relation/table does not exist" (migration not run)
        if "does not exist" in err and "system_settings" in err:
            raise HTTPException(
                status_code=503,
                detail="market_data.system_settings table not yet migrated; run: make migrate-md-settings",
            ) from e
        # Log and return 500 for other errors (FK, permissions, etc.)
        import logging

        logging.getLogger(__name__).exception("PATCH /settings/market-data failed: %s", e)
        from ..core.config import settings

        detail = (
            f"Failed to persist settings: {str(e)[:200]}"
            if getattr(settings, "debug", False)
            else "Failed to persist settings"
        )
        raise HTTPException(status_code=500, detail=detail) from e

    settings = get_all_settings()
    return MarketDataSettingsResponse(**settings)
