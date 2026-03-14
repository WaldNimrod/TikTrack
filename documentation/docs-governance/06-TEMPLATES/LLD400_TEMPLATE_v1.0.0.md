# LLD400_TEMPLATE_v1.0.0 — Spec Lock (LOD 400) template
date: 2026-03-14

**project_domain:** [REQUIRED — e.g. AGENTS_OS]  
**id:** [REQUIRED — unique document id]  
**from:** [Spec owner — e.g. Team 170]  
**to:** [Recipient — e.g. Team 190]  
**cc:** [Optional]  
**date:** [REQUIRED — YYYY-MM-DD]  
**status:** [e.g. DRAFT | SUBMITTED_FOR_GATE_1_VALIDATION]  
**gate_id:** GATE_1  
**architectural_approval_type:** SPEC  
**spec_version:** [REQUIRED — e.g. 1.0.0]  
**source:** [REQUIRED — path to LOD200 package or parent spec]  
**required_ssm_version:** [REQUIRED]  
**required_wsm_version:** [REQUIRED]  
**required_active_stage:** [REQUIRED]  
**phase_owner:** [REQUIRED]  

---

## §1 Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | [REQUIRED] |
| stage_id | [REQUIRED] |
| program_id | [REQUIRED] |
| work_package_id | [When applicable; else N/A] |
| task_id | [When applicable; else N/A] |
| gate_id | [REQUIRED — GATE_1 for LLD400] |
| architectural_approval_type | SPEC |
| spec_version | [REQUIRED] |
| date | [REQUIRED] |
| source | [REQUIRED] |
| required_ssm_version | [REQUIRED] |
| required_wsm_version | [REQUIRED] |
| required_active_stage | [REQUIRED] |
| phase_owner | [REQUIRED] |

---

## §2 Program Definition

### §2.1 Objective

[Program objective and high-level goals.]

### §2.2 Scope

[In scope / out of scope; trace to LOD200 where applicable.]

### §2.3 Architecture Boundaries

[Domain root, governance docs, WSM/SSM usage, path and import rules.]

### §2.4 Work Package Structure

[WP table: purpose, dependencies, high-level deliverables.]

### §2.5 Required Artifacts (canonical taxonomy, mapped to WP)

[Path | Purpose | WP table.]

### §2.6 Exit Criteria

[Per-WP and program-level exit criteria.]

---

## §3 Repo Reality Evidence

[Audit of paths from §2.5: exists / does-not-exist; brief content summary. Optional: index deltas.]

---

## §4 Proposed Deltas

[Proposed changes to repo, indexes, or governance artifacts.]

---

## §5 Risk Register

[ID | Risk | Severity | Mitigation table.]

---

**status:** LOCKED (v1.0.0)  
**log_entry | TEMPLATE | LLD400_TEMPLATE_v1.0.0 | LOCKED | T001 | [date]**
