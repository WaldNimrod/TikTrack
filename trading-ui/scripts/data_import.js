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

/* ===== DEBUG INSTRUMENTATION - FIX PACK 4 ===== */
if (typeof fetch !== 'undefined') {
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      location: 'trading-ui/scripts/data_import.js:1',
      message: 'data_import script loaded - bundle optimization test',
      data: { page: 'data_import', script_count: 10, optimization: 'bundle_loading', timestamp: Date.now() },
      sessionId: 'fix_pack_4_test',
      runId: 'data_import_detached_frame_fix',
      hypothesisId: 'script_overload_navigation_detach'
    })
  }).catch(() => {});
}

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
            if (window.Logger && Logger.DEBUG_MODE) {
                window.Logger.debug('coerceDateEnvelope - null/undefined value', { page: PAGE_NAME });
            }
            return null;
        }

        // Debug: Log input value
        if (window.Logger && Logger.DEBUG_MODE) {
            window.Logger.debug('coerceDateEnvelope - input', {
                value: value,
                value_type: typeof value,
                is_object: typeof value === 'object',
                has_epochMs: value && typeof value === 'object' && 'epochMs' in value,
                has_utc: value && typeof value === 'object' && 'utc' in value,
                page: PAGE_NAME
            });
        }

        // Check if already a DateEnvelope object
        // Backend returns DateEnvelope with epochMs (capital M) - check for both
        if (value && typeof value === 'object' && (value.epochMs !== undefined || value.epoch_ms !== undefined || value.utc || value.local || value.display)) {
            if (window.Logger && Logger.DEBUG_MODE) {
                window.Logger.debug('coerceDateEnvelope - already DateEnvelope', { 
                    envelope: value, 
                    hasEpochMs: value.epochMs !== undefined,
                    hasEpoch_ms: value.epoch_ms !== undefined,
                    hasUtc: value.utc !== undefined,
                    hasLocal: value.local !== undefined,
                    hasDisplay: value.display !== undefined,
                    page: PAGE_NAME 
                });
            }
            return value;
        }

        try {
            if (window.dateUtils?.ensureDateEnvelope) {
                const envelope = window.dateUtils.ensureDateEnvelope(value);
                if (window.Logger && Logger.DEBUG_MODE) {
                    window.Logger.debug('coerceDateEnvelope - ensured via dateUtils', { envelope: envelope, page: PAGE_NAME });
                }
                return envelope;
            }
        } catch (error) {
            Logger.warn?.('⚠️ Failed to normalize date envelope', { value, error: error.message, page: PAGE_NAME });
        }

        if (typeof value === 'object') {
            if (window.Logger && Logger.DEBUG_MODE) {
                window.Logger.debug('coerceDateEnvelope - returning object as-is', { value: value, page: PAGE_NAME });
            }
            return value;
        }

        // Use TableSortValueAdapter if available for consistent date parsing
        let parsed = null;
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
            const sortValue = window.TableSortValueAdapter.getSortValue({ value: value, type: 'date' });
            parsed = typeof sortValue === 'number' && !Number.isNaN(sortValue) ? sortValue : Date.parse(value);
        } else {
            parsed = Date.parse(value);
        }
        
        if (parsed !== null && !Number.isNaN(parsed)) {
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

        // Use TableSortValueAdapter if available for consistent date parsing
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
            const sortValue = window.TableSortValueAdapter.getSortValue({ value: envelope, type: 'auto' });
            if (typeof sortValue === 'number' && Number.isFinite(sortValue)) {
                return sortValue;
            }
        }

        // Fallback to manual extraction
        const candidate = envelope.epochMs
            ?? (envelope.utc ? (typeof window.TableSortValueAdapter?.getSortValue === 'function' 
                ? window.TableSortValueAdapter.getSortValue({ value: envelope.utc, type: 'date' }) 
                : Date.parse(envelope.utc)) : null)
            ?? (envelope.local ? (typeof window.TableSortValueAdapter?.getSortValue === 'function' 
                ? window.TableSortValueAdapter.getSortValue({ value: envelope.local, type: 'date' }) 
                : Date.parse(envelope.local)) : null)
            ?? (typeof envelope === 'string' ? (typeof window.TableSortValueAdapter?.getSortValue === 'function' 
                ? window.TableSortValueAdapter.getSortValue({ value: envelope, type: 'date' }) 
                : Date.parse(envelope)) : null);

        return Number.isFinite(candidate) ? candidate : 0;
    }

    /**
     * Initializes the Data Import page.
     * @async
     * @function initializeDataImportPage
     * @returns {Promise<void>}
     */
    /**
     * Apply dynamic colors for data import page
     * Uses execution entity color
     */
    async function applyDynamicColors() {
        try {
            Logger.info('Applying dynamic color system', { page: PAGE_NAME });
            
            // Load entity colors from global system
            if (typeof window.loadEntityColors === 'function') {
                const entityColors = await window.loadEntityColors();
                if (entityColors) {
                    Logger.debug('Entity colors loaded', { entityColors, page: PAGE_NAME });
                    
                    // Apply execution colors (data import displays executions)
                    if (entityColors.execution) {
                        document.documentElement.style.setProperty('--execution-color', entityColors.execution);
                        document.documentElement.style.setProperty('--execution-bg-color', entityColors.execution + '20');
                    }
                }
            }
            
            // Also use getEntityColor for direct access
            if (typeof window.getEntityColor === 'function') {
                const executionColor = window.getEntityColor('execution');
                if (executionColor) {
                    document.documentElement.style.setProperty('--execution-color', executionColor);
                    document.documentElement.style.setProperty('--execution-bg-color', executionColor + '20');
                }
            }
        } catch (error) {
            Logger.error('Error applying dynamic colors', { error: error.message, page: PAGE_NAME });
        }
    }

    async function initializeDataImportPage() {
        Logger.info('🚀 Initializing Data Import page', { page: PAGE_NAME });

        try {
            setLoadingState(true);
            
            // Apply dynamic colors (execution entity)
            await applyDynamicColors();

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
                const accountHistory = await fetchHistoryForAccount(account, force);
                /* eslint-enable no-await-in-loop */
                historyResults.push(accountHistory);
            }

            // Use sessions directly - same as executions.js, no normalization needed
            const sessions = historyResults.flat();
            
            // Sort by created_at using TableSortValueAdapter
            sessions.sort((a, b) => {
                const dateA = a.created_at || a.completed_at || null;
                const dateB = b.created_at || b.completed_at || null;
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;
                
                // Use TableSortValueAdapter if available
                if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                    const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'auto' });
                    const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'auto' });
                    return (sortValueB || 0) - (sortValueA || 0);
                }
                
                // Fallback to manual date comparison using dateUtils or direct epoch extraction
                let epochA = null;
                let epochB = null;
                
                if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                    epochA = window.dateUtils.getEpochMilliseconds(dateA);
                    epochB = window.dateUtils.getEpochMilliseconds(dateB);
                } else if (dateA && typeof dateA === 'object' && dateA.epochMs) {
                    epochA = dateA.epochMs;
                } else if (dateA instanceof Date) {
                    epochA = dateA.getTime();
                } else if (typeof dateA === 'string') {
                    // Use TableSortValueAdapter for date parsing if available, otherwise Date.parse
                    if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                        const sortValue = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'date' });
                        epochA = typeof sortValue === 'number' ? sortValue : Date.parse(dateA);
                    } else {
                        epochA = Date.parse(dateA);
                    }
                }
                
                if (dateB && typeof dateB === 'object' && dateB.epochMs) {
                    epochB = dateB.epochMs;
                } else if (dateB instanceof Date) {
                    epochB = dateB.getTime();
                } else if (typeof dateB === 'string') {
                    // Use TableSortValueAdapter for date parsing if available, otherwise Date.parse
                    if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                        const sortValue = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'date' });
                        epochB = typeof sortValue === 'number' ? sortValue : Date.parse(dateB);
                    } else {
                        epochB = Date.parse(dateB);
                    }
                }
                
                return (epochB || 0) - (epochA || 0);
            });

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
     * @param {boolean} [force=false] - Force reload from server, bypass cache.
     * @returns {Promise<Array<Object>>}
     */
    async function fetchHistoryForAccount(account, force = false) {
        if (!account || !account.id) {
            return [];
        }

        try {
            let sessions = [];
            
            if (window.DataImportData?.loadImportHistoryData) {
                sessions = await window.DataImportData.loadImportHistoryData({
                    accountId: account.id,
                    limit: 20,
                    force: force
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
                
                // Debug: Log API response
                if (window.Logger && Logger.DEBUG_MODE) {
                    const responseClone = response.clone();
                    responseClone.json().then(data => {
                        if (data.sessions && data.sessions.length > 0) {
                            const firstSession = data.sessions[0];
                            window.Logger.debug('fetchHistoryForAccount - API response', {
                                accountId: account.id,
                                sessionsCount: data.sessions.length,
                                firstSessionId: firstSession.id,
                                firstSession_created_at: firstSession.created_at,
                                firstSession_created_at_type: typeof firstSession.created_at,
                                firstSession_completed_at: firstSession.completed_at,
                                firstSession_completed_at_type: typeof firstSession.completed_at,
                                page: PAGE_NAME
                            });
                        }
                    }).catch(() => {});
                }

                if (!response.ok) {
                    if ([401, 403, 404].includes(response.status)) {
                        // User not authenticated or no import history - return empty array
                        if (window.Logger && typeof window.Logger.debug === 'function') {
                            window.Logger.debug(`⚠️ Import history API returned ${response.status}, returning empty data`, { accountId: account.id, page: PAGE_NAME });
                        }
                        sessions = [];
                    } else {
                        throw new Error(`קוד שגיאה ${response.status} בהבאת היסטוריה לחשבון ${account.id}`);
                    }
                } else {
                    const payload = await response.json();
                    sessions = payload.sessions || payload.data || [];
                }
                
                // Debug: Log API response
                if (window.Logger && Logger.DEBUG_MODE && Array.isArray(sessions) && sessions.length > 0) {
                    const firstSession = sessions[0];
                    window.Logger.debug('fetchHistoryForAccount - API response', {
                        accountId: account.id,
                        sessionsCount: sessions.length,
                        firstSessionId: firstSession.id,
                        firstSession_created_at: firstSession.created_at,
                        firstSession_created_at_type: typeof firstSession.created_at,
                        firstSession_completed_at: firstSession.completed_at,
                        firstSession_completed_at_type: typeof firstSession.completed_at,
                        page: PAGE_NAME
                    });
                }
                
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

            // Debug: Log first session dates if available
            if (enrichedSessions.length > 0 && window.Logger && Logger.DEBUG_MODE) {
                const firstSession = enrichedSessions[0];
                window.Logger.debug('fetchHistoryForAccount - First session dates', {
                    sessionId: firstSession.id,
                    created_at: firstSession.created_at,
                    created_at_type: typeof firstSession.created_at,
                    completed_at: firstSession.completed_at,
                    completed_at_type: typeof firstSession.completed_at,
                    has_epochMs: firstSession.created_at && typeof firstSession.created_at === 'object' && 'epochMs' in firstSession.created_at,
                    has_display: firstSession.created_at && typeof firstSession.created_at === 'object' && 'display' in firstSession.created_at,
                    page: PAGE_NAME
                });
            }

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
        // Debug: Log raw session data
        if (window.Logger && Logger.DEBUG_MODE) {
            window.Logger.debug('normalizeSessionRecord - raw session', {
                id: session.id,
                created_at: session.created_at,
                completed_at: session.completed_at,
                created_at_type: typeof session.created_at,
                completed_at_type: typeof session.completed_at,
                created_at_is_object: typeof session.created_at === 'object',
                created_at_keys: session.created_at && typeof session.created_at === 'object' ? Object.keys(session.created_at) : null,
                created_at_epochMs: session.created_at && typeof session.created_at === 'object' ? session.created_at.epochMs : null,
                created_at_display: session.created_at && typeof session.created_at === 'object' ? session.created_at.display : null,
                page: PAGE_NAME
            });
        }

        const summary = session.summary_data || {};
        const analysisTimestamp = summary.analysis_timestamp || summary.analysis?.timestamp || null;
        const previewTimestamp = summary.preview_timestamp || summary.preview?.timestamp || null;

        // Use completed_at as fallback if created_at is null/undefined
        // Handle both DateEnvelope objects and ISO strings
        let createdSource = null;
        if (session.created_at) {
            createdSource = session.created_at;
        } else if (summary.created_at) {
            createdSource = summary.created_at;
        } else if (session.completed_at) {
            createdSource = session.completed_at;
        } else if (summary.completed_at) {
            createdSource = summary.completed_at;
        } else if (analysisTimestamp) {
            createdSource = analysisTimestamp;
        }

        let updatedSource = null;
        if (session.completed_at) {
            updatedSource = session.completed_at;
        } else if (summary.completed_at) {
            updatedSource = summary.completed_at;
        } else if (previewTimestamp) {
            updatedSource = previewTimestamp;
        } else if (analysisTimestamp) {
            updatedSource = analysisTimestamp;
        } else if (createdSource) {
            updatedSource = createdSource;  // Fallback to createdSource if nothing else available
        }

        // Debug: Log sources
        if (window.Logger && Logger.DEBUG_MODE) {
            window.Logger.debug('normalizeSessionRecord - date sources', {
                createdSource: createdSource,
                createdSource_type: typeof createdSource,
                updatedSource: updatedSource,
                updatedSource_type: typeof updatedSource,
                page: PAGE_NAME
            });
        }

        const createdEnvelope = coerceDateEnvelope(createdSource);
        const updatedEnvelope = coerceDateEnvelope(updatedSource);

        // Debug: Log envelopes
        if (window.Logger && Logger.DEBUG_MODE) {
            window.Logger.debug('normalizeSessionRecord - date envelopes', {
                createdSource: createdSource,
                createdSource_type: typeof createdSource,
                createdEnvelope: createdEnvelope,
                createdEnvelope_type: typeof createdEnvelope,
                createdEnvelope_is_null: createdEnvelope === null,
                createdEnvelope_display: createdEnvelope && createdEnvelope.display,
                updatedSource: updatedSource,
                updatedSource_type: typeof updatedSource,
                updatedEnvelope: updatedEnvelope,
                updatedEnvelope_type: typeof updatedEnvelope,
                updatedEnvelope_is_null: updatedEnvelope === null,
                updatedEnvelope_display: updatedEnvelope && updatedEnvelope.display,
                page: PAGE_NAME
            });
        }

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
            createdAtDisplay: (() => {
                if (!createdEnvelope) {
                    // Debug: Log when envelope is null
                    if (window.Logger && Logger.DEBUG_MODE) {
                        window.Logger.debug('normalizeSessionRecord - createdEnvelope is null', {
                            sessionId: session.id,
                            createdSource: createdSource,
                            page: PAGE_NAME
                        });
                    }
                    return '';
                }
                
                // Try FieldRendererService first
                if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                    const result = window.FieldRendererService.renderDate(createdEnvelope, true);
                    // Debug: Log result
                    if (window.Logger && Logger.DEBUG_MODE) {
                        window.Logger.debug('normalizeSessionRecord - createdAtDisplay result (FieldRendererService)', {
                            sessionId: session.id,
                            result: result,
                            result_type: typeof result,
                            envelope: createdEnvelope,
                            page: PAGE_NAME
                        });
                    }
                    // FieldRendererService should return a string, use it if not empty/null
                    if (result && result !== '-' && result !== '') {
                        return result;
                    }
                }
                
                // Fallback to display property from envelope
                if (createdEnvelope.display) {
                    if (window.Logger && Logger.DEBUG_MODE) {
                        window.Logger.debug('normalizeSessionRecord - using envelope.display', {
                            sessionId: session.id,
                            display: createdEnvelope.display,
                            page: PAGE_NAME
                        });
                    }
                    return createdEnvelope.display;
                }
                
                // Last resort: use formatDateValue
                const result = formatDateValue(createdEnvelope);
                if (window.Logger && Logger.DEBUG_MODE) {
                    window.Logger.debug('normalizeSessionRecord - createdAtDisplay result (formatDateValue)', {
                        sessionId: session.id,
                        result: result,
                        page: PAGE_NAME
                    });
                }
                return result || '';
            })(),
            created_at: createdEnvelope,
            updatedAt: updatedEnvelope,
            updatedAtEpoch: getEpochFromEnvelope(updatedEnvelope),
            updatedAtDisplay: (() => {
                const dateToRender = updatedEnvelope || createdEnvelope;
                if (!dateToRender) {
                    // Debug: Log when envelope is null
                    if (window.Logger && Logger.DEBUG_MODE) {
                        window.Logger.debug('normalizeSessionRecord - updatedEnvelope is null', {
                            sessionId: session.id,
                            updatedSource: updatedSource,
                            createdEnvelope: createdEnvelope,
                            page: PAGE_NAME
                        });
                    }
                    return '';
                }
                
                // Try FieldRendererService first
                if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                    const result = window.FieldRendererService.renderDate(dateToRender, true);
                    // Debug: Log result
                    if (window.Logger && Logger.DEBUG_MODE) {
                        window.Logger.debug('normalizeSessionRecord - updatedAtDisplay result (FieldRendererService)', {
                            sessionId: session.id,
                            result: result,
                            result_type: typeof result,
                            envelope: dateToRender,
                            page: PAGE_NAME
                        });
                    }
                    // FieldRendererService should return a string, use it if not empty/null
                    if (result && result !== '-' && result !== '') {
                        return result;
                    }
                }
                
                // Fallback to display property from envelope
                if (dateToRender.display) {
                    if (window.Logger && Logger.DEBUG_MODE) {
                        window.Logger.debug('normalizeSessionRecord - using envelope.display', {
                            sessionId: session.id,
                            display: dateToRender.display,
                            page: PAGE_NAME
                        });
                    }
                    return dateToRender.display;
                }
                
                // Last resort: use formatDateValue
                const result = formatDateValue(dateToRender);
                if (window.Logger && Logger.DEBUG_MODE) {
                    window.Logger.debug('normalizeSessionRecord - updatedAtDisplay result (formatDateValue)', {
                        sessionId: session.id,
                        result: result,
                        page: PAGE_NAME
                    });
                }
                return result || '';
            })(),
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
                activeStatusElement.textContent = '';
                const parser = new DOMParser();
                const statusDoc = parser.parseFromString(statusHtml, 'text/html');
                statusDoc.body.childNodes.forEach(node => {
                    activeStatusElement.appendChild(node.cloneNode(true));
                });
                const span = document.createElement('span');
                span.className = 'session-meta';
                span.textContent = `(#${activeSession.id})`;
                activeStatusElement.appendChild(span);
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

        tableBody.textContent = '';

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

        // Use the same date rendering logic as executions.js for consistency
        const createdDateCell = (() => {
            // Prefer FieldRendererService.renderDate for consistent date formatting
            const rawDate = session.created_at || null;
            
            if (!rawDate) {
                return `<td class="col-created"><span class="updated-value-empty">לא זמין</span></td>`;
            }

            // Use FieldRendererService.renderDate for proper date formatting
            let dateDisplay = '';
            let epoch = null;

            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                // Use FieldRendererService to render date with time
                dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
                
                // Get epoch for sorting using TableSortValueAdapter if available
                if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                    const sortValue = window.TableSortValueAdapter.getSortValue({ value: rawDate, type: 'auto' });
                    epoch = typeof sortValue === 'number' && !Number.isNaN(sortValue) ? sortValue : null;
                } else if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                    const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                    epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                } else if (rawDate instanceof Date) {
                    epoch = rawDate.getTime();
                } else if (typeof rawDate === 'string') {
                    // Use TableSortValueAdapter if available for date parsing
                    if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                        const sortValue = window.TableSortValueAdapter.getSortValue({ value: rawDate, type: 'date' });
                        epoch = typeof sortValue === 'number' && !Number.isNaN(sortValue) ? sortValue : null;
                    } else {
                        const parsed = Date.parse(rawDate);
                        epoch = Number.isNaN(parsed) ? null : parsed;
                    }
                } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
                    epoch = rawDate.epochMs;
                }
            } else {
                // Fallback: work directly with date envelope objects or raw values
                const envelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                if (envelope && typeof envelope === 'object' && envelope.display) {
                    dateDisplay = envelope.display;
                    epoch = envelope.epochMs || envelope.epoch_ms || null;
                } else if (rawDate instanceof Date) {
                    dateDisplay = rawDate.toLocaleString('he-IL');
                    epoch = rawDate.getTime();
                } else if (typeof rawDate === 'string') {
                    // Use TableSortValueAdapter if available for date parsing
                    if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                        const sortValue = window.TableSortValueAdapter.getSortValue({ value: rawDate, type: 'date' });
                        if (typeof sortValue === 'number' && !Number.isNaN(sortValue)) {
                            const date = new Date(sortValue);
                            dateDisplay = date.toLocaleString('he-IL');
                            epoch = sortValue;
                        } else {
                            const parsed = Date.parse(rawDate);
                            if (!Number.isNaN(parsed)) {
                                const date = new Date(parsed);
                                dateDisplay = date.toLocaleString('he-IL');
                                epoch = parsed;
                            } else {
                                dateDisplay = rawDate;
                            }
                        }
                    } else {
                        const parsed = Date.parse(rawDate);
                        if (!Number.isNaN(parsed)) {
                            const date = new Date(parsed);
                            dateDisplay = date.toLocaleString('he-IL');
                            epoch = parsed;
                        } else {
                            dateDisplay = rawDate;
                        }
                    }
                } else {
                    dateDisplay = String(rawDate);
                }
            }

            return `<td class="col-created" data-sort-value="${epoch || ''}">${dateDisplay || 'לא זמין'}</td>`;
        })();

        const updatedDateCell = (() => {
            // Prefer FieldRendererService.renderDate for consistent date formatting
            const rawDate = session.completed_at || session.created_at || null;
            
            if (!rawDate) {
                return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
            }

            // Use FieldRendererService.renderDate for proper date formatting
            let dateDisplay = '';
            let epoch = null;

            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                // Use FieldRendererService to render date with time
                dateDisplay = window.FieldRendererService.renderDate(rawDate, true);
                
                // Get epoch for sorting using TableSortValueAdapter if available
                if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                    const sortValue = window.TableSortValueAdapter.getSortValue({ value: rawDate, type: 'auto' });
                    epoch = typeof sortValue === 'number' && !Number.isNaN(sortValue) ? sortValue : null;
                } else if (window.dateUtils && typeof window.dateUtils.getEpochMilliseconds === 'function') {
                    const envelope = window.dateUtils.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                    epoch = window.dateUtils.getEpochMilliseconds(envelope || rawDate);
                } else if (rawDate instanceof Date) {
                    epoch = rawDate.getTime();
                } else if (typeof rawDate === 'string') {
                    // Use TableSortValueAdapter if available for date parsing
                    if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                        const sortValue = window.TableSortValueAdapter.getSortValue({ value: rawDate, type: 'date' });
                        epoch = typeof sortValue === 'number' && !Number.isNaN(sortValue) ? sortValue : null;
                    } else {
                        const parsed = Date.parse(rawDate);
                        epoch = Number.isNaN(parsed) ? null : parsed;
                    }
                } else if (rawDate && typeof rawDate === 'object' && rawDate.epochMs) {
                    epoch = rawDate.epochMs;
                }
            } else {
                // Fallback: work directly with date envelope objects or raw values
                const envelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(rawDate) : rawDate;
                if (envelope && typeof envelope === 'object' && envelope.display) {
                    dateDisplay = envelope.display;
                    epoch = envelope.epochMs || envelope.epoch_ms || null;
                } else if (rawDate instanceof Date) {
                    dateDisplay = rawDate.toLocaleString('he-IL');
                    epoch = rawDate.getTime();
                } else if (typeof rawDate === 'string') {
                    // Use TableSortValueAdapter if available for date parsing
                    if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
                        const sortValue = window.TableSortValueAdapter.getSortValue({ value: rawDate, type: 'date' });
                        if (typeof sortValue === 'number' && !Number.isNaN(sortValue)) {
                            const date = new Date(sortValue);
                            dateDisplay = date.toLocaleString('he-IL');
                            epoch = sortValue;
                        } else {
                            const parsed = Date.parse(rawDate);
                            if (!Number.isNaN(parsed)) {
                                const date = new Date(parsed);
                                dateDisplay = date.toLocaleString('he-IL');
                                epoch = parsed;
                            } else {
                                dateDisplay = rawDate;
                            }
                        }
                    } else {
                        const parsed = Date.parse(rawDate);
                        if (!Number.isNaN(parsed)) {
                            const date = new Date(parsed);
                            dateDisplay = date.toLocaleString('he-IL');
                            epoch = parsed;
                        } else {
                            dateDisplay = rawDate;
                        }
                    }
                } else {
                    dateDisplay = String(rawDate);
                }
            }

            return `<td class="col-updated" data-sort-value="${epoch || ''}">${dateDisplay || 'לא זמין'}</td>`;
        })();

        // CRITICAL: Only show delete button - no other buttons should exist
        const deleteButton = `
            <button data-button-type="DELETE" 
                    data-variant="small" 
                    data-onclick="if(window.deleteImportSession) { window.deleteImportSession(${session.id}); } else { console.error('deleteImportSession not available'); }" 
                    title="מחק סשן ייבוא זה"
                    data-tooltip="מחק סשן ייבוא"></button>
        `;
        
        const rowHTML = [
            `<td class="col-session-id">#${session.id}</td>`,
            `<td class="col-account">${session.trading_account_name || (session.trading_account_id ? `חשבון #${session.trading_account_id}` : 'לא ידוע')}</td>`,
            `<td class="col-provider">${session.provider || 'לא צויין'}</td>`,
            `<td class="col-file" title="${session.file_name || ''}">${session.file_name || 'לא צויין'}</td>`,
            `<td class="col-status">${statusDisplay}</td>`,
            `<td class="col-records text-center">${session.total_records || 0}</td>`,
            `<td class="col-imported text-center">${session.imported_records || 0}</td>`,
            `<td class="col-skipped text-center">${session.skipped_records || 0}</td>`,
            createdDateCell,
            updatedDateCell,
            `<td class="col-actions text-center">
                ${deleteButton}
            </td>`
        ].join('');
        row.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<table><tbody><tr>${rowHTML}</tr></tbody></table>`, 'text/html');
        const tempRow = doc.body.querySelector('tr');
        if (tempRow) {
            Array.from(tempRow.children).forEach(cell => {
                row.appendChild(cell.cloneNode(true));
            });
        }

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

        // Check if value is already a DateEnvelope object
        if (value && typeof value === 'object' && (value.epochMs !== undefined || value.utc || value.local || value.display)) {
            // It's already a DateEnvelope, use FieldRendererService directly
            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
                return window.FieldRendererService.renderDate(value, true);
            }
            // Fallback to display property
            return value.display || value.local || value.utc || '';
        }

        const envelope = coerceDateEnvelope(value);
        if (envelope) {
            if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
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
     * Delete import session
     * Uses UnifiedCRUDService for automatic table refresh and consistent CRUD handling
     * @function deleteImportSession
     * @param {number} sessionId - Session ID to delete
     */
    async function deleteImportSession(sessionId) {
        if (!sessionId) {
            Logger.warn('deleteImportSession: No session ID provided', { page: PAGE_NAME });
            return;
        }

        Logger.info('🗑️ Delete import session requested', { sessionId, page: PAGE_NAME });

        // Use UnifiedCRUDService for deletion - this automatically handles:
        // - Confirmation dialog
        // - API call
        // - Response handling and notifications
        // - Table refresh via CRUDResponseHandler.handleTableRefresh
        // - Cache invalidation
        if (window.UnifiedCRUDService?.deleteEntity) {
            try {
                const result = await window.UnifiedCRUDService.deleteEntity('import_session', sessionId, {
                    successMessage: `סשן ייבוא #${sessionId} נמחק בהצלחה!`,
                    entityName: 'סשן ייבוא',
                    reloadFn: () => refreshDataImportHistory(true), // Force reload from server after deletion
                    requiresHardReload: false
                });
                
                Logger.info('🗑️ Import session deletion completed via UnifiedCRUDService', {
                    sessionId,
                    result,
                    page: PAGE_NAME
                });
            } catch (error) {
                Logger.error('deleteImportSession: Error in UnifiedCRUDService', { 
                    sessionId,
                    page: PAGE_NAME, 
                    error: error.message,
                    exception: error
                });
            }
        } else {
            // Fallback to direct API call if UnifiedCRUDService not available
            Logger.warn('⚠️ UnifiedCRUDService not available, using fallback', {
                sessionId,
                page: PAGE_NAME
            });
            
            const confirmationMessage = `האם אתה בטוח שברצונך למחוק את סשן הייבוא #${sessionId}?\n\nפעולה זו תמחק את הסשן לצמיתות.`;
            
            if (window.confirm(confirmationMessage)) {
                try {
                    const response = await fetch(`/api/user-data-import/session/${sessionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    if (response.ok && (data.status === 'success' || data.success)) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification(`סשן ייבוא #${sessionId} נמחק בהצלחה!`, 'success', 5000);
                        }
                        
                        // Refresh the history table
                        if (typeof refreshDataImportHistory === 'function') {
                            await refreshDataImportHistory();
                        }
                    } else {
                        const errorMessage = data.error || data.message || 'שגיאה במחיקת סשן ייבוא';
                        if (typeof window.showNotification === 'function') {
                            window.showNotification(errorMessage, 'error', 6000);
                        }
                        Logger.error('deleteImportSession: API error', { 
                            sessionId,
                            page: PAGE_NAME, 
                            error: errorMessage,
                            response: data
                        });
                    }
                } catch (error) {
                    const errorMessage = error?.message || 'שגיאה לא ידועה במחיקת סשן ייבוא';
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(errorMessage, 'error', 6000);
                    }
                    Logger.error('deleteImportSession: Exception', { 
                        sessionId,
                        page: PAGE_NAME, 
                        error: errorMessage,
                        exception: error
                    });
                }
            }
        }
    }

    // Expose globals for the unified initializer
    window.initializeDataImportPage = initializeDataImportPage;
    window.refreshDataImportHistory = refreshDataImportHistory;
    window.registerDataImportTable = registerDataImportTable;
    window.deleteImportSession = deleteImportSession;
})();










