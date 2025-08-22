# Database Changes - August 2025

## General Overview

This document describes the changes made to TikTrack's database structure during August 2025.

## Main Changes

### 1. Removing `opened_at` field from `trades` table

#### Before Change:
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    trade_plan_id INTEGER,
    ticker_id INTEGER,
    account_id INTEGER,
    type TEXT,
    status TEXT,
    opened_at DATETIME,  -- removed field
    closed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### After Change:
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

#### Reasons for Change:
- **Confusion**: The `opened_at` field created confusion with `created_at`
- **Consistency**: `created_at` provides the required information
- **Simplicity**: Fewer fields to maintain

### 2. Limiting `type` field values in `trades` table

#### Allowed Values:
- `swing` - Short-term trades
- `invest` - Long-term investments  
- `pasive` - Passive investments

#### Removed Values:
- `long` - Replaced with `swing`
- `short` - Replaced with `invest`

#### Reasons for Change:
- **Clarity**: Clearer names
- **Consistency**: Three well-defined types
- **Maintenance**: Fewer values to maintain

### 3. Updating `status` field values in `trades` table

#### Allowed Values:
- `open` - Open trade
- `closed` - Closed trade
- `cancelled` - Cancelled trade

#### Change:
- `cancelled` → `cancelled` (spelling fix)

## Migration Files

### Created Files:
1. `remove_opened_at_column.py` - Remove `opened_at` column
2. `update_trade_dates.py` - Update existing dates
3. `update_status_values.py` - Update status values

### Updated Files:
1. `models/trade.py` - Update trade model
2. `services/trade_service.py` - Update trade service
3. `routes/api/trades.py` - Update trades API

## Code Impact

### Updated Frontend Files:
1. `trading-ui/tracking.html` - Update trade forms
2. `trading-ui/database.html` - Update trade forms
3. `trading-ui/scripts/trades.js` - Update trade functions

### Main Code Changes:
- Replace `opened_at` with `created_at` everywhere
- Update Hebrew-English translations for trade types
- Update Hebrew-English translations for statuses
- Update form structure

## Ticker Validation

### 4. הוספת ולידציה לטבלת `tickers`

#### סקירה כללית
הוספנו מערכת ולידציה מקיפה לטבלת הטיקרים במערכת. המערכת כוללת ולידציה Backend ו-Frontend, 
בדיקת כפילות סימבולים, ומניעת שגיאות בזמן הוספה ועריכה.

#### ולידציות שהוספו:

**Backend (Python/SQLAlchemy):**
- **סימבול**: שדה חובה, מקסימום 10 תווים, רק אותיות ומספרים באנגלית
- **שם**: מקסימום 100 תווים
- **סוג**: ערכים מותרים: `stock`, `etf`, `crypto`, `forex`, `commodity`
- **מטבע**: בדיוק 3 תווים (למשל: USD, ILS, EUR)
- **הערות**: מקסימום 500 תווים
- **ייחודיות**: סימבול חייב להיות ייחודי במערכת

**Frontend (JavaScript):**
- ולידציה זהה בצד הלקוח לפני שליחה לשרת
- בדיקת כפילות סימבול בזמן אמת
- הצגת שגיאות ואזהרות למשתמש

#### פונקציות ולידציה שהוספו:

**Backend:**
```python
TickerService.validate_ticker_data(ticker_data)
TickerService.check_symbol_exists(db, symbol, exclude_id=None)
```

**Frontend:**
```javascript
validateTickerData(tickerData)
checkSymbolExists(symbol, existingTickers, excludeId)
```

#### קבצים שעודכנו:
1. `Backend/services/ticker_service.py` - הוספת ולידציה
2. `Backend/models/ticker.py` - אימות ייחודיות סימבול
3. `trading-ui/scripts/tickers.js` - הוספת ולידציה צד לקוח

#### קבועים שהוספו:
```python
# Backend Constants
VALID_TICKER_TYPES = ['stock', 'etf', 'crypto', 'forex', 'commodity']
MAX_SYMBOL_LENGTH = 10
MAX_NAME_LENGTH = 100
MAX_REMARKS_LENGTH = 500
CURRENCY_LENGTH = 3
```

