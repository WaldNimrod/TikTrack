# Architect Directive — Gate 0-1-2 Pipeline Hardening
## ARCHITECT_DIRECTIVE_GATE_0_1_2_PIPELINE_HARDENING_v1.0.0

**from:** Team 00 (Chief Architect)
**date:** 2026-03-14
**status:** LOCKED — IMMEDIATE EFFECT
**trigger:** S001-P002-WP001 GATE_0 BLOCK + UI state visibility failure + Team 190 output format mismatch

---

## 1. Background

During GATE_0 validation of S001-P002-WP001, three defects were identified in the pipeline system:

1. **Prompt defect:** `_generate_gate_0_prompt()` did not instruct Team 190 to include mandatory `route_recommendation` or `blocking_findings` fields — so Team 190 used their own format (`DOC_ONLY_LOOP`) which the pipeline could not parse.
2. **Parser defect:** `_extract_route_recommendation()` only matched literal `doc|full` — any variant (`DOC_ONLY_LOOP`, `DOC_ONLY`, etc.) returned `None`, preventing auto-routing.
3. **File naming defect:** `_verdict_candidates()` only matched clean naming patterns — Team 190's actual files include routing prefixes (`TO_TEAM_10_TEAM_90`) and use `GATE0` without underscore, neither of which matched.
4. **UI visibility defect:** Dashboard displayed `pipeline_state.json` (legacy, showing COMPLETE for old run) instead of `pipeline_state_tiktrack.json` (updated by `./pipeline_run.sh fail`) — state change was invisible to operator.

---

## 2. Corrections Applied (2026-03-14)

### Fix 1 — GATE_0 Prompt (pipeline.py `_generate_gate_0_prompt`)
**Implementing directly — exception 4 (< ~30 lines, mandate overhead exceeds fix cost).**

Added mandatory output format section to GATE_0 prompt:
- Explicit `blocking_findings:` schema (BF-NN: description | evidence: path:line)
- Explicit `route_recommendation: doc` instruction with explanation
- Explanation that missing fields = invalid BLOCK, pipeline cannot auto-route
- Clarification that on BLOCK, next responsible = Team 00 (architect) for LOD200 revision

### Fix 2 — Route Recommendation Parser (pipeline.py `_extract_route_recommendation`)
**Implementing directly — exception 4.**

Added `_ROUTE_ALIAS` map that normalizes:
- `DOC_ONLY_LOOP` → `doc`
- `DOC_ONLY` → `doc`
- `LOOP` → `doc`
- `REJECT` → `full`
- `REVISION` → `full`

Parser now accepts any reasonable variant and normalizes to `doc|full`.

### Fix 3 — Verdict File Patterns (pipeline.py `_verdict_candidates`)
**Implementing directly — exception 4.**

Added routing-prefix patterns for GATE_0 and GATE_1:
- `TEAM_190_TO_TEAM_10_TEAM_90_{wpu}_GATE0_VALIDATION_RESULT_v1.0.0.md`
- `TEAM_190_TO_TEAM_10_TEAM_90_{wpu}_GATE_0_VALIDATION_RESULT_v1.0.0.md`
- `TEAM_190_TO_TEAM_10_{wpu}_GATE_0_VALIDATION_RESULT_v1.0.0.md`
- Same variants for GATE_1

These match Team 190's actual output naming behavior.

---

## 3. Remaining Open Issue — UI Domain State Visibility

**Root cause:** `pipeline_state.json` (legacy, shows COMPLETE from old S001 run) ≠ `pipeline_state_tiktrack.json` (updated by current run). Dashboard defaults to legacy file → state change invisible.

**Diagnosis:**
- `pipeline_state.json`: `gate: COMPLETE, WP: S001-P002-WP001` (legacy S001 experiment artifact)
- `pipeline_state_tiktrack.json`: updated by `./pipeline_run.sh fail` for current run
- Dashboard JS (line 1068-1072) has domain-aware file paths defined but default load path is unclear

**Required fix (Team 61 mandate — not implemented directly, size > 30 lines):**

Team 61 must implement one of:
- **Option A (preferred):** Dashboard auto-detects most-recently-updated state file on load, shows domain label prominently; default = tiktrack if tiktrack state is newer
- **Option B:** `pipeline_run.sh fail|pass` updates BOTH `pipeline_state_tiktrack.json` AND `pipeline_state.json` (legacy sync) for backward compat — simplest fix

**Routing:** Mandate issued to Team 61 in S002-P005 or as a standalone micro-fix.

---

## 4. Gate 0-1-2 Semantic Alignment Verification

**Nimrod's stated model** was cross-verified against the canonical gate model (GATE_MODEL_PROTOCOL_v2.3.0 + GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0):

| Gate | Nimrod | Canonical | Match |
|---|---|---|---|
| GATE_0 | LOD200 review; BLOCK → return to architect for new LOD200 | SPEC_ARC — Team 190 validates scope; BLOCK → architect revision | ✅ ALIGNED |
| GATE_1 | Team 170 deepens to LOD400; Team 190 validates | SPEC_LOCK — Team 170 produces LLD400; Team 190 validates | ✅ ALIGNED |
| GATE_2 | Architectural review: big picture, requirements met, architecture match; FAIL → Team 170 + re-validation | ARCHITECTURAL_SPEC_VALIDATION (Intent gate) — Team 100 approval; FAIL routing → GATE_1 (Team 170 revision) | ✅ ALIGNED |

**Conclusion:** Nimrod's model is 100% consistent with the canonical gate governance. No semantic correction required.

---

## 5. Iron Rules Confirmed (GATE_0-2)

1. **No GATE_1 without GATE_0 PASS** — team_190 enforced.
2. **No GATE_2 without GATE_1 PASS** — pipeline FAIL_ROUTING: GATE_2 fail → GATE_1 (revision).
3. **No GATE_3 without GATE_2 PASS + handoff to Team 10** — per GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT §5.
4. **GATE_0 BLOCK → LOD200 returns to Team 00** — FAIL_ROUTING GATE_0: doc → GATE_0 loop. Correct: architect revises and resubmits.
5. **Team 190 output must include `blocking_findings:` + `route_recommendation: doc|full`** — new mandate.

---

## 6. Mandate to Team 190 (Output Format)

Directive routed to Team 190 via: `_COMMUNICATION/team_190/TEAM_190_CANONICAL_OUTPUT_FORMAT_MANDATE_v1.0.0.md`

---

**log_entry | TEAM_00 | GATE_0_1_2_PIPELINE_HARDENING | LOCKED | FIXES_1_2_3_APPLIED | OPEN_UI_DOMAIN_VISIBILITY | 2026-03-14**
