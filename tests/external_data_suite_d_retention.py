#!/usr/bin/env python3
"""
External Data — Suite D: Retention & Cleanup Jobs
- Run cleanup script
- Verify evidence emitted (last_run_time, rows_pruned)
"""

import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.chdir(Path(__file__).resolve().parent.parent)

def load_env():
    p = Path("api/.env")
    if p.exists():
        for line in p.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\"").strip())

load_env()

FAILS = []

def ok(name):
    print(f"  ✅ {name}")

def fail(name, msg):
    print(f"  ❌ {name}: {msg}")
    FAILS.append(f"{name}: {msg}")

def test_cleanup_runs():
    """cleanup_market_data.py runs without error"""
    import subprocess
    try:
        r = subprocess.run(
            [sys.executable, "scripts/cleanup_market_data.py"],
            capture_output=True, text=True, timeout=30, cwd=Path(__file__).resolve().parent.parent
        )
        if r.returncode != 0:
            fail("cleanup_run", r.stderr or r.stdout or "non-zero exit"); return
        ok("cleanup_runs")
    except subprocess.TimeoutExpired:
        fail("cleanup_run", "timeout"); return
    except Exception as e:
        fail("cleanup_run", str(e))

def test_evidence_emitted():
    """Evidence JSON exists with last_run_time, rows_pruned"""
    p = Path("documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json")
    if not p.exists():
        fail("evidence", "TEAM_60_CLEANUP_EVIDENCE.json missing"); return
    try:
        d = json.loads(p.read_text())
        if "last_run_time" not in d:
            fail("evidence", "missing last_run_time"); return
        if "intraday" not in d or "daily" not in d:
            fail("evidence", "missing intraday/daily"); return
        ok("evidence_emitted")
    except Exception as e:
        fail("evidence", str(e))

def main():
    print("=== Suite D: Retention & Cleanup ===\n")
    test_cleanup_runs()
    test_evidence_emitted()
    print()
    if FAILS:
        print(f"FAILED: {len(FAILS)}")
        for f in FAILS:
            print(f"  - {f}")
        sys.exit(1)
    print("PASS")
    sys.exit(0)

if __name__ == "__main__":
    main()
