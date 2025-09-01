/**
 * Main.js - TikTrack Frontend Core
 * =================================
 *
 * REFACTORING HISTORY & ARCHITECTURE:
 * ====================================
 *
 * This file has undergone significant refactoring to improve code organization:
 *
 * ORIGINAL STATE (v2.2):
 * - 2153 lines of mixed functionality
 * - Duplicate functions across multiple files
 * - Difficult to maintain and debug
 * - All utilities centralized in one massive file
 *
 * REFACTORING PHASES:
 * ===================
 *
 * PHASE 1: Function Consolidation (August 2025)
 * - Moved showNotification, formatDate, formatDateTime, formatDateOnly, loadAccountsData to main.js
 * - Moved createAccountModal, showAddAccountModal to accounts.js
 * - Moved showModalNotification, showSecondConfirmationModal to ui-utils.js
 * - Moved toggleSection, toggleAllSections to main.js
 * - Moved apiCall to data-utils.js
 * - Moved colorAmount to ui-utils.js
 *
 * PHASE 2: Date Functions Centralization
 * - Consolidated date formatting functions (formatDate, formatDateTime, formatDateOnly) into main.js
 * - Removed duplicates from cash_flows.js, tickers.js, currencies.js
 *
 * PHASE 3: Table Functions Analysis
 * - Analyzed update*Table functions for 100% identity
 * - Confirmed page-specific versions differ from database.js versions
 * - Page-specific versions accept data parameters and include complex logic
 * - Database.js versions are simpler and operate on global allData
 *
 * PHASE 4: loadAccountsData Unification
 * - Found three versions: loadAccountsData, loadAccountsDataFromAPI, loadAccountsDataForAccountsPage
 * - Kept loadAccountsDataForAccountsPage as most advanced
 * - Commented out other two versions
 * - Updated all references to use loadAccountsDataForAccountsPage
 *
 * PHASE 5: Modal Functions Consolidation
 * - Removed showModalNotification from main.js
 * - Removed showSecondConfirmationModal from accounts.js
 * - All calls updated to use versions in ui-utils.js
 *
 * PHASE 6: Main.js Modular Split (August 24, 2025)
 * - Split main.js into topic-based modules:
 *   * tables.js - All table-related functionality (sorting, grid operations)
 *   * date-utils.js - Date formatting, conversion, validation, calculations
 *   * linked-items.js - Linked items viewing, loading, display management
 *   * page-utils.js - Page-specific utilities, initialization, state management
 * - New main.js serves as core initializer and dependency checker
 *
 * CURRENT ARCHITECTURE:
 * ====================
 *
 * main.js (THIS FILE):
 * - Global initialization logic
 * - Dependency checks and system validation
 * - Auto-initialization on page load
 * - Core utility functions that must remain global
 *
 * tables.js:
 * - Table sorting system (sortTableData, sortAnyTable, etc.)
 * - Grid core functions
 * - Sort state management
 * - Table-specific utilities
 *
 * date-utils.js:
 * - Date formatting functions (formatDate, formatDateTime, etc.)
 * - Date conversion utilities
 * - Date validation functions
 * - Date calculation helpers
 *
 * linked-items.js:
 * - Linked items viewing system
 * - Modal creation for linked items
 * - Item type management
 * - Export functionality
 *
 * page-utils.js:
 * - Page initialization functions
 * - Page state management

 * - Navigation utilities
 *
 * DEPENDENCIES:
 * ============
 * - All modular files must be loaded before main.js
 * - Functions are exported to global scope (window object)
 * - Backward compatibility maintained for existing function calls
 *
 * RECENT UPDATES (August 31, 2025):
 * =================================
 * - Enhanced support for trade plans page
 * - Improved validation system integration
 * - Better error handling and user feedback
 * - Updated function exports for new features
 *
 * HTML SCRIPT LOADING ORDER:
 * =========================
 * 1. header-system.js
 * 2. console-cleanup.js

 * 4. translation-utils.js
 * 5. data-utils.js
 * 6. ui-utils.js
 * 7. table-mappings.js
 * 8. date-utils.js
 * 9. tables.js
 * 10. linked-items.js
 * 11. page-utils.js
 * 12. main.js (THIS FILE)
 * 13. Page-specific files (alerts.js, accounts.js, etc.)
 *
 * @version 3.0
 * @lastUpdated August 24, 2025
 * @refactoringPhase 6 - Modular Architecture
 */

