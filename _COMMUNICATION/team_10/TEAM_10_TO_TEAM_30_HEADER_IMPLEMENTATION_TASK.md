# 📋 הודעה: משימת מימוש - Header Loader + Phoenix Dynamic Bridge

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECT DECISION**  
**עדיפות:** 🔴 **CRITICAL - ARCHITECTURAL IMPLEMENTATION**

---

## 📢 החלטה אדריכלית התקבלה

**מקור:** Chief Architect (Gemini)  
**תאריך:** 2026-02-03  
**סטטוס:** ✅ **APPROVED - READY FOR IMPLEMENTATION**

**החלטה:** מימוש Header Loader דומה ל-Footer Loader + Phoenix Dynamic Bridge (v2.0) לפתרון פילטר גלובלי.

**מפרט מלא:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`

---

## 📡 מפרט טכני: Phoenix Dynamic Bridge (v2.0)

**סטטוס:** 🔒 LOCKED | **הקשר:** D16/D18/D21 Navigation

### **1. אחידות התשתית (Loader Pattern)**
ה-Header יוטען בדיוק כמו הפוטר באמצעות `header-loader.js`. המטרה: אפס למידה לצוות 30.

### **2. הזרקת נתונים דינמיים (Dynamic Data Injection)**
כדי לאכלס את רשימת חשבונות המסחר בתוך הפילטר ב-Header:
1. **The Registry:** ה-Bridge מחזיק אובייקט גלובלי `window.PhoenixBridge`.
2. **React Side:** ברגע שרכיב ה-App מקבל חשבונות מה-API, הוא קורא ל-`window.PhoenixBridge.updateOptions('accounts', data)`.
3. **Vanilla Side:** ה-Header מקשיב לשינוי ומייצר אלמנטים של `<li>` בתוך ה-Dropdown של הפילטר דינמית.

### **3. שמירת מצב (State & Persistence)**
* **URL First:** כל שינוי פילטר מעדכן את ה-URL Params (למשל `?account_id=123`).
* **Session Cache:** ה-Bridge שומר את המצב האחרון ב-`sessionStorage`.
* **Cross-Page:** במעבר בין עמודי HTML (למשל מ-D16 ל-D21), ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.

**מפרט מלא:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`

---

## 🎯 מטרה

**מימוש Header מרכזי** דומה ל-Footer Loader שכבר עובד, עם פתרון לפילטר גלובלי דרך Phoenix Dynamic Bridge.

**יתרונות:**
- ✅ מקור אמת יחיד (SSOT) לתפריט
- ✅ עדכון במקום אחד משפיע על כל העמודים
- ✅ פתרון לפילטר גלובלי (Dynamic Data Injection)
- ✅ שמירת מצב (URL + Session Storage)
- ✅ אפס למידה - דומה ל-Footer Loader

---

## ✅ משימות לביצוע

### **1. יצירת קובץ unified-header.html** 🔴 **CRITICAL**

**מיקום:** `ui/src/components/core/unified-header.html`

**תכונות:**
- HTML מלא של Header (Navigation + Global Filter)
- מבנה זהה ל-Header ב-`D16_ACCTS_VIEW.html` (שורות 35-264)
- כולל: Navigation Menu, Dropdowns, Utils, Logo, Global Filter

