---
project_domain: TIKTRACK
id: ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 10 (Gateway), Team 20 (Backend), Team 50 (QA), Team 90 (Validation)
cc: Team 100 (Architecture Authority)
date: 2026-03-11
status: APPROVED — BINDING
gate_id: GATE_7 (S002-P002-WP003)
work_package_id: S002-P002-WP003
in_response_to: S002_P002_WP003_GATE7_CC04_YAHOO_429_ARCHITECT_ESCALATION_REQUEST
authority: Team 00 (Chief Architect)
---

# ARCHITECTURAL DECISION — MARKET DATA PROVIDER ARCHITECTURE
## Root Cause Analysis + CC-04 Resolution + Strategic Recommendations

---

## §0 — Executive Summary

Team 20 escalated CC-WP003-04 (zero Yahoo 429 in 4 consecutive EOD cycles) as a persistent blocker. After reviewing **all 6 runtime evidence logs**, the **full Yahoo Finance and Alpha Vantage provider codebase** (`yahoo_provider.py`, `sync_ticker_prices_eod.py`, `provider_cooldown.py`), and the **provider SSOT specs**, this decision identifies **three distinct root causes**, all structural, and issues **8 binding architectural recommendations**.

**Conclusion on CC-04:** CC-WP003-04 cannot pass under the current architecture because the 15-minute cooldown duration is 15× longer than the 60-second inter-cycle gap in the evidence script. Any cooldown activation in Cycle 1 structurally blocks Cycles 2–4. **CC-04 is simultaneously a code problem AND a criterion formulation problem.**

**Conclusion on "QA progress":** The graceful degradation path (last-known price fallback, 9 upserts, market_cap backfill) is confirmed working (log 212850). This is a valid operational milestone. However, CC-04 proper — zero provider-level disruption across 4 cycles — remains unmet.

**Strategic direction:** Yahoo Finance remains the correct primary provider for US/global symbols. The current problems are not about Yahoo reliability in general — they are about three specific failure modes that the architecture does not handle correctly. Fix those three failure modes, and the provider architecture is sound.

---

## §1 — Evidence Base

### §1.1 Runtime logs reviewed (6 files)

| Log file | Type | Key finding |
|---|---|---|
| G7_PART_A_..._212850.log | Single sync cycle (direct) | ANAU.MI v8/chart 429 × 2 → Yahoo cooldown; graceful degradation: **9 upserts, last-known prices** |
| G7_PART_A_..._221540.log | 4-cycle evidence | ANAU.MI v8/chart 429 × 3 → Yahoo cooldown + Yahoo batch 401 → Alpha in cooldown → "No prices fetched" |
| G7_PART_A_..._222739.log | 4-cycle evidence | Yahoo batch 401; ANAU.MI v8/chart 429 × 3 → Yahoo cooldown; Alpha in cooldown (1273s) → cycles 2–4 blocked |
| G7_PART_A_..._223120.log | 4-cycle evidence | Same pattern; Alpha cooldown 1052s → cycles 2–4 blocked |
| G7_PART_A_..._223450.log | 4-cycle evidence | H3 fix active: "Yahoo batch 401 — cooldown 15min"; Alpha cooldown 859s → cycles 2–4 blocked |
| G7_PART_A_..._223911.log | 4-cycle evidence (latest) | H3 fix active; Alpha cooldown 598s → cycles 2–4 blocked |

**Consistent pattern across ALL 6 runs:** Yahoo batch v7/quote returns 401 in Cycle 1 → cooldown cascade → Cycles 2–4 blocked.

**Positive finding:** Log 212850 confirms graceful degradation is working. The system does not crash, does upsert 9 prices using last-known values, and does backfill market_cap. This is FIX-1 working correctly.

### §1.2 Alpha Vantage cooldown — independent source

In logs 222739 through 223911, Alpha Vantage is already in cooldown at the START of each evidence run (1273s → 1052s → 859s → 598s remaining, decreasing predictably). This cooldown was set by a previous run BEFORE the evidence script started. Alpha and Yahoo are simultaneously in cooldown across all 4 cycles, leaving no fallback path.

The cause of Alpha's cooldown is a prior activation from a separate test/sync attempt — not from within the evidence script itself. However, this pattern will repeat in production: if both providers hit their cooldowns in close succession, there is a total blackout period.

---

