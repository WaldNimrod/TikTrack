#!/usr/bin/env python3
"""
TASE Agorot → ILS Backfill (Mandate B2)
Converts existing ticker_prices and ticker_prices_intraday rows for .TA symbols
where price > 200 (stored in agorot) to ILS (÷100).
Run once after applying TASE provider fix.
"""

import os
import sys
from pathlib import Path

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.strip().startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
                break
if not DATABASE_URL:
    DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL and "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set")
    sys.exit(1)

import psycopg2

def main():
    conn = psycopg2.connect(DATABASE_URL)
    updated = 0
    try:
        cur = conn.cursor()
        for table in ["ticker_prices", "ticker_prices_intraday"]:
            # Select columns - ticker_prices has open/high/low/close; intraday might differ
            cur.execute(f"""
                SELECT tp.id, tp.price, tp.open_price, tp.high_price, tp.low_price, tp.close_price
                FROM market_data.tickers t
                JOIN market_data.{table} tp ON tp.ticker_id = t.id
                WHERE t.symbol LIKE '%.TA' AND tp.price > 200
            """)
            rows = cur.fetchall()
            for row in rows:
                row_id = row[0]
                price = float(row[1] or 0) / 100.0
                open_p = (float(row[2]) / 100.0) if row[2] else None
                high_p = (float(row[3]) / 100.0) if row[3] else None
                low_p = (float(row[4]) / 100.0) if row[4] else None
                close_p = (float(row[5]) / 100.0) if row[5] else price
                cur.execute(f"""
                    UPDATE market_data.{table}
                    SET price = %s, open_price = %s, high_price = %s, low_price = %s, close_price = %s
                    WHERE id = %s
                """, (round(price, 8), round(open_p, 8) if open_p else None,
                      round(high_p, 8) if high_p else None, round(low_p, 8) if low_p else None,
                      round(close_p, 8) if close_p else price, row_id))
                updated += cur.rowcount
        conn.commit()
        print(f"✅ TASE agorot→ILS: updated {updated} row(s)")
    finally:
        conn.close()
    return updated

if __name__ == "__main__":
    main()
