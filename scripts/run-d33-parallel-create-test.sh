#!/bin/bash
# D33 Parallel Create — G7R Batch5 Blocker1 integration test
# Requires: Backend/DB running; api/.env with valid DATABASE_URL
# Run: bash scripts/run-d33-parallel-create-test.sh

set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

# Load api/.env into environment
if [ -f api/.env ]; then
  set -a
  # shellcheck source=/dev/null
  . "api/.env"
  set +a
  # asyncpg for SQLAlchemy async
  if [[ "${DATABASE_URL:-}" == postgresql://* ]] && [[ "${DATABASE_URL}" != *asyncpg* ]]; then
    export DATABASE_URL="$(echo "$DATABASE_URL" | sed 's|^postgresql://|postgresql+asyncpg://|')"
  fi
fi

export RUN_D33_PARALLEL_TEST=1
export SKIP_LIVE_DATA_CHECK=true

echo "=== D33 Parallel Create Test (G7R Batch5) ==="
# Run tests in separate invocations to avoid asyncio event-loop conflicts between tests
python3 -m pytest tests/unit/test_d33_parallel_create.py::test_parallel_create_same_user_one_create_one_conflict -v --tb=short || exit $?
python3 -m pytest tests/unit/test_d33_parallel_create.py::test_parallel_create_same_symbol_no_duplicate_tickers -v --tb=short || exit $?
echo "Exit code: 0 (both passed)"
