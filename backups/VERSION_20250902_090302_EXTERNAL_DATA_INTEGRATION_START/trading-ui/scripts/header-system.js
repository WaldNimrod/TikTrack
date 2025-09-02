/**
 * Header System - TikTrack Frontend
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
 * @version 1.9.9
 * @lastUpdated August 26, 2025
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
    this.createHeader();

    // טעינת חשבונות לפילטר
    this.loadAccountsForFilter();

    // הגדרת event listeners
    this.setupEventListeners();

    // טעינת מצב שמור
    this.loadSavedState();

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
      
      /* Development tools icon styling */
      .tiktrack-nav-link[data-page="development-tools"] .nav-text {
        font-size: 0.8rem;
        color: #6c757d;
        opacity: 0.8;
      }
      
      .tiktrack-nav-link[data-page="development-tools"]:hover .nav-text {
        color: #495057;
        opacity: 1;
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
           
           /* Section headers styling */
           .dropdown-section-header {
             padding: 0.5rem 1rem;
             font-size: 0.8rem;
             font-weight: 600;
             color: #6c757d;
             background-color: #f8f9fa;
             border-bottom: 1px solid #dee2e6;
             cursor: default;
             user-select: none;
           }
           
           .dropdown-section-header:hover {
             background-color: #f8f9fa;
             color: #6c757d;
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
                        <span class="nav-text">בית</span>
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
                      </ul>
                    </li>
                    
                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="development-tools">
                        <span class="nav-text">🔧</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <!-- 🗑️ פעולות מערכת -->
                        <li class="dropdown-section-header">🗑️ פעולות מערכת</li>
                        <li><a class="tiktrack-dropdown-item" href="#" onclick="clearDevelopmentCache(event)" style="color: #ff6b6b;">
                          <i class="fas fa-trash"></i> נקה Cache (פיתוח)
                        </a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notifications-center">מרכז התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/background-tasks">ניהול משימות ברקע</a></li>
                        
                        <li><hr class="dropdown-divider"></li>
                        
                        <!-- 🎨 ממשק משתמש -->
                        <li class="dropdown-section-header">🎨 ממשק משתמש</li>
                        <li><a class="tiktrack-dropdown-item" href="/style_demonstration">הדגמת סגנונות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/numeric-value-colors-demo">הדגמת צבעים לערכים מספריים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">בדיקת כותרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">עיצובים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/page-scripts-matrix">מיפוי סקריפטים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/js-map">מפת JS</a></li>
                        
                        <li><hr class="dropdown-divider"></li>
                        
                        <!-- 🔍 בדיקות ונתונים -->
                        <li class="dropdown-section-header">🔍 בדיקות ונתונים</li>
                        <li><a class="tiktrack-dropdown-item" href="/system-test-center">נתונים חיצוניים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/server-monitor">ניטור שרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cache-test">בדיקת Cache</a></li>
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

            <!-- פילטר סוג השקעה -->
            <div class="filter-group type-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle type-filter-toggle" id="typeFilterToggle" onclick="toggleTypeFilter()">
                                          <span class="selected-value selected-type-text" id="selectedType">כל סוג השקעה</span>
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
                  <div class="date-range-filter-item" data-value="כל זמן" onclick="selectDateRangeOption('כל זמן')">
                    <span class="option-text">כל זמן</span>
                    <span class="check-mark">●</span>
                  </div>
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
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        const dropdownToggle = e.target.closest('.tiktrack-dropdown-toggle');
        if (dropdownToggle) {
          const dropdownMenu = dropdownToggle.nextElementSibling;
          if (dropdownMenu && dropdownMenu.classList.contains('tiktrack-dropdown-menu')) {
            this.toggleDropdown(dropdownMenu);
          }
        }
      }
    });

    // Event listeners for dropdown hover behavior
    document.addEventListener('mouseenter', e => {
      if (e.target && typeof e.target.closest === 'function') {
        const dropdownMenu = e.target.closest('.tiktrack-dropdown-menu');
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
          this.handleDropdownMouseEnter(dropdownMenu);
        }
      }
    });

    document.addEventListener('mouseleave', e => {
      if (e.target && typeof e.target.closest === 'function') {
        const dropdownMenu = e.target.closest('.tiktrack-dropdown-menu');
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
          this.handleDropdownMouseLeave(dropdownMenu);
        }
      }
    });

    // Event listeners for submenu
    document.addEventListener('mouseenter', e => {
      if (e.target && typeof e.target.closest === 'function') {
        const submenuItem = e.target.closest('.dropdown-submenu');
        if (submenuItem) {
          this.showSubmenu(submenuItem);
        }

        // טיפול בתפריטי משנה (submenu)
        const submenu = e.target.closest('.submenu');
        if (submenu && submenu.classList.contains('show')) {
          this.handleSubmenuMouseEnter(submenu);
        }
      }
    });

    document.addEventListener('mouseleave', e => {
      if (e.target && typeof e.target.closest === 'function') {
        const submenuItem = e.target.closest('.dropdown-submenu');
        if (submenuItem) {
          this.hideSubmenu(submenuItem);
        }

        // טיפול בתפריטי משנה (submenu)
        const submenu = e.target.closest('.submenu');
        if (submenu && submenu.classList.contains('show')) {
          this.handleSubmenuMouseLeave(submenu);
        }
      }
    });

    // Handle submenu item clicks
    document.addEventListener('click', e => {
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
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (!e.target.closest('.tiktrack-dropdown-toggle') && !e.target.closest('.tiktrack-dropdown-menu')) {
          this.closeAllDropdowns();
        }
      }
    });

    // Event listeners לכפתורי איפוס וניקוי
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('#resetFiltersBtn')) {
          e.preventDefault();
          e.stopPropagation();

          if (window.resetAllFilters) {
            window.resetAllFilters();
          }
          return;
        }

        if (e.target.closest('#clearFiltersBtn')) {
          e.preventDefault();
          e.stopPropagation();

          if (window.clearAllFilters) {
            window.clearAllFilters();
          }
          return;
        }

        if (e.target.closest('#searchClearBtn')) {
          e.preventDefault();
          e.stopPropagation();

          const searchInput = document.getElementById('searchFilterInput');
          if (searchInput) {
            searchInput.value = '';
            // הפעלת פילטר חיפוש ריק
            if (window.filterSystem) {
              window.filterSystem.applySearchFilter('');
            } else {
              window.applySearchFilter('');
            }
          }
          return;
        }
      }
    });

    // Event listener לפילטר חיפוש
    document.addEventListener('input', e => {
      if (e.target.id === 'searchFilterInput') {
        const searchTerm = e.target.value;

        if (window.filterSystem) {
          window.filterSystem.applySearchFilter(searchTerm);
        } else {
          window.applySearchFilter(searchTerm);
        }
      }
    });

    // סגירת תפריטים בלחיצה מחוץ לאזור התפריט
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
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
      }
    });

    // כפתור הצג/הסתר פילטרים
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('#filterToggleBtn')) {
          this.toggleFiltersNew();
          // סגירת התפריט הראשי כשפותחים פילטרים
          this.closeMainMenu();
        }
      }
    });

    // כפתור איפוס פילטרים
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('#resetFiltersBtn')) {
          this.resetAllFilters();
        }
      }
    });

    // כפתור ניקוי פילטרים
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('#clearFiltersBtn')) {
          this.clearAllFilters();
        }
      }
    });

    // כפתור נקה חיפוש
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('#searchClearBtn')) {
          this.clearSearchFilter();
        }
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

      activeLinks.forEach(link => {

      });
      activeDropdownItems.forEach(item => {

      });
    }, 100);

    // הוספת event listeners לכפתורי הניווט - DISABLED כדי לא לדרוס את הסימון הפעיל
    // this.addMenuEventListeners();

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
      // ביטול טיימר סגירה של התפריט הראשי
      this.clearDropdownTimer();
    }
  }

  hideSubmenu(submenuItem) {
    const submenu = submenuItem.querySelector('.submenu');
    if (submenu) {
      submenu.style.display = 'none';
      submenu.classList.remove('show');
    }
  }

  handleSubmenuMouseEnter(submenu) {
    // ביטול טיימר סגירה כשהעכבר נכנס לתפריט משנה
    this.clearDropdownTimer();
  }

  handleSubmenuMouseLeave(submenu) {
    // הפעלת טיימר לסגירה אחרי יציאת העכבר מתפריט משנה
    this.startMenuTimer('dropdown', 500); // זמן קצר לסגירה אחרי יציאת העכבר
  }

  toggleDropdown(dropdownMenu) {
    const isVisible = dropdownMenu.classList.contains('show');

    if (isVisible) {
      dropdownMenu.classList.remove('show');
      // ניקוי טיימר
      this.clearDropdownTimer();
    } else {
      dropdownMenu.classList.add('show');
      // הפעלת טיימר לסגירה אוטומטית
      this.startMenuTimer('dropdown', 10000); // זמן ארוך יותר לסגירה אוטומטית
    }
  }

  handleDropdownMouseEnter(dropdownMenu) {
    // ביטול טיימר סגירה כשהעכבר נכנס לתפריט
    this.clearDropdownTimer();
  }

  handleDropdownMouseLeave(dropdownMenu) {
    // הפעלת טיימר לסגירה אחרי יציאת העכבר
    this.startMenuTimer('dropdown', 500); // זמן קצר לסגירה אחרי יציאת העכבר
  }

  clearDropdownTimer() {
    if (this.menuTimers && this.menuTimers['dropdown']) {
      clearTimeout(this.menuTimers['dropdown']);
      delete this.menuTimers['dropdown'];
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
    this.clearDropdownTimer();
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
      dateRange: [],
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
        // Error restoring filter states
      }
    }
  }

  // פונקציה להגדרת הפריט הפעיל
  setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('#unified-header .tiktrack-nav-item');
    const dropdownItems = document.querySelectorAll('#unified-header .tiktrack-dropdown-item');


    // בדיקה נוספת - הדפסת כל הכפתורים שנמצאו
    navItems.forEach((item, index) => {
      const link = item.querySelector('.tiktrack-nav-link');
      const href = link ? link.getAttribute('href') : 'no href';

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

        }
      }
    });

    // סימון הפריט הפעיל בתפריט המשנה
    dropdownItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && currentPath.includes(href)) {
        item.classList.add('active');

        // סימון גם הפריט הראשי אם יש פריט פעיל בתפריט המשנה
        const parentDropdown = item.closest('.tiktrack-nav-item');
        if (parentDropdown) {
          parentDropdown.classList.add('active');

        }
      }
    });

    // סימון מיוחד לעמוד הבית
    if (currentPath === '/' || currentPath === '/index.html') {
      const homeItem = document.querySelector('#unified-header .tiktrack-nav-item[data-page="home"]');
      if (homeItem) {
        homeItem.classList.add('active');

      }
    }

    // בדיקה סופית - כמה פריטים פעילים יש
    const activeItems = document.querySelectorAll('#unified-header .tiktrack-nav-item.active');

    activeItems.forEach((item, index) => {
      const link = item.querySelector('.tiktrack-nav-link');
      const href = link ? link.getAttribute('href') : 'no href';

    });
  }

  // הוספת event listeners לכפתורי הניווט (מתוך header-system.js)
  addMenuEventListeners() {
    const navItems = document.querySelectorAll('.tiktrack-nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', e => {
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
      toggle.addEventListener('click', e => {
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


  loadSavedState() {
    const savedState = localStorage.getItem('headerState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.isFilterCollapsed = state.isFilterCollapsed || false;

      if (this.isFilterCollapsed) {
        const filtersElement = document.getElementById('headerFilters');
        const toggleBtn = document.getElementById('filterToggleBtn');
        const arrow = toggleBtn?.querySelector('.filter-arrow');

        if (filtersElement && toggleBtn && arrow) {
          filtersElement.style.display = 'none';
          arrow.textContent = '▶';
          toggleBtn.classList.add('collapsed');
        }
      }
    }

    // שחזור מצב אזור הפילטרים (גיבוי)
    this.restoreFiltersSectionState();
  }

  saveState() {
    const state = {
      isFilterCollapsed: this.isFilterCollapsed,
    };
    localStorage.setItem('headerState', JSON.stringify(state));
  }

  // פונקציה לעדכון חשבונות בפילטר
  updateAccountFilter(accounts) {
    const accountMenu = document.getElementById('accountFilterMenu');
    if (!accountMenu) {return;}

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
    allItem.addEventListener('click', e => {
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
      item.addEventListener('click', e => {
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

  setupFilterItemEventListeners() {
    // Event listeners לפריטי פילטר תאריכים
    const dateItems = document.querySelectorAll('#dateRangeFilterMenu .filter-item');
    dateItems.forEach(item => {
      item.addEventListener('click', e => {
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
      item.addEventListener('click', e => {
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
        if (window.filterSystem) {
          window.filterSystem.currentFilters.status = selectedStatuses;
          window.filterSystem.applyFilters();
        }

        // לא סוגרים את הדרופדאון - מאפשרים בחירה מרובה
        // this.closeAllDropdowns();
      });
    });

    // Event listeners לפריטי פילטר טיפוס
    const typeItems = document.querySelectorAll('#typeFilterMenu .filter-item');
    typeItems.forEach(item => {
      item.addEventListener('click', e => {
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
        if (window.filterSystem) {
          window.filterSystem.currentFilters.type = selectedTypes;
          window.filterSystem.applyFilters();
        }

        // לא סוגרים את הדרופדאון - מאפשרים בחירה מרובה
        // this.closeAllDropdowns();
      });
    });

    // Event listeners לפריטי פילטר חשבון
    const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
    accountItems.forEach(item => {
      item.addEventListener('click', e => {
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
        if (window.filterSystem) {
          window.filterSystem.currentFilters.account = selectedAccounts;
          window.filterSystem.applyFilters();
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
      toggle.addEventListener('click', e => {
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
    document.addEventListener('click', e => {
      if (e.target && typeof e.target.closest === 'function') {
        if (!e.target.closest('.tiktrack-nav-item.dropdown')) {
          const navMenus = document.querySelectorAll('.tiktrack-nav-item.dropdown .tiktrack-dropdown-menu');
          navMenus.forEach(menu => {
            menu.classList.remove('show');
            this.clearMenuTimers(menu);
          });
        }
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



  updateAccountFilterMenu(accounts) {
    const headerElement = document.getElementById('unified-header');
    if (!headerElement) {return;}

    const accountMenu = headerElement.querySelector('#accountFilterMenu');
    if (!accountMenu) {return;}

    // ניקוי התפריט
    accountMenu.innerHTML = '';

    // הוספת אופציית "הכול"
    const allOption = document.createElement('div');
    allOption.className = 'account-filter-item';
    allOption.textContent = 'הכול';
    allOption.onclick = () => this.selectAccountFilter('הכול');
    accountMenu.appendChild(allOption);

    // הוספת חשבונות מהשרת
    if (accounts && accounts.length > 0) {
      accounts.forEach(account => {
        const accountOption = document.createElement('div');
        accountOption.className = 'account-filter-item';
        accountOption.textContent = account.name;
        accountOption.onclick = () => this.selectAccountFilter(account.name);
        accountMenu.appendChild(accountOption);
      });
    } else {
      // הוספת חשבונות סטטיים לבדיקה
      const staticAccounts = ['חשבון א', 'חשבון ב', 'חשבון ג'];
      staticAccounts.forEach(accountName => {
        const accountOption = document.createElement('div');
        accountOption.className = 'account-filter-item';
        accountOption.textContent = accountName;
        accountOption.onclick = () => this.selectAccountFilter(accountName);
        accountMenu.appendChild(accountOption);
      });
    }
  }

  selectAccountFilter(accountName) {


    // עדכון תצוגה
    const selectedElement = document.getElementById('selectedAccount');
    if (selectedElement) {
      selectedElement.textContent = accountName;
    }

    // הפעלת פילטר
    if (window.filterSystem) {
      window.filterSystem.applyAccountFilter(accountName === 'הכול' ? [] : [accountName]);
    } else {
      console.warn('⚠️ No filter system found');
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
      } else {
        filtersElement.style.display = 'block';
        arrow.textContent = '▼';
        toggleBtn.classList.remove('collapsed');
        this.isFilterCollapsed = false;
      }

      // שמירת מצב ב-localStorage
      localStorage.setItem('filtersSectionOpen', this.isFilterCollapsed ? 'false' : 'true');

      // שמירת מצב במערכת
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

      // עדכון הסטטוס במערכת
      this.saveState();
    }
  }

  // פונקציה לאיפוס כל הפילטרים
  resetAllFilters() {


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


    // איפוס כל הפילטרים
    this.currentFilters = {
      status: [],
      type: [],
      account: [],
      dateRange: '',
      search: '',
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
    if (typeof window.getAccounts === 'function') {
      window.getAccounts().then(accounts => {
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
                parsed.user.defaultDateRangeFilter === 'this_month' ? 'MTD' : 'כל זמן',
          };
        }
      }

      // אם אין ב-localStorage, ננסה לטעון מהשרת
      const userPreferences = localStorage.getItem('userPreferences');
      if (userPreferences) {
        return JSON.parse(userPreferences);
      }
    } catch (error) {
      // Error loading user preferences
    }

    // החזרת ערכי ברירת מחדל אם אין העדפות
    return {
      defaultStatuses: ['פתוח'],
      defaultTypes: ['סווינג'],
      defaultAccounts: [],
      defaultDateRange: 'כל זמן',
    };
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
      selectedText.textContent = 'כל סוגי ההשקעה';
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


    // Close all dropdowns
    this.closeAllDropdowns();

    // Handle different navigation types
    if (href.includes('#')) {
      // Handle anchor navigation for other pages if needed
      const [path, anchor] = href.split('#');
      // Regular navigation for anchor links
      window.location.href = href;
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

  // הגדרת פריט תפריט פעיל - DISABLED - משתמשים בפונקציה החדשה
  // setActiveMenuItem() {
  //   const currentPath = window.location.pathname;
  //   const navLinks = document.querySelectorAll('.nav-link');
  //   const dropdownItems = document.querySelectorAll('.dropdown-item');

  //   // הסרת כל הסימונים הפעילים
  //   navLinks.forEach(link => link.classList.remove('active'));
  //   dropdownItems.forEach(item => item.classList.remove('active'));

  //   // מציאת הקישור המתאים לנתיב הנוכחי
  //   navLinks.forEach(link => {
  //     const href = link.getAttribute('href');
  //     if (href && currentPath.includes(href.replace('.html', ''))) {
  //       link.classList.add('active');
  //     }
  //   });

  //   dropdownItems.forEach(item => {
  //     const href = item.getAttribute('href');
  //     if (href && currentPath.includes(href.replace('.html', ''))) {
  //       item.classList.add('active');

  //       // הוספת סימון פעיל גם לפריט ההורה
  //       const parentNav = item.closest('.nav-item');
  //       if (parentNav) {
  //         const parentLink = parentNav.querySelector('.nav-link');
  //         if (parentLink) {
  //           parentLink.classList.add('active');
  //           }
  //         }
  //       }
  //     });

  //     // אם אין קישור פעיל, סמן את הבית
  //     if (!document.querySelector('.nav-link.active, .dropdown-item.active')) {
  //       const homeLink = document.querySelector('.nav-link[href="index.html"]');
  //       if (homeLink) {
  //         homeLink.classList.add('active');
  //       }
  //     }
  //   }

  // טעינת חשבונות לפילטר (רק חשבונות פעילים)
  async loadAccountsForFilter() {
    try {
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const response = await fetch(`${base}/api/v1/accounts`);

      if (!response.ok) {throw new Error(`HTTP ${response.status}`);}

      const data = await response.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        // סינון רק חשבונות פעילים
        const activeAccounts = data.data.filter(account =>
          account.status === 'active' || account.status === 'open',
        );
        // Loaded active accounts out of total accounts
        this.updateAccountFilterOptions(activeAccounts);
      }
    } catch (err) {
      console.warn('Failed to load accounts for filter:', err);
    }
  }

  // עדכון אפשרויות פילטר חשבון
  updateAccountFilterOptions(accounts) {
    const accountMenu = document.querySelector('#accountFilterMenu');
    if (!accountMenu) {return;}

    // שמירת החשבונות ב-localStorage
    localStorage.setItem('tiktrack_accounts', JSON.stringify(accounts));
    // Saved accounts to localStorage

    // ניקוי התפריט הקיים
    accountMenu.innerHTML = '';

    // הוספת אפשרות "כל החשבונות"
    const allOption = document.createElement('div');
    allOption.className = 'account-filter-item';
    allOption.setAttribute('data-account-id', '');
    allOption.setAttribute('data-value', 'הכול');
    allOption.innerHTML = `
      <span class="option-text">כל החשבונות</span>
      <span class="check-mark">●</span>
    `;
    allOption.addEventListener('click', e => {
      e.stopPropagation();
      selectAccountOption('הכול');
    });
    accountMenu.appendChild(allOption);

    // הוספת החשבונות
    accounts.forEach(account => {
      const option = document.createElement('div');
      option.className = 'account-filter-item';
      option.setAttribute('data-account-id', account.id);
      option.setAttribute('data-value', account.name);
      option.innerHTML = `
        <span class="option-text">${account.name}</span>
        <span class="check-mark">●</span>
      `;
      option.addEventListener('click', e => {
        e.stopPropagation();
        selectAccountOption(account.name);
      });
      accountMenu.appendChild(option);
    });
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
    if (window.filterSystem && window.filterSystem.resetFilters) {
      window.filterSystem.resetFilters();
    } else {
      // Fallback - הצגת כל הרשומות
      const visibleContainers = getVisibleContainers();
      for (const containerId of visibleContainers) {
        showAllRecordsInTable(containerId);
      }
    }
  }

  // ניקוי פילטר חיפוש
  clearSearchFilter() {
    const searchInput = document.querySelector('#searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
      // הפעלת פילטר חיפוש ריק כדי להציג את כל הרשומות
      if (window.applySearchFilter) {
        window.applySearchFilter('');
      }
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
    if (!menu) {return;}

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
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
  }
}

/**
 * סגירת פילטר טיפוס
 */
function closeTypeFilter() {
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
  }
}

/**
 * סגירת פילטר חשבונות
 */
function closeAccountFilter() {
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
  }
}

/**
 * סגירת פילטר תאריכים
 */
function closeDateRangeFilter() {
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    menu.classList.remove('show');
    clearFilterMenuTimers(menu);
  }
}

// ייצוא פונקציות סגירה לגלובל
window.closeStatusFilter = closeStatusFilter;
window.closeTypeFilter = closeTypeFilter;
window.closeAccountFilter = closeAccountFilter;
window.closeDateRangeFilter = closeDateRangeFilter;

// ייצוא הקלאס לגלובל
window.HeaderSystem = HeaderSystem;

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', () => {
  // === DOM CONTENT LOADED (HEADER SYSTEM) ===
  // HeaderSystem available

  if (typeof HeaderSystem === 'function') {
    window.headerSystem = new HeaderSystem();
    window.headerSystem.init();
    // Header system initialized successfully
  } else {
    // HeaderSystem class not found
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
    }, 300); // זמן קצר יותר לסגירה מהירה
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


  // עדכון סימון ויזואלי
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  // Found status items

  const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
  // Clicked item found

  if (clickedItem) {
    if (status === 'הכול') {
      // Selecting "הכול" - clearing all others
      // אם בוחרים "הכול" - מסירים סימון מכל השאר
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // Selecting specific status - toggling selection
      // אם בוחרים סטטוס ספציפי - מסירים סימון מ"הכול" ומוסיפים/מסירים מהסטטוס
      const allItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
        // Removed "הכול" selection
      }

      // בדיקה אם יש פריטים נבחרים אחרים
      const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');

      clickedItem.classList.toggle('selected');

      // אם אין פריטים נבחרים, בחר "הכול"
      const newSelectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
      if (newSelectedItems.length === 0) {
        // No items selected, selecting "הכול"
        if (allItem) {allItem.classList.add('selected');}
      }
    }
  } else {
    // Clicked item not found for status
  }

  // עדכון הטקסט הנבחר
  // Updating status filter text
  updateStatusFilterText();

  // הפעלת הפילטר
  // Applying status filter
  applyStatusFilter();
}

/**
 * בחירת אפשרות פילטר טיפוס
 */
function selectTypeOption(type) {


  // עדכון סימון ויזואלי
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');

  const clickedItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === type);

  if (clickedItem) {
    if (type === 'הכול') {
      // Selecting "הכול" - clearing all others
      // אם בוחרים "הכול" - מסירים סימון מכל השאר
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // Selecting specific type - toggling selection
      // אם בוחרים טיפוס ספציפי - מסירים סימון מ"הכול" ומוסיפים/מסירים מהטיפוס
      const allItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
        // Removed "הכול" selection
      }

      // בדיקה אם יש פריטים נבחרים אחרים
      const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');

      clickedItem.classList.toggle('selected');

      // אם אין פריטים נבחרים, בחר "הכול"
      const newSelectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
      if (newSelectedItems.length === 0) {
        // No items selected, selecting "הכול"
        if (allItem) {allItem.classList.add('selected');}
      }
    }
  } else {
    // Clicked item not found for type
  }

  // עדכון הטקסט הנבחר
  // Updating type filter text
  updateTypeFilterText();

  // הפעלת הפילטר
  // Applying type filter
  applyTypeFilter();
}

/**
 * בחירת אפשרות פילטר חשבון
 */
function selectAccountOption(account) {


  // עדכון סימון ויזואלי
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');

  const clickedItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === account);

  if (clickedItem) {
    if (account === 'הכול') {
      // Selecting "הכול" - clearing all others
      // אם בוחרים "הכול" - מסירים סימון מכל השאר
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // Selecting specific account - toggling selection
      // אם בוחרים חשבון ספציפי - מסירים סימון מ"הכול" ומוסיפים/מסירים מהחשבון
      const allItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
        // Removed "הכול" selection
      }

      // בדיקה אם יש פריטים נבחרים אחרים
      const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');

      clickedItem.classList.toggle('selected');

      // אם אין פריטים נבחרים, בחר "הכול"
      const newSelectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
      if (newSelectedItems.length === 0) {
        // No items selected, selecting "הכול"
        if (allItem) {allItem.classList.add('selected');}
      }
    }
  } else {
    // Clicked item not found for account
  }

  // עדכון הטקסט הנבחר
  // Updating account filter text
  updateAccountFilterText();

  // הפעלת הפילטר
  applyAccountFilter();
}

/**
 * בחירת אפשרות פילטר תאריכים
 */
function selectDateRangeOption(dateRange) {


  // עדכון הטקסט הנבחר - הצגת טווח תאריכים
  const selectedDateRangeElement = document.getElementById('selectedDateRange');
  if (selectedDateRangeElement) {
    let displayText = 'כל זמן';

    if (dateRange === 'היום') {
      const today = new Date();
      const todayStr = today.toLocaleDateString('he-IL');
      displayText = `${todayStr} - ${todayStr}`;
    } else if (dateRange === 'אתמול') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('he-IL');
      displayText = `${yesterdayStr} - ${yesterdayStr}`;
    } else if (dateRange === 'השבוע') {
      // השבוע = מתחילת השבוע הקלנדארי ועד היום
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startStr = startOfWeek.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'שבוע') {
      // שבוע = 7 ימים אחרונים
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);

      const startStr = startDate.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'MTD') {
      // MTD = מתחילת החודש הקלנדארי ועד היום
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const startStr = startOfMonth.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === '30 יום') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);

      const startStr = startDate.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === '60 יום') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 60);

      const startStr = startDate.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === '90 יום') {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 90);

      const startStr = startDate.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'YTD') {
      // YTD = מתחילת השנה הקלנדארית ועד היום
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const startStr = startOfYear.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'שנה') {
      // שנה = 365 יום
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 365);

      const startStr = startDate.toLocaleDateString('he-IL');
      const endStr = today.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'שבוע קודם') {
      const today = new Date();
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);

      const startStr = startOfLastWeek.toLocaleDateString('he-IL');
      const endStr = endOfLastWeek.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'חודש קודם') {
      const today = new Date();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      const startStr = startOfLastMonth.toLocaleDateString('he-IL');
      const endStr = endOfLastMonth.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange === 'שנה קודמת') {
      const today = new Date();
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);

      const startStr = startOfLastYear.toLocaleDateString('he-IL');
      const endStr = endOfLastYear.toLocaleDateString('he-IL');
      displayText = `${startStr} - ${endStr}`;
    } else if (dateRange !== 'כל זמן') {
      displayText = dateRange;
    }

    selectedDateRangeElement.textContent = displayText;
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
 * Simple Filter System - New Architecture
 * =======================================
 *
 * Simple, direct filter application without complex configurations
 */

// Supported containers for filtering
const SUPPORTED_CONTAINERS = [
  'tradesContainer',
  'tradePlansContainer',
  'trade_plansContainer',
  'accountsContainer',
  'alertsContainer',
  'cashFlowsContainer',
  'executionsContainer',
  'notesContainer',
  'tickersContainer',
];

// Filter column mappings
const FILTER_COLUMNS = {
  'status': 'Status',
  'type': 'Investment Type',
  'account': 'Account',
  'date': 'Date',
  'search': null, // Special case - searches all columns
};

// Tables that support type filter
const TYPE_FILTER_TABLES = ['tradesContainer', 'tradePlansContainer', 'trade_plansContainer'];

/**
 * Simple filter application function
 */
function applyFilter(filterType, selectedValue) {
  // Applying filter with value

  // Get visible containers
  const visibleContainers = getVisibleContainers();

  if (visibleContainers.length === 0) {
    return;
  }

  // Apply filter to each container
  for (const containerId of visibleContainers) {
    if (shouldApplyFilterToContainer(containerId, filterType)) {
      applyFilterToContainer(containerId, filterType, selectedValue);
    }
  }
}

/**
 * Get visible containers from the supported list
 */
function getVisibleContainers() {
  const visible = [];

  for (const containerId of SUPPORTED_CONTAINERS) {
    const container = document.getElementById(containerId);
    if (container && container.offsetParent !== null) {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        visible.push(containerId);
      }
    }
  }

  return visible;
}

/**
 * Check if filter should be applied to this container
 */
function shouldApplyFilterToContainer(containerId, filterType) {
  // Type filter only applies to specific tables
  if (filterType === 'type' && !TYPE_FILTER_TABLES.includes(containerId)) {
    return false;
  }

  // All other filters apply to all supported containers
  return true;
}

/**
 * Apply filter to a specific container
 */
function applyFilterToContainer(containerId, filterType, selectedValue) {
  // Applying filter to container

  const container = document.getElementById(containerId);
  if (!container) {return;}

  const table = container.querySelector('table');
  if (!table) {return;}

  const rows = table.querySelectorAll('tbody tr');
  let visibleCount = 0;

  for (const row of rows) {
    const shouldShow = checkRowFilter(row, filterType, selectedValue);
    row.style.display = shouldShow ? '' : 'none';
    if (shouldShow) {visibleCount++;}
  }


  // Update table count
  updateTableCount(containerId, visibleCount, rows.length);
}

/**
 * Check if a row should be shown based on filter
 */
function checkRowFilter(row, filterType, selectedValue) {
  // Convert selectedValue to array if it's not already
  const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

  // Show all if no filter value or if "הכול" is selected
  if (!selectedValue || selectedValues.length === 0 || selectedValues.includes('הכול') || selectedValue === 'כל זמן') {
    return true;
  }

  // Special case for search
  if (filterType === 'search') {
    return checkSearchFilter(row, selectedValue);
  }

  // Get column index for this filter type
  const columnIndex = getColumnIndex(row, filterType);
  if (columnIndex === -1) {return true;} // Show if column not found

  // Get cell value
  const cell = row.cells[columnIndex];
  if (!cell) {return true;}

  const cellValue = cell.textContent.trim();

  // Check data attributes first (for original values)
  const dataAttribute = `data-${filterType}`;
  let originalValue = cell.getAttribute(dataAttribute);

  // For date filter, also check data-date attribute
  if (filterType === 'date' && !originalValue) {
    originalValue = cell.getAttribute('data-date');
  }

  // Apply filter logic
  switch (filterType) {
  case 'status':
    // Check both original value and displayed value
    if (originalValue) {
      return selectedValues.some(value =>
        originalValue.toLowerCase() === value.toLowerCase() ||
          cellValue === value,
      );
    }
    return selectedValues.includes(cellValue);
  case 'type':
    // Check both original value and displayed value
    if (originalValue) {
      return selectedValues.some(value =>
        originalValue.toLowerCase() === value.toLowerCase() ||
          cellValue === value,
      );
    }
    return selectedValues.includes(cellValue);
  case 'account':
    return selectedValues.includes(cellValue);
  case 'date':
    // For date filter, check both cell value and original value
    if (originalValue) {
      return checkDateFilter(originalValue, selectedValue) || checkDateFilter(cellValue, selectedValue);
    }
    return checkDateFilter(cellValue, selectedValue);
  default:
    return true;
  }
}

/**
 * Get column index for filter type
 */
function getColumnIndex(row, filterType) {
  const table = row.closest('table');
  if (!table) {return -1;}

  const headers = table.querySelectorAll('th');
  const columnName = FILTER_COLUMNS[filterType];

  if (!columnName) {return -1;}

  // Define Hebrew translations for column names
  const hebrewTranslations = {
    'Status': ['סטטוס', 'Status'],
    'Investment Type': ['סוג השקעה', 'סוג', 'Investment Type'],
    'Account': ['חשבון', 'Account'],
    'Date': ['תאריך', 'Date', 'נוצר ב', 'נסגר ב', 'תאריך ביצוע', 'תאריך הפעלה', 'נוצר ב', 'תאריך'],
  };

  for (let i = 0; i < headers.length; i++) {
    const headerText = headers[i].textContent.trim();

    // Check exact match first
    if (headerText.includes(columnName)) {
      return i;
    }

    // Check Hebrew translations
    const translations = hebrewTranslations[columnName];
    if (translations) {
      for (const translation of translations) {
        if (headerText.includes(translation)) {
          return i;
        }
      }
    }
  }

  return -1;
}

/**
 * Check search filter
 */
function checkSearchFilter(row, searchTerm) {
  if (!searchTerm) {return true;}

  const cells = row.querySelectorAll('td');
  for (const cell of cells) {
    const cellText = cell.textContent.toLowerCase();
    if (cellText.includes(searchTerm.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Check date filter
 */
function checkDateFilter(cellValue, dateRange) {
  if (!dateRange || dateRange === 'כל זמן') {
    return true;
  }

  return isDateInRange(cellValue, dateRange);
}

/**
 * Update table count display
 */
function updateTableCount(containerId, visibleCount, totalCount) {
  // Find table count element in the same container
  const container = document.getElementById(containerId);
  if (!container) {return;}

  // Look for table-count element in the container or its parent
  let countElement = container.querySelector('.table-count');
  if (!countElement) {
    // Try to find in parent sections
    const parentSection = container.closest('.content-section, .page-body, .main-content');
    if (parentSection) {
      countElement = parentSection.querySelector('.table-count');
    }
  }

  if (countElement) {
    // Get the page type from container ID
    let pageType = '';
    if (containerId.includes('trades')) {pageType = 'טריידים';}
    else if (containerId.includes('trade_plans') || containerId.includes('tradePlans')) {pageType = 'תכנונים';}
    else if (containerId.includes('executions')) {pageType = 'עסקעות';}
    else if (containerId.includes('accounts')) {pageType = 'חשבונות';}
    else if (containerId.includes('tickers')) {pageType = 'טיקרים';}
    else if (containerId.includes('alerts')) {pageType = 'התראות';}
    else if (containerId.includes('notes')) {pageType = 'הערות';}
    else if (containerId.includes('cashFlows')) {pageType = 'תזרימים';}
    else {pageType = 'רשומות';}

    countElement.textContent = `${visibleCount} ${pageType}`;
    // Updated table count
  }
}

/**
 * בדיקה אם תאריך נמצא בטווח
 *
 * ⚠️ חשוב: פונקציה זו תוקנה כבר 3 פעמים לפי הגדרות מדויקות של נימרוד!
 * אין לשנות את הלוגיקה בלי לקבל אישור מנימרוד!
 *
 * הגדרות מדויקות של נימרוד:
 * - השבוע = מתחילת השבוע הקלנדארי ועד היום
 * - שבוע = 7 ימים
 * - MTD = מתחילת החודש הקלנדארי ועד היום
 * - YTD = מתחילת השנה הקלנדארית ועד היום
 * - החודש = מתחילת החודש הקלנדארי ועד היום
 * - שנה = 365 יום
 * - השנה = מתחילת השנה הקלנדארית ועד היום
 * - שבוע קודם = מתחילת השבוע הקלנדארי הקודם ועד סופו
 * - חודש קודם = מתחילת החודש הקלנדארי הקודם ועד סופו
 * - השנה הקודמת = מתחילת השנה הקלנדארית הקודמת ועד סופה
 *
 * 🚨 אזהרה: אין לשנות את הלוגיקה בלי אישור מנימרוד!
 */
function isDateInRange(dateString, dateRange) {
  try {
    // חילוץ התאריך בלבד (ללא שעה)
    let dateOnly = dateString;

    // אם התאריך מכיל רווח, ניקח רק את החלק לפני הרווח (התאריך)
    if (dateString.includes(' ')) {
      dateOnly = dateString.split(' ')[0];
    }

    // המרת התאריך לפורמט ISO אם הוא בפורמט עברי
    let isoDate = dateOnly;
    if (dateOnly.includes('.')) {
      // פורמט עברי: DD.MM.YYYY
      const parts = dateOnly.split('.');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        isoDate = `${year}-${month}-${day}`;
      }
    }

    // המרת התאריך מהתא לטופס Date
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return true; // אם התאריך לא תקין, נציג את השורה
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // סוף היום

    let startDate, endDate;

    switch (dateRange) {
    case 'היום':
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case 'אתמול':
      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'השבוע':
      // מתחילת השבוע הקלנדארי ועד היום (ראשון = 0, שני = 1, וכו')
      startDate = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case 'שבוע':
      // 7 ימים אחרונים
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case 'MTD':
      // מתחילת החודש הקלנדארי ועד היום
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
      break;

    case 'YTD':
      // מתחילת השנה הקלנדארית ועד היום
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
      break;

    case 'החודש':
      // מתחילת החודש הקלנדארי ועד היום
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
      break;

    case 'שנה':
      // 365 יום
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case 'השנה':
      // מתחילת השנה הקלנדארית ועד היום
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
      break;

    case '30 יום':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case '60 יום':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 60);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case '90 יום':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
      break;

    case 'שבוע קודם': {
      // מתחילת השבוע הקלנדארי הקודם ועד סופו
      const dayOfWeekForLastWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeekForLastWeek - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    case 'חודש קודם':
      // מתחילת החודש הקלנדארי הקודם ועד סופו
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'השנה הקודמת':
      // מתחילת השנה הקלנדארית הקודמת ועד סופה
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      return true; // אם לא מכירים את הטווח, נציג את השורה
    }

    const isInRange = date >= startDate && date <= endDate;
    // Date range check
    return isInRange;
  } catch (error) {
    // Error checking date range
    return true; // אם יש שגיאה, נציג את השורה
  }
}

/**
 * מציאת תא הפילטר בשורה
 */
function findFilterCell(row, filterConfig) {
  // findFilterCell called for

  const table = row.closest('table');
  const headers = table.querySelectorAll('th');
  const cells = row.querySelectorAll('td');

  // חיפוש לפי כותרת העמודה
  for (let i = 0; i < headers.length && i < cells.length; i++) {
    const headerText = headers[i].textContent.trim();

    if (headerText === filterConfig.columnName ||
        filterConfig.columnNameEnglish && headerText === filterConfig.columnNameEnglish ||
        filterConfig.columnNameEnglish && headerText.includes(filterConfig.columnNameEnglish) ||
        filterConfig.columnName === 'תאריך' && (headerText.includes('נוצר ב') || headerText.includes('תאריך יצירה'))) {
      return cells[i];
    }
  }

  // חיפוש לפי data-field אם קיים
  if (filterConfig.dataField) {
    const filterCell = row.querySelector(`td[data-${filterConfig.dataField}]`);
    if (filterCell) {
      return filterCell;
    }
  }

  return null;
}

/**
 * הצגת כל הרשומות בטבלה (כאשר אין עמודה מתאימה)
 */
function showAllRecordsInTable(containerId) {
  // Showing all records in container

  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  const table = container.querySelector('table');
  if (!table) {
    return;
  }

  const rows = table.querySelectorAll('tbody tr');
  let visibleCount = 0;

  for (const row of rows) {
    row.style.display = '';
    visibleCount++;
  }


  // Update table count
  updateTableCount(containerId, visibleCount, rows.length);
}

/**
 * הפעלת פילטר סטטוס (לשמירה על תאימות לאחור)
 */
function applyStatusFilter() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const selectedStatuses = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
  applyFilter('status', selectedStatuses);
}

/**
 * הפעלת פילטר טיפוס (לשמירה על תאימות לאחור)
 */
function applyTypeFilter() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const selectedTypes = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
  applyFilter('type', selectedTypes);
}

/**
 * הפעלת פילטר חשבון (לשמירה על תאימות לאחור)
 */
function applyAccountFilter() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const selectedAccounts = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
  applyFilter('account', selectedAccounts);
}

/**
 * הפעלת פילטר תאריכים (לשמירה על תאימות לאחור)
 */
function applyDateRangeFilter(dateRange) {
  // applyDateRangeFilter called
  // Date range type check
  // Date range length check
  applyFilter('date', dateRange);
}

/**
 * הפעלת פילטר חיפוש חופשי
 */
function applySearchFilter(searchTerm) {
  // applySearchFilter called
  // Search term type check
  // Search term length check

  if (searchTerm && searchTerm.trim()) {
    // Applying search filter with term
    applyFilter('search', searchTerm.trim());
  } else {
    // Search term is empty, showing all records
    // אם החיפוש ריק, הצג את כל הרשומות בכל הקונטיינרים הנראים
    const visibleContainers = getVisibleContainers();
    for (const containerId of visibleContainers) {
      showAllRecordsInTable(containerId);
    }
  }

  // קריאה לפונקציות הפילטר שלנו אם אנחנו בדף חשבונות
  if (window.searchAccounts) {
    // Calling searchAccounts for accounts page
    window.searchAccounts(searchTerm);
  }

  // קריאה לפונקציות הפילטר שלנו אם אנחנו בדף ביצועים
  if (window.searchExecutions) {
    // Calling searchExecutions for executions page
    window.searchExecutions(searchTerm);
  }
}

// הפונקציה הוסרה - קיימת כבר בשורה 3775

// פונקציה applyDateRangeFilter כבר מוגדרת בשורה 3797

// ייצוא פונקציות בחירה לגלובל
window.selectStatusOption = selectStatusOption;
window.selectTypeOption = selectTypeOption;
window.selectAccountOption = selectAccountOption;
window.selectDateRangeOption = selectDateRangeOption;

// ייצוא פונקציות פילטר לגלובל
window.applyStatusFilter = applyStatusFilter;
window.applyTypeFilter = applyTypeFilter;
window.applyAccountFilter = applyAccountFilter;
window.applyDateRangeFilter = applyDateRangeFilter;
window.applySearchFilter = applySearchFilter;

window.checkIfTableHasColumn = checkIfTableHasColumn;
window.applyFilterToTable = applyFilterToTable;
window.findFilterCell = findFilterCell;
window.searchInAllColumns = searchInAllColumns;
window.showAllRecordsInTable = showAllRecordsInTable;
window.getAllVisibleContainers = getVisibleContainers;
window.getVisibleContainers = getVisibleContainers;
window.isDateInRange = isDateInRange;

/**
 * Get filter configuration for different filter types
 */
function getFilterConfig(filterType) {
  const configs = {
    'status': {
      columnName: 'Status',
      containerIdKeywords: ['status', 'Status'],
      knownContainers: ['tradesContainer', 'tradePlansContainer', 'trade_plansContainer', 'alertsContainer', 'executionsContainer', 'accountsContainer', 'tickersContainer', 'cashFlowsContainer', 'notesContainer'],
      cellValues: ['Open', 'Closed', 'Cancelled'],
      dataField: 'status',
    },
    'type': {
      columnName: 'Investment Type',
      containerIdKeywords: ['type', 'Type', 'investment'],
      knownContainers: ['tradesContainer', 'tradePlansContainer', 'trade_plansContainer'],
      cellValues: ['Investment', 'Swing', 'Passive'],
      dataField: 'investment-type',
    },
    'account': {
      columnName: 'Account',
      containerIdKeywords: ['account', 'Account'],
      knownContainers: ['tradesContainer', 'alertsContainer', 'executionsContainer', 'cashFlowsContainer'],
      cellValues: [], // Dynamic from server (only active accounts)
      dataField: 'account',
    },
    'date': {
      columnName: 'Date',
      containerIdKeywords: ['date', 'Date'],
      knownContainers: ['tradesContainer', 'alertsContainer', 'executionsContainer', 'cashFlowsContainer', 'notesContainer'],
      cellValues: [], // Dates are dynamic
      dataField: 'date',
      isFirstOccurrence: true,
    },
    'search': {
      columnName: 'search',
      containerIdKeywords: ['search', 'search'],
      knownContainers: ['tradesContainer', 'tradePlansContainer', 'trade_plansContainer', 'alertsContainer', 'executionsContainer', 'accountsContainer', 'tickersContainer', 'cashFlowsContainer', 'notesContainer'],
      cellValues: [],
      dataField: 'search',
      searchAllColumns: true,
      excludeColumns: ['Actions'],
    },
  };
  return configs[filterType];
}

window.getFilterConfig = getFilterConfig;

/**
 * Universal filter function that works on all tables
 */
function applyTableFilter(filterType, selectedValues) {
  // Get filter configuration
  const filterConfig = getFilterConfig(filterType);
  if (!filterConfig) {
    console.warn(`⚠️ No filter config found for type: ${filterType}`);
    return;
  }

  // Get all visible containers
  const visibleContainers = getVisibleContainers();

  // Apply filter to each relevant table
  for (const containerId of visibleContainers) {
    if (checkIfTableHasColumn(containerId, filterConfig)) {
      applyFilterToTable(containerId, filterConfig, selectedValues);
    } else {
      showAllRecordsInTable(containerId);
    }
  }
}

window.applyTableFilter = applyTableFilter;

// יצירת מערכת פילטרים גלובלית לדף הבדיקה
if (!window.filterSystem) {
  window.filterSystem = {
    currentFilters: {
      dateRange: null,
      status: [],
      type: [],
      account: [],
      search: null,
    },
  };
}

/**
 * Check if a table has the specified column
 */
function checkIfTableHasColumn(containerId, filterConfig) {
  const container = document.getElementById(containerId);
  if (!container) {return false;}

  const table = container.querySelector('table');
  if (!table) {return false;}

  const headers = table.querySelectorAll('th');
  const columnName = filterConfig.columnName;

  for (const header of headers) {
    const headerText = header.textContent.trim();
    if (headerText.includes(columnName)) {
      return true;
    }

    // Check Hebrew translations for Date column
    if (columnName === 'Date') {
      const hebrewDateTranslations = ['תאריך', 'Date', 'נוצר ב', 'נסגר ב', 'תאריך ביצוע', 'תאריך הפעלה'];
      for (const translation of hebrewDateTranslations) {
        if (headerText.includes(translation)) {
          return true;
        }
      }
    }
  }

  return false;
}

window.checkIfTableHasColumn = checkIfTableHasColumn;

/**
 * Apply filter to a specific table
 */
function applyFilterToTable(containerId, filterConfig, selectedValues) {
  // applyFilterToTable called with

  const container = document.getElementById(containerId);
  if (!container) {return;}

  const table = container.querySelector('table');
  if (!table) {return;}

  const rows = table.querySelectorAll('tbody tr');
  let visibleCount = 0;

  for (const row of rows) {
    const shouldShow = checkRowFilterWithConfig(row, filterConfig, selectedValues);
    row.style.display = shouldShow ? '' : 'none';
    if (shouldShow) {visibleCount++;}
  }

  // Filter applied to

  // Update table count
  updateTableCount(containerId, visibleCount, rows.length);
}

/**
 * Check if a row should be shown based on filter configuration
 */
function checkRowFilterWithConfig(row, filterConfig, selectedValues) {
  // Show all if no filter values
  if (!selectedValues || selectedValues.length === 0) {
    return true;
  }

  // Special case for search
  if (filterConfig.searchAllColumns) {
    return checkSearchFilter(row, selectedValues[0]);
  }

  // Get column index for this filter type
  const columnIndex = getColumnIndexByConfig(row, filterConfig);
  if (columnIndex === -1) {return true;} // Show if column not found

  // Get cell value
  const cell = row.cells[columnIndex];
  if (!cell) {return true;}

  const cellValue = cell.textContent.trim();

  // Check data attributes for original values
  const dataField = filterConfig.dataField;
  let originalValue = cell.getAttribute(`data-${dataField}`);

  // For date filter, also check data-date attribute
  if (filterConfig.columnName === 'Date' && !originalValue) {
    originalValue = cell.getAttribute('data-date');
  }

  // Apply filter logic
  if (filterConfig.columnName === 'Date') {
    // For date filter, check both cell value and original value
    if (originalValue) {
      return checkDateFilter(originalValue, selectedValues[0]) || checkDateFilter(cellValue, selectedValues[0]);
    }
    return checkDateFilter(cellValue, selectedValues[0]);
  } else {
    // Check both original value and displayed value
    if (originalValue) {
      return selectedValues.some(value =>
        originalValue.toLowerCase() === value.toLowerCase() ||
        cellValue === value,
      );
    }
    return selectedValues.includes(cellValue);
  }
}

/**
 * Get column index by filter configuration
 */
function getColumnIndexByConfig(row, filterConfig) {
  const table = row.closest('table');
  if (!table) {return -1;}

  const headers = table.querySelectorAll('th');
  const columnName = filterConfig.columnName;

  // Define Hebrew translations for column names
  const hebrewTranslations = {
    'Status': ['סטטוס', 'Status'],
    'Investment Type': ['סוג השקעה', 'סוג', 'Investment Type'],
    'Account': ['חשבון', 'Account'],
    'Date': ['תאריך', 'Date', 'נוצר ב', 'נסגר ב', 'תאריך ביצוע', 'תאריך הפעלה', 'נוצר ב', 'תאריך'],
  };

  for (let i = 0; i < headers.length; i++) {
    const headerText = headers[i].textContent.trim();

    // Check exact match first
    if (headerText.includes(columnName)) {
      return i;
    }

    // Check Hebrew translations
    const translations = hebrewTranslations[columnName];
    if (translations) {
      for (const translation of translations) {
        if (headerText.includes(translation)) {
          return i;
        }
      }
    }
  }

  return -1;
}

window.applyFilterToTable = applyFilterToTable;

/**
 * Search in all columns of a table
 */
function searchInAllColumns(row, searchTerm, excludeColumns = []) {
  if (!searchTerm) {return true;}

  const cells = row.querySelectorAll('td');
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const header = cell.closest('table').querySelectorAll('th')[i];

    if (header && excludeColumns.includes(header.textContent.trim())) {
      continue; // Skip excluded columns
    }

    const cellText = cell.textContent.toLowerCase();
    if (cellText.includes(searchTerm.toLowerCase())) {
      return true;
    }
  }

  return false;
}

window.searchInAllColumns = searchInAllColumns;

/**
 * פילטר התראות לפי טיפוס (לשמירה על תאימות לאחור)
 * @param {string} type - סוג ההתראה (all, account, trade, trade_plan, ticker)
 */
function filterAlertsByType(type) {
  // filterAlertsByType called with

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
      btn.classList.remove('btn-outline-primary');
      btn.style.backgroundColor = 'white';
      btn.style.color = '#28a745';
      btn.style.borderColor = '#28a745';
    } else {
      btn.classList.remove('active');
      btn.classList.add('btn-outline-primary');
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  // הפעלת הפילטר
  if (type === 'all') {
    // הצג את כל ההתראות
    if (window.filterSystem) {
      window.filterSystem.clearTypeFilter();
    }
  } else {
    // הפעל פילטר לפי הטיפוס
    if (window.filterSystem) {
      window.filterSystem.applyTypeFilter([type]);
    }
  }
}

// ייצוא הפונקציה לגלובל
window.filterAlertsByType = filterAlertsByType;

// ===== פונקציות עדכון טקסט פילטרים =====

/**
 * עדכון טקסט פילטר סטטוס
 */
function updateStatusFilterText() {
  const selectedStatusElement = document.getElementById('selectedStatus');
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');

  if (selectedItems.length === 0) {
    selectedStatusElement.textContent = 'כל סטטוס';
  } else if (selectedItems.length === 1) {
    const item = selectedItems[0];
    const value = item.getAttribute('data-value');
    selectedStatusElement.textContent = value === 'הכול' ? 'כל סטטוס' : value;
  } else {
    selectedStatusElement.textContent = `${selectedItems.length} סטטוסים`;
  }
}

/**
 * עדכון טקסט פילטר טיפוס
 */
function updateTypeFilterText() {
  const selectedTypeElement = document.getElementById('selectedType');
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');

  if (selectedItems.length === 0) {
    selectedTypeElement.textContent = 'כל סוג השקעה';
  } else if (selectedItems.length === 1) {
    const item = selectedItems[0];
    const value = item.getAttribute('data-value');
    selectedTypeElement.textContent = value === 'הכול' ? 'כל סוג השקעה' : value;
  } else {
    selectedTypeElement.textContent = `${selectedItems.length} סוגי השקעה`;
  }
}

/**
 * עדכון טקסט פילטר חשבון
 */
function updateAccountFilterText() {
  const selectedAccountElement = document.getElementById('selectedAccount');
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');

  if (selectedItems.length === 0) {
    selectedAccountElement.textContent = 'כל חשבון';
  } else if (selectedItems.length === 1) {
    const item = selectedItems[0];
    const value = item.getAttribute('data-value');
    selectedAccountElement.textContent = value === 'הכול' ? 'כל חשבון' : value;
  } else {
    selectedAccountElement.textContent = `${selectedItems.length} חשבונות`;
  }
}

// ===== פונקציות איפוס ונקה =====

/**
 * איפוס כל הפילטרים למצב ברירת מחדל מהעדפות
 */
async function resetAllFilters() {


  try {
    // קבלת הגדרות ברירת מחדל מהשרת
    // Fetching default preferences from server
    const defaultStatusFilter = await getCurrentPreference('defaultStatusFilter') || 'all';
    const defaultTypeFilter = await getCurrentPreference('defaultTypeFilter') || 'all';
    const defaultAccountFilter = await getCurrentPreference('defaultAccountFilter') || 'all';
    const defaultDateRangeFilter = await getCurrentPreference('defaultDateRangeFilter') || 'all';
    const defaultSearchFilter = await getCurrentPreference('defaultSearchFilter') || '';

    // Default preferences loaded

    // About to call resetFiltersToDefaults with account value

    // הפעלת הפונקציה שמטפלת באיפוס לפי הגדרות
    resetFiltersToDefaults(defaultStatusFilter, defaultTypeFilter, defaultAccountFilter, defaultDateRangeFilter, defaultSearchFilter);

  } catch (error) {
    // שגיאה בקבלת הגדרות ברירת מחדל
    console.warn('⚠️ Using fallback reset');
    // Fallback - איפוס ידני
    resetFiltersManually();
  }
}

/**
 * ניקוי כל הפילטרים - הצגת כל הרשומות
 */
function clearAllFilters() {
  // clearAllFilters called - showing all records

  // קריאה לפונקציה החדשה שמנקה את כל הפילטרים
  if (window.filterSystem) {
    window.filterSystem.clearFilters();
  } else {
    console.warn('⚠️ filterSystem not available, using fallback');
    // Fallback - ניקוי ידני
    clearFiltersManually();
  }

  // קריאה לפונקציות הפילטר שלנו אם אנחנו בדף חשבונות
  if (window.resetAccountsFilters) {
    // Calling resetAccountsFilters for accounts page
    window.resetAccountsFilters();
  }

  // קריאה לפונקציות הפילטר שלנו אם אנחנו בדף ביצועים
  if (window.resetExecutionsFilters) {
    // Calling resetExecutionsFilters for executions page
    window.resetExecutionsFilters();
  }
}

// ייצוא פונקציות הפעלת פילטרים לגלובל
window.applyStatusFilter = applyStatusFilter;
window.applyTypeFilter = applyTypeFilter;
window.applyAccountFilter = applyAccountFilter;
window.applyDateRangeFilter = applyDateRangeFilter;

// ייצוא פונקציות איפוס ונקה לגלובל
window.resetAllFilters = resetAllFilters;
window.clearAllFilters = clearAllFilters;
window.resetFiltersToDefaults = resetFiltersToDefaults;

// ייצוא פונקציות עדכון טקסט לגלובל
window.updateStatusFilterText = updateStatusFilterText;
window.updateTypeFilterText = updateTypeFilterText;
window.updateAccountFilterText = updateAccountFilterText;

/**
 * זיהוי הקונטיינר הפעיל כרגע
 */
function getActiveTableContainer() {
  const visibleContainers = getVisibleContainers();
  if (visibleContainers.length > 0) {
    return visibleContainers[0]; // מחזיר את הראשון
  }
  return null;
}


// ייצוא פונקציה לגלובל
window.getActiveTableContainer = getActiveTableContainer;

/**
 * איפוס פילטרים לפי הגדרות ברירת מחדל
 */
function resetFiltersToDefaults(defaultStatus, defaultType, defaultAccount, defaultDateRange, defaultSearch) {
  // resetFiltersToDefaults called with

  // המרת ערכים מאנגלית לעברית
  const statusTranslation = {
    'all': 'הכול',
    'open': 'פתוח',
    'closed': 'סגור',
    'canceled': 'מבוטל',
  };

  const typeTranslation = {
    'all': 'הכול',
    'swing': 'סווינג',
    'investment': 'השקעה',
    'passive': 'פסיבי',
  };

  const dateRangeTranslation = {
    'all': 'כל זמן',
    'today': 'היום',
    'yesterday': 'אתמול',
    'this_week': 'השבוע',
    'last_week': 'שבוע קודם',
    'this_month': 'החודש',
    'last_month': 'חודש קודם',
    'this_year': 'השנה',
    'last_year': 'שנה קודמת',
  };

  // איפוס פילטר סטטוס
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => item.classList.remove('selected'));

  const statusValue = statusTranslation[defaultStatus] || 'הכול';
  // Looking for status value
  const selectedStatusItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === statusValue);
  if (selectedStatusItem) {
    selectedStatusItem.classList.add('selected');
    // Found and selected status item
  } else {
    // אם לא נמצא, בחר "הכול"
    const allStatusItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
    if (allStatusItem) {
      allStatusItem.classList.add('selected');
      // Status not found, selected "הכול"
    }
  }

  // איפוס פילטר טיפוס
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => item.classList.remove('selected'));

  const typeValue = typeTranslation[defaultType] || 'הכול';
  // Looking for type value
  const selectedTypeItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === typeValue);
  if (selectedTypeItem) {
    selectedTypeItem.classList.add('selected');
    // Found and selected type item
  } else {
    // אם לא נמצא, בחר "הכול"
    const allTypeItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
    if (allTypeItem) {
      allTypeItem.classList.add('selected');
      // Type not found, selected "הכול"
    }
  }

  // איפוס פילטר חשבון - נדלג על זה כרגע כי יש בעיות
  // Skipping account filter reset for now

  // איפוס פילטר תאריכים
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateRangeItems.forEach(item => item.classList.remove('selected'));

  const dateRangeValue = dateRangeTranslation[defaultDateRange] || 'כל זמן';
  // Looking for date range value
  const selectedDateRangeItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === dateRangeValue);
  if (selectedDateRangeItem) {
    selectedDateRangeItem.classList.add('selected');
    // Found and selected date range item
  } else {
    // אם לא נמצא, בחר "כל זמן"
    const allDateRangeItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === 'כל זמן');
    if (allDateRangeItem) {
      allDateRangeItem.classList.add('selected');
      // Date range not found, selected "כל זמן"
    }
  }

  // איפוס פילטר חיפוש
  const searchInput = document.querySelector('#searchFilterInput');
  if (searchInput) {
    searchInput.value = defaultSearch || '';
  }

  // עדכון טקסטים
  updateStatusFilterText();
  updateTypeFilterText();
  updateAccountFilterText();

  // עדכון טקסט פילטר תאריכים - הפעלת הפונקציה במקום עדכון ישיר
  const selectedDateRangeElement = document.getElementById('selectedDateRange');
  if (selectedDateRangeElement && dateRangeValue !== 'כל זמן') {
    // הפעלת הפונקציה שמטפלת בתרגום התאריכים
    selectDateRangeOption(dateRangeValue);
  } else if (selectedDateRangeElement) {
    selectedDateRangeElement.textContent = 'כל זמן';
  }

  // Filters reset to default preferences
}

