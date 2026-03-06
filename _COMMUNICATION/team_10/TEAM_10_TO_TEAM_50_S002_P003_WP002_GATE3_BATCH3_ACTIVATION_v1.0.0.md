# TEAM_10 → TEAM_50 | S002-P003-WP002 GATE_3 Re-entry — Batch 3 Activation (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P003_WP002_GATE3_BATCH3_ACTIVATION_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA)  
**cc:** Team 20, Team 30, Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3 (re-entry full cycle)  
**work_package_id:** S002-P003-WP002  
**batch:** 3 of 5 (ולידציה / E2E לסעיפים 1, 2, 3)  
**authority:** TEAM_10_S002_P003_WP002_GATE3_FULL_REENTRY_BATCH_PLAN_v1.0.0.md  
**in_response_to:** Batch 2 PASS (Team 30); Batch 3 כולל וידוא משותף עם Team 30

---

## Mandatory identity header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| gate_id | GATE_3 |
| phase_owner | Team 10 |

---

## 1) Scope — Batch 3 (QA / evidence לסעיפים 1, 2, 3)

אימות ו־evidence לשלושת הסעיפים הבאים. תיאום עם Team 30: הם מטפלים ב־UI; אתם מספקים **תרחישי E2E / אימות קוד** ו־evidence.

---

## 2) Per-item mandate and success criteria

| # | מזהה | משימה | קריטריון הצלחה |
|---|------|--------|----------------|
| 1 | BF-G7-008 | אימות סמל לא תקין | **E2E או אימות:** הזנת סמל בדוי (למשל INVALID999E2E) → הודעת שגיאה **גלויה** ב־UI (#tickerFormValidationSummary / #tickerSymbolError). אם נדרש — env עם VALIDATE_SYMBOL_ALWAYS=true. Evidence: תיעוד תוצאה או קובץ תוצאות. |
| 2 | BF-G7-012 | אימות "מקושר ל" | **אימות:** עמודת "מקושר ל" בהתראות והערות מציגה **שם רשומה** (למשל סמל טיקר AAPL), לא רק "טיקר". Evidence: צילום/תיעוד או assertion ב־E2E. |
| 3 | BF-G7-024 | אימות פרטי הערה + קבצים | **E2E או אימות קוד:** פתיחת **פרטי הערה** שיש לה **קבצים מצורפים** — תצוגה/רשימה + **פתח/הורד**. Evidence: תרחיש E2E או אימות קוד מתועד. |

---

## 3) Required output

- **overall_status:** PASS | BLOCK  
- **Per item (1, 2, 3):** סטטוס (PASS / FAIL) + **evidence** (נתיב לקובץ תוצאות, צילום, או תיאור קצר).  
- **נתיב דוח (אופציונלי):** קובץ ב־`documentation/reports/05-REPORTS/artifacts_SESSION_01/` (למשל `TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md`).

---

## 4) Stop-gate

באץ' 4 (GATE_4 מלא) **לא** יופעל עד שכל סעיפי באץ' 3 סגורים — כולל דיווח **Team 30** על שאר סעיפי באץ' 3 (7, 8, 10, 11, 18, 19).

---

**log_entry | TEAM_10 | GATE3_BATCH3_ACTIVATION | S002_P003_WP002 | TO_TEAM_50 | 2026-03-06**