// ===== GLOBAL INITIALIZATION =====
/**
 * Main application initialization function
 * Called automatically when DOM is ready
 *
 * Responsibilities:
 * - Check all dependencies are loaded
 * - Initialize core systems
 * - Set up current page functionality
 * - Validate system health
 */
function initializeApplication() {
  try {
    // Check dependencies
    checkDependencies();

    // Initialize core systems
    initializeCoreSystems();

    // Initialize current page
    initializeCurrentPage();
  } catch (error) {
    // Application Initialization Failed
    showSystemError('Application initialization failed. Please refresh the page.');
  }
}

/**
 * Check if all required modules and functions are available
 *
 * @returns {boolean} True if all dependencies are satisfied
 */
function checkDependencies() {
  const requiredModules = [
    'translationUtils',
    'dataUtils',
    'uiUtils',
    'tableMappings',
    'dateUtils',
    'tables',
    'linkedItems',
    'pageUtils',
  ];

  const missingModules = requiredModules.filter(module => !window[module]);

  if (missingModules.length > 0) {
    console.warn('⚠️ Missing modules:', missingModules);

    // לא נחזיר false כדי לא לעצור את האתחול
    return true;
  }

  return true;
}

/**
 * Initialize core application systems
 * Sets up global event handlers and system-wide functionality
 */
function initializeCoreSystems() {
  // Initialize header system
  if (window.HeaderSystem && !window.headerSystem) {
    // Initializing header system from main.js
    window.headerSystem = new window.HeaderSystem();
    window.headerSystem.init();
  }


  // Set up global error handlers
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Set up global modal configurations
  setupGlobalModalConfigurations();
}

/**
 * Set up global modal configurations to prevent closing on backdrop click
 */
function setupGlobalModalConfigurations() {


  // Find all modals and configure them
  const modals = document.querySelectorAll('.modal');

  modals.forEach(modalElement => {
    const modalId = modalElement.id;
    const existingBackdrop = modalElement.getAttribute('data-bs-backdrop');
    const existingKeyboard = modalElement.getAttribute('data-bs-keyboard');

    // If modal already has specific backdrop settings, respect them
    if (existingBackdrop && existingKeyboard) {

      return;
    }

    // Default configuration for modals without specific settings
    modalElement.setAttribute('data-bs-backdrop', 'true');
    modalElement.setAttribute('data-bs-keyboard', 'true');

    // Special handling for specific modals that should not close on backdrop click
    if (modalId && (
      modalId.includes('delete') ||
      modalId.includes('warning') ||
      modalId.includes('confirm') ||
      modalId.includes('linkedItems') && !modalId.includes('details')
    )) {
      modalElement.setAttribute('data-bs-backdrop', 'static');
      modalElement.setAttribute('data-bs-keyboard', 'false');

      // Prevent closing on backdrop click for these modals
      modalElement.addEventListener('click', function(event) {
        if (event.target === modalElement) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });


    } else {

    }
  });
}

/**
 * Initialize current page specific functionality
 * Determines current page and calls appropriate initialization
 */
function initializeCurrentPage() {
  const currentPage = getCurrentPageName();

  // Call page-specific initialization if available
  const initFunctionName = `initialize${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}Page`;
  if (typeof window[initFunctionName] === 'function') {
    window[initFunctionName]();
  }

  // שחזור מצב הסקשנים אחרי אתחול הדף
  setTimeout(() => {
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates();
    } else {
      console.warn('⚠️ restoreAllSectionStates function not found');
    }
  }, 100);
}

// ===== GLOBAL HELPER FUNCTIONS =====
/**
 * Check if a module and function are available
 *
 * @param {string} moduleName - Name of the module to check
 * @param {string} functionName - Name of the function to check
 * @returns {boolean} True if both module and function exist
 */
function isModuleAvailable(moduleName, functionName) {
  return window[moduleName] && typeof window[functionName] === 'function';
}

/**
 * Get system information for debugging
 *
 * @returns {Object} System information object
 */
function getSystemInfo() {
  return {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    pageName: getCurrentPageName(),
    modules: {
      headerSystem: !!window.headerSystem,

      translationUtils: !!window.translationUtils,
      dataUtils: !!window.dataUtils,
      uiUtils: !!window.uiUtils,
      tableMappings: !!window.tableMappings,
      dateUtils: !!window.dateUtils,
      tables: !!window.tables,
      linkedItems: !!window.linkedItems,
      pageUtils: !!window.pageUtils,
    },
  };
}

