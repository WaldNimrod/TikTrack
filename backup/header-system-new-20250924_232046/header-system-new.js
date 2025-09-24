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

    // הוספת כפתור הפילטר מחוץ ל-header
    const filterToggleSection = document.createElement('div');
    filterToggleSection.className = 'filter-toggle-section';
    filterToggleSection.innerHTML = `
      <button class="filter-toggle-btn" id="filterToggleBtn" title="הצג/הסתר פילטרים" 
              onclick="toggleSection('filters')">
        <span class="filter-arrow">▼</span>
      </button>
    `;
    document.body.appendChild(filterToggleSection);

    // הוספת התוכן לאלמנט
    const headerHTML = HeaderSystem.getHeaderHTML();
    headerElement.innerHTML = headerHTML;
  }

  static getHeaderHTML() {
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
                        onclick="toggleStatusFilter()">
                  <span class="selected-value selected-status-text" id="selectedStatus">כל סטטוס</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="statusFilterMenu">
                  <div class="status-filter-item" data-value="הכול">
                    <span class="option-text">הכול</span>
                  </div>
                  <div class="status-filter-item" data-value="פתוח">
                    <span class="option-text">פתוח</span>
                  </div>
                  <div class="status-filter-item" data-value="סגור">
                    <span class="option-text">סגור</span>
                  </div>
                  <div class="status-filter-item" data-value="מבוטל">
                    <span class="option-text">מבוטל</span>
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
                  <div class="type-filter-item" data-value="הכול">
                    <span class="option-text">הכול</span>
                  </div>
                  <!-- סוגי השקעות -->
                  <div class="type-filter-item" data-value="סווינג">
                    <span class="option-text">סווינג</span>
                  </div>
                  <div class="type-filter-item" data-value="השקעה">
                    <span class="option-text">השקעה</span>
                  </div>
                  <div class="type-filter-item" data-value="פסיבי">
                    <span class="option-text">פסיבי</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חשבון -->
            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle account-filter-toggle" id="accountFilterToggle" 
                        onclick="toggleAccountFilter()">
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
                        onclick="toggleDateRangeFilter()">
                  <span class="selected-value selected-date-text" id="selectedDateRange">כל זמן</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="dateRangeFilterMenu">
                  <div class="date-range-filter-item" data-value="כל זמן">
                    <span class="option-text">כל זמן</span>
                  </div>
                  <div class="date-range-filter-item" data-value="היום">
                    <span class="option-text">היום</span>
                  </div>
                  <div class="date-range-filter-item" data-value="אתמול">
                    <span class="option-text">אתמול</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השבוע">
                    <span class="option-text">השבוע</span>
                  </div>
                  <div class="date-range-filter-item" data-value="החודש">
                    <span class="option-text">החודש</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השנה">
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
              <button class="filter-action-btn reset-btn" onclick="resetAllFilters()" title="איפוס פילטרים">
                <span class="btn-text">איפוס</span>
              </button>
              <button class="filter-action-btn clear-btn" onclick="clearAllFilters()" title="נקה כל הפילטרים">
                <span class="btn-text">נקה</span>
              </button>
              <button class="filter-action-btn cache-btn" onclick="clearDevelopmentCache(event)" title="נקה מטמון">
                <span class="btn-text">מטמון</span>
              </button>
            </div>
          </div>
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

      .header-top {
        padding: 15px 0;
      }

      .header-container {
        max-width: 1200px;
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
        color: white;
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
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1002;
      }

      .filter-toggle-btn {
        background: rgba(255,255,255,0.9);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .filter-toggle-btn:hover {
        background: white;
        transform: scale(1.1);
      }

      .filter-arrow {
        font-size: 20px;
        color: #667eea;
        transition: transform 0.3s ease;
      }

      .filter-toggle-btn.collapsed .filter-arrow {
        transform: rotate(-90deg);
      }

      /* Filter Styles */
      .header-filters {
        background: rgba(255,255,255,0.95);
        padding: 20px;
        border-top: 1px solid rgba(255,255,255,0.2);
        display: none;
      }

      .filters-container {
        max-width: 1200px;
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
        padding: 10px 15px;
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
        padding: 12px 15px;
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
        background: #667eea;
        color: white;
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
        padding: 10px 40px 10px 15px;
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
        background: #28a745;
        color: white;
      }

      .reset-btn:hover {
        background: #218838;
        transform: translateY(-2px);
      }

      .clear-btn {
        background: #dc3545;
        color: white;
      }

      .clear-btn:hover {
        background: #c82333;
        transform: translateY(-2px);
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
}

// Global functions for compatibility with existing system
window.toggleSection = function(sectionId) {
  const section = document.getElementById('headerFilters');
  if (section) {
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';
    
    const toggleBtn = document.getElementById('filterToggleBtn');
    const arrow = toggleBtn ? toggleBtn.querySelector('.filter-arrow') : null;
    
    if (toggleBtn && arrow) {
      if (isVisible) {
        arrow.textContent = '▶';
        toggleBtn.classList.add('collapsed');
      } else {
        arrow.textContent = '▼';
        toggleBtn.classList.remove('collapsed');
      }
    }
  }
};

// Initialize the header system
document.addEventListener('DOMContentLoaded', function() {
  if (typeof HeaderSystem === 'function') {
    window.headerSystem = new HeaderSystem();
    window.headerSystem.init();
  } else {
    console.error('❌ HeaderSystem class not found');
  }
});

console.log('✅ Header System v6.0.0 loaded successfully!');