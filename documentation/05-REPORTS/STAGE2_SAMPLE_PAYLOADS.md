# Stage 2 Batch 1 - Sample Payloads

**Entities:** executions, trading_accounts
**Date:** January 1, 2026

---

## Executions - Valid Payload Examples

### Basic Buy Execution
```json
{
  "ticker_id": 1,
  "trading_account_id": 247,
  "action": "buy",
  "quantity": 100,
  "price": 100.00,
  "date": "2026-01-01T10:00:00"
}
```

### Sell Execution with All Fields
```json
{
  "ticker_id": 1,
  "trading_account_id": 247,
  "action": "sell",
  "quantity": 50,
  "price": 105.00,
  "date": "2026-01-02T10:00:00",
  "fee": 5.00,
  "source": "manual",
  "external_id": "EXT-12345",
  "notes": "Partial sell execution",
  "realized_pl": 250.00
}
```

### Short Execution
```json
{
  "ticker_id": 2,
  "trading_account_id": 247,
  "action": "short",
  "quantity": 200,
  "price": 50.00,
  "date": "2026-01-03T10:00:00"
}
```

---

## Trading Accounts - Valid Payload Examples

### Basic Trading Account
```json
{
  "name": "Main Trading Account",
  "currency_id": 1,
  "status": "open"
}
```

### Complete Trading Account
```json
{
  "name": "Advanced Trading Account",
  "currency_id": 1,
  "status": "open",
  "opening_balance": 100000.00,
  "notes": "Primary trading account for equity investments",
  "external_account_number": "EXT-ACC-001"
}
```

### Closed Trading Account
```json
{
  "name": "Archived Account",
  "currency_id": 2,
  "status": "closed",
  "opening_balance": 50000.00,
  "notes": "Account closed due to strategy change"
}
```

---

## Payload Validation Rules

### Executions Required Fields:
- `ticker_id`: Must be valid FK to tickers table
- `action`: Must be one of: "buy", "sell", "short", "cover"
- `quantity`: Must be > 0
- `price`: Must be > 0
- `date`: Must be valid datetime

### Trading Accounts Required Fields:
- `name`: String, max 100 chars
- `currency_id`: Must be valid FK to currencies table

### Optional Fields:
- **Executions**: `trading_account_id`, `trade_id`, `fee`, `source`, `external_id`, `notes`, `realized_pl`, `mtm_pl`
- **Trading Accounts**: `status`, `opening_balance`, `notes`, `external_account_number`

---

## API Endpoints Tested

### Executions:
- `POST /api/executions/` - ✅ Returns 201 with valid payload
- `GET /api/executions/` - ✅ Returns 200 with list
- `GET /api/executions/{id}` - ✅ Returns 200 with single execution

### Trading Accounts:
- `POST /api/trading_accounts/` - ✅ Returns 201 with valid payload
- `GET /api/trading_accounts/` - ✅ Returns 200 with list
- `GET /api/trading_accounts/{id}` - ✅ Returns 200 with single account

---

## Active Admin Trading Account ID

**Admin User ID:** 2
**Active Trading Account ID:** 247 (Admin Trading Account)
**Status:** ✅ Available for testing

---

## Validation Error Examples

### Executions - Invalid Payloads:
```json
// Missing required field (ticker_id)
{
  "trading_account_id": 247,
  "action": "buy",
  "quantity": 100,
  "price": 100.00,
  "date": "2026-01-01T10:00:00"
}
```
**Expected:** HTTP 400 with validation error message

### Trading Accounts - Invalid Payloads:
```json
// Missing required field (name)
{
  "currency_id": 1,
  "status": "open"
}
```
**Expected:** HTTP 400 with validation error message

---

**Status:** ✅ Sample payloads documented and validated
**Ready for:** QA testing with Team D