#### דוגמאות שימוש:

**Backend:**
```python
# ולידציה של נתונים
data = {'symbol': 'AAPL', 'name': 'Apple Inc.', 'type': 'stock'}
validation = TickerService.validate_ticker_data(data)
if not validation['is_valid']:
    print(f"שגיאות: {validation['errors']}")

# בדיקת כפילות
exists = TickerService.check_symbol_exists(db, 'AAPL')

# יצירת טיקר חדש
ticker = Ticker(
    symbol="AAPL",
    name="Apple Inc.",
    type="stock",
    currency="USD",
    remarks="חברת טכנולוגיה אמריקאית"
)

# שימוש בפונקציות החדשות
print(ticker.display_name)  # "AAPL - Apple Inc."
print(ticker.is_active())   # True/False
print(ticker.get_linked_items_count())  # {'trades': 5, 'trade_plans': 2, ...}
```

**Frontend:**
```javascript
// ולידציה של נתונים
const tickerData = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    currency: 'USD'
};
const validation = validateTickerData(tickerData);
if (!validation.isValid) {
    console.log('שגיאות:', validation.errors);
}

// בדיקת כפילות
const exists = checkSymbolExists('AAPL', tickersList);

// שמירת טיקר חדש
await saveTicker();

// עדכון טיקר קיים
await updateTickerFromModal();
```

#### מבנה המודל המעודכן:

```python
class Ticker(BaseModel):
    """
    מודל טיקר - מייצג מניה, ETF, מטבע קריפטו או כל נכס פיננסי אחר
    
    Attributes:
        symbol (str): סימבול הטיקר - חייב להיות ייחודי, מקסימום 10 תווים
        name (str): שם החברה או הנכס - מקסימום 100 תווים
        type (str): סוג הנכס - stock, etf, crypto, forex, commodity
        remarks (str): הערות נוספות - מקסימום 500 תווים
        currency (str): מטבע הנכס - בדיוק 3 תווים
        active_trades (bool): האם יש טריידים פעילים
        
    Methods:
        display_name: שם תצוגה בפורמט "SYMBOL - Name"
        is_active: בדיקה האם הטיקר פעיל
        get_linked_items_count: ספירת פריטים מקושרים
    """
```

#### ולידציות שהוספו:

**Backend (Python/SQLAlchemy):**
- **סימבול**: שדה חובה, מקסימום 10 תווים, רק אותיות ומספרים באנגלית
- **שם**: מקסימום 100 תווים
- **סוג**: ערכים מותרים: `stock`, `etf`, `crypto`, `forex`, `commodity`
- **מטבע**: בדיוק 3 תווים (למשל: USD, ILS, EUR)
- **הערות**: מקסימום 500 תווים
- **ייחודיות**: סימבול חייב להיות ייחודי במערכת

**Frontend (JavaScript):**
- ולידציה זהה בצד הלקוח לפני שליחה לשרת
- בדיקת כפילות סימבול בזמן אמת
- הצגת שגיאות ואזהרות למשתמש

#### פונקציות ולידציה שהוספו:

**Backend:**
```python
TickerService.validate_ticker_data(ticker_data)
TickerService.check_symbol_exists(db, symbol, exclude_id=None)
```

**Frontend:**
```javascript
validateTickerData(tickerData)
checkSymbolExists(symbol, existingTickers, excludeId)
```

#### קבצים שעודכנו:
1. `Backend/services/ticker_service.py` - הוספת ולידציה
2. `Backend/models/ticker.py` - אימות ייחודיות סימבול
3. `trading-ui/scripts/tickers.js` - הוספת ולידציה צד לקוח

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

## 6. שיפור מערכת הפילטרים - 20.08.2025

### מטרה
שיפור מערכת הפילטרים עם תיקון פילטרי תאריכים מדויק.

