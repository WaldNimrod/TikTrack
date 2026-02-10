/**
 * Phoenix-Filter-Actions-Ver: v2.0.0 | Filter Actions JavaScript
 * Sync-Time: 2026-02-02 00:00:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ EXTERNAL JS - Clean Slate Rule Compliant
 * 
 * Purpose:
 * Handles filter actions functionality (reset, clear, search clear).
 * All JavaScript is external - NO inline scripts in HTML.
 * 
 * Usage:
 * Add <script src="./filter-actions.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initFilterActions() {
  'use strict';
  
  function clearSearchFilter() {
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
      // Trigger input event for any listeners
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  
  function resetAllFilters() {
    // Reset all filter dropdowns to "הכול"
    const filterItems = document.querySelectorAll('.status-filter-item[data-value="הכול"], .type-filter-item[data-value="הכול"], .account-filter-item[data-value="הכול"], .date-range-filter-item[data-value="כל זמן"]');
    filterItems.forEach(item => {
      item.click();
    });
    
    // Clear search
    clearSearchFilter();
  }
  
  function clearAllFilters() {
    // Clear all filter selections
    const selectedValues = document.querySelectorAll('.selected-value');
    selectedValues.forEach(el => {
      if (el.id === 'selectedStatus') el.textContent = 'כל סטטוס';
      if (el.id === 'selectedType') el.textContent = 'כל סוג השקעה';
      if (el.id === 'selectedAccount') el.textContent = 'כל חשבון מסחר';
      if (el.id === 'selectedDateRange') el.textContent = 'כל זמן';
    });
    
    // Clear search
    clearSearchFilter();
    
    // Close all filter menus
    const filterMenus = document.querySelectorAll('.filter-menu');
    filterMenus.forEach(menu => {
      menu.style.display = 'none';
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
    });
  }
  
  function closeFilterMenu(menuId) {
    // Close specific filter menu
    if (window.headerSystem?.filterManager?.closeFilter) {
      window.headerSystem.filterManager.closeFilter(menuId);
    } else {
      // Fallback: close menu manually
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.style.display = 'none';
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
      }
    }
  }
  
  function initFilterButtons() {
    // Filter close buttons
    const filterCloseBtns = document.querySelectorAll('.filter-close-btn.js-filter-close');
    filterCloseBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const menuId = btn.getAttribute('data-filter-menu');
        if (menuId) {
          closeFilterMenu(menuId);
        }
      });
    });
    
    // Search clear button
    const searchClearBtn = document.querySelector('.search-clear-btn.js-search-clear');
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        clearSearchFilter();
      });
    }
    
    // Reset button
    const resetBtn = document.querySelector('.reset-btn.js-filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetAllFilters();
      });
    }
    
    // Clear button
    const clearBtn = document.querySelector('.clear-btn.js-filter-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        clearAllFilters();
      });
    }
  }
  
  // Export functions for global access (if needed)
  window.clearSearchFilter = clearSearchFilter;
  window.resetAllFilters = resetAllFilters;
  window.clearAllFilters = clearAllFilters;
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilterButtons);
  } else {
    // DOM already loaded
    initFilterButtons();
  }
})();
