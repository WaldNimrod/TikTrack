# UI Improvements – Round C (Master Work File)

Version: 1.0.0
Date: 2025-10-13
Status: Kickoff (rules + workflow defined)

---

## 0) Mandatory Reading (deep read required)
All the following are REQUIRED readings before making any UI changes. Keep them open while working.

- CSS Architecture (ITCSS, loading order, RTL, tools)
  `documentation/02-ARCHITECTURE/FRONTEND/CSS_ARCHITECTURE_GUIDE.md`
- Linked Items System (generic linked object UI spec)
  `documentation/02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md`
- RTL Hebrew Guide (logical properties, direction, alignment)
  `documentation/02-ARCHITECTURE/FRONTEND/RTL_HEBREW_GUIDE.md`
- General Systems Index (95 systems, must re-use before creating new)
  `documentation/frontend/GENERAL_SYSTEMS_LIST.md`
- Cache Implementation Guide (no direct localStorage/IndexedDB, unified manager)
  `documentation/02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md`

> Note: Documentation is authoritative. No partial reading. Follow rules strictly.

---

## 1) Core Rules (Round C baseline)
These are the non-negotiable constraints used system‑wide. Round C inherits Round B rules and keeps them strictly enforced.

### 1.1 ITCSS Only
- Work strictly per ITCSS (9 layers).
  Settings → Tools → Generic → Elements → Objects → Components → Pages (dev tools only) → Themes → Utilities
- CSS files belong in `styles-new/06-components/` (Components).
  Page-specific CSS in 07-trumps is only for dev tooling and the global header.
- Bootstrap CSS loads first, then ITCSS files to override.

### 1.2 No Inline / No !important
- No inline CSS/JS/HTML anywhere.
- No `!important` unless explicit user approval.

### 1.3 Tables
- Use `data-table` (not Bootstrap `table`).
- Actions column and badges must follow the shared components.

### 1.4 Date & Formatters
- Default table date format: DD/MM/YY.
- Use `FieldRendererService.renderDate()` (or `renderDateShort` where applicable).

### 1.5 Dynamic Colors & Badges
- Colors come from CSS Custom Properties (user preferences).
- Status/type/priority/value badges use outline or tinted variants; never hard-code colors.

### 1.6 Icons (consistency)
- White rounded background, subtle shadow.
- Sizes: 36×36 (section), 24×24 (table title), 20×20 (action button).

### 1.7 RTL-First
- Use logical properties (`margin-inline-start`, `border-inline-end`, etc.).
- Text align via `start/end`, direction is RTL by default.

### 1.8 General Systems First
- Reuse existing general systems and services. No new page-specific systems without approval.
- All initialization via the unified initializer (no page-level DOMContentLoaded listeners).

---

## 2) Working Method (for documenting this file)
Implementation across the system is continuous. The steps below define how and when we record approved changes in this document.

1) Pick a page (agreed with reviewer).
2) Implement improvements (small, atomic edits that comply with rules above). Work continues across pages without pause.
3) Reviewer approval: Only when the reviewer explicitly confirms “final/fixed” we document the change here.
4) After approval, add a numbered section to this file with:
   - Page: file paths (`.html`, `.js`, `.css`)
   - Problem(s) identified (concise bullets)
   - Solution summary (what and why)
   - Exact edits (file list, selectors/classes added, functions touched)
   - Verification checklist (UI + accessibility + RTL + cache)
   - Regression notes (what to re‑test later)

This process ensures a future developer can replicate the fixes consistently across all pages while actual implementation proceeds continuously.

---

## 3) Round C – Tasks To Apply (pre-approved rules)
These are the immediate rules to implement across pages. After each fix is approved, expand the relevant bullet into a full, numbered section in the Change Log (Section 4).

### 3.1 Dynamic Colors (from user profile variables only)
- Buttons
  - Add button: primary color – border and text use `var(--color-primary)`; hover uses `color-mix(in srgb, var(--color-primary) 30%, transparent)` as background (outline style preserved).
  - Section toggle buttons (open/close): secondary color – border and text use `var(--color-secondary)`; hover uses 30% mix as לעיל.
- No hard-coded hex; only CSS variables from the preferences profile.

### 3.2 Tables – Width & Layout
- Tables always span full container width; columns defined in percentages.
- Actions column: fixed max-width (consistent across pages) using a shared variable/class.
- Table headers: all header titles centered.
- Sorting: every header is a clickable sorter wired to the general sorting system (no ad-hoc sort code).

---

## 4) Change Log (to be populated only after explicit approvals)
1) [TBD – will be appended after the first approved fix in Round C]

---

## 5) Appendix – Quick Links
---

## 6) Testing Checklist – All User Pages (Round C scope)
Use this short checklist per page after saving preferences or switching profile. Ensure both CSS and non‑CSS preferences propagate instantly.

- alerts (`/alerts`)
  - Primary/secondary button colors update instantly
  - Linked object badge uses new CSS vars
  - Alert feature toggles react to `preferences:updated`
  - Headers centered, sorting intact
- trades (`/trades`)
  - Buttons/badges recolor
  - Non‑CSS toggles (e.g., columns/filters) applied on event
  - Actions column width unchanged
- trade_plans (`/trade_plans`)
  - Plan badges/headings recolor
  - Feature flags toggle on event
- tickers (`/tickers`)
  - Filter/header recolor
  - Display prefs (e.g., format) update via hook/event
- executions (`/executions`)
  - Headers centered; recolor
  - Numeric/date renderers re‑apply based on prefs
- notes (`/notes`)
  - Linked object badge recolor
  - Note preview length or related prefs applied
- trading_accounts (`/trading_accounts`)
  - Account name/tile styles recolor
  - Visibility flags applied
- cash_flows (`/cash_flows`)
  - Reference page: buttons recolor <300ms; 100% table width; % columns; fixed actions

---

## 7) Events and Hooks – Preferences Propagation
- Global event: `preferences:updated` with detail `{ source, profileId?, version?, prefs? }`
- Global hook (compatibility): `window.onPreferencesReload(prefs)`
- Storage broadcast key: `tt:preferences` with `{ profileId, version, ts, source }`
- Visibility check: lightweight `/api/preferences/version` when returning to tab
- Round B (reference): `UI_IMPROVEMENTS_ROUND_B.md`
- Round B (ordered extract): `UI_IMPROVEMENTS_ROUND_B_REORDERED.md`
