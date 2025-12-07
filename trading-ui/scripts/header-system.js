/**
 * Header System - TikTrack Frontend - v7.0.0 - Complete Rewrite
 * ==================================
 * 
 * Complete rewrite of header system with clean architecture
 * Reduced from 5265 lines to ~1500 lines
 * 
 * Features:
 * - Navigation menu with dropdowns
 * - Unified filter system (status, type, account, date)
 * - Simple hover behavior
 * - Event delegation
 * - Clean state management
 * 
 * Architecture:
 * - HeaderSystem: Main class for header creation and initialization
 * - FilterManager: Manages filter state and application
 * - MenuManager: Manages navigation menu behavior
 * 
 * @author TikTrack Development Team
 * @version 7.0.0
 * @lastUpdated November 23, 2025
 */

if (window.Logger) {
  window.Logger.info('🚀 Loading Header System v7.0.0...', { page: 'header-system' });
}

// ===== FilterManager Class =====
// Prevent duplicate declaration
if (typeof window.FilterManager === 'undefined') {
window.FilterManager = class FilterManager {
  constructor() {
    this.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: [],
      custom: {},
    };
    this.openFilterId = null;
    this.hoverTimeouts = new Map();
  }

  async init() {
    await this.loadFilters();
    this.setupHoverBehavior();
    // Load accounts after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.loadAccountsForFilter();
    }, 500);
  }

  async loadFilters() {
    if (window.PageStateManager && window.PageStateManager.initialized) {
      const pageName = typeof window.getCurrentPageName === 'function' 
        ? window.getCurrentPageName() 
        : 'default';
      try {
        // אתחול PageStateManager אם לא מאותחל
        if (!window.PageStateManager.initialized) {
          await window.PageStateManager.initialize();
        }
        
        const savedFilters = await window.PageStateManager.loadFilters(pageName);
        if (savedFilters) {
          this.currentFilters = { ...this.currentFilters, ...savedFilters };
          this.updateUI();
          return;
        }
      } catch (err) {
        window.Logger?.warn?.('⚠️ Failed to load filters via PageStateManager', err, { page: 'header-system' });
        // Fallback ל-localStorage רק אם PageStateManager לא זמין בכלל
        if (!window.PageStateManager) {
          const saved = localStorage.getItem('headerFilters');
          if (saved) {
            try {
              this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
              this.updateUI();
            } catch (e) {
              window.Logger?.warn?.('⚠️ Error loading saved filters from localStorage', e, { page: 'header-system' });
            }
          }
        }
      }
    }
  }

  async saveFilters() {
    if (window.PageStateManager) {
      const pageName = typeof window.getCurrentPageName === 'function' 
        ? window.getCurrentPageName() 
        : 'default';
      try {
        // אתחול PageStateManager אם לא מאותחל
        if (!window.PageStateManager.initialized) {
          await window.PageStateManager.initialize();
        }
        
        await window.PageStateManager.saveFilters(pageName, this.currentFilters);
        return;
      } catch (err) {
        window.Logger?.warn?.('⚠️ Failed to save filters via PageStateManager', err, { page: 'header-system' });
        // Fallback ל-localStorage רק אם PageStateManager לא זמין בכלל
        if (!window.PageStateManager) {
          localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
        }
      }
    } else {
      // Fallback ל-localStorage רק אם PageStateManager לא זמין בכלל
      window.Logger?.warn?.('⚠️ PageStateManager not available, using localStorage fallback', { page: 'header-system' });
      localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
    }
  }

  setupHoverBehavior() {
    const filterButtons = [
      { buttonId: 'statusFilterToggle', menuId: 'statusFilterMenu' },
      { buttonId: 'typeFilterToggle', menuId: 'typeFilterMenu' },
      { buttonId: 'accountFilterToggle', menuId: 'accountFilterMenu' },
      { buttonId: 'dateRangeFilterToggle', menuId: 'dateRangeFilterMenu' },
    ];

    filterButtons.forEach(({ buttonId, menuId }) => {
      const button = document.getElementById(buttonId);
      const menu = document.getElementById(menuId);
      if (!button || !menu) return;

      let openTimeout = null;
      let closeTimeout = null;

      const clearTimeouts = () => {
        if (openTimeout) {
          clearTimeout(openTimeout);
          openTimeout = null;
        }
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      };

      button.addEventListener('mouseenter', () => {
        clearTimeouts();
        openTimeout = setTimeout(() => {
          this.openFilter(menuId);
        }, 150);
      });

      button.addEventListener('mouseleave', () => {
        clearTimeouts();
        closeTimeout = setTimeout(() => {
          if (!button.matches(':hover') && !menu.matches(':hover')) {
            this.closeFilter(menuId);
          }
        }, 220);
      });

      menu.addEventListener('mouseenter', () => {
        clearTimeouts();
      });

      menu.addEventListener('mouseleave', () => {
        clearTimeouts();
        closeTimeout = setTimeout(() => {
          if (!button.matches(':hover') && !menu.matches(':hover')) {
            this.closeFilter(menuId);
          }
        }, 220);
      });
    });
  }

  openFilter(menuId) {
    if (this.openFilterId && this.openFilterId !== menuId) {
      this.closeFilter(this.openFilterId);
    }
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.add('show');
      this.openFilterId = menuId;
    }
  }

  closeFilter(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.remove('show');
      if (this.openFilterId === menuId) {
        this.openFilterId = null;
      }
    }
  }

  selectValue(filterType, value) {
    if (filterType === 'status') {
      this.selectStatusOption(value);
    } else if (filterType === 'type') {
      this.selectTypeOption(value);
    } else if (filterType === 'account') {
      this.selectAccountOption(value);
    } else if (filterType === 'dateRange') {
      this.selectDateRangeOption(value);
    }
  }

  selectStatusOption(status) {
    const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
    const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
    
    if (!clickedItem) return;

    if (status === 'הכול') {
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      this.currentFilters.status = [];
    } else {
      const allItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) allItem.classList.remove('selected');
      clickedItem.classList.toggle('selected');
      
      const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
        this.currentFilters.status = [];
      } else {
        this.currentFilters.status = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
      }
    }

    this.updateStatusFilterText();
    this.saveFilters();
    this.applyFilters();
    // Don't close filter menu for multiselect - only close on mouse leave
  }

  selectTypeOption(type) {
    const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
    const clickedItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === type);
    
    if (!clickedItem) return;

    if (type === 'הכול') {
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      this.currentFilters.type = [];
    } else {
      const allItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) allItem.classList.remove('selected');
      clickedItem.classList.toggle('selected');
      
      const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
        this.currentFilters.type = [];
      } else {
        this.currentFilters.type = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
      }
    }

    this.updateTypeFilterText();
    this.saveFilters();
    this.applyFilters();
    // Don't close filter menu for multiselect - only close on mouse leave
  }

  selectAccountOption(accountId) {
    const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
    const clickedItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === accountId);
    
    if (!clickedItem) return;

    if (accountId === 'הכול') {
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      this.currentFilters.account = [];
    } else {
      const allItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) allItem.classList.remove('selected');
      clickedItem.classList.toggle('selected');
      
      const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
        this.currentFilters.account = [];
      } else {
        this.currentFilters.account = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
      }
    }

    this.updateAccountFilterText();
    this.saveFilters();
    this.applyFilters();
    // Don't close filter menu for multiselect - only close on mouse leave
  }

  selectDateRangeOption(dateRange) {
    const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateItems.forEach(item => item.classList.remove('selected'));
    
    const clickedItem = Array.from(dateItems).find(item => item.getAttribute('data-value') === dateRange);
    if (clickedItem) {
      clickedItem.classList.add('selected');
      this.currentFilters.dateRange = dateRange;
    }

    this.updateDateRangeFilterText();
    this.saveFilters();
    this.applyFilters();
    this.closeFilter('dateRangeFilterMenu');
  }

  updateStatusFilterText() {
    const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
    const statusElement = document.getElementById('selectedStatus');
    
    if (statusElement) {
      if (selectedItems.length === 0) {
        statusElement.textContent = 'כל סטטוס';
      } else if (selectedItems.length === 1) {
        statusElement.textContent = selectedItems[0].getAttribute('data-value');
      } else {
        statusElement.textContent = `${selectedItems.length} סטטוסים`;
      }
    }
  }

  updateTypeFilterText() {
    const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
    const typeElement = document.getElementById('selectedType');
    
    if (typeElement) {
      if (selectedItems.length === 0) {
        typeElement.textContent = 'כל סוג השקעה';
      } else if (selectedItems.length === 1) {
        typeElement.textContent = selectedItems[0].getAttribute('data-value');
      } else {
        typeElement.textContent = `${selectedItems.length} סוגים`;
      }
    }
  }

  updateAccountFilterText() {
    const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
    const accountElement = document.getElementById('selectedAccount');
    
    if (accountElement) {
      if (selectedItems.length === 0) {
        accountElement.textContent = 'כל חשבון מסחר';
      } else if (selectedItems.length === 1) {
        accountElement.textContent = selectedItems[0].getAttribute('data-value');
      } else {
        accountElement.textContent = `${selectedItems.length} חשבונות`;
      }
    }
  }

  updateDateRangeFilterText() {
    const selectedItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateElement = document.getElementById('selectedDateRange');
    
    if (dateElement) {
      if (selectedItems.length === 0) {
        dateElement.textContent = 'כל זמן';
      } else {
        dateElement.textContent = selectedItems[0].getAttribute('data-value');
      }
    }
  }

  updateUI() {
    // Update status filter
    const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
    statusItems.forEach(item => {
      item.classList.remove('selected');
      const value = item.getAttribute('data-value');
      if (this.currentFilters.status.length === 0 && value === 'הכול') {
        item.classList.add('selected');
      } else if (this.currentFilters.status.includes(value)) {
        item.classList.add('selected');
      }
    });
    this.updateStatusFilterText();

    // Update type filter
    const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
    typeItems.forEach(item => {
      item.classList.remove('selected');
      const value = item.getAttribute('data-value');
      if (this.currentFilters.type.length === 0 && value === 'הכול') {
        item.classList.add('selected');
      } else if (this.currentFilters.type.includes(value)) {
        item.classList.add('selected');
      }
    });
    this.updateTypeFilterText();

    // Update account filter
    const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
    accountItems.forEach(item => {
      item.classList.remove('selected');
      const value = item.getAttribute('data-value');
      if (this.currentFilters.account.length === 0 && value === 'הכול') {
        item.classList.add('selected');
      } else if (this.currentFilters.account.includes(value)) {
        item.classList.add('selected');
      }
    });
    this.updateAccountFilterText();

    // Update date range filter
    const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateItems.forEach(item => {
      item.classList.remove('selected');
      const value = item.getAttribute('data-value');
      if (this.currentFilters.dateRange === value) {
        item.classList.add('selected');
      }
    });
    this.updateDateRangeFilterText();
  }

  buildFilterContext() {
    const cloneArray = value => (Array.isArray(value) ? [...value] : value ? [value] : []);
    return {
      status: cloneArray(this.currentFilters.status),
      type: cloneArray(this.currentFilters.type),
      account: cloneArray(this.currentFilters.account),
      dateRange: this.currentFilters.dateRange ?? null,
      search: typeof this.currentFilters.search === 'string' ? this.currentFilters.search : '',
      custom: this.currentFilters.custom && typeof this.currentFilters.custom === 'object'
        ? { ...this.currentFilters.custom }
        : {},
    };
  }

  _resolveTargetTables() {
    const targets = [];
    const seen = new Set();

    const tableElements = document.querySelectorAll('table[data-table-type]');
    tableElements.forEach(table => {
      const tableId = table.id || this._inferTableIdFromContainer(table);
      if (!tableId || seen.has(tableId)) return;
      const tableType = table.getAttribute('data-table-type') ||
        window.TableDataRegistry?.resolveTableType?.(tableId) ||
        null;
      if (tableType) {
        targets.push({ tableId, tableType });
        seen.add(tableId);
      }
    });

    if (targets.length === 0) {
      const fallbackContainers = [
        'tradesContainer', 'trade_plansContainer', 'tickersContainer', 'alertsContainer',
        'executionsContainer', 'accountsContainer', 'accountActivityContainer',
        'cashFlowsContainer', 'notesContainer',
      ];

      fallbackContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        const table = container?.querySelector('table');
        if (!table) return;
        const tableId = table.id || containerId.replace('Container', 'Table');
        if (seen.has(tableId)) return;
        const tableType = table.getAttribute('data-table-type') ||
          window.TableDataRegistry?.resolveTableType?.(tableId) ||
          null;
        if (tableType) {
          targets.push({ tableId, tableType });
          seen.add(tableId);
        }
      });
    }

    return targets;
  }

  _inferTableIdFromContainer(table) {
    if (!table) return null;
    const container = table.closest('[id$="Container"]');
    if (!container) return table.id || null;
    return table.id || container.id.replace('Container', 'Table');
  }

  async applyFilters() {
    if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.filter) {
      // Fallback: show all data if UnifiedTableSystem is not available
      window.Logger?.warn?.('⚠️ applyFilters: UnifiedTableSystem not available, showing all data', {
        page: 'header-system',
      });
      return;
    }

    const context = this.buildFilterContext();
    const targets = this._resolveTargetTables();

    // Check for double filters (header filters + page-specific filters)
    const hasPageSpecificFilters = this._detectPageSpecificFilters();
    if (hasPageSpecificFilters && context.hasActiveFilters) {
      this._showDoubleFilterNotification();
    }

    // Apply filters to all tables in parallel
    const filterPromises = targets.map(target => {
      return this.applyFiltersToTable(target.tableId, context, target.tableType).catch(error => {
        window.Logger?.warn?.('⚠️ applyFilters: failed to process table', {
          tableId: target.tableId,
          error: error?.message || error,
          page: 'header-system',
        });
        // Fallback: return empty array to continue processing other tables
        return [];
      });
    });

    await Promise.all(filterPromises);
  }

  _detectPageSpecificFilters() {
    // Check for common page-specific filter patterns
    const pageSpecificFilterSelectors = [
      '.related-object-filters',
      '.entity-type-filters',
      '[data-filter-type="related-object"]',
      '[data-filter-type="entity-type"]',
      '#relatedObjectFilters',
      '#entityTypeFilters',
      '.portfolio-side-filter-btn.active', // Portfolio local filters
      '#portfolioAccountFilter', // Portfolio account filter
    ];

    for (const selector of pageSpecificFilterSelectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        // Check if any filter is active
        const activeFilters = element.querySelectorAll('.selected, .active, [data-selected="true"]');
        if (activeFilters.length > 0) {
          return true;
        }
      }
    }

    return false;
  }

  _showDoubleFilterNotification() {
    if (typeof window.showNotification === 'function') {
      window.showNotification(
        'פילטרים כפולים מופעלים: פילטרים מראש הדף ופילטרים פנימיים. התוצאות מוצגות לפי שני הפילטרים יחד.',
        'info',
        'מידע',
        4000,
        'system'
      );
    } else if (window.Logger) {
      window.Logger.info('ℹ️ Double filters active: header filters + page-specific filters', {
        page: 'header-system',
      });
    }
  }

  async applyFiltersToTable(tableId, filterContext, resolvedTableType) {
    if (!tableId || !window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
      return null;
    }

    const tableElement = document.getElementById(tableId);
    const tableType = resolvedTableType ||
      window.TableDataRegistry?.resolveTableType?.(tableId) ||
      tableElement?.getAttribute?.('data-table-type') ||
      tableElement?.dataset?.tableType ||
      null;

    if (!tableType) return null;

    const config = window.UnifiedTableSystem.registry.getConfig(tableType);
    if (!config || typeof config.updateFunction !== 'function') {
      return null;
    }

    const context = filterContext || this.buildFilterContext();
    const filteredData = window.UnifiedTableSystem.filter.apply(tableType, context);

    const renderCallback = async pageData => {
      try {
        await Promise.resolve(config.updateFunction(pageData));
      } catch (renderError) {
        window.Logger?.warn?.('⚠️ applyFiltersToTable: updateFunction failed', {
          tableType,
          tableId,
          error: renderError?.message || renderError,
          page: 'header-system',
        });
      }
    };

    if (typeof window.updateTableWithPagination === 'function') {
      await window.updateTableWithPagination({
        tableId,
        tableType,
        data: filteredData,
        render: async pageData => renderCallback(pageData),
        skipRegistry: true,
      });
    } else {
      await renderCallback(filteredData);
    }

    return filteredData;
  }

  async loadAccountsForFilter() {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu) {
      window.Logger?.warn?.('⚠️ accountFilterMenu not found', { page: 'header-system' });
      return;
    }

    if (!document.body.contains(accountMenu)) {
      window.Logger?.warn?.('⚠️ accountFilterMenu not in DOM', { page: 'header-system' });
      return;
    }

    // Clear existing items except "הכול"
    const existingItems = accountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])');
    existingItems.forEach(item => item.remove());

    let accounts = [];

    // Priority 1: Use DataImportData service
    if (window.DataImportData?.loadTradingAccountsForImport) {
      try {
        accounts = await window.DataImportData.loadTradingAccountsForImport();
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to load accounts via DataImportData', error, { page: 'header-system' });
      }
    }

    // Priority 2: Use legacy function
    if ((!accounts || accounts.length === 0) && typeof window.loadTradingAccountsFromServer === 'function') {
      try {
        await window.loadTradingAccountsFromServer();
        accounts = window.trading_accountsData || [];
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to load accounts via loadTradingAccountsFromServer', error, { page: 'header-system' });
      }
    }

    // Priority 3: Use TradingAccountsData service
    if ((!accounts || accounts.length === 0) && window.TradingAccountsData && typeof window.TradingAccountsData.getAll === 'function') {
      try {
        accounts = await window.TradingAccountsData.getAll();
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to load accounts via TradingAccountsData', error, { page: 'header-system' });
      }
    }

    // Priority 4: Direct API call
    if (!accounts || accounts.length === 0) {
      try {
        const response = await fetch('/api/trading-accounts/');
        const data = await response.json();
        accounts = data.data || data || [];
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to load accounts via API', error, { page: 'header-system' });
      }
    }

    const openAccounts = accounts.filter(account => account.status === 'open');

    openAccounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'account-filter-item';
      accountItem.setAttribute('data-value', account.id.toString());
      const span = document.createElement('span');
      span.className = 'option-text';
      span.textContent = account.name || account.id;
      accountItem.appendChild(span);
      accountMenu.appendChild(accountItem);
    });

    window.Logger?.info?.(`✅ Loaded ${openAccounts.length} open trading accounts for filter`, { page: 'header-system' });
  }
}
} // End of if (typeof window.FilterManager === 'undefined')

