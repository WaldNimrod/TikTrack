#!/usr/bin/env node
/**
 * Phase 1 Completion B — Validation of test data and CRUD
 * Team 50 (QA) — TEAM_10_PHASE_1_COMPLETION_B_CHECKLIST
 *
 * Validates:
 * 1. Display: D16/D18/D21 — correct counts (≥3, ≥6, ≥10) and sample data
 * 2. API CRUD: Brokers Fees and Cash Flows — Create, Read, Update, Delete
 * 3. Trading Accounts: read-only (no POST/PUT/DELETE in API) — display only
 *
 * Output: documentation/05-REPORTS/artifacts_SESSION_01/phase1-completion-b-validation-results.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.PHASE2_API_URL || 'http://localhost:8082/api/v1';
const QA_USER = process.env.PHASE2_TEST_USERNAME || 'TikTrackAdmin';
const QA_PASS = process.env.PHASE2_TEST_PASSWORD || '4181';

const results = {
  timestamp: new Date().toISOString(),
  login: { success: false, error: null },
  display: { D16: null, D18: null, D21: null, issues: [] },
  crud: { brokers_fees: null, cash_flows: null, trading_accounts: 'read_only_no_crud_api' },
  issues: [],
  passed: false,
  /** Full request/response for every failed API call — for detailed report */
  rawFailures: []
};

function captureFailure(name, url, method, requestBody, res, bodyText) {
  const entry = {
    name,
    url,
    method,
    requestBody: requestBody || null,
    responseStatus: res.status,
    responseStatusText: res.statusText,
    responseHeaders: Object.fromEntries(res.headers.entries()),
    responseBody: bodyText
  };
  results.rawFailures.push(entry);
  return entry;
}

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username_or_email: QA_USER, password: QA_PASS })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    results.login = { success: false, error: data.detail || res.statusText, status: res.status };
    results.issues.push({ section: 'login', message: `Login failed: ${data.detail || res.statusText}`, status: res.status });
    return null;
  }
  const token = data.access_token;
  if (!token) {
    results.login = { success: false, error: 'No access_token in response' };
    results.issues.push({ section: 'login', message: 'No access_token in login response' });
    return null;
  }
  results.login = { success: true };
  return token;
}

