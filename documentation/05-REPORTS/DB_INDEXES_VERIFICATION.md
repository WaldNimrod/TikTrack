# Index Verification Report

This document compares indexes in the SQLite database with indexes
defined in SQLAlchemy models to ensure proper migration to PostgreSQL.

## Summary

- **Total indexes in DB:** 66
- **Total indexes in models:** 52

⚠️  **Indexes in DB but not in models:** 34
ℹ️  **Indexes in models but not in DB:** 20 (may be new)

---

## Index Comparison by Table

### `alerts`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_alerts_id` |  | `id` | ℹ️ New (not in DB) |

---

### `cash_flows`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_cash_flows_id` |  | `id` | ℹ️ New (not in DB) |

---

### `condition_alerts_mapping`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_conditions_mapping_alert` |  | `alert_id` |
| `idx_conditions_mapping_condition` |  | `condition_id, condition_type` |
| `ix_condition_alerts_mapping_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_condition_alerts_mapping_id` |  | `id` | ✅ Matches |

⚠️  **Missing in models:**
- `idx_conditions_mapping_alert` on `alert_id`
- `idx_conditions_mapping_condition` on `condition_id, condition_type`

---

### `constraint_validations`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_validation_active` |  | `is_active` |
| `idx_validation_constraint_id` |  | `constraint_id` |
| `idx_validation_type` |  | `validation_type` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_constraint_validations_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `idx_validation_active` on `is_active`
- `idx_validation_constraint_id` on `constraint_id`
- `idx_validation_type` on `validation_type`

---

### `constraints`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_constraints_active` |  | `is_active` |
| `idx_constraints_table_column` |  | `table_name, column_name` |
| `idx_constraints_type` |  | `constraint_type` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_constraints_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `idx_constraints_active` on `is_active`
- `idx_constraints_table_column` on `table_name, column_name`
- `idx_constraints_type` on `constraint_type`

---

### `currencies`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_currencies_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_currencies_id` |  | `id` | ✅ Matches |

---

### `data_refresh_logs`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_data_refresh_logs_operation_type` |  | `operation_type` |
| `idx_data_refresh_logs_provider` |  | `provider_id` |
| `idx_data_refresh_logs_start_time` |  | `start_time` |
| `idx_data_refresh_logs_status` |  | `status` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `idx_data_refresh_logs_start_time` |  | `start_time` | ✅ Matches |
| `idx_data_refresh_logs_status` |  | `status` | ✅ Matches |
| `idx_data_refresh_logs_operation_type` |  | `operation_type` | ✅ Matches |
| `idx_data_refresh_logs_provider` |  | `provider_id` | ✅ Matches |
| `ix_data_refresh_logs_id` |  | `id` | ℹ️ New (not in DB) |

---

### `enum_values`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_enum_active` |  | `is_active` |
| `idx_enum_constraint_id` |  | `constraint_id` |
| `idx_enum_sort` |  | `sort_order` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_enum_values_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `idx_enum_active` on `is_active`
- `idx_enum_constraint_id` on `constraint_id`
- `idx_enum_sort` on `sort_order`

---

### `executions`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_executions_id` |  | `id` | ℹ️ New (not in DB) |

---

### `external_data_providers`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_external_data_providers_id` |  | `id` | ℹ️ New (not in DB) |

---

