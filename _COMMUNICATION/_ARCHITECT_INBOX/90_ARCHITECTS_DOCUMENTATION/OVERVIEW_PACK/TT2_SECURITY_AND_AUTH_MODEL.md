# TT2_SECURITY_AND_AUTH_MODEL
**project_domain:** TIKTRACK

**id:** `TT2_SECURITY_AND_AUTH_MODEL`  
**owner:** Team 10 + Team 20  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

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
- **ADR‑017:** Redirect to Home (/) for any unauthenticated access to non‑Open pages.
- **ADR‑017:** User Icon colors enforced: Success (logged‑in) / Warning (logged‑out); black is invalid.
- History force reload (`mode=force_reload`) is Admin-only.

## 4) Sensitive Data Policies
- Masked logging only (no console.log)
- `is_test_data` on non‑base data
- Sanitization FE+BE for rich text
- No external provider key leakage in logs/responses

## 5) Known Risks & Mitigations
- Header load order regressions
- Token leakage
- Mixed auth response formats
- Provider limit/availability issues (Yahoo 429, Alpha key/rate constraints) mitigated by cache-first + fallback

## 6) References (SSOT)
- `documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
