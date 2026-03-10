---
project_domain: AGENTS_OS + TIKTRACK
id: ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0
from: Team 00 (Chief Architect)
to: Team 10 (Gateway Orchestration), Team 20 (Backend), Team 60 (CI/CD + Infrastructure)
cc: Team 90 (Validation), Team 100 (Development Architecture Authority)
date: 2026-03-10
status: APPROVED
gate_id: N/A (architectural directive — inter-program technical decision)
program_id: S002-P002
scope: MARKET_DATA_SYNC_OPTIMIZATION — BATCH_FETCH_ARCHITECTURE
authority: Team 00 (Chief Architect)
---

# ARCHITECT DIRECTIVE — MARKET DATA OPTIMIZATION
## Batch Fetch Architecture for Yahoo Finance Provider

---

## §1 DIRECTIVE SUMMARY

**This directive mandates replacement of the current per-symbol serial fetch loop in `sync_intraday.py` with a multi-symbol batch fetch implementation.**

This is classified as a **P1 architectural fix** and is included in the S002 closure package. It resolves the systematic rate-limit problem (`429 Too Many Requests`) that has been the primary operational blocker for market data continuity.

The fix is a **backend-only code change** with no schema migration, no frontend impact, and no gate lifecycle required beyond standard review by Team 10 and Team 20.

---

## §2 ARCHITECTURAL ANALYSIS — ROOT CAUSE REPORT

### §2.1 Problem Statement

Phoenix's intraday sync hits provider rate limits under normal load. The symptom is recurrent `429` responses from Yahoo Finance that trigger `set_cooldown()`, effectively suspending all price updates for `cooldown_min` minutes per provider.

**Nimrod's observation:** TikTrack1 (legacy) used Yahoo Finance as sole provider, with no fallback, and sustained continuous 15-minute price data for ALL active tickers across all exchanges and asset types without hitting rate limits.

### §2.2 Phoenix Architecture (Current — Deficient)

**File:** `api/background/jobs/sync_intraday.py` — `_fetch_prices_for_tickers()`

```python
for ticker_id, symbol, ticker_type, metadata in tickers:  # N iterations
    ...
    pr = await provider.get_ticker_price(use_sym)          # 1 HTTP request per ticker
    ...
    await asyncio.sleep(delay_sec)                         # artificial delay added
```

**File:** `api/integrations/market_data/providers/yahoo_provider.py`

The `get_ticker_price(symbol)` method calls `v8/finance/chart/{symbol}` — a **single-symbol endpoint**.

| Characteristic | Current Phoenix |
|---|---|
| API endpoint pattern | `v8/finance/chart/{symbol}` (1 call per symbol) |
| Loop structure | Serial `for` loop over all active tickers |
| HTTP requests per cycle | **N** (1 per ticker) |
| Delay pattern | `delay_between_symbols_seconds` between each ticker |
| Rate limit trigger | Any single 429 → cooldown for entire provider |
| Fallback on 429 | Alpha Vantage (also per-symbol, also rate-limited) |
| Total API calls (50 tickers) | **~100 calls** (50 Yahoo + 50 Alpha fallback chain) |

**The math is unambiguous:** With 50 active tickers and a 15-minute sync interval, Phoenix makes 50+ individual HTTP requests per cycle. With delays, the cycle may itself exceed the interval. Each 429 compounds the problem by triggering cooldowns.

### §2.3 Legacy Architecture (TikTrack1 — Working Correctly)

**Files:** `yahoo_finance_adapter.py`, `data_refresh_policy.py`

| Characteristic | Legacy TikTrack1 |
|---|---|
| API endpoint pattern | `v8/finance/chart/{symbol}` (also per-symbol internally) |
| Batch grouping | `preferred_batch_size=25`, `max_symbols_per_batch=50` |
| HTTP requests per 25 symbols | ~25 (same per-symbol API, batched as logical groups) |
| **Key differentiator #1** | **Tiered refresh by priority category** |
| **Key differentiator #2** | **In-memory cache (hot=60s, warm=300s) — skips API if fresh** |
| **Key differentiator #3** | **No refresh for tickers with no active trades (60-min interval)** |
| **Key differentiator #4** | **Off-hours interval = 60 min for ALL tickers** |

