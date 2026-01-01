const puppeteer = require('puppeteer');

async function debugDashboardRedirect() {
  console.log('🚀 Starting dashboard redirect debugging with Puppeteer...');
  
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
    if (response.url().includes('/api/auth/me') || response.url().includes('login.html') || response.url().includes('crud_testing_dashboard.html')) {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('📄 Navigating to dashboard (should redirect to login)...');
    await page.goto('http://127.0.0.1:8080/crud_testing_dashboard.html', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait a bit for any redirects
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check final URL
    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);
    
    // Check if we got redirected to login
    const redirectedToLogin = finalUrl.includes('login.html');
    console.log('🔄 Redirected to login:', redirectedToLogin);
    
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
      log.text.includes('CRITICAL LOG DUMP') ||
      log.text.includes('checkAuthentication')
    );
    console.log(JSON.stringify(relevantLogs, null, 2));
    
    // Check for redirect loop
    const loginRequests = networkLogs.filter(log => log.url.includes('login.html'));
    const hasRedirectLoop = loginRequests.length > 2;
    console.log('\n🔄 REDIRECT LOOP DETECTED:', hasRedirectLoop, `(login.html requests: ${loginRequests.length})`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDashboardRedirect().catch(console.error);
