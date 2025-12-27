const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Set to false to see what's happening
  const page = await browser.newPage();

  try {
    // Navigate to the CRUD testing dashboard
    console.log('Navigating to CRUD testing dashboard...');
    await page.goto('http://localhost:8080/crud_testing_dashboard.html');

    // Wait for the page to load
    await page.waitForSelector('#testResultsTable', { timeout: 10000 });
    console.log('Page loaded, table found');

    // Look for sorting test buttons
    const buttons = await page.$$('button');
    console.log('Found', buttons.length, 'buttons on page');

    // Try to find a button that might trigger sorting tests
    const sortingButton = await page.$('[onclick*="sorting"], [data-test*="sorting"]');
    if (sortingButton) {
      console.log('Found sorting button, clicking...');
      await sortingButton.click();

      // Wait for results
      await page.waitForTimeout(5000);

      // Check if results appeared in the table
      const rows = await page.$$('#testResultsBody tr');
      console.log('Number of result rows after test:', rows.length);

      if (rows.length > 1) { // More than just the waiting message
        console.log('✅ Results are displaying in the table!');

        // Get all result rows content
        for (let i = 0; i < rows.length; i++) {
          const text = await page.evaluate(el => el.textContent, rows[i]);
          console.log(`Row ${i}:`, text);
        }
      } else {
        console.log('❌ No results in table');
        const waitingRow = await page.$('#testResultsBody tr');
        if (waitingRow) {
          const text = await page.evaluate(el => el.textContent, waitingRow);
          console.log('Waiting message:', text);
        }
      }
    } else {
      console.log('❌ Sorting test button not found');

      // Log all button texts to see what's available
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await page.evaluate(el => el.textContent || el.innerText, buttons[i]);
        console.log(`Button ${i}: "${text}"`);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }

  // Keep browser open for manual inspection
  console.log('Browser will stay open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
