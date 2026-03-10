# Team 10 → Team 30 | S002-P002-WP003 GATE_7 Remediation — Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_S002_P002_WP003_GATE7_REMEDIATION_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 30 (Frontend)  
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
| **BF-001** | Core ticker price transparency | Bind `current_price`, `last_close_price`, `price_source`, `price_as_of_utc` **per row** from API. Add **explicit** `price_as_of_utc` column. Prevent "-" when payload has value. Ensure current vs last_close render distinctly. |
| **BF-002** | Per-ticker currency | Stop hardcoded USD. Use `currency` from API payload per row. Format display (€, ₪, $) according to currency. |
| **BF-003** | Details + traffic light | Add "פרטים" (details) action in row menu. **Traffic light from `price_source`:** EOD→🟢, EOD_STALE/INTRADAY_FALLBACK→🟡, null→🔴. Details modal → existing GET `/tickers/{id}/data-integrity`. |
| **BF-004** | Staleness clock | **Root cause:** `eodStalenessCheck.js` uses exchange-rates `last_sync_time` (24 days stale). **Fix:** In `loadAllData()` after ticker fetch — call `window.updateStalenessClock()` with `max(price_as_of_utc)` from ticker list. Clock reflects actual price freshness. |

---

## 2) SSOT

- **Remediation scope:** `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_SCOPE_LOCK_v1.0.0.md`
- **Blocking report:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0.md`
- **D22 tickers:** `ui/src/views/management/tickers/tickersTableInit.js`, `tickersPageConfig.js`

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION.md`

- status: DONE | BLOCKED
- Per-BF evidence (screenshots, DOM/component paths)
- Blockers if API/design dependency

---

## 4) Coordination

- BF-001/002: Align with Team 20 API contract (TickerResponse: currency added).
- BF-003: Traffic light from `price_source` (no new API).
- BF-004: Staleness clock bound to ticker `price_as_of_utc`, not exchange-rates.

---

**log_entry | TEAM_10 | WP003_G7_REMEDIATION_MANDATE | TO_TEAM_30 | 2026-03-11**
