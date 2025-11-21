#!/bin/bash

# Workflow Enforcement Script
# ============================
# אוכף תהליכי עבודה מסודרים לבידוד סביבות

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "=========================================="
echo "Workflow Enforcement Check"
echo "=========================================="
echo ""

# Get current environment
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"Production"* ]]; then
    ENVIRONMENT="production"
    echo -e "${BLUE}Detected environment: PRODUCTION${NC}"
else
    ENVIRONMENT="development"
    echo -e "${BLUE}Detected environment: DEVELOPMENT${NC}"
fi

echo ""

# Check 1: Git status
echo -e "${BLUE}Check 1: Git Status${NC}"
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --short | wc -l | tr -d ' ')
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${UNCOMMITTED} uncommitted changes found${NC}"
        echo "   Files:"
        git status --short | head -5 | sed 's/^/     /'
        if [ "$UNCOMMITTED" -gt 5 ]; then
            echo "     ... and $((UNCOMMITTED - 5)) more"
        fi
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
    
    # Check if on correct branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ "$CURRENT_BRANCH" != "production" ]; then
            echo -e "${RED}❌ Wrong branch for production: ${CURRENT_BRANCH}${NC}"
            echo "   Should be on 'production' branch"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ On correct branch: ${CURRENT_BRANCH}${NC}"
        fi
    else
        if [ "$CURRENT_BRANCH" = "production" ]; then
            echo -e "${RED}❌ Should not work on production branch in development${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ On development branch: ${CURRENT_BRANCH}${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Not a git repository${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check 2: Database environment variables
echo -e "${BLUE}Check 2: Database Environment Variables${NC}"
if [ -n "$POSTGRES_DB" ]; then
    echo -e "${GREEN}✅ POSTGRES_DB is set: ${POSTGRES_DB}${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ "$POSTGRES_DB" != "TikTrack-db-production" ]; then
            echo -e "${RED}❌ Wrong database for production: ${POSTGRES_DB}${NC}"
            echo "   Should be: TikTrack-db-production"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ Correct production database${NC}"
        fi
    else
        if [ "$POSTGRES_DB" = "TikTrack-db-production" ]; then
            echo -e "${RED}❌ Production database in development environment!${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ Correct development database${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  POSTGRES_DB not set${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check 3: Port check
echo -e "${BLUE}Check 3: Server Port${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    EXPECTED_PORT=5001
else
    EXPECTED_PORT=8080
fi

if lsof -i :$EXPECTED_PORT >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Port ${EXPECTED_PORT} is in use (expected for ${ENVIRONMENT})${NC}"
else
    echo -e "${YELLOW}⚠️  Port ${EXPECTED_PORT} is not in use${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for wrong port
if [ "$ENVIRONMENT" = "production" ]; then
    WRONG_PORT=8080
else
    WRONG_PORT=5001
fi

if lsof -i :$WRONG_PORT >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port ${WRONG_PORT} is also in use (might be other environment)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check 4: Direct changes to production (if in production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}Check 4: Direct Production Changes${NC}"
    
    # Check for uncommitted changes in production
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Uncommitted changes in production${NC}"
        echo "   Recommendation: Commit and push to production branch"
        echo "   Or: Revert changes if accidental"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ No direct changes detected${NC}"
    fi
    
    # Check if changes came from main
    if git log --oneline -5 | grep -q "merge.*main\|Merge.*main"; then
        echo -e "${GREEN}✅ Recent changes from main branch${NC}"
    else
        echo -e "${YELLOW}⚠️  No recent merge from main${NC}"
        echo "   Recommendation: Update from main before making changes"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""

# Check 5: Backup before changes (if in production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}Check 5: Backup Status${NC}"
    
    BACKUP_DIR="archive/database_backups"
    if [ -d "$BACKUP_DIR" ]; then
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/TikTrack-db-production_*.sql 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_AGE=$(($(date +%s) - $(stat -f %m "$LATEST_BACKUP" 2>/dev/null || echo 0)))
            BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))
            
            if [ "$BACKUP_AGE_HOURS" -lt 24 ]; then
                echo -e "${GREEN}✅ Recent backup found (${BACKUP_AGE_HOURS} hours ago)${NC}"
                echo "   File: $(basename "$LATEST_BACKUP")"
            else
                echo -e "${YELLOW}⚠️  Backup is ${BACKUP_AGE_HOURS} hours old${NC}"
                echo "   Recommendation: Create fresh backup before changes"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            echo -e "${YELLOW}⚠️  No production backup found${NC}"
            echo "   Recommendation: Create backup before making changes"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  Backup directory not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""

# Summary
echo "=========================================="
echo "Workflow Check Summary"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Workflow check passed!${NC}"
    echo ""
    echo "Recommendations:"
    echo "  - Continue following proper workflow"
    echo "  - Always test in development first"
    echo "  - Use Git for all changes"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Workflow check passed with ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Recommendations:"
    echo "  - Review warnings above"
    echo "  - Follow proper workflow (dev → main → prod)"
    echo "  - Create backups before production changes"
    exit 0
else
    echo -e "${RED}❌ Workflow check failed with ${ERRORS} error(s) and ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Critical issues:"
    echo "  - Fix errors above before proceeding"
    echo "  - Follow proper workflow"
    exit 1
fi

