# TikTrack Server Management System Architecture
# ארכיטקטורת מערכת ניהול שרת TikTrack

**תאריך יצירה:** 28 בספטמבר 2025  
**גרסה:** 1.0  
**סטטוס:** 📋 מסמך ארכיטקטורה  
**מטרה:** תיאור ארכיטקטורה מלאה למערכת ניהול שרת מתקדמת

---

## 📋 **תוכן עניינים**

1. [סקירה כללית](#סקירה-כללית)
2. [מטרות המערכת](#מטרות-המערכת)
3. [ארכיטקטורה כללית](#ארכיטקטורה-כללית)
4. [רכיבי המערכת](#רכיבי-המערכת)
5. [זרימת נתונים](#זרימת-נתונים)
6. [אינטגרציה עם מערכות קיימות](#אינטגרציה-עם-מערכות-קיימות)
7. [דרישות מערכת](#דרישות-מערכת)
8. [אבטחה ואמינות](#אבטחה-ואמינות)

---

## 🎯 **סקירה כללית**

### **מטרת המערכת:**
מערכת ניהול שרת מתקדמת ל-TikTrack המאפשרת ניהול מלא של שרת הפיתוח והפרודקשן עם פתרון מושלם לבעיות הטרמינל ב-Cursor IDE.

### **הבעיה הנפתרת:**
- **בעיית הטרמינל**: Cursor IDE משתמש ב-pseudo-terminal (`TERM=dumb`) שגורם לבעיות תקשורת
- **חוסר שליטה**: סקריפטי איתחול לא מחזירים שליטה למשתמש
- **חוסר ניהול**: אין מערכת ניהול מרכזית לשרת
- **חוסר ניטור**: אין מעקב אחר ביצועי השרת

### **הפתרון המוצע:**
מערכת ניהול שרת מתקדמת עם 5 רכיבים עיקריים:
1. **devctl.sh** - סקריפט ניהול שרתים
2. **LaunchAgent** - שירות מערכתי
3. **Web Dashboard** - ממשק ניהול
4. **API Endpoints** - נקודות API
5. **Cursor Tasks** - אינטגרציה עם IDE

---

## 🎯 **מטרות המערכת**

### **מטרות עיקריות:**
1. **פתרון בעיית הטרמינל** - החזרת שליטה מיידית ב-Cursor IDE
2. **ניהול מרכזי** - מערכת אחת לכל פעולות השרת
3. **ניטור מתקדם** - מעקב אחר ביצועים ובריאות
4. **אוטומציה מלאה** - איתחול אוטומטי וניהול תהליכים
5. **אמינות גבוהה** - מערכת יציבה שלא נשברת

### **מטרות משניות:**
1. **ביצועים משופרים** - מהירות גישה מקסימלית
2. **תחזוקה קלה** - קוד מאורגן וברור
3. **תיעוד מלא** - guidelines לצוות
4. **תאימות מלאה** - עובד עם כל המערכות הקיימות

---

## 🏗️ **ארכיטקטורה כללית**

### **דיאגרמת ארכיטקטורה:**
```
┌─────────────────────────────────────────────────────────────┐
│                    TikTrack Server Management System        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Cursor    │  │   macOS     │  │    Web      │         │
│  │    IDE      │  │  Terminal   │  │  Dashboard  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                 │                 │              │
│         ▼                 ▼                 ▼              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Cursor    │  │   devctl    │  │     API     │         │
│  │   Tasks     │  │    .sh      │  │  Endpoints  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │              Server Management Core                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  │  Process    │  │   Cache     │  │   Logging   │     │
│  │  │  Manager    │  │  Manager    │  │   System    │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │
│  └─────────────────────────────────────────────────────────┤
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────────┤
│  │              TikTrack Server                            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  │   Flask     │  │  Database   │  │  External   │     │
│  │  │   App       │  │   Layer     │  │   Data      │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### **שכבות המערכת:**

#### **שכבה 1: ממשק משתמש (User Interface)**
- **Cursor IDE Tasks** - אינטגרציה עם IDE
- **macOS Terminal** - טרמינל מקומי
- **Web Dashboard** - ממשק ניהול מתקדם

#### **שכבה 2: ממשק ניהול (Management Interface)**
- **Cursor Tasks** - פקודות IDE
- **devctl.sh** - סקריפט ניהול
- **API Endpoints** - נקודות API

#### **שכבה 3: ליבת ניהול (Management Core)**
- **Process Manager** - ניהול תהליכים
- **Cache Manager** - ניהול מטמון
- **Logging System** - מערכת לוגים

#### **שכבה 4: שרת TikTrack (TikTrack Server)**
- **Flask App** - אפליקציית Flask
- **Database Layer** - שכבת בסיס נתונים
- **External Data** - נתונים חיצוניים

---

## 🔧 **רכיבי המערכת**

### **1. devctl.sh - סקריפט ניהול שרתים**

#### **תפקיד:**
סקריפט מרכזי לניהול כל פעולות השרת עם תמיכה מלאה ב-pseudo-terminal של Cursor.

#### **תכונות עיקריות:**
- **ניהול תהליכים** - התחלה, עצירה, איתחול
- **ניהול מטמון** - ניקוי, אופטימיזציה
- **ניהול לוגים** - מעקב אחר לוגים
- **ניהול הגדרות** - הגדרות מערכת

#### **פונקציות נדרשות:**
```bash
# ניהול תהליכים
devctl start [service]     # התחלת שירות
devctl stop [service]      # עצירת שירות
devctl restart [service]   # איתחול שירות
devctl status [service]    # סטטוס שירות

# ניהול מטמון
devctl cache clear        # ניקוי מטמון
devctl cache optimize     # אופטימיזציה
devctl cache stats        # סטטיסטיקות

# ניהול לוגים
devctl logs [service]     # הצגת לוגים
devctl logs tail [service] # מעקב אחר לוגים
devctl logs clear [service] # ניקוי לוגים
```

#### **מיקום:**
`scripts/devctl.sh`

### **2. LaunchAgent - שירות מערכתי**

#### **תפקיד:**
שירות מערכתי של macOS המאפשר הפעלה אוטומטית וניהול מתקדם של השרת.

#### **תכונות עיקריות:**
- **הפעלה אוטומטית** - עם הפעלת המערכת
- **איתחול אוטומטי** - במקרה של קריסה
- **ניהול תהליכים** - ניהול מתקדם
- **ניטור בריאות** - מעקב אחר בריאות

#### **קבצי הגדרה:**
```xml
<!-- ~/Library/LaunchAgents/com.tiktrack.server.plist -->
<key>Label</key><string>com.tiktrack.server</string>
<key>ProgramArguments</key>
<array>
  <string>/bin/bash</string>
  <string>-lc</string>
  <string>cd /PATH/TO/TikTrack && source .venv/bin/activate && exec python3 Backend/dev_server.py</string>
</array>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>StandardOutPath</key><string>/PATH/TO/TikTrack/.logs/server.log</string>
<key>StandardErrorPath</key><string>/PATH/TO/TikTrack/.logs/server.log</string>
```

#### **מיקום:**
`~/Library/LaunchAgents/com.tiktrack.server.plist`

### **3. Web Dashboard - ממשק ניהול**

#### **תפקיד:**
ממשק ניהול מתקדם המאפשר ניהול מלא של השרת דרך הדפדפן.

#### **תכונות עיקריות:**
- **ניהול שרת** - התחלה, עצירה, איתחול
- **ניטור ביצועים** - מעקב אחר ביצועים
- **ניהול מטמון** - ניקוי ואופטימיזציה
- **ניהול לוגים** - הצגת לוגים

#### **דפים עיקריים:**
- **Dashboard** - סקירה כללית
- **Server Management** - ניהול שרת
- **Cache Management** - ניהול מטמון
- **Logs Viewer** - צפייה בלוגים
- **Settings** - הגדרות מערכת

#### **מיקום:**
`trading-ui/server-management.html`

### **4. API Endpoints - נקודות API**

#### **תפקיד:**
נקודות API לניהול השרת דרך HTTP requests.

#### **Endpoints עיקריים:**
```python
# ניהול שרת
POST /api/server/start          # התחלת שרת
POST /api/server/stop           # עצירת שרת
POST /api/server/restart        # איתחול שרת
GET  /api/server/status         # סטטוס שרת

# ניהול מטמון
POST /api/cache/clear           # ניקוי מטמון
POST /api/cache/optimize        # אופטימיזציה
GET  /api/cache/stats           # סטטיסטיקות

# ניהול לוגים
GET  /api/logs/server           # לוגי שרת
GET  /api/logs/tail             # מעקב אחר לוגים
POST /api/logs/clear            # ניקוי לוגים
```

#### **מיקום:**
`Backend/routes/api/server_management.py`

### **5. Cursor Tasks - אינטגרציה עם IDE**

#### **תפקיד:**
אינטגרציה עם Cursor IDE דרך Tasks system.

#### **תכונות עיקריות:**
- **פקודות מהירות** - התחלה, עצירה, איתחול
- **ניהול לוגים** - מעקב אחר לוגים
- **ניהול מטמון** - ניקוי ואופטימיזציה

#### **הגדרות Tasks:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Server: Start",
      "type": "shell",
      "command": "bash scripts/devctl.sh start"
    },
    {
      "label": "Server: Stop",
      "type": "shell",
      "command": "bash scripts/devctl.sh stop"
    },
    {
      "label": "Server: Restart",
      "type": "shell",
      "command": "bash scripts/devctl.sh restart"
    },
    {
      "label": "Cache: Clear",
      "type": "shell",
      "command": "bash scripts/devctl.sh cache clear"
    },
    {
      "label": "Logs: View",
      "type": "shell",
      "command": "bash scripts/devctl.sh logs tail",
      "isBackground": true
    }
  ]
}
```

#### **מיקום:**
`.vscode/tasks.json`

---

## 🔄 **זרימת נתונים**

### **תהליך התחלת שרת:**
```
1. User Request (Cursor/Web/Terminal)
   ↓
2. devctl.sh / API Endpoint
   ↓
3. Process Manager
   ↓
4. Server Startup (setsid + nohup)
   ↓
5. Health Check
   ↓
6. Status Update
   ↓
7. Response to User
```

### **תהליך ניהול מטמון:**
```
1. Cache Request (Clear/Optimize/Stats)
   ↓
2. Cache Manager
   ↓
3. Unified Cache System
   ↓
4. Backend Cache Service
   ↓
5. Cache Operations
   ↓
6. Status Update
   ↓
7. Response to User
```

### **תהליך ניהול לוגים:**
```
1. Log Request (View/Tail/Clear)
   ↓
2. Logging System
   ↓
3. Log Files (.logs/*.log)
   ↓
4. Log Processing
   ↓
5. Response to User
```

---

## 🔗 **אינטגרציה עם מערכות קיימות**

### **1. מערכת המטמון המאוחדת**
- **אינטגרציה מלאה** עם UnifiedCacheManager
- **תמיכה ב-4 שכבות** מטמון
- **סינכרון אוטומטי** בין שכבות

### **2. מערכת האיתחול הקיימת**
- **שיפור** של restart script הקיים
- **תמיכה** בכל מצבי cache
- **תאימות מלאה** עם המערכת הקיימת

### **3. מערכת הלוגים המתקדמת**
- **אינטגרציה** עם מערכת הלוגים הקיימת
- **תמיכה** ב-Correlation ID
- **ניהול** לוגים נפרדים

### **4. מערכת הניטור**
- **אינטגרציה** עם Metrics Collection
- **תמיכה** ב-Health Checks
- **ניהול** Background Tasks

---

## 📋 **דרישות מערכת**

### **דרישות חומרה:**
- **מעבד**: Intel/Apple Silicon
- **זיכרון**: 8GB RAM (מומלץ 16GB)
- **אחסון**: 2GB פנוי
- **רשת**: חיבור לאינטרנט

### **דרישות תוכנה:**
- **מערכת הפעלה**: macOS 10.15+
- **Python**: 3.9+
- **Node.js**: 14+
- **SQLite**: 3
- **Cursor IDE**: 0.40+

### **דרישות סביבה:**
- **Bash**: 4.0+
- **launchctl**: macOS built-in
- **osascript**: macOS built-in
- **curl**: built-in

---

## 🔒 **אבטחה ואמינות**

### **אבטחה:**
- **הרשאות מוגבלות** - רק למשתמש הנוכחי
- **אימות מקומי** - ללא גישה חיצונית
- **הצפנת לוגים** - לוגים מוצפנים
- **הגנה מפני SQL Injection** - בדיקות קלט

### **אמינות:**
- **איתחול אוטומטי** - במקרה של קריסה
- **גיבוי אוטומטי** - גיבוי הגדרות
- **ניטור בריאות** - מעקב אחר בריאות
- **שחזור מהיר** - שחזור ממצבי שגיאה

### **ביצועים:**
- **זמן תגובה**: < 100ms
- **זמן איתחול**: < 30 שניות
- **זמן ניקוי מטמון**: < 5 שניות
- **זמן טעינת לוגים**: < 2 שניות

---

## 📊 **מדדי הצלחה**

### **מדדי ביצועים:**
- **זמן תגובה**: < 100ms
- **זמן איתחול**: < 30 שניות
- **זמן ניקוי מטמון**: < 5 שניות
- **זמן טעינת לוגים**: < 2 שניות

### **מדדי אמינות:**
- **זמן פעילות**: 99.9%
- **זמן שחזור**: < 1 דקה
- **זמן איתחול אוטומטי**: < 30 שניות
- **זמן גיבוי**: < 10 שניות

### **מדדי שימוש:**
- **זמן למידה**: < 5 דקות
- **זמן ביצוע פעולה**: < 10 שניות
- **זמן פתרון בעיה**: < 2 דקות
- **זמן תחזוקה**: < 30 דקות/שבוע

---

## 🚀 **תוכנית פיתוח**

### **שלב 1: ליבת המערכת (שבוע 1-2)**
- פיתוח devctl.sh
- פיתוח Process Manager
- פיתוח Cache Manager
- פיתוח Logging System

### **שלב 2: ממשקי משתמש (שבוע 3-4)**
- פיתוח Web Dashboard
- פיתוח API Endpoints
- פיתוח Cursor Tasks
- פיתוח LaunchAgent

### **שלב 3: אינטגרציה (שבוע 5-6)**
- אינטגרציה עם מערכת המטמון
- אינטגרציה עם מערכת האיתחול
- אינטגרציה עם מערכת הלוגים
- אינטגרציה עם מערכת הניטור

### **שלב 4: בדיקות ואופטימיזציה (שבוע 7-8)**
- בדיקות יחידה
- בדיקות אינטגרציה
- בדיקות ביצועים
- אופטימיזציה

---

## 📚 **תיעוד נוסף**

### **מסמכים קשורים:**
- [TikTrack Server Management Implementation Guide](TikTrack_Server_Management_Implementation_Guide.md)
- [TikTrack Server Management API Reference](TikTrack_Server_Management_API_Reference.md)
- [TikTrack Server Management User Guide](TikTrack_Server_Management_User_Guide.md)
- [TikTrack Server Management Troubleshooting](TikTrack_Server_Management_Troubleshooting.md)
- [TikTrack Server Management Deployment Guide](TikTrack_Server_Management_Deployment_Guide.md)

### **מסמכים קיימים:**
- [RESTART_SCRIPT_GUIDE.md](RESTART_SCRIPT_GUIDE.md)
- [CACHE_IMPLEMENTATION_GUIDE.md](../frontend/CACHE_IMPLEMENTATION_GUIDE.md)
- [ADVANCED_CACHE_SYSTEM_GUIDE.md](../development/ADVANCED_CACHE_SYSTEM_GUIDE.md)

---

**תאריך עדכון אחרון:** 28 בספטמבר 2025  
**גרסה:** 1.0  
**מפתח:** TikTrack Development Team









