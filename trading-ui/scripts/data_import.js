/**
 * TikTrack - Data Import Page Controller
 * ======================================
 *
 * File: trading-ui/scripts/data_import.js
 * Description: Controls the dedicated "Data Import" page, providing summary
 *              statistics and import history across accounts, while wiring the
 *              unified Import User Data modal.
 *
 * Documentation:
 * - documentation/systems/user-data-import-system.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 *
 * Function Index:
 * 1. initializeDataImportPage
 * 2. refreshDataImportHistory
 * 3. fetchTradingAccounts
 * 4. fetchHistoryForAccount
 * 5. resolveAccountDisplayName
 * 6. normalizeSessionRecord
 * 7. renderImportSummary
 * 8. renderImportHistoryTable
 * 9. renderHistoryRow
 * 10. setLoadingState
 * 11. toggleEmptyState
 * 12. toggleErrorState
 * 13. notify
 */

(function initializeDataImportModule() {
    'use strict';

    const PAGE_NAME = 'data_import';
    const Logger = window.Logger || {
        info: () => {},
        warn: () => {},
        error: () => {}
    };

    const ACTIVE_STATUSES = new Set(['created', 'analyzing', 'ready', 'importing']);

    const state = {
        accounts: [],
        sessions: [],
        loading: false,
        lastError: null
    };

    const SELECTORS = {
        tableBody: '#importHistoryTableBody',
        emptyState: '#importHistoryEmptyState',
        errorState: '#importHistoryErrorState',
        errorMessage: '#importHistoryErrorMessage',
        summaryTotal: '#totalImportSessions',
        summaryLastImport: '#lastImportTime',
        summaryActiveStatus: '#activeImportStatus',
        container: '#importHistoryContainer',
        openModalButton: '#openImportModalBtn',
        refreshButton: '#refreshHistoryBtn'
    };

    const API_ENDPOINTS = {
        accounts: '/api/trading-accounts/',
        history: (accountId, limit = 20) =>
            `/api/user-data-import/history?trading_account_id=${accountId}&limit=${limit}&_=${Date.now()}`
    };

    /**
     * Initializes the Data Import page.
     * @async
     * @function initializeDataImportPage
     * @returns {Promise<void>}
     */
    async function initializeDataImportPage() {
        Logger.info('🚀 Initializing Data Import page', { page: PAGE_NAME });

        try {
            setLoadingState(true);

            if (typeof window.initializeImportUserDataModal === 'function') {
                await window.initializeImportUserDataModal();
            }

            if (typeof window.processButtons === 'function') {
                window.processButtons();
            }

            if (typeof window.restoreAllSectionStates === 'function') {
                await window.restoreAllSectionStates();
            }

            await refreshDataImportHistory(true);
        } catch (error) {
            Logger.error('❌ Failed to initialize Data Import page', { error, page: PAGE_NAME });
            notify('שגיאה בטעינת עמוד ייבוא הנתונים. נסה לרענן את הדף.', 'error');
            toggleErrorState(true, error.message || 'שגיאה לא ידועה');
        } finally {
            setLoadingState(false);
        }
    }

    /**
     * Refreshes the import history data.
     * @async
     * @function refreshDataImportHistory
     * @param {boolean} [force] - Force reload even if already loading.
     * @returns {Promise<void>}
     */
    async function refreshDataImportHistory(force = false) {
        if (state.loading && !force) {
            Logger.warn('⚠️ Refresh ignored - already loading', { page: PAGE_NAME });
            return;
        }

        Logger.info('🔄 Refreshing import history', { page: PAGE_NAME });
        setLoadingState(true);
        toggleErrorState(false);

        try {
            const accounts = await fetchTradingAccounts();
            state.accounts = accounts;

            if (!accounts.length) {
                Logger.warn('⚠️ No trading accounts found', { page: PAGE_NAME });
            }

            const historyPromises = accounts.map(fetchHistoryForAccount);
            const historyResults = await Promise.all(historyPromises);

            const sessions = historyResults
                .flat()
                .map(normalizeSessionRecord)
                .sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return bTime - aTime;
                });

            state.sessions = sessions;
            state.lastError = null;

            renderImportSummary();
            renderImportHistoryTable();
        } catch (error) {
            state.lastError = error;
            Logger.error('❌ Failed to refresh import history', { error, page: PAGE_NAME });
            notify('שגיאה בטעינת היסטוריית הייבוא. נסה שוב או בדוק את הלוגים.', 'error');
            toggleErrorState(true, error.message || 'שגיאה לא ידועה בטעינת הנתונים');
        } finally {
            setLoadingState(false);
        }
    }

    /**
     * Fetch trading accounts from the API.
     * @async
     * @function fetchTradingAccounts
     * @returns {Promise<Array<Object>>}
     */
    async function fetchTradingAccounts() {
        try {
            const response = await fetch(API_ENDPOINTS.accounts, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`קוד שגיאה ${response.status} בהבאת חשבונות המסחר`);
            }

            const payload = await response.json();
            const accounts = payload.data || payload || [];

            return Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            throw new Error(error.message || 'שגיאה בטעינת רשימת החשבונות');
        }
    }

    /**
     * Fetch import history for a specific account.
     * @async
     * @function fetchHistoryForAccount
     * @param {Object} account - Trading account object.
     * @returns {Promise<Array<Object>>}
     */
    async function fetchHistoryForAccount(account) {
        if (!account || !account.id) {
            return [];
        }

        try {
            const response = await fetch(API_ENDPOINTS.history(account.id), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`קוד שגיאה ${response.status} בהבאת היסטוריה לחשבון ${account.id}`);
            }

            const payload = await response.json();
            const sessions = payload.sessions || payload.data || [];

            if (!Array.isArray(sessions)) {
                return [];
            }

            return sessions.map(session => ({
                ...session,
                trading_account_id: account.id,
                trading_account_name: resolveAccountDisplayName(account)
            }));
        } catch (error) {
            Logger.error('❌ Failed to fetch history for account', {
                error,
                accountId: account.id,
                page: PAGE_NAME
            });
            return [];
        }
    }

    /**
     * Resolve the display name for a trading account.
     * @function resolveAccountDisplayName
     * @param {Object} account - Trading account data.
     * @returns {string}
     */
    function resolveAccountDisplayName(account) {
        if (!account) {
            return 'לא ידוע';
        }

        return (
            account.account_name ||
            account.display_name ||
            account.name ||
            account.external_account_id ||
            `חשבון #${account.id}`
        );
    }

    /**
     * Normalize session record for rendering.
     * @function normalizeSessionRecord
     * @param {Object} session - Raw session object.
     * @returns {Object}
     */
    function normalizeSessionRecord(session) {
        const createdAt = session.created_at || null;
        const completedAt = session.completed_at || null;

        return {
            id: session.id,
            tradingAccountId: session.trading_account_id,
            tradingAccountName: session.trading_account_name || 'לא ידוע',
            provider: session.provider || 'לא צויין',
            fileName: session.file_name || 'לא צויין',
            totalRecords: Number(session.total_records) || 0,
            importedRecords: Number(session.imported_records) || 0,
            skippedRecords: Number(session.skipped_records) || 0,
            status: session.status || 'unknown',
            summaryData: session.summary_data || {},
            createdAt,
            completedAt
        };
    }

    /**
     * Render summary statistics above the table.
     * @function renderImportSummary
     * @returns {void}
     */
    function renderImportSummary() {
        const totalElement = document.querySelector(SELECTORS.summaryTotal);
        const lastImportElement = document.querySelector(SELECTORS.summaryLastImport);
        const activeStatusElement = document.querySelector(SELECTORS.summaryActiveStatus);

        if (totalElement) {
            totalElement.textContent = state.sessions.length.toString();
        }

        if (lastImportElement) {
            const latestSession = state.sessions[0];
            if (latestSession && latestSession.createdAt) {
                const formatted = formatDateValue(latestSession.completedAt || latestSession.createdAt);
                lastImportElement.textContent = formatted || 'לא זמין';
            } else {
                lastImportElement.textContent = 'לא זמין';
            }
        }

        if (activeStatusElement) {
            const activeSession = state.sessions.find(session => ACTIVE_STATUSES.has(session.status));
            if (activeSession) {
                activeStatusElement.textContent = `${activeSession.status} (סשן ${activeSession.id})`;
            } else {
                activeStatusElement.textContent = 'אין סשנים פעילים';
            }
        }
    }

    /**
     * Render the import history table.
     * @function renderImportHistoryTable
     * @returns {void}
     */
    function renderImportHistoryTable() {
        const tableBody = document.querySelector(SELECTORS.tableBody);
        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = '';

        if (!state.sessions.length) {
            toggleEmptyState(true);
            return;
        }

        toggleEmptyState(false);

        const rowsFragment = document.createDocumentFragment();
        state.sessions.forEach(session => {
            rowsFragment.appendChild(renderHistoryRow(session));
        });

        tableBody.appendChild(rowsFragment);

        if (typeof window.processButtons === 'function') {
            window.processButtons();
        }
    }

    /**
     * Create a table row element for the import history table.
     * @function renderHistoryRow
     * @param {Object} session - Normalized session data.
     * @returns {HTMLTableRowElement}
     */
    function renderHistoryRow(session) {
        const row = document.createElement('tr');
        row.setAttribute('data-session-id', session.id);

        const statusDisplay = renderStatus(session.status);

        const createdDisplay = formatDateValue(session.createdAt);
        const updatedDisplay = formatDateValue(session.completedAt || session.createdAt);

        row.innerHTML = [
            `<td class="col-session-id">#${session.id}</td>`,
            `<td class="col-account">${session.tradingAccountName}</td>`,
            `<td class="col-provider">${session.provider}</td>`,
            `<td class="col-file" title="${session.fileName}">${session.fileName}</td>`,
            `<td class="col-status">${statusDisplay}</td>`,
            `<td class="col-records text-center">${session.totalRecords}</td>`,
            `<td class="col-imported text-center">${session.importedRecords}</td>`,
            `<td class="col-skipped text-center">${session.skippedRecords}</td>`,
            `<td class="col-created">${createdDisplay || 'לא זמין'}</td>`,
            `<td class="col-updated">${updatedDisplay || 'לא זמין'}</td>`
        ].join('');

        return row;
    }

    /**
     * Render status using the FieldRendererService when available.
     * @function renderStatus
     * @param {string} status - Session status.
     * @returns {string}
     */
    function renderStatus(status) {
        if (window.FieldRendererService?.renderStatus) {
            return window.FieldRendererService.renderStatus(status, 'import_session');
        }

        return `<span class="status-badge status-${status || 'unknown'}">${status || 'לא ידוע'}</span>`;
    }

    /**
     * Format date/time values via the shared date utilities.
     * @function formatDateValue
     * @param {string|null} value - ISO string or null.
     * @returns {string}
     */
    function formatDateValue(value) {
        if (!value) {
            return '';
        }

        if (window.dateUtils?.formatDateTime) {
            return window.dateUtils.formatDateTime(value);
        }

        if (typeof window.formatDateTime === 'function') {
            return window.formatDateTime(value);
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString('he-IL');
    }

    /**
     * Toggle loading state indicators.
     * @function setLoadingState
     * @param {boolean} isLoading - Loading state.
     * @returns {void}
     */
    function setLoadingState(isLoading) {
        state.loading = isLoading;

        const refreshButton = document.querySelector(SELECTORS.refreshButton);
        if (refreshButton) {
            refreshButton.disabled = isLoading;
            refreshButton.setAttribute('aria-busy', String(isLoading));
        }

        const container = document.querySelector(SELECTORS.container);
        if (container) {
            container.classList.toggle('loading', isLoading);
        }
    }

    /**
     * Toggle empty state visibility.
     * @function toggleEmptyState
     * @param {boolean} isVisible - Whether to show the empty state.
     * @returns {void}
     */
    function toggleEmptyState(isVisible) {
        const emptyState = document.querySelector(SELECTORS.emptyState);
        if (emptyState) {
            emptyState.style.display = isVisible ? 'block' : 'none';
        }

        const tableBody = document.querySelector(SELECTORS.tableBody);
        if (tableBody) {
            tableBody.style.display = isVisible ? 'none' : '';
        }
    }

    /**
     * Toggle error state visibility and message.
     * @function toggleErrorState
     * @param {boolean} isVisible - Whether to show the error state.
     * @param {string} [message] - Error message to display.
     * @returns {void}
     */
    function toggleErrorState(isVisible, message = '') {
        const errorState = document.querySelector(SELECTORS.errorState);
        const messageElement = document.querySelector(SELECTORS.errorMessage);

        if (errorState) {
            errorState.style.display = isVisible ? 'block' : 'none';
        }

        if (messageElement && message) {
            messageElement.textContent = message;
        }
    }

    /**
     * Dispatch notification through the shared notification system.
     * @function notify
     * @param {string} message - Notification message.
     * @param {'info'|'success'|'warning'|'error'} [type='info'] - Notification type.
     * @returns {void}
     */
    function notify(message, type = 'info') {
        if (typeof window.showImportUserDataNotification === 'function') {
            window.showImportUserDataNotification(message, type);
        } else if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (type === 'error') {
            Logger.error(message, { page: PAGE_NAME });
        } else {
            Logger.info(message, { page: PAGE_NAME });
        }
    }

    // Expose globals for the unified initializer
    window.initializeDataImportPage = initializeDataImportPage;
    window.refreshDataImportHistory = refreshDataImportHistory;
})();

