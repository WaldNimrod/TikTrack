#!/usr/bin/env python3
"""
Pre-flight check: US market open (09:30–16:00 ET, Mon–Fri).
CC-WP003-01 requires backend log to show mode=market_open — run verify_g7_part_a_runtime ONLY when this script exits 0.

Usage:
  python3 scripts/check_market_open_et.py && G7_PART_A_LOG_PATH=... G7_PART_A_MODE=market_open python3 scripts/verify_g7_part_a_runtime.py
"""
import sys
from datetime import datetime

try:
    from zoneinfo import ZoneInfo
    ET = ZoneInfo("America/New_York")
except ImportError:
    try:
        import pytz
        ET = pytz.timezone("America/New_York")
    except ImportError:
        print("FAIL: zoneinfo or pytz required")
        sys.exit(1)

def is_market_open_et() -> bool:
    now = datetime.now(ET)
    # Mon=0 .. Fri=4
    if now.weekday() >= 5:
        return False
    # 9:30 = (9, 30), 16:00 = (16, 0)
    open_min = 9 * 60 + 30
    close_min = 16 * 60
    now_min = now.hour * 60 + now.minute
    return open_min <= now_min < close_min

if __name__ == "__main__":
    ok = is_market_open_et()
    now_et = datetime.now(ET).strftime("%Y-%m-%d %H:%M:%S %Z")
    if ok:
        print(f"OK: US market OPEN — {now_et} (09:30–16:00 ET)")
        sys.exit(0)
    else:
        print(f"SKIP: US market CLOSED — {now_et}. Run during 09:30–16:00 ET Mon–Fri.")
        sys.exit(1)
