#!/usr/bin/env bash
# pipeline_run.sh — agents_os_v2 workflow helper
#
# Usage:
#   ./pipeline_run.sh              → generate current gate prompt + display for copy-paste
#   ./pipeline_run.sh pass         → advance current gate PASS (no guard)
#   ./pipeline_run.sh --wp S003-P013-WP001 --gate GATE_3 --phase 3.3 pass  → precision pass (locked)
#   ./pipeline_run.sh fail "why"   → advance current gate FAIL with reason
#   ./pipeline_run.sh approve      → approve human-gate (GATE_2, GATE_4 UX sign-off; alias gate7)
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

# ── Explicit gate/phase/wp guard (KB-84: precision pass safety) ──────────────
# Optional: --wp WP_ID --gate GATE_N --phase N.N  before the subcommand
# When provided, ALL supplied flags are validated against the active state.
# Full format:
#   ./pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_3 --phase 3.3 pass
# Any mismatch → BLOCKED + shows active state + correct command.
EXPLICIT_GATE=""
EXPLICIT_PHASE=""
EXPLICIT_WP=""
while true; do
  if [[ "${1:-}" == "--gate" ]]; then
    EXPLICIT_GATE="$2"; shift 2
  elif [[ "${1:-}" == "--phase" ]]; then
    EXPLICIT_PHASE="$2"; shift 2
  elif [[ "${1:-}" == "--wp" ]]; then
    EXPLICIT_WP="$2"; shift 2
  else
    break
  fi
done

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

