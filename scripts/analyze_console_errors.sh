#!/bin/bash
# analyze_console_errors.sh
# סקריפט לניתוח console.error בפרויקט TikTrack

echo "=== ניתוח console.error בפרויקט TikTrack ==="
echo "תאריך: $(date)"
echo ""

# מספר כולל של console.error
echo "📊 מספר כולל של console.error:"
TOTAL_COUNT=$(grep -r "console\.error" trading-ui/scripts/ | wc -l)
echo "$TOTAL_COUNT מקרים"
echo ""

# מספר בקבצים פעילים (ללא גיבויים)
echo "📊 מספר בקבצים פעילים (ללא גיבויים):"
ACTIVE_COUNT=$(grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | wc -l)
echo "$ACTIVE_COUNT מקרים"
echo ""

# קבצים עם console.error
echo "📁 קבצים עם console.error:"
find trading-ui/scripts/ -name "*.js" -not -path "*/backup*" | xargs grep -l "console\.error" | while read file; do
    COUNT=$(grep -c "console\.error" "$file")
    echo "  $file ($COUNT מקרים)"
done
echo ""

# סיכום לפי קטגוריות
echo "📋 סיכום לפי קטגוריות:"
echo ""

echo "🔴 שגיאות API ושרת:"
grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | grep -E "(API|response|fetch|server|HTTP)" | wc -l
echo ""

echo "🟡 שגיאות אלמנטים לא נמצאו:"
grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | grep -E "(not found|element|function|modal)" | wc -l
echo ""

echo "🟠 שגיאות ולידציה:"
grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | grep -E "(validation|invalid|required|error)" | wc -l
echo ""

echo "🔵 שגיאות מערכת:"
grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | grep -E "(localStorage|preferences|notification)" | wc -l
echo ""

# דוגמאות console.error
echo "📝 דוגמאות console.error (10 הראשונות):"
grep -r "console\.error" trading-ui/scripts/ | grep -v "backup" | head -10
echo ""

# קבצים הגדולים ביותר
echo "📈 קבצים עם הכי הרבה console.error:"
find trading-ui/scripts/ -name "*.js" -not -path "*/backup*" | xargs grep -l "console\.error" | while read file; do
    COUNT=$(grep -c "console\.error" "$file")
    echo "$COUNT $file"
done | sort -nr | head -10
echo ""

# הערכת זמן
echo "⏱️ הערכת זמן עבודה:"
echo "  - ניתוח וסיווג: 2-3 שעות"
echo "  - יצירת פונקציות עזר: 2-3 שעות"
echo "  - טיפול שיטתי: 4-6 שעות"
echo "  - בדיקות ותיקונים: 2-3 שעות"
echo "  - סה\"כ: 8-12 שעות עבודה"
echo ""

echo "✅ ניתוח הושלם בהצלחה!"
