# Database Structure Analysis

**Generated:** 1763335721.8676777

## Summary

- **Total Tables:** 40
- **Total Indexes:** 66
- **Total Triggers:** 2
- **Total Foreign Keys:** 42

---

## Tables

### Constraints & Relations (4 tables)

#### `constraint_validations`

- **Rows:** 0
- **Columns:** 6
- **Indexes:** 3
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `constraint_id` | `INTEGER` | ✓ | — |  |
| `validation_type` | `VARCHAR(20)` | ✓ | — |  |
| `validation_rule` | `TEXT` | ✓ | — |  |
| `error_message` | `TEXT` |  | — |  |
| `is_active` | `BOOLEAN` |  | 1 |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `constraint_id` | `constraints` | `id` |

**Indexes:**
- `idx_validation_constraint_id`: `constraint_id`
- `idx_validation_type`: `validation_type`
- `idx_validation_active`: `is_active`

---

#### `constraints`

- **Rows:** 118
- **Columns:** 9
- **Indexes:** 3
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `table_name` | `VARCHAR(50)` | ✓ | — |  |
| `column_name` | `VARCHAR(50)` | ✓ | — |  |
| `constraint_type` | `VARCHAR(20)` | ✓ | — |  |
| `constraint_name` | `VARCHAR(100)` | ✓ | — |  |
| `constraint_definition` | `TEXT` | ✓ | — |  |
| `is_active` | `BOOLEAN` |  | 1 |  |
| `created_at` | `TIMESTAMP` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `TIMESTAMP` |  | CURRENT_TIMESTAMP |  |

**Indexes:**
- `idx_constraints_table_column`: `table_name, column_name`
- `idx_constraints_type`: `constraint_type`
- `idx_constraints_active`: `is_active`

---

#### `enum_values`

- **Rows:** 92
- **Columns:** 6
- **Indexes:** 3
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `constraint_id` | `INTEGER` | ✓ | — |  |
| `value` | `VARCHAR(50)` | ✓ | — |  |
| `display_name` | `VARCHAR(100)` |  | — |  |
| `is_active` | `BOOLEAN` |  | 1 |  |
| `sort_order` | `INTEGER` |  | 0 |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `constraint_id` | `constraints` | `id` |

**Indexes:**
- `idx_enum_constraint_id`: `constraint_id`
- `idx_enum_active`: `is_active`
- `idx_enum_sort`: `sort_order`

---

#### `note_relation_types`

- **Rows:** 4
- **Columns:** 3
- **Indexes:** 1
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `note_relation_type` | `VARCHAR(20)` | ✓ | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Indexes:**
- `ix_note_relation_types_id`: `id`

---

### Market Data (6 tables)

#### `intraday_data_slots`

- **Rows:** 0
- **Columns:** 13
- **Indexes:** 3
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `ticker_id` | `INTEGER` | ✓ | — |  |
| `provider_id` | `INTEGER` | ✓ | — |  |
| `slot_start_utc` | `DATETIME` | ✓ | — |  |
| `open_price` | `REAL` | ✓ | — |  |
| `high_price` | `REAL` | ✓ | — |  |
| `low_price` | `REAL` | ✓ | — |  |
| `close_price` | `REAL` | ✓ | — |  |
| `volume` | `INTEGER` | ✓ | — |  |
| `slot_duration_minutes` | `INTEGER` | ✓ | — |  |
| `is_complete` | `BOOLEAN` |  | 0 |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `provider_id` | `external_data_providers` | `id` |
| `ticker_id` | `tickers` | `id` |

**Indexes:**
- `ux_intraday_data_slots_ticker_provider_slot` (UNIQUE): `ticker_id, provider_id, slot_start_utc`
- `idx_intraday_data_slots_ticker_provider_slot`: `ticker_id, provider_id, slot_start_utc`
- `idx_intraday_data_slots_slot_start_utc`: `slot_start_utc`

---

#### `market_data_quotes`

- **Rows:** 222
- **Columns:** 15
- **Indexes:** 4
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `ticker_id` | `INTEGER` | ✓ | — |  |
| `provider_id` | `INTEGER` | ✓ | — |  |
| `asof_utc` | `DATETIME` | ✓ | — |  |
| `fetched_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `price` | `REAL` | ✓ | — |  |
| `change_pct_day` | `REAL` |  | — |  |
| `change_amount_day` | `REAL` |  | — |  |
| `volume` | `INTEGER` |  | — |  |
| `currency` | `VARCHAR(10)` | ✓ | 'USD' |  |
| `source` | `VARCHAR(50)` | ✓ | — |  |
| `is_stale` | `BOOLEAN` |  | 0 |  |
| `quality_score` | `REAL` |  | 1.0 |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `provider_id` | `external_data_providers` | `id` |
| `ticker_id` | `tickers` | `id` |

**Indexes:**
- `idx_market_data_quotes_ticker_provider`: `ticker_id, provider_id`
- `idx_market_data_quotes_asof_utc`: `asof_utc`
- `idx_market_data_quotes_fetched_at`: `fetched_at`
- `idx_market_data_quotes_stale`: `is_stale`

---

#### `quotes_last`

- **Rows:** 11
- **Columns:** 20
- **Indexes:** 5
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `ticker_id` | `INTEGER` | ✓ | — |  |
| `price` | `NUMERIC(10, 4)` | ✓ | — |  |
| `change_amount` | `NUMERIC(10, 4)` |  | — |  |
| `change_percent` | `NUMERIC(5, 2)` |  | — |  |
| `volume` | `INTEGER` |  | — |  |
| `high_24h` | `NUMERIC(10, 4)` |  | — |  |
| `low_24h` | `NUMERIC(10, 4)` |  | — |  |
| `open_price` | `NUMERIC(10, 4)` |  | — |  |
| `previous_close` | `NUMERIC(10, 4)` |  | — |  |
| `provider` | `VARCHAR(50)` | ✓ | — |  |
| `asof_utc` | `DATETIME` |  | — |  |
| `fetched_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `last_updated` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `source` | `VARCHAR(50)` |  | — |  |
| `currency` | `VARCHAR(10)` |  | 'USD' |  |
| `is_stale` | `BOOLEAN` |  | FALSE |  |
| `quality_score` | `REAL` |  | 1.0 |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `ticker_id` | `tickers` | `id` |

