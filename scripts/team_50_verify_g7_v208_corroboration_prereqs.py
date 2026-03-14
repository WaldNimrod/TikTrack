#!/usr/bin/env python3
"""
Team 50 — Pre-Corroboration Validation for GATE_7 Part A v2.0.8
TEAM_90_TO_TEAM_60_TEAM_50_..._CC01_COMPLETION_MANDATE_v2.0.7
חובה: הרץ לפני כתיבת Corroboration. Exit 0 רק אם כל התנאים מתקיימים.
"""
import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOG_PATH = PROJECT_ROOT / "documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_8.log"
JSON_PATH = PROJECT_ROOT / "documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json"


def main():
    print("=== Team 50 — Pre-Corroboration Validation v2.0.8 ===")

    if not LOG_PATH.exists():
        print("BLOCK: Log not found —", LOG_PATH)
        print("  → Run: ./scripts/run_g7_cc01_v208_market_open.sh (during 09:30–16:00 ET Mon–Fri)")
        sys.exit(1)

    if LOG_PATH.stat().st_size == 0:
        print("BLOCK: Log is empty.")
        sys.exit(1)

    text = LOG_PATH.read_text(encoding="utf-8", errors="replace")
    if "mode=market_open" not in text:
        print("BLOCK: Log does not contain mode=market_open (CC-01 inadmissible).")
        print("  → Run: ./scripts/run_g7_cc01_v208_market_open.sh during 09:30–16:00 ET Mon–Fri")
        sys.exit(1)
    print("PASS: Log contains mode=market_open")

    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "verify_g7", PROJECT_ROOT / "scripts/verify_g7_part_a_runtime.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    evidence = mod.parse_log_for_evidence(str(LOG_PATH), from_position=0)
    cc01 = evidence["yahoo_call_count"]
    cc04 = evidence["yahoo_429_count"]

    if cc01 > 5:
        print(f"BLOCK: cc_01_yahoo_call_count={cc01} exceeds threshold ≤5.")
        sys.exit(1)
    print(f"PASS: cc_01_yahoo_call_count={cc01} (≤5)")

    if JSON_PATH.exists():
        try:
            data = json.loads(JSON_PATH.read_text())
            if data.get("pass_01") is False:
                print("BLOCK: JSON has pass_01=false.")
                sys.exit(1)
        except Exception:
            pass

    print("=== All prereqs satisfied. Team 50 may submit Corroboration v2.0.8. ===")
    print(f"log_path={LOG_PATH}")
    print(f"cc_01_yahoo_call_count={cc01}")
    print(f"cc_04_yahoo_429_count={cc04}")
    sys.exit(0)


if __name__ == "__main__":
    main()
