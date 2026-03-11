---
project_domain: TIKTRACK
id: ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.1.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 10 (Gateway), Team 20 (Backend), Team 50 (QA), Team 90 (Validation)
cc: Team 100 (Architecture Authority)
date: 2026-03-12
status: APPROVED — BINDING
gate_id: GATE_7 (S002-P002-WP003)
work_package_id: S002-P002-WP003
supersedes: ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0
authority: Team 00 (Chief Architect — Nimrod)
---

# ARCHITECTURAL DECISION — MARKET DATA PROVIDER ARCHITECTURE v1.1.0
## Amendment + Legacy Analysis + Historical Data Strategy + Option A/B Decision

---

## §0 — Amendment Notice

This document **supersedes** `ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0` (2026-03-11) in the following critical respect:

> **REC-03 in v1.0.0 is REVOKED.** The directive to "route ANAU.MI → Alpha Vantage primary, skip Yahoo" was incorrect. ANAU.MI IS supported by Yahoo Finance (`https://finance.yahoo.com/quote/ANAU.MI/` displays live data; the legacy system received European ticker data via Yahoo). The failure mode is not "Yahoo doesn't support .MI exchange" — it is a **fetch-frequency and failure-cascade problem in Phoenix's architecture**. This is fixable in code without changing providers.

