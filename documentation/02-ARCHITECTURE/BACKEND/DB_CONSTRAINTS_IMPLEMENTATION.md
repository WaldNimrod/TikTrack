# 📋 Database Constraints Implementation - TikTrack

## 🎯 מטרה

טבלה מסודרת לכל ישות: field → type → required → constraints
לאשר case-sensitivity לערכים (status, investment_type, condition_operator)
לציין שדות תאריך נדרשים בפועל

---

## 📊 טבלת אילוצים מלאה לפי ישות

### 🏷️ **TRADE_PLAN**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| trading_account_id | INTEGER | ✅ | FK→trading_accounts.id, NOT NULL | |
| ticker_id | INTEGER | ✅ | FK→tickers.id, NOT NULL | |
| investment_type | VARCHAR(20) | ✅ | default='swing', NOT NULL | Values: swing (case-sensitive) |
| side | VARCHAR(10) | ✅ | default='Long', NOT NULL | Values: 'Long', 'Short' (case-sensitive) |
| status | VARCHAR(20) | ✅ | default='open', NOT NULL | Values: 'open', 'closed', 'cancelled' (case-sensitive) |
| planned_amount | FLOAT | ✅ | default=1000, NOT NULL | > 0 |
| entry_price | FLOAT | ❌ | NULL allowed | |
| entry_conditions | VARCHAR(500) | ❌ | NULL | |
| stop_price | FLOAT | ❌ | NULL | |
| target_price | FLOAT | ❌ | NULL | |
| stop_percentage | FLOAT | ❌ | NULL | |
| target_percentage | FLOAT | ❌ | NULL | |
| reasons | VARCHAR(500) | ❌ | NULL | |
| notes | VARCHAR(5000) | ❌ | NULL | |
| cancelled_at | DATETIME | ❌ | NULL | |
| cancel_reason | VARCHAR(500) | ❌ | NULL | |

---

### 💰 **TRADING_ACCOUNT**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| name | VARCHAR(100) | ✅ | NOT NULL | |
| currency_id | INTEGER | ✅ | FK→currencies.id, NOT NULL | |
| status | VARCHAR(20) | ❌ | default='open' | Values: 'open', 'closed', 'cancelled' (case-sensitive) |
| opening_balance | FLOAT | ❌ | default=0.0, NULL allowed | |
| total_value | FLOAT | ❌ | default=0 | |
| total_pl | FLOAT | ❌ | default=0 | |
| notes | VARCHAR(5000) | ❌ | NULL | |
| external_account_number | VARCHAR(100) | ❌ | NULL, UNIQUE | |

---

### 💸 **CASH_FLOW**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| trading_account_id | INTEGER | ✅ | FK→trading_accounts.id, NOT NULL | |
| type | VARCHAR(50) | ✅ | NOT NULL, default='deposit' | ENUM: deposit, withdrawal, fee, dividend, transfer_in, transfer_out, currency_exchange_from, currency_exchange_to, other_positive, other_negative (case-sensitive) |
| amount | FLOAT | ✅ | NOT NULL, ≠ 0 | |
| fee_amount | FLOAT | ✅ | NOT NULL, default=0 | ≥ 0 |
| date | DATE | ❌ | NULL allowed | Format: YYYY-MM-DD |
| description | VARCHAR(5000) | ❌ | NULL | |
| currency_id | INTEGER | ❌ | FK→currencies.id, default=1 | |
| usd_rate | DECIMAL(10,6) | ✅ | NOT NULL, default=1.000000 | > 0 |
| source | VARCHAR(20) | ❌ | default='manual' | ENUM: manual, file_import, direct_import, api (case-sensitive) |
| external_id | VARCHAR(100) | ❌ | default='0' | |
| trade_id | INTEGER | ❌ | FK→trades.id, NULL allowed | |

---

