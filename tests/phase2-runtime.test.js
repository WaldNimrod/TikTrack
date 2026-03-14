#!/usr/bin/env node
/**
 * Phase 2 QA Runtime Testing Script
 * Tests D16, D18, D21 pages with actual HTTP requests
 * 
 * @description Runtime tests for Phase 2 Financial Core pages
 * @version v1.0.0
 * @date 2026-02-07
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts_SESSION_01');

const FRONTEND_URL = process.env.PHASE2_FRONTEND_URL || 'http://localhost:8080';
const BACKEND_URL = process.env.PHASE2_BACKEND_URL || 'http://localhost:8082';
// Default: TikTrackAdmin/4181 (QA test user — scripts/seed_qa_test_user.py, TEAM_60_QA_TEST_USER_SEEDED)
const TEST_USER = {
  username_or_email: process.env.PHASE2_TEST_USERNAME || 'TikTrackAdmin',
  password: process.env.PHASE2_TEST_PASSWORD || '4181'
};

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: TEST_USER
    });
    
    if (response.status === 200 && response.data.access_token) {
      results.passed.push('Login successful - token received');
      return response.data.access_token;
    } else {
      results.failed.push(`Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    results.failed.push(`Login error: ${error.message}`);
    return null;
  }
}

async function testPageLoad(pagePath, pageName) {
  console.log(`\n📄 Testing ${pageName} (${pagePath})...`);
  try {
    const response = await makeRequest(`${FRONTEND_URL}${pagePath}`, {
      method: 'GET'
    });
    
    if (response.status === 200) {
      const html = response.data;
      if (typeof html === 'string' && html.includes('<!DOCTYPE html>')) {
        // Check for CSS loading order
        const hasPhoenixBase = html.includes('phoenix-base.css');
        
        if (hasPhoenixBase) {
          results.passed.push(`${pageName}: phoenix-base.css referenced`);
        } else {
          results.warnings.push(`${pageName}: phoenix-base.css not found`);
        }
        
        results.passed.push(`${pageName}: Page loads successfully (HTTP 200)`);
        return true;
      } else {
        results.failed.push(`${pageName}: Invalid HTML response`);
        return false;
      }
    } else {
      results.failed.push(`${pageName}: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`${pageName}: Error - ${error.message}`);
    return false;
  }
}

async function testAPIEndpoint(endpoint, token, pageName) {
  console.log(`\n🔌 Testing API: ${endpoint}...`);
  try {
    const response = await makeRequest(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      results.passed.push(`${pageName} API: ${endpoint} - Success (200)`);
      return true;
    } else if (response.status === 401) {
      results.failed.push(`${pageName} API: ${endpoint} - Unauthorized (401)`);
      return false;
    } else {
      const bodyStr = typeof response.data === 'object' ? JSON.stringify(response.data) : (response.data || '');
      const detail = bodyStr ? ` | response: ${bodyStr}` : '';
      results.warnings.push(`${pageName} API: ${endpoint} - Status ${response.status}${detail}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`${pageName} API: ${endpoint} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Phase 2 QA Runtime Testing');
  console.log('================================\n');
  
  // Test login
  const token = await testLogin();
  
  if (!token) {
    console.log('\n❌ [STOP] Login failed — QA seed user (TikTrackAdmin/4181) not available.');
    console.log('   Run: python3 scripts/seed_qa_test_user.py — then retry. Do not continue Gate B.');
    process.exit(1);
  }
  
  // Test pages
  await testPageLoad('/trading_accounts', 'D16 - Trading Accounts');
  await testPageLoad('/brokers_fees', 'D18 - Brokers Fees');
  await testPageLoad('/cash_flows', 'D21 - Cash Flows');
  
  // Test API endpoints
  await testAPIEndpoint('/api/v1/trading_accounts', token, 'D16');
  await testAPIEndpoint('/api/v1/trading_accounts/summary', token, 'D16 Summary');
  await testAPIEndpoint('/api/v1/brokers_fees', token, 'D18');
  await testAPIEndpoint('/api/v1/brokers_fees/summary', token, 'D18 Summary');
  await testAPIEndpoint('/api/v1/cash_flows', token, 'D21');
  await testAPIEndpoint('/api/v1/cash_flows/summary', token, 'D21 Summary');
  
  // Print results
  console.log('\n\n📊 Test Results Summary');
  console.log('================================');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`  ✓ ${test}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`  ✗ ${test}`));
  }
  
  console.log('\n');
  
  // Save artifacts with full warning/error text
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }
  const runtimeArtifactsPath = path.join(ARTIFACTS_DIR, 'phase2-runtime-results.json');
  fs.writeFileSync(runtimeArtifactsPath, JSON.stringify({
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`📁 Runtime artifacts: ${runtimeArtifactsPath}\n`);
  
  // Exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { runTests };
