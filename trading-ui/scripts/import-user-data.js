/**
 * Import User Data JavaScript - Clean Version
 * 
 * This script handles the complete user data import process in modal format:
 * - 5-step wizard with progress indicators
 * - File upload with drag & drop validation
 * - Account selection with API integration
 * - File analysis with visual progress
 * - Problem resolution (missing tickers, duplicates)
 * - Preview generation with detailed tables
 * - Import execution with confirmation
 * 
 * Author: TikTrack Development Team
 * Version: 2.0 - Clean Modal Integration
 * Last Updated: 2025-01-16
 */

// Global state for import modal
let currentSessionId = null;
let currentStep = 1;
let selectedFile = null;
let selectedAccount = null;
let selectedConnector = null;
let analysisResults = null;
let previewData = null;
let detectedDataTypes = [];
let selectedDataTypeKey = null;
let currencyCacheByCode = null;
let tickersModalConfigPromise = null;
let activeSessionInfo = null;
const ACTIVE_SESSION_STORAGE_KEY = 'tiktrack_import_user_data_session';
const ACTIVE_SESSION_SOURCE = 'import-user-data';
let importModalBootstrapInstance = null;

const IMPORT_DATA_TYPE_DEFINITIONS = {
    executions: {
        key: 'executions',
        label: 'ביצועי מסחר (Executions)',
        description: 'ייבוא רשומות ביצועי מסחר הכוללות תאריך, פעולה, כמות, מחיר ונתוני עמלות.',
        documentationAnchor: '#import-executions-pipeline'
    },
    cashflows: {
        key: 'cashflows',
        label: 'תזרימי מזומנים (Cash Flows)',
        description: 'פלייסהולדר: ניתוח תזרימי מזומנים (הפקדות, משיכות, דיבידנדים וריביות) להשוואה מול המערכת.',
        documentationAnchor: '#import-cashflows-pipeline'
    },
    account_reconciliation: {
        key: 'account_reconciliation',
        label: 'בדיקת שיוך חשבון',
        description: 'פלייסהולדר: אימות פרטי חשבון, מטבע בסיס והרשאות לפני ייבוא.',
        documentationAnchor: '#account-reconciliation-pipeline'
    },
    portfolio_positions: {
        key: 'portfolio_positions',
        label: 'השוואת פורטפוליו',
        description: 'פלייסהולדר: השוואת פוזיציות פתוחות, NAV ושווי שוק מול נתוני המערכת.',
        documentationAnchor: '#portfolio-reconciliation-pipeline'
    },
    taxes_and_fx: {
        key: 'taxes_and_fx',
        label: 'ריביות, מיסים והפרשי מטבע',
        description: 'פלייסהולדר: זיהוי הפרשים בריביות, מיסים ותרגומי מטבע ביחס לנתוני הבסיס.',
        documentationAnchor: '#taxes-and-fx-pipeline'
    }
};

function updateResetSessionButtonState() {
    const resetButton = document.getElementById('resetImportSessionBtn');
    if (!resetButton) {
        return;
    }
    resetButton.disabled = !currentSessionId;
    updateActiveSessionIndicator();
}

function getApiErrorMessage(response, fallback = 'שגיאה לא ידועה') {
    if (!response || typeof response !== 'object') {
        return fallback;
    }
    return response.error || response.message || response.detail || response.details || fallback;
}

function updateActiveSessionInfo(updates = {}) {
    if (!currentSessionId) {
        activeSessionInfo = null;
        updateActiveSessionIndicator();
        clearStoredActiveSession();
        return;
    }
    
    const accountSelect = document.getElementById('tradingAccountSelect');
    const connectorSelect = document.getElementById('connectorSelect');
    
    activeSessionInfo = {
        ...(activeSessionInfo || {}),
        sessionId: currentSessionId
    };
    
    const fileName = updates.fileName ?? window.selectedFile?.name ?? activeSessionInfo.fileName ?? '';
    const fileSize = updates.fileSize ?? window.selectedFile?.size ?? activeSessionInfo.fileSize ?? null;
    const accountName = updates.accountName 
        ?? accountSelect?.selectedOptions?.[0]?.text?.trim() 
        ?? activeSessionInfo.accountName 
        ?? '';
    const accountIdValue = updates.accountId ?? selectedAccount ?? activeSessionInfo.accountId ?? null;
    const connectorValue = updates.connector ?? selectedConnector ?? activeSessionInfo.connector ?? '';
    const connectorName = updates.connectorName 
        ?? connectorSelect?.selectedOptions?.[0]?.text?.trim() 
        ?? activeSessionInfo.connectorName 
        ?? '';
    
    activeSessionInfo.fileName = fileName;
    activeSessionInfo.fileSize = fileSize;
    activeSessionInfo.accountName = accountName;
    activeSessionInfo.accountId = accountIdValue;
    activeSessionInfo.connector = connectorValue;
    activeSessionInfo.connectorName = connectorName;
    
    const countKeys = [
        'totalRecords',
        'readyRecords',
        'skipRecords',
        'missingTickers',
        'missingTickerRecords',
        'duplicateRecords',
        'existingRecords'
    ];
    countKeys.forEach((key) => {
        if (typeof updates[key] === 'number') {
            activeSessionInfo[key] = updates[key];
        } else if (activeSessionInfo[key] === undefined) {
            activeSessionInfo[key] = 0;
        }
    });
    
    if (updates.provider) {
        activeSessionInfo.provider = updates.provider;
    } else if (!activeSessionInfo.provider && connectorName) {
        activeSessionInfo.provider = connectorName;
    }
    
    if (updates.status) {
        activeSessionInfo.status = updates.status;
    } else if (!activeSessionInfo.status) {
        activeSessionInfo.status = 'ניתוח בתהליך';
    }
    
    updateActiveSessionIndicator();
    persistActiveSession();
}

function updateActiveSessionIndicator() {
    const indicator = document.getElementById('activeSessionIndicator');
    if (!indicator) {
        return;
    }
    
    if (!currentSessionId || !activeSessionInfo) {
        indicator.style.display = 'none';
        indicator.setAttribute('data-has-session', 'false');
        return;
    }
    
    indicator.style.display = 'block';
    indicator.setAttribute('data-has-session', 'true');
    
    const sessionIdEl = document.getElementById('activeSessionIdValue');
    const statusEl = document.getElementById('activeSessionStatusValue');
    const fileEl = document.getElementById('activeSessionFileValue');
    const accountEl = document.getElementById('activeSessionAccountValue');
    const providerEl = document.getElementById('activeSessionProviderValue');
    const totalRecordsEl = document.getElementById('activeSessionTotalRecords');
    const readyRecordsEl = document.getElementById('activeSessionReadyRecords');
    const skipRecordsEl = document.getElementById('activeSessionSkipRecords');
    const missingTickersEl = document.getElementById('activeSessionMissingTickers');
    const duplicateRecordsEl = document.getElementById('activeSessionDuplicateRecords');
    const existingRecordsEl = document.getElementById('activeSessionExistingRecords');
    
    if (sessionIdEl) {
        sessionIdEl.textContent = `#${activeSessionInfo.sessionId}`;
    }
    if (statusEl) {
        statusEl.textContent = activeSessionInfo.status || 'לא זמין';
    }
    if (fileEl) {
        const sizeLabel = activeSessionInfo.fileSize ? ` (${formatFileSize(activeSessionInfo.fileSize)})` : '';
        fileEl.textContent = activeSessionInfo.fileName 
            ? `${activeSessionInfo.fileName}${sizeLabel}`
            : 'לא נבחר קובץ';
    }
    if (accountEl) {
        accountEl.textContent = activeSessionInfo.accountName || 'לא נבחר חשבון';
    }
    if (providerEl) {
        providerEl.textContent = activeSessionInfo.provider || 'לא נבחר ספק';
    }
    if (totalRecordsEl) {
        totalRecordsEl.textContent = activeSessionInfo.totalRecords ?? 0;
    }
    if (readyRecordsEl) {
        readyRecordsEl.textContent = activeSessionInfo.readyRecords ?? 0;
    }
    if (skipRecordsEl) {
        skipRecordsEl.textContent = activeSessionInfo.skipRecords ?? 0;
    }
    if (missingTickersEl) {
        missingTickersEl.textContent = activeSessionInfo.missingTickers ?? 0;
    }
    if (duplicateRecordsEl) {
        duplicateRecordsEl.textContent = activeSessionInfo.duplicateRecords ?? 0;
    }
    if (existingRecordsEl) {
        existingRecordsEl.textContent = activeSessionInfo.existingRecords ?? 0;
    }
}

function updateActiveSessionFromAnalysis(results) {
    if (!currentSessionId || !results) {
        return;
    }
    
    const missingTickerRecords = results.missing_ticker_records || 0;
    const missingTickers = Array.isArray(results.missing_tickers)
        ? results.missing_tickers.length
        : (results.missing_tickers_count || 0);
    const duplicateRecords = results.duplicate_records || 0;
    const existingRecords = results.existing_records || 0;
    const invalidRecords = results.invalid_records || 0;
    const cleanRecords = results.clean_records || results.valid_records || 0;
    const totalRecords = results.total_records || 0;
    
    const readyRecords = Math.max(0, cleanRecords - missingTickerRecords);
    const skipRecords = duplicateRecords + existingRecords + missingTickerRecords + invalidRecords;
    
    updateActiveSessionInfo({
        totalRecords,
        readyRecords,
        skipRecords,
        missingTickers,
        missingTickerRecords,
        duplicateRecords,
        existingRecords,
        status: activeSessionInfo?.status || 'ניתוח הושלם'
    });
}

function updateActiveSessionFromPreview(preview) {
    if (!currentSessionId || !preview) {
        return;
    }
    
    const readyRecords = Array.isArray(preview.records_to_import)
        ? preview.records_to_import.length
        : (preview.summary?.records_to_import || activeSessionInfo?.readyRecords || 0);
    
    const skipRecords = Array.isArray(preview.records_to_skip)
        ? preview.records_to_skip.length
        : (preview.summary?.records_to_skip || activeSessionInfo?.skipRecords || 0);
    
    updateActiveSessionInfo({
        readyRecords,
        skipRecords,
        status: 'תצוגה מקדימה מוכנה'
    });
}

function mapSessionStatusToLabel(status) {
    if (!status) {
        return 'לא ידוע';
    }
    
    const normalized = String(status).toLowerCase();
    const statusMap = {
        created: 'התקבל',
        analyzing: 'ניתוח בתהליך',
        ready: 'מוכן לייבוא',
        importing: 'ייבוא פעיל',
        completed: 'הושלם',
        failed: 'נכשל',
        cancelled: 'בוטל'
    };
    
    return statusMap[normalized] || status;
}

function persistActiveSession() {
    try {
        if (!currentSessionId || !activeSessionInfo) {
            clearStoredActiveSession();
            return;
        }
        
        const storedPayload = {
            ...activeSessionInfo,
            sessionId: currentSessionId,
            persistedAt: new Date().toISOString()
        };
        
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(storedPayload));
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to persist active session info', { error: error?.message });
    }
}

function clearStoredActiveSession() {
    try {
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to clear stored session info', { error: error?.message });
    }
}

async function restoreActiveSessionFromStorage() {
    let restoredFromStorage = false;
    try {
        const storedValue = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        if (!storedValue) {
            updateActiveSessionIndicator();
            return await fetchLatestActiveSession();
        }
        
        const parsed = JSON.parse(storedValue);
        if (!parsed?.sessionId) {
            clearStoredActiveSession();
            return await fetchLatestActiveSession();
        }
        
        currentSessionId = parsed.sessionId;
        window.currentSessionId = parsed.sessionId;
        activeSessionInfo = parsed;
        selectedAccount = parsed.accountId ?? null;
        selectedConnector = parsed.connector ?? null;
        if (parsed.fileName) {
            window.selectedFile = window.selectedFile || { name: parsed.fileName, size: parsed.fileSize };
        }
        
        updateActiveSessionIndicator();
        updateResetSessionButtonState();
        
        restoredFromStorage = true;
        await fetchExistingSessionDetails(parsed.sessionId);
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to restore session from storage', { error: error?.message });
        clearStoredActiveSession();
    } finally {
        if (!restoredFromStorage) {
            await fetchLatestActiveSession();
        }
    }
}

