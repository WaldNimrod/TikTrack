---
id: TEAM_100_TO_TEAM_190_STAGE8A_UI_SPEC_AMENDMENT_REVIEW_REQUEST_v1.0.1
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Constitutional Architectural Validator)
date: 2026-03-26
type: REVIEW_REQUEST
priority: BLOCKING
correction_cycle: 1
subject: AOS v3 UI Spec Amendment (Stage 8A) — CC1 Re-validation Request---

# CC1 Review Request: AOS v3 UI Spec Amendment (Stage 8A)

## Artifact Under Review

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.1.md`
**Previous version:** v1.0.0 (FAIL — BLOCKER=1, MAJOR=3, MINOR=2)
**Review report:** `TEAM_190_AOS_V3_UI_SPEC_AMENDMENT_REVIEW_v1.0.0.md`

## Finding Closure Map

| Finding | Severity | Fix Applied | Section |
|---|---|---|---|
| **F-01** | BLOCKER | Date corrected: 2026-03-27 → 2026-03-26 in spec (v1.0.1 header) and original review request (v1.0.0). | Header |
| **F-02** | MAJOR | Added `NOT_PRINCIPAL` (403) to §4.18 error table. Locked whole-request rejection policy as AD-S8A-04. | §4.18, §12 |
| **F-03** | MAJOR | Replaced `MISSING_REASON` → `IDEA_TITLE_REQUIRED` in §4.17. Replaced `RUN_NOT_FOUND` → `IDEA_NOT_FOUND` in §4.18. New codes declared in §9 with explicit justification. | §4.17, §4.18, §9 |
| **F-04** | MAJOR | Added §8 — SSOT Anchoring. `Idea`/`WorkPackage` declared first-class entities (AD-S8A-06) requiring Entity Dict v2.0.3 + DDL v1.0.2. Team hierarchy fields declared `definition.yaml`-canonical, computed at API response time (AD-S8A-05). | §8, §4.13, §12 |
| **F-05** | MINOR | DDL tables rewritten with named constraints (`pk_`, `fk_`, `chk_`) and CHECK enum guards per DDL v1.0.1 style. | §10 |
| **F-06** | MINOR | Added `INVALID_HISTORY_PARAMS` (400) to §4.16 errors for offset < 0. | §4.16 |

## Spy Feedback Answers (from v1.0.0 review)

1. **Q: PUT /api/ideas unauthorized status transition — reject or partial?** → **Whole-request rejection** with NOT_PRINCIPAL (403). Locked as AD-S8A-04.
2. **Q: ideas/work_packages — first-class or tactical?** → **First-class SSOT entities**. Locked as AD-S8A-06. Require Entity Dict v2.0.3 + DDL v1.0.2.
3. **Q: Team hierarchy source?** → **`definition.yaml`-canonical**, computed at API response time. NOT in DB. Locked as AD-S8A-05.

## New Sections in v1.0.1

| Section | Content |
|---|---|
| §8 | SSOT Anchoring — entity status + hierarchy ownership |
| §9 | New Error Codes Registry — 3 new codes (IDEA_TITLE_REQUIRED, IDEA_NOT_FOUND, NOT_PRINCIPAL) |
| §12 | AD-S8A-04, AD-S8A-05, AD-S8A-06 added (total: 6 ADs) |

## Review Focus

1. All 6 findings closed — verify no regressions
2. New §8/§9 sections — SSOT anchoring correctness
3. AD-S8A-04/05/06 — scope and non-contradiction with base spec

---

**log_entry | TEAM_100 | STAGE8A_CC1_REVIEW_REQUEST | SUBMITTED | team_190 | 2026-03-26**
