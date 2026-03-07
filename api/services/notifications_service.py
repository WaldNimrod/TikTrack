"""
Notifications Service - Business Logic (G7 M-003)
ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT Gap C

Service layer for notifications (list, mark read).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from ..models.notification import Notification


class NotificationsService:
    """Notifications CRUD and read-state service."""

    async def list_notifications(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        is_read: Optional[bool] = None,
        limit: int = 5,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """List notifications for user. Returns { count, items }."""
        base = and_(
            Notification.user_id == user_id,
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
        return {"count": total, "items": items}

    async def mark_all_read(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        """Mark all notifications as read for user."""
        stmt = select(Notification).where(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False,
                Notification.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        now = datetime.now(timezone.utc)
        for n in result.scalars().all():
            n.is_read = True
            n.read_at = now
        await db.commit()

    async def create_notification(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        alert_id: Optional[uuid.UUID],
        title: str,
        message: str,
        notification_type: str = "alert_trigger",
    ) -> Notification:
        """Create a notification row (G7 Phase C — alert trigger)."""
        n = Notification(
            user_id=user_id,
            alert_id=alert_id,
            type=notification_type,
            title=title,
            message=message,
        )
        db.add(n)
        await db.flush()
        return n

    async def mark_one_read(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        notification_id: uuid.UUID,
    ) -> bool:
        """Mark one notification as read. Returns True if found and updated."""
        stmt = select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id,
                Notification.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        n = result.scalar_one_or_none()
        if not n:
            return False
        n.is_read = True
        n.read_at = datetime.now(timezone.utc)
        await db.commit()
        return True


_notifications_service: Optional[NotificationsService] = None


def get_notifications_service() -> NotificationsService:
    global _notifications_service
    if _notifications_service is None:
        _notifications_service = NotificationsService()
    return _notifications_service