async function fetchExistingSessionDetails(sessionId) {
    try {
        const response = await fetch(`/api/user-data-import/session/${sessionId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (!(data.success || data.status === 'success')) {
            throw new Error(data.message || 'Session fetch failed');
        }
        
        const session = data.session || {};
        const summary = session.summary_data || session.summary || {};
        
        updateActiveSessionInfo({
            status: mapSessionStatusToLabel(session.status),
            totalRecords: summary.total_records ?? session.total_records ?? activeSessionInfo?.totalRecords ?? 0,
            readyRecords: summary.records_to_import ?? session.imported_records ?? activeSessionInfo?.readyRecords ?? 0,
            skipRecords: summary.records_to_skip ?? session.skipped_records ?? activeSessionInfo?.skipRecords ?? 0,
            missingTickers: Array.isArray(summary.missing_tickers) ? summary.missing_tickers.length : activeSessionInfo?.missingTickers ?? 0,
            duplicateRecords: summary.duplicate_records ?? activeSessionInfo?.duplicateRecords ?? 0,
            existingRecords: summary.existing_records ?? activeSessionInfo?.existingRecords ?? 0,
            provider: session.provider || activeSessionInfo?.provider
        });
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to fetch existing session details', { error: error?.message, sessionId });
        if (currentSessionId === sessionId) {
            currentSessionId = null;
            window.currentSessionId = null;
            activeSessionInfo = null;
            updateResetSessionButtonState();
            updateActiveSessionIndicator();
        }
        clearStoredActiveSession();
    }
}

async function fetchLatestActiveSession() {
    try {
        const response = await fetch('/api/user-data-import/sessions/active');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (!(data.success || data.status === 'success')) {
            throw new Error(data.message || 'Active session fetch failed');
        }
        
        if (!data.session) {
            return;
        }
        
        const session = data.session;
        const summary = data.summary || {};
        
        currentSessionId = session.id;
        window.currentSessionId = session.id;
        selectedAccount = session.trading_account_id ?? null;
        const inferredConnector = typeof session.provider === 'string'
            ? session.provider.toLowerCase()
            : null;
        selectedConnector = inferredConnector;
        
        updateActiveSessionInfo({
            sessionId: session.id,
            fileName: session.file_name,
            accountId: session.trading_account_id,
            provider: session.provider,
            connector: inferredConnector,
            connectorName: session.provider,
            status: mapSessionStatusToLabel(session.status),
            totalRecords: summary.total_records ?? session.total_records ?? 0,
            readyRecords: summary.imported_records
                ?? summary.records_to_import
                ?? Math.max(0, (session.total_records || 0) - (session.skipped_records || 0)),
            skipRecords: summary.records_to_skip ?? session.skipped_records ?? 0
        });
        
        updateResetSessionButtonState();
        await fetchExistingSessionDetails(session.id);
    } catch (error) {
        window.Logger?.debug?.('[Import Modal] No active session detected', { error: error?.message });
    }
}

function renderImportDate(value, fallback = '') {
    try {
        if (typeof window.dateUtils?.ensureDateEnvelope === 'function') {
            const envelope = window.dateUtils.ensureDateEnvelope(value);
            if (window.FieldRendererService?.renderDate) {
                return window.FieldRendererService.renderDate(envelope) || fallback;
            }
            if (envelope && typeof envelope === 'object') {
                return envelope.display || envelope.local || envelope.utc || fallback;
            }
        }
        if (value && typeof value === 'object') {
            return value.display || value.local || value.utc || fallback;
        }
        if (value) {
            return value;
        }
    } catch (error) {
        if (window.Logger?.warn) {
            window.Logger.warn('[Import Modal] Failed to render date value', { value, error: error.message });
        }
    }
    return fallback;
}

function setInputValue(inputElement, value) {
    if (!inputElement || value === undefined || value === null) {
        return;
    }
    inputElement.value = value;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
}

function setSelectValue(selectElement, value) {
    if (!selectElement || value === undefined || value === null) {
        return;
    }
    if (selectElement.value !== value) {
        selectElement.value = value;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function getScriptVersionSuffix(referencePattern = 'import-user-data.js') {
    const referenceScript = document.querySelector(`script[src*="${referencePattern}"]`);
    if (referenceScript) {
        const src = referenceScript.getAttribute('src') || '';
        const queryIndex = src.indexOf('?');
        if (queryIndex !== -1) {
            return src.substring(queryIndex);
        }
    }
    return '?v=1.0.0';
}

async function setCurrencySelectValue(selectElement, currencyCode) {
    if (!selectElement || !currencyCode) {
        return;
    }

    const targetCode = currencyCode.trim().toUpperCase();

    const findOption = () => Array.from(selectElement.options || []).find((option) => {
        const optionCode = (option.dataset?.code || option.text || '').trim().toUpperCase();
        return optionCode === targetCode;
    });

    let option = findOption();
    let attempt = 0;

    while (!option && attempt < 6) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        option = findOption();
        attempt++;
    }

    if (option) {
        selectElement.value = option.value;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function loadCurrencyCache() {
    if (currencyCacheByCode) {
        return currencyCacheByCode;
    }

    try {
        const response = await fetch('/api/currencies/');
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        const list = data.data || data || [];
        currencyCacheByCode = list.reduce((acc, item) => {
            if (item?.code) {
                acc[item.code.toUpperCase()] = item;
            }
            if (item?.symbol) {
                acc[item.symbol.toUpperCase()] = item;
            }
            return acc;
        }, {});
        return currencyCacheByCode;
    } catch (error) {
        window.Logger?.warn('[Import Modal] Failed to load currencies cache', { error: error.message });
        currencyCacheByCode = {};
        return currencyCacheByCode;
    }
}

async function ensureTickersModalConfigLoaded() {
    if (window.tickersModalConfig && typeof window.tickersModalConfig === 'object') {
        return true;
    }

    if (tickersModalConfigPromise) {
        return tickersModalConfigPromise;
    }

    tickersModalConfigPromise = (async () => {
        const manifestEntry = window.PACKAGE_MANIFEST?.modules?.scripts?.find((script) => script.file === 'modal-configs/tickers-config.js');
        const scriptPath = manifestEntry?.file || 'modal-configs/tickers-config.js';
        const versionSuffix = getScriptVersionSuffix('modal-configs/trade-plans-config.js');

        const ensureScriptTag = () => {
            let script = document.querySelector('script[data-modal-config="tickers"]');
            if (!script) {
                script = document.querySelector('script[src*="modal-configs/tickers-config.js"]');
            }

            if (!script) {
                script = document.createElement('script');
                script.src = `scripts/${scriptPath}${versionSuffix || ''}`;
                script.async = false;
                script.setAttribute('data-modal-config', 'tickers');
                document.head.appendChild(script);
            }

            return script;
        };

        const scriptElement = ensureScriptTag();

        return await new Promise((resolve) => {
            const complete = (success) => {
                clearInterval(pollInterval);
                clearTimeout(timeoutId);
                resolve(success);
            };

            const checkReady = () => window.tickersModalConfig && typeof window.tickersModalConfig === 'object';

            if (checkReady()) {
                complete(true);
                return;
            }

            const pollInterval = setInterval(() => {
                if (checkReady()) {
                    complete(true);
                }
            }, 100);

            const timeoutId = setTimeout(() => {
                complete(checkReady());
            }, 4000);

            scriptElement.addEventListener('load', () => {
                if (checkReady()) {
                    complete(true);
                }
            }, { once: true });

            scriptElement.addEventListener('error', () => {
                complete(false);
            }, { once: true });
        });
    })();

    const loaded = await tickersModalConfigPromise;
    if (!loaded) {
        tickersModalConfigPromise = null;
        window.Logger?.warn('[Import Modal] Unable to load tickers modal configuration', { page: 'import-user-data' });
    }
    return loaded;
}

async function quickAddTicker(symbol, name, currencyCode = 'USD') {
    const trimmedSymbol = symbol?.trim();
    const trimmedName = name?.trim();
    if (!trimmedSymbol || !trimmedName) {
        showImportUserDataNotification('נא למלא את כל השדות', 'error');
        return;
    }

    try {
        const currencies = await loadCurrencyCache();
        const currency = currencies[currencyCode.toUpperCase()];
        const currencyId = currency?.id || 1;

        const response = await fetch('/api/tickers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symbol: trimmedSymbol,
                name: trimmedName,
                type: 'stock',
                currency_id: currencyId,
                status: 'closed',
            }),
        });

        const result = await response.json();
        if (response.ok && (result?.success !== false)) {
            showImportUserDataNotification(`טיקר ${trimmedSymbol} נוסף בהצלחה`, 'success');
            refreshPreviewData();
            if (typeof window.loadTickersData === 'function') {
                window.loadTickersData();
            }
        } else {
            const message = result?.error?.message || result?.error || 'שגיאה בהוספת טיקר';
            showImportUserDataNotification(`שגיאה בהוספת טיקר: ${message}`, 'error');
        }
    } catch (error) {
        window.Logger?.error('Quick add ticker error:', error);
        showImportUserDataNotification('שגיאה בהוספת טיקר', 'error');
    }
}

function ensureTickerSaveHook(retry = 0) {
    if (typeof window === 'undefined') {
        return;
    }

    const saveFn = window.saveTicker;
    if (typeof saveFn !== 'function') {
        if (retry < 6) {
            setTimeout(() => ensureTickerSaveHook(retry + 1), 250);
        } else {
            window.Logger?.warn('[Import Modal] saveTicker not available - cannot register refresh hook', { page: 'import-user-data' });
        }
        return;
    }

    if (saveFn.__importUserDataWrapper) {
        return;
    }

    const wrapped = async function(...args) {
        const result = await saveFn.apply(this, args);
        if (currentSessionId && result) {
            try {
                refreshPreviewData();
            } catch (error) {
                window.Logger?.warn('[Import Modal] Failed to refresh preview after ticker save', { error: error.message });
            }
        }
        return result;
    };

    wrapped.__importUserDataWrapper = true;
    window.saveTicker = wrapped;
    window.Logger?.debug('[Import Modal] Wrapped saveTicker to refresh preview data', { page: 'import-user-data' });
}

/**
 * Initialize import user data modal - called by unified system
 */
window.initializeImportUserDataModal = function() {
    window.Logger.info('[Import Modal] Initializing import modal', { page: 'import-user-data' });
    
    // Don't setup event listeners here - they will be set up when modal opens
    // setupImportModalEventListeners();
    
    // Load accounts
    loadAccounts();
};

/**
 * Open import user data modal
 */
async function openImportUserDataModal() {
    window.Logger.info('[Import Modal] Opening import modal', { page: 'import-user-data' });
    
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.error('[Import Modal] Modal element not found in DOM', { page: 'import-user-data' });
        return;
    }
    
    // Reset state before displaying
    resetImportModal();
    
    // Ensure listeners are initialized once
    setupImportModalEventListeners();
    
    // Show modal using Bootstrap when available
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        importModalBootstrapInstance = bootstrap.Modal.getInstance(modal);
        if (!importModalBootstrapInstance) {
            importModalBootstrapInstance = new bootstrap.Modal(modal, {
                backdrop: false,
                keyboard: true
            });
        }
        importModalBootstrapInstance.show();
    } else {
        // Fallback manual display
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }
        
        // Process buttons using centralized button system
        if (window.processButtons) {
            window.processButtons(modal);
            window.Logger.debug('[Import Modal] Buttons processed by centralized button system', { page: 'import-user-data' });
        } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
            window.advancedButtonSystem.processButtons(modal);
            window.Logger.debug('[Import Modal] Buttons processed by centralized button system', { page: 'import-user-data' });
        } else if (window.initializeButtons) {
            window.initializeButtons();
            window.Logger.debug('[Import Modal] Buttons initialized via initializeButtons()', { page: 'import-user-data' });
        }
        
    // Load accounts and restore active session state
        await loadAccounts();
    await restoreActiveSessionFromStorage();
    
    if (activeSessionInfo?.accountId) {
        const accountSelect = modal.querySelector('#tradingAccountSelect');
        if (accountSelect) {
            setSelectValue(accountSelect, activeSessionInfo.accountId);
        }
    }
    
    if (activeSessionInfo?.connector) {
        const connectorSelect = modal.querySelector('#connectorSelect');
        if (connectorSelect) {
            setSelectValue(connectorSelect, activeSessionInfo.connector);
        }
    }
    
    // Initialize step 1
    goToStep(1);
    
    if (window.modalNavigationManager?.manageBackdrop) {
        window.modalNavigationManager.manageBackdrop();
        setTimeout(() => window.modalNavigationManager?.manageBackdrop(), 50);
    }
}

/**
 * Close import user data modal
 */
function closeImportUserDataModal() {
    window.Logger.info('[Import Modal] Closing import modal', { page: 'import-user-data' });
    
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        return;
    }
    
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        const instance = bootstrap.Modal.getInstance(modal) || importModalBootstrapInstance;
        if (instance) {
            instance.hide();
        } else {
            // Fallback if no instance exists yet
            importModalBootstrapInstance = new bootstrap.Modal(modal, { backdrop: false, keyboard: true });
            importModalBootstrapInstance.hide();
        }
    } else {
        // Manual fallback
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        resetImportModal();
    }
    
    if (window.modalNavigationManager?.manageBackdrop) {
        setTimeout(() => window.modalNavigationManager.manageBackdrop(), 50);
    }
}

/**
 * Reset import modal state
 */
function resetImportModal() {
    currentSessionId = null;
    window.currentSessionId = null;
    currentStep = 1;
    selectedFile = null;
    window.selectedFile = null; // Make it global
    selectedAccount = null;
    selectedConnector = null;
    analysisResults = null;
    previewData = null;
    detectedDataTypes = [];
    selectedDataTypeKey = null;
    activeSessionInfo = null;
    
    // Reset form elements
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const accountSelect = document.getElementById('tradingAccountSelect');
    if (accountSelect) {
        accountSelect.value = '';
    }
    
    const connectorSelect = document.getElementById('connectorSelect');
    if (connectorSelect) {
        connectorSelect.value = '';
    }
    
    // Reset UI elements
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.style.display = 'block';
    }
    
    // Reset event listener flags
    const elementsWithListeners = document.querySelectorAll('[data-listeners-setup]');
    elementsWithListeners.forEach(element => {
        element.removeAttribute('data-listeners-setup');
    });
    
    // Reset analyze button
    updateAnalyzeButton();
    updateResetSessionButtonState();
    resetAnalysisDisplay();
    resetPreviewDisplay();
    clearProblemSections();
    updateActiveSessionIndicator();
    
    const dataTypeCard = document.getElementById('dataTypeSelectionCard');
    if (dataTypeCard) {
        dataTypeCard.style.display = 'none';
    }
    setDataTypeActionsState(false);
}

function finalizeImportReset(options = {}) {
    const { clearCache = false, reason = 'import-user-data:reset' } = options;
    clearStoredActiveSession();
    resetImportModal();
    goToStep(1);
    
    if (clearCache) {
        clearImportCacheLayers({ reason });
    }
    
    // Re-check for any remaining active sessions after backend reset
    setTimeout(() => {
        fetchLatestActiveSession()?.catch?.((error) => {
            window.Logger?.debug?.('[Import Modal] Active session refetch after reset failed', {
                error: error?.message
            });
        });
    }, 300);
}

function resetAnalysisDisplay() {
    const analysisCounters = {
        totalRecords: '0',
        validRecords: '0',
        invalidRecords: '0',
        duplicateRecords: '0',
        missingTickersCount: '0',
        missingTickerRecords: '0',
        existingRecords: '0'
    };
    
    Object.entries(analysisCounters).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    });
    
    const problemResolutionSection = document.getElementById('problemResolutionSection');
    if (problemResolutionSection) {
        problemResolutionSection.style.display = 'none';
    }
}

function resetPreviewDisplay() {
    const previewCounters = {
        previewImportCount: '0',
        previewSkipCount: '0',
        previewImportRate: '0%'
    };
    
    Object.entries(previewCounters).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    });
    
    const confirmationFields = {
        confirmFileName: '',
        confirmAccountName: '',
        confirmTotalRecords: '',
        confirmImportRecords: '',
        confirmSkipRecords: ''
    };
    
    Object.entries(confirmationFields).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    });
    
    const tablePlaceholders = [
        { elementId: 'importTableBody', columns: 8 },
        { elementId: 'skipTableBody', columns: 9 }
    ];
    
    tablePlaceholders.forEach(({ elementId, columns }) => {
        const tableBody = document.getElementById(elementId);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="${columns}">אין נתונים להצגה. העלה קובץ חדש להפעלת תהליך הייבוא.</td></tr>`;
        }
    });
}