**Indexes:**
- `idx_quotes_last_ticker_id`: `ticker_id`
- `idx_quotes_last_asof_utc`: `asof_utc`
- `idx_quotes_last_fetched_at`: `fetched_at`
- `idx_quotes_last_provider`: `provider`
- `idx_quotes_last_stale`: `is_stale`

---

#### `tickers`

- **Rows:** 27
- **Columns:** 11
- **Indexes:** 2
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `symbol` | `VARCHAR(10)` | ✓ | — |  |
| `name` | `VARCHAR(100)` |  | — |  |
| `type` | `VARCHAR(20)` |  | — |  |
| `remarks` | `VARCHAR(500)` |  | — |  |
| `currency` | `VARCHAR(3)` |  | — |  |
| `active_trades` | `BOOLEAN` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | — |  |
| `currency_id` | `INTEGER` |  | — |  |
| `status` | `TEXT` |  | 'open' |  |

**Indexes:**
- `ix_tickers_symbol` (UNIQUE): `symbol`
- `ix_tickers_id`: `id`

---

#### `tickers_backup`

- **Rows:** 9
- **Columns:** 9
- **Indexes:** 0
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `symbol` | `TEXT` |  | — |  |
| `name` | `TEXT` |  | — |  |
| `type` | `TEXT` |  | — |  |
| `remarks` | `TEXT` |  | — |  |
| `currency` | `TEXT` |  | — |  |
| `active_trades` | `NUM` |  | — |  |
| `id` | `INT` |  | — |  |
| `created_at` | `NUM` |  | — |  |
| `updated_at` | `NUM` |  | — |  |

---

#### `tickers_new`

