# Active Alerts Component

## Overview
The Active Alerts component (`trading-ui/scripts/active-alerts-component.js`) renders the unread alert cards on pages such as `executions.html`. The component is fully standardised and relies on existing general systems. It no longer ships with dummy data or inline styles and follows the ITCSS architecture (`trading-ui/styles-new/06-components/_notifications.css`).

## Responsibilities
- Fetch unread alerts from `/api/alerts/unread` and resolve their linked entities (account, trade, trade plan, ticker) through the unified linked-items caches.
- Render alert cards using `FieldRendererService` and `LinkedItemsService` so that entity badges, amounts, dates, statuses, sides, and investment types match the table rendering.
- Provide a unified filter bar (All + entity types) using `generateAllFilterButton`, `generateEntityTypeFilterButtons`, and `ActiveAlertsFilterRouter`.
- Use `EventHandlerManager` + `data-onclick` for all interactions, including mark-as-read and the details button, and initialise buttons via `processButtons`.
- Apply dynamic colour themes via the Dynamic Colors system (`getEntityBackgroundColor`, `getEntityBorderColor`, `getEntityTextColor`) with CSS variables to give each card the correct “light” variant.
- Render alert conditions via `AlertConditionRenderer.renderConditionText` (fallbacks to `translateConditionFields` and `condition_display_text`) so financial values respect localisation and formatting rules.
- Surface errors and status updates through the global Notification System and log via `LoggerService`.

## Data Flow
1. `connectedCallback` triggers `render()` and `loadActiveAlerts()`.
2. `loadActiveAlerts()` fetches unread alerts, clears counts, and hydrates with related entities by calling:
   - `/api/trading-accounts/`
   - `/api/trades/`
  - `/api/trade-plans/`
   - `/api/tickers/`
3. Alerts are cached in-memory (`this.alerts`) and filtered through `ActiveAlertsFilterRouter`.
4. `renderAlerts()` generates DOM nodes programmatically and injects them into the list container (`<div data-role="list">`).

## Rendering Details
- **Header**: icon + title + live count badge + filter container (`.active-alerts__filters`).
- **Card structure** (`<article class="active-alerts__card">`):
  - Header row: entity meta text from `FieldRendererService.renderLinkedEntity` and an icon-only details button (`data-button-type="VIEW"`, `window.showEntityDetails`).
  - Body rows: condition text, alert message, last triggered timestamp, and actions (mark as read).
  - The card carries `data-entity-type` and gets dynamic CSS variables via `applyEntityColorTheme`.
- All interactive elements use `data-onclick` and are registered through the component’s local event delegation (`EventHandlerManager`).

## Styling
- Styles live in `_notifications.css` under the components layer.
- Card layout uses `flex: 1 1 clamp(220px, 25%, 50%)` with `max-width: 50%`, supporting up to four cards per row while respecting responsive breakpoints defined in the global design system.
- Rounded corners and shadows reuse Apple-style CSS variables (`--apple-radius-large`, `--apple-shadow-light`).
- Filters share the unified filter button aesthetics and apply `.is-active`/`[disabled]` states without inline overrides.

## Error Handling & Logging
- All fetches use `LoggerService` (`this.log(level, message, context)`) for observability.
- User-facing issues (API failures, missing linked data) are displayed via `NotificationService` (success/error/warning/info variants).
- The component never injects placeholder or fallback numbers: missing data is surfaced as “לא זמין” with an error notification per Rule 48.

## Integration Notes
- To embed the component, include `<active-alerts></active-alerts>` after the unified header has initialised. The component auto-loads once the unified init system completes the `UI-ADVANCED` stage.
- Ensure the required script bundles are loaded: `active-alerts-component.js`, `FieldRendererService`, `LinkedItemsService`, `AlertConditionRenderer`, `translation-utils.js`, `date-utils.js`, `Button System`, and `EventHandlerManager`.
- Filters rely on `related-object-filters.js` (`generateEntityTypeFilterButtons`, `ActiveAlertsFilterRouter`). Confirm that `ui-advanced` package is present in `package-manifest.js` for the page.
- The component respects the global cache clearing behaviour (hard reload after cache purge). No additional hooks are required.

