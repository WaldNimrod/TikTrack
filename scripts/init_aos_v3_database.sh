#!/usr/bin/env bash
# AOS v3 — auto-provision local Docker Postgres (role + DB), apply 001, seed (Team 61 GATE_0).
#
# DOMAIN ISOLATION: only agents_os_v3/.env → AOS_V3_DATABASE_URL (never api/.env).
#
# Operator: fill AOS_V3_DATABASE_URL (user, password, host=127.0.0.1, port, database name).
# This script discovers a running Postgres Docker container, creates the role/DB if missing,
# then runs migration + seed. Override container with AOS_V3_DOCKER_PG_CONTAINER if needed.
#
# Usage (repo root):
#   bash scripts/init_aos_v3_database.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/agents_os_v3/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/agents_os_v3/.env"
  set +a
fi

if [[ -z "${AOS_V3_DATABASE_URL:-}" ]]; then
  cat >&2 <<'EOF'
ERROR: AOS_V3_DATABASE_URL is empty after loading agents_os_v3/.env

Edit agents_os_v3/.env and set e.g.:
  AOS_V3_DATABASE_URL=postgresql://MYUSER:MYPASS@127.0.0.1:5432/aos_v3
EOF
  exit 1
fi

# Python + psycopg2 for ensure + migrations
if [[ -n "${AOS_V3_VENV:-}" && -f "$AOS_V3_VENV/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$AOS_V3_VENV/bin/activate"
elif [[ -f "$ROOT/agents_os_v3/.venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/agents_os_v3/.venv/bin/activate"
elif [[ -f "$ROOT/api/venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/api/venv/bin/activate"
else
  echo "INFO: Using python3 on PATH (ensure api/venv or agents_os_v3/.venv if imports fail)."
fi

export AOS_V3_DATABASE_URL

echo "INFO: Ensuring Postgres role + database (Docker auto-detect when host is localhost)..."
python3 "$ROOT/agents_os_v3/db/ensure_local_postgres_for_aos.py" || exit 1

echo "INFO: Applying fresh migration 001 (dbname from AOS_V3_DATABASE_URL)..."
python3 "$ROOT/agents_os_v3/db/run_migration.py" --fresh

echo "INFO: Running seed.py..."
python3 "$ROOT/agents_os_v3/seed.py"

echo "OK: AOS v3 database initialized (001 + seed)."
