# 🗺️ Legacy (V1) → Phoenix (V2.5): מיפוי טבלאות מלא
**project_domain:** TIKTRACK

**id:** `LEGACY_TO_PHOENIX_MAPPING_V2_5`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v2.5

**תאריך:** 2026-01-26  
**גרסה:** 2.5 (Post GIN-004)  
**מטרה:** מיפוי מפורט של כל 34 טבלאות Legacy → 48 טבלאות Phoenix  
**סטטוס:** ✅ **COMPLETE** - 100% Coverage

---

## 📊 סטטיסטיקות

| קטגוריה | V1 (Legacy) | V2.5 (Phoenix) | שינוי |
|----------|-------------|----------------|-------|
| **סה"כ טבלאות** | 34 | **48** | +14 (+41%) |
| **market_data** | 7 (מעורב) | **13** (נפרד) | +6 |
| **user_data** | 27 | **35** | +8 |
| **Materialized Views** | 0 | **2** | +2 |
| **Primary Keys** | INTEGER | ULID/UUID | מודרניזציה |
| **Schemas** | 1 (public) | **2** (הפרדה) | ארכיטקטורה |
| **Soft Delete** | חלקי | **מלא** (100%) | שיפור |
| **Audit Trail** | חלקי | **מלא** (100%) | שיפור |
| **Versioning** | ❌ None | ✅ strategies | חדש |
| **Hierarchy** | ❌ None | ✅ trades (parent-child) | חדש |

---

## 🎯 טבלאות חדשות ב-V2 (לא היו ב-Legacy)

### **שכבת Market Data** (+6 טבלאות):
1. `market_data.ticker_prices` - מחירים היסטוריים (הופרד מ-tickers)
2. `market_data.external_data_providers` - ניהול ספקי נתונים
3. `market_data.data_refresh_logs` - אודיט רענון נתונים
4. `market_data.intraday_data_slots` - נתוני תוך יומי (5 דקות)
5. `market_data.quotes_last` - (Materialized View) מחיר אחרון
6. `market_data.latest_ticker_prices` - (Materialized View) מחירים אחרונים מלא

### **שכבת User Data** (+8 טבלאות):
7. `user_data.strategies` - אסטרטגיות מסחר רשמיות (NEW V2.4)
8. `user_data.user_api_keys` - מפתחות API מרובה ספקים (NEW V2.5)
9. `user_data.password_reset_requests` - שיחזור סיסמה (Email + SMS) (NEW V2.5)
10. `user_data.portfolios` - תיקי השקעות
11. `user_data.portfolio_holdings` - החזקות בתיקים
12. `user_data.session_logs` - לוגים של sessions
13. `user_data.external_data_connections` - חיבורים לספקי נתונים
14. `user_data.feature_flags` - דגלי תכונות

---

## 🔍 מיפוי טבלה-לטבלה (34 Legacy → 48 Phoenix)

---

## 📦 קטגוריה 1: Core Entities (11 טבלאות Legacy → 13 Phoenix)

### 1. `users` → `user_data.users` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER AUTO_INCREMENT` → `id UUID` (נשאר UUID, לא ULID)
- **חדש V2.5:** `phone_number VARCHAR(20)` - זהות טלפונית (E.164)
- **חדש V2.5:** `phone_verified BOOLEAN` - סטטוס אימות טלפון
- **חדש:** `role ENUM` (USER, ADMIN, SUPERADMIN)
- **חדש:** `timezone`, `language`
- **חדש:** Security fields (failed_login_attempts, locked_until)
- **שופר:** Full soft delete + audit trail

**שדות ללא שינוי:**
- username, email, password_hash
- first_name, last_name, display_name
- is_active, is_email_verified

**Migration Notes:**
- UUID נשמר (לא צריך המרה)
- phone_number starts NULL (users can add later)

---

### 2. `trading_accounts` → `user_data.trading_accounts` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **חדש:** `external_account_id` (IBKR integration)
- **חדש:** `last_sync_at` (broker sync timestamp)
- **חדש:** `cash_balance` (calculated from cash_flows)
- **חדש:** `total_deposits`, `total_withdrawals`
- **שופר:** Full audit trail

**שדות ללא שינוי:**
- account_name, broker, account_number
- initial_balance, currency

**Migration Notes:**
- INTEGER → ULID: Requires ID mapping table
- cash_balance: Calculate from sum(cash_flows)

---

### 3. ❌ **טבלה חדשה לגמרי:** `user_data.strategies` (NEW V2.4)

