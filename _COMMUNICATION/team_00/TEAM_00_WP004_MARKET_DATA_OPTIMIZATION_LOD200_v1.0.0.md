---
project_domain: TIKTRACK
id: TEAM_00_WP004_MARKET_DATA_OPTIMIZATION_LOD200_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 190 (Constitutional Architectural Validator), Team 100 (GATE_2 Authority)
cc: Team 10 (intake orchestration), Team 20 (backend), Team 50 (QA), Team 170 (registry)
date: 2026-03-12
status: LOD200 DRAFT — submitted for Team 190 constitutional validation + GATE_2 approval
authority: ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.1.0
supersedes: N/A (new work package)
---

# Team 00 — S002-P002-WP004 Market Data Provider Optimization | LOD200 Specification

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP004 |
| gate_id | N/A (pre-GATE_0, pending GATE_2 approval) |
| architectural_approval_type | SPEC (LOD200) |
| phase_owner | Team 100 (GATE_2 authority) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |
| priority | P1 — does not block S003 |
| predecessor | S002-P002-WP003 (GATE_8 PASS activates WP004 execution priority) |

---

## §1 — Overview and Rationale

### 1.1 Work Package Identity

**WP004** = S002-P002-WP004 — Market Data Provider Optimization

**Program:** S002-P002 — Market Data Provider Hardening (fourth and final work package in this program)

### 1.2 Architectural Basis

The Chief Architect's decision `ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.1.0` identified two classes of market data provider issues in Phoenix:

**Class A — Structural defects (WP003 scope — fixed or in-flight):**
- HTTP 401 incorrectly triggering global Yahoo cooldown (H3 fix error — G7-FIX-1 fix)
- Per-symbol 429 cascading to global provider freeze (G7-FIX-2 fix)
- Evidence counting methodology error (G7-FIX-3 fix)

**Class B — Architectural gaps (WP004 scope — this document):**
- No DB-backed price cache → redundant API calls every cycle, every symbol
- No data refresh policy → historical immutable data re-fetched repeatedly
- No per-symbol failure isolation system (WP003 adds targeted fix only; WP004 completes the architecture)
- Alpha rate-limit and quota exhaustion conflated in the same 15-min cooldown mechanism
- No provider symbol mapping DB service → symbol format differences untracked across providers

### 1.3 Architectural Decision — Option B Approved

The Chief Architect approved **Option B** (2026-03-11): WP003 is approved as the minimum baseline; WP004 is created for all remaining optimizations and architectural completeness. **WP004 does NOT block S003** (P1 priority). WP004 may run in parallel with early S003 gate phases.

### 1.4 Legacy Pattern Reference

The legacy TikTrack1 solved these Class B problems correctly. WP004 restores and adapts these patterns:

| Pattern | Legacy (TikTrackV1) | Phoenix WP004 Target |
|---|---|---|
| Price cache | DB-backed, hot=60s / warm=300s (`yahoo_finance_adapter.py` lines 557–565) | Same pattern, adapted for EOD sync context |
| Refresh policy | `DataRefreshPolicy`: active-trades × market-hours decision | `DataRefreshPolicy` for EOD sync priority ordering |
| Historical data | Gap-fill: only fetch dates missing from DB (if < 120 records or > 24h) | Iron Rule #9 — full gap-fill model |
| Per-symbol failure | Return `None` for symbol, continue all others — no global cooldown | Full `PerSymbolFailureTracker` (cross-cycle, DB-backed) |
| Symbol mapping | `TickerSymbolMappingService` DB-backed | `SymbolMappingService` + `market_data.provider_symbol_mappings` table |
| Alpha rate limit | `RateLimitQueue` (12.5s gap enforcement) | Same pattern — separated from quota exhaustion |

Reference files in repository:
- `archive/TikTrackV1-code&docs/TikTrackApp/Backend/services/external_data/yahoo_finance_adapter.py`
- `archive/TikTrackV1-code&docs/TikTrackApp/Backend/services/external_data/data_refresh_policy.py`

---

## §2 — Deliverables Summary

Six deliverables. Single work package. May be split into sub-work-packages at LOD400 authoring time (Team 10 decision).

