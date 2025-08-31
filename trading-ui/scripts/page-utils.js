/**
 * Page Utils - TikTrack Page Management Utilities
 * ===============================================
 * 
 * REFACTORING HISTORY:
 * ===================
 * 
 * This file was created during the main.js modular split (Phase 6 - August 24, 2025)
 * to centralize all page-specific utilities, initialization, and state management
 * that was previously scattered across multiple files and inline in various page scripts.
 * 
 * ORIGINAL STATE:
 * - Page initialization logic duplicated across multiple files
 * - Inconsistent page state management
 * - No centralized page utilities
 * - Difficult to maintain page-specific functionality
 * 
 * REFACTORING BENEFITS:
 * - Centralized page management system
 * - Consistent page initialization across all pages
 * - Unified API for page state management
 * - Easy to maintain and extend page functionality
 * 
 * CONTENTS:
 * =========
 * 
 * 1. PAGE INITIALIZATION:
 *    - initializePage() - Main page initialization function
 *    - initializePageFilters() - Initialize page-specific filters
 *    - setupSortableHeaders() - Setup sortable table headers
 *    - updateTableStats() - Update page table statistics
 * 
 * 2. PAGE STATE MANAGEMENT:
 *    - savePageState() - Save current page state
 *    - loadPageState() - Load saved page state
 *    - clearPageState() - Clear saved page state
 *    - restoreDesignsSectionState() - Restore designs section state
 * 
 * 3. PAGE NAVIGATION:
 *    - navigateToPage() - Navigate to specific page
 *    - getCurrentPageName() - Get current page name
 *    - isCurrentPage() - Check if current page matches
 *    - isPageAvailable() - Check if page is available
 *    - getPageInfo() - Get page information
 * 
 * 4. DEBUG AND UTILITIES:
 *    - debugSavedFilters() - Debug saved filter state
 *    - Page-specific utility functions
 * 
 * DEPENDENCIES:
 * ============
 * - ui-utils.js: UI interaction helpers
 * - data-utils.js: Data management functions
 * - tables.js: Table management functions
 * - translation-utils.js: Text translations
 * 
 * USAGE:
 * ======
 * 
 * Initialize page:
 * ```javascript
 * initializePage('trades');
 * ```
 * 
 * Save page state:
 * ```javascript
 * savePageState('accounts', { filters: {...}, sort: {...} });
 * ```
 * 
 * Navigate to page:
 * ```javascript
 * navigateToPage('alerts', { preserveState: true });
 * ```
 * 
 * @version 1.0
 * @lastUpdated August 24, 2025
 * @refactoringPhase 6 - Modular Architecture
 */

// ===== PAGE INITIALIZATION =====
/**
 * Initialize page-specific filters
 * 
 * Sets up page-specific filter functionality including saved filter restoration,
 * filter event handlers, and filter state management.
 * 
 * @param {string} pageName - Name of the page to initialize filters for
 */
function initializePageFilters(pageName) {
    // Initializing filters for page

    try {
        // Load saved filter state
        const savedFilters = loadPageState(pageName);
        if (savedFilters && savedFilters.filters) {
            // Restoring saved filters
            applySavedFilters(savedFilters.filters);
        }

        // Setup filter event handlers
        setupFilterEventHandlers(pageName);

        // Filters initialized for page
    } catch (error) {
        // Error initializing filters
    }
}

/**
 * Setup sortable headers for tables
 * 
 * Configures click handlers for sortable table headers and restores
 * previous sort state if available.
 * 
 * @param {string} pageName - Name of the page
 */
function setupSortableHeaders(pageName) {
    // Setting up sortable headers for page

    try {
        // Find all sortable headers
        const sortableHeaders = document.querySelectorAll('.sortable-header');

        sortableHeaders.forEach((header, index) => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                handleHeaderSort(pageName, index);
            });
        });

        // Restore previous sort state
        const savedState = loadPageState(pageName);
        if (savedState && savedState.sort) {
            // Restoring sort state
            restoreSortState(pageName, savedState.sort);
        }

        // Sortable headers setup for page
    } catch (error) {
        // Error setting up sortable headers
    }
}

