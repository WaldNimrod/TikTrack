#!/bin/bash

# Production Migration Prerequisites Check
# ========================================
# בודק את כל הדרישות המוקדמות למיגרציה של הפרודקשן

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
echo "Production Migration Prerequisites Check"
echo "=========================================="
echo ""

# 1. Docker container
echo -e "${BLUE}Check 1: Docker Container${NC}"
if docker ps --format '{{.Names}}' | grep -q 'tiktrack-postgres-dev'; then
    container_status=$(docker ps --filter "name=tiktrack-postgres-dev" --format '{{.Status}}')
    echo -e "${GREEN}✅ Docker container is running: ${container_status}${NC}"
    
    if echo "$container_status" | grep -q 'healthy'; then
        echo -e "${GREEN}✅ Container is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Container is running but not yet healthy${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Docker container 'tiktrack-postgres-dev' is NOT running${NC}"
    echo "   To start: docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 2. Development database
echo -e "${BLUE}Check 2: Development Database${NC}"
if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "TikTrack-db-development"; then
    echo -e "${GREEN}✅ Development database exists${NC}"
    
    # Test connection
    if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection works${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Development database does NOT exist${NC}"
    echo "   The production migration requires the development database to be working"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 3. Migration scripts
echo -e "${BLUE}Check 3: Migration Scripts${NC}"
MISSING_SCRIPTS=0

if [ ! -f "scripts/db/migrate_production_to_pg.py" ]; then
    echo -e "${RED}❌ migrate_production_to_pg.py is missing${NC}"
    MISSING_SCRIPTS=$((MISSING_SCRIPTS + 1))
fi

if [ ! -f "scripts/db/setup_production_postgresql.sh" ]; then
    echo -e "${RED}❌ setup_production_postgresql.sh is missing${NC}"
    MISSING_SCRIPTS=$((MISSING_SCRIPTS + 1))
fi

if [ ! -f "scripts/db/backup_postgresql_production.sh" ]; then
    echo -e "${RED}❌ backup_postgresql_production.sh is missing${NC}"
    MISSING_SCRIPTS=$((MISSING_SCRIPTS + 1))
fi

if [ ! -f "scripts/db/verify_production_setup.sh" ]; then
    echo -e "${RED}❌ verify_production_setup.sh is missing${NC}"
    MISSING_SCRIPTS=$((MISSING_SCRIPTS + 1))
fi

if [ $MISSING_SCRIPTS -eq 0 ]; then
    echo -e "${GREEN}✅ All migration scripts exist${NC}"
else
    echo -e "${RED}❌ Missing ${MISSING_SCRIPTS} script(s)${NC}"
    ERRORS=$((ERRORS + MISSING_SCRIPTS))
fi

echo ""

# 4. Script permissions
echo -e "${BLUE}Check 4: Script Permissions${NC}"
FIXED_PERMS=0

for script in scripts/db/*.sh; do
    if [ -f "$script" ] && [ ! -x "$script" ]; then
        echo -e "${YELLOW}⚠️  Setting execute permission on $(basename $script)${NC}"
        chmod +x "$script"
        FIXED_PERMS=$((FIXED_PERMS + 1))
    fi
done

if [ $FIXED_PERMS -eq 0 ]; then
    echo -e "${GREEN}✅ All scripts have execute permissions${NC}"
else
    echo -e "${YELLOW}⚠️  Fixed permissions on ${FIXED_PERMS} script(s)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 5. Python syntax check
echo -e "${BLUE}Check 5: Python Script Syntax${NC}"
if python3 -m py_compile scripts/db/migrate_production_to_pg.py 2>/dev/null; then
    echo -e "${GREEN}✅ migrate_production_to_pg.py syntax is valid${NC}"
else
    echo -e "${RED}❌ migrate_production_to_pg.py has syntax errors${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 6. Bash syntax check
echo -e "${BLUE}Check 6: Bash Script Syntax${NC}"
BASH_ERRORS=0

for script in scripts/db/*.sh; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            echo -e "${GREEN}✅ $(basename $script) syntax is valid${NC}"
        else
            echo -e "${RED}❌ $(basename $script) has syntax errors${NC}"
            BASH_ERRORS=$((BASH_ERRORS + 1))
        fi
    fi
done

if [ $BASH_ERRORS -gt 0 ]; then
    ERRORS=$((ERRORS + BASH_ERRORS))
fi

echo ""

# 7. Python dependencies
echo -e "${BLUE}Check 7: Python Dependencies${NC}"
if python3 -c "import sqlalchemy, psycopg2" 2>/dev/null; then
    echo -e "${GREEN}✅ All Python dependencies available${NC}"
else
    echo -e "${RED}❌ Missing Python dependencies${NC}"
    echo "   Install with: pip install psycopg2-binary sqlalchemy"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 8. Docker access
echo -e "${BLUE}Check 8: Docker Access${NC}"
if docker ps >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker access works${NC}"
    
    # Test PostgreSQL access (try connecting to postgres database first)
    if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d postgres -c "SELECT version();" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL access works${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL access test failed (may be normal if database doesn't exist yet)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Docker access failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 9. Directory structure
echo -e "${BLUE}Check 9: Directory Structure${NC}"
if [ -d "scripts/db" ]; then
    echo -e "${GREEN}✅ scripts/db directory exists${NC}"
else
    echo -e "${RED}❌ scripts/db directory is missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Create backup directory if needed
if [ ! -d "archive/database_backups" ]; then
    echo -e "${YELLOW}⚠️  Creating archive/database_backups directory${NC}"
    mkdir -p archive/database_backups
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ archive/database_backups directory exists${NC}"
fi

echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All prerequisites met!${NC}"
    echo ""
    echo "You can proceed with the production migration."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Prerequisites met with ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "You can proceed with the production migration, but review the warnings above."
    exit 0
else
    echo -e "${RED}❌ Prerequisites check failed with ${ERRORS} error(s) and ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding with the production migration."
    exit 1
fi

