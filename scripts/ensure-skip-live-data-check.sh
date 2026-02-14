#!/bin/bash
# Team 20 — הוספת SKIP_LIVE_DATA_CHECK=true ל־api/.env כשחסר (dev/QA בלבד)
# הרץ לפני הפעלת Backend כשהמפתח/ספקים לא זמינים.

ENV_FILE="api/.env"
MARKER="SKIP_LIVE_DATA_CHECK"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Create from api/.env.example first."
  exit 1
fi

if grep -q "^${MARKER}=" "$ENV_FILE" || grep -q "^#${MARKER}=" "$ENV_FILE"; then
  if grep -q "^${MARKER}=true" "$ENV_FILE"; then
    echo "✅ $MARKER already set to true"
  else
    echo "⚠️ $MARKER exists but not true. Edit $ENV_FILE manually."
    exit 1
  fi
else
  echo "" >> "$ENV_FILE"
  echo "# Dev/QA bypass — remove in production" >> "$ENV_FILE"
  echo "${MARKER}=true" >> "$ENV_FILE"
  echo "✅ Added $MARKER=true to $ENV_FILE. Restart Backend."
fi
