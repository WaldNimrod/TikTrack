// פונקציה לטעינת התפריט
async function loadMenu() {
  try {
    console.log('Loading menu...');
    const response = await fetch('menu.html');
    console.log('Menu response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const menuHtml = await response.text();
    console.log('Menu HTML loaded, length:', menuHtml.length);

    // הכנסת התפריט בתחילת הדף
    document.body.insertAdjacentHTML('afterbegin', menuHtml);
    console.log('Menu inserted into page');

    // הגדרת הפריט הפעיל לפי הדף הנוכחי
    setActiveMenuItem();

    // הוספת event listeners לכפתורי הניווט
    addMenuEventListeners();

    // הוספת event listeners לתפריט הנפתח
    addDropdownEventListeners();

    console.log('Menu loaded successfully');

  } catch (error) {
    console.error('שגיאה בטעינת התפריט:', error);
    // יצירת תפריט בסיסי במקרה של שגיאה
    createBasicMenu();
  }
}

// פונקציה ליצירת תפריט בסיסי במקרה של שגיאה
function createBasicMenu() {
  console.log('Creating basic menu...');
  const basicMenu = `
    <div class="main-header">
      <div class="header-container">
        <div class="logo-section">
          <span class="logo-text">פשוט לנהל תיק</span>
          <img src="images/tiktrack_logo_128px.png" alt="SimpleTrade Logo" class="logo-icon">
        </div>
        
        <nav class="nav-menu">
          <a href="/" class="nav-item" data-page="home">
            <span class="nav-icon home-icon">🏡</span>
          </a>
          
          <a href="/planning" class="nav-item" data-page="planning">
            <span class="nav-text">תכנון</span>
          </a>
          
          <a href="/trades" class="nav-item" data-page="trades">
            <span class="nav-text">מעקב</span>
          </a>
          
          <a href="/research" class="nav-item" data-page="research">
            <span class="nav-text">תחקיר</span>
          </a>
          
          <div class="dropdown">
            <a href="#" class="nav-item dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-page="settings">
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
              <li><a class="dropdown-item" href="/grid-test">גריד</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', basicMenu);
  console.log('Basic menu created');
}

// פונקציה להגדרת הפריט הפעיל
function setActiveMenuItem() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');

  // הסרת active מכל הפריטים
  navItems.forEach(item => item.classList.remove('active'));

  // הגדרת הפריט הפעיל לפי הנתיב הנוכחי
  if (currentPath === '/' || currentPath === '/index.html') {
    document.querySelector('[data-page="home"]')?.classList.add('active');
  } else if (currentPath === '/planning') {
    document.querySelector('[data-page="planning"]')?.classList.add('active');
  } else if (currentPath === '/trades') {
    document.querySelector('[data-page="trades"]')?.classList.add('active');
  } else if (currentPath === '/research') {
    document.querySelector('[data-page="research"]')?.classList.add('active');
  } else if (currentPath === '/settings') {
    document.querySelector('[data-page="settings"]')?.classList.add('active');
  } else if (currentPath === '/database') {
    document.querySelector('[data-page="settings"]')?.classList.add('active');
  } else if (currentPath === '/preferences') {
    document.querySelector('[data-page="settings"]')?.classList.add('active');
  } else if (currentPath === '/accounts') {
    document.querySelector('[data-page="settings"]')?.classList.add('active');
  } else if (currentPath === '/notes') {
    document.querySelector('[data-page="settings"]')?.classList.add('active');
  } else if (currentPath === '/alerts') {
    document.querySelector('[data-page="settings"]')?.classList.add('active');
  }
}

// פונקציה להוספת event listeners
function addMenuEventListeners() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // הסרת active מכל הפריטים
      navItems.forEach(nav => nav.classList.remove('active'));
      // הוספת active לפריט הנוכחי
      item.classList.add('active');
    });
  });
}

// פונקציה לסגירת התפריט הנפתח
function closeDropdown() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (dropdownToggle && dropdownMenu) {
    // ניסיון לסגור עם Bootstrap
    try {
      const dropdown = new bootstrap.Dropdown(dropdownToggle);
      dropdown.hide();
    } catch (e) {
      // אם Bootstrap לא עובד, סגירה ידנית
      dropdownMenu.classList.remove('show');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }


}

// פונקציה להוספת event listeners לתפריט הנפתח
function addDropdownEventListeners() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  if (dropdownToggle && dropdownMenu) {
    // סגירת התפריט כשלוחצים על פריט
    dropdownItems.forEach(item => {
      item.addEventListener('click', () => {
        closeDropdown();
      });
    });

    // סגירת התפריט כשלוחצים מחוץ לו
    document.addEventListener('click', (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        closeDropdown();
      }
    });

    // סגירת התפריט כשלוחצים על מקש Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    // סגירת התפריט כשלוחצים על מקש Tab
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        closeDropdown();
      }
    });

    // סגירת התפריט כשמחליפים דף
    window.addEventListener('beforeunload', () => {
      closeDropdown();
    });
  }
}







// פונקציה להצגת התראות
window.showNotification = function (message, type = 'info') {
  // יצירת התראה זמנית
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  if (type === 'success') {
    notification.style.background = '#29a6a8';
  } else if (type === 'error') {
    notification.style.background = '#dc3545';
  } else {
    notification.style.background = '#6c757d';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}







// הוספת סגנונות CSS להתראות
function addNotificationStyles() {
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}



// פונקציות לפילטר סטטוס
window.toggleStatusFilter = function () {
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');
  const filterSection = document.getElementById('statusFilterSection');

  if (!menu || !toggle || !filterSection) return;

  if (menu.classList.contains('show')) {
    // סגירת התפריט
    menu.classList.remove('show');
    toggle.classList.remove('active');
    filterSection.style.minHeight = '30px';
  } else {
    // פתיחת התפריט - הגדלת הפילטר
    menu.classList.add('show');
    toggle.classList.add('active');
    filterSection.style.minHeight = '220px';
  }

  updateStatusFilterDisplayText();

  // מניעת סגירת הדרופדאון רק בלחיצה על הכפתור - לא בלחיצה מחוץ לו
  if (event) {
    event.stopPropagation();
  }
}

// פונקציה לסגירת הדרופדאון של הפילטר בלחיצה על כפתור סגירה
window.closeStatusFilter = function () {
  const menu = document.getElementById('statusFilterMenu');
  const toggle = document.querySelector('.status-filter-toggle');
  const filterSection = document.getElementById('statusFilterSection');

  if (menu && toggle && filterSection) {
    menu.classList.remove('show');
    toggle.classList.remove('active');
    filterSection.style.minHeight = '30px';
  }

  // מניעת סגירת הדרופדאון רק בלחיצה על כפתור הסגירה - לא בלחיצה מחוץ לו
  if (event) {
    event.stopPropagation();
  }
}

window.selectStatusOption = function (status) {
  const menu = document.getElementById('statusFilterMenu');
  if (!menu) return;

  const item = Array.from(menu.querySelectorAll('.status-filter-item'))
    .find(item => item.querySelector('.option-text').textContent === status);

  if (item) {
    item.classList.toggle('selected');
    updateStatusFilterDisplayText();

    // עדכון אוטומטי של הגריד
    const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
    const selectedValues = Array.from(selectedItems)
      .map(item => item.querySelector('.option-text').textContent);

    console.log('Selected statuses:', selectedValues);

    // עדכון ישיר של הגריד
    if (typeof gridApi !== 'undefined' && gridApi) {
      if (selectedValues.length === 0 || selectedValues.length === 3) {
        // אם לא נבחרו סטטוסים או נבחרו כולם - הצג הכל
        if (typeof window.rowData !== 'undefined') {
          gridApi.setRowData(window.rowData);
        }
        console.log('Showing all statuses');
      } else {
        // סינון הנתונים לפי הסטטוסים הנבחרים
        if (typeof window.rowData !== 'undefined') {
          const filteredData = window.rowData.filter(row => selectedValues.includes(row.status));
          gridApi.setRowData(filteredData);
          console.log('Filter applied for statuses:', selectedValues, 'Showing', filteredData.length, 'rows');
        }
      }
    } else {
      console.log('Grid API not available');
    }

    // עדכון הצ'קבוקסים בדף הגריד
    if (typeof updateTestCheckboxes === 'function') {
      updateTestCheckboxes(selectedValues);
    }

    // מניעת סגירת הדרופדאון
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}

window.updateStatusFilterDisplayText = function () {
  const menu = document.getElementById('statusFilterMenu');
  if (!menu) return;

  const toggle = menu.previousElementSibling;
  if (!toggle) return;

  const selectedText = toggle.querySelector('.selected-status-text');
  if (!selectedText) return;

  const selectedItems = menu.querySelectorAll('.status-filter-item.selected');

  const selectedValues = Array.from(selectedItems)
    .map(item => item.querySelector('.option-text').textContent);

  if (selectedValues.length === 0) {
    selectedText.textContent = 'כל הסטטוסים';
  } else if (selectedValues.length === menu.querySelectorAll('.status-filter-item').length) {
    selectedText.textContent = 'כל הסטטוסים';
  } else {
    selectedText.textContent = selectedValues.join(', ');
  }
}

window.applyStatusFilter = function () {
  const menu = document.getElementById('statusFilterMenu');
  if (!menu) return;

  const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
  const selectedValues = Array.from(selectedItems)
    .map(item => item.querySelector('.option-text').textContent);

  console.log('Applying status filter:', selectedValues);

  // עדכון ישיר של הגריד
  if (typeof gridApi !== 'undefined' && gridApi) {
    if (selectedValues.length === 0 || selectedValues.length === 3) {
      // אם לא נבחרו סטטוסים או נבחרו כולם - הצג הכל
      if (typeof window.rowData !== 'undefined') {
        gridApi.setRowData(window.rowData);
      }
      console.log('Showing all statuses');
    } else {
      // סינון הנתונים לפי הסטטוסים הנבחרים
      if (typeof window.rowData !== 'undefined') {
        const filteredData = window.rowData.filter(row => selectedValues.includes(row.status));
        gridApi.setRowData(filteredData);
        console.log('Filter applied for statuses:', selectedValues, 'Showing', filteredData.length, 'rows');
      }
    }
  } else {
    console.log('Grid API not available');
  }

  // עדכון הצ'קבוקסים בדף הגריד
  if (typeof updateTestCheckboxes === 'function') {
    updateTestCheckboxes(selectedValues);
  }


}

window.clearStatusFilter = function () {
  const menu = document.getElementById('statusFilterMenu');
  if (!menu) return;

  // בחירת כל האפשרויות
  menu.querySelectorAll('.status-filter-item').forEach(item => {
    item.classList.add('selected');
  });

  updateStatusFilterDisplayText();

  // ניקוי הפילטר מהגריד
  if (typeof gridApi !== 'undefined' && gridApi) {
    if (typeof window.rowData !== 'undefined') {
      gridApi.setRowData(window.rowData);
    }
    console.log('Grid filter cleared');
  }

  console.log('Status filter cleared');


}

window.toggleFilterSection = function () {
  const filterSection = document.getElementById('statusFilterSection');
  const backgroundWrapper = document.querySelector('.background-wrapper');

  if (!filterSection) return;

  if (filterSection.classList.contains('collapsed')) {
    // פתיחת הפילטר
    filterSection.classList.remove('collapsed');

    // עדכון המרווח
    if (backgroundWrapper) {
      backgroundWrapper.classList.remove('filter-collapsed');
    }

  } else {
    // סגירת הפילטר
    filterSection.classList.add('collapsed');

    // עדכון המרווח
    if (backgroundWrapper) {
      backgroundWrapper.classList.add('filter-collapsed');
    }
  }

  // מניעת סגירת הדרופדאון רק בלחיצה על החץ - לא בלחיצה מחוץ לו
  if (event) {
    event.stopPropagation();
  }
}

// סגירת דרופדאון בלחיצה מחוץ לו
document.addEventListener('click', (e) => {
  const statusFilterDropdown = document.querySelector('.status-filter-dropdown');
  const statusFilterMenu = document.getElementById('statusFilterMenu');

  // בדיקה אם זה לא הדרופדאון של הפילטר
  if (statusFilterDropdown && !statusFilterDropdown.contains(e.target)) {
    // סגירת דרופדאונים אחרים (לא הפילטר)
    const otherDropdowns = document.querySelectorAll('.dropdown-menu');
    otherDropdowns.forEach(dropdown => {
      if (dropdown !== statusFilterMenu && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    });
  }

  // סגירת פילטרים בלחיצה מחוץ להם
  if (typeof window.closeAllFilters === 'function') {
    // בדיקה אם הלחיצה היא מחוץ לפילטרים
    const header = document.querySelector('app-header');
    if (header && !header.shadowRoot.contains(e.target)) {
      window.closeAllFilters();
    }
  }
});

// מניעת סגירת הדרופדאון של הפילטר בלחיצה על פריטים בתוכו
document.addEventListener('click', (e) => {
  const statusFilterMenu = document.getElementById('statusFilterMenu');
  if (statusFilterMenu && statusFilterMenu.contains(e.target)) {
    e.stopPropagation();
  }
});

// מניעת סגירת הדרופדאון של הפילטר בלחיצה על מקש Escape
document.addEventListener('keydown', (e) => {
  const statusFilterMenu = document.getElementById('statusFilterMenu');
  if (statusFilterMenu && statusFilterMenu.classList.contains('show') && e.key === 'Escape') {
    e.stopPropagation();
  }
});

// מניעת סגירת הדרופדאון של הפילטר בלחיצה על מקש Tab
document.addEventListener('keydown', (e) => {
  const statusFilterMenu = document.getElementById('statusFilterMenu');
  if (statusFilterMenu && statusFilterMenu.classList.contains('show') && e.key === 'Tab') {
    e.stopPropagation();
  }
});

// מניעת סגירת הדרופדאון של הפילטר בלחיצה על מקש Enter
document.addEventListener('keydown', (e) => {
  const statusFilterMenu = document.getElementById('statusFilterMenu');
  if (statusFilterMenu && statusFilterMenu.classList.contains('show') && e.key === 'Enter') {
    e.stopPropagation();
  }
});

// מניעת סגירת הדרופדאון של הפילטר בלחיצה על מקש Space
document.addEventListener('keydown', (e) => {
  const statusFilterMenu = document.getElementById('statusFilterMenu');
  if (statusFilterMenu && statusFilterMenu.classList.contains('show') && e.key === ' ') {
    e.stopPropagation();
  }
});

// סגירת פילטרים בלחיצה על מקש Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (typeof window.closeAllFilters === 'function') {
      window.closeAllFilters();
    }
  }
});

// טעינת התפריט בעת טעינת הדף
document.addEventListener('DOMContentLoaded', function () {
  loadMenu();
  addNotificationStyles();

  // אתחול הפילטר - בחירת כל האפשרויות
  setTimeout(() => {
    const menu = document.getElementById('statusFilterMenu');
    if (menu) {
      menu.querySelectorAll('.status-filter-item').forEach(item => {
        item.classList.add('selected');
      });
      updateStatusFilterDisplayText();

      // עדכון הגריד עם כל הסטטוסים
      if (typeof gridApi !== 'undefined' && gridApi) {
        gridApi.setFilterModel(null);
        console.log('Grid initialized with all statuses');
      }
    }
  }, 500);

  // אתחול נוסף לאחר זמן ארוך יותר לוודא שהגריד נטען
  setTimeout(() => {
    const menu = document.getElementById('statusFilterMenu');
    if (menu) {
      console.log('Late filter initialization...');
      if (typeof gridApi !== 'undefined' && gridApi) {
        gridApi.setFilterModel(null);
        console.log('Grid filter reset to show all');
      }
    }
  }, 2000);

  // בדיקה תקופתית של זמינות הגריד
  const checkGridInterval = setInterval(() => {
    if (typeof gridApi !== 'undefined' && gridApi) {
      console.log('Grid API is available, clearing interval');
      clearInterval(checkGridInterval);

      // אתחול הפילטר
      const menu = document.getElementById('statusFilterMenu');
      if (menu) {
        menu.querySelectorAll('.status-filter-item').forEach(item => {
          item.classList.add('selected');
        });
        updateStatusFilterDisplayText();
        gridApi.setFilterModel(null);
        console.log('Grid filter initialized successfully');
      }
    }

    // עצירת הבדיקה לאחר 10 שניות
    setTimeout(() => {
      clearInterval(checkGridInterval);
      console.log('Grid API check timeout');
    }, 10000);
  }, 100);
});
