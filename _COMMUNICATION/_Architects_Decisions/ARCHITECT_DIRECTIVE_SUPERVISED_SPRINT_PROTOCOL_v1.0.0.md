---
project_domain: AGENTS_OS
id: ARCHITECT_DIRECTIVE_SUPERVISED_SPRINT_PROTOCOL_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
authority: CONSTITUTIONAL
date: 2026-03-19
status: ACTIVE — BINDING ON ALL TEAMS
applies_to: S003-P010-WP001 and any future WP where pipeline is the deliverable---

# ARCHITECT DIRECTIVE — Supervised Sprint Protocol
## Implementation Pattern for Pipeline-as-Deliverable Work Packages

---

## 1. The Problem

The pipeline (`pipeline_run.sh` + `pipeline.py`) is both:
- **The governance instrument** — the mechanism through which all work is tracked and validated
- **The deliverable** — what S003-P010 is building and fixing

This creates a structural contradiction: we cannot use the broken tool to fix the broken tool.
Running P010 through the standard GATE_0→GATE_8 pipeline would cost 10× more overhead than the work itself.

**Additionally:** Standard pipeline governance requires teams to update the WSM at specific gates. Teams are prohibited from editing WSM directly. This creates a deadlock when the pipeline itself is non-functional.

---

## 2. The Supervised Sprint Protocol

### 2.1 Definition

A **Supervised Sprint** is a governance-compliant implementation pattern used when:
- The pipeline itself is the deliverable (can't use broken tool to fix it), OR
- Overhead of full gate ceremony exceeds value of the work, AND
- Work scope is well-defined with clear acceptance criteria, AND
- Team 00 (Nimrod) personally supervises and validates each phase

### 2.2 Key Properties

| Property | Standard Pipeline | Supervised Sprint |
|---|---|---|
| Gate ceremony | GATE_0 → GATE_8 | Phases with internal ACs |
| WSM updates | Auto via pipeline | Manual by Team 00 (EXPLICIT_WSM_PATCH) |
| Team 190 validation | GATE_0, GATE_1 | Replaced by Team 00 direct review |
| Team 90 validation | GATE_5 | Replaced by Team 00 direct review |
| Governance record | pipeline_state.json | Sprint log in WP document |
| Audit trail | pipeline_events.jsonl | EXPLICIT_WSM_PATCH log entries |

### 2.3 What Is NOT Bypassed

Even in a Supervised Sprint:
- LOD200 spec MUST exist and be approved by Team 00 before implementation starts ✅ (done)
- Acceptance criteria MUST be defined per phase ✅ (in consolidated LOD200)
- All code changes go through Team 61 (Cursor) — Team 00 does not write production code
- WSM is updated with proper EXPLICIT_WSM_PATCH tags
- Work package is registered in PHOENIX_WORK_PACKAGE_REGISTRY
- Completion is recorded in WSM and registry

---

## 3. WSM Update Authority During Supervised Sprint

**Rule:** Team 00 (Nimrod) holds EXPLICIT_WSM_PATCH authority for the duration of the sprint.

**Pattern:**
```
Sprint start → Team 00 writes WSM EXPLICIT_WSM_PATCH: WP ACTIVE
Phase N done → Team 00 writes WSM EXPLICIT_WSM_PATCH: Phase N COMPLETE
Sprint end   → Team 00 writes WSM EXPLICIT_WSM_PATCH: WP DOCUMENTATION_CLOSED
```

Each WSM edit MUST include in its log_entry:
`EXPLICIT_WSM_PATCH | SUPERVISED_SPRINT | {reason}`

**Prohibition:** No other team edits WSM during a Supervised Sprint. Team 61 writes only to `agents_os_v2/` and `pipeline_run.sh`.

---

## 4. Activation Conditions

A Supervised Sprint may be activated ONLY when ALL of:
1. Team 00 explicitly declares it (in this directive or a successor)
2. LOD200 spec exists and is approved
3. The work is scoped to a single domain (no cross-domain side effects)
4. Team 00 is available to supervise each phase completion

**This directive activates Supervised Sprint for S003-P010-WP001.**

---

## 5. Completion and Re-entry to Normal Pipeline

Upon Supervised Sprint completion:
1. Team 00 updates WSM: WP DOCUMENTATION_CLOSED
2. Team 170 updates registries (WP registry + Program registry status)
3. Next WP (S003-P011) uses the **repaired pipeline** for its standard GATE_0→GATE_8 cycle

The Supervised Sprint is a one-time exception instrument, not a new default mode.

---

**log_entry | TEAM_00 | SUPERVISED_SPRINT_PROTOCOL | ACTIVE_APPLIES_TO_S003_P010_WP001 | 2026-03-19**
