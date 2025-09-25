#!/bin/bash

# TikTrack Development Mode Toggle Script
# =======================================
# This script allows easy switching between development modes:
# 1. Normal dev mode (with cache)
# 2. Dev mode without cache (for real-time code changes)

echo "🔧 TikTrack Development Mode Toggle"
echo "=================================="

# Check current mode
CURRENT_DEV_MODE=${TIKTRACK_DEV_MODE:-false}
CURRENT_CACHE_DISABLED=${TIKTRACK_CACHE_DISABLED:-false}

echo "📊 Current Settings:"
echo "   DEV_MODE: $CURRENT_DEV_MODE"
echo "   CACHE_DISABLED: $CURRENT_CACHE_DISABLED"
echo ""

# Menu options
echo "בחר מצב עבודה:"
echo "1. מצב פיתוח רגיל (עם Cache)"
echo "2. מצב פיתוח ללא Cache (לשינויי קוד)"
echo "3. מצב ייצור (Cache מלא)"
echo "4. הצגת מצב נוכחי"
echo "5. יציאה"
echo ""

read -p "הכנס בחירה (1-5): " choice

case $choice in
    1)
        echo "🔄 עובר למצב פיתוח רגיל..."
        export TIKTRACK_DEV_MODE=true
        export TIKTRACK_CACHE_DISABLED=false
        echo "✅ מצב פיתוח רגיל הופעל (Cache: 10 שניות)"
        ;;
    2)
        echo "🔄 עובר למצב פיתוח ללא Cache..."
        export TIKTRACK_DEV_MODE=true
        export TIKTRACK_CACHE_DISABLED=true
        echo "✅ מצב פיתוח ללא Cache הופעל"
        ;;
    3)
        echo "🔄 עובר למצב ייצור..."
        export TIKTRACK_DEV_MODE=false
        export TIKTRACK_CACHE_DISABLED=false
        echo "✅ מצב ייצור הופעל (Cache: 5 דקות)"
        ;;
    4)
        echo "📊 מצב נוכחי:"
        echo "   DEV_MODE: ${TIKTRACK_DEV_MODE:-false}"
        echo "   CACHE_DISABLED: ${TIKTRACK_CACHE_DISABLED:-false}"
        if [ "$TIKTRACK_DEV_MODE" = "true" ] && [ "$TIKTRACK_CACHE_DISABLED" = "true" ]; then
            echo "   🚀 מצב: פיתוח ללא Cache"
        elif [ "$TIKTRACK_DEV_MODE" = "true" ]; then
            echo "   🔧 מצב: פיתוח רגיל"
        else
            echo "   🏭 מצב: ייצור"
        fi
        exit 0
        ;;
    5)
        echo "👋 יציאה..."
        exit 0
        ;;
    *)
        echo "❌ בחירה לא תקינה"
        exit 1
        ;;
esac

echo ""
echo "🔄 מפעיל מחדש את השרת עם ההגדרות החדשות..."

# Restart server with new settings
./restart quick

echo ""
echo "✅ השרת הופעל מחדש בהצלחה!"
echo "💡 טיפ: השתמש ב-Cmd+Shift+C לניקוי Cache מהיר"
