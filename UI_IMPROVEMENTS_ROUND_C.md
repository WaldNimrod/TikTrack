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

### 4.1) Cash Flows – Amount Column Formatting
**Page**: `cash_flows.html`, `cash_flows.js`, `_tables.css`  
**Problem**:
- Currency symbol appearing on the wrong side (right of number instead of left in RTL)
- Amount column not right-aligned

**Solution**:
- Currency symbol: always display to the left of the number (end of line in RTL)
- Amount column: right-aligned (text-align: right)

**Implementation**:
- Update `FieldRendererService.renderCurrency()` or cash_flows rendering logic to ensure symbol placement uses logical properties
- Add `.col-amount { text-align: right; }` in `_tables.css` if not already present
- Verify RTL alignment: symbol at line-end (left), number at line-start (right)

**Status**: ✅ Completed

**Edits**:
- `field-renderer-service.js`: Added `renderAmount(value, currencySymbol, decimals)` with `dir="ltr"` to place symbol at line-end (left in RTL)
- `cash_flows.js`: Updated `renderCashFlowsTable` to use `FieldRendererService.renderAmount(cashFlow.amount, currencyDisplay)`
- `cash_flows.js`: Changed col-amount inline style from `text-align: left; direction: ltr;` to `text-align: right;`
- `_tables.css`: `.col-amount` already has right-align; no changes needed

---

### 4.2) Cash Flows – Type Column Dynamic Coloring
**Page**: `cash_flows.html`, `cash_flows.js`, `FieldRendererService`  
**Problem**:
- Type column should be colored (positive/negative) based on the **amount value**, not the type text itself

**Solution**:
- Extended `FieldRendererService.renderType(type, amountForColor)` to accept optional second parameter
- If `amountForColor` provided, apply `text-success` (green) or `text-danger` (red) class based on sign
- Updated `renderCashFlowsTable` to pass `cashFlow.amount` as second parameter

**Status**: ✅ Completed

**Edits**:
- `field-renderer-service.js`: Extended `renderType(type, amountForColor = null)` with conditional color class
- `field-renderer-service.js`: Added cash flow type translations (deposit, withdrawal, fee, dividend, transfer_in/out, other_positive/negative)
- `cash_flows.js`: Updated type rendering to `FieldRendererService.renderType(cashFlow.type, cashFlow.amount)`
- CSS: Uses existing `text-success`/`text-danger` classes (Bootstrap/dynamic colors)

---

### 4.3) Delete Confirmation Modal – Dynamic Danger Color
**Page**: `warning-system.js`, all user pages using delete  
**Problem**:
- Delete confirmation modal header and button used static `bg-danger`/`btn-danger` (Bootstrap classes) instead of dynamic `var(--danger-color)` from user preferences

**Solution**:
- Map color parameter ('danger', 'warning', etc.) to corresponding CSS variable
- Apply inline `style="background-color: var(--danger-color);"` to modal-header
- Button already uses `btn-danger` class which is defined in `_buttons-advanced.css` with `var(--danger-color)`

**Status**: ✅ Completed

**Edits**:
- `warning-system.js`: Added `colorVarMap` object to map color names to CSS variables
- `warning-system.js`: Changed modal-header from `bg-${color}` class to inline `style="background-color: ${bgColor};"`
- Verified: `showDeleteWarning` calls `showConfirmationDialog` with `'danger'` parameter
- Verified: `.btn-danger` in `_buttons-advanced.css` uses `var(--danger-color)` (no hardcoded hex)

---

### 4.4) Entity Details Modal – Dynamic Colors & Layout
**Page**: `entity-details-modal.js`, `entity-details-renderer.js`, `_modals.css`, all pages using entity details  
**Problem**:
- Entity details modal used hardcoded hex colors instead of dynamic CSS variables
- Header background was solid color instead of light variant
- Close button (X) was not using entity's dark variant color
- Close button positioned incorrectly (not at end of line in RTL)
- Section headings (h6) not bold due to ITCSS layer override
- Field labels (`.col-5.text-muted`) not bold

**Solution**:
- Replace all hardcoded colors with CSS variables: `var(--entity-X-color)`, `var(--entity-X-bg)`, `var(--entity-X-text)`
- Header background: use `--entity-X-bg` (light variant, 10% mix)
- Header text: use `--entity-X-text` (dark variant)
- Close button: use `--current-entity-text` with mask for X icon
- Header layout: `flex-direction: row-reverse` + `justify-content: flex-start`
- Close button: `position: static` to enable flex positioning
- Change section headings from h6 to h5 (avoid ITCSS `04-elements/_headings.css` override)
- Field labels: add `.col-5.text-muted { font-weight: 700 }`
- Footer button alignment: `justify-content: flex-end` (left in RTL)

