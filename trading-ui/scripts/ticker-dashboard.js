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
    let dataUpdateApproved = false; // Flag to prevent infinite update loop

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
     * Check which data is missing for ticker dashboard
     * @param {Object} tickerData - Ticker data object
     * @returns {Object} Object with missing data details
     */
    function checkMissingData(tickerData) {
        const missing = {
            hasLatestQuote: false,
            hasPrice: false,
            hasATR: false,
            hasWeek52: false,
            hasVolatility: false,
            hasMA20: false,
            hasMA150: false,
            missingFields: [],
            missingCalculations: []
        };

        // Check for latest quote (critical for all data)
        const hasLatestQuote = tickerData && (
            tickerData.current_price !== undefined || 
            tickerData.price !== undefined ||
            tickerData.daily_change !== undefined ||
            tickerData.volume !== undefined
        );
        missing.hasLatestQuote = hasLatestQuote;

        if (!hasLatestQuote) {
            missing.missingFields.push('נתוני מחיר נוכחי');
            missing.missingCalculations.push('מחיר, שינוי יומי, נפח מסחר');
        } else {
            missing.hasPrice = true;
        }

        // Check ATR
        if (!tickerData || tickerData.atr === null || tickerData.atr === undefined) {
            missing.hasATR = false;
            missing.missingCalculations.push('ATR (Average True Range)');
        } else {
            missing.hasATR = true;
        }

        // Check 52W
        if (!tickerData || 
            (tickerData.week52_high === null || tickerData.week52_high === undefined) ||
            (tickerData.week52_low === null || tickerData.week52_low === undefined)) {
            missing.hasWeek52 = false;
            missing.missingCalculations.push('52W High/Low (שיא ושפל 52 שבועות)');
        } else {
            missing.hasWeek52 = true;
        }

        // Check Volatility
        if (!tickerData || tickerData.volatility === null || tickerData.volatility === undefined) {
            missing.hasVolatility = false;
            missing.missingCalculations.push('תנודתיות (Volatility)');
        } else {
            missing.hasVolatility = true;
        }

        // Check MA 20
        if (!tickerData || tickerData.ma_20 === null || tickerData.ma_20 === undefined) {
            missing.hasMA20 = false;
            missing.missingCalculations.push('ממוצע נע 20 (MA 20)');
        } else {
            missing.hasMA20 = true;
        }

        // Check MA 150
        // Note: MA 150 needs 150 trading days, not calendar days
        // With weekends and holidays, 150 trading days ≈ 210 calendar days
        // So we check if MA 150 exists, but don't require it for critical data
        if (!tickerData || tickerData.ma_150 === null || tickerData.ma_150 === undefined) {
            missing.hasMA150 = false;
            // Only add to missingCalculations if we have price data (non-critical)
            if (missing.hasPrice) {
                missing.missingCalculations.push('ממוצע נע 150 (MA 150)');
            }
        } else {
            missing.hasMA150 = true;
        }

        // Determine if data is critical (missing latest quote)
        missing.isCritical = !hasLatestQuote;
        missing.hasAnyMissing = missing.missingFields.length > 0 || missing.missingCalculations.length > 0;

        return missing;
    }

    /**
     * Show confirmation dialog for missing data
     * @param {Object} missingData - Missing data details
     * @param {string} tickerSymbol - Ticker symbol
     * @returns {Promise<boolean>} True if user approved, false otherwise
     */
    async function showMissingDataConfirmation(missingData, tickerSymbol) {
        return new Promise((resolve) => {
            // Calculate totals for progress tracking
            const totalFields = 1; // Only critical field: latest quote (נתוני מחיר נוכחי)
            
            // Total calculations depend on whether we have price data
            // If we have price data: 5 calculations (ATR, 52W, Volatility, MA20, MA150)
            // If we don't have price data: 6 calculations (price data + the 5 above)
            // But since "price data" is included in missingCalculations when no quote,
            // we can calculate dynamically based on what's actually checked
            const totalCalculations = missingData.hasPrice ? 5 : 6; // 5 if we have price, 6 if we don't (includes price data calculation)
            
            const missingFieldsCount = missingData.missingFields.length;
            const missingCalculationsCount = missingData.missingCalculations.length;
            const availableFieldsCount = totalFields - missingFieldsCount;
            const availableCalculationsCount = totalCalculations - missingCalculationsCount;
            
            // Build detailed message with progress information
            let message = `חסרים נתונים לטיקר ${tickerSymbol}:\n\n`;
            
            // Add summary with counts
            message += `📊 סיכום:\n`;
            message += `  • שדות: ${availableFieldsCount}/${totalFields} זמינים`;
            if (missingFieldsCount > 0) {
                message += ` (${missingFieldsCount} חסרים)`;
            }
            message += `\n`;
            message += `  • חישובים: ${availableCalculationsCount}/${totalCalculations} זמינים`;
            if (missingCalculationsCount > 0) {
                message += ` (${missingCalculationsCount} חסרים)`;
            }
            message += `\n\n`;
            
            if (missingData.missingFields.length > 0) {
                message += `שדות חסרים (${missingFieldsCount}/${totalFields}):\n`;
                missingData.missingFields.forEach(field => {
                    message += `  • ${field}\n`;
                });
                message += `\n`;
            }

            if (missingData.missingCalculations.length > 0) {
                message += `חישובים חסרים (${missingCalculationsCount}/${totalCalculations}):\n`;
                missingData.missingCalculations.forEach(calc => {
                    message += `  • ${calc}\n`;
                });
                message += `\n`;
            }

            message += `האם ברצונך לטעון את הנתונים מהספק החיצוני (Yahoo Finance)?\n\n`;
            message += `זה עשוי לקחת מספר שניות.`;

            // Use showConfirmationDialog from warning-system.js if available
            if (typeof window.showConfirmationDialog === 'function') {
                // Ensure modal z-index is set correctly before showing
                // The modal will be shown via ModalManagerV2 which handles z-index
                window.showConfirmationDialog(
                    'נתונים חסרים',
                    message,
                    () => {
                        // After user confirms, close modal and resolve
                        const modal = document.getElementById('confirmationModal');
                        if (modal && window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
                            window.ModalManagerV2.hideModal('confirmationModal');
                        }
                        resolve(true);
                    },
                    () => {
                        resolve(false);
                    },
                    'warning'
                );
            } else {
                // Fallback to browser confirm
                if (window.showConfirmationDialog) {
                    window.showConfirmationDialog(
                        'אישור',
                        message,
                        () => resolve(true),
                        () => resolve(false),
                        'info'
                    );
                } else {
                    const confirmed = confirm(message);
                    resolve(confirmed);
                }
            }
        });
    }

    /**
     * Fetch data from external provider with progress tracking
     * @param {number} tickerId - Ticker ID
     * @param {string} tickerSymbol - Ticker symbol
     * @returns {Promise<Object>} Updated ticker data
     */
    async function fetchDataFromProvider(tickerId, tickerSymbol) {
        const overlayId = `tickerDataFetch-${tickerId}`;
        
        try {
            if (window.Logger) {
                window.Logger.info('🔄 Starting data fetch from external provider', { tickerId, tickerSymbol, page: 'ticker-dashboard' });
            }

            // Initialize progress overlay
            if (window.unifiedProgressManager) {
                window.unifiedProgressManager.createOverlay(overlayId, {
                    title: `טעינת נתונים עבור ${tickerSymbol}`,
                    totalSteps: 3,
                    stepLabels: [
                        'טוען נתונים מהספק החיצוני',
                        'מעבד ומאמת נתונים',
                        'מסיים טעינה'
                    ],
                    stepDescriptions: [
                        'מתחבר לספק הנתונים החיצוני, טוען מחיר נוכחי ונתונים היסטוריים...',
                        'בודק שכל הנתונים קיימים...',
                        'מסיים את התהליך...'
                    ]
                });
            }

            // Step 1-2: Use ExternalDataService to refresh ticker data (quote + historical + indicators)
            if (window.Logger) {
                window.Logger.info('📊 Step 1-2/4: Refreshing ticker data using ExternalDataService...', { tickerId, page: 'ticker-dashboard' });
            }
            if (window.unifiedProgressManager) {
                window.unifiedProgressManager.showProgress(
                    overlayId,
                    1,
                    `טוען נתונים עבור ${tickerSymbol}...`,
                    'מתחבר לספק הנתונים החיצוני...'
                );
            }

            // Use ExternalDataService.refreshTickerData() - unified system
            // This handles: quote refresh, historical data (150 days), and technical indicators
            let refreshResult = null;
            if (window.ExternalDataService && typeof window.ExternalDataService.refreshTickerData === 'function') {
                try {
                    refreshResult = await window.ExternalDataService.refreshTickerData(tickerId, {
                        forceRefresh: true,
                        includeHistorical: true,
                        daysBack: 150
                    });
                    if (window.Logger) {
                        window.Logger.info('✅ Ticker data refreshed successfully via ExternalDataService', { 
                            tickerId, 
                            hasPrice: !!refreshResult?.price,
                            hasHistorical: !!refreshResult?.historical_quotes_count,
                            page: 'ticker-dashboard' 
                        });
                    }
                } catch (refreshError) {
                    if (window.Logger) {
                        window.Logger.error('❌ Error refreshing ticker data via ExternalDataService', { 
                            error: refreshError.message, 
                            tickerId,
                            page: 'ticker-dashboard' 
                        });
                    }
                    throw refreshError; // Re-throw to be handled by outer try-catch
                }
            } else {
                throw new Error('ExternalDataService.refreshTickerData is not available');
            }

            // Step 2: Wait for backend to process and verify all data is available
            if (window.Logger) {
                window.Logger.info('📊 Step 2/3: Waiting for data processing and verification...', { tickerId, page: 'ticker-dashboard' });
            }
            if (window.unifiedProgressManager) {
                window.unifiedProgressManager.showProgress(
                    overlayId,
                    2,
                    `מעבד ומאמת נתונים עבור ${tickerSymbol}...`,
                    'בודק שכל הנתונים קיימים...'
                );
            }

            // Wait for backend to process - longer wait for historical data (150 days)
            // Check data availability with retries
            // If user already approved, reduce retries to avoid infinite loops
            let updatedData = null;
            let retryCount = 0;
            const maxRetries = dataUpdateApproved ? 3 : 10; // Fewer retries if already approved
            const retryDelay = 5000; // 5 seconds between retries
            const initialWait = 10000; // Wait 10 seconds before first check (allow backend to process)
            
            // Initial wait to allow backend to process and save data
            if (window.Logger) {
                window.Logger.info('⏳ Waiting for backend to process data before checking...', { tickerId, waitSeconds: initialWait / 1000, page: 'ticker-dashboard' });
            }
            await new Promise(resolve => setTimeout(resolve, initialWait));
            
            while (retryCount < maxRetries) {
                // Wait before checking (except first iteration which already waited)
                if (retryCount > 0) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
                
                if (window.unifiedProgressManager) {
                    const progressPercent = Math.min(75, 50 + (retryCount / maxRetries) * 25); // 50-75% during verification
                    window.unifiedProgressManager.updateProgress(
                        overlayId,
                        progressPercent,
                        `בודק נתונים עבור ${tickerSymbol}... (${retryCount + 1}/${maxRetries})`
                    );
                }

                // Invalidate cache before reloading
                if (window.UnifiedCacheManager) {
                    await window.UnifiedCacheManager.invalidate(`ticker-dashboard-${tickerId}`, 'memory');
                    await window.UnifiedCacheManager.invalidate(`entity-details-ticker-${tickerId}`, 'memory');
                    await window.UnifiedCacheManager.invalidate(`ticker-user-activity-${tickerId}`, 'memory');
                    await window.UnifiedCacheManager.invalidate(`ticker-conditions-${tickerId}`, 'memory');
                }

                // Reload data with force refresh
                if (window.TickerDashboardData) {
                    const previousData = updatedData;
                    updatedData = await window.TickerDashboardData.loadTickerDashboardData(tickerId, { forceRefresh: true });
                    
                    // Check if all required data is now available
                    const missingData = checkMissingData(updatedData);
                    
                    // Check if data has improved (more calculations available than before)
                    const previousMissingData = previousData ? checkMissingData(previousData) : null;
                    const hasImproved = previousMissingData ? (
                        (missingData.missingCalculations.length < previousMissingData.missingCalculations.length) ||
                        ((!previousData?.atr || previousData?.atr === null) && updatedData?.atr) ||
                        ((!previousData?.volatility || previousData?.volatility === null) && updatedData?.volatility) ||
                        ((!previousData?.ma_20 || previousData?.ma_20 === null) && updatedData?.ma_20)
                    ) : true; // First iteration - assume improvement
                    
                    if (window.Logger) {
                        window.Logger.info(`📊 Data check attempt ${retryCount + 1}/${maxRetries}`, { 
                            tickerId, 
                            hasData: !!updatedData,
                            hasPrice: !!updatedData?.current_price || !!updatedData?.price,
                            hasATR: !!updatedData?.atr,
                            hasWeek52: !!updatedData?.week52_high && !!updatedData?.week52_low,
                            hasVolatility: !!updatedData?.volatility,
                            hasMA20: !!updatedData?.ma_20,
                            hasMA150: !!updatedData?.ma_150,
                            missingCalculations: missingData.missingCalculations,
                            hasAnyMissing: missingData.hasAnyMissing,
                            hasImproved: hasImproved,
                            page: 'ticker-dashboard' 
                        });
                    }
                    
                    // If all critical data is available, break
                    if (!missingData.hasAnyMissing || missingData.missingCalculations.length === 0) {
                        if (window.Logger) {
                            window.Logger.info('✅ All required data is now available', { tickerId, page: 'ticker-dashboard' });
                        }
                        break;
                    }
                    
                    // If data hasn't improved after 3 attempts, stop trying
                    // This means the backend either can't calculate the data or it's not available
                    if (retryCount >= 3 && !hasImproved && previousData) {
                        if (window.Logger) {
                            window.Logger.info('ℹ️ Data not improving after multiple attempts, stopping retries', { 
                                tickerId, 
                                retryCount,
                                missingCalculations: missingData.missingCalculations,
                                page: 'ticker-dashboard' 
                            });
                        }
                        break;
                    }
                    
                    // If user already approved and we've tried a few times, stop early
                    // This prevents infinite loops when data can't be fetched
                    if (dataUpdateApproved && retryCount >= 2) {
                        if (window.Logger) {
                            window.Logger.info('ℹ️ User already approved update, stopping retries early to prevent infinite loop', { 
                                tickerId, 
                                retryCount,
                                missingCalculations: missingData.missingCalculations,
                                page: 'ticker-dashboard' 
                            });
                        }
                        break;
                    }
                    
                    // If we still have missing calculations, continue waiting
                    retryCount++;
                } else {
                    throw new Error('TickerDashboardData service not available');
                }
            }

            // Step 3: Final verification and return
            if (window.Logger) {
                window.Logger.info('📊 Step 3/3: Final data verification...', { tickerId, page: 'ticker-dashboard' });
            }
            if (window.unifiedProgressManager) {
                window.unifiedProgressManager.showProgress(
                    overlayId,
                    3,
                    `מסיים טעינת נתונים עבור ${tickerSymbol}...`,
                    'מסיים את התהליך...'
                );
            }

            // Final check - if still missing data, log warning but continue
            if (updatedData) {
                const finalMissingData = checkMissingData(updatedData);
                if (finalMissingData.hasAnyMissing && finalMissingData.missingCalculations.length > 0) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Some calculations still missing after data fetch', { 
                            tickerId, 
                            tickerSymbol,
                            missingCalculations: finalMissingData.missingCalculations,
                            page: 'ticker-dashboard' 
                        });
                    }
                }
            }

            // Hide progress overlay
            if (window.unifiedProgressManager) {
                // Small delay to show completion
                await new Promise(resolve => setTimeout(resolve, 500));
                window.unifiedProgressManager.hideProgress(overlayId);
            }

            if (window.Logger) {
                window.Logger.info('✅ Data fetch completed', { 
                    tickerId, 
                    hasData: !!updatedData,
                    hasPrice: !!updatedData?.current_price || !!updatedData?.price,
                    hasATR: !!updatedData?.atr,
                    hasWeek52: !!updatedData?.week52_high && !!updatedData?.week52_low,
                    hasVolatility: !!updatedData?.volatility,
                    hasMA20: !!updatedData?.ma_20,
                    hasMA150: !!updatedData?.ma_150,
                    retriesUsed: retryCount + 1,
                    page: 'ticker-dashboard' 
                });
            }

            // Show success notification
            if (window.NotificationSystem) {
                if (updatedData) {
                    const finalMissingData = checkMissingData(updatedData);
                    if (finalMissingData.hasAnyMissing && finalMissingData.missingCalculations.length > 0) {
                        window.NotificationSystem.showWarning(
                            'טעינת נתונים הושלמה חלקית',
                            `הנתונים עבור ${tickerSymbol} נטענו, אך חלק מהחישובים עדיין חסרים. המערכת תנסה להשלים אותם בהמשך.`
                        );
                    } else {
                        window.NotificationSystem.showSuccess(
                            'טעינת נתונים הושלמה',
                            `כל הנתונים עבור ${tickerSymbol} נטענו בהצלחה`
                        );
                    }
                } else {
                    window.NotificationSystem.showError(
                        'שגיאה בטעינת נתונים',
                        `לא ניתן לטעון נתונים עבור ${tickerSymbol}`
                    );
                }
            }

            return updatedData;

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error fetching data from provider', { 
                    tickerId, 
                    tickerSymbol,
                    error: error.message, 
                    stack: error.stack,
                    page: 'ticker-dashboard' 
                });
            }

            // Hide progress overlay on error
            if (window.unifiedProgressManager) {
                window.unifiedProgressManager.hideProgress(overlayId);
            }

            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'שגיאה בטעינת נתונים',
                    `שגיאה בטעינת נתונים עבור ${tickerSymbol}: ${error.message}`
                );
            }

            throw error;
        }
    }

    /**
     * Validate data availability before rendering
     * @param {Object} tickerData - Ticker data to validate
     * @param {string} tickerSymbol - Ticker symbol
     * @returns {Promise<boolean>} True if data is available or user approved fetch, false otherwise
     */
    async function validateDataBeforeRender(tickerData, tickerSymbol) {
        // Check for missing data
        const missingData = checkMissingData(tickerData);

        // If no missing data, proceed
        if (!missingData.hasAnyMissing) {
            if (window.Logger) {
                window.Logger.info('✅ All required data available', { tickerId, tickerSymbol, page: 'ticker-dashboard' });
            }
            return true;
        }

        // If critical data is missing (no latest quote), always ask
        if (missingData.isCritical) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Critical data missing (no latest quote)', { 
                    tickerId, 
                    tickerSymbol,
                    missingFields: missingData.missingFields,
                    page: 'ticker-dashboard' 
                });
            }

            // Show confirmation
            const approved = await showMissingDataConfirmation(missingData, tickerSymbol);
            
            if (!approved) {
                if (window.Logger) {
                    window.Logger.info('ℹ️ User declined to fetch missing data', { tickerId, tickerSymbol, page: 'ticker-dashboard' });
                }
                return false;
            }

            // Fetch data from provider
            try {
                const updatedData = await fetchDataFromProvider(tickerId, tickerSymbol);
                if (updatedData) {
                    tickerData = updatedData;
                    return true;
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ Failed to fetch data from provider', { error: error.message, page: 'ticker-dashboard' });
                }
                return false;
            }
        }

        // If only non-critical data is missing (calculations), ask but allow proceeding
        if (missingData.missingCalculations.length > 0) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Some calculations missing', { 
                    tickerId, 
                    tickerSymbol,
                    missingCalculations: missingData.missingCalculations,
                    page: 'ticker-dashboard' 
                });
            }

            // Only show confirmation if user hasn't already approved an update
            // This prevents infinite update loops
            if (!dataUpdateApproved) {
                // Show confirmation
                const approved = await showMissingDataConfirmation(missingData, tickerSymbol);
                
                if (approved) {
                    dataUpdateApproved = true; // Mark as approved to prevent re-prompting
                    
                    // Fetch data from provider
                    try {
                        const updatedData = await fetchDataFromProvider(tickerId, tickerSymbol);
                        if (updatedData) {
                            tickerData = updatedData;
                            
                            // Re-check if data is still missing after update
                            const updatedMissingData = checkMissingData(updatedData);
                            if (updatedMissingData.missingCalculations.length > 0) {
                                // Data still missing after update - log but proceed
                                if (window.Logger) {
                                    window.Logger.warn('⚠️ Some calculations still missing after update', { 
                                        tickerId, 
                                        tickerSymbol,
                                        missingCalculations: updatedMissingData.missingCalculations,
                                        page: 'ticker-dashboard' 
                                    });
                                }
                            }
                            
                            return true;
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('❌ Failed to fetch data from provider', { error: error.message, page: 'ticker-dashboard' });
                        }
                        // Continue anyway with existing data
                    }
                }
            } else {
                // User already approved, but data is still missing - log and proceed
                if (window.Logger) {
                    window.Logger.info('ℹ️ Data update already attempted, proceeding with available data', { 
                        tickerId, 
                        tickerSymbol,
                        missingCalculations: missingData.missingCalculations,
                        page: 'ticker-dashboard' 
                    });
                }
            }
        }

        // Proceed with existing data (some calculations may be missing)
        return true;
    }

    /**
     * Get ticker ID from URL parameters
     * @returns {Promise<number|null>} Ticker ID
     */
    async function getTickerIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('tickerId');
        const symbol = urlParams.get('tickerSymbol');
        
        if (window.Logger) {
            window.Logger.debug('🔍 Parsing ticker ID from URL', { 
                fullUrl: window.location.href,
                searchParams: window.location.search,
                tickerId: id,
                tickerSymbol: symbol,
                allParams: Object.fromEntries(urlParams.entries()),
                page: 'ticker-dashboard' 
            });
        }
        
        if (id) {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId) || parsedId <= 0) {
                if (window.Logger) {
                    window.Logger.error('❌ Invalid ticker ID in URL', { id, parsedId, page: 'ticker-dashboard' });
                }
                return null;
            }
            if (window.Logger) {
                window.Logger.debug('✅ Parsed ticker ID from URL', { id, parsedId, page: 'ticker-dashboard' });
            }
            return parsedId;
        }
        
        // If symbol provided, resolve to ID
        if (symbol) {
            if (window.Logger) {
                window.Logger.debug('🔍 Resolving ticker symbol to ID', { symbol, page: 'ticker-dashboard' });
            }
            const resolvedId = await resolveTickerSymbolToId(symbol);
            if (resolvedId) {
                if (window.Logger) {
                    window.Logger.debug('✅ Resolved ticker symbol to ID', { symbol, resolvedId, page: 'ticker-dashboard' });
                }
                return resolvedId;
            } else {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Ticker symbol provided but could not resolve to ID', { symbol, page: 'ticker-dashboard' });
                }
            }
        }
        
        if (window.Logger) {
            window.Logger.warn('⚠️ No ticker ID or symbol found in URL', { 
                url: window.location.href,
                search: window.location.search,
                page: 'ticker-dashboard' 
            });
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
            
            // Reset data update approval flag for new initialization
            dataUpdateApproved = false;
            
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
                if (window.Logger) {
                    window.Logger.error('❌ No ticker ID found in URL', { 
                        urlParams: Object.fromEntries(urlParams.entries()),
                        id,
                        symbol,
                        fullUrl: window.location.href,
                        page: 'ticker-dashboard' 
                    });
                }
                if (symbol) {
                    throw new Error(`לא ניתן למצוא טיקר עם סימול: ${symbol}`);
                } else {
                    throw new Error('מזהה טיקר לא סופק ב-URL. נדרש: ?tickerId=123 או ?tickerSymbol=SYMBOL');
                }
            }
            
            // Validate ticker ID is a valid number
            if (isNaN(tickerId) || tickerId <= 0) {
                const errorMsg = `מזהה טיקר לא תקין: ${tickerId}`;
                if (window.Logger) {
                    window.Logger.error('❌ Invalid ticker ID', { tickerId, page: 'ticker-dashboard' });
                }
                throw new Error(errorMsg);
            }
            
            // Load ticker data
            if (window.TickerDashboardData) {
                if (window.Logger) {
                    window.Logger.info('📊 Loading ticker dashboard data...', { tickerId, page: 'ticker-dashboard' });
                }
                try {
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
                            ma_20: tickerData?.ma_20,
                            ma_150: tickerData?.ma_150,
                            allKeys: tickerData ? Object.keys(tickerData).filter(k => k.includes('atr') || k.includes('week') || k.includes('volatility') || k.includes('52') || k.includes('ma')) : [],
                            page: 'ticker-dashboard' 
                        });
                    }
                } catch (error) {
                    // Handle 404 errors (ticker not found) gracefully
                    if (error.status === 404 || error?.message?.includes('לא נמצא')) {
                        const errorMessage = error.userMessage || error.message || `טיקר עם מזהה ${tickerId} לא נמצא במערכת`;
                        if (window.Logger) {
                            window.Logger.error('❌ Ticker not found', { tickerId, error: errorMessage, page: 'ticker-dashboard' });
                        }
                        if (window.NotificationSystem) {
                            window.NotificationSystem.showError('טיקר לא נמצא', errorMessage);
                        }
                        // Show error in the dashboard container
                        const dashboardContainer = document.getElementById('ticker-dashboard-top');
                        if (dashboardContainer) {
                            dashboardContainer.innerHTML = `
                                <div class="alert alert-danger" role="alert">
                                    <h4 class="alert-heading">טיקר לא נמצא</h4>
                                    <p>${errorMessage}</p>
                                    <hr>
                                    <p class="mb-0">אנא ודא שהמזהה נכון או חזור לדף הקודם.</p>
                                </div>
                            `;
                        }
                        if (typeof window.hideLoadingState === 'function') {
                            window.hideLoadingState('ticker-dashboard-top');
                        }
                        return; // Stop initialization
                    }
                    // Re-throw other errors
                    throw error;
                }
            } else {
                throw new Error('TickerDashboardData service not available');
            }
            
            if (!tickerData) {
                throw new Error('Failed to load ticker data - tickerData is null or undefined');
            }
            
            // Validate data availability before rendering
            const tickerSymbol = tickerData.symbol || tickerData.ticker_symbol || `טיקר #${tickerId}`;
            const canProceed = await validateDataBeforeRender(tickerData, tickerSymbol);
            
            if (!canProceed) {
                // User declined to fetch critical data - show error and stop
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError(
                        'נתונים חסרים',
                        `לא ניתן להציג את הדשבורד ללא נתוני מחיר נוכחי עבור ${tickerSymbol}`
                    );
                }
                if (typeof window.hideLoadingState === 'function') {
                    window.hideLoadingState('ticker-dashboard-top');
                }
                return; // Stop initialization
            }
            
            // Update tickerData if it was refreshed
            if (tickerData && (tickerData.current_price !== undefined || tickerData.price !== undefined)) {
                // Data is available, proceed with rendering
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
            
            // Load and populate ticker selector
            await loadTickerSelector();
            
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
            const ma20 = tickerData.ma_20 || null;
            const ma150 = tickerData.ma_150 || null;
            
            // Debug: Log MA values
            if (window.Logger) {
                window.Logger.debug('📊 MA values from tickerData', {
                    ma20,
                    ma150,
                    ma20Type: typeof ma20,
                    ma150Type: typeof ma150,
                    ma20IsNull: ma20 === null,
                    ma150IsNull: ma150 === null,
                    ma20IsUndefined: ma20 === undefined,
                    ma150IsUndefined: ma150 === undefined,
                    page: 'ticker-dashboard'
                });
            }
            // Get currency symbol using central FieldRendererService
            const rawCurrencySymbol = tickerData.currency_symbol || (tickerData.currency && tickerData.currency.symbol) || '$';
            const currencySymbol = window.FieldRendererService && window.FieldRendererService._normalizeCurrencySymbol
                ? window.FieldRendererService._normalizeCurrencySymbol(rawCurrencySymbol)
                : rawCurrencySymbol;
            
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
            // ATR on first line with full HTML rendering (traffic light, badge, colors)
            // Volatility on second line with label
            let atrVolatilityHtml = 'N/A';
            if (atrHtmlString !== 'N/A' || volatilityHtml !== 'N/A') {
                const parts = [];
                // ATR on first line - keep full HTML rendering (with traffic light and badge)
                if (atrHtmlString !== 'N/A') {
                    parts.push(atrHtmlString);
                } else {
                    parts.push('N/A');
                }
                // Volatility on second line with prominent label
                if (volatilityHtml !== 'N/A') {
                    parts.push(`<span class="fw-bold" style="font-size: 0.9rem;">תנודתיות:</span> ${volatilityHtml}`);
                } else {
                    parts.push(`<span class="fw-bold" style="font-size: 0.9rem;">תנודתיות:</span> N/A`);
                }
                atrVolatilityHtml = parts.join('<br>');
            }
            
            // Format Moving Averages card (MA 20 and MA 150)
            let maHtml = 'N/A';
            if (price && price > 0) {
                const maParts = [];
                
                // MA 20
                if (ma20 !== null && ma20 !== undefined && !isNaN(ma20) && ma20 > 0) {
                    const diffPercent20 = ((price - ma20) / ma20) * 100;
                    const ma20Color = diffPercent20 >= 0 ? 'text-success' : 'text-danger';
                    const ma20Sign = diffPercent20 >= 0 ? '+' : '';
                    maParts.push(`<small class="text-muted">MA 20:</small> <span class="${ma20Color}" dir="ltr">${ma20Sign}${diffPercent20.toFixed(2)}%</span>`);
                } else {
                    maParts.push(`<small class="text-muted">MA 20:</small> N/A`);
                }
                
                // MA 150
                if (ma150 !== null && ma150 !== undefined && !isNaN(ma150) && ma150 > 0) {
                    const diffPercent150 = ((price - ma150) / ma150) * 100;
                    const ma150Color = diffPercent150 >= 0 ? 'text-success' : 'text-danger';
                    const ma150Sign = diffPercent150 >= 0 ? '+' : '';
                    maParts.push(`<small class="text-muted">MA 150:</small> <span class="${ma150Color}" dir="ltr">${ma150Sign}${diffPercent150.toFixed(2)}%</span>`);
                } else {
                    maParts.push(`<small class="text-muted">MA 150:</small> N/A`);
                }
                
                if (maParts.length > 0) {
                    maHtml = maParts.join('<br>');
                }
            } else {
                // If no price, show N/A for both
                maHtml = `<small class="text-muted">MA 20:</small> N/A<br><small class="text-muted">MA 150:</small> N/A`;
            }
            
            const kpiCards = [
                { label: 'מחיר', value: priceHtml, dir: '', helpKey: null },
                { label: 'ATR', value: atrVolatilityHtml, dir: '', helpKey: 'atr' },
                { label: '52W גבוהה', value: week52HighHtml, dir: 'ltr', helpKey: 'week52_range' },
                { label: '52W נמוכה', value: week52LowHtml, dir: 'ltr', helpKey: 'week52_range' },
                { label: 'נפח יומי', value: `${formattedVolume}<br><small class="text-muted">${formattedVolumeMonetary}</small>`, dir: 'ltr', helpKey: 'volume' },
                { label: 'יחס לממוצע', value: maHtml, dir: '', helpKey: null }
            ];
            
            // Use for...of loop instead of forEach to support await
            for (const kpi of kpiCards) {
                const colDiv = document.createElement('div');
                // Responsive classes: 
                // - Large screens (>1400px): 6 per row (col-md-2 = 16.67%)
                // - Medium screens (1200-1399px): 5 per row (20%)
                // - Small-medium (1025-1199px): 4 per row (25%)
                // - Tablet (768-1024px): 3 per row (col-sm-4 = 33.33%)
                // - Mobile (<768px): 2 per row (col-6 = 50%)
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
                // Note: container_id is NOT part of TradingView widget config
                // It's only used internally by TradingViewWidgetsFactory
                // Do NOT include it here - it causes "cannot_get_metainfo" errors
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
                ].filter(Boolean), // Remove any null/undefined studies
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
     * Load and populate ticker selector dropdown
     */
    async function loadTickerSelector() {
        try {
            const selector = document.getElementById('tickerSelector');
            if (!selector) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Ticker selector not found in DOM', { page: 'ticker-dashboard' });
                }
                return;
            }
            
            // Show loading state
            selector.innerHTML = '<option value="">טוען טיקרים...</option>';
            selector.disabled = true;
            
            // Load user tickers
            let userTickers = [];
            try {
                // Try tickersData service first
                if (window.tickersData && typeof window.tickersData.getUserTickers === 'function') {
                    userTickers = await window.tickersData.getUserTickers({ force: false });
                } 
                // Fallback: try getAllTickers if getUserTickers not available
                else if (window.tickersData && typeof window.tickersData.getAllTickers === 'function') {
                    const allTickers = await window.tickersData.getAllTickers({ force: false });
                    // Filter to active tickers only (open or closed status)
                    userTickers = allTickers.filter(t => t.status === 'open' || t.status === 'closed');
                }
                // Fallback: try to fetch from API directly
                else {
                    const response = await fetch('/api/tickers/my');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'success' && data.data) {
                            userTickers = data.data;
                        } else if (Array.isArray(data)) {
                            userTickers = data;
                        }
                    } else if (response.status === 404) {
                        // If /api/tickers/my doesn't exist, try /api/tickers/ and filter
                        const allResponse = await fetch('/api/tickers/');
                        if (allResponse.ok) {
                            const allData = await allResponse.json();
                            const allTickers = allData.data || allData || [];
                            userTickers = allTickers.filter(t => t.status === 'open' || t.status === 'closed');
                        }
                    }
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Error loading user tickers, will show empty list', { error, page: 'ticker-dashboard' });
                }
            }
            
            // Populate selector
            selector.innerHTML = '';
            if (userTickers.length === 0) {
                selector.innerHTML = '<option value="">אין טיקרים זמינים</option>';
                selector.disabled = true;
                return;
            }
            
            // Add options
            userTickers.forEach(ticker => {
                const option = document.createElement('option');
                option.value = ticker.id;
                const displayText = ticker.name ? `${ticker.symbol} - ${ticker.name}` : ticker.symbol;
                option.textContent = displayText;
                if (ticker.id === tickerId) {
                    option.selected = true;
                }
                selector.appendChild(option);
            });
            
            selector.disabled = false;
            
            // Add change event listener (remove old one first to avoid duplicates)
            selector.removeEventListener('change', handleTickerChange);
            selector.addEventListener('change', handleTickerChange);
            
            if (window.Logger) {
                window.Logger.info('✅ Ticker selector loaded', { 
                    tickerCount: userTickers.length, 
                    currentTickerId: tickerId,
                    page: 'ticker-dashboard' 
                });
            }
        } catch (error) {
            const selector = document.getElementById('tickerSelector');
            if (selector) {
                selector.innerHTML = '<option value="">שגיאה בטעינת טיקרים</option>';
                selector.disabled = true;
            }
            if (window.Logger) {
                window.Logger.error('❌ Error loading ticker selector', { error, page: 'ticker-dashboard' });
            }
        }
    }
    
    /**
     * Handle ticker selection change
     */
    async function handleTickerChange(event) {
        const newTickerId = parseInt(event.target.value, 10);
        if (!newTickerId || newTickerId === tickerId) {
            return; // No change or invalid selection
        }
        
        try {
            if (window.Logger) {
                window.Logger.info('🔄 Changing ticker', { 
                    oldTickerId: tickerId, 
                    newTickerId,
                    page: 'ticker-dashboard' 
                });
            }
            
            // Show loading state
            if (typeof window.showLoadingState === 'function') {
                window.showLoadingState('ticker-dashboard-top');
            }
            
            // Update tickerId
            tickerId = newTickerId;
            
            // Update URL without page reload
            const url = new URL(window.location.href);
            url.searchParams.set('tickerId', tickerId.toString());
            window.history.replaceState({ tickerId }, '', url.toString());
            
            // Invalidate cache for old ticker
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.invalidate(`ticker-dashboard-${tickerId}`, 'memory');
                await window.UnifiedCacheManager.invalidate(`ticker-user-activity-${tickerId}`, 'memory');
            }
            
            // Load new ticker data
            if (window.TickerDashboardData) {
                tickerData = await window.TickerDashboardData.loadTickerDashboardData(tickerId, { forceRefresh: true });
            } else {
                throw new Error('TickerDashboardData service not available');
            }
            
            // Re-render all components
            updatePageTitle();
            await renderKPICards();
            await initPriceChart();
            await renderUserActivity();
            await renderConditions();
            
            // Show success notification
            if (window.NotificationSystem) {
                const tickerSymbol = tickerData?.symbol || `טיקר #${tickerId}`;
                window.NotificationSystem.showSuccess('טיקר עודכן', `הדשבורד עודכן לטיקר ${tickerSymbol}`);
            }
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-top');
            }
            
            if (window.Logger) {
                window.Logger.info('✅ Ticker changed successfully', { 
                    tickerId, 
                    symbol: tickerData?.symbol,
                    page: 'ticker-dashboard' 
                });
            }
        } catch (error) {
            // Reset selector to previous value
            const selector = document.getElementById('tickerSelector');
            if (selector) {
                selector.value = tickerId ? tickerId.toString() : '';
            }
            
            if (typeof window.hideLoadingState === 'function') {
                window.hideLoadingState('ticker-dashboard-top');
            }
            
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה בעדכון טיקר: ${error.message}`);
            }
            
            if (window.Logger) {
                window.Logger.error('❌ Error changing ticker', { error, page: 'ticker-dashboard' });
            }
        }
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
        changeTicker: handleTickerChange,
        loadTickerSelector,
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
    
    // Fallback: If UnifiedAppInitializer is not available, initialize directly
    // This ensures the dashboard works even if the unified init system fails to load
    const initializeDashboardFallback = async () => {
        // Wait a bit for all scripts to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                // Wait for critical dependencies
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if already initialized by UnifiedAppInitializer
                if (window.globalInitializationState?.unifiedAppInitialized) {
                    if (window.Logger) {
                        window.Logger.debug('Dashboard already initialized by UnifiedAppInitializer', { page: 'ticker-dashboard' });
                    }
                    return;
                }
                
                // Check if UnifiedAppInitializer exists and is initializing
                if (window.unifiedAppInit && window.unifiedAppInit.initializationInProgress) {
                    if (window.Logger) {
                        window.Logger.debug('Waiting for UnifiedAppInitializer to complete', { page: 'ticker-dashboard' });
                    }
                    // Wait up to 5 seconds for UnifiedAppInitializer
                    let waitCount = 0;
                    while (waitCount < 50 && window.unifiedAppInit.initializationInProgress) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        waitCount++;
                    }
                    
                    // If UnifiedAppInitializer completed, don't initialize again
                    if (window.globalInitializationState?.unifiedAppInitialized) {
                        if (window.Logger) {
                            window.Logger.debug('UnifiedAppInitializer completed, skipping fallback', { page: 'ticker-dashboard' });
                        }
                        return;
                    }
                }
                
                // Fallback: Initialize directly if UnifiedAppInitializer is not available or failed
                if (!window.unifiedAppInit || !window.unifiedAppInit.initialized) {
                    if (window.Logger) {
                        window.Logger.info('⚠️ UnifiedAppInitializer not available, using fallback initialization', { page: 'ticker-dashboard' });
                    }
                    
                    // Check if tickerDashboard.init is available
                    if (window.tickerDashboard && typeof window.tickerDashboard.init === 'function') {
                        try {
                            await window.tickerDashboard.init();
                            if (window.Logger) {
                                window.Logger.info('✅ TickerDashboard initialized via fallback', { page: 'ticker-dashboard' });
                            }
                        } catch (error) {
                            if (window.Logger) {
                                window.Logger.error('❌ Error initializing TickerDashboard via fallback', { error: error?.message || error, page: 'ticker-dashboard' });
                            }
                        }
                    } else {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ window.tickerDashboard.init is not available', { page: 'ticker-dashboard' });
                        }
                    }
                }
            });
        } else {
            // DOM already loaded, initialize immediately
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if already initialized
            if (window.globalInitializationState?.unifiedAppInitialized) {
                if (window.Logger) {
                    window.Logger.debug('Dashboard already initialized by UnifiedAppInitializer', { page: 'ticker-dashboard' });
                }
                return;
            }
            
            // Check if UnifiedAppInitializer is initializing
            if (window.unifiedAppInit && window.unifiedAppInit.initializationInProgress) {
                if (window.Logger) {
                    window.Logger.debug('Waiting for UnifiedAppInitializer to complete', { page: 'ticker-dashboard' });
                }
                let waitCount = 0;
                while (waitCount < 50 && window.unifiedAppInit.initializationInProgress) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    waitCount++;
                }
                
                if (window.globalInitializationState?.unifiedAppInitialized) {
                    if (window.Logger) {
                        window.Logger.debug('UnifiedAppInitializer completed, skipping fallback', { page: 'ticker-dashboard' });
                    }
                    return;
                }
            }
            
            // Fallback: Initialize directly
            if (!window.unifiedAppInit || !window.unifiedAppInit.initialized) {
                if (window.Logger) {
                    window.Logger.info('⚠️ UnifiedAppInitializer not available, using fallback initialization', { page: 'ticker-dashboard' });
                }
                
                if (window.tickerDashboard && typeof window.tickerDashboard.init === 'function') {
                    try {
                        await window.tickerDashboard.init();
                        if (window.Logger) {
                            window.Logger.info('✅ TickerDashboard initialized via fallback', { page: 'ticker-dashboard' });
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('❌ Error initializing TickerDashboard via fallback', { error: error?.message || error, page: 'ticker-dashboard' });
                        }
                    }
                }
            }
        }
    };
    
    // Start fallback initialization
    initializeDashboardFallback();

    if (window.Logger) {
        window.Logger.info('✅ TickerDashboard loaded', { page: 'ticker-dashboard' });
    }
})();

