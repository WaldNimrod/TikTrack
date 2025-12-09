#!/bin/bash

# TikTrack Parallel Processes Check Script
# -----------------------------------------
# Checks for parallel processes that might cause conflicts

set -euo pipefail

echo "🔍 Checking for parallel processes..."
echo ""

# Check server processes
echo "🖥️  Server Processes:"
if python3 Backend/utils/server_lock_manager.py 2>/dev/null; then
    echo "  ✅ No conflicts found"
else
    echo "  ⚠️  Potential conflicts detected"
    echo "  Run: python3 Backend/utils/server_lock_manager.py for details"
fi
echo ""

# Check port 8080
echo "🔌 Port 8080:"
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PROCESSES=$(lsof -Pi :8080 -sTCP:LISTEN)
    echo "  ⚠️  Port 8080 is in use:"
    echo "$PROCESSES" | head -5
else
    echo "  ✅ Port 8080 is free"
fi
echo ""

# Check for lock files
echo "🔒 Lock Files:"
LOCK_FILES=$(find /tmp -name "*.lock" -o -name "*tiktrack*" 2>/dev/null | head -10)
if [[ -n "$LOCK_FILES" ]]; then
    echo "  ⚠️  Found lock files:"
    echo "$LOCK_FILES"
else
    echo "  ✅ No lock files found"
fi
echo ""

echo "✅ Check complete"

exit 0

