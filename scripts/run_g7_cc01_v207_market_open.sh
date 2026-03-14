#!/usr/bin/env bash
# GATE_7 Part A CC-01 v2.0.7 — ריצה בחלון market-open בלבד
# הרץ רק כאשר US market פתוח (09:30–16:00 ET, Mon–Fri).
# Pre-flight: scripts/check_market_open_et.py — exit 0 רק אז.
# תוצאה: G7_PART_A_V2_0_7.log עם mode=market_open, JSON מעודכן.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_PATH="$PROJECT_ROOT/documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log"
PORT=8083
cd "$PROJECT_ROOT"
mkdir -p "$(dirname "$LOG_PATH")"

echo "=== Pre-flight: US market open (09:30–16:00 ET) ==="
python3 scripts/check_market_open_et.py || { echo "ABORT: Run during 09:30–16:00 ET Mon–Fri."; exit 1; }

echo "=== Starting backend on $PORT with tee to $LOG_PATH ==="
(set -a; [ -f api/.env ] && source api/.env; set +a
 export GATE7_CC_EVIDENCE=1
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
BACKEND_URL="http://127.0.0.1:$PORT" G7_PART_A_LOG_PATH="documentation/reports/05-REPORTS/artifacts/G7_PART_A_V2_0_7.log" G7_PART_A_MODE=market_open \
  python3 scripts/verify_g7_part_a_runtime.py || { kill -9 $BACKEND_PID 2>/dev/null; exit 1; }

kill -9 $BACKEND_PID 2>/dev/null
trap - EXIT INT TERM

echo "=== Verify log contains mode=market_open ==="
grep -q "mode=market_open" "$LOG_PATH" || { echo "FAIL: Log does not contain mode=market_open. Not admissible for CC-01."; exit 1; }
echo "PASS: Log contains mode=market_open."
echo "=== Done. Log: $LOG_PATH — JSON updated. Team 50: corroboration v2.0.7 with same log_path and timestamp. ==="
