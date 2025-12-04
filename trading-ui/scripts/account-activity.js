/**
 * Account Activity System - TikTrack
 * ===================================
 *
 * מערכת הצגת תנועות חשבון (תזרימי מזומנים + ביצועים)
 *
 * תכונות:
 * - הצגת תנועות חשבון לפי מטבע
 * - חישוב יתרות בזמן אמת
 * - תמיכה במטבעות מרובים
 * - אינטגרציה עם EntityDetailsModal
 * - אינטגרציה עם מערכת המטמון
 *
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Date: November 2025
 */

/* ===== ACCOUNT ACTIVITY SYSTEM ===== */
window.Logger.info('📁 account-activity.js נטען', { page: 'trading_accounts' });

// Global state
window.accountActivityState = {
  selectedAccountId: null,
  activityData: null,
  isLoading: false,
  lastExecutionNoticeAccountId: null,
};

let accountActivityPaginationInstance = null;

/**
 * Initialize account activity system
 */
window.initAccountActivity = function(autoSelectDefault = false) {
  window.Logger.info('🔧 אתחול מערכת תנועות חשבון', { page: 'trading_accounts' });

  // Setup event listeners FIRST (before populating selector)
  const selector = document.getElementById('accountActivitySelector');
  if (selector) {
    // Remove existing listeners to prevent duplicates
    const newSelector = selector.cloneNode(true);
    selector.parentNode.replaceChild(newSelector, selector);
    // Re-attach listener to new element
    const newSelectorElement = document.getElementById('accountActivitySelector');
    if (newSelectorElement) {
      newSelectorElement.addEventListener('change', handleAccountSelection);
    }
  }

  // Listen for account data updates (only once)
  if (window.addEventListener) {
    // Remove existing listener if any
    window.removeEventListener('accountsLoaded', window._accountActivityAccountsLoadedHandler);
    // Create new handler
    window._accountActivityAccountsLoadedHandler = async () => {
      // On accounts loaded event, populate selector only if not already populated
      const currentSelector = document.getElementById('accountActivitySelector');
      if (currentSelector && currentSelector.options.length <= 1) {
        await populateAccountSelector(autoSelectDefault);
      }
    };
    window.addEventListener('accountsLoaded', window._accountActivityAccountsLoadedHandler);

    // Populate account selector when accounts are already loaded
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData) && window.trading_accountsData.length > 0) {
      populateAccountSelector(autoSelectDefault);
    }

    // Listen for filter date range changes to update date range display
    window.addEventListener('filterDateRangeChanged', (event) => {
      const dateRange = event.detail?.dateRange || window.selectedDateRangeForFilter;
      if (dateRange && window.accountActivityState.activityData) {
        // Update date range display when filter changes
        updateActivitySummary(window.accountActivityState.activityData);
      }
    });

    // Listen for filter updates from header system
    const checkFilterUpdates = () => {
      const currentDateRange = window.selectedDateRangeForFilter;
      if (currentDateRange && window.accountActivityState.activityData) {
        updateActivitySummary(window.accountActivityState.activityData);
      }
    };

    // Check periodically for filter updates (when filter system might not dispatch events)
    setInterval(checkFilterUpdates, 2000);
  }

  // Setup section open listeners after DOM is ready
  // Use setTimeout to ensure DOM elements exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => setupSectionOpenListeners(), 500);
    });
  } else {
    setTimeout(() => setupSectionOpenListeners(), 500);
  }
};

/**
 * Setup event listeners for section opening - ensures data is loaded when section opens
 */
function setupSectionOpenListeners() {
  // Listen for account-activity-summary section opening
  const accountActivitySummarySection = document.querySelector('[data-section="account-activity-summary"]');
  if (accountActivitySummarySection) {
    // Use MutationObserver to watch for section body display changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const sectionBody = accountActivitySummarySection.querySelector('.section-body');
          if (sectionBody) {
            const isVisible = sectionBody.style.display !== 'none' && 
                             window.getComputedStyle(sectionBody).display !== 'none';
            if (isVisible) {
              window.Logger.info('📂 account-activity-summary section opened', { page: 'trading_accounts' });
              // Check if selector is populated and account is selected
              const selector = document.getElementById('accountActivitySelector');
              if (selector && selector.value) {
                const accountId = parseInt(selector.value);
                if (accountId && !isNaN(accountId)) {
                  // Ensure activity data is loaded
                  if (!window.accountActivityState.activityData) {
                    window.Logger.info(`🔄 Loading account activity data on section open for account ${accountId}`, { page: 'trading_accounts' });
                    window.loadAccountActivity(accountId).catch(error => {
                      window.Logger.error('❌ Error loading account activity on section open:', error, { page: 'trading_accounts' });
                    });
                  }
                }
              } else {
                // Selector not populated yet - wait a bit and try again
                setTimeout(() => {
                  const selector2 = document.getElementById('accountActivitySelector');
                  if (selector2 && selector2.options.length > 1 && !selector2.value) {
                    // Auto-select first account if no account selected
                    selector2.value = selector2.options[1].value;
                    handleAccountSelection({ target: selector2 });
                  }
                }, 500);
              }
            }
          }
        }
      });
    });

    // Observe section body for style changes
    const sectionBody = accountActivitySummarySection.querySelector('.section-body');
    if (sectionBody) {
      observer.observe(sectionBody, { attributes: true, attributeFilter: ['style'] });
    }
  }

  // Listen for account-activity-table section opening
  const accountActivityTableSection = document.querySelector('[data-section="account-activity-table"]');
  if (accountActivityTableSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const sectionBody = accountActivityTableSection.querySelector('.section-body');
          if (sectionBody) {
            const isVisible = sectionBody.style.display !== 'none' && 
                             window.getComputedStyle(sectionBody).display !== 'none';
            if (isVisible) {
              window.Logger.info('📂 account-activity-table section opened', { page: 'trading_accounts' });
              // Update date range display
              const selector = document.getElementById('accountActivitySelector');
              if (selector && selector.value) {
                const accountId = parseInt(selector.value);
                if (accountId && !isNaN(accountId)) {
                  // Ensure activity data is loaded and date range is updated
                  if (!window.accountActivityState.activityData) {
                    window.loadAccountActivity(accountId).catch(error => {
                      window.Logger.error('❌ Error loading account activity on table section open:', error, { page: 'trading_accounts' });
                    });
                  } else {
                    // Just update date range display
                    if (typeof updateActivitySummary === 'function') {
                      updateActivitySummary(window.accountActivityState.activityData);
                    }
                  }
                }
              }
            }
          }
        }
      });
    });

    const sectionBody = accountActivityTableSection.querySelector('.section-body');
    if (sectionBody) {
      observer.observe(sectionBody, { attributes: true, attributeFilter: ['style'] });
    }
  }
}

/**
 * Populate account selector dropdown
 * @param {boolean} autoSelectDefault - If true, automatically select default account from preferences after populating
 */
async function populateAccountSelector(autoSelectDefault = false) {
  const selector = document.getElementById('accountActivitySelector');
  if (!selector) {return;}

  // Clear existing options (except first)
  while (selector.options.length > 1) {
    selector.remove(1);
  }

  // Add accounts
  if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
    window.trading_accountsData.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name || `חשבון ${account.id}`;
      selector.appendChild(option);
    });
  }

  window.Logger.info(`✅ Account selector populated with ${selector.options.length - 1} accounts`, { page: 'trading_accounts', keepInfo: true });

  // Auto-select default account from preferences if requested and no account is currently selected
  if (autoSelectDefault && selector.options.length > 1) {
    const currentValue = selector.value;
    if (!currentValue || currentValue === '') {
      try {
        // Get default account from preferences - use PreferencesCore first, then fallback
        let defaultAccountId = null;

        // Try PreferencesCore first (preferred method)
        if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
          try {
            const prefValue = await window.PreferencesCore.getPreference('default_trading_account');
            if (prefValue) {
              const parsed = parseInt(prefValue);
              if (!isNaN(parsed)) {
                defaultAccountId = parsed;
                window.Logger.info(`✅ Got default account from PreferencesCore: ${defaultAccountId}`, { page: 'trading_accounts' });
              }
            }
          } catch (e) {
            window.Logger.warn('⚠️ Error getting default account from PreferencesCore:', e, { page: 'trading_accounts' });
          }
        }

        // Fallback to window.getPreference if PreferencesCore didn't work
        if (!defaultAccountId && typeof window.getPreference === 'function') {
          try {
            const prefValue = await window.getPreference('default_trading_account');
            if (prefValue) {
              // Try to parse as integer ID first
              const parsed = parseInt(prefValue);
              if (!isNaN(parsed)) {
                defaultAccountId = parsed;
                window.Logger.info(`✅ Got default account from window.getPreference: ${defaultAccountId}`, { page: 'trading_accounts' });
              } else {
                // Try to find account by name
                const account = window.trading_accountsData.find(acc => acc.name === prefValue);
                if (account) {
                  defaultAccountId = account.id;
                  window.Logger.info(`✅ Found default account by name: ${defaultAccountId}`, { page: 'trading_accounts' });
                }
              }
            }
          } catch (e) {
            window.Logger.warn('⚠️ Error getting default account from window.getPreference:', e, { page: 'trading_accounts' });
          }
        }

        // Verify that the default account exists in the selector options
        const defaultOption = selector.querySelector(`option[value="${defaultAccountId}"]`);
        if (!defaultAccountId || !defaultOption) {
          // Fallback to first available account (skip the empty "בחר חשבון..." option)
          if (selector.options.length > 1) {
            defaultAccountId = selector.options[1].value;
            window.Logger.info(`ℹ️ No valid default account in preferences, using first account (ID: ${defaultAccountId})`, { page: 'trading_accounts' });
          } else {
            window.Logger.warn('⚠️ No accounts available to select', { page: 'trading_accounts' });
            return; // No accounts to select
          }
        } else {
          window.Logger.info(`🔄 Auto-selecting default account from preferences (ID: ${defaultAccountId})`, { page: 'trading_accounts' });
        }

        // Select the account using DataCollectionService if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue(selector.id, defaultAccountId, 'int');
        } else {
          selector.value = defaultAccountId;
        }

        // Trigger selection change to load activity data
        handleAccountSelection({ target: selector });
      } catch (error) {
        window.Logger.error('❌ Error getting default account from preferences:', error, { page: 'trading_accounts' });
        // Fallback to first account
        const firstAccountId = selector.options[1].value;
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue(selector.id, firstAccountId, 'int');
        } else {
          selector.value = firstAccountId;
        }
        handleAccountSelection({ target: selector });
      }
    } else {
      window.Logger.info(`ℹ️ Account already selected (ID: ${currentValue}), skipping auto-selection`, { page: 'trading_accounts' });
    }
  }
}

/**
 * Handle account selection change
 */
async function handleAccountSelection(event) {
  const accountId = parseInt(event.target.value);

  if (!accountId || isNaN(accountId)) {
    clearActivityTable();
    return;
  }

  window.accountActivityState.selectedAccountId = accountId;

  // Show section bodies and ensure they're visible
  const summaryBody = document.querySelector('[data-section="account-activity-summary"] .section-body');
  if (summaryBody) {
    summaryBody.style.display = 'block';
    summaryBody.classList.remove('d-none');
    // Ensure statistics card is visible
    const statsCard = document.getElementById('accountActivityStatisticsCard');
    if (statsCard) {
      statsCard.classList.remove('d-none');
    }
    setTimeout(() => {
      setupStatisticsFilterHook();
    }, 500);
  }
  const tableBody = document.querySelector('[data-section="account-activity-table"] .section-body');
  if (tableBody) {
    tableBody.style.display = 'block';
    tableBody.classList.remove('d-none');
  }

  // Load activity data
  await loadAccountActivity(accountId);
}

/**
 * Load account activity data from API
 */
