---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_00_S002_FAST_TRACK_CLOSURE_PACKAGE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 10 (Gateway Orchestration), Team 90 (Validation Owner), Team 100 (Development Architecture Authority), Team 170 (Documentation)
cc: Team 20 (Backend), Team 50 (QA), Team 60 (Infrastructure), Team 190 (Constitutional Validator)
date: 2026-03-10
status: ISSUED — READY FOR TEAM 10 INTAKE
scope: S002_ALL_REMAINING_ITEMS_FAST_TRACK_CLOSURE
---

# TEAM 00 — S002 FAST-TRACK CLOSURE PACKAGE
## "זנבות שחייבים לסגור" — All S002 Remaining Items

---

## §1 PURPOSE

This package issues all remaining S002 closure actions as a single coordinated communication. It contains four items: one requires **new development work** (S002-C2, with a full LOD400 spec), three are **governance-only actions** (no development).

**Goal:** Reach S002 full DOCUMENTATION_CLOSED state before S003 activation.

---

## §2 S002 OPEN ITEMS — MASTER INVENTORY

| Item ID | Type | Description | Owner | Blocking S003? |
|---|---|---|---|---|
| **S002-C1** | Governance + Light Validation | S002-P002 Price Reliability: GATE_7 → GATE_8 | Team 90 → Team 00 | YES |
| **S002-C2** | Development (LOD400 issued) | Market Data Provider Hardening (WP003) | Team 10 → Team 20 | YES |
| **S002-C3** | Governance (doc edit only) | S002-P004 Registry anomaly → ABSORBED | Team 170 | YES |
| **S002-C4** | Decision (pending) | S001-P002 Alerts Widget placement | Team 100 | NO (parallel) |

---

## §3 S002-C1 — PRICE RELIABILITY: GATE_7 → GATE_8

### Background
WSM (2026-03-09): `active_flow = S002-P002 (Price Reliability 3-phase final approval)` — GATE_7 VALIDATION_ACTIVE.
Team 190 revalidation PASS (v1.0.1, 2026-03-09): BF-01/02/03 all CLOSED.

### GATE_7 Scope and Authority

S002-P002 is an infrastructure+evidence-governance delivery (not a UX page). GATE_7 for this program = architect completeness review (not Nimrod browser sign-off).

**GATE_7 Decision Authority:** Team 00 (Chief Architect) — Team 00 acts as approver.

**Team 90 must:**
1. Confirm Price Reliability 3-phase deliverables (Phase 1/2/3) match GATE_2 approved scope
2. Confirm runtime evidence chain is deterministic (Phase 1: unit, Phase 2: integration, Phase 3: price reliability scripts)
3. Confirm no outstanding blocking findings from Team 190 revalidation

**Team 90 deliverable:** Issue `GATE_7_VALIDATION_REPORT_S002_P002_PRICE_RELIABILITY_v1.0.0.md` to `_COMMUNICATION/_ARCHITECT_INBOX/`.

Upon receipt → Team 00 issues GATE_7 decision within the same session.

### GATE_8 Closure (after GATE_7 PASS)

| Artifact | Owner | Path |
|---|---|---|
| S002-P002 lifecycle summary (final program report) | Team 170 | `documentation/reports/05-REPORTS/` |
| WSM update: S002-P002 → DOCUMENTATION_CLOSED | Team 90 | WSM CURRENT_OPERATIONAL_STATE block |
| Program Registry: S002-P002 → COMPLETE | Team 170 | PHOENIX_PROGRAM_REGISTRY_v1.0.0.md |

---

## §4 S002-C2 — MARKET DATA PROVIDER HARDENING (WP003)

### LOD400 Specification

**Full execution-ready specification:** `_COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P002_WP003_MARKET_DATA_HARDENING/LOD400_v1.0.0.md`

This is the SSOT for Team 10 and Team 20. All implementation decisions are locked in that document.

### Work Package Identity

