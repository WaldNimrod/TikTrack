# Team 10 → Team 60 | ולידציית טיקרים — אימות סביבה ו־Restart

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_TICKER_VALIDATION_ENV_VERIFICATION_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure & Environment)  
**date:** 2026-03-07  
**status:** MANDATE_ACTIVE  
**מקור:** _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_TICKER_VALIDATION_POST_FIX_QA_REPORT_v1.0.0.md §5.2, §6  

---

## היקף (Team 60 — Infrastructure)

אימות תצורת סביבה ל־**ולידציית טיקרים מול ספקים** (Yahoo/Alpha Vantage). D22 POST עם סמל אקראי (`QA_D22_$$`) החזיר 201 — סביר שוולידציה דולגה עקב env או Backend שלא הופעל מחדש.

---

## משימה מפורטת

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | אימות `api/.env` | לוודא קיום והערך: `RUN_LIVE_SYMBOL_VALIDATION=true` |
| 2 | אימות `api/.env` | לוודא קיום והערך: `SKIP_LIVE_DATA_CHECK=false` |
| 3 | אימות `api/.env.example` | תיעוד ברירת מחדל: `RUN_LIVE_SYMBOL_VALIDATION=true`, `SKIP_LIVE_DATA_CHECK=false` |
| 4 | Restart Backend | להפעיל מחדש את ה־Backend אחרי כל שינוי ב־env (או וידוא שהתהליך הנוכחי קרא env מעודכן) |
| 5 | תיעוד | לרשום את ערכי env בפועל (ללא סיסמאות/מפתחות) — לצורך Evidence |

---

## רקע

בהוספת טיקר חדש (D22 או D33) חייבת להתבצע ולידציה מול ספקים. אם `SKIP_LIVE_DATA_CHECK=true` או `RUN_LIVE_SYMBOL_VALIDATION=false` — הבדיקה דולגת וסמלים לא תקפים מקבלים 201.  
בדיקת D22: POST עם `QA_D22_$$` החזיר 201 — מצביע על bypass.

---

## Acceptance Criteria

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | `RUN_LIVE_SYMBOL_VALIDATION=true` ב־api/.env | `grep` או בדיקה ידנית |
| 2 | `SKIP_LIVE_DATA_CHECK=false` ב־api/.env | `grep` או בדיקה ידנית |
| 3 | Backend רץ עם env מעודכן | Restart בוצע; או הודעת "no change needed" אם env כבר תקין |
| 4 | Evidence | דוח קצר עם ערכי env (ממוסכים) — path ל־TEAM_60_TO_TEAM_10_TICKER_VALIDATION_ENV_VERIFICATION_COMPLETION.md |

---

## סגירה

- דיווח ל־Team 10: `TEAM_60_TO_TEAM_10_TICKER_VALIDATION_ENV_VERIFICATION_COMPLETION.md`
- לכלול: ערכי env (ממוסכים), תאריך restart, הערה אם Backend כבר רץ עם env תקין.

---

**log_entry | TEAM_10 | TICKER_VALIDATION_ENV_MANDATE | TO_TEAM_60 | 2026-03-07**
