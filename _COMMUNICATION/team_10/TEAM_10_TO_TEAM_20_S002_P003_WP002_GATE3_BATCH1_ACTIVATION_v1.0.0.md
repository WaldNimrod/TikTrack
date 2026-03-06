# TEAM_10 → TEAM_20 | S002-P003-WP002 GATE_3 Re-entry — Batch 1 Activation (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P003_WP002_GATE3_BATCH1_ACTIVATION_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20 (Backend / Data)  
**cc:** Team 30, Team 50, Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3 (re-entry full cycle)  
**work_package_id:** S002-P003-WP002  
**batch:** 1 of 5 (Backend + contract for Team 30)  
**authority:** TEAM_10_S002_P003_WP002_GATE3_FULL_REENTRY_BATCH_PLAN_v1.0.0.md, TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md

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

## 1) Scope — Batch 1 (Backend only)

סגירת הפערים שבאחריות בקאנד; וידוא תהליך טיקר קנוני; הכנת חוזה ל־Team 30. **לא ממשיכים לבאץ' 2 עד דיווח PASS על כל הסעיפים.**

---

## 2) Per-item mandate and success criteria

| # | מזהה | משימה | קריטריון הצלחה |
|---|------|--------|----------------|
| 12 | T190-Notes | Notes linkage — חוזה API | 422 עם `detail` ברור כש־`parent_id` חסר (entity types); ולידציה ב־schema; תיעוד חוזה ל־Team 30. |
| 13 | T190-Price | Intraday price surface | Fallback ל־intraday כש־EOD (`ticker_prices`) ישן מעבר ל־threshold; response כולל `price_source` (EOD / INTRADAY_FALLBACK), `price_as_of_utc`; תיעוד ל־Team 30. |
| 15 | G7-v1.2.1/10-12 | טיקר פעיל + "הטיקרים שלי" | טיקר בלי market data **לא** ב־`is_active=true`; כללי activation עקביים; `/me/tickers` — lookup then link או קריאה למסלול הקנוני; תיעוד. |
| 16 | G7-FD/1 | תהליך טיקר קנוני | **וידוא + תיעוד:** מסלול קנוני יחיד (`canonical_ticker_service`); D22 ו־`/me/tickers` משתמשים בו; אם יש פער — תיקון. |
| 14 | G7-FD Auth | סמנטיקת Auth | תיעוד התנהגות Auth (persistence, refresh אחרי ריסטרט); אם הוחלט על שינוי — יישום; אחרת — תיעוד כפי שמתועד. |

**מקורות מפורטים:**  
- T190-Notes: `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_NOTES_LINKAGE_UI_API_MISMATCH_REMEDIATION_NOTICE_v1.0.0.md`  
- T190-Price: `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_INTRADAY_PRICE_SURFACE_STALENESS_REMEDIATION_NOTICE_v1.0.0.md`  
- G7: `_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_S002_P003_WP002_GATE7_FEEDBACK_DRAFT.md`, `_COMMUNICATION/_Architects_Decisions/NIMROD_GATE7_S002_P003_WP002_DECISION_v1.2.1.md`

---

## 3) Required output

- **overall_status:** PASS | BLOCK  
- **Per item (12, 13, 14, 15, 16):** סטטוס (PASS/BLOCK) + evidence path או תיאור קצר.  
- **רשימת שינויים:** קבצים/endpoints שהשתנו.  
- **חוזה ל־Team 30:** שינויים ב־API (שדות חדשים, קודי שגיאה, validation rules) — מסמך קצר או טבלה.  
- **נתיב דוח השלמה:** קובץ ב־`documentation/reports/05-REPORTS/artifacts_SESSION_01/` (למשל `TEAM_20_S002_P003_WP002_GATE3_BATCH1_COMPLETION_v1.0.0.md`).

---

## 4) Stop-gate

באץ' 2 (Team 30) **לא** יופעל עד ש־Team 20 ו־Team 60 ידווחו **PASS** על כל סעיפי באץ' 1.

---

**log_entry | TEAM_10 | GATE3_BATCH1_ACTIVATION | S002_P003_WP002 | TO_TEAM_20 | 2026-03-06**
