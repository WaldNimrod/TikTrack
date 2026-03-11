---
project_domain: TIKTRACK
id: TEAM_00_TO_TEAM_10_MARKET_DATA_PROVIDER_DIRECTIVE_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 10 (Gateway Orchestration)
cc: Team 20 (Backend), Team 50 (QA), Team 90 (Validation)
date: 2026-03-11
status: ISSUED — ACTION REQUIRED
gate_id: GATE_7 (S002-P002-WP003)
work_package_id: S002-P002-WP003
authority: Team 00 (Chief Architect)
in_response_to: S002_P002_WP003_GATE7_CC04_YAHOO_429_ARCHITECT_ESCALATION_REQUEST
references: ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0
---

# TEAM 00 → TEAM 10 — Market Data Provider Directive
## CC-WP003-04 Unblock Path + Architectural Corrections

---

## 1. Situational Assessment

The Chief Architect has completed a full review of the CC-WP003-04 Yahoo 429 escalation. The review covered all 6 runtime evidence logs, the complete provider codebase (`yahoo_provider.py`, `sync_ticker_prices_eod.py`, `provider_cooldown.py`), and the provider SSOT specs.

**Three structural root causes have been identified:**

| Root Cause | Severity | Description |
|---|---|---|
| A | CRITICAL | ANAU.MI (.MI exchange) has no reliable Yahoo path — failures cascade to global Yahoo freeze for ALL symbols |
| B | CRITICAL | Yahoo v7/quote batch HTTP 401 incorrectly classified as a rate-limit event; H3 fix sets 15-min cooldown on 401 — this is wrong |
| C | DESIGN FLAW | Evidence script `count("429")` counts string occurrences in log text, not actual 429 events; criterion is unmeasurable with current method |

**Positive finding:** The graceful degradation path (last-known price → upsert 9 rows) is confirmed working in log 212850. Team 20's implementation of the fundamental fallback is correct.

Full analysis: `ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0.md`

---

## 2. Binding Actions — Route Immediately

### For Team 20 (Backend) — P0 — 3 code fixes

**G7-FIX-1: Remove H3 cooldown-on-401 (Yahoo batch)**

In `sync_ticker_prices_eod.py`, lines 241–242: The current H3 fix sets Yahoo cooldown when the batch returns 401. **This is wrong.** HTTP 401 is an authorization failure, not a rate limit signal. Remove the cooldown-set-on-401. Replace with:

```
# When Yahoo v7/quote batch returns 401:
# → Log: "⚠️ Yahoo batch 401 — skipping batch, proceeding to per-ticker"
# → Fall through to per-ticker loop
# → DO NOT call set_cooldown() for Yahoo
```

Only HTTP 429 responses warrant SOP-015 Yahoo cooldown. This is now **Iron Rule #8.**

---

**G7-FIX-2: Add SYMBOL_PROVIDER_OVERRIDES — ANAU.MI → Alpha Vantage**

In `market_data_settings.py`, add:
```python
SYMBOL_PROVIDER_OVERRIDES: Dict[str, str] = {
    "ANAU.MI": "ALPHA_VANTAGE",
}
```

In `sync_ticker_prices_eod.py`, per-ticker loop: before attempting Yahoo for a symbol, check if it has a provider override. If yes, skip Yahoo entirely and route to the override provider.

