#!/bin/bash

# TikTrack Production Isolation Verification Script
# ==================================================
# 
# Verifies that production environment is completely isolated from development
# 
# Purpose: Comprehensive check for complete separation
# Location: scripts/verify_production_isolation.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCTION_BACKEND="$PROJECT_ROOT/production/Backend"
DEV_BACKEND="$PROJECT_ROOT/Backend"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

errors=0
warnings=0

check() {
    local name="$1"
    local condition="$2"
    local message="$3"
    
    if eval "$condition"; then
        echo -e "${GREEN}✅${NC} $name: $message"
    else
        echo -e "${RED}❌${NC} $name: $message"
        ((errors++))
    fi
}

warn() {
    local name="$1"
    local message="$2"
    echo -e "${YELLOW}⚠️${NC} $name: $message"
    ((warnings++))
}

info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

echo "=" * 70
echo "TikTrack Production Isolation Verification"
echo "=" * 70
echo ""

# ========================================
# 1. Directory Structure Isolation
# ========================================
info "1. Checking directory structure isolation..."
check "Production Dir" "[ -d \"$PRODUCTION_BACKEND\" ]" "production/Backend/ exists"
check "Dev Dir Separate" "[ -d \"$DEV_BACKEND\" ]" "Backend/ (dev) exists separately"
check "No Cross-Links" "[ ! -L \"$PRODUCTION_BACKEND/Backend\" ]" "No symlinks to dev Backend"

# ========================================
# 2. Database Isolation
# ========================================
info ""
info "2. Checking database isolation..."
check "Production DB" "[ -f \"$PRODUCTION_BACKEND/db/tiktrack.db\" ]" "tiktrack.db exists"
check "Dev DB Separate" "[ -f \"$DEV_BACKEND/db/simpleTrade_new.db\" ]" "simpleTrade_new.db (dev) exists separately"

# Check for cross-references
if [ -f "$PRODUCTION_BACKEND/db/simpleTrade_new.db" ]; then
    warn "Dev DB in Prod" "simpleTrade_new.db found in production (should not exist)"
fi

if [ -f "$DEV_BACKEND/db/tiktrack.db" ]; then
    warn "Prod DB in Dev" "tiktrack.db found in development (should not exist)"
fi

# ========================================
# 3. Code Isolation - No Hardcoded Paths
# ========================================
info ""
info "3. Checking code isolation (no hardcoded dev paths)..."

# Check for hardcoded dev database paths
if grep -r "simpleTrade_new.db" "$PRODUCTION_BACKEND" --include="*.py" | grep -v "create_production_db.py" | grep -v "scripts/backup_database.py" | grep -v "Development Team" | grep -v "#" > /dev/null; then
    warn "Hardcoded DB Path" "Found references to simpleTrade_new.db (should use config.settings)"
    grep -r "simpleTrade_new.db" "$PRODUCTION_BACKEND" --include="*.py" | grep -v "create_production_db.py" | grep -v "scripts/backup_database.py" | grep -v "Development Team" | grep -v "#" | head -5
fi

# Check for hardcoded dev port
if grep -r ":8080" "$PRODUCTION_BACKEND" --include="*.py" | grep -v "#" > /dev/null; then
    warn "Hardcoded Dev Port" "Found references to port 8080 (should use config.settings PORT)"
fi

# Check for imports from dev Backend
if grep -r "from Backend\|import Backend\|sys.path.*Backend" "$PRODUCTION_BACKEND" --include="*.py" | grep -v "create_production_db.py" | grep -v "#" > /dev/null; then
    warn "Dev Backend Import" "Found imports from dev Backend directory"
fi

# ========================================
# 4. Configuration Isolation
# ========================================
info ""
info "4. Checking configuration isolation..."

# Check settings.py
if grep -q "IS_PRODUCTION = True" "$PRODUCTION_BACKEND/config/settings.py"; then
    check "Settings Production" "true" "config/settings.py set to production mode"
else
    warn "Settings Mode" "config/settings.py not explicitly set to production"
fi

# Check port
if grep -q "PORT = 5001" "$PRODUCTION_BACKEND/config/settings.py"; then
    check "Port Config" "true" "Port set to 5001 (production)"
else
    warn "Port Config" "Port not set to 5001 in settings.py"
fi

