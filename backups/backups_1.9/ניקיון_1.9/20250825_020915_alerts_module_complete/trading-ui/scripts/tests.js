/**
 * Tests Page JavaScript
 * 
 * קובץ זה מכיל את כל הפונקציות הנדרשות לעמוד הבדיקות
 * כולל ניהול בדיקות, תוצאות בדיקות, וסטטיסטיקות
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * 
 * File: trading-ui/scripts/tests.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// Global variables
let testsData = [];
let testResultsData = [];
let currentTestId = null;

// Page initialization
function initializeTestsPage() {
    console.log('🧪 Initializing tests page...');

    // Load initial data
    loadTestsData();
    loadTestResultsData();

    // Initialize section states
    restoreTestsSectionState();

    // Update summary statistics
    updateSummaryStats();

    console.log('✅ Tests page initialized successfully');
}

// Load tests data
async function loadTestsData() {
    try {
        console.log('🔄 Loading tests data...');

        // Mock data for now - replace with actual API call
        testsData = [
            {
                id: 'db_connection',
                name: 'בדיקת חיבור בסיס נתונים',
                description: 'בדיקה שחיבור לבסיס הנתונים עובד',
                category: 'Database',
                status: 'active',
                duration: '0.5s',
                lastRun: '15.1.2025',
                result: 'passed'
            },
            {
                id: 'accounts_api',
                name: 'בדיקת API חשבונות',
                description: 'בדיקה שכל נקודות הקצה של API חשבונות עובדות',
                category: 'API',
                status: 'active',
                duration: '2.1s',
                lastRun: '15.1.2025',
                result: 'passed'
            },
            {
                id: 'page_loading',
                name: 'בדיקת טעינת דפים',
                description: 'בדיקה שכל הדפים נטענים ללא שגיאות',
                category: 'Frontend',
                status: 'active',
                duration: '1.8s',
                lastRun: '15.1.2025',
                result: 'failed'
            },
            {
                id: 'data_validation',
                name: 'בדיקת אימות נתונים',
                description: 'בדיקה שכל הנתונים מאומתים נכון',
                category: 'Validation',
                status: 'inactive',
                duration: '0.0s',
                lastRun: '-',
                result: 'pending'
            }
        ];

        updateTestsTable();
        console.log('✅ Tests data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading tests data:', error);
        showError('שגיאה בטעינת נתוני בדיקות');
    }
}

// Load test results data
async function loadTestResultsData() {
    try {
        console.log('🔄 Loading test results data...');

        // Mock data for now - replace with actual API call
        testResultsData = [
            {
                id: 1,
                testName: 'בדיקת חיבור בסיס נתונים',
                result: 'passed',
                duration: '0.5s',
                errorMessage: '-',
                runDate: '15.1.2025 10:30',
                details: 'חיבור מוצלח לבסיס הנתונים'
            },
            {
                id: 2,
                testName: 'בדיקת API חשבונות',
                result: 'passed',
                duration: '2.1s',
                errorMessage: '-',
                runDate: '15.1.2025 10:32',
                details: 'כל נקודות הקצה עובדות'
            },
            {
                id: 3,
                testName: 'בדיקת טעינת דפים',
                result: 'failed',
                duration: '1.8s',
                errorMessage: 'שגיאה בטעינת דף הערות',
                runDate: '15.1.2025 10:35',
                details: 'דף הערות לא נטען כראוי'
            }
        ];

        updateTestResultsTable();
        console.log('✅ Test results data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading test results data:', error);
        showError('שגיאה בטעינת תוצאות בדיקות');
    }
}

// Update tests table
function updateTestsTable() {
    const tbody = document.querySelector('#testsTable tbody');
    if (!tbody) return;

    if (testsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">אין נתונים</td></tr>';
        return;
    }

    const rows = testsData.map(test => {
        const statusClass = getStatusClass(test.status);
        const resultClass = getResultClass(test.result);

        return `
      <tr>
        <td class="ticker-cell"><strong>${test.name}</strong></td>
        <td>${test.description}</td>
        <td class="type-cell">${test.category}</td>
        <td class="status-cell"><span class="test-result-status ${statusClass}">${getStatusText(test.status)}</span></td>
        <td>${test.duration}</td>
        <td>${test.lastRun}</td>
        <td class="status-cell"><span class="test-result-status ${resultClass}">${getResultText(test.result)}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="runTest('${test.id}')" title="הרץ בדיקה">
            <span class="btn-icon">▶️</span>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="editTest('${test.id}')" title="ערוך">
            <span class="btn-icon">✏️</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteTest('${test.id}')" title="מחק">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.innerHTML = rows;
    document.getElementById('testsCount').textContent = `${testsData.length} בדיקות`;
}

// Update test results table
function updateTestResultsTable() {
    const tbody = document.querySelector('#testResultsTable tbody');
    if (!tbody) return;

    if (testResultsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">אין נתונים</td></tr>';
        return;
    }

    const rows = testResultsData.map(result => {
        const resultClass = getResultClass(result.result);

        // המרת סטטוס לפילטר
        const statusForFilter = result.result === 'passed' ? 'עבר' :
            result.result === 'failed' ? 'נכשל' :
                result.result === 'pending' ? 'ממתין' : 'לא מוגדר';

        return `
      <tr>
        <td class="ticker-cell">${result.id}</td>
        <td class="type-cell" data-type="${result.testName}">${result.testName}</td>
        <td class="status-cell" data-status="${statusForFilter}"><span class="test-result-status ${resultClass}">${getResultText(result.result)}</span></td>
        <td>${result.duration}</td>
        <td>${result.errorMessage}</td>
        <td data-date="${result.runDate}">${result.runDate}</td>
        <td>${result.details}</td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="viewTestResult(${result.id})" title="צפייה">
            <span class="btn-icon">👁️</span>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="exportTestResult(${result.id})" title="ייצא">
            <span class="btn-icon">📤</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteTestResult(${result.id})" title="מחק">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.innerHTML = rows;
    document.getElementById('testResultsCount').textContent = `${testResultsData.length} תוצאות`;
}

// Update summary statistics
function updateSummaryStats() {
    // Update test results statistics
    const totalResults = testResultsData.length;
    const passedResults = testResultsData.filter(result => result.result === 'passed').length;
    const failedResults = testResultsData.filter(result => result.result === 'failed').length;
    const successRate = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;

    document.getElementById('totalTests').textContent = totalResults;
    document.getElementById('passedTests').textContent = passedResults;
    document.getElementById('failedTests').textContent = failedResults;
    document.getElementById('successRate').textContent = `${successRate}%`;
}

// Utility functions
function getStatusClass(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        default: return 'status-inactive';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'active': return 'פעיל';
        case 'inactive': return 'לא פעיל';
        default: return 'לא מוגדר';
    }
}

function getResultClass(result) {
    switch (result) {
        case 'passed': return 'passed';
        case 'failed': return 'failed';
        case 'pending': return 'pending';
        default: return 'pending';
    }
}

function getResultText(result) {
    switch (result) {
        case 'passed': return 'עבר';
        case 'failed': return 'נכשל';
        case 'pending': return 'ממתין';
        default: return 'לא מוגדר';
    }
}

// Test actions
function runTest(testId) {
    console.log('▶️ Running test:', testId);
    currentTestId = testId;

    // Show loading state
    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="btn-icon">⏳</span>';
    button.disabled = true;

    // Simulate test execution
    setTimeout(() => {
        // Reset button
        button.innerHTML = originalContent;
        button.disabled = false;

        // Add test result
        const test = testsData.find(t => t.id === testId);
        if (test) {
            const newResult = {
                id: testResultsData.length + 1,
                testName: test.name,
                result: Math.random() > 0.3 ? 'passed' : 'failed', // 70% success rate
                duration: `${(Math.random() * 3 + 0.5).toFixed(1)}s`,
                errorMessage: Math.random() > 0.3 ? '-' : 'שגיאה כללית בבדיקה',
                runDate: new Date().toLocaleString('he-IL'),
                details: Math.random() > 0.3 ? 'בדיקה הושלמה בהצלחה' : 'נכשל בבדיקה'
            };

            testResultsData.unshift(newResult);
            updateTestResultsTable();

            // Update test data
            test.lastRun = new Date().toLocaleDateString('he-IL');
            test.result = newResult.result;
            test.duration = newResult.duration;
            updateTestsTable();
            updateSummaryStats();

            console.log('✅ Test completed:', newResult);
        }
    }, 2000);
}

function runAllTests() {
    console.log('▶️ Running all tests...');

    const activeTests = testsData.filter(test => test.status === 'active');
    if (activeTests.length === 0) {
        alert('אין בדיקות פעילות להרצה');
        return;
    }

    if (confirm(`האם להריץ את כל ${activeTests.length} הבדיקות הפעילות?`)) {
        activeTests.forEach((test, index) => {
            setTimeout(() => {
                runTest(test.id);
            }, index * 1000); // Run tests with 1 second delay between each
        });
    }
}

function editTest(testId) {
    console.log('✏️ Edit test:', testId);
    // TODO: Open edit modal
    alert('פונקציית עריכת בדיקה תתווסף בקרוב');
}

function deleteTest(testId) {
    console.log('🗑️ Delete test:', testId);
    if (confirm('האם אתה בטוח שברצונך למחוק בדיקה זו?')) {
        testsData = testsData.filter(test => test.id !== testId);
        updateTestsTable();
        updateSummaryStats();
    }
}

function viewTestResult(resultId) {
    console.log('👁️ View test result:', resultId);
    const result = testResultsData.find(r => r.id === resultId);
    if (result) {
        alert(`תוצאות בדיקה ${resultId}:\n${result.details}`);
    }
}

function exportTestResult(resultId) {
    console.log('📤 Export test result:', resultId);
    const result = testResultsData.find(r => r.id === resultId);
    if (result) {
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `test_result_${resultId}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

function deleteTestResult(resultId) {
    console.log('🗑️ Delete test result:', resultId);
    if (confirm('האם אתה בטוח שברצונך למחוק תוצאה זו?')) {
        testResultsData = testResultsData.filter(result => result.id !== resultId);
        updateTestResultsTable();
    }
}

function clearTestResults() {
    console.log('🗑️ Clear all test results');
    if (confirm('האם אתה בטוח שברצונך לנקות את כל תוצאות הבדיקות?')) {
        testResultsData = [];
        updateTestResultsTable();
    }
}

// Section management
function toggleTopSection() {
    console.log('🔄 toggleTopSection נקראה - שימוש במערכת הגלובלית');

    // שימוש בפונקציה הגלובלית מ-main.js
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('top');
    } else {
        console.error('❌ הפונקציה הגלובלית toggleSection לא זמינה');
    }
}

function toggleMainSection() {
    console.log('🔄 toggleMainSection נקראה - שימוש במערכת הגלובלית');

    // שימוש בפונקציה הגלובלית מ-main.js
    if (typeof window.toggleSection === 'function') {
        // מצא את הסקשן הקרוב לכפתור שנלחץ
        const button = event.target.closest('button');
        const section = button?.closest('.content-section');
        if (section && section.dataset.section) {
            window.toggleSection(section.dataset.section);
        } else {
            console.error('❌ לא ניתן למצוא סקשן עם data-section');
        }
    } else {
        console.error('❌ הפונקציה הגלובלית toggleSection לא זמינה');
    }
}

function restoreTestsSectionState() {
    console.log('🔄 שחזור מצב סקשנים בדף בדיקות - שימוש במערכת הגלובלית');

    // שימוש בפונקציה הגלובלית מ-main.js
    if (typeof window.restoreSectionStates === 'function') {
        window.restoreSectionStates();
    } else {
        console.error('❌ הפונקציה הגלובלית restoreSectionStates לא זמינה');
    }
}

// Error handling
function showError(message) {
    console.error('❌ Error:', message);
    // TODO: Show user-friendly error message
}

// Preferences functions
function saveTestPreferences() {
    console.log('💾 Saving test preferences...');
    const preferences = {
        useTempDatabase: document.getElementById('useTempDatabase')?.checked || false,
        backupBeforeTests: document.getElementById('backupBeforeTests')?.checked || false,
        cleanupAfterTests: document.getElementById('cleanupAfterTests')?.checked || false,
        parallelTests: document.getElementById('parallelTests')?.checked || false,
        showProgress: document.getElementById('showProgress')?.checked || false,
        stopOnError: document.getElementById('stopOnError')?.checked || false,
        detailedReport: document.getElementById('detailedReport')?.checked || false,
        saveReports: document.getElementById('saveReports')?.checked || false,
        htmlReport: document.getElementById('htmlReport')?.checked || false,
        errorNotifications: document.getElementById('errorNotifications')?.checked || false,
        successNotifications: document.getElementById('successNotifications')?.checked || false
    };

    localStorage.setItem('testPreferences', JSON.stringify(preferences));
    alert('העדפות בדיקות נשמרו בהצלחה!');
}

function resetTestPreferences() {
    console.log('🔄 Resetting test preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות הבדיקות לברירות מחדל?')) {
        // Reset all checkboxes to default values
        const checkboxes = [
            'useTempDatabase', 'backupBeforeTests', 'cleanupAfterTests', 'showProgress',
            'detailedReport', 'saveReports', 'htmlReport', 'errorNotifications', 'successNotifications'
        ];

        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = true; // Default to checked
            }
        });

        // Reset unchecked by default
        const uncheckedBoxes = ['parallelTests', 'stopOnError'];
        uncheckedBoxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = false;
            }
        });

        localStorage.removeItem('testPreferences');
        alert('העדפות בדיקות אופסו לברירות מחדל!');
    }
}

function saveCRUDPreferences() {
    console.log('💾 Saving CRUD preferences...');
    const crudTests = document.querySelectorAll('input[data-test]');
    const preferences = {};

    crudTests.forEach(test => {
        preferences[test.dataset.test] = test.checked;
    });

    localStorage.setItem('crudPreferences', JSON.stringify(preferences));
    alert('העדפות בדיקות CRUD נשמרו בהצלחה!');
}

function resetCRUDPreferences() {
    console.log('🔄 Resetting CRUD preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות בדיקות CRUD לברירות מחדל?')) {
        const crudTests = document.querySelectorAll('input[data-test]');
        crudTests.forEach(test => {
            test.checked = true; // Default to checked
        });

        localStorage.removeItem('crudPreferences');
        alert('העדפות בדיקות CRUD אופסו לברירות מחדל!');
    }
}

function saveSecurityPreferences() {
    console.log('💾 Saving security preferences...');
    const preferences = {
        securityTests: document.getElementById('securityTests')?.checked || false,
        penetrationTests: document.getElementById('penetrationTests')?.checked || false
    };

    localStorage.setItem('securityPreferences', JSON.stringify(preferences));
    alert('העדפות אבטחה נשמרו בהצלחה!');
}

function resetSecurityPreferences() {
    console.log('🔄 Resetting security preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות האבטחה לברירות מחדל?')) {
        const securityTests = document.getElementById('securityTests');
        const penetrationTests = document.getElementById('penetrationTests');

        if (securityTests) securityTests.checked = false;
        if (penetrationTests) penetrationTests.checked = false;

        localStorage.removeItem('securityPreferences');
        alert('העדפות אבטחה אופסו לברירות מחדל!');
    }
}

function saveAllPreferences() {
    console.log('💾 Saving all preferences...');
    saveTestPreferences();
    saveCRUDPreferences();
    saveSecurityPreferences();
    alert('כל ההעדפות נשמרו בהצלחה!');
}

function resetAllPreferences() {
    console.log('🔄 Resetting all preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
        resetTestPreferences();
        resetCRUDPreferences();
        resetSecurityPreferences();
        alert('כל ההעדפות אופסו לברירות מחדל!');
    }
}

async function runAllCRUDTests() {
    console.log('▶️ Running all CRUD tests...');
    const activeTests = document.querySelectorAll('input[data-test]:checked');
    if (activeTests.length === 0) {
        showNotification('אין בדיקות CRUD פעילות להרצה', 'warning');
        return;
    }

    if (confirm(`האם להריץ את כל ${activeTests.length} בדיקות CRUD הפעילות?`)) {
        showNotification(`מתחיל הרצת ${activeTests.length} בדיקות CRUD...`, 'info');

        try {
            const results = await executeCRUDTests(activeTests);
            displayCRUDTestResults(results);
            showNotification('בדיקות CRUD הושלמו בהצלחה!', 'success');
        } catch (error) {
            console.error('❌ Error running CRUD tests:', error);
            showNotification('שגיאה בהרצת בדיקות CRUD', 'error');
        }
    }
}

function toggleAllCRUDTests() {
    console.log('🔄 Toggling all CRUD tests...');
    const allTests = document.querySelectorAll('input[data-test]');
    const allChecked = Array.from(allTests).every(test => test.checked);

    allTests.forEach(test => {
        test.checked = !allChecked;
    });

    const button = document.querySelector('.category-toggle-btn');
    if (button) {
        const text = button.querySelector('.toggle-text');
        if (text) {
            text.textContent = allChecked ? 'הפעל הכל' : 'כבה הכל';
        }
    }
}

function toggleAllSections() {
    console.log('🔄 toggleAllSections נקראה - שימוש במערכת הגלובלית');

    // שימוש בפונקציה הגלובלית מ-main.js
    if (typeof window.toggleAllSections === 'function') {
        window.toggleAllSections();
    } else {
        console.error('❌ הפונקציה הגלובלית toggleAllSections לא זמינה');
    }
}

// Export functions to global scope
window.initializeTestsPage = initializeTestsPage;
window.loadTestsData = loadTestsData;
window.loadTestResultsData = loadTestResultsData;
window.updateTestsTable = updateTestsTable;
window.updateTestResultsTable = updateTestResultsTable;
window.updateSummaryStats = updateSummaryStats;
window.runTest = runTest;
window.runAllTests = runAllTests;
window.editTest = editTest;
window.deleteTest = deleteTest;
window.viewTestResult = viewTestResult;
window.exportTestResult = exportTestResult;
window.deleteTestResult = deleteTestResult;
window.clearTestResults = clearTestResults;
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreTestsSectionState = restoreTestsSectionState;
window.saveTestPreferences = saveTestPreferences;
window.resetTestPreferences = resetTestPreferences;
window.saveCRUDPreferences = saveCRUDPreferences;
window.resetCRUDPreferences = resetCRUDPreferences;
window.saveSecurityPreferences = saveSecurityPreferences;
window.resetSecurityPreferences = resetSecurityPreferences;
window.saveAllPreferences = saveAllPreferences;
window.resetAllPreferences = resetAllPreferences;
window.runAllCRUDTests = runAllCRUDTests;
window.toggleAllCRUDTests = toggleAllCRUDTests;
window.toggleAllSections = toggleAllSections;
window.executeCRUDTests = executeCRUDTests;
window.displayCRUDTestResults = displayCRUDTestResults;
window.showNotification = showNotification;
window.getSelectedCRUDTests = getSelectedCRUDTests;
window.checkServerHealth = checkServerHealth;
window.clearCRUDTestResults = clearCRUDTestResults;
window.closeCRUDTestResults = closeCRUDTestResults;
window.toggleCRUDResultsSection = toggleCRUDResultsSection;
window.runSelectedCRUDTests = runSelectedCRUDTests;
window.saveCRUDPreferences = saveCRUDPreferences;
window.resetCRUDPreferences = resetCRUDPreferences;

// ===== Server Tests Functions =====

/**
 * Run server tests
 */
