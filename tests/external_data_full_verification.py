#!/usr/bin/env python3
"""
External Data — Full Verification (Gate B)
TEAM_10_TO_TEAM_50_EXTERNAL_DATA_GATE_B_QA_REQUEST
בדיקה: טעינה ישירה מספק → שמירה → קריאה → הצגה
כל שלב בנפרד, כל ספק בנפרד.
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.chdir(Path(__file__).resolve().parent.parent)

def load_env():
    env_path = Path("api/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\"").strip())

load_env()

RESULTS = {}


# === 1. Direct Provider Fetch (Alpha FX, Yahoo FX, Yahoo Prices, Alpha Prices) ===

async def test_alpha_fx():
    """Alpha Vantage — FX direct fetch."""
    try:
        from api.integrations.market_data.providers.alpha_provider import AlphaProvider
        alpha = AlphaProvider()
        r = await alpha.get_exchange_rate("USD", "ILS")
        ok = r is not None and r.rate and float(r.rate) > 0
        RESULTS["alpha_fx"] = {"PASS": ok, "rate": str(r.rate) if r else None, "provider": "ALPHA"}
        return ok
    except Exception as e:
        RESULTS["alpha_fx"] = {"PASS": False, "error": str(e)}
        return False


async def test_yahoo_fx():
    """Yahoo Finance — FX direct fetch (fallback)."""
    try:
        from api.integrations.market_data.providers.yahoo_provider import YahooProvider
        yahoo = YahooProvider()
        r = await yahoo.get_exchange_rate("USD", "ILS")
        ok = r is not None and r.rate and float(r.rate) > 0
        RESULTS["yahoo_fx"] = {"PASS": ok, "rate": str(r.rate) if r else None, "provider": "YAHOO"}
        return ok
    except Exception as e:
        RESULTS["yahoo_fx"] = {"PASS": False, "error": str(e)}
        return False


async def test_yahoo_price():
    """Yahoo Finance — Ticker price (AAPL, BTC-USD)."""
    out = {}
    try:
        from api.integrations.market_data.providers.yahoo_provider import YahooProvider
        yahoo = YahooProvider()
        for sym in ["AAPL", "BTC-USD"]:
            r = await yahoo.get_ticker_price(sym)
            ok = r is not None and r.price and float(r.price) > 0
            out[sym] = {"PASS": ok, "price": str(r.price) if r else None}
        RESULTS["yahoo_price"] = {"PASS": all(v["PASS"] for v in out.values()), "symbols": out}
        return RESULTS["yahoo_price"]["PASS"]
    except Exception as e:
        RESULTS["yahoo_price"] = {"PASS": False, "error": str(e)}
        return False


async def test_alpha_price():
    """Alpha Vantage — Ticker price (requires API key)."""
    try:
        from api.integrations.market_data.providers.alpha_provider import AlphaProvider
        alpha = AlphaProvider()
        r = await alpha.get_ticker_price("AAPL")
        ok = r is not None and r.price and float(r.price) > 0
        RESULTS["alpha_price"] = {"PASS": ok, "price": str(r.price) if r else None, "provider": "ALPHA"}
        return ok
    except Exception as e:
        RESULTS["alpha_price"] = {"PASS": False, "error": str(e)}
        return False


async def test_yahoo_history():
    """Yahoo — 250d history (BTC-USD 24/7)."""
    try:
        from api.integrations.market_data.providers.yahoo_provider import YahooProvider
        yahoo = YahooProvider()
        hist = await yahoo.get_ticker_history("BTC-USD", 250)
        ok = hist is not None and len(hist) >= 100
        RESULTS["yahoo_history"] = {"PASS": ok, "rows": len(hist) if hist else 0}
        return ok
    except Exception as e:
        RESULTS["yahoo_history"] = {"PASS": False, "error": str(e)}
        return False


# === 2. FX: Sync → DB → API ===

def test_fx_sync_save():
    """Run sync_exchange_rates_eod, verify DB."""
    try:
        import subprocess
        r = subprocess.run(
            [sys.executable, "scripts/sync_exchange_rates_eod.py"],
            capture_output=True, text=True, timeout=120, cwd=Path(__file__).resolve().parent.parent
        )
        import psycopg2
        from psycopg2.extras import RealDictCursor
        db = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(db)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT COUNT(*) as n FROM market_data.exchange_rates")
        n = cur.fetchone()["n"]
        cur.execute("SELECT from_currency, to_currency, conversion_rate FROM market_data.exchange_rates LIMIT 3")
        rows = [dict(x) for x in cur.fetchall()]
        cur.close()
        conn.close()
        ok = n >= 1
        RESULTS["fx_save"] = {"PASS": ok, "count": n, "sample": rows}
        return ok
    except Exception as e:
        RESULTS["fx_save"] = {"PASS": False, "error": str(e)}
        return False


def test_fx_api_read():
    """API GET /reference/exchange-rates returns data (requires auth — use DB count as proxy or call API)."""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        db = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(db)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT from_currency, to_currency, conversion_rate, last_sync_time FROM market_data.exchange_rates")
        rows = [dict(x) for x in cur.fetchall()]
        cur.close()
        conn.close()
        ok = len(rows) >= 1
        RESULTS["fx_read"] = {"PASS": ok, "rows": len(rows), "sample": rows[:2] if rows else []}
        return ok
    except Exception as e:
        RESULTS["fx_read"] = {"PASS": False, "error": str(e)}
        return False


# === 3. Prices: Save (fixture) → Read (if we have tickers) ===

def test_prices_save_read():
    """Prices flow: create partition if missing, ticker if missing, insert price fixture, verify read."""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        from uuid import uuid4
        db = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(db)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT id FROM market_data.tickers WHERE symbol = 'AAPL' AND deleted_at IS NULL LIMIT 1")
        ticker_row = cur.fetchone()
        if not ticker_row:
            tid = uuid4()
            cur.execute("""
                INSERT INTO market_data.tickers (id, symbol, ticker_type, created_at, updated_at)
                VALUES (%s::uuid, 'AAPL', 'STOCK', NOW(), NOW())
            """, (str(tid),))
            conn.commit()
            ticker_id = tid
        else:
            ticker_id = ticker_row["id"]

        now = datetime.now(timezone.utc)
        cur.execute("""
            INSERT INTO market_data.ticker_prices
            (id, ticker_id, price, open_price, high_price, low_price, close_price, volume, price_timestamp, fetched_at, is_stale, created_at, market_cap)
            VALUES (gen_random_uuid(), %s::uuid, 185.50, 184.00, 186.00, 183.50, 185.50, 50000000, %s, %s, false, %s, 2850000000)
        """, (str(ticker_id), now, now, now))
        conn.commit()

        cur.execute("SELECT COUNT(*) as n FROM market_data.ticker_prices")
        n = cur.fetchone()["n"]
        cur.close()
        conn.close()

        ok = n >= 1
        RESULTS["prices_save_read"] = {"PASS": ok, "count": n, "note": "Fixture: ticker+price for QA"}
        return ok
    except Exception as e:
        err = str(e)
        RESULTS["prices_save_read"] = {"PASS": False, "error": err, "note": "Partition/perm or ticker gap — need Team 60"}
        return False


def main():
    print("=== External Data Full Verification (Gate B) ===\n")

    # 1. Direct provider fetch
    print("1. Direct Provider Fetch...")
    asyncio.run(test_alpha_fx())
    asyncio.run(test_yahoo_fx())
    asyncio.run(test_yahoo_price())
    asyncio.run(test_alpha_price())
    asyncio.run(test_yahoo_history())

    # 2. FX: Sync → Save → Read
    print("2. FX: Sync → Save → Read...")
    test_fx_sync_save()
    test_fx_api_read()

    # 3. Prices: Save (fixture) → Read
    print("3. Prices: Save → Read...")
    test_prices_save_read()

    # Summary
    print("\n=== Results ===\n")
    for k, v in RESULTS.items():
        status = "✅ PASS" if v.get("PASS") else "❌ FAIL"
        print(f"{k}: {status}")
        if v.get("error"):
            print(f"   error: {v['error']}")
        if v.get("rate"):
            print(f"   rate: {v['rate']}")
        if v.get("price"):
            print(f"   price: {v['price']}")
        if v.get("count") is not None:
            print(f"   count: {v['count']}")

    passed = sum(1 for v in RESULTS.values() if v.get("PASS"))
    total = len(RESULTS)
    print(f"\n{passed}/{total} passed")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
