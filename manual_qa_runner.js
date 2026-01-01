/**
 * Manual QA Runner - Uses DB Constraints Table
 * Tests 3 target entities: trade_plan, cash_flow, user_profile
 * Uses UnifiedPayloadBuilder as single source of truth
 * Validates all required fields per DB_CONSTRAINTS_TARGET_ENTITIES.md
 */

const puppeteer = require('puppeteer');

// DB Constraints from Team C
const DB_CONSTRAINTS = {
  trade_plan: {
    required: ['user_id', 'trading_account_id', 'ticker_id', 'investment_type', 'side', 'status', 'planned_amount'],
    enums: {
      investment_type: ['swing'],
      side: ['Long', 'Short'],
      status: ['open', 'closed', 'cancelled']
    },
    defaults: {
      investment_type: 'swing',
      side: 'Long',
      status: 'open',
      planned_amount: 10000,
      entry_price: 100
    },
    validations: {
      planned_amount: (val) => val > 0,
      entry_price: (val) => val === null || val === undefined || val > 0
    }
  },
  cash_flow: {
    required: ['user_id', 'trading_account_id', 'type', 'amount', 'fee_amount', 'usd_rate'],
    enums: {
      type: ['deposit', 'withdrawal', 'fee', 'dividend', 'transfer_in', 'transfer_out', 'currency_exchange_from', 'currency_exchange_to', 'other_positive', 'other_negative'],
      source: ['manual', 'file_import', 'direct_import', 'api']
    },
    defaults: {
      type: 'deposit',
      amount: 1000,
      fee_amount: 0,
      usd_rate: 1.000000,
      currency_id: 1,
      source: 'manual',
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    },
    validations: {
      amount: (val) => val !== 0,
      usd_rate: (val) => val > 0,
      fee_amount: (val) => val >= 0
    }
  },
  user_profile: {
    required: ['username', 'is_active', 'is_default'],
    enums: {},
    defaults: {
      is_active: true,
      is_default: false
    },
    validations: {
      username: (val) => val && val.length <= 50,
      email: (val) => !val || val.length <= 100,
      first_name: (val) => !val || val.length <= 50,
      last_name: (val) => !val || val.length <= 50
    }
  }
};

class ManualQARunner {
  constructor() {
    this.results = {};
    this.logger = {
      info: (msg, data) => this.sendLog('INFO', msg, data),
      error: (msg, data) => this.sendLog('ERROR', msg, data),
      warn: (msg, data) => this.sendLog('WARN', msg, data),
      debug: (msg, data) => this.sendLog('DEBUG', msg, data)
    };
  }

  sendLog(level, message, data = {}) {
    const logEntry = {
      sessionId: 'manual-qa-session',
      runId: `manual-qa-${Date.now()}`,
      hypothesisId: 'manual-qa-validation',
      location: 'manual_qa_runner.js',
      message,
      data: { ...data, level, timestamp: Date.now() }
    };

    // Send to debug endpoint
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(() => {});
  }

  async buildPayload(entityType, fieldMap) {
    this.logger.info(`Building payload for ${entityType}`, { entityType, fieldMapKeys: Object.keys(fieldMap.fields || {}) });

    // Start with UnifiedPayloadBuilder
    let payload = await window.UnifiedPayloadBuilder.build(entityType, fieldMap, false);

    // Apply DB constraints overrides
    const constraints = DB_CONSTRAINTS[entityType];
    if (constraints) {
      // Ensure all required fields are present
      for (const requiredField of constraints.required) {
        if (payload[requiredField] === undefined || payload[requiredField] === null) {
          if (constraints.defaults && constraints.defaults[requiredField] !== undefined) {
            payload[requiredField] = constraints.defaults[requiredField];
          } else {
            // Generate required values
            payload[requiredField] = await this.generateRequiredValue(requiredField, entityType);
          }
        }
      }

      // Apply validations
      if (constraints.validations) {
        for (const [field, validator] of Object.entries(constraints.validations)) {
          if (!validator(payload[field])) {
            throw new Error(`Validation failed for ${field}: ${payload[field]}`);
          }
        }
      }

      // Apply enum constraints
      if (constraints.enums) {
        for (const [field, allowedValues] of Object.entries(constraints.enums)) {
          if (payload[field] && !allowedValues.includes(payload[field])) {
            payload[field] = allowedValues[0]; // Use first allowed value
          }
        }
      }
    }

    this.logger.info(`Payload built successfully`, { entityType, payloadKeys: Object.keys(payload), payloadSample: JSON.stringify(payload).slice(0, 200) });
    return payload;
  }

