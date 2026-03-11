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
AUTO_WP003_05_SYMBOLS = ("ANAU.MI", "BTC-USD", "TEVA.TA", "SPY")

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


def _fetch_market_caps_batch_auto_wp003_05() -> Dict[str, Decimal]:
    """AUTO-WP003-05: Single Yahoo v7/quote request for all 4 symbols — reduces rate-limit risk."""
    from api.integrations.market_data.provider_cooldown import is_in_cooldown

    if is_in_cooldown("YAHOO_FINANCE"):
        return {}
    try:
        import httpx
        from api.integrations.market_data.providers.yahoo_provider import _next_user_agent

        url = "https://query1.finance.yahoo.com/v7/finance/quote"
        params = {"symbols": ",".join(AUTO_WP003_05_SYMBOLS)}
        headers = {"User-Agent": _next_user_agent()}
        with httpx.Client(timeout=8.0, headers=headers) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        results = (data or {}).get("quoteResponse", {}).get("result") or []
        out: Dict[str, Decimal] = {}
        for q in results:
            sym = q.get("symbol")
            raw = q.get("marketCap")
            if sym and raw is not None:
                mc = _quantize(float(raw))
                if mc:
                    out[sym] = mc
        return out
    except Exception:
        return {}


def _fetch_market_cap_for_symbol(symbol: str) -> Optional[Decimal]:
    """AUTO-WP003-05: Fetch market_cap when Yahoo v8 path didn't run (last-known, cooldown).
    Tries: Yahoo v7 → Alpha OVERVIEW (stocks; TEVA.TA→TEVA) → CoinGecko (BTC-USD) → yfinance."""
    from api.integrations.market_data.providers.yahoo_provider import _fetch_market_cap_only_v7
    from api.integrations.market_data.provider_cooldown import is_in_cooldown

    if not is_in_cooldown("YAHOO_FINANCE"):
        try:
            from concurrent.futures import ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=1) as ex:
                mc = ex.submit(_fetch_market_cap_only_v7, symbol).result(timeout=8)
            if mc is not None:
                return mc
        except Exception:
            pass

    # Alpha OVERVIEW for stocks (before yfinance — faster, no Yahoo dependency)
    # TEVA.TA → TEVA (Alpha has NYSE ADR); ANAU.MI → as-is (Alpha may not have)
    if symbol != "BTC-USD" and ALPHA_VANTAGE_API_KEY:
        alpha_sym = "TEVA" if symbol == "TEVA.TA" else symbol
        try:
            import httpx
            url = "https://www.alphavantage.co/query"
            params = {
                "function": "OVERVIEW",
                "symbol": alpha_sym,
                "apikey": ALPHA_VANTAGE_API_KEY,
            }
            with httpx.Client(timeout=10.0) as client:
                r = client.get(url, params=params)
                r.raise_for_status()
            data = r.json()
            mc_raw = data.get("MarketCapitalization")
            if mc_raw is not None:
                return _quantize(float(mc_raw))
        except Exception:
            pass

    # CoinGecko for BTC-USD (free, no key) — works when Yahoo/yfinance 429
    if symbol == "BTC-USD":
        try:
            import httpx
            url = "https://api.coingecko.com/api/v3/coins/markets"
            params = {"vs_currency": "usd", "ids": "bitcoin"}
            with httpx.Client(timeout=10.0) as client:
                r = client.get(url, params=params)
                r.raise_for_status()
            data = r.json()
            if isinstance(data, list) and data:
                mc_raw = data[0].get("market_cap")
                if mc_raw is not None:
                    return _quantize(float(mc_raw))
        except Exception:
            pass

    # yfinance last resort — often 429 when Yahoo is rate limited; timeout to avoid hang
    try:
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=1) as ex:
            def _yf_fetch():
                import yfinance as yf
                return yf.Ticker(symbol).info.get("marketCap")
            raw = ex.submit(_yf_fetch).result(timeout=12)
        if raw is not None:
            return _quantize(float(raw))
    except Exception:
        pass

    return None


