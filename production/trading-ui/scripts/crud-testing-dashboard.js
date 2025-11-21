/**
 * CRUD Testing Dashboard Page Script
 * ==================================
 * Wrapper script for crud-testing-dashboard.html page.
 * 
 * This script provides page-specific initialization and wrapper functions
 * that connect the HTML page to the CRUDEnhancedTester system.
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * 
 * ============================================================================
 * FUNCTION INDEX - CRUD Testing Dashboard Page
 * ============================================================================
 * 
 * Initialization:
 * - initializeCRUDTestingDashboard() - Initialize CRUD testing dashboard
 * 
 * Global Wrapper Functions:
 * - runSmartTestAllEntities() - Run smart tests for all entities
 * - refreshCRUDDashboard() - Refresh CRUD dashboard display
 * 
 * Note: Main testing functionality is in crud-testing-enhanced.js
 * 
 * ============================================================================
 */

/**
 * Initialize CRUD Testing Dashboard
 * @returns {Promise<void>}
 */
async function initializeCRUDTestingDashboard() {
    window.Logger?.info('Initializing CRUD Testing Dashboard', { page: 'crud-testing-dashboard' });
    
    // Ensure CRUDEnhancedTester is available
    if (typeof window.CRUDEnhancedTester === 'undefined') {
        window.Logger?.warn('CRUDEnhancedTester not available', { page: 'crud-testing-dashboard' });
        return;
    }
    
    // Initialize tester instance if not already initialized
    if (!window.crudEnhancedTester) {
        window.crudEnhancedTester = new window.CRUDEnhancedTester();
        window.Logger?.info('CRUDEnhancedTester instance created', { page: 'crud-testing-dashboard' });
    }
    
    // Update dashboard display
    if (window.crudEnhancedTester.updateStatsDisplay) {
        window.crudEnhancedTester.updateStatsDisplay();
    }
    
    window.Logger?.info('CRUD Testing Dashboard initialized', { page: 'crud-testing-dashboard' });
}

/**
 * Run smart tests for all entities
 * Global wrapper function for HTML onclick handlers
 * @returns {Promise<void>}
 */
window.runSmartTestAllEntities = async function() {
    if (!window.crudEnhancedTester) {
        if (typeof window.CRUDEnhancedTester !== 'undefined') {
            window.crudEnhancedTester = new window.CRUDEnhancedTester();
        } else {
            window.Logger?.error('CRUDEnhancedTester not available', { page: 'crud-testing-dashboard' });
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'מערכת הבדיקות לא זמינה. אנא רענן את הדף.');
            }
            return;
        }
    }
    
    if (window.crudEnhancedTester.runAllEntitiesTest) {
        await window.crudEnhancedTester.runAllEntitiesTest();
    } else {
        window.Logger?.warn('runAllEntitiesTest method not available', { page: 'crud-testing-dashboard' });
    }
};

/**
 * Refresh CRUD Dashboard
 * Global wrapper function for HTML onclick handlers
 * @returns {void}
 */
window.refreshCRUDDashboard = function() {
    if (window.crudEnhancedTester) {
        if (window.crudEnhancedTester.updateStatsDisplay) {
            window.crudEnhancedTester.updateStatsDisplay();
        }
        if (window.crudEnhancedTester.refreshChartsStatus) {
            window.crudEnhancedTester.refreshChartsStatus();
        }
    } else {
        // Re-initialize if needed
        initializeCRUDTestingDashboard();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCRUDTestingDashboard);
} else {
    // DOM already loaded
    initializeCRUDTestingDashboard();
}

// Export initialization function
window.initializeCRUDTestingDashboard = initializeCRUDTestingDashboard;