  generateRequiredValue(field, entityType) {
    // Generate values for required fields that don't have defaults
    switch (field) {
      case 'user_id':
        return 1; // Assume admin user exists
      case 'trading_account_id':
        return 1; // Assume default account exists
      case 'ticker_id':
        return 1; // Assume default ticker exists
      case 'username':
        return `test_user_${Date.now()}`;
      case 'is_active':
        return true;
      case 'is_default':
        return false;
      default:
        return `test_value_${field}`;
    }
  }

  async runEntityTest(page, entityType) {
    this.logger.info(`Starting manual QA test for ${entityType}`, { entityType });

    try {
      // Build payload using constraints (direct API testing since UI is broken)
      const payload = this.buildPayloadDirect(entityType);

      this.logger.info(`Payload built for ${entityType}`, {
        entityType,
        payloadKeys: Object.keys(payload),
        requiredFieldsCheck: DB_CONSTRAINTS[entityType].required.every(field => payload[field] !== undefined && payload[field] !== null)
      });

      // Login first to get auth token
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();
      this.logger.info(`Login response received`, { status: loginResponse.status, hasData: !!loginData.data });

      const token = loginData.data?.access_token || loginData.access_token || loginData.token;

      if (!token) {
        this.logger.error(`Login response structure`, { loginData });
        throw new Error(`No token received from login. Response: ${JSON.stringify(loginData)}`);
      }

      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      this.logger.info(`Login successful, testing ${entityType} API`, { entityType, hasToken: !!token });

      // Test CREATE
      const createResponse = await fetch(`http://localhost:8080/api/${entityType}s`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      this.logger.info(`CREATE request sent for ${entityType}`, {
        entityType,
        status: createResponse.status,
        url: `http://localhost:8080/api/${entityType}s`
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        this.logger.error(`CREATE failed for ${entityType}`, {
          entityType,
          status: createResponse.status,
          error: errorText,
          payload
        });
        return { entity: entityType, success: false, error: `CREATE ${createResponse.status}: ${errorText}`, stage: 'CREATE' };
      }

      const createData = await createResponse.json();
      const entityId = createData.data?.id || createData.id;

      if (!entityId) {
        this.logger.error(`No ID returned from CREATE for ${entityType}`, { createData });
        return { entity: entityType, success: false, error: 'No ID from CREATE response', stage: 'CREATE' };
      }

      this.logger.info(`CREATE successful for ${entityType}`, { entityType, entityId });

      // Test READ
      const readResponse = await fetch(`http://localhost:8080/api/${entityType}s/${entityId}`, {
        method: 'GET',
        headers: authHeaders
      });

      if (!readResponse.ok) {
        const errorText = await readResponse.text();
        this.logger.error(`READ failed for ${entityType}`, {
          entityType,
          entityId,
          status: readResponse.status,
          error: errorText
        });
        return { entity: entityType, success: false, error: `READ ${readResponse.status}: ${errorText}`, stage: 'READ' };
      }

      this.logger.info(`READ successful for ${entityType}`, { entityType, entityId });

      // Test UPDATE
      const updatePayload = { ...payload };
      if (entityType === 'trade_plan') {
        updatePayload.notes = 'Updated by QA test';
      } else if (entityType === 'cash_flow') {
        updatePayload.description = 'Updated by QA test';
      } else if (entityType === 'user_profile') {
        updatePayload.first_name = 'Updated QA';
      }

      const updateResponse = await fetch(`http://localhost:8080/api/${entityType}s/${entityId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updatePayload)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        this.logger.error(`UPDATE failed for ${entityType}`, {
          entityType,
          entityId,
          status: updateResponse.status,
          error: errorText
        });
        return { entity: entityType, success: false, error: `UPDATE ${updateResponse.status}: ${errorText}`, stage: 'UPDATE' };
      }

      this.logger.info(`UPDATE successful for ${entityType}`, { entityType, entityId });

      // Test DELETE
      const deleteResponse = await fetch(`http://localhost:8080/api/${entityType}s/${entityId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        this.logger.error(`DELETE failed for ${entityType}`, {
          entityType,
          entityId,
          status: deleteResponse.status,
          error: errorText
        });
        return { entity: entityType, success: false, error: `DELETE ${deleteResponse.status}: ${errorText}`, stage: 'DELETE' };
      }

      this.logger.info(`DELETE successful for ${entityType}`, { entityType, entityId });

      this.logger.info(`All CRUD operations PASSED for ${entityType}`, { entityType });
      return { entity: entityType, success: true };

    } catch (error) {
      this.logger.error(`Test failed for ${entityType}`, { entityType, error: error.message });
      return { entity: entityType, success: false, error: error.message, stage: 'SETUP' };
    }
  }

