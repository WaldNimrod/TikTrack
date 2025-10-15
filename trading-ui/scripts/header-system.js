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
          ${this.getHeaderTopHTML()}
          ${this.getHeaderFiltersHTML()}
        </div>
    `;
  }

  /**
   * Generate Header Top HTML - Navigation and Logo
   * Contains: Main menu, logo, main toggle button
   */
  static getHeaderTopHTML() {
    return `
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
                        
                        
                        <li class="separator"></li>
                        
                        <!-- ממשק משתמש -->
                        <li><a class="tiktrack-dropdown-item" href="/dynamic-colors-display">🌈 צבעים דינמיים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">🎭 עיצובים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/debug-actions-menu">🔧 בדיקת Actions Menu</a></li>


                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <button class="tiktrack-nav-link cache-clear-btn" 
                              onclick="window.clearAllCache({ level: 'full' })" 
                              title="ניקוי מטמון מלא (Full) - כולל Orphan Keys (100% כיסוי) - דורש login מחדש!">
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
    `;
  }

  /**
   * Generate Header Filters HTML - All filter controls
   * Contains: Status, Type, Account, Date, Search filters + Action buttons
   */
  static getHeaderFiltersHTML() {
    return `
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
    console.log('🔧 loadAccountsForFilter - מתחיל טעינת חשבונות מסחר');
    
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
      
      // עדכון window.trading_accountsData תמיד (גם אם השתמשנו ב-loadTradingAccountsFromServer)
      window.trading_accountsData = accounts;
      console.log('💾 עדכנו window.trading_accountsData עם', accounts.length, 'חשבונות');
      
      const openAccounts = accounts.filter(account => account.status === 'open');
      
      console.log('✅ נטענו', accounts.length, 'חשבונות, פתוחים:', openAccounts.length);
      
      // עדכון תפריט החשבונות
      const accountMenu = document.getElementById('accountFilterMenu');
        
        if (accountMenu) {
          // מחיקת חשבונות קיימים (חוץ מ"הכול")
          const existingItems = accountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])');
          existingItems.forEach(item => item.remove());
          
          // הוספת חשבונות פתוחים
          openAccounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.className = 'account-filter-item';
            accountItem.setAttribute('data-value', account.name);
            accountItem.onclick = () => selectAccountOption(account.name);
            accountItem.innerHTML = `<span class="option-text">${account.name}</span>`;
            accountMenu.appendChild(accountItem);
          });
          
          console.log('✅ עדכנו תפריט עם', openAccounts.length, 'חשבונות');
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
        
        // עדכון UI של פילטר הסטטוס
        if (window.filterSystem.currentFilters.status && window.filterSystem.currentFilters.status.length > 0) {
          HeaderSystem.updateFilterUI('status', window.filterSystem.currentFilters.status);
        }
        
        // עדכון UI של פילטר הסוג
        if (window.filterSystem.currentFilters.type && window.filterSystem.currentFilters.type.length > 0) {
          HeaderSystem.updateFilterUI('type', window.filterSystem.currentFilters.type);
        }
        
        // עדכון UI של פילטר החשבון
        if (window.filterSystem.currentFilters.account && window.filterSystem.currentFilters.account.length > 0) {
          HeaderSystem.updateFilterUI('account', window.filterSystem.currentFilters.account);
        }
        
        // עדכון UI של פילטר התאריכים
        if (window.filterSystem.currentFilters.dateRange) {
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
              } catch (e) {
                console.log('⚠️ Error loading saved filters:', e);
              }
            }
          }
        },
        
        // הפעלת פילטרים על כל הטבלאות
        applyAllFilters() {
          
          // מציאת כל הטבלאות בעמוד באופן דינמי
          const tables = document.querySelectorAll('table.data-table[data-table-type]');
          
          tables.forEach(table => {
            if (table.id) {
              this.applyFiltersToTable(table.id);
            }
          });
        },
        
        // הפעלת פילטרים על טבלה ספציפית
        applyFiltersToTable(tableId) {
          const table = document.getElementById(tableId);
          if (!table) return;
          
          const rows = table.querySelectorAll('tbody tr');
          let visibleCount = 0;
          
          rows.forEach(row => {
            let shouldShow = true;
            
            // פילטר סטטוס - רק אם יש שדה רלוונטי בטבלה
            if (this.currentFilters.status.length > 0 && !this.currentFilters.status.includes('הכול')) {
              const statusCell = row.querySelector('td[data-status]');
              if (statusCell) {
                // יש שדה סטטוס - בדוק את הפילטר
                const rowStatus = statusCell.getAttribute('data-status');
                const rowStatusText = statusCell.textContent.trim();
                
                // בדיקה גם לפי data attribute וגם לפי טקסט
                const statusMatches = this.currentFilters.status.includes(rowStatus) || 
                                    this.currentFilters.status.includes(rowStatusText);
                shouldShow = shouldShow && statusMatches;
              }
              // אם אין שדה סטטוס - תמיד הצג (לא מסנן)
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
            
            // פילטר חשבון - רק אם יש שדה רלוונטי בטבלה
            if (this.currentFilters.account.length > 0 && !this.currentFilters.account.includes('הכול')) {
              const accountCell = row.querySelector('td[data-account]');
              if (accountCell) {
                // יש שדה חשבון - בדוק את הפילטר
                const rowAccount = accountCell.getAttribute('data-account');
                shouldShow = shouldShow && this.currentFilters.account.includes(rowAccount);
              }
              // אם אין שדה חשבון - תמיד הצג (לא מסנן)
            }
            
            // פילטר תאריכים - רק אם יש שדה רלוונטי בטבלה
            if (this.currentFilters.dateRange && this.currentFilters.dateRange !== 'כל זמן') {
              const dateCell = row.querySelector('td[data-date]');
              if (dateCell) {
                // יש שדה תאריך - בדוק את הפילטר
                const rowDate = dateCell.getAttribute('data-date');
                const isInRange = this.isDateInRange(rowDate, this.currentFilters.dateRange);
                shouldShow = shouldShow && isInRange;
              }
              // אם אין שדה תאריך - תמיד הצג (לא מסנן)
            }
            
            // פילטר חיפוש - תמיד פועל על כל העמודות בטבלה
            if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
              const searchTerm = this.currentFilters.search.toLowerCase().trim();
              const cells = row.querySelectorAll('td');
              let foundMatch = false;
              
              // עובר על כל התאים ומחפש התאמה
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
      
      // טעינת פילטרים ועדכון ליבלים
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
  const section = document.getElementById('headerFilters');
  if (section) {
    const isVisible = !section.classList.contains('filters-hidden');
    
    if (isVisible) {
      // סגירה בשלבים: 1.fade כפתור → 2.סגירת פילטר → 3.fade כפתור חזרה
      
      // שלב 1: fade out של הכפתור הנוכחי (0.15s)
      const currentBtn = document.querySelector('.filter-toggle-secondary');
      if (currentBtn) currentBtn.classList.add('fading-out');
      
      // שלב 2: סגירת הפילטר (0.3s) - מתחיל אחרי 0.15s
      setTimeout(() => {
        section.classList.add('filters-hidden');
      }, 150);
      
      // החלפת כפתורים אחרי סיום מלא של אנימציה (0.15 + 0.3 = 0.45s)
      setTimeout(() => {
        window.updateToggleButtons();
        // שלב 3: fade in של הכפתור החדש - מיד אחרי החלפה
        setTimeout(() => {
          const newBtn = document.querySelector('.filter-toggle-main');
          if (newBtn) newBtn.classList.remove('fading-out');
        }, 50); // עיכוב קטן לוודא שהכפתור הוחלף
      }, 450);
      
    } else {
      // פתיחה בשלבים: 1.fade כפתור → 2.פתיחת פילטר → 3.fade כפתור חזרה
      
      // שלב 1: fade out של הכפתור הנוכחי (0.15s)
      const currentBtn = document.querySelector('.filter-toggle-main');
      if (currentBtn) currentBtn.classList.add('fading-out');
      
      // שלב 2: פתיחת הפילטר (0.3s) - מתחיל אחרי 0.15s
      setTimeout(() => {
        section.classList.remove('filters-hidden');
      }, 150);
      
      // החלפת כפתורים אחרי סיום מלא של אנימציה (0.15 + 0.3 = 0.45s)
      setTimeout(() => {
        window.updateToggleButtons();
        // שלב 3: fade in של הכפתור החדש - מיד אחרי החלפה
        setTimeout(() => {
          const newBtn = document.querySelector('.filter-toggle-secondary');
          if (newBtn) newBtn.classList.remove('fading-out');
        }, 50); // עיכוב קטן לוודא שהכפתור הוחלף
      }, 450);
    }
    
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
    
  }
};

window.toggleStatusFilterMenu = function() {
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

window.toggleTypeFilterMenu = function() {
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

window.toggleAccountFilterMenu = function() {
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

window.toggleDateRangeFilterMenu = function() {
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

// ===== GLOBAL FILTER FUNCTIONS =====

// פונקציות בחירת פילטרים (מולטיסלקט)
window.selectStatusOption = function(status) {
  
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
    
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('כל הפילטרים נמחקו בהצלחה', 'success', 'הצלחה', 2000, 'system');
    } else {
    }
  }
};

// פונקציה לעדכון UI של הפילטרים
window.updateFilterUI = function(filters) {
  console.log('🔧 updateFilterUI called with filters:', filters);
  
  // עדכון שדה החיפוש
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = filters.search || '';
    console.log('🔧 Updated search filter:', filters.search || '');
  }
  
  // עדכון פילטר סטטוס
  console.log('🔧 Updating status filter with:', filters.status);
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  console.log('🔧 Found', statusItems.length, 'status items');
  if (statusItems.length === 0) {
    console.warn('🔧 No status filter items found!');
  }
  statusItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    console.log('🔧 Checking status item:', value, 'against:', filters.status);
    if (!filters.status || filters.status.length === 0) {
      if (value === 'הכול' || value === 'הכל' || value === 'all') {
      item.classList.add('selected');
        console.log('🔧 Selected default status item:', value);
      }
    } else if (filters.status && filters.status.includes(value)) {
      item.classList.add('selected');
      console.log('🔧 Selected status item:', value);
    }
  });
  
  // עדכון פילטר סוג
  console.log('🔧 Updating type filter with:', filters.type);
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  console.log('🔧 Found', typeItems.length, 'type items');
  if (typeItems.length === 0) {
    console.warn('🔧 No type filter items found!');
  }
  typeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    console.log('🔧 Checking type item:', value, 'against:', filters.type);
    if (!filters.type || filters.type.length === 0) {
      if (value === 'הכול' || value === 'הכל' || value === 'all') {
      item.classList.add('selected');
        console.log('🔧 Selected default type item:', value);
      }
    } else if (filters.type && filters.type.includes(value)) {
      item.classList.add('selected');
      console.log('🔧 Selected type item:', value);
    }
  });
  
  // עדכון פילטר חשבון
  console.log('🔧 Updating account filter with:', filters.account);
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  console.log('🔧 Found', accountItems.length, 'account items');
  if (accountItems.length === 0) {
    console.warn('🔧 No account filter items found!');
  }
  accountItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    console.log('🔧 Checking account item:', value, 'against:', filters.account);
    if (!filters.account || filters.account.length === 0) {
      if (value === 'הכול' || value === 'הכל' || value === 'כל החשבונות' || value === 'all') {
      item.classList.add('selected');
        console.log('🔧 Selected default account item:', value);
      }
    } else if (filters.account && filters.account.includes(value)) {
      item.classList.add('selected');
      console.log('🔧 Selected account item:', value);
    }
  });
  
  // עדכון פילטר תאריכים
  console.log('🔧 Updating dateRange filter with:', filters.dateRange);
  const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  console.log('🔧 Found', dateItems.length, 'date items');
  if (dateItems.length === 0) {
    console.warn('🔧 No date filter items found!');
  }
  dateItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    console.log('🔧 Checking date item:', value, 'against:', filters.dateRange);
    if (value === filters.dateRange) {
      item.classList.add('selected');
      console.log('🔧 Selected date item:', value);
    }
  });
  
  // עדכון טקסטים של הפילטרים
  console.log('🔧 Updating filter texts...');
  if (typeof window.updateStatusFilterText === 'function') {
    console.log('🔧 Calling updateStatusFilterText');
    window.updateStatusFilterText();
  }
  if (typeof window.updateTypeFilterText === 'function') {
    console.log('🔧 Calling updateTypeFilterText');
    window.updateTypeFilterText();
  }
  if (typeof window.updateAccountFilterText === 'function') {
    console.log('🔧 Calling updateAccountFilterText');
    window.updateAccountFilterText();
  }
  if (typeof window.updateDateRangeFilterText === 'function') {
    console.log('🔧 Calling updateDateRangeFilterText');
    window.updateDateRangeFilterText();
  }
  
  // עדכון filterSystem עם הערכים המעודכנים מה-UI
  if (window.filterSystem) {
    console.log('🔧 Updating filterSystem.currentFilters with UI state');
    
    // עדכון סטטוס
    const selectedStatusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
    const selectedStatuses = Array.from(selectedStatusItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.status = selectedStatuses;
    console.log('🔧 Updated status in filterSystem:', selectedStatuses);
    
    // עדכון סוג
    const selectedTypeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
    const selectedTypes = Array.from(selectedTypeItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.type = selectedTypes;
    console.log('🔧 Updated type in filterSystem:', selectedTypes);
    
    // עדכון חשבון
    const selectedAccountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
    const selectedAccounts = Array.from(selectedAccountItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.account = selectedAccounts;
    console.log('🔧 Updated account in filterSystem:', selectedAccounts);
    
    // עדכון תאריכים
    const selectedDateItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const selectedDate = selectedDateItem ? selectedDateItem.getAttribute('data-value') : filters.dateRange;
    window.filterSystem.currentFilters.dateRange = selectedDate;
    console.log('🔧 Updated dateRange in filterSystem:', selectedDate);
    
    // שמירה
    window.filterSystem.saveFilters();
  }
}

/**
 * איפוס כל הפילטרים לערכי ברירת מחדל מהעדפות המשתמש
 * 
 * מיישם את מערכת האתחול המאוחדת והמערכות הכלליות:
 * 
 * מערכת אתחול מאוחדת (UNIFIED_INITIALIZATION_SYSTEM):
 * - Stage 2: UI Systems - HeaderSystem initialization
 * - Stage 3: Preferences System - PreferencesSystem initialization  
 * - window.cacheSystemReady - flag של מערכת המטמון המאוחדת
 * 
 * מערכות העדפות:
 * - PreferencesSystem V2 (preferences-core.js) - מערכת חדשה ראשית
 * - preferencesCache (preferences.js) - מערכת ישנה לתמיכה
 * 
 * מערכת מטמון מאוחדת:
 * - UnifiedCacheManager (cache-module.js) - מערכת מטמון 4 שכבות
 * - Cache policies: user-preferences, ui-state, filter-state
 * 
 * מערכות כללית:
 * - window.showNotification - מערכת התראות כללית
 * - window.filterSystem - מערכת פילטרים
 * - HeaderSystem.loadAccountsForFilter - טעינת חשבונות
 * - window.trading_accountsData - נתוני חשבונות
 */
window.resetAllFilters = async function() {
  try {
    // 1. המתנה למערכת האתחול המאוחדת (לפי LOADING_STANDARD)
    if (!isSystemsReady()) {
      console.log('⏳ מערכות עדיין לא מוכנות, ממתין לאתחול...');
      await waitForSystemsReady();
    }

    // 2. קבלת ההעדפות מהמערכת
    const preferences = await loadUserFilterPreferences();
    
    // 3. וידוא טעינת חשבונות מסחר לפני המרה
    if (typeof HeaderSystem !== 'undefined' && typeof HeaderSystem.loadAccountsForFilter === 'function') {
      try {
        console.log('🏦 טוען חשבונות מסחר לפני המרת העדפות...');
        await HeaderSystem.loadAccountsForFilter();
        console.log('✅ חשבונות מסחר נטענו:', window.trading_accountsData?.length || 0, 'חשבונות');
        
        // בדיקה מה יש בנתונים
        if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
          console.log('📋 רשימת חשבונות נטענים:', window.trading_accountsData.map(acc => ({ id: acc.id, name: acc.name, status: acc.status })));
        }
      } catch (error) {
        console.warn('שגיאה בטעינת חשבונות מסחר:', error);
      }
    }
    
    // 4. המרת ההעדפות לפורמט הנדרש (אסינכרונית)
    const filterValues = await convertPreferencesToFilterValues(preferences);
    
    // 5. עדכון הפילטרים במערכת
    if (window.filterSystem) {
      window.filterSystem.currentFilters = filterValues;
      window.filterSystem.saveFilters();
      await updateFilterUI(filterValues);
    }
    
    // 6. הצגת הודעה דרך מערכת ההודעות הכללית
    if (typeof window.showNotification === 'function') {
      window.showNotification('פילטרים אופסו לערכי ברירת מחדל', 'success', 'הצלחה', 2000, 'system');
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה באיפוס פילטרים:', error);
    // fallback לאיפוס רגיל
    if (typeof window.clearAllFilters === 'function') {
      window.clearAllFilters();
    }
    return false;
  }
};

/**
 * המתנה למערכת האתחול המאוחדת (עד 10 שניות)
 */
async function waitForSystemsReady(timeout = 10000) {
  const startTime = Date.now();
  
  while (!isSystemsReady()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('המערכות לא אותחלו תוך הזמן המוקצב');
    }
    
    // המתנה של 100ms לפני בדיקה חוזרת
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('✅ מערכות מוכנות להמשך');
}

/**
 * טעינת העדפות פילטרים מהמערכת
 * מיישם את מערכת האתחול המאוחדת ומערכות העדפות הנכונות
 */
async function loadUserFilterPreferences() {
    const preferenceNames = [
      'defaultSearchFilter',
      'defaultDateRangeFilter', 
      'defaultStatusFilter',
      'defaultTypeFilter',
      'defaultAccountFilter'
    ];
    
  // 1. בדיקה שהמערכות אותחלו (לפי מערכת האתחול המאוחדת)
  if (!isSystemsReady()) {
    throw new Error('מערכות העדפות ומטמון עדיין לא אותחלו - אנא המתין לאתחול');
  }

  // 2. ניקוי מטמון לפי הארכיטקטורה הנכונה
  await clearPreferencesCache();

  // 3. טעינה מהמערכת הראשית (PreferencesSystem V2) - לפי מערכת האתחול המאוחדת
  if (window.PreferencesSystem && window.PreferencesSystem.manager && window.PreferencesSystem.initialized) {
    try {
      console.log('🔄 טוען העדפות דרך PreferencesSystem V2');
      const allPrefs = await window.PreferencesSystem.manager.load(1, null, true);
      const result = preferenceNames.reduce((result, name) => {
        if (allPrefs[name] !== undefined) {
          result[name] = allPrefs[name];
          // לוג מיוחד עבור חשבון מסחר
          if (name === 'defaultAccountFilter') {
            console.log('🏦 העדפת חשבון מסחר נטענה:', { value: allPrefs[name], type: typeof allPrefs[name] });
          }
        }
        return result;
      }, {});
      
      console.log('📋 כל ההעדפות שנטענו:', result);
      return result;
    } catch (error) {
      console.warn('שגיאה בטעינה דרך PreferencesSystem V2:', error);
    }
  }

  // 4. Fallback למערכת הישנה - רק אם החדשה לא זמינה
  if (typeof window.getPreferencesByNames === 'function') {
    try {
      console.log('🔄 טוען העדפות דרך getPreferencesByNames (fallback)');
      const fallbackResult = await window.getPreferencesByNames(preferenceNames, 1, null, true);
      
      // לוג מיוחד עבור חשבון מסחר
      if (fallbackResult && fallbackResult.defaultAccountFilter) {
        console.log('🏦 העדפת חשבון מסחר (fallback):', { 
          value: fallbackResult.defaultAccountFilter, 
          type: typeof fallbackResult.defaultAccountFilter 
        });
      }
      
      return fallbackResult;
    } catch (error) {
      console.warn('שגיאה בטעינה דרך getPreferencesByNames:', error);
    }
  }

  throw new Error('לא ניתן לטעון העדפות - מערכות לא מוכנות או לא זמינות');
}

/**
 * בדיקה שהמערכות אותחלו לפי מערכת האתחול המאוחדת
 * מיישם את השלבים הנכונים מ-UNIFIED_INITIALIZATION_SYSTEM
 */
function isSystemsReady() {
  // בדיקה לפי שלבי האתחול המאוחד - Stage 3: Preferences System initialized
  const cacheReady = window.cacheSystemReady || 
                    (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized);
  
  // בדיקה שהמערכת אותחלה לפי שלב 3 במערכת האתחול המאוחדת
  const preferencesReady = (window.PreferencesSystem && window.PreferencesSystem.initialized) || 
                          (window.currentPreferences !== undefined) ||
                          (typeof window.getPreferencesByNames === 'function');
  
  // בדיקה שהכותרות אותחלו (Stage 2: UI Systems)
  const headerReady = (typeof window.HeaderSystem !== 'undefined') || 
                     (typeof window.initializeHeaderSystem === 'function');
  
  return cacheReady && preferencesReady && headerReady;
}

/**
 * ניקוי מטמון לפי הארכיטקטורה הנכונה
 */
async function clearPreferencesCache() {
  try {
    // ניקוי UnifiedCacheManager (המערכת הראשית)
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      await window.UnifiedCacheManager.remove('user-preferences');
    }

    // ניקוי preferencesCache (מערכת הישנה לתמיכה)
    if (window.preferencesCache && typeof window.preferencesCache.clear === 'function') {
      await window.preferencesCache.clear();
    }
  } catch (error) {
    console.warn('שגיאה בניקוי מטמון העדפות:', error);
  }
}

/**
 * המרת העדפות לפורמט נדרש לפילטרים
 * מיישם מערכות כלליות: מיפוי ערכים וטיפול בחשבונות
 */
async function convertPreferencesToFilterValues(preferences) {
  console.log('🔄 ממיר העדפות לפילטרים:', preferences);

  // מיפוי ערכים מאנגלית לעברית (לפי אפיון המערכת)
  const valueMappings = {
    type: { 'Swing': 'סווינג', 'Investment': 'השקעה', 'Passive': 'פסיבי' },
    status: { 'Open': 'פתוח', 'Closed': 'סגור', 'Cancelled': 'מבוטל' }
  };

  // המרת ערכי סוג וסטטוס
  const typeValue = valueMappings.type[preferences.defaultTypeFilter] || preferences.defaultTypeFilter;
  const statusValue = valueMappings.status[preferences.defaultStatusFilter] || preferences.defaultStatusFilter;

  // המרת ערך חשבון מסחר (השרת כבר מחזיר שם ולא ID)
  console.log('🏦 מטפל בערך חשבון מסחר מלא:', preferences.defaultAccountFilter);
  const accountValue = await mapAccountIdToName(preferences.defaultAccountFilter);
  console.log('🏦 ערך חשבון מסחר אחרי טיפול:', accountValue);

  const filterValues = {
    search: preferences.defaultSearchFilter || '',
    dateRange: preferences.defaultDateRangeFilter || 'כל זמן',
    status: isValidFilterValue(statusValue) ? [statusValue] : [],
    type: isValidFilterValue(typeValue) ? [typeValue] : [],
    account: isValidFilterValue(accountValue) ? [accountValue] : []
  };

  console.log('✅ פילטרים מומרים:', filterValues);
  return filterValues;
}

/**
 * בדיקה אם ערך פילטר תקין (לא "הכול" או ריק)
 */
function isValidFilterValue(value) {
  if (!value) return false;
  // ערכים לא תקינים שלא צריכים להיבחר
  const invalidValues = ['', 'all', 'הכל', 'הכול', 'כל החשבונות', 'כל החשבונות מסחר'];
  return !invalidValues.includes(value);
}

/**
 * טיפול בערך חשבון מסחר
 * השרת יכול להחזיר ID או שם חשבון מסחר - הקוד מטפל בשני המקרים:
 * 1. אם זה שם - מחזיר אותו ישירות
 * 2. אם זה ID - מחפש את השם המתאים ברשימת החשבונות
 */
async function mapAccountIdToName(accountValue) {
  // אם הערך לא קיים או ריק, החזר אותו ככה
  if (!accountValue || accountValue === '') {
    return accountValue;
  }

  // בדיקה אם זה כבר שם חשבון מסחר (לא מספרי) - השרת החזיר שם
  if (typeof accountValue === 'string' && isNaN(accountValue)) {
    // זה כבר שם חשבון מסחר, החזר אותו
    console.log('🔄 השרת החזיר שם חשבון מסחר:', accountValue);
    return accountValue;
  }

  // אם זה ID מספרי, נסה למצוא את השם המתאים
  if (typeof accountValue === 'string' && !isNaN(accountValue)) {
    console.log('🔄 מחליף ID חשבון מסחר לשם:', accountValue);
    
    // 1. חיפוש בנתונים הקיימים (window.trading_accountsData)
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
      const account = window.trading_accountsData.find(acc => 
        String(acc.id) === String(accountValue) && acc.status === 'open'
      );
      if (account) {
        console.log('✅ נמצא שם חשבון מסחר:', account.name);
        return account.name;
      }
    }

    // 2. נסיון לטעון חשבונות דרך HeaderSystem אם קיים
    if (typeof HeaderSystem !== 'undefined' && typeof HeaderSystem.loadAccountsForFilter === 'function') {
      try {
        await HeaderSystem.loadAccountsForFilter();
        // המתנה קצרה לוודא שהנתונים נטענו
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // בדיקה חוזרת לאחר הטעינה
        if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
          console.log('🔍 מחפש ID:', accountValue, 'בין', window.trading_accountsData.length, 'חשבונות');
          const account = window.trading_accountsData.find(acc => 
            String(acc.id) === String(accountValue) && acc.status === 'open'
          );
          if (account) {
            console.log('✅ נמצא שם חשבון מסחר אחרי טעינה:', account.name);
            return account.name;
    } else {
            console.log('⚠️ לא נמצא חשבון עם ID:', accountValue, 'פתוחים:', window.trading_accountsData.filter(a => a.status === 'open').length);
          }
        }
      } catch (error) {
        console.warn('לא ניתן לטעון חשבונות דרך HeaderSystem:', error);
      }
    }
    
    // 3. Fallback אחרון - טעינה ישירה מ-API
    try {
      console.log('🔄 טעינה ישירה מהשרת עבור ID:', accountValue);
      const response = await fetch('/api/trading-accounts/');
      const data = await response.json();
      const accounts = data.data || data;
      
      const account = accounts.find(acc => 
        String(acc.id) === String(accountValue) && acc.status === 'open'
      );
      
      if (account) {
        console.log('✅ נמצא שם חשבון מסחר דרך API ישיר:', account.name);
        return account.name;
      }
  } catch (error) {
      console.warn('שגיאה בטעינה ישירה מהשרת:', error);
    }
  }

  // fallback - החזרת הערך המקורי
  console.log('⚠️ החזרת ערך מקורי:', accountValue);
  return accountValue;
}

