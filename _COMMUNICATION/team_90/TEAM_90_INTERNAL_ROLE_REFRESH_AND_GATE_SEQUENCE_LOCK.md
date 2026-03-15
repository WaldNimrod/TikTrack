# TEAM_90_INTERNAL_ROLE_REFRESH_AND_GATE_SEQUENCE_LOCK

**project_domain:** SHARED  
**id:** TEAM_90_INTERNAL_ROLE_REFRESH_AND_GATE_SEQUENCE_LOCK  
**from:** Team 90 (External Validation Unit)  
**to:** Team 90 (Internal enforcement)  
**cc:** Team 10, Team 100, Team 00  
**date:** 2026-02-26  
**status:** LOCKED_FOR_OPERATION  
**scope_id:** ALL_STAGES_ALL_WORK_PACKAGES  

---

## 1) Canonical anchors (must-use)

0. `00_MASTER_INDEX.md` (root) §Active agent context — רשימת מסמכים פעילים; נוהל איגנטים: AGENTS_OS_V2_OPERATING_PROCEDURES.
1. `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
3. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
4. `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`

No decision may be issued from non-canonical or legacy path references.

---

## 2) Team 90 role lock (no drift)

- Team 90 is validation authority for Channel 10<->90.
- Team 90 is gate owner for GATE_5, GATE_6, GATE_7, GATE_8.
- Team 90 performs G3.5 work-plan validation inside GATE_3 (gate_id stays `GATE_3`).
- Team 90 updates WSM only on owned gate closures (G5-G8).

Team 90 does not:
- run QA (Team 50 responsibility),
- execute development implementation (Teams 20/30/40/60),
- promote knowledge (Team 70 responsibility).

---

## 3) Deterministic sequence enforcement

For execution lifecycle:
1. G3.1-G3.4 (Team 10 preparation)
2. G3.5 validation by Team 90 (PASS required before G3.6)
3. G3.6-G3.9 (Team 10 implementation orchestration)
4. GATE_4 QA PASS (Team 50)
5. GATE_5 validation (Team 90)
6. GATE_6 workflow managed by Team 90; approval authority Team 100/00
7. GATE_7 human approval operated by Team 90
8. GATE_8 documentation closure owned by Team 90; lifecycle closes only on PASS

No bypass of this order is allowed.

---

## 3.1) Gate-owner duty lock (PASS does not end Team 90 cycle)

For Team 90-owned gates (GATE_5..GATE_8), PASS is not terminal.
Team 90 must complete this chain in the same operational cycle:

1. Publish canonical gate decision artifact (PASS/BLOCK/HOLD).
2. Update WSM CURRENT_OPERATIONAL_STATE.
3. Publish next-gate activation/handoff artifact per sequence.
4. Notify Team 10 with explicit next action and authority owner.

If any of the four steps is missing, gate handling is incomplete.

---

## 3.2) Team 90 task matrix by gate

| Gate | Team 90 mandatory output | Required next trigger by Team 90 |
|---|---|---|
| G3.5 | VALIDATION_RESPONSE or BLOCKING_REPORT | On PASS: allow Team 10 to open G3.6 |
| GATE_5 | VALIDATION_RESPONSE or BLOCKING_REPORT or HOLD_REPORT | On PASS: open GATE_6 workflow and submit architect package |
| GATE_6 | Gate-opening workflow tracking + decision relay | On APPROVED: activate GATE_7 human scenarios |
| GATE_7 | Human PASS/FAIL decision artifact | On PASS: activate Team 70 for GATE_8 |
| GATE_8 | VALIDATION_RESPONSE + closure report to Team 10 | On PASS: set DOCUMENTATION_CLOSED in WSM |

---

## 3.3) GATE_7 operating mode lock (human-only semantics)

For every GATE_7 cycle, Team 90 must:

1. Issue a human-execution scenario artifact to the human approver (browser UI or dedicated verification page).
2. Define concrete UI flows (for example: create, edit, delete, toggle, filter, validation errors).
3. Include edge cases and wrong-value checks where relevant.
4. Ensure the scenarios cover the intended API surface through UI behavior, not through direct API commands by the human approver.
5. Explicitly avoid terminal commands, shell scripts, log review, `/tmp` checks, or file-presence checks as the main human approval method.
6. Accept human response in Hebrew (`אישור` / `פסילה`) and normalize it into the canonical GATE_7 decision artifact.

If there is no production UI flow (infrastructure scope), Team 90 must provide a dedicated verification UI/test page before running GATE_7.
If Team 90 issues a command-line-based GATE_7 prompt as the primary approval route, that GATE_7 package is procedurally non-compliant and must be corrected before human execution.

---

## 3.4) WSM update SLA (Team 90-owned gates)

Decision -> WSM update -> next-gate trigger, same cycle.
No deferred updates and no partial closure.

For BLOCK/HOLD, WSM must include blocker id, gate status, next required action, and next responsible team.

---

## 3.5) GATE_7 human-execution pack (always required)

When GATE_7 is activated and a human approver is the executor, Team 90 must publish the full execution pack proactively (without waiting for an extra request):

1. `...GATE7_HUMAN_APPROVAL_SCENARIOS...` with exact browser steps and expected results.
2. Internal normalization rule: Team 90 ingests free-text Hebrew feedback from the approver and converts it to canonical decision artifacts (no external human template required).
3. Coverage matrix mapping scenario ids to validated scope requirements.

Operational rule:
- No generic guidance only. Team 90 must deliver runnable scenario instructions with deterministic PASS/FAIL criteria every time.

---

## 4) Artifact enforcement (Channel 10<->90)

- Request path: `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_<WORK_PACKAGE_ID>_VALIDATION_REQUEST.md`
- PASS path: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_<WORK_PACKAGE_ID>_VALIDATION_RESPONSE.md`
- FAIL path: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_<WORK_PACKAGE_ID>_BLOCKING_REPORT.md`

Identity header is mandatory and must include:
`roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage`.

---

## 5) Validation output contract — ALL gate verdicts (IRON RULE — 2026-03-15)

**Authority:** `ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md`

Team 90 validation result artifacts (VALIDATION_RESPONSE, BLOCKING_REPORT, gate decision documents) contain **findings and verdict only**. The canonical output structure:

```
verdict:       PASS | FAIL | BLOCK
gate_id:       <GATE_X>
wp_id:         <work_package_id>
findings:      [...findings with severity + exact evidence-by-path...]
severity_map:  { blocker: N, high: N, medium: N, low: N }
pass_criteria: [...what was checked, what passed...]
```

### PERMANENTLY PROHIBITED inside validation result artifacts:
- `owner_next_action` — **FORBIDDEN. Iron Rule.**
- "Team X should do Y next" — routing is the pipeline's responsibility
- Submission path instructions embedded in the verdict document

### Behavioral anchor:
> If you feel the urge to add a routing section telling another team what to do — STOP. That belongs in a **separate** handoff/activation document (§3.1 above), never inside the validation result artifact. Redirect the impulse into more precise evidence paths.

**This prohibition applies to the verdict document.** Separate activation/handoff prompts remain permitted per §3.1 Mode 1 duty (these are standalone routing documents — distinct from the verdict artifact).

### PASS output contract (mandatory — all gates):

1. Numbered findings only (`B-...-001`, `B-...-002`, ...) for FAIL/BLOCK.
2. For each finding: severity, exact artifact path, root cause, exact required fix, acceptance check.
3. Deterministic re-submission checklist (1..N) for BLOCK.
4. No-guess rule statement.
5. Expected re-submission artifact names and canonical paths.

---

## 6) Supersedence rule

This document is Team 90 permanent internal operating lock and applies across all stages and work packages.

---

**log_entry | TEAM_90 | INTERNAL_ROLE_REFRESH_GLOBAL | ALL_STAGES_ALL_WORK_PACKAGES | LOCKED_FOR_OPERATION | 2026-02-26**
**log_entry | TEAM_90 | GATE_OWNER_DUTY_LOCK | PASS_REQUIRES_NEXT_GATE_TRIGGER | 2026-02-26**
**log_entry | TEAM_90 | GATE7_SCOPE_OVERRIDE_RULE | ARCHITECT_AUTHORIZED_INFRA_ROUTING_ALLOWED | 2026-03-08**
**log_entry | TEAM_90 | GATE7_EXECUTION_PACK_RULE | SCENARIOS_COVERAGE_ALWAYS_REQUIRED | 2026-03-10**
**log_entry | TEAM_90 | GATE7_HUMAN_ONLY_LOCK | HUMAN_APPROVER_EXECUTION_REQUIRED_ALL_SCOPES | 2026-03-10**
**log_entry | TEAM_90 | GATE7_FEEDBACK_NORMALIZATION_LOCK | FREE_TEXT_HEBREW_TO_CANONICAL_DECISION | 2026-03-10**
