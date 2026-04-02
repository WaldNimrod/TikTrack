---
id: TEAM_00_CONSTITUTION_PAGE_TRUTH_ENDPOINT_SPEC_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 61 (implementation — WP003 scope), Team 51 (QA)
cc: Team 100
date: 2026-03-21
status: SPEC — implement in S003-P012-WP003
authority: ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0 §8---

# Constitution Page + Dashboard Truth Endpoint Spec

## §1 — Principle (Iron Rule, 2026-03-21)

**Every system state that is supposed to be correct MUST be visible and accurate in the UI.**
A failure invisible in the UI is NOT considered "fixed."

The dashboard pages are **truth endpoints** — they display the system's definitive understanding of its own state. Any drift between runtime state and displayed state = DEFECT.

---

## §2 — Page → Truth Responsibility Map

| Page | Route | Truth Responsibility |
|---|---|---|
| **Constitution** | `/agents_os/constitution` | System operational state + SSOT alignment + department roster + routing |
| **Teams** | `/agents_os/teams` | Org structure: team roster, roles, groups, domains, engines |
| **Roadmap / Map** | `/agents_os/roadmap` | Packages/programs: status, WP list, ideas queue |
| **Monitor / Pipeline** | `/agents_os/pipeline` (existing) | Current gate, phase, pending actions, event log |

---

## §3 — Constitution Page — Required Fields

The Constitution page is the **single diagnostic view** for the system's current operational truth.

### Section A — System Identity

| Field | Source | Required |
|---|---|---|
| Project Name | hardcoded (PHOENIX) | YES |
| Active Stage | `pipeline_state.stage_id` | YES |
| Active Domain | `pipeline_state.project_domain` | YES |
| Process Variant | `pipeline_state.process_variant` | YES |
| Active WP ID | `pipeline_state.work_package_id` | YES |
| Current Gate | `pipeline_state.current_gate` | YES |
| Current Phase | `pipeline_state.current_phase` | YES |
| Last Gate Event | `pipeline_state.last_gate_event` | YES |

### Section B — SSOT Health

| Field | Source | Display |
|---|---|---|
| SSOT Status | `ssot_check` output | ✓ CONSISTENT (green) / ⚠ DRIFT (yellow+diff) / ✗ ERROR (red) |
| WSM Sync | WSM CURRENT_OPERATIONAL_STATE vs pipeline_state | field-by-field comparison |
| Last Check | timestamp | displayed |
| Drift Detail | field name + WSM value + state value | shown only when drift exists |

Auto-refreshes every 30 seconds (or on-demand button).

### Section C — Active Department Roster

| Column | Source |
|---|---|
| Role | `program_department.roles` key (display name) |
| Team ID | `program_department.roles` value |
| Team Name | lookup from roster JSON |
| Group | A / B / C / D |
| Engine | from team config |
| Status | ACTIVE / CONDITIONAL / FIXED |

Shows all required roles + optionals (with ACTIVE/INACTIVE indicator) + fixed (adversarial_validator).

### Section D — Gate Routing Table (current variant)

Display the resolved routing for the active domain+variant:

| Gate | Phase | Owner Team | Role |
|---|---|---|---|
| GATE_1 | 1.1 | team_101 | spec_author |
| GATE_1 | 1.2 | team_190 | adversarial_validator |
| ... | ... | ... | ... |

Read from `_resolve_role()` for each gate/phase combination.

### Section E — System Health Summary

3-state indicator displayed as a top banner:

| State | Condition | Display |
|---|---|---|
| GREEN | SSOT consistent + all routing resolved + no blocking KBs | ✅ SYSTEM HEALTHY |
| YELLOW | SSOT drift detected OR optional roles missing | ⚠ ATTENTION REQUIRED |
| RED | BLOCKING finding active OR state unresolvable | ❌ ACTION REQUIRED |

### Section F — Next Required Action

