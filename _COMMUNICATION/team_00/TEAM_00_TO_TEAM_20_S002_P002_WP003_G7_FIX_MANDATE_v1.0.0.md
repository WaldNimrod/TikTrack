**date:** 2026-03-12

**historical_record:** true

---
project_domain: TIKTRACK
id: TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 20 (Backend Implementation)
cc: Team 50 (QA), Team 10 (Gateway), Team 90 (Validation)
status: MANDATE_ACTIVE — CANONICAL ACTIVATION PROMPT
gate_id: GATE_7 (S002-P002-WP003)
work_package_id: S002-P002-WP003
priority: P0 — CC-04 GATE BLOCKER
authority: Team 00 (Chief Architect)
references:
  - ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.1.0
  - TEAM_00_TO_TEAM_10_MARKET_DATA_PROVIDER_DIRECTIVE_v1.1.0
---

# CANONICAL ACTIVATION PROMPT — WP003 G7-FIX Implementation
## Team 20 (Backend): 3 Code Fixes — CC-WP003-04 Unblock

---

## CONTEXT

CC-WP003-04 (zero Yahoo provider-level cooldown activations in 4 consecutive EOD cycles) is failing due to three architectural defects. The Chief Architect has diagnosed all three via review of runtime evidence logs and legacy code. This mandate provides exact code-level changes required to satisfy CC-04.

**Root causes confirmed:**
- **RCA-B:** Yahoo v7/quote batch HTTP 401 incorrectly triggers a global 15-minute Yahoo cooldown (H3 fix behavior) — this is wrong because 401 is authorization refusal, not rate-limiting
- **RCA-A:** A single symbol's v8/chart HTTP 429 retry exhaustion triggers a global 15-minute Yahoo cooldown — this is wrong because a per-symbol failure should not freeze all other symbols
- **RCA-C:** Evidence script counts ALL occurrences of "429" string in logs rather than actual cooldown activation events — leading to false failures of CC-04

**Design constraint:** ANAU.MI stays on Yahoo Finance as primary provider. The fix is in failure handling, NOT provider routing.

---

## G7-FIX-1: Batch 401 → No Cooldown [P0 — CRITICAL]

### File
`scripts/sync_ticker_prices_eod.py`

### Exact location
Lines 239–242 (within the `fetch_prices_for_tickers` function, batch exception handler):

```python
# CURRENT CODE (remove this):
elif "401" in str(e) or "Unauthorized" in str(e).lower():
    # H3: 401 = Yahoo blocking; avoid per-ticker v8 (429). Use Alpha fallback.
    set_cooldown("YAHOO_FINANCE", cooldown_min)
    print(f"⚠️ Yahoo batch 401 — cooldown {cooldown_min}min (use Alpha fallback)")
```

### Required change
Replace the 401 branch with a log-only + fallthrough (no cooldown):

```python
# REPLACEMENT CODE:
elif "401" in str(e) or "Unauthorized" in str(e).lower():
    # Iron Rule #8: 401 = authorization refusal, NOT a rate limit — never triggers SOP-015
    print(f"⚠️ Yahoo batch 401 — skipping batch, proceeding to per-ticker (no cooldown)")
```

### What must NOT change
- The `_is_429` branch (lines 236–238) must remain unchanged — batch 429 still correctly triggers cooldown
- The `print(f"⚠️ Yahoo batch failed: {e}")` line (line 243) must remain
- Do NOT touch any other logic in the batch block

### Verification
After fix: when batch returns 401, logs should show:
```
⚠️ Yahoo batch 401 — skipping batch, proceeding to per-ticker (no cooldown)
⚠️ Yahoo batch failed: Client error '401 Unauthorized' ...
```
And MUST NOT show: `⚠️ YAHOO_FINANCE in cooldown — skipping` in subsequent per-ticker processing.

---

## G7-FIX-2: Per-Symbol 429 Exhaustion → Per-Symbol Degradation Only [P0 — CRITICAL]

This fix has TWO parts: (A) in `yahoo_provider.py` and (B) in `sync_ticker_prices_eod.py`.

### Part A — File: `api/integrations/market_data/providers/yahoo_provider.py`

