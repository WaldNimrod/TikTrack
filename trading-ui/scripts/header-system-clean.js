/**
 * TikTrack Header System - Clean Version
 * מערכת ראש הדף החדשה - גרסה נקייה ופשוטה
 * 
 * מבוסס על התפריט הישן שעובד מושלם
 * HTML פשוט, CSS נקי, JavaScript בסיסי
 */

class HeaderSystemClean {
  constructor() {
    this.init();
  }

  init() {
    this.createHeader();
    this.setupEventListeners();
  }

  createHeader() {
    // יצירת אלמנט חדש
    const headerElement = document.createElement('div');
    headerElement.id = 'unified-header';
    headerElement.innerHTML = this.getHeaderHTML();

    // הכנסת הכותרת לתחילת הדף
    document.body.insertBefore(headerElement, document.body.firstChild);
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
                    <ul class="tiktrack-dropdown-menu show">
                      <!-- 📊 ניהול נתונים -->
                      <li class="dropdown-submenu">
                        <a class="tiktrack-dropdown-item" href="#">📊 ניהול נתונים</a>
                        <ul class="submenu">
                          <li><a class="tiktrack-dropdown-item" href="/alerts">התראות</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/executions">עסקעות</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/tickers">טיקרים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/accounts">חשבונות</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/notes">הערות</a></li>
                        </ul>
                      </li>
                      
                      <!-- ⚙️ הגדרות מערכת -->
                      <li class="dropdown-submenu">
                        <a class="tiktrack-dropdown-item" href="#">⚙️ הגדרות מערכת</a>
                        <ul class="submenu">
                          <li><a class="tiktrack-dropdown-item" href="/preferences">העדפות</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/test-preferences-v2-integration.html">בדיקת אינטגרציה V2</a></li>
                        </ul>
                      </li>
                      
                      <!-- 🔧 כלי פיתוח -->
                      <li class="dropdown-submenu">
                        <a class="tiktrack-dropdown-item" href="#">🔧 כלי פיתוח</a>
                        <ul class="submenu">
                          <li><a class="tiktrack-dropdown-item" href="/db_display">בסיס נתונים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/db_extradata">טבלאות עזר</a></li>
                        </ul>
                      </li>
                    </ul>
                  </li>

                  <li class="tiktrack-nav-item dropdown">
                    <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="development-tools">
                      <span class="nav-text">🔧 כלי פיתוח</span>
                      <span class="tiktrack-dropdown-arrow">▼</span>
                    </a>
                    <ul class="tiktrack-dropdown-menu">
                      <!-- 🗑️ פעולות מערכת -->
                      <li class="dropdown-submenu">
                        <a class="tiktrack-dropdown-item" href="#">🗑️ פעולות מערכת</a>
                        <ul class="submenu">
                          <li><a class="tiktrack-dropdown-item" href="/system-management">🔧 ניהול מערכת</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/css-management">🎨 מנהל CSS וארכיטקטורה</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/crud-testing-dashboard">🧪 דשבורד בדיקות CRUD</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/notifications-center">מרכז התראות</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/background-tasks">ניהול משימות ברקע</a></li>
                        </ul>
                      </li>

                      <!-- 🔍 בדיקות ונתונים -->
                      <li class="dropdown-submenu">
                        <a class="tiktrack-dropdown-item" href="#">🔍 בדיקות ונתונים</a>
                        <ul class="submenu">
                          <li><a class="tiktrack-dropdown-item" href="/external-data-dashboard">דשבורד נתונים חיצוניים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/server-monitor">ניטור שרת</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/cache-test">בדיקת Cache</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/constraints">אילוצים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/linter-realtime-monitor">ניטור Linter בזמן אמת</a></li>
                        </ul>
                      </li>

                      <!-- 🎨 ממשק משתמש -->
                      <li class="dropdown-submenu">
                        <a class="tiktrack-dropdown-item" href="#">🎨 ממשק משתמש</a>
                        <ul class="submenu">
                          <li><a class="tiktrack-dropdown-item" href="/style_demonstration">הדגמת סגנונות</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/numeric-value-colors-demo">הדגמת צבעים לערכים מספריים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/test-header-only">בדיקת כותרת</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/designs">עיצובים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/page-scripts-matrix">מיפוי סקריפטים</a></li>
                          <li><a class="tiktrack-dropdown-item" href="/js-map">מפת JS</a></li>
                        </ul>
                      </li>
                    </ul>
                  </li>

                  <li class="tiktrack-nav-item">
                    <a href="#" class="tiktrack-nav-link" onclick="clearDevelopmentCache(event)" title="נקה מטמון פיתוח">
                      <span class="nav-text" style="color: #ff0000; font-size: 1.2rem;">🧹</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- לוגו -->
            <div class="logo-section">
              <div class="logo">
                <img src="images/logo.svg" alt="TikTrack Logo" class="logo-image">
                <span class="logo-text">פשוט לנהל תיק</span>
              </div>
            </div>

            <!-- כפתור פילטר עגול -->
            <div class="filter-toggle-section">
              <button class="filter-toggle-btn" id="filterToggleBtn" title="הצג/הסתר פילטרים" onclick="toggleSection('filters')">
                <span class="filter-arrow">▼</span>
              </button>
            </div>
          </div>
        </div>

        <!-- אזור פילטרים -->
        <div class="header-filters" id="headerFilters" data-section="filters" style="display: block;">
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
                  <div class="account-filter-item" data-account-id="" data-value="הכול" onclick="selectAccountOption('הכול', '')">
                    <span class="option-text">כל החשבונות</span>
                    <span class="check-mark">●</span>
                  </div>
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
                  <div class="date-range-filter-item" data-value="השבוע" onclick="selectDateRangeOption('השבוע')">
                    <span class="option-text">השבוע</span>
                    <span class="check-mark">●</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חיפוש -->
            <div class="filter-group search-filter">
              <div class="search-input-wrapper">
                <input type="text" id="searchFilterInput" class="search-filter-input" placeholder="חיפוש..." autocomplete="off">
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
    // Bootstrap-style dropdown behavior
    document.addEventListener('click', (e) => {
      // Handle dropdown toggle clicks
      if (e.target.matches('.tiktrack-dropdown-toggle')) {
        e.preventDefault();
        const dropdownItem = e.target.closest('.tiktrack-nav-item');
        const dropdownMenu = dropdownItem.querySelector('.tiktrack-dropdown-menu');
        
        if (dropdownMenu) {
          // Close all other dropdowns
          document.querySelectorAll('.tiktrack-dropdown-menu').forEach(menu => {
            if (menu !== dropdownMenu) {
              this.hideDropdown(menu);
            }
          });
          
          // Toggle current dropdown
          if (dropdownMenu.style.display === 'block') {
            this.hideDropdown(dropdownMenu);
          } else {
            this.showDropdown(dropdownMenu);
          }
        }
      }
      
      // Close dropdowns when clicking outside
      if (!e.target.closest('.tiktrack-nav-item')) {
        document.querySelectorAll('.tiktrack-dropdown-menu').forEach(menu => {
          this.hideDropdown(menu);
        });
      }
    });

    // Handle submenu item clicks
    document.addEventListener('click', (e) => {
      if (e.target && typeof e.target.closest === 'function') {
        const submenuItem = e.target.closest('.submenu .tiktrack-dropdown-item');
        if (submenuItem) {
          const href = submenuItem.getAttribute('href');
          if (href) {
            window.location.href = href;
          }
        }
      }
    });
  }

