#!/usr/bin/env bash
# E2E validation: Event Log data visible in all UIs
# Prerequisites: AOS server on port 8090, seed run: python3 agents_os/scripts/seed_event_log.py
# Usage: ./tests/e2e_event_log_validation.sh

set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

echo "[e2e] 1. Seeding event log…"
python3 agents_os/scripts/seed_event_log.py

echo "[e2e] 2. Checking API returns events for both domains…"
TIK=$(curl -s "http://localhost:8090/api/log/events?domain=tiktrack&limit=5" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo "0")
AOS=$(curl -s "http://localhost:8090/api/log/events?domain=agents_os&limit=5" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo "0")
GLOBAL=$(curl -s "http://localhost:8090/api/log/events?limit=10" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo "0")

echo "      tiktrack: $TIK events | agents_os: $AOS events | global: $GLOBAL events"
if [ "$GLOBAL" -lt 1 ]; then
  echo "[e2e] FAIL: No events returned. Is AOS server running? (./agents_os/scripts/start_ui_server.sh)"
  exit 1
fi
echo "[e2e] PASS: Events API returns data"

echo "[e2e] 3. Checking _COMMUNICATION mount (pipeline state)…"
STAT=$(curl -sI "http://localhost:8090/_COMMUNICATION/agents_os/pipeline_state_tiktrack.json" | head -1)
if [[ "$STAT" != *"200"* ]]; then
  echo "[e2e] FAIL: pipeline_state_tiktrack.json not served: $STAT"
  exit 1
fi
echo "[e2e] PASS: Pipeline state files served"

echo ""
echo "[e2e] All checks PASS. Open Dashboard and Roadmap to verify:"
echo "      http://localhost:8090/static/PIPELINE_DASHBOARD.html"
echo "      http://localhost:8090/static/PIPELINE_ROADMAP.html"
