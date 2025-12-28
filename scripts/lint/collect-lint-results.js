#!/usr/bin/env node
/**
 * TikTrack Lint Results Collector
 *
 * Runs the project linting toolchain (ESLint, Stylelint, HTMLHint, Prettier)
 * and stores a normalized report that the frontend dashboard can consume.
 *
 * Output files:
 *   - reports/linter/latest.json
 *   - reports/linter/history.json
 */

const { spawnSync } = require('child_process');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { performance } = require('perf_hooks');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'linter');
const LATEST_FILE = path.join(REPORTS_DIR, 'latest.json');
const HISTORY_FILE = path.join(REPORTS_DIR, 'history.json');
const HISTORY_LIMIT = 20;

/**
 * Utility to run CLI commands and capture stdout/stderr.
 * @param {object} task
 * @returns {{status: string, exitCode: number, stdout: string, stderr: string, durationMs: number}}
 */
function runTask(task) {
  const start = performance.now();
  const options = {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    shell: task.shell === true,
    maxBuffer: 1024 * 1024 * 10,
  };

  const result = spawnSync(task.command, task.args, options);
  const durationMs = Math.round(performance.now() - start);

  if (result.error) {
    return {
      status: 'error',
      exitCode: result.status ?? 1,
      stdout: result.stdout || '',
      stderr: result.error.message,
      durationMs,
    };
  }

  return {
    status: result.status === 0 ? 'ok' : 'failed',
    exitCode: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    durationMs,
  };
}

/**
 * Parse ESLint JSON output.
 */
function parseEslint(execution) {
  const output = execution.stdout || '';
  if (!output.trim()) {
    return { issues: [], summary: { files: 0, errors: 0, warnings: 0 } };
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse ESLint JSON: ${error.message}`);
  }

  const issues = [];
  let errorCount = 0;
  let warningCount = 0;

  parsed.forEach((fileResult) => {
    (fileResult.messages || []).forEach((message) => {
      const severityLabel = message.severity === 2 ? 'error' : 'warning';
      if (severityLabel === 'error') {
        errorCount += 1;
      } else {
        warningCount += 1;
      }

      issues.push({
        file: fileResult.filePath,
        line: message.line || 0,
        column: message.column || 0,
        rule: message.ruleId || 'unknown',
        severity: severityLabel,
        message: message.message,
      });
    });
  });

  return {
    issues,
    summary: {
      files: parsed.length,
      errors: errorCount,
      warnings: warningCount,
    },
  };
}

/**
 * Parse Stylelint JSON output.
 */
function parseStylelint(execution) {
  const output = execution.stdout || '';
  if (!output.trim()) {
    return { issues: [], summary: { files: 0, errors: 0, warnings: 0 } };
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse Stylelint JSON: ${error.message}`);
  }

  const issues = [];
  let errorCount = 0;
  let warningCount = 0;

  parsed.forEach((fileResult) => {
    (fileResult.warnings || []).forEach((warning) => {
      const severityLabel = warning.severity === 'error' ? 'error' : 'warning';
      if (severityLabel === 'error') {
        errorCount += 1;
      } else {
        warningCount += 1;
      }

      issues.push({
        file: fileResult.source,
        line: warning.line || 0,
        column: warning.column || 0,
        rule: warning.rule || 'unknown',
        severity: severityLabel,
        message: warning.text,
      });
    });
  });

  return {
    issues,
    summary: {
      files: parsed.length,
      errors: errorCount,
      warnings: warningCount,
    },
  };
}

/**
 * Parse HTMLHint JSON output.
 */