Prominent text block: `pipeline_state.next_required_action`

---

## §4 — Teams Page — Required Fields

Source: `ARCHITECT_DIRECTIVE_TEAM_ROSTER_v3.0.0.md` (or `TEAMS_ROSTER.json` generated from it)

| Field | Display |
|---|---|
| Team ID | Team 00, Team 10, Team 21... |
| Title | Full title from roster |
| Group | A / B / C / D with label |
| Domain | TikTrack / AOS / BOTH |
| Engine | Cursor / Claude Code / Codex / Human |
| Role description | Short role text |
| Active in variant | TRACK_FULL / TRACK_FOCUSED / both |
| Status | ACTIVE / PLANNED / CONDITIONAL |

**Filters:** Domain (all / tiktrack / agents_os), Group (all / A / B / C / D), Status

**No hardcoded data** — all data from a generated JSON file updated when roster directive changes.

---

## §5 — Roadmap/Map Page — Required Fields

| Section | Content |
|---|---|
| Active Programs | List of programs with status = ACTIVE (from Program Registry) |
| Active WPs | List of WPs currently in execution (from pipeline_state) |
| Planned programs | All PLANNED programs per stage |
| Ideas queue | Count + summary of open ideas (from idea pipeline) |
| Stage progress | S001 COMPLETE / S002 COMPLETE / S003 ACTIVE / S004+ PLANNED |

---

## §6 — Monitor Page — Required Fields (additions to existing)

Existing pipeline monitor already shows gate/phase. Add:

| Field | Source |
|---|---|
| Both domain states | tiktrack pipeline_state + agents_os pipeline_state |
| Pending human action indicator | `gate_state == "HUMAN_PENDING"` → highlighted banner |
| SSOT mini-status | 1-line from ssot_check (consistent / drift) |
| WP lifecycle progress | Gate completion bar (GATE_1..5 with ✓/pending) |

---

## §7 — Implementation Scope Assignment

| Feature | WP | Priority |
|---|---|---|
| Constitution §A (System Identity) | WP003 | HIGH |
| Constitution §B (SSOT Health) | WP003 + WP001 (ssot_check dependency) | HIGH |
| Constitution §C (Department Roster) | WP003 + WP001 (program_department dependency) | MEDIUM |
| Constitution §D (Routing Table) | WP003 | MEDIUM |
| Constitution §E (Health Banner) | WP003 | HIGH |
| Constitution §F (Next Action) | WP003 | HIGH |
| Teams page | WP003 | MEDIUM |
| Map page | WP003 | LOW |
| Monitor page additions | WP003 | MEDIUM |

---

## §8 — Acceptance Criteria

| # | AC | Validator |
|---|---|---|
| AC-01 | Constitution page loads without JS error in Chrome/Firefox | Team 51 browser QA |
| AC-02 | §A fields all populated from live state file (no hardcoded values) | Team 51 QA |
| AC-03 | §B SSOT check runs on page load + shows CONSISTENT when state matches | Team 51 QA |
| AC-04 | §B SSOT shows DRIFT with correct field diff when drift injected manually | Team 61 test |
| AC-05 | §C roster table shows all roles for current active WP | Team 51 QA |
| AC-06 | §E health banner shows GREEN when system clean, RED when BLOCKING KB exists | Team 51 QA |
| AC-07 | Teams page shows all 19 teams from roster v3.0 with correct group/domain/engine | Team 51 QA |
| AC-08 | Domain filter on Teams page correctly filters to tiktrack / agents_os | Team 51 QA |
| AC-09 | No "team_XX" undefined errors in browser console | Team 51 QA |

---

**log_entry | TEAM_00 | CONSTITUTION_PAGE_SPEC | v1.0.0 | TRUTH_ENDPOINT_DEFINITION | 6_SECTIONS | TEAMS_PAGE+MAP+MONITOR | WP003_SCOPE | 2026-03-21**
