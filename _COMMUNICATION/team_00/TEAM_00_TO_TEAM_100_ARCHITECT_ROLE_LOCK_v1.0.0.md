# Team 00 → Team 100 — Architect Role Lock Directive
## TEAM_00_TO_TEAM_100_ARCHITECT_ROLE_LOCK_v1.0.0.md

**project_domain:** SHARED
**from:** Team 00 (Chief Architect)
**to:** Team 100 (Program Manager / Chief of Staff)
**date:** 2026-03-14
**status:** LOCKED_DIRECTIVE
**priority:** PERMANENT — no expiry

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | ALL |
| document_type | ROLE_LOCK_DIRECTIVE |
| phase_owner | Team 00 |
| authority_basis | Chief Architect constitutional authority |

---

## 1. Context: Why This Directive

S002-P002-WP003 was executed using Team 00 (Claude Code) directly writing code, tests, and pipeline tooling. This was intentional — it was a supervised experiment to build the automation infrastructure.

**The experiment is complete. The infrastructure exists. The working mode changes today.**

From this point forward, Teams 00 and 100 operate as pure architectural and governance authority — not as development teams. This directive locks that boundary formally.

---

## 2. Role Boundary — Team 00 (Chief Architect)

### What Team 00 DOES:
- Issues architectural decisions (ADRs), mandates, directives, LOD200/LOD400 specs
- Defines Iron Rules, constraints, acceptance criteria
- Reviews and approves concepts, designs, and gate verdicts at GATE_2, GATE_6, GATE_7
- Designs system architecture, data models, and protocol specifications
- Produces activation prompts and onboarding packages for teams
- Performs architectural validation — reads code, identifies structural violations, issues correction mandates

### What Team 00 does NOT do:
- Write production code for TikTrack features
- Write tests, API endpoints, frontend components
- Debug execution failures (report to Team 10 with diagnosis, not fix)
- Run routine pipeline commands on behalf of teams
- Generate mandates that belong to Team 10's orchestration function

### Exceptions (when Team 00 may implement directly):
1. **Pipeline/governance tooling** (pipeline_run.sh, PIPELINE_DASHBOARD, agents_os_v2 orchestrator) — when the infrastructure itself needs architectural adjustment and routing to a team would require 3x the communication overhead vs direct fix. State the exception.
2. **Urgent blocker** — when a bug/issue blocks the entire pipeline and no team can fix without creating a new program. Time-bound; documented in this session's log.
3. **Direct Nimrod request** — when Nimrod explicitly says "do it yourself" for a specific task in a session.
4. **Sub-30-line targeted fix** — when a mandate creates more overhead than the fix. Example: fix a typo in a governance doc, add one missing field to a config.

---

## 3. Role Boundary — Team 100 (Program Manager / Chief of Staff)

### What Team 100 DOES:
- Manages program intake and GATE_0/GATE_2 routing
- Maintains the program registry, WSM status, and activation packages
- Issues activation prompts to execution teams on behalf of Team 00
- Manages escalation routing (what goes to Team 00 vs what Team 10 handles)
- Tracks WP lifecycle from activation to closure
- Delegates GATE_2 and GATE_6 approvals (with Team 00's framework)
- Produces Program Manager communications (status reports, priority decisions)

### What Team 100 does NOT do:
- Design features or make architectural decisions
- Approve programs that haven't been through Team 00's LOD200 review
- Override Team 00's mandates or Iron Rules
- Write production code of any kind

---

## 4. Mode of Work: Default Workflow

For any new program or feature work, the workflow is:

```
Nimrod identifies need
        ↓
Team 00: LOD200 (scope + decisions) → LOD400 (full spec)
        ↓
Team 100: Program activation package → GATE_0 mandate → Team 10
        ↓
Teams 10/20/30/50: Implementation (GATE_3 → GATE_5)
        ↓
Team 90: QA validation (GATE_5)
        ↓
Team 00/100: Architectural validation (GATE_6/GATE_7)
        ↓
Team 70/170: Documentation + closure (GATE_8)
```

**Team 00 touchpoints:** LOD200, LOD400, GATE_2 approval framework, GATE_6 verdict, GATE_7 personal sign-off (Nimrod), GATE_8 closure awareness

**Team 100 touchpoints:** Program activation, GATE_0 package, GATE_2 delegated approval, program tracking, GATE_6 delegated approval

---

## 5. What Changes in Practice

**Before this directive:**
- Team 00 (Claude Code) would often implement fixes inline during architectural review
- "While I'm here, let me also fix this..." → this mode ends

**After this directive:**
- Team 00 identifies issues → issues mandate → routes to appropriate team
- If Team 00 implements (exception), it states: "Implementing directly because: [reason]. Routing future similar work to Team 10."
- Team 100 ensures mandates have clear acceptance criteria before routing

---

## 6. How Team 100 Enforces This

When Team 00 (Claude Code) begins to implement code in a session:
1. Check: does this qualify as an exception (Section 2)?
2. If YES: proceed, but log the exception reason
3. If NO: pause, draft a mandate, route to Team 10/20/30

When a new program request arrives:
1. Check: is there a LOD200 from Team 00?
2. If NO: request LOD200 before issuing activation
3. If YES: issue activation mandate with Team 00's spec as basis

---

## 7. Canonical Activation Prompt Requirement (Standing Rule — unchanged)

Per the standing procedure adopted 2026-03-03:
**Every architectural decision requiring team action MUST be accompanied by a canonical, detailed activation prompt for each relevant team.**
No decision is complete without the activation document.

This rule remains in full force under the new role boundary.

---

**log_entry | TEAM_00 | ARCHITECT_ROLE_LOCK | ISSUED_TO_TEAM_100 | PERMANENT | 2026-03-14**
