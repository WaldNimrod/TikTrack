#!/bin/bash

# TikTrack Monitoring Report Generator
# --------------------------------------
# Generates comprehensive monitoring report

set -euo pipefail

REPORT_DIR="reports/monitoring"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/monitoring_report_$TIMESTAMP.json"

mkdir -p "$REPORT_DIR"

echo "📊 Generating monitoring report..."
echo ""

# Collect health data
echo "🔍 Collecting health data..."
HEALTH_DATA=$(curl -s http://localhost:8080/api/health/detailed 2>/dev/null || echo '{"error": "Server not running"}')

# Collect metrics
echo "📈 Collecting metrics..."
METRICS_DATA=$(curl -s -X POST http://localhost:8080/api/metrics/collect 2>/dev/null || echo '{"error": "Server not running"}')

# Collect process info
echo "🖥️  Collecting process info..."
PROCESS_DATA=$(python3 Backend/utils/server_lock_manager.py --json 2>/dev/null || echo '{"error": "Could not collect process data"}')

# Combine data
REPORT_DATA=$(cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "health": $HEALTH_DATA,
  "metrics": $METRICS_DATA,
  "processes": $PROCESS_DATA
}
EOF
)

# Save report
echo "$REPORT_DATA" > "$REPORT_FILE"

echo "✅ Report generated: $REPORT_FILE"
echo ""
echo "📄 Report contents:"
echo "$REPORT_DATA" | jq '.' 2>/dev/null || echo "$REPORT_DATA"

exit 0

