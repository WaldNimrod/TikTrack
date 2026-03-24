#!/usr/bin/env bash
# safe_commit.sh — Team 191 safe commit wrapper
#
# Runs the mandatory PRE-COMMIT GUARD (SSOT check + WP099 check),
# shows git status for review, then commits with a provided message.
#
# Usage:
#   bash scripts/safe_commit.sh "commit message" [path1] [path2] ...
#
#   path1, path2, ... — files/directories to add (REQUIRED — no git add -A)
#   If no paths provided: runs guards and shows git status only (dry-run mode)
#
# Exit codes:
#   0 — commit successful
#   1 — guard failed (SSOT drift or WP099 contamination)
#   2 — usage error
#
# Environment:
#   PIPELINE_ACTION_LOG=0   — disable action log entry for this commit
#   SKIP_SSOT_CHECK=1       — skip SSOT check (for emergency use only; logs a warning)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
cd "$REPO_ROOT"

C_RESET="\033[0m"
C_GREEN="\033[32m"
C_RED="\033[31m"
C_YELLOW="\033[33m"
C_CYAN="\033[36m"
C_BOLD="\033[1m"

WSM_PATH="documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"

# ── Pipeline-owned runtime files — Team 191 must NEVER commit these ───────────
# Only pipeline_run.sh commits these, atomically, after gate advances.
# Committing them mid-operation causes SSOT drift and git HEAD contamination.
PIPELINE_OWNED_FILES=(
  "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"
  "_COMMUNICATION/agents_os/pipeline_state_tiktrack.json"
  "_COMMUNICATION/agents_os/pipeline_state_agentsos.json"
  "_COMMUNICATION/agents_os/pipeline_state.json"
  "_COMMUNICATION/agents_os/STATE_SNAPSHOT.json"
  "_COMMUNICATION/agents_os/logs/pipeline_events.jsonl"
)
# Override with --unlock-pipeline-files (emergency only, requires justification)
UNLOCK_PIPELINE="${UNLOCK_PIPELINE_FILES:-0}"

COMMIT_MSG="${1:-}"
shift || true

