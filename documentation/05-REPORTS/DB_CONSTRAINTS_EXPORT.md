# Constraints Export from SQLite

This document contains all active constraints from the SQLite database,
prepared for migration to PostgreSQL.

**Total Constraints:** 114

---

## Constraints by Table

### `accounts` (8 constraints)

#### Column: `created_at`

**NOT_NULL** - `account_created_at_required`

- **Definition:** `created_at IS NOT NULL`

---

#### Column: `currency_id`

**FOREIGN_KEY** - `account_currency_fk`

- **Definition:** `FOREIGN KEY (currency_id) REFERENCES currencies(id)`

**NOT_NULL** - `account_currency_required`

- **Definition:** `currency_id IS NOT NULL`

---

#### Column: `id`

**NOT_NULL** - `account_id_required`

- **Definition:** `id IS NOT NULL`

---

#### Column: `name`

**CHECK** - `account_name_min_length`

- **Definition:** `LENGTH(name) >= 3`

**NOT_NULL** - `account_name_required`

- **Definition:** `name IS NOT NULL`

**UNIQUE** - `account_name_unique`

- **Definition:** `UNIQUE(name)`

---

#### Column: `status`

**ENUM** - `valid_account_status`

- **Definition:** `status IN (open, closed, cancelled)`
- **Enum Values:**
  - `open` (פתוח) (order: 1)
  - `closed` (סגור) (order: 2)
  - `cancelled` (מבוטל) (order: 3)

---

### `alerts` (6 constraints)

#### Column: `id`

**NOT_NULL** - `alert_id_required`

- **Definition:** `id IS NOT NULL`

---

#### Column: `is_triggered`

**ENUM** - `valid_alert_triggered`

- **Definition:** `is_triggered IN (new, true, false)`
- **Enum Values:**
  - `new` (חדש) (order: 1)
  - `true` (הופעל) (order: 2)
  - `false` (לא הופעל) (order: 3)

---

#### Column: `related_id`

**NOT_NULL** - `alert_related_id_required`

- **Definition:** `related_id IS NOT NULL`

---

#### Column: `related_type_id`

**FOREIGN_KEY** - `alert_related_type_fk`

- **Definition:** `FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)`

**NOT_NULL** - `alert_related_type_required`

- **Definition:** `related_type_id IS NOT NULL`

---

#### Column: `status`

**ENUM** - `valid_alert_status`

- **Definition:** `status IN (open, closed, cancelled)`
- **Enum Values:**
  - `open` (פתוח) (order: 1)
  - `closed` (סגור) (order: 2)
  - `cancelled` (מבוטל) (order: 3)

---

### `cash_flows` (14 constraints)

#### Column: `account_id`

**NOT_NULL** - `cash_flow_account_required`

- **Definition:** `account_id IS NOT NULL`

---

#### Column: `amount`

**NOT_NULL** - `cash_flow_amount_required`

- **Definition:** `amount IS NOT NULL`

---

#### Column: `created_at`

**NOT_NULL** - `cash_flow_created_at_required`

- **Definition:** `created_at IS NOT NULL`

---

#### Column: `currency`

**NOT_NULL** - `cash_flow_currency_required`

- **Definition:** `currency IS NOT NULL`

---

#### Column: `currency_id`

**NOT_NULL** - `cash_flow_currency_id_required`

- **Definition:** `currency_id IS NOT NULL`

---

#### Column: `date`

**NOT_NULL** - `cash_flow_date_required`

- **Definition:** `date IS NOT NULL`

---

#### Column: `external_id`

**CHECK** - `external_id_required_for_non_manual`

- **Definition:** `(source != "manual" AND external_id IS NOT NULL) OR source = "manual"`

---

#### Column: `fee_amount`

**NOT_NULL** - `cash_flows_fee_amount_not_null`

- **Definition:** `fee_amount IS NOT NULL`

**RANGE** - `cash_flows_fee_amount_non_negative`

- **Definition:** `fee_amount >= 0`

---

#### Column: `id`

**NOT_NULL** - `cash_flow_id_required`

- **Definition:** `id IS NOT NULL`

---

#### Column: `source`

**ENUM** - `valid_cash_flow_source`

