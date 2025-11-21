# תכנון שלב ראשון (MVP) - מערכת שמירת מצב יומית
# Phase 1 MVP Planning - Daily Snapshot System

**תאריך יצירה:** 19 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** 📋 תוכנית עבודה  
**מטרה:** תכנון מפורט לשלב ראשון מצומצם (MVP)

---

## 📋 סקירה כללית

שלב ראשון (MVP) מתמקד ביצירת מנגנון בסיסי לשמירת מצב יומי, עם פונקציונליות מינימלית אך מלאה.

---

## 🎯 מטרות שלב ראשון

### מטרות עיקריות:
1. ✅ יצירת snapshot יומי בסיסי
2. ✅ שמירת נתוני חשבונות מסחר בלבד (Priority 1)
3. ✅ API בסיסי לאחזור snapshots
4. ✅ אינטגרציה עם BackgroundTaskManager

### מטרות משניות:
1. ✅ תזמון אוטומטי (23:59 כל יום)
2. ✅ Validation בסיסי
3. ✅ Error handling בסיסי
4. ✅ Logging בסיסי

---

## 📁 רשימת קבצים ליצירה

### 1. מודלים (Models)

#### `Backend/models/daily_snapshot.py`
- **תיאור:** מודל SQLAlchemy ל-DailySnapshot ו-DailyStatistics
- **גודל משוער:** ~150 שורות
- **זמן משוער:** 1-2 שעות

**תוכן:**
- `DailySnapshot` class
- `DailyStatistics` class
- JSON serialization/deserialization
- Indexes ו-constraints

---

### 2. שירותים (Services)

#### `Backend/services/daily_snapshot_service.py`
- **תיאור:** שירות מרכזי ל-snapshots
- **גודל משוער:** ~200 שורות
- **זמן משוער:** 2-3 שעות

**תוכן:**
- `create_daily_snapshot()` - יצירת snapshot
- `get_snapshot_by_date()` - אחזור snapshot
- Validation ו-error handling

#### `Backend/services/snapshot_data_collector.py`
- **תיאור:** איסוף נתונים ל-snapshot
- **גודל משוער:** ~300 שורות
- **זמן משוער:** 3-4 שעות

**תוכן:**
- `collect_trading_accounts()` - איסוף חשבונות
- `calculate_statistics()` - חישוב סטטיסטיקות בסיסיות
- JSON serialization

#### `Backend/services/daily_snapshot_task.py`
- **תיאור:** Background task ליצירת snapshot
- **גודל משוער:** ~50 שורות
- **זמן משוער:** 30 דקות

**תוכן:**
- `create_daily_snapshot_task()` - פונקציית task
- `register_daily_snapshot_task()` - רישום task

---

### 3. API Routes

#### `Backend/routes/api/daily_snapshots.py`
- **תיאור:** API endpoints ל-snapshots
- **גודל משוער:** ~200 שורות
- **זמן משוער:** 2-3 שעות

**תוכן:**
- `GET /api/daily-snapshots/<date>` - קבלת snapshot
- `POST /api/daily-snapshots/create` - יצירת snapshot ידני
- Error handling ו-validation

---

### 4. עדכונים לקבצים קיימים

#### `Backend/app.py`
- **תיאור:** רישום blueprint ו-task
- **שינויים:** הוספת 5-10 שורות
- **זמן משוער:** 15 דקות

**תוכן:**
- רישום `daily_snapshots_bp`
- רישום `daily_snapshot_task`

#### `Backend/models/__init__.py`
- **תיאור:** ייבוא מודל חדש
- **שינויים:** הוספת 2-3 שורות
- **זמן משוער:** 5 דקות

**תוכן:**
- `from .daily_snapshot import DailySnapshot, DailyStatistics`

#### `Backend/routes/api/__init__.py`
- **תיאור:** ייבוא blueprint חדש
- **שינויים:** הוספת 1-2 שורות
- **זמן משוער:** 5 דקות

**תוכן:**
- `from .daily_snapshots import daily_snapshots_bp`

---

## 📝 משימות מפורטות

### משימה 1: יצירת מודלים
**זמן משוער:** 1-2 שעות

