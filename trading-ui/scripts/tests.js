/**
 * Tests Page JavaScript
 * 
 * קובץ זה מכיל את כל הפונקציות הנדרשות לעמוד הבדיקות
 * כולל ניהול בדיקות, תוצאות בדיקות, וסטטיסטיקות
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
        <td><strong>${test.name}</strong></td>
        <td>${test.description}</td>
        <td>${test.category}</td>
        <td><span class="test-result-status ${statusClass}">${getStatusText(test.status)}</span></td>
        <td>${test.duration}</td>
        <td>${test.lastRun}</td>
        <td><span class="test-result-status ${resultClass}">${getResultText(test.result)}</span></td>
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

        return `
      <tr>
        <td>${result.id}</td>
        <td>${result.testName}</td>
        <td><span class="test-result-status ${resultClass}">${getResultText(result.result)}</span></td>
        <td>${result.duration}</td>
        <td>${result.errorMessage}</td>
        <td>${result.runDate}</td>
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
    const totalTests = testsData.length;
    const passedTests = testsData.filter(test => test.result === 'passed').length;
    const failedTests = testsData.filter(test => test.result === 'failed').length;
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('passedTests').textContent = passedTests;
    document.getElementById('failedTests').textContent = failedTests;
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
    const section = document.querySelector('.top-section');
    if (section) {
        const isCollapsed = section.classList.contains('collapsed');
        section.classList.toggle('collapsed');

        const button = event.target.closest('button');
        const icon = button.querySelector('.filter-icon');
        icon.textContent = isCollapsed ? '▲' : '▼';

        // Save state
        localStorage.setItem('tests_top_section_collapsed', !isCollapsed);
    }
}

function toggleMainSection() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        const isCollapsed = section.classList.contains('collapsed');
        section.classList.toggle('collapsed');

        const button = section.querySelector('.filter-toggle-btn');
        if (button) {
            const icon = button.querySelector('.filter-icon');
            icon.textContent = isCollapsed ? '▲' : '▼';
        }

        // Save state
        const sectionId = section.querySelector('.table-title')?.textContent.trim() || 'unknown';
        localStorage.setItem(`tests_${sectionId}_collapsed`, !isCollapsed);
    });
}

function restoreTestsSectionState() {
    // Restore top section state
    const topSectionCollapsed = localStorage.getItem('tests_top_section_collapsed') === 'true';
    const topSection = document.querySelector('.top-section');
    if (topSection && topSectionCollapsed) {
        topSection.classList.add('collapsed');
        const button = topSection.querySelector('.filter-toggle-btn');
        if (button) {
            const icon = button.querySelector('.filter-icon');
            icon.textContent = '▼';
        }
    }

    // Restore main sections state
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        const sectionTitle = section.querySelector('.table-title')?.textContent.trim() || 'unknown';
        const isCollapsed = localStorage.getItem(`tests_${sectionTitle}_collapsed`) === 'true';

        if (isCollapsed) {
            section.classList.add('collapsed');
            const button = section.querySelector('.filter-toggle-btn');
            if (button) {
                const icon = button.querySelector('.filter-icon');
                icon.textContent = '▼';
            }
        }
    });
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

function runAllCRUDTests() {
    console.log('▶️ Running all CRUD tests...');
    const activeTests = document.querySelectorAll('input[data-test]:checked');
    if (activeTests.length === 0) {
        alert('אין בדיקות CRUD פעילות להרצה');
        return;
    }

    if (confirm(`האם להריץ את כל ${activeTests.length} בדיקות CRUD הפעילות?`)) {
        alert('הרצת בדיקות CRUD תתבצע בקרוב...');
        // TODO: Implement actual CRUD test execution
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
    console.log('🔄 Toggling all sections...');
    const sections = document.querySelectorAll('.content-section');
    const allCollapsed = Array.from(sections).every(section => section.classList.contains('collapsed'));

    sections.forEach(section => {
        if (allCollapsed) {
            section.classList.remove('collapsed');
        } else {
            section.classList.add('collapsed');
        }

        const button = section.querySelector('.filter-toggle-btn');
        if (button) {
            const icon = button.querySelector('.filter-icon');
            if (icon) {
                icon.textContent = allCollapsed ? '▲' : '▼';
            }
        }
    });

    // Update main toggle button
    const mainButton = document.querySelector('.top-section .filter-toggle-btn');
    if (mainButton) {
        const icon = mainButton.querySelector('.filter-icon');
        if (icon) {
            icon.textContent = allCollapsed ? '▲' : '▼';
        }
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
function showNotification(message, type = 'info') {
    // Simple notification - can be enhanced with toast library
    console.log(`${type.toUpperCase()}: ${message}`);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `test-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
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
