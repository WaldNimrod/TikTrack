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

// Logger will be available after initialization
try { console.log('🚀 header-system.js loaded'); } catch(_) {}
if (window.Logger) { window.Logger.info('🚀 Loading Header System v6.0.0...', { page: "header-system" }); }

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
    
    // יצירת מערכת הפילטרים
    if (typeof HeaderSystem.createFilterSystem === 'function') {
      HeaderSystem.createFilterSystem();
    }
    
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
    // window.Logger.info('🔧 Checking if filter functions are defined:', { page: "header-system" });
    window.Logger.info('selectStatusOption:', typeof window.selectStatusOption, { page: "header-system" });
    window.Logger.info('updateStatusFilterText:', typeof window.updateStatusFilterText, { page: "header-system" });
    window.Logger.info('applyStatusFilter:', typeof window.applyStatusFilter, { page: "header-system" });
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
                        <li><a class="tiktrack-dropdown-item" href="/external-data-dashboard">📊 דשבורד נתונים חיצוניים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notifications-center">🔔 מרכז התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/background-tasks">⚙️ ניהול משימות ברקע</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/server-monitor">🖥️ ניטור שרת</a></li>
                        
                        <li class="separator"></li>
                        
                        <!-- כלי פיתוח -->
                        <li><a class="tiktrack-dropdown-item" href="/init-system-management">🚀 ניהול מערכת אתחול</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/code-quality-dashboard">📊 איכות קוד</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/duplicate-detector">🔍 זיהוי כפילויות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/system-management">🔧 מנהל מערכת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/page-scripts-matrix">📄 מטריקס JS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/js-map">🗺️ מפת JS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/linter-realtime-monitor">🔍 דשבורד Linter</a></li>
                        
                        <li class="separator"></li>
                        
                        <!-- ייבוא נתונים -->
                        <li><a class="tiktrack-dropdown-item" href="/pages/import-user-data.html">📥 ייבוא נתוני משתמש</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/chart-management">📊 ניהול גרפים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/css-management">🎨 מנהל CSS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/crud-testing-dashboard">🧪 בדיקות CRUD</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cache-test">💾 בדיקת Cache</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/constraints">🔒 אילוצים</a></li>
                        
                        <li class="separator"></li>
                        
                        <!-- ממשק משתמש -->
                        <li><a class="tiktrack-dropdown-item" href="/dynamic-colors-display">🌈 צבעים דינמיים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">🧪 בדיקת כותרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">🎭 עיצובים</a></li>


                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="clearCacheForDevelopment(event)" 
                         title="ניקוי מטמון לפיתוח">
                        <span class="nav-text" style="color: #ff0000; font-size: 1.2rem;">🧹</span>
                      </a>
                      <ul class="submenu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 200px; z-index: 1000; padding: 0; margin: 0; list-style: none;">
                        <li><a href="#" onclick="clearUIState(event)" 
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;"
                               title="נקה העדפות UI בלבד">נקה העדפות UI</a></li>
                        <li><a href="#" onclick="clearAllCacheForDevelopment(event)" 
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;"
                               title="נקה כל ה-localStorage">נקה כל localStorage</a></li>
                        <li><a href="#" onclick="hardReload(event)" 
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px;"
                               title="רענון קשיח של העמוד">רענון קשיח</a></li>
                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="runQuickQualityCheck(event)" 
                         title="בדיקת איכות מהירה">
                        <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">⚡</span>
                      </a>
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
                        data-onclick="toggleHeaderFilters()">
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
                <button class="filter-toggle status-filter-toggle" id="statusFilterToggle">
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
                <button class="filter-toggle type-filter-toggle" id="typeFilterToggle">
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

            <!-- פילטר חשבון מסחר -->
            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle account-filter-toggle" id="accountFilterToggle">
                  <span class="selected-value selected-account-text" id="selectedAccount">כל חשבון מסחר</span>
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
                <button class="filter-toggle date-range-filter-toggle" id="dateRangeFilterToggle">
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
                      data-onclick="toggleHeaderFilters()">
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
    
    // הוספת סגנונות CSS
    HeaderSystem.addStyles();
    
    // עדכון מצב הכפתורים בטעינה הראשונית
    setTimeout(() => {
      window.updateToggleButtons();
    }, 100);
    
    // עדכון נוסף לאחר טעינה מלאה
    setTimeout(() => {
      window.updateToggleButtons();
    }, 500);
    
    // אין מאזיני click כפולים כאן. הטיפול מתבצע דרך data-onclick ע"י EventHandlerManager.
    
    // בדיקת מעבר עכבר לכפתורי פילטר
    setTimeout(() => {
      const filterButtons = document.querySelectorAll('.filter-toggle[data-onclick]');
      console.log('🔍 Found filter buttons:', filterButtons.length);
      
      filterButtons.forEach((btn, index) => {
        console.log(`🔍 Button ${index}:`, {
          id: btn.id,
          className: btn.className,
          dataOnclick: btn.getAttribute('data-onclick'),
          visible: btn.offsetParent !== null,
          clickable: btn.offsetWidth > 0 && btn.offsetHeight > 0
        });
        
        // בדיקת מעבר עכבר
        btn.addEventListener('mouseenter', () => {
          console.log('🖱️ Mouse ENTER on filter button:', btn.id, btn.getAttribute('data-onclick'));
        });
        
        btn.addEventListener('click', (e) => {
          console.log('🖱️ CLICK on filter button:', btn.id, btn.getAttribute('data-onclick'));
          console.log('🖱️ Event details:', {
            target: e.target,
            currentTarget: e.currentTarget,
            bubbles: e.bubbles,
            cancelable: e.cancelable
          });
        });
      });
    }, 1000);
    
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

  static addStyles() {
    const style = document.createElement('style');
    style.textContent = HeaderSystem.getHeaderStyles();
    document.head.appendChild(style);
  }

  static getHeaderStyles() {
    return `
      /* Reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* Header Styles - Basic styles only, main styles in header-styles.css */
      .header-content {
        position: relative;
        width: 100%;
        margin: 0 auto;
        z-index: 960;
        display: flex;
        flex-direction: column;
      }

      .header-top {
        padding: 15px 0;
        width: 100%;
        margin: 0;
      }

      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: visible;
      }

      /* Ensure dropdown menus render above all header elements */
      #unified-header .filter-menu {
        z-index: 2000;
        pointer-events: auto;
      }
      #unified-header .filter-menu.show {
        display: block;
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        z-index: 2000;
      }
      /* Header wrapper above main content just in case */
      #unified-header .header-content { z-index: 1990; }

      /* דריסת CSS חיצוני */
      #unified-header .header-top .logo-section {
        order: 2 !important;
        margin-right: 0 !important;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      #unified-header .header-top .header-nav {
        order: 1 !important;
        margin-left: 0 !important;
        flex: 1;
        display: flex;
        justify-content: flex-start;
      }

      .main-nav {
        display: flex;
      }

      .tiktrack-nav-list {
        display: flex;
        list-style: none;
        gap: 30px;
        align-items: center;
      }

      .tiktrack-nav-item {
        position: relative;
      }

      .tiktrack-nav-link {
        text-decoration: none;
        padding: 10px 15px;
        border-radius: 5px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tiktrack-nav-link:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
      }

      .nav-icon {
        width: 24px;
        height: 24px;
      }

      .nav-text {
        font-weight: 500;
      }

      .tiktrack-dropdown-arrow {
        font-size: 12px;
        transition: transform 0.3s ease;
      }

      .tiktrack-nav-item.dropdown:hover .tiktrack-dropdown-arrow {
        transform: rotate(180deg);
      }

      .tiktrack-dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 954;
      }

      .tiktrack-nav-item.dropdown:hover .tiktrack-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .tiktrack-dropdown-item {
        color: #333;
        text-decoration: none;
        padding: 12px 20px;
        display: block;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.3s ease;
      }

      .tiktrack-dropdown-item:hover {
        background: #f8f9fa;
        color: #667eea;
      }

      .tiktrack-dropdown-item:last-child {
        border-bottom: none;
      }

      .separator {
        height: 1px;
        background: #e0e0e0;
        margin: 5px 0;
      }


      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-image {
        width: 40px;
        height: 40px;
      }

      .logo-text {
        font-size: 18px;
        font-weight: bold;
        color: white;
      }

      /* Filter Toggle Button */
            .filter-toggle-section {
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
        display: none;
        visibility: visible;
        opacity: 1;
      }
      
      /* כפתור ראשי - בתוך התפריט הראשי, מתחת לתפריטי המשנה */
      .filter-toggle-main {
        bottom: -10px;
        z-index: 951;
      }
      
      /* כפתור משני - בתוך הפילטר, מתחת לתפריטי המשנה */
      .filter-toggle-secondary {
        z-index: 951;
      }

      .header-filter-toggle-btn {
        background: rgba(255,255,255,0.9);
        border: 1px solid #fb5a05;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        min-width: 20px;
        min-height: 20px;
        max-width: 20px;
        max-height: 20px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        display: flex !important;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative;
        z-index: 952;
      }

      .header-filter-toggle-btn:hover {
        background: white;
        transform: scale(1.1);
        border-color: #fb5a05;
      }

      .header-filter-arrow {
        font-size: 10px;
        color: #fb5a05;
        transition: transform 0.3s ease;
      }

      .header-filter-toggle-btn.collapsed .header-filter-arrow {
        transform: rotate(-90deg);
      }

      /* Filter Styles */
      .header-filters {
        background: rgba(255,255,255,0.95);
        padding: 0;
        margin: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        display: block; /* פתוח כברירת מחדל */
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      .filters-container {
        max-width: var(--container-xl, 1400px);
        margin: 0 auto;
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: nowrap;
        padding: 0;
        height: 100%;
        overflow-x: auto;
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .filter-toggle {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 4px 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 120px;
        justify-content: space-between;
        font-size: 0.9em;
      }

      .filter-toggle:hover {
        border-color: #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      }

      .filter-toggle.active {
        border-color: #667eea;
        background: #f8f9ff;
      }

      .selected-value {
        color: #333;
        font-weight: 500;
      }

      .dropdown-arrow {
        color: #667eea;
        font-size: 12px;
        transition: transform 0.3s ease;
      }

      .filter-toggle.active .dropdown-arrow {
        transform: rotate(180deg);
      }

      .filter-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 150px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 953;
        max-height: 200px;
        overflow-y: auto;
      }

      .filter-toggle.active .filter-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .status-filter-item,
      .type-filter-item,
      .account-filter-item,
      .date-range-filter-item {
        padding: 6px 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 1px solid #f0f0f0;
      }

      .status-filter-item:hover,
      .type-filter-item:hover,
      .account-filter-item:hover,
      .date-range-filter-item:hover {
        background: #f8f9ff;
        color: #667eea;
      }

      .status-filter-item:last-child,
      .type-filter-item:last-child,
      .account-filter-item:last-child,
      .date-range-filter-item:last-child {
        border-bottom: none;
      }

      .status-filter-item.selected,
      .type-filter-item.selected,
      .account-filter-item.selected,
      .date-range-filter-item.selected {
        background: rgba(102, 126, 234, 0.3);
        color: #667eea;
        font-weight: 600;
      }

      .option-text {
        font-weight: 500;
      }

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-filter-input {
        padding: 5px 40px 5px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        min-width: 200px;
        transition: all 0.3s ease;
      }

      .search-filter-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .search-clear-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 16px;
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        max-width: 16px;
        max-height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.3s ease;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        z-index: 10;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      .search-input-wrapper:hover .search-clear-btn,
      .search-filter-input:focus + .search-clear-btn {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .search-clear-btn:hover {
        color: #667eea;
        background: none;
        transform: translateY(-50%);
      }

      .filter-actions {
        display: flex;
        gap: 10px;
      }

      .filter-action-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
        background: white;
        border: 1px solid #26baac;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: normal;
        color: #26baac;
      }

      .clear-btn {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        min-height: 28px !important;
        max-width: 28px !important;
        max-height: 28px !important;
        background: white;
        border: 1px solid #fb5a05;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: normal;
        color: #fb5a05;
        padding: 0 !important;
        margin: 0;
        flex-shrink: 0 !important;
        box-sizing: border-box;
      }

      .reset-btn:hover {
        background: #26baac;
        color: white;
      }

      .clear-btn:hover {
        background: #fb5a05;
        color: white;
      }

      .cache-btn {
        background: #ffc107;
        color: #212529;
      }

      .cache-btn:hover {
        background: #e0a800;
        transform: translateY(-2px);
      }

      .btn-text {
        font-weight: 500;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .header-container {
          flex-direction: column;
          gap: 20px;
        }

        .tiktrack-nav-list {
          flex-wrap: wrap;
          gap: 15px;
        }

        .filters-container {
          flex-direction: column;
          align-items: stretch;
          padding: 0 15px;
          gap: 15px;
          margin-top: 15px;
        }

        .filter-group {
          justify-content: center;
        }

        .filter-toggle {
          min-width: 200px;
        }

        .search-filter-input {
          min-width: 250px;
        }
      }

    `;
  }


  static async loadAccountsForFilter() {
    // window.Logger.info('🔧 loadAccountsForFilter - מתחיל טעינת חשבונות מסחר', { page: "header-system" });
    
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
      
      // window.Logger.info('🔧 נמצאו חשבונות:', openAccounts.length, openAccounts.map(a => a.name, { page: "header-system" }));
      
      // עדכון תפריט החשבונות
      const accountMenu = document.getElementById('accountFilterMenu');
        // window.Logger.info('🔧 accountMenu element:', accountMenu, { page: "header-system" });
        
        if (accountMenu) {
          // מחיקת חשבונות קיימים (חוץ מ"הכול")
          const existingItems = accountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])');
          // window.Logger.info('🔧 מוחק חשבונות קיימים:', existingItems.length, { page: "header-system" });
          existingItems.forEach(item => item.remove());
          
          // הוספת חשבונות פתוחים
          openAccounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.className = 'account-filter-item';
            // שימוש ב-ID במקום שם - כפי ששמור בהעדפות (default_trading_account)
            accountItem.setAttribute('data-value', account.id);
            accountItem.onclick = () => selectAccountOption(account.id);
            accountItem.innerHTML = `<span class="option-text">${account.name}</span>`;
            accountMenu.appendChild(accountItem);
            // window.Logger.info('🔧 הוספתי חשבון מסחר:', account.name, { page: "header-system" });
          });
          
          // window.Logger.info(`✅ Loaded ${openAccounts.length} open trading accounts for filter`, { page: "header-system" });
          // window.Logger.info('🔧 סה"כ פריטים בתפריט:', accountMenu.children.length, { page: "header-system" });
      } else {
        // window.Logger.error('❌ accountFilterMenu לא נמצא!', { page: "header-system" });
      }
      
    } catch (error) {
      // window.Logger.info('⚠️ Error loading trading accounts for filter:', error, { page: "header-system" });
    }
  }

  static loadSavedState() {
    // window.Logger.info('🔧 Loading saved filter state...', { page: "header-system" });
    
    // המתן שהמערכת תהיה מוכנה
    setTimeout(() => {
      if (window.filterSystem && window.filterSystem.currentFilters) {
        // window.Logger.info('🔧 Current filters from system:', window.filterSystem.currentFilters, { page: "header-system" });
        
        // עדכון UI של פילטר הסטטוס
        if (window.filterSystem.currentFilters.status && window.filterSystem.currentFilters.status.length > 0) {
          // window.Logger.info('🔧 Updating status filter UI with:', window.filterSystem.currentFilters.status, { page: "header-system" });
          HeaderSystem.updateFilterUI('status', window.filterSystem.currentFilters.status);
        }
        
        // עדכון UI של פילטר הסוג
        if (window.filterSystem.currentFilters.type && window.filterSystem.currentFilters.type.length > 0) {
          // window.Logger.info('🔧 Updating type filter UI with:', window.filterSystem.currentFilters.type, { page: "header-system" });
          HeaderSystem.updateFilterUI('type', window.filterSystem.currentFilters.type);
        }
        
        // עדכון UI של פילטר החשבון מסחר
        if (window.filterSystem.currentFilters.account && window.filterSystem.currentFilters.account.length > 0) {
          // window.Logger.info('🔧 Updating account filter UI with:', window.filterSystem.currentFilters.account, { page: "header-system" });
          HeaderSystem.updateFilterUI('account', window.filterSystem.currentFilters.account);
        }
        
        // עדכון UI של פילטר התאריכים
        if (window.filterSystem.currentFilters.dateRange) {
          // window.Logger.info('🔧 Updating date range filter UI with:', window.filterSystem.currentFilters.dateRange, { page: "header-system" });
          HeaderSystem.updateFilterUI('dateRange', window.filterSystem.currentFilters.dateRange);
        }
      }
    }, 500); // המתן 500ms שהמערכת תהיה מוכנה
  }
  
  static updateFilterUI(filterType, selectedValues) {
    // window.Logger.info(`🔧 Updating ${filterType} filter UI with:`, selectedValues, { page: "header-system" });
    
    if (filterType === 'status') {
      // ביטול כל הבחירות
      const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
      statusItems.forEach(item => item.classList.remove('selected'));
      
      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(`#statusFilterMenu .status-filter-item[data-value="${value}"]`);
        if (item) {
          item.classList.add('selected');
          window.Logger.info(`🔧 Selected status item: ${value}`, { page: "header-system" });
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
          window.Logger.info(`🔧 Selected type item: ${value}`, { page: "header-system" });
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
          window.Logger.info(`🔧 Selected account item: ${value}`, { page: "header-system" });
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
        // window.Logger.info(`🔧 Selected date range item: ${selectedValues}`, { page: "header-system" });
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
        
        // שמירת פילטרים
        saveFilters() {
          localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
        },
        
        // טעינת פילטרים
        loadFilters() {
          const saved = localStorage.getItem('headerFilters');
          if (saved) {
            try {
              this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
              window.Logger.info('🔧 Loaded saved filters:', this.currentFilters, { page: "header-system" });
            } catch (e) {
              window.Logger.info('⚠️ Error loading saved filters:', e, { page: "header-system" });
            }
          }
        },
        
        // הפעלת פילטרים על כל הטבלאות
        applyAllFilters() {
          window.Logger.info('🔧 applyAllFilters called', { page: "header-system" });
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
                // תרגום סטטוס מאנגלית לעברית כדי להתאים לפילטר
                const translatedRowStatus = rowStatus && (
                  window.translateTickerStatus && window.translateTickerStatus(rowStatus) ||
                  window.translateTradePlanStatus && window.translateTradePlanStatus(rowStatus) ||
                  rowStatus
                );
                shouldShow = shouldShow && this.currentFilters.status.includes(translatedRowStatus);
              }
            }
            
            // פילטר סוג - רק אם יש שדה רלוונטי בטבלה
            if (this.currentFilters.type.length > 0 && !this.currentFilters.type.includes('הכול')) {
              // בדיקת שתי התכונות שונות - data-investment-type לטבלאות trades/trade_plans ו-data-type לטבלאות tickers
              const typeCell = row.querySelector('td[data-investment-type]') || row.querySelector('td[data-type]');
              if (typeCell) {
                // יש שדה סוג - בדוק את הפילטר
                const rowType = typeCell.getAttribute('data-investment-type') || typeCell.getAttribute('data-type');
                const rowTypeText = typeCell.textContent.trim();
                
                // תרגום סוג מאנגלית לעברית כדי להתאים לפילטר
                const translatedRowType = rowType && (
                  window.translateTradePlanType && window.translateTradePlanType(rowType) ||
                  window.translateTradeType && window.translateTradeType(rowType) ||
                  rowType
                );
                
                // בדיקה גם לפי data attribute וגם לפי טקסט
                const typeMatches = this.currentFilters.type.includes(translatedRowType) || 
                                  this.currentFilters.type.includes(rowTypeText);
                
                // לוג לדיבוג
                console.log('🔍 Type filter:', {
                  rowType,
                  translatedRowType,
                  rowTypeText,
                  filterValues: this.currentFilters.type,
                  typeMatches
                });
                
                shouldShow = shouldShow && typeMatches;
              } else {
                console.log('✅ No type cell - showing all rows');
              }
              // אם אין שדה סוג - תמיד הצג (לא מסנן)
            }
            
            // פילטר חשבון מסחר
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
          
          window.Logger.info(`✅ ${tableId}: ${visibleCount}/${rows.length} rows visible`, { page: "header-system" });
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
  window.Logger.info('🔧 toggleHeaderFilters called - Header filter system only', { page: "header-system" });
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
    
    window.Logger.info(`✅ Header filters ${isVisible ? 'hidden' : 'shown'}`, { page: "header-system" });
    
    // עדכון מצב הכפתורים
    window.updateToggleButtons();
  }
};

