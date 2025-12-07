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
            
            // Validate tickerId
            if (!tickerId || isNaN(tickerId) || tickerId <= 0) {
                const errorMsg = `מזהה טיקר לא תקין: ${tickerId}`;
                if (window.Logger) {
                    window.Logger.error('❌ Invalid ticker ID in loadTickerDashboardData', { tickerId, page: 'ticker-dashboard-data' });
                }
                const error = new Error(errorMsg);
                error.status = 400;
                error.userMessage = errorMsg;
                throw error;
            }
            
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
                try {
                    // EntityDetailsAPI.getEntityDetails returns the entity data directly (not wrapped in { ticker: {...} })
                    // It already includes market data merged into the entity object
                    const tickerData = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
                        includeLinkedItems: true,
                        includeMarketData: true,
                        forceRefresh: forceRefresh
                    });
                    
                    if (window.Logger) {
                        window.Logger.info('✅ Loaded ticker data from EntityDetailsAPI', { 
                            tickerId,
                            hasTickerData: !!tickerData,
                            hasAtr: !!tickerData?.atr,
                            hasWeek52High: !!tickerData?.week52_high,
                            hasVolatility: !!tickerData?.volatility,
                            page: 'ticker-dashboard-data' 
                        });
                    }
                    
                    // Save to cache
                    if (window.UnifiedCacheManager && tickerData) {
                        await window.UnifiedCacheManager.save(cacheKey, tickerData, 'memory', { ttl: 300 }); // 5 minutes
                    }
                    
                    return tickerData;
                } catch (error) {
                    // Check if it's a 404 error (ticker not found)
                    const isNotFound = error?.message?.includes('לא נמצא') || 
                                       error?.message?.includes('not found') ||
                                       error?.message?.includes('404');
                    
                    if (isNotFound) {
                        const errorMsg = `טיקר עם מזהה ${tickerId} לא נמצא במערכת`;
                        if (window.Logger) {
                            window.Logger.error(errorMsg, { tickerId, page: 'ticker-dashboard-data' });
                        }
                        const notFoundError = new Error(errorMsg);
                        notFoundError.status = 404;
                        notFoundError.userMessage = errorMsg;
                        throw notFoundError;
                    }
                    // Re-throw other errors
                    throw error;
                }
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
            // Limit to reasonable number to avoid excessive API calls
            const MAX_PLANS_TO_CHECK = 50; // Limit to first 50 plans to avoid excessive API calls
            const plansToCheck = tradePlans.slice(0, MAX_PLANS_TO_CHECK);
            
            if (tradePlans.length > MAX_PLANS_TO_CHECK) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Too many trade plans, limiting conditions check', { 
                        tickerId, 
                        totalPlans: tradePlans.length,
                        checkingPlans: MAX_PLANS_TO_CHECK,
                        page: 'ticker-dashboard-data' 
                    });
                }
            }
            
            const allConditions = [];
            for (const plan of plansToCheck) {
                if (!plan.id) continue;
                
                try {
                    // Use AbortController to prevent console errors for 404s
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                    
                    const conditionsResponse = await fetch(`/api/plan-conditions/trade-plans/${plan.id}/conditions`, {
                        signal: controller.signal
                    }).catch(fetchError => {
                        // Silently handle fetch errors (network, abort, etc.)
                        if (fetchError.name === 'AbortError') {
                            return null; // Timeout - treat as no conditions
                        }
                        return null; // Other fetch errors - treat as no conditions
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!conditionsResponse) {
                        // Fetch failed or was aborted - silently continue
                        continue;
                    }
                    
                    if (conditionsResponse.ok) {
                        const conditionsData = await conditionsResponse.json();
                        if (conditionsData.status === 'success' && Array.isArray(conditionsData.data)) {
                            // Only add conditions if we have any
                            if (conditionsData.data.length > 0) {
                                // Add plan context to each condition with full plan details
                                const conditionsWithContext = conditionsData.data.map(condition => ({
                                    ...condition,
                                    _source: 'trade_plan',
                                    _plan_id: plan.id,
                                    plan_name: plan.name || `תוכנית ${plan.id}`, // Add plan_name for display
                                    // Add full plan details for display
                                    plan_ticker: plan.ticker ? {
                                        id: plan.ticker.id || plan.ticker_id,
                                        symbol: plan.ticker.symbol || '',
                                        name: plan.ticker.name || ''
                                    } : null,
                                    plan_created_at: plan.created_at || plan.date || null,
                                    plan_side: plan.side || null,
                                    plan_status: plan.status || null,
                                    plan_investment_type: plan.investment_type || null,
                                    method_name_he: condition.method_name_he || condition.method?.name_he || condition.method_name || 'תנאי', // Add method name in Hebrew
                                    method_name: condition.method_name || condition.method?.name_en || 'Condition' // Add method name in English
                                }));
                                allConditions.push(...conditionsWithContext);
                            }
                            // If conditionsData.data.length === 0, this is normal - no conditions for this plan
                            // Don't log anything - this is expected behavior
                        }
                    } else if (conditionsResponse.status === 404) {
                        // Trade plan not found or no conditions - this is normal, not an error
                        // Silently continue - 404 is not an error in this context
                        // Don't log or throw - this is expected behavior
                        continue;
                    } else {
                        // Other HTTP errors (500, 503, etc.) - log but don't fail
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Error loading conditions for trade plan', { 
                                tickerId, 
                                planId: plan.id, 
                                status: conditionsResponse.status,
                                page: 'ticker-dashboard-data' 
                            });
                        }
                    }
                } catch (planError) {
                    // Network or parsing errors - silently continue (don't log 404s)
                    // Only log non-404 errors
                    if (planError.name !== 'AbortError' && !planError.message?.includes('404')) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Error loading conditions for trade plan', { 
                                tickerId, 
                                planId: plan.id, 
                                error: planError.message || planError, 
                                page: 'ticker-dashboard-data' 
                            });
                        }
                    }
                    // Silently continue for all errors (including 404s)
                    continue;
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

