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
      return;
    }

    // יצירת אלמנט הכותרת
    this.createHeader();

    // אתחול מערכת הפילטרים
    this.initFilterSystem();

    // טעינת חשבונות לפילטר
    this.loadAccountsForFilter();

    // הגדרת event listeners
    this.setupEventListeners();

    this.isInitialized = true;
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
  }

  initFilterSystem() {
    // שימוש במערכת הפילטרים הקיימת
    if (window.simpleFilter) {
      this.filterSystem = window.simpleFilter;
    }
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
                        <li><a class="tiktrack-dropdown-item" href="/constraints">אילוצים</a></li>

                        <li class="dropdown-submenu">
                          <a class="tiktrack-dropdown-item" href="/tests">בדיקות</a>
                          <ul class="submenu">
                            <li><a class="tiktrack-dropdown-item" href="/tests#settings">הגדרות בדיקות</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/tests#crud">בדיקות CRUD</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/tests#server">בדיקות שרת</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/tests#results">תוצאות בדיקות</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/tests#crud-results">תוצאות CRUD</a></li>
                            <li><a class="tiktrack-dropdown-item" href="/test-header-only">בדיקת כותרת</a></li>
                          </ul>
                        </li>
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
                  <div class="status-filter-item" data-value="הכול" onclick="selectStatusOption('הכול')">
                    <span class="option-text">הכול</span>
                    <span class="check-mark">●</span>
                  </div>
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
                  <div class="type-filter-item" data-value="הכול" onclick="selectTypeOption('הכול')">
                    <span class="option-text">הכול</span>
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
    // משתנים לטיימרים
    this.menuTimers = {};

    // Event listeners for dropdown menus
    document.addEventListener('click', (e) => {
      const dropdownToggle = e.target.closest('.tiktrack-dropdown-toggle');
      if (dropdownToggle) {
        const dropdownMenu = dropdownToggle.nextElementSibling;
        if (dropdownMenu && dropdownMenu.classList.contains('tiktrack-dropdown-menu')) {
          this.toggleDropdown(dropdownMenu);
        }
      }
    });

    // Event listeners for submenu
    document.addEventListener('mouseenter', (e) => {
      if (e.target && typeof e.target.closest === 'function') {
        const submenuItem = e.target.closest('.dropdown-submenu');
        if (submenuItem) {
          this.showSubmenu(submenuItem);
        }
      }
    });

    document.addEventListener('mouseleave', (e) => {
      if (e.target && typeof e.target.closest === 'function') {
        const submenuItem = e.target.closest('.dropdown-submenu');
        if (submenuItem) {
          this.hideSubmenu(submenuItem);
        }
      }
    });

    // Handle submenu item clicks
    document.addEventListener('click', (e) => {
      if (e.target && typeof e.target.closest === 'function') {
        const submenuItem = e.target.closest('.submenu .tiktrack-dropdown-item');
        if (submenuItem) {
          const href = submenuItem.getAttribute('href');
          if (href) {
            this.handleSubmenuNavigation(href);
          }
        }
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target && typeof e.target.closest === 'function') {
        if (!e.target.closest('.tiktrack-dropdown-toggle') && !e.target.closest('.tiktrack-dropdown-menu')) {
          this.closeAllDropdowns();
        }
      }
    });

    // סגירת תפריטים בלחיצה מחוץ לאזור התפריט
    document.addEventListener('click', (e) => {
      // בדיקה אם הלחיצה הייתה מחוץ לכל תפריטי הפילטרים והתפריט הראשי
      const isClickInsideMenu = e.target.closest('.filter-menu') ||
        e.target.closest('.filter-toggle') ||
        e.target.closest('#searchFilterInput') ||
        e.target.closest('#searchClearBtn') ||
        e.target.closest('.tiktrack-dropdown-menu') ||
        e.target.closest('.tiktrack-dropdown-toggle') ||
        e.target.closest('.submenu');

      if (!isClickInsideMenu) {
        // סגירת כל התפריטים
        this.closeAllMenus();
      }
    });

    // כפתור הצג/הסתר פילטרים
    document.addEventListener('click', (e) => {
      if (e.target.closest('#filterToggleBtn')) {
        this.toggleFiltersNew();
        // סגירת התפריט הראשי כשפותחים פילטרים
        this.closeMainMenu();
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

  showSubmenu(submenuItem) {
    const submenu = submenuItem.querySelector('.submenu');
    if (submenu) {
      submenu.style.display = 'block';
      submenu.classList.add('show');
    }
  }

  hideSubmenu(submenuItem) {
    const submenu = submenuItem.querySelector('.submenu');
    if (submenu) {
      submenu.style.display = 'none';
      submenu.classList.remove('show');
    }
  }

  toggleDropdown(dropdownMenu) {
    const isVisible = dropdownMenu.classList.contains('show');

    if (isVisible) {
      dropdownMenu.classList.remove('show');
      // ניקוי טיימר
      if (this.menuTimers && this.menuTimers['dropdown']) {
        clearTimeout(this.menuTimers['dropdown']);
        delete this.menuTimers['dropdown'];
      }
    } else {
      dropdownMenu.classList.add('show');
      // הפעלת טיימר לסגירה אוטומטית
      this.startMenuTimer('dropdown', 3000);
    }
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.tiktrack-dropdown-menu.show');
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('show');
    });

    const submenus = document.querySelectorAll('.submenu.show');
    submenus.forEach(submenu => {
      submenu.classList.remove('show');
      submenu.style.display = 'none';
    });

    // ניקוי טיימר דרופדאון
    if (this.menuTimers && this.menuTimers['dropdown']) {
      clearTimeout(this.menuTimers['dropdown']);
      delete this.menuTimers['dropdown'];
    }
  }

  // פונקציה לסגירת כל התפריטים
  closeAllMenus() {
    // סגירת התפריט הראשי
    this.closeMainMenu();

    // סגירת תפריטי הפילטרים
    this.closeAllFilterMenus();
  }

  // פונקציה לניקוי כל הטיימרים
  clearAllMenuTimers() {
    Object.keys(this.menuTimers).forEach(timerId => {
      clearTimeout(this.menuTimers[timerId]);
      delete this.menuTimers[timerId];
    });
  }

  // פונקציה להפעלת טיימר לסגירה אוטומטית
  startMenuTimer(menuType, duration = 3000) {
    // ניקוי טיימר קיים אם יש
    if (this.menuTimers[menuType]) {
      clearTimeout(this.menuTimers[menuType]);
    }

    // הפעלת טיימר חדש
    this.menuTimers[menuType] = setTimeout(() => {
      console.log(`🔍 Auto-closing menu: ${menuType}`);
      switch (menuType) {
        case 'status':
          window.closeStatusFilter();
          break;
        case 'type':
          window.closeTypeFilter();
          break;
        case 'account':
          window.closeAccountFilter();
          break;
        case 'dateRange':
          window.closeDateRangeFilter();
          break;
        case 'dropdown':
          this.closeAllDropdowns();
          break;
      }
      delete this.menuTimers[menuType];
    }, duration);
  }

  // פונקציה לסגירת כל תפריטי הפילטרים
  closeAllFilterMenus() {
    // סגירת כל הפילטרים
    window.closeStatusFilter();
    window.closeTypeFilter();
    window.closeAccountFilter();
    window.closeDateRangeFilter();

    // ניקוי טיימרים של כל תפריטי הפילטרים
    const filterMenus = ['statusFilterMenu', 'typeFilterMenu', 'accountFilterMenu', 'dateRangeFilterMenu'];
    filterMenus.forEach(menuId => {
      const menu = document.getElementById(menuId);
      if (menu) {
        clearFilterMenuTimers(menu);
      }
    });

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
    const navItems = document.querySelectorAll('#unified-header .tiktrack-nav-item');
    const dropdownItems = document.querySelectorAll('#unified-header .tiktrack-dropdown-item');

    console.log('🔍 setActiveMenuItem - currentPath:', currentPath);
    console.log('🔍 setActiveMenuItem - navItems found:', navItems.length);
    console.log('🔍 setActiveMenuItem - dropdownItems found:', dropdownItems.length);

    // בדיקה נוספת - הדפסת כל הכפתורים שנמצאו
    navItems.forEach((item, index) => {
      const link = item.querySelector('.tiktrack-nav-link');
      const href = link ? link.getAttribute('href') : 'no href';
      console.log(`🔍 Nav item ${index}:`, item.className, 'href:', href);
    });

    // איפוס כל הפריטים
    navItems.forEach(item => item.classList.remove('active'));
    dropdownItems.forEach(item => item.classList.remove('active'));

    // סימון הפריט הפעיל בתפריט הראשי
    navItems.forEach(item => {
      const link = item.querySelector('.tiktrack-nav-link');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentPath.includes(href)) {
          item.classList.add('active');
          console.log('✅ Added active to nav item:', href);
          console.log('✅ Item classes after adding active:', item.className);
        }
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
          parentDropdown.classList.add('active');
          console.log('✅ Added active to parent nav item for dropdown item:', href);
        }
      }
    });

    // סימון מיוחד לעמוד הבית
    if (currentPath === '/' || currentPath === '/index.html') {
      const homeItem = document.querySelector('#unified-header .tiktrack-nav-item[data-page="home"]');
      if (homeItem) {
        homeItem.classList.add('active');
        console.log('✅ Added active to home item');
      }
    }

    // בדיקה סופית - כמה פריטים פעילים יש
    const activeItems = document.querySelectorAll('#unified-header .tiktrack-nav-item.active');
    console.log('🔍 Final check - active items found:', activeItems.length);
    activeItems.forEach((item, index) => {
      const link = item.querySelector('.tiktrack-nav-link');
      const href = link ? link.getAttribute('href') : 'no href';
      console.log(`🔍 Active item ${index}:`, item.className, 'href:', href);
    });
  }

  // הוספת event listeners לכפתורי הניווט (מתוך header-system.js)
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

  // הוספת event listeners לתפריט הנפתח (מתוך header-system.js)
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

    // הוספת אופציית "הכול"
    const allItem = document.createElement('div');
    allItem.className = 'account-filter-item';
    allItem.setAttribute('data-value', 'הכול');
    allItem.innerHTML = `
      <span class="option-text">הכול</span>
      <span class="check-mark">●</span>
    `;

    // הוספת event listener לאופציית "הכול"
    allItem.addEventListener('click', (e) => {
      e.stopPropagation();

      // הסרת בחירה מכל הפריטים
      accountMenu.querySelectorAll('.account-filter-item').forEach(item => {
        item.classList.remove('selected');
      });

      // בחירת "הכול"
      allItem.classList.add('selected');

      // עדכון הפילטר
      if (window.headerSystem && window.headerSystem.updateAccountFilterDisplayText) {
        window.headerSystem.updateAccountFilterDisplayText();
      } else {
        updateAccountFilterDisplayText();
      }
    });

    accountMenu.appendChild(allItem);

    // הוספת החשבונות
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

        // הסרת בחירה מ"הכול"
        const allItem = accountMenu.querySelector('[data-value="הכול"]');
        if (allItem) {
          allItem.classList.remove('selected');
        }

        item.classList.toggle('selected');

        // עדכון הפילטר
        if (window.headerSystem && window.headerSystem.updateAccountFilterDisplayText) {
          window.headerSystem.updateAccountFilterDisplayText();
        } else {
          updateAccountFilterDisplayText();
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
              this.clearMenuTimers(otherMenu);
            }
          }
        });

        // פתיחה/סגירה של הדרופדאון הנוכחי
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains('tiktrack-dropdown-menu')) {
          const isVisible = menu.classList.contains('show');

          if (isVisible) {
            menu.classList.remove('show');
            this.clearMenuTimers(menu);
          } else {
            menu.classList.add('show');
            this.setupMenuAutoClose(menu);
          }
        }
      });
    });

    // סגירת דרופדאונים בלחיצה מחוץ
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tiktrack-nav-item.dropdown')) {
        const navMenus = document.querySelectorAll('.tiktrack-nav-item.dropdown .tiktrack-dropdown-menu');
        navMenus.forEach(menu => {
          menu.classList.remove('show');
          this.clearMenuTimers(menu);
        });
      }
    });
  }

  setupMenuAutoClose(menu) {
    // ניקוי טיימרים קודמים
    this.clearMenuTimers(menu);

    // טיימר לסגירה אוטומטית אחרי 10 שניות
    const autoCloseTimer = setTimeout(() => {
      menu.classList.remove('show');
      this.clearMenuTimers(menu);
    }, 10000);

    // טיימר לסגירה אחרי יציאת העכבר
    let mouseLeaveTimer = null;

    const handleMouseEnter = () => {
      if (mouseLeaveTimer) {
        clearTimeout(mouseLeaveTimer);
        mouseLeaveTimer = null;
      }
    };

    const handleMouseLeave = () => {
      mouseLeaveTimer = setTimeout(() => {
        menu.classList.remove('show');
        this.clearMenuTimers(menu);
      }, 5000);
    };

    // הוספת event listeners
    menu.addEventListener('mouseenter', handleMouseEnter);
    menu.addEventListener('mouseleave', handleMouseLeave);

    // שמירת הטיימרים לאלמנט
    menu._autoCloseTimer = autoCloseTimer;
    menu._mouseLeaveTimer = mouseLeaveTimer;
    menu._handleMouseEnter = handleMouseEnter;
    menu._handleMouseLeave = handleMouseLeave;
  }

  clearMenuTimers(menu) {
    if (menu._autoCloseTimer) {
      clearTimeout(menu._autoCloseTimer);
      menu._autoCloseTimer = null;
    }

    if (menu._mouseLeaveTimer) {
      clearTimeout(menu._mouseLeaveTimer);
      menu._mouseLeaveTimer = null;
    }

    // הסרת event listeners
    if (menu._handleMouseEnter) {
      menu.removeEventListener('mouseenter', menu._handleMouseEnter);
      menu._handleMouseEnter = null;
    }

    if (menu._handleMouseLeave) {
      menu.removeEventListener('mouseleave', menu._handleMouseLeave);
      menu._handleMouseLeave = null;
    }
  }

  // פונקציה לטעינת חשבונות לפילטר
  loadAccountsForFilter() {
    // טעינת חשבונות לפילטר חשבונות
    fetch('/api/v1/accounts/')
      .then(response => response.json())
      .then(data => {
        console.log('🏦 Accounts loaded for filter:', data);

        if (data.status === 'success' && data.data) {
          // עדכון תפריט החשבונות
          this.updateAccountFilterMenu(data.data);
        } else {
          console.error('❌ Error loading accounts: Invalid response format');
        }
      })
      .catch(error => {
        console.error('❌ Error loading accounts for filter:', error);
      });
  }

  updateAccountFilterMenu(accounts) {
    const headerElement = document.getElementById('unified-header');
    if (!headerElement) return;

    const accountMenu = headerElement.querySelector('#accountFilterMenu');
    if (!accountMenu) return;

    // ניקוי התפריט
    accountMenu.innerHTML = '';

    // הוספת אופציית "הכול"
    const allOption = document.createElement('div');
    allOption.className = 'account-filter-item';
    allOption.textContent = 'הכול';
    allOption.onclick = () => this.selectAccountFilter('הכול');
    accountMenu.appendChild(allOption);

    // הוספת חשבונות
    accounts.forEach(account => {
      const accountOption = document.createElement('div');
      accountOption.className = 'account-filter-item';
      accountOption.textContent = account.name;
      accountOption.onclick = () => this.selectAccountFilter(account.name);
      accountMenu.appendChild(accountOption);
    });
  }

  selectAccountFilter(accountName) {
    console.log('🏦 Account filter selected:', accountName);

    // עדכון תצוגה
    const selectedElement = document.getElementById('selectedAccount');
    if (selectedElement) {
      selectedElement.textContent = accountName;
    }

    // הפעלת פילטר
    if (window.filterSystem) {
      window.filterSystem.updateFilter('account', accountName === 'הכול' ? [] : [accountName]);
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

  // פונקציה לניקוי כל הפילטרים (הצגת כל הרשומות)
  clearAllFilters() {
    console.log('🔍 Clearing all filters (showing all records)');

    // איפוס כל הפילטרים
    this.currentFilters = {
      status: [],
      type: [],
      account: [],
      dateRange: '',
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

    // טעינת חשבונות מחדש
    if (typeof window.loadAccountsFromServer === 'function') {
      window.loadAccountsFromServer().then(accounts => {
        if (accounts && accounts.length > 0) {
          this.updateAccountFilter(accounts);
        }
      });
    }

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

  // פונקציה לטעינת העדפות המשתמש
  loadUserPreferences() {
    try {
      // ניסיון לטעון מ-localStorage תחילה (מהיר)
      const localPreferences = localStorage.getItem('tiktrack_preferences');
      if (localPreferences) {
        const parsed = JSON.parse(localPreferences);
        if (parsed.user) {
          return {
            defaultStatuses: parsed.user.defaultStatusFilter === 'open' ? ['פתוח'] :
              parsed.user.defaultStatusFilter === 'closed' ? ['סגור'] :
                parsed.user.defaultStatusFilter === 'cancelled' ? ['מבוטל'] : [],
            defaultTypes: parsed.user.defaultTypeFilter === 'swing' ? ['סווינג'] :
              parsed.user.defaultTypeFilter === 'investment' ? ['השקעה'] :
                parsed.user.defaultTypeFilter === 'passive' ? ['פסיבי'] : [],
            defaultAccounts: [],
            defaultDateRange: parsed.user.defaultDateRangeFilter === 'this_week' ? 'השבוע' :
              parsed.user.defaultDateRangeFilter === 'today' ? 'היום' :
                parsed.user.defaultDateRangeFilter === 'this_month' ? 'MTD' : 'כל זמן'
          };
        }
      }

      // אם אין ב-localStorage, ננסה לטעון מהשרת
      const userPreferences = localStorage.getItem('userPreferences');
      if (userPreferences) {
        return JSON.parse(userPreferences);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }

    // החזרת ערכי ברירת מחדל אם אין העדפות
    return {
      defaultStatuses: ['פתוח'],
      defaultTypes: ['סווינג'],
      defaultAccounts: [],
      defaultDateRange: 'כל זמן'
    };
  }

  // פונקציה לעדכון טקסטים
  updateFilterTexts() {
    // קריאה ישירה לפונקציות של המחלקה
    this.updateStatusFilterDisplayText();
    this.updateTypeFilterDisplayText();
    this.updateDateRangeFilterDisplayText();

    // קריאה לפונקציה החיצונית של חשבונות
    if (typeof updateAccountFilterDisplayText === 'function') {
      updateAccountFilterDisplayText();
    } else {
      console.warn('⚠️ updateAccountFilterDisplayText not found');
    }
  }

  // פונקציות לעדכון טקסטי פילטרים
  updateStatusFilterDisplayText() {
    const statusToggle = document.getElementById('statusFilterToggle');
    if (!statusToggle) {
      return;
    }

    const selectedText = statusToggle.querySelector('.selected-status-text');
    if (!selectedText) {
      return;
    }

    // קבלת הסטטוסים הנבחרים
    const selectedStatuses = window.selectedStatusesForFilter || [];

    if (selectedStatuses.length === 0) {
      selectedText.textContent = 'כל הסטטוסים';
    } else if (selectedStatuses.length === 1) {
      selectedText.textContent = selectedStatuses[0];
    } else {
      selectedText.textContent = `${selectedStatuses.length} נבחרו`;
    }
  }

  updateTypeFilterDisplayText() {
    const typeToggle = document.getElementById('typeFilterToggle');
    if (!typeToggle) {
      return;
    }

    const selectedText = typeToggle.querySelector('.selected-type-text');
    if (!selectedText) {
      return;
    }

    // קבלת הטיפוסים הנבחרים
    const selectedTypes = window.selectedTypesForFilter || [];

    if (selectedTypes.length === 0) {
      selectedText.textContent = 'כל הטיפוסים';
    } else if (selectedTypes.length === 1) {
      selectedText.textContent = selectedTypes[0];
    } else {
      selectedText.textContent = `${selectedTypes.length} נבחרו`;
    }
  }

  updateDateRangeFilterDisplayText() {
    const dateToggle = document.getElementById('dateRangeFilterToggle');
    if (!dateToggle) {
      return;
    }

    const selectedText = dateToggle.querySelector('.selected-date-text');
    if (!selectedText) {
      return;
    }

    // קבלת טווח התאריכים הנבחר
    const selectedDateRange = window.selectedDateRangeForFilter || 'כל זמן';

    selectedText.textContent = selectedDateRange;
  }

  handleSubmenuNavigation(href) {
    console.log('🧭 Navigating to:', href);

    // Close all dropdowns
    this.closeAllDropdowns();

    // Handle different navigation types
    if (href.includes('#')) {
      // Handle anchor navigation (e.g., /tests#settings)
      const [path, anchor] = href.split('#');
      if (path === '/tests') {
        // Navigate to tests page and scroll to specific section
        window.location.href = '/tests';

        // Wait for page load and scroll to section
        setTimeout(() => {
          this.scrollToSection(anchor);
        }, 500);
      }
    } else {
      // Regular navigation
      window.location.href = href;
    }
  }

  scrollToSection(sectionId) {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Highlight the section briefly
      section.style.backgroundColor = 'rgba(255, 156, 5, 0.1)';
      setTimeout(() => {
        section.style.backgroundColor = '';
      }, 2000);
    }
  }

  toggleFilterSection() {
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
      filterSection.classList.toggle('collapsed');

      const toggleBtn = document.querySelector('.filter-toggle-btn');
      if (toggleBtn) {
        toggleBtn.classList.toggle('collapsed');
      }
    }
  }

  closeMainMenu() {
    // סגירת כל תפריטי הניווט הראשיים
    const navMenus = document.querySelectorAll('.tiktrack-nav-item.dropdown .tiktrack-dropdown-menu');
    navMenus.forEach(menu => {
      menu.classList.remove('show');
      this.clearMenuTimers(menu);
    });
  }

  // עדכון תפריט פעיל
  updateActiveMenu() {
    const activeLinks = this.querySelectorAll('.nav-link.active');
    const activeDropdownItems = this.querySelectorAll('.dropdown-item.active');

    // הסרת כל הסימונים הפעילים
    this.querySelectorAll('.nav-link, .dropdown-item').forEach(item => {
      item.classList.remove('active');
    });

    // הוספת סימון פעיל לקישורים הפעילים
    activeLinks.forEach(link => {
      link.classList.add('active');
    });

    activeDropdownItems.forEach(item => {
      item.classList.add('active');
    });
  }

  // סגירת תפריטים אוטומטית
  autoCloseMenus() {
    const menus = this.querySelectorAll('.filter-menu');
    menus.forEach(menu => {
      const menuType = menu.id;
      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
      }
    });
  }

  // הגדרת פריט תפריט פעיל
  setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    // הסרת כל הסימונים הפעילים
    navLinks.forEach(link => link.classList.remove('active'));
    dropdownItems.forEach(item => item.classList.remove('active'));

    // מציאת הקישור המתאים לנתיב הנוכחי
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      }
    });

    dropdownItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        item.classList.add('active');

        // הוספת סימון פעיל גם לפריט ההורה
        const parentNav = item.closest('.nav-item');
        if (parentNav) {
          const parentLink = parentNav.querySelector('.nav-link');
          if (parentLink) {
            parentLink.classList.add('active');
          }
        }
      }
    });

    // אם אין קישור פעיל, סמן את הבית
    if (!document.querySelector('.nav-link.active, .dropdown-item.active')) {
      const homeLink = document.querySelector('.nav-link[href="index.html"]');
      if (homeLink) {
        homeLink.classList.add('active');
      }
    }
  }

  // טעינת חשבונות לפילטר
  async loadAccountsForFilter() {
    try {
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      const response = await fetch(`${base}/api/v1/accounts`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        this.updateAccountFilterOptions(data.data);
      }
    } catch (err) {
      console.warn('Failed to load accounts for filter:', err);
    }
  }

  // עדכון אפשרויות פילטר חשבון
  updateAccountFilterOptions(accounts) {
    const accountMenu = document.querySelector('#accountFilterMenu');
    if (!accountMenu) return;

    // ניקוי התפריט הקיים
    accountMenu.innerHTML = '';

    // הוספת אפשרות "כל החשבונות"
    const allOption = document.createElement('div');
    allOption.className = 'account-filter-item';
    allOption.setAttribute('data-account-id', '');
    allOption.innerHTML = '<span class="option-text">כל החשבונות</span>';
    accountMenu.appendChild(allOption);

    // הוספת החשבונות
    accounts.forEach(account => {
      const option = document.createElement('div');
      option.className = 'account-filter-item';
      option.setAttribute('data-account-id', account.id);
      option.innerHTML = `<span class="option-text">${account.name}</span>`;
      accountMenu.appendChild(option);
    });
  }

  // איפוס כל הפילטרים
  resetAllFilters() {
    // איפוס פילטר סטטוס
    document.querySelectorAll('#statusFilterMenu .status-filter-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    // איפוס פילטר סוג
    document.querySelectorAll('#typeFilterMenu .type-filter-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    // איפוס פילטר חשבון
    document.querySelectorAll('#accountFilterMenu .account-filter-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    // איפוס פילטר חיפוש
    const searchInput = document.querySelector('#searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // איפוס פילטר תאריכים
    const dateRangeDisplay = document.querySelector('#dateRangeFilterDisplay');
    if (dateRangeDisplay) {
      dateRangeDisplay.textContent = 'כל זמן';
    }

    // הפעלת הפילטרים המעודכנים
    if (window.filterSystem) {
      window.filterSystem.resetFilters();
    }
  }

  // ניקוי כל הפילטרים
  clearAllFilters() {
    // ניקוי פילטר סטטוס
    document.querySelectorAll('#statusFilterMenu .status-filter-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    // ניקוי פילטר סוג
    document.querySelectorAll('#typeFilterMenu .type-filter-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    // ניקוי פילטר חשבון
    document.querySelectorAll('#accountFilterMenu .account-filter-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    // ניקוי פילטר חיפוש
    const searchInput = document.querySelector('#searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // ניקוי פילטר תאריכים
    const dateRangeDisplay = document.querySelector('#dateRangeFilterDisplay');
    if (dateRangeDisplay) {
      dateRangeDisplay.textContent = 'כל זמן';
    }

    // הפעלת הפילטרים המעודכנים
    if (window.filterSystem) {
      window.filterSystem.resetFilters();
    }
  }

  // ניקוי פילטר חיפוש
  clearSearchFilter() {
    const searchInput = this.querySelector('#searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
    }

    if (window.filterSystem) {
      window.filterSystem.currentFilters.search = '';
      window.filterSystem.applyAllFilters();
    }
  }

  // ניווט לדף
  navigateToPage(href) {
    if (href && href !== '#') {
      window.location.href = href;
    }
  }

  // פונקציות עזר לתפריטים
  toggleDateRangeFilter() {
    const menu = this.querySelector('#dateRangeFilterMenu');
    if (!menu) return;

    menu.classList.toggle('show');

    // סגירת תפריטים אחרים
    this.querySelectorAll('.filter-menu:not(#dateRangeFilterMenu)').forEach(otherMenu => {
      otherMenu.classList.remove('show');
    });
  }

  closeStatusFilter() {
    const menu = this.querySelector('#statusFilterMenu');
    if (menu) {
      menu.classList.remove('show');
    }
  }

  closeTypeFilter() {
    const menu = this.querySelector('#typeFilterMenu');
    if (menu) {
      menu.classList.remove('show');
    }
  }

  closeAccountFilter() {
    const menu = this.querySelector('#accountFilterMenu');
    if (menu) {
      menu.classList.remove('show');
    }
  }

  closeDateRangeFilter() {
    const menu = this.querySelector('#dateRangeFilterMenu');
    if (menu) {
      menu.classList.remove('show');
    }
  }
}

// יצירת instance גלובלי
window.HeaderSystem = HeaderSystem;

// ייצוא פונקציות גלובליות
window.updateStatusFilterDisplayText = function () {
  if (window.headerSystem) {
    window.headerSystem.updateStatusFilterDisplayText();
  }
};

window.updateTypeFilterDisplayText = function () {
  if (window.headerSystem) {
    window.headerSystem.updateTypeFilterDisplayText();
  }
};

window.updateDateRangeFilterDisplayText = function () {
  if (window.headerSystem) {
    window.headerSystem.updateDateRangeFilterDisplayText();
  }
};

// ===== פונקציות toggle לפילטרים =====

/**
 * פתיחה/סגירה של פילטר סטטוס
 */
function toggleStatusFilter() {
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');

    // סגירת תפריטי פילטר אחרים
    closeOtherFilterMenus('statusFilterMenu');

    // סגירת התפריט הראשי
    if (window.headerSystem) {
      window.headerSystem.closeMainMenu();
    }

    if (isVisible) {
      menu.classList.remove('show');
      clearFilterMenuTimers(menu);
    } else {
      menu.classList.add('show');
      setupFilterMenuAutoClose(menu);
    }
  } else {
    console.warn('⚠️ Status filter menu not found');
  }
}

/**
 * פתיחה/סגירה של פילטר טיפוס
 */
function toggleTypeFilter() {
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');

    // סגירת תפריטי פילטר אחרים
    closeOtherFilterMenus('typeFilterMenu');

    // סגירת התפריט הראשי
    if (window.headerSystem) {
      window.headerSystem.closeMainMenu();
    }

    if (isVisible) {
      menu.classList.remove('show');
      clearFilterMenuTimers(menu);
    } else {
      menu.classList.add('show');
      setupFilterMenuAutoClose(menu);
    }
  } else {
    console.warn('⚠️ Type filter menu not found');
  }
}

/**
 * פתיחה/סגירה של פילטר חשבונות
 */
function toggleAccountFilter() {
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');

    // סגירת תפריטי פילטר אחרים
    closeOtherFilterMenus('accountFilterMenu');

    // סגירת התפריט הראשי
    if (window.headerSystem) {
      window.headerSystem.closeMainMenu();
    }

    if (isVisible) {
      menu.classList.remove('show');
      clearFilterMenuTimers(menu);
    } else {
      menu.classList.add('show');
      setupFilterMenuAutoClose(menu);
    }
  } else {
    console.warn('⚠️ Account filter menu not found');
  }
}

/**
 * פתיחה/סגירה של פילטר תאריכים
 */
function toggleDateRangeFilter() {
  console.log('🔄 toggleDateRangeFilter called');
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');

    // סגירת תפריטי פילטר אחרים
    closeOtherFilterMenus('dateRangeFilterMenu');

    // סגירת התפריט הראשי
    if (window.headerSystem) {
      window.headerSystem.closeMainMenu();
    }

    if (isVisible) {
      menu.classList.remove('show');
      clearFilterMenuTimers(menu);
    } else {
      menu.classList.add('show');
      setupFilterMenuAutoClose(menu);
    }

    console.log('🔄 Date range filter menu toggled, show class:', menu.classList.contains('show'));
  } else {
    console.warn('⚠️ Date range filter menu not found');
  }
}

// ייצוא פונקציות toggle לגלובל
window.toggleStatusFilter = toggleStatusFilter;
window.toggleTypeFilter = toggleTypeFilter;
window.toggleAccountFilter = toggleAccountFilter;
window.toggleDateRangeFilter = toggleDateRangeFilter;

// ===== פונקציות סגירה לפילטרים =====

/**
 * סגירת פילטר סטטוס
 */
function closeStatusFilter() {
  console.log('🔄 closeStatusFilter called');
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
    console.log('🔄 Status filter menu closed');
  } else {
    console.warn('⚠️ Status filter menu not found');
  }
}

/**
 * סגירת פילטר טיפוס
 */
function closeTypeFilter() {
  console.log('🔄 closeTypeFilter called');
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
    console.log('🔄 Type filter menu closed');
  } else {
    console.warn('⚠️ Type filter menu not found');
  }
}

/**
 * סגירת פילטר חשבונות
 */
function closeAccountFilter() {
  console.log('🔄 closeAccountFilter called');
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
    console.log('🔄 Account filter menu closed');
  } else {
    console.warn('⚠️ Account filter menu not found');
  }
}

