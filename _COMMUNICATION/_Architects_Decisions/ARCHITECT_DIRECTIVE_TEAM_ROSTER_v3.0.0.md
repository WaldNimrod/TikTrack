---
id: ARCHITECT_DIRECTIVE_TEAM_ROSTER_v3.0.0
from: Team 00 (System Designer — Nimrod)
date: 2026-03-21
historical_record: true
status: LOCKED — Iron Rule
supersedes: ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0 (2026-03-19)
authority: Team 00 constitutional authority + Nimrod approval (session 2026-03-21)
reference_adr: ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0
---

# Architectural Directive — Canonical Team Roster v3.0

## §1 — Critical Changes from v2.0

### Change 1 — Teams 21/31/41 Added (NEW — AOS TRACK_FULL mirrors)
Three new teams added to give AOS domain full symmetry with TikTrack for TRACK_FULL variant.
These teams are active ONLY in AOS TRACK_FULL. In AOS TRACK_FOCUSED, Team 61 covers all.

### Change 2 — Team 61 Redefined (CRITICAL CORRECTION)
**Prior (v2.0 §3):** "Team 61 = ALL AOS development — full-stack. Replaces Teams 20/30/40/60 in AOS domain."
**Corrected (v3.0):** Team 61 = **AOS TRACK_FOCUSED Unified Implementor only.**
- Active ONLY in AOS TRACK_FOCUSED / TRACK_FAST
- NOT active in AOS TRACK_FULL (Teams 21/31/41 active instead)
- Iron Rule v2.0 §3: "Team 61 = ALL AOS development" — **SUPERSEDED**

### Change 3 — Group Classifications Added
All teams now have a canonical group (A/B/C/D) for context injection and mandate templates.

### Change 4 — Team 60 Role Clarified (Conditional)
Team 60 is NOT active by default in TRACK_FULL. Active only when LOD200 sets `requires_devops: true`.

### Change 5 — Iron Rules §3 Superseded
v2.0 Iron Rule §3 ("Team 61 = ALL AOS development") superseded by new §3 (see §5 below).

---

## §2 — Canonical Team Roster v3.0

### Group A — Architecture

| Team | Title | Engine | Domain | Group | Role |
|---|---|---|---|---|---|
| **00** | System Designer (Nimrod) | Human | BOTH | — | **The single human in the organization.** Provides requirements, decisions, instructions. Not an AI agent. |
| **100** | Chief System Architect | Claude Code | BOTH | A | System-level architectural decisions. GATE_2/2.3 spec review. GATE_4/4.2 arch review. Primary spec approver. |
| **110** | AOS Domain Architect (IDE) | Codex (OpenAI) | AOS | A | AOS domain architectural authority. LOD200 production. Substitutes Team 100 in TRACK_FOCUSED/TRACK_FAST for AOS. Roster id **team_110** (formerly **101**). |
| **111** | TikTrack Domain Architect (IDE) | Codex (OpenAI) | TikTrack | A | TikTrack domain architectural authority. *(registered, not yet active)* Roster id **team_111** (formerly **102**). |

### Group B — Execution (TikTrack)

| Team | Title | Engine | Domain | Group | Role |
|---|---|---|---|---|---|
| **10** | TikTrack Gateway | Cursor Composer | TikTrack | B | GATE_3/3.1 mandate generation + GATE_3 coordination. PWA authority. TikTrack domain ONLY. |
| **20** | Backend Implementation | Cursor Composer | TikTrack | B | API, business logic, DB, services. Server-side. Active in TikTrack TRACK_FULL. |
| **30** | Frontend Execution | Cursor Composer | TikTrack | B | UI components, pages, API integration. Client-side. Active in TikTrack TRACK_FULL. Default primary impl in TikTrack TRACK_FOCUSED (LOD200 may override to Team 20). |
| **40** | UI Assets & Design | Cursor Composer | TikTrack | B | Design tokens, CSS, visual consistency. **Advisory only. Never QA. Conditional (LOD200 opt-in).** |
| **60** | DevOps & Platform | Cursor Composer | TikTrack | B | Infrastructure, CI/CD, env, platform readiness. **Conditional — `requires_devops: true` in LOD200 only.** |

### Group B — Execution (AOS)