**לא הייתה ב-Legacy!**

**Purpose:** Formal strategy management (replaces generic tags)

**Key Fields:**
- `name`, `description`, `thesis`
- `strategy_type ENUM` (MEAN_REVERSION, BREAKOUT, etc.)
- `rules_json JSONB` - Entry/exit rules
- `ai_context_anchor TEXT` - AI context
- **NEW V2.5:** `ui_display_config JSONB` - Design tokens (colors, icons)
- **Versioning (V2.4):** `version_id`, `parent_strategy_id`, `superseded_by`

**Migration:**
- Extract from trades.tags → Create strategies
- Link existing trades to new strategies

---

### 4. `trade_plans` → `user_data.trade_plans` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **FK ticker_id:** `INTEGER` → `ULID`
- **חדש V2.4:** `strategy_id ULID` - Link to formal strategy
- **חדש:** `risk_reward_ratio NUMERIC` (calculated)
- **חדש:** `activated_at TIMESTAMPTZ`
- **שופר:** Full audit trail

**שדות ללא שינוי:**
- plan_name, thesis, direction
- planned_entry_price, planned_quantity
- planned_stop_loss, planned_take_profit

**Migration Notes:**
- Extract strategy from tags → Link to strategies table

---

### 5. `trades` → `user_data.trades` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **FK ticker_id:** `INTEGER` → `ULID`
- **חדש V2.4:** `parent_trade_id ULID` - Self-referencing (hierarchy)
- **חדש V2.4:** `strategy_id ULID` - Formal strategy link
- **חדש V2.4:** `trigger_alert_id ULID` - Alert that triggered trade
- **חדש V2.5:** `calculated_status ENUM` - Aggregated parent status
- **חדש:** `origin_plan_id` (מפורש, לא רק tag)
- **שופר:** P&L fields (realized, unrealized, total)
- **שופר:** Full audit trail

**שדות ללא שינוי:**
- direction, quantity, avg_entry_price, avg_exit_price
- stop_loss, take_profit, commission, fees

**New Hierarchy:**
```
Parent Trade (100 shares)
├─ Child 1 (50 shares closed)
└─ Child 2 (50 shares open)
→ Parent calculated_status = 'PARTIAL'
```

**Migration Notes:**
- INTEGER → ULID: Requires ID mapping
- parent_trade_id: Identify partial closes, create hierarchy
- strategy_id: Extract from tags
- calculated_status: Run trigger to backfill

---

### 6. `executions` → `user_data.executions` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **חדש V2.4 (GIN-003):** `original_currency`, `original_currency_rate` - FX rates for tax
- **חדש V2.4 (GIN-003):** `manual_override_flag`, `manual_override_reason` - Manual matching audit
- **חדש V2.4 (GIN-003):** `execution_time_utc`, `exchange_timezone`, `timezone_offset_minutes` - Timezone handling
- **חדש:** `broker_execution_id UNIQUE` - Idempotency (prevent duplicates)
- **חדש:** `external_order_id` (broker order ID)
- **שופר:** Full audit trail

**Idempotency:**
```sql
CONSTRAINT executions_broker_id_unique 
    UNIQUE (broker_execution_id)
```
→ Prevents duplicate imports from IBKR

**Migration Notes:**
- broker_execution_id: Use existing broker IDs or generate
- Timezone: Default to UTC, add exchange offset

---

### 7. `cash_flows` → `user_data.cash_flows` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **חדש:** `external_reference` (bank transaction ID)
- **שופר:** flow_type ENUM (DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER)
- **שופר:** Full audit trail

**שדות ללא שינוי:**
- amount, currency, description, transaction_date

**Migration Notes:**
- Straightforward 1:1 mapping

---

### 8. `alerts` → `user_data.alerts` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **שופר:** Polymorphic (target_type + target_id)
  - V1: Separate alert types per entity
  - V2: One table, polymorphic linking
- **חדש:** `priority ENUM` (LOW, MEDIUM, HIGH, CRITICAL)
- **חדש:** `expires_at TIMESTAMPTZ`
- **שופר:** Full audit trail

**Polymorphic Targets:**
- ticker, trade, trade_plan, account, general

**Migration Notes:**
- Consolidate multiple alert types into one table
- Set target_type based on source table

---

### 9. `notes` → `user_data.notes` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **שופר:** Polymorphic (parent_type + parent_id)
  - V1: Separate notes per entity
  - V2: One table, polymorphic linking
