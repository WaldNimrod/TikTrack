/**
 * ========================================
 * Web Component - AppHeader
 * ========================================
 * 
 * קומפוננט כותרת האתר עם מערכת פילטרים גלובלית
 * 
 * תכונות עיקריות:
 * - ניווט בין דפים
 * - מערכת פילטרים גלובלית (סטטוס, סוג, חשבון, תאריכים, חיפוש)
 * - שמירת מצב פילטרים ב-localStorage
 * - תמיכה בדפים שונים עם פילטרים מותאמים
 * - כפתור רענון לאיפוס פילטרים
 * 
 * דפים נתמכים:
 * - notes - הערות (פילטרים רלוונטיים: תאריכים, חיפוש)
 * - designs - עיצובים (כל הפילטרים)
 * - tracking - מעקב (כל הפילטרים)
 * - accounts - חשבונות (פילטרים רלוונטיים: סטטוס, חיפוש, תאריכים)
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// Web Component עבור כותרת האתר
class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    console.log('AppHeader connectedCallback called');
    this.render();
    this.setupEventListeners();
    this.initializeFilter();
    
    // טעינת חשבונות בכל הדפים שצריכים פילטר חשבונות
    const currentPage = window.location.pathname;
    const pagesNeedingAccounts = ['/planning.html', '/tracking.html', '/database.html', '/planning', '/tracking', '/database'];
    
    if (pagesNeedingAccounts.some(page => currentPage.includes(page))) {
      console.log('🔄 Page needs accounts, loading...');
      // ודא שקובץ accounts.js נטען לפני ניסיון שימוש בפונקציות שלו
      const ensureAccountsReady = () => {
        if (typeof window.loadAllAccountsFromServer === 'function' && typeof window.updateAccountFilterMenu === 'function') {
          console.log('🔄 Accounts functions available, loading all accounts...');
          window.loadAllAccountsFromServer().then((allAccounts) => {
            if (allAccounts && allAccounts.length > 0) {
              console.log('🔄 All accounts loaded, updating menu...');
              window.updateAccountFilterMenu(allAccounts);
            }
          }).catch((error) => {
            console.log('🔄 Error loading all accounts:', error);
            // fallback לפונקציה הישנה
            if (typeof window.loadAccountsFromServer === 'function') {
              window.loadAccountsFromServer().then(() => {
                if (window.accountsData) {
                  window.updateAccountFilterMenu(window.accountsData);
                }
              });
            }
          });
        } else {
          console.log('🔄 Accounts functions not available yet, retrying...');
          // נסה שוב מעט מאוחר יותר
          setTimeout(ensureAccountsReady, 200);
        }
      };
      ensureAccountsReady();
    } else {
      console.log('🔄 Skipping accounts loading - not needed on this page');
    }
    
    // אתחול Bootstrap Dropdown אם זמין
    this.initializeBootstrapDropdown();
    console.log('AppHeader initialization completed');
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
        .main-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 5px 15px;
        }

        .header-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0;
          min-height: 43px;
        }

        /* Navigation Menu */
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 20px;
          list-style: none;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          text-decoration: none;
          color: #333;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .nav-item:hover {
          background-color: #f0f0f0;
          color: #29a6a8;
        }

        .nav-item.active {
          background-color: transparent;
          color: #29a6a8;
          box-shadow: 0 2px 8px rgba(41, 166, 168, 0.3);
        }

        .nav-icon {
          font-size: 1.1rem;
        }

        .nav-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
        }

        /* Logo Section */
        .logo-section {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          flex-direction: row-reverse;
        }

        .logo-icon {
          width: auto;
          height: 40px;
          object-fit: contain;
          margin-bottom: 5px;
        }

        .logo-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #29a6a8;
          padding-top: 25px;
        }

        /* Dropdown */
        .dropdown {
          position: relative;
        }

        .dropdown-toggle {
          cursor: pointer;
        }

        .dropdown-arrow {
          font-size: 0.8rem;
          margin-right: 4px;
          transition: transform 0.2s ease;
        }

        .account-filter-toggle.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        .status-filter-toggle.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        .type-filter-toggle.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          width: auto;
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          margin-top: 5px;
          padding: 0.5rem 0;
        }

        .dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-menu li {
          list-style: none;
        }

        .dropdown-item {
          display: block;
          padding: 10px 16px;
          text-decoration: none;
          color: #333;
          transition: background-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          white-space: nowrap;
          min-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #29a6a8;
        }

        .dropdown-divider {
          margin: 0.5rem 0;
          border: none;
          border-top: 1px solid #e8e8e8;
        }

        /* Status Filter Section */
        .status-filter-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-top: 1px solid #e8e8e8;
          padding: 10px 0;
          transition: all 0.3s ease;
          position: relative;
        }

        .status-filter-section.collapsed {
          padding: 0;
          min-height: 0;
          max-height: 0;
          overflow: hidden;
        }

        .status-filter-section.collapsed .filter-collapse-arrow {
          position: fixed;
          top: 45px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
        }

        .filter-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .filter-content-wrapper {
          position: relative;
        }

        .filter-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .filter-group {
          display: flex;
          align-items: flex-start;
          gap: 45px;
        }

        .status-filter-container {
          position: relative;
        }

        .status-filter-dropdown {
          position: relative;
        }

        .type-filter-container {
          position: relative;
        }

        .type-filter-dropdown {
          position: relative;
        }

        .status-filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          min-width: 120px;
          white-space: nowrap;
          overflow: hidden;
        }

        .status-filter-toggle:hover {
          border-color: #29a6a8;
        }

        .status-filter-toggle.active {
          border-color: #29a6a8;
          background-color: #f0f8f8;
        }

        /* Type Filter Styles */
        .type-filter-container {
          position: relative;
        }

        .type-filter-dropdown {
          position: relative;
        }

        .type-filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          min-width: 120px;
          white-space: nowrap;
          overflow: hidden;
        }

        .type-filter-toggle:hover {
          border-color: #29a6a8;
        }

        .type-filter-toggle.active {
          border-color: #29a6a8;
          background-color: #f0f8f8;
        }

        /* Account Filter Styles */
        .account-filter-container {
          position: relative;
        }

        .account-filter-dropdown {
          position: relative;
        }

        .account-filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          min-width: 140px;
          white-space: nowrap;
          overflow: hidden;
        }

        .account-filter-toggle:hover {
          border-color: #29a6a8;
        }

        .account-filter-toggle.active {
          border-color: #29a6a8;
          background-color: #f0f8f8;
        }

        .selected-status-text,
        .selected-type-text,
        .selected-account-text,
        .selected-date-range-text {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .filter-actions {
          display: flex;
          gap: 10px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .filter-btn-primary {
          background-color: #29a6a8;
          color: white;
        }

        .filter-btn-primary:hover {
          background-color: #238a8c;
        }

        .filter-btn-secondary {
          background-color: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;
        }

        .filter-btn-secondary:hover {
          background-color: #e9ecef;
        }

        .filter-btn-reset {
          padding: 6px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          background-color: transparent;
          color: #29a6a8;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          margin-right: 15px;
        }

        .filter-btn-reset:hover {
          background-color: rgba(41, 166, 168, 0.1);
          color: #29a6a8;
        }

        .reset-icon {
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }

        .filter-btn-reset:hover .reset-icon {
          transform: rotate(180deg);
        }

        /* Status Filter Menu */
        .status-filter-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 180px;
          width: auto;
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          margin-top: 5px;
        }

        .status-filter-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .status-filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          white-space: nowrap;
          min-width: 180px;
          overflow: hidden;
        }

        .status-filter-item:hover {
          background-color: #f8f9fa;
        }

        .status-filter-item.selected {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        /* Type Filter Menu */
        .type-filter-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 180px;
          width: auto;
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          margin-top: 5px;
        }

        .type-filter-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .type-filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          white-space: nowrap;
          min-width: 180px;
          overflow: hidden;
        }

        .type-filter-item:hover {
          background-color: #f8f9fa;
        }

        .type-filter-item.selected {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        /* Account Filter Menu */
        .account-filter-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 180px;
          width: auto;
          z-index: 1000; /* aligned with other filter menus, below main dropdown (99999) */
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          margin-top: 5px;
        }

        .account-filter-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .account-filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          white-space: nowrap;
          min-width: 180px;
          overflow: hidden;
        }

        .account-filter-item:hover {
          background-color: #f8f9fa;
        }

        .account-filter-item.selected {
          background-color: #e8f5e8;
          color: #2e7d32;
        }

        /* Date Range Filter Styles */
        .date-range-filter-container {
          position: relative;
        }

        .date-range-filter-dropdown {
          position: relative;
        }

        .date-range-filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          min-width: 120px;
          white-space: nowrap;
          overflow: hidden;
        }

        .date-range-filter-toggle:hover {
          border-color: #29a6a8;
        }

        .date-range-filter-toggle.active {
          border-color: #29a6a8;
          background-color: #f0f8f8;
        }

        /* Date Range Filter Menu */
        .date-range-filter-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 180px;
          width: auto;
          z-index: 1003;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          margin-top: 5px;
        }

        .date-range-filter-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .date-range-filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          white-space: nowrap;
          min-width: 180px;
          overflow: hidden;
        }

        .date-range-filter-item:hover {
          background-color: #f8f9fa;
        }

        .date-range-filter-item.selected {
          background-color: #e8f5e8;
          color: #2e7d32;
          border-left: 3px solid #29a6a8;
        }

        .option-text {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .check-mark {
          color: #29a6a8;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
          margin-right: 8px;
        }

        .status-filter-item.selected .check-mark {
          opacity: 1;
        }

        .type-filter-item.selected .check-mark {
          opacity: 1;
        }

        .date-range-filter-item.selected .check-mark {
          opacity: 1;
          color: #29a6a8;
        }

        /* Search Filter Styles */
        .search-filter-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-filter-input {
          width: 200px;
          padding: 8px 35px 8px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
          font-size: 0.9rem;
          background: white;
          transition: all 0.2s ease;
          direction: rtl;
        }

        .search-filter-input:focus {
          outline: none;
          border-color: #29a6a8;
          box-shadow: 0 0 0 2px rgba(41, 166, 168, 0.1);
        }

        .search-filter-input::placeholder {
          color: #999;
          font-style: italic;
        }

        .search-clear-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: none;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .search-clear-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .search-clear-btn.show {
          display: flex;
        }

        .search-clear-icon {
          font-size: 16px;
          color: #666;
          font-weight: bold;
        }

        .search-clear-btn:hover .search-clear-icon {
          color: #333;
        }

        .account-filter-item.selected .check-mark {
          opacity: 1;
        }

        /* Filter Collapse Arrow */
        .filter-collapse-arrow {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 15px;
          background: white;
          border: 1px solid #e8e8e8;
          border-top: none;
          border-radius: 0 0 15px 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          transition: all 0.3s ease;
        }

        .filter-collapse-arrow:hover {
          background-color: #f8f9fa;
        }

        .collapse-arrow {
          width: 8px;
          height: 8px;
          background: #ff9e04;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          transition: transform 0.3s ease;
        }

        .status-filter-section.collapsed .collapse-arrow {
          transform: rotate(180deg);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-wrapper {
            flex-direction: column;
            gap: 10px;
            padding: 15px 0;
          }

          .nav-menu {
            gap: 10px;
          }

          .nav-item {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .filter-actions {
            justify-content: center;
          }
        }

        /* RTL Support */
        .nav-menu {
          direction: rtl;
        }

        .logo-section {
          direction: rtl;
        }

        .status-filter-toggle {
          direction: rtl;
        }

        .status-filter-item {
          direction: rtl;
        }

        .type-filter-item {
          direction: rtl;
        }

        .account-filter-item {
          direction: rtl;
        }

        .date-range-filter-item {
          direction: rtl;
        }

        .dropdown-item {
          direction: rtl;
        }

        /* תמיכה נוספת בטקסטים ארוכים */
        .nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .logo-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <div class="main-header">
        <div class="header-container">
          <div class="header-wrapper">
            <nav class="nav-menu">
              <a href="/" class="nav-item" data-page="home">
                <span class="nav-icon home-icon">🏡</span>
              </a>
              
              <a href="/planning" class="nav-item" data-page="planning">
                <span class="nav-text">תכנון</span>
              </a>
              
              <a href="/tracking" class="nav-item" data-page="tracking">
                <span class="nav-text">מעקב</span>
              </a>
              
              <a href="/research" class="nav-item" data-page="research">
                <span class="nav-text">תחקיר</span>
              </a>
              
              <div class="dropdown">
                <a href="#" class="nav-item dropdown-toggle" onclick="this.getRootNode().host.toggleSettingsDropdown(event)" aria-expanded="false" data-page="settings">
                  <span class="nav-text">הגדרות</span>
                  <span class="dropdown-arrow">▼</span>
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/accounts">ניהול חשבונות</a></li>
                  <li><a class="dropdown-item" href="/notes">הערות</a></li>
                  <li><a class="dropdown-item" href="/alerts">התראות</a></li>
                  <li><a class="dropdown-item" href="/preferences">העדפות</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="/database">בסיס נתונים</a></li>
                  <li><a class="dropdown-item" href="/designs">עיצובים</a></li>
                  <li><a class="dropdown-item" href="/grid-test">גריד</a></li>
                  <li><a class="dropdown-item" href="/grid-table-test">גריד טבלה</a></li>
                </ul>
              </div>
            </nav>
            
            <div class="logo-section">
              <img src="images/tiktrack_logo_256px.png" alt="TikTrack Logo" class="logo-icon">
              <span class="logo-text">פשוט לנהל תיק</span>
            </div>
          </div>
        </div>
        
        <!-- אזור פילטר סטטוס -->
        <div class="status-filter-section" id="statusFilterSection">
          <div class="filter-container">
            <div class="filter-content-wrapper">
              <div class="filter-controls">
                <div class="filter-group">
                  <div class="status-filter-container">
                    <div class="status-filter-dropdown">
                      <button class="status-filter-toggle" id="statusFilterToggle">
                        <span class="selected-status-text">כל הסטטוסים</span>
                        <span class="dropdown-arrow">▼</span>
                      </button>
                      
                      <!-- התפריט הנפתח מתחת לכפתורים -->
                      <div class="status-filter-menu" id="statusFilterMenu">
                        <div class="status-filter-item">
                          <span class="option-text">פתוח</span>
                          <span class="check-mark">✓</span>
                        </div>
                        <div class="status-filter-item">
                          <span class="option-text">סגור</span>
                          <span class="check-mark">✓</span>
                        </div>
                        <div class="status-filter-item">
                          <span class="option-text">מבוטל</span>
                          <span class="check-mark">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="type-filter-container">
                    <div class="type-filter-dropdown">
                      <button class="type-filter-toggle" id="typeFilterToggle">
                        <span class="selected-type-text">כל הסוגים</span>
                        <span class="dropdown-arrow">▼</span>
                      </button>
                      
                      <!-- התפריט הנפתח לפילטר סוג -->
                      <div class="type-filter-menu" id="typeFilterMenu">
                        <div class="type-filter-item">
                          <span class="option-text">סווינג</span>
                          <span class="check-mark">✓</span>
                        </div>
                        <div class="type-filter-item">
                          <span class="option-text">השקעה</span>
                          <span class="check-mark">✓</span>
                        </div>
                        <div class="type-filter-item">
                          <span class="option-text">פאסיבי</span>
                          <span class="check-mark">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="account-filter-container">
                    <div class="account-filter-dropdown">
                      <button class="account-filter-toggle" id="accountFilterToggle">
                        <span class="selected-account-text">כל החשבונות</span>
                        <span class="dropdown-arrow">▼</span>
                      </button>
                      
                      <!-- התפריט הנפתח לפילטר חשבונות -->
                      <div class="account-filter-menu" id="accountFilterMenu">
                        <!-- החשבונות יטענו דינמית מהשרת -->
                      </div>
                    </div>
                  </div>
                  
                  <div class="date-range-filter-container">
                    <div class="date-range-filter-dropdown">
                      <button class="date-range-filter-toggle" id="dateRangeFilterToggle">
                        <span class="selected-date-range-text">כל זמן</span>
                        <span class="dropdown-arrow">▼</span>
                      </button>
                      
                      <!-- התפריט הנפתח לפילטר טווח תאריכים -->
                      <div class="date-range-filter-menu" id="dateRangeFilterMenu">
                        <div class="date-range-filter-item">
                          <span class="option-text">שבוע</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">MTD</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">30 יום</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">60 יום</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">90 יום</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">שנה</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">YTD</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">שנה קודמת</span>
                          <span class="check-mark">●</span>
                        </div>
                        <div class="date-range-filter-item">
                          <span class="option-text">כל זמן</span>
                          <span class="check-mark">●</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="search-filter-container">
                    <div class="search-input-wrapper">
                      <input 
                        type="text" 
                        id="searchFilterInput" 
                        class="search-filter-input" 
                        placeholder="חיפוש חופשי..."
                        autocomplete="off"
                      >
                      <button class="search-clear-btn" id="searchClearBtn" title="נקה חיפוש">
                        <span class="search-clear-icon">×</span>
                      </button>
                    </div>
                  </div>
                  
                  <button class="filter-btn filter-btn-reset" title="נקה פילטרים">
                    <span class="reset-icon">↻</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- חץ לסגירת אזור הפילטר -->
          <div class="filter-collapse-arrow">
            <span class="collapse-arrow"></span>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // הגדרת הפריט הפעיל לפי הדף הנוכחי
    this.setActiveMenuItem();
    
    // הוספת event listeners לכפתורי הניווט
    this.addMenuEventListeners();
    
    // הוספת event listeners לתפריט הנפתח
    this.addDropdownEventListeners();
    
    // סגירת דרופדאונים בלחיצה מחוץ להם
    this.setupGlobalEventListeners();
  }

  setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navItems = this.shadowRoot.querySelectorAll('.nav-item');
    
    // הסרת active מכל הפריטים
    navItems.forEach(item => item.classList.remove('active'));
    
    // הגדרת הפריט הפעיל לפי הנתיב הנוכחי
    if (currentPath === '/' || currentPath === '/index.html') {
      this.shadowRoot.querySelector('[data-page="home"]')?.classList.add('active');
    } else if (currentPath === '/planning') {
      this.shadowRoot.querySelector('[data-page="planning"]')?.classList.add('active');
    } else if (currentPath === '/tracking') {
      this.shadowRoot.querySelector('[data-page="tracking"]')?.classList.add('active');
    } else if (currentPath === '/research') {
      this.shadowRoot.querySelector('[data-page="research"]')?.classList.add('active');
    } else if (currentPath.includes('/accounts') || currentPath.includes('/notes') || 
               currentPath.includes('/alerts') || currentPath.includes('/database') || 
               currentPath.includes('/preferences')) {
      this.shadowRoot.querySelector('[data-page="settings"]')?.classList.add('active');
    }
  }

  addMenuEventListeners() {
    const navItems = this.shadowRoot.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // הסרת active מכל הפריטים
        navItems.forEach(nav => nav.classList.remove('active'));
        // הוספת active לפריט הנוכחי
        item.classList.add('active');
      });
    });
  }

  addDropdownEventListeners() {
    const dropdownToggle = this.shadowRoot.querySelector('.dropdown-toggle');
    const dropdownMenu = this.shadowRoot.querySelector('.dropdown-menu');
    const dropdownItems = this.shadowRoot.querySelectorAll('.dropdown-item');
    
    if (dropdownToggle && dropdownMenu) {
      // סגירת התפריט כשלוחצים על פריט
      dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
          this.closeDropdown();
        });
      });
    }
  }

  toggleSettingsDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropdownToggle = event.target.closest('.dropdown-toggle');
    const dropdownMenu = this.shadowRoot.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
      const isVisible = dropdownMenu.classList.contains('show');
      
      if (isVisible) {
        dropdownMenu.classList.remove('show');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      } else {
        dropdownMenu.classList.add('show');
        dropdownToggle.setAttribute('aria-expanded', 'true');
      }
    }
  }



  closeAllDropdowns() {
    // סגירת כל הדרופדאונים בקומפוננט
    const allDropdowns = this.shadowRoot.querySelectorAll('.dropdown-menu');
    const allToggles = this.shadowRoot.querySelectorAll('.dropdown-toggle');
    
    allDropdowns.forEach(menu => menu.classList.remove('show'));
    allToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
    
    // סגירת פילטרים
    this.closeStatusFilter();
    this.closeTypeFilter();
    this.closeAccountFilter();
    this.closeDateRangeFilter();
  }

  closeDropdown() {
    const dropdownToggle = this.shadowRoot.querySelector('.dropdown-toggle');
    const dropdownMenu = this.shadowRoot.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
      dropdownMenu.classList.remove('show');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }

  setupGlobalEventListeners() {
    // סגירת דרופדאונים בלחיצה מחוץ להם
    document.addEventListener('click', (e) => {
      // בדיקה אם הלחיצה היא מחוץ לקומפוננט
      if (!this.shadowRoot.contains(e.target)) {
        this.closeDropdown();
        this.closeStatusFilter();
        this.closeTypeFilter();
        this.closeAccountFilter();
        this.closeDateRangeFilter();
      }
    });
    
    // סגירת דרופדאונים בלחיצה על מקש Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
        this.closeStatusFilter();
        this.closeTypeFilter();
        this.closeAccountFilter();
        this.closeDateRangeFilter();
      }
    });
    
    // סגירת דרופדאונים בלחיצה על מקש Tab
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.closeDropdown();
      }
    });
    
    // סגירת דרופדאונים כשמחליפים דף
    window.addEventListener('beforeunload', () => {
      this.closeDropdown();
      this.closeStatusFilter();
      this.closeTypeFilter();
      this.closeAccountFilter();
      this.closeDateRangeFilter();
    });
  }

  /**
   * אתחול מערכת הפילטרים
   * טוענת פילטרים שמורים מ-localStorage או מגדירה ברירות מחדל
   * תומכת בדפים שונים עם פילטרים מותאמים לכל דף
   */
  initializeFilter() {
    console.log('initializeFilter called');
    
    // קביעת שם הדף הנוכחי
    const currentPath = window.location.pathname;
    let pageName = 'planning'; // ברירת מחדל
    
    if (currentPath.includes('/designs') || currentPath.includes('/planning')) {
      pageName = 'designs';
    } else if (currentPath.includes('/tracking')) {
      pageName = 'tracking';
    } else if (currentPath.includes('/notes')) {
      pageName = 'notes';
    } else if (currentPath.includes('/accounts')) {
      pageName = 'accounts';
    }
    
    console.log('Current page for filters:', pageName);
    
    // בדיקה אם יש פילטרים שמורים ב-localStorage
    let savedStatusFilter = null;
    let savedTypeFilter = null;
    let savedAccountFilter = null;
    let savedDateRangeFilter = null;
    let savedSearchFilter = null;
    
    try {
      const savedStatusData = localStorage.getItem(`${pageName}FilterStatuses`);
      const savedTypeData = localStorage.getItem(`${pageName}FilterTypes`);
      const savedAccountData = localStorage.getItem(`${pageName}FilterAccounts`);
      const savedDateRangeData = localStorage.getItem(`${pageName}FilterDateRanges`);
      const savedSearchData = localStorage.getItem(`${pageName}FilterSearch`);
      
      if (savedStatusData) {
        savedStatusFilter = JSON.parse(savedStatusData);
        console.log('Found saved status filter in initializeFilter:', savedStatusFilter);
      }
      if (savedTypeData) {
        savedTypeFilter = JSON.parse(savedTypeData);
        console.log('Found saved type filter in initializeFilter:', savedTypeFilter);
      }
      if (savedAccountData) {
        savedAccountFilter = JSON.parse(savedAccountData);
        console.log('Found saved account filter in initializeFilter:', savedAccountFilter);
      }
      if (savedDateRangeData) {
        savedDateRangeFilter = JSON.parse(savedDateRangeData);
        console.log('Found saved date range filter in initializeFilter:', savedDateRangeFilter);
      }
      if (savedSearchData) {
        savedSearchFilter = savedSearchData;
        console.log('Found saved search filter in initializeFilter:', savedSearchFilter);
      }
    } catch (error) {
      console.error('Error loading saved filters in initializeFilter:', error);
    }
    
    // אתחול הפילטר - אם יש פילטר שמור, השתמש בו, אחרת ברירת מחדל
    setTimeout(() => {
      const menu = this.shadowRoot.getElementById('statusFilterMenu');
      console.log('Menu found:', menu);
      if (menu) {
        const items = menu.querySelectorAll('.status-filter-item');
        console.log('Found status filter items:', items.length);
        
        if (savedStatusFilter && savedStatusFilter.length > 0) {
          // שימוש בפילטר השמור
          items.forEach(item => {
            const text = item.querySelector('.option-text').textContent;
            if (savedStatusFilter.includes(text)) {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
          });
          console.log('Status filter initialized with saved filter:', savedStatusFilter);
        } else {
          // ברירת מחדל לפי דף
          items.forEach(item => {
            const text = item.querySelector('.option-text').textContent;
            if (pageName === 'accounts') {
              // בדף החשבונות - לבחור את כל הסטטוסים כברירת מחדל
              item.classList.add('selected');
            } else if (pageName === 'notes') {
              // עבור דף ההערות - רק "פתוח" מסומן (ברירת מחדל)
              if (text === 'פתוח') {
                item.classList.add('selected');
              } else {
                item.classList.remove('selected');
              }
            } else if (text === 'פתוח') {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
          });
          console.log(`Status filter initialized with default for ${pageName}`);
        }
        
        this.updateStatusFilterText();
        
        // עדכון הפילטר בטבלה אחרי האתחול
        setTimeout(() => {
          // בדיקה שהפונקציות הגלובליות זמינות
          if (typeof window.updateGridFromComponent === 'function') {
            this.updateGridFilter();
          } else {
            // אם הפונקציה לא זמינה, נחכה קצת יותר
            setTimeout(() => {
              this.updateGridFilter();
            }, 300);
          }
        }, 100);
      } else {
        console.log('Status menu not found in initializeFilter');
      }
      
      // אתחול פילטר הסוג
      const typeMenu = this.shadowRoot.getElementById('typeFilterMenu');
      if (typeMenu) {
        const typeItems = typeMenu.querySelectorAll('.type-filter-item');
        console.log('Found type filter items:', typeItems.length);
        
        if (savedTypeFilter && savedTypeFilter.length > 0) {
          // שימוש בפילטר השמור
          typeItems.forEach(item => {
            const text = item.querySelector('.option-text').textContent;
            if (savedTypeFilter.includes(text)) {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
          });
          console.log('Type filter initialized with saved filter:', savedTypeFilter);
        } else {
          // ברירת מחדל - כל הסוגים מסומנים
          typeItems.forEach(item => {
            item.classList.add('selected');
          });
          console.log(`Type filter initialized with default for ${pageName} (all items selected)`);
        }
        
        this.updateTypeFilterText();
      } else {
        console.log('Type menu not found in initializeFilter');
      }
      
      // אתחול פילטר החשבונות
      const accountMenu = this.shadowRoot.getElementById('accountFilterMenu');
      if (accountMenu) {
        const accountItems = accountMenu.querySelectorAll('.account-filter-item');
        console.log('Found account filter items:', accountItems.length);
        
        if (savedAccountFilter && savedAccountFilter.length > 0) {
          // שימוש בפילטר השמור
          accountItems.forEach(item => {
            const accountName = item.getAttribute('data-account'); // שימוש בשם המלא
            if (savedAccountFilter.includes(accountName)) {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
          });
          console.log('Account filter initialized with saved filter:', savedAccountFilter);
        } else {
          // ברירת מחדל - כל החשבונות מסומנים
          accountItems.forEach(item => {
            item.classList.add('selected');
          });
          console.log(`Account filter initialized with default for ${pageName} (all items selected)`);
        }
        
        this.updateAccountFilterText();
      } else {
        console.log('Account menu not found in initializeFilter');
      }
      
      // אתחול פילטר טווח תאריכים
      const dateRangeMenu = this.shadowRoot.getElementById('dateRangeFilterMenu');
      if (dateRangeMenu) {
        const dateRangeItems = dateRangeMenu.querySelectorAll('.date-range-filter-item');
        console.log('Found date range filter items:', dateRangeItems.length);
        
        if (savedDateRangeFilter && savedDateRangeFilter.length > 0) {
          // שימוש בפילטר השמור - בחירת הפריט הראשון בלבד
          const firstSavedRange = savedDateRangeFilter[0];
          dateRangeItems.forEach(item => {
            const text = item.querySelector('.option-text').textContent;
            if (text === firstSavedRange) {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
          });
          console.log('Date range filter initialized with saved filter:', firstSavedRange);
        } else {
          // ברירת מחדל - רק "כל זמן" מסומן
          dateRangeItems.forEach(item => {
            const text = item.querySelector('.option-text').textContent;
            if (text === 'כל זמן') {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
          });
          console.log(`Date range filter initialized with default for ${pageName} (only "כל זמן" selected)`);
        }
        
        this.updateDateRangeFilterText();
      } else {
        console.log('Date range menu not found in initializeFilter');
      }
      
      // אתחול שדה החיפוש
      const searchInput = this.shadowRoot.getElementById('searchFilterInput');
      if (searchInput) {
        if (savedSearchFilter && savedSearchFilter.trim() !== '') {
          searchInput.value = savedSearchFilter;
          console.log(`Search input initialized with saved filter for ${pageName}:`, savedSearchFilter);
        } else {
          searchInput.value = '';
          console.log(`Search input initialized with empty value for ${pageName}`);
        }
        
        this.toggleSearchClearButton();
      } else {
        console.log('Search input not found in initializeFilter');
      }
      
      // הוספת event listener לכפתור פילטר הסטטוס
      const statusFilterToggle = this.shadowRoot.getElementById('statusFilterToggle');
      if (statusFilterToggle) {
        statusFilterToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Status filter toggle clicked via event listener');
          this.toggleStatusFilter();
        });
        console.log('Status filter toggle event listener added');
      } else {
        console.log('Status filter toggle not found');
      }
      
      // הוספת event listener לכפתור פילטר הסוג
      const typeFilterToggle = this.shadowRoot.getElementById('typeFilterToggle');
      if (typeFilterToggle) {
        typeFilterToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Type filter toggle clicked via event listener');
          this.toggleTypeFilter();
        });
        console.log('Type filter toggle event listener added');
      } else {
        console.log('Type filter toggle not found');
      }
      
      // הוספת event listener לכפתור פילטר החשבונות
      const accountFilterToggle = this.shadowRoot.getElementById('accountFilterToggle');
      if (accountFilterToggle) {
        accountFilterToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Account filter toggle clicked via event listener');
          this.toggleAccountFilter();
        });
        console.log('Account filter toggle event listener added');
      } else {
        console.log('Account filter toggle not found');
      }
      
      // הוספת event listener לכפתור פילטר טווח תאריכים
      const dateRangeFilterToggle = this.shadowRoot.getElementById('dateRangeFilterToggle');
      if (dateRangeFilterToggle) {
        dateRangeFilterToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔍 Date range filter toggle clicked via event listener');
          this.toggleDateRangeFilter();
        });
        console.log('🔍 Date range filter toggle event listener added');
      } else {
        console.log('🔍 Date range filter toggle not found');
      }
      
      // הוספת event listeners לפריטי פילטר הסטטוס
      const statusFilterItems = this.shadowRoot.querySelectorAll('.status-filter-item');
      console.log('Adding event listeners to status filter items:', statusFilterItems.length);
      statusFilterItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const statusText = item.querySelector('.option-text').textContent;
          console.log('Status filter item clicked:', statusText);
          this.selectStatusOption(statusText);
        });
      });
      console.log('Status filter items event listeners added');
      
      // הוספת event listeners לפריטי פילטר הסוג
      const typeFilterItems = this.shadowRoot.querySelectorAll('.type-filter-item');
      console.log('Adding event listeners to type filter items:', typeFilterItems.length);
      typeFilterItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const typeText = item.querySelector('.option-text').textContent;
          console.log('Type filter item clicked:', typeText);
          this.selectTypeOption(typeText);
        });
      });
      console.log('Type filter items event listeners added');
      
      // הוספת event listeners לפריטי פילטר החשבונות (רק אם יש פריטים קיימים)
      const accountFilterItems = this.shadowRoot.querySelectorAll('.account-filter-item');
      console.log('Found existing account filter items:', accountFilterItems.length);
      accountFilterItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const accountName = item.querySelector('.option-text').textContent;
          console.log('Account filter item clicked:', accountName);
          this.selectAccountOption(accountName);
        });
      });
      console.log('Account filter items event listeners added');
      
              // עדכון הפילטר בטבלה אחרי אתחול כל הפילטרים
        setTimeout(() => {
          // בדיקה שהפונקציות הגלובליות זמינות
          if (typeof window.updateGridFromComponent === 'function') {
            this.updateGridFilter();
          } else {
            // אם הפונקציה לא זמינה, נחכה קצת יותר
            setTimeout(() => {
              this.updateGridFilter();
            }, 500);
          }
        }, 200);
        
        // עדכון תפריט החשבונות
        setTimeout(() => {
          console.log('🔄 Attempting to update account filter menu...');
          if (typeof window.loadAllAccountsFromServer === 'function') {
            console.log('🔄 Loading all accounts from server for filter update');
            window.loadAllAccountsFromServer().then((allAccounts) => {
              if (allAccounts && allAccounts.length > 0) {
                window.updateAccountFilterMenu(allAccounts);
              }
            }).catch((error) => {
              console.log('🔄 Error loading all accounts for filter update:', error);
              // fallback לנתונים קיימים
              if (typeof window.updateAccountFilterMenu === 'function' && window.accountsData) {
                window.updateAccountFilterMenu(window.accountsData);
              }
            });
          } else if (typeof window.updateAccountFilterMenu === 'function' && window.accountsData) {
            console.log('🔄 Updating account filter menu with existing data');
            window.updateAccountFilterMenu(window.accountsData);
          } else if (typeof window.refreshAccountFilterMenu === 'function') {
            console.log('🔄 Using manual refresh function');
            window.refreshAccountFilterMenu();
          } else {
            console.log('🔄 No account functions available');
          }
        }, 1000);
      
      // הוספת event listeners לפריטי פילטר טווח תאריכים
      const dateRangeFilterItems = this.shadowRoot.querySelectorAll('.date-range-filter-item');
      console.log('🔍 Adding event listeners to date range filter items:', dateRangeFilterItems.length);
      dateRangeFilterItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const dateRangeText = item.querySelector('.option-text').textContent;
          console.log(`🔍 Date range filter item ${index + 1} clicked:`, dateRangeText);
          this.selectDateRangeOption(dateRangeText);
        });
      });
      console.log('🔍 Date range filter items event listeners added');
      
      // הוספת event listener לכפתור reset
      const resetBtn = this.shadowRoot.querySelector('.filter-btn-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Reset filter clicked');
          this.clearAllFilters();
        });
        console.log('Reset button event listener added');
      } else {
        console.log('Reset button not found');
      }
      
      // הוספת event listeners לשדה החיפוש
      const searchInputEl = this.shadowRoot.getElementById('searchFilterInput');
      if (searchInputEl) {
        searchInputEl.addEventListener('input', (e) => {
          this.handleSearchInput(e);
        });
        console.log('Search input event listener added');
      } else {
        console.log('Search input not found');
      }
      
      const searchClearBtn = this.shadowRoot.getElementById('searchClearBtn');
      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleSearchClear();
        });
        console.log('Search clear button event listener added');
      } else {
        console.log('Search clear button not found');
      }
      
      // הוספת event listener לחץ הסגירה
      const collapseArrow = this.shadowRoot.querySelector('.filter-collapse-arrow');
      if (collapseArrow) {
        collapseArrow.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Collapse arrow clicked');
          this.toggleFilterSection();
        });
        console.log('Collapse arrow event listener added');
      } else {
        console.log('Collapse arrow not found');
      }
      
      // עדכון פילטרים
      setTimeout(() => {
        this.updateGridFilter();
      }, 500);
    }, 100);
  }

  initializeBootstrapDropdown() {
    // המתנה לטעינת Bootstrap
    setTimeout(() => {
      try {
        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
          const dropdownToggle = this.shadowRoot.querySelector('.dropdown-toggle');
          if (dropdownToggle) {
            // הסרת event listeners קיימים
            const newToggle = dropdownToggle.cloneNode(true);
            dropdownToggle.parentNode.replaceChild(newToggle, dropdownToggle);
            
            // יצירת Bootstrap Dropdown חדש
            new bootstrap.Dropdown(newToggle);
            console.log('Bootstrap dropdown initialized successfully');
          }
        }
      } catch (error) {
        console.log('Bootstrap dropdown initialization failed:', error);
      }
    }, 500);
  }





  // פונקציות הפילטר
  toggleStatusFilter() {
    console.log('toggleStatusFilter called');
    const menu = this.shadowRoot.getElementById('statusFilterMenu');
    const toggle = this.shadowRoot.querySelector('.status-filter-toggle');
    
    console.log('Menu:', menu, 'Toggle:', toggle);
    
    if (!menu || !toggle) {
      console.log('Missing elements');
      return;
    }
    
    const isVisible = menu.classList.contains('show');
    console.log('Is visible:', isVisible);
    
    if (isVisible) {
      // סגירת התפריט
      menu.classList.remove('show');
      toggle.classList.remove('active');
      console.log('Filter menu closed');
    } else {
      // סגירת פילטרים אחרים לפני פתיחת זה
      this.closeOtherFilters('status');
      
      // פתיחת התפריט
      menu.classList.add('show');
      toggle.classList.add('active');
      console.log('Filter menu opened');
    }
    
    this.updateStatusFilterText();
  }

  closeStatusFilter() {
    const menu = this.shadowRoot.getElementById('statusFilterMenu');
    const toggle = this.shadowRoot.querySelector('.status-filter-toggle');
    
    if (menu && toggle) {
      menu.classList.remove('show');
      toggle.classList.remove('active');
    }
  }

  toggleTypeFilter() {
    console.log('toggleTypeFilter called');
    const menu = this.shadowRoot.getElementById('typeFilterMenu');
    const toggle = this.shadowRoot.querySelector('.type-filter-toggle');
    
    console.log('Type Menu:', menu, 'Toggle:', toggle);
    
    if (!menu || !toggle) {
      console.log('Missing type filter elements');
      return;
    }
    
    const isVisible = menu.classList.contains('show');
    console.log('Type filter is visible:', isVisible);
    
    if (isVisible) {
      // סגירת התפריט
      menu.classList.remove('show');
      toggle.classList.remove('active');
      console.log('Type filter menu closed');
    } else {
      // סגירת פילטרים אחרים לפני פתיחת זה
      this.closeOtherFilters('type');
      
      // פתיחת התפריט
      menu.classList.add('show');
      toggle.classList.add('active');
      console.log('Type filter menu opened');
    }
    
    this.updateTypeFilterText();
  }

  closeTypeFilter() {
    const menu = this.shadowRoot.getElementById('typeFilterMenu');
    const toggle = this.shadowRoot.querySelector('.type-filter-toggle');
    
    if (menu && toggle) {
      menu.classList.remove('show');
      toggle.classList.remove('active');
    }
  }

  toggleAccountFilter() {
    const menu = this.shadowRoot.getElementById('accountFilterMenu');
    const toggle = this.shadowRoot.querySelector('.account-filter-toggle');
    
    console.log('🔍 Toggle account filter clicked');
    console.log('🔍 Menu element:', menu);
    console.log('🔍 Toggle element:', toggle);
    
    if (menu && toggle) {
      const isVisible = menu.classList.contains('show');
      console.log('🔍 Is menu currently visible:', isVisible);
      
      // סגירת כל התפריטים האחרים
      this.closeOtherFilters('account');
      
      if (!isVisible) {
        menu.classList.add('show');
        toggle.classList.add('active');
        console.log('🔍 Account filter menu opened');
        
        // בדיקת המיקום
        const rect = menu.getBoundingClientRect();
        console.log('🔍 Menu position:', {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          zIndex: window.getComputedStyle(menu).zIndex
        });
      } else {
        menu.classList.remove('show');
        toggle.classList.remove('active');
        console.log('🔍 Account filter menu closed');
      }
    } else {
      console.log('🔍 Menu or toggle not found');
    }
  }

  closeAccountFilter() {
    const menu = this.shadowRoot.getElementById('accountFilterMenu');
    const toggle = this.shadowRoot.querySelector('.account-filter-toggle');
    
    if (menu && toggle) {
      menu.classList.remove('show');
      toggle.classList.remove('active');
    }
  }

  toggleDateRangeFilter() {
    console.log('🔍 toggleDateRangeFilter called');
    const menu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    const toggle = this.shadowRoot.querySelector('.date-range-filter-toggle');
    
    console.log('🔍 Date Range Menu:', menu);
    console.log('🔍 Toggle:', toggle);
    
    if (!menu || !toggle) {
      console.log('🔍 Missing date range filter elements');
      return;
    }
    
    const isVisible = menu.classList.contains('show');
    console.log('🔍 Date range filter is visible:', isVisible);
    
    if (isVisible) {
      // סגירת התפריט
      menu.classList.remove('show');
      toggle.classList.remove('active');
      console.log('🔍 Date range filter menu closed');
    } else {
      // סגירת פילטרים אחרים לפני פתיחת זה
      this.closeOtherFilters('dateRange');
      
      // פתיחת התפריט
      menu.classList.add('show');
      toggle.classList.add('active');
      console.log('🔍 Date range filter menu opened');
      
      // בדיקת המיקום
      const rect = menu.getBoundingClientRect();
      console.log('🔍 Date range menu position:', {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: window.getComputedStyle(menu).zIndex
      });
    }
    
    this.updateDateRangeFilterText();
  }

  closeDateRangeFilter() {
    const menu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    const toggle = this.shadowRoot.querySelector('.date-range-filter-toggle');
    
    if (menu && toggle) {
      menu.classList.remove('show');
      toggle.classList.remove('active');
    }
  }

  closeOtherFilters(excludeFilter) {
    // סגירת כל הפילטרים חוץ מהפילטר שצוין
    if (excludeFilter !== 'status') {
      this.closeStatusFilter();
    }
    if (excludeFilter !== 'type') {
      this.closeTypeFilter();
    }
    if (excludeFilter !== 'account') {
      this.closeAccountFilter();
    }
    if (excludeFilter !== 'dateRange') {
      this.closeDateRangeFilter();
    }
  }

  selectStatusOption(status) {
    console.log('selectStatusOption called with status:', status);
    const menu = this.shadowRoot.getElementById('statusFilterMenu');
    if (!menu) {
      console.log('Menu not found');
      return;
    }
    
    const item = Array.from(menu.querySelectorAll('.status-filter-item'))
      .find(item => item.querySelector('.option-text').textContent === status);
    
    if (item) {
      const wasSelected = item.classList.contains('selected');
      item.classList.toggle('selected');
      const isNowSelected = item.classList.contains('selected');
      
      console.log(`Status ${status}: was ${wasSelected}, now ${isNowSelected}`);
      
      this.updateStatusFilterText();
      
      // עדכון אוטומטי של הגריד
      this.updateGridFilter();
      
      console.log('Status option updated and grid filter applied');
    } else {
      console.log('Item not found for status:', status);
    }
  }

  selectTypeOption(type) {
    console.log('selectTypeOption called with type:', type);
    const menu = this.shadowRoot.getElementById('typeFilterMenu');
    if (!menu) {
      console.log('Type menu not found');
      return;
    }
    
    const item = Array.from(menu.querySelectorAll('.type-filter-item'))
      .find(item => item.querySelector('.option-text').textContent === type);
    
    if (item) {
      const wasSelected = item.classList.contains('selected');
      item.classList.toggle('selected');
      const isNowSelected = item.classList.contains('selected');
      
      console.log(`Type ${type}: was ${wasSelected}, now ${isNowSelected}`);
      
      this.updateTypeFilterText();
      
      // עדכון אוטומטי של הגריד
      this.updateGridFilter();
      
      console.log('Type option updated and grid filter applied');
    } else {
      console.log('Item not found for type:', type);
    }
  }

  selectAccountOption(account) {
    console.log('selectAccountOption called with account:', account);
    const menu = this.shadowRoot.getElementById('accountFilterMenu');
    if (!menu) {
      console.log('Account menu not found');
      return;
    }
    
    // חיפוש הפריט לפי data-account attribute (השם המלא)
    const item = Array.from(menu.querySelectorAll('.account-filter-item'))
      .find(item => item.getAttribute('data-account') === account);
    
    if (item) {
      const wasSelected = item.classList.contains('selected');
      item.classList.toggle('selected');
      const isNowSelected = item.classList.contains('selected');
      
      console.log(`Account ${account}: was ${wasSelected}, now ${isNowSelected}`);
      
      this.updateAccountFilterText();
      
      // עדכון אוטומטי של הגריד
      this.updateGridFilter();
      
      console.log('Account option updated and grid filter applied');
    } else {
      console.log('Item not found for account:', account);
    }
  }

  selectDateRangeOption(dateRange) {
    console.log('🔍 selectDateRangeOption called with dateRange:', dateRange);
    const menu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    if (!menu) {
      console.log('🔍 Date range menu not found');
      return;
    }
    
    console.log('🔍 Date range menu found, searching for item:', dateRange);
    
    const item = Array.from(menu.querySelectorAll('.date-range-filter-item'))
      .find(item => item.querySelector('.option-text').textContent === dateRange);
    
    console.log('🔍 Found item:', item);
    
    if (item) {
      console.log('🔍 Item found, updating selection...');
      
      // הסרת בחירה מכל הפריטים
      menu.querySelectorAll('.date-range-filter-item').forEach(menuItem => {
        menuItem.classList.remove('selected');
      });
      
      // בחירת הפריט הנוכחי בלבד
      item.classList.add('selected');
      
      console.log(`🔍 Date range ${dateRange} selected (single selection)`);
      
      this.updateDateRangeFilterText();
      
      // עדכון אוטומטי של הגריד
      this.updateGridFilter();
      
      console.log('🔍 Date range option updated and grid filter applied');
    } else {
      console.log('🔍 Item not found for date range:', dateRange);
      console.log('🔍 Available items:', Array.from(menu.querySelectorAll('.date-range-filter-item'))
        .map(item => item.querySelector('.option-text').textContent));
    }
  }

  updateStatusFilterText() {
    console.log('updateStatusFilterText called');
    const menu = this.shadowRoot.getElementById('statusFilterMenu');
    if (!menu) {
      console.log('Menu not found in updateStatusFilterText');
      return;
    }
    
    const toggle = this.shadowRoot.querySelector('.status-filter-toggle');
    if (!toggle) {
      console.log('Toggle not found in updateStatusFilterText');
      return;
    }
    
    const selectedText = toggle.querySelector('.selected-status-text');
    if (!selectedText) {
      console.log('Selected text element not found in updateStatusFilterText');
      return;
    }
    
    const selectedItems = menu.querySelectorAll('.status-filter-item.selected');
    const selectedValues = Array.from(selectedItems)
      .map(item => item.querySelector('.option-text').textContent);
    
    console.log('Selected values for text update:', selectedValues);
    
    if (selectedValues.length === 0) {
      selectedText.textContent = 'כל הסטטוסים';
    } else if (selectedValues.length === menu.querySelectorAll('.status-filter-item').length) {
      selectedText.textContent = 'כל הסטטוסים';
    } else if (selectedValues.length === 1 && selectedValues[0] === 'פתוח') {
      selectedText.textContent = 'פתוח';
    } else {
      // הצגת מספר הסטטוסים הפעילים
      selectedText.textContent = `${selectedValues.length} סטטוסים`;
    }
    
    console.log('Updated filter text to:', selectedText.textContent);
  }

  updateTypeFilterText() {
    console.log('updateTypeFilterText called');
    const menu = this.shadowRoot.getElementById('typeFilterMenu');
    if (!menu) {
      console.log('Type menu not found in updateTypeFilterText');
      return;
    }
    
    const toggle = this.shadowRoot.querySelector('.type-filter-toggle');
    if (!toggle) {
      console.log('Type toggle not found in updateTypeFilterText');
      return;
    }
    
    const selectedText = toggle.querySelector('.selected-type-text');
    if (!selectedText) {
      console.log('Selected type text element not found in updateTypeFilterText');
      return;
    }
    
    const selectedItems = menu.querySelectorAll('.type-filter-item.selected');
    const selectedValues = Array.from(selectedItems)
      .map(item => item.querySelector('.option-text').textContent);
    
    console.log('Selected type values for text update:', selectedValues);
    
    if (selectedValues.length === 0) {
      selectedText.textContent = 'כל הסוגים';
    } else if (selectedValues.length === menu.querySelectorAll('.type-filter-item').length) {
      selectedText.textContent = 'כל הסוגים';
    } else {
      // הצגת מספר הסוגים הפעילים
      selectedText.textContent = `${selectedValues.length} סוגים`;
    }
    
    console.log('Updated type filter text to:', selectedText.textContent);
  }

  updateAccountFilterText() {
    console.log('updateAccountFilterText called');
    const menu = this.shadowRoot.getElementById('accountFilterMenu');
    if (!menu) {
      console.log('Account menu not found in updateAccountFilterText');
      return;
    }
    
    const toggle = this.shadowRoot.querySelector('.account-filter-toggle');
    if (!toggle) {
      console.log('Account toggle not found in updateAccountFilterText');
      return;
    }
    
    const selectedText = toggle.querySelector('.selected-account-text');
    if (!selectedText) {
      console.log('Selected account text element not found in updateAccountFilterText');
      return;
    }
    
    const selectedItems = menu.querySelectorAll('.account-filter-item.selected');
    const selectedValues = Array.from(selectedItems)
      .map(item => item.getAttribute('data-account')); // שימוש בשם המלא
    
    console.log('Selected account values for text update:', selectedValues);
    
    if (selectedValues.length === 0) {
      selectedText.textContent = 'כל החשבונות';
    } else if (selectedValues.length === menu.querySelectorAll('.account-filter-item').length) {
      selectedText.textContent = 'כל החשבונות';
    } else {
      // הצגת מספר החשבונות הפעילים
      selectedText.textContent = `${selectedValues.length} חשבונות`;
    }
    
    console.log('Updated account filter text to:', selectedText.textContent);
  }

  updateDateRangeFilterText() {
    console.log('🔍 updateDateRangeFilterText called');
    const menu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    if (!menu) {
      console.log('🔍 Date range menu not found in updateDateRangeFilterText');
      return;
    }
    
    const toggle = this.shadowRoot.querySelector('.date-range-filter-toggle');
    if (!toggle) {
      console.log('🔍 Date range toggle not found in updateDateRangeFilterText');
      return;
    }
    
    const selectedText = toggle.querySelector('.selected-date-range-text');
    if (!selectedText) {
      console.log('🔍 Selected date range text element not found in updateDateRangeFilterText');
      return;
    }
    
    const selectedItems = menu.querySelectorAll('.date-range-filter-item.selected');
    const selectedValues = Array.from(selectedItems)
      .map(item => item.querySelector('.option-text').textContent);
    
    console.log('🔍 Selected date range values for text update:', selectedValues);
    console.log('🔍 Number of selected items:', selectedItems.length);
    
    if (selectedValues.length === 0) {
      selectedText.textContent = 'כל זמן';
    } else if (selectedValues.length === 1) {
      selectedText.textContent = selectedValues[0];
    } else {
      // במקרה של בחירה מרובה (לא אמור לקרות), הצג את הראשון
      selectedText.textContent = selectedValues[0];
    }
    
    console.log('🔍 Updated date range filter text to:', selectedText.textContent);
  }

  applyStatusFilter() {
    console.log('applyStatusFilter called from component');
    this.updateGridFilter();
  }

  clearStatusFilter() {
    console.log('clearStatusFilter called from component');
    
    // ניקוי פילטר הסטטוס - רק "פתוח" מסומן
    const statusMenu = this.shadowRoot.getElementById('statusFilterMenu');
    if (statusMenu) {
      statusMenu.querySelectorAll('.status-filter-item').forEach(item => {
        const text = item.querySelector('.option-text').textContent;
        if (text === 'פתוח') {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      this.updateStatusFilterText();
    }
    
    // ניקוי הפילטר השמור ב-localStorage
    try {
      localStorage.removeItem('planningFilterStatuses');
      console.log('Status filter cleared from localStorage');
    } catch (error) {
      console.error('Error clearing status filter from localStorage:', error);
    }
    
    this.updateGridFilter();
  }

  clearTypeFilter() {
    console.log('clearTypeFilter called from component');
    
    // ניקוי פילטר הסוג - כל הסוגים מסומנים
    const typeMenu = this.shadowRoot.getElementById('typeFilterMenu');
    if (typeMenu) {
      typeMenu.querySelectorAll('.type-filter-item').forEach(item => {
        item.classList.add('selected');
      });
      this.updateTypeFilterText();
    }
    
    // ניקוי הפילטר השמור ב-localStorage
    try {
      localStorage.removeItem('planningFilterTypes');
      console.log('Type filter cleared from localStorage');
    } catch (error) {
      console.error('Error clearing type filter from localStorage:', error);
    }
    
    this.updateGridFilter();
  }

  clearAccountFilter() {
    console.log('clearAccountFilter called from component');
    
    // ניקוי פילטר החשבונות - כל החשבונות מסומנים
    const accountMenu = this.shadowRoot.getElementById('accountFilterMenu');
    if (accountMenu) {
      accountMenu.querySelectorAll('.account-filter-item').forEach(item => {
        item.classList.add('selected');
      });
      this.updateAccountFilterText();
    }
    
    // ניקוי הפילטר השמור ב-localStorage
    try {
      localStorage.removeItem('planningFilterAccounts');
      console.log('Account filter cleared from localStorage');
    } catch (error) {
      console.error('Error clearing account filter from localStorage:', error);
    }
    
    this.updateGridFilter();
  }

  clearDateRangeFilter() {
    console.log('clearDateRangeFilter called from component');
    
    // ניקוי פילטר טווח תאריכים - רק "כל זמן" מסומן
    const dateRangeMenu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    if (dateRangeMenu) {
      dateRangeMenu.querySelectorAll('.date-range-filter-item').forEach(item => {
        const text = item.querySelector('.option-text').textContent;
        if (text === 'כל זמן') {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      this.updateDateRangeFilterText();
    }
    
    // ניקוי הפילטר השמור ב-localStorage
    try {
      localStorage.removeItem('planningFilterDateRanges');
      console.log('Date range filter cleared from localStorage');
    } catch (error) {
      console.error('Error clearing date range filter from localStorage:', error);
    }
    
    this.updateGridFilter();
  }

  clearSearchFilter() {
    console.log('clearSearchFilter called from component');
    
    // ניקוי שדה החיפוש
    const searchInput = this.shadowRoot.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
      this.toggleSearchClearButton();
    }
    
    // קביעת שם הדף הנוכחי
    const currentPath = window.location.pathname;
    let pageName = 'planning'; // ברירת מחדל
    
    if (currentPath.includes('/designs') || currentPath.includes('/planning')) {
      pageName = 'designs';
    } else if (currentPath.includes('/tracking')) {
      pageName = 'tracking';
    } else if (currentPath.includes('/notes')) {
      pageName = 'notes';
    } else if (currentPath.includes('/accounts')) {
      pageName = 'accounts';
    }
    
    // ניקוי הפילטר השמור ב-localStorage עם שם ספציפי לדף
    try {
      localStorage.removeItem(`${pageName}FilterSearch`);
      localStorage.removeItem('globalFilterSearch');
      console.log('Search filter cleared from localStorage for page:', pageName);
    } catch (error) {
      console.error('Error clearing search filter from localStorage:', error);
    }
    
    this.updateGridFilter();
  }

  toggleSearchClearButton() {
    const searchInput = this.shadowRoot.getElementById('searchFilterInput');
    const clearBtn = this.shadowRoot.getElementById('searchClearBtn');
    
    if (searchInput && clearBtn) {
      if (searchInput.value.trim() !== '') {
        clearBtn.classList.add('show');
      } else {
        clearBtn.classList.remove('show');
      }
    }
  }

  handleSearchInput(event) {
    const searchTerm = event.target.value;
    console.log('Search input changed:', searchTerm);
    
    this.toggleSearchClearButton();
    
    // קביעת שם הדף הנוכחי
    const currentPath = window.location.pathname;
    let pageName = 'planning'; // ברירת מחדל
    
    if (currentPath.includes('/designs') || currentPath.includes('/planning')) {
      pageName = 'designs';
    } else if (currentPath.includes('/tracking')) {
      pageName = 'tracking';
    } else if (currentPath.includes('/notes')) {
      pageName = 'notes';
    } else if (currentPath.includes('/accounts')) {
      pageName = 'accounts';
    }
    
    // שמירת החיפוש ב-localStorage עם שם ספציפי לדף
    try {
      if (searchTerm.trim() === '') {
        // אם השדה ריק, נמחק את הפילטר
        localStorage.removeItem(`${pageName}FilterSearch`);
        localStorage.removeItem('globalFilterSearch');
        console.log('Search term cleared from localStorage');
      } else {
        // אם יש תוכן, נשמור אותו
        localStorage.setItem(`${pageName}FilterSearch`, searchTerm);
        localStorage.setItem('globalFilterSearch', searchTerm);
        console.log('Search term saved to localStorage:', searchTerm);
      }
    } catch (error) {
      console.error('Error saving search term to localStorage:', error);
    }
    
    // עדכון הגריד עם החיפוש
    this.updateGridFilter();
  }

  handleSearchClear() {
    console.log('Search clear button clicked');
    this.clearSearchFilter();
  }



  /**
   * איפוס כל הפילטרים למצב ברירת המחדל
   * מאפסת את כל הפילטרים ב-localStorage ובממשק המשתמש
   * תומכת בדפים שונים עם פילטרים מותאמים לכל דף
   */
  clearAllFilters() {
    console.log('clearAllFilters called from component');
    
    // קביעת שם הדף הנוכחי
    const currentPath = window.location.pathname;
    let pageName = 'planning'; // ברירת מחדל
    
    if (currentPath.includes('/designs') || currentPath.includes('/planning')) {
      pageName = 'designs';
    } else if (currentPath.includes('/tracking')) {
      pageName = 'tracking';
    } else if (currentPath.includes('/notes')) {
      pageName = 'notes';
    } else if (currentPath.includes('/accounts')) {
      pageName = 'accounts';
    }
    
    // ניקוי פילטר הסטטוס - מותאם לדף
    const statusMenu = this.shadowRoot.getElementById('statusFilterMenu');
    if (statusMenu) {
      statusMenu.querySelectorAll('.status-filter-item').forEach(item => {
        const text = item.querySelector('.option-text').textContent;
        if (pageName === 'accounts') {
          // בדף החשבונות - לבחור את כל הסטטוסים כברירת מחדל
          item.classList.add('selected');
        } else if (pageName === 'notes') {
          // עבור דף ההערות - רק "פתוח" מסומן (ברירת מחדל)
          if (text === 'פתוח') {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        } else {
          // דפים אחרים - רק "פתוח" מסומן
          if (text === 'פתוח') {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        }
      });
      this.updateStatusFilterText();
    }
    
    // ניקוי פילטר הסוג - כל הסוגים מסומנים
    const typeMenu = this.shadowRoot.getElementById('typeFilterMenu');
    if (typeMenu) {
      typeMenu.querySelectorAll('.type-filter-item').forEach(item => {
        item.classList.add('selected');
      });
      this.updateTypeFilterText();
    }
    
    // ניקוי פילטר החשבונות - כל החשבונות מסומנים
    const accountMenu = this.shadowRoot.getElementById('accountFilterMenu');
    if (accountMenu) {
      accountMenu.querySelectorAll('.account-filter-item').forEach(item => {
        item.classList.add('selected');
      });
      this.updateAccountFilterText();
    }
    
    // ניקוי פילטר טווח תאריכים - רק "כל זמן" מסומן
    const dateRangeMenu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    if (dateRangeMenu) {
      dateRangeMenu.querySelectorAll('.date-range-filter-item').forEach(item => {
        const text = item.querySelector('.option-text').textContent;
        if (text === 'כל זמן') {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      this.updateDateRangeFilterText();
      
      // סגירת התפריט של פילטר התאריך
      this.closeDateRangeFilter();
    }
    
    // ניקוי שדה החיפוש
    const searchInput = this.shadowRoot.getElementById('searchFilterInput');
    if (searchInput) {
      searchInput.value = '';
      this.toggleSearchClearButton();
    }
    
    // ניקוי הפילטרים השמורים ב-localStorage
    try {
      // מחיקת הפילטרים לפי שם הדף
      localStorage.removeItem(`${pageName}FilterStatuses`);
      localStorage.removeItem(`${pageName}FilterTypes`);
      localStorage.removeItem(`${pageName}FilterAccounts`);
      localStorage.removeItem(`${pageName}FilterDateRanges`);
      localStorage.removeItem(`${pageName}FilterSearch`);
      console.log(`All saved filters cleared from localStorage for ${pageName}`);
    } catch (error) {
      console.error('Error clearing filters from localStorage:', error);
    }
    
    // עדכון הפילטרים
    this.updateGridFilter();
  }

  /**
   * עדכון הפילטרים בגריד
   * אוספת את כל הפילטרים הנבחרים ומעבירה אותם לפונקציה הגלובלית
   * תומכת בדפים שונים עם פילטרים מותאמים לכל דף
   */
  updateGridFilter() {
    console.log('=== updateGridFilter called ===');
    
    // קבלת הסטטוסים הנבחרים
    const statusMenu = this.shadowRoot.getElementById('statusFilterMenu');
    let selectedStatuses = [];
    if (statusMenu) {
      const selectedStatusItems = statusMenu.querySelectorAll('.status-filter-item.selected');
      selectedStatuses = Array.from(selectedStatusItems)
        .map(item => item.querySelector('.option-text').textContent);
    }
    
    // קבלת הסוגים הנבחרים
    const typeMenu = this.shadowRoot.getElementById('typeFilterMenu');
    let selectedTypes = [];
    if (typeMenu) {
      const selectedTypeItems = typeMenu.querySelectorAll('.type-filter-item.selected');
      selectedTypes = Array.from(selectedTypeItems)
        .map(item => item.querySelector('.option-text').textContent);
    }
    
    // קבלת החשבונות הנבחרים
    const accountMenu = this.shadowRoot.getElementById('accountFilterMenu');
    let selectedAccounts = [];
    if (accountMenu) {
      const selectedAccountItems = accountMenu.querySelectorAll('.account-filter-item.selected');
      selectedAccounts = Array.from(selectedAccountItems)
        .map(item => item.getAttribute('data-account'));
    }
    
    // קבלת טווח התאריכים הנבחר
    const dateRangeMenu = this.shadowRoot.getElementById('dateRangeFilterMenu');
    let selectedDateRange = null;
    if (dateRangeMenu) {
      const selectedDateRangeItem = dateRangeMenu.querySelector('.date-range-filter-item.selected');
      if (selectedDateRangeItem) {
        selectedDateRange = selectedDateRangeItem.querySelector('.option-text').textContent;
      }
    }
    
    // קבלת החיפוש הנוכחי
    const searchInput = this.shadowRoot.getElementById('searchFilterInput');
    let searchTerm = null;
    if (searchInput) {
      searchTerm = searchInput.value.trim();
    }
    
    console.log('Selected statuses from component:', selectedStatuses);
    console.log('Selected types from component:', selectedTypes);
    console.log('Selected accounts from component:', selectedAccounts);
    console.log('Selected date range from component:', selectedDateRange);
    console.log('Search term from component:', searchTerm);
    
    // עדכון הצ'קבוקסים מהקומפוננט החדש
    if (typeof window.updateTestCheckboxesFromComponent === 'function') {
      console.log('Calling updateTestCheckboxesFromComponent');
      window.updateTestCheckboxesFromComponent(selectedStatuses);
    } else {
      console.log('updateTestCheckboxesFromComponent function not found');
    }
    
    // קביעת שם הדף הנוכחי
    const currentPath = window.location.pathname;
    let pageName = 'planning'; // ברירת מחדל
    
    if (currentPath.includes('/designs') || currentPath.includes('/planning')) {
      pageName = 'designs';
    } else if (currentPath.includes('/tracking')) {
      pageName = 'tracking';
    } else if (currentPath.includes('/notes')) {
      pageName = 'notes';
    } else if (currentPath.includes('/accounts')) {
      pageName = 'accounts';
    }
    
    console.log('Current page for grid filter:', pageName);
    
    // עדכון הגריד דרך הפונקציה הגלובלית
    if (typeof window.updateGridFromComponent === 'function') {
      console.log('Calling updateGridFromComponent');
      // נעביר pageName דרך הפונקציה הגלובלית הראשית כדי למנוע חוסר תאימות פרמטרים
      if (typeof window.updateGridFromComponentGlobal === 'function') {
        window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm, pageName);
      } else {
        window.updateGridFromComponent(selectedStatuses, selectedTypes, selectedDateRange, searchTerm);
      }
    } else {
      console.log('updateGridFromComponent function not found');
      // נסיון נוסף אחרי זמן קצר
      setTimeout(() => {
        if (typeof window.updateGridFromComponent === 'function') {
          console.log('Retrying updateGridFromComponent');
          if (typeof window.updateGridFromComponentGlobal === 'function') {
            window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm, pageName);
          } else {
            window.updateGridFromComponent(selectedStatuses, selectedTypes, selectedDateRange, searchTerm);
          }
        }
      }, 100);
    }
    
    console.log('=== updateGridFilter completed ===');
  }



  toggleFilterSection() {
    const filterSection = this.shadowRoot.getElementById('statusFilterSection');
    const backgroundWrapper = document.querySelector('.background-wrapper');
    const pageBody = document.querySelector('.page-body');
    const body = document.body;
    
    if (!filterSection) return;
    
    if (filterSection.classList.contains('collapsed')) {
      // פתיחת הפילטר
      filterSection.classList.remove('collapsed');
      
      // עדכון המרווח - מרווח גדול יותר
      if (backgroundWrapper) {
        backgroundWrapper.classList.remove('filter-collapsed');
      }
      if (pageBody) {
        pageBody.classList.remove('filter-collapsed');
      }
      if (body) {
        body.classList.remove('filter-collapsed');
      }
      
    } else {
      // סגירת הפילטר
      filterSection.classList.add('collapsed');
      
      // עדכון המרווח - מרווח קטן יותר
      if (backgroundWrapper) {
        backgroundWrapper.classList.add('filter-collapsed');
      }
      if (pageBody) {
        pageBody.classList.add('filter-collapsed');
      }
      if (body) {
        body.classList.add('filter-collapsed');
      }
    }
  }

  /**
   * עדכון הפילטרים מהערכים השמורים
   * @param {Object} filters - אובייקט עם הפילטרים השמורים
   */
  updateFiltersFromSaved(filters) {
    console.log('=== updateFiltersFromSaved called ===', filters);
    
    if (!filters) {
      console.log('No filters provided');
      return;
    }

    // עדכון פילטר סטטוס
    if (filters.statuses && Array.isArray(filters.statuses)) {
      const statusMenu = this.shadowRoot.getElementById('statusFilterMenu');
      if (statusMenu) {
        const statusItems = statusMenu.querySelectorAll('.status-filter-item');
        statusItems.forEach(item => {
          const text = item.querySelector('.option-text').textContent;
          if (filters.statuses.includes(text)) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
        
        // עדכון טקסט הפילטר
        const statusToggle = this.shadowRoot.getElementById('statusFilterToggle');
        if (statusToggle) {
          const selectedText = statusToggle.querySelector('.selected-status-text');
          if (selectedText) {
            if (filters.statuses.length === 0) {
              selectedText.textContent = 'הכול';
            } else if (filters.statuses.length === 1) {
              selectedText.textContent = filters.statuses[0];
            } else {
              selectedText.textContent = `${filters.statuses.length} נבחרו`;
            }
          }
        }
      }
    }

    // עדכון פילטר סוג
    if (filters.types && Array.isArray(filters.types)) {
      const typeMenu = this.shadowRoot.getElementById('typeFilterMenu');
      if (typeMenu) {
        const typeItems = typeMenu.querySelectorAll('.type-filter-item');
        typeItems.forEach(item => {
          const text = item.querySelector('.option-text').textContent;
          if (filters.types.includes(text)) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
        
        // עדכון טקסט הפילטר
        const typeToggle = this.shadowRoot.getElementById('typeFilterToggle');
        if (typeToggle) {
          const selectedText = typeToggle.querySelector('.selected-type-text');
          if (selectedText) {
            if (filters.types.length === 0) {
              selectedText.textContent = 'הכול';
            } else if (filters.types.length === 1) {
              selectedText.textContent = filters.types[0];
            } else {
              selectedText.textContent = `${filters.types.length} נבחרו`;
            }
          }
        }
      }
    }

    // עדכון פילטר חשבון
    if (filters.accounts && Array.isArray(filters.accounts)) {
      const accountMenu = this.shadowRoot.getElementById('accountFilterMenu');
      if (accountMenu) {
        const accountItems = accountMenu.querySelectorAll('.account-filter-item');
        accountItems.forEach(item => {
          const accountId = item.getAttribute('data-account');
          if (filters.accounts.includes(accountId)) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
        
        // עדכון טקסט הפילטר
        const accountToggle = this.shadowRoot.getElementById('accountFilterToggle');
        if (accountToggle) {
          const selectedText = accountToggle.querySelector('.selected-account-text');
          if (selectedText) {
            if (filters.accounts.length === 0) {
              selectedText.textContent = 'הכול';
            } else if (filters.accounts.length === 1) {
              selectedText.textContent = filters.accounts[0];
            } else {
              selectedText.textContent = `${filters.accounts.length} נבחרו`;
            }
          }
        }
      }
    }

    // עדכון פילטר תאריכים
    if (filters.dateRange) {
      const dateRangeMenu = this.shadowRoot.getElementById('dateRangeFilterMenu');
      if (dateRangeMenu) {
        const dateRangeItems = dateRangeMenu.querySelectorAll('.date-range-filter-item');
        dateRangeItems.forEach(item => {
          const text = item.querySelector('.option-text').textContent;
          if (text === filters.dateRange) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
        
        // עדכון טקסט הפילטר
        const dateRangeToggle = this.shadowRoot.getElementById('dateRangeFilterToggle');
        if (dateRangeToggle) {
          const selectedText = dateRangeToggle.querySelector('.selected-date-range-text');
          if (selectedText) {
            selectedText.textContent = filters.dateRange || 'כל זמן';
          }
        }
      }
    }

    // עדכון פילטר חיפוש
    if (filters.search !== undefined) {
      const searchInput = this.shadowRoot.getElementById('searchFilterInput');
      if (searchInput) {
        searchInput.value = filters.search || '';
        this.toggleSearchClearButton();
      }
    }

    console.log('=== updateFiltersFromSaved completed ===');
  }
}

// רישום הקומפוננט
customElements.define('app-header', AppHeader);

// פונקציה גלובלית לבדיקת הקומפוננטה
window.testComponentFilter = function() {
  console.log('=== Testing component filter ===');
  const header = document.querySelector('app-header');
  if (header && header.shadowRoot) {
    console.log('Header component found');
    
    // בדיקה של הפילטר
    const menu = header.shadowRoot.getElementById('statusFilterMenu');
    if (menu) {
      console.log('Filter menu found');
      const items = menu.querySelectorAll('.status-filter-item');
      console.log('Found filter items:', items.length);
      
      // בחירת רק "פתוח" ו"סגור"
      items.forEach(item => {
        const text = item.querySelector('.option-text').textContent;
        if (text === 'פתוח' || text === 'סגור') {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      
      // עדכון הפילטר
      header.updateGridFilter();
      console.log('Component filter updated');
    } else {
      console.log('Filter menu not found');
    }
  } else {
    console.log('Header component not found');
  }
  console.log('=== Component test completed ===');
};

// פונקציה גלובלית לסגירת פילטרים אחרים
window.closeOtherFilters = function(excludeFilter) {
  const header = document.querySelector('app-header');
  if (header && typeof header.closeOtherFilters === 'function') {
    header.closeOtherFilters(excludeFilter);
  }
};

// פונקציה גלובלית לסגירת כל הפילטרים
window.closeAllFilters = function() {
  const header = document.querySelector('app-header');
  if (header && typeof header.closeAllDropdowns === 'function') {
    header.closeAllDropdowns();
  }
};


