# 🗺️ Field Map LOD 400: טיקרים ומיפויים (Tickers & Mappings)

**id:** `WP_20_09_C_FIELD_MAP_TICKERS_MAPPINGS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

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