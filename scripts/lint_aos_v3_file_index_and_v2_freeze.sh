#!/usr/bin/env bash
# AOS v3 governance — pre-commit lane (Team 191)
# - Rejects any staged change under agents_os_v2/ (FREEZE)
# - Requires every staged agents_os_v3/ path (except FILE_INDEX + node_modules) to appear in FILE_INDEX.json
#
# Authority: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0 §3
# Directive: ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

export ROOT
python3 <<'PY'
import json
import os
import subprocess
import sys

root = os.environ["ROOT"]
os.chdir(root)

staged = subprocess.check_output(
    ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    text=True,
).splitlines()

staged = [s.strip() for s in staged if s.strip()]
if not staged:
    sys.exit(0)

for path in staged:
    if path.startswith("agents_os_v2/"):
        print(
            "FAIL: agents_os_v2/ is FROZEN during AOS v3. Staged file:",
            path,
            file=sys.stderr,
        )
        print(
            "See: _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0",
            file=sys.stderr,
        )
        sys.exit(1)

v3 = [
    p
    for p in staged
    if p.startswith("agents_os_v3/")
    and p != "agents_os_v3/FILE_INDEX.json"
    and "node_modules" not in p.split("/")
]

if not v3:
    sys.exit(0)

index_path = os.path.join(root, "agents_os_v3", "FILE_INDEX.json")
if not os.path.isfile(index_path):
    print(
        "FAIL: agents_os_v3/FILE_INDEX.json is missing but agents_os_v3/ paths are staged.",
        file=sys.stderr,
    )
    print("Team 61 maintains FILE_INDEX; see ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0", file=sys.stderr)
    sys.exit(1)

with open(index_path, encoding="utf-8") as f:
    data = json.load(f)

entries = data.get("entries")
if not isinstance(entries, list):
    print("FAIL: FILE_INDEX.json: 'entries' must be a list", file=sys.stderr)
    sys.exit(1)

indexed = {e.get("path") for e in entries if isinstance(e, dict) and e.get("path")}

for path in v3:
    if path not in indexed:
        print(
            "FAIL: Staged path not listed in FILE_INDEX.json:",
            path,
            file=sys.stderr,
        )
        print("Iron Rule: register every agents_os_v3/ file before commit.", file=sys.stderr)
        sys.exit(1)

sys.exit(0)
PY
