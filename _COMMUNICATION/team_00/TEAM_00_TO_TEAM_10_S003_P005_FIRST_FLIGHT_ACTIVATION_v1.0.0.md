---
id: TEAM_00_TO_TEAM_10_S003_P005_FIRST_FLIGHT_ACTIVATION_v1.0.0
historical_record: true
from: Team 00 (Principal)
to: Team 10 (TikTrack Gateway / Execution Lead)
cc: Team 100 (Chief Architect), Team 11 (AOS Gateway — observing), Team 20 (Backend),
    Team 30 (Frontend), Team 50 (QA), Team 60 (DevOps)
date: 2026-03-29
type: ACTIVATION — First production run through AOS v3
program: S003-P005
work_package: S003-P005-WP001
page: D26 (watch_lists)
pipeline_variant: TRACK_FULL
aos_version: v3
aos_port: 8090
branch_governance: Team 191
monitoring: ENHANCED (dual-track — first flight)---

# S003-P005-WP001 — D26 Watch Lists
## First Flight Activation through AOS v3

---

## §1 — Context: Why This Is the First Flight

This is the **first real production work package** to run through AOS v3. The system is operational and tested, but this is its first real-world deployment. Two objectives run in parallel:

| Track | Objective |
|---|---|
| **A — TikTrack delivery** | Build D26 Watch Lists page; full S003 scope; GATE_5 = page live |
| **B — AOS v3 learning** | Monitor pipeline behavior at each gate; capture improvement candidates for v3.1 |

**Enhanced monitoring** is active for this flight. Team 10 coordinates with Team 11 (AOS Gateway observer) at each gate.

---

## §2 — Entry Prerequisites

Before Team 10 opens Gate 0:

| # | Prerequisite | Owner | Status |
|---|---|---|---|
| 1 | LOD200 for D26 approved by Team 100 | Team 00/110 | **DONE** (Principal mandate 2026-03-31) |
| 2 | DDL confirmation from Team 110 | Team 110 | **DONE** (no delta required; confirmed 2026-03-31) |
| 3 | Feature branch created by Team 191 | Team 191 | **DONE** (first flight on aos-v3 branch; feature branch deferred to GATE_1 per Principal) |

**All 3 prerequisites confirmed. Run may be created.**

---

## §3 — Layer 1: Identity

**Team 10 = TikTrack Gateway / Execution Lead**

You orchestrate the BUILD of D26 Watch Lists. Your responsibilities:
- Create the S003-P005-WP001 run in AOS v3 via `POST /api/runs`
- Distribute activation packages to Teams 20, 30, 50, 60
- Manage gate sequence GATE_0 → GATE_5
- Maintain `AOS_V3_FLIGHT_01_LOG.md` — one entry per gate (Track B observations)
- Report to Team 100 (Gate 2 approval) and Team 00 (Gate 4 UX + Gate 5 closure)

**AOS v3 interface:**
- Base URL: `http://localhost:8090/api/`
- Run management: `POST /api/runs`, `POST /api/runs/{id}/advance|fail|approve`
- State: `GET /api/state`
- SSE: `GET /api/events/stream` (subscribe for real-time events)
- Portfolio: `GET /api/work-packages`, `GET /api/ideas`

---

## §4 — Layer 2: Iron Rules

