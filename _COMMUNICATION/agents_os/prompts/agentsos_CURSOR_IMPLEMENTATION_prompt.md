# ⚠️ REMEDIATION MANDATE — S003-P011-WP001 (Cycle #2)

**date:** 2026-03-19

**Spec:** Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

**Canonical date:** Use `date -u +%F` for today.

────────────────────────────────────────────────────────────
  ⛔  DO NOT RE-IMPLEMENT FROM SCRATCH
  ⛔  DO NOT open `implementation_mandates.md`
  ✅  Fix ONLY the items listed in §2 below
────────────────────────────────────────────────────────────

## §1 — Context

- **Failed gate:** unknown
- **Remediation cycle:** #2

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
`./pipeline_run.sh --domain agents_os pass`
