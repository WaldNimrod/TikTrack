# Foreign Key Verification Report

This document compares foreign keys in the SQLite database with foreign keys
defined in SQLAlchemy models to ensure proper migration to PostgreSQL.

## Summary

- **Total foreign keys in DB:** 42
- **Total foreign keys in models:** 39

⚠️  **Foreign keys in DB but not in models:** 10
ℹ️  **Foreign keys in models but not in DB:** 7 (may be new)

---

## Foreign Key Comparison by Table

### `alerts`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `related_type_id` | `note_relation_types` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |
| `trade_condition_id` | `trade_conditions` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |
| `plan_condition_id` | `plan_conditions` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |

⚠️  **Missing in models:**
- `trading_account_id` → `trading_accounts.id` (NO ACTION)

---

### `cash_flows`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `currency_id` | `currencies` | `id` | NO ACTION | NO ACTION |
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `currency_id` | `currencies` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `trade_id` | `trades` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |

---

### `condition_alerts_mapping`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `alert_id` | `alerts` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `alert_id` | `alerts` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `constraint_validations`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `constraint_id` | `constraints` | `id` | NO ACTION | CASCADE |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `constraint_id` | `constraints` | `id` | NO ACTION | NO ACTION | ⚠️ Cascade mismatch (DB: CASCADE, Model: NO ACTION) |

---

### `data_refresh_logs`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `provider_id` | `external_data_providers` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `provider_id` | `external_data_providers` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `enum_values`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `constraint_id` | `constraints` | `id` | NO ACTION | CASCADE |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `constraint_id` | `constraints` | `id` | NO ACTION | NO ACTION | ⚠️ Cascade mismatch (DB: CASCADE, Model: NO ACTION) |

---

### `executions`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION |
| `trade_id` | `trades` | `id` | NO ACTION | NO ACTION |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `trade_id` | `trades` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `import_sessions`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `intraday_data_slots`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `provider_id` | `external_data_providers` | `id` | NO ACTION | NO ACTION |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `provider_id` | `external_data_providers` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `market_data_quotes`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `provider_id` | `external_data_providers` | `id` | NO ACTION | NO ACTION |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `provider_id` | `external_data_providers` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `method_parameters`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `method_id` | `trading_methods` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `method_id` | `trading_methods` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `notes`

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `related_type_id` | `note_relation_types` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |

---

### `plan_conditions`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `method_id` | `trading_methods` | `id` | NO ACTION | NO ACTION |
| `trade_plan_id` | `trade_plans` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `trade_plan_id` | `trade_plans` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `method_id` | `trading_methods` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `preference_profiles`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `created_by` | `users` | `id` | NO ACTION | NO ACTION |
| `user_id` | `users` | `id` | NO ACTION | NO ACTION |

⚠️  **Missing in models:**
- `created_by` → `users.id` (NO ACTION)
- `user_id` → `users.id` (NO ACTION)

---

### `preference_types`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `group_id` | `preference_groups` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `group_id` | `preference_groups` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `quotes_last`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `system_setting_types`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `group_id` | `system_setting_groups` | `id` | NO ACTION | NO ACTION |

⚠️  **Missing in models:**
- `group_id` → `system_setting_groups.id` (NO ACTION)

---

### `system_settings`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `type_id` | `system_setting_types` | `id` | NO ACTION | NO ACTION |

⚠️  **Missing in models:**
- `type_id` → `system_setting_types.id` (NO ACTION)

---

### `tag_links`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `tag_id` | `tags` | `id` | NO ACTION | CASCADE |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `tag_id` | `tags` | `id` | NO ACTION | CASCADE | ✅ Matches |

---

### `tags`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `category_id` | `tag_categories` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `category_id` | `tag_categories` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `tickers`

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `currency_id` | `currencies` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |

---

### `tickers_new`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `currency_id` | `currencies` | `id` | NO ACTION | NO ACTION |

⚠️  **Missing in models:**
- `currency_id` → `currencies.id` (NO ACTION)

---

