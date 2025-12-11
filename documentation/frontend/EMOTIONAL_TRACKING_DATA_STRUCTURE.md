# מבנה נתונים - תיעוד רגשי

## Emotional Tracking Data Structure

**תאריך יצירה:** 29 בינואר 2025  
**סטטוס:** הגדרת דרישות - לפני מימוש

---

## סקירה כללית

עמוד תיעוד רגשי (`emotional-tracking-widget.html`) דורש מבנה נתונים חדש במערכת.  
**⚠️ חשוב:** אין כרגע טבלה או מודל במערכת לתיעוד רגשי.

---

## 1. תיעוד רגשי (Emotional Entry)

### 1.1 שדות נדרשים

| שדה | סוג | חובה | תיאור | דוגמה |
|-----|-----|------|-------|-------|
| `id` | Integer | ✅ | מזהה ייחודי | `1` |
| `emotion_type` | String(20) | ✅ | סוג הרגש | `"happy"`, `"satisfied"`, `"neutral"`, `"sad"`, `"angry"`, `"confused"`, `"stressed"` |
| `recorded_at` | DateTime | ✅ | תאריך ושעה של התיעוד | `2025-01-15 14:30:00` |
| `notes` | String(5000) | ❌ | הערות טקסטואליות | `"מה גרם לרגש הזה?"` |
| `trade_id` | Integer | ❌ | קישור לטרייד (Foreign Key) | `123` |
| `user_id` | Integer | ✅ | משתמש שיצר את התיעוד | `1` |
| `created_at` | DateTime | ✅ | תאריך יצירה | `2025-01-15 14:30:00` |
| `updated_at` | DateTime | ✅ | תאריך עדכון אחרון | `2025-01-15 14:30:00` |

### 1.2 סוגי רגשות (Emotion Types)

**רשימת רגשות מוגדרת:**

| ערך (English) | תרגום (Hebrew) | אייקון מוצע |
|--------------|----------------|-------------|
| `happy` | שמח | `mood-happy` |
| `satisfied` | מרוצה | `mood-smile` |
| `neutral` | ניטרלי | `mood-neutral` |
| `sad` | עצוב | `mood-sad` |
| `angry` | כועס | `mood-angry` |
| `confused` | מבולבל | `mood-confused` |
| `stressed` | מתוח | `mood-stressed` |

**הערות:**

- רשימה סגורה - לא ניתן להוסיף רגשות חדשים ללא שינוי במערכת
- כל רגש צריך אייקון ייחודי
- ערכים באנגלית (כמו כל המערכת)

### 1.3 קישור לטריידים

- **אופציונלי:** תיעוד יכול להיות ללא קישור לטרייד
- **Foreign Key:** `trade_id` → `trades.id`
- **שימוש:** ניתוח דפוסים רגשיים לפי טריידים

---

## 2. נתונים לגרף דפוסים רגשיים

### 2.1 סוגי גרפים נדרשים

#### Bar Chart - התפלגות רגשות

```json
{
  "chart_type": "bar",
  "data": [
    { "emotion": "happy", "count": 15, "percentage": 25.0 },
    { "emotion": "satisfied", "count": 20, "percentage": 33.3 },
    { "emotion": "neutral", "count": 10, "percentage": 16.7 },
    { "emotion": "sad", "count": 5, "percentage": 8.3 },
    { "emotion": "angry", "count": 3, "percentage": 5.0 },
    { "emotion": "confused", "count": 4, "percentage": 6.7 },
    { "emotion": "stressed", "count": 3, "percentage": 5.0 }
  ],
  "period": "all_time" // או "week", "month", "year"
}
```

#### Pie Chart - התפלגות רגשות

```json
{
  "chart_type": "pie",
  "data": [
    { "emotion": "happy", "value": 15, "color": "#26baac" },
    { "emotion": "satisfied", "value": 20, "color": "#4CAF50" },
    // ...
  ]
}
```

#### Line Chart - מגמה לאורך זמן

```json
{
  "chart_type": "line",
  "data": [
    { "date": "2025-01-01", "happy": 2, "satisfied": 3, "neutral": 1, "sad": 0, "angry": 0, "confused": 0, "stressed": 1 },
    { "date": "2025-01-02", "happy": 1, "satisfied": 2, "neutral": 2, "sad": 1, "angry": 0, "confused": 1, "stressed": 0 },
    // ...
  ],
  "period": "week" // או "month", "year"
}
```

### 2.2 תקופות זמן

- **יום (day):** תיעודים מהיום
- **שבוע (week):** תיעודים מ-7 הימים האחרונים
- **חודש (month):** תיעודים מ-30 הימים האחרונים
- **כל הזמן (all_time):** כל התיעודים

---

## 3. תיעודים אחרונים (Recent Entries)

### 3.1 מבנה רשומה

