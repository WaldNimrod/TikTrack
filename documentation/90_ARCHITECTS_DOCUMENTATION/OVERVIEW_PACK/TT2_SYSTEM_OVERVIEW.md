# TT2_SYSTEM_OVERVIEW

**id:** `TT2_SYSTEM_OVERVIEW`  
**owner:** Team 10 (The Gateway)  
**status:** DRAFT  
**last_updated:** 2026-02-13  

---

## 1) Purpose
TikTrack Phoenix (TT2) is a financial-core platform for managing trading accounts, broker fees, and cash flows with strict governance, unified architecture (UAI/PDSC), and consistent UX. The system is designed for auditability, future integrations, and high-fidelity UI consistency.

## 2) Scope (In / Out)
**In scope (Phase 2 Financial Core):**
- D16 Trading Accounts
- D18 Brokers Fees (fees per trading account)
- D21 Cash Flows + Currency Conversions
- Unified Header + Auth model (A/B/C/D)
- Gate A/B/C quality protocol

**Out of scope (current):**
- Premium tiers business logic (user_tier routing) — readiness only
- Full production deployment hardening

## 3) Core Value Proposition
- **Account-centric model:** Fees and operations are anchored to Trading Accounts.
- **Unified contract enforcement:** UAI config + PDSC boundary reduce drift.
- **Governance-first delivery:** SSOT-driven changes + audit trails.

## 4) Primary User Journeys (Summary)
- **Open (A):** Login / Register / Reset Password (no header)
- **Shared (B):** Home with guest vs logged-in containers
- **Auth-only (C):** D16/D18/D21 (guest → Home)
- **Admin-only (D):** /admin/design-system (JWT role required)

## 5) Key Constraints & Non‑Goals
- No inline styles inside the Rich‑Text Editor; UI uses DNA/SSOT classes.
- No direct fetch; all API via Shared_Services.
- Must comply with SSOT decisions (ADR-013, ADR-015, SOP-012).
- **ADR‑017:** System version locked to **1.0.0**; all layers must align to 1.x.
- **ADR‑017/ADR‑014:** Account‑based fees refactor is mandatory (no approval for D18/D21 without full data refactor).
- **ADR‑018:** “Other” broker rule enforced (unsupported accounts block API/import; user‑facing notice).

## 6) Status Snapshot (2026-02-13)
- **Gate B:** GREEN (Team 90 re‑verify on record).
- **Visual Sign‑off:** Approved (Team 10 log entry).
- **Clean Table:** Declared (A/B/C all ✅; knowledge promotion + archive completed).

## 7) References (SSOT)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`
- `documentation/05-REPORTS/GATE_B_STATUS.md`
- `_COMMUNICATION/team_90/TEAM_90_GATE_B_REVERIFY_GREEN.md`
- `_COMMUNICATION/team_10/TEAM_10_G_LEAD_VISUAL_SIGNOFF_LOG.md`
- `_COMMUNICATION/team_10/TEAM_10_CLEAN_TABLE_PROTOCOL.md`
- `_COMMUNICATION/99-ARCHIVE/2026-02-12/ARCHIVE_MANIFEST.md`
- `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX_v1.0.md`