- **Definition:** `source IN (manual, IBKR-tradelog-csv, IBKR-api)`
- **Enum Values:**
  - `manual` (ידני) (order: 10)
  - `file_import` (יבוא קובץ) (order: 20)
  - `direct_import` (יבוא ישיר) (order: 30)
  - `api` (API) (order: 40)

---

#### Column: `trade_id`

**CUSTOM** - `cash_flows_trade_ticker_match`

- **Definition:** `CASH_FLOW_TRADE_TICKER_MATCH|If trade_id is set, the cash flow trading_account_id must match the trade trading_account_id`

**FOREIGN KEY** - `cash_flows_trade_id_fk`

- **Definition:** `FOREIGN KEY (trade_id) REFERENCES trades(id)`

---

#### Column: `type`

**ENUM** - `valid_cash_flow_type`

- **Definition:** `type IN (deposit, withdrawal, dividend, tax, other)`
- **Enum Values:**
  - `deposit` (הפקדה) (order: 10)
  - `withdrawal` (משיכה) (order: 20)
  - `fee` (עמלה) (order: 30)
  - `dividend` (דיבידנד) (order: 40)
  - `transfer_in` (העברה מחשבון אחר) (order: 50)
  - `transfer_out` (העברה לחשבון אחר) (order: 60)
  - `other_positive` (אחר חיובי) (order: 70)
  - `other_negative` (אחר שלילי) (order: 80)

---

### `currencies` (6 constraints)

#### Column: `created_at`

**CHECK** - `currency_created_at_not_future`

- **Definition:** `created_at IS NULL OR created_at <= datetime("now")`

---

#### Column: `name`

**CHECK** - `currency_name_length`

- **Definition:** `LENGTH(name) <= 25`

**UNIQUE** - `currency_name_unique`

- **Definition:** `UNIQUE(name)`

---

#### Column: `symbol`

**CHECK** - `currency_symbol_format`

- **Definition:** `LENGTH(symbol) = 3 AND symbol = UPPER(symbol) AND symbol GLOB "[A-Z][A-Z][A-Z]"`

**UNIQUE** - `currency_symbol_unique`

- **Definition:** `UNIQUE(symbol)`

---

#### Column: `usd_rate`

**CHECK** - `currency_usd_rate_positive`

- **Definition:** `usd_rate > 0`

---

### `executions` (7 constraints)

#### Column: `action`

**ENUM** - `valid_execution_action`

- **Definition:** `action IN (buy, sale)`
- **Enum Values:**
  - `buy` (קנייה) (order: 1)
  - `sell` (מכירה) (order: 2)
  - `short` (מכירה בחסר) (order: 3)
  - `cover` (כיסוי) (order: 4)

---

#### Column: `created_at`

**NOT_NULL** - `execution_created_at_required`

- **Definition:** `created_at IS NOT NULL`

---

#### Column: `date`

**NOT_NULL** - `execution_date_required`

- **Definition:** `date IS NOT NULL`

---

#### Column: `id`

**NOT_NULL** - `execution_id_required`

- **Definition:** `id IS NOT NULL`

---

#### Column: `price`

**CHECK** - `price_positive`

- **Definition:** `price > 0`

---

#### Column: `quantity`

**CHECK** - `quantity_positive`

- **Definition:** `quantity > 0`

---

#### Column: `trade_id`

**CHECK** - `trade_id_valid`

- **Definition:** `trade_id IS NULL OR trade_id >= 0`

---

### `note_relation_types` (4 constraints)

#### Column: `created_at`

**CHECK** - `note_relation_created_at_not_future`

- **Definition:** `created_at IS NULL OR created_at <= datetime("now")`

---

#### Column: `note_relation_type`

**CHECK** - `note_relation_type_length`

- **Definition:** `LENGTH(note_relation_type) <= 20`

**ENUM** - `valid_note_relation_types`

- **Definition:** `note_relation_type IN (account, trade, trade_plan, ticker)`

**UNIQUE** - `note_relation_type_unique`

- **Definition:** `UNIQUE(note_relation_type)`

---

### `notes` (5 constraints)

#### Column: `content`

**CHECK** - `note_content_min_length`

- **Definition:** `LENGTH(content) >= 1`

---

#### Column: `created_at`

