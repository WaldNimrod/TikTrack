# מבנה רשומות תזרימי מזומנים לייבוא - Cash Flow Import Records Structure

## סקירה כללית

מסמך זה מתאר את המבנה המדויק של רשומות תזרימי מזומנים כפי שהן נשמרות לבסיס הנתונים לאחר תהליך הייבוא מקובץ IBKR Activity Statement.

## טבלת CashFlow - שדות בבסיס הנתונים

להלן השדות שנשמרים בטבלת `cash_flows`:

| שם שדה | סוג | חובה | תיאור |
|---------|-----|------|--------|
| `id` | Integer | כן (auto) | מזהה ייחודי |
| `trading_account_id` | Integer | כן | מזהה חשבון מסחר |
| `type` | String(50) | כן | סוג התזרים (ראה רשימה למטה) |
| `amount` | Float | כן | סכום התזרים (לא יכול להיות 0) |
| `fee_amount` | Float | כן | עמלה במטבע הבסיס של החשבון (ברירת מחדל: 0) |
| `date` | Date | לא | תאריך התזרים |
| `description` | String(5000) | לא | תיאור התזרים |
| `currency_id` | Integer | כן | מזהה מטבע (ברירת מחדל: 1 = USD) |
| `usd_rate` | Numeric(10,6) | כן | שער המרה ל-USD (ברירת מחדל: 1.0) |
| `source` | String(20) | כן | מקור הרשומה: 'manual', 'file_import', 'direct_import', 'api' |
| `external_id` | String(100) | כן | מזהה חיצוני (ברירת מחדל: '0') |
| `trade_id` | Integer | לא | קישור אופציונלי לעסקה |
| `created_at` | DateTime | כן (auto) | תאריך יצירה |
| `updated_at` | DateTime | כן (auto) | תאריך עדכון |

## סוגי תזרים (type)

הסוגים האפשריים:

- `deposit` - הפקדה
- `withdrawal` - משיכה
- `fee` - עמלה
- `dividend` - דיבידנד
- `interest` - ריבית
- `tax` - מס
- `transfer_in` - העברה פנימה
- `transfer_out` - העברה החוצה
- `currency_exchange_from` - המרת מטבע (ממטבע)
- `currency_exchange_to` - המרת מטבע (למטבע)
- `other_positive` - אחר חיובי
- `other_negative` - אחר שלילי
- `syep_interest` - ריבית SYEP

## מבנה הרשומות בתהליך הייבוא

### שלב 1: פרסור מהקובץ (IBKR Connector)

הקובץ נפרס לסקציות:

- `Deposits & Withdrawals` → `deposit` / `withdrawal`
- `Dividends` → `dividend`
- `Interest` → `interest`
- `Change in Dividend Accruals` → `dividend_accrual` → `other_positive`/`other_negative`
- `Withholding Tax` → `tax`
- `Borrow Fee Details` → `borrow_fee` → `fee`
- `Transfers` → `transfer_in` / `transfer_out`
- `Trades` (Forex rows) → `forex_conversion` → `currency_exchange_from` / `currency_exchange_to`
- `Stock Yield Enhancement Program Securities Lent Interest Details` → `syep_interest`

### שלב 2: Normalization & Validation

הרשומות עוברות:

- נרמול תאריכים
- אימות מטבעות
- אימות חשבונות
- בדיקת כפילויות

### שלב 3: Preview & Pairing

- זיווג רשומות Forex (FROM + TO)
- יצירת `external_id` משותף: `exchange_<uuid>`
- סינון לפי `selected_types` (אם נבחר)

### שלב 4: Import Execution

הרשומות נשמרות לבסיס הנתונים עם:

#### רשומות רגילות (לא Forex)

```python
CashFlow(
    trading_account_id=import_session.trading_account_id,
    type=storage_type,  # e.g., 'dividend', 'deposit', etc.
    amount=amount,  # Float
    fee_amount=0.0,  # For regular cashflows
    date=effective_date,  # Date object
    description=description,  # Built from memo, target_account, asset_symbol, mapping_note
    currency_id=currency_id,  # From Currency table
    usd_rate=usd_rate,  # From Currency.usd_rate
    source='file_import',
    external_id=external_id,  # Unique per record
    trade_id=None
)
```

#### רשומות Forex (Exchange)

```python
# FROM record
CashFlow(
    trading_account_id=import_session.trading_account_id,
    type='currency_exchange_from',
    amount=-from_amount,  # Negative (outgoing)
    fee_amount=fee_amount,  # Commission from IBKR
    date=date_value,
    description=description,
    currency_id=from_currency.id,
    usd_rate=from_currency.usd_rate,
    source='file_import',
    external_id=exchange_id,  # Shared with TO record: 'exchange_<uuid>'
    trade_id=None
)

# TO record
CashFlow(
    trading_account_id=import_session.trading_account_id,
    type='currency_exchange_to',
    amount=to_amount,  # Positive (incoming)
    fee_amount=0.0,  # Fee only on FROM
    date=date_value,  # Same as FROM
    description=description,
    currency_id=to_currency.id,
    usd_rate=to_currency.usd_rate,
    source='file_import',
    external_id=exchange_id,  # Shared with FROM record
    trade_id=None
)
```

