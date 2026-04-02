date: 2026-04-02
historical_record: true

# ⚠️ REMEDIATION MANDATE — S003-P003-WP001 (Cycle #1)

**Spec:** System Settings — D39 (User Preferences), D40 (Admin Trading Hours + Scheduling), D41 (User Management)

**Canonical date:** Use `date -u +%F` for today.

────────────────────────────────────────────────────────────
  ⛔  DO NOT RE-IMPLEMENT FROM SCRATCH
  ⛔  DO NOT open `implementation_mandates.md`
  ✅  Fix ONLY the items listed in §2 below
────────────────────────────────────────────────────────────

## §1 — Context

- **Failed gate:** unknown
- **Remediation cycle:** #1

## §2 — Blocking Findings (your ONLY scope)

(no findings recorded — read verdict file manually)

## §3 — Your Tasks

For each BF item:
1. Identify the exact file and function responsible
2. Make the minimal targeted fix
3. Confirm the fix addresses the specific evidence cited

## §4 — Non-Scope (DO NOT TOUCH)

Any component not named in §2 is OUT OF SCOPE.
If a fix requires touching out-of-scope code, STOP and report to Team 00.

## §5 — Completion

When all BF items are fixed:
`./pipeline_run.sh --domain tiktrack pass`
