# 🗺️ Field Map LOD 400: טיקרים ומיפויים (Tickers & Mappings)
**project_domain:** TIKTRACK

**סשן:** S20.09.C | **סטטוס:** סגירת פערים | **דיוק:** 20,8

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` | **External ULIDs:** `VARCHAR(26)` (G-03).

## 2. סכימת נכסים (Tickers Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | |
| `external_ulids` | `VARCHAR(26)` | `ULID` | API ID. |
| `ticker_symbols` | `VARCHAR(20)` | `String` | למשל: AAPL. |
| `provider_mapping_data` | `JSONB` | `Object` | מיפוי לספקים חיצוניים. |