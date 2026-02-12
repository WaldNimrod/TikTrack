#!/usr/bin/env node
/**
 * Summary Endpoints Verification - Team 50
 * Scope: TEAM_10_TO_TEAM_50_SUMMARY_ENDPOINTS_CLOSURE_REQUEST
 * 4 endpoints: trading_accounts/summary, brokers_fees/summary, cash_flows/summary, cash_flows/currency_conversions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8082/api/v1';

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function getToken() {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username_or_email: process.env.PHASE2_TEST_USERNAME || 'test_user',
        password: process.env.PHASE2_TEST_PASSWORD || '4181',
      }),
    });
  } catch (e) {
    return { token: null, error: e.message || 'Connection failed' };
  }
  if (!res) return { token: null, error: 'No response' };
  const data = await res.json().catch(() => ({}));
  if (res.ok && (data.access_token || data.token)) {
    return { token: data.access_token || data.token, error: null };
  }
  return { token: null, error: `${res.status} ${data.detail || data.error_code || data.message || ''}`.trim() };
}

async function verifyEndpoint(token, path, method = 'GET') {
  const url = path.startsWith('http') ? path : `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await fetchWithTimeout(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!res) return { pass: false, status: 0, note: 'Connection failed / timeout' };
  const pass = res.status === 200;
  let note = pass ? '200 OK' : `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (pass && body) {
      const keys = Object.keys(body);
      note += keys.length ? ` (${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''})` : '';
    }
  } catch (_) {
    if (!pass) note += '; body not JSON';
  }
  return { pass, status: res.status, note };
}

async function main() {
  const results = [];
  const loginResult = await getToken();
  const token = loginResult && (typeof loginResult === 'object' ? loginResult.token : loginResult);
  if (!token) {
    const err = typeof loginResult === 'object' && loginResult?.error ? loginResult.error : 'Backend may not be running';
    console.error('❌ Login failed:', err);
    if (loginResult && typeof loginResult === 'object' && loginResult.error) {
      const report = `# Team 50 → Team 10: דוח אימות Summary/Conversions Endpoints

**מאת:** Team 50 (QA & Fidelity)  
**אל:** Team 10 (The Gateway)  
**תאריך:** ${new Date().toISOString().split('T')[0]}  
**מקור:** TEAM_10_TO_TEAM_50_SUMMARY_ENDPOINTS_CLOSURE_REQUEST.md

---

## 1. הגדרות

| פרט | ערך |
|-----|-----|
| Base URL | ${API_BASE} |
| Auth | TikTrackAdmin (Bearer JWT) |

---

## 2. סטטוס

**❌ Login נכשל** — ${loginResult.error}

לא ניתן לאמת את 4 ה-endpoints ללא Auth תקין. יש לוודא:
- מסד הנתונים פועל ונגיש
- POST /api/v1/auth/login returns 200 + access_token

---

**Team 50 (QA & Fidelity)**  
*log_entry | SUMMARY_ENDPOINTS_VERIFICATION | TO_TEAM_10 | ${new Date().toISOString().split('T')[0]}*
`;
      fs.writeFileSync(path.join(__dirname, '..', '_COMMUNICATION', 'team_50', 'TEAM_50_TO_TEAM_10_SUMMARY_ENDPOINTS_VERIFICATION_REPORT.md'), report);
    }
    process.exit(1);
  }

  const endpoints = [
    { path: 'trading_accounts/summary', method: 'GET' },
    { path: 'brokers_fees/summary', method: 'GET' },
    { path: 'cash_flows/summary', method: 'GET' },
    { path: 'cash_flows/currency_conversions', method: 'GET' },
  ];

  for (const ep of endpoints) {
    const r = await verifyEndpoint(token, ep.path, ep.method);
    results.push({ path: `/api/v1/${ep.path}`, ...r });
  }

  const allPass = results.every(r => r.pass);
  results.forEach((r, i) => {
    console.log(`${r.pass ? '✅' : '❌'} #${i + 1} ${r.path} ${r.pass ? 'PASS' : 'FAIL'} (${r.note})`);
  });
  console.log(`\n--- ${allPass ? 'All 4 PASS' : 'Some FAIL'} ---`);
  return { results, allPass };
}

main()
  .then(({ results, allPass }) => {
    const report = `# Team 50 → Team 10: דוח אימות Summary/Conversions Endpoints

**מאת:** Team 50 (QA & Fidelity)  
**אל:** Team 10 (The Gateway)  
**תאריך:** ${new Date().toISOString().split('T')[0]}  
**מקור:** TEAM_10_TO_TEAM_50_SUMMARY_ENDPOINTS_CLOSURE_REQUEST.md

---

## 1. הגדרות

| פרט | ערך |
|-----|-----|
| Base URL | ${API_BASE} |
| Auth | TikTrackAdmin (Bearer JWT) |

---

## 2. תוצאות

| # | נתיב | שיטה | תוצאה | הערה |
|---|------|------|--------|------|
${results.map((r, i) => `| ${i + 1} | \`${r.path}\` | GET | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.note} |`).join('\n')}

---

## 3. מסקנה

${allPass ? '✅ **כל 4 endpoints מאומתים — צד שרת 100%**' : '❌ **יש FAIL — נדרש טיפול Team 20**'}

**Team 50 (QA & Fidelity)**  
*log_entry | SUMMARY_ENDPOINTS_VERIFICATION | TO_TEAM_10 | ${new Date().toISOString().split('T')[0]}*
`;
    const outPath = path.join(__dirname, '..', '_COMMUNICATION', 'team_50', 'TEAM_50_TO_TEAM_10_SUMMARY_ENDPOINTS_VERIFICATION_REPORT.md');
    fs.writeFileSync(outPath, report);
    process.exit(allPass ? 0 : 1);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
