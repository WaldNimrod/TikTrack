#!/usr/bin/env node
/**
 * Script to check header initialization method across all pages
 * בודק בפועל איזה שיטת איתחול header רץ בכל עמוד
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tradingUiDir = path.join(projectRoot, 'trading-ui');

// Auth pages to skip
const AUTH_PAGES = ['login.html', 'register.html', 'forgot_password.html', 'reset_password.html'];

function getAllHtmlPages() {
  const pages = [];
  const files = fs.readdirSync(tradingUiDir);
  
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    
    // Skip auth pages
    if (AUTH_PAGES.some(auth => file.includes(auth))) continue;
    
    // Skip test pages and smart pages
    if (file.startsWith('test-') || file.endsWith('-smart.html')) continue;
    
    // Skip mockups
    if (file.toLowerCase().includes('mockup')) continue;
    
    pages.push(file);
  }
  
  return pages.sort();
}

async function checkPage(browser, pageName, baseUrl = 'http://localhost:8080') {
  const page = await browser.newPage();
  
  try {
    // Listen to console messages and capture HEADER INIT logs
    const consoleMessages = [];
    let headerInitMethod = null;
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      
      // Check for HEADER INIT messages
      if (text.includes('[HEADER INIT]')) {
        if (text.includes('PLANNED')) {
          headerInitMethod = 'planned';
        } else if (text.includes('FALLBACK')) {
          headerInitMethod = 'fallback';
        }
      }
    });
    
    // Navigate to page
    const url = `${baseUrl}/${pageName}`;
    console.log(`  Loading: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait longer for initialization (10 seconds to ensure everything loads and logs are written)
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check window.__headerSystemInitMethod first (most reliable)
    let method = headerInitMethod; // Use value captured from console listener
    
    if (!method) {
      try {
        const debugInfo = await page.evaluate(() => {
          return {
            headerSystemInitMethod: window.__headerSystemInitMethod || null,
            headerSystemExists: typeof window.headerSystem !== 'undefined',
            headerSystemInitialized: !!(window.headerSystem && window.headerSystem.isInitialized),
            unifiedAppExists: typeof window.UnifiedAppInitializer !== 'undefined',
            unifiedAppInitialized: window.globalInitializationState?.unifiedAppInitialized || false,
            localStorageLogs: localStorage.getItem('__headerInitLogs')
          };
        });
        
        method = debugInfo.headerSystemInitMethod;
        
        // If method not set but header is initialized, infer from context
        if (!method && debugInfo.headerSystemInitialized) {
          if (debugInfo.unifiedAppExists && debugInfo.unifiedAppInitialized) {
            method = 'planned';
          } else if (debugInfo.headerSystemInitialized) {
            method = 'fallback';
          }
        }
        
        // Check localStorage as backup
        if (!method && debugInfo.localStorageLogs) {
          try {
            const logs = JSON.parse(debugInfo.localStorageLogs);
            const pageLog = logs.find(log => {
              const logPage = log.page || '';
              return logPage.endsWith(pageName) || logPage.includes(pageName);
            });
            if (pageLog && pageLog.method) {
              method = pageLog.method;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      } catch (e) {
        // Ignore evaluation errors
      }
    }
    
    // Last resort: check console messages we captured
    if (!method) {
      for (const msg of consoleMessages) {
        if (msg.includes('[HEADER INIT]')) {
          if (msg.includes('PLANNED')) {
            method = 'planned';
            break;
          } else if (msg.includes('FALLBACK')) {
            method = 'fallback';
            break;
          }
        }
      }
    }
    
    // Last resort: check if header is initialized and infer method
    if (!method) {
      try {
        const headerInfo = await page.evaluate(() => {
          return {
            headerInitialized: !!(window.headerSystem && window.headerSystem.isInitialized),
            hasUnifiedApp: typeof window.UnifiedAppInitializer !== 'undefined',
            unifiedAppInitialized: window.globalInitializationState?.unifiedAppInitialized || false
          };
        });
        
        // If header is initialized and UnifiedAppInitializer exists, likely planned
        if (headerInfo.headerInitialized && headerInfo.hasUnifiedApp) {
          method = 'planned';
        } else if (headerInfo.headerInitialized) {
          method = 'fallback';
        }
      } catch (e) {
        // Ignore
      }
    }
    
    return method || 'unknown';
    
  } catch (error) {
    console.error(`  Error checking ${pageName}:`, error.message);
    return 'error';
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🔍 Checking header initialization method across all pages...');
  console.log('='.repeat(70));
  
  const pages = getAllHtmlPages();
  console.log(`Found ${pages.length} pages to check\n`);
  
  // Check if server is running
  try {
    const http = require('http');
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8080', (res) => {
        resolve();
      });
      req.on('error', reject);
      req.setTimeout(2000, () => reject(new Error('Timeout')));
    });
    console.log('✅ Server is running on http://localhost:8080\n');
  } catch (error) {
    console.error('❌ Server is not running. Please start it with: ./start_server.sh\n');
    process.exit(1);
  }
  
  const results = {
    planned: [],
    fallback: [],
    unknown: [],
    errors: []
  };
  
  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (let i = 0; i < pages.length; i++) {
      const pageName = pages[i];
      process.stdout.write(`[${i + 1}/${pages.length}] Checking ${pageName}... `);
      
      const method = await checkPage(browser, pageName);
      
      results[method].push(pageName);
      
      const emoji = method === 'planned' ? '✅' : method === 'fallback' ? '🔄' : method === 'error' ? '❌' : '❓';
      console.log(`${emoji} ${method.toUpperCase()}`);
    }
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(70));
  console.log(`✅ PLANNED method: ${results.planned.length} pages`);
  console.log(`🔄 FALLBACK method: ${results.fallback.length} pages`);
  console.log(`❓ UNKNOWN: ${results.unknown.length} pages`);
  if (results.errors.length > 0) {
    console.log(`❌ ERRORS: ${results.errors.length} pages`);
  }
  
  // Save results
  const resultsFile = path.join(projectRoot, 'documentation', '05-REPORTS', 'header-init-actual-results.json');
  fs.mkdirSync(path.dirname(resultsFile), { recursive: true });
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log(`\n💾 Results saved to: ${resultsFile}`);
  
  // Create markdown report
  const reportFile = path.join(projectRoot, 'documentation', '05-REPORTS', 'HEADER_INIT_ACTUAL_RESULTS.md');
  let report = `# Header Initialization Method - Actual Results\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Planned Method:** ${results.planned.length} pages\n`;
  report += `- **Fallback Method:** ${results.fallback.length} pages\n`;
  report += `- **Unknown:** ${results.unknown.length} pages\n`;
  if (results.errors.length > 0) {
    report += `- **Errors:** ${results.errors.length} pages\n`;
  }
  report += `\n## Pages with Planned Method\n\n`;
  for (const page of results.planned.sort()) {
    report += `- \`${page}\`\n`;
  }
  if (results.fallback.length > 0) {
    report += `\n## Pages with Fallback Method\n\n`;
    for (const page of results.fallback.sort()) {
      report += `- \`${page}\`\n`;
    }
  }
  if (results.unknown.length > 0) {
    report += `\n## Pages with Unknown Method\n\n`;
    for (const page of results.unknown.sort()) {
      report += `- \`${page}\`\n`;
    }
  }
  if (results.errors.length > 0) {
    report += `\n## Pages with Errors\n\n`;
    for (const page of results.errors.sort()) {
      report += `- \`${page}\`\n`;
    }
  }
  
  fs.writeFileSync(reportFile, report, 'utf-8');
  console.log(`📄 Report saved to: ${reportFile}`);
  
  return results;
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { main, checkPage, getAllHtmlPages };