### 🔔 **ALERT**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| ticker_id | INTEGER | ❌ | FK→tickers.id, NULL allowed | |
| message | VARCHAR(5000) | ❌ | NULL | |
| triggered_at | DATETIME | ❌ | NULL | |
| status | VARCHAR(20) | ❌ | default='open', NULL allowed | Values: 'open', 'closed', 'cancelled' (case-sensitive) |
| is_triggered | VARCHAR(20) | ❌ | default='false', NULL allowed | Values: 'false', 'new', 'true' |
| related_type_id | INTEGER | ✅ | FK→note_relation_types.id, NOT NULL, default=4 | |
| related_id | INTEGER | ❌ | NULL allowed | |
| condition_attribute | VARCHAR(50) | ✅ | NOT NULL, default='price' | ENUM: price, change, ma, volume, balance (case-sensitive) |
| condition_operator | VARCHAR(50) | ✅ | NOT NULL, default='more_than' | ENUM: more_than, less_than, cross, cross_up, cross_down, change, change_up, change_down, equals (case-sensitive) |
| condition_number | VARCHAR(20) | ✅ | NOT NULL, default='0' | Must be valid number |
| plan_condition_id | INTEGER | ❌ | FK→plan_conditions.id, NULL | |
| trade_condition_id | INTEGER | ❌ | FK→trade_conditions.id, NULL | |
| expiry_date | VARCHAR(10) | ❌ | NULL | Format: YYYY-MM-DD |

---

### 📈 **TICKER**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| symbol | VARCHAR(10) | ✅ | UNIQUE, NOT NULL, max 10 chars | Case-sensitive, unique across system |
| name | VARCHAR(100) | ✅ | NOT NULL | |
| type | VARCHAR(20) | ✅ | NOT NULL | ENUM: stock, etf, crypto, forex, commodity (case-sensitive) |
| remarks | VARCHAR(500) | ❌ | NULL, max 500 chars | |
| currency_id | INTEGER | ✅ | FK→currencies.id, NOT NULL | |
| active_trades | BOOLEAN | ❌ | default=FALSE, NULL allowed | Auto-calculated |
| status | VARCHAR(20) | ✅ | NOT NULL, default='open' | ENUM: open, closed, cancelled (case-sensitive) |
| updated_at | DATETIME | ❌ | NULL | |

---

### 👤 **USER**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| username | VARCHAR(50) | ✅ | UNIQUE, NOT NULL | Case-sensitive, unique |
| email | VARCHAR(100) | ❌ | UNIQUE, NULL allowed | Case-insensitive unique |
| first_name | VARCHAR(50) | ❌ | NULL | |
| last_name | VARCHAR(50) | ❌ | NULL | |
| is_active | BOOLEAN | ✅ | NOT NULL, default=TRUE | |
| is_default | BOOLEAN | ✅ | NOT NULL, default=FALSE, UNIQUE | Only one default user |
| password_hash | VARCHAR(255) | ❌ | NULL | Bcrypt hash |
| preferences_json | TEXT | ❌ | NULL | JSON string |

---

### 📝 **NOTE**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| content | VARCHAR(10000) | ✅ | NOT NULL | |
| attachment | VARCHAR(500) | ❌ | NULL | File path |
| related_type_id | INTEGER | ✅ | FK→note_relation_types.id, NOT NULL | |
| related_id | INTEGER | ✅ | NOT NULL | |

---

