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
        
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', message || 'שגיאה לא ידועה');
        }
        if (window.Logger) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בלוח כלכלי', 
                    `לא ניתן לטעון את הלוח הכלכלי. ${errorMsg}`);
            } else if (window.Logger) {
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
     * Load filters from UnifiedCacheManager or localStorage fallback
     */
    async function loadFilters() {
        try {
            let stored = null;
            
            // Try UnifiedCacheManager first
            if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
                stored = await window.UnifiedCacheManager.get(FILTERS_STORAGE_KEY);
            }
            
            // Fallback to localStorage
            if (!stored) {
                const localStorageData = localStorage.getItem(FILTERS_STORAGE_KEY);
                if (localStorageData) {
                    stored = JSON.parse(localStorageData);
                }
            }
            
            if (stored) {
                if (stored.countries) state.filters.countries = stored.countries;
                if (stored.importance) state.filters.importance = stored.importance;
                if (stored.eventTypes) state.filters.eventTypes = stored.eventTypes;
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to load filters', { page: 'economic-calendar-page', error });
            }
        }
    }

    /**
     * Save filters to UnifiedCacheManager or localStorage fallback
     */
    async function saveFilters() {
        try {
            const data = {
                countries: state.filters.countries,
                importance: state.filters.importance,
                eventTypes: state.filters.eventTypes,
                lastUpdated: Date.now()
            };
            
            // Try UnifiedCacheManager first
            if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
                await window.UnifiedCacheManager.save(FILTERS_STORAGE_KEY, data, {
                    layer: 'localStorage',
                    ttl: null, // persistent
                    syncToBackend: false
                });
            } else {
                // Fallback to localStorage
                localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(data));
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save filters', { page: 'economic-calendar-page', error });
            }
            // Final fallback to localStorage
            try {
                const data = {
                    countries: state.filters.countries,
                    importance: state.filters.importance,
                    eventTypes: state.filters.eventTypes,
                    lastUpdated: Date.now()
                };
                localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                // Ignore localStorage errors
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
        await saveFilters();
        await savePageState();

        // Update widget
        updateWidgetConfig();
    }

    /**
     * Initialize filters
     */
    function initializeFilters() {
        await loadFilters();
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
                return cached.config;
            }
        } catch (error) {
            // Ignore cache errors
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

        } catch (error) {
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

    // ===== EVENT MANAGEMENT =====

    /**
     * Map TradingView importance to our format
     * @param {number|string} importance - TradingView importance (-1, 0, 1 or string)
     * @returns {string} Our importance format (high, medium, low)
     */
    function mapTradingViewImportance(importance) {
        if (typeof importance === 'string') {
            const lower = importance.toLowerCase();
            if (lower.includes('high') || lower.includes('גבוה')) return 'high';
            if (lower.includes('medium') || lower.includes('בינוני')) return 'medium';
            if (lower.includes('low') || lower.includes('נמוך')) return 'low';
        }
        if (typeof importance === 'number') {
            if (importance === 1 || importance === '1') return 'high';
            if (importance === 0 || importance === '0') return 'medium';
            if (importance === -1 || importance === '-1') return 'low';
        }
        return 'medium'; // Default
    }

    /**
     * Map TradingView event type to our format
     * @param {string} type - TradingView event type
     * @returns {string} Our event type format
     */
    function mapTradingViewEventType(type) {
        if (!type) return 'other';
        const lower = type.toLowerCase();
        if (lower.includes('interest') || lower.includes('rate') || lower.includes('ריבית')) return 'interest-rate';
        if (lower.includes('gdp') || lower.includes('תוצר')) return 'gdp';
        if (lower.includes('employment') || lower.includes('job') || lower.includes('תעסוקה')) return 'employment';
        if (lower.includes('inflation') || lower.includes('cpi') || lower.includes('אינפלציה')) return 'inflation';
        return 'other';
    }

    /**
     * Save event from widget
     * @param {Object} eventData - Event data from TradingView widget
     */
    function saveEventFromWidget(eventData) {
        if (!eventData) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'נתוני אירוע לא תקינים');
            }
            return;
        }

        // Map TradingView event to our format
        const newEvent = {
            id: Date.now(), // Temporary ID
            title: eventData.title || eventData.name || 'אירוע כלכלי',
            date: eventData.date || new Date().toISOString(),
            time: eventData.time || '00:00',
            country: eventData.country || 'US',
            importance: mapTradingViewImportance(eventData.importance),
            eventType: mapTradingViewEventType(eventData.category || eventData.type),
            description: eventData.description || '',
            actualValue: eventData.actual || null,
            forecastValue: eventData.forecast || null,
            previousValue: eventData.previous || null,
            linkedTrades: [],
            savedAt: new Date().toISOString(),
            userId: 1
        };

        // Check if event already exists
        const exists = state.savedEvents.some(e => 
            e.title === newEvent.title && 
            e.date === newEvent.date && 
            e.time === newEvent.time
        );

        if (exists) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showWarning('האירוע כבר שמור', 'האירוע כבר נמצא ברשימת האירועים השמורים');
            }
            return;
        }

        // Add to saved events
        state.savedEvents.push(newEvent);

        // Save to localStorage (mock - in real system would save to backend)
        try {
            localStorage.setItem('economic-calendar-saved-events', JSON.stringify(state.savedEvents));
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save events to localStorage', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }

        // Re-render
        renderSavedEvents();

        // Update summary
        if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
            const config = window.INFO_SUMMARY_CONFIGS['economic-calendar-page'];
            if (config && state.savedEvents.length > 0) {
                window.InfoSummarySystem.calculateAndRender(state.savedEvents, config);
            }
        }

        if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('האירוע נשמר בהצלחה');
        }
    }

    /**
     * Remove event from saved events
     * @param {number} eventId - Event ID to remove
     */
    function removeEvent(eventId) {
        const index = state.savedEvents.findIndex(e => e.id === eventId);
        if (index === -1) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', 'האירוע לא נמצא');
            }
            return;
        }

        const event = state.savedEvents[index];
        state.savedEvents.splice(index, 1);

        // Save to localStorage
        try {
            localStorage.setItem('economic-calendar-saved-events', JSON.stringify(state.savedEvents));
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save events to localStorage', {
                    page: 'economic-calendar-page',
                    error: error.message
                });
            }
        }

        // Re-render
        renderSavedEvents();

        // Update summary
        if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
            const config = window.INFO_SUMMARY_CONFIGS['economic-calendar-page'];
            if (config && state.savedEvents.length > 0) {
                window.InfoSummarySystem.calculateAndRender(state.savedEvents, config);
            } else if (state.savedEvents.length === 0) {
                // Clear summary if no events
                const summaryContainer = document.getElementById('economic-calendar-summary');
                if (summaryContainer) {
                    summaryContainer.innerHTML = '';
                }
            }
        }

        if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess(`האירוע "${event.title}" הוסר בהצלחה`);
        }

        if (window.Logger) {
            window.Logger.info('Event removed', {
                page: 'economic-calendar-page',
                eventId: eventId
            });
        }
    }

    /**
     * Show modal for saving event
     */
    function showSaveEventModal() {
        // Simple prompt for now (can be replaced with proper modal)
        const title = prompt('הזן כותרת האירוע:');
        if (!title) return;

        const date = prompt('הזן תאריך (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        if (!date) return;

        const time = prompt('הזן שעה (HH:MM):', '00:00');
        if (!time) return;

        const country = prompt('הזן מדינה (US, EU, UK, JP):', 'US');
        const importance = prompt('הזן חשיבות (high, medium, low):', 'medium');
        const eventType = prompt('הזן סוג אירוע (interest-rate, gdp, employment, inflation):', 'other');

        const eventData = {
            title: title,
            date: date,
            time: time,
            country: country || 'US',
            importance: importance || 'medium',
            type: eventType || 'other'
        };

        saveEventFromWidget(eventData);
    }

    /**
     * Setup widget event listeners for saving events
     */
    function setupWidgetEventListeners() {
        // Show save button controls
        const saveControls = document.getElementById('save-event-controls');
        if (saveControls) {
            saveControls.style.display = 'block';
        }

        // Setup button click handler
        const saveButton = document.getElementById('save-event-from-widget-btn');
        if (saveButton && !saveButton.dataset.listenerAdded) {
            saveButton.addEventListener('click', () => {
                showSaveEventModal();
            });
            saveButton.dataset.listenerAdded = 'true';
        }
    }

    // ===== WIDGET MANAGEMENT =====

    /**
     * Initialize Economic Calendar Widget
     * @returns {Promise<void>}
     */
    async function initializeEconomicCalendarWidget() {
        if (state.initialized) {
            return;
        }

        showLoading();
        hideError();

        try {
            // Wait for TradingViewWidgetsManager to be available (reduced timeout)
            const managerAvailable = await waitFor(() => {
                return typeof window.TradingViewWidgetsManager !== 'undefined';
            }, 2000).catch(() => false);

            if (!managerAvailable) {
                throw new Error('TradingViewWidgetsManager not available after timeout');
            }

            // Initialize TradingViewWidgetsManager if needed (blocking for widget creation)
            if (window.TradingViewWidgetsManager && !window.TradingViewWidgetsManager._initialized) {
                await window.TradingViewWidgetsManager.init();
                
                // Wait for initialization to complete (reduced timeout)
                await waitFor(() => {
                    return window.TradingViewWidgetsManager._initialized === true;
                }, 2000).catch(() => {
                    // Continue anyway - widget might still work
                });
            }

            // Load cache and preferences in parallel (non-blocking, very short timeout)
            const loadOptionalData = Promise.allSettled([
                // Cache system (500ms max)
                window.cacheSystemReady !== undefined 
                    ? Promise.race([
                        waitFor(() => window.cacheSystemReady === true, 500),
                        new Promise(resolve => setTimeout(resolve, 500))
                    ])
                    : Promise.resolve(),
                // Preferences (500ms max)
                Promise.race([
                    waitFor(() => window.currentPreferences || window.userPreferences, 500),
                    new Promise(resolve => setTimeout(resolve, 500))
                ])
            ]);
            
            // Don't wait for optional data - continue immediately
            loadOptionalData.catch(() => {
                // Ignore - these are optional
            });

            // Get widget configuration (non-blocking, use defaults if cache/preferences not ready)
            const config = await getWidgetConfig(false);

            // Create widget immediately
            const widget = window.TradingViewWidgetsManager.createWidget({
                type: 'economic-calendar',
                containerId: state.widgetContainerId,
                config: config
            });

            state.widget = widget;
            state.initialized = true;

            hideLoading();
            hideError();

            // Setup event listeners after widget is loaded
            setupWidgetEventListeners();
            
            // Update widget config in background if cache/preferences become available
            loadOptionalData.then(() => {
                getWidgetConfig(true).then(updatedConfig => {
                    if (state.widget && updatedConfig) {
                        window.TradingViewWidgetsManager.updateWidget(state.widget.id, updatedConfig);
                    }
                }).catch(() => {
                    // Ignore - widget already loaded with defaults
                });
            });

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
            }
        } catch (error) {
            // Ignore update errors
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
            } catch (error) {
                // Ignore destroy errors
            }
        }
    }

    // ===== PREFERENCES INTEGRATION =====

    /**
     * Handle preferences loaded event
     */
    function handlePreferencesLoaded() {

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

        // Render events as table with two columns
        const tableHTML = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>תאריך ושעה</th>
                        <th>אירוע</th>
                        <th>מדינה</th>
                        <th>חשיבות</th>
                        <th>סוג</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.savedEvents.map(event => {
                        const importanceBadge = window.FieldRendererService 
                            ? window.FieldRendererService.renderStatus(event.importance, 'economic-event')
                            : `<span class="badge bg-${event.importance === 'high' ? 'danger' : event.importance === 'medium' ? 'warning' : 'secondary'}">${event.importance}</span>`;

                        const dateDisplay = event.date ? new Date(event.date).toLocaleDateString('he-IL') : '-';
                        const timeDisplay = event.time || '-';
                        
                        // Get icon for link using IconSystem (async, will be rendered after)
                        const linkIconPlaceholder = '<span class="icon-placeholder" data-icon="link" data-size="16"></span>';

                        return `
                            <tr>
                                <td>
                                    <div>${dateDisplay}</div>
                                    <small class="text-muted">${timeDisplay}</small>
                                </td>
                                <td>
                                    <strong>${event.title || '-'}</strong>
                                    ${event.description ? `<div class="text-muted small mt-1">${event.description}</div>` : ''}
                                    ${event.linkedTrades && event.linkedTrades.length > 0 
                                        ? `<div class="mt-1">
                                            ${linkIconPlaceholder}
                                            <small class="text-muted">קשור לטריידים: ${event.linkedTrades.join(', ')}</small>
                                           </div>`
                                        : ''}
                                </td>
                                <td><span class="badge bg-secondary">${event.country || '-'}</span></td>
                                <td>${importanceBadge}</td>
                                <td><span class="badge bg-primary">${event.eventType || '-'}</span></td>
                                <td class="actions-cell">
                                    ${window.createActionsMenu ? window.createActionsMenu([
                                        { type: 'DELETE', onclick: `window.economicCalendarPage?.removeEvent(${event.id})`, title: 'הסר אירוע' }
                                    ]) : `
                                    <button class="btn btn-sm btn-outline-danger" data-onclick="window.economicCalendarPage?.removeEvent(${event.id})" title="הסר אירוע">
                                        <span class="icon-placeholder" data-icon="trash" data-size="14"></span>
                                    </button>
                                    `}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
        
        // Initialize icons in the rendered table (async, don't block)
        initializeIcons().catch(() => {
            // Ignore errors - icons will load when ready
        });
    }

    // ===== INITIALIZATION =====

    /**
     * Initialize icons using IconSystem
     */
    async function initializeIcons() {
        // Wait for IconMappings to be loaded first (short timeout)
        if (typeof window.IconMappings === 'undefined') {
            await waitFor(() => {
                return typeof window.IconMappings !== 'undefined';
            }, 1000).catch(() => {
                // Continue anyway
            });
        }

        // Wait for IconSystem to be ready (short timeout)
        if (!window.IconSystem) {
            await waitFor(() => {
                return typeof window.IconSystem !== 'undefined';
            }, 1000).catch(() => {
                return;
            });
        }

        // Initialize IconSystem if needed
        if (window.IconSystem && !window.IconSystem.initialized) {
            await window.IconSystem.initialize().catch(() => {
                // Continue anyway
            });
        }

        if (!window.IconSystem || !window.IconSystem.initialized) {
            return;
        }

        // Verify mappings are loaded - retry if needed
        if (!window.IconSystem.mappings || !window.IconSystem.mappings.buttons) {
            // Retry loading mappings
            if (window.IconMappings) {
                window.IconSystem.mappings = window.IconMappings;
            } else {
                // Wait a bit and retry
                await new Promise(resolve => setTimeout(resolve, 100));
                if (window.IconMappings) {
                    window.IconSystem.mappings = window.IconMappings;
                } else {
                    return;
                }
            }
        }

        // Replace all icon placeholders (only if they have a parent node)
        const placeholders = Array.from(document.querySelectorAll('.icon-placeholder'));
        
        for (const placeholder of placeholders) {
            // Check if placeholder has a parent (is in DOM)
            if (!placeholder.parentNode) {
                continue; // Skip if not in DOM
            }

            const iconName = placeholder.getAttribute('data-icon');
            const size = placeholder.getAttribute('data-size') || '16';
            
            if (iconName) {
                try {
                    const iconHTML = await window.IconSystem.renderIcon('button', iconName, {
                        size: size,
                        alt: iconName,
                        class: 'icon'
                    });
                    // Only replace if still has parent and is still in the list
                    if (placeholder.parentNode && document.contains(placeholder)) {
                        placeholder.outerHTML = iconHTML;
                    }
                } catch (error) {
                    // Fallback - try to use img tag with path
                    if (placeholder.parentNode && document.contains(placeholder)) {
                        const fallbackPath = `/trading-ui/images/icons/tabler/${iconName}.svg`;
                        placeholder.outerHTML = `<img src="${fallbackPath}" width="${size}" height="${size}" alt="${iconName}" class="icon" onerror="this.style.display='none'">`;
                    }
                }
            }
        }
    }

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

        // Initialize Header System first
        initializeHeader();

        // Initialize icons
        initializeIcons();

        // Initialize filters
        await initializeFilters();
        
        // Restore page state
        await restorePageState();

        // Initialize preferences integration
        initializePreferencesIntegration();

        // Wait for required systems (reduced timeout for faster loading)
        const systemsReady = await Promise.race([
            waitFor(() => {
                return typeof window.TradingViewWidgetsManager !== 'undefined' &&
                       typeof window.TradingViewWidgetsConfig !== 'undefined' &&
                       typeof window.TradingViewWidgetsColors !== 'undefined';
            }, 5000), // Reduced from 15000 to 5000
            new Promise(resolve => setTimeout(() => resolve(false), 5000)) // Max 5 seconds
        ]);

        if (!systemsReady) {
        }

        // Initialize widget in background (don't block on this - load data immediately)
        // Load data first, then initialize widget
        initializeEconomicCalendarWidget().catch(error => {
        });

        // Load mock data (always do this, even if widget failed)
        if (window.EconomicEventsMockData) {
            state.savedEvents = window.EconomicEventsMockData;
            
        }

        // Render saved events
        renderSavedEvents();

        // Setup widget event listeners for saving events
        setupWidgetEventListeners();

        // Update summary statistics (will be handled by InfoSummarySystem)
        if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
            const config = window.INFO_SUMMARY_CONFIGS['economic-calendar-page'];
            if (config && state.savedEvents && state.savedEvents.length > 0) {
                window.InfoSummarySystem.calculateAndRender(state.savedEvents, config);
                
            }
        }
    }

    /**
     * Save page state (filters, sections)
     * @async
     */
    async function savePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            // Get section states
            const sections = {};
            const sectionIds = ['economic_calendar_page-פילטרים', 'economic_calendar_page-אירועים-כלכליים', 
                               'economic_calendar_page-אירועים-שמורים', 'economic_calendar_page-סטטיסטיקות'];
            sectionIds.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionBody = section.querySelector('.section-body');
                    sections[sectionId] = sectionBody ? sectionBody.style.display === 'none' : false;
                }
            });

            const pageState = {
                filters: {
                    countries: state.filters.countries,
                    importance: state.filters.importance,
                    eventTypes: state.filters.eventTypes
                },
                sections: sections
            };

            await window.PageStateManager.savePageState('economic-calendar', pageState);
            if (window.Logger) {
                window.Logger.debug('✅ Saved page state', { page: 'economic-calendar-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save page state', { page: 'economic-calendar-page', error });
            }
        }
    }

    /**
     * Restore page state (filters, sections)
     * @async
     */
    async function restorePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            const savedState = await window.PageStateManager.loadPageState('economic-calendar');
            if (!savedState) {
                return;
            }

            // Restore filters if available
            if (savedState.filters) {
                if (savedState.filters.countries) {
                    state.filters.countries = savedState.filters.countries;
                }
                if (savedState.filters.importance) {
                    state.filters.importance = savedState.filters.importance;
                }
                if (savedState.filters.eventTypes) {
                    state.filters.eventTypes = savedState.filters.eventTypes;
                }
                applyFiltersToUI();
            }

            // Restore section states if available
            if (savedState.sections) {
                Object.keys(savedState.sections).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const sectionBody = section.querySelector('.section-body');
                        if (sectionBody) {
                            sectionBody.style.display = savedState.sections[sectionId] ? 'none' : 'block';
                        }
                    }
                });
            }

            if (window.Logger) {
                window.Logger.debug('✅ Restored page state', { page: 'economic-calendar-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to restore page state', { page: 'economic-calendar-page', error });
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
        saveEventFromWidget,
        removeEvent,
        showSaveEventModal,
        state: state
    };

})();
