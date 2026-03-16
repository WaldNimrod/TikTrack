#!/usr/bin/env bash
# pipeline_run.sh — agents_os_v2 workflow helper
#
# Usage:
#   ./pipeline_run.sh              → generate current gate prompt + display for copy-paste
#   ./pipeline_run.sh pass         → advance current gate PASS → show next
#   ./pipeline_run.sh fail "why"   → advance current gate FAIL with reason
#   ./pipeline_run.sh approve      → approve human-gate (GATE_2, GATE_6, GATE_7)
#   ./pipeline_run.sh status       → show pipeline status only
#   ./pipeline_run.sh gate NAME    → override: generate prompt for specific gate
#
# Domain support (parallel pipelines):
#   ./pipeline_run.sh --domain tiktrack  pass       → advance TikTrack pipeline
#   ./pipeline_run.sh --domain agents_os pass       → advance AgentsOS pipeline
#   PIPELINE_DOMAIN=agents_os ./pipeline_run.sh     → env-var alternative
#
# Visual standard: prompt block is marked with ▼▼▼ (start) and ▲▲▲ (end)
# for instant eye-identification in terminal output.

set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="python3 -m agents_os_v2.orchestrator.pipeline"
PROMPTS_DIR="$REPO/_COMMUNICATION/agents_os/prompts"

cd "$REPO"

# ── domain resolution ───────────────────────────────────────────────────────
# Precedence: --domain flag > PIPELINE_DOMAIN env > auto-detect from state file

DOMAIN="${PIPELINE_DOMAIN:-}"

# Parse --domain flag before subcommand
if [[ "${1:-}" == "--domain" ]]; then
  DOMAIN="$2"
  shift 2
fi

# Export so Python subprocesses can read it
if [ -n "$DOMAIN" ]; then
  export PIPELINE_DOMAIN="$DOMAIN"
  DOMAIN_LABEL="[${DOMAIN}] "
else
  DOMAIN_LABEL=""
fi

# ── helpers ────────────────────────────────────────────────────────────────

_get_gate() {
  python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
print(PipelineState.load(domain).current_gate)
"
}

_get_domain() {
  python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
print(PipelineState.load(domain).project_domain)
"
}

_get_engine() {
  local gate="$1"
  python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.pipeline import GATE_CONFIG, _domain_gate_owner
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
state = PipelineState.load(domain)
gate = '${gate}'
cfg = GATE_CONFIG.get(gate, {})
effective_owner = _domain_gate_owner(gate, state.project_domain) or cfg.get('owner', '?')
print(cfg.get('engine', '?') + '  |  owner: ' + effective_owner + '  [' + state.project_domain + ']')
"
}

