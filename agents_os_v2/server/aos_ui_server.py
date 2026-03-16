"""AOS Pipeline Server — Phase 1 (Event Log). S003-P007 foundation."""

import os
from pathlib import Path
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from starlette.responses import RedirectResponse

from .routes.health import root_info, health_check, set_start_time
from .routes.events import post_log_event, get_log_events
from .routes.state_stub import stub_state_domain, stub_pipeline_command, stub_state_drift

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
STATIC_DIR = REPO_ROOT / "agents_os" / "ui"
COMMUNICATION_DIR = REPO_ROOT / "_COMMUNICATION"


async def redirect_root(request):
    """Redirect / to dashboard entry point."""
    return RedirectResponse(url="/static/PIPELINE_DASHBOARD.html", status_code=302)


def _get_server_port() -> str:
    """Derive bind port from runtime context. BF-G5-001: avoid hardcoded 8090."""
    return os.environ.get("AOS_SERVER_PORT") or os.environ.get("PORT") or "8090"


async def emit_server_start():
    """Emit SERVER_START event on startup."""
    from agents_os_v2.orchestrator.log_events import append_event
    from datetime import datetime, timezone
    port = _get_server_port()
    evt = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "pipe_run_id": "server",
        "event_type": "SERVER_START",
        "domain": "global",
        "stage_id": "",
        "work_package_id": "",
        "gate": "",
        "agent_team": "team_61",
        "severity": "INFO",
        "description": f"AOS Pipeline Server started on port {port}",
        "metadata": {"port": port},
    }
    try:
        append_event(evt)
    except Exception:
        pass  # Non-blocking per spec


def create_app():
    set_start_time()
    routes = [
        Route("/", redirect_root),
        Route("/api/health", health_check, methods=["GET"]),
        Route("/api/log/event", post_log_event, methods=["POST"]),
        Route("/api/log/events", get_log_events, methods=["GET"]),
        Route("/api/state/drift", stub_state_drift, methods=["GET"]),
        Route("/api/state/{domain}", stub_state_domain, methods=["GET"]),
        Route("/api/pipeline/{domain}/{command}", stub_pipeline_command, methods=["POST"]),
        Mount("/static", app=StaticFiles(directory=str(STATIC_DIR)), name="static"),
        Mount("/_COMMUNICATION", app=StaticFiles(directory=str(COMMUNICATION_DIR)), name="communication"),
    ]
    app = Starlette(
        routes=routes,
        on_startup=[emit_server_start],
    )
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "agents_os_v2.server.aos_ui_server:app",
        host="127.0.0.1",
        port=8090,
        reload=False,
    )
