# Mandates — S001-P002-WP001  ·  G3_6_MANDATES

**Spec:** D15.I — Alerts Widget: badge + list (N=5), hidden when 0; click item → D34; click badge → D34 filtered unread

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 20   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             📄 Team 30 reads coordination data from Team 20

  Phase 2:  Team 30   ← runs alone
             ↓  Phase 3 starts ONLY after Phase 2 completes

  Phase 3:  Team 50   ← runs alone

════════════════════════════════════════════════════════════

## Full Work Plan (reference)

Team 20: verify /api/v1/alerts/summary endpoint | Team 30: build AlertsSummaryWidget.jsx with count badge | Team 50: run full FAST_3 QA suite

────────────────────────────────────────────────────────────

## Team 20 — API Verification (Phase 1)

### Your Task

Team 20: verify /api/v1/alerts/summary endpoint

**Environment:** Cursor Composer

Verify all backend API endpoints required for this feature.
No code changes unless a critical blocker is found.
Document: endpoint paths, params, response shapes, auth requirements.

**Output — write to:**
`_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md`

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
- Output saved to: `_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md`

────────────────────────────────────────────────────────────

## Team 30 — Frontend Implementation (Phase 2)

⚠️  PREREQUISITE: **Team 20** must be COMPLETE before starting this mandate.

### Your Task

Team 30: build AlertsSummaryWidget.jsx with count badge

**Environment:** Cursor Composer + MCP browser tools

Implement the frontend feature per spec. After implementation, run MCP verification:
1. Navigate to the target page and login
2. `browser_snapshot` — verify new component renders
3. Test primary feature (badge/count/list as applicable)
4. Verify edge case: hidden/empty state when count is 0
5. Test all navigation flows (Click item/badge → correct page)
6. `cd ui && npx vite build` — must succeed


### Coordination Data — Team 20 API verification report

✅  Auto-loaded: `_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md`

```
# Team 20 | S001-P002-WP001 Alerts Summary Widget — API Verification

**project_domain:** TIKTRACK  
**id:** TEAM_20_S001_P002_WP001_ALERTS_WIDGET_API_VERIFICATION  
**from:** Team 20 (Backend)  
**ref:** S001-P002 WP001 Alerts Summary Widget on D15.I home dashboard  
**date:** 2026-03-12  
**historical_record:** true  
**status:** VERIFIED — No backend changes required  

---

## 1) Mandate Summary

- **Widget:** Alerts Summary — read-only, on D15.I home dashboard
- **Uses:** Existing GET /api/v1/alerts/ endpoint
- **Per-alert:** ticker symbol · condition label · triggered_at (relative time)
- **Features:** Triggered-unread count badge, list of N=5 most recent, fully hidden when 0
- **Constraints:** No new backend, no schema changes

---

## 2) Endpoints Verified

### 2.1 GET /api/v1/alerts/summary

| Item | Value |
|------|-------|
| **Path** | `/api/v1/alerts/summary` |
| **Auth** | Bearer token (required) |
| **Method** | GET |
| **Params** | None |

**Response shape:**
```json
{
  "total_alerts": 0,
  "active_alerts": 0,
  "new_alerts": 0,
  "triggered_alerts": 0
}
```

| Field | Type | Description |
|-------|------|-------------|
| total_alerts | int | Total alerts (all) |
| active_alerts | int | is_active=true |
| new_alerts | int | Created in last 10 days |
| triggered_alerts | int | is_triggered=true (all triggered) |

**Note:** Summary does NOT include `triggered_unread` count. Use list endpoint (below) with `trigger_status=triggered_unread` and read `total` for bad
```
_[… content truncated at 1500 chars]_


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

────────────────────────────────────────────────────────────

## Team 50 — QA (Phase 3)

⚠️  PREREQUISITE: **Team 30** must be COMPLETE before starting this mandate.

### Your Task

Team 50: run full FAST_3 QA suite

**Environment:** Cursor Composer + MCP browser tools

Run comprehensive QA on the completed implementation.
Team 20 API verification AND Team 30 implementation must both be complete first.

**Output — write to:**
`_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md`

### Acceptance
- All FAST_3 checks pass
- No regressions on adjacent pages
- QA report saved to: `_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md`
