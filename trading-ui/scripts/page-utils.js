/**
 * Page Utils - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains page management utilities for TikTrack.
 * Includes page initialization, state management, navigation, and debug utilities.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/PAGE_UTILITIES_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

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

(function registerPageStateManagerLoader() {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.ensurePageStateManagerReady === 'function') {
    return;
  }

  let pageStateManagerPromise = null;

  function getAssetVersion() {
    return (
      window.__ASSET_VERSION__ ||
      window.APP_VERSION_TOKEN ||
      window.APP_BUILD_HASH ||
      '1.0.0'
    );
  }

  function buildScriptUrl() {
    const version = getAssetVersion();
    return `scripts/page-state-manager.js?v=${version}`;
  }

  function appendPageStateManagerScript(resolve, reject) {
    const existingScript = document.querySelector('script[data-system="page-state-manager"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.PageStateManager));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = buildScriptUrl();
    script.async = true;
    script.dataset.system = 'page-state-manager';
    script.onload = () => {
      window.Logger?.info?.('✅ PageStateManager script loaded on-demand', { page: 'page-utils' });
      resolve(window.PageStateManager);
    };
    script.onerror = (event) => {
      window.Logger?.error?.('❌ Failed to load PageStateManager script', event, { page: 'page-utils' });
      reject(event);
    };
    document.head.appendChild(script);
  }

  window.ensurePageStateManagerReady = async function ensurePageStateManagerReady() {
    if (window.PageStateManager) {
      if (typeof window.PageStateManager.initialize === 'function' && !window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }
      return window.PageStateManager;
    }

    if (!pageStateManagerPromise) {
      pageStateManagerPromise = new Promise((resolve, reject) => {
        try {
          appendPageStateManagerScript(resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }

    try {
      await pageStateManagerPromise;
      if (window.PageStateManager && typeof window.PageStateManager.initialize === 'function' && !window.PageStateManager.initialized) {
        await window.PageStateManager.initialize();
      }
    } catch (error) {
      window.Logger?.error?.('❌ ensurePageStateManagerReady failed', error, { page: 'page-utils' });
    }

    return window.PageStateManager || null;
  };
})();

// ===== PAGE INITIALIZATION =====
/**
 * Initialize page-specific filters
 *
 * Sets up page-specific filter functionality including saved filter restoration,
 * filter event handlers, and filter state management.
 *
 * @param {string} pageName - Name of the page to initialize filters for
 */
/**
 * Initialize page filters
 * @function initializePageFilters
 * @param {string} pageName - Page name
 * @returns {void}
 */