### הבעיות שזוהו
1. **פילטר "שבוע" לא עבד נכון** - הציג נתונים מ-1970 במקום מלפני 7 ימים
2. **אי-עקביות בפילטרי תאריכים** - חלק מהפילטרים לא עבדו לפי ההגדרות הנכונות
3. **חוסר פילטר "השבוע"** - לא היה פילטר לשבוע קלנדרי (יום ראשון עד היום)

### הפתרון

#### שיפור פילטרי תאריכים:
- **פילטר "השבוע"**: מציג נתונים מיום ראשון האחרון ועד היום כולל (שבוע קלנדרי)
- **פילטר "שבוע"**: מציג נתונים מלפני 7 ימים ועד היום
- **פילטר "MTD"**: מציג נתונים מתחילת החודש הקלנדרי ועד היום
- **פילטר "30 יום"**: מציג נתונים מלפני 30 יום ועד היום
- **פילטר "60 יום"**: מציג נתונים מלפני 60 יום ועד היום
- **פילטר "90 יום"**: מציג נתונים מלפני 90 יום ועד היום
- **פילטר "שנה"**: מציג נתונים מלפני 365 ימים ועד היום
- **פילטר "YTD"**: מציג נתונים מתחילת השנה הקלנדרית ועד היום
- **פילטר "שנה קודמת"**: מציג נתונים מתחילת השנה הקלנדרית הקודמת ועד סופה

### שינויים שבוצעו

#### עדכון קבצי JavaScript:
- **`trading-ui/scripts/grid-filters.js`**:
  - שיפור פונקציה `getDateRange` עם לוגיקה מדויקת לכל פילטר תאריכים
  - תמיכה כפולה בפילטרים "השבוע" ו"שבוע" עם לוגיקה שונה
  - תיקון באג בפילטר "שבוע" שהציג נתונים מ-1970

- **`trading-ui/scripts/app-header.js`**:
  - הוספת פילטר "השבוע" לתפריט הפילטרים
  - עדכון סדר הפילטרים בתפריט

#### פונקציות משופרות:
```javascript
// פונקציה משופרת לחישוב טווחי תאריכים
getDateRange(dateRange)

// תמיכה בפילטרים "השבוע" ו"שבוע"
case 'השבוע': // שבוע קלנדרי - מיום ראשון האחרון ועד היום
case 'שבוע':  // 7 ימים אחורה - מלפני 7 ימים ועד היום
```

### בדיקות שבוצעו
- [x] בדיקת פילטר "השבוע" - עובד נכון עם שבוע קלנדרי
- [x] בדיקת פילטר "שבוע" - עובד נכון עם 7 ימים אחורה
- [x] בדיקת כל פילטרי התאריכים - עובדים לפי ההגדרות
- [x] בדיקת תאימות לאחור - פילטרים ישנים עובדים כרגיל

### קבצים שעודכנו
- ✅ `trading-ui/scripts/app-header.js` - הוספת פילטר "השבוע" לתפריט
- ✅ `trading-ui/scripts/grid-filters.js` - שיפור פונקציה `getDateRange` עם לוגיקה מדויקת

### תוצאות
- **דיוק פילטרים**: כל פילטרי התאריכים עובדים לפי ההגדרות הנכונות
- **תמיכה בשני סוגי שבוע**: שבוע קלנדרי ו-7 ימים אחורה
- **תיקון באגים**: פילטר "שבוע" עובד נכון
- **חוויית משתמש משופרת**: יותר אפשרויות פילטור מדויקות

## סיכום כללי

השינויים שבוצעו שיפרו את:
- **בהירות המבנה**: פחות בלבול בין שדות
- **עקביות הנתונים**: ערכים מוגדרים היטב
- **תחזוקתיות**: קוד נקי יותר
- **חוויית משתמש**: ממשק ברור יותר
- **תקפות המערכת**: איחוד סוגי טריידים לסטנדרט אחד
- **גמישות המסחר**: תמיכה ב-Long ו-Short
- **דיוק פילטרים**: פילטרי תאריכים מדויקים עם תמיכה בשני סוגי שבוע
- **תיקון באגים**: פילטר "שבוע" עובד נכון
- **מערכת מטבעות מרכזית**: נרמול נתונים עם טבלה נפרדת למטבעות
- **גמישות מטבעות**: קל להוסיף מטבעות חדשים ולעדכן שערים
- **תזרימי מזומנים מתקדמים**: תמיכה במטבעות, מקור נתונים ושערי חליפין
- **ממשק CRUD מלא למטבעות**: ניהול מטבעות עם ממשק גרפי נוח

