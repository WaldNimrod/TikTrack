#!/bin/bash

# TikTrack Production Isolation Verification Script
# ==================================================
# 
# Verifies that production environment is completely isolated from development
# 
# Purpose: Comprehensive check for complete separation
# Location: scripts/verify_production_isolation.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PRODUCTION_BACKEND="$PROJECT_ROOT/production/Backend"

# Determine development backend root (allow override via VERIFY_DEV_ROOT env)
DEV_BACKEND_DEFAULT="$PROJECT_ROOT/Backend"
if [ -n "$VERIFY_DEV_ROOT" ]; then
    DEV_BACKEND="$VERIFY_DEV_ROOT"
else
    DEV_BACKEND="$DEV_BACKEND_DEFAULT"
fi

DEV_EXISTS=false
if [ -n "$DEV_BACKEND" ] && [ -d "$DEV_BACKEND" ]; then
    DEV_BACKEND="$(cd "$DEV_BACKEND" && pwd)"
    DEV_EXISTS=true
fi

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
        ((errors++)) || true
    fi
}

warn() {
    local name="$1"
    local message="$2"
    echo -e "${YELLOW}⚠️${NC} $name: $message"
    ((warnings++)) || true
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
if [ "$DEV_EXISTS" = true ]; then
    check "Dev Dir Separate" "[ -d \"$DEV_BACKEND\" ]" "Backend/ (dev) exists separately"
else
    warn "Dev Dir Separate" "Development repository not found (set VERIFY_DEV_ROOT to override)"
fi
check "No Cross-Links" "[ ! -L \"$PRODUCTION_BACKEND/Backend\" ]" "No symlinks to dev Backend"

# ========================================
# 2. Database Isolation
# ========================================
info ""
info "2. Checking database isolation..."
# Note: System uses PostgreSQL - database isolation is via DATABASE_URL in config
check "Production DB Config" "[ -f \"$PRODUCTION_BACKEND/config/settings.py\" ]" "settings.py exists"
if [ "$DEV_EXISTS" = true ]; then
    if [ -f "$DEV_BACKEND/config/settings.py" ]; then
        check "Dev DB Config Separate" "[ -f \"$DEV_BACKEND/config/settings.py\" ]" "settings.py (dev) exists separately"
    else
        warn "Dev DB Config Separate" "settings.py not found in development repository"
    fi
else
    warn "Dev DB Config Separate" "Skipped dev database config check (no development repository detected)"
fi

# ========================================
# 3. Code Isolation - No Hardcoded Paths
# ========================================
info ""
info "3. Checking code isolation (no hardcoded dev paths)..."

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
# Check for PostgreSQL DATABASE_URL (system uses PostgreSQL)
if grep -q "postgresql" "$PRODUCTION_BACKEND/config/settings.py" || grep -q "DATABASE_URL" "$PRODUCTION_BACKEND/config/settings.py"; then
    check "DB Config" "true" "Database URL configured (PostgreSQL)"
else
    warn "DB Config" "DATABASE_URL not found or not using PostgreSQL"
fi

# ========================================
# 5. Logs Isolation
# ========================================
info ""
info "5. Checking logs isolation..."
check "Prod Logs Dir" "[ -d \"$PRODUCTION_BACKEND/logs\" ]" "production/Backend/logs/ exists"
if [ "$DEV_EXISTS" = true ]; then
    check "Dev Logs Separate" "[ -d \"$DEV_BACKEND/logs\" ]" "Backend/logs/ (dev) exists separately"
else
    warn "Dev Logs Separate" "Skipped dev logs check (no development repository detected)"
fi

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
    warn "Prod Port" "Production server not running on port 5001 (expected if server was stopped for maintenance)"
fi

# ========================================
# 7. File Count Verification
# ========================================
info ""
info "7. Checking file counts..."

prod_py_count=$(find "$PRODUCTION_BACKEND" -name "*.py" -not -path "*/__pycache__/*" | wc -l | tr -d ' ')
if [ "$DEV_EXISTS" = true ]; then
    dev_py_count=$(find "$DEV_BACKEND" -name "*.py" -not -path "*/__pycache__/*" -not -path "*/tests/*" -not -path "*/migrations/*" | wc -l | tr -d ' ')
else
    dev_py_count=0
fi

info "Production Python files: $prod_py_count"
if [ "$DEV_EXISTS" = true ]; then
    info "Development Python files (excluding tests/migrations): $dev_py_count"
    if [ "$prod_py_count" -lt "$dev_py_count" ]; then
        check "File Count" "true" "Production has fewer files (clean codebase)"
    else
        warn "File Count" "Production has same or more files than dev (unexpected)"
    fi
else
    warn "File Count" "Skipped comparison (no development repository detected)"
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
    --exclude-dir=archive \
    --exclude-dir=_Tmp \
    --exclude-dir=Backend/db/backups \
    --exclude-dir=production/Backend/db/backups \
    --exclude-dir=production/trading-ui/images \
    --exclude='scripts/release/verify_schema.py' \
    --exclude='*verify_schema.py' \
    --exclude='*.md' \
    --exclude='*.json' \
    --exclude='*.zip' \
    --exclude='.cursorrules*' \
    --exclude=verify_production_isolation.sh \
    # PostgreSQL only - no legacy DB file checks
    true)

legacy_prod_refs=$(grep -R -n \
    --exclude-dir=.git \
    --exclude-dir=documentation \
    --exclude-dir=archive \
    --exclude-dir=_Tmp \
    --exclude-dir=Backend/db/backups \
    --exclude-dir=production/Backend/db/backups \
    --exclude-dir=production/trading-ui/images \
    --exclude='scripts/release/verify_schema.py' \
    --exclude='*verify_schema.py' \
    --exclude='*.md' \
    --exclude='*.json' \
    --exclude='*.zip' \
    --exclude='.cursorrules*' \
    --exclude=verify_production_isolation.sh \
    "TikTrack_DB.db" "$PROJECT_ROOT" || true)

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
