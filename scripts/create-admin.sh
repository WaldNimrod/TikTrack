#!/bin/bash
# 👤 Create Admin User Script
# TikTrack Phoenix - Create Primary Admin User
# Username: admin, Password: 418141

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

echo -e "${GREEN}👤 Creating Admin User${NC}"
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
if [ ! -f "venv/bin/python" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Run the script
echo -e "${GREEN}🚀 Running create_admin_user.py...${NC}"
echo ""

python scripts/create_admin_user.py

echo ""
echo -e "${GREEN}✅ Done!${NC}"
