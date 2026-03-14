---
project_domain: TIKTRACK
id: TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.1.0
from: Team 10 (Execution Orchestrator)
to: Team 20, Team 30, Team 50
cc: Team 00, Team 90, Team 100, Team 170, Team 190
date: 2026-03-13
status: ACTIVE
gate_id: GATE_3
program_id: S001-P002
work_package_id: S001-P002-WP001
scope: Alerts Summary Widget — G3 Build Work Plan (G3_5 BLOCKER REMEDIATION)
authority_mode: TEAM_10_GATE_3_OWNER
supersedes: TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.0.0
g35_remediation: B-G35-001, B-G35-002, B-G35-003
g35_blocker_fixes: BLOCKER-1, BLOCKER-2
---

# Team 10 | S001-P002 WP001 — G3 Work Plan v1.1.0 (G3_5 Remediation)

## G3_5 Blocker Fixes Summary

| Blocker | Fix Applied |
|---------|-------------|
| **B-G35-001** | Canonical file paths added for Team 20 and Team 50 deliverables (§2.1, §2.3) |
| **B-G35-002** | Test contract expanded with exact run commands and binary PASS/FAIL criteria (§6) |
| **B-G35-003** | Team 30 acceptance criteria augmented with field contract, empty-state contract, error-state contract (§7.2) |
| **BLOCKER-1** | All credential refs changed from `admin/418141` → `TikTrackAdmin/4181` (§6.2) |
| **BLOCKER-2** | §6.4 explicit `curl` setup commands added to reset/create `triggered_unread` state before each check |

---

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
| **OUTPUT (canonical)** | `_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md` | Brief note with confirmed query params for Team 30 |

**No implementation.** Escalate immediately if API gap found.

**B-G35-001:** Canonical path for Team 20 deliverable is explicitly `_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md`.

---

### 2.2 Team 30 (Frontend — Primary Executor)

| Action | File | Purpose |
|--------|------|---------|
| **CREATE** | `ui/src/components/AlertsSummaryWidget.jsx` | New widget component |
| **MODIFY** | `ui/src/components/HomePage.jsx` | Replace mock active-alerts section with AlertsSummaryWidget |
| **REFERENCE** | `ui/src/views/data/alerts/alertsDataLoader.js` | Pattern for fetch + maskedLog |
| **REFERENCE** | `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md` | Use existing classes per Iron Rule |

**Key constraints:** collapsible-container, maskedLog, read-only. See §7.2 for full acceptance criteria including field/empty/error contracts.

---

### 2.3 Team 50 (QA)

| Action | File | Purpose |
|--------|------|---------|
| **OUTPUT (canonical)** | `_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md` | QA report with binary PASS/FAIL per scenario |

**B-G35-001:** Canonical path for Team 50 deliverable is explicitly `_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md`.

---

## 3. Execution Order with Dependencies

```
Step 1: Team 20 — API verification (BLOCKING for Team 30)
        ↓
Step 2: Team 30 — Widget implementation (depends on Step 1)
        ↓
Step 3: Team 50 — QA/FAV on D15.I (run commands in §6)
        ↓
Step 4: FAST_3 — Nimrod browser sign-off
```

---

## 4. API Contract (Pre-verified)

**Endpoint:** `GET /api/v1/alerts/`  
**Required params:** `trigger_status=triggered_unread&per_page=5&sort=triggered_at&order=desc`  
**Response:** `{ "data": [...], "total": N }`  
**Team 20:** Run live request, confirm params, document in `TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md`.

---

## 5. D15.I and D34 Reference

| Page | Path | Component |
|------|------|-----------|
| D15.I (Home) | `/` | `HomePage.jsx` |
| D34 (Alerts) | `/alerts.html` | `ui/src/views/data/alerts/` |

**D34 unread filter URL:** `/alerts.html?trigger_status=triggered_unread`

---

## 6. Test Contract — Run Commands and Binary PASS/FAIL

