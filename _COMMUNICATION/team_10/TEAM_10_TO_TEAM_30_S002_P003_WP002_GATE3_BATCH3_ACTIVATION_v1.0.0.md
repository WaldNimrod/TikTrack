# TEAM_10 → TEAM_30 | S002-P003-WP002 GATE_3 Re-entry — Batch 3 Activation (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_S002_P003_WP002_GATE3_BATCH3_ACTIVATION_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 30 (Frontend)  
**cc:** Team 20, Team 50, Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3 (re-entry full cycle)  
**work_package_id:** S002-P003-WP002  
**batch:** 3 of 5 (שיפורים + סעיפי ולידציה)  
**authority:** TEAM_10_S002_P003_WP002_GATE3_FULL_REENTRY_BATCH_PLAN_v1.0.0.md  
**in_response_to:** Batch 2 PASS (Team 30)

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

## 1) Scope — Batch 3 (שיפורים + 18, 19 + וידוא 1, 2)

שיפורי UI, סעיפים 18–19, ווידוא תצוגה ל־008 ו־012. **לא ממשיכים לבאץ' 4 עד דיווח PASS (או WON'T FIX עם הנמקה) על כל הסעיפים.**

---

## 2) Per-item mandate and success criteria

| # | מזהה | משימה | קריטריון הצלחה |
|---|------|--------|----------------|
| 7 | T50-4 | notesSummaryToggleSize | `#notesSummaryToggleSize` — **נתונים במרכז**, **כפתור בצד שמאל** (כמו בעמוד טיקרים: שעון + כפתור העין). |
| 8 | T50-5 | טולטיפים | **טולטיפים** (`title` / aria-label) — **בפילטרים** (סוג מקושר) **ובתפריט הפעולות** (כל כפתור). |
| 10 | T50-7 | דרופדאונים D34 | שדות הקישור (סוג + ישות) בהוספת התראה — **בשתי עמודות** (layout נקי). |
| 11 | T50-8 | כפתורי ביטול/שמירה | **ביטול** — צבע secondary/neutral; **שמירה** — primary. עקביות **בכל המודלים**. |
| 18 | G7-FD/4 | "הטיקרים שלי" הערה/סטטוס | **רק אם לא נדחה:** פעולת הערה ל־user_tickers, סטטוס משתמש אם נדרש. אם נדחה — לציין WON'T FIX / DEFERRED. |
| 19 | G7-FD/16 | עריכת הערה — read-only | ישות מקושרת ב**עריכת הערה** — **read-only** (תווית/הקשר); שינוי **רק** דרך selector ישות, לא שדה מזהה גולמי. |
| 1 | BF-G7-008 | וידוא סמל לא תקין | וידוא: הודעת שגיאה על **סמל לא תקין** גלויה ב־UI (#tickerFormValidationSummary / #tickerSymbolError, data-testid). Team 50 ירוץ E2E. |
| 2 | BF-G7-012 | וידוא "מקושר ל" | וידוא: עמודת "מקושר ל" מציגה **שם רשומה** (לא רק "טיקר") בהתראות והערות. Team 50 יאמת. |

**מקורות:** TEAM_50_TO_TEAM_10_UI_FINDINGS_ROUTING_v1.0.0.md; TEAM_90_TO_NIMROD_S002_P003_WP002_GATE7_FEEDBACK_DRAFT.md; רשימת הפערים.

---

## 3) Required output

- **overall_status:** PASS | BLOCK  
- **Per item (7, 8, 10, 11, 18, 19, 1, 2):** סטטוס (PASS / BLOCK / WON'T FIX) + evidence או הנמקה.  
- **רשימת קבצים שהשתנו.**  
- **נתיב דוח השלמה:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md` (או מקביל).

---

## 4) Stop-gate

באץ' 4 (GATE_4 מלא) **לא** יופעל עד שכל סעיפי באץ' 3 סגורים — כולל דיווח Team 50 על 1, 2, 3 (E2E/evidence).

---

**log_entry | TEAM_10 | GATE3_BATCH3_ACTIVATION | S002_P003_WP002 | TO_TEAM_30 | 2026-03-06**