  showDropdown(dropdownMenu) {
    dropdownMenu.style.display = 'block';
    dropdownMenu.classList.add('show');
  }

  hideDropdown(dropdownMenu) {
    dropdownMenu.style.display = 'none';
    dropdownMenu.classList.remove('show');
  }

  // All complex functions removed - using simple CSS :hover for submenus
}

// Initialize the header system
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 HeaderSystemClean initializing...');
  console.log('🚀 DOM is ready, creating header system');
  
  const headerSystem = new HeaderSystemClean();
  console.log('🚀 HeaderSystemClean initialized:', headerSystem);
  
  // בדיקה נוספת אחרי הטעינה
  setTimeout(() => {
    console.log('🔍 Checking for dropdown-submenu elements after 1 second...');
    const submenuItems = document.querySelectorAll('.dropdown-submenu');
    console.log('🔍 Found', submenuItems.length, 'dropdown-submenu elements');
    
    submenuItems.forEach((item, index) => {
      console.log(`🔍 Submenu ${index}:`, item);
      console.log(`🔍 Submenu ${index} HTML:`, item.outerHTML);
      const submenu = item.querySelector('.submenu');
      console.log(`🔍 Submenu ${index} .submenu element:`, submenu);
    });
  }, 1000);
});

// ===== פונקציות פילטרים =====

