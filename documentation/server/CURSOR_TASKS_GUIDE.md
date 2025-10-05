# TikTrack Cursor Tasks Guide
# מדריך מערכת Cursor Tasks ל-TikTrack

**תאריך יצירה:** 28 בספטמבר 2025  
**תאריך עדכון:** 1 באוקטובר 2025  
**גרסה:** 2.0  
**סטטוס:** 📋 מדריך שימוש מעודכן
**מטרה:** מדריך מקיף לשימוש במערכת Cursor Tasks

---

## 📋 **תוכן עניינים**

1. [סקירה כללית](#סקירה-כללית)
2. [איך להשתמש ב-Tasks](#איך-להשתמש-ב-tasks)
3. [משימות זמינות](#משימות-זמינות)
4. [שרת אחד מאוחד](#שרת-אחד-מאוחד)
5. [טיפים ושיטות עבודה](#טיפים-ושיטות-עבודה)
6. [פתרון בעיות](#פתרון-בעיות)

---

## 🎯 **סקירה כללית**

מערכת Cursor Tasks של TikTrack כוללת **3 משימות בסיסיות** לניהול השרת המאוחד:

### **המשימות הזמינות:**
1. 🚀 **TT: Start Server** - הפעלת השרת
2. 🛑 **TT: Stop Server** - עצירת השרת
3. 🔄 **TT: Restart Server** - איתחול מהיר (עצירה + הפעלה)

---

## 🎮 **איך להשתמש ב-Tasks**

### **דרך 1: Command Palette (מומלץ)**
1. לחץ `Cmd+Shift+P` (macOS) או `Ctrl+Shift+P` (Windows/Linux)
2. הקלד "Tasks: Run Task"
3. בחר את ה-Task הרצוי (TT: Start Server / Stop / Restart)

### **דרך 2: Terminal Menu**
1. לחץ `Ctrl+Shift+`` (backtick) לפתיחת Terminal
2. לחץ על התפריט הנפתח ליד "+"
3. בחר "Run Task..."
4. בחר את ה-Task הרצוי

### **דרך 3: Keyboard Shortcuts**
- `Cmd+Shift+P` → "Tasks: Run Task" → בחר Task
- `Cmd+Shift+P` → "Tasks: Run Build Task" → TT: Start Server (default)

---

## 🚀 **משימות זמינות**

### **1. 🚀 TT: Start Server**

**תיאור:** הפעלת שרת הפיתוח/ייצור הראשי

**פקודה:** `cd Backend && python3 app.py`

**שימוש:**
- פיתוח יומיומי
- הפעלה ראשונית של השרת
- אחרי עצירה מלאה

**פלט:** Terminal חדש עם לוגים חיים של השרת

**זמן הפעלה:** ~10 שניות עד הפעלה מלאה

---

### **2. 🛑 TT: Stop Server**

**תיאור:** עצירה מיידית של השרת

**פקודה:** `lsof -ti :8080 | xargs kill -9 2>/dev/null || true`

**שימוש:**
- עצירת השרת לפני שינויים גדולים
- ניקוי תהליכים תקועים
- עצירה לפני גיבוי

**פלט:** הודעת אישור (או ללא פלט אם השרת לא רץ)

**הערה:** הפקודה בטוחה - לא תיכשל אם השרת לא רץ

---

### **3. 🔄 TT: Restart Server**

**תיאור:** איתחול מהיר - עצירה + המתנה + הפעלה

**פקודה:** `lsof -ti :8080 | xargs kill -9 2>/dev/null || true; sleep 1; cd Backend && python3 app.py`

**שימוש:**
- אחרי שינויים בקוד Python
- אחרי שינויים בהגדרות
- כשצריך ניקוי מלא של המערכת

**פלט:** Terminal חדש עם לוגים חיים של השרת

**זמן ביצוע:** ~11 שניות (1 שניית המתנה + 10 שניות הפעלה)

---

## 🖥️ **שרת אחד מאוחד**

### **Backend/app.py - השרת הראשי**

המערכת עובדת עם **שרת אחד בלבד**:

**מאפיינים:**
- ✅ Flask server מאוחד
- ✅ כל ה-API endpoints
- ✅ מערכת מטמון מתקדמת (4 שכבות)
- ✅ נתונים חיצוניים (Yahoo Finance)
- ✅ מערכת בריאות ומדדים
- ✅ localStorage Events במקום SocketIO
- ✅ פורט 8080
- ✅ לוגים מפורטים (`server_detailed.log`)

**תמיכה במצבי מטמון:**
- Development Mode - מטמון מהיר (10 שניות TTL)
- No Cache Mode - ללא מטמון לבדיקות
- Production Mode - מטמון אופטימלי (5 דקות TTL)

**מצב מטמון מוגדר ב:** `Backend/config/settings.py`

---

## 💡 **טיפים ושיטות עבודה**

### **טיפ 1: העדפת ניקוי מטמון על פני איתחול**
במקום להפעיל `TT: Restart Server` בכל פעם:
1. נסה קודם לנקות מטמון דרך API: `http://localhost:8080/api/cache/clear`
2. או דרך דשבורד ניהול: `http://localhost:8080/system-management`
3. רק אם זה לא עוזר - הפעל Restart

**יתרון:** חיסכון בזמן (~10 שניות)

---

### **טיפ 2: שימוש ב-Web Dashboards**

**דשבורד ניטור שרת:**
- URL: `http://localhost:8080/server-monitor`
- תכונות: ניטור בזמן אמת, סטטוס מערכת, מדדי ביצועים

**דשבורד ניהול מערכת:**
- URL: `http://localhost:8080/system-management`
- תכונות: ניקוי מטמון, שינוי מצבים, פעולות מהירות

---

### **טיפ 3: מתי להשתמש בכל משימה**

| סיטואציה | משימה מומלצת |
|----------|--------------|
| התחלת עבודה | `TT: Start Server` |
| שינוי בקוד Python | `TT: Restart Server` |
| שינוי בקוד JavaScript/HTML | רענון דפדפן (F5) |
| שינוי בנתוני DB | ניקוי מטמון (לא Restart) |
| שינוי בהגדרות Cache | `TT: Restart Server` |
| בעיות ביצועים | ניקוי מטמון קודם |
| בעיות קריטיות | `TT: Restart Server` |
| סיום עבודה | `TT: Stop Server` |

---

### **טיפ 4: בדיקת סטטוס השרת**

**דרך 1: Terminal**
```bash
lsof -i :8080
```

**דרך 2: API**
```bash
curl http://localhost:8080/api/system/health
```

**דרך 3: דפדפן**
- פתח: `http://localhost:8080/server-monitor`

---

### **טיפ 5: לוגים וניפוי שגיאות**

**מיקום לוגים:**
- `Backend/server_detailed.log` - לוג מפורט של השרת
- `Backend/logs/app.log` - לוג אפליקציה
- `Backend/logs/errors.log` - לוג שגיאות
- `Backend/logs/cache.log` - לוג מטמון
- `Backend/logs/performance.log` - לוג ביצועים

**צפייה בלוג חי:**
```bash
tail -f Backend/server_detailed.log
```

---

## 🔧 **פתרון בעיות**

### **בעיה: השרת לא מתניע**

**תסמינים:**
- אחרי `TT: Start Server` אין פלט
- או הודעת שגיאה באדום

**פתרון:**
1. בדוק שפורט 8080 פנוי:
   ```bash
   lsof -i :8080
   ```
2. אם יש תהליך תקוע, הפעל `TT: Stop Server`
3. המתן 2 שניות
4. הפעל שוב `TT: Start Server`

---

### **בעיה: השרת תקוע**

**תסמינים:**
- השרת לא עונה לבקשות
- דשבורד לא נטען
- API לא עובד

**פתרון:**
1. הפעל `TT: Restart Server`
2. אם לא עוזר - הפעל ידנית:
   ```bash
   lsof -ti :8080 | xargs kill -9
   sleep 2
   cd Backend && python3 app.py
   ```

---

### **בעיה: מטמון לא מתעדכן**

**תסמינים:**
- שינויים בנתונים לא נראים
- נתונים ישנים מוצגים

**פתרון:**
1. נקה מטמון דרך API:
   ```bash
   curl -X POST http://localhost:8080/api/cache/clear
   ```
2. או דרך דשבורד: `http://localhost:8080/system-management`
3. רענן דפדפן (F5)
4. אם לא עוזר - `TT: Restart Server`

---

### **בעיה: שגיאות בלוגים**

**תסמינים:**
- הודעות שגיאה אדומות
- 500 errors
- בעיות חיבור לDB

**פתרון:**
1. צפה בלוג שגיאות:
   ```bash
   tail -f Backend/logs/errors.log
   ```
2. בדוק בריאות מערכת:
   ```bash
   curl http://localhost:8080/api/system/health
   ```
3. בדוק חיבור לDB:
   ```bash
   ls -lh Backend/db/simpleTrade_new.db
   ```
4. אם צריך - `TT: Restart Server`

---

### **בעיה: ביצועים איטיים**

**תסמינים:**
- טעינה איטית של דפים
- API איטי
- זמן תגובה ארוך

**פתרון:**
1. בדוק מדדי ביצועים:
   ```bash
   curl http://localhost:8080/api/system/metrics
   ```
2. נקה מטמון: `http://localhost:8080/api/cache/clear`
3. בדוק גודל DB:
   ```bash
   ls -lh Backend/db/
   ```
4. שקול שינוי למצב Development (TTL קצר יותר)

---

## 📚 **משאבים נוספים**

### **דוקומנטציה קשורה:**
- [TikTrack Server Management System Architecture](TikTrack_Server_Management_System_Architecture.md)
- [CACHE_IMPLEMENTATION_GUIDE.md](../frontend/CACHE_IMPLEMENTATION_GUIDE.md)
- [Backend/app.py](../../Backend/app.py) - קוד השרת הראשי

### **קבצי הגדרות חשובים:**
- `.vscode/tasks.json` - הגדרות Cursor Tasks
- `Backend/config/settings.py` - הגדרות מטמון ומצבים
- `Backend/config/database.py` - הגדרות בסיס נתונים
- `Backend/config/logging.py` - הגדרות לוגים

### **API Endpoints שימושיים:**
```bash
# בריאות מערכת
curl http://localhost:8080/api/system/health

# ניקוי מטמון
curl -X POST http://localhost:8080/api/cache/clear

# סטטוס מטמון
curl http://localhost:8080/api/cache/status

# מדדי ביצועים
curl http://localhost:8080/api/system/metrics
```

---

## 🆕 **היסטוריית עדכונים**

### **גרסה 2.0 - אוקטובר 2025**
- ✅ עדכון למבנה שרת אחד בלבד (app.py)
- ✅ הסרת הפניות ל-dev_server.py (לא קיים יותר)
- ✅ הסרת הפניות לסקריפט ./restart (לא פעיל)
- ✅ עדכון ל-3 משימות בסיסיות בלבד
- ✅ דיוק מלא בהתאם למציאות הקיימת
- ✅ הוספת טיפים מעשיים

### **גרסה 1.0 - ספטמבר 2025**
- ✅ יצירת מדריך ראשוני
- ✅ תיעוד 35+ משימות (לא מיושמות בפועל)

---

## 📝 **הערות חשובות**

1. **שרת אחד בלבד** - המערכת עובדת רק עם `Backend/app.py`
2. **ללא dev_server** - dev_server.py הוסר מהמערכת
3. **ללא restart script** - סקריפט ./restart לא פעיל כרגע
4. **3 משימות בלבד** - רק Start, Stop, Restart זמינות ב-Cursor Tasks
5. **פורט 8080** - השרת תמיד רץ על פורט זה
6. **העדפת Cache Clear** - תמיד נסה לנקות מטמון לפני Restart

---

**תאריך עדכון אחרון:** 1 באוקטובר 2025  
**גרסה:** 2.0  
**סטטוס:** ✅ מדויק ומעודכן  
**מפתח:** TikTrack Development Team
