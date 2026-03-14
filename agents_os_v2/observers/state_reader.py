from __future__ import annotations
"""
POC-1 Observer — State Reader
Agents_OS | ADR-026 | POC_1_OBSERVER_SPEC v1.0.0

Reconstructs the current project state from disk artifacts.
Produces STATE_SNAPSHOT.json — a structured view of:
  1. Governance state (WSM, SSM, active stage)
  2. Codebase state (models, routers, services, schemas, pages)
  3. Quality state (test results, lint findings, security scan)

Domain isolation: reads TikTrack artifacts but imports NOTHING from api/.
Output path: _COMMUNICATION/agents_os/STATE_SNAPSHOT.json
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def _read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except (FileNotFoundError, PermissionError):
        return None


def _find_python_modules(directory: Path) -> list[str]:
    if not directory.is_dir():
        return []
    return sorted(
        p.stem
        for p in directory.glob("*.py")
        if p.stem != "__init__" and not p.stem.startswith("_")
    )


def _find_html_pages(directory: Path) -> list[str]:
    if not directory.is_dir():
        return []
    return sorted(p.stem for p in directory.rglob("*.html"))


def _count_lines(path: Path, pattern: str) -> int:
    text = _read_text(path)
    if not text:
        return 0
    return sum(1 for line in text.splitlines() if pattern in line)


def read_governance_state() -> dict[str, Any]:
    result: dict[str, Any] = {}

    wsm_candidates = [
        REPO_ROOT / "documentation" / "docs-governance" / "01-FOUNDATIONS" / "PHOENIX_MASTER_WSM_v1.0.0.md",
    ]
    for p in wsm_candidates:
        text = _read_text(p)
        if text:
            result["wsm_path"] = str(p.relative_to(REPO_ROOT))
            # AD-V2-01 fix: WSM canonical field is active_stage_id (not current_stage_id)
            stage_match = re.search(r"\|\s*active_stage_id\s*\|\s*(S\d+)\s*\|", text)
            if stage_match:
                result["active_stage"] = stage_match.group(1)
            # AD-V2-02 fix: CURRENT_OPERATIONAL_STATE is a markdown block header, not a
            # single-value field — the old regex was matching log entry text (e.g. "upon").
            # Parse the structured table field active_program_id instead (more reliable).
            prog_match = re.search(r"\|\s*active_program_id\s*\|\s*(\S+)\s*\|", text)
            if prog_match:
                result["active_program"] = prog_match.group(1)
            break

    ssm_candidates = [
        REPO_ROOT / "documentation" / "docs-governance" / "01-FOUNDATIONS" / "PHOENIX_MASTER_SSM_v1.0.0.md",
    ]
    for p in ssm_candidates:
        if p.exists():
            result["ssm_path"] = str(p.relative_to(REPO_ROOT))
            break

    master_index = REPO_ROOT / "00_MASTER_INDEX.md"
    if master_index.exists():
        result["master_index_path"] = "00_MASTER_INDEX.md"

    return result


def read_codebase_state() -> dict[str, Any]:
    api_dir = REPO_ROOT / "api"
    ui_dir = REPO_ROOT / "ui"

    backend: dict[str, Any] = {}
    backend["models"] = _find_python_modules(api_dir / "models")
    backend["routers"] = _find_python_modules(api_dir / "routers")
    backend["services"] = _find_python_modules(api_dir / "services")
    backend["schemas"] = _find_python_modules(api_dir / "schemas")
    backend["integrations"] = bool((api_dir / "integrations").is_dir())

    frontend: dict[str, Any] = {}
    frontend["pages"] = _find_html_pages(ui_dir / "src" / "views")
    routes_json = ui_dir / "public" / "routes.json"
    if routes_json.exists():
        try:
            routes_data = json.loads(routes_json.read_text())
            route_count = 0
            for cat in routes_data.get("routes", {}).values():
                if isinstance(cat, dict):
                    route_count += len(cat)
            frontend["route_count"] = route_count
        except (json.JSONDecodeError, KeyError):
            frontend["route_count"] = 0

    frontend["has_react"] = (ui_dir / "src" / "App.jsx").exists() or (ui_dir / "src" / "main.jsx").exists()

    database: dict[str, Any] = {}
    migrations_dir = REPO_ROOT / "scripts" / "migrations"
    database["migration_count"] = len(list(migrations_dir.glob("*.sql"))) if migrations_dir.is_dir() else 0
    database["has_ddl"] = (
        REPO_ROOT / "documentation" / "docs-system" / "02-SERVER" / "PHX_DB_SCHEMA_V2.5_FULL_DDL.sql"
    ).exists()

    return {"backend": backend, "frontend": frontend, "database": database}


def read_quality_state() -> dict[str, Any]:
    result: dict[str, Any] = {}

    unit_test_dir = REPO_ROOT / "tests" / "unit"
    if unit_test_dir.is_dir():
        test_files = list(unit_test_dir.glob("test_*.py"))
        result["unit_test_files"] = len(test_files)
    else:
        result["unit_test_files"] = 0

    result["has_eslint_config"] = (REPO_ROOT / "ui" / ".eslintrc.cjs").exists()
    result["has_mypy_config"] = (REPO_ROOT / "api" / "mypy.ini").exists()
    result["has_ci_pipeline"] = (REPO_ROOT / ".github" / "workflows" / "ci.yml").exists()

    req_file = REPO_ROOT / "api" / "requirements.txt"
    if req_file.exists():
        result["python_dependencies"] = sum(
            1 for line in req_file.read_text().splitlines()
            if line.strip() and not line.strip().startswith("#")
        )

    return result


def read_artifact_checks() -> list[dict[str, Any]]:
    critical_paths = [
        ("00_MASTER_INDEX.md", "POC_1_OBSERVER_SPEC"),
        ("api/main.py", "codebase"),
        ("api/core/config.py", "codebase"),
        ("api/core/database.py", "codebase"),
        ("api/.env.example", "codebase"),
        ("ui/package.json", "codebase"),
        ("ui/vite.config.js", "codebase"),
        ("ui/public/routes.json", "codebase"),
        (".github/workflows/ci.yml", "ci_cd"),
        ("api/mypy.ini", "quality_tooling"),
        ("ui/.eslintrc.cjs", "quality_tooling"),
        ("Makefile", "devops"),
        ("AGENTS.md", "agent_guidance"),
    ]
    return [
        {
            "path": p,
            "exists": (REPO_ROOT / p).exists(),
            "source": source,
        }
        for p, source in critical_paths
    ]


def build_state_snapshot() -> dict[str, Any]:
    return {
        "schema_version": "2.0.0",
        "produced_at_iso": datetime.now(timezone.utc).isoformat(),
        "agent_role": "POC-1-OBSERVER",
        "read_only": True,
        "governance": read_governance_state(),
        "codebase": read_codebase_state(),
        "quality": read_quality_state(),
        "artifact_checks": read_artifact_checks(),
        "no_ssot_writes": True,
    }


def main() -> None:
    snapshot = build_state_snapshot()

    output_dir = REPO_ROOT / "_COMMUNICATION" / "agents_os"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "STATE_SNAPSHOT.json"
    output_path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"STATE_SNAPSHOT.json written to {output_path.relative_to(REPO_ROOT)}")
    print(f"  Schema: {snapshot['schema_version']}")
    print(f"  Stage: {snapshot['governance'].get('active_stage', 'unknown')}")
    print(f"  Models: {len(snapshot['codebase']['backend']['models'])}")
    print(f"  Routers: {len(snapshot['codebase']['backend']['routers'])}")
    print(f"  Pages: {len(snapshot['codebase']['frontend']['pages'])}")
    print(f"  Artifacts: {sum(1 for a in snapshot['artifact_checks'] if a['exists'])}/{len(snapshot['artifact_checks'])} present")


if __name__ == "__main__":
    main()
