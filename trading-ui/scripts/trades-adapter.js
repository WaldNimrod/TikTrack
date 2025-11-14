/**
 * Trades Adapter - TikTrack Trades Data Adapter
 * מתאם נתוני טריידים - מתאם נתוני טריידים TikTrack
 *
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

const CORE_TRADES_ADAPTER_MODULE = 'core/trades-adapter';

const logCoreTradesAdapterEvent = (level, message, details = {}) => {
  if (typeof window !== 'undefined' && window.Logger && typeof window.Logger[level] === 'function') {
    window.Logger[level](message, { module: CORE_TRADES_ADAPTER_MODULE, ...details });
  }
};

const notifyCoreTradesAdapterError = (message, error) => {
  if (typeof window !== 'undefined' && typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(message);
  }
  logCoreTradesAdapterEvent('error', message, { error });
};

logCoreTradesAdapterEvent('info', '📊 Trades Adapter loaded');

/**
 * Trades Data Adapter
 * מתאם נתוני טריידים
 */
class TradesAdapter {
  constructor() {
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.apiEndpoint = '/api/trades';
    this.cachePrefix = 'trades_';
    this.defaultPalette = [
      '#26baac',
      '#28a745',
      '#ffc107',
      '#dc3545',
      '#17a2b8',
      '#6c757d',
    ];
  }

  getColorPalette() {
    if (typeof window.getChartColorPalette === 'function') {
      return window.getChartColorPalette();
    }
    return this.defaultPalette;
  }

  getOpacityColor(token, fallback) {
    if (!this.opacityCache) {
      this.opacityCache = {};
    }
    if (typeof window.getChartColorWithOpacity === 'function') {
      return window.getChartColorWithOpacity(token, 0.2);
    }
    this.opacityCache[token] = fallback;
    return fallback;
  }

  normalizeTradesArray(trades) {
    const normalized = Array.isArray(trades) ? trades : [];
    this.lastNormalizedTradesCount = normalized.length;
    return normalized;
  }

  /**
     * Initialize adapter
     * אתחל מתאם
     */
  init() {
    try {
      this.isInitialized = true;
      logCoreTradesAdapterEvent('info', '✅ Trades Adapter initialized');
    } catch (error) {
      notifyCoreTradesAdapterError('❌ Trades Adapter initialization failed', error);
    }
  }

  /**
     * Get trades data
     * קבל נתוני טריידים
     * @param {Object} config - Configuration options
     * @returns {Promise<Object>} Trades data
     */
  async getData(config = {}) {
    try {
      const cacheKey = this.getCacheKey(config);

      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Fetch data from API
      const data = await this.fetchTradesData(config);

      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      notifyCoreTradesAdapterError('❌ Failed to get trades data', error);
      throw error;
    }
  }

