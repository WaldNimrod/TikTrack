#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

WSM_PATH="documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"
PROGRAM_PATH="documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md"
WP_PATH="documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md"
SNAPSHOT_JSON="portfolio_project/portfolio_snapshot.json"
SNAPSHOT_MD="portfolio_project/portfolio_snapshot.md"

PORTFOLIO_AUTHORITY_FILES=(
  "$WSM_PATH"
  "$PROGRAM_PATH"
  "$WP_PATH"
  "$SNAPSHOT_JSON"
  "$SNAPSHOT_MD"
)

if UPSTREAM_REF="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null)"; then
  RANGE="${UPSTREAM_REF}..HEAD"
else
  if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    RANGE="HEAD~1..HEAD"
  else
    echo "PORTFOLIO PRE-PUSH GUARD: SKIP (no upstream and no previous commit)."
    exit 0
  fi
fi

OUTGOING_COUNT="$(git rev-list --count "$RANGE" 2>/dev/null || printf '0')"
if [[ "$OUTGOING_COUNT" == "0" ]]; then
  echo "PORTFOLIO PRE-PUSH GUARD: PASS (no outgoing commits)."
  exit 0
fi

ALL_OUTGOING_FILES="$(git diff --name-only "$RANGE" || true)"

warn_count=0
category_governance=0
category_architect_inbox=0
category_code=0
category_team_comms=0
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  if [[ "$path" == _COMMUNICATION/_ARCHITECT_INBOX/* ]]; then
    category_architect_inbox=1
  fi
  if [[ "$path" == _COMMUNICATION/* || "$path" == documentation/docs-governance/* ]]; then
    category_governance=1
  fi
  if [[ "$path" == _COMMUNICATION/team_*/* ]]; then
    category_team_comms=1
  fi
  if [[ "$path" == api/* || "$path" == ui/* || "$path" == agents_os/* || "$path" == tests/* || "$path" == scripts/* ]]; then
    category_code=1
  fi
done <<< "$ALL_OUTGOING_FILES"

warn_count=$((category_governance + category_architect_inbox + category_code + category_team_comms))
if [[ "$warn_count" -ge 3 ]]; then
  echo "PORTFOLIO PRE-PUSH GUARD: NOTE (wide mixed-scope outgoing push is allowed in single-local-writer mode)." >&2
  echo "  categories: governance=$category_governance architect_inbox=$category_architect_inbox team_comms=$category_team_comms code=$category_code" >&2
fi

echo "PORTFOLIO PRE-PUSH GUARD: running date-lint for outgoing range ${RANGE}"
# Date-lint base: use the most recent commit already on ANY remote tracking branch
# that is reachable from HEAD. This avoids re-checking files that were already
# validated when pushed to another remote branch (e.g. origin/aos-v3).
# For normal session pushes this resolves to the upstream ref itself (no difference).
# For merge-to-main scenarios it resolves to origin/aos-v3 HEAD, skipping re-checks.
DATE_LINT_BASE="${UPSTREAM_REF:-}"
if REMOTE_ANCESTOR="$(git log --remotes --no-walk --pretty=format:'%H' HEAD 2>/dev/null | xargs -I{} git merge-base {} HEAD 2>/dev/null | sort -u | tail -1 2>/dev/null)"; then
  if [[ -n "$REMOTE_ANCESTOR" ]]; then
    DATE_LINT_BASE="$REMOTE_ANCESTOR"
  fi
fi
bash scripts/lint_governance_dates.sh "${DATE_LINT_BASE}" HEAD

TOUCHED_FILES="$(git diff --name-only "$RANGE" -- "${PORTFOLIO_AUTHORITY_FILES[@]}")"
if [[ -z "$TOUCHED_FILES" ]]; then
  echo "PORTFOLIO PRE-PUSH GUARD: PASS (outgoing commits do not touch portfolio authority files)."
  exit 0
fi

if ! git diff --quiet -- "${PORTFOLIO_AUTHORITY_FILES[@]}"; then
  echo "PORTFOLIO PRE-PUSH GUARD: FAIL (uncommitted working-tree changes in portfolio authority files)." >&2
  echo "Commit or discard changes in:" >&2
  git diff --name-only -- "${PORTFOLIO_AUTHORITY_FILES[@]}" >&2
  exit 1
fi

if ! git diff --cached --quiet -- "${PORTFOLIO_AUTHORITY_FILES[@]}"; then
  echo "PORTFOLIO PRE-PUSH GUARD: FAIL (staged-but-uncommitted portfolio authority changes present)." >&2
  echo "Commit or unstage changes in:" >&2
  git diff --cached --name-only -- "${PORTFOLIO_AUTHORITY_FILES[@]}" >&2
  exit 1
fi

echo "PORTFOLIO PRE-PUSH GUARD: validating committed portfolio state for outgoing range ${RANGE}"
python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check
python3 scripts/portfolio/build_portfolio_snapshot.py --check
echo "PORTFOLIO PRE-PUSH GUARD: PASS"