### §2.4 The Critical Insight — Why Legacy Didn't Hit Rate Limits

Legacy did NOT use a different API call structure. The key differences were:

**1. Differentiated refresh frequency by trade status:**
```
active_trades + in_hours:     5-minute refresh
active_trades + off_hours:   60-minute refresh
no_active_trades (always):   60-minute refresh
```

This means in a typical portfolio of 50 tickers, only **the subset with active open trades** get 5-minute refreshes. If 10 of 50 tickers have active trades, only 10 tickers are fetched every 5 minutes — not all 50.

**2. In-memory TTL cache:** Cache TTL hot=60s, warm=300s. If a ticker was recently fetched (e.g., from a user page load), the sync job skips the API call entirely for that ticker.

**3. Market hours awareness:** Off-hours (evenings/weekends) → ALL tickers drop to 60-minute interval regardless of trade status.

**Phoenix currently fetches ALL active tickers at the same interval, every cycle, unconditionally.**

### §2.5 Yahoo Finance Bulk API Capability (Not Yet Used by Either System)

Yahoo Finance provides a true multi-symbol endpoint that NEITHER system currently uses:

```
GET https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL,TSLA,NVDA,AMZN,...
```

This endpoint accepts up to 50 symbols comma-separated in a single HTTP request and returns full quote data for all symbols. This endpoint would reduce N individual requests to **ceil(N/50) requests** — a 50x reduction in API calls for a 50-ticker portfolio.

**Canonical Yahoo Finance multi-symbol response schema:**
```json
{
  "quoteResponse": {
    "result": [
      { "symbol": "AAPL", "regularMarketPrice": 175.42, "regularMarketChange": 1.23, ... },
      { "symbol": "TSLA", "regularMarketPrice": 250.10, "regularMarketChange": -3.45, ... }
    ],
    "error": null
  }
}
```

---

## §3 MANDATED SOLUTION — TWO-LAYER OPTIMIZATION

The solution is mandatory and must be implemented in two layers. Layer 1 alone is sufficient to resolve the immediate rate limit problem.

### §3.1 Layer 1 — Priority Filtering (Implement First)

**Change the sync loop to only fetch tickers that need refreshing**, using a priority filter:

| Ticker category | Condition | Refresh interval |
|---|---|---|
| PRIORITY_HIGH | Has open trades + market hours | Every sync cycle (e.g. 15 min) |
| PRIORITY_LOW | No open trades OR off-hours | Once per hour maximum |
| EXCLUDED | No open trades + has fresh price (age < 60 min) | SKIP (do not fetch) |

This change requires:
- Query to join `market_data.tickers` with `user_data.trades` (status='active') to determine which tickers have open positions
- Add `last_fetched_at` check: skip tickers with price data < 60 min old AND no open trades
- Market hours check (NYSE 09:30–16:00 ET on weekdays)

**Expected result:** With 50 tickers where 10 have active trades, API calls per cycle drop from 50 to **~10 during market hours**, **~5 during off-hours** (tickers needing hourly update). A 5–10x reduction without any API endpoint change.

### §3.2 Layer 2 — Multi-Symbol Batch Fetch (Implement After Layer 1)

**Replace the serial per-symbol loop with the Yahoo `v7/finance/quote` multi-symbol endpoint.**

New flow:
```
1. Group symbols needing refresh into batches of ≤50
2. Per batch: single HTTP GET to v7/finance/quote?symbols=SYM1,SYM2,...,SYM50
3. Parse quoteResponse.result[] — one dict per symbol
4. For symbols that return no data in batch → retry individually (fallback path)
```

Required changes:
- Add `_fetch_prices_batch(symbols: List[str]) -> Dict[str, PriceResult]` method to `YahooProvider`
- Add `v7/finance/quote` multi-symbol response parser
- Retain `v8/finance/chart/{symbol}` as per-symbol fallback for symbols that fail batch fetch
- Alpha Vantage fallback: apply only for symbols that failed Yahoo batch AND individual retry

**Expected result:** With 50 tickers (all high priority): 1 HTTP request (instead of 50). With 10 high-priority tickers: 1 HTTP request (instead of 10). Rate limit probability drops to near zero under normal operation.