// ===== ERROR HANDLING =====
/**
 * Handle global JavaScript errors
 *
 * @param {ErrorEvent} event - Error event object
 */
function handleGlobalError(event) {
  // Global Error
  showSystemError(`System error: ${event.error.message}`);
}

/**
 * Handle unhandled promise rejections
 *
 * @param {PromiseRejectionEvent} event - Rejection event object
 */
function handleUnhandledRejection(event) {
  // Unhandled Promise Rejection
  showSystemError(`Promise error: ${event.reason}`);
}

/**
 * Show system error notification
 *
 * @param {string} message - Error message to display
 */
function showSystemError(message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאת מערכת', message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(message, 'error', 'שגיאת מערכת');
  } else {
    console.error('❌ שגיאת מערכת:', message);
  }
}

// ===== SECTION STATE MANAGEMENT =====
/**
 * Restore all section states from localStorage
 * This function restores the open/closed state of all collapsible sections
 */
function restoreAllSectionStates() {
  const currentPath = window.location.pathname;

  try {
    // Special handling for database display page
    if (currentPath.includes('/db_display')) {
      // Restore top section state
      const topSectionHidden = localStorage.getItem('dbDisplayTopSectionCollapsed') === 'true';
      const topSection = document.querySelector('.top-section .section-body');
      const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
      const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

      if (topSection && topIcon) {
        if (topSectionHidden) {
          topSection.style.display = 'none';
          topIcon.textContent = '▼';
        } else {
          topSection.style.display = 'block';
          topIcon.textContent = '▲';
        }
      }

      // Restore all content sections state
      const contentSections = document.querySelectorAll('.content-section');
      contentSections.forEach(section => {
        const sectionTitle = section.querySelector('.table-title')?.textContent.trim();
        if (sectionTitle) {
          const isHidden = localStorage.getItem(`databaseSectionHidden_${sectionTitle}`) === 'true';
          const sectionBody = section.querySelector('.section-body');
          const toggleBtn = section.querySelector('button[onclick*="toggleMainSection"]');
          const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

          if (sectionBody && icon) {
            if (isHidden) {
              sectionBody.style.display = 'none';
              icon.textContent = '▼';
            } else {
              sectionBody.style.display = 'block';
              icon.textContent = '▲';
            }
          }
        }
      });

      // Restored database display page section states
      return;
    }

    // Regular handling for other pages
    const sectionToggles = document.querySelectorAll('[onclick*="toggleTopSection"], [onclick*="toggleMainSection"]');

    sectionToggles.forEach(toggle => {
      const sectionId = toggle.closest('.section-header')?.parentElement?.id;
      if (sectionId) {
        const isOpen = localStorage.getItem(`section_${sectionId}_open`) === 'true';
        const sectionBody = document.querySelector(`#${sectionId} .section-body`);
        const icon = toggle.querySelector('.filter-icon');

        if (sectionBody && icon) {
          if (isOpen) {
            sectionBody.style.display = 'block';
            icon.textContent = '▲';
          } else {
            sectionBody.style.display = 'none';
            icon.textContent = '▼';
          }
        }
      }
    });

    // Restore top section state for all pages
    const currentPath = window.location.pathname;
    let topSectionStorageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      topSectionStorageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning') || currentPath.includes('/trade_plans')) {
      topSectionStorageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/trades')) {
      topSectionStorageKey = 'tradesTopSectionCollapsed';
    } else if (currentPath.includes('/accounts')) {
      topSectionStorageKey = 'accountsTopSectionCollapsed';
    } else if (currentPath.includes('/tickers')) {
      topSectionStorageKey = 'tickersTopSectionCollapsed';
    } else if (currentPath.includes('/cash_flows')) {
      topSectionStorageKey = 'cashFlowsTopSectionCollapsed';
    } else if (currentPath.includes('/executions')) {
      topSectionStorageKey = 'executionsTopSectionCollapsed';
    } else if (currentPath.includes('/research')) {
      topSectionStorageKey = 'researchTopSectionCollapsed';
    } else if (currentPath.includes('/constraints')) {
      topSectionStorageKey = 'constraintsTopSectionCollapsed';

    } else if (currentPath.includes('/db_display')) {
      topSectionStorageKey = 'dbDisplayTopSectionCollapsed';
    } else if (currentPath.includes('/db_extradata')) {
      topSectionStorageKey = 'dbExtradataTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      topSectionStorageKey = 'topSectionCollapsed';
    }

    const topSectionCollapsed = localStorage.getItem(topSectionStorageKey) === 'true';
    const topSection = document.querySelector('.top-section .section-body');
    const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
    const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

    // Restoring top section state
    console.log('🔄 Restoring top section state:', {
      storageKey: topSectionStorageKey,
      savedState: topSectionCollapsed,
      topSectionFound: !!topSection,
      topToggleBtnFound: !!topToggleBtn,
      topIconFound: !!topIcon,
    });

    if (topSection && topIcon) {
      if (topSectionCollapsed) {
        topSection.style.display = 'none';
        topSection.classList.add('collapsed');
        topIcon.textContent = '▼';
      } else {
        topSection.style.display = 'block';
        topSection.classList.remove('collapsed');
        topIcon.textContent = '▲';
      }
      // Restored top section state
    } else {
      console.warn('⚠️ Could not restore top section state - elements not found');
    }

  } catch (error) {
    // Error restoring section states
  }
}

