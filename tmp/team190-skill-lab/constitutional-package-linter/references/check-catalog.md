# Check Catalog

## Active Checks

| Check | Severity | Trigger | Description |
|---|---|---|---|
| `CPL-001` | BLOCKER | any markdown file | Missing canonical date field. |
| `CPL-002` | BLOCKER | any markdown file with date | Date is later than current UTC day. |
| `CPL-003` | HIGH | file with `Mandatory Identity Header` and `phase_owner` row | `phase_owner` value is placeholder. |
| `CPL-004` | HIGH | revalidation/remediation/resubmission-like file | `correction_cycle` missing. |
| `CPL-005` | HIGH | validation-result-like file | findings table missing `evidence-by-path` or `evidence_by_path`. |
| `CPL-006` | HIGH | validation-result-like file | findings table missing `route_recommendation`. |

## Trigger Heuristics

### Revalidation-like

Triggered when file text or name includes:

1. `revalidation`
2. `remediation`
3. `resubmission`

### Validation-result-like

Triggered when file text or name includes:

1. `validation_result`
2. `validation result`
3. `validation_findings`
4. findings-table header cells such as `finding_id`, `severity`, `status`

## Placeholder Values

Currently blocked placeholders:

1. `RECEIVING_TEAM`
2. empty string
3. `TBD`
4. `N/A` for `phase_owner`

Expand this list only with new evidence.
