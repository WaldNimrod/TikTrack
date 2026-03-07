# POL-015 — TT2 Page Template Contract v1.0.0

**project_domain:** TIKTRACK  
**id:** POL-015  
**owner:** Team 00 (Chief Architect)  
**date:** 2026-03-06  
**status:** LOCKED  
**scope:** UI structural shell consistency for all TT2 pages

---

## 1) Purpose

Define one mandatory page-shell contract for TT2 pages so UI structure remains deterministic across implementation, QA, and validation workflows.

## 2) Canonical Structural Contract

Every TT2 page must comply with this shell contract:

`header#unified-header -> .page-wrapper -> .page-container -> main -> .tt-container -> .tt-section`

Mandatory loader and boot order:
1. `headerLoader.js` must load before page init logic.
2. CSS order: Pico -> Base -> Components -> Header -> Page-specific.
3. JS order: header loader -> page config -> unified app initialization.

## 3) Validation Enforcement

Policy enforcement is mandatory via repository checks:
1. `ui/scripts/validate-pages.js` — structural validation gate.
2. `ui/scripts/generate-pages.js` — page generation consistency.

Any non-compliant page is invalid for QA/FAV submission.

## 4) Governance Position

- This policy is normative for UI shell structure.
- It complements gate contracts and does not alter gate ownership.
- It is consumable by Team 30 (implementation), Team 50 (QA), Team 90 (validation), Team 190 (constitutional checks).

## 5) Canonical Source Lineage

Promoted from architect inbox documents:
1. `_COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT.md`
2. `_COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md`

This file is now the canonical governance policy reference for `POL-015` in active documentation.

---

**log_entry | TEAM_190 | POL_015_CANONICAL_POLICY_PROMOTION | LOCKED_REFERENCE_CREATED | 2026-03-06**