- **Rows:** 0
- **Columns:** 9
- **Indexes:** 0
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` | ✓ | — | ✓ |
| `symbol` | `VARCHAR(10)` | ✓ | — |  |
| `name` | `VARCHAR(100)` |  | — |  |
| `type` | `VARCHAR(20)` |  | — |  |
| `remarks` | `VARCHAR(500)` |  | — |  |
| `currency_id` | `INTEGER` | ✓ | — |  |
| `active_trades` | `BOOLEAN` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `currency_id` | `currencies` | `id` |

---

### Other (11 tables)

#### `condition_alerts_mapping`

- **Rows:** 0
- **Columns:** 7
- **Indexes:** 3
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `condition_id` | `INTEGER` | ✓ | — |  |
| `condition_type` | `VARCHAR(10)` | ✓ | — |  |
| `alert_id` | `INTEGER` | ✓ | — |  |
| `auto_created` | `BOOLEAN` | ✓ | — |  |
| `is_active` | `BOOLEAN` | ✓ | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `alert_id` | `alerts` | `id` |

**Indexes:**
- `ix_condition_alerts_mapping_id`: `id`
- `idx_conditions_mapping_condition`: `condition_id, condition_type`
- `idx_conditions_mapping_alert`: `alert_id`

---

#### `currencies`

- **Rows:** 3
- **Columns:** 6
- **Indexes:** 1
- **Foreign Keys:** 0
- **Triggers:** 2

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `symbol` | `VARCHAR(10)` | ✓ | — |  |
| `name` | `VARCHAR(100)` | ✓ | — |  |
| `usd_rate` | `NUMERIC(10, 6)` | ✓ | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `usd_rate_default` | `NUMERIC(10,6)` |  | 1 |  |

**Indexes:**
- `ix_currencies_id`: `id`

**Triggers:**
- `protect_base_currency_update` (BEFORE UPDATE)
- `protect_base_currency_delete` (BEFORE DELETE)

---

#### `data_refresh_logs`

- **Rows:** 122
- **Columns:** 23
- **Indexes:** 4
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `provider_id` | `INTEGER` | ✓ | — |  |
| `operation_type` | `VARCHAR(50)` | ✓ | — |  |
| `symbols_requested` | `INTEGER` | ✓ | — |  |
| `symbols_successful` | `INTEGER` | ✓ | — |  |
| `symbols_failed` | `INTEGER` | ✓ | — |  |
| `start_time` | `DATETIME` | ✓ | — |  |
| `end_time` | `DATETIME` |  | — |  |
| `total_duration_ms` | `INTEGER` |  | — |  |
| `status` | `VARCHAR(20)` | ✓ | — |  |
| `error_message` | `TEXT` |  | — |  |
| `error_code` | `VARCHAR(50)` |  | — |  |
| `rate_limit_remaining` | `INTEGER` |  | — |  |
| `rate_limit_reset_time` | `DATETIME` |  | — |  |
| `cache_hit_count` | `INTEGER` |  | 0 |  |
| `cache_miss_count` | `INTEGER` |  | 0 |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `category` | `VARCHAR(50)` |  | — |  |
| `time_period` | `VARCHAR(50)` |  | — |  |
| `ticker_count` | `INTEGER` |  | — |  |
| `successful_count` | `INTEGER` |  | — |  |
| `failed_count` | `INTEGER` |  | — |  |
| `message` | `TEXT` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `provider_id` | `external_data_providers` | `id` |

**Indexes:**
- `idx_data_refresh_logs_provider`: `provider_id`
- `idx_data_refresh_logs_operation_type`: `operation_type`
- `idx_data_refresh_logs_status`: `status`
- `idx_data_refresh_logs_start_time`: `start_time`

---

#### `external_data_providers`

- **Rows:** 3
- **Columns:** 20
- **Indexes:** 0
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `name` | `VARCHAR(50)` | ✓ | — |  |
| `display_name` | `VARCHAR(100)` | ✓ | — |  |
| `is_active` | `BOOLEAN` | ✓ | 1 |  |
| `provider_type` | `VARCHAR(50)` | ✓ | — |  |
| `api_key` | `VARCHAR(255)` |  | — |  |
| `base_url` | `VARCHAR(255)` | ✓ | — |  |
| `rate_limit_per_hour` | `INTEGER` |  | 900 |  |
| `timeout_seconds` | `INTEGER` |  | 20 |  |
| `retry_attempts` | `INTEGER` |  | 2 |  |
| `cache_ttl_hot` | `INTEGER` |  | 60 |  |
| `cache_ttl_warm` | `INTEGER` |  | 300 |  |
| `max_symbols_per_batch` | `INTEGER` |  | 50 |  |
| `preferred_batch_size` | `INTEGER` |  | 25 |  |
| `last_successful_request` | `DATETIME` |  | — |  |
| `last_error` | `TEXT` |  | — |  |
| `error_count` | `INTEGER` |  | 0 |  |
| `is_healthy` | `BOOLEAN` |  | 1 |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | — |  |

---

#### `lost_and_found`

- **Rows:** 140
- **Columns:** 19
- **Indexes:** 0
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `rootpgno` | `INTEGER` |  | — |  |
| `pgno` | `INTEGER` |  | — |  |
| `nfield` | `INTEGER` |  | — |  |
| `id` | `INTEGER` |  | — |  |
| `c0` | `` |  | — |  |
| `c1` | `` |  | — |  |
| `c2` | `` |  | — |  |
| `c3` | `` |  | — |  |
| `c4` | `` |  | — |  |
| `c5` | `` |  | — |  |
| `c6` | `` |  | — |  |
| `c7` | `` |  | — |  |
| `c8` | `` |  | — |  |
| `c9` | `` |  | — |  |
| `c10` | `` |  | — |  |
| `c11` | `` |  | — |  |
| `c12` | `` |  | — |  |
| `c13` | `` |  | — |  |
| `c14` | `` |  | — |  |

---

#### `method_parameters`

- **Rows:** 19
- **Columns:** 16
- **Indexes:** 2
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `method_id` | `INTEGER` | ✓ | — |  |
| `parameter_key` | `VARCHAR(50)` | ✓ | — |  |
| `parameter_name_en` | `VARCHAR(100)` | ✓ | — |  |
| `parameter_name_he` | `VARCHAR(100)` | ✓ | — |  |
| `parameter_type` | `VARCHAR(20)` | ✓ | — |  |
| `default_value` | `VARCHAR(100)` |  | — |  |
| `min_value` | `VARCHAR(50)` |  | — |  |
| `max_value` | `VARCHAR(50)` |  | — |  |
| `validation_rule` | `TEXT` |  | — |  |
| `is_required` | `BOOLEAN` | ✓ | — |  |
| `sort_order` | `INTEGER` | ✓ | — |  |
| `help_text_en` | `TEXT` |  | — |  |
| `help_text_he` | `TEXT` |  | — |  |
| `updated_at` | `DATETIME` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `method_id` | `trading_methods` | `id` |

**Indexes:**
- `ix_method_parameters_id`: `id`
- `idx_method_parameters_method_id`: `method_id`

---

#### `notes`

- **Rows:** 7
- **Columns:** 6
- **Indexes:** 0
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `content` | `VARCHAR(1000)` | ✓ | — |  |
| `attachment` | `VARCHAR(500)` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `related_type_id` | `INTEGER` | ✓ | — |  |
| `related_id` | `INTEGER` | ✓ | — |  |

---

#### `plan_conditions`

- **Rows:** 0
- **Columns:** 10
- **Indexes:** 3
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `trade_plan_id` | `INTEGER` | ✓ | — |  |
| `method_id` | `INTEGER` | ✓ | — |  |
| `condition_group` | `INTEGER` | ✓ | — |  |
| `parameters_json` | `TEXT` | ✓ | — |  |
| `logical_operator` | `VARCHAR(10)` | ✓ | — |  |
| `is_active` | `BOOLEAN` | ✓ | — |  |
| `auto_generate_alerts` | `BOOLEAN` | ✓ | — |  |
| `updated_at` | `DATETIME` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `method_id` | `trading_methods` | `id` |
| `trade_plan_id` | `trade_plans` | `id` |

**Indexes:**
- `ix_plan_conditions_id`: `id`
- `idx_plan_conditions_plan_id`: `trade_plan_id`
- `idx_plan_conditions_method_id`: `method_id`

---

#### `trading_accounts`

- **Rows:** 6
- **Columns:** 11
- **Indexes:** 1
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `name` | `VARCHAR(100)` | ✓ | — |  |
| `currency_id` | `INTEGER` | ✓ | — |  |
| `status` | `VARCHAR(20)` |  | — |  |
| `cash_balance` | `FLOAT` |  | — |  |
| `total_value` | `FLOAT` |  | — |  |
| `total_pl` | `FLOAT` |  | — |  |
| `notes` | `VARCHAR(500)` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `opening_balance` | `FLOAT` |  | 0.0 |  |
| `external_account_number` | `TEXT` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `currency_id` | `currencies` | `id` |

**Indexes:**
- `idx_trading_accounts_external_account_number` (UNIQUE): `external_account_number`

---

#### `trading_methods`

- **Rows:** 6
- **Columns:** 11
- **Indexes:** 1
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `name_en` | `VARCHAR(100)` | ✓ | — |  |
| `name_he` | `VARCHAR(100)` | ✓ | — |  |
| `category` | `VARCHAR(50)` | ✓ | — |  |
| `description_en` | `TEXT` |  | — |  |
| `description_he` | `TEXT` |  | — |  |
| `icon_class` | `VARCHAR(50)` |  | — |  |
| `is_active` | `BOOLEAN` | ✓ | — |  |
| `sort_order` | `INTEGER` | ✓ | — |  |
| `updated_at` | `DATETIME` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Indexes:**
- `ix_trading_methods_id`: `id`

---

#### `users`

- **Rows:** 9
- **Columns:** 11
- **Indexes:** 0
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `username` | `VARCHAR(50)` | ✓ | — |  |
| `email` | `VARCHAR(100)` |  | — |  |
| `full_name` | `VARCHAR(100)` |  | — |  |
| `is_active` | `BOOLEAN` |  | 1 |  |
| `is_default` | `BOOLEAN` |  | 0 |  |
| `created_at` | `TIMESTAMP` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `TIMESTAMP` |  | CURRENT_TIMESTAMP |  |
| `first_name` | `VARCHAR(50)` |  | — |  |
| `last_name` | `VARCHAR(50)` |  | — |  |
| `preferences_json` | `TEXT` |  | — |  |

---

### System & Import (4 tables)

#### `import_sessions`

- **Rows:** 24
- **Columns:** 17
- **Indexes:** 4
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `trading_account_id` | `INTEGER` | ✓ | — |  |
| `provider` | `VARCHAR(50)` | ✓ | — |  |
| `file_name` | `VARCHAR(255)` | ✓ | — |  |
| `total_records` | `INTEGER` | ✓ | 0 |  |
| `imported_records` | `INTEGER` | ✓ | 0 |  |
| `skipped_records` | `INTEGER` | ✓ | 0 |  |
| `status` | `VARCHAR(20)` | ✓ | 'analyzing' |  |
| `summary_data` | `TEXT` |  | — |  |
| `created_at` | `DATETIME` |  | — |  |
| `completed_at` | `DATETIME` |  | — |  |
| `connector_type` | `VARCHAR(50)` |  | — |  |
| `task_type` | `VARCHAR(50)` |  | 'executions' |  |
| `file_size` | `INTEGER` |  | — |  |
| `file_hash` | `VARCHAR(64)` |  | — |  |
| `processing_time` | `INTEGER` |  | — |  |
| `cache_key` | `VARCHAR(100)` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `trading_account_id` | `trading_accounts` | `id` |

**Indexes:**
- `ix_import_sessions_trading_account_id`: `trading_account_id`
- `ix_import_sessions_status`: `status`
- `ix_import_sessions_provider`: `provider`
- `ix_import_sessions_created_at`: `created_at`

---

#### `system_setting_groups`

- **Rows:** 0
- **Columns:** 5
- **Indexes:** 1
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `name` | `VARCHAR(100)` | ✓ | — |  |
| `description` | `TEXT` |  | — |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Indexes:**
- `ix_system_setting_groups_id`: `id`

---

#### `system_setting_types`

- **Rows:** 0
- **Columns:** 10
- **Indexes:** 1
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `group_id` | `INTEGER` | ✓ | — |  |
| `key` | `VARCHAR(150)` | ✓ | — |  |
| `data_type` | `VARCHAR(20)` | ✓ | — |  |
| `description` | `TEXT` |  | — |  |
| `default_value` | `TEXT` |  | — |  |
| `is_active` | `BOOLEAN` |  | — |  |
| `constraints_json` | `TEXT` |  | — |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `group_id` | `system_setting_groups` | `id` |

**Indexes:**
- `ix_system_setting_types_id`: `id`

---

#### `system_settings`

- **Rows:** 0
- **Columns:** 6
- **Indexes:** 2
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `type_id` | `INTEGER` | ✓ | — |  |
| `value` | `TEXT` |  | — |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_by` | `VARCHAR(100)` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `type_id` | `system_setting_types` | `id` |

