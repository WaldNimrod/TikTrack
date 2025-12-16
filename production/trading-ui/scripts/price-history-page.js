/**
 * Price History Page - TradingView Widget Management
 * 
 * This file handles the TradingView Widget initialization and management
 * for the price history page mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initTradingViewWidget() - Inittradingviewwidget
// - setupTradingViewWidgetTickerSelector() - Setuptradingviewwidgettickerselector
// - initializeHeader() - Initializeheader
// - initializePage() - Initializepage

// === UI Functions ===
// - updateTradingViewWidgetSymbol() - Updatetradingviewwidgetsymbol

// === Data Functions ===
// - savePageState() - Savepagestate

// === Other ===
// - restorePageState() - Restorepagestate

(function() {
    'use strict';

    // TradingView Widget (Charting Library) - Main Chart
    let tradingViewWidget = null;

    /**
     * Initialize TradingView Widget
     * @param {string} symbol - Trading symbol (e.g., 'NASDAQ:AAPL')
     */
    function initTradingViewWidget(symbol = 'NASDAQ:AAPL') {
        // Destroy existing widget if exists
        if (tradingViewWidget) {
            try {
                tradingViewWidget.remove();
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Error removing existing TradingView widget', { 
                        page: 'price-history-page', 
                        error: e 
                    });
                }
            }
            tradingViewWidget = null;
        }
        
        // Wait for TradingView library to load
        if (typeof TradingView === 'undefined') {
            if (window.Logger) {
                window.Logger.warn('TradingView library not loaded yet, retrying...', { 
                    page: 'price-history-page' 
                });
            }
            setTimeout(() => initTradingViewWidget(symbol), 500);
            return;
        }
        
        try {
            // Get user preferences for theme
            const isDarkMode = window.currentPreferences && window.currentPreferences.theme === 'dark';
            const theme = isDarkMode ? 'dark' : 'light';
            
            // Get locale from preferences or default to Hebrew
            const locale = (window.currentPreferences && window.currentPreferences.language) || 'he';
            
            // Initialize widget
            tradingViewWidget = new TradingView.widget({
                autosize: true,
                symbol: symbol,
                interval: 'D', // Daily by default
                timezone: 'Etc/UTC',
                theme: theme,
                style: '1', // Candlestick style
                locale: locale,
                toolbar_bg: isDarkMode ? '#1e1e1e' : '#f1f3f6',
                enable_publishing: false,
                allow_symbol_change: true,
                hide_side_toolbar: false,
                save_image: false,
                calendar: false,
                studies: [
                    'Volume@tv-basicstudies',
                    'MACD@tv-basicstudies',
                    'RSI@tv-basicstudies'
                ],
                container_id: 'tradingview_widget_chart',
                // RTL support
                overrides: {
                    'paneProperties.background': isDarkMode ? '#1e1e1e' : '#ffffff',
                    'paneProperties.backgroundType': 'solid',
                    'paneProperties.vertGridProperties.color': isDarkMode ? '#2a2a2a' : '#e0e0e0',
                    'paneProperties.horzGridProperties.color': isDarkMode ? '#2a2a2a' : '#e0e0e0',
                    'paneProperties.crossHairProperties.color': '#26baac', // Primary color from logo
                    'paneProperties.crossHairProperties.width': 1,
                    'paneProperties.crossHairProperties.style': 2,
                    'scalesProperties.textColor': isDarkMode ? '#ffffff' : '#000000',
                    'scalesProperties.lineColor': isDarkMode ? '#2a2a2a' : '#e0e0e0'
                },
                // Custom colors from preferences
                colors: {
                    'candleUp': '#26baac', // Primary color (Turquoise-Green)
                    'candleDown': '#fc5a06', // Secondary color (Orange-Red)
                    'volumeUp': '#26baac',
                    'volumeDown': '#fc5a06'
                }
            });
            
            if (window.Logger) {
                window.Logger.info('✅ TradingView Widget initialized', { 
                    page: 'price-history-page', 
                    symbol,
                    theme,
                    locale 
                });
            }
        } catch (e) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'שגיאה באתחול גרף TradingView');
            }
            if (window.Logger) {
                const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
                if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                    window.NotificationSystem.showError('שגיאה בטעינת גרף מחירים', 
                        `לא ניתן לטעון את גרף המחירים. ${errorMsg}`);
                } else if (window.Logger) {
                    window.Logger.error('Error initializing TradingView Widget', { 
                    page: 'price-history-page', 
                    error: e 
                });
            }
        }
    }
    
    /**
     * Update TradingView Widget symbol
     * @param {string} symbol - Trading symbol (e.g., 'NASDAQ:AAPL')
     */
    function updateTradingViewWidgetSymbol(symbol) {
        if (tradingViewWidget) {
            try {
                tradingViewWidget.setSymbol(symbol, 'D', () => {
                    if (window.Logger) {
                        window.Logger.info('TradingView Widget symbol updated', { 
                            page: 'price-history-page', 
                            symbol 
                        });
                    }
                });
            } catch (e) {
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError('שגיאה', 'שגיאה בעדכון סמל בגרף');
                }
                if (window.Logger) {
                    const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
                    if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                        window.NotificationSystem.showError('שגיאה בעדכון גרף מחירים', 
                            `לא ניתן לעדכן את גרף המחירים. ${errorMsg}`);
                    } else if (window.Logger) {
                        window.Logger.error('Error updating TradingView Widget symbol', { 
                        page: 'price-history-page', 
                        error: e 
                    });
                }
            }
        } else {
            // Widget not initialized yet, initialize with new symbol
            initTradingViewWidget(symbol);
        }
    }
    
    /**
     * Setup TradingView Widget ticker selector
     */
    function setupTradingViewWidgetTickerSelector() {
        const tickerSelect = document.getElementById('widgetTickerSelect');
        if (!tickerSelect) return;
        
        // Sync with main ticker selector if exists
        const mainTickerSelect = document.getElementById('tickerSelect');
        if (mainTickerSelect) {
            // Update widget selector when main selector changes
            mainTickerSelect.addEventListener('change', (e) => {
                const symbol = e.target.value;
                // Convert to TradingView format (e.g., AAPL -> NASDAQ:AAPL)
                const tvSymbol = symbol.includes(':') ? symbol : `NASDAQ:${symbol}`;
                // Use DataCollectionService to set value if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(tickerSelect.id, tvSymbol, 'text');
                } else {
                  tickerSelect.value = tvSymbol;
                }
                updateTradingViewWidgetSymbol(tvSymbol);
            });
        }
        
        // Update widget when widget selector changes
        tickerSelect.addEventListener('change', (e) => {
            const symbol = e.target.value;
            updateTradingViewWidgetSymbol(symbol);
            // Save page state
            savePageState();
        });
    }

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'price-history-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'price-history-page', 
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
                                page: 'price-history-page', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'price-history-page' });
                    }
                }
            }, 500);
        }
    }

    /**
     * Save page state (filters, selected ticker)
     */
    async function savePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            const tickerSelect = document.getElementById('widgetTickerSelect');
            const selectedTicker = tickerSelect ? tickerSelect.value : 'NASDAQ:AAPL';

            const state = {
                filters: {
                    selectedTicker: selectedTicker
                }
            };

            await window.PageStateManager.savePageState('price-history', state);
            if (window.Logger) {
                window.Logger.debug('✅ Saved page state', { page: 'price-history-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save page state', { error, page: 'price-history-page' });
            }
        }
    }

    /**
     * Restore page state (filters, selected ticker)
     */
    async function restorePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            const state = await window.PageStateManager.loadPageState('price-history');
            if (!state || !state.filters) {
                return;
            }

            // Restore selected ticker
            if (state.filters.selectedTicker) {
                const tickerSelect = document.getElementById('widgetTickerSelect');
                if (tickerSelect) {
                    tickerSelect.value = state.filters.selectedTicker;
                    updateTradingViewWidgetSymbol(state.filters.selectedTicker);
                }
            }

            if (window.Logger) {
                window.Logger.debug('✅ Restored page state', { page: 'price-history-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to restore page state', { error, page: 'price-history-page' });
            }
        }
    }

    /**
     * Initialize page
     */
    async function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Restore page state
        await restorePageState();
        
        // Wait for Preferences to be loaded
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            window.PreferencesCore.initializeWithLazyLoading().then(() => {
                setupTradingViewWidgetTickerSelector();
                
                // Wait a bit for TradingView library to load, then initialize widget
                setTimeout(() => {
                    const tickerSelect = document.getElementById('widgetTickerSelect');
                    const defaultSymbol = tickerSelect && tickerSelect.value ? tickerSelect.value : 'NASDAQ:AAPL';
                    initTradingViewWidget(defaultSymbol);
                }, 1000);
            }).catch((error) => {
                if (window.Logger) {
                    window.Logger.warn('Preferences initialization failed (non-critical)', { 
                        page: 'price-history-page', 
                        error 
                    });
                }
                // Initialize widget anyway
                setupTradingViewWidgetTickerSelector();
                setTimeout(() => {
                    const tickerSelect = document.getElementById('widgetTickerSelect');
                    const defaultSymbol = tickerSelect && tickerSelect.value ? tickerSelect.value : 'NASDAQ:AAPL';
                    initTradingViewWidget(defaultSymbol);
                }, 1000);
            });
        } else {
            // Preferences not available, initialize widget anyway
            setupTradingViewWidgetTickerSelector();
            setTimeout(() => {
                const tickerSelect = document.getElementById('widgetTickerSelect');
                const defaultSymbol = tickerSelect && tickerSelect.value ? tickerSelect.value : 'NASDAQ:AAPL';
                initTradingViewWidget(defaultSymbol);
            }, 1000);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

    // Export functions to window for debugging
    window.priceHistoryPage = {
        initTradingViewWidget,
        updateTradingViewWidgetSymbol,
        setupTradingViewWidgetTickerSelector,
        savePageState,
        restorePageState
    };

})();

