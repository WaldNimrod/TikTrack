# 🗺️ Field Map LOD 400: מנוע חוקים (Playbooks)

**סשן:** S20.09 | **סטטוס:** אכיפת משמעת RR

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת פלייבוקים (Playbooks Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `playbook_names` | `VARCHAR(100)` | `String` | שם אסטרטגיות. |
| `rule_set_data` | `JSONB` | `Object` | חוקים (Entry/Exit Criteria). |
| `target_rr_ratios` | `NUMERIC(20, 8)` | `Decimal` | יחס RR יעד (20,8). |
| `owner_user_ids` | `BIGINT (FK)` | `ULID` | קישור למשתמשים. |