function clearImportCacheLayers({ reason = 'import-user-data', autoRefresh = false } = {}) {
    const layers = ['memory', 'localStorage', 'indexedDB'];
    
    try {
        if (window.UnifiedCacheManager?.clearAllCache) {
            const clearPromise = window.UnifiedCacheManager.clearAllCache({
                layers: ['all'],
                autoRefresh,
                hardReload: autoRefresh,
                source: reason
            });
            
            if (clearPromise?.catch) {
                clearPromise.catch(error => {
                    window.Logger?.warn?.('[Import Modal] Unified cache clear failed', { error: error?.message, reason });
                });
            }
        } else {
            window.Logger?.warn?.('[Import Modal] UnifiedCacheManager not available for cache clearing', { reason });
        }
        
        if (window.CacheControlMenu?.logAction) {
            const logPromise = window.CacheControlMenu.logAction('full', layers, {
                source: reason,
                autoRefresh,
                page: 'import-user-data'
            });
            
            if (logPromise?.catch) {
                logPromise.catch(error => {
                    window.Logger?.warn?.('[Import Modal] Failed to log cache clear action', { error: error?.message, reason });
                });
            }
        }
    } catch (error) {
        window.Logger?.error?.('[Import Modal] Cache clearing process raised an error', { error: error?.message, reason });
    }
    
    // LEGACY (Stage A) cache clearing method - deprecated:
    // window.clearCacheQuick(null, { source: reason });
}

/**
 * Go to specific step
 */
function goToStep(step) {
    window.Logger.info('[Import Modal] Navigating to step', { 
        from: currentStep, 
        to: step, 
        page: 'import-user-data' 
    });
    
    currentStep = step;
    
    // Update step indicators
    updateStepIndicators();
    
    // Show step content
    showStepContent(step);
    
    // Load step-specific content
    if (step === 1) {
        window.Logger.debug('[Import Modal] Loading step 1 content', { page: 'import-user-data' });
        loadStep1Content();
    } else if (step === 2) {
        window.Logger.debug('[Import Modal] Loading step 2 content (Analysis + Problems)', { page: 'import-user-data' });
        loadStep2Content();
        // loadProblemResolution will be called after analysis is complete
                    } else if (step === 3) {
                        window.Logger.debug('[Import Modal] Loading step 3 content (Preview + Confirmation)', { page: 'import-user-data' });
                        loadPreviewData();
                    }
    
    // Process buttons in the modal after step change
    // This ensures all buttons are properly handled by the centralized button system
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        // Get the current visible step container
        const currentStepElement = modal.querySelector(`.import-step[data-step="${step}"]`);
        if (currentStepElement) {
            if (window.processButtons) {
                window.processButtons(currentStepElement);
            } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
                window.advancedButtonSystem.processButtons(currentStepElement);
            }
            window.Logger.debug('[Import Modal] Buttons processed for step', { 
                step, 
                page: 'import-user-data' 
            });
        } else {
            // Fallback: process entire modal
            if (window.processButtons) {
                window.processButtons(modal);
            } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
                window.advancedButtonSystem.processButtons(modal);
            }
            window.Logger.debug('[Import Modal] Buttons processed for entire modal', { 
                step, 
                page: 'import-user-data' 
            });
        }
    }
    
    window.Logger.info('[Import Modal] Step navigation completed', { 
        currentStep, 
        page: 'import-user-data' 
    });
}

/**
 * Update step indicators
 */
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (stepNumber === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
    } else {
            indicator.classList.remove('active', 'completed');
        }
    });
}

/**
 * Show step content
 */
function showStepContent(step) {
    window.Logger.debug('[Import Modal] Showing step content', { step, page: 'import-user-data' });
    
    // Hide all import steps (containers)
    const importSteps = document.querySelectorAll('.import-step');
    window.Logger.debug('[Import Modal] Found import steps', { 
        count: importSteps.length, 
        page: 'import-user-data' 
    });
    importSteps.forEach(stepElement => {
        stepElement.style.display = 'none';
    });
    
    // Show current step content
    let currentStepContent;
    if (step === 1) {
        currentStepContent = document.getElementById('step-upload');
    } else if (step === 2) {
        currentStepContent = document.getElementById('step-analysis');
        // Also show the problem resolution section
        const problemSection = document.getElementById('problemResolutionSection');
        if (problemSection) {
            problemSection.style.display = 'block';
        }
                    } else if (step === 3) {
                        currentStepContent = document.getElementById('step-preview');
                    }
    
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
        window.Logger.info('[Import Modal] Step content shown', { 
            step, 
            elementId: currentStepContent.id,
            page: 'import-user-data' 
        });
    } else {
        window.Logger.error('[Import Modal] Step content element not found', { 
            step, 
            page: 'import-user-data' 
        });
    }
}

/**
 * Load step 1 content (File & Account Selection)
 */
function loadStep1Content() {
    // The HTML content is already in the DOM, just need to load accounts
    // Event listeners are already set up during initialization
    loadAccounts();
    updateResetSessionButtonState();
}

/**
 * Setup event listeners for import modal - called once during initialization
 */
function setupImportModalEventListeners() {
    window.Logger.debug('[Import Modal] Setting up import modal event listeners', { page: 'import-user-data' });
    
    window.Logger.info('[Import Modal] Setting up event listeners', { page: 'import-user-data' });
    
    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
        window.Logger.debug('[Import Modal] File input event listener added', { page: 'import-user-data' });
    }
    
    // Drop zone
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput?.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleFileDrop);
        window.Logger.debug('[Import Modal] Drop zone event listeners added', { page: 'import-user-data' });
    }
    
    // Account select - look INSIDE the modal
    const modal = document.getElementById('importUserDataModal');
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    window.Logger.debug('[Import Modal] Account select element found', { 
        exists: !!accountSelect, 
        id: accountSelect?.id,
        page: 'import-user-data' 
    });
    if (accountSelect) {
        accountSelect.addEventListener('change', handleAccountSelect);
        window.Logger.info('[Import Modal] Account select event listener added successfully', { page: 'import-user-data' });
    } else {
        window.Logger.error('[Import Modal] Account select element not found in modal!', { page: 'import-user-data' });
    }
    
    // Connector select - look INSIDE the modal
    const connectorSelect = modal?.querySelector('#connectorSelect');
    if (connectorSelect) {
        connectorSelect.addEventListener('change', handleConnectorSelect);
        window.Logger.debug('[Import Modal] Connector select event listener added', { page: 'import-user-data' });
    }
    
    // Continue button - NO manual event listener needed!
    // The centralized button system handles data-onclick automatically via event delegation
    // Just ensure the button has data-onclick="analyzeFile()" in HTML
    const continueBtn = modal?.querySelector('[data-button-type="PRIMARY"]');
    if (continueBtn) {
        window.Logger.debug('[Import Modal] Continue button found - will be handled by centralized button system', { 
            hasDataOnclick: continueBtn.hasAttribute('data-onclick'),
            page: 'import-user-data' 
        });
    }
    
    // Mark as set up
    if (modal) {
        modal.setAttribute('data-listeners-setup', 'true');
    }
    
    window.Logger.info('[Import Modal] All event listeners set up successfully', { page: 'import-user-data' });
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

/**
 * Handle file drop event
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            handleFileSelect({ target: { files: [file] } });
        } else {
            showImportUserDataNotification('אנא בחר קובץ CSV בלבד', 'error');
        }
    }
}

/**
 * Load step 2 content (File Analysis)
 */
function loadStep2Content() {
    // The HTML content is already in the DOM, just need to display analysis results
    if (analysisResults) {
        displayAnalysisResults(analysisResults);
        if (!detectedDataTypes.length) {
            prepareDataTypeSelection(analysisResults);
        } else {
            renderDataTypeSelection();
        }
    }
}

/**
 * Load confirmation data (Step 5)
 */
function loadConfirmationData() {
    // The HTML content is already in the DOM, just need to display confirmation data
    if (analysisResults && previewData) {
        displayConfirmationData(analysisResults, previewData);
    }
}

/**
 * Load problem resolution
 */