---

## §4 IMPLEMENTATION SCOPE (MANDATORY)

### §4.1 Files to Modify

| File | Change |
|---|---|
| `api/background/jobs/sync_intraday.py` | Replace `_fetch_prices_for_tickers()`: add priority filter; call batch fetch; retain individual fallback |
| `api/integrations/market_data/providers/yahoo_provider.py` | Add `get_ticker_prices_batch(symbols: List[str])` method using v7/finance/quote |
| `api/integrations/market_data/market_data_settings.py` | Add settings: `batch_size` (default 50), `off_hours_refresh_interval_minutes` (default 60), `active_trades_only_high_priority` (default true) |

### §4.2 Files NOT to Modify

- Schema: no migration required — `ticker_prices_intraday` table structure unchanged
- `sync_eod.py` — separate job, not in scope
- `alpha_provider.py` — Alpha remains a per-symbol fallback; no batch API for Alpha Vantage
- Frontend: no changes
- WSM/SSM: no governance changes — this is a code fix within existing S002-P002 scope

### §4.3 Non-Negotiable Requirements

1. **Layer 1 must be implemented before Layer 2.** Do not attempt both simultaneously.
2. **DB-driven priority:** The open-trades check must query the database, not rely on metadata. Use: `SELECT DISTINCT ticker_id FROM user_data.trades WHERE status = 'active'`
3. **Graceful degradation:** If the Yahoo batch endpoint returns an error (429, 503), fall back to per-symbol individual fetch for the affected batch (same as current behavior). Do NOT fail the entire job.
4. **Preserve NUMERIC(20,8) precision:** `Decimal` rounding unchanged from current implementation.
5. **maskedLog compliance:** All log statements must use `maskedLog` (no raw symbols in production logs).
6. **No cooldown cascade on batch partial failure:** A 429 on a batch call puts Yahoo in cooldown for the batch only; tickers that got valid prices in the same batch are NOT re-fetched from Alpha.

---

## §5 SYMBOL ELIGIBILITY GATE (NEW — from Team 90 cleanup findings)

**Mandate:** No ticker may be set `is_active=true` without first confirming at least one provider returns a valid, non-zero price.

### §5.1 Background

Team 90's cleanup (2026-03-10) found that invalid/test symbols (`BATCH4PAR870000`, `INVALID999E2E`, `ככככ`) were present in the active universe. These symbols were fetched every sync cycle, contributing to unnecessary API calls and triggering fallback chains for unresolvable symbols.

### §5.2 Required Validation Gate

Before any code path sets `market_data.tickers.is_active = true`:
1. Attempt to fetch price from Yahoo Finance for the proposed symbol
2. If Yahoo returns valid non-zero price → admission allowed
3. If Yahoo fails → attempt Alpha Vantage (or other configured provider)
4. If ALL providers fail → REJECT activation; return error to caller; ticker remains `is_active=false`

### §5.3 Applies To

- Manual ticker activation via admin UI (D40 — System Management)
- Bulk ticker import/seeding scripts
- E2E test setup scripts (test symbols must use a dedicated `is_test=true` flag or a test schema — they must not enter the production active universe)

### §5.4 Files to Modify

| File | Change |
|---|---|
| `api/services/` ticker service (activation endpoint) | Add provider validation check before setting `is_active=true` |
| `scripts/` any seeding or import script | Add pre-activation validation call |

---

## §6 ALPHA VANTAGE QUOTA-AWARE COOLDOWN (NEW — from Team 90 findings)

**Mandate:** Alpha Vantage quota exhaustion must trigger a 24-hour cooldown, not the standard 15-minute cooldown.

### §6.1 Background

Alpha Vantage imposes a **daily request quota** (not just per-minute rate limiting). When the quota is exhausted, Alpha returns a success HTTP 200 with a body like:

```json
{"Information": "Thank you for using Alpha Vantage! Our standard API call frequency is 25 calls per day..."}
```

The current `_is_429()` helper in `sync_intraday.py` detects `"429"` or `"too many"` or `"rate limit"` in the exception string — it does NOT detect the Alpha quota-exhausted body pattern. This means after Alpha daily quota is spent:
- The system sets a 15-minute cooldown on Alpha
- After 15 minutes, retries Alpha → hits quota again → sets another 15-minute cooldown
- This cycle repeats 96 times per day, burning log capacity and API key health

