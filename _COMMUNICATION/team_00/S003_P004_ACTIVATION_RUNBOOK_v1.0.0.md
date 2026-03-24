---
id: S003_P004_ACTIVATION_RUNBOOK_v1.0.0
date: 2026-03-24
from: Team 100
to: Team 00 (Nimrod) + executing teams
status: ACTIVE — preconditions MET
program: S003-P004 — User Tickers (D33)
domain: TIKTRACK
track: TRACK_FULL (backend + frontend + QA)
---

# S003-P004 Activation Runbook — User Tickers (D33)

---

## Pre-flight Check (run first)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix

# 1. Tests
python3 -m pytest agents_os_v2/tests/ -q
# Required: 223+ passed, 0 failed

# 2. SSOT
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# Required: ✓ CONSISTENT on both

# 3. Pipeline state
./pipeline_run.sh --domain tiktrack status
# Required: current_gate = COMPLETE (no active WP)
```

If WSM drift detected: `git checkout HEAD -- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md && ./pipeline_run.sh wsm-reset`

---

## Step 1 — Register S003-P004-WP001 and Initialize Pipeline

```bash
# Add S003-P004 to Program Registry (already PLANNED — change to ACTIVE)
# File: documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md
# Change:  | S003 | S003-P004 | User Tickers (D33) | TIKTRACK | PLANNED | ...
# To:      | S003 | S003-P004 | User Tickers (D33) | TIKTRACK | ACTIVE  | GATE_0 pending — Team 100 authorization 2026-03-24 |

# Initialize pipeline
PIPELINE_DOMAIN=tiktrack python3 -m agents_os_v2.orchestrator.pipeline \
  --spec "S003-P004-WP001 — User Tickers (D33). Full TikTrack feature: ticker list with filtering, sorting, pagination, live price display, Iron Rule display lock. New development. Authority: S003 roadmap + DM-005 closure." \
  --wp S003-P004-WP001 \
  --stage S003

# Verify
./pipeline_run.sh --domain tiktrack status
# Expected: current_gate = GATE_0, work_package_id = S003-P004-WP001
```

---

## Step 2 — GATE_0 (Team 190 validates scope)

```bash
./pipeline_run.sh --domain tiktrack          # generates GATE_0 prompt → paste to Team 190
# Team 190 validates: Is the spec buildable? No schema violations?

./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_0 pass
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m pytest agents_os_v2/tests/ -q
```

---

## Step 3 — GATE_1 (Team 170 produces LLD400)

```bash
./pipeline_run.sh --domain tiktrack          # generates GATE_1 mandate → Team 170

# Team 170 produces: TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md
# Scope: D33 full spec — DB schema, API endpoints, UI components, Iron Rules

./pipeline_run.sh --domain tiktrack store GATE_1 <path-to-lld400>
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_1 pass
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m pytest agents_os_v2/tests/ -q
```

---

## Step 4 — GATE_2 (five-phase architectural review)

```bash
# Phase 2.1 — LOD200 architectural review (Team 100/102)
./pipeline_run.sh --domain tiktrack
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_2 --phase 2.1 pass

# Phase 2.1v — constitutional validation (Team 190)
./pipeline_run.sh --domain tiktrack
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_2 --phase 2.1v pass

# Phase 2.2 — work plan production (Team 10)
./pipeline_run.sh --domain tiktrack
# Team 10 produces: work plan with Team 20 / Team 30 / Team 50 task breakdown
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_2 --phase 2.2 pass

# Phase 2.2v — work plan review (Team 90)
./pipeline_run.sh --domain tiktrack
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_2 --phase 2.2v pass

# Phase 2.3 — final architectural sign-off (Team 100/102)
./pipeline_run.sh --domain tiktrack
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_2 --phase 2.3 pass
# → Advances to GATE_3

python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m pytest agents_os_v2/tests/ -q
```

---

## Step 5 — GATE_3 (implementation — Teams 20/30)

```bash
./pipeline_run.sh --domain tiktrack          # generates GATE_3 mandate → Teams 20 + 30

# Team 20: backend implementation (DB migration, API endpoints, business logic)
# Team 30: frontend implementation (UI components, API integration, display logic)
# Scope: D33 User Tickers — full scope per LLD400

# After implementation committed:
./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_3 pass
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m pytest agents_os_v2/tests/ -q
```

---

## Step 6 — GATE_4 (QA — Team 50)

```bash
./pipeline_run.sh --domain tiktrack          # generates GATE_4 mandate → Team 50

# Team 50 runs: E2E Selenium + regression + FAV + SOP-013
# Required: ZERO 404 errors, ZERO SEVERE logs, all test scenarios pass

./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_4 pass
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m pytest agents_os_v2/tests/ -q
```

---

## Step 7 — GATE_5 (final validation — Team 90)

```bash
./pipeline_run.sh --domain tiktrack          # generates GATE_5 prompt → Team 90
# Team 90: review all gate evidence, test history, LLD400 compliance

./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 --gate GATE_5 pass
# Pipeline → COMPLETE

# MANDATORY after COMPLETE:
./pipeline_run.sh --domain tiktrack wsm-reset
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# Both: ✓ CONSISTENT
```

---

## Step 8 — Human UX Review (organizational action — not a pipeline gate)

> ⚠️ This is NOT a pipeline gate. GATE_5 PASS = COMPLETE = end of pipeline. The review below is a manual organizational check by Nimrod, triggered outside the pipeline.

```bash
# Start UI server
bash agents_os/scripts/start_ui_server.sh   # port 8090

# Nimrod reviews:
# □ http://localhost:8090/?domain=tiktrack
# □ User Tickers page — D33 full display per Iron Rules
# □ Filtering + sorting + pagination working
# □ Live price display (if applicable)
# □ Dashboard: ZERO errors, ZERO 404s
```

---

## D33 Iron Rules (must be enforced at GATE_2 / GATE_4)

| Rule | Requirement |
|------|-------------|
| Display lock | `display_name` shown; raw ticker symbol never exposed in UI |
| Filtering | By sector, market cap, user-defined tags |
| Sorting | All visible columns sortable |
| Pagination | Max 50 rows/page; page size selector |
| Live price | Optional (activate only if data source is stable) |
| Error state | "No tickers found" state handled gracefully |

---

## FAIL Protocol

If any gate FAILs:
1. Stop. Record exact error + gate + command.
2. Identify: `doc` route (back to GATE_2) or `full` route (back to GATE_1)
3. `./pipeline_run.sh --domain tiktrack fail --finding_type <type> "reason"`
4. Fix the blocker, route back, restart from the routed gate.
5. Regression check: `python3 -m pytest agents_os_v2/tests/ -q` (223+ must pass)

---

## Run Monitor

Start the monitoring script BEFORE beginning GATE_0:
```bash
bash scripts/run_monitor.sh --domain tiktrack --wp S003-P004-WP001 --log logs/S003-P004-run.jsonl
```

The monitor logs every gate checkpoint to a structured JSONL file for post-run analysis.

---

**log_entry | TEAM_100 | S003_P004_ACTIVATION_RUNBOOK | CREATED | 2026-03-24**