| Team | Title | Engine | Domain | Group | Role |
|---|---|---|---|---|---|
| **11** | AOS Gateway | Cursor Composer | AOS | B | AOS-domain mirror of Team 10. GATE_3/3.1 mandate generation + GATE_3 coordination. AOS domain ONLY. |
| **21** | AOS Backend Implementation | Cursor Composer | AOS | B | agents_os_v2 backend logic, orchestrator, pipeline. Active in AOS TRACK_FULL only. Mirror of Team 20. **NEW** |
| **31** | AOS Frontend / UI Execution | Cursor Composer | AOS | B | agents_os/ui pages, dashboard components, JS logic. Active in AOS TRACK_FULL only. Mirror of Team 30. **NEW** |
| **41** | AOS UI Assets & Design | Cursor Composer | AOS | B | AOS design tokens, CSS architecture, visual consistency. Advisory. Conditional (LOD200). Mirror of Team 40. **NEW** |
| **61** | AOS Unified Implementor | Cursor Composer | AOS | B | **TRACK_FOCUSED/TRACK_FAST only.** Covers full AOS implementation (backend + frontend + design) in single context. NOT active in AOS TRACK_FULL (Teams 21/31/41 used instead). |

### Group C — Validation

| Team | Title | Engine | Domain | Group | Role |
|---|---|---|---|---|---|
| **50** | QA & FAV | Cursor Composer | TikTrack | C | All QA: E2E, regression, FAV, SOP-013. GATE_3/3.3 + GATE_4. **Correction cycle orchestrator (TikTrack).** |
| **51** | QA & FAV — AOS | Cursor Composer | AOS | C | Mirror of Team 50, AOS domain. **Correction cycle orchestrator (AOS).** |
| **90** | Validation Authority | Codex (OpenAI) | BOTH | C | GATE_4/4.1 dev validation + GATE_5/5.2 closure validation. FCP authority. |
| **190** | Constitutional Validator | Codex (OpenAI) | BOTH | C | **Adversarial architectural validator ("Spy").** Must NOT see Teams 100/110/111 conclusions before own output. Independence is absolute. Cross-domain, fixed — always active regardless of department definition. |

### Group D — Documentation/Control

| Team | Title | Engine | Domain | Group | Role |
|---|---|---|---|---|---|
| **70** | TikTrack Documentation | Cursor Composer | TikTrack | D | Technical writing, AS_MADE documentation, GATE_5/5.1. TikTrack domain only. |
| **170** | AOS Spec & Governance | Cursor Composer | AOS | D | LOD200/LLD400 production (AOS), registry sync, canonical doc maintenance. **GATE_5/5.1 for AOS domain.** |
| **191** | GitHub & Backup | Codex (OpenAI) | BOTH | D | Git operations, PR creation, backup. Never produces code or architectural opinions. |

---

## §3 — Department Definition (Program-Level Role Mapping)

Each Work Package carries a `program_department` block in pipeline_state, defining which team fills each canonical role:

```json
{
  "program_department": {
    "domain": "tiktrack | agents_os",
    "variant": "TRACK_FULL | TRACK_FOCUSED | TRACK_FAST",
    "roles": {
      "domain_gateway":       "team_10",
      "backend_impl":         "team_20",
      "frontend_impl":        "team_30",
      "qa_authority":         "team_50",
      "validation_authority": "team_90",
      "doc_closure":          "team_70",
      "spec_author":          "team_110",
      "arch_reviewer":        "team_100"
    },
    "optional_active": {
      "design_advisory":      false,
      "devops":               false
    }
  }
}
```

### Default Assignments per Variant

| Role | TT+TRACK_FULL | TT+TRACK_FOCUSED | AOS+TRACK_FULL | AOS+TRACK_FOCUSED |
|---|---|---|---|---|
| domain_gateway | team_10 | team_10 | team_11 | team_11 |
| backend_impl | team_20 | team_30* | team_21 | team_61 |
| frontend_impl | team_30 | team_30* | team_31 | team_61 |
| design_advisory | team_40 (opt) | — | team_41 (opt) | — |
| devops | team_60 (opt) | — | — | — |
| qa_authority | team_50 | team_50 | team_51 | team_51 |
| validation_authority | team_90 | team_90 | team_90 | team_90 |
| doc_closure | team_70 | team_70 | team_170 | team_170 |
| spec_author | team_110 | team_110 | team_110 | team_110 |
| arch_reviewer | team_100 | team_100 | team_100/110 | team_110 |
| adversarial_validator | **team_190 (fixed)** | **team_190 (fixed)** | **team_190 (fixed)** | **team_190 (fixed)** |

*TikTrack TRACK_FOCUSED: default impl = team_30. LOD200 may override to team_20 if WP is backend-heavy.

### Role → Pipeline Stage Matrix

