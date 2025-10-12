# מדריך Relationships ב-API - TikTrack
תאריך: 9 באוקטובר 2025

## 🎯 מטרה
מסמך זה מתעד את כל השדות המורחבים (relationship data) שכל API מחזיר, כדי לאפשר תצוגה ברורה בטבלאות ללא IDs.

## 📋 עקרונות כלליים

### 1. Eager Loading
כל API שמחזיר רשימות (GET all) משתמש ב-`joinedload()` לטעינת relationships:
```python
trades = db.query(Trade).options(
    joinedload(Trade.account),
    joinedload(Trade.ticker)
).all()
```

### 2. Model to_dict()
המודלים בודקים אם relationship נטען ומוסיפים שדות נוספים:
```python
if hasattr(self, 'ticker') and self.ticker:
    result['ticker_symbol'] = self.ticker.symbol
```

### 3. API Enhancement
ה-API יכול גם להוסיף שדות נוספים לאחר to_dict():
```python
for item in items:
    item_dict = item.to_dict()
    item_dict['extra_field'] = ...
```

## 📊 מפת Relationships לפי Entity

### 1. Trade (עסקאות)

**API**: `GET /api/trades/`

**שדות בסיסיים**:
- `id`, `status`, `investment_type`, `side`, `total_pl`, `notes`
- `created_at`, `closed_at`, `cancelled_at`

**שדות מורחבים** (relationships):
- `ticker_symbol` - סימבול הטיקר (string) - דוגמה: "AAPL"
- `account_name` - שם החשבון (string) - דוגמה: "Interactive Brokers"
- `current_price` - מחיר נוכחי (מנתוני שוק חיצוניים)
- `daily_change` - שינוי יומי באחוזים
- `change_amount` - שינוי יומי בסכום

**דוגמת response**:
```json
{
  "id": 15,
  "ticker_id": 5,
  "ticker_symbol": "AAPL",
  "trading_account_id": 2,
  "account_name": "Interactive Brokers",
  "status": "open",
  "side": "Long",
  "current_price": 175.50,
  "daily_change": 2.3
}
```

### 2. Execution (ביצועי עסקאות)

**API**: `GET /api/executions/`

**שדות בסיסיים**:
- `id`, `trade_id`, `action`, `quantity`, `price`, `fee`, `notes`
- `date`, `created_at`

**שדות מורחבים** (relationships):
- `trade_ticker_symbol` - סימבול הטיקר של הטרייד
- `trade_side` - צד הטרייד (Long/Short)
- `trade_date` - תאריך הטרייד (פורמט: dd/MM/yyyy)
- `trade_display` - תצוגה מעוצבת: **"AAPL | 15/01/2025 | Long"**

**דוגמת response**:
```json
{
  "id": 42,
  "trade_id": 15,
  "trade_ticker_symbol": "AAPL",
  "trade_side": "Long",
  "trade_date": "15/01/2025",
  "trade_display": "AAPL | 15/01/2025 | Long",
  "action": "buy",
  "quantity": 100,
  "price": 175.50
}
```

### 3. TradePlan (תוכניות מסחר)

**API**: `GET /api/trade_plans/`

**שדות בסיסיים**:
- `id`, `status`, `investment_type`, `side`
- `planned_amount`, `stop_price`, `target_price`, `current_price`
- `stop_percentage`, `target_percentage` (computed)
- `created_at`, `cancelled_at`

**שדות מורחבים** (relationships):
- `ticker_symbol` - סימבול הטיקר - דוגמה: "AAPL"
- `ticker_name` - שם החברה - דוגמה: "Apple Inc"
- `account_name` - שם החשבון - דוגמה: "Interactive Brokers"

**דוגמת response**:
```json
{
  "id": 8,
  "ticker_id": 5,
  "ticker_symbol": "AAPL",
  "ticker_name": "Apple Inc",
  "trading_account_id": 2,
  "account_name": "Interactive Brokers",
  "status": "open",
  "side": "Long",
  "target_price": 200.00
}
```

### 4. Alert (התראות)

**API**: `GET /api/alerts/`

**שדות בסיסיים**:
- `id`, `message`, `status`, `is_triggered`
- `related_type_id`, `related_id`, `related_type`
- `condition_attribute`, `condition_operator`, `condition_number`
- `created_at`, `triggered_at`

**שדות מורחבים** (relationships):
- `related_entity_name` - שם הישות המקושרת
  - אם account → שם החשבון
  - אם trade → סימבול הטיקר
  - אם trade_plan → סימבול הטיקר
  - אם ticker → סימבול הטיקר

**מיפוי related_type_id**:
- 1 = account (חשבון)
- 2 = trade (עסקה)
- 3 = trade_plan (תוכנית)
- 4 = ticker (טיקר)