// ===== MenuManager Class =====
// Prevent duplicate declaration
if (typeof window.MenuManager === 'undefined') {
window.MenuManager = class MenuManager {
  constructor() {
    this.openMenuId = null;
    this.hoverTimeouts = new Map();
  }

  init() {
    this.setupHoverBehavior();
  }

  setupHoverBehavior() {
    const dropdownItems = document.querySelectorAll('#unified-header .tiktrack-nav-item.dropdown');
    
    dropdownItems.forEach((item, index) => {
      const menu = item.querySelector('.tiktrack-dropdown-menu');
      if (!menu) return;

      // Set unique ID if not exists
      if (!menu.id) {
        menu.id = `menu-${index}`;
      }

      let openTimeout = null;
      let closeTimeout = null;

      const clearTimeouts = () => {
        if (openTimeout) {
          clearTimeout(openTimeout);
          openTimeout = null;
        }
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      };

      item.addEventListener('mouseenter', () => {
        clearTimeouts();
        openTimeout = setTimeout(() => {
          this.openMenu(menu.id);
        }, 150);
      });

      item.addEventListener('mouseleave', (e) => {
        clearTimeouts();
        // Check if mouse is moving to menu or submenu
        const relatedTarget = e.relatedTarget;
        const submenu = menu.querySelector('.level3-submenu');
        
        // Don't close if moving to menu or submenu
        if (menu.contains(relatedTarget) || (submenu && submenu.contains(relatedTarget))) {
          return;
        }
        
        closeTimeout = setTimeout(() => {
          if (!item.matches(':hover') && !menu.matches(':hover')) {
            const activeSubmenu = menu.querySelector('.level3-submenu:not([style*="display: none"])');
            if (!activeSubmenu || !activeSubmenu.matches(':hover')) {
              this.closeMenu(menu.id);
            }
          }
        }, 800);
      });

      menu.addEventListener('mouseenter', () => {
        clearTimeouts();
      });

      menu.addEventListener('mouseleave', (e) => {
        clearTimeouts();
        // Check if mouse is moving to level 3 submenu
        const submenu = menu.querySelector('.level3-submenu');
        const relatedTarget = e.relatedTarget;
        
        // Don't close if moving to submenu or its parent
        if (submenu && (submenu.contains(relatedTarget) || menu.querySelector('.dropdown-submenu')?.contains(relatedTarget))) {
          return;
        }
        
        closeTimeout = setTimeout(() => {
          if (!item.matches(':hover') && !menu.matches(':hover')) {
            this.closeMenu(menu.id);
          }
        }, 800);
      });

      // Handle level 3 submenu hover
      const submenus = menu.querySelectorAll('.level3-submenu');
      submenus.forEach(submenu => {
        let isPositioning = false;
        let lastPosition = null;
        let positionTimeout = null;
        
        // Position submenu to prevent overflow with debouncing
        const positionSubmenu = (source = 'unknown') => {
          // Prevent concurrent positioning calls
          if (isPositioning) {
            window.Logger?.debug?.('⏸️ Submenu positioning already in progress, skipping', { source, submenu: submenu.id || 'unnamed' });
            return;
          }
          
          // Check if submenu is visible using computed style
          const computedStyle = window.getComputedStyle(submenu);
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
            window.Logger?.debug?.('👻 Submenu not visible, skipping position check', { source });
            return;
          }
          
          isPositioning = true;
          window.Logger?.debug?.('🔍 Checking submenu position', { source, submenu: submenu.id || 'unnamed' });
          
          // Wait for submenu to be fully rendered
          setTimeout(() => {
            try {
              // Get current state BEFORE making any changes
              const hasBottomAligned = submenu.classList.contains('bottom-aligned');
              const submenuRect = submenu.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              
              // Calculate position based on CURRENT state (before change)
              // If already bottom-aligned, we need to check what it would be in top position
              // If in top position, check current bottom space
              let bottomSpace;
              let needsBottomAlign;
              
              if (hasBottomAligned) {
                // Currently bottom-aligned - check what it would be in top position
                // We need to temporarily remove the class to measure
                submenu.classList.remove('bottom-aligned');
                // Force reflow
                void submenu.offsetHeight;
                const topRect = submenu.getBoundingClientRect();
                bottomSpace = viewportHeight - topRect.bottom;
                // Restore original state
                submenu.classList.add('bottom-aligned');
                void submenu.offsetHeight;
                
                // If in top position it would overflow, keep bottom-aligned
                needsBottomAlign = bottomSpace < 10;
                window.Logger?.debug?.('🔍 Currently bottom-aligned, checking top position', {
                  topPositionBottom: topRect.bottom.toFixed(1),
                  topPositionBottomSpace: bottomSpace.toFixed(1)
                });
              } else {
                // Currently in top position - check current bottom space
                bottomSpace = viewportHeight - submenuRect.bottom;
                needsBottomAlign = bottomSpace < 10;
                window.Logger?.debug?.('🔍 Currently in top position', {
                  currentBottom: submenuRect.bottom.toFixed(1),
                  bottomSpace: bottomSpace.toFixed(1)
                });
              }
              
              // Check if position has actually changed
              const currentPosition = needsBottomAlign ? 'bottom' : 'top';
              const wasBottomAligned = hasBottomAligned;
              
              if (lastPosition === currentPosition && wasBottomAligned === needsBottomAlign) {
                window.Logger?.debug?.('✅ Submenu position unchanged, skipping update', { 
                  position: currentPosition, 
                  bottomSpace: bottomSpace.toFixed(1),
                  wasBottomAligned,
                  needsBottomAlign
                });
                isPositioning = false;
                return;
              }
              
              window.Logger?.info?.('📍 Updating submenu position', { 
                from: lastPosition || (wasBottomAligned ? 'bottom' : 'top'),
                to: currentPosition,
                bottomSpace: bottomSpace.toFixed(1),
                viewportHeight,
                currentBottom: submenuRect.bottom.toFixed(1),
                wasBottomAligned,
                needsBottomAlign
              });
              
              // Update position
              if (needsBottomAlign && !wasBottomAligned) {
                submenu.classList.add('bottom-aligned');
                window.Logger?.debug?.('⬇️ Added bottom-aligned class');
              } else if (!needsBottomAlign && wasBottomAligned) {
                submenu.classList.remove('bottom-aligned');
                window.Logger?.debug?.('⬆️ Removed bottom-aligned class');
              }
              
              lastPosition = currentPosition;
            } catch (error) {
              window.Logger?.error?.('❌ Error positioning submenu', { error: error.message });
            } finally {
              isPositioning = false;
            }
          }, 10);
        };

        // Debounced version for resize and observer
        const debouncedPositionSubmenu = (source) => {
          if (positionTimeout) {
            clearTimeout(positionTimeout);
          }
          positionTimeout = setTimeout(() => {
            positionSubmenu(source);
          }, 100);
        };

        // Check position on hover - using MutationObserver to detect CSS changes
        const parentSubmenu = submenu.closest('.dropdown-submenu');
        if (parentSubmenu) {
          // Check position when parent is hovered
          parentSubmenu.addEventListener('mouseenter', () => {
            lastPosition = null; // Reset position cache on new hover
            setTimeout(() => positionSubmenu('mouseenter'), 100);
          });
          
          // Use MutationObserver to detect when submenu becomes visible
          // But ignore changes we made ourselves (class changes)
          let isOurChange = false;
          const observer = new MutationObserver((mutations) => {
            // Ignore if we're the ones making the change
            if (isOurChange) {
              isOurChange = false;
              return;
            }
            
            // Check if submenu became visible
            const computedStyle = window.getComputedStyle(submenu);
            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0') {
              debouncedPositionSubmenu('mutation-observer');
            }
          });
          
          observer.observe(submenu, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            attributeOldValue: true
          });
          
          // Store observer for cleanup if needed
          submenu._positionObserver = observer;
          
          // Intercept class changes to mark them as ours
          const originalClassListAdd = submenu.classList.add.bind(submenu.classList);
          const originalClassListRemove = submenu.classList.remove.bind(submenu.classList);
          
          submenu.classList.add = function(...args) {
            if (args.includes('bottom-aligned')) {
              isOurChange = true;
            }
            return originalClassListAdd(...args);
          };
          
          submenu.classList.remove = function(...args) {
            if (args.includes('bottom-aligned')) {
              isOurChange = true;
            }
            return originalClassListRemove(...args);
          };
        }

        submenu.addEventListener('mouseenter', () => {
          clearTimeouts();
          debouncedPositionSubmenu('submenu-mouseenter');
        });

        submenu.addEventListener('mouseleave', () => {
          clearTimeouts();
          closeTimeout = setTimeout(() => {
            if (!item.matches(':hover') && !menu.matches(':hover') && !submenu.matches(':hover')) {
              this.closeMenu(menu.id);
            }
          }, 800);
        });

        // Check position on window resize (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            const computedStyle = window.getComputedStyle(submenu);
            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0') {
              lastPosition = null; // Reset on resize
              debouncedPositionSubmenu('window-resize');
            }
          }, 150);
        });
      });
    });
  }

  openMenu(menuId) {
    // Close other menus first
    if (this.openMenuId && this.openMenuId !== menuId) {
      this.closeMenu(this.openMenuId);
    }
    
    // Find menu by parent item
    const dropdownItems = document.querySelectorAll('#unified-header .tiktrack-nav-item.dropdown');
    let targetMenu = null;
    
    dropdownItems.forEach(item => {
      const menu = item.querySelector('.tiktrack-dropdown-menu');
      if (menu && (menu.id === menuId || !menuId)) {
        targetMenu = menu;
        // Set menuId if not set
        if (!menu.id) {
          menu.id = menuId || `menu-${Date.now()}`;
        }
      }
    });
    
    if (targetMenu) {
      targetMenu.style.opacity = '1';
      targetMenu.style.visibility = 'visible';
      targetMenu.style.transform = 'translateY(0)';
      this.openMenuId = targetMenu.id;
    }
  }

  closeMenu(menuId) {
    const menus = document.querySelectorAll('#unified-header .tiktrack-dropdown-menu');
    menus.forEach(menu => {
      if (!menuId || menu.id === menuId) {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(-10px)';
        if (this.openMenuId === menu.id) {
          this.openMenuId = null;
        }
      }
    });
  }
};
} // End of if (typeof window.MenuManager === 'undefined')

