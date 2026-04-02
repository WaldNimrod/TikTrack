date: 2026-03-26
historical_record: true

⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

## Team 90 — Work Plan Validator (Phase 2.2v)

**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S003-P011-WP002 | stage=S003 | 2026-03-26

---

# G3.5 — Validate Work Plan  [FIRST RUN]

**WP:** `S003-P011-WP002`

Validate this work plan for implementation readiness.
Check: completeness, team assignments, deliverables, test coverage.

## MANDATORY: route_recommendation

**If FAIL — include at the top of your response:**

```
route_recommendation: doc
```  ← plan has format/governance/wording issues only
```
route_recommendation: full
``` ← plan has structural/scope/logic problems

Classification:
- `doc`: blockers are grammar, missing paths, credential text, format-only
- `full`: scope unclear, wrong team assignments, missing deliverables, logic errors

This field drives automatic pipeline routing. Missing = manual block.

Respond with: PASS or FAIL + blocking findings.

## Work Plan

Team 20 | x
Team 30 | y