#!/usr/bin/env python3
"""
Yahoo Finance — אות חיים (heartbeat).
פשוט: להביא מהספק נתון כלשהו — לפחות שורה אחת.
SPEC-PROV-YF-HIST. v8/chart (עובד). ללא 250 יום — רק proof of connection.
"""

import sys
from pathlib import Path

_project = Path(__file__).parent.parent
sys.path.insert(0, str(_project))

SYMBOL = "AAPL"


def main() -> int:
    """מינימום — יום אחד. אם יש — החיבור חי."""
    try:
        from api.integrations.market_data.providers.yahoo_provider import _fetch_history_sync

        # trading_days=1 — הכי פשוט; v8/chart range=1y מספיק
        hist = _fetch_history_sync(SYMBOL, 1)
    except Exception as e:
        print(f"FAIL — Yahoo heartbeat: {e}")
        return 1

    if hist and len(hist) >= 1:
        row = hist[0]
        print(f"OK — Yahoo heartbeat: 1+ row, {SYMBOL} {row.date.strftime('%Y-%m-%d')} close={row.close_price}")
        return 0

    print("FAIL — Yahoo heartbeat: 0 rows")
    return 1


if __name__ == "__main__":
    sys.exit(main())
