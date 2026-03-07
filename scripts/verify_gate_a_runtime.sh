#!/usr/bin/env bash
# Team 60 — S002-P002 GATE_4 remediation: verify runtime before gate-a E2E.
# Ensures frontend 8080, backend 8082, QA user TikTrackAdmin/4181, and login work.
# Run from repo root: bash scripts/verify_gate_a_runtime.sh

set -e
FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:8080}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8082}"
API_LOGIN="${BACKEND_URL}/api/v1/auth/login"
PASS=0
FAIL=0

echo "=============================================="
echo "GATE A runtime verification (Team 60)"
echo "=============================================="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""

# 1) Frontend 8080
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$FRONTEND_URL/" | grep -q '200\|301\|302'; then
  echo "[PASS] Frontend reachable at $FRONTEND_URL"
  ((PASS++)) || true
else
  echo "[FAIL] Frontend not reachable at $FRONTEND_URL — start with: scripts/start-frontend.sh"
  ((FAIL++)) || true
fi

# 2) Backend 8082 health
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$BACKEND_URL/health" | grep -q '200'; then
  echo "[PASS] Backend health OK at $BACKEND_URL/health"
  ((PASS++)) || true
else
  echo "[FAIL] Backend not reachable at $BACKEND_URL — start with: scripts/start-backend.sh"
  ((FAIL++)) || true
fi

# 3) Login with QA user (TikTrackAdmin / 4181)
LOGIN_STATUS=$(curl -s -o /tmp/gate_a_login.json -w "%{http_code}" --connect-timeout 3 -X POST "$API_LOGIN" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' 2>/dev/null || echo "000")
if [ "$LOGIN_STATUS" = "200" ]; then
  if grep -q access_token /tmp/gate_a_login.json 2>/dev/null; then
    echo "[PASS] Login with TikTrackAdmin/4181 — token received"
    ((PASS++)) || true
  else
    echo "[FAIL] Login 200 but no access_token in response"
    ((FAIL++)) || true
  fi
else
  echo "[FAIL] Login failed (HTTP $LOGIN_STATUS). Ensure backend is running and QA user seeded: python3 scripts/seed_qa_test_user.py"
  ((FAIL++)) || true
fi

# 4) Selenium config alignment
if grep -q "127.0.0.1:8080" tests/selenium-config.js && grep -q "127.0.0.1:8082" tests/selenium-config.js; then
  echo "[PASS] tests/selenium-config.js matches 8080/8082"
  ((PASS++)) || true
else
  echo "[FAIL] tests/selenium-config.js frontendUrl/backendUrl do not match 8080/8082"
  ((FAIL++)) || true
fi

echo ""
echo "=============================================="
echo "Result: $PASS pass, $FAIL fail"
echo "=============================================="
if [ "$FAIL" -gt 0 ]; then
  echo "Fix failures above, then run: cd tests && npm run test:gate-a"
  exit 1
fi
echo "Runtime OK. Run gate-a: cd tests && npm run test:gate-a"
exit 0
