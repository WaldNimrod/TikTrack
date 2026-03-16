"""Health and info routes — GET /, GET /api/health."""

import json
import time
from starlette.requests import Request
from starlette.responses import JSONResponse

# Startup time for uptime
_start_time: float | None = None


def set_start_time():
    global _start_time
    _start_time = time.time()


def get_uptime_seconds() -> float:
    if _start_time is None:
        return 0.0
    return time.time() - _start_time


async def root_info(request: Request) -> JSONResponse:
    """GET / — server info, version, uptime."""
    return JSONResponse({
        "service": "AOS Pipeline Server",
        "version": "1.0.0",
        "phase": "S003-P007-P1",
        "uptime_s": round(get_uptime_seconds(), 1),
        "endpoints": ["/api/health", "/api/log/event", "/api/log/events", "/static/"],
    })


async def health_check(request: Request) -> JSONResponse:
    """GET /api/health — health check for load balancers/monitors."""
    return JSONResponse({
        "status": "ok",
        "uptime_s": round(get_uptime_seconds(), 1),
    })
