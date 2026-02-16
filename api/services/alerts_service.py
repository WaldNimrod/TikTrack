"""
Alerts Service - D34
TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS
TEAM_60_TO_TEAM_20_D34_ALERTS_DDL_COORDINATION
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from ..models.alerts import Alert
from ..models.tickers import Ticker
from ..models.enums import AlertType, AlertPriority


VALID_TARGET_TYPES = frozenset(("ticker", "trade", "trade_plan", "account", "general"))
VALID_ALERT_TYPES = frozenset(("PRICE", "VOLUME", "TECHNICAL", "NEWS", "CUSTOM"))
VALID_PRIORITIES = frozenset(("LOW", "MEDIUM", "HIGH", "CRITICAL"))
NEW_ALERTS_DAYS = 10


def _condition_summary(field: Optional[str], op: Optional[str], val) -> Optional[str]:
    """Build condition_summary string for display."""
    if not field or not op:
        return None
    try:
        v = float(val) if val is not None else None
    except (TypeError, ValueError):
        v = val
    if v is not None and "." in str(v) and str(v).rstrip("0").endswith("."):
        v = int(v)
    if v is not None:
        return f"{field} {op} {v}"
    return f"{field} {op}"


def _alert_to_response(
    alert: Alert,
    ticker_symbol: Optional[str] = None,
) -> dict:
    cond_val = alert.condition_value
    cv = float(cond_val) if cond_val is not None else None
    return {
        "id": str(alert.id),
        "target_type": alert.target_type,
        "target_id": str(alert.target_id) if alert.target_id else None,
        "ticker_id": str(alert.ticker_id) if alert.ticker_id else None,
        "ticker_symbol": ticker_symbol,
        "alert_type": (
            alert.alert_type.value
            if hasattr(alert.alert_type, "value")
            else str(alert.alert_type)
        ),
        "priority": (
            alert.priority.value
            if hasattr(alert.priority, "value")
            else str(alert.priority)
        ),
        "condition_field": alert.condition_field,
        "condition_operator": alert.condition_operator,
        "condition_value": cv,
        "condition_summary": _condition_summary(
            alert.condition_field,
            alert.condition_operator,
            alert.condition_value,
        ),
        "title": alert.title,
        "message": alert.message,
        "is_active": alert.is_active,
        "is_triggered": alert.is_triggered,
        "triggered_at": alert.triggered_at,
        "expires_at": alert.expires_at,
        "created_at": alert.created_at,
        "updated_at": alert.updated_at,
    }


class AlertsService:
    _instance: Optional["AlertsService"] = None

    @classmethod
    def get_instance(cls) -> "AlertsService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def list_alerts(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        target_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 25,
        sort: str = "created_at",
        order: str = "desc",
    ) -> Tuple[List[dict], int]:
        base = and_(Alert.user_id == user_id, Alert.deleted_at.is_(None))
        if target_type and target_type in VALID_TARGET_TYPES:
            base = and_(base, Alert.target_type == target_type)

        count_stmt = select(func.count()).select_from(Alert).where(base)
        total = (await db.execute(count_stmt)).scalar() or 0

        sort_col = getattr(Alert, sort, Alert.created_at)
        if order == "asc":
            order_clause = sort_col.asc()
        else:
            order_clause = sort_col.desc()

        offset = max(0, (page - 1) * per_page)
        per_page = min(max(1, per_page), 100)

        stmt = (
            select(Alert, Ticker.symbol)
            .outerjoin(Ticker, Alert.ticker_id == Ticker.id)
            .where(base)
            .order_by(order_clause)
            .offset(offset)
            .limit(per_page)
        )
        result = await db.execute(stmt)
        rows = result.all()

        data = [
            _alert_to_response(row[0], ticker_symbol=row[1] if row[1] else None)
            for row in rows
        ]
        return data, total

    async def get_alerts_summary(self, db: AsyncSession, user_id: uuid.UUID) -> dict:
        base = and_(Alert.user_id == user_id, Alert.deleted_at.is_(None))

        total_stmt = select(func.count()).select_from(Alert).where(base)
        total = (await db.execute(total_stmt)).scalar() or 0

        active_stmt = select(func.count()).select_from(Alert).where(
            and_(base, Alert.is_active.is_(True))
        )
        active = (await db.execute(active_stmt)).scalar() or 0

        triggered_stmt = select(func.count()).select_from(Alert).where(
            and_(base, Alert.is_triggered.is_(True))
        )
        triggered = (await db.execute(triggered_stmt)).scalar() or 0

        cutoff = datetime.now(timezone.utc) - timedelta(days=NEW_ALERTS_DAYS)
        new_stmt = select(func.count()).select_from(Alert).where(
            and_(base, Alert.created_at >= cutoff)
        )
        new_alerts = (await db.execute(new_stmt)).scalar() or 0

        return {
            "total_alerts": total,
            "active_alerts": active,
            "new_alerts": new_alerts,
            "triggered_alerts": triggered,
        }

    async def get_alert(
        self,
        db: AsyncSession,
        alert_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[dict]:
        stmt = (
            select(Alert, Ticker.symbol)
            .outerjoin(Ticker, Alert.ticker_id == Ticker.id)
            .where(
                and_(
                    Alert.id == alert_id,
                    Alert.user_id == user_id,
                    Alert.deleted_at.is_(None),
                )
            )
        )
        result = await db.execute(stmt)
        row = result.one_or_none()
        if not row:
            return None
        return _alert_to_response(row[0], ticker_symbol=row[1] if row[1] else None)

    async def create_alert(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        data: dict,
    ) -> dict:
        target_type = (data.get("target_type") or "general").lower()
        if target_type not in VALID_TARGET_TYPES:
            target_type = "general"

        alert_type_val = (data.get("alert_type") or "PRICE").upper()
        if alert_type_val not in VALID_ALERT_TYPES:
            alert_type_val = "PRICE"
        alert_type = AlertType(alert_type_val)

        priority_val = (data.get("priority") or "MEDIUM").upper()
        if priority_val not in VALID_PRIORITIES:
            priority_val = "MEDIUM"
        priority = AlertPriority(priority_val)

        target_id = None
        if data.get("target_id"):
            try:
                target_id = uuid.UUID(data["target_id"])
            except (ValueError, TypeError):
                pass

        ticker_id = None
        if data.get("ticker_id"):
            try:
                ticker_id = uuid.UUID(data["ticker_id"])
            except (ValueError, TypeError):
                pass

        cond_val = data.get("condition_value")
        if cond_val is not None:
            try:
                cond_val = Decimal(str(cond_val))
            except Exception:
                cond_val = None

        alert = Alert(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            ticker_id=ticker_id,
            alert_type=alert_type,
            priority=priority,
            condition_field=data.get("condition_field"),
            condition_operator=data.get("condition_operator"),
            condition_value=cond_val,
            title=data.get("title", ""),
            message=data.get("message"),
            is_active=data.get("is_active", True),
            expires_at=data.get("expires_at"),
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(alert)
        await db.flush()
        await db.refresh(alert)
        ticker_symbol = None
        if alert.ticker_id:
            ticker_stmt = select(Ticker.symbol).where(Ticker.id == alert.ticker_id)
            ticker_res = await db.execute(ticker_stmt)
            sym = ticker_res.scalar_one_or_none()
            ticker_symbol = sym
        return _alert_to_response(alert, ticker_symbol=ticker_symbol)

    async def update_alert(
        self,
        db: AsyncSession,
        alert_id: uuid.UUID,
        user_id: uuid.UUID,
        data: dict,
    ) -> Optional[dict]:
        stmt = select(Alert).where(
            and_(
                Alert.id == alert_id,
                Alert.user_id == user_id,
                Alert.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        alert = result.scalar_one_or_none()
        if not alert:
            return None

        if "is_active" in data:
            alert.is_active = bool(data["is_active"])
        if "title" in data:
            alert.title = data["title"]
        if "message" in data:
            alert.message = data.get("message")
        if "condition_field" in data:
            alert.condition_field = data.get("condition_field")
        if "condition_operator" in data:
            alert.condition_operator = data.get("condition_operator")
        if "condition_value" in data:
            v = data.get("condition_value")
            alert.condition_value = Decimal(str(v)) if v is not None else None
        if "expires_at" in data:
            alert.expires_at = data.get("expires_at")

        alert.updated_by = user_id
        alert.updated_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(alert)

        ticker_symbol = None
        if alert.ticker_id:
            ticker_stmt = select(Ticker.symbol).where(Ticker.id == alert.ticker_id)
            ticker_res = await db.execute(ticker_stmt)
            ticker_symbol = ticker_res.scalar_one_or_none()
        return _alert_to_response(alert, ticker_symbol=ticker_symbol)

    async def delete_alert(
        self,
        db: AsyncSession,
        alert_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> bool:
        from datetime import datetime, timezone
        stmt = select(Alert).where(
            and_(
                Alert.id == alert_id,
                Alert.user_id == user_id,
                Alert.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        alert = result.scalar_one_or_none()
        if not alert:
            return False
        alert.deleted_at = datetime.now(timezone.utc)
        alert.updated_by = user_id
        await db.flush()
        return True


def get_alerts_service() -> AlertsService:
    return AlertsService.get_instance()