// ===== HeaderSystem Class =====
class HeaderSystem {
  constructor() {
    this.isInitialized = false;
    if (!window.FilterManager) {
      throw new Error('FilterManager is not defined. Make sure header-system.js is loaded correctly.');
    }
    if (!window.MenuManager) {
      throw new Error('MenuManager is not defined. Make sure header-system.js is loaded correctly.');
    }
    this.filterManager = new window.FilterManager();
    this.menuManager = new window.MenuManager();
  }

  init() {
    if (this.isInitialized) {
      window.Logger?.warn?.('⚠️ HeaderSystem already initialized', { page: 'header-system' });
      return;
    }

    window.Logger?.info?.('🔧 HeaderSystem.init() called', { page: 'header-system' });

    try {
      HeaderSystem.createHeader();
      this.setupEventListeners();
      this.menuManager.init();
      this.filterManager.init();
      this.updateUserDisplay(); // Update user display after header creation
      this.isInitialized = true;
      
      window.Logger?.info?.('✅ HeaderSystem.init() completed', { page: 'header-system' });
    } catch (error) {
      window.Logger?.error?.('❌ HeaderSystem.init() failed', {
        error: error.message,
        stack: error.stack,
        page: 'header-system',
      });
      throw error;
    }
  }

  static createHeader() {
    // Skip header creation for auth pages (login, register, etc.)
    const isAuthPage = window.location.pathname.includes('login.html') ||
                      window.location.pathname.includes('register.html') ||
                      window.location.pathname.includes('forgot-password.html') ||
                      window.location.pathname.includes('reset-password.html') ||
                      document.documentElement.classList.contains('login-page') ||
                      document.documentElement.classList.contains('auth-page');
    
    if (isAuthPage) {
      window.Logger?.debug('Skipping header creation for auth page', { page: 'header-system' });
      return;
    }

    const headerElement = document.getElementById('unified-header');
    if (!headerElement) {
      if (!document.body) {
        throw new Error('document.body does not exist when trying to create header element');
      }
      const newHeader = document.createElement('div');
      newHeader.id = 'unified-header';
      document.body.insertBefore(newHeader, document.body.firstChild);
    }

    const existingHeader = document.getElementById('unified-header');
    const headerHTML = HeaderSystem.getHeaderHTML();
    existingHeader.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(headerHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
        existingHeader.appendChild(node.cloneNode(true));
    });
  }

  /**
   * Update user display in filter row
   */
  updateUserDisplay() {
    try {
      const userSection = document.getElementById('filterUserSection');
      const userAvatar = document.getElementById('filterUserAvatar');
      const userInitials = document.getElementById('filterUserInitials');
      const authIcon = document.getElementById('filterAuthIcon');
      
      if (!userSection || !userAvatar || !userInitials || !authIcon) {
        // User section might not exist on all pages
        return;
      }

      // Get current user
      let currentUser = null;
      if (typeof window.getCurrentUser === 'function') {
        currentUser = window.getCurrentUser();
      } else if (typeof window.TikTrackAuth?.getCurrentUser === 'function') {
        currentUser = window.TikTrackAuth.getCurrentUser();
      } else {
        // Try localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      const isAuthenticated = currentUser && currentUser.id;
      
      if (isAuthenticated) {
        // Get user initials
        const firstName = currentUser.first_name || '';
        const lastName = currentUser.last_name || '';
        const username = currentUser.username || '';
        
        let initials = '';
        if (firstName && lastName) {
          initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        } else if (firstName) {
          initials = firstName.charAt(0).toUpperCase();
        } else if (username) {
          initials = username.substring(0, 2).toUpperCase();
        } else {
          initials = '?';
        }
        
        userInitials.textContent = initials;
        userAvatar.style.display = 'flex';
        userSection.style.display = 'flex';
        const profileLink = document.getElementById('filterUserProfileLink');
        if (profileLink) profileLink.style.display = 'block';
        authIcon.style.opacity = '0.7';
        authIcon.title = 'התנתק';
      } else {
        // Show login icon only
        userAvatar.style.display = 'none';
        userSection.style.display = 'flex';
        const profileLink = document.getElementById('filterUserProfileLink');
        if (profileLink) profileLink.style.display = 'none';
        authIcon.style.opacity = '0.7';
        authIcon.title = 'התחבר';
      }
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to update user display in filter row', {
        error: error?.message || error,
        page: 'header-system',
      });
    }
  }

  static getHeaderHTML() {
    const pathname = window.location.pathname || '';
    const href = window.location.href || '';
    const isMockupPage = pathname.includes('/mockups/') || href.includes('/mockups/');
    const isResearchPage = pathname.includes('/research') || href.includes('/research');
    const imagePathPrefix = isMockupPage ? '../../' : '';
    
    return `
        <div class="header-content">
          <div class="header-top">
            <div class="header-container">
              <div class="header-nav">
                <nav class="main-nav">
                  <ul class="tiktrack-nav-list">
                    <li class="tiktrack-nav-item">
                      <a href="/" class="tiktrack-nav-link" data-page="home">
                        <img src="${imagePathPrefix}images/icons/entities/home.svg" alt="בית" width="36" height="36" class="nav-icon home-icon-only" data-icon-replace="entity:home">
                      </a>
                    </li>
                    <li class="tiktrack-nav-item">
                      <a href="/trade_plans" class="tiktrack-nav-link" data-page="trade_plans">
                        <span class="nav-text">תכנון</span>
                      </a>
                    </li>
                    <li class="tiktrack-nav-item dropdown">
                      <a href="/trades" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="trades">
                        <span class="nav-text">מעקב</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/watch-list">רשימות צפייה</a></li>
                      </ul>
                    </li>
                    <li class="tiktrack-nav-item dropdown">
                      <a href="/research" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="research">
                        <span class="nav-text">מחקר</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/ai-analysis">אנליזת AI</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/strategy-analysis">📊 ניתוח אסטרטגיות</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/trade-history">📈 היסטוריית טרייד</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/portfolio-state">💼 מצב תיק היסטורי</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/trading-journal">📓 יומן מסחר</a></li>
                      </ul>
                    </li>
                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="data">
                        <span class="nav-text">נתונים</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/alerts">התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notes">הערות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/trading_accounts">חשבונות מסחר</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tickers">טיקרים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/executions">ביצועים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                      </ul>
                    </li>
                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="settings">
                        <span class="nav-text">הגדרות</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/user-profile">👤 פרופיל משתמש</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/data_import">ייבוא נתונים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tag-management">ניהול תגיות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/preferences">העדפות</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_display">בסיס נתונים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_extradata">טבלאות עזר</a></li>
                      </ul>
                    </li>
                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="development-tools">
                        <span class="nav-text">פיתוח</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/system-management">🔧 ניהול מערכת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/server-monitor">🖥️ ניטור שרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/background-tasks">⚙️ ניהול משימות רקע</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notifications-center">🔔 מרכז התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/external-data-dashboard">📊 דשבורד נתונים חיצוניים</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/code-quality-dashboard">📊 איכות קוד ולינטר</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cache-management">💾 ניהול מטמון</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/init-system-management">🚀 ניהול מערכת אתחול</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/cache-test">💾 בדיקת Cache</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/crud-testing-dashboard">🧪 דשבורד בדיקות CRUD</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/conditions-test">🧩 בדיקות תנאים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/constraints">🔒 מוניטור אילוצים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">🧪 בדיקת ראש הדף</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/css-management">🎨 מנהל CSS</a></li>
                        <li class="dropdown-submenu">
                          <a class="tiktrack-dropdown-item" href="#">📐 מוקאפים <span class="tiktrack-dropdown-arrow" style="font-size: 0.7rem;">◀</span></a>
                          <ul class="level3-submenu">
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/comparative-analysis-page.html">📊 ניתוח השוואתי</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/date-comparison-modal.html">📅 השוואת תאריכים</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/economic-calendar-page.html">📆 לוח כלכלי</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/emotional-tracking-widget.html">😊 תיעוד רגשי</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/history-widget.html">📜 ווידג'ט היסטוריה</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/portfolio-state-page.html">💼 מצב תיק היסטורי</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/price-history-page.html">💰 היסטוריית מחירים</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/strategy-analysis-page.html">🎯 ניתוח אסטרטגיות</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/trade-history-page.html">📈 היסטוריית טרייד</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/trading-journal-page.html">📓 יומן מסחר</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/tradingview-test-page.html">📈 גראפים TV</a></li>
                            <li class="separator"></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/add-ticker-modal.html">➕ הוספת טיקר</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/flag-quick-action.html">🚩 פעולה מהירה</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/watch-list-modal.html">👁️ רשימת מעקב</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/mockups/watch-lists-page.html">📋 רשימות מעקב</a></li>
                          </ul>
                        </li>
                        <li><a class="tiktrack-dropdown-item" href="/chart-management">📊 ניהול גרפים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/dynamic-colors-display">🌈 תצוגת צבעים דינמית</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">🎭 עיצובים</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/tradingview-widgets-showcase">🎯 ווידג'טים TradingView</a></li>
                      </ul>
                    </li>
                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" data-onclick="CacheControlMenu.triggerAction('full', event)" 
                         title="ניקוי מטמון לפיתוח">
                        <span class="nav-text" style="color: #ff0000; font-size: 1.2rem;">🧹</span>
                      </a>
                      <ul class="submenu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 240px; z-index: 1000; padding: 0; margin: 0; list-style: none;">
                        <li><a href="#" data-cache-action="memory"
                               data-onclick="CacheControlMenu.triggerAction('memory', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee; font-weight: 500;"
                               title="ניקוי שכבת הזיכרון בלבד (Memory)">🧠 ניקוי שכבת זיכרון</a></li>
                        <li><a href="#" data-cache-action="local-storage"
                               data-onclick="CacheControlMenu.triggerAction('local-storage', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;"
                               title="ניקוי מטמון localStorage (כולל העדפות פרופיל)">💽 ניקוי localStorage</a></li>
                        <li><a href="#" data-cache-action="indexeddb"
                               data-onclick="CacheControlMenu.triggerAction('indexeddb', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;"
                               title="ניקוי המטמון המאוחסן ב-IndexedDB">🗃️ ניקוי IndexedDB</a></li>
                        <li><a href="#" data-cache-action="full"
                               data-onclick="CacheControlMenu.triggerAction('full', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; font-weight: bold;"
                               title="ניקוי כל שכבות המטמון + רענון אוטומטי">🌀 ניקוי מלא + רענון</a></li>
                      </ul>
                    </li>
                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="runQuickQualityCheck(event)" 
                         title="בדיקת איכות מהירה">
                        <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">⚡</span>
                      </a>
                    </li>
                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" id="initSystemCheckBtn" 
                         title="ניטור מערכת איתחול"
                         data-onclick="initSystemCheck?.runPageCheck(event)">
                        <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">🔍</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              <div class="logo-section">
                <a href="/" class="logo">
                  <img src="${imagePathPrefix}images/logo.svg" alt="TikTrack Logo" class="logo-image">
                  <span class="logo-text">פשוט לנהל תיק</span>
                </a>
              </div>
              
            </div>
          </div>

        ${!isResearchPage ? `<div class="header-filters" id="headerFilters" data-section="filters">
          <div class="filters-container">
            <div class="filter-group status-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle status-filter-toggle" id="statusFilterToggle">
                  <span class="selected-value selected-status-text" id="selectedStatus">כל סטטוס</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="statusFilterMenu">
                  <div class="status-filter-item" data-value="הכול">
                    <span class="option-text">הכול</span>
                  </div>
                  <div class="status-filter-item" data-value="פתוח">
                    <span class="option-text">פתוח</span>
                  </div>
                  <div class="status-filter-item" data-value="סגור">
                    <span class="option-text">סגור</span>
                  </div>
                  <div class="status-filter-item" data-value="מבוטל">
                    <span class="option-text">מבוטל</span>
                  </div>
                  <button class="filter-close-btn" onclick="window.headerSystem?.filterManager?.closeFilter('statusFilterMenu')" title="סגור">×</button>
                </div>
              </div>
            </div>

            <div class="filter-group type-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle type-filter-toggle" id="typeFilterToggle">
                  <span class="selected-value selected-type-text" id="selectedType">כל סוג השקעה</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="typeFilterMenu">
                  <div class="type-filter-item" data-value="הכול">
                    <span class="option-text">הכול</span>
                  </div>
                  <div class="type-filter-item" data-value="סווינג">
                    <span class="option-text">סווינג</span>
                  </div>
                  <div class="type-filter-item" data-value="השקעה">
                    <span class="option-text">השקעה</span>
                  </div>
                  <div class="type-filter-item" data-value="פאסיבי">
                    <span class="option-text">פאסיבי</span>
                  </div>
                  <button class="filter-close-btn" onclick="window.headerSystem?.filterManager?.closeFilter('typeFilterMenu')" title="סגור">×</button>
                </div>
              </div>
            </div>

            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle account-filter-toggle" id="accountFilterToggle">
                  <span class="selected-value selected-account-text" id="selectedAccount">כל חשבון מסחר</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="accountFilterMenu">
                  <div class="account-filter-item" data-value="הכול">
                    <span class="option-text">הכול</span>
                  </div>
                  <button class="filter-close-btn" onclick="window.headerSystem?.filterManager?.closeFilter('accountFilterMenu')" title="סגור">×</button>
                </div>
              </div>
            </div>

            <div class="filter-group date-range-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle date-range-filter-toggle" id="dateRangeFilterToggle">
                  <span class="selected-value selected-date-text" id="selectedDateRange">כל זמן</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="dateRangeFilterMenu">
                  <div class="date-range-filter-item" data-value="כל זמן">
                    <span class="option-text">כל זמן</span>
                  </div>
                  <div class="date-range-filter-item" data-value="היום">
                    <span class="option-text">היום</span>
                  </div>
                  <div class="date-range-filter-item" data-value="אתמול">
                    <span class="option-text">אתמול</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השבוע">
                    <span class="option-text">השבוע</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע">
                    <span class="option-text">שבוע (7 ימים)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע קודם">
                    <span class="option-text">שבוע שעבר</span>
                  </div>
                  <div class="date-range-filter-item" data-value="החודש">
                    <span class="option-text">החודש</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש">
                    <span class="option-text">חודש (30 יום)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש קודם">
                    <span class="option-text">חודש קודם</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השנה">
                    <span class="option-text">השנה</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה">
                    <span class="option-text">שנה (365 ימים)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה קודמת">
                    <span class="option-text">שנה שעברה</span>
                  </div>
                  <button class="filter-close-btn" onclick="window.headerSystem?.filterManager?.closeFilter('dateRangeFilterMenu')" title="סגור">×</button>
                </div>
              </div>
            </div>

            <div class="filter-group search-filter">
              <div class="search-input-wrapper">
                <input type="text" class="search-filter-input" id="searchFilterInput" 
                       placeholder="חיפוש..." onkeyup="handleSearchInput(event)">
                <button class="search-clear-btn" onclick="clearSearchFilter()" title="נקה חיפוש">×</button>
              </div>
            </div>

            <div class="filter-actions">
              <button class="reset-btn" onclick="resetAllFilters()" title="איפוס פילטרים">
                <span class="btn-text">↻</span>
              </button>
              <button class="clear-btn" onclick="clearAllFilters()" title="נקה כל הפילטרים">
                <span class="btn-text">×</span>
              </button>
            </div>

            <div class="filter-user-section" id="filterUserSection" style="margin-right: auto; display: flex; align-items: center; gap: 8px;">
              <a href="/user-profile" class="user-profile-link" id="filterUserProfileLink" title="פרופיל משתמש" style="text-decoration: none; display: none;">
                <div class="user-avatar-badge" id="filterUserAvatar" style="width: 36px; height: 36px; border-radius: 50%; background: #26baac; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; cursor: pointer;">
                  <span id="filterUserInitials">?</span>
                </div>
              </a>
              <button class="auth-toggle-btn" id="filterAuthToggleBtn" 
                      onclick="handleHeaderLogout(event)"
                      style="width: 36px; height: 36px; border: none; background: transparent; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center;"
                      title="התחבר/התנתק">
                <img src="${imagePathPrefix}images/icons/tabler/user.svg" alt="התחבר/התנתק" style="width: 24px; height: 24px; opacity: 0.7;" id="filterAuthIcon">
              </button>
            </div>
          </div>
        </div>
        
        <div class="filter-toggle-section filter-toggle-main">
          <button class="header-filter-toggle-btn" id="headerFilterToggleBtnMain" title="הצג/הסתר פילטרים" 
                  data-onclick="toggleHeaderFilters()">
            <span class="header-filter-arrow">▲</span>
          </button>
        </div>
        ` : ''}
        
        </div>
    `;
  }

  setupEventListeners() {
    const headerElement = document.getElementById('unified-header');
    if (!headerElement) return;

    // Event delegation for filter item clicks
    headerElement.addEventListener('click', (e) => {
      const statusItem = e.target.closest('.status-filter-item');
      if (statusItem) {
        const value = statusItem.getAttribute('data-value');
        this.filterManager.selectStatusOption(value);
        return;
      }

      const typeItem = e.target.closest('.type-filter-item');
      if (typeItem) {
        const value = typeItem.getAttribute('data-value');
        this.filterManager.selectTypeOption(value);
        return;
      }

      const accountItem = e.target.closest('.account-filter-item');
      if (accountItem) {
        const value = accountItem.getAttribute('data-value');
        this.filterManager.selectAccountOption(value);
        return;
      }

      const dateItem = e.target.closest('.date-range-filter-item');
      if (dateItem) {
        const value = dateItem.getAttribute('data-value');
        this.filterManager.selectDateRangeOption(value);
        return;
      }
    });
  }

  cleanup() {
    // Clear all timeouts
    this.filterManager.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.filterManager.hoverTimeouts.clear();
    this.menuManager.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.menuManager.hoverTimeouts.clear();
    
    // Close all open menus and filters
    if (this.filterManager.openFilterId) {
      this.filterManager.closeFilter(this.filterManager.openFilterId);
    }
    if (this.menuManager.openMenuId) {
      this.menuManager.closeMenu(this.menuManager.openMenuId);
    }
    
    this.isInitialized = false;
  }
}