## דוגמאות מהקובץ

### דוגמה 1: Dividend

```
מקור בקובץ: Dividends section
cashflow_type: 'dividend'
storage_type: 'dividend'
amount: 252.26
currency: 'USD'
effective_date: 2024-XX-XX
description: "מקור תזרים: Dividend"
```

### דוגמה 2: Forex Conversion

```
מקור בקובץ: Trades section (Forex row)
cashflow_type: 'forex_conversion'
storage_type: 'currency_exchange_from' / 'currency_exchange_to'
amount: -1000.0 / 3700.0 (FROM/TO)
currency: 'ILS' / 'USD'
effective_date: 2024-XX-XX
external_id: 'exchange_abc123...' (shared)
fee_amount: 0.5 (only on FROM)
metadata: {
    'exchange_rate': 3.7,
    'quantity': 1000,
    'source_currency': 'ILS',
    'target_currency': 'USD',
    'symbol': 'ILS.USD'
}
```

### דוגמה 3: Deposit

```
מקור בקובץ: Deposits & Withdrawals section
cashflow_type: 'deposit'
storage_type: 'deposit'
amount: 104102.70
currency: 'USD'
effective_date: 2024-XX-XX
description: "מקור תזרים: Deposit"
```

### דוגמה 4: Dividend Accrual

```
מקור בקובץ: Change in Dividend Accruals section
cashflow_type: 'dividend_accrual'
storage_type: 'other_positive' / 'other_negative'
amount: 737.35
currency: 'USD'
effective_date: 2024-XX-XX
description: "מקור תזרים: Dividend accrual"
⚠️ הערה: רשומות אלו מייצגות דיבידנדים שהוכרזו אך עדיין לא שולמו
```

## מיפוי Cash Report → Import Records

### פעילויות ב-Cash Report שלא מיובאות

- **Trades (Sales)** / **Trades (Purchase)** - אלה חלק מעסקאות, לא תזרימי מזומנים
- **Cash FX Translation Gain/Loss** - רווח/הפסד לא ממומש, לא תזרים מזומנים
- **Commissions** - כלולות ב-executions או ב-forex_conversion, לא נפרדות

### פעילויות ב-Cash Report שמיובאות

- **Deposits** → `deposit`
- **Account Transfers** → `transfer_in` / `transfer_out`
- **Dividends** → `dividend`
- **Payment In Lieu of Dividends** → `dividend`
- **Broker Interest Paid and Received** → `interest`
- **Withholding Tax** → `tax`

### פעילויות שמיובאות אבל לא ב-Cash Report

- **Forex Conversions** - חלק מ-"Trades" section
- **Dividend Accruals** - רשומות חשבונאיות, לא תזרימי מזומנים
- **Interest Accruals** - רשומות חשבונאיות, לא תזרימי מזומנים
- **SYEP Interest** - עשוי להיות כלול ב-"Broker Interest"

## מבנה CSV לייצוא

אם תרצה לייצא את הרשומות לקובץ CSV, השדות הבאים מייצגים את המידע שיישמר:

```csv
record_index,cashflow_type,storage_type,amount,currency,effective_date,description,source_account,target_account,asset_symbol,memo,external_id,section,mapping_note,quantity,trade_price,commission,source_currency,target_currency,exchange_rate,metadata_json,is_exchange_from,is_exchange_to,exchange_external_id
```

## הערות חשובות

1. **Forex Records**: כל רשומת Forex יוצרת 2 רשומות בבסיס הנתונים (FROM + TO) עם אותו `external_id`
2. **Fee Amount**: עמלות נשמרות רק ב-FROM record של Forex, לא ב-TO
3. **Description**: נבנה מ-memo, target_account, asset_symbol, ו-mapping_note
4. **Source**: תמיד 'file_import' לרשומות מיובאות
5. **External ID**: ייחודי לכל רשומה, חוץ מ-Forex שזוגות חולקים אותו
6. **Dividend Accruals**: נשמרים כ-`other_positive`/`other_negative` עם הערה

## קישורים רלוונטיים

- `Backend/models/cash_flow.py` - מודל CashFlow
- `Backend/services/cash_flow_service.py` - שירות יצירת תזרימים
- `Backend/services/user_data_import/import_orchestrator.py` - תהליך הייבוא
- `Backend/connectors/user_data_import/ibkr_connector.py` - פרסור קובץ IBKR

