---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_90_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 90 (Dev Validator)
to: Team 190, Team 00, Team 100
cc: Team 10, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 90 skill recommendations for gate validation acceleration and quality hardening
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 90 |

## 1) Team Context

- **Operating domain(s):** SHARED (TIKTRACK + AGENTS_OS), validation authority for GATE_5..GATE_8.
- **Primary toolchain/runtime:** Markdown governance artifacts, repository-level code scan (`rg`, `pytest`, targeted static checks), WSM/runtime state synchronization checks.
- **Recurring blockers in current workflow:**
  1. Evidence-path drift (wrong file names, stale paths, wildcard references).
  2. Non-deterministic closure packages (manifest wildcards, unresolved references).
  3. Revalidation loops caused by missing gate-specific evidence contracts.
  4. Date/version drift between artifacts and runtime state.
  5. Mixed routing semantics inside reports (verdict vs routing ownership ambiguity).

### Concrete examples from current execution

1. `BF-G8-001`: wildcard rows in archive manifest required explicit path remediation.
2. `BF-G8-002`: broken evidence-by-path references in cleanup report blocked closure.
3. `BF-G8-003`: implementation path mismatch (`scripts/pipeline_run.sh` vs `pipeline_run.sh`) blocked GATE_8 pass.
4. S002-P005-WP002 state-lock cycle required Team 90 WSM lock confirmation after final PASS artifact.

## 2) Skill Options Table

| Option | What it solves | Benefits | Risks / tradeoffs | Impact | Effort | Token saving | Suggested owner |
|---|---|---|---|---|---|---|---|
| Gate Package Linter Skill | Pre-check gate submission package for path/date/header compliance | Prevents most doc-only blockers before Team 90 review | Requires maintenance as contracts evolve | HIGH | MEDIUM | HIGH | Team 90 + Team 191 |
| Evidence Determinism Validator Skill | Detects wildcard refs, broken links, missing evidence-by-path | Eliminates archive/manifest drift loops | May produce false positives on legacy artifacts | HIGH | MEDIUM | HIGH | Team 90 |
| WSM Lock Assistant Skill | Guided state-lock updates with required log_entry templates | Reduces state update errors and missed fields | Needs strict ownership rules to avoid overreach | HIGH | LOW | MEDIUM | Team 90 |
| Revalidation Delta Comparator Skill | Compares previous blocker set vs current submission to ensure only unresolved items are raised | Enforces fresh validation discipline and avoids repeated stale findings | Requires consistent blocker IDs across cycles | HIGH | MEDIUM | HIGH | Team 90 + Team 190 |
| Canonical Response Composer Skill | Generates PASS/BLOCK artifacts with mandatory contract sections and consistent IDs | Faster, deterministic outputs; less formatting drift | Over-automation may hide nuanced reasoning if misused | MEDIUM | LOW | MEDIUM | Team 90 |
| Gate Timeline Integrity Skill | Cross-checks gate chain continuity (GATE_0..GATE_8) against references | Flags sequencing violations early | Needs program-specific exceptions support | MEDIUM | MEDIUM | MEDIUM | Team 90 + Team 170 |
| Validation Test-Orchestrator Skill | Runs WP-scoped regression commands and summarizes accepted known-fail baselines | Reduces manual command selection and inconsistent evidence | Runtime variance across environments | MEDIUM | MEDIUM | MEDIUM | Team 90 + Team 51/61 |

## 3) Priority Recommendation (Top 3)

1. **Gate Package Linter Skill** (Immediate Win)  
   Highest leverage for reducing doc-only BLOCK loops at GATE_5/GATE_8.
2. **Revalidation Delta Comparator Skill** (Immediate Win)  
   Directly enforces "fresh validation" and lowers repetitive token-heavy cycles.
3. **Evidence Determinism Validator Skill** (Medium-Term Investment)  
   Systematically removes archive/manifest inconsistencies that repeatedly block closure.

## 4) Dependencies and Prerequisites

1. Unified blocker ID discipline across teams (`BF-*`, `DRIFT-*`, `CLOSURE-*`).
2. Stable canonical path conventions and versioning policy.
3. Shared machine-readable gate contracts (headers, required sections, mandatory evidence keys).
4. Team 191 support for repository guard integration where needed.

## 5) Suggested Owner Per Option

- Team 90: Gate Package Linter, Evidence Determinism Validator, Canonical Response Composer, Gate Timeline Integrity.
- Team 191: repo-guard integration, path/date policy checks.
- Team 190: blocker taxonomy alignment + revalidation delta policy.
- Team 170: canonical document contracts and closure-manifest structure.
- Team 51/61: runtime test orchestrator inputs for AGENTS_OS flows.

## 6) Open Clarification Questions

1. Should Team 90 skills enforce hard fail on any wildcard in archive manifests, or allow legacy exceptions under explicit waiver tag?
2. For known test failures (accepted baselines), should we standardize a canonical allowlist artifact per WP/program?

## Immediate Wins vs Medium-Term

- **Immediate wins (next cycle):**
  - Gate Package Linter Skill
  - Revalidation Delta Comparator Skill
  - Canonical Response Composer Skill
- **Medium-term investments (2-4 cycles):**
  - Evidence Determinism Validator Skill
  - Gate Timeline Integrity Skill
  - Validation Test-Orchestrator Skill

---

overall_result: SUBMITTED_FOR_ARCH_REVIEW  
top3_skills: Gate Package Linter; Revalidation Delta Comparator; Evidence Determinism Validator  
blocking_uncertainties: NONE  
remaining_blockers: NONE

log_entry | TEAM_90 | SKILLS_RECOMMENDATIONS_REPORT | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15