window.toggleStatusFilterMenu = function() {
  console.log('🚀 toggleStatusFilterMenu CALLED! (legacy click handler)', { timestamp: new Date().toISOString() });
  window.Logger.info('🔧 toggleStatusFilterMenu called (legacy)', { page: "header-system" });
  const menu = document.getElementById('statusFilterMenu');
  const btn = document.getElementById('statusFilterToggle');
  
  if (menu && btn) {
    const isCurrentlyOpen = menu.classList.contains('show');
    
    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) { window.Logger.info('🔧 Status filter menu closed (legacy)', { page: "header-system" }); }
      console.log('[header] toggleStatusFilterMenu -> closed (legacy)');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      openFilterMenuPortal(menu, btn, 'status');
      if (window.Logger) { window.Logger.info('🔧 Status filter menu opened (legacy)', { page: "header-system" }); }
      console.log('[header] toggleStatusFilterMenu -> open (legacy)');
      logFilterMenuDiagnostics('statusFilterMenu');
    }
  } else {
    console.error('❌ statusFilterMenu element not found!');
  }
};

window.toggleTypeFilterMenu = function() {
  window.Logger.info('🔧 toggleTypeFilterMenu called', { page: "header-system" });
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    const isCurrentlyOpen = menu.classList.contains('show');
    
    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) { window.Logger.info('🔧 Type filter menu closed', { page: "header-system" }); }
      console.log('[header] toggleTypeFilterMenu -> closed');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      const btn = document.getElementById('typeFilterToggle');
      if (btn) {
        openFilterMenuPortal(menu, btn, 'type');
      }
      if (window.Logger) { window.Logger.info('🔧 Type filter menu opened', { page: "header-system" }); }
      console.log('[header] toggleTypeFilterMenu -> open');
      logFilterMenuDiagnostics('typeFilterMenu');
    }
  }
};

