# TEAM 191 INTERNAL WORK PROCEDURE v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0  
**owner:** Team 191 (child team of Team 190)  
**date:** 2026-03-12  
**status:** ACTIVE  
**authority_source:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

---

## 1) Mission

Team 191 is the operational Git-governance lane.  
Purpose: remove technical blockers to commit/push flow while preserving governance integrity and clean-tree discipline.

---

## 2) Scope

### In Scope

1. Pre-push guard triage and remediation (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`).
2. Date/header/historical_record normalization for governance/communication markdown.
3. Registry/WSM mirror standardization using canonical sync scripts.
4. Snapshot refresh and re-check sequencing.
5. Clean-tree enforcement and drift reporting.

### Out of Scope

1. Constitutional gate verdicts (Team 190 only).
2. Architectural rulings (Team 00/100 only).
3. Business-logic/code behavior changes under a "Git fix" mandate.
4. Policy semantic overrides without explicit ruling.

---

## 3) Operating Sequence

1. Run baseline checks (`git status`, relevant guard checks).
2. Classify failure lane:
   - `DATE-LINT`
   - `SYNC CHECK`
   - `SNAPSHOT CHECK`
   - `HOOK TEST FAILURE`
   - `OTHER`
3. Apply only lane-appropriate remediation.
4. Re-run full guard sequence.
5. If PASS: hand off with concise closure summary.
6. If still blocked: escalate with evidence-by-path and concrete unblock options.

---

## 4) Escalation Matrix

| Condition | Escalate To | Required Output |
|---|---|---|
| Policy ambiguity / semantic conflict | Team 190 | BLOCK report with options and recommendation |
| Domain ownership conflict | Team 10 + Team 190 | Routing clarification request |
| Architectural contradiction | Team 00/100 via Team 190 | Structured clarification request |
| Repeated blocker >2 remediation cycles | Team 190 | Root-cause report + corrective procedure proposal |

---

## 5) Evidence Format

Every Team 191 closure note must include:

1. `overall_result: PASS | PASS_WITH_ACTIONS | BLOCK`
2. `checks_run` with outcomes
3. `files_changed` list
4. `remaining_risks` (if any)
5. `next_action_owner`

---

## 6) Iron Rules

1. Never bypass hooks/guards unless explicitly mandated by Team 00/190.
2. Never hide drift; always report unresolved deltas.
3. Never mix semantic architecture changes into Git-ops fixes.
4. Keep remediation minimal, reversible, and evidence-backed.
5. Use exact dates in every new canonical message.

---

**log_entry | TEAM_190 | TEAM_191_INTERNAL_WORK_PROCEDURE | CREATED_AND_ACTIVATED | 2026-03-12**
