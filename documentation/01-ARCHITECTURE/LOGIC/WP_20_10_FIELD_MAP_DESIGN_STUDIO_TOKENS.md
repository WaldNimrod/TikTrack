# 🗺️ Field Map LOD 400: משילות עיצוב (Design Studio Tokens)

**id:** `WP_20_10_FIELD_MAP_DESIGN_STUDIO_TOKENS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.10 | **סטטוס:** Visual Governance

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת טוקנים (Design Tokens Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `token_names` | `VARCHAR(100)` | `String` | למשל: `semantic-color-primary`. |
| `token_category_enums` | `VARCHAR(50)` | `Enum` | COLOR, SPACING, TYPOGRAPHY. |
| `visual_value_objects` | `JSONB` | `Object` | אחסון ערכי עיצוב בפורמט JSONB. |
| `governance_rules` | `JSONB` | `Object` | חוקי אכיפה ומשילות UI. |