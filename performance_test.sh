#!/bin/bash

# TikTrack Server Performance Test Script
# בדיקת ביצועי שרת למשך 10 דקות

set -e

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TikTrack Server Performance Test${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}📅 Started at: $(date)${NC}"
echo -e "${YELLOW}⏱️  Duration: 10 minutes${NC}"
echo ""

# יצירת תיקיית לוגים אם לא קיימת
mkdir -p logs

# שם קובץ הלוג
LOG_FILE="logs/performance_test_$(date +%Y%m%d_%H%M%S).log"
SUMMARY_FILE="logs/performance_summary_$(date +%Y%m%d_%H%M%S).txt"

echo -e "${GREEN}📊 Performance test started${NC}"
echo -e "${GREEN}📝 Log file: $LOG_FILE${NC}"
echo -e "${GREEN}📋 Summary file: $SUMMARY_FILE${NC}"
echo ""

# פונקציה לבדיקת זיכרון
check_memory() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local memory_usage=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
    local cpu_usage=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | awk '{sum+=$3} END {print sum}')
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    
    echo "[$timestamp] Memory: ${memory_usage:-0}MB, CPU: ${cpu_usage:-0}%, Disk: ${disk_usage:-0}%" >> "$LOG_FILE"
    
    # בדיקת זיכרון מערכת
    local total_memory=$(sysctl -n hw.memsize 2>/dev/null | awk '{print $0/1024/1024/1024}')
    local available_memory=$(vm_stat 2>/dev/null | grep "Pages free" | awk '{print $3}' | sed 's/\.//' | awk '{print $1*4096/1024/1024/1024}')
    local memory_percent=$(echo "scale=1; (1-$available_memory/$total_memory)*100" | bc 2>/dev/null || echo "N/A")
    
    echo "[$timestamp] System Memory: ${memory_percent}% used" >> "$LOG_FILE"
}

# פונקציה לבדיקת תגובת השרת
test_server_response() {
    local start_time=$(date +%s.%N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/health 2>/dev/null || echo "000")
    local end_time=$(date +%s.%N)
    local response_time=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "N/A")
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Response: $response, Time: ${response_time}s" >> "$LOG_FILE"
}

# פונקציה לבדיקת מספר תהליכים
check_processes() {
    local process_count=$(ps aux | grep -E "(python|flask|dev_server)" | grep -v grep | wc -l)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Active processes: $process_count" >> "$LOG_FILE"
}

# בדיקה ראשונית
echo -e "${YELLOW}🔍 Initial system check...${NC}"
check_memory
check_processes
test_server_response

echo -e "${GREEN}✅ Starting performance monitoring...${NC}"
echo ""

# מעקב למשך 10 דקות (600 שניות)
# בדיקה כל 30 שניות = 20 בדיקות
for i in {1..20}; do
    echo -e "${BLUE}📊 Test $i/20 - $(date '+%H:%M:%S')${NC}"
    
    check_memory
    check_processes
    test_server_response
    
    # חישוב זמן נותר
    remaining=$((20 - i))
    minutes=$((remaining / 2))
    seconds=$(((remaining % 2) * 30))
    
    if [ $i -lt 20 ]; then
        echo -e "${YELLOW}⏳ Next check in 30 seconds... (${minutes}m ${seconds}s remaining)${NC}"
        sleep 30
    fi
done

echo ""
echo -e "${GREEN}✅ Performance test completed!${NC}"

# יצירת סיכום
echo -e "${BLUE}📋 Generating performance summary...${NC}"

# חישוב סטטיסטיקות
echo "=== TikTrack Server Performance Summary ===" > "$SUMMARY_FILE"
echo "Test Date: $(date)" >> "$SUMMARY_FILE"
echo "Duration: 10 minutes" >> "$SUMMARY_FILE"
echo "Log File: $LOG_FILE" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# ניתוח זיכרון
echo "=== Memory Usage Analysis ===" >> "$SUMMARY_FILE"
grep "Memory:" "$LOG_FILE" | awk -F'Memory: ' '{print $2}' | awk -F'MB' '{print $1}' | sort -n | awk '
BEGIN {count=0; sum=0; min=999999; max=0}
{
    count++
    sum+=$1
    if($1<min) min=$1
    if($1>max) max=$1
}
END {
    if(count>0) {
        avg=sum/count
        printf "Memory Usage (MB):\n"
        printf "  Count: %d\n", count
        printf "  Average: %.2f\n", avg
        printf "  Min: %.2f\n", min
        printf "  Max: %.2f\n", max
    }
}' >> "$SUMMARY_FILE"

echo "" >> "$SUMMARY_FILE"

# ניתוח זיכרון מערכת
echo "=== System Memory Analysis ===" >> "$SUMMARY_FILE"
grep "System Memory:" "$LOG_FILE" | awk -F'System Memory: ' '{print $2}' | awk -F'%' '{print $1}' | sort -n | awk '
BEGIN {count=0; sum=0; min=999999; max=0}
{
    if($1 != "N/A") {
        count++
        sum+=$1
        if($1<min) min=$1
        if($1>max) max=$1
    }
}
END {
    if(count>0) {
        avg=sum/count
        printf "System Memory Usage (%%):\n"
        printf "  Count: %d\n", count
        printf "  Average: %.2f\n", avg
        printf "  Min: %.2f\n", min
        printf "  Max: %.2f\n", max
    }
}' >> "$SUMMARY_FILE"

echo "" >> "$SUMMARY_FILE"

# ניתוח תגובות
echo "=== Response Analysis ===" >> "$SUMMARY_FILE"
grep "Response:" "$LOG_FILE" | awk -F'Response: ' '{print $2}' | awk -F',' '{print $1}' | sort | uniq -c | awk '{printf "  HTTP %s: %d times\n", $2, $1}' >> "$SUMMARY_FILE"

echo "" >> "$SUMMARY_FILE"

# ניתוח זמני תגובה
echo "=== Response Time Analysis ===" >> "$SUMMARY_FILE"
grep "Response:" "$LOG_FILE" | awk -F'Time: ' '{print $2}' | awk -F's' '{print $1}' | sort -n | awk '
BEGIN {count=0; sum=0; min=999999; max=0}
{
    if($1 != "N/A") {
        count++
        sum+=$1
        if($1<min) min=$1
        if($1>max) max=$1
    }
}
END {
    if(count>0) {
        avg=sum/count
        printf "Response Time (seconds):\n"
        printf "  Count: %d\n", count
        printf "  Average: %.4f\n", avg
        printf "  Min: %.4f\n", min
        printf "  Max: %.4f\n", max
    }
}' >> "$SUMMARY_FILE"

echo ""
echo -e "${GREEN}📊 Performance summary saved to: $SUMMARY_FILE${NC}"
echo -e "${GREEN}📝 Detailed log saved to: $LOG_FILE${NC}"
echo ""
echo -e "${BLUE}🎯 Ready to test optimized server!${NC}"
echo -e "${YELLOW}💡 Run: ./start_optimized.sh start${NC}"

