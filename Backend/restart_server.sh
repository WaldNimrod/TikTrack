#!/bin/bash

# TikTrack Server Restart Script
# This script properly stops the server, checks logs, and restarts it

echo "🔄 TikTrack Server Restart Script"
echo "=================================="

# Function to check if server is running
check_server() {
    # Check if there are Python processes running app.py
    if pgrep -f "python3.*app.py" > /dev/null; then
        return 0
    fi
    
    # Also check if port 8080 is responding
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
        return 0
    fi
    
    return 1
}

# Function to stop server properly
stop_server() {
    echo "🛑 Stopping server..."
    
    # Kill all Python processes running app.py
    pkill -f "python3.*app.py"
    
    # Wait a moment for processes to terminate
    sleep 2
    
    # Force kill if still running
    if check_server; then
        echo "⚠️  Force killing remaining processes..."
        pkill -9 -f "python3.*app.py"
        sleep 1
    fi
    
    # Check if port 8080 is in use and kill processes using it
    if lsof -i :8080 > /dev/null 2>&1; then
        echo "⚠️  Port 8080 is still in use, killing processes..."
        lsof -ti :8080 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # Check if server is stopped
    if check_server; then
        echo "❌ Failed to stop server"
        return 1
    else
        echo "✅ Server stopped successfully"
        return 0
    fi
}

# Function to check logs for errors
check_logs() {
    echo "📋 Checking recent logs for errors..."
    
    if [ -f "logs/errors.log" ]; then
        echo "🔍 Recent errors in logs/errors.log:"
        tail -10 logs/errors.log
        echo ""
    fi
    
    if [ -f "logs/app.log" ]; then
        echo "🔍 Recent activity in logs/app.log:"
        tail -5 logs/app.log
        echo ""
    fi
}

# Function to start server
start_server() {
    echo "🚀 Starting server..."
    
    # Start server in background
    python3 app.py &
    
    # Wait for server to start with multiple checks
    echo "⏳ Waiting for server to start..."
    for i in {1..10}; do
        if check_server; then
            echo "✅ Server started successfully after $i seconds"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ Failed to start server after 10 seconds"
    return 1
}

# Function to test API
test_api() {
    echo "🧪 Testing API..."
    
    # Test main page
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
        echo "✅ Main page is accessible"
    else
        echo "❌ Main page is not accessible"
        return 1
    fi
    
    # Test API endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/accounts/ | grep -q "200"; then
        echo "✅ API is working"
        return 0
    else
        echo "⚠️  API returned non-200 status"
        return 1
    fi
}

# Main execution
echo "📊 Current server status:"
if check_server; then
    echo "🟢 Server is running"
else
    echo "🔴 Server is not running"
fi

echo ""

# Check logs before restart
check_logs

echo ""

# Stop server
if stop_server; then
    echo ""
    
    # Start server
    if start_server; then
        echo ""
        
        # Test API
        if test_api; then
            echo ""
            echo "🎉 Server restart completed successfully!"
            echo "🌐 Server is available at: http://localhost:8080"
        else
            echo ""
            echo "⚠️  Server started but API has issues"
            echo "📋 Check logs for details"
        fi
    else
        echo ""
        echo "❌ Failed to start server"
        echo "📋 Check logs for details"
        exit 1
    fi
else
    echo ""
    echo "❌ Failed to stop server"
    exit 1
fi