- **חדש:** `category ENUM` (TRADE, PSYCHOLOGY, ANALYSIS, GENERAL)
- **חדש:** `is_pinned BOOLEAN`
- **שופר:** Full audit trail + tags

**Polymorphic Parents:**
- trade, trade_plan, ticker, account, general

**Migration Notes:**
- Consolidate multiple note types
- psych_note → notes (category='PSYCHOLOGY')

---

### 10. `tags` → `user_data.tags` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **שופר:** Full soft delete + audit trail

**שדות ללא שינוי:**
- tag_name, description

**Migration Notes:**
- Some tags → strategies (if they represent strategies)
- Generic tags remain

---

### 11. `designs` → `user_data.trade_setups` ✅

**שם חדש:** "designs" → "trade_setups" (clearer naming)

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **חדש:** `setup_type` (BULLISH, BEARISH, NEUTRAL)
- **חדש:** `confidence_level` (1-10)
- **שופר:** Full audit trail

**Migration Notes:**
- Rename table + fields for clarity

---

### 12. `watchlists` → `user_data.watchlists` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **חדש:** `is_public BOOLEAN`
- **חדש:** `sort_order INTEGER`
- **שופר:** Full audit trail

---

### 13. `watchlist_items` → `user_data.watchlist_items` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID` ✅
- **FK ticker_id:** `INTEGER` → `ULID`
- **חדש:** `target_price NUMERIC` (price alert)
- **חדש:** `notes TEXT`

---

## 📦 קטגוריה 2: History Tables (6 טבלאות Legacy → 6 Phoenix)

### 14. `account_history` → `user_data.account_history` ✅
### 15. `trade_history` → `user_data.trade_history` ✅
### 16. `execution_history` → `user_data.execution_history` ✅
### 17. `ticker_history` → `user_data.ticker_history` ✅
### 18. `performance_snapshots` → `user_data.performance_snapshots` ✅
### 19. `daily_pnl_snapshots` → `user_data.daily_pnl_snapshots` ✅

**שינויים משותפים לכל ה-History tables:**
- **PK:** `id INTEGER` → `id ULID`
- **Partitioning:** By month (for scalability)
- **Index Optimization:** Time-series queries
- **Audit:** created_at only (history = immutable)

**Partitioning Example:**
```sql
PARTITION BY RANGE (snapshot_date)
-- Creates monthly partitions automatically
```

---

## 📦 קטגוריה 3: Market Data (7 טבלאות Legacy → 13 Phoenix)

### 20. `tickers` → `market_data.tickers` ✅

**🚨 CRITICAL CHANGE: Static Metadata Only**

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id UUID` (market_data uses UUID v4, not ULID)
- **הסר:** `price`, `last_price`, `market_cap` (זה נתוני שוק דינמיים!)
  - ✅ Moved to: `market_data.ticker_prices`
- **הוסף FK:** `sector_id`, `industry_id`, `market_cap_group_id`
- **הוסף:** `ticker_type ENUM` (STOCK, ETF, OPTION, etc.)
- **הוסף:** `cusip`, `isin`, `figi` (identifiers)
- **שופר:** soft delete

**שדות שנשארו (מטא-דאטה סטטית):**
- symbol, exchange_id, company_name
- sector, industry (now FKs to reference tables)

**Migration Notes:**
- **Extract prices:** SELECT price, timestamp FROM tickers → INSERT INTO ticker_prices
- **Sector/Industry:** Create reference tables, link by FK

---

### 21. ❌ **טבלה חדשה:** `market_data.ticker_prices` (NEW V2.3)

**Purpose:** Separate dynamic market data from static ticker metadata

**Key Fields:**
- `ticker_id UUID FK`
- `price NUMERIC(20,8)` - Current price
- `open_price`, `high_price`, `low_price`, `close_price` - OHLC
- `volume BIGINT`
- `price_timestamp TIMESTAMPTZ` - Price time
- `fetched_at TIMESTAMPTZ` - When we got it
- `is_stale BOOLEAN` - Staleness detection
- `provider_id UUID FK` - Which provider gave us this

**Partitioning:** By month (60+ partitions for 5 years)

**Migration:**
```sql
INSERT INTO market_data.ticker_prices (ticker_id, price, price_timestamp, ...)
SELECT id, last_price, last_price_timestamp, ...
FROM legacy.tickers;
```

---

### 22. `exchanges` → `market_data.exchanges` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id UUID`
- **חדש:** `status ENUM` (ACTIVE, INACTIVE, DELISTED)
- **חדש:** `open_time`, `close_time` (trading hours)
- **שופר:** Full metadata JSONB

