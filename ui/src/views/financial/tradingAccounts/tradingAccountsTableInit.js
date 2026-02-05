/**
 * Trading Accounts Table Initialization - Initialize table managers
 * -----------------------------------------------------------------
 * אתחול Table Managers עבור כל הטבלאות ב-Trading Accounts View
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

(function initTradingAccountsTables() {
  'use strict';
  
  /**
   * Initialize all table managers
   */
  function initializeTableManagers() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initTables();
      });
    } else {
      initTables();
    }
  }
  
  /**
   * Initialize individual tables
   */
  function initTables() {
    // Initialize Sort and Filter Managers for each table
    const accountsTable = document.querySelector('#accountsTable');
    if (accountsTable && window.PhoenixTableSortManager && window.PhoenixTableFilterManager) {
      const accountsSortManager = new window.PhoenixTableSortManager(accountsTable);
      const accountsFilterManager = new window.PhoenixTableFilterManager(accountsTable);
    }
    
    const accountActivityTable = document.querySelector('#accountActivityTable');
    if (accountActivityTable && window.PhoenixTableSortManager && window.PhoenixTableFilterManager) {
      const activitySortManager = new window.PhoenixTableSortManager(accountActivityTable);
      const activityFilterManager = new window.PhoenixTableFilterManager(accountActivityTable);
    }
    
    const positionsTable = document.querySelector('#positionsTable');
    if (positionsTable && window.PhoenixTableSortManager && window.PhoenixTableFilterManager) {
      const positionsSortManager = new window.PhoenixTableSortManager(positionsTable);
      const positionsFilterManager = new window.PhoenixTableFilterManager(positionsTable);
    }
  }
  
  // Auto-initialize
  initializeTableManagers();
})();