/**
 * איפוס ידני של פילטרים (גיבוי)
 */
function resetFiltersManually() {
  // Manual reset filters fallback

  // איפוס פילטר סטטוס - בחירת "הכול"
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => item.classList.remove('selected'));
  const allStatusItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
  if (allStatusItem) {allStatusItem.classList.add('selected');}

  // איפוס פילטר טיפוס - בחירת "הכול"
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => item.classList.remove('selected'));
  const allTypeItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
  if (allTypeItem) {allTypeItem.classList.add('selected');}

  // איפוס פילטר חשבון - בחירת "הכול"
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  accountItems.forEach(item => item.classList.remove('selected'));
  const allAccountItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
  if (allAccountItem) {allAccountItem.classList.add('selected');}

  // איפוס פילטר תאריכים - בחירת "כל זמן"
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateRangeItems.forEach(item => item.classList.remove('selected'));
  const allDateRangeItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === 'כל זמן');
  if (allDateRangeItem) {allDateRangeItem.classList.add('selected');}

  // איפוס פילטר חיפוש
  const searchInput = document.querySelector('#searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
  }

  // עדכון טקסטים
  updateStatusFilterText();
  updateTypeFilterText();
  updateAccountFilterText();

  // עדכון טקסט פילטר תאריכים
  const selectedDateRangeElement = document.getElementById('selectedDateRange');
  if (selectedDateRangeElement) {
    selectedDateRangeElement.textContent = 'כל זמן';
  }
}

