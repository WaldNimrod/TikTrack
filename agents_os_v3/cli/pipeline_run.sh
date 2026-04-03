#!/usr/bin/env bash
# AOS v3 pipeline CLI wrapper (IR-1 — do not use agents_os_v2 pipeline_run.sh on this track).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
export PYTHONPATH="$ROOT${PYTHONPATH:+:$PYTHONPATH}"
exec python3 -m agents_os_v3.cli.pipeline_run "$@"
