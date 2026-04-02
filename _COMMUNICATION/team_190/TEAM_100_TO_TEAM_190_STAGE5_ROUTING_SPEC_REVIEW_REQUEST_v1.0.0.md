---
id: TEAM_100_TO_TEAM_190_STAGE5_ROUTING_SPEC_REVIEW_REQUEST_v1.0.0
historical_record: true
from: Team 100
to: Team 190
date: 2026-03-26
artifact: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md
artifact_path: _COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md
stage: SPEC_STAGE_5
focus_areas:
  - two-stage resolution correctness (routing_rules → role_id → assignments → team_id)
  - priority algorithm specificity ordering (domain > variant > phase > priority > id)
  - sentinel mechanism alignment with DEPRECATED status and L1 cutover
  - canonical SQL (§1.4) vs DDL v1.0.1 column alignment
  - paused_routing_snapshot_json schema alignment with UC-08 lock (UC Catalog v1.0.3)
  - test case coverage completeness (13 TCs, 8 ECs)
  - ROUTING_UNRESOLVED event + error code definition completeness
  - SSOT alignment corrections (top-level § corrections from activation prompt drafts)
verdict_format: PASS | CONDITIONAL_PASS (findings table) | FAIL---

# Review Request — Stage 5 Routing Spec

## Artifact Under Review

**`TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md`**

Location: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md`

## SSOT Basis

| Document | Version | Role |
|---|---|---|
| Entity Dictionary | v2.0.2 | Field names, entity relationships, resolver priority notes |
| DDL Spec | v1.0.1 | Column names, table schemas, index definitions |
| Use Case Catalog | v1.0.3 | UC-02 (AdvanceGate G02), UC-07/UC-08 (Pause/Resume), UC-09 (ManageRouting) |
| State Machine Spec | v1.0.2 | T07 (PAUSE snapshot), T08 (RESUME restore), A10C/A10D (FORCE_PAUSE/RESUME) |

## Key Design Decisions in This Spec

1. **Two-stage resolution model:** `routing_rules → role_id → assignments → team_id` — aligned with Dict §RoutingRule which removed `team_id` from routing_rules in v2.0.0 and introduced `role_id` + Assignment-based resolution.

2. **Legacy sentinel as Stage A (DEPRECATED):** The `resolve_from_state_key` mechanism is documented as a pre-resolution check (runs before standard matching). It returns `team_id` directly from a `runs` column, bypassing Assignment lookup. Subject to L1 cutover — must be NULL before PROD `aos-v3.0.0`.

3. **No `status` column on `routing_rules`:** DDL v1.0.1 does not include a status column. All present rows participate in routing. Soft-delete/deactivation deferred to UC-09 (ManageRouting) in Stage 8.

4. **ULID tie-breaker:** When priority is equal at the same specificity level, `rr.id ASC` (ULID order) provides deterministic resolution — earlier-created rule wins.

5. **SSOT corrections:** Five field name corrections from activation prompt drafts were documented in the spec's top-level section. These are not findings — they are alignment corrections per Iron Rule #2.

## Review Instructions

1. **Validate all field/column names** against Entity Dictionary v2.0.2 and DDL v1.0.1.
2. **Verify SQL correctness** — canonical queries (§1.4, §1.5) must be valid PostgreSQL 16+ and match the DDL table schemas.
3. **Check test case logic** — for each TC, verify the expected rank=1 result follows from the SQL ORDER BY logic and the test fixture data.
4. **Edge case completeness** — 8 ECs documented; identify any missing edge cases.
5. **Cross-reference UC Catalog** — ensure routing resolution described here matches UC-02 G02, UC-07 snapshot capture, UC-08 snapshot restore.
6. **Sentinel mechanism** — verify DEPRECATED handling is consistent with Dict §RoutingRule Lock L1 and cutover stages.

## Verdict

Team 190 should issue:
- **PASS** — if no BLOCKER or MAJOR findings
- **CONDITIONAL_PASS** — with findings table (severity + fix required)
- **FAIL** — if architectural misalignment or SSOT deviation found

---

**log_entry | TEAM_100 | STAGE5_ROUTING_SPEC_REVIEW_REQUEST | SUBMITTED | team_190 | 2026-03-26**