#### Exact location
Lines 240–245 (inside `_fetch_last_close_via_v8_chart_inner`, after 3rd retry failure):

```python
# CURRENT CODE (remove the set_cooldown call):
# All retries exhausted — set cooldown (SOP-015)
from ..provider_cooldown import set_cooldown
from ..market_data_settings import get_provider_cooldown_minutes
cooldown_min = get_provider_cooldown_minutes()
set_cooldown("YAHOO_FINANCE", cooldown_min)
logger.warning("Yahoo 429 — cooldown %d min (SOP-015)", cooldown_min)
```

#### Required change
Replace with: raise a new per-symbol exception (do NOT set global cooldown here):

```python
# REPLACEMENT CODE:
# All retries exhausted for this symbol — per-symbol rate limit, NOT systemic
logger.warning(
    "Yahoo v8/chart 429 exhausted for %s — per-symbol rate limit (no global cooldown)",
    symbol,
)
raise YahooSymbolRateLimitedException(symbol)
```

#### New exception class
Add at the top of `yahoo_provider.py` (near existing exception definitions):

```python
class YahooSymbolRateLimitedException(Exception):
    """Raised when a single symbol exhausts Yahoo v8/chart retry attempts.

    Distinct from a systemic Yahoo rate limit. Per-symbol failures must NOT
    trigger a global provider cooldown (Iron Rule #10).
    """
    def __init__(self, symbol: str):
        self.symbol = symbol
        super().__init__(f"Yahoo per-symbol rate limit exhausted: {symbol}")
```

#### What must NOT change
- The retry loop logic (lines 224–239) — keep exactly as-is (3 attempts, 5s/10s/20s backoff)
- The `r.raise_for_status()` call (line 246) — keep; handles non-429 HTTP errors correctly
- The `logger.warning` for attempt 1/2 (lines 234–238) — keep as-is

### Part B — File: `scripts/sync_ticker_prices_eod.py`

#### Location
The per-ticker provider loop (lines 245 onwards, `for ticker_id, symbol, ticker_type, metadata in tickers:`).

#### Required additions

**Step 1:** Add import at top of `fetch_prices_for_tickers` function (or at module level):
```python
from api.integrations.market_data.providers.yahoo_provider import YahooSymbolRateLimitedException
```

**Step 2:** Add a per-cycle symbol fail counter before the per-ticker loop:
```python
yahoo_symbol_fail_count = 0  # Count of distinct symbols that hit per-symbol rate limit
```

**Step 3:** In the per-ticker Yahoo processing block, add exception handling for `YahooSymbolRateLimitedException`:

Current structure (simplified):
```python
try:
    price = await yahoo.get_ticker_price(symbol)
    ...
except Exception as e:
    if _is_429(e):
        set_cooldown(name, cooldown_min)  # ← THIS is the problem
    print(f"⚠️ {name} {symbol}: {e}")
```

Required structure:
```python
try:
    price = await yahoo.get_ticker_price(symbol)
    ...
except YahooSymbolRateLimitedException as e:
    # Per-symbol rate limit: degrade this symbol only, do NOT set global cooldown
    yahoo_symbol_fail_count += 1
    print(f"📌 {e.symbol}: Yahoo per-symbol rate limit — using last-known price")
    # --- Fall through to last-known price path (same as providers unavailable) ---
    # [existing last-known price logic here]
    if yahoo_symbol_fail_count >= 3:
        # 3+ distinct symbols failed = systemic rate limit — activate global cooldown
        set_cooldown("YAHOO_FINANCE", cooldown_min)
        print(f"⚠️ Yahoo systemic rate limit detected ({yahoo_symbol_fail_count} symbols) — cooldown {cooldown_min}min")
except Exception as e:
    if _is_429(e):
        set_cooldown(name, cooldown_min)   # Keep: non-symbol-specific 429
        print(f"⚠️ {name} 429 — cooldown {cooldown_min}min")
    print(f"⚠️ {name} {symbol}: {e}")
```

**Note on implementation:** Team 20 determines the exact integration point. The key behavioral contract is:
1. `YahooSymbolRateLimitedException` → per-symbol degradation (last-known price) → increment `yahoo_symbol_fail_count`
2. When `yahoo_symbol_fail_count >= 3` → then (and only then) set global Yahoo cooldown
3. Standard non-symbol-specific exceptions with `_is_429` → unchanged behavior