_show_prompt() {
  local gate="$1"
  local domain_raw
  domain_raw=$(_get_domain)
  local domain_slug
  domain_slug=$(echo "$domain_raw" | tr '[:upper:]' '[:lower:]' | tr -d '_-')
  local prompt_file="$PROMPTS_DIR/${domain_slug}_${gate}_prompt.md"

  if [ ! -f "$prompt_file" ]; then
    echo "[pipeline_run] Prompt file not found: $prompt_file"
    echo "[pipeline_run] Run: ./pipeline_run.sh  (to generate it first)"
    exit 1
  fi

  # ── A1: Staleness guard — warn if state file is newer than the prompt file ──
  # Prevents displaying a prompt generated against an older pipeline state.
  local state_file="$REPO/_COMMUNICATION/agents_os/pipeline_state_${domain_slug}.json"
  if [ -f "$state_file" ] && [ "$state_file" -nt "$prompt_file" ]; then
    echo ""
    echo "⚠️  [pipeline_run] STALE PROMPT — state has changed since this prompt was generated."
    echo "   Regenerating now..."
    $CLI --generate-prompt "$(python3 -c "
import sys,os; sys.path.insert(0,'.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
print(PipelineState.load(domain).current_gate)
")" 2>&1 | grep -v "^━"
    echo ""
  fi

  local engine
  engine=$(_get_engine "$gate")

  echo ""
  printf '▼%.0s' {1..74}; echo ""
  printf "  ${DOMAIN_LABEL}PASTE INTO AI:  %-20s  →  %s\n" "$gate" "$engine"
  printf "  File: %s\n" "$prompt_file"
  printf '▼%.0s' {1..74}; echo ""
  echo ""
  cat "$prompt_file"
  echo ""
  printf '▲%.0s' {1..74}; echo ""
  printf "  END OF PROMPT   →   After AI responds: ./pipeline_run.sh pass\n"
  printf '▲%.0s' {1..74}; echo ""
  echo ""
}

_generate_and_show() {
  local gate="$1"
  echo ""
  echo "[pipeline_run] ${DOMAIN_LABEL}Generating prompt for: $gate"
  $CLI --generate-prompt "$gate" 2>&1 | grep -v "^━"
  _show_prompt "$gate"
}

_refresh_state_snapshot() {
  # Re-read WSM and regenerate STATE_SNAPSHOT.json — silent, non-blocking.
  # Ensures Dashboard health-warnings panel always reflects current WSM state.
  # AD-V2-01 prevention: snapshot is always fresh before any pipeline operation.
  python3 -m agents_os_v2.observers.state_reader 2>/dev/null || \
    echo "[pipeline_run] ⚠️  state_reader refresh failed (STATE_SNAPSHOT.json may be stale)"
}

_auto_store_gate1_artifact() {
  # AC-10 (short-term implementation): at GATE_1, auto-detect the latest
  # TEAM_170_{WP_ID}_LLD400_v*.md file and store it into lld400_content if
  # the stored version is stale or empty. Eliminates the hidden manual `store` step.
  # Called before prompt generation AND before pass validation.
  local result
  result=$(python3 -c "
import sys, os, json, glob
sys.path.insert(0, '.')
domain = os.environ.get('PIPELINE_DOMAIN') or None
if domain == 'agents_os':
    sf = '_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
elif domain == 'tiktrack':
    sf = '_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'
else:
    sf = '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    state = json.loads(open(sf).read())
except Exception:
    sys.exit(0)
if state.get('current_gate') != 'GATE_1':
    sys.exit(0)
wp = state.get('work_package_id', '')
if not wp:
    sys.exit(0)
wp_fs = wp.replace('-', '_')
pattern = f'_COMMUNICATION/team_170/TEAM_170_{wp_fs}_LLD400_v*.md'
files = sorted(glob.glob(pattern))
if not files:
    print('NO_FILE')
    sys.exit(0)
latest = files[-1]
try:
    content = open(latest).read()
except Exception:
    sys.exit(0)
current = state.get('lld400_content', '')
if content.strip() == current.strip():
    print(f'ALREADY_STORED:{latest}')
    sys.exit(0)
print(f'STORE:{latest}')
" 2>/dev/null)

  if [[ "$result" == STORE:* ]]; then
    local file="${result#STORE:}"
    echo ""
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  🔄 AC-10 auto-store: ${file}"
    $CLI --store-artifact GATE_1 "$file" 2>/dev/null && \
      echo "  ✅ lld400_content updated — Team 190 will see latest spec" || \
      echo "  ⚠️  auto-store failed — run manually: ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}store GATE_1 ${file}"
    echo "  ────────────────────────────────────────────────────────────────"
    echo ""
  elif [[ "$result" == NO_FILE ]]; then
    echo ""
    echo "  ⚠️  GATE_1: No LLD400 file found in _COMMUNICATION/team_170/ for this WP."
    echo "  Team 170 must produce the LLD400 before this gate can proceed."
    echo ""
  fi
  # ALREADY_STORED: no output — silent pass
}

_auto_store_g3plan_artifact() {
  # AC-11: at G3_PLAN gate, auto-detect the latest
  # TEAM_10_{WP_ID}_G3_PLAN_WORK_PLAN_v*.md and store it into work_plan if
  # the stored version is stale or empty. Mirrors the AC-10 pattern for GATE_1.
  # Called before phase2 prompt generation at G3_PLAN.
  local result
  result=$(python3 -c "
import sys, os, json, glob
sys.path.insert(0, '.')
domain = os.environ.get('PIPELINE_DOMAIN') or None
if domain == 'agents_os':
    sf = '_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
elif domain == 'tiktrack':
    sf = '_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'
else:
    sf = '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    state = json.loads(open(sf).read())
except Exception:
    sys.exit(0)
if state.get('current_gate') != 'G3_PLAN':
    sys.exit(0)
wp = state.get('work_package_id', '')
if not wp:
    sys.exit(0)
wp_fs = wp.replace('-', '_')
pattern = f'_COMMUNICATION/team_10/TEAM_10_{wp_fs}_G3_PLAN_WORK_PLAN_v*.md'
files = sorted(glob.glob(pattern))
if not files:
    print('NO_FILE')
    sys.exit(0)
latest = files[-1]
try:
    content = open(latest).read()
except Exception:
    sys.exit(0)
current = state.get('work_plan', '')
if content.strip() == current.strip():
    print(f'ALREADY_STORED:{latest}')
    sys.exit(0)
print(f'STORE:{latest}')
" 2>/dev/null)

  if [[ "$result" == STORE:* ]]; then
    local file="${result#STORE:}"
    echo ""
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  🔄 AC-11 G3_PLAN auto-store: ${file}"
    $CLI --store-artifact G3_PLAN "$file" 2>/dev/null && \
      echo "  ✅ work_plan updated — G3_5 mandate will include latest plan" || \
      echo "  ⚠️  auto-store failed — run manually: ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}store G3_PLAN ${file}"
    echo "  ────────────────────────────────────────────────────────────────"
    echo ""
  elif [[ "$result" == NO_FILE ]]; then
    echo ""
    echo "  ⚠️  G3_PLAN: No work plan found in _COMMUNICATION/team_10/ for WP."
    echo "  Team 10 must save TEAM_10_*_G3_PLAN_WORK_PLAN_v*.md before phase2 can proceed."
    echo ""
  fi
  # ALREADY_STORED: no output — silent pass
}

_validate_stage_alignment() {
  # Stage-alignment guard — prevents pipeline ops on a wrong-stage state file.
  # Reads stage_id from the active pipeline state and compares to WSM active_stage_id.
  # If mismatch AND no AUTHORIZED_STAGE_EXCEPTIONS entry → BLOCK with error.
  # AD-V2-05 prevention: catches stale stage_id before any gate advance.
  python3 -c "
import sys, os, json, re
sys.path.insert(0, '.')

domain = os.environ.get('PIPELINE_DOMAIN') or None
if domain == 'agents_os':
    sf = '_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
elif domain == 'tiktrack':
    sf = '_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'
else:
    sf = '_COMMUNICATION/agents_os/pipeline_state.json'

try:
    state = json.loads(open(sf).read())
except Exception:
    sys.exit(0)  # can't read state — let CLI handle it

pipe_stage = state.get('stage_id', '')
wp_id      = state.get('work_package_id', '')

# No active WP → idle state, no alignment needed
if not wp_id or not pipe_stage:
    sys.exit(0)

# Read WSM active_stage_id
wsm_path = 'documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md'
try:
    wsm_text = open(wsm_path).read()
    m = re.search(r'active_stage_id\s*[|:]\s*(S\d+)', wsm_text)
    wsm_stage = m.group(1) if m else ''
except Exception:
    wsm_stage = ''

if not wsm_stage or pipe_stage == wsm_stage:
    sys.exit(0)  # match or unknown WSM stage → OK

# Mismatch detected — check for authorized exception
AUTHORIZED = ['S001']  # mirrors pipeline-config.js AUTHORIZED_STAGE_EXCEPTIONS
if pipe_stage in AUTHORIZED:
    print(f'[pipeline_run] ℹ️  AUTHORIZED EXCEPTION: pipeline stage {pipe_stage} ≠ WSM {wsm_stage} — exception registered, continuing')
    sys.exit(0)

# Unauthorized mismatch → BLOCK
print('')
print('════════════════════════════════════════════════════════════════════')
print(f'  🔴 STAGE MISMATCH — ADVANCE BLOCKED')
print(f'  pipeline_state.stage_id = {pipe_stage}')
print(f'  WSM active_stage_id     = {wsm_stage}')
print('')
print('  The pipeline state file references a stage that no longer matches')
print('  the current WSM active stage. This must be resolved before advancing.')
print('')
print('  Resolution options:')
print('  1. Update pipeline_state.stage_id to match WSM active stage')
print('  2. Register an authorized exception in pipeline-config.js')
print('  3. Update the WSM if the active stage is incorrect')
print('════════════════════════════════════════════════════════════════════')
print('')
sys.exit(1)
" 2>/dev/null
  return $?
}

# ── main ───────────────────────────────────────────────────────────────────

case "${1:-next}" in

  next|"")
    _refresh_state_snapshot
    GATE=$(_get_gate)
    _auto_store_gate1_artifact   # AC-10: auto-store latest LLD400 before generating prompt
    $CLI --status
    _generate_and_show "$GATE"
    ;;

  pass)
    _refresh_state_snapshot
    _validate_stage_alignment || exit 1
    GATE=$(_get_gate)
    _auto_store_gate1_artifact   # AC-10: ensure latest LLD400 is stored before validation guard runs

    # ── Artifact validation before advancing ─────────────────────────────
    # Server-side check: required deliverables must exist before advancing.
    # Bypass with: ./pipeline_run.sh pass --force  (logs a warning, still advances)
    FORCE_FLAG="${2:-}"
    VALIDATION_FAILED=0
    MISSING_ARTIFACTS=""
    STORE_HINT=""
    # Build domain-aware command prefix for error message suggestions
    DOMAIN_FLAG_STR=""
    if [ -n "$DOMAIN" ]; then DOMAIN_FLAG_STR="--domain $DOMAIN "; fi

    _check_state_field() {
      python3 -c "
import sys, os, json
sys.path.insert(0, '.')
domain = os.environ.get('PIPELINE_DOMAIN') or None
# Determine state file path
if domain == 'agents_os':
    sf = '_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
elif domain == 'tiktrack':
    sf = '_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'
else:
    sf = '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    data = json.loads(open(sf).read())
    val = data.get(sys.argv[1], '')
    print(str(val).strip())
except Exception:
    print('')
" "$1" 2>/dev/null || echo ""
    }

    case "$GATE" in
      GATE_1)
        LLD400=$(_check_state_field "lld400_content")
        if [ -z "$LLD400" ]; then
          VALIDATION_FAILED=1
          MISSING_ARTIFACTS="GATE_1: lld400_content is empty — Team 170 must write the LLD400 and it must be stored first"
          STORE_HINT="  Step 1 — Store the LLD400 file:
    ./pipeline_run.sh ${DOMAIN_FLAG_STR}store GATE_1 _COMMUNICATION/team_170/<LLD400_FILE>.md
  Step 2 — If Team 190 returned BLOCK, record it:
    ./pipeline_run.sh ${DOMAIN_FLAG_STR}fail \"BF-xx: reason\"
  Step 3 — After Team 190 PASS verdict, retry:"
        fi
        ;;
      G3_PLAN)
        WORK_PLAN=$(_check_state_field "work_plan")
        if [ -z "$WORK_PLAN" ]; then
          VALIDATION_FAILED=1
          MISSING_ARTIFACTS="G3_PLAN: work_plan is empty — Team 10 must submit a work plan first"
          STORE_HINT="  Store the work plan file:
    ./pipeline_run.sh ${DOMAIN_FLAG_STR}store G3_PLAN <path/to/work_plan.md>
  Then retry:"
        fi
        ;;
    esac

    if [ "$VALIDATION_FAILED" -eq 1 ] && [ "$FORCE_FLAG" != "--force" ]; then
      python3 -c "
