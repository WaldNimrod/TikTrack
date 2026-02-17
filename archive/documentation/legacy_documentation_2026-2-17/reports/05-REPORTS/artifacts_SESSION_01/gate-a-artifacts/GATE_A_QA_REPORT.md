# Gate A QA Report
**Date:** 2026-02-12T19:46:08.720Z
**Source:** tests/gate-a-e2e.test.js

## Results
- Passed: 9
- Failed: 2
- Skipped: 0

## Scenarios Tested (SSOT/ADR-013 aligned)
1. Type B (Home): Guest stays on Home (no redirect), sees Guest Container only — independent of public_routes
2. Type B: Login → Home → Logged-in Container
3. Type A: No Header on /login, /register, /reset-password
4. Type C: Guest on /trading_accounts → redirect to Home (not /login)
5. Type D: ADMIN accesses /admin/design-system
6. Type D: USER redirected to Home (/) — explicit destination per ADR-013
7. Header Loader runs before React mount — load order assert per ADR-013
8. Header persistence after Login → Home
9. User Icon: assert by CSS class (success/alert), not by physical color — theme-independent
10. 0 SEVERE in console
