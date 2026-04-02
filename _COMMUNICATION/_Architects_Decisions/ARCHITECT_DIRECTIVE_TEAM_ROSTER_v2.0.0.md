---
id: ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0
historical_record: true
from: Team 00 (System Designer — Nimrod)
date: 2026-03-19
status: LOCKED — Iron Rule
supersedes: ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0 (2026-03-02)
authority: Team 00 constitutional authority + Nimrod approval---

# Architectural Directive — Canonical Team Roster v2.0

## §1 — Critical Corrections from v1.0

### Correction 1 — Team 00 Identity Drift (CRITICAL)
**Prior definition (WRONG):** Team 00 = "Chief Architect"
**Corrected definition:** Team 00 = System Designer / Entrepreneur = **Nimrod, the single human in the organization**

Team 00 is NOT an AI agent. Team 00 is NOT an architectural team.
Team 00 provides requirements, makes decisions, and gives instructions to all teams in human language.
The architectural AI agents are Teams 100, 101, 102.

Any document referencing "Team 00 (System Designer)" must be understood as "Team 00 (Nimrod, System Designer)."
Retroactive correction of all documents is part of S003-P011-WP001 scope.

### Correction 2 — Team 100 Engine
**Prior:** Gemini API
**Corrected:** Claude Code (default)

### Correction 3 — Teams 10–70 Engine
**Prior:** Gemini API (per MEMORY.md)
**Corrected:** Cursor IDE + Composer 1.5 (current/manual mode). Future automation phase → direct API.

### Correction 4 — New Teams Added
Team 11, Team 51, Team 102, Team 191 added.

---

## §2 — Canonical Team Roster

### Teams 00 — System Design

| Team | Title | Engine | Domain | Role |
|---|---|---|---|---|
| **00** | **System Designer (Nimrod)** | Human | BOTH | **The single human in the organization.** Provides requirements, answers questions, makes decisions. Instructs all teams in human language. Not an AI agent. Not an architectural agent. |

---

### Teams 10–70 — Implementation & Operations

Default engine: **Cursor IDE + Composer 1.5** (current phase). Automation phase: direct API.

| Team | Title | Engine | Domain | Role |
|---|---|---|---|---|
| **10** | Gateway / Execution Lead | Cursor Composer | TikTrack | GATE_3 coordination lead. Mandate creation, team activation, gate submissions, WSM updates. **PWA authority** (see GATE_SEQUENCE_CANON §3). TikTrack domain only. |
| **11** | AOS Gateway / Execution Lead | Cursor Composer | AOS | AOS-domain mirror of Team 10. Phase 2.2 (work plan generation) + Phase 3.1 (mandate generation) for all AOS packages. Gate submissions, WSM updates for AOS domain. Does not cross into TikTrack domain. |
| **20** | Backend Implementation | Cursor Composer | TikTrack | API, business logic, DB, services, runtime. Server-side only. |
| **30** | Frontend Execution | Cursor Composer | TikTrack | UI components, pages, API integration, client-side logic. Client-side only. |
| **40** | UI Assets & Design | Cursor Composer | TikTrack | Design tokens, CSS, visual consistency, UI assets. Advisory unless new design assets required. |
| **50** | QA & FAV | Cursor Composer | TikTrack | All quality assurance: E2E suites, test scripts, regression, FAV, SOP-013 seals. |
| **51** | QA & FAV — AOS | Cursor Composer | AOS | Same as Team 50, operating in AOS domain. |
| **60** | DevOps & Platform | Cursor Composer | TikTrack | Infrastructure, runtimes, CI/CD, platform readiness, runtime evidence. |
| **61** | Main Development Team | Cursor Composer | AOS | **ALL development work for Agents_OS system** — full-stack (UI, backend, config, infrastructure). Replaces Teams 20/30/40/60 in AOS domain. |
| **70** | Documentation | Cursor Composer | BOTH | Technical writing, AS_MADE documentation, GATE_5 Phase 5.1. |

---

### Teams 90–102 — Validation & Architecture

Default engine: **Codex (OpenAI API)** for validation teams. **Claude Code** for Team 100.

