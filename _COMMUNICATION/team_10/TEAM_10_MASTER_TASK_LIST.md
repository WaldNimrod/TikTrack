# רשימת משימות מרכזית — Team 10 (The Gateway)

**id:** `TEAM_10_MASTER_TASK_LIST`  
**היררכיית ניהול:** **רמה 2** — בין מפת הדרכים (רמה 1) לתוכניות ביצוע לצוותים (רמה 3). חובה תאום מלא בין הרמות — ראה נוהל.  
**owner:** Team 10 בלבד — אף צוות אחר לא רשאי לכתוב לקובץ זה  
**מפת דרכים (רמה 1):** Roadmap v2.1 — `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`  
**נוהל ניהול:** `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`  
**תפקיד:** ניהול תהליך, סדר משימות וסטטוס, **הפעלת צוותים — הודעות ברורות עם משימות** (ראה `TEAM_10_GATEWAY_ROLE_AND_PROCESS.md`).  
**last_updated:** 2026-02-15

---
**תוכנית סגירה פתוחים (2026-02-15):** [TEAM_10_OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION.md](TEAM_10_OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION.md) — סדר: P3-003 → P3-010 → P3-004; הודעות הפעלה: 31 (P3-003), 20 (P3-010 + P3-004), 30 (P3-004 Seal), 60 (P3-004 אימות).

---

**כלל:** הרשימה לא נמחקת — רק נוספים סעיפים ומעודכן מידע. פירוט, תת־משימות ותוכניות עבודה — בקבצים נפרדים (רמה 3; ראה נוהל).

