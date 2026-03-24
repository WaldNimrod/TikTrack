"""
SSOT consistency check — internal pipeline_state_*.json validation (S003-P016).

Prior to S003-P016 this tool compared pipeline_state_*.json against WSM COS fields.
The WSM CURRENT_OPERATIONAL_STATE section has been removed; pipeline_state_*.json is
now the single source of truth for runtime operational state.

This tool now validates pipeline_state internal consistency:
  - File exists and is parseable
  - Required fields are present (stage_id, current_gate, project_domain)
  - work_package_id is set when gate is active (not COMPLETE / NOT_STARTED)

Usage:
  python -m agents_os_v2.tools.ssot_check [--domain tiktrack|agents_os]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

_COMPLETE_STATES = frozenset({"COMPLETE", "NOT_STARTED", ""})


def _load_pipeline_state(domain: str) -> dict:
    from agents_os_v2.config import get_state_file

    p = get_state_file(domain)
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))


def run_check(domain: str) -> tuple[bool, list[str]]:
    """Return (ok, list of human-readable diff lines).

    Validates pipeline_state internal consistency (S003-P016 — single source).
    """
    data = _load_pipeline_state(domain)
    diffs: list[str] = []

    if not data:
        return False, ["pipeline_state file missing or empty"]

    gate = str(data.get("current_gate") or "").strip()
    wp = str(data.get("work_package_id") or "").strip()
    stage = str(data.get("stage_id") or "").strip()
    dom = str(data.get("project_domain") or "").strip()

    if not gate:
        diffs.append("current_gate: missing or empty")
    if not stage:
        diffs.append("stage_id: missing or empty")
    if not dom:
        diffs.append("project_domain: missing or empty")
    # When gate is active (not idle/complete), work_package_id must be set
    if gate and gate.upper() not in _COMPLETE_STATES and not wp:
        diffs.append(f"work_package_id: empty while gate={gate!r} is active")

    return len(diffs) == 0, diffs


def print_result(ok: bool, diffs: list[str], domain: str) -> None:
    if ok:
        print(f"SSOT CHECK: ✓ CONSISTENT (domain={domain})")
    else:
        print(f"SSOT CHECK: ⚠ DRIFT DETECTED — domain={domain}")
        for d in diffs:
            print(f"  · {d}")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="SSOT pipeline_state internal consistency check")
    ap.add_argument(
        "--domain",
        choices=("tiktrack", "agents_os"),
        default="tiktrack",
        help="Pipeline domain file to validate",
    )
    ap.add_argument(
        "--auto-sync",
        action="store_true",
        help="[Deprecated — no-op] Previously placeholder for background WSM repair.",
    )
    args = ap.parse_args(argv)

    if args.auto_sync:
        print("SSOT: --auto-sync is not implemented (deprecated in S003-P016).")
        return 0

    ok, diffs = run_check(args.domain)
    print_result(ok, diffs, args.domain)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
