/**
 * Trading Accounts Header Handlers - Event handlers for header filters
 * --------------------------------------------------------------------
 * מטפל בכל ה-event handlers של הפילטרים ב-header
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

(function initHeaderHandlers() {
  'use strict';
  
  /**
   * Initialize Filter Close Buttons
   */
  function initFilterCloseButtons() {
    const closeButtons = document.querySelectorAll('.js-filter-close');
    
    closeButtons.forEach(button => {
      button.addEventListener('click', function(e) {
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
          if (window.headerSystem && window.headerSystem.filterManager && menuId) {
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
      clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Trigger filter update if TradingAccountsFiltersIntegration is available
        if (window.TradingAccountsFiltersIntegration && window.TradingAccountsDataLoader) {
          const filters = window.TradingAccountsFiltersIntegration.getGlobalFilters();
          window.TradingAccountsDataLoader.loadContainer1(filters);
        }
      });
    }
  }
  
  /**
   * Initialize Filter Reset Button
   */
  function initFilterResetButton() {
    const resetButton = document.querySelector('.js-filter-reset');
    
    if (resetButton) {
      resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Reset all filter values
        const statusFilter = document.getElementById('selectedStatus');
        const typeFilter = document.getElementById('selectedType');
        const accountFilter = document.getElementById('selectedAccount');
        const dateFilter = document.getElementById('selectedDateRange');
        const searchInput = document.getElementById('searchFilterInput');
        
        if (statusFilter) statusFilter.textContent = 'כל סטטוס';
        if (typeFilter) typeFilter.textContent = 'כל סוג השקעה';
        if (accountFilter) accountFilter.textContent = 'כל חשבון מסחר';
        if (dateFilter) dateFilter.textContent = 'כל זמן';
        if (searchInput) searchInput.value = '';
        
        // Reload data with empty filters
        if (window.TradingAccountsDataLoader) {
          window.TradingAccountsDataLoader.loadContainer1({});
        }
      });
    }
  }
  
  /**
   * Initialize Filter Clear Button
   */
  function initFilterClearButton() {
    const clearButton = document.querySelector('.js-filter-clear');
    
    if (clearButton) {
      clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear all filter values (same as reset)
        initFilterResetButton();
        
        // Also clear internal filters
        const movementsDateFrom = document.getElementById('movementsDateFrom');
        const movementsDateTo = document.getElementById('movementsDateTo');
        const accountByDatesSelect = document.getElementById('accountByDatesSelect');
        const accountByDatesDateFrom = document.getElementById('accountByDatesDateFrom');
        const accountByDatesDateTo = document.getElementById('accountByDatesDateTo');
        const positionsAccountSelect = document.getElementById('positionsAccountSelect');
        
        if (movementsDateFrom) movementsDateFrom.value = '';
        if (movementsDateTo) movementsDateTo.value = '';
        if (accountByDatesSelect) accountByDatesSelect.value = '';
        if (accountByDatesDateFrom) accountByDatesDateFrom.value = '';
        if (accountByDatesDateTo) accountByDatesDateTo.value = '';
        if (positionsAccountSelect) positionsAccountSelect.value = '';
        
        // Reload all containers
        if (window.TradingAccountsDataLoader) {
          window.TradingAccountsDataLoader.loadAllContainers();
        }
      });
    }
  }
  
  /**
   * Initialize Lucide Icons
   */
  function initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
  
  /**
   * Initialize all handlers
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initFilterCloseButtons();
        initSearchClearButton();
        initFilterResetButton();
        initFilterClearButton();
        initLucideIcons();
      });
    } else {
      initFilterCloseButtons();
      initSearchClearButton();
      initFilterResetButton();
      initFilterClearButton();
      initLucideIcons();
    }
  }
  
  // Auto-initialize
  init();
})();
