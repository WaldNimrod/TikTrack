# Data Model (PostgreSQL, SQLAlchemy Models)

## Core Trading Entities

- `users`: accounts with auth metadata; linked to preferences, watch lists, user_ticker, notes.
- `trading_accounts`: per-user accounts; parent for trades, cash flows, executions; currency support.
- `tickers`: instruments with symbols/types; enriched via external data.
- `user_ticker`: user-level ticker metadata (custom name/type/status, preferences linkage).
- `trade_plans`: planned trades (targets, stop, allocation, conditions).
- `trades`: live/closed trades linked to trade plans and trading accounts.
- `executions`: fills per trade; used for average price/positions.
- `cash_flows`: cash movements per trading account.
- `alerts`: condition-based alerts referencing tickers/trades/plans; depends on conditions system.
- `notes`: generic notes with `note_relation_type` for entity linkage.
- `watch_lists` and items (via join to tickers/user).
- `tags`, `tag_category`, `tag_link`: tagging system with cleanup hooks.

## Analytical & History

- `trade_history`, `portfolio_state`, `positions` (via services) surface historical snapshots.
- `plan_condition`, `trade_condition`, `trading_method`: condition templates and methods (six trading
  methods).
- `ai_analysis`: persisted AI analysis requests/responses and metadata.

## External Data & Metrics

- `external_data_providers`: provider registry.
- `quotes` / `quotes_last`: historical and latest quote storage.
- `eod_metrics` (see `eod_metrics_models.py`): daily computed indicators (MA, week52, etc.).
- `cache_change_log`: cache mutation audit.
- `email_log`: outbound email history (SMTP service).

## Configuration & Preferences

- `preferences`: user profiles (v4), dependencies, color schemes; exposed via `/api/preferences/*`
  and `/api/preferences-v4/*`.
- `system_settings` and `system_setting_groups`: global config for runtime flags.
- `import_session`: tracking import runs for data-import flows.
- `password_reset_token`: credential recovery flow.
- `currencies`: currency metadata and rates.

## Relationships (high level)

- user ↔ trading_accounts (1:N), trading_account ↔ trades (1:N), trade ↔ executions (1:N), trade ↔
  trade_plan (N:1), trade_plan ↔ plan_condition (N:1), trade ↔ trade_condition (N:1).
- user ↔ tickers (via user_ticker; custom fields/status), tickers ↔ watch_lists (via join).
- tags/tag_links attach to most entities (trade, trade_plan, execution, note, watch_list, ticker,
  trading_account).
- preferences and system_settings are user-scoped and global respectively; many frontend systems load
  them via unified preferences services.

## Notes for Engineers

- Use existing services for validation/calculations (see general systems list and data services)
  instead of direct SQL.
- User scoping is expected on all entity queries (filters already present in business services;
  harden for production).
- External data tables are written by schedulers; avoid manual writes outside adapters.


