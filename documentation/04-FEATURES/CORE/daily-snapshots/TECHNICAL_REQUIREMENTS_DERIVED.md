# גזירת דרישות טכנולוגיות - מערכת שמירת מצב יומית
# Technical Requirements Derived from Interfaces

**תאריך יצירה:** 19 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ גזירה הושלמה  
**מטרה:** גזירת דרישות טכנולוגיות מהממשקים והמוקאפים

---

## 📋 סקירה כללית

מסמך זה מגזר את כל הדרישות הטכנולוגיות מהממשקים והמוקאפים:
- מיפוי נתונים נדרש
- מיפוי API נדרש
- מיפוי DB נדרש

---

## 📊 מיפוי נתונים נדרש

### 1. נתוני טריידים (Trade Data)

#### מממשק 1: היסטוריית טרייד

**נתונים נדרשים:**
- ✅ **תהליך טרייד:**
  - `plan_created_at` - תאריך יצירת תוכנית (אם יש)
  - `first_execution_at` - תאריך ביצוע ראשון
  - `executions` - רשימת כל הביצועים עם תאריכים
  - `closed_at` - תאריך סגירה
- ✅ **P/L יומי:**
  - `realized_pl_daily` - P/L ממומש יומי (array)
  - `unrealized_pl_daily` - P/L לא ממומש יומי (array)
  - `total_pl_daily` - P/L כולל יומי (array)
  - `dates` - תאריכים (array)
- ✅ **ביצועים:**
  - `executions` - רשימת ביצועים עם תאריכים
- ✅ **מחירי שוק יומיים:**
  - `market_prices_daily` - מחירי שוק יומיים (array)
  - `entry_prices` - מחירי כניסה (array)
  - `exit_prices` - מחירי יציאה (array)

**דרישות DB:**
- ✅ שמירת מצב טרייד יומי
- ✅ שמירת ביצועים יומיים
- ✅ שמירת מחירי שוק יומיים

---

### 2. נתוני פורטפוליו (Portfolio Data)

#### מממשק 2: מצב תיק היסטורי

**נתונים נדרשים:**
- ✅ **יתרות חשבון:**
  - `total_cash_balance` - יתרת מזומן כוללת
  - `cash_balance_by_account` - יתרות לפי חשבון (array)
- ✅ **פוזיציות:**
  - `positions` - רשימת פוזיציות (array):
    - `trading_account_id`
    - `ticker_id`
    - `quantity`
    - `direction` (long/short)
    - `average_price`
    - `market_value`
    - `realized_pl`
    - `unrealized_pl`
    - `total_pl`
- ✅ **שווי תיק:**
  - `total_portfolio_value` - שווי תיק כולל
  - `portfolio_value_history` - היסטוריית שווי תיק (array)
- ✅ **P/L:**
  - `total_realized_pl` - P/L ממומש כולל
  - `total_unrealized_pl` - P/L לא ממומש כולל
  - `total_pl` - P/L כולל
  - `pl_history` - היסטוריית P/L (array)

**דרישות DB:**
- ✅ שמירת מצב חשבונות יומי (קריטי!)
- ✅ שמירת מצב פוזיציות יומי (קריטי!)
- ✅ שמירת P/L מפורט יומי

---

### 3. נתוני מחירים (Price Data)

#### מממשק 3: היסטוריית מחירים

**נתונים נדרשים:**
- ✅ **מחירי שוק יומיים:**
  - `price_history` - היסטוריית מחירים (array):
    - `date`
    - `price`
    - `change_percentage`
    - `change_amount`
    - `volume` (אם זמין)
    - `high` (אם זמין)
    - `low` (אם זמין)
    - `open` (אם זמין)
- ✅ **אינדיקטורים:**
  - `daily_change` - שינוי יומי
  - `weekly_change` - שינוי שבועי
  - `monthly_change` - שינוי חודשי
  - `yearly_change` - שינוי שנתי

**דרישות DB:**
- ✅ שמירת מחירי שוק יומיים (היסטוריה)

---

### 4. נתוני ניתוח (Analysis Data)

#### מממשק 4: ניתוח השוואתי

**נתונים נדרשים:**
- ✅ **טריידים לפי קטגוריות:**
  - `investment_types` - סוגי השקעות
  - `trading_methods` - שיטות מסחר
  - `with_plan` - עם תוכנית
  - `without_plan` - בלי תוכנית
  - `time_to_entry` - משך זמן מתכנון לכניסה
- ✅ **P/L לפי קטגוריות:**
  - `comparisons` - רשימת השוואות (array):
    - `category`
    - `category_type`
    - `trades_count`
    - `average_pl`
    - `total_pl`
    - `success_rate`
    - `average_pl_per_trade`
    - `average_duration`