window.toggleAccountFilterMenu = function() {
  window.Logger.info('🔧 toggleAccountFilterMenu called', { page: "header-system" });
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    const isCurrentlyOpen = menu.classList.contains('show');
    
    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) { window.Logger.info('🔧 Account filter menu closed', { page: "header-system" }); }
      console.log('[header] toggleAccountFilterMenu -> closed');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      const btn = document.getElementById('accountFilterToggle');
      if (btn) {
        openFilterMenuPortal(menu, btn, 'account');
      }
      if (window.Logger) { window.Logger.info('🔧 Account filter menu opened', { page: "header-system" }); }
      console.log('[header] toggleAccountFilterMenu -> open');
      logFilterMenuDiagnostics('accountFilterMenu');
    }
  }
};

window.toggleDateRangeFilterMenu = function() {
  window.Logger.info('🔧 toggleDateRangeFilterMenu called', { page: "header-system" });
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    const isCurrentlyOpen = menu.classList.contains('show');
    
    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) { window.Logger.info('🔧 Date range filter menu closed', { page: "header-system" }); }
      console.log('[header] toggleDateRangeFilterMenu -> closed');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      const btn = document.getElementById('dateRangeFilterToggle');
      if (btn) {
        openFilterMenuPortal(menu, btn, 'date');
      }
      if (window.Logger) { window.Logger.info('🔧 Date range filter menu opened', { page: "header-system" }); }
      console.log('[header] toggleDateRangeFilterMenu -> open');
      logFilterMenuDiagnostics('dateRangeFilterMenu');
    }
  }
};