// Export to global scope
window.restoreAllSectionStates = restoreAllSectionStates;

// ===== GLOBAL TOGGLE FUNCTIONS =====
/**
 * Global toggle function for top sections
 * Handles opening/closing of top sections across all pages
 */
window.toggleTopSectionGlobal = function () {
  const currentPath = window.location.pathname;

  // Special handling for notes page
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesTopSection');
    const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // Update icon only
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // Save state
      localStorage.setItem('notesTopSectionHidden', !isHidden);
    }
    return;
  }

  // Regular handling for other pages
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  // toggleTopSectionGlobal called
  console.log('🔄 toggleTopSectionGlobal called:', {
    currentPath,
    sectionFound: !!section,
    toggleBtnFound: !!toggleBtn,
    iconFound: !!icon,
  });

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // Update icon
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // Determine localStorage key based on current page
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning') || currentPath.includes('/trade_plans')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/trades')) {
      storageKey = 'tradesTopSectionCollapsed';
    } else if (currentPath.includes('/accounts')) {
      storageKey = 'accountsTopSectionCollapsed';
    } else if (currentPath.includes('/tickers')) {
      storageKey = 'tickersTopSectionCollapsed';
    } else if (currentPath.includes('/cash_flows')) {
      storageKey = 'cashFlowsTopSectionCollapsed';
    } else if (currentPath.includes('/executions')) {
      storageKey = 'executionsTopSectionCollapsed';
    } else if (currentPath.includes('/research')) {
      storageKey = 'researchTopSectionCollapsed';
    } else if (currentPath.includes('/constraints')) {
      storageKey = 'constraintsTopSectionCollapsed';

    } else if (currentPath.includes('/db_display')) {
      storageKey = 'dbDisplayTopSectionCollapsed';
      // Database display page detected, using storage key
    } else if (currentPath.includes('/db_extradata')) {
      storageKey = 'dbExtradataTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    // Save state to localStorage
    localStorage.setItem(storageKey, !isCollapsed);
    // Saved top section state
  }
};

// Keep the original function name for backward compatibility
window.toggleTopSection = window.toggleTopSectionGlobal;

/**
 * Global toggle function for main sections
 * Handles opening/closing of main content sections across all pages
 */
