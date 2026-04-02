"""
D40 — GET/PATCH /api/v1/admin/feature-flags (LLD S003-P003-WP001).
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..models.feature_flags import FeatureFlag
from ..models.identity import User
from ..utils.dependencies import require_admin_role

router = APIRouter(prefix="/admin/feature-flags", tags=["admin-feature-flags"])


class FeatureFlagItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    value_bool: Optional[bool] = None
    value_text: Optional[str] = None
    description: Optional[str] = None
    updated_at: datetime


class FeatureFlagListResponse(BaseModel):
    items: List[FeatureFlagItem]


class FeatureFlagPatchBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    value_bool: Optional[bool] = None
    value_text: Optional[str] = Field(default=None, max_length=500)


@router.get("", response_model=FeatureFlagListResponse)
async def list_feature_flags(
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FeatureFlag).order_by(FeatureFlag.key))
    rows = result.scalars().all()
    return FeatureFlagListResponse(
        items=[
            FeatureFlagItem(
                key=r.key,
                value_bool=r.value_bool,
                value_text=r.value_text,
                description=r.description,
                # DB should always set updated_at; fallback avoids 500 on legacy/null rows
                updated_at=r.updated_at or datetime.now(timezone.utc),
            )
            for r in rows
        ]
    )


@router.patch("/{key}", response_model=FeatureFlagItem)
async def patch_feature_flag(
    key: str,
    body: FeatureFlagPatchBody,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    payload = body.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields to update",
        )

    result = await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature flag not found")

    if "value_bool" in payload:
        row.value_bool = payload["value_bool"]
    if "value_text" in payload:
        row.value_text = payload["value_text"]
    row.updated_by = current_user.id
    row.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(row)

    return FeatureFlagItem(
        key=row.key,
        value_bool=row.value_bool,
        value_text=row.value_text,
        description=row.description,
        updated_at=row.updated_at or datetime.now(timezone.utc),
    )
