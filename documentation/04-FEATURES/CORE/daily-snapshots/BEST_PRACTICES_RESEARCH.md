# מחקר Best Practices - מערכת שמירת מצב יומית
# Best Practices Research - Daily Snapshot System

**תאריך יצירה:** 19 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ מחקר הושלם  
**מטרה:** מחקר מעמיק על פרקטיקות וארכיטקטורות למימוש שמירת מצב יומית

---

## 📋 סקירה כללית

מסמך זה מסכם מחקר מעמיק על:
- ארכיטקטורות מומלצות לשמירת מצב היסטורי
- כלים ופרויקטים קיימים בקוד פתוח
- Best practices מהתעשייה
- המלצות למימוש

---

## 🏗️ ארכיטקטורות מומלצות

### 1. Snapshot Pattern (מומלץ לשלב ראשון)

#### תיאור
שמירת תמונת מצב מלאה של המערכת בכל נקודת זמן (במקרה שלנו - כל יום).

#### עקרון פעולה
```
יום 1: Snapshot 1 → {trading_accounts: [...], trades: [...], ...}
יום 2: Snapshot 2 → {trading_accounts: [...], trades: [...], ...}
יום 3: Snapshot 3 → {trading_accounts: [...], trades: [...], ...}
```

#### יתרונות
✅ **פשטות:** קל ליישום ולהבנה  
✅ **גישה מהירה:** גישה ישירה לנתונים היסטוריים ללא חישובים  
✅ **שחזור קל:** שחזור מצב קל - פשוט לטעון snapshot  
✅ **ביצועים:** שאילתות מהירות - אינדקס על תאריך  
✅ **אמינות:** כל snapshot עצמאי - אין תלות ב-snapshots קודמים  

#### חסרונות
❌ **צריכת מקום:** כפילות נתונים (כל snapshot מכיל את כל הנתונים)  
❌ **גודל:** גודל snapshot גדל עם מספר ישויות  
❌ **עדכונים:** עדכון snapshot דורש שמירה מחדש של כל הנתונים  

#### יישום מומלץ
```sql
CREATE TABLE daily_snapshots (
    id INTEGER PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    snapshot_data TEXT NOT NULL,  -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, entity_type, entity_id)
);
```

#### שימוש אופטימלי
- ✅ מערכות עם מספר ישויות קטן-בינוני
- ✅ צורך בגישה מהירה לנתונים היסטוריים
- ✅ שלב ראשון/Proof of Concept
- ✅ מערכות עם שינויים יומיים (לא תכופים)

---

### 2. Event Sourcing (להרחבה עתידית)

#### תיאור
שמירת כל השינויים במערכת כאירועים נפרדים, ושחזור מצב על ידי "הפעלה" של כל האירועים עד לנקודת זמן מסוימת.

#### עקרון פעולה
```
Event 1: AccountCreated {account_id: 1, name: "Account A"}
Event 2: TradeOpened {trade_id: 1, account_id: 1, ticker_id: 5}
Event 3: ExecutionAdded {execution_id: 1, trade_id: 1, quantity: 100}
Event 4: TradeClosed {trade_id: 1, total_pl: 500}
```

#### יתרונות
✅ **שחזור מדויק:** שחזור מדויק של כל מצב בכל נקודת זמן  
✅ **ניתוח שינויים:** מעקב מפורט אחר כל שינוי  
✅ **Audit Trail:** היסטוריה מלאה של כל פעולה  
✅ **גמישות:** אפשרות לניתוח שינויים מכל סוג  

#### חסרונות
❌ **מורכבות:** מורכב יותר ליישום ותחזוקה  
❌ **ביצועים:** שחזור מצב דורש "הפעלה" של כל האירועים  
❌ **גודל:** מספר רב של אירועים (כל שינוי = אירוע)  
❌ **תלות:** שחזור מצב תלוי בכל האירועים הקודמים  

#### יישום מומלץ
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    event_data TEXT NOT NULL,  -- JSON
    timestamp DATETIME NOT NULL,
    user_id INTEGER,
    INDEX(timestamp, entity_type, entity_id)
);
```

#### שימוש אופטימלי
- ✅ מערכות עם צורך ב-audit trail מלא
- ✅ מערכות עם ניתוח שינויים מפורט
- ✅ מערכות מורכבות עם הרבה שינויים
- ✅ שלב מתקדם לאחר Snapshot Pattern

---

### 3. Hybrid Approach (מומלץ לשלב מתקדם)

#### תיאור
שילוב של Snapshot Pattern + Event Sourcing:
- Snapshots יומיים למצב כולל
- Events לשינויים משמעותיים בין snapshots

#### עקרון פעולה
```
יום 1: Snapshot 1 → {trading_accounts: [...], trades: [...]}
       Event: TradeOpened {trade_id: 1}
       Event: ExecutionAdded {execution_id: 1}
יום 2: Snapshot 2 → {trading_accounts: [...], trades: [...]}
       Event: TradeClosed {trade_id: 1}
