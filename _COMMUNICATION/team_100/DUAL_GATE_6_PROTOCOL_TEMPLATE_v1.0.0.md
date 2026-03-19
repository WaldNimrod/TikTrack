---
project_domain: AGENTS_OS
id: DUAL_GATE_6_PROTOCOL_TEMPLATE_v1.0.0
from: Team 100 (AOS Domain Architects — primary author per OI-03)
to: Team 101 (IDE Architecture Authority — adoption and local execution)
cc: Team 00 (Chief Architect)
date: 2026-03-17
historical_record: true
status: ACTIVE — PROTOCOL PUBLISHED
scope: GATE_6 dual architectural validation for AGENTS_OS domain WPs
first_application: S003-P001 (Data Model Validator) test flight
authority: TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0 §6.3
---

# Dual GATE_6 Protocol — Architectural Reality Review
## Team 100 + Team 101 Joint Validation

---

## §1 — Why Dual Validation Exists

Single-team GATE_6 produces a single LLM's architectural opinion. For AGENTS_OS programs — where the pipeline itself is both the product and the delivery vehicle — architectural drift carries compounded risk: a blind spot in one engine propagates without correction.

The Dual GATE_6 Protocol mandates that **both architectural teams independently validate**, then consolidate. This applies the Cross-Engine Validation Iron Rule (ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE) at the architectural review gate.

**Team 100** (Gemini) — domain architect, structural authority, owns GATE_6 verdict in FAIL_ROUTING.
**Team 101** (Cursor/Claude) — IDE authority, runtime execution proximity, implementation fidelity lens.

---

## §2 — Protocol Rules

### 2.1 Independence Requirement

Team 100 and Team 101 must produce verdicts **independently before any cross-consultation**. Neither team reads the other's verdict before completing their own review.

Execution sequence:
1. Operator sends identical prompt content to both teams simultaneously (Phase 1)
2. Both teams respond independently with their verdict
3. Operator reads both verdicts and applies consolidation rule (Phase 2)
4. If consolidated result = PASS → pipeline advances via `./pipeline_run.sh --domain agents_os pass`
5. If consolidated result = FAIL → operator routes per the combined finding list

### 2.2 Consolidation Rule

| Team 100 | Team 101 | Consolidated Result |
|----------|----------|-------------------|
| PASS | PASS | ✅ **DUAL PASS** — advance pipeline |
| PASS | FAIL | ⚠️ **BLOCKED** — Team 101 findings must be resolved |
| FAIL | PASS | ⚠️ **BLOCKED** — Team 100 findings must be resolved |
| FAIL | FAIL | 🔴 **DUAL FAIL** — route per combined findings |

**A single FAIL from either team blocks the gate.** There is no majority voting. Both teams must independently PASS.

### 2.3 Route Recommendation on FAIL

When either team FAILs, the route recommendation from the failing team governs:
- If both teams FAIL with different routes: `full` takes precedence over `doc`
- Route proceeds via standard `./pipeline_run.sh --domain agents_os fail "reason" && ./pipeline_run.sh --domain agents_os route doc|full "notes"`

---

## §3 — The Dual GATE_6 Prompt Template

The following block is the actual prompt template. For each GATE_6 review, substitute `[WP_ID]`, `[SPEC_CONTENT]`, and `[IMPLEMENTATION_SUMMARY]` with the actual values from the pipeline state.

---

```
**ACTIVE: DUAL GATE_6 | Team [100 / 101] (Architectural Review)**
gate=GATE_6 | wp=[WP_ID] | stage=[STAGE_ID] | domain=agents_os | date=[DATE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DUAL GATE_6 — INDEPENDENT ARCHITECTURAL REALITY REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Your team: [Team 100 (AOS Domain Architects) / Team 101 (IDE Architecture Authority)]**

This is a DUAL architectural review. You are performing your evaluation
INDEPENDENTLY. Do NOT read the other team's verdict before completing yours.
Your review will be consolidated with the other team's verdict by the operator.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Review Question

Does what was built match what we approved at GATE_2?

Approved intent: [WP_ID] — [one-line description of what was approved]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Approved Specification (LLD400)

[SPEC_CONTENT — full content of TEAM_170_{WP_ID}_LLD400_v1.0.0.md]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Implementation Summary (Team 61 Report)

[IMPLEMENTATION_SUMMARY — content of TEAM_61_{WP_ID}_IMPLEMENTATION_REPORT_v1.0.0.md
 including: files modified, functions changed, ACs self-assessed]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Your Review Checklist

Evaluate each dimension independently. Apply your team's specific lens:

**Team 100 lens:** Structural correctness, LOD400 compliance, IRON RULE violations,
  gate sequence integrity, data contract fidelity, WSM/state consistency.

**Team 101 lens:** Implementation fidelity, runtime behaviour, edge case coverage,
  integration point correctness, testability of ACs, code-level accuracy.

### Checklist — evaluate each:

[ ] 1. AC coverage — all acceptance criteria from LLD400 are addressed?
[ ] 2. Scope boundary — implementation stays within stated scope (no scope creep)?
[ ] 3. Iron Rule compliance — no violations of architectural Iron Rules?
[ ] 4. File/module contracts — all specified files created/modified as stated?
[ ] 5. Error handling — non-blocking failures handled as specified (where applicable)?
[ ] 6. Idempotency — where required by spec, confirmed idempotent?
[ ] 7. No regressions — existing pipeline behaviour unaffected by changes?
[ ] 8. Return contract — Team 61 report format complete (all required fields present)?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Required Response Format

Submit your verdict as:

  id: [TEAM_100 / TEAM_101]_{WP_ID}_GATE_6_VERDICT_v1.0.0
  project_domain: AGENTS_OS
  gate: GATE_6
  team: [team_100 / team_101]
  date: [DATE]

  verdict: APPROVED | REJECTED

  findings:
    [For each finding:]
    - id: BF-001 (blocking) or AF-001 (advisory)
      description: [precise finding]
      spec_ref: [LLD400 section or AC ref]
      severity: BLOCK | ADVISORY

  route_recommendation: doc | full
  (include only if REJECTED)

  summary:
    [2–4 sentences: what was reviewed, what was found, why verdict was reached]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File your response in:
  _COMMUNICATION/team_100/TEAM_100_{WP_ID}_GATE_6_VERDICT_v1.0.0.md  ← Team 100
  _COMMUNICATION/team_101/TEAM_101_{WP_ID}_GATE_6_VERDICT_v1.0.0.md  ← Team 101
```