### `trade_conditions`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `inherited_from_plan_condition_id` | `plan_conditions` | `id` | NO ACTION | NO ACTION |
| `method_id` | `trading_methods` | `id` | NO ACTION | NO ACTION |
| `trade_id` | `trades` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `inherited_from_plan_condition_id` | `plan_conditions` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `trade_id` | `trades` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `method_id` | `trading_methods` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `trade_plans`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `trades`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `trade_plan_id` | `trade_plans` | `id` | NO ACTION | NO ACTION |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION |
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `trading_account_id` | `trading_accounts` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `ticker_id` | `tickers` | `id` | NO ACTION | NO ACTION | ✅ Matches |
| `trade_plan_id` | `trade_plans` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `trading_accounts`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `currency_id` | `currencies` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `currency_id` | `currencies` | `id` | NO ACTION | NO ACTION | ✅ Matches |

---

### `user_preferences`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `user_id` | `preference_profiles` | `user_id` | NO ACTION | NO ACTION |
| `profile_id` | `preference_profiles` | `profile_name` | NO ACTION | NO ACTION |
| `preference_id` | `preference_types` | `id` | NO ACTION | NO ACTION |

#### Model Foreign Keys

| From Column | To Table | To Column | On Update | On Delete | Status |
|-------------|----------|-----------|-----------|-----------|--------|
| `profile_id` | `preference_profiles` | `id` | NO ACTION | NO ACTION | ℹ️ New (not in DB) |
| `preference_id` | `preference_types` | `id` | NO ACTION | NO ACTION | ✅ Matches |

⚠️  **Missing in models:**
- `user_id` → `preference_profiles.user_id` (NO ACTION)
- `profile_id` → `preference_profiles.profile_name` (NO ACTION)

---

### `user_preferences_v3`

#### Database Foreign Keys

| From Column | To Table | To Column | On Update | On Delete |
|-------------|----------|-----------|-----------|-----------|
| `preference_id` | `preference_types` | `id` | NO ACTION | NO ACTION |
| `profile_id` | `preference_profiles` | `id` | NO ACTION | NO ACTION |

⚠️  **Missing in models:**
- `preference_id` → `preference_types.id` (NO ACTION)
- `profile_id` → `preference_profiles.id` (NO ACTION)

---

## Cascading Delete Summary

Foreign keys with CASCADE DELETE:

| Table | Column | To Table | Action |
|-------|--------|----------|--------|
| `constraint_validations` | `constraint_id` | `constraints` | CASCADE |
| `enum_values` | `constraint_id` | `constraints` | CASCADE |
| `tag_links` | `tag_id` | `tags` | CASCADE |

---

## Recommendations

### Foreign Keys to Add to Models

The following foreign keys exist in the database but are not defined in models.
They should be added to ensure proper referential integrity in PostgreSQL:

#### `tickers_new.currency_id` → `currencies.id`

```python
from_column = Column(Integer, ForeignKey('currencies.id'))
```

#### `user_preferences_v3.preference_id` → `preference_types.id`

```python
from_column = Column(Integer, ForeignKey('preference_types.id'))
```

#### `user_preferences_v3.profile_id` → `preference_profiles.id`

```python
from_column = Column(Integer, ForeignKey('preference_profiles.id'))
```

#### `alerts.trading_account_id` → `trading_accounts.id`

```python
from_column = Column(Integer, ForeignKey('trading_accounts.id'))
```

#### `user_preferences.user_id` → `preference_profiles.user_id`

```python
from_column = Column(Integer, ForeignKey('preference_profiles.user_id'))
```

#### `user_preferences.profile_id` → `preference_profiles.profile_name`

```python
from_column = Column(Integer, ForeignKey('preference_profiles.profile_name'))
```

#### `system_settings.type_id` → `system_setting_types.id`

```python
from_column = Column(Integer, ForeignKey('system_setting_types.id'))
```

#### `preference_profiles.created_by` → `users.id`

```python
from_column = Column(Integer, ForeignKey('users.id'))
```

#### `preference_profiles.user_id` → `users.id`

```python
from_column = Column(Integer, ForeignKey('users.id'))
```

#### `system_setting_types.group_id` → `system_setting_groups.id`

```python
from_column = Column(Integer, ForeignKey('system_setting_groups.id'))
```

---
