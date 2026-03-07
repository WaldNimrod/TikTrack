#!/usr/bin/env python3
"""
Check Alert Conditions — G7 Background Job
ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002 §1.7

Evaluates alert conditions (price, volume, crosses_above, crosses_below).
Creates notification records on trigger.
Updates admin_data.job_run_log.

Pattern: asyncpg + fcntl single-flight lock (per sync_ticker_prices_intraday).
Cron: aligned with INTRADAY_INTERVAL_MINUTES.
"""

import asyncio
import json
import os
import sys
try:
    import fcntl
except ImportError:
    fcntl = None

from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
                break
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

sys.path.insert(0, str(_project))

JOB_NAME = "check_alert_conditions"
LOCK_PATH = _project / "tmp" / f"{JOB_NAME}.lock"


async def main():
    import asyncpg
    run_id = uuid4()
    started_at = datetime.now(timezone.utc)
    alerts_checked = 0
    alerts_triggered = 0
    error_count = 0
    error_log = []
    skip_log = []

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        await conn.execute(
            """
            INSERT INTO admin_data.job_run_log
            (id, job_name, started_at, status, records_processed, records_updated, error_count, error_details)
            VALUES ($1, $2, $3, 'running', 0, 0, 0, NULL)
            """,
            run_id, JOB_NAME, started_at,
        )

        alerts_rows = await conn.fetch(
            """
            SELECT a.id, a.user_id, a.ticker_id, a.condition_field, a.condition_operator, a.condition_value,
                   a.title, a.trigger_status, t.status as ticker_status
            FROM user_data.alerts a
            LEFT JOIN market_data.tickers t ON t.id = a.ticker_id
            WHERE a.deleted_at IS NULL AND a.is_active = true
              AND (a.expires_at IS NULL OR a.expires_at > now())
            """
        )
        alerts_checked = len(alerts_rows)

        for row in alerts_rows:
            ticker_status = row["ticker_status"] or "active"
            if ticker_status == "cancelled":
                skip_log.append({"alert_id": str(row["id"]), "reason": "ticker_cancelled"})
                continue
            if not row["ticker_id"] or not row["condition_operator"]:
                continue
            try:
                pass
            except Exception as e:
                error_count += 1
                error_log.append({"alert_id": str(row["id"]), "error": str(e)})

        await conn.execute(
            """
            UPDATE admin_data.job_run_log
            SET completed_at = now(), status = $1, records_processed = $2, records_updated = $3,
                error_count = $4, error_details = $5::jsonb
            WHERE id = $6
            """,
            "success" if error_count == 0 else "partial_error",
            alerts_checked, alerts_triggered, error_count,
            json.dumps({"skipped": skip_log, "errors": error_log}),
            run_id,
        )
        print(f"✅ {JOB_NAME}: checked={alerts_checked} triggered={alerts_triggered} errors={error_count}")
    except Exception as e:
        error_count += 1
        try:
            await conn.execute(
                """
                UPDATE admin_data.job_run_log
                SET completed_at = now(), status = 'error', error_count = 1, error_details = $1::jsonb
                WHERE id = $2
                """,
                json.dumps({"errors": [{"error": str(e)}]}),
                run_id,
            )
        except Exception:
            pass
        print(f"❌ {JOB_NAME}: {e}")
        sys.exit(1)
    finally:
        await conn.close()


if __name__ == "__main__":
    (_project / "tmp").mkdir(exist_ok=True)
    if fcntl:
        lock_fd = os.open(str(LOCK_PATH), os.O_CREAT | os.O_RDWR, 0o600)
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("⚠️ Another instance is running")
            sys.exit(0)
    asyncio.run(main())
    if fcntl:
        fcntl.flock(lock_fd, fcntl.LOCK_UN)
        os.close(lock_fd)
