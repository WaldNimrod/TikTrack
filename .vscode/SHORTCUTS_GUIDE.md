# TikTrack Keyboard Shortcuts Guide
# מדריך קיצורי מקלדת TikTrack

## ⌨️ קיצורי המקלדת הזמינים

### 🚀 **ניהול שרת (Server Management)**

| קיצור | פעולה | תיאור |
|-------|-------|-------|
| `Cmd+Shift+R` | **Restart Server** | איתחול מהיר של השרת |
| `Cmd+Shift+B` | **Build/Start Server** | הפעלת השרת (ברירת מחדל) |

---

### 🧹 **ניהול מטמון (Cache Management)**

| קיצור | פעולה | תיאור |
|-------|-------|-------|
| `Cmd+Shift+K` | **Clear Cache (Quick)** | ניקוי מטמון שרת מהיר |
| `Cmd+Shift+Alt+K` | **Clear Cache (Full)** | ניקוי מטמון מלא + קבצים מקומיים |

---

### 🏥 **בריאות מערכת (System Health)**

| קיצור | פעולה | תיאור |
|-------|-------|-------|
| `Cmd+Shift+H` | **System Health** | בדיקת בריאות מערכת מהירה |

---

### 📝 **לוגים (Logs)**

| קיצור | פעולה | תיאור |
|-------|-------|-------|
| `Cmd+Shift+L` | **View Server Logs** | צפייה בלוגים של השרת (חי) |
| `Cmd+Shift+E` | **View Error Logs** | צפייה בלוגי שגיאות (חי) |

---

## 🎯 **שימוש יומיומי מומלץ**

### **התחלת יום עבודה:**
```
1. Cmd+Shift+B          → הפעלת שרת
2. Cmd+Shift+H          → בדיקת בריאות
3. Cmd+Shift+L          → פתיחת לוגים (אופציונלי)
```

### **אחרי שינויים בקוד Python:**
```
Cmd+Shift+R             → איתחול שרת מהיר
```

### **אחרי שינויים בנתוני DB:**
```
Cmd+Shift+K             → ניקוי מטמון מהיר
```

### **בעיות ביצועים:**
```
1. Cmd+Shift+Alt+K      → ניקוי מטמון מלא
2. Cmd+Shift+R          → איתחול שרת
```

### **דיבאג של שגיאות:**
```
Cmd+Shift+E             → צפייה בשגיאות בזמן אמת
```

---

## 🔧 **דרכים נוספות להרצת משימות**

### **1. Command Palette (כל המשימות)**
```
Cmd+Shift+P → הקלד "task" → בחר משימה
```
**💡 טיפ:** הקלד "TT" כדי לסנן רק משימות TikTrack

### **2. Terminal Menu**
```
פתח Terminal → לחץ על ▼ ליד + → "Run Task..."
```

### **3. Quick Open**
```
Cmd+P → הקלד "task " (עם רווח) → בחר משימה
```

---

## 📋 **רשימת משימות מלאה**

### **🚀 Server Management (5 משימות)**
- TT: Start Server
- TT: Start Server (Dev Mode)
- TT: Start Server (No Cache)
- TT: Stop Server
- TT: Restart Server ⌨️ `Cmd+Shift+R`

### **🧹 Cache Management (3 משימות)**
- TT: Clear Cache ⌨️ `Cmd+Shift+K`
- TT: Clear Cache Full ⌨️ `Cmd+Shift+Alt+K`
- TT: Cache Status

### **🏥 System Health (2 משימות)**
- TT: System Health ⌨️ `Cmd+Shift+H`
- TT: Server Status

### **📝 Logs (2 משימות)**
- TT: View Server Logs ⌨️ `Cmd+Shift+L`
- TT: View Error Logs ⌨️ `Cmd+Shift+E`

### **🗄️ Database (2 משימות)**
- TT: Database Backup
- TT: Database Status

### **🔧 Dashboards (2 משימות)**
- TT: Open Server Monitor
- TT: Open System Management

### **⚡ Quick Actions (2 משימות)**
- TT: Quick Start + Monitor
- TT: Full System Check

---

## 🎨 **התאמה אישית**

רוצה לשנות קיצור? ערוך את הקובץ:
```
.vscode/keybindings.json
```

**דוגמה:**
```json
{
    "key": "cmd+shift+r",              // הקיצור הרצוי
    "command": "workbench.action.tasks.runTask",
    "args": "TT: Restart Server",      // שם המשימה
    "when": "!inDebugMode"             // תנאי (אופציונלי)
}
```

---

## 🚨 **פתרון בעיות**

### **קיצור לא עובד?**
1. רענן את Cursor: `Cmd+R`
2. בדוק התנגשויות: `Cmd+K Cmd+S` (Keyboard Shortcuts)
3. חפש את הקיצור ובדוק אם יש כפילות

### **משימה לא מופיעה ב-Command Palette?**
1. רענן את Cursor: `Cmd+R`
2. בדוק שהקובץ `.vscode/tasks.json` תקין
3. הקלד "Tasks: Run Task" במלואו

### **משימה גונבת פוקוס?**
כל המשימות מוגדרות עם `"focus": false` - לא אמורות לגנוב פוקוס.
אם זה קורה, תיקנו את זה בגרסה האחרונה!

---

## 📚 **קישורים נוספים**

- [מדריך Cursor Tasks המלא](../documentation/server/CURSOR_TASKS_GUIDE.md)
- [מדריך ניהול שרת](../documentation/server/README.md)
- [קובץ המשימות](.vscode/tasks.json)
- [קובץ הקיצורים](.vscode/keybindings.json)

---

**Last Updated:** 1 באוקטובר 2025  
**Version:** 1.0  
**Created by:** TikTrack Development Team

**💡 טיפ:** הדפס את המדריך הזה או שמור אותו בסימניות לגישה מהירה!

