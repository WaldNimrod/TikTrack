# ARCHITECT DIRECTIVE — Quality Infrastructure Lock
**ID:** ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0
**Version:** 1.0.0
**date:** 2026-03-03
**Authority:** Team 00 (Chief Architect)
**Status:** LOCKED — Iron Rules established
**Trigger:** Team 10 KB Lock Request (CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md)
**Scope:** KB-001..003, KB-004..005, KB-010..013, KB-015, KB-016 + Recurring Quality Processes

---

## §1 CONTEXT

Cursor Cloud Agent performed a full codebase quality scan (2026-03-03, branch `cursor/development-environment-setup-6742`) and produced 21 KB items. Team 10 escalated a subset for architectural lock before execution routing. This directive locks all decisions with immediate effect.

---

## §2 DDL RECONCILIATION — KB-001, KB-002, KB-003

### §2.1 Decisions

| Finding | Decision | Rationale |
|---------|----------|-----------|
| KB-001: `CONSTRAINT...WHERE` inline syntax | FIX: Replace with `CREATE UNIQUE INDEX...WHERE` statements | Inline partial unique constraints are PostgreSQL-invalid in DDL CREATE TABLE context; CREATE UNIQUE INDEX is the correct form |
| KB-002: `user_refresh_tokens`, `revoked_tokens` missing from DDL | FIX: Add both tables to DDL | DDL must be a complete schema mirror. ORM models exist; DDL is out of date |
| KB-003: `brokers_fees` → `trading_account_fees` rename | FIX: Update DDL to `trading_account_fees` | Migration `rename_brokers_fees_to_trading_account_fees.sql` is canonical; DDL must follow |

### §2.2 Source of Truth Hierarchy (Iron Rule)

```
Production DB  >  ORM Models (SQLAlchemy)  >  Migrations  >  DDL file
```

The DDL file is a DOCUMENTATION ARTIFACT. It must mirror the production state. It is NOT used as a migration source. No production migration is needed for KB-001/002/003 — the DB is correct; only the doc is wrong.

### §2.3 DDL Version Policy (Iron Rule)

- Current version: `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — retained as historical archive (do not delete)
- Corrected version: `PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` — produced by Team 170
- Version bumps when: structural changes, new tables, renamed columns, precision changes, or constraint corrections
- Team 20 must CONFIRM current production schema state before Team 170 produces V2.6

### §2.4 Owner

- Team 170: produces V2.6 DDL file
- Team 20: confirms production schema (via `\d+ <table>` or `information_schema`) before Team 170 writes

---

## §3 TEST SUITE A DRIFT — KB-004, KB-005

### §3.1 Decisions

| Finding | Decision | Rationale |
|---------|----------|-----------|
| KB-004: Test expects `conversion_rate`, actual column is `rate` | FIX: Update test to `rate` | Migration wins. `rate` is canonically correct. |
| KB-005: Test expects `NUMERIC(20,8)`, migration set `market_cap NUMERIC(24,4)` | FIX: Update test to `NUMERIC(24,4)` | See §3.2 — NOT a violation of Iron Rule |

### §3.2 ARCHITECTURAL RATIFICATION — market_cap Precision (Iron Rule Clarification)

**Iron Rule:** Financial precision = `NUMERIC(20,8)`. Zero rounding.

**Clarification — scope of the Iron Rule:**

The Iron Rule applies to **financial transaction amounts**: prices, trade values, P&L, quantities, fees, cash flows. These require 8 decimal places for accurate computation.

`market_cap` is a **market data informational display field** sourced from external providers. It is:
- Read-only (never participates in financial calculation within TikTrack)
- Can reach trillions (e.g., $3,000,000,000,000) — `NUMERIC(20,8)` can only hold up to ~$999 billion safely
- Stored for display/reference only

**Decision:** `market_cap NUMERIC(24,4)` is **ARCHITECTURALLY RATIFIED**. This is not a violation of the Iron Rule. The CATS directive must note this exception explicitly.

**Iron Rule clarification logged:** The Iron Rule `NUMERIC(20,8)` applies to monetary transaction fields. Market data informational fields (market_cap, volume) may use `NUMERIC(24,4)` when justified by magnitude requirements.

### §3.3 Owner

- Team 20: update `tests/external_data_suite_a_contract_schema.py` lines 80 and 114
- After fix: Suite A must achieve PASS status in TARGET_RUNTIME before next gate submission

---

## §4 DEPENDENCY POLICY — KB-010, KB-011, KB-012, KB-013

### §4.1 Immediate Remediation (Iron Rule)

| Finding | Package | Action | Owner |
|---------|---------|--------|-------|
| KB-010 | `ecdsa 0.19.1` CVE-2024-23342 | Investigate: direct or transitive. If transitive, upgrade parent package. If direct, replace or pin safe version. | Team 20 |
| KB-011 | `pip 24.0` CVEs | `pip install --upgrade pip` in venv + CI environment | Team 20 (venv), Team 60 (CI) |
| KB-012 | `minimatch` npm | `npm audit fix` in `ui/` directory. If auto-fix breaks build, pin safe version. | Team 30 |
| KB-013 | `rollup 4.x` path traversal | `npm audit fix` in `ui/` directory. If auto-fix breaks build, pin to non-vulnerable version. | Team 30 |

### §4.2 Dependency Policy (Iron Rule, Permanent)

```
HIGH/CRITICAL CVE (CVSS ≥ 7.0):
  → Must be remediated within 7 days of identification
  → After CI/CD pipeline is live: no PR merge allowed with unaddressed HIGH+ CVEs
  → Exception: if no fix exists → document mitigating controls and notify Team 00

