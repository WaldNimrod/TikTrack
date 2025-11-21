# מיפוי נתונים למערכת שמירת מצב יומית
# Daily Snapshot Data Mapping Specification

**תאריך יצירה:** 19 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ מוכן ליישום  
**מטרה:** מיפוי מלא של כל הטבלאות והשדות שצריכים להישמר ב-snapshot יומי

---

## 📋 סקירה כללית

מסמך זה מגדיר בדיוק אילו נתונים יש לשמור בכל snapshot יומי, מדוע הם חשובים, ומה העדיפות שלהם.

---

## 🎯 קטגוריות עדיפות

### Priority 1: נתונים פיננסיים דינמיים (קריטי)
נתונים המשפיעים ישירות על מצב הפיננסי והחשבונות.

### Priority 2: נתוני שוק ומחירים (גבוה)
נתונים המשפיעים על חישובי P/L וערך פורטפוליו.

### Priority 3: תכניות מסחר והתראות (בינוני)
נתונים המשקפים פעילות מסחר ותכנון.

### Priority 4: נתונים סטטיסטיים מחושבים (נמוך)
סטטיסטיקות כוללות המחושבות מהנתונים הגולמיים.

---

## 📊 מיפוי מפורט לפי טבלאות

### 1. trading_accounts (Priority 1 - קריטי)

**סיבה:** יתרות ומצב חשבון משתנים יומית ומשפיעים על כל החישובים הפיננסיים.

#### שדות לשמירה:
```python
{
    'id': int,                    # מזהה חשבון (לצורך קישור)
    'cash_balance': float,        # יתרת מזומן נוכחית
    'opening_balance': float,     # יתרת פתיחה
    'total_value': float,         # ערך כולל (מזומן + פוזיציות)
    'total_pl': float,           # P/L כולל (אם מחושב)
    'status': str,                # סטטוס: 'open', 'closed', 'cancelled'
    'currency_id': int,           # מטבע בסיס (לצורך חישובים)
    'name': str                   # שם חשבון (לצורך תצוגה)
}
```

#### הערות:
- `cash_balance` - **חשוב:** זהו שדה deprecated, אבל עדיין קיים ב-DB. יש לחשב את היתרה האמיתית דרך `/api/account-activity/<account_id>/balances`
- `total_value` - ערך כולל = מזומן + שווי פוזיציות
- `total_pl` - שדה זה לא מתעדכן אוטומטית (מציג "בפיתוח" ב-UI), אבל אם יש ערך - יש לשמור אותו

#### תדירות שינוי:
- **יומי:** יתרות משתנות עם כל execution או cash_flow
- **תדיר:** status משתנה לעיתים רחוקות

---

### 2. trades (Priority 1 - קריטי)

**סיבה:** סטטוס טריידים ו-P/L משתנים יומית ומשפיעים על מצב הפורטפוליו.

#### שדות לשמירה:
```python
{
    'id': int,                    # מזהה טרייד
    'trading_account_id': int,    # חשבון מסחר (לצורך קישור)
    'ticker_id': int,             # טיקר (לצורך קישור)
    'status': str,                # סטטוס: 'open', 'closed', 'cancelled'
    'total_pl': float,           # P/L כולל של הטרייד
    'closed_at': datetime,        # תאריך סגירה (אם נסגר)
    'cancelled_at': datetime,     # תאריך ביטול (אם בוטל)
    'cancel_reason': str,         # סיבת ביטול
    'side': str,                  # 'Long' או 'Short'
    'investment_type': str,       # סוג השקעה: 'swing', 'day', etc.
    'trade_plan_id': int          # קישור לתכנית מסחר (אם קיים)
}
```

#### הערות:
- יש לשמור רק טריידים פעילים או כאלה שנסגרו/בוטלו ביום הנוכחי
- `total_pl` - P/L כולל (realized + unrealized אם מחושב)
- `status` - שינוי סטטוס הוא קריטי למעקב

#### תדירות שינוי:
- **יומי:** status ו-total_pl משתנים עם כל execution
- **תדיר:** closed_at/cancelled_at משתנים בעת סגירה/ביטול

