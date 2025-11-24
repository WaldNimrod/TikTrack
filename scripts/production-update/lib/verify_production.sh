#!/bin/bash

# TikTrack Production Verification Script
# =======================================
# 
# Verifies that production environment is correctly set up
# 
# Purpose: Check production files, structure, and configuration
# Location: scripts/verify_production.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PRODUCTION_BACKEND="$PROJECT_ROOT/production/Backend"

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

echo "=" * 60
echo "TikTrack Production Environment Verification"
echo "=" * 60
echo ""

# Check directory structure
info "Checking directory structure..."
check "Directory" "[ -d \"$PRODUCTION_BACKEND\" ]" "production/Backend/ exists"
check "Config" "[ -d \"$PRODUCTION_BACKEND/config\" ]" "config/ exists"
check "Routes" "[ -d \"$PRODUCTION_BACKEND/routes\" ]" "routes/ exists"
check "Services" "[ -d \"$PRODUCTION_BACKEND/services\" ]" "services/ exists"
check "Models" "[ -d \"$PRODUCTION_BACKEND/models\" ]" "models/ exists"
check "Utils" "[ -d \"$PRODUCTION_BACKEND/utils\" ]" "utils/ exists"
check "Scripts" "[ -d \"$PRODUCTION_BACKEND/scripts\" ]" "scripts/ exists"
check "DB Dir" "[ -d \"$PRODUCTION_BACKEND/db\" ]" "db/ exists"
check "Logs Dir" "[ -d \"$PRODUCTION_BACKEND/logs\" ]" "logs/ exists"

echo ""

# Check core files
info "Checking core files..."
check "app.py" "[ -f \"$PRODUCTION_BACKEND/app.py\" ]" "app.py exists"
check "requirements.txt" "[ -f \"$PRODUCTION_BACKEND/requirements.txt\" ]" "requirements.txt exists"
check "start_production.sh" "[ -f \"$PROJECT_ROOT/production/start_production.sh\" ]" "start_production.sh exists"

echo ""

# Check database connection (PostgreSQL)
info "Checking database..."
# Note: System uses PostgreSQL - no file-based DB check needed
# Database connection is verified via config.settings.DATABASE_URL
check "Database Config" "[ -f \"$PRODUCTION_BACKEND/config/settings.py\" ]" "settings.py exists"

echo ""

# Check for excluded files
info "Checking for excluded files..."
if [ -d "$PRODUCTION_BACKEND/tests" ]; then
    warn "Tests" "tests/ directory found (should not exist)"
fi

if [ -d "$PRODUCTION_BACKEND/migrations" ]; then
    warn "Migrations" "migrations/ directory found (should not exist)"
fi

# Count Python files
py_count=$(find "$PRODUCTION_BACKEND" -name "*.py" -not -path "*/__pycache__/*" | wc -l | tr -d ' ')
info "Found $py_count Python files"

echo ""

# Summary
echo "=" * 60
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Verification passed${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $warnings warnings${NC}"
    fi
    exit 0
else
    echo -e "${RED}❌ Verification failed: $errors errors${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $warnings warnings${NC}"
    fi
    exit 1
fi

