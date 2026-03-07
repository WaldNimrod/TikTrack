---
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_00_TO_TEAM_100_S001_P002_LOD200_AND_ROUTING_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 100 (Development Architecture Authority — Agents_OS)
**cc:** Team 10 (Gateway), Team 170 (for LLD400 authoring), Team 190 (for GATE_0 intake)
**date:** 2026-03-03
**status:** ACTION REQUIRED — Team 100 placement decision + GATE_0 packaging
**authority_source:** TEAM_00_AGENTS_OS_CONTINUATION_STRATEGIC_DECISIONS_v1.0.0.md (A-1, A-2, A-3)
---

# TEAM 00 → TEAM 100 | S001-P002 LOD200 SPEC + ROUTING

## §1 ACTIVATION STATUS

S001-P002 (Alerts POC) activates upon GATE_8 PASS of S002-P003-WP002. That gate sequence is now in progress:

```
GATE_6 APPROVED (2026-03-03) → GATE_7 PENDING (Nimrod browser sign-off) → GATE_8 → S001-P002 ACTIVATES
```

All pre-conditions are met. Team 100 should **prepare GATE_0 packaging now** so it is ready to submit the moment GATE_8 closes.

---

## §2 FEATURE SPEC — LOD200 (Team 00 Authoritative)

This section provides Team 00's authoritative LOD200-level spec for the TikTrack deliverable in S001-P002. Team 100's concept document (`S001_P002_ALERTS_POC_LOD200_CONCEPT_v1.0.0.md`, 2026-02-27) covers the Agents_OS pipeline architecture and remains valid. This document adds/refines the TikTrack feature spec and raises one placement decision (§3).

### 2.1 Feature Identity

| Field | Value |
|-------|-------|
| Feature name | Alerts Summary Widget |
| Type | Read-only frontend component |
| Backend requirement | None — consumes two existing GET endpoints |
| Out of scope | New API routes, D34 modifications, user interaction beyond read + click-through |
| Agents_OS role | First real TikTrack feature run through full Agents_OS pipeline end-to-end |

### 2.2 Behavioral Specification

| Behavior | Spec |
|----------|------|
| **Empty state** | Widget is fully hidden / collapsed when unread alert count = 0 |
| **Non-empty state** | Widget is visible; shows unread count badge + list of N most recent unread alerts |
| **Count badge** | Prominent integer count of unread alerts (e.g. "3 unread alerts") |
| **Alert list** | Up to N = 5 most recent unread alerts (ordered by triggered_at DESC) |
| **Per-alert display** | Ticker symbol · Condition label · triggered_at (relative time, e.g. "2h ago") |
| **Click-through** | Alert item click → navigates to D34 (Alerts page) with that alert in view |
| **Count badge click** | Navigates to D34 filtered to unread alerts |
| **Read state change** | Widget data refreshes on page load only (no live polling required in MVP) |
| **No interaction** | Widget does not mark alerts as read; read status is managed on D34 |

### 2.3 API Contract (Existing Endpoints — No New Backend)

| Endpoint | Usage | Filter |
|----------|-------|--------|
| `GET /api/v1/alerts/` | Unread count + recent list | `?is_read=false&limit=5&ordering=-triggered_at` (or equivalent per D34 API contract) |
| `GET /api/v1/alerts/{id}` | Optional: deep link data for click-through | Used only if D34 click-through requires alert ID in URL |

**Constraint:** Team 20 must confirm the exact query parameter names for unread filtering. Team 30 implements the widget against the confirmed contract. No new backend development.

### 2.4 Data Model (No Changes)

The widget consumes the existing `alerts` table through the existing D34 API. No schema changes. No migration.

### 2.5 Frontend Implementation Constraints

| Constraint | Reason |
|------------|--------|
| Read-only component | Prevents scope creep; D34 is the write surface |
| Page load refresh only | MVP simplicity; polling adds complexity outside POC scope |
| No new CSS framework | Use existing TikTrack UI styles and component patterns |
| Responsive | Must work on standard desktop viewport (D15.I / header placement TBD per §3) |

---

## §3 PLACEMENT DECISION — REQUIRED FROM TEAM 100

