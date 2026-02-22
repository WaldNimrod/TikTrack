# 🗺️ Field Map LOD 400: לוגים ובריאות מערכת (Pulse & Logs)
**project_domain:** TIKTRACK

**סשן:** S20.10 | **משימה:** Observability & Monitoring

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`
- **אסטרטגיית ניהול לוגים:** שימוש ב-**ULID** כמפתח ראשי חיצוני להבטחת מיון כרונולוגי וייחודיות גלובלית.

## 2. סכימת לוגים (Pulse Logs Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה לוג חיצוני (חובה). |
| `log_level_enums` | `VARCHAR(20)` | `Enum` | INFO, WARN, ERROR, CRITICAL. |
| `message_contents` | `TEXT` | `String` | תוכן הלוגים. |
| `metadata_jsonb_objects`| `JSONB` | `Object` | אובייקט JSONB לנתוני מטא-דאטה מורכבים. |
| `occurrence_timestamps`| `TIMESTAMP` | `ISO8601` | Global UTC Storage. |