#!/bin/bash
#
# Console Compliance Checker - TikTrack Project
# ==============================================
# 
# סקריפט לבדיקה שוטפת של עמידה בכלל no-console
# מוודא שלא נוספו console.* statements חדשים
# 
# Usage: ./scripts/check-console-compliance.sh
# 

echo "🔍 בדיקת עמידה בכלל no-console - TikTrack"
echo "========================================="
echo ""

# בדיקת קיום ESLint
if ! command -v npx eslint &> /dev/null; then
    echo "⚠️  ESLint לא זמין - מבצע בדיקה ידנית"
    echo ""
fi

# ספירה כללית
total_files=0
total_console=0
problem_files=()

echo "📁 סורק קבצי JavaScript..."

# סריקת כל קבצי JavaScript פעילים
for file in $(find trading-ui -name "*.js" -not -name "*backup*" -not -name "*test*"); do
    total_files=$((total_files + 1))
    count=$(grep -c "^\s*console\." "$file" 2>/dev/null)
    
    if [ "$count" -gt 0 ]; then
        total_console=$((total_console + count))
        problem_files+=("$file:$count")
        echo "❌ $file: $count מופעי console.*"
        
        # הצגת המופעים הספציפיים
        echo "   📋 מיקומים:"
        grep -n "^\s*console\." "$file" | head -5 | while read -r line; do
            echo "      $line"
        done
        echo ""
    fi
done

echo "📊 תוצאות הבדיקה:"
echo "=================="
echo "📁 סך קבצים נבדקו: $total_files"
echo "🖥️  סך console.* נמצאו: $total_console"

if [ "$total_console" -eq 0 ]; then
    echo ""
    echo "🎉 מצוין! המערכת עומדת בכלל no-console"
    echo "✅ לא נמצאו מופעי console.* פעילים"
elif [ "$total_console" -lt 10 ]; then
    echo ""
    echo "✅ מצב טוב! מעט מופעי console.* נמצאו"
    echo "🔧 מומלץ לתקן בהקדם:"
    for problem in "${problem_files[@]}"; do
        echo "   - $problem"
    done
else
    echo ""
    echo "❌ מצב דורש תיקון! נמצאו מופעי console.* רבים"
    echo "🔧 יש לתקן בדחיפות:"
    for problem in "${problem_files[@]}"; do
        echo "   - $problem"
    done
fi

echo ""
echo "🔗 מידע נוסף:"
echo "- מערכת התראות: window.showNotification(), window.showErrorNotification()"
echo "- דוקומנטציה: documentation/frontend/JAVASCRIPT_ARCHITECTURE.md"
echo "- כללי לינטר: linter-config.md"
echo ""
echo "תאריך בדיקה: $(date '+%Y-%m-%d %H:%M:%S')"