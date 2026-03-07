#!/usr/bin/env python3
"""
Scheduler run_after ordering validation (B-01 follow-up gap closure).

Mandate: TEAM_00_TO_TEAM_50_SCHEDULER_FIX_VALIDATION_v1.0.0
"""

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, Mock

import pytest


def test_run_after_ordering_enforced(monkeypatch):
    """Validate run_after startup ordering and dependent triggering behavior."""
    from api.background import scheduler_startup as startup
    from api.background.scheduler_registry import JOB_REGISTRY

    # 1) Real registry dependency assertion
    dep_cfg = next(cfg for cfg in JOB_REGISTRY if cfg["job_name"] == "check_alert_conditions")
    assert dep_cfg.get("run_after") == "sync_ticker_prices_intraday"

    added_jobs = {}

    class FakeScheduler:
        def __init__(self):
            self.modify_job = Mock()

        def add_job(self, func, trigger, id, name, replace_existing, next_run_time):
            added_jobs[id] = {
                "func": func,
                "trigger": trigger,
                "next_run_time": next_run_time,
                "name": name,
                "replace_existing": replace_existing,
            }

        def start(self):
            return None

        def shutdown(self, wait=False):
            return None

    # Deterministic interval for timing assertions.
    monkeypatch.setattr(startup, "_get_minutes", lambda _cfg: 15)
    monkeypatch.setattr(startup, "AsyncIOScheduler", FakeScheduler)

    asyncio.run(startup.start_scheduler())

    # 2) next_run_time assertions at registration time
    now = datetime.now(timezone.utc)
    parent_first_run = added_jobs["sync_ticker_prices_intraday"]["next_run_time"]
    child_first_run = added_jobs["check_alert_conditions"]["next_run_time"]

    assert abs((parent_first_run - now).total_seconds()) <= 5
    assert child_first_run > now + timedelta(minutes=14)

    # Wrapper to execute parent completion flow
    parent_wrapper = added_jobs["sync_ticker_prices_intraday"]["func"]

    # Mock DB session context used inside wrapper
    class _DummySessionContext:
        async def __aenter__(self):
            return object()

        async def __aexit__(self, exc_type, exc, tb):
            return False

    import api.core.database as db_module
    monkeypatch.setattr(db_module, "AsyncSessionLocal", lambda: _DummySessionContext())

    import api.background.job_runner as job_runner_module

    # 3) modify_job called exactly once after parent wrapper success
    run_job_ok = AsyncMock(return_value={"status": "completed", "exit_code": 0})
    monkeypatch.setattr(job_runner_module, "run_job", run_job_ok)

    asyncio.run(parent_wrapper())

    startup._scheduler.modify_job.assert_called_once()
    call_args, call_kwargs = startup._scheduler.modify_job.call_args
    assert call_args[0] == "check_alert_conditions"
    assert "next_run_time" in call_kwargs

    # 4) modify_job NOT called when parent wrapper raises
    startup._scheduler.modify_job.reset_mock()
    run_job_fail = AsyncMock(side_effect=RuntimeError("parent failed"))
    monkeypatch.setattr(job_runner_module, "run_job", run_job_fail)

    with pytest.raises(RuntimeError):
        asyncio.run(parent_wrapper())

    startup._scheduler.modify_job.assert_not_called()
