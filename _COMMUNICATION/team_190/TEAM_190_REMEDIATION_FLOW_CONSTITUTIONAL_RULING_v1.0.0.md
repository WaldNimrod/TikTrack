---
project_domain: SHARED
id: TEAM_190_REMEDIATION_FLOW_CONSTITUTIONAL_RULING_v1.0.0
from: Team 190 (Constitutional Validator)
to: Team 00, Team 100, Team 10, Team 61
cc: Team 90, Team 50, Team 170
date: 2026-03-18
historical_record: true
status: BINDING_CONSTITUTIONAL_RULING
in_response_to: TEAM_101_TO_TEAM_190_REMEDIATION_FLOW_CONSULTATION_REQUEST_v1.0.0
reference: 04_GATE_MODEL_PROTOCOL_v2.3.0, TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| mandate | REMEDIATION_LIFECYCLE_ORCHESTRATION |
| authority | Team 190 (Constitutional) |
| date | 2026-03-18 |

---

# Remediation Flow — Constitutional Ruling

## 1. Problem Statement (Gap Acknowledged)

When a validation team (Team 50 at GATE_4, Team 90 at GATE_5) issues a BLOCKING_REPORT with explicit findings (BF-XXX), the pipeline routes state back to execution. **Current behavior:** The V2 orchestrator generates a CURSOR_IMPLEMENTATION prompt that points execution teams (20/30/61) to the **original** `implementation_mandates.md` — a full-scope mandate. Execution teams interpret this as "implement from scratch" and ignore the specific BF items, causing:

- Token waste
- Code overwrites
- Failure to remediate the actual blockers

**Root cause:** The pipeline does not inject blocking_findings from the verdict/BLOCKING_REPORT into the remediation prompt. `revision_notes` is only passed when the operator manually runs `revise` or `route` with notes.

---

## 2. Constitutional Rulings

### Ruling 1 — Remediation Mandate Artifact

**Decision:** The pipeline MUST generate a **remediation-specific prompt** whenever routing to CURSOR_IMPLEMENTATION (or G3_PLAN) from a validation FAIL. The prompt MUST NOT direct teams to the original `implementation_mandates.md` as the primary task source.

**Implementation:**
- When `current_gate` advances to CURSOR_IMPLEMENTATION after GATE_4 or GATE_5 FAIL (route=doc), the generated prompt MUST include:
  1. **Blockers to Fix** — the `blocking_findings` list extracted from the verdict/BLOCKING_REPORT
  2. **Explicit instruction:** "Fix ONLY the issues listed above. Do NOT rewrite the whole feature."
  3. Reference to original spec (LLD400/spec_brief) for context only — not as the primary task

- Artifact naming: The prompt may be written to `remediation_mandates.md` (separate from `implementation_mandates.md`) when in correction cycle, OR the existing prompt file may be overwritten with remediation content. The **content** must be remediation-specific; the **filename** is an implementation choice for Team 61.

---

### Ruling 2 — Blocker-to-Task Translation

**Decision:** **Option B — Pipeline-level injection.** The V2 pipeline MUST automatically extract `blocking_findings` from the verdict file and inject them into the remediation prompt. Team 10 does NOT re-enter the loop for route=doc.

**Rationale:**
- BLOCKING_REPORT format is structured: `BF-01: description | evidence: path`
- The validator (Team 50/90) has already produced a list of actionable findings
- Parsing/finding-block extraction is deterministic and can be implemented in `pipeline.py`
- Team 10's role (per ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM) is **Work Plan Generator** — they produce G3_PLAN at GATE_3. On route=doc, we do not need a new work plan; we need targeted fixes. Pipeline automation is appropriate.

**Exception — route=full:** When route=full, the pipeline routes to G3_PLAN (or G3_6_MANDATES for GATE_4). In that case, Team 10's REMEDIATION_WORK_PLAN may be required: Team 10 reads the blocking report, revises the work plan to address structural issues, and issues new mandates. The pipeline MUST inject the blocking_findings into the G3_PLAN revision prompt so Team 10 has full context. Team 10 then produces a revised G3_PLAN that incorporates the blockers.

