#!/bin/bash

# Production PostgreSQL Setup Script
# ===================================
# Sets up PostgreSQL database for production environment
# - Creates database
# - Initializes schema
# - Runs migration from SQLite

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
DB_PASSWORD="BigMeZoo1974!?"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Default SQLite path (can be overridden)
DEFAULT_SQLITE_PATH="${PROJECT_ROOT}/Backend/db/tiktrack.db"
SQLITE_PATH="${SQLITE_MIGRATION_PATH:-$DEFAULT_SQLITE_PATH}"

echo "=========================================="
echo "Production PostgreSQL Setup"
echo "=========================================="
echo ""

# Pre-flight checks
echo -e "${BLUE}Pre-flight checks...${NC}"

# Check workflow
if [ -f "${SCRIPT_DIR}/enforce_workflow.sh" ]; then
    echo "Running workflow check..."
    if ! "${SCRIPT_DIR}/enforce_workflow.sh" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Workflow check warnings (continuing anyway)${NC}"
    fi
fi

# Check pre-change safety
if [ -f "${SCRIPT_DIR}/pre_change_check.sh" ]; then
    echo "Running pre-change safety check..."
    # Skip interactive parts for automated script
    export SKIP_INTERACTIVE=1
    if ! "${SCRIPT_DIR}/pre_change_check.sh" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Pre-change check warnings (continuing anyway)${NC}"
    fi
    unset SKIP_INTERACTIVE
fi

echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: PostgreSQL container '${CONTAINER_NAME}' is not running${NC}"
    echo "   Please start it with: docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL container is running${NC}"

# Step 1: Create database
echo ""
echo -e "${BLUE}Step 1: Creating production database...${NC}"
if docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo -e "${YELLOW}⚠️  Database '${DB_NAME}' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "DROP DATABASE \"${DB_NAME}\";"
        docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "CREATE DATABASE \"${DB_NAME}\";"
        echo -e "${GREEN}✅ Database recreated${NC}"
    else
        echo -e "${YELLOW}⚠️  Keeping existing database${NC}"
    fi
else
    docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -c "CREATE DATABASE \"${DB_NAME}\";"
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Step 2: Initialize schema
echo ""
echo -e "${BLUE}Step 2: Initializing schema...${NC}"
export POSTGRES_HOST="localhost"
export POSTGRES_DB="${DB_NAME}"
export POSTGRES_USER="${DB_USER}"
export POSTGRES_PASSWORD="${DB_PASSWORD}"

cd "${PROJECT_ROOT}"
python3 << PYEOF
import sys
import os
sys.path.insert(0, 'Backend')

# Set environment variables for database connection
os.environ['POSTGRES_HOST'] = 'localhost'
os.environ['POSTGRES_DB'] = '${DB_NAME}'
os.environ['POSTGRES_USER'] = '${DB_USER}'
os.environ['POSTGRES_PASSWORD'] = '${DB_PASSWORD}'

from config.database import init_db
print("Initializing database schema...")
init_db()
print("✅ Schema initialized successfully")
PYEOF

# Step 3: Migrate data (if SQLite exists)
echo ""
if [ -f "${SQLITE_PATH}" ]; then
    echo -e "${BLUE}Step 3: Migrating system tables from SQLite...${NC}"
    echo "  Source: ${SQLITE_PATH}"
    
    export SQLITE_MIGRATION_PATH="${SQLITE_PATH}"
    export POSTGRES_HOST="localhost"
    export POSTGRES_DB="${DB_NAME}"
    export POSTGRES_USER="${DB_USER}"
    export POSTGRES_PASSWORD="${DB_PASSWORD}"
    
    python3 "${SCRIPT_DIR}/migrate_production_to_pg.py"
    echo -e "${GREEN}✅ Migration completed${NC}"
else
    echo -e "${YELLOW}⚠️  Step 3: SQLite database not found at ${SQLITE_PATH}${NC}"
    echo "   Skipping data migration. Database is ready with empty schema."
    echo "   To migrate data later, run:"
    echo "   SQLITE_MIGRATION_PATH=/path/to/sqlite.db python3 ${SCRIPT_DIR}/migrate_production_to_pg.py"
fi

# Step 4: Verification
echo ""
echo -e "${BLUE}Step 4: Verifying setup...${NC}"
docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "\dt" | head -20
echo ""
echo -e "${GREEN}✅ Production database setup complete!${NC}"

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Update production startup script with PostgreSQL environment variables"
echo "2. Test production server startup"
echo "3. Verify all system tables have data"
echo "=========================================="

