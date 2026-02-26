# TEAM_10_LINT_ENFORCEMENT_FAST_TRACK_EVIDENCE_BY_PATH_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_LINT_ENFORCEMENT_FAST_TRACK_EVIDENCE_BY_PATH_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 190 (Constitutional Architectural Validator)  
**date:** 2026-02-26  
**status:** EVIDENCE  
**gate_id:** GOVERNANCE_PROGRAM  
**program_id:** S002-P001  

---

## 1) Workflow file paths and trigger definitions

| Path | Purpose |
|------|--------|
| `.github/workflows/lint-enforcement.yml` | CI workflow: bootstrap script + Ruff check api/; triggers push/PR to main with path filters |

**Trigger matrix:** push + pull_request, branches: main only; paths: .cursorrules, 00_MASTER_INDEX.md, pyproject.toml, scripts/lint_source_authority_bootstrap_paths.sh, documentation/docs-governance/**, api/**, ui/**, .github/workflows/lint-enforcement.yml.

---

## 2) CI run URLs (PASS / FAIL)

**Status:** Workflow and triggers are in place. CI run URLs are to be populated after first run on `main` (e.g. after merge or first push/PR that touches the configured paths).

| Result | URL | Timestamp |
|--------|-----|-----------|
| PASS | *\<fill after first successful GitHub Actions run\>* | *\<ISO\>* |
| FAIL | *\<optional: fill if intentional FAIL sample produced\>* | *\<ISO\>* |

Reference: _COMMUNICATION/team_60/TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_CI_EVIDENCE_v1.0.0.md §2 (same table; can be updated there or here when runs exist).

---

## 3) Proof that CI does not modify repository files

| Evidence | Source |
|----------|--------|
| Workflow permissions | `permissions: contents: read` (see .github/workflows/lint-enforcement.yml) |
| No write steps | No `git add` / `git commit` / `git push`; no `ruff --fix`; bootstrap script is read-only (path + alias checks) |
| Explicit check-only | Steps: checkout → install ripgrep → bootstrap script → ruff check api/ --output-format=concise |

Reference: _COMMUNICATION/team_60/TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_IMPLEMENTATION_REPORT_v1.0.0.md §4; TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_CI_EVIDENCE_v1.0.0.md §3.

---

## 4) Proof that `main` merge is blocked on lint failure

| Evidence | Source |
|----------|--------|
| Required check name | **Lint Enforcement** (matches workflow job name) |
| Configuration | In GitHub: Settings → Branches → Branch protection rules for `main` → add **Lint Enforcement** as required status check |
| Result | When the workflow fails, merge to main is blocked until the check passes |

Implementation Report and CI Evidence document the requirement; branch protection must be applied in the repo settings by the repo owner. Evidence can be supplemented with a screenshot of the rule once configured.

---

## 5) Proof that `phoenix-dev` is excluded from required-check policy

| Evidence | Source |
|----------|--------|
| Workflow triggers | Only `main`; no triggers on phoenix-dev |
| Explicit note | Team 60 Implementation Report §5 and CI Evidence §5: **phoenix-dev** is the backup branch and is **not** in enforcement scope; no required status checks are applied to phoenix-dev |

---

## 6) Artifact paths (consolidated)

| Path | Role |
|------|------|
| .github/workflows/lint-enforcement.yml | Workflow |
| scripts/lint_source_authority_bootstrap_paths.sh | Bootstrap lint (invoked by CI) |
| pyproject.toml | Ruff config for api/ |
| ui/.eslintrc.cjs | ESLint config (local/follow-up; not in CI in fast-track) |
| _COMMUNICATION/team_60/TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_IMPLEMENTATION_REPORT_v1.0.0.md | Team 60 implementation report |
| _COMMUNICATION/team_60/TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_CI_EVIDENCE_v1.0.0.md | Team 60 CI evidence |

---

**log_entry | TEAM_10 | LINT_ENFORCEMENT_FAST_TRACK_EVIDENCE_BY_PATH | EVIDENCE | 2026-02-26**
