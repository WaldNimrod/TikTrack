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
from ..models.trades import Trade
from ..models.trade_plans import TradePlan
from ..models.trading_accounts import TradingAccount
from ..models.enums import AlertType, AlertPriority


# G7R Stream1: general removed; datetime added
VALID_TARGET_TYPES = frozenset(("ticker", "trade", "trade_plan", "account", "datetime"))
VALID_TRIGGER_STATUS = frozenset(("untriggered", "triggered_unread", "triggered_read", "rearmed"))
VALID_ALERT_TYPES = frozenset(("PRICE", "VOLUME", "TECHNICAL", "NEWS", "CUSTOM"))
VALID_PRIORITIES = frozenset(("LOW", "MEDIUM", "HIGH", "CRITICAL"))
NEW_ALERTS_DAYS = 10


async def _resolve_target_display_names(
    db: AsyncSession,
    alerts: List[Alert],
    user_id: uuid.UUID,
) -> dict:
    """G7R Batch2/3: Resolve target_id -> display name for trade, trade_plan, account; datetime -> formatted."""
    out = {}
    trade_ids = []
    plan_ids = []
    account_ids = []
    for a in alerts:
        if not a.target_id:
            continue
        if a.target_type == "trade":
            trade_ids.append(a.target_id)
        elif a.target_type == "trade_plan":
            plan_ids.append(a.target_id)
        elif a.target_type == "account":
            account_ids.append(a.target_id)
    if trade_ids:
        stmt = (
            select(Trade.id, Ticker.symbol, Trade.direction)
            .join(Ticker, Trade.ticker_id == Ticker.id)
            .where(Trade.id.in_(trade_ids), Trade.user_id == user_id)
        )
        res = await db.execute(stmt)
        for row in res.all():
            out[("trade", row[0])] = f"{row[1] or '?'} {row[2] or ''}".strip()
    if plan_ids:
        stmt = select(TradePlan.id, TradePlan.plan_name).where(
            TradePlan.id.in_(plan_ids), TradePlan.user_id == user_id
        )
        res = await db.execute(stmt)
        for row in res.all():
            out[("trade_plan", row[0])] = row[1] or str(row[0])
    if account_ids:
        stmt = select(TradingAccount.id, TradingAccount.account_name).where(
            TradingAccount.id.in_(account_ids), TradingAccount.user_id == user_id
        )
        res = await db.execute(stmt)
        for row in res.all():
            out[("account", row[0])] = row[1] or str(row[0])
    return out


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
    target_display_name: Optional[str] = None,
) -> dict:
    """BF-G7-012: Returns linked entity type (target_type) + record name (ticker_symbol/target_display_name)."""
    cond_val = alert.condition_value
    cv = float(cond_val) if cond_val is not None else None
    # BF-G7-012: datetime has no target_id; use formatted target_datetime as display
    if alert.target_type == "datetime" and getattr(alert, "target_datetime", None) and not target_display_name:
        dt_val = alert.target_datetime
        target_display_name = dt_val.strftime("%Y-%m-%d %H:%M UTC") if hasattr(dt_val, "strftime") else str(dt_val)
    return {
        "id": str(alert.id),
        "target_type": alert.target_type or None,
        "target_datetime": getattr(alert, "target_datetime", None),
        "target_id": str(alert.target_id) if alert.target_id else None,
        "ticker_id": str(alert.ticker_id) if alert.ticker_id else None,
        "ticker_symbol": ticker_symbol,
        "target_display_name": target_display_name,
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
        "trigger_status": getattr(alert, "trigger_status", None) or ("triggered_unread" if alert.is_triggered else "untriggered"),
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
        ticker_id: Optional[uuid.UUID] = None,
        is_active: Optional[bool] = None,
        trigger_status: Optional[str] = None,
        page: int = 1,
        per_page: int = 25,
        sort: str = "created_at",
        order: str = "desc",
    ) -> Tuple[List[dict], int]:
        base = and_(Alert.user_id == user_id, Alert.deleted_at.is_(None))
        if target_type and target_type in VALID_TARGET_TYPES:
            base = and_(base, Alert.target_type == target_type)
        if ticker_id is not None:
            base = and_(base, Alert.ticker_id == ticker_id)
        if is_active is not None:
            base = and_(base, Alert.is_active.is_(is_active))
        if trigger_status is not None and trigger_status in VALID_TRIGGER_STATUS:
            base = and_(base, Alert.trigger_status == trigger_status)

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
        alert_objs = [row[0] for row in rows]
        display_map = await _resolve_target_display_names(db, alert_objs, user_id) if alert_objs else {}

        data = []
        for row in rows:
            alert, ticker_sym = row[0], row[1] if row[1] else None
            tdn = None
            if alert.target_type and alert.target_id:
                tdn = display_map.get((alert.target_type, alert.target_id))
            data.append(
                _alert_to_response(alert, ticker_symbol=ticker_sym, target_display_name=tdn)
            )
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
        alert, ticker_sym = row[0], row[1] if row[1] else None
        tdn = None
        if alert.target_type and alert.target_id:
            display_map = await _resolve_target_display_names(db, [alert], user_id)
            tdn = display_map.get((alert.target_type, alert.target_id))
        return _alert_to_response(alert, ticker_symbol=ticker_sym, target_display_name=tdn)

    async def create_alert(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        data: dict,
    ) -> dict:
        # BF-G7-017: target_type required; BF-G7-014: reject 'general'
        target_type_raw = data.get("target_type")
        target_type = (target_type_raw.strip().lower() if isinstance(target_type_raw, str) and target_type_raw.strip() else None) or None
        if not target_type:
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(status_code=422, detail="target_type is required (ticker, trade, trade_plan, account, or datetime)", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
        if target_type == "general":
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(status_code=422, detail="target_type 'general' is not allowed", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
        if target_type not in VALID_TARGET_TYPES:
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(status_code=422, detail=f"target_type must be one of {sorted(VALID_TARGET_TYPES)}", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)

        # Validation: datetime type requires target_datetime; entity type requires target_id (or ticker_id for ticker)
        target_datetime = data.get("target_datetime")
        target_id = data.get("target_id")
        ticker_id_val = data.get("ticker_id")
        if target_type == "datetime":
            if not target_datetime:
                from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                raise HTTPExceptionWithCode(
                    status_code=422,
                    detail="target_datetime required when target_type=datetime",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            target_id = None
        elif target_type in ("ticker", "trade", "trade_plan", "account"):
            if target_datetime:
                from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                raise HTTPExceptionWithCode(
                    status_code=422,
                    detail="target_datetime not allowed when target_type is entity; use target_id or ticker_id",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            if target_type == "ticker" and not data.get("ticker_id") and not data.get("target_id"):
                from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                raise HTTPExceptionWithCode(
                    status_code=422,
                    detail="ticker_id or target_id required when target_type=ticker",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            if target_type != "ticker" and not target_id:
                from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                raise HTTPExceptionWithCode(
                    status_code=422,
                    detail="target_id required when target_type is trade, trade_plan, or account",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )

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

        target_datetime_val = data.get("target_datetime")
        if target_datetime_val and isinstance(target_datetime_val, str):
            try:
                from datetime import datetime as dt
                target_datetime_val = dt.fromisoformat(target_datetime_val.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                target_datetime_val = None

        cond_val = data.get("condition_value")
        if cond_val is not None:
            try:
                cond_val = Decimal(str(cond_val))
            except Exception:
                cond_val = None

        # BF-G7-015: Sanitize rich-text message (HTML allowed, sanitized per SOP-012)
        message_raw = data.get("message")
        message_sanitized = None
        if message_raw:
            try:
                from ..utils.rich_text_sanitizer import sanitize_rich_text
                message_sanitized = sanitize_rich_text(str(message_raw))
            except Exception:
                message_sanitized = str(message_raw)[:10000]  # fallback: truncate plain text

        alert = Alert(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            ticker_id=ticker_id,
            target_datetime=target_datetime_val,
            alert_type=alert_type,
            priority=priority,
            condition_field=data.get("condition_field"),
            condition_operator=data.get("condition_operator"),
            condition_value=cond_val,
            title=data.get("title", ""),
            message=message_sanitized,
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
            ticker_symbol = ticker_res.scalar_one_or_none()
        tdn = None
        if alert.target_type and alert.target_id and alert.target_type in ("trade", "trade_plan", "account"):
            display_map = await _resolve_target_display_names(db, [alert], user_id)
            tdn = display_map.get((alert.target_type, alert.target_id))
        return _alert_to_response(alert, ticker_symbol=ticker_symbol, target_display_name=tdn)

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

        # BF-G7-018: Apply linked_entity change (target_type, target_id, ticker_id, target_datetime)
        if "target_type" in data or "target_id" in data or "ticker_id" in data or "target_datetime" in data:
            target_type_raw = data.get("target_type", alert.target_type)
            target_type = (target_type_raw.strip().lower() if isinstance(target_type_raw, str) and target_type_raw.strip() else alert.target_type) or None
            if target_type and target_type not in VALID_TARGET_TYPES:
                target_type = alert.target_type
            if target_type == "general":
                from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                raise HTTPExceptionWithCode(status_code=422, detail="target_type 'general' is not allowed.", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)

            if target_type == "datetime":
                target_datetime_val = data.get("target_datetime")
                if target_datetime_val and isinstance(target_datetime_val, str):
                    try:
                        from datetime import datetime as dt
                        target_datetime_val = dt.fromisoformat(target_datetime_val.replace("Z", "+00:00"))
                    except (ValueError, TypeError):
                        target_datetime_val = None
                if not target_datetime_val:
                    from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                    raise HTTPExceptionWithCode(status_code=422, detail="target_datetime required when target_type=datetime", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
                alert.target_type = target_type
                alert.target_id = None
                alert.ticker_id = None
                alert.target_datetime = target_datetime_val
            elif target_type in ("ticker", "trade", "trade_plan", "account"):
                ticker_id_val = None
                if data.get("ticker_id"):
                    try:
                        ticker_id_val = uuid.UUID(data["ticker_id"])
                    except (ValueError, TypeError):
                        pass
                target_id_val = None
                if data.get("target_id"):
                    try:
                        target_id_val = uuid.UUID(data["target_id"])
                    except (ValueError, TypeError):
                        pass
                if target_type == "ticker" and not ticker_id_val and not target_id_val:
                    from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                    raise HTTPExceptionWithCode(status_code=422, detail="ticker_id or target_id required when target_type=ticker", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
                if target_type != "ticker" and not target_id_val:
                    from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                    raise HTTPExceptionWithCode(status_code=422, detail="target_id required when target_type is trade, trade_plan, or account", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
                alert.target_type = target_type
                alert.target_id = target_id_val
                alert.ticker_id = ticker_id_val
                alert.target_datetime = None

        if "is_active" in data:
            alert.is_active = bool(data["is_active"])
        if "trigger_status" in data:
            ts = data.get("trigger_status")
            if ts in VALID_TRIGGER_STATUS:
                alert.trigger_status = ts
                if ts in ("untriggered", "rearmed"):
                    alert.is_triggered = False
        if "title" in data:
            alert.title = data["title"]
        if "message" in data:
            msg_raw = data.get("message")
            if msg_raw:
                try:
                    from ..utils.rich_text_sanitizer import sanitize_rich_text
                    alert.message = sanitize_rich_text(str(msg_raw))
                except Exception:
                    alert.message = str(msg_raw)[:10000]
            else:
                alert.message = None
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
        tdn = None
        if alert.target_type and alert.target_id and alert.target_type in ("trade", "trade_plan", "account"):
            display_map = await _resolve_target_display_names(db, [alert], user_id)
            tdn = display_map.get((alert.target_type, alert.target_id))
        return _alert_to_response(alert, ticker_symbol=ticker_symbol, target_display_name=tdn)

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
