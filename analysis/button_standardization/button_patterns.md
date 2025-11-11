# Button Standardization Patterns

## Sort (SORT)
- Use `data-button-type="SORT"` with `data-variant="full"` to combine icon + label.
- Required attributes: `data-onclick="window.sortTable('tableType', columnIndex)"`, `data-text="עמודת תצוגה"`, `data-icon="↕️"`.
- Recommended helper: `createSortButtonHelper(container, onClick, classes, attributes, text)` from `trading-ui/scripts/button-helpers.js`.
- Event routing: relies on `window.sortTable` / `window.sortTableData` via the global event handler system.

## Section Toggle (TOGGLE)
- Use `data-button-type="TOGGLE"` with `data-variant="small"` for icon-only buttons.
- Required attributes: `data-onclick="toggleSection('section-id')"`, optional `title` for accessibility.
- Helper: `createToggleButtonHelper(container, onClick, title, classes)` which injects icon `▼` automatically.
- Event routing: leverages `SectionToggleSystem` through existing `toggleSection` global.

## Filter Actions (FILTER / SECONDARY)
- Use `data-button-type="FILTER"` for filter chips or secondary filter actions.
- Suggested variants:
  - `data-variant="full"` when text + icon needed.
  - `data-variant="small"` for icon-only quick filters.
- Helper: `createFilterButtonHelper(container, onClick, text, options)` supporting custom `title`, `variant`, and icon override (defaults to `🔍`).
- For cancel/reset style actions keep `data-button-type="SECONDARY"` with `data-variant="full"` (text only) to avoid icon duplication.

## Primary CRUD Actions (ADD / SAVE / DELETE / CANCEL / LINK)
- Buttons already supported by Button System; ensure variant matches design:
  - Table actions: use `data-variant="small"` for `DELETE`, `EDIT`, `LINK`, `CANCEL` (icon-only).
  - Form actions: use `data-variant="full"` to display icon + label.
- Helper utilities (`createEditButtonHelper`, `createDeleteButtonHelper`, `createCancelButtonHelper`, `createLinkButtonHelper`) updated to forward variant + icon consistently.

## Dynamic Generation Guidelines
- Prefer helper functions in `button-helpers.js`; they call `window.addDynamicButton` which now supports variant + icon forwarding.
- When constructing HTML directly, follow this structure:
  ```html
  <button
    data-button-type="SORT"
    data-variant="full"
    data-icon="↕️"
    data-text="שם"
    data-onclick="window.sortTable('trading_accounts', 0)"
    data-classes="btn-link sortable-header">
  </button>
  ```
- Always replace legacy `onclick` attributes with `data-onclick` so the Event Handler Manager can wire listeners centrally.
- Preserve accessibility: include `title` or tooltip attributes for icon-only buttons, and respect the unified tooltip system when richer hints are required.

## Event Handling Notes
- `window.addDynamicButton` signature expanded: `(container, type, onClick, classes, attributes, text, id, variant, icon)` allowing helpers to define the right visual pattern.
- `window.updateButton` mirrors the same signature for future dynamic updates.
- All patterns assume Button System processes the placeholder and injects final markup; do not mix direct `btn btn-link` markup with processed buttons on the same element.

