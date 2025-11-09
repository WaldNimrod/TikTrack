#!/bin/bash

# TikTrack Server Startup Script
# ==============================
# 
# Unified server startup with process conflict detection and prevention
# 
# Purpose: Start TikTrack server safely with conflict detection
# Location: start_server.sh (project root)
# Integration: Uses Backend/utils/server_lock_manager.py
# 
# Features:
# - Process conflict detection
# - Detailed error messages
# - Foreground execution for development
# - Verbose logging
# - Clean shutdown handling

set -e

# Configuration
SCRIPT_NAME="TikTrack Server Startup"
VERSION="1.1.0"
ENVIRONMENT="development"
SERVER_DIR="Backend"
SERVER_FILE="$SERVER_DIR/app.py"
LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
SERVER_PORT=8080
DB_PATH="$SERVER_DIR/db/simpleTrade_new.db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

log_header() {
    echo -e "${PURPLE}[$(date '+%H:%M:%S')] $1${NC}"
}

# Show help
show_help() {
    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --check-only   Only check for conflicts, don't start server"
    echo "  --force        Force start even if conflicts detected (DANGEROUS)"
    echo "  --env <env>    Environment to run (development | production)"
    echo "                 Shorthand: --prod, --production"
    echo ""
    echo "Description:"
    echo "  Starts TikTrack server with automatic conflict detection."
    echo "  Supported environments:"
    echo "    development (default) → Backend/app.py on port 8080"
    echo "    production            → production/Backend/app.py on port 5001"
    echo "  Prevents multiple server instances from running simultaneously."
    echo "  Provides detailed error messages and resolution guidance."
    echo ""
    echo "Examples:"
    echo "  $0                    # Start server normally"
    echo "  $0 --check-only       # Check for conflicts only"
    echo "  $0 --force            # Force start (not recommended)"
    echo ""
}

# Check if Python is available
check_python() {
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 is not installed or not in PATH"
        exit 1
    fi
    
    log_info "Python3 found: $(python3 --version)"
}

# Check if required files exist
check_files() {
    if [ ! -f "$SERVER_FILE" ]; then
        log_error "Server file not found: $SERVER_FILE"
        exit 1
    fi
    
    if [ ! -f "$LOCK_MANAGER" ]; then
        log_error "Lock manager not found: $LOCK_MANAGER"
        exit 1
    fi
    
    if [ -n "$DB_PATH" ] && [ ! -f "$DB_PATH" ]; then
        log_warning "Database file not found: $DB_PATH"
        if [ "$ENVIRONMENT" = "production" ]; then
            log_warning "Please run: cd $SERVER_DIR && python3 scripts/create_production_db.py"
            exit 1
        fi
    fi
    
    log_info "All required files found"
}

# Check for process conflicts
check_conflicts() {
    log_header "Checking for existing server processes..."
    
    # Run the lock manager to check for conflicts on target port
    if python3 "$LOCK_MANAGER" --port "$SERVER_PORT" --check; then
        log_success "No conflicts found - server can start safely"
        return 0
    else
        log_error "Conflicts detected - server startup blocked"
        return 1
    fi
}

# Start the server
start_server() {
    log_header "Starting TikTrack Server..."
    
    # Change to server directory
    cd "$SERVER_DIR"
    
    log_info "Working directory: $(pwd)"
    log_info "Server file: $(basename "$SERVER_FILE")"
    log_info "Environment: $(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')"
    log_info "Port: $SERVER_PORT"
    if [ -n "$DB_PATH" ]; then
        log_info "Database: $(basename "$DB_PATH")"
    fi
    log_info "Starting server in foreground mode..."
    echo ""
    
    # Display server startup information
    echo "🌐 TikTrack Server Starting..."
    echo "📍 URL: http://127.0.0.1:$SERVER_PORT"
    echo "📁 Working Directory: $(pwd)"
    if [ -n "$DB_PATH" ]; then
        echo "🗄️  Database: $(basename "$DB_PATH")"
    fi
    if [ -d "logs" ]; then
        echo "📝 Logs: logs/"
    fi
    echo "📅 Started: $(date)"
    echo "🔄 Mode: $(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]') (Foreground)"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=========================================="
    echo ""
    
    # Start the server with verbose output
    python3 app.py
}

# Handle shutdown gracefully
handle_shutdown() {
    echo ""
    log_header "Server shutdown requested..."
    log_info "Stopping TikTrack server gracefully..."
    log_success "Server stopped successfully"
    exit 0
}

# Main function
main() {
    # Parse command line arguments
    FORCE_START=false
    CHECK_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --env)
                if [ -z "$2" ]; then
                    log_error "Missing value for --env option"
                    exit 1
                fi
                ENVIRONMENT="$2"
                shift 2
                ;;
            --env=*)
                ENVIRONMENT="${1#*=}"
                shift
                ;;
            --production|--prod)
                ENVIRONMENT="production"
                shift
                ;;
            --force)
                FORCE_START=true
                log_warning "Force start enabled - conflicts will be ignored"
                shift
                ;;
            --check-only)
                CHECK_ONLY=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Normalize environment configuration
    case "$ENVIRONMENT" in
        production|prod|PRODUCTION|Prod)
            ENVIRONMENT="production"
            SERVER_DIR="production/Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=5001
            DB_PATH="$SERVER_DIR/db/TikTrack_DB.db"
            ;;
        development|dev|DEVELOPMENT|Dev|"")
            ENVIRONMENT="development"
            SERVER_DIR="Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=8080
            DB_PATH="$SERVER_DIR/db/simpleTrade_new.db"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            echo "Supported environments: development, production"
            exit 1
            ;;
    esac
    
    # Header
    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo "📅 Started at: $(date '+%H:%M:%S')"
    echo "🎯 Purpose: Safe server startup with conflict detection"
    echo "🛠️ Environment: $(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')"
    echo ""
    
    # Pre-flight checks
    check_python
    check_files
    
    # Check for conflicts (unless force start is enabled)
    if [ "$FORCE_START" = false ]; then
        if ! check_conflicts; then
            exit 1
        fi
    else
        log_warning "Skipping conflict check due to --force flag"
    fi
    
    # If check-only mode, exit here
    if [ "$CHECK_ONLY" = true ]; then
        log_success "Conflict check completed successfully"
        exit 0
    fi
    
    # Set up signal handlers for graceful shutdown
    trap handle_shutdown SIGINT SIGTERM
    
    # Start the server
    start_server
}

# Run main function
main "$@"
