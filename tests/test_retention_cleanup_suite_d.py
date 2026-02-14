#!/usr/bin/env python3
"""
Suite D: Retention & Cleanup Jobs — Automated Test
TEAM_10_TO_TEAM_60_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
Verifies: last_run_time, rows_pruned, rows_updated in job evidence.
Included in Smoke (PR) and Nightly (Full).
"""

import json
import os
import subprocess
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
ARTIFACTS = PROJECT / "documentation" / "05-REPORTS" / "artifacts"
EVIDENCE_JSON = ARTIFACTS / "TEAM_60_CLEANUP_EVIDENCE.json"


def load_env():
    env_path = PROJECT / "api" / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\"").strip())


def test_cleanup_job_emits_evidence():
    """Run cleanup job and verify evidence contains last_run_time, rows_pruned, rows_updated."""
    load_env()
    if not os.getenv("DATABASE_URL"):
        print("SKIP: DATABASE_URL not set")
        return True  # Skip in CI without DB
    try:
        subprocess.run(
            [sys.executable, str(PROJECT / "scripts" / "cleanup_market_data.py")],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(PROJECT),
        )
    except subprocess.TimeoutExpired:
        print("FAIL: cleanup job timeout")
        return False
    except Exception as e:
        print(f"FAIL: {e}")
        return False

    if not EVIDENCE_JSON.exists():
        print("FAIL: TEAM_60_CLEANUP_EVIDENCE.json not found")
        return False

    with open(EVIDENCE_JSON) as f:
        ev = json.load(f)

    required = ["last_run_time", "rows_pruned", "rows_updated", "rows_archived"]
    missing = [k for k in required if k not in ev]
    if missing:
        print(f"FAIL: Evidence missing keys: {missing}")
        return False

    # Required fields must be present
    ok = (
        isinstance(ev["last_run_time"], str)
        and len(ev["last_run_time"]) > 0
        and isinstance(ev["rows_pruned"], (int, float))
        and isinstance(ev["rows_updated"], (int, float))
        and isinstance(ev["rows_archived"], (int, float))
    )
    if not ok:
        print(f"FAIL: Evidence format invalid: {ev}")
        return False

    print("PASS: Suite D — Retention & Cleanup job evidence OK")
    return True


def main():
    ok = test_cleanup_job_emits_evidence()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
