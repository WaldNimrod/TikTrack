# 🕵️ Team 90 — Scorched Earth Mapping Verification (After Corrections)

**id:** `TEAM_10_MAPPING_VERIFICATION_AFTER_CORRECTIONS`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway) + Team 20/30/40/60  
**date:** 2026-02-09  
**context:** ADR-011 — Debt Closure — Post‑Correction Mapping Verification  
**status:** 🟡 **CONDITIONAL PASS — ONE SSOT GAP**

---

## 🎯 Objective
Verify all four team mapping submissions against SSOT and actual code/HTML after corrections. Identify any remaining holes, contradictions, or drift that would block Phase 2 closure readiness.

**SSOT References (authoritative):**
- `documentation/00-MANAGEMENT/ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md`
- `documentation/05-PROCEDURES/ARCHITECT_DATA_MANAGEMENT_SOP_011.md`
- `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- `documentation/01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md`
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

**Mapping Submissions Reviewed:**
- `_COMMUNICATION/team_20/TEAM_20_PHASE_2_MAPPING_SUBMISSION.md`
- `_COMMUNICATION/team_30/TEAM_30_PHASE_2_MAPPING_SUBMISSION.md`
- `_COMMUNICATION/team_40/TEAM_40_PHASE_2_MAPPING_SUBMISSION.md`
- `_COMMUNICATION/team_60/TEAM_60_PHASE_2_MAPPING_SUBMISSION.md`
- `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md` (single source of truth)

---

## ✅ Verification Summary

| Team | Status | Result | Notes |
|------|--------|--------|------|
| **Team 20 (Backend)** | Submitted (Corrected) | ✅ Mostly OK | **SSOT DDL hole for brokers_fees** (see Gap A) |
| **Team 60 (DevOps)** | Submitted | ✅ OK | Makefile targets + scripts present |
| **Team 30 (Frontend)** | Submitted | ✅ OK | Pointer‑only to unified mapping |
| **Team 40 (Frontend)** | Submitted | ✅ OK | Pointer‑only to unified mapping |
| **Unified (Team 30+40)** | Single Source | ✅ OK | Matches HTML + CSS order + Option D |

**Bottom line:** Code + unified mapping look aligned. **Only remaining gap is SSOT DDL for `brokers_fees`.** All teams except Team 20 already comply with the “single final submission” requirement.

---

## 🔎 Findings (Scorched Earth)

### ✅ Team 20 — Backend Mapping
**Checked:** `_COMMUNICATION/team_20/TEAM_20_PHASE_2_MAPPING_SUBMISSION.md`
- Endpoints list is Phase 2 only, includes `trading_accounts/summary` and `cash_flows/currency_conversions`.
- Ports/8080–8082 configs mapped to actual files.
- Precision 20,6 traced to DDL for `cash_flows.amount`.

**Gap A — SSOT DDL missing brokers_fees**
- In mapping, Team 20 notes `brokers_fees.minimum` is NUMERIC(20,6) in ORM but **not found** in `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`.
- I confirmed DDL contains `cash_flows`, but **no brokers_fees table** appears in the DDL SSOT.

**Required Action (Team 20 + Team 10):**
- Update SSOT DDL or add an SSOT‑approved DDL addendum that includes `user_data.brokers_fees` and its precision.
- Mapping must link to the correct SSOT for brokers_fees (not ORM only).

---

### ✅ Team 60 — DevOps Mapping
**Checked:** `_COMMUNICATION/team_60/TEAM_60_PHASE_2_MAPPING_SUBMISSION.md`
- `Makefile` targets `db-test-fill` and `db-test-clean` exist.
- Scripts exist: `scripts/seed_test_data.py`, `scripts/db_test_clean.py`.
- `seed_test_data.py` ensures `is_test_data` column and seeds Phase 2 entities.

**Status:** ✅ No gaps found.

---

### ✅ Team 30 — Frontend Mapping Submission (Resolved)
**Checked:** `_COMMUNICATION/team_30/TEAM_30_PHASE_2_MAPPING_SUBMISSION.md`

**Status:** Pointer‑only submission. No drift found.  
All detailed mapping resides in: `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md`.

---

### ✅ Team 40 — Frontend Mapping Submission (Resolved)
**Checked:** `_COMMUNICATION/team_40/TEAM_40_PHASE_2_MAPPING_SUBMISSION.md`

**Status:** Pointer‑only submission. No drift found.  
All detailed mapping resides in: `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md`.

---

## ✅ Unified Mapping (Team 30+40) — Verified
**Checked:** `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md`

Verified against HTML + SSOT:
- CSS load order matches SSOT (phoenix‑base first).
- Column counts match HTML.
- Sticky Start/End defined for all Phase 2 tables (Option D).

**Status:** ✅ Trusted as single source of truth.

---

## 🔧 Required Actions (Do‑Not‑Miss)

### Team 20 + Team 10 (Remaining Gap)
- **Fix SSOT DDL gap for brokers_fees** (add table to SSOT DDL or publish SSOT addendum).
- Update any SSOT references accordingly.
 - **Mark mapping submission as FINAL single‑doc** (explicitly state in `TEAM_20_PHASE_2_MAPPING_SUBMISSION.md` or issue a short “FINAL SUBMISSION” wrapper pointing to it as the only source).

---

## ✅ Conditional Pass Criteria
This verification moves to **GREEN** only after:
1. SSOT DDL includes brokers_fees table + precision references.

---

## 📌 Evidence / Reference Links
- Unified mapping: `_COMMUNICATION/team_40/TEAM_30_40_UNIFIED_PHASE_2_MAPPING.md`
- CSS load SSOT: `documentation/01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md`
- Option D SSOT: `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- DDL SSOT: `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

---

**Prepared by:** Team 90 (The Spy)  
**Status:** 🟡 **CONDITIONAL PASS** — doc drift + SSOT DDL hole must be closed
