/**
 * Stage 2 Batch 1 QA - executions + trading_accounts
 * Run each entity twice (Chrome + Firefox) with Logger + Network evidence
 */

const puppeteer = require('puppeteer');

class Stage2Batch1QA {
  constructor() {
    this.logger = {
      info: (msg, data) => this.sendLog('INFO', msg, data),
      error: (msg, data) => this.sendLog('ERROR', msg, data),
      warn: (msg, data) => this.sendLog('WARN', msg, data),
      debug: (msg, data) => this.sendLog('DEBUG', msg, data)
    };
    this.results = {
      chrome: { executions: null, trading_accounts: null },
      firefox: { executions: null, trading_accounts: null }
    };
  }

  sendLog(level, message, data = {}) {
    const logEntry = {
      sessionId: 'stage2-batch1-qa',
      runId: `stage2-batch1-${Date.now()}`,
      hypothesisId: 'stage2-batch1-validation',
      location: 'run_stage2_batch1_qa.js',
      message,
      data: { ...data, level, timestamp: Date.now() }
    };

    // Write to debug log
    const fs = require('fs');
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync('/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log', logLine);

    console.log(`[${level}] ${message}`);
  }

  async runBrowserTest(browserType, entityType) {
    this.logger.info(`Starting ${browserType} test for ${entityType}`, { browserType, entityType });

    let browser;
    try {
      const browserConfig = browserType === 'chrome'
        ? { headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
        : { headless: false, product: 'firefox', args: ['--no-sandbox'] };

      browser = await puppeteer.launch(browserConfig);

      const page = await browser.newPage();

      // Set up console logging
      const consoleLogs = [];
      page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push(`${new Date().toISOString()}: ${text}`);
        this.logger.info(`Console [${browserType}][${entityType}]: ${text}`, {
          browserType,
          entityType,
          consoleMessage: text
        });
      });

      // Set up network monitoring
      const networkLogs = [];
      page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/executions') || url.includes('/api/trading_accounts')) {
          networkLogs.push({
            timestamp: new Date().toISOString(),
            method: response.request().method(),
            url,
            status: response.status(),
            success: response.ok
          });
        }
      });

      // Navigate to CRUD testing dashboard
      this.logger.info(`Navigating to dashboard in ${browserType}`, { browserType, entityType });
      await page.goto('http://localhost:8080/crud_testing_dashboard', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Click on the entity button
      this.logger.info(`Clicking ${entityType} button in ${browserType}`, { browserType, entityType });
      await page.click(`button[onclick*="run${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Test"]`);

      // Wait for modal/load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Click CREATE
      this.logger.info(`Clicking CREATE for ${entityType} in ${browserType}`, { browserType, entityType });
      const createButton = await page.$('button:has-text("CREATE")');
      if (createButton) {
        await createButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Click READ
      this.logger.info(`Clicking READ for ${entityType} in ${browserType}`, { browserType, entityType });
      const readButton = await page.$('button:has-text("READ")');
      if (readButton) {
        await readButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Click UPDATE
      this.logger.info(`Clicking UPDATE for ${entityType} in ${browserType}`, { browserType, entityType });
      const updateButton = await page.$('button:has-text("UPDATE")');
      if (updateButton) {
        await updateButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Click DELETE
      this.logger.info(`Clicking DELETE for ${entityType} in ${browserType}`, { browserType, entityType });
      const deleteButton = await page.$('button:has-text("DELETE")');
      if (deleteButton) {
        await deleteButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Collect results
      const result = {
        browserType,
        entityType,
        success: true, // Assume success unless we see errors
        consoleLogs: consoleLogs.slice(-10), // Last 10 logs
        networkLogs: networkLogs.slice(-5), // Last 5 network calls
        timestamp: new Date().toISOString()
      };

      // Check for errors in console logs
      const errorLogs = consoleLogs.filter(log => log.includes('ERROR') || log.includes('error'));
      if (errorLogs.length > 0) {
        result.success = false;
        result.errors = errorLogs;
        this.logger.error(`Found errors in ${browserType} for ${entityType}`, {
          browserType,
          entityType,
          errorCount: errorLogs.length,
          errors: errorLogs
        });
      } else {
        this.logger.info(`No errors found in ${browserType} for ${entityType}`, {
          browserType,
          entityType,
          totalLogs: consoleLogs.length
        });
      }

      this.logger.info(`Completed ${browserType} test for ${entityType}`, {
        browserType,
        entityType,
        success: result.success,
        networkCalls: networkLogs.length
      });

      return result;

    } catch (error) {
      this.logger.error(`Browser test failed for ${browserType} ${entityType}`, {
        browserType,
        entityType,
        error: error.message
      });

      return {
        browserType,
        entityType,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async runAllTests() {
    console.log('🎯 STAGE 2 BATCH 1 QA - executions + trading_accounts');
    console.log('===================================================');

    const entities = ['executions', 'trading_accounts'];

    for (const browserType of ['chrome', 'firefox']) {
      console.log(`\n🌐 Testing in ${browserType.toUpperCase()}:`);

      for (const entityType of entities) {
        console.log(`  🔍 Testing ${entityType}...`);
        this.logger.info(`Starting ${browserType} test for ${entityType}`, { browserType, entityType });

        const result = await this.runBrowserTest(browserType, entityType);
        this.results[browserType][entityType] = result;

        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`    ${entityType}: ${status}`);
      }
    }

    // Generate summary
    this.generateSummary();

    return this.results;
  }

  generateSummary() {
    console.log('\n📊 STAGE 2 BATCH 1 QA SUMMARY');
    console.log('==============================');

    const entities = ['executions', 'trading_accounts'];
    const browsers = ['chrome', 'firefox'];

    let totalTests = 0;
    let passedTests = 0;

    for (const entity of entities) {
      console.log(`\n${entity.toUpperCase()}:`);
      for (const browser of browsers) {
        const result = this.results[browser][entity];
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${browser}: ${status}`);

        if (result.errors && result.errors.length > 0) {
          console.log('    Errors:');
          result.errors.forEach(error => console.log(`      - ${error}`));
        }

        totalTests++;
        if (result.success) passedTests++;
      }
    }

    console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} PASSED`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('❌ Some tests failed. Check logger evidence for details.');
    }

    // Save detailed results
    const fs = require('fs');
    fs.writeFileSync('stage2_batch1_qa_results.json', JSON.stringify(this.results, null, 2));

    console.log('\n💾 Results saved to stage2_batch1_qa_results.json');
    console.log('📋 Logger evidence in .cursor/debug.log');
  }
}

// Run the tests
if (require.main === module) {
  const qa = new Stage2Batch1QA();
  qa.runAllTests().then(results => {
    console.log('\n✅ Stage 2 Batch 1 QA completed');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Stage 2 Batch 1 QA failed:', error);
    process.exit(1);
  });
}

module.exports = Stage2Batch1QA;