function parseHtmlhint(execution) {
  const output = execution.stdout || '';
  if (!output.trim()) {
    return { issues: [], summary: { files: 0, errors: 0, warnings: 0 } };
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse HTMLHint JSON: ${error.message}`);
  }

  const issues = [];
  let errorCount = 0;
  let warningCount = 0;

  parsed.forEach((fileResult) => {
    (fileResult.messages || []).forEach((message) => {
      const severityLabel = message.type === 'error' ? 'error' : 'warning';
      if (severityLabel === 'error') {
        errorCount += 1;
      } else {
        warningCount += 1;
      }

      issues.push({
        file: fileResult.file,
        line: message.line || 0,
        column: message.col || 0,
        rule: message.rule?.id || 'unknown',
        severity: severityLabel,
        message: message.message,
      });
    });
  });

  return {
    issues,
    summary: {
      files: parsed.length,
      errors: errorCount,
      warnings: warningCount,
    },
  };
}

/**
 * Parse Prettier output (text only).
 */
function parsePrettier(execution) {
  const result = execution;
  const { exitCode, stdout, stderr } = result;

  if (exitCode === 0) {
    return {
      issues: [],
      summary: {
        files: 0,
        errors: 0,
        warnings: 0,
      },
    };
  }

  const combinedOutput = `${stdout}\n${stderr}`.trim();
  const issues = [];

  combinedOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line) => {
      // Prettier prints paths followed by details
      const match = line.match(/^(.*\.(js|jsx|ts|tsx|css|scss|html))$/i);
      if (match) {
        issues.push({
          file: match[1],
          line: 0,
          column: 0,
          rule: 'prettier',
          severity: 'warning',
          message: 'Formatting mismatch',
        });
      }
    });

  const summary = {
    files: issues.length,
    errors: 0,
    warnings: issues.length,
  };

  if (issues.length === 0) {
    // If parsing failed, surface the entire message as a single issue.
    issues.push({
      file: 'N/A',
      line: 0,
      column: 0,
      rule: 'prettier',
      severity: 'warning',
      message: combinedOutput || 'Prettier reported formatting differences',
    });
    summary.warnings = 1;
  }

  return { issues, summary };
}

/**
 * Ensure target directory exists.
 */
function ensureReportsDir() {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

/**
 * Load limited history.
 */
function loadHistory() {
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }

  try {
    const raw = readFileSync(HISTORY_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist history (capped).
 */
function saveHistory(history) {
  const trimmed = history.slice(-HISTORY_LIMIT);
  writeFileSync(HISTORY_FILE, `${JSON.stringify(trimmed, null, 2)}\n`, 'utf-8');
}

async function main() {
  ensureReportsDir();

  const tasks = [
    {
      id: 'eslint',
      label: 'ESLint',
      command: 'npx',
      args: [
        'eslint',
        'trading-ui/scripts/linter-realtime-monitor.js',
        'trading-ui/scripts/services/lint-status-service.js',
        '--format',
        'json',
      ],
      shell: false,
      parser: parseEslint,
    },
    {
      id: 'stylelint',
      label: 'Stylelint',
      command: 'npx',
      args: [
        'stylelint',
        '--config',
        'scripts/lint/stylelint-lint-monitor.config.cjs',
        'trading-ui/styles-new/06-components/_linter-realtime-monitor.css',
        '--custom-syntax',
        'postcss-scss',
        '--formatter',
        'json',
        '--allow-empty-input',
      ],
      shell: false,
      parser: parseStylelint,
    },
    {
      id: 'htmlhint',
      label: 'HTMLHint',
      command: 'npx',
      args: ['htmlhint', 'trading-ui/code_quality_dashboard.html', '--format', 'json'],
      shell: false,
      parser: parseHtmlhint,
    },
    {
      id: 'prettier',
      label: 'Prettier',
      command: 'npx',
      args: [
        'prettier',
        '--check',
        'trading-ui/scripts/linter-realtime-monitor.js',
        'trading-ui/scripts/services/lint-status-service.js',
        'trading-ui/code_quality_dashboard.html',
        'trading-ui/styles-new/06-components/_linter-realtime-monitor.css',
      ],
      shell: false,
      parser: parsePrettier,
    },
  ];

  const taskResults = [];

  for (const task of tasks) {
    const execution = runTask(task);
    let parsedResult;

    try {
    parsedResult = task.parser(execution);
    } catch (error) {
      parsedResult = {
        issues: [],
        summary: {
          files: 0,
          errors: 0,
          warnings: 0,
        },
        parserError: error.message,
      };
      execution.status = 'error';
      execution.stderr = `${execution.stderr}\n${error.message}`.trim();
    }

    const issuesCount = parsedResult.issues ? parsedResult.issues.length : 0;
    const summary = parsedResult.summary || { errors: 0, warnings: 0 };
    const hasErrors = summary.errors > 0;
    const onlyWarnings = summary.errors === 0 && summary.warnings > 0;
    const exitIndicatesFailure = execution.exitCode !== 0 && !onlyWarnings;

    const status =
      execution.status === 'error'
        ? 'error'
        : hasErrors || exitIndicatesFailure
          ? 'failed'
          : onlyWarnings || issuesCount > 0
            ? 'warning'
            : 'passed';

    taskResults.push({
      id: task.id,
      label: task.label,
      status,
      exitCode: execution.exitCode,
      durationMs: execution.durationMs,
      issues: parsedResult.issues || [],
      summary: parsedResult.summary || null,
      stdout: execution.stdout,
      stderr: execution.stderr,
      parserError: parsedResult.parserError || null,
    });
  }

  const totals = taskResults.reduce(
    (acc, item) => {
      acc.tools += 1;
      if (item.status === 'passed') acc.passed += 1;
      if (item.status === 'warning') acc.warning += 1;
      if (item.status === 'failed') acc.failed += 1;
      if (item.status === 'error') acc.error += 1;
      acc.issues += item.issues.length;
      acc.errors += item.summary?.errors || 0;
      acc.warnings += item.summary?.warnings || 0;
      return acc;
    },
    {
      tools: 0,
      passed: 0,
      warning: 0,
      failed: 0,
      error: 0,
      issues: 0,
      errors: 0,
      warnings: 0,
    },
  );

  const report = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    totals,
    tasks: taskResults,
  };

  writeFileSync(LATEST_FILE, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');

  const history = loadHistory();
  history.push(report);
  saveHistory(history);

  const hasFailure = taskResults.some((task) => task.status === 'failed' || task.status === 'error');
  if (hasFailure) {
    console.error('Lint collection completed with failures. See reports/linter/latest.json for details.');
    process.exit(1);
  } else {
    console.log('Lint collection completed successfully. Latest report written to reports/linter/latest.json.');
  }
}

main().catch((error) => {
  console.error('Unexpected failure in lint collector:', error);
  process.exit(1);
});

