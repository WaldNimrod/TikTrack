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
                        atr: tickerData?.atr,
                        week52_high: tickerData?.week52_high,
                        week52_low: tickerData?.week52_low,
                        volatility: tickerData?.volatility,
                        allKeys: tickerData ? Object.keys(tickerData).filter(k => k.includes('atr') || k.includes('week') || k.includes('volatility') || k.includes('52')) : [],
                        page: 'ticker-dashboard' 
                    });
                }
            } else {
                throw new Error('TickerDashboardData service not available');
            }
            
            if (!tickerData) {
                throw new Error('Failed to load ticker data - tickerData is null or undefined');
            }
            
            // Store tickerData in window.tickerDashboard for debugging
            if (window.tickerDashboard) {
                // Update the getter to return current tickerData
                Object.defineProperty(window.tickerDashboard, 'tickerData', {
                    get: () => tickerData,
                    configurable: true
                });
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
            
            // Restore page state (sections, filters, etc.) - with timeout to prevent hanging
            try {
                await Promise.race([
                    restorePageState('ticker-dashboard'),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('restorePageState timeout')), 5000))
                ]);
                if (window.Logger) {
                    window.Logger.info('✅ restorePageState completed successfully', { page: 'ticker-dashboard' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ restorePageState timed out or failed, continuing...', { error: error.message, page: 'ticker-dashboard' });
                }
            }
            
            // Restore section states using unified system (with timeout to prevent hanging)
            if (typeof window.restoreAllSectionStates === 'function') {
                try {
                    await Promise.race([
                        window.restoreAllSectionStates(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('restoreAllSectionStates timeout')), 5000))
                    ]);
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ restoreAllSectionStates timeout or error, continuing anyway', { error: error.message, page: 'ticker-dashboard' });
                    }
                }
            }
            
            // Setup section toggle listeners to save state
            setupSectionStateSaving();
            
            // Initialize icons (replace icon placeholders)
            await initializeIcons();
            
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
            // Calculate change from price and changePercent if change amount is 0 but percent exists
            let change = tickerData.daily_change || tickerData.change_amount || 0;
            const changePercent = tickerData.daily_change_percent || tickerData.change_percent || 0;
            // If change is 0 but we have changePercent, calculate the actual change amount
            if (change === 0 && changePercent !== 0 && price > 0) {
                change = (parseFloat(changePercent) / 100) * parseFloat(price);
            }
            const volume = tickerData.volume || 0;
            const atr = tickerData.atr || null;
            const week52High = tickerData.week52_high || null;
            const week52Low = tickerData.week52_low || null;
            // Get currency symbol - convert code to symbol if needed
            let currencySymbol = tickerData.currency_symbol || (tickerData.currency && tickerData.currency.symbol) || '$';
            // Convert currency code to symbol (USD -> $, ILS -> ₪, etc.)
            if (currencySymbol && currencySymbol.length > 1) {
                switch (currencySymbol.toUpperCase()) {
                    case 'USD': currencySymbol = '$'; break;
                    case 'ILS': currencySymbol = '₪'; break;
                    case 'EUR': currencySymbol = '€'; break;
                    case 'GBP': currencySymbol = '£'; break;
                    case 'JPY': currencySymbol = '¥'; break;
                    default: break; // Already a symbol, keep as is
                }
            }
            
            // Format ATR - use FieldRendererService.renderATR() only (no fallback)
            let atrHtml = 'N/A';
            if (atr !== null && atr !== undefined && !isNaN(atr) && price && price > 0) {
                const atrPercent = (parseFloat(atr) / parseFloat(price)) * 100;
                if (window.FieldRendererService && typeof window.FieldRendererService.renderATR === 'function') {
                    try {
                        // Add timeout to prevent hanging
                        atrHtml = await Promise.race([
                            window.FieldRendererService.renderATR(atr, atrPercent),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('ATR render timeout')), 2000))
                        ]);
                        // Ensure it's a string, not a Promise
                        if (atrHtml && typeof atrHtml.then === 'function') {
                            atrHtml = await Promise.race([
                                atrHtml,
                                new Promise((_, reject) => setTimeout(() => reject(new Error('ATR render timeout')), 1000))
                            ]);
                        }
                        if (!atrHtml || atrHtml === '' || typeof atrHtml !== 'string') {
                            atrHtml = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
                        }
                    } catch (atrError) {
                        if (window.Logger) {
                            window.Logger.warn('Error rendering ATR, using fallback', { 
                                error: atrError.message, 
                                atr, 
                                price, 
                                page: 'ticker-dashboard' 
                            });
                        }
                        // Fallback: simple display
                        const atrPercent = (parseFloat(atr) / parseFloat(price)) * 100;
                        atrHtml = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.warn('FieldRendererService.renderATR not available, using fallback', { page: 'ticker-dashboard' });
                    }
                    // Fallback: simple display
                    const atrPercent = (parseFloat(atr) / parseFloat(price)) * 100;
                    atrHtml = `<span class="atr-value" dir="ltr">${atrPercent.toFixed(2)}%</span>`;
                }
            } else {
                if (window.Logger) {
                    window.Logger.debug('ATR not available', { 
                        atr, 
                        price, 
                        hasAtr: atr !== null && atr !== undefined,
                        hasPrice: price && price > 0,
                        page: 'ticker-dashboard' 
                    });
                }
            }
            
            // Format volume in millions with 2 decimal places
            let formattedVolume = 'N/A';
            if (volume > 0) {
                const volumeInMillions = volume / 1000000;
                formattedVolume = `${volumeInMillions.toFixed(2)}M`;
            }
            
            // Calculate monetary value (volume * price)
            let volumeMonetaryValue = null;
            if (volume > 0 && price > 0) {
                volumeMonetaryValue = volume * price;
            }
            
            // Format monetary value in millions with 2 decimal places
            let formattedVolumeMonetary = '';
            if (volumeMonetaryValue !== null && volumeMonetaryValue > 0) {
                const volumeMonetaryInMillions = volumeMonetaryValue / 1000000;
                formattedVolumeMonetary = `<span dir="ltr" class="text-muted"><small>${currencySymbol}${volumeMonetaryInMillions.toFixed(2)}M</small></span>`;
            } else {
                formattedVolumeMonetary = '<span class="text-muted"><small>N/A</small></span>';
            }
            
            // Format change - show percentage and amount (in parentheses) on same line
            const changeColor = change >= 0 ? 'text-success' : 'text-danger';
            const changeSign = change >= 0 ? '+' : '';
            
            // Format change percentage (main value)
            let changePercentText = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function') {
                // Extract text from HTML (remove tags) but keep color classes
                const changePercentHtml = window.FieldRendererService.renderNumericValue(changePercent, '%', true);
                // Try to preserve color class from FieldRendererService
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = changePercentHtml;
                const percentSpan = tempDiv.querySelector('span');
                if (percentSpan && percentSpan.className) {
                    // Use the class from FieldRendererService
                    changePercentText = `<span class="${percentSpan.className}" dir="ltr">${changeSign}${parseFloat(changePercent).toFixed(2)}%</span>`;
                } else {
                    changePercentText = `<span class="${changeColor}" dir="ltr">${changeSign}${parseFloat(changePercent).toFixed(2)}%</span>`;
                }
            } else {
                changePercentText = `<span class="${changeColor}" dir="ltr">${changeSign}${parseFloat(changePercent).toFixed(2)}%</span>`;
            }
            
            // Format change amount with currency symbol (in parentheses) - only if change is not 0
            let changeAmountText = '';
            if (Math.abs(change) > 0.001) { // Use small threshold to avoid floating point issues
                changeAmountText = ` <span class="${changeColor}" dir="ltr">(${changeSign}${currencySymbol}${Math.abs(parseFloat(change)).toFixed(2)})</span>`;
            }
            
            // Combine: percentage (amount) on same line
            const changeHtml = `${changePercentText}${changeAmountText}`;
            
            // Format price with change - combine price and change in one card (2 lines)
            let priceHtml = '';
            if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
                const priceFormatted = window.FieldRendererService.renderAmount(price, currencySymbol, 2, false);
                priceHtml = `${priceFormatted}<br>${changeHtml}`;
            } else {
                const priceFormatted = `<span dir="ltr">${currencySymbol}${parseFloat(price).toFixed(2)}</span>`;
                priceHtml = `${priceFormatted}<br>${changeHtml}`;
            }
            
            // Format 52W High - separate card (2 lines: value, percentage)
            // Maximum (high) = positive color (green)
            let week52HighHtml = 'N/A';
            if (week52High !== null && price && price > 0) {
                const highValue = parseFloat(week52High).toFixed(2);
                const highFormatted = `<span class="text-success" dir="ltr">${currencySymbol}${highValue}</span>`;
                
                // Calculate percentage from current price
                const highPercent = ((parseFloat(week52High) - parseFloat(price)) / parseFloat(price)) * 100;
                const highPercentFormatted = highPercent >= 0 ? `+${highPercent.toFixed(2)}%` : `${highPercent.toFixed(2)}%`;
                
                // Display: value on first line, percentage on second line
                week52HighHtml = `${highFormatted}<br><span class="text-success" dir="ltr">${highPercentFormatted}</span>`;
            } else if (week52High !== null) {
                // Fallback if price is not available - show only value
                const highValue = parseFloat(week52High).toFixed(2);
                week52HighHtml = `<span class="text-success" dir="ltr">${currencySymbol}${highValue}</span>`;
            }
            
            // Format 52W Low - separate card (2 lines: value, percentage)
            // Minimum (low) = negative color (red) for both value and percentage
            let week52LowHtml = 'N/A';
            if (week52Low !== null && price && price > 0) {
                const lowValue = parseFloat(week52Low).toFixed(2);
                const lowFormatted = `<span class="text-danger" dir="ltr">${currencySymbol}${lowValue}</span>`;
                
                // Calculate percentage from current price
                const lowPercent = ((parseFloat(week52Low) - parseFloat(price)) / parseFloat(price)) * 100;
                const lowPercentFormatted = lowPercent >= 0 ? `+${lowPercent.toFixed(2)}%` : `${lowPercent.toFixed(2)}%`;
                
                // Display: value on first line, percentage on second line (both in red)
                week52LowHtml = `${lowFormatted}<br><span class="text-danger" dir="ltr">${lowPercentFormatted}</span>`;
            } else if (week52Low !== null) {
                // Fallback if price is not available - show only value in red
                const lowValue = parseFloat(week52Low).toFixed(2);
                week52LowHtml = `<span class="text-danger" dir="ltr">${currencySymbol}${lowValue}</span>`;
            }
            
            // Clear container
            container.textContent = '';
            
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
            const volatility = (tickerData.volatility !== null && tickerData.volatility !== undefined) ? tickerData.volatility : null;
            const volatilityHtml = (volatility !== null && volatility !== undefined && !isNaN(volatility)) ? `${parseFloat(volatility).toFixed(2)}%` : 'N/A';
            
            // Create KPI cards using createElement
            // All technical indicators are now unified in KPI Cards
            // Ensure atrHtml is a string, not a Promise
            let atrHtmlString = 'N/A';
            if (atrHtml && typeof atrHtml === 'string' && atrHtml.trim() !== '') {
                atrHtmlString = atrHtml;
            } else if (atrHtml && typeof atrHtml.then === 'function') {
                // If it's still a Promise, wait for it
                try {
                    atrHtmlString = await atrHtml;
                    if (!atrHtmlString || typeof atrHtmlString !== 'string') {
                        atrHtmlString = 'N/A';
                    }
                } catch (e) {
                    atrHtmlString = 'N/A';
                }
            }
            
            if (window.Logger) {
                window.Logger.debug('ATR HTML for display', { 
                    atrHtmlString,
                    atrHtmlType: typeof atrHtml,
                    atrHtmlLength: atrHtmlString ? atrHtmlString.length : 0,
                    page: 'ticker-dashboard' 
                });
            }
            
            // Combine ATR and Volatility into one card (2 lines)
            // ATR on first line (no label), Volatility on second line with small label
            let atrVolatilityHtml = 'N/A';
            if (atrHtmlString !== 'N/A' || volatilityHtml !== 'N/A') {
                const parts = [];
                // ATR on first line - no label, just value
                if (atrHtmlString !== 'N/A') {
                    // Extract text from ATR HTML (remove any HTML tags)
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = atrHtmlString;
                    const atrText = tempDiv.textContent || tempDiv.innerText || atrHtmlString;
                    parts.push(atrText);
                } else {
                    parts.push('N/A');
                }
                // Volatility on second line with small label
                if (volatilityHtml !== 'N/A') {
                    parts.push(`<small class="text-muted">תנודתיות:</small> ${volatilityHtml}`);
                } else {
                    parts.push(`<small class="text-muted">תנודתיות:</small> N/A`);
                }
                atrVolatilityHtml = parts.join('<br>');
            }
            
            const kpiCards = [
                { label: 'מחיר', value: priceHtml, dir: '', helpKey: null },
                { label: 'ATR', value: atrVolatilityHtml, dir: '', helpKey: 'atr' },
                { label: '52W גבוהה', value: week52HighHtml, dir: 'ltr', helpKey: 'week52_range' },
                { label: '52W נמוכה', value: week52LowHtml, dir: 'ltr', helpKey: 'week52_range' },
                { label: 'נפח יומי', value: `${formattedVolume}<br><small class="text-muted">${formattedVolumeMonetary}</small>`, dir: 'ltr', helpKey: 'volume' }
            ];
            
            // Use for...of loop instead of forEach to support await
            for (const kpi of kpiCards) {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-2 col-sm-4 col-6';
                
                const cardDiv = document.createElement('div');
                cardDiv.className = 'kpi-card';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'kpi-label';
                
                // Add help icon for technical indicators
                if (window.TechnicalIndicatorsHelp && window.IconSystem && (kpi.label === 'ATR' || kpi.label === '52W גבוהה' || kpi.label === '52W נמוכה' || kpi.label === 'נפח יומי')) {
                    const helpKey = kpi.label === 'ATR' ? 'atr' : 
                                   (kpi.label === '52W גבוהה' || kpi.label === '52W נמוכה') ? 'week52_range' : 
                                   kpi.label === 'נפח יומי' ? 'volume' : null;
                    if (helpKey) {
                        const helpText = window.TechnicalIndicatorsHelp.getHelpText(helpKey);
                        // Use fallback icon immediately to prevent blocking
                        const escapedHelpText = helpText.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        // Use tooltip for help icon - show on hover
                        const helpIconId = `help-icon-${kpi.label.replace(/\s+/g, '-')}-${Date.now()}`;
                        const fallbackIcon = `<span id="${helpIconId}" class="help-icon ms-1" style="cursor: help; display: inline-block; width: 14px; height: 14px; line-height: 14px; text-align: center; font-size: 12px;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-trigger="hover" data-bs-html="true" title="${escapedHelpText}" onclick="if(window.NotificationSystem && window.NotificationSystem.showInfo) { window.NotificationSystem.showInfo('${kpi.label}', '${escapedHelpText}'); }">ℹ️</span>`;
                        
                        // Try to load icon with timeout, but don't block rendering
                        labelDiv.textContent = '';
                        labelDiv.textContent = kpi.label;
                        const parser = new DOMParser();
                        const iconDoc = parser.parseFromString(fallbackIcon, 'text/html');
                        iconDoc.body.childNodes.forEach(node => {
                            labelDiv.appendChild(node.cloneNode(true));
                        });
                        
                        // Initialize Bootstrap tooltip for help icon
                        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                            try {
                                const helpIconElement = labelDiv.querySelector('.help-icon');
                                if (helpIconElement) {
                                    new bootstrap.Tooltip(helpIconElement, {
                                        placement: 'top',
                                        trigger: 'hover',
                                        html: true
                                    });
                                }
                            } catch (tooltipError) {
                                if (window.Logger) {
                                    window.Logger.warn('Failed to initialize tooltip for help icon', { error: tooltipError.message, page: 'ticker-dashboard' });
                                }
                            }
                        }
                        
                        // Try to replace with IconSystem icon in background (non-blocking)
                        if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
                            Promise.race([
                                window.IconSystem.renderIcon('button', 'help', {
                                    size: 14,
                                    classes: 'ms-1 help-icon',
                                    'data-bs-toggle': 'tooltip',
                                    'data-bs-placement': 'top',
                                    'data-bs-trigger': 'hover',
                                    'data-bs-html': 'true',
                                    title: escapedHelpText,
                                    onclick: `if(window.NotificationSystem && window.NotificationSystem.showInfo) { window.NotificationSystem.showInfo('${kpi.label}', '${helpText.replace(/'/g, "\\'")}'); }`
                                }),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
                            ]).then(helpIcon => {
                                if (helpIcon && typeof helpIcon === 'string') {
                                    const helpIconSpan = labelDiv.querySelector('.help-icon');
                                    if (helpIconSpan) {
                                        // Dispose old tooltip if exists
                                        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                                            const oldTooltip = bootstrap.Tooltip.getInstance(helpIconSpan);
                                            if (oldTooltip) {
                                                oldTooltip.dispose();
                                            }
                                        }
                                        helpIconSpan.outerHTML = helpIcon;
                                        // Initialize new tooltip
                                        const newHelpIcon = labelDiv.querySelector('.help-icon');
                                        if (newHelpIcon && typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                                            new bootstrap.Tooltip(newHelpIcon, {
                                                placement: 'top',
                                                trigger: 'hover',
                                                html: true
                                            });
                                        }
                                    }
                                }
                            }).catch(() => {
                                // Keep fallback icon - already rendered
                            });
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
                    valueDiv.textContent = '';
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(kpi.value, 'text/html');
                    doc.body.childNodes.forEach(node => {
                        valueDiv.appendChild(node.cloneNode(true));
                    });
                } else {
                    valueDiv.textContent = kpi.value;
                }
                
                cardDiv.appendChild(labelDiv);
                cardDiv.appendChild(valueDiv);
                colDiv.appendChild(cardDiv);
                container.appendChild(colDiv);
            }
            
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
            container.textContent = '';
            
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
                    container.textContent = '';
                    const alert = document.createElement('div');
                    alert.className = 'alert alert-warning';
                    alert.textContent = 'שגיאה בטעינת גרף TradingView';
                    container.appendChild(alert);
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
                container.textContent = '';
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger';
                alert.textContent = 'שגיאה בטעינת גרף';
                container.appendChild(alert);
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
            // Note: autosize: true makes the widget fill its container
            // The container must have a defined height (via CSS flex or fixed height)
            // Default: Daily candles, zoom to 6 months (half year), Moving Averages 20 (blue) and 150 (burgundy)
            // Candlestick colors based on intraday movement (not previous close)
            new window.TradingView.widget({
                "autosize": true, // This makes the widget fill the container height
                "symbol": symbol,
                "interval": "D", // Daily candles by default
                "timezone": "Etc/UTC",
                "theme": theme,
                "style": "1", // Candlestick chart
                "locale": "he",
                "toolbar_bg": theme === 'dark' ? "#1e1e1e" : "#f1f3f6",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "hide_top_toolbar": false,
                "hide_legend": false,
                "save_image": false,
                "container_id": "tradingview_widget",
                "width": "100%", // Width is 100% of container
                // Do NOT set height when using autosize: true - it will fill the container
                "studies": [
                    "Volume@tv-basicstudies",
                    {
                        id: "MASimple@tv-basicstudies",
                        inputs: {
                            length: 20
                        },
                        plots: [{
                            id: "plot_0",
                            type: "line",
                            color: "#0000FF" // Blue for MA 20
                        }]
                    },
                    {
                        id: "MASimple@tv-basicstudies",
                        inputs: {
                            length: 150
                        },
                        plots: [{
                            id: "plot_0",
                            type: "line",
                            color: "#800020" // Burgundy for MA 150
                        }]
                    }
                ],
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650",
                "no_referral_id": true,
                "referral_id": "",
                "support_host": "https://www.tradingview.com",
                // Overrides for candlestick colors based on intraday movement (not previous close)
                // This means: green if close > open (same day), red if close < open (same day)
                // By default, TradingView colors candles based on intraday movement (close vs open of same candle)
                // We just need to set the colors explicitly
                "overrides": {
                    "mainSeriesProperties.candleStyle.upColor": "#26baac", // Green for up candles (close > open)
                    "mainSeriesProperties.candleStyle.downColor": "#fc5a06", // Red for down candles (close < open)
                    "mainSeriesProperties.candleStyle.borderUpColor": "#26baac",
                    "mainSeriesProperties.candleStyle.borderDownColor": "#fc5a06",
                    "mainSeriesProperties.candleStyle.wickUpColor": "#26baac",
                    "mainSeriesProperties.candleStyle.wickDownColor": "#fc5a06",
                    "paneProperties.background": theme === 'dark' ? "#1e1e1e" : "#ffffff",
                    "paneProperties.backgroundType": "solid"
                },
                // Range: 6 months (half year) - use disabled_features to prevent user from changing range
                // Note: TradingView widget doesn't support direct range setting in config
                // The widget will default to showing recent data, user can zoom to 6 months manually
                // We can't programmatically set the zoom range, but we can suggest it in the UI
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
            container.textContent = '';
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.textContent = 'שגיאה ביצירת גרף TradingView';
            container.appendChild(alert);
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
            container.textContent = '';
            
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
                    valueDiv.textContent = '';
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(indicator.value, 'text/html');
                    doc.body.childNodes.forEach(node => {
                        valueDiv.appendChild(node.cloneNode(true));
                    });
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
        const container = document.getElementById('tickerActivity');
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
                    container.textContent = '';
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    doc.body.childNodes.forEach(node => {
                        container.appendChild(node.cloneNode(true));
                    });
                } else {
                    container.textContent = '';
                    const emptyDiv = document.createElement('div');
                    emptyDiv.className = 'text-muted';
                    emptyDiv.textContent = 'אין פעילות זמינה';
                    container.appendChild(emptyDiv);
                }
            } else {
                container.textContent = '';
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
            if (window.TickerDashboardData && typeof window.TickerDashboardData.loadTickerConditions === 'function') {
                try {
                    conditions = await window.TickerDashboardData.loadTickerConditions(tickerId);
                    // Ensure conditions is an array
                    if (!Array.isArray(conditions)) {
                        conditions = [];
                    }
                } catch (loadError) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Error loading conditions, continuing without them', { 
                            tickerId, 
                            error: loadError.message || loadError, 
                            page: 'ticker-dashboard' 
                        });
                    }
                    conditions = [];
                }
            } else {
                if (window.Logger) {
                    window.Logger.warn('⚠️ TickerDashboardData.loadTickerConditions not available', { page: 'ticker-dashboard' });
                }
            }
            
            // Clear container
            container.textContent = '';
            
            if (conditions && conditions.length > 0) {
                if (window.Logger) {
                    window.Logger.info('📊 Rendering conditions', { 
                        conditionsCount: conditions.length,
                        conditions: conditions.map(c => ({ id: c.id, description: c.description, method: c.method })),
                        page: 'ticker-dashboard' 
                    });
                }
                conditions.forEach(condition => {
                    try {
                        if (!condition) return; // Skip null/undefined conditions
                        
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'condition-item';
                        
                        // Build description from condition data
                        let description = '';
                        if (condition.description) {
                            description = String(condition.description);
                        } else if (condition.action_notes) {
                            description = String(condition.action_notes);
                        } else if (condition.method_name_he) {
                            description = String(condition.method_name_he);
                        } else if (condition.method_name) {
                            description = String(condition.method_name);
                        } else if (condition.method) {
                            if (typeof condition.method === 'string') {
                                description = condition.method;
                            } else if (condition.method && typeof condition.method === 'object') {
                                description = condition.method.name_he || condition.method.name_en || 'תנאי';
                            } else {
                                description = 'תנאי';
                            }
                        } else {
                            description = 'תנאי';
                        }
                        
                        // Add method name if available and different from description
                        if (condition.method_name_he && condition.method_name_he !== description) {
                            description = `${String(condition.method_name_he)}: ${description}`;
                        }
                        
                        const descDiv = document.createElement('div');
                        descDiv.className = 'condition-description';
                        descDiv.textContent = description || 'תנאי';
                        itemDiv.appendChild(descDiv);
                        
                        // Add plan context with full details if available
                        const planId = condition.trade_plan_id || condition._plan_id;
                        if (planId && (typeof planId === 'number' || (typeof planId === 'string' && planId.trim() !== ''))) {
                            const planInfoDiv = document.createElement('div');
                            planInfoDiv.className = 'condition-plan-info mt-2';
                            
                            // Build plan link with details
                            const planLink = document.createElement('a');
                            planLink.href = '#';
                            planLink.className = 'condition-plan-link text-decoration-none';
                            planLink.onclick = (e) => {
                                e.preventDefault();
                                if (window.showEntityDetails) {
                                    window.showEntityDetails('trade_plan', planId, { mode: 'view' });
                                }
                                return false;
                            };
                            
                            // Collect plan details (text elements)
                            const planDetailsText = [];
                            
                            // Ticker symbol
                            if (condition.plan_ticker && condition.plan_ticker.symbol) {
                                planDetailsText.push(condition.plan_ticker.symbol);
                            }
                            
                            // Date
                            if (condition.plan_created_at) {
                                try {
                                    const date = new Date(condition.plan_created_at);
                                    if (!isNaN(date.getTime())) {
                                        const formattedDate = date.toLocaleDateString('he-IL', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric' 
                                        });
                                        planDetailsText.push(formattedDate);
                                    }
                                } catch (dateError) {
                                    // Ignore date parsing errors
                                }
                            }
                            
                            // Side
                            if (condition.plan_side) {
                                const sideDisplay = condition.plan_side === 'Long' ? '↑ Long' : '↓ Short';
                                planDetailsText.push(sideDisplay);
                            }
                            
                            // Status HTML
                            let statusHtml = '';
                            if (condition.plan_status) {
                                try {
                                    if (window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function') {
                                        // Use FieldRendererService for status badge
                                        statusHtml = window.FieldRendererService.renderStatus(condition.plan_status, 'trade_plan');
                                    } else {
                                        // Fallback: simple text
                                        const statusMap = {
                                            'open': 'פתוח',
                                            'closed': 'סגור',
                                            'cancelled': 'מבוטל',
                                            'canceled': 'מבוטל'
                                        };
                                        const statusDisplay = statusMap[condition.plan_status] || condition.plan_status;
                                        statusHtml = `<span>${statusDisplay}</span>`;
                                    }
                                } catch (statusError) {
                                    // Fallback on error
                                    const statusMap = {
                                        'open': 'פתוח',
                                        'closed': 'סגור',
                                        'cancelled': 'מבוטל',
                                        'canceled': 'מבוטל'
                                    };
                                    const statusDisplay = statusMap[condition.plan_status] || condition.plan_status;
                                    statusHtml = `<span>${statusDisplay}</span>`;
                                }
                            }
                            
                            // Investment type HTML
                            let typeHtml = '';
                            if (condition.plan_investment_type) {
                                try {
                                    if (window.FieldRendererService && typeof window.FieldRendererService.renderType === 'function') {
                                        // Use FieldRendererService for type badge
                                        typeHtml = window.FieldRendererService.renderType(condition.plan_investment_type);
                                    } else {
                                        // Fallback: simple text
                                        const typeMap = {
                                            'swing': 'סווינג',
                                            'investment': 'השקעה',
                                            'passive': 'פאסיבי'
                                        };
                                        const typeDisplay = typeMap[condition.plan_investment_type] || condition.plan_investment_type;
                                        typeHtml = `<span>${typeDisplay}</span>`;
                                    }
                                } catch (typeError) {
                                    // Fallback on error
                                    const typeMap = {
                                        'swing': 'סווינג',
                                        'investment': 'השקעה',
                                        'passive': 'פאסיבי'
                                    };
                                    const typeDisplay = typeMap[condition.plan_investment_type] || condition.plan_investment_type;
                                    typeHtml = `<span>${typeDisplay}</span>`;
                                }
                            }
                            
                            // Build link content with text and HTML elements
                            const planName = condition.plan_name || `תכנית #${planId}`;
                            const detailsElements = [];
                            
                            // Add text elements (wrapped in spans)
                            planDetailsText.forEach(text => {
                                detailsElements.push(`<span>${text}</span>`);
                            });
                            
                            // Add HTML elements (status and type badges)
                            if (statusHtml) {
                                detailsElements.push(statusHtml);
                            }
                            if (typeHtml) {
                                detailsElements.push(typeHtml);
                            }
                            
                            planLink.textContent = '';
                            const nameSpan = document.createElement('span');
                            nameSpan.className = 'condition-plan-name fw-bold';
                            nameSpan.textContent = planName;
                            planLink.appendChild(nameSpan);
                            if (detailsElements.length > 0) {
                                const detailsSpan = document.createElement('span');
                                detailsSpan.className = 'condition-plan-details text-muted small ms-2';
                                detailsSpan.textContent = detailsElements.join(' • ');
                                planLink.appendChild(detailsSpan);
                            }
                            
                            planInfoDiv.appendChild(planLink);
                            itemDiv.appendChild(planInfoDiv);
                        } else if (condition.plan_name || condition._plan_name) {
                            // Fallback: just show plan name if no plan ID
                            const planDiv = document.createElement('div');
                            planDiv.className = 'condition-plan text-muted small mt-2';
                            const planName = condition.plan_name || condition._plan_name || `תכנית #${condition.trade_plan_id || condition._plan_id || '?'}`;
                            planDiv.textContent = String(planName);
                            itemDiv.appendChild(planDiv);
                        }
                        
                        container.appendChild(itemDiv);
                    } catch (itemError) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Error rendering condition item, skipping', { 
                                error: itemError.message || itemError, 
                                conditionId: condition ? (condition.id || 'unknown') : 'null',
                                page: 'ticker-dashboard' 
                            });
                        }
                        // Continue with next condition instead of crashing
                    }
                });
            } else {
                if (window.Logger) {
                    window.Logger.info('📊 No conditions to display', { 
                        tickerId,
                        conditionsWasNull: conditions === null,
                        conditionsWasUndefined: conditions === undefined,
                        conditionsLength: conditions ? conditions.length : 'N/A',
                        page: 'ticker-dashboard' 
                    });
                }
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
        const div1 = document.createElement('div');
        div1.textContent = message;
        placeholder.appendChild(div1);
        const div2 = document.createElement('div');
        div2.className = 'small mt-2';
        div2.textContent = 'הגרף מוכן לטעינת נתונים';
        placeholder.appendChild(div2);
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
        goBack,
        get tickerData() {
            return tickerData;
        },
        get tickerId() {
            return tickerId;
        }
    };

    /**
     * Initialize icons by replacing placeholders with IconSystem output
     * @returns {Promise<void>}
     */
    async function initializeIcons() {
        // Wait for IconSystem to be available
        if (typeof window.IconSystem === 'undefined') {
            if (window.Logger) {
                window.Logger.warn('⚠️ IconSystem not available for icon initialization', { page: 'ticker-dashboard' });
            }
            return;
        }

        // Wait for IconSystem to be initialized
        if (!window.IconSystem.initialized) {
            try {
                await window.IconSystem.initialize();
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Failed to initialize IconSystem', { error: error.message, page: 'ticker-dashboard' });
                }
                return;
            }
        }

        // Find all icon placeholders
        const placeholders = document.querySelectorAll('.icon-placeholder[data-icon]');
        
        if (placeholders.length === 0) {
            return; // No icons to initialize
        }

        // Process each placeholder
        for (const placeholder of placeholders) {
            // Check if placeholder is still in DOM
            if (!placeholder.parentNode || !document.contains(placeholder)) {
                continue;
            }

            const iconName = placeholder.getAttribute('data-icon');
            const size = placeholder.getAttribute('data-size') || '20';
            const alt = placeholder.getAttribute('data-alt') || iconName;
            const className = placeholder.className.replace('icon-placeholder', '').trim() || 'icon';

            if (!iconName) {
                continue;
            }

            try {
                // Determine icon type based on icon name
                // Map icon names to types and actual icon names from mappings
                const iconNameMap = {
                    'chart-line': { type: 'button', name: 'chart-line' },
                    'chart': { type: 'button', name: 'chart-line' }, // chart maps to chart-line
                    'activity': { type: 'button', name: 'activity' },
                    'conditions': { type: 'button', name: 'clipboard-list' } // conditions maps to clipboard-list
                };
                
                const iconMapping = iconNameMap[iconName] || { type: 'button', name: iconName };
                const iconType = iconMapping.type;
                const actualIconName = iconMapping.name;

                // Render icon using IconSystem
                const iconHTML = await window.IconSystem.renderIcon(iconType, actualIconName, {
                    size: size,
                    alt: alt,
                    class: className
                });

                // Replace placeholder with rendered icon
                if (placeholder.parentNode && document.contains(placeholder)) {
                    placeholder.outerHTML = iconHTML;
                }
            } catch (error) {
                // Fallback: try to use img tag with path
                if (placeholder.parentNode && document.contains(placeholder)) {
                    const fallbackPath = `/trading-ui/images/icons/tabler/${iconName}.svg`;
                    placeholder.outerHTML = `<img src="${fallbackPath}" width="${size}" height="${size}" alt="${alt}" class="${className}" onerror="this.style.display='none'">`;
                }

                // Log error if Logger is available
                if (window.Logger) {
                    window.Logger.warn('Failed to render icon', {
                        icon: iconName,
                        error: error.message,
                        page: 'ticker-dashboard'
                    });
                }
            }
        }
    }

    // Note: Initialization is handled by unified-app-initializer via page-initialization-configs.js
    // The custom initializer will call window.tickerDashboard.init() after all systems are loaded

    if (window.Logger) {
        window.Logger.info('✅ TickerDashboard loaded', { page: 'ticker-dashboard' });
    }
})();

