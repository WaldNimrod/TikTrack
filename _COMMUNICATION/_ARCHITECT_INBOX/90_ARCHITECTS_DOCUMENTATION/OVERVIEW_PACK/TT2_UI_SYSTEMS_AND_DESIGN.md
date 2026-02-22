# TT2_UI_SYSTEMS_AND_DESIGN
**project_domain:** TIKTRACK

**id:** `TT2_UI_SYSTEMS_AND_DESIGN`  
**owner:** Team 40 + Team 30  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) UI Architecture
- Unified Header (`unified-header.html`) + Header Loader
- Shared filters + Phoenix Bridge
- HTML pages with UAI + page-specific TableInit modules
- Template Factory tooling: `ui/scripts/generate-pages.js` + `ui/scripts/validate-pages.js`

## 2) Responsive Strategy (Option D)
- Hybrid fluid layout (clamp + min‑width)
- Sticky Start/End columns
- Applies to D16/D18/D21 tables

## 3) Design System (Buttons, Palette)
- Button classes (DNA_BUTTON_SYSTEM)
- Color palette (DNA_PALETTE_SSOT)
- No inline styles

## 4) Rich‑Text (TipTap)
- TipTap Starter Kit + Link + TextStyle
- CSS classes: `.phx-rt--success|warning|danger|highlight`
- DOMPurify FE + Python sanitizer BE

## 5) Module/Menu Styling (SSOT)
- RTL order: Cancel right, Confirm left
- Header colors per entity (light bg, dark text/border/close)
- Standard derived from approved sample module

## 5.1) User Icon Status Colors (ADR‑017)
- Logged‑in: Success
- Logged‑out: Warning
- Black icon = invalid state (fail)

## 6) Admin Design System Page
- Route: `/admin/design-system`
- Type D (Admin only)
- Shows palette + button styles

## 7) External Data UI Contract
- Staleness clock + tooltip must appear on market-data pages.
- EOD/stale state is represented by color/state in clock component (no banner).
- `data_dashboard` now includes the same staleness scripts used by other relevant pages.

## 8) User Tickers UI
- Route: `/user_tickers.html`
- Add modal supports:
  - Add existing system ticker
  - Add new ticker symbol
- New ticker flow is backend-validated by live provider check before creation.

## 9) References (SSOT)
- `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- `documentation/04-DESIGN_UX_UI/DNA_BUTTON_SYSTEM.md`
- `documentation/04-DESIGN_UX_UI/DNA_PALETTE_SSOT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_RICH_TEXT_AND_DESIGN_SYSTEM_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`