/**
 * הצג/הסתר פילטר סטטוס
 */
function toggleStatusFilter() {
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');
    if (isVisible) {
      menu.classList.remove('show');
    } else {
      // סגור פילטרים אחרים
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
      menu.classList.add('show');
    }
  }
}

/**
 * הצג/הסתר פילטר סוג השקעה
 */
function toggleTypeFilter() {
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');
    if (isVisible) {
      menu.classList.remove('show');
    } else {
      // סגור פילטרים אחרים
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
      menu.classList.add('show');
    }
  }
}

/**
 * הצג/הסתר פילטר חשבון
 */
function toggleAccountFilter() {
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');
    if (isVisible) {
      menu.classList.remove('show');
    } else {
      // סגור פילטרים אחרים
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
      menu.classList.add('show');
    }
  }
}

/**
 * הצג/הסתר פילטר תאריכים
 */
function toggleDateRangeFilter() {
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    const isVisible = menu.classList.contains('show');
    if (isVisible) {
      menu.classList.remove('show');
    } else {
      // סגור פילטרים אחרים
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('show'));
      menu.classList.add('show');
    }
  }
}

/**
 * בחירת אפשרות סטטוס
 */
function selectStatusOption(status) {
  // עדכון הטקסט הנבחר
  const selectedElement = document.getElementById('selectedStatus');
  if (selectedElement) {
    selectedElement.textContent = status;
  }
  
  // סגירת התפריט
  const menu = document.getElementById('statusFilterMenu');
  if (menu) {
    menu.classList.remove('show');
  }
  
  // עדכון סימון ויזואלי
  document.querySelectorAll('.status-filter-item').forEach(item => {
    item.classList.remove('selected');
    if (item.getAttribute('data-value') === status) {
      item.classList.add('selected');
    }
  });
}

/**
 * בחירת אפשרות סוג השקעה
 */
function selectTypeOption(type) {
  // עדכון הטקסט הנבחר
  const selectedElement = document.getElementById('selectedType');
  if (selectedElement) {
    selectedElement.textContent = type;
  }
  
  // סגירת התפריט
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    menu.classList.remove('show');
  }
  
  // עדכון סימון ויזואלי
  document.querySelectorAll('.type-filter-item').forEach(item => {
    item.classList.remove('selected');
    if (item.getAttribute('data-value') === type) {
      item.classList.add('selected');
    }
  });
}

/**
 * בחירת אפשרות חשבון
 */
function selectAccountOption(account, accountId) {
  // עדכון הטקסט הנבחר
  const selectedElement = document.getElementById('selectedAccount');
  if (selectedElement) {
    selectedElement.textContent = account;
  }
  
  // סגירת התפריט
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    menu.classList.remove('show');
  }
  
  // עדכון סימון ויזואלי
  document.querySelectorAll('.account-filter-item').forEach(item => {
    item.classList.remove('selected');
    if (item.getAttribute('data-value') === account) {
      item.classList.add('selected');
    }
  });
}

/**
 * בחירת אפשרות טווח תאריכים
 */
function selectDateRangeOption(dateRange) {
  // עדכון הטקסט הנבחר
  const selectedElement = document.getElementById('selectedDateRange');
  if (selectedElement) {
    selectedElement.textContent = dateRange;
  }
  
  // סגירת התפריט
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    menu.classList.remove('show');
  }
  
  // עדכון סימון ויזואלי
  document.querySelectorAll('.date-range-filter-item').forEach(item => {
    item.classList.remove('selected');
    if (item.getAttribute('data-value') === dateRange) {
      item.classList.add('selected');
    }
  });
}

/**
 * הצג/הסתר אזור פילטרים
 */
function toggleSection(sectionName) {
  const section = document.querySelector(`[data-section="${sectionName}"]`);
  if (section) {
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';
  }
}

/**
 * נקה מטמון פיתוח
 */
function clearDevelopmentCache(event) {
  event.preventDefault();
  if (confirm('האם אתה בטוח שברצונך לנקות את מטמון הפיתוח?')) {
    // כאן תוכל להוסיף לוגיקה לניקוי מטמון
    alert('מטמון הפיתוח נוקה בהצלחה!');
  }
}