**Mandate to Team 61:** Implement `_extract_blocking_findings(verdict_path)` in `pipeline.py` that parses `blocking_findings:` (and `BF-XX:` lines) from Team 50/90 verdict files. Call this when generating CURSOR_IMPLEMENTATION or G3_PLAN prompts after a validation FAIL. Pass result as `revision_notes` (or equivalent) into the prompt generator.

---

### Ruling 3 — Phase Sequencing in Remediation

**Decision:** Execution order follows blocker dependencies. The pipeline does NOT mandate parallel vs sequential; the BLOCKING_REPORT drives it.

**Rule:**
- If blockers are **independent** (e.g., BF-01: Team 20 API bug, BF-02: Team 30 UI typo) → teams may fix in **parallel**.
- If blockers have **dependency** (e.g., BF-01: API returns 500 → BF-02: UI fails because API is broken) → **sequential**: Team 20 fixes first; after commit, Team 30 fixes. The remediation prompt MUST include: "If any blocker indicates an API/backend root cause, fix backend (Team 20) first, commit, then fix frontend (Team 30)."

**Implementation:** The pipeline remediation prompt MUST append this sequencing note when both Team 20 and Team 30 are in scope. Team 61 may refine the heuristic (e.g., grep for "API" / "backend" / "500" in blocking text) to auto-detect dependency.

---

## 3. Required Pipeline Changes (Team 61 Mandate)

| Change | Location | Description |
|--------|----------|-------------|
| **BLK-01** | `pipeline.py` | Add `_extract_blocking_findings(gate_id, work_package_id) -> str`. Parse verdict/BLOCKING_REPORT files for `blocking_findings:` block and BF-XX lines. Return formatted string. |
| **BLK-02** | `pipeline.py` | In `advance_gate(..., "FAIL")` and `generate_prompt(CURSOR_IMPLEMENTATION)`: when current_gate is CURSOR_IMPLEMENTATION and last FAIL was GATE_4 or GATE_5, call `_extract_blocking_findings` and pass to `_generate_cursor_prompts(revision_notes=...)`. |
| **BLK-03** | `pipeline.py` | In `generate_prompt(G3_PLAN)` when invoked after route=full from GATE_4/GATE_5: auto-inject blocking_findings if not provided via `--revision-notes`. |
| **BLK-04** | `pipeline_run.sh` | When `fail` triggers auto-route to CURSOR_IMPLEMENTATION, ensure `_generate_and_show` receives blocking content. Pipeline.py `generate_prompt` must auto-detect correction cycle and extract blockers. |
| **BLK-05** | `_generate_cursor_prompts` | When `revision_notes` is non-empty, do NOT reference `implementation_mandates.md`. The remediation prompt IS the mandate. |

---

## 4. Verdict File Contract (Team 50 / Team 90)

Validation teams MUST structure BLOCKING_REPORT so the pipeline can parse:

```
blocking_findings:
  - BF-01: <description> | evidence: <path>
  - BF-02: <description> | evidence: <path>
```

Or in prose form:
```
## Blocking Findings
- **BF-01:** <description> | evidence: <path>
```

The regex in `_extract_blocking_findings` MUST handle both formats. Reference: TEAM_190_CANONICAL_OUTPUT_FORMAT_MANDATE_v1.0.0.

---

## 5. Summary

| Question | Ruling |
|----------|--------|
| **Q1: Remediation artifact** | Generate remediation-specific prompt (blockers injected); do NOT point to original mandates as primary task. |
| **Q2: Blocker→Task translation** | **Option B:** Pipeline auto-extracts from verdict and injects. Team 10 only re-enters for route=full (G3_PLAN revision). |
| **Q3: Phase sequencing** | Sequential when dependency indicated (API→UI); parallel when independent. Prompt must include sequencing note. |

---

## 6. Promotion Path

Team 00 may promote this ruling to `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_REMEDIATION_FLOW_v1.0.0.md` for full architectural directive status. Until then, this document is the binding constitutional ruling for remediation orchestration.

---

**log_entry | TEAM_190 | REMEDIATION_FLOW | CONSTITUTIONAL_RULING | BINDING | 2026-03-18**
