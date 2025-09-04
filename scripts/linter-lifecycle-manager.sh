#!/bin/bash
#
# TikTrack Linter Lifecycle Manager
# מנהל מחזור חיים מלא למערכת הלינטר
#

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

show_usage() {
    echo "🏆 TikTrack Linter Lifecycle Manager"
    echo "==================================="
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "📋 Available Commands:"
    echo "  status          - Show current linter status"
    echo "  check           - Run full linter check"
    echo "  fix             - Auto-fix all possible issues"  
    echo "  report          - Generate detailed HTML report"
    echo "  watch           - Start real-time file monitoring"
    echo "  dashboard       - Open linter dashboard"
    echo "  monitor         - Start real-time monitor with server"
    echo "  test            - Test all automation components"
    echo "  install         - Install/setup automation"
    echo "  schedule        - Show cron job templates"
    echo "  stats           - Show detailed statistics"
    echo "  clean           - Clean generated reports and logs"
    echo "  help            - Show this help message"
    echo ""
    echo "🚀 Quick Examples:"
    echo "  $0 status       # Quick status check"
    echo "  $0 monitor      # Full real-time monitoring"
    echo "  $0 dashboard    # Open web dashboard"
    echo ""
}

show_status() {
    echo "📊 TikTrack Linter Status - $(date)"
    echo "================================="
    cd "$PROJECT_DIR"
    
    if [ ! -f "package.json" ]; then
        echo "❌ Project not found in: $PROJECT_DIR"
        exit 1
    fi
    
    # Run linter and capture stats
    output=$(npm run lint 2>&1)
    problems_line=$(echo "$output" | grep -E "problems|warning|error" | tail -1)
    
    if [ ! -z "$problems_line" ]; then
        echo "📈 Current Status: $problems_line"
        
        # Extract numbers for calculations
        total=$(echo "$problems_line" | grep -oE "[0-9]+" | head -1)
        if [ ! -z "$total" ]; then
            improvement=$(echo "scale=1; (1636 - $total) / 1636 * 100" | bc -l 2>/dev/null || echo "N/A")
            echo "🎯 Improvement: ${improvement}% from baseline (1,636 issues)"
            
            # Quality assessment
            if [ "$total" -lt 100 ]; then
                echo "🏆 Quality Level: EXCELLENT"
            elif [ "$total" -lt 300 ]; then
                echo "✅ Quality Level: VERY GOOD"
            elif [ "$total" -lt 500 ]; then
                echo "👍 Quality Level: GOOD"
            else
                echo "⚠️ Quality Level: NEEDS IMPROVEMENT"
            fi
        fi
    else
        echo "🏆 Perfect! No issues found!"
    fi
    
    # Check clean files
    clean_count=$(find "$PROJECT_DIR/trading-ui/scripts" -name "*.js" -exec npx eslint {} \; 2>/dev/null | grep -L "warning\|error" | wc -l)
    echo "📁 Clean files: $clean_count+"
    
    echo ""
    echo "🔧 Automation Status:"
    
    # Check git hook
    if [ -x "$PROJECT_DIR/.git/hooks/pre-commit" ]; then
        echo "✅ Pre-commit hook: Active"
    else
        echo "❌ Pre-commit hook: Not installed"
    fi
    
    # Check node modules
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        echo "✅ Dependencies: Installed"
    else
        echo "❌ Dependencies: Missing"
    fi
    
    # Check reports
    if [ -f "$PROJECT_DIR/lint-report.html" ]; then
        echo "✅ Last report: Available"
    else
        echo "⚠️ Last report: Not found"
    fi
}

run_check() {
    echo "🔍 Running comprehensive linter check..."
    cd "$PROJECT_DIR"
    npm run lint
}

run_fix() {
    echo "🔧 Running auto-fix..."
    cd "$PROJECT_DIR"
    npm run lint:fix
    echo "✅ Auto-fix completed!"
}