// ===== Global Functions (Compatibility) =====

// Filter selection functions
window.selectStatusOption = function(status) {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.selectStatusOption(status);
  }
};

window.selectTypeOption = function(type) {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.selectTypeOption(type);
  }
};

window.selectAccountOption = function(accountId) {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.selectAccountOption(accountId);
  }
};

window.selectDateRangeOption = function(dateRange) {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.selectDateRangeOption(dateRange);
  }
};

// Filter text update functions
window.updateStatusFilterText = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.updateStatusFilterText();
  }
};

window.updateTypeFilterText = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.updateTypeFilterText();
  }
};

window.updateAccountFilterText = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.updateAccountFilterText();
  }
};

window.updateDateRangeFilterText = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.updateDateRangeFilterText();
  }
};

// Filter apply functions
window.applyStatusFilter = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.applyFilters();
  }
};

window.applyTypeFilter = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.applyFilters();
  }
};

window.applyAccountFilter = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.applyFilters();
  }
};

window.applyDateRangeFilter = function() {
  if (window.headerSystem && window.headerSystem.filterManager) {
    window.headerSystem.filterManager.applyFilters();
  }
};

// Toggle header filters
window.toggleHeaderFilters = function() {
  const section = document.getElementById('headerFilters');
  if (section) {
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';

    const toggleBtn = document.getElementById('headerFilterToggleBtnMain') || 
                      document.getElementById('headerFilterToggleBtnSecondary');
    const arrow = toggleBtn ? toggleBtn.querySelector('.header-filter-arrow') : null;

    if (toggleBtn && arrow) {
      if (isVisible) {
        updateChevronIcon(arrow, true);
        toggleBtn.classList.add('collapsed');
      } else {
        updateChevronIcon(arrow, false);
        toggleBtn.classList.remove('collapsed');
      }
    }
  }
};

