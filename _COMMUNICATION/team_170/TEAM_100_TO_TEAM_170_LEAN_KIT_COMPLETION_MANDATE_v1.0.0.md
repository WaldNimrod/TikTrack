---
historical_record: true
id: TEAM_100_TO_TEAM_170_LEAN_KIT_COMPLETION_MANDATE_v1.0.0
from: Team 100 (Architecture)
to: Team 170 (Documentation)
date: 2026-04-03
type: MANDATE
priority: MEDIUM
gate: GATE_3 (execution)
requires_validation: true
validator: Team 190
---

# Mandate: Lean Kit Completion — LOD Templates + lod_status Convention

## §1 — Authority

- `TEAM_170_LEAN_KIT_FUTURE_IMPROVEMENTS_v1.0.0.md` — source backlog items
- `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md` — canonical program registry
- Team 00 lod_status decision below (Item 1 — locked this mandate)

---

## §2 — Team 00 Decision: lod_status Convention (Item 1 resolved)

**Decision (locked 2026-04-03, Team 00):**

`lod_status` in `roadmap.yaml` reflects the **document type authored**, not the gate closure state.
`LOD500` means "a LOD500-level document has been written." Gate closure is tracked separately
via `current_lean_gate`.

**Rationale:** A document can be in DRAFT at LOD500 (authored but not yet validated). Conflating
authoring level with gate state would require the field to change at L-GATE_V, creating two
sources of truth for gate state.

**Fix required in example project:**

```yaml
lod_status: LOD500  # document type = LOD500 (as-built spec); gate closure tracked in current_lean_gate
```

Add this comment verbatim. No other change to the LOD500 value itself.

---

## §3 — Task A: Fix example project roadmap.yaml (Item 1)

**File:** `agents-os/lean-kit/examples/example-project/roadmap.yaml`

Find the WP002 block containing `lod_status: LOD500`. Add the clarifying comment on that line:

**Before:**
```yaml
    lod_status: LOD500
```

**After:**
```yaml
    lod_status: LOD500  # document type = LOD500 (as-built spec); gate closure tracked in current_lean_gate
```

Also add this note in the `roadmap.yaml` header comment block (if one exists) or prepend to file:

```yaml
# lod_status convention: reflects document level authored (LOD100–LOD500), NOT gate closure.
# Gate closure is tracked in current_lean_gate. A doc can be LOD500 while gate is still L-GATE_B.
```

---

## §4 — Task B: Add Iron Rule footer to all 5 LOD templates (Item 2)

**Files** (all in `agents-os/lean-kit/templates/`):
- `lod_template_100.md`
- `lod_template_200.md`
- `lod_template_300.md`
- `lod_template_400.md`
- `lod_template_500.md`

**For LOD400 and LOD500** — add this full block as the last section before the log entry footer:

```markdown
---

## Cross-Engine Validation — Iron Rule

Documents at LOD400+ require cross-engine validation at L-GATE_V.
**The validator engine MUST differ from the builder engine — IRON RULE.**
No exception. No waiver. See `gates/L-GATE_V_VALIDATE_AND_LOCK.md`.
```

**For LOD100, LOD200, LOD300** — add this condensed single-line reminder as the last line before
the log entry footer:

```markdown
> **Iron Rule:** L-GATE_V validation MUST use a different engine than the builder. See `gates/L-GATE_V_VALIDATE_AND_LOCK.md`.
```

**Placement:** always immediately before the `---` separator that precedes the `log_entry` line
at the bottom of each template. If no log entry section exists, append at end of file.

---

## §5 — Task C: Sync agents-os repo

After completing Tasks A and B, commit to `agents-os/lean-kit/` with commit message:

```
fix(lean-kit): lod_status convention comment + Iron Rule footer in all LOD templates

- roadmap.yaml: lod_status LOD500 clarifying comment (Team 00 decision 2026-04-03)
- roadmap.yaml: header convention note
- lod_template_100..500.md: Iron Rule footer added (verbatim in LOD400/500, condensed in 100/200/300)
Authority: TEAM_100_TO_TEAM_170_LEAN_KIT_COMPLETION_MANDATE_v1.0.0.md
```

Push to `agents-os` repo main branch.

---

## §6 — Self-QA before submission

- [ ] `roadmap.yaml` WP002 `lod_status: LOD500` line has clarifying comment
- [ ] `roadmap.yaml` header has convention note
- [ ] `lod_template_400.md` — full Iron Rule block present before log footer
- [ ] `lod_template_500.md` — full Iron Rule block present before log footer
- [ ] `lod_template_100.md` — condensed Iron Rule line present before log footer
- [ ] `lod_template_200.md` — condensed Iron Rule line present before log footer
- [ ] `lod_template_300.md` — condensed Iron Rule line present before log footer
- [ ] Commit pushed to `agents-os` main branch
- [ ] No new references to GATE_6/GATE_7/GATE_8 introduced
- [ ] No changes outside `agents-os/lean-kit/` scope

---

## §7 — Submission

Completion report:
```
_COMMUNICATION/_ARCHITECT_INBOX/TEAM_170_TO_TEAM_100_LEAN_KIT_COMPLETION_v1.0.0.md
```

Team 190 validation required: **YES** — spot-check (not full GATE_5 cycle).
Team 190 scope: verify all 5 templates modified, convention comment correct, no side effects.

---

*log_entry | TEAM_100 | MANDATE | TEAM_170 | LEAN_KIT_COMPLETION | ITEM1_ITEM2 | LOD_TEMPLATES_IRON_RULE | LOD_STATUS_CONVENTION | 2026-04-03*