**Indexes:**
- `ix_system_settings_type_id`: `type_id`
- `ix_system_settings_id`: `id`

---

### Tags (3 tables)

#### `tag_categories`

- **Rows:** 1
- **Columns:** 8
- **Indexes:** 2
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `user_id` | `INTEGER` | ✓ | — |  |
| `name` | `VARCHAR(100)` | ✓ | — |  |
| `color_hex` | `VARCHAR(7)` |  | — |  |
| `order_index` | `INTEGER` | ✓ | — |  |
| `is_active` | `BOOLEAN` | ✓ | — |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `id` | `INTEGER` | ✓ | — | ✓ |

**Indexes:**
- `ix_tag_categories_id`: `id`
- `ix_tag_categories_user_id`: `user_id`

---

#### `tag_links`

- **Rows:** 4
- **Columns:** 6
- **Indexes:** 3
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `tag_id` | `INTEGER` | ✓ | — |  |
| `entity_type` | `VARCHAR(40)` | ✓ | — |  |
| `entity_id` | `INTEGER` | ✓ | — |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `created_by` | `INTEGER` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `tag_id` | `tags` | `id` |

**Indexes:**
- `ix_tag_links_entity`: `entity_type, entity_id`
- `ix_tag_links_tag_id`: `tag_id`
- `ix_tag_links_id`: `id`

