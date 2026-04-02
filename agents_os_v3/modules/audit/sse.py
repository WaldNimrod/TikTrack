"""
Server-Sent Events broadcaster — UI Spec Amendment v1.1.1 §10.4.

Event kinds: ``pipeline_event``, ``heartbeat``, ``run_state_changed``, ``feedback_ingested``.
Dispatch runs on the FastAPI event loop; sync code schedules work via
:func:`schedule_sse` (post-commit only — AD-S8B-10).
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import AsyncIterator
from typing import Any, Optional

logger = logging.getLogger(__name__)

_loop: Optional[asyncio.AbstractEventLoop] = None
_broadcaster: Optional["SSEBroadcaster"] = None
_heartbeat_task: Optional[asyncio.Task[None]] = None


def init_sse(loop: asyncio.AbstractEventLoop) -> SSEBroadcaster:
    global _loop, _broadcaster, _heartbeat_task
    _loop = loop
    _broadcaster = SSEBroadcaster()
    if _heartbeat_task is not None and not _heartbeat_task.done():
        _heartbeat_task.cancel()
        _heartbeat_task = None

    async def _beat() -> None:
        assert _broadcaster is not None
        while True:
            await asyncio.sleep(25)
            await _broadcaster.dispatch_heartbeat()

    _heartbeat_task = asyncio.create_task(_beat(), name="aos-v3-sse-heartbeat")
    return _broadcaster


def get_broadcaster() -> Optional[SSEBroadcaster]:
    return _broadcaster


def shutdown_sse() -> None:
    global _heartbeat_task
    if _heartbeat_task and not _heartbeat_task.done():
        _heartbeat_task.cancel()
    _heartbeat_task = None


def schedule_sse(coro_factory: Any) -> None:
    """Run async dispatch on the app loop; pass a zero-arg lambda that returns the coroutine."""
    loop = _loop
    if loop is None or not loop.is_running():
        return
    try:
        asyncio.run_coroutine_threadsafe(coro_factory(), loop)
    except RuntimeError:
        logger.debug("SSE schedule skipped (loop not running)")


class SSEBroadcaster:
    def __init__(self) -> None:
        self._subs: list[tuple[Optional[str], Optional[str], asyncio.Queue[str]]] = []
        self._lock = asyncio.Lock()

    @staticmethod
    def _matches(sub_run: Optional[str], sub_dom: Optional[str], data: dict[str, Any]) -> bool:
        rid = data.get("run_id")
        did = data.get("domain_id")
        if sub_run and rid != sub_run:
            return False
        if sub_dom and did != sub_dom:
            return False
        return True

    def _format(self, event: str, data: dict[str, Any]) -> str:
        return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"

    async def dispatch(self, event: str, data: dict[str, Any]) -> None:
        line = self._format(event, data)
        async with self._lock:
            subs = list(self._subs)
        for sr, sd, q in subs:
            if not self._matches(sr, sd, data):
                continue
            try:
                q.put_nowait(line)
            except asyncio.QueueFull:
                logger.warning("SSE subscriber queue full, dropping frame")

    async def dispatch_heartbeat(self) -> None:
        from datetime import datetime, timezone

        iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        await self.dispatch("heartbeat", {"ts": iso})

    async def subscribe(
        self,
        run_id: Optional[str],
        domain_id: Optional[str],
    ) -> AsyncIterator[str]:
        q: asyncio.Queue[str] = asyncio.Queue(maxsize=500)
        async with self._lock:
            self._subs.append((run_id, domain_id, q))
        try:
            while True:
                yield await q.get()
        finally:
            async with self._lock:
                try:
                    self._subs.remove((run_id, domain_id, q))
                except ValueError:
                    pass


def notify_pipeline_event_from_row(ev: dict[str, Any]) -> None:
    b = _broadcaster
    if not b:
        return
    occurred = ev.get("occurred_at")
    if hasattr(occurred, "isoformat"):
        occurred = occurred.isoformat().replace("+00:00", "Z")
    data = {
        "event_id": str(ev.get("id", "")),
        "event_type": str(ev.get("event_type", "")),
        "run_id": str(ev.get("run_id", "")),
        "domain_id": str(ev.get("domain_id", "")),
        "occurred_at": occurred,
        "sequence_no": ev.get("sequence_no"),
    }
    schedule_sse(lambda: b.dispatch("pipeline_event", data))


def notify_run_state_changed(
    run_id: str,
    domain_id: str,
    new_status: str,
    previous_status: str | None,
) -> None:
    b = _broadcaster
    if not b:
        return
    data = {
        "run_id": run_id,
        "domain_id": domain_id,
        "new_status": new_status,
        "previous_status": previous_status,
    }
    schedule_sse(lambda: b.dispatch("run_state_changed", data))


def notify_feedback_ingested(
    run_id: str,
    domain_id: str,
    feedback_id: str,
    verdict: str,
    confidence: str,
    proposed_action: str,
) -> None:
    b = _broadcaster
    if not b:
        return
    data = {
        "run_id": run_id,
        "domain_id": domain_id,
        "feedback_id": feedback_id,
        "verdict": verdict,
        "confidence": confidence,
        "proposed_action": proposed_action,
    }
    schedule_sse(lambda: b.dispatch("feedback_ingested", data))


def notify_after_run_mutation(
    conn: Any,
    run_id: str,
    previous_status: str | None,
) -> None:
    """AD-S8B-10 — after successful commit; outside DB transaction."""
    from agents_os_v3.modules.state import repository as R

    with conn.cursor() as cur:
        run = R.fetch_run(cur, run_id)
        ev = R.fetch_latest_event(cur, run_id)
    if not run:
        return
    dom = str(run["domain_id"])
    st = str(run["status"])
    if ev:
        notify_pipeline_event_from_row(dict(ev))
    if previous_status is not None and previous_status != st:
        notify_run_state_changed(run_id, dom, st, previous_status)
