/**
 * ========================================
 * Web Component - AppHeader (חדש)
 * ========================================
 * 
 * קומפוננט כותרת האתר החדש עם מערכת פילטרים חכמה
 * 
 * תכונות עיקריות:
 * - ניווט בין דפים
 * - מערכת פילטרים חכמה ומאוחדת
 * - שמירת מצב פילטרים ב-localStorage
 * - התאמה אוטומטית לכל טבלה
 * - עיצוב אחיד בכל העמודים
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// Web Component עבור כותרת האתר החדש
class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    console.log('AppHeader (חדש) connectedCallback called');
    this.render();
    this.initializeSystems();
    console.log('AppHeader (חדש) initialization completed');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
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
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-icon {
          font-size: 2rem;
          color: var(--apple-accent);
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--apple-text-primary);
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
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--apple-bg);
          border: 1px solid var(--apple-border-light);
          border-radius: 8px;
          color: var(--apple-text-primary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-toggle-btn:hover {
          background: var(--apple-bg-secondary);
          border-color: var(--apple-border);
        }

        .filter-toggle-btn.collapsed .filter-arrow {
          transform: rotate(-90deg);
        }

        .filter-arrow {
          transition: transform 0.2s ease;
        }

        /* Navigation */
        .header-nav {
          padding: 0 2rem;
        }

        .main-nav {
          display: flex;
          align-items: center;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2rem;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--apple-text-secondary);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-link:hover {
          color: var(--apple-text-primary);
          background: var(--apple-bg-secondary);
        }

        .nav-item.active .nav-link {
          color: var(--apple-accent);
          background: var(--apple-accent-bg);
        }

        /* Dropdowns */
        .dropdown {
          position: relative;
        }

        .dropdown-toggle {
          cursor: pointer;
        }

        .dropdown-arrow {
          font-size: 0.8rem;
          transition: transform 0.2s ease;
        }

        .dropdown-toggle:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--apple-bg-elevated);
          border: 1px solid var(--apple-border-light);
          border-radius: 8px;
          box-shadow: var(--apple-shadow-medium);
          min-width: 200px;
          z-index: 1001;
          display: none;
          padding: 0.5rem 0;
        }

        .dropdown-menu.show {
          display: block;
        }

        .dropdown-item {
          display: block;
          padding: 0.5rem 1rem;
          color: var(--apple-text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: var(--apple-bg-secondary);
          color: var(--apple-text-primary);
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
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          position: relative;
        }

        /* Search Filter */
        .search-filter {
          flex: 1;
          min-width: 200px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-filter-input {
          width: 100%;
          padding: 0.5rem 2rem 0.5rem 1rem;
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
          right: 0.5rem;
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
      </style>

      <div class="unified-header">
        <!-- Header Top -->
        <div class="header-top">
          <div class="logo-section">
            <div class="logo">
              <span class="logo-icon">📊</span>
              <span class="logo-text">פשוט לנהל תיק</span>
            </div>
          </div>
          
          <div class="page-title">
            <h1 id="pageTitle">TikTrack</h1>
          </div>
          
          <div class="filter-toggle-section">
            <button id="filterToggleBtn" class="filter-toggle-btn">
              <span>פילטרים</span>
              <span class="filter-arrow">▼</span>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="header-nav">
          <nav class="main-nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a href="/" class="nav-link" data-page="home">
                  <span class="nav-icon">🏡</span>
                  <span class="nav-text">בית</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="/planning" class="nav-link" data-page="planning">
                  <span class="nav-text">תכנון</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="/trades" class="nav-link" data-page="trades">
                  <span class="nav-text">מעקב</span>
                </a>
              </li>
              
              <li class="nav-item">
                <a href="/research" class="nav-link" data-page="research">
                  <span class="nav-text">תחקיר</span>
                </a>
              </li>
              
              <li class="nav-item dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-page="settings">
                  <span class="nav-text">הגדרות</span>
                  <span class="dropdown-arrow">▼</span>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/accounts">חשבונות</a></li>
                  <li><a class="dropdown-item" href="/notes">הערות</a></li>
                  <li><a class="dropdown-item" href="/alerts">ניהול התראות</a></li>
                  <li><a class="dropdown-item" href="/preferences">העדפות</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="/database">בסיס נתונים</a></li>
                  <li><a class="dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                  <li><a class="dropdown-item" href="/currencies">מטבעות</a></li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Filters -->
        <div id="headerFilters" class="header-filters">
          <div class="filters-container">
            <!-- Search Filter -->
            <div class="filter-group search-filter">
              <div class="search-input-wrapper">
                <input type="text" id="searchFilterInput" class="search-filter-input" placeholder="חיפוש...">
                <button id="searchClearBtn" class="search-clear-btn">✕</button>
              </div>
            </div>

            <!-- Date Range Filter -->
            <div class="filter-group filter-dropdown">
              <button id="dateRangeFilterToggle" class="filter-toggle">
                <span class="filter-label">תאריכים</span>
                <span id="selectedDateRange" class="selected-value">כל זמן</span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <div id="dateRangeFilterMenu" class="filter-menu">
                <div class="filter-item" data-range="today">היום</div>
                <div class="filter-item" data-range="yesterday">אתמול</div>
                <div class="filter-item" data-range="last_week">שבוע אחרון</div>
                <div class="filter-item" data-range="last_month">חודש אחרון</div>
                <div class="filter-item" data-range="last_3_months">3 חודשים</div>
                <div class="filter-item" data-range="all">כל זמן</div>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="filter-group filter-dropdown">
              <button id="statusFilterToggle" class="filter-toggle">
                <span class="filter-label">סטטוס</span>
                <span id="selectedStatus" class="selected-value">כל הסטטוסים</span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <div id="statusFilterMenu" class="filter-menu">
                <!-- Will be populated dynamically -->
              </div>
            </div>

            <!-- Type Filter -->
            <div class="filter-group filter-dropdown">
              <button id="typeFilterToggle" class="filter-toggle">
                <span class="filter-label">סוג</span>
                <span id="selectedType" class="selected-value">כל הסוגים</span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <div id="typeFilterMenu" class="filter-menu">
                <!-- Will be populated dynamically -->
              </div>
            </div>

            <!-- Account Filter -->
            <div class="filter-group filter-dropdown">
              <button id="accountFilterToggle" class="filter-toggle">
                <span class="filter-label">חשבון</span>
                <span id="selectedAccount" class="selected-value">כל החשבונות</span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <div id="accountFilterMenu" class="filter-menu">
                <!-- Will be populated dynamically -->
              </div>
            </div>

            <!-- Reset Button -->
            <div class="filter-group reset-filter">
              <button id="resetFiltersBtn" class="reset-btn" title="איפוס פילטרים">
                <span class="reset-icon">🔄</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initializeSystems() {
    // בדיקה עם המתנה קצרה למערכות החדשות
    setTimeout(() => {
      if (typeof window.headerSystem !== 'undefined') {
        console.log('🏠 HeaderSystem found, initializing...');
        window.headerSystem.initialize();
      } else {
        console.warn('⚠️ HeaderSystem not loaded yet');
      }

      if (typeof window.filterSystem !== 'undefined') {
        console.log('🔧 FilterSystem found, initializing...');
        window.filterSystem.initialize();
      } else {
        console.warn('⚠️ FilterSystem not loaded yet');
      }
    }, 100);

    // הגדרת כותרת הדף
    const currentPath = window.location.pathname;
    const pageTitles = {
      '/': 'בית',
      '/planning': 'תכנון',
      '/trades': 'מעקב',
      '/research': 'תחקיר',
      '/accounts': 'חשבונות',
      '/notes': 'הערות',
      '/alerts': 'התראות',
      '/preferences': 'העדפות',
      '/database': 'בסיס נתונים',
      '/cash_flows': 'תזרימי מזומנים',
      '/currencies': 'מטבעות'
    };

    const pageTitle = pageTitles[currentPath] || 'TikTrack';
    window.headerSystem.updatePageTitle(pageTitle);

    // טעינת חשבונות אם נדרש
    this.loadAccountsIfNeeded();
  }

  loadAccountsIfNeeded() {
    const currentPage = window.location.pathname;
    const pagesNeedingAccounts = ['/planning', '/trades', '/database', '/notes'];

    if (pagesNeedingAccounts.some(page => currentPage.includes(page))) {
      console.log('🔄 Loading accounts for current page...');

      // נסה לטעון חשבונות מהמערכת החדשה
      if (typeof window.loadAllAccountsFromServer === 'function') {
        window.loadAllAccountsFromServer().then((accounts) => {
          if (accounts && accounts.length > 0) {
            window.filterSystem.updateAccountOptions(accounts);
          }
        }).catch((error) => {
          console.log('🔄 Error loading accounts:', error);
        });
      }
    }
  }
}

// רישום הקומפוננט
customElements.define('app-header', AppHeader);