**דוגמת response**:
```json
{
  "id": 23,
  "related_type_id": 4,
  "related_id": 5,
  "related_type": "ticker",
  "related_entity_name": "AAPL",
  "message": "מחיר עבר 180",
  "status": "open",
  "is_triggered": "false"
}
```

### 5. Note (הערות)

**API**: `GET /api/notes/`

**שדות בסיסיים**:
- `id`, `content`, `attachment`
- `related_type_id`, `related_id`, `related_type`
- `created_at`

**שדות מורחבים** (relationships):
- `related_entity_name` - שם הישות המקושרת (אותו logic כמו alerts)

**מיפוי related_type_id**:
- 1 = account
- 2 = trade
- 3 = trade_plan
- 4 = ticker

**דוגמת response**:
```json
{
  "id": 12,
  "content": "זכור לבדוק לפני סגירה",
  "related_type_id": 4,
  "related_id": 5,
  "related_type": "ticker",
  "related_entity_name": "AAPL",
  "created_at": "2025-01-15 10:30:00"
}
```

### 6. TradingAccount (חשבונות מסחר)

**API**: `GET /api/trading-accounts/`

**שדות בסיסיים**:
- `id`, `name`, `status`, `cash_balance`, `total_value`, `total_pl`
- `currency_id`, `notes`, `created_at`

**שדות מורחבים** (relationships):
- `currency_symbol` - סמל המטבע - דוגמה: "USD"
- `currency_name` - שם המטבע - דוגמה: "US Dollar"

**דוגמת response**:
```json
{
  "id": 2,
  "name": "Interactive Brokers",
  "currency_id": 1,
  "currency_symbol": "USD",
  "currency_name": "US Dollar",
  "status": "open",
  "cash_balance": 50000.00
}
```

### 7. CashFlow (תזרימי מזומנים)

**API**: `GET /api/cash_flows/`

**שדות בסיסיים**:
- `id`, `type`, `amount`, `date`, `description`
- `trading_account_id`, `currency_id`
- `created_at`, `updated_at`

**שדות מורחבים** (relationships):
- `account_name` - שם החשבון
- `account` - object מלא:
  - `id`, `name`, `type`, `status`, `balance`
- `currency_symbol` - סמל המטבע
- `currency_name` - שם המטבע

**דוגמת response**:
```json
{
  "id": 7,
  "type": "deposit",
  "amount": 10000.00,
  "trading_account_id": 2,
  "account_name": "Interactive Brokers",
  "account": {
    "id": 2,
    "name": "Interactive Brokers",
    "type": "real",
    "status": "open",
    "balance": 50000.00
  },
  "currency_id": 1,
  "currency_symbol": "USD",
  "currency_name": "US Dollar"
}
```

## 🔧 שימוש ב-Frontend

### דוגמה 1: טבלת Trades
```javascript
// Before:
<td>${trade.ticker_id}</td>           // הציג: 5
<td>${trade.trading_account_id}</td>  // הציג: 2

// After:
<td>${trade.ticker_symbol}</td>       // מציג: AAPL
<td>${trade.account_name}</td>        // מציג: Interactive Brokers
```

### דוגמה 2: טבלת Executions
```javascript
// Before:
<td>${execution.trade_id}</td>        // הציג: 15

// After:
<td>${execution.trade_display}</td>   // מציג: AAPL | 15/01/2025 | Long
```

### דוגמה 3: טבלת Alerts
```javascript
// Before:
const ticker = tickers.find(t => t.id === alert.related_id);
<td>${ticker?.symbol || alert.related_id}</td>

// After:
<td>${alert.related_entity_name}</td>  // מציג: AAPL
```

## ⚡ ביצועים

### Eager Loading
- כל ה-relationships נטענים בשאילתה אחת (JOIN)
- אין N+1 queries problem
- Cache ב-Backend מטפל בביצועים

### Fallbacks
כל שדה יש לו fallback לערך המקורי:
```javascript
trade.ticker_symbol || trade.ticker?.symbol || trade.ticker_id
```

## 📝 הערות חשובות

1. **Generic Relationships** (Alert, Note):
   - משתמשים ב-`related_type_id` + `related_id`
   - ה-API עושה resolution runtime
   - מחזיר `related_entity_name` אחיד

2. **Nested Relationships** (Execution):
   - Execution → Trade → Ticker
   - צריך `joinedload()` מקונן
   - המודל מטפל בבניית ה-display string

3. **Currency בכל מקום**:
   - TradingAccount מחזיר currency_symbol
   - הוא משמש גם ב-CashFlow
   - זמין דרך `account.currency_symbol`

## 🎯 סיכום

כל ה-APIs עכשיו מחזירים relationship data מלא!
- ✅ אין צורך ב-lookups נוספים ב-Frontend
- ✅ הטבלאות מציגות שמות ברורים
- ✅ UX משופר משמעותית
- ✅ קוד Frontend פשוט יותר

**המערכת מוכנה לשימוש!** 🚀

