#!/bin/bash
# 🔄 Restart Backend Server Script
# TikTrack Phoenix - Backend Server Restart

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Restarting TikTrack Phoenix Backend Server${NC}"
echo "=========================================="

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Stop the server
echo -e "${YELLOW}🛑 Stopping server...${NC}"
bash "$SCRIPT_DIR/stop-backend.sh"

# Wait a moment
sleep 2

# Start the server
echo -e "${GREEN}🚀 Starting server...${NC}"
bash "$SCRIPT_DIR/start-backend.sh"
