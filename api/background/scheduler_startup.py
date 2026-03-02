"""
Scheduler Startup — APScheduler lifespan hooks
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION §2.1, §4.2
"""

import logging
from contextlib import asynccontextmanager
from typing import Optional

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


def _make_job_wrapper(cfg: dict):
    """Create wrapper that gets db and calls job_runner.run_job."""
    job_name = cfg["job_name"]
    runtime_class = cfg.get("runtime_class", "TARGET_RUNTIME")
    module_path = cfg["module"]
    func_name = cfg["function"]
    async def _wrapper():
        from ..core.database import AsyncSessionLocal
        from .job_runner import run_job
        mod = __import__(module_path, fromlist=[func_name])
        fn = getattr(mod, func_name)
        async with AsyncSessionLocal() as db:
            await run_job(job_name, fn, db, runtime_class)
    return _wrapper


async def start_scheduler():
    """Start APScheduler and add all jobs from registry. First run immediate for runtime validation."""
    global _scheduler
    from datetime import datetime, timezone
    _scheduler = AsyncIOScheduler()
    for cfg in JOB_REGISTRY:
        if not cfg.get("enabled_default", True):
            continue
        try:
            wrapper = _make_job_wrapper(cfg)
            mins = _get_minutes(cfg)
            _scheduler.add_job(
                wrapper,
                trigger=IntervalTrigger(minutes=mins),
                id=cfg["job_name"],
                name=cfg["job_name"],
                replace_existing=True,
                next_run_time=datetime.now(timezone.utc),
            )
            logger.info("APScheduler: registered job %s (interval=%dm)", cfg["job_name"], mins)
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
