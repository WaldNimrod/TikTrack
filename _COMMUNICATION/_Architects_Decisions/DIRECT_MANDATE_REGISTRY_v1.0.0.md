---
id: DIRECT_MANDATE_REGISTRY_v1.0.0
date: 2026-04-02
historical_record: true
authority: ARCHITECT_DIRECTIVE_DIRECT_MANDATE_PROTOCOL_v1.0.0
classification: OPERATIONAL_LOG
maintainer: Team 100
status: ACTIVE
date_created: 2026-03-23---

# Direct Mandate Protocol — Registry

**Single source of truth for all Direct Mandates issued under the DMP.**

> This registry is an operational log only — it is NOT a WSM substitute.
> Governed by: `ARCHITECT_DIRECTIVE_DIRECT_MANDATE_PROTOCOL_v1.0.0.md` §6

---

## Registry

| DM-ID | Date | Issuer | Target Team | Subject | Pipeline Impact | Status | Closed |
|-------|------|--------|-------------|---------|-----------------|--------|--------|
| DM-001 | 2026-03-23 | Team 100 | Team 101 | Canary Fix Sprint (FIX-101-01 to 07 + OBS-51-001) | NONE | CLOSED | ✅ 2026-03-23 |
| DM-002 | 2026-03-23 | Team 100 | Team 170 | AOS Pipeline Documentation (4 docs) | NONE | CLOSED | ✅ 2026-03-23 |
| DM-003 | 2026-03-23 | Team 100 | Team 101 | Canary Simulation Mandate (Phase A + Phase B) | NONE | CLOSED | ✅ 2026-03-23 |
| DM-004 | 2026-03-23 | Team 100 | Team 61 | UI Integration — DMP Registry panel (Roadmap sidebar + Dashboard badge) | NONE | CLOSED | ✅ 2026-03-23 |
| DM-005 | 2026-03-24 | Team 00 | Team 101 | Pipeline Stabilization — SC-AOS-02/03 + WP002 deferral + G0→G5 verification run | BRIDGE_TO_PIPELINE | ACTIVE — ITEM-0 ✅ | ITEM-2 open |
| DM-006 | 2026-03-24 | Team 00 | Team 170 | WSM Log Cleanup — archive S001+S002 log_entries + §0 drift fix | NONE | CLOSED | ✅ 2026-03-24 |

---

## Closure Details

### DM-001 — Canary Fix Sprint
- **Mandate file:** `_COMMUNICATION/team_101/TEAM_100_TO_TEAM_101_CANARY_FINDINGS_DELEGATION_v1.0.0.md`
- **Completion report:** `_COMMUNICATION/team_101/TEAM_101_CANARY_FIXES_SUMMARY_v1.0.0.md`
- **QA report:** `_COMMUNICATION/team_51/TEAM_51_S003_P013_WP001_CANARY_FIXES_QA_REPORT_v1.0.0.md`
- **Approval:** `_COMMUNICATION/team_100/TEAM_100_CANARY_FIX_SPRINT_FINAL_APPROVAL_v1.0.0.md`
- **Bridge Decision:** ABSORB — code fixes integrated directly into codebase; no pipeline WP required
- **Retroactively registered** under DMP (fixes were issued during S003-P013 canary run)

### DM-002 — AOS Pipeline Documentation
- **Mandate file:** `_COMMUNICATION/team_170/TEAM_100_TO_TEAM_170_AOS_PIPELINE_DOCUMENTATION_MANDATE_v1.0.0.md`
- **Completion report:** `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DOCS_COMPLETION_REPORT_v1.0.0.md`
- **Constitutional validation:** `_COMMUNICATION/team_190/TEAM_190_AOS_PIPELINE_DOCS_VALIDATION_v1.0.1.md` (PASS)
- **Approval:** `_COMMUNICATION/team_100/TEAM_100_AOS_PIPELINE_DOCS_MANDATE_FINAL_APPROVAL_v1.0.0.md`
- **BN-1 patch:** `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_100_BN1_PIPELINE_RELAXED_KB84_PATCH_CONFIRMATION_v1.0.0.md`
- **BN-1 acceptance:** `_COMMUNICATION/team_100/TEAM_100_BN1_ACCEPTANCE_AND_SIMULATION_MANDATE_ACTIVATION_v1.0.0.md`
- **Bridge Decision:** ABSORB — 4 docs in `documentation/docs-system/02-PIPELINE/` are canonical
- **Retroactively registered** under DMP