**מבנה:**
```html
<!--
  Phoenix-Header-Ver: v1.0.0 | Modular Header Component
  Sync-Time: 2026-02-03 00:00:00 IST
  Team: Team 31 (Shared Components)
  Status: ✅ MODULAR HEADER - SINGLE SOURCE OF TRUTH
  Compliance: RTL Charter ✅ | DNA Sync ✅ | LEGO System ✅ | CSS Standards Protocol ✅
  
  Purpose:
  This is the modular header component - single source of truth for all header content.
  Loaded dynamically via header-loader.js into all pages.
  
  IMPORTANT:
  - All header content updates MUST be done ONLY in this file
  - CSS styles are in phoenix-header.css
  - JavaScript handlers are in header-dropdown.js and header-filters.js
  - Global Filter integration via Phoenix Dynamic Bridge (v2.0)
  - This file must pass G-Bridge validation independently
-->

<header id="unified-header">
  <div class="header-content">
    <!-- Row 1: Navigation + Logo -->
    <div class="header-top">
      <div class="header-container">
        <!-- Navigation Menu -->
        <div class="header-nav">
          <nav class="main-nav">
            <ul class="tiktrack-nav-list">
              <!-- Home Link -->
              <!-- 6 Dropdown Menus -->
              <!-- Utils (Mop, Flash, Search) -->
            </ul>
          </nav>
        </div>
        
        <!-- Logo Section -->
        <div class="logo-section">
          <!-- Logo -->
        </div>
      </div>
    </div>
    
    <!-- Row 2: Global Filter -->
    <div class="header-filters">
      <div class="filters-container">
        <!-- Filter Groups -->
        <!-- Filter Actions -->
      </div>
      
      <!-- Filter Toggle -->
      <div class="filter-toggle-section filter-toggle-main">
        <button class="header-filter-toggle-btn js-filter-toggle-btn" id="headerFilterToggleBtnMain">
          <span class="header-filter-arrow">▲</span>
        </button>
      </div>
    </div>
  </div>
</header>
```

**מקור:** העתק מ-`D16_ACCTS_VIEW.html` (שורות 35-264)

---

### **2. יצירת קובץ header-loader.js** 🔴 **CRITICAL**

**מיקום:** `ui/src/components/core/header-loader.js`

**תכונות:**
- טעינת `unified-header.html` דינמית
- הזרקה ל-`<body>` לפני `.page-wrapper`
- מניעת כפילויות (בודק אם Header כבר קיים)
- טעינת JavaScript handlers (`header-dropdown.js`, `header-filters.js`)

**מבנה (דומה ל-footer-loader.js):**
```javascript
/**
 * Phoenix-Header-Loader-Ver: v1.0.0 | Modular Header Loader
 * Sync-Time: 2026-02-03 00:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ MODULAR HEADER LOADER
 * 
 * Purpose:
 * Dynamically loads unified-header.html into all pages.
 * All pages now use unified structure: header > .page-wrapper > .page-container > main
 * Header is injected at the beginning of <body> (before .page-wrapper)
 * 
 * Usage:
 * Add <script src="./header-loader.js"></script> in <head> or before closing </body> tag.
 */

(function loadHeader() {
  'use strict';
  
  // Wait for DOM to be ready
  function initHeader() {
    // Check if header already exists (prevent duplicate)
    if (document.querySelector('header#unified-header')) {
      console.warn('Phoenix Header Loader: Header already exists. Skipping load.');
      return;
    }
    
    // Load unified-header.html
    fetch('./unified-header.html')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Parse HTML and inject header
        // ... (דומה ל-footer-loader.js)
        
        // Initialize JavaScript handlers
        // Load header-dropdown.js and header-filters.js if not already loaded
      })
      .catch(error => {
        console.error('Phoenix Header Loader: Failed to load unified-header.html', error);
      });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
```

**דוגמה:** העתק מ-`footer-loader.js` והתאם ל-Header

---

### **3. יצירת קובץ phoenix-filter-bridge.js** 🔴 **CRITICAL**

**מיקום:** `ui/src/components/core/phoenix-filter-bridge.js`

**תכונות:**
- **The Registry:** אובייקט גלובלי `window.PhoenixBridge`
- **Dynamic Data Injection:** `updateOptions(key, data)` - עדכון אפשרויות פילטרים
- **URL Sync:** `syncWithUrl()` - סנכרון פילטרים עם URL Params
- **Session Storage:** שמירת מצב ב-`sessionStorage`
- **Cross-Page:** טעינת מצב במעבר בין עמודים