generate_report() {
    echo "📊 Generating detailed report..."
    cd "$PROJECT_DIR"
    npm run quality:report
    
    if [ -f "lint-report.html" ]; then
        echo "✅ Report generated: lint-report.html"
        echo "🌐 Open in browser: file://$PROJECT_DIR/lint-report.html"
    else
        echo "❌ Failed to generate report"
    fi
}

start_watch() {
    echo "👀 Starting real-time file monitoring..."
    cd "$PROJECT_DIR"
    
    if command -v node > /dev/null; then
        echo "🚀 Starting advanced watcher..."
        npm run watch:linter
    else
        echo "⚠️ Node.js not found - using basic nodemon..."
        npm run lint:watch
    fi
}

open_dashboard() {
    echo "🏆 Opening linter dashboard..."
    cd "$PROJECT_DIR"
    npm run lint:dashboard
    
    echo "🌐 Dashboard files:"
    echo "  - Basic: create_linter_dashboard.html"  
    echo "  - Advanced: linter-realtime-monitor.html"
    echo "  - Report: lint-report.html"
}

start_monitor() {
    echo "🚀 Starting full monitoring (server + linter)..."
    cd "$PROJECT_DIR"
    npm run monitor:realtime
}

test_automation() {
    echo "🧪 Testing all automation components..."
    cd "$PROJECT_DIR"
    ./scripts/test-automation.sh
}

install_automation() {
    echo "📦 Installing linter automation..."
    cd "$PROJECT_DIR"
    npm install
    ./scripts/setup-linter-automation.sh
}

show_schedule() {
    echo "⏰ Cron Job Templates:"
    echo "====================="
    cat "$PROJECT_DIR/scripts/crontab-template.txt" 2>/dev/null || echo "❌ Template not found"
}

show_stats() {
    echo "📈 Detailed Linter Statistics"
    echo "============================"
    cd "$PROJECT_DIR"
    
    # Detailed breakdown
    output=$(npm run lint 2>&1)
    
    echo "📊 Warning Types Breakdown:"
    echo "$output" | grep "no-unused-vars" | wc -l | xargs echo "  no-unused-vars:"
    echo "$output" | grep "max-len" | wc -l | xargs echo "  max-len:"
    echo "$output" | grep "class-methods-use-this" | wc -l | xargs echo "  class-methods-use-this:"
    echo "$output" | grep "no-console" | wc -l | xargs echo "  no-console:"
    echo "$output" | grep "require-await" | wc -l | xargs echo "  require-await:"
    echo "$output" | grep "no-shadow" | wc -l | xargs echo "  no-shadow:"
    
    echo ""
    echo "📁 File Analysis:"
    total_files=$(find "$PROJECT_DIR/trading-ui/scripts" -name "*.js" | wc -l)
    echo "  Total JS files: $total_files"
    
    # Count clean files
    clean_files=0
    for file in "$PROJECT_DIR/trading-ui/scripts"/*.js; do
        if npx eslint "$file" 2>/dev/null | grep -q "0 problems"; then
            ((clean_files++))
        fi
    done
    echo "  Clean files: $clean_files"
    echo "  Clean ratio: $(echo "scale=1; $clean_files / $total_files * 100" | bc -l)%"
}

clean_reports() {
    echo "🧹 Cleaning generated reports and logs..."
    cd "$PROJECT_DIR"
    
    rm -f lint-report.html daily-lint-*.log linter-status.json
    echo "✅ Cleanup completed!"
}

# Main command handler
case "$1" in
    "status")        show_status ;;
    "check")         run_check ;;
    "fix")           run_fix ;;
    "report")        generate_report ;;
    "watch")         start_watch ;;
    "dashboard")     open_dashboard ;;
    "monitor")       start_monitor ;;
    "test")          test_automation ;;
    "install")       install_automation ;;
    "schedule")      show_schedule ;;
    "stats")         show_stats ;;
    "clean")         clean_reports ;;
    "help"|"--help"|"-h") show_usage ;;
    "")              show_usage ;;
    *)               echo "❌ Unknown command: $1"; show_usage; exit 1 ;;
esac