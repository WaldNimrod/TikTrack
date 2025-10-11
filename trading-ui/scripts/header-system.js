/**
 * Header System - TikTrack Frontend - v6.0.0 - New Architecture with Old Interface
 * ==================================
 *
 * Header System JS loading...
 *
 * Unified header element with menu, logo, and smart filtering system
 *
 * Features:
 * - Logo and title display
 * - Navigation menu
 * - Unified filter system that adapts to each table
 * - Consistent design across all pages
 * - Dynamic filter text updates
 * - Responsive design and mobile support
 *
 * Architecture:
 * - New modular architecture with old interface
 * - Event-driven communication with pages
 * - Modular filter system
 *
 * ⚠️ IMPORTANT: This file contains ONLY filter-related toggle functions!
 * - toggleHeaderFilters() - Main filter panel toggle
 * - toggleStatusFilterMenu() - Status filter dropdown
 * - toggleTypeFilterMenu() - Type filter dropdown  
 * - toggleAccountFilterMenu() - Account filter dropdown
 * - toggleDateRangeFilterMenu() - Date range filter dropdown
 * 
 * General section toggle functions are handled by ui-utils.js
 *
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * - CSS: header-system.css
 *
 * @author TikTrack Development Team
 * @version 6.0.0
 * @lastUpdated January 15, 2025
 */

console.log('🚀 Loading Header System v6.0.0...');

/**
 * מערכת ראש דף מאוחדת עם פילטרים
 * כוללת את כל הפונקציונליות של הפילטרים
 */
