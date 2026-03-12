#!/usr/bin/env python3
"""
Team 50 — Pre-Corroboration Validation for GATE_7 Part A v2.0.7
חובה: הרץ לפני כתיבת Corroboration. Exit 0 רק אם כל התנאים מתקיימים.
מונע הגשת corroboration ללא mode=market_open (סיבת BLOCK v2.0.6).
Parse-only — אין טריגר ל־backend; בודק לוג קיים.
"""
import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOG_PATH = PROJECT_ROOT / "documentation/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log"
JSON_PATH = PROJECT_ROOT / "documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json"


def main():
    print("=== Team 50 — Pre-Corroboration Validation v2.0.7 ===")

    # 1) Log exists
    if not LOG_PATH.exists():
        print("BLOCK: Log not found —", LOG_PATH)
        print("  → Run: ./scripts/run_g7_cc01_v207_market_open.sh (during 09:30–16:00 ET Mon–Fri)")
        sys.exit(1)

    # 2) Log not empty
    if LOG_PATH.stat().st_size == 0:
        print("BLOCK: Log is empty.")
        sys.exit(1)

    # 3) Log MUST contain mode=market_open (root cause of v2.0.6 BLOCK)
    text = LOG_PATH.read_text(encoding="utf-8", errors="replace")
    if "mode=market_open" not in text:
        print("BLOCK: Log does not contain mode=market_open (CC-01 inadmissible).")
        print("  → v2.0.6 failed because log had mode=off_hours (run was before 09:30 ET).")
        print("  → Run: ./scripts/run_g7_cc01_v207_market_open.sh during 09:30–16:00 ET Mon–Fri")
        sys.exit(1)
    print("PASS: Log contains mode=market_open")

    # 4) Parse log for CC-01 count (no backend trigger)
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "verify_g7", PROJECT_ROOT / "scripts/verify_g7_part_a_runtime.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    evidence = mod.parse_log_for_evidence(str(LOG_PATH), from_position=0)
    cc01 = evidence["yahoo_call_count"]
    cc04 = evidence["yahoo_429_count"]

    # 5) CC-01 threshold
    if cc01 > 5:
        print(f"BLOCK: cc_01_yahoo_call_count={cc01} exceeds threshold ≤5.")
        sys.exit(1)
    print(f"PASS: cc_01_yahoo_call_count={cc01} (≤5)")

    # 6) Optional: JSON consistency (if exists and has pass_01)
    if JSON_PATH.exists():
        try:
            data = json.loads(JSON_PATH.read_text())
            if data.get("pass_01") is False:
                print("BLOCK: JSON has pass_01=false.")
                sys.exit(1)
        except Exception:
            pass

    print("=== All prereqs satisfied. Team 50 may submit Corroboration v2.0.7. ===")
    print(f"log_path={LOG_PATH}")
    print(f"cc_01_yahoo_call_count={cc01}")
    print(f"cc_04_yahoo_429_count={cc04}")
    sys.exit(0)


if __name__ == "__main__":
    main()
