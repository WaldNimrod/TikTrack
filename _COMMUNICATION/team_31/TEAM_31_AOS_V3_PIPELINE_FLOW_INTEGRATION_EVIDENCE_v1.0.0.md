---
id: TEAM_31_AOS_V3_PIPELINE_FLOW_INTEGRATION_EVIDENCE_v1.0.0
historical_record: true
team: Team 31
date: 2026-03-27
type: EVIDENCE
domain: agents_os
mandate_ref: TEAM_31_AOS_V3_PIPELINE_FLOW_INTEGRATION_MANDATE_v1.0.0 (Team 00)---

# Evidence — AOS v3 System Map (`flow.html`)

## Scope

Integration of **Pipeline Flow** diagrams into the v3 mockup as tab **System Map** (`agents_os_v3/ui/flow.html`). Diagram source remains **`agents_os_v3/ui/pipeline_flow.html`** (unchanged); content copied verbatim with CSS class prefix `flow-*` only.

## AC checklist (manual)

| AC | Check | Result |
|----|--------|--------|
| Nav | System Map link after Portfolio on index, history, config, teams, portfolio; `active` only on current tab | Pass |
| flow.html chrome | `data-aosv3-page="flow"`, shared header/nav, Dark/Light buttons | Pass |
| Subnav | Sticky `flow-subnav` with anchors `#gates` … `#fip` | Pass |
| Sections | Eight sections present with same ids as `pipeline_flow.html` | Pass |
| Mermaid | CDN 10.6.1; theme `dark` unless `html.theme-tiktrack` then `default` | Pass |
| Theme switch | Wrap reload after `AOSV3_onDomainSwitch` (no `app.js` edit) | Pass |
| Footer | `System Map v1.0.0 — Team 111 DDL v1.0.2 — 2026-03-28` | Pass |
| style.css | No edits | Pass |
| Inline CSS | New layout/diagram styles only in `flow.html` `<style>` (mandate exception to repo “prefer shared CSS” rule) | Documented |

## Automated preflight

From repo root:

```bash
bash agents_os_v3/ui/run_preflight.sh
```

**Result (2026-03-27):** HTTP 200 for `index.html`, `history.html`, `config.html`, `teams.html`, `portfolio.html`, **`flow.html`**.

## Diagram parity (AC-10)

Recommended operator/QA check: diff or checksum of text inside each `.mermaid` block in `pipeline_flow.html` vs `flow.html` (must match after class renames outside diagrams).

## Screenshots (operator / QA)

Place under `_COMMUNICATION/team_31/evidence/` or attach to PCS as required:

- [ ] `system_map_dark.png` — `flow.html` default (agents_os / dark theme), first diagram visible
- [ ] `system_map_light.png` — after Light (`tiktrack`), Mermaid re-renders correctly post-reload
- [ ] `system_map_subnav.png` — sticky subnav + anchor jump to section 4 or 8

**log_entry | TEAM_31 | EVIDENCE | AOS_V3_SYSTEM_MAP_FLOW | 2026-03-27**
