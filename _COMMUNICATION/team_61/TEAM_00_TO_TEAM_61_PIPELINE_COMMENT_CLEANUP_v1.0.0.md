---
id: TEAM_00_TO_TEAM_61_PIPELINE_COMMENT_CLEANUP_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 61 (AOS Local Cursor Implementation)
date: 2026-03-17
status: ACTIVE
priority: P0 — required before GATE_8
scope: Single file, comment-only change
---

# Pre-GATE_8 Cleanup — pipeline.py Stale Comment

---

## Task

Remove dead comment referencing the abolished G5_DOC_FIX routing in `pipeline.py`.

**File:** `agents_os_v2/orchestrator/pipeline.py`

**Location:** Lines ~70–74 (in the FAIL_ROUTING documentation block)

**Current stale text (approximate):**
```python
#   GATE_5 "doc" → G5_DOC_FIX (Team 10 doc-fix sprint) → GATE_5
#   ⚠️  NEVER routes to CURSOR_IMPLEMENTATION — that activates impl teams.
#   ⚠️  NEVER routes to GATE_4 — that's a full QA re-run cycle.
```

This comment is **factually incorrect** — G5_DOC_FIX was abolished (WP004 C.1). The actual GATE_5 "doc" routing is now `CURSOR_IMPLEMENTATION` (line 108), which is the correct canonical behavior.

**Replace with:**
```python
#   GATE_5 "doc" → CURSOR_IMPLEMENTATION (direct to impl team — no separate gate state)
#   GATE_5 "full" → G3_PLAN
#   G5_DOC_FIX abolished in S002-P005-WP004.
```

---

## Deliverable

No separate completion report required. Confirm change in GATE_8 evidence checklist.

---

**log_entry | TEAM_00 | PIPELINE_COMMENT_CLEANUP | PRE_GATE8 | 2026-03-17**
