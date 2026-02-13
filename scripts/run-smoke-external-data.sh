#!/usr/bin/env bash
# External Data — Smoke Run (PR/Commit: Suites A, B, D)
# TEAM_10_TO_TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
# Requires: DB (optional). Suite B uses REPLAY mode — no backend needed.

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== External Data Smoke (A, B, D) ==="
echo ""

FAILED=0

echo "--- Suite A: Contract & Schema ---"
python3 tests/external_data_suite_a_contract_schema.py || FAILED=1

echo ""
echo "--- Suite B: Cache-First + Failover (REPLAY) ---"
python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v -q || FAILED=1

echo ""
echo "--- Suite D: Retention & Cleanup ---"
python3 tests/test_retention_cleanup_suite_d.py || FAILED=1

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "✅ Smoke PASS"
  exit 0
else
  echo "❌ Smoke FAIL"
  exit 1
fi
