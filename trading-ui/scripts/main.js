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
 * - Filter setup and management
 * - Navigation utilities
 * 
 * DEPENDENCIES:
 * ============
 * - All modular files must be loaded before main.js
 * - Functions are exported to global scope (window object)
 * - Backward compatibility maintained for existing function calls
 * 
 * HTML SCRIPT LOADING ORDER:
 * =========================
 * 1. header-system.js
 * 2. console-cleanup.js
 * 3. simple-filter.js
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
    console.error('❌ Application Initialization Failed:', error);
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
    'headerSystem',
    'simpleFilter',
    'translationUtils',
    'dataUtils',
    'uiUtils',
    'tableMappings',
    'dateUtils',
    'tables',
    'linkedItems',
    'pageUtils'
  ];

  const missingModules = requiredModules.filter(module => !window[module]);

  if (missingModules.length > 0) {
    console.warn('⚠️ Missing modules:', missingModules);
    return false;
  }

  return true;
}

/**
 * Initialize core application systems
 * Sets up global event handlers and system-wide functionality
 */
function initializeCoreSystems() {
  // Initialize header system
  if (window.headerSystem && typeof window.headerSystem.init === 'function') {
    window.headerSystem.init();
  }

  // Initialize filter system
  if (window.simpleFilter && typeof window.simpleFilter.init === 'function') {
    window.simpleFilter.init();
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
  console.log('🔄 Setting up global modal configurations...');
  
  // Find all modals and configure them
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modalElement => {
    const modalId = modalElement.id;
    const existingBackdrop = modalElement.getAttribute('data-bs-backdrop');
    const existingKeyboard = modalElement.getAttribute('data-bs-keyboard');
    
    // If modal already has specific backdrop settings, respect them
    if (existingBackdrop && existingKeyboard) {
      console.log(`✅ Modal ${modalId || 'unnamed'} already configured: backdrop=${existingBackdrop}, keyboard=${existingKeyboard}`);
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
      (modalId.includes('linkedItems') && !modalId.includes('details'))
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
      
      console.log(`✅ Modal ${modalId} configured with static backdrop (confirmation/warning modal)`);
    } else {
      console.log(`✅ Modal ${modalId || 'unnamed'} configured with clickable backdrop`);
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
      simpleFilter: !!window.simpleFilter,
      translationUtils: !!window.translationUtils,
      dataUtils: !!window.dataUtils,
      uiUtils: !!window.uiUtils,
      tableMappings: !!window.tableMappings,
      dateUtils: !!window.dateUtils,
      tables: !!window.tables,
      linkedItems: !!window.linkedItems,
      pageUtils: !!window.pageUtils
    }
  };
}

// ===== ERROR HANDLING =====
/**
 * Handle global JavaScript errors
 * 
 * @param {ErrorEvent} event - Error event object
 */
function handleGlobalError(event) {
  console.error('🌐 Global Error:', event.error);
  showSystemError(`System error: ${event.error.message}`);
}

/**
 * Handle unhandled promise rejections
 * 
 * @param {PromiseRejectionEvent} event - Rejection event object
 */
function handleUnhandledRejection(event) {
  console.error('🚫 Unhandled Promise Rejection:', event.reason);
  showSystemError(`Promise error: ${event.reason}`);
}

/**
 * Show system error notification
 * 
 * @param {string} message - Error message to display
 */
function showSystemError(message) {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, 'error');
  } else {
    alert(`System Error: ${message}`);
  }
}

// ===== SECTION STATE MANAGEMENT =====
/**
 * Restore all section states from localStorage
 * This function restores the open/closed state of all collapsible sections
 */
function restoreAllSectionStates() {
  // Restoring all section states from localStorage

  try {
    // Get all section toggles
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


  } catch (error) {
    console.error('❌ Error restoring section states:', error);
  }
}

// ===== GLOBAL TOGGLE FUNCTIONS =====
/**
 * Global toggle function for top sections
 * Handles opening/closing of top sections across all pages
 */
window.toggleTopSection = function () {
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
    } else if (currentPath.includes('/tests')) {
      storageKey = 'testsTopSectionCollapsed';
    } else if (currentPath.includes('/db_display')) {
      storageKey = 'dbDisplayTopSectionCollapsed';
    } else if (currentPath.includes('/db_extradata')) {
      storageKey = 'dbExtradataTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    // Save state to localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

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
    } else if (currentPath.includes('/tests')) {
      storageKey = 'testsMainSectionCollapsed';
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
  } else if (currentPath.includes('/tests')) {
    topSectionKey = 'testsTopSectionCollapsed';
  } else if (currentPath.includes('/db_display')) {
    topSectionKey = 'dbDisplayTopSectionCollapsed';
  } else if (currentPath.includes('/db_extradata')) {
    topSectionKey = 'dbExtradataTopSectionCollapsed';
  }

  const topSectionCollapsed = localStorage.getItem(topSectionKey) === 'true';
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

  if (topSection && topToggleBtn && topIcon) {
    if (topSectionCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
    }
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
  } else if (currentPath.includes('/tests')) {
    mainSectionKey = 'testsMainSectionCollapsed';
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

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.initializeApplication = initializeApplication;
window.checkDependencies = checkDependencies;
window.initializeCoreSystems = initializeCoreSystems;
window.initializeCurrentPage = initializeCurrentPage;
window.isModuleAvailable = isModuleAvailable;
window.getSystemInfo = getSystemInfo;

// Export toggle functions (already defined as window properties above)
// window.toggleTopSection = toggleTopSection;
// window.toggleMainSection = toggleMainSection;
// window.restoreAllSectionStates = restoreAllSectionStates;
// window.restoreDesignsSectionState = restoreDesignsSectionState;

// ===== AUTO-INITIALIZATION =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}


