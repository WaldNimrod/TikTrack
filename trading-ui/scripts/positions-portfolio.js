/**
 * Positions & Portfolio System - TikTrack
 * ========================================
 * 
 * מערכת הצגת פוזיציות ופורטפוליו
 * 
 * תכונות:
 * - טבלת פוזיציות לפי חשבון
 * - טבלת פורטפוליו מלא עם פילטרים
 * - וויזארד סיכום (מינימאלי ומלא)
 * - אינטגרציה מלאה עם UnifiedCacheManager
 * - שימוש במערכות כלליות (FieldRendererService, InfoSummarySystem, וכו')
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Date: January 2025
 * 
 * Documentation: documentation/04-FEATURES/CORE/POSITIONS_PORTFOLIO_SYSTEM.md
 */

/* ===== POSITIONS & PORTFOLIO SYSTEM ===== */
window.Logger.info('📁 positions-portfolio.js נטען', { page: "trading_accounts" });

// Global state
window.positionsPortfolioState = {
    selectedAccountId: null,
    positionsData: null,
    portfolioData: null,
    summaryData: null,
    isLoading: false,
    summarySize: 'minimal' // 'minimal' or 'full'
};

/**
 * Initialize positions & portfolio system
 * @param {boolean} autoSelectDefault - Auto-select default account from preferences
 */
window.initPositionsPortfolio = async function(autoSelectDefault = false) {
    window.Logger.info('🔧 אתחול מערכת פוזיציות ופורטפוליו', { page: "trading_accounts" });
    
    // Wait for UnifiedCacheManager to be available
    if (!window.UnifiedCacheManager) {
        window.Logger.warn('⚠️ UnifiedCacheManager not available, waiting...', { page: "trading_accounts" });
        // Wait up to 3 seconds
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.UnifiedCacheManager) {
                window.Logger.info('✅ UnifiedCacheManager became available', { page: "trading_accounts" });
                break;
            }
        }
    }
    
    if (!window.UnifiedCacheManager) {
        window.Logger.error('❌ UnifiedCacheManager not available after wait', { page: "trading_accounts" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת המטמון לא זמינה. אנא רענן את הדף.');
        }
        return;
    }
    
    // Populate account selector when accounts are loaded
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        await populatePositionsAccountSelector(autoSelectDefault);
    }
    
    // Setup event listeners
    const positionsSelector = document.getElementById('positionsAccountSelector');
    if (positionsSelector) {
        positionsSelector.addEventListener('change', handlePositionsAccountSelection);
    }
    
    // Setup portfolio filters
    setupPortfolioFilters();
    
    // Setup summary toggle
    setupSummaryToggle();
    
    // Listen for account data updates
    if (window.addEventListener) {
        window.addEventListener('accountsLoaded', async () => {
            await populatePositionsAccountSelector(true);
        });
    }
    
    // Load portfolio on init (if no account selector dependency)
    await loadPortfolio();
    await loadPortfolioSummary();
};

/**
 * Populate positions account selector dropdown
 * @param {boolean} autoSelectDefault - Auto-select default account from preferences
 */
async function populatePositionsAccountSelector(autoSelectDefault = false) {
    const selector = document.getElementById('positionsAccountSelector');
    if (!selector) return;
    
    // Clear existing options (except first)
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Add accounts - reuse logic from account-activity.js
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name || `חשבון ${account.id}`;
            selector.appendChild(option);
        });
    }
    
    window.Logger.info(`✅ Positions account selector populated with ${selector.options.length - 1} accounts`, { page: "trading_accounts" });
    
    // Auto-select default account from preferences (same logic as account-activity)
    if (autoSelectDefault && selector.options.length > 1) {
        const currentValue = selector.value;
        if (!currentValue || currentValue === '') {
            try {
                let defaultAccountId = null;
                
                if (typeof window.getPreference === 'function') {
                    const prefValue = await window.getPreference('default_trading_account');
                    
                    if (prefValue) {
                        const parsed = parseInt(prefValue);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                        } else {
                            const account = window.trading_accountsData.find(acc => acc.name === prefValue);
                            if (account) {
                                defaultAccountId = account.id;
                            }
                        }
                    }
                }
                
                if (!defaultAccountId || !selector.querySelector(`option[value="${defaultAccountId}"]`)) {
                    defaultAccountId = selector.options[1].value;
                }
                
                selector.value = defaultAccountId;
                handlePositionsAccountSelection({ target: selector });
            } catch (error) {
                window.Logger.error('❌ Error getting default account:', error, { page: "trading_accounts" });
                const firstAccountId = selector.options[1].value;
                selector.value = firstAccountId;
                handlePositionsAccountSelection({ target: selector });
            }
        }
    }
}

