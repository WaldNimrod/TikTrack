#!/bin/bash

# TikTrack Optimized Server Startup Script
# הפעלת שרת אופטימלי לביצועים משופרים

set -e

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# פונקציה להצגת עזרה
show_help() {
    echo -e "${BLUE}🚀 TikTrack Optimized Server${NC}"
    echo -e "${BLUE}==========================${NC}"
    echo ""
    echo -e "${YELLOW}Usage: $0 [command]${NC}"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo -e "  ${BLUE}start${NC}     - הפעלת השרת האופטימלי"
    echo -e "  ${BLUE}stop${NC}      - עצירת השרת"
    echo -e "  ${BLUE}restart${NC}   - הפעלה מחדש"
    echo -e "  ${BLUE}status${NC}    - בדיקת מצב השרת"
    echo -e "  ${BLUE}monitor${NC}   - ניטור ביצועים בזמן אמת"
    echo -e "  ${BLUE}test${NC}      - בדיקת ביצועים מהירה"
    echo -e "  ${BLUE}help${NC}      - הצגת עזרה זו"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 start"
    echo -e "  $0 monitor"
    echo -e "  $0 test"
}

# פונקציה לבדיקת תלויות
check_dependencies() {
    echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
    
    # בדיקת Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 not found${NC}"
        exit 1
    fi
    
    # בדיקת pip packages
    local missing_packages=()
    
    if ! python3 -c "import flask" &> /dev/null; then
        missing_packages+=("flask")
    fi
    
    if ! python3 -c "import psutil" &> /dev/null; then
        missing_packages+=("psutil")
    fi
    
    if ! python3 -c "import tracemalloc" &> /dev/null; then
        echo -e "${YELLOW}⚠️  tracemalloc not available (Python < 3.4)${NC}"
    fi
    
    if [ ${#missing_packages[@]} -ne 0 ]; then
        echo -e "${YELLOW}📦 Installing missing packages: ${missing_packages[*]}${NC}"
        pip3 install "${missing_packages[@]}"
    fi
    
    echo -e "${GREEN}✅ Dependencies check completed${NC}"
}

# פונקציה לעצירת שרתים קיימים
stop_existing_servers() {
    echo -e "${YELLOW}🛑 Stopping existing servers...${NC}"
    
    # עצירת תהליכי Python
    local python_processes=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{print $2}')
    
    if [ -n "$python_processes" ]; then
        echo -e "${YELLOW}Found Python processes: $python_processes${NC}"
        echo "$python_processes" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        
        # בדיקה אם נשארו תהליכים
        local remaining=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{print $2}')
        if [ -n "$remaining" ]; then
            echo -e "${YELLOW}Force killing remaining processes: $remaining${NC}"
            echo "$remaining" | xargs kill -KILL 2>/dev/null || true
        fi
    else
        echo -e "${GREEN}No existing Python processes found${NC}"
    fi
    
    # בדיקת פורט 8080
    local port_processes=$(lsof -ti:8080 2>/dev/null || true)
    if [ -n "$port_processes" ]; then
        echo -e "${YELLOW}Killing processes using port 8080: $port_processes${NC}"
        echo "$port_processes" | xargs kill -TERM 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Server cleanup completed${NC}"
}

# פונקציה להפעלת השרת האופטימלי
start_optimized_server() {
    echo -e "${GREEN}🚀 Starting optimized server...${NC}"
    
    # בדיקת קובץ השרת
    if [ ! -f "Backend/dev_server_optimized.py" ]; then
        echo -e "${RED}❌ Optimized server file not found: Backend/dev_server_optimized.py${NC}"
        exit 1
    fi
    
    # הפעלת השרת ברקע
    cd Backend
    nohup python3 dev_server_optimized.py > ../logs/optimized_server.log 2>&1 &
    local server_pid=$!
    cd ..
    
    echo -e "${GREEN}✅ Server started with PID: $server_pid${NC}"
    echo "$server_pid" > .optimized_server.pid
    
    # המתנה להפעלה
    echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if curl -s http://127.0.0.1:8080/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server is ready!${NC}"
            echo -e "${BLUE}🌐 Server URL: http://127.0.0.1:8080${NC}"
            echo -e "${BLUE}📊 Health Check: http://127.0.0.1:8080/api/health${NC}"
            echo -e "${BLUE}💾 Memory Status: http://127.0.0.1:8080/api/memory-status${NC}"
            return 0
        fi
        sleep 1
        attempts=$((attempts + 1))
        echo -n "."
    done
    
    echo -e "${RED}❌ Server failed to start within 30 seconds${NC}"
    return 1
}

# פונקציה לבדיקת מצב השרת
check_server_status() {
    echo -e "${BLUE}📊 Server Status Check${NC}"
    echo -e "${BLUE}==================${NC}"
    
    # בדיקת PID
    if [ -f ".optimized_server.pid" ]; then
        local pid=$(cat .optimized_server.pid)
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server process running (PID: $pid)${NC}"
        else
            echo -e "${RED}❌ Server process not running (PID: $pid)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No PID file found${NC}"
    fi
    
    # בדיקת פורט
    if lsof -i:8080 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Port 8080 is active${NC}"
    else
        echo -e "${RED}❌ Port 8080 is not active${NC}"
    fi
    
    # בדיקת תגובת השרת
    if curl -s http://127.0.0.1:8080/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server responding to health check${NC}"
        
        # בדיקת זיכרון
        local memory_info=$(curl -s http://127.0.0.1:8080/api/memory-status 2>/dev/null || echo "{}")
        echo -e "${BLUE}📊 Memory status available${NC}"
    else
        echo -e "${RED}❌ Server not responding to health check${NC}"
    fi
    
    # בדיקת לוגים
    if [ -f "logs/optimized_server.log" ]; then
        echo -e "${BLUE}📝 Log file: logs/optimized_server.log${NC}"
        echo -e "${YELLOW}Last 5 log lines:${NC}"
        tail -5 logs/optimized_server.log
    fi
}

# פונקציה לניטור בזמן אמת
monitor_server() {
    echo -e "${BLUE}📊 Real-time Server Monitor${NC}"
    echo -e "${BLUE}========================${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}"
    echo ""
    
    while true; do
        local timestamp=$(date '+%H:%M:%S')
        
        # בדיקת זיכרון
        local memory_usage=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
        local cpu_usage=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{sum+=$3} END {print sum}')
        
        # בדיקת תגובת השרת
        local response_time=$(curl -s -o /dev/null -w "%{time_total}" http://127.0.0.1:8080/api/health 2>/dev/null || echo "N/A")
        
        # הצגת מידע
        printf "${BLUE}[%s]${NC} Memory: ${GREEN}%.1fMB${NC}, CPU: ${YELLOW}%.1f%%${NC}, Response: ${GREEN}%ss${NC}\n" \
               "$timestamp" "${memory_usage:-0}" "${cpu_usage:-0}" "${response_time:-N/A}"
        
        sleep 5
    done
}

# פונקציה לבדיקת ביצועים מהירה
quick_test() {
    echo -e "${BLUE}⚡ Quick Performance Test${NC}"
    echo -e "${BLUE}======================${NC}"
    
    # בדיקת זיכרון התחלתי
    local initial_memory=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
    echo -e "${YELLOW}Initial memory usage: ${initial_memory:-0}MB${NC}"
    
    # בדיקת 10 בקשות מהירות
    echo -e "${YELLOW}Testing 10 quick requests...${NC}"
    local total_time=0
    local success_count=0
    
    for i in {1..10}; do
        local start_time=$(date +%s.%N)
        if curl -s http://127.0.0.1:8080/api/health > /dev/null 2>&1; then
            local end_time=$(date +%s.%N)
            local request_time=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0")
            total_time=$(echo "$total_time + $request_time" | bc 2>/dev/null || echo "$total_time")
            success_count=$((success_count + 1))
            echo -n "."
        else
            echo -n "x"
        fi
    done
    
    echo ""
    
    # בדיקת זיכרון סופי
    local final_memory=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
    local memory_increase=$(echo "$final_memory - $initial_memory" | bc 2>/dev/null || echo "0")
    local avg_response_time=$(echo "scale=4; $total_time / $success_count" | bc 2>/dev/null || echo "N/A")
    
    echo -e "${GREEN}✅ Quick test completed!${NC}"
    echo -e "${BLUE}📊 Results:${NC}"
    echo -e "  Success rate: ${success_count}/10"
    echo -e "  Average response time: ${avg_response_time}s"
    echo -e "  Memory increase: ${memory_increase}MB"
    echo -e "  Final memory usage: ${final_memory}MB"
}

# פונקציה לעצירת השרת
stop_server() {
    echo -e "${YELLOW}🛑 Stopping optimized server...${NC}"
    
    if [ -f ".optimized_server.pid" ]; then
        local pid=$(cat .optimized_server.pid)
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping process $pid...${NC}"
            kill -TERM "$pid"
            sleep 2
            
            if ps -p "$pid" > /dev/null 2>&1; then
                echo -e "${YELLOW}Force killing process $pid...${NC}"
                kill -KILL "$pid"
            fi
        else
            echo -e "${YELLOW}Process $pid not found${NC}"
        fi
        rm -f .optimized_server.pid
    else
        echo -e "${YELLOW}No PID file found${NC}"
    fi
    
    # עצירת תהליכים נוספים
    stop_existing_servers
    
    echo -e "${GREEN}✅ Server stopped${NC}"
}

# Main script logic
case "${1:-help}" in
    start)
        check_dependencies
        stop_existing_servers
        start_optimized_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 2
        check_dependencies
        start_optimized_server
        ;;
    status)
        check_server_status
        ;;
    monitor)
        monitor_server
        ;;
    test)
        quick_test
        ;;
    help|*)
        show_help
        ;;
esac

