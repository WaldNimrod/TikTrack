---
id: TEAM_101_TO_TEAM_170_DRAFT_MANDATE_CANON_PRINCIPLES_v1.0.0
historical_record: true
from: Team 101 (draft for Team 100 issuance)
to: Team 170 (intended recipient after Team 100 sign-off)
date: 2026-03-26
status: DRAFT_FOR_TEAM_100_TO_ISSUE
note: Principal requested immediate alignment of principles in existing canonical docs; Team 100 should re-home under team_100/ if preferred and add authority line.---

# DRAFT — Mandate to Team 170: Canon alignment (Principal / Team 00 / v3)

## Objective

Align **existing canonical documents** that all agents load (not only Team 101 internals) with the **Principal / Team 00 model** and **AOS v3 spec continuity**, so implementation guidance is **uniform across teams**.

## Source of truth for content (do not re-litigate)

Summarized for merge in:

- `_COMMUNICATION/team_100/TEAM_101_TO_TEAM_100_AOS_V3_FEEDBACK_PRINCIPAL_MODEL_AND_SPEC_ALIGNMENT_v1.0.0.md` — **§2 Decisions D-01 … D-14**

Expanded reference:

- `_COMMUNICATION/team_101/TEAM_101_PRINCIPAL_TEAM_00_AND_COMMUNICATION_MODEL_v1.0.0.md`

## Issuance context (for Chief Architect)

Issue this mandate **when** you are ready to freeze **roster IDs + agent-facing SSOT** for the next v3 merge wave — see hub **§4.3**:  
`_COMMUNICATION/team_100/TEAM_101_TO_TEAM_100_AOS_V3_CONSOLIDATED_FEEDBACK_FOR_CHIEF_ARCHITECT_v1.1.0.md`

## Deliverables (Team 170)

1. **Patch `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`** (or issue **v1.0.1**) to **resolve Team 110 (proposed rename from 101) reporting line** vs AOS v3 handoff to Team 100 (hub §4.1 — recommend Option B + explicit text).  
2. **Patch `AGENTS.md`** (and `.cursorrules` if mirror) with a **short subsection**: one human operator = Team 00; no personal names in SSOT; Principal does not routinely author files / run routine tests.  
3. **Roster renumbering (hub §9):** migrate **101→110**, **102→111** in `TEAM_TAXONOMY`, `TEAMS_ROSTER`, and cross-references; **Team 100** remains Chief Architect only.  
4. **Parent/child squad pattern (hub §10):** document **shared + inherited + child override** for **all** x0/x1 pairs; tie to **4-layer context** injection rules.  
5. **Deprecate Team 10 as routine state mutator (hub §12):** audit and mark legacy text; pipeline owns orchestration.  
6. **Canonical name for Pipeline Fidelity Suite (hub §13):** pick one term; add one-paragraph definition to governance or ops index.  
7. **Optional:** one-page addendum under `documentation/docs-governance/01-FOUNDATIONS/` e.g. `PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` pointing to hub §2 (D-01–D-14).  
8. **Update `00_MASTER_INDEX.md`** entry if new canonical page is added.

## Non-goals

- Do **not** rewrite archived DM-005 / simulation logs.  
- Do **not** enumerate full HITL gate list (Principal deferred).

## Acceptance

Team 100 confirms **governance SSOT** reflects decisions; Team 101 notified for ER/spec cross-check only if contradictions appear.

---

**log_entry | TEAM_101 | DRAFT_MANDATE_TEAM_170 | CANON_PRINCIPLES | 2026-03-26**
