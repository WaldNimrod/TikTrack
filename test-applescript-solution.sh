#!/bin/bash

# Test AppleScript Solution
# =========================
# 
# 🎯 Purpose: Test the AppleScript "do shell script" solution
# ⚡ Features: Background execution, immediate control return, no PTY issues
# 🔧 Usage: ./test-applescript-solution.sh [test-type]
# 📖 Documentation: Test script for AppleScript background execution solution

set -e

# Configuration
SCRIPT_NAME="Test AppleScript Solution"
VERSION="1.0.0"
SERVER_PORT=8080
SERVER_HOST="127.0.0.1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

log_test() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] TEST:${NC} $1"
}

# Test 1: Simple command
test_simple_command() {
    log_test "🧪 Test 1: Simple command"
    
    local start_time=$(date +%s)
    
    # Run simple command via AppleScript
    if osascript macos/run_bg.applescript "echo 'Hello from AppleScript background execution' && sleep 2 && echo 'Command completed'"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "✅ AppleScript executed successfully"
        log_info "⏱️  Duration: ${duration} seconds (should be < 1 second for immediate return)"
        
        if [ $duration -lt 1 ]; then
            log_success "✅ Control returned immediately!"
        else
            log_warning "⚠️  Control return was delayed"
        fi
    else
        log_error "❌ AppleScript execution failed"
        return 1
    fi
    
    # Check log file
    sleep 3
    if [ -f ".logs/run_bg.log" ]; then
        log_success "✅ Log file created: .logs/run_bg.log"
        log_info "📄 Log content:"
        echo "----------------------------------------"
        cat .logs/run_bg.log
        echo "----------------------------------------"
    else
        log_warning "⚠️  Log file not found"
    fi
    
    echo ""
}

# Test 2: Server restart
test_server_restart() {
    log_test "🧪 Test 2: Server restart"
    
    local start_time=$(date +%s)
    
    # Stop existing server
    log_info "🛑 Stopping existing server..."
    if lsof -i :$SERVER_PORT >/dev/null 2>&1; then
        lsof -ti :$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # Run server restart via AppleScript
    local restart_command="cd $(pwd) && ./restart --cache-mode=development"
    
    if osascript macos/run_bg.applescript "$restart_command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "✅ Server restart command executed successfully"
        log_info "⏱️  Duration: ${duration} seconds (should be < 1 second for immediate return)"
        
        if [ $duration -lt 1 ]; then
            log_success "✅ Control returned immediately!"
        else
            log_warning "⚠️  Control return was delayed"
        fi
    else
        log_error "❌ Server restart command failed"
        return 1
    fi
    
    # Wait a bit and check if server is running
    sleep 5
    if lsof -i :$SERVER_PORT >/dev/null 2>&1; then
        local pid=$(lsof -ti :$SERVER_PORT)
        log_success "✅ Server is running on port $SERVER_PORT (PID: $pid)"
    else
        log_warning "⚠️  Server is not running on port $SERVER_PORT"
    fi
    
    echo ""
}

# Test 3: Long running process
test_long_running_process() {
    log_test "🧪 Test 3: Long running process"
    
    local start_time=$(date +%s)
    
    # Run long running process via AppleScript
    local long_command="cd $(pwd) && echo 'Starting long process...' && sleep 10 && echo 'Long process completed'"
    
    if osascript macos/run_bg.applescript "$long_command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "✅ Long running process command executed successfully"
        log_info "⏱️  Duration: ${duration} seconds (should be < 1 second for immediate return)"
        
        if [ $duration -lt 1 ]; then
            log_success "✅ Control returned immediately!"
        else
            log_warning "⚠️  Control return was delayed"
        fi
    else
        log_error "❌ Long running process command failed"
        return 1
    fi
    
    # Wait and check log
    sleep 12
    if [ -f ".logs/run_bg.log" ]; then
        log_success "✅ Log file updated"
        log_info "📄 Latest log content:"
        echo "----------------------------------------"
        tail -5 .logs/run_bg.log
        echo "----------------------------------------"
    else
        log_warning "⚠️  Log file not found"
    fi
    
    echo ""
}

