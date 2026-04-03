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


def read_pipeline_state() -> dict[str, Any]:
    """
    S002-P005-WP002 AC-08: Parse gate_state, pending_actions, override_reason from pipeline state.
    Reads domain-specific state files (agents_os, tiktrack).
    Legacy pipeline_state.json removed in S003-P016.
    """
    result: dict[str, Any] = {"domains": {}}
    agents_dir = REPO_ROOT / "_COMMUNICATION" / "agents_os"

    for domain, filename in [
        ("agents_os", "pipeline_state_agentsos.json"),
        ("tiktrack", "pipeline_state_tiktrack.json"),
    ]:
        path = agents_dir / filename
        if not path.exists():
            result["domains"][domain] = {"error": "file_not_found"}
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            result["domains"][domain] = {
                "gate_state": data.get("gate_state"),
                "pending_actions": data.get("pending_actions", []),
                "override_reason": data.get("override_reason"),
                "current_gate": data.get("current_gate"),
                "project_domain": data.get("project_domain"),
                "work_package_id": data.get("work_package_id", ""),
                "stage_id": data.get("stage_id", ""),
            }
        except (json.JSONDecodeError, OSError) as e:
            result["domains"][domain] = {"error": str(e)}

    return result


WSM_PATH = REPO_ROOT / "documentation" / "docs-governance" / "01-FOUNDATIONS" / "PHOENIX_MASTER_WSM_v1.0.0.md"


def read_wsm_identity_fields(wsm_path: str | Path | None = None) -> dict[str, str]:
    """
    Read the CURRENT_OPERATIONAL_STATE identity fields from WSM (S003-P016: COS removed).

    S003-P016: The CURRENT_OPERATIONAL_STATE section was removed from WSM; runtime state
    now lives exclusively in pipeline_state_*.json.  This function scopes its regex to the
    COS block only — returns all-empty if the section is absent (normal post-P016 state).

    Returns dict with keys: active_stage_id, active_work_package_id, active_project_domain, current_gate
    """
    path = Path(wsm_path) if wsm_path else WSM_PATH
    text = _read_text(path)
    result: dict[str, str] = {
        "active_stage_id": "",
        "active_work_package_id": "",
        "active_project_domain": "",
        "current_gate": "",
    }
    if not text:
        return result
    # Scope search to CURRENT_OPERATIONAL_STATE block only (removed in S003-P016)
    cos_start = text.find("## CURRENT_OPERATIONAL_STATE")
    if cos_start < 0:
        return result  # COS section absent — return empty (S003-P016 normal state)
    next_section = text.find("\n## ", cos_start + 1)
    block = text[cos_start:next_section] if next_section > 0 else text[cos_start:]
    stage_match = re.search(r"\|\s*active_stage_id\s*\|\s*([^\n|]+)\|", block)
    if stage_match:
        result["active_stage_id"] = stage_match.group(1).strip()
    wp_match = re.search(r"\|\s*active_work_package_id\s*\|\s*([^\n|]+)\|", block)
    if wp_match:
        result["active_work_package_id"] = wp_match.group(1).strip()
    domain_match = re.search(r"\|\s*active_project_domain\s*\|\s*([^\n|]+)\|", block)
    if domain_match:
        result["active_project_domain"] = domain_match.group(1).strip()
    cg_match = re.search(r"\|\s*current_gate\s*\|\s*([^\n|]+)\|", block)
    if cg_match:
        result["current_gate"] = cg_match.group(1).strip()
    return result


def read_stage_parallel_tracks(wsm_path: str | Path | None = None) -> list[dict[str, str]]:
    """
    Read STAGE_PARALLEL_TRACKS table from WSM.
    Returns list of dicts: domain, active_program_id, active_work_package_id, phase_status, current_gate, gate_owner_team
    """
    path = Path(wsm_path) if wsm_path else WSM_PATH
    text = _read_text(path)
    if not text:
        return []
    idx = text.find("## STAGE_PARALLEL_TRACKS")
    if idx < 0:
        return []
    block = text[idx : idx + 32000]
    rows: list[dict[str, str]] = []
    for line in block.splitlines():
        raw = line.strip()
        if not raw.startswith("|"):
            if rows:
                break
            continue
        parts = [p.strip() for p in raw.split("|")]
        parts = [p for p in parts if p != ""]
        if len(parts) < 6:
            continue
        if set(parts[0]) <= {"-", ":"} or parts[0].startswith("---"):
            continue
        key = parts[0].replace(" ", "").lower()
        if key == "domain":
            continue
        rows.append({
            "domain": key if key != "—" else "",
            "active_program_id": parts[1] if parts[1] != "—" else "",
            "active_work_package_id": parts[2] if parts[2] != "—" else "",
            "phase_status": parts[3] if len(parts) > 3 else "",
            "current_gate": parts[4] if len(parts) > 4 else "",
            "gate_owner_team": parts[5] if len(parts) > 5 else "",
        })
    return rows