function loadProblemResolution() {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayProblemResolutionDetailed(data.preview_data);
        } else {
            showImportUserDataNotification(`שגיאה בטעינת נתוני בעיות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Problem resolution error:', error);
        showImportUserDataNotification('שגיאה בטעינת נתוני בעיות', 'error');
    });
}

/**
 * Display problem resolution
 */
function displayProblemResolution(data) {
    const container = document.getElementById('problemResolution');
    if (!container) return;
    
    container.innerHTML = `
        <div class="problem-summary">
            <h4>סיכום בעיות</h4>
            <div class="problem-stats">
                <div class="stat-item">
                    <span class="stat-label">רשומות עם בעיות:</span>
                    <span class="stat-value">${data.problematic_records || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">רשומות נקיות:</span>
                    <span class="stat-value">${data.clean_records || 0}</span>
                </div>
            </div>
        </div>
    `;
}


/**
 * Clear problem sections
 */
function clearProblemSections() {
    const missingTickersSection = document.getElementById('missingTickersSection');
    const withinFileDuplicatesSection = document.getElementById('withinFileDuplicatesSection');
    const existingRecordsSection = document.getElementById('existingRecordsSection');
    
    if (missingTickersSection) missingTickersSection.style.display = 'none';
    if (withinFileDuplicatesSection) withinFileDuplicatesSection.style.display = 'none';
    if (existingRecordsSection) existingRecordsSection.style.display = 'none';
}

/**
 * Display existing records
 */
function displayExistingRecords(existingRecords) {
    const section = document.getElementById('existingRecordsSection');
    const container = document.getElementById('existingRecordsContainer');
    
    if (!section || !container) {
        window.Logger.warn('[Import Modal] Existing records section not found', { page: 'import-user-data' });
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    existingRecords.forEach((recordData, index) => {
        const card = document.createElement('div');
        card.className = 'problem-card existing-record-card';
        
        // Get the actual record data
        const record = recordData.record || recordData;
        const matches = recordData.matches || [];
        
        // Calculate confidence score from matches
        let confidenceScore = 0;
        if (matches.length > 0) {
            confidenceScore = matches[0].confidence || 0;
        }
        
        const confidenceColor = confidenceScore >= 80 ? '#28a745' : confidenceScore >= 50 ? '#ffc107' : '#dc3545';
        
        card.innerHTML = `
            <div class="problem-card-header">
                <div class="problem-card-title">
                    <i class="bi bi-database"></i>
                    רשומה קיימת במערכת #${index + 1}
                </div>
                <div class="confidence-score" style="color: ${confidenceColor}">
                    ${confidenceScore.toFixed(1)}% התאמה
                </div>
            </div>
            <div class="problem-card-content">
                <div class="record-details">
                    <div class="detail-row">
                        <span class="detail-label">סמל:</span>
                        <span class="detail-value">${record.symbol || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">פעולה:</span>
                        <span class="detail-value">${record.action || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">כמות:</span>
                        <span class="detail-value">${record.quantity || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">מחיר:</span>
                        <span class="detail-value">$${record.price || 'לא זמין'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">תאריך:</span>
                        <span class="detail-value">${record.date || 'לא זמין'}</span>
                    </div>
                </div>
                <div class="problem-card-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="importExistingRecord(${index})">
                        <i class="bi bi-arrow-down-circle"></i> ייבוא בכל זאת
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="skipExistingRecord(${index})">
                        <i class="bi bi-x-circle"></i> דלג
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    window.Logger.info('[Import Modal] Displayed existing records', { 
        count: existingRecords.length, 
        page: 'import-user-data' 
    });
}

/**
 * Import existing record (force import)
 */
function importExistingRecord(index) {
    window.Logger.info('[Import Modal] Importing existing record', { index, page: 'import-user-data' });
    
    // TODO: Implement logic to force import this specific record
    showImportUserDataNotification('ייבוא רשומה קיימת - פונקציונליות תפותח בקרוב', 'info');
}

/**
 * Skip existing record
 */
function skipExistingRecord(index) {
    window.Logger.info('[Import Modal] Skipping existing record', { index, page: 'import-user-data' });
    
    // TODO: Implement logic to skip this specific record
    showImportUserDataNotification('דילוג על רשומה קיימת - פונקציונליות תפותח בקרוב', 'info');
}

/**
 * Display missing tickers
 */

/**
 * Load step 5 content (Final Approval)
 */
function loadStep5Content() {
    const content = document.getElementById('step5Content');
    if (!content) return;
    
    content.innerHTML = `
        <div class="step-content-inner">
            <h4>אישור סופי</h4>
            <div class="final-summary">
                <h5>סיכום ייבוא</h5>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">רשומות לייבוא:</span>
                        <span class="stat-value" id="importCount">0</span>
                </div>
                    <div class="stat-item">
                        <span class="stat-label">רשומות לדילוג:</span>
                        <span class="stat-value" id="skipCount">0</span>
                        </div>
                    <div class="stat-item">
                        <span class="stat-label">אחוז ייבוא:</span>
                        <span class="stat-value" id="importRate">0%</span>
                        </div>
                        </div>
                        </div>
            
            <div class="step-actions">
                <button class="btn btn-secondary" onclick="goToStep(4)">
                    <i class="fas fa-arrow-right"></i> חזור לתצוגה מקדימה
                </button>
                <button class="btn btn-primary" onclick="showConfirmationModal()">
                    <i class="fas fa-check"></i> אישור ייבוא
                </button>
                </div>
            </div>
        `;
    
    // Update summary stats
    updateSummaryStats();
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    window.Logger.info('[Import Modal] File selected', { fileName: file.name, fileSize: file.size, page: 'import-user-data' });
    selectedFile = file;
    window.selectedFile = file; // Make it global
    
    // Update UI using existing HTML structure
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (fileInfo && fileName && fileSize) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        // Hide drop zone
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.style.display = 'none';
        }
        
        window.Logger.debug('[Import Modal] File info updated in UI', { page: 'import-user-data' });
        } else {
        window.Logger.error('File info elements not found:', { fileInfo, fileName, fileSize });
    }
    
    // Enable analyze button if account is also selected
    updateAnalyzeButton();
}

/**
 * Update analyze button state
 */
function updateAnalyzeButton() {
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.warn('[Import Modal] Modal not found for button update', { page: 'import-user-data' });
            return;
        }
    
    const continueBtn = modal.querySelector('[data-button-type="PRIMARY"]');
    if (continueBtn) {
        // Check actual DOM values - more reliable than variables
        // Look for selects INSIDE the modal to avoid conflicts
        const connectorSelect = modal.querySelector('#connectorSelect');
        const accountSelect = modal.querySelector('#tradingAccountSelect');
        
        // Get all possible values for debugging
        const connectorValue = connectorSelect?.value;
        const accountValue = accountSelect?.value;
        const accountSelectedIndex = accountSelect?.selectedIndex;
        const accountSelectedOption = accountSelect?.options[accountSelectedIndex];
        
        // Check both local and global selectedFile variables
        const currentSelectedFile = selectedFile || window.selectedFile;
        
        // Detailed debugging information
        const debugInfo = {
            selectedFile: !!currentSelectedFile,
            selectedFileName: currentSelectedFile?.name,
            connectorSelectExists: !!connectorSelect,
            connectorValue: connectorValue,
            accountSelectExists: !!accountSelect,
            accountValue: accountValue,
            accountSelectedIndex: accountSelectedIndex,
            accountSelectedOptionText: accountSelectedOption?.text,
            accountSelectedOptionValue: accountSelectedOption?.value,
            allOptions: accountSelect ? Array.from(accountSelect.options).map((opt, idx) => ({
                index: idx,
                value: opt.value,
                text: opt.text,
                selected: opt.selected
            })) : []
        };
        
        // Check if accountValue is not empty and not the default "בחר חשבון מסחר..."
        // Also check if it's a valid number (account IDs are numbers)
        const accountValid = accountValue && 
                           accountValue !== '' && 
                           accountValue !== '0' && 
                           !isNaN(parseInt(accountValue));
        
        const allFieldsFilled = currentSelectedFile && connectorValue && accountValid;
        
        window.Logger.debug('[Import Modal] Button state check - DETAILED', { 
            ...debugInfo,
            accountValid: accountValid,
            allFieldsFilled,
            page: 'import-user-data'
        });
        
        if (allFieldsFilled) {
            continueBtn.disabled = false;
            window.Logger.info('[Import Modal] Analyze button enabled', { 
                accountValue: accountValue,
                connectorValue: connectorValue,
                page: 'import-user-data' 
            });
        } else {
            continueBtn.disabled = true;
            window.Logger.warn('[Import Modal] Analyze button disabled - missing requirements', { 
                ...debugInfo,
                accountValid: accountValid,
                page: 'import-user-data'
            });
        }
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Reset file selection
 */
function resetFile() {
    window.Logger.debug('[Import Modal] Resetting file selection', { page: 'import-user-data' });
    selectedFile = null;
    window.selectedFile = null; // Make it global
    
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Hide file info and show drop zone
    const fileInfo = document.getElementById('fileInfo');
    const dropZone = document.getElementById('dropZone');
    
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    if (dropZone) {
        dropZone.style.display = 'block';
    }
    
    // Update analyze button
    updateAnalyzeButton();
}

/**
 * Handle account selection
 */
function handleAccountSelect(event) {
    // Handle both event-based calls and direct calls
    // Look for select INSIDE the modal to avoid conflicts
    const modal = document.getElementById('importUserDataModal');
    const target = event?.target || modal?.querySelector('#tradingAccountSelect');
    const value = target?.value;
    
    window.Logger.info('[Import Modal] handleAccountSelect called', { 
        event: event?.type || 'direct_call', 
        target: target?.id,
        value: value,
        selectedIndex: target?.selectedIndex,
        page: 'import-user-data' 
    });
    
    const accountId = value;
    window.Logger.info('[Import Modal] Account selected', { accountId, page: 'import-user-data' });
    
    if (!accountId) {
        selectedAccount = null;
                } else {
        selectedAccount = accountId;
    }
    
    // Update UI first
    const accountInfo = document.getElementById('accountInfo');
    if (accountInfo && target) {
        const selectedOption = target.options[target.selectedIndex];
        accountInfo.innerHTML = `
            <div class="account-selected">
                <i class="fas fa-user"></i>
                <span>${selectedOption.textContent}</span>
            </div>
        `;
    }
    
    // Wait a tick to ensure DOM is updated, then update button
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
        updateAnalyzeButton();
    });
    
    // Remove duplicate button update code below
}

/**
 * Handle connector selection
 */
function handleConnectorSelect(event) {
    const modal = document.getElementById('importUserDataModal');
    const target = event?.target || modal?.querySelector('#connectorSelect');
    selectedConnector = target?.value;
    window.Logger.info('[Import Modal] Connector selected', { 
        connector: selectedConnector,
        value: target?.value,
        page: 'import-user-data' 
    });
    
    // Validate connector selection using central validation system
    validateConnectorSelection();
    
    // Wait a tick to ensure DOM is updated, then update button
    requestAnimationFrame(() => {
        updateAnalyzeButton();
    });
}

/**
 * Validate connector selection using central validation system
 */
function validateConnectorSelection() {
    const connectorSelect = document.getElementById('connectorSelect');
    if (!connectorSelect) return;
    
    // Use central validation system
    const validationResult = window.validateSelectField(connectorSelect, {
        required: true,
        customValidation: (value) => {
            if (!value || value === '') {
                return 'חובה לבחור ספק נתונים';
            }
            return true;
        }
    });
    
    if (validationResult === true) {
        window.Logger.debug('[Import Modal] Connector validation passed', { connector: selectedConnector, page: 'import-user-data' });
        } else {
        window.Logger.warn('[Import Modal] Connector validation failed', { error: validationResult, page: 'import-user-data' });
    }
}

/**
 * Validate all required fields before proceeding
 */
function validateAllRequiredFields() {
    let isValid = true;
    
    // Validate connector selection using central validation system
    const connectorSelect = document.getElementById('connectorSelect');
    if (connectorSelect) {
        const connectorValidation = window.validateSelectField(connectorSelect, {
            required: true,
            customValidation: (value) => {
                if (!value || value === '') {
                    return 'חובה לבחור ספק נתונים';
                }
                return true;
            }
        });
        
        if (connectorValidation !== true) {
            isValid = false;
            window.Logger.warn('[Import Modal] Connector validation failed', { error: connectorValidation, page: 'import-user-data' });
            showImportUserDataNotification('שגיאה', connectorValidation, 'error');
        }
    }
    
    // Validate file selection
    if (!selectedFile) {
        isValid = false;
        window.Logger.warn('[Import Modal] No file selected', { page: 'import-user-data' });
        showImportUserDataNotification('שגיאה', 'חובה לבחור קובץ', 'error');
    }
    
    // Validate account selection using central validation system
    const accountSelect = document.getElementById('tradingAccountSelect');
    
    // Debug: Check if element exists and its properties
    window.Logger.debug('[Import Modal] Account select element debug', {
        exists: !!accountSelect,
        id: accountSelect?.id,
        className: accountSelect?.className,
        value: accountSelect?.value,
        options: accountSelect?.options?.length,
        page: 'import-user-data'
    });
    
    // Additional debug: Check all select elements
    const allSelects = document.querySelectorAll('select');
    window.Logger.debug('[Import Modal] All select elements found', {
        count: allSelects.length,
        elements: Array.from(allSelects).map(select => ({
            id: select.id,
            className: select.className,
            value: select.value
        })),
        page: 'import-user-data'
    });
    
    // Additional debug: Check all elements in the modal
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        const modalSelects = modal.querySelectorAll('select');
        window.Logger.debug('[Import Modal] Select elements in modal', {
            count: modalSelects.length,
            elements: Array.from(modalSelects).map(select => ({
                id: select.id,
                className: select.className,
                value: select.value,
                parentId: select.parentElement?.id
            })),
            page: 'import-user-data'
        });
        
        // Check if tradingAccountSelect is inside modal
        const accountInModal = modal.querySelector('#tradingAccountSelect');
        window.Logger.debug('[Import Modal] Account select in modal', {
            found: !!accountInModal,
            id: accountInModal?.id,
            page: 'import-user-data'
        });
    }
    
    if (accountSelect) {
        const accountValidation = window.validateSelectField(accountSelect, {
            required: true,
            customValidation: (value) => {
                if (!value || value === '') {
                    return 'חובה לבחור חשבון מסחר';
                }
                return true;
            }
        });
        
        if (accountValidation !== true) {
            isValid = false;
            window.Logger.warn('[Import Modal] Account validation failed', { error: accountValidation, page: 'import-user-data' });
            showImportUserDataNotification('שגיאה', accountValidation, 'error');
        }
    } else {
        isValid = false;
        window.Logger.error('[Import Modal] Account select element not found for validation', { page: 'import-user-data' });
        showImportUserDataNotification('שגיאה', 'שדה חשבון מסחר לא נמצא', 'error');
    }
    
    // Note: We don't need to check selectedAccount variable anymore
    // The account ID is only needed for the initial upload, then we use session_id
    
    return isValid;
}

/**
 * Load accounts from API
 */
async function loadAccounts() {
    window.Logger.debug('[Import Modal] Loading accounts', { page: 'import-user-data' });
    
    // Get the modal first to ensure we populate the correct select
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.error('[Import Modal] Modal not found for loading accounts', { page: 'import-user-data' });
        return;
    }
    
    const accountSelect = modal.querySelector('#tradingAccountSelect');
    if (!accountSelect) {
        window.Logger.error('[Import Modal] Account select not found in modal', { page: 'import-user-data' });
        return;
    }
    
    // Use the existing SelectPopulatorService but pass the element directly
    if (window.SelectPopulatorService) {
        window.Logger.debug('[Import Modal] Using SelectPopulatorService', { page: 'import-user-data' });
        try {
            // Temporarily set the ID to ensure SelectPopulatorService finds it
            // But we'll populate it manually to ensure it's the right element
            const response = await fetch('/api/trading-accounts/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            let accounts = responseData.data || responseData || [];
            
            // Filter only open accounts
            accounts = accounts.filter(account => account.status === 'open');
            
            // Clear existing options
            accountSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר חשבון מסחר...';
            accountSelect.appendChild(emptyOption);
            
            // Add account options
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id.toString(); // Ensure it's a string
                option.textContent = account.name;
                accountSelect.appendChild(option);
            });
            
            window.Logger.info('[Import Modal] Accounts loaded successfully', { 
                count: accounts.length, 
                page: 'import-user-data' 
            });
            
            // Update button state after loading
            updateAnalyzeButton();
        } catch (error) {
            window.Logger.error('[Import Modal] Error loading accounts', { error: error.message, page: 'import-user-data' });
            // Fallback to direct API call
            await loadAccountsFallback();
        }
    } else {
        window.Logger.warn('[Import Modal] SelectPopulatorService not available, using fallback', { page: 'import-user-data' });
        // Fallback to direct API call
        await loadAccountsFallback();
    }
}

