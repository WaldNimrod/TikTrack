# Preferences Client Guide

## Goals
- One orchestrated initialization (bootstrap barrier).
- Conditional requests via ETag/If-None-Match; support 304.
- SWR: serve cache immediately, refresh in background, emit events.
- Centralized access (PreferencesData/Core). No direct fetch(`/api/preferences/*`).

## Initialization Flow
1) `PreferencesUI.bootstrap()` → GET `/api/preferences/bootstrap` (ETag)
   - Seeds `profile_context` and core groups.
   - Dispatches `preferences:bootstrap:ready`.
2) `PreferencesUI.initialize()`:
   - Confirms/updates context via `PreferencesData.loadProfiles()`
   - Initializes LazyLoader if present
   - Loads all preferences (single path)

## Using PreferencesData
```js
// Single preference
const { value } = await PreferencesData.loadPreference({ preferenceName: 'pageSize' });

// Group
const group = await PreferencesData.loadPreferenceGroup({ groupName: 'trading' });

// All preferences (raw normalized)
const { preferences, profileContext } = await PreferencesData.loadAllPreferencesRaw();
```

ETag handling is automatic:
- Client stores ETag per URL and sends `If-None-Match`.
- On 304, returns `{ status: 304, fromCache: true }` path to callers (who use cache).

## Events
- `preferences:bootstrap:ready`
- `preferences:updated`
- `preferences:changed(name)` (reserved)

## Rate Limiting
- Dedupe concurrent in-flight requests.
- Backoff with jitter for 429 + short circuit-breaker window.

## Do / Don’t
- Do: Use `PreferencesData` / `PreferencesCore` for all interactions.
- Don’t: Use direct `fetch('/api/preferences/...')`.
- Do: Listen to events to refresh UI selectively.



