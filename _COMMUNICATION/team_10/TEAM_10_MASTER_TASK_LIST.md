# רשימת משימות מרכזית — Team 10 (The Gateway)

**id:** `TEAM_10_MASTER_TASK_LIST`  
**היררכיית ניהול:** **רמה 2** — בין מפת הדרכים (רמה 1) לתוכניות ביצוע לצוותים (רמה 3). חובה תאום מלא בין הרמות — ראה נוהל.  
**owner:** Team 10 בלבד — אף צוות אחר לא רשאי לכתוב לקובץ זה  
**מפת דרכים (רמה 1):** Roadmap v2.1 — `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`  
**נוהל ניהול:** `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`  
**תפקיד:** ניהול תהליך, סדר משימות וסטטוס, **הפעלת צוותים — הודעות ברורות עם משימות** (ראה `TEAM_10_GATEWAY_ROLE_AND_PROCESS.md`).  
**last_updated:** 2026-02-13

---

**כלל:** הרשימה לא נמחקת — רק נוספים סעיפים ומעודכן מידע. פירוט, תת־משימות ותוכניות עבודה — בקבצים נפרדים (רמה 3; ראה נוהל).

**הערת סטטוס (1-001, 1-003, 1-004):** שער ב' — **PASS**. שלוש המשימות CLOSED. **External Data:** חבילה מ־90. M1 (P3-007) CLOSED. **הגשה מחדש (Resubmission):** TEAM_90_RESUBMISSION_REQUIRED — SSOT הורחב (Market Cap, Indicators, 250d, Coverage Matrix, Indicators Spec, PRECISION_POLICY market_cap). P3-008–P3-012 — מנדטים נשלחו; P3-013–P3-015 נוספו (Market Cap, Indicators, 250d). פערים פתוחים — ראה TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.

**מספור:** כל משימה מקבלת **תחילית לפי מספר השלב במפת הדרכים** + מספר סידורי בתוך השלב: `[שלב]-[סידורי]` (למשל 1-001, 1b-001, P3-001). ראה נוהל.

---

## מטריצת משימות

| # | שם | תיאור | סטטוס | שלב | צוות מוביל | קובץ תיעוד | תאריך יצירה | תאריך עדכון | תאריך סגירה |
|---|-----|------|------------------|------------|---------------------------|------------------------------------------|------------|------------|------------|
| 1-001 | FOREX_MARKET_SPEC | אפיון שערים ומחירים, SSOT. שער ב' PASS | CLOSED | Stage-1 | Team 20 + Team 10 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| 1-002 | MARKET_DATA_PIPE | תשתית exchange_rates, Cache, EOD | CLOSED | Stage-1 | Team 20 + Team 60 | TEAM_90_TO_TEAM_10_STAGE1_1_002_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| 1-003 | CASH_FLOW_PARSER | פיענוח תזרימים, SSOT. שער ב' PASS | CLOSED | Stage-1 | Team 20 + Team 10 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| 1-004 | Precision Audit | Evidence 20+60. שער ב' PASS | CLOSED | Stage-1 | Team 20 + Team 60 + Team 10 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| 1b-001 | Stage-1b Template Factory | generate/validate-pages.js, Evidence PASS | CLOSED | Stage-1b | Team 30 + Team 10 | TEAM_30_STAGE1B_1B001_CLOSURE_REPORT.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-001 | Routes SSOT | routes.json — עמודי Roadmap v2.1 | OPEN | Pre-Batch 3 | Team 10 + Team 30 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-002 | Menu Alignment | unified-header — Tracking/Planning | OPEN | Pre-Batch 3 | Team 30 + Team 40 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-003 | Blueprint Scope + Drift | Blueprint ↔ Roadmap, OUT OF SCOPE | OPEN | Pre-Batch 3 | Team 31 + Team 10 | TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-004 | ADR-022 + POL-015 Enforcement | Unified Shell, EOD Warning, Provider Lock, SSOT | OPEN | Pre-Batch 3 | Team 30 + Team 10 + Team 20 + Team 60 | TEAM_90_TO_TEAM_10_ADR_022_AND_POL_015_1_ENFORCEMENT.md | 2026-02-13 | 2026-02-13 | — |
| P3-005 | FOREX_MARKET_SPEC ADR-022 | עדכון SSOT לפי ADR-022; 1-001 CLOSED | CLOSED | Pre-Batch 3 | Team 10 + Team 20 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-006 | Precision Policy SSOT | מסמך SSOT; יישור Field Maps + Models + DB; 1-004 CLOSED | CLOSED | Pre-Batch 3 | Team 10 + Team 20 + Team 60 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-007 | External Data M1 — SSOT Lock | עדכון MARKET_DATA_PIPE_SPEC, FOREX_MARKET_SPEC, WP_20_09; Evidence; 00_MASTER_INDEX | CLOSED | Pre-Batch 3 | Team 10 | TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-008 | External Data M2 — Provider Interface + Cache-First | ממשק אגנוסטי; cache-first; config-driven (Team 20) | OPEN | Pre-Batch 3 | Team 20 | TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-009 | External Data M3 — Provider Guardrails | Yahoo UA Rotation; Alpha RateLimitQueue 12.5s (Team 20) | OPEN | Pre-Batch 3 | Team 20 | TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-010 | External Data M4 — Cadence + Ticker Status | Cadence Policy ב־SSOT; ticker_status מקור וערכים (10+20) | OPEN | Pre-Batch 3 | Team 10 + Team 20 | TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md | 2026-02-13 | 2026-02-13 | — |
| P3-011 | External Data M5 — FX EOD Sync | Alpha→Yahoo; Evidence (Team 60) | OPEN | Pre-Batch 3 | Team 60 | TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md | 2026-02-13 | 2026-02-13 | — |
| P3-012 | External Data M6 — Clock Staleness UI | Clock + color + tooltip, אין באנר (Team 30) | OPEN | Pre-Batch 3 | Team 30 | TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md | 2026-02-13 | 2026-02-13 | — |

