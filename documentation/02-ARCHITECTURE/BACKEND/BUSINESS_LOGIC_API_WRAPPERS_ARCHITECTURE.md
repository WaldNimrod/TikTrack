# Business Logic API Wrappers Architecture

## Purpose

Defines the architecture for frontend business logic API wrappers that sit between UI components and backend endpoints.

## Source

- Wrappers: `trading-ui/scripts/services/*-data.js`
- Examples: `trading-ui/scripts/services/trades-data.js`, `trading-ui/scripts/services/alerts-data.js`

## Responsibilities

- Encapsulate API calls with consistent request patterns.
- Enforce validation and normalization before sending payloads.
- Integrate caching and TTL guards where required.

## Integration Points

- Cache TTL Guard: `trading-ui/scripts/cache-ttl-guard.js`
- Unified Cache Manager: `trading-ui/scripts/unified-cache-manager.js`
- API fetch wrapper: `trading-ui/scripts/api-fetch-wrapper.js`

## Usage Pattern

1) UI calls a wrapper function (e.g., `TradesData.createTrade`).
2) Wrapper validates inputs and applies defaults.
3) Wrapper calls API through fetch wrapper with cache controls.
4) Response normalized and returned to UI.

## Acceptance Criteria

- All wrappers use the same API fetch wrapper.
- All wrappers apply cache policy consistently.
- No direct UI component calls the backend without a wrapper.