async function loadAccountActivity(accountId) {
  if (window.accountActivityState.isLoading) {
    window.Logger.warn('⚠️ Account activity already loading', { page: 'trading_accounts' });
    return;
  }

  window.accountActivityState.isLoading = true;

  try {
    window.Logger.info(`📡 טעינת תנועות חשבון ${accountId}`, { page: 'trading_accounts' });

    // Check cache first using UnifiedCacheManager (following cache strategy from unified-cache-manager.js)
    const cacheKey = `account-activity-${accountId}`;
    
    // Use UnifiedCacheManager with proper TTL (60 seconds as defined in cache config: 'account-activity-*')
    if (window.UnifiedCacheManager) {
      const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: 60000 });
      if (cached) {
        window.Logger.info('✅ נתונים מהמטמון', { page: 'trading_accounts' });
        window.accountActivityState.activityData = cached;
        populateAccountActivityTable(cached);
        updateActivitySummary(cached);
        window.accountActivityState.isLoading = false;
        return;
      }
    }

    // Fetch from API
    const response = await fetch(`/api/account-activity/${accountId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success' && result.data) {
      window.accountActivityState.activityData = result.data;

      // Detailed debugging of received data
      window.Logger.info('🔍 DEBUG: Raw API response structure:', { page: 'trading_accounts' });
      window.Logger.info(`  - Has data: ${!!result.data}`, { page: 'trading_accounts' });
      window.Logger.info(`  - Has currencies: ${!!result.data?.currencies}`, { page: 'trading_accounts' });
      window.Logger.info(`  - Currencies count: ${result.data?.currencies?.length || 0}`, { page: 'trading_accounts' });

      if (result.data?.currencies) {
        result.data.currencies.forEach((currency, idx) => {
          window.Logger.info(`  Currency ${idx}: ${currency.currency_symbol}, movements count: ${currency.movements?.length || 0}`, { page: 'trading_accounts' });
          if (currency.movements && currency.movements.length > 0) {
            const types = currency.movements.map(m => m.type || 'unknown');
            window.Logger.info(`    Movement types: ${types.join(', ')}`, { page: 'trading_accounts' });
            currency.movements.forEach((mov, movIdx) => {
              if (mov.type === 'execution') {
                window.Logger.info(`    ✅ Execution ${movIdx}: id=${mov.id}, action=${mov.action || mov.sub_type || mov.subtype}, ticker_id=${mov.ticker_id}, ticker_symbol=${mov.ticker_symbol}, amount=${mov.amount}`, { page: 'trading_accounts' });
              }
            });
          } else {
            window.Logger.warn(`    ⚠️ No movements for currency ${currency.currency_symbol}`, { page: 'trading_accounts' });
          }
        });
      }

      // Debug: Log received data structure
      const totalMovements = result.data.currencies?.reduce((sum, curr) => sum + (curr.movements?.length || 0), 0) || 0;
      const cashFlowCount = result.data.currencies?.reduce((sum, curr) => sum + (curr.movements?.filter(m => m.type === 'cash_flow').length || 0), 0) || 0;
      const executionCount = result.data.currencies?.reduce((sum, curr) => sum + (curr.movements?.filter(m => m.type === 'execution').length || 0), 0) || 0;

      window.Logger.info(`📥 Received from API: ${totalMovements} total movements (${cashFlowCount} cash flows, ${executionCount} executions)`, { page: 'trading_accounts' });

      // Log first few movements by type
      result.data.currencies?.forEach(currency => {
        const execs = currency.movements?.filter(m => m.type === 'execution') || [];
        const cfs = currency.movements?.filter(m => m.type === 'cash_flow') || [];
        window.Logger.info(`  Currency ${currency.currency_symbol}: ${currency.movements?.length || 0} total movements (${cfs.length} cash flows, ${execs.length} executions)`, { page: 'trading_accounts' });
        if (execs.length > 0) {
          execs.slice(0, 3).forEach(ex => {
            window.Logger.info(`    ✅ Execution ${ex.id}: ${ex.ticker_symbol || 'No ticker'}, action=${ex.sub_type || ex.action || ex.subtype || 'unknown'}, amount=${ex.amount}`, { page: 'trading_accounts' });
          });
        } else if ((currency.movements?.length || 0) > 0) {
          window.Logger.info(`    ℹ️ No executions returned for currency ${currency.currency_symbol}`, { page: 'trading_accounts' });
        }
      });

      if (executionCount === 0 && totalMovements > 0) {
        if (window.accountActivityState.lastExecutionNoticeAccountId !== accountId) {
          window.Logger.info('ℹ️ Account activity response did not include executions; displaying cash flows only', { page: 'trading_accounts' });
          window.accountActivityState.lastExecutionNoticeAccountId = accountId;
        }
      }

      // Cache the data
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.save(cacheKey, result.data, {
          ttl: 60000, // 1 minute
        });
      }

      populateAccountActivityTable(result.data);
      updateActivitySummary(result.data);
    } else {
      throw new Error(result.error?.message || 'Failed to load account activity');
    }

  } catch (error) {
    window.Logger.error('❌ שגיאה בטעינת תנועות חשבון:', error, { page: 'trading_accounts' });

    if (window.showNotification) {
      window.showNotification('שגיאה בטעינת תנועות חשבון: ' + error.message, 'error');
    }

    showErrorInTable('שגיאה בטעינת נתונים');
  } finally {
    window.accountActivityState.isLoading = false;
  }
}

/**
 * Populate account activity table
 */
function populateAccountActivityTable(data) {
  const tbody = document.querySelector('#accountActivityTable tbody');
  if (!tbody) {return;}

  tbody.textContent = '';

  if (!data.currencies || data.currencies.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 8;
    emptyCell.className = 'text-center';
    emptyCell.textContent = 'אין תנועות לחשבון זה';
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    syncAccountActivityPagination([]);
    updateCurrencyBalancesFooter(data);
    updateActivityStatistics();
    return;
  }

  // Calculate running balances per currency
  const runningBalances = {};

  // Sort all movements chronologically (newest first, then calculate balances oldest to newest)
  const allMovements = [];
  let cashFlowCount = 0;
  let executionCount = 0;

  data.currencies.forEach(currency => {
    currency.movements.forEach(movement => {
      allMovements.push({
        ...movement,
        currency_id: currency.currency_id,
        currency_symbol: currency.currency_symbol,
      });

      // Count movements by type
      if (movement.type === 'cash_flow') {
        cashFlowCount++;
      } else if (movement.type === 'execution') {
        executionCount++;
      }
    });
    runningBalances[currency.currency_id] = currency.balance || 0;
  });

  window.Logger.info(`📊 Total movements: ${allMovements.length} (${cashFlowCount} cash flows, ${executionCount} executions)`, { page: 'trading_accounts' });

  // Sort by date (oldest first for balance calculation)
  allMovements.sort((a, b) => {
    // Use dateUtils for consistent date parsing
    let dateA, dateB;
    if (a.date) {
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateA = window.dateUtils.toDateObject(a.date);
      } else {
        dateA = new Date(a.date);
      }
    } else {
      dateA = new Date(0);
    }
    if (b.date) {
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateB = window.dateUtils.toDateObject(b.date);
      } else {
        dateB = new Date(b.date);
      }
    } else {
      dateB = new Date(0);
    }
    return dateA - dateB;
  });

  // Calculate running balances (starting from balance and working backwards)
  // IMPORTANT: Use normalized amounts (each subtype has clear direction)
  const balancesByMovement = {};
  for (let i = allMovements.length - 1; i >= 0; i--) {
    const movement = allMovements[i];
    balancesByMovement[movement.id] = runningBalances[movement.currency_id];

    // Use normalized amount for balance calculation (each subtype has clear direction)
    const normalizedAmount = normalizeAmountBySubtype(
      movement.amount || '0',
      movement.type || '',
      movement.sub_type || movement.subtype || movement.action || '',
    );
    runningBalances[movement.currency_id] -= normalizedAmount;
  }

  // Now sort newest first for display
  allMovements.sort((a, b) => {
    // Use dateUtils for consistent date parsing
    let dateA, dateB;
    if (a.date) {
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateA = window.dateUtils.toDateObject(a.date);
      } else {
        dateA = new Date(a.date);
      }
    } else {
      dateA = new Date(0);
    }
    if (b.date) {
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateB = window.dateUtils.toDateObject(b.date);
      } else {
        dateB = new Date(b.date);
      }
    } else {
      dateB = new Date(0);
    }
    return dateB - dateA;
  });

  // Store processed movements for statistics calculation
  window.accountActivityState.processedMovements = allMovements;

  allMovements.forEach(movement => {
    movement._runningBalance = balancesByMovement[movement.id];
  });

  // Render rows with pagination
  const paginationPromise = syncAccountActivityPagination(allMovements);

  // Update footer with currency balances
  updateCurrencyBalancesFooter(data);

  // Update statistics card - wait for pagination to complete if it returns a promise
  if (paginationPromise && typeof paginationPromise.then === 'function') {
    paginationPromise.then(() => {
      // Wait a bit more for DOM to be fully updated
      setTimeout(() => {
        updateActivityStatistics();
      }, 100);
    }).catch(() => {
      // Fallback - update immediately even if pagination fails
      setTimeout(() => {
        updateActivityStatistics();
      }, 100);
    });
  } else {
    // No promise - update immediately with a small delay to ensure DOM is ready
    setTimeout(() => {
      updateActivityStatistics();
    }, 100);
  }

  window.Logger.info(`✅ טבלה עודכנה עם ${allMovements.length} תנועות`, { page: 'trading_accounts', keepInfo: true });
}

/**
 * Render a single movement row using FieldRendererService
 */
function renderMovementRow(movement, runningBalance) {
  const row = document.createElement('tr');

  // Store movement data as data attributes on row for statistics calculation
  row.setAttribute('data-movement-type', movement.type || '');
  row.setAttribute('data-movement-subtype', movement.sub_type || movement.subtype || movement.action || '');

  // Normalize amount based on subtype rules (each subtype has clear direction)
  const amountForStats = normalizeAmountBySubtype(
    movement.amount || '0',
    movement.type || '',
    movement.sub_type || movement.subtype || movement.action || '',
  );
  row.setAttribute('data-movement-amount', amountForStats.toString());

  // Ensure date envelope for consistent date handling
  const movementDateEnvelope = window.dateUtils?.ensureDateEnvelope 
    ? window.dateUtils.ensureDateEnvelope(movement.date) 
    : (movement.date && typeof movement.date === 'object' && (movement.date.epochMs || movement.date.utc || movement.date.local))
      ? movement.date
      : null;
  
  const movementDateValue = movementDateEnvelope?.utc || movementDateEnvelope?.local || movement.date || '';
  row.setAttribute('data-movement-date', movementDateValue);
  row.setAttribute('data-movement-id', movement.id || '');
  row.setAttribute('data-currency-symbol', movement.currency_symbol || 'USD');

  // Date - using FieldRendererService.renderDate (following standard pattern from trades.js, trade_plans.js, etc.)
  const dateCell = document.createElement('td');
  dateCell.className = 'col-date';
  dateCell.setAttribute('data-date', movementDateValue);
  
  // Use FieldRendererService.renderDate - prefer envelope if available, otherwise use raw date
  // Following the pattern from trades.js line 1084: FieldRendererService.renderDate(rawDate, false)
  if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
    // Prefer envelope if available (it's already normalized), otherwise use raw date
    // renderDate returns a string (not HTML), so we set it directly as textContent
    const dateToRender = movementDateEnvelope || movement.date;
    const dateDisplay = window.FieldRendererService.renderDate(dateToRender, false);
    dateCell.textContent = dateDisplay || '-';
  } else {
    // Fallback: use dateUtils for consistent date formatting
    if (movementDateEnvelope && window.dateUtils?.formatDate) {
      dateCell.textContent = window.dateUtils.formatDate(movementDateEnvelope, { includeTime: false });
    } else if (movementDateValue && window.dateUtils?.formatDate) {
      dateCell.textContent = window.dateUtils.formatDate(movementDateValue, { includeTime: false });
    } else if (movementDateValue) {
      // Last resort: use dateUtils.toDateObject for parsing
      let dateObj;
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateObj = window.dateUtils.toDateObject(movementDateValue);
      } else {
        dateObj = new Date(movementDateValue);
      }
      if (dateObj && !Number.isNaN(dateObj.getTime())) {
        if (window.dateUtils?.formatDate) {
          dateCell.textContent = window.dateUtils.formatDate(dateObj, { includeTime: false });
        } else {
          dateCell.textContent = dateObj.toLocaleDateString('he-IL');
        }
      } else {
        dateCell.textContent = '-';
      }
    } else {
      dateCell.textContent = '-';
    }
  }
  row.appendChild(dateCell);

  // Type
  const typeCell = document.createElement('td');
  typeCell.className = 'col-type';
  // שמירת סוג באנגלית לפילטר
  typeCell.setAttribute('data-type', movement.type || '');
  const rawSubtype = movement.sub_type || movement.subtype || movement.action || '';
  const subtypeKey = (rawSubtype || '').toLowerCase();
  const isOpeningBalance = movement.type === 'cash_flow' && subtypeKey === 'opening_balance';
  if (isOpeningBalance) {
    typeCell.textContent = 'מערכת';
  } else if (movement.type === 'cash_flow') {
    typeCell.textContent = 'תזרים מזומנים';
  } else if (movement.type === 'execution') {
    typeCell.textContent = 'ביצוע';
  } else {
    typeCell.textContent = movement.type || '-';
  }
  row.appendChild(typeCell);

  // Sub-type - using FieldRendererService.renderType for cash flows or renderAction for executions
  const subtypeCell = document.createElement('td');
  subtypeCell.className = 'col-subtype';
  // שמירת תת-סוג באנגלית לפילטר (יכול להיות רלוונטי לפילטר סוג)
  const subTypeValue = rawSubtype;
  subtypeCell.setAttribute('data-type', subTypeValue);
  const normalizedAmountForColor = normalizeAmountBySubtype(
    movement.amount || '0',
    movement.type || '',
    subTypeValue,
  );
  if (movement.type === 'cash_flow') {
    // Use renderType for cash flow subtypes (deposit, withdrawal, fee, etc.)
    if (window.FieldRendererService && window.FieldRendererService.renderType) {
      const typeHTML = window.FieldRendererService.renderType(subTypeValue, normalizedAmountForColor);
      const parser = new DOMParser();
      const doc = parser.parseFromString(typeHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        subtypeCell.appendChild(node.cloneNode(true));
      });
    } else {
      subtypeCell.textContent = getSubtypeDisplay(movement.sub_type || movement.subtype);
    }
  } else {
    // Use renderAction for execution actions (buy/sell) - with amount for color
    if (window.FieldRendererService && window.FieldRendererService.renderAction) {
      const actionHTML = window.FieldRendererService.renderAction(
        movement.sub_type || movement.subtype || movement.action,
        movement.amount, // Pass amount for color determination
      );
      const parser = new DOMParser();
      const doc = parser.parseFromString(actionHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
        subtypeCell.appendChild(node.cloneNode(true));
      });
    } else {
      subtypeCell.textContent = getSubtypeDisplay(movement.sub_type || movement.subtype || movement.action);
    }
  }
  row.appendChild(subtypeCell);

  // Ticker - show only symbol for executions, '-' for cash flows
  const tickerCell = document.createElement('td');
  tickerCell.className = 'col-ticker';

  if (movement.type === 'execution' && movement.ticker_symbol) {
    // Show only the ticker symbol (clickable link to details)
    const symbol = movement.ticker_symbol.trim();
    if (symbol && window.showEntityDetails && movement.ticker_id) {
      const span = document.createElement('span');
      span.style.cursor = 'pointer';
      span.style.color = 'var(--primary-color, #26baac)';
      span.style.textDecoration = 'underline';
      span.onclick = function() {
        if (window.showEntityDetails) {
          window.showEntityDetails('ticker', movement.ticker_id);
          return false;
        }
      };
      span.title = 'לחץ לצפייה בפרטי הטיקר';
      span.textContent = symbol;
      tickerCell.appendChild(span);
    } else {
      tickerCell.textContent = symbol;
    }
  } else {
    // Cash flow - no ticker
    tickerCell.textContent = '-';
  }
  row.appendChild(tickerCell);

  // Amount - using FieldRendererService.renderAmount
  const amountCell = document.createElement('td');
  amountCell.className = 'col-amount';
  // Convert currency code to symbol (USD -> $, ILS -> ₪, etc.)
  let currencySymbol = movement.currency_symbol || 'USD';
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
  // Normalize amount for display based on subtype rules (each subtype has clear direction)
  const displayAmount = normalizedAmountForColor;

  if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
    const amountHTML = window.FieldRendererService.renderAmount(displayAmount, currencySymbol, 0);
    const parser = new DOMParser();
    const doc = parser.parseFromString(amountHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
      amountCell.appendChild(node.cloneNode(true));
    });
  } else {
    amountCell.textContent = formatAmount(displayAmount);
    if (displayAmount < 0) {
      amountCell.classList.add('text-danger');
    } else {
      amountCell.classList.add('text-success');
    }
  }
  row.appendChild(amountCell);

  // Currency - always show symbol only
  const currencyCell = document.createElement('td');
  currencyCell.className = 'col-currency';
  currencyCell.textContent = currencySymbol;
  row.appendChild(currencyCell);

  // Running balance - using FieldRendererService.renderAmount
  const balanceCell = document.createElement('td');
  balanceCell.className = 'col-balance';
  if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
    const balanceHTML = window.FieldRendererService.renderAmount(runningBalance || 0, currencySymbol, 0);
    const parser = new DOMParser();
    const doc = parser.parseFromString(balanceHTML, 'text/html');
    doc.body.childNodes.forEach(node => {
      balanceCell.appendChild(node.cloneNode(true));
    });
  } else {
    balanceCell.textContent = formatAmount(runningBalance || 0);
    balanceCell.textContent += ' ' + currencySymbol;
  }
  row.appendChild(balanceCell);

  // Actions - simple details button (square button: width equals height)
  const actionsCell = document.createElement('td');
  actionsCell.className = 'col-actions actions-cell';
  if (isOpeningBalance) {
    const span = document.createElement('span');
    span.className = 'text-muted';
    span.textContent = '-';
    actionsCell.appendChild(span);
  } else {
    const button = document.createElement('button');
    button.className = 'btn btn-sm';
    button.onclick = function() { openMovementDetails(movement.id, movement.type); };
    button.title = 'פרטים';
    button.style.width = '2.5em';
    button.style.height = '2.5em';
    button.style.padding = '0';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.textContent = '👁️';
    actionsCell.appendChild(button);
  }
  row.appendChild(actionsCell);

  return row;
}

function renderAccountActivityRows(movements) {
  const tbody = document.querySelector('#accountActivityTable tbody');
  if (!tbody) {return;}

  const safeMovements = Array.isArray(movements) ? movements : [];

  if (!safeMovements.length) {
    tbody.textContent = '';
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 8;
    emptyCell.className = 'text-center';
    emptyCell.textContent = 'אין תנועות לחשבון זה';
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    return;
  }

  const fragment = document.createDocumentFragment();
  safeMovements.forEach(movement => {
    const row = renderMovementRow(movement, movement?._runningBalance);
    fragment.appendChild(row);
  });

  tbody.textContent = '';
  tbody.appendChild(fragment);
}

function syncAccountActivityPagination(movements) {
  const safeMovements = Array.isArray(movements) ? movements : [];

  if (typeof window.updateTableWithPagination === 'function') {
    try {
      const paginationPromise = window.updateTableWithPagination({
        tableId: 'accountActivityTable',
        tableType: 'account_activity',
        data: safeMovements,
        render: (pageData) => renderAccountActivityRows(pageData),
      });

      if (paginationPromise && typeof paginationPromise.then === 'function') {
        return paginationPromise
          .then(instance => {
            accountActivityPaginationInstance = instance;
            return instance;
          })
          .catch(error => {
            window.Logger?.warn('syncAccountActivityPagination: falling back to direct render', { error, page: 'trading_accounts' });
            renderAccountActivityRows(safeMovements);
            return null;
          });
      } else if (!paginationPromise) {
        renderAccountActivityRows(safeMovements);
      }

      return paginationPromise || Promise.resolve();
    } catch (error) {
      window.Logger?.warn('syncAccountActivityPagination: pagination system error', { error, page: 'trading_accounts' });
    }
  }

  renderAccountActivityRows(safeMovements);
  return Promise.resolve();
}

window.syncAccountActivityPagination = syncAccountActivityPagination;

/**
 * Update activity summary
 */
function updateActivitySummary(data) {
  // Always update date range in title first (works even if data is null)
  // Note: summaryDateRange might be inside a closed section, so we try to find it
  const tableTitleDateRange = document.getElementById('accountActivityDateRange');
  let summaryDateRange = document.getElementById('accountActivitySelectedRange');
  
  // If summaryDateRange not found, it might be in a closed section - try querySelector
  if (!summaryDateRange) {
    summaryDateRange = document.querySelector('#accountActivitySelectedRange');
  }
  
  if (tableTitleDateRange || summaryDateRange) {
    // Use filterSystem.currentFilters.dateRange (standard way to get date range)
    const dateRange = (window.filterSystem && window.filterSystem.currentFilters && window.filterSystem.currentFilters.dateRange) 
      || window.selectedDateRangeForFilter 
      || 'כל זמן';
    let startDate = null;
    // Use dateUtils for consistent date handling
    let endDate;
    if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
      endDate = window.dateUtils.getToday();
    } else {
      endDate = new Date(); // Today
    }

    // Get account opening date for "כל זמן" case
    let accountOpeningDate = null;
    if (window.accountActivityState && window.accountActivityState.selectedAccountId && window.trading_accountsData) {
      const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
      if (account && account.created_at) {
        // Handle DateEnvelope objects (server always returns DateEnvelope, not string)
        let parsed = null;
        if (account.created_at && typeof account.created_at === 'object' && (account.created_at.epochMs || account.created_at.utc || account.created_at.local)) {
          // It's already a DateEnvelope
          parsed = account.created_at;
        } else if (window.dateUtils?.toDateObject) {
          parsed = window.dateUtils.toDateObject(account.created_at);
        } else {
          parsed = new Date(account.created_at);
        }
        if (parsed && (parsed instanceof Date ? !Number.isNaN(parsed.getTime()) : true)) {
          accountOpeningDate = parsed;
        }
      }
    }

    if (dateRange !== 'כל זמן' && typeof window.translateDateRangeToDates === 'function') {
      const range = window.translateDateRangeToDates(dateRange);
      if (range) {
        // Handle DateEnvelope objects from translateDateRangeToDates
        if (range.startDate) {
          if (range.startDate && typeof range.startDate === 'object' && (range.startDate.epochMs || range.startDate.utc || range.startDate.local)) {
            startDate = range.startDate;
          } else {
            startDate = new Date(range.startDate);
          }
        }
        if (range.endDate) {
          if (range.endDate && typeof range.endDate === 'object' && (range.endDate.epochMs || range.endDate.utc || range.endDate.local)) {
            endDate = range.endDate;
          } else {
            endDate = new Date(range.endDate);
          }
        } else {
          endDate = window.dateUtils?.getToday ? window.dateUtils.getToday() : new Date();
        }
      }
    } else if (dateRange === 'כל זמן' && accountOpeningDate) {
      startDate = accountOpeningDate;
    }

    // Format date range for title using FieldRendererService.renderDate (standard date rendering)
    // FieldRendererService.renderDate handles DateEnvelope objects automatically
    window.Logger.info('🔵 [updateActivitySummary] Formatting dates', { 
      startDateType: startDate ? (typeof startDate) : 'null',
      endDateType: endDate ? (typeof endDate) : 'null',
      startDateIsEnvelope: startDate && typeof startDate === 'object' && (startDate.epochMs || startDate.utc || startDate.local),
      endDateIsEnvelope: endDate && typeof endDate === 'object' && (endDate.epochMs || endDate.utc || endDate.local),
      hasFieldRenderer: !!(window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function'),
      page: 'trading_accounts' 
    });
    let dateRangeDisplay = '';
    if (startDate && endDate) {
      // Use FieldRendererService.renderDate for consistent date formatting (handles DateEnvelope automatically)
      let startDateFormatted, endDateFormatted;
      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
        startDateFormatted = window.FieldRendererService.renderDate(startDate, false);
        endDateFormatted = window.FieldRendererService.renderDate(endDate, false);
        window.Logger.info('🔵 [updateActivitySummary] Dates formatted via FieldRendererService', { 
          startDateFormatted, 
          endDateFormatted, 
          page: 'trading_accounts' 
        });
      } else {
        const formatDateFn = window.dateUtils?.formatDate || window.formatDate;
        startDateFormatted = typeof formatDateFn === 'function'
          ? formatDateFn(startDate, { includeTime: false })
          : startDate.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateOnly = new Date(endDate);
        endDateOnly.setHours(0, 0, 0, 0);
        if (endDateOnly.getTime() === today.getTime()) {
          endDateFormatted = 'היום';
        } else {
          endDateFormatted = typeof formatDateFn === 'function'
            ? formatDateFn(endDate, { includeTime: false })
            : endDate.toLocaleDateString('he-IL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
        }
      }

      dateRangeDisplay = `${startDateFormatted} - ${endDateFormatted}`;
    } else if (dateRange !== 'כל זמן') {
      dateRangeDisplay = dateRange;
    } else {
      dateRangeDisplay = 'כל הזמנים';
    }

    window.Logger.info('🔵 [updateActivitySummary] Setting date range display', { 
      dateRangeDisplay, 
      hasTableTitleDateRange: !!tableTitleDateRange,
      hasSummaryDateRange: !!summaryDateRange,
      page: 'trading_accounts' 
    });

    if (tableTitleDateRange) {
      tableTitleDateRange.textContent = dateRangeDisplay;
      window.Logger.info('🔵 [updateActivitySummary] Updated tableTitleDateRange', { 
        elementId: tableTitleDateRange.id,
        textContent: dateRangeDisplay,
        page: 'trading_accounts' 
      });
    } else {
      window.Logger.warn('⚠️ [updateActivitySummary] tableTitleDateRange element not found', { 
        searchedId: 'accountActivityDateRange',
        page: 'trading_accounts' 
      });
    }

    if (summaryDateRange) {
      summaryDateRange.textContent = dateRangeDisplay;
      window.Logger.info('🔵 [updateActivitySummary] Updated summaryDateRange', { 
        elementId: summaryDateRange.id,
        textContent: dateRangeDisplay,
        page: 'trading_accounts' 
      });
    } else {
      window.Logger.warn('⚠️ [updateActivitySummary] summaryDateRange element not found', { 
        searchedId: 'accountActivitySelectedRange',
        page: 'trading_accounts' 
      });
    }
  }

  // Update table count (always update, even if no data - show 0)
  const tableCount = document.getElementById('accountActivityCount');

  if (tableCount) {
    // Get count and currencies (default to 0 if no data)
    const count = data && data.currencies
      ? data.currencies.reduce((sum, curr) => sum + (curr.movements?.length || 0), 0)
      : 0;
    const currencies = data && data.currencies ? data.currencies.length : 0;

    // Get date range information (always calculate, even if no data)
    // Use filterSystem.currentFilters.dateRange (standard way to get date range)
    let dateRangeText = '';
    const dateRange = (window.filterSystem && window.filterSystem.currentFilters && window.filterSystem.currentFilters.dateRange) 
      || window.selectedDateRangeForFilter 
      || 'כל זמן';
    let startDate = null;
    // Use dateUtils for consistent date handling
    let endDate;
    if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
      endDate = window.dateUtils.getToday();
    } else {
      endDate = new Date(); // Today
    }

    // Get account opening date for "כל זמן" case
    let accountOpeningDate = null;
    if (window.accountActivityState && window.accountActivityState.selectedAccountId && window.trading_accountsData) {
      const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
      if (account && account.created_at) {
        const parsed = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(account.created_at) : new Date(account.created_at);
        if (parsed && !Number.isNaN(parsed.getTime())) {
          accountOpeningDate = parsed;
        }
      }
    }

    if (dateRange !== 'כל זמן' && typeof window.translateDateRangeToDates === 'function') {
      const range = window.translateDateRangeToDates(dateRange);
      if (range) {
        startDate = range.startDate ? new Date(range.startDate) : null;
        endDate = range.endDate ? new Date(range.endDate) : new Date();
      }
    } else if (dateRange === 'כל זמן' && accountOpeningDate) {
      startDate = accountOpeningDate;
    }

    // Format dates and calculate days using FieldRendererService.renderDate (standard date rendering)
    if (startDate && endDate) {
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      // Use FieldRendererService.renderDate for consistent date formatting
      let startDateFormatted, endDateFormatted;
      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
        startDateFormatted = window.FieldRendererService.renderDate(startDate, false);
        endDateFormatted = window.FieldRendererService.renderDate(endDate, false);
      } else {
        const formatDateFn = window.dateUtils?.formatDate || window.formatDate;
        startDateFormatted = typeof formatDateFn === 'function'
          ? formatDateFn(startDate, { includeTime: false })
          : startDate.toLocaleDateString('he-IL');
        endDateFormatted = typeof formatDateFn === 'function'
          ? formatDateFn(endDate, { includeTime: false })
          : endDate.toLocaleDateString('he-IL');
      }

      dateRangeText = ` | ${startDateFormatted} - ${endDateFormatted} (${daysDiff} ימים)`;
    } else if (dateRange !== 'כל זמן') {
      // Fallback: show the date range text if dates couldn't be calculated
      dateRangeText = ` | ${dateRange}`;
    }

    tableCount.textContent = `${count} תנועות ב-${currencies} מטבעות${dateRangeText}`;
  }
}

/**
 * Update currency balances footer using FieldRendererService
 */
function updateCurrencyBalancesFooter(data) {
  const footer = document.getElementById('accountActivityFooter');
  const summaryCell = document.getElementById('currencyBalancesSummary');
  const baseTotalCell = document.getElementById('baseCurrencyTotal');

  if (!footer || !summaryCell || !baseTotalCell) {return;}

  // Helper function to convert currency code to symbol
  const getCurrencySymbol = currencyCode => {
    if (!currencyCode || currencyCode.length <= 1) {return currencyCode || '$';}
    switch (currencyCode.toUpperCase()) {
    case 'USD': return '$';
    case 'ILS': return '₪';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return currencyCode; // If already a symbol, return as is
    }
  };

  // Build currency balances summary using FieldRendererService
  let summaryHTML = '';
  data.currencies.forEach(currency => {
    const symbol = getCurrencySymbol(currency.currency_symbol || 'USD');
    const balance = currency.balance || 0;
    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
      summaryHTML += `<div><strong>${symbol}:</strong> ${window.FieldRendererService.renderAmount(balance, symbol, 0)}</div>`;
    } else {
      summaryHTML += `<div><strong>${symbol}:</strong> ${formatAmount(balance)}</div>`;
    }
  });
  const parser = new DOMParser();
  const doc = parser.parseFromString(summaryHTML, 'text/html');
  summaryCell.textContent = '';
  doc.body.childNodes.forEach(node => {
    summaryCell.appendChild(node.cloneNode(true));
  });

  // Base currency total using FieldRendererService
  const baseSymbol = getCurrencySymbol(data.base_currency || 'USD');
  if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
    const amountHTML = window.FieldRendererService.renderAmount(data.base_currency_total || 0, baseSymbol, 0);
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<strong>${amountHTML}</strong>`, 'text/html');
    baseTotalCell.textContent = '';
    doc.body.childNodes.forEach(node => {
      baseTotalCell.appendChild(node.cloneNode(true));
    });
  } else {
    baseTotalCell.textContent = '';
    const strong = document.createElement('strong');
    strong.textContent = `${formatAmount(data.base_currency_total || 0)} ${baseSymbol}`;
    baseTotalCell.appendChild(strong);
  }

  // Show rates used if available
  if (data.exchange_rates_used && Object.keys(data.exchange_rates_used).length > 0) {
    let ratesText = ' (שערים: ';
    ratesText += Object.entries(data.exchange_rates_used)
      .map(([curr, rate]) => `${curr}=${rate}`)
      .join(', ');
    ratesText += ')';
    baseTotalCell.innerHTML += ratesText;
  }

  footer.style.display = 'table-row-group';
}