MEDIUM CVE (CVSS 4.0–6.9):
  → Must be remediated before next stage GATE_0
  → Tracked in open items (Team 10 master task list)

LOW CVE (CVSS < 4.0):
  → Track in monthly Dependency Health report
  → No mandatory remediation timeline
```

### §4.3 Dependency Audit as Gate Evidence

From GATE_3 onward: all WP submissions must include a dependency audit summary (pip-audit + npm audit) as part of the EXECUTION_PACKAGE. Status: PASS (zero HIGH+) or OPEN (active CVEs with remediation plan).

---

## §5 CI/CD PIPELINE — KB-015

### §5.1 Decision: ADOPT — CRITICAL

CI/CD pipeline is **mandatory infrastructure** for the Phoenix project. No further WP deliveries to `main`/`develop` without CI passing.

### §5.2 Implementation Spec

**File:** `.github/workflows/ci.yml`
**Trigger:** push or PR to `main`, `develop`
**Owner:** Team 60 (creates), Team 20 (reviews backend section), Team 30 (reviews frontend section)
**Target date:** Before next WP merge to main (i.e., before S003 implementation begins)

### §5.3 Phase 1 — Blocking Checks (MUST PASS for merge)

```
Backend:
  - pytest tests/unit/ -v → ALL tests must pass
  - bandit -r api/ --exclude api/venv -ll → 0 HIGH severity issues
  - vite build → build must succeed (frontend compile)

Frontend:
  - cd ui && npx vite build → MUST SUCCEED
```

### §5.4 Phase 1 — Informational (Non-blocking, logged only)

```
- mypy api/ --config-file api/mypy.ini (131 errors pending — KB-006 cleanup first)
- cd ui && eslint (KB-008/009 pending cleanup first)
- pip-audit (KB-010/011 active — blocks after §4.2 remediation)
- npm audit (KB-012/013 active — blocks after §4.2 remediation)
```

### §5.5 Phase 2 — After KB cleanup (WILL become blocking)

Once KB-006, KB-008, KB-009, KB-010, KB-011, KB-012, KB-013 are cleared:
- mypy → add to blocking gate
- ESLint → add to blocking gate
- pip-audit → add to blocking gate
- npm audit → add to blocking gate

Team 10 tracks Phase 2 promotion per KB item closure.

### §5.6 E2E Tests in CI

NOT included. Selenium E2E tests require browser + DB environment. They remain manual/local only per existing standards. Suite A/B/D are also not in CI (they require live external data or DB state). Only unit tests in CI blocking gate.

---

## §6 PRE-COMMIT MODEL — KB-016

### §6.1 Decision: ADOPT — `pre-commit` Python Framework

**Framework:** Python `pre-commit` (NOT Husky — Husky is Node-centric; `pre-commit` is cross-platform and language-agnostic, fitting this mixed Python/Node project)
**Config file:** `.pre-commit-config.yaml` (repo root)
**Owner:** Team 60 creates config, Team 10 ensures all developers install
**Install command:** `pip install pre-commit && pre-commit install`

### §6.2 Phase 1 — BLOCKING at commit

```yaml
# .pre-commit-config.yaml (canonical structure)
repos:
  - repo: local
    hooks:
      - id: unit-tests
        name: Unit Tests
        entry: bash -c "cd api && source venv/bin/activate && python3 -m pytest ../tests/unit/ -q --tb=short"
        language: system
        pass_filenames: false
        always_run: true

      - id: bandit-security
        name: Bandit Security (HIGH only)
        entry: bash -c "cd api && source venv/bin/activate && bandit -r . --exclude venv -lll"
        language: system
        pass_filenames: false
        types: [python]

      - id: frontend-build
        name: Frontend Build Check
        entry: bash -c "cd ui && npx vite build --mode development 2>&1 | tail -5"
        language: system
        pass_filenames: false
        files: \.(jsx?|css|html)$