// ===== Diagnostics for filter menus visibility/z-index =====
function logFilterMenuDiagnostics(menuId) {
  try {
    const el = document.getElementById(menuId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + Math.min(10, rect.height / 2);
    const topEl = document.elementFromPoint(centerX, centerY);
    const stackInfo = {
      position: cs.position,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      zIndex: cs.zIndex,
      transform: cs.transform,
      pointerEvents: cs.pointerEvents,
    };
    const parent = el.parentElement;
    const parentCS = parent ? window.getComputedStyle(parent) : null;
    const parentInfo = parent ? {
      tag: parent.tagName,
      class: parent.className,
      id: parent.id,
      position: parentCS.position,
      zIndex: parentCS.zIndex,
      overflow: parentCS.overflow,
    } : null;
    window.Logger && window.Logger.info('🔎 FilterMenu diagnostics', {
      menuId,
      rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
      computed: stackInfo,
      parent: parentInfo,
      topElement: topEl ? { tag: topEl.tagName, class: topEl.className, id: topEl.id } : null,
      page: 'header-system'
    });
  } catch (e) {
    console.error('Diagnostics error:', e);
  }
}

// ===== Portal helpers for filter menus =====
let __headerFilterPortals = new Map();

function openFilterMenuPortal(originalMenuEl, anchorBtn, kind) {
  try {
    // If already portaled, just ensure position and return
    if (__headerFilterPortals.has(originalMenuEl.id)) {
      positionPortal(__headerFilterPortals.get(originalMenuEl.id), anchorBtn);
      return;
    }

    // Create portal container
    const portal = originalMenuEl.cloneNode(true);
    portal.id = originalMenuEl.id + '_portal';
    portal.classList.add('show');
    Object.assign(portal.style, {
      position: 'fixed',
      display: 'block',
      visibility: 'visible',
      opacity: '0',
      pointerEvents: 'auto',
      zIndex: '2000',
      transition: 'opacity 0.2s ease-in-out'
    });

    // append first so measurements (offsetWidth/Height) are valid
    document.body.appendChild(portal);
    // lock width to original (or fallback to 200px)
    const originalWidth = originalMenuEl.offsetWidth || 200;
    portal.style.width = originalWidth + 'px';
    portal.style.minWidth = originalWidth + 'px';
    portal.style.maxWidth = originalWidth + 'px';
    
    positionPortal(portal, anchorBtn);

    // Remember and wire cleanup
    __headerFilterPortals.set(originalMenuEl.id, portal);
    const reposition = () => positionPortal(portal, anchorBtn);
    portal.__repositionHandler = reposition;
    
    // Update portal selections to match original
    updatePortalSelections();
    
    // Remove onclick attributes from portal items (prevent duplicate events)
    portal.querySelectorAll('[onclick]').forEach(item => item.removeAttribute('onclick'));
    
    // Add event listeners to portal items
    addPortalEventListeners(portal, originalMenuEl);
    
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    // Fade in effect
    requestAnimationFrame(() => {
      portal.style.opacity = '1';
    });

    console.log(`🧩 Portal opened for ${kind} menu`, { id: originalMenuEl.id, portalId: portal.id });
  } catch (e) {
    console.warn('⚠️ Failed to open portal menu:', e?.message);
  }
}

function closeFilterMenuPortal(originalMenuEl) {
  try {
    const portal = __headerFilterPortals.get(originalMenuEl.id);
    if (!portal) return;
    
    // Fade out effect
    portal.style.opacity = '0';
    setTimeout(() => {
      window.removeEventListener('scroll', portal.__repositionHandler, true);
      window.removeEventListener('resize', portal.__repositionHandler);
      portal.remove();
      __headerFilterPortals.delete(originalMenuEl.id);
      console.log('🧩 Portal removed for menu', originalMenuEl.id);
    }, 200); // Match transition duration
  } catch (e) {
    console.warn('⚠️ Failed to close portal menu:', e?.message);
  }
}

function positionPortal(portalEl, anchorBtn) {
  const rect = anchorBtn.getBoundingClientRect();
  const margin = 4;
  const isRTL = (document.documentElement.getAttribute('dir') || 'rtl').toLowerCase() === 'rtl';
  const top = Math.min(rect.bottom + margin, window.innerHeight - portalEl.offsetHeight - 8);
  if (isRTL) {
    const rightPx = Math.max(8, Math.min(window.innerWidth - rect.right, window.innerWidth - 8));
    portalEl.style.right = rightPx + 'px';
    portalEl.style.left = 'auto';
  } else {
    const leftPx = Math.max(8, Math.min(rect.left, window.innerWidth - portalEl.offsetWidth - 8));
    portalEl.style.left = leftPx + 'px';
    portalEl.style.right = 'auto';
  }
  portalEl.style.top = top + 'px';
}

// ===== Auto-close other filter menus when opening one =====
function closeAllFilterMenus() {
  const menuIds = ['statusFilterMenu', 'typeFilterMenu', 'accountFilterMenu', 'dateRangeFilterMenu'];
  menuIds.forEach(id => {
    const menu = document.getElementById(id);
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
    }
  });
  
  // Also close any existing portals
  if (__headerFilterPortals) {
    __headerFilterPortals.forEach((portal, menuId) => {
      try {
        portal.style.opacity = '0';
        setTimeout(() => {
          window.removeEventListener('scroll', portal.__repositionHandler, true);
          window.removeEventListener('resize', portal.__repositionHandler);
          portal.remove();
          __headerFilterPortals.delete(menuId);
          console.log('🧩 Portal removed for menu', menuId);
        }, 200);
      } catch (e) {
        console.warn('⚠️ Failed to close portal menu:', e?.message);
      }
    });
  }
}

// ===== Hover behavior for filter menus =====
let hoverTimeouts = new Map();

