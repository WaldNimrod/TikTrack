#!/bin/bash

# TikTrack Monitoring Start Script
# ---------------------------------
# Starts monitoring services

set -euo pipefail

echo "🚀 Starting monitoring services..."
echo ""

# Check if server is running
if ! curl -s http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "❌ Server is not running on http://localhost:8080"
    echo "Please start the server first: ./start_server.sh"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Start health monitoring
echo "📊 Health Monitoring:"
echo "  Run: curl http://localhost:8080/api/health"
echo "  Detailed: curl http://localhost:8080/api/health/detailed"
echo ""

# Start metrics collection
echo "📈 Metrics Collection:"
echo "  Run: curl -X POST http://localhost:8080/api/metrics/collect"
echo ""

# Start error monitoring (if Sentry is configured)
if [[ -n "${SENTRY_DSN:-}" ]]; then
    echo "🔔 Error Monitoring (Sentry):"
    echo "  Sentry DSN configured: ${SENTRY_DSN:0:20}..."
else
    echo "⚠️  Sentry not configured - error monitoring disabled"
fi
echo ""

echo "✅ Monitoring services ready"
echo ""
echo "💡 Tip: Use ./scripts/monitoring/generate-report.sh to generate monitoring report"

exit 0