/**
 * Handle positions account selection change
 */
async function handlePositionsAccountSelection(event) {
    const accountId = parseInt(event.target.value);
    
    if (!accountId || isNaN(accountId)) {
        clearPositionsTable();
        return;
    }
    
    window.positionsPortfolioState.selectedAccountId = accountId;
    
    // Show section body
    const sectionBody = document.querySelector('[data-section="positions-portfolio"] .section-body');
    if (sectionBody) {
        sectionBody.style.display = 'block';
    }
    
    // Load positions for selected account
    await loadAccountPositions(accountId);
}

/**
 * Load account positions from API with cache
 * @param {number} accountId - Trading account ID
 */
async function loadAccountPositions(accountId) {
    if (!accountId) return;
    
    window.positionsPortfolioState.isLoading = true;
    const tableBody = document.querySelector('#positionsTable tbody');
    
    try {
        // Show loading state
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="loading">טוען פוזיציות...</td></tr>';
        }
        
        // Cache key
        const cacheKey = `positions-account-${accountId}`;
        
        // Load from cache or API
        const data = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/account/${accountId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data.positions || [];
                }
                return [];
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.positionsData = data;
        
        // Update count
        const countElement = document.getElementById('positionsCount');
        if (countElement) {
            countElement.textContent = `${data.length} פוזיציות`;
        }
        
        // Render table
        renderPositionsTable(data);
        
    } catch (error) {
        window.Logger.error('❌ Error loading account positions:', error, { page: "trading_accounts" });
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="error">שגיאה בטעינת פוזיציות</td></tr>';
        }
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פוזיציות. אנא נסה שוב.');
        }
    } finally {
        window.positionsPortfolioState.isLoading = false;
    }
}

/**
 * Render positions table
 * @param {Array} positions - Array of position objects
 */