class HeaderSystem {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      return;
    }

    // יצירת אלמנט הכותרת
    HeaderSystem.createHeader();
    
    // טעינת חשבונות לפילטר - עם עיכוב קצר לוודא שה-HTML נוצר
    setTimeout(async () => {
      await HeaderSystem.loadAccountsForFilter();
    }, 100);
    
    
    // הגדרת event listeners
    HeaderSystem.setupEventListeners();
    
    // טעינת מצב שמור - יקרא אחרי שמערכת הפילטרים תהיה מוכנה
    // HeaderSystem.loadSavedState();
    
    
    this.isInitialized = true;
  }

  static createHeader() {
    // מציאת או יצירת אלמנט הכותרת
    let headerElement = document.getElementById('unified-header');
    if (!headerElement) {
      headerElement = document.createElement('div');
      headerElement.id = 'unified-header';
      document.body.insertBefore(headerElement, document.body.firstChild);
    }

    // הוספת התוכן לאלמנט
    const headerHTML = HeaderSystem.getHeaderHTML();
    headerElement.innerHTML = headerHTML;
    
    // בדיקה אם הפונקציות מוגדרות
    // console.log('🔧 Checking if filter functions are defined:');
    // console.log('selectStatusOption:', typeof window.selectStatusOption);
    // console.log('updateStatusFilterText:', typeof window.updateStatusFilterText);
    // console.log('applyStatusFilter:', typeof window.applyStatusFilter);
  }

  static getHeaderHTML() {
    return `
        <div class="header-content">
          <!-- אזור לוגו ותפריט -->
          <div class="header-top">
            <div class="header-container">
              <!-- תפריט ניווט -->
              <div class="header-nav">
                <nav class="main-nav">
                  <ul class="tiktrack-nav-list">
                    <li class="tiktrack-nav-item">
                      <a href="/" class="tiktrack-nav-link" data-page="home">
                        <img src="images/icons/home.svg" alt="בית" width="36" height="36" class="nav-icon home-icon-only">
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="/trade_plans" class="tiktrack-nav-link" data-page="trade_plans">
                        <span class="nav-text">תכנון</span>
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="/trades" class="tiktrack-nav-link" data-page="trades">
                        <span class="nav-text">מעקב</span>
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="/research" class="tiktrack-nav-link" data-page="research">
                        <span class="nav-text">מחקר</span>
                      </a>
                    </li>



                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="settings">
                        <span class="nav-text">הגדרות</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/alerts">התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notes">הערות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/trading_accounts">חשבונות מסחר</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tickers">טיקרים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/executions">עסקאות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/preferences">העדפות</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_display">בסיס נתונים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_extradata">טבלאות עזר</a></li>
                      </ul>
                    </li>

                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="development-tools">
                        <span class="nav-text">כלי פיתוח</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <!-- ניהול מערכת -->
                        <li><a class="tiktrack-dropdown-item" href="/system-management">🔧 ניהול מערכת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/external-data-dashboard">📊 דשבורד נתונים חיצוניים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notifications-center">🔔 מרכז התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/background-tasks">⚙️ ניהול משימות ברקע</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/server-monitor">🖥️ ניטור שרת</a></li>
                        
                        <li class="separator"></li>
                        
                        <!-- כלי פיתוח -->
                        <li><a class="tiktrack-dropdown-item" href="/cache-test">🗄️ בדיקת מטמון</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/js-map">🗺️ מפת JS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/linter-realtime-monitor.html">🔍 דשבורד Linter</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/chart-management">📊 ניהול גרפים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/css-management">🎨 מנהל CSS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/crud-testing-dashboard">🧪 בדיקות CRUD</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/constraints">🔒 אילוצים</a></li>
                        
                        <li class="separator"></li>
                        
                        <!-- ממשק משתמש -->
                        <li><a class="tiktrack-dropdown-item" href="/dynamic-colors-display">🌈 צבעים דינמיים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">🧪 בדיקת כותרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">🎭 עיצובים</a></li>


                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <button class="tiktrack-nav-link cache-clear-btn" 
                              onclick="window.clearAllCache()" 
                              title="ניקוי מטמון מלא">
                        <span class="nav-text">🧹</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              <div class="logo-section">
                <div class="logo">
                  <img src="images/logo.svg" alt="TikTrack Logo" class="logo-image">
                  <span class="logo-text">פשוט לנהל תיק</span>
                </div>
              </div>
              
              <!-- כפתור פתיחה/סגירה של הפילטר - בתוך התפריט הראשי -->
              <div class="filter-toggle-section filter-toggle-main">
                <button class="header-filter-toggle-btn" id="headerFilterToggleBtnMain" title="הצג/הסתר פילטרים" 
                        onclick="toggleHeaderFilters()">
                  <span class="header-filter-arrow">▲</span>
                </button>
              </div>

            </div>
          </div>

        <!-- אזור פילטרים -->
        <div class="header-filters" id="headerFilters" data-section="filters">
          <div class="filters-container">
            <!-- פילטר סטטוס -->
            <div class="filter-group status-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle status-filter-toggle" id="statusFilterToggle" 
                        onclick="toggleStatusFilterMenu()">
                  <span class="selected-value selected-status-text" id="selectedStatus">כל סטטוס</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="statusFilterMenu">
                  <div class="status-filter-item" data-value="הכול" onclick="selectStatusOption('הכול')">
                    <span class="option-text">הכול</span>
                  </div>
                  <div class="status-filter-item" data-value="פתוח" onclick="selectStatusOption('פתוח')">
                    <span class="option-text">פתוח</span>
                  </div>
                  <div class="status-filter-item" data-value="סגור" onclick="selectStatusOption('סגור')">
                    <span class="option-text">סגור</span>
                  </div>
                  <div class="status-filter-item" data-value="מבוטל" onclick="selectStatusOption('מבוטל')">
                    <span class="option-text">מבוטל</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר סוג השקעה -->
            <div class="filter-group type-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle type-filter-toggle" id="typeFilterToggle" onclick="toggleTypeFilterMenu()">
                                          <span class="selected-value selected-type-text" id="selectedType">כל סוג השקעה</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="typeFilterMenu">
                  <div class="type-filter-item" data-value="הכול" onclick="selectTypeOption('הכול')">
                    <span class="option-text">הכול</span>
                  </div>
                  <!-- סוגי השקעות -->
                  <div class="type-filter-item" data-value="סווינג" onclick="selectTypeOption('סווינג')">
                    <span class="option-text">סווינג</span>
                  </div>
                  <div class="type-filter-item" data-value="השקעה" onclick="selectTypeOption('השקעה')">
                    <span class="option-text">השקעה</span>
                  </div>
                  <div class="type-filter-item" data-value="פסיבי" onclick="selectTypeOption('פסיבי')">
                    <span class="option-text">פסיבי</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חשבון -->
            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle account-filter-toggle" id="accountFilterToggle" 
                        onclick="toggleAccountFilterMenu()">
                  <span class="selected-value selected-account-text" id="selectedAccount">כל חשבון</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="accountFilterMenu">
                  <div class="account-filter-item" data-value="הכול" onclick="selectAccountOption('הכול')">
                    <span class="option-text">הכול</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר תאריכים -->
            <div class="filter-group date-range-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle date-range-filter-toggle" id="dateRangeFilterToggle" 
                        onclick="toggleDateRangeFilterMenu()">
                  <span class="selected-value selected-date-text" id="selectedDateRange">כל זמן</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="dateRangeFilterMenu">
                  <div class="date-range-filter-item" data-value="כל זמן" onclick="selectDateRangeOption('כל זמן')">
                    <span class="option-text">כל זמן</span>
                  </div>
                  <div class="date-range-filter-item" data-value="היום" onclick="selectDateRangeOption('היום')">
                    <span class="option-text">היום</span>
                  </div>
                  <div class="date-range-filter-item" data-value="אתמול" onclick="selectDateRangeOption('אתמול')">
                    <span class="option-text">אתמול</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השבוע" onclick="selectDateRangeOption('השבוע')">
                    <span class="option-text">השבוע</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע" onclick="selectDateRangeOption('שבוע')">
                    <span class="option-text">שבוע (7 ימים)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="החודש" onclick="selectDateRangeOption('החודש')">
                    <span class="option-text">החודש</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השנה" onclick="selectDateRangeOption('השנה')">
                    <span class="option-text">השנה</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה" onclick="selectDateRangeOption('שנה')">
                    <span class="option-text">שנה (365 ימים)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע קודם" onclick="selectDateRangeOption('שבוע קודם')">
                    <span class="option-text">שבוע קודם</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש קודם" onclick="selectDateRangeOption('חודש קודם')">
                    <span class="option-text">חודש קודם</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה קודמת" onclick="selectDateRangeOption('שנה קודמת')">
                    <span class="option-text">שנה קודמת</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חיפוש -->
            <div class="filter-group search-filter">
              <div class="search-input-wrapper">
                <input type="text" class="search-filter-input" id="searchFilterInput" 
                       placeholder="חיפוש..." onkeyup="handleSearchInput(event)">
                <button class="search-clear-btn" onclick="clearSearchFilter()" title="נקה חיפוש">×</button>
              </div>
            </div>

            <!-- כפתורי פעולה -->
            <div class="filter-actions">
              <button class="reset-btn" onclick="resetAllFilters()" title="איפוס פילטרים">
                <span class="btn-text">↻</span>
              </button>
              <button class="clear-btn" onclick="clearAllFilters()" title="נקה כל הפילטרים">
                <span class="btn-text">×</span>
              </button>
            </div>
            
            <!-- כפתור פתיחה/סגירה של הפילטר - בתוך הפילטר -->
            <div class="filter-toggle-section filter-toggle-secondary">
              <button class="header-filter-toggle-btn" id="headerFilterToggleBtnSecondary" title="הצג/הסתר פילטרים" 
                      onclick="toggleHeaderFilters()">
                <span class="header-filter-arrow">▼</span>
              </button>
            </div>
          </div>
        </div>
        
        </div>
    `;
  }

  static setupEventListeners() {
    // הגדרת מצב הכפתורים בהתאם למצב הפילטר
    window.updateToggleButtons();
    
    // CSS styles now loaded from external file (header-styles.css)
    // Removed: HeaderSystem.addStyles() - no longer needed
    
    // עדכון מצב הכפתורים בטעינה הראשונית
    setTimeout(() => {
      window.updateToggleButtons();
    }, 100);
    
    // עדכון נוסף לאחר טעינה מלאה - הוסר כפילות
    // setTimeout(() => {
    //   window.updateToggleButtons();
    // }, 500);
    
    // הוספת event listeners לתפריט משנה של ניקוי
    setTimeout(() => {
      const cleanupItem = document.querySelector('.tiktrack-nav-item:has(.submenu)');
      if (cleanupItem) {
        cleanupItem.addEventListener('mouseenter', () => {
          const submenu = cleanupItem.querySelector('.submenu');
          if (submenu) {
            submenu.style.display = 'block';
          }
        });
        
        cleanupItem.addEventListener('mouseleave', () => {
          const submenu = cleanupItem.querySelector('.submenu');
          if (submenu) {
            submenu.style.display = 'none';
          }
        });
      }
    }, 100);
  }

  /* ===== CSS STYLES MOVED TO EXTERNAL FILE ===== */
  /* All CSS styles have been moved to trading-ui/styles-new/header-styles.css */
  /* This significantly improves:
   * 1. Performance - Browser can cache the CSS file
   * 2. Maintainability - CSS in dedicated file
   * 3. Code organization - Separation of concerns
   * 4. Loading speed - No need to parse and inject CSS dynamically
   * Date: 11 October 2025
   */


  static async loadAccountsForFilter() {
    // console.log('🔧 loadAccountsForFilter - מתחיל טעינת חשבונות מסחר');
    
    try {
      // שימוש בפונקציה מקובץ השירותים
      let accounts = [];
      
      if (typeof window.loadTradingAccountsFromServer === 'function') {
        await window.loadTradingAccountsFromServer();
        accounts = window.trading_accountsData || [];
      } else {
        // fallback לטעינה ישירה
        const response = await fetch('/api/trading-accounts/');
        const data = await response.json();
        accounts = data.data || data;
      }
      
      const openAccounts = accounts.filter(account => account.status === 'open');
      
      console.log('🔧 נמצאו חשבונות:', openAccounts.length, openAccounts.map(a => a.name));
      
      // עדכון תפריט החשבונות
      const accountMenu = document.getElementById('accountFilterMenu');
        console.log('🔧 accountMenu element:', accountMenu);
        
        if (accountMenu) {
          // מחיקת חשבונות קיימים (חוץ מ"הכול")
          const existingItems = accountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])');
          console.log('🔧 מוחק חשבונות קיימים:', existingItems.length);
          existingItems.forEach(item => item.remove());
          
          // הוספת חשבונות פתוחים
          openAccounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.className = 'account-filter-item';
            accountItem.setAttribute('data-value', account.name);
            accountItem.onclick = () => selectAccountOption(account.name);
            accountItem.innerHTML = `<span class="option-text">${account.name}</span>`;
            accountMenu.appendChild(accountItem);
            console.log('🔧 הוספתי חשבון:', account.name);
          });
          
          console.log(`✅ Loaded ${openAccounts.length} open trading accounts for filter`);
          console.log('🔧 סה"כ פריטים בתפריט:', accountMenu.children.length);
      } else {
        console.error('❌ accountFilterMenu לא נמצא!');
      }
      
    } catch (error) {
      console.log('⚠️ Error loading trading accounts for filter:', error);
    }
  }

  static loadSavedState() {
    // console.log('🔧 Loading saved filter state...');
    
    // המתן שהמערכת תהיה מוכנה
    setTimeout(() => {
      if (window.filterSystem && window.filterSystem.currentFilters) {
        console.log('🔧 Current filters from system:', window.filterSystem.currentFilters);
        
        // עדכון UI של פילטר הסטטוס
        if (window.filterSystem.currentFilters.status && window.filterSystem.currentFilters.status.length > 0) {
          console.log('🔧 Updating status filter UI with:', window.filterSystem.currentFilters.status);
          HeaderSystem.updateFilterUI('status', window.filterSystem.currentFilters.status);
        }
        
        // עדכון UI של פילטר הסוג
        if (window.filterSystem.currentFilters.type && window.filterSystem.currentFilters.type.length > 0) {
          console.log('🔧 Updating type filter UI with:', window.filterSystem.currentFilters.type);
          HeaderSystem.updateFilterUI('type', window.filterSystem.currentFilters.type);
        }
        
        // עדכון UI של פילטר החשבון
        if (window.filterSystem.currentFilters.account && window.filterSystem.currentFilters.account.length > 0) {
          console.log('🔧 Updating account filter UI with:', window.filterSystem.currentFilters.account);
          HeaderSystem.updateFilterUI('account', window.filterSystem.currentFilters.account);
        }
        
        // עדכון UI של פילטר התאריכים
        if (window.filterSystem.currentFilters.dateRange) {
          console.log('🔧 Updating date range filter UI with:', window.filterSystem.currentFilters.dateRange);
          HeaderSystem.updateFilterUI('dateRange', window.filterSystem.currentFilters.dateRange);
        }
      }
    }, 500); // המתן 500ms שהמערכת תהיה מוכנה
  }
  
  static updateFilterUI(filterType, selectedValues) {
    console.log(`🔧 Updating ${filterType} filter UI with:`, selectedValues);
    
    if (filterType === 'status') {
      // ביטול כל הבחירות
      const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
      statusItems.forEach(item => item.classList.remove('selected'));
      
      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(`#statusFilterMenu .status-filter-item[data-value="${value}"]`);
        if (item) {
          item.classList.add('selected');
          console.log(`🔧 Selected status item: ${value}`);
        }
      });
      
      // עדכון הטקסט
      if (typeof window.updateStatusFilterText === 'function') {
        window.updateStatusFilterText();
      }
    }
    
    if (filterType === 'type') {
      // ביטול כל הבחירות
      const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
      typeItems.forEach(item => item.classList.remove('selected'));
      
      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(`#typeFilterMenu .type-filter-item[data-value="${value}"]`);
        if (item) {
          item.classList.add('selected');
          console.log(`🔧 Selected type item: ${value}`);
        }
      });
      
      // עדכון הטקסט
      if (typeof window.updateTypeFilterText === 'function') {
        window.updateTypeFilterText();
      }
    }
    
    if (filterType === 'account') {
      // ביטול כל הבחירות
      const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
      accountItems.forEach(item => item.classList.remove('selected'));
      
      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(`#accountFilterMenu .account-filter-item[data-value="${value}"]`);
        if (item) {
          item.classList.add('selected');
          console.log(`🔧 Selected account item: ${value}`);
        }
      });
      
      // עדכון הטקסט
      if (typeof window.updateAccountFilterText === 'function') {
        window.updateAccountFilterText();
      }
    }
    
    if (filterType === 'dateRange') {
      // ביטול כל הבחירות
      const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
      dateItems.forEach(item => item.classList.remove('selected'));
      
      // בחירת הערך השמור
      const item = document.querySelector(`#dateRangeFilterMenu .date-range-filter-item[data-value="${selectedValues}"]`);
      if (item) {
        item.classList.add('selected');
        console.log(`🔧 Selected date range item: ${selectedValues}`);
      }
      
      // עדכון הטקסט
      if (typeof window.updateDateRangeFilterText === 'function') {
        window.updateDateRangeFilterText();
      }
    }
  }

  // ===== SIMPLE FILTER SYSTEM =====
  
  // מערכת פילטרים פשוטה ויעילה
  static createFilterSystem() {
    if (!window.filterSystem) {
      window.filterSystem = {
        currentFilters: {
          search: '',
          dateRange: 'כל זמן',
          status: [],
          type: [],
          account: []
        },
        
        // שמירת פילטרים באמצעות Unified Cache Manager
        async saveFilters() {
          if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
            await window.UnifiedCacheManager.save('headerFilters', this.currentFilters, {
              layer: 'localStorage',
              ttl: 3600000, // 1 שעה
              compress: true,
              syncToBackend: false
            });
            console.log('💾 Header filters saved to Unified Cache');
          } else {
            // Fallback to localStorage if Unified Cache is not available
            localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
            console.log('💾 Header filters saved to localStorage (fallback)');
          }
        },
        
        // טעינת פילטרים באמצעות Unified Cache Manager
        async loadFilters() {
          if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
            try {
              const cachedFilters = await window.UnifiedCacheManager.get('headerFilters');
              if (cachedFilters) {
                this.currentFilters = { ...this.currentFilters, ...cachedFilters };
                console.log('🔧 Loaded saved filters from Unified Cache:', this.currentFilters);
              }
            } catch (e) {
              console.log('⚠️ Error loading saved filters from Unified Cache:', e);
            }
          } else {
            // Fallback to localStorage if Unified Cache is not available
            let saved = null;
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
              saved = await window.UnifiedCacheManager.get('headerFilters');
            } else {
              saved = localStorage.getItem('headerFilters'); // fallback
            }
            
            if (saved) {
              try {
                const parsedFilters = typeof saved === 'string' ? JSON.parse(saved) : saved;
                this.currentFilters = { ...this.currentFilters, ...parsedFilters };
                console.log('🔧 Loaded saved filters from localStorage (fallback):', this.currentFilters);
              } catch (e) {
                console.log('⚠️ Error loading saved filters:', e);
              }
            }
          }
        },
        
        // הפעלת פילטרים על כל הטבלאות
        applyAllFilters() {
          console.log('🔧 applyAllFilters called');
          this.applyFiltersToTable('tickersTable');
          this.applyFiltersToTable('tradePlansTable');
        },
        
        // הפעלת פילטרים על טבלה ספציפית
        applyFiltersToTable(tableId) {
          const table = document.getElementById(tableId);
          if (!table) return;
          
          const rows = table.querySelectorAll('tbody tr');
          let visibleCount = 0;
          
          rows.forEach(row => {
            let shouldShow = true;
            
            // פילטר סטטוס
            if (this.currentFilters.status.length > 0 && !this.currentFilters.status.includes('הכול')) {
              const statusCell = row.querySelector('td[data-status]');
              if (statusCell) {
                const rowStatus = statusCell.getAttribute('data-status');
                shouldShow = shouldShow && this.currentFilters.status.includes(rowStatus);
              }
            }
            
            // פילטר סוג - רק אם יש שדה רלוונטי בטבלה
            if (this.currentFilters.type.length > 0 && !this.currentFilters.type.includes('הכול')) {
              const typeCell = row.querySelector('td[data-investment-type]');
              if (typeCell) {
                // יש שדה סוג - בדוק את הפילטר
                const rowType = typeCell.getAttribute('data-investment-type');
                const rowTypeText = typeCell.textContent.trim();
                
                // בדיקה גם לפי data attribute וגם לפי טקסט
                const typeMatches = this.currentFilters.type.includes(rowType) || 
                                  this.currentFilters.type.includes(rowTypeText);
                shouldShow = shouldShow && typeMatches;
              }
              // אם אין שדה סוג - תמיד הצג (לא מסנן)
            }
            
            // פילטר חשבון
            if (this.currentFilters.account.length > 0 && !this.currentFilters.account.includes('הכול')) {
              const accountCell = row.querySelector('td[data-account]');
              if (accountCell) {
                const rowAccount = accountCell.getAttribute('data-account');
                shouldShow = shouldShow && this.currentFilters.account.includes(rowAccount);
              }
            }
            
            // פילטר תאריכים
            if (this.currentFilters.dateRange && this.currentFilters.dateRange !== 'כל זמן') {
              const dateCell = row.querySelector('td[data-date]');
              if (dateCell) {
                const rowDate = dateCell.getAttribute('data-date');
                const isInRange = this.isDateInRange(rowDate, this.currentFilters.dateRange);
                shouldShow = shouldShow && isInRange;
              }
            }
            
            // פילטר חיפוש
            if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
              const searchTerm = this.currentFilters.search.toLowerCase().trim();
              const cells = row.querySelectorAll('td');
              let foundMatch = false;
              
              cells.forEach(cell => {
                const cellText = cell.textContent.toLowerCase().trim();
                if (cellText.includes(searchTerm)) {
                  foundMatch = true;
                }
              });
              
              shouldShow = shouldShow && foundMatch;
            }
            
            // הצגה/הסתרה
            if (shouldShow) {
              row.style.display = '';
              visibleCount++;
            } else {
              row.style.display = 'none';
            }
          });
          
          console.log(`✅ ${tableId}: ${visibleCount}/${rows.length} rows visible`);
        },
        
        // פונקציה לבדיקת תאריך בטווח
        isDateInRange(dateString, dateRange) {
          if (!dateString || !dateRange || dateRange === 'כל זמן') {
            return true;
          }
          
          const date = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          switch (dateRange) {
            case 'היום':
              return date.toDateString() === today.toDateString();
              
            case 'אתמול':
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              return date.toDateString() === yesterday.toDateString();
              
            case 'השבוע':
              const startOfWeek = new Date(today);
              const dayOfWeek = today.getDay();
              startOfWeek.setDate(today.getDate() - dayOfWeek);
              return date >= startOfWeek && date <= today;
              
            case 'שבוע':
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              return date >= weekAgo && date <= today;
              
            case 'החודש':
              const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              return date >= startOfMonth && date <= today;
              
            case 'השנה':
              const startOfYear = new Date(today.getFullYear(), 0, 1);
              return date >= startOfYear && date <= today;
              
            case 'שנה':
              const yearAgo = new Date(today);
              yearAgo.setFullYear(today.getFullYear() - 1);
              return date >= yearAgo && date <= today;
              
            case 'שבוע קודם':
              const lastWeekStart = new Date(today);
              lastWeekStart.setDate(today.getDate() - 14);
              const lastWeekEnd = new Date(today);
              lastWeekEnd.setDate(today.getDate() - 7);
              return date >= lastWeekStart && date < lastWeekEnd;
              
            case 'חודש קודם':
              const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
              return date >= lastMonth && date <= lastMonthEnd;
              
            case 'שנה קודמת':
              const lastYear = new Date(today.getFullYear() - 1, 0, 1);
              const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
              return date >= lastYear && date <= lastYearEnd;
              
            default:
              return true;
          }
        }
      };
      
      window.filterSystem.loadFilters();
    }
    return window.filterSystem;
  }
}


