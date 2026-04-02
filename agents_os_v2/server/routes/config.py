"""team_engine_config.json read/write — S003-P011-WP001 BF-04/05."""

import json
from pathlib import Path

from starlette.requests import Request
from starlette.responses import JSONResponse

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent  # agents_os_v2/server/routes -> repo root
CONFIG_PATH = REPO_ROOT / "_COMMUNICATION" / "agents_os" / "team_engine_config.json"


async def get_team_engine_config(request: Request) -> JSONResponse:
    """GET /api/config/team-engine — read team_engine_config.json."""
    try:
        if not CONFIG_PATH.exists():
            return JSONResponse({"error": "not_found", "description": "team_engine_config.json not found"}, status_code=404)
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        return JSONResponse(data)
    except json.JSONDecodeError as e:
        return JSONResponse({"error": "invalid_json", "description": str(e)}, status_code=500)
    except OSError as e:
        return JSONResponse({"error": "read_failed", "description": str(e)}, status_code=500)


async def put_team_engine_config(request: Request) -> JSONResponse:
    """PUT /api/config/team-engine — write team_engine_config.json."""
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return JSONResponse({"error": "invalid_json", "description": "Request body must be valid JSON"}, status_code=400)
    if not isinstance(body, dict):
        return JSONResponse({"error": "invalid_structure", "description": "Root must be object"}, status_code=400)
    if "teams" not in body or not isinstance(body["teams"], dict):
        return JSONResponse({"error": "invalid_structure", "description": "teams must be object"}, status_code=400)
    for tid, tdata in body["teams"].items():
        if not isinstance(tdata, dict) or "engine" not in tdata or "domain" not in tdata:
            return JSONResponse(
                {"error": "invalid_team", "description": f"team {tid} must have engine and domain"},
                status_code=400,
            )
    try:
        CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
        CONFIG_PATH.write_text(json.dumps(body, indent=2, ensure_ascii=False), encoding="utf-8")
        return JSONResponse({"status": "ok", "path": str(CONFIG_PATH)})
    except OSError as e:
        return JSONResponse({"error": "write_failed", "description": str(e)}, status_code=500)
