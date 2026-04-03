#!/usr/bin/env bash
# AOS v3 governance — pre-commit lane (Team 191)
# - Rejects any staged change under agents_os_v2/ (FREEZE — with LEGACY_CLOSURE exemption)
# - Requires every staged agents_os_v3/ path (except FILE_INDEX + node_modules) to appear in FILE_INDEX.json
#
# Authority: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0 §3
# Directive: ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v2.0.0
#   (supersedes v1.0.0 — v2 freeze lifted for LEGACY CLOSURE only, 2026-04-02)

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

staged_with_status = subprocess.check_output(
    ["git", "diff", "--cached", "--name-status", "--diff-filter=ACMR"],
    text=True,
).splitlines()

staged = []
staged_status = {}
for line in staged_with_status:
    line = line.strip()
    if not line:
        continue
    parts = line.split("\t", 1)
    if len(parts) == 2:
        status, path = parts
        staged.append(path)
        staged_status[path] = status

if not staged:
    sys.exit(0)

# ── v2 freeze check (with LEGACY_CLOSURE exemption per v2.0.0 directive) ──────
# v2.0.0: adds in agents_os_v2/ are permitted ONLY IF:
#   (a) agents_os_v2/LEGACY_NOTICE.md exists in the working tree, AND
#   (b) the staged change type is A (add) — never modify existing v2 files
legacy_notice_exists = os.path.isfile(os.path.join(root, "agents_os_v2", "LEGACY_NOTICE.md"))

for path in staged:
    if path.startswith("agents_os_v2/"):
        change_type = staged_status.get(path, "?")
        # Allow ADD if LEGACY_NOTICE.md exists (LEGACY CLOSURE mode)
        if change_type == "A" and legacy_notice_exists:
            continue
        # Allow the LEGACY_NOTICE.md itself to be added (bootstraps the closure)
        if path == "agents_os_v2/LEGACY_NOTICE.md" and change_type == "A":
            continue
        # Reject modifications to existing v2 code — always
        print(
            "FAIL: agents_os_v2/ is FROZEN. Staged file:",
            path,
            "(type=" + change_type + ")",
            file=sys.stderr,
        )
        if not legacy_notice_exists:
            print(
                "  LEGACY_CLOSURE mode not active: agents_os_v2/LEGACY_NOTICE.md not found.",
                file=sys.stderr,
            )
        else:
            print(
                "  Only ADD operations are permitted in LEGACY_CLOSURE mode (got " + change_type + ").",
                file=sys.stderr,
            )
        print(
            "  See: _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v2.0.0",
            file=sys.stderr,
        )
        sys.exit(1)

# ── FILE_INDEX enforcement for agents_os_v3/ ──────────────────────────────────
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
    print("Team 61 maintains FILE_INDEX; see ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v2.0.0", file=sys.stderr)
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