/**
 * Update table statistics
 * 
 * Updates the statistics display for the current page's table
 * including counts, summaries, and performance metrics.
 * 
 * @param {string} pageName - Name of the page
 * @param {Array} data - Current table data
 */
function updateTableStats(pageName, data = null) {
    // Updating table stats for page

    try {
        // Get current data if not provided
        if (!data) {
            data = getCurrentTableData(pageName);
        }

        // Calculate statistics
        const stats = calculateTableStats(data, pageName);

        // Update display
        updateStatsDisplay(pageName, stats);

        // Table stats updated for page
    } catch (error) {
        // Error updating table stats
    }
}

/**
 * Debug saved filters
 * 
 * Logs the current saved filter state for debugging purposes
 * 
 * @param {string} pageName - Name of the page to debug
 */
function debugSavedFilters(pageName) {
    // Debugging saved filters for page

    const savedState = loadPageState(pageName);
    // Saved state

    if (savedState && savedState.filters) {
        // Active filters
    } else {
        // No saved filters found
    }
}

/**
 * Restore designs section state
 * 
 * Special function for restoring the designs section collapse state
 * Used specifically on the designs/trade plans page
 */
function restoreDesignsSectionState() {
    // Restoring designs section state

    try {
        const collapsed = localStorage.getItem('designsSectionCollapsed') === 'true';
        const sectionBody = document.querySelector('.content-section .section-body');
        const toggleBtn = document.querySelector('.content-section .filter-toggle-btn');
        const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

        if (sectionBody && collapsed) {
            sectionBody.style.display = 'none';
            if (icon) {
                icon.textContent = '▼';
            }
        }

        // Designs section state restored
    } catch (error) {
        // Error restoring designs section state
    }
}

/**
 * Initialize page with all necessary components
 * 
 * Main page initialization function that sets up all page-specific
 * functionality including filters, sorting, statistics, and state management.
 * 
 * @param {string} pageName - Name of the page to initialize
 */
function initializePage(pageName) {
    // Initializing page

    try {
        // Initialize page filters
        initializePageFilters(pageName);

        // Setup sortable headers
        setupSortableHeaders(pageName);

        // Update table statistics
        updateTableStats(pageName);

        // Page-specific initialization
        switch (pageName) {
            case 'designs':
            case 'trade_plans':
                restoreDesignsSectionState();
                break;
            case 'trades':
                initializeTradesPage();
                break;
            case 'accounts':
                initializeAccountsPage();
                break;
            case 'alerts':
                initializeAlertsPage();
                break;
            // Add more page-specific initializations as needed
        }

        // Page initialized successfully
    } catch (error) {
        // Error initializing page
    }
}

// ===== PAGE STATE MANAGEMENT =====
/**
 * Save page state to localStorage
 * 
 * Saves the current page state including filters, sort settings,
 * and other page-specific data for later restoration.
 * 
 * @param {string} pageName - Name of the page
 * @param {Object} state - State object to save
 */
function savePageState(pageName, state) {
    try {
        const key = `pageState_${pageName}`;
        const stateToSave = {
            ...state,
            timestamp: Date.now(),
            pageName: pageName
        };

        localStorage.setItem(key, JSON.stringify(stateToSave));
        // Page state saved for page
    } catch (error) {
        // Error saving page state
    }
}

/**
 * Load saved page state from localStorage
 * 
 * Retrieves and returns the saved page state including filters,
 * sort settings, and other page-specific data.
 * 
 * @param {string} pageName - Name of the page
 * @returns {Object|null} Saved state object or null if not found
 */
function loadPageState(pageName) {
    try {
        const key = `pageState_${pageName}`;
        const savedState = localStorage.getItem(key);

        if (savedState) {
            const state = JSON.parse(savedState);
            // Page state loaded for page
            return state;
        }

        return null;
    } catch (error) {
        // Error loading page state
        return null;
    }
}