```

#### יתרונות
✅ **איזון:** איזון בין פשטות לביצועים  
✅ **גמישות:** גמישות לניתוח שינויים  
✅ **ביצועים:** גישה מהירה ל-snapshots + ניתוח מפורט של events  
✅ **גודל:** חיסכון במקום - רק snapshots + events משמעותיים  

#### חסרונות
❌ **מורכבות בינונית:** מורכב יותר מ-Snapshot Pattern בלבד  
❌ **תחזוקה:** דורש תחזוקה של שני מנגנונים  

#### יישום מומלץ
```sql
-- Snapshots יומיים
CREATE TABLE daily_snapshots (...);

-- Events לשינויים משמעותיים
CREATE TABLE significant_events (
    id INTEGER PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    event_data TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    snapshot_date DATE,  -- קישור ל-snapshot
    INDEX(timestamp, entity_type, entity_id)
);
```

#### שימוש אופטימלי
- ✅ מערכות עם צורך בגישה מהירה + ניתוח מפורט
- ✅ מערכות עם שינויים תכופים
- ✅ שלב מתקדם לאחר Snapshot Pattern

---

## 🛠️ כלים ופרויקטים קיימים

### 1. SQLite Time-Series Extensions

#### TimescaleDB
- **תיאור:** Extension ל-PostgreSQL לניהול time-series data
- **סטטוס:** ❌ לא רלוונטי - PostgreSQL בלבד (אנחנו משתמשים ב-SQLite)
- **הערה:** אם בעתיד נעבור ל-PostgreSQL, זה פתרון מצוין

#### SQLite עם אינדקסים מותאמים
- **תיאור:** פתרון מותאם אישית עם אינדקסים על תאריכים
- **יתרונות:**
  - ✅ אין תלות חיצונית
  - ✅ פשוט ליישום
  - ✅ ביצועים טובים עם אינדקסים נכונים
- **יישום:**
```sql
CREATE INDEX idx_snapshots_date ON daily_snapshots(snapshot_date);
CREATE INDEX idx_snapshots_entity ON daily_snapshots(entity_type, entity_id);
CREATE INDEX idx_snapshots_date_entity ON daily_snapshots(snapshot_date, entity_type, entity_id);
```

---

### 2. Python Libraries

#### APScheduler
- **תיאור:** ספרייה מתקדמת לתזמון משימות
- **סטטוס:** ⚠️ לא בשימוש - המערכת משתמשת ב-`schedule`
- **הערה:** `schedule` מספיק לצרכים שלנו (תזמון יומי)

#### SQLAlchemy
- **תיאור:** ORM ל-Python (כבר בשימוש במערכת)
- **יתרונות:**
  - ✅ כבר בשימוש במערכת
  - ✅ תמיכה מלאה ב-SQLite
  - ✅ נוח לעבודה עם מודלים
- **יישום:** שימוש במודלים קיימים + מודל חדש ל-snapshots

#### Pandas
- **תיאור:** ספרייה לניתוח נתונים
- **סטטוס:** ⚠️ אופציונלי - לא נדרש לשלב ראשון
- **שימוש עתידי:** ניתוח מגמות, חישובי סטטיסטיקות

---

### 3. פרויקטים בקוד פתוח

#### django-simple-history
- **תיאור:** Extension ל-Django לשמירת היסטוריה של מודלים
- **קישור:** https://github.com/jazzband/django-simple-history
- **עקרון פעולה:**
  - שמירת snapshot של מודל לפני כל שינוי
  - גישה להיסטוריה דרך API
- **למידה:**
  - ✅ שימוש ב-snapshot pattern
  - ✅ אינטגרציה עם ORM
  - ✅ API פשוט לגישה להיסטוריה

#### temporal-tables
- **תיאור:** מימוש Temporal Tables (System-Versioned Tables)
- **קישור:** https://github.com/arkhipov/temporal_tables
- **עקרון פעולה:**
  - שמירת גרסאות אוטומטית של טבלאות
  - גישה להיסטוריה דרך SQL
- **למידה:**
  - ✅ שמירת גרסאות אוטומטית
  - ✅ גישה להיסטוריה דרך SQL
  - ⚠️ מורכב יותר מ-snapshot pattern

---

## 📚 Best Practices מהתעשייה

### 1. תזמון Snapshots

#### מומלץ: סוף היום
- **שעה:** 23:59 (לפני סיום היום)
- **סיבה:** לכידת מצב מלא של היום
- **יתרונות:**
  - ✅ מצב מלא של היום
  - ✅ אין הפרעה לפעילות יומית
  - ✅ תאריך ברור (יום הנוכחי)

#### חלופות:
- **00:00 (תחילת היום):** מצב של היום הקודם
- **לא מומלץ:** במהלך היום (מפריע לפעילות)

---

### 2. אופטימיזציה של גודל

#### דחיסת JSON
- **טכניקה:** דחיסת JSON לפני שמירה
- **יתרונות:**
  - ✅ חיסכון של 50-70% במקום
  - ✅ ביצועים טובים יותר
- **חסרונות:**
  - ❌ דורש decompression בעת קריאה
  - ❌ מורכבות נוספת

#### שמירה סלקטיבית
- **טכניקה:** שמירה רק של ישויות פעילות/משתנות
- **יתרונות:**
  - ✅ חיסכון במקום
  - ✅ ביצועים טובים יותר
- **חסרונות:**
  - ❌ מורכבות נוספת (צריך לזהות מה השתנה)

---

### 3. ניקוי נתונים ישנים

#### מדיניות שמירה
- **מומלץ:** שמירת snapshots לשנתיים
- **סיבה:** איזון בין גישה להיסטוריה לבין גודל DB
- **יישום:** Background task לניקוי אוטומטי

#### ארכיון
- **טכניקה:** העברת snapshots ישנים לארכיון (קובץ נפרד)
- **יתרונות:**
  - ✅ שמירת גישה להיסטוריה
  - ✅ שמירת DB קטן
- **חסרונות:**
  - ❌ מורכבות נוספת

---

### 4. אינדקסים לביצועים

#### אינדקסים מומלצים
```sql
-- גישה מהירה לפי תאריך
CREATE INDEX idx_snapshots_date ON daily_snapshots(snapshot_date);

