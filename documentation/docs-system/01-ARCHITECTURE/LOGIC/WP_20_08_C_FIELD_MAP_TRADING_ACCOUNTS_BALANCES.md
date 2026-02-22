# 🗺️ Field Map LOD 400: יתרות חשבונות מסחר (Trading Accounts Balances)
**project_domain:** TIKTRACK

**id:** `WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.08.C | **משימה:** Separated Balance Model (Multi-Currency)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)`
- **External ULIDs:** `VARCHAR(26)` - **חובה: הצהרת ULID** (G-03).

## 2. סכימת יתרות (Balances Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API (ULID). |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | קונטיינר חשבונות המסחר. |
| `currency_codes` | `VARCHAR(3)` | `String` | ISO 4217 (Plural). |
| `available_amounts` | `NUMERIC(20, 6)` | `Decimal` | מזומן זמין — PRECISION_POLICY_SSOT. |
| `locked_amounts` | `NUMERIC(20, 6)` | `Decimal` | הון נעול — PRECISION_POLICY_SSOT. |
| `opening_balance_amounts` | `NUMERIC(20, 6)` | `Decimal` | **יתרת פתיחה ראשונית** — PRECISION_POLICY_SSOT (20,6). |