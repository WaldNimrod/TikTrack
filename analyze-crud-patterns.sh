#!/bin/bash
# ========================================
# CRUD Response Patterns Analyzer
# ========================================

echo "🔍 מנתח דפוסי CRUD Response..."
echo ""

files=(
    "trading-ui/scripts/trading_accounts.js"
    "trading-ui/scripts/trades.js"
    "trading-ui/scripts/cash_flows.js"
    "trading-ui/scripts/trade_plans.js"
    "trading-ui/scripts/executions.js"
    "trading-ui/scripts/tickers.js"
    "trading-ui/scripts/alerts.js"
    "trading-ui/scripts/notes.js"
)

total_matches=0
total_integrated=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ניתוח לפי עמודים:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "⚠️ $(basename $file): קובץ לא נמצא"
        continue
    fi
    
    filename=$(basename "$file" .js)
    
    # ספירת כל מקומות response.ok
    count=$(grep -c "if (!response\.ok)" "$file" 2>/dev/null || echo 0)
    
    # ספירת מקומות משולבים
    integrated=$(grep -B 5 "if (!response\.ok)" "$file" 2>/dev/null | grep -c "CRUDResponseHandler" || echo 0)
    
    # ספירת מקומות ממתינים
    pending=$((count - integrated))
    
    # חישוב אחוז
    if [ $count -gt 0 ]; then
        percentage=$((integrated * 100 / count))
    else
        percentage=0
    fi
    
    # סטטוס
    if [ $pending -eq 0 ] && [ $count -gt 0 ]; then
        status="✅"
    elif [ $integrated -gt 0 ]; then
        status="🔄"
    else
        status="⏳"
    fi
    
    echo "$status $filename:"
    echo "   סה\"כ: $count | משולבים: $integrated | ממתינים: $pending ($percentage%)"
    
    # הצגת פונקציות ממתינות
    if [ $pending -gt 0 ]; then
        echo "   פונקציות ממתינות:"
        grep -n "if (!response\.ok)" "$file" 2>/dev/null | while read -r line; do
            line_num=$(echo "$line" | cut -d: -f1)
            # חיפוש שם הפונקציה
            func_name=$(awk -v start=$((line_num - 30)) -v end=$line_num 'NR >= start && NR < end' "$file" | grep -E "(async )?function \w+|const \w+ = " | tail -1 | sed -E 's/.*(function |const )([a-zA-Z0-9_]+).*/\2/')
            
            # זיהוי סוג פעולה
            method=$(awk -v start=$((line_num - 10)) -v end=$line_num 'NR >= start && NR < end' "$file" | grep -oE "method: ['\"]?(POST|PUT|DELETE)" | tail -1 | cut -d: -f2 | tr -d " '\"")
            
            if [ -n "$method" ]; then
                echo "      - שורה $line_num: $func_name() - $method"
            fi
        done
    fi
    
    echo ""
    
    total_matches=$((total_matches + count))
    total_integrated=$((total_integrated + integrated))
done

total_pending=$((total_matches - total_integrated))
if [ $total_matches -gt 0 ]; then
    total_percentage=$((total_integrated * 100 / total_matches))
else
    total_percentage=0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 סיכום כללי:"
echo "   סה\"כ מקומות: $total_matches"
echo "   משולבים: $total_integrated ($total_percentage%)"
echo "   ממתינים: $total_pending"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ ניתוח הושלם!"