---

### 3. executions (Priority 1 - קריטי)

**סיבה:** ביצועים חדשים משפיעים ישירות על מצב החשבון, יתרות, ופוזיציות.

#### שדות לשמירה:
```python
{
    'id': int,                    # מזהה ביצוע
    'trade_id': int,              # קישור לטרייד
    'trading_account_id': int,    # חשבון מסחר
    'ticker_id': int,             # טיקר
    'action': str,                # 'buy', 'sell', 'short', 'cover'
    'date': datetime,             # תאריך ביצוע
    'quantity': float,            # כמות
    'price': float,              # מחיר
    'fee': float,                # עמלה
    'realized_pl': int,          # Realized P/L (אם רלוונטי)
    'mtm_pl': int,               # MTM P/L (אם רלוונטי)
    'source': str,               # מקור: 'manual', 'api', 'file_import', etc.
    'external_id': str           # מזהה חיצוני
}
```

#### הערות:
- **חשוב:** יש לשמור רק executions שנוצרו או עודכנו ביום הנוכחי
- כל execution חדש משנה את מצב החשבון והפוזיציות
- `realized_pl` ו-`mtm_pl` - חשובים למעקב P/L

#### תדירות שינוי:
- **יומי:** executions חדשים נוצרים כל יום
- **תדיר:** עדכונים נדירים (רק תיקונים)

---

### 4. cash_flows (Priority 1 - קריטי)

**סיבה:** תזרימי מזומן משנים את יתרות החשבון ישירות.

#### שדות לשמירה:
```python
{
    'id': int,                    # מזהה תזרים
    'trading_account_id': int,    # חשבון מסחר
    'type': str,                  # סוג: 'deposit', 'withdrawal', 'fee', 'dividend', etc.
    'amount': float,              # סכום
    'fee_amount': float,          # עמלה (במטבע בסיס)
    'date': date,                 # תאריך
    'description': str,           # תיאור
    'currency_id': int,           # מטבע
    'usd_rate': decimal,         # שער המרה ל-USD
    'source': str,               # מקור: 'manual', 'file_import', etc.
    'trade_id': int              # קישור לטרייד (אם קיים)
}
```

#### הערות:
- **חשוב:** יש לשמור רק cash_flows שנוצרו ביום הנוכחי
- כל cash_flow משנה את יתרת החשבון
- `fee_amount` - עמלה במטבע בסיס של החשבון

#### תדירות שינוי:
- **יומי:** cash_flows חדשים נוצרים כל יום
- **תדיר:** עדכונים נדירים (רק תיקונים)

---

### 5. market_data_quotes (Priority 2 - גבוה)

**סיבה:** מחירים משתנים יומית ומשפיעים על חישובי P/L וערך פורטפוליו.

#### שדות לשמירה (לכל ticker פעיל):
```python
{
    'ticker_id': int,             # מזהה טיקר
    'last_price': float,        # מחיר אחרון
    'change_pct_day': float,     # שינוי אחוז יומי
    'change_amount_day': float,  # שינוי סכום יומי
    'volume': int,               # נפח מסחר
    'asof_utc': datetime,         # תאריך/שעה של הנתון
    'provider_id': int,          # ספק נתונים
    'currency': str,             # מטבע
    'is_stale': bool,            # האם נתון ישן
    'quality_score': float       # איכות נתון
}
```

#### הערות:
- **חשוב:** יש לשמור רק את המחיר האחרון לכל ticker פעיל (יש טריידים פתוחים)
- לא צריך לשמור את כל ההיסטוריה - רק snapshot של המחיר בסוף היום
- `is_stale` - חשוב לסמן אם הנתון לא מעודכן

#### תדירות שינוי:
- **יומי:** מחירים מתעדכנים כל יום
- **תדיר:** שינויים במהלך היום (אבל snapshot רק בסוף היום)

---

### 6. quotes_last (Priority 2 - גבוה)

**סיבה:** מחיר אחרון לכל טיקר - נתון מהיר לגישה.

