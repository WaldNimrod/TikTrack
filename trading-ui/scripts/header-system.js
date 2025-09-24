/**
 * Header System - New Modular Architecture (No ES6 Modules)
 * מערכת כותרת חדשה - ארכיטקטורה מודולרית ללא ES6 modules
 * 
 * @version 6.0.0
 * @lastUpdated January 15, 2025
 * @author TikTrack Development Team
 */

console.log('🚀 Loading New Header System v6.0.0...');

// Global variables for the new system
window.HeaderSystemNew = window.HeaderSystemNew || {};
window.HeaderSystemNew.version = '6.0.0';

/**
 * Simple Header System Implementation
 * יישום פשוט של מערכת הכותרת החדשה
 */
class HeaderSystem {
  constructor(options = {}) {
    this.config = {
      autoInit: true,
      debug: true,
      ...options
    };
    this.isInitialized = false;
    this.log = this.createLogger();
    
    this.log.info('HeaderSystem constructor called');
    
    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * Create logger
   */
  createLogger() {
    return {
      info: (msg, ...args) => console.log(`[HeaderSystem] ${msg}`, ...args),
      debug: (msg, ...args) => this.config.debug && console.log(`[HeaderSystem DEBUG] ${msg}`, ...args),
      warn: (msg, ...args) => console.warn(`[HeaderSystem WARN] ${msg}`, ...args),
      error: (msg, ...args) => console.error(`[HeaderSystem ERROR] ${msg}`, ...args)
    };
  }

  /**
   * Initialize the header system
   */
  async init() {
    try {
      this.log.info('Initializing Header System...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // Create header
      await this.createHeader();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.log.info('Header System initialized successfully!');
      
    } catch (error) {
      this.log.error('Failed to initialize Header System:', error);
    }
  }

  /**
   * Create the header element
   */
  async createHeader() {
    try {
      this.log.debug('Creating header...');
      
      // Find or create unified-header element
      let headerElement = document.getElementById('unified-header');
      if (!headerElement) {
        this.log.warn('unified-header element not found, creating one...');
        headerElement = document.createElement('div');
        headerElement.id = 'unified-header';
        document.body.insertBefore(headerElement, document.body.firstChild);
      }
      
      // Create header HTML
      const headerHTML = this.getHeaderHTML();
      headerElement.innerHTML = headerHTML;
      
      this.log.debug('Header created successfully');
      
    } catch (error) {
      this.log.error('Failed to create header:', error);
    }
  }

  /**
   * Get header HTML
   */
  getHeaderHTML() {
    return `
      <div class="header-container">
        <div class="header-top">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="logo">
              <img src="images/tiktrack_logo_64px.png" alt="TikTrack" class="logo-image" onerror="this.style.display='none'">
              <span class="logo-text">TikTrack</span>
            </div>
          </div>
          
          <!-- Navigation Menu -->
          <nav class="header-nav">
            <ul class="main-nav">
              <li class="tiktrack-nav-item">
                <a href="trades.html" class="tiktrack-nav-link">עסקעות</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="executions.html" class="tiktrack-nav-link">ביצועים</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="trade_plans.html" class="tiktrack-nav-link">תכנוני טריידים</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="tickers.html" class="tiktrack-nav-link">טיקרים</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="trading_accounts.html" class="tiktrack-nav-link">חשבונות</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="cash_flows.html" class="tiktrack-nav-link">תזרים מזומנים</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="notes.html" class="tiktrack-nav-link">הערות</a>
              </li>
              <li class="tiktrack-nav-item">
                <a href="alerts.html" class="tiktrack-nav-link">התראות</a>
              </li>
              <li class="tiktrack-nav-item dropdown">
                <a href="#" class="tiktrack-nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  כלי פיתוח <span class="tiktrack-dropdown-arrow">▼</span>
                </a>
                <ul class="tiktrack-dropdown-menu">
                  <li><a href="system-management.html" class="tiktrack-dropdown-item">ניהול מערכת</a></li>
                  <li><a href="server-monitor.html" class="tiktrack-dropdown-item">מעקב שרת</a></li>
                  <li><a href="crud-testing-dashboard.html" class="tiktrack-dropdown-item">בדיקות CRUD</a></li>
                  <li><a href="external-data-dashboard.html" class="tiktrack-dropdown-item">נתונים חיצוניים</a></li>
                </ul>
              </li>
              <li class="tiktrack-nav-item">
                <a href="preferences.html" class="tiktrack-nav-link">הגדרות</a>
              </li>
            </ul>
          </nav>
          
          <!-- Action Buttons -->
          <div class="header-actions">
            <button class="cache-clear-btn" onclick="clearCache()" title="נקה מטמון">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
        
        <!-- Filter Section -->
        <div class="filters-container" id="headerFilters" style="display: none;">
          <div class="header-filters">
            <div class="filter-group">
              <button class="filter-toggle" onclick="toggleStatusFilter()">
                סטטוס <span id="selectedStatus">כל הסטטוסים</span> <span class="tiktrack-dropdown-arrow">▼</span>
              </button>
              <div class="filter-menu" id="statusFilterMenu">
                <div class="filter-option" onclick="selectStatusOption('כל הסטטוסים')">כל הסטטוסים</div>
                <div class="filter-option" onclick="selectStatusOption('פתוח')">פתוח</div>
                <div class="filter-option" onclick="selectStatusOption('סגור')">סגור</div>
                <div class="filter-option" onclick="selectStatusOption('מבוטל')">מבוטל</div>
              </div>
            </div>
            
            <div class="filter-group">
              <button class="filter-toggle" onclick="toggleTypeFilter()">
                סוג השקעה <span id="selectedType">כל הסוגים</span> <span class="tiktrack-dropdown-arrow">▼</span>
              </button>
              <div class="filter-menu" id="typeFilterMenu">
                <div class="filter-option" onclick="selectTypeOption('כל הסוגים')">כל הסוגים</div>
                <div class="filter-option" onclick="selectTypeOption('השקעה')">השקעה</div>
                <div class="filter-option" onclick="selectTypeOption('סווינג')">סווינג</div>
                <div class="filter-option" onclick="selectTypeOption('פסיבי')">פסיבי</div>
              </div>
            </div>
            
            <div class="filter-group">
              <button class="filter-toggle" onclick="toggleAccountFilter()">
                חשבון <span id="selectedAccount">כל החשבונות</span> <span class="tiktrack-dropdown-arrow">▼</span>
              </button>
              <div class="filter-menu" id="accountFilterMenu">
                <div class="filter-option" onclick="selectAccountOption('כל החשבונות')">כל החשבונות</div>
                <!-- Accounts will be loaded dynamically -->
              </div>
            </div>
            
            <div class="filter-group">
              <button class="filter-toggle" onclick="toggleDateFilter()">
                תאריך <span id="selectedDate">כל התאריכים</span> <span class="tiktrack-dropdown-arrow">▼</span>
              </button>
              <div class="filter-menu" id="dateFilterMenu">
                <div class="filter-option" onclick="selectDateOption('כל התאריכים')">כל התאריכים</div>
                <div class="filter-option" onclick="selectDateOption('היום')">היום</div>
                <div class="filter-option" onclick="selectDateOption('אתמול')">אתמול</div>
                <div class="filter-option" onclick="selectDateOption('השבוע')">השבוע</div>
                <div class="filter-option" onclick="selectDateOption('החודש')">החודש</div>
                <div class="filter-option" onclick="selectDateOption('השנה')">השנה</div>
              </div>
            </div>
            
            <div class="filter-group">
              <div class="search-input-wrapper">
                <input type="text" class="search-filter-input" placeholder="חיפוש..." id="searchFilter">
                <button class="search-clear-btn" onclick="clearSearchFilter()" title="נקה חיפוש">×</button>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="reset-btn" onclick="resetAllFilters()">איפוס</button>
              <button class="clear-btn" onclick="clearAllFilters()">נקה הכל</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.log.debug('Setting up event listeners...');
    
    // Filter toggle button
    const filterToggleBtn = document.querySelector('.filter-toggle-btn');
    if (filterToggleBtn) {
      filterToggleBtn.addEventListener('click', () => {
        this.toggleFilterSection();
      });
    }
    
    // Search filter
    const searchInput = document.getElementById('searchFilter');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearchFilter(e.target.value);
      });
    }
    
    this.log.debug('Event listeners setup complete');
  }

  /**
   * Toggle filter section
   */
  toggleFilterSection() {
    const filtersContainer = document.getElementById('headerFilters');
    if (filtersContainer) {
      const isVisible = filtersContainer.style.display !== 'none';
      filtersContainer.style.display = isVisible ? 'none' : 'block';
      this.log.debug(`Filter section ${isVisible ? 'hidden' : 'shown'}`);
    }
  }

  /**
   * Handle search filter
   */
  handleSearchFilter(value) {
    this.log.debug('Search filter changed:', value);
    // This will be connected to the existing filter system
    if (window.updateFilter) {
      window.updateFilter('search', value);
    }
  }

  /**
   * Get system info
   */
  getInfo() {
    return {
      version: '6.0.0',
      isInitialized: this.isInitialized,
      components: ['Header', 'Menu', 'Filters'],
      services: ['Event', 'State', 'UI']
    };
  }
}

// Global functions for compatibility with existing system
window.toggleFilterSection = function() {
  if (window.headerSystemInstance) {
    window.headerSystemInstance.toggleFilterSection();
  }
};

window.clearCache = function() {
  console.log('Cache cleared!');
  // Add cache clearing logic here
};

// Initialize the system
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing New Header System...');
  window.headerSystemInstance = new HeaderSystem();
  window.HeaderSystem = HeaderSystem; // For compatibility
});

console.log('✅ New Header System v6.0.0 loaded successfully!');
