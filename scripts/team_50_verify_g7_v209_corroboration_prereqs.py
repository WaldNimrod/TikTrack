#!/usr/bin/env python3
"""
Team 50 — Pre-Corroboration Validation for GATE_7 Part A v2.0.9
TEAM_90_..._MARKET_OPEN_WINDOW_MANDATE_v2.0.8
חובה: timestamp ב־JSON בתוך 09:30–16:00 ET (לא FORCE_MARKET_OPEN מחוץ לחלון).
"""
import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOG_PATH = PROJECT_ROOT / "documentation/05-REPORTS/artifacts/G7_PART_A_V2_0_9.log"
JSON_PATH = PROJECT_ROOT / "documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json"


def main():
    print("=== Team 50 — Pre-Corroboration Validation v2.0.9 ===")

    if not LOG_PATH.exists():
        print("BLOCK: Log not found —", LOG_PATH)
        print("  → Run: ./scripts/run_g7_cc01_v209_market_open_window.sh (during 09:30–16:00 ET Mon–Fri)")
        sys.exit(1)

    if LOG_PATH.stat().st_size == 0:
        print("BLOCK: Log is empty.")
        sys.exit(1)

    text = LOG_PATH.read_text(encoding="utf-8", errors="replace")
    if "mode=market_open" not in text:
        print("BLOCK: Log does not contain mode=market_open.")
        sys.exit(1)
    print("PASS: Log contains mode=market_open")

    # Timestamp MUST be within 09:30–16:00 ET (BF-G7PA-801)
    sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
    from team_50_verify_timestamp_in_et_window import is_timestamp_in_market_open_et
    if not JSON_PATH.exists():
        print("BLOCK: JSON not found.")
        sys.exit(1)
    data = json.loads(JSON_PATH.read_text())
    ts = data.get("timestamp_utc") or data.get("job_started_at")
    if not ts:
        print("BLOCK: No timestamp in JSON.")
        sys.exit(1)
    if not is_timestamp_in_market_open_et(ts):
        print(f"BLOCK: timestamp {ts} outside 09:30–16:00 ET. Not admissible (BF-G7PA-801).")
        sys.exit(1)
    print(f"PASS: timestamp {ts} within 09:30–16:00 ET")

    # Parse log for counts (same logic as verify_g7_part_a_runtime)
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "verify_g7", PROJECT_ROOT / "scripts/verify_g7_part_a_runtime.py"
    )
    vmod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(vmod)
    evidence = vmod.parse_log_for_evidence(str(LOG_PATH), from_position=0)
    cc01 = evidence["yahoo_call_count"]
    if cc01 > 5:
        print(f"BLOCK: cc_01_yahoo_call_count={cc01} exceeds ≤5.")
        sys.exit(1)
    print(f"PASS: cc_01_yahoo_call_count={cc01} (≤5)")

    if data.get("pass_01") is False:
        print("BLOCK: JSON has pass_01=false.")
        sys.exit(1)

    print("=== All prereqs satisfied. Team 50 may submit Corroboration v2.0.9. ===")
    sys.exit(0)


if __name__ == "__main__":
    main()
