---
project_domain: TIKTRACK (SHARED when applicable)
id: TEAM_40_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 40 (UI Assets & Design)
to: Team 190 (Constitutional Validator)
cc: Team 00, Team 10, Team 30, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 40 skill recommendations for S002-P005 alignment
---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 40 |

---

## 1) Team Context

| Item | Description |
|------|-------------|
| **Operating domain(s)** | TIKTRACK (primary); SHARED when UI assets span domains. No AGENTS_OS UI ownership. |
| **Primary toolchain / runtime** | CSS: `phoenix-base.css`, `phoenix-components.css`, `phoenix-header.css`, `D15_DASHBOARD_STYLES.css`. Design tokens (DNA variables). Blueprints from Team 31; handoff to Team 30. Output: presentational classes, tokens, visual consistency only. No business logic, API, or state (SLA 30/40). |
| **Recurring blockers** | (1) **Sequential dependency:** styling starts only after Blueprint/Scope Lock — idle time or context loss. (2) **Inline styles in Blueprints:** filter/action buttons often ship with inline styles; we must extract to classes (e.g. `filter-icon-btn`, `filter-icon-btn--active`) — extra round-trips and token waste. (3) **Token drift:** entity/status colors or spacing defined in more than one place; fixes require cross-file alignment. (4) **RTL/a11y consistency:** ad-hoc fixes instead of a single reusable pattern set. |

---

## 2) Skill Options Table (minimum 5 options)

| # | Option name | What it solves | Benefits | Risks / tradeoffs | Impact | Effort | Token-saving estimate |
|---|-------------|----------------|----------|-------------------|--------|--------|----------------------|
| 1 | **CSS / design-token lint rule** | Enforce phoenix-base load order, no inline styles in handoff-ready markup, token usage only from DNA. | Prevents drift and rework; fewer “wrong order” or “wrong variable” fixes. | Requires rule maintenance and possible exceptions for legacy. | HIGH | MEDIUM | MEDIUM |
| 2 | **Blueprint-to-classes checklist (pre-handoff)** | Before 31→40 handoff: “All filter/action buttons use classes; no inline styles.” | Fewer back-and-forth cycles; we receive class-ready Blueprints. | Team 31 must adopt checklist; one-time alignment cost. | MEDIUM | LOW | LOW |
| 3 | **Design token single-source (40-owned)** | One canonical list (entity colors, status colors, spacing) that 40 owns; 30/31 reference it. | Single source of truth; fewer duplicate definitions and alignment fixes. | Requires discipline to update only via 40; small governance overhead. | HIGH | MEDIUM | MEDIUM |
| 4 | **RTL / a11y CSS snippet library** | Reusable RTL-safe and a11y snippets (focus, reduced-motion, logical properties) applied by default in our layer. | Consistent quality bar; less ad-hoc patching. | Must stay in sync with component markup (30). | MEDIUM | LOW | LOW |
| 5 | **30/40 coordination prompt template** | Standard “40→30 coordination” template: scope (what 40 delivers), classes list, token ref, handoff checklist. | Clear handoffs; fewer clarification rounds and rework. | Template must be kept current with WP types. | MEDIUM | LOW | MEDIUM |

---

## 3) Priority Recommendation (Top 3)

1. **Design token single-source (40-owned)** — highest impact on consistency and token waste from duplicate fixes.  
2. **Blueprint-to-classes checklist (pre-handoff)** — low effort, reduces the largest recurring friction (inline → classes).  
3. **30/40 coordination prompt template** — low effort, reduces ambiguity and clarification loops.

---

## 4) Dependencies and Prerequisites

| Option | Dependencies | Prerequisites |
|--------|--------------|---------------|
| CSS/token lint rule | Lint config in repo; agreement that 40 owns CSS/token rules. | Canonical token list (see option 3). |
| Blueprint checklist | Team 31 adoption; possible update to TT2_BLUEPRINT_HANDOFF_REQUIREMENTS. | Team 10 / 190 sign-off on checklist. |
| Token single-source | 40-owned doc or file; 30/31 reference only. | List frozen in one place (e.g. docs-governance or 40-maintained ref). |
| RTL/a11y snippets | None beyond our CSS layer. | Snippets documented and versioned. |
| 30/40 coordination template | Team 30 and 10 awareness. | Template in shared procedure or team_40. |

---

## 5) Suggested Owner per Option

| Option | Suggested owner | Rationale |
|--------|-----------------|------------|
| CSS/token lint rule | Team 40 (define); Team 60 or 61 (integrate in pipeline if needed) | 40 owns CSS/token semantics; infra owns run. |
| Blueprint checklist | Team 31 (apply); Team 10 (mandate); Team 190 (validate) | Checklist applies at handoff 31→40. |
| Token single-source | Team 40 | 40 owns design tokens and visual consistency. |
| RTL/a11y snippets | Team 40 | Part of our asset layer. |
| 30/40 coordination template | Team 40 (draft); Team 10 (adopt); Team 30 (consume) | 40 drives format; 10 orchestrates; 30 uses. |

---

## 6) Open Clarification Questions

- **Environment:** Our runtime is “CSS + design tokens + Blueprint handoff” within TIKTRACK/SHARED only. If future work includes AGENTS_OS UI assets, should those live in a separate tree and still reference the same token single-source, or a separate token set?
- **Lint scope:** Should the CSS/token lint rule run only under `ui/` (TIKTRACK) or also in any future AGENTS_OS UI path? We assume TIKTRACK-only unless told otherwise.

---

## 7) Return Contract

- **overall_result:** SUBMITTED_FOR_ARCH_REVIEW  
- **top3_skills:** (1) Design token single-source (40-owned), (2) Blueprint-to-classes checklist (pre-handoff), (3) 30/40 coordination prompt template  
- **blocking_uncertainties:** NONE (open questions above are non-blocking).  
- **remaining_blockers:** NONE  

log_entry | TEAM_40 | SKILLS_RECOMMENDATIONS_REPORT | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15