### מצב נוכחי של המערכת (21.08.2025):
- ✅ **מערכת מטבעות מרכזית**: טבלה נפרדת עם API מלא
- ✅ **תזרימי מזומנים מתקדמים**: תמיכה מלאה במטבעות ומקור נתונים
- ✅ **CRUD מלא למטבעות**: ממשק גרפי לניהול מטבעות
- ✅ **אינטגרציה מלאה**: כל הרכיבים מחוברים ועובדים

כל השינויים בוצעו עם גיבוי מלא ותמיכה בשחזור במקרה הצורך.

## 7. מיגרציה למערכת מטבעות מרכזית - 21.08.2025

### מטרה
יצירת מערכת מטבעות מרכזית עם טבלה נפרדת למטבעות במקום שדות מטבע מפוזרים בטבלאות שונות.

### הבעיות שזוהו
1. **פיזור נתונים**: מטבעות מאוחסנים כטקסט בטבלאות שונות
2. **חוסר עקביות**: אין נרמול של נתוני מטבעות
3. **קושי בתחזוקה**: עדכון שערי מטבע דורש שינוי בקוד
4. **חוסר גמישות**: קשה להוסיף מטבעות חדשים

### הפתרון

#### יצירת טבלת מטבעות מרכזית:
```sql
CREATE TABLE currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    usd_rate DECIMAL(10,6) NOT NULL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### עדכון טבלאות קיימות:
1. **טבלת `accounts`**:
   - הוספת שדה `currency_id` (INTEGER, ForeignKey)
   - הסרת שדה `currency` (VARCHAR)
   - הוספת relationship לטבלת `currencies`

2. **טבלת `tickers`**:
   - הוספת שדה `currency_id` (INTEGER, ForeignKey)
   - הסרת שדה `currency` (VARCHAR)
   - הוספת relationship לטבלת `currencies`

3. **טבלת `cash_flows`**:
   - כבר עודכן לעבוד עם `currency_id`

### שינויים שבוצעו

#### קבצי מיגרציה חדשים:
- **`Backend/migrations/create_currencies_table.py`**: יצירת טבלת מטבעות
- **`Backend/migrations/update_accounts_currency.py`**: עדכון טבלת חשבונות
- **`Backend/migrations/update_tickers_currency.py`**: עדכון טבלת טיקרים
- **`add_currencies.py`**: הוספת מטבעות ראשוניים

#### מודלים חדשים/עודכנים:
- **`Backend/models/currency.py`**: מודל חדש למטבעות
- **`Backend/models/account.py`**: עדכון לעבוד עם `currency_id`
- **`Backend/models/ticker.py`**: עדכון לעבוד עם `currency_id`
- **`Backend/models/__init__.py`**: הוספת מודל Currency

#### שירותים חדשים/עודכנים:
- **`Backend/services/currency_service.py`**: שירות חדש למטבעות
- **`Backend/services/ticker_service.py`**: עדכון לעבוד עם `currency_id`
- **`Backend/services/__init__.py`**: הוספת CurrencyService

#### API Routes חדשים:
- **`Backend/routes/api/currencies.py`**: API חדש למטבעות
- **`Backend/app.py`**: רישום blueprint חדש

#### Frontend עודכן:
- **`trading-ui/scripts/accounts.js`**: עדכון לעבוד עם מערכת מטבעות חדשה
- **`trading-ui/scripts/tickers.js`**: עדכון לעבוד עם מערכת מטבעות חדשה
- **`trading-ui/accounts.html`**: עדכון טופסים
- **`trading-ui/tickers.html`**: עדכון טופסים

#### תיעוד:
- **`CURRENCY_MIGRATION_DOCUMENTATION.md`**: תיעוד מפורט של המיגרציה

### מטבעות ראשוניים שנוספו:
1. **USD** - דולר אמריקאי (שער: 1.000000)
2. **EUR** - אירו (שער: 0.850000)
3. **ILS** - שקל ישראלי (שער: 3.650000)

### יתרונות המערכת החדשה:
1. **נרמול נתונים**: מטבעות מאוחסנים בטבלה נפרדת
2. **גמישות**: קל להוסיף מטבעות חדשים
3. **עקביות**: כל הטבלאות משתמשות באותה מערכת מטבעות
4. **תחזוקה**: עדכון שער מטבע במקום אחד
5. **תאימות**: תמיכה במטבעות חדשים ללא שינוי קוד

### בדיקות שבוצעו
- [x] יצירת טבלת מטבעות
- [x] הוספת מטבעות ראשוניים
- [x] מיגרציה של נתוני חשבונות
- [x] מיגרציה של נתוני טיקרים
- [x] בדיקת API endpoints
- [x] בדיקת Frontend
- [x] בדיקת תאימות לאחור

### קבצים שנוצרו/עודכנו

#### נוצרו:
- `Backend/models/currency.py`
- `Backend/services/currency_service.py`
- `Backend/routes/api/currencies.py`
- `Backend/migrations/create_currencies_table.py`
- `Backend/migrations/update_accounts_currency.py`
- `Backend/migrations/update_tickers_currency.py`
- `add_currencies.py`
- `CURRENCY_MIGRATION_DOCUMENTATION.md`

#### עודכנו:
- `Backend/models/account.py`
- `Backend/models/ticker.py`
- `Backend/models/__init__.py`
- `Backend/services/__init__.py`
- `Backend/services/ticker_service.py`
- `Backend/models/swagger_models.py`
- `Backend/app.py`
- `trading-ui/scripts/accounts.js`
- `trading-ui/scripts/tickers.js`
- `trading-ui/accounts.html`
- `trading-ui/tickers.html`

### תוצאות
- **מערכת מטבעות מרכזית**: טבלה נפרדת למטבעות
- **נרמול נתונים**: מבנה נתונים תקין
- **API מלא**: endpoints למטבעות
- **Frontend מעודכן**: תמיכה במערכת החדשה
- **תאימות לאחור**: המערכת ממשיכה לעבוד עם נתונים קיימים

## 8. הרחבת מערכת תזרימי המזומנים - 21.08.2025

### מטרה
הוספת שדות חדשים לטבלת `cash_flows` לתמיכה במערכת מטבעות מרכזית ומקור הנתונים.

### השדות החדשים שנוספו

#### 1. מטבע הפעולה (`currency_id`)
- **סוג**: INTEGER, ForeignKey לטבלת `currencies`
- **מטרה**: קישור לטבלת המטבעות המרכזית
- **ברירת מחדל**: מזהה הדולר האמריקאי (USD)

#### 2. שער דולר ביום הפעולה (`usd_rate`)
- **סוג**: DECIMAL(10,6)
- **מטרה**: שמירת שער המטבע מול הדולר ביום הפעולה
- **ברירת מחדל**: 1.000000 (כרגע הרדקודד)
- **הערה**: בעתיד יתווסף עדכון אוטומטי של שערי חליפין

#### 3. מקור המידע (`source`)
- **סוג**: VARCHAR(20)
- **ערכים אפשריים**:
  - `manual` - הזנה ידנית (ברירת מחדל)
  - `file_import` - ייבוא מקובץ
  - `direct_import` - ייבוא ישיר מהברוקר
- **הערה**: כרגע נתמך רק `manual`, האחרים יתווספו בעתיד

#### 4. מזהה פעולה חיצוני (`external_id`)
- **סוג**: VARCHAR(100)
- **מטרה**: שמירת מזהה הרשומה אצל הברוקר (לייבוא עתידי)
- **ברירת מחדל**: '0' (לפעולות ידניות)

### שינויים שבוצעו

#### עדכון מודל:
- **`Backend/models/cash_flow.py`**: 
  - הוספת השדות החדשים
  - הוספת relationship לטבלת `currencies`

#### עדכון API:
- **`Backend/routes/api/cash_flows.py`**:
  - עדכון פונקציות GET לכלול נתוני מטבע
  - עדכון פונקציות POST/PUT לתמוך בשדות החדשים
  - שימוש ב-`joinedload` לטעינת נתוני מטבע

#### עדכון Frontend:
- **`trading-ui/cash_flows.html`**:
  - עדכון כותרות טבלה
  - הוספת שדות חדשים למודלי הוספה ועריכה
  - הוספת הערות מידע למשתמש
  
- **`trading-ui/scripts/cash_flows.js`**:
  - עדכון פונקציות שמירה ועדכון
  - הוספת טעינת מטבעות לדרופדאון
  - עדכון רינדור הטבלה

#### עדכון תפריט:
- **`trading-ui/scripts/app-header.js`**: הוספת קישור לדף תזרימי מזומנים

#### סקריפטי מיגרציה:
- **`update_cash_flows_table.py`**: הוספת השדות החדשים לטבלה קיימת
- **`add_cash_flows.py`**: עדכון סקריפט הנתונים לדוגמה

### בדיקות שבוצעו
- [x] הוספת שדות לטבלה
- [x] עדכון נתונים קיימים עם ברירות מחדל
- [x] בדיקת API endpoints
- [x] בדיקת Frontend
- [x] בדיקת טעינת מטבעות
- [x] בדיקת שמירה ועדכון

## 9. השלמת CRUD למטבעות - 21.08.2025

### מטרה
יצירת ממשק CRUD מלא למטבעות כחלק מהשלמת הרשימה המתוכננת.

### מה שבוצע

#### יצירת דף מטבעות:
- **`trading-ui/currencies.html`**:
  - דף HTML מלא למטבעות
  - טבלה עם כותרות: מזהה, סמל, שם, שער דולר, נוצר ב, פעולות
  - מודלים להוספה, עריכה ומחיקה
  - סיכום נתונים מותאם למטבעות
  - הערות מידע על מטבעות

#### יצירת JavaScript למטבעות:
- **`trading-ui/scripts/currencies.js`**:
  - פונקציות CRUD מלאות (Create, Read, Update, Delete)
  - טעינת נתונים מה-API
  - רינדור טבלה דינמי
  - עדכון סטטיסטיקות
  - ולידציה של נתונים

#### הוספת נתבים:
- **`Backend/app.py`**: הוספת `/currencies` ו-`/currencies.html`

#### הוספת קישור בתפריט:
- **`trading-ui/scripts/app-header.js`**: הוספת קישור אחרי "בסיס נתונים"

### תכונות הדף
- **הצגת מטבעות**: טבלה דינמית עם כל המטבעות
- **הוספת מטבע**: מודל עם שדות סמל, שם ושער דולר
- **עריכת מטבע**: מודל לעדכון פרטי מטבע קיים
- **מחיקת מטבע**: אישור מחיקה עם אזהרה
- **סטטיסטיקות**: סה"כ מטבעות, מטבע בסיס, שערים מקסימלי ומינימלי

### בדיקות שבוצעו
- [x] טעינת דף מטבעות
- [x] הצגת רשימת מטבעות
- [x] הוספת מטבע חדש
- [x] עריכת מטבע קיים
- [x] מחיקת מטבע
- [x] עדכון סטטיסטיקות
- [x] ולידציה של נתונים

### קבצים שנוצרו
- `trading-ui/currencies.html`
- `trading-ui/scripts/currencies.js`

### קבצים שעודכנו
- `Backend/app.py`
- `trading-ui/scripts/app-header.js`

### תוצאות
- **CRUD מלא למטבעות**: כל הפעולות זמינות
- **ממשק משתמש אינטואיטיבי**: דף מעוצב ונוח לשימוש
- **אינטגרציה מלאה**: מחובר למערכת הקיימת
- **תמיכה בתפריט**: נגיש מהתפריט הראשי
