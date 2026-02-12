#!/usr/bin/env node
/**
 * Central Status - API verification (no Selenium)
 * Validates status param flow: backend accepts status=active|inactive|pending|cancelled
 * Run when E2E fails due to Chrome/Selenium env
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8082/api/v1';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:8080';

async function getToken() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username_or_email: process.env.PHASE2_TEST_USERNAME || 'TikTrackAdmin',
      password: process.env.PHASE2_TEST_PASSWORD || '4181',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || data.token;
}

async function testStatusParam(token, status, expectedKey) {
  const url = status
    ? `${API_BASE}/trading_accounts?status=${status}`
    : `${API_BASE}/trading_accounts`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { pass: false, status: res.status };
  const data = await res.json();
  const items = data.items || data.data || data;
  const arr = Array.isArray(items) ? items : [];
  const ok = arr.every((x) => !expectedKey || x.status === expectedKey);
  return { pass: res.ok && ok, count: arr.length };
}

async function main() {
  console.log('\n=== Central Status API Verification ===\n');

  const token = await getToken();
  if (!token) {
    console.log('❌ Login failed - backend may not be running');
    process.exit(1);
  }
  console.log('✅ Login OK');

  const cases = [
    ['active', 'active'],
    ['inactive', 'inactive'],
    ['pending', null],
    ['cancelled', null],
    [null, null], // no param
  ];

  let passed = 0;
  for (const [param, expected] of cases) {
    const { pass, count } = await testStatusParam(token, param, expected);
    const label = param || '(no status)';
    if (pass) {
      console.log(`✅ GET /trading_accounts?status=${label} → ${count} items`);
      passed++;
    } else {
      console.log(`❌ GET /trading_accounts?status=${label} FAIL`);
    }
  }

  console.log(`\n--- Results: ${passed}/${cases.length} PASS ---\n`);
  process.exit(passed < cases.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
