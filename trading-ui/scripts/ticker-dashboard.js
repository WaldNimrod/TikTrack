/**
 * Ticker Dashboard Page
 * 
 * Comprehensive ticker dashboard with charts, KPIs, technical indicators,
 * user activity, and conditions
 * 
 * Documentation: See documentation/04-FEATURES/WIREFRAMES/ticker-dashboard-wireframe.md
 */

(function() {
    'use strict';

    let tickerId = null;
    let tickerData = null;
    let priceChart = null;

    /**
     * Resolve ticker symbol to ID
     * @param {string} symbol - Ticker symbol
     * @returns {Promise<number|null>} Ticker ID or null if not found
     */
    async function resolveTickerSymbolToId(symbol) {
        if (!symbol) {
            return null;
        }
        
        try {
            // First, try to find in cached tickers data if available
            if (window.tickersData && Array.isArray(window.tickersData)) {
                const ticker = window.tickersData.find(t => 
                    t.symbol === symbol || 
                    t.ticker_symbol === symbol ||
                    (t.symbol && t.symbol.toUpperCase() === symbol.toUpperCase()) ||
                    (t.ticker_symbol && t.ticker_symbol.toUpperCase() === symbol.toUpperCase())
                );
                if (ticker && ticker.id) {
                    if (window.Logger) {
                        window.Logger.debug('✅ Resolved ticker symbol to ID from cache', { symbol, tickerId: ticker.id, page: 'ticker-dashboard' });
                    }
                    return parseInt(ticker.id, 10);
                }
            }
            
            // If not in cache, try API call
            const response = await fetch(`/api/tickers/?symbol=${encodeURIComponent(symbol)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data && Array.isArray(data.data) && data.data.length > 0) {
                    // Find exact match (case-insensitive)
                    const ticker = data.data.find(t => 
                        (t.symbol && t.symbol.toUpperCase() === symbol.toUpperCase()) ||
                        (t.ticker_symbol && t.ticker_symbol.toUpperCase() === symbol.toUpperCase())
                    );
                    if (ticker && ticker.id) {
                        if (window.Logger) {
                            window.Logger.debug('✅ Resolved ticker symbol to ID from API', { symbol, tickerId: ticker.id, page: 'ticker-dashboard' });
                        }
                        return parseInt(ticker.id, 10);
                    }
                }
            }
            
            // If API doesn't support symbol filter, fetch all and search
            const allResponse = await fetch('/api/tickers/');
            if (allResponse.ok) {
                const allData = await allResponse.json();
                if (allData.status === 'success' && allData.data && Array.isArray(allData.data)) {
                    const ticker = allData.data.find(t => 
                        (t.symbol && t.symbol.toUpperCase() === symbol.toUpperCase()) ||
                        (t.ticker_symbol && t.ticker_symbol.toUpperCase() === symbol.toUpperCase())
                    );
                    if (ticker && ticker.id) {
                        if (window.Logger) {
                            window.Logger.debug('✅ Resolved ticker symbol to ID from full list', { symbol, tickerId: ticker.id, page: 'ticker-dashboard' });
                        }
                        return parseInt(ticker.id, 10);
                    }
                }
            }
            
            if (window.Logger) {
                window.Logger.warn('⚠️ Could not resolve ticker symbol to ID', { symbol, page: 'ticker-dashboard' });
            }
            return null;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error resolving ticker symbol to ID', { symbol, error: error.message || error, page: 'ticker-dashboard' });
            }
            return null;
        }
    }

    /**
     * Get ticker ID from URL parameters
     * @returns {Promise<number|null>} Ticker ID
     */
    async function getTickerIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('tickerId');
        const symbol = urlParams.get('tickerSymbol');
        
        if (id) {
            return parseInt(id, 10);
        }
        
        // If symbol provided, resolve to ID
        if (symbol) {
            const resolvedId = await resolveTickerSymbolToId(symbol);
            if (resolvedId) {
                return resolvedId;
            } else {
                if (window.Logger) {
                    window.Logger.warn('Ticker symbol provided but could not resolve to ID', { symbol, page: 'ticker-dashboard' });
                }
            }
        }
        
        return null;
    }

    /**
     * Restore page state (filters, sort, sections, entity filters)
     * @param {string} pageName - Page name
     * @returns {Promise<void>}
     */
    async function restorePageState(pageName) {
        try {
            // Initialize PageStateManager if not initialized
            if (window.PageStateManager && !window.PageStateManager.initialized) {
                await window.PageStateManager.initialize();
            }

            if (!window.PageStateManager || !window.PageStateManager.initialized) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
                }
                return;
            }

            // Migrate legacy data if exists
            await window.PageStateManager.migrateLegacyData(pageName);

            // Load full state
            const pageState = await window.PageStateManager.loadPageState(pageName);
            if (!pageState) {
                return; // No saved state
            }

            // Restore sections visibility
            if (pageState.sections) {
                Object.keys(pageState.sections).forEach(sectionId => {
                    const isHidden = pageState.sections[sectionId];
                    const section = document.getElementById(sectionId);
                    if (section) {
                        if (isHidden && window.toggleSection) {
                            // Section should be hidden - toggle if visible
                            const toggleButton = section.querySelector('[data-toggle-section]');
                            if (toggleButton && !section.classList.contains('hidden')) {
                                window.toggleSection(sectionId);
                            }
                        }
                    }
                });
            }

            if (window.Logger) {
                window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: 'ticker-dashboard' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Error restoring page state', { error, page: pageName });
            }
        }
    }

    /**
     * Initialize ticker dashboard
     */
    async function initTickerDashboard() {
        try {
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-top');
            }
            
            // Get ticker ID from URL (async - may need to resolve symbol)
            tickerId = await getTickerIdFromURL();
            if (!tickerId) {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('tickerId');
                const symbol = urlParams.get('tickerSymbol');
                if (symbol) {
                    throw new Error(`לא ניתן למצוא טיקר עם סימול: ${symbol}`);
                } else {
                    throw new Error('מזהה טיקר לא סופק ב-URL. נדרש: ?tickerId=123 או ?tickerSymbol=SYMBOL');
                }
            }
            
            // Load ticker data
            if (window.TickerDashboardData) {
                tickerData = await window.TickerDashboardData.loadTickerDashboardData(tickerId);
            } else {
                throw new Error('TickerDashboardData service not available');
            }
            
            // Update page title
            updatePageTitle();
            
            // Render KPI cards
            await renderKPICards();
            
            // Initialize price chart
            await initPriceChart();
            
            // Render technical indicators
            await renderTechnicalIndicators();
            
            // Render user activity
            await renderUserActivity();
            
            // Render conditions
            await renderConditions();
            
            // Restore page state (sections, filters, etc.)
            await restorePageState('ticker-dashboard');
            
            // Restore section states using unified system
            if (typeof window.restoreAllSectionStates === 'function') {
                await window.restoreAllSectionStates();
            }
            
            // Setup section toggle listeners to save state
            setupSectionStateSaving();
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-top');
            }
        } catch (error) {
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-top');
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה בטעינת דשבורד טיקר: ${error.message}`);
            }
            if (window.Logger) {
                window.Logger.error('❌ Error initializing ticker dashboard', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Update page title with ticker symbol
     */
    function updatePageTitle() {
        if (tickerData && tickerData.symbol) {
            const titleElement = document.getElementById('tickerDashboardTitle');
            if (titleElement) {
                titleElement.textContent = `דשבורד טיקר - ${tickerData.symbol}`;
            }
            document.title = `דשבורד טיקר - ${tickerData.symbol} - TikTrack`;
        }
    }

    /**
     * Render KPI cards
     */
    async function renderKPICards() {
        const container = document.getElementById('tickerKPICards');
        if (!container || !tickerData) return;
        
        try {
            const price = tickerData.current_price || tickerData.price || 0;
            const change = tickerData.daily_change || tickerData.change_amount || 0;
            const changePercent = tickerData.daily_change_percent || tickerData.change_percent || 0;
            const volume = tickerData.volume || 0;
            const atr = tickerData.atr || null;
            const currencySymbol = tickerData.currency_symbol || (tickerData.currency && tickerData.currency.symbol) || '$';
            
            // Format ATR
            let atrHtml = '';
            if (atr !== null && price && price > 0) {
                const atrPercent = (parseFloat(atr) / parseFloat(price)) * 100;
                if (window.FieldRendererService && typeof window.FieldRendererService.renderATR === 'function') {
                    atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
                } else {
                    if (window.Logger) {
                        window.Logger.warn('FieldRendererService.renderATR not available', { page: 'ticker-dashboard' });
                    }
                    atrHtml = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
                }
            }
            
            // Format volume
            const formattedVolume = volume > 0 ? volume.toLocaleString('he-IL') : 'N/A';
            
            // Format change - use FieldRendererService.renderNumericValue for percentage display
            let changeHtml = '';
            if (window.FieldRendererService) {
                if (typeof window.FieldRendererService.renderNumericValue === 'function') {
                    // Use renderNumericValue for percentage display (it handles positive/negative colors)
                    changeHtml = window.FieldRendererService.renderNumericValue(changePercent, '%', true);
                } else if (typeof window.FieldRendererService.renderAmount === 'function') {
                    // Fallback to renderAmount
                    changeHtml = window.FieldRendererService.renderAmount(changePercent, '%', 2, true);
                } else {
                    const changeColor = change >= 0 ? 'text-success' : 'text-danger';
                    const changeSign = change >= 0 ? '+' : '';
                    changeHtml = `<span class="${changeColor}" dir="ltr">${changeSign}${parseFloat(changePercent).toFixed(2)}%</span>`;
                }
            } else {
                const changeColor = change >= 0 ? 'text-success' : 'text-danger';
                const changeSign = change >= 0 ? '+' : '';
                changeHtml = `<span class="${changeColor}" dir="ltr">${changeSign}${parseFloat(changePercent).toFixed(2)}%</span>`;
            }
            
            // Format price - use FieldRendererService.renderAmount
            let priceHtml = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
                priceHtml = window.FieldRendererService.renderAmount(price, currencySymbol, 2, false);
            } else {
                priceHtml = `<span dir="ltr">${currencySymbol}${parseFloat(price).toFixed(2)}</span>`;
            }
            
            // Format 52W range
            const week52Low = tickerData['52w_low'] || tickerData.fifty_two_week_low || null;
            const week52High = tickerData['52w_high'] || tickerData.fifty_two_week_high || null;
            let week52Html = 'N/A';
            if (week52Low !== null && week52High !== null) {
                week52Html = `${parseFloat(week52Low).toFixed(2)} - ${parseFloat(week52High).toFixed(2)}`;
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Create KPI cards using createElement
            const kpiCards = [
                { label: 'מחיר', value: priceHtml, dir: '' },
                { label: 'שינוי', value: changeHtml, dir: '' },
                { label: 'ATR', value: atrHtml || 'N/A', dir: '' },
                { label: 'נפח', value: formattedVolume, dir: 'ltr' },
                { label: '52W', value: week52Html, dir: 'ltr' }
            ];
            
            kpiCards.forEach(kpi => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-2 col-sm-4 col-6';
                
                const cardDiv = document.createElement('div');
                cardDiv.className = 'kpi-card';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'kpi-label';
                labelDiv.textContent = kpi.label;
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'kpi-value';
                if (kpi.dir) {
                    valueDiv.setAttribute('dir', kpi.dir);
                }
                if (typeof kpi.value === 'string' && kpi.value.includes('<')) {
                    valueDiv.innerHTML = kpi.value; // Allow HTML for FieldRendererService output
                } else {
                    valueDiv.textContent = kpi.value;
                }
                
                cardDiv.appendChild(labelDiv);
                cardDiv.appendChild(valueDiv);
                colDiv.appendChild(cardDiv);
                container.appendChild(colDiv);
            });
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering KPI cards', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Initialize price chart
     */
    async function initPriceChart() {
        const container = document.getElementById('tickerPriceChartContainer');
        if (!container || !tickerData) return;
        
        try {
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-chart');
            }
            
            // Destroy existing chart
            if (priceChart && window.TradingViewChartAdapter) {
                window.TradingViewChartAdapter.destroyChart(priceChart);
            }
            
            // Get container dimensions
            const containerWidth = container.clientWidth || 800;
            const containerHeight = window.innerHeight * 0.5; // 50vh
            
            // Create chart
            if (window.TradingViewChartAdapter) {
                priceChart = window.TradingViewChartAdapter.createChart(container, {
                    layout: {
                        background: { type: 'solid', color: 'transparent' },
                        textColor: getCSSVariableValue('--text-color', '#333')
                    },
                    grid: {
                        vertLines: { visible: false },
                        horzLines: { visible: true, color: getCSSVariableValue('--border-color', '#e0e0e0') }
                    },
                    width: containerWidth,
                    height: containerHeight,
                    timeScale: {
                        visible: true,
                        timeVisible: true,
                        secondsVisible: false
                    },
                    rightPriceScale: {
                        borderVisible: true,
                        borderColor: getCSSVariableValue('--border-color', '#e0e0e0')
                    }
                });
                
                // Try to load historical price data
                if (tickerId && window.TickerDashboardData && typeof window.TickerDashboardData.loadHistoricalData === 'function') {
                    try {
                        const historicalData = await window.TickerDashboardData.loadHistoricalData(tickerId, { days: 30, interval: '1d' });
                        
                        if (historicalData && Array.isArray(historicalData) && historicalData.length > 0) {
                            // Convert historical data to TradingView format and add to chart
                            if (window.TradingViewChartAdapter && priceChart) {
                                // Format: [{ time: timestamp, open: number, high: number, low: number, close: number, volume: number }]
                                const formattedData = historicalData.map(item => ({
                                    time: item.timestamp || item.time || item.date,
                                    open: parseFloat(item.open || item.open_price || 0),
                                    high: parseFloat(item.high || item.high_price || 0),
                                    low: parseFloat(item.low || item.low_price || 0),
                                    close: parseFloat(item.close || item.close_price || item.price || 0),
                                    volume: parseFloat(item.volume || 0)
                                })).filter(item => item.close > 0); // Filter out invalid data
                                
                                if (formattedData.length > 0) {
                                    window.TradingViewChartAdapter.addCandlestickSeries(priceChart, formattedData);
                                    if (window.Logger) {
                                        window.Logger.info('✅ Historical data added to chart', { 
                                            tickerId, 
                                            dataPoints: formattedData.length, 
                                            page: 'ticker-dashboard' 
                                        });
                                    }
                                }
                            }
                        } else {
                            // Historical data not available - show placeholder
                            showChartPlaceholder('נתונים היסטוריים לא זמינים כרגע. הפיצ\'ר בפיתוח.');
                        }
                    } catch (e) {
                        if (window.Logger) {
                            window.Logger.warn('Error loading historical data', { 
                                tickerId,
                                error: e.message || e, 
                                page: 'ticker-dashboard' 
                            });
                        }
                        showChartPlaceholder('שגיאה בטעינת נתונים היסטוריים');
                    }
                } else {
                    // Historical data service not available - show placeholder
                    showChartPlaceholder('נתונים היסטוריים לא זמינים כרגע');
                }
            }
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-chart');
            }
        } catch (error) {
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-chart');
            }
            if (window.Logger) {
                window.Logger.error('❌ Error initializing price chart', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Render technical indicators
     */
    async function renderTechnicalIndicators() {
        const container = document.getElementById('tickerTechnicalIndicators');
        if (!container || !tickerData) return;
        
        try {
            const atr = tickerData.atr || null;
            const volatility = tickerData.volatility || null;
            
            let atrHtml = '';
            if (atr !== null && tickerData.current_price && tickerData.current_price > 0) {
                const atrPercent = (parseFloat(atr) / parseFloat(tickerData.current_price)) * 100;
                if (window.FieldRendererService && typeof window.FieldRendererService.renderATR === 'function') {
                    atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
                } else {
                    if (window.Logger) {
                        window.Logger.warn('FieldRendererService.renderATR not available', { page: 'ticker-dashboard' });
                    }
                    atrHtml = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
                }
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Create technical indicator cards using createElement
            const indicators = [
                { label: 'ATR', value: atrHtml || 'N/A', dir: '' },
                { label: 'Volatility', value: volatility ? `${volatility.toFixed(2)}%` : 'N/A', dir: 'ltr' },
                { label: 'Volume Profile', value: 'בפיתוח', dir: '' }
            ];
            
            indicators.forEach(indicator => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-4';
                
                const cardDiv = document.createElement('div');
                cardDiv.className = 'technical-indicator-card';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'indicator-label';
                labelDiv.textContent = indicator.label;
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'indicator-value';
                if (indicator.dir) {
                    valueDiv.setAttribute('dir', indicator.dir);
                }
                if (typeof indicator.value === 'string' && indicator.value.includes('<')) {
                    valueDiv.innerHTML = indicator.value; // Allow HTML for FieldRendererService output
                } else {
                    valueDiv.textContent = indicator.value;
                }
                
                cardDiv.appendChild(labelDiv);
                cardDiv.appendChild(valueDiv);
                colDiv.appendChild(cardDiv);
                container.appendChild(colDiv);
            });
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering technical indicators', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Render user activity
     */
    async function renderUserActivity() {
        const container = document.getElementById('tickerUserActivity');
        if (!container || !tickerId) return;
        
        try {
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-activity');
            }
            
            // Load user activity
            let activityData = null;
            if (window.TickerDashboardData) {
                activityData = await window.TickerDashboardData.loadTickerUserActivity(tickerId);
            }
            
            // Render using EntityDetailsRenderer if available
            if (window.entityDetailsRenderer && activityData) {
                // Get entity color for ticker from ColorSchemeSystem
                const entityColor = (window.getEntityColor && typeof window.getEntityColor === 'function')
                    ? window.getEntityColor('ticker')
                    : '';
                
                // Convert activityData to array if needed
                const itemsArray = Array.isArray(activityData) 
                    ? activityData 
                    : (activityData.linked_items || activityData.child_entities || activityData.parent_entities || []);
                
                if (itemsArray.length > 0) {
                    const html = window.entityDetailsRenderer.renderLinkedItems(
                        itemsArray,
                        entityColor,
                        'ticker',
                        tickerId,
                        { sourcePage: 'ticker-dashboard' },
                        { enablePagination: false }
                    );
                    // renderLinkedItems returns HTML string, so we use innerHTML here
                    // This is acceptable as it's from a centralized system
                    container.innerHTML = html;
                } else {
                    container.innerHTML = '';
                    const emptyDiv = document.createElement('div');
                    emptyDiv.className = 'text-muted';
                    emptyDiv.textContent = 'אין פעילות זמינה';
                    container.appendChild(emptyDiv);
                }
            } else {
                container.innerHTML = '';
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'text-muted';
                emptyDiv.textContent = 'אין פעילות זמינה';
                container.appendChild(emptyDiv);
            }
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-activity');
            }
        } catch (error) {
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-activity');
            }
            if (window.Logger) {
                window.Logger.error('❌ Error rendering user activity', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Render conditions
     */
    async function renderConditions() {
        const container = document.getElementById('tickerConditions');
        if (!container || !tickerId) return;
        
        try {
            // Load conditions
            let conditions = [];
            if (window.TickerDashboardData) {
                conditions = await window.TickerDashboardData.loadTickerConditions(tickerId);
            }
            
            // Clear container
            container.innerHTML = '';
            
            if (conditions && conditions.length > 0) {
                conditions.forEach(condition => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'condition-item';
                    
                    const descDiv = document.createElement('div');
                    descDiv.className = 'condition-description';
                    descDiv.textContent = condition.description || 'תנאי';
                    
                    itemDiv.appendChild(descDiv);
                    container.appendChild(itemDiv);
                });
            } else {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'text-muted';
                emptyDiv.textContent = 'אין תנאים זמינים';
                container.appendChild(emptyDiv);
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering conditions', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Show placeholder message in chart container
     * @param {string} message - Message to display
     */
    function showChartPlaceholder(message) {
        const chartContainer = document.getElementById('tickerPriceChartContainer');
        if (chartContainer && !chartContainer.querySelector('.chart-placeholder-message')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'chart-placeholder-message text-muted text-center p-4';
            placeholder.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; background: rgba(255, 255, 255, 0.9); border-radius: 8px; padding: 2rem;';
            placeholder.innerHTML = `<div>${message}</div><div class="small mt-2">הגרף מוכן לטעינת נתונים</div>`;
            chartContainer.appendChild(placeholder);
        }
    }

    /**
     * Helper function to get CSS variable value
     */
    function getCSSVariableValue(variableName, fallback) {
        try {
            if (typeof window !== 'undefined' && window.getComputedStyle) {
                const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
                if (value) {
                    const trimmed = value.trim();
                    if (trimmed) {
                        return trimmed;
                    }
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to read CSS variable', { variableName, error });
            }
        }
        return fallback;
    }

    /**
     * Refresh dashboard data
     */
    async function refreshData() {
        try {
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-top');
            }
            
            // Invalidate cache
            if (window.UnifiedCacheManager && tickerId) {
                await window.UnifiedCacheManager.invalidate(`ticker-dashboard-${tickerId}`, 'memory');
                await window.UnifiedCacheManager.invalidate(`ticker-user-activity-${tickerId}`, 'memory');
            }
            
            // Reload data with force refresh
            if (window.TickerDashboardData) {
                tickerData = await window.TickerDashboardData.loadTickerDashboardData(tickerId, { forceRefresh: true });
            } else {
                throw new Error('TickerDashboardData service not available');
            }
            
            // Re-render all components
            updatePageTitle();
            await renderKPICards();
            await initPriceChart();
            await renderTechnicalIndicators();
            await renderUserActivity();
            await renderConditions();
            
            // Show success notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess('רענון הושלם', 'הנתונים עודכנו בהצלחה');
            }
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-top');
            }
        } catch (error) {
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-top');
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה ברענון נתונים: ${error.message}`);
            }
            if (window.Logger) {
                window.Logger.error('❌ Error refreshing dashboard data', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Save page state (sections visibility)
     */
    async function savePageState() {
        try {
            if (!window.PageStateManager) {
                return;
            }

            if (!window.PageStateManager.initialized) {
                await window.PageStateManager.initialize();
            }

            // Collect section states
            const sections = {};
            const sectionElements = document.querySelectorAll('[data-section]');
            sectionElements.forEach(section => {
                const sectionId = section.getAttribute('data-section');
                if (sectionId) {
                    // Check if section is hidden
                    const sectionBody = section.querySelector('.section-body');
                    const isHidden = sectionBody ? sectionBody.style.display === 'none' || section.classList.contains('hidden') : false;
                    sections[sectionId] = isHidden;
                }
            });

            // Save state
            await window.PageStateManager.savePageState('ticker-dashboard', {
                sections: sections
            });

            if (window.Logger) {
                window.Logger.debug('✅ Page state saved', { page: 'ticker-dashboard', sectionsCount: Object.keys(sections).length });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Error saving page state', { error, page: 'ticker-dashboard' });
            }
        }
    }

    /**
     * Setup section state saving on toggle
     */
    function setupSectionStateSaving() {
        // Listen to section toggle events
        const sectionElements = document.querySelectorAll('[data-section]');
        sectionElements.forEach(section => {
            const toggleButton = section.querySelector('[data-onclick*="toggleSection"]');
            if (toggleButton) {
                // Use EventHandlerManager if available for delegated event handling
                if (window.EventHandlerManager) {
                    // EventHandlerManager will handle this automatically via data-onclick
                    // But we need to save state after toggle
                    const originalOnClick = toggleButton.getAttribute('data-onclick');
                    if (originalOnClick && originalOnClick.includes('toggleSection')) {
                        // Extract section ID from onclick
                        const sectionIdMatch = originalOnClick.match(/toggleSection\(['"]([^'"]+)['"]\)/);
                        if (sectionIdMatch) {
                            const sectionId = sectionIdMatch[1];
                            // Debounce save to avoid too many saves
                            const debouncedSave = debounce(() => {
                                savePageState();
                            }, 500);
                            
                            // Add listener to section for visibility changes
                            const observer = new MutationObserver(() => {
                                debouncedSave();
                            });
                            
                            const sectionBody = section.querySelector('.section-body');
                            if (sectionBody) {
                                observer.observe(sectionBody, {
                                    attributes: true,
                                    attributeFilter: ['style', 'class']
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Debounce helper function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Go back to tickers page
     */
    function goBack() {
        window.location.href = '/tickers.html';
    }

    // Export functions
    window.tickerDashboard = {
        init: initTickerDashboard,
        refreshData,
        goBack
    };

    // Note: Initialization is handled by unified-app-initializer via page-initialization-configs.js
    // The custom initializer will call window.tickerDashboard.init() after all systems are loaded

    if (window.Logger) {
        window.Logger.info('✅ TickerDashboard loaded', { page: 'ticker-dashboard' });
    }
})();

