#!/usr/bin/env python3
"""
EOD Sync — Ticker Prices (Gate B Gaps)
Team 20 — TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE
TEAM_90_RATELIMIT_SCALING_LOCK — Single-Flight, Cooldown on 429, טיקרים מ-DB בלבד

Providers: Yahoo Finance (Primary) → Alpha Vantage (Fallback).
Fallback: when both fail (e.g. weekend) → use last-known price from ticker_prices.
Loads tickers from market_data.tickers, fetches EOD prices, saves to market_data.ticker_prices.
Cron: similar to FX (e.g. 0 22 * * 1-5 UTC).
"""

import asyncio
import os
import sys
try:
    import fcntl
except ImportError:
    fcntl = None  # Windows — fallback to no lock
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

DECIMAL_SCALE = Decimal("0.00000001")

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL: Optional[str] = None
ALPHA_VANTAGE_API_KEY: Optional[str] = None

if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
            elif line.startswith("ALPHA_VANTAGE_API_KEY=") and not line.startswith("#"):
                ALPHA_VANTAGE_API_KEY = line.split("=", 1)[1].strip().strip("'\"").strip()
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not ALPHA_VANTAGE_API_KEY:
    ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
if ALPHA_VANTAGE_API_KEY:
    os.environ["ALPHA_VANTAGE_API_KEY"] = ALPHA_VANTAGE_API_KEY
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

sys.path.insert(0, str(_project))


def _quantize(raw) -> Optional[Decimal]:
    if raw is None:
        return None
    try:
        return Decimal(str(float(raw))).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
    except (TypeError, ValueError):
        return None


def _is_429(e: Exception) -> bool:
    """Detect 429 rate limit from exception."""
    s = str(e).lower()
    return "429" in s or "too many" in s or "rate limit" in s


async def fetch_prices_for_tickers(
    tickers: List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]]
) -> List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """Yahoo (Primary) → Alpha (Fallback). Cooldown on 429. Per CORRECTIVE: CRYPTO uses provider mapping, Alpha DIGITAL_CURRENCY_DAILY."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider
    from api.integrations.market_data.provider_cooldown import set_cooldown, is_in_cooldown, get_cooldown_status
    from api.integrations.market_data.provider_mapping_utils import get_provider_mapping, resolve_symbols_for_fetch
    from api.integrations.market_data.market_data_settings import get_provider_cooldown_minutes

    cooldown_min = get_provider_cooldown_minutes()
    # SOP-015: Cooldown Protocol — log status for Team 90 audit
    for prov, _until, sec in get_cooldown_status():
        print(f"📋 [SOP-015] {prov} in cooldown: {sec}s remaining")
    yahoo = YahooProvider()
    alpha = AlphaProvider()
    results = []
    yahoo_skipped = alpha_skipped = False

    for ticker_id, symbol, ticker_type, metadata in tickers:
        pm = get_provider_mapping(symbol, ticker_type or "STOCK", None, metadata)
        yahoo_sym, alpha_sym, alpha_market = resolve_symbols_for_fetch(symbol, ticker_type or "STOCK", pm)
        pr = None
        for provider, name, use_sym, use_crypto in [
            (yahoo, "YAHOO_FINANCE", yahoo_sym, False),
            (alpha, "ALPHA_VANTAGE", alpha_sym, ticker_type == "CRYPTO"),
        ]:
            if is_in_cooldown(name):
                if not (yahoo_skipped if name == "YAHOO_FINANCE" else alpha_skipped):
                    print(f"⚠️ {name} in cooldown — skipping")
                if name == "YAHOO_FINANCE":
                    yahoo_skipped = True
                else:
                    alpha_skipped = True
                continue
            try:
                if use_crypto and provider is alpha:
                    pr = await alpha.get_ticker_price_crypto(alpha_sym, alpha_market)
                else:
                    pr = await provider.get_ticker_price(use_sym)
                if pr and pr.price and pr.price > 0:
                    results.append((
                        ticker_id,
                        symbol,
                        pr.price,
                        pr.open_price,
                        pr.high_price,
                        pr.low_price,
                        pr.close_price or pr.price,
                        pr.volume,
                        pr.market_cap,
                        pr.as_of or datetime.now(timezone.utc),
                        pr.provider or "unknown",
                    ))
                    break
            except Exception as e:
                if _is_429(e):
                    set_cooldown(name, cooldown_min)
                    print(f"⚠️ {name} 429 — cooldown {cooldown_min}min")
                print(f"⚠️ {name} {symbol}: {e}")
        else:
            # Both providers failed (e.g. weekend) — fallback to last-known price from DB
            last = _get_last_known_price(ticker_id, symbol)
            if last:
                results.append(last)
                print(f"📌 {symbol}: using last-known price (providers unavailable)")
            else:
                print(f"⚠️ No price for {symbol} (ticker_id={ticker_id})")

    return results


def _get_last_known_price(
    ticker_id: UUID, symbol: str
) -> Optional[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """When providers fail (weekend etc.) — return most recent row from ticker_prices."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp
            FROM market_data.ticker_prices
            WHERE ticker_id = %s
            ORDER BY price_timestamp DESC
            LIMIT 1
        """, (str(ticker_id),))
        row = cur.fetchone()
        if not row or not row.get("price") or float(row["price"]) <= 0:
            return None
        ts = row.get("price_timestamp")
        if ts and getattr(ts, "tzinfo", None) is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if not ts:
            ts = datetime.now(timezone.utc)
        close_val = row.get("close_price") or row.get("price")
        return (
            ticker_id,
            symbol,
            Decimal(str(row["price"])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP),
            Decimal(str(row["open_price"])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row.get("open_price") else None,
            Decimal(str(row["high_price"])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row.get("high_price") else None,
            Decimal(str(row["low_price"])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row.get("low_price") else None,
            Decimal(str(close_val)).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if close_val else None,
            int(row["volume"]) if row.get("volume") is not None else None,
            Decimal(str(row["market_cap"])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row.get("market_cap") else None,
            ts,
            "LAST_KNOWN",
        )
    finally:
        conn.close()


def _next_month(year: int, month: int) -> Tuple[int, int]:
    if month == 12:
        return year + 1, 1
    return year, month + 1


def ensure_partition(conn, year: int, month: int) -> None:
    """Create partition for given month if not exists. Handles partitioned table."""
    part_name = f"ticker_prices_{year}_{month:02d}"
    start_s = f"{year}-{month:02d}-01"
    ny, nm = _next_month(year, month)
    end_s = f"{ny}-{nm:02d}-01"
    cur = conn.cursor()
    try:
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS market_data.{part_name}
            PARTITION OF market_data.ticker_prices
            FOR VALUES FROM (%s) TO (%s)
        """, (start_s, end_s))
        conn.commit()
    except Exception as e:
        if "already exists" not in str(e).lower():
            print(f"⚠️ Partition {part_name}: {e}")
        conn.rollback()
    finally:
        cur.close()


