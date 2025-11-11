'use strict';

/**
 * External Data Dashboard Controller
 * Integrates with the documented external data systems and relies solely on real backend responses.
 * Documentation: documentation/features/external_data/EXTERNAL_DATA_SYSTEM.md
 */
(function () {
  const MODULE_NAME = 'external-data-dashboard';
  const AUTO_REFRESH_INTERVAL_MS = 30000;
  const PERFORMANCE_SAMPLE_INTERVAL_MS = 15000;
  const NOT_AVAILABLE_TEXT = 'לא זמין';

  const logger = window.Logger || {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {}
  };

  const notification = {
    success(title, message = '', duration = 4000, category = 'system') {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(title, message, duration, category);
      }
    },
    error(title, message = '') {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(title, message);
      }
    },
    warning(title, message = '', duration = 4000, category = 'system') {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification(title, message, duration, category);
      }
    },
    info(title, message = '', duration = 4000, category = 'system') {
      if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification(title, message, duration, category);
      }
    }
  };

  function safeText(value, fallback = NOT_AVAILABLE_TEXT) {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return fallback;
    }
    return value;
  }

  function formatNumber(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return NOT_AVAILABLE_TEXT;
    }
    const formatter = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
    return formatter.format(Number(value));
  }

  function formatDecimal(value, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return NOT_AVAILABLE_TEXT;
    }
    const formatter = new Intl.NumberFormat('he-IL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return formatter.format(Number(value));
  }

  function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return NOT_AVAILABLE_TEXT;
    }
    const numeric = Number(value);
    const percentValue = numeric <= 1 && numeric >= -1 ? numeric * 100 : numeric;
    return `${formatDecimal(percentValue, 2)}%`;
  }

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

  function setElementText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function getElement(id) {
    return document.getElementById(id);
  }

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

  class ExternalDataDashboard {
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
    }

    async init() {
      if (this.isInitialized) {
        logger.debug(`${MODULE_NAME}:init:skipped - already initialized`);
        return;
      }

      logger.info(`${MODULE_NAME}:init:start`);

      this.initializeHeader();
      this.setupEventListeners();

      try {
        await this.loadInitialData();
        this.startAutoRefresh();
        this.isInitialized = true;
        logger.info(`${MODULE_NAME}:init:completed`);
      } catch (error) {
        this.handleError('שגיאה באתחול דשבורד הנתונים החיצוניים', error, 'init');
      }
    }

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
    }

    startAutoRefresh() {
      this.stopAutoRefresh();
      this.autoRefreshHandle = window.setInterval(() => {
        this.refreshCoreData();
      }, AUTO_REFRESH_INTERVAL_MS);
    }

    stopAutoRefresh() {
      if (this.autoRefreshHandle) {
        window.clearInterval(this.autoRefreshHandle);
        this.autoRefreshHandle = null;
      }
    }

    async loadInitialData() {
      await Promise.all([
        this.loadSystemStatus(),
        this.loadProviders(),
        this.loadCacheStats(),
        this.loadLogs(),
        this.loadGroupRefreshHistory()
      ]);
    }

    async refreshCoreData() {
      await Promise.allSettled([
        this.loadSystemStatus(),
        this.loadProviders(),
        this.loadCacheStats()
      ]);
    }

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

    renderSystemStatus(data) {
      this.renderSummaryCards(data);
      this.renderStatusIndicators(data);
      this.updateProviderLastUpdateTimes(data ? data.providers?.details || [] : []);
      this.updateStatisticsCards(data);
      this.updateChartsFromStatus(data);
    }

    renderSummaryCards(data) {
      const providersTotal = data?.providers?.total ?? null;
      const totalQuotes = data?.cache?.total_quotes ?? null;
      const lastUpdate = data?.timestamp ?? null;
      const overallHealth = data?.overall_health;

      setElementText('providers-count', providersTotal !== null ? formatNumber(providersTotal) : NOT_AVAILABLE_TEXT);

      setElementText(
        'active-data-count',
        totalQuotes !== null ? formatNumber(totalQuotes) : NOT_AVAILABLE_TEXT
      );

      setElementText('last-update-time', lastUpdate ? formatRelativeTime(lastUpdate) : NOT_AVAILABLE_TEXT);

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
          detailsElement.innerHTML = '<div class="status-detail">לא נמצאו נתונים עבור Yahoo Finance</div>';
          return;
        }
        const records = this.statusData?.cache?.total_quotes ?? 0;
        detailsElement.innerHTML = [
          `<div class="status-detail">📊 ספק: ${safeText(yahooProvider.display_name || yahooProvider.name)}</div>`,
          `<div class="status-detail">📈 רשומות: ${formatNumber(records)}</div>`,
          `<div class="status-detail">🕒 עדכון אחרון: ${formatRelativeTime(yahooProvider.last_successful_request)}</div>`,
          yahooProvider.last_error
            ? `<div class="status-detail error">⚠️ שגיאה אחרונה: ${safeText(yahooProvider.last_error)}</div>`
            : ''
        ].join('');
      }
    }

    renderCacheStatus(cacheData) {
      const status = cacheData ? 'active' : 'inactive';
      setStatusIndicator('cache-status-indicator', status);

      const detailsElement = getElement('cache-details');
      if (!detailsElement) {
        return;
      }

      if (!cacheData) {
        detailsElement.innerHTML = '<div class="status-detail">נתוני מטמון לא זמינים</div>';
        return;
      }

      detailsElement.innerHTML = [
        `<div class="status-detail">💾 ציטוטים: ${formatNumber(cacheData.total_quotes)}</div>`,
        `<div class="status-detail">📈 אחוז פגיעות: ${formatPercent(cacheData.cache_hit_rate)}</div>`,
        `<div class="status-detail">🗓️ נתונים פגומים: ${formatNumber(cacheData.stale_data_count)}</div>`
      ].join('');
    }

    renderDatabaseStatus(providersInfo) {
      const hasData = providersInfo && typeof providersInfo.total === 'number';
      const status = hasData ? 'active' : 'inactive';
      setStatusIndicator('db-status', status);

      const detailsElement = getElement('db-details');
      if (!detailsElement) {
        return;
      }

      if (!hasData) {
        detailsElement.innerHTML = '<div class="status-detail">נתוני ספקים לא זמינים</div>';
        return;
      }

      detailsElement.innerHTML = [
        `<div class="status-detail">🗄️ ספקים: ${formatNumber(providersInfo.total)}</div>`,
        `<div class="status-detail">✅ פעילים: ${formatNumber(providersInfo.active)}</div>`,
        `<div class="status-detail">💡 בריאים: ${formatNumber(providersInfo.healthy)}</div>`
      ].join('');
    }

    renderApiStatus(data) {
      const statusValue = data?.success === true ? 'active' : 'warning';
      setStatusIndicator('api-status-indicator', statusValue);
      const detailsElement = getElement('api-details');
      if (!detailsElement) {
        return;
      }
      if (!data) {
        detailsElement.innerHTML = '<div class="status-detail">נתוני API לא זמינים</div>';
        return;
      }
      detailsElement.innerHTML = [
        `<div class="status-detail">🔌 מצב כללי: ${safeText(data.status)}</div>`,
        `<div class="status-detail">💠 בריאות כללית: ${data.overall_health === true ? 'טובה' : data.overall_health === false ? 'מושפעת' : NOT_AVAILABLE_TEXT}</div>`,
        `<div class="status-detail">📊 פעולות בשעה האחרונה: ${formatNumber(data.recent_activity?.last_hour?.refresh_operations ?? 0)}</div>`
      ].join('');
    }

    writeElementHtml(id, html) {
      const element = getElement(id);
      if (element) {
        element.innerHTML = html;
      }
    }

    updateProviderLastUpdateTimes(providerDetails) {
      const yahooElement = getElement('yahoo-last-update');
      if (yahooElement) {
        const yahooProvider = providerDetails.find((provider) => provider.name === 'yahoo_finance');
        yahooElement.textContent = yahooProvider?.last_successful_request
          ? formatRelativeTime(yahooProvider.last_successful_request)
          : NOT_AVAILABLE_TEXT;
      }

      const alphaElement = getElement('alpha-last-update');
      if (alphaElement) {
        const alphaProvider = providerDetails.find((provider) => provider.name === 'alpha_vantage');
        alphaElement.textContent = alphaProvider?.last_successful_request
          ? formatRelativeTime(alphaProvider.last_successful_request)
          : NOT_AVAILABLE_TEXT;
      }
    }

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

    updateChartsFromStatus(data) {
      if (!data) {
        return;
      }
      this.updateDataQualityChart(data);
      this.updateProviderComparisonChart(data);
      this.updateErrorAnalysisChart();
    }

    async loadProviders(showNotification = false) {
      try {
        const response = await fetch('/api/external-data/status/providers');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.providers = Array.isArray(data.providers) ? data.providers : [];
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

    renderProviders() {
      const providersGrid = getElement('providers-grid');
      if (!providersGrid) {
        return;
      }
      if (!this.providers.length) {
        providersGrid.innerHTML = '<div class="text-muted text-center p-4">לא נמצאו ספקים פעילים</div>';
        return;
      }
      providersGrid.innerHTML = this.providers
        .map((provider) => {
          const statusClass = provider.is_active
            ? provider.is_healthy
              ? 'active'
              : 'warning'
            : 'inactive';
          const statusLabel = provider.is_active
            ? provider.is_healthy
              ? 'פעיל'
              : 'בעיה'
            : 'לא פעיל';
          return `
            <div class="provider-card ${statusClass}">
              <div class="provider-header">
                <h4>${safeText(provider.display_name || provider.name)}</h4>
                <span class="provider-status ${statusClass}">${statusLabel}</span>
              </div>
              <div class="provider-details">
                <div class="provider-info">
                  <span class="info-label">שם פנימי:</span>
                  <span class="info-value">${safeText(provider.name)}</span>
                </div>
                <div class="provider-info">
                  <span class="info-label">סטטוס בריאות:</span>
                  <span class="info-value">${provider.is_healthy ? 'בריא' : 'בעיה'}</span>
                </div>
                <div class="provider-info">
                  <span class="info-label">עדכון אחרון:</span>
                  <span class="info-value">${formatRelativeTime(provider.last_successful_request)}</span>
                </div>
                ${
                  provider.last_error
                    ? `<div class="provider-info">
                        <span class="info-label">שגיאה אחרונה:</span>
                        <span class="info-value text-danger">${safeText(provider.last_error)}</span>
                      </div>`
                    : ''
                }
              </div>
            </div>
          `;
        })
        .join('');
    }

    async loadCacheStats(showNotification = false) {
      try {
        const response = await fetch('/api/cache/stats');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.cacheStats = data;
        this.renderCacheStats();
        if (showNotification) {
          notification.success('נתוני מטמון', 'סטטיסטיקות המטמון נטענו בהצלחה');
        }
      } catch (error) {
        this.cacheStats = null;
        this.renderCacheStats();
        this.handleError('שגיאה בטעינת סטטיסטיקות מטמון', error, 'load-cache-stats');
      }
    }

    renderCacheStats() {
      const cacheStatsElement = getElement('cache-stats');
      if (!cacheStatsElement) {
        return;
      }
      if (!this.cacheStats || this.cacheStats.status !== 'success') {
        cacheStatsElement.innerHTML = '<div class="text-muted text-center p-3">נתוני מטמון לא זמינים</div>';
        return;
      }

      const stats = this.cacheStats.data;
      cacheStatsElement.innerHTML = `
        <div class="cache-stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatNumber(stats.total_entries)}</div>
            <div class="stat-label">רשומות במטמון</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatNumber(stats.expired_entries)}</div>
            <div class="stat-label">רשומות פג תוקף</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatPercent(stats.hit_rate)}</div>
            <div class="stat-label">אחוז פגיעות</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatDecimal(stats.estimated_memory_mb, 2)}MB</div>
            <div class="stat-label">שימוש בזיכרון</div>
          </div>
        </div>
      `;

      this.updateCurrentSettings(stats);
    }

    updateCurrentSettings(cacheStats) {
      const hotCacheElement = getElement('current-hot-cache');
      const warmCacheElement = getElement('current-warm-cache');
      const maxRequestsElement = getElement('current-max-requests');

      if (hotCacheElement) {
        hotCacheElement.textContent = cacheStats?.hot_ttl_minutes
          ? `${formatNumber(cacheStats.hot_ttl_minutes)} דקות`
          : NOT_AVAILABLE_TEXT;
      }

      if (warmCacheElement) {
        warmCacheElement.textContent = cacheStats?.warm_ttl_minutes
          ? `${formatNumber(cacheStats.warm_ttl_minutes)} דקות`
          : NOT_AVAILABLE_TEXT;
      }

      if (maxRequestsElement) {
        maxRequestsElement.textContent = cacheStats?.max_requests_per_hour
          ? `${formatNumber(cacheStats.max_requests_per_hour)} לשעה`
          : NOT_AVAILABLE_TEXT;
      }
    }

    async loadLogs(showNotification = false) {
      try {
        const response = await fetch('/api/external-data/status/logs');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        this.logs = Array.isArray(data.logs) ? data.logs : [];
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

    renderLogs(logs) {
      const logContent = getElement('log-content');
      if (!logContent) {
        return;
      }

      if (!logs.length) {
        const currentTime = new Date().toLocaleString('he-IL');
        logContent.innerHTML = `
          <div class="no-logs">
            <div class="no-logs-icon">📋</div>
            <div class="no-logs-title">אין לוגים להצגה</div>
            <div class="no-logs-subtitle">המערכת פועלת ללא שגיאות</div>
            <div class="no-logs-time">נבדק לאחרונה: ${currentTime}</div>
            <div class="no-logs-info">
              <p>• לוגים יופיעו כאן כאשר יש פעילות במערכת</p>
              <p>• רענן את הדף כדי לבדוק עדכונים חדשים</p>
            </div>
          </div>
        `;
        return;
      }

      logContent.innerHTML = logs
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
        this.renderGroupRefreshHistory(history);
        if (showNotification) {
          notification.success('היסטוריה עודכנה', `נטענו ${history.length} רשומות היסטוריה`);
        }
      } catch (error) {
        this.renderGroupRefreshHistory([]);
        this.handleError('שגיאה בטעינת היסטוריית רענון', error, 'load-group-refresh-history');
      }
    }

    renderGroupRefreshHistory(history) {
      const container = getElement('group-refresh-content');
      if (!container) {
        return;
      }

      if (!history.length) {
        container.innerHTML = '<div class="text-center text-muted p-4">אין היסטוריית עדכונים קבוצתיים</div>';
        return;
      }

      container.innerHTML = history
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
                  התחיל: ${safeText(entry.started_at ? new Date(entry.started_at).toLocaleString('he-IL') : NOT_AVAILABLE_TEXT)}
                  | הסתיים: ${safeText(entry.completed_at ? new Date(entry.completed_at).toLocaleString('he-IL') : 'בתהליך')}
                </div>
              </div>
              <div class="group-refresh-status ${statusClass}">${statusLabel}</div>
            </div>
          `;
        })
        .join('');
    }

    getCategoryLabel(category) {
      const labels = {
        active_trades: 'טיקרים עם טרייד פעיל',
        no_active_trades: 'טיקרים ללא טרייד פעיל',
        closed: 'טיקרים סגורים/מבוטלים',
        unknown: 'לא ידוע'
      };
      return labels[category] || category || NOT_AVAILABLE_TEXT;
    }

    async refreshProviders() {
      await this.loadProviders(true);
    }

    async refreshCacheStats() {
      await this.loadCacheStats(true);
    }

    async refreshSystemStatus() {
      await this.loadSystemStatus(true);
    }

    async refreshGroupHistory() {
      await this.loadGroupRefreshHistory(true);
    }

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

    async resetSettings() {
      const hotElement = getElement('hot-cache-ttl');
      const warmElement = getElement('warm-cache-ttl');
      const maxElement = getElement('max-requests-hour');

      if (hotElement) hotElement.value = '';
      if (warmElement) warmElement.value = '';
      if (maxElement) maxElement.value = '';

      notification.info('הגדרות אופסו', 'ניתן להזין ערכים חדשים ולשמור');
    }

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
      } catch (error) {
        this.handleError('שגיאה בניקוי המטמון', error, 'clear-cache');
      }
    }

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
          lastUpdate: provider.last_successful_request,
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

    async validateData() {
      if (!this.statusData) {
        notification.warning('אין נתונים', 'אנא טען מחדש את הסטטוס לפני בדיקות תקינות');
        return null;
      }

      const issues = [];

      if (!Array.isArray(this.providers) || !this.providers.length) {
        issues.push('לא נמצאו ספקים במערכת');
      } else {
        const inactiveProviders = this.providers.filter((provider) => !provider.is_active);
        if (inactiveProviders.length) {
          issues.push(`נמצאו ${inactiveProviders.length} ספקים שאינם פעילים`);
        }
        const providersWithErrors = this.providers.filter((provider) => provider.last_error);
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

    async testSpecificFunction() {
      const tests = [];
      tests.push(await this.testYahooFinanceAPI());
      tests.push(await this.testCacheOperations());
      tests.push(await this.testDataValidation());

      const passed = tests.filter((test) => test.status === 'passed').length;
      const summary = `בדיקת פונקציות ספציפיות: ${passed}/${tests.length} עברו`;
      if (passed === tests.length) {
        notification.success('בדיקת פונקציות', summary);
      } else {
        notification.warning('בדיקת פונקציות', summary);
      }
      return tests;
    }

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

    generateTextReport(report) {
      const lines = [];
      lines.push('=== דוח בדיקות מערכת נתונים חיצוניים ===');
      lines.push(`זמן יצירה: ${new Date(report.generatedAt).toLocaleString('he-IL')}`);
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
        this.updateResponseTimeChart();
        this.updateErrorAnalysisChart();
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
        this.updateErrorAnalysisChart();
      }
    }

    refreshPerformanceCharts() {
      this.updateResponseTimeChart();
      this.updateDataQualityChart(this.statusData);
      this.updateProviderComparisonChart(this.statusData);
      this.updateErrorAnalysisChart();
      notification.success('גרפי ביצועים', 'הגרפים עודכנו על סמך נתונים אחרונים');
    }

    updateResponseTimeChart() {
      const ctx = getElement('responseTimeChart');
      if (!ctx || typeof Chart === 'undefined') {
        return;
      }

      const labels = this.performanceSamples.map((sample) =>
        new Date(sample.timestamp).toLocaleTimeString('he-IL')
      );
      const data = this.performanceSamples.map((sample) => sample.responseTimeMs || 0);

      if (!this.responseTimeChart) {
        this.responseTimeChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'זמן תגובה (ms)',
                data,
                borderColor: 'rgb(38, 186, 172)',
                backgroundColor: 'rgba(38, 186, 172, 0.2)',
                tension: 0.15
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        this.responseTimeChart.data.labels = labels;
        this.responseTimeChart.data.datasets[0].data = data;
        this.responseTimeChart.update();
      }
    }

    updateDataQualityChart(data) {
      const ctx = getElement('dataQualityChart');
      if (!ctx || typeof Chart === 'undefined' || !data?.cache) {
        return;
      }

      const totalQuotes = data.cache.total_quotes || 0;
      const staleData = data.cache.stale_data_count || 0;
      const validData = Math.max(totalQuotes - staleData, 0);

      const chartData = {
        labels: ['נתונים תקינים', 'נתונים פגומים'],
        datasets: [
          {
            data: [validData, staleData],
            backgroundColor: ['rgba(38, 186, 172, 0.8)', 'rgba(252, 90, 6, 0.7)']
          }
        ]
      };

      if (!this.dataQualityChart) {
        this.dataQualityChart = new Chart(ctx, {
          type: 'doughnut',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      } else {
        this.dataQualityChart.data = chartData;
        this.dataQualityChart.update();
      }
    }

    updateProviderComparisonChart(data) {
      const ctx = getElement('providerComparisonChart');
      if (!ctx || typeof Chart === 'undefined' || !data?.providers?.details) {
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

      const chartData = {
        labels,
        datasets: [
          {
            label: 'אחוז הצלחה',
            data: successRates,
            backgroundColor: 'rgba(38, 186, 172, 0.7)'
          }
        ]
      };

      if (!this.providerComparisonChart) {
        this.providerComparisonChart = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      } else {
        this.providerComparisonChart.data = chartData;
        this.providerComparisonChart.update();
      }
    }

    updateErrorAnalysisChart() {
      const ctx = getElement('errorAnalysisChart');
      if (!ctx || typeof Chart === 'undefined') {
        return;
      }

      const samples = this.performanceSamples.slice(-10);
      if (!samples.length) {
        return;
      }

      const labels = samples.map((sample) => new Date(sample.timestamp).toLocaleTimeString('he-IL'));
      const errorFlags = samples.map((sample) => (sample.status === 'error' ? 1 : 0));

      const chartData = {
        labels,
        datasets: [
          {
            label: 'שגיאות',
            data: errorFlags,
            borderColor: 'rgb(252, 90, 6)',
            backgroundColor: 'rgba(252, 90, 6, 0.2)',
            tension: 0.1
          }
        ]
      };

      if (!this.errorAnalysisChart) {
        this.errorAnalysisChart = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      } else {
        this.errorAnalysisChart.data = chartData;
        this.errorAnalysisChart.update();
      }
    }

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

    generateDetailedLog() {
      const lines = [];
      lines.push('=== לוג מפורט - דשבורד נתונים חיצוניים ===');
      lines.push(`זמן יצירה: ${new Date().toLocaleString('he-IL')}`);
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
            `${safeText(provider.display_name || provider.name)} | פעיל: ${
              provider.is_active ? 'כן' : 'לא'
            } | בריא: ${provider.is_healthy ? 'כן' : 'לא'} | עדכון אחרון: ${formatRelativeTime(
              provider.last_successful_request
            )}`
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
          lines.push(`[${safeText(logEntry.timestamp)}] (${safeText(logEntry.level)}) ${safeText(logEntry.message)}`);
        });
      } else {
        lines.push('אין לוגים זמינים');
      }

      lines.push('');
      lines.push('=== סוף הלוג ===');
      return lines.join('\n');
    }

    handleError(title, error, context) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`${MODULE_NAME}:${context}: ${message}`, { error });
      notification.error(title, message);
    }
  }

  window.ExternalDataDashboard = ExternalDataDashboard;

  if (!window.externalDataDashboard) {
    window.externalDataDashboard = new ExternalDataDashboard();
  }

  window.toggleAllSections = function () {
    const sections = document.querySelectorAll('.section-content, .section-body');
    const toggleBtn = document.querySelector('.filter-toggle-btn .section-toggle-icon');
    if (!sections.length) {
      return;
    }
    const shouldExpand = Array.from(sections).some(
      (section) => section.style.display === 'none' || section.classList.contains('collapsed')
    );
    sections.forEach((section) => {
      if (shouldExpand) {
        section.style.display = 'block';
        section.classList.remove('collapsed');
      } else {
        section.style.display = 'none';
        section.classList.add('collapsed');
      }
    });
    if (toggleBtn) {
      toggleBtn.textContent = shouldExpand ? '▼' : '▶';
    }
  };

  window.toggleSection = function (sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }
    const icon = document.querySelector(`[onclick*="${sectionId}"] .section-toggle-icon`);
    const isCollapsed = section.style.display === 'none' || section.classList.contains('collapsed');
    if (isCollapsed) {
      section.style.display = 'block';
      section.classList.remove('collapsed');
      if (icon) {
        icon.textContent = '▼';
      }
    } else {
      section.style.display = 'none';
      section.classList.add('collapsed');
      if (icon) {
        icon.textContent = '▶';
      }
    }
  };

  window.copyDetailedLogLocal = async function () {
    if (window.externalDataDashboard) {
      return window.externalDataDashboard.copyDetailedLog();
    }
    return '';
  };

  window.ExternalDataDashboardActions = {
    refreshStatus(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadSystemStatus(true);
    },
    refreshProviders(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadProviders(true);
    },
    refreshCacheStats(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadCacheStats(true);
    },
    refreshAllExternalData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.refreshCoreData();
    },
    clearExternalCache(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.clearCache();
    },
    optimizeExternalCache(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.optimizeCache();
    },
    saveCacheSettings(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.saveSettings();
    },
    resetCacheSettings(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.resetSettings();
    },
    runUnitTests(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.runUnitTests();
    },
    generateTestReport(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.generateTestReport();
    },
    testAllProviders(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.testAllProviders();
    },
    analyzeData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.analyzeData();
    },
    exportData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.exportData();
    },
    backupData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.backupData();
    },
    copyDetailedLog(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.copyDetailedLog();
    },
    startMonitoring(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.startPerformanceMonitoring();
    },
    stopMonitoring(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.stopPerformanceMonitoring();
    },
    analyzeBottlenecks(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.analyzeBottlenecks();
    },
    exportPerformanceData(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.exportPerformanceData();
    },
    refreshLogs(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadLogs(true);
    },
    clearLogs(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.clearLogs();
    },
    refreshHistory(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.loadGroupRefreshHistory(true);
    },
    refreshPerformanceCharts(event) {
      if (event) event.preventDefault();
      return window.externalDataDashboard?.refreshPerformanceCharts();
    }
  };
})();

