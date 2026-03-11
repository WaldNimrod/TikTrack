---
project_domain: TIKTRACK
id: TEAM_00_TO_TEAM_10_MARKET_DATA_PROVIDER_DIRECTIVE_v1.1.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 10 (Gateway Orchestration)
cc: Team 20 (Backend), Team 50 (QA), Team 90 (Validation)
date: 2026-03-11
status: ISSUED — ACTION REQUIRED
gate_id: GATE_7 (S002-P002-WP003)
work_package_id: S002-P002-WP003
supersedes: TEAM_00_TO_TEAM_10_MARKET_DATA_PROVIDER_DIRECTIVE_v1.0.0
references: ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.1.0
---

# TEAM 00 → TEAM 10 — Market Data Provider Directive v1.1.0
## Corrected Directive + Option B Decision + WP004 Creation Notice

---

## 1. Critical Correction to v1.0.0

**v1.0.0 of this directive (issued 2026-03-11) contained an error in G7-FIX-2:**

> ~~"Add ANAU.MI to SYMBOL_PROVIDER_OVERRIDES mapping — Alpha Vantage primary, no Yahoo attempt"~~

**This instruction is REVOKED.**

Yahoo Finance DOES support ANAU.MI. The website `https://finance.yahoo.com/quote/ANAU.MI/` shows live data. The legacy TikTrack system (TikTrack1) received European ticker data from Yahoo via the same v8/chart endpoint. The problem was never "Yahoo doesn't support .MI exchange" — it was Phoenix's **failure cascade architecture**: a single symbol's rate limit triggers a global provider freeze.

Legacy code review (`archive/TikTrackV1.../yahoo_finance_adapter.py`) confirmed: the legacy never hit 429 for ANAU.MI because it used a cache (hot=60s, warm=300s). After first fetch, ANAU.MI was cached and not re-called for 60 minutes. When it did get 429, it returned `None` for that symbol only — no global cooldown.

**G7-FIX-2 is REPLACED** — see §3 below.

---

## 2. Architectural Decision: Option B Approved

**Chief Architect decision (2026-03-11): Option B — approve current package as minimum baseline.**

- Current WP003 scope (FIX-1..4 + B1/B2/B4) is confirmed delivered and QA-passed
- CC-04 requires only 3 minimal code fixes (G7-FIX-1, revised FIX-2, FIX-3)
- Broader optimizations (DB cache, priority filter, historical gap-fill) go into new **WP004**
- S003 activation proceeds on schedule after WP003 GATE_8

---

## 3. Binding Actions — Updated

### For Team 20 (Backend) — P0 — 3 code fixes (revised)

---

**G7-FIX-1 (unchanged): Remove H3 cooldown-on-401**

In `sync_ticker_prices_eod.py`: When Yahoo v7/quote batch returns 401:
- Log: `⚠️ Yahoo batch 401 — skipping batch, proceeding to per-ticker (no cooldown)`
- Fall through to per-ticker loop
- **DO NOT call `set_cooldown()` for Yahoo**

Iron Rule #8: Only HTTP 429 triggers SOP-015.

---

**G7-FIX-2 (REVISED): Per-symbol failure isolation — no global cooldown from single-symbol 429**

ANAU.MI stays on Yahoo Finance as primary. The fix is in the FAILURE PROPAGATION, not the provider routing.

When `_fetch_last_close_via_v8_chart_inner` exhausts all retries for ONE symbol (3× 429):
- **Current (wrong):** Call `set_cooldown(YAHOO_FINANCE, 15)` → freeze all symbols
- **Required:** Raise `YahooSymbolRateLimitedException` (new exception, distinct from systemic `YahooRateLimitedException`) OR set a per-symbol failure flag

The caller in `sync_ticker_prices_eod.py`:
- Catches `YahooSymbolRateLimitedException` → logs `📌 {symbol}: Yahoo rate-limited (per-symbol) — using last-known price`
- Does **NOT** call `set_cooldown()`
- Moves to next symbol normally

Global cooldown trigger rule (post-fix):
- Only call `set_cooldown(YAHOO_FINANCE, 15)` when ≥ 3 DISTINCT symbols fail in the same cycle with 429 (= systemic rate limit event)
- Single-symbol 429 exhaustion = per-symbol degradation only

This preserves Yahoo as primary for ANAU.MI and all European tickers. A per-symbol failure for ANAU.MI leaves AAPL, AMZN, QQQ, SPY, BTC-USD, TEVA.TA, etc. unaffected.

