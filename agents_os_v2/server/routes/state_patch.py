"""lod200_author_team override — S003-P011-WP001 LLD400 §4.5 Lod200AuthorOverride."""

import json
from pathlib import Path

from starlette.requests import Request
from starlette.responses import JSONResponse

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
AGENTS_OS_OUTPUT_DIR = REPO_ROOT / "_COMMUNICATION" / "agents_os"
DOMAIN_STATE_FILES = {
    "tiktrack": AGENTS_OS_OUTPUT_DIR / "pipeline_state_tiktrack.json",
    "agents_os": AGENTS_OS_OUTPUT_DIR / "pipeline_state_agentsos.json",
}
# Canonical: team_110 (AOS IDE) / team_111 (TikTrack IDE). Legacy 101/102 accepted for old state/UI.
VALID_LOD200_TEAMS = frozenset({"team_100", "team_101", "team_102", "team_110", "team_111"})


def _get_state_path(domain: str) -> Path:
    d = domain.lower().replace("-", "_").replace(" ", "_")
    return DOMAIN_STATE_FILES.get(d, AGENTS_OS_OUTPUT_DIR / f"pipeline_state_{d}.json")


async def put_lod200_author(request: Request) -> JSONResponse:
    """PUT /api/state/{domain}/lod200-author — set lod200_author_team (team_100|110|111 or legacy 101|102|null)."""
    domain = request.path_params.get("domain", "")
    if not domain:
        return JSONResponse({"error": "missing_domain"}, status_code=400)
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return JSONResponse({"error": "invalid_json"}, status_code=400)
    val = body.get("lod200_author_team")
    if val is not None and val not in VALID_LOD200_TEAMS:
        return JSONResponse(
            {
                "error": "invalid_value",
                "description": "lod200_author_team must be team_100, team_110, team_111 (or legacy team_101, team_102), or null",
            },
            status_code=400,
        )
    path = _get_state_path(domain)
    if not path.exists():
        return JSONResponse({"error": "state_not_found", "description": f"No state file for domain {domain}"}, status_code=404)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        return JSONResponse({"error": "read_failed", "description": str(e)}, status_code=500)
    data["lod200_author_team"] = val
    try:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    except OSError as e:
        return JSONResponse({"error": "write_failed", "description": str(e)}, status_code=500)
    return JSONResponse({"status": "ok", "lod200_author_team": val})
