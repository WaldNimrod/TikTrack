/**
 * ========================================
 * אלמנט ראש הדף החדש - Header System
 * ========================================
 * 
 * אלמנט ראש דף מאוחד עם תפריט, לוגו ופילטר חכם
 * 
 * תכונות:
 * - לוגו וכותרת
 * - תפריט ניווט
 * - פילטר מאוחד שמתאים את עצמו לכל טבלה
 * - עיצוב אחיד בכל העמודים
 * 
 * מחבר: TikTrack Development Team
 * תאריך: 2025
 * ========================================
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
                    <a href="/planning" class="tiktrack-nav-link" data-page="planning">
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
                      <li><a class="tiktrack-dropdown-item" href="/accounts">חשבונות</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/notes">הערות</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/alerts">ניהול התראות</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/preferences">העדפות</a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="tiktrack-dropdown-item" href="/database">בסיס נתונים</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/currencies">מטבעות</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/tickers">טיקרים</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/executions">ביצועים</a></li>
                      <li><a class="tiktrack-dropdown-item" href="/trade_plans">תכניות מסחר</a></li>
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
                  <div class="status-filter-item" data-value="בוטל" onclick="selectStatusOption('בוטל')">
                    <span class="option-text">בוטל</span>
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
                  <div class="type-filter-item" data-value="מניה" onclick="selectTypeOption('מניה')">
                    <span class="option-text">מניה</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="type-filter-item" data-value="ETF" onclick="selectTypeOption('ETF')">
                    <span class="option-text">ETF</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="type-filter-item" data-value="קריפטו" onclick="selectTypeOption('קריפטו')">
                    <span class="option-text">קריפטו</span>
                    <span class="check-mark">●</span>
                  </div>
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
                  <div class="date-range-filter-item" data-value="שבוע אחרון" onclick="selectDateRangeOption('שבוע אחרון')">
                    <span class="option-text">שבוע אחרון</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש אחרון" onclick="selectDateRangeOption('חודש אחרון')">
                    <span class="option-text">חודש אחרון</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="3 חודשים" onclick="selectDateRangeOption('3 חודשים')">
                    <span class="option-text">3 חודשים</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="MTD" onclick="selectDateRangeOption('MTD')">
                    <span class="option-text">MTD</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="date-range-filter-item" data-value="YTD" onclick="selectDateRangeOption('YTD')">
                    <span class="option-text">YTD</span>
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
                  <div class="date-range-filter-item" data-value="שנה" onclick="selectDateRangeOption('שנה')">
                    <span class="option-text">שנה</span>
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

            <!-- כפתור איפוס -->
            <div class="filter-group reset-filter">
              <button class="reset-btn" id="resetFiltersBtn" title="נקה פילטרים">
                <span class="reset-icon">↻</span>
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

    // כפתור נקה חיפוש
    document.addEventListener('click', (e) => {
      if (e.target.closest('#searchClearBtn')) {
        this.clearSearchFilter();
      }
    });

    // סגירת דרופדאונים בלחיצה מחוץ
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        this.closeAllDropdowns();
      }
    });

    // Event listeners לדרופדאונים
    this.setupDropdownEventListeners();

    // הגדרת הפריט הפעיל
    this.setActiveMenuItem();

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

    // הוספת event listener לסגירת פילטר בלחיצה על הכותרת
    const statusToggle = document.querySelector('.status-filter-toggle');
    if (statusToggle) {
      statusToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // מונע סגירה מיידית
        window.toggleStatusFilter();
      });
    }

    // הוספת event listener לסגירת פילטר בלחיצה מחוץ לתפריט
    document.addEventListener('click', (event) => {
      const statusMenu = document.getElementById('statusFilterMenu');
      const statusToggle = document.querySelector('.status-filter-toggle');

      if (statusMenu && statusMenu.classList.contains('show')) {
        // בדיקה אם הלחיצה הייתה מחוץ לתפריט
        if (!statusMenu.contains(event.target) && !statusToggle.contains(event.target)) {
          console.log('🔍 Click outside status filter, closing...');
          window.closeStatusFilter();
        }
      }
    });

    // הוספת event listener לסגירת פילטר בלחיצה על Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const statusMenu = document.getElementById('statusFilterMenu');
        if (statusMenu && statusMenu.classList.contains('show')) {
          console.log('🔍 Escape pressed, closing status filter...');
          window.closeStatusFilter();
        }
      }
    });
  }

  updateFilterTexts() {
    // עדכון טקסטים של כל הפילטרים
    updateStatusFilterText();
    updateTypeFilterText();
    updateAccountFilterText();
    updateDateRangeFilterText();

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

  // פונקציה להגדרת הפריט הפעיל (מתוך menu.js)
  setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    // הסרת active מכל הפריטים
    navItems.forEach(item => item.classList.remove('active'));

    // הגדרת הפריט הפעיל לפי הנתיב הנוכחי
    if (currentPath === '/' || currentPath === '/index.html') {
      document.querySelector('[data-page="home"]')?.classList.add('active');
    } else if (currentPath.includes('/planning')) {
      document.querySelector('[data-page="planning"]')?.classList.add('active');
    } else if (currentPath.includes('/trades')) {
      document.querySelector('[data-page="trades"]')?.classList.add('active');
    } else if (currentPath.includes('/research')) {
      document.querySelector('[data-page="research"]')?.classList.add('active');
    } else if (currentPath.includes('/accounts')) {
      document.querySelector('[data-page="accounts"]')?.classList.add('active');
    } else if (currentPath.includes('/notes')) {
      document.querySelector('[data-page="notes"]')?.classList.add('active');
    } else if (currentPath.includes('/alerts')) {
      document.querySelector('[data-page="alerts"]')?.classList.add('active');
    } else if (currentPath.includes('/preferences')) {
      document.querySelector('[data-page="preferences"]')?.classList.add('active');
    } else if (currentPath.includes('/database')) {
      document.querySelector('[data-page="database"]')?.classList.add('active');
    }
  }

  // הוספת event listeners לכפתורי הניווט (מתוך menu.js)
  addMenuEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');

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

    // סגירת דרופדאונים בלחיצה מחוץ
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach(menu => menu.classList.remove('show'));
      }
    });
  }

  setupDropdownEventListeners() {
    const dropdowns = [
      { toggle: 'dateRangeFilterToggle', menu: 'dateRangeFilterMenu' },
      { toggle: 'statusFilterToggle', menu: 'statusFilterMenu' },
      { toggle: 'typeFilterToggle', menu: 'typeFilterMenu' },
      { toggle: 'accountFilterToggle', menu: 'accountFilterMenu' }
    ];

    dropdowns.forEach(({ toggle, menu }) => {
      const toggleElement = document.getElementById(toggle);
      if (toggleElement) {
        toggleElement.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleDropdown(menu);
        });
      }
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
    const menu = document.getElementById(menuId);
    const isVisible = menu.classList.contains('show');

    this.closeAllDropdowns();

    if (!isVisible) {
      menu.classList.add('show');
    }
  }

  closeAllDropdowns() {
    const menus = document.querySelectorAll('.filter-menu');
    menus.forEach(menu => menu.classList.remove('show'));
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
      item.className = 'filter-item';
      item.setAttribute('data-account-id', account.id);
      item.innerHTML = `
        <span class="option-text">${account.name}</span>
        <span class="check-mark">●</span>
      `;
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
    const menu = document.getElementById(menuId);
    const isVisible = menu.classList.contains('show');

    this.closeAllDropdowns();

    if (!isVisible) {
      menu.classList.add('show');
    }
  }

  closeAllDropdowns() {
    const menus = document.querySelectorAll('.filter-menu');
    menus.forEach(menu => menu.classList.remove('show'));
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

    // סגירת דרופדאונים בלחיצה מחוץ
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tiktrack-nav-item.dropdown')) {
        const navMenus = document.querySelectorAll('.tiktrack-nav-item.dropdown .tiktrack-dropdown-menu');
        navMenus.forEach(menu => menu.classList.remove('show'));
      }
    });
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

  console.log('🔍 Menu element:', menu);
  console.log('🔍 Toggle element:', toggle);

  if (!menu || !toggle) {
    console.log('🔍 Missing status filter elements');
    return;
  }

  console.log('🔍 Menu classes before:', menu.className);
  console.log('🔍 Toggle classes before:', toggle.className);

  const isVisible = menu.classList.contains('show');
  console.log('🔍 Status filter is visible:', isVisible);

  if (isVisible) {
    window.closeStatusFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('status');

    menu.classList.add('show');
    toggle.classList.add('active');

    // הוספת CSS inline כדי לוודא שהוא עובד
    menu.style.display = 'block';
    menu.style.position = 'absolute';
    menu.style.top = '100%';
    menu.style.right = '0';
    menu.style.background = 'white';
    menu.style.border = '1px solid #e8e8e8';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    menu.style.minWidth = '180px';
    menu.style.zIndex = '10001';
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateY(0)';

    console.log('🔍 Status filter opened');
    console.log('🔍 Menu classes after open:', menu.className);
    console.log('🔍 Toggle classes after open:', toggle.className);
    console.log('🔍 Menu has show class:', menu.classList.contains('show'));
    console.log('🔍 Menu style display before:', menu.style.display);
    console.log('🔍 Menu style display after:', menu.style.display);
    console.log('🔍 Menu computed display before:', window.getComputedStyle(menu).display);
    console.log('🔍 Menu computed display after:', window.getComputedStyle(menu).display);

    // בדיקת CSS
    console.log('🔍 Menu computed style display:', window.getComputedStyle(menu).display);
    console.log('🔍 Menu computed style visibility:', window.getComputedStyle(menu).visibility);
    console.log('🔍 Menu computed style opacity:', window.getComputedStyle(menu).opacity);
    console.log('🔍 Menu computed style position:', window.getComputedStyle(menu).position);
    console.log('🔍 Menu computed style z-index:', window.getComputedStyle(menu).zIndex);
    console.log('🔍 Menu computed style width:', window.getComputedStyle(menu).width);
    console.log('🔍 Menu computed style height:', window.getComputedStyle(menu).height);
    console.log('🔍 Menu computed style min-width:', window.getComputedStyle(menu).minWidth);
    console.log('🔍 Menu computed style background:', window.getComputedStyle(menu).background);
    console.log('🔍 Menu computed style border:', window.getComputedStyle(menu).border);
  }

  updateStatusFilterText();
};

// פונקציות לפילטר טיפוס
window.toggleTypeFilter = function () {
  console.log('🔍 toggleTypeFilter called');
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing type filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');

  if (isVisible) {
    window.closeTypeFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('type');

    menu.classList.add('show');
    toggle.classList.add('active');
  }

  if (window.headerSystem) {
    window.headerSystem.updateTypeFilterText();
  }
};

window.selectTypeOption = function (type) {
  console.log('🔍 selectTypeOption called with:', type);
  const menu = document.getElementById('typeFilterMenu');
  const item = menu.querySelector(`[data-value="${type}"]`);

  if (item) {
    item.classList.toggle('selected');
    updateTypeFilterText();
    updateTypeFilter();
  }
};

window.closeTypeFilter = function () {
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

// פונקציות לפילטר חשבונות
window.toggleAccountFilter = function () {
  console.log('🔍 toggleAccountFilter called');
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing account filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');

  if (isVisible) {
    window.closeAccountFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('account');

    menu.classList.add('show');
    toggle.classList.add('active');
  }

  updateAccountFilterText();
};

window.selectAccountOption = function (account) {
  console.log('🔍 selectAccountOption called with:', account);
  const menu = document.getElementById('accountFilterMenu');
  const item = menu.querySelector(`[data-value="${account}"]`);

  if (item) {
    item.classList.toggle('selected');
    updateAccountFilterText();
    updateAccountFilter();
  }
};

window.closeAccountFilter = function () {
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

// פונקציות לפילטר תאריכים
window.toggleDateRangeFilter = function () {
  console.log('🔍 toggleDateRangeFilter called');
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');

  if (!menu || !toggle) {
    console.log('🔍 Missing date range filter elements');
    return;
  }

  const isVisible = menu.classList.contains('show');

  if (isVisible) {
    window.closeDateRangeFilter();
  } else {
    // סגירת פילטרים אחרים
    closeOtherFilters('dateRange');

    menu.classList.add('show');
    toggle.classList.add('active');
  }

  updateDateRangeFilterText();
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
    updateDateRangeFilterText();
    updateDateRangeFilter();
  }
};

window.closeDateRangeFilter = function () {
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
  }
  if (toggle) {
    toggle.classList.remove('active');
  }
};

// פונקציות לסגירת פילטרים
window.closeStatusFilter = function () {
  console.log('🔍 window.closeStatusFilter called');
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');

  if (menu) {
    menu.classList.remove('show');
    // הסרת inline styles
    menu.style.display = '';
    menu.style.position = '';
    menu.style.top = '';
    menu.style.right = '';
    menu.style.background = '';
    menu.style.border = '';
    menu.style.borderRadius = '';
    menu.style.boxShadow = '';
    menu.style.minWidth = '';
    menu.style.zIndex = '';
    menu.style.opacity = '';
    menu.style.visibility = '';
    menu.style.transform = '';
  }

  if (toggle) toggle.classList.remove('active');

  console.log('🔍 window.closeStatusFilter completed');
};

// פונקציות לבחירת אופציות - יוסיפו בהמשך

// פונקציות לסגירת פילטרים - יוסיפו בהמשך

function closeTypeFilter() {
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');
  if (menu) menu.classList.remove('show');
  if (toggle) toggle.classList.remove('active');
}

function closeAccountFilter() {
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');
  if (menu) menu.classList.remove('show');
  if (toggle) toggle.classList.remove('active');
}

function closeDateRangeFilter() {
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');
  if (menu) menu.classList.remove('show');
  if (toggle) toggle.classList.remove('active');
}

// פונקציה לסגירת פילטרים אחרים
function closeOtherFilters(excludeFilter) {
  console.log('🔍 closeOtherFilters called with excludeFilter:', excludeFilter);

  // סגירת פילטר סטטוס אם לא הוא הפילטר החריג
  if (excludeFilter !== 'status') {
    console.log('🔍 Closing status filter');
    window.closeStatusFilter();
  }

  // סגירת פילטר טיפוס אם לא הוא הפילטר החריג
  if (excludeFilter !== 'type') {
    console.log('🔍 Closing type filter');
    window.closeTypeFilter();
  }

  // סגירת פילטר חשבונות אם לא הוא הפילטר החריג
  if (excludeFilter !== 'account') {
    console.log('🔍 Closing account filter');
    window.closeAccountFilter();
  }

  // סגירת פילטר תאריכים אם לא הוא הפילטר החריג
  if (excludeFilter !== 'dateRange') {
    console.log('🔍 Closing date range filter');
    window.closeDateRangeFilter();
  }
}

// פונקציות לבחירת אופציות
window.selectStatusOption = function (status) {
  console.log('🔍 selectStatusOption called with:', status);
  const menu = document.getElementById('statusFilterMenu');
  console.log('🔍 Status menu element:', menu);

  if (!menu) {
    console.log('🔍 Status menu not found!');
    return;
  }

  const items = menu.querySelectorAll('.status-filter-item');
  console.log('🔍 Found status filter items:', items.length);

  const item = Array.from(items)
    .find(item => {
      const optionText = item.querySelector('.option-text');
      const textContent = optionText ? optionText.textContent : item.textContent;
      console.log('🔍 Checking item text:', textContent, 'against:', status);
      return textContent === status;
    });

  console.log('🔍 Found matching item:', item);

  if (item) {
    console.log('🔍 Before toggle - item classes:', item.className);
    item.classList.toggle('selected');
    console.log('🔍 After toggle - item classes:', item.className);

    // בדיקה אם ה-class נוסף
    const hasSelected = item.classList.contains('selected');
    console.log('🔍 Item has selected class:', hasSelected);

    updateStatusFilterText();

    // עדכון פילטר
    if (window.filterSystem) {
      const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
      console.log('🔍 Selected items count:', selectedItems.length);
      const selectedValues = Array.from(selectedItems)
        .map(item => {
          const optionText = item.querySelector('.option-text');
          return optionText ? optionText.textContent : item.textContent;
        });

      console.log('🔍 Selected values:', selectedValues);
      window.filterSystem.updateFilter('status', selectedValues);
    }

    // שמירת מצב הפילטרים
    if (window.headerSystem) {
      window.headerSystem.saveFilterStates();
    }
  } else {
    console.log('🔍 No matching item found for status:', status);
  }
};

// פונקציות לבחירת אופציות - יוסיפו בהמשך

// פונקציות עזר לעדכון טקסטים
function updateStatusFilterText() {
  console.log('🔍 updateStatusFilterText called');
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');

  console.log('🔍 Menu element:', menu);
  console.log('🔍 Toggle element:', toggle);

  if (!menu || !toggle) {
    console.log('🔍 Menu or toggle not found');
    return;
  }

  const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
  console.log('🔍 Selected items found:', selectedItems.length);

  const selectedText = toggle.querySelector('.selected-status-text');
  console.log('🔍 Selected text element:', selectedText);

  if (selectedItems.length === 0) {
    selectedText.textContent = 'כל סטטוס';
    console.log('🔍 Updated text to: כל סטטוס');
  } else if (selectedItems.length === 1) {
    const optionText = selectedItems[0].querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
    selectedText.textContent = textContent;
    console.log('🔍 Updated text to:', textContent);
  } else {
    selectedText.textContent = `${selectedItems.length} סטטוסים`;
    console.log('🔍 Updated text to:', `${selectedItems.length} סטטוסים`);
  }

  // בדיקת CSS נוספת
  console.log('🔍 Menu final computed style display:', window.getComputedStyle(menu).display);
  console.log('🔍 Menu final computed style visibility:', window.getComputedStyle(menu).visibility);
  console.log('🔍 Menu final computed style opacity:', window.getComputedStyle(menu).opacity);
  console.log('🔍 Menu final computed style position:', window.getComputedStyle(menu).position);
  console.log('🔍 Menu final computed style z-index:', window.getComputedStyle(menu).zIndex);
  console.log('🔍 Menu final computed style top:', window.getComputedStyle(menu).top);
  console.log('🔍 Menu final computed style right:', window.getComputedStyle(menu).right);
}

function updateTypeFilterText() {
  console.log('🔍 updateTypeFilterText called');
  const menu = document.getElementById('typeFilterMenu');
  const toggle = document.querySelector('.type-filter-toggle');

  console.log('🔍 Type menu element:', menu);
  console.log('🔍 Type toggle element:', toggle);

  if (!menu || !toggle) {
    console.log('🔍 Type menu or toggle not found');
    return;
  }

  const selectedItems = menu.querySelectorAll('.type-filter-item.selected');
  console.log('🔍 Type selected items found:', selectedItems.length);

  const selectedText = toggle.querySelector('.selected-type-text');
  console.log('🔍 Type selected text element:', selectedText);

  if (selectedItems.length === 0) {
    selectedText.textContent = 'כל טיפוס';
    console.log('🔍 Updated type text to: כל טיפוס');
  } else if (selectedItems.length === 1) {
    const optionText = selectedItems[0].querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
    selectedText.textContent = textContent;
    console.log('🔍 Updated type text to:', textContent);
  } else {
    selectedText.textContent = `${selectedItems.length} סוגים`;
    console.log('🔍 Updated type text to:', `${selectedItems.length} סוגים`);
  }
}

function updateAccountFilterText() {
  console.log('🔍 updateAccountFilterText called');
  const menu = document.getElementById('accountFilterMenu');
  const toggle = document.querySelector('.account-filter-toggle');

  console.log('🔍 Account menu element:', menu);
  console.log('🔍 Account toggle element:', toggle);

  if (!menu || !toggle) {
    console.log('🔍 Account menu or toggle not found');
    return;
  }

  const selectedItems = menu.querySelectorAll('.account-filter-item.selected');
  console.log('🔍 Account selected items found:', selectedItems.length);

  const selectedText = toggle.querySelector('.selected-account-text');
  console.log('🔍 Account selected text element:', selectedText);

  if (selectedItems.length === 0) {
    selectedText.textContent = 'כל חשבון';
    console.log('🔍 Updated account text to: כל חשבון');
  } else if (selectedItems.length === 1) {
    const optionText = selectedItems[0].querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
    selectedText.textContent = textContent;
    console.log('🔍 Updated account text to:', textContent);
  } else {
    selectedText.textContent = `${selectedItems.length} חשבונות`;
    console.log('🔍 Updated account text to:', `${selectedItems.length} חשבונות`);
  }
}

function updateDateRangeFilterText() {
  console.log('🔍 updateDateRangeFilterText called');
  const menu = document.getElementById('dateRangeFilterMenu');
  const toggle = document.querySelector('.date-range-filter-toggle');

  console.log('🔍 Date range menu element:', menu);
  console.log('🔍 Date range toggle element:', toggle);

  if (!menu || !toggle) {
    console.log('🔍 Date range menu or toggle not found');
    return;
  }

  const selectedItem = menu.querySelector('.date-range-filter-item.selected');
  console.log('🔍 Date range selected item:', selectedItem);

  const selectedText = toggle.querySelector('.selected-date-range-text');
  console.log('🔍 Date range selected text element:', selectedText);

  if (selectedItem) {
    const optionText = selectedItem.querySelector('.option-text');
    const textContent = optionText ? optionText.textContent : selectedItem.textContent;
    selectedText.textContent = textContent;
    console.log('🔍 Updated date range text to:', textContent);
  } else {
    selectedText.textContent = 'כל זמן';
    console.log('🔍 Updated date range text to: כל זמן');
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
    console.log(`🔍 Updating ${filterType} filter with:`, value);

    if (filterType === 'status') {
      this.currentFilters.status = Array.isArray(value) ? value : [value];
    } else if (filterType === 'type') {
      this.currentFilters.type = Array.isArray(value) ? value : [value];
    } else if (filterType === 'account') {
      this.currentFilters.account = Array.isArray(value) ? value : [value];
    } else if (filterType === 'search') {
      this.currentFilters.search = value;
    }

    this.applyFilters();
  }

  applyFilters() {
    console.log('🔍 Applying filters:', this.currentFilters);

    // מציאת כל הטבלאות בדף
    const tables = document.querySelectorAll('table[id]');
    console.log('🔍 Found tables:', tables.length);

    tables.forEach(table => {
      this.filterTable(table);
    });
  }

  filterTable(table) {
    const tableId = table.id;

    // עקיפת טבלאות מסוימות שלא צריכות פילטר
    if (tableId === 'notificationsTable') {
      console.log(`🔍 Skipping notifications table - no filtering applied`);
      return;
    }

    const rows = table.querySelectorAll('tbody tr');
    console.log(`🔍 Filtering table: ${tableId} with ${rows.length} rows`);

    let visibleCount = 0;

    rows.forEach((row, index) => {
      const isVisible = this.shouldShowRow(row);

      if (isVisible) {
        row.style.display = '';
        visibleCount++;
        console.log(`✅ ${tableId} Row ${index} visible`);
      } else {
        row.style.display = 'none';
        console.log(`❌ ${tableId} Row ${index} hidden by filters`);
      }
    });

    console.log(`🎯 ${tableId} filter result: ${visibleCount}/${rows.length} rows visible`);
  }

  shouldShowRow(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return true;

    // בדיקת פילטר סטטוס
    if (this.currentFilters.status.length > 0) {
      const statusCell = this.findStatusCell(cells);
      if (statusCell && !this.currentFilters.status.includes(statusCell.textContent.trim())) {
        console.log(`❌ Row hidden by status filter`);
        return false;
      }
    }

    // בדיקת פילטר טיפוס
    if (this.currentFilters.type.length > 0) {
      const typeCell = this.findTypeCell(cells);
      if (typeCell && !this.currentFilters.type.includes(typeCell.textContent.trim())) {
        console.log(`❌ Row hidden by type filter`);
        return false;
      }
    }

    // בדיקת פילטר חשבון
    if (this.currentFilters.account.length > 0) {
      const accountCell = this.findAccountCell(cells);
      if (accountCell && !this.currentFilters.account.includes(accountCell.textContent.trim())) {
        console.log(`❌ Row hidden by account filter`);
        return false;
      }
    }

    // בדיקת פילטר חיפוש
    if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
      const searchTerm = this.currentFilters.search.toLowerCase();
      const rowText = row.textContent.toLowerCase();
      if (!rowText.includes(searchTerm)) {
        console.log(`❌ Row hidden by search filter`);
        return false;
      }
    }

    return true;
  }

  findStatusCell(cells) {
    // מחפש תא סטטוס - בדרך כלל עמודה שנייה או שלישית
    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i].textContent.trim();
      if (['פתוח', 'סגור', 'בוטל', 'Open', 'Closed', 'Cancelled'].includes(cellText)) {
        return cells[i];
      }
    }
    return cells[1]; // ברירת מחדל - עמודה שנייה
  }

  findTypeCell(cells) {
    // מחפש תא סוג - בדרך כלל עמודה שלישית
    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i].textContent.trim();
      if (['מניה', 'מניות', 'ETF', 'קריפטו', 'Stock', 'Crypto'].includes(cellText)) {
        return cells[i];
      }
    }
    return cells[2]; // ברירת מחדל - עמודה שלישית
  }

  findAccountCell(cells) {
    // מחפש תא חשבון - בדרך כלל עמודה רביעית
    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i].textContent.trim();
      if (cellText.includes('חשבון') || cellText.includes('Account')) {
        return cells[i];
      }
    }
    return cells[3]; // ברירת מחדל - עמודה רביעית
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
    this.updateStatusFilterText();
    this.updateTypeFilterText();
    this.updateAccountFilterText();
    this.updateDateRangeFilterText();
  }

  updateTypeFilterText() {
    console.log('🔍 updateTypeFilterText called');
    const menu = document.getElementById('typeFilterMenu');
    const toggle = document.querySelector('.type-filter-toggle');

    if (!menu || !toggle) {
      console.log('🔍 Type menu or toggle not found');
      return;
    }

    const selectedItems = menu.querySelectorAll('.type-filter-item.selected');
    const selectedText = toggle.querySelector('.selected-type-text');

    if (selectedItems.length === 0) {
      selectedText.textContent = 'כל סוג';
      console.log('🔍 Updated type text to: כל סוג');
    } else if (selectedItems.length === 1) {
      const optionText = selectedItems[0].querySelector('.option-text');
      const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
      selectedText.textContent = textContent;
      console.log('🔍 Updated type text to:', textContent);
    } else {
      selectedText.textContent = `${selectedItems.length} סוגים`;
      console.log('🔍 Updated type text to:', selectedItems.length, 'סוגים');
    }
  }

  updateAccountFilterText() {
    console.log('🔍 updateAccountFilterText called');
    const menu = document.getElementById('accountFilterMenu');
    const toggle = document.querySelector('.account-filter-toggle');

    if (!menu || !toggle) {
      console.log('🔍 Account menu or toggle not found');
      return;
    }

    const selectedItems = menu.querySelectorAll('.account-filter-item.selected');
    const selectedText = toggle.querySelector('.selected-account-text');

    if (selectedItems.length === 0) {
      selectedText.textContent = 'כל חשבון';
      console.log('🔍 Updated account text to: כל חשבון');
    } else if (selectedItems.length === 1) {
      const optionText = selectedItems[0].querySelector('.option-text');
      const textContent = optionText ? optionText.textContent : selectedItems[0].textContent;
      selectedText.textContent = textContent;
      console.log('🔍 Updated account text to:', textContent);
    } else {
      selectedText.textContent = `${selectedItems.length} חשבונות`;
      console.log('🔍 Updated account text to:', selectedItems.length, 'חשבונות');
    }
  }

  updateDateRangeFilterText() {
    console.log('🔍 updateDateRangeFilterText called');
    const menu = document.getElementById('dateRangeFilterMenu');
    const toggle = document.querySelector('.date-range-filter-toggle');

    if (!menu || !toggle) {
      console.log('🔍 Date range menu or toggle not found');
      return;
    }

    const selectedItem = menu.querySelector('.date-range-filter-item.selected');
    const selectedText = toggle.querySelector('.selected-date-range-text');

    if (!selectedItem) {
      selectedText.textContent = 'כל זמן';
      console.log('🔍 Updated date range text to: כל זמן');
    } else {
      const optionText = selectedItem.querySelector('.option-text');
      const textContent = optionText ? optionText.textContent : selectedItem.textContent;
      selectedText.textContent = textContent;
      console.log('🔍 Updated date range text to:', textContent);
    }
  }
}

// יצירת instance גלובלי
window.headerSystem = new HeaderSystem();

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', () => {
  window.headerSystem.init();
});
