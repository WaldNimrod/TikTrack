#!/usr/bin/env bash
# AOS v3 — Phase 5 pipeline canary simulation (F-05). DB-backed pytest subset only.
# Does NOT invoke agents_os_v2 or scripts/canary_simulation/ (v2 layer1).
#
# Usage (repo root, after migration + seed):
#   export AOS_V3_DATABASE_URL=postgresql://...
#   export PYTHONPATH=$(pwd)
#   bash scripts/run_aos_v3_canary_simulation.sh
#
# Exit code: pytest exit code (0 = PASS, non-zero = FAIL).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "${AOS_V3_DATABASE_URL:-}" ]]; then
  echo "ERROR: AOS_V3_DATABASE_URL is not set." >&2
  exit 1
fi

export PYTHONPATH="${PYTHONPATH:-$ROOT}"

echo "[aos-v3-canary] PYTHONPATH=$PYTHONPATH"
echo "[aos-v3-canary] Running: pytest agents_os_v3/tests/canary_simulation/ -v --tb=short"
exec python3 -m pytest agents_os_v3/tests/canary_simulation/ -v --tb=short "$@"
