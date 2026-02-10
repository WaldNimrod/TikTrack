#!/bin/bash
# איתחול שרתים לבדיקות QA — עצירה והפעלה מחדש
# TikTrack Phoenix - Team 50 QA
# מריץ: stop → start backend (ברקע) → start frontend (ברקע) → המתנה לזמינות

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  איתחול שרתים לבדיקות QA${NC}"
echo -e "${GREEN}==========================================${NC}"

# 1. עצירת שרתים קיימים (ללא שאלות)
echo -e "${YELLOW}[1/4] עצירת שרתים קיימים...${NC}"
bash "$SCRIPT_DIR/stop-backend.sh"  2>/dev/null || true
bash "$SCRIPT_DIR/stop-frontend.sh" 2>/dev/null || true
sleep 2

# 2. הפעלת Backend ברקע
echo -e "${YELLOW}[2/4] הפעלת Backend (פורט 8082)...${NC}"
cd "$PROJECT_ROOT"
bash "$SCRIPT_DIR/start-backend.sh" &
BACKEND_PID=$!
sleep 1

# המתנה עד ש-Backend עולה (עד 30 שניות)
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health 2>/dev/null | grep -q 200; then
    echo -e "${GREEN}✅ Backend זמין (8082)${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Backend לא עלה תוך 30 שניות${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# 3. הפעלת Frontend ברקע
echo -e "${YELLOW}[3/4] הפעלת Frontend (פורט 8080)...${NC}"
bash "$SCRIPT_DIR/start-frontend.sh" &
FRONTEND_PID=$!
sleep 2

# המתנה עד ש-Frontend עולה (עד 45 שניות — Vite עלול לקחת זמן)
for i in {1..45}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ 2>/dev/null | grep -qE '200|304'; then
    echo -e "${GREEN}✅ Frontend זמין (8080)${NC}"
    break
  fi
  if [ $i -eq 45 ]; then
    echo -e "${RED}❌ Frontend לא עלה תוך 45 שניות${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

echo -e "${YELLOW}[4/4] איתחול הושלם.${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "  Backend:  http://localhost:8082"
echo -e "  Frontend: http://localhost:8080"
echo -e "${GREEN}==========================================${NC}"
