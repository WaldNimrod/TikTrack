# TikTrack Cursor Performance Guide
# מדריך ביצועי Cursor לפרויקט TikTrack

## 📋 סקירה כללית

פרויקט TikTrack עבר שיפורי ביצועים מקיפים ב-Cursor בשנת 2024. מדריך זה מסכם את כל השיפורים והכלים שנוצרו.

## 🚀 שיפורי ביצועים שבוצעו

### 1. הגדרות Cursor מותאמות
**קובץ:** `.vscode/settings.json`

**שיפורים:**
- ✅ כיבוי `git.autofetch` - מונע fetch אוטומטי
- ✅ כיבוי `search.followSymlinks` - מפשט חיפוש
- ✅ הגבלת `files.watcherExclude` - מונע מעקב אחרי תיקיות גדולות
- ✅ כיבוי `editor.codeActionsOnSave` - מונע פעולות אוטומטיות
- ✅ הגדרות Python מותאמות - `typeCheckingMode: "basic"`

### 2. כלי בדיקת שרת חכמים
**קבצים:** `Backend/quick_server_check.py`, `Backend/server_health_check.py`

**יתרונות:**
- ✅ לא נתקעים בלופים כמו curl
- ✅ זיהוי אוטומטי של פורט 8080
- ✅ בדיקה מהירה (2 שניות במקום 10+)
- ✅ המלצות אוטומטיות לפתרון בעיות

### 3. מערכת מוניטורינג אוטומטית
**קובץ:** `Backend/README_SERVER_STABILITY.md`

**יתרונות:**
- ✅ מנטור אוטומטי שמפעיל מחדש אם השרת נופל
- ✅ בדיקת בריאות כל 30 שניות
- ✅ לוגים מפורטים
- ✅ הגבלת ניסיונות הפעלה מחדש

## 🔧 שימוש יומיומי

### הפעלת שרת
```bash
# מומלץ ביותר - מערכת מוניטורינג אוטומטית
./start_server.sh

# אלטרנטיבה יציבה
cd Backend
python3 app.py

# לפיתוח
cd Backend
python3 app.py
```

### ⚠️ חשוב: שרת יציב על פורט 5002
המערכת פועלת על שרת יציב (`app.py`) על פורט 5002. **אין לשנות זאת!**

### בדיקת זמינות שרת
```bash
# בדיקה מהירה (מומלץ)
python3 Backend/quick_server_check.py

# בדיקה מפורטת
python3 Backend/server_health_check.py

# בדיקה ידנית (legacy)
curl http://localhost:8080/api/health
```

### פתרון בעיות נפוצות
```bash
# אם השרת לא עולה
cd Backend
python3 quick_server_check.py
./run_monitored.sh

# אם יש תהליכים כפולים
lsof -i :8080
kill -9 <PID>

# ניקוי cache של Cursor
Cmd+Shift+P → "Developer: Reload Window"
```

## 📚 דוקומנטציה מפורטת

### מדריכי ביצועים
- `documentation/Cursor_Performance_Manual_Actions.md` - פעולות ידניות
- `Backend/README_SERVER_STABILITY.md` - יציבות שרת
- `.vscode/settings.json` - הגדרות Cursor

### כלי בדיקה
- `Backend/quick_server_check.py` - בדיקה מהירה
- `Backend/server_health_check.py` - בדיקה מפורטת

## 🎯 המלצות לשימוש

### לשימוש יומיומי
1. **הפעלת שרת:** `./run_monitored.sh`
2. **בדיקת זמינות:** `python3 Backend/quick_server_check.py`
3. **סגירת טאבים לא פעילים**
4. **שימוש ב-Workspace Trust**

### לפיתוח
1. **הגדרות Cursor:** כבר מוגדרות ב-`.vscode/settings.json`
2. **בדיקת ביצועים:** השתמש בכלי הבדיקה החדשים
3. **ניקוי תקופתי:** Reload Window מדי פעם

### לפתרון בעיות
1. **בדיקה מהירה:** `python3 Backend/quick_server_check.py`
2. **בדיקה מפורטת:** `python3 Backend/server_health_check.py`
3. **הפעלה מחדש:** `./run_monitored.sh`

## 📊 מדדי ביצועים

### לפני השיפורים
- ❌ בדיקות curl נתקעות בלופים
- ❌ Cursor איטי בשעות העומס
- ❌ שרת "נרדם" לעיתים קרובות
- ❌ בזבוז זמן בבדיקות ידניות

### אחרי השיפורים
- ✅ בדיקות מהירות ואמינות
- ✅ Cursor מהיר ויציב
- ✅ שרת יציב עם מוניטורינג אוטומטי
- ✅ חיסכון משמעותי בזמן

## 🔄 תחזוקה

### עדכון הגדרות
הגדרות Cursor מתעדכנות אוטומטית ב-`.vscode/settings.json`

### עדכון כלי בדיקה
הכלים נמצאים ב-`Backend/` ומתעדכנים לפי הצורך

### גיבוי
כל השיפורים נשמרים ב-Git ומגובים אוטומטית

## 📞 תמיכה

### אם יש בעיות
1. בדוק את המדריכים המפורטים
2. השתמש בכלי הבדיקה החדשים
3. בדוק את הלוגים ב-`server_detailed.log`

### עדכונים עתידיים
- כל שיפור חדש יתועד כאן
- הכלים מתעדכנים לפי הצורך
- המדריכים מתעדכנים באופן שוטף

---

**תאריך עדכון אחרון:** 2025-08-15  
**גרסה:** 1.0  
**סטטוס:** פעיל ותחזוקתי
