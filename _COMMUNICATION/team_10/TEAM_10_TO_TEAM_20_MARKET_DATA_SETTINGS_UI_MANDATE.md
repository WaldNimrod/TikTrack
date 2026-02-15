# Team 10 → Team 20 | Market Data Settings UI — מנדט ביצוע

**משימה:** MD-SETTINGS (Market Data Settings UI)  
**מקור:** [TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md](TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md); Team 90 Review  
**סטטוס:** מנדט — **לא להפעיל** לפני אישור Team 90 על חבילת התכנון.

---

## היקף (Team 20 — Backend)

- **API:** GET + **PATCH** `/settings/market-data` (Admin-only).
- **שכבת שירות:** קריאה מ-DB עם קדימות **DB > env**; fallback ל-env אם אין ערך ב-DB.
- **ולידציה קשיחה:** כל min/max/default מ-[TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md) — נאכפים ב-Backend. PATCH מחזיר **422** (validation / no fields) ו-**403** (non-admin) לפי חוזה OpenAPI.
- **Audit:** updated_by, updated_at; audit log לפי מדיניות פרויקט.
- **Runtime hooks:** סקריפטי sync ו-Jobs קוראים הגדרות דרך השירות (לא רק env) — כדי ש-intraday_enabled ו-delay_between_symbols_seconds יופעלו ללא שינוי ידני.

---

## SSOT וחוזים

- **SSOT:** [TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md)
- **טבלה:** `market_data.system_settings` (מבנה key/value + type + constraints — DDL בידי Team 60; תיאום עם 20).
- **OpenAPI:** GET+PATCH + סכמות request/response + 403, 422 — addendum: OPENAPI_SPEC_V2.5.2_MARKET_DATA_SETTINGS_ADDENDUM.yaml.

---

## Acceptance Criteria (מדידים)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | PATCH משנה ערכים ונשמר ב-DB עם audit (updated_by, updated_at). | בדיקת DB + לוג |
| 2 | ערכים מחוץ לטווח נדחים (422). | בדיקות API |
| 3 | non-admin נדחה (403). | בדיקת role |
| 4 | delay_between_symbols_seconds זמין לשימוש בסקריפטי sync (קריאה מהשירות). | תיאום עם 60; Evidence |

---

## סגירה

דיווח ל-Team 10 עם Evidence. סגירה מלאה של המשימה — רק עם **Seal (SOP-013)** לאחר Gate-A.

**log_entry | TEAM_10 | MD_SETTINGS_MANDATE | TO_TEAM_20 | 2026-02-15**