import sys, os
sys.path.insert(0, '.')
os.environ.setdefault('PIPELINE_DOMAIN', '${DOMAIN:-}')
try:
    from agents_os_v2.orchestrator.log_events import append_event
    from agents_os_v2.observers.state_reader import read_wsm_identity_fields
    from datetime import datetime, timezone
    identity = read_wsm_identity_fields()
    append_event({
        'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'pipe_run_id': 'pipeline_run',
        'event_type': 'GATE_ADVANCE_BLOCKED',
        'domain': '${DOMAIN:-global}',
        'stage_id': identity.get('active_stage_id', ''),
        'work_package_id': identity.get('active_work_package_id', ''),
        'gate': '$GATE',
        'agent_team': 'team_61',
        'severity': 'WARN',
        'description': 'Advance blocked — required artifacts missing',
        'metadata': {'attempted_gate': '$GATE', 'reason': 'artifact_missing', 'blocking_team': 'team_61'},
    })
except Exception:
    pass
" 2>/dev/null || true
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ⚠️  ADVANCE BLOCKED — Required artifacts are missing:"
      echo "  $MISSING_ARTIFACTS"
      echo ""
      if [ -n "$STORE_HINT" ]; then
        echo "$STORE_HINT"
        echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR}pass"
      else
        echo "  Complete the gate deliverables first, then retry:"
        echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR}pass"
      fi
      echo ""
      echo "  Rollback/emergency bypass only:"
      echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR}pass --force"
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      exit 1
    fi

    if [ "$VALIDATION_FAILED" -eq 1 ] && [ "$FORCE_FLAG" = "--force" ]; then
      echo ""
      echo "  ⚠️  WARNING: --force bypass — advancing without required artifacts"
      echo "  Missing: $MISSING_ARTIFACTS"
      echo ""
    fi
    # ──────────────────────────────────────────────────────────────────────

    echo "[pipeline_run] ${DOMAIN_LABEL}Advancing $GATE → PASS"
    $CLI --advance "$GATE" PASS
    echo ""
    NEXT_GATE=$(_get_gate)
    ACTIVE_DOMAIN=$(_get_domain)
    if [[ "$NEXT_GATE" == WAITING_* ]]; then
      echo "[pipeline_run] Human approval gate reached: $NEXT_GATE"
      echo "[pipeline_run] Review and run: ./pipeline_run.sh approve"
    else
      _generate_and_show "$NEXT_GATE"
    fi
    echo ""
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  💡 Dashboard: switch domain selector to '${ACTIVE_DOMAIN}'"
    echo "     to see updated state (${NEXT_GATE})"
    echo "  ────────────────────────────────────────────────────────────────"
    ;;

  fail)
    _validate_stage_alignment || exit 1
    GATE=$(_get_gate)
    REASON="${2:-no reason given}"
    echo "[pipeline_run] ${DOMAIN_LABEL}Advancing $GATE → FAIL: $REASON"
    $CLI --advance "$GATE" FAIL --reason "$REASON"

    # GATE_1 FAIL: clear lld400_content so the dashboard reverts to Phase 1
    # (correction cycle) instead of showing stale Phase 2 state.
    # BUG-FIX 2026-03-15: lld400_content was not cleared on GATE_1 fail.
    if [[ "$GATE" == "GATE_1" ]]; then
      python3 -c "
