# TikTrack Server Management Guide
# =================================
# מדריך מפורט לניהול שרת TikTrack

**גרסה:** 3.0  
**תאריך עדכון:** אוקטובר 2025  
**מפתח:** TikTrack Development Team

---

## 📋 **סקירה כללית**

מערכת TikTrack כוללת מערכת ניהול שרת מאוחדת עם מניעת הרצה מקבילה:
- **Unified Startup Script** - הפעלה מאוחדת עם בדיקת תהליכים
- **Process Conflict Detection** - מניעת הרצה מקבילה אוטומטית
- **Detailed Error Messages** - הודעות שגיאה מפורטות עם הדרכה
- **Foreground Development Mode** - לוגים חיים לפיתוח
- **Comprehensive Logging** - מערכת לוגים מתקדמת

---

## 🚀 **How to Start the Server (הדרך הנכונה)**

### **הפעלה רגילה:**
```bash
./start_server.sh
```

### **בדיקת תהליכים בלבד:**
```bash
./start_server.sh --check-only
```

### **הפעלה כפויה (לא מומלץ):**
```bash
./start_server.sh --force
```

### **מה קורה כשמריצים את הסקריפט:**
1. **בדיקת Python** - וידוא ש-Python3 זמין
2. **בדיקת קבצים** - וידוא שכל הקבצים הנדרשים קיימים
3. **בדיקת תהליכים** - זיהוי תהליכי TikTrack קיימים על פורט 8080
4. **הפעלת השרת** - הפעלה ב-foreground עם לוגים חיים
5. **טיפול בעצירה** - עצירה מסודרת עם Ctrl+C

---

## ⚠️ **Multiple Processes Issue (בעיית תהליכים מקבילים)**

### **הבעיה:**
לפני המערכת החדשה, היה אפשר להפעיל מספר תהליכי שרת במקביל על אותו פורט 8080, מה שגרם ל:
- תהליכים "תקועים" ברקע
- בלבול לגבי איזה שרת רץ
- בעיות ביצועים
- קושי בפיתוח ורענון נתונים

### **הפתרון:**
המערכת החדשה כוללת:
- **זיהוי אוטומטי** של תהליכי TikTrack קיימים
- **הודעות שגיאה מפורטות** עם פרטי התהליך הקיים
- **הדרכה ברורה** איך לפתור את הבעיה
- **מניעת הרצה מקבילה** לחלוטין

### **דוגמה לשגיאה:**
```
🚫 ERROR: TikTrack Server Already Running
================================================================================

Found existing TikTrack server process(es):

Process #1:
  PID: 93432
  Command: /Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/Resources/Python.app/Contents/MacOS/Python app.py
  Running Time: 2h 15m
  Status: sleeping

To resolve this issue:
1. Stop the existing server:
   kill 93432

2. Or use Ctrl+C in the terminal where the server is running

3. Then run the startup script again:
   ./start_server.sh
```

---

## 🎮 **Cursor Tasks Integration (השיטה המומלצת)**

### **איך להשתמש:**
1. **פתח Cursor IDE**
2. **לחץ `Cmd+Shift+P`** (Mac) או `Ctrl+Shift+P` (Windows/Linux)
3. **הקלד "Tasks: Run Task"**
4. **בחר את המשימה הרצויה**

### **משימות זמינות:**

#### **🔄 פעולות שרת בסיסיות**
- **`🔄 Restart Server (Quick)`** - איתחול מהיר של השרת
- **`🛑 Stop Server`** - עצירת השרת
- **`🚀 Start Server (Development)`** - התחלת השרת במצב פיתוח
- **`📊 Server Status`** - בדיקת סטטוס השרת

#### **🚀 פעולות מהירות עם דשבורדים**
- **`🚀 Quick: Development Mode Setup`** - התחלת מצב פיתוח + פתיחת דשבורד
- **`🚀 Quick: Start & Open Dashboard`** - התחלת שרת + פתיחת דשבורד ניטור
- **`🔄 Restart & Open Dashboard`** - איתחול + פתיחת דשבורד ניהול

