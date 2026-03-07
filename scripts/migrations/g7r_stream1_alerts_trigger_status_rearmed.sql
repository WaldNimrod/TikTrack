-- G7R Stream 1 — Add 'rearmed' to trigger_status
-- ARCHITECT_GATE7_REMEDIATION_FRAME §3C
-- trigger_status: untriggered | triggered_unread | triggered_read | rearmed
-- Migration doc: "No database enum migration required" — column is VARCHAR, app validates.
-- If g7_M002 added a CHECK that excludes rearmed, drop it. App will enforce allowlist.
-- Many deployments may have no CHECK on trigger_status; this is idempotent.

ALTER TABLE user_data.alerts DROP CONSTRAINT IF EXISTS alerts_trigger_status_check;
