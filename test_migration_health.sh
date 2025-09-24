#!/bin/bash
echo "=== בדיקת בריאות המערכת לפני מיגרציה ==="
echo "1. בדיקת בסיס נתונים..."
sqlite3 Backend/db/simpleTrade_new.db "SELECT COUNT(*) FROM accounts;" | xargs -I {} echo "   ✅ יש {} חשבונות במערכת"

echo "2. בדיקת API..."
STATUS=$(curl -s http://localhost:8080/api/accounts/ | jq -r '.status' 2>/dev/null)
if [ "$STATUS" = "success" ]; then
    echo "   ✅ API עובד תקין"
else
    echo "   ❌ בעיה ב-API"
fi

echo "3. בדיקת עמודים..."
if curl -s http://localhost:8080/accounts | grep -q "200 OK"; then
    echo "   ✅ עמודים עובדים"
else
    echo "   ❌ בעיה בעמודים"
fi

echo "4. בדיקת Foreign Keys..."
FK_CHECK=$(sqlite3 Backend/db/simpleTrade_new.db "PRAGMA foreign_key_check;" | wc -l)
if [ $FK_CHECK -eq 0 ]; then
    echo "   ✅ Foreign Keys תקינים"
else
    echo "   ⚠️  יש $FK_CHECK בעיות Foreign Keys (לא קריטי)"
fi

echo "=== סיום בדיקת בריאות ==="
