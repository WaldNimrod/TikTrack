#!/bin/bash

# TikTrack Optimized Server Startup Script for Laptops
# ====================================================
#
# 🎯 Purpose: Start memory-optimized development server for laptops
# ⚡ Features: 
#   - Memory monitoring
#   - Automatic cleanup
#   - Performance optimization
#   - Resource management
#
# 🔧 Usage:
#   ./start_optimized.sh          # Start optimized server
#   ./start_optimized.sh monitor  # Start with memory monitoring
#   ./start_optimized.sh clean    # Clean memory and restart
#
# 📊 Memory optimizations:
#   - Reduced logging
#   - Aggressive garbage collection
#   - Limited concurrent connections
#   - Single process mode
#   - Automatic memory cleanup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PORT=8080
HOST="127.0.0.1"
LOG_FILE="logs/optimized_server.log"
ERROR_LOG="logs/optimized_errors.log"
MEMORY_LOG="logs/memory_usage.log"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

print_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to check system resources
check_resources() {
    print_info "Checking system resources..."
    
    # Check available memory
    total_mem=$(sysctl -n hw.memsize | awk '{print $0/1024/1024/1024}')
    free_mem=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    free_mem_mb=$((free_mem * 4096 / 1024 / 1024))
    
    print_info "Total memory: ${total_mem}GB"
    print_info "Available memory: ${free_mem_mb}MB"
    
    if [ $free_mem_mb -lt 1000 ]; then
        print_warning "Low memory available (${free_mem_mb}MB). Consider closing other applications."
    fi
    
    # Check disk space
    disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    print_info "Disk usage: ${disk_usage}%"
    
    if [ $disk_usage -gt 90 ]; then
        print_warning "High disk usage (${disk_usage}%). Consider cleaning up."
    fi
}

# Function to clean memory
clean_memory() {
    print_info "Cleaning memory..."
    
    # Force garbage collection on running Python processes
    pkill -f "python.*dev_server" 2>/dev/null || true
    
    # Clear Python cache
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    # Clear browser cache files
    rm -rf /tmp/.org.chromium.Chromium.* 2>/dev/null || true
    rm -rf /tmp/.com.google.Chrome.* 2>/dev/null || true
    
    print_status "Memory cleanup completed"
}

# Function to install required packages
install_packages() {
    print_info "Checking required packages..."
    
    # Check if psutil is installed
    if ! python3 -c "import psutil" 2>/dev/null; then
        print_info "Installing psutil for memory monitoring..."
        pip3 install psutil
    fi
    
    # Check if flask-cors is installed
    if ! python3 -c "import flask_cors" 2>/dev/null; then
        print_info "Installing flask-cors..."
        pip3 install flask-cors
    fi
    
    print_status "All required packages are available"
}

# Function to start memory monitoring
start_memory_monitor() {
    print_info "Starting memory monitoring..."
    
    # Start background memory monitoring
    (
        while true; do
            if pgrep -f "dev_server_optimized.py" > /dev/null; then
                # Get memory usage of the server process
                SERVER_PID=$(pgrep -f "dev_server_optimized.py")
                if [ ! -z "$SERVER_PID" ]; then
                    MEMORY_USAGE=$(ps -o rss= -p $SERVER_PID | awk '{print $1/1024}')
                    echo "$(date '+%Y-%m-%d %H:%M:%S') - Memory: ${MEMORY_USAGE}MB" >> "$MEMORY_LOG"
                    
                    # Alert if memory usage is high
                    if (( $(echo "$MEMORY_USAGE > 200" | bc -l) )); then
                        print_warning "High memory usage: ${MEMORY_USAGE}MB"
                    fi
                fi
            fi
            sleep 30  # Check every 30 seconds
        done
    ) &
    
    MONITOR_PID=$!
    echo $MONITOR_PID > /tmp/tiktrack_memory_monitor.pid
    print_status "Memory monitoring started (PID: $MONITOR_PID)"
}

# Function to stop memory monitoring
stop_memory_monitor() {
    if [ -f /tmp/tiktrack_memory_monitor.pid ]; then
        MONITOR_PID=$(cat /tmp/tiktrack_memory_monitor.pid)
        kill $MONITOR_PID 2>/dev/null || true
        rm -f /tmp/tiktrack_memory_monitor.pid
        print_status "Memory monitoring stopped"
    fi
}

