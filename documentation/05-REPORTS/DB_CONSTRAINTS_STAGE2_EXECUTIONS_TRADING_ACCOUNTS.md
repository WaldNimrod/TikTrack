# DB Constraints - Stage 2 Batch 1: Executions + Trading Accounts

**Date:** January 1, 2026
**Entities:** executions, trading_accounts
**Source:** Backend/models/execution.py, Backend/models/trading_account.py

---

## Executions Entity Constraints

| Field | Type | Required | Nullable | Enum/Allowed Values | Length | Default | FK Constraints | Case Sensitive | Date Field | Notes |
|-------|------|----------|----------|-------------------|--------|---------|----------------|----------------|------------|-------|
| id | Integer | ✓ | ✗ | - | - | AUTO | - | - | ✗ | Primary key |
| user_id | Integer | ✓ | ✗ | - | - | - | users.id | - | ✗ | User who owns this execution |
| ticker_id | Integer | ✓ | ✗ | - | - | - | tickers.id | - | ✗ | Required - every execution must have a ticker |
| trading_account_id | Integer | ✗ | ✓ | - | - | NULL | trading_accounts.id | - | ✗ | Optional account linkage |
| trade_id | Integer | ✗ | ✓ | - | - | NULL | trades.id | - | ✗ | Optional trade linkage |
| action | String(20) | ✓ | ✗ | buy, sell, short, cover | 20 | 'buy' | - | ✓ | ✗ | Trading action type |
| date | DateTime | ✓ | ✗ | - | - | - | - | - | ✓ | Execution timestamp, must be >= trade.open_date |
| quantity | Float | ✓ | ✗ | quantity > 0 | - | - | - | - | ✗ | Positive quantity required |
| price | Float | ✓ | ✗ | price > 0 | - | - | - | - | ✗ | Positive price required |
| fee | Float | ✗ | ✓ | fee >= 0 | - | 0 | - | - | ✗ | Optional fee, must be non-negative |
| source | String(50) | ✗ | ✓ | manual, api, file_import, direct_import | 50 | 'manual' | - | ✓ | ✗ | Import source |
| external_id | String(100) | ✗ | ✓ | - | 100 | NULL | - | ✓ | ✗ | External broker ID |
| notes | String(5000) | ✗ | ✓ | - | 5000 | NULL | - | ✓ | ✗ | Execution notes |
| realized_pl | Integer | ✗ | ✓ | - | - | NULL | - | - | ✗ | Required for closing executions |
| mtm_pl | Integer | ✗ | ✓ | - | - | NULL | - | - | ✗ | Optional P/L |
| created_at | DateTime | ✓ | ✗ | - | - | CURRENT_TIMESTAMP | - | - | ✓ | Auto-generated |
| updated_at | DateTime | ✓ | ✗ | - | - | CURRENT_TIMESTAMP | - | - | ✓ | Auto-updated |

---

## Trading Accounts Entity Constraints

| Field | Type | Required | Nullable | Enum/Allowed Values | Length | Default | FK Constraints | Case Sensitive | Date Field | Notes |
|-------|------|----------|----------|-------------------|--------|---------|----------------|----------------|------------|-------|
| id | Integer | ✓ | ✗ | - | - | AUTO | - | - | ✗ | Primary key |
| user_id | Integer | ✓ | ✗ | - | - | - | users.id | - | ✗ | User who owns this trading account |
| name | String(100) | ✓ | ✗ | - | 100 | - | - | ✓ | ✗ | Account name |
| currency_id | Integer | ✓ | ✗ | - | - | - | currencies.id | - | ✗ | Required currency reference |
| status | String(20) | ✗ | ✓ | open, closed, cancelled | 20 | 'open' | - | ✓ | ✗ | Account status |
| cash_balance | Float | ✗ | ✓ | - | - | 0 | - | - | ✗ | Deprecated - use balances endpoint |
| opening_balance | Float | ✗ | ✓ | - | - | 0.0 | - | - | ✗ | Opening balance |
| total_value | Float | ✗ | ✓ | - | - | 0 | - | - | ✗ | Calculated total value |
| total_pl | Float | ✗ | ✓ | - | - | 0 | - | - | ✗ | Not updated - shows "בפיתוח" |
| notes | String(5000) | ✗ | ✓ | - | 5000 | NULL | - | ✓ | ✗ | Account notes |
| external_account_number | String(100) | ✗ | ✓ | - | 100 | NULL | - | ✓ | ✗ | Unique external broker ID |
| created_at | DateTime | ✓ | ✗ | - | - | CURRENT_TIMESTAMP | - | - | ✓ | Auto-generated |
| updated_at | DateTime | ✓ | ✗ | - | - | CURRENT_TIMESTAMP | - | - | ✓ | Auto-updated |

---

## Key Relationships & Business Rules

### Executions Relationships:
- **user_id**: Required FK to users table
- **ticker_id**: Required FK to tickers table
- **trading_account_id**: Optional FK to trading_accounts table
- **trade_id**: Optional FK to trades table

### Trading Accounts Relationships:
- **user_id**: Required FK to users table
- **currency_id**: Required FK to currencies table

### Business Rules Validation:
- **Executions**:
  - quantity > 0 (enforced in service layer)
  - price > 0 (enforced in service layer)
  - fee >= 0 (enforced in service layer)
  - date >= trade.open_date if trade exists (enforced in service layer)
  - realized_pl required for sell/cover actions (enforced in service layer)

- **Trading Accounts**:
  - external_account_number must be unique (DB constraint)
  - Last account cannot be deleted (enforced in service layer)

---

## Frontend-Backend Alignment Notes

### Executions:
- **symbol** field: Mapped from ticker.symbol in to_dict()
- **ticker_symbol** field: Alias for symbol for frontend compatibility
- **account_name** field: Mapped from trading_account.name or fallback

### Trading Accounts:
- **currency_symbol**: Mapped from currency.symbol in to_dict()
- **currency_name**: Mapped from currency.name in to_dict()
- **cash_balance**: Removed from to_dict() - deprecated field

---

## Validation Requirements

### Required for Stage 2 QA:
1. **Executions POST**: All required fields (user_id, ticker_id, action, date, quantity, price)
2. **Trading Accounts POST**: Required fields (user_id, name, currency_id)
3. **Foreign Key Validation**: Valid references to users, tickers, currencies
4. **Business Rules**: Quantity/price > 0, proper enum values
5. **Unique Constraints**: external_account_number uniqueness

**Status:** ✅ Constraints mapped and documented
