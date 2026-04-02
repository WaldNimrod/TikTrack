---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.0.0
historical_record: true
from: Team 190 (Constitutional Validator / Intelligence)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: SUBMITTED — IDEA_PIPELINE_OPEN
idea_id: IDEA-052
program: IDEA_PIPELINE
domain: agents_os
gate: IDEA_INTAKE
type: REPORT
subject: AOS data-layer transition from file-based control to DB-first control plane
supersedes: N/A---

# Team 190 Strategic Intelligence Report — IDEA-052
## AOS Database Control Plane Migration (DB-First)

## 1) Executive Verdict

**Direction verdict: `APPROVE_FOR_ARCHITECTURAL_DISCUSSION`**

Team 190 recommends promoting this topic as an **idea-level architectural track** (not WP scope yet), with a proposed direction of **DB-first control plane** for AOS, under a full-stop migration model.

This recommendation is based on explicit operating assumptions provided by Team 00:
1. Full stop of active flows is acceptable during migration.
2. Full backup + branch isolation + full validation before merge are mandatory.
3. Live data volume is currently limited; critical value is governance/system structure.

---

## 2) Executive Summary

1. The current AOS control plane is functional but fragmented across JSON/JSONL/Markdown/JS surfaces.
2. Under a no-downtime requirement, Hybrid is often preferred. Under the current approved full-stop model, **Hybrid loses most of its advantage**.
3. The recommended target is **DB-first + API-first writes**:
   - Runtime state, routing state, registry state, team assignments, and event ledger in DB.
   - Human-facing governance documents remain in Markdown where constitutional readability is required.
4. The main unresolved architectural decision is not “DB or files” but:
   - **What stays constitutional-canonical in Markdown vs what becomes operational-canonical in DB.**
5. Audit model must be strengthened beyond plain append-only logs:
   - minimum: hash-chain per event stream,
   - preferred for critical actions: signed events.

---

## 3) Current-State Baseline (evidence)

### 3.1 Active control-plane artifacts

