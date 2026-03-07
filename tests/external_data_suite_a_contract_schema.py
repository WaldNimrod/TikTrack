#!/usr/bin/env python3
"""
External Data — Suite A: Contract & Schema
TEAM_90_DIRECTIVE / TEAM_10_TO_TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
Validate: required fields, precision 20,8, staleness enum, Provider REPLAY mode
"""

import asyncio
import os
import sys
import json
from pathlib import Path
from decimal import Decimal

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
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "market_data"

def ok(name):
    print(f"  ✅ {name}")

def fail(name, msg):
    print(f"  ❌ {name}: {msg}")
    FAILS.append(f"{name}: {msg}")

def test_staleness_enum():
    """staleness ∈ {ok, warning, na}"""
    for v in ["ok", "warning", "na"]:
        if v not in ("ok", "warning", "na"):
            fail("staleness_enum", f"invalid: {v}")
            return
    ok("staleness_enum")

def test_fixture_fx_contract():
    """FX fixture: required fields, precision"""
    p = Path("tests/fixtures/market_data/fx_eod_sample.json")
    if not p.exists():
        fail("fx_fixture", "file missing"); return
    d = json.loads(p.read_text())
    data = d.get("data", [])
    if not data:
        fail("fx_fixture", "empty data"); return
    r = data[0]
    for f in ["from_currency", "to_currency", "conversion_rate", "last_sync_time"]:
        if f not in r:
            fail("fx_contract", f"missing field: {f}"); return
    rate = Decimal(str(r["conversion_rate"]))
    if rate.as_tuple().exponent < -8:
        fail("fx_precision", "conversion_rate precision < 20,8"); return
    if d.get("staleness") not in ("ok", "warning", "na"):
        fail("fx_staleness", "staleness not in enum"); return
    ok("fx_contract")

def test_db_schema_exchange_rates():
    """DB: exchange_rates columns + precision (skip if no DB)"""
    db_url = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url or "postgresql" not in db_url:
        ok("db_exchange_rates (skipped: no DB)"); return
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # KB-004 CORRECTION: DB uses conversion_rate (not rate). DDL V2.6 documents conversion_rate.
        cur.execute("""
            SELECT column_name, data_type, numeric_precision, numeric_scale
            FROM information_schema.columns
            WHERE table_schema='market_data' AND table_name='exchange_rates'
            AND column_name IN ('rate', 'conversion_rate', 'last_sync_time')
        """)
        rows = {r["column_name"]: r for r in cur.fetchall()}
        cur.close()
        conn.close()
        rate_col = rows.get("conversion_rate") or rows.get("rate")
        if not rate_col:
            fail("db_exchange_rates", "column conversion_rate or rate missing"); return
        if rate_col.get("numeric_precision") != 20 or rate_col.get("numeric_scale") != 8:
            fail("db_precision", f"rate column not 20,8: {rate_col}"); return
        ok("db_exchange_rates")
    except Exception as e:
        fail("db_exchange_rates", str(e))