-- גישה מהירה לפי entity
CREATE INDEX idx_snapshots_entity ON daily_snapshots(entity_type, entity_id);

-- גישה מהירה לפי תאריך + entity (הכי חשוב)
CREATE INDEX idx_snapshots_date_entity ON daily_snapshots(snapshot_date, entity_type, entity_id);
```

#### מדדי ביצועים
- **שאילתה לפי תאריך:** < 10ms
- **שאילתה לפי entity:** < 50ms
- **שאילתה לפי תאריך + entity:** < 5ms

---

### 5. Transactions ו-Atonicity

#### מומלץ: Transaction יחיד לכל snapshot
- **יתרונות:**
  - ✅ אטומיות - כל או כלום
  - ✅ עקביות נתונים
  - ✅ Rollback במקרה של שגיאה

#### יישום
```python
with db.begin():
    # שמירת כל ה-snapshots ב-transaction אחד
    save_trading_accounts_snapshots()
    save_trades_snapshots()
    save_executions_snapshots()
    # ...
```

---

### 6. Validation ו-Error Handling

#### Validation
- **תאריך תקין:** בדיקת תאריך תקין (לא עתיד, לא ישן מדי)
- **Entity קיים:** בדיקת entity_id קיים בטבלה המקורית
- **כפילות:** בדיקת כפילות (אותו יום + entity)

#### Error Handling
- **Retry Logic:** ניסיון חוזר במקרה של שגיאה זמנית
- **Logging:** לוג מפורט לכל snapshot
- **Notifications:** התראות על כשלים

---

## 🎯 המלצות למימוש

### שלב ראשון (MVP)
✅ **Snapshot Pattern** - פשוט ויעיל  
✅ **תזמון יומי** - 23:59  
✅ **טבלה מרכזית** - `daily_snapshots`  
✅ **JSON storage** - גמיש ומהיר  
✅ **אינדקסים בסיסיים** - על תאריך ו-entity  

### שלב שני (הרחבה)
✅ **דחיסת JSON** - חיסכון במקום  
✅ **שמירה סלקטיבית** - רק ישויות פעילות  
✅ **ניקוי אוטומטי** - snapshots ישנים  

### שלב שלישי (מתקדם)
✅ **Event Sourcing** - לניתוח שינויים מפורט  
✅ **Hybrid Approach** - snapshots + events  
✅ **Partitioning** - חלוקה לפי שנים  

---

## 📊 השוואת ארכיטקטורות

| קריטריון | Snapshot Pattern | Event Sourcing | Hybrid |
|----------|------------------|---------------|--------|
| **פשטות** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **ביצועים** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **גמישות** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **גודל DB** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **שחזור מצב** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **ניתוח שינויים** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## ✅ סיכום

### המלצה ראשית
**שלב ראשון:** Snapshot Pattern עם טבלה מרכזית `daily_snapshots`

### סיבות:
1. ✅ פשוט ליישום - זמן פיתוח קצר
2. ✅ מהיר לבדיקה - Proof of Concept מהיר
3. ✅ ניתן להרחבה - מעבר ל-Hybrid/Event Sourcing בעתיד
4. ✅ ביצועים טובים - עם אינדקסים נכונים
5. ✅ אמינות - כל snapshot עצמאי

### שלבים עתידיים:
1. **Event Sourcing** - לניתוח שינויים מפורט
2. **Compression** - דחיסת JSON ישן
3. **Partitioning** - חלוקה לפי שנים
4. **Real-time Snapshots** - snapshots בזמן אמת (לא רק יומי)

---

**תאריך עדכון אחרון:** 19 ינואר 2025  
**גרסה:** 1.0  
**מחבר:** TikTrack Development Team

