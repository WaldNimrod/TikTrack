---
id: ARCHITECT_DIRECTIVE_CATS
owner: Chief Architect (Team 00)
status: LOCKED - MANDATORY
decision_type: DIRECTIVE
context: CATS — Calculation Accuracy Test Suite (NUMERIC 20,8 Precision + Financial Calculation Validation)
sv: 1.0.0
doc_schema_version: 1.0
effective_date: 2026-02-26
last_updated: 2026-02-26
supersedes: N/A
related:
  - documentation/docs-governance/01-FOUNDATIONS/03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md
---
**project_domain:** TIKTRACK

# ARCHITECT DIRECTIVE — CATS: CALCULATION ACCURACY TEST SUITE

---

## 1) Context

The TikTrack Constitution requires NUMERIC(20,8) precision for all financial values — zero rounding.
This is an Iron Rule. However, there is currently no automated test suite that:
a. Verifies financial values survive a full round-trip (POST → GET → compare) without rounding
b. Validates that precision is maintained through the serialization/deserialization chain
   (Python backend → JSON → JavaScript frontend → display)
c. Catches precision regressions when backend or DB schema changes

Additionally, financial calculations (e.g., daily_change_pct, portfolio metrics) need
deterministic correctness testing against known test vectors.

The CATS (Calculation Accuracy Test Suite) addresses these gaps as a reusable script-based
asset that can run without LLM involvement and produces clear PASS/FAIL output.

---

## 2) Decision

**CATS** is a mandatory test component for any TikTrack page that stores or displays financial values.
CATS is implemented as a bash script with optional Python verification for decimal precision.
It is integrated into FAV as a required test component (per ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md §4.B).

Partial implementation via script is the primary delivery mechanism (token-efficient;
no LLM required for execution).

---

## 3) Scope

**In scope (immediate — S002-P003):**
- D34 (alerts): price_threshold field — NUMERIC(20,8) round-trip verification
- D22 (tickers): current_price — read-back precision check (read-only; price set by provider)

**In scope (ongoing — S003+):**
- Any page with financial value storage: D36 (executions), D37 (data_import), D24–D29 (portfolio)
- Any calculation output: daily_change_pct, ROI, P&L, portfolio value

**Out of scope:**
- UI display formatting (frontend may display 2 decimal places for UX; this is acceptable
  as long as the stored value in DB maintains 8 decimal places)
- Non-financial string/integer fields

---

## 4) Binding Rules (MUST / MUST NOT)

### A. Script Implementation

1. MUST implement CATS as `scripts/run-cats-precision.sh` — a standalone bash script.

2. MUST use known test vectors with exact 8-decimal precision:
   ```bash
   # Known test vectors (do not change)
   PRICE_8DEC="99.12345678"
   PRICE_4DEC="99.1235"         # would indicate 4-decimal rounding
   PRICE_2DEC="99.12"           # would indicate 2-decimal rounding
   PRICE_INTEGER="99"           # would indicate integer truncation
   THRESHOLD_8DEC="0.00000001"  # minimum precision test (8 decimals)
   THRESHOLD_LARGE="1234567.89012345"  # large value precision test
   ```

3. MUST implement precision comparison using Python3 for exact decimal comparison:
   ```bash
   python3 -c "
   import sys, json, decimal
   actual = sys.argv[1]
   expected = sys.argv[2]
   if decimal.Decimal(actual) == decimal.Decimal(expected):
       sys.exit(0)
   else:
       print(f'PRECISION FAIL: got {actual}, expected {expected}')
       sys.exit(1)
   "
   ```
   Note: floating-point comparison with `==` or `bc` is NOT sufficient for 8-decimal precision.

4. MUST test three precision scenarios per financial field:
   a. **Write 8-decimal value → Read back → Compare exactly** (primary test)
   b. **Write minimum precision value (0.00000001) → Read back → Compare exactly**
   c. **Write maximum realistic value (1234567.89012345) → Read back → Compare exactly**

5. MUST clean up all test records created during the run.

### B. What CATS Tests Per Page

6. **D34 (alerts) — price_threshold:**
   ```bash
   # Create alert with 8-decimal price_threshold
   POST /alerts { ..., "price_threshold": "99.12345678" }
   # Read back
   GET /alerts/{id}
   # Compare: body.price_threshold == "99.12345678" (exact)
   # FAIL if: "99.12", "99.1235", "99.123457", or any other rounding
   ```