/**
 * Open movement details in EntityDetailsModal
 */
function openMovementDetails(movementId, movementType) {
  if (!movementId || typeof movementId === 'string' && movementId.startsWith('opening-balance')) {
    window.Logger.debug('Skipping details for opening balance movement', { movementId, movementType, page: 'trading_accounts' });
    return;
  }

  // Map movement type to entity type
  const entityType = movementType === 'cash_flow' ? 'cash_flow' : 'execution';

  // שימוש במערכת המרכזית Entity Details Modal
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails(entityType, movementId, { mode: 'view' });
  } else {
    window.Logger?.error('showEntityDetails לא זמין', { page: 'trading_accounts' });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'מערכת פרטי ישויות לא זמינה');
    }
  }
}

/**
 * Clear activity table
 */
function clearActivityTable() {
  const tbody = document.querySelector('#accountActivityTable tbody');
  if (tbody) {
    tbody.textContent = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.className = 'loading';
    cell.textContent = 'בחר חשבון מסחר להצגת תנועות...';
    row.appendChild(cell);
    tbody.appendChild(row);
  }

  const footer = document.getElementById('accountActivityFooter');
  if (footer) {
    footer.style.display = 'none';
  }

  const tableCount = document.getElementById('accountActivityCount');
  if (tableCount) {
    tableCount.textContent = 'בחר חשבון מסחר...';
  }
}

/**
 * Show error in table
 */