/**
 * ניקוי ידני של פילטרים (גיבוי)
 */
function clearFiltersManually() {
  // Manual clear filters fallback

  // הסרת סימון מכל הפילטרים
  document.querySelectorAll('#statusFilterMenu .status-filter-item.selected').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#typeFilterMenu .type-filter-item.selected').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#accountFilterMenu .account-filter-item.selected').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item.selected').forEach(item => item.classList.remove('selected'));

  // ניקוי פילטר חיפוש
  const searchInput = document.querySelector('#searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
  }

  // עדכון טקסטים
  updateStatusFilterText();
  updateTypeFilterText();
  updateAccountFilterText();

  // עדכון טקסט פילטר תאריכים
  const selectedDateRangeElement = document.getElementById('selectedDateRange');
  if (selectedDateRangeElement) {
    selectedDateRangeElement.textContent = 'כל זמן';
  }

  // קריאה לפונקציות הפילטר שלנו אם אנחנו בדף חשבונות
  if (window.resetAccountsFilters) {
    // Calling resetAccountsFilters for accounts page
    window.resetAccountsFilters();
  }
}

// ===== פונקציות עזר לפילטרים =====

/**
 * קבלת הגדרה נוכחית מהשרת
 */
async function getCurrentPreference(key) {
  try {
    const response = await fetch('/api/v1/preferences/');
    if (response.ok) {
      const preferences = await response.json();
      return preferences.user[key] || preferences.defaults[key];
    }
    return null;
  } catch (error) {
    // שגיאה בקבלת הגדרה
    return null;
  }
}