**דרישות DB:**
- ✅ שמירת מידע על תכניות (תאריכים, שיטות מסחר)
- ✅ שמירת מידע על טריידים (תאריכים, קטגוריות)

---

### 5. נתוני דשבורד (Dashboard Data)

#### מממשק 5: ווידג'ט היסטוריה

**נתונים נדרשים:**
- ✅ **קישורים מהירים:**
  - `yesterday_date` - תאריך אתמול
  - `active_trades_count` - מספר טריידים פעילים
  - `today_date` - תאריך היום
- ✅ **מיני-גרף:**
  - `weekly_pl` - P/L שבועי (array)
- ✅ **סטטיסטיקות:**
  - `today_pl` - P/L היום
  - `portfolio_value_change` - שינוי שווי תיק
  - `active_trades_count` - מספר טריידים פעילים

**דרישות DB:**
- ✅ שמירת נתונים יומיים (כבר נדרש למערכות אחרות)

---

### 6. נתוני השוואה (Comparison Data)

#### ממשק 6: מודל השוואת תאריכים

**נתונים נדרשים:**
- ✅ **השוואה בין תאריכים:**
  - `comparison` - נתוני השוואה:
    - `cash_balance` - יתרות
    - `portfolio_value` - שווי תיק
    - `realized_pl` - P/L ממומש
    - `unrealized_pl` - P/L לא ממומש
    - `total_pl` - P/L כולל
    - `positions_count` - מספר פוזיציות
- ✅ **מגמה בין התאריכים:**
  - `trend_data` - נתוני מגמה (array)

**דרישות DB:**
- ✅ שמירת נתונים יומיים (כבר נדרש למערכות אחרות)

---

## 🔌 מיפוי API נדרש

### API Endpoints לפי ממשק:

#### ממשק 1: היסטוריית טרייד

**Endpoints:**
1. ✅ `GET /api/trades/{trade_id}/history`
   - מטרה: קבלת כל נתוני ההיסטוריה של טרייד
   - Parameters: `trade_id` (path)
   - Response: כל נתוני הטרייד (timeline, P/L, ביצועים, מחירי שוק)

2. ✅ `GET /api/trades/{trade_id}/timeline`
   - מטרה: קבלת Timeline בלבד
   - Parameters: `trade_id` (path)
   - Response: Timeline של הטרייד

3. ✅ `GET /api/trades/{trade_id}/pl-history`
   - מטרה: קבלת היסטוריית P/L בלבד
   - Parameters: `trade_id` (path)
   - Response: היסטוריית P/L

---

#### ממשק 2: מצב תיק היסטורי

**Endpoints:**
1. ✅ `GET /api/portfolio/state/{date}`
   - מטרה: קבלת מצב התיק בתאריך מסוים
   - Parameters: `date` (path, YYYY-MM-DD)
   - Response: מצב תיק מלא (יתרות, פוזיציות, P/L, היסטוריה)

2. ✅ `GET /api/portfolio/positions/{date}`
   - מטרה: קבלת פוזיציות בלבד בתאריך מסוים
   - Parameters: `date` (path, YYYY-MM-DD)
   - Response: רשימת פוזיציות

3. ✅ `GET /api/portfolio/comparison`
   - מטרה: השוואה בין שני תאריכים
   - Parameters: `date1` (query), `date2` (query)
   - Response: נתוני השוואה

---

#### ממשק 3: היסטוריית מחירים

**Endpoints:**
1. ✅ `GET /api/tickers/{ticker_id}/price-history`
   - מטרה: קבלת היסטוריית מחירים של טיקר
   - Parameters: `ticker_id` (path), `start_date` (query), `end_date` (query)
   - Response: היסטוריית מחירים + אינדיקטורים

2. ✅ `GET /api/tickers/price-comparison`
   - מטרה: השוואה בין מספר טיקרים
   - Parameters: `ticker_ids` (query), `start_date` (query), `end_date` (query)
   - Response: היסטוריית מחירים לפי טיקר

---

#### ממשק 4: ניתוח השוואתי

**Endpoints:**
1. ✅ `GET /api/analysis/compare`
   - מטרה: השוואה כללית לפי פילטרים
   - Parameters: `start_date`, `end_date`, `investment_types`, `trading_methods`, `with_plan`, `without_plan`, `time_to_entry`
   - Response: רשימת השוואות

2. ✅ `GET /api/analysis/by-investment-type`
   - מטרה: ניתוח לפי סוגי השקעות
   - Parameters: `start_date`, `end_date`
   - Response: ניתוח לפי סוגי השקעות

3. ✅ `GET /api/analysis/by-trading-method`
   - מטרה: ניתוח לפי שיטות מסחר
   - Parameters: `start_date`, `end_date`
   - Response: ניתוח לפי שיטות מסחר

4. ✅ `GET /api/analysis/with-without-plan`
   - מטרה: ניתוח לפי עם/בלי תוכנית
   - Parameters: `start_date`, `end_date`
   - Response: ניתוח עם/בלי תוכנית

