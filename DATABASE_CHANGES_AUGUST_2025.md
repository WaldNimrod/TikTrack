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

## 4. איחוד סוגי טריידים - 19.08.2025

### מטרה
איחוד כל סוגי הטריידים לשלושה ערכים קבועים וממוסמסים במערכת.

### הבעיה שזוהתה
במערכת היו אי-עקביות רבה בסוגי הטריידים:

#### בקבצי JavaScript:
- `swing`, `invest`, `pasive`
- `swing`, `investment`, `passive`

#### במודלים:
- **Trades**: `buy` (ברירת מחדל)
- **Trade Plans**: `long` (ברירת מחדל)

#### בתרגום לעברית:
- `סווינג`, `השקעה`, `פאסיבי`

### הפתרון
איחוד כל הערכים לשלושה ערכים קבועים:

| ערך באנגלית | ערך בעברית | תיאור |
|-------------|------------|-------|
| `swing` | סווינג | טריידים קצרי טווח |
| `investment` | השקעה | השקעות ארוכות טווח |
| `passive` | פאסיבי | השקעות פאסיביות |

### שינויים שבוצעו

#### עדכון מודלים:
- **`Backend/models/trade.py`**: שינוי ברירת מחדל מ-`buy` ל-`swing`
- **`Backend/models/trade_plan.py`**: שינוי ברירת מחדל מ-`long` ל-`swing`

#### עדכון קבצי HTML:
- **`trading-ui/database.html`**: עדכון ערכי `value` מ-`invest`/`pasive` ל-`investment`/`passive`
- **`trading-ui/tracking.html`**: עדכון ערכי `value` מ-`invest`/`pasive` ל-`investment`/`passive`

#### עדכון קבצי JavaScript:
- **`trading-ui/scripts/trades.js`**: 
  - עדכון מיפוי ערכים
  - הוספת תאימות לאחור (`invest` -> `investment`, `pasive` -> `passive`)
  - עדכון וולידציה

### תאימות לאחור
המערכת תומכת בערכים ישנים וממירה אותם אוטומטית:

| ערך ישן | ערך חדש |
|---------|---------|
| `buy` | `swing` |
| `long` | `swing` |
| `invest` | `investment` |
| `pasive` | `passive` |

### מיגרציית נתונים
- **סקריפט מיגרציה**: `update_trade_types.py` (הוסר לאחר השימוש)
- **גיבוי אוטומטי**: נוצר לפני השינויים
- **תוצאות**:
  - 10 רשומות trades עודכנו מ-`buy` ל-`swing`
  - 3 רשומות trade_plans עודכנו מ-`long` ל-`swing`

### בדיקות שבוצעו
- [x] בדיקות יחידה - עוברות בהצלחה
- [x] בדיקת בסיס נתונים - כל הערכים תקינים
- [x] בדיקת שרת - עובד כרגיל
- [x] בדיקת מיגרציה - הושלמה בהצלחה

## סיכום

השינויים שבוצעו שיפרו את:
- **בהירות המבנה**: פחות בלבול בין שדות
- **עקביות הנתונים**: ערכים מוגדרים היטב
- **תחזוקתיות**: קוד נקי יותר
- **חוויית משתמש**: ממשק ברור יותר
- **תקפות המערכת**: איחוד סוגי טריידים לסטנדרט אחד

כל השינויים בוצעו עם גיבוי מלא ותמיכה בשחזור במקרה הצורך.

## 5. הוספת שדה Side - 19.08.2025

### מטרה
הוספת שדה `side` לטריידים ותוכניות טרייד כדי להבדיל בין Long ו-Short.

### הפתרון
הוספת שדה `side` עם שני ערכים אפשריים:
- `Long` - פוזיציה ארוכה (ברירת מחדל)
- `Short` - פוזיציה קצרה

### שינויים שבוצעו

#### עדכון מודלים:
- **`Backend/models/trade.py`**: הוספת שדה `side` עם ברירת מחדל `Long`
- **`Backend/models/trade_plan.py`**: הוספת שדה `side` עם ברירת מחדל `Long`

#### עדכון בסיס נתונים:
- **הוספת עמודת side** לטבלת `trades`
- **הוספת עמודת side** לטבלת `trade_plans`
- **גיבוי אוטומטי** לפני השינויים

#### עדכון קבצי HTML:
- **`trading-ui/tracking.html`**: הוספת שדה side למודלי עריכה והוספת טריידים
- **`trading-ui/database.html`**: הוספת שדה side למודל עריכת תוכניות טרייד

#### עדכון קבצי JavaScript:
- **`trading-ui/scripts/trades.js`**: עדכון פונקציות שמירה ועריכה
- **`trading-ui/scripts/grid-table.js`**: עדכון איסוף נתונים ממודלים

### מיגרציית נתונים
- **סקריפט מיגרציה**: `add_side_column.py` (הוסר לאחר השימוש)
- **גיבוי אוטומטי**: נוצר לפני השינויים
- **תוצאות**:
  - עמודת side נוספה לטבלת trades
  - עמודת side נוספה לטבלת trade_plans
  - כל הרשומות קיבלו ערך ברירת מחדל `Long`

### בדיקות שבוצעו
- [x] בדיקות יחידה - 6 בדיקות עוברות, 1 דילוג
- [x] בדיקת בסיס נתונים - עמודות side נוספו בהצלחה
- [x] בדיקת שרת - API עובד כרגיל
- [x] בדיקת מודלים - Trade ו-TradePlan עם שדה side

### קבצים חדשים/עדכנים
- **קבצים חדשים**: אין
- **קבצים שעודכנו**:
  - `Backend/models/trade.py`
  - `Backend/models/trade_plan.py`
  - `trading-ui/tracking.html`
  - `trading-ui/database.html`
  - `trading-ui/scripts/trades.js`
  - `trading-ui/scripts/grid-table.js`
  - `Backend/testing_suite/unit_tests/test_models.py`

## סיכום

השינויים שבוצעו שיפרו את:
- **בהירות המבנה**: פחות בלבול בין שדות
- **עקביות הנתונים**: ערכים מוגדרים היטב
- **תחזוקתיות**: קוד נקי יותר
- **חוויית משתמש**: ממשק ברור יותר
- **תקפות המערכת**: איחוד סוגי טריידים לסטנדרט אחד
- **גמישות המסחר**: תמיכה ב-Long ו-Short

כל השינויים בוצעו עם גיבוי מלא ותמיכה בשחזור במקרה הצורך.