**מבנה:**
```javascript
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
 * Add <script src="./phoenix-filter-bridge.js"></script> before header-loader.js
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
     * Vanilla Side: ה-Header מקשיב לשינוי ומייצר אלמנטים של `<li>` בתוך ה-Dropdown של הפילטר דינמית.
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
     * Vanilla Side: ה-Header מקשיב לשינוי ומייצר אלמנטים של `<li>` בתוך ה-Dropdown של הפילטר דינמית.
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
              item.dataset.value = account.id;
              item.innerHTML = `<span class="option-text">${account.name}</span>`;
              
              // Add click handler
              item.addEventListener('click', function() {
                window.PhoenixBridge.state.filters.tradingAccount = account.id;
                window.PhoenixBridge.updateUrlFromFilters();
                window.PhoenixBridge.applyFiltersToUI();
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
      // ... עוד פילטרים (status, investmentType, dateRange, search)
    },
    
    /**
     * syncWithUrl - סנכרון פילטרים עם URL Params
     * 
     * @description
     * URL First: כל שינוי פילטר מעדכן את ה-URL Params (למשל `?account_id=123`).
     * Cross-Page: במעבר בין עמודי HTML (למשל מ-D16 ל-D21), ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.
     * 
     * @example
     * // URL: /financial/D16_ACCTS_VIEW.html?account_id=123&status=active
     * window.PhoenixBridge.syncWithUrl();
     * // פילטרים נטענים מה-URL ומחלים על UI
     */
    syncWithUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Load filters from URL
      if (urlParams.has('account_id')) {
        this.state.filters.tradingAccount = urlParams.get('account_id');
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
      url.searchParams.delete('status');
      url.searchParams.delete('investment_type');
      url.searchParams.delete('date_from');
      url.searchParams.delete('date_to');
      url.searchParams.delete('search');
      
      // Add active filters
      if (this.state.filters.tradingAccount) {
        url.searchParams.set('account_id', this.state.filters.tradingAccount);
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
      Object.keys(this.state.filters).forEach(key => {
        const value = this.state.filters[key];
        if (value) {
          // Update filter UI
          const filterElement = document.querySelector(`[data-filter-type="${key}"]`);
          if (filterElement) {
            const selectedValue = filterElement.querySelector('.selected-value');
            if (selectedValue) {
              selectedValue.textContent = value;
            }
          }
        }
      });
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
          // Merge with current state (don't overwrite URL params)
          this.state.filters = {
            ...this.state.filters,
            ...parsedFilters
          };
          this.applyFiltersToUI();
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
      sessionStorage.setItem('phoenix-filters', JSON.stringify(this.state.filters));
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
      this.state.filters[key] = value;
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
      
      // Dispatch Custom Event
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { filters: { ...this.state.filters } }
      }));
    }
  };
  
  // Initialize: Load from URL and Storage
  // Cross-Page: במעבר בין עמודי HTML, ה-Bridge טוען את המצב מה-Storage ומחיל אותו על ה-Header עוד לפני שה-React נטען.
  function initBridge() {
    // Sync with URL first (URL First strategy)
    window.PhoenixBridge.syncWithUrl();
    
    // Then load from storage (if URL doesn't have params)
    if (!window.location.search) {
      window.PhoenixBridge.loadFromStorage();
    }
    
    // Connect filter UI to Bridge
    document.querySelectorAll('.js-filter-item').forEach(item => {
      item.addEventListener('click', function() {
        const filterType = this.closest('.filter-group').querySelector('.js-filter-toggle')?.dataset.filterType;
        const value = this.dataset.value === 'הכול' ? null : this.dataset.value;
        if (filterType) {
          window.PhoenixBridge.setFilter(filterType, value);
        }
      });
    });
    
    // Connect reset/clear buttons
    document.querySelector('.js-filter-reset')?.addEventListener('click', () => {
      window.PhoenixBridge.clearFilters();
    });
    
    document.querySelector('.js-filter-clear')?.addEventListener('click', () => {
      window.PhoenixBridge.clearFilters();
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBridge);
  } else {
    initBridge();
  }
})();
```

