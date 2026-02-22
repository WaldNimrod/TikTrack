# Team 10 → Team 50 | Market Data Settings UI — מנדט QA
**project_domain:** TIKTRACK

**משימה:** MD-SETTINGS (Market Data Settings UI)  
**מקור:** [TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md](TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md); Team 90 Review  
**סטטוס:** מנדט — **לא להפעיל** לפני אישור Team 90 על חבילת התכנון.

---

## היקף (Team 50 — QA)

- **Gate-A:** תרחישי קצה — טווח (min/max), role (admin vs non-admin), השפעה runtime (intraday_enabled, delay_between_symbols_seconds), stale/no-crash.
- **דוח Gate-A:** TEAM_50_TO_TEAM_10_*_MARKET_DATA_SETTINGS_QA_REPORT.
- **Seal (SOP-013)** — חסם לסגירת שער; דוח בלבד לא מספיק.

---

## Acceptance Criteria (מדידים — לוודא ב-Gate-A)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | PATCH משנה ערכים ונשמר ב-DB עם audit. | API + DB check |
| 2 | ערכים מחוץ לטווח נדחים (400/422). | API tests |
| 3 | non-admin נדחה (403). | API test עם role לא Admin |
| 4 | intraday_enabled=false גורם ל-skip אמיתי של intraday job (Evidence + לוג). | תיאום עם 60; Evidence runtime |
| 5 | delay_between_symbols_seconds משפיע בפועל על קצב קריאות. | תיאום עם 20/60; בדיקה/Evidence |
| 6 | אין crash/stale ב-UI בעת טעינה או שגיאה. | E2E / Manual |

---

## תוצרים

- דוח Gate-A עם רשימת בדיקות וממצאים.
- Seal (SOP-013) — עם אישור Gate-A.

**log_entry | TEAM_10 | MD_SETTINGS_MANDATE | TO_TEAM_50 | 2026-02-15**
