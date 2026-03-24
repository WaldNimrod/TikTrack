#!/usr/bin/env bash
# run_monitor.sh — Pipeline Run Monitor
#
# Attaches to an active pipeline run and logs every gate checkpoint to a
# structured JSONL file. Run this in a separate terminal alongside the
# operator who is advancing gates.
#
# Usage (repo root):
#   bash scripts/run_monitor.sh [OPTIONS]
#
# Options:
#   --domain   tiktrack|agents_os   (default: tiktrack)
#   --wp       WP ID e.g. S003-P004-WP001 (optional, logged for reference)
#   --log      path to output JSONL  (default: logs/pipeline_run_YYYYMMDD_HHMMSS.jsonl)
#   --interval seconds between polls (default: 10)
#   --once     run a single snapshot and exit (useful for CI gate checkpoints)
#
# Output per line (JSONL):
#   {ts, domain, wp, gate, phase, gate_state, ssot_ok, test_count, test_ok, event}
#
# Prerequisites:
#   - python3 in PATH
#   - repo root is cwd
#   - agents_os_v2 installed (standard repo setup)
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── Defaults ─────────────────────────────────────────────────────────────────
DOMAIN="tiktrack"
WP_REF=""
INTERVAL=10
ONCE=0
LOG_FILE=""

# ── Parse args ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)   DOMAIN="$2";    shift 2 ;;
    --wp)       WP_REF="$2";    shift 2 ;;
    --log)      LOG_FILE="$2";  shift 2 ;;
    --interval) INTERVAL="$2";  shift 2 ;;
    --once)     ONCE=1;         shift 1 ;;
    *)          echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ── Default log path ─────────────────────────────────────────────────────────
if [[ -z "$LOG_FILE" ]]; then
  mkdir -p logs
  LOG_FILE="logs/pipeline_run_$(date -u +%Y%m%d_%H%M%S)_${DOMAIN}.jsonl"
fi
mkdir -p "$(dirname "$LOG_FILE")"

# ── Colors ───────────────────────────────────────────────────────────────────
C_RESET="\033[0m"
C_GREEN="\033[32m"
C_YELLOW="\033[33m"
C_RED="\033[31m"
C_CYAN="\033[36m"
C_BOLD="\033[1m"

log_banner() {
  echo -e "${C_BOLD}${C_CYAN}════════════════════════════════════════════════════════${C_RESET}"
  echo -e "${C_BOLD}${C_CYAN}  Pipeline Run Monitor — domain=${DOMAIN}${C_RESET}"
  echo -e "${C_BOLD}${C_CYAN}  Log: ${LOG_FILE}${C_RESET}"
  echo -e "${C_BOLD}${C_CYAN}  Poll interval: ${INTERVAL}s   (Ctrl+C to stop)${C_RESET}"
  echo -e "${C_BOLD}${C_CYAN}════════════════════════════════════════════════════════${C_RESET}"
}

