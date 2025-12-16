/**
 * Ticker List Widget - TikTrack Dashboard
 * ========================================
 * 
 * Widget for displaying tickers with KPI cards on the home page.
 * Features Bootstrap Tabs for different ticker views (active, watch list, all).
 * 
 * This widget relies on general systems:
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
 * - maxItems: number - Maximum items to display per tab (default: 5)
 * - defaultTab: 'active' | 'watchlist' | 'all' - Default active tab
 * - watchListId: number | null - Watch list ID to use (null for mockup)
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/TICKER_LIST_WIDGET_DEVELOPER_GUIDE.md
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - getChangeColorClass() - Getchangecolorclass
// - bindEvents() - Bindevents

// === UI Functions ===
// - showLoading() - Showloading
// - showError() - Showerror
// - showEmpty() - Showempty
// - renderKPICard() - Renderkpicard
// - renderTickersList() - Rendertickerslist

// === Data Functions ===
// - loadActiveTickers() - Loadactivetickers
// - loadWatchListTickers() - Loadwatchlisttickers
// - loadAllTickers() - Loadalltickers

// === Utility Functions ===
// - formatAmount() - Formatamount
// - formatPercent() - Formatpercent
// - formatVolume() - Formatvolume

// === Other ===
// - cacheElements() - Cacheelements

;(function () {
  'use strict';

  const CONTAINER_ID = 'tickerListWidgetContainer';
  const DEFAULT_MAX_ITEMS = 5;

  // Default configuration
  const DEFAULT_CONFIG = {
    maxItems: DEFAULT_MAX_ITEMS,
    defaultTab: 'active', // 'active' | 'watchlist' | 'all'
    watchListId: null // null for mockup, number for real watch list
  };

  // State
  const state = {
    initialized: false,
    activeTab: 'active',
    activeTickers: [],
    watchListTickers: [],
    allTickers: [],
    config: { ...DEFAULT_CONFIG },
    loading: {
      active: false,
      watchlist: false,
      all: false
    },
    errors: {
      active: null,
      watchlist: null,
      all: null
    }
  };

  async function fetchWithRetry(url, options = {}, maxRetries = 3, pageTag = 'ticker-list-widget') {
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
    activeTab: null,
    watchlistTab: null,
    allTab: null,
    activePane: null,
    watchlistPane: null,
    allPane: null,
    activeList: null,
    watchlistList: null,
    allList: null,
    activeLoading: null,
    watchlistLoading: null,
    allLoading: null,
    activeEmpty: null,
    watchlistEmpty: null,
    allEmpty: null,
    activeError: null,
    watchlistError: null,
    allError: null
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
   * Format volume
   */
  function formatVolume(volume) {
    if (!volume) return 'N/A';
    const num = Number(volume);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toLocaleString('he-IL');
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

    // Tab buttons
    elements.activeTab = elements.container.querySelector('#tickerListWidgetActiveTab');
    elements.watchlistTab = elements.container.querySelector('#tickerListWidgetWatchlistTab');
    elements.allTab = elements.container.querySelector('#tickerListWidgetAllTab');

    // Tab panes
    elements.activePane = elements.container.querySelector('#tickerListWidgetActivePane');
    elements.watchlistPane = elements.container.querySelector('#tickerListWidgetWatchlistPane');
    elements.allPane = elements.container.querySelector('#tickerListWidgetAllPane');

    // Lists
    elements.activeList = elements.container.querySelector('#tickerListWidgetActiveList');
    elements.watchlistList = elements.container.querySelector('#tickerListWidgetWatchlistList');
    elements.allList = elements.container.querySelector('#tickerListWidgetAllList');

    // Loading/Empty/Error elements
    elements.activeLoading = elements.container.querySelector('#tickerListWidgetActiveLoading');
    elements.watchlistLoading = elements.container.querySelector('#tickerListWidgetWatchlistLoading');
    elements.allLoading = elements.container.querySelector('#tickerListWidgetAllLoading');
    elements.activeEmpty = elements.container.querySelector('#tickerListWidgetActiveEmpty');
    elements.watchlistEmpty = elements.container.querySelector('#tickerListWidgetWatchlistEmpty');
    elements.allEmpty = elements.container.querySelector('#tickerListWidgetAllEmpty');
    elements.activeError = elements.container.querySelector('#tickerListWidgetActiveError');
    elements.watchlistError = elements.container.querySelector('#tickerListWidgetWatchlistError');
    elements.allError = elements.container.querySelector('#tickerListWidgetAllError');

    return true;
  }

  /**
   * Show loading state
   */
  function showLoading(tab) {
    const loadingEl = elements[`${tab}Loading`];
    const listEl = elements[`${tab}List`];
    const emptyEl = elements[`${tab}Empty`];
    const errorEl = elements[`${tab}Error`];

    if (loadingEl) loadingEl.classList.remove('d-none');
    if (listEl) listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.add('d-none');
    if (errorEl) {
      errorEl.classList.add('d-none');
      errorEl.textContent = '';
    }
    state.loading[tab] = true;
  }

  /**
   * Show error state
   */
  function showError(tab, message) {
    const loadingEl = elements[`${tab}Loading`];
    const listEl = elements[`${tab}List`];
    const emptyEl = elements[`${tab}Empty`];
    const errorEl = elements[`${tab}Error`];

    if (loadingEl) loadingEl.classList.add('d-none');
    if (listEl) listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.add('d-none');
    if (errorEl) {
      errorEl.classList.remove('d-none');
      errorEl.textContent = message || 'שגיאה בטעינת נתונים';
    }
    state.loading[tab] = false;
    state.errors[tab] = message;
  }

  /**
   * Show empty state
   */
  function showEmpty(tab) {
    const loadingEl = elements[`${tab}Loading`];
    const listEl = elements[`${tab}List`];
    const emptyEl = elements[`${tab}Empty`];
    const errorEl = elements[`${tab}Error`];

    if (loadingEl) loadingEl.classList.add('d-none');
    if (listEl) listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('d-none');
    if (errorEl) {
      errorEl.classList.add('d-none');
      errorEl.textContent = '';
    }
    state.loading[tab] = false;
    state.errors[tab] = null;
  }

  /**
   * Render KPI Card for a ticker (async to support ATR rendering with traffic light)
   */
  async function renderKPICard(ticker) {
    const displayName = ticker.name_custom || ticker.name || ticker.symbol;
    const displaySymbol = ticker.symbol || 'N/A';
    const price = ticker.current_price || ticker.price || null;
    const changePercent = ticker.change_percent || ticker.daily_change_percent || ticker.change_pct_day || null;
    // Try multiple field names for change amount
    const changeAmount = ticker.change_amount || ticker.daily_change || ticker.change_amount_day || null;
    const volume = ticker.volume || 0;
    const atr = ticker.atr || ticker.atr_percent || null;
    const ma20 = ticker.ma_20 || null;
    const ma20Diff = ma20 && price ? ((price - ma20) / ma20) * 100 : null;

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
            window.Logger?.warn?.('⚠️ TickerListWidget: Error rendering ATR', { tickerId: ticker.id, error: atrError.message, page: 'ticker-list-widget' });
            // Fallback to simple display
            atrDisplay = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
          }
        } else {
          // Fallback if renderATR not available
          atrDisplay = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
        }
      }
    }

    // Get MA20 display - show percentage difference from MA20
    let ma20Display = 'לא זמין';
    if (ma20 !== null && ma20 !== undefined && price !== null && price !== undefined) {
      // Calculate percentage difference
      const diff = ((price - ma20) / ma20) * 100;
      ma20Display = window.FieldRendererService?.renderNumericValue
        ? window.FieldRendererService.renderNumericValue(diff, '%', true)
        : `<span class="numeric-value-${diff >= 0 ? 'positive' : 'negative'}" dir="ltr">${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%</span>`;
    } else if (ma20 !== null && ma20 !== undefined) {
      // If we have MA20 but no price, show the MA20 value itself
      ma20Display = window.FieldRendererService?.renderAmount
        ? window.FieldRendererService.renderAmount(ma20, currencySymbol, 2, false)
        : `<span dir="ltr">${currencySymbol}${ma20.toFixed(2)}</span>`;
    }

    // Get volume display
    const volumeDisplay = volume > 0 
      ? (window.FieldRendererService?.renderVolume 
          ? window.FieldRendererService.renderVolume(volume, true)
          : formatVolume(volume))
      : 'לא זמין';

    return `
      <div class="ticker-list-widget-item" data-ticker-id="${ticker.id}">
        <div class="ticker-list-widget-item-header">
          <div class="ticker-list-widget-item-symbol">
            <strong>${displaySymbol}</strong>
            <span class="ticker-list-widget-item-name">${displayName}</span>
          </div>
          <div class="ticker-list-widget-item-price">
            <div class="ticker-list-widget-item-price-value">${priceHtml}</div>
            <div class="ticker-list-widget-item-price-change">${changeHtml}</div>
          </div>
          <div class="ticker-list-widget-item-actions">
            <button data-button-type="DASHBOARD"
                    data-variant="small"
                    data-onclick="window.location.href='/ticker-dashboard.html?tickerId=${ticker.id}'"
                    title="דשבורד מלא"
                    class="btn btn-sm btn-outline-primary">
              ${window.BUTTON_ICONS?.DASHBOARD ? `<img src="${window.BUTTON_ICONS.DASHBOARD}" width="16" height="16" alt="דשבורד" class="icon me-1">` : ''}
              דשבורד מלא
            </button>
          </div>
        </div>
        <div class="ticker-list-widget-item-metrics">
          <span class="ticker-list-widget-item-metric">
            <span class="metric-label">ATR:</span>
            <span class="metric-value">${atrDisplay}</span>
          </span>
          <span class="ticker-list-widget-item-metric">
            <span class="metric-label">נפח:</span>
            <span class="metric-value">${volumeDisplay}</span>
          </span>
          <span class="ticker-list-widget-item-metric">
            <span class="metric-label">MA20:</span>
            <span class="metric-value">${ma20Display}</span>
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render tickers list (async to support ATR rendering)
   */
  async function renderTickersList(tab, tickers) {
    const listEl = elements[`${tab}List`];
    if (!listEl) return;

    if (!tickers || tickers.length === 0) {
      showEmpty(tab);
      return;
    }

    // Limit to maxItems
    const limitedTickers = tickers.slice(0, state.config.maxItems);

    // Hide loading/empty/error
    const loadingEl = elements[`${tab}Loading`];
    const emptyEl = elements[`${tab}Empty`];
    const errorEl = elements[`${tab}Error`];
    if (loadingEl) loadingEl.classList.add('d-none');
    if (emptyEl) emptyEl.classList.add('d-none');
    if (errorEl) errorEl.classList.add('d-none');

    // Render KPI Cards (async - wait for all ATR renders)
    const cardsHtml = await Promise.all(
      limitedTickers.map(ticker => renderKPICard(ticker))
    );
    listEl.innerHTML = cardsHtml.join('');

    // Process buttons
    if (window.ButtonSystem?.processButtons) {
      window.ButtonSystem.processButtons(listEl);
    }

    state.loading[tab] = false;
    state.errors[tab] = null;
  }

  /**
   * Load active tickers
   */
  async function loadActiveTickers() {
    showLoading('active');
    state.activeTickers = [];

    try {
      const response = await fetchWithRetry('/api/tickers/with-initial-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 3, 'ticker-list-widget');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        // Load full ticker data with technical indicators from EntityDetailsAPI
        // Note: includeLinkedItems: false to avoid 429 errors from too many parallel requests
        const enrichedTickers = await Promise.all(
          data.data.map(async (ticker) => {
            try {
              if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                const fullData = await window.entityDetailsAPI.getEntityDetails('ticker', ticker.id, {
                  includeMarketData: true,
                  includeLinkedItems: false, // Don't load linked items on homepage to avoid 429 errors
                  forceRefresh: false
                });
                // Merge full data with basic ticker data
                return { ...ticker, ...fullData };
              }
              return ticker;
            } catch (error) {
              window.Logger?.warn?.('⚠️ TickerListWidget: Error loading full data for ticker', { tickerId: ticker.id, error: error.message, page: 'ticker-list-widget' });
              return ticker;
            }
          })
        );
        
        state.activeTickers = enrichedTickers;
        await renderTickersList('active', state.activeTickers);
      } else {
        throw new Error(data.error?.message || 'Invalid response format');
      }
    } catch (error) {
      window.Logger?.error?.('❌ TickerListWidget: Error loading active tickers', { error: error.message, stack: error.stack, page: 'ticker-list-widget' });
      // Fallback: try cached tickers if available
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        try {
          const cached = await window.UnifiedCacheManager.get('tickers-data', {});
          if (cached && Array.isArray(cached)) {
            window.Logger?.info?.('✅ TickerListWidget: Loaded from cache after error', { count: cached.length, page: 'ticker-list-widget' });
            state.activeTickers = cached;
            await renderTickersList('active', state.activeTickers);
            return;
          }
        } catch (_) {}
      }
      showError('active', `שגיאה בטעינת טיקרים פעילים: ${error.message}`);
      if (window.NotificationSystem?.showError) {
        window.NotificationSystem.showError('שגיאה בטעינת נתונים', `לא ניתן היה לטעון טיקרים פעילים: ${error.message}`);
      }
    }
  }

  /**
   * Load watch list tickers
   */
  async function loadWatchListTickers() {
    showLoading('watchlist');
    state.watchListTickers = [];

    try {
      // Get ticker IDs from watch list (mockup for now)
      let tickerIds = [];
      if (state.config.watchListId) {
        if (window.WatchListsWidgetService) {
          await window.WatchListsWidgetService.init();
          tickerIds = await window.WatchListsWidgetService.getTickerIdsFromList(state.config.watchListId);
        } else if (window.getWatchListTickers) {
          tickerIds = await window.getWatchListTickers(state.config.watchListId);
        }
      } else {
        // Use first watch list as default (mockup)
        if (window.WatchListsWidgetService) {
          await window.WatchListsWidgetService.init();
          const watchLists = await window.WatchListsWidgetService.getWatchLists();
          if (watchLists && watchLists.length > 0) {
            tickerIds = await window.WatchListsWidgetService.getTickerIdsFromList(watchLists[0].id);
          }
        }
      }

      if (tickerIds.length === 0) {
        showEmpty('watchlist');
        return;
      }

      // Load ticker data for these IDs
      const tickersData = [];
      for (const tickerId of tickerIds.slice(0, state.config.maxItems * 2)) { // Load more to filter
        try {
          if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
            const tickerData = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
              includeMarketData: true,
              forceRefresh: false
            });
            
            // Only include tickers with initial data (latest_quote)
            if (tickerData && (tickerData.current_price || tickerData.price)) {
              tickersData.push(tickerData);
            }
          }
        } catch (error) {
          window.Logger?.warn?.('Error loading ticker details', { tickerId, error: error.message, page: 'ticker-list-widget' });
        }
      }

      state.watchListTickers = tickersData;
      await renderTickersList('watchlist', state.watchListTickers);
    } catch (error) {
      window.Logger?.error?.('Error loading watch list tickers', { error: error.message, page: 'ticker-list-widget' });
      showError('watchlist', `שגיאה בטעינת רשימת צפיה: ${error.message}`);
    }
  }

  /**
   * Load all tickers
   */
  async function loadAllTickers() {
    showLoading('all');
    state.allTickers = [];

    try {
      const response = await fetch('/api/tickers/with-initial-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        // Load full ticker data with technical indicators from EntityDetailsAPI
        window.Logger?.info?.('🔄 TickerListWidget: Loading full ticker data with technical indicators (all)', { count: data.data.length, page: 'ticker-list-widget' });
        const enrichedTickers = await Promise.all(
          data.data.map(async (ticker) => {
            try {
              if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                const fullData = await window.entityDetailsAPI.getEntityDetails('ticker', ticker.id, {
                  includeMarketData: true,
                  forceRefresh: false
                });
                // Merge full data with basic ticker data
                return { ...ticker, ...fullData };
              }
              return ticker;
            } catch (error) {
              window.Logger?.warn?.('⚠️ TickerListWidget: Error loading full data for ticker', { tickerId: ticker.id, error: error.message, page: 'ticker-list-widget' });
              return ticker;
            }
          })
        );
        
        state.allTickers = enrichedTickers;
        window.Logger?.info?.('✅ TickerListWidget: Rendering all tickers', { count: state.allTickers.length, page: 'ticker-list-widget' });
        await renderTickersList('all', state.allTickers);
      } else {
        throw new Error(data.error?.message || 'Invalid response format');
      }
    } catch (error) {
      window.Logger?.error?.('Error loading all tickers', { error: error.message, page: 'ticker-list-widget' });
      showError('all', `שגיאה בטעינת כל הטיקרים: ${error.message}`);
    }
  }

  /**
   * Bind events
   */
  function bindEvents() {
    // Tab switching (Bootstrap tabs)
    if (elements.activeTab) {
      elements.activeTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'active';
        if (state.activeTickers.length === 0) {
          loadActiveTickers();
        }
      });
    }
    if (elements.watchlistTab) {
      elements.watchlistTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'watchlist';
        if (state.watchListTickers.length === 0) {
          loadWatchListTickers();
        }
      });
    }
    if (elements.allTab) {
      elements.allTab.addEventListener('shown.bs.tab', () => {
        state.activeTab = 'all';
        if (state.allTickers.length === 0) {
          loadAllTickers();
        }
      });
    }
  }

  // ===== Public API =====

  const TickerListWidget = {
    /**
     * Initialize widget
     * @param {string} containerId - Container ID (optional, has default)
     * @param {object} config - Configuration object (optional)
     */
    init(containerId = CONTAINER_ID, config = {}) {
      if (state.initialized) {
        window.Logger?.warn?.('⚠️ TickerListWidget already initialized', { page: 'ticker-list-widget' });
        return;
      }

      // Merge configuration
      state.config = {
        ...DEFAULT_CONFIG,
        ...config
      };

      if (!cacheElements()) {
        window.Logger?.error?.('❌ TickerListWidget: Container not found', { containerId, page: 'ticker-list-widget' });
        return;
      }

      bindEvents();
      state.initialized = true;

      // Load initial tab data
      if (state.config.defaultTab === 'active') {
        loadActiveTickers();
      } else if (state.config.defaultTab === 'watchlist') {
        loadWatchListTickers();
      } else {
        loadAllTickers();
      }
    },

    /**
     * Render/update widget
     * @param {object} data - Data to render (optional)
     */
    async render(data = {}) {
      if (!state.initialized) {
        window.Logger?.warn?.('TickerListWidget not initialized', { page: 'ticker-list-widget' });
        return;
      }

      // Update state if data provided
      if (data.activeTickers) {
        state.activeTickers = data.activeTickers;
        await renderTickersList('active', state.activeTickers);
      }
      if (data.watchListTickers) {
        state.watchListTickers = data.watchListTickers;
        await renderTickersList('watchlist', state.watchListTickers);
      }
      if (data.allTickers) {
        state.allTickers = data.allTickers;
        renderTickersList('all', state.allTickers);
      }
    },

    /**
     * Refresh data from API
     */
    async refresh() {
      if (!state.initialized) {
        window.Logger?.warn?.('TickerListWidget not initialized', { page: 'ticker-list-widget' });
        return;
      }

      // Clear cache
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.invalidate('tickers-with-initial-data', 'memory');
      }

      // Reload current tab
      if (state.activeTab === 'active') {
        await loadActiveTickers();
      } else if (state.activeTab === 'watchlist') {
        await loadWatchListTickers();
      } else {
        await loadAllTickers();
      }
    },

    /**
     * Destroy widget
     */
    destroy() {
      state.initialized = false;
      state.activeTickers = [];
      state.watchListTickers = [];
      state.allTickers = [];
      // Note: Event listeners are automatically cleaned up when elements are removed
    },

    version: '1.0.0'
  };

  // Export to global scope
  window.TickerListWidget = TickerListWidget;

  if (window.Logger) {
    window.Logger.info('✅ TickerListWidget loaded successfully', { page: 'ticker-list-widget' });
  }
})();

