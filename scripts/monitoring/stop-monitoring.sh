#!/bin/bash

# TikTrack Monitoring Stop Script
# ---------------------------------
# Stops monitoring services (if needed)

set -euo pipefail

echo "🛑 Stopping monitoring services..."
echo ""

# Note: Most monitoring is passive, but we can clean up if needed
echo "ℹ️  Most monitoring services are passive and don't need to be stopped"
echo ""

# Clean up any temporary monitoring files
if [[ -d "reports/monitoring" ]]; then
    echo "🧹 Cleaning up monitoring reports..."
    # Keep last 10 reports
    cd reports/monitoring
    ls -t | tail -n +11 | xargs rm -f 2>/dev/null || true
    echo "✅ Cleanup complete"
fi

echo ""
echo "✅ Monitoring services stopped"

exit 0