#### What must NOT change
- Alpha Vantage fallback logic — unchanged
- Last-known price DB query — unchanged
- FIX-4 eligibility gate — unchanged
- ALPHA_FX_RESERVE policy — unchanged

### Verification
After fix: run single sync cycle. When ANAU.MI gets 429:
```
Yahoo v8/chart 429 for ANAU.MI (attempt 1/3) — backing off 5s
Yahoo v8/chart 429 for ANAU.MI (attempt 2/3) — backing off 10s
Yahoo v8/chart 429 exhausted for ANAU.MI — per-symbol rate limit (no global cooldown)
📌 ANAU.MI: Yahoo per-symbol rate limit — using last-known price
```
And AAPL, QQQ, SPY, BTC-USD must continue → prices fetched normally. No "YAHOO_FINANCE in cooldown — skipping" for other symbols.

---

## G7-FIX-3: Evidence Counting Fix [P0 — GATE CRITERION]

### File
`scripts/run_g7_part_a_evidence.py`

### Exact location
Lines 59–63 (at the end of `main()` function):

```python
# CURRENT CODE (replace):
text = log_path.read_text(encoding="utf-8")
count_429 = text.count("429")
print(f"log_path={log_path}")
print(f"cc_wp003_04_yahoo_429_count={count_429}")
print(f"pass_04={count_429 == 0}")
```

### Required change
```python
# REPLACEMENT CODE:
text = log_path.read_text(encoding="utf-8")
# Count actual Yahoo provider-level cooldown activations (not per-symbol retry messages)
# "Yahoo 429 — cooldown" = SOP-015 global cooldown activation
# "Yahoo systemic rate limit" = G7-FIX-2 threshold reached
count_cooldown = text.count("Yahoo 429 — cooldown") + text.count("Yahoo systemic rate limit")
print(f"log_path={log_path}")
print(f"cc_wp003_04_yahoo_cooldown_activations={count_cooldown}")
print(f"pass_04={count_cooldown == 0}")
```

### Why this is correct
The old `text.count("429")` counted log message strings including retry attempt messages:
- `"Yahoo v8/chart 429 for ANAU.MI (attempt 1/3)"` → counted "429"
- `"Yahoo v8/chart 429 for ANAU.MI (attempt 2/3)"` → counted "429"
- `"Yahoo 429 — cooldown"` → counted "429"
= 3 string occurrences per single 429 event

The new counting targets only actual global cooldown activations. After G7-FIX-1 and G7-FIX-2, per-symbol degradations do NOT produce either of these strings → `count_cooldown = 0` → `pass_04 = True`.

### What must NOT change
- The 4-cycle loop structure (H4 fix — in-process cycles) — unchanged
- The 60s delay between cycles — unchanged
- The log file path and naming — unchanged

---

## Execution Order

Implement in this order — each fix builds on the previous:

```
Step 1: G7-FIX-3 (evidence script) — standalone, no dependencies
Step 2: G7-FIX-1 (batch 401) — standalone
Step 3: G7-FIX-2 Part A (yahoo_provider.py) — add exception class + raise
Step 4: G7-FIX-2 Part B (sync_ticker_prices_eod.py) — catch exception + counter logic
Step 5: Local test: run python scripts/run_g7_part_a_evidence.py
Step 6: Submit to Team 50 for G7-VERIFY
```

---

## Success Criteria (Testable)