async def fetch_prices_for_tickers(
    tickers: List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]],
    pre_fetched_market_caps: Optional[Dict[str, Decimal]] = None,
) -> List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """
    Yahoo (Primary) → Alpha (Fallback — CRYPTO only or when quota allows).
    FIX-4: Alpha is now guarded by a daily quota reserve.
    - Alpha CRYPTO: always attempted (DIGITAL_CURRENCY_DAILY is the only reliable path for crypto)
    - Alpha non-CRYPTO: only when Yahoo is in cooldown AND remaining Alpha quota > ALPHA_FX_RESERVE
    - This ensures FX sync (sync_exchange_rates_eod.py) always has quota for its 5 pairs
    """
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider
    from api.integrations.market_data.provider_cooldown import (
        set_cooldown, is_in_cooldown, get_cooldown_status, get_alpha_remaining_today,
        ALPHA_DAILY_LIMIT,
    )
    from api.integrations.market_data.provider_mapping_utils import get_provider_mapping, resolve_symbols_for_fetch
    from api.integrations.market_data.market_data_settings import (
        get_provider_cooldown_minutes,
        get_delay_between_symbols_seconds,
    )

    # FIX-4: Reserve Alpha quota for FX sync (5 pairs) + buffer (3 extra) = 8 calls reserved
    ALPHA_FX_RESERVE = 8

    cooldown_min = get_provider_cooldown_minutes()
    delay_sec = get_delay_between_symbols_seconds()
    # SOP-015: Cooldown Protocol — log status for Team 90 audit
    for prov, _until, sec in get_cooldown_status():
        print(f"📋 [SOP-015] {prov} in cooldown: {sec}s remaining")
    # FIX-4: Log Alpha quota status at sync start
    alpha_remaining = get_alpha_remaining_today(ALPHA_DAILY_LIMIT)
    print(f"📊 [FIX-4] Alpha Vantage quota: {ALPHA_DAILY_LIMIT - alpha_remaining}/{ALPHA_DAILY_LIMIT} used, {alpha_remaining} remaining (FX reserve: {ALPHA_FX_RESERVE})")

    yahoo = YahooProvider()
    alpha = AlphaProvider()
    results = []
    yahoo_skipped = alpha_skipped = False
    alpha_equity_blocked_logged = False  # log once when Alpha blocked for non-CRYPTO

    for ticker_id, symbol, ticker_type, metadata in tickers:
        pm = get_provider_mapping(symbol, ticker_type or "STOCK", None, metadata)
        yahoo_sym, alpha_sym, alpha_market = resolve_symbols_for_fetch(symbol, ticker_type or "STOCK", pm)
        is_crypto = ticker_type == "CRYPTO"
        pr = None
        for provider, name, use_sym, use_crypto in [
            (yahoo, "YAHOO_FINANCE", yahoo_sym, False),
            (alpha, "ALPHA_VANTAGE", alpha_sym, is_crypto),
        ]:
            if is_in_cooldown(name):
                if not (yahoo_skipped if name == "YAHOO_FINANCE" else alpha_skipped):
                    print(f"⚠️ {name} in cooldown — skipping")
                if name == "YAHOO_FINANCE":
                    yahoo_skipped = True
                else:
                    alpha_skipped = True
                continue

            # FIX-4: Alpha quota guard for non-CRYPTO equities
            # Policy: Alpha price fallback for non-CRYPTO only when quota above FX reserve
            # CRYPTO always gets Alpha fallback (DIGITAL_CURRENCY_DAILY is the only path for crypto)
            if name == "ALPHA_VANTAGE" and not is_crypto:
                current_remaining = get_alpha_remaining_today(ALPHA_DAILY_LIMIT)
                if current_remaining <= ALPHA_FX_RESERVE:
                    if not alpha_equity_blocked_logged:
                        print(
                            f"⚠️ [FIX-4] Alpha quota low ({current_remaining} remaining ≤ reserve {ALPHA_FX_RESERVE}) "
                            f"— skipping Alpha price fallback for non-CRYPTO equities"
                        )
                        alpha_equity_blocked_logged = True
                    continue  # Fall through to last-known / yfinance fallback

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
                # AUTO-WP003-05: enrich market_cap for required symbols when possible
                if symbol in AUTO_WP003_05_SYMBOLS and last[8] is None:
                    mc = (pre_fetched_market_caps or {}).get(symbol)
                    if mc is None:
                        mc = await asyncio.to_thread(_fetch_market_cap_for_symbol, symbol)
                    if mc is not None:
                        last = last[:8] + (mc,) + last[9:]
                results.append(last)
                print(f"📌 {symbol}: using last-known price (providers unavailable)")
            else:
                # Last resort: direct yfinance (different path than YahooProvider — can work when v8 429)
                yf_row = await asyncio.to_thread(_yfinance_eod_fallback, symbol, ticker_type)
                if yf_row:
                    results.append((ticker_id, symbol) + yf_row + ("YF_FALLBACK",))
                    print(f"📌 {symbol}: yfinance fallback (EOD)")
                else:
                    print(f"⚠️ No price for {symbol} (ticker_id={ticker_id})")

        if delay_sec > 0:
            await asyncio.sleep(delay_sec)

    return results


