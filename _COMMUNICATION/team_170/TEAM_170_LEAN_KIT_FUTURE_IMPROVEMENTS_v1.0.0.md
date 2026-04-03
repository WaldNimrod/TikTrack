---
id: TEAM_170_LEAN_KIT_FUTURE_IMPROVEMENTS_v1.0.0
from: Team 100 (Architecture)
to: Team 170 (Documentation)
date: 2026-04-02
type: BACKLOG_NOTICE
status: OPEN
source: TEAM_190_TO_TEAM_170_S003_P017_WP002_LEAN_KIT_VALIDATION_RESULT_v1.0.0.md — Spy Feedback §
priority: LOW (non-blocking; address at next lean-kit touch)
---

# Team 170 — Lean Kit Future Improvements Backlog

Two non-blocking observations raised by Team 190 during S003-P017-WP002 GATE_5 validation.
Both are clarity improvements, not constitutional defects. Address at the next scheduled lean-kit
content update (S004+).

---

## Item 1 — Example roadmap `lod_status` set ahead of gate state

**Source:** Team 190 Spy Note 1
**File:** `lean-kit/examples/example-project/roadmap.yaml:47`
**Observation:**
WP002 has `lod_status: LOD500` (as-built) while its recorded `current_lean_gate` is `L-GATE_B`
(build and QA in progress — not yet validated). This is not a constitutional breach, but can be
read as "the as-built was drafted before the gate was passed," which conflicts with the Lean Gate
Model's sequencing intent.

**Required fix:**
Add a one-line comment in `roadmap.yaml` on or near the `lod_status: LOD500` entry, e.g.:

```yaml
lod_status: LOD500  # LOD500 is a DRAFT until L-GATE_V PASS; status reflects document type, not gate closure
```

Or alternatively, change `lod_status` to `LOD500_DRAFT` and update the template to reflect
that LOD500 enters DRAFT state when authoring begins, then transitions to FINAL at L-GATE_V PASS.

**Decision:** Team 00 to confirm preferred convention before Team 170 implements.

---

## Item 2 — Cross-engine enforcement phrasing should be preserved verbatim across all templates

**Source:** Team 190 Spy Note 2
**Observation:**
The cross-engine validator Iron Rule is currently explicit and non-waivable in:
- `gates/L-GATE_V_VALIDATE_AND_LOCK.md`
- `team_roles/ROLE_VALIDATOR_AGENT.md`
- `config_templates/team_assignments.yaml.template`

Team 190 recommends keeping the same phrasing **verbatim** in all five LOD templates as well, so
that any team reading only a template file still sees the cross-engine constraint without needing
to navigate to the gate or role documents.

**Required fix:**
In each of the five LOD templates (`LOD100` through `LOD500`), add a short footer section:

```markdown
## Cross-engine validation note
Documents at LOD400+ require cross-engine validation at L-GATE_V.
**The validator engine MUST differ from the builder engine — IRON RULE.**
No exception. No waiver. See `gates/L-GATE_V_VALIDATE_AND_LOCK.md`.
```

LOD100 and LOD200 templates may use a condensed single-line reminder instead of the full block.

**No decision required** — this is a straightforward addition. Execute at next lean-kit touch.

---

## When to execute

These items are LOW priority. Trigger condition: next time Team 170 is activated for
a lean-kit content update (expected S004 or when first external project adopts Lean Kit).

At that time:
1. Resolve Item 1 convention decision with Team 00 before implementing
2. Implement Item 2 directly (no decision needed)
3. Commit to `agents-os/lean-kit/` and submit for Team 190 spot-check

---

*log_entry | TEAM_100 | LEAN_KIT_FUTURE_IMPROVEMENTS | BACKLOG_REGISTERED | SOURCE_TEAM190_SPY_NOTES | 2026-04-02*

historical_record: true
