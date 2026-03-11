#!/bin/bash
# AUTO-WP003-05 — הרצת sync + backfill עד PASS
# Team 20: מבצע את כל השלבים עד verify → PASS

set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🔄 [AUTO-WP003-05] Step 1: sync-ticker-prices"
rm -f scripts/.sync_ticker_prices.lock
python3 scripts/sync_ticker_prices_eod.py || true

echo "🔄 [AUTO-WP003-05] Step 2: verify"
if python3 scripts/verify_g7_prehuman_automation.py 2>/dev/null; then
    echo "✅ AUTO-WP003-05: PASS"
    exit 0
fi

echo "⏳ [AUTO-WP003-05] BLOCK — ממתין 18 דק׳ (יציאה מ-cooldown)..."
sleep 1080

echo "🔄 [AUTO-WP003-05] Step 3: backfill-market-cap"
python3 scripts/backfill_market_cap_auto_wp003_05.py

echo "🔄 [AUTO-WP003-05] Step 4: verify"
if python3 scripts/verify_g7_prehuman_automation.py 2>/dev/null; then
    echo "✅ AUTO-WP003-05: PASS"
    exit 0
fi

echo "❌ AUTO-WP003-05: BLOCK — נדרש הרצה חוזרת כש-Yahoo זמין"
exit 1
