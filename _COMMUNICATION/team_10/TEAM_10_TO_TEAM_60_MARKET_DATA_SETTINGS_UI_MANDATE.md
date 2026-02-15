# Team 10 → Team 60 | Market Data Settings UI — מנדט תשתית

**משימה:** MD-SETTINGS (Market Data Settings UI)  
**מקור:** [TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md](TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md); Team 90 Review  
**סטטוס:** מנדט — **לא להפעיל** לפני אישור Team 90 על חבילת התכנון.

---

## היקף (Team 60 — DB/Infra)

- **DB migration:** טבלת **`market_data.system_settings`** — key (unique), value, type, constraints, updated_by, updated_at; audit log לפי מדיניות. DDL ייעודי או addendum ל-PHX_DB_SCHEMA (תיאום עם Team 20 על המפתחות).
- **Cron/Job integration:** טעינת הגדרות מ-DB/שירות (לא רק env) — כך ששינוי setting **לא דורש שינוי ידני** ב-Cron.
- **intraday_enabled:** אכיפה ב-job runtime — כאשר **intraday_enabled=false**, Job Intraday **מדלג** (skip) עם **לוג מפורש**; Evidence ב-artifacts.
- **תיאום Cron:** עדכון תיאום כך ש-Intraday job קורא את ההגדרה (למשל מ-API/DB) בכל ריצה.

---

## SSOT

- **מבנה טבלה:** [TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md)
- **טבלת DDL:** רשימת SSOT Delta — `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql` (או addendum).

---

## Acceptance Criteria (מדידים)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | Migration רץ — טבלת `market_data.system_settings` קיימת; constraints פעילים. | ריצת migration; בדיקה |
| 2 | intraday_enabled=false → skip אמיתי של Intraday job + לוג + Evidence. | Evidence log; לוג runtime |
| 3 | שינוי setting (למשל intraday_interval_minutes) לא דורש שינוי ידני ב-Cron — Job קורא מהשירות/DB. | תיעוד / Evidence |

---

## סגירה

דיווח ל-Team 10 עם Evidence (migration, runtime skip, תיאום). סגירה מלאה — רק עם **Seal (SOP-013)** לאחר Gate-A.

**log_entry | TEAM_10 | MD_SETTINGS_MANDATE | TO_TEAM_60 | 2026-02-15**
