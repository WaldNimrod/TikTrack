# מסמך אפיון - מערכת ניהול טיקרים (Tickers)

## תאריך יצירה
04.12.2025

## סטטוס
🔄 בתהליך תיקון - נדרש תיקון תהליך CREATE

---

## 1. סקירה כללית

מערכת הטיקרים ב-TikTrack מבוססת על מודל **Many-to-Many** בין משתמשים לטיקרים:
- **טבלת `tickers`** - טבלה משותפת לכל המשתמשים (אין `user_id`)
- **טבלת `user_tickers`** - טבלת שיוך בין משתמשים לטיקרים עם שדות מותאמים אישית

### עקרונות עיצוב
1. **טיקרים משותפים** - כל הטיקרים במערכת משותפים לכל המשתמשים
2. **התאמה אישית** - כל משתמש יכול להתאים שם וסוג לטיקר ברשימה שלו
3. **בידוד משתמשים** - כל משתמש רואה רק את הטיקרים שהוא הוסיף לרשימה שלו

---

## 2. מבנה נתונים

### 2.1 טבלת `tickers`

```sql
CREATE TABLE tickers (
    id INTEGER PRIMARY KEY,
    symbol VARCHAR(10) UNIQUE NOT NULL,  -- סמל טיקר (יחיד במערכת)
    name VARCHAR(100) NOT NULL,          -- שם החברה/נכס
    type VARCHAR(20) NOT NULL,           -- סוג: stock, etf, crypto, etc.
    currency_id INTEGER NOT NULL,         -- מטבע (FK ל-currencies)
    remarks VARCHAR(500),                -- הערות
    status VARCHAR(20) DEFAULT 'open',   -- סטטוס: open, closed, cancelled
    active_trades BOOLEAN,               -- האם יש טריידים פעילים
    created_at TIMESTAMP,                -- תאריך יצירה
    updated_at TIMESTAMP                 -- תאריך עדכון (למערכת מחירים עתידית)
);
```

**מאפיינים:**
- אין `user_id` - טבלה משותפת
- `symbol` חייב להיות יחיד במערכת
- `status` מתעדכן אוטומטית לפי טריידים ותכניות מסחר

### 2.2 טבלת `user_tickers`

```sql
CREATE TABLE user_tickers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,            -- משתמש (FK ל-users)
    ticker_id INTEGER NOT NULL,          -- טיקר (FK ל-tickers)
    name_custom VARCHAR(100),            -- שם מותאם אישית למשתמש
    type_custom VARCHAR(20),             -- סוג מותאם אישית למשתמש
    status VARCHAR(20) DEFAULT 'open',   -- סטטוס השיוך: open, closed, cancelled
    created_at TIMESTAMP NOT NULL,       -- תאריך הוספה לרשימה
    updated_at TIMESTAMP,                -- תאריך עדכון אחרון
    UNIQUE(user_id, ticker_id)           -- משתמש לא יכול להוסיף אותו טיקר פעמיים
);
```

**מאפיינים:**
- `name_custom` ו-`type_custom` - שדות אופציונליים להתאמה אישית
- `status` - סטטוס השיוך (לא של הטיקר עצמו)
- `created_at` - **חייב להיות מוגדר מפורש** (לא עובד עם server_default)

---

## 3. תהליכים עסקיים

### 3.1 יצירת טיקר חדש + שיוך למשתמש

**תרחיש:** משתמש מוסיף טיקר חדש שלא קיים במערכת

**תהליך:**
1. בדיקה אם הטיקר כבר קיים במערכת (לפי `symbol`)
2. אם לא קיים:
   - יצירת רשומת `Ticker` חדשה
   - יצירת רשומת `UserTicker` עם שיוך למשתמש
   - הגדרת `created_at` מפורש ב-`UserTicker`
3. אם קיים:
   - בדיקה אם המשתמש כבר קשור לטיקר זה
   - אם לא קשור - יצירת `UserTicker` בלבד
   - אם כבר קשור - החזרת שגיאה

**קוד נוכחי:**
```python
# Backend/routes/api/tickers.py - create_ticker()
if existing_ticker:
    # שיוך בלבד
    user_ticker = UserTicker(...)
    db.add(user_ticker)
    db.flush()
else:
    # יצירת טיקר + שיוך
    ticker = TickerService.create(db, data)
    user_ticker = UserTicker(...)
    db.add(user_ticker)
    db.flush()
```

### 3.2 שיוך טיקר קיים למשתמש

**תרחיש:** משתמש מוסיף טיקר שכבר קיים במערכת

**תהליך:**
1. חיפוש טיקר לפי `symbol`
2. בדיקה אם המשתמש כבר קשור לטיקר
3. אם לא קשור - יצירת `UserTicker` בלבד
4. אם כבר קשור - החזרת שגיאה

### 3.3 עדכון סטטוס טיקר

**לוגיקה:**
- **טבלת `tickers`** - סטטוס כללי של הטיקר במערכת
  - `open` - יש טריידים/תכניות פעילות
  - `closed` - אין טריידים/תכניות פעילות
  - `cancelled` - בוטל ידנית (לא מתעדכן אוטומטית)

- **טבלת `user_tickers`** - סטטוס השיוך למשתמש ספציפי
  - `open` - יש טריידים/תכניות פעילות למשתמש זה
  - `closed` - אין טריידים/תכניות פעילות למשתמש זה
  - `cancelled` - המשתמש ביטל ידנית (לא מתעדכן אוטומטית)

**פונקציות עדכון:**
- `TickerService.update_ticker_status_auto()` - מעדכן סטטוס טיקר כללי
- `TickerService.update_user_ticker_status()` - מעדכן סטטוס שיוך למשתמש

---

## 4. בעיות זוהו ותיקונים נדרשים

