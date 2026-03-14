# Team 190 — Canonical Output Format Mandate
## TEAM_190_CANONICAL_OUTPUT_FORMAT_MANDATE_v1.0.0

**from:** Team 00 (Chief Architect)
**to:** Team 190 (Constitutional Validator)
**date:** 2026-03-14
**status:** ACTIVE — IMMEDIATE EFFECT
**authority:** ARCHITECT_DIRECTIVE_GATE_0_1_2_PIPELINE_HARDENING_v1.0.0

---

## 1. Problem

During S001-P002-WP001 GATE_0 validation, Team 190's output used:
- `route_recommendation: DOC_ONLY_LOOP` — not recognized by pipeline auto-routing
- File named `TEAM_190_TO_TEAM_10_TEAM_90_S001_P002_WP001_GATE0_VALIDATION_RESULT_v1.0.0.md` — not matched by verdict candidate patterns
- No `blocking_findings:` structured field — required by GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT §4

This caused the pipeline to fail silently: no auto-routing, no UI state update.

---

## 2. Mandatory Output Format (GATE_0 and GATE_1)

Every GATE_0 and GATE_1 decision artifact MUST include these fields **verbatim at the top of the document**:

```
gate_id: GATE_0
decision: PASS | BLOCK_FOR_FIX
route_recommendation: doc
blocking_findings:
  - BF-01: <description> | evidence: <canonical_path:line_number>
  - BF-02: <description> | evidence: <canonical_path:line_number>
next_required_action: <one line — what must happen before resubmission>
next_responsible_team: team_00
```

**Rules:**
1. `route_recommendation` MUST be exactly `doc` or `full` — no variants, no composite values
   - `DOC_ONLY_LOOP` ❌ → use `doc` ✅
   - `BLOCK` ❌ → use `doc` or `full` depending on severity ✅
2. `blocking_findings:` MUST be a YAML-style list — one item per finding, with `evidence:` showing exact file path and line number
3. On PASS: `blocking_findings` may be empty or omitted; `route_recommendation` should still be present
4. On BLOCK: `blocking_findings` MUST NOT be empty — missing findings = invalid artifact

---

## 3. Mandatory File Naming (GATE_0 and GATE_1)

Use canonical naming that matches `_verdict_candidates()` patterns in pipeline.py:

| Gate | Canonical filename |
|---|---|
| GATE_0 | `TEAM_190_{WP_UNDERSCORED}_GATE_0_VALIDATION_v1.0.0.md` |
| GATE_1 | `TEAM_190_{WP_UNDERSCORED}_GATE_1_VERDICT_v1.0.0.md` |

Where `{WP_UNDERSCORED}` = work_package_id with hyphens replaced by underscores (e.g. `S001_P002_WP001`).

**Routing-prefix files are also accepted** (pipeline now recognizes these patterns), but canonical naming is preferred.

**Example (GATE_0 for S001-P002-WP001):**
`TEAM_190_S001_P002_WP001_GATE_0_VALIDATION_v1.0.0.md`

---

## 4. GATE_0 Specific Rules

When Team 190 BLOCKs GATE_0:
- `next_responsible_team: team_00` — ALWAYS. The architect is responsible for LOD200 revision, not Team 10.
- `route_recommendation: doc` — ALWAYS for GATE_0. The corrective action is spec revision (doc route loops back to GATE_0).
- Include findings in table format AND as the structured `blocking_findings:` YAML list.

---

## 5. Effect on Existing Artifact

The GATE_0 block issued on 2026-03-14 for S001-P002-WP001 was valid in content but used incorrect format. The pipeline now accepts the `DOC_ONLY_LOOP` value retroactively (alias map added). No need to reissue the block.

However, for all future artifacts, use this mandate.

---

**log_entry | TEAM_00 | TEAM_190_OUTPUT_FORMAT_MANDATE | ACTIVE | 2026-03-14**
