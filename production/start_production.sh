#!/bin/bash

# TikTrack Production Server Startup (Wrapper)
# ============================================
# Delegates to the unified start_server.sh script with production settings.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

./start_server.sh --env production "$@"