async function runServerTests() {
    console.log('🖥️ Running server tests...');

    const selectedTests = getSelectedServerTests();
    if (selectedTests.length === 0) {
        alert('אין בדיקות שרת נבחרות להרצה');
        return;
    }

    showNotification(`מתחיל הרצת ${selectedTests.length} בדיקות שרת...`, 'info');

    try {
        const results = await executeServerTests(selectedTests);
        displayServerTestResults(results);
        showNotification('בדיקות שרת הושלמו בהצלחה', 'success');
    } catch (error) {
        console.error('❌ Error running server tests:', error);
        showNotification('שגיאה בהרצת בדיקות שרת', 'error');
    }
}

/**
 * Get selected server tests
 */
function getSelectedServerTests() {
    const tests = [];

    if (document.getElementById('serverHealthCheck')?.checked) {
        tests.push('server_health');
    }
    if (document.getElementById('databaseConnectivity')?.checked) {
        tests.push('database_connectivity');
    }
    if (document.getElementById('apiEndpoints')?.checked) {
        tests.push('api_endpoints');
    }
    if (document.getElementById('responseTimeCheck')?.checked) {
        tests.push('response_time');
    }

    return tests;
}

/**
 * Execute server tests using the new API
 */
async function executeServerTests(testList) {
    try {
        const response = await fetch('/api/v1/test-suite/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tests: ['server'],
                settings: {
                    database: {
                        use_temp_database: false,
                        backup_before_tests: false,
                        cleanup_after_tests: false
                    },
                    execution: {
                        parallel_tests: false,
                        stop_on_failure: false,
                        verbose_output: true
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('❌ Error executing server tests:', error);
        throw error;
    }
}

/**
 * Display server test results
 */
function displayServerTestResults(results) {
    // Add results to test results table
    if (results.results && results.results.details && results.results.details.server) {
        const serverResults = results.results.details.server;

        serverResults.tests.forEach(test => {
            const newResult = {
                id: testResultsData.length + 1,
                testName: `Server Test: ${test.name}`,
                result: test.status === 'passed' ? 'passed' : 'failed',
                duration: '0.5s',
                errorMessage: test.status === 'failed' ? test.message : '-',
                runDate: new Date().toLocaleString('he-IL'),
                details: test.message
            };

            testResultsData.unshift(newResult);
        });

        updateTestResultsTable();
        updateSummaryStats();
    }
}

/**
 * Save server preferences
 */
function saveServerPreferences() {
    console.log('💾 Saving server preferences...');
    const preferences = {
        serverHealthCheck: document.getElementById('serverHealthCheck')?.checked || false,
        databaseConnectivity: document.getElementById('databaseConnectivity')?.checked || false,
        apiEndpoints: document.getElementById('apiEndpoints')?.checked || false,
        responseTimeCheck: document.getElementById('responseTimeCheck')?.checked || false
    };

    localStorage.setItem('serverPreferences', JSON.stringify(preferences));
    alert('העדפות בדיקות שרת נשמרו בהצלחה!');
}

/**
 * Reset server preferences
 */
function resetServerPreferences() {
    console.log('🔄 Resetting server preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות בדיקות השרת לברירות מחדל?')) {
        const checkboxes = [
            'serverHealthCheck', 'databaseConnectivity', 'apiEndpoints', 'responseTimeCheck'
        ];

        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = true; // Default to checked
            }
        });

        localStorage.removeItem('serverPreferences');
        alert('העדפות בדיקות שרת אופסו לברירות מחדל!');
    }
}

