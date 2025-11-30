/**
 * Ticker Dashboard Data Service
 * 
 * Service for loading ticker dashboard data from API
 * 
 * Documentation: See documentation/04-FEATURES/WIREFRAMES/ticker-dashboard-wireframe.md
 */

(function() {
    'use strict';

    /**
     * Load ticker dashboard data
     * @param {number} tickerId - Ticker ID
     * @returns {Promise<Object>} Dashboard data
     */
    async function loadTickerDashboardData(tickerId, options = {}) {
        try {
            const { forceRefresh = false } = options;
            
            if (window.Logger) {
                window.Logger.info('📊 Loading ticker dashboard data', { tickerId, forceRefresh, page: 'ticker-dashboard-data' });
            }
            
            const cacheKey = `ticker-dashboard-${tickerId}`;
            
            // Use CacheTTLGuard if available for automatic caching
            if (window.CacheTTLGuard?.ensure && !forceRefresh) {
                return await window.CacheTTLGuard.ensure(cacheKey, async () => {
                    // Use EntityDetailsAPI to get complete ticker data with market data and linked items
                    if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                        return await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
                            includeLinkedItems: true,
                            includeMarketData: true,
                            forceRefresh: false
                        });
                    }
                    
            // Fallback: Load from API
            const response = await fetch(`/api/tickers/${tickerId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    const error = new Error(`טיקר עם מזהה ${tickerId} לא נמצא`);
                    error.status = 404;
                    error.userMessage = `טיקר עם מזהה ${tickerId} לא נמצא במערכת`;
                    throw error;
                } else if (response.status >= 500) {
                    const error = new Error(`שגיאת שרת בטעינת טיקר: ${response.status}`);
                    error.status = response.status;
                    error.userMessage = 'שגיאת שרת. אנא נסה שוב מאוחר יותר';
                    throw error;
                } else {
                    throw new Error(`שגיאה בטעינת טיקר: ${response.status} ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            return data.data || data;
                }, {
                    ttl: 300 * 1000, // 5 minutes
                    layer: 'memory',
                    afterRead: (data) => {
                        if (window.Logger) {
                            window.Logger.debug('✅ Ticker dashboard data served from cache', { tickerId, page: 'ticker-dashboard-data' });
                        }
                    },
                    afterLoad: (data) => {
                        if (window.Logger) {
                            window.Logger.debug('✅ Ticker dashboard data loaded from API', { tickerId, page: 'ticker-dashboard-data' });
                        }
                    }
                });
            }
            
            // Fallback: Manual cache check
            if (!forceRefresh && window.UnifiedCacheManager) {
                const cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
                if (cachedData) {
                    if (window.Logger) {
                        window.Logger.info('✅ Loaded ticker dashboard data from cache', { tickerId, page: 'ticker-dashboard-data' });
                    }
                    return cachedData;
                }
            }
            
            // Use EntityDetailsAPI to get complete ticker data with market data and linked items
            if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getEntityDetails === 'function') {
                const tickerData = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
                    includeLinkedItems: true,
                    includeMarketData: true,
                    forceRefresh: forceRefresh
                });
                
                // Market data might be null if endpoint is not available - this is OK, continue with ticker data
                if (tickerData && !tickerData.marketData) {
                    if (window.Logger) {
                        window.Logger.info('Market data not available - continuing with ticker data only', { 
                            tickerId,
                            hasTickerData: !!tickerData,
                            page: 'ticker-dashboard-data' 
                        });
                    }
                }
                
                // Save to cache
                if (window.UnifiedCacheManager && tickerData) {
                    await window.UnifiedCacheManager.save(cacheKey, tickerData, 'memory', { ttl: 300 }); // 5 minutes
                }
                
                return tickerData;
            }
            
            // Fallback: Load from API
            const response = await fetch(`/api/tickers/${tickerId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    const error = new Error(`טיקר עם מזהה ${tickerId} לא נמצא`);
                    error.status = 404;
                    error.userMessage = `טיקר עם מזהה ${tickerId} לא נמצא במערכת`;
                    throw error;
                } else if (response.status >= 500) {
                    const error = new Error(`שגיאת שרת בטעינת טיקר: ${response.status}`);
                    error.status = response.status;
                    error.userMessage = 'שגיאת שרת. אנא נסה שוב מאוחר יותר';
                    throw error;
                } else {
                    throw new Error(`שגיאה בטעינת טיקר: ${response.status} ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            const tickerData = data.data || data;
            
            // Save to cache
            if (window.UnifiedCacheManager && tickerData) {
                await window.UnifiedCacheManager.save(cacheKey, tickerData, 'memory', { ttl: 300 }); // 5 minutes
            }
            
            return tickerData;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error loading ticker dashboard data', { 
                    tickerId, 
                    error: error.message || error, 
                    status: error.status,
                    page: 'ticker-dashboard-data' 
                });
            }
            
            // Show user-friendly error message if available
            if (error.userMessage && window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בטעינת נתונים', error.userMessage);
            }
            
            throw error;
        }
    }

    /**
     * Load ticker user activity (Trade Plans, Trades, Executions, Alerts)
     * @param {number} tickerId - Ticker ID
     * @returns {Promise<Array>} User activity data (linked items array)
     */
    async function loadTickerUserActivity(tickerId, options = {}) {
        try {
            const { forceRefresh = false } = options;
            
            if (window.Logger) {
                window.Logger.info('📊 Loading ticker user activity', { tickerId, forceRefresh, page: 'ticker-dashboard-data' });
            }
            
            const cacheKey = `ticker-user-activity-${tickerId}`;
            
            // Use CacheTTLGuard if available for automatic caching
            if (window.CacheTTLGuard?.ensure && !forceRefresh) {
                return await window.CacheTTLGuard.ensure(cacheKey, async () => {
                    // Use EntityDetailsAPI to get linked items
                    if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getLinkedItems === 'function') {
                        const linkedItems = await window.entityDetailsAPI.getLinkedItems('ticker', tickerId, {
                            forceRefresh: false
                        });
                        return Array.isArray(linkedItems) ? linkedItems : [];
                    }
                    
                    // Fallback: Load from API
                    const response = await fetch(`/api/tickers/${tickerId}/linked-items`);
                    if (!response.ok) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Failed to load linked items from API, returning empty array', { 
                                tickerId, 
                                status: response.status, 
                                page: 'ticker-dashboard-data' 
                            });
                        }
                        return [];
                    }
                    
                    const data = await response.json();
                    const linkedItems = data.data || data;
                    return Array.isArray(linkedItems) ? linkedItems : (linkedItems.linked_items || []);
                }, {
                    ttl: 300 * 1000, // 5 minutes
                    layer: 'memory',
                    afterRead: (data) => {
                        if (window.Logger) {
                            window.Logger.debug('✅ Ticker user activity served from cache', { tickerId, count: Array.isArray(data) ? data.length : 0, page: 'ticker-dashboard-data' });
                        }
                    },
                    afterLoad: (data) => {
                        if (window.Logger) {
                            window.Logger.debug('✅ Ticker user activity loaded from API', { tickerId, count: Array.isArray(data) ? data.length : 0, page: 'ticker-dashboard-data' });
                        }
                    }
                });
            }
            
            // Fallback: Direct load
            // Use EntityDetailsAPI to get linked items
            if (window.entityDetailsAPI && typeof window.entityDetailsAPI.getLinkedItems === 'function') {
                const linkedItems = await window.entityDetailsAPI.getLinkedItems('ticker', tickerId, {
                    forceRefresh: forceRefresh
                });
                return Array.isArray(linkedItems) ? linkedItems : [];
            }
            
            // Fallback: Load from API
            const response = await fetch(`/api/tickers/${tickerId}/linked-items`);
            if (!response.ok) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Failed to load linked items from API, returning empty array', { 
                        tickerId, 
                        status: response.status, 
                        page: 'ticker-dashboard-data' 
                    });
                }
                return [];
            }
            
            const data = await response.json();
            const linkedItems = data.data || data;
            return Array.isArray(linkedItems) ? linkedItems : (linkedItems.linked_items || []);
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error loading ticker user activity', { tickerId, error, page: 'ticker-dashboard-data' });
            }
            return []; // Return empty array instead of throwing
        }
    }

    /**
     * Load ticker conditions
     * Note: Conditions are associated with tickers through Trade Plans or Trades
     * This function collects all conditions from related trade plans
     * @param {number} tickerId - Ticker ID
     * @returns {Promise<Array>} Conditions data
     */
    async function loadTickerConditions(tickerId) {
        try {
            if (window.Logger) {
                window.Logger.info('📊 Loading ticker conditions', { tickerId, page: 'ticker-dashboard-data' });
            }
            
            // Conditions are associated with tickers through Trade Plans
            // First, get all trade plans for this ticker
            const tradePlansResponse = await fetch(`/api/trade-plans/?ticker_id=${tickerId}`);
            if (!tradePlansResponse.ok) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Failed to load trade plans for conditions', { 
                        tickerId, 
                        status: tradePlansResponse.status, 
                        page: 'ticker-dashboard-data' 
                    });
                }
                return [];
            }
            
            const tradePlansData = await tradePlansResponse.json();
            const tradePlans = (tradePlansData.status === 'success' && Array.isArray(tradePlansData.data)) 
                ? tradePlansData.data 
                : [];
            
            if (tradePlans.length === 0) {
                if (window.Logger) {
                    window.Logger.debug('No trade plans found for ticker, no conditions to load', { tickerId, page: 'ticker-dashboard-data' });
                }
                return [];
            }
            
            // Collect all conditions from all trade plans
            const allConditions = [];
            for (const plan of tradePlans) {
                if (!plan.id) continue;
                
                try {
                    const conditionsResponse = await fetch(`/api/plan-conditions/trade-plans/${plan.id}/conditions`);
                    if (conditionsResponse.ok) {
                        const conditionsData = await conditionsResponse.json();
                        if (conditionsData.status === 'success' && Array.isArray(conditionsData.data)) {
                            // Add plan context to each condition
                            const conditionsWithContext = conditionsData.data.map(condition => ({
                                ...condition,
                                _source: 'trade_plan',
                                _plan_id: plan.id,
                                _plan_name: plan.name || `תוכנית ${plan.id}`
                            }));
                            allConditions.push(...conditionsWithContext);
                        }
                    }
                } catch (planError) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Error loading conditions for trade plan', { 
                            tickerId, 
                            planId: plan.id, 
                            error: planError.message || planError, 
                            page: 'ticker-dashboard-data' 
                        });
                    }
                }
            }
            
            if (window.Logger) {
                window.Logger.info('✅ Loaded ticker conditions', { 
                    tickerId, 
                    count: allConditions.length, 
                    page: 'ticker-dashboard-data' 
                });
            }
            
            return allConditions;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error loading ticker conditions', { tickerId, error: error.message || error, page: 'ticker-dashboard-data' });
            }
            return []; // Return empty array instead of throwing
        }
    }

    /**
     * Load historical price data for chart
     * @param {number} tickerId - Ticker ID
     * @param {Object} options - Options (days, interval)
     * @returns {Promise<Array|null>} Historical data array or null if not available
     */
    async function loadHistoricalData(tickerId, options = {}) {
        try {
            const { days = 30, interval = '1d' } = options;
            
            if (window.Logger) {
                window.Logger.info('📊 Loading historical data', { tickerId, days, interval, page: 'ticker-dashboard-data' });
            }
            
            // Try to load from history endpoint
            const response = await fetch(`/api/external-data/quotes/${tickerId}/history?days=${days}&interval=${interval}`);
            
            if (response.status === 501) {
                // Feature not implemented - this is expected
                if (window.Logger) {
                    window.Logger.info('Historical data endpoint not implemented (501) - feature pending', { tickerId, page: 'ticker-dashboard-data' });
                }
                return []; // Return empty array instead of null for graceful degradation
            }
            
            if (!response.ok) {
                if (response.status === 404) {
                    // 404 - endpoint not found, return empty array (graceful degradation)
                    if (window.Logger) {
                        window.Logger.info('Historical data endpoint not found (404) - returning empty array', { 
                            tickerId, 
                            page: 'ticker-dashboard-data' 
                        });
                    }
                    return [];
                }
                // For other errors, return empty array instead of null
                if (window.Logger) {
                    window.Logger.info('Historical data not available', { 
                        tickerId, 
                        status: response.status, 
                        page: 'ticker-dashboard-data' 
                    });
                }
                return [];
            }
            
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                if (window.Logger) {
                    window.Logger.info('✅ Loaded historical data', { 
                        tickerId, 
                        count: Array.isArray(data.data) ? data.data.length : 1, 
                        page: 'ticker-dashboard-data' 
                    });
                }
                return Array.isArray(data.data) ? data.data : [data.data];
            }
            
            return null;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error loading historical data', { tickerId, error: error.message || error, page: 'ticker-dashboard-data' });
            }
            return null; // Return null instead of throwing
        }
    }

    // Export functions
    window.TickerDashboardData = {
        loadTickerDashboardData,
        loadTickerUserActivity,
        loadTickerConditions,
        loadHistoricalData
    };

    if (window.Logger) {
        window.Logger.info('✅ TickerDashboardData service loaded', { page: 'ticker-dashboard-data' });
    }
})();

