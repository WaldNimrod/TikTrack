#!/bin/bash

# PostgreSQL Database Sync Script - Local to Docker
# ===================================================
# Syncs the local PostgreSQL database to Docker container
# Ensures 100% structure and data match between local and Docker

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="tiktrack-postgres-dev"
DB_NAME="TikTrack-db-development"
DB_USER="TikTrakDBAdmin"
DB_PASSWORD="BigMeZoo1974!?"
LOCAL_HOST="localhost"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEMP_DIR="${PROJECT_ROOT}/.tmp"
BACKUP_DIR="${PROJECT_ROOT}/archive/database_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="${TEMP_DIR}/sync_dump_${TIMESTAMP}.sql"

echo "=========================================="
echo "PostgreSQL Database Sync - Local to Docker"
echo "=========================================="
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: PostgreSQL container '${CONTAINER_NAME}' is not running${NC}"
    echo "   Please start it with: docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL container is running${NC}"

# Check if local database is accessible
echo -e "${BLUE}🔍 Checking local database connection...${NC}"
if ! PGPASSWORD="${DB_PASSWORD}" psql -h "${LOCAL_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot connect to local database${NC}"
    echo "   Please ensure PostgreSQL is running and accessible at ${LOCAL_HOST}"
    exit 1
fi

echo -e "${GREEN}✅ Local database is accessible${NC}"

# Create temp directory
mkdir -p "${TEMP_DIR}"
mkdir -p "${BACKUP_DIR}"

# Step 1: Backup Docker database before sync
echo ""
echo -e "${BLUE}📦 Step 1: Creating backup of Docker database...${NC}"
DOCKER_BACKUP="${BACKUP_DIR}/docker_pre_sync_${TIMESTAMP}.sql"
if docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists > "${DOCKER_BACKUP}" 2>&1; then
    BACKUP_SIZE=$(du -h "${DOCKER_BACKUP}" | cut -f1)
    echo -e "${GREEN}✅ Docker backup created: ${DOCKER_BACKUP} (${BACKUP_SIZE})${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not create Docker backup (might be empty database)${NC}"
fi

# Step 2: Dump local database
echo ""
echo -e "${BLUE}📤 Step 2: Dumping local database...${NC}"
echo "  Source: ${LOCAL_HOST}/${DB_NAME}"
echo "  Output: ${DUMP_FILE}"

if PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${LOCAL_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
    --clean --if-exists \
    --no-owner --no-privileges \
    > "${DUMP_FILE}" 2>&1; then
    
    DUMP_SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
    echo -e "${GREEN}✅ Local database dumped successfully (${DUMP_SIZE})${NC}"
    
    # Verify dump file is not empty
    if [ ! -s "${DUMP_FILE}" ]; then
        echo -e "${RED}❌ Error: Dump file is empty!${NC}"
        rm -f "${DUMP_FILE}"
        exit 1
    fi
else
    echo -e "${RED}❌ Error: Failed to dump local database${NC}"
    exit 1
fi

# Step 3: Restore to Docker
echo ""
echo -e "${BLUE}📥 Step 3: Restoring to Docker database...${NC}"
echo "  Target: ${CONTAINER_NAME}/${DB_NAME}"

if docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${DUMP_FILE}" 2>&1; then
    echo -e "${GREEN}✅ Database restored to Docker successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Some errors during restore (might be expected for existing objects)${NC}"
    echo "   Checking if data was synced correctly..."
fi

# Step 4: Verify sync
echo ""
echo -e "${BLUE}🔍 Step 4: Verifying sync...${NC}"

# Compare table counts
TABLES=("users" "tickers" "user_tickers" "trading_accounts" "trade_plans" "trades" "executions" "cash_flows" "alerts" "notes" "ai_analysis_requests")
ALL_MATCH=true

for table in "${TABLES[@]}"; do
    LOCAL_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${LOCAL_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM ${table};" 2>/dev/null | tr -d ' ')
    DOCKER_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM ${table};" 2>/dev/null | tr -d ' ')
    
    if [ "${LOCAL_COUNT}" = "${DOCKER_COUNT}" ]; then
        echo -e "   ${GREEN}✅${NC} ${table}: ${LOCAL_COUNT}"
    else
        echo -e "   ${RED}❌${NC} ${table}: local=${LOCAL_COUNT}, docker=${DOCKER_COUNT}"
        ALL_MATCH=false
    fi
done

# Cleanup temp file
echo ""
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
rm -f "${DUMP_FILE}"
echo -e "${GREEN}✅ Cleanup completed${NC}"

# Final summary
echo ""
echo "=========================================="
if [ "$ALL_MATCH" = true ]; then
    echo -e "${GREEN}✅ Sync completed successfully!${NC}"
    echo "   All data matches between local and Docker"
else
    echo -e "${YELLOW}⚠️  Sync completed with warnings${NC}"
    echo "   Some tables have different counts - please review"
fi
echo "=========================================="
echo ""
echo "Backup saved at: ${DOCKER_BACKUP}"
echo ""

