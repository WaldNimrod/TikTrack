/**
 * 🧪 Notification System Tester
 * בדיקות אוטומטיות למערכת התראות
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - runAllTests() - Runalltests

// === Event Handlers ===
// - testFunctionAvailability() - Testfunctionavailability
// - testSmartFunctions() - Testsmartfunctions
// - testBasicNotifications() - Testbasicnotifications
// - testAutoDetection() - Testautodetection

// === Other ===
// - testCategories() - Testcategories
// - testPerformance() - Testperformance
// - quickTest() - Quicktest

console.log('🧪 Notification System Tester loaded');

// ===== בדיקות בסיסיות =====

/**
 * בדיקת זמינות פונקציות
 */
function testFunctionAvailability() {
  console.log('🔍 Testing function availability...');
  
  const functions = [
    'showNotification',
    'showSuccessNotification', 
    'showErrorNotification',
    'showWarningNotification',
    'showInfoNotification',
    'shouldShowNotification',
    'shouldLogToConsole',
    'logWithCategory'
  ];
  
  const results = {};
  functions.forEach(func => {
    results[func] = typeof window[func] === 'function';
    console.log(`${results[func] ? '✅' : '❌'} ${func}: ${results[func]}`);
  });
  
  return results;
}

/**
 * בדיקת פונקציות חכמות
 */
function testSmartFunctions() {
  console.log('🧠 Testing smart functions...');
  
  const smartFunctions = [
    'showNotificationSmart',
    'showSuccessNotificationSmart',
    'showErrorNotificationSmart', 
    'showWarningNotificationSmart',
    'showInfoNotificationSmart'
  ];
  
  const results = {};
  smartFunctions.forEach(func => {
    results[func] = typeof window[func] === 'function';
    console.log(`${results[func] ? '✅' : '❌'} ${func}: ${results[func]}`);
  });
  
  return results;
}

/**
 * בדיקת קטגוריות
 */
