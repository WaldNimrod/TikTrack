#!/usr/bin/env bash
# Safe Canary — Layer 1 checks only.
# Does NOT invoke ./pipeline_run.sh (no WSM / COS writes from gate advance).
#
# Usage (repo root):
#   bash scripts/canary_simulation/run_canary_safe.sh
# Optional:
#   CANARY_WP=S003-P013-WP002 bash scripts/canary_simulation/run_canary_safe.sh
# If ssot_check fails on *pre-existing* COS drift (not caused by this script):
#   CANARY_SKIP_SSOT=1 bash scripts/canary_simulation/run_canary_safe.sh
#   then fix WSM per Gateway: ./pipeline_run.sh wsm-reset
#
# See: _COMMUNICATION/team_101/TEAM_101_PIPELINE_TEST_ISOLATION_AND_WSM_DRIFT_REMEDIATION_v1.0.0.md
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
export PYTHONPATH=.
WP="${CANARY_WP:-S003-P013-WP002}"

echo "== Canary safe: generate_mocks + verify_layer1 (no pipeline_run) =="
python3 scripts/canary_simulation/generate_mocks.py --wp "$WP"
if [[ "${CANARY_SKIP_SSOT:-}" == "1" ]]; then
  python3 scripts/canary_simulation/verify_layer1.py --wp "$WP" --phase-b --skip-ssot
else
  python3 scripts/canary_simulation/verify_layer1.py --wp "$WP" --phase-b
fi

if [[ "${CANARY_SKIP_SSOT:-}" != "1" ]]; then
  echo "== ssot_check agents_os (tiktrack already run inside verify_layer1) =="
  python3 -m agents_os_v2.tools.ssot_check --domain agents_os
else
  echo "== ssot_check skipped (CANARY_SKIP_SSOT=1) — fix drift then re-run without skip =="
fi

echo ""
echo "OK — No pipeline_run.sh was executed; this script did not write WSM."
echo "Layer 2 (Selenium): start ./agents_os/scripts/start_ui_server.sh then run tests per README."
