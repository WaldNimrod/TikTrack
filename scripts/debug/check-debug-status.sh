#!/bin/bash

# TikTrack Debug Status Check Script
# -----------------------------------
# Checks the status of all debugging tools and configurations

set -euo pipefail

echo "🔍 TikTrack Debug Status Check"
echo "================================"
echo ""

# Check Firefox debugging
echo "📱 Firefox Debugging:"
if lsof -Pi :6000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ Firefox remote debugging is active on port 6000"
else
    echo "  ❌ Firefox remote debugging is not active"
fi
echo ""

# Check VS Code launch.json
echo "⚙️  VS Code Configuration:"
if [[ -f ".vscode/launch.json" ]]; then
    echo "  ✅ launch.json exists"
    if grep -q "firefox" .vscode/launch.json; then
        echo "  ✅ Firefox configuration found"
    else
        echo "  ⚠️  Firefox configuration not found in launch.json"
    fi
    if grep -q "python" .vscode/launch.json; then
        echo "  ✅ Python configuration found"
    else
        echo "  ⚠️  Python configuration not found in launch.json"
    fi
else
    echo "  ❌ launch.json not found"
fi
echo ""

# Check debug scripts
echo "📜 Debug Scripts:"
for script in "scripts/debug/launch-firefox.sh" "scripts/debug/attach-firefox.sh"; do
    if [[ -f "$script" ]]; then
        if [[ -x "$script" ]]; then
            echo "  ✅ $script (executable)"
        else
            echo "  ⚠️  $script (not executable - run: chmod +x $script)"
        fi
    else
        echo "  ❌ $script (not found)"
    fi
done
echo ""

# Check server status
echo "🖥️  Server Status:"
if curl -s http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "  ✅ Server is running on http://localhost:8080"
else
    echo "  ❌ Server is not running on http://localhost:8080"
fi
echo ""

echo "✅ Status check complete"

exit 0

