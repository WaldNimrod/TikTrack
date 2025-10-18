/**
 * Test Suite למערכת הכפתורים המרכזית
 * Button System Test Suite
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * @date 2025-01-16
 */

// ===== הגדרות בדיקות =====
// Test Configuration

const BUTTON_SYSTEM_TESTS = {
    config: {
        timeout: 5000,
        retries: 3,
        verbose: true
    },
    results: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
    }
};

// ===== פונקציות עזר לבדיקות =====
// Test Helper Functions

function assert(condition, message) {
    if (condition) {
        BUTTON_SYSTEM_TESTS.results.passed++;
        if (BUTTON_SYSTEM_TESTS.config.verbose) {
            console.log(`✅ ${message}`);
        }
    } else {
        BUTTON_SYSTEM_TESTS.results.failed++;
        console.error(`❌ ${message}`);
    }
    BUTTON_SYSTEM_TESTS.results.total++;
}

function assertEqual(actual, expected, message) {
    assert(actual === expected, `${message} - Expected: ${expected}, Actual: ${actual}`);
}

function assertExists(element, message) {
    assert(element !== null && element !== undefined, `${message} - Element not found`);
}

function assertTrue(condition, message) {
    assert(condition === true, `${message} - Expected true, got ${condition}`);
}

function assertFalse(condition, message) {
    assert(condition === false, `${message} - Expected false, got ${condition}`);
}

// ===== בדיקות פונקציונליות =====
// Functional Tests

function testButtonSystemInitialization() {
    console.log('\n🧪 Testing Button System Initialization...');
    
    // בדיקת קיום המערכת
    assertExists(window.buttonSystem, 'Button system should be initialized');
    assertExists(window.advancedButtonSystem, 'Advanced button system should be initialized');
    
    // בדיקת פונקציות גלובליות
    assertExists(window.initializeButtons, 'initializeButtons function should exist');
    assertExists(window.addDynamicButton, 'addDynamicButton function should exist');
    assertExists(window.updateButton, 'updateButton function should exist');
    assertExists(window.getButtonSystemStats, 'getButtonSystemStats function should exist');
    
    // בדיקת אובייקטים גלובליים
    assertExists(window.BUTTON_ICONS, 'BUTTON_ICONS should exist');
    assertExists(window.BUTTON_TEXTS, 'BUTTON_TEXTS should exist');
    assertExists(window.createButton, 'createButton function should exist');
    assertExists(window.getButtonClass, 'getButtonClass function should exist');
}

function testButtonIconsAndTexts() {
    console.log('\n🧪 Testing Button Icons and Texts...');
    
    // בדיקת איקונים
    const requiredIcons = ['EDIT', 'DELETE', 'ADD', 'SAVE', 'CANCEL', 'LINK', 'REFRESH', 'EXPORT'];
    requiredIcons.forEach(icon => {
        assertExists(window.BUTTON_ICONS[icon], `Icon ${icon} should exist`);
    });
    
    // בדיקת טקסטים
    const requiredTexts = ['EDIT', 'DELETE', 'ADD', 'SAVE', 'CANCEL', 'LINK', 'REFRESH', 'EXPORT'];
    requiredTexts.forEach(text => {
        assertExists(window.BUTTON_TEXTS[text], `Text ${text} should exist`);
    });
    
    // בדיקת התאמה בין איקונים לטקסטים
    Object.keys(window.BUTTON_ICONS).forEach(key => {
        assertExists(window.BUTTON_TEXTS[key], `Text for icon ${key} should exist`);
    });
}

function testButtonCreation() {
    console.log('\n🧪 Testing Button Creation...');
    
    // בדיקת יצירת כפתור בסיסי
    const editButton = window.createButton('EDIT', 'testFunction()');
    assertTrue(editButton.includes('button'), 'Created button should contain button element');
    assertTrue(editButton.includes('testFunction()'), 'Created button should contain onclick function');
    assertTrue(editButton.includes('✏️'), 'Created button should contain edit icon');
    
    // בדיקת יצירת כפתור עם classes נוספים
    const customButton = window.createButton('ADD', 'addFunction()', 'btn-lg');
    assertTrue(customButton.includes('btn-lg'), 'Created button should contain additional classes');
    
    // בדיקת יצירת כפתור עם attributes נוספים
    const attributeButton = window.createButton('SAVE', 'saveFunction()', '', 'id="testBtn"');
    assertTrue(attributeButton.includes('id="testBtn"'), 'Created button should contain additional attributes');
}