// ===== FILTER SYSTEM TOGGLE FUNCTIONS =====
// פונקציות פתיחה וסגירה של מערכת הפילטרים בלבד
// ==========================================

// פונקציה לפתיחה וסגירה של הפילטר הראשי
window.toggleHeaderFilters = function() {
  console.log('🔧 toggleHeaderFilters called - Header filter system only');
  const section = document.getElementById('headerFilters');
  if (section) {
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';
    
    const toggleBtn = document.getElementById('headerFilterToggleBtn');
    const arrow = toggleBtn ? toggleBtn.querySelector('.header-filter-arrow') : null;
    
    if (toggleBtn && arrow) {
      if (isVisible) {
        arrow.textContent = '▼';
        toggleBtn.classList.add('collapsed');
      } else {
        arrow.textContent = '▲';
        toggleBtn.classList.remove('collapsed');
      }
    }
    
    console.log(`✅ Header filters ${isVisible ? 'hidden' : 'shown'}`);
    
    // עדכון מצב הכפתורים
    window.updateToggleButtons();
  }
};

window.toggleStatusFilterMenu = function() {
  console.log('🔧 toggleStatusFilterMenu called');
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
    console.log('🔧 Status filter menu toggled:', menu.classList.contains('show') ? 'opened' : 'closed');
  }
};

