# TEAM_190_TO_TEAM_00_TEAM_100_RUNTIME_ORCHESTRATION_ARCHITECTURAL_RECOMMENDATION_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_190_TO_TEAM_00_TEAM_100_RUNTIME_ORCHESTRATION_ARCHITECTURAL_RECOMMENDATION_v1.0.0  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 00 (Chief Architect), Team 100 (Development Architecture Authority)  
**cc:** Team 10, Team 170, Team 60, Team 20, Team 50, Team 90  
**date:** 2026-03-01  
**status:** ACTION_REQUIRED — ARCHITECTURAL DECISION NEEDED  
**gate_id:** GOVERNANCE_PROGRAM  
**program_id:** S002-P003  
**scope:** Runtime orchestration model, evidence provenance, and scheduler governance for background jobs  
**in_response_to:** TEAM_60_TO_TEAM_10_ARCHITECTURAL_REVIEW_REQUEST_RUNTIME_ORCHESTRATION_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 00 / Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Executive Position

Team 190 confirms that Team 60's escalation is **architecturally valid**.

This is **not** a local implementation-only issue in `S002-P003-WP002`.  
It is a **governance-level runtime-orchestration problem** that currently exists as a wider system pattern.

**Recommendation class:** `REQUIRES_FORMAL_ARCHITECTURAL_DIRECTIVE`

Reason:

1. The current background-job pattern is host-coupled and environment-relative.
2. The risk affects gate evidence integrity, not just runtime convenience.
3. The required fix changes authority boundaries and acceptance rules, so it cannot be locked by Team 10 or Team 60 alone.

---

## 2) Constitutional Boundary (Team 190)

Team 190 can validate and constrain governance adoption boundaries.
Team 190 does **not** choose the final execution substrate.

Therefore:

1. Team 00 / Team 100 must lock the orchestration model.
2. Team 170 must then encode the resulting canonical contract in the relevant governance / runtime reference layer.
3. Team 10 / Team 60 may implement only after that contract is explicit.

---

## 3) Research Findings

### F-01 — runtime configuration is host-local and script-local

The new job reads `DATABASE_URL` by manually parsing `api/.env` and only then falling back to environment variables. It does not use a single shared runtime bootstrap or app-owned configuration contract.

**Evidence:**
- `scripts/check_alert_conditions.py:27`
- `scripts/check_alert_conditions.py:28`
- `scripts/check_alert_conditions.py:30`
- `scripts/check_alert_conditions.py:37`
- `scripts/check_alert_conditions.py:40`

**Consequence:**
- Runtime identity and target DB depend on whichever machine-local `.env` file or shell environment is present.
- This weakens deterministic evidence and reproducibility across machines.

### F-02 — locking is host-local only

The job uses `fcntl` and a filesystem lock under the local project `tmp/` directory.

**Evidence:**
- `scripts/check_alert_conditions.py:10`
- `scripts/check_alert_conditions.py:48`
- `scripts/check_alert_conditions.py:132`
- `scripts/check_alert_conditions.py:134`
- `scripts/check_alert_conditions.py:136`

**Consequence:**
- Single-flight protection applies only on one host.
- It is not a canonical orchestration contract across multiple runtimes, containers, or environments.

### F-03 — scheduler contract is declarative in text only, not codified as authoritative runtime registration

The job declares "Cron" in comments, but the repo does not yet define a single authoritative scheduler registration for it. Team 60's own readiness evidence also records missing crontab wiring.

