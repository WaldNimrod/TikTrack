---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_170_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 170 (Documentation & Governance)
to: Team 00 (Chief Architect)
cc: Team 190, Team 10
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 170 skill recommendations for documentation governance and validation workflow
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 170 |

---

## 1) Team Context

### Operating domain(s)
- Documentation governance (Librarian / SSOT Authority)
- _COMMUNICATION/team_170/ output (completion reports, validation requests, mandates)
- Knowledge Promotion Protocol — consolidation into documentation/ via Team 10
- PHOENIX_IDEA_LOG, IDEA Pipeline, ARCHITECT directives
- Index maintenance, master indexes

### Primary toolchain/runtime
- Markdown authoring, structured YAML frontmatter
- Validation request/response cycle with Team 190
- Completion report formats (TEAM_170_*_COMPLETION_REPORT.md)
- SOP-013 Seal message format

### Recurring blockers
1. **Date governance:** Reports dated incorrectly (e.g. 2026-02-19 vs 2026-03-15) → BLOCK_FOR_FIX (IHC-RV-BF-01)
2. **Evidence-by-path drift:** Inconsistent or missing path+line in findings → revalidation loops
3. **Return contract omissions:** Missing `log_entry`, `overall_result`, or `remaining_blockers` → parser/review friction
4. **Template drift:** Ad-hoc structure vs canonical validation request format → avoidable fixes
5. **Consolidation friction:** Manual mapping from team reports to SSOT — error-prone, token-heavy

---

## 2) Skill Options Table

| Option name | What it solves | Benefits | Risks / tradeoffs | Impact | Effort | Token saving |
|-------------|----------------|----------|-------------------|--------|--------|--------------|
| **report-date-validator** | Date mismatches in frontmatter vs log_entry vs referenced docs | Eliminates date-governance BLOCKERs; immediate IHC-RV-BF-style fixes | Strict UTC convention may need policy lock | HIGH | LOW | MEDIUM |
| **validation-request-schema-enforcer** | Format drift in Team 170 → Team 190 validation packages | First-pass PASS; fewer remediation cycles | Schema must stay aligned with Team 190 contract | HIGH | MEDIUM | HIGH |
| **evidence-by-path-autofill** | Manual path+line entry for findings | Consistent evidence quality; faster Team 190 review | Requires stable file paths; line numbers may shift | HIGH | MEDIUM | MEDIUM |
| **completion-report-template-lock** | Ad-hoc completion report structure | Predictable structure; easier consolidation | Lock may slow novel report types | MEDIUM | LOW | MEDIUM |
| **consolidation-path-mapper** | Manual mapping team_X reports → documentation/ target | Fewer promotion errors; lower token on mapping | Depends on stable folder contract | MEDIUM | MEDIUM | HIGH |
| **seal-message-validator** | SOP-013 Seal format drift (TASK_ID, FILES_MODIFIED, etc.) | Correct handover; no "no Seal" rejection | Tight coupling to SOP-013 canon | MEDIUM | LOW | LOW |
| **superseded-banner-injector** | Stale doc versions missing superseded banner | Reduces IHC-style drift findings | May conflict with manual edits | LOW | MEDIUM | MEDIUM |

---

## 3) Priority Recommendation (Top 3)

1. **report-date-validator** — Immediate win; directly addresses date BLOCKERs seen in IDEA Pipeline revalidation.
2. **validation-request-schema-enforcer** — Highest token saving; reduces full revalidation cycles.
3. **evidence-by-path-autofill** — Quality baseline; aligns with Team 190 evidence expectations.

---

## 4) Dependencies and prerequisites

- **report-date-validator:** Canonical date source (UTC); policy lock on `date` / `log_entry` alignment.
- **validation-request-schema-enforcer:** Team 190 contract as canonical schema; Team 170 + Team 190 agreement on required fields.
- **evidence-by-path-autofill:** Stable path conventions; optional line-range vs single-line policy.

---

## 5) Suggested owner per option

| Option | Suggested owner | Rationale |
|--------|-----------------|-----------|
| report-date-validator | Team 191 / Team 100 | Tooling + policy |
| validation-request-schema-enforcer | Team 170 + Team 190 | Contract co-ownership |
| evidence-by-path-autofill | Team 170 | Domain-specific path logic |
| completion-report-template-lock | Team 170 | Templates and embedding |
| consolidation-path-mapper | Team 170 + Team 10 | Promotion workflow |
| seal-message-validator | Team 191 + Team 10 | SOP-013 canonical |
| superseded-banner-injector | Team 170 | Doc governance |

---

## 6) Open clarification questions

**NONE.** Team 170 environment and runtime scope are clear from mandate execution (IDEA Pipeline, validation cycles, Knowledge Promotion Protocol).

---

## 7) Return Contract

- `overall_result:` SUBMITTED_FOR_ARCH_REVIEW
- `top3_skills:` report-date-validator, validation-request-schema-enforcer, evidence-by-path-autofill
- `blocking_uncertainties:` NONE
- `remaining_blockers:` NONE

---

**log_entry | TEAM_170 | SKILLS_RECOMMENDATIONS | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15**
