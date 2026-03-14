/**
 * Trading Accounts Table Initialization - Initialize table managers and CRUD handlers
 * -----------------------------------------------------------------
 * אתחול Table Managers עבור כל הטבלאות ב-Trading Accounts View
 * כולל handlers ל-CRUD operations
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

import { loadContainer1 } from './tradingAccountsDataLoader.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { showTradingAccountFormModal } from './tradingAccountsForm.js';

// Import masked log utility for security compliance
import { maskedLog } from '../../../utils/maskedLog.js';

(function initTradingAccountsTables() {
  'use strict';

  let tableData = { data: [], total: 0 };

  /**
   * Load table data
   */
  async function loadTableData() {
    try {
      // Reload table using loadContainer1 which handles DOM updates
      await loadContainer1({});

      // Also update internal tableData for reference
      await sharedServices.init();
      const accountsData = await sharedServices.get('/trading_accounts', {});
      tableData = {
        data: accountsData.data || [],
        total: accountsData.total || 0,
      };

      // Re-initialize action handlers after table reload
      initActionHandlers();
    } catch (error) {
      maskedLog('[Trading Accounts] Error loading table data:', {
        errorCode: error.code,
        status: error.status,
      });
    }
  }

  /**
   * Initialize all table managers
   */
  function initializeTableManagers() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        initTables();
        initActionHandlers();
        initAddButton();
      });
    } else {
      initTables();
      initActionHandlers();
      initAddButton();
    }
  }

  /**
   * Initialize individual tables
   */
  function initTables() {
    // Initialize Sort and Filter Managers for each table
    const accountsTable = document.querySelector('#accountsTable');
    if (
      accountsTable &&
      window.PhoenixTableSortManager &&
      window.PhoenixTableFilterManager
    ) {
      const accountsSortManager = new window.PhoenixTableSortManager(
        accountsTable,
      );
      const accountsFilterManager = new window.PhoenixTableFilterManager(
        accountsTable,
      );
    }

    const accountActivityTable = document.querySelector(
      '#accountActivityTable',
    );
    if (
      accountActivityTable &&
      window.PhoenixTableSortManager &&
      window.PhoenixTableFilterManager
    ) {
      const activitySortManager = new window.PhoenixTableSortManager(
        accountActivityTable,
      );
      const activityFilterManager = new window.PhoenixTableFilterManager(
        accountActivityTable,
      );
    }

    const positionsTable = document.querySelector('#positionsTable');
    if (
      positionsTable &&
      window.PhoenixTableSortManager &&
      window.PhoenixTableFilterManager
    ) {
      const positionsSortManager = new window.PhoenixTableSortManager(
        positionsTable,
      );
      const positionsFilterManager = new window.PhoenixTableFilterManager(
        positionsTable,
      );
    }
  }

  /**
   * Initialize add button handler
   * Retries until button is found in DOM (handles UAI async loading)
   */
  function initAddButton() {
    const addButton = document.querySelector('.js-add-trading-account');

    if (addButton) {
      // Button found - add listener
      addButton.addEventListener('click', function (e) {
        e.preventDefault();
        handleAddTradingAccount();
      });
    } else {
      // Button not found yet - retry after a short delay
      // This handles the case where UAI hasn't finished rendering yet
      let retries = 0;
      const maxRetries = 20; // Try for up to 2 seconds (20 * 100ms)

      const retryInterval = setInterval(() => {
        retries++;
        const button = document.querySelector('.js-add-trading-account');

        if (button) {
          clearInterval(retryInterval);
          button.addEventListener('click', function (e) {
            e.preventDefault();
            handleAddTradingAccount();
          });
        } else if (retries >= maxRetries) {
          clearInterval(retryInterval);
          // Button still not found after retries - log for debugging
          maskedLog('[Trading Accounts] Add button not found after retries', {
            retries: retries,
            readyState: document.readyState,
          });
        }
      }, 100);
    }
  }

  /**
   * Initialize action handlers
   */
  function initActionHandlers() {
    // Use event delegation for dynamically created buttons
    const accountsTable = document.querySelector('#accountsTable');
    if (accountsTable) {
      accountsTable.addEventListener('click', function (e) {
        const target = e.target.closest(
          '.js-action-view, .js-action-edit, .js-action-delete',
        );
        if (!target) return;

        e.preventDefault();
        const accountId = target.getAttribute('data-account-id');
        if (!accountId) return;

        if (target.classList.contains('js-action-view')) {
          handleViewTradingAccount(accountId);
        } else if (target.classList.contains('js-action-edit')) {
          handleEditTradingAccount(accountId);
        } else if (target.classList.contains('js-action-delete')) {
          handleDeleteTradingAccount(accountId);
        }
      });
    }
  }

  /**
   * Handle view trading account action
   */
  async function handleViewTradingAccount(accountId) {
    try {
      await sharedServices.init();
      const response = await sharedServices.get(
        `/trading_accounts/${accountId}`,
      );
      const account = response.data || response;

      // Show view modal/dialog with account details
      showTradingAccountModal(account, 'view');
    } catch (error) {
      maskedLog('[Trading Accounts] Error viewing account:', {
        errorCode: error.code,
        status: error.status,
      });
      alert('שגיאה בטעינת פרטי חשבון מסחר');
    }
  }

  /**
   * Handle edit trading account action
   */
  async function handleEditTradingAccount(accountId) {
    try {
      await sharedServices.init();
      const response = await sharedServices.get(
        `/trading_accounts/${accountId}`,
      );
      const account = response.data || response;

      // Show edit modal/dialog with account data
      showTradingAccountModal(account, 'edit');
    } catch (error) {
      maskedLog('[Trading Accounts] Error loading account for edit:', {
        errorCode: error.code,
        status: error.status,
      });
      alert('שגיאה בטעינת פרטי החשבון לעריכה');
    }
  }

  /**
   * Handle delete trading account action
   */
  async function handleDeleteTradingAccount(accountId) {
    if (
      !confirm(
        'האם אתה בטוח שברצונך למחוק את חשבון המסחר? פעולה זו לא ניתנת לביטול.',
      )
    ) {
      return;
    }

    try {
      await sharedServices.init();
      await sharedServices.delete(`/trading_accounts/${accountId}`);

      maskedLog('[Trading Accounts] Account deleted successfully', {
        accountId,
      });

      // Reload table data
      await loadTableData();
    } catch (error) {
      maskedLog('[Trading Accounts] Error deleting account:', {
        errorCode: error.code,
        status: error.status,
      });

      let errorMessage = 'שגיאה במחיקת חשבון המסחר';
      if (error.message_i18n || error.message) {
        errorMessage = error.message_i18n || error.message;
      }

      alert(errorMessage);
    }
  }

  /**
   * Handle add new trading account action
   */
  function handleAddTradingAccount() {
    // Show add modal/dialog with empty form
    showTradingAccountModal(null, 'add');
  }

  /**
   * Show trading account modal (view/edit/add)
   */
  function showTradingAccountModal(data, mode) {
    if (mode === 'view') {
      // View mode - show read-only details
      const accountName =
        data?.accountName || data?.displayName || data?.account_name || '';
      const broker = data?.broker || '';
      const accountNumber = data?.accountNumber || data?.account_number || '';
      const balance =
        data?.balance || data?.cashBalance || data?.cash_balance || 0;
      const currency = data?.currency || 'USD';
      const isActive =
        data?.isActive !== undefined
          ? data.isActive
          : data?.is_active !== undefined
            ? data.is_active
            : true;
      const externalAccountId =
        data?.externalAccountId || data?.external_account_id || '';

      alert(
        `צפייה בחשבון מסחר:\nשם: ${accountName}\nברוקר: ${broker || 'לא צוין'}\nמספר חשבון: ${accountNumber || 'לא צוין'}\nיתרה: ${balance} ${currency}\nסטטוס: ${isActive ? 'פעיל' : 'לא פעיל'}\nמזהה חיצוני: ${externalAccountId || 'לא צוין'}`,
      );
    } else if (mode === 'edit') {
      // Edit mode - show form with existing data
      showTradingAccountFormModal(
        data,
        async function (formData, originalData) {
          return await handleSaveTradingAccount(
            originalData.externalUlid ||
              originalData.external_ulid ||
              originalData.id,
            formData,
          );
        },
        { existingAccounts: tableData.data || [] },
      );
    } else if (mode === 'add') {
      // Add mode - show empty form (pass existing for uniqueness validation)
      showTradingAccountFormModal(
        null,
        async function (formData) {
          return await handleSaveTradingAccount(null, formData);
        },
        { existingAccounts: tableData.data || [] },
      );
    }
  }

  // Export for use by add button if exists
  window.handleAddTradingAccount = handleAddTradingAccount;

  /**
   * Handle save trading account (create or update)
   */
  async function handleSaveTradingAccount(accountId, accountData) {
    try {
      await sharedServices.init();

      // Prepare data for API (ensure camelCase format and numeric types)
      const apiData = {};

      // Required fields
      apiData.accountName = accountData.accountName || '';
      apiData.initialBalance =
        typeof accountData.initialBalance === 'number'
          ? accountData.initialBalance
          : parseFloat(accountData.initialBalance) || 0;
      apiData.currency = accountData.currency || 'USD';
      apiData.isActive =
        accountData.isActive !== undefined ? accountData.isActive : true;

      // Optional fields - only include if they have values
      if (accountData.broker && accountData.broker.trim()) {
        apiData.broker = accountData.broker.trim();
      }
      if (accountData.accountNumber && accountData.accountNumber.trim()) {
        apiData.accountNumber = accountData.accountNumber.trim();
      }
      if (
        accountData.externalAccountId &&
        accountData.externalAccountId.trim()
      ) {
        apiData.externalAccountId = accountData.externalAccountId.trim();
      }

      // Debug log (will be masked)
      maskedLog('[Trading Accounts] Sending data to API:', {
        accountId: accountId,
        accountName: apiData.accountName,
        broker: apiData.broker,
        initialBalance: apiData.initialBalance,
        currency: apiData.currency,
        isActive: apiData.isActive,
      });

      if (accountId) {
        // Update existing
        await sharedServices.put(`/trading_accounts/${accountId}`, apiData);
        maskedLog('[Trading Accounts] Account updated successfully', {
          accountId,
        });
      } else {
        // Create new
        await sharedServices.post('/trading_accounts', apiData);
        maskedLog('[Trading Accounts] Account created successfully');
      }

      // Reload table data
      await loadTableData();
    } catch (error) {
      maskedLog('[Trading Accounts] Error saving account:', {
        errorCode: error.code,
        status: error.status,
        details: error.details,
      });

      // Show user-friendly error message
      let errorMessage = 'שגיאה בשמירת חשבון המסחר';

      // Handle authentication errors (401)
      if (error.code === 'HTTP_401' || error.status === 401) {
        errorMessage = 'אינך מחובר למערכת. אנא התחבר מחדש.';
        alert(errorMessage);
        // Throw error to prevent modal from closing
        const authError = new Error(errorMessage);
        authError.code = 'HTTP_401';
        authError.status = 401;
        throw authError;
      }

      // Handle validation errors with field details
      if (error.code === 'VALIDATION_FIELD_REQUIRED' || error.status === 422) {
        // Try to extract detailed error information
        let detailedMessage = error.message || '';

        // Check if error.details contains field-specific information
        if (error.details) {
          if (error.details.field) {
            const fieldName =
              error.details.field === 'account_name'
                ? 'שם חשבון מסחר'
                : error.details.field === 'initial_balance'
                  ? 'יתרה התחלתית'
                  : error.details.field === 'currency'
                    ? 'מטבע'
                    : error.details.field;
            detailedMessage = `שגיאה בשדה ${fieldName}: ${error.details.message || error.message || 'אנא מלא את השדה הנדרש'}`;
          } else if (typeof error.details === 'object') {
            // Check for Pydantic validation errors format
            const detailKeys = Object.keys(error.details);
            if (detailKeys.length > 0) {
              const firstError = error.details[detailKeys[0]];
              if (Array.isArray(firstError) && firstError.length > 0) {
                detailedMessage = firstError[0];
              } else if (typeof firstError === 'string') {
                detailedMessage = firstError;
              }
            }
          }
        }

        if (detailedMessage && detailedMessage !== error.message) {
          errorMessage = detailedMessage;
        } else {
          errorMessage = error.message || 'אנא מלא את כל השדות הנדרשים';
        }
      } else if (error.message_i18n || error.message) {
        errorMessage = error.message_i18n || error.message;
      }

      // Log full error for debugging (will be masked)
      maskedLog('[Trading Accounts] Full error details:', {
        code: error.code,
        status: error.status,
        message: error.message,
        details: error.details,
      });

      alert(errorMessage);
      // Re-throw error to prevent modal from closing on error
      throw error;
    }
  }

  // Auto-initialize
  initializeTableManagers();

  // Gate A Fix: Load table data only when authenticated - prevents 401 for guests
  if (
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('access_token') ||
    sessionStorage.getItem('authToken')
  ) {
    loadTableData();
  }
})();
