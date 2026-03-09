#!/bin/bash
# 🚀 TikTrack Phoenix — איתחול מסודר (Coordinated Dev Startup)
# מפעיל קודם Backend, מחכה עד ש־8082 מוכן, ואז מפעיל Frontend.
# שימוש: ./scripts/start-dev.sh   או משימת Cursor: הרץ סקריפט זה.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
API_DIR="$PROJECT_ROOT/api"
UI_DIR="$PROJECT_ROOT/ui"
HEALTH_URL="http://127.0.0.1:8082/health"
WAIT_TIMEOUT=60
BACKEND_PID=""

cleanup_backend() {
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${YELLOW}🛑 Stopping backend (PID $BACKEND_PID)...${NC}"
        kill "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
}
trap cleanup_backend EXIT INT TERM

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  TikTrack Phoenix — איתחול מסודר (Dev)${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# --- 1) Backend on 8082 ---
if lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend already listening on 8082${NC}"
else
    echo -e "${GREEN}🚀 Starting Backend on 8082...${NC}"
    if [ ! -d "$API_DIR" ]; then
        echo -e "${RED}❌ API directory not found: $API_DIR${NC}"
        exit 1
    fi
    if [ ! -d "$API_DIR/venv" ]; then
        echo -e "${YELLOW}Creating venv...${NC}"
        (cd "$API_DIR" && python3 -m venv venv)
    fi
    (
        cd "$API_DIR"
        source venv/bin/activate
        [ -f .env ] && set -a && source .env && set +a
        cd "$PROJECT_ROOT"
        PYTHONPATH="$API_DIR:$PYTHONPATH" exec uvicorn api.main:app --reload --host 0.0.0.0 --port 8082
    ) &
    BACKEND_PID=$!
    echo -e "${GREEN}   Backend started (PID $BACKEND_PID), waiting for health...${NC}"
fi

# --- 2) Wait for backend health ---
elapsed=0
while [ $elapsed -lt $WAIT_TIMEOUT ]; do
    if curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null | grep -q 200; then
        echo -e "${GREEN}✅ Backend healthy at $HEALTH_URL${NC}"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo -e "   Waiting for backend... ${elapsed}s"
done
if [ $elapsed -ge $WAIT_TIMEOUT ]; then
    echo -e "${RED}❌ Backend did not become healthy within ${WAIT_TIMEOUT}s${NC}"
    exit 1
fi
echo ""

# --- 3) Frontend on 8080 ---
echo -e "${GREEN}🚀 Starting Frontend (Vite on 8080)...${NC}"
echo -e "   API Proxy: /api -> http://localhost:8082"
echo ""

# Run frontend in foreground; COORDINATED_DEV=1 so frontend script doesn't prompt for port 8080
export COORDINATED_DEV=1
exec "$SCRIPT_DIR/start-frontend.sh"
