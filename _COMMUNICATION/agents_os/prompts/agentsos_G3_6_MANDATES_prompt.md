# Mandates — S003-P011-WP001  ·  G3_6_MANDATES

**Spec:** Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 20   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2
             📄 Team 30 reads coordination data from Team 20

  Phase 2:  Team 30   ← runs alone

════════════════════════════════════════════════════════════

## Full Work Plan (reference)

---
id: TEAM_11_S003_P011_WP001_WORKPLAN_v1.0.0
from: Team 11 (AOS Gateway)
to: Team 90 (review), Team 100 (arch sign-off)
date: 2026-03-19
gate: GATE_2 / Phase 2.2
process_variant: TRACK_FOCUSED
stage: S003
program: S003-P011
work_package: S003-P011-WP001
spec_source: TEAM_170_S003_P011_WP001_LLD400_v1.0.1
authority: ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0 + ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0
---

# Work Plan — S003-P011-WP001 | Process Architecture v2.0

## §1 Overview

This work plan implements Process Architecture v2.0 for the Agents_OS domain: the 5-gate canonical model, FCP classification, TRACK_FOCUSED routing, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, state schema migration from legacy GATE_0..GATE_8.

**Domain:** AGENTS_OS (TRACK_FOCUSED default)
**Implementor:** Team 61 (all 6 layers)
**QA:** Team 51
**Spec authority:** LLD400 v1.0.1 (Team 170) — validated GATE_1 PASS

---

## §2 Phase Sequence

| Phase | ID | Responsible | Description | Dependencies | Risk |
|-------|-----|-------------|-------------|--------------|------|
| **P1** | State schema + config | Team 61 | Add `current_phase`, `process_variant`, `finding_type`, `fcp_level`, `return_target_team`, `lod200_author_team`, `gate_state` to state schema. Create `team_engine_config.json` per LLD400 §2.3 schema (per-team object with engine + domain). | None | MEDIUM |
| **P2** | Migration script | Team 61 | Copy-first migration: backup all `pipeline_state_*.json`, apply legacy→canonical gate ID mapping per LLD400 §3.1 table. Preserve S003-P003-WP001 state (map G3_PLAN → GATE_3, current_phase="3.1"). Validate no data loss. | P1 | HIGH |
| **P3** | pipeline.py GATE_SEQUENCE + GATE_META | Team 61 | Replace `GATE_SEQUENCE` with 5-gate canonical. Refactor `GATE_META` to load team assignments from `team_engine_config.json`. Add Phase 2.2 (Team 11) and Phase 2.2v (Team 90) to GATE_2; remove `WAITING_GATE2_APPROVAL`; add `gate_state="HUMAN_PENDING"`. TRACK_FOCUSED routing: Phase 2.2 → Team 11, Phase 3.1 → Team 11. | P1 | HIGH |
| **P4** | KB-26 + KB-27 remediation | Team 61 | **KB-2026-03-19-26:** Correction-cycle prompt: when `last_blocking_gate == current_gate AND remediation_cycle_count > 0` → inject `last_blocking_findings` in prompt; `fail` command writes to `last_blocking_findings` / `last_blocking_gate`; `pass` preflight blocks if active BLOCK_FOR_FIX. **KB-2026-03-19-27:** Part of P3. | P3 | MEDIUM |
| **P5** | Prompt injection + FCP | Team 61 | Extend directive auto-injection to ALL gate prompts. Add FCP rules to relevant gate prompts. Each prompt states `process_variant` and routing. Add `finding_type` preflight for `fail`. | P3 | MEDIUM |
| **P6** | pipeline_run.sh preflight | Team 61 | Preflight: rejection → `finding_type` required; `process_variant` set and valid; team assignment matches gate+phase+variant; PWA scope check for Team 10. | P3 | LOW |
| **P7** | Dashboard (JS) | Team 61 | GateStatusPanel: `current_phase`, `process_variant` badge. FCPPanel: show when `finding_type === "unclear"`. TeamAssignmentPanel, EngineEditor, Lod200AuthorOverride per LLD400 §4.0 component tree. Read/write `team_engine_config.json`. | P1 | MEDIUM |
| **P8** | Governance + identity | Team 61 | Team 102 and Team 191 activation documents (registration). Retroactive Team 00 identity: "Chief Architect" → "System Designer". Team 11 activation prompt exists (done). | None | LOW |
| **P9** | QA validation | Team 51 | Full E2E per LLD400 §5 MCP scenarios. AC-01..AC-26 validation. Migration integrity check. | P1–P8 | — |

---

## §3 Migration Plan

### 3.1 Approach

