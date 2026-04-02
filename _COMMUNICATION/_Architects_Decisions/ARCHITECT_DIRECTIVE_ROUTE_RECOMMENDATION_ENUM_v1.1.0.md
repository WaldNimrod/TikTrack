---
id: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.1.0
historical_record: true
status: LOCKED — PENDING GROUP_2_DECISIONS (B1, B2, B3)
date: 2026-04-01
authority: Team 00 (Principal)
domain: agents_os
supersedes: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.0.0.md
trigger: F-07 — team_190 revalidation + ZD-03 corrections
pending_decisions:
  - B1: Mode A behavior for `full` (reject 422 vs accept+normalize)
  - B2: Case-insensitive normalization
  - B3: Normalization coverage (332+360 only vs also line 300)---

# ARCHITECT_DIRECTIVE — Canonical `route_recommendation` Enum (v1.1.0)

## 1. Decision

**`route_recommendation` canonical values (AOS v3, all layers):**

| Value | Meaning | Routing target |
|-------|---------|----------------|
| `doc` | Fix in documentation / spec | Team 70 (TikTrack) or Team 170 (AOS) |
| `impl` | Fix in implementation | Teams 20/30/40/60 (execution) |
| `arch` | Architectural review required | Team 00 (Principal) |

**`full` is DEPRECATED** as of 2026-04-01.
- `full` was preliminary Stage 8B terminology — not precise enough.
- On **read** (text extraction — Mode B/C/D): normalize `full` → `impl`.
- On **write** (Mode A structured input): behavior TBD — see Group 2 decision B1.
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
| `StructuredVerdictV1.route_recommendation` | `Literal["doc", "impl", "arch"]` — already in plan §A | N/A |
| `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md §10.3` | Update `doc\|full` → `doc\|impl\|arch` | Phase 3 (doc update) |
| `Stage8B mandate §IL-2` | Update annotation | Phase 3 (doc update) |
| `agents_os_v3/ui/app.js` dropdown | 3 options: `doc`, `impl`, `arch` | Phase 1 §B (wiring) |
| `agents_os_v3/modules/audit/ingestion.py` | Add `_normalise_route_rec` — see §4 | Phase 1 §A |
| DB `pending_feedbacks.route_recommendation` | No migration — TEXT column, no CHECK | Not required |

## 4. Normalization Rule (implementation contract)

### 4.1 — Function definition

```python
# ingestion.py
_ROUTE_REC_NORMALISE = {"full": "impl"}
_ROUTE_REC_VALID = {"doc", "impl", "arch"}

def _normalise_route_rec(rr: str | None) -> str | None:
    """Normalise route_recommendation value.
    Case sensitivity: TBD — see Group 2 decision B2.
    If B2 = YES: add `rr = rr.strip().lower()` before lookup.
    """
    if rr is None:
        return None
    normalised = _ROUTE_REC_NORMALISE.get(rr, rr)
    if normalised not in _ROUTE_REC_VALID:
        return None   # unknown value — discard, do not block pipeline
    return normalised
```

### 4.2 — Apply at (ZD-03 correction — confirmed from code scan 2026-04-01)

The plan (v3.4.0 §A) incorrectly listed lines ~253, ~266, ~300, ~319, ~351.
**Confirmed correct application points (ingestion.py):**

| Line | Context | `full` possible? | Apply normalization |
|------|---------|-----------------|---------------------|
| 266 | OPERATOR_NOTIFY fallback — always `None` | No | Not needed |
| 300 | CANONICAL_AUTO return | No (Pydantic validated) | TBD — see Group 2 B3 |
| **332** | `_parse_chain` JSON_BLOCK **RETURN** | **Yes** — legacy files | ✅ Required |
| **360** | `_parse_chain` REGEX_EXTRACT **RETURN** | **Yes** — legacy files | ✅ Required |

Minimum required: lines **332** and **360**.
Line 300 (CANONICAL_AUTO): redundant but harmless — decision per Group 2 B3.

## 5. Validation

| Layer | Behavior for `full` input | Pending? |
|-------|--------------------------|---------|
| Mode A (CANONICAL_AUTO) — Pydantic model | `Literal["doc","impl","arch"]` → HTTP 422 (current) | **B1** |
| Mode B/C/D — text extraction → `_parse_chain` | `_normalise_route_rec` at lines 332 + 360 | ✅ Decided |
| UI dropdown (§B wiring) | 3 options only: `doc`, `impl`, `arch` | ✅ Decided |

---

**log_entry | TEAM_00 | DIRECTIVE_ROUTE_RECOMMENDATION_ENUM | v1.1.0_CORRECTIONS | 2026-04-01**
**log_entry | TEAM_00 | ZD-03_CORRECTED (lines 332+360 confirmed) | 2026-04-01**
