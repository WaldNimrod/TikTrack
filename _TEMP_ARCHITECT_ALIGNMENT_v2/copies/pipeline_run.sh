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
# Visual standard: prompt block is marked with ▼▼▼ (start) and ▲▲▲ (end)
# for instant eye-identification in terminal output.

set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="python3 -m agents_os_v2.orchestrator.pipeline"
PROMPTS_DIR="$REPO/_COMMUNICATION/agents_os/prompts"

cd "$REPO"

# ── helpers ────────────────────────────────────────────────────────────────

_get_gate() {
  python3 -c "
import sys
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
print(PipelineState.load().current_gate)
"
}

_get_engine() {
  python3 -c "
import sys
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.pipeline import GATE_CONFIG
gate = '$1'
cfg = GATE_CONFIG.get(gate, {})
print(cfg.get('engine', '?') + '  |  owner: ' + cfg.get('owner', '?'))
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
  printf "  PASTE INTO AI:  %-20s  →  %s\n" "$gate" "$engine"
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
  echo "[pipeline_run] Generating prompt for: $gate"
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
    echo "[pipeline_run] Advancing $GATE → PASS"
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
    echo "[pipeline_run] Advancing $GATE → FAIL: $REASON"
    $CLI --advance "$GATE" FAIL --reason "$REASON"
    $CLI --status
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "  GATE FAILED — choose routing path:"
    echo ""
    echo "  Option A — Doc/governance issues ONLY (quick fix):"
    echo "    ./pipeline_run.sh route doc \"$REASON\""
    echo "    → Team 10 fixes docs → GATE_4 → GATE_5 (no re-plan)"
    echo ""
    echo "  Option B — Substantial/code issues (full cycle):"
    echo "    ./pipeline_run.sh route full \"$REASON\""
    echo "    → G3_PLAN → mandates → implementation → QA → GATE_5"
    echo "════════════════════════════════════════════════════════════"
    ;;

  approve)
    GATE=$(_get_gate)
    # Map WAITING_ gates to their base gate for --approve
    BASE_GATE=$(echo "$GATE" | sed 's/WAITING_//; s/_APPROVAL//')
    echo "[pipeline_run] Approving: $BASE_GATE"
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
    #   ./pipeline_run.sh route doc   [notes]   → doc/governance fix → CURSOR_IMPLEMENTATION
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
    echo "[pipeline_run] Routing $GATE FAIL → $TYPE"
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
    echo "[pipeline_run] Generating G3_PLAN REVISION prompt..."
    $CLI --generate-prompt G3_PLAN --revision-notes "$NOTES" 2>&1 | grep -v "^━"
    _show_prompt "G3_PLAN"
    ;;

  store)
    # Store artifact: ./pipeline_run.sh store GATE_NAME path/to/file.md
    GATE="${2:?Usage: ./pipeline_run.sh store GATE FILE}"
    FILE="${3:?Usage: ./pipeline_run.sh store GATE FILE}"
    $CLI --store-artifact "$GATE" "$FILE"
    ;;

  *)
    echo "Usage: ./pipeline_run.sh [next|pass|fail <reason>|approve|status|gate <NAME>|route doc|full [notes]|revise <notes> [file]|store <GATE> <FILE>]"
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
    exit 1
    ;;
esac
