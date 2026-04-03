date: 2026-03-27
historical_record: true

# TEAM_31 — AOS V3 Pipeline — Operator next action & CLI handoff (UI proposal)

**Date:** 2026-03-27  
**From:** Team 31 (mockup lane)  
**To:** Team 100 / Principal (review before locking UX)  
**Status:** PROPOSAL — not canonical spec

## 1. Problem

The pipeline operator repeatedly does one of two things:

1. **Copy assembled prompt** to the assigned squad (existing flow — OK).
2. **Copy a terminal / API command** the system builds for the current transition (advance, approve, resubmit, resume, etc.).

Today there is no single, obvious place that says:

- **What the system last recognized** (last ledger event / state).
- **What the operator should do next** (prompt vs CLI vs human APPROVE).
- **The exact command string** ready to copy.

## 2. Proposed UX (mocked in `agents_os_v3/ui/`)

| Element | Role |
|--------|------|
| **Previous — last event (ledger)** | Newest event for `run_id`: `event_type`, time, actor, verdict (from mock history). |
| **Next — suggested operator action** | Rules-based copy from `status`, `is_human_gate`, `actor` (e.g. copy prompt to team_61; then record outcome via advance). |
| **Example terminal command** | `curl` example for the dominant next transition (mock paths only). |
| **Copy CLI** | Copies the pre block. |

**Idle / COMPLETE:** hide the operator handoff card (no active handoff).

## 3. Spec gap (for Team 100)

- **`TEAM_100_AOS_V3_UI_SPEC_AMENDMENT`** — strong on prompt copy and layout; does not yet normatively define **operator cue + CLI builder** as first-class fields.
- **`TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC`** — defines event types, ledger fields (`verdict`, `reason`, etc.), history/current-state reads; **routing/template fallback** is covered in routing/prompt specs, not as a dedicated **“multi-layer agent return → operator UI”** flowchart.

**Recommendation:** add a short **§ Operator handoff** to the UI amendment (or a sibling micro-spec): required UI blocks, which API shapes feed “previous” vs “next”, and when to show **fallback** (e.g. `ROUTING_FAILED`, ambiguous verdict) with explicit copy for human escalation.

## 4. Post-agent “layers” vs prompt L1–L4

Prompt architecture **L1–L4** = layers of **prompt assembly**, not the same as **post-completion event classification**. Event observability describes **typed events** and ledger semantics; any **multi-step classification + fallback** should be spelled out under **routing / observability / operator UI** so engineering and QA share one test matrix.

---

**Mock reference:** `agents_os_v3/ui/index.html` — `#aosv3-operator-cues`; `app.js` — `renderOperatorCues`.