// ===== Update filter selections in UI =====
function updateFilterSelections(filters) {
  console.log('🔄 Updating filter selections:', filters);

  // Map backend preference values (English keys) to UI values (Hebrew labels)
  const mapToUi = {
    // generic
    all: 'הכול',
    // status values
    open: 'פתוח',
    closed: 'סגור',
    cancelled: 'בוטל',
    // type values (case insensitive)
    swing: 'סווינג',
    Swing: 'סווינג',
    investment: 'השקעה',
    Investment: 'השקעה',
    passive: 'פסיבי',
    Passive: 'פסיבי',
    // date ranges
    all_time: 'כל זמן',
    any: 'כל זמן',
    everything: 'כל זמן',
    today: 'היום',
    yesterday: 'אתמול',
    this_week: 'השבוע',
    last_7_days: 'שבוע',
    this_month: 'החודש',
    this_year: 'השנה',
    last_year: 'שנה קודמת',
    last_month: 'חודש קודם',
    last_week: 'שבוע קודם',
    last_30_days: 'שנה' // נשתמש ב-365 ימים (שנה) כקרוב ביותר ל-30 ימים
  };

  const normalizeMulti = (val) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return [];
    if (Array.isArray(val)) {
      const mapped = val.map(v => mapToUi[v] || v).filter(Boolean);
      // אם יש רק 'הכול' - החזר מערך ריק (זה אומר "כל")
      if (mapped.length === 1 && mapped[0] === 'הכול') return [];
      // אחרת, סנן את 'הכול' אם יש ערכים אחרים
      return mapped.filter(v => v !== 'הכול');
    }
    // single value
    if (String(val).toLowerCase() === 'all') return [];
    const mapped = mapToUi[val] || val;
    return mapped === 'הכול' ? [] : [mapped];
  };

  const normalizeDate = (val) => {
    if (!val) return 'כל זמן';
    const mapped = mapToUi[val] || val;
    // אם הערך עדיין באנגלית/לא קיים בתפריט – ננעל ל"כל זמן"
    const uiValues = new Set(Array.from(document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item'))
      .map(el => el.getAttribute('data-value')));
    return uiValues.has(mapped) ? mapped : 'כל זמן';
  };

  const uiFilters = {
    status: normalizeMulti(filters.status),
    type: normalizeMulti(filters.type),
    account: normalizeMulti(filters.account),
    dateRange: normalizeDate(filters.dateRange)
  };
  
  console.log('🔍 מיפוי ערכים - original status:', filters.status, 'mapped status:', uiFilters.status);
  console.log('🔍 מיפוי ערכים - original type:', filters.type, 'mapped type:', uiFilters.type);
  console.log('🔍 מיפוי ערכים - original account:', filters.account, 'mapped account:', uiFilters.account);
  console.log('🔍 מיפוי ערכים - original dateRange:', filters.dateRange, 'mapped dateRange:', uiFilters.dateRange);
  
  // עדכון סטטוס
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (uiFilters.status && uiFilters.status.length > 0 && uiFilters.status.includes(value)) {
      item.classList.add('selected');
    } else if (!uiFilters.status || uiFilters.status.length === 0) {
      if (value === 'הכול') item.classList.add('selected');
    }
  });
  
  // עדכון סוג
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (uiFilters.type && uiFilters.type.length > 0 && uiFilters.type.includes(value)) {
      item.classList.add('selected');
    } else if (!uiFilters.type || uiFilters.type.length === 0) {
      if (value === 'הכול') item.classList.add('selected');
    }
  });
  
  // עדכון חשבון
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  accountItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (uiFilters.account && uiFilters.account.includes(value)) {
      item.classList.add('selected');
    } else if (!uiFilters.account || uiFilters.account.length === 0) {
      if (value === 'הכול') item.classList.add('selected');
    }
  });
  
  // עדכון טווח תאריכים
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateRangeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (value === uiFilters.dateRange) {
      item.classList.add('selected');
    }
  });

  // Update main buttons data-selected for Button System and fire a unified event
  try {
    const statusBtn = document.getElementById('statusFilterToggle');
    const typeBtn = document.getElementById('typeFilterToggle');
    const accountBtn = document.getElementById('accountFilterToggle');
    const dateBtn = document.getElementById('dateRangeFilterToggle');

    if (statusBtn) statusBtn.setAttribute('data-selected', (uiFilters.status || []).join(','));
    if (typeBtn) typeBtn.setAttribute('data-selected', (uiFilters.type || []).join(','));
    if (accountBtn) accountBtn.setAttribute('data-selected', (uiFilters.account || []).join(','));
    if (dateBtn) dateBtn.setAttribute('data-selected', uiFilters.dateRange || 'כל זמן');

    // Update visible texts
    if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
    if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
    if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
    if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();

    // Notify systems listening for filter updates
    const evt = new CustomEvent('tiktrack:filters-updated', {
      detail: { filters: uiFilters, source: 'header-system' }
    });
    document.dispatchEvent(evt);
  } catch (e) {
    console.warn('Failed updating main button state:', e?.message);
  }
}

// ===== Add event listeners to portal items =====
function addPortalEventListeners(portal, originalMenu) {
  const portalItems = portal.querySelectorAll('[data-value]');
  portalItems.forEach(portalItem => {
    const value = portalItem.getAttribute('data-value');
    const menuId = originalMenu.id;
    
    portalItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log(`🖱️ Portal item clicked:`, { value, menuId });
      
      // Call the appropriate selection function based on menu type
      if (menuId === 'statusFilterMenu') {
        window.selectStatusOption(value);
      } else if (menuId === 'typeFilterMenu') {
        window.selectTypeOption(value);
      } else if (menuId === 'accountFilterMenu') {
        window.selectAccountOption(value);
      } else if (menuId === 'dateRangeFilterMenu') {
        window.selectDateRangeOption(value);
      }
    });
  });
}

// ===== Update portal selections =====
function updatePortalSelections() {
  if (__headerFilterPortals) {
    __headerFilterPortals.forEach((portal, menuId) => {
      const originalMenu = document.getElementById(menuId);
      if (originalMenu) {
        // Copy selected state from original to portal
        const originalItems = originalMenu.querySelectorAll('[data-value]');
        const portalItems = portal.querySelectorAll('[data-value]');
        
        console.log(`🔄 Updating portal selections for ${menuId}:`, {
          originalItems: originalItems.length,
          portalItems: portalItems.length,
          selected: Array.from(originalItems).filter(item => item.classList.contains('selected')).map(item => item.getAttribute('data-value'))
        });
        
        originalItems.forEach((originalItem, index) => {
          const portalItem = portalItems[index];
          if (portalItem) {
            if (originalItem.classList.contains('selected')) {
              portalItem.classList.add('selected');
              console.log(`✅ Added selected to portal item:`, portalItem.getAttribute('data-value'));
            } else {
              portalItem.classList.remove('selected');
            }
          }
        });
      }
    });
  }
}

function setupHoverBehavior() {
  const filterButtons = [
    { buttonId: 'statusFilterToggle', menuId: 'statusFilterMenu', type: 'status' },
    { buttonId: 'typeFilterToggle', menuId: 'typeFilterMenu', type: 'type' },
    { buttonId: 'accountFilterToggle', menuId: 'accountFilterMenu', type: 'account' },
    { buttonId: 'dateRangeFilterToggle', menuId: 'dateRangeFilterMenu', type: 'date' }
  ];

  filterButtons.forEach(({ buttonId, menuId, type }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);
    
    if (button && menu) {
      // Remove existing click handlers
      button.removeAttribute('data-onclick');
      
      // Add hover events
      button.addEventListener('mouseenter', () => {
        // Clear any existing timeout
        if (hoverTimeouts.has(buttonId)) {
          clearTimeout(hoverTimeouts.get(buttonId));
          hoverTimeouts.delete(buttonId);
        }
        
        // Open menu after short delay
        hoverTimeouts.set(buttonId, setTimeout(() => {
          if (!menu.classList.contains('show')) {
            closeAllFilterMenus();
            menu.classList.add('show');
            openFilterMenuPortal(menu, button, type);
            console.log(`🖱️ Hover opened ${menuId}`);
          }
        }, 150)); // 150ms delay
      });
      
      button.addEventListener('mouseleave', () => {
        // Clear open timeout
        if (hoverTimeouts.has(buttonId)) {
          clearTimeout(hoverTimeouts.get(buttonId));
          hoverTimeouts.delete(buttonId);
        }

        // Defer close; only close if neither button nor portal is hovered
        hoverTimeouts.set(buttonId, setTimeout(() => {
          const portal = __headerFilterPortals && __headerFilterPortals.get(menuId);
          const buttonHovered = button.matches(':hover');
          const portalHovered = portal ? portal.matches(':hover') : false;
          const menuHovered = menu.matches(':hover');
          if (!buttonHovered && !portalHovered && !menuHovered && menu.classList.contains('show')) {
            menu.classList.remove('show');
            closeFilterMenuPortal(menu);
            console.log(`🖱️ Hover closed ${menuId}`);
          }
        }, 220)); // short defer to allow cursor to enter portal
      });
      
      // Also handle menu hover to keep it open
      menu.addEventListener('mouseenter', () => {
        if (hoverTimeouts.has(buttonId)) {
          clearTimeout(hoverTimeouts.get(buttonId));
          hoverTimeouts.delete(buttonId);
        }
      });
      
      menu.addEventListener('mouseleave', () => {
        if (hoverTimeouts.has(buttonId)) {
          clearTimeout(hoverTimeouts.get(buttonId));
          hoverTimeouts.delete(buttonId);
        }

        // Defer close; only close if neither menu/portal nor button is hovered
        hoverTimeouts.set(buttonId, setTimeout(() => {
          const portal = __headerFilterPortals && __headerFilterPortals.get(menuId);
          const buttonHovered = button.matches(':hover');
          const portalHovered = portal ? portal.matches(':hover') : false;
          const menuHovered = menu.matches(':hover');
          if (!buttonHovered && !portalHovered && !menuHovered && menu.classList.contains('show')) {
            menu.classList.remove('show');
            closeFilterMenuPortal(menu);
            console.log(`🖱️ Menu hover closed ${menuId}`);
          }
        }, 220));
      });
    }
  });
}

