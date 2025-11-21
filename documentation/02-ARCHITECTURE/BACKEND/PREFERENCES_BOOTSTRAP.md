# Preferences Bootstrap Architecture

## Overview
Single bootstrap endpoint returns profile_context and core preference groups with a deterministic ETag to enable client-side conditional requests (If-None-Match → 304).

## Endpoint
- GET `/api/preferences/bootstrap`
- Auth: required
- Query:
  - `profile_id` (optional)
  - `use_cache` (default: true)
- Response (200):
  - `data.profile_context`: canonical user/profile context (user, resolved_profile, versions)
  - `data.groups.colors|ui|trading`: group arrays (name, data_type, saved_value, default_value, description)
  - `data.version_hash`: hex string used for ETag
- Headers:
  - `ETag`: same as `data.version_hash`
  - `Cache-Control: no-cache`
- Conditional GET:
  - If request has `If-None-Match` and matches the last ETag → 304 with `ETag` header

## Version Hash (ETag)
Computed from: `user_id`, `resolved_profile_id`, `versions.last_update`, size of returned groups.

## Error Contract
All 4xx/5xx return JSON body:
```
{ "status": "error", "error_code": "...", "message": "...", "details": {...} }
```
429 responses include `Retry-After` when applicable.

## Read Endpoints with ETag
- `/api/preferences/user`
- `/api/preferences/user/group`
- `/api/preferences/user/preference`
- `/api/preferences/profiles`

All attach `profile_context` in the response data and support If-None-Match.

## Optimistic Concurrency (Writes)
Follow-up endpoints accept `If-Match` (optional). On version mismatch → `412 Precondition Failed`.

## Notes
- Use server-side request coalescing for frequent keys to avoid stampedes.
- Keep error schema consistent across endpoints. 