import json, os, datetime
domain = os.environ.get('PIPELINE_DOMAIN') or None
if domain == 'agents_os':
    sf = '_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
elif domain == 'tiktrack':
    sf = '_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'
else:
    sf = '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    state = json.loads(open(sf).read())
    state['lld400_content'] = ''
    state['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    open(sf, 'w').write(json.dumps(state, indent=2, ensure_ascii=False))
    print('  🔄 GATE_1 FAIL: lld400_content cleared → dashboard shows Phase 1 correction cycle')
except Exception as e:
    print(f'  ⚠️  Could not clear lld400_content: {e}')
" 2>/dev/null || echo "  ⚠️  lld400_content clear failed — dashboard may show stale Phase 2 state"
    fi

    echo ""
    # Check if auto-routing moved the gate forward (route_recommendation in verdict file)
    NEXT_GATE=$(_get_gate)
    if [[ "$NEXT_GATE" != "$GATE" ]]; then
      echo "════════════════════════════════════════════════════════════"
      echo "  ✅ AUTO-ROUTED (route_recommendation found in verdict file)"
      echo "  $GATE → $NEXT_GATE"
      echo "════════════════════════════════════════════════════════════"
      if [[ "$NEXT_GATE" == "G3_PLAN" ]]; then
        echo "[pipeline_run] → Now at G3_PLAN. Generate revision prompt:"
        echo "    ./pipeline_run.sh revise \"$REASON\""
      else
        _generate_and_show "$NEXT_GATE"
      fi
    else
      # Gate stayed at same position — check if it's a self-loop gate (e.g. GATE_8)
      # Self-loop gates always route back to themselves; default_fail_route handles it.
      IS_SELF_LOOP=$(python3 -c "
import sys, os; sys.path.insert(0, '.')
from agents_os_v2.orchestrator.pipeline import GATE_CONFIG
print('yes' if GATE_CONFIG.get('${GATE}', {}).get('default_fail_route') else 'no')
" 2>/dev/null || echo "no")

      if [[ "$IS_SELF_LOOP" == "yes" ]]; then
        echo "════════════════════════════════════════════════════════════"
        echo "  🔄 CORRECTION CYCLE — $GATE returns to itself"
        echo "  Generating correction prompt (includes blockers from verdict file)..."
        echo "════════════════════════════════════════════════════════════"
        _generate_and_show "$NEXT_GATE"
      else
        $CLI --status
        echo ""
        echo "════════════════════════════════════════════════════════════"
        echo "  ⚠️  MANUAL ROUTING REQUIRED"
        echo "  Verdict file missing route_recommendation: doc|full."
        echo "  Ask the reviewing team to add this field before proceeding."
        echo ""
        echo "  Manual override (only if verdict file unavailable):"
        echo "  Option A — Doc/governance issues ONLY (quick fix):"
        echo "    ./pipeline_run.sh route doc \"$REASON\""
        echo "    → Team 10 fixes docs → re-commit → GATE_4 → GATE_5"
        echo ""
        echo "  Option B — Substantial/code issues (full cycle):"
        echo "    ./pipeline_run.sh route full \"$REASON\""
        echo "    → G3_PLAN → mandates → implementation → QA → GATE_5"
        echo "════════════════════════════════════════════════════════════"
      fi
    fi
    ;;

  approve)
    _validate_stage_alignment || exit 1
    GATE=$(_get_gate)
    # Map WAITING_ gates to their base gate for --approve
    # WAITING_GATE6_APPROVAL → GATE6 → GATE_6 (re-add underscore before digit)
    BASE_GATE=$(echo "$GATE" | sed 's/WAITING_//; s/_APPROVAL//; s/GATE\([0-9]\)/GATE_\1/')
    echo "[pipeline_run] ${DOMAIN_LABEL}Approving: $BASE_GATE"
    $CLI --approve "$BASE_GATE"
    echo ""
    NEXT_GATE=$(_get_gate)
    ACTIVE_DOMAIN=$(_get_domain)
    _generate_and_show "$NEXT_GATE"
    echo ""
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  💡 Dashboard: switch domain selector to '${ACTIVE_DOMAIN}'"
    echo "     to see updated state (${NEXT_GATE})"
    echo "  ────────────────────────────────────────────────────────────────"
    ;;

  status)
    _refresh_state_snapshot
    $CLI --status
    ;;

  gate)
    # Override: generate for specific gate name
    TARGET="${2:?Usage: ./pipeline_run.sh gate GATE_NAME}"
    _generate_and_show "$TARGET"
    ;;

  route)
    # Route pipeline after a FAIL decision.
    # Usage:
    #   ./pipeline_run.sh route doc   [notes]   → doc/governance fix → G5_DOC_FIX
    #   ./pipeline_run.sh route full  [notes]   → full cycle → G3_PLAN
    #   ./pipeline_run.sh route doc   [notes] GATE_NAME  → override gate (default: current)
    TYPE="${2:?Usage: ./pipeline_run.sh route doc|full [notes]}"
    NOTES="${3:-}"
    # Allow optional gate override as 4th arg (for dashboard buttons that specify gate explicitly)
    GATE_OVERRIDE="${4:-}"
    if [ -n "$GATE_OVERRIDE" ]; then
      GATE="$GATE_OVERRIDE"
    else
      GATE=$(_get_gate)
    fi
    echo "[pipeline_run] ${DOMAIN_LABEL}Routing $GATE FAIL → $TYPE"
    if [ -n "$NOTES" ]; then
      echo "[pipeline_run] Notes: $NOTES"
    fi
    $CLI --route "$TYPE" "$GATE" --reason "$NOTES"
    echo ""
    NEXT_GATE=$(_get_gate)
    if [[ "$NEXT_GATE" == "G3_PLAN" ]]; then
      echo "[pipeline_run] → Now at G3_PLAN. To generate revision prompt:"
      if [ -n "$NOTES" ]; then
        echo "    ./pipeline_run.sh revise \"$NOTES\""
      else
        echo "    ./pipeline_run.sh revise \"BLOCKER-1: ...\""
      fi
    else
      _generate_and_show "$NEXT_GATE"
    fi
    ;;

  revise)
    # Revision mode after G3_5 FAIL.
    # Usage: ./pipeline_run.sh revise "BLOCKER-1: ... BLOCKER-2: ..."
    # If currently at G3_5, records FAIL + routes full (BF = structural) → advances to G3_PLAN.
    NOTES="${2:?Usage: ./pipeline_run.sh revise \"blocker notes\" [optional: work_plan_file_path]}"
    # Step 0: if currently at G3_5, advance it to FAIL + route full → G3_PLAN
    CURRENT_GATE=$(_get_gate)
    if [[ "$CURRENT_GATE" == "G3_5" ]]; then
      echo "[pipeline_run] ${DOMAIN_LABEL}Recording G3_5 FAIL (revision triggered)..."
      FAIL_REASON="${NOTES:0:200}"
      $CLI --advance G3_5 FAIL --reason "$FAIL_REASON" 2>&1 | grep -v "^━"
      # BF (Blocking Findings) = structural issues → always route full for G3_5
      echo "[pipeline_run] ${DOMAIN_LABEL}Routing G3_5 → G3_PLAN (full — structural work plan blockers)..."
      $CLI --route full G3_5 --reason "$FAIL_REASON" 2>&1 | grep -v "^━"
      echo "[pipeline_run] G3_5 routed → gate now: $(_get_gate)"
    fi
    # Step 1: store current work plan artifact (if file path given as $3)
    if [ -n "$3" ]; then
      echo "[pipeline_run] Storing work plan artifact: $3"
      $CLI --store-artifact G3_PLAN "$3"
    fi
    echo "[pipeline_run] ${DOMAIN_LABEL}Generating G3_PLAN REVISION prompt..."
    $CLI --generate-prompt G3_PLAN --revision-notes "$NOTES" 2>&1 | grep -v "^━"
    _show_prompt "G3_PLAN"
    ;;

  store)
    # Store artifact: ./pipeline_run.sh store GATE_NAME path/to/file.md
    GATE="${2:?Usage: ./pipeline_run.sh store GATE FILE}"
    FILE="${3:?Usage: ./pipeline_run.sh store GATE FILE}"
    $CLI --store-artifact "$GATE" "$FILE"
    ;;

  pass_with_actions)
    # S002-P005-WP002: Record PASS_WITH_ACTION, hold gate
    ACTIONS="${2:?Usage: ./pipeline_run.sh pass_with_actions \"a1|a2|a3\"}"
    _refresh_state_snapshot
    _validate_stage_alignment || exit 1
    $CLI --pass-with-actions "$ACTIONS"
    ;;

  actions_clear)
    # S002-P005-WP002: All actions resolved — advance gate
    _refresh_state_snapshot
    _validate_stage_alignment || exit 1
    $CLI --actions-clear
    echo ""
    NEXT_GATE=$(_get_gate)
    ACTIVE_DOMAIN=$(_get_domain)
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  💡 Dashboard: switch domain selector to '${ACTIVE_DOMAIN}'"
    echo "     to see updated state (${NEXT_GATE})"
    echo "  ────────────────────────────────────────────────────────────────"
    ;;

  override)
    # S002-P005-WP002: Override & advance — log reason
    REASON="${2:?Usage: ./pipeline_run.sh override \"reason text\"}"
    _refresh_state_snapshot
    _validate_stage_alignment || exit 1
    $CLI --override "$REASON"
    echo ""
    NEXT_GATE=$(_get_gate)
    ACTIVE_DOMAIN=$(_get_domain)
    _generate_and_show "$NEXT_GATE"
    echo ""
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  💡 Dashboard: switch domain selector to '${ACTIVE_DOMAIN}'"
    echo "     to see updated state (${NEXT_GATE})"
    echo "  ────────────────────────────────────────────────────────────────"
    ;;

  insist)
    # S002-P005-WP002: Stay at gate — generate correction prompt
    _refresh_state_snapshot
    GATE=$(_get_gate)
    $CLI --insist
    ;;

  domain)
    # Show current domain info for both pipelines
    echo ""
    echo "═══════════════════════════════════════"
    echo "  Parallel Pipeline — Domain Status"
    echo "═══════════════════════════════════════"
    echo ""
    echo "  TIKTRACK pipeline:"
    PIPELINE_DOMAIN=tiktrack python3 -c "