def upsert_prices(
    rows: List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]
) -> int:
    import psycopg2

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc)
        try:
            ensure_partition(conn, now.year, now.month)
        except Exception:
            pass  # May not have dateutil or partition might exist

        inserted = 0
        for ticker_id, symbol, price, o, h, l, c, vol, mc, as_of, provider in rows:
            try:
                cur.execute("""
                    DELETE FROM market_data.ticker_prices
                    WHERE ticker_id = %s AND date(price_timestamp AT TIME ZONE 'UTC') = date(%s AT TIME ZONE 'UTC')
                """, (str(ticker_id), as_of))
                cur.execute("""
                    INSERT INTO market_data.ticker_prices
                    (ticker_id, provider_id, price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp, fetched_at, is_stale)
                    VALUES (%s, NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, false)
                """, (
                    str(ticker_id),
                    price,
                    o,
                    h,
                    l,
                    c,
                    vol,
                    mc,
                    as_of,
                    now,
                ))
                inserted += 1
            except Exception as e:
                print(f"⚠️ Insert {symbol}: {e}")
                conn.rollback()
                cur = conn.cursor()
                continue
        conn.commit()
        return inserted
    finally:
        conn.close()


def load_tickers() -> List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]]:
    """Load tickers for EOD sync. P3-010: EOD covers ALL tickers (active + inactive).
    Per MARKET_DATA_PIPE_SPEC §2.4: 'EOD ליתר' — inactive get EOD only.
    Intraday (sync_ticker_prices_intraday) loads is_active=true only."""
    import psycopg2
    from psycopg2.extras import RealDictCursor
    import json
    from api.integrations.market_data.market_data_settings import get_max_active_tickers

    max_tickers = get_max_active_tickers()
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT id, symbol, COALESCE(ticker_type, 'STOCK') AS ticker_type, metadata
            FROM market_data.tickers
            WHERE (deleted_at IS NULL OR deleted_at > NOW())
            ORDER BY is_active DESC NULLS LAST, symbol
            LIMIT %s
        """, (max_tickers,))
        rows = cur.fetchall()
        out = []
        for r in rows:
            meta = r.get("metadata")
            if not isinstance(meta, dict) and isinstance(meta, str):
                try:
                    meta = json.loads(meta) if meta else None
                except (json.JSONDecodeError, TypeError):
                    meta = None
            out.append((r["id"], r["symbol"], r["ticker_type"] or "STOCK", meta))
        return out
    finally:
        conn.close()


def main():
    fd = None
    if fcntl:
        lock_path = _project / "scripts" / ".sync_ticker_prices.lock"
        try:
            fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("⚠️ Another sync already running (Single-Flight). Exit.")
            if fd is not None:
                os.close(fd)
            sys.exit(0)
        except Exception as e:
            print(f"⚠️ Lock error: {e}")
            sys.exit(0)

    try:
        print("🔄 EOD sync — ticker_prices (Yahoo→Alpha, Single-Flight)")
        tickers = load_tickers()
        if not tickers:
            print("⚠️ No tickers in market_data.tickers. Run: python3 scripts/seed_market_data_tickers.py")
            sys.exit(0)

        rows = asyncio.run(fetch_prices_for_tickers(tickers))
        if not rows:
            print("⚠️ No prices fetched. Exit 0.")
            sys.exit(0)

        n = upsert_prices(rows)
        print(f"✅ Upserted {n} ticker prices to market_data.ticker_prices")
    finally:
        if fd is not None and fcntl:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
    sys.exit(0)


if __name__ == "__main__":
    main()