### §6.2 Required Changes

**`alpha_provider.py`:**
- Parse Alpha Vantage response body after a successful HTTP 200
- If response contains `"Information"` key matching the quota-exhausted pattern → raise a detectable `AlphaQuotaExhaustedException` (or set a flag)
- Do NOT process this as a valid price response

**`provider_cooldown.py` or `sync_intraday.py`:**
- Add `set_long_cooldown(provider_name: str, until_midnight_utc: datetime)` or `set_cooldown_hours(provider_name: str, hours: int)`
- When `AlphaQuotaExhaustedException` is caught → call `set_cooldown_hours("ALPHA_VANTAGE", 24)` (or until next midnight UTC)
- Standard Yahoo 429 → existing `set_cooldown(name, cooldown_min)` unchanged

**`market_data_settings.py`:**
- Add `alpha_quota_cooldown_hours` setting (default 24, range 6–48)
- Expose via `market_data.system_settings` key for runtime override without code deploy

### §6.3 DB Persistence (Lightweight)

For Alpha quota exhaustion specifically (24-hour duration), persist the cooldown-until timestamp as a `market_data.system_settings` key (e.g., `alpha_cooldown_until: 2026-03-11T00:00:00Z`). This survives process restarts and ensures the quota-exhausted state is respected across server restarts, which are common during active development.

For Yahoo 429 short-duration cooldowns, in-memory state in `provider_cooldown.py` remains acceptable.

---

## §7 MARKET-CAP COMPLETION TRACKING

**Tracked operational item (non-blocking for S003 activation).**

After Team 90 cleanup, 3 active tickers have `market_cap IS NULL`:
- `ANAU.MI` (Italian exchange ETF)
- `BTC-USD` (crypto)
- `TEVA.TA` (Tel Aviv exchange)

**Acceptance KPI:** `market_cap IS NOT NULL` for all 3 symbols after 1 successful EOD sync cycle post Layer 1+2 implementation.

**Root cause to investigate (Team 20):** Whether `yahoo_provider.py`'s market_cap extraction handles non-US symbols and crypto correctly. Yahoo's `v7/finance/quote` response includes `marketCap` for most symbols; crypto may use `circulatingSupply × regularMarketPrice` instead.

---

## §8 VALIDATION REQUIREMENTS

After implementation, Team 20 must produce evidence for Team 90 (GATE_5 entry):

| Evidence | Requirement |
|---|---|
| API call count per sync cycle | Must be < 5 for portfolio with 10 high-priority + 40 low-priority tickers (test condition) |
| 429 absence | Zero 429 responses in a 1-hour test run under normal load |
| Data continuity | All active tickers have fresh price data (< 20 min age) after 3 consecutive sync cycles |
| Fallback path | Confirm per-symbol fallback works when batch returns partial data |
| NUMERIC precision | Prices preserved to 8 decimal places — no float rounding |

---

## §9 AUTHORITY AND TIMING

**This directive is APPROVED and effective immediately.**

**Timeline target:** Implementation in S002 scope — Team 10 routes to Team 20 with S002 closure package. No new gate lifecycle; Team 90 validates as part of S002-P002 GATE_8 documentation package.

**If this fix is not completed before S003 begins:** Price data reliability remains at risk and will block D33 (user_tickers live price column) from functioning correctly in production.

---

## §10 CARRY-OVER NOTE FOR S003

If S003 is activated before this fix is complete:

- S003-P004 (D33): Live price display depends on `ticker_prices_intraday` being populated reliably. The D33 page will show stale or missing prices until this fix is in place.
- Team 10 must track this fix as **S002-P002 carry-over → S003 prerequisite gate item**.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0 | APPROVED | BATCH_FETCH_PRIORITY_FILTER_MANDATE | 2026-03-10**
**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0 | UPDATED | §5_ELIGIBILITY_GATE + §6_ALPHA_QUOTA_COOLDOWN + §7_MARKET_CAP_TRACKING ADDED | IN_RESPONSE_TO_TEAM_90_CLEANUP_REPORT | 2026-03-10**