### 4.1 בעיה: `created_at` ב-`UserTicker` לא מוגדר

**תיאור:**
- `UserTicker` מגדיר `created_at` עם `server_default=func.now()`
- ב-PostgreSQL, `server_default` לא עובד כשיש הגדרה חוזרת מ-`BaseModel`
- שגיאה: `null value in column "created_at" of relation "user_tickers" violates not-null constraint`

**תיקון נוכחי:**
```python
from datetime import datetime, timezone
user_ticker = UserTicker(
    ...
    created_at=datetime.now(timezone.utc)  # הגדרה מפורשת
)
```

**סטטוס:** ✅ תוקן בקוד (אבל עדיין נכשל בבדיקות)

### 4.2 בעיה: כפילות commit

**תיאור:**
- `TickerService.create()` מבצע `db.commit()` פנימי
- `create_ticker()` API endpoint משתמש ב-`@handle_database_session(auto_commit=True)`
- נוצר כפילות commit שעלולה לגרום לבעיות

**תיקון נוכחי:**
```python
# שימוש ב-flush במקום commit
db.add(user_ticker)
db.flush()  # בודק שגיאות אבל לא מבצע commit
# הדקורטור יבצע commit בסוף
```

**סטטוס:** ✅ תוקן בקוד

### 4.3 בעיה: טיפול בשגיאות

**תיאור:**
- אם יצירת `UserTicker` נכשלת אחרי יצירת `Ticker`, הטיקר נשאר במערכת ללא שיוך
- צריך למחוק את הטיקר אם השיוך נכשל

**תיקון נוכחי:**
```python
except Exception as e:
    db.rollback()
    # ניסיון למחוק את הטיקר שיצרנו
    try:
        db.delete(ticker)
        db.flush()
    except Exception as del_error:
        logger.error(f"Error deleting ticker: {del_error}")
```

**סטטוס:** ✅ תוקן בקוד

---

## 5. תוכנית תיקון

### שלב 1: בדיקת מבנה הנתונים
- [ ] בדיקת סכמת `user_tickers` ב-PostgreSQL
- [ ] בדיקת constraints ו-defaults
- [ ] בדיקת foreign keys

### שלב 2: תיקון תהליך CREATE
- [ ] וידוא ש-`created_at` מוגדר מפורש בכל המקומות
- [ ] בדיקת transaction management
- [ ] וידוא rollback במקרה של שגיאה

### שלב 3: בדיקות
- [ ] בדיקת יצירת טיקר חדש + שיוך
- [ ] בדיקת שיוך טיקר קיים
- [ ] בדיקת טיפול בשגיאות
- [ ] בדיקת עדכון סטטוס

### שלב 4: תיעוד
- [ ] עדכון מסמך זה עם תוצאות
- [ ] יצירת דוגמאות שימוש
- [ ] תיעוד edge cases

---

## 6. דוגמאות שימוש

### 6.1 יצירת טיקר חדש

```python
# Request
POST /api/tickers/
{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "currency_id": 1,
    "remarks": "Technology company",
    "name_custom": "אפל בעברית",  # אופציונלי
    "type_custom": "מניה"          # אופציונלי
}

# Response (201)
{
    "status": "success",
    "data": {
        "id": 123,
        "symbol": "AAPL",
        "name": "Apple Inc.",
        ...
    }
}
```

### 6.2 שיוך טיקר קיים

```python
# Request (טיקר AAPL כבר קיים)
POST /api/tickers/
{
    "symbol": "AAPL",
    "name_custom": "אפל בעברית",
    "type_custom": "מניה"
}

# Response (201)
{
    "status": "success",
    "data": {
        "id": 123,  # ID של הטיקר הקיים
        ...
    }
}
```

### 6.3 שגיאה - טיקר כבר ברשימה

```python
# Request (טיקר כבר ברשימה של המשתמש)
POST /api/tickers/
{
    "symbol": "AAPL"
}

# Response (400)
{
    "status": "error",
    "error": {
        "message": "טיקר זה כבר נמצא ברשימה שלך"
    }
}
```

---

## 7. קבצים רלוונטיים

### Backend
- `Backend/models/ticker.py` - מודל Ticker
- `Backend/models/user_ticker.py` - מודל UserTicker
- `Backend/routes/api/tickers.py` - API endpoints
- `Backend/services/ticker_service.py` - לוגיקה עסקית

### Frontend
- `trading-ui/scripts/tickers.js` - לוגיקה frontend
- `trading-ui/tickers.html` - עמוד טיקרים

---

## 8. הערות חשובות

1. **בידוד משתמשים** - כל משתמש רואה רק את הטיקרים שהוא הוסיף
2. **טיקרים משותפים** - טיקרים משותפים לכל המשתמשים, אבל כל משתמש יכול להתאים שם וסוג
3. **סטטוס כפול** - יש סטטוס בטבלת `tickers` וסטטוס בטבלת `user_tickers`
4. **created_at** - חייב להיות מוגדר מפורש ב-`UserTicker` (לא עובד עם server_default)

---

## 9. שאלות פתוחות

1. האם צריך לתמוך בעדכון `name_custom` ו-`type_custom` בנפרד?
2. מה קורה כשמשתמש מוחק טיקר מהרשימה שלו? האם הטיקר נשאר במערכת?
3. האם צריך לתמוך בהצגת כל הטיקרים במערכת (לא רק של המשתמש) לחיפוש?

---

## 10. היסטוריית שינויים

| תאריך | שינוי | מבצע |
|-------|-------|------|
| 04.12.2025 | יצירת מסמך אפיון ראשוני | AI Assistant |
| 04.12.2025 | תיקון `created_at` מפורש | AI Assistant |
| 04.12.2025 | תיקון כפילות commit | AI Assistant |