---

#### `tags`

- **Rows:** 1
- **Columns:** 11
- **Indexes:** 2
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `user_id` | `INTEGER` | ✓ | — |  |
| `category_id` | `INTEGER` |  | — |  |
| `name` | `VARCHAR(100)` | ✓ | — |  |
| `slug` | `VARCHAR(120)` | ✓ | — |  |
| `description` | `TEXT` |  | — |  |
| `is_active` | `BOOLEAN` | ✓ | — |  |
| `usage_count` | `INTEGER` | ✓ | — |  |
| `last_used_at` | `DATETIME` |  | — |  |
| `created_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` | ✓ | CURRENT_TIMESTAMP |  |
| `id` | `INTEGER` | ✓ | — | ✓ |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `category_id` | `tag_categories` | `id` |

**Indexes:**
- `ix_tags_id`: `id`
- `ix_tags_user_id`: `user_id`

---

### Trading Entities (6 tables)

#### `alerts`

- **Rows:** 28
- **Columns:** 16
- **Indexes:** 0
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `trading_account_id` | `INTEGER` |  | — |  |
| `ticker_id` | `INTEGER` |  | — |  |
| `message` | `TEXT` |  | — |  |
| `triggered_at` | `NUM` |  | — |  |
| `created_at` | `NUM` |  | — |  |
| `status` | `TEXT` |  | — |  |
| `is_triggered` | `TEXT` |  | — |  |
| `related_type_id` | `INTEGER` |  | — |  |
| `related_id` | `INTEGER` |  | — |  |
| `condition_attribute` | `TEXT` |  | — |  |
| `condition_operator` | `TEXT` |  | — |  |
| `condition_number` | `NUM` |  | — |  |
| `plan_condition_id` | `INTEGER` |  | — |  |
| `trade_condition_id` | `INTEGER` |  | — |  |
| `expiry_date` | `VARCHAR(10)` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `ticker_id` | `tickers` | `id` |
| `trading_account_id` | `trading_accounts` | `id` |

---

#### `cash_flows`