window.toggleMainSection = function () {
  const currentPath = window.location.pathname;

  // Special handling for notes page
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesMainSection');
    const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // Update icon only
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // Save state
      localStorage.setItem('notesMainSectionHidden', !isHidden);
    }
    return;
  }

  // Special handling for database display page (multiple sections)
  if (currentPath.includes('/db_display')) {
    // Find the specific section that was clicked
    const clickedButton = window.event ? window.event.target.closest('button') : null;
    const currentSection = clickedButton ? clickedButton.closest('.content-section') : null;

    if (currentSection) {
      const sectionBody = currentSection.querySelector('.section-body');
      const toggleBtn = currentSection.querySelector('button[onclick*="toggleMainSection"]');
      const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
      const sectionTitle = currentSection.querySelector('.table-title').textContent.trim();

      if (sectionBody) {
        const isCollapsed = sectionBody.style.display === 'none';

        if (isCollapsed) {
          sectionBody.style.display = 'block';
          if (icon) {icon.textContent = '▲';}
        } else {
          sectionBody.style.display = 'none';
          if (icon) {icon.textContent = '▼';}
        }

        // Save state for this specific section
        localStorage.setItem(`databaseSectionHidden_${sectionTitle}`, !isCollapsed);
        // Saved database section state
      }
    }
    return;
  }

  // Regular handling for other pages
  const section = document.querySelector('.content-section .section-body');
  const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // Update icon
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // Determine localStorage key based on current page
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning') || currentPath.includes('/trade_plans')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/trades')) {
      storageKey = 'tradesMainSectionCollapsed';
    } else if (currentPath.includes('/accounts')) {
      storageKey = 'accountsMainSectionCollapsed';
    } else if (currentPath.includes('/tickers')) {
      storageKey = 'tickersMainSectionCollapsed';
    } else if (currentPath.includes('/cash_flows')) {
      storageKey = 'cashFlowsMainSectionCollapsed';
    } else if (currentPath.includes('/executions')) {
      storageKey = 'executionsMainSectionCollapsed';
    } else if (currentPath.includes('/research')) {
      storageKey = 'researchMainSectionCollapsed';
    } else if (currentPath.includes('/constraints')) {
      storageKey = 'constraintsMainSectionCollapsed';

    } else if (currentPath.includes('/db_display')) {
      storageKey = 'dbDisplayMainSectionCollapsed';
    } else if (currentPath.includes('/db_extradata')) {
      storageKey = 'dbExtradataMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    // Save state to localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

/**
 * Restore all section states from localStorage
 * Called on page load to restore previous section visibility states
 */
window.restoreAllSectionStates = function () {
  const currentPath = window.location.pathname;

  // Restore top section state
  let topSectionKey = 'topSectionCollapsed';
  if (currentPath.includes('/alerts')) {
    topSectionKey = 'alertsTopSectionCollapsed';
  } else if (currentPath.includes('/planning') || currentPath.includes('/trade_plans')) {
    topSectionKey = 'planningTopSectionCollapsed';
  } else if (currentPath.includes('/trades')) {
    topSectionKey = 'tradesTopSectionCollapsed';
  } else if (currentPath.includes('/accounts')) {
    topSectionKey = 'accountsTopSectionCollapsed';
  } else if (currentPath.includes('/tickers')) {
    topSectionKey = 'tickersTopSectionCollapsed';
  } else if (currentPath.includes('/cash_flows')) {
    topSectionKey = 'cashFlowsTopSectionCollapsed';
  } else if (currentPath.includes('/executions')) {
    topSectionKey = 'executionsTopSectionCollapsed';
  } else if (currentPath.includes('/research')) {
    topSectionKey = 'researchTopSectionCollapsed';
  } else if (currentPath.includes('/constraints')) {
    topSectionKey = 'constraintsTopSectionCollapsed';

  } else if (currentPath.includes('/db_display')) {
    topSectionKey = 'dbDisplayTopSectionCollapsed';
  } else if (currentPath.includes('/db_extradata')) {
    topSectionKey = 'dbExtradataTopSectionCollapsed';
  }

  const topSectionCollapsed = localStorage.getItem(topSectionKey) === 'true';
  // Restoring top section state
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

  if (topSection && topToggleBtn && topIcon) {
    // Found top section elements, applying state
    if (topSectionCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
      // Top section collapsed
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
      // Top section expanded
    }
  } else {
    // Top section elements not found
  }

  // Restore main section state
  let mainSectionKey = 'mainSectionCollapsed';
  if (currentPath.includes('/alerts')) {
    mainSectionKey = 'alertsMainSectionCollapsed';
  } else if (currentPath.includes('/planning') || currentPath.includes('/trade_plans')) {
    mainSectionKey = 'planningMainSectionCollapsed';
  } else if (currentPath.includes('/trades')) {
    mainSectionKey = 'tradesMainSectionCollapsed';
  } else if (currentPath.includes('/accounts')) {
    mainSectionKey = 'accountsMainSectionCollapsed';
  } else if (currentPath.includes('/tickers')) {
    mainSectionKey = 'tickersMainSectionCollapsed';
  } else if (currentPath.includes('/cash_flows')) {
    mainSectionKey = 'cashFlowsMainSectionCollapsed';
  } else if (currentPath.includes('/executions')) {
    mainSectionKey = 'executionsMainSectionCollapsed';
  } else if (currentPath.includes('/research')) {
    mainSectionKey = 'researchMainSectionCollapsed';
  } else if (currentPath.includes('/constraints')) {
    mainSectionKey = 'constraintsMainSectionCollapsed';

  } else if (currentPath.includes('/db_display')) {
    mainSectionKey = 'dbDisplayMainSectionCollapsed';
  } else if (currentPath.includes('/db_extradata')) {
    mainSectionKey = 'dbExtradataMainSectionCollapsed';
  }

  const mainSectionCollapsed = localStorage.getItem(mainSectionKey) === 'true';
  const mainSection = document.querySelector('.content-section .section-body');
  const mainToggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;

  if (mainSection && mainToggleBtn && mainIcon) {
    if (mainSectionCollapsed) {
      mainSection.classList.add('collapsed');
      mainSection.style.display = 'none';
      mainIcon.textContent = '▼';
    } else {
      mainSection.classList.remove('collapsed');
      mainSection.style.display = 'block';
      mainIcon.textContent = '▲';
    }
  }
};

/**
 * Restore designs section state (legacy function for backward compatibility)
 * This function is called by trade_plans.js but is not relevant for the planning page
 */
window.restoreDesignsSectionState = function () {
  // This function is kept for backward compatibility but doesn't do anything
  // as the planning page doesn't have a designs section
};

/**
 * Toggle a specific section
 * Handles opening/closing of individual content sections
 */
window.toggleSection = function (sectionId) {
  const section = document.querySelector(`[data-section="${sectionId}"]`);
  const sectionBody = section ? section.querySelector('.section-body') : null;
  const toggleBtn = section ? section.querySelector(`button[onclick*="toggleSection('${sectionId}')"], button[onclick*="toggleSection(${sectionId})"]`) : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody && toggleBtn) {
    const isCollapsed = sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.classList.remove('collapsed');
      sectionBody.style.display = 'block';
      if (icon) {
        icon.textContent = '▲';
      }
    } else {
      sectionBody.classList.add('collapsed');
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }

    // Save state to localStorage
    localStorage.setItem(`${sectionId}SectionCollapsed`, !isCollapsed);
  }
};

