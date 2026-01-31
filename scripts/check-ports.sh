#!/bin/bash
# 🔍 Port Status Check Script
# TikTrack Phoenix - Port Conflict Detection

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking Port Status${NC}"
echo "=========================================="
echo ""

# Check Frontend Port (8080)
echo -e "${BLUE}Frontend V2 Port (8080):${NC}"
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PROCESS=$(lsof -Pi :8080 -sTCP:LISTEN | tail -n 1 | awk '{print $1, $2}')
    echo -e "  ${YELLOW}⚠️  Port 8080 is in use${NC}"
    echo -e "  Process: $PROCESS"
    echo -e "  ${GREEN}✅ This is expected if Frontend is running${NC}"
else
    echo -e "  ${GREEN}✅ Port 8080 is available${NC}"
fi
echo ""

# Check Backend Port (8082)
echo -e "${BLUE}Backend API Port (8082):${NC}"
if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PROCESS=$(lsof -Pi :8082 -sTCP:LISTEN | tail -n 1 | awk '{print $1, $2}')
    PID=$(lsof -ti:8082 | head -n 1)
    echo -e "  ${RED}❌ Port 8082 is in use${NC}"
    echo -e "  Process: $PROCESS (PID: $PID)"
    
    # Check if it's uvicorn (our backend)
    if ps -p $PID -o comm= | grep -q uvicorn; then
        echo -e "  ${GREEN}✅ This is our Backend server (uvicorn)${NC}"
    else
        echo -e "  ${RED}❌ This is NOT our Backend server!${NC}"
        echo -e "  ${YELLOW}⚠️  Port conflict detected - Backend cannot start${NC}"
        echo ""
        echo -e "  ${YELLOW}To free the port, run:${NC}"
        echo -e "  ${BLUE}kill -9 $PID${NC}"
    fi
else
    echo -e "  ${GREEN}✅ Port 8082 is available${NC}"
fi
echo ""

# Check Legacy Port (8081)
echo -e "${BLUE}Legacy Port (8081):${NC}"
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PROCESS=$(lsof -Pi :8081 -sTCP:LISTEN | tail -n 1 | awk '{print $1, $2}')
    echo -e "  ${YELLOW}⚠️  Port 8081 is in use (Legacy)${NC}"
    echo -e "  Process: $PROCESS"
    echo -e "  ${GREEN}✅ This is expected for Legacy system${NC}"
else
    echo -e "  ${GREEN}✅ Port 8081 is available${NC}"
fi
echo ""

echo "=========================================="
echo -e "${BLUE}Summary:${NC}"
echo "  Frontend V2: Port 8080"
echo "  Backend API: Port 8082"
echo "  Legacy: Port 8081"
echo ""