#### שדות לשמירה:
```python
{
    'ticker_id': int,             # מזהה טיקר
    'last_price': float,         # מחיר אחרון
    'updated_at': datetime       # תאריך עדכון
}
```

#### הערות:
- טבלה קטנה - אפשר לשמור את כל הרשומות
- משמשת כגיבוי ל-market_data_quotes

#### תדירות שינוי:
- **יומי:** מתעדכן כל יום

---

### 7. trade_plans (Priority 3 - בינוני)

**סיבה:** סטטוס תכניות משתנה ומשקף פעילות תכנון.

#### שדות לשמירה:
```python
{
    'id': int,                    # מזהה תכנית
    'trading_account_id': int,    # חשבון מסחר
    'ticker_id': int,             # טיקר
    'status': str,                # סטטוס: 'open', 'closed', 'cancelled'
    'cancelled_at': datetime,     # תאריך ביטול (אם בוטלה)
    'cancel_reason': str,         # סיבת ביטול
    'planned_amount': float,      # סכום מתוכנן
    'entry_price': float,         # מחיר כניסה מתוכנן
    'side': str,                  # 'Long' או 'Short'
    'investment_type': str        # סוג השקעה
}
```

#### הערות:
- יש לשמור רק תכניות פעילות או כאלה שבוטלו ביום הנוכחי
- `status` - שינוי סטטוס הוא חשוב למעקב

#### תדירות שינוי:
- **יומי:** status משתנה בעת ביטול או סגירה
- **תדיר:** עדכונים אחרים נדירים

---

### 8. alerts (Priority 3 - בינוני)

**סיבה:** התראות מופעלות/מתעדכנות ומשקפות פעילות מערכת.

#### שדות לשמירה:
```python
{
    'id': int,                    # מזהה התראה
    'ticker_id': int,             # טיקר (אם קיים)
    'status': str,                # סטטוס: 'open', 'closed', 'triggered'
    'is_triggered': str,         # 'false', 'new', 'true'
    'triggered_at': datetime,     # תאריך הפעלה (אם הופעלה)
    'related_type_id': int,       # סוג ישות קשורה
    'related_id': int,            # מזהה ישות קשורה
    'condition_attribute': str,    # תכונת תנאי
    'condition_operator': str,    # אופרטור תנאי
    'condition_number': str,      # ערך תנאי
    'expiry_date': str            # תאריך תפוגה (אם קיים)
}
```

#### הערות:
- יש לשמור רק התראות פעילות או כאלה שהופעלו ביום הנוכחי
- `is_triggered` - חשוב למעקב הפעלות

#### תדירות שינוי:
- **יומי:** התראות מופעלות כל יום
- **תדיר:** עדכוני status נדירים

---

### 9. daily_statistics (Priority 4 - נמוך)

**סיבה:** סטטיסטיקות כוללות המחושבות מהנתונים הגולמיים.

#### שדות לשמירה (מחושבים):
```python
{
    'snapshot_date': date,                # תאריך snapshot
    'total_open_trades': int,             # מספר טריידים פתוחים
    'total_open_pl': float,               # סכום P/L פתוח כולל
    'total_portfolio_value': float,       # ערך פורטפוליו כולל
    'total_cash_flows_today': float,      # סכום תזרימי מזומן יומיים
    'total_active_plans': int,            # מספר תכניות פעילות
    'total_active_alerts': int,           # מספר התראות פעילות
    'total_accounts_open': int,           # מספר חשבונות פתוחים
    'total_accounts_value': float,        # ערך כולל של כל החשבונות
    'total_realized_pl': float,           # סכום P/L ממומש כולל
    'total_unrealized_pl': float          # סכום P/L לא ממומש כולל
}
```

#### הערות:
- כל הערכים מחושבים מהנתונים הגולמיים
- חשוב לשמור למעקב מגמות כוללות
- מאפשר השוואה מהירה בין ימים

