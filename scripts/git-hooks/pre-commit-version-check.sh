#!/bin/bash
#
# TikTrack version enforcement hook.
#
# Blocks commits on main/production unless the unified version manifest
# and the matching environment history file are staged. Set
# SKIP_VERSION_CHECK=1 to bypass (e.g. for emergency commits).

set -euo pipefail

branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
if [[ -z "$branch" ]]; then
  exit 0
fi

case "$branch" in
  main)
    history_file="documentation/development/VERSION_HISTORY.md"
    ;;
  production)
    history_file="documentation/production/VERSION_HISTORY.md"
    ;;
  *)
    exit 0
    ;;
esac

if [[ "${SKIP_VERSION_CHECK:-0}" == "1" ]]; then
  echo "[version-check] SKIP_VERSION_CHECK detected, bypassing hook."
  exit 0
fi

manifest_file="documentation/version-manifest.json"

has_manifest_changes=0
has_history_changes=0

if ! git diff --cached --quiet -- "$manifest_file"; then
  has_manifest_changes=1
fi

if ! git diff --cached --quiet -- "$history_file"; then
  has_history_changes=1
fi

if [[ $has_manifest_changes -eq 1 && $has_history_changes -eq 1 ]]; then
  exit 0
fi

cat <<'EOF'

🚫 TikTrack version policy: commits on main/production must include both
    • documentation/version-manifest.json
    • documentation/{development|production}/VERSION_HISTORY.md

Run the version bump helper, e.g.:

  python3 scripts/versioning/bump-version.py \
    --env production --bump patch --note "Describe change"

To override in emergencies:

  SKIP_VERSION_CHECK=1 git commit ...

EOF
exit 1

