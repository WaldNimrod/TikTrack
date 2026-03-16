"""Event log routes — POST /api/log/event, GET /api/log/events."""

import json
from pathlib import Path
from typing import List, Optional

from starlette.requests import Request
from starlette.responses import JSONResponse

from ..models.event import PipelineEvent
from agents_os_v2.orchestrator.log_events import append_event, LOG_FILE


async def post_log_event(request: Request) -> JSONResponse:
    """POST /api/log/event — ingest pipeline event."""
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return JSONResponse(
            {"error": "invalid_json", "description": "Request body must be valid JSON"},
            status_code=400,
        )
    try:
        evt = PipelineEvent(**body)
    except Exception as e:
        return JSONResponse(
            {"error": "validation_failed", "description": str(e)},
            status_code=422,
        )
    try:
        append_event(evt.model_dump(mode="json"))
    except OSError:
        return JSONResponse(
            {"error": "write_failed", "description": "Could not write to log file"},
            status_code=500,
        )
    return JSONResponse({"status": "ok", "received": evt.event_type})


def _read_events(domain: Optional[str], gate: Optional[str], event_type: Optional[str], limit: int) -> List[dict]:
    """Read last N events from JSONL, optionally filtered."""
    if not LOG_FILE.exists():
        return []
    events = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                evt = json.loads(line)
            except json.JSONDecodeError:
                continue
            if domain and evt.get("domain") != domain:
                continue
            if gate and evt.get("gate") != gate:
                continue
            if event_type and evt.get("event_type") != event_type:
                continue
            events.append(evt)
    # Most recent last in file — reverse for chronological (newest first)
    events.reverse()
    return events[:limit]


async def get_log_events(request: Request) -> JSONResponse:
    """GET /api/log/events — query events with filters."""
    domain = request.query_params.get("domain")
    gate = request.query_params.get("gate")
    event_type = request.query_params.get("event_type")
    try:
        limit = int(request.query_params.get("limit", "20"))
    except ValueError:
        limit = 20
    limit = max(1, min(limit, 100))
    events = _read_events(domain, gate, event_type, limit)
    return JSONResponse(events)
