const puppeteer = require('puppeteer');

async function debugLoginRedirect() {
  console.log('🚀 Starting login redirect debugging with Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Collect network requests
  const networkLogs = [];
  page.on('response', response => {
    if (response.url().includes('/api/auth/me') || response.url().includes('login.html')) {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('📄 Navigating to login page...');
    await page.goto('http://127.0.0.1:8080/login.html', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait a bit for any redirects
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we got redirected
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Try to get localStorage logs
    const localStorageLogs = await page.evaluate(() => {
      try {
        const logs = localStorage.getItem('logger_pending_logs');
        return logs ? JSON.parse(logs) : [];
      } catch (e) {
        return [];
      }
    });
    
    console.log('\n📋 LOCAL STORAGE LOGS:');
    console.log(JSON.stringify(localStorageLogs, null, 2));
    
    console.log('\n🌐 NETWORK LOGS:');
    console.log(JSON.stringify(networkLogs, null, 2));
    
    console.log('\n📝 CONSOLE LOGS SUMMARY:');
    const relevantLogs = consoleLogs.filter(log => 
      log.text.includes('USER NOT AUTHENTICATED') || 
      log.text.includes('USER AUTHENTICATED') ||
      log.text.includes('REDIRECTING') ||
      log.text.includes('ALREADY ON LOGIN') ||
      log.text.includes('CRITICAL LOG DUMP')
    );
    console.log(JSON.stringify(relevantLogs, null, 2));
    
    // Check if page has redirect loop
    const hasRedirectLoop = networkLogs.filter(log => log.url.includes('login.html')).length > 2;
    console.log('\n🔄 REDIRECT LOOP DETECTED:', hasRedirectLoop);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugLoginRedirect().catch(console.error);