function testButtonClasses() {
    console.log('\n🧪 Testing Button Classes...');
    
    // בדיקת classes לכפתורים שונים
    assertEqual(window.getButtonClass('EDIT'), 'btn-secondary', 'Edit button should have btn-secondary class');
    assertEqual(window.getButtonClass('DELETE'), 'btn-danger', 'Delete button should have btn-danger class');
    assertEqual(window.getButtonClass('ADD'), 'btn-success', 'Add button should have btn-success class');
    assertEqual(window.getButtonClass('SAVE'), 'btn-primary', 'Save button should have btn-primary class');
    assertEqual(window.getButtonClass('CANCEL'), 'btn-secondary', 'Cancel button should have btn-secondary class');
}

function testDataAttributesProcessing() {
    console.log('\n🧪 Testing Data Attributes Processing...');
    
    // יצירת כפתור עם data attributes
    const testContainer = document.createElement('div');
    testContainer.innerHTML = '<button data-button-type="ADD" data-onclick="testAdd()" data-classes="btn-sm" data-text="הוסף חדש"></button>';
    document.body.appendChild(testContainer);
    
    // בדיקת קיום הכפתור
    const dataButton = testContainer.querySelector('[data-button-type="ADD"]');
    assertExists(dataButton, 'Data attribute button should exist');
    
    // אתחול הכפתורים
    window.initializeButtons();
    
    // בדיקת המרה לכפתור פונקציונלי
    const processedButton = testContainer.querySelector('button');
    assertExists(processedButton, 'Processed button should exist');
    assertTrue(processedButton.onclick !== null || processedButton.getAttribute('onclick') !== null, 'Processed button should have onclick handler');
    
    // ניקוי
    document.body.removeChild(testContainer);
}

function testDynamicButtonAddition() {
    console.log('\n🧪 Testing Dynamic Button Addition...');
    
    // יצירת container לבדיקה
    const testContainer = document.createElement('div');
    testContainer.id = 'testContainer';
    document.body.appendChild(testContainer);
    
    // הוספת כפתור דינמי
    window.addDynamicButton(
        testContainer,
        'EDIT',
        'editTest()',
        'btn-sm',
        'id="dynamicEditBtn"',
        'ערוך בדיקה'
    );
    
    // בדיקת קיום הכפתור
    const dynamicButton = testContainer.querySelector('#dynamicEditBtn');
    assertExists(dynamicButton, 'Dynamic button should be added');
    assertTrue(dynamicButton.textContent.includes('ערוך בדיקה'), 'Dynamic button should have custom text');
    
    // ניקוי
    document.body.removeChild(testContainer);
}

function testButtonUpdate() {
    console.log('\n🧪 Testing Button Update...');
    
    // יצירת כפתור לבדיקה
    const testContainer = document.createElement('div');
    testContainer.innerHTML = '<button id="testUpdateBtn" data-button-type="SAVE" data-onclick="saveTest()">שמור</button>';
    document.body.appendChild(testContainer);
    
    // עדכון הכפתור
    window.updateButton(
        'testUpdateBtn',
        'DELETE',
        'deleteTest()',
        'btn-danger btn-sm',
        'data-confirm="true"',
        'מחק בדיקה'
    );
    
    // בדיקת העדכון
    const updatedButton = document.getElementById('testUpdateBtn');
    assertExists(updatedButton, 'Updated button should exist');
    assertTrue(updatedButton.textContent.includes('מחק בדיקה'), 'Updated button should have new text');
    assertTrue(updatedButton.className.includes('btn-danger'), 'Updated button should have new class');
    
    // ניקוי
    document.body.removeChild(testContainer);
}

function testButtonSystemStats() {
    console.log('\n🧪 Testing Button System Stats...');
    
    // קבלת סטטיסטיקות
    const stats = window.getButtonSystemStats();
    assertExists(stats, 'Button system stats should exist');
    assertExists(stats.performance, 'Stats should include performance data');
    assertExists(stats.cache, 'Stats should include cache data');
    assertExists(stats.buttons, 'Stats should include buttons count');
    assertExists(stats.observers, 'Stats should include observers count');
    
    // בדיקת סוגי הנתונים
    assertTrue(typeof stats.buttons === 'number', 'Buttons count should be a number');
    assertTrue(typeof stats.observers === 'number', 'Observers count should be a number');
}

