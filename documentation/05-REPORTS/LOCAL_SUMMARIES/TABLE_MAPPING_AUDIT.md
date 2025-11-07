# Table Mapping Audit Report
## דוח סריקה מקיפה של מיפוי טבלאות - TikTrack

**תאריך:** 2025-01-27  
**מטרה:** סריקה מקיפה של כל הטבלאות בממשק והשוואה למיפוי הקיים

---

## 1. רשימת טבלאות בממשק (HTML + JavaScript דינמי)

### 1.1 טבלאות ב-HTML (עמודים ראשיים)

#### trades.html
- **טבלה:** `trades`
- **מספר עמודות:** 13 עמודות + actions = 14
- **עמודות בפועל:**
  1. טיקר (ticker_symbol) - index 0
  2. מחיר (current_price) - index 1
  3. שינוי (daily_change) - index 2
  4. פוזיציה (position_quantity) - index 3
  5. P/L% (position_pl_percent) - index 4
  6. P/L (position_pl_value) - index 5
  7. סטטוס (status) - index 6
  8. סוג (investment_type) - index 7
  9. צד (side) - index 8
  10. תוכנית (trade_plan_id) - index 9
  11. חשבון מסחר (account_name) - index 10
  12. נוצר ב (created_at) - index 11
  13. נסגר ב (closed_at) - index 12
  14. פעולות (actions) - לא ממופה

#### trade_plans.html
- **טבלה:** `trade_plans`
- **מספר עמודות:** 11 עמודות + actions = 12
- **עמודות בפועל:**
  1. טיקר (ticker_symbol) - index 0
  2. תאריך (created_at) - index 1
  3. סוג (investment_type) - index 2
  4. צד (side) - index 3
  5. כמות (quantity) - index 4
  6. מחיר (target_price) - index 5
  7. השקעה (planned_amount) - index 6
  8. סטטוס (status) - index 7
  9. סיכוי (reward) - index 8
  10. סיכון (risk) - index 9
  11. יחס (ratio) - index 10
  12. פעולות (actions) - לא ממופה

#### alerts.html
- **טבלה:** `alerts`
- **מספר עמודות:** 8 עמודות (כולל actions)
- **עמודות בפועל:**
  1. קשור ל (related_object) - index 0
  2. טיקר (ticker_symbol) - index 1
  3. תנאי (condition) - index 2
  4. סטטוס (status) - index 3
  5. הופעל (is_triggered) - index 4
  6. תנאי (condition_source) - index 5
  7. נוצר ב (created_at) - index 6
  8. תאריך תפוגה (expiry_date) - index 7
  9. פעולות (actions) - לא ממופה

#### tickers.html
- **טבלה:** `tickers`
- **מספר עמודות:** 9 עמודות (כולל actions)
- **עמודות בפועל:**
  1. שם הטיקר (symbol) - index 0
  2. מחיר נוכחי (current_price) - index 1
  3. שינוי יומי (change_percent) - index 2
  4. נפח (volume) - index 3
  5. סטטוס (status) - index 4
  6. סוג (type) - index 5
  7. שם החברה (name) - index 6
  8. מטבע (currency_id) - index 7
  9. עודכן ב (yahoo_updated_at) - index 8
  10. פעולות (actions) - לא ממופה

#### executions.html
- **טבלה:** `executions`
- **מספר עמודות:** 11 עמודות + actions = 12
- **עמודות בפועל:**
  1. טיקר (ticker_symbol) - index 0
  2. פעולה (action) - index 1
  3. חשבון מסחר (account_name) - index 2
  4. כמות (quantity) - index 3
  5. מחיר (price) - index 4
  6. P&L (pl) - index 5
  7. Realized P/L (realized_pl) - index 6
  8. MTM P/L (mtm_pl) - index 7
  9. תאריך (date) - index 8
  10. מקור (source) - index 9
  11. הערות (notes) - index 10
  12. פעולות (actions) - לא ממופה

