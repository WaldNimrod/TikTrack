#!/usr/bin/env node
/**
 * KB-84 — precision pass guard (CLI integration, no browser).
 */

import { execFileSync, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PIPELINE = path.join(REPO_ROOT, 'pipeline_run.sh');

function run() {
  const bad = spawnSync(
    PIPELINE,
    ['--domain', 'tiktrack', '--wp', 'S003-P999-WP001', '--gate', 'GATE_3', 'pass'],
    { encoding: 'utf8', cwd: REPO_ROOT }
  );
  const msg = `${bad.stderr || ''}${bad.stdout || ''}`;

  if (bad.status === 0) {
    console.error('PIPELINE_KB84: expected non-zero exit for bogus WP');
    process.exitCode = 1;
    return;
  }
  // After S003-P016 / idle COMPLETE, precision pass may fail earlier with
  // "NO ACTIVE WORK PACKAGE" before WP mismatch text — still a valid block.
  if (!/BLOCKED|mismatch|≠|NO ACTIVE WORK PACKAGE|Cannot pass gate/i.test(msg)) {
    console.error('PIPELINE_KB84: expected guard block message in output, got:\n', msg.slice(0, 800));
    process.exitCode = 1;
    return;
  }

  const status = execFileSync(PIPELINE, ['--domain', 'tiktrack', 'status'], {
    encoding: 'utf8',
    cwd: REPO_ROOT,
  });
  if (!status || status.length < 10) {
    console.error('PIPELINE_KB84: status output too short');
    process.exitCode = 1;
    return;
  }

  console.log('PIPELINE_KB84: PASS (wrong-WP blocked; status readable)');
}

run();