  /**
     * Fetch trades data from API
     * קבל נתוני טריידים מ-API
     * @param {Object} config - Configuration options
     * @returns {Promise<Object>} API response
     */
  async fetchTradesData(_config = {}) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logCoreTradesAdapterEvent('warn', '⚠️ API fetch failed', { error });
      throw error;
    }
  }

  /**
     * Format data for charts
     * עבד נתונים לגרפים
     * @param {Object} rawData - Raw data from API
     * @returns {Object} Formatted chart data
     */
  formatData(rawData) {
    try {
      if (!rawData || typeof rawData !== 'object') {
        throw new Error('No trade data received');
      }

      const trades = Array.isArray(rawData.trades) ? rawData.trades : [];
      const summary = rawData.summary || {};
      const performance = rawData.performance || {};

      // Format trades status chart data
      const statusData = this.formatStatusData(trades);

      // Format performance chart data
      const performanceData = this.formatPerformanceData(performance);

      // Format account chart data
      const accountData = this.formatAccountData(summary);

      // Format mixed chart data
      const mixedData = this.formatMixedData(trades, performance);

      return {
        status: statusData,
        performance: performanceData,
        account: accountData,
        mixed: mixedData,
      };
    } catch (error) {
      notifyCoreTradesAdapterError('❌ Failed to format trades data', error);
      throw error;
    }
  }

  /**
     * Format status data for charts
     * עבד נתוני סטטוס לגרפים
     * @param {Array} trades - Trades array
     * @returns {Object} Status chart data
     */
  formatStatusData(trades) {
    const normalizedTrades = this.normalizeTradesArray(trades);
    const statusCounts = normalizedTrades.reduce((acc, trade) => {
      acc[trade.status] = (acc[trade.status] || 0) + 1;
      return acc;
    }, {});

    const colorPalette = this.getColorPalette();

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Trades by Status',
        data: Object.values(statusCounts),
        backgroundColor: [
          colorPalette[1] || '#28a745',
          colorPalette[3] || '#dc3545',
          colorPalette[2] || '#ffc107',
        ],
        borderColor: [
          '#1e7e34',
          '#c82333',
          '#e0a800',
        ],
        borderWidth: 2,
      }],
    };
  }

  /**
     * Format performance data for charts
     * עבד נתוני ביצועים לגרפים
     * @param {Object} performance - Performance data
     * @returns {Object} Performance chart data
     */
  formatPerformanceData(performance) {
    const daily = performance.daily || [];
    const weekly = performance.weekly || [];
    const monthly = performance.monthly || [];
    const colorPalette = this.getColorPalette();
    const primaryColor = colorPalette[0] || '#26baac';
    const successColor = colorPalette[1] || '#28a745';
    const warningColor = colorPalette[2] || '#ffc107';

    return {
      labels: Array.from({ length: Math.max(daily.length, weekly.length, monthly.length) }, (_, i) => `Day ${i + 1}`),
      datasets: [
        {
          label: 'Daily Performance',
          data: daily,
          borderColor: primaryColor,
          backgroundColor: this.getOpacityColor('primary', 'rgba(38, 186, 172, 0.1)'),
          tension: 0.4,
        },
        {
          label: 'Weekly Performance',
          data: weekly,
          borderColor: successColor,
          backgroundColor: this.getOpacityColor('success', 'rgba(40, 167, 69, 0.1)'),
          tension: 0.4,
        },
        {
          label: 'Monthly Performance',
          data: monthly,
          borderColor: warningColor,
          backgroundColor: this.getOpacityColor('warning', 'rgba(255, 193, 7, 0.1)'),
          tension: 0.4,
        },
      ],
    };
  }

  /**
     * Format account data for charts
     * עבד נתוני חשבון מסחר לגרפים
     * @param {Object} summary - Summary data
     * @returns {Object} Account chart data
     */
  formatAccountData(summary) {
    const colorPalette = this.getColorPalette();
    return {
      labels: ['Total Trades', 'Open Trades', 'Closed Trades'],
      datasets: [{
        label: 'Account Overview',
        data: [
          summary.totalTrades || 0,
          summary.openTrades || 0,
          summary.closedTrades || 0,
        ],
        backgroundColor: [
          colorPalette[0] || '#26baac',
          colorPalette[1] || '#28a745',
          colorPalette[3] || '#dc3545',
        ],
        borderColor: ['#1a8f83', '#1e7e34', '#c82333'],
        borderWidth: 2,
      }],
    };
  }

  /**
     * Format mixed data for charts
     * עבד נתונים מעורבים לגרפים
     * @param {Array} trades - Trades array
     * @param {Object} performance - Performance data
     * @returns {Object} Mixed chart data
     */
  formatMixedData(trades, performance) {
    const daily = performance.daily || [];
    const normalizedTrades = this.normalizeTradesArray(trades);
    const profits = normalizedTrades.map(trade => trade.profit || 0);
    const colorPalette = this.getColorPalette();

    return {
      labels: Array.from({ length: Math.max(daily.length, profits.length) }, (_, i) => `Period ${i + 1}`),
      datasets: [
        {
          label: 'Daily Performance',
          data: daily,
          type: 'line',
          borderColor: colorPalette[0] || '#26baac',
          backgroundColor: this.getOpacityColor('primary', 'rgba(38, 186, 172, 0.1)'),
          tension: 0.4,
        },
        {
          label: 'Trade Profits',
          data: profits,
          type: 'bar',
          backgroundColor: colorPalette[1] || '#28a745',
          borderColor: '#1e7e34',
          borderWidth: 1,
        },
      ],
    };
  }

  /**
     * Get cache key for configuration
     * קבל מפתח מטמון לתצורה
     * @param {Object} config - Configuration
     * @returns {string} Cache key
     */
  getCacheKey(config) {
    return `${this.cachePrefix}${JSON.stringify(config)}`;
  }

  /**
     * Clear cache
     * נקה מטמון
     */
  clearCache() {
    this.cache.clear();
    logCoreTradesAdapterEvent('info', '🗑️ Trades Adapter cache cleared');
  }

  /**
     * Get adapter status
     * קבל סטטוס מתאם
     * @returns {Object} Status
     */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
    };
  }
}

// Create global instance
window.TradesAdapter = TradesAdapter;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const adapter = new window.TradesAdapter();
    adapter.init();
  });
} else {
  const adapter = new window.TradesAdapter();
  adapter.init();
}

logCoreTradesAdapterEvent('info', '✅ Trades Adapter ready');