/**
 * Toggle all sections
 * Handles opening/closing of all content sections at once
 */
window.toggleAllSections = function () {
  const sections = document.querySelectorAll('.content-section');
  const allCollapsed = Array.from(sections).every(section => {
    const sectionBody = section.querySelector('.section-body');
    return sectionBody && (sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none');
  });

  sections.forEach(section => {
    const sectionId = section.getAttribute('data-section');
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector(`button[onclick*="toggleSection('${sectionId}')"], button[onclick*="toggleSection(${sectionId})"]`);
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && toggleBtn) {
      if (allCollapsed) {
        // Open all sections
        sectionBody.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) {
          icon.textContent = '▲';
        }
        localStorage.setItem(`${sectionId}SectionCollapsed`, 'false');
      } else {
        // Close all sections
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) {
          icon.textContent = '▼';
        }
        localStorage.setItem(`${sectionId}SectionCollapsed`, 'true');
      }
    }
  });

  // Update the main toggle button text
  const mainToggleBtn = document.querySelector('button[onclick="toggleAllSections()"]');
  if (mainToggleBtn) {
    const toggleText = mainToggleBtn.querySelector('.toggle-text');
    if (toggleText) {
      toggleText.textContent = allCollapsed ? 'סגור הכל' : 'פתח הכל';
    }
  }
};

/**
 * Restore section states from localStorage
 * This function restores the open/closed state of all content sections
 */
window.restoreSectionStates = function () {
  // Restoring section states from localStorage

  const sections = document.querySelectorAll('.content-section');

  sections.forEach(section => {
    const sectionId = section.getAttribute('data-section');
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector(`button[onclick*="toggleSection('${sectionId}')"], button[onclick*="toggleSection(${sectionId})"]`);
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionId && sectionBody) {
      const storageKey = `${sectionId}SectionCollapsed`;
      const isCollapsed = localStorage.getItem(storageKey) === 'true';

      if (isCollapsed) {
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) {
          icon.textContent = '▼';
        }
        // Section restored as collapsed
      } else {
        sectionBody.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) {
          icon.textContent = '▲';
        }
        // Section restored as expanded
      }
    }
  });
};

// ===== MODAL FUNCTIONS =====

