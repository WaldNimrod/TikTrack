/**
 * Phoenix-Filter-Bridge-Ver: v2.0.0 | Dynamic Bridge for Header Filters
 * Sync-Time: 2026-02-03 00:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ PHOENIX DYNAMIC BRIDGE V2.0
 * 
 * Purpose:
 * Bridge between React (PhoenixFilterContext) and Vanilla JS (Header HTML).
 * Enables dynamic data injection and state persistence for global filters.
 * 
 * Features:
 * - Dynamic Data Injection: updateOptions(key, data)
 * - URL Sync: syncWithUrl()
 * - Session Storage: State persistence
 * - Cross-Page: State loading on page navigation
 * 
 * Usage:
 * Add <script src="./phoenixFilterBridge.js"></script> before headerLoader.js
 */

(function initPhoenixBridge() {
  'use strict';
  
  // The Registry: Global Bridge Object
  window.PhoenixBridge = {
    // State storage
    state: {
      accounts: [],
      filters: {
        status: null,
        investmentType: null,
        tradingAccount: null,
        dateRange: { from: null, to: null },
        search: ''
      }
    },
    
    /**
     * updateOptions - עדכון אפשרויות פילטרים
     * 
     * @description
     * React Side: ברגע שרכיב ה-App מקבל חשבונות מה-API, הוא קורא ל-`window.PhoenixBridge.updateOptions('accounts', data)`.
     * Vanilla Side: ה-Header מקשיב לשינוי ומייצר אלמנטים של `<div>` בתוך ה-Dropdown של הפילטר דינמית.
     * 
     * @param {string} key - מפתח הפילטר (accounts, status, etc.)
     * @param {Array|Object} data - נתונים לעדכון
     * 
     * @example
     * // React Side: כאשר חשבונות נטענים מה-API
     * useEffect(() => {
     *   if (accounts.length > 0) {
     *     window.PhoenixBridge?.updateOptions('accounts', accounts);
     *   }
     * }, [accounts]);
     * 
     * @example
     * // Data format:
     * window.PhoenixBridge.updateOptions('accounts', [
     *   { id: '1', name: 'חשבון מסחר מרכזי' },
     *   { id: '2', name: 'חשבון גידור' }
     * ]);
     */
    updateOptions(key, data) {
      this.state[key] = data;
      
      // Update UI dynamically
      this.updateFilterUI(key, data);
      
      // Dispatch Custom Event
      window.dispatchEvent(new CustomEvent('phoenix-bridge-update', {
        detail: { key, data }
      }));
    },
    
    /**
     * updateFilterUI - עדכון UI של פילטר
     * 
     * @description
     * Vanilla Side: ה-Header מקשיב לשינוי ומייצר אלמנטים של `<div>` בתוך ה-Dropdown של הפילטר דינמית.
     * 
     * @param {string} key - מפתח הפילטר
     * @param {Array|Object} data - נתונים לעדכון
     */
    updateFilterUI(key, data) {
      if (key === 'accounts') {
        // Update account filter dropdown
        const accountMenu = document.querySelector('#accountFilterMenu');
        if (accountMenu) {
          // Clear existing options (except "הכול")
          const existingItems = accountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])');
          existingItems.forEach(item => item.remove());
          
          // Add new options dynamically
          if (Array.isArray(data)) {
            data.forEach(account => {
              const item = document.createElement('div');
              item.className = 'account-filter-item js-filter-item';
              item.dataset.value = account.id || account.externalUlid || account.name;
              item.innerHTML = `<span class="option-text">${account.name || account.displayName || account.id}</span>`;
              
              // Add click handler
              item.addEventListener('click', () => {
                const accountId = account.id || account.externalUlid || account.name;
                this.setFilter('tradingAccount', accountId);
              });
              
              // Insert before close button
              const closeBtn = accountMenu.querySelector('.filter-close-btn');
              if (closeBtn) {
                accountMenu.insertBefore(item, closeBtn);
              } else {
                accountMenu.appendChild(item);
              }
            });
          }
        }
      }
      // Additional filters can be added here (status, investmentType, dateRange, search)
    },
    
    /**
     * syncWithUrl - סנכרון פילטרים עם URL Params
     * 
     * @description
     * URL First: כל שינוי פילטר מעדכן את ה-URL Params (למשל `?account_id=123`).
     * Cross-Page: במעבר בין עמודי HTML (למשל מ-Trading Accounts ל-Brokers Fees), ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.
     * 
     * @example
     * // URL: /trading_accounts.html?account_id=123&status=active
     * window.PhoenixBridge.syncWithUrl();
     * // פילטרים נטענים מה-URL ומחלים על UI
     */
    syncWithUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Load filters from URL
      if (urlParams.has('account_id') || urlParams.has('trading_account_id')) {
        this.state.filters.tradingAccount = urlParams.get('account_id') || urlParams.get('trading_account_id');
      }
      if (urlParams.has('status')) {
        this.state.filters.status = urlParams.get('status');
      }
      if (urlParams.has('investment_type')) {
        this.state.filters.investmentType = urlParams.get('investment_type');
      }
      if (urlParams.has('date_from') && urlParams.has('date_to')) {
        this.state.filters.dateRange = {
          from: urlParams.get('date_from'),
          to: urlParams.get('date_to')
        };
      }
      if (urlParams.has('search')) {
        this.state.filters.search = urlParams.get('search');
      }
      
      // Apply filters to UI
      this.applyFiltersToUI();
      
      // Save to sessionStorage
      this.saveToStorage();
    },
    
    /**
     * updateUrlFromFilters - עדכון URL מ-פילטרים
     * 
     * @description
     * כאשר פילטר משתנה, עדכן את ה-URL Params
     */
    updateUrlFromFilters() {
      const url = new URL(window.location);
      
      // Clear existing filter params
      url.searchParams.delete('account_id');
      url.searchParams.delete('trading_account_id');
      url.searchParams.delete('status');
      url.searchParams.delete('investment_type');
      url.searchParams.delete('date_from');
      url.searchParams.delete('date_to');
      url.searchParams.delete('search');
      
      // Add active filters
      if (this.state.filters.tradingAccount) {
        url.searchParams.set('trading_account_id', this.state.filters.tradingAccount);
      }
      if (this.state.filters.status) {
        url.searchParams.set('status', this.state.filters.status);
      }
      if (this.state.filters.investmentType) {
        url.searchParams.set('investment_type', this.state.filters.investmentType);
      }
      if (this.state.filters.dateRange.from && this.state.filters.dateRange.to) {
        url.searchParams.set('date_from', this.state.filters.dateRange.from);
        url.searchParams.set('date_to', this.state.filters.dateRange.to);
      }
      if (this.state.filters.search) {
        url.searchParams.set('search', this.state.filters.search);
      }
      
      // Update URL without page reload
      window.history.pushState({}, '', url);
    },
    
    /**
     * applyFiltersToUI - החלת פילטרים על UI
     */
    applyFiltersToUI() {
      // Update status filter
      if (this.state.filters.status) {
        const statusElement = document.querySelector('#selectedStatus');
        if (statusElement) {
          statusElement.textContent = this.state.filters.status;
        }
      }
      
      // Update investment type filter
      if (this.state.filters.investmentType) {
        const typeElement = document.querySelector('#selectedType');
        if (typeElement) {
          typeElement.textContent = this.state.filters.investmentType;
        }
      }
      
      // Update trading account filter
      if (this.state.filters.tradingAccount) {
        const accountElement = document.querySelector('#selectedAccount');
        if (accountElement) {
          // Find account name from state.accounts
          const account = this.state.accounts.find(acc => 
            (acc.id || acc.externalUlid || acc.name) === this.state.filters.tradingAccount
          );
          if (account) {
            accountElement.textContent = account.name || account.displayName || account.id;
          } else {
            accountElement.textContent = this.state.filters.tradingAccount;
          }
        }
      }
      
      // Update date range filter
      if (this.state.filters.dateRange.from && this.state.filters.dateRange.to) {
        const dateElement = document.querySelector('#selectedDateRange');
        if (dateElement) {
          dateElement.textContent = `${this.state.filters.dateRange.from} - ${this.state.filters.dateRange.to}`;
        }
      }
      
      // Update search filter
      if (this.state.filters.search) {
        const searchInput = document.querySelector('#searchFilterInput');
        if (searchInput) {
          searchInput.value = this.state.filters.search;
        }
      }
    },
    
    /**
     * loadFromStorage - טעינת מצב מ-Session Storage
     * 
     * @description
     * Session Cache: ה-Bridge שומר את המצב האחרון ב-`sessionStorage`.
     * Cross-Page: במעבר בין עמודי HTML, ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.
     */
    loadFromStorage() {
      const stored = sessionStorage.getItem('phoenix-filters');
      if (stored) {
        try {
          const parsedFilters = JSON.parse(stored);
          // Merge with current state (don't overwrite URL params if they exist)
          if (!window.location.search) {
            this.state.filters = {
              ...this.state.filters,
              ...parsedFilters
            };
            this.applyFiltersToUI();
          }
        } catch (e) {
          console.error('Phoenix Bridge: Failed to load filters from storage', e);
        }
      }
    },
    
    /**
     * saveToStorage - שמירת מצב ל-Session Storage
     * 
     * @description
     * Session Cache: ה-Bridge שומר את המצב האחרון ב-`sessionStorage`.
     */
    saveToStorage() {
      try {
        sessionStorage.setItem('phoenix-filters', JSON.stringify(this.state.filters));
      } catch (e) {
        console.error('Phoenix Bridge: Failed to save filters to storage', e);
      }
    },
    
    /**
     * setFilter - עדכון פילטר ספציפי
     * 
     * @description
     * עדכון פילטר יחיד + עדכון URL + שמירה ב-Storage
     * 
     * @param {string} key - מפתח הפילטר
     * @param {any} value - ערך הפילטר
     */
    setFilter(key, value) {
      if (key === 'dateRange' && typeof value === 'object') {
        this.state.filters.dateRange = value;
      } else {
        this.state.filters[key] = value;
      }
      
      this.updateUrlFromFilters();
      this.saveToStorage();
      this.applyFiltersToUI();
      
      // Dispatch Custom Event
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { key, value, filters: { ...this.state.filters } }
      }));
    },
    
    /**
     * clearFilters - איפוס כל הפילטרים
     * 
     * @description
     * איפוס כל הפילטרים + עדכון URL + שמירה ב-Storage
     */
    clearFilters() {
      this.state.filters = {
        status: null,
        investmentType: null,
        tradingAccount: null,
        dateRange: { from: null, to: null },
        search: ''
      };
      this.updateUrlFromFilters();
      this.saveToStorage();
      this.applyFiltersToUI();
      
      // Reset UI elements
      const statusElement = document.querySelector('#selectedStatus');
      if (statusElement) statusElement.textContent = 'כל סטטוס';
      
      const typeElement = document.querySelector('#selectedType');
      if (typeElement) typeElement.textContent = 'כל סוג השקעה';
      
      const accountElement = document.querySelector('#selectedAccount');
      if (accountElement) accountElement.textContent = 'כל חשבון מסחר';
      
      const dateElement = document.querySelector('#selectedDateRange');
      if (dateElement) dateElement.textContent = 'כל זמן';
      
      const searchInput = document.querySelector('#searchFilterInput');
      if (searchInput) searchInput.value = '';
      
      // Dispatch Custom Event
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { filters: { ...this.state.filters } }
      }));
    }
  };
  
  /**
   * Initialize Bridge: Load from URL and Storage
   * Cross-Page: במעבר בין עמודי HTML, ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.
   */
  function initBridge() {
    // Wait for header to be loaded
    function waitForHeader() {
      const header = document.querySelector('header#unified-header');
      if (!header) {
        setTimeout(waitForHeader, 100);
        return;
      }
      
      // Sync with URL first (URL First strategy)
      window.PhoenixBridge.syncWithUrl();
      
      // Then load from storage (if URL doesn't have params)
      if (!window.location.search) {
        window.PhoenixBridge.loadFromStorage();
      }
      
      // Connect filter UI to Bridge
      setTimeout(() => {
        document.querySelectorAll('.js-filter-item').forEach(item => {
          // Remove existing listeners to avoid duplicates
          const newItem = item.cloneNode(true);
          item.parentNode.replaceChild(newItem, item);
          
          newItem.addEventListener('click', function() {
            const filterGroup = this.closest('.filter-group');
            const filterToggle = filterGroup?.querySelector('.js-filter-toggle');
            const filterType = filterToggle?.dataset.filterType;
            const value = this.dataset.value === 'הכול' ? null : this.dataset.value;
            
            if (filterType) {
              window.PhoenixBridge.setFilter(filterType, value);
            }
          });
        });
        
        // Connect search input
        const searchInput = document.querySelector('#searchFilterInput');
        if (searchInput) {
          searchInput.addEventListener('input', function() {
            window.PhoenixBridge.setFilter('search', this.value);
          });
        }
        
        // Connect reset/clear buttons
        document.querySelector('.js-filter-reset')?.addEventListener('click', () => {
          window.PhoenixBridge.clearFilters();
        });
        
        document.querySelector('.js-filter-clear')?.addEventListener('click', () => {
          window.PhoenixBridge.clearFilters();
        });
      }, 200);
    }
    
    waitForHeader();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBridge);
  } else {
    initBridge();
  }
})();
