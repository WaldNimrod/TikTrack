#!/bin/bash
# 🔧 Fix Environment After Full Computer Restart
# TikTrack Phoenix — Team 60 (DevOps)
# מומלץ להריץ לאחר אתחול מחשב, כשהתחברות ל-Login מחזירה 500.
#
# סיבות נפוצות ל-500:
#   - PostgreSQL לא רץ (Docker כבוי)
#   - api/.env חסר או לא תקין (DATABASE_URL, JWT_SECRET_KEY)
#   - Backend רץ לפני שה-DB היה זמין

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
API_DIR="$PROJECT_ROOT/api"

echo -e "${BLUE}🔧 Fix Environment After Restart${NC}"
echo "=========================================="

ERRORS=0

# ─── 1. PostgreSQL ───────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[1/7] PostgreSQL (Docker)${NC}"
if command -v docker &>/dev/null; then
  if docker ps -a --format "{{.Names}}" 2>/dev/null | grep -q "tiktrack-postgres-dev"; then
    if ! docker ps --format "{{.Names}}" | grep -q "tiktrack-postgres-dev"; then
      echo "  Starting tiktrack-postgres-dev..."
      docker start tiktrack-postgres-dev
      echo "  Waiting for PostgreSQL (up to 15s)..."
      for i in {1..15}; do
        if docker exec tiktrack-postgres-dev pg_isready -U tiktrack -d TikTrack-phoenix-db 2>/dev/null; then
          echo -e "  ${GREEN}✅ PostgreSQL ready${NC}"
          break
        fi
        [ $i -eq 15 ] && echo -e "  ${RED}❌ PostgreSQL not ready after 15s${NC}" && ERRORS=$((ERRORS+1))
        sleep 1
      done
    else
      echo -e "  ${GREEN}✅ PostgreSQL already running${NC}"
    fi
  else
    # Try generic postgres or common names
    if docker ps -a --format "{{.Names}}" 2>/dev/null | grep -qiE "postgres|phoenix"; then
      echo -e "  ${YELLOW}⚠️  Container tiktrack-postgres-dev not found; found other postgres. Ensure DATABASE_URL matches.${NC}"
    else
      echo -e "  ${RED}❌ No PostgreSQL container found. Create tiktrack-postgres-dev or set DATABASE_URL correctly.${NC}"
      ERRORS=$((ERRORS+1))
    fi
  fi
else
  echo -e "  ${YELLOW}⚠️  Docker not found — assuming PostgreSQL runs natively or remotely${NC}"
fi

# ─── 2. api/.env ─────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[2/7] api/.env${NC}"
ENV_FILE="$API_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "  ${RED}❌ api/.env not found${NC}"
  echo "  Copy from: cp api/.env.example api/.env"
  echo "  Required: DATABASE_URL, JWT_SECRET_KEY (min 64 chars)"
  ERRORS=$((ERRORS+1))
else
  echo -e "  ${GREEN}✅ api/.env exists${NC}"
  if ! grep -q "^DATABASE_URL=.*" "$ENV_FILE" || grep -q "^DATABASE_URL=\s*$" "$ENV_FILE"; then
    echo -e "  ${RED}❌ DATABASE_URL missing or empty${NC}"
    ERRORS=$((ERRORS+1))
  else
    echo -e "  ${GREEN}✅ DATABASE_URL set${NC}"
  fi
  if ! grep -q "^JWT_SECRET_KEY=.*" "$ENV_FILE"; then
    echo -e "  ${RED}❌ JWT_SECRET_KEY missing — Auth will return 500${NC}"
    echo "  Generate: python3 -c \"import secrets; print(secrets.token_urlsafe(64))\""
    ERRORS=$((ERRORS+1))
  else
    LEN=$(grep "^JWT_SECRET_KEY=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'" | wc -c)
    if [ "$LEN" -lt 64 ]; then
      echo -e "  ${RED}❌ JWT_SECRET_KEY must be at least 64 characters (current: ~$LEN)${NC}"
      ERRORS=$((ERRORS+1))
    else
      echo -e "  ${GREEN}✅ JWT_SECRET_KEY set (length OK)${NC}"
    fi
  fi
fi

