# Implementing Preferences – Developer How-To

## Define Preference Type
- Add a row to `preference_types` with:
  - `preference_name` (unique), `data_type` (string|number|boolean|json|color),
  - `group_id`, `default_value`, `is_required`, `description`.

## Read on Backend
- All read endpoints attach `profile_context`.
- ETag is generated from the latest update and payload size.
- Respect `If-None-Match` (304) to reduce payloads.

## Read on Frontend
Use `PreferencesData` only:
```js
const { value } = await PreferencesData.loadPreference({ preferenceName: 'pageSize' });
const trading = await PreferencesData.loadPreferenceGroup({ groupName: 'trading' });
const { preferences } = await PreferencesData.loadAllPreferencesRaw();
```
SWR: UI should accept cached values and update when `preferences:updated` fires.

## Write
- Use `PreferencesCore.savePreference` or `PreferencesData.savePreferences`.
- After write, caches are cleared via `UnifiedCacheManager` and the UI reloads preferences.
- (Optional) If-Match for optimistic concurrency.

## UI Integration
- Initialize: `PreferencesUI.initialize()`; it calls the bootstrap barrier first.
- Update UI using events and `PreferencesUI.updateGlobalPreferences(...)`.

## Error & Rate Limits
- Server returns JSON errors: `{ status, error_code, message, details }`.
- Client dedupes, backs off (jitter), and uses a short circuit breaker.



