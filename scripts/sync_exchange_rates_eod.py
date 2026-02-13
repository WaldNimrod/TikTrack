#!/usr/bin/env python3
"""
EOD Sync — Exchange Rates (P3-011)
Team 60 — MARKET_DATA_PIPE_SPEC §5, M5 Mandate
Providers: Alpha Vantage (Primary) → Yahoo Finance (Fallback). No Frankfurter.
Scope: USD, EUR, ILS. Cron: 0 22 * * 1-5 (UTC)
"""

import os
import sys
import time
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Tuple, Optional

DECIMAL_SCALE = Decimal("0.00000001")
RATE_LIMIT_SEC = 12.5  # Alpha Vantage: 5 calls/min

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
ALPHA_VANTAGE_API_KEY = None
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
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

PAIRS = [("USD", "ILS"), ("USD", "EUR"), ("EUR", "USD"), ("EUR", "ILS"), ("ILS", "USD")]


def _quantize(raw: float) -> Decimal:
    return Decimal(str(raw)).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)


def fetch_alpha_vantage() -> List[Tuple[str, str, Decimal]]:
    """Primary: Alpha Vantage. Rate limit 12.5s between calls."""
    if not ALPHA_VANTAGE_API_KEY:
        return []
    try:
        import httpx
    except ImportError:
        return []
    results: List[Tuple[str, str, Decimal]] = []
    with httpx.Client(timeout=15.0) as client:
        for i, (from_ccy, to_ccy) in enumerate(PAIRS):
            if i > 0:
                time.sleep(RATE_LIMIT_SEC)
            try:
                r = client.get(
                    "https://www.alphavantage.co/query",
                    params={
                        "function": "CURRENCY_EXCHANGE_RATE",
                        "from_currency": from_ccy,
                        "to_currency": to_ccy,
                        "apikey": ALPHA_VANTAGE_API_KEY,
                    },
                )
                r.raise_for_status()
                data = r.json()
                rr = data.get("Realtime Currency Exchange Rate", {})
                rate_str = rr.get("5. Exchange Rate", "0")
                if rate_str and float(rate_str) > 0:
                    results.append((from_ccy, to_ccy, _quantize(float(rate_str))))
            except Exception as e:
                print(f"⚠️ Alpha {from_ccy}->{to_ccy}: {e}")
    return results


def fetch_yahoo() -> List[Tuple[str, str, Decimal]]:
    """Fallback: Yahoo Finance. Ticker format: XXXYYY=X."""
    try:
        import yfinance as yf
    except ImportError:
        return []
    symbol_map = {
        ("USD", "ILS"): "USDILS=X",
        ("USD", "EUR"): "USDEUR=X",
        ("EUR", "USD"): "EURUSD=X",
        ("EUR", "ILS"): "EURILS=X",
        ("ILS", "USD"): "USDILS=X",  # inverse
    }
    results: List[Tuple[str, str, Decimal]] = []
    for from_ccy, to_ccy in PAIRS:
        try:
            sym = symbol_map.get((from_ccy, to_ccy))
            if not sym:
                continue
            t = yf.Ticker(sym)
            hist = t.history(period="5d")
            if hist.empty:
                continue
            close = float(hist["Close"].iloc[-1])
            if close <= 0:
                continue
            if (from_ccy, to_ccy) == ("ILS", "USD"):
                close = 1.0 / close
            results.append((from_ccy, to_ccy, _quantize(close)))
        except Exception as e:
            print(f"⚠️ Yahoo {from_ccy}->{to_ccy}: {e}")
    return results


def fetch_rates() -> List[Tuple[str, str, Decimal]]:
    """Alpha (Primary) → Yahoo (Fallback)."""
    rates = fetch_alpha_vantage()
    if len(rates) >= 3:
        return rates
    print("⚠️ Alpha partial/fail — fallback to Yahoo")
    rates = fetch_yahoo()
    return rates


def upsert_rates(rates: List[Tuple[str, str, Decimal]]) -> int:
    """UPSERT exchange_rates (current) + INSERT exchange_rates_history (P3-018)."""
    import psycopg2
    from psycopg2.extras import execute_values
    conn = psycopg2.connect(DATABASE_URL)
    try:
        now = datetime.now(timezone.utc)
        rate_date = now.date()
        rows = [(f, t, r, now, now) for f, t, r in rates]
        cur = conn.cursor()
        # 1. INSERT history (ON CONFLICT DO NOTHING — idempotent per day)
        hist_rows = [(f, t, r, rate_date) for f, t, r in rates]
        execute_values(
            cur,
            """
            INSERT INTO market_data.exchange_rates_history
                (from_currency, to_currency, conversion_rate, rate_date)
            VALUES %s
            ON CONFLICT (from_currency, to_currency, rate_date) DO NOTHING
            """,
            hist_rows,
            template="(%s, %s, %s, %s)",
        )
        # 2. UPSERT current
        execute_values(
            cur,
            """
            INSERT INTO market_data.exchange_rates
                (from_currency, to_currency, conversion_rate, last_sync_time, updated_at)
            VALUES %s
            ON CONFLICT (from_currency, to_currency)
            DO UPDATE SET
                conversion_rate = EXCLUDED.conversion_rate,
                last_sync_time = EXCLUDED.last_sync_time,
                updated_at = EXCLUDED.updated_at
            """,
            rows,
        )
        conn.commit()
        return len(rows)
    finally:
        conn.close()


def main():
    print("🔄 EOD sync — exchange_rates (Alpha→Yahoo)")
    rates = fetch_rates()
    if not rates:
        print("⚠️ No rates fetched. Exit 0.")
        sys.exit(0)
    n = upsert_rates(rates)
    print(f"✅ Upserted {n} rates (exchange_rates + exchange_rates_history)")
    sys.exit(0)


if __name__ == "__main__":
    main()
