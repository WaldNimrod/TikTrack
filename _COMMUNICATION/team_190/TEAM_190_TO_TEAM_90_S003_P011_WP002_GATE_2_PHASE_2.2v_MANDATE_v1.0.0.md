---
id: TEAM_190_TO_TEAM_90_S003_P011_WP002_GATE_2_PHASE_2.2v_MANDATE_v1.0.0
historical_record: true
from: Team 190 (Constitutional Validator / Adversarial Review)
to: Team 90 (Validation Authority)
cc: Team 00, Team 100, Team 101
date: 2026-03-20
status: SUBMITTED
program: S003-P011
wp: S003-P011-WP002
domain: agents_os
gate: GATE_2
phase: "2.2v"
type: MANDATE
scope: Canonical validation prompt for the consolidated direct-execution master index package (2026-03-19 to 2026-03-20)---

# Team 90 Canonical Validation Prompt

## 0) Mission
Validate the full consolidated package created outside pipeline trigger and return a constitutional verdict with precise corrections (if needed).

Primary package under validation:
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_2_PHASE_2.1_REPORT_v1.1.0.md`

Validation objective:
1. Ensure the index is complete, accurate, and architect-review ready.
2. Ensure every critical claim is evidence-backed by canonical paths.
3. Ensure recommendations and implications are coherent with current WP002 governance direction.

---

## 1) Mandatory Input Set

### 1.1 Index target
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_2_PHASE_2.1_REPORT_v1.1.0.md`

### 1.2 Source reports referenced by index
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_S003_P011_WP002_GATE_2_REPORT_v1.0.0.md`
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_2_REPORT_v1.0.0.md`
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_LOD200_ARCHITECTURAL_INTEL_REVIEW_v1.0.0.md`
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_101_S003_P011_WP002_LLD400_VALIDATION_REPORT_v1.0.0.md`
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_3_PHASE_3.2_REPORT_v1.0.0.md`
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_PIPELINE_MONITOR_IMPLEMENTATION_REPORT_v1.1.0.md`

### 1.3 Canonical context references
- `_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.0.md`
- `_COMMUNICATION/team_00/TEAM_100_TO_TEAM_101_S003_P011_WP002_GATE_2_PHASE_2.1_MANDATE_v1.0.0.md`
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json`
- `agents_os/ui/docs/PIPELINE_MONITOR_ARCHITECTURE_v1.1.0.md`
- `agents_os/ui/docs/PIPELINE_TEAMS_CONTEXT_MONITOR_ARCHITECTURE_v1.0.0.md`

---

## 2) Validation Checklist (Mandatory)

### 2.1 Completeness
1. Does the index cover all major workstreams executed on 2026-03-19 and 2026-03-20?
2. Are both process sides represented:
   - Structure/constitution updates
   - Runtime/current-state monitor updates
3. Are reports, UI artifacts, docs, and runtime/policy changes all indexed?

### 2.2 Accuracy
1. Are artifact IDs/paths/dates/status values correct?
2. Are findings and recommendations faithfully represented vs source reports?
3. Are there any claims in the index without supporting evidence path?

### 2.3 Constitutional coherence
1. Is the package aligned with non-interference policy (read-only monitor behavior)?
2. Is the port policy (`8090` lock) represented consistently with procedure docs and startup script?
3. Is any recommendation in conflict with governance-role boundaries?

### 2.4 Architectural quality
1. Are implications actionable and decision-oriented for Team 100?
2. Are requested decisions explicit and sufficient for next gate movement?
3. Are risk areas and dependencies clearly surfaced?

---

## 3) Required Output Format (Strict)

Return one markdown report at:
- `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_100_S003_P011_WP002_GATE_2_PHASE_2.2v_VERDICT_v1.0.0.md`

Report schema:
1. `decision`: `PASS` or `BLOCK_FOR_FIX`
2. `overall_status`: one sentence
3. `findings_table` with columns:
   - `finding_id`
   - `severity` (`BLOCKER|HIGH|MEDIUM|LOW`)
   - `description`
   - `evidence-by-path`
   - `required_fix`
   - `owner`
4. `coverage_assessment`:
   - `covered_streams`
   - `missing_streams`
   - `evidence_gaps`
5. `final_recommendation_to_team_100`

Rules:
- No generic feedback.
- Every finding must include at least one concrete file path.
- If `PASS`, explicitly state why no blockers/high issues remain.

---

## 4) Acceptance Criteria for This Validation Task

| AC ID | Criterion |
|---|---|
| AC-V90-01 | Full index reviewed against all mandatory input sources |
| AC-V90-02 | Verdict produced with evidence-backed findings (if any) |
| AC-V90-03 | Corrections are specific enough for immediate patching |
| AC-V90-04 | Output is architect-ready and can be forwarded without reformatting |

---

log_entry | TEAM_190 | S003_P011_WP002 | TEAM90_VALIDATION_PROMPT_MASTER_INDEX | SUBMITTED | 2026-03-20
