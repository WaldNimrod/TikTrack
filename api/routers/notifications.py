"""
Notifications Router - G7 (Notification Bell Widget)
ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT Gap C

GET   /api/v1/notifications
PATCH /api/v1/notifications/{id}/read
PATCH /api/v1/notifications/read-all
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User
from ..services.notifications_service import get_notifications_service

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
    svc = get_notifications_service()
    return await svc.list_notifications(
        db=db,
        user_id=current_user.id,
        is_read=is_read,
        limit=limit,
        offset=offset,
    )


@router.patch("/read-all", status_code=204)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all notifications as read for current user."""
    svc = get_notifications_service()
    await svc.mark_all_read(db=db, user_id=current_user.id)


@router.patch("/{notification_id}/read", status_code=204)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark one notification as read."""
    svc = get_notifications_service()
    ok = await svc.mark_one_read(db=db, user_id=current_user.id, notification_id=notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
