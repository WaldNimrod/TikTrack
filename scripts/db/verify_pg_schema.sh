#!/usr/bin/env bash
# TikTrack – PostgreSQL schema verification helper

set -euo pipefail

DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-tiktrack_dev}
DB_USER=${POSTGRES_USER:-tiktrack}
DB_PASSWORD=${POSTGRES_PASSWORD:-tiktrack_dev_password}

TABLES=(
  users
  preference_types
  preference_groups
  preference_profiles
  user_preferences
  trading_methods
  method_parameters
  constraints
  constraint_validations
  enum_values
  note_relation_types
  currencies
  external_data_providers
  system_setting_types
  system_settings
  system_setting_groups
  system_setting_profiles
)

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ psql not found. Please install PostgreSQL client tools." >&2
  exit 1
fi

export PGPASSWORD="${DB_PASSWORD}"

echo "🔎 Verifying schema on ${DB_HOST}:${DB_PORT}/${DB_NAME}"
for table in "${TABLES[@]}"; do
  COUNT=$(psql -tAc "SELECT COUNT(*) FROM ${table};" -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" || echo "error")
  if [[ "${COUNT}" == "error" ]]; then
    echo "❌ ${table}: missing or inaccessible"
  else
    echo "✅ ${table}: ${COUNT} rows"
  fi
done