// Search and clear functions
window.handleSearchInput = function(event) {
  if (window.headerSystem && window.headerSystem.filterManager) {
    const value = event.target.value;
    window.headerSystem.filterManager.currentFilters.search = value;
    window.headerSystem.filterManager.saveFilters();
    window.headerSystem.filterManager.applyFilters();
  }
};

window.clearSearchFilter = function() {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    // Use DataCollectionService to clear field if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue('searchFilterInput', '', 'text');
    } else {
      searchInput.value = '';
    }
    if (window.headerSystem && window.headerSystem.filterManager) {
      window.headerSystem.filterManager.currentFilters.search = '';
      window.headerSystem.filterManager.saveFilters();
      window.headerSystem.filterManager.applyFilters();
    }
    window.Logger?.info?.('✅ חיפוש נוקה', { page: 'header-system' });
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('חיפוש נוקה בהצלחה', 'success', 'הצלחה', 1500, 'system');
    }
  }
};

window.resetAllFilters = async function() {
  window.Logger?.info?.('↻ resetAllFilters - מחזיר לערכי ברירת מחדל', { page: 'header-system' });

  if (!window.headerSystem || !window.headerSystem.filterManager) {
    return;
  }

  try {
    // Clear preference cache to ensure fresh values
    const filterPrefNames = [
      'defaultSearchFilter',
      'defaultDateRangeFilter',
      'defaultStatusFilter',
      'defaultTypeFilter',
      'default_trading_account',
    ];

    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
      for (const prefName of filterPrefNames) {
        const cacheKey = window.PreferencesCore?.buildPreferenceCacheKey
          ? window.PreferencesCore.buildPreferenceCacheKey(prefName, 0)
          : window.UnifiedCacheManager?.buildPreferenceCacheKey
            ? window.UnifiedCacheManager.buildPreferenceCacheKey(prefName, 0)
            : `preference_${prefName}__profile_0`;
        await window.UnifiedCacheManager.remove(cacheKey, { layer: 'localStorage' });
      }
    }

    // Wait for preferences to be loaded (simplified)
    const environment = window.API_ENV || 'development';
    const timeoutMs = environment === 'production' ? 5000 : 3000;
    
    await new Promise((resolve) => {
      if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        resolve();
        return;
      }
      
      const eventHandler = () => resolve();
      window.addEventListener('preferences:critical-loaded', eventHandler, { once: true });
      setTimeout(() => {
        window.removeEventListener('preferences:critical-loaded', eventHandler);
        resolve(); // Continue even if event doesn't fire
      }, timeoutMs);
    });

    // Load default values from preferences
    const defaultFilters = {
      search: window.currentPreferences?.defaultSearchFilter || '',
      dateRange: window.currentPreferences?.defaultDateRangeFilter || 'כל זמן',
      status: window.currentPreferences?.defaultStatusFilter || [],
      type: window.currentPreferences?.defaultTypeFilter || [],
      account: window.currentPreferences?.default_trading_account ? [window.currentPreferences.default_trading_account] : [],
      custom: {},
    };

    window.headerSystem.filterManager.currentFilters = defaultFilters;
    window.headerSystem.filterManager.updateUI();
    window.headerSystem.filterManager.saveFilters();
    window.headerSystem.filterManager.applyFilters();

    // Reset search input
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      // Use DataCollectionService to set value if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue('searchFilterInput', defaultFilters.search, 'text');
      } else {
        searchInput.value = defaultFilters.search;
      }
    }

    window.Logger?.info?.('✅ resetAllFilters completed', { page: 'header-system' });
  } catch (error) {
    window.Logger?.warn?.('⚠️ resetAllFilters failed', {
      error: error?.message || error,
      page: 'header-system',
    });
    // Fallback to simple reset
    window.headerSystem.filterManager.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: [],
      custom: {},
    };
    window.headerSystem.filterManager.updateUI();
    window.headerSystem.filterManager.saveFilters();
    window.headerSystem.filterManager.applyFilters();
  }
};

