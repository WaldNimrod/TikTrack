#!/usr/bin/env bash
# TikTrack – PostgreSQL bootstrap utility
# Usage:
#   POSTGRES_HOST=127.0.0.1 POSTGRES_SUPERUSER=postgres POSTGRES_SUPERPASS=postgres \
#   scripts/db/psql-init.sh

set -euo pipefail

DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
APP_DB=${POSTGRES_DB:-tiktrack_dev}
APP_USER=${POSTGRES_USER:-tiktrack}
APP_PASSWORD=${POSTGRES_PASSWORD:-tiktrack_dev_password}
SUPERUSER=${POSTGRES_SUPERUSER:-postgres}
SUPERPASS=${POSTGRES_SUPERPASS:-postgres}

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ psql not found. Please install PostgreSQL client tools." >&2
  exit 1
fi

export PGPASSWORD="${SUPERPASS}"

echo "🔧 Connecting to ${DB_HOST}:${DB_PORT} as ${SUPERUSER}…"
psql -v ON_ERROR_STOP=1 -h "${DB_HOST}" -p "${DB_PORT}" -U "${SUPERUSER}" <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${APP_USER}') THEN
    CREATE ROLE ${APP_USER} LOGIN PASSWORD '${APP_PASSWORD}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${APP_DB}') THEN
    CREATE DATABASE ${APP_DB} OWNER ${APP_USER};
  END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE ${APP_DB} TO ${APP_USER};
SQL

echo "✅ PostgreSQL user/database ensured."
echo "ℹ️  Connection string: postgresql://${APP_USER}:***@${DB_HOST}:${DB_PORT}/${APP_DB}"



