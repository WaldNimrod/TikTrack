# TEAM 00 → TEAM 10 | KB Decision Package
**Document ID:** TEAM_00_TO_TEAM_10_KB_DECISION_PACKAGE_v1.0.0
**date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 10 (Gateway)
**CC:** Team 100 (Architecture Review — awareness)
**Re:** CLOUD_AGENT_OPEN_ITEMS_ARCHITECTURAL_LOCK_REQUEST_v1.0.0
**Status:** DECISIONS ISSUED — Route for execution

---

## §1 ACKNOWLEDGEMENT

Team 10 request received. All 6 topic areas from `CLOUD_AGENT_OPEN_ITEMS_ARCHITECTURAL_LOCK_REQUEST_v1.0.0` have been reviewed against:
- `CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md`
- `CLOUD_AGENT_RECURRING_PROCESSES_PROPOSAL_2026-03-03.md`
- Existing Iron Rules (NUMERIC(20,8), APScheduler, maskedLog)
- Phoenix governance model

All decisions are now locked in `ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0.md`.

---

## §2 DECISIONS SUMMARY

### DDL Reconciliation — KB-001, KB-002, KB-003

**Decision: MUST FIX — DDL V2.6**

- KB-001: Replace `CONSTRAINT...WHERE` inline syntax with `CREATE UNIQUE INDEX...WHERE` (affects `tickers`, `user_api_keys`)
- KB-002: Add `user_refresh_tokens` and `revoked_tokens` tables to DDL
- KB-003: Rename `brokers_fees` → `trading_account_fees` throughout DDL

**DDL Policy (Iron Rule):** Production DB > ORM > Migrations > DDL. DDL is documentation only. No migration needed — DB is already correct.

**New file:** `PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`. Old V2.5 archived (do not delete).

**Route:** Team 170 (DDL production) + Team 20 (production schema confirmation)

---

### Test Suite A Drift — KB-004, KB-005

**Decision: MUST FIX — Tests updated to reflect actual DB**

- KB-004: Column name `rate` is canonical. Update test at `tests/external_data_suite_a_contract_schema.py:80`.
- KB-005: `market_cap NUMERIC(24,4)` is **ARCHITECTURALLY RATIFIED**. This is NOT a violation of the Iron Rule. Clarification: the NUMERIC(20,8) Iron Rule applies to financial transaction amounts (prices, trade values, P&L). `market_cap` is an informational display field from external providers — NUMERIC(20,8) cannot even hold trillion-dollar values safely (max ~$999B). NUMERIC(24,4) is correct. Update test at `:114`.

After fix: Suite A must PASS in TARGET_RUNTIME.

**Route:** Team 20

---

### Dependency Policy — KB-010, KB-011, KB-012, KB-013

**Decision: IMMEDIATE REMEDIATION (within 7 days)**

| KB | Action | Owner |
|----|--------|-------|
| KB-010 | Investigate `ecdsa` — direct or transitive. Fix by upgrade or parent package upgrade | Team 20 |
| KB-011 | `pip install --upgrade pip` in venv + CI | Team 20 (venv), Team 60 (CI) |
| KB-012 | `npm audit fix` in `ui/` (minimatch) | Team 30 |
| KB-013 | `npm audit fix` in `ui/` (rollup) | Team 30 |

**Permanent Policy (Iron Rule):** HIGH+ CVE (CVSS ≥ 7.0) → 7-day remediation window. After CI/CD active: no PR merge with unaddressed HIGH+ CVEs. See directive §4.2 for full policy.

---

### CI/CD PR Pipeline — KB-015

**Decision: ADOPT — CRITICAL. Create before S003 first PR.**

**Phase 1 — BLOCKING (must pass for merge):**
- `pytest tests/unit/ -v` — all tests pass
- `vite build` — build succeeds
- `bandit -r api/ --exclude api/venv -ll` — zero HIGH

**Phase 1 — INFORMATIONAL (non-blocking while KB backlog clears):**
- mypy (131 errors → Team 20 to clear KB-006 before promoting)
- ESLint (KB-008/009 → Team 30 to clear before promoting)
- pip-audit / npm audit (KB-010..013 → promote to blocking after remediation)

**File:** `.github/workflows/ci.yml`
**Owner:** Team 60

**Route:** Team 60 activation prompt issued.

---

### Pre-commit Model — KB-016

**Decision: ADOPT — `pre-commit` Python framework**

Framework: `pre-commit` (NOT Husky — Python-native project preference). Config: `.pre-commit-config.yaml`.

**Phase 1 blocking (at commit):**
- Unit tests (`pytest tests/unit/ -q`)
- Bandit HIGH severity (`bandit -lll`)
- Frontend build (on JS file changes)

**Phase 1 non-blocking:** mypy, ESLint, dependency audits (promote when KB backlog cleared).

Install: `pip install pre-commit && pre-commit install` (all developers).

