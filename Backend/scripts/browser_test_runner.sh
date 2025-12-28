#!/bin/bash
# Browser Test Runner - Opens browser for manual testing
# מדריך להרצת בדיקות בדפדפן

set -e

echo "=========================================="
echo "Browser Test Runner - Multi-User System"
echo "=========================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "❌ Server is not running. Please start the server first:"
    echo "   ./start_server.sh"
    exit 1
fi

echo "✅ Server is running"
echo ""
echo "Opening browser for manual testing..."
echo ""
echo "Test URLs:"
echo "  1. Login: http://localhost:8080/login.html"
echo "  2. Register: http://localhost:8080/register.html"
echo "  3. User Profile: http://localhost:8080/user_profile.html"
echo "  4. Home (should redirect to login if not authenticated): http://localhost:8080/index.html"
echo ""
echo "See comprehensive_browser_tests.md for full test checklist"
echo ""

# Try to open browser (works on macOS)
if command -v open &> /dev/null; then
    open "http://localhost:8080/login.html"
    echo "✅ Opened browser at login page"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080/login.html"
    echo "✅ Opened browser at login page"
else
    echo "⚠️  Could not open browser automatically"
    echo "   Please open manually: http://localhost:8080/login.html"
fi

echo ""
echo "=========================================="
echo "Manual Testing Guide:"
echo "  See: Backend/scripts/comprehensive_browser_tests.md"
echo "=========================================="

