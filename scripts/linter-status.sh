#!/bin/bash
# Quick linter status check

cd "$(dirname "$0")/.."
echo "🏆 TikTrack Linter Status - $(date)"
echo "================================="

# Run linter and extract stats
output=$(npm run lint 2>&1)
total_line=$(echo "$output" | grep -E "problems|warning|error" | tail -1)

if [ ! -z "$total_line" ]; then
    echo "📊 $total_line"
else
    echo "📊 No issues found!"
fi

# Calculate improvement from baseline (1,636)
if echo "$total_line" | grep -q "[0-9]"; then
    current=$(echo "$total_line" | grep -oE "[0-9]+" | head -1)
    improvement=$(echo "scale=1; (1636 - $current) / 1636 * 100" | bc -l 2>/dev/null || echo "N/A")
    echo "📈 Improvement: ${improvement}% from baseline"
fi

echo ""
echo "🔧 Quick Commands:"
echo "  npm run lint:fix        - Fix auto-fixable issues"
echo "  npm run quality:report  - Generate detailed report"
echo "  npm run watch:linter    - Start real-time monitoring"
echo ""