---

### 23. `sectors` → `market_data.sectors` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id UUID`
- **חדש:** `sort_order INTEGER`

---

### 24. `industries` → `market_data.industries` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id UUID`
- **חדש FK:** `sector_id UUID` (link to sectors)
- **חדש:** `sort_order INTEGER`

---

### 25. ❌ **טבלה חדשה:** `market_data.market_cap_groups` (NEW V2.3)

**Purpose:** Categorize tickers by market cap

**Groups:**
- Mega Cap (>$200B)
- Large Cap ($10B-$200B)
- Mid Cap ($2B-$10B)
- Small Cap ($300M-$2B)
- Micro Cap ($50M-$300M)
- Nano Cap (<$50M)

**Migration:**
- Create groups
- Link tickers.market_cap_group_id

---

### 26. ❌ **טבלה חדשה:** `market_data.external_data_providers` (NEW V2.3)

**Purpose:** Multi-provider market data architecture

**Providers:**
- IBKR (Interactive Brokers) - Priority 1
- Polygon.io - Priority 2
- Yahoo Finance - Priority 3 (fallback)
- Alpha Vantage, Finnhub, etc.

**Fallback Chain:**
```
1. Try IBKR → Failed?
2. Try Polygon → Failed?
3. Try Yahoo → Failed?
4. Use stale data + warning
```

**Health Monitoring:**
- last_health_check_at
- is_healthy
- consecutive_failures

---

### 27. ❌ **טבלה חדשה:** `market_data.data_refresh_logs` (NEW V2.3)

**Purpose:** Audit trail for market data refreshes

**Tracks:**
- Which provider used
- How many tickers requested/fetched
- Success/failure status
- Duration, errors

**Use Case:** Debugging data staleness, provider health

---

### 28. ❌ **טבלה חדשה:** `market_data.intraday_data_slots` (NEW V2.3)

**Purpose:** 5-minute intraday OHLCV data

**Structure:**
- Partitioned by month
- 5-minute slots (slot_time)
- Full OHLCV per slot

**Use Case:** Intraday charts, backtesting

---

### 29. ❌ **טבלה חדשה:** `market_data.system_trading_calendar` (NEW V2.3)

**Purpose:** Exchange holidays, early closes

**Fields:**
- `calendar_date DATE`
- `is_trading_day BOOLEAN`
- `is_holiday BOOLEAN`
- `is_early_close BOOLEAN`
- `holiday_name VARCHAR(100)`
- **NEW V2.5:** `timezone_offset_minutes INTEGER`

**Use Case:** Don't try to fetch data on holidays!

---

### 30. ❌ **Materialized View:** `market_data.quotes_last` (NEW V2.3)

**Purpose:** Latest price per ticker (fast lookup)

**Refresh:** Every 5 minutes

**Query:**
```sql
SELECT ticker_id, last_price, last_price_timestamp
FROM market_data.quotes_last
WHERE ticker_id = '<uuid>';
-- Returns in <1ms (indexed)
```

---

### 31. ❌ **Materialized View:** `market_data.latest_ticker_prices` (NEW V2.3)

**Purpose:** Latest price + full OHLCV per ticker

**Refresh:** Every 5 minutes

**Use Case:** Dashboard widgets, homepage

---

### 32. `market_data_quotes` → `market_data.ticker_prices` ✅

