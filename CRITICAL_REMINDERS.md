# 🎯 CRITICAL REMINDERS - TikTrack Project
# זיכרון קבוע - נקודות קריטיות לכל צט חדש

## ⚡ תהליך העבודה הנכון - תמיד להתחיל כאן:

### 1. הפעלת השרת
```bash
cd Backend && ./run_monitored.sh
```

### 2. בדיקת בריאות
```bash
curl http://localhost:8080/api/health
```

### 3. בנייה לפי ארכיטקטורה
**תמיד לבנות בסדר הזה:**
1. **Models** - מבנה הנתונים
2. **Services** - לוגיקה עסקית
3. **Routes** - API endpoints (blueprints)
4. **App** - רישום blueprints

### 4. בדיקת כל API
```bash
# GET - קבלת נתונים
curl http://localhost:8080/api/v1/accounts/

# POST - יצירת נתונים
curl -X POST http://localhost:8080/api/v1/accounts/ -H "Content-Type: application/json" -d '{"name":"חשבון בדיקה","currency":"USD","status":"active"}'

# PUT - עדכון נתונים
curl -X PUT http://localhost:8080/api/v1/accounts/1 -H "Content-Type: application/json" -d '{"name":"חשבון מעודכן"}'

# DELETE - מחיקת נתונים
curl -X DELETE http://localhost:8080/api/v1/accounts/1
```

### 5. הפרדה נכונה
**אל תכתוב routes ישירות ב-app.py - השתמש רק ב-blueprints!**

---

## 🔒 זיכרון קבוע - זה עובד מושלם:

- ✅ **הארכיטקטורה החדשה עובדת מושלם**
- ✅ **השרת יציב עם המנטור האוטומטי**
- ✅ **כל CRUD operations עובדים**
- ✅ **הפורט הוא 8080 בלבד**
- ✅ **תמיד להשתמש ב-./run_monitored.sh**

---

## 🚨 אזהרות חשובות:

### אל תעשה:
- ❌ **אל תכתוב routes ישירות ב-app.py** - השתמש רק ב-blueprints!
- ❌ **אל תשנה את הפורט** - תמיד 8080
- ❌ **אל תפעיל ללא מנטור** - תמיד ./run_monitored.sh
- ❌ **אל תערבב ארכיטקטורות** - השתמש רק בחדשה

### תמיד תעשה:
- ✅ **תמיד התחל עם ./run_monitored.sh**
- ✅ **תמיד בדוק בריאות עם curl**
- ✅ **תמיד בנה לפי Models → Services → Routes → App**
- ✅ **תמיד בדוק כל CRUD operation**

---

## 📋 בדיקות מהירות:

```bash
# 1. הפעלת השרת
cd Backend && ./run_monitored.sh

# 2. בדיקת בריאות
curl http://localhost:8080/api/health

# 3. בדיקת API חדש
curl http://localhost:8080/api/v1/accounts/

# 4. בדיקת CRUD מלא
curl -X POST http://localhost:8080/api/v1/accounts/ -H "Content-Type: application/json" -d '{"name":"חשבון בדיקה","currency":"USD","status":"active"}'
```

---

## 🏗️ מבנה הקבצים הנכון:

```
Backend/
├── app.py                          # אפליקציה ראשית עם רישום blueprints
├── routes/api/
│   └── accounts.py                 # API endpoints (blueprints)
├── services/
│   └── account_service.py          # לוגיקה עסקית
├── models/
│   └── account.py                  # מבנה נתונים
└── config/
    └── database.py                 # הגדרות בסיס נתונים
```

---

## 🔄 API Endpoints חדשים:

- `GET /api/v1/accounts/` - קבלת כל החשבונות
- `GET /api/v1/accounts/<id>` - קבלת חשבון ספציפי
- `POST /api/v1/accounts/` - יצירת חשבון חדש
- `PUT /api/v1/accounts/<id>` - עדכון חשבון
- `DELETE /api/v1/accounts/<id>` - מחיקת חשבון
- `GET /api/v1/accounts/<id>/stats` - סטטיסטיקות חשבון

---

## 📚 קבצי תיעוד חשובים:

- `Backend/README_SERVER_STABILITY.md` - מדריך יציבות השרת
- `documentation/backend_architecture_new.html` - ארכיטקטורה מפורטת
- `CRITICAL_REMINDERS.md` - קובץ זה

---

## 🎯 סיכום:

**זה יישאר זמין לכל הפרויקטים הבאים! 🎯**

1. **תמיד התחל עם ./run_monitored.sh**
2. **תמיד בדוק בריאות**
3. **תמיד בנה לפי הארכיטקטורה**
4. **תמיד בדוק כל CRUD operation**
5. **אל תכתוב routes ב-app.py**

**הארכיטקטורה החדשה עובדת מושלם - אל תשנה אותה!**
