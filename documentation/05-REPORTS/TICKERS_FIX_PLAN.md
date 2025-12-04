# תוכנית תיקון - מערכת ניהול טיקרים

## תאריך יצירה
04.12.2025

## סטטוס
📋 מוכן לבדיקה

---

## 1. סיכום הבעיה

### בעיה נוכחית
- **CREATE operation נכשל** עם Database error 500
- השגיאה: `null value in column "created_at" of relation "user_tickers" violates not-null constraint`
- למרות ש-`created_at` מוגדר מפורש בקוד, השגיאה עדיין קורית

### ניתוח ראשוני
1. הקוד מגדיר `created_at=datetime.now(timezone.utc)` מפורש
2. השגיאה קורית ב-`UserTicker` creation
3. ייתכן שהבעיה היא ב-transaction management או ב-`TickerService.create()` שמבצע commit פנימי

---

## 2. תוכנית תיקון מפורטת

### שלב 1: אבחון מדויק ✅

**מטרה:** לזהות את השגיאה המדויקת

**פעולות:**
1. ✅ בדיקת מבנה הנתונים - `user_tickers` table
2. ✅ בדיקת הקוד הנוכחי - `create_ticker()` function
3. ✅ יצירת מסמך אפיון - `TICKERS_SPECIFICATION.md`
4. ⏳ בדיקת הלוגים בזמן אמת - לזהות את השגיאה המדויקת
5. ⏳ בדיקת transaction flow - האם יש בעיה ב-commit/flush

**תוצאה צפויה:** זיהוי מדויק של הבעיה

---

### שלב 2: תיקון תהליך CREATE

**מטרה:** לתקן את תהליך יצירת טיקר כך שיעבד ב-100%

#### 2.1 תיקון `TickerService.create()`

**בעיה:** `TickerService.create()` מבצע `db.commit()` פנימי, מה שיוצר בעיה עם `@handle_database_session(auto_commit=True)`

**פתרון:**
```python
# Option 1: שינוי TickerService.create() להשתמש ב-flush
@staticmethod
def create(db: Session, ticker_data: dict) -> Ticker:
    ...
    ticker = Ticker(**ticker_data)
    db.add(ticker)
    db.flush()  # במקום commit
    db.refresh(ticker)
    return ticker
```

**או:**

```python
# Option 2: יצירת פונקציה חדשה בלי commit
@staticmethod
def create_without_commit(db: Session, ticker_data: dict) -> Ticker:
    """Create ticker without committing - let caller handle commit"""
    ...
    ticker = Ticker(**ticker_data)
    db.add(ticker)
    db.flush()
    db.refresh(ticker)
    return ticker
```

**המלצה:** Option 1 - שינוי `create()` להשתמש ב-flush (יותר נקי)

#### 2.2 תיקון `create_ticker()` API

**בעיה:** אם `TickerService.create()` נכשל, הטיקר נשאר במערכת

**פתרון:**
```python
# שימוש ב-transaction wrapper
try:
    # Create ticker
    ticker = TickerService.create(db, data)
    
    # Create association
    user_ticker = UserTicker(
        user_id=user_id,
        ticker_id=ticker.id,
        name_custom=name_custom,
        type_custom=type_custom,
        status='open',
        created_at=datetime.now(timezone.utc)
    )
    db.add(user_ticker)
    db.flush()
    
except Exception as e:
    # Rollback everything
    db.rollback()
    # Handle error
    ...
```

#### 2.3 וידוא `created_at` מוגדר

**בעיה:** למרות שהקוד מגדיר `created_at`, השגיאה עדיין קורית

**פתרון:**
```python
# וידוא ש-created_at מוגדר לפני ה-add
from datetime import datetime, timezone

created_at_value = datetime.now(timezone.utc)
user_ticker = UserTicker(
    user_id=user_id,
    ticker_id=ticker.id,
    name_custom=name_custom,
    type_custom=type_custom,
    status='open',
    created_at=created_at_value
)

# בדיקה לפני ה-add
if not user_ticker.created_at:
    user_ticker.created_at = created_at_value

db.add(user_ticker)
db.flush()  # זה יזהה שגיאות לפני commit
```

---

### שלב 3: בדיקות

#### 3.1 בדיקות יחידה

**תרחיש 1: יצירת טיקר חדש + שיוך**
```python
# Test: Create new ticker with association
POST /api/tickers/
{
    "symbol": "TEST1",
    "name": "Test Ticker",
    "type": "stock",
    "currency_id": 1
}

# Expected: 201 Created
# Verify: ticker exists, user_ticker exists, created_at is set
```

**תרחיש 2: שיוך טיקר קיים**
```python
# Test: Associate existing ticker
POST /api/tickers/
{
    "symbol": "AAPL"  # Already exists
}

# Expected: 201 Created
# Verify: user_ticker created, ticker not duplicated
```

