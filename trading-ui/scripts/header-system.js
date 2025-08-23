/**
 * Header System - TikTrack Frontend
 * ==================================
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
 * - Web Component based implementation
 * - Shadow DOM for encapsulation
 * - Event-driven communication with pages
 * - Modular filter system
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * - CSS: header-system.css
 * 
 * @author TikTrack Development Team
 * @version 2.1
 * @lastUpdated August 22, 2025
 */

/**
 * מערכת ראש דף מאוחדת עם פילטרים
 * כוללת את כל הפונקציונליות של הפילטרים
 */

class HeaderSystem {
  constructor() {
    this.isInitialized = false;
    this.filterSystem = null;
  }

  init() {
    if (this.isInitialized) {
      console.log('🏠 HeaderSystem already initialized');
      return;
    }

    console.log('🏠 HeaderSystem initializing...');

    // יצירת אלמנט הכותרת
    this.createHeader();

    // אתחול מערכת הפילטרים
    this.initFilterSystem();

    // טעינת חשבונות לפילטר
    this.loadAccountsForFilter();

    // הגדרת event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log('🏠 HeaderSystem initialized');
  }

  createHeader() {
    // הסרת כותרת קיימת אם יש
    const existingHeader = document.getElementById('unified-header');
    if (existingHeader) {
      existingHeader.remove();
    }

    // יצירת אלמנט חדש
    const headerElement = document.createElement('div');
    headerElement.id = 'unified-header';
    headerElement.innerHTML = this.getHeaderHTML();

    // הכנסת הכותרת לתחילת הדף
    document.body.insertBefore(headerElement, document.body.firstChild);

    console.log('🏠 New unified header created and inserted with app-header styles');
    console.log('🏠 Header element ID:', headerElement.id);
    console.log('🏠 Header element exists:', !!document.getElementById('unified-header'));
    console.log('🏠 Header element HTML:', headerElement.outerHTML.substring(0, 200) + '...');
  }

  initFilterSystem() {
    // יצירת מערכת פילטרים חדשה
    this.filterSystem = new SimpleFilter();
    this.filterSystem.init();

    // חשיפת הפילטר הגלובלית
    window.filterSystem = this.filterSystem;
  }

  getHeaderStyles() {
    return `
      /* Reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* Main Header */
      .unified-header {
        background: var(--apple-bg-elevated);
        border-bottom: 1px solid var(--apple-border-light);
        box-shadow: var(--apple-shadow-light);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

              /* Header Top */
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--apple-border-light);
          position: relative;
          min-height: 70px;
          direction: rtl;
        }

              .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

              .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          direction: ltr;
        }

        .logo-image {
          width: 125px;
          height: 37.5px;
          object-fit: contain;
        }

        .logo-text {
          font-size: 1rem;
          font-weight: 300;
          color: #26baac;
          direction: ltr;
          text-align: left;
          align-self: flex-end;
          margin-bottom: -5px;
        }

              .page-title {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .page-title h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--apple-text-primary);
          margin: 0;
        }

              /* Filter Toggle */
        .filter-toggle-section {
          display: flex;
          align-items: center;
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 50%;
          color: #ff9c05;
          font-size: 0.8rem;
          cursor: pointer;
          transition: bottom 0.3s ease;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -100px;
          z-index: 1001;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-toggle-btn.collapsed {
          bottom: -20px;
        }

        .filter-toggle-btn:hover {
          background: var(--apple-bg-secondary);
          border-color: var(--apple-border);
        }

        .filter-toggle-btn.collapsed .filter-arrow {
          transform: rotate(180deg);
        }

        .filter-arrow {
          transition: transform 0.2s ease;
          color: #ff9c05;
        }

              /* Navigation */
        .header-nav {
          padding: 0;
          margin-left: auto;
          margin-right: 60px;
        }

      .main-nav {
        display: flex;
        align-items: center;
      }

      .tiktrack-nav-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 0.5rem;
      }

      .tiktrack-nav-item {
        position: relative;
      }

      .tiktrack-nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        color: #000000;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s ease;
        font-weight: 500;
        font-size: 0.9rem;
        position: relative;
        z-index: 1;
        border: none;
        box-shadow: none;
        background: transparent;
      }

      .tiktrack-nav-link:hover {
        color: #3C3C43;
        border: none;
        box-shadow: none;
        background: transparent;
      }

      .tiktrack-nav-item.active .tiktrack-nav-link {
        color: #000000;
        background: rgba(0, 0, 0, 0.05);
        font-weight: bold;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: none;
      }

        .nav-item.active .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--apple-accent);
          border-radius: 1px;
        }

      /* Dropdowns */
      .dropdown {
        position: relative;
      }

      .dropdown-toggle {
        cursor: pointer;
      }

                                                           .tiktrack-dropdown-arrow {
            margin-right: 0.5rem;
            font-size: 0.8rem;
            transition: transform 0.2s ease;
          }

          .tiktrack-dropdown-toggle[aria-expanded="true"] .tiktrack-dropdown-arrow {
            transform: rotate(180deg);
          }

          .tiktrack-dropdown-toggle {
            cursor: pointer;
          }

                                                                      .tiktrack-dropdown-menu {
             position: absolute;
             top: 100%;
             right: 0;
             background: white;
             border: 1px solid #ddd;
             border-radius: 12px;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
             min-width: 200px;
             z-index: 9999;
             display: none;
             padding: 0.5rem 0;
             animation: tiktrackDropdownFadeIn 0.2s ease-out;
             opacity: 1;
             visibility: visible;
           }

           .tiktrack-dropdown-menu.show {
             display: block;
             opacity: 1;
             visibility: visible;
           }

           @keyframes tiktrackDropdownFadeIn {
             from {
               transform: translateX(-2px);
               opacity: 0;
             }
             to {
               transform: translateX(0);
               opacity: 1;
             }
           }

                    .tiktrack-dropdown-item {
             display: block;
             padding: 0.5rem 1rem;
             color: #000000;
             text-decoration: none;
             transition: all 0.2s ease;
             font-size: 0.9rem;
           }

           .tiktrack-dropdown-item:first-child {
             border-radius: 12px 12px 0 0;
           }

           .tiktrack-dropdown-item:last-child {
             border-radius: 0 0 12px 12px;
           }

           .tiktrack-dropdown-item:hover {
             background: #F2F2F7;
             color: #3C3C43;
           }

      /* Filters */
      .header-filters {
        padding: 1rem 2rem;
        background: var(--apple-bg);
        border-top: 1px solid var(--apple-border-light);
      }

              .filters-container {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
          direction: rtl;
        }

      .filter-group {
        position: relative;
      }

      /* Search Filter */
      .search-filter {
        flex: 0 0 200px; /* גודל קבוע במקום flex: 1 */
        min-width: 200px;
      }

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 200px; /* הקטנת רוחב החיפוש */
      }

      .search-filter-input {
        width: 100%;
        padding: 0.5rem 1rem 0.5rem 2rem; /* הצמדת X לשמאל - padding מימין */
        border: 1px solid var(--apple-border-light);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--apple-bg-elevated);
        color: var(--apple-text-primary);
      }

      .search-filter-input:focus {
        outline: none;
        border-color: var(--apple-accent);
        box-shadow: 0 0 0 2px var(--apple-accent-bg);
      }

      .search-clear-btn {
        position: absolute;
        left: 0.5rem; /* הצמדה לשמאל במקום ימין */
        background: none;
        border: none;
        color: var(--apple-text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .search-clear-btn:hover {
        background: var(--apple-bg-secondary);
        color: var(--apple-text-primary);
      }

      /* Filter Dropdowns */
      .filter-dropdown {
        position: relative;
      }

      .filter-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--apple-bg-elevated);
        border: 1px solid var(--apple-border-light);
        border-radius: 8px;
        color: var(--apple-text-primary);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 120px;
      }

      .filter-toggle:hover {
        background: var(--apple-bg-secondary);
        border-color: var(--apple-border);
      }

      .filter-label {
        font-weight: 500;
      }

      .selected-value {
        color: var(--apple-text-secondary);
        font-size: 0.8rem;
      }

      .filter-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: var(--apple-bg-elevated);
        border: 1px solid var(--apple-border-light);
        border-radius: 8px;
        box-shadow: var(--apple-shadow-medium);
        min-width: 150px;
        z-index: 1001;
        display: none;
        padding: 0.5rem 0;
        max-height: 300px;
        overflow-y: auto;
      }

      .filter-menu.show {
        display: block;
      }

      .filter-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .filter-item:hover {
        background: var(--apple-bg-secondary);
      }

      .filter-item.selected {
        background: var(--apple-accent-bg);
        color: var(--apple-accent);
      }

      .option-text {
        font-size: 0.9rem;
      }

      .check-mark {
        font-size: 0.8rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .filter-item.selected .check-mark {
        opacity: 1;
      }

      /* Reset Button */
      .reset-filter {
        margin-left: auto;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: var(--apple-bg-elevated);
        border: 1px solid var(--apple-border-light);
        border-radius: 8px;
        color: var(--apple-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .reset-btn:hover {
        background: var(--apple-bg-secondary);
        color: var(--apple-text-primary);
        transform: rotate(180deg);
      }

      .reset-icon {
        font-size: 1rem;
        transition: transform 0.2s ease;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .header-top {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
        }

        .header-nav {
          padding: 0 1rem;
        }

        .nav-list {
          gap: 1rem;
          flex-wrap: wrap;
        }

        .header-filters {
          padding: 1rem;
        }

        .filters-container {
          flex-direction: column;
          align-items: stretch;
        }

        .search-filter {
          min-width: auto;
        }

        .filter-group {
          width: 100%;
        }

        .filter-toggle {
          width: 100%;
          justify-content: space-between;
        }

        .reset-filter {
          margin-left: 0;
          align-self: center;
        }
      }
    `;
  }

