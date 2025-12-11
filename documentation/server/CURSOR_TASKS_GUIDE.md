# TikTrack Cursor Tasks Guide

# מדריך מערכת Cursor Tasks ל-TikTrack

**תאריך יצירה:** 28 בספטמבר 2025  
**גרסה:** 1.0  
**סטטוס:** 📋 מדריך שימוש  
**מטרה:** מדריך מקיף לשימוש במערכת Cursor Tasks

---

## 📋 **תוכן עניינים**

1. [סקירה כללית](#סקירה-כללית)
2. [איך להשתמש ב-Tasks](#איך-להשתמש-ב-tasks)
3. [קטגוריות Tasks](#קטגוריות-tasks)
4. [פעולות מהירות](#פעולות-מהירות)
5. [טיפים ושיטות עבודה](#טיפים-ושיטות-עבודה)
6. [פתרון בעיות](#פתרון-בעיות)

---

## 🎯 **סקירה כללית**

מערכת Cursor Tasks של TikTrack כוללת **35+ פקודות** מאורגנות ב-8 קטגוריות עיקריות:

### **קטגוריות עיקריות:**

- 🚀 **ניהול שרת** - התחלה, עצירה, איתחול
- 🎛️ **מצבי מטמון** - development, no-cache, production
- 🧹 **ניהול מטמון** - ניקוי, סטטוס, dependencies
- 🏥 **בריאות מערכת** - health checks, metrics, rate limits
- 🗄️ **ניהול בסיס נתונים** - גיבוי, סטטוס, ניקוי
- 📝 **ניהול לוגים** - צפייה, מעקב, ניקוי
- 🌐 **נתונים חיצוניים** - Yahoo Finance, external data
- 🧪 **בדיקות** - API tests, system tests
- 🔧 **כלי פיתוח** - dashboards, management tools
- 🚀 **פעולות מהירות** - שילובים מהירים
- 🧹 **ניקוי ותחזוקה** - cleanup, maintenance
- 📦 **גיבוי ושחזור** - backup, restore

---

## 🎮 **איך להשתמש ב-Tasks**

### **דרך 1: Command Palette (מומלץ)**

1. לחץ `Cmd+Shift+P` (macOS) או `Ctrl+Shift+P` (Windows/Linux)
2. הקלד "Tasks: Run Task"
3. בחר את ה-Task הרצוי

### **דרך 2: Terminal Menu**

1. לחץ `Ctrl+Shift+`` (backtick) לפתיחת Terminal
2. לחץ על התפריט הנפתח ליד "+"
3. בחר "Run Task..."
4. בחר את ה-Task הרצוי

### **דרך 3: Keyboard Shortcuts**

- `Cmd+Shift+P` → "Tasks: Run Task" → בחר Task
- `Cmd+Shift+P` → "Tasks: Run Build Task" → בחר Build Task
- `Cmd+Shift+P` → "Tasks: Run Test Task" → בחר Test Task

---

## 🚀 **קטגוריות Tasks**

### **1. 🚀 ניהול שרת - Server Management**

#### **🚀 Start Server (Development)**

- **תפקיד:** התחלת שרת פיתוח
- **שימוש:** פיתוח יומיומי
- **פלט:** Terminal חדש עם שרת

#### **🛑 Stop Server**

- **תפקיד:** עצירת שרת
- **שימוש:** עצירה מהירה
- **פלט:** הודעת אישור

#### **🔄 Restart Server (Quick)**

- **תפקיד:** איתחול מהיר
- **שימוש:** אחרי שינויים בקוד
- **פלט:** עצירה + התחלה

#### **📊 Server Status**

- **תפקיד:** בדיקת סטטוס שרת
- **שימוש:** וידוא שהשרת רץ
- **פלט:** מידע על תהליכים

---

### **2. 🎛️ מצבי מטמון - Cache Modes**

#### **⚡ Server: Development Mode (10s TTL)**

- **תפקיד:** שרת עם מטמון מהיר (10 שניות)
- **שימוש:** פיתוח עם עדכונים מהירים
- **מאפיינים:** TTL קצר, debug mode

#### **🚫 Server: No Cache Mode**

- **תפקיד:** שרת ללא מטמון
- **שימוש:** בדיקות ופיתוח
- **מאפיינים:** ללא מטמון, נתונים טריים

#### **🏭 Server: Production Mode (5min TTL)**

- **תפקיד:** שרת עם מטמון אופטימלי
- **שימוש:** סימולציה של פרודקשן
- **מאפיינים:** TTL ארוך, ביצועים טובים

---

### **3. 🧹 ניהול מטמון - Cache Management**

#### **🧹 Clear Cache (API)**

- **תפקיד:** ניקוי מטמון דרך API
- **שימוש:** אחרי שינויים בנתונים
- **פלט:** הודעת אישור

#### **📊 Cache Status**

- **תפקיד:** הצגת סטטוס מטמון
- **שימוש:** מעקב אחר ביצועי מטמון
- **פלט:** JSON עם סטטיסטיקות

#### **🔗 Cache Dependencies**

- **תפקיד:** הצגת תלויות מטמון
- **שימוש:** הבנת מבנה המטמון
- **פלט:** JSON עם dependencies

---

### **4. 🏥 בריאות מערכת - System Health**

#### **🏥 System Health Check**

- **תפקיד:** בדיקת בריאות מערכת
- **שימוש:** וידוא שהכל עובד
- **פלט:** JSON עם סטטוס מערכת

#### **📈 Performance Metrics**

- **תפקיד:** איסוף מדדי ביצועים
- **שימוש:** ניתוח ביצועים
- **פלט:** JSON עם metrics

#### **📊 Rate Limits Status**

- **תפקיד:** סטטוס הגבלות קצב
- **שימוש:** מעקב אחר API usage
- **פלט:** JSON עם rate limits

---

### **5. 🗄️ ניהול בסיס נתונים - Database Management**

#### **🗄️ Database Backup**

- **תפקיד:** גיבוי בסיס נתונים
- **שימוש:** לפני שינויים גדולים
- **פלט:** קובץ גיבוי עם timestamp

#### **🔍 Database Status**

- **תפקיד:** סטטוס קבצי בסיס נתונים
- **שימוש:** מעקב אחר גודל וסטטוס
- **פלט:** רשימת קבצים וגודל

#### **🧹 Clean Database Logs**

- **תפקיד:** ניקוי לוגים ישנים
- **שימוש:** תחזוקה שבועית
- **פלט:** הודעת אישור

---

### **6. 📝 ניהול לוגים - Log Management**

#### **📝 View Server Logs**

- **תפקיד:** צפייה בלוגי שרת
- **שימוש:** מעקב אחר פעילות שרת
- **פלט:** Terminal עם tail -f

#### **📝 View Error Logs**

- **תפקיד:** צפייה בלוגי שגיאות
- **שימוש:** מעקב אחר שגיאות
- **פלט:** Terminal עם tail -f

#### **📝 View Cache Logs**

- **תפקיד:** צפייה בלוגי מטמון
- **שימוש:** מעקב אחר פעילות מטמון
- **פלט:** Terminal עם tail -f

#### **📝 View Performance Logs**

- **תפקיד:** צפייה בלוגי ביצועים
- **שימוש:** מעקב אחר ביצועים
- **פלט:** Terminal עם tail -f

---

### **7. 🌐 נתונים חיצוניים - External Data**

#### **🌐 External Data Status**

- **תפקיד:** סטטוס נתונים חיצוניים
- **שימוש:** מעקב אחר Yahoo Finance
- **פלט:** JSON עם סטטוס providers

#### **📈 Yahoo Finance Test**

- **תפקיד:** בדיקת Yahoo Finance API
- **שימוש:** וידוא שהנתונים מגיעים
- **פלט:** JSON עם נתוני AAPL

---

### **8. 🧪 בדיקות - Testing**

#### **🧪 Run API Tests**

- **תפקיד:** הרצת בדיקות API
- **שימוש:** וידוא שה-APIs עובדים
- **פלט:** תוצאות בדיקות

#### **🧪 Run System Tests**

- **תפקיד:** הרצת בדיקות מערכת
- **שימוש:** בדיקה מקיפה של המערכת
- **פלט:** תוצאות בדיקות

#### **🧪 Run Simple Tests**

- **תפקיד:** הרצת בדיקות פשוטות
- **שימוש:** בדיקות מהירות
- **פלט:** תוצאות בדיקות

---

### **9. 🔧 כלי פיתוח - Development Tools**

#### **🔧 Open System Management**

- **תפקיד:** פתיחת דף ניהול מערכת כללי
- **שימוש:** ניהול מתקדם של המערכת
- **פלט:** פתיחת דפדפן ל-http://localhost:8080/system-management

#### **🔧 Open Server Monitor**

- **תפקיד:** פתיחת דף ניטור שרת
- **שימוש:** ניטור מפורט של השרת
- **פלט:** פתיחת דפדפן ל-http://localhost:8080/server-monitor

#### **🔧 Open External Data Dashboard**

- **תפקיד:** פתיחת דשבורד נתונים חיצוניים
- **שימוש:** ניהול נתונים חיצוניים
- **פלט:** פתיחת דפדפן

#### **🔧 Open CRUD Testing Dashboard**

- **תפקיד:** פתיחת דשבורד בדיקות CRUD
- **שימוש:** בדיקות CRUD
- **פלט:** פתיחת דפדפן

---

### **10. 🚀 פעולות מהירות - Quick Actions**

#### **🚀 Quick: Start & Open Dashboard**

- **תפקיד:** התחלת שרת + פתיחת דשבורד ניטור
- **שימוש:** התחלה מהירה עם דשבורד ניטור
- **פלט:** שרת + דפדפן ל-http://localhost:8080/server-monitor

#### **🚀 Quick: Full System Check**

- **תפקיד:** בדיקה מקיפה של המערכת
- **שימוש:** וידוא שהכל עובד
- **פלט:** סטטוס שרת + health + cache

#### **🚀 Quick: Development Mode Setup**

- **תפקיד:** הגדרת מצב פיתוח + דשבורד ניטור
- **שימוש:** התחלת פיתוח מהירה
- **פלט:** שרת פיתוח + דפדפן ל-http://localhost:8080/server-monitor

---

### **11. 🧹 ניקוי ותחזוקה - Cleanup & Maintenance**

#### **🧹 Clean All Logs**

- **תפקיד:** ניקוי כל הלוגים הישנים
- **שימוש:** תחזוקה שבועית
- **פלט:** הודעת אישור

#### **🧹 Clean Node Modules**

- **תפקיד:** ניקוי node_modules
- **שימוש:** חיסכון במקום
- **פלט:** הודעת אישור

#### **🧹 Clean Python Cache**

- **תפקיד:** ניקוי Python cache
- **שימוש:** חיסכון במקום
- **פלט:** הודעת אישור

---

### **12. 📦 גיבוי ושחזור - Backup & Restore**

#### **📦 Full System Backup**

- **תפקיד:** גיבוי מלא של המערכת
- **שימוש:** לפני שינויים גדולים
- **פלט:** קובץ tar.gz עם timestamp

#### **📦 Database Only Backup**

- **תפקיד:** גיבוי בסיס נתונים בלבד
- **שימוש:** גיבוי מהיר של נתונים
- **פלט:** קובץ .db עם timestamp

---

## ⚡ **פעולות מהירות**

### **לפיתוח יומיומי:**

1. `🚀 Quick: Development Mode Setup` - התחלה מהירה + דשבורד ניטור
2. `🧹 Clear Cache (API)` - ניקוי מטמון
3. `🔄 Restart Server (Quick)` - איתחול מהיר

### **לבדיקות:**

1. `🚀 Quick: Full System Check` - בדיקה מקיפה
2. `🧪 Run API Tests` - בדיקות API
3. `🏥 System Health Check` - בדיקת בריאות

### **לתחזוקה:**

1. `📦 Full System Backup` - גיבוי מלא
2. `🧹 Clean All Logs` - ניקוי לוגים
3. `🗄️ Database Backup` - גיבוי בסיס נתונים

---

## 💡 **טיפים ושיטות עבודה**

### **טיפ 1: שימוש ב-Quick Actions**

- השתמש ב-Quick Actions לפעולות נפוצות
- הם משלבים מספר פעולות בפקודה אחת

### **טיפ 2: מעקב אחר לוגים**

- השתמש ב-View Logs Tasks למעקב בזמן אמת
- כל Task פותח Terminal נפרד

### **טיפ 3: בדיקות לפני שינויים**

- הרץ `🚀 Quick: Full System Check` לפני שינויים גדולים
- הרץ `📦 Full System Backup` לפני שינויים חשובים

### **טיפ 4: ניהול מטמון**

- השתמש ב-Development Mode לפיתוח
- השתמש ב-No Cache Mode לבדיקות
- השתמש ב-Production Mode לסימולציה

### **טיפ 5: תחזוקה שבועית**

- הרץ `🧹 Clean All Logs` כל שבוע
- הרץ `📦 Database Backup` לפני שינויים
- הרץ `🧹 Clean Python Cache` לחיסכון במקום

---

## 🔧 **פתרון בעיות**

### **בעיה: Task לא עובד**

**פתרון:**

1. בדוק שהשרת רץ: `📊 Server Status`
2. בדוק בריאות מערכת: `🏥 System Health Check`
3. נסה איתחול: `🔄 Restart Server (Quick)`

### **בעיה: מטמון לא מתעדכן**

**פתרון:**

1. נקה מטמון: `🧹 Clear Cache (API)`
2. בדוק סטטוס: `📊 Cache Status`
3. בדוק dependencies: `🔗 Cache Dependencies`

### **בעיה: שגיאות בלוגים**

**פתרון:**

1. צפה בלוגי שגיאות: `📝 View Error Logs`
2. בדוק בריאות מערכת: `🏥 System Health Check`
3. הרץ בדיקות: `🧪 Run API Tests`

### **בעיה: ביצועים איטיים**

**פתרון:**

1. בדוק metrics: `📈 Performance Metrics`
2. נקה מטמון: `🧹 Clear Cache (API)`
3. בדוק rate limits: `📊 Rate Limits Status`

### **בעיה: נתונים חיצוניים לא עובדים**

**פתרון:**

1. בדוק סטטוס: `🌐 External Data Status`
2. בדוק Yahoo Finance: `📈 Yahoo Finance Test`
3. פתח דשבורד: `🔧 Open External Data Dashboard`

---

## 📚 **משאבים נוספים**

### **דוקומנטציה קשורה:**

- [TikTrack Server Management System Architecture](TikTrack_Server_Management_System_Architecture.md)
- [RESTART_SCRIPT_GUIDE.md](RESTART_SCRIPT_GUIDE.md)
- [CACHE_IMPLEMENTATION_GUIDE.md](../frontend/CACHE_IMPLEMENTATION_GUIDE.md)

### **קבצים חשובים:**

- `.vscode/tasks.json` - קובץ הגדרות Tasks
- `Backend/dev_server.py` - שרת פיתוח
- `Backend/app.py` - שרת ראשי
- `http://localhost:8080/server-monitor` - דף ניטור שרת

### **פקודות שימושיות:**

```bash
# בדיקת סטטוס שרת
lsof -i :8080

# עצירת שרת
lsof -ti :8080 | xargs kill -9

# התחלת שרת
cd Backend && python3 dev_server.py

# בדיקת בריאות
curl http://localhost:8080/api/system/health
```

---

## 🆕 **עדכונים חדשים - דצמבר 2024**

### **🎮 אינטגרציה עם דשבורדים**

#### **עמוד ניטור שרת (server-monitor.html)**

- **סקשן חדש:** "Cursor Tasks Management"
- **כפתורים חדשים:**
  - 🔄 איתחול מהיר
  - 🎛️ מצב מטמון
  - 🔧 ניהול מערכת
  - 🚀 כל הדשבורדים
- **תצוגת מצב נוכחי:** מצב מטמון, סטטוס שרת, זמן פעילות

#### **עמוד ניהול מערכת (system-management.html)**

- **סקשן חדש:** "Cursor Tasks Integration"
- **כפתורים חדשים:**
  - פעולות מהירות (התחלה, איתחול, עצירה)
  - מצבי מטמון (Development, No Cache, Production)
  - כלי פיתוח (ניטור שרת, נתונים חיצוניים, בדיקות CRUD)
- **תצוגת סטטוס:** שרת, מצב מטמון, פורט, זמן פעילות, זיכרון

### **🔗 חיבור למערכת API**

- **API Endpoints:** `/api/server/start`, `/api/server/restart`, `/api/server/stop`
- **Cache Mode API:** `/api/server/change-mode`
- **התראות:** מערכת התראות גלובלית
- **Rate Limiting:** הגנה מפני עומס יתר

### **🎯 יתרונות המערכת החדשה**

1. **ניהול מרכזי:** כל הפעולות במקום אחד
2. **ממשק אחיד:** עיצוב עקבי בכל הדשבורדים
3. **משוב מיידי:** התראות והתראות על כל פעולה
4. **גמישות:** תמיכה במצבי מטמון שונים
5. **ניטור:** מעקב אחר סטטוס השרת בזמן אמת

---

**תאריך עדכון אחרון:** דצמבר 2024  
**גרסה:** 2.0  
**מפתח:** TikTrack Development Team
