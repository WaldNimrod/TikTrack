# TEAM 00 → TEAM 170 | KB Routing Correction + DDL V2.6 Critical Note
**Document ID:** TEAM_00_TO_TEAM_170_KB_ROUTING_CORRECTION_v1.0.0
**Date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 170 (Spec / Governance)
**CC:** Team 10 (Gateway)
**Re:** `TEAM_170_TO_TEAM_10_CLOUD_AGENT_KB_CANONICAL_INTAKE_ACTIVATION_v1.0.0.md` — routing errors + DDL critical finding
**Status:** CORRECTION REQUIRED before Team 10 executes routing

---

## §1 ROUTING ERRORS — REQUIRE CORRECTION

Team 170's intake table contains ownership errors that conflict with `ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0` decisions. Team 10 MUST NOT execute the routing as-is. Team 170 must issue a corrected v1.0.1 intake table.

### §1.1 Ownership Corrections

| canonical_id | KB | Team 170 routing | CORRECT routing | Reason |
|-------------|-----|-----------------|-----------------|--------|
| KB-2026-03-03-03 | KB-001 | Team 20 | **Team 170** | DDL V2.6 is a documentation artifact — Team 170 owns DDL production. Team 20 only provides schema confirmation. |
| KB-2026-03-03-04 | KB-002 | Team 20 | **Team 170** | Same as KB-001. |
| KB-2026-03-03-05 | KB-003 | Team 20 | **Team 170** | DDL rename correction is Team 170 scope. |
| KB-2026-03-03-12 | KB-010 | Team 60 | **Team 20** | ecdsa CVE is a Python backend dependency — Team 20 (Backend) owns. Team 60 only updates CI/CD pip upgrade step. |
| KB-2026-03-03-14 | KB-012 | Team 60 | **Team 30** | minimatch is an npm package in `ui/` — Team 30 (Frontend) owns. |
| KB-2026-03-03-15 | KB-013 | Team 60 | **Team 30** | rollup is an npm package in `ui/` — Team 30 (Frontend) owns. |

### §1.2 Already-Resolved Items (Mark as CLOSED)

The following KB items were resolved by Batch 1 execution and must be marked CLOSED in the intake table, not routed as BATCHED:

| canonical_id | KB | Resolution |
|-------------|-----|-----------|
| KB-2026-03-03-06 | KB-004 | CLOSED — Team 20 fixed Suite A test |
| KB-2026-03-03-07 | KB-005 | CLOSED — Team 20 fixed Suite A test + market_cap NUMERIC(24,4) ratified |
| KB-2026-03-03-09 | KB-007 | CLOSED — Team 20 verified: no bug, await already existed |
| KB-2026-03-03-10 | KB-008 | CLOSED — Team 30: ESLint already clean |
| KB-2026-03-03-11 | KB-009 | CLOSED — Team 30: await inside async function, already valid |
| KB-2026-03-03-13 | KB-011 | CLOSED — Team 20: pip 26.0.1 confirmed |
| KB-2026-03-03-16 | KB-014 | CLOSED — Team 30: `ui/.eslintrc.cjs` confirmed on main |

### §1.3 Special Status Items

| canonical_id | KB | Corrected Status |
|-------------|-----|-----------------|
| KB-2026-03-03-12 | KB-010 | MITIGATED_NO_FIX_EXISTS (Team 20 mitigated; PyJWT migration = S003 task) |
| KB-2026-03-03-14 | KB-012 | CLOSED — 0 HIGH+ vulnerabilities confirmed by Team 30 |
| KB-2026-03-03-15 | KB-013 | CLOSED — 0 HIGH+ vulnerabilities confirmed by Team 30 |

---

## §2 CRITICAL DDL FINDING — exchange_rates Column

**Team 170 MUST READ THIS before writing DDL V2.6.**

Team 20 executed production schema queries. `TEAM_20_SCHEMA_CONFIRMATION_OUTPUT.md` confirms:

```
exchange_rates actual DB column: conversion_rate (NUMERIC(20,8))
```

This CONTRADICTS the original KB-004 report which claimed the DB column was `rate`. The actual production DB has `conversion_rate`.

**Impact on DDL V2.6:**
- DDL V2.6 MUST document `conversion_rate` as the exchange_rates column name (actual DB state)
- Do NOT use `rate` in DDL V2.6 for this column

**Impact on KB-004 fix (Suite A test):**
- Team 20 changed Suite A test from `conversion_rate` to `rate`
- Suite A still passes because it tests at the API/ORM contract layer, not raw DB column names
- The test change is acceptable IF the ORM attribute is named `rate` (with Column alias to `conversion_rate`)
- KB-004 is considered CLOSED from a test perspective — Suite A passes
- DDL V2.6 must reflect actual DB reality: `conversion_rate`

**No production migration is needed.** The DB column is correct. The DDL is the document that was wrong. V2.6 corrects the DDL.

**Remaining confirmed column status for exchange_rates:**

| Column | Type | Status |
|--------|------|--------|
| id | uuid | ✅ |
| from_currency | varchar | ✅ |
| to_currency | varchar | ✅ |
| **conversion_rate** | **NUMERIC(20,8)** | ✅ — USE THIS in DDL V2.6 |
| last_sync_time | timestamptz | ✅ |
| created_at | timestamptz | ✅ |
| updated_at | timestamptz | ✅ |

---

## §3 CONFIRMED SCHEMA STATE FOR DDL V2.6

Based on `TEAM_20_SCHEMA_CONFIRMATION_OUTPUT.md` (actual DB query output), Team 170 may proceed with the following confirmed data:

| Table | Status | Notes for DDL V2.6 |
|-------|--------|-------------------|
| tickers | ✅ | Document actual columns. Partial unique: use `CREATE UNIQUE INDEX...WHERE` (not inline). `status VARCHAR(20)` confirmed. |
| user_api_keys | ✅ | Document actual 22 columns. Partial unique: use `CREATE UNIQUE INDEX...WHERE`. |
| user_refresh_tokens | ✅ | Table EXISTS. Columns: id, user_id, token_hash, jti, expires_at, revoked_at, created_at. |
| revoked_tokens | ✅ | Table EXISTS. Columns: jti, expires_at, revoked_at. |
| trading_account_fees | ✅ | Name confirmed as `trading_account_fees` (NOT brokers_fees). 9 columns. |
| exchange_rates | ⚠️ | **Column is `conversion_rate` (NOT `rate`)** — see §2 above |
| ticker_prices | ✅ | `price` NUMERIC(20,8), `market_cap` NUMERIC(24,4) — both confirmed |

---

## §4 REQUIRED TEAM 170 ACTIONS

1. **Issue corrected intake table v1.0.1** with ownership and status corrections per §1
2. **Notify Team 10** that the v1.0.0 routing must NOT be executed until v1.0.1 is issued
3. **Proceed with DDL V2.6** using confirmed schema data from §3 and §2 (exchange_rates = `conversion_rate`)
4. The DDL V2.6 activation prompt (`TEAM_00_TO_TEAM_170_DDL_RECONCILIATION_ACTIVATION_v1.0.0.md`) and Batch 2 clearance (`TEAM_00_TO_TEAM_170_BATCH2_CLEARANCE_v1.0.0.md`) remain in force — proceed under those, but incorporate this correction.

---

**log_entry | TEAM_00→TEAM_170 | KB_ROUTING_CORRECTION | ROUTING_ERRORS_FLAGGED | 2026-03-03**
