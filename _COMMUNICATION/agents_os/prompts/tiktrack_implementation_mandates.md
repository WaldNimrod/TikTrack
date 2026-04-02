date: 2026-04-02
historical_record: true

⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

# Mandates — S003-P012-WP005-TT-FULL  ·  G3_6_MANDATES

**Spec:** WP005 TRACK_FULL simulation

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 20   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain tiktrack phase2
             📄 Team 30 reads coordination data from Team 20

  Phase 2:  Team 30   ← runs alone

════════════════════════════════════════════════════════════

## Domain roster excerpt (phase 3.1 mandates — WP002 KB-62)

| Team | Track role (TikTrack) |
|---|---|
| team_10 | Gateway |
| team_20 | Backend |
| team_30 | Frontend |
| team_40 | UI assets |
| team_50 | QA (GATE_4) |
| team_70 | Documentation closure |


## Full Work Plan (reference)

Team 20 | backend scope
Team 30 | frontend scope
Team 40 | assets

────────────────────────────────────────────────────────────

## Team 20 — API Verification (Phase 1)

### Your Task

Verify backend APIs required for: WP005 TRACK_FULL simulation

**Environment:** Cursor Composer

Verify all backend API endpoints required for this feature.
No code changes unless a critical blocker is found.
Document: endpoint paths, params, response shapes, auth requirements.

**Output — write to:**
`_COMMUNICATION/team_20/TEAM_20_S003_P012_WP005_TT_FULL_API_VERIFY_v1.0.0.md`

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
- Output saved to: `_COMMUNICATION/team_20/TEAM_20_S003_P012_WP005_TT_FULL_API_VERIFY_v1.0.0.md`

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 1) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 1 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase2
     (regenerates mandates with Phase 1 output → activates Phase 2)
────────────────────────────────────────────────────────────

## Team 30 — Frontend Implementation (Phase 2)

⚠️  PREREQUISITE: **Team 20** must be COMPLETE before starting this mandate.

### Your Task

Implement frontend for: WP005 TRACK_FULL simulation

**Environment:** Cursor Composer + MCP browser tools

Implement the frontend feature per spec. After implementation, run MCP verification:
1. Navigate to the target page and login
2. `browser_snapshot` — verify new component renders
3. Test primary feature (badge/count/list as applicable)
4. Verify edge case: hidden/empty state when count is 0
5. Test all navigation flows (Click item/badge → correct page)
6. `cd ui && npx vite build` — must succeed


**Output — write to:**
`_COMMUNICATION/team_30/TEAM_30_S003_P012_WP005_TT_FULL_IMPLEMENTATION_SUMMARY_v1.0.0.md`

### Coordination Data — Team 20 API verification report

⚠️  File not yet available. Searched (in order):
  - `_COMMUNICATION/team_20/TEAM_20_S003_P012_WP005_TT_FULL_API_VERIFY_v1.0.0.md`
  - `_COMMUNICATION/team_20/TEAM_20_S003_P012_WP005_TT_FULL_API_VERIFICATION_v1.0.0.md`

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
- Summary saved to: `_COMMUNICATION/team_30/TEAM_30_S003_P012_WP005_TT_FULL_IMPLEMENTATION_SUMMARY_v1.0.0.md`
