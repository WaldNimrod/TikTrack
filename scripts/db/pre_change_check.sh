#!/bin/bash

# Pre-Change Safety Check
# ========================
# בודק בטיחות לפני ביצוע שינויים

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Pre-Change Safety Check"
echo "=========================================="
echo ""

# Get current environment
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"Production"* ]]; then
    ENVIRONMENT="production"
    echo -e "${RED}⚠️  PRODUCTION ENVIRONMENT DETECTED${NC}"
else
    ENVIRONMENT="development"
    echo -e "${BLUE}Development environment detected${NC}"
fi

echo ""

# Check 1: Git status
echo -e "${BLUE}Check 1: Git Status${NC}"
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --short | wc -l | tr -d ' ')
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${UNCOMMITTED} uncommitted changes${NC}"
        read -p "Do you want to commit changes before proceeding? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Please commit changes first:"
            echo "  git add ."
            echo "  git commit -m 'Your message'"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
else
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

echo ""

# Check 2: Database backup (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}Check 2: Database Backup (REQUIRED for production)${NC}"
    
    BACKUP_DIR="archive/database_backups"
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    echo "Creating backup before changes..."
    if [ -f "scripts/db/backup_postgresql_production.sh" ]; then
        ./scripts/db/backup_postgresql_production.sh
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backup created successfully${NC}"
        else
            echo -e "${RED}❌ Backup failed!${NC}"
            read -p "Continue without backup? (NOT RECOMMENDED) (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Backup script not found${NC}"
        read -p "Continue without backup? (NOT RECOMMENDED) (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo ""

# Check 3: Database environment
echo -e "${BLUE}Check 3: Database Environment${NC}"
if [ -n "$POSTGRES_DB" ]; then
    echo "Current database: $POSTGRES_DB"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ "$POSTGRES_DB" != "TikTrack-db-production" ]; then
            echo -e "${RED}❌ WRONG DATABASE FOR PRODUCTION!${NC}"
            echo "   Current: $POSTGRES_DB"
            echo "   Expected: TikTrack-db-production"
            read -p "Continue anyway? (NOT RECOMMENDED) (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            echo -e "${GREEN}✅ Correct production database${NC}"
        fi
    else
        if [ "$POSTGRES_DB" = "TikTrack-db-production" ]; then
            echo -e "${RED}❌ PRODUCTION DATABASE IN DEVELOPMENT!${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Correct development database${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  POSTGRES_DB not set${NC}"
fi

echo ""

# Check 4: Confirmation (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${RED}=========================================="
    echo "⚠️  PRODUCTION ENVIRONMENT WARNING ⚠️"
    echo "==========================================${NC}"
    echo ""
    echo "You are about to make changes in PRODUCTION environment."
    echo ""
    echo "Have you:"
    echo "  [ ] Tested changes in development?"
    echo "  [ ] Committed all changes to Git?"
    echo "  [ ] Created a backup?"
    echo "  [ ] Verified the correct database?"
    echo ""
    read -p "Are you sure you want to proceed? (type 'yes' to continue): " -r
    echo
    if [ "$REPLY" != "yes" ]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Pre-change checks passed${NC}"
echo "Proceeding with changes..."

