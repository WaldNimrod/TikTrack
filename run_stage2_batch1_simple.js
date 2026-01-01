/**
 * Stage 2 Batch 1 QA - executions + trading_accounts (API-based)
 * Tests each entity with Logger + Network evidence
 */

// Using built-in fetch (Node.js 18+)

class Stage2Batch1SimpleQA {
  constructor() {
    this.logger = {
      info: (msg, data) => this.sendLog('INFO', msg, data),
      error: (msg, data) => this.sendLog('ERROR', msg, data),
      warn: (msg, data) => this.sendLog('WARN', msg, data),
      debug: (msg, data) => this.sendLog('DEBUG', msg, data)
    };
    this.networkEvidence = [];
  }

  sendLog(level, message, data = {}) {
    const logEntry = {
      sessionId: 'stage2-batch1-simple',
      runId: `stage2-batch1-simple-${Date.now()}`,
      hypothesisId: 'stage2-batch1-validation',
      location: 'run_stage2_batch1_simple.js',
      message,
      data: { ...data, level, timestamp: Date.now() }
    };

    // Write to debug log
    const fs = require('fs');
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync('/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log', logLine);

    console.log(`[${level}] ${message}`);
  }

  async captureNetworkEvidence(request, response) {
    const evidence = {
      timestamp: new Date().toISOString(),
      method: request.method || 'GET',
      url: request.url || request,
      status: response.status,
      requestHeaders: request.headers || {},
      responseHeaders: Object.fromEntries(response.headers.entries()),
      success: response.ok
    };
    this.networkEvidence.push(evidence);
    return evidence;
  }