**This is the one decision Team 100 must make before GATE_0 packaging.**

Team 00's requirements note described the widget as appearing across pages. Team 100's concept document placed it on D15.I (home dashboard) only. Team 00 presents both options; Team 100 decides.

### Option A: D15.I Home Dashboard Only

| Parameter | Value |
|-----------|-------|
| Scope | Single page (home dashboard) |
| Implementation complexity | LOW — one mount point, standard page component |
| Agents_OS POC validity | Fully valid — one page proves the pipeline |
| User experience | Alert summary visible on home only; users must navigate to D34 to see alerts |
| Recommended for | POC-first approach — minimal scope, fastest GATE_8 |

### Option B: Persistent Header Component (Multi-Page)

| Parameter | Value |
|-----------|-------|
| Scope | Appears in page header across all (or most) TikTrack pages |
| Implementation complexity | MEDIUM — requires shared layout component / header integration |
| Agents_OS POC validity | Fully valid — may increase LLD400 complexity slightly |
| User experience | Alert awareness everywhere; matches "appearing across many pages" vision |
| Recommended for | If Team 100 judges the additional complexity is still POC-appropriate |

### Option C: Hybrid (D15.I anchor + top-bar indicator)

| Parameter | Value |
|-----------|-------|
| Scope | Full widget on D15.I; lightweight count badge in header on all other pages |
| Implementation complexity | MEDIUM-HIGH — two components |
| Agents_OS POC validity | Valid but may be too complex for a POC; risks LOD200 bloat |
| Recommended for | NOT recommended for the POC — better suited as a post-POC product decision |

**Team 00 recommendation: Option A** — D15.I only, for POC scope discipline. Option B is acceptable if Team 100 judges it not to significantly expand the LLD400 complexity. Option C is not recommended for this POC.

**Team 100 action:** Issue decision and proceed with GATE_0 packaging per §4.

---

## §4 GATE_0 PACKAGING INSTRUCTIONS

Team 100 is authorized to package and submit GATE_0 immediately upon deciding §3.

Reference: `S001_P002_ALERTS_POC_LOD200_CONCEPT_v1.0.0.md` §7 — Artifacts to produce (7-file package). Incorporate the behavioral spec from §2 of this document into `SPEC_PACKAGE.md`. Incorporate the §3 placement decision into the cover note.

**Submission path:** `_COMMUNICATION/_ARCHITECT_INBOX/` (Team 190 receives for GATE_0 automated validation)

**GATE_0 submission timing:** Do not wait for GATE_8 of S002-P003-WP002. Submit GATE_0 package as soon as §3 decision is made. S001-P002 WP001 can run its spec-only gates (GATE_0 → GATE_1 → GATE_2) while S002-P003-WP002 completes GATE_7 → GATE_8 in parallel. WP002 execution does not begin until S002-P003-WP002 GATE_8 PASS — but spec gates can pipeline.

---

## §5 TEAM 00 NOTES ON AGENTS_OS PIPELINE VALIDATION

The existing concept document (§§3–6) covers the Agents_OS pipeline architecture correctly. No changes needed to the validator configuration, token efficiency design, or program architecture. Those sections stand.

One clarification: the existing concept's §2.1 scope states "Widget renders: count of unread alerts, category breakdown, link to D34 alerts page." The updated spec (§2.2 above) replaces "category breakdown" with "list of N most recent unread alerts" — simpler and more useful than a category breakdown for this MVP. Team 170 should use §2.2 as authoritative when authoring LLD400.

---

## §6 TIMELINE

```
NOW:     GATE_7 pending (Nimrod browser sign-off on D22/D33/D34/D35)
THEN:    GATE_8 → S002-P003-WP002 lifecycle closes
PARALLEL: S001-P002 WP001 GATE_0 packaging ready → submit → GATE_0 → GATE_1 → GATE_2

After GATE_8:  S001-P002 WP002 execution phase opens (Teams 20/30 implement widget)
```

---

**log_entry | TEAM_00→TEAM_100 | S001_P002_LOD200_SPEC_AND_ROUTING | ACTION_REQUIRED_PLACEMENT_DECISION | 2026-03-04**
