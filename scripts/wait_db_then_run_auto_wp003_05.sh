#!/bin/bash
# מחכה ל-DB ואז מריץ את התהליך המלא
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/.."

echo "מחכה ל-PostgreSQL..."
for i in $(seq 1 60); do
    if python3 "$SCRIPT_DIR/wait_for_db.py" 2>/dev/null; then
        echo "DB זמין לאחר ${i}s"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ PostgreSQL לא זמין אחרי 60 שניות — הפעל Docker/DB קודם"
        exit 1
    fi
    sleep 1
done

./scripts/run_auto_wp003_05_full_flow.sh
