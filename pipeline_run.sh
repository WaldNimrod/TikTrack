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
  local prompt_file="$PROMPTS_DIR/${gate}_prompt.md"

  if [ ! -f "$prompt_file" ]; then
    echo "[pipeline_run] Prompt file not found: $prompt_file"
    echo "[pipeline_run] Run: ./pipeline_run.sh  (to generate it first)"
    exit 1
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

# ── main ───────────────────────────────────────────────────────────────────

case "${1:-next}" in

  next|"")
    GATE=$(_get_gate)
    $CLI --status
    _generate_and_show "$GATE"
    ;;

  pass)
    GATE=$(_get_gate)

    # ── Artifact validation before advancing ─────────────────────────────
    # Server-side check: required deliverables must exist before advancing.
    # Bypass with: ./pipeline_run.sh pass --force  (logs a warning, still advances)
    FORCE_FLAG="${2:-}"
    VALIDATION_FAILED=0
    MISSING_ARTIFACTS=""

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
          MISSING_ARTIFACTS="GATE_1: lld400_content is empty — Team 170+190 must write and store the LLD400 spec first"
        fi
        ;;
      G3_PLAN)
        WORK_PLAN=$(_check_state_field "work_plan")
        if [ -z "$WORK_PLAN" ]; then
          VALIDATION_FAILED=1
          MISSING_ARTIFACTS="G3_PLAN: work_plan is empty — Team 10 must submit a work plan first (./pipeline_run.sh store G3_PLAN <file>)"
        fi
        ;;
    esac

    if [ "$VALIDATION_FAILED" -eq 1 ] && [ "$FORCE_FLAG" != "--force" ]; then
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ⚠️  ADVANCE BLOCKED — Required artifacts are missing:"
      echo "  $MISSING_ARTIFACTS"
      echo ""
      echo "  Complete the gate deliverables first, then retry:"
      echo "    ./pipeline_run.sh pass"
      echo ""
      echo "  Rollback/emergency bypass only:"
      echo "    ./pipeline_run.sh pass --force"
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
    if [[ "$NEXT_GATE" == WAITING_* ]]; then
      echo "[pipeline_run] Human approval gate reached: $NEXT_GATE"
      echo "[pipeline_run] Review and run: ./pipeline_run.sh approve"
    else
      _generate_and_show "$NEXT_GATE"
    fi
    ;;

  fail)
    GATE=$(_get_gate)
    REASON="${2:-no reason given}"
    echo "[pipeline_run] ${DOMAIN_LABEL}Advancing $GATE → FAIL: $REASON"
    $CLI --advance "$GATE" FAIL --reason "$REASON"
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
    GATE=$(_get_gate)
    # Map WAITING_ gates to their base gate for --approve
    # WAITING_GATE6_APPROVAL → GATE6 → GATE_6 (re-add underscore before digit)
    BASE_GATE=$(echo "$GATE" | sed 's/WAITING_//; s/_APPROVAL//; s/GATE\([0-9]\)/GATE_\1/')
    echo "[pipeline_run] ${DOMAIN_LABEL}Approving: $BASE_GATE"
    $CLI --approve "$BASE_GATE"
    echo ""
    NEXT_GATE=$(_get_gate)
    _generate_and_show "$NEXT_GATE"
    ;;

  status)
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
    # Step 1: store current work plan artifact (if file path given as $3)
    NOTES="${2:?Usage: ./pipeline_run.sh revise \"blocker notes\" [optional: work_plan_file_path]}"
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
    echo "[pipeline_run] ${DOMAIN_LABEL}Phase ${PHASE_NUM} — regenerating mandates for: $GATE"
    $CLI --generate-prompt "$GATE" 2>&1 | grep -v "^━"

    # Determine mandate file from gate name
    # GATE_1 uses GATE_1_mandates.md (same mechanism as GATE_8) — two-phase gate.
    case "$GATE" in
      GATE_1)
        MANDATE_FILE="$PROMPTS_DIR/GATE_1_mandates.md"
        ;;
      GATE_8)
        MANDATE_FILE="$PROMPTS_DIR/gate_8_mandates.md"
        ;;
      *)
        MANDATE_FILE="$PROMPTS_DIR/implementation_mandates.md"
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
    ;;

  *)
    echo "Usage: ./pipeline_run.sh [--domain tiktrack|agents_os] [next|pass|fail <reason>|approve|status|gate <NAME>|route doc|full [notes]|revise <notes> [file]|store <GATE> <FILE>|domain|phase<N>]"
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