function showErrorInTable(message) {
  const tbody = document.querySelector('#accountActivityTable tbody');
  if (tbody) {
    tbody.textContent = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.className = 'text-center text-danger';
    cell.textContent = message;
    row.appendChild(cell);
    tbody.appendChild(row);
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) {return '-';}

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Format amount for display
 */
function formatAmount(amount) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return amount.toLocaleString('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get subtype display text
 */
function getSubtypeDisplay(subtype) {
  const translations = {
    // Cash flow subtypes
    'deposit': 'הפקדה',
    'withdrawal': 'משיכה',
    'deposits_withdrawals': 'הפקדה ומשיכה',
    'fee': 'עמלה',
    'dividend': 'דיבידנד',
    'interest': 'ריבית',
    'syep_interest': 'ריבית SYEP',
    'transfer_in': 'העברה פנימה',
    'transfer_out': 'העברה החוצה',
    'currency_exchange_from': 'המרת מט״ח - יציאה',
    'currency_exchange_to': 'המרת מט״ח - כניסה',
    'other_positive': 'אחר חיובי',
    'other_negative': 'אחר שלילי',
    'opening_balance': 'יתרת פתיחה',
    // Execution subtypes
    'buy': 'קנייה',
    'sell': 'מכירה',
  };

  return translations[subtype] || subtype || '-';
}

/**
 * Normalize amount based on subtype rules
 * Each subtype has a clear direction (always positive or always negative)
 * @param {number} amount - Original amount
 * @param {string} type - Movement type ('cash_flow' or 'execution')
 * @param {string} subtype - Subtype value
 * @returns {number} Normalized amount with correct sign
 */
function normalizeAmountBySubtype(amount, type, subtype) {
  const amountNum = parseFloat(amount || '0');
  const subTypeValue = (subtype || '').toLowerCase();

  // Cash flow subtypes - clear direction for each
  if (type === 'cash_flow') {
    // Always positive or neutral (if 0)
    // Deposit: always positive (money coming in), neutral if 0
    if (subTypeValue === 'deposit' || subTypeValue === 'הפקדה') {
      return amountNum === 0 ? 0 : Math.abs(amountNum);
    }

    if (subTypeValue === 'opening_balance' || subTypeValue === 'יתרת פתיחה') {
      return amountNum === 0 ? 0 : Math.abs(amountNum);
    }

    // Always negative or neutral (if 0)
    // Withdrawal: always negative (money going out), neutral if 0
    if (subTypeValue === 'withdrawal' || subTypeValue === 'משיכה') {
      return amountNum === 0 ? 0 : -Math.abs(amountNum);
    }

    // Always positive (money coming in)
    if (subTypeValue === 'dividend' || subTypeValue === 'דיבידנד' ||
            subTypeValue === 'transfer_in' || subTypeValue === 'העברה פנימה' ||
            subTypeValue === 'other_positive' || subTypeValue === 'אחר חיובי' ||
            subTypeValue === 'currency_exchange_to') {
      return Math.abs(amountNum);
    }

    // Always negative (money going out)
    if (subTypeValue === 'fee' || subTypeValue === 'עמלה' ||
            subTypeValue === 'transfer_out' || subTypeValue === 'העברה החוצה' ||
            subTypeValue === 'other_negative' || subTypeValue === 'אחר שלילי' ||
            subTypeValue === 'currency_exchange_from') {
      return -Math.abs(amountNum);
    }

    // Interest can be positive or negative - keep original sign
    if (
      subTypeValue === 'interest' ||
      subTypeValue === 'syep_interest' ||
      subTypeValue === 'ריבית' ||
      subTypeValue === 'ריבית syep'
    ) {
      return amountNum; // Keep original sign (can be positive or negative)
    }

    // 'other' - keep original sign
    if (subTypeValue === 'other' || subTypeValue === 'אחר') {
      return amountNum; // Keep original sign
    }

    // Default for other cash flow subtypes - keep original sign
    return amountNum;
  }

  // Execution subtypes - clear direction for each
  if (type === 'execution') {
    // Buy - always negative (money going out)
    if (subTypeValue === 'buy' || subTypeValue === 'קנייה') {
      return -Math.abs(amountNum);
    }

    // Sell/Short/Cover - always positive (money coming in)
    if (subTypeValue === 'sell' || subTypeValue === 'short' || subTypeValue === 'cover' ||
            subTypeValue === 'מכירה') {
      return Math.abs(amountNum);
    }

    // Default - keep original sign
    return amountNum;
  }

  // Default - keep original sign
  return amountNum;
}

/**
 * Calculate activity statistics from processed movements
 * @returns {Object} Statistics object with cash flows and executions data
 */
function calculateActivityStatistics() {
  // Use processedMovements as the source of truth (all movements, not just visible ones)
  const allMovements = window.accountActivityState?.processedMovements || [];
  
  // Get filter date range - use filterSystem.currentFilters.dateRange (standard way)
  const dateRange = (window.filterSystem && window.filterSystem.currentFilters && window.filterSystem.currentFilters.dateRange)
    || window.selectedDateRangeForFilter
    || 'כל זמן';
  let startDate = null;
  let endDate = new Date(); // Today

  // Get account opening date for "כל זמן" case
  let accountOpeningDate = null;
  if (window.accountActivityState?.selectedAccountId && window.trading_accountsData) {
    const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
    if (account && account.created_at) {
      const parsed = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(account.created_at) : new Date(account.created_at);
      if (parsed && !Number.isNaN(parsed.getTime())) {
        accountOpeningDate = parsed;
      }
    }
  }

  if (dateRange !== 'כל זמן' && typeof window.translateDateRangeToDates === 'function') {
    const range = window.translateDateRangeToDates(dateRange);
    if (range) {
      startDate = range.startDate ? new Date(range.startDate) : null;
      endDate = range.endDate ? new Date(range.endDate) : new Date();
    }
  }

  // If "כל זמן", use account opening date to today
  if (dateRange === 'כל זמן' && accountOpeningDate) {
    startDate = accountOpeningDate;
  }

  // Create empty stats structure with all required fields
  const emptyStats = {
    totalCount: 0,
    totalAmount: 0,
    positiveAmount: 0,
    negativeAmount: 0,
    positiveCount: 0,
    negativeCount: 0,
    bySubtype: {},
    firstRecord: null,
    lastRecord: null,
    dateRange: { start: startDate, end: endDate },
    overallPercentageChange: 0,
    overallAmountChange: 0,
    overallAnnualizedChange: 0,
    currency: 'USD',
  };

  if (!allMovements || allMovements.length === 0) {
    window.Logger.info('📊 אין תנועות מחושבות לחישוב סטטיסטיקות', { page: 'trading_accounts' });
    return { cashFlows: emptyStats, executions: emptyStats };
  }

  window.Logger.info(`📊 חישוב סטטיסטיקות מ-${allMovements.length} תנועות מחושבות`, { page: 'trading_accounts' });

  // Log date range for debugging
  window.Logger.info('📅 טווח זמן לחישוב סטטיסטיקות:', { page: 'trading_accounts' });
  window.Logger.info(`  - פילטר נבחר: ${dateRange}`, { page: 'trading_accounts' });
  window.Logger.info(`  - תאריך התחלה: ${startDate ? startDate.toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
  window.Logger.info(`  - תאריך סיום: ${endDate ? endDate.toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
  if (startDate && endDate) {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    window.Logger.info(`  - מספר ימים בטווח: ${daysDiff}`, { page: 'trading_accounts' });
  }
  window.Logger.info(`  - תאריך פתיחת חשבון: ${accountOpeningDate ? accountOpeningDate.toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });

  // Separate movements by type
  const cashFlowMovements = allMovements.filter(m => m.type === 'cash_flow');
  const executionMovements = allMovements.filter(m => m.type === 'execution');

  // Filter by date range - only filter if we have explicit date range from filter (not default "כל זמן")
  const filterByDateRange = (movementsList, start, end) => movementsList.filter(movement => {
    if (!movement.date) {return false;}
    
    // Use dateUtils for consistent date parsing
    let rowDate;
    if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
      rowDate = window.dateUtils.toDateObject(movement.date);
    } else {
      rowDate = new Date(movement.date);
    }
    
    if (!rowDate || Number.isNaN(rowDate.getTime())) {return false;}
    
    // Only filter if we have explicit start date (meaning user selected a date range, not "כל זמן")
    if (start) {
      // Set start of day for comparison
      const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      if (rowDateOnly < startDateOnly) {return false;}
    }
    
    // Only filter by end date if we have explicit end date (not today by default for "כל זמן")
    if (end && dateRange !== 'כל זמן') {
      // Set end of day for comparison
      const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      if (rowDateOnly > endDateOnly) {return false;}
    }
    
    return true;
  });

  // Only apply date filter if user selected a specific date range (not "כל זמן")
  const shouldFilterByDate = dateRange !== 'כל זמן' && (startDate || (endDate && dateRange !== 'כל זמן'));
  const filteredCashFlowMovements = shouldFilterByDate ? filterByDateRange(cashFlowMovements, startDate, endDate) : cashFlowMovements;
  const filteredExecutionMovements = shouldFilterByDate ? filterByDateRange(executionMovements, startDate, endDate) : executionMovements;
  
  window.Logger.info(`📊 תנועות מסננות: ${filteredCashFlowMovements.length} cash flows, ${filteredExecutionMovements.length} executions`, { page: 'trading_accounts' });

  // Helper to calculate statistics for a type
  const calculateStatsForType = (filteredMovements, typeName) => {
    if (!filteredMovements || filteredMovements.length === 0) {
      window.Logger.info(`📊 ${typeName} - אין תנועות מסוננות`, { page: 'trading_accounts' });
      // Get currency from account or default to USD
      let defaultCurrency = 'USD';
      if (window.accountActivityState?.selectedAccountId && window.trading_accountsData) {
        const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
        if (account && account.currency) {
          defaultCurrency = account.currency;
        }
      }
      return {
        totalCount: 0,
        totalAmount: 0,
        positiveAmount: 0,
        negativeAmount: 0,
        positiveCount: 0,
        negativeCount: 0,
        bySubtype: {},
        firstRecord: null,
        lastRecord: null,
        dateRange: { start: startDate, end: endDate },
        overallPercentageChange: 0,
        overallAmountChange: 0,
        overallAnnualizedChange: 0,
        currency: defaultCurrency,
      };
    }

    // Log dateRange for debugging
    window.Logger.info(`  - stats.dateRange: start=${startDate ? new Date(startDate).toISOString().split('T')[0] : 'null'}, end=${endDate ? new Date(endDate).toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });

    // Map movements to format needed for statistics (already have the data, just normalize it)
    const movements = filteredMovements.map(m => ({
      id: m.id,
      type: m.type,
      subtype: m.sub_type || m.subtype || m.action || '',
      amount: parseFloat(m.amount || '0'),
      date: m.date,
      currency: m.currency_symbol || m.currency || 'USD',
    }));

    // Sort by date (oldest first)
    movements.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateA - dateB;
    });

    const firstRecord = movements[0];
    const lastRecord = movements[movements.length - 1];

    // Log first and last records for debugging
    window.Logger.info(`📊 ${typeName} - רשומות בתקופה:`, { page: 'trading_accounts' });
    window.Logger.info(`  - מספר רשומות: ${movements.length}`, { page: 'trading_accounts' });
    if (firstRecord) {
      window.Logger.info(`  - רשומה ראשונה: ${firstRecord.date}, סכום: ${firstRecord.amount}`, { page: 'trading_accounts' });
    }
    if (lastRecord) {
      window.Logger.info(`  - רשומה אחרונה: ${lastRecord.date}, סכום: ${lastRecord.amount}`, { page: 'trading_accounts' });
    }

    // Calculate totals
    const totalAmount = movements.reduce((sum, m) => sum + m.amount, 0);
    window.Logger.info(`  - סה"כ סכום: ${totalAmount}`, { page: 'trading_accounts' });

    // Calculate positive and negative amounts separately
    const positiveAmounts = movements.filter(m => m.amount >= 0).reduce((sum, m) => sum + m.amount, 0);
    const negativeAmounts = movements.filter(m => m.amount < 0).reduce((sum, m) => sum + m.amount, 0);
    const positiveCount = movements.filter(m => m.amount >= 0).length;
    const negativeCount = movements.filter(m => m.amount < 0).length;

    // Group by subtype
    // IMPORTANT: Merge related subtypes into single groups:
    // - 'deposit' and 'withdrawal' into 'deposits_withdrawals'
    const bySubtype = {};
    movements.forEach(m => {
      let subtype = (m.subtype || (m.amount >= 0 ? 'other_positive' : 'other_negative')).toLowerCase();

      // Merge 'deposit' and 'withdrawal' into 'deposits_withdrawals'
      if (subtype === 'deposit' || subtype === 'withdrawal') {
        subtype = 'deposits_withdrawals';
      }

      if (!bySubtype[subtype]) {
        bySubtype[subtype] = {
          count: 0,
          totalAmount: 0,
          movements: [],
        };
      }
      bySubtype[subtype].count++;
      bySubtype[subtype].totalAmount += m.amount;
      bySubtype[subtype].movements.push(m);
      // Calculate positive/negative counts and amounts for each subtype
      if (!bySubtype[subtype].positiveAmount) {bySubtype[subtype].positiveAmount = 0;}
      if (!bySubtype[subtype].negativeAmount) {bySubtype[subtype].negativeAmount = 0;}
      if (!bySubtype[subtype].positiveCount) {bySubtype[subtype].positiveCount = 0;}
      if (!bySubtype[subtype].negativeCount) {bySubtype[subtype].negativeCount = 0;}

      if (m.amount >= 0) {
        bySubtype[subtype].positiveAmount += m.amount;
        bySubtype[subtype].positiveCount++;
      } else {
        bySubtype[subtype].negativeAmount += m.amount;
        bySubtype[subtype].negativeCount++;
      }
    });

    // Calculate changes for each subtype
    Object.keys(bySubtype).forEach(subtype => {
      const subtypeMovements = bySubtype[subtype].movements.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });

      if (subtypeMovements.length > 0) {
        const first = subtypeMovements[0];
        const last = subtypeMovements[subtypeMovements.length - 1];

        const firstAmount = first.amount;
        const lastAmount = last.amount;

        // Calculate percentage change
        let percentageChange = 0;
        if (firstAmount !== 0) {
          percentageChange = (lastAmount - firstAmount) / Math.abs(firstAmount) * 100;
        } else if (lastAmount !== 0) {
          percentageChange = lastAmount > 0 ? 100 : -100;
        }

        // Calculate amount change
        const amountChange = lastAmount - firstAmount;

        // Calculate days in range
        let daysInRange = 1;
        if (first.date && last.date) {
          const startDate = new Date(first.date);
          const endDate = new Date(last.date);
          daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        } else if (startDate && endDate) {
          daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        }

        // Calculate annualized change
        const annualizedChange = percentageChange / daysInRange * 365;

        bySubtype[subtype].firstAmount = firstAmount;
        bySubtype[subtype].lastAmount = lastAmount;
        bySubtype[subtype].percentageChange = percentageChange;
        bySubtype[subtype].amountChange = amountChange;
        bySubtype[subtype].annualizedChange = annualizedChange;
        bySubtype[subtype].daysInRange = daysInRange;
      }
    });

    // Calculate overall changes (first record vs last record of same type)
    let overallPercentageChange = 0;
    let overallAmountChange = 0;
    let overallAnnualizedChange = 0;

    if (firstRecord && lastRecord && firstRecord !== lastRecord) {
      const firstAmount = firstRecord.amount;
      const lastAmount = lastRecord.amount;

      // Calculate percentage change: (last - first) / |first| * 100
      if (firstAmount !== 0) {
        overallPercentageChange = (lastAmount - firstAmount) / Math.abs(firstAmount) * 100;
      } else if (lastAmount !== 0) {
        overallPercentageChange = lastAmount > 0 ? 100 : -100;
      }

      // Calculate amount change: last - first
      overallAmountChange = lastAmount - firstAmount;

      // Calculate days between first and last record
      let daysInRange = 1;
      if (firstRecord.date && lastRecord.date) {
        const startDateObj = new Date(firstRecord.date);
        const endDateObj = new Date(lastRecord.date);
        daysInRange = Math.max(1, Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)));
      } else if (startDate && endDate) {
        daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      }

      // Calculate annualized change: (percentage_change / days) * 365
      overallAnnualizedChange = overallPercentageChange / daysInRange * 365;
    }

    return {
      totalCount: filteredMovements.length,
      totalAmount,
      positiveAmount: positiveAmounts,
      negativeAmount: negativeAmounts,
      positiveCount,
      negativeCount,
      bySubtype,
      firstRecord,
      lastRecord,
      dateRange: { start: startDate, end: endDate },
      overallPercentageChange,
      overallAmountChange,
      overallAnnualizedChange,
      currency: movements.length > 0 ? movements[0].currency : 'USD',
    };
  };

  const cashFlowsStats = calculateStatsForType(filteredCashFlowMovements, 'cash_flow');
  const executionsStats = calculateStatsForType(filteredExecutionMovements, 'execution');

  return {
    cashFlows: cashFlowsStats,
    executions: executionsStats,
  };
}

/**
 * Update activity statistics display
 */
