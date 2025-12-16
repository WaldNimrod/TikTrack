/**
 * Ticker Dashboard Server Data Debug Console
 * 
 * קוד בדיקה מקיף לבדיקת נתונים מהשרת
 * 
 * שימוש: העתק את הקוד הזה לקונסול הדפדפן והרץ
 */

(function() {
    'use strict';

    /**
     * בדיקת נתונים ישירות מה-API
     */
    window.debugServerData = async function() {
        console.group('🔍 Server Data Debug Report');
        console.log('Timestamp:', new Date().toISOString());
        
        // Get tickerId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tickerId = urlParams.get('tickerId') || urlParams.get('tickerSymbol');
        
        if (!tickerId) {
            console.error('❌ No tickerId found in URL');
            console.groupEnd();
            return;
        }
        
        console.log('Ticker ID from URL:', tickerId);
        console.log('---');
        
        // 1. בדיקת API ישירה - /api/tickers/{id}
        console.group('1. Direct API Call: /api/tickers/{id}');
        try {
            const response = await fetch(`/api/tickers/${tickerId}`);
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                console.error('❌ API call failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error body:', errorText);
            } else {
                const data = await response.json();
                console.log('✅ API Response:', data);
                
                if (data.status === 'success' && data.data) {
                    const ticker = data.data;
                    console.log('Ticker data:', ticker);
                    console.log('Ticker keys:', Object.keys(ticker));
                    console.log('ATR:', ticker.atr);
                    console.log('Week52 High:', ticker.week52_high);
                    console.log('Week52 Low:', ticker.week52_low);
                    console.log('Volatility:', ticker.volatility);
                } else {
                    console.warn('⚠️ Unexpected response structure:', data);
                }
            }
        } catch (error) {
            console.error('❌ Error calling API:', error);
        }
        console.groupEnd();
        
        // 2. בדיקת EntityDetailsAPI
        console.group('2. EntityDetailsAPI: getEntityDetails');
        try {
            if (!window.entityDetailsAPI) {
                console.error('❌ entityDetailsAPI not available');
            } else {
                console.log('✅ entityDetailsAPI available');
                const entityDetails = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
                    includeLinkedItems: true,
                    includeMarketData: true,
                    forceRefresh: true // Force refresh to get latest data
                });
                
                console.log('✅ EntityDetails Response:', entityDetails);
                console.log('EntityDetails keys:', Object.keys(entityDetails || {}));
                
                if (entityDetails) {
                    // Check ticker data
                    const tickerData = entityDetails.ticker || entityDetails;
                    console.log('Ticker data from EntityDetails:', tickerData);
                    console.log('Ticker keys:', Object.keys(tickerData || {}));
                    
                    // Check specific fields
                    console.group('Specific Fields Check');
                    console.log('ATR:', tickerData?.atr, '(type:', typeof tickerData?.atr, ')');
                    console.log('ATR Period:', tickerData?.atr_period);
                    console.log('Week52 High:', tickerData?.week52_high, '(type:', typeof tickerData?.week52_high, ')');
                    console.log('Week52 Low:', tickerData?.week52_low, '(type:', typeof tickerData?.week52_low, ')');
                    console.log('Volatility:', tickerData?.volatility, '(type:', typeof tickerData?.volatility, ')');
                    console.log('Current Price:', tickerData?.current_price || tickerData?.price);
                    console.log('Volume:', tickerData?.volume);
                    console.log('Change %:', tickerData?.daily_change_percent || tickerData?.change_percent);
                    console.groupEnd();
                    
                    // Check market data
                    if (entityDetails.marketData) {
                        console.log('Market Data:', entityDetails.marketData);
                    }
                    
                    // Check linked items
                    if (entityDetails.linked_items) {
                        console.log('Linked Items count:', entityDetails.linked_items.length);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error calling EntityDetailsAPI:', error);
            console.error('Error stack:', error.stack);
        }
        console.groupEnd();
        
        // 3. בדיקת TickerDashboardData service
        console.group('3. TickerDashboardData Service');
        try {
            if (!window.TickerDashboardData) {
                console.error('❌ TickerDashboardData service not available');
            } else {
                console.log('✅ TickerDashboardData service available');
                const dashboardData = await window.TickerDashboardData.loadTickerDashboardData(tickerId, {
                    forceRefresh: true
                });
                
                console.log('✅ Dashboard Data Response:', dashboardData);
                console.log('Dashboard Data keys:', Object.keys(dashboardData || {}));
                
                if (dashboardData) {
                    console.group('Dashboard Data Fields');
                    console.log('ATR:', dashboardData.atr);
                    console.log('Week52 High:', dashboardData.week52_high);
                    console.log('Week52 Low:', dashboardData.week52_low);
                    console.log('Volatility:', dashboardData.volatility);
                    console.log('Current Price:', dashboardData.current_price || dashboardData.price);
                    console.log('Volume:', dashboardData.volume);
                    console.log('Symbol:', dashboardData.symbol);
                    console.groupEnd();
                }
            }
        } catch (error) {
            console.error('❌ Error calling TickerDashboardData:', error);
            console.error('Error stack:', error.stack);
        }
        console.groupEnd();
        
        // 4. בדיקת Backend EntityDetailsService ישירות
        console.group('4. Backend EntityDetailsService: /api/entity-details/ticker/{id}');
        try {
            const response = await fetch(`/api/entity-details/ticker/${tickerId}?includeLinkedItems=true&includeMarketData=true`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                console.error('❌ EntityDetailsService API call failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error body:', errorText);
            } else {
                const data = await response.json();
                console.log('✅ EntityDetailsService Response:', data);
                
                // Handle both 'status: success' and 'success: true' response formats
                const isSuccess = (data.status === 'success' || data.success === true);
                const entityData = data.data || data;
                
                if (isSuccess && entityData) {
                    console.log('Entity data:', entityData);
                    
                    // For ticker entity_type, data is directly in entityData (not nested in ticker object)
                    // Check if this is a ticker response
                    if (entityData.entity_type === 'ticker' || entityData.symbol) {
                        console.group('Ticker Data from Backend (Direct)');
                        console.log('Ticker keys:', Object.keys(entityData));
                        console.log('ATR:', entityData.atr, '(type:', typeof entityData.atr, ')');
                        console.log('ATR Period:', entityData.atr_period);
                        console.log('Week52 High:', entityData.week52_high, '(type:', typeof entityData.week52_high, ')');
                        console.log('Week52 Low:', entityData.week52_low, '(type:', typeof entityData.week52_low, ')');
                        console.log('Volatility:', entityData.volatility, '(type:', typeof entityData.volatility, ')');
                        console.log('Current Price:', entityData.current_price || entityData.price);
                        console.log('Volume:', entityData.volume);
                        console.log('Change %:', entityData.daily_change_percent || entityData.change_percent);
                        console.groupEnd();
                    }
                    
                    // Check ticker object (for nested responses)
                    if (entityData.ticker) {
                        const ticker = entityData.ticker;
                        console.group('Ticker Object from Backend (Nested)');
                        console.log('Ticker:', ticker);
                        console.log('Ticker keys:', Object.keys(ticker));
                        console.log('ATR:', ticker.atr, '(type:', typeof ticker.atr, ')');
                        console.log('ATR Period:', ticker.atr_period);
                        console.log('Week52 High:', ticker.week52_high, '(type:', typeof ticker.week52_high, ')');
                        console.log('Week52 Low:', ticker.week52_low, '(type:', typeof ticker.week52_low, ')');
                        console.log('Volatility:', ticker.volatility, '(type:', typeof ticker.volatility, ')');
                        console.log('Current Price:', ticker.current_price || ticker.price);
                        console.log('Volume:', ticker.volume);
                        console.log('Change %:', ticker.daily_change_percent || ticker.change_percent);
                        console.groupEnd();
                    }
                    
                    // Check linked items
                    if (entityData.linked_items) {
                        console.log('Linked Items count:', entityData.linked_items.length);
                    }
                } else {
                    console.warn('⚠️ Unexpected response structure:', data);
                }
            }
        } catch (error) {
            console.error('❌ Error calling EntityDetailsService API:', error);
            console.error('Error stack:', error.stack);
        }
        console.groupEnd();
        
        // 5. בדיקת MarketDataQuote ישירות מהבסיס נתונים
        console.group('5. Market Data Quote: /api/external-data/quotes/{id}');
        try {
            const response = await fetch(`/api/external-data/quotes/${tickerId}`);
            console.log('Response status:', response.status);
            
            if (response.status === 404) {
                console.warn('⚠️ Endpoint /api/external-data/quotes/{id} not found (404)');
                console.log('This is expected if the endpoint is not implemented yet');
            } else if (!response.ok) {
                console.error('❌ Market Data API call failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error body:', errorText);
            } else {
                const data = await response.json();
                console.log('✅ Market Data Response:', data);
                
                if (data.status === 'success' && data.data) {
                    const quote = data.data;
                    console.log('Quote data:', quote);
                    console.log('ATR in quote:', quote.atr);
                    console.log('Price in quote:', quote.price);
                    console.log('Volume in quote:', quote.volume);
                }
            }
        } catch (error) {
            console.error('❌ Error calling Market Data API:', error);
        }
        console.groupEnd();
        
        // 6. סיכום השוואתי
        console.group('6. Summary Comparison');
        try {
            // Get data from all sources
            const [directAPI, entityDetails, dashboardData, backendAPI] = await Promise.allSettled([
                fetch(`/api/tickers/${tickerId}`).then(r => r.ok ? r.json() : null),
                window.entityDetailsAPI?.getEntityDetails('ticker', tickerId, { forceRefresh: true }).catch(() => null),
                window.TickerDashboardData?.loadTickerDashboardData(tickerId, { forceRefresh: true }).catch(() => null),
                fetch(`/api/entity-details/ticker/${tickerId}?includeLinkedItems=true&includeMarketData=true`).then(r => r.ok ? r.json() : null).catch(() => null)
            ]);
            
            const comparison = {
                directAPI: directAPI.status === 'fulfilled' ? directAPI.value : null,
                entityDetails: entityDetails.status === 'fulfilled' ? entityDetails.value : null,
                dashboardData: dashboardData.status === 'fulfilled' ? dashboardData.value : null,
                backendAPI: backendAPI.status === 'fulfilled' ? backendAPI.value : null
            };
            
            console.log('Data Sources Comparison:', comparison);
            
            // Extract ATR from each source (handle both nested and direct structures)
            const atrValues = {
                directAPI: comparison.directAPI?.data?.atr ?? comparison.directAPI?.atr,
                entityDetails: comparison.entityDetails?.ticker?.atr ?? comparison.entityDetails?.atr,
                dashboardData: comparison.dashboardData?.atr,
                backendAPI: (comparison.backendAPI?.data?.ticker?.atr) ?? 
                           (comparison.backendAPI?.data?.atr) ?? 
                           (comparison.backendAPI?.atr)
            };
            
            console.log('ATR Values Comparison:', atrValues);
            console.log('ATR Available in:', Object.entries(atrValues).filter(([k, v]) => v !== null && v !== undefined).map(([k]) => k));
            
            // Extract 52W from each source (handle both nested and direct structures)
            const week52Values = {
                directAPI: {
                    high: comparison.directAPI?.data?.week52_high ?? comparison.directAPI?.week52_high,
                    low: comparison.directAPI?.data?.week52_low ?? comparison.directAPI?.week52_low
                },
                entityDetails: {
                    high: comparison.entityDetails?.ticker?.week52_high ?? comparison.entityDetails?.week52_high,
                    low: comparison.entityDetails?.ticker?.week52_low ?? comparison.entityDetails?.week52_low
                },
                dashboardData: {
                    high: comparison.dashboardData?.week52_high,
                    low: comparison.dashboardData?.week52_low
                },
                backendAPI: {
                    high: (comparison.backendAPI?.data?.ticker?.week52_high) ?? 
                          (comparison.backendAPI?.data?.week52_high) ?? 
                          (comparison.backendAPI?.week52_high),
                    low: (comparison.backendAPI?.data?.ticker?.week52_low) ?? 
                         (comparison.backendAPI?.data?.week52_low) ?? 
                         (comparison.backendAPI?.week52_low)
                }
            };
            
            console.log('52W Range Comparison:', week52Values);
            console.log('52W High Available in:', Object.entries(week52Values).filter(([k, v]) => v.high !== null && v.high !== undefined).map(([k]) => k));
            console.log('52W Low Available in:', Object.entries(week52Values).filter(([k, v]) => v.low !== null && v.low !== undefined).map(([k]) => k));
            
            // Extract Volatility from each source (handle both nested and direct structures)
            const volatilityValues = {
                directAPI: comparison.directAPI?.data?.volatility ?? comparison.directAPI?.volatility,
                entityDetails: comparison.entityDetails?.ticker?.volatility ?? comparison.entityDetails?.volatility,
                dashboardData: comparison.dashboardData?.volatility,
                backendAPI: (comparison.backendAPI?.data?.ticker?.volatility) ?? 
                           (comparison.backendAPI?.data?.volatility) ?? 
                           (comparison.backendAPI?.volatility)
            };
            
            console.log('Volatility Values Comparison:', volatilityValues);
            console.log('Volatility Available in:', Object.entries(volatilityValues).filter(([k, v]) => v !== null && v !== undefined).map(([k]) => k));
            
        } catch (error) {
            console.error('❌ Error in comparison:', error);
        }
        console.groupEnd();
        
        console.groupEnd();
    };
    
    /**
     * בדיקת נתונים היסטוריים מהבסיס נתונים
     */
    window.debugHistoricalData = async function() {
        console.group('🔍 Historical Data Debug');
        
        const urlParams = new URLSearchParams(window.location.search);
        const tickerId = urlParams.get('tickerId') || urlParams.get('tickerSymbol');
        
        if (!tickerId) {
            console.error('❌ No tickerId found in URL');
            console.groupEnd();
            return;
        }
        
        console.log('Ticker ID:', tickerId);
        console.log('---');
        
        // Check if we can query historical data
        console.group('1. Historical Data Query');
        try {
            // Try to get historical data endpoint
            const response = await fetch(`/api/external-data/quotes/${tickerId}/history`);
            console.log('Response status:', response.status);
            
            if (response.status === 404 || response.status === 501) {
                console.warn('⚠️ Historical data endpoint not implemented (expected)');
            } else if (!response.ok) {
                console.error('❌ Historical data API call failed:', response.status, response.statusText);
            } else {
                const data = await response.json();
                console.log('✅ Historical Data Response:', data);
                
                if (data.status === 'success' && data.data) {
                    const history = Array.isArray(data.data) ? data.data : [];
                    console.log('Historical records count:', history.length);
                    
                    if (history.length > 0) {
                        console.log('First record:', history[0]);
                        console.log('Last record:', history[history.length - 1]);
                        
                        // Check date range
                        const dates = history.map(r => r.date || r.asof_utc || r.fetched_at).filter(Boolean);
                        if (dates.length > 0) {
                            console.log('Date range:', dates[0], 'to', dates[dates.length - 1]);
                        }
                        
                        // Check for high/low prices
                        const highs = history.map(r => r.high_price || r.high).filter(v => v !== null && v !== undefined);
                        const lows = history.map(r => r.low_price || r.low).filter(v => v !== null && v !== undefined);
                        
                        if (highs.length > 0) {
                            console.log('Max high price:', Math.max(...highs));
                            console.log('Min low price:', Math.min(...lows));
                        }
                    } else {
                        console.warn('⚠️ No historical data available');
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error querying historical data:', error);
        }
        console.groupEnd();
        
        console.groupEnd();
    };
    
    /**
     * בדיקה מלאה של כל השכבות
     */
    window.debugServerDataFull = async function() {
        console.clear();
        console.log('🚀 Starting Full Server Data Debug...');
        console.log('='.repeat(60));
        
        await window.debugServerData();
        console.log('\n');
        await window.debugHistoricalData();
        
        console.log('\n');
        console.log('='.repeat(60));
        console.log('✅ Full Debug Complete');
        console.log('\n📋 Next Steps:');
        console.log('1. Check if ATR, 52W, Volatility appear in any of the responses');
        console.log('2. If missing, check Backend logs for calculation errors');
        console.log('3. Verify MarketDataQuote table has historical data');
        console.log('4. Check EntityDetailsService._add_ticker_market_data() implementation');
    };
    
    // Auto-log when loaded
    if (document.readyState === 'complete') {
        console.log('✅ Ticker Dashboard Server Debug Tools loaded');
        console.log('Run debugServerDataFull() for complete server data check');
    } else {
        window.addEventListener('load', () => {
            console.log('✅ Ticker Dashboard Server Debug Tools loaded');
            console.log('Run debugServerDataFull() for complete server data check');
        });
    }
})();

