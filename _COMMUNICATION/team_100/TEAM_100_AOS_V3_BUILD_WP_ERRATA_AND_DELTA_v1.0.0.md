---
id: TEAM_100_AOS_V3_BUILD_WP_ERRATA_AND_DELTA_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Principal), Team 11 (AOS Gateway)
date: 2026-03-28
type: ERRATA_ADDENDUM — AUTHORITY_MODEL v1.0.0 cascading corrections
authority: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
authority_mandate: TEAM_00_TO_TEAM_100_AOS_V3_SPEC_AMENDMENT_AUTHORITY_MODEL_v1.0.0.md---

# Team 100 → Team 00, Team 11 | Errata Addendum — Authority Model Cascade

Per `ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0` §8 (`NOT_PRINCIPAL` removed from all registries) and the spec amendment mandate, the following Team 00 and Team 11-owned documents require corrections. Team 100 cannot modify these files directly.

---

## E-01 — WP v1.0.3 (Team 00 owned)

**File:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md`

### E-01a — Line ~258: Authorization note

**Before:**
> Authorization note for PUT /api/ideas/{idea_id} (AD-S8A-04): Status transitions restricted to `team_00` only. Non-team_00 callers including `status` field → whole request rejected (403 NOT_PRINCIPAL). Any team may update non-status fields.

**After:**
> Authorization note for PUT /api/ideas/{idea_id} (AD-S8A-04, superseded by AUTHORITY_MODEL v1.0.0): Status transitions require Tier 1 or Tier 2 authority. Callers lacking authority including `status` field → whole request rejected (403 INSUFFICIENT_AUTHORITY). Any team may update non-status fields.

### E-01b — Lines ~330, ~418: AD-S8A-04 references

These are checklist and endpoint table references. Replace parenthetical `(AD-S8A-04 authorization)` with `(AD-S8A-04 / AUTHORITY_MODEL v1.0.0 authorization)`.

### E-01c — Line ~485: Activation instruction

**Before:**
> Every activation must include: ... AD-S8A-04 (ideas authorization).

**After:**
> Every activation must include: ... AD-S8A-04 / AUTHORITY_MODEL v1.0.0 (ideas authorization — INSUFFICIENT_AUTHORITY replaces NOT_PRINCIPAL).

---

## E-02 — Build Process Map v1.0.0 (Team 00 owned)

**File:** `_COMMUNICATION/team_00/TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md`

### E-02a — Line ~438: E2E test step

**Before:**
> `POST /api/runs/{id}/approve` without team_00 key | 403 + NOT_PRINCIPAL

**After:**
> `POST /api/runs/{id}/approve` without team_00 key | 403 + INSUFFICIENT_AUTHORITY

---

## E-03 — Team 21 Build Activation (Team 11 owned)

**File:** `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md`

### E-03a — Line ~95: AD-S8A-04 reference

**Before:**
> `PUT /api/ideas/{idea_id}` — update idea (AD-S8A-04 authorization) — §4.18

**After:**
> `PUT /api/ideas/{idea_id}` — update idea (AD-S8A-04 / AUTHORITY_MODEL v1.0.0 — INSUFFICIENT_AUTHORITY) — §4.18

---

## Application Instructions

1. **Team 00:** Apply E-01a, E-01b, E-01c to WP v1.0.3 and E-02a to Build Process Map v1.0.0
2. **Team 11:** Apply E-03a to Team 21 Build Activation v1.0.0

These are non-blocking errata — they do not change authorization behavior, only align error code naming with the locked directive.

---

**log_entry | TEAM_100 | ERRATA_ADDENDUM | AUTHORITY_MODEL_CASCADE | v1.0.0 | 2026-03-28**