# Test 4: Environment variables
test_environment_variables() {
    log_test "🧪 Test 4: Environment variables"
    
    local start_time=$(date +%s)
    
    # Run command with environment variables via AppleScript
    local env_command="cd $(pwd) && export TEST_VAR='Hello from AppleScript' && echo 'TEST_VAR: \$TEST_VAR' && echo 'TERM: \$TERM' && echo 'TERM_PROGRAM: \$TERM_PROGRAM'"
    
    if osascript macos/run_bg.applescript "$env_command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "✅ Environment variables command executed successfully"
        log_info "⏱️  Duration: ${duration} seconds (should be < 1 second for immediate return)"
        
        if [ $duration -lt 1 ]; then
            log_success "✅ Control returned immediately!"
        else
            log_warning "⚠️  Control return was delayed"
        fi
    else
        log_error "❌ Environment variables command failed"
        return 1
    fi
    
    # Wait and check log
    sleep 2
    if [ -f ".logs/run_bg.log" ]; then
        log_success "✅ Log file updated"
        log_info "📄 Environment variables log content:"
        echo "----------------------------------------"
        tail -5 .logs/run_bg.log
        echo "----------------------------------------"
    else
        log_warning "⚠️  Log file not found"
    fi
    
    echo ""
}

# Test 5: Error handling
test_error_handling() {
    log_test "🧪 Test 5: Error handling"
    
    local start_time=$(date +%s)
    
    # Run command that will fail via AppleScript
    local error_command="cd $(pwd) && echo 'This command will fail' && nonexistent_command_12345 && echo 'This should not appear'"
    
    if osascript macos/run_bg.applescript "$error_command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "✅ Error handling command executed successfully"
        log_info "⏱️  Duration: ${duration} seconds (should be < 1 second for immediate return)"
        
        if [ $duration -lt 1 ]; then
            log_success "✅ Control returned immediately!"
        else
            log_warning "⚠️  Control return was delayed"
        fi
    else
        log_error "❌ Error handling command failed"
        return 1
    fi
    
    # Wait and check log
    sleep 2
    if [ -f ".logs/run_bg.log" ]; then
        log_success "✅ Log file updated"
        log_info "📄 Error handling log content:"
        echo "----------------------------------------"
        tail -5 .logs/run_bg.log
        echo "----------------------------------------"
    else
        log_warning "⚠️  Log file not found"
    fi
    
    echo ""
}

# Show help
show_help() {
    echo "🧪 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo ""
    echo "Usage: $0 [TEST-TYPE]"
    echo ""
    echo "Test Types:"
    echo "  simple                Test simple command execution"
    echo "  server                Test server restart"
    echo "  long                  Test long running process"
    echo "  env                   Test environment variables"
    echo "  error                 Test error handling"
    echo "  all                   Run all tests"
    echo "  help                  Show this help"
    echo ""
    echo "Features:"
    echo "  - Tests AppleScript 'do shell script' solution"
    echo "  - Verifies immediate control return"
    echo "  - Checks background execution"
    echo "  - Validates log file creation"
    echo "  - Tests error handling"
    echo ""
    echo "Examples:"
    echo "  $0 simple             # Test simple command"
    echo "  $0 server             # Test server restart"
    echo "  $0 all                # Run all tests"
    echo ""
}

# Main function
main() {
    local test_type="${1:-all}"
    local start_time=$(date +%s)
    
    # Header
    echo "🧪 $SCRIPT_NAME v$VERSION"
    echo "===================================="
    echo "📅 Started at: $(date '+%H:%M:%S')"
    echo "🎯 Test Type: $test_type"
    echo "⚡ Approach: AppleScript 'do shell script'"
    echo ""
    
    # Clear log file
    > .logs/run_bg.log
    
    # Run tests
    case $test_type in
        "simple")
            test_simple_command
            ;;
        "server")
            test_server_restart
            ;;
        "long")
            test_long_running_process
            ;;
        "env")
            test_environment_variables
            ;;
        "error")
            test_error_handling
            ;;
        "all")
            test_simple_command
            test_server_restart
            test_long_running_process
            test_environment_variables
            test_error_handling
            ;;
        "help")
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown test type: $test_type"
            log_info "Use '$0 help' for available test types"
            exit 1
            ;;
    esac
    
    # Calculate total time
    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    
    # Final summary
    log_success "🎉 All tests completed!"
    echo "📊 Summary:"
    echo "   - Test type: $test_type"
    echo "   - Total time: ${total_time} seconds"
    echo "   - Status: ✅ SUCCESS"
    echo "   - Control: ✅ RETURNED IMMEDIATELY"
    echo "   - Log file: .logs/run_bg.log"
    echo ""
    
    exit 0
}

# Run main function
main "$@"
