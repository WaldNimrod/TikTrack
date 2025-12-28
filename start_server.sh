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
# NOTE: Environment detection by directory name:
#       - TikTrackApp-Online → Online (port 80/443)
#       - TikTrackApp-Production → Testing (port 5001)
#       - TikTrackApp → Development (port 8080)
#       You can override with --env flag: --env testing, --env development, or --env online
#
# Database: PostgreSQL (default for development since November 2025)
# - Automatically sets PostgreSQL environment variables if not already set
# - Checks PostgreSQL Docker container before starting
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
    echo "  --env <env>       Environment (development | testing | online)"
    echo "                    Shorthand: --prod, --production (deprecated, use --env testing)"
    echo "  --attach          Follow live logs and keep script open (Ctrl+C exits tail)"
    echo ""
    echo "Environment Detection:"
    echo "  The script automatically detects environment from workspace directory name:"
    echo "  - TikTrackApp-Online → Online (port 80/443)"
    echo "  - TikTrackApp-Production → Testing (port 5001)"
    echo "  - TikTrackApp → Development (port 8080)"
    echo "  You can override with --env flag if needed."
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
        elif [ "$ENVIRONMENT" = "testing" ]; then
            log_info "Setting PostgreSQL environment variables (testing defaults)..."
            export POSTGRES_HOST=localhost
            export POSTGRES_DB=TikTrack-db-testing
            export POSTGRES_USER=TikTrakDBAdmin
            export POSTGRES_PASSWORD="BigMeZoo1974!?"
            log_success "PostgreSQL environment variables configured for testing"
        elif [ "$ENVIRONMENT" = "online" ]; then
            log_info "Setting PostgreSQL environment variables (online defaults)..."
            export POSTGRES_HOST=localhost
            export POSTGRES_DB=TikTrack-db-online
            export POSTGRES_USER=TikTrakDBAdmin
            export POSTGRES_PASSWORD="BigMeZoo1974!?"
            log_success "PostgreSQL environment variables configured for online"
        elif [ "$ENVIRONMENT" = "production" ]; then
            # Legacy support - map production to testing
            log_warning "Production environment is deprecated. Mapping to testing."
            log_info "Setting PostgreSQL environment variables (testing defaults)..."
            export POSTGRES_HOST=localhost
            export POSTGRES_DB=TikTrack-db-testing
            export POSTGRES_USER=TikTrakDBAdmin
            export POSTGRES_PASSWORD="BigMeZoo1974!?"
            log_success "PostgreSQL environment variables configured for testing"
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

    # Export TIKTRACK_ENV for Python app to detect environment
    export TIKTRACK_ENV="$ENVIRONMENT"
    
    nohup env TIKTRACK_ENV="$ENVIRONMENT" POSTGRES_HOST="$POSTGRES_HOST" POSTGRES_DB="$POSTGRES_DB" POSTGRES_USER="$POSTGRES_USER" POSTGRES_PASSWORD="$POSTGRES_PASSWORD" POSTGRES_PORT="${POSTGRES_PORT:-5432}" python3 app.py >> "$OUTPUT_LOG" 2>&1 &
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

detect_environment_from_directory() {
    # Detect environment based on workspace directory name
    # TikTrackApp-Online → online (port 80/443)
    # TikTrackApp-Production → testing (port 5001) - changed from production
    # TikTrackApp → development (port 8080)
    
    local workspace_path="$(pwd)"
    local workspace_name="$(basename "$workspace_path")"
    
    # Check for Online in directory name (case-insensitive) - highest priority
    if [[ "$workspace_name" == *"Online"* ]] || [[ "$workspace_name" == *"online"* ]]; then
        echo "online"
        return 0
    # Check for Production in directory name (case-insensitive) - now maps to testing
    elif [[ "$workspace_name" == *"Production"* ]] || [[ "$workspace_name" == *"production"* ]]; then
        echo "testing"
        return 0
    elif [[ "$workspace_name" == "TikTrackApp" ]]; then
        echo "development"
        return 0
    else
        # Default to development if uncertain (safer default)
        log_warning "Could not determine environment from directory name: $workspace_name"
        log_warning "Defaulting to development. Use --env flag to override."
        echo "development"
        return 0
    fi
}

main() {
    # Auto-detect environment from directory name if not explicitly set
    local detected_env=""
    local env_explicitly_set=false
    
    # First pass: check if --env or --production flags are provided
    for arg in "$@"; do
        case $arg in
            --env|--env=*|--production|--prod)
                env_explicitly_set=true
                break
                ;;
        esac
    done
    
    # If environment not explicitly set, detect from directory name
    if [ "$env_explicitly_set" = false ]; then
        detected_env=$(detect_environment_from_directory)
        if [ -n "$detected_env" ]; then
            ENVIRONMENT="$detected_env"
            log_info "Auto-detected environment: $ENVIRONMENT (from workspace directory: $(basename "$(pwd)"))"
        fi
    fi
    
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
        testing|test|TESTING|Test)
            ENVIRONMENT="testing"
            SERVER_DIR="production/Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=5001
            log_info "Environment: TESTING → Port: 5001"
            ;;
        production|prod|PRODUCTION|Prod)
            # Legacy support - map production to testing
            log_warning "Production environment is deprecated. Using testing environment."
            ENVIRONMENT="testing"
            SERVER_DIR="production/Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=5001
            log_info "Environment: TESTING (from production) → Port: 5001"
            ;;
        online|ONLINE|Online)
            ENVIRONMENT="online"
            SERVER_DIR="online/Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=80
            log_info "Environment: ONLINE → Port: 80/443"
            ;;
        development|dev|DEVELOPMENT|Dev|"")
            ENVIRONMENT="development"
            SERVER_DIR="Backend"
            SERVER_FILE="$SERVER_DIR/app.py"
            LOCK_MANAGER="$SERVER_DIR/utils/server_lock_manager.py"
            SERVER_PORT=8080
            log_info "Environment: DEVELOPMENT → Port: 8080"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            echo "Supported environments: development, testing, online"
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