function testAccessibility() {
    console.log('\n🧪 Testing Accessibility...');
    
    // יצירת כפתור לבדיקת נגישות
    const testContainer = document.createElement('div');
    testContainer.innerHTML = '<button data-button-type="VIEW" data-onclick="viewTest()" data-attributes="title=\\"צפה בפרטים\\" aria-label=\\"צפה בפרטים\\""></button>';
    document.body.appendChild(testContainer);
    
    // אתחול הכפתורים
    window.initializeButtons();
    
    // בדיקת נגישות
    const accessibleButton = testContainer.querySelector('button');
    assertExists(accessibleButton, 'Accessible button should exist');
    assertTrue(accessibleButton.getAttribute('title') !== null, 'Button should have title attribute');
    assertTrue(accessibleButton.getAttribute('aria-label') !== null, 'Button should have aria-label attribute');
    
    // ניקוי
    document.body.removeChild(testContainer);
}

function testErrorHandling() {
    console.log('\n🧪 Testing Error Handling...');
    
    // בדיקת טיפול בשגיאות עם כפתור לא תקין
    const testContainer = document.createElement('div');
    testContainer.innerHTML = '<button data-button-type="INVALID_TYPE" data-onclick="invalidFunction()"></button>';
    document.body.appendChild(testContainer);
    
    // אתחול הכפתורים (לא אמור לקרוס)
    try {
        window.initializeButtons();
        assertTrue(true, 'System should handle invalid button types gracefully');
    } catch (error) {
        assertTrue(false, `System should not crash with invalid button types: ${error.message}`);
    }
    
    // ניקוי
    document.body.removeChild(testContainer);
}

// ===== בדיקות ביצועים =====
// Performance Tests

function testPerformance() {
    console.log('\n🧪 Testing Performance...');
    
    const startTime = performance.now();
    
    // יצירת כפתורים רבים
    const testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
    
    for (let i = 0; i < 100; i++) {
        window.addDynamicButton(
            testContainer,
            'ADD',
            `addItem${i}()`,
            'btn-sm',
            `id="perfBtn${i}"`,
            `הוסף ${i}`
        );
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // בדיקת ביצועים (פחות מ-100ms ל-100 כפתורים)
    assertTrue(duration < 100, `Performance test should complete in less than 100ms, took ${duration.toFixed(2)}ms`);
    
    // ניקוי
    document.body.removeChild(testContainer);
}

// ===== בדיקות תאימות =====
// Compatibility Tests

function testBrowserCompatibility() {
    console.log('\n🧪 Testing Browser Compatibility...');
    
    // בדיקת תכונות מודרניות
    assertTrue(typeof window.MutationObserver !== 'undefined', 'MutationObserver should be supported');
    assertTrue(typeof window.Promise !== 'undefined', 'Promise should be supported');
    assertTrue(typeof window.Map !== 'undefined', 'Map should be supported');
    
    // בדיקת תכונות ES6
    assertTrue(typeof window.advancedButtonSystem !== 'undefined', 'ES6 classes should be supported');
}

// ===== פונקציות הרצה =====
// Test Runner Functions

function runAllTests() {
    console.log('🚀 Starting Button System Test Suite...');
    console.log('=' * 50);
    
    const startTime = performance.now();
    
    try {
        // בדיקות פונקציונליות
        testButtonSystemInitialization();
        testButtonIconsAndTexts();
        testButtonCreation();
        testButtonClasses();
        testDataAttributesProcessing();
        testDynamicButtonAddition();
        testButtonUpdate();
        testButtonSystemStats();
        testAccessibility();
        testErrorHandling();
        
        // בדיקות ביצועים
        testPerformance();
        
        // בדיקות תאימות
        testBrowserCompatibility();
        
    } catch (error) {
        console.error('❌ Test suite crashed:', error);
        BUTTON_SYSTEM_TESTS.results.failed++;
        BUTTON_SYSTEM_TESTS.results.total++;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // הדפסת תוצאות
    printTestResults(duration);
}

function printTestResults(duration) {
    console.log('\n' + '=' * 50);
    console.log('📊 Button System Test Results');
    console.log('=' * 50);
    
    const { passed, failed, skipped, total } = BUTTON_SYSTEM_TESTS.results;
    const successRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;
    
    console.log(`⏰ Duration: ${duration.toFixed(2)}ms`);
    console.log(`🧪 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Button system is working correctly.');
    } else {
        console.log(`\n⚠️  ${failed} test(s) failed. Please check the errors above.`);
    }
    
    console.log('=' * 50);
}

// ===== אתחול =====
// Initialization

// המתן לטעינת הדף
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 1000); // המתן למערכת הכפתורים להיטען
    });
} else {
    setTimeout(runAllTests, 1000);
}

// ===== ייצוא =====
// Export

window.runButtonSystemTests = runAllTests;
window.BUTTON_SYSTEM_TESTS = BUTTON_SYSTEM_TESTS;
