#!/usr/bin/env node
/**
 * Quick script to check for JavaScript errors preventing page load
 */

const puppeteer = require('puppeteer');

async function checkPage(pageName) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = [];
  const consoleMessages = [];
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', err => {
    errors.push({
      message: err.message,
      stack: err.stack
    });
  });
  
  page.on('requestfailed', req => {
    if (req.resourceType() === 'script') {
      errors.push({
        message: `Script failed to load: ${req.url()}`,
        type: 'network'
      });
    }
  });
  
  try {
    console.log(`Checking ${pageName}...`);
    await page.goto(`http://localhost:8080/${pageName}`, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    // Wait a bit for scripts to execute
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for errors in page
    const pageErrors = await page.evaluate(() => {
      return {
        hasErrors: window.__LAST_GLOBAL_ERROR || null,
        headerSystemInitMethod: window.__headerSystemInitMethod || null,
        headerSystemInitialized: !!(window.headerSystem && window.headerSystem.isInitialized),
        unifiedAppInitialized: window.globalInitializationState?.unifiedAppInitialized || false
      };
    });
    
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Console messages: ${consoleMessages.length}`);
    console.log(`  Header initialized: ${pageErrors.headerSystemInitialized}`);
    console.log(`  Init method: ${pageErrors.headerSystemInitMethod || 'unknown'}`);
    
    if (errors.length > 0) {
      console.log('\n  ERRORS FOUND:');
      errors.forEach((err, i) => {
        console.log(`    ${i + 1}. ${err.message}`);
        if (err.stack) {
          console.log(`       ${err.stack.split('\n')[0]}`);
        }
      });
    }
    
    // Check for critical console errors
    const criticalErrors = consoleMessages.filter(msg => 
      msg.type === 'error' || 
      msg.text.includes('Error') || 
      msg.text.includes('SyntaxError') ||
      msg.text.includes('Unexpected')
    );
    
    if (criticalErrors.length > 0) {
      console.log('\n  CRITICAL CONSOLE ERRORS:');
      criticalErrors.forEach((err, i) => {
        console.log(`    ${i + 1}. [${err.type}] ${err.text.substring(0, 100)}`);
      });
    }
    
    return {
      page: pageName,
      errors: errors.length,
      criticalConsoleErrors: criticalErrors.length,
      headerInitialized: pageErrors.headerSystemInitialized,
      initMethod: pageErrors.headerSystemInitMethod
    };
    
  } catch (error) {
    console.error(`  Failed to load: ${error.message}`);
    return {
      page: pageName,
      errors: 1,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const testPages = ['trades.html', 'tickers.html', 'trading_accounts.html', 'index.html'];
  
  console.log('🔍 Checking for JavaScript errors...\n');
  
  for (const page of testPages) {
    await checkPage(page);
    console.log('');
  }
}

main().catch(console.error);


