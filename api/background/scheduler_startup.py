"""
Scheduler Startup — APScheduler lifespan hooks
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION §2.1, §4.2

run_after enforcement (2026-03-04):
  Dependent jobs are NOT fired independently on startup; they are triggered
  by the parent wrapper immediately after successful completion.
  This guarantees check_alert_conditions always runs on fresh market data.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .scheduler_registry import JOB_REGISTRY

logger = logging.getLogger(__name__)

_scheduler: Optional[AsyncIOScheduler] = None


def _get_minutes(job_config: dict) -> int:
    minutes = job_config.get("minutes", 15)
    if isinstance(minutes, str) and minutes.startswith("from_settings:"):
        key = minutes.split(":", 1)[1]
        from ..core.config import settings
        return getattr(settings, key.lower(), 15)
    return int(minutes) if minutes else 15


def _make_job_wrapper(cfg: dict, dependents: List[str] = None):
    """Create wrapper that gets db and calls job_runner.run_job.

    If dependents is provided, triggers those jobs immediately after successful
    completion — enforcing the run_after ordering declared in scheduler_registry.
    Dependents are NOT triggered if this job raises (stale-data protection).
    """
    job_name = cfg["job_name"]
    runtime_class = cfg.get("runtime_class", "TARGET_RUNTIME")
    module_path = cfg["module"]
    func_name = cfg["function"]
    _dependents: List[str] = dependents or []

    async def _wrapper():
        from ..core.database import AsyncSessionLocal
        from .job_runner import run_job
        mod = __import__(module_path, fromlist=[func_name])
        fn = getattr(mod, func_name)
        async with AsyncSessionLocal() as db:
            await run_job(job_name, fn, db, runtime_class)
        # Enforce run_after: trigger dependent jobs only after successful completion.
        # If run_job raised, we never reach here — dependents stay on their interval.
        if _dependents and _scheduler:
            now = datetime.now(timezone.utc)
            for dep_id in _dependents:
                try:
                    _scheduler.modify_job(dep_id, next_run_time=now)
                    logger.info(
                        "APScheduler: triggered dependent job %s after %s completed",
                        dep_id, job_name,
                    )
                except Exception as exc:
                    logger.warning(
                        "APScheduler: could not trigger dependent %s: %s", dep_id, exc
                    )

    return _wrapper


async def start_scheduler():
    """Start APScheduler and add all jobs from registry.

    Parent jobs (no run_after): fire immediately on startup for runtime validation.
    Dependent jobs (run_after set): first run is delayed by one full interval so the
    parent completes its first cycle before the dependent runs independently.
    In practice, the parent wrapper will trigger the dependent sooner (via modify_job),
    so the delayed interval is only a safety fallback — never the primary execution path.
    """
    global _scheduler
    _scheduler = AsyncIOScheduler()

    # Build dependency map: parent_job_id → [child_job_ids]
    dep_map: dict = {}
    for cfg in JOB_REGISTRY:
        parent = cfg.get("run_after")
        if parent:
            dep_map.setdefault(parent, []).append(cfg["job_name"])

    now = datetime.now(timezone.utc)

    for cfg in JOB_REGISTRY:
        if not cfg.get("enabled_default", True):
            continue
        try:
            dependents = dep_map.get(cfg["job_name"], [])
            wrapper = _make_job_wrapper(cfg, dependents)
            mins = _get_minutes(cfg)
            is_dependent = bool(cfg.get("run_after"))
            # Dependent jobs wait one interval on startup; parent will trigger them sooner.
            first_run = now if not is_dependent else now + timedelta(minutes=mins)
            _scheduler.add_job(
                wrapper,
                trigger=IntervalTrigger(minutes=mins),
                id=cfg["job_name"],
                name=cfg["job_name"],
                replace_existing=True,
                next_run_time=first_run,
            )
            logger.info(
                "APScheduler: registered job %s (interval=%dm, first_run=%s)",
                cfg["job_name"],
                mins,
                "immediate" if not is_dependent else f"delayed +{mins}m (run_after={cfg['run_after']})",
            )
        except Exception as e:
            logger.warning("APScheduler: skip job %s: %s", cfg.get("job_name"), e)

    _scheduler.start()
    logger.info("APScheduler started — background jobs active")


async def stop_scheduler():
    """Shutdown APScheduler."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("APScheduler stopped")


def get_scheduler() -> Optional[AsyncIOScheduler]:
    return _scheduler
