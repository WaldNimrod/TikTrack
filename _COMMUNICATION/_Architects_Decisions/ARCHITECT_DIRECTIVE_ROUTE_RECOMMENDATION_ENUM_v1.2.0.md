---
id: ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0
historical_record: true
status: LOCKED — FINAL
date: 2026-04-01
authority: Team 00 (Principal)
domain: agents_os
supersedes:
  - ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.1.0.md
  - ARCHITECT_DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.0.0.md
  - TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md §10.3 route_recommendation value "full"
  - TEAM_00_TO_TEAM_100_STAGE8B_FEEDBACK_INGESTION_AND_EVENT_DRIVEN_MANDATE_v1.0.0.md §IL-2 route_recommendation value "full"
decisions_locked:
  B1: "Mode A rejects full with HTTP 422 (Pydantic Literal strict)"
  B2: "Case-insensitive normalization — rr.strip().lower() before lookup"
  B3: "Normalization at lines 332 + 360 only (no line 300)"---

# ARCHITECT_DIRECTIVE — Canonical `route_recommendation` Enum (FINAL)

## 1. Decision

**`route_recommendation` canonical values (AOS v3, all layers):**

| Value | Meaning | Routing target |
|-------|---------|----------------|
| `doc` | Fix in documentation / spec | Team 70 (TikTrack) or Team 170 (AOS) |
| `impl` | Fix in implementation | Teams 20/30/40/60 (execution) |
| `arch` | Architectural review required | Team 00 (Principal) |

**`full` is DEPRECATED** as of 2026-04-01:
- On **read** (Mode B/C/D text extraction): normalize `full` → `impl` via `_normalise_route_rec`.
- On **write** (Mode A — CANONICAL_AUTO): `StructuredVerdictV1` uses `Literal["doc","impl","arch"]` — Pydantic **rejects** `full` with HTTP 422. This is correct behavior. Mode A is a new contract; no backward-compat required.
- Backward compat: no DB migration needed — column is `TEXT`, no CHECK constraint.

## 2. Rationale

`doc|full` was introduced in Stage 8B spec as a rough routing hint. `full` was semantically ambiguous.
The quality pipeline requires precise routing aligned with team authority boundaries:
- Spec/template gap → doc team
- Code bug → execution teams
- Architectural ambiguity → Principal (Team 00)

Mode A (CANONICAL_AUTO) is a new protocol — no team has previously submitted with `"full"` — strict contract is both safe and correct.

## 3. Impact Map

| Artifact | Required change | Priority |
|----------|----------------|---------|
| `StructuredVerdictV1.route_recommendation` | `Literal["doc","impl","arch"]` — already correct | ✅ Done (plan §A) |
| `agents_os_v3/modules/audit/ingestion.py` | Add `_normalise_route_rec` at lines 332 + 360 | Phase 1 §A |
| `agents_os_v3/ui/app.js` Route dropdown | 3 options: `doc`, `impl`, `arch` | Phase 1 §B |
| `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md §10.3` | Update `doc\|full` → `doc\|impl\|arch` | Phase 3 (doc) |
| `Stage8B mandate §IL-2` | Update annotation | Phase 3 (doc) |
| DB `pending_feedbacks.route_recommendation` | No change — TEXT, no CHECK | Not required |

## 4. Normalization Rule (implementation contract — FINAL)

### 4.1 Function definition

```python
# ingestion.py — canonical implementation
_ROUTE_REC_NORMALISE: dict[str, str] = {"full": "impl"}
_ROUTE_REC_VALID: frozenset[str] = frozenset({"doc", "impl", "arch"})

def _normalise_route_rec(rr: str | None) -> str | None:
    """Normalise route_recommendation from legacy text sources (Mode B/C/D).

    Decision B1: Mode A (CANONICAL_AUTO) does NOT call this — Pydantic rejects
                 invalid values with HTTP 422 before ingestion.py is reached.
    Decision B2: Case-insensitive — strip + lowercase before lookup.
    Decision B3: Applied at lines 332 + 360 (_parse_chain returns) only.
    """
    if rr is None:
        return None
    rr = rr.strip().lower()                          # B2: case-insensitive
    normalised = _ROUTE_REC_NORMALISE.get(rr, rr)   # map "full" → "impl"
    return normalised if normalised in _ROUTE_REC_VALID else None
```

### 4.2 Application points (confirmed from code scan 2026-04-01)

| Line | Context | Apply? |
|------|---------|--------|
| 266 | OPERATOR_NOTIFY fallback — always `None` | ❌ Not needed |
| 300 | CANONICAL_AUTO return | ❌ Dead code (B1: Pydantic rejects `full` before this) |
| **332** | `_parse_chain` JSON_BLOCK **RETURN** | ✅ Required |
| **360** | `_parse_chain` REGEX_EXTRACT **RETURN** | ✅ Required |

```python
# Line 332 — _parse_chain JSON_BLOCK path
"route_recommendation": _normalise_route_rec(rr),

# Line 360 — _parse_chain REGEX_EXTRACT path
"route_recommendation": _normalise_route_rec(rr),
```

## 5. Validation Matrix

| Layer | Input `"full"` | Expected output | Status |
|-------|---------------|----------------|--------|
| Mode A CANONICAL_AUTO | `"full"` in structured_json | HTTP 422 (Pydantic) | ✅ LOCKED |
| Mode B/C/D JSON_BLOCK | `route_recommendation: "full"` | `"impl"` stored in DB | ✅ LOCKED |
| Mode B/C/D REGEX_EXTRACT | `route_recommendation: full` | `"impl"` stored in DB | ✅ LOCKED |
| Mode B/C/D any | `route_recommendation: FULL` | `"impl"` stored in DB (B2) | ✅ LOCKED |
| Mode B/C/D any | `route_recommendation: unknown` | `None` stored | ✅ LOCKED |
| UI dropdown (§B) | Renders `doc`, `impl`, `arch` only | No `full` option | ✅ LOCKED |

---

**log_entry | TEAM_00 | DIRECTIVE_ROUTE_RECOMMENDATION_ENUM_v1.2.0 | FINAL_LOCKED | 2026-04-01**
**log_entry | TEAM_00 | DECISIONS_B1+B2+B3 | LOCKED | 2026-04-01**