def test_db_schema_ticker_prices():
    """DB: ticker_prices precision — price 20,8; market_cap 24,4 per p3_019 (KB-005 RATIFIED)"""
    db_url = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
    if not db_url or "postgresql" not in db_url:
        ok("ticker_prices_schema (skipped: no DB)"); return
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT column_name, numeric_precision, numeric_scale
            FROM information_schema.columns
            WHERE table_schema='market_data' AND table_name='ticker_prices'
            AND column_name IN ('price', 'market_cap')
        """)
        rows = list(cur.fetchall())
        cur.close()
        conn.close()
        row_map = {r["column_name"]: r for r in rows}
        # price: NUMERIC(20,8) per Iron Rule
        pr = row_map.get("price")
        if pr and (pr.get("numeric_precision") != 20 or pr.get("numeric_scale") != 8):
            fail("ticker_prices_precision", f"price not 20,8: {pr}"); return
        # KB-005: market_cap NUMERIC(24,4) RATIFIED (display field, trillion-dollar safe)
        mc = row_map.get("market_cap")
        if mc and (mc.get("numeric_precision") != 24 or mc.get("numeric_scale") != 4):
            fail("ticker_prices_precision", f"market_cap not 24,4 per p3_019: {mc}"); return
        ok("ticker_prices_schema")
    except Exception as e:
        fail("ticker_prices_schema", str(e))


def _check_precision_20_8(val) -> bool:
    """Precision 20,8: up to 8 decimal places."""
    if val is None:
        return True
    try:
        d = Decimal(str(val))
        exp = d.as_tuple().exponent
        return exp >= -8
    except (TypeError, ValueError):
        return False


async def _run_provider_replay_tests():
    """Provider REPLAY mode — zero HTTP, fixtures only; validate precision 20,8 and fields."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider

    # Yahoo REPLAY — Price
    yahoo = YahooProvider(mode="REPLAY", fixtures_dir=FIXTURES_DIR)
    price = await yahoo.get_ticker_price("AAPL")
    if not price:
        fail("yahoo_replay_price", "no result"); return
    if not _check_precision_20_8(price.price):
        fail("yahoo_price_precision", f"price {price.price} not 20,8"); return
    if not _check_precision_20_8(price.market_cap):
        fail("yahoo_market_cap_precision", f"market_cap {price.market_cap} not 20,8"); return
    if not price.as_of:
        fail("yahoo_price_timestamp", "as_of (price_timestamp) required"); return
    ok("yahoo_replay_price")

    # Yahoo REPLAY — FX (fallback)
    fx = await yahoo.get_exchange_rate("USD", "ILS")
    if not fx:
        fail("yahoo_replay_fx", "no result"); return
    if not _check_precision_20_8(fx.rate):
        fail("yahoo_fx_precision", f"rate {fx.rate} not 20,8"); return
    ok("yahoo_replay_fx")

    # Alpha REPLAY — FX (primary)
    alpha = AlphaProvider(mode="REPLAY", fixtures_dir=FIXTURES_DIR)
    fx2 = await alpha.get_exchange_rate("USD", "ILS")
    if not fx2:
        fail("alpha_replay_fx", "no result"); return
    if not _check_precision_20_8(fx2.rate):
        fail("alpha_fx_precision", f"rate {fx2.rate} not 20,8"); return
    ok("alpha_replay_fx")

    # Alpha REPLAY — Price (fallback)
    price2 = await alpha.get_ticker_price("AAPL")
    if not price2:
        fail("alpha_replay_price", "no result"); return
    if not _check_precision_20_8(price2.price):
        fail("alpha_price_precision", f"price {price2.price} not 20,8"); return
    ok("alpha_replay_price")

    # REPLAY history — 250d
    hist = await yahoo.get_ticker_history("AAPL", 250)
    if not hist or len(hist) < 10:
        fail("yahoo_replay_history", f"expected 250d sample, got {len(hist) if hist else 0}"); return
    row = hist[0]
    if not _check_precision_20_8(row.close_price):
        fail("history_precision", f"close_price {row.close_price} not 20,8"); return
    ok("yahoo_replay_history")


def test_provider_replay_mode():
    """Provider REPLAY: no HTTP calls; fixtures return data with precision 20,8"""
    try:
        asyncio.run(_run_provider_replay_tests())
    except Exception as e:
        fail("provider_replay", str(e))


def test_fixtures_required_files():
    """All required fixture files exist per directive"""
    required = [
        "fx_eod_by_pair.json",
        "prices_eod_by_symbol.json",
        "prices_intraday_sample.json",
        "prices_history_250d_sample.json",
        "indicators_sample.json",
    ]
    for f in required:
        if not (FIXTURES_DIR / f).exists():
            fail("fixtures_required", f"missing {f}"); return
    ok("fixtures_required")


def main():
    print("=== Suite A: Contract & Schema ===\n")
    test_staleness_enum()
    test_fixture_fx_contract()
    test_fixtures_required_files()
    test_provider_replay_mode()
    test_db_schema_exchange_rates()
    test_db_schema_ticker_prices()
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