```json
{
  "id": 1,
  "emotion_type": "satisfied",
  "emotion_display": "מרוצה",
  "recorded_at": "2025-01-15T14:30:00Z",
  "recorded_at_display": "15 בינואר 2025, 14:30",
  "notes": "טרייד מוצלח",
  "trade_id": 123,
  "trade_display": "Trade #123 - AAPL",
  "has_trade_link": true
}
```

### 3.2 סדר הצגה

- **ברירת מחדל:** לפי `recorded_at` - מהחדש לישן (DESC)
- **גבול:** 10-20 תיעודים אחרונים

---

## 4. תובנות (Insights)

### 4.1 סוגי תובנות

#### תובנה חיובית (Info)

```json
{
  "type": "insight",
  "severity": "info",
  "title": "תובנה",
  "message": "אתה נוטה להיות מרוצה יותר בטריידים עם תוכנית (70% מהמקרים).",
  "data": {
    "pattern": "satisfied_with_plan",
    "percentage": 70.0,
    "sample_size": 50
  }
}
```

#### אזהרה (Warning)

```json
{
  "type": "pattern",
  "severity": "warning",
  "title": "דפוס",
  "message": "רמת מתח גבוהה יותר בטריידים של יום (day trading).",
  "data": {
    "pattern": "stressed_day_trading",
    "average_stress_level": 8.5,
    "comparison": "swing_trading_average": 3.2
  }
}
```

### 4.2 דפוסים אפשריים

1. **קורלציה עם תוכניות:** מרוצה יותר בטריידים עם תוכנית
2. **קורלציה עם סוג השקעה:** מתח גבוה ב-day trading
3. **קורלציה עם P/L:** רגשות חיוביים יותר בטריידים רווחיים
4. **קורלציה עם זמן:** רגשות שליליים יותר בשעות מסוימות
5. **מגמות:** שינוי ברגשות לאורך זמן

---

## 5. מבנה טבלה מוצע (Database Schema)

### 5.1 טבלת `emotional_entries`

```sql
CREATE TABLE emotional_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    emotion_type VARCHAR(20) NOT NULL,
    recorded_at DATETIME NOT NULL,
    notes TEXT,
    trade_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (trade_id) REFERENCES trades(id),
    CHECK (emotion_type IN ('happy', 'satisfied', 'neutral', 'sad', 'angry', 'confused', 'stressed'))
);
```

### 5.2 אינדקסים מוצעים

```sql
CREATE INDEX idx_emotional_entries_user_id ON emotional_entries(user_id);
CREATE INDEX idx_emotional_entries_recorded_at ON emotional_entries(recorded_at);
CREATE INDEX idx_emotional_entries_trade_id ON emotional_entries(trade_id);
CREATE INDEX idx_emotional_entries_emotion_type ON emotional_entries(emotion_type);
```

---

## 6. API Endpoints נדרשים

### 6.1 CRUD Operations

| Method | Endpoint | תיאור |
|--------|----------|-------|
| `GET` | `/api/emotional-entries/` | קבלת כל התיעודים |
| `GET` | `/api/emotional-entries/{id}` | קבלת תיעוד ספציפי |
| `POST` | `/api/emotional-entries/` | יצירת תיעוד חדש |
| `PUT` | `/api/emotional-entries/{id}` | עדכון תיעוד |
| `DELETE` | `/api/emotional-entries/{id}` | מחיקת תיעוד |

### 6.2 Analytics Endpoints

| Method | Endpoint | תיאור |
|--------|----------|-------|
| `GET` | `/api/emotional-entries/stats` | סטטיסטיקות כלליות |
| `GET` | `/api/emotional-entries/chart-data` | נתונים לגרף |
| `GET` | `/api/emotional-entries/insights` | תובנות וניתוח דפוסים |
| `GET` | `/api/emotional-entries/recent` | תיעודים אחרונים |

### 6.3 Query Parameters

**לכל ה-endpoints:**

- `?user_id={id}` - סינון לפי משתמש
- `?trade_id={id}` - סינון לפי טרייד
- `?emotion_type={type}` - סינון לפי רגש
- `?start_date={date}` - תאריך התחלה
- `?end_date={date}` - תאריך סיום
- `?period={day|week|month|all_time}` - תקופת זמן
- `?limit={number}` - הגבלת תוצאות

---

## 7. שילוב עם מערכות קיימות

### 7.1 קישור לטריידים

- **Foreign Key:** `emotional_entries.trade_id` → `trades.id`
- **שימוש:** ניתוח רגשות לפי טריידים
- **אופציונלי:** תיעוד יכול להיות ללא קישור

### 7.2 קישור למשתמשים

- **Foreign Key:** `emotional_entries.user_id` → `users.id`
- **שימוש:** כל משתמש רואה רק את התיעודים שלו

### 7.3 אינטגרציה עם Notes

**שאלה פתוחה:** האם להשתמש ב-`notes` table הקיים או בטבלה נפרדת?

