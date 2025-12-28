// Simple test script to check sorting functionality
const { chromium } = require('playwright');

async function testSorting() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to testing dashboard
    await page.goto('http://localhost:8080/trading-ui/crud_testing_dashboard.html');
    
    // Wait for page to load
    await page.waitForSelector('#runAllTableSortingTests');
    
    // Click the sorting test button
    await page.click('#runAllTableSortingTests');
    
    // Wait for results
    await page.waitForSelector('#testResultsBody tr', { timeout: 60000 });
    
    // Get the results
    const results = await page.$$eval('#testResultsBody tr', rows => {
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
          return {
            number: cells[0].textContent.trim(),
            page: cells[1].textContent.trim(),
            type: cells[2].textContent.trim(),
            status: cells[3].textContent.trim(),
            time: cells[4].textContent.trim(),
            message: cells[5].textContent.trim()
          };
        }
        return null;
      }).filter(Boolean);
    });
    
    console.log('Test Results:');
    results.forEach(result => {
      console.log(`${result.number}. ${result.page} - ${result.message}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSorting();
