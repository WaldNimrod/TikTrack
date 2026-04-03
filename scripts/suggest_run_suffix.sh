#!/usr/bin/env bash
# suggest_run_suffix.sh — print [run: XXXXXXXX] for commit subject suffix (AOS v3 / tiktrack)
#
# Source of truth: _COMMUNICATION/agents_os/pipeline_state_tiktrack.json (Team 00 §15.5).
# Only prints when status is IN_PROGRESS, CORRECTION, or PAUSED and run_id is present.
# Missing/malformed file → no output, exit 0 (CI-safe).
#
# Usage:
#   git commit -m "$(echo 'S003_P001: fix thing' && bash scripts/suggest_run_suffix.sh)"
#   # or append manually after reading printed suffix

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="${AOS_V3_PIPELINE_STATE_TIKTRACK:-$ROOT/_COMMUNICATION/agents_os/pipeline_state_tiktrack.json}"

if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

export STATE_FILE
python3 -c "
import json, os, sys
path = os.environ.get('STATE_FILE', '')
if not path:
    sys.exit(0)
try:
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
except Exception:
    sys.exit(0)
run_id = (d.get('run_id') or '')[:8]
status = d.get('status') or ''
if status in ('IN_PROGRESS', 'CORRECTION', 'PAUSED') and run_id:
    print(f'[run: {run_id}]')
" 2>/dev/null || true
exit 0