// ===== User Display Update =====
// Update user display when authentication state changes
if (typeof window.addEventListener === 'function') {
  // Listen for authentication events
  window.addEventListener('user:logged-in', () => {
    if (window.headerSystem) {
      window.headerSystem.updateUserDisplay();
    }
  });
  
  window.addEventListener('user:logged-out', () => {
    if (window.headerSystem) {
      window.headerSystem.updateUserDisplay();
    }
  });

  // Listen for login/logout events from auth.js
  window.addEventListener('login:success', () => {
    if (window.headerSystem) {
      window.headerSystem.updateUserDisplay();
    }
  });
  
  window.addEventListener('logout:success', () => {
    if (window.headerSystem) {
      window.headerSystem.updateUserDisplay();
    }
  });

  // Also update on page load after a short delay
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (window.headerSystem) {
          window.headerSystem.updateUserDisplay();
        }
      }, 500);
    });
  } else {
    setTimeout(() => {
      if (window.headerSystem) {
        window.headerSystem.updateUserDisplay();
      }
    }, 500);
  }
}

// ===== Global Logout Handler =====
window.handleHeaderLogout = async function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Check if user is authenticated
  const isAuth = window.TikTrackAuth?.isAuthenticated?.() || false;
  
  if (isAuth) {
    // User is authenticated - perform logout (which will show login modal)
    if (window.TikTrackAuth?.logout) {
      await window.TikTrackAuth.logout();
    } else {
      // Fallback if TikTrackAuth not available - show login modal
      if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
        await window.TikTrackAuth.showLoginModal();
      } else {
        window.location.href = '/login.html';
      }
    }
  } else {
    // User is not authenticated - show login modal
    if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
      await window.TikTrackAuth.showLoginModal();
    } else {
      window.location.href = '/login.html';
    }
  }
};

