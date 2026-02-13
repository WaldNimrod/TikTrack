#!/usr/bin/env python3
"""
EOD Sync — Exchange Rates
Team 60 (DevOps & Platform) — MARKET_DATA_PIPE_SPEC §5
Fetches rates from external API and upserts to market_data.exchange_rates.
Suitable for cron: 0 22 * * 1-5 (22:00 Sun-Thu)
"""

import os
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Tuple

# NUMERIC(20,8) per SSOT — quantize to 8 decimal places
DECIMAL_SCALE = Decimal("0.00000001")

# Load api/.env
_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
                break
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


def fetch_rates() -> List[Tuple[str, str, Decimal]]:
    """
    Fetch rates from Frankfurter (free, no key).
    Scope: USD, EUR, ILS per SSOT (initial scope).
    Returns [(from_ccy, to_ccy, rate), ...] with Decimal quantized to 8 places.
    """
    try:
        import httpx
    except ImportError:
        print("❌ httpx required. pip install httpx")
        sys.exit(1)
    pairs = [("USD", "ILS"), ("USD", "EUR"), ("EUR", "USD"), ("EUR", "ILS"), ("ILS", "USD")]
    results: List[Tuple[str, str, Decimal]] = []
    with httpx.Client(timeout=10.0) as client:
        for from_ccy, to_ccy in pairs:
            try:
                r = client.get(f"https://api.frankfurter.app/latest?from={from_ccy}&to={to_ccy}")
                r.raise_for_status()
                data = r.json()
                raw = float(data.get("rates", {}).get(to_ccy, 0))
                if raw > 0:
                    rate = Decimal(str(raw)).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
                    results.append((from_ccy, to_ccy, rate))
            except Exception as e:
                print(f"⚠️ Skip {from_ccy}->{to_ccy}: {e}")
    return results


def upsert_rates(rates: List[Tuple[str, str, Decimal]]) -> int:
    """Upsert to market_data.exchange_rates. conversion_rate NUMERIC(20,8) per SSOT."""
    import psycopg2
    from psycopg2.extras import execute_values
    conn = psycopg2.connect(DATABASE_URL)
    try:
        now = datetime.now(timezone.utc)
        rows = [(f, t, r, now, now) for f, t, r in rates]
        cur = conn.cursor()
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
    print("🔄 EOD sync — exchange_rates")
    rates = fetch_rates()
    if not rates:
        print("⚠️ No rates fetched. Exit 0.")
        sys.exit(0)
    n = upsert_rates(rates)
    print(f"✅ Upserted {n} rates to market_data.exchange_rates")
    sys.exit(0)


if __name__ == "__main__":
    main()