---

**G7-FIX-3 (unchanged): Fix evidence counting**

In `scripts/run_g7_part_a_evidence.py`, replace:
```python
count_429 = text.count("429")
print(f"cc_wp003_04_yahoo_429_count={count_429}")
print(f"pass_04={count_429 == 0}")
```

With:
```python
# Count actual Yahoo provider-level cooldown activations (not per-symbol retries)
count_cooldown = text.count("Yahoo 429 — cooldown")
print(f"cc_wp003_04_yahoo_cooldown_count={count_cooldown}")
print(f"pass_04={count_cooldown == 0}")
```

The old method counted all occurrences of "429" in log text including retry messages — artificially inflating the count. The new method counts actual SOP-015 cooldown activations.

---

### For Team 50 (QA) — After G7-FIX-1..3 implemented

**G7-VERIFY checklist:**
- [ ] H3 fix removed: batch 401 does NOT set Yahoo cooldown
- [ ] Per-symbol 429 exhaustion: only that symbol degrades; others continue on Yahoo
- [ ] Evidence counting: `count("Yahoo 429 — cooldown")`
- [ ] 4-cycle run: `pass_04=True`
- [ ] AAPL / QQQ / SPY / BTC-USD: prices fetched in at least one cycle
- [ ] ANAU.MI: price fetched from Yahoo OR last-known price (both acceptable)
- [ ] No "YAHOO_FINANCE in cooldown — skipping" cascading through cycles

Submit clean log to Team 90 as CC-04 runtime evidence.

---

## 4. New Work Package Notice: WP004 Market Data Provider Optimization

The following items are **confirmed for WP004**, scope NOT in WP003:

| Item | Description |
|---|---|
| DB-backed price cache | hot=60s, warm=300s — replicate legacy pattern; cache-first before every API call |
| DataRefreshPolicy (EOD) | Priority filter: active trades → fetch every cycle; no trades → fetch once/hour max |
| Historical gap-fill model | **Iron Rule #9**: historical data is immutable; only fetch dates missing from DB + today's close |
| Full per-symbol isolation | Track per-symbol failure count; global cooldown only at ≥ 3 distinct symbol failures |
| Alpha rate-limit separation | Per-minute rate limit = 12.5s delay; daily quota exhaustion = 24h cooldown (separate handling) |
| Provider symbol mapping DB | TickerSymbolMappingService pattern — maps internal symbol → Yahoo/Alpha symbol per-provider |

**WP004 gate lifecycle:** Team 10 to create LOD200 spec → GATE_2 approval → standard S002 gates.
**Priority:** P1 (does not block S003). Can run in parallel with S003-P003 early gates.

---

## 5. New Iron Rules (from v1.1.0 decision)

**Iron Rule #9 (NEW):**
> Historical market data (past trading day OHLCV) is **immutable** once stored. No sync job may re-fetch a date already in `market_data.ticker_prices`. EOD sync implements gap-fill only.

**Iron Rule #10 (NEW):**
> A per-symbol Yahoo 429 is a symbol-level event. It must NOT cause a global provider cooldown unless ≥ 3 distinct symbols fail in the same cycle.

---

## 6. Updated Execution Sequence

```
NOW:
  Team 10 → Team 20: G7-FIX-1 (corrected), G7-FIX-2 (revised), G7-FIX-3
  Team 20 implements (~1 day)
  Team 50: G7-VERIFY 4-cycle evidence run → pass_04=True
  Team 50 → Team 90: CC-04 evidence submitted

GATE_7 PART A (sequential):
  Team 90 validates CC-WP003-01, 02, 04 from live evidence

GATE_7 PART B (parallel):
  CC-WP003-05: Nimrod UX browser walk-through of B1 items

GATE_7 → GATE_8 → S002 closure → S003 activation

PARALLEL:
  Team 10: WP004 LOD200 → route to GATE_2
```

---

**log_entry | TEAM_00 | TEAM_00_TO_TEAM_10_MARKET_DATA_PROVIDER_DIRECTIVE_v1.1.0 | ISSUED | SUPERSEDES_v1.0.0 | G7-FIX-2_REVISED_ANAU_ON_YAHOO | OPTION_B_APPROVED | WP004_NOTICE | IRON_RULES_9_AND_10 | 2026-03-11**
