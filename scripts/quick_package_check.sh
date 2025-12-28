#!/bin/bash
# Quick Package Loading Check
# ===========================
#
# Simple script to check if critical packages are loaded in HTML files
# Prevents the "Missing required globals" error

echo "🔍 Quick Package Loading Check"
echo "================================"

# Check portfolio_state.html for info-summary
echo "📄 Checking portfolio_state.html for info-summary scripts..."

if grep -q "info-summary-system.js" trading-ui/portfolio_state.html; then
    echo "✅ info-summary-system.js found in portfolio_state.html"
else
    echo "❌ MISSING: info-summary-system.js not found in portfolio_state.html"
    echo "   💡 Add: <script src=\"../../scripts/info-summary-system.js?v=1.0.0\" defer></script>"
fi

if grep -q "info-summary-configs.js" trading-ui/portfolio_state.html; then
    echo "✅ info-summary-configs.js found in portfolio_state.html"
else
    echo "❌ MISSING: info-summary-configs.js not found in portfolio_state.html"
    echo "   💡 Add: <script src=\"../../scripts/info-summary-configs.js?v=1.0.0\" defer></script>"
fi

# Check if window.InfoSummarySystem is in requiredGlobals
echo ""
echo "📋 Checking page-initialization-configs.js..."

if grep -q "window.InfoSummarySystem" trading-ui/scripts/page-initialization-configs.js; then
    echo "✅ window.InfoSummarySystem found in requiredGlobals"
else
    echo "❌ MISSING: window.InfoSummarySystem not in requiredGlobals for portfolio-state"
fi

# Summary
echo ""
echo "📊 SUMMARY:"
echo "==========="

MISSING_COUNT=0

if ! grep -q "info-summary-system.js" trading-ui/portfolio_state.html; then
    ((MISSING_COUNT++))
fi

if ! grep -q "info-summary-configs.js" trading-ui/portfolio_state.html; then
    ((MISSING_COUNT++))
fi

if ! grep -q "window.InfoSummarySystem" trading-ui/scripts/page-initialization-configs.js; then
    ((MISSING_COUNT++))
fi

if [ $MISSING_COUNT -eq 0 ]; then
    echo "✅ All checks passed - no missing packages!"
    exit 0
else
    echo "❌ $MISSING_COUNT issues found - fix before committing!"
    echo ""
    echo "💡 REMEMBER THE LESSON:"
    echo "   package-manifest.js defines WHAT to load"
    echo "   HTML defines WHERE to load it"
    echo "   Always check both!"
    exit 1
fi