| # | Rule |
|---|---|
| IR-1 | `display_name` Iron Rule — NEVER show raw ticker symbol anywhere in D26 |
| IR-2 | `collapsible-container` page template — Iron Rule for ALL pages |
| IR-3 | 4-state status model (pending/active/inactive/cancelled) |
| IR-4 | NUMERIC(20,8) for all financial values |
| IR-5 | maskedLog mandatory in all backend logs |
| IR-6 | Max 50 tickers per watchlist; max 20 watchlists per user |
| IR-7 | D26 ticker lookup-only — no ticker creation (use D22 if ticker doesn't exist) |
| IR-8 | AOS v3 Flight Log — Team 10 appends Track B entry after each gate |
| IR-9 | `is_public` field reserved — S003 scope = personal watchlists only |
| IR-10 | S005 scope deferred — ATR(14), Position, P/L%, P/L, flag-color filter = out of scope |

---

## §5 — Layer 3: Current State

**Stage:** S003 (Essential Data)
**Preceding WP:** S003-P004 (D33 User Tickers) — COMPLETE 2026-03-26
**AOS v3 state:** CLEAN (post Phase 0 cleanup)
**Pipeline variant:** TRACK_FULL (Teams 10 + 20 + 30 + 50 + 60)

**D26 dependencies satisfied:**
- ✅ `user_data.watchlists` + `watchlist_items` tables migrated
- ✅ Live price infrastructure (Market Data service, D33 pattern)
- ✅ `market_data.tickers` available for lookup
- ✅ D33 backend patterns available as reference

**D26 new work:**
- `WatchLists` organism (NEW — Team 20)
- D26 frontend page (NEW — Team 30)
- 8 backend API endpoints (NEW — Team 20)

---

## §6 — Layer 4: Gate Sequence

### GATE_0 — Spec Lock + Run Created

**Owner:** Team 10
**Action:** Create run in AOS v3

```bash
curl -X POST http://localhost:8090/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "work_package_id": "S003-P005-WP001",
    "domain_id": "TIKTRACK",
    "process_variant": "TRACK_FULL"
  }'
```

**AC:**
- [ ] AOS v3 run created → `run_id` saved
- [ ] LOD200 approved (Team 100)
- [ ] DDL status confirmed (Team 110): no delta — confirmed 2026-03-31
- [ ] Feature branch created (Team 191)
- [ ] `GET /api/state` → `next_action = AWAIT_FEEDBACK` (Team 10 activation prompt received)
- [ ] Flight Log: Gate 0 entry completed

**Gate 0 advance:** `POST /api/runs/{run_id}/advance` with `{"summary": "GATE_0 PASS — spec locked, branch ready"}`

---

### GATE_1 — Backend Foundation (Team 20)

**Owner:** Team 10 → activate Team 20

**Team 20 scope:**
1. `WatchLists` organism scaffold
2. `user_data.watchlists` + `watchlist_items` repository layer
3. All 8 API endpoints (see LOD200 §6) — at minimum stub level; full implementation by Gate 2
4. GET `/api/v1/watchlists` → 200 (empty list)
5. POST `/api/v1/watchlists` → 201

**AC:**
- [ ] WatchLists organism directory created
- [ ] DB access confirmed for both tables
- [ ] All 8 endpoint routes registered (stubs or full)
- [ ] GET watchlists → 200
- [ ] POST watchlist → 201
- [ ] User-scoping: only current user's watchlists returned
- [ ] Unit tests: organism-level (Team 50 baseline)
- [ ] Flight Log: Gate 1 Track B entry

---

### GATE_2 — Full Implementation + Frontend (Team 20 + Team 30)

**Owner:** Team 10 → activate Team 30; continue Team 20

**Team 20 — complete backend:**
- All 8 endpoints fully implemented
- Live price enrichment: delegate to Market Data service (D33 pattern)
- 50-ticker limit enforced (400 on 51st)
- 20-watchlist limit enforced (400 on 21st)
- Sort order management (up/down)

**Team 30 — D26 frontend:**
- Watchlist selector (tab bar or dropdown)
- Ticker table with: display_name, price, change%, volume, up/down controls, remove button
- Add ticker modal (search by display_name or symbol)
- Create / rename / delete watchlist flows
- Client-side filter input
- Sort controls (by name, price, change%)
- Live price polling (D33 pattern)
- `collapsible-container` Iron Rule applied

**AC:**
- [ ] D26 page loads in browser
- [ ] CRUD flows all working
- [ ] Live prices displaying
- [ ] No raw symbols visible anywhere (display_name Iron Rule)
- [ ] Sort + filter functional
- [ ] Integration tests: GET/POST/PUT/DELETE watchlist + items
- [ ] Flight Log: Gate 2 Track B entry

**⚠️ MID-FLIGHT REVIEW:** Team 00 reviews Flight Log after Gate 2. Confirm continuation before Gate 3.

---

### GATE_3 — Tests (Team 50)

**Owner:** Team 10 → activate Team 50

**Team 50 scope:**
- Unit tests: WatchLists organism (all repository methods)
- Integration tests: all 8 API endpoints (including edge cases: limits, unique constraint, user-scoping)
- E2E tests: create watchlist → add tickers → live prices → reorder → delete

**AC:**
- [ ] ≥ 80% coverage on WatchLists organism
- [ ] All integration tests PASS
- [ ] Live price refresh tested
- [ ] 50-ticker limit tested (boundary condition)
- [ ] 20-watchlist limit tested
- [ ] User isolation tested (cannot access other user's watchlists)
- [ ] Flight Log: Gate 3 Track B entry

---

### GATE_4 — Principal UX Review

**Owner:** Team 00 (Principal) — personal approval gate

**What the Principal reviews:**
- Live D26 page in browser
- Full user flow: create watchlist → add tickers → view live prices → remove ticker → delete watchlist
- UI quality against phoenix design standards
- display_name Iron Rule compliance
- Mobile/responsive behavior (if applicable)

**Gate 4 advance:** `POST /api/runs/{run_id}/approve` (human approval endpoint)
**Gate 4 FAIL:** `POST /api/runs/{run_id}/fail` with reason → correction cycle with Team 30

**AC:**
- [ ] Principal approves UI/UX
- [ ] No raw symbols visible
- [ ] Live prices working in review environment
- [ ] All requested iterations from review completed
- [ ] Flight Log: Gate 4 Track B entry (Operator Handoff quality)

---

### GATE_5 — E2E + PR Merge

**Owner:** Team 10 → activate Team 50 + Team 60

**Team 50:** Full E2E test suite execution
**Team 60:** PR preparation + merge to main + post-merge verification

**AC:**
- [ ] All tests PASS (unit + integration + E2E)
- [ ] PR merged to main
- [ ] D26 accessible at `/watch_lists`
- [ ] `pipeline_state.json` clean after run COMPLETE
- [ ] Flight Log: Gate 5 Track B entry
- [ ] Team 170 notified for S003-P005 registry closure
- [ ] Team 100 receives Flight Log for post-flight debrief

---

## §7 — Flight Log Responsibility

Team 10 is the custodian of `_COMMUNICATION/team_00/AOS_V3_FLIGHT_01_LOG.md`.

After each gate, add entry including:
1. Gate result (PASS/FAIL/CORRECTION)
2. Gate timing
3. **Track B observations** (next_action accuracy, FIP mode used, SSE events, Operator Handoff quality, friction points)
4. Improvement candidates for AOS v3.1

This is the primary learning artifact from this flight. Quality matters.

---

## §8 — Escalation Path

| Issue | Route |
|---|---|
| AOS behavior unexpected (wrong next_action, SSE failure) | Team 11 (AOS Gateway) → Team 100 |
| Architectural decision needed | Team 100 → Team 00 |
| Gate 4 UX sign-off | Team 00 directly |
| DB schema gap discovered | Team 110 → Team 60 |

---

**log_entry | TEAM_00 | S003_P005_FIRST_FLIGHT_ACTIVATION | D26_WATCH_LISTS | AOS_V3 | 2026-03-29**
**log_entry | TEAM_110 | ACTIVATION_REMEDIATED | G0_F02_DDL_CONFIRMED_G0_F03_NAMES_FIXED_TEAM_111_TO_110 | 2026-03-31**
**log_entry | TEAM_110 | ACTIVATION_PREREQUISITES_CLOSED | ALL_4_PREREQUISITES_RESOLVED | PRINCIPAL_MANDATE | 2026-03-31**
