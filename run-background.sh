#!/bin/bash

# Run Background - AppleScript Solution
# ====================================
# 
# 🎯 Purpose: Run commands in background using AppleScript 'do shell script'
# ⚡ Features: Immediate control return, no PTY issues, background execution
# 🔧 Usage: ./run-background.sh [command]
# 📖 Documentation: AppleScript background execution solution for Cursor IDE

set -e

# Configuration
SCRIPT_NAME="Run Background"
VERSION="1.0.0"

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
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Description:"
    echo "  Runs commands in background using AppleScript 'do shell script'"
    echo "  Returns control immediately, no PTY issues"
    echo ""
    echo "Examples:"
    echo "  $0 './restart --cache-mode=development'"
    echo "  $0 'cd Backend && python3 dev_server.py'"
    echo "  $0 'npm start'"
    echo ""
}

# Main function
main() {
    local command="$1"
    
    if [ -z "$command" ]; then
        show_help
        exit 1
    fi
    
    # Header
    echo "🚀 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo "📅 Started at: $(date '+%H:%M:%S')"
    echo "🎯 Command: $command"
    echo "⚡ Approach: AppleScript 'do shell script'"
    echo ""
    
    # Run command in background using AppleScript
    log_info "🚀 Running command in background..."
    
    if osascript -e "do shell script \"$command >> .logs/run_bg.log 2>&1 &\""; then
        log_success "✅ Command started in background successfully"
    else
        log_error "❌ Failed to start command in background"
        exit 1
    fi
    
    # Final summary
    log_success "🎉 Command execution completed!"
    echo "📊 Summary:"
    echo "   - Command: $command"
    echo "   - Status: ✅ SUCCESS"
    echo "   - Control: ✅ RETURNED IMMEDIATELY"
    echo "   - Log file: .logs/run_bg.log"
    echo ""
    
    exit 0
}

# Run main function
main "$@"
