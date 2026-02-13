#!/usr/bin/env bash
# External Data — Nightly Run (Full: Suites A–E)
# TEAM_10_TO_TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
# Requires: backend 8082, frontend 8080 (for Suite E), DB

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== External Data Nightly (A–E) ==="
echo ""

FAILED=0

echo "--- Suite A: Contract & Schema ---"
python3 tests/external_data_suite_a_contract_schema.py || FAILED=1

echo ""
echo "--- Suite B: Cache-First + Failover (REPLAY) ---"
python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v -q || FAILED=1

echo ""
echo "--- Suite C: Cadence & Status ---"
python3 tests/external_data_suite_c_cadence.py || FAILED=1

echo ""
echo "--- Suite D: Retention & Cleanup ---"
python3 tests/test_retention_cleanup_suite_d.py || FAILED=1

echo ""
echo "--- Suite E: UI (Clock + Tooltip) ---"
(cd tests && npm run test:external-data-suite-e) || FAILED=1

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "✅ Nightly PASS"
  exit 0
else
  echo "❌ Nightly FAIL"
  exit 1
fi