// ===== GLOBAL FILTER FUNCTIONS =====

// פונקציות בחירת פילטרים (מולטיסלקט)
window.selectStatusOption = function(status) {
  window.Logger.info('🔧 selectStatusOption called with:', status, { page: "header-system" });
  console.log('🔧 selectStatusOption called with:', status);
  
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  console.log('🔧 Found statusItems:', statusItems.length);
  const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
  console.log('🔧 clickedItem found:', clickedItem ? 'YES' : 'NO');
  
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
  updatePortalSelections();
  
  // עדכון מיידי של הפילטר במערכת
  console.log('🔧 window.filterSystem:', window.filterSystem ? 'exists' : 'NOT FOUND');
  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
    const selectedStatuses = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.status = selectedStatuses;
    window.filterSystem.saveFilters();
    console.log('🔧 Calling applyAllFilters...');
    window.filterSystem.applyAllFilters();
  }
  
  // סגירת התפריט
  const statusMenu = document.getElementById('statusFilterMenu');
  if (statusMenu) {
    statusMenu.classList.remove('show');
  }
};

window.selectTypeOption = function(type) {
  window.Logger.info('🔧 selectTypeOption called with:', type, { page: "header-system" });
  console.log('🔧 selectTypeOption called with:', type);
  
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  console.log('🔧 Found typeItems:', typeItems.length);
  const clickedItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === type);
  console.log('🔧 clickedItem found:', clickedItem ? 'YES' : 'NO');
  
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
      
      // אם לא נבחר אף סוג, חזור ל"הכול"
      const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateTypeFilterText();
  updatePortalSelections();
  
  console.log('🔧 window.filterSystem for type:', window.filterSystem ? 'exists' : 'NOT FOUND');
  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
    const selectedTypes = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.type = selectedTypes;
    window.filterSystem.saveFilters();
    console.log('🔧 Calling applyAllFilters for type...');
    window.filterSystem.applyAllFilters();
  }
  
  const typeMenu = document.getElementById('typeFilterMenu');
  if (typeMenu) {
    typeMenu.classList.remove('show');
  }
};

window.selectAccountOption = function(account) {
  window.Logger.info('🔧 selectAccountOption called with:', account, { page: "header-system" });
  
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  const clickedItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === account);
  
  console.log('🔧 Account selection debug:', {
    account,
    accountItems: accountItems.length,
    clickedItem: clickedItem ? clickedItem.getAttribute('data-value') : 'not found'
  });
  
  if (clickedItem) {
    if (account === 'הכול') {
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      console.log('✅ Selected "הכול" - removed all others');
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
      
      console.log('✅ Toggled account selection:', {
        account,
        isSelected: clickedItem.classList.contains('selected'),
        totalSelected: selectedItems.length
      });
    }
  }
  
  updateAccountFilterText();
  updatePortalSelections();
  
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
  window.Logger.info('🔧 selectDateRangeOption called with:', dateRange, { page: "header-system" });

  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  
  // ביטול כל הבחירות (בחירה יחידה)
  dateRangeItems.forEach(item => item.classList.remove('selected'));

  // בחירת התאריך החדש
  const clickedItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === dateRange);
  if (clickedItem) {
    clickedItem.classList.add('selected');
  }

  updateDateRangeFilterText();
  updatePortalSelections();
  
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
  
  console.log('🔄 updateStatusFilterText - selectedItems:', selectedItems.length);
  
  if (statusElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      statusElement.textContent = 'כל סטטוס';
      console.log('✅ עדכנתי ל-"כל סטטוס"');
    } else if (selectedItems.length === 1) {
      statusElement.textContent = selectedItems[0].getAttribute('data-value');
      console.log('✅ עדכנתי ל:', selectedItems[0].getAttribute('data-value'));
    } else {
      statusElement.textContent = `${selectedItems.length} סטטוסים`;
      console.log('✅ עדכנתי ל:', `${selectedItems.length} סטטוסים`);
    }
  } else {
    console.error('❌ selectedStatus לא נמצא');
  }
};

window.updateTypeFilterText = function() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const typeElement = document.getElementById('selectedType');
  
  console.log('🔄 updateTypeFilterText - selectedItems:', selectedItems.length);
  Array.from(selectedItems).forEach((item, idx) => {
    console.log(`  [${idx}] data-value: ${item.getAttribute('data-value')}, text: ${item.textContent.trim()}`);
  });
  
  if (typeElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      typeElement.textContent = 'כל סוג השקעה';
      console.log('✅ עדכנתי ל-"כל סוג השקעה"');
    } else if (selectedItems.length === 1) {
      typeElement.textContent = selectedItems[0].getAttribute('data-value');
      console.log('✅ עדכנתי ל:', selectedItems[0].getAttribute('data-value'));
    } else {
      typeElement.textContent = `${selectedItems.length} סוגים`;
      console.log('✅ עדכנתי ל:', `${selectedItems.length} סוגים`);
    }
  } else {
    console.error('❌ selectedType לא נמצא');
  }
};

window.updateAccountFilterText = function() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const accountElement = document.getElementById('selectedAccount');

  console.log('🔄 updateAccountFilterText - selectedItems:', selectedItems.length);
  Array.from(selectedItems).forEach((item, idx) => {
    console.log(`  [${idx}] data-value: ${item.getAttribute('data-value')}, text: ${item.textContent.trim()}`);
  });

  if (accountElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      accountElement.textContent = 'כל חשבון מסחר';
      console.log('✅ עדכנתי ל-"כל חשבון מסחר"');
    } else if (selectedItems.length === 1) {
      // שימוש בטקסט האמיתי של הפריט (שם החשבון) במקום data-value (ID)
      const optionText = selectedItems[0].querySelector('.option-text');
      const displayText = optionText ? optionText.textContent.trim() : selectedItems[0].getAttribute('data-value');
      accountElement.textContent = displayText;
      console.log('✅ עדכנתי ל:', displayText);
    } else {
      accountElement.textContent = `${selectedItems.length} חשבונות`;
      console.log('✅ עדכנתי ל:', `${selectedItems.length} חשבונות`);
    }
  } else {
    console.error('❌ selectedAccount לא נמצא');
  }
};

window.updateDateRangeFilterText = function() {
  const selectedItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item.selected');
  const dateRangeElement = document.getElementById('selectedDateRange');

  console.log('🔄 updateDateRangeFilterText - selectedItems:', selectedItems.length);
  Array.from(selectedItems).forEach((item, idx) => {
    console.log(`  [${idx}] data-value: ${item.getAttribute('data-value')}, text: ${item.textContent.trim()}`);
  });

  if (dateRangeElement) {
    if (selectedItems.length === 0) {
      dateRangeElement.textContent = 'כל זמן';
      console.log('✅ עדכנתי ל-"כל זמן"');
    } else if (selectedItems.length === 1) {
      const item = selectedItems[0];
      const value = item.getAttribute('data-value');
      dateRangeElement.textContent = value;
      console.log('✅ עדכנתי ל:', value);
    } else {
      // בחירה יחידה - לא אמור לקרות
      dateRangeElement.textContent = 'כל זמן';
      console.log('✅ עדכנתי ל-"כל זמן" (multiple selection - unexpected)');
    }
  } else {
    console.error('❌ selectedDateRange לא נמצא');
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
  window.Logger.info('🧹 clearAllFilters - מוחק את כל הפילטרים', { page: "header-system" });
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
    
    // עדכון פורטלים
    updatePortalSelections();
    
    // עדכון בחירות בתפריטים
    updateFilterSelections({
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: []
    });
    
    // עדכון טקסטים
    if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
    if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
    if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
    if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();
    
    window.Logger.info('✅ כל הפילטרים נמחקו', { page: "header-system" });
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('כל הפילטרים נמחקו בהצלחה', 'success', 'הצלחה', 2000, 'system');
    } else {
      window.Logger.info('🔔 הודעת הצלחה: כל הפילטרים נמחקו בהצלחה', { page: "header-system" });
    }
  }
};