window.toggleTypeFilterMenu = function() {
  console.log('🔧 toggleTypeFilterMenu called');
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
    console.log('🔧 Type filter menu toggled:', menu.classList.contains('show') ? 'opened' : 'closed');
  }
};

window.toggleAccountFilterMenu = function() {
  console.log('🔧 toggleAccountFilterMenu called');
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
    console.log('🔧 Account filter menu toggled:', menu.classList.contains('show') ? 'opened' : 'closed');
  }
};

window.toggleDateRangeFilterMenu = function() {
  console.log('🔧 toggleDateRangeFilterMenu called');
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
    console.log('🔧 Date range filter menu toggled:', menu.classList.contains('show') ? 'opened' : 'closed');
  }
};

// ===== GLOBAL FILTER FUNCTIONS =====

// פונקציות בחירת פילטרים (מולטיסלקט)
window.selectStatusOption = function(status) {
  console.log('🔧 selectStatusOption called with:', status);
  
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
  
  if (clickedItem) {
    if (status === 'הכול') {
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // בחירת סטטוס ספציפי - ביטול "הכול" אם נבחר
      const allItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      // אם לא נבחר אף סטטוס, חזור ל"הכול"
      const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateStatusFilterText();
  
  // עדכון מיידי של הפילטר במערכת
  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
    const selectedStatuses = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.status = selectedStatuses;
    window.filterSystem.saveFilters();
    window.filterSystem.applyAllFilters();
  }
  
  // סגירת התפריט
  const statusMenu = document.getElementById('statusFilterMenu');
  if (statusMenu) {
    statusMenu.classList.remove('show');
  }
};

window.selectTypeOption = function(type) {
  console.log('🔧 selectTypeOption called with:', type);
  
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  const clickedItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === type);
  
  if (clickedItem) {
    if (type === 'הכול') {
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      const allItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateTypeFilterText();
  
  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
    const selectedTypes = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.type = selectedTypes;
    window.filterSystem.saveFilters();
    window.filterSystem.applyAllFilters();
  }
  
  const typeMenu = document.getElementById('typeFilterMenu');
  if (typeMenu) {
    typeMenu.classList.remove('show');
  }
};

window.selectAccountOption = function(account) {
  console.log('🔧 selectAccountOption called with:', account);
  
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  const clickedItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === account);
  
  if (clickedItem) {
    if (account === 'הכול') {
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      const allItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateAccountFilterText();
  
  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
    const selectedAccounts = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.account = selectedAccounts;
    window.filterSystem.saveFilters();
    window.filterSystem.applyAllFilters();
  }
  
  const accountMenu = document.getElementById('accountFilterMenu');
  if (accountMenu) {
    accountMenu.classList.remove('show');
  }
};

window.selectDateRangeOption = function(dateRange) {
  console.log('🔧 selectDateRangeOption called with:', dateRange);

  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  
  // ביטול כל הבחירות (בחירה יחידה)
  dateRangeItems.forEach(item => item.classList.remove('selected'));

  // בחירת התאריך החדש
  const clickedItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === dateRange);
  if (clickedItem) {
    clickedItem.classList.add('selected');
  }

  updateDateRangeFilterText();
  
  if (window.filterSystem) {
    window.filterSystem.currentFilters.dateRange = dateRange;
    window.filterSystem.saveFilters();
    window.filterSystem.applyAllFilters();
  }

  const dateMenu = document.getElementById('dateRangeFilterMenu');
  if (dateMenu) {
    dateMenu.classList.remove('show');
  }
};

