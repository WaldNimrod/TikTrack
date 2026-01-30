# 🗺️ Field Map LOD 400: חשבונות מסחר (Trading Accounts)

**סשן:** S20.08.C | **סטנדרט:** Plural Standard (G-10) | **דיוק:** DECIMAL(20, 8)

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
| `account_settings` | `JSONB` | `Object` | אכיפת דיוק נומרי פנימי ל-`DECIMAL(20, 8)`. |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | |

## 3. הצהרת דיוק פיננסי (Mandatory Precision)
- **אכיפה:** כל שדה המכיל ערך כספי, הגדרה נומרית או סף (Threshold) בתוך ה-JSONB חייב להישמר בדיוק של **DECIMAL(20, 8)**.
- **Separated Model:** אין שדות יתרה בטבלה זו. היתרות מנוהלות בישות Balances.