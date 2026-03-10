---
project_domain: TIKTRACK
id: TEAM_00_TO_TEAM_90_MARKET_DATA_CLEANUP_RESPONSE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 90 (External Validation Unit)
cc: Team 10 (Gateway Orchestration), Team 20 (Backend), Team 60 (Infrastructure), Team 170 (Documentation)
date: 2026-03-10
status: APPROVED
gate_id: GOVERNANCE_PROGRAM
program_id: S002-P002
in_response_to: TEAM_90_TO_TEAM_00_TICKER_UNIVERSE_IMMEDIATE_CLEANUP_AND_REVALIDATION_REPORT_v1.0.0
---

# TEAM 00 — RESPONSE TO TEAM 90 CLEANUP AND REVALIDATION REPORT

---

## §1 APPROVAL OF IMMEDIATE CLEANUP

**The immediate cleanup executed by Team 90 is APPROVED as a valid emergency hygiene action.**

The following was confirmed clean and correctly applied:
- 6 invalid/test/duplicate ticker rows deactivated (`status=cancelled`, `is_active=false`, `deleted_at=NOW()`)
- 4 linked `user_tickers` rows cascade-cancelled
- Post-cleanup universe: 9 valid active tickers, 0 without price data, 0 duplicates

This action is formally recorded as an authorized emergency hygiene operation within S002-P002 scope.

---

## §2 RECOMMENDATION REVIEW — ALL 6 ITEMS

### Rec 1 — Symbol Eligibility Gate (APPROVED — NEW MANDATE)

**Status: APPROVED. Added to ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0.md §5.**

The cleanup revealed that test/invalid symbols (`BATCH4PAR870000`, `INVALID999E2E`, `ככככ`) were admitted to the active universe without provider validation. This is a structural gap.

**Mandate (effective immediately):**
No ticker may be set `is_active=true` in `market_data.tickers` without first confirming at least one provider returns a valid, non-zero price for the symbol. This gate applies to: manual activation, E2E test teardown, admin UI (D40), any bulk import path.

**Implementation scope:** `api/services/` ticker activation endpoint or background job. Team 10 routes to Team 20.

---

### Rec 2 — Budget-Aware Alpha Orchestration (APPROVED — NEW MANDATE)

**Status: APPROVED. Added to ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0.md §6.**

**Critical finding confirmed:** Alpha Vantage imposes a **daily request quota** (not just a per-minute rate limit). When daily quota is exhausted, Alpha returns a fixed response string (not HTTP 429):
```
{"Information": "Thank you for using Alpha Vantage!..."}
```

The current `provider_cooldown.py` sets a 15-minute cooldown on ANY `_is_429()` exception. This is fundamentally wrong for Alpha quota exhaustion — a 15-minute cooldown causes the system to retry Alpha 96 times per day even after daily quota is spent, wasting API calls and generating log noise.

**Mandate:**
- Yahoo 429 → standard cooldown (15 min, in-memory, current behavior is correct)
- Alpha quota-exhausted → **24-hour cooldown** until next midnight UTC (or configurable `alpha_daily_quota_cooldown_hours`)
- `alpha_provider.py` must detect the quota-exhausted response body pattern and call a separate `set_cooldown()` with the long duration
- `_is_429()` helper in `sync_intraday.py` must distinguish between Yahoo rate-limit and Alpha quota-exhausted to route to appropriate cooldown duration

**Note on Rec 4 (DB-persisted cooldown):** For Yahoo 429s, in-memory cooldown is acceptable — Yahoo 429s are short-duration and the current single-process APScheduler architecture maintains state across cycles. However, the Alpha quota exhaustion mandate above effectively requires a longer-duration persistence mechanism. Team 10 may implement this as a `market_data.system_settings` key (e.g., `alpha_cooldown_until: 2026-03-11T00:00:00Z`) rather than a new table. This is sufficient for the P1 fix scope.

---

### Rec 3 — Policy-Based Refresh Priority (ALREADY COVERED)

**Status: ALREADY MANDATED in ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0.md §3.1 (Layer 1).**

Policy-based refresh priority is the centerpiece of Layer 1 of the market data directive. The legacy pattern (active_trades → 5 min; no_active_trades → 60 min; off_hours → 60 min) is mandated for implementation.

