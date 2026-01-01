const puppeteer = require('puppeteer');

async function debugFullFlow() {
  console.log('🚀 Starting full authentication flow debugging...');
  
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
    if (msg.text().includes('USER NOT AUTHENTICATED') || 
        msg.text().includes('USER AUTHENTICATED') ||
        msg.text().includes('REDIRECTING') ||
        msg.text().includes('ALREADY ON LOGIN') ||
        msg.text().includes('login.js') ||
        msg.text().includes('auth.js')) {
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  // Collect network requests
  const networkLogs = [];
  page.on('response', response => {
    if (response.url().includes('/api/auth/') || 
        response.url().includes('login.html') || 
        response.url().includes('crud_testing_dashboard.html')) {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
      console.log(`🌐 ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📄 Step 1: Navigate to dashboard (should redirect to login)...');
    await page.goto('http://127.0.0.1:8080/crud_testing_dashboard.html', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('📍 After dashboard load:', page.url());
    
    // Check if redirected to login
    if (page.url().includes('login.html')) {
      console.log('✅ Correctly redirected to login');
      
      // Now try to login
      console.log('📝 Step 2: Attempting login...');
      
      // Fill in login form
      await page.waitForSelector('#username', { timeout: 5000 });
      await page.type('#username', 'admin');
      await page.type('#password', 'admin123');
      
      // Click login button
      await page.click('button[type="submit"]');
      
      console.log('🎯 Login form submitted');
      
      // Wait for redirect or modal
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const postLoginUrl = page.url();
      console.log('📍 After login attempt:', postLoginUrl);
      
      // Check if still on login page (modal opened)
      if (postLoginUrl.includes('login.html')) {
        console.log('📋 Login modal opened, checking for redirect...');
        
        // Wait longer for redirect
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalUrl = page.url();
        console.log('📍 Final URL after login:', finalUrl);
        
        if (finalUrl.includes('crud_testing_dashboard.html')) {
          console.log('✅ Successfully redirected to dashboard after login');
        } else if (finalUrl.includes('login.html')) {
          console.log('❌ Still on login page - possible loop');
        } else {
          console.log('❓ Redirected to unexpected page:', finalUrl);
        }
      }
    } else {
      console.log('❌ Should have been redirected to login but wasn\'t');
    }
    
    // Final analysis
    const loginRequests = networkLogs.filter(log => log.url.includes('login.html'));
    const authRequests = networkLogs.filter(log => log.url.includes('/api/auth/'));
    
    console.log('\n🔍 FINAL ANALYSIS:');
    console.log(`- Login page loads: ${loginRequests.length}`);
    console.log(`- Auth API calls: ${authRequests.length}`);
    console.log(`- Final URL: ${page.url()}`);
    
    // Check for loops
    const hasLoop = loginRequests.length > 3;
    console.log(`- LOOP DETECTED: ${hasLoop}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugFullFlow().catch(console.error);