#### **🎛️ מצבי מטמון**
- **`🎛️ Development Mode (10s)`** - מצב פיתוח עם TTL 10 שניות
- **`🎛️ No Cache Mode`** - מצב ללא מטמון
- **`🎛️ Production Mode (5min)`** - מצב ייצור עם TTL 5 דקות
- **`🎛️ Preserve Mode`** - שמירת מצב מטמון נוכחי

#### **🔧 כלי פיתוח**
- **`🔧 Open System Management`** - פתיחת דשבורד ניהול מערכת
- **`🔧 Open Server Monitor`** - פתיחת דשבורד ניטור שרת
- **`🚀 Quick: Open All Dashboards`** - פתיחת כל הדשבורדים

---

## 🌐 **Web Dashboard Management**

### **דשבורד ניטור שרת**
**URL:** `http://localhost:8080/server-monitor`

**תכונות:**
- **סקשן Cursor Tasks Management** - כפתורי פעולה מהירה
- **תצוגת מצב נוכחי** - מצב מטמון, סטטוס שרת, זמן פעילות
- **ניטור בזמן אמת** - מעקב אחר ביצועי השרת
- **לוגים מפורטים** - היסטוריית פעולות ושגיאות

**כפתורים זמינים:**
- 🔄 איתחול מהיר
- 🎛️ מצב מטמון
- 🔧 ניהול מערכת
- 🚀 כל הדשבורדים

### **דשבורד ניהול מערכת**
**URL:** `http://localhost:8080/system-management`

**תכונות:**
- **סקשן Cursor Tasks Integration** - פעולות מתקדמות
- **ניהול מצבי מטמון** - שליטה מלאה במטמון
- **כלי פיתוח** - גישה לכלי פיתוח מתקדמים
- **ניטור מערכת** - מעקב אחר בריאות המערכת

**כפתורים זמינים:**
- פעולות מהירות (התחלה, איתחול, עצירה)
- מצבי מטמון (Development, No Cache, Production)
- כלי פיתוח (ניטור שרת, נתונים חיצוניים, בדיקות CRUD)

---

## 🔗 **API Endpoints**

### **ניהול שרת**
```bash
# איתחול שרת
POST /api/server/restart
Content-Type: application/json

# התחלת שרת
POST /api/server/start
Content-Type: application/json

# עצירת שרת
POST /api/server/stop
Content-Type: application/json

# שינוי מצב מטמון
POST /api/server/change-mode
Content-Type: application/json
{
  "mode": "development",
  "restart_type": "quick"
}
```

### **בדיקת בריאות**
```bash
# בדיקה בסיסית
GET /api/system/health

# בדיקה מפורטת
GET /api/system/health/detailed

# סטטוס מטמון
GET /api/cache/status

# מדדי ביצועים
GET /api/metrics/collect
```

### **דוגמאות שימוש:**
```bash
# בדיקת סטטוס שרת
curl -s http://localhost:8080/api/system/health

# שינוי למצב פיתוח
curl -X POST http://localhost:8080/api/server/change-mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "development", "restart_type": "quick"}'

# איתחול שרת
curl -X POST http://localhost:8080/api/server/restart
```

---

## 🎛️ **מצבי מטמון**

### **Development Mode**
- **TTL:** 10 שניות
- **שימוש:** פיתוח מהיר
- **יתרונות:** עדכונים מהירים, דיבוג קל
- **חסרונות:** ביצועים נמוכים יותר

### **No Cache Mode**
- **TTL:** 0 (ללא מטמון)
- **שימוש:** דיבוג מתקדם
- **יתרונות:** נתונים תמיד מעודכנים
- **חסרונות:** ביצועים נמוכים מאוד

### **Production Mode**
- **TTL:** 5 דקות
- **שימוש:** ייצור
- **יתרונות:** ביצועים גבוהים
- **חסרונות:** עדכונים איטיים יותר

### **Preserve Mode**
- **TTL:** שמירת מצב נוכחי
- **שימוש:** שמירת הגדרות
- **יתרונות:** יציבות
- **חסרונות:** לא משנה מצב

---

## ⚠️ **פתרון בעיות נפוצות**

