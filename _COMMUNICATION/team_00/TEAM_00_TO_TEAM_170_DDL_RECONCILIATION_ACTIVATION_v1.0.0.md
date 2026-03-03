# TEAM 00 → TEAM 170 | DDL Reconciliation Activation
**Document ID:** TEAM_00_TO_TEAM_170_DDL_RECONCILIATION_ACTIVATION_v1.0.0
**Date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 170 (Spec / Governance / Documentation)
**Authority:** ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0
**Status:** ACTIVE — Awaiting Team 20 schema confirmation (PREREQUISITE)

---

## YOUR MANDATE

Produce `PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` — the corrected DDL document. This fixes three schema drift findings (KB-001, KB-002, KB-003) identified in the Cloud Agent quality scan.

**PREREQUISITE:** Do NOT begin DDL edits until Team 20 delivers `TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0.md`. The production DB is the source of truth — you must confirm actual state before writing V2.6.

---

## §1 CONTEXT — DDL Policy

The DDL file is a **documentation artifact**, not a migration source.

**Source of truth hierarchy (Iron Rule):**
```
Production DB  >  ORM Models (SQLAlchemy)  >  Migrations  >  DDL file
```

No production migration is needed. The DB is correct. Only the DDL document needs updating.

**Current file:** `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — retain as archive. Do NOT delete or modify V2.5.

**New file:** `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`

---

## §2 CORRECTIONS REQUIRED

### Correction 1 — KB-001: Partial Unique Constraints (Invalid Syntax)

**Affected tables:** `tickers`, `user_api_keys`

**Problem:** DDL V2.5 uses inline `CONSTRAINT ... WHERE` syntax inside `CREATE TABLE`. PostgreSQL does NOT support partial unique constraints inline — they must be separate `CREATE UNIQUE INDEX ... WHERE` statements.

**Fix pattern:**

```sql
-- BEFORE (invalid — inside CREATE TABLE block):
CREATE TABLE tickers (
    ...
    CONSTRAINT uq_tickers_active_symbol UNIQUE (symbol) WHERE (status = 'active')
);

-- AFTER (correct — separate statement, after CREATE TABLE):
CREATE TABLE tickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ...
    -- other constraints here (NON-partial ones stay inline)
);

CREATE UNIQUE INDEX uix_tickers_active_symbol
    ON tickers (symbol)
    WHERE (status = 'active');
```

Get the exact constraint definition from Team 20's schema confirmation. Apply same fix to `user_api_keys` if it has a similar inline partial constraint.

### Correction 2 — KB-002: Missing Tables

**Add to DDL:** `user_refresh_tokens` and `revoked_tokens`

Get the exact column definitions from Team 20's schema confirmation (or from `api/models/tokens.py` ORM models). Write standard DDL for both tables, including:
- All columns with correct types
- PRIMARY KEY
- FOREIGN KEYs
- Any indexes
- Any unique constraints

Place these tables in the DDL after the `users` table (since they depend on user identity).

### Correction 3 — KB-003: Table Rename

**Find:** All occurrences of `brokers_fees` in V2.5 DDL
**Replace with:** `trading_account_fees`

This includes:
- The `CREATE TABLE brokers_fees` → `CREATE TABLE trading_account_fees`
- Any `FOREIGN KEY ... REFERENCES brokers_fees` → `REFERENCES trading_account_fees`
- Any comments or index names referencing the old name

---

## §3 DDL FILE HEADER UPDATE

Update the header of V2.6:

```sql
-- ============================================================
-- PHX_DB_SCHEMA_V2.6_FULL_DDL.sql
-- Phoenix Project — Full Database DDL
-- Version: 2.6
-- Date: 2026-03-03
-- Changes from V2.5:
--   KB-001: Converted partial unique constraints (tickers, user_api_keys)
--           from invalid inline CONSTRAINT...WHERE to separate CREATE UNIQUE INDEX
--   KB-002: Added missing tables: user_refresh_tokens, revoked_tokens
--   KB-003: Renamed brokers_fees → trading_account_fees (per migration)
-- Source of truth: Production DB (confirmed by Team 20 on 2026-03-03)
-- ============================================================
```

---

## §4 VALIDATION BEFORE DELIVERY

After producing V2.6, validate:

1. **Syntax check:** Run DDL through a PostgreSQL parser or `psql --file` against a test DB to confirm no syntax errors
2. **No inline partial constraints:** Grep for `WHERE` inside CREATE TABLE blocks — should return zero
3. **Tables present:** Both `user_refresh_tokens` and `revoked_tokens` exist in V2.6
4. **Rename complete:** `grep -i brokers_fees PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` returns zero results
5. **Header updated:** Version, date, and changelog in file header

---

## §5 DELIVERY

**File location:** `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`

**Notification:** When V2.6 is committed, send confirmation to Team 10:
`TEAM_170_DDL_V2.6_DELIVERY_CONFIRMATION_v1.0.0.md`

Include:
- File path
- 3 corrections applied (KB-001, KB-002, KB-003)
- Confirmation that V2.5 is retained
- Validation results (syntax check result, grep check results)

---

## COMPLETION CRITERIA

Team 170 is complete when:
- [ ] Team 20 `TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0.md` received
- [ ] `PHX_DB_SCHEMA_V2.6_FULL_DDL.sql` created at correct path
- [ ] V2.5 file retained (not deleted or modified)
- [ ] All 3 corrections applied (KB-001: index syntax, KB-002: missing tables, KB-003: rename)
- [ ] DDL header updated (version 2.6, date, changelog)
- [ ] Syntax validation passed
- [ ] Confirmation document delivered to Team 10

---

**log_entry | TEAM_00→TEAM_170 | DDL_RECONCILIATION_ACTIVATION_v1.0.0 | ACTIVE | 2026-03-03**