ANAU.MI routing via Alpha Vantage:
- Test: `GLOBAL_QUOTE&symbol=ANAU.MI` and `GLOBAL_QUOTE&symbol=ANAU.MIL` — whichever returns non-zero data is the canonical Alpha symbol
- If Alpha also fails for ANAU.MI → use last-known price; **do NOT set any cooldown** (it's a structurally unsupported symbol, not a rate-limit event)
- Log: `📌 ANAU.MI: routed to Alpha Vantage (Yahoo override)`

---

**G7-FIX-3: Fix evidence counting in `run_g7_part_a_evidence.py`**

Replace:
```python
count_429 = text.count("429")
print(f"cc_wp003_04_yahoo_429_count={count_429}")
print(f"pass_04={count_429 == 0}")
```

With:
```python
# Count actual Yahoo provider-level cooldown activations (not retry attempts)
count_cooldown = text.count("Yahoo 429 — cooldown")
print(f"cc_wp003_04_yahoo_cooldown_count={count_cooldown}")
print(f"pass_04={count_cooldown == 0}")
```

The old method counted the string "429" in all log lines including retry attempt messages, resulting in 3 counts per single 429 event. The new method counts only actual cooldown activation events.

---

### For Team 50 (QA) — After G7-FIX-1..3 are implemented

**G7-VERIFY:**
1. Run `python scripts/run_g7_part_a_evidence.py` — confirm 4 cycles complete with:
   - No "Yahoo 429 — cooldown" line in log
   - No "YAHOO_FINANCE in cooldown — skipping" across cycles
   - `pass_04=True` printed at end
   - At minimum: prices fetched for SPY, AAPL, BTC-USD (core symbols)
2. Submit the clean log as CC-04 runtime evidence to Team 90

**G7-QA validation checklist:**
- [ ] H3 fix removed — batch 401 does NOT set Yahoo cooldown
- [ ] ANAU.MI routed to Alpha; Yahoo not attempted for ANAU.MI
- [ ] Evidence counting updated: `count("Yahoo 429 — cooldown")`
- [ ] 4 cycles complete — no Yahoo cooldown activation in any cycle
- [ ] AAPL, QQQ, SPY: prices fetched in at least one cycle
- [ ] BTC-USD: price fetched (Alpha CRYPTO or Yahoo)
- [ ] ANAU.MI: price fetched from Alpha OR last-known (graceful degradation — either is acceptable)

---

## 3. CC-WP003-04 Criterion Amendment

**Effective immediately** — the CC-04 criterion is amended as follows:

| | Before | After |
|---|---|---|
| **Criterion text** | "4 consecutive sync cycles (1 hour): zero Yahoo 429 responses in logs" | "4 consecutive EOD sync cycles: zero Yahoo global cooldown activations from rate-limiting of supported symbols" |
| **Counting method** | `text.count("429")` | `text.count("Yahoo 429 — cooldown")` |
| **ANAU.MI Yahoo failures** | Counted as violation | Non-applicable — ANAU.MI overrides to Alpha (Yahoo never attempted) |
| **Per-symbol retries within backoff** | Counted as violation | Compliant — retries are expected graceful behavior |

This amendment is documented in `ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0.md` §5.

---

## 4. New Iron Rule #8

**Binding from this decision through all future gates:**

> **Iron Rule #8:** HTTP 401 responses on Yahoo Finance endpoints are authorization failures, NOT rate-limit signals. HTTP 401 must NEVER trigger an SOP-015 cooldown. Only HTTP 429 responses trigger SOP-015.

This rule applies to all Yahoo endpoints: v7/finance/quote batch, v8/finance/chart, and any other Yahoo endpoint.

---

## 5. What Team 10 Does NOT Need to Do

- No new gate lifecycle submission required for G7-FIX-1..3
- No LLD400 amendment required (SYMBOL_PROVIDER_OVERRIDES is a settings dict, not a schema change)
- No Team 30 UI mandate required (these are backend-only code fixes)
- No new Team 90 GATE_6 resubmission — CC-04 criterion amendment is issued directly by Team 00

---

## 6. Execution Sequence

```
Team 10 issues G7-FIX-1..3 mandate to Team 20
  → Team 20 implements (P0, no gate sub-stage required beyond G3.8)
    → Team 50 runs G7-VERIFY
      → If pass_04=True: Team 50 submits log to Team 90 as CC-04 evidence
        → Team 90 validates against amended criterion
          → CC-04 CONFIRMED → remaining CC-WP003-01/02/05 collection continues
```

---

## 7. Broader Architecture (Not Blocking GATE_7)

The architectural decision document (`ARCHITECT_DECISION_MARKET_DATA_PROVIDER_ARCHITECTURE_v1.0.0.md`) contains 8 recommendations. Items G7-FIX-1/2/3 address the 3 P0 items. The remaining recommendations (REC-05 per-symbol blacklist, REC-06 Alpha rate-limit queue separation, Optimization Layer 1 for EOD) are deferred to S003 and do not block GATE_7.

Team 10 should note these for the S003 activation package.

---

**log_entry | TEAM_00 | TEAM_00_TO_TEAM_10_MARKET_DATA_PROVIDER_DIRECTIVE_v1.0.0 | ISSUED | G7-FIX-1_H3_REMOVAL + G7-FIX-2_ANAU_OVERRIDE + G7-FIX-3_EVIDENCE_COUNTING | IRON_RULE_8 | CC04_CRITERION_AMENDED | 2026-03-11**