  getHeaderHTML() {
    return `
        <div class="unified-header">
          <!-- אזור לוגו ותפריט -->
          <div class="header-top">
            <div class="header-container">
              <!-- תפריט ניווט -->
              <div class="header-nav">
                <nav class="main-nav">
                  <ul class="tiktrack-nav-list">
                    <li class="tiktrack-nav-item">
                      <a href="/" class="tiktrack-nav-link" data-page="home">
                        <span class="nav-icon">🏡</span>
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
                        <li><a class="tiktrack-dropdown-item" href="/executions">עסקעות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tickers">טיקרים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/accounts">חשבונות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notes">הערות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/preferences">העדפות</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_display">בסיס נתונים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_extradata">טבלאות עזר</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tests">בדיקות</a></li>

                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">בדיקת כותרת</a></li>
                      </ul>
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
              
              <!-- כפתור פילטר עגול -->
              <div class="filter-toggle-section">
                <button class="filter-toggle-btn" id="filterToggleBtn" title="הצג/הסתר פילטרים">
                  <span class="filter-arrow">▼</span>
                </button>
              </div>
            </div>
          </div>

        <!-- אזור פילטרים -->
        <div class="header-filters" id="headerFilters">
          <div class="filters-container">
            <!-- פילטר סטטוס -->
            <div class="filter-group status-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle status-filter-toggle" id="statusFilterToggle" onclick="toggleStatusFilter()">
                  <span class="selected-value selected-status-text" id="selectedStatus">כל סטטוס</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="statusFilterMenu">
                  <div class="status-filter-item" data-value="פתוח" onclick="selectStatusOption('פתוח')">
                    <span class="option-text">פתוח</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="status-filter-item" data-value="סגור" onclick="selectStatusOption('סגור')">
                    <span class="option-text">סגור</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="status-filter-item" data-value="מבוטל" onclick="selectStatusOption('מבוטל')">
                    <span class="option-text">מבוטל</span>
                    <span class="check-mark">●</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר טיפוס -->
            <div class="filter-group type-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle type-filter-toggle" id="typeFilterToggle" onclick="toggleTypeFilter()">
                                          <span class="selected-value selected-type-text" id="selectedType">כל טיפוס</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="typeFilterMenu">
                  <div class="type-filter-item" data-value="סווינג" onclick="selectTypeOption('סווינג')">
                    <span class="option-text">סווינג</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="type-filter-item" data-value="השקעה" onclick="selectTypeOption('השקעה')">
                    <span class="option-text">השקעה</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="type-filter-item" data-value="פסיבי" onclick="selectTypeOption('פסיבי')">
                    <span class="option-text">פסיבי</span>
                    <span class="check-mark">●</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חשבון -->
            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle account-filter-toggle" id="accountFilterToggle" onclick="toggleAccountFilter()">
                  <span class="selected-value selected-account-text" id="selectedAccount">כל חשבון</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="accountFilterMenu">
                  <!-- חשבונות יטענו דינמית -->
                </div>
              </div>
            </div>

            <!-- פילטר תאריכים -->
            <div class="filter-group date-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle date-range-filter-toggle" id="dateRangeFilterToggle" onclick="toggleDateRangeFilter()">
                  <span class="selected-value selected-date-range-text" id="selectedDateRange">כל זמן</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="dateRangeFilterMenu">
                  <div class="date-range-filter-item" data-value="היום" onclick="selectDateRangeOption('היום')">
                    <span class="option-text">היום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="אתמול" onclick="selectDateRangeOption('אתמול')">
                    <span class="option-text">אתמול</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השבוע" onclick="selectDateRangeOption('השבוע')">
                    <span class="option-text">השבוע</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע" onclick="selectDateRangeOption('שבוע')">
                    <span class="option-text">שבוע</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="MTD" onclick="selectDateRangeOption('MTD')">
                    <span class="option-text">MTD</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="30 יום" onclick="selectDateRangeOption('30 יום')">
                    <span class="option-text">30 יום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="60 יום" onclick="selectDateRangeOption('60 יום')">
                    <span class="option-text">60 יום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="90 יום" onclick="selectDateRangeOption('90 יום')">
                    <span class="option-text">90 יום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="YTD" onclick="selectDateRangeOption('YTD')">
                    <span class="option-text">YTD</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה" onclick="selectDateRangeOption('שנה')">
                    <span class="option-text">שנה</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע קודם" onclick="selectDateRangeOption('שבוע קודם')">
                    <span class="option-text">שבוע קודם</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש קודם" onclick="selectDateRangeOption('חודש קודם')">
                    <span class="option-text">חודש קודם</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה קודמת" onclick="selectDateRangeOption('שנה קודמת')">
                    <span class="option-text">שנה קודמת</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="כל זמן" onclick="selectDateRangeOption('כל זמן')">
                    <span class="option-text">כל זמן</span>
                    <span class="check-mark">●</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חיפוש -->
            <div class="filter-group search-filter">
              <div class="search-input-wrapper">
                <input 
                  type="text" 
                  id="searchFilterInput" 
                  class="search-filter-input" 
                  placeholder="חיפוש..."
                  autocomplete="off"
                >
                <button class="search-clear-btn" id="searchClearBtn" title="נקה חיפוש">
                  <span class="search-clear-icon">×</span>
                </button>
              </div>
            </div>

            <!-- כפתורי איפוס וניקוי -->
            <div class="filter-group action-buttons">
              <button class="reset-btn" id="resetFiltersBtn" title="נקה פילטרים">
                <span class="reset-icon">↻</span>
              </button>
              <button class="clear-btn" id="clearFiltersBtn" title="נקה הכל">
                <span class="clear-icon">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // כפתור הצג/הסתר פילטרים
    document.addEventListener('click', (e) => {
      if (e.target.closest('#filterToggleBtn')) {
        this.toggleFiltersNew();
      }
    });

    // כפתור איפוס פילטרים
    document.addEventListener('click', (e) => {
      if (e.target.closest('#resetFiltersBtn')) {
        this.resetAllFilters();
      }
    });

    // כפתור ניקוי פילטרים
    document.addEventListener('click', (e) => {
      if (e.target.closest('#clearFiltersBtn')) {
        this.clearAllFilters();
      }
    });

    // כפתור נקה חיפוש
    document.addEventListener('click', (e) => {
      if (e.target.closest('#searchClearBtn')) {
        this.clearSearchFilter();
      }
    });

    // סגירת פילטרים בלחיצה מחוץ לתפריט
    document.addEventListener('click', (e) => {
      // בדיקה אם הלחיצה הייתה מחוץ לכל תפריטי הפילטרים
      const isClickInsideFilter = e.target.closest('.filter-menu') ||
        e.target.closest('.filter-toggle') ||
        e.target.closest('#searchFilterInput') ||
        e.target.closest('#searchClearBtn');

      if (!isClickInsideFilter) {
        // סגירת כל הפילטרים
        this.closeAllFilterMenus();
      }
    });

    // Event listeners לדרופדאונים
    this.setupDropdownEventListeners();

    // הגדרת הפריט הפעיל
    this.setActiveMenuItem();

    // בדיקה אם ה-class active נוסף
    setTimeout(() => {
      const activeLinks = document.querySelectorAll('.tiktrack-nav-link.active');
      const activeDropdownItems = document.querySelectorAll('.tiktrack-dropdown-item.active');
      console.log('🔍 Active nav links found:', activeLinks.length);
      console.log('🔍 Active dropdown items found:', activeDropdownItems.length);
      activeLinks.forEach(link => {
        console.log('🔍 Active nav link:', link.getAttribute('href'), 'classes:', link.className);
      });
      activeDropdownItems.forEach(item => {
        console.log('🔍 Active dropdown item:', item.getAttribute('href'), 'classes:', item.className);
      });
    }, 100);

    // הוספת event listeners לכפתורי הניווט
    this.addMenuEventListeners();

    // הוספת event listeners לתפריט הנפתח
    this.addDropdownEventListeners();

    // הוספת event listeners לפריטי הפילטרים
    this.setupFilterItemEventListeners();

    // הוספת event listeners לתפריטי ניווט
    this.setupNavigationDropdowns();

    // שמירת מצב אזור הפילטרים
    this.restoreFiltersSectionState();

    // שחזור מצב הפילטרים הספציפיים
    setTimeout(() => {
      this.restoreFilterStates();
    }, 100);
  }

  // פונקציה לסגירת כל תפריטי הפילטרים
  closeAllFilterMenus() {
    // סגירת כל הפילטרים
    window.closeStatusFilter();
    window.closeTypeFilter();
    window.closeAccountFilter();
    window.closeDateRangeFilter();

    // איפוס מצב פעיל של כפתורים
    const toggles = document.querySelectorAll('.filter-toggle.active');
    toggles.forEach(toggle => {
      toggle.classList.remove('active');
    });
  }

  updateFilterTexts() {
    // עדכון טקסטים של כל הפילטרים
    updateStatusFilterDisplayText();
    updateTypeFilterDisplayText();
    updateAccountFilterDisplayText();
    updateDateRangeFilterDisplayText();

    // שמירת מצב הפילטרים
    this.saveFilterStates();
  }

  // שמירת מצב הפילטרים הספציפיים
  saveFilterStates() {
    const filterStates = {
      status: [],
      type: [],
      account: [],
      dateRange: []
    };

    // שמירת פילטר סטטוס
    const statusItems = document.querySelectorAll('.status-filter-item.selected');
    statusItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.status.push(optionText.textContent);
      }
    });

    // שמירת פילטר טיפוס
    const typeItems = document.querySelectorAll('.type-filter-item.selected');
    typeItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.type.push(optionText.textContent);
      }
    });

    // שמירת פילטר חשבון
    const accountItems = document.querySelectorAll('.account-filter-item.selected');
    accountItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.account.push(optionText.textContent);
      }
    });

    // שמירת פילטר תאריכים
    const dateRangeItems = document.querySelectorAll('.date-range-filter-item.selected');
    dateRangeItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.dateRange.push(optionText.textContent);
      }
    });

    // שמירת חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      filterStates.search = searchInput.value;
    }

    localStorage.setItem('filterStates', JSON.stringify(filterStates));
  }

  // שחזור מצב הפילטרים הספציפיים
  restoreFilterStates() {
    const savedStates = localStorage.getItem('filterStates');
    if (savedStates) {
      try {
        const filterStates = JSON.parse(savedStates);

        // שחזור פילטר סטטוס
        if (filterStates.status && filterStates.status.length > 0) {
          filterStates.status.forEach(status => {
            const item = document.querySelector(`.status-filter-item[data-value="${status}"]`);
            if (item) {
              item.classList.add('selected');
            }
          });
        }

        // שחזור פילטר טיפוס
        if (filterStates.type && filterStates.type.length > 0) {
          filterStates.type.forEach(type => {
            const item = document.querySelector(`.type-filter-item[data-value="${type}"]`);
            if (item) {
              item.classList.add('selected');
            }
          });
        }

        // שחזור פילטר חשבון
        if (filterStates.account && filterStates.account.length > 0) {
          filterStates.account.forEach(account => {
            const item = document.querySelector(`.account-filter-item[data-value="${account}"]`);
            if (item) {
              item.classList.add('selected');
            }
          });
        }

        // שחזור פילטר תאריכים
        if (filterStates.dateRange && filterStates.dateRange.length > 0) {
          filterStates.dateRange.forEach(dateRange => {
            const item = document.querySelector(`.date-range-filter-item[data-value="${dateRange}"]`);
            if (item) {
              item.classList.add('selected');
            }
          });
        }

        // שחזור חיפוש
        if (filterStates.search) {
          const searchInput = document.getElementById('searchFilterInput');
          if (searchInput) {
            searchInput.value = filterStates.search;
          }
        }

        // עדכון טקסטים
        this.updateFilterTexts();

        // הפעלת הפילטרים
        if (window.filterSystem) {
          window.filterSystem.updateFilter('status', filterStates.status || []);
          window.filterSystem.updateFilter('type', filterStates.type || []);
          window.filterSystem.updateFilter('account', filterStates.account || []);
          window.filterSystem.updateFilter('search', filterStates.search || '');
        }
      } catch (error) {
        console.error('Error restoring filter states:', error);
      }
    }
  }

  // פונקציה להגדרת הפריט הפעיל
  setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.tiktrack-nav-link');
    const dropdownItems = document.querySelectorAll('.tiktrack-dropdown-item');

    console.log('🔍 setActiveMenuItem - currentPath:', currentPath);
    console.log('🔍 setActiveMenuItem - navLinks found:', navLinks.length);
    console.log('🔍 setActiveMenuItem - dropdownItems found:', dropdownItems.length);

    // איפוס כל הפריטים
    navLinks.forEach(link => link.classList.remove('active'));
    dropdownItems.forEach(item => item.classList.remove('active'));

    // סימון הפריט הפעיל בתפריט הראשי
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && currentPath.includes(href)) {
        link.classList.add('active');
        console.log('✅ Added active to nav link:', href);
      }
    });

    // סימון הפריט הפעיל בתפריט המשנה
    dropdownItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && currentPath.includes(href)) {
        item.classList.add('active');
        console.log('✅ Added active to dropdown item:', href);
        // סימון גם הפריט הראשי אם יש פריט פעיל בתפריט המשנה
        const parentDropdown = item.closest('.tiktrack-nav-item');
        if (parentDropdown) {
          const parentLink = parentDropdown.querySelector('.tiktrack-nav-link');
          if (parentLink) {
            parentLink.classList.add('active');
            console.log('✅ Added active to parent nav link for dropdown item:', href);
          }
        }
      }
    });

    // סימון מיוחד לעמוד הבית
    if (currentPath === '/' || currentPath === '/index.html') {
      const homeLink = document.querySelector('.tiktrack-nav-link[data-page="home"]');
      if (homeLink) {
        homeLink.classList.add('active');
        console.log('✅ Added active to home link');
      }
    }
  }

  // הוספת event listeners לכפתורי הניווט (מתוך menu.js)
  addMenuEventListeners() {
    const navItems = document.querySelectorAll('.tiktrack-nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // הסרת active מכל הפריטים
        navItems.forEach(navItem => navItem.classList.remove('active'));

        // הוספת active לפריט הנוכחי
        item.classList.add('active');
      });
    });
  }

  // הוספת event listeners לתפריט הנפתח (מתוך menu.js)
  addDropdownEventListeners() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();

        // סגירת כל הדרופדאונים האחרים
        dropdownToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            const otherMenu = otherToggle.nextElementSibling;
            if (otherMenu && otherMenu.classList.contains('dropdown-menu')) {
              otherMenu.classList.remove('show');
            }
          }
        });

        // פתיחה/סגירה של הדרופדאון הנוכחי
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains('dropdown-menu')) {
          menu.classList.toggle('show');
        }
      });
    });

    // סגירת דרופדאונים בלחיצה מחוץ - DISABLED
    // document.addEventListener('click', (e) => {
    //   if (!e.target.closest('.dropdown')) {
    //     const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    //     dropdownMenus.forEach(menu => menu.classList.remove('show'));
    //   }
    // });
  }

  setupDropdownEventListeners() {
    // DISABLED - Using global toggle functions instead
    // const dropdowns = [
    //   { toggle: 'dateRangeFilterToggle', menu: 'dateRangeFilterMenu' },
    //   { toggle: 'statusFilterToggle', menu: 'statusFilterMenu' },
    //   { toggle: 'typeFilterToggle', menu: 'typeFilterMenu' },
    //   { toggle: 'accountFilterToggle', menu: 'accountFilterMenu' }
    // ];

    // dropdowns.forEach(({ toggle, menu }) => {
    //   const toggleElement = document.getElementById(toggle);
    //   if (toggleElement) {
    //     toggleElement.addEventListener('click', (e) => {
    //       e.stopPropagation();
    //       this.toggleDropdown(menu);
    //     });
    //   }
    // });
  }

  toggleFilters() {
    const filtersElement = document.getElementById('headerFilters');
    const toggleBtn = document.getElementById('filterToggleBtn');
    const arrow = toggleBtn.querySelector('.filter-arrow');

    this.isFilterCollapsed = !this.isFilterCollapsed;

    if (this.isFilterCollapsed) {
      filtersElement.style.display = 'none';
      arrow.textContent = '▶';
      toggleBtn.classList.add('collapsed');
    } else {
      filtersElement.style.display = 'block';
      arrow.textContent = '▼';
      toggleBtn.classList.remove('collapsed');
    }

    this.saveState();
  }

  toggleDropdown(menuId) {
    // DISABLED - Using global toggle functions instead
    // const menu = document.getElementById(menuId);
    // const isVisible = menu.classList.contains('show');

    // this.closeAllDropdowns();

    // if (!isVisible) {
    //   menu.classList.add('show');
    // }
  }

  closeAllDropdowns() {
    // DISABLED - Using global toggle functions instead
    // const menus = document.querySelectorAll('.filter-menu');
    // menus.forEach(menu => menu.classList.remove('show'));
  }

  loadSavedState() {
    const savedState = localStorage.getItem('headerState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.isFilterCollapsed = state.isFilterCollapsed || false;

      if (this.isFilterCollapsed) {
        const filtersElement = document.getElementById('headerFilters');
        const toggleBtn = document.getElementById('filterToggleBtn');
        const arrow = toggleBtn.querySelector('.filter-arrow');

        if (filtersElement) {
          filtersElement.style.display = 'none';
          arrow.textContent = '▶';
          toggleBtn.classList.add('collapsed');
        }
      }
    }
  }

  saveState() {
    const state = {
      isFilterCollapsed: this.isFilterCollapsed
    };
    localStorage.setItem('headerState', JSON.stringify(state));
  }

  // פונקציה לעדכון חשבונות בפילטר
  updateAccountFilter(accounts) {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu) return;

    accountMenu.innerHTML = '';

    accounts.forEach(account => {
      const item = document.createElement('div');
      item.className = 'account-filter-item';
      item.setAttribute('data-account-id', account.id);
      item.setAttribute('data-value', account.name);
      item.innerHTML = `
        <span class="option-text">${account.name}</span>
        <span class="check-mark">●</span>
      `;

      // הוספת event listener
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        item.classList.toggle('selected');

        // עדכון הפילטר
        if (window.headerSystem && window.headerSystem.updateAccountFilterDisplayText) {
          window.headerSystem.updateAccountFilterDisplayText();
        } else {
          updateAccountFilterDisplayText();
        }
        if (window.headerSystem && window.headerSystem.updateAccountFilter) {
          window.headerSystem.updateAccountFilter();
        } else {
          updateAccountFilter();
        }
      });

      accountMenu.appendChild(item);
    });
  }

  toggleFilters() {
    const filtersElement = document.getElementById('headerFilters');
    const toggleBtn = document.getElementById('filterToggleBtn');
    const arrow = toggleBtn.querySelector('.filter-arrow');

    this.isFilterCollapsed = !this.isFilterCollapsed;

    if (this.isFilterCollapsed) {
      filtersElement.style.display = 'none';
      arrow.textContent = '▶';
      toggleBtn.classList.add('collapsed');
    } else {
      filtersElement.style.display = 'block';
      arrow.textContent = '▼';
      toggleBtn.classList.remove('collapsed');
    }

    this.saveState();
  }

  toggleDropdown(menuId) {
    // DISABLED - Using global toggle functions instead (duplicate function)
    // const menu = document.getElementById(menuId);
    // const isVisible = menu.classList.contains('show');

    // this.closeAllDropdowns();

    // if (!isVisible) {
    //   menu.classList.add('show');
    // }
  }

  closeAllDropdowns() {
    // DISABLED - Using global toggle functions instead (duplicate function)
    // const menus = document.querySelectorAll('.filter-menu');
    // menus.forEach(menu => menu.classList.remove('show'));
  }

  setupFilterItemEventListeners() {
    // Event listeners לפריטי פילטר תאריכים
    const dateItems = document.querySelectorAll('#dateRangeFilterMenu .filter-item');
    dateItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const range = item.getAttribute('data-range');
        const text = item.textContent.trim();

        // עדכון הטקסט המוצג
        document.getElementById('selectedDateRange').textContent = text;

        // עדכון הפילטר במערכת
        if (window.filterSystem) {
          window.filterSystem.updateFilter('dateRange', range);
        }

        // סגירת הדרופדאון
        this.closeAllDropdowns();
      });
    });

    // Event listeners לפריטי פילטר סטטוס
    const statusItems = document.querySelectorAll('#statusFilterMenu .filter-item');
    statusItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const status = item.getAttribute('data-value');

        // toggle selection
        item.classList.toggle('selected');

        // collect all selected statuses
        const selectedStatuses = Array.from(document.querySelectorAll('#statusFilterMenu .filter-item.selected'))
          .map(item => item.getAttribute('data-value'));

        // update display text
        const statusElement = document.getElementById('selectedStatus');
        if (selectedStatuses.length === 0) {
          statusElement.textContent = 'כל הסטטוסים';
        } else if (selectedStatuses.length === 1) {
          statusElement.textContent = selectedStatuses[0];
        } else {
          statusElement.textContent = `${selectedStatuses.length} סטטוסים`;
        }

        // עדכון הפילטר במערכת
        if (window.simpleFilter) {
          window.simpleFilter.currentFilters.status = selectedStatuses;
          window.simpleFilter.applyFilters();
        }

        // לא סוגרים את הדרופדאון - מאפשרים בחירה מרובה
        // this.closeAllDropdowns();
      });
    });

    // Event listeners לפריטי פילטר טיפוס
    const typeItems = document.querySelectorAll('#typeFilterMenu .filter-item');
    typeItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const type = item.getAttribute('data-value');

        // toggle selection
        item.classList.toggle('selected');

        // collect all selected types
        const selectedTypes = Array.from(document.querySelectorAll('#typeFilterMenu .filter-item.selected'))
          .map(item => item.getAttribute('data-value'));

        // update display text
        const typeElement = document.getElementById('selectedType');
        if (selectedTypes.length === 0) {
          typeElement.textContent = 'כל הסוגים';
        } else if (selectedTypes.length === 1) {
          typeElement.textContent = selectedTypes[0];
        } else {
          typeElement.textContent = `${selectedTypes.length} סוגים`;
        }

        // עדכון הפילטר במערכת
        if (window.simpleFilter) {
          window.simpleFilter.currentFilters.type = selectedTypes;
          window.simpleFilter.applyFilters();
        }

        // לא סוגרים את הדרופדאון - מאפשרים בחירה מרובה
        // this.closeAllDropdowns();
      });
    });

    // Event listeners לפריטי פילטר חשבון
    const accountItems = document.querySelectorAll('#accountFilterMenu .filter-item');
    accountItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const account = item.getAttribute('data-value');

        // toggle selection
        item.classList.toggle('selected');

        // collect all selected accounts
        const selectedAccounts = Array.from(document.querySelectorAll('#accountFilterMenu .filter-item.selected'))
          .map(item => item.getAttribute('data-value'));

        // update display text
        const accountElement = document.getElementById('selectedAccount');
        if (selectedAccounts.length === 0) {
          accountElement.textContent = 'כל החשבונות';
        } else if (selectedAccounts.length === 1) {
          accountElement.textContent = selectedAccounts[0];
        } else {
          accountElement.textContent = `${selectedAccounts.length} חשבונות`;
        }

        // עדכון הפילטר במערכת
        if (window.simpleFilter) {
          window.simpleFilter.currentFilters.account = selectedAccounts;
          window.simpleFilter.applyFilters();
        }

        // לא סוגרים את הדרופדאון - מאפשרים בחירה מרובה
        // this.closeAllDropdowns();
      });
    });
  }

  setupNavigationDropdowns() {
    // Event listeners לתפריטי ניווט
    const navDropdownToggles = document.querySelectorAll('.tiktrack-nav-item.dropdown .tiktrack-dropdown-toggle');

    navDropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // סגירת כל הדרופדאונים האחרים
        navDropdownToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            const otherMenu = otherToggle.nextElementSibling;
            if (otherMenu && otherMenu.classList.contains('tiktrack-dropdown-menu')) {
              otherMenu.classList.remove('show');
            }
          }
        });

        // פתיחה/סגירה של הדרופדאון הנוכחי
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains('tiktrack-dropdown-menu')) {
          menu.classList.toggle('show');
        }
      });
    });

    // סגירת דרופדאונים בלחיצה מחוץ - DISABLED
    // document.addEventListener('click', (e) => {
    //   if (!e.target.closest('.tiktrack-nav-item.dropdown')) {
    //     const navMenus = document.querySelectorAll('.tiktrack-nav-item.dropdown .tiktrack-dropdown-menu');
    //     navMenus.forEach(menu => menu.classList.remove('show'));
    //   }
    // });
  }

  // פונקציה לטעינת חשבונות לפילטר
  loadAccountsForFilter() {
    // בדיקה אם יש חשבונות זמינים
    if (window.accountsData && window.accountsData.length > 0) {
      console.log('🏠 Loading accounts for filter:', window.accountsData);
      this.updateAccountFilter(window.accountsData);
    } else {
      console.log('🏠 No accounts data available, using sample data');
      // נתונים לדוגמה
      const sampleAccounts = [
        { id: 1, name: 'חשבון ראשי' },
        { id: 2, name: 'חשבון משני' },
        { id: 3, name: 'חשבון השקעות' }
      ];
      this.updateAccountFilter(sampleAccounts);
    }
  }

  // פונקציה חדשה לטוגל פילטרים עם חץ נכון
  toggleFiltersNew() {
    const filtersElement = document.getElementById('headerFilters');
    const toggleBtn = document.getElementById('filterToggleBtn');
    const arrow = toggleBtn.querySelector('.filter-arrow');

    if (filtersElement) {
      const isVisible = filtersElement.style.display !== 'none';

      if (isVisible) {
        filtersElement.style.display = 'none';
        arrow.textContent = '▶';
        toggleBtn.classList.add('collapsed');
        this.isFilterCollapsed = true;
        // שמירת מצב סגור
        localStorage.setItem('filtersSectionOpen', 'false');
      } else {
        filtersElement.style.display = 'block';
        arrow.textContent = '▼';
        toggleBtn.classList.remove('collapsed');
        this.isFilterCollapsed = false;
        // שמירת מצב פתוח
        localStorage.setItem('filtersSectionOpen', 'true');
      }

      this.saveState();
    }
  }

  // שמירת מצב אזור הפילטרים
  saveFiltersSectionState() {
    const filtersElement = document.getElementById('headerFilters');
    if (filtersElement) {
      const isOpen = filtersElement.style.display !== 'none';
      localStorage.setItem('filtersSectionOpen', isOpen.toString());
    }
  }

  // שחזור מצב אזור הפילטרים
  restoreFiltersSectionState() {
    const filtersElement = document.getElementById('headerFilters');
    const toggleBtn = document.getElementById('filterToggleBtn');
    const arrow = toggleBtn?.querySelector('.filter-arrow');

    if (filtersElement && toggleBtn && arrow) {
      const savedState = localStorage.getItem('filtersSectionOpen');

      if (savedState === 'true') {
        filtersElement.style.display = 'block';
        arrow.textContent = '▼';
        toggleBtn.classList.remove('collapsed');
        this.isFilterCollapsed = false;
      } else {
        filtersElement.style.display = 'none';
        arrow.textContent = '▶';
        toggleBtn.classList.add('collapsed');
        this.isFilterCollapsed = true;
      }
    }
  }

  // פונקציה לאיפוס כל הפילטרים
  resetAllFilters() {
    console.log('🔍 Resetting all filters');

    // איפוס פילטר סטטוס
    const statusMenu = document.getElementById('statusFilterMenu');
    if (statusMenu) {
      statusMenu.querySelectorAll('.status-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס פילטר טיפוס
    const typeMenu = document.getElementById('typeFilterMenu');
    if (typeMenu) {
      typeMenu.querySelectorAll('.type-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס פילטר חשבונות
    const accountMenu = document.getElementById('accountFilterMenu');
    if (accountMenu) {
      accountMenu.querySelectorAll('.account-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס פילטר תאריכים
    const dateMenu = document.getElementById('dateRangeFilterMenu');
    if (dateMenu) {
      dateMenu.querySelectorAll('.date-range-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // עדכון טקסטים
    this.updateFilterTexts();

    // עדכון פילטרים
    if (window.filterSystem) {
      window.filterSystem.updateFilter('status', []);
      window.filterSystem.updateFilter('type', []);
      window.filterSystem.updateFilter('account', []);
      window.filterSystem.updateFilter('dateRange', '');
      window.filterSystem.updateFilter('search', '');
    }

    // שמירת מצב
    this.saveFilterStates();
  }

  // פונקציה לניקוי כל הפילטרים (סגירת תפריטים)
  clearAllFilters() {
    console.log('🔍 Clearing all filters (closing menus)');

    // סגירת כל הפילטרים
    window.closeStatusFilter();
    window.closeTypeFilter();
    window.closeAccountFilter();
    window.closeDateRangeFilter();

    // איפוס מצב פעיל של כפתורים
    const toggles = document.querySelectorAll('.filter-toggle.active');
    toggles.forEach(toggle => {
      toggle.classList.remove('active');
    });
  }

  // פונקציה לנקות חיפוש
  clearSearchFilter() {
    console.log('🔍 Clearing search filter');
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    if (window.filterSystem) {
      window.filterSystem.updateFilter('search', '');
    }
  }

  // פונקציה לעדכון טקסטים
  updateFilterTexts() {
    updateStatusFilterDisplayText();
    updateTypeFilterDisplayText();
    updateAccountFilterDisplayText();
    updateDateRangeFilterDisplayText();
  }
}

// יצירת מופע גלובלי
window.headerSystem = new HeaderSystem();

// פונקציה גלובלית לעדכון חשבונות
window.updateAccountFilterMenu = function (accounts) {
  if (window.headerSystem) {
    window.headerSystem.updateAccountFilter(accounts);
  }
};

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    window.headerSystem.init();
  }
});

// ===== פונקציות גלובליות לפילטרים =====

// פונקציה לפילטר סטטוס
window.toggleStatusFilter = function () {
  console.log('🔍 toggleStatusFilter called');
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing status filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');
  console.log('🔍 Status filter is visible:', isVisible);

  if (isVisible) {
    window.closeStatusFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('status');

    menu.classList.add('show');
    toggle.classList.add('active');
    console.log('🔍 Status filter opened');
  }
};

window.toggleTypeFilter = function () {
  console.log('🔍 toggleTypeFilter called');
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing type filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');
  console.log('🔍 Type filter is visible:', isVisible);

  if (isVisible) {
    window.closeTypeFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('type');

    menu.classList.add('show');
    toggle.classList.add('active');
    console.log('🔍 Type filter opened');
  }
};

window.toggleAccountFilter = function () {
  console.log('🔍 toggleAccountFilter called');
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing account filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');
  console.log('🔍 Account filter is visible:', isVisible);

  if (isVisible) {
    window.closeAccountFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('account');

    menu.classList.add('show');
    toggle.classList.add('active');
    console.log('🔍 Account filter opened');
  }
};

window.toggleDateRangeFilter = function () {
  console.log('🔍 toggleDateRangeFilter called');
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing date range filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');
  console.log('🔍 Date filter is visible:', isVisible);

  if (isVisible) {
    window.closeDateRangeFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('dateRange');

    menu.classList.add('show');
    toggle.classList.add('active');
    console.log('🔍 Date filter opened');
  }
};

// פונקציות לבחירת אופציות
window.selectStatusOption = function (status) {
  console.log('🔍 selectStatusOption called with:', status);
  const menu = document.getElementById('statusFilterMenu');
  const item = menu.querySelector(`[data-value="${status}"]`);

  if (item) {
    item.classList.toggle('selected');
    updateStatusFilterDisplayText();

    // עדכון פילטר
    if (window.filterSystem) {
      const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
      const selectedValues = Array.from(selectedItems)
        .map(item => item.getAttribute('data-value'));
      window.filterSystem.updateFilter('status', selectedValues);
    }
  }
};

window.selectTypeOption = function (type) {
  console.log('🔍 selectTypeOption called with:', type);
  const menu = document.getElementById('typeFilterMenu');
  const item = menu.querySelector(`[data-value="${type}"]`);

  if (item) {
    item.classList.toggle('selected');
    updateTypeFilterDisplayText();

    // עדכון פילטר
    if (window.filterSystem) {
      const selectedItems = menu.querySelectorAll('.type-filter-item.selected');
      const selectedValues = Array.from(selectedItems)
        .map(item => item.getAttribute('data-value'));
      window.filterSystem.updateFilter('type', selectedValues);
    }
  }
};

window.selectAccountOption = function (account) {
  console.log('🔍 selectAccountOption called with:', account);
  const menu = document.getElementById('accountFilterMenu');
  const item = menu.querySelector(`[data-value="${account}"]`);

  if (item) {
    item.classList.toggle('selected');
    updateAccountFilterDisplayText();

    // עדכון פילטר
    if (window.filterSystem) {
      const selectedItems = menu.querySelectorAll('.account-filter-item.selected');
      const selectedValues = Array.from(selectedItems)
        .map(item => item.getAttribute('data-value'));
      window.filterSystem.updateFilter('account', selectedValues);
    }
  }
};

window.selectDateRangeOption = function (dateRange) {
  console.log('🔍 selectDateRangeOption called with:', dateRange);
  const menu = document.getElementById('dateRangeFilterMenu');

  // הסרת בחירה מכל הפריטים
  menu.querySelectorAll('.date-range-filter-item').forEach(item => {
    item.classList.remove('selected');
  });

  // בחירת הפריט הנבחר
  const item = menu.querySelector(`[data-value="${dateRange}"]`);
  if (item) {
    item.classList.add('selected');
    updateDateRangeFilterDisplayText();

    // עדכון פילטר
    if (window.filterSystem) {
      window.filterSystem.updateFilter('dateRange', dateRange);
    }
  }
};

// פונקציות לסגירת פילטרים
window.closeStatusFilter = function () {
  console.log('🔍 closeStatusFilter called');
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

window.closeTypeFilter = function () {
  console.log('🔍 closeTypeFilter called');
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

window.closeAccountFilter = function () {
  console.log('🔍 closeAccountFilter called');
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

window.closeDateRangeFilter = function () {
  console.log('🔍 closeDateRangeFilter called');
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

// פונקציה לסגירת פילטרים אחרים
function closeOtherFilters(excludeFilter) {
  console.log('🔍 closeOtherFilters called with excludeFilter:', excludeFilter);

  if (excludeFilter !== 'status') {
    window.closeStatusFilter();
  }
  if (excludeFilter !== 'type') {
    window.closeTypeFilter();
  }
  if (excludeFilter !== 'account') {
    window.closeAccountFilter();
  }
  if (excludeFilter !== 'dateRange') {
    window.closeDateRangeFilter();
  }
}

// פונקציות לעדכון טקסטים
/**
 * Update status filter display text
 * 
 * This function updates the status filter button text to show the currently
 * selected status filter. It provides visual feedback to users about the
 * active filter state.
 * 
 * @returns {void}
 * 
 * Features:
 * - Dynamic text updates based on selected filter
 * - Integration with global filter state
 * - Visual feedback for active filters
 * - Consistent display across all pages
 */
function updateStatusFilterDisplayText() {
  console.log('🔍 updateStatusFilterText called');
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Status filter elements not found');
    return;
  }

  const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
  const selectedText = toggle.querySelector('.selected-status-text');

  if (selectedItems.length === 0) {
    selectedText.textContent = 'כל סטטוס';
  } else if (selectedItems.length === 1) {
    const optionText = selectedItems[0].querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
    selectedText.textContent = textContent;
  } else {
    selectedText.textContent = `${selectedItems.length} סטטוסים`;
  }
}

/**
 * Update type filter display text
 * 
 * This function updates the type filter button text to show the currently
 * selected type filter. It provides visual feedback to users about the
 * active filter state.
 * 
 * @returns {void}
 * 
 * Features:
 * - Dynamic text updates based on selected filter
 * - Integration with global filter state
 * - Visual feedback for active filters
 * - Consistent display across all pages
 */
function updateTypeFilterDisplayText() {
  console.log('🔍 updateTypeFilterText called');
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Type filter elements not found');
    return;
  }

  const selectedItems = menu.querySelectorAll('.type-filter-item.selected');
  const selectedText = toggle.querySelector('.selected-type-text');

  if (selectedItems.length === 0) {
    selectedText.textContent = 'כל טיפוס';
  } else if (selectedItems.length === 1) {
    const optionText = selectedItems[0].querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
    selectedText.textContent = textContent;
  } else {
    selectedText.textContent = `${selectedItems.length} סוגים`;
  }
}

/**
 * Update account filter display text
 * 
 * This function updates the account filter button text to show the currently
 * selected account filter. It provides visual feedback to users about the
 * active filter state.
 * 
 * @returns {void}
 * 
 * Features:
 * - Dynamic text updates based on selected filter
 * - Integration with global filter state
 * - Visual feedback for active filters
 * - Consistent display across all pages
 */
function updateAccountFilterDisplayText() {
  console.log('🔍 updateAccountFilterText called');
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Account filter elements not found');
    return;
  }

  const selectedItems = menu.querySelectorAll('.account-filter-item.selected');
  const selectedText = toggle.querySelector('.selected-account-text');

  if (selectedItems.length === 0) {
    selectedText.textContent = 'כל חשבון';
  } else if (selectedItems.length === 1) {
    const optionText = selectedItems[0].querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
    selectedText.textContent = textContent;
  } else {
    selectedText.textContent = `${selectedItems.length} חשבונות`;
  }
}

function updateDateRangeFilterDisplayText() {
  console.log('🔍 updateDateRangeFilterText called');
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Date range filter elements not found');
    return;
  }

  const selectedItem = menu.querySelector('.date-range-filter-item.selected');
  const selectedText = toggle.querySelector('.selected-date-range-text');

  if (selectedItem) {
    const optionText = selectedItem.querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItem.textContent;
    selectedText.textContent = textContent;
  } else {
    selectedText.textContent = 'כל זמן';
  }
}

/**
 * פילטר פשוט לטבלת טריידים
 * עובד ישירות על הטבלה ללא מורכבות
 */
class SimpleFilter {
  constructor() {
    this.currentFilters = {
      status: [],
      type: [],
      account: [],
      search: ''
    };
  }

  init() {
    console.log('🔧 SimpleFilter initializing...');

    // בדיקה מיידית אם האלמנטים קיימים
    const headerElement = document.getElementById('unified-header');
    console.log('🔧 Header element exists:', !!headerElement);

    if (headerElement) {
      const statusMenu = headerElement.querySelector('#statusFilterMenu');
      const typeMenu = headerElement.querySelector('#typeFilterMenu');
      const accountMenu = headerElement.querySelector('#accountFilterMenu');

      console.log('🔧 Menus exist - Status:', !!statusMenu, 'Type:', !!typeMenu, 'Account:', !!accountMenu);

      if (statusMenu) {
        const statusItems = statusMenu.querySelectorAll('.status-filter-item');
        console.log('🔧 Status items count:', statusItems.length);
      }
    }

    // המתן עד שהאלמנטים יהיו זמינים
    this.waitForElements();
  }

  waitForElements() {
    // בדיקה אם האלמנטים קיימים - מחפש בתוך unified-header
    const headerElement = document.getElementById('unified-header');
    if (!headerElement) {
      console.log('🔧 Header element not ready, waiting...');
      setTimeout(() => this.waitForElements(), 100);
      return;
    }

    const statusMenu = headerElement.querySelector('#statusFilterMenu');
    const typeMenu = headerElement.querySelector('#typeFilterMenu');
    const accountMenu = headerElement.querySelector('#accountFilterMenu');

    if (statusMenu && typeMenu && accountMenu) {
      console.log('🔧 Filter elements found, setting up listeners...');

      // בדיקה נוספת - האם יש פריטים בתוך התפריטים
      const statusItems = statusMenu.querySelectorAll('.status-filter-item');
      const typeItems = typeMenu.querySelectorAll('.type-filter-item');
      const accountItems = accountMenu.querySelectorAll('.account-filter-item');

      console.log('🔧 Items found - Status:', statusItems.length, 'Type:', typeItems.length, 'Account:', accountItems.length);

      if (statusItems.length > 0 || typeItems.length > 0 || accountItems.length > 0) {
        this.setupEventListeners();
      } else {
        console.log('🔧 No filter items found yet, waiting...');
        setTimeout(() => this.waitForElements(), 100);
      }
    } else {
      console.log('🔧 Filter elements not ready, waiting...');
      console.log(`Status: ${statusMenu ? '✅' : '❌'}, Type: ${typeMenu ? '✅' : '❌'}, Account: ${accountMenu ? '✅' : '❌'}`);
      setTimeout(() => this.waitForElements(), 100);
    }
  }

  setupEventListeners() {
    const headerElement = document.getElementById('unified-header');
    if (!headerElement) {
      console.error('❌ Header element not found');
      return;
    }

    // פילטר חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        this.updateFilter('search', searchTerm);
      });
    }

    // כפתור נקה חיפוש
    const searchClearBtn = document.getElementById('searchClearBtn');
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.updateFilter('search', '');
        }
      });
    }

    console.log('🔧 Event listeners setup completed');
  }

  updateFilter(filterType, value) {
    console.log(`🔍 Updating filter: ${filterType} =`, value);

    // עדכון הפילטר הנוכחי
    if (filterType === 'dateRange') {
      this.currentFilters.dateRange = value;
    } else if (filterType === 'search') {
      this.currentFilters.search = value;
    } else {
      this.currentFilters[filterType] = Array.isArray(value) ? value : [value];
    }

    // הפעלת הפילטרים על הטבלאות
    this.applyFilters();

    // שמירת מצב הפילטרים
    this.saveFilterStates();

    // עדכון שדות הבדיקה אם קיימים
    if (typeof updateDateRangeInfo === 'function') {
      updateDateRangeInfo();
    }

    // עדכון מידע דיבאג אם קיים
    this.updateDebugInfo();
  }

  applyFilters() {
    console.log('🔍 Applying filters:', this.currentFilters);

    // זיהוי כל הטבלאות הרלוונטיות
    const tables = document.querySelectorAll('table[id]');
    const excludedTables = ['notificationsTable']; // טבלאות שלא נכללות בפילטור

    tables.forEach(table => {
      if (excludedTables.includes(table.id)) {
        return; // דילוג על טבלאות שלא נכללות
      }

      const rows = table.querySelectorAll('tbody tr');
      let visibleRows = 0;

      rows.forEach(row => {
        let shouldShow = true;

        // פילטר סטטוס
        if (this.currentFilters.status.length > 0) {
          const statusCell = row.querySelector('[data-status]');
          if (statusCell) {
            const rowStatus = statusCell.getAttribute('data-status');
            if (!this.currentFilters.status.includes(rowStatus)) {
              shouldShow = false;
            }
          }
        }

        // פילטר טיפוס
        if (shouldShow && this.currentFilters.type.length > 0) {
          const typeCell = row.querySelector('[data-type]');
          if (typeCell) {
            const rowType = typeCell.getAttribute('data-type');
            if (!this.currentFilters.type.includes(rowType)) {
              shouldShow = false;
            }
          }
        }

        // פילטר חשבון
        if (shouldShow && this.currentFilters.account.length > 0) {
          const accountCell = row.querySelector('[data-account]');
          if (accountCell) {
            const rowAccount = accountCell.getAttribute('data-account');
            if (!this.currentFilters.account.includes(rowAccount)) {
              shouldShow = false;
            }
          }
        }

        // פילטר תאריכים
        if (shouldShow && this.currentFilters.dateRange && this.currentFilters.dateRange !== 'כל זמן') {
          const dateCell = row.querySelector('[data-date]');
          if (dateCell) {
            const dateString = dateCell.getAttribute('data-date');
            const rowDate = new Date(dateString);
            const today = new Date();

            let shouldIncludeDate = false;

            switch (this.currentFilters.dateRange) {
              case 'היום':
                shouldIncludeDate = this.isSameDay(rowDate, today);
                break;
              case 'אתמול':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                shouldIncludeDate = this.isSameDay(rowDate, yesterday);
                break;
              case 'השבוע':
                shouldIncludeDate = this.isThisWeekCalendar(rowDate);
                break;
              case 'שבוע':
                shouldIncludeDate = this.isLast7Days(rowDate);
                break;
              case 'MTD':
                shouldIncludeDate = this.isMonthToDate(rowDate);
                break;
              case 'YTD':
                shouldIncludeDate = this.isYearToDate(rowDate);
                break;
              case '30 יום':
                shouldIncludeDate = this.isLast30Days(rowDate);
                break;
              case '60 יום':
                shouldIncludeDate = this.isLast60Days(rowDate);
                break;
              case '90 יום':
                shouldIncludeDate = this.isLast90Days(rowDate);
                break;
              case 'שנה':
                shouldIncludeDate = this.isThisYear(rowDate);
                break;
              case 'שבוע קודם':
                shouldIncludeDate = this.isLastWeekCalendar(rowDate);
                break;
              case 'חודש קודם':
                shouldIncludeDate = this.isLastMonthCalendar(rowDate);
                break;
              case 'שנה קודמת':
                shouldIncludeDate = this.isLastYear(rowDate);
                break;
            }

            if (!shouldIncludeDate) {
              shouldShow = false;
            }
          }
        }

        // פילטר חיפוש
        if (shouldShow && this.currentFilters.search) {
          const searchText = this.currentFilters.search.toLowerCase();
          const rowText = row.textContent.toLowerCase();
          if (!rowText.includes(searchText)) {
            shouldShow = false;
          }
        }

        // הצגה/הסתרה של השורה
        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleRows++;
      });

      console.log(`📊 Table ${table.id}: ${visibleRows}/${rows.length} rows visible`);
    });
  }

  // פונקציות עזר לתאריכים
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  // השבוע - מתחילת השבוע הקלנדרי ועד היום כולל
  isThisWeekCalendar(date) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return date >= startOfWeek && date <= today;
  }

  // שבוע - שבעת ימים אחרונים
  isLast7Days(date) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return date >= sevenDaysAgo && date <= today;
  }

  // שבוע קודם - מתחילת השבוע הקודם ועד סופו
  isLastWeekCalendar(date) {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);

    return date >= startOfLastWeek && date <= endOfLastWeek;
  }

  // חודש קודם - מתחילת החודש הקלנדרי הקודם ועד סופו
  isLastMonthCalendar(date) {
    const today = new Date();
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    return date >= startOfLastMonth && date <= endOfLastMonth;
  }

  isMonthToDate(date) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return date >= startOfMonth && date <= today;
  }

  isYearToDate(date) {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return date >= startOfYear && date <= today;
  }

  isLast30Days(date) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return date >= thirtyDaysAgo && date <= today;
  }

  isLast60Days(date) {
    const today = new Date();
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    return date >= sixtyDaysAgo && date <= today;
  }

  isLast90Days(date) {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);

    return date >= ninetyDaysAgo && date <= today;
  }

  isThisYear(date) {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365);

    return date >= oneYearAgo && date <= today;
  }

  isLastYear(date) {
    const today = new Date();
    const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);

    return date >= startOfLastYear && date <= endOfLastYear;
  }

  updateDebugInfo() {
    // עדכון מידע דיבאג אם קיים
    if (typeof updateDebugInfo === 'function') {
      updateDebugInfo();
    }
  }

  resetFilters() {
    console.log('🔧 Resetting all filters');
    this.currentFilters = {
      status: [],
      type: [],
      account: [],
      search: ''
    };

    // איפוס UI
    const headerElement = document.getElementById('unified-header');
    if (headerElement) {
      // הסרת בחירה מכל הפריטים
      headerElement.querySelectorAll('.status-filter-item.selected, .type-filter-item.selected, .account-filter-item.selected, .date-range-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });

      // איפוס חיפוש
      const searchInput = document.getElementById('searchFilterInput');
      if (searchInput) {
        searchInput.value = '';
      }
    }

    this.applyFilters();
  }

  resetAllFilters() {
    console.log('🔍 Resetting all filters');

    // איפוס פילטר סטטוס
    const statusMenu = document.getElementById('statusFilterMenu');
    if (statusMenu) {
      statusMenu.querySelectorAll('.status-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס פילטר טיפוס
    const typeMenu = document.getElementById('typeFilterMenu');
    if (typeMenu) {
      typeMenu.querySelectorAll('.type-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס פילטר חשבונות
    const accountMenu = document.getElementById('accountFilterMenu');
    if (accountMenu) {
      accountMenu.querySelectorAll('.account-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס פילטר תאריכים
    const dateMenu = document.getElementById('dateRangeFilterMenu');
    if (dateMenu) {
      dateMenu.querySelectorAll('.date-range-filter-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    }

    // איפוס חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // עדכון טקסטים
    this.updateFilterTexts();

    // עדכון פילטרים
    if (window.filterSystem) {
      window.filterSystem.updateFilter('status', []);
      window.filterSystem.updateFilter('type', []);
      window.filterSystem.updateFilter('account', []);
      window.filterSystem.updateFilter('dateRange', '');
      window.filterSystem.updateFilter('search', '');
    }

    // שמירת מצב
    this.saveFilterStates();
  }

  clearSearchFilter() {
    console.log('🔍 Clearing search filter');
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    if (window.filterSystem) {
      window.filterSystem.updateFilter('search', '');
    }
  }

  updateFilterTexts() {
    updateStatusFilterDisplayText();
    updateTypeFilterDisplayText();
    updateAccountFilterDisplayText();
    updateDateRangeFilterDisplayText();
  }

  saveFilterStates() {
    const filterStates = {
      status: [],
      type: [],
      account: [],
      dateRange: []
    };

    // שמירת פילטר סטטוס
    const statusItems = document.querySelectorAll('.status-filter-item.selected');
    statusItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.status.push(optionText.textContent);
      }
    });

    // שמירת פילטר טיפוס
    const typeItems = document.querySelectorAll('.type-filter-item.selected');
    typeItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.type.push(optionText.textContent);
      }
    });

    // שמירת פילטר חשבון
    const accountItems = document.querySelectorAll('.account-filter-item.selected');
    accountItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.account.push(optionText.textContent);
      }
    });

    // שמירת פילטר תאריכים
    const dateRangeItems = document.querySelectorAll('.date-range-filter-item.selected');
    dateRangeItems.forEach(item => {
      const optionText = item.querySelector('.option-text');
      if (optionText) {
        filterStates.dateRange.push(optionText.textContent);
      }
    });

    // שמירת חיפוש
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      filterStates.search = searchInput.value;
    }

    localStorage.setItem('filterStates', JSON.stringify(filterStates));
  }
}

// יצירת instance גלובלי
window.filterSystem = new SimpleFilter();

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', () => {
  if (window.filterSystem) {
    window.filterSystem.init();
  }
});
