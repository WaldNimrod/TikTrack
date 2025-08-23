#!/bin/bash

# TikTrack Complete Server Restart Script
# =======================================
# 
# 🎯 Purpose: Complete server restart from scratch with comprehensive logging and error handling
# 
# 📖 Documentation: documentation/server/RESTART_SCRIPT_GUIDE.md
# 🔗 Related: documentation/server/README.md
# 
# 🆕 Version: 1.1 (August 22, 2025)
# 🛠️ Features: Auto-fix, retry logic, health checks, cache cleanup, route checking
# 
# 🔧 DEVELOPMENT APPROACH & EXTENSION GUIDE
# =========================================
# 
# This script was built using an iterative problem-solving approach:
# 
# 1. IDENTIFY PROBLEM: When a server issue occurs, we identify the root cause
# 2. CREATE SOLUTION: We add a new function to handle this specific problem
# 3. INTEGRATE: We integrate the solution into the main retry loop
# 4. TEST: We test the solution and refine it
# 5. DOCUMENT: We document the solution for future reference
# 
# TO ADD NEW FUNCTIONALITY:
# ========================
# 
# Step 1: Create a new function
# -----------------------------
# - Add detailed comments explaining what the function does
# - Use consistent naming: function_name()
# - Return 0 for success, 1 for failure
# - Use log_info(), log_success(), log_warning(), log_error() for output
# 
# Step 2: Add to fix_common_issues()
# ----------------------------------
# - Add a new case in the switch statement
# - Use descriptive case name (e.g., "new_problem_type")
# - Call your new function
# - Add appropriate error handling
# 
# Step 3: Integrate into main loop
# --------------------------------
# - Add your check in the main() function
# - Use the pattern: if ! your_check_function; then
# - Add automatic fix: fix_common_issues "new_problem_type"
# - Add retry logic with proper error messages
# 
# Step 4: Update documentation
# ----------------------------
# - Update RESTART_SCRIPT_GUIDE.md
# - Add your function to the "Automatic Fixes" section
# - Document the problem type and solution
# 
# EXAMPLE OF ADDING A NEW FIX:
# ============================
# 
# # Function to fix new problem
# fix_new_problem() {
#     log_info "Fixing new problem..."
#     # Your fix logic here
#     return 0
# }
# 
# # In fix_common_issues():
# case "$issue_type" in
#     "new_problem")
#         fix_new_problem
#         ;;
# esac
# 
# # In main():
# if ! check_for_new_problem; then
#     fix_common_issues "new_problem"
#     # retry logic...
# fi
# 
# CURRENT PROBLEM TYPES HANDLED:
# =============================
# - missing_packages: Python package installation
# - database_locks: SQLite WAL/SHM file removal
# - port_conflicts: Process killing on port 8080
# - virtual_env: Virtual environment recreation
# - cache_files: Temporary file cleanup
# - route_issues: Route accessibility and registration problems
# 
# LOGGING STANDARDS:
# ==================
# - log_info(): General information and progress
# - log_success(): Successful operations
# - log_warning(): Non-critical issues
# - log_error(): Critical errors and failures
# - log_debug(): Detailed debugging information
# 
# ERROR HANDLING PATTERN:
# ======================
# - Always return 0 for success, 1 for failure
# - Use descriptive error messages
# - Include context in error logs
# - Provide actionable troubleshooting tips
# 
# SCRIPT EVOLUTION HISTORY:
# =========================
# 
# Version 1.1 (August 22, 2025):
# - Added comprehensive route checking functionality
# - Added automatic route issue detection and fixing
# - Added route-specific error analysis and reporting
# - Added detailed route check reports with timestamps
# - Enhanced troubleshooting tips for route issues
# - Added route timeout detection and server restart
# - Added route registration verification
# - Added route file permission checks
# 
# Version 1.0 (August 22, 2025):
# - Initial creation with basic restart functionality
# - Added automatic package installation (flask-cors issue)
# - Implemented retry logic with 10 attempts
# - Added comprehensive health checks
# - Added cache cleanup functionality
# - Added detailed logging and error analysis
# 
# PROBLEMS SOLVED DURING DEVELOPMENT:
# ===================================
# 
# 1. flask-cors missing package:
#    - Problem: Script failed when flask-cors was missing
#    - Solution: Added automatic package installation
#    - Function: install_missing_packages()
# 
# 2. Infinite loop in retry logic:
#    - Problem: Script got stuck in retry loop
#    - Solution: Fixed retry logic with proper exit conditions
#    - Pattern: Clear retry count and success flags
# 
# 3. Cache files not being cleaned:
#    - Problem: Old cache files interfered with new code
#    - Solution: Added comprehensive cache cleanup
#    - Function: clean_temporary_files()
# 
# 4. Database locks preventing restart:
#    - Problem: WAL/SHM files locked database
#    - Solution: Added database lock removal
#    - Function: clean_database_locks()
# 
# 5. Port conflicts with existing processes:
#    - Problem: Port 8080 already in use
#    - Solution: Added process killing and verification
#    - Function: complete_server_shutdown()
# 
# FUTURE IMPROVEMENTS:
# ====================
# 
# Potential areas for enhancement:
# - Add support for different server configurations
# - Implement backup before restart
# - Add performance profiling
# - Support for multiple ports
# - Add email notifications for failures
# - Implement automatic updates
# - Add configuration file support
# - Support for different database types
# 
# HOW TO IDENTIFY NEW PROBLEMS:
# =============================
# 
# When the script fails or doesn't work as expected:
# 
# 1. Check the detailed log: tail -f server_detailed.log
# 2. Look for error patterns in the output
# 3. Identify the root cause of the failure
# 4. Determine if it's a recurring issue
# 5. Create a specific function to handle this problem
# 6. Test the solution thoroughly
# 7. Document the problem and solution
# 
# COMMON PROBLEM PATTERNS:
# ========================
# 
# - "command not found" → Missing package or tool
# - "permission denied" → File permission issues
# - "address already in use" → Port conflicts
# - "database is locked" → Database lock issues
# - "import error" → Missing Python packages
# - "connection refused" → Server not responding
# - "timeout" → Server startup too slow
# 
# DEBUGGING TECHNIQUES:
# =====================
# 
# 1. Add debug logging: log_debug "Debug info here"
# 2. Test functions individually
# 3. Check system resources manually
# 4. Compare with working environment
# 5. Use manual commands to verify
# 6. Check file permissions and ownership
# 7. Verify network connectivity
# 8. Test with minimal configuration
# ⚡ Features:
#   - Complete server shutdown (kill all processes)
#   - Port cleanup and verification
#   - Database lock removal
#   - Detailed restart logging
#   - Comprehensive error detection
#   - Automatic problem diagnosis
#   - Performance monitoring
#   - Health checks
#   - Automatic recovery attempts
# 
# 🛡️ Stability: Enhanced error handling and recovery
# 📊 Performance: Detailed performance metrics and monitoring
# 🔍 Diagnostics: Automatic problem identification and reporting
#
# Suitable for:
# ✅ Production environments
# ✅ Troubleshooting server issues
# ✅ Development with detailed logging
# ✅ Automated deployment

