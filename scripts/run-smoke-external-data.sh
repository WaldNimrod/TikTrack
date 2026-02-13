#!/usr/bin/env bash
# External Data — Smoke Run (PR/Commit: Suites A, B, D)
# TEAM_10_TO_TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
# Requires: backend 8082, DB (no frontend needed)

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== External Data Smoke (A, B, D) ==="
echo ""

FAILED=0

echo "--- Suite A: Contract & Schema ---"
python3 tests/external_data_suite_a_contract_schema.py || FAILED=1

echo ""
echo "--- Suite B: Cache-First + Failover ---"
python3 tests/external_data_suite_b_cache_failover.py || FAILED=1

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
