date: 2026-03-14

╔══════════════════════════════════════════════════════════════╗
║  GATE_7 — UX SIGN-OFF              S001-P002-WP001            ║
╚══════════════════════════════════════════════════════════════╝

Feature: S001-P002 WP001: Alerts Summary Widget on D15.I home dashboard. Read-only frontend component. Triggered-unread count badge + list of N=5 most recent, fully hidden when 0. Uses existing GET /api/v1/alerts/ endpoint. Per-alert: ticker symbol · condition label · triggered_at relative time. Click item → D34. Click badge → D34 filtered unread. collapsible-container Iron Rule. maskedLog mandatory. No new backend, no schema changes.

────────────────────────────────────────────────────────────
  TEST CHECKLIST  (4 scenarios)
────────────────────────────────────────────────────────────

  □ 1. D15 — Feature renders
       URL:    http://localhost:8080/
       Steps:  → Open http://localhost:8080/
         → Verify unread count badge is visible and non-zero
         → Verify list shows ≤5 most-recent alerts
       Pass:   ✓ Page loads without errors
         ✓ Badge shows correct triggered-unread count
         ✓ List renders ≤5 items, ordered by recency

  □ 2. D15 — Hidden when empty
       URL:    http://localhost:8080/
       Steps:  → Open http://localhost:8080/
         → Ensure zero triggered-unread alerts exist (or clear test data)
         → Verify widget is fully hidden / not rendered
       Pass:   ✓ Widget element absent or display:none / visibility:hidden
         ✓ No empty container or placeholder shown

  □ 3. D15 → D34  [click item]
       URL:    http://localhost:8080/
       Steps:  → Open http://localhost:8080/
         → Click: item
         → Verify browser navigates to http://localhost:8080/alerts
       Pass:   ✓ Browser navigates to D34 (http://localhost:8080/alerts)

  □ 4. D15 → D34  [click badge [filtered unread]]
       URL:    http://localhost:8080/
       Steps:  → Open http://localhost:8080/
         → Click: badge
         → Verify browser navigates to http://localhost:8080/alerts
       Pass:   ✓ Browser navigates to D34 (http://localhost:8080/alerts)
         ✓ Page shows filtered view (triggered_unread alerts only)

────────────────────────────────────────────────────────────
  COMMANDS
────────────────────────────────────────────────────────────

  All scenarios pass:
    ./pipeline_run.sh pass

  Issues found:
    ./pipeline_run.sh fail "UX-001: [describe issue]"
    ./pipeline_run.sh fail "UX-001: badge missing; UX-002: D34 nav broken"