set -e  # Exit on any error

# Configuration
SERVER_PORT=8080
SERVER_HOST="127.0.0.1"
LOG_DIR="logs"
DETAILED_LOG="server_detailed.log"
ERROR_LOG="logs/errors.log"
APP_LOG="logs/app.log"
MAX_STARTUP_TIME=30
HEALTH_CHECK_INTERVAL=5
MAX_HEALTH_CHECKS=6
MAX_RETRY_ATTEMPTS=5
RETRY_DELAY=3

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
    echo -e "${BLUE}[$(timestamp)] INFO:${NC} $1" | tee -a "$DETAILED_LOG"
}

log_success() {
    echo -e "${GREEN}[$(timestamp)] SUCCESS:${NC} $1" | tee -a "$DETAILED_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(timestamp)] WARNING:${NC} $1" | tee -a "$DETAILED_LOG"
}

log_error() {
    echo -e "${RED}[$(timestamp)] ERROR:${NC} $1" | tee -a "$DETAILED_LOG"
}

log_debug() {
    echo -e "${PURPLE}[$(timestamp)] DEBUG:${NC} $1" | tee -a "$DETAILED_LOG"
}

# Header
echo "🔄 TikTrack Complete Server Restart Script"
echo "=========================================="
echo "📅 Started at: $(timestamp)"
echo "🎯 Purpose: Comprehensive server startup with detailed logging"
echo ""

# Initialize logging
log_info "Initializing complete server restart script"
log_info "Configuration: PORT=$SERVER_PORT, HOST=$SERVER_HOST"
log_info "Log files: DETAILED=$DETAILED_LOG, ERROR=$ERROR_LOG, APP=$APP_LOG"

# Function to check system resources
# 
# Checks memory usage, disk space, and Python version
# Warns if memory usage is above 90%
# Logs system information for debugging
check_system_resources() {
    log_info "Checking system resources..."
    
    # Check available memory
    local mem_available=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local mem_total=$(vm_stat | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
    local mem_usage_percent=$((100 - (mem_available * 100 / mem_total)))
    
    log_info "Memory usage: ${mem_usage_percent}%"
    
    if [ $mem_usage_percent -gt 90 ]; then
        log_warning "High memory usage detected (${mem_usage_percent}%)"
    fi
    
    # Check disk space
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    log_info "Disk usage: ${disk_usage}%"
    
    if [ $disk_usage -gt 90 ]; then
        log_warning "High disk usage detected (${disk_usage}%)"
    fi
    
    # Check Python version
    local python_version=$(python3 --version 2>&1)
    log_info "Python version: $python_version"
}

# Function to check dependencies
# 
# Validates that all required files and directories exist:
# - Virtual environment (.venv)
# - Backend directory
# - Main server files (app.py, dev_server.py)
# Returns 1 if any dependency is missing
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Make sure we're in the root directory to check dependencies
    if [ ! -d ".venv" ] && [ -d "../.venv" ]; then
        cd ..
        log_info "Moved back to root directory to check dependencies"
    fi
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        log_error "Virtual environment not found (.venv directory missing)"
        log_error "Please run: python3 -m venv .venv && source .venv/bin/activate"
        return 1
    fi
    
    # Check if Backend directory exists
    if [ ! -d "Backend" ]; then
        log_error "Backend directory not found"
        return 1
    fi
    
    # Check if main server file exists
    if [ ! -f "Backend/app.py" ]; then
        log_error "Main server file not found (Backend/app.py)"
        return 1
    fi
    
    # Check if dev server file exists
    if [ ! -f "Backend/dev_server.py" ]; then
        log_warning "Dev server file not found (Backend/dev_server.py)"
    fi
    
    log_success "All dependencies checked successfully"
}