1. **Copy-first:** Before any migration, copy `pipeline_state_agentsos.json`, `pipeline_state_tiktrack.json`, and any active WP state files to `_COMMUNICATION/agents_os/backups/` with timestamp.
2. **Migrate:** Script reads state, applies LLD400 §3.1 old→new mapping, writes new state with defaults for new fields.
3. **Validate:** Load migrated state; assert `gates_completed` preserved; assert S003-P003-WP001 has `current_gate="GATE_3"`, `current_phase="3.1"` (no data loss).

### 3.2 Rollback

If migration fails: restore from `_COMMUNICATION/agents_os/backups/{timestamp}/`. Pipeline continues on legacy state until fix applied.

### 3.3 Affected WPs

| WP | State File | Preservation |
|----|------------|--------------|
| S003-P011-WP001 | pipeline_state_agentsos.json | Migrated in-place; gates_completed, lld400_content, work_plan preserved |
| S003-P003-WP001 | pipeline_state_tiktrack.json (or WP-specific) | On HOLD; G3_PLAN → GATE_3, current_phase="3.1"; work_plan_content preserved |

---

## §4 Team Assignments (LOD200 §4 — 6 Layers)

| Layer | Scope | Owner | QA |
|-------|-------|-------|-----|
| **Layer 1 — Code** | pipeline.py GATE_SEQUENCE, GATE_META, routing, FCP | Team 61 | Team 51 |
| **Layer 2 — State Schema** | state.py new fields, migration script | Team 61 | Team 51 |
| **Layer 3 — Prompt Injection** | Gate prompt generators, directive scan | Team 61 | Team 51 |
| **Layer 4 — Preflight** | pipeline_run.sh checks | Team 61 | Team 51 |
| **Layer 5 — Dashboard** | agents_os/ui/js/*, pipeline-dashboard.js | Team 61 | Team 51 |
| **Layer 6 — Engine Config** | team_engine_config.json, CLI `--team-engine` | Team 61 | Team 51 |

**Confirmation:** Team 61 owns all 6 layers. Team 51 owns QA. No TikTrack teams (20/30/40/60) in scope.

---

## §5 Known Bug Remediation

### KB-2026-03-19-26 — Correction-cycle prompt not generated

| Task | Location | Description |
|------|----------|-------------|
| Correction detection | pipeline.py gate prompt generators | When `last_blocking_gate == current_gate AND remediation_cycle_count > 0` → emit correction prompt with `last_blocking_findings` injected |
| fail command | pipeline.py fail handler | Write rejection reason to `last_blocking_findings`, `last_blocking_gate` |
| pass preflight | pipeline.py pass handler | Block if `last_blocking_gate == current_gate` and `last_blocking_findings` non-empty (active BLOCK_FOR_FIX) |

### KB-2026-03-19-27 — GATE_2 skips Phase 2.2 + 2.2v

| Task | Location | Description |
|------|----------|-------------|
| GATE_META Phase 2.2 | pipeline.py GATE_META["GATE_2"] | Add Phase 2.2 (Team 11 work plan), Phase 2.2v (Team 90 review) before Phase 2.3 |
| Phase routing | pipeline.py | `current_phase` drives sub-prompt at GATE_2 |
| WAITING_GATE2_APPROVAL removal | pipeline.py | Remove from sequence; use `gate_state="HUMAN_PENDING"` where applicable |
| TRACK_FOCUSED Phase 2.2 | pipeline.py | Route Phase 2.2 → Team 11 (not Team 10) |

---

## §6 Success Criteria Mapping (LOD200 §7 → Phases)

| LOD200 # | Criterion | Delivered by |
|----------|-----------|--------------|
| 1 | pipeline_run.sh uses GATE_N nomenclature | P3 |
| 2 | pass advances gate per 5-gate model | P3 |
| 3 | Rejection finding_type=PWA routes to Team 10 (FCP-1) | P3, P5 |
| 4 | finding_type=unclear blocks; dashboard FCP panel | P5, P7 |
| 5 | AOS Phase 3.2 uses Team 61 | P3 |
| 6 | team_engine_config.json exists and loaded | P1, P3 |
| 7 | Dashboard shows current_phase, process_variant | P7 |
| 8 | WAITING_GATE2_APPROVAL, G3_PLAN, etc. removed | P3 |
| 9 | S003-P003-WP001 migrated to GATE_3 without loss | P2 |
| 10 | Teams 100/101/102/191 in team_engine_config.json | P1 |
| 11 | Team 11 in team_engine_config.json (AOS + Cursor Composer) | P1 |
| 12 | Phase 2.2 and 3.1 route to Team 11 (TRACK_FOCUSED) | P3 |

---

## §7 Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| State migration breaks active WPs | HIGH | Copy-first backup; validate before commit; rollback procedure |
| Gate ID rename breaks dashboard JS | MEDIUM | Update pipeline-state.js and all gate-ID references in same PR |
| Existing prompt files use old gate IDs | MEDIUM | Scan + replace; regenerate active prompts after migration |
| TRACK_FAST not implemented | LOW | Enum value registered; routing deferred |
| Team 190 independence contaminated | MEDIUM | Team 190 prompt never contains Team 100 conclusions (governance, not code) |

---

**log_entry | TEAM_11 | S003_P011_WP001_WORKPLAN | v1.0.0 | GATE2_PHASE22_DELIVERABLE | TRACK_FOCUSED | SUBMITTED_FOR_TEAM_90_REVIEW | 2026-03-19**


────────────────────────────────────────────────────────────

## Team 20 — API Verification (Phase 1)

### Your Task

Verify backend APIs required for: Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

**Environment:** Cursor Composer

Verify all backend API endpoints required for this feature.
No code changes unless a critical blocker is found.
Document: endpoint paths, params, response shapes, auth requirements.

**Output — write to:**
`_COMMUNICATION/team_20/TEAM_20_S003_P011_WP001_API_VERIFY_v1.0.0.md`

### Additional Context
### Backend Conventions
# Backend Conventions — TikTrack Phoenix

## Structure
- Models: `api/models/<entity>.py` — SQLAlchemy ORM with `Base` from `api/models/base.py`
- Schemas: `api/schemas/<entity>.py` — Pydantic BaseModel
- Services: `api/services/<entity>_service.py` — Business logic, singleton pattern
- Routers: `api/routers/<entity>.py` — FastAPI APIRouter

## Naming
- Table names: plural (users, trading_accounts, cash_flows)
- Schemas: `user_data.*` or `market_data.*`
- External IDs: ULID strings (`uuid_to_ulid()` / `ulid_to_uuid()` from `api/utils/identity`)
- Endpoints: underscore naming (`/trading_accounts`, `/cash_flows`)

## Types
- Money: `Decimal(20,8)` — NUMERIC(20,8) in DB
- Market cap: `Decimal(24,4)` — NUMERIC(24,4) in DB
- IDs: UUID internally, ULID externally
- Timestamps: TIMESTAMPTZ (timez

### Acceptance
- All required endpoints confirmed present and behaving as specified
- API params + response shapes documented
- No code changes (unless blocker found — document it)
- Output saved to: `_COMMUNICATION/team_20/TEAM_20_S003_P011_WP001_API_VERIFY_v1.0.0.md`

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Team 30 — Frontend Implementation (Phase 2)

⚠️  PREREQUISITE: **Team 20** must be COMPLETE before starting this mandate.

### Your Task

Implement frontend for: Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

**Environment:** Cursor Composer + MCP browser tools

Implement the frontend feature per spec. After implementation, run MCP verification:
1. Navigate to the target page and login
2. `browser_snapshot` — verify new component renders
3. Test primary feature (badge/count/list as applicable)
4. Verify edge case: hidden/empty state when count is 0
5. Test all navigation flows (Click item/badge → correct page)
6. `cd ui && npx vite build` — must succeed


### Coordination Data — Team 20 API verification report

⚠️  File not yet available. Searched (in order):
  - `_COMMUNICATION/team_20/TEAM_20_S003_P011_WP001_API_VERIFY_v1.0.0.md`
  - `_COMMUNICATION/team_20/TEAM_20_S003_P011_WP001_API_VERIFICATION_v1.0.0.md`

→ Complete the prerequisite team's work first.
→ Re-generate after: `./pipeline_run.sh` injects real data.


### Additional Context
### Frontend Conventions
# Frontend Conventions — TikTrack Phoenix

## Structure
- React SPA: `ui/src/App.jsx`, `ui/src/main.jsx`
- Hybrid HTML pages: `ui/src/views/<category>/<feature>/<feature>.html`
- JavaScript modules: `ui/src/views/<category>/<feature>/<feature>.js`
- Shared components: `ui/src/components/`
- Styles: `ui/src/styles/` (phoenix-base, phoenix-components)
- Cubes (table managers): `ui/src/cubes/`

## Routing
- routes.json: `ui/public/routes.json` — SSOT for all routes
- Vite plugin serves HTML pages directly (bypasses React Router)
- API proxy: `/api` → `http://localhost:8082`

## API Integration
- Axios for HTTP calls
- Base URL from `import.meta.env.VITE_API_BASE_URL`
- Auth via Bearer token in Authorization header

## CSS Rules (Iron Rule from .cursorrules)
1. First: default classes or no cla

### Acceptance
- All files listed in work plan created/modified
- collapsible-container Iron Rule applied
- maskedLog used for all console output
- Vite build passes (`cd ui && npx vite build`)
- All MCP browser verification steps pass
