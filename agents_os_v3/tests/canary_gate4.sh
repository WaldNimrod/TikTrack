#!/usr/bin/env bash
# AOS v3 — GATE_4 Canary Bundle
# Team 00 — Principal gate-control script (v1.0.0 — 2026-03-28)
#
# Usage (from repo root):
#   bash agents_os_v3/tests/canary_gate4.sh
#
# With live API check:
#   AOS_V3_API_BASE=http://127.0.0.1:8090 bash agents_os_v3/tests/canary_gate4.sh
#
# With DB tests:
#   AOS_V3_DATABASE_URL=postgresql://... bash agents_os_v3/tests/canary_gate4.sh
#
# Blocks:
#   A — HTTP preflight: all 6 HTML pages + /api/health (if AOS_V3_API_BASE set)
#   B — Static smoke:   structural checks on flow.html, FILE_INDEX, design spec
#   C — API smoke:      TC-19..TC-26 + mock regression (skipped if no AOS_V3_DATABASE_URL)
#
# Exit: 0 if all non-skipped blocks PASS, 1 otherwise.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# ── colour helpers ─────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
pass() { echo -e "${GREEN}PASS${NC}"; }
fail() { echo -e "${RED}FAIL${NC}"; }
skip() { echo -e "${YELLOW}SKIP${NC}"; }

printf '\n══════════════════════════════════════════════\n'
printf '  AOS v3 — GATE_4 Canary Bundle  (v1.0.0)\n'
printf '  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')"
printf '══════════════════════════════════════════════\n\n'

OVERALL=0

# ── Block A — HTTP Preflight ──────────────────────────────────────────────────
printf '[A] Preflight (HTML pages'
if [[ -n "${AOS_V3_API_BASE:-}" ]]; then
  printf ' + API health'
fi
printf ')  ...'

PREFLIGHT_LOG="$(mktemp /tmp/aosv3-canary-preflight.XXXXXX)"

if AOS_V3_API_BASE="${AOS_V3_API_BASE:-}" \
   bash "${REPO_ROOT}/agents_os_v3/ui/run_preflight.sh" 8779 \
   >"${PREFLIGHT_LOG}" 2>&1; then
  pass
else
  fail
  OVERALL=1
  echo "    ↳ Preflight details:"
  sed 's/^/      /' "${PREFLIGHT_LOG}"
fi
rm -f "${PREFLIGHT_LOG}"

# ── Block B — Static Smoke (no DB) ───────────────────────────────────────────
printf '[B] Static smoke (flow.html / FILE_INDEX / design spec)  ...'

STATIC_LOG="$(mktemp /tmp/aosv3-canary-static.XXXXXX)"

if python3 -m pytest \
   "${REPO_ROOT}/agents_os_v3/tests/test_gate4_canary_smoke.py" \
   -q --tb=short \
   >"${STATIC_LOG}" 2>&1; then
  COUNT=$(grep -E '^[0-9]+ passed' "${STATIC_LOG}" | awk '{print $1}' || echo "?")
  printf ' (%s tests)  ' "${COUNT}"
  pass
else
  fail
  OVERALL=1
  echo "    ↳ Test output:"
  sed 's/^/      /' "${STATIC_LOG}"
fi
rm -f "${STATIC_LOG}"

# ── Block C — API Smoke (DB-dependent) ───────────────────────────────────────
printf '[C] API smoke (TC-19..TC-26 + mock regression)  ...'

if [[ -z "${AOS_V3_DATABASE_URL:-}" ]]; then
  skip
  echo "    ↳ Set AOS_V3_DATABASE_URL to enable DB-backed API tests."
else
  API_LOG="$(mktemp /tmp/aosv3-canary-api.XXXXXX)"
  if python3 -m pytest \
     "${REPO_ROOT}/agents_os_v3/tests/test_gate4_tc19_26_api.py" \
     "${REPO_ROOT}/agents_os_v3/tests/test_gate4_ui_mock_regression.py" \
     -q --tb=short \
     >"${API_LOG}" 2>&1; then
    COUNT=$(grep -E '^[0-9]+ passed' "${API_LOG}" | awk '{print $1}' || echo "?")
    printf ' (%s tests)  ' "${COUNT}"
    pass
  else
    fail
    OVERALL=1
    echo "    ↳ Test output:"
    sed 's/^/      /' "${API_LOG}"
  fi
  rm -f "${API_LOG}"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
printf '\n──────────────────────────────────────────────\n'
if [[ "${OVERALL}" -eq 0 ]]; then
  printf "  RESULT: ${GREEN}✅  CANARY PASS${NC} — proceed to UX review\n"
  printf '  → Open: http://localhost:8091/flow.html\n'
  printf '  → Open: http://localhost:8091/index.html\n'
  printf '  → Fill: _COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md\n'
else
  printf "  RESULT: ${RED}❌  CANARY FAIL${NC} — fix issues above before UX review\n"
fi
printf '══════════════════════════════════════════════\n\n'

exit "${OVERALL}"