#### cash_flows.html
- **טבלה:** `cash_flows`
- **מספר עמודות:** 7 עמודות (כולל actions)
- **עמודות בפועל:**
  1. חשבון מסחר (account_name) - index 0
  2. סוג (type) - index 1
  3. סכום (amount) - index 2
  4. תאריך (date) - index 3
  5. תיאור (description) - index 4
  6. מקור (source) - index 5
  7. פעולות (actions) - לא ממופה

#### notes.html
- **טבלה:** `notes`
- **מספר עמודות:** 5 עמודות (כולל actions)
- **עמודות בפועל:**
  1. קשור ל (related_object) - index 0
  2. תוכן (content) - index 1
  3. נוצר ב (created_at) - index 2
  4. קובץ מצורף (attachment) - index 3
  5. פעולות (actions) - לא ממופה

#### trading_accounts.html
**מספר טבלאות:** 4 טבלאות

##### טבלה 1: accounts
- **טבלה:** `accounts`
- **מספר עמודות:** 7 עמודות (כולל actions)
- **עמודות בפועל:**
  1. שם החשבון מסחר (name) - index 0
  2. מטבע (currency_id) - index 1
  3. יתרה (cash_balance) - index 2
  4. פוזיציות (positions_count) - index 3
  5. רווח/הפסד (total_pl) - index 4
  6. סטטוס (status) - index 5
  7. פעולות (actions) - לא ממופה

##### טבלה 2: account_activity
- **טבלה:** `account_activity` ⚠️ **חסר במיפוי!**
- **מספר עמודות:** 8 עמודות (כולל actions)
- **עמודות בפועל:**
  1. תאריך (date) - index 0
  2. סוג (type) - index 1
  3. תת-סוג (subtype) - index 2
  4. טיקר (ticker) - index 3
  5. סכום (amount) - index 4
  6. מטבע (currency) - index 5
  7. יתרה שוטפת (balance) - index 6
  8. פעולות (actions) - לא ממופה

##### טבלה 3: positions
- **טבלה:** `positions`
- **מספר עמודות:** 9 עמודות (כולל actions)
- **עמודות בפועל:**
  1. סימבול (ticker_symbol) - index 0
  2. נוכחי (ticker_name) - index 1
  3. כמות (quantity) - index 2
  4. צד (side) - index 3
  5. מחיר ממוצע (average_price_net) - index 4
  6. שווי שוק (market_value) - index 5
  7. רווח/הפסד לא מוכר (unrealized_pl) - index 6
  8. אחוז מהחשבון (percent_of_account) - index 7
  9. פעולות (actions) - לא ממופה

##### טבלה 4: portfolio
- **טבלה:** `portfolio`
- **מספר עמודות:** 10 עמודות (כולל actions)
- **עמודות בפועל:**
  1. חשבון (account_name) - index 0
  2. סימבול (ticker_symbol) - index 1
  3. נוכחי (ticker_name) - index 2
  4. כמות (quantity) - index 3
  5. צד (side) - index 4
  6. מחיר ממוצע (average_price_net) - index 5
  7. שווי שוק (market_value) - index 6
  8. רווח/הפסד לא מוכר (unrealized_pl) - index 7
  9. אחוז מהפורטפוליו (percent_of_portfolio) - index 8
  10. פעולות (actions) - לא ממופה

### 1.2 טבלאות דינמיות (JavaScript)

#### entity-details-renderer.js
- **טבלה:** `linked_items`
- **מספר עמודות:** 4 עמודות (כולל actions)
- **עמודות בפועל:**
  1. מקושר ל (linked_to) - index 0
  2. סטטוס (status) - index 1
  3. תאריך (created_at) - index 2
  4. פעולות (actions) - לא ממופה

