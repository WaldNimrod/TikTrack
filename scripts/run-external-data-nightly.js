#!/usr/bin/env node
/**
 * External Data — Nightly Full Suite (A, B, C, D, E)
 * TEAM_90_DIRECTIVE: All suites with mode=REPLAY
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const suites = [
  { name: 'A: Contract & Schema', cmd: 'python3', args: ['tests/external_data_suite_a_contract_schema.py'] },
  { name: 'B: Cache-First + Failover', cmd: 'python3', args: ['tests/external_data_suite_b_cache_failover.py'] },
  { name: 'C: Cadence & Status', cmd: 'python3', args: ['tests/external_data_suite_c_cadence.py'] },
  { name: 'D: Retention & Cleanup', cmd: 'python3', args: ['tests/external_data_suite_d_retention.py'] },
  { name: 'E: UI (Clock + Tooltip)', cmd: 'node', args: ['tests/external-data-suite-e-staleness-clock.e2e.test.js'] },
];

console.log('=== External Data Nightly (Full Suite A–E) ===\n');

const results = [];
for (const s of suites) {
  process.stdout.write(`Running ${s.name}... `);
  const r = spawnSync(s.cmd, s.args, { cwd: root, stdio: 'pipe', encoding: 'utf-8' });
  const ok = r.status === 0;
  results.push({ name: s.name, pass: ok });
  console.log(ok ? 'PASS' : 'FAIL');
  if (!ok && r.stderr) console.log(r.stderr.slice(0, 500));
}

const passed = results.filter(x => x.pass).length;
const failed = results.filter(x => !x.pass).length;

console.log('\n--- Summary ---');
results.forEach(r => console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}`));
console.log(`\n${passed}/${results.length} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