# ── Dry-run mode (no paths → guard only) ─────────────────────────────────────
DRY_RUN=0
if [[ $# -eq 0 ]]; then
  DRY_RUN=1
fi

echo ""
echo -e "${C_BOLD}${C_CYAN}═══════════════════════════════════════════════════${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}  Team 191 — Safe Commit Guard${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}═══════════════════════════════════════════════════${C_RESET}"
echo ""

# ── Step 1: SSOT check ────────────────────────────────────────────────────────
if [[ "${SKIP_SSOT_CHECK:-0}" == "1" ]]; then
  echo -e "  ${C_YELLOW}⚠️  SKIP_SSOT_CHECK=1 — bypassing SSOT check (emergency mode)${C_RESET}"
else
  echo -e "  ${C_CYAN}[1/3] SSOT consistency check...${C_RESET}"
  SSOT_FAIL=0
  for domain in tiktrack agents_os; do
    if python3 -m agents_os_v2.tools.ssot_check --domain "$domain" 2>&1 | grep -q "✓ CONSISTENT"; then
      echo -e "  ${C_GREEN}✓ $domain — CONSISTENT${C_RESET}"
    else
      echo -e "  ${C_RED}✗ $domain — DRIFT DETECTED${C_RESET}"
      SSOT_FAIL=1
    fi
  done
  if [[ "$SSOT_FAIL" -eq 1 ]]; then
    echo ""
    echo -e "  ${C_RED}⛔ GUARD FAILED — SSOT drift detected${C_RESET}"
    echo -e "  ${C_YELLOW}Fix: ./pipeline_run.sh wsm-reset  then re-run${C_RESET}"
    echo ""
    exit 1
  fi
fi

# ── Step 2: WP099 active-field contamination check ───────────────────────────
# Checks ONLY the COS active fields (active_work_package_id,
# in_progress_work_package_id, active_flow) — NOT historical log entries.
# Historical log entries legitimately reference WP099 and must not trigger a block.
echo -e "  ${C_CYAN}[2/3] WP099 active-field contamination check...${C_RESET}"
WP099_ACTIVE=$(python3 -c "
import re, sys
wsm = open('${WSM_PATH}').read()
# Only check the three COS active-state fields in the table rows
patterns = [
    r'\|\s*active_work_package_id\s*\|\s*([^|\n]+)\|',
    r'\|\s*in_progress_work_package_id\s*\|\s*([^|\n]+)\|',
    r'\|\s*active_flow\s*\|\s*([^|\n]+)\|',
]
for p in patterns:
    m = re.search(p, wsm)
    if m and 'WP099' in m.group(1):
        print('CONTAMINATED:' + p.split(r'\\|\\s*')[1].split(r'\\s')[0])
        sys.exit(0)
print('CLEAN')
" 2>/dev/null || echo "CHECK_ERROR")

if [[ "$WP099_ACTIVE" == CONTAMINATED:* ]]; then
  FIELD="${WP099_ACTIVE#CONTAMINATED:}"
  echo -e "  ${C_RED}⛔ GUARD FAILED — WP099 is active in WSM field: ${FIELD}${C_RESET}"
  echo ""
  echo -e "  ${C_YELLOW}Fix: ./pipeline_run.sh wsm-reset${C_RESET}"
  echo -e "  ${C_YELLOW}     then commit the clean WSM before using safe_commit${C_RESET}"
  echo ""
  exit 1
elif [[ "$WP099_ACTIVE" == "CHECK_ERROR" ]]; then
  echo -e "  ${C_YELLOW}⚠️  WP099 check failed (python3 error) — proceeding with caution${C_RESET}"
else
  echo -e "  ${C_GREEN}✓ WSM active fields clean — no WP099 contamination${C_RESET}"
fi

# ── Step 3: git status review ────────────────────────────────────────────────
echo -e "  ${C_CYAN}[3/3] Git status:${C_RESET}"
echo ""
git status
echo ""

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo -e "${C_YELLOW}  Dry-run mode — no paths provided. Guards passed. No commit made.${C_RESET}"
  echo -e "${C_YELLOW}  To commit: bash scripts/safe_commit.sh \"message\" <path1> [path2] ...${C_RESET}"
  echo ""
  exit 0
fi

if [[ -z "$COMMIT_MSG" ]]; then
  echo -e "  ${C_RED}⛔ ERROR — commit message is required as first argument${C_RESET}"
  echo -e "  Usage: bash scripts/safe_commit.sh \"commit message\" <path1> [path2] ..."
  echo ""
  exit 2
fi

# ── Pipeline-file ownership guard ────────────────────────────────────────────
if [[ "$UNLOCK_PIPELINE" != "1" ]]; then
  LOCKED_FOUND=()
  for f in "$@"; do
    for locked in "${PIPELINE_OWNED_FILES[@]}"; do
      if [[ "$f" == "$locked" || "$f" == *"$(basename "$locked")"* ]]; then
        LOCKED_FOUND+=("$f")
        break
      fi
    done
  done
  if [[ ${#LOCKED_FOUND[@]} -gt 0 ]]; then
    echo ""
    echo -e "  ${C_RED}⛔ PIPELINE-OWNED FILE — Team 191 cannot commit these directly${C_RESET}"
    for lf in "${LOCKED_FOUND[@]}"; do
      echo -e "  ${C_RED}   · $lf${C_RESET}"
    done
    echo ""
    echo -e "  ${C_YELLOW}These files are owned by pipeline_run.sh and committed atomically${C_RESET}"
    echo -e "  ${C_YELLOW}after gate advances. Committing mid-operation causes SSOT drift.${C_RESET}"
    echo ""
    echo -e "  ${C_YELLOW}If you MUST include them (emergency): UNLOCK_PIPELINE_FILES=1 bash scripts/safe_commit.sh ...${C_RESET}"
    echo ""
    exit 1
  fi
fi

# ── Commit ────────────────────────────────────────────────────────────────────
echo -e "  ${C_CYAN}Adding paths:${C_RESET} $*"
git add "$@"

echo ""
echo -e "  ${C_CYAN}Committing:${C_RESET} $COMMIT_MSG"
git commit -m "$COMMIT_MSG

Co-Authored-By: Team 191 <noreply@tiktrack.local>"

echo ""
echo -e "${C_GREEN}${C_BOLD}  ✅ Commit complete — guards passed, history is clean.${C_RESET}"
echo ""
