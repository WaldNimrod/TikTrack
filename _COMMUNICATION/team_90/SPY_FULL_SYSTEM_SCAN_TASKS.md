# 🧭 SPY Full System Scan — Task Breakdown by Team

**Team:** 90 (The Spy)  
**Date:** 2026-02-05  
**Source:** `_COMMUNICATION/team_90/SPY_FULL_SYSTEM_SCAN_REPORT.md`  
**Goal:** Provide actionable, per‑team task list with evidence and priority.

---

## ✅ Team 10 (Documentation Governance) — **PRIORITY: CRITICAL**

### T10‑1) Archive or deprecate duplicate architect indexes (SSOT conflict)
**Why:** Phase 1.7 mandates single SSOT index.  
**Evidence:**
- `documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md:1-8`
- `documentation/90_ARCHITECTS_DOCUMENTATION/OFFICIAL_PAGE_TRACKER.md:1-9`
**Action:**
- Move both files to `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/` **or** add DEPRECATED header + metadata pointing to `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`.

### T10‑2) Remove SSOT markdown links to `_COMMUNICATION`
**Why:** SSOT must not link to comms files.  
**Evidence:**
- `documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md:238-241`
**Action:**
- Replace markdown links with textual notes or move relevant content into documentation.

### T10‑3) Fix routes.json version drift (v1.1.1 → v1.1.2)
**Why:** SSOT doc accuracy.  
**Evidence:**
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md:31,36`
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md:24`
- `documentation/01-ARCHITECTURE/TT2_UI_INTEGRATION_PATTERN.md:18,25`
**Action:**
- Update all references to `routes.json v1.1.2`.

### T10‑4) Metadata compliance: add `id/owner/status/supersedes`
**Why:** Governance & SSOT compliance.  
**Evidence:** Appendix A (110 files) in `_COMMUNICATION/team_90/SPY_FULL_SYSTEM_SCAN_REPORT.md`
**Action:**
- Add metadata blocks or explicitly mark files as NON‑SSOT and move to reports/archives.

### T10‑5) Port policy correction in governance doc
**Why:** Prevent onboarding confusion.  
**Evidence:**
- `documentation/10-POLICIES/TT2_TEAM_60_DEFINITION.md:61`
**Action:**
- Correct to **Frontend 8080 / Backend 8082**.

---

## ✅ Team 30 (Frontend Execution) — **PRIORITY: MEDIUM**

### T30‑1) Remove inline JS from test HTML (policy compliance)
**Why:** Hybrid scripts policy forbids inline JS.  
**Evidence:**
- `ui/test-auth-guard.html:87+` (inline `<script>` and `onclick`)
**Action:**
- Move JS to external file or relocate test HTML to a non‑production folder excluded from builds.

---

## ✅ Team 50 (QA/Compliance) — **PRIORITY: MEDIUM**

### T50‑1) QA doc references to `_COMMUNICATION`
**Why:** Keep QA references clearly non‑SSOT or move into reports.  
**Evidence:** Multiple `_COMMUNICATION` references found under `documentation/08-REPORTS/` and `documentation/05-PROCEDURES/`.
**Action:**
- Ensure QA docs treat comms references as non‑SSOT; add “Communication only” notices where needed.

---

## 📦 Optional Follow‑Up (Team 10 + Team 90)
- After remediation, rerun scan to confirm:
  - No duplicate indexes in `documentation/90_ARCHITECTS_DOCUMENTATION/`
  - No markdown links to `_COMMUNICATION` in SSOT
  - All SSOT docs reference `routes.json v1.1.2`
  - Metadata compliance at 100%

---

**log_entry | [Team 90] | FULL_SYSTEM_SCAN | TASKS_BY_TEAM | YELLOW | 2026-02-05**
