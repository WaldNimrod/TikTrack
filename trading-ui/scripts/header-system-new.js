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
    
    // טעינת חשבונות לפילטר
    HeaderSystem.loadAccountsForFilter();
    
    
    // הגדרת event listeners
    HeaderSystem.setupEventListeners();
    
    // טעינת מצב שמור
    HeaderSystem.loadSavedState();
    
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
    console.log('🔧 Checking if filter functions are defined:');
    console.log('selectStatusOption:', typeof window.selectStatusOption);
    console.log('updateStatusFilterText:', typeof window.updateStatusFilterText);
    console.log('applyStatusFilter:', typeof window.applyStatusFilter);
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
                        <li><a class="tiktrack-dropdown-item" href="/page-scripts-matrix">📄 מטריקס JS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/js-map">🗺️ מפת JS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/linter-realtime-monitor.html">🔍 דשבורד Linter</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/chart-management">📊 ניהול גרפים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/css-management">🎨 מנהל CSS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/crud-testing-dashboard">🧪 בדיקות CRUD</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cache-test">💾 בדיקת Cache</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/constraints">🔒 אילוצים</a></li>
                        
                        <li class="separator"></li>
                        
                        <!-- ממשק משתמש -->
                        <li><a class="tiktrack-dropdown-item" href="/style_demonstration">🎨 הדגמת סגנונות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/dynamic-colors-display">🌈 צבעים דינמיים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">🧪 בדיקת כותרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">🎭 עיצובים</a></li>


                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="clearDevelopmentCache(event)" 
                         title="נקה מטמון פיתוח">
                        <span class="nav-text" style="color: #ff0000; font-size: 1.2rem;">🧹</span>
                      </a>
                    </li>
                    
                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="clearStaticFilesCache(event)" 
                         title="נקה מטמון קבצים סטטיים (אייקונים, CSS)">
                        <span class="nav-text" style="color: #ff6600; font-size: 1.2rem;">🖼️</span>
                      </a>
                    </li>
                    
                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="forceIconRefresh(event)" 
                         title="כפה רענון אייקונים (פתרון 404)">
                        <span class="nav-text" style="color: #00aa00; font-size: 1.2rem;">🔄</span>
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
                  <div class="account-filter-item" data-value="הכול">
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
                  <div class="date-range-filter-item" data-value="החודש" onclick="selectDateRangeOption('החודש')">
                    <span class="option-text">החודש</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השנה" onclick="selectDateRangeOption('השנה')">
                    <span class="option-text">השנה</span>
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
          </div>
        </div>
        
        <!-- כפתור פתיחה/סגירה של הפילטר -->
        <div class="filter-toggle-section">
          <button class="header-filter-toggle-btn" id="headerFilterToggleBtn" title="הצג/הסתר פילטרים" 
                  onclick="toggleHeaderFilters()">
            <span class="header-filter-arrow">▲</span>
          </button>
        </div>
      </div>
    `;
  }

  static setupEventListeners() {
    // הוספת סגנונות CSS
    HeaderSystem.addStyles();
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

      /* Header Styles */
      .unified-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1000;
      }

      .header-content {
        position: relative;
      }

      .header-top {
        padding: 15px 0;
      }

      .header-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
      }

      .header-nav {
        flex: 1;
      }

      .main-nav {
        display: flex;
        justify-content: center;
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
        z-index: 1001;
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

      .logo-section {
        display: flex;
        align-items: center;
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
        z-index: 1002;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
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
        padding: 13px 20px 5px 20px;
        border-top: 1px solid rgba(255,255,255,0.2);
        display: block; /* פתוח כברירת מחדל */
      }

      .filters-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .filter-toggle {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 5px 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 150px;
        justify-content: space-between;
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
        z-index: 1001;
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
        right: 10px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 18px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.3s ease;
      }

      .search-clear-btn:hover {
        color: #667eea;
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

  static loadAccountsForFilter() {
    // טעינת חשבונות לפילטר
    // ייושם בעתיד
  }

  static loadSavedState() {
    // טעינת מצב שמור
    // ייושם בעתיד
  }

  // ===== FILTER SYSTEM INTEGRATION =====
  
  // יצירת מופע של מערכת הפילטרים
  static createFilterSystem() {
    if (!window.filterSystem) {
      window.filterSystem = new HeaderSystem.FilterSystem();
      window.filterSystem.initialize();
    }
    return window.filterSystem;
  }

  // מחלקת מערכת הפילטרים
  static FilterSystem = class {
    constructor() {
      this.tables = new Map();
      this.filters = new Map();
      this.currentFilters = {
        search: '',
        dateRange: 'כל זמן',
        status: [],
        type: [],
        account: [],
      };
      this.initialized = false;
    }

    initialize() {
      if (this.initialized) return;
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    init() {
      this.loadSavedFilters();
      this.setupGlobalEventListeners();
      this.initialized = true;
    }

    // רישום טבלה חדשה במערכת
    registerTable(tableId, config) {
      console.log('🔧 registerTable called:', { tableId, config });
      
      const table = {
        id: tableId,
        element: document.getElementById(tableId),
        data: [],
        filteredData: [],
        fields: config.fields || [],
        renderFunction: config.renderFunction,
        ...config,
      };

      console.log('🔧 Table element found:', table.element);
      this.tables.set(tableId, table);
      this.loadTableData(tableId);
      this.applyFiltersToTable(tableId);
    }

    // טעינת נתונים מטבלה HTML
    loadTableData(tableId) {
      const table = this.tables.get(tableId);
      if (!table || !table.element) return;

      const rows = table.element.querySelectorAll('tbody tr');
      const data = [];

      console.log(`📊 Loading data for table ${tableId}:`);
      console.log(`  - Found ${rows.length} rows`);
      console.log(`  - Fields to extract: [${table.fields.join(', ')}]`);

      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        const rowData = {};

        table.fields.forEach((field, index) => {
          if (cells[index]) {
            // בדיקה אם יש data attribute
            const dataAttr = cells[index].getAttribute(`data-${field}`);
            if (dataAttr) {
              rowData[field] = dataAttr;
              console.log(`  - Row ${rowIndex}, Field ${field}: data attribute = "${dataAttr}"`);
            } else {
              const textContent = cells[index].textContent.trim();
              rowData[field] = textContent;
              console.log(`  - Row ${rowIndex}, Field ${field}: text content = "${textContent}"`);
            }
          }
        });

        data.push(rowData);
        console.log(`  - Row ${rowIndex} data:`, rowData);
      });

      table.data = data;
      table.filteredData = [...data];
      console.log(`✅ Loaded ${data.length} rows for table ${tableId}`);
      console.log(`📊 Sample data:`, data.slice(0, 2)); // הצגת 2 שורות לדוגמה
    }

    // עדכון פילטר
    updateFilter(filterName, value) {
      this.currentFilters[filterName] = value;
      this.saveFilters();
      this.applyAllFilters();
    }

    // הפעלת כל הפילטרים על כל הטבלאות
    applyAllFilters() {
      console.log('🔧 applyAllFilters called, registered tables:', Array.from(this.tables.keys()));
      this.tables.forEach((table, tableId) => {
        this.applyFiltersToTable(tableId);
      });
    }

    // הפעלת פילטרים על טבלה ספציפית
    applyFiltersToTable(tableId) {
      const table = this.tables.get(tableId);
      if (!table) return;

      console.log(`🔧 applyFiltersToTable called for ${tableId}`);
      console.log(`  - Current filters:`, this.currentFilters);
      console.log(`  - Table fields: [${table.fields.join(', ')}]`);
      console.log(`  - Original data length: ${table.data.length}`);

      let filteredData = [...table.data];
      console.log(`  - Starting with ${filteredData.length} items`);
      
      // פילטר חיפוש
      if (this.currentFilters.search && table.fields.some(field =>
        ['name', 'description', 'title', 'symbol', 'account_name'].includes(field))) {
        console.log(`  - Applying search filter: "${this.currentFilters.search}"`);
        filteredData = this.applySearchFilter(filteredData, this.currentFilters.search);
        console.log(`  - After search filter: ${filteredData.length} items`);
      }

      // פילטר תאריכים
      if (this.currentFilters.dateRange && this.currentFilters.dateRange !== 'כל זמן' &&
        table.fields.includes('date')) {
        console.log(`  - Applying date filter: "${this.currentFilters.dateRange}"`);
        const dateRange = this.getDateRangeFromText(this.currentFilters.dateRange);
        filteredData = this.applyDateFilter(filteredData, dateRange);
        console.log(`  - After date filter: ${filteredData.length} items`);
      }

      // פילטר סטטוס (מולטיסלקט)
      if (this.currentFilters.status.length > 0 && table.fields.includes('status')) {
        console.log(`  - Applying status filter: [${this.currentFilters.status.join(', ')}]`);
        filteredData = this.applyStatusFilter(filteredData, this.currentFilters.status);
        console.log(`  - After status filter: ${filteredData.length} items`);
      }

      // פילטר סוג (מולטיסלקט)
      if (this.currentFilters.type.length > 0 && table.fields.includes('investment_type')) {
        console.log(`  - Applying type filter: [${this.currentFilters.type.join(', ')}]`);
        filteredData = this.applyTypeFilter(filteredData, this.currentFilters.type);
        console.log(`  - After type filter: ${filteredData.length} items`);
      }

      // פילטר חשבון (מולטיסלקט)
      if (this.currentFilters.account.length > 0 && table.fields.includes('account')) {
        console.log(`  - Applying account filter: [${this.currentFilters.account.join(', ')}]`);
        filteredData = this.applyAccountFilter(filteredData, this.currentFilters.account);
        console.log(`  - After account filter: ${filteredData.length} items`);
      }

      table.filteredData = filteredData;
      console.log(`✅ Final result for ${tableId}: ${filteredData.length}/${table.data.length} items`);
      this.updateTableDisplay(tableId, filteredData);
    }

    // עדכון תצוגת הטבלה
    updateTableDisplay(tableId, filteredData) {
      const table = this.tables.get(tableId);
      if (!table || !table.element) return;

      const tbody = table.element.querySelector('tbody');
      if (!tbody) return;

      const rows = tbody.querySelectorAll('tr');
      console.log(`🔧 updateTableDisplay for ${tableId}:`);
      console.log(`  - Total rows in table: ${rows.length}`);
      console.log(`  - Filtered data items: ${filteredData.length}`);
      console.log(`  - Original data items: ${table.data.length}`);
      
      // הסתרת כל השורות
      rows.forEach((row, index) => {
        row.style.display = 'none';
        console.log(`  - Hiding row ${index}`);
      });

      // הצגת השורות המסוננות - צריך למצוא את השורה הנכונה לפי הנתונים
      filteredData.forEach((rowData, filteredIndex) => {
        // מציאת השורה המתאימה בנתונים המקוריים
        const originalIndex = table.data.findIndex(originalData => 
          originalData.symbol === rowData.symbol && 
          originalData.status === rowData.status
        );
        
        if (originalIndex !== -1 && rows[originalIndex]) {
          rows[originalIndex].style.display = '';
          console.log(`  - Showing row ${originalIndex} for item:`, {
            symbol: rowData.symbol,
            status: rowData.status,
            investment_type: rowData.investment_type,
            account: rowData.account
          });
        } else {
          console.log(`  - Could not find matching row for:`, rowData);
        }
      });
      
      // ספירת שורות גלויות
      const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
      console.log(`✅ Table display updated for ${tableId}: ${visibleRows.length} rows visible out of ${rows.length} total`);
      
      // הצגת סיכום
      console.log(`📊 Filter Summary for ${tableId}:`);
      console.log(`  - Original: ${table.data.length} items`);
      console.log(`  - Filtered: ${filteredData.length} items`);
      console.log(`  - Visible: ${visibleRows.length} rows`);
      console.log(`  - Hidden: ${rows.length - visibleRows.length} rows`);
    }

    // פילטר חיפוש
    applySearchFilter(data, searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') return data;

      const searchLower = searchTerm.toLowerCase().trim();

      return data.filter(item => {
        const searchableFields = [
          item.symbol || '',
          item.type || '',
          item.status || '',
          item.account_name || '',
          item.notes || '',
        ];

        return searchableFields.some(field =>
          field.toString().toLowerCase().includes(searchLower),
        );
      });
    }

    // פילטר תאריכים
    applyDateFilter(data, dateRange) {
      if (!dateRange || !dateRange.start || !dateRange.end) return data;

      return data.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // פילטר סטטוס
    applyStatusFilter(data, selectedStatuses) {
      console.log('🔍 applyStatusFilter called with:', { selectedStatuses, dataLength: data.length });
      
      if (selectedStatuses.length === 0) {
        console.log('✅ No status filter applied - returning all data');
        return data;
      }

      // בדיקה אם נבחר "הכול" - אם כן, החזר את כל הנתונים
      if (selectedStatuses.includes('הכול')) {
        console.log('✅ "הכול" selected - returning all data');
        return data;
      }

      console.log('🔍 Applying status filter:');
      console.log(`  - Selected statuses: [${selectedStatuses.join(', ')}]`);
      console.log(`  - Data to filter: ${data.length} items`);
      
      const filteredData = data.filter(item => {
        const itemStatus = item.status;
        const isMatch = selectedStatuses.includes(itemStatus);
        console.log(`  - Item ${item.symbol || 'unknown'}: status="${itemStatus}", match=${isMatch}`);
        return isMatch;
      });
      
      console.log(`✅ Status filter result: ${filteredData.length}/${data.length} items match`);
      console.log('🔍 Filtered items:', filteredData.map(item => ({
        symbol: item.symbol,
        status: item.status
      })));
      
      return filteredData;
    }

    // פילטר סוג (מולטיסלקט)
    applyTypeFilter(data, selectedTypes) {
      if (selectedTypes.length === 0) return data;
      return data.filter(item => selectedTypes.includes(item.investment_type));
    }

    // פילטר חשבון (מולטיסלקט)
    applyAccountFilter(data, selectedAccounts) {
      if (selectedAccounts.length === 0) return data;
      return data.filter(item => selectedAccounts.includes(item.account));
    }

    // תרגום טקסט תאריכים לטווח תאריכים
    getDateRangeFromText(dateRangeText) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      let startDate, endDate;

      switch (dateRangeText) {
        case 'היום':
          startDate = todayStr;
          endDate = todayStr;
          break;
        case 'אתמול': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = startDate;
          break;
        }
        case 'השבוע': {
          const startOfWeek = new Date(today);
          const dayOfWeek = today.getDay();
          startOfWeek.setDate(today.getDate() - dayOfWeek);
          startDate = startOfWeek.toISOString().split('T')[0];
          endDate = todayStr;
          break;
        }
        case 'החודש': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          startDate = monthAgo.toISOString().split('T')[0];
          endDate = todayStr;
          break;
        }
        case 'השנה': {
          const yearAgo = new Date(today);
          yearAgo.setFullYear(today.getFullYear() - 1);
          startDate = yearAgo.toISOString().split('T')[0];
          endDate = todayStr;
          break;
        }
        default:
          return null;
      }

      return { start: startDate, end: endDate };
    }

    // שמירת פילטרים
    saveFilters() {
      localStorage.setItem('globalFilters', JSON.stringify(this.currentFilters));
    }

    // טעינת פילטרים שמורים
    loadSavedFilters() {
      const saved = localStorage.getItem('globalFilters');
      if (saved) {
        this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
      }
    }

    // איפוס פילטרים
    resetFilters() {
      this.currentFilters = {
        search: '',
        dateRange: 'כל זמן',
        status: [],
        type: [],
        account: [],
      };
      this.saveFilters();
      this.resetFilterUI();
      this.applyAllFilters();
    }

    // הגדרת event listeners גלובליים
    setupGlobalEventListeners() {
      // Event listener לפילטר חיפוש
      document.addEventListener('input', e => {
        if (e.target.id === 'searchFilterInput') {
          this.currentFilters.search = e.target.value;
          this.saveFilters();
          this.applyFilters();
        }
      });

      // Event listeners לפילטרים אחרים
      document.addEventListener('click', e => {
        if (e.target.closest('.date-range-filter-item')) {
          const text = e.target.closest('.date-range-filter-item').querySelector('.option-text').textContent;
          this.updateFilter('dateRange', text);
        }
        
        if (e.target.closest('.status-filter-item')) {
          const text = e.target.closest('.status-filter-item').querySelector('.option-text').textContent;
          const currentStatuses = [...this.currentFilters.status];
          const index = currentStatuses.indexOf(text);

          if (index > -1) {
            currentStatuses.splice(index, 1);
          } else {
            currentStatuses.push(text);
          }

          this.updateFilter('status', currentStatuses);
        }
        
        if (e.target.closest('.type-filter-item')) {
          const text = e.target.closest('.type-filter-item').querySelector('.option-text').textContent;
          const currentTypes = [...this.currentFilters.type];
          const index = currentTypes.indexOf(text);

          if (index > -1) {
            currentTypes.splice(index, 1);
          } else {
            currentTypes.push(text);
          }

          this.updateFilter('type', currentTypes);
        }
        
        if (e.target.closest('.account-filter-item')) {
          const accountId = e.target.closest('.account-filter-item').getAttribute('data-account-id');
          const currentAccounts = [...this.currentFilters.account];
          const index = currentAccounts.indexOf(accountId);

          if (index > -1) {
            currentAccounts.splice(index, 1);
          } else {
            currentAccounts.push(accountId);
          }

          this.updateFilter('account', currentAccounts);
        }
      });
    }

    // הפונקציה הראשית להפעלת פילטרים
    applyFilters() {
      console.log('🔧 applyFilters called with currentFilters:', this.currentFilters);
      
      const isTickersPage = window.location.pathname.includes('tickers') ||
                           document.querySelector('table[data-table-type="tickers"]') ||
                           document.getElementById('tickersContainer');

      if (isTickersPage && window.tickersData && typeof window.updateTickersTable === 'function') {
        let filteredTickers = [...window.tickersData];

        if (this.currentFilters.search) {
          filteredTickers = this.filterTickersBySearch(filteredTickers, this.currentFilters.search);
        }

        if (this.currentFilters.status.length > 0) {
          filteredTickers = this.filterTickersByStatus(filteredTickers, this.currentFilters.status);
        }

        if (this.currentFilters.type.length > 0) {
          filteredTickers = this.filterTickersByType(filteredTickers, this.currentFilters.type);
        }

        window.updateTickersTable(filteredTickers);
        console.log(`🔍 פילטר הטיקרים הופעל: ${filteredTickers.length}/${window.tickersData.length} טיקרים`);
      } else {
        console.log('🔧 Applying filters to registered tables');
        this.applyAllFilters();
      }
    }

    // פילטור טיקרים לפי חיפוש
    filterTickersBySearch(tickers, searchTerm) {
      if (!searchTerm) return tickers;
      
      const searchLower = searchTerm.toLowerCase();
      return tickers.filter(ticker => {
        const statusMap = {
          'open': 'פתוח',
          'closed': 'סגור',
          'cancelled': 'מבוטל'
        };
        
        const searchableFields = [
          ticker.symbol || '',
          ticker.name || '',
          ticker.type || '',
          ticker.remarks || '',
          ticker.status || '',
          statusMap[ticker.status] || ''
        ];
        
        return searchableFields.some(field =>
          field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // פילטור טיקרים לפי סטטוס
    filterTickersByStatus(tickers, selectedStatuses) {
      if (selectedStatuses.length === 0 || selectedStatuses.includes('הכול')) {
        return tickers;
      }

      const statusMap = {
        'פתוח': 'open',
        'סגור': 'closed', 
        'מבוטל': 'cancelled'
      };

      const translatedStatuses = selectedStatuses.map(status => statusMap[status] || status);
      
      return tickers.filter(ticker => 
        translatedStatuses.includes(ticker.status)
      );
    }

    // פילטור טיקרים לפי סוג
    filterTickersByType(tickers, selectedTypes) {
      if (selectedTypes.length === 0 || selectedTypes.includes('הכול')) {
        return tickers;
      }

      const typeMap = {
        'מניה': 'stock',
        'ETF': 'etf', 
        'אג"ח': 'bond',
        'קריפטו': 'crypto',
        'מטבע חוץ': 'forex',
        'סחורה': 'commodity',
        'אחר': 'other'
      };

      const allowedTypes = selectedTypes.map(hebrewType => typeMap[hebrewType] || hebrewType);

      return tickers.filter(ticker => 
        allowedTypes.includes(ticker.type)
      );
    }

    // פונקציה להפעלת פילטר חיפוש
    applySearchFilter(searchTerm) {
      this.currentFilters.search = searchTerm || '';
      this.saveFilters();
      this.applyFilters();
    }

    // קבלת מצב פילטרים נוכחי
    getCurrentFilters() {
      return { ...this.currentFilters };
    }

    // ניקוי כל הפילטרים
    clearFilters() {
      console.log('🧹 Clearing all filters...');
      
      this.currentFilters = {
        status: [],
        type: [],
        account: [],
        dateRange: 'כל זמן',
        search: ''
      };
      
      this.resetFilterUI();
      this.applyAllFilters();
      
      console.log('✅ All filters cleared');
    }

    // איפוס ממשק המשתמש
    resetFilterUI() {
      const searchInput = document.getElementById('searchFilterInput');
      if (searchInput) {
        searchInput.value = '';
      }
      
      const statusFilter = document.getElementById('selectedStatus');
      if (statusFilter) {
        statusFilter.textContent = 'כל סטטוס';
      }
      
      const typeFilter = document.getElementById('selectedType');
      if (typeFilter) {
        typeFilter.textContent = 'כל סוג השקעה';
      }
      
      const accountFilter = document.getElementById('selectedAccount');
      if (accountFilter) {
        accountFilter.textContent = 'כל חשבון';
      }
      
      const dateFilter = document.getElementById('selectedDateRange');
      if (dateFilter) {
        dateFilter.textContent = 'כל זמן';
      }
      
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
      
      const openMenus = document.querySelectorAll('.filter-menu');
      openMenus.forEach(menu => {
        menu.style.display = 'none';
      });
      
      const activeButtons = document.querySelectorAll('.filter-toggle.active');
      activeButtons.forEach(btn => {
        btn.classList.remove('active');
      });
    }
  };
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
  }
};

// ===== GLOBAL FILTER FUNCTIONS =====

// פונקציות בחירת פילטרים (מולטיסלקט)
window.selectStatusOption = function(status) {
  console.log('🔧 selectStatusOption called with:', status);
  
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
  
  console.log('🔧 Found clicked item:', clickedItem);
  
  if (clickedItem) {
    if (status === 'הכול') {
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      console.log('🔧 Selected "הכול" - cleared all other selections');
    } else {
      // בחירת סטטוס ספציפי - ביטול "הכול" אם נבחר
      const allItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
        console.log('🔧 Removed "הכול" selection');
      }
      clickedItem.classList.toggle('selected');
      console.log('🔧 Toggled selection for:', status, 'selected:', clickedItem.classList.contains('selected'));
      
      // אם לא נבחר אף סטטוס, חזור ל"הכול"
      const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
        console.log('🔧 No selections left, re-selecting "הכול"');
      }
    }
  }
  
  updateStatusFilterText();
  applyStatusFilter();
  
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
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // בחירת סוג ספציפי - ביטול "הכול" אם נבחר
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
  applyTypeFilter();
  
  // סגירת התפריט
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
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // בחירת חשבון ספציפי - ביטול "הכול" אם נבחר
      const allItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      // אם לא נבחר אף חשבון, חזור ל"הכול"
      const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateAccountFilterText();
  applyAccountFilter();
  
  // סגירת התפריט
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
  applyDateRangeFilter(dateRange);

  // סגירת התפריט
  const dateMenu = document.getElementById('dateRangeFilterMenu');
  if (dateMenu) {
    dateMenu.classList.remove('show');
  }
};

// פונקציות עדכון טקסט פילטרים (מולטיסלקט)
window.updateStatusFilterText = function() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const statusElement = document.getElementById('selectedStatus');
  
  console.log('🔧 updateStatusFilterText called:', { selectedItems: selectedItems.length, statusElement });
  
  if (statusElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      statusElement.textContent = 'כל סטטוס';
      console.log('🔧 Updated status text to: כל סטטוס');
    } else if (selectedItems.length === 1) {
      statusElement.textContent = selectedItems[0].getAttribute('data-value');
      console.log('🔧 Updated status text to:', selectedItems[0].getAttribute('data-value'));
    } else {
      statusElement.textContent = `${selectedItems.length} סטטוסים`;
      console.log('🔧 Updated status text to:', `${selectedItems.length} סטטוסים`);
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

// פונקציות הפעלת פילטרים (מולטיסלקט)
window.applyStatusFilter = function() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const selectedStatuses = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  console.log('🔧 applyStatusFilter called:', { selectedItems: selectedItems.length, selectedStatuses });
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.status = selectedStatuses;
    window.filterSystem.applyFilters();
  } else {
    console.error('❌ Filter system not available');
  }
};

window.applyTypeFilter = function() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const selectedTypes = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.type = selectedTypes;
    window.filterSystem.applyFilters();
  }
};

window.applyAccountFilter = function() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const selectedAccounts = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.account = selectedAccounts;
    window.filterSystem.applyFilters();
  }
};

window.applyDateRangeFilter = function(dateRange) {
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.dateRange = dateRange;
    window.filterSystem.applyFilters();
  }
};

// פונקציות נוספות
window.clearAllFilters = function() {
  if (window.filterSystem) {
    window.filterSystem.clearFilters();
  }
};

window.resetAllFilters = function() {
  if (window.filterSystem) {
    window.filterSystem.resetFilters();
  }
};

window.handleSearchInput = function(event) {
  if (window.filterSystem) {
    window.filterSystem.applySearchFilter(event.target.value);
  }
};

window.clearSearchFilter = function() {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
    if (window.filterSystem) {
      window.filterSystem.applySearchFilter('');
    }
  }
};

// ===== FILTER MENU TOGGLE FUNCTIONS =====
// פונקציות פתיחה וסגירה של תפריטי הפילטרים בלבד
// ===============================================

// פונקציה לפתיחה וסגירה של תפריט פילטר סטטוס
window.toggleStatusFilterMenu = function() {
  console.log('🔧 toggleStatusFilterMenu called - Status filter menu only');
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.getElementById('statusFilterToggle');
  
  if (menu && toggle) {
    const isOpen = menu.classList.contains('show');
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
    document.querySelectorAll('.filter-toggle').forEach(t => t.classList.remove('active'));
    
    if (!isOpen) {
      menu.classList.add('show');
      toggle.classList.add('active');
    }
    
    console.log(`✅ Status filter menu ${isOpen ? 'closed' : 'opened'}`);
  }
};

// פונקציה לפתיחה וסגירה של תפריט פילטר סוג
window.toggleTypeFilterMenu = function() {
  console.log('🔧 toggleTypeFilterMenu called - Type filter menu only');
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.getElementById('typeFilterToggle');
  
  if (menu && toggle) {
    const isOpen = menu.classList.contains('show');
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
    document.querySelectorAll('.filter-toggle').forEach(t => t.classList.remove('active'));
    
    if (!isOpen) {
      menu.classList.add('show');
      toggle.classList.add('active');
    }
    
    console.log(`✅ Type filter menu ${isOpen ? 'closed' : 'opened'}`);
  }
};

// פונקציה לפתיחה וסגירה של תפריט פילטר חשבון
window.toggleAccountFilterMenu = function() {
  console.log('🔧 toggleAccountFilterMenu called - Account filter menu only');
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.getElementById('accountFilterToggle');
  
  if (menu && toggle) {
    const isOpen = menu.classList.contains('show');
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
    document.querySelectorAll('.filter-toggle').forEach(t => t.classList.remove('active'));
    
    if (!isOpen) {
      menu.classList.add('show');
      toggle.classList.add('active');
    }
    
    console.log(`✅ Account filter menu ${isOpen ? 'closed' : 'opened'}`);
  }
};

// פונקציה לפתיחה וסגירה של תפריט פילטר תאריכים
window.toggleDateRangeFilterMenu = function() {
  console.log('🔧 toggleDateRangeFilterMenu called - Date range filter menu only');
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.getElementById('dateRangeFilterToggle');
  
  if (menu && toggle) {
    const isOpen = menu.classList.contains('show');
    document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
    document.querySelectorAll('.filter-toggle').forEach(t => t.classList.remove('active'));
    
    if (!isOpen) {
      menu.classList.add('show');
      toggle.classList.add('active');
    }
    
    console.log(`✅ Date range filter menu ${isOpen ? 'closed' : 'opened'}`);
  }
};

// Make HeaderSystem available globally
window.HeaderSystem = HeaderSystem;

// ===== GLOBAL FILTER FUNCTIONS =====

// פונקציות בחירת פילטרים (מולטיסלקט)
window.selectStatusOption = function(status) {
  console.log('🔧 selectStatusOption called with:', status);
  
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
  
  console.log('🔧 Found clicked item:', clickedItem);
  
  if (clickedItem) {
    if (status === 'הכול') {
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      console.log('🔧 Selected "הכול" - cleared all other selections');
    } else {
      // בחירת סטטוס ספציפי - ביטול "הכול" אם נבחר
      const allItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
        console.log('🔧 Removed "הכול" selection');
      }
      clickedItem.classList.toggle('selected');
      console.log('🔧 Toggled selection for:', status, 'selected:', clickedItem.classList.contains('selected'));
      
      // אם לא נבחר אף סטטוס, חזור ל"הכול"
      const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
        console.log('🔧 No selections left, re-selecting "הכול"');
      }
    }
  }
  
  updateStatusFilterText();
  applyStatusFilter();
  
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
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // בחירת סוג ספציפי - ביטול "הכול" אם נבחר
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
  applyTypeFilter();
  
  // סגירת התפריט
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
      // בחירת "הכול" - ביטול כל הבחירות האחרות
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // בחירת חשבון ספציפי - ביטול "הכול" אם נבחר
      const allItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      // אם לא נבחר אף חשבון, חזור ל"הכול"
      const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateAccountFilterText();
  applyAccountFilter();
  
  // סגירת התפריט
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
  applyDateRangeFilter(dateRange);

  // סגירת התפריט
  const dateMenu = document.getElementById('dateRangeFilterMenu');
  if (dateMenu) {
    dateMenu.classList.remove('show');
  }
};

// פונקציות עדכון טקסט פילטרים (מולטיסלקט)
window.updateStatusFilterText = function() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const statusElement = document.getElementById('selectedStatus');
  
  console.log('🔧 updateStatusFilterText called:', { selectedItems: selectedItems.length, statusElement });
  
  if (statusElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      statusElement.textContent = 'כל סטטוס';
      console.log('🔧 Updated status text to: כל סטטוס');
    } else if (selectedItems.length === 1) {
      statusElement.textContent = selectedItems[0].getAttribute('data-value');
      console.log('🔧 Updated status text to:', selectedItems[0].getAttribute('data-value'));
    } else {
      statusElement.textContent = `${selectedItems.length} סטטוסים`;
      console.log('🔧 Updated status text to:', `${selectedItems.length} סטטוסים`);
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

// פונקציות הפעלת פילטרים (מולטיסלקט)
window.applyStatusFilter = function() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const selectedStatuses = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  console.log('🔧 applyStatusFilter called:', { selectedItems: selectedItems.length, selectedStatuses });
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.status = selectedStatuses;
    window.filterSystem.applyFilters();
  } else {
    console.error('❌ Filter system not available');
  }
};

window.applyTypeFilter = function() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const selectedTypes = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.type = selectedTypes;
    window.filterSystem.applyFilters();
  }
};

window.applyAccountFilter = function() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const selectedAccounts = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.account = selectedAccounts;
    window.filterSystem.applyFilters();
  }
};

window.applyDateRangeFilter = function(dateRange) {
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.dateRange = dateRange;
    window.filterSystem.applyFilters();
  }
};

// פונקציות נוספות
window.clearAllFilters = function() {
  if (window.filterSystem) {
    window.filterSystem.clearFilters();
  }
};

window.resetAllFilters = function() {
  if (window.filterSystem) {
    window.filterSystem.resetFilters();
  }
};

window.handleSearchInput = function(event) {
  if (window.filterSystem) {
    window.filterSystem.applySearchFilter(event.target.value);
  }
};

window.clearSearchFilter = function() {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
    if (window.filterSystem) {
      window.filterSystem.applySearchFilter('');
    }
  }
};

// Global HeaderSystem object for compatibility
window.HeaderSystem = {
  initialize: function() {
    console.log('🚀 HeaderSystem.initialize called');
    if (typeof HeaderSystem === 'function') {
      window.headerSystem = new HeaderSystem();
      window.headerSystem.init();
      HeaderSystem.createFilterSystem();
      return true;
    }
    return false;
  },
  createFilterSystem: HeaderSystem.createFilterSystem,
  init: function() {
    return this.initialize();
  }
};

// Initialize the header system
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 DOMContentLoaded - checking filter functions:');
  console.log('selectStatusOption:', typeof window.selectStatusOption);
  console.log('updateStatusFilterText:', typeof window.updateStatusFilterText);
  console.log('applyStatusFilter:', typeof window.applyStatusFilter);
  
  if (typeof HeaderSystem === 'function') {
    window.headerSystem = new HeaderSystem();
    window.headerSystem.init();
    
    // יצירת מערכת הפילטרים
    HeaderSystem.createFilterSystem();
    
    // בדיקה נוספת אחרי האתחול
    setTimeout(() => {
      console.log('🔧 After init - checking filter functions again:');
      console.log('selectStatusOption:', typeof window.selectStatusOption);
      console.log('updateStatusFilterText:', typeof window.updateStatusFilterText);
      console.log('applyStatusFilter:', typeof window.applyStatusFilter);
    }, 100);
  } else {
    console.error('❌ HeaderSystem class not found');
  }
});

console.log('✅ Header System v6.0.0 loaded successfully!');