---

**ערכי סטטוס:** OPEN | IN_PROGRESS | BLOCKED | PENDING_VERIFICATION | CLOSED — הגדרות וכללי סגירה: נוהל.  
**תחיליות שלב (מפת דרכים):** 1 = Stage-1 | 1b = Stage-1b | P3 = Pre-Batch 3 | 3 = Batch 3 | 4 = Batch 4 | …

**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_002_DDL_COMPLETED_PENDING_VERIFICATION | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_002_QA_GATE_A_PASS_RUNTIME_VERIFIED | 2026-02-13** — דוח: TEAM_50_TO_TEAM_10_STAGE1_1_002_QA_REPORT.md  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_002_GATE_B_PASSED_CLOSED | 2026-02-13** — TEAM_90_TO_TEAM_10_STAGE1_1_002_GATE_B_PASS.md  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_NEXT_SERVER_STEP_COMPLETED | 2026-02-13** — Team 20: endpoint exchange-rates + Staleness (TEAM_20_TO_TEAM_10_STAGE1_NEXT_SERVER_STEP_COMPLETION.md). Team 10: SSOT עודכן — Cache/EOD (MARKET_DATA_PIPE_SPEC §5).  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1B_1B001_CLOSED | 2026-02-13** — TEAM_30_TO_TEAM_10_STAGE1B_1B001_CLOSURE_REPORT.md; Evidence PASS (TEAM_30_STAGE1B_1B001_EVIDENCE_PASS.md). חסימת Stage-1b נפתחה.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_001_1_004_GATE_A_PASSED | 2026-02-13** — דוח: TEAM_50_TO_TEAM_10_VERIFICATION_CLOSURE_1_001_1_004_GATE_A_REPORT.md. בקשה לשער ב' — TEAM_10_TO_TEAM_90_STAGE1_1_001_1_004_GATE_B_REQUEST.md  
**log_entry | TEAM_10 | MASTER_TASK_LIST | P3_004_ADDED | 2026-02-13** — משימה חדשה: ADR-022 + POL-015 Enforcement (מקור: החלטה רשמית Team 90 / Architect). מנדט ל-30: TEAM_10_TO_TEAM_30_ADR_022_POL_015_ENFORCEMENT_MANDATE.md  
**log_entry | TEAM_10 | MASTER_TASK_LIST | GATE_B_REVIEW_1_001_1_003_1_004_BLOCKED | 2026-02-13** — TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md. 1-001, 1-003, 1-004 → BLOCKED. P3-005 (FOREX ADR-022), P3-006 (Precision Policy SSOT) נפתחו.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | PRE_GATE_B_CHECKLIST_ADDED | 2026-02-13** — צ'קליסט הגשה חוזרת: TEAM_10_PRE_GATE_B_CHECKLIST_1_001_1_003_1_004.md (חובה לסמן כל הפריטים לפני הגשה ל־90).  
**log_entry | TEAM_10 | MASTER_TASK_LIST | MANDATES_SENT_P3_005_P3_006 | 2026-02-13** — חלוקת משימות: מנדטים נשלחו ל־20 (P3-005+P3-006), 60 (P3-006), 30 (EOD תוצר 1-001). ממתינים לדיווח/תוצרים לפני הגשת Gate-B מחדש.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | DELIVERABLES_RECEIVED_P3_005_P3_006 | 2026-02-13** — 30: EOD מושלם. 20: P3-005 מושלם; P3-006 ממתין ל־SSOT. 60: ממתין ל־SSOT.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | PRECISION_POLICY_SSOT_PUBLISHED | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | TEAM_MESSAGES_ISSUED | 2026-02-13** — הודעות: 20, 60, 30, 50.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | P3_006_20_60_COMPLETE | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | G2_G5_G6_COMPLETE_GATE_B_RE_REQUESTED | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_INTEGRATION | 2026-02-13** — חבילת External Data (90). M1 (P3-007) — SSOT משולב (MARKET_DATA_PIPE_SPEC, FOREX_MARKET_SPEC, WP_20_09). P3-008–P3-012 נוספו; תוכנית אב: TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md. שאלות פתוחות: TEAM_10_EXTERNAL_DATA_OPEN_QUESTIONS_FOR_ARCHITECT.md.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_001_1_003_1_004_GATE_B_PASSED_CLOSED | 2026-02-13** — TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md. 1-001, 1-003, 1-004 → CLOSED. P3-005, P3-006 → CLOSED. — G2: FOREX_MARKET_SPEC.md מעודכן (ADR-022 §2.1–2.5). G5: Evidence log — documentation/05-REPORTS/artifacts/TEAM_10_STAGE1_1_001_1_003_1_004_PRE_GATE_B_EVIDENCE_LOG.md. G6: בקשת Gate B מחדש ל־90 — TEAM_10_TO_TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_RE_REQUEST.md. — 20: Models תואמים; Field Maps טיוטה → Team 10 החיל ב־documentation/01-ARCHITECTURE/LOGIC/ (CASH_FLOWS, TRADES, TRADING_ACCOUNTS, BALANCES). Evidence: TEAM_20_P3_006_PRECISION_EVIDENCE.md. 60: מיגרציה brokers_fees.minimum 20,6; TEAM_60_P3_006_PRECISION_EVIDENCE.md, TEAM_60_TO_TEAM_10_P3_006_COMPLETION_REPORT.md. P3-006 → PENDING_VERIFICATION. נותר G2 + Gate B.
