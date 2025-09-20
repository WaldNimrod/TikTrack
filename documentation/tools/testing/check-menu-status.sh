#!/bin/bash

# סקריפט בדיקה מהירה של מצב התפריט
# Quick Menu Status Check Script

echo "🔍 בדיקת מצב התפריט..."

# בדיקת קבצים
echo "📁 בדיקת קבצים:"
if [ -f "trading-ui/styles-new/header-menu-clean.css" ]; then
    echo "✅ header-menu-clean.css קיים"
    FILE_SIZE=$(wc -c < trading-ui/styles-new/header-menu-clean.css)
    echo "   גודל: $FILE_SIZE בתים"
else
    echo "❌ header-menu-clean.css לא קיים"
fi

if [ -f "bootstrap-5-menu-classes-reference.md" ]; then
    echo "✅ bootstrap-5-menu-classes-reference.md קיים"
else
    echo "❌ bootstrap-5-menu-classes-reference.md לא קיים"
fi

if [ -f "menu-classes-comparison.md" ]; then
    echo "✅ menu-classes-comparison.md קיים"
else
    echo "❌ menu-classes-comparison.md לא קיים"
fi

if [ -f "menu-migration-workplan.md" ]; then
    echo "✅ menu-migration-workplan.md קיים"
else
    echo "❌ menu-migration-workplan.md לא קיים"
fi

# בדיקת סטטיסטיקות
echo "📊 סטטיסטיקות:"
if [ -f "trading-ui/styles-new/header-menu-clean.css" ]; then
    SELECTOR_COUNT=$(grep -c "{" trading-ui/styles-new/header-menu-clean.css)
    echo "   מספר סלקטורים: $SELECTOR_COUNT"
    
    IMPORTANT_COUNT=$(grep -c "!important" trading-ui/styles-new/header-menu-clean.css || echo "0")
    echo "   מספר !important: $IMPORTANT_COUNT"
    
    COMMENT_COUNT=$(grep -c "/*" trading-ui/styles-new/header-menu-clean.css || echo "0")
    echo "   מספר הערות: $COMMENT_COUNT"
fi

# בדיקת גיט
echo "💾 בדיקת גיט:"
if git status --porcelain | grep -q .; then
    echo "⚠️  יש שינויים לא נשמרים"
    git status --short
else
    echo "✅ הכל נשמר בגיט"
fi

# בדיקת שרת
echo "🌐 בדיקת שרת:"
if pgrep -f "python3 -m http.server" > /dev/null; then
    echo "✅ השרת פועל על פורט 8080"
else
    echo "❌ השרת לא פועל"
    echo "   להפעלה: python3 -m http.server 8080"
fi

echo "✅ בדיקה הושלמה!"
