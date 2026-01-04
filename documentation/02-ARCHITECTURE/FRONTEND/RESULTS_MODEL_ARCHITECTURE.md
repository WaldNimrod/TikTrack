# Results Model Architecture

## Purpose

The results model standardizes how test execution output is collected, merged, and displayed.

## Source

- File: `trading-ui/scripts/testing/test-results-model.js`

## Core Functions

- `createResult()`: Builds a normalized result object.
- `mergeSummary()`: Aggregates multiple results into a single summary.

## Result Structure

A normalized result should include:

- `workflow`: Human-readable label (e.g., "Trades CRUD")
- `status`: `success` or `failed`
- `error`: error string if failed
- `executionTime`: duration in ms
- `tests`: array of sub-test results with `name`, `status`, and `message`

## Integration Points

- Test Orchestrator writes results using the results model.
- CRUD Testing Dashboard reads results and renders the summary table.

## Acceptance Criteria

- Results are consistent across all test runners.
- Summary rows match the number of executed workflows.
- Merge logic never drops sub-test details.