- **Rows:** 3
- **Columns:** 13
- **Indexes:** 0
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` | ✓ | — | ✓ |
| `trading_account_id` | `INTEGER` | ✓ | — |  |
| `type` | `VARCHAR(50)` | ✓ | — |  |
| `amount` | `FLOAT` | ✓ | — |  |
| `date` | `DATE` |  | — |  |
| `description` | `VARCHAR(500)` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `currency_id` | `INTEGER` |  | 1 |  |
| `usd_rate` | `DECIMAL(10,6)` |  | 1.000000 |  |
| `source` | `VARCHAR(20)` |  | 'manual' |  |
| `external_id` | `VARCHAR(100)` |  | '0' |  |
| `fee_amount` | `FLOAT` | ✓ | 0 |  |
| `trade_id` | `INTEGER` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `currency_id` | `currencies` | `id` |
| `trading_account_id` | `trading_accounts` | `id` |

---

#### `executions`

- **Rows:** 31
- **Columns:** 15
- **Indexes:** 0
- **Foreign Keys:** 3
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `ticker_id` | `INTEGER` | ✓ | — |  |
| `trade_id` | `INTEGER` |  | — |  |
| `trading_account_id` | `INTEGER` |  | — |  |
| `action` | `VARCHAR(20)` | ✓ | 'buy' |  |
| `date` | `DATETIME` | ✓ | — |  |
| `quantity` | `FLOAT` | ✓ | — |  |
| `price` | `FLOAT` | ✓ | — |  |
| `fee` | `FLOAT` |  | 0.00 |  |
| `source` | `VARCHAR(50)` |  | 'manual' |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `external_id` | `VARCHAR(100)` |  | — |  |
| `notes` | `VARCHAR(5000)` |  | — |  |
| `realized_pl` | `INTEGER` |  | — |  |
| `mtm_pl` | `INTEGER` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `trading_account_id` | `trading_accounts` | `id` |
| `trade_id` | `trades` | `id` |
| `ticker_id` | `tickers` | `id` |

---

#### `trade_conditions`

- **Rows:** 0
- **Columns:** 11
- **Indexes:** 4
- **Foreign Keys:** 3
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `trade_id` | `INTEGER` | ✓ | — |  |
| `method_id` | `INTEGER` | ✓ | — |  |
| `inherited_from_plan_condition_id` | `INTEGER` |  | — |  |
| `condition_group` | `INTEGER` | ✓ | — |  |
| `parameters_json` | `TEXT` | ✓ | — |  |
| `logical_operator` | `VARCHAR(10)` | ✓ | — |  |
| `is_active` | `BOOLEAN` | ✓ | — |  |
| `auto_generate_alerts` | `BOOLEAN` | ✓ | — |  |
| `created_at` | `DATETIME` | ✓ | — |  |
| `updated_at` | `DATETIME` | ✓ | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `inherited_from_plan_condition_id` | `plan_conditions` | `id` |
| `method_id` | `trading_methods` | `id` |
| `trade_id` | `trades` | `id` |

**Indexes:**
- `ix_trade_conditions_id`: `id`
- `idx_trade_conditions_trade_id`: `trade_id`
- `idx_trade_conditions_method_id`: `method_id`
- `idx_trade_conditions_inherited`: `inherited_from_plan_condition_id`

---

#### `trade_plans`

- **Rows:** 25
- **Columns:** 19
- **Indexes:** 0
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `trading_account_id` | `INTEGER` | ✓ | — |  |
| `ticker_id` | `INTEGER` | ✓ | — |  |
| `investment_type` | `VARCHAR(20)` |  | — |  |
| `planned_amount` | `FLOAT` |  | — |  |
| `entry_conditions` | `VARCHAR(500)` |  | — |  |
| `stop_price` | `FLOAT` |  | — |  |
| `target_price` | `FLOAT` |  | — |  |
| `reasons` | `VARCHAR(500)` |  | — |  |
| `cancelled_at` | `DATETIME` |  | — |  |
| `cancel_reason` | `VARCHAR(500)` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `side` | `VARCHAR(10)` |  | 'Long' |  |
| `status` | `VARCHAR(20)` |  | 'open' |  |
| `stop_percentage` | `FLOAT` |  | 0.1 |  |
| `target_percentage` | `FLOAT` |  | 2000 |  |
| `current_price` | `FLOAT` |  | 0 |  |
| `notes` | `VARCHAR(5000)` |  | — |  |
| `entry_price` | `FLOAT` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `ticker_id` | `tickers` | `id` |
| `trading_account_id` | `trading_accounts` | `id` |

---

#### `trades`

- **Rows:** 19
- **Columns:** 17
- **Indexes:** 0
- **Foreign Keys:** 3
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `trading_account_id` | `INTEGER` | ✓ | — |  |
| `ticker_id` | `INTEGER` | ✓ | — |  |
| `trade_plan_id` | `INTEGER` |  | — |  |
| `status` | `VARCHAR(20)` |  | — |  |
| `investment_type` | `VARCHAR(20)` |  | — |  |
| `opened_at` | `DATETIME` |  | — |  |
| `closed_at` | `DATETIME` |  | — |  |
| `cancelled_at` | `DATETIME` |  | — |  |
| `cancel_reason` | `VARCHAR(500)` |  | — |  |
| `total_pl` | `FLOAT` |  | — |  |
| `notes` | `VARCHAR(500)` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `side` | `VARCHAR(10)` |  | 'Long' |  |
| `planned_quantity` | `FLOAT` |  | — |  |
| `planned_amount` | `FLOAT` |  | — |  |
| `entry_price` | `FLOAT` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `trade_plan_id` | `trade_plans` | `id` |
| `ticker_id` | `tickers` | `id` |
| `trading_account_id` | `trading_accounts` | `id` |

---

### Users & Preferences (6 tables)

#### `preference_groups`

- **Rows:** 16
- **Columns:** 5
- **Indexes:** 0
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `group_name` | `VARCHAR(100)` | ✓ | — |  |
| `description` | `TEXT` |  | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

---

#### `preference_profiles`

- **Rows:** 2
- **Columns:** 10
- **Indexes:** 2
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `user_id` | `INTEGER` | ✓ | — |  |
| `profile_name` | `VARCHAR(100)` | ✓ | — |  |
| `is_active` | `BOOLEAN` |  | — |  |
| `is_default` | `BOOLEAN` |  | — |  |
| `description` | `TEXT` |  | — |  |
| `created_by` | `INTEGER` |  | — |  |
| `last_used_at` | `DATETIME` |  | — |  |
| `usage_count` | `INTEGER` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `created_by` | `users` | `id` |
| `user_id` | `users` | `id` |

**Indexes:**
- `ix_preference_profiles_id`: `id`
- `idx_preference_profiles_user_active`: `user_id, is_active`

---

#### `preference_types`

- **Rows:** 126
- **Columns:** 11
- **Indexes:** 1
- **Foreign Keys:** 1
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `group_id` | `INTEGER` | ✓ | — |  |
| `data_type` | `VARCHAR(20)` | ✓ | — |  |
| `preference_name` | `VARCHAR(100)` | ✓ | — |  |
| `description` | `TEXT` |  | — |  |
| `constraints` | `TEXT` |  | — |  |
| `default_value` | `TEXT` |  | — |  |
| `is_required` | `BOOLEAN` |  | FALSE |  |
| `is_active` | `BOOLEAN` |  | TRUE |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `group_id` | `preference_groups` | `id` |

**Indexes:**
- `idx_preference_types_active`: `is_active, group_id`

---

#### `preferences_legacy`

- **Rows:** 0
- **Columns:** 6
- **Indexes:** 1
- **Foreign Keys:** 0
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `key` | `VARCHAR(150)` | ✓ | — |  |
| `value` | `TEXT` |  | — |  |
| `description` | `TEXT` |  | — |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Indexes:**
- `ix_preferences_legacy_id`: `id`

---

#### `user_preferences`

- **Rows:** 113
- **Columns:** 7
- **Indexes:** 3
- **Foreign Keys:** 3
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `id` | `INTEGER` |  | — | ✓ |
| `user_id` | `INTEGER` | ✓ | — |  |
| `profile_id` | `INTEGER` | ✓ | — |  |
| `preference_id` | `INTEGER` | ✓ | — |  |
| `saved_value` | `TEXT` | ✓ | — |  |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `user_id` | `preference_profiles` | `user_id` |
| `profile_id` | `preference_profiles` | `profile_name` |
| `preference_id` | `preference_types` | `id` |

**Indexes:**
- `idx_user_preferences_user_id`: `user_id`
- `idx_user_preferences_profile_id`: `profile_id`
- `idx_user_preferences_preference_id`: `preference_id`

---

#### `user_preferences_v3`

- **Rows:** 8
- **Columns:** 7
- **Indexes:** 1
- **Foreign Keys:** 2
- **Triggers:** 0

**Columns:**

| Name | Type | Not Null | Default | Primary Key |
|------|------|----------|---------|-------------|
| `user_id` | `INTEGER` | ✓ | — |  |
| `profile_id` | `INTEGER` | ✓ | — |  |
| `preference_id` | `INTEGER` | ✓ | — |  |
| `saved_value` | `TEXT` |  | — |  |
| `id` | `INTEGER` | ✓ | — | ✓ |
| `created_at` | `DATETIME` |  | CURRENT_TIMESTAMP |  |
| `updated_at` | `DATETIME` |  | — |  |

**Foreign Keys:**

| From Column | To Table | To Column |
|-------------|----------|-----------|
| `preference_id` | `preference_types` | `id` |
| `profile_id` | `preference_profiles` | `id` |

**Indexes:**
- `ix_user_preferences_v3_id`: `id`

---

## Indexes Summary

| Name | Table | Unique | Columns |
|------|-------|--------|---------|
| `idx_conditions_mapping_alert` | `condition_alerts_mapping` |  | `alert_id` |
| `idx_conditions_mapping_condition` | `condition_alerts_mapping` |  | `condition_id, condition_type` |
| `ix_condition_alerts_mapping_id` | `condition_alerts_mapping` |  | `id` |
| `idx_validation_active` | `constraint_validations` |  | `is_active` |
| `idx_validation_constraint_id` | `constraint_validations` |  | `constraint_id` |
| `idx_validation_type` | `constraint_validations` |  | `validation_type` |
| `idx_constraints_active` | `constraints` |  | `is_active` |
| `idx_constraints_table_column` | `constraints` |  | `table_name, column_name` |
| `idx_constraints_type` | `constraints` |  | `constraint_type` |
| `ix_currencies_id` | `currencies` |  | `id` |
| `idx_data_refresh_logs_operation_type` | `data_refresh_logs` |  | `operation_type` |
| `idx_data_refresh_logs_provider` | `data_refresh_logs` |  | `provider_id` |
| `idx_data_refresh_logs_start_time` | `data_refresh_logs` |  | `start_time` |
| `idx_data_refresh_logs_status` | `data_refresh_logs` |  | `status` |
| `idx_enum_active` | `enum_values` |  | `is_active` |
| `idx_enum_constraint_id` | `enum_values` |  | `constraint_id` |
| `idx_enum_sort` | `enum_values` |  | `sort_order` |
| `ix_import_sessions_created_at` | `import_sessions` |  | `created_at` |
| `ix_import_sessions_provider` | `import_sessions` |  | `provider` |
| `ix_import_sessions_status` | `import_sessions` |  | `status` |
| `ix_import_sessions_trading_account_id` | `import_sessions` |  | `trading_account_id` |
| `idx_intraday_data_slots_slot_start_utc` | `intraday_data_slots` |  | `slot_start_utc` |
| `idx_intraday_data_slots_ticker_provider_slot` | `intraday_data_slots` |  | `ticker_id, provider_id, slot_start_utc` |
| `ux_intraday_data_slots_ticker_provider_slot` | `intraday_data_slots` | ✓ | `ticker_id, provider_id, slot_start_utc` |
| `idx_market_data_quotes_asof_utc` | `market_data_quotes` |  | `asof_utc` |
| `idx_market_data_quotes_fetched_at` | `market_data_quotes` |  | `fetched_at` |
| `idx_market_data_quotes_stale` | `market_data_quotes` |  | `is_stale` |
| `idx_market_data_quotes_ticker_provider` | `market_data_quotes` |  | `ticker_id, provider_id` |
| `idx_method_parameters_method_id` | `method_parameters` |  | `method_id` |
| `ix_method_parameters_id` | `method_parameters` |  | `id` |
| `ix_note_relation_types_id` | `note_relation_types` |  | `id` |
| `idx_plan_conditions_method_id` | `plan_conditions` |  | `method_id` |
| `idx_plan_conditions_plan_id` | `plan_conditions` |  | `trade_plan_id` |
| `ix_plan_conditions_id` | `plan_conditions` |  | `id` |
| `idx_preference_profiles_user_active` | `preference_profiles` |  | `user_id, is_active` |
| `ix_preference_profiles_id` | `preference_profiles` |  | `id` |
| `idx_preference_types_active` | `preference_types` |  | `is_active, group_id` |
| `ix_preferences_legacy_id` | `preferences_legacy` |  | `id` |
| `idx_quotes_last_asof_utc` | `quotes_last` |  | `asof_utc` |
| `idx_quotes_last_fetched_at` | `quotes_last` |  | `fetched_at` |
| `idx_quotes_last_provider` | `quotes_last` |  | `provider` |
| `idx_quotes_last_stale` | `quotes_last` |  | `is_stale` |
| `idx_quotes_last_ticker_id` | `quotes_last` |  | `ticker_id` |
| `ix_system_setting_groups_id` | `system_setting_groups` |  | `id` |
| `ix_system_setting_types_id` | `system_setting_types` |  | `id` |
| `ix_system_settings_id` | `system_settings` |  | `id` |
| `ix_system_settings_type_id` | `system_settings` |  | `type_id` |
| `ix_tag_categories_id` | `tag_categories` |  | `id` |
| `ix_tag_categories_user_id` | `tag_categories` |  | `user_id` |
| `ix_tag_links_entity` | `tag_links` |  | `entity_type, entity_id` |
| `ix_tag_links_id` | `tag_links` |  | `id` |
| `ix_tag_links_tag_id` | `tag_links` |  | `tag_id` |
| `ix_tags_id` | `tags` |  | `id` |
| `ix_tags_user_id` | `tags` |  | `user_id` |
| `ix_tickers_id` | `tickers` |  | `id` |
| `ix_tickers_symbol` | `tickers` | ✓ | `symbol` |
| `idx_trade_conditions_inherited` | `trade_conditions` |  | `inherited_from_plan_condition_id` |
| `idx_trade_conditions_method_id` | `trade_conditions` |  | `method_id` |
| `idx_trade_conditions_trade_id` | `trade_conditions` |  | `trade_id` |
| `ix_trade_conditions_id` | `trade_conditions` |  | `id` |
| `idx_trading_accounts_external_account_number` | `trading_accounts` | ✓ | `external_account_number` |
| `ix_trading_methods_id` | `trading_methods` |  | `id` |
| `idx_user_preferences_preference_id` | `user_preferences` |  | `preference_id` |
| `idx_user_preferences_profile_id` | `user_preferences` |  | `profile_id` |
| `idx_user_preferences_user_id` | `user_preferences` |  | `user_id` |
| `ix_user_preferences_v3_id` | `user_preferences_v3` |  | `id` |

---

## Triggers Summary

| Name | Table | Timing | Event |
|------|-------|--------|-------|
| `protect_base_currency_delete` | `currencies` | BEFORE | DELETE |
| `protect_base_currency_update` | `currencies` | BEFORE | UPDATE |

---

## PostgreSQL Migration Notes

### Triggers

SQLite triggers need to be converted to PostgreSQL functions and triggers:

#### `protect_base_currency_delete` on `currencies`

```sql
CREATE TRIGGER protect_base_currency_delete BEFORE DELETE ON currencies BEGIN SELECT CASE WHEN OLD.id = 1 THEN RAISE(ABORT, 'Cannot delete base currency record (ID=1)') END; END
```

**PostgreSQL equivalent:**

```sql
-- TODO: Convert BEFORE DELETE trigger
-- Review logic and convert SQLite-specific syntax
```

#### `protect_base_currency_update` on `currencies`

```sql
CREATE TRIGGER protect_base_currency_update BEFORE UPDATE ON currencies BEGIN SELECT CASE WHEN NEW.id = 1 THEN RAISE(ABORT, 'Cannot update base currency record (ID=1)') END; END
```

**PostgreSQL equivalent:**

```sql
-- TODO: Convert BEFORE UPDATE trigger
-- Review logic and convert SQLite-specific syntax
```
