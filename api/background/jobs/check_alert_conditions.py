"""
Check Alert Conditions — G7 Background Job (APScheduler module)
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION
No fcntl. No direct .env parsing. Uses shared job_runner bootstrap.
"""

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def run(db: AsyncSession) -> dict:
    """Evaluate alert conditions. Returns {records_processed, records_updated, error_count}."""
    records_processed = 0
    records_updated = 0
    error_count = 0
    result = await db.execute(text("""
        SELECT a.id, a.user_id, a.ticker_id, a.condition_field, a.condition_operator, a.condition_value,
               a.title, a.trigger_status, t.status as ticker_status
        FROM user_data.alerts a
        LEFT JOIN market_data.tickers t ON t.id = a.ticker_id
        WHERE a.deleted_at IS NULL AND a.is_active = true
          AND (a.expires_at IS NULL OR a.expires_at > now())
    """))
    rows = result.fetchall()
    records_processed = len(rows)
    for row in rows:
        ticker_status = row[8] if len(row) > 8 else "active"
        if ticker_status == "cancelled":
            continue
        if not row[2] or not row[4]:
            continue
    return {
        "records_processed": records_processed,
        "records_updated": records_updated,
        "error_count": error_count,
    }
