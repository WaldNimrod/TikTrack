/**
 * Trade History Page - Trade history and analysis
 * 
 * This file handles the trade history page functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */

(function() {
    'use strict';

    // ===== Constants =====
    const INVESTMENT_TYPES = [
        { value: 'swing', label: 'סווינג' },
        { value: 'investment', label: 'השקעה' },
        { value: 'passive', label: 'פאסיבי' }
    ];

    // ===== Local Variables =====
    let allTrades = [];
    let filteredTrades = [];
    let selectedTradeId = null;
    let allTickers = [];
    let tradeHistoryData = null;
    let isPageInitialized = false;
    let planVsExecutionData = [];
    
    // Cache keys
    const CACHE_KEY_MOCK_DATA = 'trade-history-page_mockData';
    const CACHE_KEY_SELECTED_TRADE_ID = 'trade-history-page_selectedTradeId';
    const CACHE_KEY_SECTION_STATES = 'trade-history-page_sectionStates';

    // ===== Helper Functions =====
    
    /**
     * Helper function to get CSS variable value
     * @param {string} variableName - CSS variable name
     * @param {string} fallback - Fallback value
     * @returns {string} CSS variable value or fallback
     */
    function getCSSVariableValue(variableName, fallback) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            return value && value.trim() ? value.trim() : fallback;
        } catch (error) {
            return fallback;
        }
    }

    /**
     * Get investment type text
     * @param {string} type - Investment type value
     * @returns {string} Investment type label
     */
    function getInvestmentTypeText(type) {
        const typeMap = INVESTMENT_TYPES.find(t => t.value === type);
        return typeMap ? typeMap.label : type;
    }

    /**
     * Format date string using FieldRendererService
     * @param {string} dateString - Date string
     * @param {boolean} includeTime - Whether to include time
     * @returns {string} Formatted date
     */
    function formatDate(dateString, includeTime = false) {
        if (!dateString) return '-';
        
        // Use FieldRendererService for consistent date formatting
        return window.FieldRendererService.renderDate(dateString, includeTime);
    }

    // ===== Main Functions =====

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'trade-history-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'trade-history-page', 
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'trade-history-page', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'trade-history-page' });
                    }
                }
            }, 500);
        }
    }

    /**
     * Load tickers from API with caching
     */
    async function loadTickers() {
        try {
            // Create cache key
            const cacheKey = window.createCacheKey ? 
                window.createCacheKey('trade-history', 'tickers', {}) : 
                'trade-history-tickers-default';
            
            // Try to load from cache
            if (window.UnifiedCacheManager) {
                const cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
                if (cachedData) {
                    allTickers = cachedData;
                    populateTickerFilter();
                    return;
                }
            }
            
            // Load from API using safeApiCall
            const data = await window.safeApiCall('/api/tickers/');
            const tickers = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            allTickers = tickers.map(t => ({
                    id: t.id,
                    symbol: t.symbol || t.ticker_symbol || ''
                })).filter(t => t.symbol).sort((a, b) => a.symbol.localeCompare(b.symbol));
                
            // Save to cache
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(cacheKey, allTickers, 'memory', { ttl: 600 }); // 10 minutes
            }
            
            populateTickerFilter();
        } catch (error) {
            // Error already handled by safeApiCall
            if (window.Logger) {
                window.Logger.warn('Error loading tickers, using empty list', { page: 'trade-history-page', error });
            }
        }
    }
    
    /**
     * Populate ticker filter dropdown
     */
    function populateTickerFilter() {
                const tickerSelect = document.getElementById('filterTicker');
                if (tickerSelect) {
                    tickerSelect.innerHTML = '<option value="">הכל</option>';
                    allTickers.forEach(ticker => {
                        const option = document.createElement('option');
                        option.value = ticker.symbol;
                        option.textContent = ticker.symbol;
                        tickerSelect.appendChild(option);
                    });
        }
    }

    /**
     * Load investment types dropdown
     */
    function loadInvestmentTypes() {
        const investmentSelect = document.getElementById('filterInvestmentType');
        if (investmentSelect) {
            investmentSelect.innerHTML = '<option value="">הכל</option>';
            INVESTMENT_TYPES.forEach(type => {
                const option = document.createElement('option');
                option.value = type.value;
                option.textContent = type.label;
                investmentSelect.appendChild(option);
            });
        }
    }

    /**
     * Load trades from API with caching and error handling
     */
    async function loadTrades() {
        showLoadingState('trades-table-section');
        
        try {
            // Create cache key
            const cacheKey = window.createCacheKey ? 
                window.createCacheKey('trade-history', 'trades', {}) : 
                'trade-history-trades-default';
            
            // Try to load from cache
            if (window.UnifiedCacheManager) {
                const cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
                if (cachedData) {
                    allTrades = cachedData;
                    filteredTrades = [...allTrades];
                    loadTradesTable();
                    hideLoadingState('trades-table-section');
                    return;
                }
            }
            
            // Load from API using safeApiCall
            const data = await window.safeApiCall('/api/trades/');
            const trades = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            
            // Transform trades to match our format
            allTrades = trades.map(trade => ({
                id: trade.id,
                ticker: trade.ticker_symbol || trade.ticker?.symbol || '',
                side: trade.side || '',
                investment_type: trade.investment_type || '',
                created_at: trade.created_at?.utc || trade.created_at || '',
                closed_at: trade.closed_at?.utc || trade.closed_at || '',
                pl: trade.realized_pl || trade.pl || 0,
                pl_percent: trade.pl_percent || 0
            })).filter(t => t.ticker); // Only trades with ticker
        
            // Save to cache
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(cacheKey, allTrades, 'memory', { ttl: 300 }); // 5 minutes
            }
            
            filteredTrades = [...allTrades];
            loadTradesTable();
        } catch (error) {
            // Error already handled by safeApiCall, but fallback to mock data
            if (window.NotificationSystem) {
                window.NotificationSystem.showWarning('טעינת נתונים', 'נטענים נתוני דמה במקום נתונים אמיתיים');
            }
            loadMockTrades();
        } finally {
            hideLoadingState('trades-table-section');
        }
    }

    /**
     * Mock data fallback
     */
    function loadMockTrades() {
        allTrades = [
            {
                id: 123,
                ticker: 'AAPL',
                side: 'Long',
                investment_type: 'swing',
                created_at: '2025-01-01',
                closed_at: '2025-01-20',
                pl: 1110,
                pl_percent: 7.4
            },
            {
                id: 124,
                ticker: 'TSLA',
                side: 'Short',
                investment_type: 'swing',
                created_at: '2025-01-15',
                closed_at: '2025-01-18',
                pl: -250,
                pl_percent: -2.1
            },
            {
                id: 125,
                ticker: 'MSFT',
                side: 'Long',
                investment_type: 'investment',
                created_at: '2024-12-20',
                closed_at: '2025-01-25',
                pl: 850,
                pl_percent: 5.2
            },
            {
                id: 126,
                ticker: 'GOOGL',
                side: 'Long',
                investment_type: 'swing',
                created_at: '2025-01-10',
                closed_at: '2025-01-22',
                pl: 420,
                pl_percent: 3.1
            }
        ];
        filteredTrades = [...allTrades];
        loadTradesTable();
    }

    /**
     * Open trade selector modal
     */
    async function openTradeSelectorModal() {
        const modalElement = document.getElementById('tradeSelectorModal');
        if (modalElement) {
            // Use ModalManagerV2 if available, fallback to Bootstrap
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
                try {
                    await window.ModalManagerV2.showModal('tradeSelectorModal', 'view');
                } catch (error) {
                    // Fallback to Bootstrap if ModalManagerV2 fails
                    window.Logger?.warn('tradeSelectorModal not available in ModalManagerV2, using Bootstrap fallback', { page: 'trade-history-page' });
                    if (bootstrap?.Modal) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    }
                }
            } else {
                // Fallback to Bootstrap modal
                if (bootstrap?.Modal) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            }
        }
        
        // Load data when modal opens
        await Promise.all([
            loadTickers(),
            loadTrades()
        ]);
        loadInvestmentTypes();
    }

    /**
     * Load trades into table
     */
    function loadTradesTable() {
        const tbody = document.getElementById('tradeSelectorTableBody');
        const noResults = document.getElementById('noTradesMessage');
        
        if (filteredTrades.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        tbody.innerHTML = filteredTrades.map(trade => {
            const sideText = trade.side || '-';
            const investmentTypeText = getInvestmentTypeText(trade.investment_type);
            
            // Use FieldRendererService for P/L display
            let plDisplay;
            if (window.FieldRendererService) {
                const plAmount = window.FieldRendererService.renderAmount(trade.pl, '$', 0, true);
                const plPercent = window.FieldRendererService.renderNumericValue(trade.pl_percent || 0, '%', true);
                plDisplay = `<strong>${plAmount}</strong> <small>(${plPercent})</small>`;
            } else {
                // Fallback
                const plClass = trade.pl >= 0 ? 'text-success' : 'text-danger';
                const plSign = trade.pl >= 0 ? '+' : '';
                plDisplay = `<strong class="${plClass}">${plSign}$${Math.abs(trade.pl).toLocaleString()}</strong> <small class="${plClass}">(${plSign}${trade.pl_percent}%)</small>`;
            }
            
            return `
                <tr>
                    <td>#${trade.id}</td>
                    <td><strong>${trade.ticker}</strong></td>
                    <td>${sideText}</td>
                    <td>${investmentTypeText}</td>
                    <td>${formatDate(trade.created_at)}</td>
                    <td>${formatDate(trade.closed_at)}</td>
                    <td>${plDisplay}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm" data-onclick="window.tradeHistoryPage.viewTradeDetails(${trade.id})" title="פרטים" data-icon="eye">
                            </button>
                            <button class="btn btn-sm btn-primary" data-onclick="window.tradeHistoryPage.selectTradeForAnalysis(${trade.id})" title="בחר לניתוח" data-icon="check">
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Apply filters (internal implementation)
     */
    function applyTradeFiltersInternal() {
        const ticker = document.getElementById('filterTicker')?.value || '';
        const side = document.getElementById('filterSide')?.value || '';
        const investmentType = document.getElementById('filterInvestmentType')?.value || '';
        const dateFrom = document.getElementById('filterDateFrom')?.value || '';
        const dateTo = document.getElementById('filterDateTo')?.value || '';
        
        // Save filter state
        if (window.PageStateManager) {
            window.PageStateManager.savePageState('trade-history-page', {
                filters: { ticker, side, investmentType, dateFrom, dateTo }
            }).catch(err => {
                if (window.Logger) {
                    window.Logger.warn('Error saving filter state', { page: 'trade-history-page', error: err });
                }
            });
        }
        
        filteredTrades = allTrades.filter(trade => {
            // Ticker filter (exact match from dropdown)
            if (ticker && trade.ticker !== ticker) {
                return false;
            }
            
            // Side filter
            if (side && trade.side !== side) {
                return false;
            }
            
            // Investment type filter
            if (investmentType && trade.investment_type !== investmentType) {
                return false;
            }
            
            // Date range filter - if any day in trade range is within filter range
            if (dateFrom || dateTo) {
                const tradeStart = new Date(trade.created_at);
                const tradeEnd = trade.closed_at ? new Date(trade.closed_at) : new Date();
                const filterStart = dateFrom ? new Date(dateFrom) : null;
                const filterEnd = dateTo ? new Date(dateTo) : null;
                
                // Check if trade date range overlaps with filter date range
                if (filterStart && tradeEnd < filterStart) {
                    return false; // Trade ends before filter starts
                }
                if (filterEnd && tradeStart > filterEnd) {
                    return false; // Trade starts after filter ends
                }
            }
            
            return true;
        });
        
        loadTradesTable();
    }
    
    // Create debounced version of applyTradeFilters
    const debouncedApplyTradeFilters = window.debounce ? 
        window.debounce(applyTradeFiltersInternal, 300) : 
        applyTradeFiltersInternal;
    
    /**
     * Apply filters (public function with debounce)
     */
    function applyTradeFilters() {
        debouncedApplyTradeFilters();
    }

    /**
     * Clear filters
     */
    function clearTradeFilters() {
        // Use DataCollectionService to clear fields if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue('filterTicker', '', 'text');
          window.DataCollectionService.setValue('filterSide', '', 'text');
          window.DataCollectionService.setValue('filterInvestmentType', '', 'text');
          window.DataCollectionService.setValue('filterDateFrom', '', 'dateOnly');
          window.DataCollectionService.setValue('filterDateTo', '', 'dateOnly');
        } else {
          const filterTickerEl = document.getElementById('filterTicker');
          const filterSideEl = document.getElementById('filterSide');
          const filterInvestmentTypeEl = document.getElementById('filterInvestmentType');
          const filterDateFromEl = document.getElementById('filterDateFrom');
          const filterDateToEl = document.getElementById('filterDateTo');
          if (filterTickerEl) filterTickerEl.value = '';
          if (filterSideEl) filterSideEl.value = '';
          if (filterInvestmentTypeEl) filterInvestmentTypeEl.value = '';
          if (filterDateFromEl) filterDateFromEl.value = '';
          if (filterDateToEl) filterDateToEl.value = '';
        }
        filteredTrades = [...allTrades];
        loadTradesTable();
    }

    /**
     * View trade details
     * @param {number} tradeId - Trade ID
     */
    function viewTradeDetails(tradeId) {
        // שימוש במערכת המרכזית Entity Details Modal
        if (typeof window.showEntityDetails === 'function') {
            window.showEntityDetails('trade', tradeId, { mode: 'view' });
        } else {
            // Fallback למקרה שהמערכת לא זמינה (מוקאפ)
            const trade = allTrades.find(t => t.id === tradeId);
            if (!trade) return;
            alert(`פרטי טרייד #${tradeId}\n\nטיקר: ${trade.ticker}\nצד: ${trade.side}\nסוג: ${getInvestmentTypeText(trade.investment_type)}\nתאריך יצירה: ${formatDate(trade.created_at)}\nתאריך סגירה: ${formatDate(trade.closed_at)}\nP/L: $${trade.pl} (${trade.pl >= 0 ? '+' : ''}${trade.pl_percent}%)`);
        }
    }

    /**
     * Select trade for analysis
     * @param {number} tradeId - Trade ID
     */
    function selectTradeForAnalysis(tradeId) {
        const trade = allTrades.find(t => t.id === tradeId);
        if (!trade) return;
        
        selectedTradeId = tradeId;
        
        // Update selected trade display
        const display = document.getElementById('selectedTradeDisplay');
        const info = document.getElementById('selectedTradeInfo');
        if (display && info) {
            info.textContent = `טרייד #${trade.id} - ${trade.ticker} (${getInvestmentTypeText(trade.investment_type)})`;
            display.style.display = 'block';
        }
        
        // Close modal
        const modalElement = document.getElementById('tradeSelectorModal');
        if (modalElement) {
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                window.ModalManagerV2.hideModal('tradeSelectorModal');
            } else {
                // Fallback to Bootstrap modal
                if (bootstrap?.Modal) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            }
        }
        
        // Save selected trade ID to cache and page state
        saveToCache(CACHE_KEY_SELECTED_TRADE_ID, tradeId);
        savePageState();
        
        // Load trade data for analysis
        loadTradeForAnalysis(tradeId);
    }

    /**
     * Clear selected trade
     */
    async function clearSelectedTrade() {
        selectedTradeId = null;
        const display = document.getElementById('selectedTradeDisplay');
        if (display) {
            display.style.display = 'none';
        }
        
        // Clear from cache and page state
        await saveToCache(CACHE_KEY_SELECTED_TRADE_ID, null);
        await savePageState();
        
        // Clear all trade analysis data
        // This would reset all charts, statistics, etc.
    }

    /**
     * Load trade for analysis (placeholder - in production would load real data)
     * @param {number} tradeId - Trade ID
     */
    function loadTradeForAnalysis(tradeId) {
        if (window.Logger) {
            window.Logger.info(`Loading trade ${tradeId} for analysis...`, { page: 'trade-history-page', tradeId });
        }
        // In production, this would:
        // 1. Fetch trade data from API
        // 2. Update all charts
        // 3. Update statistics
        // 4. Update timeline
        // 5. Update executions table
    }

    /**
     * Wait for UnifiedCacheManager to be ready
     * Returns false immediately if not available (no blocking wait)
     */
    async function waitForCacheManager() {
        // Quick check - if already available and initialized, return immediately
        if (window.UnifiedCacheManager && 
            (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
            return true;
        }
        
        // Short wait for initialization (max 1 second)
        let retries = 0;
        const maxRetries = 10; // 1 second max
        
        while ((!window.UnifiedCacheManager || 
                (!window.UnifiedCacheManager.initialized && 
                 !window.UnifiedCacheManager.isInitialized?.())) && 
               retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.UnifiedCacheManager || 
            (!window.UnifiedCacheManager.initialized && 
             !window.UnifiedCacheManager.isInitialized?.())) {
                if (window.Logger) {
                window.Logger.warn('UnifiedCacheManager not available, using fallback', { page: 'trade-history-page' });
            }
            return false;
        }
        
        return true;
    }

    /**
     * Wait for TradingView libraries to be ready
     */
    async function waitForTradingView() {
        let retries = 0;
        const maxRetries = 100; // 10 seconds max
        
        while ((typeof window.TradingViewChartAdapter === 'undefined' || 
               (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined')) && 
               retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (typeof window.TradingViewChartAdapter === 'undefined') {
            if (window.Logger) {
                window.Logger.warn('TradingViewChartAdapter not available after wait', { page: 'trade-history-page' });
            }
            return false;
        }
        
        return true;
    }

    /**
     * Load data from cache or use mock data
     */
    async function loadDataFromCache() {
        try {
            const cacheAvailable = await waitForCacheManager();
            
            if (cacheAvailable && window.UnifiedCacheManager) {
                // Try to load from cache
                const cachedData = await window.UnifiedCacheManager.get(CACHE_KEY_MOCK_DATA);
                if (cachedData) {
                    tradeHistoryData = cachedData;
                    if (window.Logger) {
                        window.Logger.info('Loaded trade history data from cache', { page: 'trade-history-page' });
                    }
                    return cachedData;
                }
            }
            
            // Fallback to mock data
            if (window.TradeHistoryMockData) {
                tradeHistoryData = window.TradeHistoryMockData;
                if (window.Logger) {
                    window.Logger.info('Using mock data for trade history', { page: 'trade-history-page' });
                }
                
                // Save to cache for next time
                if (cacheAvailable && window.UnifiedCacheManager) {
                    await window.UnifiedCacheManager.save(CACHE_KEY_MOCK_DATA, tradeHistoryData, {
                        layer: 'localStorage',
                        ttl: null, // persistent
                        syncToBackend: false
                    });
                }
                
                return tradeHistoryData;
            }
            
            if (window.Logger) {
                window.Logger.error('No mock data available', { page: 'trade-history-page' });
            }
            return null;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error loading data from cache', { page: 'trade-history-page', error });
            }
            // Fallback to mock data
            if (window.TradeHistoryMockData) {
                tradeHistoryData = window.TradeHistoryMockData;
                return tradeHistoryData;
            }
            return null;
        }
    }

    /**
     * Save to cache
     */
    async function saveToCache(key, data) {
        try {
            const cacheAvailable = await waitForCacheManager();
            if (cacheAvailable && window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(key, data, {
                    layer: 'localStorage',
                    ttl: null,
                    syncToBackend: false
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save to cache', { page: 'trade-history-page', key, error });
            }
        }
    }

    /**
     * Initialize page - called from UnifiedAppInitializer
     */
    async function initializePage() {
        if (isPageInitialized) {
            if (window.Logger) {
                window.Logger.info('Page already initialized, skipping...', { page: 'trade-history-page' });
            }
            return;
        }

        try {
            if (window.Logger) {
                window.Logger.info('📊 Initializing Trade History Page...', { page: 'trade-history-page' });
            }

            // 1. Load mock data (from cache or fresh) - don't wait for cache, use fallback
            const data = await loadDataFromCache();
            
            // 2. Wait for HeaderSystem (non-blocking)
            initializeHeader().catch(() => {
                // Header initialization is optional
            });

            // 3. Wait for TradingView libraries (non-blocking for initial render)
            waitForTradingView().catch(() => {
                // TradingView is optional for initial render
            });
            if (!data) {
                if (window.Logger) {
                    window.Logger.error('Failed to load data, cannot initialize page', { page: 'trade-history-page' });
                }
                return;
            }

            // 5. Load selected trade ID from cache if exists
            const cachedSelectedId = await window.UnifiedCacheManager?.get(CACHE_KEY_SELECTED_TRADE_ID);
            if (cachedSelectedId) {
                selectedTradeId = cachedSelectedId;
    } else {
                // Default to first trade in mock data
                selectedTradeId = data.selectedTrade?.id || null;
            }

            // 6. Register tables
            registerPlanVsExecutionTable();

            // 7. Setup HeaderSystem filter integration
            setupHeaderFiltersIntegration();

            // 8. Load page state (sections, chart zoom, etc.)
            await loadPageState();

            // 9. Render page
            await renderPage(data);

            isPageInitialized = true;

            if (window.Logger) {
                window.Logger.info('✅ Trade History Page initialized successfully', { page: 'trade-history-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing Trade History Page', { page: 'trade-history-page', error });
            }
            throw error;
        }
    }

    /**
     * Render page with data
     */
    async function renderPage(data) {
        if (!data) return;

        try {
            // Render statistics
            renderStatistics(data.statistics);

            // Render trade details
            renderTradeDetails(data.selectedTrade, data.conditions);

            // Render timeline steps
            await renderTimelineSteps(data.timelineData);

            // Initialize timeline chart with data (after a short delay to ensure DOM is ready)
            setTimeout(async () => {
                try {
                    // Check if initTimelineChart exists (from HTML script)
                    if (typeof window.initTimelineChart === 'function') {
                        await window.initTimelineChart();
                        // Restore chart zoom state after chart is initialized
                        setTimeout(() => {
                            if (window.tradeHistoryPage && typeof window.tradeHistoryPage.restoreChartZoomState === 'function') {
                                window.tradeHistoryPage.restoreChartZoomState();
                            }
                        }, 500);
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('initTimelineChart not found in HTML, chart may not initialize', { page: 'trade-history-page' });
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.error('Error initializing timeline chart', { page: 'trade-history-page', error });
                    }
                }
            }, 300);

            // Render plan vs execution comparison
            renderPlanVsExecution(data.planVsExecution);

            // Load linked items (already handled by existing function)
            loadLinkedItemsForTrade();

            if (window.Logger) {
                window.Logger.info('Page rendered successfully', { page: 'trade-history-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error rendering page', { page: 'trade-history-page', error });
            }
        }
    }

    /**
     * Render statistics section
     */
    function renderStatistics(statistics) {
        if (!statistics) return;

        // Duration
        const durationEl = document.getElementById('statDuration');
        if (durationEl) {
            durationEl.textContent = `${statistics.durationDays} ימים`;
            durationEl.classList.remove('loading');
        }

        // Total P/L
        const totalPLEl = document.getElementById('statTotalPL');
        const totalPLPercentEl = document.getElementById('statTotalPLPercent');
        if (totalPLEl && window.FieldRendererService) {
            totalPLEl.innerHTML = window.FieldRendererService.renderAmount(statistics.totalPL, '$', 0, true);
            totalPLEl.classList.remove('loading');
            
            if (totalPLPercentEl) {
                const percent = window.FieldRendererService.renderNumericValue(statistics.totalPLPercent, '%', true);
                totalPLPercentEl.innerHTML = `(${percent})`;
                totalPLPercentEl.classList.remove('loading');
                if (statistics.totalPL >= 0) {
                    totalPLPercentEl.classList.add('positive');
                }
            }
        }

        // Return percent
        const returnPercentEl = document.getElementById('statReturnPercent');
        if (returnPercentEl && window.FieldRendererService) {
            returnPercentEl.innerHTML = window.FieldRendererService.renderNumericValue(statistics.totalPLPercent, '%', true);
            returnPercentEl.classList.remove('loading');
            if (statistics.totalPLPercent >= 0) {
                returnPercentEl.classList.add('positive');
            }
        }

        // Execution count
        const executionCountEl = document.getElementById('statExecutionCount');
        if (executionCountEl) {
            executionCountEl.textContent = statistics.executionCount || 0;
            executionCountEl.classList.remove('loading');
        }
    }

    /**
     * Render trade details using FieldRendererService
     */
    function renderTradeDetails(trade, conditions) {
        if (!trade) return;

        // Ticker
        const tickerEl = document.getElementById('tradeTicker');
        if (tickerEl) {
            tickerEl.textContent = trade.ticker_symbol || trade.ticker?.symbol || '-';
            tickerEl.classList.remove('loading');
        }

        // Side
        const sideEl = document.getElementById('tradeSide');
        if (sideEl) {
            if (window.FieldRendererService && typeof window.FieldRendererService.renderSide === 'function') {
                sideEl.innerHTML = window.FieldRendererService.renderSide(trade.side);
            } else {
                sideEl.innerHTML = `<span class="badge bg-success">${trade.side || '-'}</span>`;
            }
            sideEl.classList.remove('loading');
        }

        // Investment type
        const investmentTypeEl = document.getElementById('tradeInvestmentType');
        if (investmentTypeEl) {
            if (window.FieldRendererService && typeof window.FieldRendererService.renderType === 'function') {
                investmentTypeEl.innerHTML = window.FieldRendererService.renderType(trade.investment_type);
            } else {
                investmentTypeEl.textContent = getInvestmentTypeText(trade.investment_type);
            }
            investmentTypeEl.classList.remove('loading');
        }

        // Status
        updateTradeStatusBadge(trade.status);

        // Account
        const accountEl = document.getElementById('tradeAccount');
        if (accountEl) {
            accountEl.textContent = trade.trading_account?.name || `Account #${trade.trading_account_id || '-'}`;
            accountEl.classList.remove('loading');
        }

        // Dates - using DateNormalizationService if available
        const planDateEl = document.getElementById('tradePlanDate');
        if (planDateEl && trade.created_at) {
            planDateEl.textContent = formatDate(trade.created_at);
            planDateEl.classList.remove('loading');
        }

        const openDateEl = document.getElementById('tradeOpenDate');
        if (openDateEl && trade.opened_at) {
            openDateEl.textContent = formatDate(trade.opened_at);
            openDateEl.classList.remove('loading');
        }

        const entryDateEl = document.getElementById('tradeEntryDate');
        if (entryDateEl && trade.opened_at) {
            entryDateEl.textContent = formatDate(trade.opened_at);
            entryDateEl.classList.remove('loading');
        }

        const closeDateEl = document.getElementById('tradeCloseDate');
        if (closeDateEl && trade.closed_at) {
            closeDateEl.textContent = formatDate(trade.closed_at);
            closeDateEl.classList.remove('loading');
        }

        // Quantities
        const plannedQtyEl = document.getElementById('tradePlannedQuantity');
        if (plannedQtyEl && trade.planned_quantity !== undefined) {
            plannedQtyEl.textContent = `${trade.planned_quantity || 0} מניות`;
            plannedQtyEl.classList.remove('loading');
        }

        const maxQtyEl = document.getElementById('tradeMaxQuantity');
        if (maxQtyEl && trade.planned_quantity !== undefined) {
            maxQtyEl.textContent = `${trade.planned_quantity || 0} מניות`;
            maxQtyEl.classList.remove('loading');
        }

        const totalPurchasesEl = document.getElementById('tradeTotalPurchases');
        if (totalPurchasesEl && trade.planned_quantity !== undefined) {
            totalPurchasesEl.textContent = `${trade.planned_quantity || 0} מניות`;
            totalPurchasesEl.classList.remove('loading');
        }

        // Conditions
        const conditionsEl = document.getElementById('tradeConditions');
        if (conditionsEl && conditions && Array.isArray(conditions)) {
            if (conditions.length > 0) {
                conditionsEl.innerHTML = conditions.map(cond => 
                    `<div><a href="#" data-onclick="showConditionDetails(${cond.id}); return false;">${cond.description}</a></div>`
                ).join('');
            } else {
                conditionsEl.innerHTML = '<span class="text-muted">-</span>';
            }
            conditionsEl.classList.remove('loading');
        }

        // P/L
        const plel = document.getElementById('tradePL');
        if (plel && window.FieldRendererService) {
            const realizedPL = window.FieldRendererService.renderAmount(trade.realized_pl || trade.total_pl || 0, '$', 0, true);
            const unrealizedPL = trade.unrealized_pl !== undefined && trade.unrealized_pl !== null 
                ? window.FieldRendererService.renderAmount(trade.unrealized_pl, '$', 0, true)
                : '<span class="text-muted">-</span>';
            const totalPL = window.FieldRendererService.renderAmount(trade.total_pl || trade.realized_pl || 0, '$', 0, true);
            
            // Use textContent for better security, or create elements properly
            plel.innerHTML = `
                <div>ממומש: ${realizedPL}</div>
                <div>לא ממומש: ${unrealizedPL}</div>
                <div><strong>סה"כ: ${totalPL}</strong></div>
            `;
            // Note: This is a specific P/L display for a single trade, not a summary element
            // Consider using InfoSummarySystem if this becomes a summary of multiple trades
            plel.classList.remove('loading');
        }
    }

    /**
     * Render timeline steps using FieldRendererService
     */
    async function renderTimelineSteps(timelineData) {
        if (!timelineData || !Array.isArray(timelineData)) return;

        const timelineEl = document.getElementById('timelineAbsolute');
        if (!timelineEl) return;

        const stepsHTML = await Promise.all(timelineData.map(async (step, index) => {
            const dateStr = formatDate(step.date);
            
            // Determine step type and classes
            let stepClass = 'timeline-step-absolute';
            let pointColor = '';
            let iconPath = '';
            let title = step.title || step.type || '-';

            // Use IconSystem to get entity icons
            if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                try {
                    if (step.type === 'Note') {
                        stepClass += ' timeline-note';
                        pointColor = 'var(--info-color, #17a2b8)';
                        iconPath = await window.IconSystem.getEntityIcon('note');
                    } else if (step.type === 'Cash Flow') {
                        stepClass += ' timeline-cashflow';
                        pointColor = 'var(--secondary-color, #fc5a06)';
                        iconPath = await window.IconSystem.getEntityIcon('cash_flow');
                    } else if (step.type === 'Alert') {
                        stepClass += ' timeline-alert';
                        pointColor = 'var(--warning-color, #ffc107)';
                        iconPath = await window.IconSystem.getEntityIcon('alert');
                    } else if (step.type === 'Trade Plan') {
                        iconPath = await window.IconSystem.getEntityIcon('trade_plan');
                    } else if (step.type === 'Execution') {
                        stepClass += ' execution-title';
                        iconPath = await window.IconSystem.getEntityIcon('execution');
                    }
                } catch (error) {
                    // Fallback to direct paths
                    if (step.type === 'Note') {
                        stepClass += ' timeline-note';
                        pointColor = 'var(--info-color, #17a2b8)';
                        iconPath = '/trading-ui/images/icons/entities/notes.svg';
                    } else if (step.type === 'Cash Flow') {
                        stepClass += ' timeline-cashflow';
                        pointColor = 'var(--secondary-color, #fc5a06)';
                        iconPath = '/trading-ui/images/icons/entities/cash_flows.svg';
                    } else if (step.type === 'Alert') {
                        stepClass += ' timeline-alert';
                        pointColor = 'var(--warning-color, #ffc107)';
                        iconPath = '/trading-ui/images/icons/entities/alerts.svg';
                    } else if (step.type === 'Trade Plan') {
                        iconPath = '/trading-ui/images/icons/entities/trade_plans.svg';
                    } else if (step.type === 'Execution') {
                        stepClass += ' execution-title';
                        iconPath = '/trading-ui/images/icons/entities/executions.svg';
                    }
                }
            } else {
                // Fallback to direct paths
                if (step.type === 'Note') {
                    stepClass += ' timeline-note';
                    pointColor = 'var(--info-color, #17a2b8)';
                    iconPath = '/trading-ui/images/icons/entities/notes.svg';
                } else if (step.type === 'Cash Flow') {
                    stepClass += ' timeline-cashflow';
                    pointColor = 'var(--secondary-color, #fc5a06)';
                    iconPath = '/trading-ui/images/icons/entities/cash_flows.svg';
                } else if (step.type === 'Alert') {
                    stepClass += ' timeline-alert';
                    pointColor = 'var(--warning-color, #ffc107)';
                    iconPath = '/trading-ui/images/icons/entities/alerts.svg';
                } else if (step.type === 'Trade Plan') {
                    iconPath = '/trading-ui/images/icons/entities/trade_plans.svg';
                } else if (step.type === 'Execution') {
                    stepClass += ' execution-title';
                    iconPath = '/trading-ui/images/icons/entities/executions.svg';
                }
            }

            let detailsHTML = '';
            let plHTML = '';
            let actionHTML = '';

            if (step.type === 'Execution') {
                const priceStr = step.price ? `$${step.price}` : '-';
                const plValue = step.pl !== undefined ? step.pl : 0;
                
                if (window.FieldRendererService) {
                    plHTML = window.FieldRendererService.renderAmount(plValue, '$', 2, true);
                } else {
                    const plClass = plValue >= 0 ? 'numeric-value-positive' : (plValue < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
                    plHTML = `<span class="${plClass}">$${Math.abs(plValue).toFixed(2)}</span>`;
                }

                actionHTML = `
                    <div class="timeline-step-details execution-price-pl">
                        <span class="execution-price">${priceStr}</span>
                        <span class="execution-pl me-2">P/L: ${plHTML}</span>
                    </div>
                `;
            } else if (step.type === 'Cash Flow' && step.amount) {
                if (window.FieldRendererService) {
                    detailsHTML = `<div class="timeline-step-details cashflow-amount">${window.FieldRendererService.renderAmount(step.amount, '$', 2, true)}</div>`;
                } else {
                    detailsHTML = `<div class="timeline-step-details cashflow-amount"><span class="numeric-value-positive">$${step.amount.toFixed(2)}</span></div>`;
                }
            } else if (step.displayText) {
                detailsHTML = `<div class="timeline-step-details">${step.displayText}</div>`;
            }

            const stepId = step.id || index;
            const onClickType = step.type === 'Trade Plan' ? 'plan' : 
                               (step.type === 'Execution' ? 'execution' : 
                               (step.type === 'Cash Flow' ? 'cashflow' : 
                               (step.type === 'Note' ? 'note' : 
                               (step.type === 'Alert' ? 'alert' : 'default'))));

            let onClickFn = '';
            if (step.type === 'Cash Flow') {
                onClickFn = `showCashFlowDetails(${stepId})`;
            } else if (step.type === 'Note') {
                onClickFn = `showNoteDetails(${stepId})`;
            } else if (step.type === 'Alert') {
                onClickFn = `showAlertDetails(${stepId})`;
            } else {
                onClickFn = `showExecutionDetails(${stepId}, '${onClickType}')`;
            }

            return `
                <div class="${stepClass}" data-step="${index}" data-onclick="selectTimelineStep(${index})">
                    <div class="timeline-point-absolute" ${pointColor ? `style="background-color: ${pointColor};"` : ''}></div>
                    <div class="timeline-step-info">
                        <div class="timeline-step-title ${step.type === 'Execution' ? 'execution-title' : ''}">
                            ${await (async () => {
                                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                                    try {
                                        const entityType = step.type === 'Note' ? 'note' : step.type === 'Cash Flow' ? 'cash_flow' : step.type === 'Alert' ? 'alert' : step.type === 'Trade Plan' ? 'trade_plan' : 'execution';
                                        return await window.IconSystem.renderIcon('entity', entityType, { size: '16', alt: step.type, class: 'entity-icon-small' });
                                    } catch (error) {
                                        return `<img src="${iconPath}" alt="${step.type}" class="entity-icon-small">`;
                                    }
                                }
                                return `<img src="${iconPath}" alt="${step.type}" class="entity-icon-small">`;
                            })()}
                            ${title}
                        </div>
                        <div class="timeline-step-date">${dateStr}</div>
                        ${detailsHTML}
                        ${actionHTML}
                        <div class="timeline-step-details"><strong>מזהה:</strong> #${stepId}</div>
                        <a href="#" class="timeline-step-link" data-onclick="${onClickFn}; return false;">פרטים מלאים →</a>
                    </div>
                </div>
            `;
        }).join('');

        timelineEl.classList.remove('loading');
    }

    /**
     * Render plan vs execution comparison table
     */
    function renderPlanVsExecution(comparisonData) {
        if (!comparisonData || !Array.isArray(comparisonData)) return;

        // Store data for table system
        planVsExecutionData = comparisonData;

        // Register table if not already registered
        registerPlanVsExecutionTable();

        // Update table with data
        await updatePlanVsExecutionTable(comparisonData);
    }

    /**
     * Register plan vs execution table with UnifiedTableSystem
     */
    function registerPlanVsExecutionTable() {
        if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
            if (window.Logger) {
                window.Logger.warn('UnifiedTableSystem not available for plan vs execution table registration', { page: 'trade-history-page' });
            }
            return false;
        }

        const tableType = 'trade-history-plan-vs-execution';

        // Check if already registered
        if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
            return true;
        }

        // Render functions for each column
        const renderCategory = async (row) => {
            const icon = row.categoryIcon || 'info-circle';
            let iconHTML = `<img src="../../images/icons/tabler/${icon}.svg" width="16" height="16" alt="icon" class="icon">`;
            if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                try {
                    iconHTML = await window.IconSystem.renderIcon('button', icon, { size: '16', alt: 'icon', class: 'icon' });
                } catch (error) {
                    // Fallback already set
                }
            }
            return `
                <strong>
                    ${iconHTML}
                    ${row.category}
                </strong>
            `;
        };

        const renderPlannedValue = (row) => {
            return renderComparisonValue(row.planned);
        };

        const renderTradeValue = (row) => {
            return renderComparisonValue(row.trade);
        };

        const renderExecutedValue = (row) => {
            return renderComparisonValue(row.executed);
        };

        const renderComparisonStatus = async (row) => {
            const statusBadgeClass = `status-badge status-${row.status}`;
            const statusIcon = row.statusIcon || 'info-circle';
            let iconHTML = `<img src="../../images/icons/tabler/${statusIcon}.svg" width="16" height="16" alt="${statusIcon}" class="icon">`;
            if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                try {
                    iconHTML = await window.IconSystem.renderIcon('button', statusIcon, { size: '16', alt: statusIcon, class: 'icon' });
                } catch (error) {
                    // Fallback already set
                }
            }
            return `
                <span class="${statusBadgeClass}">
                    ${iconHTML}
                    ${row.statusText || ''}
                </span>
            `;
        };

        const renderComparisonValue = (value) => {
            if (!value || (value.quantity === null && value.amount === null && !value.description)) {
                return '<div class="comparison-value"><div class="value">-</div></div>';
            }

            let html = '';
            if (value.quantity !== null && value.quantity !== undefined) {
                html += `<div class="value">${value.quantity} מניות</div>`;
            } else if (value.amount !== null && value.amount !== undefined) {
                if (window.FieldRendererService) {
                    html += `<div class="value">${window.FieldRendererService.renderAmount(value.amount, '$', 0, true)}</div>`;
                } else {
                    html += `<div class="value">$${value.amount}</div>`;
                }
            }

            if (value.price) {
                const priceDisplay = value.isEstimated ? `${value.price} (יעד)` : value.price;
                html += `<div class="price">@ $${priceDisplay}</div>`;
            }

            if (value.date) {
                const dateDisplay = value.isEstimated ? `${formatDate(value.date)} (משוער)` : formatDate(value.date);
                html += `<div class="date">${dateDisplay}</div>`;
            }

            if (value.description) {
                html += `<div class="description">${value.description}</div>`;
            }

            const valueClass = value === null ? 'planned' : (value.amount !== undefined ? 'executed' : 'trade');
            return `<div class="comparison-value ${valueClass}">${html}</div>`;
        };

        // Register table
        window.UnifiedTableSystem.registry.register(tableType, {
            dataGetter: () => planVsExecutionData || [],
            updateFunction: async (data) => await updatePlanVsExecutionTable(data),
            tableSelector: '#planVsExecutionTable',
            columns: [
                { 
                    key: 'category', 
                    header: 'קטגוריה',
                    render: (row) => renderCategory(row)
                },
                { 
                    key: 'planned', 
                    header: 'תוכנית',
                    render: (row) => renderPlannedValue(row)
                },
                { 
                    key: 'trade', 
                    header: 'טרייד',
                    render: (row) => renderTradeValue(row)
                },
                { 
                    key: 'executed', 
                    header: 'ביצוע',
                    render: (row) => renderExecutedValue(row)
                },
                { 
                    key: 'status', 
                    header: 'סטטוס',
                    render: async (row) => await renderComparisonStatus(row)
                }
            ],
            sortable: false, // Comparison table doesn't need sorting
            filterable: false // Comparison table doesn't need filtering
        });

        if (window.Logger) {
            window.Logger.info('✅ Registered plan vs execution table with UnifiedTableSystem', { page: 'trade-history-page' });
        }

        return true;
    }

    /**
     * Update plan vs execution table with data
     */
    function updatePlanVsExecutionTable(comparisonData) {
        if (!comparisonData || !Array.isArray(comparisonData)) return;

        const tbodyEl = document.getElementById('planVsExecutionTableBody');
        if (!tbodyEl) return;

        // Render helper function
        const renderValue = (value) => {
            if (!value || (value.quantity === null && value.amount === null && !value.description)) {
                return '<div class="value">-</div>';
            }

            let html = '';
            if (value.quantity !== null && value.quantity !== undefined) {
                html += `<div class="value">${value.quantity} מניות</div>`;
            } else if (value.amount !== null && value.amount !== undefined) {
                if (window.FieldRendererService) {
                    html += `<div class="value">${window.FieldRendererService.renderAmount(value.amount, '$', 0, true)}</div>`;
                } else {
                    html += `<div class="value">$${value.amount}</div>`;
                }
            }

            if (value.price) {
                const priceDisplay = value.isEstimated ? `${value.price} (יעד)` : value.price;
                html += `<div class="price">@ $${priceDisplay}</div>`;
            }

            if (value.date) {
                const dateDisplay = value.isEstimated ? `${formatDate(value.date)} (משוער)` : formatDate(value.date);
                html += `<div class="date">${dateDisplay}</div>`;
            }

            if (value.description) {
                html += `<div class="description">${value.description}</div>`;
            }

            return html;
        };

        planVsExecutionData = comparisonData;
        const rowsHTML = await Promise.all(comparisonData.map(async row => {
            const statusBadgeClass = `status-badge status-${row.status}`;
            const statusIcon = row.statusIcon || 'info-circle';

            return `
                <tr>
                    <td>
                        <strong>
                            ${typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized
                                ? await window.IconSystem.renderIcon('button', row.categoryIcon || 'info-circle', { size: '16', alt: 'icon', class: 'icon' })
                                : `<img src="../../images/icons/tabler/${row.categoryIcon || 'info-circle'}.svg" width="16" height="16" alt="icon" class="icon">`}
                            ${row.category}
                        </strong>
                    </td>
                    <td>
                        <div class="comparison-value planned">
                            ${renderValue(row.planned)}
                        </div>
                    </td>
                    <td>
                        <div class="comparison-value trade">
                            ${renderValue(row.trade)}
                        </div>
                    </td>
                    <td>
                        <div class="comparison-value executed">
                            ${renderValue(row.executed)}
                        </div>
                    </td>
                    <td>
                        <span class="${statusBadgeClass}">
                            ${await (async () => {
                                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                                    try {
                                        return await window.IconSystem.renderIcon('button', statusIcon, { size: '16', alt: statusIcon, class: 'icon' });
                                    } catch (error) {
                                        return `<img src="../../images/icons/tabler/${statusIcon}.svg" width="16" height="16" alt="${statusIcon}" class="icon">`;
                                    }
                                }
                                return `<img src="../../images/icons/tabler/${statusIcon}.svg" width="16" height="16" alt="${statusIcon}" class="icon">`;
                            })()}
                            ${row.statusText || ''}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Setup HeaderSystem filter integration
     */
    function setupHeaderFiltersIntegration() {
        // The HeaderSystem should automatically handle filters
        // We just need to ensure the page is ready for filter updates
        if (window.headerSystem && window.headerSystem.filterManager) {
            if (window.Logger) {
                window.Logger.info('HeaderSystem filter manager available', { page: 'trade-history-page' });
            }
        } else {
            if (window.Logger) {
                window.Logger.warn('HeaderSystem filter manager not available', { page: 'trade-history-page' });
            }
        }
    }

    /**
     * Save page state using PageStateManager
     */
    async function savePageState() {
        try {
            if (!window.PageStateManager) {
                if (window.Logger) {
                    window.Logger.warn('PageStateManager not available', { page: 'trade-history-page' });
                }
                return false;
            }

            // Initialize PageStateManager if needed
            if (!window.PageStateManager.initialized) {
                await window.PageStateManager.initialize();
            }

            const pageName = 'trade-history-page';

            // Get section states
            const sections = {};
            document.querySelectorAll('.content-section, .top-section').forEach(section => {
                const sectionId = section.id;
                if (sectionId) {
                    const body = section.querySelector('.section-body');
                    const isHidden = section.classList.contains('collapsed') || 
                                   section.style.display === 'none' ||
                                   (body && (!body.offsetParent || body.style.display === 'none'));
                    sections[sectionId] = isHidden;
                }
            });

            // Get chart zoom state if chart exists
            let chartVisibleRange = null;
            if (timelineChart) {
                try {
                    const timeScale = timelineChart.timeScale();
                    chartVisibleRange = timeScale.getVisibleRange();
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Error getting chart zoom state', { page: 'trade-history-page', error });
                    }
                }
            }

            // Save state
            const saved = await window.PageStateManager.savePageState(pageName, {
                sections: sections,
                entityFilters: {
                    selectedTradeId: selectedTradeId,
                    chartVisibleRange: chartVisibleRange
                }
            });

            if (saved && window.Logger) {
                window.Logger.debug('Saved page state', { page: 'trade-history-page' });
            }

            return saved;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error saving page state', { page: 'trade-history-page', error });
            }
            return false;
        }
    }

    /**
     * Load page state using PageStateManager
     */
    async function loadPageState() {
        try {
            if (!window.PageStateManager) {
                if (window.Logger) {
                    window.Logger.warn('PageStateManager not available', { page: 'trade-history-page' });
                }
                return null;
            }

            // Initialize PageStateManager if needed
            if (!window.PageStateManager.initialized) {
                await window.PageStateManager.initialize();
            }

            const pageName = 'trade-history-page';
            const state = await window.PageStateManager.loadPageState(pageName);

            if (!state) {
                return null;
            }

            // Restore section states (ui-utils.js handles this automatically, but we can restore here too)
            if (state.sections) {
                Object.keys(state.sections).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const isHidden = state.sections[sectionId];
                        if (isHidden) {
                            section.classList.add('collapsed');
                            const body = section.querySelector('.section-body');
                            if (body) {
                                body.style.display = 'none';
                            }
                            const toggleIcon = section.querySelector('.section-toggle-icon');
                            if (toggleIcon) {
                                toggleIcon.textContent = '▶';
                            }
                        }
                    }
                });
            }

            // Restore filter states
            if (state.filters) {
                const { ticker, side, investmentType, dateFrom, dateTo } = state.filters;
                // Use DataCollectionService to set values if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  if (ticker) window.DataCollectionService.setValue('filterTicker', ticker, 'text');
                  if (side) window.DataCollectionService.setValue('filterSide', side, 'text');
                  if (investmentType) window.DataCollectionService.setValue('filterInvestmentType', investmentType, 'text');
                  if (dateFrom) window.DataCollectionService.setValue('filterDateFrom', dateFrom, 'dateOnly');
                  if (dateTo) window.DataCollectionService.setValue('filterDateTo', dateTo, 'dateOnly');
                } else {
                  if (ticker && document.getElementById('filterTicker')) {
                    document.getElementById('filterTicker').value = ticker;
                  }
                  if (side && document.getElementById('filterSide')) {
                    document.getElementById('filterSide').value = side;
                  }
                  if (investmentType && document.getElementById('filterInvestmentType')) {
                    document.getElementById('filterInvestmentType').value = investmentType;
                  }
                  if (dateFrom && document.getElementById('filterDateFrom')) {
                    document.getElementById('filterDateFrom').value = dateFrom;
                  }
                  if (dateTo && document.getElementById('filterDateTo')) {
                    document.getElementById('filterDateTo').value = dateTo;
                  }
                }
                // Reapply filters after restoring state (without debounce to restore immediately)
                if (ticker || side || investmentType || dateFrom || dateTo) {
                    applyTradeFiltersInternal();
                }
            }

            // Restore selected trade ID
            if (state.entityFilters && state.entityFilters.selectedTradeId) {
                selectedTradeId = state.entityFilters.selectedTradeId;
                // Save to cache as well
                await saveToCache(CACHE_KEY_SELECTED_TRADE_ID, selectedTradeId);
            }

            // Store chart state for restoration after chart initialization
            if (state.entityFilters && state.entityFilters.chartVisibleRange) {
                window._tradeHistoryPageChartState = {
                    visibleRange: state.entityFilters.chartVisibleRange
                };
            }

            if (window.Logger) {
                window.Logger.debug('Loaded page state', { page: 'trade-history-page' });
            }

            return state;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error loading page state', { page: 'trade-history-page', error });
            }
            return null;
        }
    }

    /**
     * Restore chart zoom state after chart is initialized
     */
    function restoreChartZoomState() {
        if (!timelineChart || !window._tradeHistoryPageChartState) return;

        try {
            const state = window._tradeHistoryPageChartState;
            if (state.visibleRange) {
                const timeScale = timelineChart.timeScale();
                timeScale.setVisibleRange({
                    from: state.visibleRange.from,
                    to: state.visibleRange.to
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error restoring chart zoom state', { page: 'trade-history-page', error });
            }
        }
    }

    // ===== Export =====
    window.tradeHistoryPage = {
        openTradeSelectorModal,
        applyTradeFilters,
        clearTradeFilters,
        viewTradeDetails,
        selectTradeForAnalysis,
        clearSelectedTrade,
        getCSSVariableValue,
        getInvestmentTypeText,
        formatDate,
        initializePage, // Export for UnifiedAppInitializer
        loadDataFromCache,
        saveToCache,
        savePageState,
        loadPageState,
        restoreChartZoomState,
        getTimelineData: () => tradeHistoryData?.timelineData || []
    };

})();

