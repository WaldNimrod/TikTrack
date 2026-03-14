"""
Check Alert Conditions — G7 Background Job (APScheduler module)
ARCHITECT_DIRECTIVE_G7_REMEDIATION §1.7, GAP E
Phase C: Full evaluation + crosses_above/crosses_below + notification insert

No fcntl. No direct .env parsing. Uses shared job_runner bootstrap.
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

logger = logging.getLogger(__name__)

VALID_CONDITION_FIELDS = frozenset(
    ("price", "open_price", "high_price", "low_price", "close_price", "volume", "market_cap")
)


def _get_price_table(ticker_status: Optional[str]) -> Optional[str]:
    """active → intraday; pending/inactive → ticker_prices; cancelled → skip."""
    if ticker_status == "cancelled":
        return None
    if ticker_status == "active":
        return "ticker_prices_intraday"
    return "ticker_prices"


def _evaluate_condition(
    current_val: Optional[float], prev_val: Optional[float], operator: str, threshold: float
) -> bool:
    """Returns True if condition is met. For crosses: requires both current_val and prev_val."""
    if current_val is None:
        return False
    if operator in (">", "<", ">=", "<=", "="):
        if operator == ">":
            return current_val > threshold
        if operator == "<":
            return current_val < threshold
        if operator == ">=":
            return current_val >= threshold
        if operator == "<=":
            return current_val <= threshold
        if operator == "=":
            return abs(current_val - threshold) < 1e-8
    if operator in ("crosses_above", "crosses_below"):
        if prev_val is None:
            return False
        if operator == "crosses_above":
            return prev_val < threshold <= current_val
        if operator == "crosses_below":
            return prev_val > threshold >= current_val
    return False


async def run(db: AsyncSession) -> dict:
    """Evaluate alert conditions. Update trigger_status, insert notifications."""
    records_processed = 0
    records_updated = 0
    error_count = 0

    result = await db.execute(
        text(
            """
        SELECT a.id, a.user_id, a.ticker_id, a.condition_field, a.condition_operator, a.condition_value,
               a.title, a.trigger_status, t.status as ticker_status, t.symbol as ticker_symbol
        FROM user_data.alerts a
        LEFT JOIN market_data.tickers t ON t.id = a.ticker_id
        WHERE a.deleted_at IS NULL AND a.is_active = true
          AND (a.expires_at IS NULL OR a.expires_at > now())
          AND a.condition_field IS NOT NULL AND a.condition_operator IS NOT NULL
    """
        )
    )
    rows = result.fetchall()
    records_processed = len(rows)

    for row in rows:
        (
            alert_id,
            user_id,
            ticker_id,
            cond_field,
            cond_op,
            cond_val,
            title,
            trigger_status,
            ticker_status,
            ticker_symbol,
        ) = (row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9])
        if not ticker_id or ticker_status == "cancelled":
            continue
        if cond_field not in VALID_CONDITION_FIELDS:
            continue

        table = _get_price_table(ticker_status)
        if not table:
            continue

        try:
            threshold = float(cond_val) if cond_val is not None else 0.0
        except (TypeError, ValueError):
            continue

        readings = await db.execute(
            text(
                f"""
                SELECT {cond_field}
                FROM market_data.{table}
                WHERE ticker_id = :tid AND {cond_field} IS NOT NULL
                ORDER BY price_timestamp DESC
                LIMIT 2
            """
            ),
            {"tid": str(ticker_id)},
        )
        reading_rows = readings.fetchall()
        current_val = (
            float(reading_rows[0][0])
            if len(reading_rows) >= 1 and reading_rows[0][0] is not None
            else None
        )
        prev_val = (
            float(reading_rows[1][0])
            if len(reading_rows) >= 2 and reading_rows[1][0] is not None
            else None
        )

        if cond_op in ("crosses_above", "crosses_below") and prev_val is None:
            continue

        if not _evaluate_condition(current_val, prev_val, cond_op, threshold):
            continue

        if trigger_status in ("triggered_unread", "triggered_read"):
            continue

        now = datetime.now(timezone.utc)
        sym = ticker_symbol or "?"
        msg = f"{cond_field} {cond_op} {threshold}"
        notification_title = f"{sym} {msg}" if len(title or "") < 10 else title

        await db.execute(
            text(
                """
                UPDATE user_data.alerts
                SET trigger_status = 'triggered_unread', triggered_at = :now,
                    is_triggered = true, updated_at = :now
                WHERE id = :aid
            """
            ),
            {"aid": str(alert_id), "now": now},
        )
        await db.execute(
            text(
                """
                INSERT INTO user_data.notifications (id, user_id, alert_id, type, title, message)
                VALUES (:id, :uid, :aid, 'alert_trigger', :title, :msg)
            """
            ),
            {
                "id": uuid4(),
                "uid": str(user_id),
                "aid": str(alert_id),
                "title": notification_title,
                "msg": msg,
            },
        )
        records_updated += 1

    await db.commit()
    return {
        "records_processed": records_processed,
        "records_updated": records_updated,
        "error_count": error_count,
    }