**Policy:** `--no-verify` bypass is NOT permitted without Team 00 exception approval.

**Owner:** Team 60

**Route:** Team 60 activation prompt issued.

---

### Recurring Quality Process Adoption

**Decision: ALL 5 PROCESSES ADOPTED**

| Process | Frequency | Owner | Notes |
|---------|-----------|-------|-------|
| Pre-Commit Gate | Every commit | Team 60 setup | Per KB-016 decision |
| CI/CD Pipeline | Every PR | Team 60 | Per KB-015 decision |
| Weekly Scan | Sundays | Cloud Agent | Output: `_COMMUNICATION/team_00/WEEKLY_SCAN_YYYY-MM-DD.md` |
| Cross-Layer Bug Scan | Before each GATE_7 (MANDATORY) + on-demand | Cloud Agent | Part of GATE_7 evidence from S003 onward |
| Dependency Health Monitor | Monthly | Cloud Agent | Output: report to Team 00 |

**Key change:** Cross-Layer Bug Scan is now **MANDATORY** before GATE_7 submissions starting S003. Team 10 must include it in GATE_7 preparation checklist.

---

## §3 ROUTING TABLE

| Action | Team | Priority | Expected Output |
|--------|------|----------|-----------------|
| DDL V2.6 production | Team 170 | HIGH | `PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` |
| Production schema confirmation | Team 20 | HIGH (precedes Team 170) | Schema state report or `\d+` evidence |
| Suite A test fixes (KB-004, KB-005) | Team 20 | MEDIUM | Updated test file, TARGET_RUNTIME PASS |
| KB-007 urgent fix (`missing await`) | Team 20 | HIGH (not in request — bundled) | Fixed `cache_first_service.py:57` |
| ecdsa CVE fix (KB-010) | Team 20 | HIGH | `requirements.txt` updated, pip-audit PASS |
| pip upgrade (KB-011) | Team 20 + Team 60 | MEDIUM | pip ≥ 26.0 in venv + CI |
| npm audit fix (KB-012, KB-013) | Team 30 | HIGH | `npm audit` — zero HIGH |
| CI/CD pipeline (KB-015) | Team 60 | CRITICAL | `.github/workflows/ci.yml` + confirmation |
| Pre-commit config (KB-016) | Team 60 | HIGH | `.pre-commit-config.yaml` + install docs |
| ESLint fixes (KB-008, KB-009) | Team 30 | LOW-MEDIUM | Clean ESLint run |
| ESLint config merge (KB-014) | Team 60 | HIGH | Confirm `ui/.eslintrc.cjs` in main/develop |

---

## §4 NOT IN SCOPE (Team 10 awareness)

The following KB items were NOT in Team 10's lock request. Team 00 disposition:

- KB-006 (mypy bulk): addressed in separate session after WP002 closes
- KB-017 (formatting): deferred
- KB-018 (structlog): Team 20 minor cleanup
- KB-019 (ORM for system_settings): S003 infrastructure session
- KB-020 (unit test coverage): ongoing — tracked via weekly scan delta
- KB-021 (Pydantic ConfigDict): bundle with Pydantic V2 upgrade sprint

---

## §5 GATE IMPACT

These decisions affect gate submissions as follows:

| Gate Check | Change |
|-----------|--------|
| GATE_3 evidence package | Add: dependency audit status (pip-audit + npm audit) |
| GATE_7 package | Add: Cross-Layer Bug Scan output (mandatory from S003) |
| All PR merges | Requires CI/CD PASS (once KB-015 implemented) |

No impact on current WP002 (S002-P003-WP002) which is at GATE_6 DOC_ONLY_LOOP — CI/CD required before S003 work begins.

---

## §6 CANONICAL ACTIVATION PROMPTS ISSUED

Per standing procedure (adopted 2026-03-03), the following activation prompts are issued with this decision:

| Team | File | Scope |
|------|------|-------|
| Team 20 | `TEAM_00_TO_TEAM_20_KB_REMEDIATION_ACTIVATION_v1.0.0.md` | KB-004, KB-005, KB-007, KB-010, KB-011 |
| Team 30 | `TEAM_00_TO_TEAM_30_KB_REMEDIATION_ACTIVATION_v1.0.0.md` | KB-012, KB-013, KB-008, KB-009, KB-014 |
| Team 60 | `TEAM_00_TO_TEAM_60_QUALITY_INFRASTRUCTURE_ACTIVATION_v1.0.0.md` | KB-015, KB-016, KB-011 (CI) |
| Team 170 | `TEAM_00_TO_TEAM_170_DDL_RECONCILIATION_ACTIVATION_v1.0.0.md` | KB-001, KB-002, KB-003 |

Team 10: read each prompt. Confirm to each team. Track via master task list.

---

**log_entry | TEAM_00 | KB_DECISION_PACKAGE_v1.0.0 | ISSUED | 2026-03-03**