/**
 * עדכון UI של הפילטרים
 */
async function updateFilterUI(filterValues) {
  if (typeof window.updateFilterUI !== 'function') {
    return;
  }

  // עדכון מיידי
  window.updateFilterUI(filterValues);

  // עדכון נוסף אחרי המתנה קצרה (למקרה שהאלמנטים עדיין נטענים)
  setTimeout(() => {
    window.updateFilterUI(filterValues);
    if (window.filterSystem && typeof window.filterSystem.applyAllFilters === 'function') {
      window.filterSystem.applyAllFilters();
    }
  }, 300);
}

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
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('חיפוש נוקה בהצלחה', 'success', 'הצלחה', 1500, 'system');
    } else {
    }
  }
};

// Make HeaderSystem class available globally
window.HeaderSystemClass = HeaderSystem;

// Create global HeaderSystem object for compatibility with unified initialization
window.HeaderSystem = {
  initialize: function() {
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
    
    // הוספת מאזינים לאירועי מערכת האתחול המאוחדת
    setupInitializationEventListeners();
  } else {
    console.error('❌ HeaderSystem class not found');
  }
};

/**
 * הגדרת מאזיני אירועים למערכת האתחול המאוחדת
 * מיישם את האינטגרציה עם מערכת האתחול המאוחדת
 */
