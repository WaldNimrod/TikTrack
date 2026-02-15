# Team 60 → Team 20: תיאום DDL — Market Data System Settings

**id:** `TEAM_60_TO_TEAM_20_MARKET_DATA_SYSTEM_SETTINGS_DDL_COORDINATION`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-15  
**מקור:** TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE; MD-SETTINGS — תיאום DDL לפי Activation

---

## 1. מטרת התיאום

תאום מבנה הטבלה `market_data.system_settings` לפני ביצוע Migration (Team 60) ומימוש API GET/PATCH (Team 20). היקף: [TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md).

---

## 2. מבנה טבלה — DDL

**טבלה:** `market_data.system_settings`

| עמודה | טיפוס | הערות |
|-------|-------|-------|
| key | VARCHAR(80) | PK — מפתח הגדרה |
| value | TEXT | NOT NULL — ערך כמחרוזת |
| value_type | VARCHAR(20) | NOT NULL DEFAULT 'integer'; CHECK (integer, boolean, string, json) |
| updated_by | UUID | REFERENCES user_data.users(id) ON DELETE SET NULL |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

**אינדקס:** `idx_system_settings_updated_at` על (updated_at DESC).

**מיקום DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql`

---

## 3. מפתחות וטווחים (SSOT — ולידציה ב-Team 20)

| key | type | min | max | default | תיאור |
|-----|------|-----|-----|---------|--------|
| max_active_tickers | integer | 1 | 500 | 50 | מקסימום טיקרים פעילים לרענון Intraday |
| intraday_interval_minutes | integer | 5 | 240 | 15 | מרווח רענון Intraday (דקות) |
| provider_cooldown_minutes | integer | 5 | 120 | 15 | Cooldown אחרי 429 |
| max_symbols_per_request | integer | 1 | 50 | 5 | מקסימום סימבולים בבאץ' אחד |
| delay_between_symbols_seconds | integer | 0 | 30 | 0 | רווח (שניות) בין סימבולים — **מחייב בסקריפטי sync** |
| intraday_enabled | boolean | — | — | true | הפעלה/כיבוי Intraday — **אכיפה ב-job runtime** (Team 60) |

**ולידציה:** כל min/max/default **נאכפים ב-Backend** (Team 20). PATCH מחזיר 400/403/422 לפי חוזה OpenAPI.

---

## 4. קדימות ערכים

**DB > env.** אם קיים ערך ב-DB — משתמשים בו; אחרת — fallback ל-env (ברירת מחדל). השירות (Team 20) קורא מ-DB; Jobs/סקריפטים קוראים דרך השירות או ישירות מ-DB.

---

## 5. חוזים ל-Team 20

| נושא | חוזה |
|------|------|
| **API** | GET + PATCH `/settings/market-data` — Admin-only |
| **Audit** | updated_by, updated_at על כל PATCH |
| **Runtime** | סקריפטי sync ו-Jobs קוראים הגדרות דרך השירות (לא רק env) |
| **intraday_enabled** | Team 60 מיישם skip ב-runtime; Team 20 מספק שירות קריאה |

---

## 6. סטטוס Migration

- **DDL מוכן:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql`
- **Migration:** Team 60 יבצע לאחר אישור תיאום; עדכון `scripts/migrations/` ו-`make migrate-*` לפי נוהל.
- **תלות:** Team 20 יכול להתחיל מימוש API (ORM, שירות) בהתבסס על מבנה זה.

---

## 7. מסמכים

| מסמך | נתיב |
|------|------|
| SSOT | documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md |
| DDL | documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql |
| מנדט Team 60 | TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md |
| מנדט Team 20 | TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md |

---

**log_entry | TEAM_60 | TO_TEAM_20 | MARKET_DATA_SYSTEM_SETTINGS_DDL_COORDINATION | 2026-02-15**