/**
 * קבלת חשבונות מ-localStorage
 */
function getAccountsFromStorage() {
  try {
    const accountsData = localStorage.getItem('tiktrack_accounts');
    if (accountsData) {
      const accounts = JSON.parse(accountsData);
      // Retrieved accounts from localStorage
      return accounts;
    }
    return null;
  } catch (error) {
    // שגיאה בקבלת חשבונות מ-localStorage
    return null;
  }
}

/**
 * טיפול באיפוס פילטר חשבונות
 */
function processAccountFilterReset(accountItems, defaultAccount) {
  // Processing account filter reset with defaultAccount
  // Account items to process

  // הדפסת כל החשבונות הזמינים
  // Available account items
  accountItems.forEach((item, index) => {
    const value = item.getAttribute('data-value');
    const id = item.getAttribute('data-account-id');
    // Account item details
  });

  accountItems.forEach(item => item.classList.remove('selected'));

  const accountValue = defaultAccount === 'all' ? 'הכול' : defaultAccount;
  // Looking for account value

  const selectedAccountItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === accountValue);
  if (selectedAccountItem) {
    selectedAccountItem.classList.add('selected');
    // Found and selected account item
  } else {
    // Account item not found for value
    // אם לא נמצא, בחר "הכול"
    const allAccountItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
    if (allAccountItem) {
      allAccountItem.classList.add('selected');
      // Account not found, selected "הכול"
    } else {
      // Even "הכול" account item not found!
    }
  }
}

