#!/bin/bash
# Script to scan all HTML pages for Loading Standard compliance
# Date: October 11, 2025

echo "🔍 Starting Loading Standard Compliance Scan..."
echo "================================================"
echo ""

# Define the 29 main pages (from PAGES_LIST.md)
PAGES=(
  # User Pages (13)
  "index.html"
  "trading_accounts.html"
  "trades.html"
  "trade_plans.html"
  "executions.html"
  "cash_flows.html"
  "alerts.html"
  "tickers.html"
  "notes.html"
  "research.html"
  "preferences.html"
  "db_display.html"
  "db_extradata.html"
  # Development Tools (16)
  "system-management.html"
  "server-monitor.html"
  "background-tasks.html"
  "external-data-dashboard.html"
  "notifications-center.html"
  "js-map.html"
  "linter-realtime-monitor.html"
  "chart-management.html"
  "css-management.html"
  "crud-testing-dashboard.html"
  "cache-test.html"
  "constraints.html"
  "dynamic-colors-display.html"
  "test-header-only.html"
  "designs.html"
)

cd /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui

total_pages=0
compliant_pages=0
issues_found=0

for page in "${PAGES[@]}"; do
  if [ ! -f "$page" ]; then
    echo "⚠️  $page - FILE NOT FOUND"
    continue
  fi
  
  total_pages=$((total_pages + 1))
  echo "📄 Checking: $page"
  
  # Check Stage 1: Core Modules (8)
  core_count=$(grep -c "scripts/modules/.*\.js" "$page" 2>/dev/null || echo "0")
  
  # Check for validation-utils.js (should NOT exist)
  validation_check=$(grep -c "validation-utils\.js" "$page" 2>/dev/null || echo "0")
  
  # Check version consistency
  old_version=$(grep -c "v=20251001\|v=20251006\|v=20251009" "$page" 2>/dev/null || echo "0")
  
  page_issues=""
  
  if [ "$core_count" -lt 8 ]; then
    page_issues="${page_issues}Missing Core Modules (found $core_count/8); "
    issues_found=$((issues_found + 1))
  fi
  
  if [ "$validation_check" -gt 0 ]; then
    # Check if it's just a comment
    is_comment=$(grep "validation-utils\.js" "$page" | grep -c "<!--.*validation-utils.*-->" || echo "0")
    if [ "$is_comment" -eq 0 ]; then
      page_issues="${page_issues}LOADS validation-utils.js (duplicate!); "
      issues_found=$((issues_found + 1))
    fi
  fi
  
  if [ "$old_version" -gt 0 ]; then
    page_issues="${page_issues}Old versions detected; "
  fi
  
  if [ -z "$page_issues" ]; then
    echo "   ✅ COMPLIANT"
    compliant_pages=$((compliant_pages + 1))
  else
    echo "   ⚠️  ISSUES: $page_issues"
  fi
  
  echo ""
done

echo "================================================"
echo "📊 Summary:"
echo "   Total pages scanned: $total_pages"
echo "   Compliant pages: $compliant_pages"
echo "   Pages with issues: $((total_pages - compliant_pages))"
echo "   Total issues found: $issues_found"
echo ""

if [ "$compliant_pages" -eq "$total_pages" ]; then
  echo "🎉 All pages are 100% compliant!"
else
  echo "⚠️  $(( (compliant_pages * 100) / total_pages ))% compliance - work needed"
fi

