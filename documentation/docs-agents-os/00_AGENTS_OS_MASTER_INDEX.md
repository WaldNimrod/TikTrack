# Agents_OS — Master Documentation Index
> documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md

**project_domain:** AGENTS_OS  
**owner:** Team 170 (Governance Documentation)  
**date:** 2026-03-28  
**status:** Active — canonical entry point per TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v2.0.0 (v3 index § Agents OS v3)

---

## Quick Start

| Task | Link / Command |
|------|----------------|
| Start UI server | `./agents_os/scripts/start_ui_server.sh` → open http://localhost:8090/ (dashboard) + monitor pages: `/static/PIPELINE_CONSTITUTION.html`, `/static/PIPELINE_MONITOR.html` (**port is policy-locked to 8090**) |
| Seed Event Log | `python3 agents_os/scripts/seed_event_log.py` (optional — adds sample events for dev/E2E) |
| Run pipeline | `./pipeline_run.sh --domain agents_os` |
| Check status | `./pipeline_run.sh --domain agents_os status` or `./pipeline_run.sh domain` |

---

## Agents OS v3 (BUILD track — branch `aos-v3`)

**Canonical target (Team 100 — Directive 3B):** All **v3** domain documentation lives under this same `documentation/docs-agents-os/` tree using the **`AGENTS_OS_V3_`** filename prefix. **Do not** add `agents_os_v3/docs/`; code-adjacent docs are **`agents_os_v3/README.md`** plus handler **docstrings** only. **Do not** modify or remove existing **v2** documents in this index without a separate governance erratum.

| v3 document | Path | Status |
|-------------|------|--------|
| v3 Overview | [AGENTS_OS_V3_OVERVIEW.md](01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md) | Active — Team 71 GATE_DOC Phase B (2026-03-28) |
| v3 Architecture | [AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md](02-ARCHITECTURE/AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md) | Active — Team 71 |
| v3 API Reference | [AGENTS_OS_V3_API_REFERENCE.md](02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md) | Active — Team 71 |
| v3 Developer Runbook | [AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md) | Active — Team 71 |
| v3 Templates | [AGENTS_OS_V3_LOCAL_VALIDATION_CHECKLIST.md](05-TEMPLATES/AGENTS_OS_V3_LOCAL_VALIDATION_CHECKLIST.md) (+ [05-TEMPLATES/](05-TEMPLATES/) index) | Active — Team 71 |