_get_wp_id() {
  python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
print(PipelineState.load(domain).work_package_id)
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

# ── Pipeline state auto-commit (PIPELINE_AUTOCOMMIT=0 to disable) ────────────
# S003-P016 Branch-per-WP: each active WP gets an isolated git branch wp/{WP_ID}.
# Pipeline commits exclusively to that branch. main is untouched during execution.
# At COMPLETE: WP branch is merged back to main automatically.
# Team 191 commits to main are structurally isolated — cannot affect pipeline.
_autocommit_pipeline_state() {
  [[ "${PIPELINE_AUTOCOMMIT:-1}" == "0" ]] && return 0
  local msg="${1:-pipeline: auto-commit runtime state}"
  local domain="${DOMAIN:-}"
  local gate="${2:-}"
  local wp="${3:-}"

  # Canonical pipeline-owned files (S003-P016: volatile files gitignored, legacy deleted)
  local -a STATE_FILES=(
    "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"
    "_COMMUNICATION/agents_os/pipeline_state_tiktrack.json"
    "_COMMUNICATION/agents_os/pipeline_state_agentsos.json"
  )

  # Only stage files that actually changed or are new
  local -a CHANGED=()
  for f in "${STATE_FILES[@]}"; do
    if [[ -f "$f" ]] && ! git diff --quiet "$f" 2>/dev/null; then
      CHANGED+=("$f")
    elif git ls-files --others --exclude-standard "$f" 2>/dev/null | grep -q .; then
      CHANGED+=("$f")
    fi
  done

  if [[ ${#CHANGED[@]} -eq 0 ]]; then
    return 0  # nothing changed — no commit needed
  fi

  # ── Branch-per-WP lifecycle (S003-P016) ─────────────────────────────────────
  # Detect COMPLETE: read current_gate from the domain state file (already advanced)
  local current_gate_in_state=""
  if [[ -n "$domain" ]]; then
    local _sf="_COMMUNICATION/agents_os/pipeline_state_${domain}.json"
    [[ "$domain" == "agents_os" ]] && _sf="_COMMUNICATION/agents_os/pipeline_state_agentsos.json"
    if [[ -f "$_sf" ]]; then
      current_gate_in_state=$(python3 -c "
import json, sys
try:
    print(json.load(open('$_sf')).get('current_gate',''))
except Exception:
    print('')
" 2>/dev/null || echo "")
    fi
  fi

  local wp_branch=""
  local is_complete=0
  [[ "$current_gate_in_state" == "COMPLETE" ]] && is_complete=1
  [[ -n "$wp" && "$wp" != "NONE" && "$wp" != "N/A" && "$wp" != "" ]] && \
    wp_branch="wp/${wp}"

  local current_branch
  current_branch=$(git branch --show-current 2>/dev/null || echo "main")

  if [[ -n "$wp_branch" && "$is_complete" -eq 0 ]]; then
    # Active WP — operate on wp/{WP_ID} branch
    if ! git show-ref --verify --quiet "refs/heads/${wp_branch}" 2>/dev/null; then
      # First activation: create WP branch from main HEAD
      echo "[pipeline] Creating WP branch: ${wp_branch}"
      if [[ "$current_branch" != "main" ]]; then
        git checkout main 2>/dev/null || true
      fi
      git checkout -b "$wp_branch" 2>/dev/null || {
        echo "[pipeline] WARNING: could not create branch ${wp_branch} — committing to current branch" >&2
      }
    elif [[ "$current_branch" != "$wp_branch" ]]; then
      git checkout "$wp_branch" 2>/dev/null || true
    fi
  fi

  # Commit to current branch (WP branch or main for wsm-reset/COMPLETE transitions)
  git add "${CHANGED[@]}" 2>/dev/null || return 0
  git commit -m "$msg

[pipeline-auto] domain=${domain} gate=${gate} wp=${wp}
Co-Authored-By: pipeline_run.sh <noreply@tiktrack.local>" \
    --no-verify 2>/dev/null || true

  # ── Merge WP branch → main at COMPLETE ──────────────────────────────────────
  if [[ "$is_complete" -eq 1 && -n "$wp_branch" ]]; then
    local on_branch
    on_branch=$(git branch --show-current 2>/dev/null || echo "")
    if [[ "$on_branch" == "$wp_branch" ]]; then
      echo "[pipeline] COMPLETE — merging ${wp_branch} → main"
      git checkout main 2>/dev/null || {
        echo "[pipeline] WARNING: could not checkout main for merge — merge manually: git merge --no-ff ${wp_branch}" >&2
        return 0
      }
      git merge --no-ff "$wp_branch" \
        -m "pipeline: merge ${wp_branch} → main (GATE_5 PASS / COMPLETE)" \
        --no-verify 2>/dev/null || \
        echo "[pipeline] WARNING: merge conflict — resolve manually: git merge --no-ff ${wp_branch}" >&2
    fi
  fi
  # --no-verify: skip pre-commit hooks (date-lint doesn't apply to runtime state commits)
}

# ── Action log (PIPELINE_ACTION_LOG=0 to silence) ────────────────────────────
_log_action() {
  # Usage: _log_action ACTION_TYPE [gate] [phase] [details_string]
  # Non-blocking — failures are fully suppressed.
  [[ "${PIPELINE_ACTION_LOG:-1}" == "0" ]] && return 0
  local _WP; _WP=$(_get_wp_id 2>/dev/null || echo "")
  LOG_ACTION="${1:-UNKNOWN}" LOG_DOMAIN="${DOMAIN:-}" LOG_WP="$_WP" \
  LOG_GATE="${2:-}" LOG_PHASE="${3:-}" LOG_DETAILS="${4:-}" \
  python3 -c "
import os, sys
sys.path.insert(0, '.')
try:
    from agents_os_v2.orchestrator.action_log import append_action
    append_action(
        action_type=os.environ.get('LOG_ACTION', ''),
        domain=os.environ.get('LOG_DOMAIN', ''),
        wp=os.environ.get('LOG_WP', ''),
        gate=os.environ.get('LOG_GATE', ''),
        phase=os.environ.get('LOG_PHASE', ''),
        actor='pipeline_run.sh',
        details={'info': os.environ.get('LOG_DETAILS', '')},
    )
except Exception:
    pass
" 2>/dev/null || true
}

# ── Pre-flight date correction (S003-P010-WP001 Ph4) ─────────────────────
_preflight_date_correction() {
    local f="$1"
    [[ -f "$f" ]] || return 0
    local today; today=$(date -u +%F)
    sed -i.bak "s/^\(date: \)[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$/\1${today}/" "$f"
    sed -i.bak "s/| date | [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} |/| date | ${today} |/g" "$f"
    rm -f "${f}.bak"
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

  # Auto-correct date in prompt before displaying (S003-P010-WP001 Ph4)
  _preflight_date_correction "$prompt_file"

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
  # OBS-51-001: after final PASS, state is COMPLETE — no prompt file exists; skip CLI + _show_prompt
  # (otherwise _show_prompt exits 1 on missing *_COMPLETE_prompt.md despite successful close).
  if [[ "$gate" == "COMPLETE" ]]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo "  ✅ LIFECYCLE COMPLETE — no further prompt for this work package."
    echo "  (Terminal state: current_gate=COMPLETE — OBS-51-001)"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    return 0
  fi
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

# S003-P012 SSOT — compare pipeline_state vs WSM (FIX-101-02: fail closed on drift)
_ssot_check_print() {
  local d="${PIPELINE_DOMAIN:-tiktrack}"
  if ! python3 -m agents_os_v2.tools.ssot_check --domain "$d"; then
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo "  SSOT CHECK FAILED — pipeline_state vs WSM drift (domain=$d)"
    echo "  Re-run after WSM sync or fix pipeline state."
    echo "════════════════════════════════════════════════════════════════════"
    return 1
  fi
  return 0
}

# FIX-101-02: sync STAGE_PARALLEL_TRACKS from current pipeline_state (phase* / recovery)
_auto_wsm_sync() {
  python3 -c "
import os, sys
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.wsm_writer import sync_parallel_tracks_from_pipeline
sync_parallel_tracks_from_pipeline()
" || return 1
  return 0
}

_auto_store_gate1_artifact() {
  # AC-10 (short-term implementation): at GATE_1, auto-detect the latest
  # TEAM_170_{WP_ID}_LLD400_v*.md file and store it into lld400_content if
  # the stored version is stale or empty. Eliminates the hidden manual `store` step.
  # Called before prompt generation AND before pass validation.
  local result
  result=$(python3 -c "
import sys, os, json, glob, time
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

wp_activated_at = state.get('last_updated', '')
try:
    from datetime import datetime, timezone
    activation_dt = datetime.fromisoformat(wp_activated_at.replace('Z', '+00:00'))
    activation_ts = activation_dt.timestamp()
except Exception:
    activation_ts = None

now = time.time()
cutoff_48h = now - (48 * 3600)

wp_fs = wp.replace('-', '_')
pattern1 = f'_COMMUNICATION/team_170/TEAM_170_{wp_fs}_LLD400_v*.md'
candidates = glob.glob(pattern1)

tier2_used = False
if not candidates:
    wp_fragment = wp_fs[-8:] if len(wp_fs) >= 8 else wp_fs
    pattern2 = f'_COMMUNICATION/**/TEAM_170_*{wp_fragment}*LLD400*.md'
    candidates = glob.glob(pattern2, recursive=True)
    if candidates:
        tier2_used = True

def is_recent(path):
    try:
        mtime = os.path.getmtime(path)
        if mtime < cutoff_48h: return False
        if activation_ts and mtime < activation_ts: return False
        return True
    except Exception:
        return False

recent = [f for f in candidates if is_recent(f)]
if not recent and candidates:
    recent = candidates
    print(f'⚠️  AC-10: no recent LLD400 found — using oldest available match (mtime unverified)', file=sys.stderr)

if not recent:
    print('NO_FILE')
    sys.exit(0)

recent.sort(key=lambda f: os.path.getmtime(f), reverse=True)
latest = recent[0]

if tier2_used:
    print(f'TIER2_MATCH:{latest}', file=sys.stderr)

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
    echo "  ⚠️  GATE_1: No LLD400 file found for this WP (checked team_170/ + full _COMMUNICATION/ tree)."
    echo "  Team 170 must produce the LLD400 before this gate can proceed."
    echo "  If file exists at a non-standard path, store manually:"
    echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}store GATE_1 <path/to/LLD400.md>"
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
import sys, os, json, glob, time
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
_gate  = state.get('current_gate', '')
_phase = state.get('current_phase') or ''
# G3_PLAN (legacy) OR GATE_2/2.2 (canonical post-migration) — same work-plan phase
_is_g3plan = _gate == 'G3_PLAN' or (_gate == 'GATE_2' and _phase in ('2.2', ''))
if not _is_g3plan:
    sys.exit(0)
wp = state.get('work_package_id', '')
if not wp:
    sys.exit(0)

wp_activated_at = state.get('last_updated', '')
try:
    from datetime import datetime, timezone
    activation_dt = datetime.fromisoformat(wp_activated_at.replace('Z', '+00:00'))
    activation_ts = activation_dt.timestamp()
except Exception:
    activation_ts = None

now = time.time()
cutoff_48h = now - (48 * 3600)

wp_fs = wp.replace('-', '_')
pattern1 = f'_COMMUNICATION/team_10/TEAM_10_{wp_fs}_G3_PLAN_WORK_PLAN_v*.md'
candidates = glob.glob(pattern1)

tier2_used = False
if not candidates:
    wp_fragment = wp_fs[-8:] if len(wp_fs) >= 8 else wp_fs
    pattern2 = f'_COMMUNICATION/**/TEAM_10_*{wp_fragment}*G3_PLAN*WORK_PLAN*.md'
    candidates = glob.glob(pattern2, recursive=True)
    if candidates:
        tier2_used = True

def is_recent(path):
    try:
        mtime = os.path.getmtime(path)
        if mtime < cutoff_48h: return False
        if activation_ts and mtime < activation_ts: return False
        return True
    except Exception:
        return False

recent = [f for f in candidates if is_recent(f)]
if not recent and candidates:
    recent = candidates
    print(f'⚠️  AC-11: no recent work plan found — using oldest available match (mtime unverified)', file=sys.stderr)

if not recent:
    print('NO_FILE')
    sys.exit(0)

recent.sort(key=lambda f: os.path.getmtime(f), reverse=True)
latest = recent[0]

if tier2_used:
    print(f'TIER2_MATCH:{latest}', file=sys.stderr)

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
    echo "  ⚠️  G3_PLAN: No work plan found for this WP (checked team_10/ + full _COMMUNICATION/ tree)."
    echo "  Team 10 must save TEAM_10_*_G3_PLAN_WORK_PLAN_v*.md before phase2 can proceed."
    echo "  If file exists at a non-standard path, store manually:"
    echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}store G3_PLAN <path/to/work_plan.md>"
    echo ""
  fi
  # ALREADY_STORED: no output — silent pass
}

_kb84_guard() {
  # KB-84 + FIX-101-04: Validate --wp / --gate / --phase for state-mutating commands.
  # Default (strict): --wp and --gate required; --phase required when state has current_phase.
  # Relaxed legacy: set PIPELINE_RELAXED_KB84=1 to allow commands without identifiers.
  local CMD_LABEL="${1:-pass}"
  local SF
  if [ "$DOMAIN" = "tiktrack" ]; then
    SF="_COMMUNICATION/agents_os/pipeline_state_tiktrack.json"
  elif [ "$DOMAIN" = "agents_os" ]; then
    SF="_COMMUNICATION/agents_os/pipeline_state_agentsos.json"
  else
    SF="_COMMUNICATION/agents_os/pipeline_state.json"
  fi
  local ACTIVE_PHASE ACTIVE_WP DOMAIN_RAW
  ACTIVE_PHASE=$(python3 -c "
import json, os
try: print(json.loads(open('${SF}').read()).get('current_phase','') or '')
except: print('')
" 2>/dev/null)
  ACTIVE_WP=$(python3 -c "
import json, os
try: print(json.loads(open('${SF}').read()).get('work_package_id','') or '')
except: print('')
" 2>/dev/null)
  DOMAIN_RAW=$(_get_domain)
  local CUR_GATE
  CUR_GATE=$(_get_gate)

  if [ -n "${PIPELINE_RELAXED_KB84:-}" ]; then
    if [ -z "$EXPLICIT_GATE" ] && [ -z "$EXPLICIT_PHASE" ] && [ -z "$EXPLICIT_WP" ]; then
      return 0
    fi
  else
    if [ -z "$EXPLICIT_WP" ] || [ -z "$EXPLICIT_GATE" ]; then
      local PHASE_HINT=""
      if [ -n "$ACTIVE_PHASE" ]; then PHASE_HINT=" --phase ${ACTIVE_PHASE}"; fi
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ❌  ADVANCE BLOCKED — identifiers required (${CMD_LABEL})"
      echo ""
      echo "  Provide --wp and --gate matching active pipeline state."
      if [ -n "$ACTIVE_PHASE" ]; then
        echo "  Active phase is set — also pass --phase ${ACTIVE_PHASE}"
      fi
      echo ""
      echo "  Active pipeline state:"
      echo "    domain = ${DOMAIN_RAW}"
      echo "    wp     = ${ACTIVE_WP:-—}"
      echo "    gate   = ${CUR_GATE}"
      echo "    phase  = ${ACTIVE_PHASE:-—}"
      echo ""
      echo "  Example:"
      echo "    ./pipeline_run.sh --domain ${DOMAIN_RAW} --wp ${ACTIVE_WP:-<WP>} --gate ${CUR_GATE}${PHASE_HINT} ${CMD_LABEL}"
      echo ""
      echo "  Relaxed mode (not recommended): PIPELINE_RELAXED_KB84=1 ./pipeline_run.sh ..."
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      return 1
    fi
    if [ -n "$ACTIVE_PHASE" ] && [ -z "$EXPLICIT_PHASE" ]; then
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ❌  ADVANCE BLOCKED — --phase required (${CMD_LABEL})"
      echo ""
      echo "  Active phase: ${ACTIVE_PHASE}"
      echo "  Example:"
      echo "    ./pipeline_run.sh --domain ${DOMAIN_RAW} --wp ${ACTIVE_WP} --gate ${CUR_GATE} --phase ${ACTIVE_PHASE} ${CMD_LABEL}"
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      return 1
    fi
  fi

  local MISMATCH=0
  local MISMATCH_LINES=""

  if [ -n "$EXPLICIT_WP" ] && [ "$EXPLICIT_WP" != "$ACTIVE_WP" ]; then
    MISMATCH=1
    MISMATCH_LINES="${MISMATCH_LINES}
  WP mismatch:    --wp ${EXPLICIT_WP}     ≠  active WP ${ACTIVE_WP}"
  fi
  if [ -n "$EXPLICIT_GATE" ] && [ "$EXPLICIT_GATE" != "$CUR_GATE" ]; then
    MISMATCH=1
    MISMATCH_LINES="${MISMATCH_LINES}
  Gate mismatch:  --gate ${EXPLICIT_GATE}  ≠  active gate ${CUR_GATE}"
  fi
  if [ -n "$EXPLICIT_PHASE" ] && [ -n "$ACTIVE_PHASE" ] && [ "$EXPLICIT_PHASE" != "$ACTIVE_PHASE" ]; then
    MISMATCH=1
    MISMATCH_LINES="${MISMATCH_LINES}
  Phase mismatch: --phase ${EXPLICIT_PHASE}  ≠  active phase ${ACTIVE_PHASE}"
  fi

  if [ "$MISMATCH" -eq 1 ]; then
    local PHASE_HINT="" WP_HINT=""
    if [ -n "$ACTIVE_PHASE" ]; then PHASE_HINT=" --phase ${ACTIVE_PHASE}"; fi
    if [ -n "$ACTIVE_WP" ];    then WP_HINT=" --wp ${ACTIVE_WP}"; fi
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo "  ❌  ADVANCE BLOCKED — identifier mismatch (${CMD_LABEL})"
    echo "${MISMATCH_LINES}"
    echo ""
    echo "  Active pipeline state:"
    echo "    domain = ${DOMAIN_RAW}"
    echo "    wp     = ${ACTIVE_WP:-—}"
    echo "    gate   = ${CUR_GATE}"
    echo "    phase  = ${ACTIVE_PHASE:-—}"
    echo ""
    echo "  Correct command for active state:"
    echo "    ./pipeline_run.sh --domain ${DOMAIN_RAW}${WP_HINT} --gate ${CUR_GATE}${PHASE_HINT} ${CMD_LABEL}"
    echo ""
    echo "  Relaxed mode: PIPELINE_RELAXED_KB84=1 ./pipeline_run.sh --domain ${DOMAIN_RAW} ${CMD_LABEL}"
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
    return 1
  fi
  echo "[pipeline_run] ${DOMAIN_LABEL}Precision guard ✓ — wp=${ACTIVE_WP} gate=${CUR_GATE} phase=${ACTIVE_PHASE:-—} (${CMD_LABEL})"
  return 0
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
AUTHORIZED = ['S001', 'S003']  # mirrors pipeline-config.js AUTHORIZED_STAGE_EXCEPTIONS
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
    _auto_store_g3plan_artifact  # AC-11: auto-store latest G3_PLAN work plan before generating prompt
    $CLI --status

    # ── GATE_2/2.2: work plan already stored — show compact "ready to advance" banner ──
    # Prevents showing the full Team 10 mandate again when work plan is done.
    # The full mandate is still regenerated for freshness, but is suppressed in display.
    GATE2_READY=0
    if [[ "$GATE" == "GATE_2" ]] || [[ "$GATE" == "G3_PLAN" ]]; then
      GATE2_PHASE=$(python3 -c "
import sys,os,json
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try: print(json.loads(open(sf).read()).get('current_phase','') or '')
except: print('')
" 2>/dev/null)
      GATE2_WP=$(python3 -c "
import sys,os,json
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try: print(str(json.loads(open(sf).read()).get('work_plan','') or '').strip())
except: print('')
" 2>/dev/null)
      if [[ "$GATE2_PHASE" == "2.2" ]] && [[ -n "$GATE2_WP" ]]; then
        GATE2_READY=1
      fi
    fi

    if [[ "$GATE2_READY" -eq 1 ]]; then
      WP_LEN=${#GATE2_WP}
      DOMAIN_RAW=$(_get_domain)
      echo ""
      echo "╔══════════════════════════════════════════════════════════════════╗"
      echo "  ✅  GATE_2 / Phase 2.2 — Work Plan Stored ($WP_LEN chars)"
      echo ""
      echo "  Team 10 work plan is confirmed in pipeline state."
      echo "  Phase 2.2 is COMPLETE — advance to Phase 2.2v (Team 90 review)."
      echo ""
      echo "  ▶  Run:  ./pipeline_run.sh --domain ${DOMAIN_RAW} pass"
      echo "╚══════════════════════════════════════════════════════════════════╝"
      echo ""
    else
      _generate_and_show "$GATE"
    fi
    ;;

  pass)
    _refresh_state_snapshot
    _validate_stage_alignment || exit 1
    GATE=$(_get_gate)

    # ── WP099 PERMANENT TOMBSTONE guard ──────────────────────────────────
    # S003-P011-WP099 was a simulation artifact. It must NEVER advance gates
    # on the live pipeline, regardless of what is in the state file.
    # This guard fires even if someone restores the state file from a stale cache.
    WP_ID=$(_get_wp_id 2>/dev/null || echo "")
    if [[ "$WP_ID" == *"WP099"* ]]; then
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ⛔ WP099 TOMBSTONE — S003-P011-WP099 is a simulation artifact"
      echo "  This WP is permanently excluded from live pipeline execution."
      echo "  The state file was likely restored from a stale external cache."
      echo ""
      echo "  Recovery:  git checkout HEAD -- <pipeline_state_file>"
      echo "             ./pipeline_run.sh wsm-reset"
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      exit 1
    fi

    # ── COMPLETE guard: refuse to advance when no WP is active ───────────
    # Prevents simulation/stale-state runs from writing ghost WP IDs to WSM.
    if [[ "$GATE" == "COMPLETE" ]]; then
      _DOM_FLAG=""; if [[ -n "${DOMAIN:-}" ]]; then _DOM_FLAG="--domain $DOMAIN "; fi
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ⛔ NO ACTIVE WORK PACKAGE — pipeline is in COMPLETE state"
      echo "  Cannot pass gate COMPLETE — there is no WP to advance."
      echo ""
      echo "  Sync WSM to idle state:  ./pipeline_run.sh ${_DOM_FLAG}wsm-reset"
      echo "  Show pipeline status:    ./pipeline_run.sh ${_DOM_FLAG}status"
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      exit 1
    fi

    _auto_store_gate1_artifact   # AC-10: ensure latest LLD400 is stored before validation guard runs

    # ── KB-84: Explicit WP / gate / phase guard (delegated to _kb84_guard) ──
    _kb84_guard pass || exit 1

    # ── S003-P009-WP001 Item 3: pre-GATE_4 uncommitted-change block ───────
    # If we are about to leave CURSOR_IMPLEMENTATION (next gate is GATE_4),
    # require tracked changes to be committed first. Untracked files are allowed.
    if [[ "$GATE" == "CURSOR_IMPLEMENTATION" ]]; then
      if ! git diff --quiet || ! git diff --cached --quiet; then
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo "  ⛔ UNCOMMITTED CHANGES — pre-GATE_4 block"
        echo "  Gate CURSOR_IMPLEMENTATION cannot advance to GATE_4 while"
        echo "  tracked changes are still staged/unstaged."
        echo ""
        echo "  Required:"
        echo "    1) Commit implementation changes"
        echo "    2) Re-run: ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}pass"
        echo ""
        echo "  Note: untracked files do not block this check."
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        exit 1
      fi
    fi

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

    # ── GATE_2 sub-phase advance (2.2→2.2v→2.3→full gate close) ──────────────
    # advance_gate(GATE_2, PASS) skips sub-phases — handle them here first.
    if [[ "$GATE" == "GATE_2" ]]; then
      GATE2_PHASE=$(python3 -c "
import sys,os,json
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try: print(json.loads(open(sf).read()).get('current_phase','') or '')
except: print('')
" 2>/dev/null)

      _g2_phase_advance() {
        local target_phase="$1"
        local label="$2"
        python3 -c "
import sys,os,json
from datetime import datetime,timezone
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    s=json.loads(open(sf).read())
    s['current_phase']='${target_phase}'
    s['last_updated']=datetime.now(timezone.utc).isoformat()
    open(sf,'w').write(json.dumps(s,indent=2,ensure_ascii=False))
    print('[OK]')
except Exception as e:
    print('[ERR] '+str(e)); raise
"
      }

      if [[ "$GATE2_PHASE" == "2.2" ]]; then
        # Phase 2.2 → 2.2v: validate work_plan stored first
        WORK_PLAN=$(_check_state_field "work_plan")
        if [ -z "$WORK_PLAN" ] && [ "$FORCE_FLAG" != "--force" ]; then
          echo ""
          echo "════════════════════════════════════════════════════════════════════"
          echo "  ⚠️  ADVANCE BLOCKED — work_plan not stored"
          echo "  GATE_2 / Phase 2.2 cannot advance to 2.2v until Team 10's work"
          echo "  plan is stored in pipeline state."
          echo ""
          echo "  Store it:  ./pipeline_run.sh ${DOMAIN_FLAG_STR}phase2"
          echo "  Then retry: ./pipeline_run.sh ${DOMAIN_FLAG_STR}pass"
          echo "════════════════════════════════════════════════════════════════════"
          echo ""
          exit 1
        fi
        echo "[pipeline_run] ${DOMAIN_LABEL}GATE_2 phase advance: 2.2 → 2.2v (Team 90 work plan review)"
        _g2_phase_advance "2.2v" "Team 90 work plan review"
        echo ""
        _generate_and_show "GATE_2"
        ACTIVE_DOMAIN=$(_get_domain)
        echo ""
        echo "  ────────────────────────────────────────────────────────────────"
        echo "  💡 Dashboard: reload to see Phase 2.2v (${ACTIVE_DOMAIN})"
        echo "  ────────────────────────────────────────────────────────────────"
        exit 0

      elif [[ "$GATE2_PHASE" == "2.2v" ]]; then
        # Phase 2.2v → 2.3: Team 90 validated — advance to architect sign-off
        echo "[pipeline_run] ${DOMAIN_LABEL}GATE_2 phase advance: 2.2v → 2.3 (architect sign-off)"
        _g2_phase_advance "2.3" "Architect sign-off"
        echo ""
        _generate_and_show "GATE_2"
        ACTIVE_DOMAIN=$(_get_domain)
        echo ""
        echo "  ────────────────────────────────────────────────────────────────"
        echo "  💡 Dashboard: reload to see Phase 2.3 (${ACTIVE_DOMAIN})"
        echo "  ────────────────────────────────────────────────────────────────"
        exit 0

      fi
      # Phase 2.3 (or empty/unknown): fall through to full gate advance → GATE_3
      echo "[pipeline_run] ${DOMAIN_LABEL}GATE_2/2.3 → full gate close → GATE_3/3.1"
    fi

    # ── GATE_3 sub-phase advance (3.1→3.2→3.3→full gate close) ───────────────
    # advance_gate(GATE_3, PASS) skips sub-phases — handle them here first.
    # 3.1 (mandates) → pass → 3.2 (implementation) → pass → 3.3 (QA) → pass → GATE_4
    if [[ "$GATE" == "GATE_3" ]]; then
      GATE3_PHASE=$(python3 -c "
import sys,os,json
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try: print(json.loads(open(sf).read()).get('current_phase','') or '')
except: print('')
" 2>/dev/null)

      _g3_phase_advance() {
        local target_phase="$1"
        python3 -c "
import sys,os,json
from datetime import datetime,timezone
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    s=json.loads(open(sf).read())
    s['current_phase']='${target_phase}'
    s['last_updated']=datetime.now(timezone.utc).isoformat()
    open(sf,'w').write(json.dumps(s,indent=2,ensure_ascii=False))
    print('[OK]')
except Exception as e:
    print('[ERR] '+str(e)); raise
"
      }

      if [[ "$GATE3_PHASE" == "3.1" ]]; then
        echo "[pipeline_run] ${DOMAIN_LABEL}GATE_3 phase advance: 3.1 → 3.2 (implementation)"
        _g3_phase_advance "3.2"
        echo ""
        _generate_and_show "GATE_3"
        ACTIVE_DOMAIN=$(_get_domain)
        echo ""
        echo "  ────────────────────────────────────────────────────────────────"
        echo "  💡 GATE_3/3.2 active — paste mandate to implementation teams"
        echo "  💡 Dashboard: reload to see Phase 3.2 (${ACTIVE_DOMAIN})"
        echo "  ────────────────────────────────────────────────────────────────"
        exit 0

      elif [[ "$GATE3_PHASE" == "3.2" ]]; then
        echo "[pipeline_run] ${DOMAIN_LABEL}GATE_3 phase advance: 3.2 → 3.3 (QA — Team 50/51)"
        _g3_phase_advance "3.3"
        echo ""
        _generate_and_show "GATE_3"
        ACTIVE_DOMAIN=$(_get_domain)
        echo ""
        echo "  ────────────────────────────────────────────────────────────────"
        echo "  💡 GATE_3/3.3 active — paste QA mandate to Team 50/51"
        echo "  💡 Dashboard: reload to see Phase 3.3 (${ACTIVE_DOMAIN})"
        echo "  ────────────────────────────────────────────────────────────────"
        exit 0

      fi
      # Phase 3.3 (or unknown): fall through to full gate advance → GATE_4
      echo "[pipeline_run] ${DOMAIN_LABEL}GATE_3/3.3 QA complete → full gate close → GATE_4/4.1"
    fi

    # ── GATE_4 sub-phase advance (4.1→4.2→4.3→full gate close) ───────────────
    # 4.1 (Team 90 constitutional) → pass → 4.2 (arch review) → pass → 4.3 (Nimrod) → pass → GATE_5
    if [[ "$GATE" == "GATE_4" ]]; then
      GATE4_PHASE=$(python3 -c "
import sys,os,json
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try: print(json.loads(open(sf).read()).get('current_phase','') or '')
except: print('')
" 2>/dev/null)

      _g4_phase_advance() {
        local target_phase="$1"
        python3 -c "
import sys,os,json
from datetime import datetime,timezone
sys.path.insert(0,'.')
domain=os.environ.get('PIPELINE_DOMAIN') or None
sf='_COMMUNICATION/agents_os/pipeline_state_tiktrack.json' if domain=='tiktrack' else \
   '_COMMUNICATION/agents_os/pipeline_state_agentsos.json' if domain=='agents_os' else \
   '_COMMUNICATION/agents_os/pipeline_state.json'
try:
    s=json.loads(open(sf).read())
    s['current_phase']='${target_phase}'
    s['last_updated']=datetime.now(timezone.utc).isoformat()
    open(sf,'w').write(json.dumps(s,indent=2,ensure_ascii=False))
    print('[OK]')
except Exception as e:
    print('[ERR] '+str(e)); raise
"
      }

      if [[ "$GATE4_PHASE" == "4.1" ]]; then
        echo "[pipeline_run] ${DOMAIN_LABEL}GATE_4 phase advance: 4.1 → 4.2 (architectural review)"
        _g4_phase_advance "4.2"
        echo ""
        _generate_and_show "GATE_4"
        ACTIVE_DOMAIN=$(_get_domain)
        echo ""
        echo "  ────────────────────────────────────────────────────────────────"
        echo "  💡 GATE_4/4.2 active — paste mandate to lod200_author_team (arch review)"
        echo "  💡 Dashboard: reload to see Phase 4.2 (${ACTIVE_DOMAIN})"
        echo "  ────────────────────────────────────────────────────────────────"
        exit 0

      elif [[ "$GATE4_PHASE" == "4.2" ]]; then
        echo "[pipeline_run] ${DOMAIN_LABEL}GATE_4 phase advance: 4.2 → 4.3 (Nimrod human sign-off)"
        _g4_phase_advance "4.3"
        echo ""
        _generate_and_show "GATE_4"
        ACTIVE_DOMAIN=$(_get_domain)
        echo ""
        echo "  ────────────────────────────────────────────────────────────────"
        echo "  💡 GATE_4/4.3 active — Nimrod reviews + approves or rejects"
        echo "  💡 Dashboard: reload to see Phase 4.3 (${ACTIVE_DOMAIN})"
        echo "  ────────────────────────────────────────────────────────────────"
        exit 0

      fi
      # Phase 4.3 (or unknown): fall through to full gate advance → GATE_5
      echo "[pipeline_run] ${DOMAIN_LABEL}GATE_4/4.3 approved → full gate close → GATE_5/5.1"
    fi

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
    # ── S003-P011-WP001 KB-26: Block pass when BLOCK_FOR_FIX active ──────────
    # If last_blocking_gate == current_gate and last_blocking_findings non-empty, do not advance.
    python3 -c "
import sys, os, json
sys.path.insert(0, '.')
os.environ.setdefault('PIPELINE_DOMAIN', '${DOMAIN:-}')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
state = PipelineState.load(domain)
lbg = getattr(state, 'last_blocking_gate', '') or ''
lbf = getattr(state, 'last_blocking_findings', '') or ''
cg = state.current_gate or ''
if lbg and cg and lbg == cg and lbf.strip():
    print('', file=sys.stderr)
    print('════════════════════════════════════════════════════════════', file=sys.stderr)
    print('  ⛔ BLOCK_FOR_FIX — Fix blocking findings before advancing', file=sys.stderr)
    print('  Gate:', cg, file=sys.stderr)
    print('  Blocking findings must be addressed. Run: ./pipeline_run.sh insist', file=sys.stderr)
    print('  to regenerate remediation mandate.', file=sys.stderr)
    print('════════════════════════════════════════════════════════════', file=sys.stderr)
    sys.exit(1)
" 2>&1
    KB26_EXIT=$?
    if [ "$KB26_EXIT" -ne 0 ]; then
      echo ""
      echo "  ⛔ BLOCK_FOR_FIX active — address blocking findings (./pipeline_run.sh insist)"
      echo ""
      exit 1
    fi
    # ──────────────────────────────────────────────────────────────────────

    echo "[pipeline_run] ${DOMAIN_LABEL}Advancing $GATE → PASS"
    $CLI --advance "$GATE" PASS
    _log_action "GATE_PASS" "$GATE" "${EXPLICIT_PHASE:-}"
    _autocommit_pipeline_state \
      "pipeline: ${DOMAIN_LABEL}${GATE} PASS → $(_get_gate 2>/dev/null || echo NEXT)" \
      "$GATE" "$(_get_wp_id 2>/dev/null || echo '')"
    echo ""
    _ssot_check_print
    echo ""
    NEXT_GATE=$(_get_gate)
    ACTIVE_DOMAIN=$(_get_domain)
    # S003-P011-WP001 KB-27: GATE_2 with gate_state=HUMAN_PENDING also needs approve
    GATE_STATE=$(python3 -c "
import sys, os; sys.path.insert(0, '.'); os.environ.setdefault('PIPELINE_DOMAIN', '${DOMAIN:-}')
from agents_os_v2.orchestrator.state import PipelineState
print(getattr(PipelineState.load(os.environ.get('PIPELINE_DOMAIN')), 'gate_state', '') or '')
" 2>/dev/null || echo "")
    if [[ "$NEXT_GATE" == WAITING_* ]]; then
      echo "[pipeline_run] Human approval gate reached: $NEXT_GATE"
      echo "[pipeline_run] Review and run: ./pipeline_run.sh approve"
    elif [[ "$NEXT_GATE" == "GATE_2" && "$GATE_STATE" == "HUMAN_PENDING" ]]; then
      echo "[pipeline_run] GATE_2 human approval required (gate_state=HUMAN_PENDING)"
      echo "[pipeline_run] Review and run: ./pipeline_run.sh approve"
      _generate_and_show "$NEXT_GATE"
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
    # S003-P011-WP001 P6 + S003-P012-WP002: fail [--finding_type TYPE] [--from-report PATH] [reason...]
    shift
    FINDING_TYPE="${FINDING_TYPE:-}"
    FROM_REPORT=""
    REASON=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --finding_type|--finding-type)
          FINDING_TYPE="$2"
          shift 2
          ;;
        --from-report)
          FROM_REPORT="$2"
          shift 2
          ;;
        *)
          REASON="${REASON}${REASON:+ }$1"
          shift 1
          ;;
      esac
    done
    FINDING_TYPE_ENUM="PWA|doc|wording|canonical_deviation|code_fix_single|code_fix_multi|architectural|scope_change|unclear"
    if [[ -z "$FINDING_TYPE" ]]; then
      echo "" >&2
      echo "════════════════════════════════════════════════════════════" >&2
      echo "  ⛔ FAIL PREFLIGHT — finding_type is required" >&2
      echo "  Set via: ./pipeline_run.sh fail --finding_type PWA \"reason\"" >&2
      echo "  Or: ./pipeline_run.sh fail --finding_type doc --from-report /path/to/report.md" >&2
      echo "  Or: FINDING_TYPE=PWA ./pipeline_run.sh fail \"reason\"" >&2
      echo "  Valid: $FINDING_TYPE_ENUM" >&2
      echo "════════════════════════════════════════════════════════════" >&2
      exit 1
    fi
    if ! [[ "$FINDING_TYPE" =~ ^(PWA|doc|wording|canonical_deviation|code_fix_single|code_fix_multi|architectural|scope_change|unclear)$ ]]; then
      echo "" >&2
      echo "  ⛔ finding_type '$FINDING_TYPE' not in ENUM. Valid: $FINDING_TYPE_ENUM" >&2
      exit 1
    fi
    export FINDING_TYPE
    # ── KB-84: Precision guard (fail) ─────────────────────────────────────────
    _kb84_guard "fail --finding_type ${FINDING_TYPE} \"${REASON}\"" || exit 1
    GATE=$(_get_gate)

    # ── WP099 PERMANENT TOMBSTONE guard ──────────────────────────────────
    WP_ID_FAIL=$(_get_wp_id 2>/dev/null || echo "")
    if [[ "$WP_ID_FAIL" == *"WP099"* ]]; then
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ⛔ WP099 TOMBSTONE — S003-P011-WP099 is a simulation artifact"
      echo "  This WP is permanently excluded from live pipeline execution."
      echo ""
      echo "  Recovery:  git checkout HEAD -- <pipeline_state_file>"
      echo "             ./pipeline_run.sh wsm-reset"
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      exit 1
    fi

    # ── COMPLETE guard: refuse to record FAIL when no WP is active ────────
    if [[ "$GATE" == "COMPLETE" ]]; then
      _DOM_FLAG=""; if [[ -n "${DOMAIN:-}" ]]; then _DOM_FLAG="--domain $DOMAIN "; fi
      echo ""
      echo "════════════════════════════════════════════════════════════════════"
      echo "  ⛔ NO ACTIVE WORK PACKAGE — pipeline is in COMPLETE state"
      echo "  Cannot record FAIL — there is no WP to advance."
      echo ""
      echo "  Sync WSM to idle state:  ./pipeline_run.sh ${_DOM_FLAG}wsm-reset"
      echo "  Show pipeline status:    ./pipeline_run.sh ${_DOM_FLAG}status"
      echo "════════════════════════════════════════════════════════════════════"
      echo ""
      exit 1
    fi

    echo "[pipeline_run] ${DOMAIN_LABEL}Advancing $GATE → FAIL (finding_type=$FINDING_TYPE): ${REASON:-<from-report or empty>}"
    FR_ARGS=()
    if [[ -n "$FROM_REPORT" ]]; then
      FR_ARGS=(--from-report "$FROM_REPORT")
    fi
    $CLI --advance "$GATE" FAIL --reason "$REASON" --finding-type "$FINDING_TYPE" "${FR_ARGS[@]}"
    _log_action "GATE_FAIL" "$GATE" "${EXPLICIT_PHASE:-}" "$FINDING_TYPE"
    _autocommit_pipeline_state \
      "pipeline: ${DOMAIN_LABEL}${GATE} FAIL (${FINDING_TYPE})" \
      "$GATE" "$(_get_wp_id 2>/dev/null || echo '')"
    echo ""
    _ssot_check_print
    echo ""

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
      # Auto-generate next prompt. pipeline.py auto-injects blocking findings
      # for remediation cycles (CURSOR_IMPLEMENTATION / G3_PLAN).
      _generate_and_show "$NEXT_GATE"
    else
      # Gate stayed at same position — check if it's a self-loop gate (e.g. GATE_5 closure)
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
    BASE_GATE=$(echo "$GATE" | sed 's/WAITING_//; s/_APPROVAL//; s/GATE\([0-9]\)/GATE_\1/')
    echo "[pipeline_run] ${DOMAIN_LABEL}Approving: $BASE_GATE"
    $CLI --approve "$BASE_GATE"
    echo ""
    _ssot_check_print
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

  wsm-reset)
    # S003-P016: COS removed from WSM — wsm-reset now syncs STAGE_PARALLEL_TRACKS
    # from pipeline_state_*.json (the single source of runtime truth).
    echo "[pipeline_run] ${DOMAIN_LABEL}WSM reset — syncing STAGE_PARALLEL_TRACKS from pipeline state"
    python3 -c "
import sys, os, json
from pathlib import Path
sys.path.insert(0, '.')
try:
    from agents_os_v2.orchestrator.wsm_writer import write_stage_parallel_tracks_row
    from agents_os_v2.orchestrator.state import PipelineState
    agents_dir = Path('_COMMUNICATION/agents_os')
    tt_wp = tt_gate = aos_wp = aos_gate = ''
    tt_file = agents_dir / 'pipeline_state_tiktrack.json'
    aos_file = agents_dir / 'pipeline_state_agentsos.json'
    if tt_file.exists():
        d = json.loads(tt_file.read_text())
        tt_wp   = d.get('work_package_id', '')
        tt_gate = d.get('current_gate', '')
    if aos_file.exists():
        d = json.loads(aos_file.read_text())
        aos_wp   = d.get('work_package_id', '')
        aos_gate = d.get('current_gate', '')
    for _dom in ('tiktrack', 'agents_os'):
        write_stage_parallel_tracks_row(PipelineState.load(_dom))
    print('  ✅ WSM idle-reset complete')
    print(f'     TikTrack last: {tt_wp or \"N/A\"} ({tt_gate or \"?\"})')
    print(f'     AOS last:      {aos_wp or \"N/A\"} ({aos_gate or \"?\"})')
except Exception as e:
    print(f'  ⚠️  wsm-reset failed: {e}', file=sys.stderr)
    sys.exit(1)
" || exit 1
    _log_action "WSM_RESET" "COMPLETE" "" "stage-parallel-tracks-sync"
    _autocommit_pipeline_state "pipeline: wsm-reset — STAGE_PARALLEL_TRACKS synced" "COMPLETE" ""
    echo ""
    _ssot_check_print
    echo ""
    ;;

  gate)
    # Override: generate for specific gate name
    TARGET="${2:?Usage: ./pipeline_run.sh gate GATE_NAME}"
    _generate_and_show "$TARGET"
    ;;

  route)
    # Route pipeline after a FAIL decision.
    # Usage:
    #   ./pipeline_run.sh route doc   [notes]   → doc fix → impl team → GATE_5 re-validation
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
    # ── KB-84: Precision guard (route) ────────────────────────────────────────
    _kb84_guard "route ${TYPE}" || exit 1
    echo "[pipeline_run] ${DOMAIN_LABEL}Routing $GATE FAIL → $TYPE"
    if [ -n "$NOTES" ]; then
      echo "[pipeline_run] Notes: $NOTES"
    fi
    $CLI --route "$TYPE" "$GATE" --reason "$NOTES"
    echo ""
    NEXT_GATE=$(_get_gate)
    if [ -n "$NOTES" ]; then
      # Explicit notes provided by operator: pass them directly into prompt generation.
      echo "[pipeline_run] ${DOMAIN_LABEL}Generating remediation prompt for: $NEXT_GATE"
      $CLI --generate-prompt "$NEXT_GATE" --revision-notes "$NOTES" 2>&1 | grep -v "^━"
      _show_prompt "$NEXT_GATE"
    else
      # No notes: rely on pipeline auto-extraction from blocking reports/verdicts.
      _generate_and_show "$NEXT_GATE"
    fi
    echo ""
    _ssot_check_print || exit 1
    ;;

  revise)
    # Universal Revision mode (handles G3_PLAN rewrites and CURSOR_IMPLEMENTATION fixes).
    # Usage: ./pipeline_run.sh revise "BLOCKER-1: ..." [optional: work_plan_file_path]
    NOTES="${2:?Usage: ./pipeline_run.sh revise \"blocker notes\" [optional: work_plan_file_path]}"
    CURRENT_GATE=$(_get_gate)

    # Step 0: if currently at G3_5, advance it to FAIL + route full → G3_PLAN
    if [[ "$CURRENT_GATE" == "G3_5" ]]; then
      echo "[pipeline_run] ${DOMAIN_LABEL}Recording G3_5 FAIL (revision triggered)..."
      FAIL_REASON="${NOTES:0:200}"
      $CLI --advance G3_5 FAIL --reason "$FAIL_REASON" 2>&1 | grep -v "^━"
      echo "[pipeline_run] ${DOMAIN_LABEL}Routing G3_5 → G3_PLAN (full — structural work plan blockers)..."
      $CLI --route full G3_5 --reason "$FAIL_REASON" 2>&1 | grep -v "^━"
      CURRENT_GATE="G3_PLAN"
      echo "[pipeline_run] G3_5 routed → gate now: $CURRENT_GATE"
    fi

    # Step 1: store current work plan artifact (if file path given as $3)
    if [[ "$CURRENT_GATE" == "G3_PLAN" && -n "$3" ]]; then
      echo "[pipeline_run] Storing work plan artifact: $3"
      $CLI --store-artifact G3_PLAN "$3"
    fi
    
    echo "[pipeline_run] ${DOMAIN_LABEL}Generating ${CURRENT_GATE} REVISION prompt..."
    $CLI --generate-prompt "$CURRENT_GATE" --revision-notes "$NOTES" 2>&1 | grep -v "^━"
    _show_prompt "$CURRENT_GATE"
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
    # ── KB-84: Precision guard (phase advance) ────────────────────────────────
    _kb84_guard "phase${PHASE_NUM}" || exit 1

    GATE=$(_get_gate)
    _auto_store_gate1_artifact   # AC-10: auto-store latest LLD400 before phase transition
    _auto_store_g3plan_artifact  # AC-11: auto-store G3_PLAN work plan before phase transition

    # FIX-101-07: gates where phase advance must update state *before* mandate regeneration
    if [[ "$GATE" == "GATE_5" && "$PHASE_NUM" == "2" ]]; then
      python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
state = PipelineState.load(domain)
state.current_phase = '5.2'
state.save()
print('[pipeline_run] GATE_5: current_phase set to 5.2 before mandate regeneration (FIX-101-07).')
" 2>/dev/null || true
    fi
    if [[ "$GATE" == "GATE_8" && "$PHASE_NUM" == "2" ]]; then
      python3 -c "
import sys, os
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
domain = os.environ.get('PIPELINE_DOMAIN') or None
state = PipelineState.load(domain)
state.phase8_content = 'PHASE2_ACTIVE'
state.save()
print('[pipeline_run] GATE_8: phase8_content=PHASE2_ACTIVE before mandate regeneration (FIX-101-07).')
" 2>/dev/null || true
    fi

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
      GATE_2)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_GATE_2_mandates.md"
        ;;
      G3_PLAN)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_G3_PLAN_mandates.md"
        ;;
      GATE_5)
        MANDATE_FILE="$PROMPTS_DIR/${_dm_slug}_gate_5_mandates.md"
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
    # Also matches GATE_2 (canonical post-migration of G3_PLAN)
    if [[ ("$GATE" == "G3_PLAN" || "$GATE" == "GATE_2") && "$PHASE_NUM" == "2" ]]; then
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

    # ── (GATE_5 / GATE_8 phase2 state updates moved before --generate-prompt — FIX-101-07) ──

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
    # FIX-101-02: parallel tracks + SSOT after phase mandate display (state may have changed)
    _auto_wsm_sync || exit 1
    _ssot_check_print || exit 1
    ;;

  *)
    echo "Usage: ./pipeline_run.sh [--domain tiktrack|agents_os] [next|pass|fail <reason>|approve|status|gate <NAME>|route doc|full [notes]|revise <notes> [file]|store <GATE> <FILE>|pass_with_actions <a1|a2>|actions_clear|override <reason>|insist|domain|phase<N>]"
    echo ""
    echo "  next / (no arg)          Generate current gate prompt + display"
    echo "  pass                              Advance current gate → PASS (no validation)
  --wp WP --gate G --phase P pass   Precision pass: validate WP+gate+phase vs active state
                                    Recommended: ./pipeline_run.sh --domain D --wp S003-P013-WP001 --gate GATE_3 --phase 3.3 pass
                                    Blocks with correction if any identifier mismatches"
    echo "  fail <reason>            Record FAIL with reason → show routing options"
    echo "  route doc|full [notes]   Route after FAIL: doc=quick fix, full=full cycle"
    echo "  approve                  Approve human gate (GATE_2, GATE_4 UX; alias gate7)"
    echo "  status                   Show pipeline state only"
    echo "  wsm-reset                Sync WSM to idle state when both domains COMPLETE"
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
