---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_170_S002_P005_WP002_ROADMAP_INTEGRATION_v1.0.0
from: Team 00 (Chief Architect)
to: Team 170 (Spec & Governance)
cc: Team 100
date: 2026-03-15
status: MANDATE_ACTIVE
priority: HIGH
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| gate_id | GATE_7 (WSM sync) |
| mandate_type | ROADMAP_INTEGRATION + REGISTRY_UPDATE |

---

## Purpose

This session (2026-03-15) produced several architectural decisions, mandates, and standing governance threads that are NOT yet reflected in the canonical roadmap documents. This mandate closes that gap.

**Iron Rule (Nimrod, 2026-03-15):** Every architectural decision, mandate, and future task MUST be integrated into the canonical roadmap documents immediately. No floating items. No "will be done later" without a registered home. This is Team 170's core responsibility as Spec & Governance.

---

## ITEM 1 — WSM Update: S002-P005-WP002 → GATE_7

**Note:** Team 90 is WSM updater for GATE_6/GATE_7 (per gate-owner matrix). Coordinate with Team 90 to avoid conflicting edits. If Team 90's WSM update (notified via `TEAM_00_TO_TEAM_90_S002_P005_WP002_GATE6_DECISION_NOTIFICATION_v1.0.0.md`) is not yet applied when you work on this file, apply both changes in one pass.

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

If not yet updated by Team 90, update `agents_os_parallel_track` in CURRENT_OPERATIONAL_STATE:
```
S002-P005-WP002 (Pipeline Governance): GATE_6 PASS (2026-03-15, Team 00 decision); GATE_7 ACTIVE — Nimrod UX browser review (HUMAN_BROWSER_APPROVAL_ACTIVE). Pending: Team 61 state prep + OBS-02 insist resolution. Help modal upgrade in progress (Team 61).
```

---

## ITEM 2 — S002-P005 Program Registry: Register WP002 Items

**File:** `_COMMUNICATION/agents_os/` registry (or equivalent S002-P005 program document — verify canonical location)

Ensure the following are registered as named deliverables under S002-P005-WP002:

| Deliverable | Status | Reference |
|---|---|---|
| `gate_state` / `pending_actions` / `override_reason` schema fields | DELIVERED (state.py) | GATE_6 AC-01..AC-08 |
| `pass_with_actions` command | DELIVERED | GATE_6 AC-01 |
| `actions_clear` command | DELIVERED | GATE_6 AC-03 |
| `override` command | DELIVERED | GATE_6 AC-04 |
| `insist` command | PENDING (OBS-02 — Team 61) | GATE_6 decision OBS-02 |
| PWA dashboard banner (CSS/JS) | STATIC_OK → browser verify GATE_7 | GATE_6 AC-05 |
| Help modal upgrade (4-tab, Three Modes, context banner) | IN PROGRESS (Team 61) | `TEAM_00_TO_TEAM_61_HELP_MODAL_UPGRADE_MANDATE_v1.0.0.md` |

---

## ITEM 3 — Register New Governance Items into S002-P005 Backlog

The following mandates were issued this session and need to be registered in the S002-P005 program backlog (or as a WP003 if scope warrants):

### 3A — PIPELINE_TEAMS.html Update (Team 30 mandate)

**Mandate issued:** `TEAM_00_TO_TEAM_30_AOS_TEAMS_PAGE_UPDATE_MANDATE_v1.0.0.md`
**Scope:** AOS UI — Teams page, Mode 1/2/3 descriptions, Process-Functional separation banner, verdict badges
**Register as:** S002-P005 WP003 candidate, or add to existing S002-P005 WP002 "AOS UI polish" backlog item

Confirm correct registration with Team 100.

### 3B — AOS Docs Audit Thread (standing governance process)

**Mandate issued:** `TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0.md`
**Scope:** Standing thread (Team 170 + Team 190): code vs docs alignment, activation prompt updates, vision alignment checks
**Trigger cadence:** Every gate completion + every pipeline code change + every Stage activation
**Register as:** Standing governance item in `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` under AGENTS_OS governance — not a WP (ongoing). Add to your team's standing responsibilities.

### 3C — `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` (new document to author)

**Required by:** `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0.md` §Required Actions
**Description:** Deterministic routing table for Team 10 Mode 1 legacy operation — every verdict (PASS/FAIL/BLOCK) + source gate → next team + action. Zero discretion.
**Register as:** Deliverable under AOS Docs Audit scope. Author this document, submit to `_COMMUNICATION/_ARCHITECT_INBOX/` for Team 00 approval.

---

## ITEM 4 — Register Option B (PIPELINE_HELP.html) into S003 Backlog

**Architectural decision:** Option A (4-tab modal upgrade) = immediate (WP002). Option B = dedicated PIPELINE_HELP.html page = S003 work package.

**Action:** Register in `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` under S003, AGENTS_OS domain:
```
S003-P007 (ADR-031 Stage B — Command Bridge Lite) backlog candidate:
  - PIPELINE_HELP.html: standalone help page replacing modal
    - Feature: full operator guide, searchable, browser-navigable
    - Trigger: WP002 GATE_8 PASS
    - LOD200 required before GATE_0
```

If S003-P007 scope is not the right home (per ADR-031 definitions), propose alternative placement to Team 00. Do not invent — flag and ask.

---

## ITEM 5 — Process-Functional Separation: Activation Prompts Update

Per `TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0.md` §2A (Priority 1):

These are IMMEDIATE (not roadmap-deferred):

| Document | Required Change |
|---|---|
| `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | Update Team 10 per Roster v2.0.0; add "verdict only — no routing" note to Team 190/50/90 |
| All activation prompts: Team 190 | Remove `owner_next_action` from output contract; add: "do NOT route to other teams" |
| All activation prompts: Team 50/51 | Remove routing instructions; output = test results + verdict only |
| All activation prompts: Team 90 | Remove routing instructions; output = review notes + verdict only |
| All activation prompts: Team 10 | Update to Mode 1/2/3 definitions per ADR |

**Team 190 validates all prompt changes after Team 170 authors them.**
**Submit audit round 1 report to `_COMMUNICATION/team_100/` as `TEAM_170_190_AOS_AUDIT_REPORT_ROUND1_v1.0.0.md`**

---

## Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | WSM `agents_os_parallel_track` reflects GATE_7 ACTIVE for WP002 |
| AC-02 | S002-P005-WP002 deliverables table updated (incl. `insist` as PENDING, help modal as IN PROGRESS) |
| AC-03 | Teams page update mandate registered in S002-P005 backlog/WP003 |
| AC-04 | AOS Docs Audit thread registered as standing governance in program registry |
| AC-05 | `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` registered as pending deliverable |
| AC-06 | Option B (PIPELINE_HELP.html) registered in S003 backlog |
| AC-07 | All activation prompts for Teams 190/50/51/90/10 updated (Process-Functional Separation) |
| AC-08 | `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` updated per Roster v2.0.0 |

---

*log_entry | TEAM_00 | ROADMAP_INTEGRATION_MANDATE | TEAM_170 | S002_P005_WP002_SESSION_2026_03_15 | ISSUED | 2026-03-15*
