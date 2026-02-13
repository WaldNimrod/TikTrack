# Team 10 → Team 60: External Data — Automated Testing Mandate

**from:** Team 10 (The Gateway)  
**to:** Team 60 (Infrastructure)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — architect instruction (Team 90)**  
**מקור:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE.md

---

## 1. היקף אחריות

| פריט | תוכן |
|------|------|
| **Retention & Cleanup jobs** | וידוא שה-jobs תואמים לאפיון ומספקים Evidence. |
| **Job evidence** | Jobs מפיקים `last_run_time`, `rows_updated`, `rows_pruned` — ו-Evidence זמין לבדיקות ולדיווח. |

---

## 2. דרישות מההנחיה (סוויטה D)

- **Intraday DB:** 30 days → archive → delete after 1 year.
- **EOD/FX DB:** 250d → archive (no hard delete).
- **Jobs:** מפיקים `last_run_time`, `rows_updated`, `rows_pruned`.

---

## 3. משימות מפורטות

### 3.1 Retention & Cleanup
- לאמת jobs הקיימים (cleanup, retention, ארכיון) תואמים את המדיניות לעיל.
- להבטיח שה-jobs מחזירים/מתעדים: `last_run_time`, `rows_updated`, `rows_pruned` (לוג, טבלה, או פלט שנתון לאיסוף ב-CI/QA).

### 3.2 בדיקות אוטומטיות (סוויטה D)
- לאפשר בדיקה אוטומטית (minimal check) של Retention — למשל:
  - הרצת job (או סימולציה) ואימות שהפלט/לוג מכיל את השדות הנדרשים.
- סוויטה D כלולה ב-**Smoke (PR)** וב-**Nightly (Full)**.

### 3.3 Evidence
- לספק Evidence logs להרצות jobs (או לוגיםTeam 50/CI יכולים לאסוף) — לצורך דיווח ול־Acceptance Criteria של ההנחיה.

---

## 4. אינטגרציה בתוכנית העבודה

- מנדט External Data המלא: TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE — **§10**.
- תיאום עם Team 50: דיווח ו-Nightly/Smoke — Team 50 אוספים/מאמתים Evidence של jobs.

---

## 5. תוצרים / Evidence

- קוד/תצורה: jobs מעודכנים (אם נדרש) + פלט/לוג עם `last_run_time`, `rows_updated`, `rows_pruned`.
- בדיקה אוטומטית (מינימלית) לסוויטה D — נתיב או שם בדיקה.
- דיווח ל-Team 10: הודעה עם סיום + מיקום Evidence (או העברת Evidence ל-Team 50 לדיווח מאוחד).

---

**log_entry | TEAM_10 | TO_TEAM_60 | EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE | 2026-02-13**