**תרחיש 3: טיקר כבר ברשימה**
```python
# Test: Ticker already in user's list
POST /api/tickers/
{
    "symbol": "AAPL"  # Already in user's list
}

# Expected: 400 Bad Request
# Message: "טיקר זה כבר נמצא ברשימה שלך"
```

**תרחיש 4: שגיאת validation**
```python
# Test: Invalid symbol
POST /api/tickers/
{
    "symbol": "",  # Empty
    "name": "Test"
}

# Expected: 400 Bad Request
# Message: Validation error
```

#### 3.2 בדיקות אינטגרציה

**בדיקה 1: Transaction rollback**
- יצירת טיקר
- נכשל ביצירת `UserTicker`
- וידוא שהטיקר נמחק (rollback)

**בדיקה 2: Concurrent requests**
- שני משתמשים מוסיפים אותו טיקר בו-זמנית
- וידוא שרק אחד מצליח

**בדיקה 3: Foreign key constraints**
- יצירת `UserTicker` עם `user_id` לא קיים
- יצירת `UserTicker` עם `ticker_id` לא קיים
- וידוא ששגיאות מוחזרות נכון

---

### שלב 4: תיקון notes (פשוט יחסית)

**בעיה:** `content` לא מגיע מה-request

**ניתוח:**
- `request.get_json()` עובר דרך `_normalized_get_json` ב-`app.py`
- `_normalized_get_json` קורא ל-`BaseEntityUtils.normalize_input()`
- ייתכן ש-`normalize_input()` מחזיר `None` או משנה את הנתונים

**פתרון:**
```python
# Option 1: שימוש ב-force=True
data = request.get_json(force=True, silent=False)

# Option 2: Fallback ל-manual parsing
try:
    data = request.get_json(force=True)
except:
    raw_data = request.get_data(as_text=True)
    data = json.loads(raw_data) if raw_data else None

# Option 3: בדיקה לפני normalize
raw_data = request.get_json()
if raw_data:
    content = raw_data.get('content')
    # Process content before normalization
```

**המלצה:** Option 1 + Option 2 (fallback)

---

## 3. סדר ביצוע מומלץ

### עדיפות 1: תיקון טיקרים
1. ✅ יצירת מסמך אפיון
2. ⏳ בדיקת הלוגים לזיהוי שגיאה מדויקת
3. ⏳ תיקון `TickerService.create()` להשתמש ב-flush
4. ⏳ תיקון `create_ticker()` API
5. ⏳ בדיקות
6. ⏳ הרצת בדיקות אוטומטיות

### עדיפות 2: תיקון notes
1. ⏳ בדיקת `request.get_json()` flow
2. ⏳ תיקון עם `force=True` + fallback
3. ⏳ בדיקות
4. ⏳ הרצת בדיקות אוטומטיות

---

## 4. קריטריוני הצלחה

### טיקרים
- ✅ CREATE עובד ב-100%
- ✅ יצירת טיקר חדש + שיוך עובד
- ✅ שיוך טיקר קיים עובד
- ✅ טיפול בשגיאות נכון
- ✅ Transaction rollback עובד

### Notes
- ✅ CREATE עובד ב-100%
- ✅ `content` מגיע מה-request
- ✅ Sanitization עובד נכון

---

## 5. סיכונים וסיכויים

### סיכונים
1. **שינוי `TickerService.create()`** - עלול להשפיע על מקומות אחרים
   - **הפחתת סיכון:** בדיקה שכל המקומות שמשתמשים ב-`create()` מטפלים ב-commit
   
2. **Transaction management** - עלול ליצור בעיות עם decorator
   - **הפחתת סיכון:** שימוש ב-flush במקום commit, הדקורטור יבצע commit

3. **Concurrent requests** - עלול ליצור race conditions
   - **הפחתת סיכון:** בדיקות concurrent

### סיכויים
- ✅ הקוד כבר מגדיר `created_at` מפורש
- ✅ יש טיפול בשגיאות
- ✅ יש rollback במקרה של שגיאה

---

## 6. שאלות לבדיקה

1. האם `TickerService.create()` משמש במקומות אחרים?
2. האם צריך לשמור על backward compatibility?
3. האם יש מקומות שמצפים ל-`create()` לבצע commit?

---

## 7. הערות

- המסמך מתעדכן בהתאם לתוצאות הבדיקות
- כל שינוי בקוד יתועד כאן
- בדיקות יתועדו בקובץ נפרד

---

## 8. היסטוריית שינויים

| תאריך | שינוי | מבצע |
|-------|-------|------|
| 04.12.2025 | יצירת תוכנית תיקון | AI Assistant |

