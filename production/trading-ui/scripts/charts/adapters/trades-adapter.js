/**
 * Trades Data Adapter - TikTrack Chart System
 * מתאם נתוני טריידים - מערכת גרפים TikTrack
 *
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

const TRADES_ADAPTER_MODULE = 'charts/trades-adapter';

const logTradesAdapterEvent = (level, message, details = {}) => {
  if (typeof window !== 'undefined' && window.Logger && typeof window.Logger[level] === 'function') {
    window.Logger[level](message, { module: TRADES_ADAPTER_MODULE, ...details });
  }
};

const notifyTradesAdapterError = (message, error) => {
  if (typeof window !== 'undefined' && typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(message);
  }
  logTradesAdapterEvent('error', message, { error });
};

logTradesAdapterEvent('info', '📊 Trades Data Adapter initialized');

class TradesAdapter {
  constructor(config = {}) {
    this.dataSource = config.dataSource || '/api/trades/';
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
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

  normalizeTradesCollection(rawData) {
    if (!rawData || typeof rawData !== 'object') {
      return [];
    }
    let normalized = [];
    if (Array.isArray(rawData.data)) {
      normalized = rawData.data;
    } else if (Array.isArray(rawData.trades)) {
      normalized = rawData.trades;
    }
    this.lastNormalizedTradesCount = normalized.length;
    return normalized;
  }

  async getData(params = {}) {
    const cacheKey = JSON.stringify(params);
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTimeout) {
        logTradesAdapterEvent('info', '📊 Using cached trades data', { cacheKey });
        return cached.data;
      }
    }

    try {
      logTradesAdapterEvent('info', '📊 Fetching trades data from API...', { params });
      const response = await fetch(`${this.dataSource}?${new URLSearchParams(params)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid trades payload received from API');
      }

      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: now,
      });

      logTradesAdapterEvent('info', '📊 Trades data fetched successfully', {
        cacheKey,
        total: Array.isArray(data?.data) ? data.data.length : 0,
      });
      return data;
    } catch (error) {
      notifyTradesAdapterError('טעינת נתוני הטריידים נכשלה. נסה לרענן את הדף.', error);
      throw error;
    }
  }

  formatDataForStatusChart(rawData) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
      return { labels: [], datasets: [] };
    }

    const statusCounts = rawData.data.reduce((acc, trade) => {
      const status = trade.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const colorPalette = this.getColorPalette();

    return {
      labels,
      datasets: [{
        label: 'מספר טריידים לפי סטטוס',
        data,
        backgroundColor: [
          colorPalette[1] || '#28a745', // success - open
          colorPalette[2] || '#ffc107', // warning - closed
          colorPalette[3] || '#dc3545', // danger - cancelled
          colorPalette[4] || '#17a2b8',  // info - other
        ],
        borderColor: [
          colorPalette[1] || '#28a745',
          colorPalette[2] || '#ffc107',
          colorPalette[3] || '#dc3545',
          colorPalette[4] || '#17a2b8',
        ],
        borderWidth: 2,
      }],
    };
  }

  formatDataForAccountChart(rawData) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
      return { labels: [], datasets: [] };
    }

    const accountCounts = rawData.data.reduce((acc, trade) => {
      const accountName = trade.account_name || `חשבון מסחר ${trade.account_id}`;
      acc[accountName] = (acc[accountName] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(accountCounts);
    const data = Object.values(accountCounts);

    const colorPalette = this.getColorPalette();

    return {
      labels,
      datasets: [{
        label: 'מספר טריידים לפי חשבון מסחר',
        data,
        backgroundColor: [
          colorPalette[0] || '#26baac', // primary
          colorPalette[1] || '#28a745', // success
          colorPalette[2] || '#ffc107', // warning
          colorPalette[4] || '#17a2b8',  // info
        ],
        borderColor: [
          colorPalette[0] || '#26baac',
          colorPalette[1] || '#28a745',
          colorPalette[2] || '#ffc107',
          colorPalette[4] || '#17a2b8',
        ],
        borderWidth: 2,
      }],
    };
  }

  formatDataForPerformanceChart(rawData) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
      return { labels: [], datasets: [] };
    }

    // Group trades by month and calculate performance
    const monthlyData = rawData.data.reduce((acc, trade) => {
      if (!trade.created_at) {
        return acc;
      }
      const date = new Date(trade.created_at);
      if (Number.isNaN(date.getTime())) {
        return acc;
      }
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, count: 0 };
      }
      acc[monthKey].total += trade.total_pl || 0;
      acc[monthKey].count += 1;
      return acc;
    }, {});

    const labels = Object.keys(monthlyData).sort();
    const performanceData = labels.map(month => monthlyData[month].total);
    const countData = labels.map(month => monthlyData[month].count);

    const colorPalette = this.getColorPalette();
    const primaryColor = colorPalette[0] || '#26baac';
    const successColor = colorPalette[1] || '#28a745';
    const primaryWithOpacity = this.getOpacityColor('primary', 'rgba(38, 186, 172, 0.2)');
    const successWithOpacity = this.getOpacityColor('success', 'rgba(40, 167, 69, 0.2)');

    return {
      labels,
      datasets: [
        {
          label: 'רווח/הפסד חודשי',
          data: performanceData,
          borderColor: primaryColor,
          backgroundColor: primaryWithOpacity,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'מספר טריידים',
          data: countData,
          borderColor: successColor,
          backgroundColor: successWithOpacity,
          tension: 0.4,
          fill: false,
          yAxisID: 'y1',
        },
      ],
    };
  }

  formatData(rawData, chartType = 'status') {
    switch (chartType) {
    case 'status':
      return this.formatDataForStatusChart(rawData);
    case 'account':
      return this.formatDataForAccountChart(rawData);
    case 'performance':
      return this.formatDataForPerformanceChart(rawData);
    default:
      return this.formatDataForStatusChart(rawData);
    }
  }

  getSummaryStats(rawData) {
    const trades = this.normalizeTradesCollection(rawData);
    if (!trades.length) {
      return {
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        cancelledTrades: 0,
        totalPL: 0,
        averagePL: 0,
      };
    }

    const totalTrades = trades.length;
    const openTrades = trades.filter(t => t.status === 'open').length;
    const closedTrades = trades.filter(t => t.status === 'closed').length;
    const cancelledTrades = trades.filter(t => t.status === 'cancelled').length;
    const totalPL = trades.reduce((sum, t) => sum + (t.total_pl || 0), 0);
    const averagePL = totalTrades > 0 ? totalPL / totalTrades : 0;

    return {
      totalTrades,
      openTrades,
      closedTrades,
      cancelledTrades,
      totalPL: Math.round(totalPL * 100) / 100,
      averagePL: Math.round(averagePL * 100) / 100,
    };
  }
}

window.TradesAdapter = TradesAdapter;