| ID | Name | Primary file(s) | Key Iron Rule |
|---|---|---|---|
| D01 | DB-Backed Price Cache | `api/integrations/market_data/price_cache.py` (new) | — |
| D02 | DataRefreshPolicy for EOD Sync | `api/integrations/market_data/data_refresh_policy.py` (new) | — |
| D03 | Historical Data Gap-Fill Model | `scripts/sync_ticker_prices_eod.py` (modified) | Iron Rule #9 |
| D04 | Full Per-Symbol Failure Isolation | `api/integrations/market_data/symbol_failure_tracker.py` (new) | Iron Rule #10 |
| D05 | Alpha Vantage Rate-Limit Queue Separation | `api/integrations/market_data/providers/alpha_provider.py` (modified) | — |
| D06 | Provider Symbol Mapping DB Service | `api/integrations/market_data/symbol_mapping_service.py` (new) + DB migration | — |

**Recommended execution order:** D06 → D01 → D03 → D02 → D04 → D05

D06 is foundational (other deliverables reference the symbol mapping). D03 builds on D01 (cache check is the first step in gap-fill). D02 builds on D01/D03 (policy governs which symbols reach the fetch path). D05 is independent of D01–D04.

---

## §3 — Deliverable Specifications (LOD200)

### §3.1 — D01: DB-Backed Price Cache

**Problem:** Phoenix calls the provider API every sync cycle for every symbol, even when fresh data exists in the DB from the same or a recent cycle. This wastes API quota (Yahoo v8/chart, Alpha 25/day) and artificially inflates rate-limit exposure.

**Solution:** Before every provider API call, check the DB for existing fresh data. Only call the provider if data is absent or stale.

**Cache policy:**

| Context | Freshness condition | Action |
|---|---|---|
| EOD sync — after market close | Today's `price_date` exists in `market_data.ticker_prices` | **SKIP** provider call — today's close is final and immutable |
| EOD sync — before market close | Today's `price_date` exists AND `fetched_at` < 5 min ago | **SKIP** for non-priority symbols (see D02) |
| Standard cache miss | No row for today in `ticker_prices` | **FETCH** from provider normally |

**Implementation approach:**
- New module: `api/integrations/market_data/price_cache.py`
- Function: `get_cached_price(ticker_id, context: str) → PriceResult | None`
- Function: `is_price_fresh(ticker_id, context: str) → bool`
- Context values: `"EOD"` | `"INTRADAY"` (WP004 implements EOD only; INTRADAY prepared for future use)
- Integration point: `sync_ticker_prices_eod.py` — cache check occurs BEFORE each ticker's provider calls, AFTER DataRefreshPolicy tier assignment (D02)
- Cache check = single indexed query on `(ticker_id, price_date)` — no new cache table needed for D01 baseline; uses existing `ticker_prices`

**What must NOT change:**
- `market_data.ticker_prices` schema — no structural change for D01
- Upsert behavior on actual fetch — unchanged
- NUMERIC(20,8) precision on all price fields — Iron Rule, no change