function updateActivityStatistics() {
  window.Logger.info('🔵 [updateActivityStatistics] START', { page: 'trading_accounts' });
  const statsCard = document.getElementById('accountActivityStatisticsCard');
  if (!statsCard) {
    window.Logger.warn('⚠️ Statistics card not found', { page: 'trading_accounts' });
    return;
  }

  const stats = calculateActivityStatistics();
  window.Logger.info('🔵 [updateActivityStatistics] stats calculated', { 
    cashFlowsCount: stats.cashFlows?.totalCount || 0,
    executionsCount: stats.executions?.totalCount || 0,
    cashFlowsBySubtype: stats.cashFlows?.bySubtype ? Object.keys(stats.cashFlows.bySubtype) : [],
    page: 'trading_accounts' 
  });

  // Always show card, even if no data (will show "אין נתונים להצגה")
  statsCard.style.display = 'block';

  // Calculate overall statistics (combining cash flows + executions)
  const overallStats = combineStatistics(stats.cashFlows, stats.executions);

  // Render overall summary: main summary in two columns
  // Column 1: מספר רשומות + סה"כ סכום (for all records)
  // Column 2: ממוצע לפעולה + שנתי משוער (for all records with breakdown)
  const overallContent = document.getElementById('overallStatisticsContent');
  if (overallContent) {
    const html1 = renderStatisticsSummaryColumn1(overallStats, 'סיכום כללי');
    const parser = new DOMParser();
    const doc1 = parser.parseFromString(html1, 'text/html');
    overallContent.textContent = '';
    doc1.body.childNodes.forEach(node => {
      overallContent.appendChild(node.cloneNode(true));
    });
  }

  const overallContent2 = document.getElementById('overallStatisticsContent2');
  if (overallContent2) {
    const html2 = renderStatisticsSummaryColumn2(overallStats, 'סיכום כללי');
    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');
    overallContent2.textContent = '';
    doc2.body.childNodes.forEach(node => {
      overallContent2.appendChild(node.cloneNode(true));
    });
  }

  // Render cash flows: main summary - TWO cards, split content
  // Column 1: מספר רשומות + סה"כ סכום
  // Column 2: ממוצע לפעולה + שנתי משוער
  const cashFlowsContent = document.getElementById('cashFlowsStatisticsContent');
  if (cashFlowsContent) {
    // Column 1: מספר רשומות + סה"כ סכום
    const html3 = renderStatisticsSummaryColumn1(stats.cashFlows, 'תזרימי מזומנים');
    const parser3 = new DOMParser();
    const doc3 = parser3.parseFromString(html3, 'text/html');
    cashFlowsContent.textContent = '';
    doc3.body.childNodes.forEach(node => {
      cashFlowsContent.appendChild(node.cloneNode(true));
    });
  }

  const cashFlowsContent2 = document.getElementById('cashFlowsStatisticsContent2');
  if (cashFlowsContent2) {
    // Column 2: ממוצע לפעולה + שנתי משוער
    const html4 = renderStatisticsSummaryColumn2(stats.cashFlows, 'תזרימי מזומנים');
    const parser4 = new DOMParser();
    const doc4 = parser4.parseFromString(html4, 'text/html');
    cashFlowsContent2.textContent = '';
    doc4.body.childNodes.forEach(node => {
      cashFlowsContent2.appendChild(node.cloneNode(true));
    });
  }

  // Render cash flows breakdown by subtype in two columns
  const cashFlowsBreakdown1 = document.getElementById('cashFlowsBreakdownContent1');
  if (cashFlowsBreakdown1) {
    const cashFlowsColumn1 = splitCashFlowsByColumn(stats.cashFlows, 1);
    const html5 = renderBreakdownBySubtype(cashFlowsColumn1, 'תזרימי מזומנים', 1);
    const parser5 = new DOMParser();
    const doc5 = parser5.parseFromString(html5, 'text/html');
    cashFlowsBreakdown1.textContent = '';
    doc5.body.childNodes.forEach(node => {
      cashFlowsBreakdown1.appendChild(node.cloneNode(true));
    });
  }

  const cashFlowsBreakdown2 = document.getElementById('cashFlowsBreakdownContent2');
  if (cashFlowsBreakdown2) {
    window.Logger.info('🔵 [updateActivityStatistics] Rendering cashFlowsBreakdownContent2', { page: 'trading_accounts' });
    const cashFlowsColumn2 = splitCashFlowsByColumn(stats.cashFlows, 2);
    window.Logger.info('🔵 [updateActivityStatistics] cashFlowsColumn2', { 
      totalCount: cashFlowsColumn2?.totalCount || 0,
      bySubtype: cashFlowsColumn2?.bySubtype ? Object.keys(cashFlowsColumn2.bySubtype) : [],
      page: 'trading_accounts' 
    });
    const html6 = renderBreakdownBySubtype(cashFlowsColumn2, 'תזרימי מזומנים', 2);
    window.Logger.info('🔵 [updateActivityStatistics] html6 length', { htmlLength: html6?.length || 0, page: 'trading_accounts' });
    const parser6 = new DOMParser();
    const doc6 = parser6.parseFromString(html6, 'text/html');
    cashFlowsBreakdown2.textContent = '';
    doc6.body.childNodes.forEach(node => {
      cashFlowsBreakdown2.appendChild(node.cloneNode(true));
    });
    window.Logger.info('🔵 [updateActivityStatistics] cashFlowsBreakdownContent2 rendered', { 
      childNodesCount: cashFlowsBreakdown2.childNodes.length,
      page: 'trading_accounts' 
    });
  } else {
    window.Logger.warn('⚠️ [updateActivityStatistics] cashFlowsBreakdownContent2 element not found', { page: 'trading_accounts' });
  }

  // Render executions: main summary - TWO cards, split content (same structure as cash flows)
  // Column 1: מספר רשומות + סה"כ סכום (for all executions)
  // Column 2: ממוצע לפעולה + שנתי משוער (for all executions with breakdown by buy/sell)
  const executionsContentBuy = document.getElementById('executionsStatisticsContentBuy');
  if (executionsContentBuy) {
    // Column 1: מספר רשומות + סה"כ סכום (full stats)
    const html7 = renderStatisticsSummaryColumn1(stats.executions, 'ביצועים');
    const parser7 = new DOMParser();
    const doc7 = parser7.parseFromString(html7, 'text/html');
    executionsContentBuy.textContent = '';
    doc7.body.childNodes.forEach(node => {
      executionsContentBuy.appendChild(node.cloneNode(true));
    });
  }

  const executionsContentSell = document.getElementById('executionsStatisticsContentSell');
  if (executionsContentSell) {
    // Column 2: ממוצע לפעולה + שנתי משוער (full stats with breakdown)
    const html8 = renderStatisticsSummaryColumn2(stats.executions, 'ביצועים');
    const parser8 = new DOMParser();
    const doc8 = parser8.parseFromString(html8, 'text/html');
    executionsContentSell.textContent = '';
    doc8.body.childNodes.forEach(node => {
      executionsContentSell.appendChild(node.cloneNode(true));
    });
  }

  // Render executions breakdown by subtype (buy/sell)
  const executionsBreakdown1 = document.getElementById('executionsBreakdownContent1');
  if (executionsBreakdown1) {
    const executionsBuy = splitExecutionsByAction(stats.executions, 'buy');
    const html9 = renderBreakdownBySubtype(executionsBuy, 'ביצועים', 'buy');
    const parser9 = new DOMParser();
    const doc9 = parser9.parseFromString(html9, 'text/html');
    executionsBreakdown1.textContent = '';
    doc9.body.childNodes.forEach(node => {
      executionsBreakdown1.appendChild(node.cloneNode(true));
    });
  }

  const executionsBreakdown2 = document.getElementById('executionsBreakdownContent2');
  if (executionsBreakdown2) {
    const executionsSell = splitExecutionsByAction(stats.executions, 'sell');
    const html10 = renderBreakdownBySubtype(executionsSell, 'ביצועים', 'sell');
    const parser10 = new DOMParser();
    const doc10 = parser10.parseFromString(html10, 'text/html');
    executionsBreakdown2.textContent = '';
    doc10.body.childNodes.forEach(node => {
      executionsBreakdown2.appendChild(node.cloneNode(true));
    });
  }

  // Update activity summary header (with date range)
  // Always update summary even if data hasn't changed, to refresh date range display
  if (window.accountActivityState && window.accountActivityState.activityData) {
    updateActivitySummary(window.accountActivityState.activityData);
  } else {
    // If no data, still update the date range in title (it will show placeholder)
    updateActivitySummary(null);
  }
}

/**
 * Combine statistics from cash flows and executions into overall summary
 * @param {Object} cashFlowsStats - Cash flows statistics
 * @param {Object} executionsStats - Executions statistics
 * @returns {Object} Combined statistics object
 */
function combineStatistics(cashFlowsStats, executionsStats) {
  if (!cashFlowsStats || !executionsStats) {
    return cashFlowsStats || executionsStats || {};
  }

  // Combine totals
  const totalCount = (cashFlowsStats.totalCount || 0) + (executionsStats.totalCount || 0);
  const totalAmount = (cashFlowsStats.totalAmount || 0) + (executionsStats.totalAmount || 0);
  const positiveAmount = (cashFlowsStats.positiveAmount || 0) + (executionsStats.positiveAmount || 0);
  const negativeAmount = (cashFlowsStats.negativeAmount || 0) + (executionsStats.negativeAmount || 0);
  const positiveCount = (cashFlowsStats.positiveCount || 0) + (executionsStats.positiveCount || 0);
  const negativeCount = (cashFlowsStats.negativeCount || 0) + (executionsStats.negativeCount || 0);

  // Use the earliest first record and latest last record
  let firstRecord = null;
  let lastRecord = null;

  if (cashFlowsStats.firstRecord && executionsStats.firstRecord) {
    const cashFlowDate = new Date(cashFlowsStats.firstRecord.date || 0);
    const executionDate = new Date(executionsStats.firstRecord.date || 0);
    firstRecord = cashFlowDate < executionDate ? cashFlowsStats.firstRecord : executionsStats.firstRecord;
  } else {
    firstRecord = cashFlowsStats.firstRecord || executionsStats.firstRecord;
  }

  if (cashFlowsStats.lastRecord && executionsStats.lastRecord) {
    const cashFlowDate = new Date(cashFlowsStats.lastRecord.date || 0);
    const executionDate = new Date(executionsStats.lastRecord.date || 0);
    lastRecord = cashFlowDate > executionDate ? cashFlowsStats.lastRecord : executionsStats.lastRecord;
  } else {
    lastRecord = cashFlowsStats.lastRecord || executionsStats.lastRecord;
  }

  // Use the earliest date range start and latest date range end
  let dateRangeStart = null;
  let dateRangeEnd = null;

  if (cashFlowsStats.dateRange && executionsStats.dateRange) {
    dateRangeStart = cashFlowsStats.dateRange.start && executionsStats.dateRange.start
      ? new Date(Math.min(cashFlowsStats.dateRange.start, executionsStats.dateRange.start))
      : cashFlowsStats.dateRange.start || executionsStats.dateRange.start;
    dateRangeEnd = cashFlowsStats.dateRange.end && executionsStats.dateRange.end
      ? new Date(Math.max(cashFlowsStats.dateRange.end, executionsStats.dateRange.end))
      : cashFlowsStats.dateRange.end || executionsStats.dateRange.end;
  } else {
    dateRangeStart = cashFlowsStats.dateRange?.start || executionsStats.dateRange?.start;
    dateRangeEnd = cashFlowsStats.dateRange?.end || executionsStats.dateRange?.end;
  }

  // Determine currency (prefer cash flows, fallback to executions)
  const currency = cashFlowsStats.currency || executionsStats.currency || 'USD';

  return {
    totalCount,
    totalAmount,
    positiveAmount,
    negativeAmount,
    positiveCount,
    negativeCount,
    firstRecord,
    lastRecord,
    dateRange: { start: dateRangeStart, end: dateRangeEnd },
    currency,
  };
}

/**
 * Split cash flows statistics by column
 * Column 1: deposits_withdrawals, fee, dividend
 * Column 2: interest/SYEP interest, transfer, other
 * @param {Object} stats - Full cash flows statistics
 * @param {number} column - Column number (1 or 2)
 * @returns {Object} Filtered statistics object for the column
 */
function splitCashFlowsByColumn(stats, column) {
  window.Logger.info('🔵 [splitCashFlowsByColumn] START', { column, hasStats: !!stats, hasBySubtype: !!(stats?.bySubtype), page: 'trading_accounts' });
  if (!stats || !stats.bySubtype) {
    window.Logger.warn('⚠️ [splitCashFlowsByColumn] No stats or bySubtype', { page: 'trading_accounts' });
    return stats;
  }

  const column1Subtypes = ['deposits_withdrawals', 'fee', 'dividend'];
  const column2Subtypes = ['transfer', 'interest', 'syep_interest', 'other'];
  window.Logger.info('🔵 [splitCashFlowsByColumn] Available subtypes', { 
    allSubtypes: Object.keys(stats.bySubtype),
    targetSubtypes: column === 1 ? column1Subtypes : column2Subtypes,
    page: 'trading_accounts' 
  });

  const targetSubtypes = column === 1 ? column1Subtypes : column2Subtypes;

  // Filter bySubtype to only include subtypes for this column
  const filteredBySubtype = {};
  let totalCount = 0;
  let totalAmount = 0;
  let positiveAmount = 0;
  let negativeAmount = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  targetSubtypes.forEach(subtype => {
    if (stats.bySubtype[subtype]) {
      filteredBySubtype[subtype] = stats.bySubtype[subtype];
      totalCount += stats.bySubtype[subtype].count || 0;
      totalAmount += stats.bySubtype[subtype].totalAmount || 0;
      positiveAmount += stats.bySubtype[subtype].positiveAmount || 0;
      negativeAmount += stats.bySubtype[subtype].negativeAmount || 0;
      positiveCount += stats.bySubtype[subtype].positiveCount || 0;
      negativeCount += stats.bySubtype[subtype].negativeCount || 0;
      window.Logger.info('🔵 [splitCashFlowsByColumn] Added subtype', { subtype, count: stats.bySubtype[subtype].count || 0, page: 'trading_accounts' });
    }
  });
  window.Logger.info('🔵 [splitCashFlowsByColumn] RESULT', { 
    column, 
    totalCount, 
    filteredSubtypes: Object.keys(filteredBySubtype),
    page: 'trading_accounts' 
  });

  return {
    ...stats,
    bySubtype: filteredBySubtype,
    totalCount,
    totalAmount,
    positiveAmount,
    negativeAmount,
    positiveCount,
    negativeCount,
  };
}

/**
 * Split executions statistics by action (buy/sell)
 * @param {Object} stats - Full executions statistics
 * @param {string} action - Action type ('buy' or 'sell')
 * @returns {Object} Filtered statistics object for the action
 */
function splitExecutionsByAction(stats, action) {
  if (!stats || !stats.bySubtype) {
    return stats;
  }

  // Filter bySubtype to only include the requested action
  const filteredBySubtype = {};
  if (stats.bySubtype[action]) {
    filteredBySubtype[action] = stats.bySubtype[action];
  }

  const subtypeStats = stats.bySubtype[action];
  if (!subtypeStats) {
    // Return empty stats structure
    return {
      ...stats,
      bySubtype: {},
      totalCount: 0,
      totalAmount: 0,
      positiveAmount: 0,
      negativeAmount: 0,
      positiveCount: 0,
      negativeCount: 0,
    };
  }

  return {
    ...stats,
    bySubtype: filteredBySubtype,
    totalCount: subtypeStats.count || 0,
    totalAmount: subtypeStats.totalAmount || 0,
    positiveAmount: subtypeStats.positiveAmount || 0,
    negativeAmount: subtypeStats.negativeAmount || 0,
    positiveCount: subtypeStats.positiveCount || 0,
    negativeCount: subtypeStats.negativeCount || 0,
  };
}

