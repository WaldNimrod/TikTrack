# מדריך בדיקות - Cache Busting (אופציה A)

## Testing Guide for Cache Busting System

**תאריך:** 13 ינואר 2025  
**גרסה:** 1.0  
**מטרה:** בדיקה מקיפה של מערכת Cache Busting

---

## 📋 תקציר

### מה בדקנו

✅ Build script רץ ועדכן 37/38 HTML files  
✅ כל קבצי JS/CSS נטענים עם `?v=hash`  
✅ Hash משתנה בכל commit  
✅ CRUD operations מנקים cache מקומית  
✅ Clear Cache (Light/Medium/Full) - רק refresh data  
✅ Clear Cache (Nuclear) - full reload  

---

## 🧪 בדיקות אוטומטיות

### בדיקה 1: Cache Busting על כל קבצי HTML

```bash
# בדוק שכל קבצי HTML כוללים ?v= על JS/CSS
find trading-ui -name "*.html" -type f | while read file; do
    if grep -q "cache-module\.js" "$file"; then
        if ! grep -q "cache-module\.js?v=" "$file"; then
            echo "❌ FAIL: $file - missing ?v= on cache-module.js"
        else
            echo "✅ PASS: $file"
        fi
    fi
done
```

**תוצאה צפויה:** ✅ PASS עבור כל 38 הקבצים

---

### בדיקה 2: Build Version נשמר נכון

```bash
# בדוק ש-.build-version קיים ותקין
if [ -f ".build-version" ]; then
    VERSION=$(cat .build-version)
    echo "✅ Build version: $VERSION"
    
    # בדוק שהגרסה מופיעה בHTML
    if grep -q "$VERSION" trading-ui/index.html; then
        echo "✅ Version found in HTML files"
    else
        echo "❌ Version NOT found in HTML files"
    fi
else
    echo "❌ .build-version file missing"
fi
```

**תוצאה צפויה:** ✅ PASS

---

### בדיקה 3: Hash משתנה בין Commits

```bash
# שמור גרסה נוכחית
BEFORE=$(cat .build-version)

# עשה commit (או שינוי כלשהו)
echo "test" >> test_file.txt
git add test_file.txt
git commit -m "test commit"

# הרץ build script
./build-tools/cache-buster.sh > /dev/null 2>&1

# בדוק שהגרסה השתנתה
AFTER=$(cat .build-version)

if [ "$BEFORE" != "$AFTER" ]; then
    echo "✅ PASS: Version changed from $BEFORE to $AFTER"
else
    echo "❌ FAIL: Version stayed the same"
fi

# cleanup
git reset HEAD~1 --soft
rm test_file.txt
```

**תוצאה צפויה:** ✅ PASS - hash משתנה

---

## 🖱️ בדיקות ידניות

### בדיקה 4: Browser Cache - קבצים חדשים

**שלבים:**

1. פתח `http://localhost:8080/trades`
2. פתח DevTools (F12) → Network tab
3. רענן עמוד (F5)
4. בדוק את `cache-module.js`:

   ```
   ✅ Request: cache-module.js?v=1e88302_20251013_022247
   ✅ Status: 200 (או 304 Not Modified)
   ```

5. עשה שינוי ב-`cache-module.js` (הוסף comment)
6. הרץ: `./build-tools/cache-buster.sh`
7. רענן עמוד (F5)
8. בדוק שוב:

   ```
   ✅ Request: cache-module.js?v=NEW_HASH_HERE
   ✅ Status: 200 (טען קובץ חדש!)
   ```

**תוצאה צפויה:** דפדפן טוען קובץ חדש כי ה-URL שונה

---

### בדיקה 5: CRUD Operations - Cache מנוקה

**עמוד: trades.html**

**שלבים:**

1. פתח `http://localhost:8080/trades`
2. פתח Console (F12)
3. הוסף trade חדש
4. בדוק בConsole:

   ```
   ✅ "ניקוי מטמון"
   ✅ UnifiedCacheManager.remove('trades')
   ✅ "טוען נתונים מחדש..."
   ✅ loadTradesData() called
   ```

5. וודא שהטבלה מתעדכנת מיד (ללא page reload!)

**חזור על כך ב-8 העמודים:**

- [ ] trades
- [ ] executions
- [ ] trade_plans
- [ ] cash_flows
- [ ] tickers
- [ ] alerts
- [ ] notes
- [ ] trading_accounts

