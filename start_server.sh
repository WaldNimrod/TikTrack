#!/bin/bash

# TikTrack Server Startup Script
# ==============================
#
# Unified server startup with process conflict detection and streamlined
# foreground debugging that still returns control to Cursor/automation flows.
#
# Purpose: Start TikTrack server safely with conflict detection
# Location: start_server.sh (project root)
# Integration: Uses Backend/utils/server_lock_manager.py
# NOTE: Development runs on port 8080. Use `--env production` (or run
#       start_production.sh) for the isolated production stack on port 5001.
#
# Database: PostgreSQL (default for development since November 2025)
# - Automatically sets PostgreSQL environment variables if not already set
# - Checks PostgreSQL Docker container before starting
# - Falls back to SQLite only if explicitly configured
#
# Features:
# - Process conflict detection
# - Detailed error messages
# - Automatic background execution with PID tracking
# - Optional live log attachment (`--attach`)
# - Startup health check before returning control
# - PostgreSQL container verification
# - Automatic PostgreSQL environment setup

set -e

# Configuration defaults
SCRIPT_NAME="TikTrack Server Startup"
VERSION="1.2.0"
ENVIRONMENT="development"
SERVER_DIR="Backend"
SERVER_FILE="$SERVER_DIR/app.py"
LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
SERVER_PORT=8080
DB_PATH="$SERVER_DIR/db/tiktrack.db"
ATTACH_LOGS=false
FORCE_START=false
CHECK_ONLY=false
SERVER_PID=""
TAIL_PID=""
SERVER_READY=false
SERVER_ABS_DIR=""
OUTPUT_LOG=""
PID_FILE=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

show_help() {
    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help        Show this help message"
    echo "  --check-only      Only check for conflicts, don't start server"
    echo "  --force           Force start even if conflicts detected (DANGEROUS)"
    echo "  --env <env>       Environment (development | production)"
    echo "                    Shorthand: --prod, --production"
    echo "  --attach          Follow live logs and keep script open (Ctrl+C exits tail)"
    echo ""
    echo "Description:"
    echo "  Starts TikTrack server with automatic conflict detection."
    echo "  By default the server is started with nohup in the background so"
    echo "  command line control returns immediately once health checks pass."
    echo "  Use --attach for hands-on debugging with live logs."
    echo ""
}

check_python() {
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 is not installed or not in PATH"
        exit 1
    fi
    log_info "Python3 found: $(python3 --version)"
}

setup_postgresql_env() {
    # Set PostgreSQL env vars if not already set
    if [ -z "$POSTGRES_HOST" ]; then
        if [ "$ENVIRONMENT" = "development" ]; then
            log_info "Setting PostgreSQL environment variables (development defaults)..."
            export POSTGRES_HOST=localhost
            export POSTGRES_DB=TikTrack-db-development
            export POSTGRES_USER=TikTrakDBAdmin
            export POSTGRES_PASSWORD="BigMeZoo1974!?"
            log_success "PostgreSQL environment variables configured for development"
        elif [ "$ENVIRONMENT" = "production" ]; then
            log_info "Setting PostgreSQL environment variables (production defaults)..."
            export POSTGRES_HOST=localhost
            export POSTGRES_DB=TikTrack-db-development
            export POSTGRES_USER=TikTrakDBAdmin
            export POSTGRES_PASSWORD="BigMeZoo1974!?"
            log_success "PostgreSQL environment variables configured for production"
            log_warning "Production is using development database (TikTrack-db-development)"
        fi
    else
        log_info "PostgreSQL environment variables already set (using existing values)"
    fi
}