/**
 * Render statistics column HTML
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @returns {string} HTML string
 */
function renderStatisticsColumn(stats, typeName) {
  if (!stats || stats.totalCount === 0) {
    return '<div class="statistics-empty">אין נתונים להצגה</div>';
  }

  const currency = stats.currency || 'USD';
  let currencySymbol = currency;
  if (currency && currency.length > 1) {
    switch (currency.toUpperCase()) {
    case 'USD': currencySymbol = '$'; break;
    case 'ILS': currencySymbol = '₪'; break;
    case 'EUR': currencySymbol = '€'; break;
    case 'GBP': currencySymbol = '£'; break;
    case 'JPY': currencySymbol = '¥'; break;
    default: currencySymbol = currency;
    }
  }

  let html = '<div class="statistics-summary">';

  // Card 1: מספר רשומות + סה"כ סכום (unified) - two columns
  html += '<div class="statistics-card-item">';
  const totalAmountHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
    ? window.FieldRendererService.renderAmount(stats.totalAmount, currencySymbol, 0, true)
    : `<span>${stats.totalAmount < 0 ? '-' : ''}${Math.abs(stats.totalAmount).toFixed(0)}${currencySymbol}</span>`;

  // Format records count with breakdown (always show if we have any breakdown)
  let recordsCountHtml = `${stats.totalCount}`;
  if (stats.negativeCount > 0 || stats.positiveCount > 0) {
    const negativeCountClass = (stats.negativeCount || 0) === 0 ? '' : 'text-danger';
    const positiveCountClass = (stats.positiveCount || 0) === 0 ? '' : 'text-success';
    recordsCountHtml = `${stats.totalCount} (<span class="${negativeCountClass}">${stats.negativeCount || 0}</span>/<span class="${positiveCountClass}">${stats.positiveCount || 0}</span>)`;
  }

  // Format total amount with breakdown (always show if we have amounts)
  let totalAmountWithBreakdown = totalAmountHtml;
  if (stats.negativeAmount !== 0 || stats.positiveAmount !== 0) {
    const negativeAmount = stats.negativeAmount || 0;
    const positiveAmount = stats.positiveAmount || 0;
    const negativeAmountClass = negativeAmount === 0 ? '' : 'text-danger';
    const positiveAmountClass = positiveAmount === 0 ? '' : 'text-success';

    let negativeAmountHtml;
    if (negativeAmount === 0) {
      // For zero: display without color class (neutral)
      negativeAmountHtml = `<span>${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
    } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
      negativeAmountHtml = window.FieldRendererService.renderAmount(negativeAmount, currencySymbol, 0, true);
    } else {
      negativeAmountHtml = `<span class="text-danger">${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
    }

    let positiveAmountHtml;
    if (positiveAmount === 0) {
      // For zero: display without color class (neutral)
      positiveAmountHtml = `<span>${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
    } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
      positiveAmountHtml = window.FieldRendererService.renderAmount(positiveAmount, currencySymbol, 0, true);
    } else {
      positiveAmountHtml = `<span class="text-success">${positiveAmount >= 0 ? '+' : ''}${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
    }

    totalAmountWithBreakdown = `${totalAmountHtml}<br>(${negativeAmountHtml}/${positiveAmountHtml})`;
  }

  html += '<div class="statistics-card-content statistics-card-two-columns">';
  html += `<div class="statistics-card-col">מספר רשומות: <strong>${recordsCountHtml}</strong></div>`;
  html += `<div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>${totalAmountWithBreakdown}</strong></div>`;
  html += '</div>';
  html += '</div>';

  // Card 2: שינוי או ממוצע (unified - all three metrics in one card)
  // For executions: show average per action instead of change
  // For cash flows: show change as before
  const isExecution = typeName === 'ביצועים' || typeName === 'execution';

  if (isExecution && stats.totalCount > 0) {
    // Executions: Show average per action
    // Calculate average using absolute values (neutral - mixing positive and negative)
    html += '<div class="statistics-card-item">';

    // Calculate absolute average: sum of absolute values divided by count
    // This gives average of buy (negative) and sell (positive) together - neutral color
    let absoluteTotal = 0;
    if (stats.bySubtype && Object.keys(stats.bySubtype).length > 0) {
      // Sum absolute values from all subtypes
      Object.values(stats.bySubtype).forEach(subtype => {
        if (subtype.movements && Array.isArray(subtype.movements)) {
          subtype.movements.forEach(m => {
            absoluteTotal += Math.abs(m.amount || 0);
          });
        }
      });
    }

    // If no movements found in bySubtype, calculate from positive and negative amounts
    if (absoluteTotal === 0) {
      absoluteTotal = Math.abs(stats.positiveAmount || 0) + Math.abs(stats.negativeAmount || 0);
    }

    const averagePerAction = stats.totalCount > 0 ? absoluteTotal / stats.totalCount : 0;

    // Display with neutral color (no positive/negative class, no sign)
    const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const averageHtml = `<span>${formatted}${currencySymbol}</span>`;

    // Calculate annual amount estimate
    // Use totalAmount for the period, not the change between first and last record
    // IMPORTANT: Use the full date range (filter range), NOT the period between first and last records
    // This gives a more accurate annualized estimate based on the actual time period selected
    let daysForAnnual = 1;
    if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
      // Use the full filter date range (more accurate for annualization)
      daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
      window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: 'trading_accounts' });
    } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
      // Fallback: use period between records only if dateRange is not available
      daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
      window.Logger.info(`  - Fallback: Using period between records for annualization: ${daysForAnnual} days`, { page: 'trading_accounts' });
    }
    // For executions: estimate annual based on total amount in period (not change)
    const annualAmountChange = totalAmount / daysForAnnual * 365;
    const annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
      ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
      : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;

    // TODO: Calculate percentage change as part of total account value
    // Currently account balance/value is not available - display 0% (future)
    // When account balance is available:
    //   percentageChange = (stats.totalAmount / accountBalance) * 100
    //   annualPercentageChange = (annualAmountChange / accountBalance) * 100
    // NOTE: Need to get account balance from account data or API
    // FIXME: Replace placeholder with actual calculation once account balance is available
    const accountBalance = 0; // TODO: Get from account data - window.accountActivityState.selectedAccountId balance
    let percentageChange = 0;
    let annualPercentageChange = 0;
    let percentageDisplay = '0%';
    let annualPercentageDisplay = '0%';

    if (accountBalance > 0) {
      // Calculate percentage change as part of account balance
      percentageChange = stats.totalAmount / Math.abs(accountBalance) * 100;
      annualPercentageChange = annualAmountChange / Math.abs(accountBalance) * 100;

      // Format percentages (RTL: number first, then %, then sign)
      const pctNumber = Math.abs(percentageChange).toFixed(2);
      const pctSign = percentageChange < 0 ? '-' : '';
      percentageDisplay = `${pctNumber}%${pctSign}`;

      const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
      const annualPctSign = annualPercentageChange < 0 ? '-' : '';
      annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;
    } else {
      // Show placeholder: 0% (future)
      percentageDisplay = '0% (עתידי)';
      annualPercentageDisplay = '0% (עתידי)';
    }

    // For "0% (עתידי)" - always use neutral light variant color
    const pctClass = accountBalance > 0
      ? percentageChange >= 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : ''
      : ''; // Neutral (light variant) - no color class
    const annualPctClass = accountBalance > 0
      ? annualPercentageChange >= 0 ? 'text-success' : annualPercentageChange < 0 ? 'text-danger' : ''
      : ''; // Neutral (light variant) - no color class

    html += '<div class="statistics-card-content statistics-card-two-columns">';
    html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
    html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
    html += '</div>';
    html += '</div>';
  } else if (!isExecution && stats.totalCount > 0) {
    // Cash flows: Show average per action (same as executions)
    html += '<div class="statistics-card-item">';

    // Calculate average per action using absolute values (neutral - mixing positive and negative)
    // This gives average of deposits (positive) and withdrawals (negative) together - neutral color
    const absoluteTotal = Math.abs(stats.positiveAmount || 0) + Math.abs(stats.negativeAmount || 0);
    const averagePerAction = stats.totalCount > 0 ? absoluteTotal / stats.totalCount : 0;

    // Log calculation details
    window.Logger.info(`📊 חישוב ממוצע לפעולה (${typeName}):`, { page: 'trading_accounts' });
    window.Logger.info(`  - positiveAmount: ${stats.positiveAmount || 0}`, { page: 'trading_accounts' });
    window.Logger.info(`  - negativeAmount: ${stats.negativeAmount || 0}`, { page: 'trading_accounts' });
    window.Logger.info(`  - absoluteTotal: ${absoluteTotal}`, { page: 'trading_accounts' });
    window.Logger.info(`  - totalCount: ${stats.totalCount}`, { page: 'trading_accounts' });
    window.Logger.info(`  - averagePerAction = ${absoluteTotal} / ${stats.totalCount} = ${averagePerAction}`, { page: 'trading_accounts' });

    // Display with neutral color (no positive/negative class, no sign)
    const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const averageHtml = `<span>${formatted}${currencySymbol}</span>`;

    // Calculate annual amount estimate (use totalAmount, not overallAmountChange)
    // IMPORTANT: Use the full date range (filter range), NOT the period between first and last records
    // This gives a more accurate annualized estimate based on the actual time period selected
    let daysForAnnual = 1;
    if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
      // Use the full filter date range (more accurate for annualization)
      daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
      window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: 'trading_accounts' });
    } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
      // Fallback: use period between records only if dateRange is not available
      daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
      window.Logger.info(`  - Fallback: Using period between records for annualization: ${daysForAnnual} days`, { page: 'trading_accounts' });
    }
    // Use totalAmount (already normalized) instead of overallAmountChange
    const annualAmountChange = totalAmount / daysForAnnual * 365;

    // Log calculation details
    window.Logger.info(`📈 חישוב שנתי משוער (${typeName}):`, { page: 'trading_accounts' });
    window.Logger.info(`  - totalAmount: ${stats.totalAmount}`, { page: 'trading_accounts' });
    window.Logger.info(`  - daysForAnnual: ${daysForAnnual}`, { page: 'trading_accounts' });
    window.Logger.info(`  - annualAmountChange = (${stats.totalAmount} / ${daysForAnnual}) * 365 = ${annualAmountChange}`, { page: 'trading_accounts' });

    const annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
      ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
      : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;

    // TODO: Calculate percentage change as part of total account value (same as executions)
    // Currently account balance/value is not available - display 0% (future)
    // When account balance is available:
    //   percentageChange = (stats.overallAmountChange / accountBalance) * 100
    //   annualPercentageChange = (annualAmountChange / accountBalance) * 100
    // NOTE: Need to get account balance from account data or API
    // FIXME: Replace placeholder with actual calculation once account balance is available
    const accountBalance = 0; // TODO: Get from account data - window.accountActivityState.selectedAccountId balance
    let percentageChange = 0;
    let annualPercentageChange = 0;
    let percentageDisplay = '0%';
    let annualPercentageDisplay = '0%';

    if (accountBalance > 0) {
      // Calculate percentage change as part of account balance (same as executions)
      // Use averagePerAction for percentage calculation
      percentageChange = averagePerAction / Math.abs(accountBalance) * 100;
      annualPercentageChange = annualAmountChange / Math.abs(accountBalance) * 100;

      // Format percentages (RTL: number first, then %, then sign)
      const pctNumber = Math.abs(percentageChange).toFixed(2);
      const pctSign = percentageChange < 0 ? '-' : '';
      percentageDisplay = `${pctNumber}%${pctSign}`;

      const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
      const annualPctSign = annualPercentageChange < 0 ? '-' : '';
      annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;
    } else {
      // Show placeholder: 0% (future)
      percentageDisplay = '0% (עתידי)';
      annualPercentageDisplay = '0% (עתידי)';
    }

    // For "0% (עתידי)" - always use neutral light variant color
    const pctClass = accountBalance > 0
      ? percentageChange >= 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : ''
      : ''; // Neutral (light variant) - no color class
    const annualPctClass = accountBalance > 0
      ? annualPercentageChange >= 0 ? 'text-success' : annualPercentageChange < 0 ? 'text-danger' : ''
      : ''; // Neutral (light variant) - no color class

    html += '<div class="statistics-card-content statistics-card-two-columns">';
    html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
    html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
    html += '</div>';
    html += '</div>';
  }

  html += '</div>'; // End statistics-summary

  // Note: Breakdown is now rendered separately by renderBreakdownBySubtype

  return html;
}

/**
 * Render statistics summary column 1: מספר רשומות + סה"כ סכום
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @returns {string} HTML string
 */
