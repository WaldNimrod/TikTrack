#!/bin/bash
# Final Comprehensive Multi-User System Tests
# This script runs all final tests for the multi-user system

set -e

echo "=========================================="
echo "Multi-User System - Final Tests"
echo "=========================================="
echo ""

# Set PostgreSQL environment variables
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"
export POSTGRES_PORT=5432

# Check if server is running
echo "Checking if server is running..."
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start the server first:"
    echo "   ./start_server.sh"
    exit 1
fi

echo ""
echo "Running comprehensive tests..."
echo ""

# Run comprehensive tests
python3 Backend/scripts/comprehensive_multi_user_tests.py

echo ""
echo "=========================================="
echo "Tests completed!"
echo "=========================================="