// פונקציות עדכון טקסט פילטרים (מולטיסלקט)
window.updateStatusFilterText = function() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const statusElement = document.getElementById('selectedStatus');
  
  if (statusElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      statusElement.textContent = 'כל סטטוס';
    } else if (selectedItems.length === 1) {
      statusElement.textContent = selectedItems[0].getAttribute('data-value');
    } else {
      statusElement.textContent = `${selectedItems.length} סטטוסים`;
    }
  }
};

window.updateTypeFilterText = function() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const typeElement = document.getElementById('selectedType');
  
  if (typeElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      typeElement.textContent = 'כל סוג השקעה';
    } else if (selectedItems.length === 1) {
      typeElement.textContent = selectedItems[0].getAttribute('data-value');
    } else {
      typeElement.textContent = `${selectedItems.length} סוגים`;
    }
  }
};

window.updateAccountFilterText = function() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const accountElement = document.getElementById('selectedAccount');

  if (accountElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      accountElement.textContent = 'כל חשבון';
    } else if (selectedItems.length === 1) {
      accountElement.textContent = selectedItems[0].getAttribute('data-value');
    } else {
      accountElement.textContent = `${selectedItems.length} חשבונות`;
    }
  }
};

window.updateDateRangeFilterText = function() {
  const selectedItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item.selected');
  const dateRangeElement = document.getElementById('selectedDateRange');

  if (dateRangeElement) {
    if (selectedItems.length === 0) {
      dateRangeElement.textContent = 'כל זמן';
    } else if (selectedItems.length === 1) {
      const item = selectedItems[0];
      const value = item.getAttribute('data-value');
      dateRangeElement.textContent = value;
    } else {
      // בחירה יחידה - לא אמור לקרות
      dateRangeElement.textContent = 'כל זמן';
    }
  }
};

