/**
 * Automated Browser Tests Runner for AI Analysis
 * ==============================================
 * 
 * Runs browser tests automatically using Playwright
 * 
 * Usage:
 *   node scripts/run-browser-tests-automated.js
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const PAGE_URL = `${BASE_URL}/trading-ui/ai-analysis.html`;

async function runBrowserTests() {
  console.log('🌐 Starting automated browser tests...\n');
  
  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Server is not running!');
    console.error('Please start the server with: ./start_server.sh');
    process.exit(1);
  }

  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`📄 Navigating to: ${PAGE_URL}`);
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(3000); // Wait for all scripts to load

    // Wait for test functions to be available
    console.log('🔍 Checking if test functions are loaded...');
    
    // Check if browser test suite is loaded
    const browserTestLoaded = await page.evaluate(() => {
      return typeof window.runAllAIAnalysisTests === 'function';
    });

    if (!browserTestLoaded) {
      console.log('⚠️  Browser test suite not found. Loading script...');
      
      // Try to inject the browser test script
      const fs = require('fs');
      const path = require('path');
      const browserTestPath = path.join(__dirname, '../trading-ui/scripts/testing/automated/ai-analysis-browser-test.js');
      
      if (fs.existsSync(browserTestPath)) {
        const browserTestContent = fs.readFileSync(browserTestPath, 'utf8');
        await page.evaluate((script) => {
          eval(script);
        }, browserTestContent);
        
        // Wait a bit for script to initialize
        await page.waitForTimeout(1000);
      } else {
        console.error('❌ Browser test file not found:', browserTestPath);
        throw new Error('Browser test file not found');
      }
    }

    // Check if performance test suite is loaded
    const perfTestLoaded = await page.evaluate(() => {
      return typeof window.runAIAnalysisPerformanceTests === 'function';
    });

    if (!perfTestLoaded) {
      console.log('⚠️  Performance test suite not found. Loading script...');
      
      // Try to inject the performance test script
      const fs = require('fs');
      const path = require('path');
      const perfTestPath = path.join(__dirname, '../trading-ui/scripts/testing/automated/ai-analysis-performance-test.js');
      
      if (fs.existsSync(perfTestPath)) {
        const perfTestContent = fs.readFileSync(perfTestPath, 'utf8');
        await page.evaluate((script) => {
          eval(script);
        }, perfTestContent);
        
        // Wait a bit for script to initialize
        await page.waitForTimeout(1000);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 Running Browser Tests');
    console.log('='.repeat(60) + '\n');

    // Run browser tests
    const browserTestResults = await page.evaluate(async () => {
      if (typeof window.runAllAIAnalysisTests === 'function') {
        return await window.runAllAIAnalysisTests();
      }
      return null;
    });

    if (browserTestResults) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 Browser Test Results');
      console.log('='.repeat(60));
      console.log(`Total Tests: ${browserTestResults.total}`);
      console.log(`Passed: ${browserTestResults.passed} ✅`);
      console.log(`Failed: ${browserTestResults.failed} ${browserTestResults.failed > 0 ? '❌' : ''}`);
      console.log(`Duration: ${(browserTestResults.duration / 1000).toFixed(2)}s`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('⚡ Running Performance Tests');
    console.log('='.repeat(60) + '\n');

    // Run performance tests
    await page.waitForTimeout(2000); // Wait between test suites
    
    const perfTestResults = await page.evaluate(async () => {
      if (typeof window.runAIAnalysisPerformanceTests === 'function') {
        return await window.runAIAnalysisPerformanceTests();
      }
      return null;
    });

    if (perfTestResults) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 Performance Test Results');
      console.log('='.repeat(60));
      console.log(`Total Tests: ${perfTestResults.summary.total}`);
      console.log(`Passed: ${perfTestResults.summary.passed} ✅`);
      console.log(`Failed: ${perfTestResults.summary.failed} ${perfTestResults.summary.failed > 0 ? '❌' : ''}`);
      console.log(`Warnings: ${perfTestResults.summary.warnings} ${perfTestResults.summary.warnings > 0 ? '⚠️' : ''}`);
      console.log(`Duration: ${(perfTestResults.duration / 1000).toFixed(2)}s`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    console.log('\nBrowser will stay open for 10 seconds for manual inspection...');
    
    // Keep browser open for 10 seconds
    await page.waitForTimeout(10000);

    console.log('\n🔒 Closing browser...');
    await browser.close();
    
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('\n❌ Error running tests:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Run tests
runBrowserTests().catch(console.error);