// ===== API Tests Functions =====

/**
 * Run all API tests
 */
async function runAllAPITests() {
    console.log('🔌 Running all API tests...');

    const allTables = ['accounts', 'trades', 'tickers', 'alerts', 'notes', 'currencies', 'cash_flows', 'trade_plans', 'executions'];

    showNotification(`מתחיל הרצת ${allTables.length} בדיקות API...`, 'info');

    try {
        const results = await executeAPITests(allTables);
        displayAPITestResults(results);
        showNotification('בדיקות API הושלמו בהצלחה', 'success');
    } catch (error) {
        console.error('❌ Error running API tests:', error);
        showNotification('שגיאה בהרצת בדיקות API', 'error');
    }
}

/**
 * Run specific API test
 */
async function runAPITest(tableName) {
    console.log(`🔌 Running API test for ${tableName}...`);

    showNotification(`מתחיל בדיקת API עבור ${tableName}...`, 'info');

    try {
        const results = await executeAPITests([tableName]);
        displayAPITestResults(results);
        showNotification(`בדיקת API עבור ${tableName} הושלמה בהצלחה`, 'success');
    } catch (error) {
        console.error(`❌ Error running API test for ${tableName}:`, error);
        showNotification(`שגיאה בהרצת בדיקת API עבור ${tableName}`, 'error');
    }
}

