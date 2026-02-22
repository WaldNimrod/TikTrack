# 🗺️ Field Map LOD 400: חשבונות מסחר (Trading Accounts)
**project_domain:** TIKTRACK

**id:** `WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.08.C | **סטנדרט:** Plural Standard (G-10) | **דיוק יתרות/סכומים:** DECIMAL(20, 6) — PRECISION_POLICY_SSOT

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` - אינדוקס פנימי.
- **External ULIDs:** `VARCHAR(26)` - מזהה API חיצוני (G-03).

## 2. סכימת קונטיינר (Trading Accounts Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API. |
| `owner_user_ids` | `BIGINT (FK)` | `ULID` | בעלות. |
| `display_names` | `VARCHAR(255)` | `String` | אכיפת 'חשבונות מסחר'. |
| `account_settings` | `JSONB` | `Object` | אכיפת דיוק נומרי פנימי ל-`DECIMAL(20, 6)` (סכומים). |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | |

## 3. הצהרת דיוק פיננסי (Mandatory Precision)
- **אכיפה:** כל שדה המכיל ערך כספי, הגדרה נומרית או סף (Threshold) בתוך ה-JSONB — דיוק **DECIMAL(20, 6)** (יתרות/סכומים — PRECISION_POLICY_SSOT).
- **Separated Model:** אין שדות יתרה בטבלה זו. היתרות מנוהלות בישות Balances.