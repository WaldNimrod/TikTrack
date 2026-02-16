#!/bin/bash
# Team 20 — אימות תיקון Notes D35 (MB3A) לפני הגשה
# מנדט: restart Backend + run Notes D35 QA. חובה אחרי שינוי בקוד notes / notes_service / note_attachments.
# מקור: TEAM_20_BACKEND_RESTART_WORK_PROCEDURE, SERVERS_SCRIPTS_SSOT

set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "=== Team 20 — אימות Notes D35 (restart + QA) ==="

# 0. Ensure dependencies (bleach for rich-text sanitization)
if [ -f "$PROJECT_ROOT/api/venv/bin/pip" ]; then
  "$PROJECT_ROOT/api/venv/bin/pip" install -r "$PROJECT_ROOT/api/requirements.txt" -q 2>/dev/null || true
fi

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
echo "[2/2] הרצת Notes D35 QA API..."
cd "$PROJECT_ROOT"
bash scripts/run-notes-d35-qa-api.sh

echo "=== אימות Notes D35 הושלם ==="
