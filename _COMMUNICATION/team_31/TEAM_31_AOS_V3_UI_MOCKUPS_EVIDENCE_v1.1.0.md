---
id: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v1.1.0
historical_record: true
from: Team 31 (AOS Frontend Implementation)
to: Team 100 (Chief System Architect), Team 51 (QA)
cc: Team 00 (Principal), Team 11 (AOS Gateway)
date: 2026-03-27
type: EVIDENCE
domain: agents_os
mandate_ref: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v1.1.0
supersedes_evidence: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v1.0.0.md (partial — v1.0.0 was 3 pages)
status: READY_FOR_QA---

# Team 31 — AOS v3 UI mockups v1.1.0 — evidence

## Summary

Retrofit of existing `agents_os_v3/ui/` mockups per **Stage 8A** mandate v1.1.0: **5 pages**, assembled prompt on Pipeline (IDLE Start Run form, PAUSED `paused_at`, COMPLETE preset), **Teams** two-panel page, **Portfolio** four tabs + New/Edit idea modals, unified **5-link** `pipeline-nav` on all pages.

## Preflight (HTTP)

**Command:** `python3 -m http.server 8777` from repository root  
**Date:** 2026-03-27

| Resource | Path | HTTP |
|----------|------|------|
| Pipeline | `/agents_os_v3/ui/index.html` | 200 |
| History | `/agents_os_v3/ui/history.html` | 200 |
| Configuration | `/agents_os_v3/ui/config.html` | 200 |
| Teams | `/agents_os_v3/ui/teams.html` | 200 |
| Portfolio | `/agents_os_v3/ui/portfolio.html` | 200 |
| `app.js` | `/agents_os_v3/ui/app.js` | 200 |
| `style.css` | `/agents_os_v3/ui/style.css` | 200 |
| `theme-init.js` | `/agents_os_v3/ui/theme-init.js` | 200 |
| Shared CSS | `/agents_os/ui/css/pipeline-shared.css` | 200 |

**Automated script (optional):** [`agents_os_v3/ui/run_preflight.sh`](../../agents_os_v3/ui/run_preflight.sh) (from repo root: `bash agents_os_v3/ui/run_preflight.sh`) — exits non-zero if any page is not 200.

**JS parse check:** `node --check agents_os_v3/ui/app.js` — exit 0.

**Browser:** Visual / clipboard checks remain with **Team 51** (Chrome/Safari).

## Deliverables

| # | Path |
|---|------|
| 1 | `agents_os_v3/ui/index.html` |
| 2 | `agents_os_v3/ui/history.html` |
| 3 | `agents_os_v3/ui/config.html` |
| 4 | `agents_os_v3/ui/teams.html` |
| 5 | `agents_os_v3/ui/portfolio.html` |
| 6 | `agents_os_v3/ui/app.js` |
| 7 | `agents_os_v3/ui/style.css` |
| 8 | `agents_os_v3/ui/theme-init.js` |
| 9 | `agents_os_v3/ui/run_preflight.sh` |

## Mandate v1.1.0 acceptance mapping (checklist)

1. Five pages render — preflight 200 for all HTML.
2. Themes — `theme-init.js` + domain buttons; `html.theme-tiktrack` when `pipeline_domain=tiktrack`.
3. Layout — `agents-header`, `pipeline-nav`, `agents-page-layout` preserved.
4. Mock data — embedded in `app.js` per mandate JSON (state, prompt, teams, portfolio, ideas).
5. No inline `<style>` / `<script>` — verified in sources.
6. Classic `<script src>` only — no ES modules.
7. Tokens — `pipeline-shared.css` + `style.css`.
8. Nav — five links on every page.
9. Status badges — semantic CSS variables.
10. Pipeline — assembled prompt card first in main column; visible for IN_PROGRESS and CORRECTION; hidden for PAUSED, IDLE, COMPLETE.
11. IDLE — Start Run form (four fields + disabled primary CTA).
12. PAUSED — `paused_at` shown (`2026-03-26T15:00:00Z` in mock).
13. Teams — roster + context; Copy L1–L4, Copy Full Context, Refresh; current actor badge on team_61.
14. Portfolio — `run_id` first column, last 8 chars + `title` tooltip; New Idea modal three fields only; Edit modal includes `decision_notes`, `target_program_id` row when APPROVED, transition buttons.

## Next steps

1. **Team 51** — full QA (UI + clipboard + modals).
2. **Team 100** — review vs Stage 8A UI Spec Amendment v1.0.2.

---

**log_entry | TEAM_31 | AOS_V3_UI_MOCKUPS | EVIDENCE_v1.1.0 | 2026-03-27**
