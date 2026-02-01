#!/bin/bash
# 🚀 Start Backend Server Script
# TikTrack Phoenix - Backend Server Startup
# Port: 8082 (Frontend V2 uses port 8080 per Master Blueprint)

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

# Check if port 8082 is already in use
if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 8082 is already in use${NC}"
    echo "Do you want to kill the existing process? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Killing process on port 8082...${NC}"
        lsof -ti:8082 | xargs kill -9
        sleep 2
    else
        echo -e "${RED}❌ Cannot start server. Port 8082 is in use.${NC}"
        exit 1
    fi
fi

# Start the server
echo -e "${GREEN}🚀 Starting FastAPI server on port 8082...${NC}"
echo "=========================================="
echo "📍 API Base URL: http://localhost:8082/api/v1"
echo "📍 Health Check: http://localhost:8082/health"
echo "📍 API Docs: http://localhost:8082/docs"
echo "=========================================="
echo ""

# Change to project root and run with api.main:app to handle relative imports
cd "$PROJECT_ROOT"
PYTHONPATH="$API_DIR:$PYTHONPATH" uvicorn api.main:app --reload --host 0.0.0.0 --port 8082
