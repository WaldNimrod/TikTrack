# AOS Pipeline Dashboard — User Guide

**Version:** 1.0.0  
**Audience:** Operators (Nimrod), monitors, team leads  
**Companion:** [AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md](./AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md)  
**Date:** 2026-03-23

---

## §1 — Dashboard Overview

### URL and launch

Open the static HTML dashboard (served over HTTP):

```text
http://localhost:8092/static/PIPELINE_DASHBOARD.html
```

Use `./agents_os/scripts/start_ui_server.sh` (v2 UI on **8092**) or open the v3 entry at **`http://127.0.0.1:8090/`** for BUILD UI. Port policy: `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md`.

### Layout (major regions)

- **Header** — domain selector, refresh toggle, pipeline identity (WP, gate).
- **Accordion sections** — Next Steps, Mandates, Human Review, QA, Roadmap (exact IDs vary by build; see HTML).
- **Mandates panel** — multi-tab mandate viewer fed by `_parseMandateSections` (`agents_os/ui/js/pipeline-dashboard.js:711`).

### Domain selector

Switches between **`tiktrack`** and **`agents_os`** state files (`DOMAIN_STATE_FILES` in `pipeline-config.js:252-255`). Always match the domain you used in `./pipeline_run.sh --domain …`.

### Auto-refresh

When enabled, `loadAll` runs every **5000 ms** (`pipeline-dashboard.js:4348`, `4379`). A **Refresh** badge may appear when state content changes (`pipeline-dashboard.js:106`, `4327`).

---

## §2 — Status Indicators

| Element | Meaning |
|---------|---------|
| Gate badge | Current `current_gate` from JSON (legacy IDs may resolve to canonical — `resolveCanonicalGate`, `pipeline-config.js:25-27`) |
| PASS / FAIL / PENDING | Derived from gate machine + verdict scans |
| Phase badge (P1, P2) | Maps to mandate `mandateMeta.phase` from `_parseMandateSections` (`pipeline-dashboard.js:732-741`) |
| `next-phase` vs `correction-needed` tab class | Active phase tab: `next-phase` unless `hasCorrection` → `correction-needed` (`pipeline-dashboard.js:779-783`) |
| Verdict file green / PASS / FAIL | `autoLoadVerdictFile` + `extractVerdictStatus` (`pipeline-dashboard.js:3222`, `1909`) |

---

## §3 — Mandate Tabs

1. **Generation:** Mandate markdown is loaded from `getGateMandatePath(gate, domain)` → `prompts/{slug}_{base}` (`pipeline-config.js:240-247`).
2. **Parsing:** `_parseMandateSections` splits on `## Team N` or `## Operator` headers (`pipeline-dashboard.js:711-717`).
3. **Phase tabs:** Phase number from `(Phase N)` in header; `activePhase` computed from gate + `pipelineState` (`pipeline-dashboard.js:754-773`).
4. **Coordination:** Sections with `✅  Auto-loaded:` or `⚠️  File not yet available` — see `mandateMeta` flags (`pipeline-dashboard.js:736-741`).

---

## §4 — Pass-Ready CTA

When a verdict PASS is detected, the **Pass-Ready** block in `#csb-fd-pass-ready` shows a prominent copy button (`pipeline-dashboard.js:2066-2129`).

**GATE_5 Phase 5.1 exception:** At documentation phase, the CTA may show **phase2** command (advance to Team 90 phase) instead of immediate `pass` — see injected HTML in the same block (lines 2116+ region).

**Operator flow:** Copy command → run in terminal → wait ≤5s for auto-refresh → confirm gate/phase on dashboard.

---

## §5 — Human Review (GATE_4 / 4.3)

- **HRC** — Human Review Checklist in dashboard HTML (section varies by build).
- **PASS / BLOCK / PWA** — Use verdict buttons; `applyVerdictToButtons` dims wrong action (`pipeline-dashboard.js:1951-1965`).
- **Bulk actions** — Per dashboard controls (if present in your build).
- **Final decision** — Must be consistent with `extractVerdictStatus` patterns so the banner updates.

---

## §6 — File Detection and Verdict Scan

| Mechanism | Role |
|-----------|------|
| `getExpectedFiles()` | Phase-aware expected paths (`pipeline-config.js:322`) |
| `autoLoadVerdictFile` | Fetch + preview + `extractVerdictStatus` (`pipeline-dashboard.js:3222`) |
| `extractVerdictStatus` | Recognizes JSON `"decision"`, headers, `CLOSURE_RESPONSE — PASS`, `BLOCKING_REPORT` (`pipeline-dashboard.js:1909-1945`) |
| Manual rescan | `fdRescan` / layer B in comment block (`pipeline-dashboard.js:1983-1985`) |

If verdict shows **unknown**, the text may not match any pattern — add a header line `**status:** PASS` or JSON `{"decision":"PASS"}` at top of file.

---

## §7 — Common Operator Actions

### Start a new WP

1. Ensure `pipeline_state_{domain}.json` initialized for WP + `GATE_0` (or appropriate start).
2. Run `./pipeline_run.sh --domain <domain>` (default = `next`) to generate prompt.
3. After Team 190 GATE_0 PASS, `./pipeline_run.sh --domain <domain> --wp … --gate GATE_0 --phase … pass` (precision per KB-84).

### Advance a gate

1. Run precision command from `_kb84_guard` example (`pipeline_run.sh:421-537`).
2. **Never** paste `pass` without matching `--wp`/`--gate`/`--phase` when phase is active.

### Run `phase2` (example)

```bash
./pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_1 --phase 1.2 phase2
```

`phase*` handler: `pipeline_run.sh:1393-1479` (includes `FIX-101-07` for GATE_5).

### Recover from FAIL

1. Read failure reason in state / event log.
2. Use `route doc` or `route full` per `ALL_GATE_DEFS` fail routes (`pipeline-dashboard.js:936+`).
3. Re-run `ssot_check` after WSM-affecting fixes.

### Troubleshooting

| Symptom | Check |
|---------|--------|
| `ssot_check` exit 1 | WSM `STAGE_PARALLEL_TRACKS` vs `pipeline_state` |
| Dashboard stale | Auto-refresh on? Server serving latest JS? (`?v=` cache bust on script tag in HTML) |
| Mandate not loading | Path from `getGateMandatePath`; file exists under `_COMMUNICATION/agents_os/prompts/` |

---

## Code anchors (quick)

| Topic | File:line |
|-------|-----------|
| Auto-refresh 5s | `agents_os/ui/js/pipeline-dashboard.js:4348`, `4379` |
| Pass-Ready CTA | `agents_os/ui/js/pipeline-dashboard.js:2066-2129` |
| `getEffectiveVerdictTeam` | `agents_os/ui/js/pipeline-dashboard.js:1387-1424` |
| `extractVerdictStatus` | `agents_os/ui/js/pipeline-dashboard.js:1909-1945` |
| KB-84 fail/route | `pipeline_run.sh:1123`, `1253` |

---

**log_entry | TEAM_170 | DASHBOARD_GUIDE | v1.0.0 | 2026-03-23**
