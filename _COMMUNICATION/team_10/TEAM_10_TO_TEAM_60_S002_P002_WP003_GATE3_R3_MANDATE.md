# Team 10 → Team 60 | S002-P002-WP003 — GATE_3 Remediation R3 (Blockers 1.2, 1.3)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE3_R3_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure)  
**date:** 2026-03-10  
**status:** MANDATE_ACTIVE  
**context:** GATE_3 REMEDIATION — BLOCK @ GATE_7 (R2 QA); flow returned per rollback semantics  
**trigger:** TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_R2_QA_REPORT  
**SSOT:** TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_R2_QA_REPORT §5 Root Causes  

---

## 1) Gate Context

החבילה **אינה** בשער 7. חבילה נכשלה ב־QA → **חזרה ל־GATE_3**. אתם מתקנים במסגרת GATE_3 REMEDIATION.

---

## 2) Scope (Blockers 1.2, 1.3)

| Blocker | Root Cause | Action |
|---------|------------|--------|
| **1.3** | Seed does not set exchange_id for existing tickers (TEVA.TA, ANAU.MI) | Extend seed: `UPDATE tickers SET exchange_id=... WHERE symbol IN ('TEVA.TA','ANAU.MI')` — link to TASE, MIL |
| **1.2** | AAPL, QQQ, SPY have no EOD (price_source null) | Run `make sync-eod` after seed; verify intraday/EOD pipelines fill |

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE3_R3_COMPLETION.md`

---

**log_entry | TEAM_10 | WP003_G3_R3_MANDATE | TO_TEAM_60 | 2026-03-11**
