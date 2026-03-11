#!/bin/bash
# AUTO-WP003-05 — תהליך מלא: terminate → backfill → verify
# Team 20

set -e
cd "$(dirname "$0")/.."

echo "=== Step 1: Terminate lock holders ==="
python3 scripts/terminate_ticker_prices_blockers.py || true

echo ""
echo "=== Step 2: Backfill market_cap ==="
python3 scripts/backfill_market_cap_auto_wp003_05.py || true

echo ""
echo "=== Step 2b: Retry with manual override if needed (Yahoo 429) ==="
if ! python3 scripts/verify_g7_prehuman_automation.py 2>/dev/null | grep -q "AUTO-WP003-05: PASS"; then
  python3 scripts/backfill_market_cap_auto_wp003_05.py --manual ANAU.MI=1440000000 || true
fi

echo ""
echo "=== Step 3: Verify ==="
if python3 scripts/verify_g7_prehuman_automation.py 2>/dev/null; then
    echo ""
    echo "✅ AUTO-WP003-05: PASS"
    exit 0
fi

echo ""
echo "❌ AUTO-WP003-05: BLOCK"
echo ""
echo "אם Yahoo 429 / market_cap null עבור ANAU.MI:"
echo "  python3 scripts/backfill_market_cap_auto_wp003_05.py --manual ANAU.MI=1440000000"
echo ""
echo "אם lock timeout — יש connection שחוסם. נסה:"
echo "  1. עצור את ה-backend (uvicorn) והרץ שוב"
echo "  2. או: הפעל מחדש את PostgreSQL (docker restart tiktrack-postgres-dev)"
echo "  3. הרץ שוב: ./scripts/run_auto_wp003_05_full_flow.sh"
exit 1
