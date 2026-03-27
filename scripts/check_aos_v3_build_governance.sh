#!/usr/bin/env bash
# AOS v3 — governance check for local/CI BUILD (Team 191 / Team 61)
# Run as part of BUILD pipelines on branch aos-v3 (191-B).
#
# Checks:
#  1) No agents_os_v2/ paths in commits since merge-base with main (FREEZE)
#  2) Every file under agents_os_v3/ (excluding node_modules) appears in FILE_INDEX.json
#
# Usage: bash scripts/check_aos_v3_build_governance.sh
# Exit 0 = PASS, 1 = FAIL
#
# Authority: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0 (191-B)

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

fail=0

BR="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"

# --- v2 FREEZE: only on branch aos-v3 — commits since diverge from main (main..HEAD has unrelated v2 history)
if [[ "$BR" == "aos-v3" ]]; then
  BASE=""
  # Prefer local main as integration base (avoids false positives when origin/main lags local main)
  if git rev-parse --verify main >/dev/null 2>&1; then
    BASE="$(git merge-base HEAD main 2>/dev/null || true)"
  fi
  if [[ -z "$BASE" ]] && git rev-parse --verify origin/main >/dev/null 2>&1; then
    BASE="$(git merge-base HEAD origin/main 2>/dev/null || true)"
  fi
  if [[ -n "$BASE" ]]; then
    if git diff --name-only "$BASE"..HEAD | grep -q '^agents_os_v2/' ; then
      echo "FAIL [v2 FREEZE]: agents_os_v2/ in commits on aos-v3 since merge-base with main ($BASE..HEAD)" >&2
      fail=1
    fi
  else
    echo "WARN [v2 FREEZE]: could not resolve merge-base — skipping commit-range check" >&2
  fi
else
  echo "INFO [v2 FREEZE]: branch is '$BR' (not aos-v3) — skipping commit-range v2 check; use pre-commit for staged edits" >&2
fi

INDEX="agents_os_v3/FILE_INDEX.json"
if [[ ! -f "$INDEX" ]]; then
  echo "FAIL [FILE_INDEX]: missing $INDEX" >&2
  exit 1
fi

LIST="$(mktemp)"
trap 'rm -f "$LIST"' EXIT
find agents_os_v3 -type f ! -path '*/node_modules/*' 2>/dev/null | sort >"$LIST"

export ROOT LIST
if ! python3 <<'PY'
import json
import os
import sys

root = os.environ["ROOT"]
list_path = os.environ["LIST"]
index_path = os.path.join(root, "agents_os_v3", "FILE_INDEX.json")
with open(index_path, encoding="utf-8") as f:
    data = json.load(f)
indexed = {
    e["path"]
    for e in data.get("entries", [])
    if isinstance(e, dict) and "path" in e
}
missing = []
with open(list_path, encoding="utf-8") as fh:
    for line in fh:
        p = line.strip().replace("\\", "/")
        if not p or p == "agents_os_v3/FILE_INDEX.json":
            continue
        if p not in indexed:
            missing.append(p)
if missing:
    print("FAIL [FILE_INDEX]: files on disk not listed in FILE_INDEX.json:", file=sys.stderr)
    for m in missing:
        print("  -", m, file=sys.stderr)
    sys.exit(1)
sys.exit(0)
PY
then
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "check_aos_v3_build_governance.sh: PASS"
exit 0
