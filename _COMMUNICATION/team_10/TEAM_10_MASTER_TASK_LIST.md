# רשימת משימות מרכזית — Team 10 (The Gateway)

**id:** `TEAM_10_MASTER_TASK_LIST`  
**היררכיית ניהול:** **רמה 2** — בין מפת הדרכים (רמה 1) לתוכניות ביצוע לצוותים (רמה 3). חובה תאום מלא בין הרמות — ראה נוהל.  
**owner:** Team 10 בלבד — אף צוות אחר לא רשאי לכתוב לקובץ זה  
**מפת דרכים (רמה 1):** Roadmap v2.1 — `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`  
**נוהל ניהול:** `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`  
**last_updated:** 2026-02-13

---

**כלל:** הרשימה לא נמחקת — רק נוספים סעיפים ומעודכן מידע. פירוט, תת־משימות ותוכניות עבודה — בקבצים נפרדים (רמה 3; ראה נוהל).

**מספור:** כל משימה מקבלת **תחילית לפי מספר השלב במפת הדרכים** + מספר סידורי בתוך השלב: `[שלב]-[סידורי]` (למשל 1-001, 1b-001, P3-001). ראה נוהל.

---

## מטריצת משימות

| # | שם | תיאור | סטטוס | שלב (מפת דרכים) | צוות מוביל | קובץ תיעוד רלוונטי מרכזי | תאריך יצירה | תאריך עדכון | תאריך סגירה |
|---|-----|--------|--------|-------------------|-------------|---------------------------|--------------|--------------|--------------|
| 1-001 | FOREX_MARKET_SPEC | אפיון שערים ומחירים — SSOT ב-documentation/01-ARCHITECTURE/ | PENDING_VERIFICATION | Stage-1 | Team 20 + Team 10 | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md | 2026-02-13 | 2026-02-13 | — |
| 1-002 | MARKET_DATA_PIPE | תשתית: exchange_rates DDL הורץ; טבלה קיימת; Cache/טבלאות מוכנים; EOD sync באחריות 20 | CLOSED | Stage-1 | Team 20 + Team 60 | TEAM_90_TO_TEAM_10_STAGE1_1_002_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| 1-003 | CASH_FLOW_PARSER | פיענוח תזרימים — SSOT ב-documentation/01-ARCHITECTURE/ | PENDING_VERIFICATION | Stage-1 | Team 20 + Team 10 | documentation/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md | 2026-02-13 | 2026-02-13 | — |
| 1-004 | Precision Audit | Evidence מ-20+60 הוגש | PENDING_VERIFICATION | Stage-1 | Team 20 + Team 60 + Team 10 | TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md | 2026-02-13 | 2026-02-13 | — |
| 1b-001 | Stage-1b Template Factory | generate-pages.js + validate-pages.js ב-ui/scripts/; Evidence PASS | CLOSED | Stage-1b | Team 30 + Team 10 | TEAM_30_TO_TEAM_10_STAGE1B_1B001_CLOSURE_REPORT.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-001 | Routes SSOT | עדכון routes.json — כל עמודי Roadmap v2.1 (כולל Tracking/Planning) | OPEN | Pre-Batch 3 | Team 10 + Team 30 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-002 | Menu Alignment | עדכון unified-header.html — Tracking/Planning + פריטי משנה | OPEN | Pre-Batch 3 | Team 30 + Team 40 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-003 | Blueprint Scope + Drift | מטריצת Blueprint ↔ Roadmap v2.1; סימון OUT OF SCOPE / החלטה רשמית לעמודים חורגים | OPEN | Pre-Batch 3 | Team 31 + Team 10 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md | 2026-02-13 | 2026-02-13 | — |

---

**ערכי סטטוס:** OPEN | IN_PROGRESS | BLOCKED | PENDING_VERIFICATION | CLOSED — הגדרות וכללי סגירה: נוהל.  
**תחיליות שלב (מפת דרכים):** 1 = Stage-1 | 1b = Stage-1b | P3 = Pre-Batch 3 | 3 = Batch 3 | 4 = Batch 4 | …

**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_002_DDL_COMPLETED_PENDING_VERIFICATION | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_002_QA_GATE_A_PASS_RUNTIME_VERIFIED | 2026-02-13** — דוח: TEAM_50_TO_TEAM_10_STAGE1_1_002_QA_REPORT.md  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_002_GATE_B_PASSED_CLOSED | 2026-02-13** — TEAM_90_TO_TEAM_10_STAGE1_1_002_GATE_B_PASS.md  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_NEXT_SERVER_STEP_COMPLETED | 2026-02-13** — Team 20: endpoint exchange-rates + Staleness (TEAM_20_TO_TEAM_10_STAGE1_NEXT_SERVER_STEP_COMPLETION.md). Team 10: SSOT עודכן — Cache/EOD (MARKET_DATA_PIPE_SPEC §5).  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1B_1B001_CLOSED | 2026-02-13** — TEAM_30_TO_TEAM_10_STAGE1B_1B001_CLOSURE_REPORT.md; Evidence PASS (TEAM_30_STAGE1B_1B001_EVIDENCE_PASS.md). חסימת Stage-1b נפתחה.