**B-G35-002:** Team 50 receives exact commands and binary criteria below.

### 6.1 Prerequisites

Backend and frontend must be running:
- Backend: `bash scripts/start-backend.sh` or `curl -s http://localhost:8082/health` → 200
- Frontend: `cd ui && npm run dev` → http://localhost:8080

### 6.2 API Tests — Run Commands

**Command (run from repo root):**
```bash
# Login and test widget-specific endpoint
BACKEND="http://localhost:8082"
TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

# Test 1: Unread filter + limit 5
curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BACKEND/api/v1/alerts?trigger_status=triggered_unread&per_page=5&sort=triggered_at&order=desc"

# Test 2: No token → 401
curl -s -o /dev/null -w "%{http_code}" "$BACKEND/api/v1/alerts?trigger_status=triggered_unread&per_page=5"
```

**Existing full API script:**
```bash
bash scripts/run-alerts-d34-qa-api.sh
```

### 6.3 Binary PASS/FAIL Criteria — API

| # | Scenario | Command / Check | PASS | FAIL |
|---|----------|-----------------|------|------|
| 1 | Unread filter | `curl ... ?trigger_status=triggered_unread&per_page=5&sort=triggered_at&order=desc` | HTTP 200, JSON with `data` array | HTTP ≠ 200 or malformed JSON |
| 2 | Auth required | `curl ... /alerts` (no Authorization header) | HTTP 401 | HTTP ≠ 401 |
| 3 | Pagination | Response `data` length | ≤ 5 items | > 5 items |

### 6.4 Setup — Reproducible State Reset (BLOCKER-2)

**Run these commands before each corresponding check.** Uses canonical credentials: `TikTrackAdmin` / `4181`.

**Obtain token (required for all setup commands):**
```bash
BACKEND="http://localhost:8082"
TOKEN=$(curl -s -X POST "$BACKEND/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
```

**Setup for Scenario 1 (Empty state — 0 triggered_unread):**
```bash
# Get all triggered_unread alert IDs and PATCH each to triggered_read
IDS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$BACKEND/api/v1/alerts?trigger_status=triggered_unread&per_page=100" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(' '.join(str(x['id']) for x in d.get('data',[])))")
for id in $IDS; do
  curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"trigger_status":"triggered_read"}' "$BACKEND/api/v1/alerts/$id" > /dev/null
done
```

**Setup for Scenario 2 (Non-empty state — ≥1 triggered_unread):**
```bash
# Get first alert ID and PATCH to triggered_unread (prerequisite: at least 1 alert exists)
ALERT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND/api/v1/alerts?per_page=1" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); arr=d.get('data',[]); print(arr[0]['id'] if arr else '')")
[ -n "$ALERT_ID" ] && curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"trigger_status":"triggered_unread"}' "$BACKEND/api/v1/alerts/$ALERT_ID" > /dev/null
```

*If no alerts exist, create one via D34 or run `bash scripts/run-alerts-d34-qa-api.sh` once to seed data.*

---

### 6.5 D15.I Manual / MCP Browser Tests — Binary PASS/FAIL

| # | Scenario | Steps | PASS | FAIL |
|---|----------|-------|------|------|
| 1 | Empty state | Run **Setup for Scenario 1** (§6.4); login as TikTrackAdmin/4181; load D15.I | Widget not rendered (no DOM for alerts summary) | Widget visible when 0 unread |
| 2 | Non-empty state | Run **Setup for Scenario 2** (§6.4); login as TikTrackAdmin/4181; load D15.I | Widget visible; badge shows integer count | Widget hidden or badge missing |
| 3 | Alert list content | Inspect list items | Each item shows ticker · condition · relative time | Missing any of the three |
| 4 | Item click | Click one alert item | Navigate to `/alerts.html` (D34) | No navigation or wrong target |
| 5 | Badge click | Click count badge | Navigate to `/alerts.html?trigger_status=triggered_unread` | No navigation or missing query |
| 6 | Layout integrity | Inspect D15.I | No overflow/overlap; collapsible toggle works | Layout broken |
| 7 | D34 regression | Load D34 standalone | D34 renders as before | D34 broken |

