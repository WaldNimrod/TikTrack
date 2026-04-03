#!/usr/bin/env bash
# One-shot local bootstrap: optional DB init + start AOS v3 server (API + UI on :8090).
#
#   bash scripts/bootstrap_aos_v3_local.sh
#
# Skip migration/seed (server only):
#   AOS_V3_SKIP_DATABASE_INIT=1 bash scripts/bootstrap_aos_v3_local.sh
#
# Foreground server (logs in terminal):
#   bash scripts/bootstrap_aos_v3_local.sh --foreground

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ "${AOS_V3_SKIP_DATABASE_INIT:-}" == "1" ]]; then
  echo "[aos-v3] Skipping database init (AOS_V3_SKIP_DATABASE_INIT=1)"
else
  echo "[aos-v3] Running database init (migration 001 + seed) ..."
  bash "$ROOT/scripts/init_aos_v3_database.sh"
fi

echo "[aos-v3] Starting AOS v3 (API + UI, port 8090) ..."
exec bash "$ROOT/scripts/start-aos-v3-server.sh" "$@"
