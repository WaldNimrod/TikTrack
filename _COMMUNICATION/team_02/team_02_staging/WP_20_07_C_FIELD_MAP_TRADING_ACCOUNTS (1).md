# 🗺️ Field Map LOD 400: חשבונות מסחר (Trading Accounts)

**סשן:** S20.07.C | **סטטוס:** תיקון מודל מופרד | **סטנדרט:** Plural (G-10)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` - אופטימיזציית אינדוקס.
- **External ULIDs:** `VARCHAR(26)` - נעילה סופית (G-03).

## 2. סכימת קונטיינר (Trading Accounts)
| שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API חשוף. |
| `owner_user_ids` | `BIGINT (FK)` | `ULID` | קישור לבעלות משתמשים. |
| `display_names` | `VARCHAR(255)` | `String` | אכיפת 'חשבונות מסחר'. |
| `broker_names` | `VARCHAR(100)` | `String` | שם הברוקר. |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | סטטוס פעילות. |

## 3. חוזה JSON (API Contract)
```json
{
  "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "display_names": "חשבונות מסחר - IBKR ראשי",
  "broker_names": "IBKR",
  "is_active_statuses": true
}
```