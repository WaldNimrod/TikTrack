#!/bin/bash
# 🛑 Stop Frontend Dev Server Script
# TikTrack Phoenix - Frontend Dev Server Shutdown

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping TikTrack Phoenix Frontend Dev Server${NC}"
echo "=========================================="

# Check if port 8080 is in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}📍 Found process on port 8080${NC}"
    PID=$(lsof -ti:8080)
    echo -e "${YELLOW}🛑 Killing process $PID...${NC}"
    kill -9 $PID
    sleep 1
    echo -e "${GREEN}✅ Frontend dev server stopped${NC}"
else
    echo -e "${YELLOW}⚠️  No process found on port 8080${NC}"
fi
