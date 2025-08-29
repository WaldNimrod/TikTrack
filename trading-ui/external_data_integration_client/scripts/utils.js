/**
 * Utility Functions for External Data Integration
 * 
 * This file contains common utility functions used across all test modules
 * including log clearing, data editing, and common operations.
 * 
 * Author: TikTrack Development Team
 * Created: January 2025
 * Version: 1.0
 */

/**
 * Clear logs for any module
 * @param {string} moduleName - Name of the module (e.g., 'test', 'model', 'api')
 */
function clearModuleLogs(moduleName) {
    const logContainer = document.getElementById(`${moduleName}-logs`);
    if (logContainer) {
        logContainer.innerHTML = '';
        console.log(`🧹 ${moduleName} logs cleared`);
    }
}

/**
 * Clear test logs (alias for clearModuleLogs)
 */
function clearTestLogs() {
    clearModuleLogs('test');
}

/**
 * Clear model logs (alias for clearModuleLogs)
 */
function clearModelLogs() {
    clearModuleLogs('model');
}

/**
 * Clear API logs (alias for clearModuleLogs)
 */
function clearApiLogs() {
    clearModuleLogs('api');
}

/**
 * Clear performance logs (alias for clearModuleLogs)
 */
function clearPerformanceLogs() {
    clearModuleLogs('performance');
}

/**
 * Clear integration logs (alias for clearModuleLogs)
 */
function clearIntegrationLogs() {
    clearModuleLogs('integration');
}

/**
 * Clear stats logs (alias for clearModuleLogs)
 */
function clearStatsLogs() {
    clearModuleLogs('stats');
}

/**
 * Edit custom data for any type
 * @param {string} dataType - Type of data to edit (e.g., 'quote', 'ticker', 'preferences')
 */
function editCustomData(dataType) {
    const label = document.getElementById(`${dataType}-data-label`);
    const textarea = document.getElementById(`${dataType}-data`);
    if (label && textarea) {
        label.style.display = 'none';
        textarea.style.display = 'block';
        textarea.focus();
    }
}

/**
 * Edit quote data (alias for editCustomData)
 */
function editQuoteData() {
    editCustomData('quote');
}

/**
 * Edit ticker data (alias for editCustomData)
 */
function editTickerData() {
    editCustomData('ticker');
}

/**
 * Edit preferences data (alias for editCustomData)
 */
function editPreferencesData() {
    editCustomData('preferences');
}

/**
 * Edit batch symbols (special case for external data test)
 */
function editBatchSymbols() {
    const label = document.getElementById('batch-symbols-label');
    const textarea = document.getElementById('batch-symbols');
    if (label && textarea) {
        label.style.display = 'none';
        textarea.style.display = 'block';
        textarea.focus();
    }
}

/**
 * Edit custom command for any module
 * @param {string} moduleName - Name of the module
 */
function editCustomCommand(moduleName) {
    const label = document.getElementById(`${moduleName}-command-label`);
    const textarea = document.getElementById(`${moduleName}-command`);
    if (label && textarea) {
        label.style.display = 'none';
        textarea.style.display = 'block';
        textarea.focus();
    }
}

/**
 * Edit custom endpoint URL (alias for editCustomCommand)
 */
function editCustomEndpointUrl() {
    editCustomCommand('endpoint');
}

/**
 * Edit custom request JSON (alias for editCustomCommand)
 */
function editCustomRequestJson() {
    editCustomCommand('request');
}

/**
 * Edit custom performance command (alias for editCustomCommand)
 */
function editCustomPerformanceCommand() {
    editCustomCommand('performance');
}

/**
 * Edit custom integration path (alias for editCustomCommand)
 */
function editCustomIntegrationPath() {
    editCustomCommand('integration');
}

/**
 * Edit custom command for stats (alias for editCustomCommand)
 */
function editCustomCommand() {
    editCustomCommand('stats');
}

/**
 * Initialize textarea edit functionality for any data type
 * @param {string} dataType - Type of data
 */
function initializeTextareaEdit(dataType) {
    const textarea = document.getElementById(`${dataType}-data`);
    const label = document.getElementById(`${dataType}-data-label`);
    
    if (textarea && label) {
        textarea.addEventListener('blur', function() {
            label.textContent = this.value || 'אין נתונים';
            label.style.display = 'block';
            this.style.display = 'none';
        });
    }
}

/**
 * Initialize all textarea edit functionality
 */
function initializeAllTextareaEdits() {
    // Initialize for all data types
    initializeTextareaEdit('quote');
    initializeTextareaEdit('ticker');
    initializeTextareaEdit('preferences');
    
    // Initialize batch symbols
    const batchTextarea = document.getElementById('batch-symbols');
    const batchLabel = document.getElementById('batch-symbols-label');
    if (batchTextarea && batchLabel) {
        batchTextarea.addEventListener('blur', function() {
            batchLabel.textContent = this.value || 'אין נתונים';
            batchLabel.style.display = 'block';
            this.style.display = 'none';
        });
    }
}

/**
 * Get ticker name from cache or return default
 * @param {string} symbol - Ticker symbol
 * @param {Object} cache - Ticker names cache
 * @returns {string} Ticker name
 */
function getTickerName(symbol, cache = {}) {
    return cache[symbol] || 'שם לא ידוע';
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    console.error(message);
    // You can implement a toast notification here
}

/**
 * Constants for the test modules
 */
const TESTER_CONSTANTS = {
    API_BASE_URL: '/api/v1',
    LOG_ENTRIES_LIMIT: 100,
    TIME_UPDATE_INTERVAL: 1000,
    DEFAULT_TIMEOUT: 5000,
    MAX_RETRY_ATTEMPTS: 3
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        clearModuleLogs,
        clearTestLogs,
        clearModelLogs,
        clearApiLogs,
        clearPerformanceLogs,
        clearIntegrationLogs,
        clearStatsLogs,
        editCustomData,
        editQuoteData,
        editTickerData,
        editPreferencesData,
        editBatchSymbols,
        editCustomCommand,
        editCustomEndpointUrl,
        editCustomRequestJson,
        editCustomPerformanceCommand,
        editCustomIntegrationPath,
        initializeTextareaEdit,
        initializeAllTextareaEdits,
        getTickerName,
        formatNumber,
        showError,
        TESTER_CONSTANTS
    };
}

