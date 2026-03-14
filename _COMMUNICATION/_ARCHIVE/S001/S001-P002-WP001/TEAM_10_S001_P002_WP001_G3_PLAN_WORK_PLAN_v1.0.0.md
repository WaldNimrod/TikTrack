---
project_domain: TIKTRACK
id: TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.0.0
from: Team 10 (Execution Orchestrator)
to: Team 20, Team 30, Team 50
cc: Team 00, Team 100, Team 170, Team 190
date: 2026-03-13
status: ACTIVE
gate_id: GATE_3
program_id: S001-P002
work_package_id: S001-P002-WP001
scope: Alerts Summary Widget — G3 Build Work Plan from Approved Spec
authority_mode: TEAM_10_GATE_3_OWNER
---

# Team 10 | S001-P002 WP001 — G3 Work Plan (Alerts Summary Widget)

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | S001-P002-WP001 |
| task_id | G3_PLAN |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S001 |

---

## 1. Approved Spec (Locked)

**S001-P002 WP001: Alerts Summary Widget on D15.I home dashboard.**

- Read-only frontend component.
- Triggered-unread count badge + list of N=5 most recent.
- Fully hidden when 0 unread.
- Uses existing `GET /api/v1/alerts/` endpoint.
- Per-alert: ticker symbol, condition label, triggered_at relative time.
- Click item → D34.
- Click badge → D34 filtered unread.
- **collapsible-container Iron Rule.**
- **maskedLog mandatory.**
- No new backend, no schema changes.

---

## 2. Files to Create/Modify per Team

### 2.1 Team 20 (Backend Verify Only)

| Action | File | Purpose |
|--------|------|---------|
| **READ / VERIFY** | `api/routers/alerts.py` | Confirm `trigger_status`, `per_page`, `sort`, `order` params |
| **READ / VERIFY** | `api/services/alerts_service.py` | Confirm list_alerts filters + sort by triggered_at |
| **OUTPUT** | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S001_P002_WP001_API_VERIFICATION_v1.0.0.md` | Brief note with confirmed query params for Team 30 |

**No implementation.** Escalate immediately if API gap found.

---

### 2.2 Team 30 (Frontend — Primary Executor)

| Action | File | Purpose |
|--------|------|---------|
| **CREATE** | `ui/src/components/AlertsSummaryWidget.jsx` | New widget component (or inline in HomePage if simpler) |
| **MODIFY** | `ui/src/components/HomePage.jsx` | Replace mock active-alerts section with live Alerts Summary Widget |
| **MODIFY** | `ui/src/utils/maskedLog.js` | No change — ensure import used for any new log statements |
| **OPTIONAL** | `ui/src/styles/D15_DASHBOARD_STYLES.css` | Only if widget needs new styles (prefer existing `index-section__*`, `active-alerts__*`, `widget-placeholder__*`) |
| **REFERENCE** | `ui/src/views/data/alerts/alertsDataLoader.js` | Pattern for fetch + maskedLog; API uses `response?.data` |
| **REFERENCE** | `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md` | Use existing classes per Iron Rule |

**Key constraints:**
- Widget renders only when authenticated (`isAuthenticated` in HomePage).
- Widget fully hidden when `trigger_status=triggered_unread` count = 0.
- collapsible-container = `index-section__header` + `index-section__body` + `openSections` toggle (existing pattern).
- maskedLog for all console output.

---

### 2.3 Team 50 (QA)

| Action | File | Purpose |
|--------|------|---------|
| **OUTPUT** | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S001_P002_WP001_QA_REPORT_v1.0.0.md` | QA PASS before FAST_3 |

---

## 3. Execution Order with Dependencies

```
Step 1: Team 20 — API verification (BLOCKING for Team 30)
        ↓
Step 2: Team 30 — Widget implementation (depends on Step 1)
        ↓
Step 3: Team 50 — QA/FAV on D15.I
        ↓
Step 4: FAST_3 — Nimrod browser sign-off
```

**Dependency rules:**
- Team 30 **must not start** until Team 20 confirms exact `GET /api/v1/alerts/` query params.
- Team 50 QA runs only after Team 30 completion report.

---

## 4. API Contract (Pre-verified from codebase)

**Endpoint:** `GET /api/v1/alerts/`

**Router params (api/routers/alerts.py):**
- `trigger_status`: `untriggered` | `triggered_unread` | `triggered_read` | `rearmed`
- `page`, `per_page` (default 25, max 100)
- `sort`, `order` (default `created_at` desc)