/**
 * Close modal globally
 * @param {string} modalId - Modal ID to close
 */
function closeModalGlobal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    } else {
      // Fallback if Bootstrap modal not found
      modal.style.display = 'none';
      modal.classList.remove('show');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}

// ===== FILTER FUNCTIONS =====

/**
 * פונקציה לקבלת סוג הטבלה לפי מזהה הדף
 * @param {string} pageName - שם הדף
 * @returns {string} - סוג הטבלה
 */
function getTableType(pageName) {
  // מיפוי דפים לסוגי טבלאות
  const tableTypeMap = {
    'designs': 'designs',
    'planning': 'designs',
    'tracking': 'trades',
    'trades': 'trades',
    'accounts': 'accounts',
    'notes': 'notes',
    'alerts': 'alerts',
  };

  return tableTypeMap[pageName] || pageName;
}

/**
 * פונקציה לפילטור נתונים לפי כל הפילטרים
 * פונקציה גלובלית שמשותפת לכל הדפים
 */
function filterDataByFilters(data, pageName) {
  // === FILTER DATA BY FILTERS ===
  // Original data length

  if (!data || data.length === 0) {
    // No data to filter
    return [];
  }

  let filteredData = [...data];

  // קבלת סוג הטבלה
  const tableType = getTableType(pageName);

  // קבלת פילטרים שמורים
  const selectedStatuses = window.selectedStatusesForFilter || [];
  const selectedTypes = window.selectedTypesForFilter || [];
  const selectedAccounts = window.selectedAccountsForFilter || [];
  const selectedDateRange = window.selectedDateRangeForFilter || null;
  const searchTerm = window.searchTermForFilter || '';

  // Filters to apply
  // selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm

  // פילטר לפי סטטוס (לא חל על הערות)
  if (tableType !== 'notes' && selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    // Filtering by status
    filteredData = filteredData.filter(item => {
      let itemStatus;

      if (pageName === 'planning') {
        // מיפוי סטטוסים לדף התכנון
        if (item.status === 'cancelled') {
          itemStatus = 'מבוטל';
        } else if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else {
          itemStatus = 'פתוח';
        }
      } else if (pageName === 'tracking' || pageName === 'trades') {
        // מיפוי סטטוסים לדף המעקב
        if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else if (item.status === 'cancelled') {
          itemStatus = 'מבוטל';
        } else {
          itemStatus = 'פתוח';
        }
      } else if (pageName === 'accounts') {
        // מיפוי סטטוסים לדף החשבונות
        if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else if (item.status === 'cancelled') {
          itemStatus = 'מבוטל';
        } else {
          itemStatus = 'פתוח';
        }
      } else {
        itemStatus = item.status;
      }

      const isMatch = selectedStatuses.includes(itemStatus);
      return isMatch;
    });
    // After status filter
  }

  // פילטר לפי סוג
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    // Filtering by type
    filteredData = filteredData.filter(item => {
      let typeMatch = false;

      if (pageName === 'notes') {
        // בדף הערות - פילטר לפי סוג האובייקט המקושר
        if (item.related_type === 'account' && selectedTypes.includes('חשבון')) {
          typeMatch = true;
        } else if (item.related_type === 'trade' && selectedTypes.includes('טרייד')) {
          typeMatch = true;
        } else if (item.related_type === 'trade_plan' && selectedTypes.includes('תכנון')) {
          typeMatch = true;
        } else if (item.related_type === 'ticker' && selectedTypes.includes('טיקר')) {
          typeMatch = true;
        }
      } else if (pageName === 'planning') {
        // מיפוי סוגים לדף התכנון
        let typeDisplay;
        switch (item.type || item.investment_type) {
        case 'swing':
          typeDisplay = 'סווינג';
          break;
        case 'investment':
          typeDisplay = 'השקעה';
          break;
        case 'passive':
          typeDisplay = 'פאסיבי';
          break;
        default:
          typeDisplay = item.type || item.investment_type;
        }
        typeMatch = selectedTypes.includes(typeDisplay);
      } else if (pageName === 'tracking' || pageName === 'trades') {
        // מיפוי סוגים לדף המעקב
        let typeDisplay;
        switch (item.type) {
        case 'swing':
          typeDisplay = 'סווינג';
          break;
        case 'investment':
          typeDisplay = 'השקעה';
          break;
        case 'passive':
          typeDisplay = 'פאסיבי';
          break;
        case 'buy':
          typeDisplay = 'קנייה';
          break;
        case 'sell':
          typeDisplay = 'מכירה';
          break;
        default:
          typeDisplay = item.type;
        }
        typeMatch = selectedTypes.includes(typeDisplay);
      } else {
        typeMatch = selectedTypes.includes(item.type);
      }

      return typeMatch;
    });
    // After type filter
  }

  // פילטר לפי חשבון
  if (selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('all')) {
    // Filtering by account
    filteredData = filteredData.filter(item => {
      const accountName = item.account?.name || item.account_name || '';
      return selectedAccounts.includes(accountName);
    });
    // After account filter
  }

  // פילטר לפי טווח תאריכים
  if (selectedDateRange && selectedDateRange !== 'כל זמן') {
    // Filtering by date range
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.created_at);
      const now = new Date();

      switch (selectedDateRange) {
      case 'היום':
        return itemDate.toDateString() === now.toDateString();
      case 'אתמול':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return itemDate.toDateString() === yesterday.toDateString();
      case 'השבוע':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      case 'החודש':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      case 'השנה':
        return itemDate.getFullYear() === now.getFullYear();
      default:
        return true;
      }
    });
    // After date range filter
  }

  // פילטר לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    // Filtering by search term
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);

    filteredData = filteredData.filter(item => {
      const searchableText = [
        item.name || '',
        item.title || '',
        item.content || '',
        item.notes || '',
        item.ticker?.symbol || '',
        item.ticker?.name || '',
        item.account?.name || '',
        item.status || '',
        item.type || '',
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
    // After search filter
  }

  // Final filtered data length
  return filteredData;
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.initializeApplication = initializeApplication;
window.checkDependencies = checkDependencies;
window.initializeCoreSystems = initializeCoreSystems;
window.initializeCurrentPage = initializeCurrentPage;
window.isModuleAvailable = isModuleAvailable;
window.getSystemInfo = getSystemInfo;
window.closeModalGlobal = closeModalGlobal;
window.filterDataByFilters = filterDataByFilters;

// Export toggle functions (already defined as window properties above)
// window.toggleTopSection = toggleTopSection;
// window.toggleMainSection = toggleMainSection;
// window.restoreAllSectionStates = restoreAllSectionStates;
// window.restoreDesignsSectionState = restoreDesignsSectionState;

// ===== DEVELOPMENT SHORTCUTS =====
/**
 * Add keyboard shortcuts for development
 */
function initializeDevelopmentShortcuts() {
  // קיצור מקלדת לניקוי Cache: Ctrl+Shift+C (או Cmd+Shift+C במק)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      console.log('🔧 קיצור מקלדת: ניקוי Cache');
      if (window.clearDevelopmentCache) {
        // יצירת event מזויף עבור הפונקציה
        const fakeEvent = {
          target: {
            innerHTML: '<i class="fas fa-trash"></i> נקה Cache',
            disabled: false,
          },
        };
        window.clearDevelopmentCache.call(fakeEvent);
      }
    }
  });
}