**אפשרות 1:** שימוש ב-`notes` table

- ✅ אין צורך בטבלה חדשה
- ✅ מערכת קישור קיימת (`related_type_id`, `related_id`)
- ❌ לא מתאים - Notes זה טקסט חופשי, לא מבנה מובנה

**אפשרות 2:** טבלה נפרדת `emotional_entries`

- ✅ מבנה מובנה וספציפי
- ✅ ביצועים טובים יותר (אינדקסים)
- ✅ קל לניתוח ושאילתות
- ❌ טבלה נוספת במערכת

**המלצה:** טבלה נפרדת `emotional_entries` - מבנה מובנה יותר מתאים לצרכים

---

## 8. נתוני דמה למוקאפ

### 8.1 רשימת תיעודים לדוגמה

```json
[
  {
    "id": 1,
    "emotion_type": "satisfied",
    "recorded_at": "2025-01-15T14:30:00Z",
    "notes": "טרייד מוצלח עם תוכנית",
    "trade_id": 123,
    "trade_display": "Trade #123 - AAPL"
  },
  {
    "id": 2,
    "emotion_type": "happy",
    "recorded_at": "2025-01-10T16:00:00Z",
    "notes": "רווח יפה היום",
    "trade_id": 124,
    "trade_display": "Trade #124 - TSLA"
  },
  {
    "id": 3,
    "emotion_type": "neutral",
    "recorded_at": "2025-01-05T10:00:00Z",
    "notes": null,
    "trade_id": null,
    "trade_display": null
  }
]
```

### 8.2 נתוני גרף לדוגמה

```json
{
  "chart_type": "bar",
  "data": [
    { "emotion": "happy", "count": 15, "percentage": 25.0 },
    { "emotion": "satisfied", "count": 20, "percentage": 33.3 },
    { "emotion": "neutral", "count": 10, "percentage": 16.7 },
    { "emotion": "sad", "count": 5, "percentage": 8.3 },
    { "emotion": "angry", "count": 3, "percentage": 5.0 },
    { "emotion": "confused", "count": 4, "percentage": 6.7 },
    { "emotion": "stressed", "count": 3, "percentage": 5.0 }
  ],
  "period": "all_time"
}
```

### 8.3 תובנות לדוגמה

```json
[
  {
    "type": "insight",
    "severity": "info",
    "title": "תובנה",
    "message": "אתה נוטה להיות מרוצה יותר בטריידים עם תוכנית (70% מהמקרים)."
  },
  {
    "type": "pattern",
    "severity": "warning",
    "title": "דפוס",
    "message": "רמת מתח גבוהה יותר בטריידים של יום (day trading)."
  }
]
```

---

## 9. שאלות פתוחות

### 9.1 שאלות טכניות

1. **איזה סוג גרף?** Bar Chart או Pie Chart או שניהם?
2. **תקופות זמן:** איזה תקופות לתמוך? (יום, שבוע, חודש, שנה, כל הזמן)
3. **אינטגרציה עם Notes:** האם להשתמש ב-`notes` table או טבלה נפרדת?
4. **קישור ל-TradePlan:** האם להוסיף גם `trade_plan_id` או רק `trade_id`?

### 9.2 שאלות פונקציונליות

1. **עריכה/מחיקה:** האם לאפשר עריכה או מחיקה של תיעודים?
2. **תובנות:** איך לחשב תובנות? באיזה אלגוריתם?
3. **התראות:** האם להוסיף התראות על דפוסים שליליים?
4. **דוחות:** האם להוסיף דוחות רגשיים?

---

## 10. סיכום

### 10.1 מה חסר במערכת

1. ❌ **טבלת `emotional_entries`** - אין במערכת
2. ❌ **מודל `EmotionalEntry`** - אין במערכת
3. ❌ **Service `EmotionalEntryService`** - אין במערכת
4. ❌ **API Routes** - אין במערכת
5. ❌ **Frontend Service** - אין במערכת

### 10.2 מה קיים במערכת

1. ✅ **טבלת `trades`** - קיימת (לקישור)
2. ✅ **טבלת `users`** - קיימת (לקישור)
3. ✅ **מערכת Notes** - קיימת (אבל לא מתאימה)

### 10.3 צעדים נדרשים

1. **יצירת טבלה:** `emotional_entries`
2. **יצירת מודל:** `EmotionalEntry` (Backend/models/emotional_entry.py)
3. **יצירת Service:** `EmotionalEntryService` (Backend/services/emotional_entry_service.py)
4. **יצירת API Routes:** `/api/emotional-entries/` (Backend/routes/api/emotional_entries.py)
5. **יצירת Frontend Service:** `emotional-entry-service.js`
6. **מימוש עמוד:** אינטגרציה מלאה עם כל המערכות

---

**תאריך עדכון אחרון:** 29 בינואר 2025  
**סטטוס:** הגדרת דרישות - ממתין לאישור לפני מימוש

