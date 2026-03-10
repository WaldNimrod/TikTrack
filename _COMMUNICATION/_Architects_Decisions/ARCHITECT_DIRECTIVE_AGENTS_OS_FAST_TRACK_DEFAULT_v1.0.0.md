---
**project_domain:** AGENTS_OS
**id:** ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0
**from:** Team 00 (Chief Architect — Nimrod)
**to:** Team 10 (Gateway), Team 61 (Implementation), Team 170 (Spec & Governance)
**cc:** Team 90, Team 100, Team 190
**date:** 2026-03-10
**status:** LOCKED — ACTIVE
**supersedes:** FAST_TRACK_EXECUTION_PROTOCOL v1.0.0 (domain-specific amendment)
**canonical_basis:** 04_GATE_MODEL_PROTOCOL_v2.3.0, FAST_TRACK_EXECUTION_PROTOCOL_v1.0.0
---

# ARCHITECT DIRECTIVE — AGENTS_OS Fast Track as Default

---

## §1 Purpose

Define **domain-specific** application of the Fast Track protocol. For **AGENTS_OS domain only**, Fast Track is the **default** execution path (not optional). All other domains (TIKTRACK) retain LOCKED_OPTIONAL as per v1.0.0.

---

## §2 Decision Summary

| Item | Decision |
|------|----------|
| **Scope** | AGENTS_OS domain only |
| **Default** | Fast Track = **default** execution path for Agents_OS WPs |
| **Active teams** | 61 (executor), 100 (architect), 90 or 190 (validation), 170 (documentation), **51 (QA)** |
| **Inactive** | All other teams (20, 30, 40, 50, 60, 70) — not active in Agents_OS fast track |
| **QA step** | **Mandatory** — equivalent to GATE_5; assigned to **Team 51** |

---

## §3 Team Mapping (Agents_OS Fast Track)

| Squad ID | Role in Fast Track |
|----------|--------------------|
| **Team 61** | Executor — implementation (Cursor agent) |
| **Team 100** | Architectural authority |
| **Team 90** | Validation (can perform) |
| **Team 190** | Validation (can perform) |
| **Team 170** | Documentation closure |
| **Team 51** | **QA dedicated to Agents_OS** — GATE_5 equivalent; Cursor agent |

All other squads (20, 30, 40, 50, 60, 70) are **not active** in the Agents_OS fast-track flow.

---

## §4 Team 51 — Agents_OS QA Agent

**Definition:** Team 51 is the **dedicated QA agent** for the Agents_OS domain. A Cursor agent persona.

| Field | Value |
|-------|-------|
| Team ID | 51 |
| Name | Agents_OS QA Agent |
| Role | QA (GATE_5 equivalent) for agents_os_v2/ and pipeline deliverables |
| Engine | Cursor (local or cloud) |
| Scope | `agents_os_v2/`, pipeline tests, quality evidence for fast-track WPs |
| Authority | Run pytest, mypy, quality checks; produce QA report; block PASS until criteria met |

---

## §5 Mandatory QA Step

The Fast Track for Agents_OS **must include** a QA step equivalent to GATE_5 in the full flow.

- **Owner:** Team 51
- **Insertion:** Between execution (FAST_2) and human sign-off (FAST_3)
- **Sequence:** FAST_0 → FAST_1 → FAST_2 → **FAST_2.5 (QA)** → FAST_3 → FAST_4

**FAST_2.5 (QA)** — Required action:
- Team 51 executes: pytest, mypy, quality scans per WP scope
- Produce QA report with PASS/FAIL per criterion
- Block progression to FAST_3 until QA PASS

---

## §6 Implementation

1. **Team 61:** Produce amended FAST_TRACK_EXECUTION_PROTOCOL v1.1.0 with Agents_OS-specific sections
2. **Team 170:** Promote to `documentation/docs-governance/04-PROCEDURES/`
3. **Team 61:** Add `team_51.md` identity to `agents_os_v2/context/identity/`; add team_51 to `TEAM_ENGINE_MAP` in config.py
4. **Team 10:** Update orchestration logic to route Agents_OS WPs to Fast Track by default

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT | ISSUED | 2026-03-10**