# Function to start the optimized server
start_server() {
    print_info "Starting TikTrack Optimized Development Server..."
    
    # Check if server is already running
    if pgrep -f "dev_server_optimized.py" > /dev/null; then
        print_warning "Server is already running. Stopping existing instance..."
        pkill -f "dev_server_optimized.py"
        sleep 2
    fi
    
    # Start the optimized server
    cd Backend
    python3 dev_server_optimized.py > "../$LOG_FILE" 2> "../$ERROR_LOG" &
    SERVER_PID=$!
    cd ..
    
    echo $SERVER_PID > /tmp/tiktrack_optimized_server.pid
    
    # Wait for server to start
    print_info "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s "http://$HOST:$PORT/api/health" > /dev/null 2>&1; then
            print_status "✅ Server started successfully (PID: $SERVER_PID)"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 30 ]; then
        print_error "Server failed to start within 30 seconds"
        exit 1
    fi
    
    # Show server info
    print_info "Server URL: http://$HOST:$PORT"
    print_info "Health check: http://$HOST:$PORT/api/health"
    print_info "Memory status: http://$HOST:$PORT/api/memory-status"
    print_info "Log file: $LOG_FILE"
    print_info "Error log: $ERROR_LOG"
}

# Function to show server status
show_status() {
    print_info "Server Status:"
    
    if pgrep -f "dev_server_optimized.py" > /dev/null; then
        SERVER_PID=$(pgrep -f "dev_server_optimized.py")
        MEMORY_USAGE=$(ps -o rss= -p $SERVER_PID | awk '{print $1/1024}')
        UPTIME=$(ps -o etime= -p $SERVER_PID)
        
        print_status "✅ Server is running (PID: $SERVER_PID)"
        print_info "Memory usage: ${MEMORY_USAGE}MB"
        print_info "Uptime: $UPTIME"
        print_info "URL: http://$HOST:$PORT"
    else
        print_error "❌ Server is not running"
    fi
    
    if [ -f /tmp/tiktrack_memory_monitor.pid ]; then
        MONITOR_PID=$(cat /tmp/tiktrack_memory_monitor.pid)
        if kill -0 $MONITOR_PID 2>/dev/null; then
            print_status "✅ Memory monitoring is active (PID: $MONITOR_PID)"
        else
            print_error "❌ Memory monitoring is not running"
        fi
    else
        print_error "❌ Memory monitoring is not running"
    fi
}

# Function to stop server
stop_server() {
    print_info "Stopping TikTrack Optimized Server..."
    
    # Stop memory monitoring
    stop_memory_monitor
    
    # Stop server
    pkill -f "dev_server_optimized.py" 2>/dev/null || true
    
    # Remove PID files
    rm -f /tmp/tiktrack_optimized_server.pid
    rm -f /tmp/tiktrack_memory_monitor.pid
    
    print_status "Server stopped"
}

# Main script logic
case "${1:-start}" in
    "start")
        echo "🚀 TikTrack Optimized Server Startup Script"
        echo "=========================================="
        echo "📅 Started at: $(date)"
        echo "🎯 Mode: optimized for laptops"
        echo ""
        
        check_resources
        install_packages
        start_server
        start_memory_monitor
        
        echo ""
        echo "🎉 Optimized server started successfully!"
        echo "🌐 Access your application at: http://$HOST:$PORT"
        echo "📊 Monitor memory at: http://$HOST:$PORT/api/memory-status"
        echo ""
        echo "💡 Tips for optimal performance:"
        echo "   - Close unnecessary browser tabs"
        echo "   - Avoid running multiple development servers"
        echo "   - Monitor memory usage regularly"
        echo "   - Use './start_optimized.sh status' to check server health"
        ;;
    
    "stop")
        stop_server
        ;;
    
    "restart")
        stop_server
        sleep 2
        $0 start
        ;;
    
    "status")
        show_status
        ;;
    
    "monitor")
        start_memory_monitor
        ;;
    
    "clean")
        clean_memory
        ;;
    
    "logs")
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            print_error "Log file not found: $LOG_FILE"
        fi
        ;;
    
    "errors")
        if [ -f "$ERROR_LOG" ]; then
            tail -f "$ERROR_LOG"
        else
            print_error "Error log not found: $ERROR_LOG"
        fi
        ;;
    
    "memory")
        if [ -f "$MEMORY_LOG" ]; then
            tail -20 "$MEMORY_LOG"
        else
            print_error "Memory log not found: $MEMORY_LOG"
        fi
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status|monitor|clean|logs|errors|memory}"
        echo ""
        echo "Commands:"
        echo "  start    - Start optimized server (default)"
        echo "  stop     - Stop server"
        echo "  restart  - Restart server"
        echo "  status   - Show server status"
        echo "  monitor  - Start memory monitoring"
        echo "  clean    - Clean memory and cache"
        echo "  logs     - Show server logs"
        echo "  errors   - Show error logs"
        echo "  memory   - Show memory usage log"
        exit 1
        ;;
esac

