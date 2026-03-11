#!/bin/bash
# 🔄 Restart All Servers — Backend + Frontend
# TikTrack Phoenix - Stop both, then start both (same logic as init-servers-for-qa)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${GREEN}🔄 Restarting All Servers${NC}"
echo "=========================================="

# 0. Ensure PostgreSQL is running, then wait for it
echo -e "${YELLOW}[0/4] PostgreSQL...${NC}"
if docker ps -a --format "{{.Names}}" 2>/dev/null | grep -q "tiktrack-postgres-dev"; then
  if ! docker ps --format "{{.Names}}" 2>/dev/null | grep -q "tiktrack-postgres-dev"; then
    echo "  Starting tiktrack-postgres-dev..."
    docker start tiktrack-postgres-dev 2>/dev/null || true
    sleep 3
  fi
fi
echo "  Waiting for DB..."
for i in {1..60}; do
  if python3 "$SCRIPT_DIR/wait_for_db.py" 2>/dev/null; then
    echo -e "${GREEN}✅ PostgreSQL ready${NC}"
    break
  fi
  if [ $i -eq 60 ]; then
    echo -e "${RED}❌ PostgreSQL not available after 60s — start Docker/DB first${NC}"
    exit 1
  fi
  sleep 1
done

# 1. Stop both
echo -e "${YELLOW}[1/4] Stopping servers...${NC}"
bash "$SCRIPT_DIR/stop-backend.sh"  2>/dev/null || true
bash "$SCRIPT_DIR/stop-frontend.sh" 2>/dev/null || true
sleep 2

# 2. Start Backend in background
echo -e "${YELLOW}[2/4] Starting Backend (8082)...${NC}"
cd "$PROJECT_ROOT"
bash "$SCRIPT_DIR/start-backend.sh" &
BACKEND_PID=$!
sleep 1

for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health 2>/dev/null | grep -q 200; then
    echo -e "${GREEN}✅ Backend ready (8082)${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Backend did not start within 30s${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# 3. Start Frontend in background
echo -e "${YELLOW}[3/4] Starting Frontend (8080)...${NC}"
bash "$SCRIPT_DIR/start-frontend.sh" &
FRONTEND_PID=$!
sleep 2

for i in {1..45}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ 2>/dev/null | grep -qE '200|304'; then
    echo -e "${GREEN}✅ Frontend ready (8080)${NC}"
    break
  fi
  if [ $i -eq 45 ]; then
    echo -e "${RED}❌ Frontend did not start within 45s${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

echo -e "${YELLOW}[4/4] Restart complete.${NC}"
echo -e "${GREEN}  Backend:  http://localhost:8082${NC}"
echo -e "${GREEN}  Frontend: http://localhost:8080${NC}"