import sys, os
sys.path.insert(0, '.')
os.environ['PIPELINE_DOMAIN'] = 'tiktrack'
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load('tiktrack')
print(f'    WP:      {s.work_package_id}')
print(f'    Gate:    {s.current_gate}')
print(f'    Updated: {s.last_updated or \"never\"}')
"
    echo ""
    echo "  AGENTS_OS pipeline:"
    PIPELINE_DOMAIN=agents_os python3 -c "
import sys, os
sys.path.insert(0, '.')
os.environ['PIPELINE_DOMAIN'] = 'agents_os'
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState.load('agents_os')
print(f'    WP:      {s.work_package_id}')
print(f'    Gate:    {s.current_gate}')
print(f'    Updated: {s.last_updated or \"never\"}')
"
    echo ""
    echo "  Commands:"
    echo "    ./pipeline_run.sh --domain tiktrack  pass"
    echo "    ./pipeline_run.sh --domain agents_os status"
    echo "═══════════════════════════════════════"
    ;;

  phase*)
    # Phase-advance: regenerate mandates for current gate, then display only Phase N.
    # Used after Phase N-1 team finishes — run before handing off to the next team.
    # Usage:
    #   ./pipeline_run.sh phase2   → show Phase 2 mandate (after Phase 1 complete)
    #   ./pipeline_run.sh phase3   → show Phase 3 mandate
    PHASE_NUM="${1#phase}"
    if ! [[ "$PHASE_NUM" =~ ^[0-9]+$ ]]; then
      echo "Usage: ./pipeline_run.sh phase<N>  (e.g. phase2, phase3)"
      exit 1
    fi

    GATE=$(_get_gate)
    _auto_store_gate1_artifact   # AC-10: auto-store latest LLD400 before phase transition
    _auto_store_g3plan_artifact  # AC-11: auto-store G3_PLAN work plan before phase transition
    echo "[pipeline_run] ${DOMAIN_LABEL}Phase ${PHASE_NUM} — regenerating mandates for: $GATE"
    $CLI --generate-prompt "$GATE" 2>&1 | grep -v "^━"

    # Determine mandate file from gate name.
    # Files are saved with domain prefix (e.g. agentsos_GATE_1_mandates.md).
    # domain_slug: same transform as _save_prompt in pipeline.py (lower, strip _ and -)
    _dm_slug=$(_get_domain 2>/dev/null | tr '[:upper:]' '[:lower:]' | tr -d '_-')
    case "$GATE" in
      GATE_1)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_GATE_1_mandates.md"
        ;;
      G3_PLAN)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_G3_PLAN_mandates.md"
        ;;
      GATE_8)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_gate_8_mandates.md"
        ;;
      *)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_implementation_mandates.md"
        ;;
    esac

    if [ ! -f "$MANDATE_FILE" ]; then
      echo "[pipeline_run] Mandate file not found: $MANDATE_FILE"
      echo "[pipeline_run] Run: ./pipeline_run.sh  (to generate first)"
      exit 1
    fi

    # Extract Phase N section using Python regex
    PHASE_CONTENT=$(python3 - "$PHASE_NUM" "$MANDATE_FILE" <<'PYEOF'
import sys, re
phase = sys.argv[1]
mandate_file = sys.argv[2]
text = open(mandate_file).read()
# Match from "## ... (Phase N)" header until the next phase header or end-of-file
pattern = r'## .+\(Phase ' + re.escape(phase) + r'\).*?(?=\n## .+\(Phase \d+\)|\Z)'
m = re.search(pattern, text, re.DOTALL)
print(m.group(0).strip() if m else '')
PYEOF
)

    if [ -z "$PHASE_CONTENT" ]; then
      echo "[pipeline_run] Phase ${PHASE_NUM} not found in: $MANDATE_FILE"
      echo "[pipeline_run] Available phases:"
      python3 - "$MANDATE_FILE" <<'PYEOF'