function renderPositionsTable(positions) {
    const tableBody = document.querySelector('#positionsTable tbody');
    if (!tableBody) return;
    
    if (!positions || positions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty">אין פוזיציות להצגה</td></tr>';
        return;
    }
    
    // Use FieldRendererService for consistent rendering
    const FieldRenderer = window.FieldRendererService;
    
    let html = '';
    positions.forEach(position => {
        const side = position.side || 'closed';
        const quantity = position.quantity || 0;
        const marketValue = position.market_value || 0;
        const unrealizedPl = position.unrealized_pl || 0;
        const unrealizedPlPercent = position.unrealized_pl_percent || 0;
        const percentAccount = position.percent_of_account || 0;
        
        // Render ticker info using FieldRendererService
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (position.ticker_name) {
            tickerHtml += `<br><small>${position.ticker_name}</small>`;
        }
        if (FieldRenderer && FieldRenderer.renderTickerInfo) {
            try {
                tickerHtml = FieldRenderer.renderTickerInfo({
                    symbol: position.ticker_symbol,
                    name: position.ticker_name,
                    current_price: position.market_price,
                    daily_change: null, // Not available in position data
                    daily_change_percent: null
                }, 'ticker-info-compact');
            } catch (e) {
                window.Logger.warn('Error rendering ticker info:', e, { page: "trading_accounts" });
            }
        }
        
        // Render side using FieldRendererService
        let sideHtml = `<span class="badge badge-${side}">${side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : 'סגור'}</span>`;
        if (FieldRenderer && FieldRenderer.renderSide) {
            try {
                sideHtml = FieldRenderer.renderSide(side);
            } catch (e) {
                window.Logger.warn('Error rendering side:', e, { page: "trading_accounts" });
            }
        }
        
        html += `
            <tr data-position-id="${position.ticker_id}" data-account-id="${position.trading_account_id}">
                <td class="col-ticker">${tickerHtml}</td>
                <td class="col-quantity">${Math.abs(quantity).toLocaleString()}</td>
                <td class="col-side">${sideHtml}</td>
                <td class="col-avg-price">
                    ${position.average_price_net ? `$${position.average_price_net.toFixed(2)}` : 'N/A'}
                </td>
                <td class="col-market-value">
                    ${marketValue ? `$${marketValue.toFixed(2)}` : 'לא זמין'}
                </td>
                <td class="col-unrealized-pl">
                    ${marketValue ? `
                        <span class="${unrealizedPl >= 0 ? 'text-success' : 'text-danger'}">
                            ${unrealizedPl >= 0 ? '+' : ''}$${unrealizedPl.toFixed(2)} (${unrealizedPlPercent >= 0 ? '+' : ''}${unrealizedPlPercent.toFixed(2)}%)
                        </span>
                    ` : 'לא זמין'}
                </td>
                <td class="col-percent-account">
                    ${percentAccount.toFixed(2)}%
                </td>
                <td class="col-actions actions-cell">
                    <button class="btn btn-sm btn-outline-primary" onclick="showPositionDetails(${position.trading_account_id}, ${position.ticker_id})" title="פרטים">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Setup portfolio filters
 */
function setupPortfolioFilters() {
    const sideFilter = document.getElementById('portfolioSideFilter');
    const includeClosed = document.getElementById('portfolioIncludeClosed');
    const unifyAccounts = document.getElementById('portfolioUnifyAccounts');
    
    if (sideFilter) {
        sideFilter.addEventListener('change', () => loadPortfolio());
    }
    
    if (includeClosed) {
        includeClosed.addEventListener('change', () => loadPortfolio());
    }
    
    if (unifyAccounts) {
        unifyAccounts.addEventListener('change', () => loadPortfolio());
    }
}

/**
 * Load portfolio from API with cache
 */
async function loadPortfolio() {
    window.positionsPortfolioState.isLoading = true;
    const tableBody = document.querySelector('#portfolioTable tbody');
    
    try {
        // Show loading state
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="9" class="loading">טוען פורטפוליו...</td></tr>';
        }
        
        // Get filter values
        const sideFilter = document.getElementById('portfolioSideFilter')?.value || '';
        const includeClosed = document.getElementById('portfolioIncludeClosed')?.checked || false;
        const unifyAccounts = document.getElementById('portfolioUnifyAccounts')?.checked || false;
        
        // Build query string
        const params = new URLSearchParams();
        if (sideFilter) params.append('side', sideFilter);
        if (includeClosed) params.append('include_closed', 'true');
        if (unifyAccounts) params.append('unify_accounts', 'true');
        
        // Cache key includes filters
        const cacheKey = `portfolio-${params.toString()}`;
        
        // Load from cache or API
        const data = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/portfolio?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return { positions: [], summary: {} };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.portfolioData = data;
        
        // Update count
        const countElement = document.getElementById('portfolioCount');
        if (countElement) {
            countElement.textContent = `${data.summary?.total_positions || 0} פוזיציות`;
        }
        
        // Render table
        renderPortfolioTable(data.positions || []);
        
    } catch (error) {
        window.Logger.error('❌ Error loading portfolio:', error, { page: "trading_accounts" });
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="9" class="error">שגיאה בטעינת פורטפוליו</td></tr>';
        }
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פורטפוליו. אנא נסה שוב.');
        }
    } finally {
        window.positionsPortfolioState.isLoading = false;
    }
}

/**
 * Render portfolio table
 * @param {Array} positions - Array of position objects
 */
function renderPortfolioTable(positions) {
    const tableBody = document.querySelector('#portfolioTable tbody');
    if (!tableBody) return;
    
    if (!positions || positions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="empty">אין פוזיציות להצגה</td></tr>';
        return;
    }
    
    const FieldRenderer = window.FieldRendererService;
    
    let html = '';
    positions.forEach(position => {
        const side = position.side || 'closed';
        const quantity = position.quantity || 0;
        const marketValue = position.market_value || 0;
        const unrealizedPl = position.unrealized_pl || 0;
        const unrealizedPlPercent = position.unrealized_pl_percent || 0;
        const percentPortfolio = position.percent_of_portfolio || 0;
        
        // Render ticker info using FieldRendererService
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (FieldRenderer && FieldRenderer.renderTickerInfo) {
            try {
                tickerHtml = FieldRenderer.renderTickerInfo({
                    symbol: position.ticker_symbol,
                    name: position.ticker_name,
                    current_price: position.market_price,
                    daily_change: null,
                    daily_change_percent: null
                }, 'ticker-info-compact');
            } catch (e) {
                window.Logger.warn('Error rendering ticker info:', e, { page: "trading_accounts" });
            }
        }
        
        // Render side using FieldRendererService
        let sideHtml = `<span class="badge badge-${side}">${side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : 'סגור'}</span>`;
        if (FieldRenderer && FieldRenderer.renderSide) {
            try {
                sideHtml = FieldRenderer.renderSide(side);
            } catch (e) {
                window.Logger.warn('Error rendering side:', e, { page: "trading_accounts" });
            }
        }
        
        html += `
            <tr data-position-id="${position.ticker_id}" data-account-id="${position.trading_account_id}">
                <td class="col-account">${position.account_name || 'N/A'}</td>
                <td class="col-ticker">${tickerHtml}</td>
                <td class="col-quantity">${Math.abs(quantity).toLocaleString()}</td>
                <td class="col-side">${sideHtml}</td>
                <td class="col-avg-price">
                    ${position.average_price_net ? `$${position.average_price_net.toFixed(2)}` : 'N/A'}
                </td>
                <td class="col-market-value">
                    ${marketValue ? `$${marketValue.toFixed(2)}` : 'לא זמין'}
                </td>
                <td class="col-unrealized-pl">
                    ${marketValue ? `
                        <span class="${unrealizedPl >= 0 ? 'text-success' : 'text-danger'}">
                            ${unrealizedPl >= 0 ? '+' : ''}$${unrealizedPl.toFixed(2)} (${unrealizedPlPercent >= 0 ? '+' : ''}${unrealizedPlPercent.toFixed(2)}%)
                        </span>
                    ` : 'לא זמין'}
                </td>
                <td class="col-percent-portfolio">
                    ${percentPortfolio.toFixed(2)}%
                </td>
                <td class="col-actions actions-cell">
                    <button class="btn btn-sm btn-outline-primary" onclick="showPositionDetails(${position.trading_account_id}, ${position.ticker_id})" title="פרטים">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Setup summary toggle
 */
function setupSummaryToggle() {
    const toggleBtn = document.getElementById('portfolioSummaryToggleSize');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentSize = window.positionsPortfolioState.summarySize;
            const newSize = currentSize === 'minimal' ? 'full' : 'minimal';
            window.positionsPortfolioState.summarySize = newSize;
            toggleBtn.textContent = newSize === 'minimal' ? 'הצג מלא' : 'הצג מינימאלי';
            loadPortfolioSummary();
        });
    }
}

