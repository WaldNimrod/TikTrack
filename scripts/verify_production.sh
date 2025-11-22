#!/bin/bash

# TikTrack Production Verification Script
# =======================================
# 
# Verifies that production environment is correctly set up
# 
# Purpose: Check production files, structure, and configuration
# Location: scripts/verify_production.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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

# Check database
info "Checking database..."
check "Production DB" "[ -f \"$PRODUCTION_BACKEND/db/tiktrack.db\" ]" "tiktrack.db exists"

# Check for legacy dev DB (should NOT exist)
legacy_prefix="simpleTrade"
legacy_suffix="_new.db"
legacy_pattern="${legacy_prefix}${legacy_suffix}"
legacy_dev_count=$(find "$PRODUCTION_BACKEND/db" -maxdepth 1 -name "$legacy_pattern" | wc -l | tr -d ' ')
if [ "$legacy_dev_count" -gt 0 ]; then
    warn "Development DB" "${legacy_pattern} found in production (should not exist)"
fi

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

# Check for file differences
info "Checking for file differences..."
DEV_BACKEND="$PROJECT_ROOT/Backend"
different_files=()
missing_files=()

if [ -d "$DEV_BACKEND" ] && [ -d "$PRODUCTION_BACKEND" ]; then
    # Find Python files in dev
    while IFS= read -r dev_file; do
        rel_path="${dev_file#$DEV_BACKEND/}"
        prod_file="$PRODUCTION_BACKEND/$rel_path"
        
        # Skip certain files
        if [[ "$rel_path" == *"__pycache__"* ]] || [[ "$rel_path" == *".pyc"* ]]; then
            continue
        fi
        
        if [ ! -f "$prod_file" ]; then
            missing_files+=("$rel_path")
        elif [ -f "$dev_file" ] && [ -f "$prod_file" ]; then
            # Compare files (simple diff check)
            if ! cmp -s "$dev_file" "$prod_file" 2>/dev/null; then
                different_files+=("$rel_path")
            fi
        fi
    done < <(find "$DEV_BACKEND" -name "*.py" -type f | head -100)
    
    if [ ${#different_files[@]} -gt 0 ]; then
        warn "File Differences" "${#different_files[@]} files differ from development"
        echo "   First 5 different files:"
        for i in "${!different_files[@]}"; do
            if [ $i -lt 5 ]; then
                echo "     - ${different_files[$i]}"
            fi
        done
        if [ ${#different_files[@]} -gt 5 ]; then
            echo "     ... and $(( ${#different_files[@]} - 5 )) more"
        fi
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        warn "Missing Files" "${#missing_files[@]} files missing in production"
        echo "   First 5 missing files:"
        for i in "${!missing_files[@]}"; do
            if [ $i -lt 5 ]; then
                echo "     - ${missing_files[$i]}"
            fi
        done
        if [ ${#missing_files[@]} -gt 5 ]; then
            echo "     ... and $(( ${#missing_files[@]} - 5 )) more"
        fi
    fi
    
    if [ ${#different_files[@]} -eq 0 ] && [ ${#missing_files[@]} -eq 0 ]; then
        echo -e "${GREEN}✅${NC} All files synchronized"
    fi
fi

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