def read_ssot_reference_identity(domain: str, wsm_path: str | Path | None = None) -> dict[str, str]:
    """
    Identity fields for `ssot_check` vs pipeline_state_*.json.

    - **agents_os:** `CURRENT_OPERATIONAL_STATE` (single active runtime track).
    - **tiktrack:** `STAGE_PARALLEL_TRACKS` row for domain TIKTRACK (parallel catalog).

    Falls back to `read_wsm_identity_fields()` if a domain-specific row is missing.
    """
    d = (domain or "").strip().lower().replace("-", "_")
    if d in ("agents_os", "agentsos"):
        return read_wsm_identity_fields(wsm_path)
    if d == "tiktrack":
        for row in read_stage_parallel_tracks(wsm_path):
            if row.get("domain", "").lower() == "tiktrack":
                wp = (row.get("active_work_package_id") or "").strip()
                stage_id = ""
                if wp and "-" in wp:
                    stage_id = wp.split("-")[0].strip()
                return {
                    "active_stage_id": stage_id,
                    "active_work_package_id": wp,
                    "active_project_domain": "TIKTRACK",
                    "current_gate": (row.get("current_gate") or "").strip(),
                }
    return read_wsm_identity_fields(wsm_path)


class DriftItem:
    """Single drift item: WSM vs JSON mismatch."""

    def __init__(self, field: str, wsm_value: str, json_value: str, severity: str = "warn"):
        self.field = field
        self.wsm_value = wsm_value
        self.json_value = json_value
        self.severity = severity


def detect_drift(
    wsm_identity: dict[str, str],
    json_execution: dict[str, Any],
    domain: str | None = None,
) -> list[DriftItem]:
    """
    Compare WSM identity fields against pipeline JSON execution fields.
    Returns list of DriftItem. Empty list = no drift.
    """
    drift: list[DriftItem] = []
    wsm_wp = wsm_identity.get("active_work_package_id", "")
    wsm_stage = wsm_identity.get("active_stage_id", "")
    json_wp = str(json_execution.get("work_package_id", "")).strip()
    json_stage = str(json_execution.get("stage_id", "")).strip()
    if wsm_wp and json_wp and wsm_wp != json_wp and json_wp not in ("", "REQUIRED"):
        drift.append(DriftItem("work_package_id", wsm_wp, json_wp, "warn"))
    if wsm_stage and json_stage and wsm_stage != json_stage:
        drift.append(DriftItem("stage_id", wsm_stage, json_stage, "warn"))
    return drift


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
    wsm_identity = read_wsm_identity_fields()
    pipeline = read_pipeline_state()
    governance = read_governance_state()
    governance["wsm_identity"] = wsm_identity

    # Drift detection: compare WSM vs pipeline JSON per domain
    for domain, domain_data in pipeline.get("domains", {}).items():
        if isinstance(domain_data, dict) and "error" not in domain_data:
            drift_items = detect_drift(wsm_identity, domain_data, domain)
            if drift_items:
                try:
                    from agents_os_v2.orchestrator.log_events import append_event
                    for d in drift_items:
                        append_event({
                            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "pipe_run_id": "state_reader",
                            "event_type": "DRIFT_DETECTED",
                            "domain": domain,
                            "stage_id": wsm_identity.get("active_stage_id", ""),
                            "work_package_id": wsm_identity.get("active_work_package_id", ""),
                            "gate": domain_data.get("current_gate", ""),
                            "agent_team": "team_61",
                            "severity": "WARN",
                            "description": f"WSM vs JSON drift: {d.field}",
                            "metadata": {
                                "field": d.field,
                                "wsm_value": d.wsm_value,
                                "json_value": d.json_value,
                            },
                        })
                except Exception:
                    pass

    snapshot = {
        "schema_version": "2.0.0",
        "produced_at_iso": datetime.now(timezone.utc).isoformat(),
        "agent_role": "POC-1-OBSERVER",
        "read_only": True,
        "governance": governance,
        "pipeline": pipeline,
        "codebase": read_codebase_state(),
        "quality": read_quality_state(),
        "artifact_checks": read_artifact_checks(),
        "no_ssot_writes": True,
    }
    return snapshot


def main() -> None:
    snapshot = build_state_snapshot()

    output_dir = REPO_ROOT / "_COMMUNICATION" / "agents_os"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "STATE_SNAPSHOT.json"
    output_path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False), encoding="utf-8")

    # Emit SNAPSHOT_GENERATED event
    try:
        from agents_os_v2.orchestrator.log_events import append_event
        append_event({
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "pipe_run_id": "state_reader",
            "event_type": "SNAPSHOT_GENERATED",
            "domain": "global",
            "stage_id": snapshot.get("governance", {}).get("wsm_identity", {}).get("active_stage_id", ""),
            "work_package_id": snapshot.get("governance", {}).get("wsm_identity", {}).get("active_work_package_id", ""),
            "gate": "",
            "agent_team": "team_61",
            "severity": "INFO",
            "description": "STATE_SNAPSHOT.json generated",
            "metadata": {"output_path": str(output_path.relative_to(REPO_ROOT))},
        })
    except Exception:
        pass

    print(f"STATE_SNAPSHOT.json written to {output_path.relative_to(REPO_ROOT)}")
    print(f"  Schema: {snapshot['schema_version']}")
    print(f"  Stage: {snapshot['governance'].get('active_stage', 'unknown')}")
    pipeline = snapshot.get("pipeline", {})
    for dom, info in pipeline.get("domains", {}).items():
        if isinstance(info, dict) and "error" not in info and info.get("gate_state"):
            print(f"  Pipeline [{dom}]: gate_state={info.get('gate_state')}, current_gate={info.get('current_gate')}")
    print(f"  Models: {len(snapshot['codebase']['backend']['models'])}")
    print(f"  Routers: {len(snapshot['codebase']['backend']['routers'])}")
    print(f"  Pages: {len(snapshot['codebase']['frontend']['pages'])}")
    print(f"  Artifacts: {sum(1 for a in snapshot['artifact_checks'] if a['exists'])}/{len(snapshot['artifact_checks'])} present")


if __name__ == "__main__":
    main()
