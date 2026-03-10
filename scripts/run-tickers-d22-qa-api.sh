#!/bin/bash
# D22 Tickers — FAV API verification (S002-P003-WP002)
# Team 50 — TEAM_10_TO_TEAM_50_S002_P003_WP002_D22_FAV_ACTIVATION
# LLD400 §2.5: env vars, JSON summary, exit codes. Tests: summary, list, filter (ticker_type, is_active, search), CRUD, data-integrity.
# LOD400 §6.3 (E2E Hygiene): Use SKIP_LIVE_DATA_CHECK=true (api/.env) or SYMBOL_OVERRIDE=<valid_symbol> for create test. Never activate fake symbols.

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
ADMIN_USER="${QA_USER:-TikTrackAdmin}"
ADMIN_PASS="${QA_PASS:-4181}"
OUT="/tmp/tickers_d22_qa_$$"
JSON_SUMMARY="${D22_QA_JSON_OUT:-/tmp/tickers_d22_qa_$$.summary.json}"

echo "=== D22 Tickers QA — FAV API ==="
echo "Backend: $BACKEND"

mkdir -p "$OUT"
PASSED=0
FAILED=0

_fail() {
  echo "❌ $1"
  ((FAILED++)) || true
  if [ "${D22_STRICT:-1}" = "1" ]; then rm -rf "$OUT"; exit 1; fi
}
_ok() {
  echo "✅ $1"
  ((PASSED++)) || true
}

# 1. Admin Login
ADMIN_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
  _fail "Admin Login failed"
  echo '{"passed":0,"failed":1,"tests":[],"exit_code":1}' > "$JSON_SUMMARY"
  exit 1
fi
_ok "Admin Login"

# 2. GET /tickers/summary → 200
CODE=$(curl -s -o "$OUT/summary.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers/summary")
[ "$CODE" = "200" ] && _ok "GET /tickers/summary → 200" || _fail "GET /tickers/summary → $CODE (expected 200)"

# 3. GET /tickers (list) → 200
CODE=$(curl -s -o "$OUT/list.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers")
[ "$CODE" = "200" ] && _ok "GET /tickers → 200" || _fail "GET /tickers → $CODE"

# 4. GET /tickers?ticker_type=STOCK → 200
CODE=$(curl -s -o "$OUT/filter_type.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers?ticker_type=STOCK")
[ "$CODE" = "200" ] && _ok "GET /tickers?ticker_type=STOCK → 200" || _fail "GET filter ticker_type → $CODE"

# 5. GET /tickers?is_active=true → 200
CODE=$(curl -s -o "$OUT/filter_active.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers?is_active=true")
[ "$CODE" = "200" ] && _ok "GET /tickers?is_active=true → 200" || _fail "GET filter is_active → $CODE"

# 6. GET /tickers?search= (optional)
CODE=$(curl -s -o "$OUT/search.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers?search=A")
[ "$CODE" = "200" ] && _ok "GET /tickers?search=A → 200" || _fail "GET search → $CODE"

# 7. POST /tickers → 201 (LOD400 §6.3: use SYMBOL_OVERRIDE for valid symbol or SKIP_LIVE_DATA_CHECK=true in api/.env)
SYM="${SYMBOL_OVERRIDE:-QA_D22_$$}"
CREATE_CODE=$(curl -s -o "$OUT/create.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/tickers" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"symbol\":\"$SYM\",\"ticker_type\":\"STOCK\",\"is_active\":false}")
TICKER_ID=$(python3 -c "import json; d=json.load(open('$OUT/create.json')); print(d.get('id',''))" 2>/dev/null || echo "")
if [ "$CREATE_CODE" != "201" ] || [ -z "$TICKER_ID" ]; then
  _fail "POST /tickers → expected 201 with id, got $CREATE_CODE"
  [ -f "$OUT/create.json" ] && head -c 400 < "$OUT/create.json"
  TICKER_ID=""
fi
[ -n "$TICKER_ID" ] && _ok "POST /tickers → 201 (id=$TICKER_ID)"

# 8–12. CRUD by ID (skip if POST failed — avoids 307 from /tickers/)
if [ -n "$TICKER_ID" ]; then
  # 8. GET /tickers/:id → 200
  CODE=$(curl -s -o "$OUT/get.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers/$TICKER_ID")
  [ "$CODE" = "200" ] && _ok "GET /tickers/:id → 200" || _fail "GET /tickers/:id → $CODE"

  # 9. GET /tickers/:id/data-integrity → 200
  CODE=$(curl -s -o "$OUT/data-integrity.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers/$TICKER_ID/data-integrity")
  [ "$CODE" = "200" ] && _ok "GET /tickers/:id/data-integrity → 200" || _fail "GET data-integrity → $CODE"

  # 10. PUT /tickers/:id → 200
  CODE=$(curl -s -o "$OUT/put.json" -w "%{http_code}" -X PUT "$BACKEND/api/v1/tickers/$TICKER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"company_name":"QA D22 Test"}')
  [ "$CODE" = "200" ] && _ok "PUT /tickers/:id → 200" || _fail "PUT → $CODE"

  # 11. DELETE /tickers/:id → 204
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers/$TICKER_ID")
  [ "$CODE" = "204" ] && _ok "DELETE /tickers/:id → 204" || _fail "DELETE → $CODE"

  # 12. GET /tickers/:id after delete → 404
  CODE=$(curl -s -o "$OUT/get404.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/tickers/$TICKER_ID")
  [ "$CODE" = "404" ] && _ok "GET /tickers/:id after delete → 404" || _fail "GET after delete → $CODE (expected 404)"
else
  echo "⚠️ Skipped steps 8–12 (POST /tickers failed — no ticker id)"
fi

# JSON summary (per LLD400 §2.5)
EXIT_CODE=0
[ "$FAILED" -gt 0 ] && EXIT_CODE=1
python3 -c "
import json
print(json.dumps({
  'passed': $PASSED,
  'failed': $FAILED,
  'exit_code': $EXIT_CODE,
  'backend': '$BACKEND',
  'work_package_id': 'S002-P003-WP002',
  'domain': 'D22'
}, indent=2))
" > "$JSON_SUMMARY"
cat "$JSON_SUMMARY"

rm -rf "$OUT"
echo "=== D22 Tickers API QA Done ==="
exit "$EXIT_CODE"