function setupInitializationEventListeners() {
  // מאזין לאירוע כאשר מערכת ההעדפות מוכנה
  window.addEventListener('preferences:loaded', async (event) => {
    console.log('📥 Preferences loaded event received:', event.detail);
    
  });

  // מאזין לאירוע כאשר מטמון מאוחד מוכן
  if (window.UnifiedCacheManager) {
    window.UnifiedCacheManager.addEventListener?.('ready', () => {
      console.log('💾 Unified cache manager ready - header system can use cache');
    });
  }
}


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
  
  const isOpen = !headerFilters.classList.contains('filters-hidden');
  
  if (isOpen) {
    // פילטר פתוח - הצג כפתור משני (בתוך הפילטר)
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
    const filterMenus = document.querySelectorAll('.filter-menu');
    filterMenus.forEach((menu, index) => {
        const computedStyle = window.getComputedStyle(menu);
        console.log(`תפריט פילטר ${index + 1}: z-index = ${computedStyle.zIndex}`);
    });
    
    console.log('=====================================');
};

// ===== CACHE MANAGEMENT - REDIRECTED TO CACHE-TEST PAGE =====
// כל ניהול המטמון מרוכז בעמוד /cache-test

// כל בדיקות המטמון מרוכזות בעמוד /cache-test


// Note: Header system initialization is called from core-systems.js Stage 2: UI Systems
// The function window.initializeHeaderSystem() is available and will be called automatically