### ⚡ **TRADE**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| ticker_id | INTEGER | ✅ | FK→tickers.id, NOT NULL | |
| trading_account_id | INTEGER | ✅ | FK→trading_accounts.id, NOT NULL | |
| trade_plan_id | INTEGER | ❌ | FK→trade_plans.id, NULL allowed | |
| status | VARCHAR(20) | ❌ | default='open', NULL allowed | Values: 'open', 'closed', 'cancelled' (case-sensitive) |
| investment_type | VARCHAR(20) | ✅ | NOT NULL, default='swing' | Values: swing (case-sensitive) |
| side | VARCHAR(10) | ❌ | default='Long', NULL allowed | Values: 'Long', 'Short' (case-sensitive) |
| planned_quantity | FLOAT | ❌ | NULL | |
| planned_amount | FLOAT | ❌ | NULL | |
| entry_price | FLOAT | ❌ | NULL | |
| closed_at | DATETIME | ❌ | NULL | |
| cancelled_at | DATETIME | ❌ | NULL | |
| cancel_reason | VARCHAR(500) | ❌ | NULL | |
| total_pl | FLOAT | ❌ | default=0, NULL allowed | |
| notes | VARCHAR(5000) | ❌ | NULL | |

---

### 🔄 **EXECUTION**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| user_id | INTEGER | ✅ | FK→users.id, NOT NULL | |
| ticker_id | INTEGER | ✅ | FK→tickers.id, NOT NULL | |
| trading_account_id | INTEGER | ❌ | FK→trading_accounts.id, NULL allowed | |
| trade_id | INTEGER | ❌ | FK→trades.id, NULL allowed | |
| action | VARCHAR(20) | ✅ | NOT NULL, default='buy' | ENUM: buy, sell, short, cover (case-sensitive) |
| date | DATETIME | ✅ | NOT NULL | Must be >= trade.open_date |
| quantity | FLOAT | ✅ | NOT NULL | > 0 |
| price | FLOAT | ✅ | NOT NULL | > 0 |
| fee | FLOAT | ❌ | default=0, NULL allowed | ≥ 0 |
| source | VARCHAR(50) | ❌ | default='manual', NULL allowed | ENUM: manual, api, file_import, direct_import (case-sensitive) |
| external_id | VARCHAR(100) | ❌ | NULL | |
| notes | VARCHAR(5000) | ❌ | NULL | |
| realized_pl | INTEGER | ❌ | NULL | NULL in buy/short, required in sell/cover |
| mtm_pl | INTEGER | ❌ | NULL | Optional in both |

---

## 🔍 **נקודות חשובות לשימו לב**

### Case-Sensitivity

- **כל הערכים ב-ENUM הם case-sensitive** - חובה להשתמש באותיות קטנות/גדולות בדיוק כפי שמוגדר
- שדות text רגילים (לא ENUM) הם case-sensitive

### שדות תאריך

- **date**: DATE format (YYYY-MM-DD)
- **datetime**: DATETIME format (ISO 8601)
- **expiry_date**: VARCHAR(10) ב-format YYYY-MM-DD
- **שדות תאריך הם required רק אם nullable=False**

### Foreign Keys

- כל FK חייב להפנות לרשומה קיימת בטבלה המתאימה
- לא ניתן למחוק רשומה אם יש FKs שמפנים אליה (cascade rules)

### Length Constraints

- symbol: max 10 chars
- name: max 100 chars (ticker), 25 chars (הערה במודל)
- condition_number: VARCHAR(20)
- username: max 50 chars
- email: max 100 chars

### Frontend ↔ Backend Alignment

- **investment_type**: frontend מצפה 'swing' ← backend default 'swing' ✅
- **side**: frontend מצפה 'Long'/'Short' ← backend default 'Long' ✅
- **status**: frontend מצפה 'open'/'closed'/'cancelled' ← backend default 'open' ✅
- **condition_operator**: frontend משתמש 'above' ← backend מצפה 'more_than' ❌ **MISMATCH**
- **condition_attribute**: frontend משתמש 'price' ← backend default 'price' ✅

### ⚠️ **Mismatch שזוהה**

**condition_operator**:

- Frontend: 'above'
- Backend: 'more_than', 'less_than', 'cross', etc.
- **חובה לתקן frontend להשתמש בערכים הנכונים!**

---

**Date:** January 1, 2026
**Source:** Moved from `05-REPORTS/DB_CONSTRAINTS_TABLE.md`
**Entities:** 9 core entities with complete constraint specifications
