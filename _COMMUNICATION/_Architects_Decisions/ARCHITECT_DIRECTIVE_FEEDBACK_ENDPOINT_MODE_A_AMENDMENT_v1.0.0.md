---
id: ARCHITECT_DIRECTIVE_FEEDBACK_ENDPOINT_MODE_A_AMENDMENT_v1.0.0
historical_record: true
from: Team 00 (Nimrod — Principal)
date: 2026-04-01
status: LOCKED
supersedes: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md §10.1 Note + §10.6 (Mode A routing)
authority: team_00 constitutional decision---

# ARCHITECT DIRECTIVE — Feedback Endpoint: Mode A Amendment

## Decision

`POST /api/runs/{run_id}/feedback` is extended to support **all four detection modes**,
including `CANONICAL_AUTO` (Mode A).

The note in UI Spec Amendment v1.1.1 §10.1 reading:

> "Note: `CANONICAL_AUTO` is NOT triggered via this endpoint — it uses
> `POST /api/runs/{run_id}/advance` with `feedback_json` field (§10.6)."

**is hereby superseded by this directive.**

## New Contract

### POST /api/runs/{run_id}/feedback — all 4 modes

```
detection_mode: "CANONICAL_AUTO" | "OPERATOR_NOTIFY" | "NATIVE_FILE" | "RAW_PASTE"
```

When `detection_mode = "CANONICAL_AUTO"`, the body must include `structured_json`:

```json
{
  "detection_mode": "CANONICAL_AUTO",
  "structured_json": {
    "schema_version": "1",
    "verdict": "PASS" | "FAIL",
    "confidence": "HIGH" | "MEDIUM" | "LOW",
    "summary": "<string>",
    "blocking_findings": [
      { "id": "BF-001", "severity": "BLOCKER", "description": "...", "evidence": "..." }
    ],
    "route_recommendation": "doc" | "impl" | "arch" | null
  }
}
```

## Legacy Path Status

`POST /api/runs/{run_id}/advance` with `feedback_json` **remains valid** as a legacy path
and continues to function as implemented in `machine.py:396`. It is **not deprecated** —
only removed as the **canonical Layer 1 documentation path** for teams.

Going forward, teams receive only the `/feedback + CANONICAL_AUTO` path in
TRIGGER PROTOCOL sections of all templates and governance files.

## Rationale

Single endpoint for all 4 detection layers provides:
1. **Consistency** — one URL, one schema, one SSE event path (`feedback_ingested`)
2. **Observability** — all feedback flows through `pending_feedbacks` with uniform `detection_mode`
3. **Policy enforcement** — auto-advance policy (`auto_advance_on_high_confidence`) applies
   uniformly regardless of mode
4. **UI simplicity** — all feedback forms point to the same endpoint

## Implementation Chain (atomic set — must be done together)

The following files form an **atomic set** — partial implementation is a BLOCKER:

| File | Change |
|------|--------|
| `agents_os_v3/modules/definitions/models.py` | `FeedbackIngestBody`: add `CANONICAL_AUTO` to Literal; add `structured_json: Optional[dict]`; add validator |
| `agents_os_v3/modules/management/api.py` | `post_run_feedback`: route `CANONICAL_AUTO` with `structured_json` to `uc_15` |
| `agents_os_v3/modules/management/use_cases.py` | `uc_15_ingest_feedback`: add `structured_json: dict | None = None` parameter; pass to `IngestSource` |
| `agents_os_v3/db/migrations/001_aos_v3_fresh_schema_v1.0.2.sql` | **Already correct** — `pending_feedbacks.detection_mode` CHECK includes `'CANONICAL_AUTO'` |
| `agents_os_v3/modules/audit/ingestion.py` | `IngestSource`: **Already correct** — `structured_json: Optional[dict[str, Any]] = None` at line 30 |

DB and IngestSource require **no changes**. Only 3 Python files need updating.

## Authorisation

Approved by: Team 00 (Nimrod) — session 2026-04-01
Validated by: Team 190 audit (TEAM_190_PIPELINE_QUALITY_PLAN_V3_REVIEW_v1.0.0.md F-01)
Condition: UI Spec v1.1.1 §10.1 note is superseded; §10.6 `/advance+feedback_json` remains valid legacy

---

**log_entry | TEAM_00 | FEEDBACK_MODE_A_AMENDMENT | LOCKED | 2026-04-01**
