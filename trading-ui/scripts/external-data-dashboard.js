'use strict';

/**
 * External Data Dashboard Controller
 * Integrates with the documented external data systems and relies solely on real backend responses.
 * Documentation: documentation/features/external_data/EXTERNAL_DATA_SYSTEM.md
 * 
 * ============================================================================
 * FUNCTION INDEX - External Data Dashboard
 * ============================================================================
 * 
 * Initialization:
 * - initializeExternalDataDashboard() - Initialize external data dashboard
 * 
 * Data Loading:
 * - loadExternalDataMetrics() - Load external data metrics
 * - refreshExternalDataDashboard() - Refresh dashboard data
 * 
 * Chart Management:
 * - updateResponseTimeChart() - Update response time chart
 * - updateDataQualityChart() - Update data quality chart
 * - updateProviderComparisonChart() - Update provider comparison chart
 * - updateErrorAnalysisChart() - Update error analysis chart
 * 
 * UI Functions:
 * - updateDashboardDisplay() - Update dashboard display
 * - formatMetricValue() - Format metric value for display
 * 
 * ============================================================================
 */
(function () {
  const MODULE_NAME = 'external-data-dashboard';
  const AUTO_REFRESH_INTERVAL_MS = 30000;
  const PERFORMANCE_SAMPLE_INTERVAL_MS = 15000;
  const NOT_AVAILABLE_TEXT = 'לא זמין';
  const CHART_IDS = {
    responseTime: 'externalDataResponseTime',
    dataQuality: 'externalDataQuality',
    providerComparison: 'externalDataProviderComparison',
    errorAnalysis: 'externalDataErrorAnalysis'
  };

  const logger = window.Logger || {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {}
  };

  /**
   * Notification helper object
   * @type {Object}
   */
  const notification = {
    /**
     * Show success notification
     * @param {string} title - Notification title
     * @param {string} [message=''] - Notification message
     * @param {number} [duration=4000] - Notification duration in milliseconds
     * @param {string} [category='system'] - Notification category
     * @returns {void}
     */
    success(title, message = '', duration = 4000, category = 'system') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(title, message, duration, category);
      }
    },
    /**
     * Show error notification
     * @param {string} title - Notification title
     * @param {string} [message=''] - Notification message
     * @returns {void}
     */
    error(title, message = '') {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(title, message);
      }
    },
    /**
     * Show warning notification
     * @param {string} title - Notification title
     * @param {string} [message=''] - Notification message
     * @param {number} [duration=4000] - Notification duration in milliseconds
     * @param {string} [category='system'] - Notification category
     * @returns {void}
     */
    warning(title, message = '', duration = 4000, category = 'system') {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification(title, message, duration, category);
      }
    },
    /**
     * Show info notification
     * @param {string} title - Notification title
     * @param {string} [message=''] - Notification message
     * @param {number} [duration=4000] - Notification duration in milliseconds
     * @param {string} [category='system'] - Notification category
     * @returns {void}
     */
    info(title, message = '', duration = 4000, category = 'system') {
      if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification(title, message, duration, category);
      }
    },
    /**
     * Show detailed error notification with developer information
     * @param {string} title - Notification title
     * @param {string} userMessage - User-facing error message
     * @param {string[]} [developerDetails=[]] - Developer details array
     * @param {Object} [options={}] - Additional options
     * @param {number} [options.duration] - Notification duration
     * @param {string} [options.category] - Notification category
     * @returns {void}
     */
    detailedError(title, userMessage, developerDetails = [], options = {}) {
      const developerSection = developerDetails.length
        ? `---\nמידע למפתח:\n${developerDetails.join('\n')}`
        : '';
      const body = developerSection ? `${userMessage}\n\n${developerSection}` : userMessage;

      // Show error notification in corner (not modal!)
      // If detailed info needed, user can expand via button
      if (typeof window.showErrorNotification === 'function') {
        await window.showErrorNotification(title, userMessage, options.duration ?? 6000, options.category ?? 'system');
        
        // If there's developer details, add "Show Details" button that opens modal
        if (developerSection) {
          setTimeout(() => {
            const notifications = document.querySelectorAll('.notification');
            const lastNotification = notifications[notifications.length - 1];
            
            if (lastNotification) {
              const detailsBtn = document.createElement('button');
              detailsBtn.className = 'btn btn-sm btn-link notification-details-btn';
              detailsBtn.style.cssText = 'padding: 2px 8px; margin-top: 4px; font-size: 0.85em; text-decoration: underline; color: inherit;';
              detailsBtn.textContent = 'הצג פרטים למפתח';
              detailsBtn.onclick = () => {
                if (typeof window.showDetailsModal === 'function') {
                  window.showDetailsModal(title, `<div style="white-space: pre-line; font-family: monospace; font-size: 0.9em;">${body}</div>`, {
                    includeCopyButton: true
                  });
                }
                lastNotification.remove();
              };
              
              const contentDiv = lastNotification.querySelector('.notification-content');
              if (contentDiv) {
                contentDiv.appendChild(detailsBtn);
              }
            }
          }, 100);
        }
      }
    }
  };

  /**
   * Get safe text value or fallback
   * @param {*} value - Value to check
   * @param {string} [fallback=NOT_AVAILABLE_TEXT] - Fallback text if value is invalid
   * @returns {string} Safe text value
   */
  function safeText(value, fallback = NOT_AVAILABLE_TEXT) {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return fallback;
    }
    return value;
  }

  /**
   * Format number with locale formatting
   * @param {*} value - Value to format
   * @returns {string} Formatted number or NOT_AVAILABLE_TEXT
   */
  /**
   * Format number with commas
   * @deprecated Use window.formatNumberWithCommas() from translation-utils.js instead
   * This function is kept for backward compatibility but should use the centralized Translation Utilities
   */
  function formatNumber(value) {
    // Use Translation Utilities if available
    if (window.formatNumberWithCommas && typeof window.formatNumberWithCommas === 'function') {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return NOT_AVAILABLE_TEXT;
      }
      return window.formatNumberWithCommas(value, { maximumFractionDigits: 0 });
    }
    
    // Fallback to local implementation
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return NOT_AVAILABLE_TEXT;
    }
    const formatter = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
    return formatter.format(Number(value));
  }

  /**
   * Format decimal number with specified digits
   * @param {*} value - Value to format
   * @param {number} [digits=2] - Number of decimal digits
   * @returns {string} Formatted decimal or NOT_AVAILABLE_TEXT
   */
  function formatDecimal(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return NOT_AVAILABLE_TEXT;
    }
    const formatter = new Intl.NumberFormat('he-IL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return formatter.format(Number(value));
  }

  /**
   * Format value as percentage
   * @param {*} value - Value to format (0-1 or 0-100)
   * @returns {string} Formatted percentage or NOT_AVAILABLE_TEXT
   */
  function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return NOT_AVAILABLE_TEXT;
    }
    const numeric = Number(value);
    const percentValue = numeric <= 1 && numeric >= -1 ? numeric * 100 : numeric;
    return `${formatDecimal(percentValue, 2)}%`;
  }

  /**
   * Format duration in milliseconds
   * @param {number} durationMs - Duration in milliseconds
   * @returns {string} Formatted duration (ms or s) or NOT_AVAILABLE_TEXT
   */
  function formatDurationMs(durationMs) {
    if (typeof durationMs !== 'number' || Number.isNaN(durationMs)) {
      return NOT_AVAILABLE_TEXT;
    }
    if (durationMs < 1000) {
      return `${Math.round(durationMs)}ms`;
    }
    const seconds = durationMs / 1000;
    return `${seconds.toFixed(2)}s`;
  }

  /**
   * Format relative time from ISO string
   * @param {string} isoString - ISO date string
   * @returns {string} Relative time string or NOT_AVAILABLE_TEXT
   */
  function formatRelativeTime(isoString) {
    if (!isoString) {
      return NOT_AVAILABLE_TEXT;
    }
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return NOT_AVAILABLE_TEXT;
    }
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) {
      return 'בעתיד';
    }
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) {
      return 'עכשיו';
    }
    if (diffMinutes < 60) {
      return `לפני ${diffMinutes} דקות`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `לפני ${diffHours} שעות`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `לפני ${diffDays} ימים`;
  }

  /**
   * Extract ISO timestamp from value
   * @param {*} value - Value to extract timestamp from (string or object)
   * @returns {string|null} ISO timestamp or null
   */
  function extractTimestampIso(value) {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return value.utc || value.local || value.display || null;
    }
    return null;
  }

  /**
   * Format relative time from payload value
   * @param {*} value - Payload value (string or object)
   * @returns {string} Relative time string or NOT_AVAILABLE_TEXT
   */
  function formatRelativeFromPayload(value) {
    const isoValue = extractTimestampIso(value);
    return isoValue ? formatRelativeTime(isoValue) : NOT_AVAILABLE_TEXT;
  }

  /**
   * Format time payload for developer display
   * @param {*} value - Time value (string, object, or other)
   * @returns {string} Formatted time string for developers
   */
  function formatTimePayloadForDeveloper(value) {
    if (!value) {
      return 'לא זמין';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const display = safeText(value.display, null);
      const timezoneLabel = safeText(value.timezone, null);
      const utcValue = safeText(value.utc, null);
      const components = [];

      if (display) {
        components.push(display);
      }

      if (timezoneLabel) {
        components.push(`אזור זמן: ${timezoneLabel}`);
      }

      if (utcValue) {
        components.push(`UTC: ${utcValue}`);
      }

      if (Number.isFinite(Number(value.epochMs))) {
        components.push(`epochMs: ${value.epochMs}`);
      }

      return components.length ? components.join(' | ') : JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Ensure ExternalDataDashboard instance is initialized
   * @returns {Promise<Object>} ExternalDataDashboard instance
   * @throws {Error} If ExternalDataDashboard class is not available
   */
  async function ensureExternalDashboardInstance() {
    if (!window.ExternalDataDashboard || typeof window.ExternalDataDashboard !== 'function') {
      throw new Error('ExternalDataDashboard class is not available');
    }

    if (!window.externalDataDashboard) {
      window.externalDataDashboard = new window.ExternalDataDashboard();
    }

    if (!window.externalDataDashboard.isInitialized) {
      await window.externalDataDashboard.init();
    }

    return window.externalDataDashboard;
  }

  /**
   * Set element text content by ID
   * @param {string} id - Element ID
   * @param {string} value - Text value to set
   * @returns {void}
   */
  function setElementText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  function getElement(id) {
    return document.getElementById(id);
  }

  /**
   * Set status indicator element
   * @param {string} elementId - Element ID
   * @param {string} status - Status value ('active', 'warning', 'error', 'inactive')
   * @param {Object} [options={}] - Options for status classes
   * @param {string} [options.activeClass='status-indicator active'] - Active class
   * @param {string} [options.inactiveClass='status-indicator inactive'] - Inactive class
   * @param {string} [options.errorClass='status-indicator error'] - Error class
   * @returns {void}
   */
  function setStatusIndicator(elementId, status, options = {}) {
    const element = getElement(elementId);
    if (!element) {
      return;
    }
    const { activeClass = 'status-indicator active', inactiveClass = 'status-indicator inactive', errorClass = 'status-indicator error' } = options;
    let cssClass = inactiveClass;
    let textValue = NOT_AVAILABLE_TEXT;

    if (status === 'active') {
      cssClass = activeClass;
      textValue = 'פעיל';
    } else if (status === 'warning') {
      cssClass = 'status-indicator warning';
      textValue = 'בעיה';
    } else if (status === 'error') {
      cssClass = errorClass;
      textValue = 'שגיאה';
    } else if (status === 'inactive') {
      cssClass = inactiveClass;
      textValue = 'לא פעיל';
    }

    element.className = cssClass;
    element.textContent = textValue;
  }

  /**
   * Get theme fonts from ChartTheme
   * @returns {Object|null} Theme fonts object or null
   */
  function getThemeFonts() {
    if (window.ChartTheme && typeof window.ChartTheme.getTheme === 'function') {
      const theme = window.ChartTheme.getTheme();
      if (theme?.fonts) {
        return {
          family: theme.fonts.family || 'Noto Sans Hebrew, Arial, sans-serif',
          size: theme.fonts.size || 12,
          weight: theme.fonts.weight || 'normal'
        };
      }
    }
    return {
      family: 'Noto Sans Hebrew, Arial, sans-serif',
      size: 12,
      weight: 'normal'
    };
  }

  /**
   * External Data Dashboard class
   * Manages the external data dashboard UI and data loading
   */
  class ExternalDataDashboard {
    /**
     * Create ExternalDataDashboard instance
     * @returns {void}
     */
    constructor() {
      this.isInitialized = false;
      this.autoRefreshHandle = null;
      this.statusData = null;
      this.providers = [];
      this.cacheStats = null;
      this.logs = [];
      this.filteredLogs = [];
      this.performanceSamples = [];
      this.performanceInterval = null;
      this.responseTimeChart = null;
      this.dataQualityChart = null;
      this.providerComparisonChart = null;
      this.errorAnalysisChart = null;
      this.chartSystemUnavailable = false;
    }

    /**
     * Get ChartSystem instance
     * @returns {Object|null} ChartSystem instance or null if unavailable
     */
    getChartSystem() {
      if (window.ChartSystem) {
        this.chartSystemUnavailable = false;
        return window.ChartSystem;
      }
      if (!this.chartSystemUnavailable) {
        logger.warn(`${MODULE_NAME}:chart-system-missing`);
        this.chartSystemUnavailable = true;
      }
      return null;
    }

    /**
     * Destroy chart by ID and optionally clear property
     * @param {string} id - Chart ID
     * @param {string|null} [propertyName=null] - Property name to clear
     * @returns {boolean} True if destroyed successfully
     */
    destroyChart(id, propertyName = null) {
      const chartSystem = this.getChartSystem();
      if (chartSystem && typeof chartSystem.destroy === 'function') {
        try {
          chartSystem.destroy(id);
        } catch (error) {
          logger.warn(`${MODULE_NAME}:chart-destroy-warning`, { id, error });
        }
      }

      if (propertyName && this[propertyName]) {
        try {
          if (typeof this[propertyName].destroy === 'function') {
            this[propertyName].destroy();
          }
        } catch (error) {
          logger.warn(`${MODULE_NAME}:local-chart-destroy-warning`, { id, error });
        }
        this[propertyName] = null;
      }
      return true;
    }

    /**
     * Initialize performance monitoring
     * @returns {void}
     */
    initializePerformanceMonitoring() {
      // Update performance info when page loads
      const updatePerformanceInfo = () => {
        // Page load time
        const loadTimeElement = getElement('page-load-time');
        if (loadTimeElement && window.performance && window.performance.timing) {
          const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
          if (!Number.isNaN(loadTime) && loadTime >= 0) {
            loadTimeElement.textContent = `${Math.round(loadTime)}ms`;
          } else {
            // Fallback to performance.now() if timing is not available
            const pageLoadTime = performance.now();
            loadTimeElement.textContent = `${Math.round(pageLoadTime)}ms`;
          }
        } else if (loadTimeElement) {
          // Fallback if performance.timing is not available
          const pageLoadTime = performance.now();
          loadTimeElement.textContent = `${Math.round(pageLoadTime)}ms`;
        }

        // Memory usage
        const memoryElement = getElement('memory-usage');
        if (memoryElement && window.performance && window.performance.memory) {
          const memoryUsedMB = Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
          memoryElement.textContent = `${memoryUsedMB}MB`;
        } else if (memoryElement) {
          memoryElement.textContent = NOT_AVAILABLE_TEXT;
        }

        // User Agent
        const userAgentElement = getElement('user-agent');
        if (userAgentElement && navigator.userAgent) {
          const userAgent = navigator.userAgent;
          // Truncate to 50 characters if too long
          userAgentElement.textContent = userAgent.length > 50 
            ? userAgent.substring(0, 50) + '...' 
            : userAgent;
        }

        // Platform
        const platformElement = getElement('platform');
        if (platformElement && navigator.platform) {
          platformElement.textContent = navigator.platform;
        }
      };

      // Update immediately if DOM is ready
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Small delay to ensure performance metrics are available
        setTimeout(updatePerformanceInfo, 100);
      } else {
        // Wait for page load
        window.addEventListener('load', () => {
          setTimeout(updatePerformanceInfo, 100);
        });
      }
    }

    /**
     * Initialize the dashboard
     * @returns {Promise<void>}
     */
    async init() {
      if (this.isInitialized) {
        logger.debug(`${MODULE_NAME}:init:skipped - already initialized`);
        return;
      }

      logger.info(`${MODULE_NAME}:init:start`);

      this.initializeHeader();
      this.setupEventListeners();
      this.initializePerformanceMonitoring();

      try {
        await this.loadInitialData();
        this.startAutoRefresh();
        this.isInitialized = true;
        logger.info(`${MODULE_NAME}:init:completed`);
    } catch (error) {
        this.handleError('שגיאה באתחול דשבורד הנתונים החיצוניים', error, 'init');
      }
    }

    /**
     * Initialize header system
     * @returns {void}
     */
    initializeHeader() {
      if (window.headerSystem && typeof window.headerSystem.init === 'function') {
        try {
          window.headerSystem.init();
    } catch (error) {
          this.handleError('שגיאה בהפעלת מערכת התפריט', error, 'header-init');
        }
      }
      document.title = 'דשבורד נתונים חיצוניים - TikTrack';
    }

    /**
     * Setup event listeners for dashboard controls
     * @returns {void}
     */
    setupEventListeners() {
      const logLevelFilter = getElement('log-level-filter');
      if (logLevelFilter) {
        logLevelFilter.addEventListener('change', () => this.applyLogFilters());
      }

      const logSearch = getElement('log-search');
      if (logSearch) {
        logSearch.addEventListener('input', () => this.applyLogFilters());
      }

      const groupLimitSelect = getElement('group-limit');
      if (groupLimitSelect) {
        groupLimitSelect.addEventListener('change', () => this.loadGroupRefreshHistory(true));
      }

      const tickerSelect = getElement('ticker-select');
      const tickerRefreshButton = getElement('action-refresh-ticker-data');
      if (tickerSelect && tickerRefreshButton) {
        tickerSelect.addEventListener('change', () => {
          tickerRefreshButton.disabled = !tickerSelect.value;
        });
      }
    }

    /**
     * Start auto-refresh interval
     * @returns {void}
     */
    startAutoRefresh() {
      this.stopAutoRefresh();
      // Refresh scheduler status every 30 seconds
      this.schedulerRefreshHandle = window.setInterval(() => {
        this.loadSchedulerStatus();
      }, 30000);
      // Refresh scheduler monitoring every 60 seconds
      this.schedulerMonitoringHandle = window.setInterval(() => {
        this.loadSchedulerMonitoring();
      }, 60000);
      // Refresh core data at normal interval
      this.autoRefreshHandle = window.setInterval(() => {
        this.refreshCoreData();
      }, AUTO_REFRESH_INTERVAL_MS);
    }

    /**
     * Stop auto-refresh interval
     * @returns {void}
     */
    stopAutoRefresh() {
      if (this.autoRefreshHandle) {
        window.clearInterval(this.autoRefreshHandle);
        this.autoRefreshHandle = null;
      }
      if (this.schedulerRefreshHandle) {
        window.clearInterval(this.schedulerRefreshHandle);
        this.schedulerRefreshHandle = null;
      }
      if (this.schedulerMonitoringHandle) {
        window.clearInterval(this.schedulerMonitoringHandle);
        this.schedulerMonitoringHandle = null;
      }
    }

    /**
     * Load initial dashboard data
     * @returns {Promise<void>}
     */
    async loadInitialData() {
      await Promise.all([
        this.loadSystemStatus(),
        this.loadProviders(),
        this.loadCacheStats(),
        this.loadLogs(),
        this.loadGroupRefreshHistory(),
        this.loadSchedulerStatus(),
        this.loadSchedulerMonitoring(),
        this.loadTickersList(),
        this.loadMissingDataTickers()
      ]);
    }

    /**
     * Refresh core dashboard data
     * @param {boolean} [showNotifications=false] - Whether to show notifications
     * @returns {Promise<void>}
     */
    async refreshCoreData(showNotifications = false) {
      await Promise.allSettled([
        this.loadSystemStatus(showNotifications),
        this.loadProviders(showNotifications),
        this.loadCacheStats(showNotifications),
        this.loadSchedulerStatus(showNotifications)
      ]);
    }

    /**
     * Refresh all external data
     * @returns {Promise<Object>} Refresh result payload
     * @throws {Error} If refresh fails
     */
    async refreshAllExternalData() {
      const startTime = performance.now();
      try {
        notification.info('רענון נתונים חיצוניים', 'התהליך החל, נעדכן בסיום');
        const response = await fetch('/api/external-data/refresh/all', { method: 'POST' });
        const rawText = await response.text();
        let payload = {};
        if (rawText) {
          try {
            payload = JSON.parse(rawText);
          } catch (parseError) {
            payload = { message: rawText };
          }
        }

        if (!response.ok) {
          const errorMessage = safeText(
            payload?.error || payload?.message || 'רענון הנתונים החיצוניים נכשל'
          );
          throw new Error(errorMessage);
        }

        const duration = performance.now() - startTime;
        const result = payload?.data || {};
        const requested = Number.isFinite(Number(result.requested)) ? Number(result.requested) : 0;
        // Handle case where fetched might be an object (due to middleware timestamp conversion bug)
        // The DateNormalizationService incorrectly converts "fetched" (a count) to a timestamp
        let fetched = 0;
        if (typeof result.fetched === 'number') {
          fetched = Number.isFinite(result.fetched) ? result.fetched : 0;
        } else if (typeof result.fetched === 'object' && result.fetched !== null) {
          // If middleware incorrectly converted count to timestamp object, we can't reliably recover it
          // The epochMs value represents milliseconds since epoch, not the original count
          // e.g., fetched=1 might become epochMs=1000 (1 second), not 1000 items
          // With the Backend fix, this should no longer happen, but handle it gracefully
          fetched = 0; // Can't reliably determine, treat as unknown/error
          logger.warn(`${MODULE_NAME}:refresh-all:fetched-converted-to-timestamp`, {
            fetched_object: result.fetched,
            requested,
            message: 'fetched was incorrectly converted to timestamp by middleware - treating as 0'
          });
        }
        const failedSymbols = Array.isArray(result.failed_symbols) ? result.failed_symbols : [];
        const skippedEntries = Array.isArray(result.skipped) ? result.skipped : [];

        const summaryParts = [
          `עודכנו ${formatNumber(fetched)} מתוך ${formatNumber(requested)} טיקרים`,
          `משך ${formatDurationMs(duration)}`
        ];

        const isFullSuccess =
          requested > 0 &&
          fetched === requested &&
          failedSymbols.length === 0 &&
          skippedEntries.length === 0;

        const developerDetails = [
          `• טיקרים שהתבקשו: ${formatNumber(requested)}`,
          `• טיקרים שעודכנו: ${formatNumber(fetched)}`,
          `• טיקרים שנכשלו: ${formatNumber(failedSymbols.length)}`,
          `• טיקרים שדולגו (חסר סימול): ${formatNumber(skippedEntries.length)}`,
          `• חותמת בקשה: ${formatTimePayloadForDeveloper(payload.timestamp)}`,
          `• משך כולל: ${formatDurationMs(duration)}`
        ];

        if (safeText(payload.requestId, null)) {
          developerDetails.push(`• מזהה בקשה: ${safeText(payload.requestId)}`);
        }

        // Always show failed symbols if any, or indicate which symbols were requested but not fetched
        if (failedSymbols.length > 0) {
          const truncatedFailed = failedSymbols.slice(0, 10).join(', ');
          const hasMoreFailures = failedSymbols.length > 10 ? ' (קיימים נוספים…) ' : '';
          developerDetails.push(`• סימבולים שנכשלו: ${truncatedFailed}${hasMoreFailures}`);
        } else if (requested > 0 && fetched === 0) {
          // If we requested symbols but got 0, something went wrong but failed_symbols is empty
          // This can happen if the API doesn't return failed_symbols properly
          developerDetails.push(`• סימבולים שנכשלו: כל הסימבולים (${requested} טיקרים לא הצליחו להיטען)`);
        } else if (requested > 0 && fetched < requested && failedSymbols.length === 0) {
          // Partial failure but no failed_symbols returned - try to infer from requested vs fetched
          const missingCount = requested - fetched;
          developerDetails.push(`• סימבולים שנכשלו: ${missingCount} טיקרים (רשימה לא זמינה מה-API)`);
        }

        if (skippedEntries.length) {
          const truncatedSkipped = skippedEntries
            .slice(0, 5)
            .map((entry) => `ID:${entry.id} (${safeText(entry.reason, 'לא צויין')})`)
            .join(', ');
          const hasMoreSkipped = skippedEntries.length > 5 ? ' (קיימים נוספים…) ' : '';
          developerDetails.push(`• פרטי טיקרים שדולגו: ${truncatedSkipped}${hasMoreSkipped}`);
        }

        const summaryMessage = summaryParts.join(' · ');

        if (!requested) {
          const userMessage = 'לא נמצאו טיקרים פעילים עם סימול תקף ולכן הרענון לא בוצע.';
          notification.detailedError(
            'רענון נתונים חיצוניים נכשל',
            userMessage,
            developerDetails
          );
          logger.error(`${MODULE_NAME}:refresh-all:no-requested`, {
            requested,
            fetched,
            failed: failedSymbols.length,
            skipped: skippedEntries.length
          });
        } else if (!isFullSuccess) {
          const userMessage =
            'הרענון נעצר לפני שהושלם. חלק מהטיקרים נכשלו או דולגו ולכן נדרש טיפול.';
          notification.detailedError(
            'רענון נתונים חיצוניים נכשל (חלקי)',
            userMessage,
            developerDetails
          );
          logger.warn(`${MODULE_NAME}:refresh-all:partial`, {
            requested,
            fetched,
            failed: failedSymbols.length,
            skipped: skippedEntries.length
          });
        } else {
          notification.success('רענון נתונים חיצוניים', summaryMessage);
          logger.info(`${MODULE_NAME}:refresh-all:success`, {
            requested,
            fetched,
            skipped: skippedEntries.length
          });
        }

        await Promise.allSettled([
          this.refreshCoreData(),
          this.loadGroupRefreshHistory(),
          this.loadLogs()
        ]);

        return payload;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.error(`${MODULE_NAME}:refresh-all:error`, { error, duration });
        this.handleError('שגיאה ברענון כל הטיקרים', error, 'refresh-all');
        throw error;
      }
    }

    /**
     * Full external data refresh - loads current quotes, historical data (150 days), and pre-calculates technical indicators
     * @returns {Promise<Object>} Refresh result payload
     * @throws {Error} If refresh fails
     */
    async refreshFullExternalData() {
      const startTime = performance.now();
      const buttonId = 'action-refresh-full-data';
      const button = document.getElementById(buttonId);
      const originalText = button?.textContent || 'טעינת נתונים מלאה';
      
      try {
        // Show loading indicator
        if (button) {
          button.disabled = true;
          button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>טוען...';
        }
        
        notification.info('טעינת נתונים מלאה', 'התהליך החל, זה עשוי לקחת מספר דקות...');
        
        const response = await fetch('/api/external-data/refresh/full', { method: 'POST' });
        const rawText = await response.text();
        let payload = {};
        if (rawText) {
          try {
            payload = JSON.parse(rawText);
          } catch (parseError) {
            payload = { message: rawText };
          }
        }

        if (!response.ok) {
          const errorMessage = safeText(
            payload?.error || payload?.message || 'טעינת הנתונים המלאה נכשלה'
          );
          throw new Error(errorMessage);
        }

        const duration = performance.now() - startTime;
        const result = payload?.data || {};
        const requested = Number.isFinite(Number(result.requested)) ? Number(result.requested) : 0;
        const currentQuotesLoaded = Number.isFinite(Number(result.current_quotes_loaded)) ? Number(result.current_quotes_loaded) : 0;
        const failedSymbols = Array.isArray(result.failed_symbols) ? result.failed_symbols : [];
        const skippedEntries = Array.isArray(result.skipped) ? result.skipped : [];
        const historicalData = result.historical_data || {};
        const technicalIndicators = result.technical_indicators || {};
        const performance = result.performance || {};

        // Build summary message
        const summaryParts = [
          `נטענו ${formatNumber(currentQuotesLoaded)} מתוך ${formatNumber(requested)} טיקרים`,
          `${formatNumber(historicalData.tickers_with_historical || 0)} טיקרים עם נתונים היסטוריים`,
          `${formatNumber(technicalIndicators.total_calculated || 0)} חישובים טכניים`,
          `משך ${formatDurationMs(duration)}`
        ];

        const developerDetails = [
          `• טיקרים שהתבקשו: ${formatNumber(requested)}`,
          `• quotes נוכחיים שנטענו: ${formatNumber(currentQuotesLoaded)}`,
          `• טיקרים עם נתונים היסטוריים: ${formatNumber(historicalData.tickers_with_historical || 0)}`,
          `• סה"כ quotes היסטוריים: ${formatNumber(historicalData.total_historical_quotes || 0)}`,
          `• ממוצע quotes לטיקר: ${formatNumber(historicalData.average_quotes_per_ticker || 0)}`,
          `• חישובים טכניים שבוצעו: ${formatNumber(technicalIndicators.total_calculated || 0)}`,
          `• טיקרים עם חישובים טכניים: ${formatNumber(technicalIndicators.tickers_with_indicators || 0)}`,
          `• טיקרים שנכשלו: ${formatNumber(failedSymbols.length)}`,
          `• טיקרים שדולגו: ${formatNumber(skippedEntries.length)}`,
          `• משך כולל: ${formatDurationMs(duration)}`,
          `• זמן התחלה: ${performance.start_time ? new Date(performance.start_time).toLocaleString('he-IL') : 'לא זמין'}`,
          `• זמן סיום: ${performance.end_time ? new Date(performance.end_time).toLocaleString('he-IL') : 'לא זמין'}`
        ];

        if (failedSymbols.length > 0) {
          const truncatedFailed = failedSymbols.slice(0, 10).join(', ');
          const hasMoreFailures = failedSymbols.length > 10 ? ' (קיימים נוספים…) ' : '';
          developerDetails.push(`• סימבולים שנכשלו: ${truncatedFailed}${hasMoreFailures}`);
        }

        if (skippedEntries.length) {
          const truncatedSkipped = skippedEntries
            .slice(0, 5)
            .map((entry) => `ID:${entry.id} (${safeText(entry.reason, 'לא צויין')})`)
            .join(', ');
          const hasMoreSkipped = skippedEntries.length > 5 ? ' (קיימים נוספים…) ' : '';
          developerDetails.push(`• פרטי טיקרים שדולגו: ${truncatedSkipped}${hasMoreSkipped}`);
        }

        const summaryMessage = summaryParts.join(' · ');
        const isFullSuccess = requested > 0 && currentQuotesLoaded === requested && failedSymbols.length === 0 && skippedEntries.length === 0;

        if (!requested) {
          const userMessage = 'לא נמצאו טיקרים פעילים עם סימול תקף ולכן הטעינה המלאה לא בוצעה.';
          notification.detailedError(
            'טעינת נתונים מלאה נכשלה',
            userMessage,
            developerDetails
          );
        } else if (!isFullSuccess) {
          const userMessage = 'הטעינה המלאה הושלמה עם חלק מהטיקרים שנכשלו או דולגו.';
          notification.detailedError(
            'טעינת נתונים מלאה הושלמה (חלקי)',
            userMessage,
            developerDetails
          );
        } else {
          notification.success('טעינת נתונים מלאה הושלמה', summaryMessage);
        }

        // Refresh all dashboard data
        await Promise.allSettled([
          this.refreshCoreData(),
          this.loadGroupRefreshHistory(),
          this.loadLogs(),
          this.loadSystemStatus(),
          this.loadCacheStats(),
          this.loadSchedulerStatus()
        ]);

        return payload;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.error(`${MODULE_NAME}:refresh-full:error`, { error, duration });
        this.handleError('שגיאה בטעינת נתונים מלאה', error, 'refresh-full');
        throw error;
      } finally {
        // Restore button state
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    }

    /**
     * Load tickers list for dropdown
     * @returns {Promise<void>}
     */
    async loadTickersList() {
      try {
        const response = await fetch('/api/tickers?status=open');
        if (!response.ok) {
          throw new Error(`Failed to load tickers: ${response.status}`);
        }
        const data = await response.json();
        const tickers = data?.data || [];
        const select = getElement('ticker-select');
        if (!select) {
          return;
        }
        
        // Clear existing options except the first one
        select.innerHTML = '<option value="">בחר טיקר...</option>';
        
        // Add tickers to dropdown
        tickers.forEach(ticker => {
          const option = document.createElement('option');
          option.value = ticker.id;
          option.textContent = `${ticker.symbol || 'N/A'} - ${ticker.name || 'ללא שם'}`;
          select.appendChild(option);
        });
        
        // Enable refresh button if tickers are available
        const refreshButton = getElement('action-refresh-ticker-data');
        if (refreshButton) {
          refreshButton.disabled = tickers.length === 0;
        }
        
        // Enable select if tickers are available
        select.disabled = tickers.length === 0;
      } catch (error) {
        logger.error(`${MODULE_NAME}:load-tickers-list:error`, { error });
        const select = getElement('ticker-select');
        if (select) {
          select.innerHTML = '<option value="">שגיאה בטעינת רשימת טיקרים</option>';
          select.disabled = true;
        }
      }
    }

    /**
     * Refresh ticker-specific data
     * @returns {Promise<Object>} Refresh result payload
     * @throws {Error} If refresh fails
     */
    async refreshTickerData() {
      const startTime = performance.now();
      const select = getElement('ticker-select');
      const button = getElement('action-refresh-ticker-data');
      const statsContainer = getElement('ticker-load-stats');
      
      if (!select || !select.value) {
        notification.warning('בחירת טיקר', 'אנא בחר טיקר מהרשימה');
        return;
      }
      
      const tickerId = parseInt(select.value, 10);
      if (!tickerId) {
        notification.warning('בחירת טיקר', 'טיקר לא תקין');
        return;
      }
      
      const originalButtonText = button?.textContent || 'טען נתונים מלאים';
      
      try {
        // Show loading indicator
        if (button) {
          button.disabled = true;
          button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>טוען...';
        }
        
        if (statsContainer) {
          statsContainer.innerHTML = '<div class="text-muted">טוען נתונים...</div>';
        }
        
        notification.info('רענון טיקר', 'התהליך החל, נעדכן בסיום');
        
        const response = await fetch(`/api/external-data/quotes/${tickerId}/refresh`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        const rawText = await response.text();
        let payload = {};
        if (rawText) {
          try {
            payload = JSON.parse(rawText);
          } catch (parseError) {
            payload = { message: rawText };
          }
        }

        if (!response.ok) {
          const errorMessage = safeText(
            payload?.error || payload?.message || 'רענון הטיקר נכשל'
          );
          throw new Error(errorMessage);
        }

        const duration = performance.now() - startTime;
        const result = payload?.data || {};
        const tickerSymbol = result.ticker_symbol || 'לא זמין';
        const price = result.price ? formatNumber(result.price) : NOT_AVAILABLE_TEXT;
        const changePercent = result.change_percent !== null && result.change_percent !== undefined 
          ? `${result.change_percent >= 0 ? '+' : ''}${formatNumber(result.change_percent)}%`
          : NOT_AVAILABLE_TEXT;
        const volume = result.volume ? formatNumber(result.volume) : NOT_AVAILABLE_TEXT;
        const fetchedAt = result.fetched_at 
          ? (window.formatDate ? window.formatDate(result.fetched_at, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(result.fetched_at, { includeTime: true }) : new Date(result.fetched_at).toLocaleString('he-IL')))
          : NOT_AVAILABLE_TEXT;

        // Display statistics
        if (statsContainer) {
          statsContainer.innerHTML = `
            <div class="ticker-stats">
              <div class="stat-item mb-2">
                <strong>טיקר:</strong> ${safeText(tickerSymbol)}
              </div>
              <div class="stat-item mb-2">
                <strong>מחיר:</strong> ${price}
              </div>
              <div class="stat-item mb-2">
                <strong>שינוי יומי:</strong> ${changePercent}
              </div>
              <div class="stat-item mb-2">
                <strong>נפח:</strong> ${volume}
              </div>
              <div class="stat-item mb-2">
                <strong>נטען ב:</strong> ${fetchedAt}
              </div>
              <div class="stat-item">
                <strong>משך:</strong> ${formatDurationMs(duration)}
              </div>
            </div>
          `;
        }

        notification.success('רענון טיקר הושלם', `הנתונים עבור ${tickerSymbol} עודכנו בהצלחה`);

        // Refresh dashboard data
        await Promise.allSettled([
          this.loadSystemStatus(),
          this.loadCacheStats()
        ]);

        return payload;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.error(`${MODULE_NAME}:refresh-ticker:error`, { error, duration, tickerId });
        
        if (statsContainer) {
          statsContainer.innerHTML = `<div class="text-danger">שגיאה: ${safeText(error.message)}</div>`;
        }
        
        this.handleError('שגיאה ברענון טיקר', error, 'refresh-ticker');
        throw error;
      } finally {
        // Restore button state
        if (button) {
          button.disabled = false;
          button.textContent = originalButtonText;
        }
      }
    }

    /**
     * Load scheduler monitoring data
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadSchedulerMonitoring(showNotification = false) {
      try {
        const response = await fetch('/api/external-data/status/scheduler/monitoring');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.schedulerMonitoringData = data?.data || null;
        this.renderSchedulerMonitoring(this.schedulerMonitoringData);
        if (showNotification) {
          notification.success('ניטור מתזמן עודכן', 'נתוני הניטור נטענו בהצלחה');
        }
      } catch (error) {
        this.schedulerMonitoringData = null;
        this.renderSchedulerMonitoring(null);
        this.handleError('שגיאה בטעינת ניטור מתזמן', error, 'load-scheduler-monitoring');
      }
    }

    /**
     * Render scheduler monitoring data
     * @param {Object|null} data - Monitoring data or null
     * @returns {void}
     */
    renderSchedulerMonitoring(data) {
      const container = getElement('scheduler-monitoring-content');
      if (!container) {
        return;
      }

      if (!data) {
        container.innerHTML = '<div class="text-muted text-center p-4">לא ניתן לטעון את נתוני הניטור</div>';
        return;
      }

      const schedulerStatus = data.scheduler_status || {};
      const refreshHistory = data.refresh_history || [];
      const performanceMetrics = data.performance_metrics || {};
      const alerts = data.alerts || [];

      // Render alerts
      const alertsHTML = alerts.length > 0
        ? alerts.map(alert => {
            const alertClass = alert.level === 'error' ? 'danger' : alert.level === 'warning' ? 'warning' : 'info';
            return `
              <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
                <strong>${alert.type === 'scheduler_stopped' ? '⚠️' : alert.level === 'error' ? '❌' : '⚠️'}</strong>
                ${safeText(alert.message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            `;
          }).join('')
        : '<div class="alert alert-success">אין התראות - הכל תקין</div>';

      // Render refresh history
      const historyHTML = refreshHistory.length > 0
        ? refreshHistory.map(entry => {
            const statusClass = entry.status === 'completed' || entry.status === 'success' ? 'success' 
              : entry.status === 'failed' ? 'danger' 
              : 'warning';
            const statusText = entry.status === 'completed' || entry.status === 'success' ? 'הושלם'
              : entry.status === 'failed' ? 'נכשל'
              : 'בתהליך';
            const startedAt = entry.started_at 
              ? (window.formatDate ? window.formatDate(entry.started_at, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(entry.started_at, { includeTime: true }) : new Date(entry.started_at).toLocaleString('he-IL')))
              : NOT_AVAILABLE_TEXT;
            const duration = entry.duration_ms ? formatDurationMs(entry.duration_ms) : NOT_AVAILABLE_TEXT;
            
            return `
              <tr>
                <td>${safeText(this.getCategoryLabel(entry.category))}</td>
                <td>${safeText(entry.time_period)}</td>
                <td>${formatNumber(entry.ticker_count || 0)}</td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                <td>${formatNumber(entry.successful_count || 0)}</td>
                <td>${formatNumber(entry.failed_count || 0)}</td>
                <td>${duration}</td>
                <td>${startedAt}</td>
              </tr>
            `;
          }).join('')
        : '<tr><td colspan="8" class="text-center text-muted">אין היסטוריית רענונים</td></tr>';

      container.innerHTML = `
        <div class="row g-3">
          <div class="col-12">
            <h5>התראות</h5>
            ${alertsHTML}
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">סטטיסטיקות ביצועים</h6>
              </div>
              <div class="card-body">
                <div class="performance-metrics">
                  <div class="metric-item mb-3">
                    <div class="metric-label">סה"כ רענונים</div>
                    <div class="metric-value">${formatNumber(performanceMetrics.total_refreshes || 0)}</div>
                  </div>
                  <div class="metric-item mb-3">
                    <div class="metric-label">רענונים מוצלחים</div>
                    <div class="metric-value text-success">${formatNumber(performanceMetrics.successful_refreshes || 0)}</div>
                  </div>
                  <div class="metric-item mb-3">
                    <div class="metric-label">רענונים שנכשלו</div>
                    <div class="metric-value text-danger">${formatNumber(performanceMetrics.failed_refreshes || 0)}</div>
                  </div>
                  <div class="metric-item mb-3">
                    <div class="metric-label">שיעור הצלחה</div>
                    <div class="metric-value ${performanceMetrics.success_rate >= 90 ? 'text-success' : performanceMetrics.success_rate >= 80 ? 'text-warning' : 'text-danger'}">
                      ${formatNumber(performanceMetrics.success_rate || 0)}%
                    </div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">משך ממוצע</div>
                    <div class="metric-value">${performanceMetrics.average_duration_ms ? formatDurationMs(performanceMetrics.average_duration_ms) : NOT_AVAILABLE_TEXT}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">היסטוריית רענונים (10 האחרונים)</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>קטגוריה</th>
                        <th>תקופה</th>
                        <th>טיקרים</th>
                        <th>סטטוס</th>
                        <th>הצליחו</th>
                        <th>נכשלו</th>
                        <th>משך</th>
                        <th>התחיל</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${historyHTML}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Load missing data tickers
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadMissingDataTickers(showNotification = false) {
      try {
        const response = await fetch('/api/external-data/status/tickers/missing-data');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.missingDataTickers = data?.data || null;
        this.renderMissingDataTickers(this.missingDataTickers);
        if (showNotification) {
          notification.success('רשימת טיקרים עודכנה', 'נתוני הטיקרים עם נתונים חסרים נטענו בהצלחה');
        }
      } catch (error) {
        this.missingDataTickers = null;
        this.renderMissingDataTickers(null);
        this.handleError('שגיאה בטעינת טיקרים עם נתונים חסרים', error, 'load-missing-data-tickers');
      }
    }

    /**
     * Render missing data tickers
     * @param {Object|null} data - Missing data tickers or null
     * @returns {void}
     */
    renderMissingDataTickers(data) {
      const container = getElement('missing-data-content');
      if (!container) {
        return;
      }

      if (!data) {
        container.innerHTML = '<div class="text-muted text-center p-4">לא ניתן לטעון את נתוני הטיקרים</div>';
        return;
      }

      const summary = data.summary || {};
      const missingCurrent = data.tickers_missing_current || [];
      const missingHistorical = data.tickers_missing_historical || [];
      const missingIndicators = data.tickers_missing_indicators || [];
      const recommendations = data.recommendations || [];

      // Summary cards
      const summaryHTML = `
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">${formatNumber(summary.total_open_tickers || 0)}</h5>
                <p class="card-text text-muted mb-0">טיקרים פתוחים</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center border-danger">
              <div class="card-body">
                <h5 class="card-title text-danger">${formatNumber(summary.missing_current_count || 0)}</h5>
                <p class="card-text text-muted mb-0">חסר quote נוכחי</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center border-warning">
              <div class="card-body">
                <h5 class="card-title text-warning">${formatNumber(summary.missing_historical_count || 0)}</h5>
                <p class="card-text text-muted mb-0">נתונים היסטוריים לא מספיקים</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center border-info">
              <div class="card-body">
                <h5 class="card-title text-info">${formatNumber(summary.missing_indicators_count || 0)}</h5>
                <p class="card-text text-muted mb-0">חסרים חישובים טכניים</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Recommendations table
      const recommendationsHTML = recommendations.length > 0
        ? recommendations.map(rec => {
            const priorityClass = rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info';
            return `
              <tr>
                <td>${safeText(rec.symbol)}</td>
                <td><span class="badge bg-${priorityClass}">${rec.priority === 'high' ? 'גבוה' : rec.priority === 'medium' ? 'בינוני' : 'נמוך'}</span></td>
                <td>${safeText(rec.message)}</td>
                <td>
                  <button data-button-type="PLAY" data-text="רענון" data-onclick="ExternalDataDashboardActions.refreshTickerById(${rec.ticker_id})" data-size="small" class="btn-sm">
                    רענון
                  </button>
                </td>
              </tr>
            `;
          }).join('')
        : '<tr><td colspan="4" class="text-center text-muted">אין המלצות - כל הטיקרים מעודכנים</td></tr>';

      // Missing current quotes table
      const missingCurrentHTML = missingCurrent.length > 0
        ? missingCurrent.map(ticker => `
            <tr>
              <td>${safeText(ticker.symbol)}</td>
              <td>${safeText(ticker.name || 'ללא שם')}</td>
              <td>
                <button data-button-type="PLAY" data-text="רענון" data-onclick="ExternalDataDashboardActions.refreshTickerById(${ticker.id})" data-size="small" class="btn-sm">
                  רענון
                </button>
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="3" class="text-center text-success">כל הטיקרים בעלי quotes נוכחיים</td></tr>';

      // Missing historical data table
      const missingHistoricalHTML = missingHistorical.length > 0
        ? missingHistorical.map(ticker => `
            <tr>
              <td>${safeText(ticker.symbol)}</td>
              <td>${safeText(ticker.name || 'ללא שם')}</td>
              <td>${formatNumber(ticker.current_count || 0)} / ${formatNumber(ticker.required_count || 150)}</td>
              <td>${formatNumber(ticker.missing_count || 0)}</td>
              <td>
                <button data-button-type="PLAY" data-text="רענון" data-onclick="ExternalDataDashboardActions.refreshTickerById(${ticker.id})" data-size="small" class="btn-sm">
                  רענון
                </button>
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="5" class="text-center text-success">כל הטיקרים בעלי נתונים היסטוריים מספיקים</td></tr>';

      container.innerHTML = `
        ${summaryHTML}
        <div class="row g-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">המלצות רענון</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>טיקר</th>
                        <th>עדיפות</th>
                        <th>סיבה</th>
                        <th>פעולה</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recommendationsHTML}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">טיקרים ללא quote נוכחי</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>סימול</th>
                        <th>שם</th>
                        <th>פעולה</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${missingCurrentHTML}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">טיקרים עם נתונים היסטוריים לא מספיקים</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>סימול</th>
                        <th>שם</th>
                        <th>נוכחי / נדרש</th>
                        <th>חסר</th>
                        <th>פעולה</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${missingHistoricalHTML}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Load system status data
     * @param {boolean} [showNotifications=false] - Whether to show notifications
     * @returns {Promise<void>}
     */
    async loadSystemStatus(showNotifications = false) {
      try {
        const response = await fetch('/api/external-data/status/');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.statusData = data;
        this.renderSystemStatus(data);
        if (showNotifications) {
          notification.success('סטטוס עודכן', 'נתוני הסטטוס נטענו בהצלחה');
      }
    } catch (error) {
        this.statusData = null;
        this.renderSystemStatus(null);
        this.handleError('שגיאה בטעינת סטטוס המערכת', error, 'load-system-status');
      }
    }

    /**
     * Render system status data
     * @param {Object|null} data - Status data or null
     * @returns {void}
     */
    renderSystemStatus(data) {
      this.renderSummaryCards(data);
      this.renderStatusIndicators(data);
      this.updateProviderLastUpdateTimes(data ? data.providers?.details || [] : []);
      this.updateStatisticsCards(data);
      
      // Update cache stats display with fresh status data
      if (data?.cache) {
        this.cacheStats = {
          status: 'success',
          data: {
            total_entries: data.cache.total_quotes || 0,
            expired_entries: data.cache.stale_data_count || 0,
            hit_rate: data.cache.cache_hit_rate || 0,
            estimated_memory_mb: 0 // Not available from status endpoint
          }
        };
        this.renderCacheStats();
      }
      
      // Update cache settings display with fresh status data
      this.updateCurrentSettings().catch(error => {
        logger.error(`${MODULE_NAME}:update-current-settings:failed`, { error });
      });
      this.updateChartsFromStatus(data).catch((error) => {
        logger.error(`${MODULE_NAME}:update-charts-failed`, { error });
      });
    }

    /**
     * Render summary cards
     * @param {Object|null} data - Status data or null
     * @returns {void}
     */
    renderSummaryCards(data) {
      const providersTotal = data?.providers?.total ?? null;
      const totalQuotes = data?.cache?.total_quotes ?? null;
      const lastUpdateText = formatRelativeFromPayload(data?.timestamp);
      const overallHealth = data?.overall_health;

      setElementText('providers-count', providersTotal !== null ? formatNumber(providersTotal) : NOT_AVAILABLE_TEXT);

      setElementText(
        'active-data-count',
        totalQuotes !== null ? formatNumber(totalQuotes) : NOT_AVAILABLE_TEXT
      );

      setElementText('last-update-time', lastUpdateText);

      const overallStatusElement = getElement('overall-status');
      if (overallStatusElement) {
        if (overallHealth === true) {
          overallStatusElement.textContent = 'פעיל';
          overallStatusElement.className = 'text-success';
        } else if (overallHealth === false) {
          overallStatusElement.textContent = 'בעיה';
          overallStatusElement.className = 'text-warning';
        } else {
          overallStatusElement.textContent = NOT_AVAILABLE_TEXT;
          overallStatusElement.className = 'text-muted';
        }
      }
    }

    /**
     * Render status indicators
     * @param {Object|null} data - Status data or null
     * @returns {void}
     */
    renderStatusIndicators(data) {
      if (!data) {
        setStatusIndicator('yahoo-status', 'inactive');
        setStatusIndicator('cache-status-indicator', 'inactive');
        setStatusIndicator('db-status', 'inactive');
        setStatusIndicator('api-status-indicator', 'inactive');
        this.writeElementHtml('yahoo-details', '');
        this.writeElementHtml('cache-details', '');
        this.writeElementHtml('db-details', '');
        this.writeElementHtml('api-details', '');
        return;
      }

      this.renderYahooStatus(data);
      this.renderCacheStatus(data.cache);
      this.renderDatabaseStatus(data.providers);
      this.renderApiStatus(data);
    }

    /**
     * Render Yahoo Finance status
     * @param {Object} data - Status data
     * @returns {void}
     */
    renderYahooStatus(data) {
      const yahooProvider = data.providers?.details?.find((provider) => provider.name === 'yahoo_finance');
      const status = yahooProvider?.is_active
        ? yahooProvider.is_healthy
          ? 'active'
          : 'warning'
        : 'inactive';
      setStatusIndicator('yahoo-status', status);

      const detailsElement = getElement('yahoo-details');
      if (detailsElement) {
        if (!yahooProvider) {
          detailsElement.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'status-detail';
        div.textContent = 'לא נמצאו נתונים עבור Yahoo Finance';
        detailsElement.innerHTML.appendChild(div);
          return;
        }
        const records = this.statusData?.cache?.total_quotes ?? 0;
        // Build details using createElement
        detailsElement.textContent = '';
        const detailsHTML = [
          `<div class="status-detail">📊 ספק: ${safeText(yahooProvider.display_name || yahooProvider.name)}</div>`,
          `<div class="status-detail">📈 רשומות: ${formatNumber(records)}</div>`,
          `<div class="status-detail">🕒 עדכון אחרון: ${formatRelativeFromPayload(yahooProvider.last_successful_request)}</div>`,
          yahooProvider.last_error
            ? `<div class="status-detail error">⚠️ שגיאה אחרונה: ${safeText(yahooProvider.last_error)}</div>`
            : ''
        ].join('');
        // Insert using DOMParser
        detailsElement.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(detailsHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          detailsElement.appendChild(node.cloneNode(true));
        });
      }
    }

    /**
     * Render cache status
     * @param {Object|null} cacheData - Cache data or null
     * @returns {void}
     */
    renderCacheStatus(cacheData) {
      const status = cacheData ? 'active' : 'inactive';
      setStatusIndicator('cache-status-indicator', status);

      const detailsElement = getElement('cache-details');
      if (!detailsElement) {
        return;
      }

      if (!cacheData) {
        detailsElement.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'status-detail';
        div.textContent = 'נתוני מטמון לא זמינים';
        detailsElement.innerHTML.appendChild(div);
        return;
      }

      const ttlHot = cacheData.ttl_minutes?.hot != null
        ? `${formatDecimal(cacheData.ttl_minutes.hot, 1)} דקות`
        : NOT_AVAILABLE_TEXT;
      const ttlWarm = cacheData.ttl_minutes?.warm != null
        ? `${formatDecimal(cacheData.ttl_minutes.warm, 1)} דקות`
        : NOT_AVAILABLE_TEXT;

      // Build details HTML and insert using tempDiv
      const detailsHTML = [
        `<div class="status-detail">💾 ציטוטים: ${formatNumber(cacheData.total_quotes)}</div>`,
        `<div class="status-detail">📈 אחוז פגיעות: ${formatPercent(cacheData.cache_hit_rate)}</div>`,
        `<div class="status-detail">🗓️ נתונים פגומים: ${formatNumber(cacheData.stale_data_count)}</div>`,
        `<div class="status-detail">⏲️ גיל ממוצע (דקות): ${formatDecimal(cacheData.avg_quote_age_minutes ?? 0, 1)}</div>`,
        `<div class="status-detail">🔥 TTL חם: ${ttlHot}</div>`,
        `<div class="status-detail">🌤️ TTL חמים: ${ttlWarm}</div>`
      ].join('');
      detailsElement.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(detailsHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        detailsElement.appendChild(node.cloneNode(true));
      });
    }

    /**
     * Render database status
     * @param {Object} providersInfo - Providers information
     * @returns {void}
     */
    renderDatabaseStatus(providersInfo) {
      const hasData = providersInfo && typeof providersInfo.total === 'number';
      const status = hasData ? 'active' : 'inactive';
      setStatusIndicator('db-status', status);

      const detailsElement = getElement('db-details');
      if (!detailsElement) {
        return;
      }

      if (!hasData) {
        detailsElement.textContent = '';
        const div = document.createElement('div');
        div.className = 'status-detail';
        div.textContent = 'נתוני ספקים לא זמינים';
        detailsElement.appendChild(div);
        return;
      }

      detailsElement.textContent = '';
      const div1 = document.createElement('div');
      div1.className = 'status-detail';
      div1.textContent = `🗄️ ספקים: ${formatNumber(providersInfo.total)}`;
      detailsElement.appendChild(div1);
      const div2 = document.createElement('div');
      div2.className = 'status-detail';
      div2.textContent = `✅ פעילים: ${formatNumber(providersInfo.active)}`;
      detailsElement.appendChild(div2);
      const div3 = document.createElement('div');
      div3.className = 'status-detail';
      div3.textContent = `💡 בריאים: ${formatNumber(providersInfo.healthy)}`;
      detailsElement.appendChild(div3);
    }

    /**
     * Render API status
     * @param {Object} data - Status data
     * @returns {void}
     */
    renderApiStatus(data) {
      const statusValue = data?.success === true ? 'active' : 'warning';
      setStatusIndicator('api-status-indicator', statusValue);
      const detailsElement = getElement('api-details');
      if (!detailsElement) {
        return;
      }
      if (!data) {
        detailsElement.textContent = '';
        const div = document.createElement('div');
        div.className = 'status-detail';
        div.textContent = 'נתוני API לא זמינים';
        detailsElement.appendChild(div);
        return;
      }
      detailsElement.textContent = '';
      const div1 = document.createElement('div');
      div1.className = 'status-detail';
      div1.textContent = `🔌 מצב כללי: ${safeText(data.status)}`;
      detailsElement.appendChild(div1);
      const div2 = document.createElement('div');
      div2.className = 'status-detail';
      div2.textContent = `💠 בריאות כללית: ${data.overall_health === true ? 'טובה' : data.overall_health === false ? 'מושפעת' : NOT_AVAILABLE_TEXT}`;
      detailsElement.appendChild(div2);
      const div3 = document.createElement('div');
      div3.className = 'status-detail';
      div3.textContent = `📊 פעולות בשעה האחרונה: ${formatNumber(data.recent_activity?.last_hour?.refresh_operations ?? 0)}`;
      detailsElement.appendChild(div3);
    }

    /**
     * Write HTML to element by ID
     * @param {string} id - Element ID
     * @param {string} html - HTML content
     * @returns {void}
     */
    writeElementHtml(id, html) {
      const element = getElement(id);
      if (element) {
        element.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.body.childNodes.forEach(node => {
          element.appendChild(node.cloneNode(true));
        });
      }
    }

    /**
     * Update provider last update times
     * @param {Array} providerDetails - Array of provider details
     * @returns {void}
     */
    updateProviderLastUpdateTimes(providerDetails) {
      const yahooElement = getElement('yahoo-last-update');
      if (yahooElement) {
        const yahooProvider = providerDetails.find((provider) => provider.name === 'yahoo_finance');
        yahooElement.textContent = yahooProvider?.last_successful_request
          ? formatRelativeFromPayload(yahooProvider.last_successful_request)
          : NOT_AVAILABLE_TEXT;
      }

      const alphaElement = getElement('alpha-last-update');
      if (alphaElement) {
        const alphaProvider = providerDetails.find((provider) => provider.name === 'alpha_vantage');
        alphaElement.textContent = alphaProvider?.last_successful_request
          ? formatRelativeFromPayload(alphaProvider.last_successful_request)
          : NOT_AVAILABLE_TEXT;
    }
  }

  /**
   * Update statistics cards
   * @param {Object|null} data - Status data or null
   * @returns {void}
   */
  updateStatisticsCards(data) {
      if (!data) {
        setElementText('records-count', NOT_AVAILABLE_TEXT);
        setElementText('cache-size', NOT_AVAILABLE_TEXT);
        setElementText('hit-rate', NOT_AVAILABLE_TEXT);
        const generalStatusElement = getElement('general-status');
        if (generalStatusElement) {
          generalStatusElement.textContent = NOT_AVAILABLE_TEXT;
          generalStatusElement.className = 'text-muted';
        }
        return;
      }

      const totalQuotes = data.cache?.total_quotes ?? null;
      setElementText('records-count', totalQuotes !== null ? formatNumber(totalQuotes) : NOT_AVAILABLE_TEXT);

      const estimatedSizeKb = this.cacheStats?.data?.total_size_bytes
        ? this.cacheStats.data.total_size_bytes / 1024
        : null;
      if (estimatedSizeKb !== null) {
        const sizeText =
          estimatedSizeKb > 1024
            ? `${formatDecimal(estimatedSizeKb / 1024, 1)}MB`
            : `${formatDecimal(estimatedSizeKb, 1)}KB`;
        setElementText('cache-size', sizeText);
      } else {
        setElementText('cache-size', NOT_AVAILABLE_TEXT);
      }

      const hitRate = data.cache?.cache_hit_rate ?? this.cacheStats?.data?.hit_rate;
      setElementText('hit-rate', hitRate !== undefined ? formatPercent(hitRate) : NOT_AVAILABLE_TEXT);

      const generalStatusElement = getElement('general-status');
    if (generalStatusElement) {
        if (data.overall_health === true) {
        generalStatusElement.textContent = 'פעיל';
        generalStatusElement.className = 'text-success';
        } else if (data.overall_health === false) {
        generalStatusElement.textContent = 'בעיה';
        generalStatusElement.className = 'text-warning';
        } else {
          generalStatusElement.textContent = NOT_AVAILABLE_TEXT;
          generalStatusElement.className = 'text-muted';
        }
      }
    }

    /**
     * Update charts from status data
     * @param {Object} data - Status data
     * @returns {Promise<void>}
     */
    async updateChartsFromStatus(data) {
      if (!data) {
        return;
      }

      // Check if charts section is visible before creating charts
      const chartsSection = document.getElementById('charts-section');
      const isChartsSectionVisible = chartsSection && 
        chartsSection.querySelector('.section-body')?.style.display !== 'none';

      // Only create charts if section is visible
      if (!isChartsSectionVisible) {
        logger.debug(`${MODULE_NAME}:charts-section-hidden`, { message: 'Charts section is hidden, skipping chart updates' });
        return;
      }

      // Ensure Chart.js is loaded and defaults are configured
      if (window.Chart && window.ChartLoader) {
        try {
          await window.ChartLoader.load();
          if (typeof window.ChartLoader._configureDefaults === 'function') {
            window.ChartLoader._configureDefaults();
          }
        } catch (error) {
          logger.warn(`${MODULE_NAME}:chart-loader-config`, { error });
        }
      }

      await Promise.all([
        this.updateResponseTimeChart(),
        this.updateDataQualityChart(data),
        this.updateProviderComparisonChart(data),
        this.updateErrorAnalysisChart()
      ]);
    }

    /**
     * Load providers data
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadProviders(showNotification = false) {
      try {
        const response = await fetch('/api/external-data/status/providers');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.providers = Array.isArray(data.providers)
          ? data.providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
              displayName: provider.display_name,
              isActive: provider.is_active,
              isHealthy: provider.is_healthy,
              rateLimitPerHour: provider.rate_limit_per_hour,
              rateLimitRemaining: provider.recent_activity?.rate_limit_remaining ?? null,
              recentSuccessRate: provider.recent_activity?.success_rate ?? provider.recent_success_rate ?? null,
              lastSuccessfulRequest: extractTimestampIso(provider.last_successful_request),
              lastSuccessfulDisplay: provider.last_successful_request?.display ?? null,
              lastError: provider.last_error
            }))
          : [];
      this.renderProviders();
        if (showNotification) {
          notification.success('ספקים רועננו', 'נתוני הספקים נטענו בהצלחה');
        }
    } catch (error) {
        this.providers = [];
        this.renderProviders();
        this.handleError('שגיאה בטעינת רשימת הספקים', error, 'load-providers');
      }
  }

  /**
   * Render providers list
   * @returns {void}
   */
  renderProviders() {
      const providersGrid = getElement('providers-grid');
      if (!providersGrid) {
        return;
      }

      if (!this.providers.length) {
        providersGrid.textContent = '';
        const div = document.createElement('div');
        div.className = 'col-12 text-center text-muted py-4';
        div.textContent = 'לא נמצאו ספקים פעילים';
        providersGrid.appendChild(div);
        return;
      }

      providersGrid.textContent = '';
      const providersHTML = this.providers
        .map((provider) => {
          const statusBadgeClass = provider.isActive
            ? provider.isHealthy
              ? 'bg-success'
              : 'bg-warning text-dark'
            : 'bg-secondary';
          const statusLabel = provider.isActive
            ? provider.isHealthy
              ? 'פעיל'
              : 'בעיה'
            : 'לא פעיל';
          const lastUpdate = provider.lastSuccessfulDisplay
            ? safeText(provider.lastSuccessfulDisplay)
            : provider.lastSuccessfulRequest
              ? formatRelativeTime(provider.lastSuccessfulRequest)
              : NOT_AVAILABLE_TEXT;
          const successRate = provider.recentSuccessRate != null
            ? formatPercent(provider.recentSuccessRate * 100)
            : NOT_AVAILABLE_TEXT;
          const rateLimitRemaining = provider.rateLimitRemaining != null
            ? formatNumber(provider.rateLimitRemaining)
            : NOT_AVAILABLE_TEXT;
          const rateLimitPerHour = provider.rateLimitPerHour != null
            ? formatNumber(provider.rateLimitPerHour)
            : NOT_AVAILABLE_TEXT;
          const errorDetails = provider.lastError
            ? `<div class="text-danger small mt-2">שגיאה אחרונה: ${safeText(provider.lastError)}</div>`
            : '';

          return `
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <span>${safeText(provider.displayName || provider.name)}</span>
                  <span class="badge ${statusBadgeClass}">${statusLabel}</span>
                </div>
                <div class="card-body small text-muted">
                  <div class="mb-2">עדכון אחרון: ${lastUpdate}</div>
                  <div class="mb-2">בקשות לשעה: ${rateLimitPerHour}</div>
                  <div class="mb-2">בקשות זמינות: ${rateLimitRemaining}</div>
                  <div class="mb-2">אחוז הצלחה: ${successRate}</div>
                  ${errorDetails}
                    </div>
                    </div>
                    </div>
          `;
        })
        .join('');
      const parser = new DOMParser();
      const doc = parser.parseFromString(providersHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        providersGrid.appendChild(node.cloneNode(true));
      });
    }

    /**
     * Load cache statistics
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadCacheStats(showNotification = false) {
      try {
        // Try to get from external data cache stats endpoint
        let response = await fetch('/api/external-data/status/cache/stats');
        if (!response.ok) {
          // Fallback to general cache stats
          response = await fetch('/api/cache/stats');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
          }
        }
        const data = await response.json();
        this.cacheStats = data;
        this.renderCacheStats();
        if (showNotification) {
          notification.success('נתוני מטמון', 'סטטיסטיקות המטמון נטענו בהצלחה');
        }
      } catch (error) {
        // If statusData is available, use cache data from there
        if (this.statusData?.cache) {
          this.cacheStats = {
            status: 'success',
            data: {
              total_entries: this.statusData.cache.total_quotes || 0,
              expired_entries: this.statusData.cache.stale_data_count || 0,
              hit_rate: this.statusData.cache.cache_hit_rate || 0,
              estimated_memory_mb: 0 // Not available from status endpoint
            }
          };
          this.renderCacheStats();
        } else {
          this.cacheStats = null;
          this.renderCacheStats();
        }
        this.handleError('שגיאה בטעינת סטטיסטיקות מטמון', error, 'load-cache-stats');
      }
    }

    /**
     * Render cache statistics
     * @returns {void}
     */
    renderCacheStats() {
      const cacheStatsElement = getElement('cache-stats');
      if (!cacheStatsElement) {
        return;
      }

      // Try to get stats from cacheStats first, then from statusData
      let stats = null;
      
      if (this.cacheStats && this.cacheStats.status === 'success') {
        stats = this.cacheStats.data;
      } else if (this.statusData?.cache) {
        // Use cache data from status endpoint
        stats = {
          total_entries: this.statusData.cache.total_quotes || 0,
          expired_entries: this.statusData.cache.stale_data_count || 0,
          hit_rate: this.statusData.cache.cache_hit_rate || 0,
          estimated_memory_mb: 0 // Not available from status endpoint
        };
      }

      if (!stats) {
        cacheStatsElement.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted text-center p-3';
        div.textContent = 'נתוני מטמון לא זמינים';
        cacheStatsElement.appendChild(div);
        return;
      }

      // Handle both formats: external-data format (total_quotes) and general format (total_entries)
      const totalEntries = stats.total_entries || stats.total_quotes || 0;
      const expiredEntries = stats.expired_entries || stats.stale_data || stats.stale_data_count || 0;
      const hitRate = stats.hit_rate || stats.cache_hit_rate || 0;
      const memoryMB = stats.estimated_memory_mb || stats.memory_usage_mb || 0;

      cacheStatsElement.textContent = '';
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`
            <div class="cache-stats-grid">
                <div class="stat-card">
            <div class="stat-value">${formatNumber(totalEntries)}</div>
            <div class="stat-label">רשומות במטמון</div>
                </div>
                <div class="stat-card">
            <div class="stat-value">${formatNumber(expiredEntries)}</div>
            <div class="stat-label">רשומות פג תוקף</div>
                </div>
                <div class="stat-card">
            <div class="stat-value">${formatPercent(hitRate)}</div>
                    <div class="stat-label">אחוז פגיעות</div>
                </div>
                <div class="stat-card">
            <div class="stat-value">${formatDecimal(memoryMB, 2)}MB</div>
            <div class="stat-label">שימוש בזיכרון</div>
                </div>
            </div>
        `, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        cacheStatsElement.appendChild(fragment);

      // Update current settings from status data (not from cache stats)
      this.updateCurrentSettings().catch(error => {
        logger.error(`${MODULE_NAME}:update-current-settings:failed`, { error });
      });
    }

    /**
     * Update current cache settings display
     * Loads settings from status data (providers) and cache TTL settings
     * @returns {Promise<void>}
     */
    async updateCurrentSettings() {
      const hotCacheElement = getElement('current-hot-cache');
      const warmCacheElement = getElement('current-warm-cache');
      const maxRequestsElement = getElement('current-max-requests');

      try {
        // Try to get settings from status data if available
        if (this.statusData?.providers?.details && this.statusData.providers.details.length > 0) {
          const yahooProvider = this.statusData.providers.details.find(p => p.name === 'yahoo_finance');
          logger.debug(`${MODULE_NAME}:update-current-settings:yahoo-provider`, { 
            found: !!yahooProvider,
            provider: yahooProvider ? {
              name: yahooProvider.name,
              cache_ttl_hot: yahooProvider.cache_ttl_hot,
              cache_ttl_warm: yahooProvider.cache_ttl_warm,
              rate_limit_per_hour: yahooProvider.rate_limit_per_hour
            } : null
          });
          
          if (yahooProvider) {
            // Get from provider settings
            // cache_ttl_hot and cache_ttl_warm are in SECONDS, convert to minutes
            const hotTtlMinutes = yahooProvider.cache_ttl_hot != null ? Math.round(yahooProvider.cache_ttl_hot / 60) : null;
            const warmTtlMinutes = yahooProvider.cache_ttl_warm != null ? Math.round(yahooProvider.cache_ttl_warm / 60) : null;
            const maxRequests = yahooProvider.rate_limit_per_hour != null ? yahooProvider.rate_limit_per_hour : null;

            logger.debug(`${MODULE_NAME}:update-current-settings:values`, {
              hotTtlMinutes,
              warmTtlMinutes,
              maxRequests,
              hotCacheElement: !!hotCacheElement,
              warmCacheElement: !!warmCacheElement,
              maxRequestsElement: !!maxRequestsElement
            });
            
            if (hotCacheElement) {
              hotCacheElement.textContent = hotTtlMinutes !== null && hotTtlMinutes !== undefined
                ? `${formatNumber(hotTtlMinutes)} דקות`
                : NOT_AVAILABLE_TEXT;
            }

            if (warmCacheElement) {
              warmCacheElement.textContent = warmTtlMinutes !== null && warmTtlMinutes !== undefined
                ? `${formatNumber(warmTtlMinutes)} דקות`
                : NOT_AVAILABLE_TEXT;
            }

            if (maxRequestsElement) {
              maxRequestsElement.textContent = maxRequests !== null && maxRequests !== undefined
                ? `${formatNumber(maxRequests)} לשעה`
                : NOT_AVAILABLE_TEXT;
            }
            
            logger.debug(`${MODULE_NAME}:update-current-settings:success`, {
              hotCacheText: hotCacheElement?.textContent,
              warmCacheText: warmCacheElement?.textContent,
              maxRequestsText: maxRequestsElement?.textContent
            });
            
            return;
          } else {
            logger.warn(`${MODULE_NAME}:update-current-settings:yahoo-not-found`, {
              providers: this.statusData.providers.details.map(p => p.name)
            });
          }
        } else {
          logger.warn(`${MODULE_NAME}:update-current-settings:no-providers`, {
            hasStatusData: !!this.statusData,
            hasProviders: !!this.statusData?.providers,
            hasDetails: !!this.statusData?.providers?.details,
            detailsLength: this.statusData?.providers?.details?.length || 0
          });
        }

        // Fallback: Try to get from cache TTL settings in status
        if (this.statusData?.cache?.ttl_minutes) {
          const ttlMinutes = this.statusData.cache.ttl_minutes;
          const hotTtl = ttlMinutes.hot || ttlMinutes.hot_ttl || null;
          const warmTtl = ttlMinutes.warm || ttlMinutes.warm_ttl || null;

          if (hotCacheElement && hotTtl) {
            hotCacheElement.textContent = `${formatNumber(hotTtl)} דקות`;
          }
          if (warmCacheElement && warmTtl) {
            warmCacheElement.textContent = `${formatNumber(warmTtl)} דקות`;
          }
        }

        // Load fresh status if not available
        if (!this.statusData) {
          await this.loadSystemStatus();
          // Recursive call with fresh data
          await this.updateCurrentSettings();
          return;
        }

        // Set to NOT_AVAILABLE if still not found
        if (hotCacheElement && !hotCacheElement.textContent) {
          hotCacheElement.textContent = NOT_AVAILABLE_TEXT;
        }
        if (warmCacheElement && !warmCacheElement.textContent) {
          warmCacheElement.textContent = NOT_AVAILABLE_TEXT;
        }
        if (maxRequestsElement && !maxRequestsElement.textContent) {
          maxRequestsElement.textContent = NOT_AVAILABLE_TEXT;
        }
      } catch (error) {
        logger.error(`${MODULE_NAME}:update-current-settings:error`, { error });
        if (hotCacheElement) hotCacheElement.textContent = NOT_AVAILABLE_TEXT;
        if (warmCacheElement) warmCacheElement.textContent = NOT_AVAILABLE_TEXT;
        if (maxRequestsElement) maxRequestsElement.textContent = NOT_AVAILABLE_TEXT;
      }
    }

    /**
     * Load logs data
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadLogs(showNotification = false) {
      try {
        const logManager = window.UnifiedLogManager;
        if (logManager && typeof logManager.getLogData === 'function') {
          if (!logManager.initialized && typeof logManager.initialize === 'function') {
            await logManager.initialize();
          }
          const result = await logManager.getLogData('externalDataLog', {
            sortBy: 'timestamp',
            sortOrder: 'desc'
          });
          this.logs = Array.isArray(result?.data) ? result.data : [];
        } else {
          const response = await fetch('/api/external-data/status/logs');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
          }
          const fallbackData = await response.json();
          this.logs = Array.isArray(fallbackData.logs) ? fallbackData.logs : [];
        }
        this.applyLogFilters();
        if (showNotification) {
          notification.success('לוגים נטענו', 'נמשכו רשומות מהשרת');
        }
    } catch (error) {
        this.logs = [];
        this.applyLogFilters();
        this.handleError('שגיאה בטעינת לוגים', error, 'load-logs');
      }
    }

    /**
     * Apply log filters
     * @returns {void}
     */
    applyLogFilters() {
      const levelFilter = getElement('log-level-filter');
      const searchInput = getElement('log-search');
      const level = levelFilter ? levelFilter.value : 'all';
      const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

      let filtered = [...this.logs];
      if (level !== 'all') {
        filtered = filtered.filter((log) => log.level === level);
      }
      if (searchTerm) {
        filtered = filtered.filter(
          (log) =>
            log.message?.toLowerCase().includes(searchTerm) ||
            log.raw_line?.toLowerCase().includes(searchTerm)
        );
      }
      this.filteredLogs = filtered;
      this.renderLogs(filtered);
  }

  /**
   * Render logs list
   * @param {Array} logs - Array of log entries
   * @returns {void}
   */
  renderLogs(logs) {
      const logContent = getElement('log-content');
      if (!logContent) {
        return;
      }

      if (!logs.length) {
      const currentTime = window.formatDate ? window.formatDate(new Date(), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(), { includeTime: true }) : new Date().toLocaleString('he-IL'));
      logContent.textContent = '';
      const noLogsDiv = document.createElement('div');
      noLogsDiv.className = 'no-logs';
      const iconDiv = document.createElement('div');
      iconDiv.className = 'no-logs-icon';
      iconDiv.textContent = '📋';
      noLogsDiv.appendChild(iconDiv);
      const titleDiv = document.createElement('div');
      titleDiv.className = 'no-logs-title';
      titleDiv.textContent = 'אין לוגים להצגה';
      noLogsDiv.appendChild(titleDiv);
      const subtitleDiv = document.createElement('div');
      subtitleDiv.className = 'no-logs-subtitle';
      subtitleDiv.textContent = 'המערכת פועלת ללא שגיאות';
      noLogsDiv.appendChild(subtitleDiv);
      const timeDiv = document.createElement('div');
      timeDiv.className = 'no-logs-time';
      timeDiv.textContent = `נבדק לאחרונה: ${currentTime}`;
      noLogsDiv.appendChild(timeDiv);
      const infoDiv = document.createElement('div');
      infoDiv.className = 'no-logs-info';
      const p1 = document.createElement('p');
      p1.textContent = '• לוגים יופיעו כאן כאשר יש פעילות במערכת';
      infoDiv.appendChild(p1);
      const p2 = document.createElement('p');
      p2.textContent = '• רענן את הדף כדי לבדוק עדכונים חדשים';
      infoDiv.appendChild(p2);
      noLogsDiv.appendChild(infoDiv);
      logContent.appendChild(noLogsDiv);
      return;
    }

      logContent.textContent = '';
      const logsHTML = logs
        .map((log) => {
          const levelClass = `log-${log.level}`;
          return `
            <div class="log-entry ${levelClass}">
              <div class="log-timestamp">${safeText(log.timestamp)}</div>
              <div class="log-level">${safeText(log.level)}</div>
              <div class="log-message">${safeText(log.message)}</div>
            </div>
          `;
        })
        .join('');
    }

    /**
     * Load group refresh history
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadGroupRefreshHistory(showNotification = false) {
      try {
        const limitSelect = getElement('group-limit');
        const limit = limitSelect ? limitSelect.value : 20;
        const response = await fetch(`/api/external-data/status/group-refresh-history?limit=${limit}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        const history = data.group_refresh_history || [];
        this.groupRefreshHistory = history; // Store for detailed log
        this.renderGroupRefreshHistory(history);
        if (showNotification) {
          notification.success('היסטוריה עודכנה', `נטענו ${history.length} רשומות היסטוריה`);
        }
      } catch (error) {
        this.groupRefreshHistory = []; // Store empty array for detailed log
        this.renderGroupRefreshHistory([]);
        this.handleError('שגיאה בטעינת היסטוריית רענון', error, 'load-group-refresh-history');
      }
    }

    /**
     * Render group refresh history
     * @param {Array} history - Array of history entries
     * @returns {void}
     */
    renderGroupRefreshHistory(history) {
      const container = getElement('group-refresh-content');
      if (!container) {
        return;
      }

      if (!history.length) {
        container.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-center text-muted p-4';
        div.textContent = 'אין היסטוריית עדכונים קבוצתיים';
        container.appendChild(div);
        return;
      }

      container.textContent = '';
      const historyHTML = history
        .map((entry) => {
          const statusClass = entry.status === 'completed' ? 'completed' : entry.status === 'failed' ? 'failed' : 'started';
          const statusLabel = entry.status === 'completed' ? 'הושלם' : entry.status === 'failed' ? 'נכשל' : 'התחיל';
          const details = entry.successful_count !== null && entry.failed_count !== null
            ? `${formatNumber(entry.successful_count)} הצליחו, ${formatNumber(entry.failed_count)} נכשלו`
            : safeText(entry.message, 'אין פרטים נוספים');
          return `
            <div class="group-refresh-item">
              <div class="group-refresh-info">
                <div class="group-refresh-category">${safeText(this.getCategoryLabel(entry.category))} - ${safeText(entry.time_period)}</div>
                <div class="group-refresh-details">${details}</div>
                <div class="group-refresh-time">
                  התחיל: ${safeText(entry.started_at ? (window.formatDate ? window.formatDate(entry.started_at, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(entry.started_at, { includeTime: true }) : new Date(entry.started_at).toLocaleString('he-IL'))) : NOT_AVAILABLE_TEXT)}
                  | הסתיים: ${safeText(entry.completed_at ? (window.formatDate ? window.formatDate(entry.completed_at, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(entry.completed_at, { includeTime: true }) : new Date(entry.completed_at).toLocaleString('he-IL'))) : 'בתהליך')}
                </div>
              </div>
              <div class="group-refresh-status ${statusClass}">${statusLabel}</div>
            </div>
          `;
        })
        .join('');
      container.innerHTML = historyHTML;
    }

    /**
     * Get category label in Hebrew
     * @param {string} category - Category name
     * @returns {string} Category label
     */
    getCategoryLabel(category) {
      const labels = {
        active_trades: 'טיקרים עם טרייד פעיל',
        no_active_trades: 'טיקרים ללא טרייד פעיל',
        closed: 'טיקרים סגורים/מבוטלים',
        unknown: 'לא ידוע'
      };
      return labels[category] || category || NOT_AVAILABLE_TEXT;
    }

    /**
     * Load scheduler status
     * @param {boolean} [showNotification=false] - Whether to show notification
     * @returns {Promise<void>}
     */
    async loadSchedulerStatus(showNotification = false) {
      try {
        const response = await fetch('/api/external-data/scheduler/status');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.schedulerStatusData = data?.data || null;
        this.renderSchedulerStatus(this.schedulerStatusData);
        if (showNotification) {
          notification.success('מצב מתזמן עודכן', 'נתוני המתזמן נטענו בהצלחה');
        }
      } catch (error) {
        this.schedulerStatusData = null;
        this.renderSchedulerStatus(null);
        this.handleError('שגיאה בטעינת מצב מתזמן', error, 'load-scheduler-status');
      }
    }

    /**
     * Render scheduler status
     * @param {Object|null} data - Scheduler status data or null
     * @returns {void}
     */
    renderSchedulerStatus(data) {
      const container = getElement('scheduler-status-content');
      if (!container) {
        return;
      }

      if (!data) {
        container.innerHTML = '<div class="text-muted text-center p-4">לא ניתן לטעון את מצב המתזמן</div>';
        return;
      }

      const isRunning = data.scheduler_running === true;
      const statusClass = isRunning ? 'success' : 'secondary';
      const statusText = isRunning ? 'רץ' : 'עצור';
      const statusIcon = isRunning ? 'fa-play-circle' : 'fa-stop-circle';

      const lastRefresh = data.last_refresh ? (window.formatDate ? window.formatDate(data.last_refresh, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(data.last_refresh, { includeTime: true }) : new Date(data.last_refresh).toLocaleString('he-IL'))) : NOT_AVAILABLE_TEXT;
      const nextRefresh = data.next_refresh ? (window.formatDate ? window.formatDate(data.next_refresh, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(data.next_refresh, { includeTime: true }) : new Date(data.next_refresh).toLocaleString('he-IL'))) : NOT_AVAILABLE_TEXT;
      const startedAt = data.started_at ? (window.formatDate ? window.formatDate(data.started_at, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(data.started_at, { includeTime: true }) : new Date(data.started_at).toLocaleString('he-IL'))) : NOT_AVAILABLE_TEXT;

      container.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h6 class="mb-0">סטטוס מתזמן</h6>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <div class="status-indicator status-${statusClass} me-3">
                    <i class="fas ${statusIcon} fa-2x"></i>
                  </div>
                  <div>
                    <h5 class="mb-0">${statusText}</h5>
                    <small class="text-muted">מצב נוכחי</small>
                  </div>
                </div>
                <div class="scheduler-details">
                  <div class="detail-item mb-2">
                    <span class="detail-label">התחיל לרוץ:</span>
                    <span class="detail-value">${startedAt}</span>
                  </div>
                  <div class="detail-item mb-2">
                    <span class="detail-label">רענון אחרון:</span>
                    <span class="detail-value">${lastRefresh}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">רענון הבא:</span>
                    <span class="detail-value">${nextRefresh}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h6 class="mb-0">סטטיסטיקות רענונים</h6>
              </div>
              <div class="card-body">
                <div class="scheduler-stats">
                  <div class="stat-item mb-3">
                    <div class="stat-label">סה"כ רענונים</div>
                    <div class="stat-value">${formatNumber(data.total_refreshes || 0)}</div>
                  </div>
                  <div class="stat-item mb-3">
                    <div class="stat-label">רענונים מוצלחים</div>
                    <div class="stat-value text-success">${formatNumber(data.successful_refreshes || 0)}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">רענונים שנכשלו</div>
                    <div class="stat-value text-danger">${formatNumber(data.failed_refreshes || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

  /**
   * Refresh providers data
   * @returns {Promise<void>}
   */
  async refreshProviders() {
      await this.loadProviders(true);
    }

    /**
     * Refresh cache statistics
     * @returns {Promise<void>}
     */
    async refreshCacheStats() {
      await this.loadCacheStats(true);
    }

    /**
     * Refresh system status
     * @returns {Promise<void>}
     */
    async refreshSystemStatus() {
      await this.loadSystemStatus(true);
    }

    /**
     * Refresh group history
     * @returns {Promise<void>}
     */
    async refreshGroupHistory() {
      await this.loadGroupRefreshHistory(true);
    }

    /**
     * Save dashboard settings
     * @returns {Promise<void>}
     */
    async saveSettings() {
      const payload = {
        hot_cache_ttl: Number(getElement('hot-cache-ttl')?.value) || null,
        warm_cache_ttl: Number(getElement('warm-cache-ttl')?.value) || null,
        max_requests_hour: Number(getElement('max-requests-hour')?.value) || null
      };

      try {
      const response = await fetch('/api/external-data/status/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        notification.success('הצלחה', 'ההגדרות נשמרו בהצלחה');
        await this.loadCacheStats();
    } catch (error) {
        this.handleError('נכשל לשמור את ההגדרות', error, 'save-settings');
    }
  }

  /**
   * Reset settings form
   * @returns {Promise<void>}
   */
  async resetSettings() {
      const hotElement = getElement('hot-cache-ttl');
      const warmElement = getElement('warm-cache-ttl');
      const maxElement = getElement('max-requests-hour');

      // Use DataCollectionService to clear fields if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        if (hotElement) window.DataCollectionService.setValue(hotElement.id, '', 'text');
        if (warmElement) window.DataCollectionService.setValue(warmElement.id, '', 'text');
        if (maxElement) window.DataCollectionService.setValue(maxElement.id, '', 'text');
      } else {
        if (hotElement) hotElement.value = '';
        if (warmElement) warmElement.value = '';
        if (maxElement) maxElement.value = '';
      }

      notification.info('הגדרות אופסו', 'ניתן להזין ערכים חדשים ולשמור');
  }

  /**
   * Clear logs
   * @returns {Promise<void>}
   */
  async clearLogs() {
    try {
      const response = await fetch('/api/external-data/status/logs/clear', { method: 'POST' });
        if (!response.ok) {
          if (response.status === 501) {
            const data = await response.json();
            notification.warning('הפעולה אינה זמינה', safeText(data.message, 'ניקוי הלוגים טרם יושם'));
            return;
          }
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        notification.success('לוגים נוקו', 'הלוגים נוקו בהצלחה');
        await this.loadLogs();
    } catch (error) {
        this.handleError('שגיאה בניקוי הלוגים', error, 'clear-logs');
    }
  }

  /**
   * Clear external data cache
   * @returns {Promise<void>}
   */
  async clearCache() {
    try {
      const response = await fetch('/api/external-data/status/cache/clear', { method: 'POST' });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        notification.success('מטמון נוקה', 'מטמון הנתונים החיצוניים נוקה בהצלחה');
        await this.loadCacheStats();
        await this.loadSystemStatus();
        await this.loadProviders();
        await this.loadGroupRefreshHistory();
    } catch (error) {
        this.handleError('שגיאה בניקוי המטמון', error, 'clear-cache');
    }
  }

  /**
   * Reset external data system
   * @returns {Promise<void>}
   */
  async resetExternalSystem() {
    try {
      await this.clearCache();
      await this.clearLogs();
      notification.success('המערכת אופסה', 'כל הנתונים ההיסטוריים והלוגים נוקו בהצלחה');
    } catch (error) {
      this.handleError('שגיאה באיפוס מערכת הנתונים החיצוניים', error, 'reset-system');
    }
  }

  /**
   * Optimize cache
   * @returns {Promise<void>}
   */
  async optimizeCache() {
    try {
      const response = await fetch('/api/external-data/status/cache/optimize', { method: 'POST' });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        notification.success(
          'אופטימיזציית מטמון',
          `אופטימיזציית המטמון הושלמה (${formatNumber(result.optimized_size_bytes || 0)} בייטים שוחררו)`
        );
        await this.loadCacheStats();
    } catch (error) {
        this.handleError('שגיאה באופטימיזציית המטמון', error, 'optimize-cache');
    }
  }

  /**
   * Test all providers
   * @returns {Promise<Array>} Array of test results
   */
  async testAllProviders() {
    try {
        const startTime = performance.now();
        const response = await fetch('/api/external-data/status/providers');
        const duration = performance.now() - startTime;

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        const providers = data.providers || [];

        const results = providers.map((provider) => ({
          name: provider.display_name || provider.name,
          status: provider.is_healthy ? 'active' : 'inactive',
          lastUpdate: extractTimestampIso(provider.last_successful_request),
          error: provider.last_error,
          successRate: provider.recent_activity?.success_rate
            ? formatPercent(provider.recent_activity.success_rate * 100)
            : NOT_AVAILABLE_TEXT
        }));

        const healthyCount = results.filter((provider) => provider.status === 'active').length;
        notification.info(
          'בדיקת ספקים',
          `${healthyCount}/${results.length} ספקים בריאים (זמן תגובה ${formatDurationMs(duration)})`
        );

        this.renderProviderTestModal(results, duration);
        return results;
      } catch (error) {
        this.handleError('שגיאה בבדיקת ספקים', error, 'test-all-providers');
        return [];
      }
    }

    /**
     * Render provider test modal
     * @param {Array} results - Array of test results
     * @param {number} durationMs - Test duration in milliseconds
     * @returns {void}
     */
    renderProviderTestModal(results, durationMs) {
      if (typeof window.showDetailsModal !== 'function') {
        return;
      }
      const rows = results
        .map((provider) => {
          const statusBadge =
            provider.status === 'active'
              ? '<span class="badge bg-success">פעיל</span>'
              : '<span class="badge bg-danger">לא פעיל</span>';
          return `
            <tr>
              <td>${safeText(provider.name)}</td>
              <td>${statusBadge}</td>
              <td>${formatRelativeTime(provider.lastUpdate)}</td>
              <td>${provider.successRate}</td>
              <td>${provider.error ? `<span class="text-danger">${safeText(provider.error)}</span>` : 'ללא'}</td>
            </tr>
          `;
        })
        .join('');

      const modalContent = `
        <div class="row">
          <div class="col-12">
            <h5>תוצאות בדיקת ספקים (זמן ביצוע ${formatDurationMs(durationMs)})</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>ספק</th>
                    <th>סטטוס</th>
                    <th>עדכון אחרון</th>
                    <th>אחוז הצלחה</th>
                    <th>שגיאה אחרונה</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
        window.showDetailsModal('בדיקת ספקי נתונים - תוצאות מפורטות', modalContent);
    }

    /**
     * Analyze dashboard data
     * @returns {Promise<Object|null>} Analysis summary or null if no data
     */
    async analyzeData() {
      if (!this.statusData) {
        notification.warning('אין נתונים', 'אנא טען מחדש את סטטוס המערכת לפני ניתוח');
        return null;
      }
      const providers = this.statusData.providers?.details || [];
      const unhealthy = providers.filter((provider) => provider.is_active && !provider.is_healthy);
      const cacheHitRate = this.statusData.cache?.cache_hit_rate;
      const summary = {
        totalProviders: providers.length,
        activeProviders: providers.filter((provider) => provider.is_active).length,
        unhealthyProviders: unhealthy.length,
        cacheHitRate: cacheHitRate !== undefined ? formatPercent(cacheHitRate) : NOT_AVAILABLE_TEXT,
        overallHealth: this.statusData.overall_health === true ? 'בריא' : 'דורש בדיקה'
      };
      notification.info(
        'ניתוח נתונים',
        `ספקים פעילים: ${summary.activeProviders}/${summary.totalProviders}, ` +
          `ספקים בעייתיים: ${summary.unhealthyProviders}, ` +
          `אחוז פגיעות מטמון: ${summary.cacheHitRate}`
      );
      return summary;
    }

    /**
     * Backup dashboard data
     * @returns {Promise<void>}
     */
    async backupData() {
      try {
        await this.refreshCoreData();
        const exportPayload = {
          generatedAt: new Date().toISOString(),
          status: this.statusData,
          providers: this.providers,
          cacheStats: this.cacheStats,
          logs: this.logs
        };
        const filename = `external-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        this.exportToFile(filename, exportPayload);
        notification.success('גיבוי הושלם', 'קובץ הגיבוי ירד בהצלחה');
    } catch (error) {
        this.handleError('שגיאה ביצירת גיבוי', error, 'backup-data');
      }
    }

    /**
     * Export data to file
     * @param {string} filename - Filename for export
     * @param {Object} data - Data to export
     * @returns {void}
     */
    exportToFile(filename, data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
      link.href = url;
      link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    /**
     * Validate dashboard data
     * @returns {Promise<Object|null>} Validation result or null if no data
     */
    async validateData() {
      if (!this.statusData) {
        notification.warning('אין נתונים', 'אנא טען מחדש את הסטטוס לפני בדיקות תקינות');
        return null;
      }

      const issues = [];

      if (!Array.isArray(this.providers) || !this.providers.length) {
        issues.push('לא נמצאו ספקים במערכת');
      } else {
        const inactiveProviders = this.providers.filter((provider) => !provider.isActive);
        if (inactiveProviders.length) {
          issues.push(`נמצאו ${inactiveProviders.length} ספקים שאינם פעילים`);
        }
        const providersWithErrors = this.providers.filter((provider) => provider.lastError);
        if (providersWithErrors.length) {
          issues.push(`נמצאו ${providersWithErrors.length} ספקים עם שגיאה אחרונה`);
        }
      }

      if (!this.statusData.cache || typeof this.statusData.cache.total_quotes !== 'number') {
        issues.push('נתוני המטמון אינם זמינים');
      }

      if (issues.length) {
        notification.warning('בדיקת תקינות - נמצאו בעיות', issues.join('\n'));
      } else {
        notification.success('בדיקת תקינות', 'כל הבדיקות עברו בהצלחה');
      }

      return { issues, timestamp: new Date().toISOString() };
    }

    /**
     * Run unit tests
     * @returns {Promise<Object>} Test results object
     */
    async runUnitTests() {
      const tests = [];
      const startTime = performance.now();

      tests.push(await this.testYahooFinanceAPI());
      tests.push(await this.testDatabaseOperations());
      tests.push(await this.testCacheOperations());
      tests.push(await this.testRateLimitingReal());
      tests.push(await this.testDataValidation());
      tests.push(await this.testErrorHandling());

      const duration = performance.now() - startTime;
      const passed = tests.filter((test) => test.status === 'passed').length;
      const failed = tests.length - passed;

      const summaryMessage = `בדיקות יחידה הושלמו: ${passed}/${tests.length} עברו (${formatDurationMs(duration)})`;
      if (failed === 0) {
        notification.success('בדיקות יחידה', summaryMessage);
      } else {
        notification.warning('בדיקות יחידה', `${summaryMessage}\nבדוק את פירוט הכישלונות למטה.`);
      }

      this.renderTestResultsModal(tests, duration);
      return { tests, passed, failed, duration };
    }

    /**
     * Render test results modal
     * @param {Array} tests - Array of test results
     * @param {number} duration - Test duration in milliseconds
     * @returns {void}
     */
    renderTestResultsModal(tests, duration) {
      if (typeof window.showDetailsModal !== 'function') {
        return;
      }

      const rows = tests
        .map((test) => {
          const badge =
            test.status === 'passed'
              ? '<span class="badge bg-success">עבר</span>'
              : '<span class="badge bg-danger">נכשל</span>';
          return `
            <tr>
              <td>${safeText(test.name)}</td>
              <td>${badge}</td>
              <td>${safeText(test.duration)}</td>
              <td>${test.error ? `<span class="text-danger">${safeText(test.error)}</span>` : safeText(test.details, 'OK')}</td>
            </tr>
          `;
        })
        .join('');

      const modalContent = `
        <div class="row">
          <div class="col-12">
            <h5>תוצאות בדיקות יחידה (זמן ביצוע ${formatDurationMs(duration)})</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>בדיקה</th>
                    <th>סטטוס</th>
                    <th>זמן</th>
                    <th>פרטים</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
        window.showDetailsModal('בדיקות יחידה - תוצאות מפורטות', modalContent);
  }

  /**
   * Test specific functions
   * @returns {Promise<Array>} Array of test results
   */
  async testSpecificFunction() {
      const tests = [];
      tests.push(await this.testYahooFinanceAPI());
      tests.push(await this.testCacheOperations());
      tests.push(await this.testDataValidation());

      // Note: This is a test results summary, not a standard summary element
      // Using filter for counting is acceptable here as it's specific to test results structure
      const passed = tests.filter((test) => test.status === 'passed').length;
      const summary = `בדיקת פונקציות ספציפיות: ${passed}/${tests.length} עברו`;
      if (passed === tests.length) {
        notification.success('בדיקת פונקציות', summary);
      } else {
        notification.warning('בדיקת פונקציות', summary);
      }
      return tests;
  }

  /**
   * Generate test report
   * @returns {Promise<Object>} Test report object
   */
  async generateTestReport() {
      const result = await this.runUnitTests();
      const report = {
        generatedAt: new Date().toISOString(),
        summary: {
          total: result.tests.length,
          passed: result.passed,
          failed: result.failed,
          duration: result.duration
        },
        tests: result.tests
      };
      const reportText = this.generateTextReport(report);
      try {
        await navigator.clipboard.writeText(reportText);
        notification.success('דוח בדיקות', 'הדוח הועתק ללוח בהצלחה');
      } catch (error) {
        this.handleError('שגיאה בהעתקת דוח הבדיקות', error, 'generate-test-report');
        this.exportToFile(`external-data-test-report-${new Date().toISOString()}.txt`, report);
      }
      return report;
  }

  /**
   * Generate text report from test results
   * @param {Object} report - Test report object
   * @returns {string} Text report
   */
  generateTextReport(report) {
      const lines = [];
      lines.push('=== דוח בדיקות מערכת נתונים חיצוניים ===');
      lines.push(`זמן יצירה: ${window.formatDate ? window.formatDate(new Date(report.generatedAt), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(report.generatedAt), { includeTime: true }) : new Date(report.generatedAt).toLocaleString('he-IL'))}`);
      lines.push('');
      lines.push('--- סיכום ---');
      lines.push(`סה"כ בדיקות: ${report.summary.total}`);
      lines.push(`עברו: ${report.summary.passed}`);
      lines.push(`נכשלו: ${report.summary.failed}`);
      lines.push(`זמן ביצוע: ${formatDurationMs(report.summary.duration)}`);
      lines.push('');
      lines.push('--- פירוט ---');
      report.tests.forEach((test) => {
        const statusLabel = test.status === 'passed' ? '✅ עבר' : '❌ נכשל';
        lines.push(`${statusLabel} ${test.name} (${test.duration}) ${test.error ? `- ${test.error}` : ''}`);
      });
      lines.push('');
      lines.push('=== סוף הדוח ===');
      return lines.join('\n');
    }

  /**
   * Test Yahoo Finance API connection
   * @returns {Promise<Object>} Test result object
   */
  async testYahooFinanceAPI() {
      const startTime = performance.now();
    try {
      const response = await fetch('/api/external-data/yahoo/quote/AAPL');
        const duration = performance.now() - startTime;
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Yahoo Finance API Connection',
          status: 'passed',
            duration: formatDurationMs(duration),
            details: `AAPL: ${safeText(data.data?.price, 'מחיר לא זמין')}`
        };
        }
        return {
          name: 'Yahoo Finance API Connection',
          status: 'failed',
          duration: formatDurationMs(duration),
          error: `HTTP ${response.status}`
        };
    } catch (error) {
      return {
        name: 'Yahoo Finance API Connection',
        status: 'failed',
        duration: 'N/A',
        error: error.message
      };
    }
  }

  /**
   * Test database operations
   * @returns {Promise<Object>} Test result object
   */
  async testDatabaseOperations() {
      const startTime = performance.now();
    try {
      const response = await fetch('/api/external-data/refresh/all', { method: 'POST' });
        const duration = performance.now() - startTime;
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Database Operations',
          status: 'passed',
            duration: formatDurationMs(duration),
            details: `${formatNumber(data.result?.successful_updates || 0)} טיקרים עודכנו`
        };
        }
        return {
          name: 'Database Operations',
          status: 'failed',
          duration: formatDurationMs(duration),
          error: `HTTP ${response.status}`
        };
    } catch (error) {
      return {
        name: 'Database Operations',
        status: 'failed',
        duration: 'N/A',
        error: error.message
      };
    }
  }

  /**
   * Test cache operations
   * @returns {Promise<Object>} Test result object
   */
  async testCacheOperations() {
      const startTime = performance.now();
    try {
      const response = await fetch('/api/cache/stats');
        const duration = performance.now() - startTime;
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Cache Operations',
          status: 'passed',
            duration: formatDurationMs(duration),
            details: `${formatNumber(data.data?.total_entries || 0)} רשומות במטמון`
        };
        }
        return {
          name: 'Cache Operations',
          status: 'failed',
          duration: formatDurationMs(duration),
          error: `HTTP ${response.status}`
        };
    } catch (error) {
      return {
        name: 'Cache Operations',
        status: 'failed',
        duration: 'N/A',
        error: error.message
      };
    }
  }

  /**
   * Test rate limiting
   * @returns {Promise<Object>} Test result object
   */
  async testRateLimitingReal() {
      const startTime = performance.now();
      try {
        const requests = [];
        for (let i = 0; i < 3; i += 1) {
          requests.push(fetch('/api/external-data/refresh/all', { method: 'POST' }));
        }
        const responses = await Promise.allSettled(requests);
        const duration = performance.now() - startTime;
        const successCount = responses.filter((res) => res.status === 'fulfilled' && res.value.ok).length;
        return {
          name: 'Rate Limiting',
          status: successCount >= 2 ? 'passed' : 'failed',
          duration: formatDurationMs(duration),
          details: `${successCount}/3 בקשות הצליחו`
        };
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'failed',
        duration: 'N/A',
        error: error.message
      };
    }
  }

  /**
   * Test data validation
   * @returns {Promise<Object>} Test result object
   */
  async testDataValidation() {
      const startTime = performance.now();
    try {
      const response = await fetch('/api/external-data/status/');
        const duration = performance.now() - startTime;
        if (!response.ok) {
          return {
            name: 'Data Validation',
            status: 'failed',
            duration: formatDurationMs(duration),
            error: `HTTP ${response.status}`
          };
        }
        const data = await response.json();
        const hasCache = typeof data.cache?.total_quotes === 'number';
        const hasProviders = Array.isArray(data.providers?.details);
        const hasOverallHealth = typeof data.overall_health === 'boolean';
        const passed = hasCache && hasProviders && hasOverallHealth;
        return {
          name: 'Data Validation',
          status: passed ? 'passed' : 'failed',
          duration: formatDurationMs(duration),
          details: passed ? 'מבנה הנתונים תקין' : 'נמצאו שדות חסרים בתשובה'
        };
    } catch (error) {
      return {
        name: 'Data Validation',
        status: 'failed',
        duration: 'N/A',
        error: error.message
      };
    }
  }

  /**
   * Test error handling
   * @returns {Promise<Object>} Test result object
   */
  async testErrorHandling() {
      const startTime = performance.now();
    try {
      const response = await fetch('/api/external-data/nonexistent-endpoint');
        const duration = performance.now() - startTime;
      if (response.status === 404) {
        return {
          name: 'Error Handling',
          status: 'passed',
            duration: formatDurationMs(duration),
            details: 'שרת החזיר סטטוס 404 כמצופה'
        };
        }
        return {
          name: 'Error Handling',
          status: 'failed',
          duration: formatDurationMs(duration),
          error: `סטטוס לא צפוי: ${response.status}`
        };
    } catch (error) {
      return {
        name: 'Error Handling',
        status: 'passed',
        duration: 'N/A',
          details: 'שגיאת רשת טופלה בהצלחה'
        };
      }
    }

    /**
     * Test API endpoints
     * @returns {Promise<Array>} Array of endpoint test results
     */
    async testAPIEndpoints() {
      const endpoints = [
        { name: '/api/external-data/status/', method: 'GET' },
        { name: '/api/external-data/status/providers', method: 'GET' },
        { name: '/api/external-data/status/group-refresh-history?limit=5', method: 'GET' },
        { name: '/api/external-data/status/cache/clear', method: 'POST' },
        { name: '/api/external-data/status/cache/optimize', method: 'POST' }
      ];

      const results = [];
      for (const endpoint of endpoints) {
        const startTime = performance.now();
        try {
          const response = await fetch(endpoint.name, { method: endpoint.method });
          const duration = performance.now() - startTime;
          results.push({
            endpoint: endpoint.name,
            method: endpoint.method,
            status: response.ok ? 'success' : 'error',
            duration: formatDurationMs(duration),
            responseStatus: response.status
          });
        } catch (error) {
          results.push({
            endpoint: endpoint.name,
            method: endpoint.method,
            status: 'error',
            duration: 'N/A',
            responseStatus: error.message
          });
        }
      }

      const successCount = results.filter((result) => result.status === 'success').length;
      notification.info(
        'בדיקת API',
        `${successCount}/${results.length} קריאות API הצליחו`
      );
      this.renderApiTestModal(results);
      return results;
    }

    /**
     * Render API test modal
     * @param {Array} results - Array of API test results
     * @returns {void}
     */
    renderApiTestModal(results) {
      if (typeof window.showDetailsModal !== 'function') {
        return;
      }
      const rows = results
        .map((result) => {
          const badge =
            result.status === 'success'
              ? '<span class="badge bg-success">הצלחה</span>'
              : '<span class="badge bg-danger">שגיאה</span>';
          return `
            <tr>
              <td><code>${result.method}</code></td>
              <td>${safeText(result.endpoint)}</td>
              <td>${badge}</td>
              <td>${safeText(result.responseStatus)}</td>
              <td>${safeText(result.duration)}</td>
            </tr>
          `;
        })
        .join('');

      const modalContent = `
        <div class="row">
          <div class="col-12">
            <h5>תוצאות בדיקת API</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>מתודה</th>
                    <th>נתיב</th>
                    <th>סטטוס</th>
                    <th>קוד תגובה</th>
                    <th>זמן תגובה</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      window.showDetailsModal('בדיקת API - פירוט', modalContent);
    }

    /**
     * Start performance monitoring
     * @returns {Array} Performance samples array
     */
    startPerformanceMonitoring() {
      if (this.performanceInterval) {
        notification.info('ניטור ביצועים', 'ניטור הביצועים כבר פעיל');
        return this.performanceSamples;
      }

      this.performanceSamples = [];
      this.performanceInterval = window.setInterval(() => {
        this.collectPerformanceSample();
      }, PERFORMANCE_SAMPLE_INTERVAL_MS);
      notification.success('ניטור ביצועים', 'הניטור הופעל ומדגם נתונים בפועל');
      return this.performanceSamples;
    }

    /**
     * Stop performance monitoring
     * @returns {Array} Performance samples array
     */
    stopPerformanceMonitoring() {
      if (this.performanceInterval) {
        window.clearInterval(this.performanceInterval);
        this.performanceInterval = null;
        notification.info('ניטור ביצועים', 'הניטור הופסק והנתונים נשמרו');
      } else {
        notification.warning('ניטור ביצועים', 'הניטור אינו פעיל');
      }
      return this.performanceSamples;
    }

    /**
     * Collect performance sample
     * @returns {Promise<void>}
     */
    async collectPerformanceSample() {
      const startTime = performance.now();
      try {
        const response = await fetch('/api/external-data/status/');
        const duration = performance.now() - startTime;
        const success = response.ok;
        const sample = {
          timestamp: new Date().toISOString(),
          responseTimeMs: duration,
          status: success ? 'success' : 'error'
        };
        if (!success) {
          sample.error = `HTTP ${response.status}`;
        }
        this.performanceSamples.push(sample);
        if (this.performanceSamples.length > 50) {
          this.performanceSamples.shift();
        }
        await this.updateResponseTimeChart();
        await this.updateErrorAnalysisChart();
      } catch (error) {
        const sample = {
          timestamp: new Date().toISOString(),
          responseTimeMs: null,
          status: 'error',
          error: error.message
        };
        this.performanceSamples.push(sample);
        if (this.performanceSamples.length > 50) {
          this.performanceSamples.shift();
        }
        await this.updateErrorAnalysisChart();
      }
    }

    /**
     * Refresh performance charts
     * @returns {Promise<void>}
     */
    async refreshPerformanceCharts() {
      await Promise.all([
        this.updateResponseTimeChart(),
        this.updateDataQualityChart(this.statusData),
        this.updateProviderComparisonChart(this.statusData),
        this.updateErrorAnalysisChart()
      ]);
      notification.success('גרפי ביצועים', 'הגרפים עודכנו על סמך נתונים אחרונים');
    }

    /**
     * Update response time chart
     * @returns {Promise<void>}
     */
    async updateResponseTimeChart() {
      const chartSystem = this.getChartSystem();
      if (!chartSystem) {
        return;
      }

      const chartId = CHART_IDS.responseTime;
      const selector = '#responseTimeChart';
      const canvas = document.querySelector(selector);

      // Check if canvas is visible in DOM
      if (!canvas || !canvas.offsetParent || !this.performanceSamples.length) {
        if (canvas && !canvas.offsetParent) {
          // Canvas exists but is hidden (section is collapsed)
          this.destroyChart(chartId, 'responseTimeChart');
        }
        return;
      }

      const labels = this.performanceSamples.map((sample) =>
        window.formatDate ? window.formatDate(new Date(sample.timestamp), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(sample.timestamp), { includeTime: true }) : new Date(sample.timestamp).toLocaleTimeString('he-IL'))
      );
      const dataset = this.performanceSamples.map((sample) => sample.responseTimeMs || 0);

      const chartConfig = {
        id: chartId,
        type: 'line',
        container: selector,
        data: {
          labels,
          datasets: [
            {
              label: 'זמן תגובה (ms)',
              data: dataset,
              borderColor: 'rgb(38, 186, 172)',
              backgroundColor: 'rgba(38, 186, 172, 0.2)',
              tension: 0.15
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };

      try {
        this.destroyChart(chartId, 'responseTimeChart');
        this.responseTimeChart = await chartSystem.create(chartConfig);
      } catch (error) {
        logger.error(`${MODULE_NAME}:chart-system-error`, { chartId, error });
      }
    }

    /**
     * Update data quality chart
     * @param {Object} data - Status data
     * @returns {Promise<void>}
     */
    async updateDataQualityChart(data) {
      const chartSystem = this.getChartSystem();
      if (!chartSystem) {
        return;
      }

      const chartId = CHART_IDS.dataQuality;
      const selector = '#dataQualityChart';
      const canvas = document.querySelector(selector);

      // Check if canvas is visible in DOM
      if (!canvas || !canvas.offsetParent || !data?.cache) {
        if (canvas && !canvas.offsetParent) {
          // Canvas exists but is hidden (section is collapsed)
          this.destroyChart(chartId, 'dataQualityChart');
        }
        return;
      }

      const totalQuotes = data.cache.total_quotes || 0;
      const staleData = data.cache.stale_data_count || 0;
      const validData = Math.max(totalQuotes - staleData, 0);

      const chartConfig = {
        id: chartId,
        type: 'doughnut',
        container: selector,
        data: {
          labels: ['נתונים תקינים', 'נתונים פגומים'],
          datasets: [
            {
              data: [validData, staleData],
              backgroundColor: ['rgba(38, 186, 172, 0.8)', 'rgba(252, 90, 6, 0.7)']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            title: {
              display: false
            }
          }
        }
      };

      try {
        this.destroyChart(chartId, 'dataQualityChart');
        this.dataQualityChart = await chartSystem.create(chartConfig);
      } catch (error) {
        logger.error(`${MODULE_NAME}:chart-system-error`, { chartId, error });
      }
    }

    /**
     * Update provider comparison chart
     * @param {Object} data - Status data
     * @returns {Promise<void>}
     */
    async updateProviderComparisonChart(data) {
      const chartSystem = this.getChartSystem();
      if (!chartSystem) {
        return;
      }

      const chartId = CHART_IDS.providerComparison;
      const selector = '#providerComparisonChart';
      const canvas = document.querySelector(selector);

      // Check if canvas is visible in DOM
      if (!canvas || !canvas.offsetParent || !data?.providers?.details?.length) {
        if (canvas && !canvas.offsetParent) {
          // Canvas exists but is hidden (section is collapsed)
          this.destroyChart(chartId, 'providerComparisonChart');
        }
        return;
      }

      const providers = data.providers.details;
      const labels = providers.map((provider) => provider.display_name || provider.name);
      const successRates = providers.map((provider) => {
        const rate = provider.recent_success_rate;
        if (rate === null || rate === undefined) {
          return 0;
        }
        return rate * 100;
      });

      const chartConfig = {
        id: chartId,
        type: 'bar',
        container: selector,
        data: {
          labels,
          datasets: [
            {
              label: 'אחוז הצלחה',
              data: successRates,
              backgroundColor: 'rgba(38, 186, 172, 0.7)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };

      try {
        this.destroyChart(chartId, 'providerComparisonChart');
        this.providerComparisonChart = await chartSystem.create(chartConfig);
      } catch (error) {
        logger.error(`${MODULE_NAME}:chart-system-error`, { chartId, error });
      }
    }

    /**
     * Update error analysis chart
     * @returns {Promise<void>}
     */
    async updateErrorAnalysisChart() {
      const chartSystem = this.getChartSystem();
      if (!chartSystem) {
        return;
      }

      const chartId = CHART_IDS.errorAnalysis;
      const selector = '#errorAnalysisChart';
      const canvas = document.querySelector(selector);

      // Check if canvas is visible in DOM
      if (!canvas || !canvas.offsetParent) {
        if (canvas && !canvas.offsetParent) {
          // Canvas exists but is hidden (section is collapsed)
          this.destroyChart(chartId, 'errorAnalysisChart');
        }
        return;
      }

      const errorCounts = this.performanceSamples.reduce(
        (acc, sample) => {
          if (sample.status === 'error') {
            const key = sample.error || 'שגיאה לא ידועה';
            acc[key] = (acc[key] || 0) + 1;
          }
          return acc;
        },
        {}
      );

      const labels = Object.keys(errorCounts);
      const values = Object.values(errorCounts);

      if (!labels.length) {
        this.destroyChart(chartId, 'errorAnalysisChart');
        return;
      }

      const chartConfig = {
        id: chartId,
        type: 'bar',
        container: selector,
        data: {
          labels,
          datasets: [
            {
              label: 'מספר הופעות',
              data: values,
              backgroundColor: 'rgba(252, 90, 6, 0.7)'
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            title: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      };

      try {
        this.destroyChart(chartId, 'errorAnalysisChart');
        this.errorAnalysisChart = await chartSystem.create(chartConfig);
      } catch (error) {
        logger.error(`${MODULE_NAME}:chart-system-error`, { chartId, error });
      }
    }

    /**
     * Export performance data
     * @returns {Promise<Object|null>} Performance data payload or null
     */
    async exportPerformanceData() {
      if (!this.performanceSamples.length) {
        notification.warning('אין נתונים', 'הפעל ניטור ביצועים לפני ייצוא');
        return null;
      }
      const payload = {
        generatedAt: new Date().toISOString(),
        samples: this.performanceSamples,
        summary: {
          totalSamples: this.performanceSamples.length,
          averageResponseTime: this.calculateAverageResponseTime(),
          errorCount: this.performanceSamples.filter((sample) => sample.status === 'error').length
        }
      };
      this.exportToFile(`external-data-performance-${new Date().toISOString()}.json`, payload);
      notification.success('ייצוא נתוני ביצועים', 'הקובץ ירד בהצלחה');
      return payload;
    }

    /**
     * Calculate average response time from performance samples
     * @returns {number|null} Average response time in milliseconds or null
     */
    calculateAverageResponseTime() {
      const validSamples = this.performanceSamples.filter(
        (sample) => typeof sample.responseTimeMs === 'number'
      );
      if (!validSamples.length) {
        return null;
      }
      const total = validSamples.reduce((sum, sample) => sum + sample.responseTimeMs, 0);
      return total / validSamples.length;
    }

    /**
     * Analyze system bottlenecks
     * @returns {Promise<Array|null>} Array of bottleneck objects or null
     */
    async analyzeBottlenecks() {
      if (!this.statusData) {
        notification.warning('אין נתונים', 'אנא טען מחדש את הסטטוס לפני ניתוח');
        return null;
      }

      const providers = this.statusData.providers?.details || [];
      const unhealthyProviders = providers.filter((provider) => provider.is_active && !provider.is_healthy);
      const cacheHitRate = this.statusData.cache?.cache_hit_rate ?? 0;
      const errorCount = this.logs.filter((log) => log.level === 'error').length;

      const bottlenecks = [];
      if (unhealthyProviders.length) {
        bottlenecks.push({
          component: 'Data Providers',
          severity: 'high',
          impact: `${unhealthyProviders.length} ספקים פעילים נמצאו במצב שגיאה`,
          recommendation: 'בדוק את לוג הספקים ונסה לרענן חיבורים'
        });
      }

      if (cacheHitRate < 0.6) {
        bottlenecks.push({
          component: 'Cache System',
          severity: 'medium',
          impact: `אחוז הפגיעות נמוך (${formatPercent(cacheHitRate)})`,
          recommendation: 'הגדל TTL לנתונים פופולריים או בדוק את הסנכרון עם השרת'
        });
      }

      if (errorCount > 0) {
        bottlenecks.push({
          component: 'System Logs',
          severity: 'medium',
          impact: `${errorCount} רשומות שגיאה נמצאו בלוגים`,
          recommendation: 'סקור את הלוגים האחרונים וטפל בשגיאות נכשלות'
        });
      }

      if (!bottlenecks.length) {
        notification.success('ניתוח צווארי בקבוק', 'לא אותרו צווארי בקבוק ברמת האזהרה');
      } else {
        notification.warning(
          'ניתוח צווארי בקבוק',
          `נמצאו ${bottlenecks.length} מוקדי תשומת לב. פרטים זמינים במודאל.`
        );
        this.renderBottleneckModal(bottlenecks);
      }
      return bottlenecks;
    }

    /**
     * Render bottleneck analysis modal
     * @param {Array} bottlenecks - Array of bottleneck objects
     * @returns {void}
     */
    renderBottleneckModal(bottlenecks) {
      if (typeof window.showDetailsModal !== 'function') {
        return;
      }
      const rows = bottlenecks
        .map((item) => {
          const severityBadge = item.severity === 'high'
            ? '<span class="badge bg-danger">גבוה</span>'
            : item.severity === 'medium'
              ? '<span class="badge bg-warning text-dark">בינוני</span>'
              : '<span class="badge bg-info">נמוך</span>';
          return `
            <tr>
              <td>${safeText(item.component)}</td>
              <td>${severityBadge}</td>
              <td>${safeText(item.impact)}</td>
              <td>${safeText(item.recommendation)}</td>
            </tr>
          `;
        })
        .join('');

      const modalContent = `
        <div class="row">
          <div class="col-12">
            <h5>ניתוח צווארי בקבוק</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>רכיב</th>
                    <th>חומרה</th>
                    <th>השפעה</th>
                    <th>המלצה</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      window.showDetailsModal('ניתוח צווארי בקבוק - פירוט', modalContent);
    }

    /**
     * Copy detailed log to clipboard
     * @returns {Promise<string>} Detailed log text
     */
    async copyDetailedLog() {
      const log = this.generateDetailedLog();
      try {
        await navigator.clipboard.writeText(log);
        notification.success('לוג מפורט', 'הפרטים הועתקו ללוח בהצלחה');
      } catch (error) {
        this.handleError('שגיאה בהעתקת הלוג המפורט', error, 'copy-detailed-log');
      }
      return log;
    }

    /**
     * Generate detailed log text
     * @returns {string} Detailed log text
     */
    generateDetailedLog() {
      const lines = [];
      lines.push('=== לוג מפורט - דשבורד נתונים חיצוניים ===');
      lines.push(`זמן יצירה: ${window.formatDate ? window.formatDate(new Date(), true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(new Date(), { includeTime: true }) : new Date().toLocaleString('he-IL'))}`);
      lines.push(`כתובת עמוד: ${window.location.href}`);
      lines.push('');

      lines.push('--- סטטוס מערכת ---');
      if (this.statusData) {
        lines.push(`סטטוס כללי: ${safeText(this.statusData.status)}`);
        lines.push(`בריאות כללית: ${safeText(this.statusData.overall_health)}`);
        lines.push(`ספקים פעילים: ${formatNumber(this.statusData.providers?.active ?? 0)}`);
        lines.push(`ציטוטים במטמון: ${formatNumber(this.statusData.cache?.total_quotes ?? 0)}`);
            } else {
        lines.push('סטטוס לא נטען');
      }
      lines.push('');

      lines.push('--- נתוני ספקים ---');
      if (this.providers.length) {
        this.providers.forEach((provider) => {
          lines.push(
            `${safeText(provider.displayName || provider.name)} | פעיל: ${
              provider.isActive ? 'כן' : 'לא'
            } | בריא: ${provider.isHealthy ? 'כן' : 'לא'} | עדכון אחרון: ${
              provider.lastSuccessfulDisplay
                ? safeText(provider.lastSuccessfulDisplay)
                : provider.lastSuccessfulRequest
                ? formatRelativeTime(provider.lastSuccessfulRequest)
                : NOT_AVAILABLE_TEXT
            }`
          );
        });
        } else {
        lines.push('לא נמצאו ספקים');
      }
      lines.push('');

      lines.push('--- סטטיסטיקות מטמון ---');
      if (this.cacheStats?.data) {
        const stats = this.cacheStats.data;
        lines.push(`רשומות במטמון: ${formatNumber(stats.total_entries)}`);
        lines.push(`רשומות פג תוקף: ${formatNumber(stats.expired_entries)}`);
        lines.push(`אחוז פגיעות: ${formatPercent(stats.hit_rate)}`);
        lines.push(`שימוש בזיכרון: ${formatDecimal(stats.estimated_memory_mb, 2)}MB`);
            } else {
        lines.push('נתוני מטמון לא זמינים');
      }
      lines.push('');

      lines.push('--- לוגים אחרונים ---');
      if (this.logs.length) {
        this.logs.slice(0, 10).forEach((logEntry) => {
          const timestamp = safeText(logEntry.timestamp ?? logEntry.time ?? 'לא זמין');
          const level = safeText((logEntry.level ?? 'info').toString());

          let message = logEntry.message ?? logEntry.text ?? '';
          if (typeof message === 'object' && message !== null) {
            try {
              message = JSON.stringify(message, null, 2);
            } catch (error) {
              message = safeText(message.toString());
            }
          } else {
            message = safeText(message.toString());
          }

          lines.push(`[${timestamp}] (${level}) ${message}`);

          const extra = { ...logEntry };
          delete extra.timestamp;
          delete extra.time;
          delete extra.level;
          delete extra.message;
          delete extra.text;
          if (Object.keys(extra).length) {
            try {
              lines.push(`  details: ${JSON.stringify(extra, null, 2)}`);
            } catch (error) {
              lines.push(`  details: ${safeText(extra.toString())}`);
            }
          }
        });
      } else {
        lines.push('אין לוגים זמינים');
      }
      lines.push('');

      // Add scheduler status data
      lines.push('--- מצב מתזמן רענון נתונים ---');
      if (this.schedulerStatusData) {
        lines.push(`מתזמן רץ: ${this.schedulerStatusData.scheduler_running ? 'כן' : 'לא'}`);
        lines.push(`רענון אחרון: ${this.schedulerStatusData.last_refresh ? safeText(this.schedulerStatusData.last_refresh) : NOT_AVAILABLE_TEXT}`);
        lines.push(`רענון הבא: ${this.schedulerStatusData.next_refresh ? safeText(this.schedulerStatusData.next_refresh) : NOT_AVAILABLE_TEXT}`);
        lines.push(`רענונים מוצלחים: ${formatNumber(this.schedulerStatusData.successful_refreshes ?? 0)}`);
        lines.push(`רענונים נכשלו: ${formatNumber(this.schedulerStatusData.failed_refreshes ?? 0)}`);
        lines.push(`סה"כ רענונים: ${formatNumber(this.schedulerStatusData.total_refreshes ?? 0)}`);
      } else {
        lines.push('נתוני מתזמן לא נטענו');
      }
      lines.push('');

      // Add scheduler monitoring data
      lines.push('--- ניטור מתזמן רענון נתונים ---');
      if (this.schedulerMonitoringData) {
        const monitoring = this.schedulerMonitoringData;
        const schedulerStatus = monitoring.scheduler_status || {};
        const performanceMetrics = monitoring.performance_metrics || {};
        const alerts = monitoring.alerts || [];
        
        lines.push(`מתזמן רץ: ${schedulerStatus.scheduler_running ? 'כן' : 'לא'}`);
        lines.push(`רענון אחרון: ${schedulerStatus.last_refresh ? safeText(schedulerStatus.last_refresh) : NOT_AVAILABLE_TEXT}`);
        lines.push(`רענון הבא: ${schedulerStatus.next_refresh ? safeText(schedulerStatus.next_refresh) : NOT_AVAILABLE_TEXT}`);
        
        if (Object.keys(performanceMetrics).length > 0) {
          lines.push('מדדי ביצועים:');
          Object.entries(performanceMetrics).forEach(([key, value]) => {
            lines.push(`  ${key}: ${typeof value === 'number' ? formatNumber(value) : safeText(value)}`);
          });
        }
        
        if (alerts.length > 0) {
          lines.push(`התראות: ${alerts.length}`);
          alerts.slice(0, 5).forEach(alert => {
            lines.push(`  [${alert.level}] ${safeText(alert.message)}`);
          });
        } else {
          lines.push('אין התראות');
        }
      } else {
        lines.push('נתוני ניטור לא נטענו');
      }
      lines.push('');

      // Add missing data tickers
      lines.push('--- טיקרים עם נתונים חסרים ---');
      if (this.missingDataTickers) {
        const missing = this.missingDataTickers;
        const summary = missing.summary || {};
        lines.push(`סה"כ טיקרים פתוחים: ${formatNumber(summary.total_open_tickers || 0)}`);
        lines.push(`חסר quote נוכחי: ${formatNumber(summary.missing_current_count || 0)}`);
        lines.push(`נתונים היסטוריים לא מספיקים: ${formatNumber(summary.missing_historical_count || 0)}`);
        lines.push(`חסרים חישובים טכניים: ${formatNumber(summary.missing_indicators_count || 0)}`);
        
        const missingCurrent = missing.tickers_missing_current || [];
        if (missingCurrent.length > 0) {
          lines.push(`טיקרים ללא quote נוכחי (${missingCurrent.length}):`);
          missingCurrent.slice(0, 10).forEach(ticker => {
            lines.push(`  - ${safeText(ticker.symbol || ticker.name || `טיקר #${ticker.id}`)}`);
          });
        }
        
        const recommendations = missing.recommendations || [];
        if (recommendations.length > 0) {
          lines.push(`המלצות (${recommendations.length}):`);
          recommendations.slice(0, 5).forEach(rec => {
            lines.push(`  - ${safeText(rec.message || rec)}`);
          });
        }
      } else {
        lines.push('נתוני טיקרים עם נתונים חסרים לא נטענו');
      }
      lines.push('');

      // Add group refresh history
      lines.push('--- היסטוריית רענונים קבוצתיים ---');
      if (this.groupRefreshHistory && Array.isArray(this.groupRefreshHistory) && this.groupRefreshHistory.length > 0) {
        lines.push(`סה"כ רענונים: ${formatNumber(this.groupRefreshHistory.length)}`);
        this.groupRefreshHistory.slice(0, 5).forEach((entry, index) => {
          lines.push(`רענון ${index + 1}:`);
          lines.push(`  זמן: ${entry.timestamp ? safeText(entry.timestamp) : NOT_AVAILABLE_TEXT}`);
          lines.push(`  טיקרים: ${formatNumber(entry.tickers_count || 0)}`);
          lines.push(`  מוצלח: ${entry.success ? 'כן' : 'לא'}`);
          if (entry.duration) {
            lines.push(`  משך: ${formatNumber(entry.duration)}ms`);
          }
        });
      } else {
        lines.push('אין היסטוריית רענונים זמינה');
      }
      lines.push('');

      // Add UI elements state
      lines.push('--- מצב אלמנטים בממשק ---');
      const uiElements = {
        'scheduler-status-content': 'מצב מתזמן',
        'scheduler-monitoring-content': 'ניטור מתזמן',
        'missing-data-content': 'טיקרים עם נתונים חסרים',
        'ticker-load-stats': 'סטטיסטיקות טעינת טיקר',
        'providers-grid': 'רשת ספקים',
        'cache-stats': 'סטטיסטיקות מטמון',
        'log-content': 'תוכן לוגים',
        'group-refresh-content': 'תוכן רענונים קבוצתיים'
      };
      
      Object.entries(uiElements).forEach(([elementId, description]) => {
        const element = getElement(elementId);
        if (element) {
          const isVisible = element.offsetParent !== null;
          const hasContent = element.textContent.trim().length > 0 || element.innerHTML.trim().length > 0;
          lines.push(`${description} (${elementId}): ${isVisible ? 'נראה' : 'מוסתר'}, ${hasContent ? 'יש תוכן' : 'ריק'}`);
        } else {
          lines.push(`${description} (${elementId}): אלמנט לא נמצא`);
        }
      });
      lines.push('');

      lines.push('=== סוף הלוג ===');
      return lines.join('\n');
    }

    /**
     * Handle error with logging and notification
     * @param {string} title - Error title
     * @param {Error|string} error - Error object or message
     * @param {string} context - Error context
     * @returns {void}
     */
    handleError(title, error, context) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`${MODULE_NAME}:${context}: ${message}`, { error });
      notification.error(title, message);
    }
  }