/**
 * Fallback method to load accounts directly
 */
function loadAccountsFallback() {
    window.Logger.debug('[Import Modal] Loading accounts via fallback method', { page: 'import-user-data' });
    
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        window.Logger.error('[Import Modal] Modal not found for fallback', { page: 'import-user-data' });
        return;
    }
    
    const accountSelect = modal.querySelector('#tradingAccountSelect');
    if (!accountSelect) {
        window.Logger.error('[Import Modal] Account select not found in modal for fallback', { page: 'import-user-data' });
        return;
    }
    
    fetch('/api/trading-accounts/')
        .then(response => response.json())
        .then(data => {
            const accounts = data.data || data || [];
            const openAccounts = accounts.filter(account => account.status === 'open');
            
            // Clear existing options
            accountSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'בחר חשבון מסחר...';
            accountSelect.appendChild(emptyOption);
            
            // Add account options
            openAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id.toString(); // Ensure it's a string
                option.textContent = account.name;
                accountSelect.appendChild(option);
            });
            
            window.Logger.info('[Import Modal] Accounts loaded via fallback', { count: openAccounts.length, page: 'import-user-data' });
            
            // Update button state after loading
            updateAnalyzeButton();
        })
        .catch(error => {
            window.Logger.error('[Import Modal] Error loading accounts via fallback', { error: error.message, page: 'import-user-data' });
            showImportUserDataNotification('שגיאה בטעינת חשבונות', 'error');
        });
}

/**
 * Analyze file
 */
