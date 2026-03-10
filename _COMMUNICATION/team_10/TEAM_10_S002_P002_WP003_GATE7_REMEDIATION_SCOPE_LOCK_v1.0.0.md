# Team 10 | S002-P002-WP003 GATE_7 Remediation Scope Lock v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_SCOPE_LOCK_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** All remediation teams; Team 00; Nimrod  
**date:** 2026-03-11  
**status:** CANONICAL  
**authority:** TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0  
**gate_id:** GATE_7 (flow returned to GATE_3 per procedure)  

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

## 1) Scope Baseline (per BF-G7-WP003-005)

חבילת התיקונים נועדה לסגור את 5 הממצאים הבאים. אין להוסיף או להסיר פריטים ללא אישור Team 00/Team 190.

### 1.1 Fields Transparency Baseline (BF-001)

| Field | Backend (TickerResponse) | Frontend (D22) | Requirement |
|-------|--------------------------|----------------|-------------|
| `current_price` | ✅ exists | must bind row-specific | distinct from last_close |
| `last_close_price` | ✅ exists | must bind row-specific | separate column |
| `price_source` | ✅ exists (EOD\|EOD_STALE\|INTRADAY_FALLBACK) | must not render "-" when payload has value | explicit column |
| `price_as_of_utc` | ✅ exists | **add explicit column** | visible per row |

**Acceptance:** ≥3 symbols with distinct current vs last_close; non-empty source; visible as-of timestamp.

### 1.2 Per-Ticker Currency (BF-002)

| Requirement | Current state | Fix |
|-------------|---------------|-----|
| Currency per ticker | Not in TickerResponse | Add `currency` to payload |
| Display semantics | Frontend hardcodes USD | Render per row from API |
| Non-USD symbols | TEVA.TA, ANAU.MI, BTC-USD | Show ILS, EUR, USD correctly |

**Acceptance:** TEVA.TA, BTC-USD, ANAU.MI show correct currency in table and details.

**Design decision needed:** Currency derivation — exchange→currency mapping, or symbol parse (BTC-USD→USD), or new ticker.currency column. See §4 QUESTIONS.

### 1.3 Details Module & Data-Status (BF-003)

| Requirement | Current state | Fix |
|-------------|---------------|-----|
| Details action | Only Edit, Delete in actions menu | Add "פרטים" (details) action |
| Full details module | No dedicated modal/page | Implement ticker details modal with all fields |
| Row-level status | None | Add data-status column: green/yellow/red |

**Status semantics:**
- Green: current + historical complete
- Yellow: current complete, historical gaps
- Red: current gaps

**Acceptance:** User opens details from row; table shows status indicator per row.

### 1.4 Off-Hours & Staleness Coherence (BF-004)

| Requirement | Fix |
|-------------|-----|
| Staleness clock aligned with real data | Bind to actual last fetch timestamp from pipeline |
| Off-hours status clear | Expose semantics in ticker management (labels/tooltips) |
| Last-update reflects real state | Use fetched_at / price_timestamp from DB, not static |

**Owners:** Team 20 (data contract), Team 30 (UI), Team 60 (scheduler/pipeline state if needed).

### 1.5 Scope Document Completeness (BF-005)

This document satisfies BF-005. All BF-001..004 mapped here.

---

## 2) Status (per procedure)

**חבילה חזרה ל-GATE_3** (CODE_CHANGE_REQUIRED → flow returns to GATE_3 per GATE_7 contract).  
**תשובות אדריכליות התקבלו** — `TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`. Holds הוסרו; מנדטים מעודכנים ופעילים.

---

## 3) Remediation Matrix (BF → Owner → Artifacts)

| BF ID | Owner(s) | Primary artifacts | Acceptance |
|-------|----------|-------------------|------------|
| BF-001 | Team 20 + Team 30 | tickers_service, _get_price_with_fallback; tickersTableInit.js, columns | 3 symbols distinct; source visible; as-of column |
| BF-002 | Team 20 + Team 30 | schemas/tickers, tickers_service; tickersTableInit formatCurrency | TEVA/BTC/ANAU correct currency |
| BF-003 | Team 30 (+ Team 20 status API) | tickersTableInit actions, details modal; data-integrity or new status endpoint | Details from row; traffic light column |
| BF-004 | Team 20 + Team 30 + Team 60 | data-integrity, staleness source; UI labels | Human run confirms coherence |
| BF-005 | Team 10 | This document | Done |

---

## 4) Re-Submission Checklist (per Blocking Report §2)

1. One remediation matrix: BF id → owner → artifact path → status.
2. Team 20/30 completion reports with field-level evidence.
3. Team 50 re-QA report covering BF-001..004; **includes Nimrod direct verification pass**.
4. Updated Team 90 scenario package for Nimrod re-run.
5. Re-submit to Team 90 for GATE_7 revalidation.

---

## 5) QUESTIONS — RESOLVED

תשובות ב: `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`

**Q1:** Option D — COUNTRY_TO_CURRENCY + symbol parse; no migration.  
**Q2:** Traffic light from `price_source`; zero backend change.  
**Q3:** Root cause — exchange-rates `last_sync_time`; fix — bind clock to ticker `price_as_of_utc`.

---
*[Historical — original questions below]*

### Q1 — Currency (BF-002)

**Background:** `market_data.tickers` has `exchange_id`; `market_data.exchanges` has `country` but no `currency` column. CRYPTO (e.g. BTC-USD) has quote in symbol.

**Options:**
- A: Add `currency` column to tickers (schema migration).
- B: Derive from exchange metadata (e.g. TASE→ILS, Borsa Italiana→EUR); add exchange.currency or metadata.
- C: Derive from symbol (BTC-USD→USD); exchange→currency mapping for stocks.

**Question:** Which approach is architecturally approved? If B/C — do we have or need exchange→currency mapping?

### Q2 — Data-Status Traffic Light (BF-003)

**Background:** "green/yellow/red" requires definition of "current complete" vs "historical complete".

**Question:** Is `GET /tickers/{id}/data-integrity` the source? If yes — how do we map `gap_status` / `has_data` to green/yellow/red? Exact mapping requested.

### Q3 — Staleness "24 days" (BF-004)

**Background:** Human observed "24 days" display that didn't match expected freshness.

**Question:** Where is this displayed (component path)? What is the expected max staleness for off-hours (e.g. 48h EOD_STALE per existing constant)?

---

**log_entry | TEAM_10 | WP003_G7_REMEDIATION_SCOPE_LOCK | v1.0.0 | 2026-03-11**