### **השרת לא מתחיל**
1. **בדוק שהפורט פנוי:**
   ```bash
   lsof -i :8080
   ```
2. **הרוג תהליכים קיימים:**
   ```bash
   lsof -ti :8080 | xargs kill -9
   ```
3. **השתמש ב-Cursor Tasks:**
   - `🛑 Stop Server` → `🚀 Start Server (Development)`

### **Rate Limiting**
- **בעיה:** "Rate limit exceeded"
- **פתרון:** המתן 3 שניות בין בקשות
- **מניעה:** השתמש ב-Cursor Tasks במקום API calls מרובים

### **מטמון לא מתעדכן**
1. **בדוק מצב מטמון נוכחי:**
   ```bash
   curl -s http://localhost:8080/api/cache/status
   ```
2. **שנה למצב No Cache:**
   - Cursor Tasks: `🎛️ No Cache Mode`
   - או Dashboard: כפתור "No Cache"

### **דשבורדים לא נפתחים**
1. **וודא שהשרת רץ:**
   ```bash
   curl -s http://localhost:8080/api/system/health
   ```
2. **פתח ידנית:**
   - Server Monitor: `http://localhost:8080/server-monitor`
   - System Management: `http://localhost:8080/system-management`

---

## 📊 **ניטור וביצועים**

### **מדדי ביצועים חשובים**
- **זמן תגובה:** < 100ms
- **זיכרון:** < 500MB
- **CPU:** < 50%
- **זמן פעילות:** > 99%

### **לוגים חשובים**
- **Server Logs:** `logs/app.log`
- **Error Logs:** `logs/errors.log`
- **Performance Logs:** `logs/performance.log`

### **בדיקות תקופתיות**
- **יומי:** בדיקת בריאות שרת
- **שבועי:** ניקוי לוגים
- **חודשי:** עדכון dependencies

---

## 🔧 **תחזוקה שוטפת**

### **פעולות יומיות**
1. **בדיקת סטטוס שרת** - `📊 Server Status`
2. **בדיקת לוגים** - דשבורד ניטור שרת
3. **בדיקת ביצועים** - דשבורד ניהול מערכת

### **פעולות שבועיות**
1. **ניקוי לוגים** - `🧹 Clean All Logs`
2. **בדיקת dependencies** - `🔍 Check Dependencies`
3. **גיבוי בסיס נתונים** - `💾 Backup Database`

### **פעולות חודשיות**
1. **עדכון dependencies**
2. **בדיקת אבטחה**
3. **אופטימיזציה של ביצועים**

---

## 📚 **משאבים נוספים**

### **דוקומנטציה קשורה**
- [Cursor Tasks Guide](CURSOR_TASKS_GUIDE.md) - מדריך מפורט ל-Cursor Tasks
- [Server Architecture](TikTrack_Server_Management_System_Architecture.md) - ארכיטקטורת השרת
- [Monitoring System](MONITORING_SYSTEM.md) - מערכת ניטור
- [Performance System](PERFORMANCE_SYSTEM.md) - מערכת ביצועים

### **קבצי תצורה חשובים**
- `.vscode/tasks.json` - הגדרות Cursor Tasks
- `Backend/app.py` - קובץ השרת הראשי
- `Backend/routes/api/server_management.py` - API endpoints

### **קבצי לוג**
- `logs/app.log` - לוגים כלליים
- `logs/errors.log` - לוגי שגיאות
- `logs/performance.log` - לוגי ביצועים

---

## 🆘 **תמיכה**

### **במקרה של בעיות**
1. **בדוק את הלוגים** בדשבורד ניטור שרת
2. **השתמש ב-Cursor Tasks** לפעולות בסיסיות
3. **בדוק את הדוקומנטציה** הקשורה
4. **פנה לצוות הפיתוח** עם פרטי השגיאה

### **מידע נדרש לתמיכה**
- **גרסת מערכת הפעלה**
- **גרסת Python**
- **לוגי שגיאות רלוונטיים**
- **תיאור הבעיה המדויק**
- **שלבי השחזור**

---

**תאריך עדכון אחרון:** דצמבר 2024  
**גרסה:** 2.0  
**מפתח:** TikTrack Development Team








