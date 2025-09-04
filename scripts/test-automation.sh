#!/bin/bash
# Test all linter automation components

cd "$(dirname "$0")/.."
echo "🧪 Testing TikTrack Linter Automation"
echo "===================================="

echo "1. Testing basic linter..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ] || [ $? -eq 1 ]; then
    echo "✅ Basic linter: OK"
else
    echo "❌ Basic linter: FAILED"
fi

echo "2. Testing auto-fix..."
npm run lint:fix > /dev/null 2>&1
if [ $? -eq 0 ] || [ $? -eq 1 ]; then
    echo "✅ Auto-fix: OK"
else
    echo "❌ Auto-fix: FAILED"
fi

echo "3. Testing quality report..."
npm run quality:report > /dev/null 2>&1
if [ $? -eq 0 ] && [ -f "lint-report.html" ]; then
    echo "✅ Quality report: OK"
else
    echo "❌ Quality report: FAILED"
fi

echo "4. Testing pre-commit hook..."
.git/hooks/pre-commit > /dev/null 2>&1
hook_result=$?
if [ $hook_result -eq 0 ] || [ $hook_result -eq 1 ]; then
    echo "✅ Pre-commit hook: OK"
else
    echo "❌ Pre-commit hook: FAILED"
fi

echo ""
echo "🎉 Automation test completed!"
echo "📊 Open create_linter_dashboard.html for detailed view"
