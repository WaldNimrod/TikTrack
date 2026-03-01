#!/bin/bash
# D34 Alerts — FAV API verification (S002-P003-WP002)
# Team 50 canonical artifact (LLD400 §2.5)

set -e

BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
ADMIN_USER="${QA_USER:-TikTrackAdmin}"
ADMIN_PASS="${QA_PASS:-4181}"
OUT="/tmp/alerts_d34_fav_qa_$$"
JSON_SUMMARY="${D34_QA_JSON_OUT:-/tmp/alerts_d34_fav_qa_$$.summary.json}"

echo "=== D34 Alerts FAV API ==="
echo "Backend: $BACKEND"

mkdir -p "$OUT"
PASSED=0
FAILED=0

_ok() {
  echo "✅ $1"
  ((PASSED++)) || true
}

_fail() {
  echo "❌ $1"
  ((FAILED++)) || true
  if [ "${D34_STRICT:-1}" = "1" ]; then
    rm -rf "$OUT"
    exit 1
  fi
}

# 1) Login
ADMIN_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
  _fail "Admin Login failed"
  echo '{"passed":0,"failed":1,"exit_code":1,"domain":"D34"}' > "$JSON_SUMMARY"
  exit 1
fi
_ok "Admin Login"

# 2) Summary
CODE=$(curl -s -o "$OUT/summary.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/summary")
[ "$CODE" = "200" ] && _ok "GET /alerts/summary -> 200" || _fail "GET /alerts/summary -> $CODE"

# 3) List
CODE=$(curl -s -o "$OUT/list.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts")
[ "$CODE" = "200" ] && _ok "GET /alerts -> 200" || _fail "GET /alerts -> $CODE"

# 4) Create
CREATE_CODE=$(curl -s -o "$OUT/create.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/alerts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_type":"ticker","alert_type":"PRICE","priority":"MEDIUM","condition_field":"price","condition_operator":">=","condition_value":123.4567,"title":"D34 FAV Alert","message":"D34 test","is_active":true}')
ALERT_ID=$(python3 -c "import json; d=json.load(open('$OUT/create.json')); print(d.get('id',''))" 2>/dev/null || echo "")
[ "$CREATE_CODE" = "201" ] && [ -n "$ALERT_ID" ] && _ok "POST /alerts -> 201 (id=$ALERT_ID)" || _fail "POST /alerts -> $CREATE_CODE"

if [ -n "$ALERT_ID" ]; then
  # 5) Get by id
  CODE=$(curl -s -o "$OUT/get.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
  [ "$CODE" = "200" ] && _ok "GET /alerts/:id -> 200" || _fail "GET /alerts/:id -> $CODE"

  # 6) Toggle active + update title
  CODE=$(curl -s -o "$OUT/patch.json" -w "%{http_code}" -X PATCH "$BACKEND/api/v1/alerts/$ALERT_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"D34 FAV Alert Updated","is_active":false}')
  [ "$CODE" = "200" ] && _ok "PATCH /alerts/:id (edit+toggle) -> 200" || _fail "PATCH /alerts/:id -> $CODE"

  # 7) Filter
  CODE=$(curl -s -o "$OUT/filter.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts?target_type=ticker")
  [ "$CODE" = "200" ] && _ok "GET /alerts?target_type=ticker -> 200" || _fail "GET filter -> $CODE"

  # 8) Pagination + sort
  CODE=$(curl -s -o "$OUT/page_sort.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts?page=1&per_page=5&sort=created_at&order=desc")
  [ "$CODE" = "200" ] && _ok "GET /alerts?page&sort -> 200" || _fail "GET page/sort -> $CODE"

  # 9) Delete
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
  [ "$CODE" = "204" ] && _ok "DELETE /alerts/:id -> 204" || _fail "DELETE /alerts/:id -> $CODE"

  # 10) 404 after delete
  CODE=$(curl -s -o "$OUT/get404.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
  [ "$CODE" = "404" ] && _ok "GET /alerts/:id after delete -> 404" || _fail "GET /alerts/:id after delete -> $CODE"
else
  echo "⚠️ Skipped CRUD checks (create failed)"
fi

# 11) Negative error contracts (GF-G6-003)
# 11.1) 422 — body validation failure
CODE=$(curl -s -o "$OUT/neg_422_body.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/alerts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$CODE" = "422" ] && _ok "NEG 422 #1 POST /alerts invalid body -> 422" || _fail "NEG 422 #1 expected 422, got $CODE"

# 11.2) 422 — path UUID validation failure
CODE=$(curl -s -o "$OUT/neg_422_uuid.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/not-a-uuid")
[ "$CODE" = "422" ] && _ok "NEG 422 #2 GET /alerts/not-a-uuid -> 422" || _fail "NEG 422 #2 expected 422, got $CODE"

# 11.3) 401 — missing auth token
CODE=$(curl -s -o "$OUT/neg_401.json" -w "%{http_code}" "$BACKEND/api/v1/alerts")
[ "$CODE" = "401" ] && _ok "NEG 401 GET /alerts without auth -> 401" || _fail "NEG 401 expected 401, got $CODE"

# 11.4) 400 — invalid me/tickers contract (authenticated, missing required query)
CODE=$(curl -s -o "$OUT/neg_400.json" -w "%{http_code}" -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/me/tickers")
[ "$CODE" = "400" ] && _ok "NEG 400 POST /me/tickers missing ticker_id/symbol -> 400" || _fail "NEG 400 expected 400, got $CODE"

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
  'domain': 'D34'
}, indent=2))
" > "$JSON_SUMMARY"
cat "$JSON_SUMMARY"

rm -rf "$OUT"
echo "=== D34 Alerts FAV API Done ==="
exit "$EXIT_CODE"