### `import_sessions`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_import_sessions_created_at` |  | `created_at` |
| `ix_import_sessions_provider` |  | `provider` |
| `ix_import_sessions_status` |  | `status` |
| `ix_import_sessions_trading_account_id` |  | `trading_account_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_import_sessions_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `ix_import_sessions_created_at` on `created_at`
- `ix_import_sessions_provider` on `provider`
- `ix_import_sessions_status` on `status`
- `ix_import_sessions_trading_account_id` on `trading_account_id`

---

### `intraday_data_slots`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_intraday_data_slots_slot_start_utc` |  | `slot_start_utc` |
| `idx_intraday_data_slots_ticker_provider_slot` |  | `ticker_id, provider_id, slot_start_utc` |
| `ux_intraday_data_slots_ticker_provider_slot` | ✓ | `ticker_id, provider_id, slot_start_utc` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `idx_intraday_data_slots_slot_start_utc` |  | `slot_start_utc` | ✅ Matches |
| `idx_intraday_data_slots_ticker_provider_slot` | ✓ | `ticker_id, provider_id, slot_start_utc` | ✅ Matches |
| `ix_intraday_data_slots_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `ux_intraday_data_slots_ticker_provider_slot` on `ticker_id, provider_id, slot_start_utc`

---

### `market_data_quotes`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_market_data_quotes_asof_utc` |  | `asof_utc` |
| `idx_market_data_quotes_fetched_at` |  | `fetched_at` |
| `idx_market_data_quotes_stale` |  | `is_stale` |
| `idx_market_data_quotes_ticker_provider` |  | `ticker_id, provider_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `idx_market_data_quotes_ticker_provider` |  | `ticker_id, provider_id` | ✅ Matches |
| `idx_market_data_quotes_asof_utc` |  | `asof_utc` | ✅ Matches |
| `idx_market_data_quotes_stale` |  | `is_stale` | ✅ Matches |
| `idx_market_data_quotes_fetched_at` |  | `fetched_at` | ✅ Matches |
| `ix_market_data_quotes_id` |  | `id` | ℹ️ New (not in DB) |

---

### `method_parameters`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_method_parameters_method_id` |  | `method_id` |
| `ix_method_parameters_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_method_parameters_id` |  | `id` | ✅ Matches |

⚠️  **Missing in models:**
- `idx_method_parameters_method_id` on `method_id`

---

### `note_relation_types`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_note_relation_types_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_note_relation_types_id` |  | `id` | ✅ Matches |

---

### `notes`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_notes_id` |  | `id` | ℹ️ New (not in DB) |

---

### `plan_conditions`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_plan_conditions_method_id` |  | `method_id` |
| `idx_plan_conditions_plan_id` |  | `trade_plan_id` |
| `ix_plan_conditions_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_plan_conditions_id` |  | `id` | ✅ Matches |

⚠️  **Missing in models:**
- `idx_plan_conditions_method_id` on `method_id`
- `idx_plan_conditions_plan_id` on `trade_plan_id`

---

### `preference_groups`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_preference_groups_id` |  | `id` | ℹ️ New (not in DB) |

---

### `preference_profiles`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_preference_profiles_user_active` |  | `user_id, is_active` |
| `ix_preference_profiles_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_preference_profiles_id` |  | `id` | ✅ Matches |

⚠️  **Missing in models:**
- `idx_preference_profiles_user_active` on `user_id, is_active`

---

### `preference_types`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_preference_types_active` |  | `is_active, group_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_preference_types_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `idx_preference_types_active` on `is_active, group_id`

---

### `preferences_legacy`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_preferences_legacy_id` |  | `id` |

⚠️  **Missing in models:**
- `ix_preferences_legacy_id` on `id`

---

### `quotes_last`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_quotes_last_asof_utc` |  | `asof_utc` |
| `idx_quotes_last_fetched_at` |  | `fetched_at` |
| `idx_quotes_last_provider` |  | `provider` |
| `idx_quotes_last_stale` |  | `is_stale` |
| `idx_quotes_last_ticker_id` |  | `ticker_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `idx_quotes_last_ticker_id` |  | `ticker_id` | ✅ Matches |
| `idx_quotes_last_asof_utc` |  | `asof_utc` | ✅ Matches |
| `ix_quotes_last_id` |  | `id` | ℹ️ New (not in DB) |
| `idx_quotes_last_fetched_at` |  | `fetched_at` | ✅ Matches |
| `idx_quotes_last_provider` |  | `provider` | ✅ Matches |
| `idx_quotes_last_stale` |  | `is_stale` | ✅ Matches |

---

### `system_setting_groups`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_system_setting_groups_id` |  | `id` |

⚠️  **Missing in models:**
- `ix_system_setting_groups_id` on `id`

---

### `system_setting_types`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_system_setting_types_id` |  | `id` |

⚠️  **Missing in models:**
- `ix_system_setting_types_id` on `id`

---

### `system_settings`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_system_settings_id` |  | `id` |
| `ix_system_settings_type_id` |  | `type_id` |

⚠️  **Missing in models:**
- `ix_system_settings_id` on `id`
- `ix_system_settings_type_id` on `type_id`

---

### `tag_categories`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_tag_categories_id` |  | `id` |
| `ix_tag_categories_user_id` |  | `user_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_tag_categories_user_id` |  | `user_id` | ✅ Matches |
| `ix_tag_categories_id` |  | `id` | ✅ Matches |

---

