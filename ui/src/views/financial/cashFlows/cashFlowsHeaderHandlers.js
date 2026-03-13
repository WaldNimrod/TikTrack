/**
 * Cash Flows Header Handlers - Event handlers for header filters
 * --------------------------------------------------------------------
 * מטפל בכל ה-event handlers של הפילטרים ב-header
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

(function initHeaderHandlers() {
  'use strict';

  // Store filters in global scope for access by global functions
  window.cashFlowsCurrentFilters = {
    tradingAccount: null,
    dateRange: null,
    search: null,
  };

  // Local reference for internal use
  const currentFilters = window.cashFlowsCurrentFilters;

  /**
   * Initialize Filter Close Buttons
   */
  function initFilterCloseButtons() {
    const closeButtons = document.querySelectorAll('.js-filter-close');

    closeButtons.forEach((button) => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Get filter menu ID from data attribute or find parent
        const filterMenuId = button.getAttribute('data-filter-menu');
        const filterMenu = filterMenuId
          ? document.getElementById(filterMenuId)
          : button.closest('.filter-menu');

        if (filterMenu) {
          const menuId = filterMenu.id || filterMenuId;
          // Use headerSystem if available, otherwise just hide the menu
          if (
            window.headerSystem &&
            window.headerSystem.filterManager &&
            menuId
          ) {
            window.headerSystem.filterManager.closeFilter(menuId);
          } else {
            filterMenu.style.display = 'none';
          }
        }
      });
    });
  }

  /**
   * Initialize Search Clear Button
   */
  function initSearchClearButton() {
    const clearButton = document.querySelector('.js-search-clear');
    const searchInput = document.getElementById('searchFilterInput');

    if (clearButton && searchInput) {
      clearButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.value = '';
        currentFilters.search = null;
        applyFilters();
      });
    }
  }

  /**
   * Initialize Search Input
   */
  function initSearchInput() {
    const searchInput = document.getElementById('searchFilterInput');

    if (searchInput) {
      let searchTimeout;

      searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
          const value = e.target.value.trim();
          currentFilters.search = value || null;
          applyFilters();
        }, 300); // Debounce 300ms
      });
    }
  }

  /**
   * Initialize Filter Reset Button
   */
  function initFilterResetButton() {
    const resetButton = document.querySelector('.js-filter-reset');

    if (resetButton) {
      resetButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        resetFilters();
      });
    }
  }

  /**
   * Initialize Filter Clear Button
   */
  function initFilterClearButton() {
    const clearButton = document.querySelector('.js-filter-clear');

    if (clearButton) {
      clearButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearFilters();
      });
    }
  }

  /**
   * Initialize Filter Items (Trading Account, Date Range)
   */
  function initFilterItems() {
    // Listen to filter changes from PhoenixFilterBridge
    if (window.PhoenixBridge) {
      window.PhoenixBridge.addEventListener(
        'phoenix-filter-change',
        function (e) {
          const { filterType, value } = e.detail;

          if (filterType === 'tradingAccount') {
            currentFilters.tradingAccount = value || null;
          } else if (filterType === 'dateRange') {
            currentFilters.dateRange = value || null;
          }

          applyFilters();
        },
      );
    }
  }

  /**
   * Apply filters
   */
  function applyFilters() {
    // Update filter display
    updateFilterDisplay();

    // Notify table to update
    if (window.updateCashFlowsFilters) {
      window.updateCashFlowsFilters(currentFilters);
    }
  }

  /**
   * Reset filters
   */
  function resetFilters() {
    window.cashFlowsCurrentFilters = {
      tradingAccount: null,
      dateRange: null,
      search: null,
    };
    // Update local reference
    Object.assign(currentFilters, window.cashFlowsCurrentFilters);

    // Clear search input
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // Reset filter displays
    updateFilterDisplay();

    // Apply filters
    applyFilters();
  }

  /**
   * Clear filters
   */
  function clearFilters() {
    resetFilters();
  }

  /**
   * Update filter display
   */
  function updateFilterDisplay() {
    // Update trading account filter display
    const accountFilterToggle = document.getElementById('accountFilterToggle');
    const selectedAccountText = document.getElementById('selectedAccount');
    if (accountFilterToggle && selectedAccountText) {
      selectedAccountText.textContent =
        currentFilters.tradingAccount || 'כל חשבון מסחר';
    }

    // Update date range filter display
    const dateRangeFilterToggle = document.getElementById(
      'dateRangeFilterToggle',
    );
    const selectedDateText = document.getElementById('selectedDateRange');
    if (dateRangeFilterToggle && selectedDateText) {
      selectedDateText.textContent = currentFilters.dateRange || 'כל זמן';
    }
  }

  /**
   * Initialize all handlers
   */
  function initializeHandlers() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        initFilterCloseButtons();
        initSearchClearButton();
        initSearchInput();
        initFilterResetButton();
        initFilterClearButton();
        initFilterItems();
      });
    } else {
      initFilterCloseButtons();
      initSearchClearButton();
      initSearchInput();
      initFilterResetButton();
      initFilterClearButton();
      initFilterItems();
    }
  }

  // Auto-initialize
  initializeHandlers();
})();

// Global functions for onclick handlers (if needed for legacy support)
window.clearSearchFilter = function () {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
    if (window.updateCashFlowsFilters) {
      // Use global filters object, fallback to empty object if not initialized
      const filters = window.cashFlowsCurrentFilters || {};
      window.updateCashFlowsFilters({ ...filters, search: null });
    }
  }
};

window.resetAllFilters = function () {
  if (window.updateCashFlowsFilters) {
    window.updateCashFlowsFilters({
      tradingAccount: null,
      dateRange: null,
      search: null,
    });
  }
};

window.clearAllFilters = function () {
  window.resetAllFilters();
};