import sys, re
text = open(sys.argv[1]).read()
phases = sorted(set(int(m) for m in re.findall(r'\(Phase (\d+)\)', text)))
print("  " + "  |  ".join(f"phase{p}  →  ./pipeline_run.sh phase{p}" for p in phases))
PYEOF
      exit 1
    fi

    # Get total phase count for footer message
    TOTAL_PHASES=$(python3 - "$MANDATE_FILE" <<'PYEOF'
import sys, re
text = open(sys.argv[1]).read()
phases = sorted(set(int(m) for m in re.findall(r'\(Phase (\d+)\)', text)))
print(phases[-1] if phases else 1)
PYEOF
)
    NEXT_PHASE=$((PHASE_NUM + 1))

    echo ""
    printf '▼%.0s' {1..74}; echo ""
    printf "  ${DOMAIN_LABEL}PHASE ${PHASE_NUM} MANDATE — paste to team\n"
    printf '▼%.0s' {1..74}; echo ""
    echo ""
    echo "$PHASE_CONTENT"
    echo ""
    printf '▲%.0s' {1..74}; echo ""
    if [[ "$PHASE_NUM" -lt "$TOTAL_PHASES" ]]; then
      printf "  Phase ${PHASE_NUM} done?  →  ./pipeline_run.sh phase${NEXT_PHASE}\n"
    else
      printf "  Final phase done?  →  ./pipeline_run.sh pass\n"
    fi
    printf '▲%.0s' {1..74}; echo ""
    echo ""

    # ── State update: G3_PLAN phase2 — confirm work plan stored ──────────
    if [[ "$GATE" == "G3_PLAN" && "$PHASE_NUM" == "2" ]]; then
      python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
