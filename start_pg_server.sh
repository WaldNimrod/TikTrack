#!/bin/bash

# TikTrack Server Startup with PostgreSQL
# ======================================

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
echo "Starting server..."
echo ""

cd "$(dirname "$0")"
./start_server.sh


