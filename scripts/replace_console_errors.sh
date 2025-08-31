#!/bin/bash
# replace_console_errors.sh
# סקריפט להחלפה אוטומטית של console.error בפרויקט TikTrack

echo "=== החלפת console.error בפרויקט TikTrack ==="
echo "תאריך: $(date)"
echo ""

# גיבוי לפני החלפה
echo "💾 יצירת גיבוי לפני החלפה..."
cp -r trading-ui/scripts/ trading-ui/scripts_backup_$(date +%Y%m%d_%H%M%S)
echo "✅ גיבוי נוצר בהצלחה"
echo ""

# החלפת console.error בסיסיים
echo "🔄 החלפת console.error בסיסיים..."
find trading-ui/scripts/ -name "*.js" -not -path "*/backup*" -exec sed -i '' 's/console\.error(\([^)]*\));/handleApiError(\1, "API_CALL");/g' {} \;
echo "✅ החלפה בסיסית הושלמה"
echo ""

# החלפת console.error עם פרמטרים מרובים
echo "🔄 החלפת console.error עם פרמטרים מרובים..."
find trading-ui/scripts/ -name "*.js" -not -path "*/backup*" -exec sed -i '' 's/console\.error(\([^,]*\), \(.*\));/handleApiError(\1, "API_CALL", \2);/g' {} \;
echo "✅ החלפה עם פרמטרים הושלמה"
echo ""

# החלפת console.error עם מחרוזות מורכבות
echo "🔄 החלפת console.error עם מחרוזות מורכבות..."
find trading-ui/scripts/ -name "*.js" -not -path "*/backup*" -exec sed -i '' 's/console\.error(\([^)]*\));/handleElementNotFound(\1, "ELEMENT_NOT_FOUND");/g' {} \;
echo "✅ החלפה עם מחרוזות הושלמה"
echo ""

# בדיקת תוצאות
echo "📊 בדיקת תוצאות החלפה:"
echo ""

echo "מספר console.error שנותרו:"
REMAINING=$(grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | wc -l)
echo "$REMAINING מקרים"
echo ""

echo "דוגמאות console.error שנותרו:"
grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | head -5
echo ""

echo "✅ החלפה אוטומטית הושלמה!"
echo ""
echo "⚠️  חשוב: יש לבדוק את התוצאות ולתקן ידנית אם נדרש"
echo "📁 גיבוי נשמר ב: trading-ui/scripts_backup_$(date +%Y%m%d_%H%M%S)"
