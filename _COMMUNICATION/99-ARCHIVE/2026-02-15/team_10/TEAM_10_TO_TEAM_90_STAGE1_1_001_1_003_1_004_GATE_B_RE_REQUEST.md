# Team 10 → Team 90: בקשה לשער ב' מחדש — 1-001, 1-003, 1-004

**id:** `TEAM_10_TO_TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_RE_REQUEST`  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (The Spy)  
**date:** 2026-02-13  
**משימות:** 1-001 FOREX_MARKET_SPEC, 1-003 CASH_FLOW_PARSER, 1-004 Precision Audit  
**נוהל:** שער ב' — `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`  
**הקשר:** הגשה **מחדש** לאחר תיקון הפערים שצוינו ב־TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md (BLOCKED).

---

## 1. סיכום תיקונים שבוצעו

כל הדרישות מדוח החסימה טופלו:

### 1-001 — FOREX_MARKET_SPEC

- **SSOT מעודכן לפי ADR-022:** `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` — סעיפים 2.1–2.5: Providers (Yahoo + Alpha בלבד, אין Frankfurter), FX EOD בלבד, Primary/Fallback (Alpha → Yahoo), Cache-First, Scope מטבעות USD/EUR/ILS, Visual Warning (staleness).
- **קוד/שרת:** מיושר (דוח Team 20: TEAM_20_P3_005_FOREX_ALIGNMENT_COMPLETE.md).
- **אזהרה ויזואלית EOD:** מומשה (Team 30 — TEAM_30_TO_TEAM_10_ADR_022_POL_015_ENFORCEMENT_COMPLETION_REPORT.md).

### 1-004 — Precision Audit

- **מסמך Precision Policy SSOT:** `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md` — מפת 20,8 vs 20,6 לכל ישות.
- **Field Maps:** עודכנו ב־documentation/01-ARCHITECTURE/LOGIC/ (CASH_FLOWS, TRADES, TRADING_ACCOUNTS, BALANCES) לפי Policy.
- **Models:** תואמים (Team 20).
- **DB/Schema:** מיושר — מיגרציה brokers_fees.minimum 20,6 (Team 60).
- **Evidence:** TEAM_20_P3_006_PRECISION_EVIDENCE.md, TEAM_60_P3_006_PRECISION_EVIDENCE.md.

### 1-003 — CASH_FLOW_PARSER

- **Precision נעול:** PRECISION_POLICY_SSOT. שדה `amount` ב־CASH_FLOW_PARSER_SPEC.md — NUMERIC(20,6).

---

## 2. מקורות לאימות

| משימה | SSOT / Evidence |
|--------|------------------|
| 1-001 | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md |
| 1-003 | documentation/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md |
| 1-004 | documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md; _COMMUNICATION/team_20/TEAM_20_P3_006_PRECISION_EVIDENCE.md; _COMMUNICATION/team_60/TEAM_60_P3_006_PRECISION_EVIDENCE.md |

**Evidence Log מרכזי:** documentation/05-REPORTS/artifacts/TEAM_10_STAGE1_1_001_1_003_1_004_PRE_GATE_B_EVIDENCE_LOG.md

---

## 3. בקשת Team 10

לבצע **שער ב' מחדש** על משימות **1-001, 1-003, 1-004**. תוצר צפוי: דוח ביקורת או GATE_B_PASSED לכל משימה. לאחר מעבר — Team 10 יסמן את המשימות כ-CLOSED.

---

**log_entry | TEAM_10 | TO_TEAM_90 | STAGE1_1_001_1_003_1_004_GATE_B_RE_REQUESTED | 2026-02-13**