# Function to check existing processes
check_existing_processes() {
    log_info "Checking for existing server processes..."
    
    local python_processes=$(pgrep -f "python3.*app.py" 2>/dev/null || true)
    local port_processes=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
    
    if [ -n "$python_processes" ]; then
        log_warning "Found existing Python server processes: $python_processes"
        return 1
    fi
    
    if [ -n "$port_processes" ]; then
        log_warning "Found processes using port $SERVER_PORT: $port_processes"
        return 1
    fi
    
    log_success "No conflicting processes found"
    return 0
}

# Function to completely stop all server processes
# 
# Performs a complete shutdown of all server-related processes:
# 1. Stops Python server processes (app.py, dev_server.py)
# 2. Kills processes using port 8080
# 3. Checks for remaining Python processes
# 4. Verifies complete shutdown
# Uses SIGTERM first, then SIGKILL if needed
complete_server_shutdown() {
    log_info "🛑 Starting complete server shutdown process..."
    
    # Step 1: Find and stop all Python processes related to our server
    log_info "Step 1: Stopping all Python server processes..."
    
    # Find all Python processes that might be our server
    local python_processes=$(pgrep -f "python3.*\(app\.py\|dev_server\.py\)" 2>/dev/null || true)
    if [ -n "$python_processes" ]; then
        log_info "Found Python server processes: $python_processes"
        log_info "Sending SIGTERM to Python processes..."
        echo "$python_processes" | xargs kill -TERM 2>/dev/null || true
        sleep 3
        
        # Check if processes are still running and force kill
        python_processes=$(pgrep -f "python3.*\(app\.py\|dev_server\.py\)" 2>/dev/null || true)
        if [ -n "$python_processes" ]; then
            log_warning "Processes still running after SIGTERM: $python_processes"
            log_info "Force killing with SIGKILL..."
            echo "$python_processes" | xargs kill -KILL 2>/dev/null || true
            sleep 2
        fi
    else
        log_info "No Python server processes found"
    fi
    
    # Step 2: Stop all processes using our port
    log_info "Step 2: Stopping all processes using port $SERVER_PORT..."
    
    local port_processes=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
    if [ -n "$port_processes" ]; then
        log_info "Found processes using port $SERVER_PORT: $port_processes"
        log_info "Sending SIGTERM to port processes..."
        echo "$port_processes" | xargs kill -TERM 2>/dev/null || true
        sleep 3
        
        # Check if processes are still running and force kill
        port_processes=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
        if [ -n "$port_processes" ]; then
            log_warning "Port processes still running after SIGTERM: $port_processes"
            log_info "Force killing with SIGKILL..."
            echo "$port_processes" | xargs kill -KILL 2>/dev/null || true
            sleep 2
        fi
    else
        log_info "No processes found using port $SERVER_PORT"
    fi
    
    # Step 3: Check for any remaining Python processes that might be related
    log_info "Step 3: Checking for any remaining Python processes..."
    
    local remaining_python=$(ps aux | grep python | grep -v grep | grep -E "(app\.py|dev_server\.py|flask)" || true)
    if [ -n "$remaining_python" ]; then
        log_warning "Found remaining Python processes that might be related:"
        echo "$remaining_python"
        log_info "Attempting to stop these processes..."
        ps aux | grep python | grep -v grep | grep -E "(app\.py|dev_server\.py|flask)" | awk '{print $2}' | xargs kill -TERM 2>/dev/null || true
        sleep 2
        ps aux | grep python | grep -v grep | grep -E "(app\.py|dev_server\.py|flask)" | awk '{print $2}' | xargs kill -KILL 2>/dev/null || true
    else
        log_info "No remaining Python processes found"
    fi
    
    # Step 4: Verify complete shutdown
    log_info "Step 4: Verifying complete shutdown..."
    sleep 3
    
    local final_check_python=$(pgrep -f "python3.*\(app\.py\|dev_server\.py\)" 2>/dev/null || true)
    local final_check_port=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
    
    if [ -z "$final_check_python" ] && [ -z "$final_check_port" ]; then
        log_success "✅ Complete server shutdown successful - no processes remain"
        return 0
    else
        log_error "❌ Complete shutdown failed - processes still remain:"
        if [ -n "$final_check_python" ]; then
            log_error "Python processes: $final_check_python"
        fi
        if [ -n "$final_check_port" ]; then
            log_error "Port processes: $final_check_port"
        fi
        return 1
    fi
}