/**
 * סגירת פילטר תאריכים
 */
function closeDateRangeFilter() {
  console.log('🔄 closeDateRangeFilter called');
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
    console.log('🔄 Date range filter menu closed');
  } else {
    console.warn('⚠️ Date range filter menu not found');
  }
}

// ייצוא פונקציות סגירה לגלובל
window.closeStatusFilter = closeStatusFilter;
window.closeTypeFilter = closeTypeFilter;
window.closeAccountFilter = closeAccountFilter;
window.closeDateRangeFilter = closeDateRangeFilter;

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', () => {
  if (window.HeaderSystem) {
    window.headerSystem = new HeaderSystem();
    window.headerSystem.init();
  }
});

// ===== פונקציות עזר לתפריטי פילטרים =====

/**
 * סגירת תפריטי פילטר אחרים
 */
function closeOtherFilterMenus(currentMenuId) {
  const filterMenus = ['statusFilterMenu', 'typeFilterMenu', 'accountFilterMenu', 'dateRangeFilterMenu'];

  filterMenus.forEach(menuId => {
    if (menuId !== currentMenuId) {
      const menu = document.getElementById(menuId);
      if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
        clearFilterMenuTimers(menu);
      }
    }
  });
}

/**
 * הגדרת סגירה אוטומטית לתפריט פילטר
 */
