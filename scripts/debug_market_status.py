#!/usr/bin/env python3
"""
אבחון — Yahoo Market Status (TEAM_30_TO_TEAM_20_MARKET_STATUS_DASH_DIAGNOSTIC)
בודק: קריאה ל־v7/quote, שדה marketState, סטטוס HTTP.
"""

import sys
from pathlib import Path

_project = Path(__file__).parent.parent
sys.path.insert(0, str(_project))

def main():
    print("=== Yahoo Market Status Diagnostic ===\n")
    try:
        from api.integrations.market_data.providers.yahoo_provider import _fetch_market_status_sync
        state = _fetch_market_status_sync()
        print(f"Result: marketState = {repr(state)}")
        if state:
            print("OK — Yahoo returned market state")
        else:
            print("FAIL — Yahoo returned None (check logs: 429? 401? empty result?)")
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        sys.exit(1)

    print("\n--- Raw HTTP test ---")
    try:
        import httpx
        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        r = httpx.get(url, params={"symbols": "SPY"}, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        print(f"HTTP status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            results = data.get("quoteResponse", {}).get("result", [])
            print(f"Results count: {len(results)}")
            if results:
                q = results[0]
                ms = q.get("marketState")
                print(f"marketState: {repr(ms)}")
        else:
            print(f"Body: {r.text[:300]}")
    except Exception as e:
        print(f"Raw HTTP error: {e}")
    print("\n--- Done ---")

if __name__ == "__main__":
    main()