// פונקציה לעדכון UI של הפילטרים
window.updateFilterUI = function(filters) {
  window.Logger.info('🎨 עדכון UI של הפילטרים:', filters, { page: "header-system" });
  
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
  
  // עדכון פילטר חשבון מסחר
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

// ===== Initialize Header System =====
try {
  if (!window.headerSystem) {
    window.headerSystem = new HeaderSystem();
  }
  const initHeader = () => {
    try {
      window.headerSystem.init();
      window.headerSystemReady = true;
      // Setup hover behavior for filter menus
      setupHoverBehavior();
      window.Logger && window.Logger.info('✅ HeaderSystem initialized with hover behavior', { page: 'header-system' });
    } catch (e) {
      window.Logger && window.Logger.error('❌ HeaderSystem init failed', { error: e?.message, page: 'header-system' });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
} catch (e) {
  console.error('HeaderSystem bootstrap error:', e);
}

window.resetAllFilters = async function() {
  console.log('↻ resetAllFilters - מחזיר לערכי ברירת מחדל מהעדפות');
  window.Logger.info('↻ resetAllFilters - מחזיר לערכי ברירת מחדל מהעדפות', { page: "header-system" });
  window.Logger.info('↻ resetAllFilters - פונקציה נקראת!', { page: "header-system" });
  
  try {
    // Clear preference cache to ensure fresh values from database
    const filterPrefNames = ['defaultSearchFilter', 'defaultDateRangeFilter', 'defaultStatusFilter', 'defaultTypeFilter', 'default_trading_account'];
    for (const prefName of filterPrefNames) {
      const cacheKey = `preference_${prefName}_1_0`; // user_id=1, profile_id=0
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
        await window.UnifiedCacheManager.remove(cacheKey, { layer: 'localStorage' });
        console.log(`🗑️ Cleared cache for ${prefName}`);
      }
    }
    
    // טעינת הגדרות ברירת מחדל מהעדפות באמצעות מערכת ההעדפות הקיימת
    console.log('↻ בודק אם getPreference קיימת:', typeof window.getPreference);
    window.Logger.info('↻ בודק אם getPreference קיימת:', typeof window.getPreference, { page: "header-system" });
    
    if (typeof window.getPreference !== 'function') {
      console.log('❌ getPreference לא קיימת - לא מתבצע איפוס, מציג הודעה למשתמש');
      const msg = 'לא ניתן לאפס פילטרים: מערכת העדפות לא זמינה. נסה לרענן או לבדוק התחברות.';
      if (typeof window.showNotification === 'function') {
        window.showNotification(msg, 'error', 'שגיאה', 4000, 'system');
      } else if (window.Logger && window.Logger.error) {
        window.Logger.error(msg, { page: 'header-system' });
      } else {
        alert(msg);
      }
      return; // אל תבצע ניקוי או ברירת מחדל
    }
    
    // טעינת העדפות ברירת מחדל
    const defaultSearch = await window.getPreference('defaultSearchFilter') || '';
    const defaultDateRange = await window.getPreference('defaultDateRangeFilter') || 'כל זמן';
    const defaultStatus = await window.getPreference('defaultStatusFilter') || [];
    const defaultType = await window.getPreference('defaultTypeFilter') || [];
    const defaultAccount = await window.getPreference('default_trading_account') || [];
    
    console.log('↻ העדפות ברירת מחדל:', {
      search: defaultSearch,
      dateRange: defaultDateRange,
      status: defaultStatus,
      type: defaultType,
      account: defaultAccount
    });
    
    // הגדרות ברירת מחדל מהעדפות
    const defaultFilters = {
      search: defaultSearch,
      dateRange: defaultDateRange,
      status: Array.isArray(defaultStatus) ? defaultStatus : (defaultStatus === 'הכל' ? [] : [defaultStatus]),
      type: Array.isArray(defaultType) ? defaultType : (defaultType === 'הכל' ? [] : [defaultType]),
      account: Array.isArray(defaultAccount) ? defaultAccount : (defaultAccount === 'כל החשבונות' ? [] : [defaultAccount])
    };
    
    window.Logger.info('↻ טוען הגדרות ברירת מחדל:', defaultFilters, { page: "header-system" });
    
    // יצירת filterSystem אם לא קיים
    if (!window.filterSystem && typeof window.HeaderSystemClass !== 'undefined') {
      console.log('⚠️ filterSystem לא קיים - יוצר עכשיו');
      window.HeaderSystemClass.createFilterSystem();
    }
    
    // עדכון הפילטרים הנוכחיים
    if (window.filterSystem) {
      console.log('✅ filterSystem קיים, מעדכן פילטרים');
      window.filterSystem.currentFilters = defaultFilters;
      window.filterSystem.saveFilters();
      window.filterSystem.applyAllFilters();
      
      // עדכון UI ישיר
      console.log('↻ מעדכן UI עם העדפות:', defaultFilters);
      
      // עדכון שדה החיפוש
      const searchInput = document.getElementById('searchFilterInput');
      if (searchInput) {
        searchInput.value = defaultFilters.search || '';
      }
      
      // עדכון בחירות בתפריטים
      console.log('🔄 קורא ל-updateFilterSelections עם:', defaultFilters);
      updateFilterSelections(defaultFilters);
      
      // updateFilterSelections כבר מעדכנת את הטקסטים, אין צורך לקרוא שוב
      
    } else {
      console.error('❌ filterSystem לא קיים אחרי ניסיון יצירה');
    }
    
    window.Logger.info('✅ פילטרים אופסו לערכי ברירת מחדל', { page: "header-system" });
    
    // עדכון פורטלים
    updatePortalSelections();
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('פילטרים אופסו לערכי ברירת מחדל', 'success', 'הצלחה', 2000, 'system');
    } else {
      window.Logger.info('🔔 הודעת הצלחה: פילטרים אופסו לערכי ברירת מחדל', { page: "header-system" });
    }
    
  } catch (error) {
    console.log('❌ שגיאה בטעינת העדפות:', error.message);
    window.Logger && window.Logger.error('❌ שגיאה בטעינת העדפות:', error, { page: "header-system" });
    window.Logger && window.Logger.error('❌ פרטי השגיאה:', error.message, error.stack, { page: "header-system" });
    const msg = 'לא ניתן לאפס פילטרים: שגיאה בקריאת העדפות. נסה שוב מאוחר יותר.';
    if (typeof window.showNotification === 'function') {
      window.showNotification(msg, 'error', 'שגיאה', 4000, 'system');
    }
    return; // ללא fallback ניקוי
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
    window.Logger.info('✅ חיפוש נוקה', { page: "header-system" });
    
    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('חיפוש נוקה בהצלחה', 'success', 'הצלחה', 1500, 'system');
    } else {
      window.Logger.info('🔔 הודעת הצלחה: חיפוש נוקה בהצלחה', { page: "header-system" });
    }
  }
};

// Make HeaderSystem class available globally
window.HeaderSystemClass = HeaderSystem;

// Create global HeaderSystem object for compatibility with unified initialization
window.HeaderSystem = {
  initialize: function() {
    window.Logger.info('🚀 HeaderSystem.initialize called', { page: "header-system" });
    try {
      // Check if HeaderSystem class exists
      if (typeof window.HeaderSystemClass === 'function') {
        window.headerSystem = new window.HeaderSystemClass();
        if (typeof window.headerSystem.init === 'function') {
          window.headerSystem.init();
        }
        // Setup hover behavior for filter menus
        setupHoverBehavior();
        return true;
      } else {
        window.Logger.info('⚠️ HeaderSystem class not available yet', { page: "header-system" });
        return false;
      }
    } catch (error) {
      window.Logger.info('⚠️ HeaderSystem.initialize error:', error.message, { page: "header-system" });
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
      window.Logger.info('⚠️ HeaderSystem.createFilterSystem error:', error.message, { page: "header-system" });
      return false;
    }
  },
  init: function() {
    return this.initialize();
  }
};