| Field | Value |
|---|---|
| WP ID | S002-P002-WP003 |
| Gate entry | GATE_0 (LOD400 = GATE_0 package) |
| Validation | Team 50 (GATE_4) → Team 90 (GATE_5) |
| Architecture authority | Team 00 — this document |

### Summary of 4 Required Fixes (full detail in LOD400)

**FIX-1 — Priority-Based Refresh Filter (`sync_intraday.py`)**
- Root cause of rate limits: ALL active tickers fetched unconditionally every cycle
- Fix: 3-tier priority (FIRST_FETCH, HIGH, LOW) based on open trades and market hours
- Result: typical cycle fetches 2–10 tickers instead of all 50

**FIX-2 — Yahoo Multi-Symbol Batch Fetch (`yahoo_provider.py`)**
- Add `get_ticker_prices_batch()` using `v7/finance/quote?symbols=A,B,C,...`
- 50 symbols → 1 HTTP request (instead of 50)
- Also resolves market_cap gaps for ANAU.MI, BTC-USD, TEVA.TA automatically

**FIX-3 — Alpha Quota-Exhausted Long Cooldown (`alpha_provider.py` + `provider_cooldown.py`)**
- Alpha returns `None` silently on quota exhaustion → no cooldown set → 9×12.5s blocked retries per cycle
- Fix: raise `AlphaQuotaExhaustedException` → catch in sync → set 24-hour cooldown, persist to DB

**FIX-4 — Eligibility Gate on Ticker Re-Activation (`tickers_service.py`)**
- CREATE path already has live validation (existing `canonical_ticker_service.py`)
- UPDATE path missing validation when `is_active` transitions `false → true`
- Fix: call `validate_ticker_with_providers()` before setting `is_active=True` in `update_ticker()`

### Key Architectural Decisions (Locked — Not Open for Re-Discussion)

| Decision | Value |
|---|---|
| New ticker with no price data | Always fetch regardless of off-hours or priority |
| `max_symbols_per_request` default | Update from 5 → **50** |
| Eligibility gate mode | **Synchronous** — block until validated; raise 422 on fail |
| Trade status field | `user_data.trades.status = 'ACTIVE'` (uppercase VARCHAR) |
| Alpha quota cooldown duration | **24 hours** (configurable via `alpha_quota_cooldown_hours` setting, range 6–48) |
| Alpha cooldown persistence | `market_data.system_settings` key `alpha_cooldown_until` |

### Validation Evidence Required (GATE_5)

Team 50 must produce evidence artifacts EV-WP003-01 through EV-WP003-10 per LOD400 §8. Full acceptance criteria in LOD400.

### Closure Condition for S002-C2

S002-C2 is CLOSED when:
- Team 50 (GATE_4): all 10 evidence artifacts pass
- Team 90 (GATE_5): validation report issued, no blocking findings
- WP003 documentation included in S002-P002 GATE_8 package (Team 170)

---

## §5 S002-C3 — S002-P004 REGISTRY GOVERNANCE CLOSURE

### Background

S002-P004 (Admin Review S002) shows `status: PLANNED` in `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`. This is stale and anomalous. S002-P004 was absorbed into S003-P003 (D40 — System Management) per `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md` §B2.

### Action — Team 170 (doc edit, same session)

Update `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` — S002-P004 row:

```
| S002 | S002-P004 | Admin Review S002 | TIKTRACK | ABSORBED |
→ Absorbed into S003-P003 (D40 System Management);
  closes when D40 GATE_8 PASS per ARCHITECT_DIRECTIVE_ADMIN_REVIEW_PROGRAM_PROTOCOL_v1.0.0.md
```

No WSM update required.

### Closure Condition

S002-C3 is CLOSED when Team 170 confirms the Registry update is committed.

---

## §6 S002-C4 — S001-P002 ALERTS WIDGET PLACEMENT (NON-BLOCKING)

### Background

`TEAM_00_TO_TEAM_100_S001_P002_LOD200_AND_ROUTING_v1.0.0.md` issued 2026-03-04. Team 100 placement decision is pending (6+ days).

