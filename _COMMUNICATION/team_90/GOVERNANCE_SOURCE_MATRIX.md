# GOVERNANCE_SOURCE_MATRIX

**id:** TEAM_90_GOVERNANCE_SOURCE_MATRIX_2026_02_16
**owner:** Team 90 (validation), Team 10 (operational adoption)
**status:** DRAFT FOR APPROVAL
**scope:** governance source-of-truth mapping for Phoenix

---

## Source Matrix

| Document Class | Authority Source | Operational Owner | Validation Gate | Promotion Path | Archive Rule | Notes |
|---|---|---|---|---|---|---|
| Master Index (global) | `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/00-MANAGEMENT/00_MASTER_INDEX.md` | Team 10 | Team 90 Gate-B style governance validation | Team 10 updates after approved inputs | Legacy index docs -> archive with deprecation note | Single global index authority |
| Architect decisions | `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/_Architects_Decisions/` | Architect | Team 90 checks references point here | Architect directive, then Team 10 aligns docs | Keep decision history, no team edits | `_COMMUNICATION/90_Architects_comunication/` is communication only |
| Governance policies | `docs-governance/01-POLICIES` (target model) | Architect + Team 10 | Team 90 governance audit | Architect-approved text promoted by Team 10 | Superseded policy -> governance archive | Until migration, active policies are under `documentation/07-POLICIES`/`documentation/09-GOVERNANCE` |
| Procedures | `docs-governance/02-PROCEDURES` (target model) | Team 10 | Team 90 spot checks for authority links | Team 10 promotion via KP process | Stage procedures archived post-consolidation | Must not override architect decisions |
| Workflow / gate protocols | `docs-governance/03-WORKFLOW` + `04-QA` (target model) | Team 10 + Team 50 | Team 90 gate audit | Team reports -> Team 10 -> Team 90 validation | Old protocol versions archived with replacement pointer | SOP-013 seal rule is mandatory closure gate |
| Team role definitions | `docs-governance/05-ROLE_DEFINITIONS` (target model) | Architect + Team 10 | Team 90 territorial-integrity audit | Architect lock + Team 10 publication | Prior role docs archived with effective date | Must reflect direct reporting lines (e.g., Team 90, Team 70) |
| Governance contracts | `docs-governance/06-CONTRACTS` (target model) | Architect + Team 10 | Team 90 contract coherence check | Draft in communication -> approved -> promoted | Contract revisions versioned, old versions archived | No contract is valid if only in communication |
| Versioning governance | `docs-governance/07-VERSIONING` (target model) | Architect + Team 10 | Team 90 version-ceiling compliance checks | Architect lock -> Team 10 rollout | Old matrices archived with effective date | Must match SV policy and matrix |
| Standards / playbooks | `docs-governance/08-STANDARDS` + `09-TEAM_PLAYBOOKS` (target model) | Team-specific owners + Team 10 | Team 90 integrity checks | Team draft -> Team 10 validation -> publish | Superseded team playbooks archived by team folder | Team playbooks are not SSOT until promoted |
| System documentation | `docs-system/*` (target model) | Dev teams -> Team 10 | Team 90 for governance consistency only | Team outputs -> Team 10 KP -> SSOT | Stage outputs in communication archived after KP | Must reference correct authority anchors |
| Product / business documentation | `docs-system/product-business` (target model) | Team 70 | Team 90 consistency check + Team 10 validation | Team 70 package -> Team 10 validate -> publish | Messaging drafts archived per stage | Business claims must trace to system/evidence docs |
| Communication layer | `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/` | All teams (territorial ownership) | Team 90 territorial enforcement | No direct promotion; input only | Stage-based archive mandatory after KP | Communication is not SSOT |

---

## Gaps / Open Items

1. `docs-system/` and `docs-governance/` folder model is target-state; current structure still mixed under `documentation/`.
2. Formal deprecation ledger file not yet created (required before migration).
3. Product/business taxonomy needs architect + Team 70 lock before migration start.
4. Authority references to `_COMMUNICATION/90_Architects_comunication/` still exist in active docs and must be remediated.

---

## Validation Criteria (for adoption)

1. Every active governance/system doc references only the two authority anchors where relevant.
2. Any non-anchor source is explicitly marked communication or legacy.
3. Master index remains singular global index authority.
4. Team 70 category exists with clear promotion and validation path.

---

**log_entry | TEAM_90 | GOVERNANCE_SOURCE_MATRIX_DRAFT_COMPLETED | 2026-02-16**
