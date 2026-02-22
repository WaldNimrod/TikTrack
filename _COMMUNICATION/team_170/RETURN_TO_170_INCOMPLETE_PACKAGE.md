# RETURN TO TEAM 170 — INCOMPLETE PACKAGE (Gate 5 FAIL Remediation)
**project_domain:** TIKTRACK

**id:** RETURN_TO_170_INCOMPLETE_PACKAGE  
**from:** Team 190 (Constitutional Validator) → Team 170 (SSOT Authority)  
**re:** MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.0.0 — Gate 5 CONSTITUTIONAL_FAIL  
**date:** 2026-02-19  
**evidence:** _COMMUNICATION/team_190/MB3A_POC_AGENT_OS_SPEC_PACKAGE_V1_0_0_CONSTITUTIONAL_REVIEW.md

---

## Status

**Gate 5 result:** FAIL (CONSTITUTIONAL_FAIL)  
**Remediation:** Team 170 to apply the following fixes and resubmit. Team 10/Architect to apply fix #1 at canonical path.

---

## Numbered Remediation List

### 1. Canonical SSM — remove speculative Alerts (BLOCKER F1)

**Problem:** The file `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md` (line 41) still contains:
- `primary_key id (ULID)` → must be **UUID** (code: d34_alerts.sql, api/models/alerts.py).
- `state_machine: [ACTIVE, TRIGGERED, DISMISSED, ARCHIVED]` → must be replaced with code-derived flags only: **is_active, is_triggered, deleted_at** (no DISMISSED/ARCHIVED).
- `dom_contract: Required data-testid on all interaction elements` → must be replaced with Alerts-spec selectors: **data-section, data-role, data-alert-id, id, class** (evidence: ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §D).

**Required action:** Replace the content of `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md` with the content of `_COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md` (including § Gate signer semantics and §3 ENTITY ALERT as in the candidate).  
**Owner:** Team 10 / Architect (write to _Architects_Decisions). Team 170 has provided the candidate; promotion to canonical path is outside Team 170 write authority.

---

### 2. POC-1 Observer — single SSM source (BLOCKER F2)

**Problem:** `POC_1_OBSERVER_SPEC_v1.0.0.md` (line 33) allowed “(or candidate per delta)”, breaking single-source determinism.

**Required action:** Pin SSM input to **one** path only. Use `_COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md` as the single authoritative SSM input for the observer; state explicitly that the observer MUST NOT use `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md` until that file has been replaced with content equivalent to the candidate.  
**Owner:** Team 170.  
**Status:** Applied in POC_1_OBSERVER_SPEC_v1.0.0.md (table row SSM).

---

### 3. Validation Matrix — compliant SSM source (F3)

**Problem:** `MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.0.0.md` (line 69) mapped “SSM Governance Core” to the architect-canonical SSM, which still contains speculative Alerts.

**Required action:** Re-point the Validation Matrix row for “SSM Governance Core” to the **compliant** source: `_COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md` (and SSM_DELTA_PROPOSAL), with an explicit note that the canonical file at _Architects_Decisions is non-compliant until replaced per delta.  
**Owner:** Team 170.  
**Status:** Applied in MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.0.0.md §5 Validation Matrix.

---

## Summary

| # | Remediation | Owner | Status |
|---|-------------|--------|--------|
| 1 | Replace canonical SSM with candidate content (remove ULID, ACTIVE/TRIGGERED/DISMISSED/ARCHIVED, data-testid) | Team 10 / Architect | Pending (Team 170 cannot write to _Architects_Decisions) |
| 2 | POC-1: single SSM path (candidate only; do not use canonical until updated) | Team 170 | Done |
| 3 | Validation Matrix: SSM Governance Core → compliant source (candidate + delta) | Team 170 | Done |

After fix #1 is applied by Team 10/Architect, re-submit the package to Team 190 for Gate 5 re-review.

---

**log_entry | TEAM_170 | RETURN_TO_170_REMEDIATION | 2026-02-19**