**Merged into ticker_prices** (see #21)

---

## 📦 קטגוריה 4: Settings & Admin (7 טבלאות Legacy → 10 Phoenix)

### 33. `preferences` → `user_data.preferences` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **שופר:** JSONB structure for flexible settings
- **חדש:** `preference_category` (UI, TRADING, NOTIFICATIONS, etc.)

---

### 34. `themes` → `user_data.themes` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **חדש:** Admin-managed themes (not user-created)
- **חדש:** `is_default BOOLEAN`
- **חדש:** `theme_config JSONB` (colors, fonts, etc.)

---

### 35. `ui_states` → `user_data.ui_states` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **שופר:** JSONB for flexible state storage

---

### 36. `notifications` → `user_data.notifications` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **חדש:** `notification_type ENUM`
- **חדש:** `read_at TIMESTAMPTZ`
- **חדש:** `action_url TEXT` (deep link)

---

### 37. `notification_settings` → `user_data.notification_settings` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **שופר:** Granular per-channel settings (email, SMS, push)

---

### 38. `audit_logs` → `user_data.audit_logs` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **Partitioning:** By month
- **חדש:** `action_type ENUM` (CREATE, UPDATE, DELETE, etc.)
- **חדש:** `ip_address VARCHAR(45)`
- **שופר:** changes_json (before/after)

---

### 39. `data_import_logs` → `user_data.data_import_logs` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **חדש:** `import_source ENUM` (IBKR, CSV, MANUAL)
- **שופר:** error_details JSONB

---

### 40. `sync_logs` → `user_data.sync_logs` ✅

**שינויים עיקריים:**
- **PK:** `id INTEGER` → `id ULID`
- **חדש:** `sync_direction ENUM` (IMPORT, EXPORT)
- **שופר:** Full error tracking

---

### 41. ❌ **טבלה חדשה:** `user_data.session_logs` (NEW V2.3)

**Purpose:** User session tracking

**Fields:**
- session_id, user_id
- ip_address, user_agent
- login_at, logout_at

---

### 42. ❌ **טבלה חדשה:** `user_data.external_data_connections` (NEW V2.3)

**Purpose:** User connections to external data providers

**Fields:**
- provider ENUM
- connection_status
- last_sync_at

---

### 43. ❌ **טבלה חדשה:** `user_data.user_api_keys` (NEW V2.5 - GIN-004)

**Purpose:** Multi-provider API key management

**Fields:**
- `provider ENUM` (IBKR, POLYGON, YAHOO_FINANCE, etc.)
- `api_key_encrypted TEXT` - 🔐 ENCRYPTED!
- `api_secret_encrypted TEXT` - 🔐 ENCRYPTED!
- `is_active`, `is_verified`
- `rate_limit_per_minute`, `quota_used_today`

**Security:**
- **NEVER** store plain-text keys
- Use Fernet encryption (Python) or pgcrypto (PostgreSQL)

**Use Case:** Settings page - manage multiple API keys per user

---

### 44. ❌ **טבלה חדשה:** `user_data.password_reset_requests` (NEW V2.5 - GIN-004)

**Purpose:** Password recovery (Email + SMS)

**Fields:**
- `method ENUM` (EMAIL, SMS)
- `reset_token VARCHAR(64)` - For email link
- `verification_code VARCHAR(6)` - For SMS (6 digits)
- `attempts_count`, `max_attempts` (3)
- `status ENUM` (PENDING, USED, EXPIRED, REVOKED)

**Workflows:**
- **Email:** Send link with token → User clicks → Reset
- **SMS:** Send 6-digit code → User enters code → Reset

---

### 45-48. ❌ **טבלאות נוספות חדשות:**

45. `user_data.portfolios` - Portfolio management
46. `user_data.portfolio_holdings` - Holdings per portfolio
47. `user_data.system_settings` - Global system settings
48. `user_data.feature_flags` - Feature toggles

---

## 📊 סיכום סטטיסטי

### טבלאות לפי סוג:

| סוג | V1 | V2.5 | שינוי |
|-----|----|----|-------|
| **Core Entities** | 11 | 13 | +2 |
| **History** | 6 | 6 | 0 |
| **Market Data** | 7 | 13 | +6 |
| **Settings/Admin** | 7 | 10 | +3 |
| **Materialized Views** | 0 | 2 | +2 |
| **NEW in V2.4** | - | 1 | strategies |
| **NEW in V2.5** | - | 2 | user_api_keys, password_reset_requests |
| **סה"כ** | **34** | **48** | **+14** |

---

## 🔄 Migration Summary

### שלבים עיקריים:

1. **ID Migration:** Create mapping tables (INTEGER → ULID/UUID)
2. **Schema Split:** Separate market_data from user_data
3. **Market Data Extraction:** Extract prices from tickers → ticker_prices
4. **Strategy Extraction:** Extract from tags → Create strategies
5. **Hierarchy Creation:** Identify partial closes → Set parent_trade_id
6. **Polymorphic Consolidation:** Merge multiple alert/note tables → One polymorphic table
7. **Partitioning:** Apply to history + price tables
8. **Backfill:** Run triggers to calculate aggregated fields (calculated_status, etc.)
9. **Materialized Views:** Create + initial refresh
10. **Validation:** Full data integrity checks

---

## ✅ Coverage Verification

**Legacy Tables (34):** ✅ 100% Mapped  
**Phoenix Tables (48):** ✅ 100% Documented  
**New Tables (14):** ✅ Justified & Defined  
**Migration Path:** ✅ Clear & Detailed

---

**Prepared by:** Team B - Architecture  
**Version:** 2.5  
**Date:** 2026-01-26  
**Status:** ✅ Complete & Ready for Team 20