**CHECK** - `note_created_at_not_future`

- **Definition:** `created_at IS NULL OR created_at <= datetime("now")`

---

#### Column: `id`

**NOT_NULL** - `note_id_required`

- **Definition:** `id IS NOT NULL`

---

#### Column: `related_id`

**CHECK** - `note_related_id_positive`

- **Definition:** `related_id > 0`

---

#### Column: `related_type_id`

**FOREIGN_KEY** - `note_related_type_fk`

- **Definition:** `FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)`

---

### `preference_groups` (6 constraints)

#### Column: `group_name`

**CHECK** - `group_name_length`

- **Definition:** `LENGTH(group_name) >= 2 AND LENGTH(group_name) <= 100`

**CHECK** - `group_name_length`

- **Definition:** `LENGTH(group_name) >= 2 AND LENGTH(group_name) <= 100`

**NOT_NULL** - `group_name_required`

- **Definition:** `group_name IS NOT NULL`

**NOT_NULL** - `group_name_required`

- **Definition:** `group_name IS NOT NULL`

**UNIQUE** - `group_name_unique`

- **Definition:** `UNIQUE(group_name)`

**UNIQUE** - `group_name_unique`

- **Definition:** `UNIQUE(group_name)`

---

### `preference_types` (16 constraints)

#### Column: `data_type`

**ENUM** - `data_type_enum`

- **Definition:** `data_type IN ("string", "integer", "float", "boolean", "json", "color", "date", "time")`
- **Enum Values:**
  - `string` (String value) (order: 0)
  - `string` (String value) (order: 0)
  - `integer` (Integer number) (order: 1)
  - `integer` (Integer number) (order: 1)
  - `float` (Floating point number) (order: 2)
  - `float` (Floating point number) (order: 2)
  - `boolean` (True/False value) (order: 3)
  - `boolean` (True/False value) (order: 3)
  - `json` (JSON object) (order: 4)
  - `json` (JSON object) (order: 4)
  - `color` (Color value (hex)) (order: 5)
  - `color` (Color value (hex)) (order: 5)
  - `date` (Date value) (order: 6)
  - `date` (Date value) (order: 6)
  - `time` (Time value) (order: 7)
  - `time` (Time value) (order: 7)

**ENUM** - `data_type_enum`

- **Definition:** `data_type IN ("string", "integer", "float", "boolean", "json", "color", "date", "time")`

**NOT_NULL** - `data_type_required`

- **Definition:** `data_type IS NOT NULL`

**NOT_NULL** - `data_type_required`

- **Definition:** `data_type IS NOT NULL`

---

#### Column: `group_id`

**NOT_NULL** - `group_id_required`

- **Definition:** `group_id IS NOT NULL`

**NOT_NULL** - `group_id_required`

- **Definition:** `group_id IS NOT NULL`

---

#### Column: `is_active`

**CHECK** - `is_active_boolean`

- **Definition:** `is_active IN (0, 1)`

**CHECK** - `is_active_boolean`

- **Definition:** `is_active IN (0, 1)`

---

#### Column: `is_required`

**CHECK** - `is_required_boolean`

- **Definition:** `is_required IN (0, 1)`

**CHECK** - `is_required_boolean`

- **Definition:** `is_required IN (0, 1)`

---

#### Column: `preference_name`

**CHECK** - `preference_name_format`

- **Definition:** `preference_name REGEXP "^[a-zA-Z][a-zA-Z0-9_]*$"`

**CHECK** - `preference_name_format`

- **Definition:** `preference_name REGEXP "^[a-zA-Z][a-zA-Z0-9_]*$"`

**NOT_NULL** - `preference_name_required`

- **Definition:** `preference_name IS NOT NULL`

**NOT_NULL** - `preference_name_required`

- **Definition:** `preference_name IS NOT NULL`

**UNIQUE** - `preference_name_unique`

- **Definition:** `UNIQUE(preference_name)`

**UNIQUE** - `preference_name_unique`

- **Definition:** `UNIQUE(preference_name)`

---

### `tickers` (11 constraints)

#### Column: `active_trades`

**CHECK** - `active_trades_boolean`

- **Definition:** `active_trades IN (0, 1) OR active_trades IS NULL`

**CHECK** - `active_trades_consistency`

