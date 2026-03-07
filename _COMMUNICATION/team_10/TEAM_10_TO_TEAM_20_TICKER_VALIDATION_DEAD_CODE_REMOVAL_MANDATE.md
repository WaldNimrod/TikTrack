# Team 10 → Team 20 | ולידציית טיקרים — הסרת קוד מת

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_TICKER_VALIDATION_DEAD_CODE_REMOVAL_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-07  
**status:** MANDATE_ACTIVE  
**מקור:** _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_TICKER_VALIDATION_POST_FIX_QA_REPORT_v1.0.0.md §2  

---

## היקף (Team 20 — Backend)

הסרת **קוד מת** מ־`api/services/user_tickers_service.py` — פונקציות שלא נקראות עוד לאחר איחוד הזרימה ל־`create_system_ticker` (מ־canonical_ticker_service).

---

## משימה מפורטת

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | הסרת `_live_data_check` | שורות 65–110 בקובץ `api/services/user_tickers_service.py` — פונקציה לא בשימוש |
| 2 | הסרת `_is_live_data_check_bypass_enabled` | שורות 60–62 — פונקציה לא בשימוש |
| 3 | ניקוי ייבוא | להסיר כל `import` או הפניה לפונקציות שהוסרו (אם קיימים) |
| 4 | אימות | לוודא ש־`add_ticker` ממשיך לקרוא ל־`create_system_ticker` עם `skip_live_check=False` — **ללא שינוי לוגיקה** |

---

## רקע

באיחוד הזרימה, `add_ticker` קורא כעת ישירות ל־`create_system_ticker` (מ־canonical_ticker_service) עם `skip_live_check=False`. הבדיקה מתבצעת ב־canonical_ticker_service בלבד. הפונקציות `_live_data_check` ו־`_is_live_data_check_bypass_enabled` נותרו כקוד מת.

---

## Acceptance Criteria

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | `_live_data_check` הוסרה לחלוטין | אין התייחסות לפונקציה בקובץ |
| 2 | `_is_live_data_check_bypass_enabled` הוסרה לחלוטין | אין התייחסות לפונקציה בקובץ |
| 3 | אין שבירת לוגיקה | `add_ticker` ממשיך לעבוד; POST /me/tickers עם סמל תקף → 201/409; סמל בדוי → 422 |
| 4 | אין שגיאות lint/import | `ruff check`, `python -c "from api.services.user_tickers_service import *"` עוברים |

---

## סגירה

- דיווח ל־Team 10: `TEAM_20_TO_TEAM_10_TICKER_VALIDATION_DEAD_CODE_REMOVAL_COMPLETION.md`
- לכלול: רשימת שורות שהוסרו, תוצאת אימות (API או unit test אם קיים).

---

**log_entry | TEAM_10 | TICKER_VALIDATION_DEAD_CODE_MANDATE | TO_TEAM_20 | 2026-03-07**
