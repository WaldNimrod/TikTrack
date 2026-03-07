#!/bin/bash
# D34 CATS precision check (S002-P003-WP002)
# Verifies decimal-like condition value round-trip for alerts.

set -e

BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
ADMIN_USER="${QA_USER:-TikTrackAdmin}"
ADMIN_PASS="${QA_PASS:-4181}"
OUT="/tmp/d34_cats_precision_$$"
JSON_SUMMARY="${D34_CATS_JSON_OUT:-/tmp/d34_cats_precision_$$.summary.json}"

echo "=== D34 CATS Precision ==="
echo "Backend: $BACKEND"

mkdir -p "$OUT"
PASSED=0
FAILED=0

_ok() { echo "✅ $1"; ((PASSED++)) || true; }
_fail() {
  echo "❌ $1"
  ((FAILED++)) || true
  if [ "${D34_CATS_STRICT:-1}" = "1" ]; then
    rm -rf "$OUT"
    exit 1
  fi
}

ADMIN_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")
[ -n "$ADMIN_TOKEN" ] && _ok "Admin Login" || _fail "Admin Login failed"

VALUE_IN="123.4567"
CREATE_CODE=$(curl -s -o "$OUT/create.json" -w "%{http_code}" -X POST "$BACKEND/api/v1/alerts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"target_type\":\"ticker\",\"alert_type\":\"PRICE\",\"priority\":\"HIGH\",\"condition_field\":\"price\",\"condition_operator\":\">=\",\"condition_value\":$VALUE_IN,\"title\":\"D34 CATS Precision\",\"message\":\"precision check\",\"is_active\":true}")
ALERT_ID=$(python3 -c "import json; d=json.load(open('$OUT/create.json')); print(d.get('id',''))" 2>/dev/null || echo "")
[ "$CREATE_CODE" = "201" ] && [ -n "$ALERT_ID" ] && _ok "Create alert with condition_value=$VALUE_IN" || _fail "Create alert failed ($CREATE_CODE)"

if [ -n "$ALERT_ID" ]; then
  CODE=$(curl -s -o "$OUT/get.json" -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
  [ "$CODE" = "200" ] && _ok "GET /alerts/:id -> 200" || _fail "GET /alerts/:id -> $CODE"

  VALUE_OUT=$(python3 -c "import json; d=json.load(open('$OUT/get.json')); print(d.get('condition_value',''))" 2>/dev/null || echo "")
  python3 -c "v=float('$VALUE_OUT'); vin=float('$VALUE_IN'); import sys; sys.exit(0 if abs(v-vin) < 1e-9 else 1)" \
    && _ok "CATS precision preserved ($VALUE_OUT)" \
    || _fail "CATS precision mismatch (in=$VALUE_IN out=$VALUE_OUT)"

  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
  [ "$CODE" = "204" ] && _ok "Cleanup DELETE /alerts/:id -> 204" || _fail "Cleanup delete failed ($CODE)"
fi

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
  'domain': 'D34',
  'track': 'CATS_PRECISION'
}, indent=2))
" > "$JSON_SUMMARY"
cat "$JSON_SUMMARY"

rm -rf "$OUT"
echo "=== D34 CATS Precision Done ==="
exit "$EXIT_CODE"
