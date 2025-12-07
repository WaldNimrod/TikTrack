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
        
        try {
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
            
            // Check if we have historical prices for this range
            // Use the chart data endpoint to check
            if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeChartData === 'function') {
                try {
                    const chartData = await window.TradeHistoryData.loadTradeChartData(tradeId, {
                        days_before: 7,
                        days_after: 7,
                        force: false // Use cache if available
                    });
                    
                    // Check if we have market prices
                    const hasMarketPrices = chartData && chartData.market_prices && chartData.market_prices.length > 0;
                    
                    if (!hasMarketPrices) {
                        // Show confirmation dialog to fetch missing data
                        const confirmed = await showMissingHistoricalDataConfirmation(tickerSymbol, checkStartDate, checkEndDate);
                        if (confirmed && window.ExternalDataService && typeof window.ExternalDataService.refreshTickerData === 'function') {
                            // Fetch historical data
                            const overlayId = `fetchHistoricalData-${tickerId}`;
                            if (window.UnifiedProgressManager) {
                                window.UnifiedProgressManager.showProgress(overlayId, {
                                    message: `טוען נתונים היסטוריים עבור ${tickerSymbol}...`,
                                    showCancel: false
                                });
                            }
                            
                            try {
                                // Calculate days back needed
                                const daysDiff = Math.ceil((checkEndDate - checkStartDate) / (1000 * 60 * 60 * 24));
                                const daysBack = Math.max(daysDiff, 150); // At least 150 days for technical indicators
                                
                                await window.ExternalDataService.refreshTickerData(tickerId, {
                                    forceRefresh: false,
                                    includeHistorical: true,
                                    daysBack: daysBack
                                });
                                
                                if (window.Logger) {
                                    window.Logger.info('✅ Historical data fetched successfully', { 
                                        page: 'trade-history-page',
                                        tickerId,
                                        daysBack 
                                    });
                                }
                                
                                // Reload trade analysis with new data
                                if (tradeId) {
                                    await loadTradeForAnalysis(tradeId);
                                }
                                
                                if (window.NotificationSystem) {
                                    window.NotificationSystem.showSuccess('נתונים נטענו', `נתונים היסטוריים עבור ${tickerSymbol} נטענו בהצלחה`);
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
                            } finally {
                                if (window.UnifiedProgressManager) {
                                    window.UnifiedProgressManager.hideProgress(overlayId);
                                }
                            }
                        }
                    }
                } catch (checkError) {
                    if (window.Logger) {
                        window.Logger.warn('Error checking for missing historical prices', { 
                            page: 'trade-history-page',
                            tickerId,
                            error: checkError?.message || checkError 
                        });
                    }
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
        }
    }
    
    /**
     * Show confirmation dialog for missing historical data
     * @param {string} tickerSymbol - Ticker symbol
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<boolean>} True if user approved
     */
    async function showMissingHistoricalDataConfirmation(tickerSymbol, startDate, endDate) {
        return new Promise((resolve) => {
            const startDateStr = window.FieldRendererService?.renderDate(startDate, false) || startDate.toLocaleDateString('he-IL');
            const endDateStr = window.FieldRendererService?.renderDate(endDate, false) || endDate.toLocaleDateString('he-IL');
            
            const message = `חסרים נתוני מחיר היסטוריים עבור ${tickerSymbol}:\n\n` +
                          `📅 טווח נדרש: ${startDateStr} - ${endDateStr}\n\n` +
                          `האם לטעון נתונים היסטוריים מהספק החיצוני?\n\n` +
                          `הערה: רק הנתונים החסרים ייטענו. נתונים קיימים יישמרו.`;
            
            if (window.showConfirmationDialog && typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    'נתונים היסטוריים חסרים',
                    message,
                    () => resolve(true),
                    () => resolve(false)
                );
            } else {
                resolve(confirm(message));
            }
        });
    }

    /**
     * Load trade for analysis
     * @param {number} tradeId - Trade ID
     */
    async function loadTradeForAnalysis(tradeId) {
        if (window.Logger) {
            window.Logger.info(`Loading trade ${tradeId} for analysis...`, { page: 'trade-history-page', tradeId });
        }
        
        try {
            // 1. Fetch trade data from API using EntityDetailsAPI if available
            let tradeData = null;
            if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                tradeData = await window.entityDetailsAPI.getEntityDetails('trade', tradeId, {
                    includeLinkedItems: true
                });
            } else {
                // Fallback: fetch directly from API
                const response = await fetch(`/api/trades/${tradeId}`);
                if (response.ok) {
                    const data = await response.json();
                    tradeData = data?.data || data;
                } else if (response.status === 404) {
                    throw new Error('Trade not found');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            if (!tradeData) {
                throw new Error('Trade not found');
            }
            
            // 2. Try to load timeline data from new API endpoint first
            let timelineData = [];
            
            // Use new API endpoint for full analysis if available
            if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeFullAnalysis === 'function') {
                try {
                    const fullAnalysis = await window.TradeHistoryData.loadTradeFullAnalysis(tradeId, {
                        days_before: 7,
                        days_after: 7,
                        include_durations: true
                    });
                    
                    if (fullAnalysis && fullAnalysis.timeline && Array.isArray(fullAnalysis.timeline)) {
                        timelineData = fullAnalysis.timeline;
                        if (window.Logger) {
                            window.Logger.debug('Loaded timeline from API', { 
                                page: 'trade-history-page', 
                                items: timelineData.length 
                            });
                        }
                        
                        // Store chart data if available
                        if (fullAnalysis.chart_data) {
                            if (!window.tradeHistoryData) {
                                window.tradeHistoryData = {};
                            }
                            window.tradeHistoryData.chartData = fullAnalysis.chart_data;
                        }
                        
                        // Check for missing historical prices and offer to fetch them
                        if (tradeData.ticker_id && timelineData.length > 0) {
                            await checkAndFetchMissingHistoricalPrices(tradeData.ticker_id, tradeData.ticker?.symbol || `#${tradeData.ticker_id}`, timelineData, tradeId);
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to load timeline from API, using fallback', { 
                            page: 'trade-history-page', 
                            error: error?.message || error 
                        });
                    }
                }
            }
            
            // Fallback: Create timeline data from linked items if API didn't return data
            if (timelineData.length === 0) {
            
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
                
                // Calculate cumulative position and P/L for chart
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
                        
                        // Calculate unrealized PL (placeholder - would need current price)
                        const unrealizedPL = 0;
                        const totalPL = cumulativeRealizedPL + unrealizedPL;
                        
                        return {
                            ...point,
                            positionSize: currentPosition,
                            realizedPL: cumulativeRealizedPL,
                            unrealizedPL: unrealizedPL,
                            totalPL: totalPL
                        };
                    });
                }
                
                if (window.Logger) {
                    window.Logger.debug('Created timeline data from linked items', { 
                        page: 'trade-history-page', 
                        totalItems: tradeData.linked_items.length,
                        timelineItems: timelineData.length,
                        executions: timelineData.filter(t => t.type === 'Execution').length
                    });
                }
            }
            
            // 3. Load trade history data for this specific trade (using ticker_id from trade data)
            // Note: We don't need to load all trades, just use the trade data we already have
            const tradeHistoryData = {
                trades: [tradeData],
                count: 1,
                timelineData: timelineData
            };
            
            // Store globally for chart access
            window.tradeHistoryData = tradeHistoryData;
            if (window.tradeHistoryPage) {
                window.tradeHistoryPage.tradeHistoryData = tradeHistoryData;
            }
            
            // 4. Calculate statistics from trade data and timeline data
            let statistics = {};
            
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
                
                // Close date: closed_at or last execution date (sell action) or current date
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
                    
                    // If still no close date, use current date
                    if (!closeDate && entryDate) {
                        closeDate = new Date();
                    }
                } else if (entryDate) {
                    // If no closed_at and no timeline data, use current date
                    closeDate = new Date();
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
            
            // Get P/L from trade data
            const totalPL = tradeData.realized_pl || tradeData.pl || tradeData.total_pl || 0;
            
            // Calculate P/L percent if not provided
            let totalPLPercent = tradeData.pl_percent || tradeData.total_pl_percent || 0;
            if (totalPLPercent === 0 && totalPL !== 0 && tradeData.entry_price) {
                // Calculate percent: (P/L / entry_price) * 100
                const entryPrice = tradeData.entry_price || 0;
                if (entryPrice > 0) {
                    totalPLPercent = (totalPL / (entryPrice * (tradeData.planned_quantity || tradeData.quantity || 1))) * 100;
                }
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
            
            // 5. Load plan vs execution analysis (if dates are available)
            let planVsExecution = {};
            if (tradeData.created_at) {
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
                window.Logger.debug('Rendering trade details', { 
                    page: 'trade-history-page', 
                    tradeId,
                    hasConditions: !!(tradeData.conditions && tradeData.conditions.length > 0)
                });
            }
            renderTradeDetails(tradeData, tradeData.conditions || []);
            
            if (statistics && Object.keys(statistics).length > 0) {
                if (window.Logger) {
                    window.Logger.debug('Rendering statistics', { page: 'trade-history-page' });
                }
                renderStatistics(statistics);
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping statistics render - no statistics data', { page: 'trade-history-page' });
                }
            }
            
            // 8. Update timeline and charts
            if (tradeHistoryData.timelineData && tradeHistoryData.timelineData.length > 0) {
                if (window.Logger) {
                    window.Logger.debug('Rendering timeline', { 
                        page: 'trade-history-page', 
                        timelineSteps: tradeHistoryData.timelineData.length 
                    });
                }
                // Use new API endpoint for timeline data
                if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeFullAnalysis === 'function') {
                    try {
                        const fullAnalysis = await window.TradeHistoryData.loadTradeFullAnalysis(tradeId, {
                            days_before: 7,
                            days_after: 7,
                            include_durations: true
                        });
                        
                        if (fullAnalysis && fullAnalysis.timeline) {
                            if (window.Logger) {
                                window.Logger.debug('Rendering timeline from full analysis', { 
                                    page: 'trade-history-page', 
                                    timelineItems: fullAnalysis.timeline.length 
                                });
                            }
                            await renderTimelineSteps(fullAnalysis.timeline);
                            
                            // Store chart data if available
                            if (fullAnalysis.chart_data) {
                                if (!window.tradeHistoryData) {
                                    window.tradeHistoryData = {};
                                }
                                window.tradeHistoryData.chartData = fullAnalysis.chart_data;
                            }
                        } else {
                            if (window.Logger) {
                                window.Logger.debug('Rendering timeline from tradeHistoryData', { 
                                    page: 'trade-history-page', 
                                    timelineItems: (tradeHistoryData.timelineData || []).length 
                                });
                            }
                            await renderTimelineSteps(tradeHistoryData.timelineData || []);
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.warn('Failed to load full analysis, using fallback', { 
                                page: 'trade-history-page', 
                                error: error?.message || error,
                                stack: error?.stack
                            });
                        }
                        await renderTimelineSteps(tradeHistoryData.timelineData || []);
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.debug('Rendering timeline directly from tradeHistoryData (no full analysis)', { 
                            page: 'trade-history-page', 
                            timelineItems: (tradeHistoryData.timelineData || []).length 
                        });
                    }
                    await renderTimelineSteps(tradeHistoryData.timelineData || []);
                }
                
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
                                    dataLength: window.tradeHistoryData?.timelineData?.length || 0
                                });
                            }
                            // Wait a bit more and check again
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                        
                        const chartContainer = document.getElementById('timelineChart');
                        if (chartContainer && typeof window.initTimelineChart === 'function') {
                            if (window.Logger) {
                                window.Logger.debug('Initializing timeline chart with data', { 
                                    page: 'trade-history-page',
                                    dataPoints: window.tradeHistoryData?.timelineData?.length || 0
                                });
                            }
                            await window.initTimelineChart();
                        } else {
                            if (window.Logger) {
                                window.Logger.warn('Timeline chart container or initTimelineChart not available', { 
                                    page: 'trade-history-page',
                                    hasContainer: !!chartContainer,
                                    hasInitFunction: typeof window.initTimelineChart === 'function'
                                });
                            }
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('Error initializing timeline chart', { page: 'trade-history-page', error });
                        }
                    }
                }, 1000); // Longer delay to ensure data is loaded
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping timeline render - no timeline data', { 
                        page: 'trade-history-page',
                        hasTimelineData: !!tradeHistoryData.timelineData,
                        timelineDataLength: tradeHistoryData.timelineData?.length || 0
                    });
                }
            }
            
            // 8. Update plan vs execution table
            if (planVsExecution && planVsExecution.analysis) {
                if (window.Logger) {
                    window.Logger.debug('Rendering plan vs execution', { 
                        page: 'trade-history-page', 
                        analysisItems: planVsExecution.analysis.length 
                    });
                }
                planVsExecutionData = planVsExecution.analysis;
                // Update table if exists
                const tableBody = document.getElementById('planVsExecutionTableBody');
                if (tableBody && planVsExecutionData.length > 0) {
                    // Render plan vs execution data
                    // This would be implemented based on the table structure
                }
            } else {
                if (window.Logger) {
                    window.Logger.debug('Skipping plan vs execution render - no analysis data', { page: 'trade-history-page' });
                }
            }
            
            // 9. Load linked items for this trade (already loaded in tradeData.linked_items, but render them)
            try {
                if (window.Logger) {
                    window.Logger.debug('Loading linked items', { page: 'trade-history-page', tradeId });
                }
                if (window.LinkedItemsService && typeof window.LinkedItemsService.loadLinkedItems === 'function') {
                    await window.LinkedItemsService.loadLinkedItems('trade', tradeId, 'linkedItemsContainer');
                } else if (typeof loadLinkedItemsData === 'function') {
                    const linkedItemsData = await loadLinkedItemsData('trade', tradeId);
                    if (linkedItemsData && window.LinkedItemsService && typeof window.LinkedItemsService.renderLinkedItems === 'function') {
                        window.LinkedItemsService.renderLinkedItems('linkedItemsContainer', linkedItemsData, 'trade', tradeId);
                    }
                }
                if (window.Logger) {
                    window.Logger.debug('Linked items loaded', { page: 'trade-history-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load linked items (non-critical)', { 
                        page: 'trade-history-page', 
                        error: error?.message 
                    });
                }
            }
            
            if (window.Logger) {
                window.Logger.info(`✅ Trade ${tradeId} loaded for analysis`, { 
                    page: 'trade-history-page', 
                    tradeId,
                    hasStatistics: Object.keys(statistics).length > 0,
                    hasPlanVsExecution: !!(planVsExecution && planVsExecution.analysis)
                });
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
                    },
                    credentials: 'include'
                });
                
            let allTickersWithCounts = [];
                if (response.ok) {
                    const payload = await response.json();
                allTickersWithCounts = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
                } else {
                    if (window.Logger) {
                    window.Logger.warn('Failed to load tickers with trade counts', { page: 'trade-history-page', status: response.status });
                }
            }
            
            // Filter tickers that have at least one trade and match the query
            // Use includes instead of startsWith to find matches anywhere in the text
            const queryUpper = searchQuery.toUpperCase();
            const filtered = allTickersWithCounts.filter(ticker => {
                const symbol = (ticker.symbol || '').toUpperCase();
                const name = (ticker.name || '').toUpperCase();
                const tradeCount = ticker.trade_count || 0;
                return (symbol.includes(queryUpper) || name.includes(queryUpper)) && tradeCount > 0;
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
                
                console.log('🔍 [TRADE HISTORY DEBUG] Trade-history endpoint response:', {
                    tickerId,
                    tradesData,
                    tradesCount: tradesData.trades?.length || 0,
                    firstTrade: tradesData.trades?.[0] || null,
                    firstTradeKeys: tradesData.trades?.[0] ? Object.keys(tradesData.trades[0]) : []
                });
                
                // Expand first trade in console for detailed inspection
                if (tradesData.trades?.[0]) {
                    console.log('🔍 [TRADE HISTORY DEBUG] First trade FULL DETAILS:', tradesData.trades[0]);
                    console.log('🔍 [TRADE HISTORY DEBUG] First trade JSON:', JSON.stringify(tradesData.trades[0], null, 2));
                }
                
                trades = tradesData.trades || [];
                
                if (trades.length > 0) {
                    console.log('🔍 [TRADE HISTORY DEBUG] Trades from trade-history endpoint:', {
                        count: trades.length,
                        firstTrade: trades[0],
                        firstTradeHasId: 'id' in trades[0],
                        firstTradeId: trades[0]?.id
                    });
                }
            } catch (error) {
                console.warn('⚠️ [TRADE HISTORY DEBUG] Failed to load from trade-history endpoint:', error);
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
                        },
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Log raw response structure - also to console for full visibility
                        console.log('🔍 [TRADE HISTORY DEBUG] Raw API response:', {
                            tickerId,
                            fullResponse: data,
                            hasData: 'data' in data,
                            isArray: Array.isArray(data),
                            dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data,
                            dataKeys: Object.keys(data || {}),
                            firstDataItem: data?.data?.[0] || data?.[0] || null
                        });
                        
                        if (window.Logger) {
                            window.Logger.debug('Raw API response structure', { 
                                page: 'trade-history-page', 
                                tickerId,
                                hasData: 'data' in data,
                                isArray: Array.isArray(data),
                                dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data,
                                dataKeys: Object.keys(data || {}),
                                firstDataItem: data?.data?.[0] ? Object.keys(data.data[0]).slice(0, 15) : null
                            });
                        }
                        
                        trades = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
                        
                        // Log trades structure - also to console
                        console.log('🔍 [TRADE HISTORY DEBUG] Parsed trades:', {
                            count: trades.length,
                            firstTrade: trades[0] || null,
                            firstTradeKeys: trades[0] ? Object.keys(trades[0]) : [],
                            allTrades: trades.map((t, idx) => ({
                                index: idx,
                                keys: Object.keys(t),
                                id: t.id,
                                trade_id: t.trade_id,
                                tradeId: t.tradeId,
                                allIdFields: Object.keys(t).filter(k => k.toLowerCase().includes('id'))
                            }))
                        });
                        
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
            
            // Log trades before rendering
            console.log('🔍 [TRADE HISTORY DEBUG] Trades before rendering:', {
                count: trades.length,
                trades: trades.map((t, idx) => ({
                    index: idx,
                    hasId: 'id' in t,
                    id: t.id,
                    trade_id: t.trade_id,
                    tradeId: t.tradeId,
                    keys: Object.keys(t),
                    sample: Object.fromEntries(Object.entries(t).slice(0, 5))
                }))
            });
            
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
                
                console.error('❌ [TRADE HISTORY DEBUG] Trade without ID found:', {
                    tradeIndex: index,
                    totalTrades: trades.length,
                    allKeys: allKeys,
                    idRelatedKeys: idRelatedKeys,
                    idRelatedValues: idRelatedKeys.reduce((acc, key) => {
                        acc[key] = trade[key];
                        return acc;
                    }, {}),
                    fullTrade: trade,
                    fullTradeJSON: JSON.stringify(trade, null, 2)
                });
                
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

            // Load linked items for selected trade (if not already loaded in loadTradeForAnalysis)
            if (selectedTradeId) {
                try {
                    if (window.Logger) {
                        window.Logger.debug('Loading linked items in renderPage', { 
                            page: 'trade-history-page', 
                            tradeId: selectedTradeId 
                        });
                    }
                    if (window.LinkedItemsService && typeof window.LinkedItemsService.loadLinkedItems === 'function') {
                        await window.LinkedItemsService.loadLinkedItems('trade', selectedTradeId, 'linkedItemsContainer');
                    } else if (typeof loadLinkedItemsData === 'function') {
                        const linkedItemsData = await loadLinkedItemsData('trade', selectedTradeId);
                        if (linkedItemsData && window.LinkedItemsService && typeof window.LinkedItemsService.renderLinkedItems === 'function') {
                            window.LinkedItemsService.renderLinkedItems('linkedItemsContainer', linkedItemsData, 'trade', selectedTradeId);
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to load linked items in renderPage (non-critical)', { 
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
        if (!statistics) return;

        // Duration - show active duration and planning/waiting duration
        const durationEl = document.getElementById('statDuration');
        if (durationEl) {
            let durationText = `${statistics.durationDays || 0} ימים`;
            if (statistics.planningWaitDays && statistics.planningWaitDays > 0) {
                durationText += ` <small class="text-muted">(תכנון והמתנה: ${statistics.planningWaitDays} ימים)</small>`;
            }
            safeSetInnerHTML(durationEl, durationText);
            durationEl.classList.remove('loading');
        }

        // Total P/L
        const totalPLEl = document.getElementById('statTotalPL');
        const totalPLPercentEl = document.getElementById('statTotalPLPercent');
        if (totalPLEl && window.FieldRendererService) {
            totalPLEl.textContent = '';
            const amountHTML = window.FieldRendererService.renderAmount(statistics.totalPL, '$', 0, true);
            const parser = new DOMParser();
            const doc = parser.parseFromString(amountHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                totalPLEl.appendChild(node.cloneNode(true));
            });
            totalPLEl.classList.remove('loading');
            
            if (totalPLPercentEl) {
                const percent = window.FieldRendererService.renderNumericValue(statistics.totalPLPercent, '%', true);
                totalPLPercentEl.textContent = '';
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`(${percent})`, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        totalPLPercentEl.appendChild(fragment);
                totalPLPercentEl.classList.remove('loading');
                if (statistics.totalPL >= 0) {
                    totalPLPercentEl.classList.add('positive');
                }
            }
        }

        // Return percent
        const returnPercentEl = document.getElementById('statReturnPercent');
        if (returnPercentEl && window.FieldRendererService) {
            returnPercentEl.textContent = '';
            const percentHTML = window.FieldRendererService.renderNumericValue(statistics.totalPLPercent, '%', true);
            const parser = new DOMParser();
            const doc = parser.parseFromString(percentHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                returnPercentEl.appendChild(node.cloneNode(true));
            });
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
            
            if (window.IconSystem && window.IconSystem.initialized) {
                try {
                    iconHTML = await window.IconSystem.renderIcon('entity', entityType, { size: '20', alt: step.type });
                } catch (error) {
                    iconHTML = `<i class="bi bi-circle" style="font-size: 20px;"></i>`;
                }
            } else {
                iconHTML = `<i class="bi bi-circle" style="font-size: 20px;"></i>`;
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

            // Build action button
            const stepId = step.id || i;
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

            // Create row HTML
            const rowHTML = `
                <tr data-step-index="${i}" data-step-id="${stepId}">
                    <td class="text-center">${iconHTML}</td>
                    <td><strong>${step.type || '-'}</strong></td>
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
            button.addEventListener('click', (e) => {
                const onclick = button.getAttribute('data-onclick');
                if (onclick) {
                    try {
                        // Execute the onclick function
                        const fn = new Function('return ' + onclick.replace('; return false;', ''))();
                        if (typeof fn === 'function') {
                            fn();
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('Error executing timeline step action', { page: 'trade-history-page', error });
                        }
                    }
                }
                e.preventDefault();
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

    // Log export for debugging
    if (window.Logger) {
        window.Logger.debug('✅ tradeHistoryPage exported', { page: 'trade-history-page' });
    }

})();

