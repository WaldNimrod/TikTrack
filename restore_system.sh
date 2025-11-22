#!/bin/bash
echo "=== שחזור המערכת למצב לפני מיגרציה ==="
echo "1. חזרה לענף הראשי..."
git checkout main
echo "   ✅ חזרנו לענף הראשי"

echo "2. שחזור בסיס נתונים..."
LATEST_BACKUP=$(ls -t Backend/db/backup_before_migration_*.db 2>/dev/null | head -n 1)
if [ -n "$LATEST_BACKUP" ]; then
    cp "$LATEST_BACKUP" Backend/db/tiktrack.db
    echo "   ✅ בסיס נתונים שוחזר מ: $LATEST_BACKUP"
else
    echo "   ❌ לא נמצא גיבוי בסיס נתונים"
fi

echo "3. הפעלת השרת..."
./restart
echo "המערכת שוחזרה למצב לפני מיגרציה (ענף main)"