// פונקציות הפעלת פילטרים - פשוטות ויעילות
window.applyStatusFilter = function() {
  if (window.filterSystem) {
    window.filterSystem.applyAllFilters();
  }
};

window.applyTypeFilter = function() {
  if (window.filterSystem) {
    window.filterSystem.applyAllFilters();
  }
};

window.applyAccountFilter = function() {
  if (window.filterSystem) {
    window.filterSystem.applyAllFilters();
  }
};

window.applyDateRangeFilter = function(dateRange) {
  if (window.filterSystem) {
    window.filterSystem.applyAllFilters();
  }
};

// פונקציות כלליות - פשוטות ויעילות
window.clearAllFilters = function() {
  console.log('🧹 clearAllFilters - מוחק את כל הפילטרים');
  if (window.filterSystem) {
    window.filterSystem.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: []
    };
    window.filterSystem.saveFilters();
    window.filterSystem.applyAllFilters();
    
    // איפוס UI
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) searchInput.value = '';
    
    // איפוס בחירות בפילטרים
    const allFilterItems = document.querySelectorAll('.status-filter-item, .type-filter-item, .account-filter-item, .date-range-filter-item');
    allFilterItems.forEach(item => item.classList.remove('selected'));
    
    // בחירת "הכול" בכל הפילטרים
    const allStatusItem = document.querySelector('#statusFilterMenu .status-filter-item[data-value="הכול"]');
    if (allStatusItem) allStatusItem.classList.add('selected');
    
    const allTypeItem = document.querySelector('#typeFilterMenu .type-filter-item[data-value="הכול"]');
    if (allTypeItem) allTypeItem.classList.add('selected');
    
    const allAccountItem = document.querySelector('#accountFilterMenu .account-filter-item[data-value="הכול"]');
    if (allAccountItem) allAccountItem.classList.add('selected');
    
    const allDateItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item[data-value="כל זמן"]');
    if (allDateItem) allDateItem.classList.add('selected');
    
    // עדכון טקסטים
    if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
    if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
    if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
    if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();
    
    console.log('✅ כל הפילטרים נמחקו');
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('כל הפילטרים נמחקו בהצלחה', 'success', 'הצלחה', 2000, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: כל הפילטרים נמחקו בהצלחה');
    }
  }
};

