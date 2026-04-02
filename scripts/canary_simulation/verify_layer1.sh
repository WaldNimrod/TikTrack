#!/usr/bin/env bash
# Wrapper — Layer 1 verify (repo root)
set -e
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"
export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$REPO"
exec python3 scripts/canary_simulation/verify_layer1.py "$@"
