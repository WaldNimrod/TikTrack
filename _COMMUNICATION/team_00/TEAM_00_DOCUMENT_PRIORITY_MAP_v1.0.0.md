---
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_00_DOCUMENT_PRIORITY_MAP_v1.0.0
**owner:** Team 00 (Chief Architect)
**status:** ACTIVE
**date:** 2026-02-26
---

# TEAM 00 — DOCUMENT PRIORITY MAP v1.0.0

מפת קריאה מחייבת לצוות 00 לפי שכבות סמכות, סטטוס ריצה, וחוזי שער.

---

## TIER -1 — CONTEXT ANCHORS (READ FIRST IF UNCERTAIN)

| Document | Path | Purpose |
|---|---|---|
| Master index | `00_MASTER_INDEX.md` | Canonical entry and path policy |
| Session identity anchor | `CLAUDE.md` | Team 00 runtime identity lock |
| Environment rule anchor | `.cursorrules` | Operational environment constraints |
| Portfolio index | `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | Portfolio authority boundaries |

---

## TIER 0 — LAW LAYER (MANDATORY EVERY SESSION)

| # | Document | Path | Why |
|---|---|---|---|
| 0.1 | WSM runtime state | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | Active stage/program/gate/next action |
| 0.2 | SSM constitution | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | Governance and hierarchy rules |
| 0.3 | Gate model protocol v2.3.0 | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | Gate semantics + authority model |
| 0.4 | Gate lifecycle owners v1.1.0 | `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` | Gate owners and WSM updater by gate |
| 0.5 | GATE_0..2 contract | `documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.0.0.md` | Input/output schema for spec gates |
| 0.6 | Portfolio/WSM sync rules | `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` | Runtime-vs-mirror discipline |
| 0.7 | Fast-track protocol | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.0.0.md` | Optional fast mode rules |

---

## TIER 1 — TEAM 00 ROLE AND OPERATING PACK

| Document | Path |
|---|---|
| Team 00 constitution | `_COMMUNICATION/team_00/TEAM_00_CONSTITUTION_v1.0.0.md` |
| Team 00 activation prompt | `_COMMUNICATION/team_00/TEAM_00_ACTIVATION_PROMPT_v1.0.0.md` |
| Team 00 current state briefing | `_COMMUNICATION/team_00/TEAM_00_CURRENT_STATE_BRIEFING_v1.0.0.md` |
| Team 190 constitution | `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md` |

---

## TIER 2 — ACTIVE DECISION SET (CURRENT: S002-P003 GATE_2)

| Priority | Document | Path | Status |
|---|---|---|---|
| P0 | Architect inbox package (7 files) | `_COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P003_GATE2_SPEC_APPROVAL/SUBMISSION_v1.0.0/` | ACTION REQUIRED |
| P0 | Team 190 gate request package | `_COMMUNICATION/team_190/TEAM_190_GATE2_S002_P003_REQUEST_PACKAGE.md` | SUBMITTED |
| P0 | Team 190 approval request | `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_S002_P003_GATE2_SPEC_APPROVAL_REQUEST_v1.0.0.md` | ACTION REQUIRED |
| P1 | Team 190 Gate 1 validation result | `_COMMUNICATION/team_190/TEAM_190_GATE1_S002_P003_VALIDATION_RESULT.md` | PASS |
| P1 | Team 190 Gate 0 validation result | `_COMMUNICATION/team_190/TEAM_190_GATE0_S002_P003_VALIDATION_RESULT.md` | PASS |
| P1 | Team 170 LLD400 source | `_COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md` | INPUT |

---

## TIER 3 — STRATEGIC PORTFOLIO CONTEXT

| Document | Path | Use |
|---|---|---|
| Portfolio roadmap | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` | Stage and long-range pipeline |
| Program registry | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | Program status mirror |
| Work package registry | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | WP mirror and active marker |

---

## TIER 4 — HISTORICAL ONBOARDING CONTEXT (REFERENCE ONLY)

| Document | Path |
|---|---|
| Previous onboarding cover | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_00_ONBOARDING_COVER_NOTE_v1.0.0.md` |
| Gemini extraction responses | `_COMMUNICATION/team_00/TEAM_00_GEMINI_KNOWLEDGE_EXTRACTION_RESPONSES_v1.0.0.md` |

---

## QUICK CHECK COMMANDS

```bash
# WSM live runtime fields
rg -n "active_stage_id|active_program_id|current_gate|active_flow|next_required_action|next_responsible_team" documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md

# Current Gate-2 package files
find _COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P003_GATE2_SPEC_APPROVAL/SUBMISSION_v1.0.0 -maxdepth 1 -type f | sort

# Team 190 S002-P003 records
ls -1 _COMMUNICATION/team_190/*S002_P003* | sort
```

---

**log_entry | TEAM_00 | TEAM_00_DOCUMENT_PRIORITY_MAP_v1.0.0_REFRESH | CONTEXT_ANCHORS + LAW_LAYER + S002_P003_GATE2_DECISION_SET | 2026-02-26**