```

### §6.3 Phase 1 — NON-BLOCKING (warning output only)

- mypy (until KB-006 baseline cleaned)
- ESLint (until KB-008/009 cleared)
- pip-audit / npm audit (until KB-010..013 cleared)

### §6.4 Policy

- ALL developers must have pre-commit installed (`pre-commit install` run once)
- CI/CD supersedes pre-commit — CI is the authoritative gate; pre-commit is developer convenience
- If pre-commit false-positives occur → escalate to Team 60, NOT bypass with `--no-verify`

---

## §7 RECURRING QUALITY PROCESSES — ADOPTION

### §7.1 Adopted Processes

| Process | Decision | Frequency | Owner | Output |
|---------|----------|-----------|-------|--------|
| Pre-Commit Gate | ADOPT (§6) | Every commit | Team 60 setup, all devs | Blocks commit |
| CI/CD Pipeline | ADOPT (§5) | Every PR | Team 60 | PR gate |
| Weekly Scan | ADOPT | Sundays | Cloud Agent + Team 10 scheduling | `_COMMUNICATION/team_00/WEEKLY_SCAN_YYYY-MM-DD.md` |
| Cross-Layer Bug Scan | ADOPT (on-demand) | Before each GATE_7 + on request | Cloud Agent | Report to Team 00 |
| Dependency Health Monitor | ADOPT | Monthly | Cloud Agent | Report to Team 00 |

### §7.2 Weekly Scan — Scope Lock

Every Sunday Cloud Agent runs:
- `pytest tests/unit/ -v` (30 unit tests)
- `python3 tests/external_data_suite_a_contract_schema.py` (Suite A — after KB-004/005 fix)
- `pytest tests/test_external_data_cache_failover_pytest.py -v` (Suite B)
- `python3 tests/test_retention_cleanup_suite_d.py` (Suite D)
- `mypy api/ --config-file api/mypy.ini`
- `bandit -r api/ --exclude api/venv -ll`
- `pip-audit`
- `cd ui && npm audit`
- `cd ui && eslint . --ext js,jsx`
- `cd ui && npx vite build`

**Output format:** `_COMMUNICATION/team_00/WEEKLY_SCAN_YYYY-MM-DD.md` with summary table (PASS/FAIL/DELTA vs prior week).

### §7.3 Cross-Layer Bug Scan — Trigger Policy (Iron Rule)

Cross-layer scan is **MANDATORY** before each GATE_7 submission starting from S003. Output is part of the GATE_7 evidence package.

### §7.4 Governance Note

These processes are INFRASTRUCTURE OPERATIONS. They do NOT require GATE_0→GATE_8 lifecycle. They are governed by this directive and tracked by Team 10 in the master task list.

---

## §8 EXCLUDED KB ITEMS (Not in Team 10 Request — Noted for Record)

| KB | Status | Note |
|----|--------|------|
| KB-006 | OPEN | mypy 131 errors — Team 00 will address in separate session after current WP closes |
| KB-007 | URGENT — Team 20 | Missing `await` in `cache_first_service.py:57` is HIGH severity bug. Team 20 must fix in current sprint regardless of WP. Bundled into Team 20 activation. |
| KB-008, KB-009 | OPEN | ESLint — Team 30 cleanup task. Bundle with frontend work. |
| KB-014 | CLOSE | ESLint config created by Cloud Agent. Team 60: verify `ui/.eslintrc.cjs` is committed to main (or develop). If on feature branch only, cherry-pick. |
| KB-017 | DEFERRED | Black/Prettier formatting — not in current scope |
| KB-018 | MINOR | structlog unused — Team 20 may remove or begin using; low priority |
| KB-019 | DEFERRED | ORM model for system_settings — S003 infrastructure session |
| KB-020 | ONGOING | 14/18 services lack unit tests — tracked via weekly scan delta |
| KB-021 | DEFERRED | Pydantic ConfigDict migration — bundle with Pydantic V2 upgrade sprint |

---

## §9 SUMMARY TABLE — DECISION REGISTER

| KB | Decision | Owner | Priority |
|----|----------|-------|---------|
| KB-001 | MUST FIX — DDL V2.6 (separate CREATE UNIQUE INDEX) | Team 170 + Team 20 confirm | HIGH |
| KB-002 | MUST FIX — DDL V2.6 (add missing tables) | Team 170 + Team 20 confirm | HIGH |
| KB-003 | MUST FIX — DDL V2.6 (rename brokers_fees→trading_account_fees) | Team 170 + Team 20 confirm | MEDIUM |
| KB-004 | MUST FIX — Suite A test: column `rate` | Team 20 | MEDIUM |
| KB-005 | MUST FIX — Suite A test: `NUMERIC(24,4)` RATIFIED for market_cap | Team 20 | MEDIUM |
| KB-010 | IMMEDIATE — investigate + fix ecdsa CVE | Team 20 | HIGH |
| KB-011 | IMMEDIATE — upgrade pip | Team 20 + Team 60 | MEDIUM |
| KB-012 | IMMEDIATE — npm audit fix (minimatch) | Team 30 | HIGH |
| KB-013 | IMMEDIATE — npm audit fix (rollup) | Team 30 | HIGH |
| KB-015 | ADOPT — CI/CD GitHub Actions. Phase 1 blocking: unit tests + build + bandit HIGH | Team 60 | CRITICAL |
| KB-016 | ADOPT — pre-commit framework. Phase 1 blocking: unit tests + bandit HIGH + build | Team 60 | HIGH |
| Recurring | ADOPT — all 5 processes per §7 | Team 60 + Cloud Agent | STRUCTURAL |

---

**log_entry | TEAM_00 | DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0 | LOCKED | 2026-03-03**
