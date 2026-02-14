#!/bin/bash
# 🌐 Init Full Environment — PostgreSQL + Servers
# TikTrack Phoenix - טעינה מחודשת מלאה: DB + Backend + Frontend

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}🌐 Init Full Environment${NC}"
echo "=========================================="

# 1. PostgreSQL
echo -e "${YELLOW}[1/3] PostgreSQL...${NC}"
if docker ps -a --format "{{.Names}}" 2>/dev/null | grep -q "tiktrack-postgres-dev"; then
  if ! docker ps --format "{{.Names}}" | grep -q "tiktrack-postgres-dev"; then
    echo "  Starting tiktrack-postgres-dev..."
    docker start tiktrack-postgres-dev
    sleep 3
    echo -e "  ${GREEN}✅ PostgreSQL started${NC}"
  else
    echo -e "  ${GREEN}✅ PostgreSQL already running${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️  Container tiktrack-postgres-dev not found — skipping${NC}"
fi

# 2. Restart servers (stop + start)
echo -e "${YELLOW}[2/3] Restarting servers...${NC}"
bash "$SCRIPT_DIR/restart-all-servers.sh"

echo -e "${YELLOW}[3/3] Done.${NC}"
echo -e "${GREEN}  Backend:  http://localhost:8082${NC}"
echo -e "${GREEN}  Frontend: http://localhost:8080${NC}"
echo -e "${GREEN}  Health:   curl http://localhost:8082/health${NC}"