async function testCategories() {
  console.log('📊 Testing notification categories...');
  
  const categories = ['system', 'business', 'ui', 'development', 'performance'];
  const results = {};
  
  for (const category of categories) {
    try {
      const enabled = await window.shouldShowNotification(category);
      results[category] = enabled;
      console.log(`${enabled ? '✅' : '❌'} ${category}: ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      results[category] = false;
      console.log(`❌ ${category}: error - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * בדיקת הודעות בסיסיות
 */
async function testBasicNotifications() {
  console.log('🔔 Testing basic notifications...');
  
  const tests = [
    { func: 'showSuccessNotification', title: 'בדיקה', message: 'הודעת הצלחה', category: 'system' },
    { func: 'showErrorNotification', title: 'שגיאה', message: 'הודעת שגיאה', category: 'system' },
    { func: 'showWarningNotification', title: 'אזהרה', message: 'הודעת אזהרה', category: 'ui' },
    { func: 'showInfoNotification', title: 'מידע', message: 'הודעת מידע', category: 'ui' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testing ${test.func}...`);
      
      if (typeof window[test.func] === 'function') {
        await window[test.func](test.title, test.message, 2000, test.category);
        results.push({ test: test.func, success: true });
        console.log(`✅ ${test.func} - success`);
      } else {
        results.push({ test: test.func, success: false, error: 'Function not found' });
        console.log(`❌ ${test.func} - function not found`);
      }
      
      // המתן קצת בין בדיקות
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({ test: test.func, success: false, error: error.message });
      console.log(`❌ ${test.func} - error: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * בדיקת זיהוי אוטומטי
 */
async function testAutoDetection() {
  console.log('🤖 Testing auto-detection...');
  
  const tests = [
    { message: 'טרייד נשמר בהצלחה', expected: 'business' },
    { message: 'Cache נוקה בהצלחה', expected: 'system' },
    { message: 'שגיאה בקריאת נתונים', expected: 'system' },
    { message: 'הדף ירענן בעוד...', expected: 'ui' },
    { message: 'Debug: loading file', expected: 'development' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testing auto-detection for: "${test.message}"`);
      
      if (typeof window.detectNotificationCategory === 'function') {
        const detected = window.detectNotificationCategory(test.message, 'info', 'בדיקה', {
          fileName: 'test.js',
          functionName: 'testFunction'
        });
        const success = detected === test.expected;
        
        results.push({
          message: test.message,
          expected: test.expected,
          detected: detected,
          success: success
        });
        
        console.log(`${success ? '✅' : '❌'} Expected: ${test.expected}, Detected: ${detected}`);
      } else {
        results.push({
          message: test.message,
          expected: test.expected,
          detected: null,
          success: false,
          error: 'detectNotificationCategory function not found'
        });
        console.log(`❌ detectNotificationCategory function not found`);
      }
      
    } catch (error) {
      results.push({
        message: test.message,
        expected: test.expected,
        detected: null,
        success: false,
        error: error.message
      });
      console.log(`❌ Error testing auto-detection: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * בדיקת ביצועים
 */
function testPerformance() {
  console.log('⚡ Testing performance...');
  
  const iterations = 100;
  const results = {};
  
  // בדיקת זיהוי אוטומטי
  console.time('auto-detection');
  for (let i = 0; i < iterations; i++) {
    if (typeof window.detectNotificationCategory === 'function') {
      window.detectNotificationCategory('טרייד נשמר בהצלחה', 'success', 'הצלחה', {
        fileName: 'trades.js',
        functionName: 'saveTrade'
      });
    }
  }
  console.timeEnd('auto-detection');
  
  // בדיקת קריאת העדפות - מופחתת
  console.time('preference-check');
  for (let i = 0; i < Math.min(iterations, 10); i++) {
    if (typeof window.shouldShowNotification === 'function') {
      window.shouldShowNotification('system');
    }
  }
  console.timeEnd('preference-check');
  
  results.iterations = iterations;
  results.completed = true;
  
  return results;
}

/**
 * הרצת כל הבדיקות
 */
async function runAllTests() {
  console.log('🚀 Starting comprehensive notification system tests...');
  console.log('='.repeat(60));
  
  const results = {
    timestamp: new Date().toISOString(),
    functionAvailability: null,
    smartFunctions: null,
    categories: null,
    basicNotifications: null,
    autoDetection: null,
    performance: null
  };
  
  try {
    // בדיקות בסיסיות
    results.functionAvailability = testFunctionAvailability();
    results.smartFunctions = testSmartFunctions();
    results.categories = await testCategories();
    
    // בדיקות פונקציונליות
    results.basicNotifications = await testBasicNotifications();
    results.autoDetection = await testAutoDetection();
    results.performance = testPerformance();
    
    // סיכום
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const functionTests = Object.values(results.functionAvailability);
    const smartTests = Object.values(results.smartFunctions);
    const categoryTests = Object.values(results.categories);
    const notificationTests = results.basicNotifications.map(t => t.success);
    const detectionTests = results.autoDetection.map(t => t.success);
    
    console.log(`✅ Function Availability: ${functionTests.filter(Boolean).length}/${functionTests.length}`);
    console.log(`✅ Smart Functions: ${smartTests.filter(Boolean).length}/${smartTests.length}`);
    console.log(`✅ Categories: ${categoryTests.filter(Boolean).length}/${categoryTests.length}`);
    console.log(`✅ Basic Notifications: ${notificationTests.filter(Boolean).length}/${notificationTests.length}`);
    console.log(`✅ Auto Detection: ${detectionTests.filter(Boolean).length}/${detectionTests.length}`);
    console.log(`✅ Performance: ${results.performance.completed ? 'completed' : 'failed'}`);
    
    // הצגת תוצאות מפורטות
    console.log('='.repeat(60));
    console.log('📋 DETAILED RESULTS');
    console.log('='.repeat(60));
    console.log(JSON.stringify(results, null, 2));
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    results.error = error.message;
    return results;
  }
}

/**
 * בדיקה מהירה
 */
async function quickTest() {
  console.log('⚡ Running quick test...');
  
  const basic = testFunctionAvailability();
  const smart = testSmartFunctions();
  const categories = await testCategories();
  
  const summary = {
    basicFunctions: Object.values(basic).filter(Boolean).length,
    smartFunctions: Object.values(smart).filter(Boolean).length,
    enabledCategories: Object.values(categories).filter(Boolean).length,
    totalTests: Object.keys(basic).length + Object.keys(smart).length + Object.keys(categories).length
  };
  
  console.log('📊 Quick Test Results:', summary);
  return summary;
}

// ===== ייצוא לפונקציות גלובליות =====

window.notificationSystemTester = {
  runAllTests,
  quickTest,
  testFunctionAvailability,
  testSmartFunctions,
  testCategories,
  testBasicNotifications,
  testAutoDetection,
  testPerformance
};

// ===== הרצה אוטומטית =====

// DISABLED - No automatic tests on page load
if (!window.notificationSystemTesterInitialized) {
  window.notificationSystemTesterInitialized = true;
}

console.log('✅ Notification System Tester ready');
console.log('💡 Use window.notificationSystemTester.runAllTests() for full test suite');