7. **D22 (tickers) — current_price (read-only verification):**
   Since current_price is set by the data provider (not user-input), CATS verifies that
   the DB column type does not truncate values already present:
   ```bash
   # Read a ticker with known price
   GET /tickers/{id}
   # Verify: body.current_price is a decimal value (not null, not integer)
   # Verify: body.current_price has at least 2 significant decimal digits
   # Note: provider may return 2-decimal prices; this is acceptable
   # FAIL only if: body.current_price is stored as integer (truncated by DB)
   ```

8. **S003+ financial pages — general template:**
   For any new page with financial fields, apply test vector pattern from §4.A rules 2–4.
   Template test in `scripts/run-cats-precision.sh` MUST be extendable by adding test sections
   per page without modifying the core comparison logic.

### C. Output Format

9. MUST produce JSON summary compatible with QA Protocol Standard (ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md):
   ```json
   {
     "suite": "CATS",
     "run_date": "2026-02-26",
     "results": {
       "D34_price_threshold_8dec": "PASS",
       "D34_price_threshold_min": "PASS",
       "D34_price_threshold_large": "PASS",
       "D22_current_price_not_integer": "PASS"
     },
     "total": { "pass": 4, "fail": 0 },
     "status": "PASS",
     "failures": []
   }
   ```

10. Failure objects MUST follow the standard bug report format from QA Protocol Standard §4.D.

### D. Integration with FAV

11. CATS MUST be run as part of FAV for any page with financial fields.
    CATS PASS is a required input to FAV PASS declaration.

12. CATS MAY run in parallel with other API tests (it is a write-capable API test).

13. MUST include CATS results in the final QA report under a dedicated "precision" section.

### E. Partial Implementation Allowed

14. For S002-P003 (D34, D22), partial CATS implementation is acceptable:
    - D34: price_threshold 3-vector test (rules 2 + 6 above) — MANDATORY
    - D22: current_price type check (rule 7 above) — MANDATORY
    Full CATS suite with extensible template for S003+ financial pages is a RECOMMENDED
    enhancement but not blocking for S002-P003 seal.

15. Team 50 MUST implement D34 price_threshold CATS before D34 FAV PASS declaration.

---

## 5) Operational Impact by Team

- **Team 50 (QA executor):** Implements and runs `scripts/run-cats-precision.sh`.
  Includes CATS results in FAV QA report.

- **Team 20 (backend):** On standby. If CATS reveals precision failure, Team 20 receives
  bug report specifying: DB column type, actual vs. expected value, affected endpoint.
  Typical fix: ensure DB column is NUMERIC(20,8), not FLOAT or DECIMAL with fewer places.

- **Team 10 (gateway):** Activates Team 50 for CATS as part of FAV activation.
  Verifies CATS results present in QA report before gate progression.

- **Team 90 (validation):** Validates CATS results in FAV evidence package.
  CATS failure = BLOCK on FAV PASS.

---

## 6) Validation Gate

- **Gate owner:** Team 90
- **Required evidence:**
  - `scripts/run-cats-precision.sh` exists and is runnable
  - CATS JSON summary: `status: PASS`, `failures: []`
  - QA report includes "precision" section with CATS results
- **PASS criteria:**
  - All financial fields round-trip exactly (no precision loss)
  - Python3 decimal comparison confirms exact match
  - Test data cleaned up
- **BLOCK conditions:**
  - Any financial field stores with rounding (e.g., 99.12 instead of 99.12345678)
  - CATS not run as part of FAV for a page with financial fields
  - Floating-point `==` comparison used instead of Python3 decimal (unreliable)

---

## 8) References

- Iron Rule (NUMERIC 20,8): `documentation/docs-governance/01-FOUNDATIONS/03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md`
- FAV Protocol: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md`
- QA Protocol Standard: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md`
- D34 final validation: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_D34_D35_FINAL_VALIDATION.md`
  (§4, rule 5: price threshold precision test — CATS is the formal implementation of that rule)
- D34 backend: `api/routers/alerts.py`
- D22 backend: `api/routers/tickers.py`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_CATS | LOCKED | 2026-02-26**
