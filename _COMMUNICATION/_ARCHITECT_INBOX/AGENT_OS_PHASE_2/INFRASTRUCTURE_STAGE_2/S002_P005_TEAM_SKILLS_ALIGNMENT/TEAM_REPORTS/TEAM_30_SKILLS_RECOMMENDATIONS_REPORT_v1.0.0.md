---
project_domain: TIKTRACK
id: TEAM_30_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 30 (Frontend — Primary Executor)
to: Team 00 (Chief Architect), Team 100 (Agents_OS Architect)
cc: Team 10, Team 170, Team 190, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 30 skill recommendations for work acceleration, quality, and token efficiency
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 30 |

---

## 1) Team Context

### Operating Domain(s)
- TikTrack Phoenix frontend: React SPA (`ui/src/App.jsx`, `main.jsx`), hybrid HTML pages (`ui/src/views/<category>/<feature>/`)
- Shared components (`ui/src/components/`), cubes (`ui/src/cubes/`), styles (`ui/src/styles/`)
- API integration via `sharedServices.js` (Axios), Bearer auth

### Primary Toolchain / Runtime
- React 18, Vite 5, ES modules
- routes.json SSOT for routing
- API proxy: `/api` → `localhost:8082`
- MCP: cursor-ide-browser (browser_navigate, browser_snapshot, browser_click)

### Recurring Blockers (from actual execution)
1. **Field/contract alignment:** API response shape vs mandate (§7.2) — field names differ (`triggered_at` vs `triggeredAt`), fallback chains grow ad hoc.
2. **CSS Iron Rule compliance:** agents invent classes instead of using `CSS_CLASSES_INDEX.md`; collapsible-container / index-section patterns drift.
3. **maskedLog adoption:** new code sometimes uses `console.log`/`console.error` instead of `maskedLog`; validation loops follow.
4. **MCP verification gaps:** mandate requires browser_snapshot + navigation checks; zero-data scenarios (e.g. 0 alerts) leave badge/click flows unverified until QA.
5. **Implementation mandate ingestion:** work plans reference §7.2, §6, §2.2; agents re-scan instead of structured lookup → token waste.

---

## 2) Skill Options Table

| # | Option Name | What It Solves | Benefits | Risks / Tradeoffs | Impact | Effort | Token Saving |
|---|---|---|---|---|---|---|---|
| 1 | **api-field-contract-resolver** | Ambiguity between API snake_case vs camelCase, mandate fallback chains | Single source for `ticker_symbol`/`target_display_name`, `condition_summary` etc.; fewer trial-and-error edits | Needs backend schema alignment (Team 20) | HIGH | MEDIUM | MEDIUM |
| 2 | **css-classes-index-linter** | Invented classes, Iron Rule violations | Catches `class="foo"` when `foo` not in index; enforces BEM/collapsible patterns | Strict rules may block valid dynamic classes | HIGH | MEDIUM | MEDIUM |
| 3 | **maskedlog-enforcer** | Raw console in new/modified files | Pre-commit or agent check: no `console.log`/`console.error` with API data | May need allowlist for debug builds | MEDIUM | LOW | LOW |
| 4 | **implementation-mandate-compact** | Verbose mandate re-read each task | Structured JSON/YAML extract: §7.2 field contract, §6 run commands, §2.2 file list | Requires mandate schema maintenance | HIGH | MEDIUM | HIGH |
| 5 | **mcp-verification-script** | Manual browser_snapshot + click sequences | Scripted: navigate → login → snapshot → click item → assert URL | Depends on stable selectors; flaky if DOM changes | HIGH | MEDIUM | MEDIUM |
| 6 | **vite-build-preflight** | Late discovery of build/import errors | Run `npx vite build` before MCP; fail fast | Adds ~5–10s to cycle | MEDIUM | LOW | LOW |
| 7 | **component-pattern-templates** | Inconsistent widget structure (AlertsSummaryWidget-style) | Snippet: fetch + maskedLog + collapsible + empty/error contracts | Templates can become outdated | MEDIUM | LOW | MEDIUM |

---

## 3) Priority Recommendation (Top 3)

| Rank | Skill | Rationale |
|------|-------|-----------|
| **1** | **implementation-mandate-compact** | Highest token saving; every mandate task re-reads 200+ lines. Compact structured extract cuts scan cost. |
| **2** | **api-field-contract-resolver** | Recurring cause of validation loops (S001-P002 WP001 field contract). Direct ROI on quality. |
| **3** | **mcp-verification-script** | Automates acceptance steps 1–6 from implementation mandates; reduces manual MCP iterations. |

---

## 4) Dependencies and Prerequisites

| Skill | Prerequisites |
|-------|---------------|
| implementation-mandate-compact | Canonical mandate format (e.g. implementation_mandates.md) with stable section markers (§7.2, §6, §2.2) |
| api-field-contract-resolver | Team 20 API schema/doc; shared field-name convention (snake vs camel) |
| mcp-verification-script | cursor-ide-browser MCP enabled; login flow deterministic or mockable |
| css-classes-index-linter | Up-to-date `CSS_CLASSES_INDEX.md`; linter config in project |
| maskedlog-enforcer | ESLint rule or pre-commit hook |
| vite-build-preflight | CI / agent loop integration |

---

## 5) Suggested Owner per Option

| Option | Suggested Owner | Notes |
|--------|-----------------|-------|
| implementation-mandate-compact | Team 100 / Team 170 | Architecture + docs; output format for agent consumption |
| api-field-contract-resolver | Team 30 + Team 20 | Frontend owns usage; backend owns canonical schema |
| mcp-verification-script | Team 30 | Script lives in `ui/` or `agents_os/scripts/` |
| css-classes-index-linter | Team 30 + Team 40 | FE execution + design system governance |
| maskedlog-enforcer | Team 30 | ESLint/pre-commit in ui/ |
| vite-build-preflight | Team 30 / Team 50 | Can run in QA pipeline |
| component-pattern-templates | Team 30 | Internal to frontend workflow |

---

## 6) Open Clarification Questions

1. **implementation-mandate-compact:** Should the extract be generated at mandate-creation time (Team 10/170) or at agent runtime (Team 30)? Generation at creation ensures consistency; runtime keeps mandates editable without regeneration.
2. **mcp-verification-script:** Is a headless/Playwright alternative acceptable for CI, or must we rely solely on cursor-ide-browser for MCP alignment?

---

## 7) Return Contract

| Field | Value |
|-------|-------|
| overall_result | SUBMITTED_FOR_ARCH_REVIEW |
| top3_skills | implementation-mandate-compact, api-field-contract-resolver, mcp-verification-script |
| blocking_uncertainties | NONE (clarifications above are non-blocking) |
| remaining_blockers | NONE |

log_entry | TEAM_30 | SKILLS_RECOMMENDATIONS | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15
