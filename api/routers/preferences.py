"""
D39 — GET/PATCH /api/v1/me/preferences (LLD S003-P003-WP001).
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..models.identity import User, UserApiKey
from ..schemas.preferences import (
    PreferencesPatch,
    PreferencesResponse,
    merge_preferences_from_user,
    settings_keys_for_patch,
)
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/me", tags=["preferences"])


async def _api_key_count(db: AsyncSession, user_id) -> int:
    q = await db.execute(
        select(func.count())
        .select_from(UserApiKey)
        .where(UserApiKey.user_id == user_id, UserApiKey.deleted_at.is_(None))
    )
    return int(q.scalar_one() or 0)


@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count = await _api_key_count(db, current_user.id)
    return merge_preferences_from_user(
        language=current_user.language,
        timezone=current_user.timezone,
        settings_blob=current_user.settings if isinstance(current_user.settings, dict) else {},
        api_key_count=count,
    )


@router.patch("/preferences", response_model=PreferencesResponse)
async def patch_preferences(
    body: PreferencesPatch,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        count = await _api_key_count(db, current_user.id)
        return merge_preferences_from_user(
            language=current_user.language,
            timezone=current_user.timezone,
            settings_blob=current_user.settings if isinstance(current_user.settings, dict) else {},
            api_key_count=count,
        )

    settings_keys = settings_keys_for_patch()
    existing = dict(current_user.settings) if isinstance(current_user.settings, dict) else {}

    if "timezone" in data:
        current_user.timezone = data["timezone"]
    if "language" in data:
        current_user.language = data["language"]

    if any(k in data for k in settings_keys):
        merged = dict(existing)
        for k in settings_keys:
            if k not in data:
                continue
            v = data[k]
            if v is None and k != "default_trading_account":
                continue
            merged[k] = v
        current_user.settings = merged
    current_user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(current_user)

    count = await _api_key_count(db, current_user.id)
    return merge_preferences_from_user(
        language=current_user.language,
        timezone=current_user.timezone,
        settings_blob=current_user.settings if isinstance(current_user.settings, dict) else {},
        api_key_count=count,
    )