function setupFilterMenuAutoClose(menu) {
  // ניקוי טיימרים קודמים
  clearFilterMenuTimers(menu);

  // טיימר לסגירה אוטומטית אחרי 10 שניות
  const autoCloseTimer = setTimeout(() => {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
  }, 10000);

  // טיימר לסגירה אחרי יציאת העכבר
  let mouseLeaveTimer = null;

  const handleMouseEnter = () => {
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer);
      mouseLeaveTimer = null;
    }
  };

  const handleMouseLeave = () => {
    mouseLeaveTimer = setTimeout(() => {
      menu.classList.remove('show');
      clearFilterMenuTimers(menu);
    }, 5000);
  };

  // הוספת event listeners
  menu.addEventListener('mouseenter', handleMouseEnter);
  menu.addEventListener('mouseleave', handleMouseLeave);

  // שמירת הטיימרים לאלמנט
  menu._filterAutoCloseTimer = autoCloseTimer;
  menu._filterMouseLeaveTimer = mouseLeaveTimer;
  menu._filterHandleMouseEnter = handleMouseEnter;
  menu._filterHandleMouseLeave = handleMouseLeave;
}

/**
 * ניקוי טיימרים של תפריט פילטר
 */
function clearFilterMenuTimers(menu) {
  if (menu._filterAutoCloseTimer) {
    clearTimeout(menu._filterAutoCloseTimer);
    menu._filterAutoCloseTimer = null;
  }

  if (menu._filterMouseLeaveTimer) {
    clearTimeout(menu._filterMouseLeaveTimer);
    menu._filterMouseLeaveTimer = null;
  }

  // הסרת event listeners
  if (menu._filterHandleMouseEnter) {
    menu.removeEventListener('mouseenter', menu._filterHandleMouseEnter);
    menu._filterHandleMouseEnter = null;
  }

  if (menu._filterHandleMouseLeave) {
    menu.removeEventListener('mouseleave', menu._filterHandleMouseLeave);
    menu._filterHandleMouseLeave = null;
  }
}

