date: 2026-03-27
historical_record: true

# Team 31 — UI screenshots + static base fix

**Date:** 2026-03-27  
**Domain:** agents_os (AOS v3 UI)

## Root cause (broken tables / “empty” UI under static serve)

`<base href="/v3/" />` forced `style.css` and `app.js` to load from `http://host/v3/...` while pages were opened as `.../agents_os_v3/ui/*.html` → 404 → no JS/CSS.

**Fix:** `<base href="./" />` in all v3 HTML pages (+ `pipeline_flow.html`).

## Screenshots

- **Script:** `agents_os_v3/ui/scripts/capture_ui_review_screenshots.mjs`
- **Run:** `cd agents_os_v3/ui/scripts && npx playwright install chromium && node capture_ui_review_screenshots.mjs`
- **Output:** `_COMMUNICATION/team_31/evidence/ui_review_screenshots/` (`01_pipeline.png` … `06_flow.png`, `manifest.json`)

## Other UI tweaks

- `style.css`: table wrap + sticky header row, readable `th` wrap, `aosv3-table-actions-inner` flex for action buttons.
- `app.js`: portfolio active / WP / ideas rows use `aosv3-table-actions` cells.

## Verify

`cd agents_os_v3/ui/scripts && npm run verify:table-contracts` → all checks passed (2026-03-27).
