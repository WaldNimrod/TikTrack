#!/bin/bash

# AI Analysis System - E2E & Performance Tests Runner
# ==================================================
# 
# Runs E2E and Performance tests for AI Analysis system
# 
# Usage:
#   ./scripts/run-ai-analysis-tests.sh [--browser|--playwright|--performance|--all]
# 
# Options:
#   --browser      Run browser tests only (manual - opens browser)
#   --playwright   Run Playwright E2E tests
#   --performance  Run performance tests only (manual - opens browser)
#   --all          Run all tests (default)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:8080}"
PAGE_URL="${BASE_URL}/trading-ui/ai-analysis.html"
TEST_MODE="${1:---all}"

# Functions
print_header() {
    echo ""
    echo "============================================================"
    echo "$1"
    echo "============================================================"
    echo ""
}

check_server() {
    print_header "Checking Server Status"
    
    if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200"; then
        echo -e "${GREEN}✅ Server is running on ${BASE_URL}${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running on ${BASE_URL}${NC}"
        echo "Please start the server with: ./start_server.sh"
        return 1
    fi
}

run_browser_tests() {
    print_header "Browser Tests (Manual)"
    
    echo -e "${YELLOW}⚠️  Browser tests require manual interaction${NC}"
    echo ""
    echo "Steps:"
    echo "  1. Open: ${PAGE_URL}"
    echo "  2. Open browser console (F12)"
    echo "  3. Run: window.runAllAIAnalysisTests()"
    echo ""
    echo "The test suite will run automatically and show results in console."
    echo ""
    
    # Try to open browser (Mac)
    if command -v open &> /dev/null; then
        read -p "Open browser now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$PAGE_URL"
            echo -e "${GREEN}✅ Browser opened. Run tests in console.${NC}"
        fi
    fi
}

run_performance_tests() {
    print_header "Performance Tests (Manual)"
    
    echo -e "${YELLOW}⚠️  Performance tests require manual interaction${NC}"
    echo ""
    echo "Steps:"
    echo "  1. Open: ${PAGE_URL}"
    echo "  2. Open browser console (F12)"
    echo "  3. Run: window.runAIAnalysisPerformanceTests()"
    echo ""
    echo "The performance test suite will run automatically and show results in console."
    echo ""
    
    # Try to open browser (Mac)
    if command -v open &> /dev/null; then
        read -p "Open browser now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$PAGE_URL"
            echo -e "${GREEN}✅ Browser opened. Run performance tests in console.${NC}"
        fi
    fi
}

install_playwright() {
    print_header "Installing Playwright"
    
    if command -v npx &> /dev/null; then
        echo "Installing Playwright and browsers..."
        npx playwright install --with-deps chromium 2>&1 | grep -v "already installed" || true
        echo -e "${GREEN}✅ Playwright installed${NC}"
    else
        echo -e "${RED}❌ npx not found. Please install Node.js and npm.${NC}"
        return 1
    fi
}

run_playwright_tests() {
    print_header "Running Playwright E2E Tests"
    
    # Check if Playwright is installed
    if ! npx playwright --version &> /dev/null; then
        echo -e "${YELLOW}⚠️  Playwright not found. Installing...${NC}"
        install_playwright
    fi
    
    # Check if test file exists
    TEST_FILE="trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js"
    if [ ! -f "$TEST_FILE" ]; then
        echo -e "${RED}❌ Test file not found: ${TEST_FILE}${NC}"
        return 1
    fi
    
    echo "Running Playwright tests..."
    echo ""
    
    # Run tests
    BASE_URL="$BASE_URL" npx playwright test "$TEST_FILE" --reporter=list
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Playwright tests passed!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Playwright tests failed!${NC}"
        return 1
    fi
}

show_test_instructions() {
    print_header "Test Instructions"
    
    echo "AI Analysis System Tests:"
    echo ""
    echo "1. Browser E2E Tests:"
    echo "   - Open: ${PAGE_URL}"
    echo "   - Console: window.runAllAIAnalysisTests()"
    echo ""
    echo "2. Performance Tests:"
    echo "   - Open: ${PAGE_URL}"
    echo "   - Console: window.runAIAnalysisPerformanceTests()"
    echo ""
    echo "3. Playwright Tests:"
    echo "   - Run: npx playwright test trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js"
    echo ""
    echo "Test files:"
    echo "  - trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js"
    echo "  - trading-ui/scripts/testing/automated/ai-analysis-browser-test.js"
    echo "  - trading-ui/scripts/testing/automated/ai-analysis-performance-test.js"
    echo ""
}

# Main execution
main() {
    print_header "AI Analysis System - E2E & Performance Tests"
    
    # Check server
    if ! check_server; then
        exit 1
    fi
    
    case "$TEST_MODE" in
        --browser)
            run_browser_tests
            ;;
        --playwright)
            run_playwright_tests
            ;;
        --performance)
            run_performance_tests
            ;;
        --all|*)
            show_test_instructions
            echo ""
            read -p "Run Playwright tests automatically? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_playwright_tests
            fi
            echo ""
            run_browser_tests
            run_performance_tests
            ;;
    esac
    
    print_header "Tests Complete"
    echo "Check results above for details."
}

# Run main function
main "$@"

