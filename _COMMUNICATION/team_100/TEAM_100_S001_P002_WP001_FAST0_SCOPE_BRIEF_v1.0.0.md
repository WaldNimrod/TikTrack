---
**project_domain:** AGENTS_OS
**id:** TEAM_100_S001_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 61 (Executor — FAST_2), Team 190 (Validator — FAST_1), Team 51 (QA — FAST_2.5), Team 170 (Closure — FAST_4)
**cc:** Team 00, Team 10
**date:** 2026-03-10
**status:** ACTIVE — FAST_0 OUTPUT; FAST_1 TRIGGERED
**in_response_to:** TEAM_00_S001_P002_FAST_TRACK_ACTIVATION_DECISION_v1.0.0
**protocol:** FAST_TRACK_EXECUTION_PROTOCOL_v1.1.0 §6.2 (AGENTS_OS sequence)
historical_record: true
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | WP001 (single WP — full feature delivery) |
| task_id | N/A |
| gate_id | FAST_0 → FAST_1 |
| phase_owner | Team 100 |
| project_domain | AGENTS_OS |

---

# S001-P002 WP001 — FAST_0 SCOPE BRIEF
## Alerts Summary Widget (D15.I) via agents_os_v2 Fast Track

---

## §1 Strategic Purpose

S001-P002 answers one architectural question: **does the agents_os_v2 fast track pipeline work end-to-end on a real TikTrack product feature?**

WP001 (S002-P002) built and validated agents_os_v2 as infrastructure. S001-P002-WP001 is **the first real feature run through it** — from FAST_0 scope brief through implementation, QA, and Nimrod browser sign-off.

**This is the proof.** If WP001 completes at FAST_4, agents_os_v2 is production-proven as a delivery platform, not just a tested pipeline.

**Secondary benefit:** The Alerts Summary Widget is a real TikTrack product feature that ships live when the POC succeeds. No throwaway work.

---

## §2 Execution Mechanism

This WP runs via **agents_os_v2 Fast Track (FAST_TRACK_EXECUTION_PROTOCOL_v1.1.0 §6.2).**

The old LOD200 concept (archived at `_COMMUNICATION/99-ARCHIVE/2026-02-26_pre_gate3_cleanup/team_100/S001_P002_ALERTS_POC_LOD200_CONCEPT_v1.0.0.md`) described an agents_os_v1 execution model (validation_runner, Teams 20/30/50). **That execution mechanism is superseded.** The behavioral specification from that document is preserved verbatim — only the delivery mechanism changes.

| Preserved from old LOD200 | Superseded |
|---|---|
| ✅ Behavioral spec: what the widget does | ❌ Execution: validation_runner → agents_os_v2 fast track |
| ✅ Placement: D15.I only (Option A) | ❌ Team assignments: Teams 20/30/50 → Teams 61/51 |
| ✅ Scope: no new backend, no D34 changes | ❌ Two-WP structure → single WP |
| ✅ Acceptance: Nimrod browser sign-off | ❌ 44-spec-check/11-exec-check gate model |

Authority: `TEAM_00_S001_P002_FAST_TRACK_ACTIVATION_DECISION_v1.0.0`

---

## §3 FAST Stage Assignments

| Stage | Action | Owner |
|---|---|---|
| **FAST_0** | This scope brief | **Team 100** ✅ |
| **FAST_1** | Constitutional validation of scope brief | **Team 190** ← triggered now |
| **FAST_2** | Implementation (Alerts widget on D15.I) | **Team 61** (Cursor, local) |
| **FAST_2.5** | QA — pytest, mypy, quality scans; QA report | **Team 51** (mandatory — blocks FAST_3) |
| **FAST_3** | Nimrod browser sign-off (real browser — product UI feature) | **Nimrod** |
| **FAST_4** | Knowledge promotion + closure | **Team 170** |

---

## §4 Feature Spec — Complete Behavioral Specification

### 4.1 Feature Identity

| Field | Value |
|---|---|
| Feature name | Alerts Summary Widget |
| Type | Read-only frontend component |
| Target page | D15.I — Home Dashboard only (Option A, confirmed) |
| Backend requirement | None — consumes existing API (no new routes) |
| Schema changes | None — no migrations |
| D34 changes | None — D34 is untouched |

### 4.2 Behavioral Specification

| Behavior | Spec |
|---|---|
| **Empty state** | Widget is fully hidden / collapsed when `trigger_status=triggered_unread` count = 0 |
| **Non-empty state** | Widget is visible; shows unread count badge + list of N most recent unread alerts |
| **Count badge** | Prominent integer count of triggered-unread alerts (e.g. "3 unread alerts") |
| **Alert list** | Up to N = 5 most recent triggered-unread alerts, ordered by `triggered_at DESC` |
| **Per-alert display** | Ticker symbol · Condition label · `triggered_at` (relative time, e.g. "2h ago") |
| **Alert item click** | Navigates to D34 (Alerts page) with that alert in view |
| **Count badge click** | Navigates to D34 filtered to triggered-unread alerts |
| **Read state** | Widget refreshes on page load only — no live polling in MVP |
| **No interaction** | Widget does NOT mark alerts as read; read state is managed on D34 exclusively |

### 4.3 API Contract (Existing — No New Backend)