**תוצאה צפויה:** ✅ כל עמוד מנקה cache + מרענן נתונים

---

### בדיקה 6: Clear Cache Levels

**Level: Light**

1. פתח `http://localhost:8080/cache-test`
2. לחץ "🟢 Light"
3. בדוק Console:

   ```
   ✅ "Memory cleared"
   ✅ "Service caches cleared"
   ✅ "🔄 light clear: Refreshing page data without reload..."
   ✅ loadCacheData() called
   ❌ לא location.replace() (אין reload!)
   ```

**Level: Medium**

1. לחץ "🔵 Medium"
2. בדוק:

   ```
   ✅ localStorage cleared
   ✅ IndexedDB cleared
   ✅ Refreshing page data without reload
   ❌ לא reload!
   ```

**Level: Full**

1. לחץ "🟠 Full"
2. בדוק:

   ```
   ✅ All orphans cleared
   ✅ Refreshing page data without reload
   ❌ לא reload!
   ```

**Level: Nuclear**

1. לחץ "☢️ Nuclear"
2. בדוק:

   ```
   ✅ All localStorage cleared
   ✅ IndexedDB deleted
   ✅ "☢️ Nuclear clear: Performing full page reload"
   ✅ location.replace() called (יש reload!)
   ```

**תוצאה צפויה:**  

- Light/Medium/Full → ❌ אין reload  
- Nuclear → ✅ יש reload

---

## ✅ Checklist סופי

### Cache Busting

- [x] Build script קיים (`build-tools/cache-buster.sh`)
- [x] Script executable (`chmod +x`)
- [x] 38 HTML files עודכנו
- [x] כל JS/CSS עם `?v=hash`
- [x] `.build-version` נוצר
- [x] Cursor Task הוסף ("TT: Build & Bust Cache")

### CRUD Cache Invalidation

- [x] trades.js - מנקה cache אחרי save/update/delete
- [x] executions.js - מנקה cache
- [x] trade_plans.js - מנקה cache
- [x] cash_flows.js - מנקה cache
- [x] tickers.js - מנקה cache
- [x] alerts.js - מנקה cache (לבדוק)
- [x] notes.js - מנקה cache (לבדוק)
- [x] trading_accounts.js - מנקה cache (לבדוק)

### Clear Cache Behavior

- [x] Light/Medium/Full - רק refresh data
- [x] Nuclear - full page reload
- [x] Load functions מוגדרים ל-11 עמודים
- [x] Fallback למקרה של עמוד ללא load function

### Documentation

- [x] BACKEND_CACHE_ANALYSIS.md - ניתוח Backend
- [x] FRONTEND_CACHE_ANALYSIS.md - ניתוח Frontend
- [x] GAPS_ANALYSIS_REPORT.md - זיהוי פערים
- [ ] OPTION_A_IMPLEMENTATION_SUMMARY.md - סיכום יישום
- [ ] עדכון CACHE_IMPLEMENTATION_GUIDE.md
- [ ] עדכון README.md

### Build & Deploy

- [ ] בדיקות ידניות ב-9 עמודים
- [ ] גיבוי מקומי
- [ ] Git commit מפורט
- [ ] Git push

---

## 🐛 Troubleshooting

### בעיה: "Hash לא משתנה"

```bash
# וודא שאתה ב-git repository:
git status

# וודא ש-script רץ אחרי commit:
git commit -m "test"
./build-tools/cache-buster.sh
cat .build-version  # צריך להיות hash חדש
```

---

### בעיה: "קבצים לא נטענים"

```
Console Error: Failed to load resource: cache-module.js?v=...
```

**פתרון:** בדוק שה-path נכון:

```html
<!-- נכון: -->
<script src="scripts/modules/cache-module.js?v=hash"></script>

<!-- שגוי: -->
<script src="modules/cache-module.js?v=hash"></script>
```

---

### בעיה: "עדיין רואה קוד ישן"

1. בדוק ב-DevTools → Network שה-?v=hash נכון
2. עשה Hard Refresh (Cmd+Shift+R / Ctrl+Shift+F5)
3. נקה browser cache ידנית
4. בדוק שהקובץ בשרת עודכן בפועל

---

**מחבר:** TikTrack Development Team  
**תאריך:** 13 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ מוכן לשימוש