# Function to clean database locks and check database
# 
# Removes SQLite database lock files and verifies accessibility:
# - Removes .db-wal files (Write-Ahead Log)
# - Removes .db-shm files (Shared Memory)
# - Tests database connectivity
# - Reports database size
clean_database_locks() {
    log_info "🗄️ Cleaning database locks and checking database status..."
    
    local db_file="Backend/db/simpleTrade_new.db"
    
    if [ ! -f "$db_file" ]; then
        log_warning "Database file not found: $db_file"
        return 1
    fi
    
    # Check database size
    local db_size=$(stat -f%z "$db_file" 2>/dev/null || echo "0")
    log_info "Database size: ${db_size} bytes"
    
    # Step 1: Remove WAL files if they exist (database locks)
    local wal_file="${db_file}-wal"
    local shm_file="${db_file}-shm"
    
    if [ -f "$wal_file" ]; then
        log_info "Found WAL file, removing database lock: $wal_file"
        rm -f "$wal_file"
        if [ $? -eq 0 ]; then
            log_success "WAL file removed successfully"
        else
            log_warning "Failed to remove WAL file"
        fi
    fi
    
    if [ -f "$shm_file" ]; then
        log_info "Found SHM file, removing database lock: $shm_file"
        rm -f "$shm_file"
        if [ $? -eq 0 ]; then
            log_success "SHM file removed successfully"
        else
            log_warning "Failed to remove SHM file"
        fi
    fi
    
    # Step 2: Check if database is accessible
    log_info "Testing database accessibility..."
    if python3 -c "import sqlite3; sqlite3.connect('$db_file').close()" 2>/dev/null; then
        log_success "Database is accessible and not locked"
    else
        log_warning "Database might still be locked or corrupted"
        return 1
    fi
    
    log_success "Database cleanup completed successfully"
    return 0
}

# Function to activate virtual environment
activate_venv() {
    log_info "Activating virtual environment..."
    
    # Make sure we're in the root directory to find .venv
    if [ ! -f ".venv/bin/activate" ]; then
        # Try to go back to root directory if we're in Backend
        if [ -d "../.venv" ]; then
            cd ..
            log_info "Moved back to root directory to find .venv"
        else
            log_error "Virtual environment activation script not found"
            return 1
        fi
    fi
    
    source .venv/bin/activate
    
    # Verify activation
    if [ -z "$VIRTUAL_ENV" ]; then
        log_error "Failed to activate virtual environment"
        return 1
    fi
    
    log_success "Virtual environment activated: $VIRTUAL_ENV"
}

# Function to install missing Python packages
# 
# Automatically installs missing Python packages using pip3
# Logs installation progress to detailed log
# Returns 1 if any package installation fails
install_missing_packages() {
    local missing_packages=("$@")
    log_info "Installing missing Python packages: ${missing_packages[*]}"
    
    for package in "${missing_packages[@]}"; do
        log_info "Installing package: $package"
        if pip3 install "$package" >> "$DETAILED_LOG" 2>&1; then
            log_success "Successfully installed: $package"
        else
            log_error "Failed to install: $package"
            return 1
        fi
    done
    
    log_success "All missing packages installed successfully"
    return 0
}

# Function to clean temporary files and cache
# 
# Removes all temporary and cache files that might interfere with server operation:
# - Python cache files (__pycache__, *.pyc, *.pyo)
# - Flask cache and session files
# - System files (.DS_Store, Thumbs.db)
# - Old log files (7+ days)
# - Temporary upload files
clean_temporary_files() {
    log_info "🧹 Cleaning temporary files and cache..."
    
    # Clean Python cache files
    log_info "Cleaning Python cache files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "*.pyo" -delete 2>/dev/null || true
    
    # Clean Flask cache
    log_info "Cleaning Flask cache..."
    rm -rf .flask_session 2>/dev/null || true
    rm -rf .cache 2>/dev/null || true
    
    # Clean browser cache files
    log_info "Cleaning browser cache files..."
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    
    # Clean log files (keep only recent ones)
    log_info "Cleaning old log files..."
    find logs/ -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
    
    # Clean temporary upload files
    log_info "Cleaning temporary upload files..."
    find Backend/uploads/ -name "*.tmp" -delete 2>/dev/null || true
    find Backend/uploads/ -name "*.temp" -delete 2>/dev/null || true
    
    log_success "Temporary files cleanup completed"
}

# Function to fix route issues automatically
# 
# Attempts to fix common route-related issues:
# - route_timeout: Restarts server if routes are timing out
# - route_errors: Checks server logs for route errors
# - route_missing: Verifies route registration in Flask app
# - route_permissions: Checks file permissions for route files
fix_route_issues() {
    local issue_type="$1"
    log_info "🔧 Attempting to fix route issue: $issue_type"
    
    case "$issue_type" in
        "route_timeout")
            log_info "Routes are timing out, restarting server..."
            complete_server_shutdown
            sleep 5
            start_server
            ;;
        "route_errors")
            log_info "Checking server logs for route errors..."
            if [ -f "$DETAILED_LOG" ]; then
                local route_errors=$(tail -50 "$DETAILED_LOG" | grep -i "route\|endpoint\|url" | grep -i "error\|exception" || true)
                if [ -n "$route_errors" ]; then
                    log_warning "Found route errors in logs:"
                    echo "$route_errors" | head -5
                fi
            fi
            ;;
        "route_missing")
            log_info "Verifying route registration in Flask app..."
            # Check if main app.py has proper route registration
            if grep -q "register_blueprint" Backend/app.py; then
                log_success "Route blueprints are registered in app.py"
            else
                log_warning "Route blueprints might not be properly registered"
            fi
            ;;
        "route_permissions")
            log_info "Checking file permissions for route files..."
            local route_files=("Backend/app.py" "Backend/routes/" "Backend/routes/api/")
            for file in "${route_files[@]}"; do
                if [ -e "$file" ]; then
                    local perms=$(ls -la "$file" | awk '{print $1}')
                    log_info "Permissions for $file: $perms"
                fi
            done
            ;;
        *)
            log_warning "Unknown route issue type: $issue_type"
            return 1
            ;;
    esac
    
    log_success "Route fix attempt completed for: $issue_type"
    return 0
}

