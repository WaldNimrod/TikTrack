# TikTrack Server Setup Guide
# מדריך הפעלת שרת TikTrack

## 🚀 **ארכיטקטורת השרת**

הפרויקט כולל שני שרתים:

### **1. שרת ישן (Legacy) - `app.py`**
- **מיקום:** `Backend/app.py`
- **הפעלה:** `python3 run_waitress.py` או `./start_server.sh`
- **פורט:** 8080
- **מצב:** פעיל ויציב
- **שימוש:** שרת הייצור הנוכחי

### **2. שרת חדש (New Architecture) - `app_new.py`**
- **מיקום:** `Backend/app_new.py`
- **הפעלה:** `python3 app_new.py`
- **פורט:** 8080
- **מצב:** בפיתוח, עדיין לא יציב
- **שימוש:** ארכיטקטורה חדשה עם RBAC, Swagger, וכו'

## 🔧 **הפעלת שרת ייצור (מומלץ)**

### **שיטה 1: הפעלה ישירה**
```bash
cd Backend
python3 run_waitress.py
```

### **שיטה 2: הפעלה עם מנטור (מומלץ)**
```bash
# מהתיקייה הראשית
./start_server.sh

# או ישירות
cd Backend
caffeinate -dims python3 monitor_server.py
```

### **שיטה 3: הפעלה עם Flask development server**
```bash
cd Backend
python3 app.py
```

## 🆕 **הפעלת שרת חדש (לפיתוח)**

```bash
cd Backend
python3 app_new.py
```

**⚠️ אזהרה:** השרת החדש עדיין לא יציב ועלול ליפול עם segmentation fault.

## 📊 **הבדלים בין השרתים**

| תכונה | שרת ישן (`app.py`) | שרת חדש (`app_new.py`) |
|-------|-------------------|----------------------|
| **יציבות** | ✅ יציב מאוד | ⚠️ לא יציב |
| **אימות** | ❌ ללא אימות | ✅ JWT + RBAC |
| **תיעוד API** | ❌ ללא | ✅ Swagger UI |
| **מודולריות** | ❌ קובץ אחד גדול | ✅ Blueprints |
| **בדיקות** | ❌ ללא | ✅ Pytest |
| **Docker** | ❌ ללא | ✅ Dockerfile |

## 🔍 **בדיקת זמינות שרת**

### **בדיקה מהירה**
```bash
python3 Backend/quick_server_check.py
```

### **בדיקה מפורטת**
```bash
python3 Backend/server_health_check.py
```

### **בדיקה ידנית**
```bash
curl http://localhost:8080/api/health
```

## 🛠️ **פתרון בעיות**

### **בעיה: שרת לא עולה**
```bash
# בדיקה אם יש תהליכים כפולים
lsof -i :8080
kill -9 <PID>

# הפעלה מחדש
./start_server.sh
```

### **בעיה: שרת נופל**
```bash
# בדיקת לוגים
tail -f Backend/server_detailed.log

# הפעלה עם מנטור
./start_server.sh
```

### **בעיה: בסיס נתונים**
```bash
# בדיקת קובץ DB
ls -la Backend/db/

# יצירת DB חדש
cd Backend
python3 create_initial_data.py
```

## 📝 **הערות חשובות**

### **למפתחים עתידיים:**

1. **השתמשו בשרת הישן לייצור** - הוא יציב ובדוק
2. **השרת החדש בפיתוח** - יש לו בעיות יציבות
3. **תמיד בדקו זמינות** לפני שינויים
4. **שמרו על גיבויים** של בסיס הנתונים
5. **עקבו אחרי לוגים** לזיהוי בעיות

### **סדר עדיפויות לפיתוח:**

1. ✅ **תיקון יציבות השרת החדש**
2. ✅ **השלמת מערכת RBAC**
3. ✅ **הוספת בדיקות אוטומטיות**
4. ✅ **שיפור תיעוד API**
5. ✅ **העברת ייצור לשרת החדש**

### **קבצים חשובים:**

- `Backend/app.py` - שרת ייצור
- `Backend/app_new.py` - שרת חדש (בפיתוח)
- `Backend/run_waitress.py` - הפעלת שרת יציב
- `Backend/monitor_server.py` - מנטור אוטומטי
- `start_server.sh` - סקריפט הפעלה ראשי

---

**תאריך עדכון:** 2025-08-14  
**גרסה:** 1.0  
**סטטוס:** פעיל ותחזוקתי