/**
 * Clear saved page state
 * 
 * Removes the saved page state from localStorage
 * 
 * @param {string} pageName - Name of the page
 */
function clearPageState(pageName) {
    try {
        const key = `pageState_${pageName}`;
        localStorage.removeItem(key);
        // Page state cleared for page
    } catch (error) {
        // Error clearing page state
    }
}

/**
 * Check if page is available
 * 
 * Checks if a page exists and is accessible
 * 
 * @param {string} pageName - Name of the page to check
 * @returns {boolean} True if page is available
 */
function isPageAvailable(pageName) {
    const availablePages = [
        'trades', 'accounts', 'alerts', 'tickers', 'cash_flows',
        'notes', 'trade_plans', 'designs', 'executions', 'research',
        'preferences', 'constraints', 'db_display', 'db_extradata'
    ];

    return availablePages.includes(pageName);
}

/**
 * Get page information
 * 
 * Returns information about a specific page including its URL,
 * title, and other metadata.
 * 
 * @param {string} pageName - Name of the page
 * @returns {Object} Page information object
 */
function getPageInfo(pageName) {
    const pageInfo = {
        trades: { url: '/trades', title: 'Trades', icon: '📈' },
        accounts: { url: '/accounts', title: 'Accounts', icon: '💰' },
        alerts: { url: '/alerts', title: 'Alerts', icon: '🔔' },
        tickers: { url: '/tickers', title: 'Tickers', icon: '🏢' },
        cash_flows: { url: '/cash_flows', title: 'Cash Flows', icon: '💸' },
        notes: { url: '/notes', title: 'Notes', icon: '📝' },
        trade_plans: { url: '/trade_plans', title: 'Trade Plans', icon: '📋' },
        designs: { url: '/designs', title: 'Designs', icon: '🎨' },
        executions: { url: '/executions', title: 'Executions', icon: '⚡' },
        research: { url: '/research', title: 'Research', icon: '🔬' },
        preferences: { url: '/preferences', title: 'Preferences', icon: '⚙️' },
        constraints: { url: '/constraints', title: 'Constraints', icon: '🔒' },
        db_display: { url: '/db_display', title: 'Database Display', icon: '🗄️' },
        db_extradata: { url: '/db_extradata', title: 'Database Extra Data', icon: '📊' }
    };

    return pageInfo[pageName] || { url: '/', title: 'Unknown', icon: '❓' };
}

/**
 * Navigate to specific page
 * 
 * Navigates to a specific page with optional state preservation
 * 
 * @param {string} pageName - Name of the page to navigate to
 * @param {Object} options - Navigation options
 * @param {boolean} options.preserveState - Whether to preserve current state
 * @param {Object} options.state - State to pass to the new page
 */
function navigateToPage(pageName, options = {}) {
    // Navigating to page

    try {
        if (!isPageAvailable(pageName)) {
            // Page is not available
            return;
        }

        const pageInfo = getPageInfo(pageName);

        // Save current state if requested
        if (options.preserveState) {
            const currentPage = getCurrentPageName();
            const currentState = getCurrentPageState();
            savePageState(currentPage, currentState);
        }

        // Navigate to page
        window.location.href = pageInfo.url;

    } catch (error) {
        // Error navigating to page
    }
}

/**
 * Get current page name
 * 
 * Determines the current page name based on the URL path
 * 
 * @returns {string} Current page name
 */
function getCurrentPageName() {
    const path = window.location.pathname;

    // Extract page name from path
    const pageMatch = path.match(/\/([^\/]+)$/);
    if (pageMatch) {
        return pageMatch[1];
    }

    // Handle root path
    if (path === '/' || path === '') {
        return 'index';
    }

    return 'unknown';
}

/**
 * Check if current page matches
 * 
 * Checks if the current page matches the specified page name
 * 
 * @param {string} pageName - Name of the page to check
 * @returns {boolean} True if current page matches
 */