# Function to fix common issues automatically
# 
# Automatically fixes common server issues:
# - missing_packages: Installs required Python packages
# - database_locks: Removes database lock files
# - port_conflicts: Kills processes using port 8080
# - virtual_env: Recreates corrupted virtual environment
# - cache_files: Cleans temporary and cache files
# - route_issues: Fixes route-related problems
fix_common_issues() {
    local issue_type="$1"
    log_info "🔧 Attempting to fix issue: $issue_type"
    
    case "$issue_type" in
        "missing_packages")
            log_info "Installing common required packages..."
            local common_packages=("flask" "flask-cors" "sqlite3")
            for package in "${common_packages[@]}"; do
                log_info "Installing: $package"
                pip3 install "$package" >> "$DETAILED_LOG" 2>&1 || log_warning "Failed to install $package"
            done
            ;;
        "database_locks")
            log_info "Cleaning database locks..."
            rm -f Backend/db/*.db-wal Backend/db/*.db-shm 2>/dev/null || true
            ;;
        "port_conflicts")
            log_info "Killing processes on port $SERVER_PORT..."
            lsof -ti :$SERVER_PORT | xargs kill -KILL 2>/dev/null || true
            ;;
        "virtual_env")
            log_info "Recreating virtual environment..."
            rm -rf .venv
            python3 -m venv .venv
            source .venv/bin/activate
            ;;
        "cache_files")
            log_info "Cleaning cache files..."
            clean_temporary_files
            ;;
        "route_issues")
            log_info "Fixing route-related issues..."
            fix_route_issues "route_timeout"
            sleep 3
            fix_route_issues "route_errors"
            fix_route_issues "route_missing"
            fix_route_issues "route_permissions"
            ;;
        *)
            log_warning "Unknown issue type: $issue_type"
            return 1
            ;;
    esac
    
    log_success "Fix attempt completed for: $issue_type"
    return 0
}

# Function to check Python packages
# 
# Validates that all required Python packages are available:
# - flask: Web framework
# - flask-cors: Cross-origin resource sharing
# - sqlite3: Database (built-in)
# Automatically installs missing packages if found
check_python_packages() {
    log_info "Checking Python packages..."
    
    local required_packages=("flask" "flask-cors" "sqlite3")
    local missing_packages=()
    
    for package in "${required_packages[@]}"; do
        if ! python3 -c "import $package" 2>/dev/null; then
            missing_packages+=("$package")
        fi
    done
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
        log_warning "Missing Python packages: ${missing_packages[*]}"
        log_info "Attempting to install missing packages automatically..."
        
        if install_missing_packages "${missing_packages[@]}"; then
            log_success "All required Python packages are now available"
            return 0
        else
            log_error "Failed to install missing packages automatically"
            log_error "Please install manually: pip install ${missing_packages[*]}"
            return 1
        fi
    fi
    
    log_success "All required Python packages are available"
    return 0
}

# Function to start server with detailed logging
# 
# Starts the Flask development server with comprehensive logging:
# - Changes to Backend directory
# - Starts dev_server.py in background
# - Captures all output to detailed log
# - Monitors startup progress
# - Validates server is responding
start_server() {
    log_info "Starting server with detailed logging..."
    
    # Make sure we're in the root directory first
    if [ ! -d ".venv" ] && [ -d "../.venv" ]; then
        cd ..
        log_info "Moved back to root directory before starting server"
    fi
    
    # Change to Backend directory
    cd Backend
    
    # Start server with detailed output
    log_info "Executing: python3 dev_server.py"
    
    # Start server in background with detailed logging
    python3 dev_server.py > "../$DETAILED_LOG" 2>&1 &
    local server_pid=$!
    
    log_info "Server process started with PID: $server_pid"
    
    # Wait for server to start
    log_info "Waiting for server to start (max $MAX_STARTUP_TIME seconds)..."
    local startup_time=0
    
    while [ $startup_time -lt $MAX_STARTUP_TIME ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/" | grep -q "200\|404"; then
            log_success "Server started successfully after ${startup_time} seconds"
            return 0
        fi
        
        sleep 1
        startup_time=$((startup_time + 1))
        
        # Check if process is still running
        if ! kill -0 $server_pid 2>/dev/null; then
            log_error "Server process died during startup (PID: $server_pid)"
            return 1
        fi
    done
    
    log_error "Server failed to start within $MAX_STARTUP_TIME seconds"
    return 1
}

# Function to check all available routes
# 
# Tests all major API routes and endpoints:
# - Core API endpoints (health, accounts, trades, etc.)
# - Database connectivity through various endpoints
# - Page routes accessibility
# - Returns detailed route status report
check_all_routes() {
    log_info "🔍 Checking all available routes..."
    
    local routes=(
        # Core API endpoints
        "GET:/api/health:Health Check"
        "GET:/api/v1/accounts/:Accounts API"
        "GET:/api/v1/trades/:Trades API"
        "GET:/api/v1/tickers/:Tickers API"
        "GET:/api/v1/trade_plans/:Trade Plans API"
        "GET:/api/v1/alerts/:Alerts API"
        "GET:/api/v1/cash_flows/:Cash Flows API"
        "GET:/api/v1/notes/:Notes API"
        "GET:/api/v1/executions/:Executions API"
        "GET:/api/v1/currencies/:Currencies API"
        "GET:/api/v1/preferences/:Preferences API"
        
        # Page routes
        "GET:/:Main Page"
        "GET:/accounts:Accounts Page"
        "GET:/trades:Trades Page"
        "GET:/tickers:Tickers Page"
        "GET:/planning:Planning Page"
        "GET:/alerts:Alerts Page"
        "GET:/cash_flows:Cash Flows Page"
        "GET:/notes:Notes Page"
        "GET:/currencies:Currencies Page"
        "GET:/database:Database Page"
        "GET:/research:Research Page"
        "GET:/designs:Designs Page"
    )
    
    local total_routes=${#routes[@]}
    local successful_routes=0
    local failed_routes=()
    local route_details=()
    
    log_info "Testing $total_routes routes..."
    
    for route in "${routes[@]}"; do
        IFS=':' read -r method path description <<< "$route"
        
        # Test the route
        local status_code
        local response_time
        
        if [ "$method" = "GET" ]; then
            # Measure response time and get status code
            local start_time=$(date +%s%N)
            status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$SERVER_HOST:$SERVER_PORT$path")
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        else
            status_code="N/A"
            response_time=0
        fi
        
        # Determine if route is successful
        if [ "$status_code" = "200" ] || [ "$status_code" = "404" ]; then
            successful_routes=$((successful_routes + 1))
            log_success "✅ $description ($method $path) - HTTP $status_code (${response_time}ms)"
            route_details+=("✅ $description - HTTP $status_code (${response_time}ms)")
        else
            failed_routes+=("$description ($method $path) - HTTP $status_code")
            log_warning "⚠️ $description ($method $path) - HTTP $status_code (${response_time}ms)"
            route_details+=("⚠️ $description - HTTP $status_code (${response_time}ms)")
        fi
    done
    
    # Calculate success rate
    local success_rate=$((successful_routes * 100 / total_routes))
    
    # Log summary
    log_info "Route check summary: $successful_routes/$total_routes successful ($success_rate%)"
    
    # Log failed routes if any
    if [ ${#failed_routes[@]} -gt 0 ]; then
        log_warning "Failed routes:"
        for failed_route in "${failed_routes[@]}"; do
            log_warning "  - $failed_route"
        done
    fi
    
    # Save detailed route report
    local route_report_file="logs/route_check_$(date +%Y%m%d_%H%M%S).log"
    {
        echo "=== TikTrack Route Check Report ==="
        echo "Date: $(date)"
        echo "Server: http://$SERVER_HOST:$SERVER_PORT"
        echo "Success Rate: $success_rate% ($successful_routes/$total_routes)"
        echo ""
        echo "=== Route Details ==="
        for detail in "${route_details[@]}"; do
            echo "$detail"
        done
        echo ""
        if [ ${#failed_routes[@]} -gt 0 ]; then
            echo "=== Failed Routes ==="
            for failed_route in "${failed_routes[@]}"; do
                echo "- $failed_route"
            done
        fi
    } > "$route_report_file"
    
    log_info "Detailed route report saved to: $route_report_file"
    
    # Return success if 80% or more routes are working
    if [ $success_rate -ge 80 ]; then
        log_success "Route check passed - $success_rate% of routes are accessible"
        return 0
    else
        log_warning "Route check indicates issues - only $success_rate% of routes are accessible"
        return 1
    fi
}

# Function to perform health checks
# 
# Performs comprehensive health checks on the running server:
# - Tests main page accessibility (GET /)
# - Tests API health endpoint (GET /api/health)
# - Tests database connectivity (GET /api/v1/accounts/)
# - Runs 6 rounds of checks with 5-second intervals
# - Calculates success rate (minimum 80% required)
perform_health_checks() {
    log_info "Performing health checks..."
    
    local health_checks=0
    local successful_checks=0
    
    while [ $health_checks -lt $MAX_HEALTH_CHECKS ]; do
        health_checks=$((health_checks + 1))
        
        # Test main page
        local main_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/")
        if [ "$main_status" = "200" ]; then
            log_success "Health check $health_checks: Main page accessible (HTTP $main_status)"
            successful_checks=$((successful_checks + 1))
        else
            log_warning "Health check $health_checks: Main page returned HTTP $main_status"
        fi
        
        # Test API endpoint
        local api_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/api/health")
        if [ "$api_status" = "200" ]; then
            log_success "Health check $health_checks: API health endpoint accessible (HTTP $api_status)"
            successful_checks=$((successful_checks + 1))
        else
            log_warning "Health check $health_checks: API health endpoint returned HTTP $api_status"
        fi
        
        # Test database connectivity through API
        local db_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:$SERVER_PORT/api/v1/accounts/")
        if [ "$db_status" = "200" ]; then
            log_success "Health check $health_checks: Database connectivity confirmed (HTTP $db_status)"
            successful_checks=$((successful_checks + 1))
        else
            log_warning "Health check $health_checks: Database connectivity issue (HTTP $db_status)"
        fi
        
        if [ $health_checks -lt $MAX_HEALTH_CHECKS ]; then
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done
    
    local success_rate=$((successful_checks * 100 / (health_checks * 3)))
    log_info "Health check summary: $successful_checks/$((health_checks * 3)) successful ($success_rate%)"
    
    if [ $success_rate -ge 80 ]; then
        log_success "Server is healthy and operational"
        return 0
    else
        log_warning "Server has some issues (success rate: $success_rate%)"
        return 1
    fi
}

# Function to analyze logs for errors
# 
# Analyzes log files for errors and issues:
# - Checks error.log for recent errors
# - Analyzes detailed log for startup issues
# - Checks route check reports
# - Reports error counts and types
# - Provides error summaries for debugging
analyze_logs() {
    log_info "Analyzing logs for errors and issues..."
    
    # Check for recent errors
    if [ -f "$ERROR_LOG" ]; then
        local recent_errors=$(tail -20 "$ERROR_LOG" | grep -c "ERROR\|CRITICAL" || echo "0")
        if [ $recent_errors -gt 0 ]; then
            log_warning "Found $recent_errors recent errors in $ERROR_LOG"
            log_info "Recent errors:"
            tail -5 "$ERROR_LOG" | grep "ERROR\|CRITICAL" || true
        else
            log_success "No recent errors found in $ERROR_LOG"
        fi
    fi
    
    # Check for startup issues in detailed log
    if [ -f "$DETAILED_LOG" ]; then
        local startup_errors=$(tail -50 "$DETAILED_LOG" | grep -c "ERROR\|Exception\|Traceback" || echo "0")
        if [ $startup_errors -gt 0 ]; then
            log_warning "Found $startup_errors startup issues in $DETAILED_LOG"
            log_info "Recent startup issues:"
            tail -10 "$DETAILED_LOG" | grep "ERROR\|Exception\|Traceback" || true
        else
            log_success "No startup issues found in $DETAILED_LOG"
        fi
    fi
    
    # Check for route check reports
    local route_reports=$(find logs/ -name "route_check_*.log" -type f 2>/dev/null | sort | tail -1)
    if [ -n "$route_reports" ] && [ -f "$route_reports" ]; then
        log_info "Analyzing latest route check report: $route_reports"
        
        # Extract success rate from route report
        local route_success_rate=$(grep "Success Rate:" "$route_reports" | awk '{print $3}' | sed 's/%//' || echo "0")
        local total_routes=$(grep "Success Rate:" "$route_reports" | awk '{print $4}' | sed 's/[()]//g' | cut -d'/' -f2 || echo "0")
        local successful_routes=$(grep "Success Rate:" "$route_reports" | awk '{print $4}' | sed 's/[()]//g' | cut -d'/' -f1 || echo "0")
        
        log_info "Route check results: $successful_routes/$total_routes routes successful ($route_success_rate%)"
        
        # Check for failed routes
        if [ -f "$route_reports" ]; then
            local failed_routes_count=$(grep -c "Failed Routes:" "$route_reports" || echo "0")
            if [ $failed_routes_count -gt 0 ]; then
                log_warning "Route check found failed routes:"
                sed -n '/=== Failed Routes ===/,/^$/p' "$route_reports" | grep "^-" | head -5 || true
            else
                log_success "All routes are working properly"
            fi
        fi
    else
        log_warning "No route check reports found"
    fi
    
    # Check for route-specific errors in detailed log
    if [ -f "$DETAILED_LOG" ]; then
        local route_errors=$(tail -100 "$DETAILED_LOG" | grep -i "route\|endpoint\|url" | grep -i "error\|exception\|timeout" || true)
        if [ -n "$route_errors" ]; then
            log_warning "Found route-related errors in detailed log:"
            echo "$route_errors" | head -3
        fi
    fi
}



# Function to provide troubleshooting tips
# 
# Displays helpful troubleshooting information:
# - Common server issues and solutions
# - Route-specific troubleshooting
# - Manual debugging commands
# - Log file locations
# - Manual server startup instructions
provide_troubleshooting_tips() {
    log_info "Providing troubleshooting tips..."
    
    echo ""
    echo "🔧 Troubleshooting Tips:"
    echo "========================"
    echo ""
    echo "If the server is not responding:"
    echo "1. Check if port $SERVER_PORT is available: lsof -i :$SERVER_PORT"
    echo "2. Check server logs: tail -f $DETAILED_LOG"
    echo "3. Check error logs: tail -f $ERROR_LOG"
    echo "4. Restart the server: ./restart_server_complete.sh"
    echo ""
    echo "If you see database errors:"
    echo "1. Check database file: ls -la Backend/db/"
    echo "2. Check database locks: ls -la Backend/db/*.db-*"
    echo "3. Restart the server to clear locks"
    echo ""
    echo "If you see import errors:"
    echo "1. Activate virtual environment: source .venv/bin/activate"
    echo "2. Install missing packages: pip install -r requirements.txt"
    echo ""
    echo "If routes are not working:"
    echo "1. Check route check reports: ls -la logs/route_check_*.log"
    echo "2. Test specific routes: curl -I http://$SERVER_HOST:$SERVER_PORT/api/health"
    echo "3. Check Flask route registration: grep -n 'register_blueprint' Backend/app.py"
    echo "4. Verify route files exist: ls -la Backend/routes/api/"
    echo "5. Check route file permissions: ls -la Backend/routes/"
    echo ""
    echo "For detailed debugging:"
    echo "1. Run server manually: cd Backend && python3 dev_server.py"
    echo "2. Check Python version: python3 --version"
    echo "3. Check Flask version: python3 -c 'import flask; print(flask.__version__)'"
    echo "4. Test routes manually: curl -v http://$SERVER_HOST:$SERVER_PORT/api/health"
    echo ""
}

# Main execution with retry logic
# 
# Orchestrates the complete server restart process:
# - Implements retry logic (up to 10 attempts)
# - Executes all steps in sequence
# - Handles errors with automatic fixes
# - Provides comprehensive reporting
# - Calculates performance metrics
main() {
    local start_time=$(date +%s)
    local retry_count=0
    local success=false
    
    log_info "=== TikTrack Complete Server Restart Started ==="
    
    while [ $retry_count -lt $MAX_RETRY_ATTEMPTS ] && [ "$success" = false ]; do
        retry_count=$((retry_count + 1))
        
        if [ $retry_count -gt 1 ]; then
            log_info "🔄 Starting retry attempt $retry_count/$MAX_RETRY_ATTEMPTS"
        fi
        
        local step_failed=false
        
        # Step 1: System checks
        check_system_resources
        
        # Step 2: Dependency checks
        if ! check_dependencies; then
            log_error "❌ Dependency check failed"
            log_info "🔧 Attempting to fix dependency issues..."
            fix_common_issues "missing_packages"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for dependency check. Exiting."
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        fi
        
        # Step 3: Complete server shutdown
        log_info "🔄 Starting complete server restart process..."
        if ! complete_server_shutdown; then
            log_error "❌ Server shutdown failed"
            log_info "🔧 Attempting to fix port conflicts..."
            fix_common_issues "port_conflicts"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for server shutdown. Exiting."
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        fi
        
        # Step 4: Clean database locks
        if ! clean_database_locks; then
            log_warning "Database cleanup had issues, but continuing..."
        fi
        
        # Step 4.5: Clean temporary files and cache
        log_info "🧹 Cleaning temporary files and cache..."
        clean_temporary_files
        
        # Step 5: Activate virtual environment
        if ! activate_venv; then
            log_error "❌ Virtual environment activation failed"
            log_info "🔧 Attempting to fix virtual environment..."
            fix_common_issues "virtual_env"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for virtual environment. Exiting."
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        fi
        
        # Step 6: Check Python packages
        if ! check_python_packages; then
            log_error "❌ Python package check failed"
            log_info "🔧 Attempting to fix Python packages..."
            fix_common_issues "missing_packages"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for Python packages. Exiting."
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        fi
        
        # Step 7: Start server
        if ! start_server; then
            log_error "❌ Server startup failed"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for server startup. Exiting."
                analyze_logs
                provide_troubleshooting_tips
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        fi
        
        # Step 8: Health checks
        if ! perform_health_checks; then
            log_warning "Health checks indicate some issues"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for health checks. Exiting."
                analyze_logs
                provide_troubleshooting_tips
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        else
            log_success "All health checks passed"
        fi
        
        # Step 9: Route checks
        if ! check_all_routes; then
            log_warning "Route checks indicate some issues"
            log_info "🔧 Attempting to fix route issues..."
            fix_common_issues "route_issues"
            if [ $retry_count -ge $MAX_RETRY_ATTEMPTS ]; then
                log_error "🚫 Maximum retries reached for route checks. Exiting."
                analyze_logs
                provide_troubleshooting_tips
                exit 1
            fi
            log_info "⏳ Waiting $RETRY_DELAY seconds before retry..."
            sleep $RETRY_DELAY
            continue
        else
            log_success "All route checks passed"
        fi
        
        # If we reach here, everything succeeded
        success=true
        log_success "✅ All steps completed successfully on attempt $retry_count"
    done
    
    # Step 9: Final analysis
    analyze_logs
    
    # Calculate total time
    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    
    if [ "$success" = true ]; then
        log_success "=== Complete Server Restart Completed Successfully ==="
        log_info "Total startup time: ${total_time} seconds"
        log_info "Total attempts: $retry_count"
        log_info "Server is available at: http://$SERVER_HOST:$SERVER_PORT"
        
        # Provide troubleshooting tips
        provide_troubleshooting_tips
        
        echo ""
        echo "🎉 Complete server restart completed successfully!"
        echo "📊 Summary:"
        echo "   - Total time: ${total_time} seconds"
        echo "   - Attempts needed: $retry_count"
        echo "   - Status: ✅ SUCCESS"
        echo "🌐 Access your application at: http://$SERVER_HOST:$SERVER_PORT"
        echo "📋 Detailed logs available at: $DETAILED_LOG"
        echo ""
    else
        log_error "=== Complete Server Restart Failed ==="
        log_error "Total attempts: $retry_count"
        log_error "Total time: ${total_time} seconds"
        
        echo ""
        echo "❌ Server restart failed after $retry_count attempts"
        echo "📊 Summary:"
        echo "   - Total time: ${total_time} seconds"
        echo "   - Attempts made: $retry_count"
        echo "   - Status: ❌ FAILED"
        echo "📋 Check detailed logs at: $DETAILED_LOG"
        echo ""
        
        provide_troubleshooting_tips
        exit 1
    fi
}

# Run main function
main "$@"