# ─── 3. P3-020 migration (user_tickers + tickers.status) ─────────────────────
echo -e "\n${YELLOW}[3/7] P3-020 migration (D22 / POST /tickers)${NC}"
if command -v docker &>/dev/null && docker ps --format "{{.Names}}" 2>/dev/null | grep -q "tiktrack-postgres-dev"; then
  if docker exec tiktrack-postgres-dev pg_isready -U tiktrack -d TikTrack-phoenix-db &>/dev/null; then
    cd "$PROJECT_ROOT" && make migrate-p3-020 2>/dev/null && echo -e "  ${GREEN}✅ P3-020 migration OK${NC}" || echo -e "  ${YELLOW}⚠️  make migrate-p3-020 failed or not available${NC}"
    cd - >/dev/null
  else
    echo -e "  ${YELLOW}⚠️  PostgreSQL not ready — skip migration${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️  Docker/PostgreSQL not available — run make migrate-p3-020 manually if needed${NC}"
fi

# ─── 4. P3-021 migration (market_data reference tables — tickers FK) ─────────
echo -e "\n${YELLOW}[4/7] P3-021 migration (exchanges, sectors, industries, market_cap_groups)${NC}"
if command -v docker &>/dev/null && docker ps --format "{{.Names}}" 2>/dev/null | grep -q "tiktrack-postgres-dev"; then
  if docker exec tiktrack-postgres-dev pg_isready -U tiktrack -d TikTrack-phoenix-db &>/dev/null; then
    cd "$PROJECT_ROOT" && make migrate-p3-021 2>/dev/null && echo -e "  ${GREEN}✅ P3-021 migration OK${NC}" || echo -e "  ${YELLOW}⚠️  make migrate-p3-021 failed or not available${NC}"
    cd - >/dev/null
  else
    echo -e "  ${YELLOW}⚠️  PostgreSQL not ready — skip migration${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️  Docker/PostgreSQL not available — run make migrate-p3-021 manually if needed${NC}"
fi

# ─── 5. Backend venv ────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[5/7] Backend venv${NC}"
if [ -d "$API_DIR/venv" ]; then
  echo -e "  ${GREEN}✅ api/venv exists${NC}"
else
  echo -e "  ${YELLOW}⚠️  api/venv not found — run start-backend.sh (it will create)${NC}"
fi

# ─── 6. Restart Backend ──────────────────────────────────────────────────────
echo -e "\n${YELLOW}[6/7] Restart Backend${NC}"
bash "$SCRIPT_DIR/stop-backend.sh" 2>/dev/null || true
sleep 2
cd "$PROJECT_ROOT"
bash "$SCRIPT_DIR/start-backend.sh" &
BEPID=$!
echo "  Waiting for Backend /health (up to 30s)..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health 2>/dev/null | grep -q 200; then
    echo -e "  ${GREEN}✅ Backend /health OK${NC}"
    break
  fi
  [ $i -eq 30 ] && echo -e "  ${RED}❌ Backend did not respond in 30s${NC}" && kill $BEPID 2>/dev/null || true && ERRORS=$((ERRORS+1))
  sleep 1
done

# ─── 7. Health / detailed (DB + Auth) ────────────────────────────────────────
echo -e "\n${YELLOW}[7/7] Health /detailed (DB + Auth)${NC}"
DETAILED=$(curl -s http://localhost:8082/health/detailed 2>/dev/null || echo "{}")
if echo "$DETAILED" | grep -q '"status":"ok"'; then
  echo -e "  ${GREEN}✅ DB + AuthService OK — Login should work${NC}"
else
  echo -e "  ${YELLOW}⚠️  /health/detailed indicates issues:${NC}"
  echo "$DETAILED" | python3 -m json.tool 2>/dev/null || echo "$DETAILED"
  if echo "$DETAILED" | grep -q "database.*error"; then
    echo -e "  ${RED}  → Database connection failed. Check DATABASE_URL and PostgreSQL.${NC}"
    ERRORS=$((ERRORS+1))
  fi
  if echo "$DETAILED" | grep -q "auth_service.*error"; then
    echo -e "  ${RED}  → AuthService error. Check JWT_SECRET_KEY (64+ chars).${NC}"
    ERRORS=$((ERRORS+1))
  fi
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "=========================================="
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ Fix completed with $ERRORS error(s). Resolve above before Login.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Environment ready. Try Login again.${NC}"
  echo -e "  Backend:  http://localhost:8082"
  echo -e "  Frontend: http://localhost:8080"
fi