| Gate/Phase | Required Role |
|---|---|
| GATE_1/1.1 | spec_author |
| GATE_1/1.2 | adversarial_validator (fixed) |
| GATE_2/2.2 | domain_gateway |
| GATE_2/2.3 | arch_reviewer |
| GATE_3/3.1 | domain_gateway |
| GATE_3/3.2 | backend_impl + frontend_impl + [design_advisory] + [devops] |
| GATE_3/3.3 | qa_authority |
| GATE_4/4.1 | validation_authority |
| GATE_4/4.2 | arch_reviewer |
| GATE_4/4.3 | arch_reviewer (senior) |
| GATE_5/5.1 | doc_closure |
| GATE_5/5.2 | validation_authority |
| Correction cycle | qa_authority (orchestrator) |

**Pipeline enforcement:** Missing role assignment at any stage = BLOCKING FINDING. Pipeline must not advance past GATE_0 without complete `program_department`.

---

## §4 — Domain + Variant Routing Summary

### TikTrack

| Variant | GATE_3/3.2 implementation | GATE_3/3.3 QA | GATE_4 QA |
|---|---|---|---|
| TRACK_FULL | teams_20_30_40 (+ team_60 if required) | team_50 | team_50 |
| TRACK_FOCUSED | team_30 (default) or team_20 (LOD200 override) | team_50 | team_50 |

### AOS (Agents_OS)

| Variant | GATE_3/3.2 implementation | GATE_3/3.3 QA | GATE_4 QA |
|---|---|---|---|
| TRACK_FULL | teams_21_31_41 (+ team_60 if required) | team_51 | team_51 |
| TRACK_FOCUSED | team_61 | team_51 | team_51 |

---

## §5 — Iron Rules v3.0 (consolidated + updated)

1. **Team 00 = human only.** Never delegate Team 00's decision authority to an AI agent.
2. **Team 50 = TikTrack QA.** All: E2E, FAV, SOP-013. Team 40 = UI assets only, never QA.
3. **Team 61 = AOS TRACK_FOCUSED unified implementor.** Active ONLY in TRACK_FOCUSED/TRACK_FAST. NOT in AOS TRACK_FULL (Teams 21/31/41 used instead). **SUPERSEDES v2.0 §3.**
4. **Teams 21/31/41 = AOS TRACK_FULL specialists.** Active ONLY in AOS TRACK_FULL. NOT in TRACK_FOCUSED/TRACK_FAST.
5. **Team 60 = conditional.** `requires_devops: true` in LOD200 only. Never auto-included.
6. **TRACK_FULL vs TRACK_FOCUSED:** The ONLY difference = implementation team consolidation. All other roles (QA, gateway, doc, validation) are identical.
7. **Teams 100/110/111 = architectural agents (AI).** Team 00 is their human principal, not a peer.
8. **Team 190 = adversarial, fixed, cross-domain.** Must NEVER see Teams 100/110/111 conclusions before own validation. Does not appear in department.roles — always active as `adversarial_validator`.
9. **Team 191 = git/backup only.** Never produces code or architectural opinions.
10. **Team 10 and Team 11 = strict domain mirrors.** Never substitutable across domains.
11. **Missing role = BLOCKING.** Pipeline must detect missing `program_department` role at GATE_0 and block advance.
12. **Engine = recommendation.** No team is permanently bound to one engine.

---

## §6 — Teams Naming Convention (Canonical)

| Pattern | Meaning |
|---|---|
| 1X (10, 11) | Gateways (domain-specific) |
| 2X (20, 21) | Backend Implementation (TikTrack, AOS) |
| 3X (30, 31) | Frontend Execution (TikTrack, AOS) |
| 4X (40, 41) | UI Assets & Design (TikTrack, AOS) |
| 5X (50, 51) | QA & FAV (TikTrack, AOS) |
| 60 | DevOps (TikTrack, conditional) |
| 61 | AOS Unified Implementor (TRACK_FOCUSED only) |
| 70 | TikTrack Documentation |
| 9X (90) | Validation Authority (BOTH) |
| 10X (100, 110, 111) | Architecture (Chief, AOS IDE, TikTrack IDE) |
| 17X (170) | AOS Spec & Governance |
| 19X (190, 191) | Constitutional + GitHub |

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | TEAM_ROSTER_v3.0.0 | LOCKED | SUPERSEDES_v2.0.0 | TEAMS_21_31_41_ADDED | TEAM_61_REDEFINED | TEAM_60_CONDITIONAL | DEPARTMENT_DEFINITION_ADDED | IRON_RULES_UPDATED | NAMING_CONVENTION_LOCKED | 2026-03-21**