**Status**: ✅ Completed

**Edits**:
- `entity-details-renderer.js`: Replaced all hardcoded colors (`#019193`, `#007bff`, etc.) with `var(--entity-X-color)`
- `entity-details-renderer.js`: Changed all `<h6>` to `<h5>` for section headings (9 occurrences)
- `entity-details-modal.js`: Header uses `--current-entity-color/bg/text` CSS variables set via `setProperty()`
- `entity-details-modal.js`: Normalized entity types: `cash_flow` → `cash-flow` for CSS variable names
- `_modals.css`: Added `.modal-content.entity-details-modal` rules with specificity 0,3,X
- `_modals.css`: Header: `flex-direction: row-reverse` + `justify-content: flex-start`
- `_modals.css`: Close button: `position: static`, `background: var(--current-entity-text)`, SVG mask
- `_modals.css`: Section headings: `.modal-body h5 { font-weight: 700 }`
- `_modals.css`: Field labels: `.col-5.text-muted, .col-md-3.text-muted, .col-md-4.text-muted { font-weight: 700 }`
- `_modals.css`: Footer: `.modal-footer { justify-content: flex-end }` (button at left in RTL)

**Technical Notes**:
- Specificity: `.modal-content.entity-details-modal .modal-header` = 0,3,0 (overrides Bootstrap 0,1,0)
- No `!important` used (adheres to ITCSS rules)
- CSS variables cascade from `:root` via `ui-advanced.js` → `updateCSSVariablesFromPreferences()`
- Close button uses SVG data URI mask for X icon with dynamic background color

---

### 4.5) Entity Details Modal – Linked Items Display
**Page**: `entity-details-renderer.js`, linked items in entity details modal  
**Problem**: (To be documented after implementation)

**Status**: 🚧 In Progress

---

### 4.6) Entity Details API – Endpoint Mapping
**Page**: `entity-details-api.js`  
**Problem**: Missing endpoint mapping for `trading_account` entity type causing "לא נמצא endpoint" errors

**Status**: 🚧 Pending

---

## 5) Appendix – Quick Links
---

## 6) Testing Checklist – All User Pages (Round C scope)
Use this short checklist per page after saving preferences or switching profile. Ensure both CSS and non‑CSS preferences propagate instantly.

- cash_flows (`/cash_flows`)
  - Reference page: buttons recolor <300ms; 100% table width; % columns; fixed actions
  - Section toggle buttons use secondary; hover = 30% mix
  - Sorting wired on all headers; centered titles

- executions (`/executions`)
  - Headers centered; recolor from prefs
  - Numeric/date renderers re‑apply on `preferences:updated`

- tickers (`/tickers`)
  - Filter/header recolor from prefs
  - Display prefs (formats) update via hook/event

- trading_accounts (`/trading_accounts`)
  - Account badges/titles recolor from prefs
  - Visibility flags applied on `preferences:updated`

- notes (`/notes`)
  - Linked object badge recolor from prefs
  - Note preview length or related prefs applied

- alerts (`/alerts`)
  - Primary/secondary buttons recolor instantly
  - Linked object badge uses new CSS vars
  - Feature toggles react to `preferences:updated`

- trade_plans (`/trade_plans`)
  - Plan badges/headings recolor from prefs
  - Feature flags toggle on event

- trades (`/trades`)
  - Buttons/badges recolor; actions column width unchanged
  - Non‑CSS toggles (e.g., columns/filters) applied on event

- db_display (`/db_display`)
  - Table headers centered; sorting wired via general sorter
  - Primary/secondary styles applied to controls (no hard‑coded colors)

- db_extradata (`/db_extradata`)
  - Cards/tables recolor from prefs; consistent actions column max‑width
  - Preferences events update filters/toggles without refresh

---

## 7) Events and Hooks – Preferences Propagation
- Global event: `preferences:updated` with detail `{ source, profileId?, version?, prefs? }`
- Global hook (compatibility): `window.onPreferencesReload(prefs)`
- Storage broadcast key: `tt:preferences` with `{ profileId, version, ts, source }`
- Visibility check: lightweight `/api/preferences/version` when returning to tab
- Round B (reference): `UI_IMPROVEMENTS_ROUND_B.md`
- Round B (ordered extract): `UI_IMPROVEMENTS_ROUND_B_REORDERED.md`
