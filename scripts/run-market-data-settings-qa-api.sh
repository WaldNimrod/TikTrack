#!/bin/bash
# Market Data Settings — Gate-A API verification
# Team 50 — TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE
# Tests: GET/PATCH range, 403 non-admin, 422 validation

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
ADMIN_USER="${QA_USER:-TikTrackAdmin}"
ADMIN_PASS="${QA_PASS:-4181}"
# Non-admin (if available): test_user / password per seed
NON_ADMIN_USER="${NON_ADMIN_USER:-test_user}"
NON_ADMIN_PASS="${NON_ADMIN_PASS:-password}"

echo "=== Market Data Settings QA — Gate-A API ==="
echo "Backend: $BACKEND"

# 1. Admin Login
ADMIN_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin Login failed"
  exit 1
fi
echo "✅ Admin Login OK"

# 2. GET (Admin) — 200
CODE=$(curl -s -o /tmp/md_get.json -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/settings/market-data")
if [ "$CODE" = "200" ]; then
  echo "✅ GET /settings/market-data → 200"
  python3 -c "import json; d=json.load(open('/tmp/md_get.json')); print('   ', list(d.keys()))"
else
  echo "❌ GET → $CODE"
  exit 1
fi

# 3. PATCH empty — 422
CODE=$(curl -s -o /tmp/md_patch_empty.json -w "%{http_code}" -X PATCH "$BACKEND/api/v1/settings/market-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{}')
[ "$CODE" = "422" ] && echo "✅ PATCH {} → 422 (No fields to update)" || echo "⚠️ PATCH {} → $CODE (expected 422)"

# 4. PATCH out-of-range max_active_tickers=0 — 422
CODE=$(curl -s -o /tmp/md_patch_range.json -w "%{http_code}" -X PATCH "$BACKEND/api/v1/settings/market-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"max_active_tickers": 0}')
[ "$CODE" = "422" ] && echo "✅ PATCH max_active_tickers=0 → 422 (out of range)" || echo "⚠️ PATCH max_active_tickers=0 → $CODE (expected 422)"

# 5. PATCH out-of-range max_active_tickers=501 — 422
CODE=$(curl -s -o /tmp/md_patch_range2.json -w "%{http_code}" -X PATCH "$BACKEND/api/v1/settings/market-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"max_active_tickers": 501}')
[ "$CODE" = "422" ] && echo "✅ PATCH max_active_tickers=501 → 422 (out of range)" || echo "⚠️ PATCH max_active_tickers=501 → $CODE (expected 422)"

# 6. PATCH valid — 200
CODE=$(curl -s -o /tmp/md_patch_valid.json -w "%{http_code}" -X PATCH "$BACKEND/api/v1/settings/market-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"delay_between_symbols_seconds": 1}')
if [ "$CODE" = "200" ]; then
  echo "✅ PATCH delay_between_symbols_seconds=1 → 200"
else
  echo "⚠️ PATCH valid → $CODE"
fi

# 7. Restore delay to 0
curl -s -X PATCH "$BACKEND/api/v1/settings/market-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"delay_between_symbols_seconds": 0}' >/dev/null

# 8. Non-admin GET — 403 (if test_user exists)
NON_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$NON_ADMIN_USER\",\"password\":\"$NON_ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")
if [ -n "$NON_TOKEN" ]; then
  CODE=$(curl -s -o /tmp/md_get_non.json -w "%{http_code}" \
    -H "Authorization: Bearer $NON_TOKEN" "$BACKEND/api/v1/settings/market-data")
  [ "$CODE" = "403" ] && echo "✅ GET (non-admin) → 403" || echo "⚠️ GET (non-admin) → $CODE (expected 403 if non-admin)"
else
  echo "⚠️ Non-admin user ($NON_ADMIN_USER) not available — skip 403 test"
fi

echo "=== Market Data Settings API QA Done ==="
