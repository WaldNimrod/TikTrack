"""Phase 2 stubs — 501 Not Implemented for future S003-P007 endpoints."""

from starlette.requests import Request
from starlette.responses import JSONResponse

STUB_BODY = {
    "error": "not_implemented",
    "planned_for": "S003-P007",
    "description": "Live state API — will be implemented in S003-P007 AOS Pipeline Server expansion",
}


async def stub_state_domain(request: Request) -> JSONResponse:
    """GET /api/state/{domain} — stub."""
    return JSONResponse(STUB_BODY, status_code=501)


async def stub_pipeline_command(request: Request) -> JSONResponse:
    """POST /api/pipeline/{domain}/{command} — stub."""
    return JSONResponse(STUB_BODY, status_code=501)


async def stub_state_drift(request: Request) -> JSONResponse:
    """GET /api/state/drift — stub."""
    return JSONResponse(STUB_BODY, status_code=501)