check_postgresql_container() {
    # Only check in development mode when using PostgreSQL
    if [ "$ENVIRONMENT" = "development" ] && [ -n "$POSTGRES_HOST" ]; then
        log_header "Checking PostgreSQL container..."
        
        if ! command -v docker &> /dev/null; then
            log_warning "Docker not found - skipping PostgreSQL container check"
            return 0
        fi
        
        if docker ps --format '{{.Names}}' | grep -q 'tiktrack-postgres-dev'; then
            local container_status=$(docker ps --filter "name=tiktrack-postgres-dev" --format '{{.Status}}')
            log_success "PostgreSQL container is running: $container_status"
            
            # Check if container is healthy
            if echo "$container_status" | grep -q 'healthy'; then
                log_success "PostgreSQL container is healthy"
            else
                log_warning "PostgreSQL container is running but not yet healthy"
                log_info "Waiting for container to become healthy..."
                local attempts=0
                local max_attempts=30
                while [ $attempts -lt $max_attempts ]; do
                    if docker ps --filter "name=tiktrack-postgres-dev" --format '{{.Status}}' | grep -q 'healthy'; then
                        log_success "PostgreSQL container is now healthy"
                        return 0
                    fi
                    sleep 1
                    attempts=$((attempts + 1))
                done
                log_warning "PostgreSQL container did not become healthy within $max_attempts seconds"
                log_warning "Server will start anyway, but database connection may fail"
            fi
        else
            log_warning "PostgreSQL container 'tiktrack-postgres-dev' is not running"
            log_info "To start it, run: docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev"
            log_warning "Server will start anyway, but database connection will fail"
        fi
    fi
}

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

check_conflicts() {
    log_header "Checking for existing server processes..."
    if python3 "$LOCK_MANAGER" --port "$SERVER_PORT" --check; then
        log_success "No conflicts found - server can start safely"
        return 0
    else
        log_error "Conflicts detected - server startup blocked"
        return 1
    fi
}

print_recent_logs() {
    if [ -f "$OUTPUT_LOG" ]; then
        tail -n 40 "$OUTPUT_LOG"
    else
        log_warning "Server output log not found yet: $OUTPUT_LOG"
    fi
}

wait_for_server_ready() {
    local attempts=30
    log_info "Waiting for server health endpoint on port $SERVER_PORT..."
    for ((i=1; i<=attempts; i++)); do
        if ! ps -p "$SERVER_PID" >/dev/null 2>&1; then
            log_error "Server process exited unexpectedly during startup (PID $SERVER_PID)"
            print_recent_logs
            return 1
        fi

        if curl -fs "http://127.0.0.1:$SERVER_PORT/api/health" >/dev/null 2>&1; then
            log_success "Health check passed after $i second(s)"
            return 0
        fi
        sleep 1
    done

    log_warning "Server did not respond within $attempts seconds. It may still be starting."
    return 1
}

follow_logs() {
    if [ "$ATTACH_LOGS" = true ]; then
        log_info "Attaching to live logs (Ctrl+C to stop tail – server keeps running)..."
        if [ -f "$OUTPUT_LOG" ]; then
            tail -n 20 -f "$OUTPUT_LOG" &
        else
            log_warning "Log file not found yet, waiting for server output..."
            tail -f "$OUTPUT_LOG" &
        fi
        TAIL_PID=$!
        wait $TAIL_PID || true
    else
        log_info "Recent server output:"
        print_recent_logs
        log_success "Server running in background (PID $SERVER_PID) → http://127.0.0.1:$SERVER_PORT"
        log_info "Follow logs anytime with: tail -f $OUTPUT_LOG"
    fi
}

