# TT2_SECURITY_AND_AUTH_MODEL

**id:** `TT2_SECURITY_AND_AUTH_MODEL`  
**owner:** Team 10 + Team 20  
**status:** DRAFT  
**last_updated:** 2026-02-12  

---

## 1) Auth Model (A/B/C/D)
- **A) Open**: Login / Register / Reset Password — header hidden
- **B) Shared**: Home — guest container vs logged‑in container
- **C) Auth‑only**: D16/D18/D21 — guest redirects to Home
- **D) Admin‑only**: /admin/design-system — JWT role required

## 2) Role & Tier Model (JWT)
- `role`: USER | ADMIN
- `user_tier`: future readiness for premium tiers

## 3) Redirect Rules & Guards
- Guest → Home for Type C
- Unauthorized → block message for Type D
- Header persistence always on B/C/D

## 4) Sensitive Data Policies
- Masked logging only (no console.log)
- `is_test_data` on non‑base data
- Sanitization FE+BE for rich text

## 5) Known Risks & Mitigations
- Header load order regressions
- Token leakage
- Mixed auth response formats

## 6) References (SSOT)
- `documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