// פונקציה לעדכון UI של הפילטרים
window.updateFilterUI = function(filters) {
  console.log('🎨 עדכון UI של הפילטרים:', filters);
  
  // עדכון שדה החיפוש
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = filters.search || '';
  }
  
  // עדכון פילטר סטטוס
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (filters.status.length === 0 && value === 'הכול') {
      item.classList.add('selected');
    } else if (filters.status.includes(value)) {
      item.classList.add('selected');
    }
  });
  
  // עדכון פילטר סוג
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (filters.type.length === 0 && value === 'הכול') {
      item.classList.add('selected');
    } else if (filters.type.includes(value)) {
      item.classList.add('selected');
    }
  });
  
  // עדכון פילטר חשבון
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  accountItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (filters.account.length === 0 && value === 'הכול') {
      item.classList.add('selected');
    } else if (filters.account.includes(value)) {
      item.classList.add('selected');
    }
  });
  
  // עדכון פילטר תאריכים
  const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (value === filters.dateRange) {
      item.classList.add('selected');
    }
  });
  
  // עדכון טקסטים של הפילטרים
  if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
  if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
  if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
  if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();
}

window.resetAllFilters = async function() {
  console.log('↻ resetAllFilters - מחזיר לערכי ברירת מחדל מהעדפות');
  console.log('↻ resetAllFilters - פונקציה נקראת!');
  
  try {
    // טעינת הגדרות ברירת מחדל מהעדפות באמצעות מערכת ההעדפות הקיימת
    const preferenceNames = [
      'defaultSearchFilter',
      'defaultDateRangeFilter', 
      'defaultStatusFilter',
      'defaultTypeFilter',
      'defaultAccountFilter'
    ];
    
    console.log('↻ בודק אם getPreferencesByNames קיימת:', typeof window.getPreferencesByNames);
    
    if (typeof window.getPreferencesByNames !== 'function') {
      throw new Error('getPreferencesByNames לא קיימת');
    }
    
    const prefs = await window.getPreferencesByNames(preferenceNames);
    
    console.log('↻ העדפות מקוריות:', prefs);
    
    // הגדרות ברירת מחדל מהעדפות
    const defaultFilters = {
      search: prefs.defaultSearchFilter || '',
      dateRange: prefs.defaultDateRangeFilter || 'כל זמן',
      status: prefs.defaultStatusFilter === 'הכל' ? [] : [prefs.defaultStatusFilter],
      type: prefs.defaultTypeFilter === 'הכל' ? [] : [prefs.defaultTypeFilter],
      account: prefs.defaultAccountFilter === 'כל החשבונות' ? [] : [prefs.defaultAccountFilter]
    };
    
    console.log('↻ טוען הגדרות ברירת מחדל:', defaultFilters);
    
    // עדכון הפילטרים הנוכחיים
    if (window.filterSystem) {
      window.filterSystem.currentFilters = defaultFilters;
      window.filterSystem.saveFilters();
      window.filterSystem.applyAllFilters();
      
      // עדכון UI
      console.log('↻ קורא ל-updateFilterUI');
      if (typeof window.updateFilterUI === 'function') {
        window.updateFilterUI(defaultFilters);
      } else {
        console.error('❌ window.updateFilterUI לא קיימת!');
      }
      
    }
    
    console.log('✅ פילטרים אופסו לערכי ברירת מחדל');
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('פילטרים אופסו לערכי ברירת מחדל', 'success', 'הצלחה', 2000, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: פילטרים אופסו לערכי ברירת מחדל');
    }
    
  } catch (error) {
    console.error('❌ שגיאה בטעינת העדפות:', error);
    console.error('❌ פרטי השגיאה:', error.message, error.stack);
    // fallback לאיפוס רגיל
    window.clearAllFilters();
  }
};

window.handleSearchInput = function(event) {
  const searchTerm = event.target.value;
  if (window.filterSystem) {
    window.filterSystem.currentFilters.search = searchTerm;
    window.filterSystem.saveFilters();
    window.filterSystem.applyAllFilters();
  }
};

window.clearSearchFilter = function() {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
    if (window.filterSystem) {
      window.filterSystem.currentFilters.search = '';
      window.filterSystem.saveFilters();
      window.filterSystem.applyAllFilters();
    }
    console.log('✅ חיפוש נוקה');
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('חיפוש נוקה בהצלחה', 'success', 'הצלחה', 1500, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: חיפוש נוקה בהצלחה');
    }
  }
};

// Make HeaderSystem class available globally
window.HeaderSystemClass = HeaderSystem;

// Create global HeaderSystem object for compatibility with unified initialization
window.HeaderSystem = {
  initialize: function() {
    console.log('🚀 HeaderSystem.initialize called');
    try {
      // Check if HeaderSystem class exists
      if (typeof window.HeaderSystemClass === 'function') {
        window.headerSystem = new window.HeaderSystemClass();
        if (typeof window.headerSystem.init === 'function') {
          window.headerSystem.init();
        }
        return true;
      } else {
        console.log('⚠️ HeaderSystem class not available yet');
        return false;
      }
    } catch (error) {
      console.log('⚠️ HeaderSystem.initialize error:', error.message);
      return false;
    }
  },
  createFilterSystem: function() {
    try {
      if (typeof window.HeaderSystemClass === 'function' && typeof window.HeaderSystemClass.createFilterSystem === 'function') {
        return window.HeaderSystemClass.createFilterSystem();
      }
      return false;
    } catch (error) {
      console.log('⚠️ HeaderSystem.createFilterSystem error:', error.message);
      return false;
    }
  },
  init: function() {
    return this.initialize();
  }
};

