#!/usr/bin/env bash
set -euo pipefail

# TikTrack - Initialize PostgreSQL infra inside Docker (idempotent)
# - Ensures role "TikTrakDBAdmin" exists with password and CREATEDB
# - Ensures databases "TikTrack-db-development" and "TikTrack-db-prodution" exist and owned by TikTrakDBAdmin
# - Safe to re-run
#
# Requirements:
# - Running container named: tiktrack-postgres-dev (as in docker/docker-compose.dev.yml)
# - psql available in the postgres container (official image)
#
# Usage:
#   bash scripts/db/init_pg_infra.sh
#

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-tiktrack-postgres-dev}"
POSTGRES_USER="${POSTGRES_USER:-tiktrack}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"
SQL_FILE_LOCAL="scripts/db/init_pg_infra.sql"
SQL_FILE_REMOTE="/tmp/init_pg_infra.sql"

echo ">>> Checking container '$POSTGRES_CONTAINER' is running..."
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}\$"; then
  echo "ERROR: Container '${POSTGRES_CONTAINER}' is not running. Start it first:"
  echo "  docker compose -f docker/docker-compose.dev.yml up -d postgres-dev"
  exit 1
fi

if [ ! -f "$SQL_FILE_LOCAL" ]; then
  echo "ERROR: SQL file not found at $SQL_FILE_LOCAL"
  exit 1
fi

echo ">>> Copying SQL to container..."
docker cp "$SQL_FILE_LOCAL" "${POSTGRES_CONTAINER}:${SQL_FILE_REMOTE}"

echo ">>> Executing SQL (idempotent)..."
docker exec "${POSTGRES_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f "${SQL_FILE_REMOTE}"

echo ">>> Verifying role and databases..."
docker exec "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -tAc "SELECT 'role:'||rolname FROM pg_roles WHERE rolname='TikTrakDBAdmin';"
docker exec "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -tAc "SELECT 'db:'||datname FROM pg_database WHERE datname IN ('TikTrack-db-development','TikTrack-db-prodution') ORDER BY datname;"

echo ">>> Done."



