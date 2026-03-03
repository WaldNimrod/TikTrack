# TEAM_60 -> TEAM_190 | CLOUD TOOLING REPRODUCIBILITY EXECUTION PROPOSAL

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_60_TO_TEAM_190_CLOUD_TOOLING_REPRODUCIBILITY_EXECUTION_PROPOSAL_v1.0.0  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 190 (Constitutional Validation)  
**cc:** Team 00, Team 100, Team 10, Team 170  
**date:** 2026-03-03  
**status:** PROPOSED_FOR_RATIFICATION  
**gate_id:** GOVERNANCE_PROGRAM  
**program_id:** N/A  
**scope:** CLOUD_AGENT_TOOLING_REPRODUCIBILITY  
**in_response_to:** TEAM_190_TO_TEAM_60_TEAM_00_TEAM_100_CLOUD_TOOLING_REPRODUCIBILITY_FORMALIZATION_REQUEST  

---

## Mandatory Identity Header

| Field | Value |
| --- | --- |
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | SHARED |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 60 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Decision Proposal (Team 60)

Team 60 proposes a reproducible canonical bootstrap model with explicit separation:

1. **Validation-lane mandatory:** all four tools are mandatory for validation workflows.
2. **Local dev optional-but-supported:** local developers can install the same toolchain via one canonical command.
3. **Single canonical source:** pinned by repository-owned files and scripts (no cloud-only state dependency).

Tools covered:

- `bandit`
- `pip-audit`
- `detect-secrets`
- `mypy`

## 2) Canonical Bootstrap Path (implemented)

### A) Canonical requirements manifest

- `api/requirements-quality-tools.txt`
  - Contains: `bandit`, `pip-audit`, `detect-secrets`, `mypy`

### B) Canonical bootstrap script

- `scripts/bootstrap-quality-tools.sh`
  - Creates `api/venv` if missing
  - Installs tools from `api/requirements-quality-tools.txt`
  - Verifies each tool by `--version`
  - Emits `QUALITY_TOOLS_BOOTSTRAP_EXIT:0` on success

### C) Canonical Make targets

- `make bootstrap-quality-tools`
- `make verify-quality-tools`

Defined in:

- `Makefile`

## 3) Reproducibility Procedure

Standard local/bootstrap sequence:

1. `make bootstrap-quality-tools`
2. `make verify-quality-tools`

Expected verification output includes versions for:

- `bandit`
- `pip-audit`
- `detect-secrets`
- `mypy`

## 4) Ownership Model (for ratification)

Proposed ownership split:

1. **Team 60** owns bootstrap path and install procedure maintenance.
2. **Team 00 + Team 100** ratify policy mode and governance classification:
   - mandatory in validation lanes
   - optional/non-blocking for daily local development unless gate mandates otherwise
3. **Team 10** enforces gate policy usage once ratified.

## 5) Acceptance Mapping (Team 190 criteria)

1. Reproducible outside Cloud Agent runtime: **YES** (script + requirements + make target in repo)
2. Ownership explicit: **YES** (proposed split above)
3. Canonical location documented: **YES** (`scripts/bootstrap-quality-tools.sh`, `api/requirements-quality-tools.txt`, `Makefile`)

## 6) Pending Ratification Artifacts

Awaited from governance owners:

1. `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_190_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_v1.0.0.md`
2. `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_190_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_v1.0.0.md`

---

log_entry | TEAM_60 | CLOUD_TOOLING_REPRODUCIBILITY_EXECUTION_PROPOSAL | SUBMITTED_FOR_TEAM00_TEAM100_RATIFICATION | 2026-03-03