function renderStatisticsSummaryColumn1(stats, typeName) {
  // Always render the card structure, even if no data
  // Check if stats is completely missing or invalid
  if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
    return '<div class="statistics-summary"><div class="statistics-card-item"><div class="statistics-card-content statistics-card-two-columns"><div class="statistics-card-col">מספר רשומות: <strong>0</strong></div><div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>0</strong></div></div></div></div>';
  }

  // If totalCount is 0 or undefined, still show the card with 0 values
  const totalCount = stats.totalCount || 0;
  const totalAmount = stats.totalAmount || 0;
  const negativeCount = stats.negativeCount || 0;
  const positiveCount = stats.positiveCount || 0;
  const negativeAmount = stats.negativeAmount || 0;
  const positiveAmount = stats.positiveAmount || 0;

  const currency = stats.currency || 'USD';
  let currencySymbol = currency;
  if (currency && currency.length > 1) {
    switch (currency.toUpperCase()) {
    case 'USD': currencySymbol = '$'; break;
    case 'ILS': currencySymbol = '₪'; break;
    case 'EUR': currencySymbol = '€'; break;
    case 'GBP': currencySymbol = '£'; break;
    case 'JPY': currencySymbol = '¥'; break;
    default: currencySymbol = currency;
    }
  }

  let html = '<div class="statistics-summary">';

  // Card: מספר רשומות + סה"כ סכום
  html += '<div class="statistics-card-item">';
  const totalAmountHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
    ? window.FieldRendererService.renderAmount(totalAmount, currencySymbol, 0, true)
    : `<span>${totalAmount < 0 ? '-' : ''}${Math.abs(totalAmount).toFixed(0)}${currencySymbol}</span>`;

  // Format records count with breakdown
  let recordsCountHtml = `${totalCount}`;
  if (negativeCount > 0 || positiveCount > 0) {
    const negativeCountClass = negativeCount === 0 ? '' : 'text-danger';
    const positiveCountClass = positiveCount === 0 ? '' : 'text-success';
    recordsCountHtml = `${totalCount} (<span class="${negativeCountClass}">${negativeCount}</span>/<span class="${positiveCountClass}">${positiveCount}</span>)`;
  }

  // Format total amount with breakdown
  let totalAmountWithBreakdown = totalAmountHtml;
  if (negativeAmount !== 0 || positiveAmount !== 0) {

    let negativeAmountHtml;
    if (negativeAmount === 0) {
      negativeAmountHtml = `<span>${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
    } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
      negativeAmountHtml = window.FieldRendererService.renderAmount(negativeAmount, currencySymbol, 0, true);
    } else {
      negativeAmountHtml = `<span class="text-danger">${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
    }

    let positiveAmountHtml;
    if (positiveAmount === 0) {
      positiveAmountHtml = `<span>${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
    } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
      positiveAmountHtml = window.FieldRendererService.renderAmount(positiveAmount, currencySymbol, 0, true);
    } else {
      positiveAmountHtml = `<span class="text-success">${positiveAmount >= 0 ? '+' : ''}${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
    }

    totalAmountWithBreakdown = `${totalAmountHtml}<br>(${negativeAmountHtml}/${positiveAmountHtml})`;
  }

  html += '<div class="statistics-card-content statistics-card-two-columns">';
  html += `<div class="statistics-card-col">מספר רשומות: <strong>${recordsCountHtml}</strong></div>`;
  html += `<div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>${totalAmountWithBreakdown}</strong></div>`;
  html += '</div>';
  html += '</div>';
  html += '</div>'; // End statistics-summary

  return html;
}

/**
 * Render statistics summary column 2: ממוצע לפעולה + שנתי משוער
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @returns {string} HTML string
 */
function renderStatisticsSummaryColumn2(stats, typeName) {
  // Always render the card structure, even if no data
  // Check if stats is completely missing or invalid
  if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
    return '<div class="statistics-summary"><div class="statistics-card-item"><div class="statistics-card-content statistics-card-two-columns"><div class="statistics-card-col">ממוצע לפעולה: <strong>0</strong></div><div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>0%</strong></div></div></div></div>';
  }

  // If totalCount is 0 or undefined, still show the card with 0 values
  const totalCount = stats.totalCount || 0;
  const totalAmount = stats.totalAmount || 0;
  const negativeAmount = stats.negativeAmount || 0;
  const positiveAmount = stats.positiveAmount || 0;
  const negativeCount = stats.negativeCount || 0;
  const positiveCount = stats.positiveCount || 0;

  const currency = stats.currency || 'USD';
  let currencySymbol = currency;
  if (currency && currency.length > 1) {
    switch (currency.toUpperCase()) {
    case 'USD': currencySymbol = '$'; break;
    case 'ILS': currencySymbol = '₪'; break;
    case 'EUR': currencySymbol = '€'; break;
    case 'GBP': currencySymbol = '£'; break;
    case 'JPY': currencySymbol = '¥'; break;
    default: currencySymbol = currency;
    }
  }

  let html = '<div class="statistics-summary">';

  const isExecution = typeName === 'ביצועים' || typeName === 'execution';

  // Card: ממוצע לפעולה + שנתי משוער
  html += '<div class="statistics-card-item">';

  if (isExecution) {
    // Executions: Calculate average using absolute values
    let absoluteTotal = 0;
    if (stats.bySubtype && Object.keys(stats.bySubtype).length > 0) {
      Object.values(stats.bySubtype).forEach(subtype => {
        if (subtype.movements && Array.isArray(subtype.movements)) {
          subtype.movements.forEach(m => {
            absoluteTotal += Math.abs(m.amount || 0);
          });
        }
      });
    }

    if (absoluteTotal === 0) {
      absoluteTotal = Math.abs(positiveAmount || 0) + Math.abs(negativeAmount || 0);
    }

    const averagePerAction = totalCount > 0 ? absoluteTotal / totalCount : 0;
    const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    let averageHtml = `<span>${formatted}${currencySymbol}</span>`;

    // Check if we need to show breakdown by sides (both positive and negative exist)
    const hasBothSides = negativeAmount !== 0 && positiveAmount !== 0;

    // If both sides exist, calculate and show breakdown for average per action
    // Breakdown should be on a new line after the total
    if (hasBothSides) {

      const positiveAverage = positiveCount > 0 ? Math.abs(positiveAmount) / positiveCount : 0;
      const negativeAverage = negativeCount > 0 ? Math.abs(negativeAmount) / negativeCount : 0;

      let negativeAverageHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        negativeAverageHtml = window.FieldRendererService.renderAmount(-negativeAverage, currencySymbol, 0, true);
      } else {
        negativeAverageHtml = `<span class="text-danger">-${negativeAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
      }

      let positiveAverageHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        positiveAverageHtml = window.FieldRendererService.renderAmount(positiveAverage, currencySymbol, 0, true);
      } else {
        positiveAverageHtml = `<span class="text-success">+${positiveAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
      }

      averageHtml = `${averageHtml}<br>(${negativeAverageHtml}/${positiveAverageHtml})`;
    }

    let daysForAnnual = 1;
    if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
      daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
    } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
      daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
    }

    const annualAmountChange = totalAmount / daysForAnnual * 365;
    let annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
      ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
      : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;

    // If both sides exist, show breakdown for annual estimate
    if (hasBothSides) {
      const positiveAnnual = positiveAmount / daysForAnnual * 365;
      const negativeAnnual = negativeAmount / daysForAnnual * 365;

      let negativeAnnualHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        negativeAnnualHtml = window.FieldRendererService.renderAmount(negativeAnnual, currencySymbol, 0, true);
      } else {
        negativeAnnualHtml = `<span class="text-danger">${negativeAnnual.toFixed(0)}${currencySymbol}</span>`;
      }

      let positiveAnnualHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        positiveAnnualHtml = window.FieldRendererService.renderAmount(positiveAnnual, currencySymbol, 0, true);
      } else {
        positiveAnnualHtml = `<span class="text-success">${positiveAnnual >= 0 ? '+' : ''}${positiveAnnual.toFixed(0)}${currencySymbol}</span>`;
      }

      annualAmountChangeHtml = `${annualAmountChangeHtml}<br>(${negativeAnnualHtml}/${positiveAnnualHtml})`;
    }

    const accountBalance = 0;
    let percentageDisplay = '0%';
    let annualPercentageDisplay = '0%';
    let pctClass = '';
    let annualPctClass = '';

    if (accountBalance > 0) {
      const percentageChange = totalAmount / Math.abs(accountBalance) * 100;
      const annualPercentageChange = annualAmountChange / Math.abs(accountBalance) * 100;

      const pctNumber = Math.abs(percentageChange).toFixed(2);
      const pctSign = percentageChange < 0 ? '-' : '';
      percentageDisplay = `${pctNumber}%${pctSign}`;

      const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
      const annualPctSign = annualPercentageChange < 0 ? '-' : '';
      annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;

      pctClass = percentageChange >= 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : '';
      annualPctClass = annualPercentageChange >= 0 ? 'text-success' : annualPercentageChange < 0 ? 'text-danger' : '';
    } else {
      percentageDisplay = '0% (עתידי)';
      annualPercentageDisplay = '0% (עתידי)';
    }

    html += '<div class="statistics-card-content statistics-card-two-columns">';
    html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
    html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
    html += '</div>';
    html += '</div>';
  } else if (!isExecution) {
    // Cash flows: Calculate average using absolute values
    const absoluteTotal = Math.abs(positiveAmount || 0) + Math.abs(negativeAmount || 0);
    const averagePerAction = totalCount > 0 ? absoluteTotal / totalCount : 0;

    const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    let averageHtml = `<span>${formatted}${currencySymbol}</span>`;

    // Check if we need to show breakdown by sides (both positive and negative exist)
    const hasBothSides = negativeAmount !== 0 && positiveAmount !== 0;

    // If both sides exist, calculate and show breakdown for average per action
    // Breakdown should be on a new line after the total
    if (hasBothSides) {

      const positiveAverage = positiveCount > 0 ? Math.abs(positiveAmount) / positiveCount : 0;
      const negativeAverage = negativeCount > 0 ? Math.abs(negativeAmount) / negativeCount : 0;

      let negativeAverageHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        negativeAverageHtml = window.FieldRendererService.renderAmount(-negativeAverage, currencySymbol, 0, true);
      } else {
        negativeAverageHtml = `<span class="text-danger">-${negativeAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
      }

      let positiveAverageHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        positiveAverageHtml = window.FieldRendererService.renderAmount(positiveAverage, currencySymbol, 0, true);
      } else {
        positiveAverageHtml = `<span class="text-success">+${positiveAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
      }

      averageHtml = `${averageHtml}<br>(${negativeAverageHtml}/${positiveAverageHtml})`;
    }

    let daysForAnnual = 1;
    if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
      daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
    } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
      daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
    }

    const annualAmountChange = totalAmount / daysForAnnual * 365;
    let annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
      ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
      : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;

    // If both sides exist, show breakdown for annual estimate
    if (hasBothSides) {
      const positiveAnnual = positiveAmount / daysForAnnual * 365;
      const negativeAnnual = negativeAmount / daysForAnnual * 365;

      let negativeAnnualHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        negativeAnnualHtml = window.FieldRendererService.renderAmount(negativeAnnual, currencySymbol, 0, true);
      } else {
        negativeAnnualHtml = `<span class="text-danger">${negativeAnnual.toFixed(0)}${currencySymbol}</span>`;
      }

      let positiveAnnualHtml;
      if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        positiveAnnualHtml = window.FieldRendererService.renderAmount(positiveAnnual, currencySymbol, 0, true);
      } else {
        positiveAnnualHtml = `<span class="text-success">${positiveAnnual >= 0 ? '+' : ''}${positiveAnnual.toFixed(0)}${currencySymbol}</span>`;
      }

      annualAmountChangeHtml = `${annualAmountChangeHtml}<br>(${negativeAnnualHtml}/${positiveAnnualHtml})`;
    }

    const accountBalance = 0;
    let percentageDisplay = '0%';
    let annualPercentageDisplay = '0%';
    let pctClass = '';
    let annualPctClass = '';

    if (accountBalance > 0) {
      const percentageChange = averagePerAction / Math.abs(accountBalance) * 100;
      const annualPercentageChange = annualAmountChange / Math.abs(accountBalance) * 100;

      const pctNumber = Math.abs(percentageChange).toFixed(2);
      const pctSign = percentageChange < 0 ? '-' : '';
      percentageDisplay = `${pctNumber}%${pctSign}`;

      const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
      const annualPctSign = annualPercentageChange < 0 ? '-' : '';
      annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;

      pctClass = percentageChange >= 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : '';
      annualPctClass = annualPercentageChange >= 0 ? 'text-success' : annualPercentageChange < 0 ? 'text-danger' : '';
    } else {
      percentageDisplay = '0% (עתידי)';
      annualPercentageDisplay = '0% (עתידי)';
    }

    html += '<div class="statistics-card-content statistics-card-two-columns">';
    html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
    html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
    html += '</div>';
    html += '</div>';
  }

  html += '</div>'; // End statistics-summary

  return html;
}

/**
 * Render breakdown by subtype HTML (only the breakdown cards, without summary)
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @param {number} column - Column number (1 or 2) for cash flows, or action ('buy'/'sell') for executions
 * @returns {string} HTML string
 */