  async login() {
    this.logger.info('Starting admin login for stage 2 testing', { username: 'admin', password: 'admin123' });

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });

      await this.captureNetworkEvidence(
        { method: 'POST', url: 'http://localhost:8080/api/auth/login' },
        response
      );

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const loginData = await response.json();
      const token = loginData.data?.access_token || loginData.access_token || loginData.token;

      if (!token) {
        throw new Error(`No token received from login. Response: ${JSON.stringify(loginData)}`);
      }

      this.authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      this.logger.info('Admin login successful for stage 2 testing', { hasToken: !!token, userId: 2 });
      return token;

    } catch (error) {
      this.logger.error('Admin login failed for stage 2 testing', { error: error.message });
      throw error;
    }
  }

  async testEntity(entityType) {
    this.logger.info(`Starting stage 2 test for ${entityType}`, { entityType });

    try {
      // Build payload for create operation
      const payload = this.buildPayload(entityType);
      this.logger.info(`Built payload for ${entityType} create`, {
        entityType,
        payloadKeys: Object.keys(payload),
        userId: payload.user_id
      });

      // Test CREATE
      this.logger.info(`Testing CREATE for ${entityType}`, { entityType, endpoint: `/api/${entityType}` });

      const createResponse = await fetch(`http://localhost:8080/api/${entityType}`, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify(payload)
      });

      const createEvidence = await this.captureNetworkEvidence(
        {
          method: 'POST',
          url: `http://localhost:8080/api/${entityType}`,
          headers: this.authHeaders,
          body: payload
        },
        createResponse
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        this.logger.error(`CREATE failed for ${entityType}`, {
          entityType,
          status: createResponse.status,
          error: errorText,
          payload,
          evidence: createEvidence
        });
        return { entity: entityType, success: false, error: `CREATE ${createResponse.status}: ${errorText}`, stage: 'CREATE' };
      }

      const createData = await createResponse.json();
      const entityId = createData.data?.id || createData.id;

      if (!entityId) {
        this.logger.error(`No ID returned from CREATE for ${entityType}`, { createData });
        return { entity: entityType, success: false, error: 'No ID from CREATE response', stage: 'CREATE' };
      }

      this.logger.info(`CREATE successful for ${entityType}`, {
        entityType,
        entityId,
        evidence: createEvidence
      });

      // Test READ
      const readResponse = await fetch(`http://localhost:8080/api/${entityType}/${entityId}`, {
        method: 'GET',
        headers: this.authHeaders
      });

      const readEvidence = await this.captureNetworkEvidence(
        { method: 'GET', url: `http://localhost:8080/api/${entityType}/${entityId}` },
        readResponse
      );

      if (!readResponse.ok) {
        const errorText = await readResponse.text();
        this.logger.error(`READ failed for ${entityType}`, {
          entityType,
          entityId,
          status: readResponse.status,
          error: errorText,
          evidence: readEvidence
        });
        return { entity: entityType, success: false, error: `READ ${readResponse.status}: ${errorText}`, stage: 'READ' };
      }

      this.logger.info(`READ successful for ${entityType}`, {
        entityType,
        entityId,
        evidence: readEvidence
      });

      // Test UPDATE
      const updatePayload = { ...payload };
      if (entityType === 'executions') {
        updatePayload.quantity = 200; // Update quantity
      } else if (entityType === 'trading_accounts') {
        updatePayload.name = 'Updated Trading Account'; // Update name
      }

      const updateResponse = await fetch(`http://localhost:8080/api/${entityType}/${entityId}`, {
        method: 'PUT',
        headers: this.authHeaders,
        body: JSON.stringify(updatePayload)
      });

      const updateEvidence = await this.captureNetworkEvidence(
        {
          method: 'PUT',
          url: `http://localhost:8080/api/${entityType}/${entityId}`,
          headers: this.authHeaders,
          body: updatePayload
        },
        updateResponse
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        this.logger.error(`UPDATE failed for ${entityType}`, {
          entityType,
          entityId,
          status: updateResponse.status,
          error: errorText,
          evidence: updateEvidence
        });
        return { entity: entityType, success: false, error: `UPDATE ${updateResponse.status}: ${errorText}`, stage: 'UPDATE' };
      }

      this.logger.info(`UPDATE successful for ${entityType}`, {
        entityType,
        entityId,
        evidence: updateEvidence
      });

      // Test DELETE
      const deleteResponse = await fetch(`http://localhost:8080/api/${entityType}/${entityId}`, {
        method: 'DELETE',
        headers: this.authHeaders
      });

      const deleteEvidence = await this.captureNetworkEvidence(
        { method: 'DELETE', url: `http://localhost:8080/api/${entityType}/${entityId}` },
        deleteResponse
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        this.logger.error(`DELETE failed for ${entityType}`, {
          entityType,
          entityId,
          status: deleteResponse.status,
          error: errorText,
          evidence: deleteEvidence
        });
        return { entity: entityType, success: false, error: `DELETE ${deleteResponse.status}: ${errorText}`, stage: 'DELETE' };
      }

      this.logger.info(`DELETE successful for ${entityType}`, {
        entityType,
        entityId,
        evidence: deleteEvidence
      });

      // Store entity ID for cleanup (we'll delete it later)
      this.createdEntities = this.createdEntities || [];
      this.createdEntities.push({ entityType, entityId });

      this.logger.info(`All CRUD operations PASSED for ${entityType}`, { entityType });
      return { entity: entityType, success: true };

    } catch (error) {
      this.logger.error(`Test failed for ${entityType}`, { entityType, error: error.message });
      return { entity: entityType, success: false, error: error.message, stage: 'SETUP' };
    }
  }

  buildPayload(entityType) {
    // Base payload with admin user
    const basePayload = {
      user_id: 2, // Admin user ID
    };

    if (entityType === 'executions') {
      return {
        ...basePayload,
        ticker_id: 1,
        quantity: 100,
        price: 150.50,
        trading_account_id: 247, // From previous tests
        notes: 'Stage 2 Batch 1 QA test'
      };
    } else if (entityType === 'trading_accounts') {
      return {
        ...basePayload,
        name: 'Stage 2 QA Trading Account',
        currency_id: 1,
        status: 'open',
        notes: 'Created for Stage 2 Batch 1 QA testing',
        cash_balance: 0,
        total_value: 0,
        opening_balance: 0,
        total_pl: 0
      };
    }

    return basePayload;
  }

  async runAllTests() {
    console.log('🎯 STAGE 2 BATCH 1 QA - executions + trading_accounts');
    console.log('===================================================');

    const timestamp = new Date().toISOString();
    console.log(`Timestamp: ${timestamp}`);
    console.log('');

    try {
      // Login as admin
      await this.login();

      // Test executions
      console.log('🔍 Testing executions...');
      const executionsResult = await this.testEntity('executions');
      const executionsStatus = executionsResult.success ? '✅ PASS' : '❌ FAIL';
      const executionsDetails = executionsResult.success
        ? ''
        : `(${executionsResult.stage}: ${executionsResult.error})`;
      console.log(`   executions: ${executionsStatus} ${executionsDetails}`);

      // Test trading_accounts
      console.log('🔍 Testing trading_accounts...');
      const tradingAccountsResult = await this.testEntity('trading_accounts');
      const tradingAccountsStatus = tradingAccountsResult.success ? '✅ PASS' : '❌ FAIL';
      const tradingAccountsDetails = tradingAccountsResult.success
        ? ''
        : `(${tradingAccountsResult.stage}: ${tradingAccountsResult.error})`;
      console.log(`   trading_accounts: ${tradingAccountsStatus} ${tradingAccountsDetails}`);

      // Summary
      const overallSuccess = executionsResult.success && tradingAccountsResult.success;
      console.log('');
      console.log('📊 STAGE 2 BATCH 1 QA SUMMARY');
      console.log('==============================');
      console.log(`Overall: ${overallSuccess ? 2 : (executionsResult.success ? 1 : 0) + (tradingAccountsResult.success ? 1 : 0)}/2 PASSED`);
      console.log(`Timestamp: ${timestamp}`);

      if (overallSuccess) {
        console.log('🎉 ALL TESTS PASSED! Stage 2 Batch 1 QA successful.');
      } else {
        console.log('❌ Some tests failed. Check logger evidence for details.');
      }

      // Save detailed results
      const results = {
        timestamp,
        scope: 'stage_2_batch_1',
        entities: ['executions', 'trading_accounts'],
        results: {
          executions: executionsResult,
          trading_accounts: tradingAccountsResult
        },
        overall: {
          total: 2,
          passed: (executionsResult.success ? 1 : 0) + (tradingAccountsResult.success ? 1 : 0),
          failed: (executionsResult.success ? 0 : 1) + (tradingAccountsResult.success ? 0 : 1)
        },
        loggerEvidence: 'See /Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log',
        networkEvidence: this.networkEvidence.slice(-20) // Last 20 network calls
      };

      const fs = require('fs');
      fs.writeFileSync('stage2_batch1_results.json', JSON.stringify(results, null, 2));

      console.log('\n💾 Results saved to stage2_batch1_results.json');
      console.log('📋 Logger evidence in .cursor/debug.log');

      return results;

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }
}

// Run the tests
if (require.main === module) {
  const qa = new Stage2Batch1SimpleQA();
  qa.runAllTests().then(results => {
    console.log('\n✅ Stage 2 Batch 1 QA completed');
    process.exit(results.overall.failed === 0 ? 0 : 1);
  }).catch(error => {
    console.error('\n❌ Stage 2 Batch 1 QA failed:', error);
    process.exit(1);
  });
}

module.exports = Stage2Batch1SimpleQA;