async function apiGet(token, path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function apiPost(token, path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const bodyText = await res.text();
  const data = bodyText ? (() => { try { return JSON.parse(bodyText); } catch { return {}; } })() : {};
  if (!res.ok) captureFailure(`POST ${path}`, url, 'POST', body, res, bodyText);
  return { ok: res.ok, status: res.status, data };
}

async function apiPut(token, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function apiDelete(token, path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return { ok: res.ok, status: res.status };
}

function addIssue(section, message, detail = null) {
  results.issues.push({ section, message, detail });
  if (!results.display.issues) results.display.issues = [];
  results.display.issues.push({ section, message, detail });
}

async function run() {
  console.log('Phase 1 Completion B — Data & CRUD Validation');
  console.log('API_BASE:', API_BASE);
  console.log('');

  const token = await login();
  if (!token) {
    console.log('❌ Login failed. Run: python3 scripts/seed_qa_test_user.py');
    saveResults();
    process.exit(1);
  }
  console.log('✅ Login OK');

  // --- Display validation (counts from API; UI would need E2E for DOM row count) ---
  const accountsRes = await apiGet(token, '/trading_accounts');
  const accounts = accountsRes.data?.data || [];
  const accountsTotal = accountsRes.data?.total ?? accounts.length;
  results.display.D16 = {
    total: accountsTotal,
    expectedMin: 3,
    passed: accountsTotal >= 3,
    sample: accounts.slice(0, 2).map(a => ({ id: a.external_ulid || a.id, account_name: a.display_name || a.account_name, broker: a.broker, currency: a.currency }))
  };
  if (accountsTotal < 3) addIssue('D16', `trading_accounts: expected ≥3, got ${accountsTotal}`, { total: accountsTotal, expected: 3 });
  console.log(`D16 trading_accounts: ${accountsTotal} (expected ≥3) ${results.display.D16.passed ? '✅' : '❌'}`);

  const brokersRes = await apiGet(token, '/brokers_fees');
  const brokers = brokersRes.data?.data ?? brokersRes.data ?? [];
  const brokersList = Array.isArray(brokers) ? brokers : [];
  const brokersTotal = brokersRes.data?.total ?? brokersList.length;
  results.display.D18 = {
    total: brokersTotal,
    expectedMin: 6,
    passed: brokersTotal >= 6,
    sample: brokersList.slice(0, 2).map(b => ({ id: b.id, broker: b.broker, commission_type: b.commission_type }))
  };
  if (brokersTotal < 6) addIssue('D18', `brokers_fees: expected ≥6, got ${brokersTotal}`, { total: brokersTotal, expected: 6 });
  console.log(`D18 brokers_fees: ${brokersTotal} (expected ≥6) ${results.display.D18.passed ? '✅' : '❌'}`);

  const flowsRes = await apiGet(token, '/cash_flows');
  const flows = flowsRes.data?.data ?? flowsRes.data ?? [];
  const flowsList = Array.isArray(flows) ? flows : [];
  const flowsTotal = flowsRes.data?.total ?? flowsList.length;
  results.display.D21 = {
    total: flowsTotal,
    expectedMin: 10,
    passed: flowsTotal >= 10,
    sample: flowsList.slice(0, 2).map(f => ({ id: f.id, flow_type: f.flow_type, amount: f.amount }))
  };
  if (flowsTotal < 10) addIssue('D21', `cash_flows: expected ≥10, got ${flowsTotal}`, { total: flowsTotal, expected: 10 });
  console.log(`D21 cash_flows: ${flowsTotal} (expected ≥10) ${results.display.D21.passed ? '✅' : '❌'}`);

  // --- CRUD: Brokers Fees ---
  results.crud.brokers_fees = { create: null, update: null, delete: null, issues: [] };
  const createBroker = await apiPost(token, '/brokers_fees', {
    broker: 'QA Test Broker',
    commission_type: 'FLAT',
    commission_value: '2.00',
    minimum: 2
  });
  if (!createBroker.ok) {
    results.crud.brokers_fees.create = { success: false, status: createBroker.status, detail: createBroker.data };
    results.crud.brokers_fees.issues.push({ action: 'create', message: createBroker.data?.detail || createBroker.status, detail: createBroker.data });
    addIssue('CRUD brokers_fees', 'Create failed', createBroker.data);
  } else {
    const createdId = createBroker.data?.id;
    results.crud.brokers_fees.create = { success: true, id: createdId };
    const updateBroker = await apiPut(token, `/brokers_fees/${createdId}`, {
      broker: 'QA Test Broker Updated',
      commission_type: 'FLAT',
      commission_value: '3.00',
      minimum: 3
    });
    if (!updateBroker.ok) {
      results.crud.brokers_fees.update = { success: false, status: updateBroker.status, detail: updateBroker.data };
      results.crud.brokers_fees.issues.push({ action: 'update', message: updateBroker.data?.detail || updateBroker.status });
      addIssue('CRUD brokers_fees', 'Update failed', updateBroker.data);
    } else {
      results.crud.brokers_fees.update = { success: true };
    }
    const delBroker = await apiDelete(token, `/brokers_fees/${createdId}`);
    if (delBroker.status !== 204 && !delBroker.ok) {
      results.crud.brokers_fees.delete = { success: false, status: delBroker.status };
      results.crud.brokers_fees.issues.push({ action: 'delete', message: `Status ${delBroker.status}` });
      addIssue('CRUD brokers_fees', 'Delete failed', { status: delBroker.status });
    } else {
      results.crud.brokers_fees.delete = { success: true };
    }
  }
  console.log('CRUD brokers_fees:', results.crud.brokers_fees.create?.success ? 'create ✅' : 'create ❌',
    results.crud.brokers_fees.update?.success !== false ? 'update ✅' : 'update ❌',
    results.crud.brokers_fees.delete?.success !== false ? 'delete ✅' : 'delete ❌');

  // --- CRUD: Cash Flows (need trading_account_id) ---
  results.crud.cash_flows = { create: null, update: null, delete: null, issues: [] };
  const firstAccountId = accounts[0]?.external_ulid || accounts[0]?.id;
  if (!firstAccountId) {
    results.crud.cash_flows.issues.push({ action: 'create', message: 'No trading_account_id available (no accounts)' });
    addIssue('CRUD cash_flows', 'Cannot test create: no trading accounts');
  } else {
    const createFlow = await apiPost(token, '/cash_flows', {
      trading_account_id: firstAccountId,
      flow_type: 'DEPOSIT',
      amount: 100,
      currency: 'USD',
      transaction_date: new Date().toISOString().slice(0, 10),
      description: 'QA test flow'
    });
    if (!createFlow.ok) {
      results.crud.cash_flows.create = { success: false, status: createFlow.status, detail: createFlow.data };
      results.crud.cash_flows.issues.push({ action: 'create', message: createFlow.data?.detail || createFlow.status, detail: createFlow.data });
      addIssue('CRUD cash_flows', 'Create failed', createFlow.data);
    } else {
      const createdFlowId = createFlow.data?.external_ulid || createFlow.data?.id;
      results.crud.cash_flows.create = { success: true, id: createdFlowId };
      const updateFlow = await apiPut(token, `/cash_flows/${createdFlowId}`, {
        trading_account_id: firstAccountId,
        flow_type: 'DEPOSIT',
        amount: 200,
        currency: 'USD',
        transaction_date: new Date().toISOString().slice(0, 10),
        description: 'QA test flow updated'
      });
      if (!updateFlow.ok) {
        results.crud.cash_flows.update = { success: false, status: updateFlow.status, detail: updateFlow.data };
        results.crud.cash_flows.issues.push({ action: 'update', message: updateFlow.data?.detail || updateFlow.status });
        addIssue('CRUD cash_flows', 'Update failed', updateFlow.data);
      } else {
        results.crud.cash_flows.update = { success: true };
      }
      const delFlow = await apiDelete(token, `/cash_flows/${createdFlowId}`);
      if (delFlow.status !== 204 && !delFlow.ok) {
        results.crud.cash_flows.delete = { success: false, status: delFlow.status };
        results.crud.cash_flows.issues.push({ action: 'delete', message: `Status ${delFlow.status}` });
        addIssue('CRUD cash_flows', 'Delete failed', { status: delFlow.status });
      } else {
        results.crud.cash_flows.delete = { success: true };
      }
    }
  }
  console.log('CRUD cash_flows:', results.crud.cash_flows.create?.success ? 'create ✅' : 'create ❌',
    results.crud.cash_flows.update?.success !== false ? 'update ✅' : 'update ❌',
    results.crud.cash_flows.delete?.success !== false ? 'delete ✅' : 'delete ❌');

  results.passed =
    results.login.success &&
    results.display.D16.passed &&
    results.display.D18.passed &&
    results.display.D21.passed &&
    (results.crud.brokers_fees.create?.success && results.crud.brokers_fees.delete?.success !== false) &&
    (results.crud.cash_flows.create?.success !== false && results.crud.cash_flows.delete?.success !== false || !firstAccountId);

  saveResults();
  console.log('');
  console.log(results.passed ? '✅ Phase 1 Completion B validation PASSED' : '❌ Phase 1 Completion B validation FAILED');
  process.exit(results.passed ? 0 : 1);
}

function saveResults() {
  const outDir = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts_SESSION_01');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'phase1-completion-b-validation-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  if (results.rawFailures.length > 0) {
    const rawPath = path.join(outDir, 'phase1-completion-b-raw-failures.json');
    fs.writeFileSync(rawPath, JSON.stringify(results.rawFailures, null, 2));
    console.log('Raw failures saved to', rawPath);
  }
  console.log('Results saved to', outPath);
}

run().catch(err => {
  results.issues.push({ section: 'runtime', message: err.message, stack: err.stack });
  saveResults();
  process.exit(1);
});
