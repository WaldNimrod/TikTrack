#!/usr/bin/env bash
# GATE_7 Part A CC-01 v2.0.8 — ריצה בחלון market-open בלבד
# TEAM_90_TO_TEAM_60_TEAM_50_..._CC01_COMPLETION_MANDATE_v2.0.7
# הרץ רק כאשר US market פתוח (09:30–16:00 ET, Mon–Fri).
# תוצאה: G7_PART_A_V2_0_8.log עם mode=market_open, JSON מעודכן.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_PATH="$PROJECT_ROOT/documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_8.log"
PORT=8083
cd "$PROJECT_ROOT"
mkdir -p "$(dirname "$LOG_PATH")"

echo "=== Pre-flight: US market open (09:30–16:00 ET) ==="
if [ -z "$GATE7_BYPASS_PREFLIGHT" ]; then
  python3 scripts/check_market_open_et.py || { echo "ABORT: Run during 09:30–16:00 ET Mon–Fri."; exit 1; }
else
  echo "WARN: GATE7_BYPASS_PREFLIGHT=1 — local/test only. Export GATE7_FORCE_MARKET_OPEN=1 for backend."
fi
export GATE7_FORCE_MARKET_OPEN="${GATE7_FORCE_MARKET_OPEN:-$GATE7_BYPASS_PREFLIGHT}"

echo "=== Starting backend on $PORT with tee to $LOG_PATH ==="
(set -a; [ -f api/.env ] && source api/.env; set +a
 export GATE7_CC_EVIDENCE=1
 export GATE7_FORCE_MARKET_OPEN="${GATE7_FORCE_MARKET_OPEN:-}"
 cd api && source venv/bin/activate 2>/dev/null; cd ..
 PYTHONPATH=api python3 -m uvicorn api.main:app --host 0.0.0.0 --port $PORT 2>&1 | tee "$LOG_PATH") &
BACKEND_PID=$!
trap "kill -9 $BACKEND_PID 2>/dev/null; exit 1" EXIT INT TERM

echo "=== Waiting for backend health ==="
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/health" 2>/dev/null | grep -q 200; then
    echo "Backend ready."
    break
  fi
  sleep 1
done
curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/health" | grep -q 200 || { echo "Backend failed to start."; exit 1; }

echo "=== Run A (market_open) verify ==="
BACKEND_URL="http://127.0.0.1:$PORT" G7_PART_A_LOG_PATH="documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_8.log" G7_PART_A_MODE=market_open \
  python3 scripts/verify_g7_part_a_runtime.py || { kill -9 $BACKEND_PID 2>/dev/null; exit 1; }

kill -9 $BACKEND_PID 2>/dev/null
trap - EXIT INT TERM

echo "=== Verify log contains mode=market_open ==="
grep -q "mode=market_open" "$LOG_PATH" || { echo "FAIL: Log does not contain mode=market_open. Not admissible for CC-01."; exit 1; }
echo "PASS: Log contains mode=market_open."

# Ensure JSON has run_id and log_path for v2.0.8
JSON_PATH="$PROJECT_ROOT/documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json"
if [ -f "$JSON_PATH" ]; then
  python3 -c "
import json
p = '$JSON_PATH'
with open(p) as f: d = json.load(f)
d['run_id'] = 'v2.0.8-cc01-market-open'
d['log_path'] = 'documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_8.log'
with open(p, 'w') as f: json.dump(d, f, indent=2)
"
fi

echo "=== Done. Log: $LOG_PATH — JSON updated. Team 50: corroboration v2.0.8. ==="
