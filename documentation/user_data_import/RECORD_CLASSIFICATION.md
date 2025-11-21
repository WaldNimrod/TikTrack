# לוגיקת סיווג רשומות - Record Classification

## סקירה כללית

מסמך זה מתאר את הלוגיקה המרכזית לזיהוי וסיווג רשומות תזרימי מזומנים מקובץ IBKR.

## עקרונות יסוד

### כלל 1: עמודה שנייה חייבת להיות "Data"

**CRITICAL RULE**: רק שורות עם פורמט `{Section Name},Data,...` הן רשומות תקפות.

**דוגמאות**:
- ✅ `Dividends,Data,2024-01-15,100.00,USD` - רשומה תקפה
- ❌ `Dividends,Header,Date,Amount,Currency` - שורת כותרת, לא רשומה
- ❌ `Dividends,Trailer,Total,500.00` - שורת סיכום, לא רשומה
- ❌ `Dividends,Total,500.00` - שורת סיכום, לא רשומה

**מימוש**: `IBKRConnector._parse_cashflow_sections()` (שורה 442)
```python
if not stripped.startswith(f'{current_section},Data'):
    continue
```

### כלל 2: מיפוי ישיר משם סקציה ל-cashflow_type

**לוגיקה פשוטה**: שם הסקציה (עמודה ראשונה) ממפה ישירות ל-`cashflow_type` דרך `CASHFLOW_SECTION_NAMES`.

**מימוש**: `IBKRConnector._identify_record_type()`

## מיפוי סקציות

### CASHFLOW_SECTION_NAMES

```python
CASHFLOW_SECTION_NAMES = {
    'Deposits & Withdrawals': 'deposit_withdrawal',  # נפתר לפי סימן הסכום
    'Interest': 'interest',
    'Dividends': 'dividend',
    'Withholding Tax': 'tax',
    'Borrow Fee Details': 'borrow_fee',
    'Transfers': 'transfer',  # נפתר לפי סימן הסכום
    # סקציות שמוסרות (מחזירות None):
    # 'Change in Dividend Accruals' → None
    # 'Interest Accruals' → None
    # 'Stock Yield Enhancement Program Securities Lent Activity' → None
    # 'Stock Yield Enhancement Program Securities Lent Interest Details' → None
    # 'Cash Report' → None
}
```

## מקרים מיוחדים

### 1. Deposits & Withdrawals

**לוגיקה**: נפתר לפי סימן הסכום
- `amount > 0` → `deposit`
- `amount < 0` → `withdrawal`

**דוגמה**:
```python
row = {'Amount': '100.00'}
result = _identify_record_type('Deposits & Withdrawals', row)
# result = 'deposit'

row = {'Amount': '-100.00'}
result = _identify_record_type('Deposits & Withdrawals', row)
# result = 'withdrawal'
```

### 2. Interest vs SYEP Interest

**לוגיקה**: בדיקה אם התיאור מכיל "Stock Yield Enhancement" או "SYEP"
- אם כן → `None` (דילוג - כפילות של Interest הכללי)
- אם לא → `interest`

**דוגמה**:
```python
row = {'Description': 'Broker Interest Paid'}
result = _identify_record_type('Interest', row)
# result = 'interest'

row = {'Description': 'Stock Yield Enhancement Program Interest'}
result = _identify_record_type('Interest', row)
# result = None (skip)
```

### 3. Transfers

**לוגיקה**: נשאר `transfer` (סימן הסכום מציין כיוון)
- `amount > 0` → `transfer_in` (במיפוי storage)
- `amount < 0` → `transfer_out` (במיפוי storage)

### 4. Borrow Fee

**לוגיקה**: מחזיר `borrow_fee` (ממופה ל-`fee` במיפוי storage)

## סקציות שמוסרות

הסקציות הבאות **לא יוצרות רשומות** (מחזירות `None`):

1. **Change in Dividend Accruals** (`dividend_accrual`)
   - רשומות חשבונאיות, לא תזרימי מזומנים אמיתיים
   - מייצגות דיבידנדים שהוכרזו אך עדיין לא שולמו

2. **Interest Accruals** (`interest_accrual`)
   - רשומות חשבונאיות, לא תזרימי מזומנים אמיתיים

3. **Stock Yield Enhancement Program Securities Lent Activity** (`syep_activity`)
   - פעילות השאלה, לא תזרים מזומנים

4. **Stock Yield Enhancement Program Securities Lent Interest Details** (`syep_interest`)
   - כפילות של המידע ב-Interest הכללי

5. **Cash Report** (`cash_report`)
   - משמש רק להשוואת סיכומים, לא ליצירת רשומות

## Storage Type Mapping

לאחר זיהוי `cashflow_type`, הוא ממופה ל-`storage_type` (סוג בבסיס הנתונים):

```python
STORAGE_TYPE_MAPPING = {
    'deposit_withdrawal': lambda amount: 'deposit' if amount > 0 else 'withdrawal',
    'transfer': lambda amount: 'transfer_in' if amount > 0 else 'transfer_out',
    'borrow_fee': 'fee',
    'forex_conversion': ['currency_exchange_from', 'currency_exchange_to'],
    # שאר הסוגים ממופים 1:1
}
```

## דוגמאות

### דוגמה 1: Dividend

```
מקור בקובץ: Dividends,Data,2024-01-15,252.26,USD
↓
_identify_record_type('Dividends', row)
↓
cashflow_type = 'dividend'
storage_type = 'dividend'
```

### דוגמה 2: Deposit

```
מקור בקובץ: Deposits & Withdrawals,Data,2024-01-10,104102.70,USD
↓
_identify_record_type('Deposits & Withdrawals', row)  # amount > 0
↓
cashflow_type = 'deposit'
storage_type = 'deposit'
```

### דוגמה 3: Dividend Accrual (מוסר)

```
מקור בקובץ: Change in Dividend Accruals,Data,2024-01-05,737.35,USD
↓
_identify_record_type('Change in Dividend Accruals', row)
↓
cashflow_type = None (skip)
```

## קישורים רלוונטיים

- `Backend/connectors/user_data_import/ibkr_connector.py` - מימוש הלוגיקה
- `Backend/connectors/user_data_import/ibkr_connector.py::_identify_record_type()` - פונקציה מרכזית
- `Backend/connectors/user_data_import/ibkr_connector.py::_parse_cashflow_sections()` - פרסור סקציות

