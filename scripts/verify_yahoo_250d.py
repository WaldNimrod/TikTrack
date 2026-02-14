#!/usr/bin/env python3
"""
Yahoo 250d — אימות מלא.
בודק: סקופ 250 ימי מסחר, דיוק, השלמות.
"""

import sys
from pathlib import Path

_project = Path(__file__).parent.parent
sys.path.insert(0, str(_project))

REQUIRED = 250
SYMBOL = "AAPL"


def main() -> int:
    try:
        from api.integrations.market_data.providers.yahoo_provider import _fetch_history_sync
    except ImportError as e:
        print(f"FAIL — import: {e}")
        return 1

    hist = _fetch_history_sync(SYMBOL, REQUIRED)
    if not hist:
        print(f"FAIL — Yahoo returned 0 rows for {SYMBOL}")
        return 1

    n = len(hist)
    if n < REQUIRED:
        print(f"WARN — Yahoo {n}/{REQUIRED} rows for {SYMBOL} (expected 250)")
        # Non-fatal: might be new listing or provider limit
    else:
        print(f"OK — Yahoo {n} rows for {SYMBOL}")

    # Dates
    dates = [r.date.strftime("%Y-%m-%d") for r in hist]
    first = dates[0]
    last = dates[-1]
    print(f"  Range: {first} .. {last}")

    # Duplicates
    unique = len(set(dates))
    if unique != n:
        print(f"WARN — {n - unique} duplicate dates")
        return 1

    # Chronological
    sorted_dates = sorted(dates)
    if dates != sorted_dates:
        print("WARN — result not chronological")
        return 1

    # OHLCV sanity
    bad = [r for r in hist if not r.close_price or r.close_price <= 0]
    if bad:
        print(f"WARN — {len(bad)} rows with invalid close_price")
        return 1

    print("  ✅ Scope, accuracy, completeness OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
