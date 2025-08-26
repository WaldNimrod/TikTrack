#!/bin/bash

# TikTrack Quick Server Restart Script
# ====================================
# 
# 🎯 Purpose: Fast server restart for development and testing
# 
# 📖 Documentation: documentation/server/RESTART_SCRIPT_GUIDE.md
# 🔗 Related: documentation/server/README.md
# 
# 🆕 Version: 2.0 (August 24, 2025)
# 🛠️ Features: Quick restart, basic health checks, minimal logging
# 
# ⚡ QUICK MODE FEATURES:
# ======================
# - Fast restart (5-10 seconds)
# - Stops server processes
# - Cleans port conflicts
# - Basic health checks
# - Simple API testing
# - Minimal logging
# 
# 🎯 USE CASES:
# =============
# - Development sessions
# - Testing changes
# - Minor bug fixes
# - Quick restarts
# 
# ❌ LIMITATIONS:
# ===============
# - No deep system checks
# - No cache cleanup
# - No route validation
# - Limited error recovery
# 
# 🚀 USAGE:
# =========
# Direct usage:
#   ./restart_server_quick.sh
# 
# Via unified script:
#   ./restart quick
#   ./restart --quick

set -e  # Exit on any error

# Configuration
SERVER_PORT=8080
SERVER_HOST="127.0.0.1"
MAX_STARTUP_TIME=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Timestamp function
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Logging functions
log_info() {
    echo -e "${BLUE}[$(timestamp)] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(timestamp)] SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(timestamp)] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(timestamp)] ERROR:${NC} $1"
}

# Header
echo "⚡ TikTrack Quick Server Restart Script"
echo "======================================="
echo "📅 Started at: $(timestamp)"
echo "🎯 Purpose: Fast restart for development and testing"
echo ""

# Function to check if server is running
check_server() {
    # Check if there are Python processes running app.py or dev_server.py
    if pgrep -f "python3.*\(app\.py\|dev_server\.py\)" > /dev/null; then
        return 0
    fi
    
    # Also check if port is responding
    if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/" | grep -q "200"; then
        return 0
    fi
    
    return 1
}

# Function to stop server properly
stop_server() {
    log_info "🛑 Stopping server..."
    
    # Kill all Python processes running app.py or dev_server.py
    local processes=$(pgrep -f "python3.*\(app\.py\|dev_server\.py\)" 2>/dev/null || true)
    if [ -n "$processes" ]; then
        log_info "Found server processes: $processes"
        pkill -f "python3.*\(app\.py\|dev_server\.py\)"
        sleep 2
        
        # Force kill if still running
        if check_server; then
            log_warning "Force killing remaining processes..."
            pkill -9 -f "python3.*\(app\.py\|dev_server\.py\)"
            sleep 1
        fi
    fi
    
    # Check if port is in use and kill processes using it
    if lsof -i :$SERVER_PORT > /dev/null 2>&1; then
        log_warning "Port $SERVER_PORT is still in use, killing processes..."
        lsof -ti :$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # Check if server is stopped
    if check_server; then
        log_error "Failed to stop server"
        return 1
    else
        log_success "Server stopped successfully"
        return 0
    fi
}

# Function to check logs for errors
check_logs() {
    log_info "📋 Checking recent logs for errors..."
    
    if [ -f "logs/errors.log" ]; then
        local recent_errors=$(tail -20 "logs/errors.log" | grep -c "ERROR\|CRITICAL" || echo "0")
        if [ $recent_errors -gt 0 ]; then
            log_warning "Found $recent_errors recent errors in logs/errors.log"
            log_info "Recent errors:"
            tail -5 "logs/errors.log" | grep "ERROR\|CRITICAL" || true
        else
            log_success "No recent errors found in logs/errors.log"
        fi
    else
        log_info "No error log file found"
    fi
    
    if [ -f "logs/app.log" ]; then
        log_info "Recent activity in logs/app.log:"
        tail -3 "logs/app.log" || true
    fi
}

# Function to start server
start_server() {
    log_info "🚀 Starting server..."
    
    # Make sure we're in the Backend directory
    if [ ! -f "Backend/dev_server.py" ]; then
        log_error "Backend/dev_server.py not found"
        return 1
    fi
    
    # Start server in background
    cd Backend
    python3 dev_server.py &
    local server_pid=$!
    cd ..
    
    log_info "Server process started with PID: $server_pid"
    
    # Wait for server to start with multiple checks
    log_info "⏳ Waiting for server to start (max $MAX_STARTUP_TIME seconds)..."
    for i in $(seq 1 $MAX_STARTUP_TIME); do
        if check_server; then
            log_success "Server started successfully after $i seconds"
            return 0
        fi
        sleep 1
        
        # Check if process is still running
        if ! kill -0 $server_pid 2>/dev/null; then
            log_error "Server process died during startup (PID: $server_pid)"
            return 1
        fi
    done
    
    log_error "Failed to start server after $MAX_STARTUP_TIME seconds"
    return 1
}

# Function to test API
test_api() {
    log_info "🧪 Testing API..."
    
    # Test main page
    local main_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/")
    if [ "$main_status" = "200" ]; then
        log_success "Main page is accessible (HTTP $main_status)"
    else
        log_error "Main page is not accessible (HTTP $main_status)"
        return 1
    fi
    
    # Test API endpoint
    local api_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/api/v1/accounts/")
    if [ "$api_status" = "200" ]; then
        log_success "API is working (HTTP $api_status)"
        return 0
    else
        log_warning "API returned HTTP $api_status"
        return 1
    fi
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    log_info "=== TikTrack Quick Server Restart Started ==="
    
    # Check current server status
    log_info "📊 Checking current server status..."
    if check_server; then
        log_info "🟢 Server is currently running"
    else
        log_info "🔴 Server is not running"
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
                # Calculate total time
                local end_time=$(date +%s)
                local total_time=$((end_time - start_time))
                
                echo ""
                log_success "=== Quick Server Restart Completed Successfully ==="
                log_info "Total restart time: ${total_time} seconds"
                log_info "Server is available at: http://$SERVER_HOST:$SERVER_PORT"
                
                echo ""
                echo "🎉 Quick restart completed successfully!"
                echo "📊 Summary:"
                echo "   - Total time: ${total_time} seconds"
                echo "   - Status: ✅ SUCCESS"
                echo "🌐 Access your application at: http://$SERVER_HOST:$SERVER_PORT"
                echo ""
            else
                echo ""
                log_warning "Server started but API has issues"
                log_info "📋 Check logs for details"
                echo ""
                echo "⚠️  Server started but API has issues"
                echo "📋 Check logs for details"
                exit 1
            fi
        else
            echo ""
            log_error "Failed to start server"
            log_info "📋 Check logs for details"
            echo ""
            echo "❌ Failed to start server"
            echo "📋 Check logs for details"
            exit 1
        fi
    else
        echo ""
        log_error "Failed to stop server"
        echo ""
        echo "❌ Failed to stop server"
        exit 1
    fi
}

# Run main function
main "$@"
