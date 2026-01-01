/**
 * Run Monitoring Tests - Extract Mismatches Only
 * Tasks: Run allPagesMonitoringTest() and runDetailedPageScan()
 * Return: Summary of mismatches + timestamp
 */

const puppeteer = require('puppeteer');

async function runMonitoringTests() {
  console.log('🚀 Starting Monitoring Tests...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set up console logging to capture test results
    const mismatches = [];
    let allPagesTestComplete = false;
    let detailedScanComplete = false;

    page.on('console', msg => {
      const text = msg.text();
      console.log('CONSOLE:', text);

      // Capture mismatches from test results
      if (text.includes('MISMATCH') || text.includes('mismatch') ||
          text.includes('ERROR') || text.includes('FAILED')) {
        mismatches.push(text);
      }

      // Check for test completion markers
      if (text.includes('All Pages Monitoring Test Complete')) {
        allPagesTestComplete = true;
      }
      if (text.includes('Detailed Page Scan Complete') ||
          text.includes('Page scan completed')) {
        detailedScanComplete = true;
      }
    });

    // Navigate to monitoring page
    console.log('📍 Navigating to http://localhost:8080/test_monitoring');
    await page.goto('http://localhost:8080/test_monitoring', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run allPagesMonitoringTest()
    console.log('🔍 Running allPagesMonitoringTest()...');
    await page.evaluate(() => {
      if (typeof allPagesMonitoringTest === 'function') {
        console.log('Starting allPagesMonitoringTest...');
        return allPagesMonitoringTest();
      } else {
        console.log('ERROR: allPagesMonitoringTest function not found');
        return null;
      }
    });

    // Wait for test to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Run runDetailedPageScan()
    console.log('🔍 Running runDetailedPageScan()...');
    await page.evaluate(() => {
      if (typeof runDetailedPageScan === 'function') {
        console.log('Starting runDetailedPageScan...');
        return runDetailedPageScan();
      } else {
        console.log('ERROR: runDetailedPageScan function not found');
        return null;
      }
    });

    // Wait for scan to complete
    await page.waitForTimeout(10000);

    // Extract any final results from page
    const pageContent = await page.evaluate(() => {
      // Try to get results from any global variables or DOM elements
      const results = {};

      // Check for any monitoring results in global scope
      if (window.monitoringResults) {
        results.monitoringResults = window.monitoringResults;
      }

      // Check for any mismatches in DOM
      const mismatchElements = document.querySelectorAll('[class*="mismatch"], [id*="mismatch"]');
      if (mismatchElements.length > 0) {
        results.domMismatches = Array.from(mismatchElements).map(el => el.textContent);
      }

      return results;
    });

    const timestamp = new Date().toISOString();

    console.log('\n📊 MONITORING TEST RESULTS SUMMARY');
    console.log('===================================');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Mismatches found: ${mismatches.length}`);

    if (mismatches.length > 0) {
      console.log('\n🔍 MISMATCHES:');
      mismatches.forEach((mismatch, index) => {
        console.log(`${index + 1}. ${mismatch}`);
      });
    } else {
      console.log('✅ No mismatches detected in console output');
    }

    if (pageContent.monitoringResults) {
      console.log('\n📋 Page Content Results:');
      console.log(JSON.stringify(pageContent.monitoringResults, null, 2));
    }

    if (pageContent.domMismatches && pageContent.domMismatches.length > 0) {
      console.log('\n🔍 DOM Mismatches:');
      pageContent.domMismatches.forEach((mismatch, index) => {
        console.log(`${index + 1}. ${mismatch}`);
      });
    }

    // Return summary
    const summary = {
      timestamp,
      totalMismatches: mismatches.length,
      consoleMismatches: mismatches,
      pageContent: pageContent,
      testCompletion: {
        allPagesMonitoringTest: allPagesTestComplete,
        runDetailedPageScan: detailedScanComplete
      }
    };

    console.log('\n📋 FINAL SUMMARY:');
    console.log(JSON.stringify(summary, null, 2));

    return summary;

  } catch (error) {
    console.error('❌ Error running monitoring tests:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
if (require.main === module) {
  runMonitoringTests().then(summary => {
    console.log('\n✅ Monitoring tests completed');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Monitoring tests failed:', error);
    process.exit(1);
  });
}

module.exports = runMonitoringTests;
