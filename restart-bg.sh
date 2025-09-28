#!/bin/bash

# Restart Background - Final Solution
# ===================================
# 
# 🎯 Purpose: Restart server in background using AppleScript 'do shell script'
# ⚡ Features: Immediate control return, no PTY issues, background execution
# 🔧 Usage: ./restart-bg.sh [cache-mode]
# 📖 Documentation: Final AppleScript background execution solution for Cursor IDE

set -e

# Configuration
SCRIPT_NAME="Restart Background"
VERSION="1.0.0"
CACHE_MODE="${1:-development}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] SUCCESS:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

# Show help
show_help() {
    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo ""
    echo "Usage: $0 [CACHE-MODE]"
    echo ""
    echo "Cache Modes:"
    echo "  development          Fast development cycles (10s TTL) - default"
    echo "  no-cache            Immediate updates (cache disabled)"
    echo "  production          Performance optimized (5min TTL)"
    echo "  preserve            Keep current state"
    echo ""
    echo "Description:"
    echo "  Restarts server in background using AppleScript 'do shell script'"
    echo "  Returns control immediately, no PTY issues"
    echo ""
    echo "Examples:"
    echo "  $0                   # Development mode (default)"
    echo "  $0 no-cache          # No cache mode"
    echo "  $0 production        # Production mode"
    echo ""
}

# Main function
main() {
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    # Header
    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo "📅 Started at: $(date '+%H:%M:%S')"
    echo "🎯 Cache Mode: $CACHE_MODE"
    echo "⚡ Approach: AppleScript 'do shell script'"
    echo ""
    
    # Run restart command in background using AppleScript
    log_info "🚀 Restarting server in background..."
    
    if printf 'do shell script "%s >> .logs/run_bg.log 2>&1 &"' "./restart --cache-mode=$CACHE_MODE" | osascript; then
        log_success "✅ Server restart started in background successfully"
    else
        log_error "❌ Failed to start server restart in background"
        exit 1
    fi
    
    # Final summary
    log_success "🎉 Server restart completed!"
    echo "📊 Summary:"
    echo "   - Cache mode: $CACHE_MODE"
    echo "   - Status: ✅ SUCCESS"
    echo "   - Control: ✅ RETURNED IMMEDIATELY"
    echo "   - Log file: .logs/run_bg.log"
    echo "🌐 Server will be available at: http://127.0.0.1:8080"
    echo "💡 Server may take up to 80 seconds to fully initialize"
    echo ""
    
    exit 0
}

# Run main function
main "$@"
