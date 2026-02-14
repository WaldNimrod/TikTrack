#!/bin/bash
# Cron wrapper — טוען api/.env ומריץ job
# TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST §2.3
# שימוש: run_market_data_job.sh sync-eod | sync-ticker-prices | sync-intraday | sync-history-backfill | cleanup-market-data
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
if [ -f "api/.env" ]; then
  set -a
  . api/.env 2>/dev/null || true
  set +a
fi
exec make "$@"
