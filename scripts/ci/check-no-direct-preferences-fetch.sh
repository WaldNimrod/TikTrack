#!/bin/bash
set -euo pipefail

# Fail on any direct fetch/axios calls to /api/preferences outside the V4 SDK
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🔎 Checking for direct calls to /api/preferences outside SDK..."

VIOLATIONS=$(rg -n --no-heading --glob '!trading-ui/scripts/services/preferences-v4.js' "fetch\\(['\"][^'\"]*/api/preferences|axios\\.(get|post|put|delete)\\s*\\(.*?/api/preferences" trading-ui || true)

if [[ -n "$VIOLATIONS" ]]; then
  echo "❌ Direct calls to /api/preferences detected:"
  echo "$VIOLATIONS"
  echo "Please use window.PreferencesV4 only."
  exit 1
fi

echo "✅ No direct /api/preferences calls outside SDK."