#### שלבים:
1. ✅ יצירת `Backend/models/daily_snapshot.py`
2. ✅ הגדרת `DailySnapshot` class
3. ✅ הגדרת `DailyStatistics` class
4. ✅ הוספת JSON serialization/deserialization
5. ✅ הוספת indexes ו-constraints
6. ✅ עדכון `Backend/models/__init__.py`

#### בדיקות:
- ✅ מודל נטען ללא שגיאות
- ✅ JSON serialization עובד
- ✅ Indexes נוצרים נכון

---

### משימה 2: יצירת SnapshotDataCollector
**זמן משוער:** 3-4 שעות

#### שלבים:
1. ✅ יצירת `Backend/services/snapshot_data_collector.py`
2. ✅ יישום `collect_trading_accounts()`
3. ✅ יישום `calculate_statistics()` (בסיסי)
4. ✅ JSON serialization
5. ✅ Error handling

#### בדיקות:
- ✅ איסוף נתוני חשבונות עובד
- ✅ חישוב סטטיסטיקות עובד
- ✅ JSON תקין

---

### משימה 3: יצירת DailySnapshotService
**זמן משוער:** 2-3 שעות

#### שלבים:
1. ✅ יצירת `Backend/services/daily_snapshot_service.py`
2. ✅ יישום `create_daily_snapshot()`
3. ✅ יישום `get_snapshot_by_date()`
4. ✅ Validation (תאריך, כפילות)
5. ✅ Error handling
6. ✅ Transaction management

#### בדיקות:
- ✅ יצירת snapshot עובד
- ✅ אחזור snapshot עובד
- ✅ Validation עובד
- ✅ Transactions עובדים

---

### משימה 4: יצירת API Endpoints
**זמן משוער:** 2-3 שעות

#### שלבים:
1. ✅ יצירת `Backend/routes/api/daily_snapshots.py`
2. ✅ יישום `GET /api/daily-snapshots/<date>`
3. ✅ יישום `POST /api/daily-snapshots/create`
4. ✅ Error handling
5. ✅ Validation
6. ✅ רישום blueprint ב-`app.py`

#### בדיקות:
- ✅ API endpoints עובדים
- ✅ Validation עובד
- ✅ Error handling עובד

---

### משימה 5: אינטגרציה עם BackgroundTaskManager
**זמן משוער:** 30 דקות

#### שלבים:
1. ✅ יצירת `Backend/services/daily_snapshot_task.py`
2. ✅ יישום `create_daily_snapshot_task()`
3. ✅ יישום `register_daily_snapshot_task()`
4. ✅ רישום ב-`app.py`
5. ✅ תזמון (23:59 כל יום)

#### בדיקות:
- ✅ Task נרשם
- ✅ Task רץ אוטומטית
- ✅ Snapshot נוצר

---

### משימה 6: בדיקות ואימות
**זמן משוער:** 2-3 שעות

#### שלבים:
1. ✅ בדיקת יצירת snapshot ידני
2. ✅ בדיקת אחזור snapshot
3. ✅ בדיקת תזמון אוטומטי
4. ✅ בדיקת validation
5. ✅ בדיקת error handling
6. ✅ בדיקת ביצועים (אינדקסים)

#### בדיקות:
- ✅ כל הפונקציונליות עובדת
- ✅ אין שגיאות
- ✅ ביצועים תקינים

---

## ⏱️ זמנים משוערים

### סיכום לפי משימות:

| משימה | זמן משוער | סה"כ |
|--------|-----------|------|
| **1. מודלים** | 1-2 שעות | 1-2 שעות |
| **2. SnapshotDataCollector** | 3-4 שעות | 4-6 שעות |
| **3. DailySnapshotService** | 2-3 שעות | 6-9 שעות |
| **4. API Endpoints** | 2-3 שעות | 8-12 שעות |
| **5. BackgroundTaskManager** | 30 דקות | 8.5-12.5 שעות |
| **6. בדיקות** | 2-3 שעות | 10.5-15.5 שעות |

### סה"כ זמן משוער:
**10.5-15.5 שעות** (כ-2-3 ימי עבודה)

