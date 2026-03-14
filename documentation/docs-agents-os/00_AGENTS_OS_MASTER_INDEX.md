# Agents_OS — Master Documentation Index
> documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md

**project_domain:** AGENTS_OS  
**owner:** Team 170 (Governance Documentation)  
**date:** 2026-03-14  
**status:** Active — canonical entry point per TEAM_00_TO_TEAM_170_AGENTS_OS_DOCS_MANDATE_v2.0.0

---

## Quick Start

| Task | Link / Command |
|------|----------------|
| Start UI server | `./agents_os/scripts/start_ui_server.sh` → open http://localhost:8090/ (redirects to dashboard) or http://localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html |
| Run pipeline | `./pipeline_run.sh --domain agents_os` |
| Check status | `./pipeline_run.sh --domain agents_os status` or `./pipeline_run.sh domain` |

---

## System Overview

[AGENTS_OS_OVERVIEW.md](01-OVERVIEW/AGENTS_OS_OVERVIEW.md) — self-contained onboarding; new team member reads this to understand and start using `pipeline_run.sh`.

---

## Architecture

| Document | Description |
|----------|-------------|
| [AGENTS_OS_ARCHITECTURE_OVERVIEW.md](02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md) | Domain isolation, gate sequence, mandate engine, multi-domain design, correction cycle |

---

## CLI Reference

[PIPELINE_CLI_REFERENCE.md](03-CLI-REFERENCE/PIPELINE_CLI_REFERENCE.md) — full reference for `pipeline_run.sh` subcommands.

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
| LLD400, LOD200 | Templates | documentation/docs-governance/06-TEMPLATES/ | Active | Shared governance templates |
| Foundations (WSM, Registry, etc.) | Shared | documentation/docs-governance/01-FOUNDATIONS/ | Active | WSM, Program Registry, Roadmap, Gate Model |
| Runtime output | Runtime | _COMMUNICATION/agents_os/ | Active | pipeline_state.json, STATE_SNAPSHOT.json, prompts |
| Architect Inbox | Submissions | _COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_* | Archive | Historical LLD400, GATE2, etc. |
| Architects Decisions | Decisions | _COMMUNICATION/_Architects_Decisions/ | Active | ADR_026, etc. |
| Team communication | Reports | _COMMUNICATION/team_*/ | Active | Handoffs, mandates, scattered |
| Context identity | Config | agents_os_v2/context/identity/ | Active | team_*.md |
| Context governance | Config | agents_os_v2/context/governance/ | Active | gate_rules.md |
| agents_os/documentation | Index | agents_os/documentation/00_INDEX.md | Active | 01-FOUNDATIONS, 02-SPECS, 03-TEMPLATES (Option C) |

---

**log_entry | TEAM_170 | AGENTS_OS_MASTER_INDEX | DELIVERED | 2026-03-14**
