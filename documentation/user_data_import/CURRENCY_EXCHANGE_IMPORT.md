# ייבוא רשומות המרות מטבע - Currency Exchange Import

## סקירה כללית

מסמך זה מתאר את תהליך ייבוא רשומות המרות מטבע מקובץ IBKR, תוך עקיבה אחר המבנה של יצירה ידנית.

## מבנה סטנדרטי - עקוב אחר CashFlowService.create_exchange

רשומות המרות מטבע מיובאות במבנה זהה ליצירה ידנית באמצעות `CashFlowHelperService.create_exchange()`.

### מבנה זוג Exchange

כל המרת מטבע יוצרת **2 רשומות** בבסיס הנתונים:

#### FROM Record (ממטבע)
```python
CashFlow(
    type='currency_exchange_from',
    amount=-abs(from_amount),  # תמיד שלילי
    fee_amount=commission,  # עמלה מ-IBKR (רק ב-FROM)
    currency_id=from_currency_id,
    external_id=exchange_<uuid>,  # משותף עם TO
    date=date_value,
    description=description,
    source='file_import'
)
```

#### TO Record (למטבע)
```python
CashFlow(
    type='currency_exchange_to',
    amount=to_amount,  # תמיד חיובי
    fee_amount=0.0,  # תמיד 0
    currency_id=to_currency_id,
    external_id=exchange_<uuid>,  # משותף עם FROM
    date=date_value,  # זהה ל-FROM
    description=description,
    source='file_import'
)
```

## תהליך הייבוא

### שלב 1: זיהוי Forex בקובץ

**מיקום**: `IBKRConnector._parse_trades_section()`

**תנאים**:
- סקציה: "Trades"
- `Asset Category='Forex'`
- `DataDiscriminator='Order'`

**דוגמה**:
```
Trades,Data,Order,Forex,ILS.USD,2024-01-15,1000.00,0.27,270.00,0.50
```

### שלב 2: יצירת רשומות FROM/TO

**מיקום**: `IBKRConnector._build_forex_cashflows()`

**תהליך**:
1. יצירת 2 רשומות: FROM + TO
2. `cashflow_type='forex_conversion'` (לפני זיווג)
3. metadata מלא: `exchange_rate`, `source_currency`, `target_currency`, `quantity`, `symbol`

**דוגמה**:
```python
from_record = {
    'cashflow_type': 'forex_conversion',
    'amount': -1000.0,
    'currency': 'ILS',
    'metadata': {
        'source_currency': 'ILS',
        'target_currency': 'USD',
        'exchange_rate': 0.27,
        'quantity': 1000.0,
        'symbol': 'ILS.USD',
        'commission': 0.50
    }
}

to_record = {
    'cashflow_type': 'forex_conversion',
    'amount': 270.0,
    'currency': 'USD',
    'metadata': {
        'source_currency': 'ILS',
        'target_currency': 'USD',
        'exchange_rate': 0.27,
        'quantity': 1000.0,
        'symbol': 'ILS.USD'
    }
}
```

### שלב 3: זיווג ב-Preview

**מיקום**: `ImportOrchestrator._build_preview_payload()` (שורות 1497-1699)

**תהליך**:
1. זיהוי רשומות FROM ו-TO
2. זיווג לפי:
   - תאריך (זהה)
   - מטבעות (from_currency, to_currency)
   - exchange_rate (אם זמין)
   - asset_symbol (אם זמין) - המדד החזק ביותר
3. יצירת `external_id` משותף: `exchange_<uuid>`
4. עדכון metadata בשתי הרשומות

**דוגמה**:
```python
# לפני זיווג
from_record['external_id'] = 'cashflow_1_1'
to_record['external_id'] = 'cashflow_1_2'

# אחרי זיווג
from_record['external_id'] = 'exchange_abc123'
to_record['external_id'] = 'exchange_abc123'
from_record['metadata']['exchange_external_id'] = 'exchange_abc123'
to_record['metadata']['exchange_external_id'] = 'exchange_abc123'
```

### שלב 4: סינון לפי selected_types

**מיקום**: `ImportOrchestrator._build_preview_payload()` (שורות 1454-1495)

**תהליך**:
- אם `selected_types=['forex_conversion']`, שתי הרשומות (FROM + TO) נשארות
- אם לא, שתיהן מוסרות

### שלב 5: יצירה בבסיס הנתונים