# ── Core snapshot function ────────────────────────────────────────────────────
take_snapshot() {
  local ts
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # ── Read pipeline state ──────────────────────────────────────────────────
  local wp gate phase gate_state variant
  wp=$(python3 -c "
import sys, os; sys.path.insert(0,'.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load('$DOMAIN')
print(s.work_package_id or 'N/A')
" 2>/dev/null || echo "ERROR")

  gate=$(python3 -c "
import sys, os; sys.path.insert(0,'.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load('$DOMAIN')
print(s.current_gate or 'N/A')
" 2>/dev/null || echo "ERROR")

  phase=$(python3 -c "
import sys, os; sys.path.insert(0,'.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load('$DOMAIN')
print(s.current_phase or '')
" 2>/dev/null || echo "")

  gate_state=$(python3 -c "
import sys, os; sys.path.insert(0,'.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load('$DOMAIN')
print(s.gate_state or 'OPEN')
" 2>/dev/null || echo "UNKNOWN")

  # ── SSOT check ──────────────────────────────────────────────────────────
  local ssot_ok ssot_detail
  ssot_output=$(python3 -m agents_os_v2.tools.ssot_check --domain "$DOMAIN" 2>&1 || true)
  if echo "$ssot_output" | grep -q "✓ CONSISTENT"; then
    ssot_ok="true"
    ssot_detail="CONSISTENT"
  else
    ssot_ok="false"
    ssot_detail=$(echo "$ssot_output" | grep "·" | head -3 | tr '\n' ';' | sed 's/["\\/]/\\&/g')
  fi

  # ── Test count (fast — skip slow tests) ─────────────────────────────────
  local test_count test_ok
  test_output=$(python3 -m pytest agents_os_v2/tests/ -q --tb=no 2>&1 || true)
  test_count=$(echo "$test_output" | grep -oE "[0-9]+ passed" | head -1 | grep -oE "^[0-9]+" || echo "0")
  if echo "$test_output" | grep -qE "^FAILED|[0-9]+ failed"; then
    test_ok="false"
  else
    test_ok="true"
  fi

  # ── WSM COS snapshot ─────────────────────────────────────────────────────
  local wsm_gate wsm_wp
  wsm_gate=$(python3 -c "
import re
try:
    t = open('documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md').read()
    m = re.search(r'\|\s*current_gate\s*\|\s*([^|\n]+)\|', t)
    print(m.group(1).strip() if m else 'UNKNOWN')
except: print('UNKNOWN')
" 2>/dev/null || echo "UNKNOWN")

  wsm_wp=$(python3 -c "
import re
try:
    t = open('documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md').read()
    m = re.search(r'\|\s*in_progress_work_package_id\s*\|\s*([^|\n]+)\|', t)
    print(m.group(1).strip() if m else 'UNKNOWN')
except: print('UNKNOWN')
" 2>/dev/null || echo "UNKNOWN")

  # ── Build event tag ──────────────────────────────────────────────────────
  local event="POLL"
  if [[ "$gate" != "${PREV_GATE:-}" ]]; then
    event="GATE_CHANGE: ${PREV_GATE:-START} → ${gate}"
    PREV_GATE="$gate"
  fi

  # ── Write JSONL ──────────────────────────────────────────────────────────
  local json
  json=$(MON_TS="$ts" MON_DOMAIN="$DOMAIN" MON_WP="$wp" MON_GATE="$gate" \
    MON_PHASE="$phase" MON_GATE_STATE="$gate_state" MON_SSOT_OK="$ssot_ok" \
    MON_SSOT_DETAIL="$ssot_detail" MON_TEST_COUNT="${test_count:-0}" \
    MON_TEST_OK="$test_ok" MON_WSM_GATE="$wsm_gate" MON_WSM_WP="$wsm_wp" \
    MON_EVENT="$event" \
    python3 -c "
import json, os
data = {
    'ts':          os.environ['MON_TS'],
    'domain':      os.environ['MON_DOMAIN'],
    'wp':          os.environ['MON_WP'],
    'gate':        os.environ['MON_GATE'],
    'phase':       os.environ['MON_PHASE'],
    'gate_state':  os.environ['MON_GATE_STATE'],
    'ssot_ok':     os.environ['MON_SSOT_OK'] == 'true',
    'ssot_detail': os.environ['MON_SSOT_DETAIL'],
    'test_count':  int(os.environ.get('MON_TEST_COUNT') or 0),
    'test_ok':     os.environ['MON_TEST_OK'] == 'true',
    'wsm_gate':    os.environ['MON_WSM_GATE'],
    'wsm_wp':      os.environ['MON_WSM_WP'],
    'event':       os.environ['MON_EVENT'],
}
print(json.dumps(data, ensure_ascii=False))
")
  echo "$json" >> "$LOG_FILE"

  # ── Console output ───────────────────────────────────────────────────────
  local ssot_color="$C_GREEN"
  [[ "$ssot_ok" == "false" ]] && ssot_color="$C_RED"
  local test_color="$C_GREEN"
  [[ "$test_ok" == "false" ]] && test_color="$C_RED"

  printf "${C_CYAN}[%s]${C_RESET} ${C_BOLD}%-20s${C_RESET}  SSOT:${ssot_color}%-12s${C_RESET}  Tests:${test_color}%s${C_RESET}  WSM:%s\n" \
    "$(date -u +%H:%M:%S)" \
    "${gate}${phase:+/$phase}" \
    "$ssot_detail" \
    "${test_count}passed" \
    "$wsm_gate"

  # ── Alert on degradation ─────────────────────────────────────────────────
  if [[ "$ssot_ok" == "false" ]]; then
    echo -e "  ${C_RED}⚠  SSOT DRIFT: ${ssot_detail}${C_RESET}"
    echo -e "  ${C_YELLOW}   Fix: git checkout HEAD -- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md && ./pipeline_run.sh --domain ${DOMAIN} wsm-reset${C_RESET}"
  fi
  if [[ "$test_ok" == "false" ]]; then
    echo -e "  ${C_RED}⚠  TESTS FAILING — run: python3 -m pytest agents_os_v2/tests/ -v${C_RESET}"
  fi
}

# ── Main loop ─────────────────────────────────────────────────────────────────
PREV_GATE=""
log_banner

if [[ "$ONCE" -eq 1 ]]; then
  take_snapshot
  echo ""
  echo "Snapshot written → $LOG_FILE"
  exit 0
fi

echo ""
echo "Press Ctrl+C to stop monitoring."
echo ""

trap 'echo -e "\n${C_CYAN}Monitor stopped. Log: ${LOG_FILE}${C_RESET}"; exit 0' INT TERM

while true; do
  take_snapshot
  sleep "$INTERVAL"
done