**הערת סטטוס (1-001, 1-003, 1-004):** שער ב' — **PASS**. שלוש המשימות CLOSED. **External Data:** חבילה מ־90. M1 (P3-007) CLOSED. **הגשה מחדש (Resubmission):** ✅ **VERIFIED — CLOSED** (TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RESUBMISSION_VERIFIED). SSOT הורחב; תיקוני ולידציה הוחלו. **מותר להתקדם** — ביצוע P3-008–P3-015 לפי מנדטים. פערים פתוחים (Intraday, Interval, Ticker Status) מסומנים ב־GAPS — יטופלו בהמשך.

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
| P3-001 | Routes SSOT | routes.json — עמודי Roadmap v2.1 | CLOSED | Pre-Batch 3 | Team 10 + Team 30 | TEAM_30_TO_TEAM_10_PRE_BATCH_3_SEAL_MESSAGE.md | 2026-02-13 | 2026-01-31 | 2026-01-31 |
| P3-002 | Menu Alignment | unified-header — Tracking/Planning | CLOSED | Pre-Batch 3 | Team 30 + Team 40 | TEAM_30_TO_TEAM_10_PRE_BATCH_3_SEAL_MESSAGE.md | 2026-02-13 | 2026-01-31 | 2026-01-31 |
| P3-003 | Blueprint Scope + Drift | Blueprint ↔ Roadmap, OUT OF SCOPE | CLOSED | Pre-Batch 3 | Team 31 + Team 10 | TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md | 2026-02-13 | 2026-02-15 | 2026-02-15 |
| P3-004 | ADR-022 + POL-015 Enforcement | Unified Shell, EOD Warning, Provider Lock, SSOT | CLOSED | Pre-Batch 3 | Team 30 + Team 10 + Team 20 + Team 60 | documentation/05-REPORTS/artifacts/TEAM_10_P3_004_ADR_022_POL_015_EVIDENCE_LOG.md | 2026-02-13 | 2026-02-15 | 2026-02-15 |
| P3-005 | FOREX_MARKET_SPEC ADR-022 | עדכון SSOT לפי ADR-022; 1-001 CLOSED | CLOSED | Pre-Batch 3 | Team 10 + Team 20 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-006 | Precision Policy SSOT | מסמך SSOT; יישור Field Maps + Models + DB; 1-004 CLOSED | CLOSED | Pre-Batch 3 | Team 10 + Team 20 + Team 60 | TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-007 | External Data M1 — SSOT Lock | עדכון MARKET_DATA_PIPE_SPEC, FOREX_MARKET_SPEC, WP_20_09; Evidence; 00_MASTER_INDEX | CLOSED | Pre-Batch 3 | Team 10 | TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-008 | External Data M2 — Provider Interface + Cache-First | ממשק אגנוסטי; cache-first; config-driven (Team 20) | CLOSED | Pre-Batch 3 | Team 20 | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-009 | External Data M3 — Provider Guardrails | Yahoo UA Rotation; Alpha RateLimitQueue 12.5s (Team 20) | CLOSED | Pre-Batch 3 | Team 20 | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-010 | External Data M4 — Cadence + Ticker Status | Cadence Policy ב־SSOT; ticker_status מקור וערכים (10+20) | CLOSED | Pre-Batch 3 | Team 10 + Team 20 | TEAM_20_P3_010_AND_P3_004_ACTIVATION_ACK.md (Seal 2026-02-15) | 2026-02-13 | 2026-02-15 | 2026-02-15 |
| P3-011 | External Data M5 — FX EOD Sync | Alpha→Yahoo; Evidence (Team 60) | CLOSED | Pre-Batch 3 | Team 60 | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-012 | External Data M6 — Clock Staleness UI | Clock + color + tooltip, אין באנר (Team 30) | CLOSED | Pre-Batch 3 | Team 30 | TEAM_30_TO_TEAM_10_PRE_BATCH_3_SEAL_MESSAGE.md | 2026-02-13 | 2026-01-31 | 2026-01-31 |
| P3-013 | External Data M6 (Addendum) — Market Cap | שדה market_cap ב־ticker_prices, 20,8; Yahoo→Alpha EOD (Team 20) | CLOSED | Pre-Batch 3 | Team 20 | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-014 | External Data M7 — Indicators ATR/MA/CCI | ATR(14), MA(20/50/150/200), CCI(20); 250d history (Team 20) | CLOSED | Pre-Batch 3 | Team 20 | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-015 | External Data M8 — 250d Historical Daily | OHLCV 250 trading days retention ב־ticker_prices (Team 20) | CLOSED | Pre-Batch 3 | Team 20 | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-016 | External Data — Intraday Table + Migration | טבלה `market_data.ticker_prices_intraday` + DDL/migration (Team 60) | CLOSED | Pre-Batch 3 | Team 60 | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |
| P3-017 | External Data — Cleanup Jobs + Evidence | Jobs: Intraday retention 30d, Daily 250d, archive; Evidence logs (Team 60) | CLOSED | Pre-Batch 3 | Team 60 | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE.md | 2026-02-13 | 2026-02-13 | 2026-02-13 |

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
**log_entry | TEAM_10 | MASTER_TASK_LIST | STAGE1_1_001_1_003_1_004_GATE_B_PASSED_CLOSED | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_RESUBMISSION_SSOT | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_RESUBMISSION_VERIFIED_CLOSED | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | GOVERNANCE_V2_102_ADOPTION | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_MAINTENANCE_KICKOFF | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_ACTIVATION_SENT | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | TEAM_60_EXTERNAL_DATA_DELIVERABLES_RECEIVED | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | TEAM_30_SOP_013_SEAL_RECEIVED | 2026-01-31**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | TEAM_20_EXTERNAL_DATA_COMPLETION_RECEIVED | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_QA_GATE_A_PASS | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_SEAL_REQUESTS_SENT | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | EXTERNAL_DATA_SEALS_RECEIVED_20_60 | 2026-02-13**  
**log_entry | TEAM_10 | MASTER_TASK_LIST | OPEN_TASKS_CLOSURE_PLAN_AND_ACTIVATION | 2026-02-15** — תוכנית סגירה: P3-003, P3-010, P3-004. הודעות הפעלה: TEAM_10_TO_TEAM_31_P3_003_BLUEPRINT_SCOPE_REQUEST, TEAM_10_TO_TEAM_20_P3_010_AND_P3_004_ACTIVATION, TEAM_10_TO_TEAM_30_P3_004_SEAL_REMINDER, TEAM_10_TO_TEAM_60_P3_004_VERIFICATION_REQUEST.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | P3_010_SEAL_RECEIVED_20 | 2026-02-15** — TEAM_20_P3_010_AND_P3_004_ACTIVATION_ACK.md. Seal (SOP-013) התקבל: P3-010 (Cadence + Ticker Status) + P3-004 אימות ADR-022 (חלק 20). P3-010 → CLOSED. P3-004 (חלק 20) הושלם; משימה כוללת OPEN עד 10, 30, 60. ACK: TEAM_10_TO_TEAM_20_P3_010_P3_004_SEAL_ACK.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | P3_003_P3_004_TEAM_10_COMPLETE | 2026-02-15** — P3-003: מטריצת Blueprint Scope + Drift — TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md; P3-003 → CLOSED. P3-004: Evidence log — documentation/05-REPORTS/artifacts/TEAM_10_P3_004_ADR_022_POL_015_EVIDENCE_LOG.md; וידוא SSOT (אין Frankfurter); P3-004 → CLOSED. משימות צוות 10 הושלמו.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | P3_004_TEAM_30_SEAL_RECEIVED | 2026-02-15** — הודעת Seal (SOP-013) התקבלה: TEAM_30_TO_TEAM_10_P3_004_SEAL_SOP_013.md. חלק Team 30 (Unified Shell + EOD Warning) — נחתם. ACK: TEAM_10_TO_TEAM_30_P3_004_SEAL_ACK.md. P3-004 הכוללת נשארת OPEN עד 10, 20, 60.  
**log_entry | TEAM_10 | MASTER_TASK_LIST | P3_004_TEAM_60_VERIFICATION_RECEIVED | 2026-02-15** — דוח אימות התקבל: TEAM_60_P3_004_VERIFICATION_REPORT.md. אין Frankfurter; תצורה תואמת ADR-022. ACK: TEAM_10_TO_TEAM_60_P3_004_VERIFICATION_ACK.md. P3-004 נשארת OPEN עד 10, 20. — TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE, TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE. P3-008, P3-009, P3-013, P3-014, P3-015 (20) + P3-011, P3-016, P3-017 (60) → CLOSED. ACK: TEAM_10_TO_TEAM_20_EXTERNAL_DATA_SEAL_ACK, TEAM_10_TO_TEAM_60_EXTERNAL_DATA_SEAL_ACK. — בקשת הגשת Seal (SOP-013) נשלחה: TEAM_10_TO_TEAM_20_EXTERNAL_DATA_SEAL_REQUEST (P3-008,009,013,014,015), TEAM_10_TO_TEAM_60_EXTERNAL_DATA_SEAL_REQUEST (P3-011,016,017). — TEAM_50_TO_TEAM_10_EXTERNAL_DATA_QA_REPORT. שער א': DB Runtime (market_cap 20,8), Unit tests, Import verification, Evidence — PASS. אין ממצאים. P3-008–P3-015 נשארות PENDING_VERIFICATION עד Seal Message (SOP-013). ACK: TEAM_10_TO_TEAM_50_EXTERNAL_DATA_QA_ACK. — TEAM_20_TO_TEAM_10_50_EXTERNAL_DATA_COMPLETION_UPDATE. P3-008, P3-009, P3-013, P3-014, P3-015 → PENDING_VERIFICATION. מיגרציה P3-013 הופעלה (60). Evidence + QA Handoff ל־50. ACK: TEAM_10_TO_TEAM_20_EXTERNAL_DATA_COMPLETION_ACK. — הודעת Seal (SOP-013) התקבלה: TEAM_30_TO_TEAM_10_PRE_BATCH_3_SEAL_MESSAGE. P3-001, P3-002, P3-012 → CLOSED. P3-004 (חלק 30) — חלק צוות 30 נחתם; משימה כוללת נשארת OPEN עד השלמת 10+20+60. — P3-011, P3-016, P3-017 תוצרים התקבלו. טבלת intraday, FX EOD, Cleanup Jobs + Evidence; מסמך תיאום ל־20: TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION. סטטוס → PENDING_VERIFICATION. ACK: TEAM_10_TO_TEAM_60_EXTERNAL_DATA_DELIVERABLES_ACK. — הודעות הפעלה (פתיחה לנושא חדש) נשלחו: TEAM_10_TO_TEAM_20_EXTERNAL_DATA_ACTIVATION, TEAM_10_TO_TEAM_30_EXTERNAL_DATA_ACTIVATION, TEAM_10_TO_TEAM_60_EXTERNAL_DATA_ACTIVATION. הקשר, יעדים, מטרה סופית, משימות מפורטות, הפניות לתיעוד ומדריכי האדריכלית לספקים. — TEAM_90_MAINTENANCE_LOCKED_UPDATE. P3-016 (Intraday table + migration), P3-017 (Cleanup jobs + Evidence) נוספו — Team 60. TT2_MARKET_DATA_RESILIENCE: staleness 15m/24h. Kickoff מאושר — TEAM_10_TO_TEAM_90_EXTERNAL_DATA_MAINTENANCE_KICKOFF_CONFIRMED. — פקודת האדריכלית (G-Bridge). נוהל SOP-013 (Seal Message = חסם יחיד לסגירה) פורסם; Clean Table, OPEN_TASKS, MASTER_TASK_LIST_PROTOCOL עודכנו; הודעת משמעת הופצה ל־20, 30, 40, 50, 60. Evidence: TEAM_10_GOVERNANCE_V2_102_ADOPTION_EVIDENCE_LOG.md. — TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RESUBMISSION_VERIFIED. הגשה מחדש אומתה; שלב התכנון סגור. מותר להתקדם לביצוע P3-008–P3-015. — TEAM_90_RESUBMISSION_REQUIRED. SSOT הורחב: MARKET_DATA_COVERAGE_MATRIX, MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC; MARKET_DATA_PIPE_SPEC (§2.4, §4.1); PRECISION_POLICY market_cap 20,8; WP_20_09 יישור. משימות P3-013 (Market Cap), P3-014 (Indicators), P3-015 (250d) נוספו. Evidence: TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG. — TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_PASS.md. 1-001, 1-003, 1-004 → CLOSED. P3-005, P3-006 → CLOSED. — G2: FOREX_MARKET_SPEC.md מעודכן (ADR-022 §2.1–2.5). G5: Evidence log — documentation/05-REPORTS/artifacts/TEAM_10_STAGE1_1_001_1_003_1_004_PRE_GATE_B_EVIDENCE_LOG.md. G6: בקשת Gate B מחדש ל־90 — TEAM_10_TO_TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_RE_REQUEST.md. — 20: Models תואמים; Field Maps טיוטה → Team 10 החיל ב־documentation/01-ARCHITECTURE/LOGIC/ (CASH_FLOWS, TRADES, TRADING_ACCOUNTS, BALANCES). Evidence: TEAM_20_P3_006_PRECISION_EVIDENCE.md. 60: מיגרציה brokers_fees.minimum 20,6; TEAM_60_P3_006_PRECISION_EVIDENCE.md, TEAM_60_TO_TEAM_10_P3_006_COMPLETION_REPORT.md. P3-006 → PENDING_VERIFICATION. נותר G2 + Gate B.
