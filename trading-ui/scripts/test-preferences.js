/**
 * Test Preferences Management
 * ניהול העדפות בדיקות
 */

// Global variables
let testPreferences = {};
let testSettings = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadPreferences();
    updateSummary();
    setupEventListeners();
});

/**
 * Load test preferences from localStorage or use defaults
 */
function loadPreferences() {
    const savedPreferences = localStorage.getItem('testPreferences');
    const savedSettings = localStorage.getItem('testSettings');
    
    if (savedPreferences) {
        testPreferences = JSON.parse(savedPreferences);
    } else {
        // Default preferences - all tests enabled
        testPreferences = {
            unit_tests: {
                active: true,
                tests: {
                    test_models: {
                        active: true,
                        tests: {
                            test_ticker_creation: true,
                            test_ticker_to_dict: true,
                            test_account_creation: true,
                            test_user_creation: true,
                            test_trade_creation: true,
                            test_alert_creation: true,
                            test_trade_plan_creation: true,
                            test_trade_side_values: true,
                            test_trade_plan_side_values: true,
                            test_side_default_values: true
                        }
                    },
                    test_relationships: {
                        active: true,
                        tests: {
                            test_trade_ticker_relationship: true,
                            test_trade_plan_relationships: true,
                            test_alert_entity_relationships: true,
                            test_business_rules_trade_types: true,
                            test_business_rules_trade_sides: true,
                            test_business_rules_status_values: true,
                            test_data_integrity_constraints: true,
                            test_cross_entity_consistency: true
                        }
                    }
                }
            },
            integration_tests: {
                active: true,
                tests: {
                    test_api: {
                        active: true,
                        tests: {
                            test_get_tickers: true,
                            test_get_ticker_by_id: true,
                            test_get_accounts: true,
                            test_get_account_by_id: true,
                            test_get_trades: true,
                            test_get_trade_by_id: true,
                            test_health_check: true,
                            test_main_page: true,
                            test_api_response_format: true,
                            test_cors_headers: true
                        }
                    }
                }
            },
            e2e_tests: {
                active: true,
                tests: {
                    test_basic_workflow: {
                        active: true,
                        tests: {
                            test_main_page_loads: true,
                            test_api_endpoints_respond: true,
                            test_tickers_data_structure: true,
                            test_trades_data_structure: true,
                            test_static_files_accessible: true,
                            test_error_handling: true,
                            test_cors_headers: true,
                            test_response_time: true,
                            test_database_connectivity: true
                        }
                    }
                }
            },
            performance_tests: {
                active: true,
                tests: {
                    test_smoke: {
                        active: true,
                        tests: {
                            test_performance_smoke: true
                        }
                    }
                }
            },
            load_tests: {
                active: true,
                tests: {
                    test_smoke: {
                        active: true,
                        tests: {
                            test_load_smoke: true
                        }
                    }
                }
            },
            security_tests: {
                active: true,
                tests: {
                    test_smoke: {
                        active: true,
                        tests: {
                            test_security_smoke: true
                        }
                    }
                }
            }
        };
    }
    
    if (savedSettings) {
        testSettings = JSON.parse(savedSettings);
    } else {
        // Default settings
        testSettings = {
            database: {
                use_temp_database: true,
                backup_before_tests: true,
                cleanup_after_tests: true
            },
            execution: {
                parallel_tests: false,
                stop_on_failure: false,
                verbose_output: true
            },
            reporting: {
                generate_html_report: true,
                save_test_logs: true,
                notify_on_failure: false
            }
        };
    }
    
    applyPreferencesToUI();
}

/**
 * Apply loaded preferences to the UI
 */
function applyPreferencesToUI() {
    // Apply test preferences
    Object.keys(testPreferences).forEach(category => {
        const categoryData = testPreferences[category];
        Object.keys(categoryData.tests || {}).forEach(group => {
            const groupData = categoryData.tests[group];
            Object.keys(groupData.tests || {}).forEach(test => {
                const testKey = `${category}.${group}.${test}`;
                const checkbox = document.querySelector(`[data-test="${testKey}"]`);
                if (checkbox) {
                    checkbox.checked = groupData.tests[test];
                }
            });
        });
    });
    
    // Apply settings
    if (testSettings.database) {
        document.getElementById('useTempDatabase').checked = testSettings.database.use_temp_database;
        document.getElementById('backupBeforeTests').checked = testSettings.database.backup_before_tests;
        document.getElementById('cleanupAfterTests').checked = testSettings.database.cleanup_after_tests;
    }
    
    if (testSettings.execution) {
        document.getElementById('parallelTests').checked = testSettings.execution.parallel_tests;
        document.getElementById('stopOnFailure').checked = testSettings.execution.stop_on_failure;
        document.getElementById('verboseOutput').checked = testSettings.execution.verbose_output;
    }
}

/**
 * Setup event listeners for UI changes
 */
function setupEventListeners() {
    // Listen for test checkbox changes
    document.querySelectorAll('[data-test]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updatePreferencesFromUI();
            updateSummary();
        });
    });
    
    // Listen for settings changes
    document.querySelectorAll('#useTempDatabase, #backupBeforeTests, #cleanupAfterTests, #parallelTests, #stopOnFailure, #verboseOutput').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSettingsFromUI();
        });
    });
}

/**
 * Update preferences from UI changes
 */
