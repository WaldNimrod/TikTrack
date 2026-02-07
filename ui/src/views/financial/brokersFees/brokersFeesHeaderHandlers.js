/**
 * Brokers Fees Header Handlers - Event handlers for header filters
 * --------------------------------------------------------------------
 * מטפל בכל ה-event handlers של הפילטרים ב-header
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

(function initHeaderHandlers() {
  'use strict';
  
  let currentFilters = {
    broker: null,
    commissionType: null,
    search: null
  };
  
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
      
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
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
      resetButton.addEventListener('click', function(e) {
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
      clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        clearFilters();
      });
    }
  }
  
  /**
   * Initialize Filter Items (Broker, Commission Type)
   */
  function initFilterItems() {
    // Listen to filter changes from PhoenixFilterBridge
    if (window.PhoenixBridge) {
      window.PhoenixBridge.addEventListener('phoenix-filter-change', function(e) {
        const { filterType, value } = e.detail;
        
        if (filterType === 'broker') {
          currentFilters.broker = value || null;
        } else if (filterType === 'commissionType') {
          currentFilters.commissionType = value || null;
        }
        
        applyFilters();
      });
    }
  }
  
  /**
   * Apply filters
   */
  function applyFilters() {
    // Update filter display
    updateFilterDisplay();
    
    // Notify table to update
    if (window.updateBrokersFeesFilters) {
      window.updateBrokersFeesFilters(currentFilters);
    }
  }
  
  /**
   * Reset filters
   */
  function resetFilters() {
    currentFilters = {
      broker: null,
      commissionType: null,
      search: null
    };
    
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
    // Update broker filter display
    const brokerFilterToggle = document.getElementById('brokerFilterToggle');
    const selectedBrokerText = document.getElementById('selectedBrokerText');
    if (brokerFilterToggle && selectedBrokerText) {
      selectedBrokerText.textContent = currentFilters.broker || 'כל ברוקר';
    }
    
    // Update commission type filter display
    const commissionTypeFilterToggle = document.getElementById('commissionTypeFilterToggle');
    const selectedCommissionTypeText = document.getElementById('selectedCommissionTypeText');
    if (commissionTypeFilterToggle && selectedCommissionTypeText) {
      selectedCommissionTypeText.textContent = currentFilters.commissionType || 'כל סוג עמלה';
    }
  }
  
  /**
   * Initialize all handlers
   */
  function initializeHandlers() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
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
window.clearSearchFilter = function() {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
    if (window.updateBrokersFeesFilters) {
      window.updateBrokersFeesFilters({ ...currentFilters, search: null });
    }
  }
};

window.resetAllFilters = function() {
  if (window.updateBrokersFeesFilters) {
    window.updateBrokersFeesFilters({
      broker: null,
      commissionType: null,
      search: null
    });
  }
};

window.clearAllFilters = function() {
  window.resetAllFilters();
};
