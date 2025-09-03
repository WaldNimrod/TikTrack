#!/bin/bash

# Development Server Startup Script
# Development Server Startup Script

# 🎯 Purpose: Start a simple and stable Flask development server
# ⚡ Features: 
#   - Flask development server
#   - Debug mode enabled
#   - Detailed logs
#   - Improved stability
# 🛡️ Stability: Flask development server without auto-reload
# 📊 Performance: Suitable for development with low-medium load
#
# Suitable for:
# ✅ Active development
# ✅ Experiments and testing
# ✅ Stable environments
# ❌ Not suitable for production

echo "🚀 Starting TikTrack development server..."

# Check if environment is ready
if [ ! -d "Backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

# Enter Backend directory
cd Backend

# Activate virtual environment
source ../.venv/bin/activate

# Check if there are processes running on the port
echo "🔍 Checking existing processes..."
if lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️  There are processes running on port 8080"
    echo "🔄 Stopping existing processes..."
    lsof -ti :8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start Flask development server
echo "🔄 Starting Flask development server..."
echo "⚡ Flask development server - stable and fast"
echo "📝 Detailed logs enabled"
echo "-" * 50

# Start with dev_server.py - standard configuration
python3 dev_server.py
