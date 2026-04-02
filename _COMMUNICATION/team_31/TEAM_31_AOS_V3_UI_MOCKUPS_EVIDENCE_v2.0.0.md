---
id: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v2.0.0
historical_record: true
team: Team 31
date: 2026-03-27
type: EVIDENCE
domain: agents_os
mandate_ref: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0
basis_spec: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0 (Stage 8B sections per mandate)
status: MOCKUP_DELIVERED — Team 90 CONDITIONAL (F-01 open until AC alignment)---

# Team 31 — AOS v3 UI mockups — evidence (mandate v2.0.0)

## Team 90 validation (canonical)

| Field | Value |
|-------|--------|
| Verdict | **CONDITIONAL** |
| Artifact (current) | [_COMMUNICATION/team_90/TEAM_90_AOS_V3_MOCKUP_VALIDATION_VERDICT_v1.0.1.md](../team_90/TEAM_90_AOS_V3_MOCKUP_VALIDATION_VERDICT_v1.0.1.md) (recheck; supersedes v1.0.0) |
| MAJOR | 0 |
| Gate note | F-01 (MINOR): נדרש ארטיפקט יישור AC-30 (waiver או עדכון AC) מ־Team 100 / Team 00 — ראו [TEAM_31_TO_TEAM_100_AC30_ALIGNMENT_FOLLOWUP_TEAM90_F01_v1.0.0.md](TEAM_31_TO_TEAM_100_AC30_ALIGNMENT_FOLLOWUP_TEAM90_F01_v1.0.0.md) |

## Preflight (automated)

| Check | Command | Result |
|-------|---------|--------|
| JS syntax | `node --check agents_os_v3/ui/app.js` | Exit 0 |
| Five pages HTTP 200 | `bash agents_os_v3/ui/run_preflight.sh` (from repo root) | All 200: `index.html`, `history.html`, `config.html`, `teams.html`, `portfolio.html` |

## Scope touched

- `agents_os_v3/ui/app.js` — 13 pipeline presets; `previous_event` / `pending_feedback` / `next_action` / `sse_connected` / `correction_blocking`; Operator Handoff + CORRECTION + feedback/ingestion mocks; History run selector + `?run_id=`; Teams `ENGINE_OPTIONS` + Save + toast; Portfolio gate filter, columns, WP modal, Ideas `domain_id` / `idea_type`.
- `agents_os_v3/ui/index.html`, `history.html`, `portfolio.html` — DOM per mandate v2.0.0.
- `agents_os_v3/ui/style.css` — minimal additions (SSE, handoff, history timeline, gate pills, idea-type badges, WP row).
- Header identity comments: `config.html`, `teams.html`, `theme-init.js` aligned to mandate v2.0.0 (no functional change to `config.html` per mandate).

## Documented deviation — AC-30 vs implementation

**AC-30** in the mandate calls for **10** pipeline scenarios; **Principal-approved plan** retains **all 7 legacy presets** and adds **6 new** = **13** options in the scenario selector. Team 90 **F-01** classifies this as **governance drift** until **Team 100 / Team 00** publish a formal alignment artifact (waiver or AC update). See follow-up: [TEAM_31_TO_TEAM_100_AC30_ALIGNMENT_FOLLOWUP_TEAM90_F01_v1.0.0.md](TEAM_31_TO_TEAM_100_AC30_ALIGNMENT_FOLLOWUP_TEAM90_F01_v1.0.0.md).

## Browser QA

Visual Chrome/Safari pass remains with **Team 51** per mandate routing; Team 31 supplied preflight + syntax only.

**log_entry | TEAM_31 | AOS_V3_UI_MOCKUPS | EVIDENCE_v2.0.0 | 2026-03-27**

**log_entry | TEAM_31 | AOS_V3_UI_MOCKUPS | EVIDENCE_LINKED_TEAM_90_VERDICT_CONDITIONAL | 2026-03-27**
