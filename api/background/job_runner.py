"""
Job Runner — Shared Bootstrap (Iron Rule: no .env parsing here)
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION §2.3, §2.4

Single-flight: DB-based lock via job_run_log. No fcntl.
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Callable, Awaitable
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

logger = logging.getLogger(__name__)

STALE_LOCK_MINUTES = 30
STALE_RUNNING_MINUTES = 5  # Mark 'running' older than this as 'timeout' (orphaned from reload/kill)


async def run_job(
    job_name: str,
    job_fn: Callable[[AsyncSession], Awaitable[dict]],
    db: AsyncSession,
    runtime_class: str = "TARGET_RUNTIME",
) -> dict:
    """
    Shared job runner: single-flight check, insert run, call job_fn, update run.
    Uses FastAPI's DB pool — no .env parsing.
    """
    run_id = uuid4()
    started_at = datetime.now(timezone.utc)
    result = {"run_id": str(run_id), "status": "running", "exit_code": 0}
    try:
        # Clear orphaned 'running' rows (from reload/kill) so they don't block new runs
        await db.execute(
            text("""
                UPDATE admin_data.job_run_log
                SET status = 'timeout', completed_at = NOW()
                WHERE job_name = :job_name AND status = 'running'
                  AND started_at < NOW() - make_interval(mins => :mins)
            """),
            {"job_name": job_name, "mins": STALE_RUNNING_MINUTES},
        )
        await db.commit()

        stale_check = await db.execute(
            text("""
                SELECT id FROM admin_data.job_run_log
                WHERE job_name = :job_name AND status = 'running'
                  AND started_at > NOW() - INTERVAL '30 minutes'
                LIMIT 1
            """),
            {"job_name": job_name},
        )
        if stale_check.scalar() is not None:
            await db.execute(
                text("""
                    INSERT INTO admin_data.job_run_log
                    (id, job_name, started_at, completed_at, status, runtime_class, exit_code)
                    VALUES (:id, :job_name, :started, NOW(), 'skipped_concurrent', :runtime_class, 0)
                """),
                {
                    "id": run_id,
                    "job_name": job_name,
                    "started": started_at,
                    "runtime_class": runtime_class,
                },
            )
            await db.commit()
            result["status"] = "skipped_concurrent"
            return result

        await db.execute(
            text("""
                INSERT INTO admin_data.job_run_log
                (id, job_name, started_at, status, runtime_class, records_processed)
                VALUES (:id, :job_name, :started, 'running', :runtime_class, 0)
            """),
            {
                "id": run_id,
                "job_name": job_name,
                "started": started_at,
                "runtime_class": runtime_class,
            },
        )
        await db.commit()

        job_result = await job_fn(db)
        completed_at = datetime.now(timezone.utc)
        duration_ms = int((completed_at - started_at).total_seconds() * 1000)
        records_processed = job_result.get("records_processed", 0)
        records_updated = job_result.get("records_updated", 0)
        error_count = job_result.get("error_count", 0)
        status = "completed" if error_count == 0 else "failed"
        exit_code = 0 if error_count == 0 else 1

        await db.execute(
            text("""
                UPDATE admin_data.job_run_log
                SET completed_at = :completed, status = :status, exit_code = :exit_code,
                    duration_ms = :duration_ms, records_processed = :records_processed,
                    records_updated = :records_updated, error_count = :error_count
                WHERE id = :id
            """),
            {
                "id": run_id,
                "completed": completed_at,
                "status": status,
                "exit_code": exit_code,
                "duration_ms": duration_ms,
                "records_processed": records_processed,
                "records_updated": records_updated,
                "error_count": error_count,
            },
        )
        await db.commit()
        result.update({"status": status, "exit_code": exit_code, "duration_ms": duration_ms})
    except Exception as e:
        logger.exception("Job %s failed: %s", job_name, e)
        completed_at = datetime.now(timezone.utc)
        duration_ms = int((completed_at - started_at).total_seconds() * 1000)
        try:
            await db.execute(
                text("""
                    UPDATE admin_data.job_run_log
                    SET completed_at = :completed, status = 'failed', exit_code = 1,
                        duration_ms = :duration_ms, error_class = :err_cls
                    WHERE id = :id
                """),
                {
                    "id": run_id,
                    "completed": completed_at,
                    "duration_ms": duration_ms,
                    "err_cls": type(e).__name__,
                },
            )
            await db.commit()
        except Exception:
            await db.rollback()
        result["status"] = "failed"
        result["exit_code"] = 1
    return result