function analyzeFile() {
    // Validate all required fields using central validation system
    if (!validateAllRequiredFields()) {
        window.Logger.warn('[Import Modal] Cannot proceed - validation failed', { page: 'import-user-data' });
        return;
    }
    
    window.Logger.info('[Import Modal] Starting file analysis', { sessionId: currentSessionId, page: 'import-user-data' });
    
    // Get actual values from DOM - more reliable than variables
    const modal = document.getElementById('importUserDataModal');
    const connectorSelect = modal?.querySelector('#connectorSelect');
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    
    const connectorValue = connectorSelect?.value;
    const accountValue = accountSelect?.value;
    
    // Validate values
    if (!selectedFile || !connectorValue || !accountValue) {
        window.Logger.error('[Import Modal] Missing required values', {
            selectedFile: !!selectedFile,
            connectorValue: connectorValue,
            accountValue: accountValue,
            page: 'import-user-data'
        });
        showImportUserDataNotification('אנא מלא את כל השדות הנדרשים', 'error');
        return;
    }
    
    window.Logger.info('[Import Modal] Analysis starting with values', {
        selectedFile: selectedFile?.name,
        connectorValue: connectorValue,
        accountValue: accountValue,
        accountValueType: typeof accountValue,
        page: 'import-user-data'
    });
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('trading_account_id', accountValue);
    formData.append('connector_type', connectorValue);
    
    // Debug: Log what's being sent
    window.Logger.debug('[Import Modal] FormData contents', {
        hasFile: formData.has('file'),
        fileSize: selectedFile?.size,
        trading_account_id: formData.get('trading_account_id'),
        connector_type: formData.get('connector_type'),
        page: 'import-user-data'
    });
    
    fetch('/api/user-data-import/upload', {
            method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            window.Logger.info('[Import Modal] File analysis completed', { data, page: 'import-user-data' });
            currentSessionId = data.session_id;
            window.currentSessionId = data.session_id; // Make it global
            analysisResults = data.analysis_results;
            
            updateActiveSessionInfo({
                status: 'ניתוח הושלם',
                provider: data.provider,
                fileName: selectedFile?.name,
                fileSize: selectedFile?.size ?? null,
                accountName: accountSelect?.selectedOptions?.[0]?.text?.trim(),
                accountId: accountValue,
                connector: connectorValue,
                connectorName: connectorSelect?.selectedOptions?.[0]?.text?.trim()
            });
            updateActiveSessionFromAnalysis(data.analysis_results);
            updateResetSessionButtonState();
            
            // Display results
            displayAnalysisResults(data.analysis_results);
            
            // Load problem resolution now that we have session ID
            loadProblemResolution();
            
            // Go to next step
            setTimeout(() => goToStep(2), 1000);
    } else {
            showImportUserDataNotification(`שגיאה בניתוח הקובץ: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Analysis error:', error);
        showImportUserDataNotification('שגיאה בניתוח הקובץ', 'error');
    });
}

/**
 * Display analysis results
 */
function displayAnalysisResults(results) {
    window.Logger.debug('[Import Modal] Displaying analysis results', { results, page: 'import-user-data' });
    
    try {
        // Update the analysis cards
        const totalRecords = document.getElementById('totalRecords');
        const validRecords = document.getElementById('validRecords');
        const invalidRecords = document.getElementById('invalidRecords');
        const duplicateRecords = document.getElementById('duplicateRecords');
        const missingTickersCount = document.getElementById('missingTickersCount');
        const missingTickerRecords = document.getElementById('missingTickerRecords');
        const existingRecords = document.getElementById('existingRecords');
        
        window.Logger.debug('[Import Modal] Found elements', { 
            totalRecords: !!totalRecords, 
            validRecords: !!validRecords, 
            invalidRecords: !!invalidRecords, 
            duplicateRecords: !!duplicateRecords, 
            missingTickersCount: !!missingTickersCount,
            missingTickerRecords: !!missingTickerRecords,
            existingRecords: !!existingRecords,
            page: 'import-user-data' 
        });
        
        // Calculate actual importable records (clean_records minus records with missing tickers)
        const missingTickersCountValue = results.missing_tickers ? results.missing_tickers.length : 0;
        const missingTickerRecordsCount = results.missing_ticker_records || 0;
        // Calculate records that will actually be imported (clean_records minus missing ticker records)
        const actualValidRecords = Math.max(0, (results.clean_records || 0) - missingTickerRecordsCount);
        
        window.Logger.info('[Import Modal] Analysis results calculation', {
            total_records: results.total_records || 0,
            original_valid_records: results.valid_records || 0,
            clean_records: results.clean_records || 0,
            missing_tickers_count: missingTickersCountValue,
            missing_ticker_records_count: missingTickerRecordsCount,
            actual_valid_records: actualValidRecords,
            invalid_records: results.invalid_records || 0,
            duplicate_records: results.duplicate_records || 0,
            existing_records: results.existing_records || 0,
            page: 'import-user-data'
        });
        
        if (totalRecords) totalRecords.textContent = results.total_records || 0;
        if (validRecords) validRecords.textContent = actualValidRecords; // Records that will actually be imported (clean_records)
        if (invalidRecords) invalidRecords.textContent = results.invalid_records || 0;
        if (duplicateRecords) duplicateRecords.textContent = results.duplicate_records || 0;
        if (missingTickersCount) missingTickersCount.textContent = missingTickersCountValue; // Number of missing tickers
        if (missingTickerRecords) missingTickerRecords.textContent = missingTickerRecordsCount; // Records with missing tickers
        if (existingRecords) existingRecords.textContent = results.existing_records || 0; // Records that already exist in system
        
        window.Logger.info('[Import Modal] Analysis results displayed successfully', { page: 'import-user-data' });
        updateActiveSessionFromAnalysis(results);
        prepareDataTypeSelection(results);
    } catch (error) {
        window.Logger.error('[Import Modal] Error displaying analysis results', { error: error.message, stack: error.stack, page: 'import-user-data' });
    }
}

function prepareDataTypeSelection(results = {}) {
    detectedDataTypes = detectAvailableDataTypes(results);
    const availableType = detectedDataTypes.find(type => type.status === 'available');
    selectedDataTypeKey = availableType ? availableType.key : null;
    renderDataTypeSelection();
    setDataTypeActionsState(Boolean(availableType));
}

function detectAvailableDataTypes(results = {}) {
    const detected = [];
    const executionsDefinition = IMPORT_DATA_TYPE_DEFINITIONS.executions;
    const totalExecutions = Number(results.total_records ?? results.records_total ?? 0);
    detected.push({
        ...executionsDefinition,
        records: totalExecutions,
        status: 'available'
    });
    
    const cashflowsDefinition = IMPORT_DATA_TYPE_DEFINITIONS.cashflows;
    const cashflowsCount = Number(
        results.cashflow_records ??
        results.summary?.cashflows_total ??
        results.summary_data?.cashflows_total ??
        0
    );
    detected.push({
        ...cashflowsDefinition,
        records: cashflowsCount,
        status: 'planned'
    });
    
    const accountDefinition = IMPORT_DATA_TYPE_DEFINITIONS.account_reconciliation;
    detected.push({
        ...accountDefinition,
        records: Number(results.accounts_detected ?? 0),
        status: 'planned'
    });
    
    const portfolioDefinition = IMPORT_DATA_TYPE_DEFINITIONS.portfolio_positions;
    detected.push({
        ...portfolioDefinition,
        records: Number(results.positions_detected ?? 0),
        status: 'planned'
    });
    
    const taxesDefinition = IMPORT_DATA_TYPE_DEFINITIONS.taxes_and_fx;
    detected.push({
        ...taxesDefinition,
        records: Number(results.taxes_detected ?? results.fx_adjustments ?? 0),
        status: 'planned'
    });
    
    return detected;
}

function renderDataTypeSelection() {
    const card = document.getElementById('dataTypeSelectionCard');
    const listContainer = document.getElementById('dataTypeList');
    const detectedLabel = document.getElementById('dataTypeDetectedLabel');
    
    if (!card || !listContainer) {
        window.Logger.warn('[Import Modal] Data type selection container missing', { page: 'import-user-data' });
        return;
    }
    
    if (!detectedDataTypes || detectedDataTypes.length === 0) {
        card.style.display = 'none';
        setDataTypeActionsState(true);
        return;
    }
    
    card.style.display = 'block';
    listContainer.innerHTML = '';
    
    const availableTypes = detectedDataTypes.filter(type => type.status === 'available');
    if (!selectedDataTypeKey && availableTypes.length > 0) {
        selectedDataTypeKey = availableTypes[0].key;
    }
    
    detectedDataTypes.forEach(type => {
        const optionWrapper = document.createElement('div');
        optionWrapper.className = 'form-check';
        if (type.status !== 'available') {
            optionWrapper.classList.add('opacity-75');
        }
        
        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'radio';
        input.name = 'importDataType';
        input.id = `import-data-type-${type.key}`;
        input.value = type.key;
        input.disabled = type.status !== 'available';
        input.checked = selectedDataTypeKey === type.key;
        input.addEventListener('change', () => handleDataTypeRadioSelection(type.key));
        
        const label = document.createElement('label');
        label.className = 'form-check-label d-flex flex-column gap-1';
        label.setAttribute('for', input.id);
        label.innerHTML = `
            <div class="fw-bold">${type.label}</div>
            <div class="small text-muted">${type.description}</div>
            <div class="mt-1 d-flex flex-wrap gap-2 align-items-center">
                <span class="badge bg-light text-dark">${type.records || 0} רשומות בקובץ</span>
                ${type.status !== 'available' ? '<span class="badge bg-secondary">בפיתוח</span>' : ''}
            </div>
        `;
        
        optionWrapper.appendChild(input);
        optionWrapper.appendChild(label);
        listContainer.appendChild(optionWrapper);
    });
    
    if (detectedLabel) {
        const availableCount = availableTypes.length;
        const plannedCount = detectedDataTypes.filter(type => type.status !== 'available').length;
        detectedLabel.textContent = availableCount > 0
            ? `נמצאו ${detectedDataTypes.length} סוגי נתונים בקובץ (${availableCount} זמינים, ${plannedCount} בהכנה)`
            : `התהליכים החדשים עדיין נמצאים בשלבי אפיון – בחירת הביצועים זמינה להמשך`;
    }
    
    setDataTypeActionsState(Boolean(availableTypes.length));
}

function handleDataTypeRadioSelection(typeKey) {
    selectedDataTypeKey = typeKey;
    setDataTypeActionsState(true);
    window.Logger.info('[Import Modal] Data type selected', { selectedDataTypeKey, page: 'import-user-data' });
}

function setDataTypeActionsState(isEnabled) {
    const confirmBtn = document.getElementById('confirmDataTypeBtn');
    const continueBtn = document.querySelector('[data-id="btn-preview-continue"]');
    const placeholderBtn = document.getElementById('dataTypePlaceholderBtn');
    
    [confirmBtn, continueBtn].forEach(button => {
        if (button) {
            button.disabled = !isEnabled;
        }
    });
    
    if (placeholderBtn) {
        placeholderBtn.style.display = isEnabled ? 'none' : 'inline-flex';
        if (!isEnabled) {
            placeholderBtn.setAttribute('data-text', 'תהליכי ייבוא נוספים יתווספו בקרוב (פלייסהולדר)');
        }
    }
}

function confirmSelectedDataType() {
    if (!selectedDataTypeKey) {
        showImportUserDataNotification('בחר סוג נתונים לייבוא לפני המשך התהליך', 'warning');
        return;
    }
    
    const selectedType = detectedDataTypes.find(type => type.key === selectedDataTypeKey);
    if (!selectedType || selectedType.status !== 'available') {
        showImportUserDataNotification('התהליך שנבחר עדיין בהכנה. אנו מציגים פלייסהולדר ועדכון יישלח כאשר התהליך יהיה פעיל.', 'info');
        return;
    }
    
    window.Logger.info('[Import Modal] Continuing with selected import data type', {
        selectedDataTypeKey,
        page: 'import-user-data'
    });
    goToStep(3);
}

/**
 * Load problem resolution
 */
function toArray(value) {
    if (value === undefined || value === null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function buildProblemResolutionFromAnalysis(results) {
    if (!results) {
        return null;
    }

    const summary = {
        total_records: results.total_records || 0,
        records_to_import: results.clean_records || 0,
        records_to_skip: (results.invalid_records || 0) + (results.duplicate_records || 0) + (results.existing_records || 0),
        import_rate: results.total_records ? Math.round(((results.clean_records || 0) / results.total_records) * 100) : 0,
        missing_tickers: toArray(results.missing_tickers),
        duplicate_records: results.duplicate_records || 0,
        existing_records: results.existing_records || 0
    };

    const records_to_skip = [];
    const duplicateDetails = results.duplicate_details || {};

    toArray(duplicateDetails.within_file_duplicates).forEach((duplicate) => {
        if (!duplicate || !duplicate.record) {
            return;
        }
        records_to_skip.push({
            record: duplicate.record,
            reason: 'within_file_duplicate',
            confidence_score: duplicate.confidence || duplicate.confidence_score || 0,
            details: duplicate
        });

        toArray(duplicate.within_file_matches).forEach((match) => {
            if (!match || !match.record) {
                return;
            }
            records_to_skip.push({
                record: match.record,
                reason: 'within_file_duplicate_match',
                confidence_score: match.confidence || match.confidence_score || 0,
                details: match
            });
        });
    });

    toArray(duplicateDetails.existing_records).forEach((existing) => {
        if (!existing || !existing.record) {
            return;
        }
        records_to_skip.push({
            record: existing.record,
            reason: 'existing_record',
            matches: existing.system_matches || existing.matches || []
        });
    });

    toArray(results.validation_errors).forEach((validationError) => {
        if (!validationError || !validationError.record) {
            return;
        }
        records_to_skip.push({
            record: validationError.record,
            reason: 'validation_error',
            details: validationError.errors || []
        });
    });

    const missingTickerSymbols = summary.missing_tickers
        .map((ticker) => (typeof ticker === 'string' ? ticker : ticker?.symbol))
        .filter(Boolean);

    toArray(results.valid_records).forEach((record) => {
        if (record && record.symbol && missingTickerSymbols.includes(record.symbol)) {
            records_to_skip.push({
                record,
                reason: 'missing_ticker',
                missing_ticker: record.symbol
            });
        }
    });

    return {
        summary,
        records_to_skip
    };
}

function buildPreviewFromAnalysis(results) {
    if (!results) {
        return null;
    }

    const problemData = buildProblemResolutionFromAnalysis(results);
    if (!problemData) {
        return null;
    }

    const duplicateDetails = results.duplicate_details || {};
    const missingTickerSymbols = problemData.summary.missing_tickers
        .map((ticker) => (typeof ticker === 'string' ? ticker : ticker?.symbol))
        .filter(Boolean);

    const cleanRecords = toArray(duplicateDetails.clean_records)
        .map((entry) => (entry && entry.record ? entry.record : entry))
        .filter(Boolean)
        .filter((record) => !missingTickerSymbols.includes(record.symbol));

    const records_to_import = cleanRecords.map((record) => ({
        symbol: record.symbol || record.ticker || 'N/A',
        action: record.action || record.type || 'N/A',
        quantity: record.quantity ?? record.shares ?? null,
        price: record.price ?? null,
        fee: record.fee ?? record.commission ?? null,
        date: record.date,
        realized_pl: record.realized_pl,
        mtm_pl: record.mtm_pl,
        external_id: record.external_id
    }));

    const records_to_skip = problemData.records_to_skip.map((item) => ({
        ...item,
        reason: item.reason || 'unknown'
    }));

    const total_records = results.total_records || (records_to_import.length + records_to_skip.length);
    const summary = {
        ...problemData.summary,
        total_records,
        records_to_import: records_to_import.length,
        records_to_skip: records_to_skip.length,
        import_rate: total_records > 0 ? Math.round((records_to_import.length / total_records) * 100) : 0
    };

    return {
        records_to_import,
        records_to_skip,
        summary
    };
}

async function loadProblemResolution() {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    const analysisFallback = buildProblemResolutionFromAnalysis(analysisResults);

    try {
        const response = await fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'GET'
        });
        const data = await response.json();

        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayProblemResolutionDetailed(data.preview_data);
            return;
        }

        window.Logger.warn('[Import Modal] Preview data unavailable, falling back to analysis results', {
            status: data.status,
            error: data.error || data.message,
            page: 'import-user-data'
        });
        showImportUserDataNotification('לא ניתן לטעון את נתוני הפתרון המלאים. מוצגים נתוני ניתוח זמניים.', 'warning');
    } catch (error) {
        window.Logger.error('Problem resolution fetch error - using analysis fallback', {
            error: error.message,
            page: 'import-user-data'
        });
        showImportUserDataNotification('שגיאה בטעינת נתוני פתרון. מוצגים נתוני ניתוח זמניים.', 'warning');
    }

    if (analysisFallback) {
        displayProblemResolutionDetailed({
            summary: analysisFallback.summary,
            records_to_skip: analysisFallback.records_to_skip,
            records_to_import: []
        });
    } else {
        showImportUserDataNotification('לא נמצאו נתוני ניתוח להצגה.', 'error');
    }
}

/**
 * Display preview data
 */
function displayPreviewData(data) {
    window.Logger.debug('[Import Modal] Displaying preview data', { data, page: 'import-user-data' });
    
    if (!data) {
        window.Logger.warn('[Import Modal] No preview data to display', { page: 'import-user-data' });
        return;
    }
    
    // Update summary counts
    const importCount = data.records_to_import?.length || 0;
    const skipCount = data.records_to_skip?.length || 0;
    const totalCount = importCount + skipCount;
    const importRate = totalCount > 0 ? Math.round((importCount / totalCount) * 100) : 0;
    
    // Update summary display
    const importCountEl = document.getElementById('previewImportCount');
    const skipCountEl = document.getElementById('previewSkipCount');
    const importRateEl = document.getElementById('previewImportRate');
    
    if (importCountEl) importCountEl.textContent = importCount;
    if (skipCountEl) skipCountEl.textContent = skipCount;
    if (importRateEl) importRateEl.textContent = `${importRate}%`;
    
    // Display records to import
    const importTableBody = document.getElementById('importTableBody');
    if (importTableBody && data.records_to_import) {
        importTableBody.innerHTML = '';
        data.records_to_import.forEach(record => {
            const row = document.createElement('tr');
            const realizedPL = record.realized_pl !== null && record.realized_pl !== undefined 
                ? (record.realized_pl >= 0 ? `$${record.realized_pl}` : `-$${Math.abs(record.realized_pl)}`) 
                : '-';
            const mtmPL = record.mtm_pl !== null && record.mtm_pl !== undefined 
                ? (record.mtm_pl >= 0 ? `$${record.mtm_pl}` : `-$${Math.abs(record.mtm_pl)}`) 
                : '-';
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
                <td>${record.date || 'N/A'}</td>
            `;
            importTableBody.appendChild(row);
        });
    }
    
    // Display records to skip
    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableBody && data.records_to_skip) {
        skipTableBody.innerHTML = '';
        data.records_to_skip.forEach(record => {
            const row = document.createElement('tr');
            const realizedPL = record.realized_pl !== null && record.realized_pl !== undefined 
                ? (record.realized_pl >= 0 ? `$${record.realized_pl}` : `-$${Math.abs(record.realized_pl)}`) 
                : '-';
            const mtmPL = record.mtm_pl !== null && record.mtm_pl !== undefined 
                ? (record.mtm_pl >= 0 ? `$${record.mtm_pl}` : `-$${Math.abs(record.mtm_pl)}`) 
                : '-';
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
                <td>${record.date || 'N/A'}</td>
                <td>${record.reason || 'N/A'}</td>
            `;
            skipTableBody.appendChild(row);
        });
    }
    
    window.Logger.info('[Import Modal] Preview data displayed successfully', { 
        importCount, 
        skipCount, 
        importRate, 
        page: 'import-user-data' 
    });
    
    updateActiveSessionFromPreview(data);
}

/**
 * Load preview data (Step 4)
 */
function loadPreviewData() {
    window.Logger.debug('[Import Modal] Loading preview data', { 
        currentSessionId, 
        page: 'import-user-data' 
    });
    
    if (!currentSessionId) {
        window.Logger.error('[Import Modal] No session ID for preview', { page: 'import-user-data' });
        showImportUserDataNotification('שגיאה: אין מזהה הפעלה', 'error');
        return;
    }
    
    // Load preview data from server
    fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayPreviewData(data.preview_data);
            displayConfirmationData(analysisResults, data.preview_data);
            window.Logger.info('[Import Modal] Preview and confirmation data loaded successfully', { 
                data: data.preview_data, 
                page: 'import-user-data' 
            });
        } else {
            window.Logger.error('[Import Modal] Failed to load preview data', { 
                error: data.error || data.message, 
                page: 'import-user-data' 
            });
            const apiMessage = getApiErrorMessage(data, 'שגיאה לא ידועה בתצוגה מקדימה');
            showImportUserDataNotification(`שגיאה בטעינת תצוגה מקדימה: ${apiMessage}`, 'warning');
            const analysisFallback = buildPreviewFromAnalysis(analysisResults);
            if (analysisFallback) {
                previewData = analysisFallback;
                displayPreviewData(analysisFallback);
                displayConfirmationData(analysisResults, analysisFallback);
                window.Logger.warn('[Import Modal] Using analysis-based preview fallback', {
                    page: 'import-user-data'
                });
            } else {
                showImportUserDataNotification('לא נמצאו נתוני ניתוח להצגה בתצוגה מקדימה.', 'error');
            }
        }
    })
    .catch(error => {
        window.Logger.error('[Import Modal] Preview data error:', error);
        showImportUserDataNotification('שגיאה בטעינת תצוגה מקדימה', 'warning');
        const analysisFallback = buildPreviewFromAnalysis(analysisResults);
        if (analysisFallback) {
            previewData = analysisFallback;
            displayPreviewData(analysisFallback);
            displayConfirmationData(analysisResults, analysisFallback);
            window.Logger.warn('[Import Modal] Using analysis-based preview fallback after fetch error', {
                page: 'import-user-data'
            });
        } else {
            showImportUserDataNotification('לא נמצאו נתוני ניתוח להצגה בתצוגה מקדימה.', 'error');
        }
    });
}

/**
 * Load confirmation data (Step 5)
 */
function loadConfirmationData() {
    // The HTML content is already in the DOM, just need to display confirmation data
    if (analysisResults && previewData) {
        displayConfirmationData(analysisResults, previewData);
    }
}

/**
 * Display confirmation data
 */
function displayConfirmationData(analysisResults, previewData) {
    window.Logger.debug('[Import Modal] Displaying confirmation data', { analysisResults, previewData, page: 'import-user-data' });
    
    if (!analysisResults || !previewData) {
        window.Logger.warn('[Import Modal] Missing data for confirmation display', { page: 'import-user-data' });
        return;
    }
    
    // Update confirmation summary
    const fileName = window.selectedFile?.name || 'קובץ לא ידוע';
    const accountSelect = document.getElementById('tradingAccountSelect');
    const accountName = accountSelect?.selectedOptions[0]?.text || 'חשבון לא ידוע';
    
    const totalRecords = analysisResults.total_records || 0;
    const importCount = previewData.records_to_import?.length || 0;
    const skipCount = previewData.records_to_skip?.length || 0;
    
    // Update confirmation display elements
    const confirmFileNameEl = document.getElementById('confirmFileName');
    const confirmAccountNameEl = document.getElementById('confirmAccountName');
    const confirmTotalRecordsEl = document.getElementById('confirmTotalRecords');
    const confirmImportRecordsEl = document.getElementById('confirmImportRecords');
    const confirmSkipRecordsEl = document.getElementById('confirmSkipRecords');
    
    if (confirmFileNameEl) confirmFileNameEl.textContent = fileName;
    if (confirmAccountNameEl) confirmAccountNameEl.textContent = accountName;
    if (confirmTotalRecordsEl) confirmTotalRecordsEl.textContent = totalRecords;
    if (confirmImportRecordsEl) confirmImportRecordsEl.textContent = importCount;
    if (confirmSkipRecordsEl) confirmSkipRecordsEl.textContent = skipCount;
    
    window.Logger.info('[Import Modal] Confirmation data displayed successfully', { 
        fileName, 
        accountName, 
        totalRecords, 
        importCount, 
        skipCount, 
        page: 'import-user-data' 
    });
}

/**
 * Display problem resolution
 */
function displayProblemResolution(data) {
    const container = document.getElementById('problemResolution');
    if (!container) return;
    
    container.innerHTML = `
        <div class="problem-resolution">
            <div class="problem-section">
                <h5>טיקרים חסרים</h5>
                <div id="missingTickers" class="problem-cards">
                    ${data.missing_tickers?.map(ticker => {
                        const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
                        const currency = typeof ticker === 'string' ? 'USD' : ticker.currency;
                        return `
                        <div class="problem-card missing-ticker-card">
                            <div class="problem-card-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>${symbol}</span>
                            </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-primary" onclick="openAddTickerModal('${symbol}', '${currency}')">
                                    הוסף טיקר
                </button>
                                        </div>
                                    </div>
                    `;
                    }).join('') || '<p>אין טיקרים חסרים</p>'}
                                                </div>
                                                </div>
            
            <div class="problem-section">
                <h5>כפילויות בקובץ</h5>
                <div id="withinFileDuplicates" class="problem-cards">
                    ${data.within_file_duplicates?.map((dup, index) => `
                        <div class="problem-card within-file-duplicate">
                            <div class="problem-card-header">
                                <i class="fas fa-copy"></i>
                                <span>${dup.symbol} - ${dup.date}</span>
                                            </div>
                            <div class="problem-card-body">
                                <div class="problem-card-details">
                                    <span>כמות: ${dup.quantity}</span>
                                    <span>מחיר: ${dup.price}</span>
                                    </div>
                                <div class="problem-card-confidence">
                                    <span>רמת ביטחון: ${dup.confidence || 0}%</span>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${dup.confidence || 0}%"></div>
                                </div>
                            </div>
                            </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-success" onclick="acceptDuplicate(${index}, 'within_file')">
                                    קבל
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectDuplicate(${index}, 'within_file')">
                                    דחה
                                </button>
                            </div>
                        </div>
                    `).join('') || '<p>אין כפילויות בקובץ</p>'}
                        </div>
                    </div>
            
            <div class="problem-section">
                <h5>כפילויות מול בסיס הנתונים</h5>
                <div id="existingRecords" class="problem-cards">
                    ${data.existing_records?.map((record, index) => `
                        <div class="problem-card existing-record-card">
                            <div class="problem-card-header">
                                <i class="fas fa-database"></i>
                                <span>${record.symbol} - ${record.date}</span>
                            </div>
                            <div class="problem-card-body">
                                <div class="problem-card-details">
                                    <span>כמות: ${record.quantity}</span>
                                    <span>מחיר: ${record.price}</span>
                                        </div>
                                <div class="problem-card-confidence">
                                    <span>רמת ביטחון: ${record.confidence || 0}%</span>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${record.confidence || 0}%"></div>
                                    </div>
                                                </div>
                                                </div>
                            <div class="problem-card-actions">
                                <button class="btn btn-sm btn-success" onclick="acceptDuplicate(${index}, 'existing_record')">
                                    קבל
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectDuplicate(${index}, 'existing_record')">
                                    דחה
                                </button>
                            </div>
                        </div>
                    `).join('') || '<p>אין כפילויות מול בסיס הנתונים</p>'}
                        </div>
                    </div>
            
            <div class="step-actions">
                <button class="btn btn-primary" onclick="goToStep(4)">
                    <i class="fas fa-arrow-right"></i> המשך לתצוגה מקדימה
                        </button>
                    </div>
                </div>
            `;
}

/**
 * Accept duplicate
 */
function acceptDuplicate(index, type) {
    if (!currentSessionId) return;
    
    fetch(`/api/user-data-import/session/${currentSessionId}/accept-duplicate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            record_index: index,
            duplicate_type: type
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            showImportUserDataNotification('כפילות אושרה', 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showImportUserDataNotification(`שגיאה באישור כפילות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Accept duplicate error:', error);
        showImportUserDataNotification('שגיאה באישור כפילות', 'error');
    });
}

/**
 * Reject duplicate
 */
function rejectDuplicate(index, type) {
    if (!currentSessionId) return;
    
    fetch(`/api/user-data-import/session/${currentSessionId}/reject-duplicate`, {
            method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            record_index: index,
            duplicate_type: type
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            showImportUserDataNotification('כפילות נדחתה', 'success');
            // Refresh preview data
            refreshPreviewData();
        } else {
            showImportUserDataNotification(`שגיאה בדחיית כפילות: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Reject duplicate error:', error);
        showImportUserDataNotification('שגיאה בדחיית כפילות', 'error');
    });
}

/**
 * Open add ticker modal
 */
async function openAddTickerModal(symbol, currency = 'USD') {
    const normalizedSymbol = (symbol || '').toUpperCase().trim();
    const normalizedCurrency = (currency || 'USD').toUpperCase().trim();

    ensureTickerSaveHook();

    const showModal = window.showModalSafe || (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function'
        ? window.ModalManagerV2.showModal.bind(window.ModalManagerV2)
        : null);

    let canUseModal = Boolean(showModal);

    if (canUseModal) {
        const configLoaded = await ensureTickersModalConfigLoaded();
        if (!configLoaded) {
            canUseModal = false;
            window.Logger?.error('[Import Modal] Tickers modal configuration failed to load', { page: 'import-user-data' });
            showImportUserDataNotification('שגיאה בטעינת מודול הטיקר הכללי', 'error');
        }
    }

    if (canUseModal) {
        try {
            await showModal('tickersModal', 'add');

            const modalElement = document.getElementById('tickersModal');
            if (modalElement) {
                const symbolInput = modalElement.querySelector('#tickerSymbol');
                const nameInput = modalElement.querySelector('#tickerName');
                const typeSelect = modalElement.querySelector('#tickerType');
                const currencySelect = modalElement.querySelector('#tickerCurrency');
                const remarksField = modalElement.querySelector('#tickerRemarks');

                if (symbolInput) {
                    setInputValue(symbolInput, normalizedSymbol);
                }
                if (nameInput && !nameInput.value) {
                    setInputValue(nameInput, normalizedSymbol);
                }
                if (typeSelect) {
                    setSelectValue(typeSelect, 'stock');
                }
                if (currencySelect) {
                    await setCurrencySelectValue(currencySelect, normalizedCurrency);
                }
                if (remarksField) {
                    remarksField.value = '';
                }
            }
        return;
        } catch (error) {
            window.Logger?.error('[Import Modal] Failed to open tickers modal via ModalManager', { error: error.message });
            showImportUserDataNotification('שגיאה בפתיחת מודול הטיקר', 'error');
        }
    }

    const fallbackName = prompt(`הזן שם לטיקר ${normalizedSymbol}:`, normalizedSymbol);
    if (fallbackName) {
        await quickAddTicker(normalizedSymbol, fallbackName, normalizedCurrency);
    }
}

/**
 * Generate preview
 */
function generatePreview() {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    fetch(`/api/user-data-import/session/${currentSessionId}/preview`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayPreview(data.preview_data);
            
            // Go to next step
            setTimeout(() => goToStep(5), 1000);
        } else {
            showImportUserDataNotification(`שגיאה ביצירת תצוגה מקדימה: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Preview error:', error);
        showImportUserDataNotification('שגיאה ביצירת תצוגה מקדימה', 'error');
    });
}

/**
 * Display preview
 */
function displayPreview(data) {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="preview-data">
            <h5>תצוגה מקדימה</h5>
            <div class="preview-summary">
                <div class="summary-item">
                    <span class="summary-label">רשומות לייבוא:</span>
                    <span class="summary-count">${data.summary?.records_to_import || 0}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">רשומות לדילוג:</span>
                    <span class="summary-count">${data.summary?.records_to_skip || 0}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">אחוז ייבוא:</span>
                    <span class="summary-count">${data.summary?.import_rate || 0}%</span>
                </div>
            </div>
            
            <div class="preview-tables">
                <div class="table-container">
                    <h6>רשומות לייבוא</h6>
                    <div class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th>סמל</th>
                                    <th>תאריך</th>
                                    <th>כמות</th>
                                    <th>מחיר</th>
                                    <th>עמלה</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.records_to_import?.map(record => `
                                    <tr>
                <td>${record.symbol}</td>
                                        <td>${record.date}</td>
                <td>${record.quantity}</td>
                                        <td>${record.price}</td>
                                        <td>${record.fee}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5">אין רשומות לייבוא</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="table-container">
                    <h6>רשומות לדילוג</h6>
                    <div class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th>סמל</th>
                                    <th>תאריך</th>
                                    <th>כמות</th>
                                    <th>מחיר</th>
                                    <th>סיבה</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.records_to_skip?.map(record => `
                                    <tr>
                <td>${record.symbol}</td>
                                        <td>${record.date}</td>
                <td>${record.quantity}</td>
                                        <td>${record.price}</td>
                                        <td>${record.reason}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5">אין רשומות לדילוג</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update summary stats
 */
function updateSummaryStats() {
    if (!previewData) return;
    
    const importCount = document.getElementById('importCount');
    const skipCount = document.getElementById('skipCount');
    const importRate = document.getElementById('importRate');
    
    if (importCount) importCount.textContent = previewData.summary?.records_to_import || 0;
    if (skipCount) skipCount.textContent = previewData.summary?.records_to_skip || 0;
    if (importRate) importRate.textContent = `${previewData.summary?.import_rate || 0}%`;
    
    updateActiveSessionFromPreview(previewData);
}

/**
 * Show confirmation modal
 */
function showConfirmationModal() {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal-overlay';
    modal.innerHTML = `
                <div class="confirmation-modal">
            <h3>אישור ייבוא נתונים</h3>
            <p>האם אתה בטוח שברצונך לייבא את הנתונים?</p>
                    <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeConfirmationModal()">ביטול</button>
                <button class="btn btn-primary" onclick="executeImport()">ביצוע ייבוא</button>
                <button class="btn btn-danger" onclick="executeImportWithReport()">ייבוא + דוח</button>
                </div>
            </div>
        `;
        
    document.body.appendChild(modal);
}

/**
 * Close confirmation modal
 */
function closeConfirmationModal() {
    const modal = document.querySelector('.confirmation-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/**
 * Execute import
 */
function executeImport() {
    closeConfirmationModal();
    performImport(false);
}

/**
 * Execute import with report
 */
function executeImportWithReport() {
    closeConfirmationModal();
    performImport(true);
}

/**
 * Perform import
 */
function performImport(generateReport = false) {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    showImportUserDataNotification('מתחיל ייבוא נתונים...', 'info');
    
    fetch(`/api/user-data-import/session/${currentSessionId}/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            generate_report: generateReport
        })
    })
    .then(response => response.json())
    .then(data => {
        const importedCount = Number(
            data.imported_count ?? data.importedCount ?? 0
        );
        const skippedCount = Number(
            data.skipped_count ?? data.skippedCount ?? 0
        );
        const importErrors = Array.isArray(data.import_errors)
            ? data.import_errors
            : (data.importErrors && Array.isArray(data.importErrors))
                ? data.importErrors
                : [];
        const apiSucceeded = data.success === true || data.status === 'success';

        if (apiSucceeded && importedCount > 0) {
            let successMessage = `ייבוא הנתונים הושלם בהצלחה! נוספו ${importedCount} רשומות חדשות.`;
            if (skippedCount > 0) {
                successMessage += ` ${skippedCount} רשומות הושמטו (שגיאות/כפילויות).`;
            }

            showImportUserDataNotification(successMessage, 'success');
            closeImportUserDataModal();
            
            if (importErrors.length) {
                const detailedMessage = importErrors
                    .map((message, idx) => `• (${idx + 1}) ${message}`)
                    .join('\n');
                if (typeof window.showDetailedNotification === 'function') {
                    window.showDetailedNotification(
                        'ייבוא הושלם עם אזהרות',
                        detailedMessage,
                        'warning',
                        12000,
                        'import-user-data'
                    );
                } else {
                    showImportUserDataNotification(
                        'ייבוא הושלם עם אזהרות. פתח את לוג המערכת לפרטים.',
                        'warning'
                    );
                }
            }
            
            if (generateReport && data.report_url) {
                showImportUserDataNotification('דוח ייבוא זמין להורדה', 'info');
            }
            
            // Clear cache to show new data - use centralized cache clearing
            clearImportCacheLayers({ reason: 'import-user-data:execute' });
            clearStoredActiveSession();
            // LEGACY (pre Stage B-Lite) flow:
            // if (typeof window.clearCacheQuick === 'function') {
            //     window.clearCacheQuick(null, { source: 'import-user-data' });
            // } else if (typeof window.clearAllCacheAdvanced === 'function') {
            //     window.clearAllCacheAdvanced({ source: 'import-user-data' });
            // }

            if (typeof window.loadExecutionsData === 'function') {
                window.loadExecutionsData();
            }
            return;
        }

        const errorMessage = getApiErrorMessage(
            data,
            apiSucceeded && importedCount === 0
                ? 'הייבוא הסתיים ללא רשומות חדשות. בדוק את נתוני הקובץ והמשך לטפל בבעיות.'
                : 'שגיאה בייבוא הנתונים'
        );

        showImportUserDataNotification(`שגיאה בייבוא: ${errorMessage}`, 'error');

        if (importErrors.length) {
            const detailedMessage = importErrors
                .map((message, idx) => `• (${idx + 1}) ${message}`)
                .join('\n');
            if (typeof window.showDetailedNotification === 'function') {
                window.showDetailedNotification(
                    'שגיאה בייבוא נתונים',
                    detailedMessage,
                    'error',
                    15000,
                    'import-user-data'
                );
            }
        }
    })
    .catch(error => {
        window.Logger.error('Import error:', error);
        showImportUserDataNotification('שגיאה בייבוא הנתונים', 'error');
    });
}

function confirmResetImportSession() {
    if (!currentSessionId) {
        finalizeImportReset({ clearCache: true });
        showImportUserDataNotification('לא נמצא סשן ייבוא פעיל. ניתן להתחיל תהליך חדש.', 'info');
        return;
    }

    const confirmationMessage = 'הפעולה תאפס את סשן הייבוא הנוכחי, תנקה נתוני ביניים ומטמון, ותאפשר להתחיל תהליך חדש.\nהאם להמשיך?';
    if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
            'איפוס תהליך ייבוא',
            confirmationMessage,
            () => performResetImportSession(),
            null,
            'warning'
        );
    } else if (window.confirm(confirmationMessage)) {
        performResetImportSession();
    }
}