#### חישוב:
```python
# דוגמה לחישוב
total_open_trades = count(trades WHERE status = 'open')
total_open_pl = sum(trades.total_pl WHERE status = 'open')
total_portfolio_value = sum(accounts.total_value)
total_cash_flows_today = sum(cash_flows.amount WHERE date = snapshot_date)
total_active_plans = count(trade_plans WHERE status = 'open')
total_active_alerts = count(alerts WHERE status = 'open')
total_accounts_open = count(trading_accounts WHERE status = 'open')
total_accounts_value = sum(trading_accounts.total_value WHERE status = 'open')
total_realized_pl = sum(executions.realized_pl WHERE date = snapshot_date)
total_unrealized_pl = calculate_from_positions()  # מחושב מ-PositionPortfolioService
```

---

## 🚫 טבלאות שלא נשמרות

### טבלאות סטטיות/תמיכה:
- `currencies` - נתונים סטטיים (לא משתנים)
- `tickers` - נתונים סטטיים (רק status משתנה, אבל לא קריטי ל-snapshot)
- `users` - נתוני הגדרות משתמש
- `preferences` - העדפות משתמש
- `notes` - הערות (נתוני תמיכה)
- `tags`, `tag_categories`, `tag_links` - תגיות (נתוני תמיכה)
- `constraints`, `enum_values` - הגדרות מערכת
- `external_data_providers` - הגדרות ספקי נתונים
- `trading_methods`, `method_parameters` - הגדרות שיטות מסחר
- `plan_conditions`, `trade_conditions` - הגדרות תנאים (לא מצב)
- `import_sessions` - לוגים של ייבוא (לא מצב)
- `note_relation_types` - הגדרות (סטטיות)

---

## 📈 סיכום לפי עדיפות

### Priority 1 (קריטי) - 4 טבלאות:
1. ✅ `trading_accounts` - יתרות ומצב חשבון
2. ✅ `trades` - סטטוס טריידים ו-P/L
3. ✅ `executions` - ביצועים חדשים
4. ✅ `cash_flows` - תזרימי מזומן

### Priority 2 (גבוה) - 2 טבלאות:
5. ✅ `market_data_quotes` - מחירי שוק
6. ✅ `quotes_last` - מחיר אחרון

### Priority 3 (בינוני) - 2 טבלאות:
7. ✅ `trade_plans` - תכניות מסחר
8. ✅ `alerts` - התראות

### Priority 4 (נמוך) - 1 טבלה:
9. ✅ `daily_statistics` - סטטיסטיקות מחושבות

---

## 🔄 תדירות שמירה

### יומי (כל יום בשעה 23:59):
- כל הטבלאות Priority 1-4

### תנאים:
- רק אם יש שינויים ביום הנוכחי
- או אם יש נתונים פעילים (טריידים פתוחים, תכניות פעילות, וכו')

---

## 💾 גודל משוער של Snapshot

### הערכה גסה:
- **trading_accounts:** ~13 חשבונות × ~200 bytes = ~2.6 KB
- **trades:** ~12 טריידים × ~300 bytes = ~3.6 KB
- **executions:** ~11 ביצועים × ~400 bytes = ~4.4 KB
- **cash_flows:** ~12 תזרימים × ~350 bytes = ~4.2 KB
- **market_data_quotes:** ~17 טיקרים × ~250 bytes = ~4.25 KB
- **quotes_last:** ~2 רשומות × ~150 bytes = ~0.3 KB
- **trade_plans:** ~18 תכניות × ~300 bytes = ~5.4 KB
- **alerts:** ~28 התראות × ~400 bytes = ~11.2 KB
- **daily_statistics:** 1 רשומה × ~500 bytes = ~0.5 KB

**סה"כ משוער:** ~36 KB ליום

**לשנה:** ~36 KB × 365 = ~13 MB
**לשנתיים:** ~26 MB

---

## ✅ סיכום

מסמך זה מגדיר בדיוק:
- ✅ אילו טבלאות לשמור
- ✅ אילו שדות בכל טבלה
- ✅ מדוע כל טבלה חשובה
- ✅ מה העדיפות של כל טבלה
- ✅ איך לחשב סטטיסטיקות

**המסמך מוכן ליישום!**

---

**תאריך עדכון אחרון:** 19 ינואר 2025  
**גרסה:** 1.0  
**מחבר:** TikTrack Development Team