/**
 * Load portfolio summary
 */
async function loadPortfolioSummary() {
    const summaryElement = document.getElementById('portfolioSummaryStats');
    if (!summaryElement) return;
    
    try {
        summaryElement.innerHTML = '<div>טוען סיכום...</div>';
        
        const size = window.positionsPortfolioState.summarySize || 'minimal';
        const cacheKey = `portfolio-summary-${size}`;
        
        // Load from cache or API
        const data = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/portfolio/summary?size=${size}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return { summary: {} };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.summaryData = data;
        
        // Render summary (summary is already calculated object, not array)
        renderPortfolioSummaryFallback(data.summary, size);
        
    } catch (error) {
        window.Logger.error('❌ Error loading portfolio summary:', error, { page: "trading_accounts" });
        if (summaryElement) {
            summaryElement.innerHTML = '<div class="error">שגיאה בטעינת סיכום</div>';
        }
    }
}

/**
 * Fallback rendering for portfolio summary
 * @param {Object} summary - Summary data
 * @param {string} size - 'minimal' or 'full'
 */
function renderPortfolioSummaryFallback(summary, size) {
    const summaryElement = document.getElementById('portfolioSummaryStats');
    if (!summaryElement) return;
    
    const totalPositions = summary.total_positions || 0;
    const totalMarketValue = summary.total_market_value || 0;
    const totalCost = summary.total_cost || 0;
    const totalPl = summary.total_pl || 0;
    const totalPlPercent = summary.total_pl_percent || 0;
    
    if (size === 'minimal') {
        summaryElement.innerHTML = `
            <div>סה"כ פוזיציות: <strong>${totalPositions}</strong></div>
            <div>שווי שוק כולל: <strong>$${totalMarketValue.toFixed(2)}</strong></div>
            <div>רווח/הפסד כולל: <strong class="${totalPl >= 0 ? 'text-success' : 'text-danger'}">${totalPl >= 0 ? '+' : ''}$${totalPl.toFixed(2)} (${totalPlPercent >= 0 ? '+' : ''}${totalPlPercent.toFixed(2)}%)</strong></div>
        `;
    } else {
        summaryElement.innerHTML = `
            <div class="info-summary-full">
                <div>סה"כ פוזיציות: <strong>${totalPositions}</strong></div>
                <div>שווי שוק כולל: <strong>$${totalMarketValue.toFixed(2)}</strong></div>
                <div>עלות כוללת: <strong>$${totalCost.toFixed(2)}</strong></div>
                <div>רווח/הפסד מוכר: <strong>$${(summary.total_realized_pl || 0).toFixed(2)}</strong></div>
                <div>רווח/הפסד לא מוכר: <strong>$${(summary.total_unrealized_pl || 0).toFixed(2)}</strong></div>
                <div>רווח/הפסד כולל: <strong class="${totalPl >= 0 ? 'text-success' : 'text-danger'}">${totalPl >= 0 ? '+' : ''}$${totalPl.toFixed(2)} (${totalPlPercent >= 0 ? '+' : ''}${totalPlPercent.toFixed(2)}%)</strong></div>
                <div>סה"כ עמלות: <strong>$${(summary.total_fees || 0).toFixed(2)}</strong></div>
            </div>
        `;
    }
}

