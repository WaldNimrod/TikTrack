# KB-015 MoV Transcript (Ruleset Enforcement)

## Commands

```bash
curl -H "Authorization: Bearer ***" https://api.github.com/repos/WaldNimrod/TikTrack/rules/branches/main
curl -H "Authorization: Bearer ***" https://api.github.com/repos/WaldNimrod/TikTrack/rules/branches/tmp-check
```

## Observed Results

1. `main` returned non-empty rules array including `required_status_checks`.
2. `tmp-check` returned `[]` (no policy spillover).
3. Required contexts present:
   - `Backend Tests & Security`
   - `Frontend Build & Lint`
4. Strict mode present: `strict_required_status_checks_policy=true`.

## Interpretation

Ruleset-based merge gate is active for `main` and enforces the two CI checks.
