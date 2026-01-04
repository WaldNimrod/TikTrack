# Logger Service Architecture

## Purpose

Defines the architecture and usage patterns for the centralized Logger Service used across frontend systems and test instrumentation.

## Source

- File: `trading-ui/scripts/logger-service.js`

## Responsibilities

- Normalize log events into a consistent structure.
- Support log levels: info, warn, error, debug.
- Provide batching and persistence for reliable delivery.

## Integration Patterns

- Testing code must use `window.Logger` for all evidence capture.
- UI error display should read `result.error` or `result.message` from logged results.
- Avoid `console.log` for user-facing errors.

## Key Concepts

- `runId`: Identifies a test run or workflow step.
- `sessionId`: Identifies a user session or scenario.
- `hypothesisId`: Used to label diagnostic experiments.

## Acceptance Criteria

- Logger is available before any test execution starts.
- All testing evidence is recorded through Logger.
- Logs include enough metadata to reproduce issues.