---

## §4 — Operator Consolidation Procedure

After both verdict files are received:

**Step 1 — Verify independence**
Confirm both files exist and were submitted before cross-consultation. If one team's submission references the other team's findings, flag as a protocol violation.

**Step 2 — Apply consolidation rule (§2.2)**
Read both verdicts. Apply the table in §2.2 to determine the consolidated result.

**Step 3 — Dual PASS**
```bash
./pipeline_run.sh --domain agents_os pass
```
Pipeline advances to GATE_7.

**Step 4 — Any FAIL**

Collect all blocking findings (`BF-*`) from both verdicts into a consolidated finding list.
Determine route: if any verdict contains `route_recommendation: full` → route full; else route doc.

```bash
./pipeline_run.sh --domain agents_os fail "BF-001: [desc] | BF-002: [desc] | ..."
./pipeline_run.sh --domain agents_os route [doc|full] "consolidated findings"
```

**Step 5 — Advisory findings on PASS**

Advisory findings (`AF-*`) from either team are recorded as `PASS_WITH_ACTION` items if they require follow-up, or noted as informational observations otherwise. The operator decides which AFs warrant `pass_with_actions`.

```bash
# If advisory items require tracking:
./pipeline_run.sh --domain agents_os pass_with_actions "AF-001: [desc] | AF-002: [desc]"
# If advisory items are observations only (no action required):
./pipeline_run.sh --domain agents_os pass
```

---

## §5 — Verdict File Naming Convention

Both verdict files must follow the existing pipeline verdict candidate patterns in `pipeline.py` (`_verdict_candidates()` function). Specifically, Team 100's verdict must match:

```
_COMMUNICATION/team_100/TEAM_100_{WP_ID_underscored}_GATE_6_VERDICT_v1.0.0.md
```

Example for `S003-P001-WP001`:
```
_COMMUNICATION/team_100/TEAM_100_S003_P001_WP001_GATE_6_VERDICT_v1.0.0.md
_COMMUNICATION/team_101/TEAM_101_S003_P001_WP001_GATE_6_VERDICT_v1.0.0.md
```

The pipeline auto-routes from `TEAM_100_*_GATE_6_VERDICT_v1.0.0.md` for `route_recommendation` parsing. Team 101's file is read by the operator for consolidation — it is not read directly by the pipeline.

---

## §6 — First Application: S003-P001 Test Flight Notes

For the S003-P001 (Data Model Validator) test flight:

- This will be the **first live execution** of the Dual GATE_6 Protocol
- Both teams should take extra care to be explicit in their findings and reasoning
- Advisory findings are particularly valuable on a test flight — the goal is to surface protocol gaps, not just pass/fail
- If the protocol itself causes confusion, both teams should note this in their summary as a `PROTOCOL-IMPROVEMENT` note for Team 100 to address before the next WP

Post-test-flight: Team 100 will review both verdicts and the operator consolidation for protocol correctness, then issue a `DUAL_GATE_6_PROTOCOL_v1.1.0.md` revision if any improvements are warranted.

---

## §7 — Pipeline GATE_CONFIG Note (Future Enhancement)

The current `GATE_CONFIG` in `pipeline.py` has a single owner for GATE_6:
```python
"GATE_6": {"owner": "team_100", "engine": "codex", ...}
```

A future enhancement (S003+ roadmap) should add dual-owner support:
```python
"GATE_6": {"owner": "team_100+team_101", "engine": "codex+cursor", ...}
```

Until then, the pipeline continues to treat Team 100 as the sole authoritative GATE_6 owner for routing purposes. The dual review is an architectural overlay on top of the existing single-owner pipeline mechanism.

---

**log_entry | TEAM_100 | DUAL_GATE_6_PROTOCOL_TEMPLATE | v1.0.0 | PUBLISHED | 2026-03-17**
