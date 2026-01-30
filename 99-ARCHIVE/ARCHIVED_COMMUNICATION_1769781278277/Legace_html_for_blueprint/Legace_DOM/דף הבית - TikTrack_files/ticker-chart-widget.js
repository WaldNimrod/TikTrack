/**
 * Ticker Chart Widget - TikTrack Dashboard
 * =========================================
 * 
 * Widget for displaying tickers with mini charts on the home page.
 * Features TradingView Mini Charts with complementary data.
 * 
 * This widget relies on general systems:
 * - TradingViewWidgetsFactory for mini charts
 * - FieldRendererService for formatting
 * - ButtonSystem for buttons
 * - NotificationSystem for errors
 * - EntityDetailsAPI for detailed ticker data
 * 
 * API:
 * - init(containerId, config) - Initialize widget
 * - render(data) - Render/update widget with tickers
 * - refresh() - Refresh data from API
 * - destroy() - Cleanup widget and remove event listeners
 * 
 * Configuration:
 * - maxItems: number - Maximum items to display (default: 3)
 * - defaultTickers: Array<number> - Default ticker IDs to display
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/TICKER_CHART_WIDGET_DEVELOPER_GUIDE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - createMiniChart() - Createminichart

// === Event Handlers ===
// - getChangeColorClass() - Getchangecolorclass

// === UI Functions ===
// - showLoading() - Showloading
// - showError() - Showerror
// - showEmpty() - Showempty
// - renderChartCard() - Renderchartcard
// - renderTickers() - Rendertickers

// === Data Functions ===
// - loadTickers() - Loadtickers

// === Utility Functions ===
// - formatAmount() - Formatamount
// - formatPercent() - Formatpercent

// === Other ===
// - cacheElements() - Cacheelements

;(function () {
  'use strict';

  const CONTAINER_ID = 'tickerChartWidgetContainer';
  const DEFAULT_MAX_ITEMS = 3;

  // Default configuration
  const DEFAULT_CONFIG = {
    maxItems: DEFAULT_MAX_ITEMS,
    defaultTickers: [] // Array of ticker IDs
  };

  // State
  const state = {
    initialized: false,
    tickers: [],
    charts: {}, // Map of ticker_id -> chart instance
    config: { ...DEFAULT_CONFIG },
    loading: false,
    error: null
  };

  async function fetchWithRetry(url, options = {}, maxRetries = 3, pageTag = 'ticker-chart-widget') {
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.status === 429) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // up to 10s
          window.Logger?.warn?.('⚠️ Rate limited, retrying', { page: pageTag, attempt: attempt + 1, waitTime });
          if (attempt < maxRetries - 1) {
            await new Promise(r => setTimeout(r, waitTime));
            continue;
          }
        }
        return response;
      } catch (err) {
        lastError = err;
      }
    }
    if (lastError) throw lastError;
    throw new Error('Rate limit exceeded after retries');
  }

  // DOM Elements cache
  const elements = {
    container: null,
    chartsContainer: null,
    loading: null,
    empty: null,
    error: null
  };

  /**
   * Format amount using FieldRendererService
   */
  function formatAmount(value, currencySymbol = '$') {
    const numeric = Number(value) || 0;
    
    if (window.FieldRendererService?.renderAmount) {
      return window.FieldRendererService.renderAmount(numeric, currencySymbol, 2, true);
    }
    
    return `${currencySymbol}${numeric.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Format percentage using FieldRendererService
   */
  function formatPercent(value) {
    const numeric = Number(value) || 0;
    
    if (window.FieldRendererService?.renderNumericValue) {
      return window.FieldRendererService.renderNumericValue(numeric, 'percent', 2);
    }
    
    const sign = numeric >= 0 ? '+' : '';
    return `${sign}${numeric.toFixed(2)}%`;
  }

  /**
   * Get change color class
   */
  function getChangeColorClass(changePercent) {
    if (!changePercent && changePercent !== 0) return '';
    const num = Number(changePercent);
    if (num > 0) return 'text-success';
    if (num < 0) return 'text-danger';
    return 'text-muted';
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements.container = document.getElementById(CONTAINER_ID);
    if (!elements.container) {
      return false;
    }

    elements.chartsContainer = elements.container.querySelector('#tickerChartWidgetCharts');
    elements.loading = elements.container.querySelector('#tickerChartWidgetLoading');
    elements.empty = elements.container.querySelector('#tickerChartWidgetEmpty');
    elements.error = elements.container.querySelector('#tickerChartWidgetError');

    return true;
  }

  /**
   * Show loading state
   */
  function showLoading() {
    if (elements.loading) {
      elements.loading.classList.remove('d-none');
      elements.loading.style.display = '';
      // Also show all SPAN elements inside the loading container
      const spans = elements.loading.querySelectorAll('span');
      spans.forEach(span => {
        span.classList.remove('d-none');
        span.style.display = '';
      });
    }
    if (elements.chartsContainer) elements.chartsContainer.innerHTML = '';
    if (elements.empty) elements.empty.classList.add('d-none');
    if (elements.error) {
      elements.error.classList.add('d-none');
      elements.error.textContent = '';
    }
    state.loading = true;
  }

  /**
   * Show error state
   */
  function showError(message) {
    if (elements.loading) {
      elements.loading.classList.add('d-none');
      elements.loading.style.display = 'none';
      // Also hide all SPAN elements inside the loading container
      const spans = elements.loading.querySelectorAll('span');
      spans.forEach(span => {
        span.classList.add('d-none');
        span.style.display = 'none';
      });
    }
    if (elements.chartsContainer) elements.chartsContainer.innerHTML = '';
    if (elements.empty) elements.empty.classList.add('d-none');
    if (elements.error) {
      elements.error.classList.remove('d-none');
      elements.error.textContent = message || 'שגיאה בטעינת נתונים';
    }
    state.loading = false;
    state.error = message;
  }

  /**
   * Show empty state
   */
  function showEmpty() {
    if (elements.loading) {
      elements.loading.classList.add('d-none');
      elements.loading.style.display = 'none';
      // Also hide all SPAN elements inside the loading container
      const spans = elements.loading.querySelectorAll('span');
      spans.forEach(span => {
        span.classList.add('d-none');
        span.style.display = 'none';
      });
    }
    if (elements.chartsContainer) elements.chartsContainer.innerHTML = '';
    if (elements.empty) elements.empty.classList.remove('d-none');
    if (elements.error) {
      elements.error.classList.add('d-none');
      elements.error.textContent = '';
    }
    state.loading = false;
    state.error = null;
  }

  /**
   * Create TradingView Mini Chart
   */
  function createMiniChart(ticker, containerId) {
    if (!window.TradingViewWidgetsFactory) {
      window.Logger?.warn?.('TradingViewWidgetsFactory not available', { tickerId: ticker.id, page: 'ticker-chart-widget' });
      return null;
    }

    try {
      // Get symbol for TradingView (format: EXCHANGE:SYMBOL or just SYMBOL)
      const symbol = ticker.symbol || 'AAPL';
      const exchange = ticker.exchange || 'NASDAQ'; // Default exchange
      const tvSymbol = ticker.exchange ? `${exchange}:${symbol}` : symbol;

      // Get theme
      let theme = 'light';
      if (window.TradingViewWidgetsColors) {
        theme = window.TradingViewWidgetsColors.getTheme() || 'light';
      }

      // Create mini chart
      const chartConfig = {
        symbol: tvSymbol,
        width: '100%',
        height: 200,
        dateRange: '1M',
        colorTheme: theme,
        isTransparent: false,
        locale: 'he',
        largeChartUrl: '',
        container_id: containerId
      };

      const chartInstance = window.TradingViewWidgetsFactory.createWidget('mini-chart', chartConfig);
      
      if (window.Logger) {
      }

      return chartInstance;
    } catch (error) {
      window.Logger?.error?.('Error creating mini chart', { tickerId: ticker.id, error: error.message, page: 'ticker-chart-widget' });
      return null;
    }
  }

  /**
   * Render chart card for a ticker (async to support ATR rendering with traffic light)
   */
  async function renderChartCard(ticker) {
    const displayName = ticker.name_custom || ticker.name || ticker.symbol;
    const displaySymbol = ticker.symbol || 'N/A';
    const price = ticker.current_price || ticker.price || null;
    const changePercent = ticker.change_percent || ticker.daily_change_percent || ticker.change_pct_day || null;
    // Try multiple field names for change amount
    const changeAmount = ticker.change_amount || ticker.daily_change || ticker.change_amount_day || null;
    const atr = ticker.atr || ticker.atr_percent || null;

    // Use FieldRendererService for price and change
    const currencySymbol = ticker.currency_symbol || '$';
    const priceHtml = price !== null && price !== undefined && window.FieldRendererService?.renderAmount
      ? window.FieldRendererService.renderAmount(price, currencySymbol, 2, false)
      : '<span class="numeric-value-zero">לא זמין</span>';
    
    // Render change percentage and amount together - both must be shown
    let changeHtml = '';
    if (changePercent !== null && changePercent !== undefined) {
      const changePercentHtml = window.FieldRendererService?.renderNumericValue
        ? window.FieldRendererService.renderNumericValue(changePercent, '%', true)
        : `<span class="numeric-value-zero">${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%</span>`;
      
      // Calculate change amount from percentage if not provided directly
      let finalChangeAmount = changeAmount;
      if ((finalChangeAmount === null || finalChangeAmount === undefined) && price !== null && changePercent !== null) {
        // Calculate: changeAmount = price * (changePercent / 100)
        finalChangeAmount = price * (changePercent / 100);
      }
      
      // Always show amount if available (either provided or calculated)
      if (finalChangeAmount !== null && finalChangeAmount !== undefined && !isNaN(finalChangeAmount)) {
        const changeAmountHtml = window.FieldRendererService?.renderAmount
          ? window.FieldRendererService.renderAmount(finalChangeAmount, currencySymbol, 2, true)
          : `<span class="numeric-value-${finalChangeAmount >= 0 ? 'positive' : 'negative'}" dir="ltr">${finalChangeAmount >= 0 ? '+' : ''}${currencySymbol}${Math.abs(finalChangeAmount).toFixed(2)}</span>`;
        
        changeHtml = `${changePercentHtml} ${changeAmountHtml}`;
      } else {
        changeHtml = changePercentHtml;
      }
    } else {
      changeHtml = '<span class="numeric-value-zero">לא זמין</span>';
    }

    // Get ATR display - use FieldRendererService.renderATR with traffic light
    let atrDisplay = 'לא זמין';
    if (atr !== null && atr !== undefined && price !== null && price > 0) {
      const atrValue = typeof atr === 'number' ? atr : parseFloat(atr);
      if (!isNaN(atrValue) && atrValue !== 0) {
        // Calculate ATR percentage
        const atrPercent = (atrValue / price) * 100;
        
        // Use FieldRendererService.renderATR with timeout
        if (window.FieldRendererService && typeof window.FieldRendererService.renderATR === 'function') {
          try {
            atrDisplay = await Promise.race([
              window.FieldRendererService.renderATR(atrValue, atrPercent),
              new Promise((_, reject) => setTimeout(() => reject(new Error('ATR render timeout')), 2000))
            ]);
            // Ensure it's a string, not a Promise
            if (atrDisplay && typeof atrDisplay.then === 'function') {
              atrDisplay = await Promise.race([
                atrDisplay,
                new Promise((_, reject) => setTimeout(() => reject(new Error('ATR render timeout')), 1000))
              ]);
            }
            if (!atrDisplay || atrDisplay === '' || typeof atrDisplay !== 'string') {
              atrDisplay = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
            }
          } catch (atrError) {
            window.Logger?.warn?.('⚠️ TickerChartWidget: Error rendering ATR', { tickerId: ticker.id, error: atrError.message, page: 'ticker-chart-widget' });
            // Fallback to simple display
            atrDisplay = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
          }
        } else {
          // Fallback if renderATR not available
          atrDisplay = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
        }
      }
    }

    // Generate unique container ID for chart
    const chartContainerId = `ticker-chart-${ticker.id}-${Date.now()}`;

    return `
      <div class="col-md-4 col-lg-4">
        <div class="ticker-chart-widget-item" data-ticker-id="${ticker.id}">
          <div class="ticker-chart-widget-item-header">
            <div class="ticker-chart-widget-item-symbol">
              <strong>${displaySymbol}</strong>
              <span class="ticker-chart-widget-item-name">${displayName}</span>
            </div>
            <div class="ticker-chart-widget-item-price">
              <div class="ticker-chart-widget-item-price-value">${priceHtml}</div>
              <div class="ticker-chart-widget-item-price-change">${changeHtml}</div>
            </div>
            <div class="ticker-chart-widget-item-actions">
              <button data-button-type="DASHBOARD"
                      data-variant="small"
                      data-onclick="window.location.href='/ticker_dashboard.html?tickerId=${ticker.id}'"
                      title="דשבורד מלא"
                      class="btn btn-sm btn-outline-primary">
                ${window.BUTTON_ICONS?.DASHBOARD ? `<img src="${window.BUTTON_ICONS.DASHBOARD}" width="16" height="16" alt="דשבורד" class="icon me-1">` : ''}
                דשבורד מלא
              </button>
            </div>
          </div>
          <div class="ticker-chart-widget-item-chart" id="${chartContainerId}">
            <!-- TradingView Mini Chart will be rendered here -->
          </div>
          <div class="ticker-chart-widget-item-metrics">
            <span class="ticker-chart-widget-item-metric">
              <span class="metric-label">ATR:</span>
              <span class="metric-value">${atrDisplay}</span>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render tickers with charts
   */
  async function renderTickers(tickers) {
    if (!elements.chartsContainer) return;

    if (!tickers || tickers.length === 0) {
      showEmpty();
      return;
    }

    // Limit to maxItems
    const limitedTickers = tickers.slice(0, state.config.maxItems);

    // Hide loading/empty/error
    if (elements.loading) {
      elements.loading.classList.add('d-none');
      elements.loading.style.display = 'none';
      // Also hide all SPAN elements inside the loading container
      const spans = elements.loading.querySelectorAll('span');
      spans.forEach(span => {
        span.classList.add('d-none');
        span.style.display = 'none';
      });
    }
    if (elements.empty) elements.empty.classList.add('d-none');
    if (elements.error) elements.error.classList.add('d-none');

    // Render chart cards (async - wait for all ATR renders)
    const cardsHTML = await Promise.all(
      limitedTickers.map(ticker => renderChartCard(ticker))
    );
    elements.chartsContainer.innerHTML = cardsHTML.join('');

    // Process buttons
    if (window.ButtonSystem?.processButtons) {
      window.ButtonSystem.processButtons(elements.chartsContainer);
    }

    // Create charts after a short delay to ensure DOM is ready
    setTimeout(() => {
      limitedTickers.forEach(ticker => {
        const cardElement = elements.chartsContainer.querySelector(`[data-ticker-id="${ticker.id}"]`);
        if (cardElement) {
          const chartContainer = cardElement.querySelector('.ticker-chart-widget-item-chart');
          if (chartContainer) {
            // Destroy existing chart if any
            if (state.charts[ticker.id]) {
              try {
                // TradingView widgets don't have explicit destroy, but we can remove the script
                const script = chartContainer.querySelector('script');
                if (script) {
                  script.remove();
                }
              } catch (error) {
                window.Logger?.warn?.('Error destroying chart', { tickerId: ticker.id, error: error.message, page: 'ticker-chart-widget' });
              }
            }

            // Create new chart
            const chartInstance = createMiniChart(ticker, chartContainer.id);
            if (chartInstance) {
              state.charts[ticker.id] = chartInstance;
            }
          }
        }
      });
    }, 100);

    state.loading = false;
    state.error = null;
  }

  /**
   * Load tickers with initial data
   */
  async function loadTickers() {
    showLoading();
    state.tickers = [];

    try {
      const response = await fetchWithRetry('/api/tickers/with_initial_data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 3, 'ticker-chart-widget');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        // If defaultTickers specified, filter to those
        let tickersToShow = data.data;
        if (state.config.defaultTickers && state.config.defaultTickers.length > 0) {
          tickersToShow = data.data.filter(t => state.config.defaultTickers.includes(t.id));
        }
        
        // ✅ Fallback אם entityDetailsAPI לא זמין
        if (!window.entityDetailsAPI || typeof window.entityDetailsAPI.getEntityDetails !== 'function') {
          state.tickers = tickersToShow;
          await renderTickers(state.tickers);
          return;
        }
        
        // Load full ticker data with technical indicators from EntityDetailsAPI
        // ✅ השתמש ב-Promise.allSettled עם timeout
        const enrichedTickers = await Promise.allSettled(
          tickersToShow.map(async (ticker) => {
            try {
              const fullData = await Promise.race([
                window.entityDetailsAPI.getEntityDetails('ticker', ticker.id, {
                  includeMarketData: true,
                  includeLinkedItems: false, // Don't load linked items on homepage to avoid 429 errors
                  forceRefresh: false
                }),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
                )
              ]);
              // Merge full data with basic ticker data
              return { ...ticker, ...fullData };
            } catch (error) {
              window.Logger?.warn?.('⚠️ TickerChartWidget: Error loading full data for ticker', { 
                tickerId: ticker.id, 
                error: error.message, 
                page: 'ticker-chart-widget' 
              });
              // ✅ Fallback: החזר נתונים בסיסיים
              return ticker;
            }
          })
        );
        
        state.tickers = enrichedTickers
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        
        await renderTickers(state.tickers);
      } else {
        throw new Error(data.error?.message || 'Invalid response format');
      }
    } catch (error) {
      window.Logger?.error?.('❌ TickerChartWidget: Error loading tickers', { error: error.message, stack: error.stack, page: 'ticker-chart-widget' });
      // Fallback to cache if available
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        try {
          const cached = await window.UnifiedCacheManager.get('tickers-data', {});
          if (cached && Array.isArray(cached)) {
            window.Logger?.info?.('✅ TickerChartWidget: Loaded from cache after error', { count: cached.length, page: 'ticker-chart-widget' });
            state.tickers = cached;
            await renderTickers(state.tickers);
            return;
          }
        } catch (_) {}
      }
      showError(`שגיאה בטעינת טיקרים: ${error.message}`);
      if (window.NotificationSystem?.showError) {
        window.NotificationSystem.showError('שגיאה בטעינת נתונים', `לא ניתן היה לטעון טיקרים: ${error.message}`);
      }
    }
  }

  // ===== Public API =====

  const TickerChartWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional, has default)
     * @param {object} config - Configuration object (optional)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        window.Logger?.warn?.('⚠️ TickerChartWidget already initialized', { page: 'ticker-chart-widget' });
        return;
      }

      // Merge configuration
      state.config = {
        ...DEFAULT_CONFIG,
        ...config
      };

      if (!cacheElements()) {
        window.Logger?.error?.('❌ TickerChartWidget: Container not found', { containerId, page: 'ticker-chart-widget' });
        return;
      }

      state.initialized = true;

      // Load tickers
      loadTickers();
    },

    /**
     * Render/update widget
     * @param {object} data - Data to render (optional)
     */
    render(data = {}) {
      if (!state.initialized) {
        window.Logger?.warn?.('TickerChartWidget not initialized', { page: 'ticker-chart-widget' });
        return;
      }

      // Update state if data provided
      if (data.tickers) {
        state.tickers = data.tickers;
        renderTickers(state.tickers);
      }
    },

    /**
     * Refresh data from API
     */
    async refresh() {
      if (!state.initialized) {
        window.Logger?.warn?.('TickerChartWidget not initialized', { page: 'ticker-chart-widget' });
        return;
      }

      // Clear cache
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.invalidate('tickers-with_initial_data', 'memory');
      }

      // Destroy existing charts
      Object.keys(state.charts).forEach(tickerId => {
        const cardElement = elements.chartsContainer?.querySelector(`[data-ticker-id="${tickerId}"]`);
        if (cardElement) {
          const chartContainer = cardElement.querySelector('.ticker-chart-widget-item-chart');
          if (chartContainer) {
            const script = chartContainer.querySelector('script');
            if (script) {
              script.remove();
            }
          }
        }
      });
      state.charts = {};

      // Reload tickers
      await loadTickers();
    },

    /**
     * Destroy widget
     */
    destroy() {
      // Destroy all charts
      Object.keys(state.charts).forEach(tickerId => {
        const cardElement = elements.chartsContainer?.querySelector(`[data-ticker-id="${tickerId}"]`);
        if (cardElement) {
          const chartContainer = cardElement.querySelector('.ticker-chart-widget-item-chart');
          if (chartContainer) {
            const script = chartContainer.querySelector('script');
            if (script) {
              script.remove();
            }
          }
        }
      });
      state.charts = {};

      state.initialized = false;
      state.tickers = [];
    },

    version: '1.0.0'
  };

  // Export to global scope
  window.TickerChartWidget = TickerChartWidget;

  if (window.Logger) {
    window.Logger.debug('✅ TickerChartWidget loaded successfully', { page: 'ticker-chart-widget' });
  }
})();

