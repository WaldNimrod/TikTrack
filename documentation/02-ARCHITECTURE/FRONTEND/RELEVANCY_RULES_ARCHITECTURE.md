# Relevancy Rules Architecture

## Purpose

Relevancy rules ensure only tests that apply to the current page or entity context are executed. This reduces noise and improves performance.

## Source of Truth

- File: `trading-ui/scripts/test-relevancy-rules.js`
- Object: `RELEVANCY_RULES`

## Structure

- Rules are grouped by page or entity context.
- Each rule is a predicate function or a list of allowed test identifiers.
- The Test Orchestrator applies these rules before execution.

## Runtime Application

- File: `trading-ui/scripts/testing/test-orchestrator.js`
- Flow:
  1) Load `RELEVANCY_RULES`.
  2) Determine current page context.
  3) Filter registry entries using the rules.
  4) Execute only the matching tests.

## Performance Impact

- Relevancy filtering reduces total test execution time by skipping irrelevant tests.
- Expected improvement: 40-60% reduction in unnecessary runs when browsing single pages.

## Update Guidelines

- When adding a new page:
  - Add a new entry to `RELEVANCY_RULES`.
  - Define which tests are relevant to that page.
- When adding a new test:
  - Add it to the registry.
  - Update the relevant rule sets to include it.

## Acceptance Criteria

- No test should execute on a page where it is not relevant.
- All relevant tests must execute when the page is active.
- Orchestrator filtering must not throw exceptions for unknown pages.