// Initialize the header system
// DOMContentLoaded removed - handled by unified system in Stage 2
// Header system initialization is now called from core-systems.js Stage 2: UI Systems

window.initializeHeaderSystem = function() {
  if (typeof window.HeaderSystemClass === 'function') {
    window.headerSystem = new window.HeaderSystemClass();
    if (typeof window.headerSystem.init === 'function') {
      window.headerSystem.init();
    }
    
    // יצירת מערכת הפילטרים
    if (typeof window.HeaderSystemClass.createFilterSystem === 'function') {
      window.HeaderSystemClass.createFilterSystem();
    }
  } else {
    console.error('❌ HeaderSystem class not found');
  }
};

// Update Toggle Buttons Function - עדכון מצב הכפתורים
window.updateToggleButtons = function() {
  const headerFilters = document.querySelector('.header-filters');
  const mainBtn = document.querySelector('.filter-toggle-main');
  const secondaryBtn = document.querySelector('.filter-toggle-secondary');
  
  // console.log('🔧 updateToggleButtons called');
  // console.log('headerFilters:', headerFilters);
  // console.log('mainBtn:', mainBtn);
  // console.log('secondaryBtn:', secondaryBtn);
  
  if (!headerFilters || !mainBtn || !secondaryBtn) {
    console.log('❌ Missing elements');
    return;
  }
  
  const isOpen = headerFilters.style.display !== 'none';
  console.log('isOpen:', isOpen);
  
  if (isOpen) {
    // פילטר פתוח - הצג כפתור משני (בתוך הפילטר)
    console.log('📤 Hiding main button, showing secondary button');
    mainBtn.style.display = 'none';
    secondaryBtn.style.display = 'block';
  } else {
    // פילטר סגור - הצג כפתור ראשי (בתוך התפריט הראשי)
    console.log('📥 Showing main button, hiding secondary button');
    mainBtn.style.display = 'block';
    secondaryBtn.style.display = 'none';
  }
};

// Z-Index Debug Function - בדיקת מצב z-index בפועל
window.debugZIndexStatus = function() {
    console.log('🔍 בדיקת מצב Z-Index במערכת ראש הדף');
    console.log('=====================================');
    
    // בדיקת אלמנטים רלוונטיים
    const elements = [
        { selector: '#unified-header', name: 'Header Container' },
        { selector: '.header-top', name: 'Header Top' },
        { selector: '.tiktrack-dropdown-menu', name: 'Dropdown Menus' },
        { selector: '.filter-toggle-section', name: 'Filter Toggle Button' },
        { selector: '.header-filter-toggle-btn', name: 'Filter Button' },
        { selector: '.header-filters', name: 'Header Filters' },
        { selector: '.filter-menu', name: 'Filter Menu' }
    ];
    
    elements.forEach(element => {
        const el = document.querySelector(element.selector);
        if (el) {
            const computedStyle = window.getComputedStyle(el);
            const zIndex = computedStyle.zIndex;
            const position = computedStyle.position;
            const display = computedStyle.display;
            const visibility = computedStyle.visibility;
            
            console.log(`📍 ${element.name}:`);
            console.log(`   Selector: ${element.selector}`);
            console.log(`   Z-Index: ${zIndex}`);
            console.log(`   Position: ${position}`);
            console.log(`   Display: ${display}`);
            console.log(`   Visibility: ${visibility}`);
            console.log(`   Visible: ${el.offsetParent !== null}`);
            console.log('---');
        } else {
            console.log(`❌ ${element.name} (${element.selector}): לא נמצא`);
        }
    });
    
    // בדיקת כל התפריטים הפתוחים
    console.log('🎯 בדיקת תפריטים פתוחים:');
    const openMenus = document.querySelectorAll('.tiktrack-dropdown-menu:not([style*="display: none"])');
    console.log(`תפריטים פתוחים: ${openMenus.length}`);
    
    openMenus.forEach((menu, index) => {
        const computedStyle = window.getComputedStyle(menu);
        console.log(`תפריט ${index + 1}: z-index = ${computedStyle.zIndex}`);
    });
    
    // בדיקת כפתור הפילטר
    console.log('🔘 בדיקת כפתור פילטר:');
    const filterBtn = document.querySelector('.header-filter-toggle-btn');
    if (filterBtn) {
        const computedStyle = window.getComputedStyle(filterBtn);
        console.log(`כפתור פילטר: z-index = ${computedStyle.zIndex}`);
        console.log(`כפתור פילטר: position = ${computedStyle.position}`);
        console.log(`כפתור פילטר: visible = ${filterBtn.offsetParent !== null}`);
    }
    
    // בדיקת תפריטי פילטר
    console.log('🔍 בדיקת תפריטי פילטר:');
    const filterMenus = document.querySelectorAll('.filter-menu');
    filterMenus.forEach((menu, index) => {
        const computedStyle = window.getComputedStyle(menu);
        console.log(`תפריט פילטר ${index + 1}: z-index = ${computedStyle.zIndex}`);
    });
    
    console.log('=====================================');
    console.log('✅ בדיקת Z-Index הושלמה');
};

// ===== CACHE MANAGEMENT - REDIRECTED TO CACHE-TEST PAGE =====
// כל ניהול המטמון מרוכז בעמוד /cache-test

// כל בדיקות המטמון מרוכזות בעמוד /cache-test

console.log('✅ Header System v6.0.0 loaded successfully!');

// Note: Header system initialization is called from core-systems.js Stage 2: UI Systems
// The function window.initializeHeaderSystem() is available and will be called automatically

