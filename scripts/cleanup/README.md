# Cleanup Utilities Guidelines

This folder stores maintenance utilities that can impact production data. Run them **only** after double-checking the target environment and obtaining explicit approval.

## Files

- `delete-all-cash-flows.py` – removes all cash flow entries via direct DB access.
- `delete-all-cash-flows-http.html` – invokes the HTTP endpoint to purge cash flows.
- `delete-cash-flows-simple.py` – SQLite-based variant of the deletion script.
- `clean-cache-test.sh` – clears cache layers used in QA diagnostics.
- `clear-localStorage.html` – helper page for wiping browser storage during QA sessions.

## Safe-Run Checklist

1. Backup the relevant database or export the affected tables.
2. Verify that the development/staging server is targeted (never run against production).
3. Inform the team via Slack/Ticket and log the execution window.
4. Keep terminals open until the script completes and review console output for errors.
5. Update the maintenance log or relevant documentation with the execution result.

> Files moved here may still be referenced by historical reports. Always point stakeholders to this folder when providing scripts for emergency use.

