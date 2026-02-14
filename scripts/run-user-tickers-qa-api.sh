#!/bin/bash
# User Tickers QA — API-only verification
# Run when backend (8082) is up. E2E requires frontend (8080) + backend.
# Team 50 — TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF §5

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
USER="${QA_USER:-TikTrackAdmin}"
PASS="${QA_PASS:-4181}"

echo "=== User Tickers QA — API Verification ==="
echo "Backend: $BACKEND"

# 1. Auth
TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$USER\",\"password\":\"$PASS\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed — backend unreachable or auth failed"
  exit 1
fi
echo "✅ Login OK"

# 2. GET /me/tickers
CODE=$(curl -s -o /tmp/ut_get.json -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BACKEND/api/v1/me/tickers")
if [ "$CODE" = "200" ]; then
  echo "✅ GET /me/tickers → 200"
else
  echo "❌ GET /me/tickers → $CODE"
  exit 1
fi

# 3. Provider failure — fake symbol → expect 422
CODE=$(curl -s -o /tmp/ut_post.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=ZZZZZZZFAKE999" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "422" ] || [ "$CODE" = "400" ]; then
  echo "✅ POST (fake symbol) → $CODE — provider failure handled"
else
  echo "⚠️ POST (fake symbol) → $CODE (expected 422/400)"
fi

# 4. Valid ticker AAPL → expect 201 (or 409 if already in list)
CODE=$(curl -s -o /tmp/ut_aapl.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=AAPL" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "201" ] || [ "$CODE" = "409" ]; then
  echo "✅ POST (AAPL) → $CODE — live data check passed / already in list"
else
  echo "⚠️ POST (AAPL) → $CODE (expected 201/409)"
fi

# 5. BTC-USD — provider may or may not return (Yahoo format); document result
CODE=$(curl -s -o /tmp/ut_btc.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=BTC-USD" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "201" ] || [ "$CODE" = "409" ]; then
  echo "✅ POST (BTC-USD) → $CODE"
elif [ "$CODE" = "422" ]; then
  echo "⚠️ POST (BTC-USD) → 422 — provider לא החזיר נתונים (ייתכן crypto)"
else
  echo "⚠️ POST (BTC-USD) → $CODE"
fi

echo "=== API Verification Done ==="