**Acceptance criteria:**
- Symbol with today's `price_date` in DB: zero provider API calls for that symbol; log shows `[CACHE HIT] {symbol}: today's price cached — skipping provider`
- Symbol without today's price: provider called normally
- Cache check latency: < 5ms per symbol (single indexed query)
- No price data modified by cache logic — cache is read-only decision layer

---

### §3.2 — D02: DataRefreshPolicy for EOD Sync

**Problem:** All symbols treated equally in the per-ticker loop. Active-trade symbols — which require the most current pricing for P&L accuracy — receive no fetch priority. No policy governs which symbols must be refreshed vs. which can use cached data.

**Solution:** Priority-based refresh policy applied before the per-ticker loop in `sync_ticker_prices_eod.py`. The policy classifies each symbol into a refresh tier and determines whether it bypasses the D01 cache check.

**Refresh tiers:**

| Tier | Condition | Refresh behavior |
|---|---|---|
| P0 — Active trades | Symbol has an open/pending trade in `user_data.trades` for any user | Always attempt fresh provider fetch; bypass D01 cache (most critical) |
| P1 — Recently added | Symbol added to `market_data.tickers` within last 7 days | Attempt fresh fetch; historical data may be sparse |
| P2 — Standard | All other active symbols | Respect D01 cache: if today's price in DB → skip provider; otherwise fetch |
| SKIP | Symbol in per-symbol temporary skip list (D04) | No provider call; use last-known price; log skip reason |

**Implementation approach:**
- New module: `api/integrations/market_data/data_refresh_policy.py`
- Class: `DataRefreshPolicy`
- Method: `classify_symbols(symbol_list: List[str]) → Dict[str, RefreshTier]`
- Method: `get_priority_ordered_symbols(symbol_list) → List[Tuple[str, RefreshTier]]` — returns P0 symbols first
- Queries `user_data.trades` for active symbols **once per sync cycle** (not per symbol) — cached result used throughout loop
- Integration: `sync_ticker_prices_eod.py` applies policy at start of per-ticker loop, before provider calls

**What must NOT change:**
- Alpha FX reserve policy — unchanged (D05 governs Alpha; D02 governs symbol ordering only)
- Last-known price fallback path — unchanged (SKIP tier uses same last-known path as existing graceful degradation)
- Per-ticker loop structure — D02 adds a pre-loop classification step; the loop itself is not restructured

**Acceptance criteria:**
- Active-trade symbols always attempt fresh provider fetch even when D01 cache reports fresh data
- P2 symbols with today's price in DB: no provider call; confirmed by log silence for those symbols
- Policy classification: one DB query per cycle (not N queries for N symbols)
- Policy result logged per cycle: `[POLICY] {N} P0 symbols, {M} P2 symbols, {K} SKIP symbols`

---

### §3.3 — D03: Historical Data Gap-Fill Model

**Problem:** The EOD sync script re-fetches all recent price data every run, including dates already persisted in `market_data.ticker_prices`. Historical OHLCV data (past trading day closes) never changes after the trading day ends. Re-fetching wastes API quota and causes unnecessary rate-limit pressure.

**Iron Rule #9:** Historical market data (past trading day OHLCV) is immutable once stored. No sync job may re-fetch a date already present in `market_data.ticker_prices`.

**Solution:** Gap-fill model. Before each provider call, query the DB for the most recent stored date for this symbol. Only request data for dates that are missing.

**Gap-fill algorithm:**

```
1. Query: SELECT MAX(price_date) FROM market_data.ticker_prices WHERE ticker_id = {id}
2. If MAX(price_date) = today (and market is closed): SKIP entirely (D01 cache already handles this)
3. If MAX(price_date) = yesterday: fetch today's close only (single data point)
4. If MAX(price_date) = N days ago: fetch date range from (MAX+1) to today → fill gap
5. If no rows exist (new symbol): fetch full history (default: 120 trading days)
```

**Provider call adaptation:**
- Yahoo v8/chart supports date-range via `period1` (epoch) / `period2` (epoch) parameters — use these for targeted historical fetches
- Gap results stored as individual rows in `ticker_prices` — one row per trading day per symbol

**Trading calendar approximation (WP004 scope):**
- WP004 uses Mon–Fri non-weekend heuristic for gap detection
- Exact trading calendar (market holidays) deferred to WP005 or S003 if required
- Missing weekends not flagged as gaps

**What must NOT change:**
- `market_data.ticker_prices` schema — no change
- Upsert on conflict behavior — preserved (idempotent insert)
- Last-known price fallback — D03 only affects the fetch decision, not the fallback path

**Acceptance criteria:**
- Symbol with today's `price_date` in DB: D03 triggers no gap-fill fetch (D01 already cached)
- Symbol with yesterday's price: exactly one API call returning today's data; no prior-date re-fetch
- Symbol with 5-day gap: one API call with date range covering exactly those 5 days
- No `ticker_prices` row overwritten for past dates (DB constraint or explicit guard)
- Log output: `[GAP-FILL] {symbol}: fetching {N} missing days ({from_date}..{to_date})`

---

### §3.4 — D04: Full Per-Symbol Failure Isolation

**Context:** WP003 G7-FIX-2 introduced `YahooSymbolRateLimitedException` and a `yahoo_symbol_fail_count` counter as a targeted, within-cycle fix. This covers single-cycle systemic detection. WP004 completes the full architecture: cross-cycle failure memory, temporary skip list, and provider-agnostic tracking.

**Problem:** A symbol that fails every cycle (due to persistent rate-limiting, provider rejection, or invalid symbol format) is retried every cycle with no memory of prior failures. No metrics on failure patterns. `yahoo_symbol_fail_count` resets to zero each cycle.

**Iron Rule #10:** A per-symbol Yahoo 429 is a symbol-level event. It must NOT cause a global provider cooldown unless ≥ 3 distinct symbols fail in the same cycle.

**Solution:** `PerSymbolFailureTracker` — tracks per-symbol failure history across cycles, with DB-backed persistence.

**Failure policy:**

| Consecutive failure count | Action |
|---|---|
| 1st failure | Log warning; retry next cycle normally |
| 2nd consecutive failure | Log elevated warning; still attempt next cycle |
| 3rd consecutive failure | Add to temporary skip list (1-hour TTL); use last-known price during skip period |
| Success (any point) | Reset consecutive failure counter for this symbol |
| ≥ 3 distinct symbols fail with Yahoo 429 in same cycle | Systemic threshold → set global Yahoo cooldown (Iron Rule #10 threshold) |

**Implementation approach:**
- New class: `PerSymbolFailureTracker` in `api/integrations/market_data/symbol_failure_tracker.py`
- Methods: `record_failure(symbol, provider, failure_type)`, `record_success(symbol, provider)`, `should_skip(symbol, provider) → bool`, `get_consecutive_failures(symbol, provider) → int`, `is_systemic_threshold_reached(provider) → bool`
- **Persistence:** DB-backed — uses `market_data.system_settings` JSONB field OR new `market_data.symbol_failure_log` table (Team 20 decides at LOD400; must survive process restart)
- **In-cycle state:** `is_systemic_threshold_reached()` counts distinct-symbol failures within current cycle window (same logic as WP003 `yahoo_symbol_fail_count >= 3` but abstracted)

**Integration with WP003 G7-FIX-2:**
- `YahooSymbolRateLimitedException` catch block in `sync_ticker_prices_eod.py` → calls `tracker.record_failure(symbol, "YAHOO_FINANCE", "per_symbol_429")`
- Systemic threshold check: `tracker.is_systemic_threshold_reached("YAHOO_FINANCE")` replaces inline `yahoo_symbol_fail_count >= 3` check
- External behavior is identical; internal logic is abstracted and persistent

**What must NOT change:**
- WP003 G7-FIX-2 behavioral contracts — D04 replaces inline counter with tracker, not the behavioral logic
- `YahooSymbolRateLimitedException` class — kept; D04 uses it as input to `record_failure()`
- Global cooldown trigger at ≥ 3 distinct symbols — unchanged threshold

**Acceptance criteria:**
- Symbol with 3 consecutive failures across cycles: skip list entry created; no provider call next cycle; `[SKIP] {symbol}: {provider} — consecutive failure limit reached (3/3)`
- Skip list TTL: symbol retried after 1-hour TTL expiry
- Systemic detection: ≥ 3 distinct Yahoo 429 exhaustions in same cycle → `set_cooldown("YAHOO_FINANCE", cooldown_min)` — identical to WP003 behavior
- Failure state persists across process restart (DB-backed)
- Success resets failure counter: symbol removed from skip list immediately on success

---

### §3.5 — D05: Alpha Vantage Rate-Limit Queue Separation

**Problem:** Alpha Vantage has two distinct constraint types that require fundamentally different responses, currently conflated in a single `set_cooldown("ALPHA_VANTAGE", 15)` call:

| Constraint | API signal | Correct response | Current (wrong) response |
|---|---|---|---|
| Rate limit (5 calls/min) | HTTP 429 or "5 calls per minute" in body | 12.5s enforced delay; continue calling | 15-min cooldown → blocks all Alpha calls for 15 min |
| Daily quota (25 calls/day) | "25 calls per day" in body (or API key message) | 24h cooldown (until API key resets) | 15-min cooldown → too short; quota resets at midnight |

**Solution:** Separate handling via two distinct mechanisms.

**Rate limit (5 calls/minute) — RateLimitQueue:**
- Enforce 12.5s gap between Alpha API calls using a queue-based throttle
- No `set_cooldown()` for rate-limiting
- Implementation: `AlphaRateLimitQueue` inner class (or module-level) in `alpha_provider.py`
- Tracks `_last_call_time`; before each call, sleeps `max(0, 12.5 - elapsed_since_last_call)`
- All Alpha calls (equity, ETF, crypto, FX) go through this queue

**Quota exhaustion (25/day) — Long cooldown:**
- Parse API response body to detect quota exhaustion message
- When detected: raise `AlphaQuotaExhaustedException` (new exception class)
- Caller in `sync_ticker_prices_eod.py`: catch → `set_cooldown("ALPHA_VANTAGE", 1440)` (24h)
- Message detection: body contains `"25 calls per day"` or `"standard API call limit"` → quota exhausted
- Message detection: body contains `"5 calls per minute"` or HTTP 429 → rate limit only (no long cooldown)

**ALPHA_FX_RESERVE policy:** Unchanged. The FX reserve (8 calls held back) operates independently of D05's rate/quota separation.

**What must NOT change:**
- `ALPHA_FX_RESERVE` reserve size and policy — unchanged
- Alpha fallback logic in `sync_ticker_prices_eod.py` — unchanged
- `AlphaQuotaExhaustedException` interaction with last-known price path — same as current quota exhaustion behavior

**Acceptance criteria:**
- Rate-limit event (5/min exceeded): 12.5s delay inserted; no cooldown set; `ALPHA_VANTAGE` remains available; next call proceeds after delay
- Quota exhaustion event (25/day): `set_cooldown("ALPHA_VANTAGE", 1440)` set; log `⚠️ Alpha Vantage daily quota exhausted — 24h cooldown`; no further Alpha calls that day
- `ALPHA_FX_RESERVE` quota holding: unchanged
- Zero regression on existing Alpha fallback behavior (BTC-USD, FX rates, equity fallback)

---

### §3.6 — D06: Provider Symbol Mapping DB Service

**Problem:** Provider-specific symbol identifiers are not tracked. If TEVA.TA is the Yahoo symbol but Alpha Vantage uses a different format, there is no place to record this. When a symbol fails on one provider, no alternative format is available. The legacy `TickerSymbolMappingService` solved this.

**Solution:** New `SymbolMappingService` backed by a new DB table `market_data.provider_symbol_mappings`.

**DB migration — new table:**
```sql
CREATE TABLE IF NOT EXISTS market_data.provider_symbol_mappings (
    ticker_id       UUID         NOT NULL REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    provider        VARCHAR(50)  NOT NULL,  -- 'YAHOO_FINANCE' | 'ALPHA_VANTAGE'
    provider_symbol VARCHAR(32)  NOT NULL,  -- e.g. 'TEVA.TA', 'BTC-USD'
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ticker_id, provider)
);
```

**Service behavior:**
- New class: `SymbolMappingService` in `api/integrations/market_data/symbol_mapping_service.py`
- Method: `get_provider_symbol(ticker_id, provider) → str | None` — returns provider-specific symbol if mapping exists; returns `None` if not mapped (caller uses raw symbol)
- Method: `mark_verified(ticker_id, provider)` — called on successful fetch
- Method: `get_all_mappings() → List[ProviderSymbolMapping]` — for admin view
- **Cached on app init** (Iron Rule: no per-ticker round-trips at sync time)
- Cache refreshed: on app restart or via admin action (D40 trigger — deferred to S003-P003 if applicable)

**No-mapping fallback (zero regression):**
- If no mapping exists for a ticker × provider: `get_provider_symbol()` returns `None`
- Caller uses raw `market_data.tickers.symbol` value — identical to current behavior
- D06 adds mapping ON TOP of existing symbol resolution; it never removes a fetch path

**Admin UI scope:**
- D06 provides the service and DB layer
- Read-only view of `provider_symbol_mappings` may be added to D40 Section 6 (System Management) — subject to S003-P003 LOD400 decision; not a WP004 hard requirement

**What must NOT change:**
- `market_data.tickers.symbol` — remains the canonical internal symbol; D06 adds an alias layer
- Any existing fetch path — D06 is additive only

**Acceptance criteria:**
- Symbol with verified mapping: provider-specific symbol used in API call URL; log `[MAPPING] {symbol} → {provider_symbol} ({provider})`
- Symbol without mapping: raw symbol used; identical behavior to current
- Migration runs cleanly; `provider_symbol_mappings` table exists with correct schema
- `is_verified` updated on successful fetch; not updated on failure
- `SymbolMappingService` loads cache on app init; no DB queries during sync loop (beyond cache refresh)

---

## §4 — Iron Rules Compliance

| Iron Rule | Statement | WP004 Impact |
|---|---|---|
| **#8** | HTTP 401 on Yahoo → NEVER triggers SOP-015 cooldown | Not affected — WP003 G7-FIX-1 maintains this; WP004 does not touch batch exception handling |
| **#9** | Historical OHLCV data is immutable — no re-fetch of stored dates | **D03 directly implements this rule** — gap-fill model enforces immutability |
| **#10** | Per-symbol Yahoo 429 → NO global cooldown unless ≥ 3 distinct symbols fail in same cycle | **D04 completes this rule** — `PerSymbolFailureTracker` is the canonical implementation |
| NUMERIC(20,8) | All financial values stored at 20,8 precision | D01/D03: no price precision change; all upserts use existing precision columns |
| maskedLog | All log output uses maskedLog or print; no raw API keys or prices logged | All new log statements in D01–D06 use `print()` or `logger.*`; no sensitive data |
| APScheduler/scheduler_registry | Background tasks use canonical scheduler | `sync_ticker_prices_eod.py` remains scheduler-triggered; no scheduler changes in WP004 |
| Page template | All UI pages use collapsible-container | WP004 is backend only; no new pages (D06 admin view is a D40 addition, not a new page) |

---

## §5 — Technical Dependencies

| Dependency | Type | Required for |
|---|---|---|
| `market_data.ticker_prices` table | Existing DB | D01 (cache freshness check), D03 (gap-fill date query) |
| `user_data.trades` table | Existing DB | D02 (active-trade symbol detection) |
| `market_data.tickers` table | Existing DB | D06 (FK for provider_symbol_mappings) |
| WP003 `YahooSymbolRateLimitedException` | Existing code (post G7-FIX-2) | D04 (tracker wraps this exception) |
| New DB migration | New | D06 (`provider_symbol_mappings` table creation) |
| `api/integrations/market_data/providers/alpha_provider.py` | Existing code | D05 (modification) |
| `scripts/sync_ticker_prices_eod.py` | Existing code | D01 (integration), D02 (integration), D03 (modification), D04 (integration) |

**No S003 dependency.** WP004 is entirely within S002 scope and existing DB schema (plus one new table via migration).

---

## §6 — Execution Sequence (within WP004)

```
Phase 1: D06 — Provider Symbol Mapping DB Service
           ↓ (migration + SymbolMappingService; foundational for all fetch paths)
