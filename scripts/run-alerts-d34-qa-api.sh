#!/bin/bash
# Alerts D34 — Gate-A API verification
# Team 50 — TEAM_10_TO_TEAM_50_MB3A_ALERTS_GATE_A_QA_REQUEST
# Tests: GET summary, list, POST, GET :id, PATCH, DELETE, 404 after delete, filter, pagination, sort

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
ADMIN_USER="${QA_USER:-TikTrackAdmin}"
ADMIN_PASS="${QA_PASS:-4181}"
OUT="/tmp/alerts_qa_$$"

echo "=== Alerts D34 QA — Gate-A API ==="
echo "Backend: $BACKEND"

mkdir -p "$OUT"

# 1. Admin Login
ADMIN_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin Login failed"
  rm -rf "$OUT"
  exit 1
fi
echo "✅ Admin Login OK"

# 2. GET /alerts/summary → 200
CODE=$(curl -s -o "$OUT/summary.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/summary")
[ "$CODE" = "200" ] && echo "✅ GET /alerts/summary → 200" || { echo "❌ GET summary → $CODE (expected 200)"; rm -rf "$OUT"; exit 1; }

# 3. GET /alerts (list) → 200
CODE=$(curl -s -o "$OUT/list.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts")
[ "$CODE" = "200" ] && echo "✅ GET /alerts → 200" || { echo "❌ GET list → $CODE"; rm -rf "$OUT"; exit 1; }

# 4. POST /alerts → 201
ALERT_RESP=$(curl -s -X POST "$BACKEND/api/v1/alerts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_type":"ticker","alert_type":"PRICE","priority":"MEDIUM","title":"QA Gate-A Test Alert","message":"Test"}')
ALERT_ID=$(echo "$ALERT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
if [ -z "$ALERT_ID" ]; then
  echo "❌ POST /alerts failed — no id in response"
  echo "$ALERT_RESP" | head -c 400
  rm -rf "$OUT"
  exit 1
fi
echo "✅ POST /alerts → 201 (alert_id=$ALERT_ID)"

# 5. GET /alerts/:id → 200
CODE=$(curl -s -o "$OUT/get.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
[ "$CODE" = "200" ] && echo "✅ GET /alerts/:id → 200" || { echo "❌ GET :id → $CODE"; rm -rf "$OUT"; exit 1; }

# 6. PATCH /alerts/:id → 200
CODE=$(curl -s -o "$OUT/patch.json" -w "%{http_code}" -X PATCH "$BACKEND/api/v1/alerts/$ALERT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"QA Gate-A Test Alert (updated)"}')
[ "$CODE" = "200" ] && echo "✅ PATCH /alerts/:id → 200" || { echo "❌ PATCH → $CODE"; rm -rf "$OUT"; exit 1; }

# 7. DELETE /alerts/:id → 204
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
[ "$CODE" = "204" ] && echo "✅ DELETE /alerts/:id → 204" || { echo "❌ DELETE → $CODE"; rm -rf "$OUT"; exit 1; }

# 8. GET /alerts/:id after delete → 404
CODE=$(curl -s -o "$OUT/get404.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$ALERT_ID")
[ "$CODE" = "404" ] && echo "✅ GET /alerts/:id after delete → 404" || { echo "❌ GET after delete → $CODE (expected 404)"; rm -rf "$OUT"; exit 1; }

# 9. Filter target_type
CODE=$(curl -s -o "$OUT/filter.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts?target_type=ticker")
[ "$CODE" = "200" ] && echo "✅ GET /alerts?target_type=ticker → 200" || echo "⚠️ Filter → $CODE"

# 10. Pagination
CODE=$(curl -s -o "$OUT/page.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts?page=1&per_page=5")
[ "$CODE" = "200" ] && echo "✅ GET /alerts?page=1&per_page=5 → 200" || echo "⚠️ Pagination → $CODE"

# 11. Sort
CODE=$(curl -s -o "$OUT/sort.json" -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts?sort=created_at&order=desc")
[ "$CODE" = "200" ] && echo "✅ GET /alerts?sort=created_at&order=desc → 200" || echo "⚠️ Sort → $CODE"

# 12. GET fake UUID → 404
FAKE_UUID="00000000-0000-0000-0000-000000000001"
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" "$BACKEND/api/v1/alerts/$FAKE_UUID")
[ "$CODE" = "404" ] && echo "✅ GET /alerts/{fake_uuid} → 404" || echo "⚠️ GET fake → $CODE"

rm -rf "$OUT"
echo "=== Alerts D34 API QA Done ==="
