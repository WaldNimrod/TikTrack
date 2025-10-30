Title: test-header-only – Preferences Package Integration

Overview
The test-header-only page validates the unified header and filter system. To enable Reset Filters to load user defaults, the Preferences package must be available so window.getPreference exists.

Why needed
- header-system.js uses getPreference in resetAllFilters()
- Without Preferences, Reset should not apply defaults and must show an error per rules

Required scripts (Preferences Package)
- scripts/preferences-core-new.js
- scripts/preferences-lazy-loader.js (optional, improves staged loading/caching)

Loading order for this page
- BASE → PREFERENCES → INIT-SYSTEM → PAGE

Generated script tags (PageTemplateGenerator)
The generator should emit the two Preferences scripts between BASE and INIT-SYSTEM for page test-header-only.

Manual snippet (for reference only)
<script src="scripts/preferences-core-new.js?v=..."></script>
<script src="scripts/preferences-lazy-loader.js?v=..."></script>

Notes
- Do not fall back to default UI values if Preferences is unavailable; show a clear error via notification system.
- Keep ITCSS and no inline styles.


