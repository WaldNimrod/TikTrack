#!/bin/bash
#
# Daily Linter Check - TikTrack
# בדיקת לינטר יומית אוטומטית
#
# Usage: Add to crontab:
# 0 9 * * 1-5 /path/to/tiktrack/scripts/daily-linter-check.sh
# (runs Monday-Friday at 9 AM)

echo "🔄 TikTrack Daily Linter Check - $(date)"
echo "==========================================="

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found - skipping linter check"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run linter check
echo "🔍 Running linter check..."
npm run lint > daily-lint-$(date +%Y%m%d).log 2>&1

# Generate quality report
echo "📊 Generating quality report..."
npm run quality:report

# Count issues
total_lines=$(npm run lint 2>/dev/null | grep -E "problems|warning|error" | tail -1)
if [ ! -z "$total_lines" ]; then
    echo "📈 Results: $total_lines"
else
    echo "📈 Results: No issues found!"
fi

# Generate summary
echo ""
echo "📋 Daily Summary ($(date +%Y-%m-%d)):"
echo "- Linter check completed"
echo "- Report generated: lint-report.html"
echo "- Log saved: daily-lint-$(date +%Y%m%d).log"
echo ""

# Optional: Send notification if there are critical issues
critical_count=$(npm run lint 2>/dev/null | grep -c "error" || echo "0")
if [ "$critical_count" -gt 0 ]; then
    echo "🚨 Found $critical_count critical errors!"
    # Here you could add email notification or Slack webhook
fi

echo "✅ Daily linter check completed at $(date)"
echo "==========================================="