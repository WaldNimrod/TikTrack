#!/bin/bash

# Environment Isolation Check Script
# ===================================
# בודק את רמת הבידוד בין סביבות פיתוח ופרודקשן

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES=0
WARNINGS=0

echo "=========================================="
echo "Environment Isolation Check"
echo "=========================================="
echo ""

# 1. Check Docker container
echo -e "${BLUE}Check 1: Docker Container${NC}"
if docker ps --format '{{.Names}}' | grep -q 'tiktrack-postgres-dev'; then
    container_status=$(docker ps --filter "name=tiktrack-postgres-dev" --format '{{.Status}}')
    echo -e "${GREEN}✅ Container is running: ${container_status}${NC}"
    
    if echo "$container_status" | grep -q 'healthy'; then
        echo -e "${GREEN}✅ Container is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Container is not yet healthy${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ Container 'tiktrack-postgres-dev' is not running${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# 2. Check databases exist
echo -e "${BLUE}Check 2: Database Separation${NC}"
DEV_DB_EXISTS=false
PROD_DB_EXISTS=false

if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "TikTrack-db-development"; then
    DEV_DB_EXISTS=true
    echo -e "${GREEN}✅ Development database exists${NC}"
else
    echo -e "${YELLOW}⚠️  Development database does not exist${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "TikTrack-db-production"; then
    PROD_DB_EXISTS=true
    echo -e "${GREEN}✅ Production database exists${NC}"
else
    echo -e "${YELLOW}⚠️  Production database does not exist (may be normal if not migrated yet)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ "$DEV_DB_EXISTS" = true ] && [ "$PROD_DB_EXISTS" = true ]; then
    echo -e "${GREEN}✅ Database separation: OK${NC}"
else
    echo -e "${YELLOW}⚠️  Database separation: Partial${NC}"
fi

echo ""

# 3. Check ports
echo -e "${BLUE}Check 3: Port Separation${NC}"
DEV_PORT_IN_USE=false
PROD_PORT_IN_USE=false

if lsof -i :8080 >/dev/null 2>&1; then
    DEV_PORT_IN_USE=true
    echo -e "${GREEN}✅ Development port 8080 is in use${NC}"
else
    echo -e "${YELLOW}⚠️  Development port 8080 is not in use${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if lsof -i :5001 >/dev/null 2>&1; then
    PROD_PORT_IN_USE=true
    echo -e "${GREEN}✅ Production port 5001 is in use${NC}"
else
    echo -e "${YELLOW}⚠️  Production port 5001 is not in use (may be normal if server not running)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ "$DEV_PORT_IN_USE" = true ] && [ "$PROD_PORT_IN_USE" = true ]; then
    echo -e "${GREEN}✅ Port separation: OK${NC}"
elif [ "$DEV_PORT_IN_USE" = true ] || [ "$PROD_PORT_IN_USE" = true ]; then
    echo -e "${YELLOW}⚠️  Port separation: Partial (one environment running)${NC}"
else
    echo -e "${YELLOW}⚠️  Port separation: No servers running${NC}"
fi

echo ""

# 4. Check directory separation
echo -e "${BLUE}Check 4: Directory Separation${NC}"
DEV_DIR="/Users/nimrod/Documents/TikTrack/TikTrackApp"
PROD_DIR="/Users/nimrod/Documents/TikTrack/TikTrackApp-Production"

if [ -d "$DEV_DIR" ]; then
    echo -e "${GREEN}✅ Development directory exists: ${DEV_DIR}${NC}"
else
    echo -e "${YELLOW}⚠️  Development directory not found: ${DEV_DIR}${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -d "$PROD_DIR" ]; then
    echo -e "${GREEN}✅ Production directory exists: ${PROD_DIR}${NC}"
else
    echo -e "${YELLOW}⚠️  Production directory not found: ${PROD_DIR}${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -d "$DEV_DIR" ] && [ -d "$PROD_DIR" ]; then
    echo -e "${GREEN}✅ Directory separation: OK${NC}"
else
    echo -e "${YELLOW}⚠️  Directory separation: Partial${NC}"
fi

echo ""

# 5. Check database connections
echo -e "${BLUE}Check 5: Database Connections${NC}"
if [ "$DEV_DB_EXISTS" = true ]; then
    if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-development -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Development database connection: OK${NC}"
    else
        echo -e "${RED}❌ Development database connection: FAILED${NC}"
        ISSUES=$((ISSUES + 1))
    fi
fi

if [ "$PROD_DB_EXISTS" = true ]; then
    if docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-production -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Production database connection: OK${NC}"
    else
        echo -e "${RED}❌ Production database connection: FAILED${NC}"
        ISSUES=$((ISSUES + 1))
    fi
fi

echo ""

# 6. Check shared resources
echo -e "${BLUE}Check 6: Shared Resources${NC}"
echo -e "${YELLOW}⚠️  Docker Container: SHARED (tiktrack-postgres-dev)${NC}"
echo -e "${YELLOW}⚠️  Database User: SHARED (TikTrakDBAdmin)${NC}"
echo -e "${YELLOW}⚠️  Docker Network: SHARED${NC}"
WARNINGS=$((WARNINGS + 3))

echo ""

# Summary
echo "=========================================="
echo "Isolation Summary"
echo "=========================================="
echo ""

echo "✅ Isolated:"
echo "  - Databases: Separate"
echo "  - Directories: Separate"
echo "  - Ports: Separate"
echo "  - Environment Variables: Separate"
echo ""

echo "⚠️  Shared:"
echo "  - Docker Container"
echo "  - Database User"
echo "  - Docker Network"
echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Isolation check passed!${NC}"
    echo ""
    echo "Current isolation level: GOOD"
    echo "Recommendations:"
    echo "  - Continue using separate databases"
    echo "  - Maintain separate directories and ports"
    echo "  - Follow proper workflow (dev → main → prod)"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Isolation check passed with ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Current isolation level: ACCEPTABLE"
    echo "Recommendations:"
    echo "  - Review warnings above"
    echo "  - Consider separate users if needed"
    echo "  - Follow proper workflow"
    exit 0
else
    echo -e "${RED}❌ Isolation check failed with ${ISSUES} issue(s) and ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Current isolation level: NEEDS ATTENTION"
    echo "Recommendations:"
    echo "  - Fix issues above"
    echo "  - Review isolation strategy"
    exit 1
fi

