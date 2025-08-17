# שינויים בבסיס הנתונים - אוגוסט 2025

## סקירה כללית

מסמך זה מתאר את השינויים שבוצעו במבנה בסיס הנתונים של TikTrack במהלך אוגוסט 2025.

## שינויים עיקריים

### 1. הסרת שדה `opened_at` מטבלת `trades`

#### לפני השינוי:
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    trade_plan_id INTEGER,
    ticker_id INTEGER,
    account_id INTEGER,
    type TEXT,
    status TEXT,
    opened_at DATETIME,  -- שדה שהוסר
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### אחרי השינוי:
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    trade_plan_id INTEGER,
    ticker_id INTEGER,
    account_id INTEGER,
    type TEXT,
    status TEXT,
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### סיבות לשינוי:
- **בלבול**: השדה `opened_at` יצר בלבול עם `created_at`
- **עקביות**: `created_at` מספק את המידע הנדרש
- **פשטות**: פחות שדות לתחזוקה

### 2. הגבלת ערכי שדה `type` בטבלת `trades`

#### ערכים מותרים:
- `swing` - טריידים קצרי טווח
- `invest` - השקעות ארוכות טווח  
- `pasive` - השקעות פאסיביות

#### ערכים שהוסרו:
- `long` - הוחלף ב-`swing`
- `short` - הוחלף ב-`invest`

#### סיבות לשינוי:
- **בהירות**: שמות ברורים יותר
- **עקביות**: שלושה סוגים מוגדרים היטב
- **תחזוקה**: פחות ערכים לתחזוקה

### 3. עדכון ערכי שדה `status` בטבלת `trades`

#### ערכים מותרים:
- `open` - טרייד פתוח
- `closed` - טרייד סגור
- `cancelled` - טרייד מבוטל

#### שינוי:
- `canceled` → `cancelled` (תיקון איות)

## קבצי מיגרציה

### קבצים שנוצרו:
1. `remove_opened_at_column.py` - הסרת עמודת `opened_at`
2. `update_trade_dates.py` - עדכון תאריכים קיימים
3. `update_status_values.py` - עדכון ערכי סטטוס

### קבצים שעודכנו:
1. `models/trade.py` - עדכון מודל הטרייד
2. `services/trade_service.py` - עדכון שירות הטריידים
3. `routes/api/trades.py` - עדכון API הטריידים

## השפעה על הקוד

### קבצי Frontend שעודכנו:
1. `trading-ui/tracking.html` - עדכון טופסי טריידים
2. `trading-ui/database.html` - עדכון טופסי טריידים
3. `trading-ui/scripts/trades.js` - עדכון פונקציות טריידים

### שינויים עיקריים בקוד:
- החלפת `opened_at` ב-`created_at` בכל המקומות
- עדכון תרגומים עברית-אנגלית לסוגי טריידים
- עדכון תרגומים עברית-אנגלית לסטטוסים
- עדכון מבנה הטופסים

## הוראות הפעלה

### עדכון בסיס נתונים קיים:
```bash
cd Backend
python3 remove_opened_at_column.py
python3 update_trade_dates.py
python3 update_status_values.py
```

### בדיקת תקינות:
```bash
python3 debug_data.py
```

## גיבויים

### גיבוי אוטומטי:
- גיבוי אוטומטי נוצר לפני כל שינוי
- מיקום: `backups/YYYYMMDD_HHMMSS/`
- כולל: בסיס נתונים מלא + לוג שינויים

### שחזור:
```bash
# שחזור מגיבוי
cp backups/YYYYMMDD_HHMMSS/simpleTrade_new.db db/
```

## בדיקות

### בדיקות שבוצעו:
- [x] טעינת רשימת טריידים
- [x] עריכת טרייד קיים
- [x] הוספת טרייד חדש
- [x] ביטול טרייד
- [x] מחיקת טרייד
- [x] פילטרים לפי סוג
- [x] פילטרים לפי סטטוס
- [x] תצוגת תאריכים

### בדיקות נוספות:
- [x] תאימות עם תוכניות טרייד
- [x] תאימות עם חשבונות
- [x] תאימות עם טיקרים
- [x] תאימות עם הערות

## סיכום

השינויים שבוצעו שיפרו את:
- **בהירות המבנה**: פחות בלבול בין שדות
- **עקביות הנתונים**: ערכים מוגדרים היטב
- **תחזוקתיות**: קוד נקי יותר
- **חוויית משתמש**: ממשק ברור יותר

כל השינויים בוצעו עם גיבוי מלא ותמיכה בשחזור במקרה הצורך.
