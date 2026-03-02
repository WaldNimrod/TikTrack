"""
Background Jobs — Admin Control Plane
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION §4.3

Endpoints: health, list, runs, detail, history, trigger, toggle, analytics.
"""

import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

from ..core.database import get_db
from ..utils.dependencies import require_admin_role
from ..models.identity import User

router = APIRouter(prefix="/admin/background-jobs", tags=["background-jobs"])
logger = logging.getLogger(__name__)


@router.get("/health", response_model=dict)
async def health_check(
    current_user: User = Depends(require_admin_role),
):
    """Lightweight health — scheduler alive. No job_run_log query. Fast path for responsiveness checks."""
    from ..background.scheduler_startup import get_scheduler
    sched = get_scheduler()
    return {
        "status": "ok",
        "scheduler_active": sched is not None,
        "jobs_registered": len(sched.get_jobs()) if sched else 0,
    }


@router.get("", response_model=dict)
async def list_jobs(
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """List all registered jobs + last run status. Single batch query for responsiveness."""
    from ..background.scheduler_registry import JOB_REGISTRY
    from ..background.scheduler_startup import get_scheduler

    sched = get_scheduler()
    last_runs = {}
    try:
        result = await db.execute(
            text("""
                SELECT DISTINCT ON (job_name) job_name, status, started_at, duration_ms, records_processed
                FROM admin_data.job_run_log
                ORDER BY job_name, started_at DESC
            """)
        )
        for row in result.fetchall():
            last_runs[row[0]] = {"status": row[1], "started_at": row[2], "duration_ms": row[3], "records_processed": row[4]}
    except ProgrammingError as e:
        logger.warning("job_run_log not available: %s", e)
    except Exception as e:
        logger.warning("list_jobs job_run_log query failed: %s", e)

    jobs = []
    for cfg in JOB_REGISTRY:
        job_id = cfg["job_name"]
        lr = last_runs.get(job_id, {})
        jobs.append({
            "job_name": job_id,
            "description": cfg.get("description", ""),
            "enabled": cfg.get("enabled_default", True),
            "is_scheduled": bool(sched and sched.get_job(job_id)),
            "last_run_at": lr.get("started_at").isoformat() if lr.get("started_at") else None,
            "last_status": lr.get("status"),
            "last_duration_ms": lr.get("duration_ms"),
            "last_records_processed": lr.get("records_processed"),
        })
    return {"jobs": jobs, "total": len(jobs)}


@router.get("/runs", response_model=dict)
async def list_runs(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Recent runs across all jobs. Fast single-query path."""
    try:
        result = await db.execute(
            text("""
                SELECT job_name, id, started_at, completed_at, status, runtime_class, duration_ms, records_processed
                FROM admin_data.job_run_log
                ORDER BY started_at DESC
                LIMIT :limit
            """),
            {"limit": limit},
        )
        rows = result.fetchall()
        items = [
            {
                "job_name": r[0],
                "id": str(r[1]),
                "started_at": r[2].isoformat() if r[2] else None,
                "status": r[4],
                "runtime_class": r[5],
                "duration_ms": r[6],
            }
            for r in rows
        ]
        return {"items": items, "count": len(items)}
    except (ProgrammingError, Exception) as e:
        logger.warning("runs query failed: %s", e)
        return {"items": [], "count": 0}


@router.get("/analytics", response_model=dict)
async def get_analytics(
    period: str = Query("1d", description="1d|7d|30d"),
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Aggregate stats for period."""
    hours = {"1d": 24, "7d": 168, "30d": 720}.get(period, 24)
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    try:
        result = await db.execute(
            text("""
                SELECT job_name, COUNT(*),
                       COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0),
                       COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0)
                FROM admin_data.job_run_log
                WHERE started_at > :cutoff
                GROUP BY job_name
            """),
            {"cutoff": cutoff},
        )
        rows = result.fetchall()
        by_job = {r[0]: {"total": r[1], "completed": r[2] or 0, "failed": r[3] or 0} for r in rows}
    except (ProgrammingError, Exception) as e:
        logger.warning("analytics query failed: %s", e)
        by_job = {}
    return {"period": period, "by_job": by_job}


@router.get("/{job_name}", response_model=dict)
async def get_job_detail(
    job_name: str,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Single job detail + 24h run history."""
    from ..background.scheduler_registry import JOB_REGISTRY
    cfg = next((j for j in JOB_REGISTRY if j["job_name"] == job_name), None)
    if not cfg:
        raise HTTPException(status_code=404, detail="Job not found")

    try:
        result = await db.execute(
            text("""
                SELECT id, started_at, completed_at, status, duration_ms, records_processed, records_updated, error_count
                FROM admin_data.job_run_log
                WHERE job_name = :job_name AND started_at > NOW() - INTERVAL '24 hours'
                ORDER BY started_at DESC
                LIMIT 20
            """),
            {"job_name": job_name},
        )
        rows = result.fetchall()
    except (ProgrammingError, Exception) as e:
        logger.warning("get_job_detail query failed: %s", e)
        rows = []
    history = [
        {
            "id": str(r[0]),
            "started_at": r[1].isoformat() if r[1] else None,
            "completed_at": r[2].isoformat() if r[2] else None,
            "status": r[3],
            "duration_ms": r[4],
            "records_processed": r[5],
            "records_updated": r[6],
            "error_count": r[7],
        }
        for r in rows
    ]
    return {"job_name": job_name, "description": cfg.get("description", ""), "history": history}


@router.get("/{job_name}/history", response_model=dict)
async def get_job_history(
    job_name: str,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Paginated run history."""
    try:
        result = await db.execute(
            text("""
                SELECT id, started_at, completed_at, status, duration_ms, records_processed, error_count
                FROM admin_data.job_run_log
                WHERE job_name = :job_name
                ORDER BY started_at DESC
                LIMIT :limit
            """),
            {"job_name": job_name, "limit": limit},
        )
        rows = result.fetchall()
    except (ProgrammingError, Exception) as e:
        logger.warning("get_job_history query failed: %s", e)
        rows = []
    items = [
        {
            "id": str(r[0]),
            "started_at": r[1].isoformat() if r[1] else None,
            "status": r[3],
            "duration_ms": r[4],
            "records_processed": r[5],
            "error_count": r[6],
        }
        for r in rows
    ]
    return {"job_name": job_name, "items": items}


@router.post("/{job_name}/trigger", response_model=dict)
async def trigger_job(
    job_name: str,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Manual trigger (async, returns run_id)."""
    from ..background.scheduler_registry import JOB_REGISTRY
    from ..background.scheduler_startup import get_scheduler

    cfg = next((j for j in JOB_REGISTRY if j["job_name"] == job_name), None)
    if not cfg:
        raise HTTPException(status_code=404, detail="Job not found")

    sched = get_scheduler()
    if not sched:
        raise HTTPException(status_code=503, detail="Scheduler not running")

    job = sched.get_job(job_name)
    if not job:
        raise HTTPException(status_code=404, detail="Job not in scheduler")

    job.modify(next_run_time=datetime.now(timezone.utc))
    return {"job_name": job_name, "triggered": True, "message": "Job queued"}


@router.post("/{job_name}/toggle", response_model=dict)
async def toggle_job(
    job_name: str,
    current_user: User = Depends(require_admin_role),
    db: AsyncSession = Depends(get_db),
):
    """Enable / disable job."""
    from ..background.scheduler_startup import get_scheduler

    sched = get_scheduler()
    if not sched:
        raise HTTPException(status_code=503, detail="Scheduler not running")

    job = sched.get_job(job_name)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    paused = job.next_run_time is None
    if paused:
        job.resume()
        return {"job_name": job_name, "enabled": True}
    else:
        job.pause()
        return {"job_name": job_name, "enabled": False}
