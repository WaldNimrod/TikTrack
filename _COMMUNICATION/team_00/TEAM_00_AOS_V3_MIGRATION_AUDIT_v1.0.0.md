---
id: TEAM_00_AOS_V3_MIGRATION_AUDIT_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 61 (AOS DevOps — seed executor), Team 100 (Chief Architect — review)
cc: Team 170 (Spec & Governance)
date: 2026-03-29
type: MIGRATION AUDIT — Ideas + Future Work Packages for AOS v3 seeding
scope: FEATURE REQUIREMENTS AND SPECIFICATIONS ONLY---

# AOS v3 Migration Audit
## Ideas + Future Work Packages (Feature Requirements)

---

## §1 — Scope and Rules

**What this audit covers:**
- Ideas from `PHOENIX_IDEA_LOG.json` that represent **future feature requirements**
- Future work packages (PLANNED / ACTIVE) from `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

**What this audit explicitly excludes:**
- Team definitions and team assignments (team roster is v3-native)
- Process structure, routing rules, gate sequences (v3-native design)
- Historical/completed ideas and cancelled items (no value to seed)
- Ideas about governance processes, ADRs, or documentation procedures

**Key principle (Nimrod, 2026-03-29):**
> TikTrack domain: specs and requirements are accurate — transfer as-is.
> AOS domain: ideas require assessment against v3; team/process alignment will be updated separately.
> Goal: preserve the WHAT (features, requirements, specifications). Not the HOW (team routing).

**When seeding work packages into v3 DB:**
Strip all team assignments and process-specific fields. Seed only:
`wp_id`, `domain_id`, `program_name`, `stage_id`, `status`, `description`

---

## §2 — Ideas: TikTrack Domain

**Verdict for all:** `TRANSFER_AS_IS` — TikTrack feature requirements are accurate and correct.

| IDEA-ID | Title | v2 Status | v3 Seed Action | Notes |
|---|---|---|---|---|
| IDEA-023 | Manual/Visual approval checkpoint closure verification | open | SEED | Feature requirement for approval UX completeness |
| IDEA-024 | Cash Flows response schema verification status closure | open | SEED | Feature requirement for D-CashFlows backend accuracy |
| IDEA-025 | Data loader update for currency_conversions | open | SEED | Feature requirement: currency_conversions data loader fix |
| IDEA-026 | D22 Tickers: data-integrity widget + integration completion | open | SEED | Feature requirement for D22 admin page |
| IDEA-027 | D23 Data Dashboard: template/draft to functional scope | open | SEED | Feature requirement: D23 needs full implementation |
| IDEA-028 | D24 Trade Plans: implementation planning and execution gate | open | SEED | Feature requirement: D24 full spec + build |
| IDEA-029 | D25 AI Analysis: detailed spec before build | open | SEED | Feature requirement: D25 spec needed |
| IDEA-030 | D26 Watch Lists: spec + build plan | open | SEED_WITH_NOTE | ⚠️ Fate update: now IN EXECUTION as S003-P005 First Flight. Seed with status=decided, fate=new_wp, delivery_ref=S003-P005-WP001 |
| IDEA-031 | D27 Ticker Dashboard: spec + historical data dependencies | open | SEED | Feature requirement: D27 spec + historical data |
| IDEA-032 | D28 Trading Journal: spec + implementation plan | open | SEED | Feature requirement: D28 |
| IDEA-033 | D30-D32 advanced research pages: full specs | open | SEED | Feature requirement: D30/D31/D32 spec authoring |
| IDEA-034 | D37 Data Import marked urgent | open | SEED | Feature requirement: D37 urgency noted |
| IDEA-035 | D38-D39 Settings pages: detailed spec required | open | SEED_WITH_NOTE | D39 COMPLETE (S003-P003 GATE_8 PASS). Scope now = D38 only (tag_management, deferred to S005) |

**TikTrack ideas NOT seeded (already completed/cancelled — historical records only):**

| IDEA-ID | Title | Reason Not Seeded |
|---|---|---|
| IDEA-016 | S003-P003 LOD400 authoring (D39/D40/D41) | COMPLETE — S003-P003 GATE_8 PASS 2026-03-21 |

---

## §3 — Ideas: AOS Domain

### §3.1 — AOS Feature Requirements: SEED (still open, applicable to v3)

These represent future capability requirements for AOS v3 — the feature/capability intent is valid; team assignments and process detail will be updated for v3.

| IDEA-ID | Title | v2 Status | v3 Assessment | Seed Action | v3 Note |
|---|---|---|---|---|---|
| IDEA-001 | Standalone PIPELINE_HELP.html — dedicated help page | lod200_pending | `NEEDS_REVISION` | SEED_REVISED | fate_target was S003-P007 which is now MERGED+COMPLETE. Revise fate_target to a new S00x-Pxxx in the AOS v3 roadmap. The help page concept (dedicated UI help page) is still valid for v3 UI. |
| IDEA-007 | Ideas Pipeline Phase 2 — grooming automation, UI fate-decision | lod200_pending | `STILL_OPEN` | SEED | v3 has ideas table in DB — Phase 2 automation is a valid future AOS WP. Revise fate_target from S002-P005-WP004 to a v3-era program slot. |
| IDEA-008 | Help modal 4-tab upgrade (Option A) | in_execution | `NEEDS_REVISION` | SEED_REVISED | v3 has new UI. The 4-tab help modal concept is valid for v3 dashboard. fate_target and delivery_ref need v3 equivalents. |
| IDEA-018 | Pipeline stage transitions + roadmap management UI | lod200_pending | `STILL_OPEN` | SEED | Stage transition scripts + management UI is not yet built in v3. Valid future WP. Revise fate_target to appropriate S004+ slot. |
| IDEA-021 | Model B file structure definition (ADR-031 Stage B) | lod200_pending | `NEEDS_REVISION` | SEED_REVISED | fate_target was S003-P007 (now MERGED/COMPLETE via S003-P011). Needs new fate_target in v3 roadmap. The underlying capability concept (Model B file output format) may be relevant to v3 Operator Handoff design. |
| IDEA-043 | WP Lifecycle Manager: init/hold/resume/cancel/close as CLI + Dashboard UI | open | `PARTIALLY_ADDRESSED` | SEED_WITH_NOTE | v3 REST API provides /api/runs CRUD. However, CLI wrapper and dashboard lifecycle panel are not yet built. The dashboard UX component is still an open feature requirement for v3. |
| IDEA-051 | AOS Scheduler reclassification + research-based architecture direction | open | `STILL_OPEN` | SEED | Architectural decision still pending. v3 uses APScheduler for background tasks. Team 100 architect decision on scheduler strategy still required. |

### §3.2 — AOS Ideas: SUPERSEDED BY V3 (do not seed)

These ideas were open items in v2 that AOS v3 architecture directly addresses and resolves.

| IDEA-ID | Title | Superseded By |
|---|---|---|
| IDEA-044 | Gate Terminology Canonicalization | v3 uses clean GATE_0..GATE_5 naming — no G3_PLAN, no WAITING_GATE2_APPROVAL |
| IDEA-047 | GATE_2 phase routing bug | v3 redesigned gate model — bug does not exist in v3 |
| IDEA-048 | GATE_SEQUENCE_CANON §8 typo (G3_PLAN row) | v2 doc typo — not relevant to v3 |
| IDEA-050 | pipeline_run.sh pass: add GATE_N identifier | v3 uses HTTP API — no pipeline_run.sh |
| IDEA-052 | AOS control plane migration to DB-first architecture | **This idea IS AOS v3** — fully delivered |
| IDEA-053 | AOS greenfield rewrite architecture concept | **This idea IS AOS v3** — fully delivered |

### §3.3 — AOS Ideas: PROCESS/GOVERNANCE (not feature requirements — exclude from seed)

| IDEA-ID | Title | Reason Excluded |
|---|---|---|
| IDEA-002 | PIPELINE_TEAMS.html update | Team/process UI — not a feature requirement |
| IDEA-003 | AOS Docs Audit — standing governance thread | Governance process, not feature |
| IDEA-005 | Mode 1 Routing Table | Team/process definition |
| IDEA-009 | Process-Functional Separation ADR | Architectural process — done |
| IDEA-010 | Domain guard validation | Architecture validation — done |
| IDEA-019 | Dashboard map + task lists canonical hierarchy | Process/tooling governance |
| IDEA-020 | ROSTER_LOCK v3/v4 | Team definition — not feature |
| IDEA-022 | Formal D-04 approval confirmation doc | Process governance doc |
| IDEA-036 | Date Governance Stabilization P1+P2 | Process governance |
| IDEA-037 | Cross-Team Skills Set Program | Team process |
| IDEA-038 | Gate Prompt Lifecycle Management | v2 process (S003-P008 → superseded by S003-P010) |
| IDEA-039 | test_cursor_prompt Accumulation Cap | v2 process — superseded |
| IDEA-040 | Pre-activation Checklist Machine Enforcement | v2 process — superseded |
| IDEA-041 | Prompt Staleness Guard (pipeline_run.sh) | v2-specific, pipeline_run.sh not in v3 |
| IDEA-042 | LOD200 Pre-activation Ordering Table | v2 process — superseded |
| IDEA-045 | Canonicalize Team 190 correction prompt template | Process governance |
| IDEA-046 | Team 00 manual bypass correction — process gap | Process governance |
| IDEA-049 | Team 90 validation prompt: route_recommendation schema | Process/validation template governance |

### §3.4 — AOS Ideas: ALREADY RESOLVED (historical — do not seed)

| IDEA-ID | Title | Status |
|---|---|---|
| IDEA-004 | `insist` command | decided/cancel |
| IDEA-006 | Clear residual override_reason | decided/cancel |
| IDEA-011 | WP001 state anomaly | decided/cancel |
| IDEA-012 | Ideas Pipeline Phase 1 | decided/immediate — COMPLETE |
| IDEA-013 | test_injection known failures | decided/cancel |
| IDEA-014 | store_artifact() silent failure | decided/immediate — COMPLETE |
| IDEA-015 | Team 10 activation notice (WP002) | decided/cancel |

---

## §4 — Ideas: Shared Domain

| IDEA-ID | Title | v2 Status | v3 Seed Action | Notes |
|---|---|---|---|---|
| IDEA-017 | S003 program activation | decided/immediate | **DO NOT SEED** | Historical administrative action — S002 already complete |
| IDEA-036 | Date Governance Stabilization | open | **DO NOT SEED** | Process governance — excluded per scope rules |
| IDEA-037 | Cross-Team Skills Set Program | open | **DO NOT SEED** | Team process — excluded per scope rules |

---

## §5 — Future Work Packages: TikTrack Domain

**Rule:** Seed program slot + feature scope only. Strip all team assignments and process fields.
**Team-assignment alignment to v3:** will be done when each WP enters GATE_0 — the activation package at that point will use v3 team/process conventions.

| Stage | Program | Program Name | Status | WP Scope (preserve as-is) |
|---|---|---|---|---|
| S001 | S001-P002 | Alerts POC | ACTIVE | Alerts widget: unread count + list (N=5), collapses at 0, click→D34, no new backend. Full spec in LOD200. |
| S003 | S003-P004 | User Tickers (D33) | ACTIVE | D33 live prices, display_name Iron Rule, filtering/sorting/pagination — currently in execution |
| S003 | S003-P005 | Watch Lists (D26) | ACTIVE | D26 CRUD watchlists + watchlist_items, live price display, 50-ticker limit, 20-watchlist limit — First Flight active |
| S003 | S003-P006 | Admin Review S003 | PLANNED | Stage governance package — Admin review of all S003 deliverables |
| S004 | S004-P004 | Executions (D36) | PLANNED | Trade execution records — full spec at LOD200 time |
| S004 | S004-P005 | Data Import (D37) | PLANNED | Data import (Delta-Reset policy locked: Option B) |
| S004 | S004-P006 | Admin Review S004 | PLANNED | Stage governance package |
| S004 | S004-P007 | Indicators Infrastructure | PLANNED | ticker_indicators table NUMERIC(20,8); ATR/MA/CCI computation service; nightly APScheduler job; GET /api/v1/tickers/{id}/indicators |
| S005 | S005-P002 | Trade Entities (D29+D24) | PLANNED | Trade plans (D24) + Trade records (D29) |
| S005 | S005-P003 | Market Intelligence (D27+D25) | PLANNED | Ticker Dashboard (D27) + AI Analysis (D25) |
| S005 | S005-P004 | Journal & History (D28+D31) | PLANNED | Trading Journal (D28) + Trade History (D31) |
| S005 | S005-P005 | Admin Review S005 | PLANNED | Stage governance package |
| S006 | S006-P001 | Portfolio State (D32) | PLANNED | Portfolio state page |
| S006 | S006-P002 | Analysis & Closure (D30) | PLANNED | Analysis & closure page |
| S006 | S006-P003 | Level-1 Dashboards | PLANNED | Dashboard overview pages |
| S006 | S006-P004 | Admin Review S006 FINAL | PLANNED | Final stage governance package |

---

## §6 — Future Work Packages: AOS Domain

| Stage | Program | Program Name | Status | WP Scope (preserve as-is) |
|---|---|---|---|---|
| S004 | S004-P001 | Financial Precision Validator | PLANNED | Float prohibition E-18..E-19, NUMERIC(20,8) enforcement E-20..E-22 |
| S004 | S004-P002 | Business Logic Validator | PLANNED | ⚡ ACCELERATED. Multi-entity consistency, state machine completeness, business rule coverage. Blocks S005 TikTrack start. |
| S004 | S004-P003 | Spec Draft Generator | PLANNED | ⚡ ACCELERATED. LLM-assisted LOD200/LOD400 first draft from requirements. Blocks S005 TikTrack start. |
| S004 | S004-P008 | Mediated Reconciliation Engine (ADR-031 Stage C) | PLANNED | proposed_updates mediator, SSM legality gate, visual evidence diff/capture flow |
| S005 | S005-P001 | Analytics Quality Validator | PLANNED | Analytics calculation declaration, output format compliance. Built in S005 era to serve S006 TikTrack analytics. |

> **AOS Completion Gate (unchanged):**
> S005 TikTrack cannot begin until S004-P002 (Business Logic Validator) AND S004-P003 (Spec Draft Generator) both reach GATE_5 PASS in v3 pipeline.

---

## §7 — Seed Data Summary

### §7.1 — Ideas to seed in v3 `ideas` table

**TikTrack domain — seed verbatim (13 ideas):**
IDEA-023, IDEA-024, IDEA-025, IDEA-026, IDEA-027, IDEA-028, IDEA-029, IDEA-030, IDEA-031, IDEA-032, IDEA-033, IDEA-034, IDEA-035

**TikTrack domain — seed with note (1 idea):**
IDEA-030: add fate_update note (now IN EXECUTION as S003-P005)
IDEA-035: add note (D39 complete, scope = D38 only)

**AOS domain — seed revised (7 ideas):**
IDEA-001, IDEA-007, IDEA-008, IDEA-018, IDEA-021, IDEA-043, IDEA-051
These require fate_target revision before seeding — see §3.1 notes per idea.

**Total ideas to seed: ~20**

### §7.2 — Work packages to seed/register in v3

**TikTrack:** 16 programs (see §5 table)
**AOS:** 5 programs (see §6 table)

**Seed fields only:** `program_id`, `program_name`, `domain`, `stage_id`, `status`, `scope_summary`
**DO NOT seed:** team assignments, gate routing, process variants — those are set at GATE_0 activation using v3 conventions.

---

## §8 — Action Items

| # | Action | Owner | When |
|---|---|---|---|
| 1 | Seed 13 TikTrack ideas verbatim into v3 ideas table | Team 61 | Phase 0 or post-Phase 0 cleanup |
| 2 | Seed 7 AOS ideas with revised fate_target into v3 ideas table | Team 100 → Team 61 | After Team 100 assigns new program slots for revised fate_targets |
| 3 | Register 16 TikTrack future programs in v3 `work_packages` table (scope only, no team fields) | Team 61 | Phase 0 or immediately after |
| 4 | Register 5 AOS future programs in v3 `work_packages` table (scope only) | Team 61 | Phase 0 or immediately after |
| 5 | IDEA-030 fate update: mark as decided, fate=new_wp, delivery_ref=S003-P005-WP001 in v3 | Team 61 | Immediately (S003-P005 is the First Flight) |
| 6 | IDEA-035 fate update: scope narrowed to D38 only (D39 complete) | Team 61 | Immediately |
| 7 | Revised fate_targets for IDEA-001, IDEA-007, IDEA-008, IDEA-018, IDEA-021 in AOS domain | Team 100 | This session or next dedicated session |

---

## §9 — What Is NOT Being Migrated (explicit exclusions)

| Category | Reason |
|---|---|
| Team roster definitions | v3-native; configured at deployment |
| Gate routing rules (`routing_rules` table) | v3-native; seeded by v3 seed.py |
| Process variants (TRACK_FULL / TRACK_FOCUSED) | v3-native |
| v2 pipeline_state.json entries | Obsolete (v2 format incompatible with v3 DB schema) |
| Historical/completed programs (S001-P001, S002-P001..P005, S003-P001..P016) | Historical records only; no forward work |
| Governance/process ideas (IDEA-002, 003, 005, 009, 010, 019, 020, 022, 036, 037, 038, 039, 040, 041, 042, 045, 046, 049) | Process definitions, not feature requirements |
| Cancelled/resolved ideas (IDEA-004, 006, 011, 012, 013, 014, 015) | No value to seed |
| Superseded AOS ideas (IDEA-044, 047, 048, 050, 052, 053) | Superseded by v3 architecture |

---

**log_entry | TEAM_00 | MIGRATION_AUDIT | AOS_V3_IDEAS_AND_FUTURE_WPS | FEATURE_REQUIREMENTS_ONLY | 2026-03-29**
