# 🗺️ Field Map LOD 400: משתמשים ופרופילים (Users & Profiles)

**סשן:** S20.08.C | **עדכון:** Identity Tiers (Bronze-Platinum)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת משתמשים (Users Schema)
| שם שדה | טיפוס פנימי | הגדרות לוגיות |
| :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | ULID חשוף ב-API. |
| `user_tier_levels` | `ENUM` | Bronze, Silver, Gold, Platinum. |
| `user_profiles_data` | `JSONB` | עד 5 פרופילים (JSONB). |