- **Definition:** `(active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open")) OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open")) OR active_trades IS NULL`

---

#### Column: `created_at`

**NOT_NULL** - `ticker_created_at_required`

- **Definition:** `created_at IS NOT NULL`

---

#### Column: `currency_id`

**FOREIGN_KEY** - `ticker_currency_fk`

- **Definition:** `currency_id REFERENCES currencies(id)`

---

#### Column: `id`

**NOT_NULL** - `ticker_id_required`

- **Definition:** `id IS NOT NULL`

---

#### Column: `name`

**CHECK** - `ticker_name_max_length`

- **Definition:** `LENGTH(name) <= 100`

---

#### Column: `status`

**CHECK** - `ticker_status_auto_update`

- **Definition:** `(status = "cancelled") OR (status = "open" AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open") OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = "open"))) OR (status = "closed" AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open") AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = "open"))`

**ENUM** - `ticker_status_enum`

- **Definition:** `status IN ("open", "closed", "cancelled")`
- **Enum Values:**
  - `open` (פתוח) (order: 1)
  - `closed` (סגור) (order: 2)
  - `cancelled` (מבוטל) (order: 3)

---

#### Column: `symbol`

**NOT_NULL** - `ticker_symbol_required`

- **Definition:** `symbol IS NOT NULL`

---

#### Column: `type`

**ENUM** - `ticker_type_enum`

- **Definition:** `type IN ("stock", "etf", "bond", "crypto", "forex", "commodity", "other")`
- **Enum Values:**
  - `stock` (מניה) (order: 1)
  - `etf` (ETF) (order: 2)
  - `bond` (אגרת חוב) (order: 3)
  - `crypto` (קריפטו) (order: 4)
  - `forex` (מטבע חוץ) (order: 5)
  - `commodity` (סחורה) (order: 6)
  - `other` (אחר) (order: 7)

---

#### Column: `updated_at`

**CHECK** - `updated_at_not_future`

- **Definition:** `updated_at IS NULL OR updated_at <= datetime("now")`

---

### `trade_plans` (9 constraints)

#### Column: `cancelled_at`

**CHECK** - `cancelled_after_created`

- **Definition:** `cancelled_at IS NULL OR cancelled_at > created_at`

---

#### Column: `created_at`

**NOT_NULL** - `created_at_required`

- **Definition:** `created_at IS NOT NULL`

---

#### Column: `investment_type`

**ENUM** - `valid_plan_investment_type`

- **Definition:** `investment_type IN (swing, investment, passive)`
- **Enum Values:**
  - `swing` (סווינג) (order: 1)
  - `investment` (השקעה) (order: 2)
  - `passive` (פאסיבי) (order: 3)

---

#### Column: `planned_amount`

**RANGE** - `positive_planned_amount`

- **Definition:** `planned_amount > 0`

---

#### Column: `side`

**ENUM** - `valid_plan_side`

- **Definition:** `side IN (Long, Short)`
- **Enum Values:**
  - `Long` (קנייה) (order: 1)
  - `Short` (מכירה) (order: 2)

---

#### Column: `status`

**ENUM** - `valid_plan_status`

- **Definition:** `status IN (open, closed, cancelled)`
- **Enum Values:**
  - `open` (פתוח) (order: 1)
  - `closed` (סגור) (order: 2)
  - `cancelled` (בוטל) (order: 3)

---

#### Column: `stop_price`

**RANGE** - `positive_stop_price`

- **Definition:** `stop_price > 0`

---

#### Column: `target_price`

**RANGE** - `positive_target_price`

- **Definition:** `target_price > 0`

---

#### Column: `ticker_id`

**NOT_NULL** - `ticker_required_for_plans`

- **Definition:** `ticker_id IS NOT NULL`

---

### `trades` (8 constraints)

#### Column: `account_id`

**NOT_NULL** - `account_required`

- **Definition:** `account_id IS NOT NULL`

---

#### Column: `closed_at`

**CHECK** - `closed_at_after_opened_at`

- **Definition:** `closed_at IS NULL OR closed_at > opened_at`

---

#### Column: `investment_type`

**ENUM** - `valid_investment_type`

