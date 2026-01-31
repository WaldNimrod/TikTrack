#!/bin/bash
# 🚀 Start Backend Server Script
# TikTrack Phoenix - Backend Server Startup
# Port: 8080 (as defined in Master Blueprint)

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
API_DIR="$PROJECT_ROOT/api"

echo -e "${GREEN}🚀 Starting TikTrack Phoenix Backend Server${NC}"
echo "=========================================="

# Check if API directory exists
if [ ! -d "$API_DIR" ]; then
    echo -e "${RED}❌ Error: API directory not found at $API_DIR${NC}"
    exit 1
fi

cd "$API_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${GREEN}📦 Activating virtual environment...${NC}"
source venv/bin/activate

# Check if requirements are installed
if [ ! -f "venv/bin/uvicorn" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing...${NC}"
    pip install -r requirements.txt
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

# Start the server
echo -e "${GREEN}🚀 Starting FastAPI server on port 8080...${NC}"
echo "=========================================="
echo "📍 API Base URL: http://localhost:8080/api/v1"
echo "📍 Health Check: http://localhost:8080/health"
echo "📍 API Docs: http://localhost:8080/docs"
echo "=========================================="
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8080