/**
 * Show position details modal
 * @param {number} accountId - Trading account ID
 * @param {number} tickerId - Ticker ID
 */
window.showPositionDetails = async function(accountId, tickerId) {
    try {
        // Load position details from API
        const cacheKey = `position-details-${accountId}-${tickerId}`;
        
        const positionData = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/${accountId}/${tickerId}/details`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return null;
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        if (!positionData) {
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'פוזיציה לא נמצאה.');
            }
            return;
        }
        
        // Use EntityDetailsModal if available (show ticker details as base)
        if (window.entityDetailsModal && typeof window.entityDetailsModal.show === 'function') {
            // Show ticker details first, then add position-specific info
            await window.entityDetailsModal.show('ticker', tickerId, {
                customTitle: `פרטי פוזיציה - ${positionData.ticker_symbol || tickerId}`,
                additionalContent: renderPositionDetailsContent(positionData)
            });
        } else if (window.showDetailsModal) {
            // Fallback to showDetailsModal
            const content = renderPositionDetailsContent(positionData);
            await window.showDetailsModal(
                `פרטי פוזיציה - ${positionData.ticker_symbol || tickerId}`,
                content
            );
        } else {
            // Last resort - notification
            const FieldRenderer = window.FieldRendererService;
            const sideHtml = FieldRenderer && FieldRenderer.renderSide ? 
                FieldRenderer.renderSide(positionData.side) : 
                positionData.side;
            
            window.showInfoNotification('פרטי פוזיציה', 
                `חשבון: ${positionData.account_name || accountId}\n` +
                `טיקר: ${positionData.ticker_symbol || tickerId}\n` +
                `כמות: ${Math.abs(positionData.quantity || 0)}\n` +
                `צד: ${sideHtml}\n` +
                `מחיר ממוצע: $${(positionData.average_price_net || 0).toFixed(2)}\n` +
                `שווי שוק: ${positionData.market_value ? `$${positionData.market_value.toFixed(2)}` : 'לא זמין'}\n` +
                `ביצועים: ${positionData.executions?.length || 0}`
            );
        }
    } catch (error) {
        window.Logger.error('❌ Error showing position details:', error, { page: "trading_accounts" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פרטי פוזיציה.');
        }
    }
};

/**
 * Render position details content for modal
 * @param {Object} positionData - Position data from API
 * @returns {string} HTML content
 */
function renderPositionDetailsContent(positionData) {
    const FieldRenderer = window.FieldRendererService;
    const sideHtml = FieldRenderer && FieldRenderer.renderSide ? 
        FieldRenderer.renderSide(positionData.side) : 
        `<span class="badge badge-${positionData.side}">${positionData.side === 'long' ? 'לונג' : positionData.side === 'short' ? 'שורט' : 'סגור'}</span>`;
    
    let html = `
        <div class="position-details-content">
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>חשבון:</strong> ${positionData.account_name || 'N/A'}
                </div>
                <div class="col-md-6">
                    <strong>טיקר:</strong> ${positionData.ticker_symbol || 'N/A'} - ${positionData.ticker_name || ''}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>כמות:</strong> ${Math.abs(positionData.quantity || 0).toLocaleString()}
                </div>
                <div class="col-md-6">
                    <strong>צד:</strong> ${sideHtml}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>מחיר ממוצע (נטו):</strong> $${(positionData.average_price_net || 0).toFixed(2)}
                </div>
                <div class="col-md-6">
                    <strong>מחיר ממוצע (ברוטו):</strong> $${(positionData.average_price_gross || 0).toFixed(2)}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>שווי שוק:</strong> ${positionData.market_value ? `$${positionData.market_value.toFixed(2)}` : 'לא זמין'}
                </div>
                <div class="col-md-6">
                    <strong>עלות נוכחית:</strong> $${(positionData.current_position_cost || 0).toFixed(2)}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>רווח/הפסד לא מוכר:</strong> 
                    <span class="${(positionData.unrealized_pl || 0) >= 0 ? 'text-success' : 'text-danger'}">
                        ${(positionData.unrealized_pl || 0) >= 0 ? '+' : ''}$${(positionData.unrealized_pl || 0).toFixed(2)} 
                        (${(positionData.unrealized_pl_percent || 0) >= 0 ? '+' : ''}${(positionData.unrealized_pl_percent || 0).toFixed(2)}%)
                    </span>
                </div>
                <div class="col-md-6">
                    <strong>רווח/הפסד מוכר:</strong> 
                    <span class="${(positionData.realized_pl || 0) >= 0 ? 'text-success' : 'text-danger'}">
                        ${(positionData.realized_pl || 0) >= 0 ? '+' : ''}$${(positionData.realized_pl || 0).toFixed(2)} 
                        (${(positionData.realized_pl_percent || 0) >= 0 ? '+' : ''}${(positionData.realized_pl_percent || 0).toFixed(2)}%)
                    </span>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>סה"כ קניה:</strong> ${(positionData.total_bought_quantity || 0).toLocaleString()} יחידות - $${(positionData.total_bought_amount || 0).toFixed(2)}
                </div>
                <div class="col-md-6">
                    <strong>סה"כ מכירה:</strong> ${(positionData.total_sold_quantity || 0).toLocaleString()} יחידות - $${(positionData.total_sold_amount || 0).toFixed(2)}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>סה"כ עמלות:</strong> $${(positionData.total_fees || 0).toFixed(2)}
                </div>
                <div class="col-md-6">
                    <strong>אחוז מהחשבון:</strong> ${(positionData.percent_of_account || 0).toFixed(2)}%
                </div>
            </div>
    `;
    
    // Add executions list if available
    if (positionData.executions && positionData.executions.length > 0) {
        html += `
            <div class="row mt-4">
                <div class="col-12">
                    <h5>ביצועים (${positionData.executions.length})</h5>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>תאריך</th>
                                    <th>פעולה</th>
                                    <th>כמות</th>
                                    <th>מחיר</th>
                                    <th>עמלה</th>
                                    <th>סה"כ</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        positionData.executions.forEach(execution => {
            const action = execution.action === 'buy' ? 'קניה' : 'מכירה';
            const actionClass = execution.action === 'buy' ? 'text-success' : 'text-danger';
            const total = (execution.quantity * execution.price) + (execution.fee || 0);
            
            html += `
                <tr>
                    <td>${execution.date ? new Date(execution.date).toLocaleDateString('he-IL') : 'N/A'}</td>
                    <td><span class="${actionClass}">${action}</span></td>
                    <td>${execution.quantity.toLocaleString()}</td>
                    <td>$${execution.price.toFixed(2)}</td>
                    <td>$${(execution.fee || 0).toFixed(2)}</td>
                    <td>$${total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

/**
 * Clear positions table
 */
function clearPositionsTable() {
    const tableBody = document.querySelector('#positionsTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="8" class="loading">בחר חשבון להצגת פוזיציות...</td></tr>';
    }
    const countElement = document.getElementById('positionsCount');
    if (countElement) {
        countElement.textContent = 'בחר חשבון...';
    }
}

// Export for external use
window.PositionsPortfolioSystem = {
    init: window.initPositionsPortfolio,
    loadAccountPositions,
    loadPortfolio,
    loadPortfolioSummary,
    showPositionDetails: window.showPositionDetails
};

window.Logger.info('✅ Positions & Portfolio System loaded', { page: "trading_accounts" });
