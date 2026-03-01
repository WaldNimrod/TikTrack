"""
Notifications Router - G7 (Notification Bell Widget)
ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT Gap C

GET  /api/v1/notifications
PATCH /api/v1/notifications/{id}/read
PATCH /api/v1/notifications/read-all
"""

import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User
from ..models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=dict)
async def list_notifications(
    is_read: Optional[bool] = Query(None),
    limit: int = Query(5, ge=1, le=50),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List notifications for current user. Response: { count, items }."""
    base = and_(
        Notification.user_id == current_user.id,
        Notification.deleted_at.is_(None),
    )
    if is_read is not None:
        base = and_(base, Notification.is_read == is_read)

    count_stmt = select(func.count()).select_from(Notification).where(base)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(Notification)
        .where(base)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    items = [
        {
            "id": str(n.id),
            "alert_id": str(n.alert_id) if n.alert_id else None,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
        }
        for n in rows
    ]
    return {"count": total if is_read is None else total, "items": items}


@router.patch("/read-all", status_code=204)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all notifications as read for current user."""
    stmt = select(Notification).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
            Notification.deleted_at.is_(None),
        )
    )
    result = await db.execute(stmt)
    for n in result.scalars().all():
        n.is_read = True
        n.read_at = datetime.now(timezone.utc)
    await db.commit()


@router.patch("/{notification_id}/read", status_code=204)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark one notification as read."""
    stmt = select(Notification).where(
        and_(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
            Notification.deleted_at.is_(None),
        )
    )
    result = await db.execute(stmt)
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    n.read_at = datetime.now(timezone.utc)
    await db.commit()