function renderBreakdownBySubtype(stats, typeName, column) {
  window.Logger.info('🔵 [renderBreakdownBySubtype] START', { 
    typeName, 
    column, 
    hasStats: !!stats, 
    hasBySubtype: !!(stats?.bySubtype),
    bySubtypeKeys: stats?.bySubtype ? Object.keys(stats.bySubtype) : [],
    page: 'trading_accounts' 
  });
  // Always render breakdown section, even if empty (will show empty state)
  // BUT: If stats exists but has no bySubtype or empty bySubtype, still show structure with empty message
  if (!stats) {
    window.Logger.warn('⚠️ [renderBreakdownBySubtype] No stats at all, returning empty', { page: 'trading_accounts' });
    return '<div class="statistics-breakdown"><div class="statistics-empty">אין נתונים להצגה</div></div>';
  }
  
  // If stats exists but no bySubtype or empty, still render structure
  if (!stats.bySubtype || Object.keys(stats.bySubtype).length === 0) {
    window.Logger.info('🔵 [renderBreakdownBySubtype] Stats exists but no bySubtype, rendering empty structure', { 
      totalCount: stats.totalCount || 0,
      page: 'trading_accounts' 
    });
    // Return empty structure instead of just "אין נתונים להצגה"
    return '<div class="statistics-breakdown"><div class="statistics-empty">אין נתונים להצגה</div></div>';
  }

  const currency = stats.currency || 'USD';
  let currencySymbol = currency;
  if (currency && currency.length > 1) {
    switch (currency.toUpperCase()) {
    case 'USD': currencySymbol = '$'; break;
    case 'ILS': currencySymbol = '₪'; break;
    case 'EUR': currencySymbol = '€'; break;
    case 'GBP': currencySymbol = '£'; break;
    case 'JPY': currencySymbol = '¥'; break;
    default: currencySymbol = currency;
    }
  }

  let html = '';
  const isExecution = typeName === 'ביצועים' || typeName === 'execution';

  // Breakdown by subtype (no title, no dividers - handled in HTML)
  if (stats.bySubtype && Object.keys(stats.bySubtype).length > 0) {
    html += '<div class="statistics-breakdown">';

    // Sort subtypes in specific order for cash flows:
    // 1. deposits_withdrawals (הפקדה ומשיכה)
    // 2. fee (עמלה)
    // 3. dividend (דיבידנד)
    // 4. transfer (העברה)
    // 5. interest (ריבית) + syep_interest
    // 6. other (אחר)
    // For executions: keep alphabetical order (buy/sell)
    const subtypeOrder = [
        'deposits_withdrawals',
        'fee',
        'dividend',
        'transfer_in',
        'transfer_out',
        'currency_exchange_from',
        'currency_exchange_to',
        'interest',
        'syep_interest',
        'other_positive',
        'other_negative'
    ];
    const subtypes = Object.keys(stats.bySubtype).sort((a, b) => {
      if (isExecution) {
        // For executions: alphabetical order
        return a.localeCompare(b);
      }

      // For cash flows: use predefined order
      const indexA = subtypeOrder.indexOf(a);
      const indexB = subtypeOrder.indexOf(b);

      // If both found in order list, use their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one found, prioritize the one in list
      if (indexA !== -1) {return -1;}
      if (indexB !== -1) {return 1;}

      // If neither found, alphabetical order
      return a.localeCompare(b);
    });

    subtypes.forEach(subtype => {
      const subtypeStats = stats.bySubtype[subtype];
      const subtypeDisplay = getSubtypeDisplay(subtype);

      html += '<div class="statistics-subtype-group">';
      html += `<h6>${subtypeDisplay}</h6>`;

      // Card 1: מספר רשומות + סה"כ סכום (unified) - two columns
      html += '<div class="statistics-card-item">';
      // For executions: ensure correct rendering (buy always negative, sell always positive)
      // For cash flows: render as before
      const subtypeAmountHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
        ? window.FieldRendererService.renderAmount(subtypeStats.totalAmount, currencySymbol, 0, isExecution)
        : `<span>${subtypeStats.totalAmount.toFixed(0)}${currencySymbol}</span>`;

      // Format subtype records count with breakdown
      // For executions: don't show breakdown (only one side - buy is negative, sell is positive)
      // For cash flows: show breakdown as before
      let subtypeRecordsCountHtml = `${subtypeStats.count}`;
      if (!isExecution && (subtypeStats.negativeCount > 0 || subtypeStats.positiveCount > 0)) {
        // Only show breakdown for cash flows, and only if both sides exist
        if (subtypeStats.negativeCount > 0 && subtypeStats.positiveCount > 0) {
          const subtypeNegativeCountClass = 'text-danger';
          const subtypePositiveCountClass = 'text-success';
          subtypeRecordsCountHtml = `${subtypeStats.count} (<span class="${subtypeNegativeCountClass}">${subtypeStats.negativeCount || 0}</span>/<span class="${subtypePositiveCountClass}">${subtypeStats.positiveCount || 0}</span>)`;
        }
      }

      // Format subtype total amount with breakdown
      // For executions: don't show breakdown (only one side - buy is negative, sell is positive)
      // For cash flows: show breakdown only if both sides exist
      let subtypeAmountWithBreakdown = subtypeAmountHtml;
      if (!isExecution) {
        const subtypeNegativeAmount = subtypeStats.negativeAmount || 0;
        const subtypePositiveAmount = subtypeStats.positiveAmount || 0;
        // Only show breakdown if both sides exist (not just zeros)
        if (subtypeNegativeAmount !== 0 && subtypePositiveAmount !== 0) {
          let subtypeNegativeAmountHtml;
          if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            subtypeNegativeAmountHtml = window.FieldRendererService.renderAmount(subtypeNegativeAmount, currencySymbol, 0, true);
          } else {
            subtypeNegativeAmountHtml = `<span class="text-danger">${subtypeNegativeAmount.toFixed(2)}${currencySymbol}</span>`;
          }

          let subtypePositiveAmountHtml;
          if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            subtypePositiveAmountHtml = window.FieldRendererService.renderAmount(subtypePositiveAmount, currencySymbol, 0, true);
          } else {
            subtypePositiveAmountHtml = `<span class="text-success">${subtypePositiveAmount >= 0 ? '+' : ''}${subtypePositiveAmount.toFixed(2)}${currencySymbol}</span>`;
          }

          subtypeAmountWithBreakdown = `${subtypeAmountHtml}<br>(${subtypeNegativeAmountHtml}/${subtypePositiveAmountHtml})`;
        }
      }

      html += '<div class="statistics-card-content statistics-card-two-columns">';
      html += `<div class="statistics-card-col">מספר רשומות: <strong>${subtypeRecordsCountHtml}</strong></div>`;
      html += `<div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>${subtypeAmountWithBreakdown}</strong></div>`;
      html += '</div>';
      html += '</div>';

      // Card 2: שינוי או ממוצע (unified - all three metrics in one card)
      // For executions: show average per action instead of change
      // For cash flows: show change as before
      if (isExecution && subtypeStats.count > 0) {
        // Executions: Show average per action
        html += '<div class="statistics-card-item">';

        const subtypeAveragePerAction = subtypeStats.totalAmount / subtypeStats.count;
        const subtypeAverageHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
          ? window.FieldRendererService.renderAmount(subtypeAveragePerAction, currencySymbol, 0, true)
          : `<span>${subtypeAveragePerAction >= 0 ? '+' : ''}${subtypeAveragePerAction.toFixed(0)}${currencySymbol}</span>`;

        // Calculate annual amount change for subtype
        // Use totalAmount for subtype, not amountChange
        // IMPORTANT: Use the full date range (filter range) for consistency with overall stats
        let subtypeDaysForAnnual = 1;
        if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
          // Use the full filter date range (same as overall stats)
          subtypeDaysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
        } else if (subtypeStats.movements && subtypeStats.movements.length > 0) {
          // Fallback: use period between records only if dateRange is not available
          const firstMovement = subtypeStats.movements[0];
          const lastMovement = subtypeStats.movements[subtypeStats.movements.length - 1];
          if (firstMovement.date && lastMovement.date) {
            subtypeDaysForAnnual = Math.max(1, Math.ceil((new Date(lastMovement.date) - new Date(firstMovement.date)) / (1000 * 60 * 60 * 24)));
          }
        }
        const subtypeAnnualAmountChange = subtypeStats.totalAmount / subtypeDaysForAnnual * 365;
        const subtypeAnnualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
          ? window.FieldRendererService.renderAmount(subtypeAnnualAmountChange, currencySymbol, 0, true)
          : `<span>${subtypeAnnualAmountChange >= 0 ? '+' : ''}${subtypeAnnualAmountChange.toFixed(0)}${currencySymbol}</span>`;

        // TODO: Calculate percentage change as part of total account value (same as overall)
        // FIXME: Replace placeholder with actual calculation once account balance is available
        const subtypeAccountBalance = 0; // TODO: Get from account data
        let subtypePercentageChange = 0;
        let subtypeAnnualPercentageChange = 0;
        let subtypePercentageDisplay = '0%';
        let subtypeAnnualPercentageDisplay = '0%';

        if (subtypeAccountBalance > 0) {
          subtypePercentageChange = subtypeStats.totalAmount / Math.abs(subtypeAccountBalance) * 100;
          subtypeAnnualPercentageChange = subtypeAnnualAmountChange / Math.abs(subtypeAccountBalance) * 100;

          const subtypePctNumber = Math.abs(subtypePercentageChange).toFixed(2);
          const subtypePctSign = subtypePercentageChange < 0 ? '-' : '';
          subtypePercentageDisplay = `${subtypePctNumber}%${subtypePctSign}`;

          const subtypeAnnualPctNumber = Math.abs(subtypeAnnualPercentageChange).toFixed(2);
          const subtypeAnnualPctSign = subtypeAnnualPercentageChange < 0 ? '-' : '';
          subtypeAnnualPercentageDisplay = `${subtypeAnnualPctNumber}%${subtypeAnnualPctSign}`;
        } else {
          subtypePercentageDisplay = '0% (עתידי)';
          subtypeAnnualPercentageDisplay = '0% (עתידי)';
        }

        // For "0% (עתידי)" - always use neutral light variant color
        const subtypePctClass = subtypeAccountBalance > 0
          ? subtypePercentageChange >= 0 ? 'text-success' : subtypePercentageChange < 0 ? 'text-danger' : ''
          : ''; // Neutral (light variant) - no color class
        const subtypeAnnualPctClass = subtypeAccountBalance > 0
          ? subtypeAnnualPercentageChange >= 0 ? 'text-success' : subtypeAnnualPercentageChange < 0 ? 'text-danger' : ''
          : ''; // Neutral (light variant) - no color class

        html += '<div class="statistics-card-content statistics-card-two-columns">';
        html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${subtypeAverageHtml}</strong> | <strong class="${subtypePctClass}">${subtypePercentageDisplay}</strong></div>`;
        html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${subtypeAnnualAmountChangeHtml}</strong> | <strong class="${subtypeAnnualPctClass}">${subtypeAnnualPercentageDisplay}</strong></div>`;
        html += '</div>';
        html += '</div>';
      } else if (!isExecution && subtypeStats.count > 0) {
        // Cash flows: Show average per action (same as executions)
        html += '<div class="statistics-card-item">';

        // Calculate average per action using absolute values (neutral - mixing positive and negative)
        // This gives average for this subtype - neutral color
        const subtypeAbsoluteTotal = Math.abs(subtypeStats.positiveAmount || 0) + Math.abs(subtypeStats.negativeAmount || 0);
        const subtypeAveragePerAction = subtypeStats.count > 0 ? subtypeAbsoluteTotal / subtypeStats.count : 0;

        // Display with neutral color (no positive/negative class, no sign)
        const subtypeFormatted = Math.abs(subtypeAveragePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        let subtypeAverageHtml = `<span>${subtypeFormatted}${currencySymbol}</span>`;

        // Check if we need to show breakdown (both positive and negative exist)
        const subtypeNegativeAmount = subtypeStats.negativeAmount || 0;
        const subtypePositiveAmount = subtypeStats.positiveAmount || 0;
        const hasBothSides = subtypeNegativeAmount !== 0 && subtypePositiveAmount !== 0;

        // If both sides exist, show breakdown for average per action
        if (hasBothSides) {
          const subtypePositiveCount = subtypeStats.positiveCount || 0;
          const subtypeNegativeCount = subtypeStats.negativeCount || 0;

          // Calculate average per action for positive and negative separately
          const subtypePositiveAverage = subtypePositiveCount > 0 ? Math.abs(subtypePositiveAmount) / subtypePositiveCount : 0;
          const subtypeNegativeAverage = subtypeNegativeCount > 0 ? Math.abs(subtypeNegativeAmount) / subtypeNegativeCount : 0;

          const subtypePositiveAverageFormatted = subtypePositiveAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          const subtypeNegativeAverageFormatted = subtypeNegativeAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

          let subtypeNegativeAverageHtml;
          if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            subtypeNegativeAverageHtml = window.FieldRendererService.renderAmount(-subtypeNegativeAverage, currencySymbol, 0, true);
          } else {
            subtypeNegativeAverageHtml = `<span class="text-danger">-${subtypeNegativeAverageFormatted}${currencySymbol}</span>`;
          }

          let subtypePositiveAverageHtml;
          if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            subtypePositiveAverageHtml = window.FieldRendererService.renderAmount(subtypePositiveAverage, currencySymbol, 0, true);
          } else {
            subtypePositiveAverageHtml = `<span class="text-success">+${subtypePositiveAverageFormatted}${currencySymbol}</span>`;
          }

          subtypeAverageHtml = `${subtypeAverageHtml}<br>(${subtypeNegativeAverageHtml}/${subtypePositiveAverageHtml})`;
        }

        // Calculate annual amount estimate for subtype (use totalAmount, not amountChange)
        // IMPORTANT: Use the full date range (filter range) for consistency with overall stats
        let subtypeDaysForAnnual = 1;
        if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
          // Use the full filter date range (same as overall stats)
          subtypeDaysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
        } else if (subtypeStats.movements && subtypeStats.movements.length > 0) {
          // Fallback: use period between records only if dateRange is not available
          const firstMovement = subtypeStats.movements[0];
          const lastMovement = subtypeStats.movements[subtypeStats.movements.length - 1];
          if (firstMovement.date && lastMovement.date) {
            subtypeDaysForAnnual = Math.max(1, Math.ceil((new Date(lastMovement.date) - new Date(firstMovement.date)) / (1000 * 60 * 60 * 24)));
          }
        }
        // Use totalAmount (already normalized) instead of amountChange
        const subtypeAnnualAmountChange = subtypeStats.totalAmount / subtypeDaysForAnnual * 365;
        let subtypeAnnualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
          ? window.FieldRendererService.renderAmount(subtypeAnnualAmountChange, currencySymbol, 0, true)
          : `<span>${subtypeAnnualAmountChange >= 0 ? '+' : ''}${subtypeAnnualAmountChange.toFixed(0)}${currencySymbol}</span>`;

        // If both sides exist, show breakdown for annual estimate
        if (hasBothSides) {
          const subtypePositiveAnnual = subtypePositiveAmount / subtypeDaysForAnnual * 365;
          const subtypeNegativeAnnual = subtypeNegativeAmount / subtypeDaysForAnnual * 365;

          let subtypeNegativeAnnualHtml;
          if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            subtypeNegativeAnnualHtml = window.FieldRendererService.renderAmount(subtypeNegativeAnnual, currencySymbol, 0, true);
          } else {
            subtypeNegativeAnnualHtml = `<span class="text-danger">${subtypeNegativeAnnual.toFixed(0)}${currencySymbol}</span>`;
          }

          let subtypePositiveAnnualHtml;
          if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            subtypePositiveAnnualHtml = window.FieldRendererService.renderAmount(subtypePositiveAnnual, currencySymbol, 0, true);
          } else {
            subtypePositiveAnnualHtml = `<span class="text-success">${subtypePositiveAnnual >= 0 ? '+' : ''}${subtypePositiveAnnual.toFixed(0)}${currencySymbol}</span>`;
          }

          subtypeAnnualAmountChangeHtml = `${subtypeAnnualAmountChangeHtml}<br>(${subtypeNegativeAnnualHtml}/${subtypePositiveAnnualHtml})`;
        }

        // TODO: Calculate percentage change as part of total account value (same as executions)
        // FIXME: Replace placeholder with actual calculation once account balance is available
        const subtypeAccountBalance = 0; // TODO: Get from account data
        let subtypePercentageChange = 0;
        let subtypeAnnualPercentageChange = 0;
        let subtypePercentageDisplay = '0%';
        let subtypeAnnualPercentageDisplay = '0%';

        if (subtypeAccountBalance > 0) {
          // Use averagePerAction for percentage calculation
          subtypePercentageChange = subtypeAveragePerAction / Math.abs(subtypeAccountBalance) * 100;
          subtypeAnnualPercentageChange = subtypeAnnualAmountChange / Math.abs(subtypeAccountBalance) * 100;

          const subtypePctNumber = Math.abs(subtypePercentageChange).toFixed(2);
          const subtypePctSign = subtypePercentageChange < 0 ? '-' : '';
          subtypePercentageDisplay = `${subtypePctNumber}%${subtypePctSign}`;

          const subtypeAnnualPctNumber = Math.abs(subtypeAnnualPercentageChange).toFixed(2);
          const subtypeAnnualPctSign = subtypeAnnualPercentageChange < 0 ? '-' : '';
          subtypeAnnualPercentageDisplay = `${subtypeAnnualPctNumber}%${subtypeAnnualPctSign}`;
        } else {
          subtypePercentageDisplay = '0% (עתידי)';
          subtypeAnnualPercentageDisplay = '0% (עתידי)';
        }

        // For "0% (עתידי)" - always use neutral light variant color
        const subtypePctClass = subtypeAccountBalance > 0
          ? subtypePercentageChange >= 0 ? 'text-success' : subtypePercentageChange < 0 ? 'text-danger' : ''
          : ''; // Neutral (light variant) - no color class
        const subtypeAnnualPctClass = subtypeAccountBalance > 0
          ? subtypeAnnualPercentageChange >= 0 ? 'text-success' : subtypeAnnualPercentageChange < 0 ? 'text-danger' : ''
          : ''; // Neutral (light variant) - no color class

        html += '<div class="statistics-card-content statistics-card-two-columns">';
        html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${subtypeAverageHtml}</strong> | <strong class="${subtypePctClass}">${subtypePercentageDisplay}</strong></div>`;
        html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${subtypeAnnualAmountChangeHtml}</strong> | <strong class="${subtypeAnnualPctClass}">${subtypeAnnualPercentageDisplay}</strong></div>`;
        html += '</div>';
        html += '</div>';
      }

      html += '</div>'; // End statistics-subtype-group
    });

    html += '</div>'; // End statistics-breakdown
  }

  return html;
}

// Export function globally
window.updateActivityStatistics = updateActivityStatistics;

/**
 * Hook into filter system to update statistics when filters change
 */
function setupStatisticsFilterHook() {
  // Listen for filter changes via MutationObserver on table
  const table = document.getElementById('accountActivityTable');
  if (!table) {return;}

  // Create observer to watch for row visibility changes
  const observer = new MutationObserver(() => {
    // Debounce to avoid excessive updates
    clearTimeout(window.accountActivityState.statsUpdateTimeout);
    window.accountActivityState.statsUpdateTimeout = setTimeout(() => {
      if (window.updateActivityStatistics) {
        window.updateActivityStatistics();
      }
      // Also update activity summary to refresh date range in title
      if (window.accountActivityState && window.accountActivityState.activityData) {
        updateActivitySummary(window.accountActivityState.activityData);
      } else {
        updateActivitySummary(null);
      }
    }, 300);
  });

  // Observe changes in tbody
  const tbody = table.querySelector('tbody');
  if (tbody) {
    observer.observe(tbody, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'data-movement-type'],
    });
  }

  // Also listen for header system filter application
  if (window.HeaderSystem && window.HeaderSystem.filterSystem) {
    const originalApplyFilters = window.HeaderSystem.filterSystem.applyFiltersToTable;
    if (originalApplyFilters) {
      window.HeaderSystem.filterSystem.applyFiltersToTable = function(tableId) {
        const result = originalApplyFilters.call(this, tableId);
        // If this is the account activity table, update statistics
        if (tableId === 'accountActivityTable') {
          setTimeout(() => {
            if (window.updateActivityStatistics) {
              window.updateActivityStatistics();
            }
            // Also update activity summary to refresh date range in title
            if (window.accountActivityState && window.accountActivityState.activityData) {
              updateActivitySummary(window.accountActivityState.activityData);
            } else {
              updateActivitySummary(null);
            }
          }, 100);
        }
        return result;
      };
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (typeof window.initAccountActivity === 'function') {
        window.initAccountActivity();
      }
    }, 1000);
  });
} else {
  setTimeout(() => {
    if (typeof window.initAccountActivity === 'function') {
      window.initAccountActivity();
    }
  }, 1000);
}

// Export functions globally
window.loadAccountActivity = loadAccountActivity;
window.populateAccountSelector = populateAccountSelector;
window.populateAccountActivityTable = populateAccountActivityTable; // Export for UnifiedTableSystem

window.Logger.info('✅ account-activity.js נטען בהצלחה', { page: 'trading_accounts', keepInfo: true });