#### positions-portfolio.js
- **טבלה:** `position_executions`
- **מספר עמודות:** 6 עמודות (ללא actions)
- **עמודות בפועל:**
  1. תאריך (date) - index 0
  2. פעולה (action) - index 1
  3. כמות (quantity) - index 2
  4. מחיר (price) - index 3
  5. עמלה (fee) - index 4
  6. סה"כ (total) - index 5

---

## 2. רשימת טבלאות במיפוי (table-mappings.js)

### 2.1 טבלאות ראשיות (13)
1. `trade_plans` - 11 עמודות
2. `trades` - 13 עמודות
3. `accounts` - 10 עמודות
4. `trading_accounts` - 10 עמודות
5. `tickers` - 9 עמודות
6. `linked_items` - 3 עמודות
7. `tickers_summary` - 6 עמודות ⚠️ **לא נמצא ב-HTML**
8. `executions` - 11 עמודות
9. `cash_flows` - 11 עמודות
10. `alerts` - 8 עמודות
11. `notes` - 4 עמודות
12. `positions` - 8 עמודות
13. `portfolio` - 9 עמודות
14. `position_executions` - 6 עמודות

### 2.2 טבלאות Legacy (8) ⚠️ **להסרה**
1. `trades_legacy`
2. `executions_legacy`
3. `alerts_legacy`
4. `cash_flows_legacy`
5. `tickers_legacy`
6. `accounts_legacy`
7. `trade_plans_legacy`
8. `notes_legacy`

### 2.3 טבלאות מערכת (3) ✅ **לשמור**
1. `designs` - 6 עמודות
2. `currencies` - 6 עמודות
3. `note_relation_types` - 3 עמודות

### 2.4 טבלאות בדיקה (3) ⚠️ **לבדוק**
1. `test_trades` - 8 עמודות
2. `test_general` - 6 עמודות
3. `test_notifications` - 6 עמודות

---

## 3. השוואה וזיהוי בעיות

### 3.1 טבלאות חסרות במיפוי
1. ⚠️ **`account_activity`** - קיימת ב-HTML, חסרה במיפוי!

### 3.2 טבלאות מיותרות במיפוי
1. ⚠️ **`tickers_summary`** - לא נמצאה ב-HTML, להסרה אם לא בשימוש
2. ⚠️ **8 טבלאות Legacy** - להסרה לפי הוראות
3. ⚠️ **טבלאות בדיקה** - לבדוק אם קיימות בעמודים

### 3.3 טבלאות עם אי-התאמות במספר עמודות
- **`accounts`**: בממשק 7 עמודות, במיפוי 10 עמודות
- **`trading_accounts`**: בממשק 7 עמודות, במיפוי 10 עמודות
- **`executions`**: בממשק 12 עמודות, במיפוי 11 עמודות
- **`cash_flows`**: בממשק 7 עמודות, במיפוי 11 עמודות

---

## 4. סיכום

### סטטיסטיקות
- **טבלאות בממשק:** 13 טבלאות (11 ב-HTML + 2 דינמיות)
- **טבלאות במיפוי:** 28 טבלאות (13 ראשיות + 8 Legacy + 3 מערכת + 3 בדיקה + 1 נוספת)
- **טבלאות חסרות:** 1 (`account_activity`)
- **טבלאות מיותרות:** 8 Legacy + 1 (`tickers_summary`) + 3 בדיקה (אם לא בשימוש)
- **טבלאות עם אי-התאמות:** 4 טבלאות

### פעולות נדרשות
1. ✅ הוספת מיפוי ל-`account_activity`
2. ✅ הסרת 8 טבלאות Legacy
3. ✅ בדיקה והסרה של `tickers_summary` אם לא בשימוש
4. ✅ בדיקה והסרה של טבלאות בדיקה אם לא קיימות
5. ✅ תיקון אי-התאמות במספר עמודות
6. ✅ בדיקה מדויקת של כל טבלה טבלה

---

**הערה:** דוח זה מהווה בסיס לשלבי התיקון הבאים.