- Domain runtime state:
  - `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`
  - `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
- Event stream:
  - `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`
- Projection/read model:
  - `_COMMUNICATION/agents_os/STATE_VIEW.json`
  - `_COMMUNICATION/agents_os/phase_routing.json`
- Team runtime overrides:
  - `_COMMUNICATION/agents_os/team_engine_config.json`
- Governance/registries:
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
  - `_COMMUNICATION/PHOENIX_IDEA_LOG.json`

### 3.2 Structural findings

| ID | Severity | Finding | Evidence-by-path |
|---|---|---|---|
| DB-01 | HIGH | Operational truth is split between runtime JSON and governance Markdown. | `agents_os_v2/orchestrator/state.py`, `agents_os_v2/orchestrator/wsm_writer.py`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| DB-02 | MEDIUM | UI and runtime consume multiple projections; drift risk grows with rapid change cadence. | `agents_os/ui/js/pipeline-config.js`, `agents_os/ui/js/pipeline-teams.js`, `_COMMUNICATION/agents_os/phase_routing.json` |
| DB-03 | HIGH | Event log is append-only but lacks cryptographic integrity chain/signature. | `agents_os_v2/orchestrator/log_events.py`, `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` |
| DB-04 | MEDIUM | Team model exists in both roster JSON and UI JS catalog; reconciliation burden exists. | `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json`, `agents_os/ui/js/pipeline-teams.js` |

---

## 4) Architecture Options

## Option A — File-first hardening

Pros:
1. Lowest implementation disruption.
2. Keeps current operator mental model.

Cons:
1. Concurrency and transactional consistency remain constrained.
2. Long-term drift control remains expensive.

Fit:
- Good for short-term stabilization only.

---

## Option B — Hybrid (DB + files as dual operational sources)

Pros:
1. Useful for zero-downtime transitions.
2. Allows phased cutover.

Cons:
1. Dual-write and reconciliation complexity.
2. Extended period of “two truths” risk.

Fit:
- Good when active traffic cannot stop.

---

## Option C — DB-first full cutover (Recommended)

Pros:
1. Single operational source of truth.
2. Stronger consistency and queryability.
3. Cleaner API surface for UI/CLI/LLM agents.

Cons:
1. Requires migration freeze window.
2. Requires strong pre-merge validation gates.

Fit:
- Best match for Team 00 approved migration posture (full stop + full validation).

---

## 5) Recommended Target Model

## 5.1 Canonical split by information class

1. **Operational canonical (DB):**
   - pipeline runtime state
   - event ledger
   - team runtime assignments/overrides
   - process routing and gate transitions
   - idea/process execution metadata

2. **Constitutional canonical (Markdown in Git):**
   - foundational directives, governance procedures, constitutional policies
   - architectural decisions requiring human-readable immutable narrative

3. **Published mirrors:**
   - Markdown/JSON projections generated from DB for operator readability where needed.

## 5.2 API-first write rule

All writers (Dashboard, CLI, IDE agents, API runners) must update control-plane data via **one validated API layer**.
No direct writes to state JSON/registry files in normal operation.

---

## 6) Data Model Baseline (AOS control plane)

Minimum entities:
1. `domains`
2. `programs`
3. `work_packages`
4. `pipeline_state`
5. `pipeline_events`
6. `team_catalog`
7. `team_assignments` (per domain/variant/wp)
8. `process_variants`
9. `gate_phase_routing`
10. `artifact_index` (canonical outputs + hash)
11. `idea_log` (or idea views with fate metadata)
12. `audit_chain` (hash/signature metadata)

---

## 7) Audit and Integrity (deep-dive)

## 7.1 Problem

Current append-only JSONL provides chronology but not strong tamper evidence.

## 7.2 Required hardening levels

1. **Level 1 (minimum):** event hash-chain (`prev_hash`, `event_hash`).
2. **Level 2 (recommended):** signed critical events (gate pass/fail, assignment changes, registry transitions).
3. **Level 3 (optional):** periodic notarized checkpoints.

## 7.3 Critical event classes

- Gate transitions
- Work package activation/closure
- Team-role assignment changes
- Process variant and routing changes
- Constitutional mirror publication events

---

## 8) Domain Strategy (multi-product future)

Team 00 guidance is accepted:
- AOS is a platform/control system, not TikTrack application DB.

Recommended structure:
1. **AOS DB = control plane (single platform DB)**
2. Product domains (TikTrack, future game/site/other) remain separate application DBs.
3. In AOS control plane: domain-aware partitioning by logical tenant (`domain_id`).

---

## 9) Migration Strategy (full-stop model)

## 9.1 Preconditions

1. Close/freeze active plans.
2. Full backup of repository + state artifacts.
3. Dedicated migration branch.
4. Migration test environment isolated from mainline.

## 9.2 Cutover phases

1. **Schema + API foundation** (no production writes yet)
2. **Backfill/import from existing canonical files**
3. **Consistency verification** (automated diff checks)
4. **Switch writers to API-only**
5. **Read path switch in dashboard/CLI/agents**
6. **Gate validation suite + browser QA + constitutional validation**
7. Merge only on full PASS

## 9.3 Rollback rule

If any critical AC fails, rollback is branch-level (no partial live deployment).

---

## 10) Acceptance Criteria for Architectural Approval

1. Single operational write path through API.
2. Full parity check against pre-migration baseline files.
3. Hash-chain validation PASS on event stream.
4. Dashboard can fully operate and monitor from new control-plane data.
5. LLM agents can write/update through API contracts from IDE/CLI environments.
6. Constitutional docs publication remains readable and deterministic.

---

## 11) Open Questions Requiring Team 100/00 Decision

1. Exact boundary: which registry fields remain constitutional-Markdown canonical vs DB canonical.
2. Required audit level at launch (hash-chain only vs signed critical events).
3. Mandatory approval workflow for team assignment changes.
4. Whether Idea Pipeline remains JSON-backed short-term or moves into DB in first wave.
5. Definition of the first “minimum viable control-plane schema” for go-live.

---

## 12) Team 190 Recommendation Package

1. Approve IDEA-052 as architecture discussion item.
2. Assign Team 101 + Team 170 to produce LOD200/LLD400 decision package for DB-first control plane.
3. Keep migration as **full-stop controlled cutover** (as requested by Team 00).
4. Include audit-model decision as mandatory pre-implementation gate.

---

## 13) References

### Internal
1. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/agents_os_v2/orchestrator/state.py`
2. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/agents_os_v2/orchestrator/pipeline.py`
3. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/agents_os_v2/orchestrator/log_events.py`
4. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/agents_os_v2/server/routes/config.py`
5. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/agents_os/pipeline_state_agentsos.json`
6. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
7. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`
8. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
9. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
10. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`

### External (research)
1. https://www.postgresql.org/docs/current/transaction-iso.html
2. https://www.postgresql.org/docs/current/datatype-json.html
3. https://www.postgresql.org/docs/current/gin.html
4. https://www.sqlite.org/wal.html
5. https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
6. https://martinfowler.com/eaaDev/EventSourcing.html

---

**log_entry | TEAM_190 | IDEA_052_DB_CONTROL_PLANE_MIGRATION | SUBMITTED_FOR_ARCHITECT_DISCUSSION | v1.0.0 | 2026-03-22**