5. ✅ `GET /api/analysis/time-to-entry`
   - מטרה: ניתוח לפי משך זמן מתכנון לכניסה
   - Parameters: `start_date`, `end_date`
   - Response: ניתוח לפי משך זמן

---

#### ממשק 5: ווידג'ט היסטוריה

**Endpoints:**
1. ✅ `GET /api/dashboard/history-widget`
   - מטרה: קבלת כל נתוני הווידג'ט
   - Parameters: אין
   - Response: קישורים מהירים, מיני-גרף, סטטיסטיקות

---

#### ממשק 6: מודל השוואת תאריכים

**Endpoints:**
1. ✅ `GET /api/portfolio/comparison` (כבר מוגדר בממשק 2)
   - מטרה: השוואה בין שני תאריכים
   - Parameters: `date1`, `date2`
   - Response: נתוני השוואה + מגמה + התראות

---

## 🗄️ מיפוי DB נדרש

### טבלאות נדרשות:

#### 1. טבלת Snapshots יומיים (Daily Snapshots)

**מטרה:** שמירת מצב כללי יומי

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE, UNIQUE)
- `created_at` - תאריך יצירה
- `metadata` - מטא-דאטה (JSON)

**שימושים:**
- מעקב אחר snapshots שנוצרו
- מניעת כפילויות
- מטא-דאטה נוספת

---

#### 2. טבלת מצב חשבונות יומי (Daily Account States)

**מטרה:** שמירת מצב חשבונות בכל יום

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `trading_account_id` - מזהה חשבון מסחר
- `cash_balance` - יתרת מזומן (DECIMAL)
- `total_value` - שווי כולל (DECIMAL)
- `realized_pl` - P/L ממומש (DECIMAL)
- `unrealized_pl` - P/L לא ממומש (DECIMAL)
- `total_pl` - P/L כולל (DECIMAL)
- `created_at` - תאריך יצירה

**Indexes:**
- `(snapshot_date, trading_account_id)` - UNIQUE
- `snapshot_date` - INDEX
- `trading_account_id` - INDEX

**שימושים:**
- מצב תיק היסטורי
- השוואות בין תאריכים
- ווידג'ט היסטוריה

---

#### 3. טבלת מצב פוזיציות יומי (Daily Position States)

**מטרה:** שמירת מצב פוזיציות בכל יום (קריטי!)

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `trading_account_id` - מזהה חשבון מסחר
- `ticker_id` - מזהה טיקר
- `quantity` - כמות (DECIMAL)
- `direction` - כיוון (long/short) (VARCHAR)
- `average_price` - מחיר ממוצע (DECIMAL)
- `market_price` - מחיר שוק (DECIMAL)
- `market_value` - שווי שוק (DECIMAL)
- `realized_pl` - P/L ממומש (DECIMAL)
- `unrealized_pl` - P/L לא ממומש (DECIMAL)
- `total_pl` - P/L כולל (DECIMAL)
- `pl_percentage` - אחוז P/L (DECIMAL)
- `created_at` - תאריך יצירה

**Indexes:**
- `(snapshot_date, trading_account_id, ticker_id)` - UNIQUE
- `snapshot_date` - INDEX
- `trading_account_id` - INDEX
- `ticker_id` - INDEX

**שימושים:**
- מצב תיק היסטורי
- השוואות בין תאריכים
- ניתוח פוזיציות

---

#### 4. טבלת מצב טריידים יומי (Daily Trade States)

**מטרה:** שמירת מצב טריידים בכל יום

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `trade_id` - מזהה טרייד
- `status` - סטטוס (open/closed/cancelled) (VARCHAR)
- `realized_pl` - P/L ממומש (DECIMAL)
- `unrealized_pl` - P/L לא ממומש (DECIMAL)
- `total_pl` - P/L כולל (DECIMAL)
- `created_at` - תאריך יצירה

**Indexes:**
- `(snapshot_date, trade_id)` - UNIQUE
- `snapshot_date` - INDEX
- `trade_id` - INDEX

**שימושים:**
- היסטוריית טרייד
- ניתוח השוואתי

---

#### 5. טבלת מצב ביצועים יומי (Daily Execution States)

**מטרה:** שמירת מצב ביצועים בכל יום

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `execution_id` - מזהה ביצוע
- `trade_id` - מזהה טרייד
- `action` - פעולה (buy/sell/short/cover) (VARCHAR)
- `quantity` - כמות (DECIMAL)
- `price` - מחיר (DECIMAL)
- `fee` - עמלה (DECIMAL)
- `realized_pl` - P/L ממומש (DECIMAL)
- `mtm_pl` - P/L MTM (DECIMAL)
- `created_at` - תאריך יצירה

