/**
 * Focused CRUD Tests - trade_plan and cash_flow only
 * Manual run in dashboard with logger + network evidence
 */

const puppeteer = require('puppeteer');

async function runFocusedCRUDTests() {
  console.log('🚀 Starting Focused CRUD Tests - trade_plan + cash_flow only');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Need to see the browser for manual interaction
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();

    // Set up console logging to capture logger evidence
    const loggerEvidence = [];
    const networkEvidence = [];

    page.on('console', msg => {
      const text = msg.text();
      console.log('CONSOLE:', text);

      // Capture logger evidence
      if (text.includes('[INFO]') || text.includes('[ERROR]') || text.includes('[WARN]') ||
          text.includes('CREATE') || text.includes('READ') || text.includes('UPDATE') || text.includes('DELETE') ||
          text.includes('activeTradingAccountId') || text.includes('trading_account_id')) {
        loggerEvidence.push(`${new Date().toISOString()}: ${text}`);
      }
    });

    // Set up network monitoring
    page.on('response', response => {
      const url = response.url();
      const method = response.request().method();
      const status = response.status();

      // Capture API calls to trade_plans and cash_flows
      if (url.includes('/api/trade_plans') || url.includes('/api/cash_flows')) {
        networkEvidence.push({
          timestamp: new Date().toISOString(),
          method,
          url,
          status,
          requestHeaders: response.request().headers(),
          responseHeaders: response.headers()
        });
      }
    });

    // Navigate to CRUD testing dashboard
    console.log('📍 Navigating to http://localhost:8080/crud_testing_dashboard');
    await page.goto('http://localhost:8080/crud_testing_dashboard', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('✅ Page loaded. Manual testing required:');
    console.log('1. Login as admin/admin123 if needed');
    console.log('2. Click "trade_plan" button');
    console.log('3. Click "CREATE" button');
    console.log('4. Verify active_trading_account_id is used');
    console.log('5. Click "READ" button');
    console.log('6. Click "UPDATE" button');
    console.log('7. Click "DELETE" button');
    console.log('8. Repeat steps 2-7 for "cash_flow"');

    // Wait for manual testing to complete
    console.log('\n⏳ Waiting for manual testing completion...');
    console.log('Press Ctrl+C when testing is complete');

    // Keep browser open for manual testing
    process.on('SIGINT', async () => {
      console.log('\n📊 COLLECTING FINAL RESULTS...');

      const timestamp = new Date().toISOString();

      const results = {
        timestamp,
        testScope: 'trade_plan + cash_flow only',
        loggerEvidence: loggerEvidence.slice(-20), // Last 20 logger entries
        networkEvidence: networkEvidence.slice(-10), // Last 10 network calls
        manualStepsCompleted: true
      };

      console.log('\n📋 LOGGER EVIDENCE (Last 20 entries):');
      results.loggerEvidence.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry}`);
      });

      console.log('\n📋 NETWORK EVIDENCE (Last 10 API calls):');
      results.networkEvidence.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.method} ${entry.url} → ${entry.status}`);
      });

      // Save results to file
      const fs = require('fs');
      fs.writeFileSync('focused_crud_results.json', JSON.stringify(results, null, 2));

      console.log('\n💾 Results saved to focused_crud_results.json');
      console.log('📊 Summary will be added to professional_report_2025_12_31.md');

      await browser.close();
      process.exit(0);
    });

    // Keep the script running
    await new Promise(() => {}); // Will be interrupted by SIGINT

  } catch (error) {
    console.error('❌ Error running focused tests:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

// Run the tests
if (require.main === module) {
  runFocusedCRUDTests().catch(console.error);
}