/**
 * עדכון טקסט הצגת פילטר חשבונות
 */
function updateAccountFilterDisplayText() {
  // פונקציה זמנית - תוסיף לוגיקה בהמשך
  // עדכון טקסט פילטר חשבונות
}
// ייצוא הפונקציות
window.getCurrentPreference = getCurrentPreference;
window.updateAccountFilterDisplayText = updateAccountFilterDisplayText;

// ייצוא הפונקציה החדשה
window.applyFilter = applyFilter;

// ===== פונקציות פיתוח =====

/**
 * ניקוי Cache מהיר לפיתוח - גרסה משופרת
 */
async function clearDevelopmentCache(event) {
  // הגדרת המשתנה button בתחילת הפונקציה
  let button = null;

  try {
    console.log('🔄 מתחיל ניקוי Cache מקיף...');

    // מציאת הכפתור - קודם מנסה event.target, אחרת מחפש ב-DOM
    if (event && event.target) {
      button = event.target;
    } else {
      // חיפוש אחר הכפתור ב-DOM
      button = document.querySelector('[onclick*="clearDevelopmentCache"]') ||
               document.querySelector('a[onclick*="clearDevelopmentCache"]');
    }

    // אם עדיין לא מצאנו את הכפתור, נחפש לפי הטקסט
    if (!button) {
      button = document.querySelector('a:contains("נקה Cache (פיתוח)")') ||
               Array.from(document.querySelectorAll('a')).find(a =>
                 a.textContent.includes('נקה Cache (פיתוח)'),
               );
    }

    // לוג לבדיקה
    console.log('🔍 חיפוש כפתור:', {
      eventTarget: event?.target,
      foundButton: button,
      buttonText: button?.textContent,
      buttonHTML: button?.innerHTML,
    });

    // הצגת הודעת טעינה
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מנקה...';
      button.disabled = true;
      button.dataset.originalText = originalText;
    }

    // ===== שלב 1: ניקוי Cache של הדפדפן =====
    console.log('🧹 מנקה Cache של הדפדפן...');

    // ניקוי localStorage (רק פריטים שקשורים למערכת)
    try {
      const keysToKeep = ['user-preferences', 'theme', 'language', 'auth-token'];
      const allKeys = Object.keys(localStorage);
      let clearedLocalStorage = 0;

      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
          clearedLocalStorage++;
        }
      });
      console.log(`✅ localStorage נוקה: ${clearedLocalStorage} פריטים נמחקו`);
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות localStorage:', e);
    }

    // ניקוי sessionStorage
    try {
      const sessionKeys = Object.keys(sessionStorage);
      sessionStorage.clear();
      console.log(`✅ sessionStorage נוקה: ${sessionKeys.length} פריטים נמחקו`);
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות sessionStorage:', e);
    }

    // ניקוי IndexedDB
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name && !db.name.includes('system')) {
            await indexedDB.deleteDatabase(db.name);
            console.log(`🗑️ IndexedDB נמחק: ${db.name}`);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות IndexedDB:', e);
    }

    // ===== שלב 2: ניקוי Cache של השרת =====
    console.log('🔄 מנקה Cache של השרת...');
    const response = await fetch('/api/v1/cache/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cache של השרת נוקה בהצלחה:', result);
    } else {
      console.warn('⚠️ לא ניתן לנקות Cache של השרת:', response.status);
    }

    // ===== שלב 3: ניקוי Service Workers =====
    console.log('🧹 מנקה Service Workers...');
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('🗑️ Service Worker נמחק');
        }
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Service Workers:', e);
    }

    // ===== שלב 4: ניקוי Cache API =====
    console.log('🧹 מנקה Cache API...');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName)),
        );
        console.log(`✅ Cache API נוקה: ${cacheNames.length} caches נמחקו`);
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Cache API:', e);
    }

    // ===== שלב 5: ניקוי Application Cache =====
    try {
      if ('applicationCache' in window) {
        window.applicationCache.update();
        console.log('✅ Application Cache עודכן');
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Application Cache:', e);
    }

    // ===== שלב 6: ניקוי Memory Cache =====
    try {
      // ניקוי cache של fetch requests
      if (window.fetch && window.fetch.cache) {
        window.fetch.cache.clear();
        console.log('✅ Fetch cache נוקה');
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Fetch cache:', e);
    }

    // ===== שלב 7: ניקוי DOM Cache =====
    try {
      // ניקוי cache של תמונות
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          img.src = img.src + '?t=' + Date.now();
        }
      });
      console.log(`✅ ${images.length} תמונות נוקו מ-cache`);
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות תמונות:', e);
    }

    // ===== הצגת הודעת הצלחה =====
    console.log('🎉 כל סוגי ה-Cache נוקו בהצלחה!');

    // לוג לבדיקת מערכת ההתראות
    console.log('🔍 בדיקת מערכת התראות:', {
      showSuccessNotification: typeof window.showSuccessNotification,
      showNotification: typeof window.showNotification,
      notificationSystem: typeof window.notificationSystem,
    });

    if (typeof window.showSuccessNotification === 'function') {
      console.log('✅ קורא ל-showSuccessNotification');
      window.showSuccessNotification('הצלחה', 'Cache נוקה בהצלחה - כולל דפדפן ושרת');
    } else if (typeof window.showNotification === 'function') {
      console.log('✅ קורא ל-showNotification');
      window.showNotification('Cache נוקה בהצלחה - כולל דפדפן ושרת', 'success');
    } else {
      console.log('❌ מערכת התראות לא זמינה - רק console.log');
      console.log('✅ Cache נוקה בהצלחה - כולל דפדפן ושרת');
    }

    // ===== רענון הדף =====
    console.log('🔄 הדף ירענן בעוד 3 שניות...');

    if (typeof window.showInfoNotification === 'function') {
      console.log('✅ קורא ל-showInfoNotification - רענון בעוד 3 שניות');
      window.showInfoNotification('מידע', 'הדף ירענן בעוד 3 שניות...');
    } else {
      console.log('❌ showInfoNotification לא זמין');
    }

    setTimeout(() => {
      if (typeof window.showInfoNotification === 'function') {
        console.log('✅ קורא ל-showInfoNotification - רענון בעוד רגע');
        window.showInfoNotification('מידע', 'הדף ירענן בעוד רגע...');
      } else {
        console.log('❌ showInfoNotification לא זמין - רענון בעוד רגע');
      }
      setTimeout(() => {
        // forced reload - bypass all cache
        console.log('🔄 מבצע רענון כפוי של הדף...');
        window.location.reload(true);
      }, 1000);
    }, 3000);

  } catch (error) {
    console.error('❌ שגיאה כללית בניקוי Cache:', error);

    if (typeof window.showErrorNotification === 'function') {
      console.log('✅ קורא ל-showErrorNotification');
      window.showErrorNotification('שגיאה', 'שגיאה כללית בניקוי Cache: ' + error.message);
    } else {
      console.log('❌ showErrorNotification לא זמין - רק console.error');
      console.error('❌ שגיאה כללית בניקוי Cache');
    }
  } finally {
    // החזרת הכפתור למצב רגיל
    if (button) {
      const originalText = button.dataset.originalText || '<i class="fas fa-trash"></i> נקה Cache (פיתוח)';
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }
}

// ייצוא פונקציות פיתוח
window.clearDevelopmentCache = clearDevelopmentCache;

// Header System JS loaded completely
