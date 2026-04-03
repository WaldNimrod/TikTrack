---
id: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v1.0.0
historical_record: true
from: Team 31 (AOS Frontend Implementation)
to: Team 100 (Chief System Architect), Team 51 (QA)
cc: Team 00 (Principal), Team 11 (AOS Gateway)
date: 2026-03-27
type: EVIDENCE
domain: agents_os
mandate_ref: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v1.0.0
status: READY_FOR_QA---

# Team 31 — AOS v3 UI mockups — evidence

## Preflight (HTTP)

**Method:** `python3 -m http.server 8766` from repository root  
**Date:** 2026-03-27

| Resource | URL | HTTP |
|----------|-----|------|
| Pipeline View | `http://127.0.0.1:8766/agents_os_v3/ui/index.html` | 200 |
| History View | `http://127.0.0.1:8766/agents_os_v3/ui/history.html` | 200 |
| Configuration | `http://127.0.0.1:8766/agents_os_v3/ui/config.html` | 200 |
| Shared CSS (linked) | `http://127.0.0.1:8766/agents_os/ui/css/pipeline-shared.css` | 200 |
| `app.js` | `http://127.0.0.1:8766/agents_os_v3/ui/app.js` | 200 |
| `theme-init.js` | `http://127.0.0.1:8766/agents_os_v3/ui/theme-init.js` | 200 |
| `style.css` | `http://127.0.0.1:8766/agents_os_v3/ui/style.css` | 200 |

**Note:** Pages must be opened over HTTP (not `file://`) so the relative link to `../../agents_os/ui/css/pipeline-shared.css` resolves.

**Browser spot-check:** Automated check above; full Chrome/Safari visual sign-off is owned by Team 51 per mandate.

## Deliverables (paths)

| # | Path |
|---|------|
| 1 | `agents_os_v3/ui/index.html` |
| 2 | `agents_os_v3/ui/history.html` |
| 3 | `agents_os_v3/ui/config.html` |
| 4 | `agents_os_v3/ui/app.js` |
| 5 | `agents_os_v3/ui/theme-init.js` |
| 6 | `agents_os_v3/ui/style.css` |

## Mandate acceptance criteria (self-check)

1. **Three pages render** — HTML shells load; JS populates tables/state (verify in browser).
2. **Themes** — `theme-init.js` toggles `html.theme-tiktrack` when `localStorage.pipeline_domain === 'tiktrack'`; header sidebar / history / config include theme switch buttons.
3. **Layout** — `agents-header`, `pipeline-nav`, `agents-page-layout`, 300px sidebar on Pipeline page.
4. **Mock data** — Embedded in `app.js` per mandate JSON (state presets, history events, routing/templates/policies).
5. **No inline `<style>` / `<script>`** — Only external CSS/JS; HTML uses `hidden` where needed.
6. **Classic script tags** — No ES modules.
7. **Design tokens** — Via linked `pipeline-shared.css` + `style.css` extensions.
8. **History filters** — Domain, gate, 15 event types, actor; client-side filter on mock data.
9. **Pagination controls** — limit, offset, prev/next, filtered total.
10. **Status badges** — Semantic classes use shared CSS variables (`--accent`, `--warning`, etc.).

## Next steps

1. **Team 51** — QA pass (Chrome/Safari), including theme toggle and all six Pipeline presets.
2. **Team 100** — Review for alignment with Stage 8 §6 UI contract.

---

**log_entry | TEAM_31 | AOS_V3_UI_MOCKUPS | EVIDENCE_PUBLISHED | 2026-03-27**