### `tag_links`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_tag_links_entity` |  | `entity_type, entity_id` |
| `ix_tag_links_id` |  | `id` |
| `ix_tag_links_tag_id` |  | `tag_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_tag_links_id` |  | `id` | ✅ Matches |
| `ix_tag_links_tag_id` |  | `tag_id` | ✅ Matches |
| `ix_tag_links_entity` |  | `entity_type, entity_id` | ✅ Matches |

---

### `tags`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_tags_id` |  | `id` |
| `ix_tags_user_id` |  | `user_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_tags_user_id` |  | `user_id` | ✅ Matches |
| `ix_tags_id` |  | `id` | ✅ Matches |

---

### `tickers`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_tickers_id` |  | `id` |
| `ix_tickers_symbol` | ✓ | `symbol` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_tickers_symbol` | ✓ | `symbol` | ✅ Matches |
| `ix_tickers_id` |  | `id` | ✅ Matches |

---

### `trade_conditions`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_trade_conditions_inherited` |  | `inherited_from_plan_condition_id` |
| `idx_trade_conditions_method_id` |  | `method_id` |
| `idx_trade_conditions_trade_id` |  | `trade_id` |
| `ix_trade_conditions_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_trade_conditions_id` |  | `id` | ✅ Matches |

⚠️  **Missing in models:**
- `idx_trade_conditions_inherited` on `inherited_from_plan_condition_id`
- `idx_trade_conditions_method_id` on `method_id`
- `idx_trade_conditions_trade_id` on `trade_id`

---

### `trade_plans`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_trade_plans_id` |  | `id` | ℹ️ New (not in DB) |

---

### `trades`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_trades_id` |  | `id` | ℹ️ New (not in DB) |

---

### `trading_accounts`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_trading_accounts_external_account_number` | ✓ | `external_account_number` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_trading_accounts_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `idx_trading_accounts_external_account_number` on `external_account_number`

---

### `trading_methods`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_trading_methods_id` |  | `id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_trading_methods_id` |  | `id` | ✅ Matches |

---

