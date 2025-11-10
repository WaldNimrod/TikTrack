#!/bin/bash
#
# Installs the TikTrack version enforcement pre-commit hook.
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK_SRC="$ROOT/scripts/git-hooks/pre-commit-version-check.sh"
HOOK_DST="$ROOT/.git/hooks/pre-commit"

if [[ ! -f "$HOOK_SRC" ]]; then
  echo "Hook source not found: $HOOK_SRC" >&2
  exit 1
fi

if [[ ! -d "$ROOT/.git/hooks" ]]; then
  echo "Running outside a git worktree? .git/hooks missing." >&2
  exit 1
fi

chmod +x "$HOOK_SRC"
cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"

cat <<EOF
✅ TikTrack version hook installed.

Commits on main/production will now enforce the version manifest policy.
Set SKIP_VERSION_CHECK=1 to bypass in emergencies.
EOF

