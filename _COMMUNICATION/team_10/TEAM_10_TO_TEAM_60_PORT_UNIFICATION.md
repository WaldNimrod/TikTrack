# 🔒 הודעה: נעילת פורטים - Port Unification

**מאת:** Team 10 (The Gateway)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-04  
**סטטוס:** 🔴 **CRITICAL - P0**  
**מקור:** פקודת האדריכל המאוחדת

---

## 📢 Executive Summary

לפי פקודת האדריכל המאוחדת, יש לנעול את הפורטים למקור אמת יחיד:
- **Frontend (Vite):** Port 8080
- **Backend (FastAPI):** Port 8082
- **CORS:** יש לעדכן את המותרים ב-FastAPI ל-8080 בלבד

---

## ✅ מצב נוכחי - מאומת

### **Frontend (Vite):**
- ✅ `vite.config.js` - מוגדר ל-Port 8080 ✅ נכון
- ✅ `vite.config.js` - Proxy ל-`http://localhost:8082` ✅ נכון

### **Backend (FastAPI):**
- ⚠️ צריך לבדוק את הפורט הנוכחי
- ⚠️ צריך לבדוק את הגדרות CORS

---

## 📋 משימות

### **1. וידוא FastAPI על פורט 8082** 🔴 **CRITICAL**

**פעולות:**
1. לבדוק את קובץ הקונפיגורציה של FastAPI
2. לוודא שהפורט מוגדר ל-8082
3. אם לא - לעדכן ל-8082

**קבצים לבדיקה:**
- קובץ הקונפיגורציה הראשי של FastAPI
- קובצי Environment (.env)
- קובצי Docker (אם יש)

---

### **2. עדכון CORS ב-FastAPI** 🔴 **CRITICAL**

**דרישה:** לאפשר רק `http://localhost:8080` (Frontend)

**פעולות:**
1. לבדוק את הגדרות CORS הנוכחיות
2. לעדכן לאפשר רק `http://localhost:8080`
3. להסיר כל origins אחרים

**דוגמה:**
```python
# לפני
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8080", "http://localhost:8082"]

# אחרי
CORS_ORIGINS = ["http://localhost:8080"]  # רק Frontend
```

---

### **3. עדכון `ui/infrastructure/README.md`** 🟡 **MEDIUM**

**בעיה:** הקובץ מציין Frontend 3000 / Backend 8080 (לא מעודכן)

**פעולות:**
1. לעדכן את הקובץ ל-Frontend 8080 / Backend 8082
2. להסיר כל אזכורים ל-3000

---

## 🔍 בדיקות נדרשות

### **לאחר התיקונים:**

- [ ] FastAPI רץ על פורט 8082
- [ ] CORS מאפשר רק `http://localhost:8080`
- [ ] Frontend יכול להתחבר ל-Backend דרך proxy
- [ ] אין שגיאות CORS בקונסול

---

## 📚 מסמכים קשורים

- `ARCHITECT_PORT_LOCK.md` - פקודת נעילת פורטים
- `TEAM_10_EXTERNAL_AUDIT_FINAL_REPORT.md` - דוח ביקורת חיצונית (סעיף 1)

---

## ⏱️ זמן משוער

**1-2 שעות**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🔴 **CRITICAL - P0**

**log_entry | [Team 10] | PORT_UNIFICATION | TO_TEAM_60 | RED | 2026-02-04**
