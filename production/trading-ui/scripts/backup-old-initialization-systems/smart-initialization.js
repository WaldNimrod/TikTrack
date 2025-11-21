/**
 * Smart Initialization System - TikTrack
 * =====================================
 *
 * מערכת אתחול חכמה שמתאימה את עצמה לעמודים שונים
 * ומאפשרת גמישות מקסימלית עם תחזוקה קלה
 *
 * FEATURES:
 * =========
 * 1. Auto-Detection - זיהוי אוטומטי של סוג העמוד
 * 2. Adaptive Configuration - קונפיגורציה מותאמת
 * 3. Performance Optimization - אופטימיזציה לביצועים
 * 4. Error Resilience - עמידות בשגיאות
 * 5. Extensibility - הרחבה קלה
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== SMART INITIALIZATION SYSTEM =====

class SmartInitialization {
  constructor() {
    this.initialized = false;
    this.pageInfo = null;
    this.detectedSystems = [];
    this.performanceMetrics = {
      startTime: null,
      endTime: null,
      stageTimes: {},
    };
  }

  /**
   * Smart page detection and initialization
   */
  async smartInitialize() {
    if (this.initialized) {
      console.log('✅ Page already initialized');
      return;
    }

    console.log('🧠 Starting Smart Initialization...');
    this.performanceMetrics.startTime = Date.now();

    try {
      // Step 1: Detect page information
      await this.detectPageInfo();

      // Step 2: Detect available systems
      await this.detectAvailableSystems();

      // Step 3: Generate optimal configuration
      const config = this.generateOptimalConfig();

      // Step 4: Execute smart initialization
      await this.executeSmartInitialization(config);

      this.performanceMetrics.endTime = Date.now();
      this.initialized = true;

      this.logPerformanceMetrics();
      console.log('✅ Smart Initialization Complete!');
    } catch (error) {
      console.error('❌ Smart Initialization Failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Detect page information
   */
  async detectPageInfo() {
    console.log('🔍 Detecting page information...');

    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index';
    const pageName = filename.replace('.html', '');

    this.pageInfo = {
      name: pageName,
      path: path,
      filename: filename,
      isMainPage: this.isMainPage(pageName),
      isDevelopmentPage: this.isDevelopmentPage(pageName),
      isTradingPage: this.isTradingPage(pageName),
      isManagementPage: this.isManagementPage(pageName),
      hasForms: document.querySelectorAll('form').length > 0,
      hasTables: document.querySelectorAll('table').length > 0,
      hasFilters: document.querySelectorAll('.filter-section, .header-filters').length > 0,
      hasCharts: document.querySelectorAll('canvas, .chart-container').length > 0,
    };

    console.log('📄 Page Info:', this.pageInfo);
  }

  /**
   * Detect available systems
   */
  async detectAvailableSystems() {
    console.log('🔍 Detecting available systems...');

    this.detectedSystems = [];

    // Core Systems
    if (typeof window.NotificationSystem !== 'undefined') {
      this.detectedSystems.push('notification');
    }

    if (typeof window.HeaderSystem !== 'undefined') {
      this.detectedSystems.push('header');
    }

    if (typeof window.FilterSystem !== 'undefined') {
      this.detectedSystems.push('filter');
    }

    // Page Systems
    if (typeof window.initializePageFilters === 'function') {
      this.detectedSystems.push('pageFilters');
    }

    if (typeof window.initializeValidation === 'function') {
      this.detectedSystems.push('validation');
    }

    if (typeof window.setupSortableHeaders === 'function') {
      this.detectedSystems.push('tables');
    }

    // Preferences
    if (typeof window.preferencesCache !== 'undefined') {
      this.detectedSystems.push('preferences');
    }

    // Storage
    if (typeof window.IndexedDB !== 'undefined') {
      this.detectedSystems.push('indexeddb');
    }

    console.log('🔧 Detected Systems:', this.detectedSystems);
  }

  /**
   * Generate optimal configuration
   */
  generateOptimalConfig() {
    console.log('⚙️ Generating optimal configuration...');

    const config = {
      name: this.pageInfo.name,
      requiresFilters: this.pageInfo.hasFilters && this.detectedSystems.includes('filter'),
      requiresValidation: this.pageInfo.hasForms && this.detectedSystems.includes('validation'),
      requiresTables: this.pageInfo.hasTables && this.detectedSystems.includes('tables'),
      requiresCharts: this.pageInfo.hasCharts,
      customInitializers: [],
    };

    // Add page-specific custom initializers
    if (this.pageInfo.isTradingPage) {
      config.customInitializers.push(this.initializeTradingPage.bind(this));
    }

    if (this.pageInfo.isDevelopmentPage) {
      config.customInitializers.push(this.initializeDevelopmentPage.bind(this));
    }

    if (this.pageInfo.hasCharts) {
      config.customInitializers.push(this.initializeCharts.bind(this));
    }

    console.log('⚙️ Optimal Config:', config);
    return config;
  }

  /**
   * Execute smart initialization
   */
  async executeSmartInitialization(config) {
    console.log('🚀 Executing smart initialization...');

    // Use the unified application initializer
    await window.initializeApplication(config);
  }

  /**
   * Page type detection methods
   */
  isMainPage(pageName) {
    const mainPages = ['index', 'preferences', 'research'];
    return mainPages.includes(pageName);
  }

  isDevelopmentPage(pageName) {
    const devPages = [
      'system-management',
      'crud-testing-dashboard',
      'external-data-dashboard',
      'code-quality-dashboard',
      'notifications-center',
      'db_display',
    ];
    return devPages.includes(pageName);
  }

  isTradingPage(pageName) {
    const tradingPages = [
      'trades',
      'executions',
      'alerts',
      'trading_accounts',
      'cash_flows',
      'tickers',
    ];
    return tradingPages.includes(pageName);
  }

  isManagementPage(pageName) {
    const managementPages = ['trading_accounts', 'cash_flows', 'notes'];
    return managementPages.includes(pageName);
  }

  /**
   * Custom initializers for different page types
   */
  async initializeTradingPage(pageConfig) {
    console.log('📈 Initializing trading page...');

    // Load trading data if functions exist
    if (typeof window.loadTradingData === 'function') {
      await window.loadTradingData();
    }

    // Setup trading-specific handlers
    if (typeof window.setupTradingHandlers === 'function') {
      window.setupTradingHandlers();
    }
  }

  async initializeDevelopmentPage(pageConfig) {
    console.log('🔧 Initializing development page...');

    // Load development tools
    if (typeof window.loadDevelopmentTools === 'function') {
      await window.loadDevelopmentTools();
    }

    // Setup development-specific handlers
    if (typeof window.setupDevelopmentHandlers === 'function') {
      window.setupDevelopmentHandlers();
    }
  }

  async initializeCharts(pageConfig) {
    console.log('📊 Initializing charts...');

    // Initialize charts if available
    if (typeof window.initializeCharts === 'function') {
      await window.initializeCharts();
    }

    // Load chart data
    if (typeof window.loadChartData === 'function') {
      await window.loadChartData();
    }
  }

  /**
   * Performance monitoring
   */
  logPerformanceMetrics() {
    const totalTime = this.performanceMetrics.endTime - this.performanceMetrics.startTime;

    console.log('📊 Performance Metrics:', {
      totalTime: `${totalTime}ms`,
      pageInfo: this.pageInfo,
      detectedSystems: this.detectedSystems.length,
      systems: this.detectedSystems,
    });

    // Store metrics for analysis
    if (typeof window.storePerformanceMetrics === 'function') {
      window.storePerformanceMetrics({
        page: this.pageInfo.name,
        totalTime: totalTime,
        systems: this.detectedSystems,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Error handling
   */
  handleInitializationError(error) {
    console.error('❌ Smart Initialization Error:', error);

    // Show user notification
    if (typeof window.showNotification === 'function') {
      window.showNotification('❌ Page initialization failed', 'error');
    }

    // Log error for analysis
    if (typeof window.logError === 'function') {
      window.logError('SmartInitialization', error);
    }
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      pageInfo: this.pageInfo,
      detectedSystems: this.detectedSystems,
      performanceMetrics: this.performanceMetrics,
    };
  }

  /**
   * Reset for testing
   */
  reset() {
    this.initialized = false;
    this.pageInfo = null;
    this.detectedSystems = [];
    this.performanceMetrics = {
      startTime: null,
      endTime: null,
      stageTimes: {},
    };
  }
}

// ===== GLOBAL INSTANCE =====

window.SmartInitialization = SmartInitialization;
window.smartInit = new SmartInitialization();

// ===== GLOBAL EXPORT =====

window.smartInitialize = async function () {
  return await window.smartInit.smartInitialize();
};

window.getSmartInitStatus = function () {
  return window.smartInit.getStatus();
};

// ===== AUTO-INITIALIZATION =====

// Main smart initialization - replaces all DOMContentLoaded listeners
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🧠 DOM Content Loaded - Starting Smart Initialization');

  try {
    // Small delay to ensure all scripts are loaded
    setTimeout(async () => {
      await window.smartInitialize();
    }, 100);
  } catch (error) {
    console.error('❌ Smart auto-initialization failed:', error);
  }
});
