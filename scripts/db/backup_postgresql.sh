#!/bin/bash

# PostgreSQL Database Backup Script
# ===================================
# Creates a backup of the PostgreSQL database running in Docker

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="tiktrack-postgres-dev"
DB_NAME="TikTrack-db-development"
DB_USER="TikTrakDBAdmin"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/archive/database_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/TikTrack-db-development_${TIMESTAMP}.sql"

echo "=========================================="
echo "PostgreSQL Database Backup"
echo "=========================================="
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: PostgreSQL container '${CONTAINER_NAME}' is not running${NC}"
    echo "   Please start it with: docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL container is running${NC}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "Creating backup..."
echo "  Database: ${DB_NAME}"
echo "  Output: ${BACKUP_FILE}"
echo ""

# Create backup using pg_dump
if docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists > "${BACKUP_FILE}" 2>&1; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo "  File: ${BACKUP_FILE}"
    echo "  Size: ${BACKUP_SIZE}"
    echo ""
    
    # Verify backup file is not empty
    if [ ! -s "${BACKUP_FILE}" ]; then
        echo -e "${RED}❌ Warning: Backup file is empty!${NC}"
        rm -f "${BACKUP_FILE}"
        exit 1
    fi
    
    # Show first few lines to verify it's a valid SQL dump
    echo "Backup preview (first 5 lines):"
    head -5 "${BACKUP_FILE}"
    echo ""
    echo -e "${GREEN}✅ Backup verification passed${NC}"
    
else
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "Check the error messages above"
    exit 1
fi

echo ""
echo "=========================================="
echo "Backup completed successfully!"
echo "=========================================="

