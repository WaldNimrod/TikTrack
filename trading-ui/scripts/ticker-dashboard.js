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
            if (window.Logger) {
                window.Logger.info('🚀 initTickerDashboard START', { page: 'ticker-dashboard' });
            }
            
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-top');
            }
            
            // Get ticker ID from URL (async - may need to resolve symbol)
            tickerId = await getTickerIdFromURL();
            if (window.Logger) {
                window.Logger.info('📊 Ticker ID from URL', { tickerId, page: 'ticker-dashboard' });
            }
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
                if (window.Logger) {
                    window.Logger.info('📊 Loading ticker dashboard data...', { tickerId, page: 'ticker-dashboard' });
                }
                tickerData = await window.TickerDashboardData.loadTickerDashboardData(tickerId);
                if (window.Logger) {
                    window.Logger.info('✅ Ticker data loaded', { 
                        tickerId, 
                        hasData: !!tickerData, 
                        symbol: tickerData?.symbol,
                        price: tickerData?.current_price || tickerData?.price,
                        page: 'ticker-dashboard' 
                    });
                }
            } else {
                throw new Error('TickerDashboardData service not available');
            }
            
            if (!tickerData) {
                throw new Error('Failed to load ticker data - tickerData is null or undefined');
            }
            
            // Update page title
            updatePageTitle();
            
            // Render KPI cards
            if (window.Logger) {
                window.Logger.info('📊 Rendering KPI cards...', { page: 'ticker-dashboard' });
            }
            try {
                await renderKPICards();
                if (window.Logger) {
                    window.Logger.info('✅ renderKPICards completed successfully', { page: 'ticker-dashboard' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ renderKPICards failed', { error: error.message, stack: error.stack, page: 'ticker-dashboard' });
                }
                console.error('renderKPICards error:', error);
            }
            
            // Initialize price chart
            if (window.Logger) {
                window.Logger.info('📊 Initializing price chart...', { page: 'ticker-dashboard' });
            }
            try {
                await initPriceChart();
                if (window.Logger) {
                    window.Logger.info('✅ initPriceChart completed successfully', { page: 'ticker-dashboard' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ initPriceChart failed', { error: error.message, stack: error.stack, page: 'ticker-dashboard' });
                }
                console.error('initPriceChart error:', error);
            }
            
            // Technical indicators are now displayed in KPI Cards - no separate section needed
            
            // Render user activity
            if (window.Logger) {
                window.Logger.info('📊 Rendering user activity...', { page: 'ticker-dashboard' });
            }
            try {
                await renderUserActivity();
                if (window.Logger) {
                    window.Logger.info('✅ renderUserActivity completed successfully', { page: 'ticker-dashboard' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ renderUserActivity failed', { error: error.message, stack: error.stack, page: 'ticker-dashboard' });
                }
                console.error('renderUserActivity error:', error);
            }
            
            // Render conditions
            if (window.Logger) {
                window.Logger.info('📊 Rendering conditions...', { page: 'ticker-dashboard' });
            }
            try {
                await renderConditions();
                if (window.Logger) {
                    window.Logger.info('✅ renderConditions completed successfully', { page: 'ticker-dashboard' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ renderConditions failed', { error: error.message, stack: error.stack, page: 'ticker-dashboard' });
                }
                console.error('renderConditions error:', error);
            }
            
            if (window.Logger) {
                window.Logger.info('✅ initTickerDashboard COMPLETE', { page: 'ticker-dashboard' });
            }
            
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
        if (window.Logger) {
            window.Logger.info('📊 renderKPICards called', { 
                hasContainer: !!container, 
                hasTickerData: !!tickerData,
                tickerId,
                page: 'ticker-dashboard' 
            });
        }
        if (!container) {
            if (window.Logger) {
                window.Logger.error('❌ Container not found: tickerKPICards', { page: 'ticker-dashboard' });
            }
            return;
        }
        if (!tickerData) {
            if (window.Logger) {
                window.Logger.error('❌ tickerData is null or undefined', { tickerId, page: 'ticker-dashboard' });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'נתוני טיקר לא זמינים - לא ניתן להציג KPI Cards');
            }
            return;
        }
        
        // Validate required data
        const hasRequiredData = tickerData.current_price !== undefined || tickerData.price !== undefined;
        if (!hasRequiredData) {
            if (window.Logger) {
                window.Logger.warn('⚠️ tickerData missing required price data', { 
                    tickerId,
                    tickerDataKeys: Object.keys(tickerData),
                    page: 'ticker-dashboard' 
                });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'נתוני מחיר חסרים - לא ניתן להציג KPI Cards');
            }
            return;
        }
        
        try {
            const price = tickerData.current_price || tickerData.price || 0;
            const change = tickerData.daily_change || tickerData.change_amount || 0;
            const changePercent = tickerData.daily_change_percent || tickerData.change_percent || 0;
            const volume = tickerData.volume || 0;
            const atr = tickerData.atr || null;
            const week52High = tickerData.week52_high || null;
            const week52Low = tickerData.week52_low || null;
            const currencySymbol = tickerData.currency_symbol || (tickerData.currency && tickerData.currency.symbol) || '$';
            
            // Format ATR - use FieldRendererService.renderATR() only (no fallback)
            let atrHtml = '';
            if (atr !== null && price && price > 0) {
                const atrPercent = (parseFloat(atr) / parseFloat(price)) * 100;
                if (window.FieldRendererService && typeof window.FieldRendererService.renderATR === 'function') {
                    atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
                } else {
                    if (window.Logger) {
                        window.Logger.warn('FieldRendererService.renderATR not available', { page: 'ticker-dashboard' });
                    }
                    // If FieldRendererService not available, show N/A instead of fallback HTML
                    atrHtml = 'N/A';
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
            
            // Format 52W range - use week52_high and week52_low from backend
            let week52Html = 'N/A';
            if (week52High !== null && week52Low !== null) {
                let highFormatted, lowFormatted;
                if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
                    highFormatted = window.FieldRendererService.renderAmount(week52High, currencySymbol, 2, false);
                    lowFormatted = window.FieldRendererService.renderAmount(week52Low, currencySymbol, 2, false);
                } else {
                    highFormatted = `${currencySymbol}${parseFloat(week52High).toFixed(2)}`;
                    lowFormatted = `${currencySymbol}${parseFloat(week52Low).toFixed(2)}`;
                }
                week52Html = `${lowFormatted} - ${highFormatted}`;
            }
            
            // Clear container
            container.innerHTML = '';
            
            if (window.Logger) {
                window.Logger.info('📊 Creating KPI cards', { 
                    price,
                    changePercent,
                    volume,
                    atr,
                    page: 'ticker-dashboard' 
                });
            }
            
            // Get additional technical indicators
            const volatility = tickerData.volatility || null;
            const volatilityHtml = volatility ? `${volatility.toFixed(2)}%` : 'N/A';
            
            // Create KPI cards using createElement
            // All technical indicators are now unified in KPI Cards
            // Ensure atrHtml is a string, not a Promise
            const atrHtmlString = (typeof atrHtml === 'string') ? atrHtml : (atrHtml || 'N/A');
            const kpiCards = [
                { label: 'מחיר', value: priceHtml, dir: '', helpKey: null },
                { label: 'שינוי', value: changeHtml, dir: '', helpKey: null },
                { label: 'ATR', value: atrHtmlString, dir: '', helpKey: 'atr' },
                { label: '52W Range', value: week52Html, dir: 'ltr', helpKey: 'week52_range' },
                { label: 'נפח', value: formattedVolume, dir: 'ltr', helpKey: 'volume' },
                { label: 'תנודתיות', value: volatilityHtml, dir: 'ltr', helpKey: 'volatility' }
            ];
            
            kpiCards.forEach(kpi => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-2 col-sm-4 col-6';
                
                const cardDiv = document.createElement('div');
                cardDiv.className = 'kpi-card';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'kpi-label';
                
                // Add help icon for technical indicators
                if (window.TechnicalIndicatorsHelp && window.IconSystem && (kpi.label === 'ATR' || kpi.label === '52W Range' || kpi.label === 'תנודתיות' || kpi.label === 'נפח')) {
                    const helpKey = kpi.label === 'ATR' ? 'atr' : 
                                   kpi.label === '52W Range' ? 'week52_range' : 
                                   kpi.label === 'תנודתיות' ? 'volatility' : 
                                   kpi.label === 'נפח' ? 'volume' : null;
                    if (helpKey) {
                        const helpText = window.TechnicalIndicatorsHelp.getHelpText(helpKey);
                        // IconSystem.renderIcon returns a Promise, so we need to await it
                        try {
                            const helpIcon = await window.IconSystem.renderIcon('button', 'help', {
                                size: 14,
                                classes: 'ms-1 help-icon',
                                onclick: `window.NotificationSystem.showInfo('${kpi.label}', '${helpText.replace(/'/g, "\\'")}')`
                            });
                            // Ensure helpIcon is a string, not a Promise
                            const helpIconString = (typeof helpIcon === 'string') ? helpIcon : (helpIcon || '');
                            labelDiv.innerHTML = `${kpi.label}${helpIconString}`;
                        } catch (iconError) {
                            if (window.Logger) {
                                window.Logger.warn('Error rendering help icon', { 
                                    error: iconError.message, 
                                    helpKey, 
                                    page: 'ticker-dashboard' 
                                });
                            }
                            labelDiv.textContent = kpi.label;
                        }
                    } else {
                        labelDiv.textContent = kpi.label;
                    }
                } else {
                    labelDiv.textContent = kpi.label;
                }
                
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
            
            if (window.Logger) {
                window.Logger.info('✅ KPI cards rendered successfully', { 
                    cardsCount: kpiCards.length,
                    page: 'ticker-dashboard' 
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering KPI cards', { 
                    error: error.message, 
                    stack: error.stack,
                    tickerId,
                    hasTickerData: !!tickerData,
                    page: 'ticker-dashboard' 
                });
            }
            console.error('renderKPICards error:', error);
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה בתצוגת KPI Cards: ${error.message}`);
            }
        }
    }

    /**
     * Initialize price chart
     */
    async function initPriceChart() {
        const container = document.getElementById('tradingview_widget');
        if (window.Logger) {
            window.Logger.info('📊 initPriceChart called - Using TradingView Widget', { 
                hasContainer: !!container, 
                hasTickerData: !!tickerData,
                tickerId,
                tickerSymbol: tickerData?.symbol || tickerData?.ticker_symbol,
                page: 'ticker-dashboard' 
            });
        }
        if (!container) {
            if (window.Logger) {
                window.Logger.error('❌ Container not found: tradingview_widget', { page: 'ticker-dashboard' });
            }
            return;
        }
        if (!tickerData) {
            if (window.Logger) {
                window.Logger.error('❌ tickerData is null or undefined', { tickerId, page: 'ticker-dashboard' });
            }
            return;
        }
        
        try {
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-chart');
            }
            
            // Get ticker symbol and exchange
            const tickerSymbol = tickerData.symbol || tickerData.ticker_symbol || '';
            const exchange = tickerData.exchange || 'NASDAQ'; // Default to NASDAQ
            
            // Build TradingView symbol (e.g., "NASDAQ:QQQ")
            let tvSymbol = tickerSymbol;
            if (exchange && exchange.toUpperCase() !== 'NASDAQ' && exchange.toUpperCase() !== 'NYSE') {
                // Map common exchanges to TradingView format
                const exchangeMap = {
                    'NYSE': 'NYSE',
                    'NASDAQ': 'NASDAQ',
                    'AMEX': 'AMEX',
                    'OTC': 'OTC',
                    'TSX': 'TSX',
                    'LSE': 'LSE'
                };
                const tvExchange = exchangeMap[exchange.toUpperCase()] || 'NASDAQ';
                tvSymbol = `${tvExchange}:${tickerSymbol}`;
            } else if (exchange) {
                tvSymbol = `${exchange.toUpperCase()}:${tickerSymbol}`;
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Load TradingView Widget script if not already loaded
            if (!window.TradingView) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.onload = () => {
                    createTradingViewWidget(container, tvSymbol);
                };
                script.onerror = () => {
                    if (window.Logger) {
                        window.Logger.error('❌ Failed to load TradingView script', { page: 'ticker-dashboard' });
                    }
                    if (typeof window.hideLoadingState === 'function') {
                        window.hideLoadingState('ticker-dashboard-chart');
                    }
                    container.innerHTML = '<div class="alert alert-warning">שגיאה בטעינת גרף TradingView</div>';
                };
                document.head.appendChild(script);
            } else {
                createTradingViewWidget(container, tvSymbol);
            }
            
        } catch (error) {
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-chart');
            }
            if (window.Logger) {
                window.Logger.error('❌ Error initializing price chart', { error: error.message, stack: error.stack, page: 'ticker-dashboard' });
            }
            const container = document.getElementById('tradingview_widget');
            if (container) {
                container.innerHTML = '<div class="alert alert-danger">שגיאה בטעינת גרף</div>';
            }
        }
    }
    
    /**
     * Create TradingView Widget
     * @param {HTMLElement} container - Container element
     * @param {string} symbol - TradingView symbol (e.g., "NASDAQ:QQQ")
     */
    function createTradingViewWidget(container, symbol) {
        try {
            if (!window.TradingView) {
                if (window.Logger) {
                    window.Logger.error('❌ TradingView not available', { page: 'ticker-dashboard' });
                }
                return;
            }
            
            // Determine theme based on color scheme
            let theme = 'light';
            if (window.ColorSchemeSystem && typeof window.ColorSchemeSystem.getCurrentTheme === 'function') {
                const currentTheme = window.ColorSchemeSystem.getCurrentTheme();
                theme = currentTheme === 'dark' ? 'dark' : 'light';
            } else if (document.body.classList.contains('dark-theme')) {
                theme = 'dark';
            }
            
            // Create TradingView Widget
            new window.TradingView.widget({
                "autosize": true,
                "symbol": symbol,
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": theme,
                "style": "1", // Candlestick chart
                "locale": "he",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "hide_top_toolbar": false,
                "hide_legend": false,
                "save_image": false,
                "container_id": "tradingview_widget",
                "height": "100%",
                "width": "100%",
                "studies": [
                    "Volume@tv-basicstudies"
                ],
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650",
                "no_referral_id": true,
                "referral_id": "",
                "support_host": "https://www.tradingview.com"
            });
            
            if (window.Logger) {
                window.Logger.info('✅ TradingView Widget created', { 
                    symbol, 
                    theme,
                    page: 'ticker-dashboard' 
                });
            }
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-chart');
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error creating TradingView Widget', { 
                    error: error.message, 
                    stack: error.stack,
                    symbol,
                    page: 'ticker-dashboard' 
                });
            }
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-chart');
            }
            container.innerHTML = '<div class="alert alert-danger">שגיאה ביצירת גרף TradingView</div>';
        }
    }

    /**
     * Render technical indicators
     */
    async function renderTechnicalIndicators() {
        const container = document.getElementById('tickerTechnicalIndicators');
        if (window.Logger) {
            window.Logger.info('📊 renderTechnicalIndicators called', { 
                hasContainer: !!container, 
                hasTickerData: !!tickerData,
                tickerId,
                page: 'ticker-dashboard' 
            });
        }
        if (!container) {
            if (window.Logger) {
                window.Logger.error('❌ Container not found: tickerTechnicalIndicators', { page: 'ticker-dashboard' });
            }
            return;
        }
        if (!tickerData) {
            if (window.Logger) {
                window.Logger.error('❌ tickerData is null or undefined', { tickerId, page: 'ticker-dashboard' });
            }
            return;
        }
        
        try {
            if (window.Logger) {
                window.Logger.info('📊 Starting technical indicators rendering', { tickerId, page: 'ticker-dashboard' });
            }
            // ATR removed from technical indicators - now displayed in KPI Cards only
            const volatility = tickerData.volatility || null;
            
            // Clear container
            container.innerHTML = '';
            
            // Create technical indicator cards using createElement
            // Note: ATR is now displayed in KPI Cards, not here
            const indicators = [
                { label: 'Volatility', value: volatility ? `${volatility.toFixed(2)}%` : 'N/A', dir: 'ltr' },
                { label: 'Volume Profile', value: 'לא זמין', dir: '' }
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
            
            if (window.Logger) {
                window.Logger.info('✅ Technical indicators rendered successfully', { 
                    indicatorsCount: indicators.length,
                    page: 'ticker-dashboard' 
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering technical indicators', { 
                    error: error.message, 
                    stack: error.stack,
                    tickerId,
                    hasTickerData: !!tickerData,
                    page: 'ticker-dashboard' 
                });
            }
            console.error('renderTechnicalIndicators error:', error);
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה בתצוגת מדדים טכניים: ${error.message}`);
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
        if (window.Logger) {
            window.Logger.info('📊 renderConditions called', { 
                hasContainer: !!container, 
                tickerId,
                page: 'ticker-dashboard' 
            });
        }
        if (!container) {
            if (window.Logger) {
                window.Logger.error('❌ Container not found: tickerConditions', { page: 'ticker-dashboard' });
            }
            return;
        }
        if (!tickerId) {
            if (window.Logger) {
                window.Logger.error('❌ tickerId is null or undefined', { page: 'ticker-dashboard' });
            }
            return;
        }
        
        try {
            if (window.Logger) {
                window.Logger.info('📊 Loading conditions for ticker', { tickerId, page: 'ticker-dashboard' });
            }
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
            
            if (window.Logger) {
                window.Logger.info('✅ Conditions rendered successfully', { 
                    conditionsCount: conditions ? conditions.length : 0,
                    page: 'ticker-dashboard' 
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering conditions', { 
                    error: error.message, 
                    stack: error.stack,
                    tickerId,
                    page: 'ticker-dashboard' 
                });
            }
            console.error('renderConditions error:', error);
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה בתצוגת תנאים: ${error.message}`);
            }
        }
    }

    /**
     * Show placeholder message in chart container
     * @param {string} message - Message to display
     */
    function showChartPlaceholder(message) {
        const chartContainer = document.getElementById('tradingview_widget');
        if (!chartContainer) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Chart container not found for placeholder', { page: 'ticker-dashboard' });
            }
            return;
        }
        
        // Remove existing placeholder if any
        const existingPlaceholder = chartContainer.querySelector('.chart-placeholder-message');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }
        
        const placeholder = document.createElement('div');
        placeholder.className = 'chart-placeholder-message text-muted text-center p-4';
        placeholder.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; background: rgba(255, 255, 255, 0.9); border-radius: 8px; padding: 2rem;';
        placeholder.innerHTML = `<div>${message}</div><div class="small mt-2">הגרף מוכן לטעינת נתונים</div>`;
        chartContainer.appendChild(placeholder);
        
        if (window.Logger) {
            window.Logger.debug('Chart placeholder displayed', { message, page: 'ticker-dashboard' });
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
            // Technical indicators are now displayed in KPI Cards - no separate section needed
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