**Evidence:**
- `scripts/check_alert_conditions.py:11`
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P003_WP002_PHASE_AB_RUNTIME_READINESS_REPORT_v1.0.0.md:125`
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P003_WP002_PHASE_AB_RUNTIME_READINESS_REPORT_v1.0.0.md:133`
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P003_WP002_PHASE_AB_RUNTIME_READINESS_REPORT_v1.0.0.md:157`

**Consequence:**
- "Code exists" and "job is actually orchestrated" are currently separable states.
- This creates false readiness signals.

### F-04 — privilege model is tied to one named DB role

The grant migration hardcodes `"TikTrackDbAdmin"` as the runtime identity for `admin_data.job_run_log` writes.

**Evidence:**
- `scripts/migrations/g7_M005b_grant_admin_data.sql:1`
- `scripts/migrations/g7_M005b_grant_admin_data.sql:3`
- `scripts/migrations/g7_M005b_grant_admin_data.sql:4`

**Consequence:**
- A runtime using a different DB role may pass code checks but fail at write time.
- This is an environment tuple problem, not just a migration problem.

### F-05 — observability contract is incomplete

`admin_data.job_run_log` records start/end/status and counters, but it does not store runtime provenance fields or pointers to stdout/stderr artifacts. Also, the SQL comment defines a narrower status set than the Python code actually writes.

**Evidence:**
- `scripts/migrations/g7_M005_job_run_log.sql:13`
- `scripts/migrations/g7_M005_job_run_log.sql:24`
- `scripts/check_alert_conditions.py:105`
- `scripts/check_alert_conditions.py:117`

**Consequence:**
- Evidence may show "success" or "partial_error", but cannot reliably prove which runtime produced it.
- The operational contract already has drift between schema commentary and implementation.

### F-06 — the control-plane endpoint mandated by architecture is not present

The architect directive introduced a background-jobs control surface, but the referenced backend router does not currently exist.

**Evidence:**
- `api/routers/background_jobs.py` is missing

**Consequence:**
- There is still no canonical app-level control plane for background job registration, state, and manual trigger.
- This reinforces host-coupled execution and weakens operability.

### F-07 — the pattern is systemic, not isolated to one script

The existing `sync_ticker_prices_intraday.py` uses the same direct `.env` parsing pattern and the same host-local lock model.

**Evidence:**
- `scripts/sync_ticker_prices_intraday.py:29`
- `scripts/sync_ticker_prices_intraday.py:30`
- `scripts/sync_ticker_prices_intraday.py:34`
- `scripts/sync_ticker_prices_intraday.py:42`
- `scripts/sync_ticker_prices_intraday.py:48`

**Consequence:**
- The correct response is a reusable runtime-orchestration contract, not a one-off patch for `check_alert_conditions.py`.

### F-08 — execution correctness and orchestration are currently entangled

The current `check_alert_conditions.py` skeleton writes to `job_run_log`, but the core alert-evaluation loop is still effectively empty (`pass`).

**Evidence:**
- `scripts/check_alert_conditions.py:85`
- `scripts/check_alert_conditions.py:92`
- `scripts/check_alert_conditions.py:93`

**Consequence:**
- A host-coupled runtime can produce apparently structured run evidence even when functional behavior is incomplete.
- This strengthens the need for provenance classification and stronger runtime acceptance rules.

---

## 4) Team 190 Recommendation to Architecture

### R-01 — lock a single canonical runtime authority model

Approve one repo-governed execution substrate for background jobs.

Team 190 recommendation:

- Use an **application-governed runner model** as the canonical authority.
- Host scheduler may exist only as a thin trigger for that runner, not as the true authority surface.
- The authoritative unit should be a versioned repo artifact (manifest / contract / runner registration) rather than per-machine cron state.

This is the narrowest model that:

1. preserves determinism,
2. remains inspectable in git,
3. avoids invisible machine-local orchestration drift.

### R-02 — define scheduler-as-code as a mandatory contract

Lock a canonical job-registration artifact in-repo.

Minimum required contract per job:

- `job_name`
- `canonical_entrypoint`
- `runtime_class`
- `scheduler_mode`
- `cadence`
- `db_identity_requirement`
- `expected_log_sink`
- `evidence_classification_rule`

Without this, the system continues to treat host-local scheduler state as implicit governance.

### R-03 — harden the runtime tuple

Lock a machine-checkable runtime tuple for gate-relevant background jobs:

`{ interpreter, dependency set, db_user, grants, scheduler mode, cadence, log sink, runtime class }`

This tuple must be validated before any runtime evidence is considered authoritative.

### R-04 — formalize evidence provenance

Adopt an explicit evidence-source policy:

- `TARGET_RUNTIME`
- `LOCAL_DEV_NON_AUTHORITATIVE`

Team 190 recommendation:

1. Only `TARGET_RUNTIME` evidence may close gate conditions for background-job behavior.
2. `LOCAL_DEV_NON_AUTHORITATIVE` evidence may support debugging, smoke checks, and implementation readiness only.
3. Gate artifacts must state provenance explicitly.

### R-05 — extend the operational health contract

The current `job_run_log` table is not enough.

Required additions at the architectural contract level:

- canonical runtime classification
- executor identity / environment label
- exit code
- stdout pointer
- stderr pointer
- failure reason classification

This does not require deciding the exact schema today, but the architectural directive must require these outputs.

### R-06 — prohibit direct script-local config parsing for authoritative jobs

For gate-relevant jobs, direct parsing of `api/.env` inside each script should be deprecated in favor of a single shared runtime bootstrap / config path.

This should become part of the architecture lock because:

- it directly affects target selection,
- it directly affects runtime identity,
- it directly affects evidence trust.

---

## 5) Interim Rule (effective until architecture lock)

Team 190 recommends the following **interim governance rule** be accepted immediately:

1. Local machine scheduler state is **non-authoritative**.
2. Local `.env`-driven runtime evidence is **non-authoritative** for gate closure.
3. No gate may pass on the basis of background-job behavior unless the evidence is explicitly labeled as:
   - `TARGET_RUNTIME`
4. Until the architectural contract is locked, local runs may prove:
   - code syntax
   - smoke execution
   - partial functional behavior
   but **not** authoritative operational readiness.

This interim rule should remain in force for:

- Team 60
- Team 20
- Team 50
- Team 90
- Team 10 orchestration packages

---

## 6) Governance Adoption Path

Recommended path:

1. **Team 00 / Team 100**
   - Issue a formal directive (or ADR-class decision) locking the runtime orchestration model.

2. **Team 170**
   - Encode the selected model into canonical runtime / evidence / acceptance documentation.

3. **Team 10**
   - Update execution packages and runtime-readiness matrices to use the new contract.

4. **Team 60**
   - Implement the selected orchestration model and produce target-runtime readiness evidence.

5. **Team 190**
   - Re-validate the governance package and confirm constitutional compliance of the adopted model.

---

## 7) Final Recommendation

**Recommendation to Team 00 / Team 100:**  
Approve the escalation and issue a formal architectural directive. Do not leave this as a local runtime workaround.

**Team 190 verdict:**  
`ESCALATION_VALID | REQUIRES_FORMAL_ARCHITECTURAL_DECISION | INTERIM_NON_AUTHORITATIVE_LOCAL_RUNTIME_RULE_RECOMMENDED`

---

**log_entry | TEAM_190 | RUNTIME_ORCHESTRATION_ARCHITECTURAL_RECOMMENDATION | ESCALATION_VALID | REQUIRES_DIRECTIVE | 2026-03-01**
