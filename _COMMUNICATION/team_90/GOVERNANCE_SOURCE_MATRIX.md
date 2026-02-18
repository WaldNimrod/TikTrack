# GOVERNANCE_SOURCE_MATRIX

**id:** TEAM_90_GOVERNANCE_SOURCE_MATRIX_2026_02_16
**owner:** Team 90 (validation), Team 70 (knowledge execution), Team 10 (gateway approval)
**status:** POST-FIX — Canonical Master Index = 00_MASTER_INDEX.md (root); AD remediated (2026-02-18)
**scope:** governance source-of-truth mapping for Phoenix

---

## Source Matrix

| Document Class | Authority Source | Operational Owner | Validation Gate | Promotion Path | Archive Rule | Notes |
|---|---|---|---|---|---|---|
| Master Index (global) | `00_MASTER_INDEX.md` (שורש הפרויקט — repo root) | Team 70 / Team 170 (Librarian) | Team 90 Gate-B style governance validation | Team 70/170 prepares deltas -> Team 10 approves -> Team 90 validates -> Team 70/170 updates | Legacy index docs -> archive with deprecation note | Single global index authority — LOCKED 2026-02-18. Per TEAM_170_190_AUTHORITY_SEPARATION: index/SSOT corrections executed by Team 70 or Team 170. |
| Architect decisions | `_COMMUNICATION/_Architects_Decisions/` | Architect | Team 90 checks references point here | Architect directive -> Team 70 alignment package -> Team 10 approval -> Team 90 validation -> Team 70 updates references | Keep decision history, no team edits | Canonical template: `docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md`; authoring: `ARCHITECT_DECISION_TEMPLATE.md` |
| Governance foundations / templates | `docs-governance/00-FOUNDATIONS/` | Team 70 | Team 90 governance audit | Team 70 registers -> Team 10 approves -> Team 90 validates | Superseded templates archived | ADR template + metadata model; `sv` = system version (NOT doc schema) |
| Governance policies | `docs-governance/01-POLICIES` (target model) | Architect + Team 70 | Team 90 governance audit | Team 70 prepares policy deltas -> Team 10 approves -> Team 90 validates -> Team 70 updates | Superseded policy -> governance archive | Until migration, active policies are under `documentation/07-POLICIES`/`documentation/09-GOVERNANCE` |
| Procedures | `docs-governance/02-PROCEDURES` (target model) | Team 70 | Team 90 spot checks for authority links | Team 70 KP package -> Team 10 approves -> Team 90 validates -> Team 70 updates | Stage procedures archived post-consolidation | Must not override architect decisions |
| Workflow / gate protocols | `docs-governance/03-WORKFLOW` + `04-QA` (target model) | Team 70 + Team 50 | Team 90 gate audit | Team reports -> Team 70 consolidates -> Team 10 approves -> Team 90 validates -> Team 70 updates | Old protocol versions archived with replacement pointer | SOP-013 seal rule is mandatory closure gate |
| Development validation (Gate 4) | `_COMMUNICATION/team_90/` + canonical anchors | Team 90 | Team 10 + Architect oversight | Team 90 validates implementation readiness -> Team 10 routes closure | Validation outputs archived by stage | Dev-side validation only; no architectural constitutional sign-off |
| Architectural constitutional validation (Gate 5) | `_COMMUNICATION/team_190/` + `_COMMUNICATION/_Architects_Decisions/` | Team 190 (Validation Unit extension) | Team 90 + Architect | Team 90 packages evidence -> Team 190 validates spec/architecture -> Team 10 routes decision | Team 70 archives per stage | Team 190 is distinct from Team 90: spec completeness + architecture coherence only |
| **SOP-013 (Closure/Seal policy)** | **`_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`** | Architect | Team 90 reference drift check | Single canonical file; no separate policy file in active tree | Old file `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` archived | **Canonical location + file name LOCKED** — all refs must point here |
| Team role definitions | `docs-governance/05-ROLE_DEFINITIONS` (target model) | Architect + Team 70 | Team 90 territorial-integrity audit | Architect lock + Team 70 alignment -> Team 10 approves -> Team 90 validates -> Team 70 updates | Prior role docs archived with effective date | Must reflect direct reporting lines (e.g., Team 90, Team 70) |
| Governance contracts | `docs-governance/06-CONTRACTS` (target model) | Architect + Team 70 | Team 90 contract coherence check | Draft in communication -> Team 70 consolidation -> Team 10 approves -> Team 90 validates -> Team 70 updates | Contract revisions versioned, old versions archived | No contract is valid if only in communication |
| Versioning governance | `docs-governance/07-VERSIONING` (target model) | Architect + Team 70 | Team 90 version-ceiling compliance checks | Architect lock -> Team 70 rollout package -> Team 10 approves -> Team 90 validates -> Team 70 updates | Old matrices archived with effective date | Must match SV policy and matrix |
| Standards / playbooks | `docs-governance/08-STANDARDS` + `09-TEAM_PLAYBOOKS` (target model) | Team-specific owners + Team 70 | Team 90 integrity checks | Team draft -> Team 70 validation -> Team 10 approves -> Team 90 validates -> Team 70 updates | Superseded team playbooks archived by team folder | Team playbooks are not SSOT until promoted |
| System documentation | `docs-system/*` (target model) | Dev teams -> Team 70 | Team 90 for governance consistency only | Team outputs -> Team 70 KP package -> Team 10 approves -> Team 90 validates -> Team 70 updates | Stage outputs in communication archived after KP | Must reference correct authority anchors |
| Product / business documentation | `docs-system/product-business` (target model) | Team 70 | Team 90 consistency check + Team 10 gateway approval | Team 70 package -> Team 10 approves -> Team 90 validates -> Team 70 updates | Messaging drafts archived per stage | Business claims must trace to system/evidence docs |
| Communication layer | `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/` | All teams (territorial ownership) | Team 90 territorial enforcement | No direct promotion; input only | Stage-based archive mandatory after KP | Communication is not SSOT |

---

## Gaps / Open Items

1. `docs-system/` and `docs-governance/` folder model is target-state; current structure still mixed under `documentation/`.
2. Formal deprecation ledger file not yet created (required before migration).
3. Product/business taxonomy needs architect + Team 70 lock before migration start.
4. ~~Authority references to 90_Architects_comunication~~ — Remediated per GAP_CLOSURE; active docs point to _Architects_Decisions and 00_MASTER_INDEX.md (root).

---

## Validation Criteria (for adoption)

1. Every active governance/system doc references only the two authority anchors where relevant.
2. Any non-anchor source is explicitly marked communication or legacy.
3. Master index remains singular global index authority.
4. Team 70 category exists with clear promotion and validation path.

---

**log_entry | TEAM_90 | GOVERNANCE_SOURCE_MATRIX_DRAFT_COMPLETED | 2026-02-16**