| Endpoint | Usage | Filter |
|---|---|---|
| `GET /api/v1/alerts/` | Fetch triggered-unread count + recent list | `trigger_status=triggered_unread&limit=5` (or equivalent — Team 61 confirms exact param from D34 API contract before implementing) |

**Constraint:** Team 61 must verify exact query parameter names from the existing D34 API implementation before building the widget. No new backend routes or schema changes under any circumstances.

### 4.4 Frontend Implementation Constraints

| Constraint | Rule |
|---|---|
| Read-only component | D34 is the write/manage surface; widget only reads and links |
| Page load refresh | No polling; MVP scope |
| No new CSS framework | Use existing TikTrack styles and component patterns |
| Responsive | Standard desktop viewport (D15.I main content area) |
| Page template | D15.I uses collapsible-container template — Iron Rule; widget integrates within existing page structure |

---

## §5 Scope Boundaries

### 5.1 In Scope

| Item | Reason |
|---|---|
| Alerts Summary Widget component on D15.I | Core POC deliverable |
| Consuming existing GET /api/v1/alerts/ endpoint | Read-only frontend |
| FAST_2.5 QA: pytest (if applicable), mypy, quality scans | Mandatory per protocol |
| FAST_3 browser: Nimrod reviews D15.I with widget live | Product UI sign-off |

### 5.2 Out of Scope — Hard Boundaries

| Item | Ruling |
|---|---|
| D34 Alerts page changes | NONE — D34 is untouched |
| New backend API routes | NONE — existing endpoints only |
| Database schema changes / migrations | NONE |
| Option B header integration (multi-page widget) | Deferred post-POC |
| Marking alerts as read from widget | D34 responsibility |
| Live polling / WebSocket | Post-MVP; not in POC |
| New Agents_OS checks | S003 program |

---

## §6 Applicable Iron Rules

The following Iron Rules apply to this WP:

| Rule | Application |
|---|---|
| **collapsible-container template** | D15.I uses this template; widget must integrate within it (not break layout) |
| **maskedLog mandatory** | Any JS console logging in widget must use maskedLog |
| **No per-entity rich text customization** | Alert display uses existing text patterns; no custom rich text |
| **NUMERIC(20,8) for financial transactions** | Not applicable here (no financial data in widget) |

---

## §7 FAST_3 Acceptance Criteria (Nimrod Browser Sign-Off)

Nimrod will perform a browser review of D15.I with the widget implemented. PASS requires ALL of the following:

| # | Check | Pass Criteria |
|---|---|---|
| 1 | Home dashboard loads | D15.I renders without errors |
| 2 | Empty state | When 0 triggered-unread alerts exist: widget section is completely invisible / collapsed |
| 3 | Non-empty state | When ≥1 triggered-unread alert exists: widget is visible |
| 4 | Count badge | Integer count is displayed prominently (e.g. "3 unread alerts") |
| 5 | Alert list | Up to 5 alerts shown, most recent first |
| 6 | Per-alert display | Each item shows: Ticker · Condition · relative time |
| 7 | Alert item click | Clicking any alert navigates to D34 with correct alert context |
| 8 | Count badge click | Clicking count badge navigates to D34 filtered to unread |
| 9 | Layout integrity | Widget integrates cleanly within D15.I collapsible-container layout; no visual breakage |
| 10 | No D34 changes | D34 page renders identically to GATE_7 PASS state |

**FAST_3 is a real browser review** (not CLI review). Nimrod opens D15.I in the browser and walks through all 10 checks. Team 61 must provide a brief walkthrough note in their FAST_2 Execution Closeout confirming how to set up the test state (e.g., how to ensure triggered-unread alerts exist for the test).

---

## §8 Artifacts Required from Team 61 (FAST_2 Closeout)

Before FAST_3 can be scheduled, Team 61 must produce:

| # | Artifact | Path | Content |
|---|---|---|---|
| 1 | FAST_2 Execution Closeout | `_COMMUNICATION/team_61/TEAM_61_S001_P002_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` | Implementation summary, files changed, API param confirmed, walkthrough setup note |

Team 51 produces:

| # | Artifact | Path | Content |
|---|---|---|---|
| 2 | FAST_2.5 QA Report | `_COMMUNICATION/team_51/TEAM_51_S001_P002_WP001_FAST25_QA_REPORT_v1.0.0.md` | pytest results, mypy results, quality scan results, PASS/FAIL verdict |

**FAST_3 is blocked until both artifacts exist and Team 51 issues QA PASS.**

---

## §9 FAST_1 Trigger

**This document is the FAST_0 output.**

Team 190: FAST_1 is triggered upon receipt of this document. Validate:
1. Scope brief consistent with activation decision (`TEAM_00_S001_P002_FAST_TRACK_ACTIVATION_DECISION_v1.0.0`)
2. Behavioral spec consistent with archived behavioral spec (Option A, N=5, no new backend)
3. Team assignments consistent with Fast Track v1.1.0 (Teams 61/51/190/170)
4. Scope boundaries enforced (no D34 changes, no schema, no new API)
5. project_domain = AGENTS_OS (U-01 domain-match check)

FAST_1 PASS unblocks Team 61 to begin FAST_2 implementation.

---

**log_entry | TEAM_100 | S001_P002_WP001_FAST0_SCOPE_BRIEF | ISSUED | FAST1_TRIGGERED | 2026-03-10**