function updatePreferencesFromUI() {
    document.querySelectorAll('[data-test]').forEach(checkbox => {
        const testPath = checkbox.getAttribute('data-test').split('.');
        const [category, group, test] = testPath;
        
        if (!testPreferences[category]) testPreferences[category] = { tests: {} };
        if (!testPreferences[category].tests[group]) testPreferences[category].tests[group] = { tests: {} };
        if (!testPreferences[category].tests[group].tests) testPreferences[category].tests[group].tests = {};
        
        testPreferences[category].tests[group].tests[test] = checkbox.checked;
    });
}

/**
 * Update settings from UI changes
 */
function updateSettingsFromUI() {
    testSettings.database = {
        use_temp_database: document.getElementById('useTempDatabase').checked,
        backup_before_tests: document.getElementById('backupBeforeTests').checked,
        cleanup_after_tests: document.getElementById('cleanupAfterTests').checked
    };
    
    testSettings.execution = {
        parallel_tests: document.getElementById('parallelTests').checked,
        stop_on_failure: document.getElementById('stopOnFailure').checked,
        verbose_output: document.getElementById('verboseOutput').checked
    };
}

/**
 * Update the summary statistics
 */
function updateSummary() {
    let totalTests = 0;
    let activeTests = 0;
    let inactiveTests = 0;
    let testCategories = 0;
    
    Object.keys(testPreferences).forEach(category => {
        const categoryData = testPreferences[category];
        if (categoryData.tests) {
            testCategories++;
            Object.keys(categoryData.tests).forEach(group => {
                const groupData = categoryData.tests[group];
                if (groupData.tests) {
                    Object.keys(groupData.tests).forEach(test => {
                        totalTests++;
                        if (groupData.tests[test]) {
                            activeTests++;
                        } else {
                            inactiveTests++;
                        }
                    });
                }
            });
        }
    });
    
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('activeTests').textContent = activeTests;
    document.getElementById('inactiveTests').textContent = inactiveTests;
    document.getElementById('testCategories').textContent = testCategories;
}

/**
 * Save preferences to localStorage
 */
function savePreferences() {
    updatePreferencesFromUI();
    updateSettingsFromUI();
    
    localStorage.setItem('testPreferences', JSON.stringify(testPreferences));
    localStorage.setItem('testSettings', JSON.stringify(testSettings));
    
    showNotification('העדפות נשמרו בהצלחה!', 'success');
}

/**
 * Reset preferences to defaults
 */
function resetToDefaults() {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
        localStorage.removeItem('testPreferences');
        localStorage.removeItem('testSettings');
        loadPreferences();
        updateSummary();
        showNotification('העדפות אופסו לברירות מחדל', 'info');
    }
}

/**
 * Run selected tests
 */
function runSelectedTests() {
    updatePreferencesFromUI();
    updateSettingsFromUI();
    
    // Get active tests
    const activeTests = getActiveTests();
    
    if (activeTests.length === 0) {
        showNotification('לא נבחרו בדיקות להרצה', 'warning');
        return;
    }
    
    // Show confirmation
    const testList = activeTests.slice(0, 5).join(', ');
    const moreTests = activeTests.length > 5 ? ` ועוד ${activeTests.length - 5} בדיקות` : '';
    
    if (confirm(`האם להריץ את הבדיקות הבאות?\n${testList}${moreTests}`)) {
        executeTests(activeTests);
    }
}

/**
 * Get list of active tests
 */
function getActiveTests() {
    const activeTests = [];
    
    document.querySelectorAll('[data-test]:checked').forEach(checkbox => {
        activeTests.push(checkbox.getAttribute('data-test'));
    });
    
    return activeTests;
}

/**
 * Execute the selected tests
 */
function executeTests(testList) {
    showNotification('מתחיל הרצת בדיקות...', 'info');
    
    // Create test configuration
    const testConfig = {
        tests: testList,
        settings: testSettings,
        preferences: testPreferences
    };
    
    // Send to backend for execution
    fetch('/api/v1/tests/run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testConfig)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification(`הבדיקות הושלמו! ${data.passed} עברו, ${data.failed} נכשלו`, 'success');
            // Optionally show detailed results
            if (data.results) {
                showTestResults(data.results);
            }
        } else {
            showNotification(`שגיאה בהרצת הבדיקות: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error running tests:', error);
        showNotification('שגיאה בהרצת הבדיקות', 'error');
    });
}

/**
 * Show test results in a modal
 */
function showTestResults(results) {
    // Create modal for test results
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>תוצאות בדיקות</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="test-results">
                    ${results.map(result => `
                        <div class="test-result ${result.status}">
                            <span class="test-name">${result.name}</span>
                            <span class="test-status">${result.status === 'passed' ? '✅' : '❌'}</span>
                            <span class="test-duration">${result.duration}ms</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .test-results {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .test-result {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid #eee;
    }
    
    .test-result.passed {
        background-color: #d4edda;
    }
    
    .test-result.failed {
        background-color: #f8d7da;
    }
    
    .modal {
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }
    
    .modal-content {
        background-color: white;
        margin: 5% auto;
        padding: 0;
        border-radius: 8px;
        width: 80%;
        max-width: 600px;
    }
    
    .modal-header {
        padding: 15px 20px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .close {
        font-size: 24px;
        cursor: pointer;
        color: #aaa;
    }
    
    .close:hover {
        color: #000;
    }
`;
document.head.appendChild(style);