**Required for widget:**
- `trigger_status=triggered_unread`
- `per_page=5`
- `sort=triggered_at` (or equivalent — Team 20 must confirm if `triggered_at` is supported; otherwise `created_at` + triggered filter)

**Response:** `{ "data": [...], "total": N }` — items in `response.data`.

**Team 20 action:** Run live request, confirm `trigger_status=triggered_unread` + limit 5 + correct sort. Document in verification note.

---

## 5. D15.I and D34 Reference

| Page | Path | Component / File |
|------|------|------------------|
| D15.I (Home) | `/` | `HomePage.jsx` |
| D34 (Alerts) | `/alerts.html` | `ui/src/views/data/alerts/` |

**D34 filter for unread:** `trigger_status=triggered_unread` query param on D34 URL.
**D34 per-alert view:** D34 route with alert ID or scroll-to-alert (Team 30 may use query param e.g. `?alert_id=...` if D34 supports it).

---

## 6. MCP Test Scenarios

### 6.1 API Endpoint (Team 20 / automated)

| # | Scenario | Request | Expected |
|---|----------|---------|----------|
| 1 | Unread filter works | `GET /api/v1/alerts/?trigger_status=triggered_unread&per_page=5&sort=triggered_at&order=desc` | 200; `data` array; items have `trigger_status=triggered_unread` |
| 2 | Auth required | `GET /api/v1/alerts/` (no token) | 401 |
| 3 | Pagination | `per_page=5` | Max 5 items in `data` |

### 6.2 D15.I Page (Team 50 / MCP browser)

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Empty state | Login, 0 unread alerts | Widget fully hidden |
| 2 | Non-empty state | Login, ≥1 unread | Widget visible; badge shows count |
| 3 | Alert list | Non-empty | Up to 5 items; ticker · condition · relative time |
| 4 | Item click | Click alert item | Navigate to D34 |
| 5 | Badge click | Click count badge | Navigate to D34 with unread filter |
| 6 | Layout integrity | Inspect D15.I | No layout breakage; collapsible works |

### 6.3 D34 Page (Regression)

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Unchanged | Load D34 | Renders identically to baseline |
| 2 | Unread filter | Navigate with `?trigger_status=triggered_unread` | D34 shows filtered list (if supported) |

---

## 7. Acceptance Criteria per Deliverable

### 7.1 Team 20 (API Verification)

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Verified `trigger_status=triggered_unread` works | Documented |
| 2 | Verified limit/sort params for widget | Documented |
| 3 | No implementation changes — verify only | Confirmed |

### 7.2 Team 30 (Widget)

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Empty state → widget completely hidden | ✓ |
| 2 | Non-empty → badge + list (N≤5) | ✓ |
| 3 | Per-alert: ticker · condition · relative time | ✓ |
| 4 | Click item → D34 | ✓ |
| 5 | Click badge → D34 filtered unread | ✓ |
| 6 | collapsible-container pattern | ✓ |
| 7 | maskedLog for all logs | ✓ |
| 8 | Read-only — no writes | ✓ |

### 7.3 Team 50 (QA)

| # | Criterion | Pass |
|---|-----------|------|
| 1 | All 10 FAST_3 acceptance checks verified | ✓ |
| 2 | D34 regression: no breakage | ✓ |

---

## 8. Collapsible-Container Iron Rule

**Definition:** D15.I uses `index-section__header` + `index-section__body` with toggle state (`openSections`).

**Existing pattern in HomePage.jsx:**
- `index-section__header` — header with title + toggle button
- `index-section__body` — body shown when `openSections[sectionId]` is true
- `handleSectionToggle(sectionId)` — toggle handler

**Widget placement:** Integrate within top section (`data-section="top"`) or as a sibling section. Current mock uses `active-alerts` block — replace with live data, same structure.

---

## 9. maskedLog Mandate

- **Path:** `ui/src/utils/maskedLog.js`
- **Import:** `import { maskedLog } from '../utils/maskedLog.js';` (adjust path per file)
- **Usage:** All `console.log` / `console.error` with API data or errors must use `maskedLog(message, { safeFields })` — never raw `console` with tokens or sensitive data.

---

## 10. Team 10 Next Action

Upon Team 20 verification note receipt:
1. Issue Team 30 mandate with this plan + Team 20 params.
2. Upon Team 30 completion, hand off to Team 50 for QA.
3. Upon Team 50 PASS, route to FAST_3 (Nimrod browser sign-off).

---

**log_entry | TEAM_10 | G3_PLAN | S001_P002_WP001 | WORK_PLAN_CREATED | 2026-03-13**
