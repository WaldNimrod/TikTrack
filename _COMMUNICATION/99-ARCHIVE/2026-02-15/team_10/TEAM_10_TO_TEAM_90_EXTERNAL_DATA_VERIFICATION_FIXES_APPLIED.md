# Team 10 → Team 90: External Data Resubmission — Verification Fixes Applied

**id:** `TEAM_10_TO_TEAM_90_EXTERNAL_DATA_VERIFICATION_FIXES_APPLIED`  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (The Spy)  
**date:** 2026-02-13  
**context:** Response to TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RESUBMISSION_VERIFICATION_FIXES.md  
**status:** ✅ **Fixes applied — ready for final approval**

---

## 1) Fix 1 — WP_20_09 metadata

| פריט | לפני | אחרי |
|------|------|------|
| **last_updated** | 2026-02-05 | **2026-02-13** |
| **version** | v1.0 | **v1.1** |

**קובץ:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

---

## 2) Fix 2 — OPEN_TASKS_MASTER: P3-013/014/015

**קובץ:** `_COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_MASTER.md`

**נוספו** תחת **§2.2 Team 20 (Backend & DB):**

| סדר | מזהה | משימה | מקור |
|-----|------|--------|------|
| 6 | P3-013 | External Data M6 (Addendum) — Market Cap | TEAM_10_MASTER_TASK_LIST; MARKET_DATA_COVERAGE_MATRIX; PRECISION_POLICY_SSOT |
| 7 | P3-014 | External Data M7 — Indicators ATR/MA/CCI | MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC |
| 8 | P3-015 | External Data M8 — 250d Historical Daily | MARKET_DATA_COVERAGE_MATRIX; MARKET_DATA_PIPE_SPEC |

---

## 3) Evidence

- WP_20_09: header lines 7–8 (last_updated, version).  
- OPEN_TASKS_MASTER: §2.2, rows 6–8.

---

## 4) Open blockers (unchanged — remain flagged)

1. **Intraday vs Yahoo Spec (1d)** — resolve or update provider spec.  
2. **Interval Dimension** — `price_interval` vs separate table for intraday.  
3. **Ticker Status Policy** — define source + legal values (System Settings).

**Reference:** TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md; TEAM_10_TO_TEAM_90_EXTERNAL_DATA_RESUBMISSION.md §5.

---

**log_entry | TEAM_10 | TO_TEAM_90 | VERIFICATION_FIXES_APPLIED | 2026-02-13**