**Additional note from code review:** `market_data_settings.py` already implements `get_off_hours_interval_minutes()` and `get_current_cadence_minutes()` — these settings exist in the DB and control the APScheduler job cadence. The gap is that within a job run, ALL active tickers are fetched unconditionally regardless of their individual priority. Layer 1 fixes this by filtering tickers before the fetch loop, not just controlling how often the job runs.

---

### Rec 4 — DB-Persisted Cooldown State (PARTIALLY ADDRESSED)

**Status: PARTIALLY ADDRESSED via Rec 2 mandate above.**

For the critical failure mode (Alpha daily quota), DB-persisted cooldown is mandated via `system_settings` key. For Yahoo 429s (short-duration, in-process), in-memory state is acceptable in the single-worker APScheduler architecture.

Full DB persistence for all cooldowns is deferred to post-S002 infrastructure hardening (low urgency once batch fetch is in place, as 429s will be near-zero).

---

### Rec 5 — Market-Cap Completion for 4 Symbols (APPROVED — TRACKED ITEM)

**Status: APPROVED. Added to S002 closure package as tracked operational item.**

Remaining market_cap gaps: `AAPL`, `ANAU.MI`, `BTC-USD`, `TEVA.TA`

**Note on AAPL:** AAPL is currently `is_active=false` (status: pending). Market-cap completion for AAPL is deferred until AAPL is reactivated.

**For the 3 active symbols without market_cap (ANAU.MI, BTC-USD, TEVA.TA):**
- Team 20 investigates why market_cap is not populating for these symbols
- Acceptance KPI: `market_cap IS NOT NULL` for all active tickers after 1 successful EOD sync cycle
- Non-blocking for S003 activation; tracked as S002-P002 carry-over health item

---

### Rec 6 — UI price_source Rendering Check (APPROVED — MINOR)

**Status: APPROVED. Assigned to Team 60 (D22/D33 UI check).**

Team 90 confirmed: backend returns `price_source` field where `current_price` exists. The visual refresh consistency of the ticker grid (`last_price`, `last_change`, `price_source`) requires a focused check on:
- D22 (tickers admin page): does the table row refresh correctly when background sync runs?
- D33 (user_tickers page): live price column — does staleness state display correctly?

This is a UI/UX polish check, not a backend fix. Team 60 owns the check; findings route back to Team 10 if code changes are needed. Non-blocking for current gate state.

---

## §3 IMPLEMENTATION ROUTING (TEAM 10)

The following new work items are routed to Team 10 for implementation by Team 20:

| Item ID | Description | Priority | Reference |
|---|---|---|---|
| MD-NEW-1 | Symbol eligibility gate (provider validation before `is_active=true`) | P1 | Directive §5 |
| MD-NEW-2 | Alpha quota-exhausted detection → 24h cooldown | P1 | Directive §6 |
| MD-NEW-3 | Market-cap completion for ANAU.MI, BTC-USD, TEVA.TA | P2 | This document §2 Rec 5 |

These items join the existing Layer 1 + Layer 2 implementation scope from the directive.

Team 60: UI price_source check (D22 + D33) — assign as minor review task.

---

## §4 UPDATED S002-C2 SCOPE

The S002-C2 item in `TEAM_00_S002_FAST_TRACK_CLOSURE_PACKAGE_v1.0.0.md` is hereby expanded to include MD-NEW-1 and MD-NEW-2 alongside the original Layer 1 (priority filter) and Layer 2 (batch fetch) mandates.

Full implementation scope for S002-C2:
1. Layer 1: Priority filter (active-trades + market-hours awareness) — `sync_intraday.py`
2. Layer 2: Multi-symbol batch fetch (v7/finance/quote) — `yahoo_provider.py`
3. MD-NEW-1: Symbol eligibility gate — ticker activation path
4. MD-NEW-2: Alpha quota-exhausted → 24h cooldown — `alpha_provider.py` + `provider_cooldown.py`

---

**log_entry | TEAM_00 | TO_TEAM_90 | MARKET_DATA_CLEANUP_RESPONSE_v1.0.0 | APPROVED_CLEANUP_ALL_6_RECS_ADDRESSED | 2026-03-10**