state = PipelineState.load(domain)
if state.work_plan and state.work_plan.strip():
    print('[pipeline_run] ✅ work_plan confirmed stored (' + str(len(state.work_plan)) + ' chars). Run: ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}pass to advance to G3_5.')
else:
    print('[pipeline_run] ⚠️  work_plan is EMPTY. Ensure Team 10 saved TEAM_10_*_G3_PLAN_WORK_PLAN_v*.md')
"
    fi

    # ── State update: mark phase transition in pipeline_state ─────────────
    # When phase2 is run on GATE_8, Phase 1 (Team 70/170) is confirmed done.
    # Write phase8_content to state so the dashboard detects the transition.
    if [[ "$GATE" == "GATE_8" && "$PHASE_NUM" == "2" ]]; then
      python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
state = PipelineState.load(domain)
state.phase8_content = 'PHASE2_ACTIVE'
state.save()
print('[pipeline_run] ✅ State updated — phase8_content=PHASE2_ACTIVE. Dashboard will reflect Phase 2.')
"
    fi

    # ── Event log: PHASE_TRANSITION ──────────────────────────────────────
    python3 -c "
import sys, os
sys.path.insert(0, '.')
os.environ.setdefault('PIPELINE_DOMAIN', '${DOMAIN:-}')
try:
    from agents_os_v2.orchestrator.log_events import append_event
    from agents_os_v2.observers.state_reader import read_wsm_identity_fields
    from datetime import datetime, timezone
    identity = read_wsm_identity_fields()
    append_event({
        'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'pipe_run_id': 'pipeline_run',
        'event_type': 'PHASE_TRANSITION',
        'domain': '${DOMAIN:-global}',
        'stage_id': identity.get('active_stage_id', ''),
        'work_package_id': identity.get('active_work_package_id', ''),
        'gate': '$GATE',
        'agent_team': 'team_61',
        'severity': 'INFO',
        'description': f'Phase ${PHASE_NUM} mandate displayed',
        'metadata': {'phase': ${PHASE_NUM}, 'gate': '$GATE'},
    })
