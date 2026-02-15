# Team 10 → Team 50: External Data — Automated Testing Mandate

**from:** Team 10 (The Gateway)  
**to:** Team 50 (QA)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — architect instruction (Team 90)**  
**מקור:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE.md

---

## 1. היקף אחריות

| פריט | תוכן |
|------|------|
| **Nightly / Smoke QA scripts** | סקריפטים להרצת סוויטות הבדיקות בהתאם למודל CI. |
| **Reporting** | דיווח תוצאות ו-Evidence ל-Team 10. |

---

## 2. מודל ההרצה (מתוך ההנחיה)

| הרצה | סוויטות | הערות |
|------|----------|--------|
| **Nightly (Full)** | A, B, C, D, E | כל הסוויטות; שימוש ב־`mode=REPLAY` (fixtures). |
| **PR/Commit (Smoke)** | A, B, D | Contract & Schema; Cache‑First + Failover; Retention (minimal check). |

---

## 3. משימות מפורטות

### 3.1 סקריפטי הרצה
- **Nightly:** להבטיח שכל הסוויטות (A–E) ניתנות להרצה במסגרת Nightly — או להריץ אותן או לתאם עם הצוותים (20, 30, 60) הרצה ו-collection של תוצאות.
- **Smoke (PR):** להבטיח שסוויטות A, B, D רצות על כל PR/commit (או לתת ל-Team 10/CI את ההגדרה הנדרשת).

### 3.2 דיווח ו-Evidence
- לייצר/לאסוף Evidence logs להרצות:
  - Nightly run — תוצאות מלאות (pass/fail) + artifact או קישור.
  - Jobs (Retention/cleanup) — Team 60 מספקים job evidence; Team 50 יכולים לאמת או לדווח על אינטגרציה בדוחות.
- לדווח ל-Team 10: לוח זמנים של CI (Nightly vs PR), ומיקום Evidence (למשל 05-REPORTS/artifacts או CI artifacts).

---

## 4. אינטגרציה בתוכנית העבודה

- מנדט External Data המלא: TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE — **§10**.
- תיאום: עם 20 (בדיקות A, B), 60 (בדיקות D + job evidence), 30 (סוויטה E ב-Nightly), 10 (CI wiring + evidence log).

---

## 5. תוצרים / Evidence

- סקריפטים או הגדרות להרצת Nightly ו-Smoke.
- דוח/מסמך: לוח CI (מתי Nightly, מתי Smoke) + מיקום Evidence logs.
- עדכון Team 10 עם קישור ל-Evidence ולמסמך לוח הזמנים (או פרסום ב־05-REPORTS/artifacts).

---

**log_entry | TEAM_10 | TO_TEAM_50 | EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE | 2026-02-13**