window.ExternalDataDashboard = ExternalDataDashboard;

  if (!window.externalDataDashboard) {
    window.externalDataDashboard = new ExternalDataDashboard();
    // Auto-initialize when DOM is ready (fallback if core-systems.js doesn't initialize it)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        if (!window.externalDataDashboard.isInitialized) {
          try {
            await window.externalDataDashboard.init();
          } catch (error) {
            logger.error(`${MODULE_NAME}:auto-init-failed`, { error });
          }
        }
      });
    } else {
      // DOM already loaded, initialize immediately if not already initialized
      if (!window.externalDataDashboard.isInitialized) {
        window.externalDataDashboard.init().catch((error) => {
          logger.error(`${MODULE_NAME}:auto-init-failed`, { error });
        });
      }
    }
  }

  /**
   * NOTE: toggleSection and toggleAllSections are provided by the general system
   * in ui-basic.js / ui-utils.js. Do not override them here.
   * The general system handles:
   * - Proper section-body toggling (not entire section)
   * - State persistence via UnifiedCacheManager
   * - Accordion mode support
   * - Icon management
   * 
   * If you need custom section toggle behavior, extend the general system instead.
   */

  /**
   * Copy detailed log to clipboard (local wrapper)
   * @returns {Promise<string>} Detailed log text
   */
  window.copyDetailedLogLocal = async function () {
    if (window.externalDataDashboard) {
      return window.externalDataDashboard.copyDetailedLog();
    }
    return '';
  };

  /**
   * External Data Dashboard Actions
   * Global action handlers for dashboard buttons
   * @type {Object}
   */
  window.ExternalDataDashboardActions = {
    /**
     * Refresh system status
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshStatus(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadSystemStatus(true);
    },
    /**
     * Refresh providers data
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshProviders(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadProviders(true);
    },
    /**
     * Refresh cache statistics
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshCacheStats(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadCacheStats(true);
    },
    /**
     * Refresh all external data
     * @param {Event} [event] - Event object
     * @returns {Promise<Object>}
     */
    refreshAllExternalData(event) {
      if (event) event.preventDefault();
      return ensureExternalDashboardInstance()
        .then((dashboard) => dashboard.refreshAllExternalData())
        .catch((error) => {
          logger.error(`${MODULE_NAME}:actions:refresh-all`, { error });
          notification.error('שגיאה ברענון כל הטיקרים', error.message || 'רענון הטיקרים נכשל');
        });
    },
    /**
     * Full external data refresh - loads current quotes, historical data (150 days), and pre-calculates technical indicators
     * @param {Event} [event] - Event object
     * @returns {Promise<Object>}
     */
    refreshFullExternalData(event) {
      if (event) event.preventDefault();
      return ensureExternalDashboardInstance()
        .then((dashboard) => dashboard.refreshFullExternalData())
        .catch((error) => {
          logger.error(`${MODULE_NAME}:actions:refresh-full`, { error });
          notification.error('שגיאה בטעינת נתונים מלאה', error.message || 'טעינת הנתונים המלאה נכשלה');
        });
    },
    /**
     * Refresh ticker-specific data
     * @param {Event} [event] - Event object
     * @returns {Promise<Object>}
     */
    refreshTickerData(event) {
      if (event) event.preventDefault();
      return ensureExternalDashboardInstance()
        .then((dashboard) => dashboard.refreshTickerData())
        .catch((error) => {
          logger.error(`${MODULE_NAME}:actions:refresh-ticker`, { error });
          notification.error('שגיאה ברענון טיקר', error.message || 'רענון הטיקר נכשל');
        });
    },
    /**
     * Refresh ticker by ID
     * @param {number} tickerId - Ticker ID
     * @returns {Promise<Object>}
     */
    refreshTickerById(tickerId) {
      return ensureExternalDashboardInstance()
        .then((dashboard) => {
          // Set the ticker in the select dropdown
          const select = getElement('ticker-select');
          if (select) {
            select.value = tickerId;
            select.dispatchEvent(new Event('change'));
          }
          return dashboard.refreshTickerData();
        })
        .catch((error) => {
          logger.error(`${MODULE_NAME}:actions:refresh-ticker-by-id`, { error, tickerId });
          notification.error('שגיאה ברענון טיקר', error.message || 'רענון הטיקר נכשל');
        });
    },
    /**
     * Refresh missing data list
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshMissingData(event) {
      if (event) event.preventDefault();
      return ensureExternalDashboardInstance()
        .then((dashboard) => dashboard.loadMissingDataTickers(true))
        .catch((error) => {
          logger.error(`${MODULE_NAME}:actions:refresh-missing-data`, { error });
          notification.error('שגיאה ברענון רשימת טיקרים', error.message || 'רענון הרשימה נכשל');
        });
    },
    /**
     * Clear external cache
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    clearExternalCache(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.clearCache();
    },
    /**
     * Reset external system
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    resetExternalSystem(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.resetExternalSystem();
    },
    /**
     * Optimize external cache
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    optimizeExternalCache(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.optimizeCache();
    },
    /**
     * Save cache settings
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    saveCacheSettings(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.saveSettings();
    },
    /**
     * Reset cache settings
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    resetCacheSettings(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.resetSettings();
    },
    /**
     * Run unit tests
     * @param {Event} [event] - Event object
     * @returns {Promise<Object>}
     */
    runUnitTests(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.runUnitTests();
    },
    /**
     * Generate test report
     * @param {Event} [event] - Event object
     * @returns {Promise<Object>}
     */
    generateTestReport(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.generateTestReport();
    },
    /**
     * Test all providers
     * @param {Event} [event] - Event object
     * @returns {Promise<Array>}
     */
    testAllProviders(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.testAllProviders();
    },
    /**
     * Analyze dashboard data
     * @param {Event} [event] - Event object
     * @returns {Promise<Object|null>}
     */
    analyzeData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.analyzeData();
    },
    /**
     * Export data
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    exportData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.exportData();
    },
    /**
     * Backup data
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    backupData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.backupData();
    },
    /**
     * Copy detailed log to clipboard
     * @param {Event} [event] - Event object
     * @returns {Promise<string>}
     */
    copyDetailedLog(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.copyDetailedLog();
    },
    /**
     * Start performance monitoring
     * @param {Event} [event] - Event object
     * @returns {Array}
     */
    startMonitoring(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.startPerformanceMonitoring();
    },
    /**
     * Stop performance monitoring
     * @param {Event} [event] - Event object
     * @returns {Array}
     */
    stopMonitoring(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.stopPerformanceMonitoring();
    },
    /**
     * Analyze system bottlenecks
     * @param {Event} [event] - Event object
     * @returns {Promise<Array|null>}
     */
    analyzeBottlenecks(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.analyzeBottlenecks();
    },
    /**
     * Export performance data
     * @param {Event} [event] - Event object
     * @returns {Promise<Object|null>}
     */
    exportPerformanceData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.exportPerformanceData();
    },
    /**
     * Refresh logs
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshLogs(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadLogs(true);
    },
    /**
     * Clear logs
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    clearLogs(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.clearLogs();
    },
    /**
     * Refresh group refresh history
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshHistory(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadGroupRefreshHistory(true);
    },
    /**
     * Refresh performance charts
     * @param {Event} [event] - Event object
     * @returns {Promise<void>}
     */
    refreshPerformanceCharts(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.refreshPerformanceCharts();
    }
  };
})();