Phase 2a: D01 — DB-Backed Price Cache
           ↓ (cache check module; next layer built on top of D06)
Phase 2b: D05 — Alpha Rate-Limit Queue Separation (PARALLEL with Phase 2a)
           ↓ (independent; can be delivered simultaneously with D01)
Phase 3: D03 — Historical Data Gap-Fill Model
           ↓ (uses D01 cache as first step; D06 for symbol lookup)
Phase 4: D02 — DataRefreshPolicy for EOD Sync
           ↓ (policy layer over D01/D03; requires both to be functional)
Phase 5: D04 — Full Per-Symbol Failure Isolation
           (wraps WP003 exception; integrates after core fetch logic confirmed working)
```

Team 10 determines at LOD400 authoring time whether to split into sub-work-packages or deliver as single package with multiple PRs.

---

## §7 — Success Criteria

### Per-Deliverable

| SC | Deliverable | Criterion | Pass condition |
|---|---|---|---|
| SC-WP004-01 | D01 | No redundant provider calls for today's cached data | Symbol with today's `price_date` in DB → zero provider API calls; confirmed by log |
| SC-WP004-02 | D01 | Cache check overhead | < 5ms per symbol; sync cycle total time does not increase by more than 5% |
| SC-WP004-03 | D02 | Active-trade symbols prioritized | P0 symbols always attempt fresh fetch; policy classification logged per cycle |
| SC-WP004-04 | D02 | P2 symbols skip provider when cached | P2 symbols with today's date in DB → no API call |
| SC-WP004-05 | D03 | Historical data not re-fetched | No `ticker_prices` row for past date overwritten; confirmed by row count stability |
| SC-WP004-06 | D03 | Gap-fill fetches exactly missing dates | Date range in API call matches exact missing days; no over-fetch |
| SC-WP004-07 | D04 | Per-symbol failures don't block others | One symbol in skip list → all other symbols fetched normally; confirmed by log |
| SC-WP004-08 | D04 | Skip list persists across restart | Symbol in skip list before restart → still in skip list after restart (DB-backed) |
| SC-WP004-09 | D05 | Alpha rate-limit → delay only | Rate-limit event → 12.5s delay; no cooldown; next call proceeds |
| SC-WP004-10 | D05 | Alpha quota exhaustion → 24h cooldown | Quota event → `set_cooldown("ALPHA_VANTAGE", 1440)` |
| SC-WP004-11 | D06 | Verified mapping used | Ticker with verified mapping → provider symbol in API URL |
| SC-WP004-12 | D06 | No-mapping fallback | Ticker without mapping → raw symbol used; identical behavior to pre-WP004 |

### Overall WP004

| SC | Criterion | Pass condition |
|---|---|---|
| SC-WP004-13 | WP003 non-regression | All WP003 CC criteria (CC-01, 02, 03, 04) remain PASS after WP004 implementation |
| SC-WP004-14 | No new global cooldown activations | 4-cycle evidence run: `pass_04=True` after WP004 implementation |
| SC-WP004-15 | Sync cycle performance | EOD sync completes in ≤ previous baseline time (optimization must not slow down) |

---

## §8 — Gate Lifecycle

| Gate | Action | Authority |
|---|---|---|
| **GATE_2** | Approve LOD200 spec — "האם אנחנו מאשרים לבנות את זה?" | Team 100 |
| GATE_3 | LOD400 (LLD400) delivery by Team 10 → Team 190 validation | Team 190 → Team 100 |
| GATE_4 | Implementation by Team 20 + Team 50 QA | Team 50 |
| GATE_5 | Team 90 validation of CC criteria + non-regression | Team 90 |
| GATE_6 | Architectural review — "האם מה שנבנה הוא מה שאישרנו?" | Team 100 (delegated from Team 00) |
| GATE_7 | UX sign-off if any UI changes introduced (D06 admin view) | Nimrod |
| GATE_8 | Lifecycle close; WP004 status → CLOSED | Team 90 |

**LOD400 authoring (post-GATE_2):** Team 10 writes the LOD400 specification, following the established spec format (see `_COMMUNICATION/team_170/` for existing LOD400 examples). Team 190 validates LOD400 before GATE_3 approval.

**Timeline:**
- GATE_2 target: Approved before S003-P003 reaches GATE_3 (parallel track possible)
- Full execution (GATE_8): Before S003 enters final gate phases
- Priority: P1 — does NOT block S003 activation or S003-P003/P004/P005 execution

---

## §9 — What WP004 Does NOT Include

| Excluded item | Rationale |
|---|---|
| Real-time or intraday data feed | Out of S002 scope; intraday is deferred to S004+ |
| New provider integrations (Polygon.io, Refinitiv, etc.) | Out of scope; Yahoo + Alpha Vantage only |
| Changes to ALPHA_FX_RESERVE policy | Confirmed in WP003; WP004 preserves exactly |
| D40 symbol mapping admin UI (edit) | D40 is S003-P003 scope; WP004 may add a read-only view only if D40/Section 6 has space |
| Changes to `ticker_prices` schema | Schema changes require separate migration mandate; D06 adds a new table only |
| ANAU.MI special routing | ANAU.MI stays on Yahoo Finance as primary (Iron Rule); WP004 optimizes all symbols equally |
| Trading calendar (market holidays) | Exact holiday list deferred; WP004 uses Mon–Fri heuristic only |
| Historical backfill beyond 120 days | Default backfill = 120 trading days; extended history is a separate product requirement |

---

**log_entry | TEAM_00 | TEAM_00_WP004_MARKET_DATA_OPTIMIZATION_LOD200_v1.0.0 | LOD200_DRAFT | SUBMITTED_TO_TEAM_190_FOR_GATE_2 | 2026-03-12**
