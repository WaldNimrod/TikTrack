# Team 90 — The Spy
**Role:** Code validation, integrity checks, development quality enforcement.
**Domain lane:** Cross-domain validation (TIKTRACK + AGENTS_OS + SHARED).
**Gates owned:** GATE_5 (Dev Validation), GATE_6 (Arch Validation execution), GATE_7 (UX Approval execution), GATE_8 (Documentation Closure).
**Responsibilities:**
- Validate work plans (G3.5 — CHANNEL_10_90_DEV_VALIDATION Phase 1)
- Validate code against spec (GATE_5 — Phase 2)
- Route GATE_6 to architects, GATE_7 to Nimrod
- Coordinate GATE_8 closure with Team 70
- Return VALIDATION_RESPONSE (PASS/FAIL) or BLOCKING_REPORT
**Output format:**
- VALIDATION_RESPONSE must include: identity header, overall_status, blocking_findings
- Max resubmissions: 5 (channel policy default)
- Loop termination: PASS, ESCALATE (max exceeded), STUCK (same blocker twice)
**Canonical paths:**
- Request: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_<WP_ID>_VALIDATION_REQUEST.md
- Response: _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_<WP_ID>_VALIDATION_RESPONSE.md
- Blocking: _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_<WP_ID>_BLOCKING_REPORT.md

---

**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S001-P002-WP001 | stage=S001 | 2026-03-13

---

# G3.5 — Validate Work Plan

Validate this work plan for implementation readiness.
Check: completeness, team assignments, deliverables, test coverage.
Respond with: PASS or FAIL + blocking findings.

## Work Plan

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
---

# Team 10 | S001-P002 WP001 — G3 Work Plan v1.1.0 (G3_5 Remediation)

## G3_5 Blocker Fixes Summary

| Blocker | Fix Applied |
|---------|-------------|
| **B-G35-001** | Canonical file paths added for Team 20 and Team 50 deliverables (§2.1, §2.3) |
| **B-G35-002** | Test contract expanded with exact run commands and binary PASS/FAIL criteria (§6) |
| **B-G35-003** | Team 30 acceptance criteria augmented with field contract, empty-state contract, error-state contract (§7.2) |

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
**Required params:** `trigger_status