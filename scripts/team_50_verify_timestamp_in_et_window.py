#!/usr/bin/env python3
"""
Team 50 — Verify timestamp is within 09:30–16:00 ET (Mon–Fri).
CC-01 admissibility: Forced mode=market_open outside this window is NOT admissible.
"""
import sys
from datetime import datetime

try:
    from zoneinfo import ZoneInfo
    ET = ZoneInfo("America/New_York")
except ImportError:
    import pytz
    ET = pytz.timezone("America/New_York")


def is_timestamp_in_market_open_et(ts_utc_str: str) -> bool:
    """ts_utc_str: ISO format e.g. 2026-03-12T14:35:00Z or 2026-03-12T14:35:00.123456+00:00"""
    try:
        if "Z" in ts_utc_str:
            ts = datetime.fromisoformat(ts_utc_str.replace("Z", "+00:00"))
        else:
            ts = datetime.fromisoformat(ts_utc_str)
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=datetime.now().astimezone().tzinfo)
        et = ts.astimezone(ET)
        if et.weekday() >= 5:  # Sat/Sun
            return False
        open_min = 9 * 60 + 30
        close_min = 16 * 60
        now_min = et.hour * 60 + et.minute
        return open_min <= now_min < close_min
    except Exception:
        return False


if __name__ == "__main__":
    import json
    from pathlib import Path
    project = Path(__file__).resolve().parent.parent
    json_path = project / "documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json"
    if not json_path.exists():
        print("BLOCK: JSON not found")
        sys.exit(1)
    data = json.loads(json_path.read_text())
    # Prefer job_started_at (actual run time); timestamp_utc from verify script.
    ts = data.get("job_started_at") or data.get("timestamp_utc")
    if not ts or "T" not in str(ts):  # need full ISO timestamp (job_started_at / timestamp_utc)
        print("BLOCK: No valid ISO timestamp in JSON (need job_started_at or timestamp_utc)")
        sys.exit(1)
    if is_timestamp_in_market_open_et(ts):
        print(f"PASS: {ts} is within 09:30–16:00 ET")
        sys.exit(0)
    else:
        print(f"BLOCK: {ts} is outside 09:30–16:00 ET (Mon–Fri). Not admissible for CC-01.")
        sys.exit(1)
