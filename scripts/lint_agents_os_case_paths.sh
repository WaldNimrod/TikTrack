#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail_count=0

echo "AGENTS-OS-CASE-LINT: enforcing canonical lowercase root 'agents_os/'"

upper_tracked="$(git ls-files | rg -s '^Agents_OS/' || true)"
if [[ -n "$upper_tracked" ]]; then
  echo "FAIL: tracked files found under non-canonical root 'Agents_OS/':"
  echo "$upper_tracked"
  fail_count=$((fail_count + 1))
else
  echo "PASS: no tracked files under 'Agents_OS/'"
fi

active_scope_hits="$(rg -n -s --glob '!scripts/lint_agents_os_case_paths.sh' 'Agents_OS/|from Agents_OS|import Agents_OS|python3 -m pytest Agents_OS/tests|root / \"Agents_OS\"|p\\.name == \"Agents_OS\"|p\\.name != \"Agents_OS\"' agents_os scripts .github/workflows || true)"
if [[ -n "$active_scope_hits" ]]; then
  echo "FAIL: non-canonical uppercase Agents_OS references found in active code/CI scope:"
  echo "$active_scope_hits"
  fail_count=$((fail_count + 1))
else
  echo "PASS: active code/CI scope uses lowercase 'agents_os' only"
fi

if [[ "$fail_count" -gt 0 ]]; then
  echo "AGENTS-OS-CASE-LINT RESULT: FAIL ($fail_count findings)"
  exit 1
fi

echo "AGENTS-OS-CASE-LINT RESULT: PASS"
