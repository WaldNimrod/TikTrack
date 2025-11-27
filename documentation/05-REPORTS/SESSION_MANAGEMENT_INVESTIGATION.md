# חקירה מעמיקה - בעיית Session/Transaction Management

**תאריך:** 27 בנובמבר 2025  
**בעיה:** Query דרך השרת מחזיר רק 1 רשומה במקום 120  
**סטטוס:** בחקירה

---

## סיכום מהיר

### התופעה
- ✅ יש **120 תוכניות** ב-DB (`Backend/db/tiktrack.db`)
- ✅ דרך **Flask context ישירות** יש 120
- ❌ דרך **השרת בפועל** רק **1** מוחזר
- ❌ הלוגים מראים: "Total trade plans in DB (count): 1"

### ההשערה
בעיית **session/transaction reuse** שגורמת ל-stale data או transaction aborted state

---

## שלב 1: מיפוי מלא של Session Lifecycle

### 1.1 בדיקת Session Creation

**שאלה:** איך נוצר session?
**קובץ:** `Backend/config/database.py`

```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**ממצאים:**
- Session נוצר חדש בכל קריאה ל-`get_db()`
- Session נסגר ב-`finally`

**בדיקה:**
- [ ] האם session באמת נסגר?
- [ ] האם יש session reuse?
- [ ] האם יש connection pooling שמשפיע?

### 1.2 בדיקת Connection Pooling

**שאלה:** איך עובד connection pooling?
**קובץ:** `Backend/config/database.py`

```python
engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
```

**ממצאים:**
- `pool_size`: 10
- `max_overflow`: 20
- `pool_recycle`: 3600
- `pool_pre_ping`: True

**בדיקה:**
- [ ] כמה connections פעילים?
- [ ] האם יש stale connections?
- [ ] האם pool_pre_ping עובד?

### 1.3 בדיקת Transaction States

**שאלה:** מה המצב של transactions?
**קובץ:** `Backend/routes/api/base_entity_decorators.py`

**ממצאים:**
- יש rollback check ב-`handle_database_session`
- יש rollback check ב-services

**בדיקה:**
- [ ] מה המצב של transaction לפני query?
- [ ] האם יש transaction aborted?
- [ ] האם rollback באמת עובד?

---

## שלב 2: ניטור בזמן אמת

### 2.1 Session Tracking

### 2.2 Transaction State Tracking

### 2.3 Query Execution Tracking

---

## שלב 3: בדיקות ממוקדות

### 3.1 בדיקת Session Identity

### 3.2 בדיקת Transaction Isolation

### 3.3 בדיקת Stale Data

---

## שלב 4: מסקנות והמלצות

### 4.1 גורם שורש זוהה

### 4.2 פתרון מוצע

### 4.3 צעדי מניעה

---

**עודכן:** 27 בנובמבר 2025 - בתחילת החקירה

