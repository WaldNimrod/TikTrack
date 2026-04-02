#!/usr/bin/env bash
# AOS v3 — Remediation Phase 5 (F-05) canary simulation (Team 51).
# DB-backed pipeline steps via pytest; explicit PASS/FAIL + exit code (M3).
#
# Usage (repo root):
#   export AOS_V3_DATABASE_URL=postgresql://...
#   bash scripts/run_aos_v3_phase5_canary_sim.sh
#
# Optional: load agents_os_v3/.env when present (same pattern as init_aos_v3_database.sh).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/agents_os_v3/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/agents_os_v3/.env"
  set +a
fi

if [[ -z "${AOS_V3_DATABASE_URL:-}" ]]; then
  echo "ERROR: AOS_V3_DATABASE_URL is not set (set env or add agents_os_v3/.env)" >&2
  exit 1
fi

export PYTHONPATH="$ROOT"

echo "══════════════════════════════════════════════════════════════"
echo "  AOS v3 — Phase 5 Canary Simulation (pytest / DB)"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════════════════════════"

LOG="$(mktemp /tmp/aosv3-phase5-canary.XXXXXX)"
if python3 -m pytest \
  "$ROOT/agents_os_v3/tests/test_remediation_phase5_canary_simulation.py" \
  -v --tb=short >"$LOG" 2>&1; then
  cat "$LOG"
  echo ""
  echo "RESULT: PHASE 5 CANARY SIM — PASS"
  rm -f "$LOG"
  exit 0
else
  cat "$LOG"
  echo ""
  echo "RESULT: PHASE 5 CANARY SIM — FAIL"
  rm -f "$LOG"
  exit 1
fi
