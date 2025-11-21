# PostgreSQL Constraint Mapping

| Table | Column | Type | Definition | Postgres Action | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `accounts` | `created_at` | NOT_NULL | `created_at IS NOT NULL` | `ALTER TABLE "accounts" ALTER COLUMN "created_at" SET NOT NULL;` | auto |  |
| `accounts` | `currency_id` | FOREIGN_KEY | `FOREIGN KEY (currency_id) REFERENCES currencies(id)` | `ALTER TABLE "accounts" ADD CONSTRAINT account_currency_fk FOREIGN KEY ("currency_id") REFERENCES currencies(id);` | auto |  |
| `accounts` | `currency_id` | NOT_NULL | `currency_id IS NOT NULL` | `ALTER TABLE "accounts" ALTER COLUMN "currency_id" SET NOT NULL;` | auto |  |
| `accounts` | `id` | NOT_NULL | `id IS NOT NULL` | `ALTER TABLE "accounts" ALTER COLUMN "id" SET NOT NULL;` | auto |  |
| `accounts` | `name` | CHECK | `LENGTH(name) >= 3` | `ALTER TABLE "accounts" ADD CONSTRAINT account_name_min_length CHECK (char_length(name) >= 3);` | auto |  |
| `accounts` | `name` | NOT_NULL | `name IS NOT NULL` | `ALTER TABLE "accounts" ALTER COLUMN "name" SET NOT NULL;` | auto |  |
| `accounts` | `name` | UNIQUE | `UNIQUE(name)` | `ALTER TABLE "accounts" ADD CONSTRAINT account_name_unique UNIQUE ("name");` | auto |  |
| `accounts` | `status` | ENUM | `status IN (open, closed, cancelled)` | `ALTER TABLE "accounts" ADD CONSTRAINT valid_account_status CHECK ("status" IN ('open', 'closed', 'cancelled'));` | auto |  |
| `alerts` | `id` | NOT_NULL | `id IS NOT NULL` | `ALTER TABLE "alerts" ALTER COLUMN "id" SET NOT NULL;` | auto |  |
| `alerts` | `is_triggered` | ENUM | `is_triggered IN (new, true, false)` | `ALTER TABLE "alerts" ADD CONSTRAINT valid_alert_triggered CHECK ("is_triggered" IN ('new', 'true', 'false'));` | auto |  |
| `alerts` | `related_id` | NOT_NULL | `related_id IS NOT NULL` | `ALTER TABLE "alerts" ALTER COLUMN "related_id" SET NOT NULL;` | auto |  |
| `alerts` | `related_type_id` | FOREIGN_KEY | `FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)` | `ALTER TABLE "alerts" ADD CONSTRAINT alert_related_type_fk FOREIGN KEY ("related_type_id") REFERENCES note_relation_types(id);` | auto |  |
| `alerts` | `related_type_id` | NOT_NULL | `related_type_id IS NOT NULL` | `ALTER TABLE "alerts" ALTER COLUMN "related_type_id" SET NOT NULL;` | auto |  |
| `alerts` | `status` | ENUM | `status IN (open, closed, cancelled)` | `ALTER TABLE "alerts" ADD CONSTRAINT valid_alert_status CHECK ("status" IN ('open', 'closed', 'cancelled'));` | auto |  |
| `cash_flows` | `account_id` | NOT_NULL | `account_id IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "account_id" SET NOT NULL;` | auto |  |
| `cash_flows` | `amount` | NOT_NULL | `amount IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "amount" SET NOT NULL;` | auto |  |
| `cash_flows` | `created_at` | NOT_NULL | `created_at IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "created_at" SET NOT NULL;` | auto |  |
| `cash_flows` | `currency` | NOT_NULL | `currency IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "currency" SET NOT NULL;` | auto |  |
| `cash_flows` | `currency_id` | NOT_NULL | `currency_id IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "currency_id" SET NOT NULL;` | auto |  |
| `cash_flows` | `date` | NOT_NULL | `date IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "date" SET NOT NULL;` | auto |  |
| `cash_flows` | `external_id` | CHECK | `(source != "manual" AND external_id IS NOT NULL) OR source = "manual"` | `ALTER TABLE "cash_flows" ADD CONSTRAINT external_id_required_for_non_manual CHECK ((source != 'manual' AND external_id IS NOT NULL) OR source = 'manual');` | auto |  |
| `cash_flows` | `fee_amount` | NOT_NULL | `fee_amount IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "fee_amount" SET NOT NULL;` | auto |  |
| `cash_flows` | `fee_amount` | RANGE | `fee_amount >= 0` | `ALTER TABLE "cash_flows" ADD CONSTRAINT cash_flows_fee_amount_non_negative CHECK (fee_amount >= 0);` | auto |  |
| `cash_flows` | `id` | NOT_NULL | `id IS NOT NULL` | `ALTER TABLE "cash_flows" ALTER COLUMN "id" SET NOT NULL;` | auto |  |
| `cash_flows` | `source` | ENUM | `source IN (manual, IBKR-tradelog-csv, IBKR-api)` | `ALTER TABLE "cash_flows" ADD CONSTRAINT valid_cash_flow_source CHECK ("source" IN ('manual', 'IBKR-tradelog-csv', 'IBKR-api'));` | auto |  |
| `cash_flows` | `trade_id` | CUSTOM | `CASH_FLOW_TRADE_TICKER_MATCH\|If trade_id is set, the cash flow trading_account_id must match the trade trading_account_id` | `—` | manual | Custom handling required (CUSTOM) |
| `cash_flows` | `trade_id` | FOREIGN KEY | `FOREIGN KEY (trade_id) REFERENCES trades(id)` | `ALTER TABLE "cash_flows" ADD CONSTRAINT cash_flows_trade_id_fk FOREIGN KEY ("trade_id") REFERENCES trades(id);` | auto |  |
| `cash_flows` | `type` | ENUM | `type IN (deposit, withdrawal, dividend, tax, other)` | `ALTER TABLE "cash_flows" ADD CONSTRAINT valid_cash_flow_type CHECK ("type" IN ('deposit', 'withdrawal', 'dividend', 'tax', 'other'));` | auto |  |
| `currencies` | `created_at` | CHECK | `created_at IS NULL OR created_at <= datetime("now")` | `ALTER TABLE "currencies" ADD CONSTRAINT currency_created_at_not_future CHECK (created_at IS NULL OR created_at <= timezone('utc', now()));` | auto | Expression normalized automatically; review generated SQL. |
| `currencies` | `name` | CHECK | `LENGTH(name) <= 25` | `ALTER TABLE "currencies" ADD CONSTRAINT currency_name_length CHECK (char_length(name) <= 25);` | auto |  |
| `currencies` | `name` | UNIQUE | `UNIQUE(name)` | `ALTER TABLE "currencies" ADD CONSTRAINT currency_name_unique UNIQUE ("name");` | auto |  |
| `currencies` | `symbol` | CHECK | `LENGTH(symbol) = 3 AND symbol = UPPER(symbol) AND symbol GLOB "[A-Z][A-Z][A-Z]"` | `ALTER TABLE "currencies" ADD CONSTRAINT currency_symbol_format CHECK (char_length(symbol) = 3 AND symbol = UPPER(symbol) AND symbol ~ '^[A-Z]{3}$');` | auto | Expression normalized automatically; review generated SQL. |
| `currencies` | `symbol` | UNIQUE | `UNIQUE(symbol)` | `ALTER TABLE "currencies" ADD CONSTRAINT currency_symbol_unique UNIQUE ("symbol");` | auto |  |
| `currencies` | `usd_rate` | CHECK | `usd_rate > 0` | `ALTER TABLE "currencies" ADD CONSTRAINT currency_usd_rate_positive CHECK (usd_rate > 0);` | auto |  |
| `executions` | `action` | ENUM | `action IN (buy, sale)` | `ALTER TABLE "executions" ADD CONSTRAINT valid_execution_action CHECK ("action" IN ('buy', 'sale'));` | auto |  |
| `executions` | `created_at` | NOT_NULL | `created_at IS NOT NULL` | `ALTER TABLE "executions" ALTER COLUMN "created_at" SET NOT NULL;` | auto |  |
| `executions` | `date` | NOT_NULL | `date IS NOT NULL` | `ALTER TABLE "executions" ALTER COLUMN "date" SET NOT NULL;` | auto |  |
| `executions` | `id` | NOT_NULL | `id IS NOT NULL` | `ALTER TABLE "executions" ALTER COLUMN "id" SET NOT NULL;` | auto |  |
| `executions` | `price` | CHECK | `price > 0` | `ALTER TABLE "executions" ADD CONSTRAINT price_positive CHECK (price > 0);` | auto |  |
| `executions` | `quantity` | CHECK | `quantity > 0` | `ALTER TABLE "executions" ADD CONSTRAINT quantity_positive CHECK (quantity > 0);` | auto |  |
| `executions` | `trade_id` | CHECK | `trade_id IS NULL OR trade_id >= 0` | `ALTER TABLE "executions" ADD CONSTRAINT trade_id_valid CHECK (trade_id IS NULL OR trade_id >= 0);` | auto |  |
| `note_relation_types` | `created_at` | CHECK | `created_at IS NULL OR created_at <= datetime("now")` | `ALTER TABLE "note_relation_types" ADD CONSTRAINT note_relation_created_at_not_future CHECK (created_at IS NULL OR created_at <= timezone('utc', now()));` | auto | Expression normalized automatically; review generated SQL. |
| `note_relation_types` | `note_relation_type` | CHECK | `LENGTH(note_relation_type) <= 20` | `ALTER TABLE "note_relation_types" ADD CONSTRAINT note_relation_type_length CHECK (char_length(note_relation_type) <= 20);` | auto |  |
| `note_relation_types` | `note_relation_type` | ENUM | `note_relation_type IN (account, trade, trade_plan, ticker)` | `ALTER TABLE "note_relation_types" ADD CONSTRAINT valid_note_relation_types CHECK ("note_relation_type" IN ('account', 'trade', 'trade_plan', 'ticker'));` | auto |  |
| `note_relation_types` | `note_relation_type` | UNIQUE | `UNIQUE(note_relation_type)` | `ALTER TABLE "note_relation_types" ADD CONSTRAINT note_relation_type_unique UNIQUE ("note_relation_type");` | auto |  |
| `notes` | `content` | CHECK | `LENGTH(content) >= 1` | `ALTER TABLE "notes" ADD CONSTRAINT note_content_min_length CHECK (char_length(content) >= 1);` | auto |  |
| `notes` | `created_at` | CHECK | `created_at IS NULL OR created_at <= datetime("now")` | `ALTER TABLE "notes" ADD CONSTRAINT note_created_at_not_future CHECK (created_at IS NULL OR created_at <= timezone('utc', now()));` | auto | Expression normalized automatically; review generated SQL. |
| `notes` | `id` | NOT_NULL | `id IS NOT NULL` | `ALTER TABLE "notes" ALTER COLUMN "id" SET NOT NULL;` | auto |  |
| `notes` | `related_id` | CHECK | `related_id > 0` | `ALTER TABLE "notes" ADD CONSTRAINT note_related_id_positive CHECK (related_id > 0);` | auto |  |
| `notes` | `related_type_id` | FOREIGN_KEY | `FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)` | `ALTER TABLE "notes" ADD CONSTRAINT note_related_type_fk FOREIGN KEY ("related_type_id") REFERENCES note_relation_types(id);` | auto |  |
| `preference_groups` | `group_name` | CHECK | `LENGTH(group_name) >= 2 AND LENGTH(group_name) <= 100` | `ALTER TABLE "preference_groups" ADD CONSTRAINT group_name_length CHECK (char_length(group_name) >= 2 AND char_length(group_name) <= 100);` | auto |  |
| `preference_groups` | `group_name` | NOT_NULL | `group_name IS NOT NULL` | `ALTER TABLE "preference_groups" ALTER COLUMN "group_name" SET NOT NULL;` | auto |  |
| `preference_groups` | `group_name` | UNIQUE | `UNIQUE(group_name)` | `ALTER TABLE "preference_groups" ADD CONSTRAINT group_name_unique UNIQUE ("group_name");` | auto |  |
| `preference_types` | `data_type` | ENUM | `data_type IN ("string", "integer", "float", "boolean", "json", "color", "date", "time")` | `ALTER TABLE "preference_types" ADD CONSTRAINT data_type_enum CHECK ("data_type" IN ('string', 'integer', 'float', 'boolean', 'json', 'color', 'date', 'time'));` | auto |  |
| `preference_types` | `data_type` | NOT_NULL | `data_type IS NOT NULL` | `ALTER TABLE "preference_types" ALTER COLUMN "data_type" SET NOT NULL;` | auto |  |
| `preference_types` | `group_id` | NOT_NULL | `group_id IS NOT NULL` | `ALTER TABLE "preference_types" ALTER COLUMN "group_id" SET NOT NULL;` | auto |  |
| `preference_types` | `is_active` | CHECK | `is_active IN (0, 1)` | `ALTER TABLE "preference_types" ADD CONSTRAINT is_active_boolean CHECK (is_active IN (0, 1));` | auto |  |
| `preference_types` | `is_required` | CHECK | `is_required IN (0, 1)` | `ALTER TABLE "preference_types" ADD CONSTRAINT is_required_boolean CHECK (is_required IN (0, 1));` | auto |  |
| `preference_types` | `preference_name` | CHECK | `preference_name REGEXP "^[a-zA-Z][a-zA-Z0-9_]*$"` | `ALTER TABLE "preference_types" ADD CONSTRAINT preference_name_format CHECK (preference_name ~ '^[a-zA-Z][a-zA-Z0-9_]*$');` | auto | Expression normalized automatically; review generated SQL. |
| `preference_types` | `preference_name` | NOT_NULL | `preference_name IS NOT NULL` | `ALTER TABLE "preference_types" ALTER COLUMN "preference_name" SET NOT NULL;` | auto |  |
| `preference_types` | `preference_name` | UNIQUE | `UNIQUE(preference_name)` | `ALTER TABLE "preference_types" ADD CONSTRAINT preference_name_unique UNIQUE ("preference_name");` | auto |  |
| `tickers` | `active_trades` | CHECK | `active_trades IN (0, 1) OR active_trades IS NULL` | `ALTER TABLE "tickers" ADD CONSTRAINT active_trades_boolean CHECK (active_trades IN (0, 1) OR active_trades IS NULL);` | auto |  |
| `tickers` | `active_trades` | CHECK | `(active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open")) OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open")) OR active_trades IS NULL` | `ALTER TABLE "tickers" ADD CONSTRAINT active_trades_consistency CHECK ((active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) OR active_trades IS NULL);` | auto |  |
| `tickers` | `created_at` | NOT_NULL | `created_at IS NOT NULL` | `ALTER TABLE "tickers" ALTER COLUMN "created_at" SET NOT NULL;` | auto |  |
| `tickers` | `currency_id` | FOREIGN_KEY | `currency_id REFERENCES currencies(id)` | `ALTER TABLE "tickers" ADD CONSTRAINT ticker_currency_fk FOREIGN KEY ("currency_id") REFERENCES currencies(id);` | auto |  |
| `tickers` | `id` | NOT_NULL | `id IS NOT NULL` | `ALTER TABLE "tickers" ALTER COLUMN "id" SET NOT NULL;` | auto |  |
| `tickers` | `name` | CHECK | `LENGTH(name) <= 100` | `ALTER TABLE "tickers" ADD CONSTRAINT ticker_name_max_length CHECK (char_length(name) <= 100);` | auto |  |
| `tickers` | `status` | CHECK | `(status = "cancelled") OR (status = "open" AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open") OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = "open"))) OR (status = "closed" AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = "open") AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = "open"))` | `ALTER TABLE "tickers" ADD CONSTRAINT ticker_status_auto_update CHECK ((status = 'cancelled') OR (status = 'open' AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))) OR (status = 'closed' AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open')));` | auto |  |
| `tickers` | `status` | ENUM | `status IN ("open", "closed", "cancelled")` | `ALTER TABLE "tickers" ADD CONSTRAINT ticker_status_enum CHECK ("status" IN ('open', 'closed', 'cancelled'));` | auto |  |
| `tickers` | `symbol` | NOT_NULL | `symbol IS NOT NULL` | `ALTER TABLE "tickers" ALTER COLUMN "symbol" SET NOT NULL;` | auto |  |
| `tickers` | `type` | ENUM | `type IN ("stock", "etf", "bond", "crypto", "forex", "commodity", "other")` | `ALTER TABLE "tickers" ADD CONSTRAINT ticker_type_enum CHECK ("type" IN ('stock', 'etf', 'bond', 'crypto', 'forex', 'commodity', 'other'));` | auto |  |
| `tickers` | `updated_at` | CHECK | `updated_at IS NULL OR updated_at <= datetime("now")` | `ALTER TABLE "tickers" ADD CONSTRAINT updated_at_not_future CHECK (updated_at IS NULL OR updated_at <= timezone('utc', now()));` | auto | Expression normalized automatically; review generated SQL. |
| `trade_plans` | `cancelled_at` | CHECK | `cancelled_at IS NULL OR cancelled_at > created_at` | `ALTER TABLE "trade_plans" ADD CONSTRAINT cancelled_after_created CHECK (cancelled_at IS NULL OR cancelled_at > created_at);` | auto |  |
| `trade_plans` | `created_at` | NOT_NULL | `created_at IS NOT NULL` | `ALTER TABLE "trade_plans" ALTER COLUMN "created_at" SET NOT NULL;` | auto |  |
| `trade_plans` | `investment_type` | ENUM | `investment_type IN (swing, investment, passive)` | `ALTER TABLE "trade_plans" ADD CONSTRAINT valid_plan_investment_type CHECK ("investment_type" IN ('swing', 'investment', 'passive'));` | auto |  |
| `trade_plans` | `planned_amount` | RANGE | `planned_amount > 0` | `ALTER TABLE "trade_plans" ADD CONSTRAINT positive_planned_amount CHECK (planned_amount > 0);` | auto |  |
| `trade_plans` | `side` | ENUM | `side IN (Long, Short)` | `ALTER TABLE "trade_plans" ADD CONSTRAINT valid_plan_side CHECK ("side" IN ('Long', 'Short'));` | auto |  |
| `trade_plans` | `status` | ENUM | `status IN (open, closed, cancelled)` | `ALTER TABLE "trade_plans" ADD CONSTRAINT valid_plan_status CHECK ("status" IN ('open', 'closed', 'cancelled'));` | auto |  |
| `trade_plans` | `stop_price` | RANGE | `stop_price > 0` | `ALTER TABLE "trade_plans" ADD CONSTRAINT positive_stop_price CHECK (stop_price > 0);` | auto |  |
| `trade_plans` | `target_price` | RANGE | `target_price > 0` | `ALTER TABLE "trade_plans" ADD CONSTRAINT positive_target_price CHECK (target_price > 0);` | auto |  |
| `trade_plans` | `ticker_id` | NOT_NULL | `ticker_id IS NOT NULL` | `ALTER TABLE "trade_plans" ALTER COLUMN "ticker_id" SET NOT NULL;` | auto |  |
| `trades` | `account_id` | NOT_NULL | `account_id IS NOT NULL` | `ALTER TABLE "trades" ALTER COLUMN "account_id" SET NOT NULL;` | auto |  |
| `trades` | `closed_at` | CHECK | `closed_at IS NULL OR closed_at > opened_at` | `ALTER TABLE "trades" ADD CONSTRAINT closed_at_after_opened_at CHECK (closed_at IS NULL OR closed_at > opened_at);` | auto |  |
| `trades` | `investment_type` | ENUM | `investment_type IN (swing, investment, passive)` | `ALTER TABLE "trades" ADD CONSTRAINT valid_investment_type CHECK ("investment_type" IN ('swing', 'investment', 'passive'));` | auto |  |
| `trades` | `opened_at` | CHECK | `(status = "open" AND opened_at IS NOT NULL) OR (status != "open")` | `ALTER TABLE "trades" ADD CONSTRAINT opened_at_required_for_open_trades CHECK ((status = 'open' AND opened_at IS NOT NULL) OR (status != 'open'));` | auto |  |
| `trades` | `side` | ENUM | `side IN (Long, Short)` | `ALTER TABLE "trades" ADD CONSTRAINT valid_trade_side CHECK ("side" IN ('Long', 'Short'));` | auto |  |
| `trades` | `status` | ENUM | `status IN (open, closed, cancelled)` | `ALTER TABLE "trades" ADD CONSTRAINT valid_trade_status CHECK ("status" IN ('open', 'closed', 'cancelled'));` | auto |  |
| `trades` | `ticker_id` | NOT_NULL | `ticker_id IS NOT NULL` | `ALTER TABLE "trades" ALTER COLUMN "ticker_id" SET NOT NULL;` | auto |  |
| `trades` | `trade_plan_id` | NOT_NULL | `trade_plan_id IS NOT NULL` | `ALTER TABLE "trades" ALTER COLUMN "trade_plan_id" SET NOT NULL;` | auto |  |
| `user_preferences` | `preference_id` | CHECK | `preference_id > 0` | `ALTER TABLE "user_preferences" ADD CONSTRAINT preference_id_positive CHECK (preference_id > 0);` | auto |  |
| `user_preferences` | `preference_id` | NOT_NULL | `preference_id IS NOT NULL` | `ALTER TABLE "user_preferences" ALTER COLUMN "preference_id" SET NOT NULL;` | auto |  |
| `user_preferences` | `profile_id` | CHECK | `profile_id > 0` | `ALTER TABLE "user_preferences" ADD CONSTRAINT profile_id_positive CHECK (profile_id > 0);` | auto |  |
| `user_preferences` | `profile_id` | NOT_NULL | `profile_id IS NOT NULL` | `ALTER TABLE "user_preferences" ALTER COLUMN "profile_id" SET NOT NULL;` | auto |  |
| `user_preferences` | `saved_value` | NOT_NULL | `saved_value IS NOT NULL` | `ALTER TABLE "user_preferences" ALTER COLUMN "saved_value" SET NOT NULL;` | auto |  |
| `user_preferences` | `user_id` | CHECK | `user_id > 0` | `ALTER TABLE "user_preferences" ADD CONSTRAINT user_id_positive CHECK (user_id > 0);` | auto |  |
| `user_preferences` | `user_id` | NOT_NULL | `user_id IS NOT NULL` | `ALTER TABLE "user_preferences" ALTER COLUMN "user_id" SET NOT NULL;` | auto |  |
