# 🗺️ Field Map LOD 400: משימות רקע (Background Tasks)
**project_domain:** TIKTRACK

**סשן:** S20.10 | **משימה:** Workers & Scheduling

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`
- **אסטרטגיית ניהול משימות:** שימוש ב-**ULID** למעקב אטומי אחר ריצות ה-Workers.

## 2. סכימת משימות (Background Tasks Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה משימה חיצוני. |
| `task_type_enums` | `VARCHAR(50)` | `Enum` | DATA_SYNC, REPORT_GEN. |
| `execution_statuses` | `VARCHAR(20)` | `Enum` | PENDING, RUNNING, COMPLETED. |
| `result_metadata_objects`| `JSONB` | `Object` | תוצאות הרצה בפורמט JSONB גמיש. |