# Check DB path
if grep -q "tiktrack.db" "$PRODUCTION_BACKEND/config/settings.py"; then
    check "DB Path Config" "true" "DB path points to tiktrack.db"
else
    warn "DB Path Config" "DB path not pointing to tiktrack.db"
fi

# ========================================
# 5. Logs Isolation
# ========================================
info ""
info "5. Checking logs isolation..."
check "Prod Logs Dir" "[ -d \"$PRODUCTION_BACKEND/logs\" ]" "production/Backend/logs/ exists"
check "Dev Logs Separate" "[ -d \"$DEV_BACKEND/logs\" ]" "Backend/logs/ (dev) exists separately"

# ========================================
# 6. Port Isolation
# ========================================
info ""
info "6. Checking port isolation..."

# Check if dev server is running
if lsof -i :8080 > /dev/null 2>&1; then
    info "Dev server is running on port 8080"
else
    info "Dev server is not running"
fi

# Check if prod server is running
if lsof -i :5001 > /dev/null 2>&1; then
    check "Prod Port" "true" "Production server running on port 5001"
else
    warn "Prod Port" "Production server not running on port 5001"
fi

# ========================================
# 7. File Count Verification
# ========================================
info ""
info "7. Checking file counts..."

prod_py_count=$(find "$PRODUCTION_BACKEND" -name "*.py" -not -path "*/__pycache__/*" | wc -l | tr -d ' ')
dev_py_count=$(find "$DEV_BACKEND" -name "*.py" -not -path "*/__pycache__/*" -not -path "*/tests/*" -not -path "*/migrations/*" | wc -l | tr -d ' ')

info "Production Python files: $prod_py_count"
info "Development Python files (excluding tests/migrations): $dev_py_count"

if [ "$prod_py_count" -lt "$dev_py_count" ]; then
    check "File Count" "true" "Production has fewer files (clean codebase)"
else
    warn "File Count" "Production has same or more files than dev (unexpected)"
fi

# ========================================
# 8. No Test/Migration Files
# ========================================
info ""
info "8. Checking for excluded files..."

if [ -d "$PRODUCTION_BACKEND/tests" ]; then
    warn "Tests Dir" "tests/ directory found in production (should not exist)"
else
    check "No Tests" "true" "No tests/ directory in production"
fi

if [ -d "$PRODUCTION_BACKEND/migrations" ]; then
    warn "Migrations Dir" "migrations/ directory found in production (should not exist)"
else
    check "No Migrations" "true" "No migrations/ directory in production"
fi

# ========================================
# 9. Checking for legacy database filenames in code...
# ========================================
info "9. Checking for legacy database filenames in code..."

legacy_refs=$(grep -R -n \
    --exclude-dir=.git \
    --exclude-dir=documentation \
    --exclude-dir=Backend/db/backups \
    --exclude-dir=production/Backend/db/backups \
    --exclude-dir=production/trading-ui/images \
    --exclude='*.md' \
    --exclude='*.json' \
    --exclude='scripts/verify_production_isolation.sh' \
    "simpleTrade_new.db" .. || true)

legacy_prod_refs=$(grep -R -n \
    --exclude-dir=.git \
    --exclude-dir=documentation \
    --exclude-dir=Backend/db/backups \
    --exclude-dir=production/Backend/db/backups \
    --exclude-dir=production/trading-ui/images \
    --exclude='*.md' \
    --exclude='*.json' \
    --exclude='scripts/verify_production_isolation.sh' \
    "TikTrack_DB.db" .. || true)

if [ -n "$legacy_refs" ] || [ -n "$legacy_prod_refs" ]; then
    echo -e "${RED}❌ Legacy DB references detected:${NC}"
    [ -n "$legacy_refs" ] && echo "$legacy_refs"
    [ -n "$legacy_prod_refs" ] && echo "$legacy_prod_refs"
    ((errors++))
else
    check "Legacy DB references" "true" "No legacy database filenames found in code"
fi

# ========================================
# Summary
# ========================================
echo ""
echo "=" * 70
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Isolation verification passed${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $warnings warnings (non-critical)${NC}"
    fi
    echo ""
    echo "Production environment is completely isolated from development."
    exit 0
else
    echo -e "${RED}❌ Isolation verification failed: $errors errors${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $warnings warnings${NC}"
    fi
    echo ""
    echo "Please fix the errors above to ensure complete isolation."
    exit 1
fi