window.clearAllFilters = function() {
  window.Logger?.info?.('🧹 clearAllFilters - מוחק את כל הפילטרים', { page: 'header-system' });

  if (!window.headerSystem || !window.headerSystem.filterManager) {
    return;
  }

  window.headerSystem.filterManager.currentFilters = {
    search: '',
    dateRange: 'כל זמן',
    status: [],
    type: [],
    account: [],
    custom: {},
  };

  // Reset UI
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) searchInput.value = '';

  // Reset all filter selections
  const allFilterItems = document.querySelectorAll(
    '.status-filter-item, .type-filter-item, .account-filter-item, .date-range-filter-item'
  );
  allFilterItems.forEach(item => item.classList.remove('selected'));

  // Select "הכול" in all filters
  const allStatusItem = document.querySelector('#statusFilterMenu .status-filter-item[data-value="הכול"]');
  if (allStatusItem) allStatusItem.classList.add('selected');

  const allTypeItem = document.querySelector('#typeFilterMenu .type-filter-item[data-value="הכול"]');
  if (allTypeItem) allTypeItem.classList.add('selected');

  const allAccountItem = document.querySelector('#accountFilterMenu .account-filter-item[data-value="הכול"]');
  if (allAccountItem) allAccountItem.classList.add('selected');

  const allDateItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item[data-value="כל זמן"]');
  if (allDateItem) allDateItem.classList.add('selected');

  window.headerSystem.filterManager.updateUI();
  window.headerSystem.filterManager.saveFilters();
  window.headerSystem.filterManager.applyFilters();
};

