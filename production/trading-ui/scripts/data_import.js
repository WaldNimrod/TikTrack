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

    const TABLE_TYPE = 'import_history';
    const TABLE_ID = 'importHistoryTable';
    const MAX_TABLE_REGISTRATION_ATTEMPTS = 20;
    let tableRegistrationAttempts = 0;

    const ACTIVE_STATUSES = new Set(['created', 'analyzing', 'ready', 'importing']);

    const state = {
        accounts: [],
        sessions: [],
        loading: false,
        lastError: null,
        tableRegistered: false
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
     * Normalize any date-like value into the unified DateEnvelope structure.
     * Falls back gracefully if the utilities are unavailable.
     * @param {any} value
     * @returns {Object|null}
     */
    function coerceDateEnvelope(value) {
        if (!value) {
            return null;
        }

        try {
            if (window.dateUtils?.ensureDateEnvelope) {
                return window.dateUtils.ensureDateEnvelope(value);
            }
        } catch (error) {
            Logger.warn?.('⚠️ Failed to normalize date envelope', { value, error: error.message, page: PAGE_NAME });
        }

        if (typeof value === 'object') {
            return value;
        }

        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
            // Use dateUtils for consistent date handling
            let dateObj;
            if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
              dateObj = window.dateUtils.toDateObject({ epochMs: parsed });
            } else {
              dateObj = new Date(parsed);
            }
            const iso = dateObj.toISOString();
            // Use FieldRendererService or dateUtils for consistent date formatting
            let display;
            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
              display = window.FieldRendererService.renderDate(dateObj, true);
            } else if (window.formatDate) {
              display = window.formatDate(dateObj, true);
            } else if (window.dateUtils?.formatDate) {
              display = window.dateUtils.formatDate(dateObj, { includeTime: true });
            } else {
              display = dateObj.toLocaleString('he-IL');
            }
            return {
                utc: iso,
                local: iso,
                epochMs: parsed,
                display: display
            };
        }

        return { display: String(value) };
    }

    /**
     * Extract epoch (ms) from envelope or plain date.
     * @param {Object|string|null} envelope
     * @returns {number}
     */
    function getEpochFromEnvelope(envelope) {
        if (!envelope) {
            return 0;
        }

        if (typeof envelope === 'number') {
            return envelope;
        }

        const candidate = envelope.epochMs
            ?? (envelope.utc ? Date.parse(envelope.utc) : null)
            ?? (envelope.local ? Date.parse(envelope.local) : null)
            ?? (typeof envelope === 'string' ? Date.parse(envelope) : null);

        return Number.isFinite(candidate) ? candidate : 0;
    }

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
                window.processButtons(document);
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

            const historyResults = [];
            for (const account of accounts) {
                // קריאה סדרתית כדי להפחית עומס וקונפליקטים על שכבת ה-DB
                // המערכת המרכזית מנהלת לוגינג פנימי ב-fetchHistoryForAccount עבור שגיאות.
                /* eslint-disable no-await-in-loop */
                const accountHistory = await fetchHistoryForAccount(account);
                /* eslint-enable no-await-in-loop */
                historyResults.push(accountHistory);
            }

            const sessions = historyResults
                .flat()
                .map(normalizeSessionRecord)
                .sort((a, b) => (b.createdAtEpoch || 0) - (a.createdAtEpoch || 0));

            state.sessions = sessions;
            state.lastError = null;

            updateTableRegistry(state.sessions);
            renderImportSummary();
            renderImportHistoryTable();
            
            // Register table after rendering (only once)
            registerDataImportTable();
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
     * Uses DataImportData service for unified caching and error handling.
     * @async
     * @function fetchTradingAccounts
     * @returns {Promise<Array<Object>>}
     */
    async function fetchTradingAccounts() {
        try {
            if (window.DataImportData?.loadTradingAccountsForImport) {
                return await window.DataImportData.loadTradingAccountsForImport();
            }
            // Fallback to direct fetch if service not available
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
     * Uses DataImportData service for unified caching and error handling.
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
            let sessions = [];
            
            if (window.DataImportData?.loadImportHistoryData) {
                sessions = await window.DataImportData.loadImportHistoryData({
                    accountId: account.id,
                    limit: 20
                });
                Logger.debug('📦 Fetched history via DataImportData service', {
                    accountId: account.id,
                    sessionsCount: Array.isArray(sessions) ? sessions.length : 0,
                    page: PAGE_NAME
                });
            } else {
                // Fallback to direct fetch if service not available
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
                sessions = payload.sessions || payload.data || [];
                Logger.debug('📦 Fetched history via direct fetch', {
                    accountId: account.id,
                    sessionsCount: Array.isArray(sessions) ? sessions.length : 0,
                    page: PAGE_NAME
                });
            }

            if (!Array.isArray(sessions)) {
                Logger.warn('⚠️ Sessions is not an array', {
                    accountId: account.id,
                    sessionsType: typeof sessions,
                    sessions,
                    page: PAGE_NAME
                });
                return [];
            }

            const enrichedSessions = sessions.map(session => ({
                ...session,
                trading_account_id: account.id,
                trading_account_name: resolveAccountDisplayName(account)
            }));

            Logger.debug('✅ Enriched sessions with account info', {
                accountId: account.id,
                enrichedCount: enrichedSessions.length,
                page: PAGE_NAME
            });

            return enrichedSessions;
        } catch (error) {
            Logger.error('❌ Failed to fetch history for account', {
                error: error?.message || error,
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
        const summary = session.summary_data || {};
        const analysisTimestamp = summary.analysis_timestamp || summary.analysis?.timestamp || null;
        const previewTimestamp = summary.preview_timestamp || summary.preview?.timestamp || null;

        // Use completed_at as fallback if created_at is null/undefined
        const createdSource =
            session.created_at ||
            summary.created_at ||
            session.completed_at ||  // Fallback to completed_at
            summary.completed_at ||  // Fallback to completed_at from summary
            analysisTimestamp;

        const updatedSource =
            session.completed_at ||
            summary.completed_at ||
            previewTimestamp ||
            analysisTimestamp ||
            createdSource;  // Fallback to createdSource if nothing else available

        const createdEnvelope = coerceDateEnvelope(createdSource);
        const updatedEnvelope = coerceDateEnvelope(updatedSource);

        return {
            id: session.id,
            tradingAccountId: session.trading_account_id,
            tradingAccountName: session.trading_account_name || 'לא ידוע',
            trading_account_name: session.trading_account_name || 'לא ידוע',
            provider: session.provider || 'לא צויין',
            provider_name: session.provider || 'לא צויין',
            fileName: session.file_name || 'לא צויין',
            file_name: session.file_name || 'לא צויין',
            totalRecords: Number(session.total_records) || 0,
            total_records: Number(session.total_records) || 0,
            importedRecords: Number(session.imported_records) || 0,
            imported_records: Number(session.imported_records) || 0,
            skippedRecords: Number(session.skipped_records) || 0,
            skipped_records: Number(session.skipped_records) || 0,
            status: session.status || 'unknown',
            status_label: session.status || 'unknown',
            summaryData: summary,
            createdAt: createdEnvelope,
            createdAtEpoch: getEpochFromEnvelope(createdEnvelope),
            createdAtDisplay: formatDateValue(createdEnvelope),
            created_at: createdEnvelope,
            updatedAt: updatedEnvelope,
            updatedAtEpoch: getEpochFromEnvelope(updatedEnvelope),
            updatedAtDisplay: formatDateValue(updatedEnvelope || createdEnvelope),
            completed_at: updatedEnvelope
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
            const displayValue = latestSession?.updatedAtDisplay || latestSession?.createdAtDisplay || 'לא זמין';
            lastImportElement.textContent = displayValue || 'לא זמין';
        }

        if (activeStatusElement) {
            const activeSession = state.sessions.find(session => ACTIVE_STATUSES.has(session.status));
            if (activeSession) {
                const statusHtml = renderStatus(activeSession.status);
                activeStatusElement.innerHTML = `${statusHtml} <span class="session-meta">(#${activeSession.id})</span>`;
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
    function renderImportHistoryTable(tableData = null) {
        const tableBody = document.querySelector(SELECTORS.tableBody);
        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = '';

        const effectiveData = Array.isArray(tableData) ? tableData : state.sessions;

        if (!effectiveData.length) {
            toggleEmptyState(true);
            if (window.TableDataRegistry) {
                window.TableDataRegistry.setPageData(TABLE_TYPE, [], { tableId: TABLE_ID, skipCounts: true });
            }
            return;
        }

        toggleEmptyState(false);

        const rowsFragment = document.createDocumentFragment();
        effectiveData.forEach(session => {
            rowsFragment.appendChild(renderHistoryRow(session));
        });

        tableBody.appendChild(rowsFragment);

        if (typeof window.processButtons === 'function') {
            window.processButtons();
        }

        if (window.TableDataRegistry) {
            window.TableDataRegistry.setPageData(TABLE_TYPE, effectiveData, {
                tableId: TABLE_ID,
                skipCounts: false,
                pageInfo: {
                    currentPageSize: effectiveData.length
                }
            });
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
        row.classList.add('table-row-clickable');
        row.style.cursor = 'pointer';
        
        // Add click handler to open details modal
        row.setAttribute('data-onclick', `if(window.showEntityDetails) { window.showEntityDetails('import_session', ${session.id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('import_session', ${session.id}, 'view'); } else { window.Logger?.warn('Entity details modal not available', { page: 'data_import' }); }`);
        row.setAttribute('title', 'לחץ לפתיחת פרטי סשן ייבוא');

        const statusDisplay = renderStatus(session.status);

        const createdDisplay = session.createdAtDisplay || formatDateValue(session.createdAt);
        const updatedDisplay = session.updatedAtDisplay || formatDateValue(session.updatedAt || session.createdAt);

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
            `<td class="col-updated">${updatedDisplay || 'לא זמין'}</td>`,
            `<td class="col-actions text-center">
                <button data-button-type="ACTION" 
                        data-variant="primary" 
                        data-size="small" 
                        data-icon="🔄" 
                        data-text="הרצה חוזרת" 
                        data-onclick="rerunImportSession(${session.id}); event.stopPropagation();" 
                        title="הרצה חוזרת של סשן ייבוא זה"
                        data-tooltip="הרצה חוזרת של סשן ייבוא"></button>
            </td>`
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
        const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';

        if (window.FieldRendererService?.renderStatus) {
            return window.FieldRendererService.renderStatus(normalizedStatus || 'unknown', 'import_session');
        }

        const translations = {
            completed: 'הושלם',
            ready: 'מוכן',
            analyzing: 'בבדיקה',
            importing: 'ייבוא פעיל',
            failed: 'נכשל',
            cancelled: 'בוטל',
            canceled: 'בוטל',
            created: 'נוצר'
        };

        let category = 'unknown';
        if (normalizedStatus === 'completed' || normalizedStatus === 'importing') {
            category = 'open';
        } else if (normalizedStatus === 'ready' || normalizedStatus === 'analyzing') {
            category = 'closed';
        } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
            category = 'cancelled';
        }

        const label = translations[normalizedStatus] || status || 'לא ידוע';
        return `<span class="status-badge" data-status-category="${category}" data-entity="import_session">${label}</span>`;
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

        if (typeof value === 'string') {
            const normalized = value.trim();
            if (!normalized) {
                return '';
            }
            if (normalized.toLowerCase() === 'invalid date' || normalized.toLowerCase() === 'nan') {
                return 'לא זמין';
            }
            if (/^\d+$/.test(normalized)) {
                const asNumber = Number(normalized);
                if (Number.isFinite(asNumber)) {
                    const numericDate = new Date(asNumber);
                    if (!Number.isNaN(numericDate.getTime())) {
                        return window.formatDate ? window.formatDate(numericDate, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(numericDate, { includeTime: true }) : numericDate.toLocaleString('he-IL'));
                    }
                }
            }
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            // Use dateUtils for consistent date handling
            let numericDate;
            if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
              numericDate = window.dateUtils.toDateObject({ epochMs: value });
            } else {
              numericDate = new Date(value);
            }
            if (!Number.isNaN(numericDate.getTime())) {
                // Use FieldRendererService or dateUtils for consistent date formatting
                if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                  return window.FieldRendererService.renderDate(numericDate, true);
                }
                if (window.formatDate) {
                  return window.formatDate(numericDate, true);
                }
                if (window.dateUtils?.formatDate) {
                  return window.dateUtils.formatDate(numericDate, { includeTime: true });
                }
                // Last resort: use toLocaleString
                return numericDate.toLocaleString('he-IL');
            }
        }

        if (typeof window.renderImportDate === 'function') {
            const rendered = window.renderImportDate(value, '');
            if (rendered) {
                return rendered;
            }
        }

        const envelope = coerceDateEnvelope(value);
        if (envelope) {
            if (window.FieldRendererService?.renderDate) {
                const rendered = window.FieldRendererService.renderDate(envelope, true);
                if (rendered) {
                    const renderedNormalized = rendered.trim();
                    return renderedNormalized.toLowerCase() === 'invalid date'
                        ? 'לא זמין'
                        : renderedNormalized;
                }
            }
            const candidate = envelope.utc || envelope.local || envelope.display || '';
            if (candidate) {
                const parsedCandidate = new Date(candidate);
                if (!Number.isNaN(parsedCandidate.getTime())) {
                    return window.formatDate ? window.formatDate(parsedCandidate, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(parsedCandidate, { includeTime: true }) : parsedCandidate.toLocaleString('he-IL'));
                }
                if (typeof candidate === 'string' && candidate.trim().toLowerCase() === 'invalid date') {
                    return 'לא זמין';
                }
                return candidate;
            }
            return 'לא זמין';
        }

        if (window.dateUtils?.formatDateTime) {
            return window.dateUtils.formatDateTime(value);
        }

        if (typeof window.formatDateTime === 'function') {
            return window.formatDateTime(value);
        }

        // Use dateUtils for consistent date parsing
        let date;
        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
          date = window.dateUtils.toDateObject(value);
        } else {
          date = new Date(value);
        }
        if (Number.isNaN(date.getTime())) {
            if (typeof value === 'string') {
                return value.trim().toLowerCase() === 'invalid date' ? 'לא זמין' : value;
            }
            return 'לא זמין';
        }

        // Use FieldRendererService or dateUtils for consistent date formatting
        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
          return window.FieldRendererService.renderDate(date, true);
        }
        if (window.formatDate) {
          return window.formatDate(date, true);
        }
        if (window.dateUtils?.formatDate) {
          return window.dateUtils.formatDate(date, { includeTime: true });
        }
        // Last resort: use toLocaleString
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

    /**
     * Update TableDataRegistry datasets for the import history table.
     * @param {Array<Object>} [data] - Optional data override.
     */
    function updateTableRegistry(data = state.sessions) {
        if (!window.TableDataRegistry) {
            return;
        }

        const safeData = Array.isArray(data) ? data : [];

        window.TableDataRegistry.registerTable({
            tableType: TABLE_TYPE,
            tableId: TABLE_ID,
            source: 'data-import-page'
        });

        window.TableDataRegistry.setFullData(TABLE_TYPE, safeData, {
            tableId: TABLE_ID,
            resetFiltered: true
        });
    }

    /**
     * Register the import history table with the Unified Table System.
     * @param {boolean} [force=false]
     */
    function registerDataImportTable(force = false) {
        if (state.tableRegistered && !force) {
            return;
        }

        if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
            if (tableRegistrationAttempts < MAX_TABLE_REGISTRATION_ATTEMPTS) {
                tableRegistrationAttempts += 1;
                setTimeout(() => registerDataImportTable(force), 250);
            }
            return;
        }

        const columns = window.TABLE_COLUMN_MAPPINGS?.[TABLE_TYPE] || [];

        window.UnifiedTableSystem.registry.register(TABLE_TYPE, {
            dataGetter: () => state.sessions || [],
            updateFunction: (data) => renderImportHistoryTable(Array.isArray(data) ? data : null),
            tableSelector: `#${TABLE_ID}`,
            columns,
            sortable: true,
            filterable: true,
            // Default sort: created_at desc (column index 8)
            defaultSort: { columnIndex: 8, direction: 'desc', key: 'created_at' }
        });

        if (window.TableDataRegistry) {
            window.TableDataRegistry.registerTable({
                tableType: TABLE_TYPE,
                tableId: TABLE_ID,
                source: 'data-import-page'
            });
        }

        if (window.PaginationSystem?.registerTableInRegistry) {
            window.PaginationSystem.registerTableInRegistry(TABLE_TYPE, TABLE_ID, 'data-import-page');
        }

        tableRegistrationAttempts = 0;
        state.tableRegistered = true;

        Logger.info('📊 Registered import history table with UnifiedTableSystem', { page: PAGE_NAME });
    }

    /**
     * Rerun import session - placeholder function for future implementation
     * @function rerunImportSession
     * @param {number} sessionId - Session ID to rerun
     */
    function rerunImportSession(sessionId) {
        Logger.info('🔄 Rerun import session requested', { sessionId, page: PAGE_NAME });
        
        // TODO: Implement rerun logic
        // This will:
        // 1. Load session data from database
        // 2. Restore file content (if available)
        // 3. Open import modal with pre-filled data
        // 4. Allow user to modify settings and re-import
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                'הרצה חוזרת של סשן ייבוא',
                'פונקציה זו תיושם בקרוב. היא תאפשר להריץ מחדש סשן ייבוא קיים עם אפשרות לעדכן הגדרות.',
                'info',
                5000
            );
        } else {
            alert(`הרצה חוזרת של סשן ייבוא #${sessionId}\n\nפונקציה זו תיושם בקרוב.`);
        }
    }

    // Expose globals for the unified initializer
    window.initializeDataImportPage = initializeDataImportPage;
    window.refreshDataImportHistory = refreshDataImportHistory;
    window.registerDataImportTable = registerDataImportTable;
    window.rerunImportSession = rerunImportSession;
})();










