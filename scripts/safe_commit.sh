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

# ── Step 2: WP099 contamination check ────────────────────────────────────────
echo -e "  ${C_CYAN}[2/3] WP099 contamination check...${C_RESET}"
# Portable count (BSD grep -c returns exit 1 when zero matches)
WP099_COUNT="$(grep -o "WP099" "$WSM_PATH" 2>/dev/null | wc -l | tr -d '[:space:]')"
WP099_COUNT="${WP099_COUNT:-0}"
if [[ "$WP099_COUNT" -gt 0 ]]; then
  echo -e "  ${C_RED}⛔ GUARD FAILED — WP099 found in WSM ($WP099_COUNT occurrence(s))${C_RESET}"
  echo ""
  echo -e "  ${C_YELLOW}Fix: git checkout HEAD -- ${WSM_PATH}${C_RESET}"
  echo -e "  ${C_YELLOW}     then re-run this script${C_RESET}"
  echo ""
  exit 1
fi
echo -e "  ${C_GREEN}✓ WSM clean — no WP099 contamination${C_RESET}"

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
