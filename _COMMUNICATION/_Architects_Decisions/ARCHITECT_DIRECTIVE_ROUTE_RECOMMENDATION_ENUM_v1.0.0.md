---
id: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.0.0
historical_record: true
status: LOCKED
date: 2026-04-01
authority: Team 00 (Principal)
domain: agents_os
trigger: F-07 — team_190 revalidation TEAM_190_PIPELINE_QUALITY_PLAN_V3_REVIEW_v1.0.1.md
supersedes:
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md §10.3 route_recommendation value "full"
  - TEAM_00_TO_TEAM_100_STAGE8B_FEEDBACK_INGESTION_AND_EVENT_DRIVEN_MANDATE_v1.0.0.md §IL-2 route_recommendation value "full"---

# ARCHITECT_DIRECTIVE — Canonical `route_recommendation` Enum

## 1. Decision

**`route_recommendation` canonical values (AOS v3, all layers):**

| Value | Meaning | Routing target |
|-------|---------|----------------|
| `doc` | Fix in documentation / spec | Team 70 (TikTrack) or Team 170 (AOS) |
| `impl` | Fix in implementation | Teams 20/30/40/60 (execution) |
| `arch` | Architectural review required | Team 00 (Principal) |

**`full` is DEPRECATED** as of 2026-04-01.
- `full` was preliminary Stage 8B terminology — not precise enough.
- On **read**: normalize `full` → `impl` (display and logic).
- On **write** (new submissions): `full` MUST NOT be used. Validation: warn if received.
- Backward compat: no DB migration needed — column is `TEXT`, no CHECK constraint.

## 2. Rationale

`doc|full` was introduced in Stage 8B spec as a rough routing hint. `full` was semantically ambiguous
("full what?"). The quality pipeline requires precise routing:
- Documentation issues (spec gap, template error) → doc team
- Implementation bugs → execution teams
- Architectural ambiguity → Principal review

`doc|impl|arch` provides this precision. The values align with team authority boundaries.

## 3. Impact Map

| Artifact | Change required | Priority |
|----------|----------------|---------|
| `StructuredVerdictV1.route_recommendation` | Already `doc|impl|arch` in plan §A | N/A (plan is correct) |
| `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md §10.3` | Update `doc|full` → `doc|impl|arch` | Phase 3 (doc update) |
| `Stage8B mandate §IL-2` | Update annotation | Phase 3 (doc update) |
| `agents_os_v3/ui/app.js` dropdown | 3 options: `doc`, `impl`, `arch` | Phase 1 §B (wiring) |
| `agents_os_v3/modules/audit/ingestion.py` | Add normalization: `full` → `impl` on parse | Phase 1 §A |
| DB `pending_feedbacks.route_recommendation` | No migration — TEXT column, no CHECK | Not required |

## 4. Normalization Rule (implementation contract)

```python
# ingestion.py — apply after parsing route_recommendation from any source
_ROUTE_REC_NORMALISE = {"full": "impl"}
_ROUTE_REC_VALID = {"doc", "impl", "arch"}

def _normalise_route_rec(rr: str | None) -> str | None:
    if rr is None:
        return None
    normalised = _ROUTE_REC_NORMALISE.get(rr, rr)
    if normalised not in _ROUTE_REC_VALID:
        return None   # unknown value — discard, do not block pipeline
    return normalised
```

**Apply at:** every point in `ingestion.py` where `route_recommendation` is extracted from
JSON or regex — before storing in `IngestSource` and before INSERT into `pending_feedbacks`.

## 5. Validation

- `StructuredVerdictV1` Pydantic model: `Literal["doc", "impl", "arch"]` — rejects `full` at parse time.
- Ingestion Layer 2/3 regex: normalization applied before DB write.
- UI dropdown (§B wiring): renders 3 options only.

---

**log_entry | TEAM_00 | DIRECTIVE_ROUTE_RECOMMENDATION_ENUM | LOCKED | 2026-04-01**