| # | Criterion | Pass condition | Fail condition |
|---|---|---|---|
| SC-01 | Batch 401 does not set cooldown | Log shows "skipping batch, proceeding to per-ticker" with no subsequent "YAHOO_FINANCE in cooldown — skipping" for per-ticker symbols | Log shows "YAHOO_FINANCE in cooldown" immediately after batch 401 |
| SC-02 | ANAU.MI 429 does not cascade to global cooldown | Log shows "per-symbol rate limit" for ANAU.MI; AAPL/QQQ/SPY continue; no "YAHOO_FINANCE in cooldown — skipping" for other symbols | Log shows "YAHOO_FINANCE in cooldown — skipping" after ANAU.MI failure |
| SC-03 | Systemic threshold triggers global cooldown | When 3+ distinct symbols hit per-symbol 429 exhaustion, global cooldown IS set | (not applicable for normal operation; this is a safety backstop) |
| SC-04 | Evidence counting | `pass_04=True` in 4-cycle run with no global cooldown activations | `pass_04=False` |
| SC-05 | 4-cycle run: prices fetched | At least SPY, AAPL, QQQ receive fresh prices in one of the 4 cycles | All 4 cycles show "No prices fetched" |
| SC-06 | Graceful degradation still works | ANAU.MI uses last-known price when Yahoo per-symbol rate limited; exit 0 | Any crash or exit non-0 |
| SC-07 | No regression | FIX-1..4 behaviors unchanged (quota log, ALPHA_FX_RESERVE, graceful degradation) | Any FIX-1..4 behavior regression |

---

## Constraints (Iron Rules)

1. **Iron Rule #8:** HTTP 401 on Yahoo endpoints NEVER triggers SOP-015 cooldown
2. **Iron Rule #10:** Per-symbol Yahoo 429 NEVER triggers global cooldown unless ≥ 3 distinct symbols fail in same cycle
3. **maskedLog:** All new log statements use `maskedLog` or `print` (no raw API keys or prices)
4. **NUMERIC(20,8):** No change to price precision logic
5. **ANAU.MI stays on Yahoo:** Do NOT add ANAU.MI to any provider override mapping — Yahoo is still primary

---

## Team 50 — Additional Requirements

Team 50 must, upon receiving G7-FIX-1/2/3 from Team 20:

### A. Run G7-VERIFY evidence
1. Execute `python scripts/run_g7_part_a_evidence.py`
2. Verify: `pass_04=True` in output
3. Verify: no "Yahoo 429 — cooldown" in log (no global cooldown activations)
4. Verify: at least one non-ANAU.MI symbol has a fresh price
5. Submit log as CC-04 runtime evidence to Team 90

### B. Add to QA test suite (GATE_5 and all subsequent gates)

The following behavioral contracts must be verified in every future gate QA cycle:

| Test ID | Description | Pass condition |
|---|---|---|
| T-MKTDATA-01 | Batch 401 does not set Yahoo cooldown | Mock v7/quote to return 401; assert `is_in_cooldown("YAHOO_FINANCE") == False` after batch attempt |
| T-MKTDATA-02 | Single-symbol 429 exhaustion does not set Yahoo cooldown | Mock v8/chart to return 429 × 3 for ONE symbol; assert `is_in_cooldown("YAHOO_FINANCE") == False` |
| T-MKTDATA-03 | Three-symbol 429 exhaustion sets Yahoo cooldown | Mock v8/chart to return 429 × 3 for THREE distinct symbols; assert `is_in_cooldown("YAHOO_FINANCE") == True` |
| T-MKTDATA-04 | CC-04 evidence counting counts cooldown activations | Inject "Yahoo 429 — cooldown" text × 1; assert `count_cooldown == 1`, not 3 |
| T-MKTDATA-05 | Iron Rule #8 enforcement | 401 anywhere in Yahoo flow → `is_in_cooldown("YAHOO_FINANCE") == False` |

These tests must be maintained in Team 50's test suite across all future gate cycles for WP003 and beyond.

---

## Gate Path After Implementation

```
Team 20 implements G7-FIX-1/2/3 (P0, sub-stage G3.8)
  → Team 50: G7-VERIFY (4-cycle evidence run → pass_04=True)
    → Team 50 adds T-MKTDATA-01..05 to QA suite
      → Team 90: CC-04 confirmed ✅
        → CC-WP003-01, 02 runtime evidence continues
          → GATE_7 PART A approaches PASS
```

---

**log_entry | TEAM_00 | TEAM_00_TO_TEAM_20_S002_P002_WP003_G7_FIX_MANDATE_v1.0.0 | MANDATE_ACTIVE | G7-FIX-1_BATCH_401 + G7-FIX-2_PER_SYMBOL_429 + G7-FIX-3_EVIDENCE_COUNTING | CANONICAL_ACTIVATION_PROMPT | 2026-03-12**
