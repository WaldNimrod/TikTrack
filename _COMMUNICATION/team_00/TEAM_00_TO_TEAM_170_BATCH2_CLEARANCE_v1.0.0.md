# TEAM 00 → TEAM 170 | Batch 2 Clearance — DDL V2.6
**Document ID:** TEAM_00_TO_TEAM_170_BATCH2_CLEARANCE_v1.0.0
**date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 170 (Spec / Governance / Documentation)
**Re:** Team 20 schema handoff delivered — cleared to produce DDL V2.6
**Status:** CLEARED — with execution note

---

## §1 PREREQUISITE STATUS

Team 20 has delivered `TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0.md`.

| Item | Status |
|------|--------|
| Schema confirmation document | ✅ DELIVERED |
| SQL queries provided for all 7 required tables | ✅ PRESENT |
| Expected state documented per migrations | ✅ PRESENT |
| Actual DB output (query results) | ⚠️ NOT provided — Team 20 lacks production DB access |

---

## §2 EXECUTION NOTE — CRITICAL

Team 20 does not have direct production DB access. Their document provides SQL queries and EXPECTED state, but not actual DB execution output.

**Your first action before writing V2.6:**

Run the SQL queries provided in `TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0.md §1` against the TARGET_RUNTIME production database. Confirm actual results match expected state.

If the actual DB output differs from expected:
- Document the discrepancy
- Do NOT write V2.6 with incorrect state
- Escalate to Team 00 via `_COMMUNICATION/_ARCHITECT_INBOX/`

If actual output matches expected state (most likely case):
- Proceed to write V2.6 per `TEAM_00_TO_TEAM_170_DDL_RECONCILIATION_ACTIVATION_v1.0.0.md`

---

## §3 REMINDER — YOUR 3 CORRECTIONS

Per the activation prompt already issued:

| Correction | KB | Action |
|-----------|-----|--------|
| Partial unique constraint syntax | KB-001 | Replace inline `CONSTRAINT...WHERE` → `CREATE UNIQUE INDEX...WHERE` (separate statement) for `tickers` and `user_api_keys` |
| Missing tables | KB-002 | Add `user_refresh_tokens` + `revoked_tokens` DDL (columns from production DB query or ORM `api/models/tokens.py`) |
| Table rename | KB-003 | `brokers_fees` → `trading_account_fees` everywhere in DDL |

**Output file:** `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`
**Old file:** V2.5 retained as archive (do NOT delete)

---

## §4 DELIVERY

When complete, issue:
`TEAM_170_DDL_V2.6_DELIVERY_CONFIRMATION_v1.0.0.md` to Team 10 inbox.

Include: 3 corrections applied + validation checks (syntax pass + grep for brokers_fees = 0 results).

---

**log_entry | TEAM_00→TEAM_170 | BATCH2_CLEARANCE | TEAM_20_SCHEMA_HANDOFF_RECEIVED | 2026-03-03**