**מיקום**: `ImportOrchestrator._execute_import_cashflows()` (שורות 2781-3033)

**תהליך**:
1. קיבוץ רשומות לפי `external_id` (exchange_*)
2. Validation של זוג (ImportValidator.validate_exchange_pair)
3. יצירה אטומית באמצעות `CashFlowHelperService.create_exchange()`

**דוגמה**:
```python
svc_result = CashFlowHelperService.create_exchange(
    db_session=self.db_session,
    trading_account_id=import_session.trading_account_id,
    from_currency_id=from_currency.id,
    to_currency_id=to_currency.id,
    date=date_value,
    from_amount=from_amount,  # מ-metadata.quantity או abs(amount)
    exchange_rate=exchange_rate,  # מ-metadata.exchange_rate
    fee_amount=fee_amount,  # מ-record.commission
    description=description,
    source='file_import'
)
```

## חישוב נכון

### חישוב to_amount

**נוסחה**: `to_amount = from_amount * exchange_rate`

**מקורות נתונים**:
- `from_amount`: מ-`metadata.quantity` (מועדף) או `abs(amount)`
- `exchange_rate`: מ-`metadata.exchange_rate` (מועדף) או `trade_price`

**דוגמה**:
```python
from_amount = 1000.0  # ILS
exchange_rate = 0.27  # ILS/USD
to_amount = 1000.0 * 0.27 = 270.0  # USD
```

### חישוב fee_amount

**מקור**: `record.commission` (מ-IBKR Comm/Fee field)

**נרמול**: אם `fee_amount < 0`, מנרמל ל-`0.0` (עם warning)

## Atomic Operations

**עקרון**: FROM + TO נוצרים יחד או לא נוצרים כלל.

**מימוש**: `CashFlowHelperService.create_exchange()` עושה commit רק אחרי יצירת שתי הרשומות.

**יתרונות**:
- אין מצב של FROM ללא TO או להיפך
- עקביות נתונים מובטחת
- Rollback אוטומטי במקרה של שגיאה

## Validation

**מיקום**: `ImportValidator.validate_exchange_pair()`

**בדיקות**:
1. FROM record: `type='currency_exchange_from'`, `amount < 0`
2. TO record: `type='currency_exchange_to'`, `amount > 0`
3. `external_id` זהה (אם קיים)
4. מטבעות שונים
5. Validation של כל רשומה בנפרד

## דוגמה מלאה

### קובץ IBKR
```
Trades,Data,Order,Forex,ILS.USD,2024-01-15,1000.00,0.27,270.00,0.50
```

### רשומות ב-Preview
```python
from_record = {
    'cashflow_type': 'forex_conversion',
    'storage_type': 'currency_exchange_from',
    'amount': -1000.0,
    'currency': 'ILS',
    'external_id': 'exchange_abc123',
    'metadata': {
        'source_currency': 'ILS',
        'target_currency': 'USD',
        'exchange_rate': 0.27,
        'quantity': 1000.0,
        'symbol': 'ILS.USD',
        'commission': 0.50
    }
}

to_record = {
    'cashflow_type': 'forex_conversion',
    'storage_type': 'currency_exchange_to',
    'amount': 270.0,
    'currency': 'USD',
    'external_id': 'exchange_abc123',
    'metadata': {
        'source_currency': 'ILS',
        'target_currency': 'USD',
        'exchange_rate': 0.27,
        'symbol': 'ILS.USD'
    }
}
```

### רשומות בבסיס הנתונים
```python
# FROM
CashFlow(
    id=1,
    type='currency_exchange_from',
    amount=-1000.0,
    fee_amount=0.50,
    currency_id=1,  # ILS
    external_id='exchange_abc123',
    date=2024-01-15
)

# TO
CashFlow(
    id=2,
    type='currency_exchange_to',
    amount=270.0,
    fee_amount=0.0,
    currency_id=2,  # USD
    external_id='exchange_abc123',
    date=2024-01-15
)
```

## קישורים רלוונטיים

- `Backend/services/cash_flow_service.py::create_exchange()` - יצירה ידנית
- `Backend/services/user_data_import/import_orchestrator.py::_execute_import_cashflows()` - ייבוא
- `Backend/connectors/user_data_import/ibkr_connector.py::_build_forex_cashflows()` - פרסור Forex
- `Backend/services/user_data_import/import_validator.py::validate_exchange_pair()` - Validation

