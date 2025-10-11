#!/bin/bash
# Comprehensive verification of all 11 user pages
# Date: October 11, 2025

cd /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui

PAGES=(
  "alerts.html"
  "tickers.html"
  "trade_plans.html"
  "notes.html"
  "cash_flows.html"
  "trades.html"
  "trading_accounts.html"
  "executions.html"
  "preferences.html"
  "db_display.html"
  "db_extradata.html"
)

echo "=========================================="
echo "🔍 Loading Standard Compliance Check"
echo "=========================================="
echo ""

all_pass=true

for page in "${PAGES[@]}"; do
  echo "📄 $page:"
  
  # Count Core Modules (should be 8)
  core_systems=$(grep -c "scripts/modules/core-systems.js" "$page" 2>/dev/null || echo "0")
  ui_basic=$(grep -c "scripts/modules/ui-basic.js" "$page" 2>/dev/null || echo "0")
  data_basic=$(grep -c "scripts/modules/data-basic.js" "$page" 2>/dev/null || echo "0")
  ui_advanced=$(grep -c "scripts/modules/ui-advanced.js" "$page" 2>/dev/null || echo "0")
  data_advanced=$(grep -c "scripts/modules/data-advanced.js" "$page" 2>/dev/null || echo "0")
  business=$(grep -c "scripts/modules/business-module.js" "$page" 2>/dev/null || echo "0")
  communication=$(grep -c "scripts/modules/communication-module.js" "$page" 2>/dev/null || echo "0")
  cache=$(grep -c "scripts/modules/cache-module.js" "$page" 2>/dev/null || echo "0")
  
  core_total=$((core_systems + ui_basic + data_basic + ui_advanced + data_advanced + business + communication + cache))
  
  # Count Core Utilities (should be 3)
  favicon=$(grep -c "scripts/global-favicon.js" "$page" 2>/dev/null || echo "0")
  page_utils=$(grep -c "scripts/page-utils.js" "$page" 2>/dev/null || echo "0")
  header=$(grep -c "scripts/header-system.js" "$page" 2>/dev/null || echo "0")
  
  utilities_total=$((favicon + page_utils + header))
  
  # Check for legacy files (should be 0)
  validation_utils=$(grep -c "src=.*validation-utils.js" "$page" 2>/dev/null || echo "0")
  dynamic_loader=$(grep -c "dynamic-loader-config.js" "$page" 2>/dev/null || echo "0")
  button_icons=$(grep -c "button-icons.js" "$page" 2>/dev/null || echo "0")
  inline_script=$(grep -c "window.copyDetailedLog = copyDetailedLog" "$page" 2>/dev/null || echo "0")
  
  # Check version
  v20251010=$(grep -c "v=20251010" "$page" 2>/dev/null || echo "0")
  old_versions=$(grep -c "v=20251001\|v=20251006\|v=20251009" "$page" 2>/dev/null || echo "0")
  
  # Results
  issues=""
  
  if [ "$core_total" -ne 8 ]; then
    issues="${issues}Core Modules: $core_total/8; "
    all_pass=false
  else
    echo "   ✅ Core Modules: 8/8"
  fi
  
  if [ "$utilities_total" -ne 3 ]; then
    issues="${issues}Core Utilities: $utilities_total/3; "
    all_pass=false
  else
    echo "   ✅ Core Utilities: 3/3"
  fi
  
  if [ "$validation_utils" -gt 0 ]; then
    issues="${issues}validation-utils.js found!; "
    all_pass=false
  fi
  
  if [ "$dynamic_loader" -gt 0 ]; then
    issues="${issues}dynamic-loader found!; "
    all_pass=false
  fi
  
  if [ "$button_icons" -gt 0 ]; then
    issues="${issues}button-icons.js found!; "
    all_pass=false
  fi
  
  if [ "$inline_script" -gt 0 ]; then
    issues="${issues}inline script found!; "
    all_pass=false
  fi
  
  if [ "$v20251010" -eq 0 ]; then
    issues="${issues}No v=20251010!; "
    all_pass=false
  else
    echo "   ✅ Version: v=20251010"
  fi
  
  if [ "$old_versions" -gt 0 ]; then
    issues="${issues}Old versions: $old_versions; "
    echo "   ⚠️  Old versions found: $old_versions"
  fi
  
  if [ -n "$issues" ]; then
    echo "   ❌ ISSUES: $issues"
  else
    echo "   ✅ FULLY COMPLIANT"
  fi
  
  echo ""
done

echo "=========================================="
if [ "$all_pass" = true ]; then
  echo "🎉 ALL 11 PAGES ARE 100% COMPLIANT!"
else
  echo "⚠️  SOME PAGES HAVE ISSUES - CHECK ABOVE"
fi
echo "=========================================="

