#!/bin/bash
# Preferences V4 Guardrails
# - Forbid direct fetch calls to /api/preferences/* (frontend) — enforce PreferencesData/Core usage
# - Enforce backend imports use routes/api/base_entity_decorators.require_authentication
#
# Exits with non‑zero status if violations are found.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

failures=0

echo -e "${YELLOW}Running Preferences V4 guardrails...${NC}"

# 1) Forbid direct fetch calls to /api/preferences/* in frontend JS (except whitelisted files)
#    Allowed files (whitelist): services/preferences-data.js, services/preferences-v4.js
echo "Checking for direct fetch('/api/preferences/*') usage..."
if command -v rg >/dev/null 2>&1; then
  FETCH_VIOLATIONS="$(rg -n --no-heading --hidden --glob '!node_modules/**' --glob 'trading-ui/scripts/**/*.js' "fetch\\(['\"]\\/api\\/preferences" | rg -v "trading-ui/scripts/services/preferences-data\\.js|trading-ui/scripts/services/preferences-v4\\.js" || true)"
else
  FETCH_VIOLATIONS="$(grep -RIn --exclude-dir=node_modules --include='*.js' "fetch('/api/preferences" trading-ui/scripts 2>/dev/null | grep -v -E "trading-ui/scripts/services/preferences-data\.js|trading-ui/scripts/services/preferences-v4\.js" || true)"
fi

if [[ -n "${FETCH_VIOLATIONS}" ]]; then
  echo -e "${RED}Disallowed direct fetch calls to /api/preferences/* detected:${NC}"
  echo "${FETCH_VIOLATIONS}"
  echo -e "${YELLOW}Use PreferencesData/PreferencesCore instead of direct fetch calls.${NC}"
  failures=$((failures + 1))
else
  echo -e "${GREEN}OK: No disallowed direct fetch calls found.${NC}"
fi

# 2) Backend imports guard: forbid importing non-existent security modules and enforce using base_entity_decorators
echo "Checking backend imports for authentication decorators..."
if command -v rg >/dev/null 2>&1; then
  BAD_SECURITY_IMPORTS="$(rg -n --no-heading --hidden --glob '!node_modules/**' --glob 'Backend/**/*.py' "from\\s+Backend\\.routes\\.api\\.security|from\\s+routes\\.api\\.security" || true)"
else
  BAD_SECURITY_IMPORTS="$(grep -RIn --exclude-dir=node_modules --include='*.py' -E "from[[:space:]]+Backend\.routes\.api\.security|from[[:space:]]+routes\.api\.security" Backend 2>/dev/null || true)"
fi

if [[ -n "${BAD_SECURITY_IMPORTS}" ]]; then
  echo -e "${RED}Disallowed backend security imports detected:${NC}"
  echo "${BAD_SECURITY_IMPORTS}"
  echo -e "${YELLOW}Use: from routes.api.base_entity_decorators import require_authentication${NC}"
  failures=$((failures + 1))
else
  echo -e "${GREEN}OK: No disallowed backend security imports found.${NC}"
fi

# 2b) Ensure preferences routes explicitly import require_authentication from base_entity_decorators
echo "Validating preferences routes import the canonical authentication decorator..."
if command -v rg >/dev/null 2>&1; then
  PREF_ROUTES_FILES="$(rg --files-with-matches --hidden --glob '!node_modules/**' --glob 'Backend/routes/api/*preferences*.py' '^' || true)"
else
  PREF_ROUTES_FILES="$(ls Backend/routes/api/*preferences*.py 2>/dev/null || true)"
fi

missing_imports=()
for f in ${PREF_ROUTES_FILES}; do
  if ! grep -q "from routes\\.api\\.base_entity_decorators import require_authentication" "$f"; then
    missing_imports+=("$f")
  fi
done

if [[ ${#missing_imports[@]} -gt 0 ]]; then
  echo -e "${RED}Missing canonical import in preferences routes:${NC}"
  printf '%s\n' "${missing_imports[@]}"
  echo -e "${YELLOW}Each preferences route file must import: from routes.api.base_entity_decorators import require_authentication${NC}"
  failures=$((failures + 1))
else
  echo -e "${GREEN}OK: Preferences routes import the canonical decorator.${NC}"
fi

if [[ $failures -gt 0 ]]; then
  echo -e "${RED}Preferences V4 guardrails failed with ${failures} issue(s).${NC}"
  exit 1
fi

echo -e "${GREEN}All Preferences V4 guardrails passed.${NC}"
exit 0


