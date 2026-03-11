#!/usr/bin/env bash
# GATE_7 Part A Rerun v2.0.1 — Team 60/50
# Ensures backend runs with log capture, then runs verification.
#
# Usage:
#   ./scripts/run_g7_part_a_rerun.sh [four_cycle|market_open|off_hours]
#
# Prerequisites:
#   - Backend MUST be running with stdout captured to a file, e.g.:
#     cd api && uvicorn api.main:app --host 0.0.0.0 --port 8082 2>&1 | tee /tmp/g7_part_a.log
#   - Or set G7_PART_A_LOG_PATH to point to that file and run verification only:
#     G7_PART_A_LOG_PATH=/tmp/g7_part_a.log ./scripts/run_g7_part_a_rerun.sh four_cycle

set -e
MODE="${1:-four_cycle}"
LOG_FILE="${G7_PART_A_LOG_PATH:-/tmp/g7_part_a.log}"
BACKEND="${BACKEND_URL:-http://127.0.0.1:8082}"

echo "=============================================="
echo "GATE_7 Part A Rerun v2.0.1"
echo "=============================================="
echo "Mode: $MODE"
echo "Log file: $LOG_FILE"
echo "Backend: $BACKEND"
echo ""

if [ ! -f "$LOG_FILE" ]; then
  echo "WARN: Log file does not exist: $LOG_FILE"
  echo "Start backend with:"
  echo "  cd api && uvicorn api.main:app --host 0.0.0.0 --port 8082 2>&1 | tee $LOG_FILE"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

# Check backend health
if ! curl -sf --connect-timeout 3 "$BACKEND/health" >/dev/null 2>&1; then
  echo "FAIL: Backend not reachable at $BACKEND. Start it first."
  exit 1
fi
echo "PASS: Backend reachable"

# Run verification
export G7_PART_A_LOG_PATH="$LOG_FILE"
export G7_PART_A_MODE="$MODE"
python3 scripts/verify_g7_part_a_runtime.py
