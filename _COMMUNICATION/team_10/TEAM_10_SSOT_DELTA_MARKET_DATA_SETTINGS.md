# SSOT Delta — Market Data Settings UI
**project_domain:** TIKTRACK

**משימה:** MARKET_DATA_SETTINGS_UI  
**מקור:** [TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md](TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md)  
**תאריך:** 2026-02-15

---

## רשימת מסמכים — ליצירה / לעדכון

| # | פעולה | מסמך | תיאור |
|---|--------|------|--------|
| 1 | **יצירה** | `documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md` | SSOT ייעודי להגדרות מערכת נתוני שוק — מקור אמת, קדימות DB>env, טבלת מפתחות/טווחים, השלכות תפעוליות. |
| 2 | **יצירה** | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql` (או addendum) | טבלת `market_data.system_settings` — key, value, type, constraints, updated_by, updated_at, audit. |
| 3 | **עדכון** | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_MARKET_DATA_SETTINGS_ADDENDUM.yaml` | GET+PATCH `/settings/market-data`; סכמות request/response; 403, 422. ✅ |
| 4 | **עדכון** | `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` §8.3 | הפניה ל-TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT; עדכון רשימת משתנים (כולל delay_between_symbols_seconds, intraday_enabled). |
| 5 | **עדכון** | `00_MASTER_INDEX.md` (שורש הפרויקט) | הוספת הפניה ל-TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT ולתוכנית העבודה. |

---

## אחריות

- **Team 10:** פריטים 1, 5 (SSOT + Index) — כחלק מ-Gate-0 / KP.
- **Team 60:** פריט 2 (DDL/migration) — בתיאום עם Work Plan.
- **Team 20:** פריט 3 (OpenAPI) — בתיאום עם מימוש API.
- **Team 10:** פריט 4 — עדכון §8.3 לאחר נעילת SSOT (או Team 10 במסגרת KP).

---

**log_entry | TEAM_10 | SSOT_DELTA | MARKET_DATA_SETTINGS | 2026-02-15**
