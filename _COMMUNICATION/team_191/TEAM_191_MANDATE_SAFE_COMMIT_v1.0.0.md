---
id: TEAM_191_MANDATE_SAFE_COMMIT_v1.0.0
date: 2026-03-24
from: Team 00 (System Designer)
to: Team 191 (Git Governance Operations)
status: ACTIVE — execute immediately
priority: HIGH
subject: Safe Commit Protocol + Procedure Update
---

# Mandate: Safe Commit Protocol — Team 191

## Context

The current `191 קומיט` / `191 פוש` flow does not validate pipeline state before
committing. This allows WSM drift (WP099 contamination, SSOT mismatch) to enter
git history. The pipeline relies on git HEAD as source of truth — a contaminated
commit corrupts the audit trail and triggers false positives in SYNC CHECK.

This mandate has two deliverables:

| Item | Level | File | Permanent? |
|---|---|---|---|
| A | PRE-COMMIT GUARD in procedure | `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md` | Yes |
| B | `scripts/safe_commit.sh` | New script | Yes |

---

## ITEM A — Procedure Update

### Target file
`_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md`

### Required change
Insert a new section **§PRE-COMMIT GUARD (MANDATORY)** immediately before the
existing `## §COMMIT` section. The new section must contain **exactly** the
following content (translate the section header to Hebrew if the document uses
Hebrew headers, but keep command blocks in English):

---

### §PRE-COMMIT GUARD (MANDATORY)

**Must run before every `191 קומיט` and `191 פוש` invocation.**
A failed guard BLOCKS the commit. Team 191 reports the failure to Nimrod and
waits for instruction — never bypasses.

```bash
# Step 1 — SSOT consistency check (both domains)
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# Required: ✓ CONSISTENT on both
# If drift: run ./pipeline_run.sh wsm-reset FIRST, then re-check

# Step 2 — WP099 contamination check
grep -c "WP099" documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
# Required: output = 0
# If output > 0: git checkout HEAD -- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
#                then re-run Step 1

# Step 3 — Show pending changes for review
git status
# Required: review output — no unexpected files
# NEVER commit: *.env, credentials, *.key, pipeline_state_*.json (unless explicitly instructed)
```

**Iron Rule — git add scope:**
- NEVER use `git add -A` or `git add .`
- ALWAYS use targeted `git add <specific-paths>` based on the changes being committed
- When unsure which paths to add: show `git status` output to Nimrod and wait

**Iron Rule — git merge:**
- NEVER execute `git merge` unless Nimrod provides the exact branch name and confirms
- Merging without context is strictly prohibited

**Iron Rule — git push --force:**
- NEVER. Under any circumstances.

---

### §COMMIT (existing section — add guard reference)

Add the following note at the top of the existing `§COMMIT` section:

> **⚠️ Pre-commit guard must pass before this step. See §PRE-COMMIT GUARD.**

---

## ITEM B — Create `scripts/safe_commit.sh`

### File to create
`scripts/safe_commit.sh`

### Exact content

```bash
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
WP099_COUNT=$(grep -c "WP099" "$WSM_PATH" 2>/dev/null || echo "0")
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
```

### Permissions after creation

```bash
chmod +x scripts/safe_commit.sh
```

### Verification

After creating the file, run:

```bash
# Dry-run (no paths = guard only, no commit)
bash scripts/safe_commit.sh
# Expected: prints SSOT status, WP099 check, git status — exits 0

# Confirm script is executable
test -x scripts/safe_commit.sh && echo "OK"
```

---

## Deliverables checklist

Before closing this mandate, Team 191 must confirm:

- [ ] `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md` — §PRE-COMMIT GUARD section inserted
- [ ] `scripts/safe_commit.sh` — created, executable, dry-run exits 0
- [ ] `safe_commit.sh` added to git tracking: `git add scripts/safe_commit.sh`
- [ ] Committed with message: `S003: Team 191 — safe_commit.sh + PRE-COMMIT GUARD procedure`
- [ ] DATE-LINT passes: `bash scripts/lint_governance_dates_staged.sh` (or pre-push hook)

## Escalation

If any guard produces unexpected output (e.g. SSOT check exits non-zero for
unknown reasons), do NOT bypass — report to Team 00 with the exact output.

---

**log_entry | TEAM_00 | TEAM_191_MANDATE_SAFE_COMMIT | ISSUED | 2026-03-24**
