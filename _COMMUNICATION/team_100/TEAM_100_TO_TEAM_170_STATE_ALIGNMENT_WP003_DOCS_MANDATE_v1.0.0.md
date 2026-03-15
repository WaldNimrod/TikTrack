---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_170_STATE_ALIGNMENT_WP003_DOCS_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 170 (Spec & Governance)
cc: Team 10, Team 190
date: 2026-03-15
status: MANDATE_ACTIVE
scope: Registry + documentation mandate — S002-P005-WP003 activation + IDEA-003/005 deliverables
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| gate_id | GATE_1 (LLD400) + GATE_8 (AS_MADE) |
| phase_owner | Team 170 |

---

## Deliverable 1 — Registry Updates (before GATE_3 intake)

### 1A: PHOENIX_PROGRAM_REGISTRY_v1.0.0.md
**Change:** S002-P005 status: `COMPLETE` → `ACTIVE`
**Mirror text:** `GATE_0 (WP003: AOS State Alignment & Governance Integrity — activated 2026-03-16)`
**Authority:** Team 100 LOD200 decision (Option A — reopen with WP003)

### 1B: PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md
**Add row** (after GATE_0 PASS):
```
| S002-P005 | S002-P005-WP003 | IN_PROGRESS | GATE_0 | true | AOS State Alignment & Governance Integrity — activated 2026-03-16 |
```
**Update footer:** current active WP mirror from WSM

---

## Deliverable 2 — Documentation Updates (before GATE_8)

### 2A: PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md
**File:** `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md` (lines ~40-50)
**Change:** Update "normal behavior" description — remove legacy fallback as standard path. Add:
> "Operational policy (WP003): legacy fallback is prohibited in runtime state flows. Primary source failure produces explicit `PRIMARY_STATE_READ_FAILED` diagnostic. Recovery: ensure domain state file exists and HTTP server is running."

### 2B: AGENTS_OS_ARCHITECTURE_OVERVIEW.md
**File:** `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md` (lines ~104-105)
**Change:** Update architecture contract section — replace explicit fallback to legacy path with strict-source behavior description per WP003 policy.

---

## Deliverable 3 — IDEA-003/005 (AOS Docs Audit — Mode 1 Routing Table)

### 3A: TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md
Author deterministic routing table for Team 10 Mode 1 legacy operation per `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0.md §Required Actions`.
File: `_COMMUNICATION/team_10/TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md`
Submit to: `_COMMUNICATION/_ARCHITECT_INBOX/` for Team 00 approval
Content: For each scenario (TikTrack WP active, AOS WP active, both active, neither active) — deterministic routing decision + gate owner resolution

### 3B: Activation prompt updates
Review and update activation prompts for Teams 61, 51 per Process-Functional Separation (AOS domain teams).
Priority: Team 61 and Team 51 activation prompts must reflect WP003 scope and iron rules.

---

## Deliverable 4 — GATE_8 AS_MADE_REPORT (at WP003 closure)

Per standard GATE_8 protocol (Team 70 executes — Team 170 governance oversight):
- AS_MADE_REPORT for S002-P005-WP003 covering all P0+P1 items
- Registry mirrors updated post-closure: S002-P005 status → COMPLETE (again), WP003 → CLOSED

---

**log_entry | TEAM_100 | TO_TEAM_170 | STATE_ALIGNMENT_WP003_DOCS_MANDATE_ISSUED | 2026-03-16**
