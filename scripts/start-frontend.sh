#!/bin/bash
# 🚀 Start Frontend Dev Server Script
# TikTrack Phoenix - Frontend Dev Server Startup
# Port: 8080 (V2 port as per Master Blueprint: "Ports: V2 (8080), Legacy (8081)")

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
UI_DIR="$PROJECT_ROOT/ui"

echo -e "${GREEN}🚀 Starting TikTrack Phoenix Frontend Dev Server${NC}"
echo "=========================================="

# Check if UI directory exists
if [ ! -d "$UI_DIR" ]; then
    echo -e "${RED}❌ Error: UI directory not found at $UI_DIR${NC}"
    exit 1
fi

cd "$UI_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 8080 is already in use${NC}"
    echo "Do you want to kill the existing process? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Killing process on port 8080...${NC}"
        lsof -ti:8080 | xargs kill -9
        sleep 2
    else
        echo -e "${RED}❌ Cannot start server. Port 8080 is in use.${NC}"
        exit 1
    fi
fi

# Start the dev server
echo -e "${GREEN}🚀 Starting Vite dev server on port 8080 (V2)...${NC}"
echo "=========================================="
echo "📍 Frontend URL: http://localhost:8080"
echo "📍 API Proxy: /api -> http://localhost:8082"
echo "=========================================="
echo ""

npm run dev