---

## 📊 סדר ביצוע מומלץ

### יום 1: תשתית
1. ✅ משימה 1: מודלים
2. ✅ משימה 2: SnapshotDataCollector (חלקי)

### יום 2: לוגיקה
1. ✅ משימה 2: SnapshotDataCollector (השלמה)
2. ✅ משימה 3: DailySnapshotService

### יום 3: API ואינטגרציה
1. ✅ משימה 4: API Endpoints
2. ✅ משימה 5: BackgroundTaskManager
3. ✅ משימה 6: בדיקות

---

## 🧪 תוכנית בדיקות

### בדיקות יחידה (Unit Tests)

#### 1. DailySnapshot Model
```python
def test_daily_snapshot_creation():
    # Test snapshot creation
    pass

def test_json_serialization():
    # Test JSON serialization/deserialization
    pass
```

#### 2. SnapshotDataCollector
```python
def test_collect_trading_accounts():
    # Test account collection
    pass

def test_calculate_statistics():
    # Test statistics calculation
    pass
```

#### 3. DailySnapshotService
```python
def test_create_snapshot():
    # Test snapshot creation
    pass

def test_get_snapshot():
    # Test snapshot retrieval
    pass
```

---

### בדיקות אינטגרציה (Integration Tests)

#### 1. API Endpoints
```python
def test_get_snapshot_endpoint():
    # Test GET /api/daily-snapshots/<date>
    pass

def test_create_snapshot_endpoint():
    # Test POST /api/daily-snapshots/create
    pass
```

#### 2. Background Task
```python
def test_daily_snapshot_task():
    # Test automatic snapshot creation
    pass
```

---

### בדיקות ידניות (Manual Tests)

#### 1. יצירת Snapshot
1. ✅ יצירת snapshot ידני דרך API
2. ✅ בדיקת שמירה ב-DB
3. ✅ בדיקת JSON תקין

#### 2. אחזור Snapshot
1. ✅ אחזור snapshot דרך API
2. ✅ בדיקת נתונים תקינים
3. ✅ בדיקת ביצועים

#### 3. תזמון אוטומטי
1. ✅ המתנה ל-23:59
2. ✅ בדיקת יצירת snapshot אוטומטית
3. ✅ בדיקת לוגים

---

## ✅ קריטריוני הצלחה

### MVP נחשב מוצלח אם:
1. ✅ Snapshot נוצר בהצלחה כל יום בשעה 23:59
2. ✅ נתוני חשבונות נשמרים נכון
3. ✅ API endpoints עובדים
4. ✅ אין שגיאות ב-logs
5. ✅ ביצועים תקינים (< 5 שניות ל-snapshot)

---

## 🚀 שלבים עתידיים (לא בשלב ראשון)

### Phase 2: הרחבה
- הוספת trades, executions, cash_flows
- הוספת market_data snapshots
- דף היסטוריה בסיסי

### Phase 3: ניתוח ומגמות
- סטטיסטיקות מחושבות מתקדמות
- דף השוואות
- גרפים ומגמות

---

## 📝 הערות חשובות

### 1. שלב ראשון מצומצם
- רק חשבונות מסחר (Priority 1)
- API בסיסי בלבד
- אין Frontend בשלב ראשון

### 2. תזמון
- תזמון ידני לבדיקות (לא צריך לחכות ל-23:59)
- תזמון אוטומטי רק אחרי בדיקות

### 3. Validation
- Validation בסיסי בלבד
- Error handling בסיסי

### 4. ביצועים
- אינדקסים בסיסיים
- אין אופטימיזציה מתקדמת

---

## ✅ סיכום

שלב ראשון (MVP) כולל:
- ✅ 4 קבצים חדשים
- ✅ 3 עדכונים לקבצים קיימים
- ✅ 6 משימות מפורטות
- ✅ 10.5-15.5 שעות עבודה
- ✅ 2-3 ימי פיתוח

**התוכנית מוכנה ליישום!**

---

**תאריך עדכון אחרון:** 19 ינואר 2025  
**גרסה:** 1.0  
**מחבר:** TikTrack Development Team

