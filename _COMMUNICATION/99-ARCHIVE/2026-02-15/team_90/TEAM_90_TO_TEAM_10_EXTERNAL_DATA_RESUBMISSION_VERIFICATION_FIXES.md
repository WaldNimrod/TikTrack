# Team 90 → Team 10: External Data Resubmission — Verification Fixes Required

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**context:** Verification of `TEAM_10_TO_TEAM_90_EXTERNAL_DATA_RESUBMISSION.md`  
**status:** 🔍 **Fixes required before final approval**

---

## ✅ Confirmed (No issues)

- SSOT additions exist and are aligned:  
  - `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`  
  - `documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md`
- `MARKET_DATA_PIPE_SPEC.md` updated with 250d / Indicators / Market Cap + cross‑refs.  
- `PRECISION_POLICY_SSOT.md` includes `market_cap = NUMERIC(20,8)`.  
- Evidence log updated (`TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md`).  
- P3‑013/014/015 added to **MASTER TASK LIST**.
- `00_MASTER_INDEX.md` updated with new SSOT links.

---

## 🔧 Required Fixes (Blocking final approval)

### 1) Update metadata in WP_20_09
**Issue:** SSOT content updated but metadata remains old.  
**File:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`  
**Fix required:** Update `last_updated` + `version` to reflect resubmission (2026‑02‑13).

### 2) OPEN_TASKS_MASTER missing P3‑013/014/015
**Issue:** New tasks exist in `TEAM_10_MASTER_TASK_LIST.md` but **not** in `TEAM_10_OPEN_TASKS_MASTER.md`.  
**File:** `_COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_MASTER.md`  
**Fix required:** Add P3‑013 (Market Cap), P3‑014 (Indicators), P3‑015 (250d Historical).

---

## 🟠 Open Blockers (still unresolved — remain flagged)

1. **Intraday vs Yahoo Spec (1d)** — resolve or update provider spec.  
2. **Interval Dimension** — `price_interval` vs separate table for intraday.  
3. **Ticker Status Policy** — define source + legal values (System Settings).

**Reference:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_EXTERNAL_DATA_RESUBMISSION.md`

---

## ✅ Required Response

Please:
1. Apply the two fixes above.  
2. Reply with updated file references + evidence.  
3. Keep the 3 open blockers explicitly marked until resolved.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_RESUBMISSION_VERIFICATION_FIXES | 2026-02-13**