// הוסר - המערכת המאוחדת מטפלת באתחול
// Initialize the header system
// document.addEventListener('DOMContentLoaded', function() {
//   // window.Logger.info('🔧 DOMContentLoaded - checking filter functions:', { page: "header-system" });
//   window.Logger.info('selectStatusOption:', typeof window.selectStatusOption, { page: "header-system" });
//   window.Logger.info('updateStatusFilterText:', typeof window.updateStatusFilterText, { page: "header-system" });
//   window.Logger.info('applyStatusFilter:', typeof window.applyStatusFilter, { page: "header-system" });
//   
//   if (typeof window.HeaderSystemClass === 'function') {
//     window.headerSystem = new window.HeaderSystemClass();
//     if (typeof window.headerSystem.init === 'function') {
//       window.headerSystem.init();
//     }
//     
//     // יצירת מערכת הפילטרים
//     if (typeof window.HeaderSystemClass.createFilterSystem === 'function') {
//       window.HeaderSystemClass.createFilterSystem();
//       
//       // טעינת מצב שמור אחרי שמערכת הפילטרים נוצרה
//       setTimeout(() => {
//         if (typeof window.HeaderSystemClass.loadSavedState === 'function') {
//           window.HeaderSystemClass.loadSavedState();
//         }
//       }, 200);
//     }
//     
//     // בדיקה נוספת אחרי האתחול
//     setTimeout(() => {
//       // window.Logger.info('🔧 After init - checking filter functions again:', { page: "header-system" });
//       window.Logger.info('selectStatusOption:', typeof window.selectStatusOption, { page: "header-system" });
//       window.Logger.info('updateStatusFilterText:', typeof window.updateStatusFilterText, { page: "header-system" });
//       window.Logger.info('applyStatusFilter:', typeof window.applyStatusFilter, { page: "header-system" });
//     }, 100);
//   } else {
//     window.Logger.error('❌ HeaderSystem class not found', { page: "header-system" });
//   }
// });

// Update Toggle Buttons Function - עדכון מצב הכפתורים
window.updateToggleButtons = function() {
  const headerFilters = document.querySelector('.header-filters');
  const mainBtn = document.querySelector('.filter-toggle-main');
  const secondaryBtn = document.querySelector('.filter-toggle-secondary');
  
        // window.Logger.info('🔧 updateToggleButtons called', { page: "header-system" });
  // window.Logger.info('headerFilters:', headerFilters, { page: "header-system" });
  // window.Logger.info('mainBtn:', mainBtn, { page: "header-system" });
  // window.Logger.info('secondaryBtn:', secondaryBtn, { page: "header-system" });
  
  if (!headerFilters || !mainBtn || !secondaryBtn) {
    // window.Logger.info('❌ Missing elements', { page: "header-system" });
    return;
  }
  
  const isOpen = headerFilters.style.display !== 'none';
  // window.Logger.info('isOpen:', isOpen, { page: "header-system" });
  
  if (isOpen) {
    // פילטר פתוח - הצג כפתור משני (בתוך הפילטר)
    // window.Logger.info('📤 Hiding main button, showing secondary button', { page: "header-system" });
    mainBtn.style.display = 'none';
    secondaryBtn.style.display = 'block';
  } else {
    // פילטר סגור - הצג כפתור ראשי (בתוך התפריט הראשי)
    // window.Logger.info('📥 Showing main button, hiding secondary button', { page: "header-system" });
    mainBtn.style.display = 'block';
    secondaryBtn.style.display = 'none';
  }
};

// Z-Index Debug Function - בדיקת מצב z-index בפועל
window.debugZIndexStatus = function() {
    window.Logger.info('🔍 בדיקת מצב Z-Index במערכת ראש הדף', { page: "header-system" });
    window.Logger.info('=====================================', { page: "header-system" });
    
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
            
            window.Logger.info(`📍 ${element.name}:`, { page: "header-system" });
            window.Logger.info(`   Selector: ${element.selector}`, { page: "header-system" });
            window.Logger.info(`   Z-Index: ${zIndex}`, { page: "header-system" });
            window.Logger.info(`   Position: ${position}`, { page: "header-system" });
            window.Logger.info(`   Display: ${display}`, { page: "header-system" });
            window.Logger.info(`   Visibility: ${visibility}`, { page: "header-system" });
            window.Logger.info(`   Visible: ${el.offsetParent !== null}`, { page: "header-system" });
            window.Logger.info('---', { page: "header-system" });
        } else {
            window.Logger.info(`❌ ${element.name} (${element.selector}, { page: "header-system" }): לא נמצא`);
        }
    });
    
    // בדיקת כל התפריטים הפתוחים
    window.Logger.info('🎯 בדיקת תפריטים פתוחים:', { page: "header-system" });
    const openMenus = document.querySelectorAll('.tiktrack-dropdown-menu:not([style*="display: none"])');
    window.Logger.info(`תפריטים פתוחים: ${openMenus.length}`, { page: "header-system" });
    
    openMenus.forEach((menu, index) => {
        const computedStyle = window.getComputedStyle(menu);
        window.Logger.info(`תפריט ${index + 1}: z-index = ${computedStyle.zIndex}`, { page: "header-system" });
    });
    
    // בדיקת כפתור הפילטר
    window.Logger.info('🔘 בדיקת כפתור פילטר:', { page: "header-system" });
    const filterBtn = document.querySelector('.header-filter-toggle-btn');
    if (filterBtn) {
        const computedStyle = window.getComputedStyle(filterBtn);
        window.Logger.info(`כפתור פילטר: z-index = ${computedStyle.zIndex}`, { page: "header-system" });
        window.Logger.info(`כפתור פילטר: position = ${computedStyle.position}`, { page: "header-system" });
        window.Logger.info(`כפתור פילטר: visible = ${filterBtn.offsetParent !== null}`, { page: "header-system" });
    }
    
    // בדיקת תפריטי פילטר
    window.Logger.info('🔍 בדיקת תפריטי פילטר:', { page: "header-system" });
    const filterMenus = document.querySelectorAll('.filter-menu');
    filterMenus.forEach((menu, index) => {
        const computedStyle = window.getComputedStyle(menu);
        window.Logger.info(`תפריט פילטר ${index + 1}: z-index = ${computedStyle.zIndex}`, { page: "header-system" });
    });
    
    window.Logger.info('=====================================', { page: "header-system" });
    window.Logger.info('✅ בדיקת Z-Index הושלמה', { page: "header-system" });
};

// ===== CACHE CLEARING FUNCTIONS MOVED TO UNIFIED CACHE MANAGER =====
// All cache clearing functions are now part of the UnifiedCacheManager system
// and are available as global functions: clearCacheQuick, clearCacheLayer, 
// clearAllCacheAdvanced, clearCacheFull

// ===== DEBUG FUNCTION FOR CACHE CLEARING =====

/**
 * פונקציה לבדיקה שהפונקציות עובדות
 */
window.testCacheClearingFunctions = function() {
    window.Logger.info('🧪 בדיקת פונקציות ניקוי מטמון...', { page: "header-system" });
    
    const functions = [
        'clearCacheQuick',
        'clearCacheLayer', 
        'clearAllCacheAdvanced',
        'clearCacheFull',
        'clearCacheBeforeCRUD'
    ];
    
    functions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        window.Logger.info(`${funcName}: ${exists ? '✅ זמינה' : '❌ לא זמינה'}`, { page: "header-system" });
    });
    
    // בדיקת מערכת המטמון המאוחדת
    const unifiedCacheExists = window.UnifiedCacheManager !== undefined;
    window.Logger.info(`UnifiedCacheManager: ${unifiedCacheExists ? '✅ זמין' : '❌ לא זמין'}`, { page: "header-system" });
    
    // בדיקת מערכת ההתראות
    const notificationExists = typeof window.showSuccessNotification === 'function';
    window.Logger.info(`showSuccessNotification: ${notificationExists ? '✅ זמין' : '❌ לא זמין'}`, { page: "header-system" });
    
    window.Logger.info('🧪 בדיקת פונקציות ניקוי מטמון הושלמה', { page: "header-system" });
};

// בדיקה שה-Logger זמין לפני השימוש
if (window.Logger && window.Logger.info) {
    window.Logger.info('✅ Header System v6.0.0 loaded successfully!', { page: "header-system" });
} else {
}
