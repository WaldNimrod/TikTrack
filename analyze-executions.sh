#!/bin/bash

# סקריפט לניתוח מקיף של executions.js
cd /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║          📊 דוח ניתוח מקיף - executions.js 📊                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "1. מדדים בסיסיים"
echo "═══════════════════════════════════════════════════════════"
echo "  • שורות קוד: $(wc -l < executions.js)"
echo "  • גודל: $(ls -lh executions.js | awk '{print $5}')"
echo "  • פונקציות: $(grep -cE '^(async )?function ' executions.js)"
echo "  • async functions: $(grep -cE '^async function' executions.js)"
echo "  • תיעוד (הערות): $(grep -cE '^\s*/\*\*|\s*\*' executions.js)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "2. פונקציות ארוכות (מעל 100 שורות)"
echo "═══════════════════════════════════════════════════════════"
awk '/^(async )?function / {fname=$0; fstart=NR} /^}$/ && fstart {flen=NR-fstart; if(flen>100) print "  •", flen, "שורות:", fname; fstart=0}' executions.js | sort -rn | head -10
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "3. בעיות דומות לטיקרים"
echo "═══════════════════════════════════════════════════════════"
echo "  • inline styles (style=): $(grep -c 'style=' executions.js)"
echo "  • onclick=: $(grep -c 'onclick=' executions.js)"
echo "  • console.log: $(grep -c 'console\.log' executions.js)"
echo "  • @deprecated: $(grep -c '@deprecated' executions.js)"
echo "  • ייצוא כפול: $(sort <(grep '^window\.' executions.js) | uniq -d | wc -l)"
echo "  • generateDetailedLog: $(grep -c 'generateDetailedLog' executions.js) שורות"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "4. שימוש במערכות כלליות"
echo "═══════════════════════════════════════════════════════════"
echo "  • validateEntityForm: $(grep -c 'validateEntityForm' executions.js)"
echo "  • handleApiResponseWithRefresh: $(grep -c 'handleApiResponseWithRefresh' executions.js)"
echo "  • showLinkedItemsModal: $(grep -c 'showLinkedItemsModal' executions.js)"
echo "  • loadTableData: $(grep -c 'loadTableData' executions.js)"
echo "  • ExternalDataService: $(grep -c 'ExternalDataService' executions.js)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "5. קוד ספציפי לפלטפורמה"
echo "═══════════════════════════════════════════════════════════"
echo "  • Yahoo-specific: $(grep -ic 'yahoo' executions.js)"
echo "  • Provider-agnostic: $(grep -ic 'external.*data' executions.js)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "6. מבנה קוד"
echo "═══════════════════════════════════════════════════════════"
echo "  • משתנים גלובליים: $(grep -cE '^if \(!window\.' executions.js)"
echo "  • ייצוא גלובלי: $(grep -cE '^window\.[a-zA-Z]' executions.js)"
echo "  • try-catch blocks: $(grep -cE '^\s*try \{' executions.js)"
echo "  • polling (setTimeout): $(grep -c 'setTimeout.*tryLoad\|setTimeout.*try' executions.js)"
echo ""

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ ניתוח הושלם                                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"

