---
**project_domain:** TIKTRACK
**id:** TEAM_100_S001_P002_WP001_FAST0_SCOPE_BRIEF_v1.1.0
**from:** Team 100 (Development Architecture Authority)
**to:** Team 10 (Orchestrator — FAST_2), Team 190 (Validator — FAST_1), Team 30 (Frontend — executor), Team 50 (QA), Team 70 (Documentation — FAST_4)
**cc:** Team 00, Team 20 (API verify — read only)
**date:** 2026-03-10
**status:** ACTIVE — FAST_0 OUTPUT; FAST_1 TRIGGERED
**supersedes:** TEAM_100_S001_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0 (wrong domain + wrong team assignments)
**correction_reason:** v1.0.0 classified domain as AGENTS_OS and assigned Teams 61/51. Domain is TIKTRACK — teams are assigned by domain, not by development track. Team 61 = AGENTS_OS-only. Team 30 = TIKTRACK frontend.
**protocol:** FAST_TRACK_EXECUTION_PROTOCOL_v1.1.0 §2.1 + §4.1 + §6.1 (TIKTRACK sequence)
**activation_authority:** Team 00 (Chief Architect) + Team 100 — per FAST_TRACK §2.1
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | WP001 (single WP — full feature delivery, fast track) |
| gate_id | FAST_0 → FAST_1 |
| phase_owner | Team 100 |
| project_domain | **TIKTRACK** |

---

# S001-P002 WP001 — FAST_0 SCOPE BRIEF (CORRECTED)
## Alerts Summary Widget on D15.I — TIKTRACK Fast Track

---

## §1 Strategic Purpose

S001-P002 delivers a real TikTrack product feature — an Alerts Summary Widget on the home dashboard (D15.I) — using the agents_os_v2 pipeline as the orchestration/governance layer.

**Dual proof:**
1. **TikTrack product value:** The widget ships live. Users see unread alerts on the home dashboard.
2. **agents_os_v2 pipeline proof:** A real TIKTRACK feature is delivered through the governed gate/fast-track sequence — proving the pipeline works on product delivery, not just on its own infrastructure.

**Domain:** TIKTRACK. The deliverable is a TikTrack product feature. Domain determines team assignment — regardless of the governance track used.

---

## §2 Fast Track Activation

**TIKTRACK fast track = LOCKED_OPTIONAL.** Activated per FAST_TRACK §2.1:
- Nimrod (Chief Architect / Team 00): explicit activation ✅ — stated 2026-03-10
- Team 100 (Architectural authority): co-authority ✅

**Mode:** IMMEDIATE — normal flow was not active for this WP; fast track activates directly.

---

## §3 FAST Stage Assignments — TIKTRACK sequence

| Stage | Action | Owner |
|---|---|---|
| **FAST_0** | This scope brief | **Team 100** ✅ |
| **FAST_1** | Independent constitutional validation | **Team 190** ← triggered now |
| **FAST_2** | Execution — Team 10 orchestrates Teams 20 (API verify) + 30 (implementation) | **Team 10** (per FAST_TRACK §6.1) |
| **FAST_3** | Nimrod browser sign-off on D15.I | **Nimrod** |
| **FAST_4** | Knowledge promotion + documentation closure | **Team 70** |

**QA** is embedded in FAST_2 under Team 10 coordination:
- Team 50 performs QA/FAV on the delivered widget (GATE_5-equivalent, before FAST_3)

**No FAST_2.5** — that stage is AGENTS_OS only. TIKTRACK QA runs under Team 10 → Team 50 within FAST_2.

---

## §4 Squad Assignments within FAST_2

| Squad | Role | Scope for this WP |
|---|---|---|
| **Team 10** | Orchestrator | Issues mandates to Teams 20/30; coordinates QA → FAST_3 readiness |
| **Team 20** | Backend (verify only) | Confirm existing `GET /api/v1/alerts/` endpoint supports required filter. No implementation unless API gap found → escalate immediately |
| **Team 30** | Frontend (primary executor) | Build Alerts Summary Widget component on D15.I |
| **Team 50** | QA/FAV | Test widget on D15.I; issue QA PASS before FAST_3 |
| **Team 40** | UI/Design | Out of scope — widget uses existing TikTrack styles. Re-engage only if Team 30 identifies design gap |

---

## §5 Feature Spec — Complete Behavioral Specification

### 5.1 Feature Identity

| Field | Value |
|---|---|
| Feature name | Alerts Summary Widget |
| Type | Read-only frontend component |
| Target page | D15.I — Home Dashboard only (Option A, locked) |
| Backend requirement | None — existing API only (no new routes, no schema changes) |
| D34 changes | None — D34 is untouched |