function performResetImportSession() {
    const sessionId = currentSessionId;

    if (!sessionId) {
        finalizeImportReset({ clearCache: true });
        showImportUserDataNotification('לא נמצא סשן ייבוא פעיל. ניתן להתחיל תהליך חדש.', 'info');
        return;
    }

    showImportUserDataNotification('מאפס את סשן הייבוא...', 'info');

    fetch(`/api/user-data-import/session/${sessionId}/reset`, {
        method: 'POST'
    })
    .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        return { ok: response.ok, data };
    })
    .then(({ ok, data }) => {
        const success = data?.success === true || data?.status === 'success';
        const sessionNotFound = (data?.message || '').toLowerCase().includes('session not found');

        if (success || sessionNotFound) {
            const cancelledSessions = Array.isArray(data?.cancelled_sessions) ? data.cancelled_sessions.length : 0;
            window.Logger?.info?.('[Import Modal] Reset request cancelled sessions', {
                cancelledSessions,
                sessionIds: data?.cancelled_sessions || []
            });
            showImportUserDataNotification('סשן הייבוא אופס בהצלחה. ניתן להתחיל תהליך חדש.', 'success');
            finalizeImportReset({ clearCache: true });
            return;
        }

        const errorMessage = getApiErrorMessage(data, 'נכשל באיפוס סשן הייבוא');
        showImportUserDataNotification(`שגיאה באיפוס הייבוא: ${errorMessage}`, 'error');

        const detailedErrors = Array.isArray(data?.errors) ? data.errors : null;
        if (detailedErrors?.length && typeof window.showDetailedNotification === 'function') {
            window.showDetailedNotification(
                'פרטי שגיאה באיפוס ייבוא',
                detailedErrors.map((item, idx) => `(${idx + 1}) ${item}`).join('\n'),
                'error',
                12000,
                'import-user-data'
            );
        }
    })
    .catch(error => {
        window.Logger?.error('[Import Modal] Failed to reset import session', { error: error?.message });
        showImportUserDataNotification('שגיאה באיפוס הייבוא', 'error');
        if (typeof window.showDetailedNotification === 'function') {
            window.showDetailedNotification(
                'שגיאה באיפוס הייבוא',
                error?.message || 'שגיאה לא ידועה',
                'error',
                12000,
                'import-user-data'
            );
        }
    })
    .finally(() => {
        updateResetSessionButtonState();
    });
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Unified notification helper for import modal
 */