start_server() {
    log_header "Starting TikTrack Server..."
    log_info "Environment: $(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')"
    log_info "Server directory: $SERVER_ABS_DIR"
    log_info "Port: $SERVER_PORT"
    
    # Display database information
    if [ -n "$POSTGRES_HOST" ]; then
        log_info "Database: PostgreSQL"
        log_info "  Host: ${POSTGRES_HOST}"
        log_info "  Database: ${POSTGRES_DB}"
        log_info "  User: ${POSTGRES_USER}"
    elif [ -n "$DB_PATH" ]; then
        log_info "Database: SQLite ($(basename "$DB_PATH"))"
    fi

    pushd "$SERVER_ABS_DIR" >/dev/null
    touch "$OUTPUT_LOG"
    chmod 644 "$OUTPUT_LOG" 2>/dev/null || true
    log_info "Server output redirected to: $OUTPUT_LOG"

    # Export PostgreSQL environment variables for the server process
    if [ -n "$POSTGRES_HOST" ]; then
        export POSTGRES_HOST
        export POSTGRES_DB
        export POSTGRES_USER
        export POSTGRES_PASSWORD
        export POSTGRES_PORT
    fi

    nohup env POSTGRES_HOST="$POSTGRES_HOST" POSTGRES_DB="$POSTGRES_DB" POSTGRES_USER="$POSTGRES_USER" POSTGRES_PASSWORD="$POSTGRES_PASSWORD" POSTGRES_PORT="${POSTGRES_PORT:-5432}" python3 app.py >> "$OUTPUT_LOG" 2>&1 &
    SERVER_PID=$!
    popd >/dev/null

    echo "$SERVER_PID" > "$PID_FILE"
    log_info "Server PID recorded in $PID_FILE"

    sleep 1
    if ! ps -p "$SERVER_PID" >/dev/null 2>&1; then
        log_error "Server process exited immediately. See $OUTPUT_LOG"
        print_recent_logs
        exit 1
    fi

    if wait_for_server_ready; then
        SERVER_READY=true
    fi

    follow_logs
}

handle_shutdown() {
    if [ -n "$TAIL_PID" ] && ps -p "$TAIL_PID" >/dev/null 2>&1; then
        kill "$TAIL_PID" >/dev/null 2>&1 || true
    fi

    if [ "$SERVER_READY" != "true" ] && [ -n "$SERVER_PID" ]; then
        log_warning "Interrupt before startup completed - stopping server PID $SERVER_PID"
        kill "$SERVER_PID" >/dev/null 2>&1 || true
    else
        if [ -n "$SERVER_PID" ]; then
            log_info "Startup helper exiting. Server PID $SERVER_PID continues running."
        fi
    fi

    exit 0
}

main() {
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
            --attach|--attach-logs)
                ATTACH_LOGS=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    case "$ENVIRONMENT" in
        production|prod|PRODUCTION|Prod)
            ENVIRONMENT="production"
            SERVER_DIR="production/Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=5001
            DB_PATH="$SERVER_DIR/db/tiktrack.db"
            ;;
        development|dev|DEVELOPMENT|Dev|"")
            ENVIRONMENT="development"
            SERVER_DIR="Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=8080
            DB_PATH="$SERVER_DIR/db/tiktrack.db"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            echo "Supported environments: development, production"
            exit 1
            ;;
    esac

    SERVER_ABS_DIR="$(cd "$SERVER_DIR" && pwd)"
    OUTPUT_LOG="$SERVER_ABS_DIR/server_output.log"
    PID_FILE="$SERVER_ABS_DIR/.tiktrack_server_pid"

    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo "📅 Started at: $(date '+%H:%M:%S')"
    echo "🎯 Purpose: Safe server startup with conflict detection"
    echo "🛠️ Environment: $(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')"
    echo ""

    check_python
    check_files
    
    # Setup PostgreSQL environment variables (development mode)
    setup_postgresql_env
    
    # Check PostgreSQL container (development mode with PostgreSQL)
    check_postgresql_container

    if [ "$FORCE_START" = false ]; then
        if ! check_conflicts; then
            exit 1
        fi
    else
        log_warning "Skipping conflict check due to --force flag"
    fi

    if [ "$CHECK_ONLY" = true ]; then
        log_success "Conflict check completed successfully"
        exit 0
    fi

    trap handle_shutdown SIGINT SIGTERM
    start_server
    trap - SIGINT SIGTERM
}

main "$@"

