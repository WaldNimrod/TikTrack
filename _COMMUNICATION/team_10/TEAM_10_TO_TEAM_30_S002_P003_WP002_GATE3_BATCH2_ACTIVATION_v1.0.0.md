# TEAM_10 → TEAM_30 | S002-P003-WP002 GATE_3 Re-entry — Batch 2 Activation (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_S002_P003_WP002_GATE3_BATCH2_ACTIVATION_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 30 (Frontend)  
**cc:** Team 20, Team 50, Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3 (re-entry full cycle)  
**work_package_id:** S002-P003-WP002  
**batch:** 2 of 5 (Frontend — חוסמים)  
**authority:** TEAM_10_S002_P003_WP002_GATE3_FULL_REENTRY_BATCH_PLAN_v1.0.0.md, TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md  
**in_response_to:** Batch 1 PASS (Team 20 + Team 60)

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

## 1) Batch 1 outcome (for context)

- **Team 20:** PASS — T190-Notes (422 + field_errors), T190-Price (fallback + price_source, price_as_of_utc), G7-v1.2.1 (טיקר פעיל, /me/tickers), G7-FD קנוני, Auth תיעוד.  
- **Team 60:** PASS — Runtime evidence T190-Price (scheduler, intraday writes).  
- **חוזה מבאץ' 1 (לשימוש בבאץ' 2):**  
  - **GET /tickers, GET /tickers/{id}:** שדות חדשים `price_source` (EOD | INTRADAY_FALLBACK), `price_as_of_utc`.  
  - **POST /notes:** `parent_id` חובה עבור entity; 422 עם detail + field_errors.  
  - **POST /alerts:** `ticker_id` או `target_id` חובה עבור entity.

---

## 2) Scope — Batch 2 (Frontend חוסמים)

יישום כל החוסמים ברשימה שבאחריות ממשק. **לא ממשיכים לבאץ' 3 עד דיווח PASS על כל הסעיפים.**

---

## 3) Per-item mandate and success criteria

| # | מזהה | משימה | קריטריון הצלחה |
|---|------|--------|----------------|
| 4 | T50-1 | אלמנט מקושר | עמודת "אלמנט מקושר" מציגה **שם רשומה** (לא רק סוג) **+ קישור** למודול פרטים — בכל העמודים הרלוונטיים (התראות, הערות, וכו'). |
| 5 | T50-2 | קובץ מצורף D35 | קבצים מצורפים מוצגים **בטבלת הערות** (עמודה/אינדיקציה) **ובמודול פרטי הערה** (רשימה + פתח/הורד). |
| 6 | T50-3 | רענון טבלה | אחרי PUT/PATCH מוצלח — **הטבלה מתעדכנת מיד** (ללא ריענון דף). **כל הטבלאות:** D22, D33, D34, D35. |
| 9 | T50-6 | הוספת הערה — קישור | הוספת הערה: **קישור חובה**; בחירת **ישות ספציפית** (לא אופציונלי; לא "—ללא קישור—"). |
| 12 | T190-Notes | Notes linkage UI | הסרת "אופציונלי" מתווית; **חסימת שמירה** כש־parent_id ריק; הודעת שגיאה ברורה (למשל "יש לבחור ישות מקושרת"). |
| 13 (UI) | T190-Price | תצוגת provenance | הצגת **מקור המחיר** (price_source) בלי להטעות; **לא** להציג כ־EOD כשהמקור intraday (להשתמש ב־price_source, price_as_of_utc מהחוזה). |
| 17 | G7-FD/2-3 | כפתור הוספה + "הטיקרים שלי" | כפתור הוספה עקבי (למשל "הוספת טיקר"); פרטים = מודול מלא; "הטיקרים שלי" — עריכה, פידבק ברור על lookup. |

**מקורות:**  
- T50: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_TO_TEAM_10_UI_FINDINGS_ROUTING_v1.0.0.md`  
- T190: `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_NOTES_LINKAGE_UI_API_MISMATCH_REMEDIATION_NOTICE_v1.0.0.md`, `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_INTRADAY_PRICE_SURFACE_STALENESS_REMEDIATION_NOTICE_v1.0.0.md`  
- G7: `_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_S002_P003_WP002_GATE7_FEEDBACK_DRAFT.md`

---

## 4) Required output

- **overall_status:** PASS | BLOCK  
- **Per item (4, 5, 6, 9, 12, 13 UI, 17):** סטטוס (PASS/BLOCK) + evidence path או תיאור קצר.  
- **רשימת קבצים שהשתנו.**  
- **תלות בחוזה באץ' 1:** אם השתמשתם ב־price_source / price_as_of_utc או ב־422/field_errors — לציין.  
- **נתיב דוח השלמה:** קובץ ב־`documentation/reports/05-REPORTS/artifacts_SESSION_01/` (למשל `TEAM_30_S002_P003_WP002_GATE3_BATCH2_COMPLETION_v1.0.0.md`).

---

## 5) Stop-gate

באץ' 3 **לא** יופעל עד ש־Team 30 מדווח **PASS** על כל סעיפי באץ' 2.

---

**log_entry | TEAM_10 | GATE3_BATCH2_ACTIVATION | S002_P003_WP002 | TO_TEAM_30 | 2026-03-06**
