#!/bin/bash

# TikTrack Server Startup with PostgreSQL
# ======================================
#
# NOTE: This script is now a convenience wrapper for start_server.sh
# The main start_server.sh script now automatically sets PostgreSQL
# environment variables in development mode.
#
# This script is kept for backward compatibility and explicit PostgreSQL
# configuration if needed.

export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"

echo "=========================================="
echo "Starting TikTrack Server with PostgreSQL"
echo "=========================================="
echo ""
echo "Database: $POSTGRES_DB"
echo "User: $POSTGRES_USER"
echo "Host: $POSTGRES_HOST"
echo ""
echo "Note: start_server.sh now automatically configures PostgreSQL"
echo "      in development mode. This script is kept for compatibility."
echo ""
echo "Starting server..."
echo ""

cd "$(dirname "$0")"
./start_server.sh "$@"