### 6.6 Team 50 Report Requirements

Team 50 must include in `TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md`:
- Per scenario: **PASS** or **FAIL**
- Exact command(s) run (or reference to script)
- Overall: **PASS** only if all scenarios PASS; otherwise **FAIL**

---

## 7. Acceptance Criteria per Deliverable

### 7.1 Team 20 (API Verification)

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Verified `trigger_status=triggered_unread` works | Documented in canonical path |
| 2 | Verified limit/sort params for widget | Documented |
| 3 | No implementation changes | Confirmed |

---

### 7.2 Team 30 (Widget) — B-G35-003 Remediation

#### Base Criteria

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

#### Field Contract (B-G35-003)

Widget **must** consume these fields from `GET /api/v1/alerts/` response items:

| API field | Widget usage | Fallback |
|-----------|--------------|----------|
| `ticker_symbol` | Ticker display (or `target_display_name` for non-ticker) | "—" |
| `condition_summary` or `condition_field` + `condition_operator` + `condition_value` | Condition label | "—" |
| `triggered_at` | Relative time (e.g. "2h ago") | "—" |
| `id` | Click target; D34 navigation | — |
| `trigger_status` | Filter source; expect `triggered_unread` | — |

#### Empty-State Contract (B-G35-003)

- When `total === 0` or `data.length === 0` for `trigger_status=triggered_unread`: widget **must not render** (return `null` or equivalent).
- No placeholder, no "0 alerts" message — **fully hidden**.

#### Error-State Contract (B-G35-003)

- **401 (Unauthorized):** Widget does not render (user not authenticated; HomePage shows Guest container).
- **500 / Network error / fetch failure:** Widget does not crash. Either (a) hidden, or (b) show no list, no count. Log via `maskedLog` only. No raw `console.error` with stack traces or tokens.

---

### 7.3 Team 50 (QA)

| # | Criterion | Pass |
|---|-----------|------|
| 1 | All scenarios in §6 executed with binary PASS/FAIL | Documented in canonical report |
| 2 | Overall QA result: PASS (all green) or FAIL | Binary |
| 3 | D34 regression: no breakage | ✓ |

---

## 8. Collapsible-Container Iron Rule

Use `index-section__header` + `index-section__body` with `openSections` toggle. Integrate within top section (`data-section="top"`). Replace mock `active-alerts` block with live AlertsSummaryWidget.

---

## 9. maskedLog Mandate

- Import: `import { maskedLog } from '../utils/maskedLog.js';`
- All `console.log`/`console.error` with API data or errors → `maskedLog(message, { safeFields })`.

---

## 10. Team 10 Next Action

1. Await Team 20 verification at `_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md`
2. Issue Team 30 mandate with this plan + Team 20 params
3. Upon Team 30 completion, hand off to Team 50 with §6 run commands
4. Upon Team 50 PASS in `_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md`, route to FAST_3

---

**log_entry | TEAM_10 | G3_PLAN | S001_P002_WP001 | v1.1.0_G35_REMEDIATION | 2026-03-13**
**log_entry | TEAM_10 | B-G35-001 | CANONICAL_PATHS_ADDED | 2026-03-13**
**log_entry | TEAM_10 | B-G35-002 | TEST_CONTRACT_RUN_COMMANDS_PASS_FAIL | 2026-03-13**
**log_entry | TEAM_10 | B-G35-003 | TEAM30_FIELD_EMPTY_ERROR_CONTRACTS | 2026-03-13**
**log_entry | TEAM_10 | BLOCKER-1 | CREDENTIALS_TIKTRACKADMIN_4181 | 2026-03-13**
**log_entry | TEAM_10 | BLOCKER-2 | SECTION_6.4_EXPLICIT_CURL_SETUP_COMMANDS | 2026-03-13**