// ===== Global API =====

window.HeaderSystemClass = HeaderSystem;

window.HeaderSystem = {
  initialize: function() {
    window.Logger?.info?.('🚀 HeaderSystem.initialize() - START', {
      page: 'header-system',
      timestamp: new Date().toISOString(),
    });

    try {
      if (typeof window.HeaderSystemClass === 'function') {
        if (!window.headerSystem) {
          window.Logger?.info?.('🆕 HeaderSystem.initialize() - Creating new instance', {
            page: 'header-system',
          });
          window.headerSystem = new window.HeaderSystemClass();
        } else {
          window.Logger?.info?.('♻️ HeaderSystem.initialize() - Reusing existing instance', {
            page: 'header-system',
            isInitialized: window.headerSystem.isInitialized,
          });
        }
        
        window.headerSystem.init();
        window.headerSystemReady = true;
        
        window.Logger?.info?.('✅ HeaderSystem.initialize() - COMPLETE', {
          page: 'header-system',
          headerSystemReady: true,
        });
      } else {
        throw new Error('HeaderSystemClass not found');
      }
    } catch (error) {
      window.Logger?.error?.('❌ HeaderSystem.initialize() - ERROR', {
        page: 'header-system',
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
};

// Expose filter system for compatibility
Object.defineProperty(window, 'filterSystem', {
  get: function() {
    return window.headerSystem?.filterManager || null;
  },
  configurable: true,
});

// Create initializeHeaderSystem wrapper for compatibility with core-systems.js
window.initializeHeaderSystem = function() {
  window.Logger?.info?.('🔧 initializeHeaderSystem() wrapper called', {
    page: 'header-system',
    HeaderSystemExists: typeof window.HeaderSystem !== 'undefined',
  });
  
  if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
    return window.HeaderSystem.initialize();
  } else {
    window.Logger?.error?.('❌ HeaderSystem.initialize not available', {
      page: 'header-system',
    });
    return false;
  }
};

// Add createFilterSystem for compatibility (if needed)
if (window.HeaderSystem && !window.HeaderSystem.createFilterSystem) {
  window.HeaderSystem.createFilterSystem = async function() {
    if (window.headerSystem && window.headerSystem.filterManager) {
      return window.headerSystem.filterManager;
    }
    return null;
  };
}

if (window.Logger) {
  window.Logger.info('✅ Header System v7.0.0 loaded successfully!', { page: 'header-system' });
}

// ===== AUTO-INITIALIZATION FALLBACK =====
// Ensure header is initialized on all pages (except auth pages) even if UnifiedAppInitializer doesn't run
// זה מבטיח שה-header יתאחל בכל עמוד (חוץ מ-auth pages) גם אם UnifiedAppInitializer לא רץ

(function() {
  'use strict';
  
  // Skip auto-initialization for auth pages
  const isAuthPage = window.location.pathname.includes('login.html') ||
                     window.location.pathname.includes('register.html') ||
                     window.location.pathname.includes('forgot-password.html') ||
                     window.location.pathname.includes('reset-password.html');
  
  if (isAuthPage) {
    if (window.Logger?.debug) {
      window.Logger.debug('Skipping Header System auto-initialization for auth page', { page: 'header-system' });
    }
    return;
  }
  
  // Function to initialize header with retry logic
  const ensureHeaderInitialized = async () => {
    // Check if header is already initialized
    if (window.headerSystem && window.headerSystem.isInitialized) {
      if (window.Logger?.debug) {
        window.Logger.debug('Header System already initialized, skipping auto-init', { page: 'header-system' });
      }
      return;
    }
    
    // Check if UnifiedAppInitializer exists and might initialize the header
    const hasUnifiedAppInitializer = typeof window.UnifiedAppInitializer !== 'undefined' || 
                                     typeof window.initializeUnifiedApp !== 'undefined' ||
                                     (window.globalInitializationState && window.globalInitializationState.unifiedAppInitializing);
    
    if (hasUnifiedAppInitializer) {
      // Wait longer for UnifiedAppInitializer to initialize the header
      let waitCount = 0;
      const maxWait = 50; // 5 seconds - give UnifiedAppInitializer enough time
      
      while (waitCount < maxWait) {
        // Check if header was initialized
        if (window.headerSystem && window.headerSystem.isInitialized) {
          if (window.Logger?.debug) {
            window.Logger.debug('Header System initialized by UnifiedAppInitializer', { 
              waitCount,
              page: 'header-system' 
            });
          }
          return;
        }
        
        // Check if UnifiedAppInitializer is still initializing
        if (window.globalInitializationState && window.globalInitializationState.unifiedAppInitializing) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
          continue;
        }
        
        // Check if UnifiedAppInitializer finished initializing
        if (window.globalInitializationState && window.globalInitializationState.unifiedAppInitialized) {
          // UnifiedAppInitializer finished, check one more time if header was initialized
          await new Promise(resolve => setTimeout(resolve, 200));
          if (window.headerSystem && window.headerSystem.isInitialized) {
            if (window.Logger?.debug) {
              window.Logger.debug('Header System initialized by UnifiedAppInitializer (after completion)', { 
                waitCount,
                page: 'header-system' 
              });
            }
            return;
          }
          // UnifiedAppInitializer finished but didn't initialize header, break and initialize ourselves
          break;
        }
        
        // Wait a bit more
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
    }
    
    // Initialize header if not already initialized
    if (!window.headerSystem || !window.headerSystem.isInitialized) {
      // Mark that fallback initialization is being used
      window.__headerSystemInitMethod = 'fallback';
      
      if (window.Logger?.info) {
        window.Logger.info('🔄 Auto-initializing Header System (FALLBACK METHOD)', {
          hasUnifiedAppInitializer,
          unifiedAppInitialized: window.globalInitializationState?.unifiedAppInitialized,
          unifiedAppInitializing: window.globalInitializationState?.unifiedAppInitializing,
          page: window.location.pathname
        }, { page: 'header-system' });
      }
      
      // Also log to console for easy tracking
      console.log('🔄 [HEADER INIT] Using FALLBACK method for:', window.location.pathname);
      
      // Store in localStorage for tracking
      try {
        const initLog = {
          page: window.location.pathname,
          method: 'fallback',
          timestamp: new Date().toISOString()
        };
        const existingLogs = JSON.parse(localStorage.getItem('__headerInitLogs') || '[]');
        existingLogs.push(initLog);
        localStorage.setItem('__headerInitLogs', JSON.stringify(existingLogs));
      } catch (e) {
        // Ignore localStorage errors
      }
      
      try {
        if (typeof window.initializeHeaderSystem === 'function') {
          window.initializeHeaderSystem();
        } else if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
          window.HeaderSystem.initialize();
        } else {
          if (window.Logger?.warn) {
            window.Logger.warn('⚠️ Header System initialization functions not available', {
              initializeHeaderSystemExists: typeof window.initializeHeaderSystem !== 'undefined',
              HeaderSystemExists: typeof window.HeaderSystem !== 'undefined'
            }, { page: 'header-system' });
          }
        }
      } catch (error) {
        if (window.Logger?.error) {
          window.Logger.error('❌ Error auto-initializing Header System', {
            error: error.message,
            stack: error.stack
          }, { page: 'header-system' });
        } else {
          console.error('❌ Error auto-initializing Header System:', error);
        }
      }
    }
  };
  
  // Initialize when DOM is ready
  // Use longer delay to ensure UnifiedAppInitializer has time to initialize first
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait 1 second after DOMContentLoaded to allow UnifiedAppInitializer to start
      setTimeout(ensureHeaderInitialized, 1000);
    });
  } else {
    // DOM is already loaded, wait longer to allow other systems to initialize first
    setTimeout(ensureHeaderInitialized, 1500);
  }
})();

