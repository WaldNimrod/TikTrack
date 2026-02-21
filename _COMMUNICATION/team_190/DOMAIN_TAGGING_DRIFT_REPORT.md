# DOMAIN_TAGGING_DRIFT_REPORT

**id:** TEAM_190_DOMAIN_TAGGING_DRIFT_REPORT_2026-02-21  
**owner:** Team 190 (READ_ONLY intelligence)  
**date:** 2026-02-21

---

## Findings

| file_path | drift_type | severity | explanation |
|---|---|---|---|
| `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` | Missing `project_domain` header | HIGH | No `project_domain` header present. Scope-wide result: all `82/82` markdown files in `documentation/docs-system` are missing this header. |
| `documentation/docs-governance/02-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` | Missing `project_domain` header | HIGH | No `project_domain` header present. Scope-wide result: all `59/59` markdown files in `documentation/docs-governance` are missing this header. |
| `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S001_P001_WP001_QA_SUBMISSION_AND_PROMPT.md` | Missing `project_domain` header | HIGH | No `project_domain` header present. Scope-wide result: all `786/786` markdown files in `_COMMUNICATION` are missing this header. |
| `_COMMUNICATION/team_10/TEAM_10_S001_P001_WP001_WORK_PACKAGE_DEFINITION.md` | Mixed-domain terminology (TikTrack + Agents_OS) | MEDIUM | Same artifact uses both domains for boundary assertions, but without explicit domain field in identity header. Creates policy-vs-structure ambiguity. |
| `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S001_P001_WP001_QA_REPORT.md` | Mixed-domain terminology (TikTrack + Agents_OS) | MEDIUM | QA report validates separation claims (`Agents_OS vs TikTrack`) while physical Agents_OS root is absent in repo. Semantic/structural mismatch. |
| `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP001_GATE5_VALIDATION_RESPONSE.md` | Program/WP lacks explicit domain binding | MEDIUM | Includes `roadmap_id/stage_id/program_id/work_package_id` but no `project_domain` field. Domain inferred from context only. |
| `_COMMUNICATION/team_170/ARCHITECTURAL_APPROVAL_PROTOCOL_FORMALIZATION_v1.0.0.md` | Hybrid SPEC/EXECUTION semantic concentration | LOW | Formalization intentionally contains both SPEC and EXECUTION tracks. Structurally valid, but no domain tagging axis for cross-domain filtering. |
| `_COMMUNICATION/_ARCHITECT_INBOX/SSM_LOCK_AND_STRUCTURE_ALIGNMENT_SPEC_APPROVAL_REQUEST/EVIDENCE_MAPPING_TO_GOVERNANCE_MODEL.md` | Hybrid references inside approval package | MEDIUM | SPEC approval package includes cross-track terminology (`SPEC`/`EXECUTION`) without domain-scoped metadata classification. |
| `_ARCHITECTURAL_INBOX/AGENT_OS_PHASE_1/INFRASTRUCTURE_STAGE_1/MB3A_SPEC_PACKAGE_v1.4.0/SUBMISSION_v1.4.0/SPEC_PACKAGE.md` | Evidence under non-canonical inbox path | HIGH | Domain package exists under legacy root inbox path; canonical channel is `_COMMUNICATION/_ARCHITECT_INBOX`. Increases traceability drift risk. |

---

## Scan notes

- `Agents_OS/documentation` scan target: **not found** (`Agents_OS/` folder absent).
- Missing `project_domain` header is systemic across all scanned markdown scopes.

---

**log_entry | TEAM_190 | DOMAIN_TAGGING_DRIFT_REPORT | GENERATED | 2026-02-21**
