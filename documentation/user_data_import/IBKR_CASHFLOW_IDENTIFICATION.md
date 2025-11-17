# זיהוי סוג תזרים ב-IBKR Import

## זיהוי סוג התזרים

### 1. לפי שם הסקציה (Section Name)

השדה הראשון בכל שורה בקובץ IBKR מגדיר את **שם הסקציה**:
- `Deposits & Withdrawals`
- `Interest`
- `Dividends`
- `Change in Dividend Accruals`
- `Withholding Tax`
- `Borrow Fee Details`
- `Stock Yield Enhancement Program Securities Lent Interest Details`
- `Transfers`
- `Cash Report`

המיפוי בין שם הסקציה ל-`cashflow_type` מוגדר ב-`CASHFLOW_SECTION_NAMES`:

```python
CASHFLOW_SECTION_NAMES = {
    'Deposits & Withdrawals': 'deposit_withdrawal',
    'Interest': 'interest',
    'Interest Accruals': 'interest_accrual',
    'Dividends': 'dividend',
    'Change in Dividend Accruals': 'dividend_accrual',
    'Withholding Tax': 'tax',
    'Borrow Fee Details': 'borrow_fee',
    'Stock Yield Enhancement Program Securities Lent Interest Details': 'syep_interest',
    'Transfers': 'transfer',
    'Cash Report': 'cash_report'
}
```

### 2. לוגיקה נוספת בתוך הסקציה

לאחר זיהוי הסקציה, יש לוגיקה נוספת ב-`_resolve_cashflow_type`:

#### Deposits & Withdrawals
- אם `amount > 0` → `deposit`
- אם `amount <= 0` → `withdrawal`

#### Interest
- בודק את השדות: `Description`, `Activity Description`, `Memo`, `Field Name`
- אם מכיל "stock yield enhancement" או "syep" → `syep_interest`
- אחרת → `interest`

#### Cash Report
- **חשוב**: סקציה זו משמשת רק להשוואה, לא ליצירת רשומות תזרים
- אם מגיעים לכאן, בודקים את `Activity Code` או `Activity Description`
- מדלגים על: `Cash FX Translation Gain/Loss`, `Trades (Sales/Purchase)`, `Commissions`

## תנאים לדילוג על שורה (רשומת מידע)

הפונקציה `_should_skip_cashflow_row` מדלגת על שורות שמתאימות לאחד מהתנאים הבאים:

### 1. שורות ריקות או עם ערכים ריקים
- שורה ריקה לחלוטין
- שורה שמכילה רק `--` או ערכים ריקים

### 2. שורות סיכום/סטטיסטיקה
השורה מדלגת אם הערך הראשון (הלא-ריק) מכיל אחד מהמילים הבאות:
- `header`
- `trailer`
- `subtotal`
- `ending`
- `starting`
- `total` (בתחילת או בסוף השורה)

### 3. דילוגים ספציפיים לסקציות

#### Dividends
- שורות שמכילות: `total`, `total in eur`

#### Borrow Fee Details
- שורות שמתחילות ב-`total`

#### Withholding Tax
- שורות שמתחילות ב-`total`

#### Starting Dividend Accrual
- שורות שמתחילות ב-`starting` ומכילות `dividend accrual`

### 4. מבנה השורה

שורה חייבת להתחיל בפורמט:
```
{Section Name},Data,{field1},{field2},...
```

שורות שמתחילות ב:
- `{Section Name},Header` - נדלגות (זו שורת כותרות)
- `{Section Name},Trailer` - נדלגות (סוף סקציה)
- `{Section Name},Total` - נדלגות (סיכום)
- `{Section Name},Subtotal` - נדלגות (סיכום ביניים)

## דוגמאות

### שורה תקינה - Dividend
```
Dividends,Data,2024-12-13,USD,49.00,SPY,Dividend
```
- Section: `Dividends` → `cashflow_type: 'dividend'`
- לא מכילה מילות דילוג → תתקבל

### שורה שתדלג - Total
```
Dividends,Total,2024-12-13,USD,303.20
```
- מכילה `total` → תדלג

### שורה שתדלג - Header
```
Interest,Header,Date,Currency,Amount,Description
```
- מתחילה ב-`Header` → תדלג

### שורה תקינה - SYEP Interest
```
Interest,Data,2024-12-04,EUR,0.38,Stock Yield Enhancement Program Interest
```
- Section: `Interest`
- מכילה "Stock Yield Enhancement" → `cashflow_type: 'syep_interest'`
- לא מכילה מילות דילוג → תתקבל

## קוד רלוונטי

- `_parse_cashflow_sections()` - מנתח את הסקציות
- `_should_skip_cashflow_row()` - בודק אם לדלג על שורה
- `_resolve_cashflow_type()` - מזהה את סוג התזרים
- `_build_cashflow_record()` - בונה את רשומת התזרים