/**
 * Execute API tests using the new API
 */
async function executeAPITests(tableList) {
    try {
        const response = await fetch('/api/v1/test-suite/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tests: tableList,
                settings: {
                    database: {
                        use_temp_database: false,
                        backup_before_tests: false,
                        cleanup_after_tests: false
                    },
                    execution: {
                        parallel_tests: false,
                        stop_on_failure: false,
                        verbose_output: true
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('❌ Error executing API tests:', error);
        throw error;
    }
}

/**
 * Display API test results
 */
function displayAPITestResults(results) {
    // Add results to test results table
    if (results.results && results.results.details) {
        Object.entries(results.results.details).forEach(([tableName, tableResults]) => {
            if (tableResults.tests) {
                tableResults.tests.forEach(test => {
                    const newResult = {
                        id: testResultsData.length + 1,
                        testName: `API Test: ${tableName} - ${test.name}`,
                        result: test.status === 'passed' ? 'passed' : 'failed',
                        duration: '1.0s',
                        errorMessage: test.status === 'failed' ? test.message : '-',
                        runDate: new Date().toLocaleString('he-IL'),
                        details: test.message
                    };

                    testResultsData.unshift(newResult);
                });
            }
        });

        updateTestResultsTable();
        updateSummaryStats();
    }
}

/**
 * Save API preferences
 */
function saveAPIPreferences() {
    console.log('💾 Saving API preferences...');
    // API preferences are mainly for future use
    const preferences = {
        lastSaved: new Date().toISOString()
    };

    localStorage.setItem('apiPreferences', JSON.stringify(preferences));
    alert('העדפות בדיקות API נשמרו בהצלחה!');
}

/**
 * Reset API preferences
 */
function resetAPIPreferences() {
    console.log('🔄 Resetting API preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות בדיקות API לברירות מחדל?')) {
        localStorage.removeItem('apiPreferences');
        alert('העדפות בדיקות API אופסו לברירות מחדל!');
    }
}

// ===== Utility Functions =====

/**
 * Show notification
 */


/**
 * Check server health before running tests
 */
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health', {
            method: 'GET',
            timeout: 5000
        });

        if (response.ok) {
            return true;
        } else {
            throw new Error(`Server health check failed: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Server health check failed:', error);
        return false;
    }
}

/**
 * Execute CRUD tests using the API
 */
async function executeCRUDTests(activeTests) {
    try {
        // Check server health first
        const serverHealthy = await checkServerHealth();
        if (!serverHealthy) {
            throw new Error('השרת לא זמין. אנא ודא שהשרת פועל לפני הרצת הבדיקות.');
        }

        // Convert test checkboxes to entities and operations
        const entities = new Set();
        const operations = new Set();

        activeTests.forEach(checkbox => {
            const testId = checkbox.getAttribute('data-test');
            const [entity, operation] = testId.split('.');
            entities.add(entity);
            operations.add(operation);
        });

        const settings = {
            parallel: document.getElementById('parallelTests')?.checked || false,
            stop_on_failure: document.getElementById('stopOnError')?.checked || false,
            verbose: document.getElementById('showProgress')?.checked || true,
            cleanup: document.getElementById('cleanupAfterTests')?.checked || true
        };

        console.log('🔌 Executing CRUD tests with settings:', settings);

        const response = await fetch('/api/v1/tests/crud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entities: Array.from(entities),
                operations: Array.from(operations),
                settings: settings
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ CRUD tests executed successfully:', result);
        return result;

    } catch (error) {
        console.error('❌ Error executing CRUD tests:', error);
        throw error;
    }
}

/**
 * Display CRUD test results in the test results table
 */
function displayCRUDTestResults(results) {
    console.log('📊 Displaying CRUD test results:', results);

    if (results.results && results.results.results) {
        const crudResults = results.results.results;

        crudResults.forEach(test => {
            const newResult = {
                id: testResultsData.length + 1,
                testName: `CRUD: ${test.entity}.${test.operation}`,
                result: test.status === 'passed' ? 'passed' : 'failed',
                duration: test.end_time && test.start_time ?
                    `${((test.end_time - test.start_time) * 1000).toFixed(1)}ms` : 'N/A',
                errorMessage: test.status === 'failed' ? test.message : '-',
                runDate: new Date().toLocaleString('he-IL'),
                details: test.message
            };

            testResultsData.unshift(newResult);
        });

        updateTestResultsTable();
        updateSummaryStats();
    }
}

/**
 * Clear CRUD test results
 */
function clearCRUDTestResults() {
    console.log('🗑️ Clearing CRUD test results...');
    if (confirm('האם אתה בטוח שברצונך לנקות את כל תוצאות בדיקות CRUD?')) {
        document.getElementById('crudTestResultsContent').innerHTML = '';
        document.getElementById('crudTestResultsArea').style.display = 'none';
        document.getElementById('crudTestResultsCount').textContent = '0 תוצאות';
        showNotification('תוצאות בדיקות CRUD נוקו בהצלחה', 'success');
    }
}

/**
 * Close CRUD test results area
 */
function closeCRUDTestResults() {
    console.log('✕ Closing CRUD test results area...');
    document.getElementById('crudTestResultsArea').style.display = 'none';
}

/**
 * Toggle CRUD results section
 */
function toggleCRUDResultsSection() {
    console.log('🔄 toggleCRUDResultsSection נקראה - שימוש במערכת הגלובלית');

    // שימוש בפונקציה הגלובלית מ-main.js
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('crud-results');
    } else {
        console.error('❌ הפונקציה הגלובלית toggleSection לא זמינה');
    }
}

/**
 * Run selected CRUD tests
 */
async function runSelectedCRUDTests() {
    console.log('▶️ Running selected CRUD tests...');
    const selectedTests = getSelectedCRUDTests();

    if (selectedTests.length === 0) {
        showNotification('לא נבחרו בדיקות CRUD להרצה', 'warning');
        return;
    }

    showNotification(`מתחיל הרצת ${selectedTests.length} בדיקות CRUD נבחרות...`, 'info');

    try {
        // Show results area
        document.getElementById('crudTestResultsArea').style.display = 'block';
        const resultsContent = document.getElementById('crudTestResultsContent');
        resultsContent.innerHTML = '<div class="test-result-item running"><span class="test-result-name">מתחיל בדיקות...</span><span class="test-result-status running">רץ</span></div>';

        // Convert test IDs to checkboxes for execution
        const activeTests = [];
        selectedTests.forEach(testId => {
            const checkbox = document.querySelector(`input[data-test="${testId}"]`);
            if (checkbox) {
                activeTests.push(checkbox);
            }
        });

        const results = await executeCRUDTests(activeTests);
        displayCRUDTestResults(results);

        // Update results count
        const resultsCount = results.results?.results?.length || 0;
        document.getElementById('crudTestResultsCount').textContent = `${resultsCount} תוצאות`;

        showNotification('בדיקות CRUD נבחרות הושלמו בהצלחה!', 'success');

    } catch (error) {
        console.error('❌ Error running selected CRUD tests:', error);
        showNotification('שגיאה בהרצת בדיקות CRUD נבחרות', 'error');
    }
}

/**
 * Save CRUD preferences
 */
function saveCRUDPreferences() {
    console.log('💾 Saving CRUD preferences...');
    const preferences = {};

    // Get all CRUD test checkboxes
    const testCheckboxes = document.querySelectorAll('input[data-test]');
    testCheckboxes.forEach(checkbox => {
        const testId = checkbox.getAttribute('data-test');
        preferences[testId] = checkbox.checked;
    });

    localStorage.setItem('crudPreferences', JSON.stringify(preferences));
    showNotification('העדפות בדיקות CRUD נשמרו בהצלחה!', 'success');
}

/**
 * Reset CRUD preferences
 */
function resetCRUDPreferences() {
    console.log('🔄 Resetting CRUD preferences...');
    if (confirm('האם אתה בטוח שברצונך לאפס את כל העדפות בדיקות CRUD לברירות מחדל?')) {
        // Reset all CRUD test checkboxes to checked
        const testCheckboxes = document.querySelectorAll('input[data-test]');
        testCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        localStorage.removeItem('crudPreferences');
        showNotification('העדפות בדיקות CRUD אופסו לברירות מחדל!', 'success');
    }
}

/**
 * Get selected CRUD tests
 */
function getSelectedCRUDTests() {
    const selectedTests = [];
    const testCheckboxes = document.querySelectorAll('[data-test]:checked');

    testCheckboxes.forEach(checkbox => {
        selectedTests.push(checkbox.getAttribute('data-test'));
    });

    return selectedTests;
}

/**
 * Run all tests (server + API + CRUD)
 */
async function runAllTests() {
    console.log('🧪 Running all tests...');

    showNotification('מתחיל הרצת כל הבדיקות...', 'info');

    try {
        // Run server tests first
        await runServerTests();

        // Run API tests
        await runAllAPITests();

        // Run CRUD tests (existing functionality)
        runAllCRUDTests();

        showNotification('כל הבדיקות הושלמו בהצלחה!', 'success');
    } catch (error) {
        console.error('❌ Error running all tests:', error);
        showNotification('שגיאה בהרצת כל הבדיקות', 'error');
    }
}

// Export new functions to global scope
window.runServerTests = runServerTests;
window.saveServerPreferences = saveServerPreferences;
window.resetServerPreferences = resetServerPreferences;
window.runAllAPITests = runAllAPITests;
window.runAPITest = runAPITest;
window.saveAPIPreferences = saveAPIPreferences;
window.resetAPIPreferences = resetAPIPreferences;
window.runAllTests = runAllTests;
