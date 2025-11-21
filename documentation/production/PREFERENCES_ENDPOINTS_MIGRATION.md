# Preferences Endpoints Migration & Deprecation

## New/Preferred Endpoints
- `GET /api/preferences/bootstrap` – primary bootstrap (ETag, profile_context, core groups)
- `GET /api/preferences/user` – all preferences (ETag)
- `GET /api/preferences/user/group` – group by name (ETag)
- `GET /api/preferences/user/preference` – single preference (ETag)
- `GET /api/preferences/profiles` – user profiles (ETag)

## Client Usage
All calls must go through `PreferencesData` / `PreferencesCore`. Direct `fetch('/api/preferences/*')` is disallowed.

## Deprecations
- Any legacy endpoints or direct-fetch flows that bypass the data service layer.
- Add CI guard (lint/grep) to enforce.

## Rollout
1. Phase 1: Adopt bootstrap, ETag, SWR on client; keep legacy for compatibility.
2. Phase 2: Enforce profile_context everywhere, deprecate legacy paths.
3. Phase 3: Remove legacy code and enable CI guard blocking direct fetches.