**Authority:** `TEAM_00_TO_TEAM_100_S001_P002_LOD200_AND_ROUTING_v1.0.0` §2.2 + `TEAM_100_S001_P002_PLACEMENT_DECISION_v1.0.0` §1 (archived; behavioral spec preserved verbatim)

### 5.2 Behavioral Specification

| Behavior | Spec |
|---|---|
| **Empty state** | Widget fully hidden / collapsed when `trigger_status=triggered_unread` count = 0 |
| **Non-empty state** | Widget visible; count badge + list of N=5 most recent unread alerts |
| **Count badge** | Integer count of triggered-unread alerts (e.g. "3 unread alerts") |
| **Alert list** | Up to N=5 most recent triggered-unread, ordered by `triggered_at DESC` |
| **Per-alert display** | Ticker symbol · Condition label · `triggered_at` (relative time, e.g. "2h ago") |
| **Alert item click** | Navigates to D34 with that alert in view |
| **Count badge click** | Navigates to D34 filtered to triggered-unread |
| **Refresh** | Page load only — no polling in MVP |
| **Read state** | Widget does NOT mark alerts as read — D34 manages read state exclusively |

### 5.3 API Contract (Existing — No New Backend)

| Endpoint | Usage | Note |
|---|---|---|
| `GET /api/v1/alerts/` | Triggered-unread count + list (limit 5, ordered by triggered_at DESC) | Team 20 confirms exact filter params before Team 30 builds |

**Team 20 action (mandatory first step in FAST_2):** Run the endpoint against the live API, confirm `trigger_status=triggered_unread` (or equivalent) works as expected. Document exact query parameters in a brief note to Team 30 before widget implementation begins.

### 5.4 Frontend Implementation Constraints

| Constraint | Rule |
|---|---|
| **collapsible-container template** | D15.I uses this template — Iron Rule. Widget integrates as a section within the existing layout |
| **Existing TikTrack styles** | No new CSS framework; no custom design tokens |
| **Read-only** | Widget does not write to any endpoint |
| **maskedLog** | Any JS console output uses maskedLog |
| **Page load refresh only** | No WebSocket, no polling |

---

## §6 Scope Boundaries

### 6.1 In Scope

| Item |
|---|
| Alerts Summary Widget component on D15.I |
| Team 20 API contract verification (read only) |
| Team 30 widget implementation |
| Team 50 QA/FAV on D15.I |
| Team 70 documentation closure (FAST_4) |

### 6.2 Out of Scope — Hard Boundaries

| Item | Ruling |
|---|---|
| D34 changes | None |
| New backend API routes | None — existing only |
| Schema changes / migrations | None |
| Multi-page widget (Option B) | Post-POC |
| Live polling / WebSocket | Post-MVP |
| Alert read-state management | D34 only |

---

## §7 FAST_3 Acceptance Criteria (Nimrod Browser Review)

| # | Check | Pass Criteria |
|---|---|---|
| 1 | D15.I loads | No errors |
| 2 | Empty state | Zero unread → widget completely hidden |
| 3 | Non-empty state | ≥1 unread → widget visible |
| 4 | Count badge | Integer count displayed |
| 5 | Alert list | Up to 5 items, most recent first |
| 6 | Per-alert display | Ticker · Condition · relative time |
| 7 | Alert item click | Navigates to D34 |
| 8 | Count badge click | Navigates to D34 (unread filter) |
| 9 | Layout integrity | D15.I layout intact — no breakage |
| 10 | D34 unaffected | D34 renders identically to GATE_7 PASS state |

Team 50 QA report must confirm all 10 items before FAST_3 is scheduled.

---

## §8 Minimal Artifact Set (TIKTRACK fast track)

Per FAST_TRACK §9 (TIKTRACK):

| # | Artifact | Owner | Timing |
|---|---|---|---|
| 1 | This FAST_0 scope brief | Team 100 | ✅ Complete |
| 2 | FAST_1 validation result | Team 190 | After FAST_1 |
| 3 | FAST_2 execution closeout (Team 10 + Teams 20/30 summary + Team 50 QA PASS) | Team 10 | After FAST_2 |
| 4 | FAST_4 knowledge closure | Team 70 | After FAST_3 PASS |

---

**log_entry | TEAM_100 | S001_P002_WP001_FAST0_SCOPE_BRIEF | v1.1.0_TIKTRACK_CORRECTED | FAST1_TRIGGERED | 2026-03-10**
