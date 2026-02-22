# Team 10 → Team 30 | Market Data Settings UI — מנדט ביצוע
**project_domain:** TIKTRACK

**משימה:** MD-SETTINGS (Market Data Settings UI)  
**מקור:** [TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md](TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md); Team 90 Review  
**סטטוס:** מנדט — **לא להפעיל** לפני אישור Team 90 על חבילת התכנון.

---

## היקף (Team 30 — Frontend)

- **UI עריכה:** שדות להגדרות נתוני שוק (max_active_tickers, intraday_interval_minutes, provider_cooldown_minutes, max_symbols_per_request, delay_between_symbols_seconds, intraday_enabled) — ניתנים לעריכה בעמוד ניהול מערכת.
- **שמירה:** כפתור שמירה — שליחת PATCH ל-API.
- **שגיאות חוזה:** הצגת הודעות ברורות עבור 400, 403, 422 (טווח, הרשאה, unprocessable).
- **State reload:** אחרי שמירה מוצלחת — טעינה מחדש של הערכים (GET) או עדכון state.

---

## SSOT

- **משתנים וטווחים:** [TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../../documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md) — min/max/default לתצוגה וולידציה בצד לקוח (בתיאום עם Backend).

---

## Acceptance Criteria (מדידים)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | עריכת שדות ושמירה מצליחה (PATCH → 200); ערכים מעודכנים מוצגים. | E2E / Manual |
| 2 | שגיאות 400/403/422 מוצגות למשתמש באופן ברור. | E2E / Manual |
| 3 | טעינה ראשונית ו-reload אחרי שמירה — ערכים תואמים ל-API. | E2E / Manual |

---

## סגירה

דיווח ל-Team 10. סגירה מלאה — רק עם **Seal (SOP-013)** לאחר Gate-A.

**log_entry | TEAM_10 | MD_SETTINGS_MANDATE | TO_TEAM_30 | 2026-02-15**
