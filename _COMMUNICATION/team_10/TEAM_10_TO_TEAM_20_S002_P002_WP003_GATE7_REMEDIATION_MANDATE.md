# Team 10 → Team 20 | S002-P002-WP003 GATE_7 Remediation — Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_REMEDIATION_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-10  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**authority:** TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 10 |

---

## 1) Scope — Your BF Items

**SSOT answers:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`

| BF ID | Description | Your responsibility |
|-------|-------------|---------------------|
| **BF-001** | Core ticker price transparency | **Root cause:** `last_close = close_p or price_val` — when no distinct close_price, both fields same. **Fix:** Window function — fetch two EOD records per ticker; use rank=2 as `last_close_price` (previous session close). |
| **BF-002** | Per-ticker currency | Add `currency` to TickerResponse. **Option D, no migration:** COUNTRY_TO_CURRENCY static map (IL→ILS, IT→EUR, US→USD). CRYPTO/no exchange_id: parse symbol (BTC-USD→USD, ETH-EUR→EUR). Outerjoin Exchange in get_tickers() — no schema change. |
| **BF-003** | Data-status for traffic light | **Zero backend change.** Traffic light derived from existing `price_source` (Team 30 colors per row). Details modal → existing `/data-integrity`. |
| **BF-004** | Off-hours/staleness | API already correct. Root cause: UI reads exchange-rates `last_sync_time` (24 days stale). Team 30 fixes staleness clock source. |

---

## 2) SSOT

- **Remediation scope:** `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_SCOPE_LOCK_v1.0.0.md`
- **Blocking report:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0.md`

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION.md`

- status: DONE | BLOCKED (with blocker)
- Per-BF evidence (field-level, API snippets)
- Open questions if blocked on Q1/Q2/Q3

---

## 4) Blockers

None. Team 00 answers received; all scope locked.

---

**log_entry | TEAM_10 | WP003_G7_REMEDIATION_MANDATE | TO_TEAM_20 | 2026-03-11**