async function initializePageFilters(pageName) {
  // Initializing filters for page

  try {
    // Load saved filter state
    const savedFilters = await loadPageState(pageName);
    if (savedFilters && savedFilters.filters) {
      // Restoring saved filters
      applySavedFilters(savedFilters.filters);
    }

    // Setup filter event handlers
    setupFilterEventHandlers(pageName);

    // Filters initialized for page
  } catch {
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
/**
 * Setup sortable headers
 * @function setupSortableHeaders
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function setupSortableHeaders(pageName) {
  try {
    const tables = Array.from(document.querySelectorAll('table[data-table-type]'));

    tables.forEach((table) => {
      const tableType = table.getAttribute('data-table-type');
      if (!tableType) {
        return;
      }

      if (window.UnifiedTableSystem?.events?.setupSortHandlers) {
        window.UnifiedTableSystem.events.setupSortHandlers(tableType);
      } else {
        const headers = table.querySelectorAll('.sortable-header');
        headers.forEach((header, index) => {
          header.addEventListener('click', (event) => {
            event.preventDefault();
            handleHeaderSort(pageName, index, event);
          });
        });
      }
    });

    if (pageName) {
      await restoreSortState(pageName);
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.warn('setupSortableHeaders: Failed to initialize sortable headers', error, { page: pageName || 'global' });
    }
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
/**
 * Update table statistics
 * @function updateTableStats
 * @param {string} pageName - Page name
 * @param {Array} data - Table data
 * @returns {void}
 */
function updateTableStats(pageName, data = null) {
  // Updating table stats for page

  try {
    // Get current data if not provided
    let currentData = data;
    if (!currentData) {
      currentData = getCurrentTableData(pageName);
    }

    // Calculate statistics
    const stats = calculateTableStats(currentData, pageName);

    // Update display
    updateStatsDisplay(pageName, stats);

    // Table stats updated for page
  } catch {
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
/**
 * Debug saved filters
 * @function debugSavedFilters
 * @param {string} pageName - Page name
 * @returns {void}
 */
async function debugSavedFilters(pageName) {
  // Debugging saved filters for page

  const savedState = await loadPageState(pageName);
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
/**
 * Restore designs section state
 * @function restoreDesignsSectionState
 * @returns {void}
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
  } catch {
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
/**
 * Initialize page
 * @function initializePage
 * @param {string} pageName - Page name
 * @returns {void}
 */
async function initializePage(pageName) {
  // Initializing page

  try {
    // Initialize page filters
    await initializePageFilters(pageName);

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
    case 'trading_accounts':
      // Trading accounts page initialization handled by unified initialization system
      break;
    case 'alerts':
      initializeAlertsPage();
      break;
            // Add more page-specific initializations as needed
    }

    // Page initialized successfully
  } catch {
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
/**
 * Save page state
 * @function savePageState
 * @param {string} pageName - Page name
 * @param {Object} state - Page state
 * @returns {Promise<void>}
 */
async function savePageState(pageName, state) {
  try {
    // שמירה דרך PageStateManager אם זמין
    if (window.PageStateManager && window.PageStateManager.initialized) {
      await window.PageStateManager.savePageState(pageName, state);
      return;
    }
    
    // Fallback ל-localStorage רק אם PageStateManager לא זמין
    const key = `pageState_${pageName}`;
    const stateToSave = {
      ...state,
      timestamp: Date.now(),
      pageName,
    };

    localStorage.setItem(key, JSON.stringify(stateToSave));
    // Page state saved for page
  } catch {
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
/**
 * Load page state
 * @function loadPageState
 * @param {string} pageName - Page name
 * @returns {Promise<Object|null>} Saved page state
 */
async function loadPageState(pageName) {
  try {
    const resolvedPageName = resolvePageName(pageName);
    if (!resolvedPageName) {
      window.Logger?.warn?.('loadPageState: missing page name, skipping', { page: 'page-utils' });
      return null;
    }

    // טעינה דרך PageStateManager אם זמין
    if (window.PageStateManager && window.PageStateManager.initialized) {
      const state = await window.PageStateManager.loadPageState(resolvedPageName);
      if (state) {
        return state;
      }
    }
    
    // Fallback ל-localStorage רק אם PageStateManager לא זמין או אין מצב שמור
    const key = `pageState_${resolvedPageName}`;
    const savedState = localStorage.getItem(key);

    if (savedState) {
      const state = JSON.parse(savedState);
      // Page state loaded for page
      return state;
    }

    return null;
  } catch {
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
/**
 * Clear page state
 * @function clearPageState
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function clearPageState(pageName) {
  try {
    const resolvedPageName = resolvePageName(pageName);
    if (!resolvedPageName) {
      window.Logger?.warn?.('clearPageState: missing page name, skipping', { page: 'page-utils' });
      return;
    }

    // מחיקה דרך PageStateManager אם זמין
    if (window.PageStateManager && window.PageStateManager.initialized) {
      await window.PageStateManager.clearPageState(resolvedPageName);
      return;
    }
    
    // Fallback ל-localStorage רק אם PageStateManager לא זמין
    const key = `pageState_${resolvedPageName}`;
    localStorage.removeItem(key);
    // Page state cleared for page
  } catch {
    // Error clearing page state
  }
}

function resolvePageName(explicitPageName) {
  if (explicitPageName && typeof explicitPageName === 'string') {
    return explicitPageName;
  }

  if (typeof window?.getCurrentPageName === 'function') {
    const current = window.getCurrentPageName();
    if (current) {
      return current;
    }
  }

  if (typeof window?.location?.pathname === 'string') {
    const path = window.location.pathname.replace(/^\//, '');
    if (path) {
      return path.replace('.html', '');
    }
  }

  return null;
}

/**
 * Check if page is available
 *
 * Checks if a page exists and is accessible
 *
 * @param {string} pageName - Name of the page to check
 * @returns {boolean} True if page is available
 */
/**
 * Check if page is available
 * @function isPageAvailable
 * @param {string} pageName - Page name
 * @returns {boolean} Whether page is available
 */
function isPageAvailable(pageName) {
  const availablePages = [
    'trades', 'accounts', 'alerts', 'tickers', 'cash_flows',
    'notes', 'trade_plans', 'designs', 'executions', 'research',
    'preferences', 'constraints', 'db_display', 'db_extradata',
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
/**
 * Get page information
 * @function getPageInfo
 * @param {string} pageName - Page name
 * @returns {Object} Page information
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
    db_extradata: { url: '/db_extradata', title: 'Database Extra Data', icon: '📊' },
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
/**
 * Navigate to page
 * @function navigateToPage
 * @param {string} pageName - Page name
 * @param {Object} options - Navigation options
 * @returns {void}
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

  } catch {
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
/**
 * Get current page name
 * @function getCurrentPageName
 * @returns {string} Current page name
 */
function getCurrentPageName() {
  const path = window.location.pathname;

  // Extract page name from path
  const pageMatch = path.match(/\/([^/]+)$/);
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
/**
 * Check if current page matches
 * @function isCurrentPage
 * @param {string} pageName - Page name
 * @returns {boolean} Whether current page matches
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
/**
 * Apply saved filters
 * @function applySavedFilters
 * @param {Object} filters - Saved filters
 * @returns {void}
 */
function applySavedFilters(_filters) {
  // Implementation for applying saved filters
  // Applying saved filters
}

/**
 * Setup filter event handlers
 *
 * @param {string} pageName - Name of the page
 */
/**
 * Setup filter event handlers
 * @function setupFilterEventHandlers
 * @param {string} pageName - Page name
 * @returns {void}
 */
function setupFilterEventHandlers(_pageName) {
  // Implementation for setting up filter event handlers
  // Setting up filter event handlers for page
}

/**
 * Handle header sort click
 *
 * @param {string} pageName - Name of the page
 * @param {number} columnIndex - Index of the column
 */
/**
 * Handle header sort
 * @function handleHeaderSort
 * @param {string} pageName - Page name
 * @param {number} columnIndex - Column index
 * @returns {void}
 */
function handleHeaderSort(pageName, columnIndex, event = null) {
  try {
    let tableType = null;

    if (event?.currentTarget) {
      const headerElement = event.currentTarget;
      const owningTable = headerElement.closest('table[data-table-type]');
      tableType = owningTable ? owningTable.getAttribute('data-table-type') : null;
    }

    if (!tableType) {
      const activeTable = document.querySelector('table[data-table-type]');
      tableType = activeTable ? activeTable.getAttribute('data-table-type') : null;
    }

    if (!tableType || typeof columnIndex !== 'number') {
      return;
    }

    // CRITICAL: Check UnifiedTableSystem FIRST if table is registered
    // This handles static tables that are registered directly with UnifiedTableSystem
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
      const result = window.UnifiedTableSystem.sorter.sort(tableType, columnIndex);
      if (window.Logger) {
        window.Logger.debug(`handleHeaderSort: Sorted table "${tableType}" by column ${columnIndex} using UnifiedTableSystem`, { 
          page: pageName || 'global',
          resultLength: result?.length || 0
        });
      }
      return;
    }

    // Fallback: Use window.sortTable if available (for dynamic tables)
    if (typeof window.sortTable === 'function') {
      const result = window.sortTable(tableType, columnIndex);
      if (window.Logger) {
        window.Logger.debug(`handleHeaderSort: Sorted table "${tableType}" by column ${columnIndex} using window.sortTable`, { 
          page: pageName || 'global',
          resultLength: result?.length || 0
        });
      }
      return;
    }

    // Last resort: Use window.sortTableData if available
    if (typeof window.sortTableData === 'function') {
      window.Logger?.warn?.('handleHeaderSort: Using deprecated sortTableData fallback', {
        page: pageName || 'global',
        tableType,
        columnIndex,
      });
      // Note: sortTableData requires data array and updateFunction, which we don't have here
      // This is a fallback that may not work correctly
      return;
    }

    // No sorting function available
    window.Logger?.error?.('handleHeaderSort: No sorting function available', {
      page: pageName || 'global',
      tableType,
      columnIndex,
      unifiedTableSystemAvailable: !!window.UnifiedTableSystem,
      tableRegistered: window.UnifiedTableSystem?.registry?.isRegistered(tableType) || false,
      sortTableAvailable: typeof window.sortTable === 'function',
      sortTableDataAvailable: typeof window.sortTableData === 'function'
    });
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('handleHeaderSort: Failed to sort table header click', error, { page: pageName || 'global' });
    }
  }
}

/**
 * Restore sort state
 *
 * @param {string} pageName - Name of the page
 * @param {Object} sortState - Sort state to restore
 */
/**
 * Restore sort state
 * @function restoreSortState
 * @param {string} pageName - Page name
 * @param {Object} sortState - Sort state
 * @returns {void}
 */
async function restoreSortState(pageName) {
  try {
    const tables = Array.from(document.querySelectorAll('table[data-table-type]'));
    const tableTypes = tables
      .map((table) => table.getAttribute('data-table-type'))
      .filter((type) => typeof type === 'string' && type.length > 0);

    if (tableTypes.length === 0) {
      return;
    }

    const handledTables = new Set();
    let sortStateMap = null;

    if (window.PageStateManager && typeof window.PageStateManager.loadSort === 'function' && pageName) {
      sortStateMap = await window.PageStateManager.loadSort(pageName);
    }

    if (sortStateMap && typeof sortStateMap === 'object') {
      for (const [tableType, sortState] of Object.entries(sortStateMap)) {
        if (!tableType || !sortState) {
          continue;
        }
        handledTables.add(tableType);

        // Get tableId for pagination updates
        const table = document.querySelector(`table[data-table-type="${tableType}"]`);
        const tableId = table ? table.id : null;

        if (Array.isArray(sortState.chain) && window.UnifiedTableSystem?.sorter?.sortByChain) {
          const sortedData = await window.UnifiedTableSystem.sorter.sortByChain(tableType, sortState.chain, { saveState: false });
          // Update pagination after restoring sort
          if (tableId && window.PaginationSystem && Array.isArray(sortedData)) {
            try {
              const paginationInstance = window.PaginationSystem.get(tableId);
              if (paginationInstance && typeof paginationInstance.setData === 'function') {
                paginationInstance.setData(sortedData);
              }
            } catch (err) {
              if (window.Logger) {
                window.Logger.warn(`restoreSortState: Failed to update pagination for "${tableType}"`, err, { page: pageName || 'global' });
              }
            }
          }
        } else if (typeof sortState.columnIndex === 'number' && sortState.columnIndex >= 0) {
          if (window.UnifiedTableSystem?.sorter?.sort) {
            const sortedData = await window.UnifiedTableSystem.sorter.sort(tableType, sortState.columnIndex, {
              direction: sortState.direction || 'asc',
              saveState: false
            });
            // Update pagination after restoring sort
            if (tableId && window.PaginationSystem && Array.isArray(sortedData)) {
              try {
                const paginationInstance = window.PaginationSystem.get(tableId);
                if (paginationInstance && typeof paginationInstance.setData === 'function') {
                  paginationInstance.setData(sortedData);
                }
              } catch (err) {
                if (window.Logger) {
                  window.Logger.warn(`restoreSortState: Failed to update pagination for "${tableType}"`, err, { page: pageName || 'global' });
                }
              }
            }
          } else {
            await window.restoreAnyTableSort(tableType);
          }
        }
      }
    }

    for (const tableType of tableTypes) {
      if (handledTables.has(tableType)) {
        continue;
      }
      if (window.UnifiedTableSystem?.sorter?.applyDefaultSort) {
        await window.UnifiedTableSystem.sorter.applyDefaultSort(tableType);
      }
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.warn('restoreSortState: Failed to restore sort state', error, { page: pageName || 'global' });
    }
  }
}

/**
 * Get current table data
 *
 * @param {string} pageName - Name of the page
 * @returns {Array} Current table data
 */
/**
 * Get current table data
 * @function getCurrentTableData
 * @param {string} pageName - Page name
 * @returns {Array} Current table data
 */
function getCurrentTableData(_pageName) {
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
/**
 * Calculate table statistics
 * @function calculateTableStats
 * @param {Array} data - Table data
 * @param {string} pageName - Page name
 * @returns {Object} Table statistics
 */
function calculateTableStats(data, _pageName) {
  // Implementation for calculating table statistics
  // Calculating table stats for page
  return {
    total: data.length,
    active: data.filter(item => item.status === 'active').length,
    completed: data.filter(item => item.status === 'completed').length,
  };
}

/**
 * Update statistics display
 *
 * @param {string} pageName - Name of the page
 * @param {Object} stats - Statistics to display
 */
/**
 * Update stats display
 * @function updateStatsDisplay
 * @param {string} pageName - Page name
 * @param {Object} stats - Statistics
 * @returns {void}
 */
function updateStatsDisplay(_pageName, _stats) {
  // Implementation for updating statistics display
  // Updating stats display for page
}

/**
 * Get current page state
 *
 * @returns {Object} Current page state
 */
/**
 * Get current page state
 * @function getCurrentPageState
 * @returns {Object} Current page state
 */
function getCurrentPageState() {
  // Implementation for getting current page state
  // Getting current page state
  return {
    filters: {},
    sort: {},
    timestamp: Date.now(),
  };
}

// ===== PAGE-SPECIFIC INITIALIZATION FUNCTIONS =====
/**
 * Initialize trades page
 */
/**
 * Initialize trades page
 * @function initializeTradesPage
 * @returns {void}
 */
function initializeTradesPage() {
  // Initializing trades page
  // Trades-specific initialization
}

/**
 * Initialize accounts page
 */
/**
 * Initialize accounts page
 * @function initializeAccountsPage
 * @returns {void}
 */
function initializeAccountsPage() {
  // Initializing accounts page
  // Accounts-specific initialization
}

/**
 * Initialize alerts page
 */
/**
 * Initialize alerts page
 * @function initializeAlertsPage
 * @returns {void}
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
  initializeAlertsPage,
};

// Page Utils loaded successfully
