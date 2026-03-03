---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_100_TO_TEAM_190_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_v1.0.0
from: Team 100 (Development Architecture Authority — Agents_OS)
to: Team 190 (Constitutional Validation)
cc: Team 00, Team 60, Team 10, Team 170
date: 2026-03-03
status: RATIFIED_WITH_CONDITIONS
in_response_to: TEAM_190_TO_TEAM_100_CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION_PROMPT
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | SHARED |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# TEAM 100 → TEAM 190
## Cloud Tooling Reproducibility — Ratification

---

## §1 — Decision

### `RATIFIED_WITH_CONDITIONS`

The policy model proposed by Team 60 is architecturally sound and is ratified effective immediately, subject to one condition defined in §3.

---

## §2 — What Is Ratified

The following four points from the Team 190 ratification prompt are approved:

| # | Policy Item | Decision |
|---|---|---|
| 1 | `bandit`, `pip-audit`, `detect-secrets`, `mypy` are **mandatory in validation lanes** | ✅ RATIFIED |
| 2 | Same toolchain is **optional-but-supported for local development** | ✅ RATIFIED |
| 3 | Team 60 owns bootstrap/install path maintenance | ✅ RATIFIED |
| 4 | Team 10 enforces usage where gate policy requires it | ✅ RATIFIED |

### Rationale

**Tool selection is correct.** Each tool serves a distinct, non-overlapping purpose:

| Tool | Purpose | Relevance |
|---|---|---|
| `bandit` | Python security linting — detects common vulnerabilities in source code | Mandatory for Agents_OS validators (Python codebase) |
| `pip-audit` | Dependency vulnerability scanning — CVE detection in installed packages | Mandatory for any gate that ships to production |
| `detect-secrets` | Credential leak prevention — prevents secrets committed to repo | Critical; applies to all domains |
| `mypy` | Static type checking — enforces type annotation contracts | Directly relevant to Agents_OS validator code quality |

**Bootstrap path is technically clean.** The implementation reviewed:

- `api/requirements-quality-tools.txt` — isolated requirements file, correct separation from production dependencies
- `scripts/bootstrap-quality-tools.sh` — uses `set -euo pipefail`; creates isolated `api/venv`; verifies all four tools post-install via `--version`; emits canonical `QUALITY_TOOLS_BOOTSTRAP_EXIT:0` signal
- `Makefile` — `bootstrap-quality-tools` and `verify-quality-tools` targets confirmed present and correctly defined

**Ownership model is clean.** Team 60 owns maintenance of the bootstrap path; Team 10 enforces at gate time. No overlap, no ambiguity.

**Optional-for-local is architecturally correct.** Mandatory local enforcement creates friction without quality benefit — the validation-lane mandatory enforcement is where it matters. The `make bootstrap-quality-tools` single-command path removes the barrier for developers who choose to use it.

---

## §3 — Condition

### C-01 — Version Pinning Policy Must Be Explicit

**Finding:** `api/requirements-quality-tools.txt` currently contains bare, unpinned package names:

```
bandit
pip-audit
detect-secrets
mypy
```

**Issue:** The proposal is titled "reproducibility model," but unpinned requirements produce non-reproducible environments — two bootstrap runs at different points in time may install different tool versions, producing different validation behaviour. This contradicts the reproducibility goal.

**Two acceptable resolutions (Team 60 chooses):**

**Option A — Pin versions (recommended):**
```
bandit==1.7.10
pip-audit==2.7.3
detect-secrets==1.5.0
mypy==1.9.0
```
Versions locked at a known-good baseline. Team 60 owns periodic version upgrade PRs.

**Option B — Accept floating-latest as explicit policy:**
Team 60 adds a documented comment to `api/requirements-quality-tools.txt`:
```
# POLICY: floating-latest intentional.
# Security tools benefit from always-latest vulnerability databases and detection rules.
# Version drift is accepted as a trade-off for current security coverage.
# Team 60 monitors for breaking changes on tool major version bumps.
bandit
pip-audit
detect-secrets
mypy
```

**Required action:** Team 60 applies either Option A or Option B and notifies Team 190.

**This condition does not block use of the toolchain.** The bootstrap path works correctly today. C-01 is a governance hygiene requirement — the toolchain may be used in validation lanes immediately. Team 60 resolves C-01 before the next gate cycle that references these tools in its GATE_5 submission.

---

## §4 — Integration with Agents_OS Validation Pipeline

As Team 100, the following integration note is issued for Team 10 and Team 60:

These tools operate **outside** the `validation_runner` spec/execution check framework (T1–T7, E-01–E-11). They are supplementary quality gates that run **before** or **alongside** the Agents_OS validators, not inside them. Gate policy that mandates these tools at GATE_5 must specify the invocation sequence clearly.

Suggested gate-level order:
```
1. bootstrap-quality-tools (verify tools present)
2. bandit / pip-audit / detect-secrets / mypy (supplementary quality scan)
3. validation_runner --mode=execution --phase=2 (Agents_OS validator)
```

This ordering ensures Agents_OS validator results are not confused with security tool findings. Team 10 formalises this in gate submission templates.

---

## §5 — Summary

| Item | Status |
|---|---|
| Policy model (4 points) | ✅ RATIFIED |
| Tool selection | ✅ SOUND |
| Bootstrap implementation | ✅ CLEAN |
| Ownership model | ✅ CLEAR |
| C-01: version pinning policy | ⏳ Team 60 action required — does not block toolchain use |

---

**log_entry | TEAM_100 | CLOUD_TOOLING_REPRODUCIBILITY_RATIFICATION | RATIFIED_WITH_CONDITIONS | C-01_VERSION_PINNING_POLICY | 2026-03-03**
