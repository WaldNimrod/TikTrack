---
id: TEAM_100_TO_TEAM_190_STAGE8B_REVIEW_REQUEST_v1.0.0
historical_record: true
type: REVIEW_REQUEST
stage: SPEC_STAGE_8B
status: PENDING_REVIEW
from: Team 100 (Chief System Architect)
to: Team 190 (Constitutional Architectural Validator)
date: 2026-03-27
correction_cycle: 0---

# Review Request — Stage 8B: UI Spec Amendment v1.1.0

## Submission

| Field | Value |
|---|---|
| **Artifact** | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md` |
| **Path** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md` |
| **Version** | v1.1.0 (CC0) |
| **Amends** | Module Map v1.0.1 + UI Spec Amendment v1.0.2 |
| **Stage** | 8B — Feedback Ingestion Pipeline + Event-Driven Architecture + Operator UX + Entity Amendments |
| **Author** | Team 100 |
| **Mandate** | `TEAM_100_ACTIVATION_PROMPT_STAGE8B_FEEDBACK_INGESTION_v1.0.0.md` (A119) |

## Scope Summary

Stage 8B extends AOS v3 with:

1. **Feedback Ingestion Pipeline (FIP):** 4 Detection Modes × 3 Ingestion Layers → canonical FeedbackRecord
2. **Operator Handoff UI (§6.1.D-F):** PREVIOUS + NEXT (6 states) + CLI COMMAND + Verdict/Reason Input forms + CORRECTION display
3. **SSE Stream (§6):** Server-Sent Events for real-time dashboard updates (4 SSE event types)
4. **API Additions (5 new):** POST /feedback, POST /feedback/clear, PUT /teams/engine, GET /events/stream, GET /work-packages/{wp_id}
5. **API Amendments (5):** POST /advance (notes→summary + feedback_json), GET /state (3 new fields + cli_command), POST /ideas (domain_id, idea_type), GET /ideas (filters), PUT /ideas (new fields)
6. **Stage 8A Entity Amendments (Team 00 additions):** Ideas domain_id + idea_type, WP detail modal, Portfolio gate organization (gate=milestone AD-S8B-11)
7. **DDL (2):** `pending_feedbacks` (new), `ideas` (amended with domain_id + idea_type)
8. **7 new error codes** (total: 49)
9. **2 new modules:** `audit/ingestion.py`, `audit/sse.py`
10. **11 architectural decisions** (AD-S8B-01..AD-S8B-11)
11. **UC-15 (FeedbackIngestion):** Formalized as new use case
12. **12 integration tests** (TC-15..TC-26)

## SSOT Basis (9 files read)

All 9 canonical SSOT files from the activation prompt Part D were read before writing:

| # | File | Key Data Used |
|---|---|---|
| D.1 | Module Map v1.0.1 | Directory structure, API §4.2/§4.3/§4.9/§4.10 contracts, TC-01..TC-14 |
| D.2 | UI Spec Amendment v1.0.2 | §6.1/§6.2/§6.4/§6.5 page specs, §4.12-§4.18 API endpoints, ideas/WP DDL |
| D.3 | Event Observability v1.0.2 | 15 event types, error codes 01-39, SSE absence confirmed |
| D.4 | State Machine v1.0.2 | T01-T12 transitions, 5 RunStatus values, PAUSED constraints |
| D.5 | Use Case Catalog v1.0.3 | UC-02/04/05 contracts, UC-14 as highest, OQ-S3-02 status |
| D.6 | Routing Spec v1.0.1 | resolve_actor() contract, PAUSED routing prohibition |
| D.7 | Prompt Arch Spec v1.0.2 | AD-S6-07 (token budget advisory), EC-04 |
| D.8 | Entity Dictionary v2.0.2 | events/runs/teams/domains field definitions |
| D.9 | v2 json_enforcer.py + pipeline.py | JSON block regex, BF-NN regex, verdict candidate logic |

## SSOT Corrections Documented

3 factual corrections vs activation prompt documented in §10.11:
1. `POST /fail` `reason` field = already required in Module Map v1.0.1 §4.3 (not a change)
2. `GET /history` `run_id` = already a query param in Module Map v1.0.1 §4.10 (UI field is new, not API param)
3. `POST /advance` `notes` → `summary` = confirmed amendment (Team 00 approved)

## Validation Scope

Team 190 should validate:

1. **SSOT fidelity:** All references to base spec sections match their content
2. **Zero TBD:** No deferred decisions or "implementation will decide" language
3. **Terminology (§1):** Consistent use of 8 canonical terms throughout
4. **API contract completeness:** All request/response fields typed, all error codes defined
5. **DDL validity:** SQL syntax, FK references, CHECK constraints
6. **AD consistency:** All 11 ADs referenced in the sections they lock
7. **Impact analysis (§15):** No cascading effects missed
8. **Test determinism:** All 12 test cases have explicit inputs/outputs without ambiguity
9. **Error code tally:** 49 total = 39 (Stage 7) + 3 (Stage 8A) + 7 (Stage 8B)
10. **Package integrity:** constitutional-package-linter on this request + the spec

---

**log_entry | TEAM_100 | STAGE8B_REVIEW_REQUEST | SUBMITTED | CC0 | 2026-03-27**
