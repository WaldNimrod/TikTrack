#!/bin/bash
# Monitor server logs in real-time for cash flow operations

echo "🔍 Monitoring server logs for cash flow operations..."
echo "Press Ctrl+C to stop"
echo "============================================"

# Monitor the log file for cash flow related entries
tail -f Backend/logs/app.log | grep --line-buffered -E "CREATE CASH FLOW|HANDLE_DB_SESSION|COMMIT|INVALIDATE_CACHE|cash_flow"















