# Developer Workflow Guide

## Overview

This guide explains how to use the code quality tools we've created in your daily development workflow.

## Quick Start

### Daily Development Flow

1. **Before Starting Work**

   ```bash
   # Run all validators
   node scripts/monitors/error-handling-monitor.js
   node scripts/monitors/jsdoc-coverage.js
   node scripts/monitors/naming-conventions-validator.js
   ```

2. **During Development**
   - Write code following the Error Handling Guide
   - Add JSDoc to new functions
   - Follow naming conventions
   - Test your changes

3. **Before Commit**

   ```bash
   # Re-run validators
   node scripts/monitors/error-handling-monitor.js
   node scripts/monitors/jsdoc-coverage.js
   ```

4. **After Commit**
   - Check reports in `reports/` directory
   - Review any violations
   - Fix issues if needed

## Available Tools

### 1. Error Handling Coverage Monitor

**Purpose**: Checks try-catch coverage in all functions

**Usage**:

```bash
node scripts/monitors/error-handling-monitor.js
```

**Output**:

- Console summary
- Report in `reports/error-handling-coverage-*.json`
- Markdown report in `reports/error-handling-coverage-*.md`

**When to use**:

- Before committing changes
- After adding new functions
- When reviewing code

### 2. JSDoc Coverage Reporter

**Purpose**: Checks JSDoc documentation coverage

**Usage**:

```bash
node scripts/monitors/jsdoc-coverage.js
```

**Output**:

- Console summary
- Report in `reports/jsdoc-coverage-*.json`
- Markdown report in `reports/jsdoc-coverage-*.md`

**When to use**:

- Before committing changes
- After adding new functions
- During code review

### 3. Function Index Generator

**Purpose**: Automatically generates Function Index in code files

**Usage**:

```bash
node scripts/generators/generate-function-index.js
```

**Output**:

- Updates all core pages with Function Index at the top
- Categories functions automatically

**When to use**:

- After adding many new functions
- When reorganizing code
- Before major releases

### 4. Naming Conventions Validator

**Purpose**: Checks naming convention compliance

**Usage**:

```bash
node scripts/monitors/naming-conventions-validator.js
```

**Output**:

- Console summary of violations
- Report in `reports/naming-conventions-*.json`
- Markdown report in `reports/naming-conventions-*.md`

**When to use**:

- Before committing changes
- When reviewing naming consistency
- After large refactoring

## Development Checklists

### New Feature Development

- [ ] Write function with error handling (try-catch)
- [ ] Add JSDoc documentation
- [ ] Follow naming conventions
- [ ] Test the function
- [ ] Run error handling monitor
- [ ] Run JSDoc coverage reporter
- [ ] Fix any violations
- [ ] Update Function Index if needed

### Code Review

- [ ] Run all validators
- [ ] Check error handling coverage
- [ ] Check JSDoc coverage
- [ ] Check naming conventions
- [ ] Review reports
- [ ] Suggest improvements
- [ ] Approve or request changes

### Bug Fix

- [ ] Reproduce the bug
- [ ] Identify the root cause
- [ ] Add error handling if missing
- [ ] Fix the bug
- [ ] Add test case
- [ ] Run validators
- [ ] Update documentation if needed

## Best Practices

### 1. Run Validators Regularly

Don't wait until commit time to run validators. Run them frequently during development:

```bash
# Quick check during development
node scripts/monitors/error-handling-monitor.js | head -20
```

### 2. Fix Issues Incrementally

Don't try to fix all violations at once. Fix them as you work on related code.

### 3. Use Reports for Planning

Review reports to plan your work:

```bash
# Check which files need work
cat reports/error-handling-coverage-*.md | grep "⚠️"
```

### 4. Automate with Git Hooks

Set up pre-commit hooks to run validators automatically (see Pre-Commit Hook Setup).

## Common Workflows

### Workflow 1: Adding New Function

1. Add function with try-catch
2. Add JSDoc documentation
3. Test the function
4. Run error handling monitor
5. Fix any issues
6. Commit

### Workflow 2: Refactoring Existing Code

1. Run all validators to get baseline
2. Make refactoring changes
3. Run validators again
4. Compare results
5. Fix any new violations
6. Update Function Index if needed
7. Commit

### Workflow 3: Code Review

1. Pull latest code
2. Run all validators
3. Check reports
4. Review code changes
5. Request fixes if needed
6. Approve after fixes

## Integration with IDE

### VS Code Integration

Add to `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Run Error Handling Monitor",
            "type": "shell",
            "command": "node scripts/monitors/error-handling-monitor.js",
            "group": "test"
        },
        {
            "label": "Run JSDoc Coverage",
            "type": "shell",
            "command": "node scripts/monitors/jsdoc-coverage.js",
            "group": "test"
        },
        {
            "label": "Run All Validators",
            "dependsOn": ["Run Error Handling Monitor", "Run JSDoc Coverage"],
            "group": "test"
        }
    ]
}
```

### Pre-Commit Hook Setup

Create `.husky/pre-commit`:

```bash
#!/bin/sh
# Run validators before commit
echo "Running code quality checks..."

node scripts/monitors/error-handling-monitor.js
node scripts/monitors/jsdoc-coverage.js
node scripts/monitors/naming-conventions-validator.js

if [ $? -ne 0 ]; then
    echo "❌ Quality checks failed. Please fix issues before committing."
    exit 1
fi

echo "✅ All quality checks passed!"
```

## Troubleshooting

### Validators Not Running

Check that Node.js is installed:

```bash
node --version
```

### Reports Not Generated

Check that `reports/` directory exists:

```bash
mkdir -p reports
```

### False Positives

Some patterns might be flagged incorrectly. Review the code and adjust validators if needed.

## Resources

- [Error Handling Guide](./error-handling-guide.md)
- [JSDoc Style Guide](../../06-CODING_STANDARDS/jsdoc-style-guide.md)
- [Naming Conventions Guide](../../06-CODING_STANDARDS/naming-conventions-guide.md)
- [Function Index Guide](./function-index-guide.md)

## Support

For questions or issues:

1. Check the relevant guide
2. Review the tool's source code
3. Ask the team
