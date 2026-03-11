#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required_paths=(
  ".cursorrules"
  "00_MASTER_INDEX.md"
  "documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md"
  "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"
  "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md"
  "documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md"
  "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md"
  "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md"
  "documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md"
  "documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md"
)

forbidden_active_refs=(
  "documentation/docs-governance/PHOENIX_CANONICAL/"
)

scan_files=(
  ".cursorrules"
  "00_MASTER_INDEX.md"
)

missing_count=0
forbidden_count=0

echo "== Source Authority Bootstrap Lint =="
echo "workspace: $ROOT_DIR"
echo

echo "[1/2] Required path existence checks"
for path in "${required_paths[@]}"; do
  if [[ -e "$path" ]]; then
    echo "PASS exists: $path"
  else
    echo "FAIL missing: $path"
    missing_count=$((missing_count + 1))
  fi
done

echo
echo "[2/2] Forbidden legacy alias checks in active bootstrap files"
for pattern in "${forbidden_active_refs[@]}"; do
  if rg -n --fixed-strings "$pattern" "${scan_files[@]}" >/tmp/source_authority_lint_all_hits.txt 2>/dev/null; then
    grep -Ev "deprecated_alias_notice|deprecation|legacy|deprecated" /tmp/source_authority_lint_all_hits.txt >/tmp/source_authority_lint_hits.txt || true
  fi

  if [[ -s /tmp/source_authority_lint_hits.txt ]]; then
    echo "FAIL forbidden alias found: $pattern"
    cat /tmp/source_authority_lint_hits.txt
    forbidden_count=$((forbidden_count + 1))
  else
    echo "PASS alias absent: $pattern"
  fi
done

echo
if [[ "$missing_count" -eq 0 && "$forbidden_count" -eq 0 ]]; then
  echo "RESULT: PASS (missing=0 forbidden=0)"
  exit 0
fi

echo "RESULT: FAIL (missing=$missing_count forbidden=$forbidden_count)"
exit 1
