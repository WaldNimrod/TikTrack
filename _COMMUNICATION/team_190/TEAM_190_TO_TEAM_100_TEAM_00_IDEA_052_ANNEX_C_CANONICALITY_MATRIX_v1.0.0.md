---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_C_CANONICALITY_MATRIX_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: Canonicality matrix (DB vs Markdown) for migration decision---

# Annex C — Canonicality Matrix

| Information class | Proposed canonical source | Published mirror | Decision status |
|---|---|---|---|
| Runtime gate/phase/WP state | DB | JSON API + optional markdown snapshot | Proposed |
| Event history | DB append-only ledger | JSON export | Proposed |
| Team runtime assignments/overrides | DB | JSON view for UI | Proposed |
| Program/WP operational registry fields | DB | Markdown generated registry | Open (architect approval needed) |
| Constitutional directives/policies | Markdown in Git | DB index optional | Proposed |
| SSM/constitution narrative | Markdown in Git | DB metadata optional | Proposed |
| Idea lifecycle metadata | DB (or staged JSON wave 1) | Roadmap API view | Open |

## Canonicality rule draft

1. Operational mutable data => DB canonical.
2. Constitutional normative text => Markdown canonical.
3. Any mirrored representation must include provenance tag and generated timestamp.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_C | CANONICALITY_MATRIX_COMPLETE | v1.0.0 | 2026-03-22**