---

### **4. עדכון עמודי HTML** 🔴 **CRITICAL**

**עמודים שצריך לעדכן:**
- `ui/src/views/financial/D16_ACCTS_VIEW.html`
- `ui/src/views/financial/D18_BRKRS_VIEW.html`
- `ui/src/views/financial/D21_CASH_VIEW.html`
- כל עמוד HTML אחר במערכת

**פעולות לכל עמוד:**

1. **הסרת Header מוטמע:**
   - הסרת כל קוד Header מוטמע (שורות 35-264 ב-D16)
   - שמירה על מבנה העמוד (לא לשבור את המבנה)

2. **הוספת Header Loader:**
   ```html
   <!DOCTYPE html>
   <html lang="he" dir="rtl">
   <head>
     <!-- CSS Loading Order -->
     <!-- ... -->
   </head>
   <body class="trading-accounts-page context-trading">
     
     <!-- Header will be loaded dynamically via header-loader.js -->
     <script src="./phoenix-filter-bridge.js"></script>
     <script src="./header-loader.js"></script>
     
     <!-- Page Wrapper + Container Structure -->
     <div class="page-wrapper">
       <!-- ... תוכן העמוד ... -->
     </div>
     
     <!-- Footer -->
     <script src="footer-loader.js"></script>
   </body>
   </html>
   ```

---

### **5. אינטגרציה עם React** 🔴 **CRITICAL**

**React Side: עדכון Bridge כאשר נתונים נטענים מה-API**

**דוגמה: כאשר חשבונות נטענים מה-API:**
```javascript
// ב-React Components (למשל D16_ACCTS_VIEW)
import { useEffect } from 'react';

function TradingAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  
  // Load accounts from API
  useEffect(() => {
    fetch('/api/v1/trading_accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(data.items);
        
        // React Side: ברגע שרכיב ה-App מקבל חשבונות מה-API, הוא קורא ל-`window.PhoenixBridge.updateOptions('accounts', data)`
        if (window.PhoenixBridge && data.items.length > 0) {
          window.PhoenixBridge.updateOptions('accounts', data.items.map(acc => ({
            id: acc.id,
            name: acc.name
          })));
        }
      });
  }, []);
  
  // Listen to filter changes from Bridge
  useEffect(() => {
    const handleFilterChange = (e) => {
      // Sync with PhoenixFilterContext if needed
      const { key, value } = e.detail;
      // Update React state or Context
    };
    
    window.addEventListener('phoenix-filter-change', handleFilterChange);
    return () => window.removeEventListener('phoenix-filter-change', handleFilterChange);
  }, []);
  
  return (
    // ... component JSX
  );
}
```

**סנכרון עם PhoenixFilterContext (אם נדרש):**
```javascript
// ב-React Components שמשתמשים ב-PhoenixFilterContext
import { usePhoenixFilter } from '../cubes/shared/contexts/PhoenixFilterContext.jsx';

function SomeComponent() {
  const { filters, setFilter } = usePhoenixFilter();
  
  // Sync Bridge filters with Context
  useEffect(() => {
    const handleFilterChange = (e) => {
      const { key, value } = e.detail;
      if (key && value !== undefined) {
        setFilter(key, value);
      }
    };
    
    window.addEventListener('phoenix-filter-change', handleFilterChange);
    return () => window.removeEventListener('phoenix-filter-change', handleFilterChange);
  }, [setFilter]);
  
  // Update Bridge when Context changes (if needed)
  useEffect(() => {
    if (window.PhoenixBridge) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== window.PhoenixBridge.state.filters[key]) {
          window.PhoenixBridge.setFilter(key, filters[key]);
        }
      });
    }
  }, [filters]);
}
```

---

