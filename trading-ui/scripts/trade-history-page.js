/**
 * Trade History Page - Trade history and analysis
 * 
 * This file handles the trade history page functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeHeader() - Initializeheader
// - initializePage() - Initializepage
// - setupHeaderFiltersIntegration() - Setupheaderfiltersintegration

// === Event Handlers ===
// - showMissingHistoricalDataConfirmation() - Showmissinghistoricaldataconfirmation
// - renderTradesForSelection() - Rendertradesforselection
// - renderPlanVsExecution() - Renderplanvsexecution
// - registerPlanVsExecutionTable() - Registerplanvsexecutiontable
// - updatePlanVsExecutionTable() - Updateplanvsexecutiontable
// - renderComparisonValue() - Rendercomparisonvalue

// === UI Functions ===
// - showTickerSearchModal() - Showtickersearchmodal
// - renderTickerSearchResults() - Rendertickersearchresults
// - updateURLWithTradeId() - Updateurlwithtradeid
// - renderPage() - Renderpage
// - renderStatistics() - Renderstatistics
// - renderTradeDetails() - Rendertradedetails
// - renderTimelineStepsTable() - Rendertimelinestepstable
// - renderTimelineSteps() - Rendertimelinesteps
// - renderPlannedValue() - Renderplannedvalue
// - renderTradeValue() - Rendertradevalue
// - renderExecutedValue() - Renderexecutedvalue
// - renderValue() - Rendervalue

// === Data Functions ===
// - getCSSVariableValue() - Getcssvariablevalue
// - getInvestmentTypeText() - Getinvestmenttypetext
// - loadTickers() - Loadtickers
// - loadInvestmentTypes() - Loadinvestmenttypes
// - loadTrades() - Loadtrades
// - loadTradesTable() - Loadtradestable
// - checkAndFetchMissingHistoricalPrices() - Checkandfetchmissinghistoricalprices
// - loadTradeForAnalysis() - Loadtradeforanalysis (EOD integrated)
// - loadDataFromCache() - Loaddatafromcache
// - saveToCache() - Savetocache
// - getTradeIdFromURL() - Gettradeidfromurl
// - calculateEODTradeStatistics() - Calculateeodtradestatistics
// - calculateVolatility() - Calculatevolatility
// - savePageState() - Savepagestate
// - loadPageState() - Loadpagestate

// === Utility Functions ===
// - formatDate() - Formatdate

// === Other ===
// - safeSetInnerHTML() - Safesetinnerhtml
// - populateTickerFilter() - Populatetickerfilter
// - openTradeSelectorModal() - Opentradeselectormodal
// - applyTradeFiltersInternal() - Applytradefiltersinternal
// - applyTradeFilters() - Applytradefilters
// - clearTradeFilters() - Cleartradefilters
// - viewTradeDetails() - Viewtradedetails
// - selectTradeForAnalysis() - Selecttradeforanalysis
// - clearSelectedTrade() - Clearselectedtrade
// - searchTickerForTradeHistory() - Searchtickerfortradehistory
// - clearTickerSearchResults() - Cleartickersearchresults
// - selectTickerForTradeHistory() - Selecttickerfortradehistory
// - selectTradeForHistory() - Selecttradeforhistory
// - waitForCacheManager() - Waitforcachemanager
// - waitForTradingView() - Waitfortradingview
// - restoreChartZoomState() - Restorechartzoomstate
// - extractDateValue() - Extractdatevalue
// - extractDate() - Extractdate

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
    
    // Flag to prevent multiple simultaneous data fetch operations
    let isFetchingHistoricalData = false;
    let currentFetchTickerId = null;
    
    // Cache keys
    const CACHE_KEY_SELECTED_TRADE_ID = 'trade-history-page_selectedTradeId';
    const CACHE_KEY_SECTION_STATES = 'trade-history-page_sectionStates';

    // ===== Helper Functions =====
    
    /**
     * Helper function to safely set innerHTML using DOMParser
     * @param {HTMLElement} element - Target element
     * @param {string} htmlString - HTML string to insert
     */
    function safeSetInnerHTML(element, htmlString) {
        if (!element || !htmlString) return;
        
        // Clear existing content
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        
        // Parse and append new content
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        doc.body.childNodes.forEach(node => {
            element.appendChild(node.cloneNode(true));
        });
    }
    
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
     * Handles DateEnvelope objects from backend API
     * @param {string|object|Date} dateValue - Date value (string, DateEnvelope, or Date object)
     * @param {boolean} includeTime - Whether to include time
     * @returns {string} Formatted date
     * @deprecated Use window.FieldRendererService.renderDate() directly
     */
    function formatDate(dateValue, includeTime = false) {
        if (!dateValue) return '-';
        
        // Handle DateEnvelope objects from backend
        let dateToFormat = dateValue;
        if (dateValue && typeof dateValue === 'object') {
            // Check if it's a DateEnvelope object
            if ('epochMs' in dateValue || 'utc' in dateValue || 'display' in dateValue) {
                // Use dateUtils to convert DateEnvelope to Date object
                if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                    const dateObj = window.dateUtils.toDateObject(dateValue);
                    if (dateObj) {
                        dateToFormat = dateObj.toISOString();
                    } else if (dateValue.display) {
                        // Fallback to display string if available
                        return dateValue.display;
                    } else if (dateValue.utc) {
                        dateToFormat = dateValue.utc;
                    } else {
                        return '-';
                    }
                } else if (dateValue.display) {
                    // Fallback to display string
                    return dateValue.display;
                } else if (dateValue.utc) {
                    dateToFormat = dateValue.utc;
                } else if (dateValue.epochMs) {
                    dateToFormat = new Date(dateValue.epochMs).toISOString();
                } else {
                    return '-';
                }
            } else if (dateValue instanceof Date) {
                dateToFormat = dateValue.toISOString();
            } else {
                // Try to convert to string
                dateToFormat = String(dateValue);
            }
        }
        
        // Use FieldRendererService for consistent date formatting
        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
            return window.FieldRendererService.renderDate(dateToFormat, includeTime);
        }
        // Fallback if FieldRendererService not available
        return String(dateToFormat);
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
                    tickerSelect.textContent = '';
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'הכל';
                    tickerSelect.appendChild(defaultOption);
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
            investmentSelect.textContent = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'הכל';
            investmentSelect.appendChild(defaultOption);
            INVESTMENT_TYPES.forEach(type => {
                const option = document.createElement('option');
                option.value = type.value;
                option.textContent = type.label;
                investmentSelect.appendChild(option);
            });
        }
    }

    /**
     * Load trades from TradeHistoryData service
     */
    async function loadTrades() {
        showLoadingState('trades-table-section');
        
        try {
            // Wait for TradeHistoryData service to be available
            if (!window.TradeHistoryData) {
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (window.TradeHistoryData) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 5000); // Timeout after 5 seconds
                });
            }

            if (!window.TradeHistoryData || typeof window.TradeHistoryData.loadTradeHistory !== 'function') {
                throw new Error('TradeHistoryData service not available');
            }

            // Load trade history using TradeHistoryData service
            const data = await window.TradeHistoryData.loadTradeHistory({});
            const trades = Array.isArray(data?.trades) ? data.trades : [];
            
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
            
            filteredTrades = [...allTrades];
            loadTradesTable();
        } catch (error) {
            const errorMsg = error?.message || 'שגיאה בטעינת נתונים';
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בטעינת טריידים', errorMsg);
            } else if (window.Logger) {
                window.Logger.error('Error loading trades', { page: 'trade-history-page', error });
            }
            allTrades = [];
            filteredTrades = [];
            loadTradesTable();
        } finally {
            hideLoadingState('trades-table-section');
        }
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
                        const modal = window.ModalManagerV2?.openModal(modalElement);
                        modal.show();
                    }
                }
            } else {
                // Fallback to Bootstrap modal
                if (bootstrap?.Modal) {
                    const modal = window.ModalManagerV2?.openModal(modalElement);
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
            tbody.textContent = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        tbody.textContent = '';
        const rowsHTML = filteredTrades.map(trade => {
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
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<table><tbody>${rowsHTML}</tbody></table>`, 'text/html');
        const tempTbody = doc.body.querySelector('tbody');
        if (tempTbody) {
            Array.from(tempTbody.children).forEach(row => {
                tbody.appendChild(row.cloneNode(true));
            });
        }
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
            // Use NotificationSystem instead of alert
            const tradeDetails = `פרטי טרייד #${tradeId}\n\nטיקר: ${trade.ticker}\nצד: ${trade.side}\nסוג: ${getInvestmentTypeText(trade.investment_type)}\nתאריך יצירה: ${formatDate(trade.created_at)}\nתאריך סגירה: ${formatDate(trade.closed_at)}\nP/L: $${trade.pl} (${trade.pl >= 0 ? '+' : ''}${trade.pl_percent}%)`;
            
            if (window.NotificationSystem && typeof window.NotificationSystem.showInfo === 'function') {
                window.NotificationSystem.showInfo('פרטי טרייד', tradeDetails);
            } else if (window.Logger) {
                window.Logger.info('Trade details', { page: 'trade-history-page', tradeId, details: tradeDetails });
            }
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
            const tickerSymbol = trade.ticker?.symbol || trade.ticker_symbol || trade.ticker || `טיקר #${trade.ticker_id || '?'}`;
            const investmentType = trade.investment_type || '';
            const investmentTypeText = window.FieldRendererService?.renderType 
                ? window.FieldRendererService.renderType(investmentType)
                : getInvestmentTypeText(investmentType);
            
            // Use safeSetInnerHTML to set HTML content (for badges)
            if (window.FieldRendererService?.renderType) {
                safeSetInnerHTML(info, `טרייד #${trade.id} - ${tickerSymbol} (${investmentTypeText})`);
            } else {
                info.textContent = `טרייד #${trade.id} - ${tickerSymbol} (${getInvestmentTypeText(investmentType)})`;
            }
            display.style.display = 'block';
            display.classList.remove('hidden');
        }
        
        // Close modal
        const modalElement = document.getElementById('tradeSelectorModal');
        if (modalElement) {
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                window.ModalManagerV2.hideModal('tradeSelectorModal');
            } else {
                // Fallback to Bootstrap modal
                if (bootstrap?.Modal) {
                    const modal = window.ModalManagerV2?.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            }
        }
        
        // Save selected trade ID to cache and page state
        saveToCache(CACHE_KEY_SELECTED_TRADE_ID, tradeId);
        savePageState();
        
        // Update URL with trade_id parameter
        updateURLWithTradeId(tradeId);
        
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
        
        // Remove trade_id from URL
        updateURLWithTradeId(null);
        
        // Show ticker search modal
        showTickerSearchModal();
        
        // Clear all trade analysis data
        // This would reset all charts, statistics, etc.
    }

    /**
     * Check for missing historical prices and offer to fetch them
     * @param {number} tickerId - Ticker ID
     * @param {string} tickerSymbol - Ticker symbol for display
     * @param {Array} timelineData - Timeline data to check
     * @param {number} tradeId - Trade ID (for reloading after fetch)
     */
    async function checkAndFetchMissingHistoricalPrices(tickerId, tickerSymbol, timelineData, tradeId) {
        if (!timelineData || timelineData.length === 0 || !tickerId) return;
        
        // Prevent multiple simultaneous fetch operations
        if (isFetchingHistoricalData) {
            if (window.Logger) {
                window.Logger.info('⚠️ Historical data fetch already in progress, skipping duplicate request', { 
                    page: 'trade-history-page',
                    tickerId,
                    currentFetchTickerId,
                    requestedTickerId: tickerId
                });
            }
            return;
        }
        
        // Check if this is the same ticker we're already fetching
        if (currentFetchTickerId === tickerId) {
            if (window.Logger) {
                window.Logger.info('⚠️ Already fetching data for this ticker, skipping duplicate request', { 
                    page: 'trade-history-page',
                    tickerId
                });
            }
            return;
        }
        
        try {
            // Set flag to prevent concurrent operations
            isFetchingHistoricalData = true;
            currentFetchTickerId = tickerId;
            // Calculate date range: 7 days before first record + 7 days after last record
            let startDate = null;
            let endDate = null;
            
            for (const item of timelineData) {
                let itemDate = null;
                if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                    itemDate = window.dateUtils.toDateObject(item.date);
                } else if (item.date && typeof item.date === 'object' && 'epochMs' in item.date) {
                    itemDate = new Date(item.date.epochMs);
                } else if (item.date && typeof item.date === 'object' && 'utc' in item.date) {
                    itemDate = new Date(item.date.utc);
                } else {
                    itemDate = new Date(item.date);
                }
                
                if (itemDate && !isNaN(itemDate.getTime())) {
                    if (!startDate || itemDate < startDate) {
                        startDate = new Date(itemDate);
                    }
                    if (!endDate || itemDate > endDate) {
                        endDate = new Date(itemDate);
                    }
                }
            }
            
            if (!startDate || !endDate) {
                if (window.Logger) {
                    window.Logger.warn('Could not determine date range for historical price check', { 
                        page: 'trade-history-page',
                        tickerId 
                    });
                }
                return;
            }
            
            // Extend range: 7 days before and after
            const checkStartDate = new Date(startDate);
            checkStartDate.setDate(checkStartDate.getDate() - 7);
            const checkEndDate = new Date(endDate);
            checkEndDate.setDate(checkEndDate.getDate() + 7);
            
            // Check for missing dates by querying API for existing quotes
            // Use the correct endpoint: /api/external-data/quotes/<ticker_id>/history?days=...
            const baseUrl = window.API_BASE_URL || (window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
            const separator = baseUrl.endsWith('/') ? '' : '/';
            
            // Calculate days needed (from checkStartDate to checkEndDate)
            const daysDiff = Math.ceil((checkEndDate - checkStartDate) / (1000 * 60 * 60 * 24));
            const daysNeeded = Math.max(daysDiff, 30); // At least 30 days, but use actual range
            
            const quotesUrl = `${baseUrl}${separator}api/external-data/quotes/${tickerId}/history?days=${daysNeeded}&interval=1d`;
            
            let existingQuotes = [];
            try {
                const quotesResponse = await fetch(quotesUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }, });
                
                if (quotesResponse.ok) {
                    const quotesData = await quotesResponse.json();
                    existingQuotes = Array.isArray(quotesData?.data) ? quotesData.data : [];
                    
                    if (window.Logger) {
                        window.Logger.debug('Fetched existing quotes from history endpoint', { 
                            page: 'trade-history-page',
                            tickerId,
                            quotesCount: existingQuotes.length,
                            daysRequested: daysNeeded
                        });
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.warn('Failed to fetch existing quotes', { 
                            page: 'trade-history-page',
                            tickerId,
                            status: quotesResponse.status,
                            statusText: quotesResponse.statusText
                        });
                    }
                }
            } catch (quotesError) {
                if (window.Logger) {
                    window.Logger.warn('Error fetching existing quotes', { 
                        page: 'trade-history-page',
                        tickerId,
                        error: quotesError?.message || quotesError 
                    });
                }
            }
            
            // Build set of existing dates (format: YYYY-MM-DD)
            // The history endpoint returns quotes with 'date' field (ISO string)
            const existingDates = new Set();
            for (const quote of existingQuotes) {
                // The history endpoint returns 'date' field (ISO string) instead of 'asof_utc'
                const dateField = quote.date || quote.asof_utc;
                if (dateField) {
                    let quoteDate = null;
                    if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                        quoteDate = window.dateUtils.toDateObject(dateField);
                    } else if (dateField && typeof dateField === 'object' && 'epochMs' in dateField) {
                        quoteDate = new Date(dateField.epochMs);
                    } else if (dateField && typeof dateField === 'object' && 'utc' in dateField) {
                        quoteDate = new Date(dateField.utc);
                    } else if (typeof dateField === 'string') {
                        quoteDate = new Date(dateField);
                    } else {
                        quoteDate = new Date(dateField);
                    }
                    
                    if (quoteDate && !isNaN(quoteDate.getTime())) {
                        const dateStr = quoteDate.toISOString().split('T')[0]; // YYYY-MM-DD
                        existingDates.add(dateStr);
                    }
                }
            }
            
            // Find missing dates
            const missingDates = [];
            const missingDataTypes = {
                open: 0,
                high: 0,
                low: 0,
                close: 0,
                total: 0
            };
            
            let currentDate = new Date(checkStartDate);
            while (currentDate <= checkEndDate) {
                const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
                
                if (!existingDates.has(dateStr)) {
                    missingDates.push(new Date(currentDate));
                } else {
                    // Check if quote has all OHLC data
                    // The history endpoint returns 'open', 'high', 'low', 'close' instead of 'open_price', etc.
                    const quote = existingQuotes.find(q => {
                        const dateField = q.date || q.asof_utc;
                        if (dateField) {
                            let qDate = null;
                            if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                                qDate = window.dateUtils.toDateObject(dateField);
                            } else if (dateField && typeof dateField === 'object' && 'epochMs' in dateField) {
                                qDate = new Date(dateField.epochMs);
                            } else if (dateField && typeof dateField === 'object' && 'utc' in dateField) {
                                qDate = new Date(dateField.utc);
                            } else if (typeof dateField === 'string') {
                                qDate = new Date(dateField);
                            } else {
                                qDate = new Date(dateField);
                            }
                            if (qDate && !isNaN(qDate.getTime())) {
                                return qDate.toISOString().split('T')[0] === dateStr;
                            }
                        }
                        return false;
                    });
                    
                    if (quote) {
                        // History endpoint uses 'open', 'high', 'low', 'close' instead of 'open_price', etc.
                        const open = quote.open || quote.open_price;
                        const high = quote.high || quote.high_price;
                        const low = quote.low || quote.low_price;
                        const close = quote.close || quote.close_price;
                        
                        if (!open || open === null) missingDataTypes.open++;
                        if (!high || high === null) missingDataTypes.high++;
                        if (!low || low === null) missingDataTypes.low++;
                        if (!close || close === null) missingDataTypes.close++;
                    }
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            missingDataTypes.total = missingDates.length;
            
            // If there are missing dates or incomplete data, show warning (not error) and confirmation
            if (missingDates.length > 0 || missingDataTypes.open > 0 || missingDataTypes.high > 0 || missingDataTypes.low > 0 || missingDataTypes.close > 0) {
                // Show warning notification (not error)
                if (window.NotificationSystem && typeof window.NotificationSystem.showWarning === 'function') {
                    const missingCount = missingDates.length;
                    const missingOHLC = (missingDataTypes.open || 0) + (missingDataTypes.high || 0) + (missingDataTypes.low || 0) + (missingDataTypes.close || 0);
                    let warningMessage = `נתוני מחיר היסטוריים חסרים עבור ${tickerSymbol}`;
                    if (missingCount > 0) {
                        warningMessage += `: ${missingCount} תאריכים חסרים`;
                    }
                    if (missingOHLC > 0) {
                        warningMessage += `, ${missingOHLC} שדות OHLC חסרים`;
                    }
                    
                    window.NotificationSystem.showWarning(
                        'נתונים חסרים',
                        warningMessage,
                        { duration: 8000 }
                    );
                }
                
                const confirmed = await showMissingHistoricalDataConfirmation(
                    tickerSymbol, 
                    checkStartDate, 
                    checkEndDate,
                    missingDates,
                    missingDataTypes
                );
                
                if (window.Logger) {
                    window.Logger.info('User response to missing data confirmation', { 
                        page: 'trade-history-page',
                        confirmed,
                        tickerId,
                        tickerSymbol
                    });
                }
                
                if (!confirmed) {
                    if (window.Logger) {
                        window.Logger.info('User declined to fetch missing historical data', { 
                            page: 'trade-history-page',
                            tickerId,
                            tickerSymbol
                        });
                    }
                    // Show warning that data is missing
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showWarning(
                            'נתונים חסרים',
                            `נתוני מחיר היסטוריים עבור ${tickerSymbol} חסרים. הגרף והחישובים עלולים להיות לא מדויקים.`,
                            { duration: 8000 }
                        );
                    }
                    return; // Exit early if user declined
                }
                
                // Log before checking ExternalDataService
                if (window.Logger) {
                    window.Logger.info('✅ User confirmed - checking ExternalDataService availability', { 
                        page: 'trade-history-page',
                        tickerId,
                        tickerSymbol,
                        hasExternalDataService: !!window.ExternalDataService,
                        hasRefreshTickerData: !!(window.ExternalDataService && typeof window.ExternalDataService.refreshTickerData === 'function'),
                        externalDataServiceType: window.ExternalDataService ? typeof window.ExternalDataService : 'undefined',
                        refreshTickerDataType: window.ExternalDataService && window.ExternalDataService.refreshTickerData ? typeof window.ExternalDataService.refreshTickerData : 'undefined'
                    });
                }
                
                if (!window.ExternalDataService) {
                    if (window.Logger) {
                        window.Logger.error('❌ ExternalDataService not available', { 
                            page: 'trade-history-page',
                            tickerId,
                            tickerSymbol
                        });
                    }
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError('שגיאה', 'שירות נתונים חיצוני לא זמין. נא לרענן את העמוד.');
                    }
                    return;
                }
                
                if (typeof window.ExternalDataService.refreshTickerData !== 'function') {
                    if (window.Logger) {
                        window.Logger.error('❌ refreshTickerData function not available', { 
                            page: 'trade-history-page',
                            tickerId,
                            tickerSymbol,
                            externalDataServiceKeys: window.ExternalDataService ? Object.keys(window.ExternalDataService) : []
                        });
                    }
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError('שגיאה', 'פונקציית טעינת נתונים לא זמינה. נא לרענן את העמוד.');
                    }
                    return;
                }
                
                // Fetch historical data with full progress tracking (like ticker dashboard)
                const overlayId = `fetchHistoricalData-${tickerId}`;
                // Use same variable name as ticker_dashboard.js (lowercase)
                const progressManager = window.unifiedProgressManager || window.UnifiedProgressManager;
                
                if (window.Logger) {
                    window.Logger.info('🚀 Starting historical data fetch with progress tracking', { 
                        page: 'trade-history-page',
                        tickerId,
                        tickerSymbol,
                        overlayId,
                        hasProgressManager: !!progressManager,
                        progressManagerType: progressManager ? typeof progressManager : 'undefined',
                        hasCreateOverlay: progressManager && typeof progressManager.createOverlay === 'function',
                        hasShowProgress: progressManager && typeof progressManager.showProgress === 'function',
                        progressManagerKeys: progressManager ? Object.keys(progressManager).slice(0, 10) : []
                    });
                }
                
                // Create progress overlay with steps (like ticker dashboard)
                const steps = ['טוען נתונים היסטוריים', 'מעבד ומאמת נתונים', 'מעדכן עמוד'];
                const descriptions = [
                    'מתחבר לספק הנתונים החיצוני, טוען נתונים היסטוריים...',
                    'בודק שכל הנתונים קיימים...',
                    'מעדכן את העמוד עם הנתונים החדשים...'
                ];
                
                if (progressManager && typeof progressManager.createOverlay === 'function') {
                    if (window.Logger) {
                        window.Logger.info('📊 Creating progress overlay', { 
                            page: 'trade-history-page',
                            overlayId,
                            totalSteps: steps.length,
                            steps,
                            descriptions
                        });
                    }
                    try {
                        progressManager.createOverlay(overlayId, {
                            title: `טעינת נתונים עבור ${tickerSymbol}`,
                            totalSteps: steps.length,
                            stepLabels: steps,
                            stepDescriptions: descriptions
                        });
                        if (window.Logger) {
                            window.Logger.info('✅ Progress overlay created successfully', { 
                                page: 'trade-history-page',
                                overlayId
                            });
                        }
                    } catch (overlayError) {
                        if (window.Logger) {
                            window.Logger.error('❌ Error creating progress overlay', { 
                                page: 'trade-history-page',
                                overlayId,
                                error: overlayError?.message || overlayError
                            });
                        }
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Progress manager not available or createOverlay not found', { 
                            page: 'trade-history-page',
                            hasProgressManager: !!progressManager,
                            progressManagerType: progressManager ? typeof progressManager : 'undefined',
                            hasCreateOverlay: progressManager && typeof progressManager.createOverlay === 'function',
                            progressManagerKeys: progressManager ? Object.keys(progressManager).slice(0, 20) : []
                        });
                    }
                }
                
                // Fetch data with progress tracking
                try {
                    // Step 1: Fetch data from external provider
                    if (window.Logger) {
                        window.Logger.info('📊 Step 1/3: Fetching historical data from external provider...', { 
                            tickerId, 
                            tickerSymbol,
                            page: 'trade-history-page' 
                        });
                    }
                    if (progressManager) {
                        if (typeof progressManager.showProgress === 'function') {
                            if (window.Logger) {
                                window.Logger.info('📊 Showing progress step 1/3', { 
                                    page: 'trade-history-page',
                                    overlayId,
                                    step: 1
                                });
                            }
                            progressManager.showProgress(
                                overlayId,
                                1,
                                `טוען נתונים היסטוריים עבור ${tickerSymbol}...`,
                                'מתחבר לספק הנתונים החיצוני...'
                            );
                        } else {
                            if (window.Logger) {
                                window.Logger.warn('⚠️ showProgress function not available', { 
                                    page: 'trade-history-page',
                                    overlayId
                                });
                            }
                        }
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Progress manager not available for step 1', { 
                                page: 'trade-history-page',
                                overlayId
                            });
                        }
                    }
                    
                    // Calculate days back needed
                    const daysDiff = Math.ceil((checkEndDate - checkStartDate) / (1000 * 60 * 60 * 24));
                    const daysBack = Math.max(daysDiff, 150); // At least 150 days for technical indicators
                    
                    const refreshResult = await window.ExternalDataService.refreshTickerData(tickerId, {
                        forceRefresh: false,
                        includeHistorical: true,
                        daysBack: daysBack
                    });
                    
                    if (window.Logger) {
                        window.Logger.info('✅ Step 1 completed: Historical data fetched from provider', { 
                            page: 'trade-history-page',
                            tickerId,
                            daysBack,
                            missingDatesCount: missingDates.length,
                            missingDataTypes,
                            refreshResult
                        });
                    }
                    
                    // Invalidate all related caches after data is saved to database
                    // This ensures we get fresh data from backend after refresh
                    if (window.UnifiedCacheManager) {
                        if (window.Logger) {
                            window.Logger.info('🔄 Invalidating caches after data refresh', { 
                                page: 'trade-history-page',
                                tickerId
                            });
                        }
                        // Invalidate ticker-related caches
                        await window.UnifiedCacheManager.invalidate(`ticker-${tickerId}`, 'all');
                        await window.UnifiedCacheManager.invalidate(`ticker-dashboard-${tickerId}`, 'all');
                        // Invalidate trade history caches
                        await window.UnifiedCacheManager.invalidate(`trade-history-timeline-${tradeId}`, 'all');
                        await window.UnifiedCacheManager.invalidate(`trade-history-chart-data-${tradeId}`, 'all');
                        await window.UnifiedCacheManager.invalidate(`trade-history-full-analysis-${tradeId}`, 'all');
                        await window.UnifiedCacheManager.invalidate(`trade-history-statistics-${tradeId}`, 'all');
                        // Invalidate external data caches
                        await window.UnifiedCacheManager.invalidate(`external-data-quotes-${tickerId}`, 'all');
                        await window.UnifiedCacheManager.invalidate(`external-data-quotes-${tickerId}-history`, 'all');
                    }
                    
                    // Step 2: Wait for backend to process and verify all data is available
                    if (window.Logger) {
                        window.Logger.info('📊 Step 2/3: Waiting for data processing and verification...', { 
                            tickerId, 
                            page: 'trade-history-page',
                            overlayId
                        });
                    }
                    if (progressManager) {
                        if (typeof progressManager.showProgress === 'function') {
                            if (window.Logger) {
                                window.Logger.info('📊 Showing progress step 2/3', { 
                                    page: 'trade-history-page',
                                    overlayId,
                                    step: 2
                                });
                            }
                            progressManager.showProgress(
                                overlayId,
                                2,
                                `מעבד ומאמת נתונים עבור ${tickerSymbol}...`,
                                'בודק שכל הנתונים קיימים...'
                            );
                        } else {
                            if (window.Logger) {
                                window.Logger.warn('⚠️ showProgress function not available for step 2', { 
                                    page: 'trade-history-page',
                                    overlayId
                                });
                            }
                        }
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Progress manager not available for step 2', { 
                                page: 'trade-history-page',
                                overlayId
                            });
                        }
                    }
                    
                    // Wait for backend to process - longer wait for historical data
                    // Check data availability with retries
                    let updatedChartData = null;
                    let retryCount = 0;
                    const maxRetries = 10;
                    const retryDelay = 5000; // 5 seconds between retries
                    const initialWait = 10000; // Wait 10 seconds before first check
                    
                    // Initial wait to allow backend to process and save data
                    if (window.Logger) {
                        window.Logger.info('⏳ Waiting for backend to process data before checking...', { 
                            tickerId, 
                            waitSeconds: initialWait / 1000, 
                            page: 'trade-history-page' 
                        });
                    }
                    await new Promise(resolve => setTimeout(resolve, initialWait));
                    
                    while (retryCount < maxRetries) {
                        // Wait before checking (except first iteration which already waited)
                        if (retryCount > 0) {
                            await new Promise(resolve => setTimeout(resolve, retryDelay));
                        }
                        
                        if (progressManager) {
                            const progressPercent = Math.min(75, 50 + (retryCount / maxRetries) * 25); // 50-75% during verification
                            progressManager.updateProgress(
                                overlayId,
                                progressPercent,
                                `בודק נתונים עבור ${tickerSymbol}... (${retryCount + 1}/${maxRetries})`
                            );
                        }
                        
                        // Invalidate cache before reloading
                        if (window.UnifiedCacheManager) {
                            await window.UnifiedCacheManager.invalidate(`trade-history-chart-data-${tradeId}`, 'indexedDB');
                            await window.UnifiedCacheManager.invalidate(`trade-history-full-analysis-${tradeId}`, 'indexedDB');
                        }
                        
                        // Reload chart data with force refresh
                        if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeChartData === 'function') {
                            const previousChartData = updatedChartData;
                            updatedChartData = await window.TradeHistoryData.loadTradeChartData(tradeId, {
                                days_before: 7,
                                days_after: 7,
                                force: true // Force refresh to get latest data
                            });
                            
                            // Check if we have market prices now
                            const hasMarketPrices = updatedChartData && 
                                                   updatedChartData.market_prices && 
                                                   Array.isArray(updatedChartData.market_prices) &&
                                                   updatedChartData.market_prices.length > 0;
                            
                            // Check if data has improved
                            const hasImproved = previousChartData ? (
                                (!previousChartData.market_prices || previousChartData.market_prices.length === 0) && hasMarketPrices
                            ) : true; // First iteration - assume improvement
                            
                            if (window.Logger) {
                                window.Logger.info(`📊 Data check attempt ${retryCount + 1}/${maxRetries}`, { 
                                    tickerId, 
                                    hasChartData: !!updatedChartData,
                                    hasMarketPrices: hasMarketPrices,
                                    marketPricesCount: updatedChartData?.market_prices?.length || 0,
                                    hasImproved: hasImproved,
                                    page: 'trade-history-page' 
                                });
                            }
                            
                            // If we have market prices, break
                            if (hasMarketPrices) {
                                if (window.Logger) {
                                    window.Logger.info('✅ All required data is now available', { 
                                        tickerId, 
                                        page: 'trade-history-page' 
                                    });
                                }
                                break;
                            }
                            
                            // If data hasn't improved after 3 attempts, stop trying
                            if (retryCount >= 3 && !hasImproved && previousChartData) {
                                if (window.Logger) {
                                    window.Logger.info('ℹ️ Data not improving after multiple attempts, stopping retries', { 
                                        tickerId, 
                                        retryCount,
                                        page: 'trade-history-page' 
                                    });
                                }
                                break;
                            }
                            
                            retryCount++;
                        } else {
                            throw new Error('TradeHistoryData service not available');
                        }
                    }
                    
                    // Step 3: Reload trade analysis and re-render page
                    if (window.Logger) {
                        window.Logger.info('📊 Step 3/3: Reloading trade analysis and re-rendering...', { 
                            tickerId, 
                            page: 'trade-history-page' 
                        });
                    }
                    if (progressManager) {
                        progressManager.showProgress(
                            overlayId,
                            3,
                            `מסיים טעינת נתונים עבור ${tickerSymbol}...`,
                            'מעדכן את העמוד עם הנתונים החדשים...'
                        );
                    }
                    
                    // Final check - if still missing data, log warning but continue
                    if (updatedChartData) {
                        const finalHasMarketPrices = updatedChartData.market_prices && 
                                                     Array.isArray(updatedChartData.market_prices) &&
                                                     updatedChartData.market_prices.length > 0;
                        if (!finalHasMarketPrices) {
                            if (window.Logger) {
                                window.Logger.warn('⚠️ Some data still missing after data fetch', { 
                                    tickerId, 
                                    tickerSymbol,
                                    page: 'trade-history-page' 
                                });
                            }
                        }
                    }
                    
                    // Step 3: Reload trade analysis and re-render page with new data
                    if (window.Logger) {
                        window.Logger.info('📊 Step 3/3: Reloading trade analysis and re-rendering page...', { 
                            tickerId, 
                            tradeId,
                            page: 'trade-history-page',
                            overlayId
                        });
                    }
                    if (progressManager && typeof progressManager.showProgress === 'function') {
                        if (window.Logger) {
                            window.Logger.info('📊 Showing progress step 3/3', { 
                                page: 'trade-history-page',
                                overlayId,
                                step: 3
                            });
                        }
                        progressManager.showProgress(
                            overlayId,
                            3,
                            `מעדכן עמוד עבור ${tickerSymbol}...`,
                            'טוען נתונים ומציג את העמוד מחדש...'
                        );
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Progress manager or showProgress not available for step 3', { 
                                page: 'trade-history-page',
                                overlayId,
                                hasProgressManager: !!progressManager,
                                hasShowProgress: progressManager && typeof progressManager.showProgress === 'function'
                            });
                        }
                    }
                    
                    // Invalidate all related caches before reloading
                    if (window.UnifiedCacheManager) {
                        await window.UnifiedCacheManager.invalidate(`trade-history-timeline-${tradeId}`, 'indexedDB');
                        await window.UnifiedCacheManager.invalidate(`trade-history-chart-data-${tradeId}`, 'indexedDB');
                        await window.UnifiedCacheManager.invalidate(`trade-history-full-analysis-${tradeId}`, 'indexedDB');
                        await window.UnifiedCacheManager.invalidate(`trade-history-statistics-${tradeId}`, 'indexedDB');
                    }
                    
                    // Reload trade analysis with new data (this will re-render the entire page)
                    // IMPORTANT: Pass flag to prevent recursive checkAndFetchMissingHistoricalPrices call
                    if (tradeId) {
                        // Temporarily set flag to prevent recursive call
                        const wasFetching = isFetchingHistoricalData;
                        const wasCurrentTicker = currentFetchTickerId;
                        // Keep flags set to prevent recursive call
                        await loadTradeForAnalysis(tradeId, { skipMissingDataCheck: true });
                        // Restore flags after load completes
                        isFetchingHistoricalData = wasFetching;
                        currentFetchTickerId = wasCurrentTicker;
                    }
                    
                    // Hide progress overlay after a short delay to show completion
                    if (progressManager) {
                        // Small delay to show completion message
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (typeof progressManager.hideProgress === 'function') {
                            progressManager.hideProgress(overlayId);
                        } else if (typeof progressManager.removeOverlay === 'function') {
                            progressManager.removeOverlay(overlayId);
                        }
                    }
                    
                    if (window.Logger) {
                        window.Logger.info('✅ Data fetch and verification completed', { 
                            tickerId, 
                            hasChartData: !!updatedChartData,
                            hasMarketPrices: updatedChartData?.market_prices?.length > 0,
                            retriesUsed: retryCount + 1,
                            page: 'trade-history-page' 
                        });
                    }
                    
                    // Show success notification with data status
                    if (window.NotificationSystem) {
                        const finalHasData = updatedChartData && 
                                             updatedChartData.market_prices && 
                                             Array.isArray(updatedChartData.market_prices) &&
                                             updatedChartData.market_prices.length > 0;
                        
                        if (finalHasData) {
                            window.NotificationSystem.showSuccess(
                                'נתונים נטענו בהצלחה', 
                                `נתונים היסטוריים עבור ${tickerSymbol} נטענו והעמוד עודכן`,
                                { duration: 5000 }
                            );
                        } else {
                            window.NotificationSystem.showWarning(
                                'נתונים חלקיים', 
                                `חלק מהנתונים עבור ${tickerSymbol} עדיין חסרים. העמוד עודכן עם הנתונים הזמינים`,
                                { duration: 8000 }
                            );
                        }
                    }
                } catch (fetchError) {
                    if (window.Logger) {
                        window.Logger.error('❌ Error fetching historical data', { 
                            page: 'trade-history-page',
                            tickerId,
                            error: fetchError?.message || fetchError 
                        });
                    }
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError('שגיאה', `שגיאה בטעינת נתונים היסטוריים: ${fetchError?.message || 'שגיאה לא ידועה'}`);
                    }
                    // Hide progress on error
                    const progressManagerError = window.UnifiedProgressManager || window.unifiedProgressManager;
                    if (progressManagerError) {
                        if (typeof progressManagerError.hideProgress === 'function') {
                            progressManagerError.hideProgress(overlayId);
                        } else if (typeof progressManagerError.removeOverlay === 'function') {
                            progressManagerError.removeOverlay(overlayId);
                        }
                    }
                }
            } else {
                if (window.Logger) {
                    window.Logger.debug('✅ All historical price data is available', { 
                        page: 'trade-history-page',
                        tickerId,
                        dateRange: { start: checkStartDate, end: checkEndDate }
                    });
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error in checkAndFetchMissingHistoricalPrices', { 
                    page: 'trade-history-page',
                    tickerId,
                    error: error?.message || error 
                });
            }
        } finally {
            // Always reset flags, even on error
            isFetchingHistoricalData = false;
            currentFetchTickerId = null;
        }
    }
    
    /**
     * Show confirmation dialog for missing historical data
     * @param {string} tickerSymbol - Ticker symbol
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<boolean>} True if user approved
     */
    async function showMissingHistoricalDataConfirmation(tickerSymbol, startDate, endDate, missingDates = [], missingDataTypes = {}) {
        return new Promise((resolve) => {
            const startDateStr = window.FieldRendererService?.renderDate(startDate, false) || startDate.toLocaleDateString('he-IL');
            const endDateStr = window.FieldRendererService?.renderDate(endDate, false) || endDate.toLocaleDateString('he-IL');
            
            // Build summary message
            let message = `<div style="text-align: right; direction: rtl;">`;
            message += `<p><strong>חסרים נתוני מחיר היסטוריים עבור ${tickerSymbol}</strong></p>`;
            message += `<p><strong>📅 טווח זמן:</strong> ${startDateStr} - ${endDateStr}</p>`;
            
            // Summary of missing data
            const totalMissing = missingDataTypes.total || missingDates.length;
            const missingOHLC = (missingDataTypes.open || 0) + (missingDataTypes.high || 0) + (missingDataTypes.low || 0) + (missingDataTypes.close || 0);
            
            message += `<p><strong>📊 סיכום נתונים חסרים:</strong></p>`;
            message += `<ul>`;
            if (totalMissing > 0) {
                message += `<li><strong>תאריכים חסרים לחלוטין:</strong> ${totalMissing} תאריכים</li>`;
            }
            if (missingOHLC > 0) {
                message += `<li><strong>נתוני OHLC חלקיים:</strong> ${missingOHLC} שדות חסרים</li>`;
                if (missingDataTypes.open > 0) message += `<li>  - מחיר פתיחה: ${missingDataTypes.open}</li>`;
                if (missingDataTypes.high > 0) message += `<li>  - מחיר גבוה: ${missingDataTypes.high}</li>`;
                if (missingDataTypes.low > 0) message += `<li>  - מחיר נמוך: ${missingDataTypes.low}</li>`;
                if (missingDataTypes.close > 0) message += `<li>  - מחיר סגירה: ${missingDataTypes.close}</li>`;
            }
            message += `</ul>`;
            
            // Show sample of missing dates (max 10)
            if (missingDates.length > 0) {
                const sampleDates = missingDates.slice(0, 10).map(d => {
                    return window.FieldRendererService?.renderDate(d, false) || d.toLocaleDateString('he-IL');
                });
                message += `<p><strong>דוגמאות תאריכים חסרים:</strong></p>`;
                message += `<div style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-top: 10px; background-color: #f9f9f9;">`;
                message += `<ul style="margin: 0; padding-right: 20px;">`;
                sampleDates.forEach(dateStr => {
                    message += `<li>${dateStr}</li>`;
                });
                if (missingDates.length > 10) {
                    message += `<li><em>...ועוד ${missingDates.length - 10} תאריכים</em></li>`;
                }
                message += `</ul></div>`;
            }
            
            message += `<p><strong>האם לטעון נתונים היסטוריים מהספק החיצוני?</strong></p>`;
            message += `<p><em>הערה: רק הנתונים החסרים ייטענו. נתונים קיימים יישמרו.</em></p>`;
            message += `</div>`;
            
            if (window.NotificationSystem && typeof window.NotificationSystem.showConfirmation === 'function') {
                window.NotificationSystem.showConfirmation(
                    'נתונים היסטוריים חסרים',
                    message,
                    () => resolve(true),
                    () => resolve(false)
                );
            } else if (window.showConfirmationDialog && typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    'נתונים היסטוריים חסרים',
                    message,
                    () => resolve(true),
                    () => resolve(false)
                );
            } else {
                resolve(confirm(message.replace(/<[^>]*>/g, ''))); // Strip HTML for plain confirm
            }
        });
    }

    /**
     * Load trade for analysis
     * @param {number} tradeId - Trade ID
     * @param {Object} options - Options
     * @param {boolean} options.skipMissingDataCheck - Skip checking for missing historical data (to prevent recursive calls)
     */
    async function loadTradeForAnalysis(tradeId, options = {}) {
        if (window.Logger) {
            window.Logger.info(`Loading trade ${tradeId} for analysis...`, { page: 'trade-history-page', tradeId });
        }
        
        try {
            // 1. Try to load full analysis first (includes trade data, timeline, chart, statistics)
            let fullAnalysis = null;
            let tradeData = null;
            let timelineData = [];
            let planVsExecution = null;
            
            // === EOD INTEGRATION: Try EOD data first for trade analysis ===
            let eodTradeMetrics = null;
            try {
                if (tradeId) {
                    eodTradeMetrics = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
                        null, // global user
                        {
                            date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
                            date_to: new Date().toISOString().split('T')[0]
                        }
                    );

                    if (eodTradeMetrics && eodTradeMetrics.data && Array.isArray(eodTradeMetrics.data) && eodTradeMetrics.data.length > 0) {
                        if (window.Logger) {
                            window.Logger.info('✅ Using EOD data for trade analysis', {
                                page: 'trade-history-page',
                                tradeId,
                                recordCount: eodTradeMetrics.data.length
                            });
                        }
                    }
                }
            } catch (eodError) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ EOD trade metrics not available, falling back to regular analysis', {
                        page: 'trade-history-page',
                        tradeId,
                        error: eodError.message
                    });
                }
            }

            // Use new API endpoint for full analysis if available
            if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeFullAnalysis === 'function') {
                try {
                    fullAnalysis = await window.TradeHistoryData.loadTradeFullAnalysis(tradeId, {
                        days_before: 7,
                        days_after: 7,
                        include_durations: true,
                        force: false // Use cache if available
                    });
                    
                    // Extract trade data from fullAnalysis metadata if available
                    if (fullAnalysis && fullAnalysis.metadata && fullAnalysis.metadata.trade_data) {
                        tradeData = fullAnalysis.metadata.trade_data;
                        if (window.Logger) {
                            window.Logger.debug('Loaded tradeData from fullAnalysis metadata', { 
                                page: 'trade-history-page', 
                                tradeId: tradeData.id,
                                tickerSymbol: tradeData.ticker_symbol
                            });
                        }
                    } else if (fullAnalysis && fullAnalysis.trade) {
                        // Fallback for older API versions
                        tradeData = fullAnalysis.trade;
                        if (window.Logger) {
                            window.Logger.debug('Loaded tradeData from fullAnalysis.trade (fallback)', { 
                                page: 'trade-history-page', 
                                tradeId: tradeData.id,
                                tickerSymbol: tradeData.ticker_symbol
                            });
                        }
                    } else if (fullAnalysis && fullAnalysis.metadata) {
                        // If metadata exists but no trade_data, create minimal tradeData from metadata
                        // This allows the code to continue even if backend doesn't return full trade_data
                        const metadata = fullAnalysis.metadata;
                        tradeData = {
                            id: tradeId,
                            ticker_id: metadata.ticker_id,
                            ticker_symbol: metadata.trade_symbol,
                            ticker: metadata.ticker_id ? { id: metadata.ticker_id, symbol: metadata.trade_symbol } : null
                        };
                        if (window.Logger) {
                            window.Logger.debug('Created minimal tradeData from metadata', { 
                                page: 'trade-history-page', 
                                tradeId: tradeData.id,
                                tickerId: tradeData.ticker_id,
                                tickerSymbol: tradeData.ticker_symbol
                            });
                        }
                    }
                    
                    if (fullAnalysis && fullAnalysis.timeline && Array.isArray(fullAnalysis.timeline)) {
                        // Use timeline data from backend (includes all calculated metrics)
                        timelineData = fullAnalysis.timeline;
                        if (window.Logger) {
                            window.Logger.debug('Loaded timeline from API', { 
                                page: 'trade-history-page', 
                                items: timelineData.length,
                                hasUnrealizedPL: timelineData.some(p => p.unrealizedPL !== undefined && p.unrealizedPL !== null && p.unrealizedPL !== 0),
                                hasPositionValue: timelineData.some(p => p.positionValue !== undefined && p.positionValue !== null && p.positionValue !== 0),
                                hasAveragePrice: timelineData.some(p => p.averagePrice !== undefined && p.averagePrice !== null && p.averagePrice !== 0)
                            });
                        }
                        
                        // Store timeline data, chart data, and statistics in window.tradeHistoryData
                        if (!window.tradeHistoryData) {
                            window.tradeHistoryData = {};
                        }
                        window.tradeHistoryData.timelineData = timelineData;
                        
                        // Store chart data if available
                        if (fullAnalysis.chart_data) {
                            window.tradeHistoryData.chartData = fullAnalysis.chart_data;
                            if (window.Logger) {
                                window.Logger.debug('Stored chart data from full analysis', { 
                                    page: 'trade-history-page',
                                    hasMarketPrices: !!fullAnalysis.chart_data.market_prices,
                                    marketPricesCount: fullAnalysis.chart_data.market_prices?.length || 0
                                });
                            }
                        }
                        
                        // Store statistics if available
                        if (fullAnalysis.statistics) {
                            window.tradeHistoryData.statistics = fullAnalysis.statistics;
                            if (window.Logger) {
                                window.Logger.debug('Stored statistics from full analysis', { 
                                    page: 'trade-history-page',
                                    hasStatistics: !!fullAnalysis.statistics,
                                    statisticsKeys: Object.keys(fullAnalysis.statistics || {})
                                });
                            }
                        }
                        
                        // Store plan vs execution if available
                        if (fullAnalysis.plan_vs_execution) {
                            planVsExecution = fullAnalysis.plan_vs_execution;
                            window.tradeHistoryData.planVsExecution = planVsExecution;
                            if (window.Logger) {
                                window.Logger.debug('Loaded plan vs execution from full analysis', { 
                                    page: 'trade-history-page', 
                                    hasAnalysis: !!planVsExecution?.analysis 
                                });
                            }
                        }
                        
                        // Store full analysis for reference
                        window.tradeHistoryData.fullAnalysis = fullAnalysis;
                        
                        // Store tradeData in metadata for easy access
                        if (tradeData) {
                            window.tradeHistoryData.tradeData = tradeData;
                            
                            // Check for missing historical prices and offer to fetch them
                            // Skip if skipMissingDataCheck is true (to prevent recursive calls during data fetch)
                            if (!options.skipMissingDataCheck && tradeData.ticker_id && timelineData.length > 0) {
                                await checkAndFetchMissingHistoricalPrices(tradeData.ticker_id, tradeData.ticker?.symbol || `#${tradeData.ticker_id}`, timelineData, tradeId);
                            }
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to load full analysis from API, using fallback', { 
                            page: 'trade-history-page', 
                            error: error?.message || error,
                            status: error?.status,
                            response: error?.response
                        });
                    }
                    
                    // Show error to user if it's a critical error (not 404)
                    if (error?.status !== 404 && window.NotificationSystem) {
                        const errorMsg = error?.message || 'שגיאה בטעינת נתוני טרייד';
                        window.NotificationSystem.showError('שגיאה', errorMsg);
                    }
                }
            }
            
            // Fallback: Fetch trade data if not loaded from fullAnalysis
            if (!tradeData) {
                if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                    try {
                        tradeData = await window.entityDetailsAPI.getEntityDetails('trade', tradeId, {
                            includeLinkedItems: true
                        });
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.warn('Failed to load trade data from EntityDetailsAPI', { 
                                page: 'trade-history-page', 
                                error: error?.message || error 
                            });
                        }
                    }
                }
                
                if (!tradeData) {
                    // Fallback: fetch directly from API
                    try {
                        const response = await fetch(`/api/trades/${tradeId}`, { });
                        if (response.ok) {
                            const data = await response.json();
                            tradeData = data?.data || data;
                        } else if (response.status === 404) {
                            throw new Error('Trade not found');
                        } else if (response.status === 401) {
                            throw new Error('Authentication required. Please log in.');
                        } else {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('Failed to load trade data', { 
                                page: 'trade-history-page', 
                                error: error?.message || error 
                            });
                        }
                        throw error;
                    }
                }
            }
            
            if (!tradeData) {
                throw new Error('Trade not found');
            }
            
            // Fallback: Create timeline data from linked items if API didn't return data
            // NOTE: This fallback should NOT recalculate metrics - backend should provide them
            // Only use this if backend API is not available
            if (timelineData.length === 0) {
                if (window.Logger) {
                    window.Logger.warn('No timeline data from API, creating fallback timeline from linked items', { 
                        page: 'trade-history-page' 
                    });
                }
                
                // Helper function to extract date
                const extractDateValue = (dateValue) => {
                    if (!dateValue) return null;
                    if (typeof dateValue === 'string') {
                        return dateValue;
                    } else if (dateValue.utc) {
                        return dateValue.utc;
                    } else if (dateValue instanceof Date) {
                        return dateValue.toISOString();
                    }
                    return null;
                };
                
                // Add trade creation event
                if (tradeData.created_at) {
                    timelineData.push({
                        id: `trade-${tradeData.id}`,
                        type: 'Trade',
                        date: extractDateValue(tradeData.created_at),
                        title: 'יצירת טרייד',
                        displayText: `טרייד #${tradeData.id} נוצר`,
                        created_at: tradeData.created_at,
                        trade_created_at: tradeData.created_at,
                        plan_created_at: tradeData.trade_plan?.created_at || null
                    });
                }
                
                // Add trade plan creation event (if exists and different from trade creation)
                if (tradeData.trade_plan && tradeData.trade_plan.created_at) {
                    const planDate = extractDateValue(tradeData.trade_plan.created_at);
                    const tradeDate = extractDateValue(tradeData.created_at);
                    // Only add if different from trade creation date
                    if (planDate && planDate !== tradeDate) {
                        timelineData.push({
                            id: `plan-${tradeData.trade_plan.id || 'unknown'}`,
                            type: 'Trade Plan',
                            date: planDate,
                            title: 'יצירת תכנון',
                            displayText: `תכנון #${tradeData.trade_plan.id || 'unknown'} נוצר`,
                            created_at: tradeData.trade_plan.created_at,
                            trade_created_at: tradeData.created_at,
                            plan_created_at: tradeData.trade_plan.created_at
                        });
                    }
                }
                
                // Add linked items (executions, notes, alerts, cash flows, alert activations)
                if (tradeData.linked_items && Array.isArray(tradeData.linked_items)) {
                    const linkedItemsTimeline = tradeData.linked_items
                    .filter(item => {
                        // Include all relevant types
                        return item.type === 'execution' || 
                               item.type === 'note' || 
                               item.type === 'alert' || 
                               item.type === 'cash_flow' ||
                               item.type === 'trade_plan' ||
                               item.type === 'trade';
                    })
                    .map(item => {
                        // Extract date properly - prioritize triggered_at for alerts, then execution_date, then created_at, then date
                        let date = null;
                        if (item.type === 'alert' && item.triggered_at) {
                            // Alert activation - use triggered_at
                            date = extractDateValue(item.triggered_at);
                        } else if (item.execution_date) {
                            date = extractDateValue(item.execution_date);
                        } else if (item.created_at) {
                            date = extractDateValue(item.created_at);
                        } else if (item.date) {
                            date = extractDateValue(item.date);
                        }
                        
                        // Determine type display name
                        let typeDisplay = item.type === 'execution' ? 'Execution' : 
                                         item.type === 'note' ? 'Note' :
                                         item.type === 'alert' ? (item.triggered_at ? 'Alert Activation' : 'Alert') :
                                         item.type === 'cash_flow' ? 'Cash Flow' :
                                         item.type === 'trade_plan' ? 'Trade Plan' :
                                         item.type === 'trade' ? 'Trade' : item.type;
                        
                        // Determine title/display text
                        let title = item.title || item.name || '';
                        if (item.type === 'alert' && item.triggered_at) {
                            title = title || 'הפעלת התראה';
                        } else if (item.type === 'alert') {
                            title = title || 'התראה';
                        } else if (item.type === 'note') {
                            title = title || 'הערה';
                        } else if (item.type === 'trade_plan') {
                            title = title || 'תכנון';
                        } else if (item.type === 'trade') {
                            title = title || 'טרייד';
                        }
                        
                        return {
                            id: item.id,
                            type: typeDisplay,
                            date: date,
                            side: item.side || item.action || null,
                            quantity: item.quantity || null,
                            price: item.price || null,
                            amount: item.amount || null,
                            pl: item.pl || item.realized_pl || null,
                            displayText: item.title || item.name || item.text || title,
                            title: title,
                            // Additional fields for executions
                            execution_date: item.execution_date || date,
                            action: item.action || item.side || null,
                            // Alert specific
                            triggered_at: item.triggered_at || null,
                            is_triggered: item.is_triggered || false,
                            // Creation dates for display
                            created_at: item.created_at || null,
                            trade_created_at: tradeData.created_at || null,
                            plan_created_at: tradeData.trade_plan?.created_at || null
                        };
                    });
                    
                    timelineData = timelineData.concat(linkedItemsTimeline);
                }
                
                // Sort all timeline data by date
                timelineData = timelineData
                    .sort((a, b) => {
                        // Sort by date (oldest first)
                        const dateA = new Date(a.date || 0);
                        const dateB = new Date(b.date || 0);
                        return dateA - dateB;
                    });
                    
                // NOTE: In fallback mode, we don't calculate metrics (unrealizedPL, positionValue, etc.)
                // because we don't have market price data. These should come from backend API.
                // Only calculate basic position and realized PL for display purposes
                if (timelineData.length > 0) {
                    let currentPosition = 0;
                    let cumulativeRealizedPL = 0;
                    
                    timelineData = timelineData.map((point, index) => {
                        // Update position based on execution
                        if (point.type === 'Execution') {
                            if (point.side === 'buy' || point.action === 'buy') {
                                currentPosition += (point.quantity || 0);
                            } else if (point.side === 'sell' || point.action === 'sell') {
                                currentPosition -= (point.quantity || 0);
                            }
                            cumulativeRealizedPL += (point.pl || 0);
                        }
                        
                        // In fallback mode, we can't calculate unrealizedPL without market prices
                        // Set to null/undefined so chart knows data is incomplete
                        return {
                            ...point,
                            positionSize: currentPosition,
                            realizedPL: cumulativeRealizedPL,
                            // Don't set unrealizedPL, positionValue, averagePrice in fallback mode
                            // These should come from backend
                            unrealizedPL: undefined,
                            positionValue: undefined,
                            averagePrice: undefined,
                            totalPL: cumulativeRealizedPL // Only realized PL available
                        };
                    });
                }
                
                if (window.Logger) {
                    window.Logger.debug('Created fallback timeline data from linked items (no backend metrics)', { 
                        page: 'trade-history-page', 
                        totalItems: tradeData.linked_items.length,
                        timelineItems: timelineData.length,
                        executions: timelineData.filter(t => t.type === 'Execution').length,
                        warning: 'Metrics (unrealizedPL, positionValue, averagePrice) not calculated - backend API should provide these'
                    });
                }
            }
            
            // 3. Ensure window.tradeHistoryData is initialized and contains all data
            // CRITICAL: This must be done before rendering to ensure all data is available
            if (!window.tradeHistoryData) {
                window.tradeHistoryData = {};
            }
            
            // Store timeline data (from fullAnalysis or fallback)
            if (timelineData && timelineData.length > 0) {
                window.tradeHistoryData.timelineData = timelineData;
            } else if (!window.tradeHistoryData.timelineData) {
                window.tradeHistoryData.timelineData = [];
            }
            
            // Ensure chartData is stored if available from fullAnalysis
            if (fullAnalysis && fullAnalysis.chart_data) {
                window.tradeHistoryData.chartData = fullAnalysis.chart_data;
            }
            
            // Store tradeData for easy access
            if (tradeData) {
                window.tradeHistoryData.tradeData = tradeData;
            }
            
            // Store statistics if available
            if (fullAnalysis && fullAnalysis.statistics) {
                window.tradeHistoryData.statistics = fullAnalysis.statistics;
            }
            
            // Store plan vs execution if available
            if (fullAnalysis && fullAnalysis.plan_vs_execution) {
                window.tradeHistoryData.planVsExecution = fullAnalysis.plan_vs_execution;
            }
            
            // Create tradeHistoryData object for rendering (local variable)
            const tradeHistoryData = {
                trades: [tradeData],
                count: 1,
                timelineData: window.tradeHistoryData.timelineData || timelineData || []
            };
            
            // Store globally for chart access
            window.tradeHistoryData.trades = tradeHistoryData.trades;
            window.tradeHistoryData.count = tradeHistoryData.count;
            
            if (window.tradeHistoryPage) {
                window.tradeHistoryPage.tradeHistoryData = window.tradeHistoryData;
            }
            
            if (window.Logger) {
                window.Logger.debug('Stored trade history data globally for chart', { 
                    page: 'trade-history-page',
                    timelineItems: timelineData.length,
                    hasChartData: !!window.tradeHistoryData.chartData,
                    hasMarketPrices: !!window.tradeHistoryData.chartData?.market_prices,
                    marketPricesCount: window.tradeHistoryData.chartData?.market_prices?.length || 0,
                    hasStatistics: !!window.tradeHistoryData.statistics,
                    hasTradeData: !!window.tradeHistoryData.tradeData,
                    hasTimelineData: !!(window.tradeHistoryData.timelineData && window.tradeHistoryData.timelineData.length > 0)
                });
            }
            
            // 4. Get statistics from fullAnalysis if available, otherwise calculate from trade data and timeline data
            let statistics = {};
            
            // If we have fullAnalysis with statistics, use them (backend calculated)
            if (fullAnalysis && fullAnalysis.statistics) {
                statistics = fullAnalysis.statistics;
                // Store in global object for consistency
                window.tradeHistoryData.statistics = statistics;
                if (window.Logger) {
                    window.Logger.debug('Using statistics from full analysis', {
                        page: 'trade-history-page',
                        statisticsKeys: Object.keys(statistics)
                    });
                }
            }

            // === EOD INTEGRATION: Enhance statistics with EOD data ===
            if (eodTradeMetrics && eodTradeMetrics.data && Array.isArray(eodTradeMetrics.data) && eodTradeMetrics.data.length > 0) {
                try {
                    // Calculate enhanced statistics using EOD data
                    const eodStats = calculateEODTradeStatistics(eodTradeMetrics.data, tradeData);
                    if (eodStats) {
                        // Merge EOD statistics with existing statistics
                        statistics = {
                            ...statistics,
                            ...eodStats,
                            // Mark that EOD data was used
                            dataSource: 'eod_enhanced'
                        };

                        if (window.Logger) {
                            window.Logger.info('✅ Enhanced statistics with EOD data', {
                                page: 'trade-history-page',
                                tradeId,
                                eodStatsKeys: Object.keys(eodStats)
                            });
                        }
                    }
                } catch (eodStatsError) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Failed to calculate EOD statistics, using regular statistics', {
                            page: 'trade-history-page',
                            tradeId,
                            error: eodStatsError.message
                        });
                    }
                }
            }

            if (!statistics || Object.keys(statistics).length === 0) {
                // Calculate duration in days
                // Main duration: from entry (opened_at) to close (closed_at)
                // Planning/waiting duration: from creation (created_at or trade_plan.created_at) to opening (opened_at)
                let durationDays = 0;
                let planningWaitDays = 0;
                
                try {
                // Helper function to extract date
                const extractDate = (dateValue) => {
                    if (!dateValue) return null;
                    if (typeof dateValue === 'string') {
                        return new Date(dateValue);
                    } else if (dateValue.utc) {
                        return new Date(dateValue.utc);
                    } else if (dateValue instanceof Date) {
                        return dateValue;
                    }
                    return null;
                };
                
                // Main duration: from entry to close
                let entryDate = null;
                let closeDate = null;
                
                // Entry date: opened_at, entry_date, or first execution date (buy action)
                if (tradeData.opened_at) {
                    entryDate = extractDate(tradeData.opened_at);
                } else if (tradeData.entry_date) {
                    entryDate = extractDate(tradeData.entry_date);
                } else if (timelineData && timelineData.length > 0) {
                    // Try to find first execution date (buy action)
                    const firstBuyExecution = timelineData.find(item => 
                        item.type === 'Execution' && 
                        (item.side === 'buy' || item.action === 'buy')
                    );
                    if (firstBuyExecution && firstBuyExecution.date) {
                        entryDate = extractDate(firstBuyExecution.date);
                    } else {
                        // Fallback: any first execution
                        const anyExecution = timelineData.find(item => item.type === 'Execution');
                        if (anyExecution && anyExecution.date) {
                            entryDate = extractDate(anyExecution.date);
                        } else {
                            // Last fallback: use created_at if no executions found
                            if (tradeData.created_at) {
                                entryDate = extractDate(tradeData.created_at);
                            }
                        }
                    }
                } else {
                    // No timeline data - use created_at as entry date
                    if (tradeData.created_at) {
                        entryDate = extractDate(tradeData.created_at);
                    }
                }
                
                // Close date: closed_at or last execution date (sell action)
                // For open trades, use the last entry date (opened_at or last execution) instead of current date
                if (tradeData.closed_at) {
                    closeDate = extractDate(tradeData.closed_at);
                } else if (timelineData && timelineData.length > 0) {
                    // Try to find last execution date (sell action)
                    const sellExecutions = timelineData.filter(item => 
                        item.type === 'Execution' && 
                        (item.side === 'sell' || item.action === 'sell')
                    );
                    if (sellExecutions.length > 0) {
                        // Get the last sell execution
                        const lastSellExecution = sellExecutions[sellExecutions.length - 1];
                        if (lastSellExecution && lastSellExecution.date) {
                            closeDate = extractDate(lastSellExecution.date);
                        }
                    }
                    
                    // For open trades: use the last execution date or opened_at, NOT current date
                    // This prevents incorrect duration calculations for open trades
                    if (!closeDate && entryDate) {
                        // Find the last execution date (any execution, not just sell)
                        const allExecutions = timelineData.filter(item => item.type === 'Execution');
                        if (allExecutions.length > 0) {
                            const lastExecution = allExecutions[allExecutions.length - 1];
                            if (lastExecution && lastExecution.date) {
                                closeDate = extractDate(lastExecution.date);
                            }
                        }
                        
                        // If still no close date, use opened_at (not current date)
                        if (!closeDate && tradeData.opened_at) {
                            closeDate = extractDate(tradeData.opened_at);
                        }
                        
                        // Only use current date as absolute last resort (should rarely happen)
                        if (!closeDate) {
                            closeDate = new Date();
                        }
                    }
                } else if (entryDate) {
                    // If no closed_at and no timeline data, use opened_at (not current date)
                    if (tradeData.opened_at) {
                        closeDate = extractDate(tradeData.opened_at);
                    } else {
                        // Only use current date as absolute last resort
                        closeDate = new Date();
                    }
                }
                
                if (entryDate && closeDate && !isNaN(entryDate.getTime()) && !isNaN(closeDate.getTime())) {
                    durationDays = Math.ceil((closeDate - entryDate) / (1000 * 60 * 60 * 24));
                    if (durationDays < 0) durationDays = 0;
                    
                    if (window.Logger) {
                        window.Logger.debug('Duration calculated', { 
                            page: 'trade-history-page', 
                            entryDate: entryDate.toISOString(),
                            closeDate: closeDate.toISOString(),
                            durationDays 
                        });
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.warn('Duration calculation failed - missing dates', { 
                            page: 'trade-history-page', 
                            hasEntryDate: !!entryDate,
                            hasCloseDate: !!closeDate,
                            entryDateValid: entryDate ? !isNaN(entryDate.getTime()) : false,
                            closeDateValid: closeDate ? !isNaN(closeDate.getTime()) : false,
                            tradeData: {
                                opened_at: tradeData.opened_at,
                                entry_date: tradeData.entry_date,
                                closed_at: tradeData.closed_at,
                                created_at: tradeData.created_at
                            }
                        });
                    }
                }
                
                // Planning/waiting duration: from creation to opening
                let creationDate = null;
                let openingDate = entryDate; // Use entry date as opening date
                
                // Creation date: trade created_at or trade_plan created_at (whichever is earlier)
                const tradeCreatedAt = tradeData.created_at ? extractDate(tradeData.created_at) : null;
                const planCreatedAt = tradeData.trade_plan?.created_at ? extractDate(tradeData.trade_plan.created_at) : null;
                
                if (tradeCreatedAt && planCreatedAt) {
                    // Use the earlier date
                    creationDate = tradeCreatedAt < planCreatedAt ? tradeCreatedAt : planCreatedAt;
                } else if (tradeCreatedAt) {
                    creationDate = tradeCreatedAt;
                } else if (planCreatedAt) {
                    creationDate = planCreatedAt;
                }
                
                if (creationDate && openingDate && !isNaN(creationDate.getTime()) && !isNaN(openingDate.getTime())) {
                    planningWaitDays = Math.ceil((openingDate - creationDate) / (1000 * 60 * 60 * 24));
                    if (planningWaitDays < 0) planningWaitDays = 0;
                }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Error calculating duration', { page: 'trade-history-page', error });
                    }
                    durationDays = 0;
                    planningWaitDays = 0;
                }
                
                // Get P/L from trade data - prioritize backend calculated values
                // Priority order:
                // 1. Backend statistics (from fullAnalysis.statistics)
                // 2. Timeline data (last point's P/L values)
                // 3. Trade data (realized_pl, unrealized_pl, total_pl)
                // 4. Calculate from available data
                
                let realizedPL = 0;
                let unrealizedPL = 0;
                let totalPL = 0;
                let totalPLPercent = 0;
                
                // First, try to get from timeline data (most accurate for current state)
                if (timelineData && timelineData.length > 0) {
                    const lastPoint = timelineData[timelineData.length - 1];
                    if (lastPoint) {
                        // Use P/L values from timeline if available
                        if (lastPoint.totalPL !== undefined && lastPoint.totalPL !== null) {
                            totalPL = lastPoint.totalPL;
                        }
                        if (lastPoint.realizedPL !== undefined && lastPoint.realizedPL !== null) {
                            realizedPL = lastPoint.realizedPL;
                        }
                        if (lastPoint.unrealizedPL !== undefined && lastPoint.unrealizedPL !== null) {
                            unrealizedPL = lastPoint.unrealizedPL;
                        }
                    }
                }
                
                // If timeline didn't provide values, try trade data
                if (totalPL === 0 && realizedPL === 0 && unrealizedPL === 0) {
                    realizedPL = tradeData.realized_pl || tradeData.realizedPL || 0;
                    unrealizedPL = tradeData.unrealized_pl || tradeData.unrealizedPL || 0;
                    totalPL = tradeData.total_pl || tradeData.totalPL || tradeData.pl || 0;
                    
                    // If totalPL is 0 but we have realized/unrealized, calculate it
                    if (totalPL === 0 && (realizedPL !== 0 || unrealizedPL !== 0)) {
                        totalPL = realizedPL + unrealizedPL;
                    }
                }
                
                // Calculate P/L percent if not provided
                totalPLPercent = tradeData.pl_percent || tradeData.total_pl_percent || 0;
                if (totalPLPercent === 0 && totalPL !== 0) {
                    // Try to calculate from entry price and quantity
                    const entryPrice = tradeData.entry_price || 0;
                    const quantity = tradeData.planned_quantity || tradeData.quantity || 0;
                    
                    if (entryPrice > 0 && quantity > 0) {
                        // Calculate percent: (P/L / (entry_price * quantity)) * 100
                        totalPLPercent = (totalPL / (entryPrice * quantity)) * 100;
                    } else if (timelineData && timelineData.length > 0) {
                        // Try to get average price from timeline executions
                        const executions = timelineData.filter(item => item.type === 'Execution');
                        if (executions.length > 0) {
                            let totalCost = 0;
                            let totalQuantity = 0;
                            executions.forEach(exec => {
                                const qty = exec.quantity || 0;
                                const price = exec.price || 0;
                                if (qty > 0 && price > 0) {
                                    totalCost += qty * price;
                                    totalQuantity += qty;
                                }
                            });
                            if (totalQuantity > 0 && totalCost > 0) {
                                const avgPrice = totalCost / totalQuantity;
                                totalPLPercent = (totalPL / totalCost) * 100;
                            }
                        }
                    }
                }
                
                if (window.Logger) {
                    window.Logger.debug('P/L values calculated', { 
                        page: 'trade-history-page',
                        realizedPL,
                        unrealizedPL,
                        totalPL,
                        totalPLPercent,
                        fromTimeline: timelineData && timelineData.length > 0 && timelineData[timelineData.length - 1]?.totalPL !== undefined
                    });
                }
                
                // Count executions from timeline data
                const executionCount = timelineData.filter(item => item.type === 'Execution').length;
                
                // Build statistics object
                statistics = {
                    durationDays: durationDays,
                    planningWaitDays: planningWaitDays,
                    totalPL: totalPL,
                    totalPLPercent: totalPLPercent,
                    executionCount: executionCount
                };
                
                // Try to load additional statistics from API (non-critical)
                if (tradeData.ticker_id) {
                    try {
                        if (window.Logger) {
                            window.Logger.debug('Loading additional statistics for ticker', { 
                                page: 'trade-history-page', 
                                tickerId: tradeData.ticker_id 
                            });
                        }
                        const apiStatistics = await window.TradeHistoryData?.loadStatistics({
                            ticker_id: tradeData.ticker_id
                        }) || {};
                        
                        // Merge API statistics (prefer calculated values if API doesn't provide them)
                        if (apiStatistics.total_trades) {
                            statistics.totalTrades = apiStatistics.total_trades;
                        }
                        if (apiStatistics.win_rate !== undefined) {
                            statistics.winRate = apiStatistics.win_rate;
                        }
                        if (apiStatistics.average_pl !== undefined) {
                            statistics.averagePL = apiStatistics.average_pl;
                        }
                        
                        if (window.Logger) {
                            window.Logger.debug('Additional statistics loaded successfully', { 
                                page: 'trade-history-page', 
                                hasStatistics: !!apiStatistics 
                            });
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.warn('Failed to load additional statistics (non-critical)', { 
                                page: 'trade-history', 
                                error: error?.message,
                                tickerId: tradeData.ticker_id
                            });
                        }
                    }
                }
                
                if (window.Logger) {
                    window.Logger.debug('Statistics calculated', { 
                        page: 'trade-history-page', 
                        statistics 
                    });
                }
            }
            
            // 5. Load plan vs execution analysis (if dates are available and not already loaded from fullAnalysis)
            
            // First, try to get from fullAnalysis
            if (fullAnalysis && fullAnalysis.plan_vs_execution) {
                planVsExecution = fullAnalysis.plan_vs_execution;
                window.tradeHistoryData.planVsExecution = planVsExecution;
                if (window.Logger) {
                    window.Logger.debug('Using plan vs execution from full analysis', { 
                        page: 'trade-history-page',
                        hasAnalysis: !!(planVsExecution && planVsExecution.analysis)
                    });
                }
            }
            
            // If not in fullAnalysis, try to load separately
            if ((!planVsExecution || !planVsExecution.analysis) && tradeData.created_at) {
                try {
                    // Convert dates to ISO format using dateUtils if available
                    let startDate = null;
                    let endDate = null;
                    
                    if (window.dateUtils && typeof window.dateUtils.toISOString === 'function') {
                        startDate = window.dateUtils.toISOString(tradeData.created_at);
                        endDate = window.dateUtils.toISOString(tradeData.closed_at) || new Date().toISOString();
                    } else {
                        // Fallback: try to extract ISO string from date envelope or convert Date
                        if (tradeData.created_at) {
                            if (typeof tradeData.created_at === 'string') {
                                startDate = tradeData.created_at;
                            } else if (tradeData.created_at.utc) {
                                startDate = tradeData.created_at.utc;
                            } else if (tradeData.created_at instanceof Date) {
                                startDate = tradeData.created_at.toISOString();
                            } else {
                                startDate = new Date(tradeData.created_at).toISOString();
                            }
                        }
                        
                        if (tradeData.closed_at) {
                            if (typeof tradeData.closed_at === 'string') {
                                endDate = tradeData.closed_at;
                            } else if (tradeData.closed_at.utc) {
                                endDate = tradeData.closed_at.utc;
                            } else if (tradeData.closed_at instanceof Date) {
                                endDate = tradeData.closed_at.toISOString();
                            } else {
                                endDate = new Date(tradeData.closed_at).toISOString();
                            }
                        } else {
                            endDate = new Date().toISOString();
                        }
                    }
                    
                    if (!startDate) {
                        throw new Error('Invalid start date');
                    }
                    
                    if (window.Logger) {
                        window.Logger.debug('Loading plan vs execution analysis', { 
                            page: 'trade-history-page', 
                            startDate, 
                            endDate 
                        });
                    }
                    
                    planVsExecution = await window.TradeHistoryData?.loadPlanVsExecution({
                        start_date: startDate,
                        end_date: endDate
                    }) || {};
                    
                    if (window.Logger) {
                        window.Logger.debug('Plan vs execution loaded successfully', { 
                            page: 'trade-history-page', 
                            hasAnalysis: !!planVsExecution?.analysis 
                        });
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to load plan vs execution (non-critical)', { 
                            page: 'trade-history', 
                            error: error?.message 
                        });
                    }
                }
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping plan vs execution - no created_at in trade data', { 
                        page: 'trade-history-page' 
                    });
                }
            }
            
            // 6. Update selected trade display
            if (window.Logger) {
                window.Logger.info('🔄 Starting UI rendering phase', { 
                    page: 'trade-history-page', 
                    tradeId,
                    hasTradeData: !!tradeData,
                    hasTimelineData: !!(timelineData && timelineData.length > 0),
                    hasStatistics: !!(statistics && Object.keys(statistics).length > 0),
                    hasPlanVsExecution: !!(planVsExecution && planVsExecution.analysis),
                    tradeHistoryDataTimelineLength: tradeHistoryData?.timelineData?.length || 0
                });
            }
            
            const display = document.getElementById('selectedTradeDisplay');
            const info = document.getElementById('selectedTradeInfo');
            if (display && info) {
                const tickerSymbol = tradeData.ticker?.symbol || tradeData.ticker_symbol || `טיקר #${tradeData.ticker_id || '?'}`;
                const investmentType = tradeData.investment_type || '';
                const investmentTypeText = window.FieldRendererService?.renderType 
                    ? window.FieldRendererService.renderType(investmentType)
                    : getInvestmentTypeText(investmentType);
                
                // Use safeSetInnerHTML to set HTML content (for badges)
                if (window.FieldRendererService?.renderType) {
                    safeSetInnerHTML(info, `טרייד #${tradeData.id} - ${tickerSymbol} (${investmentTypeText})`);
                } else {
                    info.textContent = `טרייד #${tradeData.id} - ${tickerSymbol} (${getInvestmentTypeText(investmentType)})`;
                }
                display.style.display = 'block';
                display.classList.remove('hidden');
            }
            
            // 7. Update UI with trade data
            if (window.Logger) {
                window.Logger.info('🎨 Rendering trade details', { 
                    page: 'trade-history-page', 
                    tradeId,
                    hasConditions: !!(tradeData.conditions && tradeData.conditions.length > 0)
                });
            }
            renderTradeDetails(tradeData, tradeData.conditions || []);
            
            if (statistics && Object.keys(statistics).length > 0) {
                if (window.Logger) {
                    window.Logger.info('📊 Rendering statistics', { 
                        page: 'trade-history-page',
                        statisticsKeys: Object.keys(statistics),
                        statistics
                    });
                }
                renderStatistics(statistics);
            } else {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Skipping statistics render - no statistics data', { 
                        page: 'trade-history-page',
                        hasStatistics: !!statistics,
                        statisticsKeys: statistics ? Object.keys(statistics) : []
                    });
                }
            }
            
            // 8. Update timeline and charts
            // Use timeline data from window.tradeHistoryData (which was set earlier) or fallback to local timelineData
            const timelineDataForRender = window.tradeHistoryData?.timelineData || tradeHistoryData?.timelineData || timelineData || [];
            
            if (window.Logger) {
                window.Logger.info('📈 Checking timeline data for rendering', { 
                    page: 'trade-history-page', 
                    hasTradeHistoryData: !!tradeHistoryData,
                    tradeHistoryDataTimelineLength: tradeHistoryData?.timelineData?.length || 0,
                    hasGlobalTimelineData: !!(window.tradeHistoryData && window.tradeHistoryData.timelineData),
                    globalTimelineDataLength: window.tradeHistoryData?.timelineData?.length || 0,
                    localTimelineDataLength: timelineData?.length || 0,
                    timelineDataForRenderLength: timelineDataForRender.length
                });
            }
            
            if (timelineDataForRender && timelineDataForRender.length > 0) {
                if (window.Logger) {
                    window.Logger.info('📊 Rendering timeline steps', { 
                        page: 'trade-history-page', 
                        timelineSteps: timelineDataForRender.length 
                    });
                }
                await renderTimelineSteps(timelineDataForRender);
                
                // Initialize timeline chart after rendering steps and ensuring data is available
                // Wait for both DOM and data to be ready
                setTimeout(async () => {
                    try {
                        // Double-check that timelineData is available globally
                        if (!window.tradeHistoryData || !window.tradeHistoryData.timelineData || window.tradeHistoryData.timelineData.length === 0) {
                            if (window.Logger) {
                                window.Logger.warn('Timeline data not available globally, waiting...', { 
                                    page: 'trade-history-page',
                                    hasGlobalData: !!window.tradeHistoryData,
                                    dataLength: window.tradeHistoryData?.timelineData?.length || 0,
                                    hasChartData: !!window.tradeHistoryData?.chartData
                                });
                            }
                            // Wait a bit more and check again
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            // Final check - if still no data, log error
                            if (!window.tradeHistoryData || !window.tradeHistoryData.timelineData || window.tradeHistoryData.timelineData.length === 0) {
                                if (window.Logger) {
                                    window.Logger.error('Timeline data still not available after wait', { 
                                        page: 'trade-history-page',
                                        hasGlobalData: !!window.tradeHistoryData,
                                        dataLength: window.tradeHistoryData?.timelineData?.length || 0,
                                        hasChartData: !!window.tradeHistoryData?.chartData,
                                        chartDataKeys: window.tradeHistoryData?.chartData ? Object.keys(window.tradeHistoryData.chartData) : []
                                    });
                                }
                                return; // Don't initialize chart without data
                            }
                        }
                        
                        const chartContainer = document.getElementById('timelineChart');
                        if (!chartContainer) {
                            if (window.Logger) {
                                window.Logger.error('Timeline chart container not found in DOM', { 
                                    page: 'trade-history-page'
                                });
                            }
                            return;
                        }
                        
                        if (typeof window.initTimelineChart !== 'function') {
                            if (window.Logger) {
                                window.Logger.error('initTimelineChart function not available', { 
                                    page: 'trade-history-page'
                                });
                            }
                            return;
                        }
                        
                        if (window.Logger) {
                            window.Logger.info('Initializing timeline chart with data', { 
                                page: 'trade-history-page',
                                dataPoints: window.tradeHistoryData?.timelineData?.length || 0,
                                hasChartData: !!window.tradeHistoryData?.chartData,
                                hasMarketPrices: !!window.tradeHistoryData?.chartData?.market_prices,
                                marketPricesCount: window.tradeHistoryData?.chartData?.market_prices?.length || 0
                            });
                        }
                        
                        await window.initTimelineChart();
                        
                        if (window.Logger) {
                            window.Logger.info('Timeline chart initialization completed', { 
                                page: 'trade-history-page'
                            });
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('Error initializing timeline chart', { 
                                page: 'trade-history-page', 
                                error: error?.message || error,
                                stack: error?.stack
                            });
                        }
                    }
                }, 1500); // Longer delay to ensure data is loaded
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping timeline render - no timeline data', { 
                        page: 'trade-history-page',
                        hasTimelineData: !!tradeHistoryData.timelineData,
                        timelineDataLength: tradeHistoryData.timelineData?.length || 0
                    });
                }
            }
            
            // 9. Update plan vs execution table
            if (window.Logger) {
                window.Logger.info('📋 Checking plan vs execution data', { 
                    page: 'trade-history-page',
                    hasPlanVsExecution: !!planVsExecution,
                    hasAnalysis: !!(planVsExecution && planVsExecution.analysis),
                    analysisLength: planVsExecution?.analysis?.length || 0
                });
            }
            
            if (planVsExecution && planVsExecution.analysis && Array.isArray(planVsExecution.analysis) && planVsExecution.analysis.length > 0) {
                if (window.Logger) {
                    window.Logger.info('📋 Rendering plan vs execution', { 
                        page: 'trade-history-page', 
                        analysisItems: planVsExecution.analysis.length 
                    });
                }
                // Use renderPlanVsExecution function to render the table
                await renderPlanVsExecution(planVsExecution.analysis);
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping plan vs execution render - no analysis data', { 
                        page: 'trade-history-page',
                        hasPlanVsExecution: !!planVsExecution,
                        hasAnalysis: !!(planVsExecution && planVsExecution.analysis),
                        analysisLength: planVsExecution?.analysis?.length || 0
                    });
                }
                // Clear table if no data
                const tableBody = document.getElementById('planVsExecutionTableBody');
                if (tableBody) {
                    safeSetInnerHTML(tableBody, '<tr><td colspan="5" class="text-center text-muted">אין נתוני תכנון מול ביצוע זמינים</td></tr>');
                }
            }
            
            // 10. Render linked items using EntityDetailsRenderer (like in entity details modal)
            try {
                if (window.Logger) {
                    window.Logger.info('🔗 Rendering linked items', { 
                        page: 'trade-history-page', 
                        tradeId,
                        hasLinkedItems: !!(tradeData.linked_items && tradeData.linked_items.length > 0),
                        linkedItemsCount: tradeData.linked_items?.length || 0
                    });
                }
                
                const linkedItemsContainer = document.getElementById('linkedItemsContainer');
                if (linkedItemsContainer && window.entityDetailsRenderer && typeof window.entityDetailsRenderer.renderLinkedItems === 'function') {
                    // Get linked items from tradeData (already loaded)
                    const linkedItems = tradeData.linked_items || [];
                    
                    // Get entity color for trade
                    const entityColor = window.getEntityColor && typeof window.getEntityColor === 'function'
                        ? window.getEntityColor('trade')
                        : '#6c757d';
                    
                    // Create sourceInfo for linked items
                    const sourceInfo = {
                        sourcePage: 'trade-history',
                        sourceType: 'trade',
                        sourceId: tradeId
                    };
                    
                    // Render linked items using EntityDetailsRenderer (same as entity details modal)
                    const linkedItemsHTML = window.entityDetailsRenderer.renderLinkedItems(
                        linkedItems,
                        entityColor,
                        'trade',
                        tradeId,
                        sourceInfo,
                        {
                            enablePagination: true,
                            pageSize: 25
                        }
                    );
                    
                    // Use safeSetInnerHTML to set the HTML
                    safeSetInnerHTML(linkedItemsContainer, linkedItemsHTML);
                    
                    if (window.Logger) {
                        window.Logger.debug('Linked items rendered successfully', { 
                            page: 'trade-history-page',
                            itemsCount: linkedItems.length 
                        });
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.warn('Linked items container or EntityDetailsRenderer not available', { 
                            page: 'trade-history-page', 
                            hasContainer: !!linkedItemsContainer,
                            hasRenderer: !!(window.entityDetailsRenderer && typeof window.entityDetailsRenderer.renderLinkedItems === 'function')
                        });
                    }
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to render linked items (non-critical)', { 
                        page: 'trade-history-page', 
                        error: error?.message 
                    });
                }
            }
            
            if (window.Logger) {
                window.Logger.info(`✅ Trade ${tradeId} loaded and rendered successfully`, { 
                    page: 'trade-history-page', 
                    tradeId,
                    hasStatistics: Object.keys(statistics).length > 0,
                    hasPlanVsExecution: !!(planVsExecution && planVsExecution.analysis),
                    hasTimeline: timelineData.length > 0,
                    hasLinkedItems: !!(tradeData.linked_items && tradeData.linked_items.length > 0),
                    hasChartData: !!(window.tradeHistoryData && window.tradeHistoryData.chartData),
                    renderingCompleted: true
                });
            }
            
            // Ensure all progress overlays are hidden after loading completes
            const progressManager = window.UnifiedProgressManager || window.unifiedProgressManager;
            if (progressManager) {
                // Hide any remaining progress overlays
                const allOverlayIds = ['fetchHistoricalData', 'tradeHistoryLoading'];
                for (const overlayIdPrefix of allOverlayIds) {
                    // Try to find and hide any overlay with this prefix
                    if (typeof progressManager.hideProgress === 'function') {
                        try {
                            progressManager.hideProgress(`${overlayIdPrefix}-${tradeData.ticker_id || 'unknown'}`);
                        } catch (e) {
                            // Ignore errors - overlay might not exist
                        }
                    }
                    if (typeof progressManager.removeOverlay === 'function') {
                        try {
                            progressManager.removeOverlay(`${overlayIdPrefix}-${tradeData.ticker_id || 'unknown'}`);
                        } catch (e) {
                            // Ignore errors - overlay might not exist
                        }
                    }
                }
            }
        } catch (error) {
            const errorMsg = error?.message || 'שגיאה בטעינת פרטי טרייד';
            if (window.Logger) {
                window.Logger.error('Error loading trade for analysis', { page: 'trade-history-page', tradeId, error });
            }
            
            // If trade not found, show ticker search modal
            if (errorMsg.includes('not found') || errorMsg.includes('404')) {
                if (window.NotificationSystem && typeof window.NotificationSystem.showWarning === 'function') {
                    window.NotificationSystem.showWarning('טרייד לא נמצא', 'הטרייד המבוקש לא נמצא במערכת. נא לבחור טיקר כדי למצוא טריידים.');
                }
                showTickerSearchModal();
            } else {
                if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                    window.NotificationSystem.showError('שגיאה בטעינת טרייד', errorMsg);
                }
            }
            throw error; // Re-throw to allow caller to handle
        }
    }
    
    /**
     * Show ticker search modal for finding trades
     * Uses ModalManagerV2 to create and show modal
     */
    async function showTickerSearchModal() {
        // Check if modal already exists
        let modal = document.getElementById('tradeHistoryTickerSearchModal');
        
        if (!modal) {
            // Create modal HTML with proper Bootstrap attributes for ModalManagerV2
            modal = document.createElement('div');
            modal.id = 'tradeHistoryTickerSearchModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'tradeHistoryTickerSearchModalLabel');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('data-bs-backdrop', 'false');
            modal.setAttribute('data-bs-keyboard', 'true');
            safeSetInnerHTML(modal, `
                <div class="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="tradeHistoryTickerSearchModalLabel">חיפוש טרייד - בחירת טיקר</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Step 1: Ticker Search -->
                            <div id="tradeHistoryStep1" class="mb-3">
                                <label for="tradeHistoryTickerSearch" class="form-label fw-bold">שלב 1: חיפוש טיקר מהמערכת</label>
                                <div class="alert alert-info d-flex justify-content-between align-items-center mb-2">
                                    <small class="mb-0">בחר טיקר כדי למצוא את הטריידים שלו</small>
                                    <button type="button" 
                                            class="btn btn-sm btn-outline-primary"
                                            data-onclick="if(window.ModalManagerV2){window.ModalManagerV2.showModal('tickersModal','add');}">
                                        <i class="bi bi-plus-circle"></i> הוסף טיקר חדש
                                    </button>
                                </div>
                                <div class="row g-2 align-items-end">
                                    <div class="col-md-12">
                                        <input type="text" 
                                               class="form-control" 
                                               id="tradeHistoryTickerSearch" 
                                               placeholder="הקלד symbol או שם...">
                                    </div>
                                </div>
                                <div id="tradeHistoryTickerSearchResults" class="mt-2">
                                    <!-- Ticker search results will appear here -->
                                </div>
                            </div>
                            
                            <!-- Step 2: Trades Selection (hidden initially) -->
                            <div id="tradeHistoryStep2" class="mb-3" style="display: none;">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <label class="form-label fw-bold mb-0">שלב 2: בחר טרייד</label>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="tradeHistoryBackToTickerSearch">
                                        <i class="bi bi-arrow-right"></i> חזור לחיפוש טיקר
                                    </button>
                                </div>
                                <div class="alert alert-info mb-2">
                                    <small class="mb-0" id="tradeHistorySelectedTickerInfo">טיקר נבחר: <strong id="tradeHistorySelectedTickerName"></strong></small>
                                </div>
                                <div id="tradeHistoryTradesResults" class="mt-2">
                                    <!-- Trades will appear here -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        </div>
                    </div>
                </div>
            `);
            document.body.appendChild(modal);
            
            // Register modal with ModalManagerV2 if available (for proper size, z-index, backdrop handling)
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.modals !== 'undefined') {
                // Register as dynamic modal
                window.ModalManagerV2.modals.set('tradeHistoryTickerSearchModal', {
                    element: modal,
                    config: null,
                    isActive: false,
                    isDynamic: true
                });
                window.Logger?.debug('Registered tradeHistoryTickerSearchModal with ModalManagerV2', { page: 'trade-history-page' });
            }
            
            // Initialize search functionality
            const searchInput = modal.querySelector('#tradeHistoryTickerSearch');
            const resultsContainer = modal.querySelector('#tradeHistoryTickerSearchResults');
            
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.trim();
                    clearTimeout(searchTimeout);
                    if (query.length >= 1) {
                        searchTimeout = setTimeout(() => {
                            searchTickerForTradeHistory(query, resultsContainer);
                        }, 300);
                    } else {
                        clearTickerSearchResults(resultsContainer);
                    }
                });
                
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const query = e.target.value.trim();
                        if (query.length >= 1) {
                            searchTickerForTradeHistory(query, resultsContainer);
                        }
                    }
                });
            }
        }
        
        // Show modal using ModalManagerV2 or Bootstrap
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
            try {
                await window.ModalManagerV2.showModal('tradeHistoryTickerSearchModal', 'view');
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error showing ticker search modal via ModalManagerV2', { page: 'trade-history', error });
                }
                // Fallback to Bootstrap
                if (bootstrap?.Modal) {
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                }
            }
        } else if (bootstrap?.Modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            if (window.Logger) {
                window.Logger.warn('Neither ModalManagerV2 nor Bootstrap Modal available', { page: 'trade-history' });
            }
        }
    }
    
    /**
     * Search ticker for trade history
     * @param {string} query - Search query
     * @param {HTMLElement} resultsContainer - Container for results
     */
    async function searchTickerForTradeHistory(query, resultsContainer) {
        if (!query || query.trim().length === 0) {
            clearTickerSearchResults(resultsContainer);
            return;
        }
        
        const searchQuery = query.trim();
        
        // Show loading indicator
        if (resultsContainer) {
            safeSetInnerHTML(resultsContainer, '<div class="text-center text-muted py-2"><i class="bi bi-hourglass-split me-2"></i>טוען...</div>');
        }
        
        try {
            // Fetch all tickers with their trade counts using the new endpoint
                const baseUrl = window.API_BASE_URL || (window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
                const separator = baseUrl.endsWith('/') ? '' : '/';
            const url = `${baseUrl}${separator}api/tickers/with-trade-counts?_ts=${Date.now()}`;
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }, });
                
            let allTickersWithCounts = [];
                if (response.ok) {
                    const payload = await response.json();
                allTickersWithCounts = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
                } else {
                    if (window.Logger) {
                    window.Logger.warn('Failed to load tickers with trade counts', { page: 'trade-history-page', status: response.status });
                }
            }
            
            // Filter tickers that match the query
            // Use includes instead of startsWith to find matches anywhere in the text
            // Show all tickers that match, even if trade_count is 0 (user might want to see all tickers)
            const queryUpper = searchQuery.toUpperCase();
            const filtered = allTickersWithCounts.filter(ticker => {
                const symbol = (ticker.symbol || '').toUpperCase();
                const name = (ticker.name || '').toUpperCase();
                return symbol.includes(queryUpper) || name.includes(queryUpper);
            }).slice(0, 20); // Limit to 20 results
            
            // Render results (now async - needs await)
            await renderTickerSearchResults(filtered, resultsContainer);
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error searching tickers', { page: 'trade-history-page', error });
            }
            if (resultsContainer) {
                safeSetInnerHTML(resultsContainer, '<div class="alert alert-danger">שגיאה בחיפוש טיקרים</div>');
            }
        }
    }
    
    /**
     * Render ticker search results with trade count
     * @param {Array} tickers - Array of ticker objects (already filtered to have trade_count > 0)
     * @param {HTMLElement} resultsContainer - Container for results
     */
    async function renderTickerSearchResults(tickers, resultsContainer) {
        if (!resultsContainer) return;
        
        if (tickers.length === 0) {
            safeSetInnerHTML(resultsContainer, '<div class="alert alert-info">לא נמצאו תוצאות</div>');
            return;
        }
        
        const resultsHTML = tickers.map(ticker => {
            const symbol = ticker.symbol || ticker.ticker_symbol || 'N/A';
            const name = ticker.name || '';
            const type = ticker.type || '';
            const currency = ticker.currency || ticker.currency_code || '';
            const typeDisplay = type ? (type.charAt(0).toUpperCase() + type.slice(1)) : '';
            const currencyDisplay = currency || '';
            const tradeCount = ticker.trade_count || 0;
            const tradeCountText = tradeCount === 1 ? 'טרייד אחד' : `${tradeCount} טריידים`;
            
            return `
                <div class="search-result-item border rounded p-2 mb-2" style="cursor: pointer;" data-ticker-id="${ticker.id}" data-ticker-symbol="${symbol}" data-trade-count="${tradeCount}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="flex: 1;">
                            <strong>${symbol}</strong>${name ? ` - ${name}` : ''}
                            <br><small class="text-muted"><strong>${tradeCountText}</strong>${(typeDisplay || currencyDisplay) ? ` • ${typeDisplay}${typeDisplay && currencyDisplay ? ' • ' : ''}${currencyDisplay}` : ''}</small>
                        </div>
                        <button type="button" 
                                class="btn btn-sm btn-primary ms-2"
                                data-ticker-id="${ticker.id}"
                                data-ticker-symbol="${symbol}"
                                data-trade-count="${tradeCount}">
                            בחר
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        safeSetInnerHTML(resultsContainer, resultsHTML);
        
        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item, .btn').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                
                // Get ticker info from the clicked item or its parent
                const container = item.closest('[data-ticker-id]') || item;
                const tickerId = container.getAttribute('data-ticker-id');
                const tickerSymbol = container.getAttribute('data-ticker-symbol') || 'טיקר לא ידוע';
                const tradeCount = parseInt(container.getAttribute('data-trade-count') || '0', 10);

                if (window.Logger) {
                    window.Logger.debug('Ticker selection clicked', { 
                        page: 'trade-history-page', 
                        tickerId, 
                        tickerSymbol, 
                        tradeCount,
                        itemTag: item.tagName,
                        containerTag: container.tagName
                    });
                }

                if (tickerId && tradeCount > 0) {
                    selectTickerForTradeHistory(parseInt(tickerId, 10), tickerSymbol);
                } else if (tradeCount === 0) {
                    window.NotificationSystem?.showWarning('אין טריידים', `לא ניתן לבחור טיקר ${tickerSymbol} מכיוון שאין לו טריידים במערכת.`);
                } else if (!tickerId) {
                    window.Logger?.warn('Ticker selection clicked but no ticker ID found', { 
                        page: 'trade-history-page',
                        item: item.tagName,
                        container: container.tagName
                    });
                }
            });
        });
    }
    
    /**
     * Clear ticker search results
     * @param {HTMLElement} resultsContainer - Container for results
     */
    function clearTickerSearchResults(resultsContainer) {
        if (resultsContainer) {
            while (resultsContainer.firstChild) {
                resultsContainer.removeChild(resultsContainer.firstChild);
            }
        }
    }
    
    /**
     * Select ticker and find trades
     * @param {number} tickerId - Ticker ID
     * @param {string} tickerSymbol - Ticker symbol
     */
    async function selectTickerForTradeHistory(tickerId, tickerSymbol) {
        // Validate inputs
        if (!tickerId) {
            window.Logger?.error('selectTickerForTradeHistory called without tickerId', { page: 'trade-history-page', tickerId, tickerSymbol });
            window.NotificationSystem?.showError('שגיאה', 'שגיאה בבחירת טיקר - חסר מזהה טיקר');
            return;
        }
        
        // If tickerSymbol is undefined or empty, try to get it from the ticker data
        let effectiveSymbol = tickerSymbol;
        if (!effectiveSymbol || effectiveSymbol === 'undefined' || effectiveSymbol === 'N/A') {
            // Try to fetch ticker info to get symbol
            try {
                if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                    const tickerData = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {});
                    effectiveSymbol = tickerData?.symbol || tickerData?.ticker_symbol || `טיקר #${tickerId}`;
                } else {
                    effectiveSymbol = `טיקר #${tickerId}`;
                }
            } catch (error) {
                window.Logger?.warn('Failed to fetch ticker symbol, using fallback', { page: 'trade-history-page', tickerId, error: error?.message });
                effectiveSymbol = `טיקר #${tickerId}`;
            }
        }
        
        if (window.Logger) {
            window.Logger.info(`Selecting ticker ${tickerId} (${effectiveSymbol}) for trade history`, { page: 'trade-history-page' });
        }
        
        try {
            // Load trades for this ticker using the trades API endpoint (not trade-history)
            // The trade-history endpoint might not return all trades
            let trades = [];
            
            // Try trade-history endpoint first
            try {
            const tradesData = await window.TradeHistoryData?.loadTradeHistory({
                ticker_id: tickerId
            }) || {};
            
                if (window.Logger) {
                    window.Logger.debug('Trade-history endpoint response', {
                        page: 'trade-history-page',
                        tickerId,
                        tradesCount: tradesData.trades?.length || 0,
                        hasTrades: !!(tradesData.trades && tradesData.trades.length > 0)
                    });
                }
                
                trades = tradesData.trades || [];
            } catch (error) {
                window.Logger?.warn('Failed to load from trade-history endpoint, trying trades endpoint', { 
                    page: 'trade-history-page', 
                    tickerId, 
                    error: error?.message 
                });
            }
            
            // If no trades from trade-history, try the regular trades endpoint
            if (trades.length === 0) {
                try {
                    const baseUrl = window.API_BASE_URL || (window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
                    const separator = baseUrl.endsWith('/') ? '' : '/';
                    const url = `${baseUrl}${separator}api/trades/?ticker_id=${tickerId}`;
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        }, });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (window.Logger) {
                            window.Logger.debug('Raw API response structure', { 
                                page: 'trade-history-page', 
                                tickerId,
                                hasData: 'data' in data,
                                isArray: Array.isArray(data),
                                dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data
                            });
                        }
                        
                        trades = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
                        
                        // Log detailed information about loaded trades
                        if (window.Logger) {
                            window.Logger.debug('Loaded trades from trades endpoint', { 
                                page: 'trade-history-page', 
                                tickerId, 
                                count: trades.length,
                                firstTradeId: trades[0]?.id,
                                firstTradeSymbol: trades[0]?.ticker_symbol,
                                firstTradeKeys: trades[0] ? Object.keys(trades[0]) : [],
                                firstTradeFull: trades[0] ? JSON.stringify(trades[0]).substring(0, 500) : null
                            });
                            
                            // Check for trades without ID - log full structure
                            const tradesWithoutId = trades.filter(t => !t.id && !t.trade_id && !t.tradeId);
                            if (tradesWithoutId.length > 0) {
                                window.Logger.warn('Found trades without ID', { 
                                    page: 'trade-history-page', 
                                    count: tradesWithoutId.length,
                                    totalTrades: trades.length,
                                    sampleTradeKeys: Object.keys(tradesWithoutId[0] || {}),
                                    sampleTradeFull: JSON.stringify(tradesWithoutId[0]).substring(0, 1000),
                                    allTradeIds: trades.map(t => ({ 
                                        id: t.id, 
                                        trade_id: t.trade_id, 
                                        tradeId: t.tradeId,
                                        keys: Object.keys(t).filter(k => k.toLowerCase().includes('id'))
                                    }))
                                });
                            }
                            
                            // Log all possible ID fields in first trade
                            if (trades.length > 0) {
                                const firstTrade = trades[0];
                                const idFields = Object.keys(firstTrade).filter(k => 
                                    k.toLowerCase().includes('id') || 
                                    k.toLowerCase().includes('_id')
                                );
                                window.Logger.debug('ID fields found in first trade', { 
                                    page: 'trade-history-page',
                                    idFields: idFields,
                                    idFieldValues: idFields.reduce((acc, key) => {
                                        acc[key] = firstTrade[key];
                                        return acc;
                                    }, {})
                                });
                            }
                        }
                    } else {
                        const errorText = await response.text();
                        if (window.Logger) {
                            window.Logger.warn('Failed to load trades from trades endpoint', { 
                                page: 'trade-history-page', 
                                tickerId, 
                                status: response.status,
                                statusText: response.statusText,
                                errorText: errorText.substring(0, 500)
                            });
                        }
                    }
                } catch (error) {
                    window.Logger?.error('Failed to load trades from trades endpoint', { 
                        page: 'trade-history-page', 
                        tickerId, 
                        error: error?.message 
                    });
                }
            }
            
            if (trades.length === 0) {
                if (window.NotificationSystem && typeof window.NotificationSystem.showWarning === 'function') {
                    window.NotificationSystem.showWarning('לא נמצאו טריידים', `לא נמצאו טריידים לטיקר ${effectiveSymbol}`);
                }
                return;
            }
            
            // Show loading indicator
            const step2 = document.getElementById('tradeHistoryStep2');
            const tradesResults = document.getElementById('tradeHistoryTradesResults');
            if (tradesResults) {
                safeSetInnerHTML(tradesResults, '<div class="text-center text-muted py-2"><i class="bi bi-hourglass-split me-2"></i>טוען טריידים...</div>');
            }
            
            // Hide step 1, show step 2
            const step1 = document.getElementById('tradeHistoryStep1');
            if (step1) {
                step1.style.display = 'none';
            }
            if (step2) {
                step2.style.display = 'block';
            }
            
            // Update selected ticker info
            const selectedTickerName = document.getElementById('tradeHistorySelectedTickerName');
            if (selectedTickerName) {
                selectedTickerName.textContent = `${effectiveSymbol}${trades.length > 1 ? ` (${trades.length} טריידים)` : ''}`;
            }
            
            if (window.Logger) {
                window.Logger.debug('Trades before rendering', {
                    page: 'trade-history-page',
                    count: trades.length,
                    tickerId,
                    firstTradeId: trades[0]?.id || trades[0]?.trade_id || trades[0]?.tradeId
                });
            }
            
            // Render trades
            renderTradesForSelection(trades, tradesResults);
            
            // Setup back button
            const backButton = document.getElementById('tradeHistoryBackToTickerSearch');
            if (backButton) {
                backButton.onclick = () => {
                    if (step1) step1.style.display = 'block';
                    if (step2) step2.style.display = 'none';
                    if (tradesResults) {
                        while (tradesResults.firstChild) {
                            tradesResults.removeChild(tradesResults.firstChild);
                        }
                    }
                };
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error selecting ticker for trade history', { page: 'trade-history-page', tickerId, error });
            }
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה', 'שגיאה בטעינת טריידים לטיקר');
            }
        }
    }
    
    /**
     * Render trades for selection
     * @param {Array} trades - Array of trade objects
     * @param {HTMLElement} resultsContainer - Container for results
     */
    function renderTradesForSelection(trades, resultsContainer) {
        if (!resultsContainer) return;
        
        if (trades.length === 0) {
            safeSetInnerHTML(resultsContainer, '<div class="alert alert-info">לא נמצאו טריידים</div>');
            return;
        }
        
        const resultsHTML = trades.map((trade, index) => {
            // Try multiple possible ID field names
            // Note: trade-history endpoint returns nested structure: { trade: { id: ... }, executions: [], ... }
            // While trades endpoint returns flat structure: { id: ..., ticker_id: ..., ... }
            const tradeId = trade.id || 
                          trade.trade_id || 
                          trade.tradeId || 
                          (trade.trade && trade.trade.id) || 
                          (trade.trade && trade.trade.trade_id);
            
            if (!tradeId) {
                // Log full trade structure for debugging - also to console for full visibility
                const allKeys = Object.keys(trade);
                const idRelatedKeys = allKeys.filter(k => 
                    k.toLowerCase().includes('id') || 
                    k.toLowerCase().includes('_id')
                );
                
                window.Logger?.error('Trade without ID found in renderTradesForSelection', { 
                    page: 'trade-history-page', 
                    tradeIndex: index,
                    totalTrades: trades.length,
                    trade: {
                        allKeys: allKeys,
                        idRelatedKeys: idRelatedKeys,
                        idRelatedValues: idRelatedKeys.reduce((acc, key) => {
                            acc[key] = trade[key];
                            return acc;
                        }, {}),
                        fullTradeJSON: JSON.stringify(trade).substring(0, 2000),
                        sample: Object.fromEntries(Object.entries(trade).slice(0, 10))
                    }
                });
                return '';
            }
            
            // Handle nested structure from trade-history endpoint vs flat structure from trades endpoint
            const tradeData = trade.trade || trade; // Use nested trade object if exists, otherwise use trade directly
            const accountData = tradeData.account || (trade.account_name ? { name: trade.account_name } : null);
            
            // Use FieldRendererService for consistent rendering (like linked items)
            const statusDisplay = window.FieldRendererService?.renderStatus 
                ? window.FieldRendererService.renderStatus(tradeData.status || trade.status, 'trade')
                : `<span class="badge bg-secondary">${tradeData.status || trade.status || 'unknown'}</span>`;
            
            const sideDisplay = window.FieldRendererService?.renderSide 
                ? window.FieldRendererService.renderSide(tradeData.side || trade.side)
                : ((tradeData.side || trade.side) ? `<span class="badge bg-info">${tradeData.side || trade.side}</span>` : '');
            
            const typeDisplay = window.FieldRendererService?.renderType 
                ? window.FieldRendererService.renderType(tradeData.investment_type || trade.investment_type)
                : ((tradeData.investment_type || trade.investment_type) ? `<span class="badge bg-secondary">${tradeData.investment_type || trade.investment_type}</span>` : '');
            
            // Format dates using FieldRendererService or dateUtils
            let openedAtDisplay = 'לא זמין';
            const openedAtValue = tradeData.opened_at || trade.opened_at || tradeData.created_at || trade.created_at;
            if (openedAtValue) {
                const dateValue = openedAtValue;
                if (window.FieldRendererService?.renderDate) {
                    openedAtDisplay = window.FieldRendererService.renderDate(dateValue, false);
                } else if (window.dateUtils?.formatDate) {
                    openedAtDisplay = window.dateUtils.formatDate(dateValue, { includeTime: false });
                } else if (dateValue?.display) {
                    openedAtDisplay = dateValue.display;
                } else if (typeof dateValue === 'string' || dateValue instanceof Date) {
                    try {
                        const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
                        if (!isNaN(dateObj.getTime())) {
                            openedAtDisplay = dateObj.toLocaleDateString('he-IL', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                            });
                        }
                    } catch (e) {
                        window.Logger?.warn('Failed to format opened_at date', { page: 'trade-history-page', dateValue, error: e.message });
                    }
                }
            }
            
            let closedAtDisplay = '';
            const closedAtValue = tradeData.closed_at || trade.closed_at;
            if (closedAtValue) {
                const dateValue = closedAtValue;
                if (window.FieldRendererService?.renderDate) {
                    closedAtDisplay = window.FieldRendererService.renderDate(dateValue, false);
                } else if (window.dateUtils?.formatDate) {
                    closedAtDisplay = window.dateUtils.formatDate(dateValue, { includeTime: false });
                } else if (dateValue?.display) {
                    closedAtDisplay = dateValue.display;
                } else if (typeof dateValue === 'string' || dateValue instanceof Date) {
                    try {
                        const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
                        if (!isNaN(dateObj.getTime())) {
                            closedAtDisplay = dateObj.toLocaleDateString('he-IL', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                            });
                        }
                    } catch (e) {
                        window.Logger?.warn('Failed to format closed_at date', { page: 'trade-history-page', dateValue, error: e.message });
                    }
                }
            }
            
            const accountName = accountData?.name || 
                                     trade.account_name || 
                                     trade.trading_account_name || 
                                     (tradeData.trading_account_id || trade.trading_account_id ? `חשבון #${tradeData.trading_account_id || trade.trading_account_id}` : 'לא מוגדר');
            
            // Format P/L using FieldRendererService
            const totalPL = tradeData.total_pl || trade.total_pl || trade.total_pl_value || 0;
            let plDisplay = '';
            if (totalPL !== 0 && totalPL !== null && totalPL !== undefined) {
                if (window.FieldRendererService?.renderAmount) {
                    plDisplay = window.FieldRendererService.renderAmount(totalPL, '$', 2, true);
                } else {
                    const plSign = totalPL >= 0 ? '+' : '';
                    plDisplay = `${plSign}${parseFloat(totalPL).toFixed(2)}`;
                }
            }
            
            return `
                <div class="search-result-item border rounded p-2 mb-2" style="cursor: pointer;" data-trade-id="${tradeId}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="flex: 1;">
                            <div class="d-flex align-items-center gap-2 mb-2">
                            <strong>טרייד #${tradeId}</strong>
                                ${statusDisplay}
                                ${sideDisplay}
                                ${typeDisplay}
                            </div>
                            <div class="small text-muted">
                                <div class="mb-1">
                                    <span class="fw-bold">תאריך פתיחה:</span> ${openedAtDisplay}
                                    ${closedAtDisplay ? `<br><span class="fw-bold">תאריך סגירה:</span> ${closedAtDisplay}` : ''}
                                </div>
                                <div>
                                    <span class="fw-bold">חשבון מסחר:</span> ${accountName}
                                </div>
                                ${plDisplay ? `<div class="mt-1"><span class="fw-bold">P/L כולל:</span> <span class="${totalPL >= 0 ? 'text-success' : 'text-danger'}">${plDisplay}</span></div>` : ''}
                            </div>
                        </div>
                        <button type="button" 
                                class="btn btn-sm btn-primary ms-3"
                                data-trade-id="${tradeId}">
                            בחר
                        </button>
                    </div>
                </div>
            `;
        }).filter(Boolean).join(''); // Filter out empty strings from invalid trades
        
        safeSetInnerHTML(resultsContainer, resultsHTML);
        
        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item, .btn').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                
                // Get trade ID from the clicked item or its parent container
                const container = item.closest('[data-trade-id]') || item;
                const tradeId = container.getAttribute('data-trade-id');
                
                if (window.Logger) {
                    window.Logger.debug('Trade selection clicked', { 
                        page: 'trade-history-page', 
                        tradeId,
                        itemTag: item.tagName,
                        containerTag: container.tagName,
                        hasDataAttribute: container.hasAttribute('data-trade-id')
                    });
                }
                
                if (tradeId) {
                    selectTradeForHistory(parseInt(tradeId, 10));
                } else {
                    window.Logger?.warn('Trade selection clicked but no trade ID found', { 
                        page: 'trade-history-page',
                        item: item.tagName,
                        container: container.tagName
                    });
                }
            });
        });
    }
    
    /**
     * Select trade and load it
     * @param {number} tradeId - Trade ID
     */
    async function selectTradeForHistory(tradeId) {
        if (window.Logger) {
            window.Logger.info(`Selecting trade ${tradeId} for history`, { page: 'trade-history-page' });
        }
        
        try {
            selectedTradeId = tradeId;
            updateURLWithTradeId(tradeId);
            await saveToCache(CACHE_KEY_SELECTED_TRADE_ID, tradeId);
            await loadTradeForAnalysis(tradeId);
            
            // Close modal
            const modal = document.getElementById('tradeHistoryTickerSearchModal');
            if (modal) {
                if (window.ModalManagerV2 && typeof window.ModalManagerV2.closeModal === 'function') {
                    window.ModalManagerV2.closeModal('tradeHistoryTickerSearchModal');
                } else if (bootstrap?.Modal) {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) {
                        bsModal.hide();
                    }
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error selecting trade for history', { page: 'trade-history-page', error });
            }
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה', 'לא ניתן לטעון את הטרייד');
            }
        }
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
     * Load trade history data using TradeHistoryData service
     * Note: This is only used when we need to load all trades (not when we have a specific trade_id)
     */
    async function loadDataFromCache() {
        try {
            // If we have a trade_id in URL, we don't need to load all trades
            const urlTradeId = getTradeIdFromURL();
            if (urlTradeId) {
                    if (window.Logger) {
                    window.Logger.debug('Skipping trade history load - trade_id in URL, will load specific trade', { 
                        page: 'trade-history-page', 
                        tradeId: urlTradeId 
                    });
                }
                return null; // Return null - we'll load the specific trade instead
            }

            // Wait for TradeHistoryData service to be available
            if (!window.TradeHistoryData) {
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (window.TradeHistoryData) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 5000); // Timeout after 5 seconds
                });
            }

            if (!window.TradeHistoryData || typeof window.TradeHistoryData.loadTradeHistory !== 'function') {
                if (window.Logger) {
                    window.Logger.warn('TradeHistoryData service not available', { page: 'trade-history-page' });
                }
                return null;
            }

            // Load trade history data (only if we don't have a specific trade_id)
            if (window.Logger) {
                window.Logger.debug('Loading trade history data (no specific trade_id)', { page: 'trade-history-page' });
            }
            
            const data = await window.TradeHistoryData.loadTradeHistory({});
            tradeHistoryData = data;
            
            if (window.Logger) {
                window.Logger.info('Loaded trade history data', { 
                    page: 'trade-history-page', 
                    count: data?.trades?.length || 0 
                });
            }
            
            return tradeHistoryData;
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.Logger) {
                window.Logger.warn('Error loading trade history data (non-critical)', { 
                    page: 'trade-history-page', 
                    error: errorMsg,
                    note: 'This is expected if we have a specific trade_id in URL'
                });
            }
            // Don't show error notification - this is expected when we have a trade_id
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
     * Get trade ID from URL parameters
     * @returns {number|null} Trade ID from URL or null
     */
    function getTradeIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const tradeId = urlParams.get('trade_id') || urlParams.get('tradeId');
        
        // If tickerId is in URL, remove it (should only use tradeId)
        const tickerId = urlParams.get('ticker_id') || urlParams.get('tickerId');
        if (tickerId && !tradeId) {
            // Clean URL - remove tickerId parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('ticker_id');
            url.searchParams.delete('tickerId');
            window.history.replaceState({}, '', url.toString());
            if (window.Logger) {
                window.Logger.warn('⚠️ Removed tickerId from URL - trade-history page should use tradeId only', { tickerId, page: 'trade-history-page' });
            }
        }
        
        if (window.Logger) {
            window.Logger.debug('🔍 Parsing trade ID from URL', { 
                fullUrl: window.location.href,
                searchParams: window.location.search,
                tradeId: tradeId,
                tickerId: tickerId,
                allParams: Object.fromEntries(urlParams.entries()),
                page: 'trade-history-page' 
            });
        }
        
        if (tradeId) {
            const parsedId = parseInt(tradeId, 10);
            if (isNaN(parsedId) || parsedId <= 0) {
                if (window.Logger) {
                    window.Logger.error('❌ Invalid trade ID in URL', { tradeId, parsedId, page: 'trade-history-page' });
                }
                return null;
            }
            if (window.Logger) {
                window.Logger.debug('✅ Parsed trade ID from URL', { tradeId, parsedId, page: 'trade-history-page' });
            }
            return parsedId;
        }
        
        return null;
    }

    /**
     * Update URL with trade_id parameter without page reload
     * @param {number|null} tradeId - Trade ID to set in URL
     */
    function updateURLWithTradeId(tradeId) {
        const url = new URL(window.location.href);
        if (tradeId) {
            url.searchParams.set('trade_id', tradeId);
        } else {
            url.searchParams.delete('trade_id');
        }
        // Update URL without reload
        window.history.replaceState({}, '', url.toString());
        if (window.Logger) {
            window.Logger.debug('✅ Updated URL with trade_id', { tradeId, newUrl: url.toString(), page: 'trade-history-page' });
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

            // Show loading state
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('tradesTableContainer');
            }

            // 1. Get trade ID from URL (highest priority)
            const urlTradeId = getTradeIdFromURL();
            if (urlTradeId) {
                selectedTradeId = urlTradeId;
                // Save to cache for future reference
                await saveToCache(CACHE_KEY_SELECTED_TRADE_ID, urlTradeId);
                if (window.Logger) {
                    window.Logger.info('✅ Trade ID loaded from URL', { tradeId: urlTradeId, page: 'trade-history-page' });
                }
            } else {
                // No trade_id in URL - clear any cached selection to prevent confusion
                await saveToCache(CACHE_KEY_SELECTED_TRADE_ID, null);
                selectedTradeId = null;
                if (window.Logger) {
                    window.Logger.info('No trade_id in URL - will show selection modal', { page: 'trade-history-page' });
                }
            }

            // 2. Load trade history data using TradeHistoryData service (with error handling)
            // Note: If we have a trade_id in URL, we skip this and load the specific trade instead
            let data = null;
            if (!selectedTradeId) {
                // Only load all trades if we don't have a specific trade_id
                try {
                    if (window.Logger) {
                        window.Logger.debug('Loading trade history data (no specific trade_id)', { page: 'trade-history' });
                    }
                    data = await loadDataFromCache();
                    if (window.Logger) {
                        window.Logger.debug('Trade history data loaded', { 
                            page: 'trade-history', 
                            hasData: !!data,
                            tradesCount: data?.trades?.length || 0
                        });
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to load trade history data (non-critical)', { 
                            page: 'trade-history', 
                            error: error?.message,
                            note: 'Will continue without data - user can select trade via modal'
                        });
                    }
                    // Don't exit - continue to show ticker search modal
                    data = null;
                }
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping trade history data load - have specific trade_id', { 
                        page: 'trade-history', 
                        tradeId: selectedTradeId 
                    });
                }
            }
            
            // Hide loading state
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('tradesTableContainer');
            }
            
            // 3. Wait for HeaderSystem (non-blocking)
            initializeHeader().catch(() => {
                // Header initialization is optional
            });

            // 4. Wait for TradingView libraries (non-blocking for initial render)
            waitForTradingView().catch(() => {
                // TradingView is optional for initial render
            });

            // DO NOT update URL if we don't have a trade_id in URL
            // This prevents unnecessary redirects

            // 6. Register tables
            registerPlanVsExecutionTable();

            // 7. Setup HeaderSystem filter integration
            setupHeaderFiltersIntegration();

            // 8. Load page state (sections, chart zoom, etc.)
            await loadPageState();

            // 9. Render page first (so UI is ready)
            await renderPage(data || { trades: [], count: 0 });
            
            // 10. Load selected trade data if available (after render)
            // IMPORTANT: Only load if we have a trade_id in URL - do NOT load from cache
            if (urlTradeId) {
                // Only load if trade_id came from URL (not from cache)
                if (window.Logger) {
                    window.Logger.info('Loading trade for analysis', { 
                        page: 'trade-history', 
                        tradeId: selectedTradeId,
                        step: 'after-render',
                        source: 'URL'
                    });
                }
                // Load trade asynchronously without blocking
                loadTradeForAnalysis(selectedTradeId).then(() => {
                    if (window.Logger) {
                        window.Logger.info('✅ Trade loaded successfully', { 
                            page: 'trade-history', 
                            tradeId: selectedTradeId 
                        });
                    }
                }).catch(error => {
                    const errorMsg = error?.message || 'Unknown error';
                    if (window.Logger) {
                        window.Logger.error('❌ Error loading trade for analysis', { 
                            page: 'trade-history', 
                            tradeId: selectedTradeId, 
                            error: errorMsg,
                            willShowModal: errorMsg.includes('not found') || errorMsg.includes('404')
                        });
                    }
                    // If trade not found, show ticker search modal
                    if (errorMsg.includes('not found') || errorMsg.includes('404')) {
                        if (window.Logger) {
                            window.Logger.info('Trade not found - showing ticker search modal', { 
                                page: 'trade-history', 
                                tradeId: selectedTradeId 
                            });
                        }
                        // Clear the invalid trade_id from URL
                        updateURLWithTradeId(null);
                        setTimeout(() => {
                            showTickerSearchModal();
                        }, 1000); // Wait a bit for UI to be ready
                    }
                });
            } else {
                // No trade ID in URL - show ticker search modal immediately
                if (window.Logger) {
                    window.Logger.info('No trade ID in URL - showing ticker search modal', { 
                        page: 'trade-history',
                        hasSelectedTradeId: !!selectedTradeId,
                        hasUrlTradeId: !!urlTradeId
                    });
                }
                // Clear any cached selection to prevent confusion
                await saveToCache(CACHE_KEY_SELECTED_TRADE_ID, null);
                // Always show if no trade_id in URL
                setTimeout(() => {
                    showTickerSearchModal();
                }, 1000); // Wait a bit for UI to be ready
            }

            isPageInitialized = true;

            if (window.Logger) {
                window.Logger.info('✅ Trade History Page initialized successfully', { page: 'trade-history-page' });
            }
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה באתחול עמוד היסטוריית טריידים', 
                    `לא ניתן לאתחל את העמוד. ${errorMsg}`);
            } else if (window.Logger) {
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
            // Find selected trade from data if available
            let selectedTrade = null;
            if (selectedTradeId && data?.trades && Array.isArray(data.trades)) {
                selectedTrade = data.trades.find(t => t.id === selectedTradeId);
            }
            
            // If no selected trade but we have trades, use first one
            if (!selectedTrade && data?.trades && Array.isArray(data.trades) && data.trades.length > 0) {
                selectedTrade = data.trades[0];
                selectedTradeId = selectedTrade.id;
            }
            
            // Render statistics (use data.statistics or calculate from selected trade)
            const statistics = data.statistics || (selectedTrade ? {
                durationDays: selectedTrade.duration_days || 0,
                totalPL: selectedTrade.pl || 0,
                totalPLPercent: selectedTrade.pl_percent || 0,
                executionCount: selectedTrade.execution_count || 0
            } : null);
            renderStatistics(statistics);

            // Render trade details
            renderTradeDetails(selectedTrade, selectedTrade?.conditions || []);

            // Render timeline steps (use data.timelineData or empty array)
            const timelineData = data.timelineData || (selectedTrade ? [] : []);
            await renderTimelineSteps(timelineData);

            // Initialize timeline chart with data (after a short delay to ensure DOM is ready)
            setTimeout(async () => {
                try {
                    // Show loading state for chart
                    const chartContainer = document.getElementById('timelineChart');
                    if (chartContainer && typeof window.showLoadingState === 'function') {
                        window.showLoadingState('timelineChart');
                    }
                    
                    // Check if initTimelineChart exists (from HTML script)
                    if (typeof window.initTimelineChart === 'function') {
                        await window.initTimelineChart();
                        
                        // Hide loading state after chart is initialized
                        if (chartContainer && typeof window.hideLoadingState === 'function') {
                            window.hideLoadingState('timelineChart');
                        }
                        // Restore chart zoom state after chart is initialized
                        setTimeout(() => {
                            if (window.tradeHistoryPage && typeof window.tradeHistoryPage.restoreChartZoomState === 'function') {
                                window.tradeHistoryPage.restoreChartZoomState();
                            }
                        }, 500);
                    } else {
                        // Hide loading state if chart function not found
                        if (chartContainer && typeof window.hideLoadingState === 'function') {
                            window.hideLoadingState('timelineChart');
                        }
                        if (window.Logger) {
                            window.Logger.warn('initTimelineChart not found in HTML, chart may not initialize', { page: 'trade-history-page' });
                        }
                    }
                } catch (error) {
                    // Hide loading state on error
                    const chartContainer = document.getElementById('timelineChart');
                    if (chartContainer && typeof window.hideLoadingState === 'function') {
                        window.hideLoadingState('timelineChart');
                    }
                    
                    const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
                    if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                        window.NotificationSystem.showError('שגיאה בטעינת גרף', 
                            `לא ניתן לטעון את גרף הזמן. ${errorMsg}`);
                    } else if (window.Logger) {
                        window.Logger.error('Error initializing timeline chart', { page: 'trade-history-page', error });
                    }
                }
            }, 300);

            // Render plan vs execution comparison
            renderPlanVsExecution(data.planVsExecution);

            // Load linked items for selected trade using EntityDetailsRenderer (same as entity details modal)
            if (selectedTradeId && selectedTrade) {
                try {
                    if (window.Logger) {
                        window.Logger.debug('Rendering linked items in renderPage', { 
                            page: 'trade-history-page', 
                            tradeId: selectedTradeId 
                        });
                    }
                    
                    const linkedItemsContainer = document.getElementById('linkedItemsContainer');
                    if (linkedItemsContainer && window.entityDetailsRenderer && typeof window.entityDetailsRenderer.renderLinkedItems === 'function') {
                        // Get linked items from selectedTrade (already loaded)
                        const linkedItems = selectedTrade.linked_items || [];
                        
                        // Get entity color for trade
                        const entityColor = window.getEntityColor && typeof window.getEntityColor === 'function'
                            ? window.getEntityColor('trade')
                            : '#6c757d';
                        
                        // Create sourceInfo for linked items
                        const sourceInfo = {
                            sourcePage: 'trade-history',
                            sourceType: 'trade',
                            sourceId: selectedTradeId
                        };
                        
                        // Render linked items using EntityDetailsRenderer (same as entity details modal)
                        const linkedItemsHTML = window.entityDetailsRenderer.renderLinkedItems(
                            linkedItems,
                            entityColor,
                            'trade',
                            selectedTradeId,
                            sourceInfo,
                            {
                                enablePagination: true,
                                pageSize: 25
                            }
                        );
                        
                        // Use safeSetInnerHTML to set the HTML
                        safeSetInnerHTML(linkedItemsContainer, linkedItemsHTML);
                        
                        if (window.Logger) {
                            window.Logger.debug('Linked items rendered successfully in renderPage', { 
                                page: 'trade-history-page',
                                itemsCount: linkedItems.length 
                            });
                        }
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('Linked items container or EntityDetailsRenderer not available in renderPage', { 
                                page: 'trade-history-page',
                                hasContainer: !!linkedItemsContainer,
                                hasRenderer: !!(window.entityDetailsRenderer && typeof window.entityDetailsRenderer.renderLinkedItems === 'function')
                            });
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to render linked items in renderPage (non-critical)', {
                            page: 'trade-history-page', 
                            error: error?.message 
                        });
                    }
                }
            }

            if (window.Logger) {
                window.Logger.info('Page rendered successfully', { page: 'trade-history-page' });
            }
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בהצגת עמוד', 
                    `לא ניתן להציג את העמוד. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('Error rendering page', { page: 'trade-history-page', error });
            }
        }
    }

    /**
     * Render statistics section
     */
    function renderStatistics(statistics) {
        if (!statistics) {
            // Show "-" for all statistics if no data
            const elements = ['statDuration', 'statTotalPL', 'statTotalPLPercent', 'statReturnPercent', 'statExecutionCount'];
            elements.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = '-';
                    el.classList.remove('loading');
                }
            });
            return;
        }

        // Duration - show active duration and planning/waiting duration
        const durationEl = document.getElementById('statDuration');
        if (durationEl) {
            const durationDays = statistics.durationDays !== undefined && statistics.durationDays !== null ? statistics.durationDays : 0;
            let durationText = `${durationDays} ימים`;
            if (statistics.planningWaitDays && statistics.planningWaitDays > 0) {
                durationText += ` <small class="text-muted">(תכנון והמתנה: ${statistics.planningWaitDays} ימים)</small>`;
            }
            safeSetInnerHTML(durationEl, durationText);
            durationEl.classList.remove('loading');
        }

        // Total P/L
        const totalPLEl = document.getElementById('statTotalPL');
        const totalPLPercentEl = document.getElementById('statTotalPLPercent');
        if (totalPLEl) {
            totalPLEl.textContent = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
                const totalPL = statistics.totalPL !== undefined && statistics.totalPL !== null ? statistics.totalPL : 0;
                const amountHTML = window.FieldRendererService.renderAmount(totalPL, '$', 0, true);
            const parser = new DOMParser();
            const doc = parser.parseFromString(amountHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                totalPLEl.appendChild(node.cloneNode(true));
            });
            } else {
                // Fallback if FieldRendererService not available
                const totalPL = statistics.totalPL !== undefined && statistics.totalPL !== null ? statistics.totalPL : 0;
                totalPLEl.textContent = totalPL.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            }
            totalPLEl.classList.remove('loading');
            
            if (totalPLPercentEl) {
                totalPLPercentEl.textContent = '';
                if (window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function') {
                    const totalPLPercent = statistics.totalPLPercent !== undefined && statistics.totalPLPercent !== null ? statistics.totalPLPercent : 0;
                    const percent = window.FieldRendererService.renderNumericValue(totalPLPercent, '%', true);
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`(${percent})`, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        totalPLPercentEl.appendChild(fragment);
                } else {
                    // Fallback if FieldRendererService not available
                    const totalPLPercent = statistics.totalPLPercent !== undefined && statistics.totalPLPercent !== null ? statistics.totalPLPercent : 0;
                    totalPLPercentEl.textContent = `(${totalPLPercent.toFixed(2)}%)`;
                }
                totalPLPercentEl.classList.remove('loading');
                const totalPL = statistics.totalPL !== undefined && statistics.totalPL !== null ? statistics.totalPL : 0;
                if (totalPL >= 0) {
                    totalPLPercentEl.classList.add('positive');
                } else {
                    totalPLPercentEl.classList.remove('positive');
                }
            }
        }

        // Return percent
        const returnPercentEl = document.getElementById('statReturnPercent');
        if (returnPercentEl) {
            returnPercentEl.textContent = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function') {
                const totalPLPercent = statistics.totalPLPercent !== undefined && statistics.totalPLPercent !== null ? statistics.totalPLPercent : 0;
                const percentHTML = window.FieldRendererService.renderNumericValue(totalPLPercent, '%', true);
            const parser = new DOMParser();
            const doc = parser.parseFromString(percentHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                returnPercentEl.appendChild(node.cloneNode(true));
            });
            } else {
                // Fallback if FieldRendererService not available
                const totalPLPercent = statistics.totalPLPercent !== undefined && statistics.totalPLPercent !== null ? statistics.totalPLPercent : 0;
                returnPercentEl.textContent = totalPLPercent.toFixed(2) + '%';
            }
            returnPercentEl.classList.remove('loading');
            const totalPLPercent = statistics.totalPLPercent !== undefined && statistics.totalPLPercent !== null ? statistics.totalPLPercent : 0;
            if (totalPLPercent >= 0) {
                returnPercentEl.classList.add('positive');
            } else {
                returnPercentEl.classList.remove('positive');
            }
        }

        // Execution count
        const executionCountEl = document.getElementById('statExecutionCount');
        if (executionCountEl) {
            const executionCount = statistics.executionCount !== undefined && statistics.executionCount !== null ? statistics.executionCount : 0;
            executionCountEl.textContent = executionCount.toString();
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
            sideEl.textContent = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderSide === 'function') {
                const sideHTML = window.FieldRendererService.renderSide(trade.side);
                const parser = new DOMParser();
                const doc = parser.parseFromString(sideHTML, 'text/html');
                doc.body.childNodes.forEach(node => {
                    sideEl.appendChild(node.cloneNode(true));
                });
            } else {
                const span = document.createElement('span');
                span.className = 'badge bg-success';
                span.textContent = trade.side || '-';
                sideEl.appendChild(span);
            }
            sideEl.classList.remove('loading');
        }

        // Investment type
        const investmentTypeEl = document.getElementById('tradeInvestmentType');
        if (investmentTypeEl) {
            investmentTypeEl.textContent = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderType === 'function') {
                const typeHTML = window.FieldRendererService.renderType(trade.investment_type);
                const parser = new DOMParser();
                const doc = parser.parseFromString(typeHTML, 'text/html');
                doc.body.childNodes.forEach(node => {
                    investmentTypeEl.appendChild(node.cloneNode(true));
                });
            } else {
                investmentTypeEl.textContent = getInvestmentTypeText(trade.investment_type);
            }
            investmentTypeEl.classList.remove('loading');
        }

        // Status - update both tradeStatus and tradeStatusBadge if they exist
        const statusEl = document.getElementById('tradeStatus');
        const statusBadgeEl = document.getElementById('tradeStatusBadge');
        
        const statusHTML = trade.status && window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function'
            ? window.FieldRendererService.renderStatus(trade.status, 'trade')
            : `<span class="status-badge">${trade.status || '-'}</span>`;
        
        // Update tradeStatus if exists
        if (statusEl) {
            safeSetInnerHTML(statusEl, statusHTML);
            statusEl.classList.remove('loading');
        }
        
        // Update tradeStatusBadge if exists (this is the one in HTML)
        if (statusBadgeEl) {
            safeSetInnerHTML(statusBadgeEl, statusHTML);
            statusBadgeEl.classList.remove('loading');
            // Remove loading class from child elements
            const loadingChild = statusBadgeEl.querySelector('.loading');
            if (loadingChild) {
                loadingChild.remove();
            }
        }
        
        if (!statusEl && !statusBadgeEl) {
            if (window.Logger) {
                window.Logger.warn('Status element not found (tradeStatus or tradeStatusBadge)', { page: 'trade-history-page' });
            }
        }

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
            conditionsEl.textContent = '';
            if (conditions.length > 0) {
                conditions.forEach(cond => {
                    const div = document.createElement('div');
                    const link = document.createElement('a');
                    link.href = '#';
                    link.setAttribute('data-onclick', `showConditionDetails(${cond.id}); return false;`);
                    link.textContent = cond.description;
                    div.appendChild(link);
                    conditionsEl.appendChild(div);
                });
            } else {
                const div = document.createElement('div');
                div.className = 'text-muted';
                div.textContent = '-';
                conditionsEl.appendChild(div);
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
            
            plel.textContent = '';
            const div1 = document.createElement('div');
            div1.textContent = 'ממומש: ';
            const parser1 = new DOMParser();
            const doc1 = parser1.parseFromString(realizedPL, 'text/html');
            doc1.body.childNodes.forEach(node => {
                div1.appendChild(node.cloneNode(true));
            });
            plel.appendChild(div1);
            
            const div2 = document.createElement('div');
            div2.textContent = 'לא ממומש: ';
            const parser2 = new DOMParser();
            const doc2 = parser2.parseFromString(unrealizedPL, 'text/html');
            doc2.body.childNodes.forEach(node => {
                div2.appendChild(node.cloneNode(true));
            });
            plel.appendChild(div2);
            
            const div3 = document.createElement('div');
            const strong = document.createElement('strong');
            strong.textContent = 'סה"כ: ';
            const parser3 = new DOMParser();
            const doc3 = parser3.parseFromString(totalPL, 'text/html');
            doc3.body.childNodes.forEach(node => {
                strong.appendChild(node.cloneNode(true));
            });
            div3.appendChild(strong);
            plel.appendChild(div3);
            // Note: This is a specific P/L display for a single trade, not a summary element
            // Consider using InfoSummarySystem if this becomes a summary of multiple trades
            plel.classList.remove('loading');
        }
    }

    /**
     * Render timeline steps as a table with icons, type, details, and duration between rows
     */
    async function renderTimelineStepsTable(timelineData) {
        if (!timelineData || !Array.isArray(timelineData)) return;

        const tbody = document.getElementById('timelineStepsTableBody');
        if (!tbody) return;

        // Clear existing content
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        if (timelineData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="text-center py-4 text-muted">אין צעדים להצגה</td>';
            tbody.appendChild(row);
            return;
        }

        // Render each step as a table row
        for (let i = 0; i < timelineData.length; i++) {
            const step = timelineData[i];
            const dateStr = formatDate(step.date);
            
            // Get icon for this entity type
            let iconHTML = '';
            const entityType = step.type === 'Note' ? 'note' : 
                              step.type === 'Cash Flow' ? 'cash_flow' : 
                              step.type === 'Alert' || step.type === 'Alert Activation' ? 'alert' : 
                              step.type === 'Trade Plan' ? 'trade_plan' : 
                              step.type === 'Trade' ? 'trade' : 
                              'execution';
            
            // Get entity color for styling
            let entityColor = '';
            if (window.getEntityColor && typeof window.getEntityColor === 'function') {
                entityColor = window.getEntityColor(entityType);
            }
            
            // Get entity type label (Hebrew translation)
            let entityTypeLabel = step.type;
            if (window.getEntityLabel && typeof window.getEntityLabel === 'function') {
                entityTypeLabel = window.getEntityLabel(entityType) || step.type;
            } else {
                // Fallback translations
                const typeTranslations = {
                    'Note': 'הערה',
                    'Cash Flow': 'תנועת מזומנים',
                    'Alert': 'אזהרה',
                    'Alert Activation': 'הפעלת אזהרה',
                    'Trade Plan': 'תוכנית מסחר',
                    'Trade': 'טרייד',
                    'Execution': 'ביצוע'
                };
                entityTypeLabel = typeTranslations[step.type] || step.type;
            }
            
            if (window.IconSystem && window.IconSystem.initialized) {
                try {
                    iconHTML = await window.IconSystem.renderIcon('entity', entityType, { size: '20', alt: step.type });
                } catch (error) {
                    iconHTML = `<i class="bi bi-circle" style="font-size: 20px;${entityColor ? ` color: ${entityColor};` : ''}"></i>`;
                }
            } else {
                iconHTML = `<i class="bi bi-circle" style="font-size: 20px;${entityColor ? ` color: ${entityColor};` : ''}"></i>`;
            }

            // Build details HTML
            let detailsHTML = '';
            if (step.type === 'Execution') {
                const priceStr = step.price ? `$${step.price.toFixed(2)}` : '-';
                const quantityStr = step.quantity ? step.quantity.toString() : '-';
                const sideStr = step.side || step.action || '-';
                const plValue = step.pl !== undefined ? step.pl : 0;
                let plHTML = '';
                if (window.FieldRendererService) {
                    plHTML = window.FieldRendererService.renderAmount(plValue, '$', 2, true);
                } else {
                    const plClass = plValue >= 0 ? 'text-success' : 'text-danger';
                    plHTML = `<span class="${plClass}">$${Math.abs(plValue).toFixed(2)}</span>`;
                }
                detailsHTML = `מחיר: ${priceStr} | כמות: ${quantityStr} | צד: ${sideStr} | P/L: ${plHTML}`;
            } else if (step.type === 'Cash Flow' && step.amount) {
                if (window.FieldRendererService) {
                    detailsHTML = window.FieldRendererService.renderAmount(step.amount, '$', 2, true);
                } else {
                    detailsHTML = `$${step.amount.toFixed(2)}`;
                }
            } else if (step.displayText) {
                detailsHTML = step.displayText;
            } else {
                detailsHTML = step.title || step.type || '-';
            }

            // Build action button - use EntityDetailsModal for all entity types
            const stepId = step.id || i;
            // entityType already defined above (line 4181) - reuse it

            // Use EntityDetailsModal if available, otherwise fallback to specific functions
            let onClickFn = '';
            if (window.showEntityDetails && typeof window.showEntityDetails === 'function') {
                onClickFn = `window.showEntityDetails('${entityType}', ${stepId}, { mode: 'view' }); return false;`;
            } else if (step.type === 'Cash Flow') {
                onClickFn = `showCashFlowDetails(${stepId}); return false;`;
            } else if (step.type === 'Note') {
                onClickFn = `showNoteDetails(${stepId}); return false;`;
            } else if (step.type === 'Alert' || step.type === 'Alert Activation') {
                onClickFn = `showAlertDetails(${stepId}); return false;`;
            } else if (step.type === 'Trade Plan') {
                onClickFn = `showTradePlanDetails(${stepId}); return false;`;
            } else if (step.type === 'Trade') {
                onClickFn = `showTradeDetails(${stepId}); return false;`;
            } else {
                onClickFn = `showExecutionDetails(${stepId}, '${entityType}'); return false;`;
            }

            // Create row HTML with entity color and label
            const rowStyle = entityColor ? `style="border-left: 3px solid ${entityColor};"` : '';
            const rowHTML = `
                <tr data-step-index="${i}" data-step-id="${stepId}" data-entity-type="${entityType}" ${rowStyle}>
                    <td class="text-center">${iconHTML}</td>
                    <td>
                        <strong style="${entityColor ? `color: ${entityColor};` : ''}">${entityTypeLabel}</strong>
                        ${step.title && step.title !== step.type ? `<br><small class="text-muted">${step.title}</small>` : ''}
                    </td>
                    <td>
                        <div>${detailsHTML}</div>
                        <small class="text-muted">${dateStr} | מזהה: #${stepId}</small>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" data-onclick="${onClickFn}; return false;">
                            <i class="bi bi-eye"></i> פרטים
                        </button>
                    </td>
                </tr>
            `;

            // Parse and append row
            const parser = new DOMParser();
            const doc = parser.parseFromString(rowHTML, 'text/html');
            const row = doc.body.querySelector('tr');
            if (row) {
                tbody.appendChild(row.cloneNode(true));
            }

            // Add duration row between steps (except after last step)
            if (i < timelineData.length - 1) {
                const nextStep = timelineData[i + 1];
                
                // Extract dates from DateEnvelope objects if needed
                let currentDateObj = null;
                let nextDateObj = null;
                
                if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                    currentDateObj = window.dateUtils.toDateObject(step.date);
                    nextDateObj = window.dateUtils.toDateObject(nextStep.date);
                } else {
                    // Fallback: handle DateEnvelope manually
                    if (step.date && typeof step.date === 'object' && 'epochMs' in step.date) {
                        currentDateObj = new Date(step.date.epochMs);
                    } else if (step.date && typeof step.date === 'object' && 'utc' in step.date) {
                        currentDateObj = new Date(step.date.utc);
                    } else {
                        currentDateObj = new Date(step.date);
                    }
                    
                    if (nextStep.date && typeof nextStep.date === 'object' && 'epochMs' in nextStep.date) {
                        nextDateObj = new Date(nextStep.date.epochMs);
                    } else if (nextStep.date && typeof nextStep.date === 'object' && 'utc' in nextStep.date) {
                        nextDateObj = new Date(nextStep.date.utc);
                    } else {
                        nextDateObj = new Date(nextStep.date);
                    }
                }
                
                if (!currentDateObj || !nextDateObj || isNaN(currentDateObj.getTime()) || isNaN(nextDateObj.getTime())) {
                    continue; // Skip duration calculation if dates are invalid
                }
                
                const durationMs = nextDateObj.getTime() - currentDateObj.getTime();
                
                let durationText = '';
                if (window.dateUtils && typeof window.dateUtils.formatDurationParts === 'function') {
                    durationText = window.dateUtils.formatDurationParts(durationMs, { format: 'dhm', includeSeconds: false });
                } else {
                    // Fallback calculation
                    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationText = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                }

                const durationRowHTML = `
                    <tr class="timeline-duration-row">
                        <td colspan="4" class="text-center py-2" style="background-color: var(--bs-gray-100, #f8f9fa);">
                            <small class="text-muted">
                                <i class="bi bi-clock"></i> משך זמן: ${durationText}
                            </small>
                        </td>
                    </tr>
                `;

                const durationDoc = parser.parseFromString(durationRowHTML, 'text/html');
                const durationRow = durationDoc.body.querySelector('tr');
                if (durationRow) {
                    tbody.appendChild(durationRow.cloneNode(true));
                }
            }
        }

        // Setup click handlers for detail buttons
        tbody.querySelectorAll('button[data-onclick]').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const onclick = button.getAttribute('data-onclick');
                if (!onclick) return false;
                
                try {
                    // Extract entity type and ID from row
                    const row = button.closest('tr');
                    const stepId = row ? row.getAttribute('data-step-id') : null;
                    const entityType = row ? row.getAttribute('data-entity-type') : null;
                    
                    // Use showEntityDetails if available (preferred method)
                    if (window.showEntityDetails && typeof window.showEntityDetails === 'function' && entityType && stepId) {
                        await window.showEntityDetails(entityType, parseInt(stepId), { mode: 'view' });
                        return false;
                    }
                    
                    // Fallback: try to execute the onclick string
                    // Remove 'return false;' and execute
                    const cleanOnclick = onclick.replace(/;\s*return\s+false;?/g, '').trim();
                    if (cleanOnclick) {
                        // Try to evaluate as function call
                        if (cleanOnclick.startsWith('window.') || cleanOnclick.includes('(')) {
                            // Execute as function call
                            const fn = new Function('return (' + cleanOnclick + ')')();
                            if (typeof fn === 'function') {
                                await fn();
                            } else if (typeof fn === 'object' && fn !== null && typeof fn.then === 'function') {
                                // It's a promise
                                await fn;
                            }
                        } else {
                            // Try direct evaluation
                            eval(cleanOnclick);
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.error('Error executing timeline step action', { 
                            page: 'trade-history-page', 
                            error: error?.message || error,
                            onclick,
                            stack: error?.stack
                        });
                    }
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError('שגיאה', 'לא ניתן לפתוח את פרטי הרשומה');
                    }
                }
                
                return false;
            });
        });
    }

    /**
     * Render timeline steps using FieldRendererService (legacy method - kept for backward compatibility)
     */
    async function renderTimelineSteps(timelineData) {
        if (!timelineData || !Array.isArray(timelineData)) return;

        // Use new table rendering method
        await renderTimelineStepsTable(timelineData);

        // Also render to legacy timeline view (hidden by default)
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
                    } else if (step.type === 'Alert' || step.type === 'Alert Activation') {
                        stepClass += ' timeline-alert';
                        pointColor = 'var(--warning-color, #ffc107)';
                        iconPath = await window.IconSystem.getEntityIcon('alert');
                    } else if (step.type === 'Trade Plan') {
                        stepClass += ' timeline-plan';
                        pointColor = 'var(--primary-color, #007bff)';
                        iconPath = await window.IconSystem.getEntityIcon('trade_plan');
                    } else if (step.type === 'Trade') {
                        stepClass += ' timeline-trade';
                        pointColor = 'var(--primary-color, #007bff)';
                        iconPath = await window.IconSystem.getEntityIcon('trade');
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
                    } else if (step.type === 'Alert' || step.type === 'Alert Activation') {
                        stepClass += ' timeline-alert';
                        pointColor = 'var(--warning-color, #ffc107)';
                        iconPath = '/trading-ui/images/icons/entities/alerts.svg';
                    } else if (step.type === 'Trade Plan') {
                        stepClass += ' timeline-plan';
                        pointColor = 'var(--primary-color, #007bff)';
                        iconPath = '/trading-ui/images/icons/entities/trade_plans.svg';
                    } else if (step.type === 'Trade') {
                        stepClass += ' timeline-trade';
                        pointColor = 'var(--primary-color, #007bff)';
                        iconPath = '/trading-ui/images/icons/entities/trades.svg';
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
                } else if (step.type === 'Alert' || step.type === 'Alert Activation') {
                    stepClass += ' timeline-alert';
                    pointColor = 'var(--warning-color, #ffc107)';
                    iconPath = '/trading-ui/images/icons/entities/alerts.svg';
                } else if (step.type === 'Trade Plan') {
                    stepClass += ' timeline-plan';
                    pointColor = 'var(--primary-color, #007bff)';
                    iconPath = '/trading-ui/images/icons/entities/trade_plans.svg';
                } else if (step.type === 'Trade') {
                    stepClass += ' timeline-trade';
                    pointColor = 'var(--primary-color, #007bff)';
                    iconPath = '/trading-ui/images/icons/entities/trades.svg';
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
                               (step.type === 'Trade' ? 'trade' :
                               (step.type === 'Execution' ? 'execution' : 
                               (step.type === 'Cash Flow' ? 'cashflow' : 
                               (step.type === 'Note' ? 'note' : 
                               (step.type === 'Alert' || step.type === 'Alert Activation' ? 'alert' : 'default')))));

            let onClickFn = '';
            if (step.type === 'Cash Flow') {
                onClickFn = `showCashFlowDetails(${stepId})`;
            } else if (step.type === 'Note') {
                onClickFn = `showNoteDetails(${stepId})`;
            } else if (step.type === 'Alert' || step.type === 'Alert Activation') {
                onClickFn = `showAlertDetails(${stepId})`;
            } else if (step.type === 'Trade Plan') {
                onClickFn = `showTradePlanDetails(${stepId})`;
            } else if (step.type === 'Trade') {
                onClickFn = `showTradeDetails(${stepId})`;
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
                                        const entityType = step.type === 'Note' ? 'note' : 
                                                          step.type === 'Cash Flow' ? 'cash_flow' : 
                                                          step.type === 'Alert' || step.type === 'Alert Activation' ? 'alert' : 
                                                          step.type === 'Trade Plan' ? 'trade_plan' : 
                                                          step.type === 'Trade' ? 'trade' : 
                                                          'execution';
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
                        ${step.created_at ? `<div class="timeline-step-details text-muted"><small>תאריך יצירה: ${formatDate(step.created_at)}</small></div>` : ''}
                        ${step.trade_created_at ? `<div class="timeline-step-details text-muted"><small>תאריך יצירת טרייד: ${formatDate(step.trade_created_at)}</small></div>` : ''}
                        ${step.plan_created_at ? `<div class="timeline-step-details text-muted"><small>תאריך יצירת תוכנית: ${formatDate(step.plan_created_at)}</small></div>` : ''}
                        <a href="#" class="timeline-step-link" data-onclick="${onClickFn}; return false;">פרטים מלאים →</a>
                    </div>
                </div>
            `;
        }));

        timelineEl.textContent = '';
        const parser = new DOMParser();
        stepsHTML.forEach(stepHTML => {
            const doc = parser.parseFromString(stepHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                timelineEl.appendChild(node.cloneNode(true));
            });
        });
        timelineEl.classList.remove('loading');
    }

    /**
     * Render plan vs execution comparison table
     */
    async function renderPlanVsExecution(comparisonData) {
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
    async function updatePlanVsExecutionTable(comparisonData) {
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
        }));

        tbodyEl.textContent = '';
        const parser = new DOMParser();
        rowsHTML.forEach(rowHTML => {
            const doc = parser.parseFromString(rowHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                tbodyEl.appendChild(node.cloneNode(true));
            });
        });
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
            // Silent error - saving page state is not critical for user experience
            if (window.Logger) {
                window.Logger.warn('Error saving page state', { page: 'trade-history-page', error });
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
            // Silent error - loading page state is not critical for user experience
            if (window.Logger) {
                window.Logger.warn('Error loading page state', { page: 'trade-history-page', error });
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
    // Export immediately to ensure availability for UnifiedAppInitializer
    window.tradeHistoryPage = {
        openTradeSelectorModal,
        applyTradeFilters,
        clearTradeFilters,
        viewTradeDetails,
        selectTradeForAnalysis,
        clearSelectedTrade,
        getTradeIdFromURL,
        updateURLWithTradeId,
        showTickerSearchModal,
        selectTickerForTradeHistory,
        selectTradeForHistory,
        renderTradesForSelection,
        getCSSVariableValue,
        getInvestmentTypeText,
        formatDate,
        initializePage, // Export for UnifiedAppInitializer
        loadDataFromCache,
        loadTrades,
        saveToCache,
        savePageState,
        loadPageState,
        restoreChartZoomState,
        getTimelineData: () => {
            // Try to get from current tradeHistoryData first
            if (window.tradeHistoryData && window.tradeHistoryData.timelineData) {
                return window.tradeHistoryData.timelineData;
            }
            // Fallback to stored tradeHistoryData
            if (tradeHistoryData && tradeHistoryData.timelineData) {
                return tradeHistoryData.timelineData;
            }
            return [];
        }
    };

    /**
     * Calculate enhanced trade statistics using EOD data
     *
     * @param {Array} eodData - EOD portfolio metrics data
     * @param {Object} tradeData - Trade data for context
     * @returns {Object} Enhanced statistics
     */
    function calculateEODTradeStatistics(eodData, tradeData) {
        if (!Array.isArray(eodData) || eodData.length === 0) {
            return null;
        }

        try {
            // Filter EOD data to relevant period (around trade dates)
            let filteredData = eodData;

            if (tradeData && tradeData.created_at) {
                const tradeStart = new Date(tradeData.created_at);
                const tradeEnd = tradeData.closed_at ? new Date(tradeData.closed_at) : new Date();

                // Extend range by 30 days before and after for context
                const extendedStart = new Date(tradeStart);
                extendedStart.setDate(extendedStart.getDate() - 30);

                const extendedEnd = new Date(tradeEnd);
                extendedEnd.setDate(extendedEnd.getDate() + 30);

                filteredData = eodData.filter(record => {
                    const recordDate = new Date(record.date_utc);
                    return recordDate >= extendedStart && recordDate <= extendedEnd;
                });
            }

            if (filteredData.length === 0) {
                return null;
            }

            // Calculate EOD-based statistics
            const navValues = filteredData.map(r => r.nav_total).filter(v => v !== null && v !== undefined);
            const realizedPLValues = filteredData.map(r => r.realized_pl_amount).filter(v => v !== null && v !== undefined);
            const unrealizedPLValues = filteredData.map(r => r.unrealized_pl_amount).filter(v => v !== null && v !== undefined);

            const stats = {};

            // NAV statistics
            if (navValues.length > 0) {
                stats.average_nav = navValues.reduce((a, b) => a + b, 0) / navValues.length;
                stats.min_nav = Math.min(...navValues);
                stats.max_nav = Math.max(...navValues);
                stats.nav_volatility = calculateVolatility(navValues);
            }

            // P&L statistics
            if (realizedPLValues.length > 0) {
                stats.total_realized_pl_eod = realizedPLValues.reduce((a, b) => a + b, 0);
                stats.average_realized_pl = realizedPLValues.reduce((a, b) => a + b, 0) / realizedPLValues.length;
            }

            if (unrealizedPLValues.length > 0) {
                stats.total_unrealized_pl_eod = unrealizedPLValues.reduce((a, b) => a + b, 0);
                stats.average_unrealized_pl = unrealizedPLValues.reduce((a, b) => a + b, 0) / unrealizedPLValues.length;
            }

            // Total P&L from EOD
            if (stats.total_realized_pl_eod !== undefined && stats.total_unrealized_pl_eod !== undefined) {
                stats.total_pl_eod = stats.total_realized_pl_eod + stats.total_unrealized_pl_eod;
            }

            // TWR statistics
            const twrValues = filteredData.map(r => r.twr_daily).filter(v => v !== null && v !== undefined);
            if (twrValues.length > 0) {
                stats.average_twr_daily = twrValues.reduce((a, b) => a + b, 0) / twrValues.length;
                stats.twr_volatility = calculateVolatility(twrValues);
                stats.best_twr_day = Math.max(...twrValues);
                stats.worst_twr_day = Math.min(...twrValues);
            }

            // Performance metrics
            const twrMtdValues = filteredData.map(r => r.twr_mtd).filter(v => v !== null && v !== undefined);
            if (twrMtdValues.length > 0) {
                stats.average_twr_mtd = twrMtdValues.reduce((a, b) => a + b, 0) / twrMtdValues.length;
            }

            const twrYtdValues = filteredData.map(r => r.twr_ytd).filter(v => v !== null && v !== undefined);
            if (twrYtdValues.length > 0) {
                stats.average_twr_ytd = twrYtdValues.reduce((a, b) => a + b, 0) / twrYtdValues.length;
            }

            // Risk metrics
            const drawdownValues = filteredData.map(r => r.max_drawdown_to_date).filter(v => v !== null && v !== undefined);
            if (drawdownValues.length > 0) {
                stats.max_drawdown = Math.min(...drawdownValues); // Most negative drawdown
                stats.average_drawdown = drawdownValues.reduce((a, b) => a + b, 0) / drawdownValues.length;
            }

            // Data quality info
            stats.eod_records_count = filteredData.length;
            stats.data_quality_status = filteredData[filteredData.length - 1]?.data_quality_status || 'unknown';

            return stats;

        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to calculate EOD trade statistics', {
                    page: 'trade-history-page',
                    error: error.message
                });
            }
            return null;
        }
    }

    /**
     * Calculate volatility (standard deviation) of an array of values
     *
     * @param {Array<number>} values - Array of numeric values
     * @returns {number} Volatility (standard deviation)
     */
    function calculateVolatility(values) {
        if (!Array.isArray(values) || values.length < 2) {
            return 0;
        }

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);

        return Math.sqrt(variance);
    }

    // Log export for debugging
    if (window.Logger) {
        window.Logger.debug('✅ tradeHistoryPage exported', { page: 'trade-history-page' });
    }

})();