const IMPORT_NOTIFICATION_DEFAULTS = {
    title: 'ייבוא נתונים',
    category: 'import-user-data',
    duration: 6000
};

let importNotificationGuard = false;

function resolveImportNotificationDelegate() {
    if (window.notificationSystem?.showNotification && window.notificationSystem.showNotification !== showImportUserDataNotification) {
        return window.notificationSystem.showNotification.bind(window.notificationSystem);
    }

    if (typeof window.showNotification === 'function' && window.showNotification !== showImportUserDataNotification) {
        return window.showNotification.bind(window);
    }

    if (window.NotificationSystem?.show && window.NotificationSystem.show !== showImportUserDataNotification) {
        return window.NotificationSystem.show.bind(window.NotificationSystem);
    }

    return null;
}

function showImportUserDataNotification(message, type = 'info', title = '', options = {}) {
    if (typeof message !== 'string') {
        message = String(message ?? '');
    }

    const normalizedType = typeof type === 'string' ? type.toLowerCase() : 'info';
    const finalTitle = title || IMPORT_NOTIFICATION_DEFAULTS.title;
    const finalOptions = {
        ...options,
        category: options.category || IMPORT_NOTIFICATION_DEFAULTS.category,
        functionName: options.functionName || 'showImportUserDataNotification'
    };
    const duration = typeof options.duration === 'number'
        ? options.duration
        : IMPORT_NOTIFICATION_DEFAULTS.duration;

    const delegate = resolveImportNotificationDelegate();

    if (delegate && !importNotificationGuard) {
        try {
            importNotificationGuard = true;
            return delegate(message, normalizedType, finalTitle, duration, finalOptions.category, finalOptions);
        } catch (error) {
            window.Logger?.warn('[Import Modal] Notification delegate failed', {
                error: error?.message,
                page: 'import-user-data'
            });
        } finally {
            importNotificationGuard = false;
        }
    }

    const prefix = finalTitle ? `${finalTitle}: ` : '';
    const logMethod = normalizedType === 'error'
        ? 'error'
        : normalizedType === 'warning'
            ? 'warn'
            : 'info';
    window.Logger?.[logMethod](`[Import Modal] ${prefix}${message}`, {
        type: normalizedType,
        title: finalTitle,
        options: finalOptions,
        page: 'import-user-data',
        fallback: true
    });
    return Promise.resolve(false);
}

/**
 * Display problem resolution with detailed cards
 */
function displayProblemResolutionDetailed(data) {
    window.Logger.debug('[Import Modal] Displaying detailed problem resolution', { data, page: 'import-user-data' });
    
    // Clear existing content
    clearProblemSections();
    
    // Display missing tickers
    if (data.summary?.missing_tickers && data.summary.missing_tickers.length > 0) {
        displayMissingTickers(data.summary.missing_tickers);
    }
    
    // Display within-file duplicates
    if (data.records_to_skip) {
        const withinFileDuplicates = data.records_to_skip.filter(record => 
            record.reason === 'within_file_duplicate' || record.reason === 'within_file_duplicate_match'
        );
        if (withinFileDuplicates.length > 0) {
            displayWithinFileDuplicates(withinFileDuplicates);
        }
    }
    
    // Display existing records
    if (data.records_to_skip) {
        const existingRecords = data.records_to_skip.filter(record => 
            record.reason === 'existing_record'
        );
        if (existingRecords.length > 0) {
            displayExistingRecords(existingRecords);
        }
    }
    
    updateActiveSessionFromPreview(data);
}

/**
 * Clear all problem sections
 */
function clearProblemSections() {
    const sections = [
        'missingTickersSection',
        'withinFileDuplicatesSection', 
        'existingRecordsSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

/**
 * Display missing tickers
 */
function displayMissingTickers(missingTickers) {
    const section = document.getElementById('missingTickersSection');
    const container = document.getElementById('missingTickersContainer');
    
    if (!section || !container) return;
    
    section.style.display = 'block';
    
    container.innerHTML = missingTickers.map(ticker => 
        renderMissingTickerCard(ticker)
    ).join('');
}

/**
 * Display within-file duplicates
 */
function displayWithinFileDuplicates(duplicates) {
    const section = document.getElementById('withinFileDuplicatesSection');
    const container = document.getElementById('withinFileDuplicatesContainer');
    
    if (!section || !container) return;
    
    section.style.display = 'block';
    
    container.innerHTML = duplicates.map((duplicate, index) => 
        renderDuplicateCard(duplicate, 'within_file', index)
    ).join('');
}

/**
 * Display existing records
 */
function displayExistingRecords(existingRecords) {
    const section = document.getElementById('existingRecordsSection');
    const container = document.getElementById('existingRecordsContainer');
    
    if (!section || !container) return;
    
    section.style.display = 'block';
    
    container.innerHTML = existingRecords.map((record, index) => 
        renderDuplicateCard(record, 'existing_record', index)
    ).join('');
}

/**
 * Render missing ticker card
 */
function renderMissingTickerCard(ticker) {
    const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
    const currency = typeof ticker === 'string' ? 'USD' : ticker.currency;
    
    return `
        <div class="problem-card missing-ticker-card">
            <div class="problem-card-header">
                <i class="bi bi-exclamation-circle"></i>
                <span>${symbol}</span>
            </div>
            <div class="problem-card-body">
                <div class="missing-ticker-info">
                    <i class="bi bi-info-circle"></i>
                    הטיקר ${symbol} לא קיים במערכת
                </div>
            </div>
            <div class="problem-card-actions">
                <button class="btn btn-sm btn-primary" onclick="openAddTickerModal('${symbol}', '${currency}')">
                    <i class="bi bi-plus-circle"></i>
                    הוסף טיקר
                </button>
            </div>
        </div>
    `;
}

/**
 * Render duplicate/existing record card
 */
function renderDuplicateCard(duplicate, type, index) {
    const confidence = duplicate.confidence_score || 0;
    const confidenceClass = getConfidenceClass(confidence);
    
    return `
        <div class="problem-card ${type === 'within_file' ? 'within-file-duplicate' : 'existing-record-card'}">
            <div class="problem-card-header">
                <i class="bi ${type === 'within_file' ? 'bi-files' : 'bi-exclamation-triangle'}"></i>
                <span>${duplicate.symbol || 'לא ידוע'}</span>
            </div>
            <div class="problem-card-body">
                <div class="problem-card-details">
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">פעולה:</span>
                        <span class="problem-card-detail-value">${duplicate.action || 'לא ידוע'}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">כמות:</span>
                        <span class="problem-card-detail-value">${duplicate.quantity || 'לא ידוע'}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">מחיר:</span>
                        <span class="problem-card-detail-value">${duplicate.price || 'לא ידוע'}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">תאריך:</span>
                        <span class="problem-card-detail-value">${duplicate.date || 'לא ידוע'}</span>
                    </div>
                </div>
                <div class="problem-card-confidence ${confidenceClass}">
                    <span class="confidence-text">רמת ביטחון: ${confidence}%</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                </div>
            </div>
            <div class="problem-card-actions">
                <button class="btn btn-sm btn-success" onclick="acceptDuplicate(${index}, '${type}')">
                    <i class="bi bi-check-circle"></i>
                    קבל
                </button>
                <button class="btn btn-sm btn-danger" onclick="rejectDuplicate(${index}, '${type}')">
                    <i class="bi bi-x-circle"></i>
                    דחה
                </button>
            </div>
        </div>
    `;
}

/**
 * Get confidence class based on score
 */
function getConfidenceClass(confidence) {
    if (confidence >= 80) return 'confidence-high';
    if (confidence >= 50) return 'confidence-medium';
    return 'confidence-low';
}

/**
 * Refresh preview data after user actions
 */
function refreshPreviewData() {
    if (!currentSessionId) return;
    
    fetch(`/api/user-data-import/session/${currentSessionId}/refresh-preview`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            updateActiveSessionFromPreview(data.preview_data);
            // Refresh the current step display
            if (currentStep === 3) {
                displayProblemResolutionDetailed(data.preview_data);
            } else if (currentStep === 4) {
                displayPreview(data.preview_data);
            }
        } else {
            showImportUserDataNotification(`שגיאה ברענון התצוגה: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        window.Logger.error('Refresh preview error:', error);
        showImportUserDataNotification('שגיאה ברענון התצוגה', 'error');
    });
}

/**
 * Confirm import - final step before executing the import
 */
function confirmImport(withReport = false) {
    window.Logger.info('[Import Modal] Confirming import', { 
        withReport, 
        sessionId: currentSessionId,
        page: 'import-user-data' 
    });
    
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן לייבוא', 'error');
        return;
    }
    
    // Execute the import
    if (withReport) {
        executeImportWithReport();
        } else {
        executeImport();
        }
}

// Export functions for global access
window.openImportUserDataModal = openImportUserDataModal;
window.closeImportUserDataModal = closeImportUserDataModal;
window.goToStep = goToStep;
window.uploadFile = handleFileSelect;
window.selectAccount = handleAccountSelect;
window.analyzeFile = analyzeFile;
window.acceptDuplicate = acceptDuplicate;
window.rejectDuplicate = rejectDuplicate;
window.openAddTickerModal = openAddTickerModal;
window.showConfirmationModal = showConfirmationModal;
window.closeConfirmationModal = closeConfirmationModal;
window.executeImport = executeImport;
window.executeImportWithReport = executeImportWithReport;
window.performImport = performImport;
window.showImportUserDataNotification = showImportUserDataNotification;
window.resetFile = resetFile;
window.confirmImport = confirmImport;
window.confirmSelectedDataType = confirmSelectedDataType;