**Indexes:**
- `(snapshot_date, execution_id)` - UNIQUE
- `snapshot_date` - INDEX
- `execution_id` - INDEX
- `trade_id` - INDEX

**שימושים:**
- היסטוריית טרייד
- ניתוח ביצועים

---

#### 6. טבלת מחירי שוק יומיים (Daily Market Prices)

**מטרה:** שמירת מחירי שוק יומיים

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `ticker_id` - מזהה טיקר
- `price` - מחיר (DECIMAL)
- `change_percentage` - שינוי אחוז (DECIMAL)
- `change_amount` - שינוי סכום (DECIMAL)
- `volume` - נפח (DECIMAL, NULL)
- `high` - מחיר גבוה (DECIMAL, NULL)
- `low` - מחיר נמוך (DECIMAL, NULL)
- `open` - מחיר פתיחה (DECIMAL, NULL)
- `created_at` - תאריך יצירה

**Indexes:**
- `(snapshot_date, ticker_id)` - UNIQUE
- `snapshot_date` - INDEX
- `ticker_id` - INDEX

**שימושים:**
- היסטוריית מחירים
- היסטוריית טרייד
- ניתוח מחירים

---

#### 7. טבלת מצב תוכניות יומי (Daily Trade Plan States)

**מטרה:** שמירת מצב תוכניות בכל יום

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `trade_plan_id` - מזהה תוכנית
- `status` - סטטוס (VARCHAR)
- `created_at` - תאריך יצירה
- `first_execution_at` - תאריך ביצוע ראשון (DATETIME, NULL)
- `time_to_entry_days` - משך זמן מתכנון לכניסה (INTEGER, NULL)

**Indexes:**
- `(snapshot_date, trade_plan_id)` - UNIQUE
- `snapshot_date` - INDEX
- `trade_plan_id` - INDEX

**שימושים:**
- ניתוח השוואתי
- ניתוח משך זמן מתכנון לכניסה

---

#### 8. טבלת מצב שיטות מסחר יומי (Daily Trading Method States)

**מטרה:** שמירת מצב שיטות מסחר בכל יום

**שדות:**
- `id` - מזהה ייחודי
- `snapshot_date` - תאריך ה-snapshot (DATE)
- `trade_id` - מזהה טרייד
- `trade_plan_id` - מזהה תוכנית (NULL)
- `trading_method` - שיטת מסחר (VARCHAR)
- `investment_type` - סוג השקעה (VARCHAR)
- `has_plan` - יש תוכנית (BOOLEAN)
- `created_at` - תאריך יצירה

**Indexes:**
- `(snapshot_date, trade_id)` - UNIQUE
- `snapshot_date` - INDEX
- `trade_id` - INDEX
- `trading_method` - INDEX
- `investment_type` - INDEX

**שימושים:**
- ניתוח השוואתי
- חיתוכים לפי קטגוריות

---

## 📋 סיכום דרישות DB

### טבלאות נדרשות:

1. ✅ `daily_snapshots` - Snapshots יומיים
2. ✅ `daily_account_states` - מצב חשבונות יומי
3. ✅ `daily_position_states` - מצב פוזיציות יומי (קריטי!)
4. ✅ `daily_trade_states` - מצב טריידים יומי
5. ✅ `daily_execution_states` - מצב ביצועים יומי
6. ✅ `daily_market_prices` - מחירי שוק יומיים
7. ✅ `daily_trade_plan_states` - מצב תוכניות יומי
8. ✅ `daily_trading_method_states` - מצב שיטות מסחר יומי

### Indexes נדרשים:

- ✅ UNIQUE indexes למניעת כפילויות
- ✅ INDEXes לביצועים טובים
- ✅ Composite indexes לשאילתות מורכבות

---

## ✅ סיכום כללי

### נתונים נדרשים:
- ✅ נתוני טריידים (תהליך, P/L, ביצועים)
- ✅ נתוני פורטפוליו (יתרות, פוזיציות, שווי תיק)
- ✅ נתוני מחירים (היסטוריה, אינדיקטורים)
- ✅ נתוני ניתוח (קטגוריות, השוואות)
- ✅ נתוני דשבורד (קישורים, מיני-גרף, סטטיסטיקות)
- ✅ נתוני השוואה (בין תאריכים, מגמות)

### API Endpoints נדרשים:
- ✅ 15+ endpoints לפי ממשקים
- ✅ GET requests בלבד (read-only)
- ✅ Query parameters לפילטרים

### DB Tables נדרשות:
- ✅ 8 טבלאות חדשות
- ✅ Indexes לביצועים
- ✅ Foreign keys ליחסים

**הגזירה מוכנה לשלב הבא - עדכון ארכיטקטורה!**

---

**תאריך עדכון אחרון:** 19 ינואר 2025  
**גרסה:** 1.0  
**מחבר:** TikTrack Development Team