### `user_preferences`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `idx_user_preferences_preference_id` |  | `preference_id` |
| `idx_user_preferences_profile_id` |  | `profile_id` |
| `idx_user_preferences_user_id` |  | `user_id` |

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_user_preferences_id` |  | `id` | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `idx_user_preferences_preference_id` on `preference_id`
- `idx_user_preferences_profile_id` on `profile_id`
- `idx_user_preferences_user_id` on `user_id`

---

### `user_preferences_v3`

#### Database Indexes

| Name | Unique | Columns |
|------|--------|---------|
| `ix_user_preferences_v3_id` |  | `id` |

⚠️  **Missing in models:**
- `ix_user_preferences_v3_id` on `id`

---

### `users`

#### Model Indexes

| Name | Unique | Columns | Status |
|------|--------|---------|--------|
| `ix_users_id` |  | `id` | ℹ️ New (not in DB) |

---

## Recommendations

### Indexes to Add to Models

The following indexes exist in the database but are not defined in models.
They should be added to ensure they are created in PostgreSQL:

#### `idx_constraints_active` on `constraints`

```python
__table_args__ = (
    Index('idx_constraints_active', 'is_active'),
)
```

#### `idx_constraints_table_column` on `constraints`

```python
__table_args__ = (
    Index('idx_constraints_table_column', 'table_name', 'column_name'),
)
```

#### `idx_constraints_type` on `constraints`

```python
__table_args__ = (
    Index('idx_constraints_type', 'constraint_type'),
)
```

#### `idx_trade_conditions_inherited` on `trade_conditions`

```python
__table_args__ = (
    Index('idx_trade_conditions_inherited', 'inherited_from_plan_condition_id'),
)
```

#### `idx_trade_conditions_method_id` on `trade_conditions`

```python
__table_args__ = (
    Index('idx_trade_conditions_method_id', 'method_id'),
)
```

#### `idx_trade_conditions_trade_id` on `trade_conditions`

```python
__table_args__ = (
    Index('idx_trade_conditions_trade_id', 'trade_id'),
)
```

#### `ix_system_settings_id` on `system_settings`

```python
__table_args__ = (
    Index('ix_system_settings_id', 'id'),
)
```

#### `ix_system_settings_type_id` on `system_settings`

```python
__table_args__ = (
    Index('ix_system_settings_type_id', 'type_id'),
)
```

#### `idx_preference_types_active` on `preference_types`

```python
__table_args__ = (
    Index('idx_preference_types_active', 'is_active', 'group_id'),
)
```

#### `idx_user_preferences_preference_id` on `user_preferences`

```python
__table_args__ = (
    Index('idx_user_preferences_preference_id', 'preference_id'),
)
```

#### `idx_user_preferences_profile_id` on `user_preferences`

```python
__table_args__ = (
    Index('idx_user_preferences_profile_id', 'profile_id'),
)
```

#### `idx_user_preferences_user_id` on `user_preferences`

```python
__table_args__ = (
    Index('idx_user_preferences_user_id', 'user_id'),
)
```

#### `idx_plan_conditions_method_id` on `plan_conditions`

```python
__table_args__ = (
    Index('idx_plan_conditions_method_id', 'method_id'),
)
```

#### `idx_plan_conditions_plan_id` on `plan_conditions`

```python
__table_args__ = (
    Index('idx_plan_conditions_plan_id', 'trade_plan_id'),
)
```

#### `ix_preferences_legacy_id` on `preferences_legacy`

```python
__table_args__ = (
    Index('ix_preferences_legacy_id', 'id'),
)
```

#### `idx_preference_profiles_user_active` on `preference_profiles`

```python
__table_args__ = (
    Index('idx_preference_profiles_user_active', 'user_id', 'is_active'),
)
```

#### `ix_system_setting_groups_id` on `system_setting_groups`

```python
__table_args__ = (
    Index('ix_system_setting_groups_id', 'id'),
)
```

#### `ix_import_sessions_created_at` on `import_sessions`

```python
__table_args__ = (
    Index('ix_import_sessions_created_at', 'created_at'),
)
```

#### `ix_import_sessions_provider` on `import_sessions`

```python
__table_args__ = (
    Index('ix_import_sessions_provider', 'provider'),
)
```

#### `ix_import_sessions_status` on `import_sessions`

```python
__table_args__ = (
    Index('ix_import_sessions_status', 'status'),
)
```

#### `ix_import_sessions_trading_account_id` on `import_sessions`

```python
__table_args__ = (
    Index('ix_import_sessions_trading_account_id', 'trading_account_id'),
)
```

#### `idx_validation_active` on `constraint_validations`

```python
__table_args__ = (
    Index('idx_validation_active', 'is_active'),
)
```

#### `idx_validation_constraint_id` on `constraint_validations`

```python
__table_args__ = (
    Index('idx_validation_constraint_id', 'constraint_id'),
)
```

#### `idx_validation_type` on `constraint_validations`

```python
__table_args__ = (
    Index('idx_validation_type', 'validation_type'),
)
```

#### `idx_enum_active` on `enum_values`

```python
__table_args__ = (
    Index('idx_enum_active', 'is_active'),
)
```

#### `idx_enum_constraint_id` on `enum_values`

```python
__table_args__ = (
    Index('idx_enum_constraint_id', 'constraint_id'),
)
```

#### `idx_enum_sort` on `enum_values`

```python
__table_args__ = (
    Index('idx_enum_sort', 'sort_order'),
)
```

#### `idx_trading_accounts_external_account_number` on `trading_accounts`

```python
__table_args__ = (
    Index('idx_trading_accounts_external_account_number', 'external_account_number'),
)
```

#### `idx_method_parameters_method_id` on `method_parameters`

```python
__table_args__ = (
    Index('idx_method_parameters_method_id', 'method_id'),
)
```

#### `ix_system_setting_types_id` on `system_setting_types`

```python
__table_args__ = (
    Index('ix_system_setting_types_id', 'id'),
)
```

#### `ux_intraday_data_slots_ticker_provider_slot` on `intraday_data_slots`

```python
__table_args__ = (
    Index('ux_intraday_data_slots_ticker_provider_slot', 'ticker_id', 'provider_id', 'slot_start_utc'),
)
```

#### `idx_conditions_mapping_alert` on `condition_alerts_mapping`

```python
__table_args__ = (
    Index('idx_conditions_mapping_alert', 'alert_id'),
)
```

#### `idx_conditions_mapping_condition` on `condition_alerts_mapping`

```python
__table_args__ = (
    Index('idx_conditions_mapping_condition', 'condition_id', 'condition_type'),
)
```

#### `ix_user_preferences_v3_id` on `user_preferences_v3`

```python
__table_args__ = (
    Index('ix_user_preferences_v3_id', 'id'),
)
```

---