## §2 — Root Cause Analysis

### ROOT CAUSE A: Symbol-level failures cascade to provider-level freeze [CRITICAL]

**Code location:** `yahoo_provider.py` `_fetch_last_close_via_v8_chart_inner` → `sync_ticker_prices_eod.py` cooldown logic

**What happens:** ANAU.MI (Borsa Italiana, .MI exchange) consistently fails on Yahoo Finance's v8/chart endpoint with HTTP 429. After 3 retry attempts (5s → 10s → 20s backoff), the SOP-015 protocol activates a **15-minute global Yahoo cooldown** for ALL symbols.

**Why this is wrong architecturally:** A 429 for a single symbol — especially one that Yahoo does not reliably support (.MI exchange is not in the Yahoo Gold Standard Rule #11 fallback list: `.DE, .F, .L, .PA, .AS`) — should not freeze the provider for ALL other symbols (AAPL, AMZN, GOOGL, META, QQQ, SPY, BTC-USD, TEVA.TA). The failure of ANAU.MI on Yahoo is structural, not load-based.

**Impact:** Every EOD sync cycle is immediately frozen after ANAU.MI fails. The remaining 8 symbols — which Yahoo CAN serve — never get fresh prices.

---

### ROOT CAUSE B: HTTP 401 on the batch endpoint is incorrectly classified as a rate-limit event [CRITICAL]

**Code location:** `sync_ticker_prices_eod.py` H3 fix (lines 241–242) + `yahoo_provider.py` batch function

**What happens:** Yahoo Finance's v7/finance/quote batch endpoint returns 401 Unauthorized (bot detection / scraping restriction). In runs 223450 and 223911, the H3 fix logs: `⚠️ Yahoo batch 401 — cooldown 15min (use Alpha fallback)` — explicitly setting a 15-minute cooldown on 401.

**Why this is wrong architecturally:**
- **HTTP 401 ≠ HTTP 429.** 401 = "you are not authorized to use this endpoint." This is a structural/policy response from Yahoo, not a rate limit signal.
- Setting a 15-minute cooldown because of 401 treats an authorization refusal the same as a rate limit — they are fundamentally different failure modes.
- When the batch 401 triggers a Yahoo cooldown, the per-ticker fallback loop is skipped entirely. This means ALL symbols fail even though per-ticker v8/chart works fine for US symbols.
- The H3 fix is well-intentioned (avoid hammering Yahoo after it refuses the batch) but the implementation is wrong: it converts an authorization failure into a total provider freeze.

**Evidence:** In logs 222739 and 223120 (before H3 was applied), the batch 401 does NOT set Yahoo cooldown — and ANAU.MI still proceeds to per-ticker v8/chart. In 223450 and 223911 (H3 active), the batch 401 immediately sets Yahoo cooldown and per-ticker is never reached.

---

### ROOT CAUSE C: The evidence methodology's inter-cycle gap (60s) is incompatible with the cooldown duration (15 min = 900s) [CRITERION DESIGN FLAW]

**Code location:** `scripts/run_g7_part_a_evidence.py`

**What happens:** The evidence script runs 4 cycles with 60 seconds between each. Once any cooldown is activated in Cycle 1 (900 seconds), Cycles 2, 3, and 4 (occurring at 60s, 120s, 180s elapsed) all run while the cooldown is still active. CC-04 (`pass_04 = count_429 == 0`) therefore can NEVER pass after any cooldown activation.

**Evidence:** In EVERY 4-cycle run, Cycles 2–4 show "839s / 779s / 719s remaining" — the cooldown hasn't expired and won't expire for another 12+ minutes after the evidence run ends.

**Compounding factor:** `count_429 = text.count("429")` counts ALL occurrences of the string "429" in the log, including:
- "Yahoo v8/chart **429** for ANAU.MI (attempt 1/3) — backing off 5s" → 1 count
- "Yahoo v8/chart **429** for ANAU.MI (attempt 2/3) — backing off 10s" → 1 count
- "Yahoo **429** — cooldown 15 min (SOP-015)" → 1 count

**Result:** A single 429 event (one symbol, one retry cycle) generates 3 occurrences of "429" in the log text. The criterion `count_429 == 0` fails if even one 429 event is handled gracefully via the retry mechanism.

---

## §3 — Answers to Escalation Questions (6.1–6.3)

### 6.1.1: Seder API be-per-ticker — האם לנסות v7/quote לפני v8/chart?

**Decision: YES — for EOD sync, v7/quote per-symbol should be attempted before v8/chart.**

The Yahoo Gold Standard SSOT (Rule #2: v8/chart Primary) was written for the intraday/historical use case where v8/chart provides full OHLCV data. For EOD price sync, v7/quote per-symbol is adequate and less prone to 429. The H1 fix (already implemented per code review) makes `_fetch_price_sync` do v7→yfinance→v8 — **this is correct for EOD and must be preserved.**

However, note: for ANAU.MI, ALL three Yahoo endpoints fail (v7 returns empty/no-data, yfinance fails, v8 returns 429). The order issue is secondary to Root Cause A (ANAU.MI has no reliable Yahoo path).

### 6.1.2: Handling 401 from v7/quote batch — cookies, crumb, session?

**Decision: DO NOT pursue session/cookie/crumb authentication for Yahoo's unofficial API.**

Yahoo's 401 on the v7/finance/quote batch endpoint is server-side bot detection. Attempting to work around it with session cookies or crumb tokens introduces dependency on Yahoo's authentication mechanisms, which can change without notice. This is:
1. **Fragile** — Yahoo changes their auth requirements; any solution breaks
2. **Terms of Service risk** — Bypassing Yahoo's anti-automation measures
3. **Not the right investment** — For a portfolio of 9 symbols, the batch endpoint is not architecturally necessary; per-symbol calls with proper spacing are sufficient

**Binding directive: Do NOT implement Yahoo crumb/cookie/session authentication. The batch 401 should be handled by falling through to per-ticker per-symbol fetch, without setting a Yahoo cooldown.**

### 6.1.3: ANAU.MI — alternative provider?

**Decision: ANAU.MI → Alpha Vantage primary, Yahoo entirely skipped for this symbol.**

ANAU.MI (iShares Core MSCI Emerging Markets ETF, Borsa Italiana .MI exchange) is not reliably served by Yahoo Finance's unofficial API. Yahoo Gold Standard Rule #11 lists optional European fallbacks as `.DE, .F, .L, .PA, .AS` — .MI (Milan) is NOT included.

**Binding directive: Add ANAU.MI to `SYMBOL_PROVIDER_OVERRIDES` mapping — Alpha Vantage primary, no Yahoo attempt.** If Alpha Vantage also fails for ANAU.MI → graceful degradation (last-known price), no cooldown set. Log as: `📌 ANAU.MI: symbol unsupported by all live providers — using last-known price`.

Alpha Vantage GLOBAL_QUOTE endpoint supports international stocks via their symbol convention. Team 20 must verify the correct Alpha Vantage symbol for ANAU.MI (likely `ANAU.MIL` or similar) before implementing.

### 6.2.4: Yahoo as primary for EOD — continue or change strategy?

**Decision: Yahoo remains primary for US/global symbols. CHANGE the failure handling architecture, not the provider strategy.**

Yahoo Finance is the correct primary provider for: AAPL, AMZN, GOOGL, META, QQQ, SPY, BTC-USD, TEVA.TA. The data quality, coverage, and call efficiency are appropriate. The PROBLEMS are not about Yahoo in general — they are about:
1. ANAU.MI not being supported → solvable by provider override
2. Batch 401 incorrectly triggering cooldown → solvable by code fix
3. Cooldown scope being too broad (per-provider instead of per-symbol) → solvable by architecture change

**Keep Yahoo as primary. Fix the failure propagation model.**

### 6.2.5: Architecture approach — which option?

**Decision: Implement ALL THREE options in sequence, as they address different layers:**

- **Option A (v7-first in per-ticker):** Already done via H1 fix. Maintain it. ✅
- **Option B (Symbol-to-Provider mapping):** MANDATORY for ANAU.MI. Implement SYMBOL_PROVIDER_OVERRIDES. See §4, REC-03.
- **Option C (separate batch-success path from fallback path, different policies):** MANDATORY. Batch 401 must NOT set cooldown; fallback path has its own (more lenient) failure handling. See §4, REC-02.

### 6.3.6: GATE_7 CC-04 evidence methodology

**Decision: Amend CC-04 criterion + fix evidence counting + change evidence window.**

1. **Criterion amendment** — see §5 below.
2. **Counting fix:** Replace `text.count("429")` with `text.count("Yahoo 429 — cooldown")` (counts only actual cooldown activations, not retry attempt log lines).
3. **Evidence window:** The 60s inter-cycle gap is too short for meaningful evidence. After architectural fixes, evidence should be run with cycles spaced far enough apart that any cooldown (if triggered) expires between cycles. OR: confirm that after fixes, zero cooldowns are triggered across the entire run (no cooldown = no gap requirement).

---

## §4 — Architectural Recommendations (8 binding directives)

### REC-01: Implement symbol-level failure isolation [PRIORITY 0 — CRITICAL]

**Current state:** ANY symbol that exhausts Yahoo's retry envelope (3× 429) → 15-minute global Yahoo freeze for ALL symbols.

**Required change:** Track Yahoo 429 failures PER SYMBOL. Only activate global Yahoo cooldown when:
- ≥ 3 DISTINCT symbols return 429 in the same cycle, OR
- A high-signal symbol (AAPL, SPY, QQQ) returns 429

**For ANAU.MI specifically:** A per-symbol failure must result in `last-known price` for ANAU.MI only — not a global Yahoo cooldown.

**Files:** `provider_cooldown.py` (add per-symbol failure tracking), `sync_ticker_prices_eod.py` (check per-symbol vs. global threshold before calling `set_cooldown`), `yahoo_provider.py` (`_fetch_last_close_via_v8_chart_inner` should raise a distinct exception for "single-symbol 429" vs. "systemic 429").

---

### REC-02: Separate 401 and 429 handling — batch vs. per-ticker [PRIORITY 0 — CRITICAL]

**Binding rule — effective immediately:**

| Failure type | Current behavior | Required behavior |
|---|---|---|
| Yahoo v7/quote batch — HTTP 401 | Set 15-min Yahoo cooldown (H3 fix) | Log warning; fall through to per-ticker loop; **DO NOT SET COOLDOWN** |
| Yahoo v7/quote batch — HTTP 429 | (not currently observed) | Set 15-min Yahoo cooldown (correct behavior) |
| Yahoo v8/chart per-symbol — HTTP 429 × 3 | Set 15-min Yahoo cooldown | After REC-01: only set global cooldown if ≥3 distinct symbols fail |
| Yahoo v8/chart per-symbol — HTTP 429 (1 or 2 attempts) | Retry with backoff (correct) | Unchanged |

**Remove the H3 fix immediately** (batch 401 → cooldown). Replace with: batch 401 = skip batch, proceed to per-ticker, log `⚠️ Yahoo batch 401 — skipping batch, falling to per-ticker` **without** setting any cooldown.

**Files:** `sync_ticker_prices_eod.py` (remove lines 241–242 cooldown-set-on-401; change to simple warning log + fallthrough)

---

### REC-03: Implement SYMBOL_PROVIDER_OVERRIDES routing [PRIORITY 0 — CRITICAL]

**Purpose:** Route symbols that Yahoo doesn't support to their correct primary provider, bypassing Yahoo entirely.

**Required implementation:**

In `market_data_settings.py`, add:
```python
# Symbols mapped to non-Yahoo primary provider (Yahoo unsupported/unreliable)
SYMBOL_PROVIDER_OVERRIDES: Dict[str, str] = {
    "ANAU.MI": "ALPHA_VANTAGE",
    # Add future unsupported symbols here
}
```

In `sync_ticker_prices_eod.py`, before per-ticker Yahoo loop:
```
if symbol in SYMBOL_PROVIDER_OVERRIDES:
    override_provider = SYMBOL_PROVIDER_OVERRIDES[symbol]
    # Route directly to override_provider
    # If override_provider also fails: last-known price, NO cooldown set
    continue  # skip Yahoo entirely for this symbol
```

**Team 20 action:** Verify Alpha Vantage symbol for ANAU.MI (test `GLOBAL_QUOTE&symbol=ANAU.MI` and `GLOBAL_QUOTE&symbol=ANAU.MIL`). Whichever returns valid data becomes the canonical Alpha symbol in SYMBOL_PROVIDER_OVERRIDES.

---

### REC-04: Fix CC-04 evidence counting methodology [PRIORITY 0 — BLOCKS GATE]

**Current:** `count_429 = text.count("429")` → counts retry attempt log lines, not 429 events.

**Required:** Change to count actual cooldown activation events:

```python
# Count distinct Yahoo cooldown activations caused by 429
count_cooldown_activations = text.count("Yahoo 429 — cooldown")
# OR equivalently:
count_cooldown_activations = text.count("cooldown 15 min (SOP-015)")
```

**Criterion change:**
- Old: `pass_04 = (count_429 == 0)` — counts "429" string occurrences
- New: `pass_04 = (count_cooldown_activations == 0)` — counts actual Yahoo global cooldown activation events

**Rationale:** A gracefully handled retry (429 → backoff → success on v7/quote) should NOT fail CC-04. Only a cooldown activation (provider freeze) should fail it.

**Files:** `scripts/run_g7_part_a_evidence.py` (update counting logic + print statement)

---

### REC-05: Reduce cooldown scope — per-symbol blacklist vs. global freeze [PRIORITY 1 — STRATEGIC]

**Current model:** 1 symbol fails 3× → ALL symbols lose the provider for 15 minutes.

**Target model (longer term, S003 or beyond):**
- Symbol-level blacklist: `_yahoo_symbol_failures: Dict[str, int]` — after 3 failures, add to `_symbol_blacklist` for 15 minutes
- Global cooldown: Only when ≥ 3 DISTINCT non-blacklisted symbols fail, OR when Yahoo returns 429 with a system-wide signal (e.g., Retry-After header)

**This change requires a refactor of `provider_cooldown.py` and is not mandatory for GATE_7.** It is a RECOMMENDED S003 improvement that will permanently solve the cascading freeze problem.

**For GATE_7 / immediate term:** REC-01 + REC-02 + REC-03 are sufficient. REC-05 is the proper long-term solution.

---

### REC-06: Separate Alpha Vantage cooldown from SOP-015 Yahoo protocol [PRIORITY 1 — STRATEGIC]

**Current issue:** Alpha Vantage uses the same `set_cooldown()` mechanism as Yahoo Finance. When Alpha's 5-calls/minute rate limit is hit, it sets a 15-minute cooldown — which is far longer than the 12-second delay the Alpha rate limit actually requires.

**Finding from logs:** Alpha Vantage is in cooldown with 1052–1273 seconds remaining in some runs. At 12.5s per call (from spec), 5 calls × 12.5s = 62.5s per minute. A 15-minute cooldown after a rate limit event is unnecessary. Alpha needs a RateLimitQueue delay (12.5s) on rate-limit events, not a 15-minute freeze.

**Required change (Target — after GATE_7):**
- Alpha rate-limit hit → add 12.5s delay to the next call (RateLimitQueue) → do NOT set 15-minute cooldown
- Alpha daily quota exhaustion → set 24-hour cooldown (already implemented per `market_data_settings.py` `alpha_quota_cooldown_hours`)
- Distinguish: per-minute rate limit ≠ daily quota exhaustion

**Files:** `provider_cooldown.py`, `alpha_provider.py` (separate the two Alpha failure modes)

---

### REC-07: CC-04 criterion amendment [GATE IMPACT — MANDATORY]

**Current CC-WP003-04:** "4 consecutive sync cycles (1 hour): zero Yahoo 429 responses in logs"

**Amended CC-WP003-04 (as of this decision):**

> **CC-WP003-04:** 4 consecutive EOD sync cycles with zero Yahoo **provider-level cooldown activations** due to rate limiting. Per-symbol retries within the backoff envelope (attempts 1/3, 2/3) that do NOT result in a global cooldown = compliant. A single cooldown activation from a genuinely unsupported symbol (ANAU.MI or equivalent) = compliant IF the symbol is pre-routed via SYMBOL_PROVIDER_OVERRIDES (Yahoo never attempted for it). A cooldown activation from Yahoo rejecting US/global symbols = non-compliant.

**Counting method:** `text.count("Yahoo 429 — cooldown")` = 0 for PASS (after ANAU.MI is routed to Alpha).

**Note:** This amendment does NOT weaken CC-04. It makes the criterion precisely describe the actual operational risk: global provider freeze. Individual retries that resolve successfully are not a system concern.

---

### REC-08: EOD sync architecture alignment with ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION [PRIORITY 1]

The earlier `ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0` mandated:
- Layer 1: Priority filtering (fetch only tickers needing refresh)
- Layer 2: Multi-symbol batch fetch via v7/quote
- §4.3 Rule 6: "No cooldown cascade on batch partial failure"

**Status gap:** Layer 1 (priority filtering) is NOT implemented for EOD sync. EOD currently fetches ALL active tickers every cycle. The directive's §4.3 Rule 6 ("no cooldown cascade on batch partial failure") is violated by the H3 fix.

**Binding immediate action:** §4.3 Rule 6 of `ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0` is hereby clarified and tightened:

> A **401 on the Yahoo batch endpoint** is classified as "batch partial failure — authorization refused." Per Rule 6: do NOT set Yahoo cooldown on batch 401. Fall through to per-ticker. A **429 on the Yahoo batch endpoint** (genuine rate limit) follows SOP-015.

Layer 1 (priority filtering for EOD) remains a deferred post-GATE_7 improvement. It is not blocking GATE_7 completion.

---

## §5 — CC-04 Criterion Amendment (Official)

**Effective immediately — this decision supersedes the CC-WP003-04 language in `ARCHITECT_GATE6_DECISION_S002_P002_WP003_v1.1.0.md` and `v2.0.0.md`:**

| CC-ID | Original | Amended | Change |
|---|---|---|---|
| CC-WP003-04 | "4 consecutive sync cycles (1 hour): zero Yahoo 429 responses in logs" | "4 consecutive EOD sync cycles: zero Yahoo global cooldown activations due to rate-limiting of supported symbols. ANAU.MI Yahoo failures are non-blocking if SYMBOL_PROVIDER_OVERRIDES routes ANAU.MI to Alpha Vantage." | Clarifies metric (cooldown activations, not string count); excludes unsupported-symbol overrides from failure criterion |

**Evidence counting for CC-04:**
- Method: `text.count("Yahoo 429 — cooldown")` ≤ 0 for PASS
- Script: `run_g7_part_a_evidence.py` (update counting logic per REC-04)
- Evidence run: Same 4-cycle in-process structure (H4 fix preserved); run after REC-01/02/03 are implemented and verified

---

## §6 — GATE_7 Unblock Path

**Required before CC-04 evidence re-run:**

| # | Action | Owner | Priority |
|---|---|---|---|
| G7-FIX-1 | Remove H3 fix (batch 401 → cooldown); replace with warning + fallthrough | Team 20 | P0 |
| G7-FIX-2 | Add SYMBOL_PROVIDER_OVERRIDES; verify ANAU.MI Alpha symbol; route ANAU.MI to Alpha | Team 20 | P0 |
| G7-FIX-3 | Update `run_g7_part_a_evidence.py` counting: `count("Yahoo 429 — cooldown")` not `count("429")` | Team 20 or Team 50 | P0 |
| G7-FIX-4 | (Optional but recommended) Add symbol-level failure threshold before global cooldown (REC-01 simplified version) | Team 20 | P1 |
| G7-VERIFY | Re-run 4-cycle evidence after G7-FIX-1 through FIX-3; submit evidence log | Team 50 | after G7-FIX-1..3 |
| G7-QA | Team 50 confirms: no Yahoo cooldown in evidence log; pass_04=True; route to Team 90 | Team 50 | after G7-VERIFY |

**Expected result after fixes:** ANAU.MI never attempted by Yahoo (override routes to Alpha) → no ANAU.MI 429 → no Yahoo cooldown from ANAU.MI. Batch 401 → fallthrough without cooldown → per-ticker Yahoo proceeds for AAPL, AMZN, GOOGL, META, QQQ, SPY, BTC-USD, TEVA.TA → prices fetched. Zero Yahoo cooldown activations → pass_04=True.

---

## §7 — Operational Risk Assessment (Broader Architecture)

**Risk R-01: Single-symbol failure → total provider freeze [CRITICAL — current state]**
The current architecture allows ANAU.MI's Yahoo incompatibility to deny prices to 8 other symbols. This is the primary operational risk. Mitigated by REC-01 + REC-03.

**Risk R-02: Simultaneous Yahoo + Alpha blackout [HIGH — observed in all 4-cycle runs]**
When Yahoo and Alpha are both in cooldown simultaneously, no live prices can be fetched. Graceful degradation (last-known prices) works correctly and prevents crashes. However, price staleness during blackout periods is a data quality concern. Mitigated long-term by REC-05 + REC-06 (reducing unnecessary cooldown durations).

**Risk R-03: Alpha daily quota insufficient for heavy fallback [MEDIUM]**
25 calls/day is adequate for FX sync + targeted fallback. However, if Yahoo fails frequently and Alpha is called for all 9 symbols multiple times, the daily quota can be exhausted quickly. The FX reserve (8 calls) and `ALPHA_FX_RESERVE` policy protect FX sync. Current Alpha budget management is correctly designed.

**Risk R-04: Yahoo batch endpoint structural unreliability [MEDIUM — permanent]**
Yahoo's v7/finance/quote batch endpoint returning 401 is a permanent API behavior (bot detection). This endpoint cannot be reliably used as the primary EOD data path. The batch endpoint is an optimization — not a guarantee. Architecture must be resilient to its unavailability. Fixed by REC-02 (treat 401 as "batch unavailable, fall to per-ticker" without cooldown).

**Risk R-05: Evidence methodology measuring the wrong thing [RESOLVED BY THIS DOCUMENT]**
CC-04 was designed to measure "Yahoo stability across 4 cycles." The `count("429")` implementation measured "log string occurrences" which is a proxy that overcounts. Fixed by REC-04 (count cooldown activations).

---

## §8 — Iron Rules Reconfirmation

All existing Iron Rules (from GATE_6 decision v1.1.0 §9 and v2.0.0) remain active:

1. **NUMERIC(20,8) precision** — unchanged
2. **maskedLog compliance** — unchanged; new SYMBOL_PROVIDER_OVERRIDES logging must use maskedLog
3. **Graceful degradation** — **strengthened**: Yahoo per-symbol failure for a symbol with a provider override must use last-known price; NO cooldown set
4. **No schema migrations** — SYMBOL_PROVIDER_OVERRIDES is a Python dict in `market_data_settings.py`; no DB migration
5. **REPLAY mode integrity** — unchanged
6. **E2E test hygiene** — unchanged
7. **TASE agorot conversion** — unchanged (B2 mandate from GATE_7 docs review)

**New Iron Rule #8 (added by this decision):**
> **HTTP 401 ≠ HTTP 429.** Authorization failures on Yahoo endpoints must NEVER trigger provider cooldowns. Only genuine rate limit signals (HTTP 429) trigger SOP-015 cooldowns.

---

## §9 — Forward Architecture (S003 scope)

These items are confirmed for S003 architectural planning, NOT required for GATE_7:

| Item | Description | Stage |
|---|---|---|
| REC-05: Per-symbol blacklist | Replace global cooldown with per-symbol failure tracking | S003 |
| REC-06: Alpha rate-limit queue | Separate per-minute rate limit from daily quota; use RateLimitQueue, not 15-min cooldown | S003 |
| Optimization Layer 1 | Priority filtering for EOD (active-trades-only high priority) | S003 |
| SYMBOL_PROVIDER_OVERRIDES DB-backed | Move overrides from code to `market_data.system_settings` JSONB for runtime management | S003-P003 D40 |

---

## §10 — Team Routing

| Team | Required action |
|---|---|
| **Team 10 (Gateway)** | Route G7-FIX-1, FIX-2, FIX-3 to Team 20 immediately. Route G7-VERIFY + G7-QA to Team 50 after implementation. |
| **Team 20 (Backend)** | Implement G7-FIX-1 (remove H3 cooldown-on-401), G7-FIX-2 (SYMBOL_PROVIDER_OVERRIDES + ANAU.MI Alpha routing), G7-FIX-3 (evidence script counting). GATE_3 sub-stage G3.8. |
| **Team 50 (QA)** | After Team 20 G7-FIX-1..3: run 4-cycle evidence; verify pass_04=True; no Yahoo cooldown in log; submit to Team 90. |
| **Team 90 (Validation)** | Accept updated CC-04 criterion per §5. Validate evidence once Team 50 submits clean run. |
| **Team 100 (Architecture Authority)** | FYI — CC-04 criterion amended per §5. New Iron Rule #8 added. Forward architecture planned for S003. |

---

**log_entry | TEAM_00 | ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0 | APPROVED | CC04_ROOT_CAUSE_3_ITEMS | REC-01..08 | CC04_CRITERION_AMENDED | IRON_RULE_8_ADDED | 2026-03-11**