function isCurrentPage(pageName) {
    return getCurrentPageName() === pageName;
}

// ===== HELPER FUNCTIONS =====
/**
 * Apply saved filters to current page
 * 
 * @param {Object} filters - Filter object to apply
 */
function applySavedFilters(filters) {
    // Implementation for applying saved filters
    // Applying saved filters
}

/**
 * Setup filter event handlers
 * 
 * @param {string} pageName - Name of the page
 */
function setupFilterEventHandlers(pageName) {
    // Implementation for setting up filter event handlers
    // Setting up filter event handlers for page
}

/**
 * Handle header sort click
 * 
 * @param {string} pageName - Name of the page
 * @param {number} columnIndex - Index of the column
 */
function handleHeaderSort(pageName, columnIndex) {
    // Implementation for handling header sort
    // Handling header sort for page
}

/**
 * Restore sort state
 * 
 * @param {string} pageName - Name of the page
 * @param {Object} sortState - Sort state to restore
 */
function restoreSortState(pageName, sortState) {
    // Implementation for restoring sort state
    // Restoring sort state for page
}

/**
 * Get current table data
 * 
 * @param {string} pageName - Name of the page
 * @returns {Array} Current table data
 */
function getCurrentTableData(pageName) {
    // Implementation for getting current table data
    // Getting current table data for page
    return [];
}

/**
 * Calculate table statistics
 * 
 * @param {Array} data - Table data
 * @param {string} pageName - Name of the page
 * @returns {Object} Calculated statistics
 */
function calculateTableStats(data, pageName) {
    // Implementation for calculating table statistics
    // Calculating table stats for page
    return {
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        completed: data.filter(item => item.status === 'completed').length
    };
}

/**
 * Update statistics display
 * 
 * @param {string} pageName - Name of the page
 * @param {Object} stats - Statistics to display
 */
function updateStatsDisplay(pageName, stats) {
    // Implementation for updating statistics display
    // Updating stats display for page
}

/**
 * Get current page state
 * 
 * @returns {Object} Current page state
 */
function getCurrentPageState() {
    // Implementation for getting current page state
    // Getting current page state
    return {
        filters: {},
        sort: {},
        timestamp: Date.now()
    };
}

// ===== PAGE-SPECIFIC INITIALIZATION FUNCTIONS =====
/**
 * Initialize trades page
 */
function initializeTradesPage() {
    // Initializing trades page
    // Trades-specific initialization
}

/**
 * Initialize accounts page
 */
function initializeAccountsPage() {
    // Initializing accounts page
    // Accounts-specific initialization
}

/**
 * Initialize alerts page
 */
function initializeAlertsPage() {
    // Initializing alerts page
    // Alerts-specific initialization
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.initializePageFilters = initializePageFilters;
window.setupSortableHeaders = setupSortableHeaders;
window.updateTableStats = updateTableStats;
window.debugSavedFilters = debugSavedFilters;
window.restoreDesignsSectionState = restoreDesignsSectionState;
window.initializePage = initializePage;
window.savePageState = savePageState;
window.loadPageState = loadPageState;
window.clearPageState = clearPageState;
window.isPageAvailable = isPageAvailable;
window.getPageInfo = getPageInfo;
window.navigateToPage = navigateToPage;
window.getCurrentPageName = getCurrentPageName;
window.isCurrentPage = isCurrentPage;

// ייצוא המודול עצמו
window.pageUtils = {
    initializePageFilters,
    setupSortableHeaders,
    updateTableStats,
    debugSavedFilters,
    restoreDesignsSectionState,
    initializePage,
    savePageState,
    loadPageState,
    clearPageState,
    isPageAvailable,
    getPageInfo,
    navigateToPage,
    getCurrentPageName,
    isCurrentPage,
    getCurrentTableData,
    calculateTableStats,
    updateStatsDisplay,
    getCurrentPageState,
    initializeTradesPage,
    initializeAccountsPage,
    initializeAlertsPage
};

// Page Utils loaded successfully
