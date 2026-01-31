# 🗺️ Field Map LOD 400: חשבונות מסחר (Trading Accounts)

**סשן:** S20.08 | **משימה:** WP-20.8 | **סטנדרט:** Plural Standard (G-10)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` - לביצועי אינדוקס אופטימליים.
- **External ULIDs:** `VARCHAR(26)` - מזהה ייחודי לחשיפה ב-API (G-03).

## 2. אפיון קונטיינר לוגי (Trading Accounts Container)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `owner_user_ids` | `BIGINT (FK)` | `ULID` | קישור לבעלות משתמשים. |
| `display_names` | `VARCHAR(255)` | `String` | שמות חשבונות המסחר (אכיפת G-10). |
| `broker_names` | `VARCHAR(100)` | `String` | שם הברוקר. |
| `account_settings` | `JSONB` | `Object` | דיוק NUMERIC(20, 8) פנימי. |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | סטטוס פעילות. |

## 3. דגשים ארכיטקטוניים
- **Separated Model:** אין שדות יתרה בטבלה זו. היתרות מנוהלות בישות Balances המופרדת.