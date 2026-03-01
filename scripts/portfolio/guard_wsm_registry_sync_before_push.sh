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
