const puppeteer = require('puppeteer');

async function debugLoginLoop() {
  console.log('🚀 Starting login page loop debugging with Puppeteer...');
  
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
    networkLogs.push({
      url: response.url(),
      status: response.status(),
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    console.log('📄 Step 1: Navigate to login page...');
    await page.goto('http://127.0.0.1:8080/login.html', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait for login page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📄 Step 2: Check if login page redirects itself...');
    let currentUrl = page.url();
    console.log('Current URL after load:', currentUrl);
    
    // Monitor for redirects for 10 seconds
    let redirectCount = 0;
    const initialUrl = currentUrl;
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUrl = page.url();
      
      if (newUrl !== currentUrl) {
        redirectCount++;
        console.log(`🔄 Redirect ${redirectCount}: ${currentUrl} → ${newUrl}`);
        currentUrl = newUrl;
        
        // If redirected back to login, that's a loop
        if (newUrl === initialUrl && redirectCount > 1) {
          console.log('🚨 LOOP DETECTED: Redirected back to login page!');
          break;
        }
      }
    }
    
    const finalUrl = page.url();
    console.log('📍 Final URL after monitoring:', finalUrl);
    
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
    
    console.log('\n🌐 NETWORK LOGS (last 10):');
    const recentNetwork = networkLogs.slice(-10);
    console.log(JSON.stringify(recentNetwork, null, 2));
    
    console.log('\n📝 CONSOLE LOGS SUMMARY (last 20):');
    const recentConsole = consoleLogs.slice(-20);
    const relevantLogs = recentConsole.filter(log => 
      log.text.includes('USER NOT AUTHENTICATED') || 
      log.text.includes('USER AUTHENTICATED') ||
      log.text.includes('REDIRECTING') ||
      log.text.includes('ALREADY ON LOGIN') ||
      log.text.includes('CRITICAL LOG DUMP') ||
      log.text.includes('checkAuthentication') ||
      log.text.includes('auth-guard')
    );
    console.log(JSON.stringify(relevantLogs, null, 2));
    
    // Check for redirect patterns
    const loginRequests = networkLogs.filter(log => log.url.includes('login.html'));
    const apiAuthRequests = networkLogs.filter(log => log.url.includes('/api/auth/me'));
    const redirects = networkLogs.filter(log => log.status === 302 || log.status === 301);
    
    console.log('\n🔍 ANALYSIS:');
    console.log(`- Login page requests: ${loginRequests.length}`);
    console.log(`- API auth requests: ${apiAuthRequests.length}`);
    console.log(`- Redirects: ${redirects.length}`);
    console.log(`- Final URL: ${finalUrl}`);
    console.log(`- Started at: ${initialUrl}`);
    
    const hasLoop = loginRequests.length > 2 || (finalUrl === initialUrl && redirectCount > 0);
    console.log(`- LOOP DETECTED: ${hasLoop}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugLoginLoop().catch(console.error);
