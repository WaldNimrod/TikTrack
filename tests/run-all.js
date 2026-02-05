/**
 * Run All Integration Tests
 * Phase 1.5 - Team 50 (QA)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createDriver, TEST_CONFIG } from './selenium-config.js';

const execAsync = promisify(exec);

const tests = [
  { name: 'Authentication Flow', file: 'auth-flow.test.js' },
  { name: 'User Management Flow', file: 'user-management.test.js' },
  { name: 'API Keys Management Flow', file: 'api-keys.test.js' },
  { name: 'Error Handling & Security', file: 'error-handling.test.js' },
  { name: 'Trading Accounts Routing', file: 'trading-accounts-routing.test.js' }
];

async function checkInfrastructure() {
  console.log('Checking infrastructure...');
  
  try {
    // Check backend
    const backendResponse = await fetch(`${TEST_CONFIG.backendUrl}/health`);
    if (backendResponse.ok) {
      console.log('✅ Backend is running');
    } else {
      throw new Error('Backend health check failed');
    }
  } catch (error) {
    console.error('❌ Backend is not running:', error.message);
    console.error('   Please start backend: cd api && python -m uvicorn main:app --port 8082');
    return false;
  }

  try {
    // Check frontend
    const frontendResponse = await fetch(TEST_CONFIG.frontendUrl);
    if (frontendResponse.ok) {
      console.log('✅ Frontend is running');
    } else {
      throw new Error('Frontend check failed');
    }
  } catch (error) {
    console.error('❌ Frontend is not running:', error.message);
    console.error('   Please start frontend: cd ui && npm run dev');
    return false;
  }

  return true;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Phase 1.5 Integration Testing - Selenium Automation');
  console.log('Team 50 (QA)');
  console.log('='.repeat(60));
  console.log('');

  // Check infrastructure
  const infrastructureReady = await checkInfrastructure();
  if (!infrastructureReady) {
    console.error('\n❌ Infrastructure not ready. Please start servers and try again.');
    process.exit(1);
  }

  console.log('\nStarting tests...\n');

  const results = [];

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${test.name}`);
    console.log('='.repeat(60));

    try {
      // Note: In a real setup, you would use a proper test runner
      // For now, we'll just indicate the test file
      console.log(`Test file: tests/${test.file}`);
      console.log(`Run with: npm run test:${test.name.toLowerCase().replace(/\s+/g, '')}`);
      
      results.push({
        name: test.name,
        status: 'PENDING',
        message: 'Test file ready - run individually or with test runner'
      });
    } catch (error) {
      console.error(`❌ Error running ${test.name}:`, error.message);
      results.push({
        name: test.name,
        status: 'ERROR',
        message: error.message
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST EXECUTION SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const emoji = result.status === 'PENDING' ? '⏸️' : result.status === 'ERROR' ? '❌' : '✅';
    console.log(`${emoji} ${result.name}: ${result.status}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('Next Steps:');
  console.log('1. Install dependencies: cd tests && npm install');
  console.log('2. Run individual tests: npm run test:auth');
  console.log('3. Run all tests: npm run test:all');
  console.log('4. Review results and proceed to visual validation');
  console.log('='.repeat(60));
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