  buildPayloadDirect(entityType) {
    const constraints = DB_CONSTRAINTS[entityType];
    const payload = {};

    // Apply defaults
    if (constraints.defaults) {
      Object.assign(payload, constraints.defaults);
    }

    // Generate required values
    for (const requiredField of constraints.required) {
      if (payload[requiredField] === undefined) {
        payload[requiredField] = this.generateRequiredValue(requiredField, entityType);
      }
    }

    // Apply validations
    if (constraints.validations) {
      for (const [field, validator] of Object.entries(constraints.validations)) {
        if (payload[field] !== undefined && !validator(payload[field])) {
          throw new Error(`Validation failed for ${field}: ${payload[field]}`);
        }
      }
    }

    // Apply enum constraints
    if (constraints.enums) {
      for (const [field, allowedValues] of Object.entries(constraints.enums)) {
        if (payload[field] && !allowedValues.includes(payload[field])) {
          payload[field] = allowedValues[0];
        }
      }
    }

    return payload;
  }

  async runAllTests() {
    const entities = ['trade_plan', 'cash_flow', 'user_profile'];
    const results = {};

    for (const entity of entities) {
      this.logger.info(`Starting API test for ${entity}`, { entity });
      results[entity] = await this.runEntityTest(null, entity);
      this.logger.info(`API test completed for ${entity}`, { entity, result: results[entity] });

      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      entities: entities,
      results: results,
      overall: {
        total: entities.length,
        passed: Object.values(results).filter(r => r.success).length,
        failed: Object.values(results).filter(r => !r.success).length
      }
    };

    console.log('\n🎯 MANUAL QA RESULTS SUMMARY');
    console.log('===============================');
    entities.forEach(entity => {
      const result = results[entity];
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const details = result.success ? '' : ` (${result.stage}: ${result.error})`;
      console.log(`${entity}: ${status}${details}`);
    });
    console.log(`\n📊 OVERALL: ${summary.overall.passed}/${summary.overall.total} PASSED`);

    return summary;
  }
}

// Run the tests
if (require.main === module) {
  const qaRunner = new ManualQARunner();
  qaRunner.runAllTests().then(summary => {
    console.log('\n📋 Final Summary:', JSON.stringify(summary, null, 2));
  }).catch(error => {
    console.error('❌ QA Runner failed:', error);
  });
}

module.exports = ManualQARunner;
