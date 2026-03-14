/**
 * Phoenix-Filter-Bridge-Ver: v1.0.0 | Dynamic Bridge for Header Filters
 * Sync-Time: 2026-02-03 00:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ PHOENIX DYNAMIC BRIDGE v1.0 (ADR-017: UI 1.0.0)
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
 * - Status filter: SSOT via statusAdapter (toCanonicalStatus, toHebrewStatus)
 *
 * Usage:
 * <script type="module" src="./phoenixFilterBridge.js"></script> before headerLoader.js
 */

import {
  normalizeToCanonicalStatus,
  toHebrewStatus,
} from '../../utils/statusAdapter.js';

/**
 * Validate ULID format
 * ULID format: 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid ULID
 */
function isValidULID(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  // ULID is 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
  return ulidRegex.test(value);
}

/**
 * Normalize tradingAccount filter - only send ULID if valid
 * @param {any} value - Filter value
 * @returns {string|null} Valid ULID or null
 */
function normalizeTradingAccount(value) {
  if (!value) {
    return null;
  }
  // If value is "הכול" or empty string, return null
  if (
    value === 'הכול' ||
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }
  // If value is a valid ULID, return it
  if (isValidULID(value)) {
    return value;
  }
  // Otherwise, return null (don't send invalid values)
  return null;
}

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
      search: '',
    },
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
    window.dispatchEvent(
      new CustomEvent('phoenix-bridge-update', {
        detail: { key, data },
      }),
    );
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
        const existingItems = accountMenu.querySelectorAll(
          '.account-filter-item:not([data-value="הכול"])',
        );
        existingItems.forEach((item) => item.remove());

        // Add new options dynamically
        if (Array.isArray(data)) {
          data.forEach((account) => {
            const item = document.createElement('div');
            item.className = 'account-filter-item js-filter-item';
            item.dataset.value =
              account.id || account.externalUlid || account.name;
            item.innerHTML = `<span class="option-text">${account.name || account.displayName || account.id}</span>`;

            // Add click handler
            item.addEventListener('click', () => {
              const accountId =
                account.id || account.externalUlid || account.name;
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
    // Gate B Fix: Normalize tradingAccount from URL - only store if valid ULID
    if (urlParams.has('account_id') || urlParams.has('trading_account_id')) {
      const rawTradingAccount =
        urlParams.get('account_id') || urlParams.get('trading_account_id');
      this.state.filters.tradingAccount =
        normalizeTradingAccount(rawTradingAccount);
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
        to: urlParams.get('date_to'),
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
   * Normalizes tradingAccount to ULID only - removes invalid values
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

    // Normalize tradingAccount - only send if valid ULID
    const normalizedTradingAccount = normalizeTradingAccount(
      this.state.filters.tradingAccount,
    );
    if (normalizedTradingAccount) {
      url.searchParams.set('trading_account_id', normalizedTradingAccount);
    }

    // Gate B Fix: Only set non-empty values to avoid sending empty strings
    if (
      this.state.filters.status &&
      String(this.state.filters.status).trim() !== ''
    ) {
      url.searchParams.set('status', this.state.filters.status);
    }
    if (
      this.state.filters.investmentType &&
      String(this.state.filters.investmentType).trim() !== ''
    ) {
      url.searchParams.set(
        'investment_type',
        this.state.filters.investmentType,
      );
    }
    if (
      this.state.filters.dateRange &&
      this.state.filters.dateRange.from &&
      this.state.filters.dateRange.to
    ) {
      const dateFrom = String(this.state.filters.dateRange.from).trim();
      const dateTo = String(this.state.filters.dateRange.to).trim();
      if (dateFrom !== '' && dateTo !== '') {
        url.searchParams.set('date_from', dateFrom);
        url.searchParams.set('date_to', dateTo);
      }
    }
    // Gate B Fix: Only set search if it's not empty
    if (
      this.state.filters.search &&
      String(this.state.filters.search).trim() !== ''
    ) {
      url.searchParams.set('search', this.state.filters.search.trim());
    }

    // Update URL without page reload
    window.history.pushState({}, '', url);
  },

  /**
   * applyFiltersToUI - החלת פילטרים על UI
   */
  applyFiltersToUI() {
    // Update status filter (SSOT: display via toHebrewStatus)
    if (this.state.filters.status) {
      const statusElement = document.querySelector('#selectedStatus');
      if (statusElement) {
        statusElement.textContent = toHebrewStatus(this.state.filters.status);
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
        const account = this.state.accounts.find(
          (acc) =>
            (acc.id || acc.externalUlid || acc.name) ===
            this.state.filters.tradingAccount,
        );
        if (account) {
          accountElement.textContent =
            account.name || account.displayName || account.id;
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
            ...parsedFilters,
          };
          this.applyFiltersToUI();
        }
      } catch (e) {
        window.maskedLog?.(
          'Phoenix Bridge: Failed to load filters from storage',
          { message: e?.message },
        );
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
      sessionStorage.setItem(
        'phoenix-filters',
        JSON.stringify(this.state.filters),
      );
    } catch (e) {
      window.maskedLog?.('Phoenix Bridge: Failed to save filters to storage', {
        message: e?.message,
      });
    }
  },

  /**
   * setFilter - עדכון פילטר ספציפי
   *
   * @description
   * עדכון פילטר יחיד + עדכון URL + שמירה ב-Storage
   * Normalizes tradingAccount to ULID only - removes invalid values
   *
   * @param {string} key - מפתח הפילטר
   * @param {any} value - ערך הפילטר
   */
  setFilter(key, value) {
    if (key === 'dateRange' && typeof value === 'object') {
      this.state.filters.dateRange = value;
    } else if (key === 'tradingAccount') {
      // Normalize tradingAccount - only store valid ULID
      this.state.filters.tradingAccount = normalizeTradingAccount(value);
    } else if (key === 'search') {
      // Gate B Fix: Normalize search - don't store empty strings
      const trimmedValue = String(value || '').trim();
      this.state.filters.search = trimmedValue !== '' ? trimmedValue : '';
    } else if (key === 'status') {
      // SSOT: Normalize Hebrew or canonical to canonical (active/inactive/pending/cancelled)
      this.state.filters.status = normalizeToCanonicalStatus(value);
    } else {
      // Gate B Fix: Normalize string values - don't store empty strings
      if (typeof value === 'string' && value.trim() === '') {
        this.state.filters[key] = '';
      } else {
        this.state.filters[key] = value;
      }
    }

    this.updateUrlFromFilters();
    this.saveToStorage();
    this.applyFiltersToUI();

    // Dispatch Custom Event with normalized filters
    const normalizedFilters = { ...this.state.filters };
    if (key === 'tradingAccount') {
      normalizedFilters.tradingAccount = normalizeTradingAccount(value);
    }
    window.dispatchEvent(
      new CustomEvent('phoenix-filter-change', {
        detail: { key, value, filters: normalizedFilters },
      }),
    );
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
      search: '',
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
    window.dispatchEvent(
      new CustomEvent('phoenix-filter-change', {
        detail: { filters: { ...this.state.filters } },
      }),
    );
  },
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
      document.querySelectorAll('.js-filter-item').forEach((item) => {
        // Remove existing listeners to avoid duplicates
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        newItem.addEventListener('click', function () {
          const filterGroup = this.closest('.filter-group');
          const filterToggle = filterGroup?.querySelector('.js-filter-toggle');
          const filterType = filterToggle?.dataset.filterType;
          const value =
            this.dataset.value === 'הכול' ? null : this.dataset.value;

          if (filterType) {
            window.PhoenixBridge.setFilter(filterType, value);
          }
        });
      });

      // Connect search input
      const searchInput = document.querySelector('#searchFilterInput');
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          window.PhoenixBridge.setFilter('search', this.value);
        });
      }

      // Connect reset/clear buttons
      document
        .querySelector('.js-filter-reset')
        ?.addEventListener('click', () => {
          window.PhoenixBridge.clearFilters();
        });

      document
        .querySelector('.js-filter-clear')
        ?.addEventListener('click', () => {
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
