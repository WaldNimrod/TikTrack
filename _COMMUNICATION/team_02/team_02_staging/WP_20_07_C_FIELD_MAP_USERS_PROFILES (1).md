# 🗺️ Field Map LOD 400: משתמשים ופרופילים (Users & Profiles)
**project_domain:** TIKTRACK

**סשן:** S20.07.C | **עדכון:** Identity Tiers (Bronze-Platinum)

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת משתמשים (Users Schema)
| שדה | טיפוס פנימי | הגדרות לוגיות |
| :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | ULID חשוף. |
| `user_tier_levels` | `ENUM` | **Bronze, Silver, Gold, Platinum** (מדרג חובה). |
| `email_addresses` | `VARCHAR(255)` | Unique Index. |
| `user_profiles_data` | `JSONB` | אחסון עד 5 פרופילים (JSONB). |