except Exception:
    pass
" 2>/dev/null || true
    ;;

  *)
    echo "Usage: ./pipeline_run.sh [--domain tiktrack|agents_os] [next|pass|fail <reason>|approve|status|gate <NAME>|route doc|full [notes]|revise <notes> [file]|store <GATE> <FILE>|pass_with_actions <a1|a2>|actions_clear|override <reason>|insist|domain|phase<N>]"
    echo ""
    echo "  next / (no arg)          Generate current gate prompt + display"
    echo "  pass                     Advance current gate → PASS → show next"
    echo "  fail <reason>            Record FAIL with reason → show routing options"
    echo "  route doc|full [notes]   Route after FAIL: doc=quick fix, full=full cycle"
    echo "  approve                  Approve human gate (GATE_2, GATE_6, GATE_7)"
    echo "  status                   Show pipeline state only"
    echo "  gate <NAME>              Generate prompt for specific gate"
    echo "  revise <notes> [file]    Generate G3_PLAN revision prompt after G3_5 FAIL"
    echo "  store <GATE> <FILE>      Store artifact file to pipeline state"
    echo "  pass_with_actions <a|b>  Record PASS_WITH_ACTION, hold gate (pipe-separated actions)"
    echo "  actions_clear            All actions resolved — advance gate"
    echo "  override <reason>        Override & advance — log reason"
    echo "  insist                   Stay at gate — generate correction prompt"
    echo "  domain                   Show status of both parallel pipelines"
    echo "  phase<N>                 Show Phase N mandate (after Phase N-1 complete)"
    echo "                           e.g. phase2 → Team 90 validation mandate"
    echo ""
    echo "  Domain flags (parallel pipelines):"
    echo "    --domain tiktrack       Use TikTrack pipeline state (default)"
    echo "    --domain agents_os      Use AgentsOS pipeline state"
    echo "    PIPELINE_DOMAIN=tiktrack ./pipeline_run.sh  (env-var alternative)"
    exit 1
    ;;
esac
