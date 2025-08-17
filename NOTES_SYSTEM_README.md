# מערכת הערות - TikTrack
# Notes System Documentation

## 📋 סקירה כללית

מערכת ההערות מאפשרת למשתמשים ליצור, לערוך ולנהל הערות הקשורות לחשבונות, טריידים ותוכניות טרייד. המערכת כוללת תמיכה בקבצים מצורפים ועורך טקסט עשיר.

## ✅ תכונות שהושלמו

### 1. דף הערות מלא
- **קובץ**: `trading-ui/notes.html`
- **תכונות**:
  - טבלת הערות עם מיון ופילטרים
  - מודלים להוספה ועריכה
  - עורך טקסט עשיר עם כפתורי עיצוב
  - תצוגת קבצים מצורפים
  - שילוב בתפריט הניווט הראשי

### 2. מערכת קבצים
- **תכונות**:
  - העלאת קבצים (PDF, תמונות, מסמכים)
  - שמירה מאובטחת בשרת
  - מחיקה אוטומטית של קבצים יתומים
  - תצוגת קישורים לקבצים
  - הגבלת גודל קובץ (512KB)

### 3. מבנה בסיס נתונים משופר
- **שינוי מ**: `account_id`, `trade_id`, `trade_plan_id`
- **שינוי ל**: `related_type_id`, `related_id`
- **יתרונות**:
  - גמישות רבה יותר
  - תמיכה בסוגי קשרים עתידיים
  - נורמליזציה טובה יותר

### 4. API מלא
- **Endpoints**:
  - `GET /api/v1/notes/` - קבלת כל ההערות
  - `POST /api/v1/notes/` - יצירת הערה חדשה
  - `PUT /api/v1/notes/<id>` - עדכון הערה
  - `DELETE /api/v1/notes/<id>` - מחיקת הערה
  - `GET /api/v1/notes/files/<filename>` - קבלת קובץ
  - `DELETE /api/v1/notes/files/<filename>` - מחיקת קובץ

## 🗄️ מבנה בסיס הנתונים

### טבלת סוגי קשרים
```sql
CREATE TABLE note_relation_types (
    id INTEGER PRIMARY KEY,
    note_relation_type VARCHAR(20) NOT NULL UNIQUE
);

-- נתונים ראשוניים
INSERT INTO note_relation_types (id, note_relation_type) VALUES 
    (1, 'account'),
    (2, 'trade'),
    (3, 'trade_plan');
```

### טבלת הערות
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    attachment VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    related_type_id INTEGER REFERENCES note_relation_types(id),
    related_id INTEGER
);
```

## 📁 קבצים עיקריים

### Frontend
- `trading-ui/notes.html` - דף ההערות הראשי
- `trading-ui/scripts/notes.js` - לוגיקת JavaScript
- `trading-ui/scripts/app-header.js` - תפריט ניווט (הוספת "הערות")

### Backend
- `Backend/routes/api/notes.py` - API endpoints
- `Backend/models/note.py` - מודל SQLAlchemy
- `Backend/models/note_relation_type.py` - מודל סוגי קשרים
- `Backend/models/__init__.py` - ייבוא המודלים

### קבצי פיתוח
- `Backend/dev_server.py` - שרת פיתוח עם auto-reload
- `Backend/migrations_manager.py` - מערכת migrations
- `start_dev.sh` - סקריפט הפעלה

## 🔧 שימוש במערכת

### הפעלת השרת
```bash
# הפעלה עם auto-reload (מומלץ לפיתוח)
./start_dev.sh

# או הפעלה ישירה
cd Backend && python3 dev_server.py
```

### ניהול בסיס הנתונים
```bash
# הצגת סטטוס migrations
python3 migrations_manager.py status

# החלת migrations
python3 migrations_manager.py migrate
```

### גישה למערכת
- **URL**: `http://localhost:8080/notes`
- **תפריט**: הגדרות → הערות

## 🎯 תכונות עיקריות

### 1. יצירת הערה
- בחירת סוג קשר (חשבון/טרייד/תוכנית טרייד)
- עורך טקסט עשיר עם כפתורי עיצוב
- העלאת קובץ מצורף (אופציונלי)
- שמירה אוטומטית

### 2. עריכת הערה
- עריכה של תוכן קיים
- החלפת קובץ מצורף
- שינוי סוג הקשר
- שמירת שינויים

### 3. מחיקת הערה
- מחיקת הערה וקובץ מצורף
- אישור מחיקה
- רענון אוטומטי של הטבלה

### 4. תצוגת קבצים
- קישורים לקבצים מצורפים
- פתיחה בחלון חדש
- תצוגת שם קובץ מקוצר

## 🚧 בעיות ידועות

### 1. תצוגת אייקונים לקבצים
- **סטטוס**: לא נפתר
- **תיאור**: עדיין מוצג "📎 צפה בקובץ" במקום אייקון לפי סוג הקובץ
- **פתרון עתידי**: יש להשלים את הפונקציה `createFileLink` עם אייקונים מתאימים

### 2. שגיאות התראות
- **סטטוס**: ידוע
- **תיאור**: שגיאות 500 ב-`/api/v1/alerts/`
- **השפעה**: מוצגות התראות דמו במקום נתונים אמיתיים

## 🔮 תכונות עתידיות

### 1. שיפורי UI
- אייקונים לקבצים לפי סוג
- תצוגה מקדימה של תמונות
- מיון מתקדם בטבלה

### 2. שיפורי פונקציונליות
- תגיות להערות
- חיפוש מתקדם
- ייצוא הערות
- התראות על הערות חדשות

### 3. שיפורי ביצועים
- טעינה הדרגתית של הערות
- קאשינג של קבצים
- דחיסת תמונות אוטומטית

## 📊 סטטיסטיקות

### נתונים נוכחיים
- **הערות**: 10 הערות במערכת
- **קבצים מצורפים**: 2 קבצי PDF
- **סוגי קשרים**: חשבונות, טריידים, תוכניות טרייד

### ביצועים
- **זמן טעינה**: <2 שניות
- **גודל קובץ מקסימלי**: 512KB
- **סוגי קבצים נתמכים**: PDF, תמונות, מסמכים

## 🤝 תרומה לפיתוח

### הוספת תכונות חדשות
1. צור branch חדש
2. הוסף את התכונה
3. בדוק עם `./start_dev.sh`
4. צור Pull Request

### דיווח באגים
1. בדוק את הקונסול בדפדפן
2. בדוק את הלוגים ב-`server_detailed.log`
3. צור Issue עם פרטים מלאים

---

**מערכת ההערות מוכנה לשימוש יומיומי! 🚀**
