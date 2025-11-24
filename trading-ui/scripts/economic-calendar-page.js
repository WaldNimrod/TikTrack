/**
 * Economic Calendar Page - Economic events calendar
 * 
 * This file handles the economic calendar page functionality with TradingView Economic Calendar Widget integration.
 * 
 * Features:
 * - TradingView Economic Calendar Widget integration
 * - Dynamic filters (country, importance, event type)
 * - Filter state persistence (localStorage)
 * - Preferences integration (theme, language, colors)
 * - Cache integration
 * - Saved events display with FieldRendererService
 * - InfoSummarySystem integration
 * 
 * Documentation: 
 * - documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 * - documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md
 * 
 * @version 2.0.0
 * @updated January 29, 2025
 */

(function() {
    'use strict';

    // ===== CONSTANTS =====
    const WIDGET_CONTAINER_ID = 'economic-calendar-widget-container';
    const LOADING_ELEMENT_ID = 'economic-calendar-loading';
    const ERROR_ELEMENT_ID = 'economic-calendar-error';
    const ERROR_MESSAGE_ID = 'economic-calendar-error-message';
    const SAVED_EVENTS_CONTAINER_ID = 'saved-events-container';
    const SUMMARY_CONTAINER_ID = 'economic-calendar-summary';
    
    const FILTERS_STORAGE_KEY = 'economic-calendar-filters';
    const WIDGET_CONFIG_CACHE_KEY = 'economic-calendar-widget-config';
    const WIDGET_CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    // ===== STATE =====
    const state = {
        widget: null,
        widgetContainerId: null,
        filters: {
            countries: ['US'],
            importance: ['high', 'medium'],
            eventTypes: ['interest-rate', 'gdp']
        },
        savedEvents: [],
        initialized: false
    };

    // ===== HELPER FUNCTIONS =====

    /**
     * Get CSS variable value
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
     * Show loading state
     */
    function showLoading() {
        const loadingEl = document.getElementById(LOADING_ELEMENT_ID);
        const errorEl = document.getElementById(ERROR_ELEMENT_ID);
        if (loadingEl) loadingEl.classList.remove('hidden');
        if (errorEl) errorEl.classList.add('hidden');
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        const loadingEl = document.getElementById(LOADING_ELEMENT_ID);
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    function showError(message) {
        const loadingEl = document.getElementById(LOADING_ELEMENT_ID);
        const errorEl = document.getElementById(ERROR_ELEMENT_ID);
        const errorMsgEl = document.getElementById(ERROR_MESSAGE_ID);
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
        if (errorMsgEl) errorMsgEl.textContent = message || 'שגיאה לא ידועה';
        
        if (window.Logger) {
            window.Logger.error('Economic Calendar Widget Error', { 
                page: 'economic-calendar-page',
                message 
            });
        }
    }

    /**
     * Hide error state
     */
    function hideError() {
        const errorEl = document.getElementById(ERROR_ELEMENT_ID);
        if (errorEl) errorEl.classList.add('hidden');
    }

    /**
     * Wait for a condition to be true
     * @param {Function} condition - Condition function
     * @param {number} timeout - Timeout in ms
     * @param {number} interval - Check interval in ms
     * @returns {Promise<boolean>}
     */
    function waitFor(condition, timeout = 10000, interval = 100) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const check = () => {
                if (condition()) {
                    resolve(true);
                } else if (Date.now() - startTime >= timeout) {
                    resolve(false);
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }

    // ===== FILTERS MANAGEMENT =====

    /**
     * Load filters from localStorage
     */
    function loadFilters() {
        try {
            const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.countries) state.filters.countries = parsed.countries;
                if (parsed.importance) state.filters.importance = parsed.importance;
                if (parsed.eventTypes) state.filters.eventTypes = parsed.eventTypes;
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to load filters from localStorage', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }
    }

    /**
     * Save filters to localStorage
     */
    function saveFilters() {
        try {
            const data = {
                countries: state.filters.countries,
                importance: state.filters.importance,
                eventTypes: state.filters.eventTypes,
                lastUpdated: Date.now()
            };
            localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save filters to localStorage', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }
    }

    /**
     * Apply filters to UI
     */
    function applyFiltersToUI() {
        // Country filter
        const countryFilter = document.getElementById('countryFilter');
        if (countryFilter) {
            Array.from(countryFilter.options).forEach(option => {
                option.selected = state.filters.countries.includes(option.value);
            });
        }

        // Importance filter
        const importanceFilter = document.getElementById('importanceFilter');
        if (importanceFilter) {
            Array.from(importanceFilter.options).forEach(option => {
                option.selected = state.filters.importance.includes(option.value);
            });
        }

        // Event type filter
        const eventTypeFilter = document.getElementById('eventTypeFilter');
        if (eventTypeFilter) {
            Array.from(eventTypeFilter.options).forEach(option => {
                option.selected = state.filters.eventTypes.includes(option.value);
            });
        }
    }

    /**
     * Map importance filter to TradingView format
     * @param {string[]} importance - Importance values (high, medium, low)
     * @returns {string} TradingView format (-1,0,1)
     */
    function mapImportanceToTradingView(importance) {
        const mapping = {
            'high': '1',
            'medium': '0',
            'low': '-1'
        };
        return importance.map(imp => mapping[imp] || '0').join(',');
    }

    /**
     * Handle filter change
     */
    function handleFilterChange() {
        // Update state from UI
        const countryFilter = document.getElementById('countryFilter');
        const importanceFilter = document.getElementById('importanceFilter');
        const eventTypeFilter = document.getElementById('eventTypeFilter');

        if (countryFilter) {
            state.filters.countries = Array.from(countryFilter.selectedOptions).map(opt => opt.value);
        }
        if (importanceFilter) {
            state.filters.importance = Array.from(importanceFilter.selectedOptions).map(opt => opt.value);
        }
        if (eventTypeFilter) {
            state.filters.eventTypes = Array.from(eventTypeFilter.selectedOptions).map(opt => opt.value);
        }

        // Save filters
        saveFilters();

        // Update widget
        updateWidgetConfig();
    }

    /**
     * Initialize filters
     */
    function initializeFilters() {
        loadFilters();
        applyFiltersToUI();

        // Add event listeners
        const countryFilter = document.getElementById('countryFilter');
        const importanceFilter = document.getElementById('importanceFilter');
        const eventTypeFilter = document.getElementById('eventTypeFilter');

        if (countryFilter) {
            countryFilter.addEventListener('change', handleFilterChange);
        }
        if (importanceFilter) {
            importanceFilter.addEventListener('change', handleFilterChange);
        }
        if (eventTypeFilter) {
            eventTypeFilter.addEventListener('change', handleFilterChange);
        }
    }

    // ===== WIDGET MANAGEMENT =====

    /**
     * Load widget config from cache
     * @returns {Promise<Object|null>} Cached config or null
     */
    async function loadWidgetConfigFromCache() {
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            return null;
        }

        try {
            const cached = await window.UnifiedCacheManager.get(WIDGET_CONFIG_CACHE_KEY);
            if (cached && cached.config) {
                if (window.Logger) {
                    window.Logger.info('Loaded widget config from cache', {
                        page: 'economic-calendar-page'
                    });
                }
                return cached.config;
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to load widget config from cache', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }

        return null;
    }

    /**
     * Save widget config to cache
     * @param {Object} config - Widget configuration
     */
    async function saveWidgetConfigToCache(config) {
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            return;
        }

        try {
            await window.UnifiedCacheManager.save(WIDGET_CONFIG_CACHE_KEY, {
                config: config,
                timestamp: Date.now()
            }, { ttl: WIDGET_CONFIG_CACHE_TTL });

            if (window.Logger) {
                window.Logger.info('Saved widget config to cache', {
                    page: 'economic-calendar-page'
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save widget config to cache', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }
    }

    /**
     * Get widget configuration
     * @param {boolean} useCache - Whether to use cached config
     * @returns {Promise<Object>} Widget configuration
     */
    async function getWidgetConfig(useCache = true) {
        // Try to load from cache first
        if (useCache) {
            const cachedConfig = await loadWidgetConfigFromCache();
            if (cachedConfig) {
                // Merge with current filters
                const importanceFilter = mapImportanceToTradingView(state.filters.importance);
                cachedConfig.importanceFilter = importanceFilter;
                
                // Ensure container_id is set
                if (!state.widgetContainerId) {
                    state.widgetContainerId = WIDGET_CONTAINER_ID;
                }
                cachedConfig.container_id = state.widgetContainerId;
                
                return cachedConfig;
            }
        }

        // Get default config from TradingViewWidgetsConfig
        let config = {};
        if (window.TradingViewWidgetsConfig) {
            const widgetConfig = window.TradingViewWidgetsConfig.getConfig('economic-calendar');
            if (widgetConfig && widgetConfig.defaultConfig) {
                config = Object.assign({}, widgetConfig.defaultConfig);
            }
        }

        // Get color config from TradingViewWidgetsColors
        if (window.TradingViewWidgetsColors) {
            const colorConfig = window.TradingViewWidgetsColors.getWidgetColorConfig('economic-calendar');
            config = Object.assign(config, colorConfig);
        }

        // Apply filters
        const importanceFilter = mapImportanceToTradingView(state.filters.importance);
        config.importanceFilter = importanceFilter;

        // Ensure container_id is set
        if (!state.widgetContainerId) {
            state.widgetContainerId = WIDGET_CONTAINER_ID;
        }
        config.container_id = state.widgetContainerId;

        // Save to cache
        await saveWidgetConfigToCache(config);

        return config;
    }

    /**
     * Initialize Economic Calendar Widget
     * @returns {Promise<void>}
     */
    async function initializeEconomicCalendarWidget() {
        if (state.initialized) {
            if (window.Logger) {
                window.Logger.warn('Economic Calendar Widget already initialized', {
                    page: 'economic-calendar-page'
                });
            }
            return;
        }

        showLoading();
        hideError();

        try {
            // Wait for TradingViewWidgetsManager
            const managerAvailable = await waitFor(() => {
                return typeof window.TradingViewWidgetsManager !== 'undefined';
            }, 10000);

            if (!managerAvailable) {
                throw new Error('TradingViewWidgetsManager not available after timeout');
            }

            // Wait for cache system (optional)
            if (window.cacheSystemReady !== undefined) {
                await waitFor(() => window.cacheSystemReady === true, 5000);
            }

            // Wait for preferences (optional)
            await waitFor(() => {
                return window.currentPreferences || window.userPreferences;
            }, 5000);

            // Initialize TradingViewWidgetsManager if needed
            if (window.TradingViewWidgetsManager && !window.TradingViewWidgetsManager._initialized) {
                await window.TradingViewWidgetsManager.init();
            }

            // Get widget configuration
            const config = await getWidgetConfig(true);

            // Create widget
            if (window.Logger) {
                window.Logger.info('Creating Economic Calendar Widget', {
                    page: 'economic-calendar-page',
                    config: config
                });
            }

            const widget = window.TradingViewWidgetsManager.createWidget({
                type: 'economic-calendar',
                containerId: state.widgetContainerId,
                config: config
            });

            state.widget = widget;
            state.initialized = true;

            hideLoading();
            hideError();

            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess('לוח השנה הכלכלי נטען בהצלחה');
            }

            if (window.Logger) {
                window.Logger.info('Economic Calendar Widget initialized successfully', {
                    page: 'economic-calendar-page'
                });
            }

        } catch (error) {
            const errorMessage = error.message || 'שגיאה בטעינת לוח השנה הכלכלי';
            showError(errorMessage);
            
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', errorMessage);
            }

            if (window.Logger) {
                window.Logger.error('Failed to initialize Economic Calendar Widget', {
                    page: 'economic-calendar-page',
                    error: error.message,
                    stack: error.stack
                });
            }
        }
    }

    /**
     * Update widget configuration
     */
    async function updateWidgetConfig() {
        if (!state.widget || !state.initialized) {
            return;
        }

        try {
            const config = await getWidgetConfig(false); // Don't use cache for updates

            if (window.TradingViewWidgetsManager) {
                // Update widget (this will recreate it with new config)
                window.TradingViewWidgetsManager.updateWidget(state.widgetContainerId, config);
                
                if (window.Logger) {
                    window.Logger.info('Economic Calendar Widget updated', {
                        page: 'economic-calendar-page',
                        config: config
                    });
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Failed to update Economic Calendar Widget', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }
    }

    /**
     * Destroy widget
     */
    function destroyWidget() {
        if (state.widget && window.TradingViewWidgetsManager) {
            try {
                window.TradingViewWidgetsManager.destroyWidget(state.widgetContainerId);
                state.widget = null;
                state.initialized = false;
                
                if (window.Logger) {
                    window.Logger.info('Economic Calendar Widget destroyed', {
                        page: 'economic-calendar-page'
                    });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Failed to destroy Economic Calendar Widget', {
                        page: 'economic-calendar-page',
                        error: error.message
                    });
                }
            }
        }
    }

    // ===== PREFERENCES INTEGRATION =====

    /**
     * Handle preferences loaded event
     */
    function handlePreferencesLoaded() {
        if (window.Logger) {
            window.Logger.info('Preferences loaded, updating widget', {
                page: 'economic-calendar-page'
            });
        }

        // Update widget with new preferences
        if (state.initialized) {
            updateWidgetConfig();
        }
    }

    /**
     * Initialize preferences integration
     */
    function initializePreferencesIntegration() {
        // Listen to preferences loaded event
        document.addEventListener('preferences:all-loaded', handlePreferencesLoaded);

        // Watch color changes
        if (window.TradingViewWidgetsColors) {
            window.TradingViewWidgetsColors.watchColorChanges((colors) => {
                if (window.Logger) {
                    window.Logger.info('Colors changed, updating widget', {
                        page: 'economic-calendar-page',
                        colors: colors
                    });
                }

                if (state.initialized) {
                    updateWidgetConfig();
                }
            });
        }
    }

    // ===== SAVED EVENTS =====

    /**
     * Render saved events
     */
    function renderSavedEvents() {
        const container = document.getElementById(SAVED_EVENTS_CONTAINER_ID);
        if (!container) return;

        if (!state.savedEvents || state.savedEvents.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">אין אירועים שמורים</div>';
            return;
        }

        // Render events using FieldRendererService
        const eventsHTML = state.savedEvents.map(event => {
            const importanceBadge = window.FieldRendererService 
                ? window.FieldRendererService.renderStatus(event.importance, 'economic-event')
                : `<span class="badge bg-${event.importance === 'high' ? 'danger' : event.importance === 'medium' ? 'warning' : 'secondary'}">${event.importance}</span>`;

            const dateDisplay = event.date ? new Date(event.date).toLocaleDateString('he-IL') : '-';
            const timeDisplay = event.time || '-';

            return `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                ${importanceBadge}
                                <span class="badge bg-primary">${event.eventType || '-'}</span>
                                <span class="badge bg-secondary">${event.country || '-'}</span>
                            </div>
                            <h6 class="mb-1">${event.title || '-'}</h6>
                            <p class="mb-1">${dateDisplay} ${timeDisplay}</p>
                            ${event.description ? `<p class="mb-1 text-muted">${event.description}</p>` : ''}
                            ${event.linkedTrades && event.linkedTrades.length > 0 
                                ? `<small class="text-muted">
                                    <img src="../../images/icons/tabler/link.svg" width="16" height="16" alt="link" class="icon"> 
                                    קשור לטריידים: ${event.linkedTrades.join(', ')}
                                   </small>`
                                : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="list-group">${eventsHTML}</div>`;
    }

    // ===== INITIALIZATION =====

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'economic-calendar-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'economic-calendar-page', 
                        error 
                    });
                }
            }
        } else {
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'economic-calendar-page', 
                                error 
                            });
                        }
                    });
                }
            }, 500);
        }
    }

    /**
     * Initialize page
     */
    async function initializePage() {
        if (window.Logger) {
            window.Logger.info('Initializing Economic Calendar Page', {
                page: 'economic-calendar-page'
            });
        }

        // Initialize Header System first
        initializeHeader();

        // Initialize filters
        initializeFilters();

        // Initialize preferences integration
        initializePreferencesIntegration();

        // Wait for required systems
        await waitFor(() => {
            return typeof window.TradingViewWidgetsManager !== 'undefined' &&
                   typeof window.TradingViewWidgetsConfig !== 'undefined' &&
                   typeof window.TradingViewWidgetsColors !== 'undefined';
        }, 15000);

        // Initialize widget
        await initializeEconomicCalendarWidget();

        // Load mock data
        if (window.EconomicEventsMockData) {
            state.savedEvents = window.EconomicEventsMockData;
        }

        // Render saved events
        renderSavedEvents();

        // Update summary statistics (will be handled by InfoSummarySystem)
        if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
            const config = window.INFO_SUMMARY_CONFIGS['economic-calendar-page'];
            if (config && state.savedEvents) {
                window.InfoSummarySystem.calculateAndRender(state.savedEvents, config);
            }
        }
    }

    // ===== CLEANUP =====

    /**
     * Cleanup on page unload
     */
    function cleanup() {
        destroyWidget();
        document.removeEventListener('preferences:all-loaded', handlePreferencesLoaded);
    }

    // ===== EVENT LISTENERS =====

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // ===== EXPORTS =====

    // Export functions to window for debugging
    window.economicCalendarPage = {
        getCSSVariableValue,
        initializeHeader,
        initializeEconomicCalendarWidget,
        updateWidgetConfig,
        destroyWidget,
        handleFilterChange,
        renderSavedEvents,
        state: state
    };

})();
