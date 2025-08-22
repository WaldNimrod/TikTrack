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

class HeaderSystem {
  constructor() {
    this.isFilterCollapsed = false;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    console.log('🏠 HeaderSystem initializing...');

    // המתן לטעינת DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('🏠 HeaderSystem initialized');
    this.createHeader();
    this.setupEventListeners();
    this.loadSavedState();
    this.loadAccountsForFilter();
    this.initialized = true;
  }

  createHeader() {
    // יצירת אלמנט ראש הדף החדש עם סגנונות מ-app-header
    const headerElement = document.createElement('div');
    headerElement.id = 'unified-header';
    headerElement.className = 'unified-header';
    headerElement.innerHTML = this.getHeaderHTML();

    // הוספת סגנונות מ-app-header
    const styleElement = document.createElement('style');
    styleElement.textContent = this.getHeaderStyles();
    document.head.appendChild(styleElement);

    // הוספה לתחילת הדף
    document.body.insertBefore(headerElement, document.body.firstChild);

    console.log('🏠 New unified header created and inserted with app-header styles');
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
                <button class="filter-toggle" id="statusFilterToggle">
                  <span class="filter-label">סטטוס</span>
                  <span class="selected-value" id="selectedStatus">כל הסטטוסים</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="statusFilterMenu">
                  <div class="filter-item" data-value="פתוח">
                    <span class="option-text">פתוח</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="סגור">
                    <span class="option-text">סגור</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="בוטל">
                    <span class="option-text">בוטל</span>
                    <span class="check-mark">●</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר סוג -->
            <div class="filter-group type-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle" id="typeFilterToggle">
                  <span class="filter-label">סוג</span>
                  <span class="selected-value" id="selectedType">כל הסוגים</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="typeFilterMenu">
                  <div class="filter-item" data-value="מניות">
                    <span class="option-text">מניות</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="ETF">
                    <span class="option-text">ETF</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="קריפטו">
                    <span class="option-text">קריפטו</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="סחורות">
                    <span class="option-text">סחורות</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="פורקס">
                    <span class="option-text">פורקס</span>
                    <span class="check-mark">●</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חשבון -->
            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle" id="accountFilterToggle">
                  <span class="filter-label">חשבון</span>
                  <span class="selected-value" id="selectedAccount">כל החשבונות</span>
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
                <button class="filter-toggle" id="dateRangeFilterToggle">
                  <span class="filter-label">תאריכים</span>
                  <span class="selected-value" id="selectedDateRange">כל זמן</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="dateRangeFilterMenu">
                  <div class="filter-item" data-value="היום">
                    <span class="option-text">היום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="אתמול">
                    <span class="option-text">אתמול</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="השבוע">
                    <span class="option-text">השבוע</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="שבוע אחרון">
                    <span class="option-text">שבוע אחרון</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="חודש אחרון">
                    <span class="option-text">חודש אחרון</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="3 חודשים">
                    <span class="option-text">3 חודשים</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="MTD">
                    <span class="option-text">MTD</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="YTD">
                    <span class="option-text">YTD</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="30 יום">
                    <span class="option-text">30 יום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="60 יום">
                    <span class="option-text">60 יום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="90 יום">
                    <span class="option-text">90 יום</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="שנה">
                    <span class="option-text">שנה</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="שנה קודמת">
                    <span class="option-text">שנה קודמת</span>
                    <span class="check-mark">●</span>
                  </div>
                  <div class="filter-item" data-value="כל זמן">
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
        window.filterSystem.resetFilters();
        this.updateFilterTexts();
      }
    });

    // כפתור נקה חיפוש
    document.addEventListener('click', (e) => {
      if (e.target.closest('#searchClearBtn')) {
        document.getElementById('searchFilterInput').value = '';
        window.filterSystem.updateFilter('search', '');
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

  updateFilterTexts() {
    const filters = window.filterSystem.getCurrentFilters();

    // עדכון טקסט פילטר תאריכים
    const dateRangeElement = document.getElementById('selectedDateRange');
    if (dateRangeElement) {
      dateRangeElement.textContent = filters.dateRange || 'כל זמן';
    }

    // עדכון טקסט פילטר סטטוס
    const statusElement = document.getElementById('selectedStatus');
    if (statusElement) {
      if (filters.status.length === 0) {
        statusElement.textContent = 'כל הסטטוסים';
      } else if (filters.status.length === 1) {
        statusElement.textContent = filters.status[0];
      } else {
        statusElement.textContent = `${filters.status.length} סטטוסים`;
      }
    }

    // עדכון טקסט פילטר סוג
    const typeElement = document.getElementById('selectedType');
    if (typeElement) {
      if (filters.type.length === 0) {
        typeElement.textContent = 'כל הסוגים';
      } else if (filters.type.length === 1) {
        typeElement.textContent = filters.type[0];
      } else {
        typeElement.textContent = `${filters.type.length} סוגים`;
      }
    }

    // עדכון טקסט פילטר חשבון
    const accountElement = document.getElementById('selectedAccount');
    if (accountElement) {
      if (filters.account.length === 0) {
        accountElement.textContent = 'כל החשבונות';
      } else if (filters.account.length === 1) {
        accountElement.textContent = filters.account[0];
      } else {
        accountElement.textContent = `${filters.account.length} חשבונות`;
      }
    }
  }

  updatePageTitle(title) {
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
      titleElement.textContent = title;
    }
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

  updateFilterTexts() {
    const filters = window.filterSystem.getCurrentFilters();

    // עדכון טקסט פילטר תאריכים
    const dateRangeElement = document.getElementById('selectedDateRange');
    if (dateRangeElement) {
      dateRangeElement.textContent = filters.dateRange || 'כל זמן';
    }

    // עדכון טקסט פילטר סטטוס
    const statusElement = document.getElementById('selectedStatus');
    if (statusElement) {
      if (filters.status.length === 0) {
        statusElement.textContent = 'כל הסטטוסים';
      } else if (filters.status.length === 1) {
        statusElement.textContent = filters.status[0];
      } else {
        statusElement.textContent = `${filters.status.length} סטטוסים`;
      }
    }

    // עדכון טקסט פילטר סוג
    const typeElement = document.getElementById('selectedType');
    if (typeElement) {
      if (filters.type.length === 0) {
        typeElement.textContent = 'כל הסוגים';
      } else if (filters.type.length === 1) {
        typeElement.textContent = filters.type[0];
      } else {
        typeElement.textContent = `${filters.type.length} סוגים`;
      }
    }

    // עדכון טקסט פילטר חשבון
    const accountElement = document.getElementById('selectedAccount');
    if (accountElement) {
      if (filters.account.length === 0) {
        accountElement.textContent = 'כל החשבונות';
      } else if (filters.account.length === 1) {
        accountElement.textContent = filters.account[0];
      } else {
        accountElement.textContent = `${filters.account.length} חשבונות`;
      }
    }
  }

  updatePageTitle(title) {
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
      titleElement.textContent = title;
    }
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

    // Event listeners לפריטי פילטר סוג
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

    this.isFilterCollapsed = !this.isFilterCollapsed;

    if (this.isFilterCollapsed) {
      filtersElement.style.display = 'none';
      arrow.textContent = '▲';
      toggleBtn.classList.add('collapsed');
    } else {
      filtersElement.style.display = 'block';
      arrow.textContent = '▼';
      toggleBtn.classList.remove('collapsed');
    }

    this.saveState();
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
  if (window.headerSystem && !window.headerSystem.initialized) {
    window.headerSystem.initialize();
  }
});