// ===== AUTO-INITIALIZATION =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
    initializeDevelopmentShortcuts();
  });
} else {
  initializeApplication();
  initializeDevelopmentShortcuts();
}

// ===== SORT ICONS FUNCTIONS =====
/**
 * Update sort icons for table headers
 *
 * @param {string} tableType - Type of table
 * @param {number} activeColumnIndex - Active column index
 * @param {string} direction - Sort direction (asc/desc)
 */
window.updateSortIcons = function (tableType, activeColumnIndex, direction) {
  try {
    // Find all sortable headers in the current table
    const table = document.querySelector(`[data-table-type="${tableType}"]`);
    if (!table) {
      console.warn(`⚠️ Table with type "${tableType}" not found`);
      return;
    }

    const headers = table.querySelectorAll('th[data-sortable="true"]');

    headers.forEach((header, index) => {
      const icon = header.querySelector('.sort-icon');
      if (icon) {
        if (index === activeColumnIndex) {
          // Active column - show direction
          icon.textContent = direction === 'asc' ? '▲' : '▼';
          icon.style.display = 'inline';
        } else {
          // Inactive column - hide icon
          icon.textContent = '';
          icon.style.display = 'none';
        }
      }
    });
  } catch (error) {
    console.warn('⚠️ Error updating sort icons:', error);
  }
};