### DM-004 — UI Integration (DMP Registry)
- **Mandate file:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_DMP_UI_INTEGRATION_MANDATE_v1.0.0.md`
- **Completion report:** `_COMMUNICATION/team_61/TEAM_61_DM_004_COMPLETION_REPORT_v1.0.0.md`
- **QA report (initial):** `_COMMUNICATION/team_51/TEAM_51_DM004_DMP_UI_QA_REPORT_v1.0.0.md` (QA_PASS)
- **BN-1 confirmation:** `_COMMUNICATION/team_61/TEAM_61_DM_004_BN1_CONFIRMATION_v1.0.0.md`
- **QA report (BN-1):** `_COMMUNICATION/team_51/TEAM_51_DM004_BN1_QA_REPORT_v1.0.0.md` (QA_PASS — B1=B2=B3=2 ✓)
- **Architectural review:** `_COMMUNICATION/team_100/TEAM_100_DM_004_ARCHITECTURAL_REVIEW_AND_CLOSURE_v1.0.0.md`
- **Bridge Decision:** ABSORB — 7 UI files (roadmap panel + dashboard badge) canonical in `agents_os/ui/`
- **BN-1 fix:** badge count aligned to `!== "CLOSED"` logic — parity with roadmap Active tab confirmed

### DM-005 — Pipeline Stabilization (IN PROGRESS)
- **Mandate file:** `_COMMUNICATION/team_101/TEAM_00_TO_TEAM_101_DM_005_PIPELINE_STABILIZATION_MANDATE_v1.0.0.md`
- **ITEM-0 (Dashboard Hardening):** ✅ CLOSED 2026-03-24
  - Implementation: `TEAM_61_DM005_ITEM0_DASHBOARD_HARDENING_DELIVERY_v1.0.0.md`
  - QA: `TEAM_51_DM005_ITEM0_DASHBOARD_QA_REPORT_v1.0.0.md` — QA_PASS (5/5 checks)
  - Architectural review: `TEAM_100_REVIEW_TEAM_61_CANONICAL_DELIVERY_AGENTS_OS_UI_v1.0.0.md` — APPROVED
  - FIX-1..4: optional files / loadPrompt guard / checkExpectedFiles guard — Dashboard zero-404 + zero-SEVERE
- **ITEM-2 (G0→G5 Verification Run):** OPEN — Team 101 lead
- **Bridge Decision (partial):** ABSORB — FIX-1..4 canonical in `agents_os/ui/js/`

### DM-003 — Canary Simulation Mandate
- **Mandate file:** `_COMMUNICATION/team_101/TEAM_100_TO_TEAM_101_CANARY_SIMULATION_MANDATE_v1.0.0.md`
- **Closure package:** `_COMMUNICATION/team_101/TEAM_101_TO_TEAM_100_CONSTITUTION_AND_SIMULATION_CLOSURE_PACKAGE_v1.0.0.md`
- **Verification report:** `_COMMUNICATION/team_101/TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md`
- **QA:** Team 51 (206 passed, exit 0) — included in closure package
- **Architectural review:** `_COMMUNICATION/team_100/TEAM_100_DM_003_SIMULATION_MANDATE_ARCHITECTURAL_REVIEW_v1.0.0.md`
- **Bridge Decision:** PARTIAL_ABSORB + FORMALIZE
  - ABSORB: Layer 1 infra + CI + Selenium + gap analysis → canonical immediately
  - FORMALIZE: GAP-002..008 + Phase B B1–B3 → future WP (SIM-CLOSE-02..06)
- **Deviation noted:** DMP_DEVIATION_001 — Team 101 sub-mandated Team 61 without authority; ratified post-facto; BN-DM003-1 issued

---

## Registry Rules

Per `ARCHITECT_DIRECTIVE_DIRECT_MANDATE_PROTOCOL_v1.0.0.md` §6:

1. Team 100 adds a row when issuing a mandate (status: `ACTIVE`)
2. Team 100 updates status when deliverables received (→ `PENDING_REVIEW`)
3. Team 100 closes when final decision issued (→ `CLOSED` + date)
4. This registry is NOT a WSM substitute — operational log only
5. All DM-IDs are sequential and permanent; never reused

---

---

## Integration Points

| מערכת | איך DM-Registry משתלב |
|---|---|
| Roadmap page (`PIPELINE_ROADMAP.html`) | Panel נפרד ב-sidebar — Active / Closed tabs — קורא קובץ זה (DM-004) |
| Dashboard (`PIPELINE_DASHBOARD.html`) | Badge בכותרת — ספירת DMs ב-ACTIVE — ניווט ל-Roadmap (DM-004) |
| WSM | ללא שילוב — DMs מחוץ ל-WSM by design |
| pipeline_state.json | ללא שילוב — DMs מחוץ לגייט מודל |
| CI / ssot_check | ללא check — DMs אינם SSOT-tracked entities |

---

**log_entry | TEAM_100 | DMP_REGISTRY | CREATED | DM-001_CLOSED | DM-002_CLOSED | DM-003_ACTIVE | 2026-03-23**
**log_entry | TEAM_100 | DMP_REGISTRY | DM-004_ADDED | UI_INTEGRATION_MANDATE_ISSUED | 2026-03-23**
**log_entry | TEAM_100 | DMP_REGISTRY | DM-004_CLOSED | BN1_PASS | BRIDGE_ABSORB | 2026-03-23**
**log_entry | TEAM_100 | DMP_REGISTRY | DM-003_CLOSED | PARTIAL_ABSORB_FORMALIZE | DMP_DEVIATION_001 | 2026-03-23**
**log_entry | TEAM_00 | DMP_REGISTRY | DM-005_UPDATED_v1.1.0 | TEAM_101_ASSESSMENT_INTEGRATED | 2026-03-24**
**log_entry | TEAM_00 | DMP_REGISTRY | DM-005_UPDATED_v1.2.0 | DASHBOARD_100PCT_HARDENING_ADDED | ITEM_0_PRE_CONDITION | 2026-03-24**
**log_entry | TEAM_00 | DMP_REGISTRY | DM-006_CLOSED | ABSORB | WSM_169_LINES | SECTION_0_DRIFT_FIXED | 2026-03-24**
**log_entry | TEAM_00 | DMP_REGISTRY | DM-006_ADDED | WSM_LOG_CLEANUP_MANDATE_ISSUED | TEAM_170_ACTIVATED | 2026-03-24**
**log_entry | TEAM_100 | DMP_REGISTRY | DM-005_ITEM0_CLOSED | TEAM_61_DELIVERY_APPROVED | DASHBOARD_ZERO_404_ZERO_SEVERE | ITEM2_AUTHORIZED | 2026-03-24**
