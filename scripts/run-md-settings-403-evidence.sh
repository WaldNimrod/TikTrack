#!/bin/bash
# MD-SETTINGS 403 Evidence — non-admin GET + PATCH
# Team 50 — TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_403_EVIDENCE_REQUEST
# Produces evidence for Gate-B 403 criterion.

set -e
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"
NON_ADMIN_USER="${NON_ADMIN_USER:-qa_nonadmin}"
NON_ADMIN_PASS="${NON_ADMIN_PASS:-qa403test}"
EVIDENCE_DIR="${EVIDENCE_DIR:-$(dirname "$0")/../documentation/05-REPORTS/artifacts}"
LOG_FILE="$EVIDENCE_DIR/MD_SETTINGS_403_EVIDENCE_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$EVIDENCE_DIR"

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE"; }

log "=== MD-SETTINGS 403 Evidence Run ==="
log "Backend: $BACKEND | User: $NON_ADMIN_USER (role USER)"

# Ensure non-admin user exists
log "Seeding non-admin user if needed..."
python3 "$(dirname "$0")/seed_nonadmin_for_403.py" >> "$LOG_FILE" 2>&1 || true

# Login as non-admin
log "Logging in as non-admin..."
NON_TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username_or_email\":\"$NON_ADMIN_USER\",\"password\":\"$NON_ADMIN_PASS\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$NON_TOKEN" ]; then
  log "❌ Non-admin login failed. Cannot run 403 test."
  exit 1
fi
log "✅ Non-admin login OK"

# GET — expect 403
GET_CODE=$(curl -s -o /tmp/md_403_get.json -w "%{http_code}" \
  -H "Authorization: Bearer $NON_TOKEN" "$BACKEND/api/v1/settings/market-data")
log "GET /settings/market-data → HTTP $GET_CODE"
GET_BODY=$(cat /tmp/md_403_get.json 2>/dev/null | head -c 200)
log "   Body: $GET_BODY"

# PATCH — expect 403
PATCH_CODE=$(curl -s -o /tmp/md_403_patch.json -w "%{http_code}" -X PATCH "$BACKEND/api/v1/settings/market-data" \
  -H "Authorization: Bearer $NON_TOKEN" -H "Content-Type: application/json" \
  -d '{"delay_between_symbols_seconds": 1}')
log "PATCH /settings/market-data → HTTP $PATCH_CODE"
PATCH_BODY=$(cat /tmp/md_403_patch.json 2>/dev/null | head -c 200)
log "   Body: $PATCH_BODY"

# Result
if [ "$GET_CODE" = "403" ] && [ "$PATCH_CODE" = "403" ]; then
  log "✅ 403 Evidence: PASS — both GET and PATCH return 403 Forbidden"
  exit 0
else
  log "❌ 403 Evidence: FAIL — GET=$GET_CODE (expected 403), PATCH=$PATCH_CODE (expected 403)"
  exit 1
fi
