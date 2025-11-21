#!/bin/bash

# Production Setup Verification Script
# =====================================
# Verifies that production PostgreSQL setup is ready

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="tiktrack-postgres-dev"
DB_NAME="TikTrack-db-production"
DB_USER="TikTrakDBAdmin"

echo "=========================================="
echo "Production Setup Verification"
echo "=========================================="
echo ""

# Check 1: Container running
echo -e "${BLUE}Check 1: PostgreSQL Container${NC}"
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    container_status=$(docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Status}}')
    echo -e "${GREEN}✅ Container is running: ${container_status}${NC}"
    
    if echo "$container_status" | grep -q 'healthy'; then
        echo -e "${GREEN}✅ Container is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Container is not yet healthy${NC}"
    fi
else
    echo -e "${RED}❌ Container '${CONTAINER_NAME}' is not running${NC}"
    exit 1
fi

echo ""

# Check 2: Database exists
echo -e "${BLUE}Check 2: Production Database${NC}"
if docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo -e "${GREEN}✅ Database '${DB_NAME}' exists${NC}"
    
    # Check table count
    table_count=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    echo "   Tables: ${table_count}"
    
    if [ "$table_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Schema is initialized${NC}"
    else
        echo -e "${YELLOW}⚠️  Schema is empty (run setup script)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database '${DB_NAME}' does not exist${NC}"
    echo "   Run: ./scripts/db/setup_production_postgresql.sh"
fi

echo ""

# Check 3: System tables have data
echo -e "${BLUE}Check 3: System Tables Data${NC}"
if docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    # Check constraints table
    constraints_count=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM constraints;" 2>/dev/null | tr -d ' ' || echo "0")
    echo "   Constraints: ${constraints_count}"
    
    # Check system_settings table
    settings_count=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM system_settings;" 2>/dev/null | tr -d ' ' || echo "0")
    echo "   System Settings: ${settings_count}"
    
    # Check currencies table
    currencies_count=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM currencies;" 2>/dev/null | tr -d ' ' || echo "0")
    echo "   Currencies: ${currencies_count}"
    
    if [ "$constraints_count" -gt 0 ] || [ "$settings_count" -gt 0 ] || [ "$currencies_count" -gt 0 ]; then
        echo -e "${GREEN}✅ System tables contain data${NC}"
    else
        echo -e "${YELLOW}⚠️  System tables are empty (migration may be needed)${NC}"
    fi
    
    # Check user data tables (should be empty)
    tickers_count=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM tickers;" 2>/dev/null | tr -d ' ' || echo "0")
    trades_count=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM trades;" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [ "$tickers_count" -eq 0 ] && [ "$trades_count" -eq 0 ]; then
        echo -e "${GREEN}✅ User data tables are empty (as expected)${NC}"
    else
        echo -e "${YELLOW}⚠️  User data tables contain data: tickers=${tickers_count}, trades=${trades_count}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot check - database does not exist${NC}"
fi

echo ""
echo "=========================================="
echo "Verification Complete"
echo "=========================================="