### Options

| Option | Description | Team 00 Recommendation |
|---|---|---|
| **Option A** | D15.I only — alerts widget in data_dashboard sidebar | ✓ RECOMMENDED |
| Option B | New standalone alerts page (D15.II) | More scope, less priority |
| Option C | Embedded panel on multiple dashboard pages | Most scope, least priority |

### Action — Team 100

Issue placement decision (Option A, B, or C) to `_COMMUNICATION/_ARCHITECT_INBOX/`.

Upon receipt:
- Team 10 packages GATE_0 for S001-P002
- S001-P002 status: PIPELINE → ACTIVE

### Non-Blocking Status

S002-C4 does NOT block S003 activation. If Team 100 placement decision is not issued within 3 additional business days of this package, Team 00 will issue S003 activation notice regardless and treat S001-P002 as running in parallel.

---

## §7 S002 CLOSURE SEQUENCE

```
IMMEDIATE (2026-03-10, same day)
  ├── S002-C3: Team 170 — Registry edit, S002-P004 → ABSORBED
  ├── S002-C4: Team 100 — Issue placement decision (Option A/B/C)
  └── S002-C2: Team 10 — GATE_0 intake of WP003 LOD400, route to Team 20

DEVELOPMENT TRACK (S002-C2)
  ├── Team 20 implements FIX-1 + FIX-2 + FIX-3 + FIX-4
  ├── Team 50 GATE_4: EV-WP003-01..10 evidence production
  └── Team 90 GATE_5: validation report → no blocking findings

GOVERNANCE TRACK (S002-C1)
  ├── Team 90: GATE_7 validation report → Team 00 inbox
  ├── Team 00: GATE_7 decision issued
  ├── Team 90: opens GATE_8
  └── Team 170: S002-P002 final lifecycle docs → DOCUMENTATION_CLOSED

S002 FULL CLOSURE (when both tracks complete)
  ├── WSM: S002-P002 → DOCUMENTATION_CLOSED; active_stage transitions to S003
  └── Team 00: issues S003 activation notice
```

---

## §8 S003 ACTIVATION PRECONDITIONS

| Precondition | Item | State |
|---|---|---|
| S002-P002 Price Reliability: GATE_8 PASS | S002-C1 | Pending |
| WP003 Market Data Hardening: Team 90 GATE_5 PASS | S002-C2 | Pending |
| S002-P004: Registry updated to ABSORBED | S002-C3 | Pending |
| S001-P002 placement decision | S002-C4 | Non-blocking |

**S003 will not be activated until S002-C1, S002-C2, and S002-C3 are all complete.** S002-C4 runs in parallel and does not gate S003 activation.

---

## §9 STANDING DECISIONS RECONFIRMED

| Decision | Reference |
|---|---|
| S002-P004 absorbed into D40 | ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md §B2 |
| Admin Review Protocol = Iron Rule | ARCHITECT_DIRECTIVE_ADMIN_REVIEW_PROGRAM_PROTOCOL_v1.0.0.md |
| S003 program order: P003→P004→P005→P006 | Session lock 2026-03-04 |
| PyJWT + mypy KB-006: S003 setup tasks before feature work | Session lock 2026-03-04 |
| Market data batch fix is P1 prerequisite for D33 live price | LOD400 §9 Authority note |
| Team 90 cleanup (invalid tickers) approved | TEAM_00_TO_TEAM_90_MARKET_DATA_CLEANUP_RESPONSE_v1.0.0.md |

---

**log_entry | TEAM_00 | S002_FAST_TRACK_CLOSURE_PACKAGE_v1.0.0 | ISSUED | ALL_S002_REMAINING_ITEMS | 2026-03-10**
**log_entry | TEAM_00 | S002_FAST_TRACK_CLOSURE_PACKAGE_v1.0.0 | UPDATED_v2 | LOD400_WP003_REFERENCED + FULL_ROUTING_COMPLETE | 2026-03-10**