- **Definition:** `investment_type IN (swing, investment, passive)`
- **Enum Values:**
  - `swing` (סווינג) (order: 1)
  - `investment` (השקעה) (order: 2)
  - `passive` (פאסיבי) (order: 3)

---

#### Column: `opened_at`

**CHECK** - `opened_at_required_for_open_trades`

- **Definition:** `(status = "open" AND opened_at IS NOT NULL) OR (status != "open")`

---

#### Column: `side`

**ENUM** - `valid_trade_side`

- **Definition:** `side IN (Long, Short)`
- **Enum Values:**
  - `Long` (קנייה) (order: 1)
  - `Short` (מכירה) (order: 2)

---

#### Column: `status`

**ENUM** - `valid_trade_status`

- **Definition:** `status IN (open, closed, cancelled)`
- **Enum Values:**
  - `open` (פתוח) (order: 1)
  - `closed` (סגור) (order: 2)
  - `cancelled` (בוטל) (order: 3)

---

#### Column: `ticker_id`

**NOT_NULL** - `ticker_required`

- **Definition:** `ticker_id IS NOT NULL`

---

#### Column: `trade_plan_id`

**NOT_NULL** - `trade_plan_required_for_trades`

- **Definition:** `trade_plan_id IS NOT NULL`

---

### `user_preferences` (14 constraints)

#### Column: `preference_id`

**CHECK** - `preference_id_positive`

- **Definition:** `preference_id > 0`

**CHECK** - `preference_id_positive`

- **Definition:** `preference_id > 0`

**NOT_NULL** - `preference_id_required`

- **Definition:** `preference_id IS NOT NULL`

**NOT_NULL** - `preference_id_required`

- **Definition:** `preference_id IS NOT NULL`

---

#### Column: `profile_id`

**CHECK** - `profile_id_positive`

- **Definition:** `profile_id > 0`

**CHECK** - `profile_id_positive`

- **Definition:** `profile_id > 0`

**NOT_NULL** - `profile_id_required`

- **Definition:** `profile_id IS NOT NULL`

**NOT_NULL** - `profile_id_required`

- **Definition:** `profile_id IS NOT NULL`

---

#### Column: `saved_value`

**NOT_NULL** - `saved_value_required`

- **Definition:** `saved_value IS NOT NULL`

**NOT_NULL** - `saved_value_required`

- **Definition:** `saved_value IS NOT NULL`

---

#### Column: `user_id`

**CHECK** - `user_id_positive`

- **Definition:** `user_id > 0`

**CHECK** - `user_id_positive`

- **Definition:** `user_id > 0`

**NOT_NULL** - `user_id_required`

- **Definition:** `user_id IS NOT NULL`

**NOT_NULL** - `user_id_required`

- **Definition:** `user_id IS NOT NULL`

---

## Summary Statistics

### By Type

| Type | Count |
|------|-------|
| CHECK | 36 |
| CUSTOM | 1 |
| ENUM | 17 |
| FOREIGN KEY | 1 |
| FOREIGN_KEY | 4 |
| NOT_NULL | 43 |
| RANGE | 4 |
| UNIQUE | 8 |

### By Table

| Table | Count |
|-------|-------|
| `accounts` | 8 |
| `alerts` | 6 |
| `cash_flows` | 14 |
| `currencies` | 6 |
| `executions` | 7 |
| `note_relation_types` | 4 |
| `notes` | 5 |
| `preference_groups` | 6 |
| `preference_types` | 16 |
| `tickers` | 11 |
| `trade_plans` | 9 |
| `trades` | 8 |
| `user_preferences` | 14 |

---

## PostgreSQL Migration Notes

### Translation Guidelines

1. **ENUM constraints:** Convert to CHECK constraints with IN clause
2. **CHECK constraints:** Review SQLite-specific functions (e.g., datetime())
3. **UNIQUE constraints:** Direct translation
4. **FOREIGN KEY constraints:** Already handled by SQLAlchemy models
5. **NOT NULL constraints:** Already in column definitions

### SQLite-Specific Functions to Review

- `datetime()` - PostgreSQL uses `NOW()` or `CURRENT_TIMESTAMP`
- `REGEXP` - PostgreSQL uses `~` operator
- `GLOB` - PostgreSQL uses `LIKE` with pattern conversion
