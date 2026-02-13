#!/bin/bash
# EOD Sync — Market Data (exchange_rates)
# Team 60 — MARKET_DATA_PIPE_SPEC §5
# Cron example: 0 22 * * 1-5 (22:00 Sun-Thu)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
exec python3 scripts/sync_exchange_rates_eod.py "$@"
