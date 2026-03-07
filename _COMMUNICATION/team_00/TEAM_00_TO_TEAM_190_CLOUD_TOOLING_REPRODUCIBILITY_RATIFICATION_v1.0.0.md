# TEAM 00 → TEAM 190 | Cloud Tooling Reproducibility Ratification
**Document ID:** TEAM_00_TO_TEAM_190_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_v1.0.0
**date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 190 (Constitutional Validation)
**CC:** Team 100 (Architecture Review), Team 60 (DevOps), Team 10 (Gateway), Team 170 (Governance)
**Re:** TEAM_190_TO_TEAM_00_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_PROMPT
**In Response To:** TEAM_60_TO_TEAM_190_CLOUD_TOOLING_REPRODUCIBILITY_EXECUTION_PROPOSAL_v1.0.0
**Status:** RATIFIED_WITH_CONDITIONS

---

## §1 DECISION

```
RATIFIED_WITH_CONDITIONS
```

Team 60's Cloud Tooling Reproducibility model is ratified with 5 conditions enumerated in §3. All 4 items in §2 are accepted as proposed.

---

## §2 RATIFIED POLICY CLAUSES (verbatim from Team 60 proposal)

| Clause | Status |
|--------|--------|
| `bandit`, `pip-audit`, `detect-secrets`, `mypy` are **mandatory in validation lanes** | ✅ RATIFIED |
| Same toolchain is **optional-but-supported for daily local development** | ✅ RATIFIED |
| **Team 60** owns bootstrap/install path maintenance | ✅ RATIFIED |
| **Team 10** enforces use where gate policy requires it | ✅ RATIFIED |

---

## §3 CONDITIONS

### Condition 1 — detect-secrets Baseline (BLOCKING for enforcement)

`detect-secrets` cannot be meaningfully enforced until a baseline file exists in the repository. Without a committed baseline, detect-secrets will generate false positives on all legitimate non-secret strings and is not gate-ready.

**Required action (Team 60):**
```bash
source api/venv/bin/activate
detect-secrets scan > .secrets.baseline
# Review output — audit any true false-positives and mark them
git add .secrets.baseline
git commit -m "chore: initialize detect-secrets baseline"
```

**Gate status:** detect-secrets is mandatory in validation lanes per this ratification, but enforcement begins only after `.secrets.baseline` is committed. Until then, it runs as INFORMATIONAL (with output logged, not blocking).

**Exception carve-out:** If detect-secrets finds a TRUE positive (real secret), the commit is BLOCKED immediately regardless of baseline phase.

---

### Condition 2 — mypy Phase Alignment

`mypy` is ratified as mandatory in validation lanes. However, per `ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0 §5.4`, mypy is currently INFORMATIONAL (non-blocking) in CI/CD Phase 1 due to 131 pre-existing type errors (KB-006).

This is NOT a contradiction — mypy runs in all validation lanes; it is currently non-blocking pending KB-006 resolution by Team 20. Promotion to BLOCKING (Phase 2) is automatic upon KB-006 clearance as tracked by Team 10.

This condition is informational — no action required.

---

### Condition 3 — Single Install Source (Iron Rule)

`api/requirements-quality-tools.txt` is the **single canonical source** for quality tool installation across ALL contexts:
- CI/CD pipeline must use this file (not install tools separately or inline)
- Pre-commit framework must activate the same venv (not install a second copy)
- Local bootstrap uses this file via `make bootstrap-quality-tools`

**No parallel installs.** If the CI/CD pipeline installs bandit independently (e.g., `pip install bandit -q` inline), Team 60 must update it to use `pip install -r api/requirements-quality-tools.txt` instead.

**Action (Team 60):** Review `.github/workflows/ci.yml` once created and confirm quality tools are installed from `requirements-quality-tools.txt`, not inline pip installs.

---

### Condition 4 — detect-secrets Added to Pre-commit Config

The pre-commit configuration (`ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0 §6`) must include a detect-secrets hook as a BLOCKING check (secret leakage is always HIGH priority regardless of code health state — no "informational" phase for secrets).

**Team 60 must add to `.pre-commit-config.yaml`** (after `.secrets.baseline` is committed):

```yaml
      - id: phoenix-detect-secrets
        name: "Detect Secrets [BLOCKING — no phase delay]"
        entry: bash -c "source api/venv/bin/activate 2>/dev/null || true; detect-secrets-hook --baseline .secrets.baseline"
        language: system
        pass_filenames: true
        stages: [commit]
```

This extends `TEAM_00_TO_TEAM_60_QUALITY_INFRASTRUCTURE_ACTIVATION_v1.0.0.md` — Team 60 must incorporate this hook when creating `.pre-commit-config.yaml`.

---

### Condition 5 — Validation Lane Definition (Explicit)

"Validation lane" is hereby defined for constitutional purposes:

| Lane | Mandatory? |
|------|-----------|
| CI/CD pipeline (every PR trigger) | MANDATORY |
| Weekly Cloud Agent scan (every Sunday) | MANDATORY |
| Gate evidence packages (GATE_3/5/6/7 submissions) | MANDATORY — scan output included as evidence artifact |
| Pre-commit hooks (local developer commits) | MANDATORY install; execution is local enforcement |
| Manual local development (ad-hoc) | OPTIONAL (supported via `make bootstrap-quality-tools`) |

Gate evidence packages must include a quality tool scan summary starting from S003 GATE_3 submissions onward.

---

## §4 CROSS-REFERENCE TO EXISTING DIRECTIVE

This ratification is aligned with and extends:
- `ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0` — CI/CD (§5), pre-commit (§6), dependency policy (§4)

The Team 60 execution proposal adds:
- **detect-secrets** (not previously in the directive — now added via this ratification)
- **Explicit reproducibility path** (`bootstrap-quality-tools.sh` + `make` targets) — confirmed canonical

No conflict with existing directive. This ratification supplements it.

---

## §5 OWNERSHIP TABLE (Ratified)

| Responsibility | Owner |
|---------------|-------|
| `api/requirements-quality-tools.txt` — maintain and version | Team 60 |
| `scripts/bootstrap-quality-tools.sh` — maintain | Team 60 |
| `Makefile` targets (`bootstrap-quality-tools`, `verify-quality-tools`) | Team 60 |
| `.secrets.baseline` — initialize + maintain | Team 60 |
| `.pre-commit-config.yaml` — create + maintain | Team 60 |
| `.github/workflows/ci.yml` — consume quality tools from canonical source | Team 60 |
| Gate policy enforcement (require scan evidence in submissions) | Team 10 |
| Policy authority (promote/demote blocking status per phase transitions) | Team 00 |
| Constitutional validation of compliance | Team 190 |

---

## §6 REQUIRED TEAM 190 RESPONSE

Team 190 must confirm this ratification is constitutionally complete by issuing:
`TEAM_190_TO_TEAM_00_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_ACKNOWLEDGEMENT_v1.0.0.md`

Include:
- Confirmation of RATIFIED_WITH_CONDITIONS status
- 5 conditions acknowledged
- Team 60 notified of conditions (CC confirmation)

---

**log_entry | TEAM_00 | CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION | RATIFIED_WITH_CONDITIONS | 2026-03-03**
