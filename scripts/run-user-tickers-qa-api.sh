#!/bin/bash
# User Tickers QA — API verification (מנדט Crypto + Exchanges)
# Team 50 — TEAM_10_TO_TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE
# Run when backend (8082) is up.

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
USER="${QA_USER:-TikTrackAdmin}"
PASS="${QA_PASS:-4181}"

echo "=== User Tickers QA — API Verification (Crypto + Exchanges) ==="
echo "Backend: $BACKEND"

# 1. Auth
TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$USER\",\"password\":\"$PASS\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login OK"

# 2. GET /me/tickers
CODE=$(curl -s -o /tmp/ut_get.json -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BACKEND/api/v1/me/tickers")
[ "$CODE" = "200" ] && echo "✅ GET /me/tickers → 200" || { echo "❌ GET /me/tickers → $CODE"; exit 1; }

# 3. Fake symbol → 422 (ROOT_FIX: must be 422, not 500)
CODE=$(curl -s -o /tmp/ut_fake.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=ZZZZZZZFAKE999" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "422" ] || [ "$CODE" = "400" ]; then
  echo "✅ POST (fake) → $CODE"
else
  echo "❌ POST (fake) → $CODE (מצופה 422). אם 500 — הפעל מחדש את ה-Backend."
fi

# 4. AAPL (מניה) — חובה
CODE=$(curl -s -o /tmp/ut_aapl.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=AAPL&ticker_type=STOCK" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "201" ] || [ "$CODE" = "409" ]; then
  echo "✅ POST (AAPL מניה) → $CODE"
else
  echo "❌ POST (AAPL) → $CODE — חובה"
  exit 1
fi

# 5. BTC (קריפטו) — ticker_type=CRYPTO, market=USD
CODE=$(curl -s -o /tmp/ut_btc.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=BTC&ticker_type=CRYPTO&market=USD" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "201" ] || [ "$CODE" = "409" ]; then
  echo "✅ POST (BTC קריפטו) → $CODE"
else
  echo "⚠️ POST (BTC CRYPTO) → $CODE (קריטריון: 1 קריפטו)"
fi

# 6. TEVA.TA (TASE) — בדיקת fetch חיים ראשונה
CODE=$(curl -s -o /tmp/ut_teva.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=TEVA.TA&ticker_type=STOCK" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
if [ "$CODE" = "201" ] || [ "$CODE" = "409" ]; then
  echo "✅ POST (TEVA.TA TASE) → $CODE"
else
  echo "⚠️ POST (TEVA.TA) → $CODE — נדרש fetch חיים"
fi

# 7. ANAU.MI (מילאנו) — אופציונלי
CODE=$(curl -s -o /tmp/ut_anau.json -w "%{http_code}" -X POST "$BACKEND/api/v1/me/tickers?symbol=ANAU.MI&ticker_type=STOCK" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
[ "$CODE" = "201" ] || [ "$CODE" = "409" ] && echo "✅ POST (ANAU.MI) → $CODE" || echo "⚠️ POST (ANAU.MI) → $CODE (אופציונלי)"

echo "=== API Verification Done ==="