All other content of v1.0.0 (Root Cause A/B/C, Iron Rule #8, CC-04 criterion amendment, REC-01, REC-02, REC-04) remains valid and is carried forward below.

---

## §1 — Corrected Root Cause A: ANAU.MI

### §1.1 What Yahoo Finance actually supports

Yahoo Finance **does** serve ANAU.MI data. The website `https://finance.yahoo.com/quote/ANAU.MI/` confirms live price display. The legacy system (TikTrack1) received European ticker data from Yahoo Finance via the same v8/chart endpoint used in Phoenix.

The error in v1.0.0 was misinterpreting the 429 response as "symbol not found." HTTP 429 means **rate limit** — the symbol IS found but Yahoo's server is throttling requests for it. This is distinct from HTTP 404 (symbol not found).

### §1.2 Legacy code analysis — how TikTrack1 avoided the 429

Review of `archive/TikTrackV1-code&docs/.../yahoo_finance_adapter.py` and `data_refresh_policy.py` reveals the following architecture:

**Legacy Yahoo provider — key properties:**
```
Endpoint: v8/finance/chart/{symbol}   ← identical to Phoenix
Batch model: logical grouping only; each symbol = 1 HTTP call (not multi-symbol API)
Cache: DB-backed, hot=60s, warm=300s → cache-first before every call
Priority filter: DataRefreshPolicy
  - Active trades + market hours → 5 min refresh
  - Active trades + off-hours  → 60 min refresh
  - No active trades           → 60 min refresh (skipped if data fresh < 60 min)
429 handling: retry × 3 with backoff (5s, 10s, 20s) → fail → return None for THAT symbol only
Global cooldown: NONE — a symbol failing never freezes other symbols
Provider symbol mapping: DB table (TickerSymbolMappingService) → maps internal symbol → Yahoo symbol per-provider
```

**Why ANAU.MI worked in legacy:**
- ANAU.MI had no active trades → `DataRefreshPolicy.should_refresh_quote()` returned `False` if data was < 60 min old
- After the first fetch, ANAU.MI was CACHED for 60 minutes
- In subsequent cycles, ANAU.MI never reached the API at all — cache hit, zero HTTP calls
- When Yahoo did return 429 for ANAU.MI → retry → fail → `return None` for ANAU.MI only → other symbols continued unaffected

**Phoenix's failure mode:**
- No DB-backed cache (only in-memory single-flight per-process)
- No `DataRefreshPolicy` (EOD sync fetches ALL symbols every cycle unconditionally)
- ANAU.MI is called in every EOD cycle, triggering Yahoo's rate limiter
- When ANAU.MI gets 429 × 3 → SOP-015 fires → **global Yahoo cooldown** → ALL other symbols lose access

### §1.3 Corrected root cause statement

> **Root Cause A (Revised):** Phoenix lacks a per-symbol cache and priority-based refresh filter. As a result, ANAU.MI — which rarely changes and has no active trades — is fetched every EOD cycle, triggering Yahoo's per-symbol rate limit. The 429 is then incorrectly escalated to a **global provider freeze**, blocking all other symbols including US equities (AAPL, QQQ, SPY) that Yahoo would have served without issue.
>
> The fix is: (1) prevent per-symbol 429 from cascading to a global cooldown, and (2) implement cache/priority filter so ANAU.MI is not called unnecessarily. Provider routing is NOT required.

---

## §2 — Historical Data Optimization — Architectural Mandate

This section formalizes the data aggregation model required for the market data layer.

### §2.1 The Core Insight: Data Immutability by Type

Market data falls into two fundamentally different categories with different update semantics:

| Data type | Change frequency | Correct fetch strategy |
|---|---|---|
| **Today's price / intraday** | Changes every minute during market hours | Fetch every cycle (intraday) or at close (EOD) |
| **Historical OHLCV (past dates)** | **Never changes** once the trading day closes | **Fetch once, never re-fetch** — gap-fill only |
| **Market cap** | Changes daily (slowly) | Fetch at EOD if > 24h stale |
| **52-week high/low** | Changes daily | Fetch at EOD if > 24h stale |
| **Exchange rates (FX)** | Changes daily | Fetch at EOD once per day |

The user's observation is architecturally fundamental: **historical data is immutable**. March 10's closing price for AAPL will never change. Fetching it again is pure waste.

### §2.2 The Gap-Fill Model (Mandatory Target Architecture)

The correct EOD sync strategy for historical data is:

```
For each ticker:
  1. Query DB: what is the latest date we have in ticker_prices?
  2. Compute gap: which dates between latest_stored_date and today are missing?
  3. If gap exists: fetch only the missing dates from Yahoo v8/chart (range=gap)
  4. If no gap (today's close already stored): skip entirely
  5. Today's EOD: always fetch once after market close (the only "always fresh" data)
```

**API call reduction:**
- Current: 1 call per symbol per EOD cycle (every cycle, regardless of stored data)
- Target: 0 calls for symbols with up-to-date data; 1 call to fill gaps + today's close
- Net: After initial data load, the only daily API call per ticker is to confirm/update today's close

### §2.3 Accumulation Model vs. Overwrite Model

**Current Phoenix model (overwrite):** Each EOD sync fetches the latest price and upserts. Historical rows are not accumulated systematically.

**Target model (accumulation):** Each EOD sync:
1. Gap-fills any missing historical dates (one-time catch-up per date)
2. Appends today's close (new date = new row)
3. Once a date's row exists → never touched again

This model naturally reduces API calls over time. A ticker active for 200 trading days has 200 rows of historical data. After initial backfill, each EOD cycle = 1 API call per ticker (for today's close only).

### §2.4 Impact on CC-04 and Rate Limits

With the gap-fill model:
- New tickers: 1 initial backfill call (range=2y or range=1mo as needed)
- Established tickers: 1 call per day at EOD close
- ANAU.MI (no active trades): 1 call per day at EOD — manageable and well within Yahoo's rate limit
- The 429 problem becomes far less likely: calls are spaced and minimal

---

## §3 — Revised Technical Directives (CC-04 Immediate Unblock)

The following 3 fixes are **mandatory for the current WP003 package** to satisfy CC-04. They are minimal code changes — no gate cycle required.

### G7-FIX-1 (unchanged): Remove H3 cooldown-on-401

In `sync_ticker_prices_eod.py`: Batch 401 → warning log + fallthrough to per-ticker. **Do NOT set Yahoo cooldown.** Only HTTP 429 triggers SOP-015. (Iron Rule #8.)

### G7-FIX-2 (revised from v1.0.0): Prevent per-symbol 429 cascade — do NOT reroute ANAU.MI to Alpha

**v1.0.0 said:** Route ANAU.MI → Alpha Vantage primary. **This is revoked.**

**v1.1.0 mandate:** Keep ANAU.MI on Yahoo Finance as primary. Fix the FAILURE PROPAGATION:

When `_fetch_last_close_via_v8_chart_inner` exhausts retries for a single symbol (3× 429):
- **Current behavior:** Call `set_cooldown(YAHOO_FINANCE, 15)` → global freeze
- **Required behavior:** Log `📌 {symbol}: Yahoo rate-limited — using last-known price (per-symbol fail)` → return None for this symbol only → **do NOT call `set_cooldown()`** unless ≥ 3 distinct symbols fail in the same cycle

Implementation options (Team 20 selects):
- **Option A (simple, immediate):** In `_fetch_last_close_via_v8_chart_inner` — after exhausting retries, raise a NEW exception `YahooSymbolRateLimitedException` (distinct from `YahooRateLimitedException`). The caller in `sync_ticker_prices_eod.py` catches `YahooSymbolRateLimitedException` → logs per-symbol degradation → **no global cooldown**.
- **Option B (slightly more complex):** Add a `_symbol_fail_count` dict in the sync cycle. Increment per-symbol. Only call `set_cooldown()` when `_symbol_fail_count` total ≥ 3 distinct symbols.

Either option achieves the goal: ANAU.MI 429 → per-symbol degradation only, other symbols unaffected.

### G7-FIX-3 (unchanged): Fix evidence counting

In `run_g7_part_a_evidence.py`:
```python
# Replace:
count_429 = text.count("429")
# With:
count_cooldown = text.count("Yahoo 429 — cooldown")
```
And update print statements accordingly.

---

## §4 — Broader Architectural Gaps (Carry-Forward Assessment)

The legacy code review reveals **4 architectural gaps** between TikTrack1 and Phoenix's current market data layer. These are NOT blocking for GATE_7 but represent technical debt that will cause ongoing operational problems:

| Gap | Legacy had it | Phoenix has it | Risk if unaddressed |
|---|---|---|---|
| **G-01: Per-symbol DB cache** | ✅ DB-backed, hot=60s/warm=300s | ❌ In-memory single-flight only | Every cycle re-fetches all symbols → unnecessary API calls → 429 risk |
| **G-02: Priority-based refresh filter** | ✅ DataRefreshPolicy (active trades / market hours) | ❌ Not implemented for EOD | Stale tickers (no trades) fetched same frequency as active ones → waste |
| **G-03: Historical gap-fill model** | ✅ `should_refresh_historical` with record count check | ❌ Not implemented | Historical data re-fetched unnecessarily; no data accumulation |
| **G-04: Per-symbol failure isolation** | ✅ Symbol fails → return None → continue others | ❌ Symbol fails → global cooldown | One bad symbol freezes all others (ROOT CAUSE A) |

G-04 is partially addressed by G7-FIX-2 above (minimal fix). G-01, G-02, G-03 require a separate implementation package.

---

## §5 — Architectural Decision: Option A vs Option B

### §5.1 Option definitions

**Option A — Return package, implement all fixes and optimizations in WP003:**
Full implementation of G7-FIX-1/2/3 + G-01 (DB cache) + G-02 (priority filter) + G-03 (historical gap-fill) + G-04 (full per-symbol isolation) within the current work package before GATE_7 can close.

| Aspect | Assessment |
|---|---|
| Scope change | Significant — G-01/02/03 were NOT in the original WP003 spec |
| Delivery time | +4–8 weeks (full implementation + QA cycles) |
| Gate impact | Full GATE_3→4→5→6→7 cycle required for new scope |
| S003 activation | Delayed accordingly |
| Risk | Additional scope risks regression in already-QA'd FIX-1..4 / B1/B2/B4 |
| Benefit | Complete, clean implementation in one package |

**Option B — Approve current package as minimum baseline + create new WP for optimizations:**
Current WP003 closes with G7-FIX-1/2/3 (3 code changes, no gate cycle). Broader optimizations (G-01/02/03) go into a new work package with its own gate lifecycle.

| Aspect | Assessment |
|---|---|
| Scope integrity | WP003 delivered exactly what was promised (FIX-1..4 + B1/B2/B4) |
| Delivery time | CC-04 resolved in ~1–2 days; GATE_7 closes within 1 week |
| Gate impact | G7-FIX-1/2/3 are code-only; no new GATE_5/6 cycle needed |
| S003 activation | Proceeds on schedule |
| Risk | Technical debt formally acknowledged and tracked |
| Benefit | Momentum maintained; clear separation of concerns |

### §5.2 Chief Architect Decision: **OPTION B**

**Rationale:**

1. **Scope integrity.** WP003's GATE_2-approved scope was FIX-1 through FIX-4 (market data hardening). B1/B2/B4 were additions approved via GATE_6/7 review cycle. G-01 (DB cache), G-02 (priority filter), and G-03 (historical gap-fill) were NEVER in WP003 scope — they are new requirements surfaced by the operational evidence. It would be incorrect governance to retroactively expand a package that has already passed GATE_5 QA.

2. **Minimal-fix principle.** G7-FIX-1/2/3 are each < 10 lines of code. They require no schema migration, no new architecture, and no new gate cycle. They satisfy CC-04 within the current QA envelope. Returning the entire package for G-01/02/03 would impose weeks of delay for optimizations that were never part of the original contract.

3. **Operational risk.** G-01/02/03 implementation will require DB schema considerations (cache table), query changes (priority joins), and sync logic restructuring. This is non-trivial and warrants its own GATE_2 spec approval, independent implementation, QA, and validation. Bundling it with an already-validated package introduces regression risk.

4. **S003 dependency.** S003-P003 (D39/D40/D41) requires S002 GATE_8 to activate. Delaying S002 for G-01/02/03 would cascade to S003, P004, and beyond. This is disproportionate.

5. **Precedent.** The optimization directive (`ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0`) was always intended as a background architectural improvement, not a GATE_7 blocker. This decision reconfirms that intent.

### §5.3 Consequences of Option B Decision

**Within current WP003 (mandatory before GATE_7 closes):**
- G7-FIX-1: Batch 401 → no cooldown
- G7-FIX-2: Per-symbol 429 → per-symbol degradation only, no global cooldown
- G7-FIX-3: Evidence counting fix

**New Work Package: S002-P002-WP004 "Market Data Provider Optimization"** (to be created):
- Scope: G-01 (DB-backed cache), G-02 (DataRefreshPolicy implementation for EOD), G-03 (historical gap-fill model), G-04 (full per-symbol failure tracking)
- Gate lifecycle: GATE_2 (spec approval) → GATE_3-5-6-7 standard cycle
- Priority: P1 — does not block S003 activation; can proceed in parallel with S003-P003 early gates
- Note: WP004 is the proper implementation of `ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0` Layer 1 (priority filtering) and Layer 2 (optimized fetch strategy)
- The historical data gap-fill model (§2) is the canonical spec for WP004's implementation

---

## §6 — Updated Architectural Recommendations (revised from v1.0.0)

| REC | Description | Status | Target |
|---|---|---|---|
| REC-01 | Per-symbol failure isolation (global cooldown threshold ≥ 3 symbols) | **MANDATORY — WP003 minimal** (via G7-FIX-2) | GATE_7 |
| REC-02 | 401 ≠ 429: batch 401 → no cooldown | **MANDATORY — WP003 minimal** (via G7-FIX-1) | GATE_7 |
| REC-03 | ~~ANAU.MI → Alpha Vantage primary~~ **REVOKED** | Replaced by corrected G7-FIX-2 | — |
| REC-04 | Evidence counting fix | **MANDATORY — WP003 minimal** (via G7-FIX-3) | GATE_7 |
| REC-05 | Full per-symbol blacklist (complete isolation architecture) | WP004 | S002-P002-WP004 |
| REC-06 | Alpha rate-limit queue vs. 15-min cooldown separation | WP004 | S002-P002-WP004 |
| REC-07 | CC-04 criterion amendment | **ACTIVE** (per v1.0.0 §5, unchanged) | GATE_7 |
| REC-08 | EOD sync §4.3 Rule 6 (401 ≠ rate limit) | **MANDATORY** (via G7-FIX-1) | GATE_7 |
| **REC-09 (NEW)** | Historical gap-fill model (immutable past data = never re-fetch) | WP004 | S002-P002-WP004 |
| **REC-10 (NEW)** | DataRefreshPolicy for EOD sync (priority filter by trade status + market hours) | WP004 | S002-P002-WP004 |
| **REC-11 (NEW)** | DB-backed cache (hot=60s, warm=300s) — replicate legacy pattern | WP004 | S002-P002-WP004 |
| **REC-12 (NEW)** | Provider symbol mapping DB table (TickerSymbolMappingService pattern) — supports alternative Yahoo symbols for European tickers | WP004 | S002-P002-WP004 |

---

## §7 — Iron Rules Update

**Iron Rule #8 (added v1.0.0, unchanged):**
> HTTP 401 on Yahoo endpoints is NOT a rate-limit signal. 401 must NEVER trigger SOP-015 cooldown. Only HTTP 429 triggers SOP-015.

**Iron Rule #9 (NEW — from this decision):**
> Historical market data (past trading day OHLCV, once stored) is **immutable**. No sync job may re-fetch a date that already exists in `market_data.ticker_prices`. EOD sync implements gap-fill only: fetch only dates missing from DB + today's close. This is the canonical accumulation model.

**Iron Rule #10 (NEW — from this decision):**
> A per-symbol Yahoo 429 failure is a **symbol-level event**. It must NEVER cause a global provider cooldown unless ≥ 3 distinct symbols fail in the same cycle (indicating a systemic rate-limit event). Single-symbol failures result in per-symbol degradation (last-known price) and do NOT affect other symbols' provider access.

---

## §8 — Forward Plan

```
IMMEDIATE (WP003 GATE_7 unblock — ~1–2 days):
  Team 10 → Team 20: G7-FIX-1, G7-FIX-2, G7-FIX-3
  Team 50: re-run 4-cycle evidence → pass_04=True
  Team 90: CC-04 confirmed → CC-WP003-01, 02, 05 collection continues

GATE_7 PART B (parallel):
  CC-WP003-05: Nimrod UX browser walk-through of B1 UI items (D22 admin page)

AFTER GATE_7:
  GATE_8: S002-P002 lifecycle closure
  S003 activation

PARALLEL / POST-S003:
  Team 10 → Team 170: WP004 spec (LOD200 → GATE_2)
  WP004 implements: G-01 (cache) + G-02 (priority filter) + G-03 (gap-fill) + G-04 (full isolation)
```

---

**log_entry | TEAM_00 | ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.1.0 | APPROVED | SUPERSEDES_v1.0.0 | ANAU_MI_DIAGNOSIS_CORRECTED | REC03_REVOKED | OPTION_B_APPROVED | WP004_CREATED | IRON_RULES_9_AND_10_ADDED | HISTORICAL_GAP_FILL_MANDATE | 2026-03-12**
