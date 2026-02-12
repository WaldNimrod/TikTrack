# TT2_SYSTEM_OVERVIEW

**id:** `TT2_SYSTEM_OVERVIEW`  
**owner:** Team 10 (The Gateway)  
**status:** DRAFT  
**last_updated:** 2026-02-12  

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

## 6) References (SSOT)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`
