#!/usr/bin/env bash
# dev_ensure_env.sh — Cursor Cloud / local dev helper (idempotent).
#
# The backend reads api/.env, but that file is git-ignored and is NOT preserved
# across Cursor Cloud sessions (/workspace is reset to the git tree each run,
# so untracked files like api/.env, api/venv and ui/node_modules are wiped).
# This script recreates api/.env with local-dev-only values IF it is missing.
# It never overwrites an existing api/.env.
#
# Values are local/dev only:
#   * DATABASE_URL points at the local apt Postgres cluster (postgres/postgres).
#   * JWT_SECRET_KEY / ENCRYPTION_KEY are freshly generated each first-run; this
#     is fine for dev (no externally-encrypted data depends on a fixed key here).
#   * Live market-data checks are disabled by default (egress is restricted on
#     the Cloud VM); set an ALPHA_VANTAGE_API_KEY + flip the flags to test live.
#
# Usage: bash scripts/dev_ensure_env.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/api/.env"

if [ -f "$ENV_FILE" ]; then
    echo "api/.env already exists — leaving it unchanged."
    exit 0
fi

gen() { python3 -c "import secrets;print(secrets.token_urlsafe($1))"; }

cat > "$ENV_FILE" <<EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tiktrack
JWT_SECRET_KEY=$(gen 64)
ENCRYPTION_KEY=$(gen 32)
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
RUN_LIVE_SYMBOL_VALIDATION=false
SKIP_LIVE_DATA_CHECK=true
EOF

echo "Created api/.env (local dev defaults)."