| Team | Title | Engine | Domain | Role |
|---|---|---|---|---|
| **90** | Validation | Codex (OpenAI) | BOTH | GATE_4 Phase 4.1 (dev validation), GATE_5 Phase 5.2 (closure validation). Submits FCP-classified findings. |
| **100** | Chief System Architect | Claude Code | BOTH | System-level architectural decisions. GATE_2 Phase 2.3 (spec + work plan arch review). GATE_4 Phase 4.2 (implementation arch review). Applies FCP on rejection. |
| **101** | AOS Domain Architect | Codex (OpenAI) | AOS | Agents_OS domain architectural authority. Research and best-practice analysis. May substitute for Team 100 in TRACK_FOCUSED and TRACK_FAST variants. |
| **102** | TT Domain Architect | Codex (OpenAI) | TikTrack | TikTrack domain architectural authority. *(Coming soon — not yet active)* |

---

### Teams 170–191 — Governance, Spec, & Platform

| Team | Title | Engine | Domain | Role |
|---|---|---|---|---|
| **170** | Spec & Governance | Cursor Composer | BOTH | LOD200/LLD400 production, registry sync, canonical document maintenance, Program Registry updates. **GATE_5 Phase 5.1 for AOS domain** (AS_MADE documentation closure — spec owner closes the spec). |
| **190** | Constitutional Validation ("Spy") | Codex (OpenAI) | BOTH | **Adversarial architectural validator.** Independently challenges and validates architectural outputs. Acts as counter-force to Teams 100/101/102 — finds what the architects miss. GATE_2 Phase 2.1v (LLD400 validation), GATE_2 Phase 2.2 context. Approaches from implementation/adversarial perspective. |
| **191** | GitHub & Backup | Codex (OpenAI) | BOTH | Git operations: branching, commits, PR creation. Backup operations and repository maintenance. |

---

## §3 — Engine Assignment Model (Iron Rule)

**Engine assignments listed above are RECOMMENDATIONS, not locks.**

In Dashboard mode, the operator (Team 00 / Nimrod) can assign any engine to any team for any task.

**Future state (S003-P011 scope):**
- Engine-per-team assignments stored in `_COMMUNICATION/agents_os/team_engine_config.json`
- Dashboard UI for editing engine assignments
- CLI override: `--team-engine team_10=claude` syntax
- All engine references in `pipeline.py` GATE_META must load from this config file, not hardcoded

Until that is implemented: use defaults as specified above. Any deviation must be noted in WSM.

---

## §4 — Domain Assignments Summary

| Domain | Implementation Teams | QA | Architecture | Validation |
|---|---|---|---|---|
| **TikTrack** | 10 (gateway), 20, 30, 40, 60 | 50 | 100, 102 | 90, 190 |
| **AOS** | 11 (gateway), 61 (implementor) | 51 | 100, 101 | 90, 190 |
| **BOTH** | 70 (TT: GATE_5 docs), 170 (AOS: GATE_5 docs + spec/governance) | — | 100 | 90, 190, 191 |

---

## §5 — Iron Rules (consolidated from v1.0)

1. **Team 00 = human only.** Never delegate Team 00's decision authority to an AI agent.
2. **Team 50 = QA.** Includes all: E2E, FAV, SOP-013. Team 40 = UI assets only, never QA.
3. **Team 61 = ALL AOS development.** Does not split by layer. No Teams 20/30/40/60 in AOS domain.
4. **Teams 100/101/102 = architectural agents (AI).** Team 00 is their human principal, not a peer.
5. **Team 190 = adversarial.** Must NOT be aware of Teams 100/101/102 conclusions before producing its own validation. Independence is mandatory.
6. **Team 191 = git/backup only.** Never produces code or architectural opinions.
7. **Engine = recommendation.** No team is permanently bound to one engine.
8. **Team 11 = AOS Gateway only.** Never activates Teams 20/30/40/60 or crosses into TikTrack domain. Team 10 and Team 11 are strict domain mirrors — never substitutable.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | TEAM_ROSTER_v2.0.0 | LOCKED | SUPERSEDES_v1.0.0 | TEAM_00_IDENTITY_CORRECTED | TEAM_100_ENGINE_CORRECTED | TEAM_102_ADDED | TEAM_191_ADDED | 2026-03-19**
**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | TEAM_ROSTER_v2.0.0 | AMENDMENT | TEAM_11_AOS_GATEWAY_ADDED | TEAM_10_TIKTRACK_ONLY_CONFIRMED | TEAM_170_AOS_GATE5_ASSIGNED | TEAM_70_TIKTRACK_GATE5_ASSIGNED | 2026-03-19**
**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | TEAM_ROSTER_v2.0.0 | AMENDMENT | VARIANT_RENAME | AOS_COMPACT→TRACK_FOCUSED | STANDARD_AOS/FAST_AOS_REFS_UPDATED | TEAM_101_ROLE_UPDATED | 2026-03-19**