def _yfinance_eod_fallback(symbol: str, ticker_type: str) -> Optional[Tuple[Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime]]:
    """Last-resort EOD: yfinance direct (different path than YahooProvider — can work when v8 returns 429)."""
    if ticker_type == "CRYPTO":
        return None
    try:
        import yfinance as yf
        hist = None
        try:
            # yf.download sometimes works when Ticker().history() returns no data (single symbol → columns: Open, High, Low, Close, Volume)
            df = yf.download(symbol, period="1mo", progress=False, threads=False, auto_adjust=True)
            if df is not None and not df.empty and hasattr(df, "columns") and "Close" in df.columns:
                hist = df
        except Exception:
            pass
        if hist is None or hist.empty:
            t = yf.Ticker(symbol)
            for period in ("1mo", "5d", "1d"):
                hist = t.history(period=period)
                if hist is not None and not hist.empty:
                    break
        if hist is None or hist.empty:
            return None
        row = hist.iloc[-1]
        close = float(row.get("Close", 0) or 0)
        if close <= 0:
            return None
        ts = row.name
        if hasattr(ts, "tzinfo") and ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc) if hasattr(ts, "replace") else datetime.now(timezone.utc)
        elif not isinstance(ts, datetime):
            ts = datetime.now(timezone.utc)
        return (
            _quantize(close),
            _quantize(float(row.get("Open")) if row.get("Open") is not None else None),
            _quantize(float(row.get("High")) if row.get("High") is not None else None),
            _quantize(float(row.get("Low")) if row.get("Low") is not None else None),
            _quantize(close),
            int(row.get("Volume", 0)) if row.get("Volume") is not None else None,
            None,
            ts,
        )
    except Exception as e:
        print(f"⚠️ yfinance fallback {symbol}: {e}")
        return None


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


