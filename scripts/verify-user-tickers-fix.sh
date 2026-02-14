#!/bin/bash
# Team 20 — אימות תיקון User Tickers לפני הגשה
# מנדט: restart Backend + run QA. חובה אחרי שינוי בקוד me_tickers / user_tickers_service.
# מקור: TEAM_20_USER_TICKERS_PRE_QA_CHECKLIST, SERVERS_SCRIPTS_SSOT

set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "=== Team 20 — אימות User Tickers (restart + QA) ==="

# 1. Stop + Start Backend (ברקע) — טעינת קוד מעודכן
echo "[1/2] הפעלה מחדש של Backend..."
bash "$SCRIPT_DIR/stop-backend.sh" 2>/dev/null || true
sleep 2
bash "$SCRIPT_DIR/start-backend.sh" &
BACKEND_PID=$!

# המתנה עד ש-Backend עולה
for i in {1..45}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health 2>/dev/null | grep -q 200; then
    echo "✅ Backend זמין (8082)"
    break
  fi
  if [ $i -eq 45 ]; then
    echo "❌ Backend לא עלה — בדוק לוגים"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# 2. הרצת QA
echo "[2/2] הרצת User Tickers QA API..."
cd "$PROJECT_ROOT"
bash scripts/run-user-tickers-qa-api.sh

echo "=== אימות הושלם ==="
