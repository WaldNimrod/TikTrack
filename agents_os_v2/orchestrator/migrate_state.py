"""
migrate_state.py — S003-P011-WP001 legacy → canonical gate migration.
Copy-first backup; applies LLD400 §3.1 migration table.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Migration table: old gate_id → (new_gate_id, new_phase)
GATE_MIGRATION: dict[str, tuple[str, str | None]] = {
    "GATE_0": ("GATE_1", "1.2"),
    "GATE_1": ("GATE_2", "2.1v"),
    "GATE_2": ("GATE_2", "2.3"),
    "WAITING_GATE2_APPROVAL": ("GATE_2", "2.3"),  # gate_state=HUMAN_PENDING set separately
    "G3_PLAN": ("GATE_3", "2.2"),
    "G3_5": ("GATE_3", "2.2v"),
    "G3_6_MANDATES": ("GATE_3", "3.1"),
    "G3_REMEDIATION": ("GATE_3", "3.1"),
    "CURSOR_IMPLEMENTATION": ("GATE_3", "3.2"),
    "GATE_4": ("GATE_3", "3.3"),
    "GATE_5": ("GATE_4", "4.1"),
    "GATE_6": ("GATE_4", "4.2"),
    "GATE_7": ("GATE_4", "4.3"),
    "GATE_8": ("GATE_5", None),
    "COMPLETE": ("GATE_5", None),  # terminal stays terminal
    "NOT_STARTED": ("GATE_1", "1.1"),
    "NONE": ("NONE", None),
}


def migrate_state_file(path: Path, backup_dir: Path) -> bool:
    """Migrate one state file. Returns True if migrated, False if skipped."""
    if not path.exists():
        return False
    data = json.loads(path.read_text(encoding="utf-8"))
    wp = data.get("work_package_id", "")
    old_gate = data.get("current_gate", "")
    domain = data.get("project_domain", "agents_os")

    # S003-P003-WP001 override: G3_PLAN/G3_5/G3_6_MANDATES → GATE_3, phase 3.1
    if wp == "S003-P003-WP001" and old_gate in ("G3_PLAN", "G3_5", "G3_6_MANDATES"):
        data["current_gate"] = "GATE_3"
        data["current_phase"] = "3.1"
    elif old_gate in GATE_MIGRATION:
        new_gate, phase = GATE_MIGRATION[old_gate]
        data["current_gate"] = new_gate
        if phase is not None:
            data["current_phase"] = phase
        if old_gate == "WAITING_GATE2_APPROVAL":
            data["gate_state"] = "HUMAN_PENDING"

    # Migrate gates_completed (legacy IDs → new canonical)
    completed = data.get("gates_completed", [])
    migrated_completed: list[str] = []
    seen_new: set[str] = set()
    for g in completed:
        if g in GATE_MIGRATION:
            ng, _ = GATE_MIGRATION[g]
            if ng not in seen_new and ng != "NONE":
                migrated_completed.append(ng)
                seen_new.add(ng)
        else:
            migrated_completed.append(g)
            seen_new.add(g)
    data["gates_completed"] = migrated_completed

    # Migrate gates_failed
    failed = data.get("gates_failed", [])
    migrated_failed = [GATE_MIGRATION.get(g, (g, None))[0] for g in failed if g]
    data["gates_failed"] = list(dict.fromkeys(migrated_failed))  # dedupe

    # Ensure new fields exist
    data.setdefault("process_variant", "TRACK_FOCUSED" if domain == "agents_os" else "TRACK_FULL")
    data.setdefault("finding_type", None)
    data.setdefault("fcp_level", None)
    data.setdefault("return_target_team", None)
    data.setdefault("lod200_author_team", None)
    if isinstance(data.get("current_phase"), int):
        data["current_phase"] = data.get("current_phase") or None

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return True


def main() -> int:
    from ..config import AGENTS_OS_OUTPUT_DIR, DOMAIN_STATE_FILES

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_dir = AGENTS_OS_OUTPUT_DIR / "backups" / timestamp
    backup_dir.mkdir(parents=True, exist_ok=True)

    state_files = list(DOMAIN_STATE_FILES.values()) + [
        AGENTS_OS_OUTPUT_DIR / "pipeline_state.json",
    ]
    migrated = 0
    for path in state_files:
        if path.exists():
            content = path.read_text(encoding="utf-8")
            (backup_dir / path.name).write_text(content, encoding="utf-8")
            if migrate_state_file(path, backup_dir):
                migrated += 1
                print(f"[migrate] {path.name} → migrated, backup at {backup_dir / path.name}")

    if migrated == 0:
        print("[migrate] No state files to migrate.")
        return 0

    # Validate: load migrated state
    try:
        from .state import PipelineState
        for domain in ("agents_os", "tiktrack"):
            p = DOMAIN_STATE_FILES.get(domain)
            if p and p.exists():
                s = PipelineState.load(domain)
                if s.work_package_id == "S003-P003-WP001":
                    assert s.current_gate == "GATE_3", f"S003-P003-WP001: expected GATE_3, got {s.current_gate}"
                    assert s.current_phase == "3.1", f"S003-P003-WP001: expected phase 3.1, got {s.current_phase}"
                print(f"[validate] {domain}: gates_completed={len(s.gates_completed)} preserved")
    except Exception as e:
        print(f"[migrate] VALIDATION FAILED: {e}", file=sys.stderr)
        return 1

    print(f"[migrate] Done. Backup: {backup_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