// ===== פונקציות בחירת אפשרויות פילטר =====

/**
 * בחירת אפשרות פילטר סטטוס
 */
function selectStatusOption(status) {
  console.log('🔄 selectStatusOption called with status:', status);
  
  // עדכון הטקסט הנבחר
  const selectedStatusElement = document.getElementById('selectedStatus');
  if (selectedStatusElement) {
    selectedStatusElement.textContent = status === 'הכול' ? 'כל סטטוס' : status;
  }
  
  // עדכון סימון ויזואלי
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => {
    const itemValue = item.getAttribute('data-value');
    if (itemValue === status) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // סגירת התפריט
  closeStatusFilter();
  
  // הפעלת הפילטר
  applyStatusFilter(status);
}

/**
 * בחירת אפשרות פילטר טיפוס
 */
function selectTypeOption(type) {
  console.log('🔄 selectTypeOption called with type:', type);
  
  // עדכון הטקסט הנבחר
  const selectedTypeElement = document.getElementById('selectedType');
  if (selectedTypeElement) {
    selectedTypeElement.textContent = type === 'הכול' ? 'כל טיפוס' : type;
  }
  
  // עדכון סימון ויזואלי
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => {
    const itemValue = item.getAttribute('data-value');
    if (itemValue === type) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // סגירת התפריט
  closeTypeFilter();
  
  // הפעלת הפילטר
  applyTypeFilter(type);
}

/**
 * בחירת אפשרות פילטר חשבון
 */
function selectAccountOption(account) {
  console.log('🔄 selectAccountOption called with account:', account);
  
  // עדכון הטקסט הנבחר
  const selectedAccountElement = document.getElementById('selectedAccount');
  if (selectedAccountElement) {
    selectedAccountElement.textContent = account === 'הכול' ? 'כל חשבון' : account;
  }
  
  // עדכון סימון ויזואלי
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  accountItems.forEach(item => {
    const itemValue = item.getAttribute('data-value');
    if (itemValue === account) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // סגירת התפריט
  closeAccountFilter();
  
  // הפעלת הפילטר
  applyAccountFilter(account);
}

/**
 * בחירת אפשרות פילטר תאריכים
 */
function selectDateRangeOption(dateRange) {
  console.log('🔄 selectDateRangeOption called with dateRange:', dateRange);
  
  // עדכון הטקסט הנבחר
  const selectedDateRangeElement = document.getElementById('selectedDateRange');
  if (selectedDateRangeElement) {
    selectedDateRangeElement.textContent = dateRange === 'כל זמן' ? 'כל זמן' : dateRange;
  }
  
  // עדכון סימון ויזואלי
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateRangeItems.forEach(item => {
    const itemValue = item.getAttribute('data-value');
    if (itemValue === dateRange) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // סגירת התפריט
  closeDateRangeFilter();
  
  // הפעלת הפילטר
  applyDateRangeFilter(dateRange);
}

// ===== פונקציות הפעלת פילטרים =====

/**
 * הפעלת פילטר סטטוס
 */
function applyStatusFilter(status) {
  console.log('🔄 applyStatusFilter called with status:', status);
  
  // כאן תהיה הלוגיקה של הפעלת הפילטר
  // כרגע רק לוג - יש להוסיף את הלוגיקה האמיתית בהמשך
  if (window.simpleFilter) {
    window.simpleFilter.applyStatusFilter(status);
  }
}

/**
 * הפעלת פילטר טיפוס
 */
function applyTypeFilter(type) {
  console.log('🔄 applyTypeFilter called with type:', type);
  
  // כאן תהיה הלוגיקה של הפעלת הפילטר
  // כרגע רק לוג - יש להוסיף את הלוגיקה האמיתית בהמשך
  if (window.simpleFilter) {
    window.simpleFilter.applyTypeFilter(type);
  }
}

/**
 * הפעלת פילטר חשבון
 */
function applyAccountFilter(account) {
  console.log('🔄 applyAccountFilter called with account:', account);
  
  // כאן תהיה הלוגיקה של הפעלת הפילטר
  // כרגע רק לוג - יש להוסיף את הלוגיקה האמיתית בהמשך
  if (window.simpleFilter) {
    window.simpleFilter.applyAccountFilter(account);
  }
}

/**
 * הפעלת פילטר תאריכים
 */
function applyDateRangeFilter(dateRange) {
  console.log('🔄 applyDateRangeFilter called with dateRange:', dateRange);
  
  // כאן תהיה הלוגיקה של הפעלת הפילטר
  // כרגע רק לוג - יש להוסיף את הלוגיקה האמיתית בהמשך
  if (window.simpleFilter) {
    window.simpleFilter.applyDateRangeFilter(dateRange);
  }
}

// ייצוא פונקציות בחירה לגלובל
window.selectStatusOption = selectStatusOption;
window.selectTypeOption = selectTypeOption;
window.selectAccountOption = selectAccountOption;
window.selectDateRangeOption = selectDateRangeOption;

// ייצוא פונקציות הפעלת פילטרים לגלובל
window.applyStatusFilter = applyStatusFilter;
window.applyTypeFilter = applyTypeFilter;
window.applyAccountFilter = applyAccountFilter;
window.applyDateRangeFilter = applyDateRangeFilter;
