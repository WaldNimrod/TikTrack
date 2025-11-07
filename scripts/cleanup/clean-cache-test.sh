#!/bin/bash

# Clean Cache Test Script
# =======================
# This script prepares a clean testing environment by:
# 1. Clearing all browser cache
# 2. Restarting the server
# 3. Providing instructions for manual cache clear

echo "🧹 Starting Clean Cache Test Preparation..."
echo ""

# Step 1: Check if server is running
echo "1️⃣  Checking if server is running..."
if pgrep -f "python.*Backend/app.py" > /dev/null; then
    SERVER_PID=$(pgrep -f "python.*Backend/app.py")
    echo "   ⚠️  Server is running (PID: $SERVER_PID)"
    echo "   💡 Stop the server manually before running this test"
    echo ""
else
    echo "   ✅ Server is not running"
    echo ""
fi

# Step 2: Clear browser cache instructions
echo "2️⃣  Browser Cache Clear Instructions:"
echo "   📋 Please perform the following in your browser:"
echo ""
echo "   Chrome/Edge:"
echo "   - Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows/Linux)"
echo "   - Select 'All time'"
echo "   - Check 'Cached images and files'"
echo "   - Click 'Clear data'"
echo ""
echo "   Firefox:"
echo "   - Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows/Linux)"
echo "   - Select 'Everything'"
echo "   - Check 'Cache'"
echo "   - Click 'Clear Now'"
echo ""

# Step 3: Clear localStorage and sessionStorage
echo "3️⃣  localStorage/sessionStorage Clear:"
echo "   📋 Open browser console and run:"
echo ""
echo "   localStorage.clear();"
echo "   sessionStorage.clear();"
echo "   location.reload();"
echo ""

# Step 4: Provide database clear SQL (optional)
echo "4️⃣  Database Clear (Optional - for fresh start):"
echo "   📋 Run these SQL commands to clear table data:"
echo ""
cat << 'EOF'
   DELETE FROM cash_flows;
   DELETE FROM trades;
   DELETE FROM executions;
   DELETE FROM notes;
   DELETE FROM alerts;
   -- Keep reference data: trading_accounts, tickers, trade_plans, currencies
EOF
echo ""

# Step 5: Restart server
echo "5️⃣  Restart Server:"
echo "   📋 Run the following commands:"
echo ""
echo "   cd $(pwd)"
echo "   ./start_server.sh"
echo ""

echo "✅ Preparation Complete!"
echo ""
echo "📝 Testing Checklist:"
echo "   [ ] All browser cache cleared"
echo "   [ ] localStorage cleared"
echo "   [ ] Server restarted"
echo "   [ ] Database cleared (optional)"
echo "   [ ] Fresh page load"
echo ""
echo "🔍 What to Test:"
echo "   1. Add new cash flow → Table updates immediately?"
echo "   2. Edit cash flow → Table updates immediately?"
echo "   3. Delete cash flow → Record removed immediately?"
echo "   4. No console errors about cache?"
echo "   5. Network tab shows fresh requests (no 304)?"
echo ""