**Traceability:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`

---

## Review Tooling

| Tool | Location | Purpose |
|------|----------|---------|
| Agents OS review skill | `skills/agents-os-review/` | Structured deep review workflow for pipeline, governance/server surfaces, UI, doc-code drift, and architectural conclusions |
| Review bundle scaffold | `skills/agents-os-review/scripts/init_review_bundle.py` | Creates a dated review pack under `_COMMUNICATION/team_<id>/agents_os_review/<YYYY-MM-DD>_<slug>/` |

**Example:**

```bash
python3 skills/agents-os-review/scripts/init_review_bundle.py --team-id 61 --review-slug pipeline-governance
```

Use this tooling when running a full Agents OS audit that must produce a multi-document report pack with evidence, gap analysis, and urgent actions.

---

## System Overview

[AGENTS_OS_OVERVIEW.md](01-OVERVIEW/AGENTS_OS_OVERVIEW.md) — self-contained onboarding; new team member reads this to understand and start using `pipeline_run.sh`.

---

## Architecture

| Document | Description |
|----------|-------------|
| [AGENTS_OS_ARCHITECTURE_OVERVIEW.md](02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md) | Domain isolation, gate sequence, mandate engine, multi-domain design, correction cycle |
| [EVENT_LOG_REFERENCE_v1.0.0.md](02-ARCHITECTURE/EVENT_LOG_REFERENCE_v1.0.0.md) | Event Log API, storage, UI panels, seed script, E2E validation |

---

## UI Component Registry

| Document | Description |
|----------|-------------|
| [PIPELINE_DASHBOARD_UI_REGISTRY_v2.0.0.md](../../agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v2.0.0.md) | buildCurrentStepBanner, mandate tab phase auto-selection, PWA scaffold, Event Log (DOC-04, DOC-05, DOC-06, DOC-07); supersedes v1.0.0 |
| [PIPELINE_MONITOR_ARCHITECTURE_v1.1.0.md](../../agents_os/ui/docs/PIPELINE_MONITOR_ARCHITECTURE_v1.1.0.md) | Canonical split: `PIPELINE_CONSTITUTION.html` (structure/governance) + `PIPELINE_MONITOR.html` (live runtime), script split contract (`core` + mode selectors) |
| [PIPELINE_TEAMS_CONTEXT_MONITOR_ARCHITECTURE_v1.0.0.md](../../agents_os/ui/docs/PIPELINE_TEAMS_CONTEXT_MONITOR_ARCHITECTURE_v1.0.0.md) | Teams page upgrade: context-structure monitor, cross-source matrix, full-content drilldown, and Team Management north-star roadmap |

---

## CLI Reference

| Document | Description |
|----------|-------------|
| [PIPELINE_CLI_REFERENCE.md](03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md) | Full reference for `pipeline_run.sh` subcommands |
| [PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md](03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md) | Domain resolution, GATE_1 fail behavior, AC-10 auto-store (DOC-01, DOC-02, DOC-03) |

---

## Operating Procedures

| Document | Location |
|----------|----------|
| AGENTS_OS V2 Operating Procedures | [documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md](../docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md) |
| Team 10 Gate Actions Runbook | [documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md](../docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md) |
| Fast Track Protocol | [documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md](../docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md) |

---

## Templates

| Template | Location |
|----------|----------|
| LLD400 (Spec Lock) | [documentation/docs-governance/06-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md](../docs-governance/06-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md) |
| LOD200 (Architectural Concept) | [documentation/docs-governance/06-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md](../docs-governance/06-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md) |
| Architect Verdict | [documentation/docs-governance/06-TEMPLATES/ARCHITECT_VERDICT_PAGE_TEMPLATE_AND_FACTORY.md](../docs-governance/06-TEMPLATES/ARCHITECT_VERDICT_PAGE_TEMPLATE_AND_FACTORY.md) |
| Governance procedures index | [documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md](../docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md) §06-TEMPLATES |

---

## Governance & Decisions

| Document | Location |
|----------|----------|
| ADR-026 Agent OS Final Verdict | [_COMMUNICATION/_Architects_Decisions/ADR_026_AGENT_OS_FINAL_VERDICT.md](../../_COMMUNICATION/_Architects_Decisions/ADR_026_AGENT_OS_FINAL_VERDICT.md) |
| AGENTS_OS Foundation | [agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md](../../agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md) |
| Concept Package | [agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/](../../agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/) |
| AOS Workpack | [agents_os/docs-governance/AOS_workpack/](../../agents_os/docs-governance/AOS_workpack/) |
| Architects Decisions | [_COMMUNICATION/_Architects_Decisions/](../../_COMMUNICATION/_Architects_Decisions/) |

---

## Program History

| Resource | Location |
|----------|----------|
| Program Registry | [documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md](../docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md) |
| Portfolio Roadmap | [documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md](../docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md) |
| Archive | [_COMMUNICATION/99-ARCHIVE/](../../_COMMUNICATION/99-ARCHIVE/) |
| Legacy snapshots | [archive/documentation_legacy/](../../archive/documentation_legacy/) |

---

## Full File Map

Per [TEAM_170_AGENTS_OS_DOCUMENTATION_STATE_AND_WORK_PLAN_OPTIONS §2](../../_COMMUNICATION/team_170/TEAM_170_AGENTS_OS_DOCUMENTATION_STATE_AND_WORK_PLAN_OPTIONS_v1.0.0.md):

| Document | Type | Location | Status | Notes |
|----------|------|----------|--------|-------|
| README | SSOT structure | agents_os/README.md | Active | ריצה, validators, domain isolation |
| AGENTS_OS_FOUNDATION | Foundation | agents_os/AGENTS_OS_FOUNDATION_v1.0.0.md | Active | No TikTrack product logic |
| Concept Package | Spec | agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/ | Active | ARCHITECTURAL_CONCEPT, DOMAIN_ISOLATION_MODEL, etc. |
| AOS Workpack | Protocol | agents_os/docs-governance/AOS_workpack/ | Active | Workspace, Submission, DoD, Activations |
| 99-QUARANTINE_STAGE3 | Quarantine | agents_os/docs-governance/99-QUARANTINE_STAGE3/ | Active | MB3A POC spec |
| AGENTS_OS V2 Operating | Procedure | documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md | Active | Pipeline, teams, context, MCP |
| Event Log Reference | Architecture | documentation/docs-agents-os/02-ARCHITECTURE/EVENT_LOG_REFERENCE_v1.0.0.md | Active | API, storage, UI panels, seed, E2E |
| LLD400, LOD200 | Templates | documentation/docs-governance/06-TEMPLATES/ | Active | Shared governance templates |
| Foundations (WSM, Registry, etc.) | Shared | documentation/docs-governance/01-FOUNDATIONS/ | Active | WSM, Program Registry, Roadmap, Gate Model |
| Runtime output | Runtime | _COMMUNICATION/agents_os/ | Active | pipeline_state*.json, pipeline_events.jsonl, STATE_SNAPSHOT.json, prompts |
| Architect Inbox | Submissions | _COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_* | Archive | Historical LLD400, GATE2, etc. |
| Architects Decisions | Decisions | _COMMUNICATION/_Architects_Decisions/ | Active | ADR_026, etc. |
| Team communication | Reports | _COMMUNICATION/team_*/ | Active | Handoffs, mandates, scattered |
| Context identity | Config | agents_os_v2/context/identity/ | Active | team_*.md |
| Context governance | Config | agents_os_v2/context/governance/ | Active | gate_rules.md |
| agents_os/documentation | Index | agents_os/documentation/00_INDEX.md | Active | 01-FOUNDATIONS, 02-SPECS, 03-TEMPLATES (Option C) |

---

**log_entry | TEAM_170 | AGENTS_OS_MASTER_INDEX | DELIVERED | 2026-03-14**
**log_entry | TEAM_170 | AGENTS_OS_MASTER_INDEX | REVIEW_TOOLING_ADDED_AGENTS_OS_REVIEW_SKILL | 2026-03-16**
**log_entry | TEAM_170 | AGENTS_OS_MASTER_INDEX | EVENT_LOG_REFERENCE_ADDED | 2026-03-10**
**log_entry | TEAM_11 | AOS_V3_BUILD | MASTER_INDEX_V3_SECTION_3B | SYNC | 2026-03-28**
**log_entry | TEAM_71 | AOS_V3 | GATE_DOC_PHASE_B | MASTER_INDEX_V3_ACTIVE | 2026-03-28**