def backfill_market_cap_auto_wp003_05(
    pre_fetched: Optional[Dict[str, Decimal]] = None,
    manual_overrides: Optional[Dict[str, Decimal]] = None,
) -> int:
    """AUTO-WP003-05: UPDATE market_cap when null for ANAU.MI, BTC-USD, TEVA.TA.
    pre_fetched: from _prefetch_market_caps_auto_wp003_05 (avoids extra HTTP when available).
    manual_overrides: {symbol: value} when providers fail (e.g. Yahoo 429). Use: --manual ANAU.MI=1440000000
    Tries batch Yahoo v7 first (1 req for all 3), then per-symbol fallbacks."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    updated = 0
    pre_fetched = dict(pre_fetched) if pre_fetched else {}
    manual_overrides = dict(manual_overrides) if manual_overrides else {}
    # Single Yahoo v7 batch request — reduces rate-limit risk vs 3 separate calls
    if not pre_fetched:
        batch = _fetch_market_caps_batch_auto_wp003_05()
        pre_fetched.update(batch)

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SET lock_timeout = '15s'")  # avoid indefinite hang on table lock
        cur.execute("""
            WITH latest AS (
                SELECT DISTINCT ON (t.id) t.id AS ticker_id, t.symbol, tp.id AS price_row_id, tp.price_timestamp
                FROM market_data.tickers t
                JOIN market_data.ticker_prices tp ON tp.ticker_id = t.id
                WHERE t.symbol = ANY(%s) AND t.deleted_at IS NULL AND tp.market_cap IS NULL
                ORDER BY t.id, tp.price_timestamp DESC
            )
            SELECT ticker_id, symbol, price_row_id, price_timestamp FROM latest
        """, (list(AUTO_WP003_05_SYMBOLS),))
        rows = cur.fetchall()
        for row in rows:
            symbol = row["symbol"]
            mc = pre_fetched.get(symbol)
            if mc is None:
                mc = _fetch_market_cap_for_symbol(symbol)
            if mc is None:
                mc = manual_overrides.get(symbol)
            if mc is not None:
                savepoint = f"sp_{symbol.replace('.', '_').replace('-', '_')}"
                try:
                    cur.execute(f"SAVEPOINT {savepoint}")
                    cur.execute("SET LOCAL lock_timeout = '5s'")
                    cur.execute("""
                        UPDATE market_data.ticker_prices
                        SET market_cap = %s
                        WHERE id = %s AND price_timestamp = %s
                    """, (float(mc), row["price_row_id"], row["price_timestamp"]))
                    updated += cur.rowcount
                except Exception as e:
                    try:
                        cur.execute(f"ROLLBACK TO SAVEPOINT {savepoint}")
                    except Exception:
                        conn.rollback()
                        raise
                    print(f"⚠️ Backfill market_cap {symbol}: {e}")
        conn.commit()
    finally:
        conn.close()
    return updated


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


def _prefetch_market_caps_auto_wp003_05() -> Dict[str, Decimal]:
    """AUTO-WP003-05: ONE batch v7/quote call for 4 symbols BEFORE any v8/chart (which triggers 429).
    Returns {symbol: market_cap} for symbols that have it."""
    from api.integrations.market_data.providers.yahoo_provider import _fetch_prices_batch_sync

    out: Dict[str, Decimal] = {}
    try:
        batch = _fetch_prices_batch_sync(list(AUTO_WP003_05_SYMBOLS))
        for sym, pr in batch.items():
            if pr.market_cap is not None:
                out[sym] = pr.market_cap
    except Exception:
        pass
    return out


def _prioritize_auto_wp003_05(
    tickers: List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]]
) -> List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]]:
    """AUTO-WP003-05: Process required symbols FIRST (before any 429 can trigger cooldown)."""
    priority = [t for t in tickers if t[1] in AUTO_WP003_05_SYMBOLS]
    rest = [t for t in tickers if t[1] not in AUTO_WP003_05_SYMBOLS]
    return priority + rest


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
        # AUTO-WP003-05: pre-fetch market_cap via v7/quote batch BEFORE any v8/chart (avoids 429 cascade)
        pre_fetched_mc = _prefetch_market_caps_auto_wp003_05()
        if pre_fetched_mc:
            print(f"📊 [AUTO-WP003-05] Pre-fetched market_cap for {list(pre_fetched_mc.keys())}")

        tickers = load_tickers()
        if not tickers:
            print("⚠️ No tickers in market_data.tickers. Run: python3 scripts/seed_market_data_tickers.py")
            sys.exit(0)
        tickers = _prioritize_auto_wp003_05(tickers)

        rows = asyncio.run(fetch_prices_for_tickers(tickers, pre_fetched_market_caps=pre_fetched_mc))
        if not rows:
            print("⚠️ No prices fetched. Exit 0.")
            sys.exit(0)

        # Patch rows: use pre-fetched market_cap for AUTO-WP003-05 symbols when missing
        patched = []
        for r in rows:
            if r[1] in AUTO_WP003_05_SYMBOLS and r[8] is None and pre_fetched_mc.get(r[1]):
                r = r[:8] + (pre_fetched_mc[r[1]],) + r[9:]
            patched.append(r)
        rows = patched

        n = upsert_prices(rows)
        print(f"✅ Upserted {n} ticker prices to market_data.ticker_prices")
        bf = backfill_market_cap_auto_wp003_05(pre_fetched=pre_fetched_mc)
        if bf > 0:
            print(f"✅ Backfilled market_cap for {bf} row(s) (AUTO-WP003-05)")
    finally:
        if fd is not None and fcntl:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
    sys.exit(0)


if __name__ == "__main__":
    main()
