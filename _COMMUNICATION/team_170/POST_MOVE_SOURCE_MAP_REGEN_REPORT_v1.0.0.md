# POST_MOVE_SOURCE_MAP_REGEN_REPORT_v1.0.0

**project_domain:** SHARED  
**from:** Team 170  
**to:** Team 190  
**mandate:** TEAM_190_TO_TEAM_170_CROSS_DOMAIN_STRUCTURE_IMPLEMENTATION_MANDATE_v1.0.0  
**date:** 2026-02-22

---

## 1. Post-move state of source map / index

- **Gateway index path:** `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md`
- **Source map path:** `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md`

Both files were **moved** (with their folder) from `documentation/docs-governance/PHOENIX_CANONICAL/00-INDEX/` to `documentation/docs-governance/00-INDEX/`. **No content edits** were performed (Stage 1+2 constraint).

---

## 2. Stale path references (expected)

Inside the index and source map (and elsewhere in the repo), many references still use the **old** path prefix:

- `documentation/docs-governance/PHOENIX_CANONICAL/…`

**New** canonical prefix (after moves):

- `documentation/docs-governance/00-INDEX/…`
- `documentation/docs-governance/01-FOUNDATIONS/…`
- … (other buckets at same level as `00-INDEX`)

So:

- **Relative links** from `00-INDEX/` to `../01-FOUNDATIONS/`, `../02-POLICIES/`, etc. **resolve correctly** (siblings under `docs-governance`).
- **Text and absolute path references** that still mention `PHOENIX_CANONICAL` are **stale** and require a **content update** (regen) in a later stage.

---

## 3. Regen scope (Stage 3 or post–Stage 1+2)

Recommended follow-up (content edits, **not** Stage 1+2):

1. **GOVERNANCE_PROCEDURES_INDEX.md:** Update any narrative/canonical root path from `PHOENIX_CANONICAL` to `documentation/docs-governance/` (and remove `PHOENIX_CANONICAL` from the path).
2. **GOVERNANCE_PROCEDURES_SOURCE_MAP.md:** Replace all path entries that contain `PHOENIX_CANONICAL` with the new bucket paths under `documentation/docs-governance/`.
3. **Other artifacts:** Systematically find and update references to `PHOENIX_CANONICAL` or legacy governance paths in `documentation/`, `agents_os/`, and (as needed) `_COMMUNICATION/` to point to the new governance root and buckets.

---

## 4. Blocker / risk

- **No blocker for Stage 1+2 PASS:** Structure is unified; gateway is root-level; moves are logged. Stale in-file paths do not block the mandate’s move-only or discovery criteria.
- **Risk:** Teams that search by string for `PHOENIX_CANONICAL` may assume old paths are still valid. Mitigation: treat `documentation/docs-governance/00-INDEX/` and the bucket list in ROOT_GATEWAY_INDEX_PLACEMENT_REPORT as the source of truth until regen is done.

---

**log_entry | TEAM_170 | POST_MOVE_SOURCE_MAP_REGEN_REPORT | v1.0.0 | 2026-02-22**
