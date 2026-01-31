#!/bin/bash
# 🔧 Fix Port 8082 Conflict
# TikTrack Phoenix - Free Port 8082 for Backend API

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing Port 8082 Conflict${NC}"
echo "=========================================="
echo ""

# Check if port 8082 is in use
if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PID=$(lsof -ti:8082 | head -n 1)
    PROCESS=$(lsof -Pi :8082 -sTCP:LISTEN | tail -n 1 | awk '{print $1}')
    
    echo -e "${YELLOW}⚠️  Port 8082 is in use by: $PROCESS (PID: $PID)${NC}"
    
    # Check if it's Docker
    if [ "$PROCESS" = "com.docke" ] || docker ps --format "{{.ID}}" | grep -q "$PID" 2>/dev/null; then
        echo -e "${BLUE}📦 Docker container detected${NC}"
        
        # Find Docker container using port 8082
        CONTAINER=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 8082 | awk '{print $1}')
        CONTAINER_NAME=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 8082 | awk '{print $2}')
        
        if [ -n "$CONTAINER" ]; then
            echo -e "${YELLOW}Container: $CONTAINER_NAME ($CONTAINER)${NC}"
            echo ""
            echo -e "${YELLOW}Options:${NC}"
            echo "  1. Stop the container (recommended if not needed)"
            echo "  2. Change container port mapping"
            echo "  3. Kill the process directly"
            echo ""
            echo -e "${BLUE}To stop the container, run:${NC}"
            echo -e "  ${GREEN}docker stop $CONTAINER${NC}"
            echo ""
            echo -e "${BLUE}Or to kill the process directly:${NC}"
            echo -e "  ${GREEN}kill -9 $PID${NC}"
            echo ""
            
            read -p "Do you want to stop the Docker container now? (y/n): " -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}🛑 Stopping Docker container...${NC}"
                docker stop $CONTAINER
                sleep 2
                
                # Verify port is free
                if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
                    echo -e "${RED}❌ Port 8082 is still in use${NC}"
                    exit 1
                else
                    echo -e "${GREEN}✅ Port 8082 is now free${NC}"
                    echo ""
                    echo -e "${GREEN}You can now start the Backend server:${NC}"
                    echo -e "  ${BLUE}./scripts/start-backend.sh${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️  Port 8082 conflict not resolved${NC}"
                echo -e "${YELLOW}Backend cannot start until port 8082 is free${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Could not identify Docker container${NC}"
            echo -e "${YELLOW}To kill the process directly:${NC}"
            echo -e "  ${GREEN}kill -9 $PID${NC}"
            exit 1
        fi
    else
        # Not Docker, kill directly
        echo -e "${YELLOW}⚠️  Non-Docker process detected${NC}"
        read -p "Do you want to kill process $PID? (y/n): " -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}🛑 Killing process $PID...${NC}"
            kill -9 $PID
            sleep 2
            
            # Verify port is free
            if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
                echo -e "${RED}❌ Port 8082 is still in use${NC}"
                exit 1
            else
                echo -e "${GREEN}✅ Port 8082 is now free${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Port 8082 conflict not resolved${NC}"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✅ Port 8082 is already free${NC}"
    echo -e "${GREEN}You can start the Backend server:${NC}"
    echo -e "  ${BLUE}./scripts/start-backend.sh${NC}"
fi

echo ""
