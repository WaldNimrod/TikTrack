#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  ⚠️  OPERATOR-ONLY — DO NOT RUN WITHOUT ISOLATION PROTOCOL          ║
# ║                                                                      ║
# ║  This script runs ./pipeline_run.sh pass/fail commands that WRITE   ║
# ║  to PHOENIX_MASTER_WSM and pipeline_state files on the live repo.   ║
# ║  Running without isolation WILL contaminate the shared WSM.         ║
# ║                                                                      ║
# ║  REQUIRED before running:                                            ║
# ║    1. git stash (or worktree) to backup:                             ║
# ║         _COMMUNICATION/agents_os/pipeline_state_tiktrack.json        ║
# ║         _COMMUNICATION/agents_os/pipeline_state_agentsos.json        ║
# ║         documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md ║
# ║    2. Confirm pipeline_state_agentsos.json does NOT contain WP099   ║
# ║                                                                      ║
# ║  REQUIRED after running:                                             ║
# ║    ./pipeline_run.sh --domain tiktrack wsm-reset                     ║
# ║    git checkout HEAD -- <above 3 files>  (to restore clean state)   ║
# ║                                                                      ║
# ║  For safe Layer 1 canary without WSM writes — use instead:          ║
# ║    bash scripts/canary_simulation/run_canary_safe.sh                 ║
# ║                                                                      ║
# ║  Authority: DM-005 isolation policy (TEAM_101_PIPELINE_TEST_ISOLATION... v1.0.0) ║
# ╚══════════════════════════════════════════════════════════════════════╝
# Operator E2E simulation — S003-P014-WP001 (2026-03-23)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO"
export PIPELINE_RELAXED_KB84=1
export PIPELINE_DOMAIN=tiktrack
RUNLOG="_COMMUNICATION/team_101/_E2E_SIM_20260323/E2E_RUN_LOG.txt"
exec > >(tee -a "$RUNLOG") 2>&1

echo "======== $(date -u +%Y-%m-%dT%H:%M:%SZ) E2E START ========"

pass() { ./pipeline_run.sh --domain tiktrack pass "$@"; }

echo "--- GATE_0 PASS ---"
pass
python3 -c "
import os, json
from datetime import datetime, timezone
os.environ['PIPELINE_DOMAIN']='tiktrack'
from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator.wsm_writer import sync_parallel_tracks_from_pipeline
sync_parallel_tracks_from_pipeline()
"

echo "--- STORE GATE_1 LLD400 ---"
./pipeline_run.sh --domain tiktrack store GATE_1 \
  _COMMUNICATION/team_101/_E2E_SIM_20260323/S003_P014_WP001_SIM_LLD400_MIN.md

echo "--- GATE_1 PASS ---"
pass

echo "--- Inject work_plan for GATE_2 / 2.2 ---"
python3 << 'PY'
import os, json
from datetime import datetime, timezone
os.environ["PIPELINE_DOMAIN"] = "tiktrack"
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load("tiktrack")
s.work_plan = "# G3 Plan (simulation)\n\nDummy work plan for E2E. date: 2026-03-23\n"
s.save()
print("work_plan chars:", len(s.work_plan))
PY

echo "--- GATE_2: 2.2 -> 2.2v ---"
pass
echo "--- GATE_2: 2.2v -> 2.3 ---"
pass
echo "--- GATE_2: 2.3 -> GATE_3/3.1 ---"
pass

echo "--- Simulated implementation commit (before GATE_3/3.3 prompt) ---"
SIM_MARK="_COMMUNICATION/team_101/_E2E_SIM_20260323/SIM_IMPL_MARKER.txt"
echo "simulation implementation checkpoint 2026-03-23" > "$SIM_MARK"
git add "$SIM_MARK"
git commit -m "chore(sim): E2E pipeline marker before GATE_3/3.3 (S003-P014-WP001)"

echo "--- GATE_3: 3.1 -> 3.2 ---"
pass
echo "--- GATE_3: 3.2 -> 3.3 (git diff required for next generate) ---"
pass
echo "--- GATE_3: 3.3 -> GATE_4/4.1 ---"
pass

echo "--- Extra commit before GATE_4 QA prompt chain (if needed) ---"
echo "checkpoint2 $(date -u)" >> "$SIM_MARK"
git add "$SIM_MARK"
git commit -m "chore(sim): E2E checkpoint before GATE_4 (S003-P014-WP001)"

echo "--- GATE_4: 4.1 -> 4.2 ---"
pass
echo "--- GATE_4: 4.2 -> 4.3 ---"
pass
echo "--- GATE_4: 4.3 -> GATE_5/5.1 ---"
pass

echo "--- GATE_5 PASS (complete WP) ---"
pass

python3 -m agents_os_v2.tools.ssot_check --domain tiktrack

echo "======== E2E COMPLETE $(date -u +%Y-%m-%dT%H:%M:%SZ) ========"