## 📋 Checklist לביצוע

### **Team 30 (Frontend Execution):**

- [ ] יצירת `ui/src/components/core/unified-header.html`
  - [ ] העתקת Header מ-`D16_ACCTS_VIEW.html` (שורות 35-264)
  - [ ] וידוא שהמבנה נכון (`<header id="unified-header">`)
  - [ ] הוספת הערות ותיעוד

- [ ] יצירת `ui/src/components/core/header-loader.js`
  - [ ] טעינת `unified-header.html` דינמית
  - [ ] הזרקה ל-`<body>` לפני `.page-wrapper`
  - [ ] מניעת כפילויות
  - [ ] טעינת JavaScript handlers

- [ ] יצירת `ui/src/components/core/phoenix-filter-bridge.js`
  - [ ] אובייקט גלובלי `window.PhoenixBridge`
  - [ ] פונקציה `updateOptions(key, data)`
  - [ ] פונקציה `syncWithUrl()`
  - [ ] שמירת מצב ב-`sessionStorage`
  - [ ] טעינת מצב מ-`sessionStorage`
  - [ ] עדכון UI דינמי

- [ ] עדכון `D16_ACCTS_VIEW.html`:
  - [ ] הסרת Header מוטמע (שורות 35-264)
  - [ ] הוספת `phoenix-filter-bridge.js`
  - [ ] הוספת `header-loader.js`

- [ ] עדכון `D18_BRKRS_VIEW.html`:
  - [ ] הסרת Header מוטמע (אם קיים)
  - [ ] הוספת `phoenix-filter-bridge.js`
  - [ ] הוספת `header-loader.js`

- [ ] עדכון `D21_CASH_VIEW.html`:
  - [ ] הסרת Header מוטמע (אם קיים)
  - [ ] הוספת `phoenix-filter-bridge.js`
  - [ ] הוספת `header-loader.js`

- [ ] בדיקת עקביות בין כל העמודים

---

## 🔗 קישורים רלוונטיים

**החלטה אדריכלית:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`

**דוח מקורי:**
- `TEAM_30_TO_TEAM_10_HEADER_ARCHITECTURE_CRITICAL_ISSUE.md`

**הודעה לאדריכל:**
- `TEAM_10_TO_ARCHITECT_HEADER_ARCHITECTURE_DECISION.md`

**דוגמה לפתרון דומה:**
- `ui/src/views/financial/footer-loader.js` - דוגמה לפתרון דומה ✅
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md` - החלטה אדריכלית Footer

**קבצים רלוונטיים:**
- `ui/src/views/financial/D16_ACCTS_VIEW.html` - Header מוטמע (שורות 35-264) - מקור להעתקה
- `ui/src/views/financial/header-dropdown.js` - JavaScript handlers קיימים
- `ui/src/views/financial/header-filters.js` - JavaScript handlers קיימים

---

## ⚠️ הערות חשובות

1. **אפס למידה:** הפתרון דומה ל-Footer Loader שכבר עובד
2. **Dynamic Data Injection:** `window.PhoenixBridge.updateOptions()` מאפשר עדכון דינמי של פילטרים
3. **State Persistence:** URL + Session Storage לשמירת מצב
4. **Cross-Page:** מצב נשמר במעבר בין עמודים
5. **Clean Slate Rule:** כל ה-JavaScript חיצוני - אין inline scripts

---

## 📅 צעדים הבאים

1. ⏳ **Team 30:** ביצוע המימוש (3 קבצים חדשים + עדכון עמודים)
2. ⏳ **Team 50:** בדיקת עקביות בין כל העמודים
3. ⏳ **Team 10:** עדכון האדריכלית אחרי הביצוע

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECT DECISION APPROVED - READY FOR IMPLEMENTATION**

**log_entry | [Team 10] | HEADER_IMPLEMENTATION | ARCHITECT_DECISION_APPROVED | READY | 2026-02-03**
