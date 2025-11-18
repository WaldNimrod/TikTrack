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

/*
 * ==========================================
 * FUNCTION INDEX (Key Sections)
 * ==========================================
 * INITIALIZATION & STATE
 *   - createEmptyProblemState()
 *   - resetImportModalState()
 *   - initializeImportModal()
 * DATA FLOW
 *   - startImportAnalysis()
 *   - displayPreviewData()
 *   - executeFinalImport()
 * PROBLEM RESOLUTION
 *   - clearProblemSections()
 *   - displayExistingRecords()
 *   - renderMissingTickerRow()
 * UI INTERACTION
 *   - handleImportStepChange()
 *   - updateImportProgressBar()
 * COMPATIBILITY HELPERS
 *   - clearProblemSectionsLegacy()
 *   - displayExistingRecordsLegacy()
 * ==========================================
 */

// Global state for import modal
let currentSessionId = null;
let currentStep = 1;
let selectedFile = null;
let selectedAccount = null;
let selectedConnector = null;
let analysisResults = null;
let previewData = null;
let dataTypeAvailabilityMap = {};
let selectedDataTypeKey = 'account_reconciliation';
let currencyCacheByCode = null;
let tickersModalConfigPromise = null;
let activeSessionInfo = null;
let symbolMetadataCache = {};
const TICKER_REMARKS_EDITOR_ID = 'tickerRemarksRichText';
const ACTIVE_SESSION_STORAGE_KEY = 'tiktrack_import_user_data_session';
const ACTIVE_SESSION_SOURCE = 'import-user-data';
let importModalBootstrapInstance = null;
let problemTrackingSessionId = null;
let pendingAccountLinking = null;
let accountLinkingModalInstance = null;
const IMPORT_MODAL_ID = 'importUserDataModal';
const IMPORT_MODAL_TYPE = 'data-import';
let importNavigationInstanceId = null;
let pendingImportModalRestoreState = null;
const ACCOUNT_LINKING_MODAL_ID = 'accountLinkingModal';
const ACCOUNT_LINKING_MODAL_TYPE = 'account-linking';
let accountLinkingNavigationInstanceId = null;
let activeFileAccountNumber = null;
let linkedAccountInfo = null;
let accountOptionsCache = null;
let pendingOverwriteAccountId = null;
let filePrecheckState = {
    status: 'idle',
    message: ''
};
let activeFilePrecheckRequestId = 0;
let selectedCashflowTypes = {}; // Track selected cashflow types for import (default: all except dividend_accrual)

/**
 * Helper function to set element display using Bootstrap classes instead of inline styles
 * @param {HTMLElement} element - The element to update
 * @param {string} displayValue - The display value ('none', 'block', 'flex', 'inline-flex', etc.) or empty string to show
 */
function setElementDisplay(element, displayValue) {
    if (!element) return;
    
    // Remove all display-related classes
    element.classList.remove('d-none', 'd-block', 'd-flex', 'd-inline-flex', 'd-inline', 'd-inline-block');
    
    if (!displayValue || displayValue === 'none') {
        element.classList.add('d-none');
    } else if (displayValue === 'block') {
        element.classList.add('d-block');
    } else if (displayValue === 'flex' || displayValue === 'inline-flex') {
        element.classList.add('d-flex');
    } else if (displayValue === 'inline') {
        element.classList.add('d-inline');
    } else if (displayValue === 'inline-block') {
        element.classList.add('d-inline-block');
    } else {
        // For other values, use inline style as fallback
        element.style.display = displayValue;
    }
}

const IMPORT_DATA_TYPE_DEFINITIONS = {
    executions: {
        key: 'executions',
        label: 'ביצועי מסחר (Executions)',
        description: 'ייבוא רשומות ביצועי מסחר הכוללות תאריך, פעולה, כמות, מחיר ונתוני עמלות.',
        documentationAnchor: '#import-executions-pipeline',
        entityType: 'execution'
    },
    cashflows: {
        key: 'cashflows',
        label: 'תזרימי מזומנים (Cash Flows)',
        description: 'ייבוא והצלבת תזרימי מזומנים: הפקדות, משיכות, דיבידנדים, ריביות והחזרי מס אל מול נתוני המערכת.',
        documentationAnchor: '#import-cashflows-pipeline',
        entityType: 'cash_flow'
    },
    account_reconciliation: {
        key: 'account_reconciliation',
        label: 'בדיקת שיוך חשבון',
        description: 'אימות מלא של חשבון מסחר: מטבע בסיס, הרשאות, יתרות פתיחה וחיבורים פעילים לפני ייבוא.',
        documentationAnchor: '#account-reconciliation-pipeline',
        entityType: 'trading_account'
    },
    portfolio_positions: {
        key: 'portfolio_positions',
        label: 'השוואת פורטפוליו',
        description: 'דו״ח השוואת פוזיציות פתוחות, חשיפות מטבע ו-NAV מול חשבון המסחר שנבחר.',
        documentationAnchor: '#portfolio-reconciliation-pipeline',
        entityType: 'position'
    },
    taxes_and_fx: {
        key: 'taxes_and_fx',
        label: 'ריביות, מיסים והפרשי מטבע',
        description: 'דו״ח ריכוז ניכויי מס, עמלות ורכיבי תרגום מט״ח (כולל עסקאות Forex מהקובץ).',
        documentationAnchor: '#taxes-and-fx-pipeline',
        entityType: 'cash_flow'
    }
};
const ACTIVE_IMPORT_DATA_TYPES = new Set([
    'executions',
    'cashflows',
    'account_reconciliation',
    'portfolio_positions',
    'taxes_and_fx'
]);
const IMPORT_DATA_TYPE_ORDER = [
    'account_reconciliation',
    'executions',
    'cashflows',
    'portfolio_positions',
    'taxes_and_fx'
];

const PROBLEM_RESOLUTION_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Create an empty problem state object
 * 
 * Initializes all problem tracking Maps to empty state.
 * Used for resetting problem resolution state before new analysis.
 * 
 * @returns {Object} Empty problem state with Maps for each problem type
 * @property {Map} missingTickers - Missing ticker symbols
 * @property {Map} withinFileDuplicates - Duplicates within the file
 * @property {Map} existingRecords - Records that already exist in system
 * @property {Map} cashflowMissingAccounts - Missing accounts for cashflows
 * @property {Map} cashflowCurrencyIssues - Currency issues for cashflows
 * @property {Map} accountMissingAccounts - Missing accounts for account reconciliation
 * @property {Map} accountCurrencyMismatches - Currency mismatches for accounts
 * @property {Map} accountEntitlementWarnings - Entitlement warnings for accounts
 * @property {Map} accountMissingDocuments - Missing documents for accounts
 * 
 * @example
 * const problemState = createEmptyProblemState();
 * problemState.missingTickers.set('AAPL', { symbol: 'AAPL', count: 1 });
 */
function createEmptyProblemState() {
    return {
        missingTickers: new Map(),
        withinFileDuplicates: new Map(),
        existingRecords: new Map(),
        cashflowMissingAccounts: new Map(),
        cashflowCurrencyIssues: new Map(),
        accountMissingAccounts: new Map(),
        accountCurrencyMismatches: new Map(),
        accountEntitlementWarnings: new Map(),
        accountMissingDocuments: new Map()
    };
}

const problemResolutionState = {
    previous: createEmptyProblemState(),
    resolved: createEmptyProblemState()
};

function clearProblemTrackingState() {
    problemResolutionState.previous = createEmptyProblemState();
    problemResolutionState.resolved = createEmptyProblemState();
}

function getImportModalElement() {
    return document.getElementById(IMPORT_MODAL_ID);
}

function getSelectedAccountDisplayName() {
    if (linkedAccountInfo?.name) {
        return linkedAccountInfo.name;
    }
    if (activeSessionInfo?.accountName) {
        return activeSessionInfo.accountName;
    }
    return '';
}

function setLinkedAccountInfo(account) {
    if (account && (account.id || account.trading_account_id)) {
        linkedAccountInfo = {
            id: Number(account.id || account.trading_account_id),
            name: account.name || account.account_name || '',
            external_account_number: account.external_account_number || account.account_number || null
        };
        selectedAccount = linkedAccountInfo.id;
    } else {
        linkedAccountInfo = null;
        selectedAccount = null;
    }
    updateAccountDetectionSummary();
}

function updateAccountDetectionSummary(statusOverride) {
    const fileValueEl = document.getElementById('detectedFileAccountValue');
    const systemValueEl = document.getElementById('detectedSystemAccountValue');
    const statusValueEl = document.getElementById('detectedLinkingStatusValue');
    const badgeEl = document.getElementById('accountDetectionStatusBadge');
    const detectionCard = document.getElementById('accountDetectionCard');
    const manageLinkBtn = document.getElementById('openAccountLinkingBtn');

    const hasSessionContext = Boolean(currentSessionId || pendingAccountLinking || activeSessionInfo);
    if (detectionCard) {
        // Use Bootstrap classes instead of inline styles
        if (hasSessionContext) {
            detectionCard.classList.remove('d-none');
        } else {
            detectionCard.classList.add('d-none');
        }
    }
    if (manageLinkBtn) {
        // Use Bootstrap classes instead of inline styles
        if (hasSessionContext) {
            manageLinkBtn.classList.remove('d-none');
        } else {
            manageLinkBtn.classList.add('d-none');
        }
        manageLinkBtn.disabled = !hasSessionContext;
        manageLinkBtn.setAttribute('aria-disabled', hasSessionContext ? 'false' : 'true');
    }

    if (!hasSessionContext) {
        if (fileValueEl) {
            fileValueEl.textContent = 'ממתין לקובץ';
        }
        if (systemValueEl) {
            systemValueEl.textContent = 'טרם זוהה';
        }
        if (statusValueEl) {
            statusValueEl.textContent = 'ממתין לקובץ';
        }
        if (badgeEl) {
            badgeEl.dataset.status = 'unknown';
            badgeEl.textContent = 'ממתין לקובץ';
            badgeEl.classList.remove('bg-warning', 'bg-success');
            badgeEl.classList.add('bg-secondary');
        }
        return;
    }

    if (fileValueEl) {
        fileValueEl.textContent = statusOverride === 'missing_in_file'
            ? 'לא הופיע בקובץ'
            : getActiveFileAccountNumber() || 'ממתין לזיהוי';
    }

    if (systemValueEl) {
        // Display external_account_number (used for matching) instead of name to avoid confusion
        const recognizedAccount = pendingAccountLinking?.recognizedAccount || linkedAccountInfo;
        let displayValue = 'טרם זוהה';
        
        if (recognizedAccount) {
            // Prefer external_account_number (what we actually match against)
            if (recognizedAccount.external_account_number) {
                displayValue = recognizedAccount.external_account_number;
                // Optionally add name in parentheses for clarity
                if (recognizedAccount.name) {
                    displayValue = `${recognizedAccount.external_account_number} (${recognizedAccount.name})`;
                }
            } else if (recognizedAccount.name) {
                // Fallback to name if no external_account_number
                displayValue = recognizedAccount.name;
            }
        } else if (activeSessionInfo?.accountName) {
            // Fallback for active session
            displayValue = activeSessionInfo.accountName;
        }
        
        systemValueEl.textContent = displayValue;
    }

    const statusValue = statusOverride
        || pendingAccountLinking?.status
        || activeSessionInfo?.linkingStatus
        || (linkedAccountInfo ? 'confirmed' : 'unknown');
    const statusLabels = {
        linked: 'משויך ומוכן לניתוח',
        confirmed: 'משויך ומוכן לניתוח',
        pending_confirmation: 'ממתין לאישור',
        mismatch: 'נדרש לבחור חשבון מתאים',
        unlinked: 'נדרש שיוך',
        missing_in_file: 'חסר בקובץ',
        unknown: 'ממתין לקובץ'
    };

    if (statusValueEl) {
        statusValueEl.textContent = statusLabels[statusValue] || statusLabels.unknown;
    }

    if (badgeEl) {
        badgeEl.dataset.status = statusValue || 'unknown';
        badgeEl.textContent = statusLabels[statusValue] || statusLabels.unknown;
        badgeEl.classList.toggle('bg-warning', statusValue === 'mismatch' || statusValue === 'unlinked');
        badgeEl.classList.toggle('bg-success', statusValue === 'linked' || statusValue === 'confirmed');
        badgeEl.classList.toggle('bg-secondary', !statusValue || statusValue === 'unknown');
    }
}

function buildImportModalTitle() {
    const baseTitle = 'ייבוא נתונים';
    const accountLabel = getSelectedAccountDisplayName();
    if (accountLabel) {
        return `${baseTitle} – ${accountLabel}`;
    }
    return baseTitle;
}

function buildImportNavigationMetadata(overrides = {}) {
    const { metadata: metadataOverrides = {}, ...rest } = overrides || {};
    return {
        modalId: IMPORT_MODAL_ID,
        modalType: IMPORT_MODAL_TYPE,
        entityType: 'import_session',
        entityId: currentSessionId || activeSessionInfo?.sessionId || null,
        title: rest.title || buildImportModalTitle(),
        parentInstanceId: rest.parentInstanceId ?? null,
        sourceInfo: rest.sourceInfo ?? null,
        replaceActive: rest.replaceActive ?? false,
        allowDuplicateEntries: rest.allowDuplicateEntries ?? false,
        metadata: {
            step: currentStep,
            taskType: selectedDataTypeKey,
            sessionId: currentSessionId,
            accountId: selectedAccount,
            connector: selectedConnector,
            hasActiveSession: Boolean(currentSessionId),
            pendingAccountLinking: Boolean(pendingAccountLinking),
            ...metadataOverrides
        }
    };
}

async function registerImportModalNavigation(overrides = {}) {
    if (!window.ModalNavigationService?.registerModalOpen) {
        importNavigationInstanceId = null;
        return null;
    }
    const modalElement = getImportModalElement();
    if (!modalElement) {
        return null;
    }
    try {
        const metadata = buildImportNavigationMetadata(overrides);
        const entry = await window.ModalNavigationService.registerModalOpen(modalElement, metadata);
        importNavigationInstanceId = entry?.instanceId || null;
        return entry;
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to register modal navigation entry', { error: error?.message });
        return null;
    }
}

function buildImportNavigationUpdatePayload(overrides = {}) {
    const { metadata: metadataOverrides = {}, ...rest } = overrides || {};
    return {
        instanceId: rest.instanceId || importNavigationInstanceId || null,
        modalType: IMPORT_MODAL_TYPE,
        entityType: 'import_session',
        entityId: currentSessionId || activeSessionInfo?.sessionId || null,
        title: rest.title || buildImportModalTitle(),
        metadata: {
            step: currentStep,
            taskType: selectedDataTypeKey,
            sessionId: currentSessionId,
            accountId: selectedAccount,
            connector: selectedConnector,
            hasActiveSession: Boolean(currentSessionId),
            pendingAccountLinking: Boolean(pendingAccountLinking),
            ...metadataOverrides
        }
    };
}

function updateImportModalNavigation(overrides = {}) {
    if (!window.ModalNavigationService?.updateModalMetadata || !importNavigationInstanceId) {
        return;
    }
    const payload = buildImportNavigationUpdatePayload({
        ...overrides,
        instanceId: importNavigationInstanceId
    });
    window.ModalNavigationService.updateModalMetadata(IMPORT_MODAL_ID, payload);
}

function attachImportModalNavigationListeners(modalElement) {
    if (!modalElement || modalElement.dataset.navigationListenersAttached === 'true') {
        return;
    }
    modalElement.addEventListener('modal-navigation:restore', handleImportModalNavigationRestore);
    modalElement.dataset.navigationListenersAttached = 'true';
}

function handleImportModalNavigationRestore(event) {
    const detail = event?.detail;
    if (!detail || detail.stage !== 'before-show' || !detail.entry) {
        return;
    }
    pendingImportModalRestoreState = detail.entry;
    importNavigationInstanceId = detail.entry.instanceId || importNavigationInstanceId;
}

function applyImportModalRestoreState() {
    if (!pendingImportModalRestoreState) {
        return null;
    }
    const entry = pendingImportModalRestoreState;
    pendingImportModalRestoreState = null;
    const metadata = entry.metadata || {};
    
    if (metadata.sessionId) {
        currentSessionId = metadata.sessionId;
        window.currentSessionId = metadata.sessionId;
    }
    if (metadata.accountId) {
        setLinkedAccountInfo({
            id: metadata.accountId,
            name: metadata.accountName || activeSessionInfo?.accountName || ''
        });
    }
    if (metadata.connector) {
        selectedConnector = metadata.connector;
        const connectorSelect = getImportModalElement()?.querySelector('#connectorSelect');
        if (connectorSelect) {
            setSelectValue(connectorSelect, selectedConnector);
        }
    }
    if (metadata.taskType && IMPORT_DATA_TYPE_DEFINITIONS[metadata.taskType]) {
        selectedDataTypeKey = metadata.taskType;
    }
    const targetStep = Number(metadata.step);
    return Number.isNaN(targetStep) ? null : targetStep;
}

function setActiveFileAccountNumber(value) {
    activeFileAccountNumber = value || null;
    const brokerValueEl = document.getElementById('activeSessionBrokerAccountValue');
    if (brokerValueEl) {
        brokerValueEl.textContent = activeFileAccountNumber || 'לא זמין';
    }
    updateAccountDetectionSummary();
}

const FILE_PRECHECK_STATUS_LABELS = {
    idle: 'ממתין לקובץ',
    pending: 'בודק קובץ',
    success: 'קובץ תקין',
    error: 'קובץ לא תקין'
};

const FILE_PRECHECK_STATUS_MESSAGES = {
    idle: 'בחר קובץ לבדיקה ראשונית.',
    pending: 'מבצע בדיקת מבנה בסיסית לקובץ...',
    success: 'הקובץ עבר בדיקה ראשונית בהצלחה וניתן להמשיך לניתוח.',
    error: 'בדיקת הקובץ נכשלה. אנא בדוק את הקובץ ונסה שוב.'
};

const FILE_PRECHECK_BADGE_VARIANTS = {
    idle: 'bg-secondary',
    pending: 'bg-info',
    success: 'bg-success',
    error: 'bg-danger'
};

function getFilePrecheckStatus() {
    return filePrecheckState.status;
}

function setFilePrecheckStatus(status, message) {
    filePrecheckState = {
        status: status || 'idle',
        message: message || FILE_PRECHECK_STATUS_MESSAGES[status] || FILE_PRECHECK_STATUS_MESSAGES.idle
    };

    const badgeEl = document.getElementById('filePrecheckStatusBadge');
    const textEl = document.getElementById('filePrecheckStatusText');
    const statusKey = filePrecheckState.status;

    if (badgeEl) {
        const variantClass = FILE_PRECHECK_BADGE_VARIANTS[statusKey] || FILE_PRECHECK_BADGE_VARIANTS.idle;
        badgeEl.dataset.status = statusKey;
        badgeEl.className = `badge ${variantClass}`;
        badgeEl.textContent = FILE_PRECHECK_STATUS_LABELS[statusKey] || FILE_PRECHECK_STATUS_LABELS.idle;
    }

    if (textEl) {
        textEl.textContent = filePrecheckState.message;
    }

    updateAnalyzeButton();
}

function getSelectedConnectorValue() {
    if (selectedConnector) {
        return selectedConnector;
    }
    const modal = getImportModalElement();
    const connectorSelect = modal?.querySelector('#connectorSelect') || document.getElementById('connectorSelect');
    return connectorSelect?.value || '';
}

function getSelectedDataTypeValue() {
    const select = document.getElementById('importDataTypeSelect');
    return select?.value || selectedDataTypeKey || '';
}

function triggerFilePrecheckIfReady(options = {}) {
    const { file: explicitFile = null } = options;
    const currentFile = explicitFile || selectedFile || window.selectedFile || null;
    
    // Strict validation: file must be a File object, not just truthy
    const isValidFile = currentFile instanceof File && currentFile.size > 0;
    if (!isValidFile) {
        activeFilePrecheckRequestId += 1;
        setFilePrecheckStatus('idle', FILE_PRECHECK_STATUS_MESSAGES.idle);
        return;
    }

    const connectorValue = getSelectedConnectorValue();
    if (!connectorValue) {
        activeFilePrecheckRequestId += 1;
        setFilePrecheckStatus('idle', 'בחר ספק נתונים כדי להריץ בדיקה ראשונית.');
        return;
    }

    runFilePrecheck(currentFile, connectorValue);
}

/**
 * Run file precheck validation
 * 
 * Validates file structure and content before analysis. Checks that file is valid
 * File object with size > 0, then sends to backend for format validation.
 * 
 * @param {File} file - File object to validate
 * @param {string|null} [connectorValueOverride=null] - Override connector value (optional)
 * @returns {Promise<void>}
 * 
 * @throws {Error} If file is invalid or precheck fails
 * 
 * @example
 * // Basic precheck
 * const fileInput = document.getElementById('fileInput');
 * await runFilePrecheck(fileInput.files[0]);
 * 
 * @example
 * // Precheck with connector override
 * await runFilePrecheck(file, 'IBKR');
 * 
 * @see {@link triggerFilePrecheckIfReady} For automatic precheck triggering
 * @see {@link setFilePrecheckStatus} For updating precheck status
 * 
 * @since 2.0.0
 * @updated January 2025 - Added strict file validation (instanceof File, size > 0)
 */
async function runFilePrecheck(file, connectorValueOverride = null) {
    const connectorValue = connectorValueOverride || getSelectedConnectorValue();
    
    // Strict validation: file must be a File object, not just truthy
    const isValidFile = file instanceof File && file.size > 0;
    if (!isValidFile || !connectorValue) {
        if (!isValidFile) {
            setFilePrecheckStatus('idle', 'בחר קובץ כדי להריץ בדיקה ראשונית.');
        } else {
            setFilePrecheckStatus('idle', 'בחר ספק נתונים וקובץ כדי להריץ בדיקה ראשונית.');
        }
        return;
    }

    const requestId = ++activeFilePrecheckRequestId;
    setFilePrecheckStatus('pending', FILE_PRECHECK_STATUS_MESSAGES.pending);

    try {
        const dataTypeValue = getSelectedDataTypeValue() || 'executions';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('connector_type', connectorValue);
        if (dataTypeValue) {
            formData.append('task_type', dataTypeValue);
        }

        const response = await fetch('/api/user-data-import/precheck', {
            method: 'POST',
            body: formData
        });
        const payload = await response.json().catch(() => ({}));

        if (requestId !== activeFilePrecheckRequestId) {
            return;
        }

        if (response.ok && (payload.success || payload.status === 'success')) {
            const successMessage = payload.message || FILE_PRECHECK_STATUS_MESSAGES.success;
            setFilePrecheckStatus('success', successMessage);
            if (Array.isArray(payload.warnings) && payload.warnings.length) {
                showImportUserDataNotification(payload.warnings.join('\n'), 'warning');
            }
            return;
        }

        const errorMessage = getApiErrorMessage(payload, payload?.errors?.[0] || 'בדיקת הקובץ נכשלה');
        setFilePrecheckStatus('error', errorMessage);
        showImportUserDataNotification(errorMessage, 'error');
    } catch (error) {
        if (requestId !== activeFilePrecheckRequestId) {
            return;
        }
        window.Logger?.error('[Import Modal] File precheck failed', { error: error?.message, page: 'import-user-data' });
        setFilePrecheckStatus('error', FILE_PRECHECK_STATUS_MESSAGES.error);
        showImportUserDataNotification(FILE_PRECHECK_STATUS_MESSAGES.error, 'error');
    }
}

function getActiveFileAccountNumber() {
    return (
        activeFileAccountNumber
        || activeSessionInfo?.fileAccountNumber
        || pendingAccountLinking?.fileAccountNumber
        || null
    );
}

function isAccountSelectionLocked() {
    return Boolean(currentSessionId && (activeSessionInfo?.accountId || linkedAccountInfo?.id));
}

function syncAccountAndConnectorLockState() {
    const modal = document.getElementById('importUserDataModal');
    if (!modal) {
        updateAccountDetectionSummary();
        return;
    }
    const connectorSelect = modal.querySelector('#connectorSelect');
    // Lock provider selection only when a real session flow is in progress:
    // - an existing active session AND one of: file loaded, pending account-linking, or analysis results
    // This keeps the provider selectable for a fresh upload even if an old session exists in storage.
    const lockConnector = Boolean(
        currentSessionId && (selectedFile || pendingAccountLinking || analysisResults)
    );
    if (connectorSelect) {
        connectorSelect.disabled = lockConnector;
        connectorSelect.setAttribute('aria-disabled', lockConnector ? 'true' : 'false');
        if (lockConnector && activeSessionInfo?.connector) {
            setSelectValue(connectorSelect, activeSessionInfo.connector);
        }
    }
    updateAccountDetectionSummary();
}

function enforceLockedAccountSelection(target) {
    if (target && activeSessionInfo?.accountId) {
        setSelectValue(target, String(activeSessionInfo.accountId));
    }
    const brokerNumber = getActiveFileAccountNumber();
    const lockedAccountName = activeSessionInfo?.accountName || '';
    const messageParts = [];
    messageParts.push('סשן הייבוא הנוכחי נעול לחשבון שנבחר בתחילת התהליך.');
    if (lockedAccountName) {
        messageParts.push(`חשבון: ${escapeHtml(lockedAccountName)}`);
    }
    if (brokerNumber) {
        messageParts.push(`מספר ברוקר: ${escapeHtml(String(brokerNumber))}`);
    }
    messageParts.push('כדי לבחור חשבון אחר, איפוס את הסשן.');
    showImportUserDataNotification(messageParts.join(' '), 'warning');
}

function getAccountLinkingModalElement() {
    return document.getElementById(ACCOUNT_LINKING_MODAL_ID);
}

function buildAccountLinkingModalTitle(linkInfo = pendingAccountLinking) {
    const baseTitle = 'שיוך חשבון למס\' ברוקר';
    const accountId =
        linkInfo?.tradingAccountId
        || selectedAccount
        || activeSessionInfo?.accountId
        || null;
    if (accountId) {
        return `${baseTitle} – חשבון ${accountId}`;
    }
    return baseTitle;
}

function buildAccountLinkingNavigationMetadata(overrides = {}) {
    const { metadata: metadataOverrides = {}, ...rest } = overrides || {};
    const linkInfo = rest.linkInfo || pendingAccountLinking || {};
    const tradingAccountId =
        linkInfo.tradingAccountId
        || selectedAccount
        || activeSessionInfo?.accountId
        || null;
    const sessionIdValue = linkInfo.sessionId || currentSessionId || null;
    return {
        modalId: ACCOUNT_LINKING_MODAL_ID,
        modalType: ACCOUNT_LINKING_MODAL_TYPE,
        entityType: linkInfo.fileAccountNumber ? 'external_account_link' : 'trading_account',
        entityId: tradingAccountId || sessionIdValue,
        title: rest.title || buildAccountLinkingModalTitle(linkInfo),
        parentInstanceId: rest.parentInstanceId ?? importNavigationInstanceId ?? null,
        sourceInfo:
            rest.sourceInfo
            ?? (importNavigationInstanceId
                ? {
                    modalId: IMPORT_MODAL_ID,
                    instanceId: importNavigationInstanceId
                }
                : null),
        replaceActive: rest.replaceActive ?? false,
        metadata: {
            sessionId: sessionIdValue,
            tradingAccountId,
            fileAccountNumber: linkInfo.fileAccountNumber || null,
            currentAccountNumber: linkInfo.currentAccountNumber || null,
            status: linkInfo.status || 'unlinked',
            message: linkInfo.message || '',
            taskType: linkInfo.taskType || selectedDataTypeKey || 'executions',
            ...metadataOverrides
        }
    };
}

function buildAccountLinkingNavigationUpdatePayload(overrides = {}) {
    const metadata = buildAccountLinkingNavigationMetadata(overrides);
    return {
        ...metadata,
        instanceId: overrides.instanceId || accountLinkingNavigationInstanceId || null
    };
}

async function registerAccountLinkingModalNavigation(overrides = {}) {
    if (!window.ModalNavigationService?.registerModalOpen) {
        accountLinkingNavigationInstanceId = null;
        return null;
    }
    if (accountLinkingNavigationInstanceId) {
        updateAccountLinkingNavigation(overrides);
        return null;
    }
    const modalElement = getAccountLinkingModalElement();
    if (!modalElement) {
        return null;
    }
    try {
        const metadata = buildAccountLinkingNavigationMetadata(overrides);
        const entry = await window.ModalNavigationService.registerModalOpen(modalElement, metadata);
        accountLinkingNavigationInstanceId = entry?.instanceId || accountLinkingNavigationInstanceId;
        return entry;
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to register account linking modal', { error: error?.message });
        return null;
    }
}

function updateAccountLinkingNavigation(overrides = {}) {
    if (!window.ModalNavigationService?.updateModalMetadata || !accountLinkingNavigationInstanceId) {
        return;
    }
    const payload = buildAccountLinkingNavigationUpdatePayload({
        ...overrides,
        instanceId: accountLinkingNavigationInstanceId
    });
    window.ModalNavigationService.updateModalMetadata(ACCOUNT_LINKING_MODAL_ID, payload);
}

function attachAccountLinkingNavigationListeners(modalElement) {
    if (!modalElement || modalElement.dataset.accountLinkingNavAttached === 'true') {
        return;
    }
    modalElement.addEventListener('modal-navigation:restore', handleAccountLinkingModalNavigationRestore);
    modalElement.addEventListener('hidden.bs.modal', () => {
        accountLinkingNavigationInstanceId = null;
    });
    modalElement.dataset.accountLinkingNavAttached = 'true';
}

function handleAccountLinkingModalNavigationRestore(event) {
    const detail = event?.detail;
    if (!detail || detail.stage !== 'before-show' || !detail.entry) {
        return;
    }
    const metadata = detail.entry.metadata || {};
    pendingAccountLinking = {
        sessionId: metadata.sessionId || pendingAccountLinking?.sessionId || currentSessionId || null,
        tradingAccountId: metadata.tradingAccountId || pendingAccountLinking?.tradingAccountId || selectedAccount || null,
        fileAccountNumber: metadata.fileAccountNumber || pendingAccountLinking?.fileAccountNumber || null,
        currentAccountNumber: metadata.currentAccountNumber || pendingAccountLinking?.currentAccountNumber || null,
        status: metadata.status || pendingAccountLinking?.status || 'unlinked',
        message: metadata.message || pendingAccountLinking?.message || '',
        taskType: metadata.taskType || pendingAccountLinking?.taskType || selectedDataTypeKey || 'executions'
    };
    accountLinkingNavigationInstanceId = detail.entry.instanceId || accountLinkingNavigationInstanceId;
    updateAccountLinkingModalContent(pendingAccountLinking);
}

function normalizeProblemTicker(value) {
    if (!value) {
        return null;
    }
    if (typeof value === 'string') {
        return value.trim().toUpperCase();
    }
    if (typeof value === 'object') {
        const symbol = value.symbol || value.ticker || value.display_symbol || value.code;
        return symbol ? String(symbol).trim().toUpperCase() : null;
    }
    return null;
}

function isAccountLinkingRequiredResponse(data) {
    return Boolean(data && data.error_code === 'ACCOUNT_LINK_REQUIRED');
}

function handleAccountLinkingBlockingResponse(data, contextLabel = '') {
    if (!isAccountLinkingRequiredResponse(data)) {
        return false;
    }
    if (contextLabel && window.Logger?.warn) {
        window.Logger.warn(`[Import Modal] Account linking required (${contextLabel})`, { data, page: 'import-user-data' });
    }
    
    // IMPORTANT: Update currentSessionId from response before processing
    const sessionId = data?.session_id || data?.linking?.session_id;
    if (sessionId) {
        currentSessionId = sessionId;
        window.currentSessionId = sessionId;
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Updated currentSessionId from response', {
            sessionId: sessionId,
            contextLabel: contextLabel,
            page: 'import-user-data'
        });
    }
    
    const linkingDetails = data?.linking || data?.account_linking_details || {};
    const detectedNumber = linkingDetails.file_account_number || linkingDetails.file_value;
    if (detectedNumber) {
        setActiveFileAccountNumber(detectedNumber);
    }
    handleAccountLinkRequired(data);
    return true;
}

function handleAccountLinkRequired(response) {
    const linking = response?.linking || {};
    currentSessionId = response?.session_id || linking.session_id || currentSessionId;
    if (currentSessionId) {
        window.currentSessionId = currentSessionId;
    }
    
    // IMPORTANT: Ensure we have a valid sessionId before creating pendingAccountLinking
    const sessionId = linking.session_id || response?.session_id || currentSessionId;
    if (!sessionId) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ Cannot create pendingAccountLinking - no sessionId available', {
            response: response,
            linking: linking,
            currentSessionId: currentSessionId,
            page: 'import-user-data'
        });
        showImportUserDataNotification('שגיאה: לא נמצא מספר סשן. נא לנסות שוב.', 'error');
        return;
    }
    
    pendingAccountLinking = {
        sessionId: sessionId,
        tradingAccountId: linking.trading_account_id || selectedAccount || null,
        fileAccountNumber: linking.file_account_number
            || response?.file_account_number
            || response?.account_linking_details?.file_value
            || null,
        currentAccountNumber: linking.current_account_number
            || response?.account_linking_details?.system_value
            || null,
        status: linking.status || 'unlinked',
        message: response?.error || 'נדרש לקשר את חשבון המסחר למספר החשבון בקובץ לפני המשך הייבוא.',
        taskType: selectedDataTypeKey || analysisResults?.task_type || 'executions',
        requiresConfirmation: Boolean(linking.requires_confirmation),
        recognizedAccount: linking.recognized_account || null,
        matchedAccountId: linking.matched_account_id || null
    };
    if (currentSessionId) {
        updateActiveSessionInfo({
            status: 'ממתין לאישור שיוך',
            accountId: pendingAccountLinking.recognizedAccount?.id || pendingAccountLinking.tradingAccountId || activeSessionInfo?.accountId || null,
            accountName: pendingAccountLinking.recognizedAccount?.name || activeSessionInfo?.accountName || '',
            fileAccountNumber: pendingAccountLinking.fileAccountNumber || null,
            linkingStatus: pendingAccountLinking.status
        });
    }
    updateAccountDetectionSummary(linking.status);
    updateAccountLinkingModalContent();
    showAccountLinkingModal();
    // Determine notification type based on status
    let notificationType = 'error';
    if (pendingAccountLinking.status === 'mismatch') {
        notificationType = 'warning';
    } else if (pendingAccountLinking.status === 'pending_confirmation' || pendingAccountLinking.requiresConfirmation) {
        // Info notification for account detection that requires confirmation
        notificationType = 'info';
    }
    showImportUserDataNotification(pendingAccountLinking.message, notificationType);
    updateImportModalNavigation();
    syncAccountAndConnectorLockState();
}

function updateAccountLinkingModalContent(linkInfo = pendingAccountLinking) {
    const statusBadge = document.getElementById('accountLinkingStatusBadge');
    const fileAccountEl = document.getElementById('accountLinkingFileAccount');
    const messageEl = document.getElementById('accountLinkingMessage');
    const recognizedSection = document.getElementById('accountLinkingRecognizedSection');
    const recognizedLabel = document.getElementById('accountLinkingRecognizedAccount');
    const recognizedActions = document.getElementById('accountLinkingRecognizedActions');
    const selectionSection = document.getElementById('accountLinkingSelectionSection');
    const selectionActions = document.getElementById('accountLinkingSelectionActions');

    if (!linkInfo) {
        if (messageEl) {
            messageEl.textContent = 'לא זוהתה בעיית שיוך חשבון.';
        }
        if (recognizedSection) {
            recognizedSection.classList.add('d-none');
        }
        if (selectionSection) {
            selectionSection.classList.add('d-none');
        }
        return;
    }

    const statusLabels = {
        unlinked: 'חשבון לא משויך',
        mismatch: 'מספר חשבון שגוי',
        missing_in_file: 'חסר בקובץ',
        missing_account: 'חשבון לא נמצא',
        pending_confirmation: 'ממתין לאישור',
        linked: 'משויך ומוכן',
        confirmed: 'משויך ומוכן'
    };

    const statusValue = linkInfo.status || 'unlinked';

    if (statusBadge) {
        statusBadge.textContent = statusLabels[statusValue] || 'שיוך נדרש';
        statusBadge.dataset.status = statusValue;
    }

    if (fileAccountEl) {
        fileAccountEl.textContent = linkInfo.fileAccountNumber || 'לא זמין בקובץ';
    }

    if (messageEl && linkInfo.message) {
        messageEl.textContent = linkInfo.message;
    }

    const shouldShowRecognized = Boolean(
        linkInfo.recognizedAccount
        || linkInfo.requiresConfirmation
        || statusValue === 'pending_confirmation'
    );
    const shouldShowSelection = !shouldShowRecognized
        || statusValue === 'unlinked'
        || statusValue === 'mismatch'
        || statusValue === 'missing_account';

    if (recognizedSection) {
        recognizedSection.classList.toggle('d-none', !shouldShowRecognized);
        if (shouldShowRecognized && recognizedLabel) {
            const recognizedAccount = linkInfo.recognizedAccount;
            if (recognizedAccount) {
                // Display external_account_number first (what we match against), then name
                const parts = [];
                if (recognizedAccount.external_account_number) {
                    parts.push(recognizedAccount.external_account_number);
                }
                if (recognizedAccount.name) {
                    parts.push(recognizedAccount.name);
                }
                recognizedLabel.textContent = parts.length > 0 
                    ? parts.join(' - ')
                    : 'לא זוהה חשבון תואם';
            } else {
                recognizedLabel.textContent = 'לא זוהה חשבון תואם';
            }
        }
        if (recognizedActions) {
            recognizedActions.classList.toggle('d-none', !shouldShowRecognized);
        }
        
        // Show/hide confirm button in footer (moved from recognizedActions)
        const confirmBtn = document.getElementById('accountLinkingConfirmBtn');
        if (confirmBtn) {
            setElementDisplay(confirmBtn, shouldShowRecognized ? '' : 'none');
        }
    }

    if (selectionSection) {
        selectionSection.classList.toggle('d-none', !shouldShowSelection);
        if (shouldShowSelection) {
            prepareAccountLinkingSelection();
        }
        if (selectionActions) {
            selectionActions.classList.toggle('d-none', !shouldShowSelection);
        }
    }

    updateAccountLinkingNavigation();
}

async function prepareAccountLinkingSelection() {
    const select = document.getElementById('accountLinkingAccountSelect');
    if (!select) {
        return;
    }
    await loadAccountsForLinking(select);
    const preferredAccountId = pendingAccountLinking?.tradingAccountId
        || linkedAccountInfo?.id
        || activeSessionInfo?.accountId
        || null;
    if (preferredAccountId) {
        setSelectValue(select, String(preferredAccountId));
    } else {
        select.value = '';
    }
    select.removeEventListener('change', handleAccountLinkingSelectionChange);
    select.addEventListener('change', handleAccountLinkingSelectionChange);
    handleAccountLinkingSelectionChange();
}

async function loadAccountsForLinking(targetSelect) {
    if (!targetSelect) {
        return;
    }
    if (!accountOptionsCache) {
        try {
            const response = await fetch('/api/trading-accounts/');
            const payload = await response.json();
            const accounts = Array.isArray(payload?.data) ? payload.data : (payload || []);
            accountOptionsCache = accounts.filter((account) => account.status === 'open' || account.status === 'OPEN');
        } catch (error) {
            window.Logger?.error('[Import Modal] Failed to load accounts for linking', { error, page: 'import-user-data' });
            accountOptionsCache = [];
        }
    }
    targetSelect.innerHTML = '<option value="">בחר חשבון מסחר...</option>';
    accountOptionsCache.forEach((account) => {
        const option = document.createElement('option');
        option.value = account.id;
        // Display external_account_number first (what we match against), then name
        let displayText = '';
        if (account.external_account_number) {
            displayText = account.external_account_number;
            if (account.name) {
                displayText += ` - ${account.name}`;
            }
        } else {
            displayText = account.name || `חשבון #${account.id}`;
        }
        option.textContent = displayText;
        if (account.external_account_number) {
            option.dataset.externalAccountNumber = account.external_account_number;
        }
        targetSelect.appendChild(option);
    });
}

function handleAccountLinkingSelectionChange() {
    const select = document.getElementById('accountLinkingAccountSelect');
    const warning = document.getElementById('accountLinkingOverwriteWarning');
    if (!select || !warning) {
        return;
    }
    const selectedOption = select.selectedOptions?.[0];
    const existingNumber = selectedOption?.dataset?.externalAccountNumber;
    if (existingNumber && existingNumber !== (pendingAccountLinking?.fileAccountNumber || activeFileAccountNumber)) {
        warning.textContent = `לחשבון זה קיים כבר מספר ${existingNumber}. לחיצה נוספת תאשר החלפת המספר.`;
        warning.classList.remove('d-none');
    } else {
        warning.classList.add('d-none');
        warning.textContent = '';
        pendingOverwriteAccountId = null;
    }
}

function showAccountLinkingSelection() {
    const recognizedSection = document.getElementById('accountLinkingRecognizedSection');
    const selectionSection = document.getElementById('accountLinkingSelectionSection');
    const selectionActions = document.getElementById('accountLinkingSelectionActions');
    if (recognizedSection) {
        recognizedSection.classList.add('d-none');
    }
    if (selectionSection) {
        selectionSection.classList.remove('d-none');
        prepareAccountLinkingSelection();
    }
    if (selectionActions) {
        selectionActions.classList.remove('d-none');
    }
}

async function confirmAutoLinkedAccount() {
    if (!pendingAccountLinking?.sessionId) {
        showImportUserDataNotification('לא נמצא סשן לשיוך חשבון.', 'error');
        return;
    }
    setAccountLinkingLoading(true);
    const reanalysisTask = pendingAccountLinking?.taskType || selectedDataTypeKey || 'executions';
    try {
        if (!pendingAccountLinking || !pendingAccountLinking.sessionId) {
            window.Logger?.error('[ACCOUNT_LINKING] ❌ Cannot confirm - no sessionId available', { page: 'import-user-data' });
            showImportUserDataNotification('שגיאה: לא נמצא מספר סשן. נא לנסות שוב.', 'error');
            return;
        }
        const response = await fetch(`/api/user-data-import/session/${pendingAccountLinking.sessionId}/account-link/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            const message = getApiErrorMessage(data, 'אישור החשבון נכשל');
            showImportUserDataNotification(message, 'error');
            return;
        }
        setLinkedAccountInfo(data.linked_account);
        setActiveFileAccountNumber(data.file_account_number || pendingAccountLinking?.fileAccountNumber || null);
        updateActiveSessionInfo({
            accountId: data.linked_account?.id || pendingAccountLinking?.tradingAccountId || selectedAccount,
            accountName: data.linked_account?.name || activeSessionInfo?.accountName || '',
            externalAccountNumber: data.file_account_number || data.linked_account?.external_account_number || null,
            fileAccountNumber: data.file_account_number || pendingAccountLinking?.fileAccountNumber || null,
            linkingStatus: 'confirmed',
            status: 'שיוך אושר'
        });
        pendingAccountLinking = null;
        updateImportModalNavigation();
        hideAccountLinkingModal();
        showImportUserDataNotification('החשבון אושר. מפעיל מחדש את תהליך הניתוח.', 'success');
        await resumeImportFlowAfterLinking(reanalysisTask);
    } catch (error) {
        window.Logger?.error('[Import Modal] Failed to confirm linked account', { error: error.message });
        showImportUserDataNotification('שגיאה באישור החשבון', 'error');
    } finally {
        setAccountLinkingLoading(false);
    }
}

/**
 * Submit account link selection to backend
 * 
 * Handles the complete account linking flow:
 * 1. Validates selection and checks for overwrite requirements
 * 2. Sends link request to backend
 * 3. Updates local state with linked account info
 * 4. Reloads session data to get updated account information
 * 5. Resumes import flow after successful linking
 * 
 * @param {boolean} [forceOverride=false] - Whether to force overwrite existing link
 * @returns {Promise<void>}
 * 
 * @throws {Error} If account linking fails or API request fails
 * 
 * @example
 * // Basic account link
 * await submitAccountLinkSelection();
 * 
 * @example
 * // Force overwrite existing link
 * await submitAccountLinkSelection(true);
 * 
 * @see {@link resumeImportFlowAfterLinking} For continuing import after linking
 * @see {@link fetchExistingSessionDetails} For reloading session data
 * 
 * @since 2.0.0
 * @updated January 2025 - Added automatic old link removal and session reload
 */
async function submitAccountLinkSelection(forceOverride = false) {
    window.Logger?.info('[ACCOUNT_LINKING] 🔗 Starting account link selection process', {
        sessionId: pendingAccountLinking?.sessionId,
        forceOverride,
        page: 'import-user-data'
    });
    
    if (!pendingAccountLinking || !pendingAccountLinking.sessionId) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ No session ID found', { 
            pendingAccountLinking: pendingAccountLinking,
            sessionId: pendingAccountLinking?.sessionId,
            currentSessionId: currentSessionId,
            page: 'import-user-data' 
        });
        showImportUserDataNotification('לא נמצא סשן לשיוך חשבון.', 'error');
        return;
    }
    const select = document.getElementById('accountLinkingAccountSelect');
    if (!select || !select.value) {
        window.Logger?.warn('[ACCOUNT_LINKING] ⚠️ No account selected', { page: 'import-user-data' });
        showImportUserDataNotification('אנא בחר חשבון לשיוך.', 'warning');
        return;
    }
    const selectedValue = select.value;
    const selectedOption = select.options[select.selectedIndex];
    const selectedAccountName = selectedOption?.textContent || `Account ${selectedValue}`;
    const confirmOverwrite = forceOverride || pendingOverwriteAccountId === selectedValue;
    const reanalysisTask = pendingAccountLinking?.taskType || selectedDataTypeKey || 'executions';

    // IMPORTANT: Double-check sessionId before making API call
    if (!pendingAccountLinking || !pendingAccountLinking.sessionId) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ Cannot select account - no sessionId available', { page: 'import-user-data' });
        showImportUserDataNotification('שגיאה: לא נמצא מספר סשן. נא לנסות שוב.', 'error');
        return;
    }
    
    window.Logger?.info('[ACCOUNT_LINKING] 📋 Account selection details', {
        selectedAccountId: selectedValue,
        selectedAccountName,
        confirmOverwrite,
        fileAccountNumber: pendingAccountLinking?.fileAccountNumber,
        sessionId: pendingAccountLinking.sessionId,
        page: 'import-user-data'
    });

    setAccountLinkingLoading(true);
    try {
        window.Logger?.info('[ACCOUNT_LINKING] 📤 Sending account link request to server', {
            sessionId: pendingAccountLinking.sessionId,
            tradingAccountId: Number(selectedValue),
            confirmOverwrite,
            page: 'import-user-data'
        });
        
        const response = await fetch(`/api/user-data-import/session/${pendingAccountLinking.sessionId}/account-link/select`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                trading_account_id: Number(selectedValue),
                confirm_overwrite: confirmOverwrite
            })
        });
        
        window.Logger?.info('[ACCOUNT_LINKING] 📥 Received response from server', {
            status: response.status,
            ok: response.ok,
            page: 'import-user-data'
        });
        
        const data = await response.json();
        
        window.Logger?.info('[ACCOUNT_LINKING] 📊 Response data', {
            success: data.success,
            error: data.error,
            error_code: data.error_code,
            linked_account_number: data.linked_account_number,
            trading_account_id: data.trading_account_id,
            page: 'import-user-data'
        });
        
        if (!response.ok || !data.success) {
            if (data.error_code === 'ACCOUNT_LINK_OVERWRITE_REQUIRED') {
                window.Logger?.warn('[ACCOUNT_LINKING] ⚠️ Overwrite required', { page: 'import-user-data' });
                pendingOverwriteAccountId = selectedValue;
                showImportUserDataNotification(
                    data.error || 'לחשבון זה קיים כבר מספר חיצוני. לחץ שוב כדי לאשר החלפה.',
                    'warning'
                );
                return;
            }
            // Note: ACCOUNT_ALREADY_LINKED is now handled automatically by the backend
            // The backend removes the old link and creates a new one, so this error should not occur
            if (data.error_code === 'ACCOUNT_ALREADY_LINKED') {
                window.Logger?.error('[ACCOUNT_LINKING] ❌ ACCOUNT_ALREADY_LINKED error (should not happen)', {
                    error: data.error,
                    page: 'import-user-data'
                });
                // Fallback: if this error still occurs, show a generic error
                showImportUserDataNotification(
                    data.error || 'שגיאה בשיוך החשבון. נא לנסות שוב.',
                    'error'
                );
                return;
            }
            window.Logger?.error('[ACCOUNT_LINKING] ❌ Account linking failed', {
                error: data.error,
                error_code: data.error_code,
                page: 'import-user-data'
            });
            const message = getApiErrorMessage(data, 'שיוך החשבון נכשל');
            showImportUserDataNotification(message, 'error');
            return;
        }

        // STEP 1: Clear pending overwrite
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 1: Clearing pending overwrite', { page: 'import-user-data' });
        pendingOverwriteAccountId = null;
        
        // STEP 2: Update linked account info
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 2: Updating linked account info', {
            accountId: data.trading_account_id || data.linked_account?.id,
            accountName: data.linked_account?.name,
            externalAccountNumber: data.linked_account_number || data.linked_account?.external_account_number,
            page: 'import-user-data'
        });
        setLinkedAccountInfo(data.linked_account);
        setActiveFileAccountNumber(data.linked_account_number || pendingAccountLinking?.fileAccountNumber || null);
        
        // STEP 3: Update active session info
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 3: Updating active session info', { page: 'import-user-data' });
        updateActiveSessionInfo({
            accountId: data.trading_account_id || data.linked_account?.id || pendingAccountLinking?.tradingAccountId,
            accountName: data.linked_account?.name || activeSessionInfo?.accountName || '',
            externalAccountNumber: data.linked_account_number || data.linked_account?.external_account_number || null,
            fileAccountNumber: data.linked_account_number || pendingAccountLinking?.fileAccountNumber || null,
            linkingStatus: 'confirmed',
            status: 'שיוך אושר'
        });
        
        // STEP 4: Save session ID before clearing pending account linking
        // IMPORTANT: Check if pendingAccountLinking exists before accessing its properties
        if (!pendingAccountLinking || !pendingAccountLinking.sessionId) {
            window.Logger?.error('[ACCOUNT_LINKING] ❌ Cannot save session ID - pendingAccountLinking is null or missing sessionId', {
                pendingAccountLinking: pendingAccountLinking,
                currentSessionId: currentSessionId,
                page: 'import-user-data'
            });
            showImportUserDataNotification('שגיאה: לא נמצא מידע על הסשן לשיוך. נא לנסות שוב.', 'error');
            return;
        }
        const sessionIdForReload = pendingAccountLinking.sessionId;
        const fileAccountNumberForReload = pendingAccountLinking.fileAccountNumber;
        
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 4: Clearing pending account linking', { 
            sessionId: sessionIdForReload,
            page: 'import-user-data' 
        });
        pendingAccountLinking = null;
        
        // STEP 5: Update navigation
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 5: Updating import modal navigation', { page: 'import-user-data' });
        updateImportModalNavigation();
        
        // STEP 6: Close account linking modal
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 6: Closing account linking modal', { page: 'import-user-data' });
        hideAccountLinkingModal();
        
        // STEP 7: Show success notification
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 7: Showing success notification', { page: 'import-user-data' });
        showImportUserDataNotification('מספר החשבון שויך בהצלחה. מפעיל מחדש את תהליך הניתוח.', 'success');
        
        // STEP 8: Update currentSessionId before reloading
        if (sessionIdForReload) {
            currentSessionId = sessionIdForReload;
            window.currentSessionId = sessionIdForReload;
        }
        
        // STEP 9: Reload session data to get updated account information
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 9: Reloading session data to get updated account info', {
            sessionId: sessionIdForReload,
            page: 'import-user-data'
        });
        await fetchExistingSessionDetails(sessionIdForReload);
        
        // STEP 10: Resume import flow (reload session and update UI)
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 10: Resuming import flow after linking', {
            taskType: reanalysisTask,
            sessionId: currentSessionId,
            page: 'import-user-data'
        });
        await resumeImportFlowAfterLinking(reanalysisTask);
        
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Account linking process completed successfully', { page: 'import-user-data' });
    } catch (error) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ Exception during account linking', {
            error: error.message,
            stack: error.stack,
            page: 'import-user-data'
        });
        showImportUserDataNotification('שגיאה בשיוך החשבון', 'error');
    } finally {
        setAccountLinkingLoading(false);
        window.Logger?.info('[ACCOUNT_LINKING] 🔚 Account linking process finished', { page: 'import-user-data' });
    }
}

async function resumeImportFlowAfterLinking(taskType) {
    window.Logger?.info('[ACCOUNT_LINKING] 🔄 Starting resume import flow after linking', {
        taskType,
        currentSessionId,
        page: 'import-user-data'
    });
    
    // STEP 1: Sync account and connector lock state
    window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 1: Syncing account and connector lock state', { page: 'import-user-data' });
    syncAccountAndConnectorLockState();
    
    if (!currentSessionId) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ No active session ID found', { page: 'import-user-data' });
        showImportUserDataNotification('לא נמצא סשן פעיל להמשך הניתוח לאחר השיוך.', 'error');
        return;
    }
    
    // STEP 2: Reload session data (reanalyse)
    window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 2: Reloading session data (reanalyse)', {
        sessionId: currentSessionId,
        taskType,
        page: 'import-user-data'
    });
    await reanalyseSessionForTask(taskType, 'בודק את חשבון המסחר לאחר שיוך...');
    
    // STEP 3: Navigate to step 2 (preview)
    window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 3: Navigating to step 2 (preview)', { page: 'import-user-data' });
    goToStep(2);
    
    // STEP 4: Update account detection summary to show new linked account
    window.Logger?.info('[ACCOUNT_LINKING] ✅ Step 4: Updating account detection summary', { page: 'import-user-data' });
    updateAccountDetectionSummary('confirmed');
    
    window.Logger?.info('[ACCOUNT_LINKING] ✅ Resume import flow completed', { page: 'import-user-data' });
}

async function openAccountLinkingModalManually() {
    if (!currentSessionId) {
        showImportUserDataNotification('לא קיים סשן פעיל להצגת השיוך.', 'warning');
        return;
    }
    try {
        const response = await fetch(`/api/user-data-import/session/${currentSessionId}/account-link/status`);
        const data = await response.json();
        if (!response.ok || !data.success) {
            const message = getApiErrorMessage(data, 'לא ניתן היה לקבל את סטטוס השיוך');
            showImportUserDataNotification(message, 'error');
            return;
        }
        const linking = data.linking || {};
        pendingAccountLinking = {
            sessionId: linking.session_id || currentSessionId,
            tradingAccountId: linking.trading_account_id || linkedAccountInfo?.id || null,
            fileAccountNumber: linking.file_account_number || activeFileAccountNumber || null,
            currentAccountNumber: linking.current_account_number || null,
            status: linking.status || 'unlinked',
            message: data.message || pendingAccountLinking?.message || 'עדכן את שיוך החשבון לפני המשך התהליך.',
            taskType: selectedDataTypeKey || 'executions',
            requiresConfirmation: Boolean(linking.requires_confirmation),
            recognizedAccount: linking.recognized_account || null,
            matchedAccountId: linking.matched_account_id || null
        };
        updateAccountDetectionSummary(linking.status);
        updateAccountLinkingModalContent();
        showAccountLinkingModal();
    } catch (error) {
        window.Logger?.error('[Import Modal] Failed to load account link status', { error: error.message });
        showImportUserDataNotification('שגיאה בטעינת סטטוס השיוך.', 'error');
    }
}

async function linkExternalAccountToTradingAccount(forceOverride = false) {
    return submitAccountLinkSelection(forceOverride);
}

async function showAccountLinkingModal() {
    const modal = getAccountLinkingModalElement();
    if (!modal) {
        window.Logger?.error('[Import Modal] accountLinkingModal not found in DOM', { page: 'import-user-data' });
        return;
    }

    attachAccountLinkingNavigationListeners(modal);
    if (window.ModalNavigationService?.registerModalOpen) {
        await registerAccountLinkingModalNavigation();
    } else {
        accountLinkingNavigationInstanceId = null;
    }

    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        accountLinkingModalInstance = bootstrap.Modal.getInstance(modal);
        if (!accountLinkingModalInstance) {
            accountLinkingModalInstance = new bootstrap.Modal(modal, {
                backdrop: true,
                keyboard: true
            });
        }
        accountLinkingModalInstance.show();
    } else {
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }

    if (window.processButtons) {
        window.processButtons(modal);
    } else if (window.advancedButtonSystem?.processButtons) {
        window.advancedButtonSystem.processButtons(modal);
    }

    updateAccountLinkingModalContent();
}

function hideAccountLinkingModal(options = {}) {
    const modal = getAccountLinkingModalElement();
    if (!modal) {
        return;
    }
    const { skipNavigation = false } = options;

    const fallbackHide = () => {
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
            const instance = bootstrap.Modal.getInstance(modal) || accountLinkingModalInstance;
            instance?.hide();
        } else {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        accountLinkingNavigationInstanceId = null;
    };

    if (!skipNavigation && window.ModalNavigationService?.goBack && accountLinkingNavigationInstanceId) {
        window.ModalNavigationService.goBack().catch(() => fallbackHide());
        return;
    }

    fallbackHide();
}

function setAccountLinkingLoading(isLoading) {
    const selectionBtn = document.getElementById('accountLinkingActionBtn');
    const confirmBtn = document.getElementById('accountLinkingConfirmBtn');
    const closeButtons = [
        document.getElementById('accountLinkingCloseBtn')
    ];

    [selectionBtn, confirmBtn].forEach((button) => {
        if (!button) {
            return;
        }
        button.disabled = isLoading || button.dataset.disabled === 'true';
        button.setAttribute('aria-disabled', button.disabled ? 'true' : 'false');
        button.dataset.loading = isLoading ? 'true' : 'false';
    });

    closeButtons.forEach((button) => {
        if (!button) {
            return;
        }
        button.disabled = isLoading;
        button.setAttribute('aria-disabled', isLoading ? 'true' : 'false');
    });
}

async function linkExternalAccountToTradingAccount() {
    if (!pendingAccountLinking || !pendingAccountLinking.sessionId) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ Cannot link account - no sessionId available', { page: 'import-user-data' });
        showImportUserDataNotification('לא נמצא סשן לשיוך חשבון.', 'error');
        return;
    }
    if (!pendingAccountLinking.fileAccountNumber) {
        window.Logger?.warn('[ACCOUNT_LINKING] ⚠️ No file account number available', { page: 'import-user-data' });
        showImportUserDataNotification('לא נמצא מספר חשבון בקובץ לתיוג.', 'error');
        return;
    }

    setAccountLinkingLoading(true);
    try {
        const response = await fetch(`/api/user-data-import/session/${pendingAccountLinking.sessionId}/link-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_number: pendingAccountLinking.fileAccountNumber
            })
        });
        const data = await response.json();
        if (!response.ok || !(data.success || data.status === 'success')) {
            if (handleAccountLinkingBlockingResponse(data, 'link-account')) {
                return;
            }
            const message = getApiErrorMessage(data, 'שיוך החשבון נכשל');
            showImportUserDataNotification(message, 'error');
            return;
        }

        showImportUserDataNotification('מספר החשבון שויך בהצלחה. מריץ שוב את הניתוח.', 'success');
        const reanalysisTask = pendingAccountLinking?.taskType || selectedDataTypeKey || 'executions';
        const linkedFileAccount = data.linked_account_number || pendingAccountLinking?.fileAccountNumber || null;
        pendingAccountLinking = null;
        setActiveFileAccountNumber(linkedFileAccount);
        updateImportModalNavigation();
        syncAccountAndConnectorLockState();
        const shouldReanalyseExistingSession = !selectedFile && Boolean(currentSessionId);
        hideAccountLinkingModal();
        if (shouldReanalyseExistingSession) {
            await reanalyseSessionForTask(reanalysisTask, 'בודק את חשבון המסחר לאחר שיוך...');
            goToStep(2);
        } else {
            analyzeFile();
        }
    } catch (error) {
        window.Logger?.error('[Import Modal] Failed to link account', { error: error.message });
        showImportUserDataNotification('שגיאה בשיוך החשבון', 'error');
    } finally {
        setAccountLinkingLoading(false);
    }
}

function normalizeAccountIdentifier(account) {
    if (!account) {
        return null;
    }
    if (typeof account === 'string') {
        return account.trim();
    }
    const accountId = account.account_id
        || account.accountId
        || account.id
        || account.trading_account_id
        || account.account;
    if (accountId) {
        return String(accountId).trim();
    }
    const provider = account.provider || account.provider_name || account.connector;
    const name = account.name || account.label || account.description || '';
    const combined = [provider, name].filter(Boolean).join(':');
    if (combined) {
        return combined.trim();
    }
    try {
        return JSON.stringify(account);
    } catch (error) {
        return String(account);
    }
}

function buildGenericIdentifier(value, prefix) {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'string') {
        return `${prefix}:${value.trim()}`;
    }
    try {
        return `${prefix}:${JSON.stringify(value)}`;
    } catch (error) {
        return `${prefix}:${String(value)}`;
    }
}

function trackProblemStatus(problemKey, items, identifierFn, metadataFn) {
    if (problemTrackingSessionId !== currentSessionId) {
        clearProblemTrackingState();
        problemTrackingSessionId = currentSessionId;
    }

    const now = Date.now();
    const prevMap = problemResolutionState.previous[problemKey] || new Map();
    const resolvedMap = problemResolutionState.resolved[problemKey] || new Map();

    const currentMap = new Map();
    (items || []).forEach((item, index) => {
        const id = identifierFn(item, index);
        if (!id) {
            return;
        }
        const meta = metadataFn ? metadataFn(item, index) : { id, title: id };
        currentMap.set(id, { item, meta, index });
    });

    prevMap.forEach((entry, id) => {
        if (!currentMap.has(id)) {
            const meta = entry?.meta || entry;
            resolvedMap.set(id, {
                meta,
                resolvedAt: now
            });
        }
    });

    currentMap.forEach((entry, id) => {
        if (resolvedMap.has(id)) {
            resolvedMap.delete(id);
        }
    });

    resolvedMap.forEach((entry, id) => {
        if (now - entry.resolvedAt > PROBLEM_RESOLUTION_TTL) {
            resolvedMap.delete(id);
        }
    });

    problemResolutionState.previous[problemKey] = currentMap;
    problemResolutionState.resolved[problemKey] = resolvedMap;

    return {
        resolvedMetadata: Array.from(resolvedMap.values()).map(entry => entry.meta),
        unresolvedItems: Array.from(currentMap.values()).map(entry => ({
            item: entry.item,
            meta: entry.meta,
            index: entry.index
        })),
        currentMap
    };
}

if (typeof window !== 'undefined') {
    window.symbolMetadataCache = symbolMetadataCache;
}

let processingOverlayElement = null;
function showProcessingOverlay(message = 'טוען ומעבד נתונים...') {
    if (!processingOverlayElement) {
        processingOverlayElement = document.createElement('div');
        processingOverlayElement.id = 'importProcessingOverlay';
        const styles = [
            'position: fixed',
            'inset: 0',
            'background: rgba(0, 0, 0, 0.55)',
            'display: flex',
            'flex-direction: column',
            'align-items: center',
            'justify-content: center',
            'z-index: 9999',
            'gap: 1.5rem',
            'color: #fff'
        ];
        processingOverlayElement.style.cssText = styles.join('; ');

        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-light';
        spinner.setAttribute('role', 'status');
        spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';

        const messageEl = document.createElement('div');
        messageEl.className = 'processing-overlay-message';
        messageEl.style.fontSize = '1.1rem';
        messageEl.style.fontWeight = '600';
        messageEl.textContent = message;

        processingOverlayElement.appendChild(spinner);
        processingOverlayElement.appendChild(messageEl);
        document.body.appendChild(processingOverlayElement);
    } else {
        const messageEl = processingOverlayElement.querySelector('.processing-overlay-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        setElementDisplay(processingOverlayElement, 'flex');
    }
}

function hideProcessingOverlay() {
    if (processingOverlayElement) {
        setElementDisplay(processingOverlayElement, 'none');
    }
}

function setAnalysisLoadingState(isLoading, message = 'טוען ומעבד נתונים...', progress = null) {
    const indicator = document.getElementById('analysisLoadingIndicator');
    if (indicator) {
        // Use Bootstrap classes instead of inline styles
        if (isLoading) {
            indicator.classList.remove('d-none');
            indicator.classList.add('d-flex');
        } else {
            indicator.classList.remove('d-flex');
            indicator.classList.add('d-none');
        }
        const messageElement = indicator.querySelector('.analysis-loading-text');
        if (messageElement && message) {
            messageElement.textContent = message;
        }
        const progressBar = document.getElementById('analysisProgressBar');
        if (progressBar) {
            let percentValue = Number(progressBar.dataset.progressValue || 0);
            if (typeof progress === 'number' && !Number.isNaN(progress)) {
                percentValue = Math.max(0, Math.min(100, progress));
                progressBar.dataset.progressValue = String(percentValue);
            } else if (!isLoading) {
                percentValue = 0;
                progressBar.dataset.progressValue = '0';
            }
            progressBar.style.width = `${percentValue}%`;
            progressBar.setAttribute('aria-valuenow', percentValue);
            progressBar.classList.toggle('progress-bar-striped', isLoading);
            progressBar.classList.toggle('progress-bar-animated', isLoading);
        }
    }

    const analysisCards = document.querySelector('.analysis-cards');
    if (analysisCards) {
        analysisCards.style.opacity = isLoading ? '0.4' : '';
    }

    const dataTypeSelect = document.getElementById('importDataTypeSelect');
    if (dataTypeSelect) {
        if (currentStep >= 2) {
            dataTypeSelect.disabled = Boolean(isLoading);
        } else if (!isLoading) {
            dataTypeSelect.disabled = false;
        }
    }
}

function normaliseSymbolKey(symbol) {
    return typeof symbol === 'string'
        ? symbol.trim().toUpperCase()
        : '';
}

function clearSymbolMetadataCache() {
    symbolMetadataCache = {};
    if (typeof window !== 'undefined') {
        window.symbolMetadataCache = symbolMetadataCache;
    }
}

function updateSymbolMetadataCache(metadata) {
    if (!metadata) {
        return;
    }

    const assignEntry = (symbol, data) => {
        const key = normaliseSymbolKey(symbol);
        if (!key || !data || typeof data !== 'object') {
            return;
        }
        const existing = symbolMetadataCache[key] || {};
        symbolMetadataCache[key] = {
            ...existing,
            ...data
        };
    };

    if (Array.isArray(metadata)) {
        metadata.forEach((entry) => {
            if (!entry || typeof entry !== 'object') {
                return;
            }
            assignEntry(entry.symbol || entry.display_symbol, entry);
        });
        return;
    }

    if (typeof metadata === 'object') {
        Object.entries(metadata).forEach(([symbol, data]) => assignEntry(symbol, data));
    }

    if (typeof window !== 'undefined') {
        window.symbolMetadataCache = symbolMetadataCache;
    }
}

function initializeDataTypeSelector() {
    const select = document.getElementById('importDataTypeSelect');
    if (!select) {
        return;
    }

    populateDataTypeSelect(select);

    if (!selectedDataTypeKey || !IMPORT_DATA_TYPE_DEFINITIONS[selectedDataTypeKey]) {
        selectedDataTypeKey = 'executions';
    }

    select.value = selectedDataTypeKey;
    selectedDataTypeKey = select.value || selectedDataTypeKey;

    if (select.dataset.listenerAttached !== 'true') {
        select.addEventListener('change', handleDataTypeSelectionChange);
        select.dataset.listenerAttached = 'true';
    }

    if (Object.keys(dataTypeAvailabilityMap).length > 0) {
        updateDataTypeAvailability(Object.values(dataTypeAvailabilityMap));
    } else {
        updateSelectedDataTypeInfo();
    }
}

function populateDataTypeSelect(select) {
    if (!select) {
        return;
    }

    const previousValue = select.value;
    select.innerHTML = '';

    IMPORT_DATA_TYPE_ORDER.forEach((key) => {
        const definition = IMPORT_DATA_TYPE_DEFINITIONS[key];
        if (!definition) {
            return;
        }
        const option = document.createElement('option');
        option.value = definition.key;
        const isActive = ACTIVE_IMPORT_DATA_TYPES.has(definition.key);
        option.textContent = isActive ? definition.label : `${definition.label} (בפיתוח)`;
        option.disabled = !isActive;
        option.dataset.status = isActive ? 'available' : 'planned';
        option.dataset.records = '';
        select.appendChild(option);
    });

    if (previousValue && IMPORT_DATA_TYPE_DEFINITIONS[previousValue]) {
        select.value = previousValue;
    } else if (selectedDataTypeKey && IMPORT_DATA_TYPE_DEFINITIONS[selectedDataTypeKey]) {
        select.value = selectedDataTypeKey;
    }
    selectedDataTypeKey = select.value || selectedDataTypeKey;
}

function handleDataTypeSelectionChange(event) {
    const select = event.target;
    selectedDataTypeKey = select.value;
    if (select) {
        select.dataset.manualSelection = 'true';
        select.dataset.serverValue = select.value;
    }
    updateSelectedDataTypeInfo();
    detectAvailableDataTypes();
    triggerFilePrecheckIfReady();
}

function updateDataTypeAvailability(detected = []) {
    dataTypeAvailabilityMap = {};
    detected.forEach((entry) => {
        if (entry && entry.key) {
            dataTypeAvailabilityMap[entry.key] = entry;
        }
    });

    const select = document.getElementById('importDataTypeSelect');
    if (select) {
        const options = Array.from(select.options);
        options.forEach((option) => {
            const definition = IMPORT_DATA_TYPE_DEFINITIONS[option.value];
            if (!definition) {
                return;
            }

            const availability = dataTypeAvailabilityMap[option.value];
            const isActive = ACTIVE_IMPORT_DATA_TYPES.has(option.value);
            const status = availability?.status || (isActive ? 'available' : 'planned');
            option.dataset.status = status;
            option.dataset.records = availability?.records ?? '';
            option.disabled = status !== 'available';
        });

        if (!select.value || select.options[select.selectedIndex]?.disabled) {
            const fallbackOption = options.find((option) => !option.disabled);
            if (fallbackOption) {
                select.value = fallbackOption.value;
                selectedDataTypeKey = fallbackOption.value;
            }
        }
    }

    updateSelectedDataTypeInfo();
}

function updateSelectedDataTypeInfo() {
    const select = document.getElementById('importDataTypeSelect');
    const infoCard = document.getElementById('dataTypeInfoCard');
    const titleEl = document.getElementById('dataTypeInfoTitle');
    const subtitleEl = document.getElementById('dataTypeInfoSubtitle');
    const contentEl = document.getElementById('dataTypeInfoContent');
    const modal = document.getElementById('importUserDataModal');
    const modalDialog = modal?.querySelector('.modal-dialog');
    const stepContainer = document.getElementById('step-upload');
    const headerActions = document.getElementById('stepsHeaderPrimaryActions');

    if (!infoCard || !titleEl || !contentEl) {
        return;
    }

    const currentKey = (select && select.value) || selectedDataTypeKey;

    if (!currentKey || !IMPORT_DATA_TYPE_DEFINITIONS[currentKey]) {
        titleEl.textContent = 'בחר תהליך לקבלת מידע';
        if (subtitleEl) {
            subtitleEl.textContent = '';
        }
        contentEl.innerHTML = '<p>בחר תהליך ייבוא מהרשימה כדי לצפות בתיאור והתרחישים הנתמכים.</p>';
        applyEntityTypeToImportButtons('cash_flow');
        if (modalDialog) modalDialog.setAttribute('data-entity-type', 'cash_flow');
        if (stepContainer) stepContainer.setAttribute('data-entity-type', 'cash_flow');
        if (headerActions) headerActions.setAttribute('data-entity-type', 'cash_flow');
        return;
    }

    const definition = IMPORT_DATA_TYPE_DEFINITIONS[currentKey];
    const availability = dataTypeAvailabilityMap[currentKey];
    const status = availability?.status || (ACTIVE_IMPORT_DATA_TYPES.has(currentKey) ? 'available' : 'planned');
    const records = availability?.records ?? null;
    const entityType = definition.entityType || getEntityTypeForImport(currentKey);

    titleEl.textContent = definition.label;
    if (subtitleEl) {
        const statusLabel = status === 'available' ? 'זמין לניתוח' : 'בפיתוח';
        subtitleEl.textContent = statusLabel;
    }

    let statsHtml = '';
    if (records !== null && !Number.isNaN(records)) {
        const recordsNumber = Number(records);
        const recordsLabel = recordsNumber === 0
            ? '<span class="text-warning">לא נמצאו רשומות בקובץ עבור תהליך זה</span>'
            : `רשומות שזוהו בקובץ: ${recordsNumber}`;
        statsHtml = `<div class="data-type-stats">${recordsLabel}</div>`;
    }

    contentEl.innerHTML = `
        <p>${definition.description}</p>
        ${statsHtml}
        ${definition.documentationAnchor
            ? `<p class="mt-2"><a href="${definition.documentationAnchor}" target="_blank">למידע נוסף בתיעוד</a></p>`
            : ''}
    `;

    if (modalDialog) {
        modalDialog.setAttribute('data-entity-type', entityType);
    }
    if (stepContainer) {
        stepContainer.setAttribute('data-entity-type', entityType);
    }
    if (headerActions) {
        headerActions.setAttribute('data-entity-type', entityType);
    }
    applyEntityTypeToImportButtons(entityType);
    
    updateImportModalNavigation();
}

function getSymbolMetadata(symbol) {
    const key = normaliseSymbolKey(symbol);
    if (!key) {
        return null;
    }
    return symbolMetadataCache[key] || null;
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

const CASHFLOW_TYPE_LABELS = {
    deposit: 'הפקדות',
    withdrawal: 'משיכות',
    dividend: 'דיבידנדים',
    dividend_accrual: 'שינויים בצבירת דיבידנד',
    interest: 'ריבית',
    interest_accrual: 'שינויים בצבירת ריבית',
    tax: 'ניכויי מס',
    fee: 'עמלות',
    borrow_fee: 'Borrow Fee',
    syep_activity: 'פעילות SYEP',
    syep_interest: 'ריבית SYEP',
    forex_conversion: 'המרות מט"ח',
    transfer: 'העברות פנימיות',
    cash_adjustment: 'התאמות מזומן',
    unknown: 'סוג לא מזוהה'
};

function resolveCashflowTypeLabel(typeKey) {
    if (!typeKey) {
        return CASHFLOW_TYPE_LABELS.unknown;
    }
    const normalised = String(typeKey).toLowerCase();
    return CASHFLOW_TYPE_LABELS[normalised] || CASHFLOW_TYPE_LABELS.unknown;
}

function safeToNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}

function formatNumber(value, fractionDigits = 0) {
    const numeric = safeToNumber(value);
    return numeric.toLocaleString('he-IL', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
}

function formatAmount(value) {
    return formatNumber(value, 2);
}

function setAnalysisCardLabel(valueElementId, labelText) {
    if (!valueElementId) {
        return;
    }
    const valueElement = document.getElementById(valueElementId);
    if (!valueElement) {
        return;
    }
    const card = valueElement.closest('.analysis-card');
    if (!card) {
        return;
    }
    const labelElement = card.querySelector('.card-label');
    if (labelElement && labelText) {
        labelElement.textContent = labelText;
    }
}

function clearCashflowAnalysisSections() {
    const sections = [
        { section: 'cashflowTypeSummarySection', content: 'cashflowTypeSummaryCards' },
        { section: 'cashflowCurrencySummarySection', content: 'cashflowCurrencySummaryCards' },
        { section: 'cashflowSummaryComparisonSection', content: 'cashflowSummaryComparisonTable' },
        { section: 'cashflowIssuesSummarySection', content: 'cashflowIssuesSummaryList' }
    ];

    sections.forEach(({ section, content }) => {
        const sectionElement = document.getElementById(section);
        const contentElement = content ? document.getElementById(content) : null;
        if (contentElement) {
            contentElement.innerHTML = '';
        }
        if (sectionElement) {
            setElementDisplay(sectionElement, 'none');
        }
    });
}

function renderCashflowTypeCards(typeStats = {}, totalsByType = {}) {
    const section = document.getElementById('cashflowTypeSummarySection');
    const container = document.getElementById('cashflowTypeSummaryCards');
    if (!section || !container) {
        return;
    }

    container.innerHTML = '';
    
    // IMPORTANT: Filter out types that should be skipped (not imported)
    // These types are filtered out in IBKRConnector._build_cashflow_record:
    // - dividend_accrual: Accounting entry, not actual cash movement
    // - interest_accrual: Accounting entry, not actual cash movement
    // - syep_activity: Activity details, not cash movement
    // - syep_interest: Duplicate detail (already in Interest section)
    // - cash_report: Summary only, not actual records
    // - cash_adjustment: Filtered out type
    
    // TEMPORARY FOR TESTING: Skip all types except 'interest'
    // TODO: Remove this temporary filter after testing
    const skippedTypes = [
        'dividend_accrual',
        'interest_accrual',
        'syep_activity',
        'syep_interest',
        'cash_report',
        'cash_adjustment',
        // TEMPORARY: Skip all types except 'interest' for testing
        'deposit',
        'withdrawal',
        'dividend',
        'tax',
        'fee',
        'borrow_fee',
        'forex_conversion',
        'transfer'
    ];
    
    // Filter out skipped types
    const filteredTypeStats = Object.fromEntries(
        Object.entries(typeStats).filter(([typeKey]) => !skippedTypes.includes(typeKey))
    );
    
    const entries = Object.entries(filteredTypeStats);
    if (!entries.length) {
        setElementDisplay(section, 'none');
        return;
    }

        entries
        .sort((a, b) => (b[1]?.total_records || 0) - (a[1]?.total_records || 0))
        .forEach(([typeKey, stats]) => {
            const total = safeToNumber(stats.total_records);
            const valid = safeToNumber(stats.valid_records);
            const invalid = safeToNumber(stats.invalid_records ?? Math.max(0, total - safeToNumber(stats.valid_records)));
            const amount = safeToNumber(stats.total_amount ?? totalsByType?.[typeKey]);
            const primaryCurrencyEntry = Object.entries(stats.currencies || {})
                .sort(([, amountA], [, amountB]) => Math.abs(amountB) - Math.abs(amountA))[0];

            // Note: All skipped types (dividend_accrual, interest_accrual, syep_activity, syep_interest, cash_report, cash_adjustment)
            // are already filtered out above, so all types here are valid for import

            // Initialize selectedCashflowTypes if not already set
            // TEMPORARY FOR TESTING: Only select 'interest' by default
            if (Object.keys(selectedCashflowTypes).length === 0) {
                entries.forEach(([key]) => {
                    // TEMPORARY: Only select 'interest' for testing
                    selectedCashflowTypes[key] = (key === 'interest'); // Only interest selected by default
                });
            }
            
            // Get current selection state
            // TEMPORARY FOR TESTING: Default to false (only interest should be selected)
            const isSelected = selectedCashflowTypes[typeKey] !== undefined 
                ? selectedCashflowTypes[typeKey] 
                : (typeKey === 'interest'); // TEMPORARY: Only interest selected by default

            const card = document.createElement('div');
            card.className = 'analysis-card';
            card.setAttribute('data-cashflow-type', typeKey);
            card.innerHTML = `
                <div class="card-icon"><i class="bi bi-diagram-3"></i></div>
                <div class="card-content">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div class="card-number">${formatNumber(total)}</div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0;">
                            <input type="checkbox" 
                                   class="cashflow-type-checkbox" 
                                   data-type="${typeKey}"
                                   ${isSelected ? 'checked' : ''}
                                   style="cursor: pointer; width: 18px; height: 18px;">
                            <span style="font-size: 0.9em; font-weight: 500;">ייבוא</span>
                        </label>
                    </div>
                    <div class="card-label">${resolveCashflowTypeLabel(typeKey)}</div>
                    <small>✅ ${formatNumber(valid)} | ⚠️ ${formatNumber(invalid)}</small>
                    <small>סה״כ סכום: ${formatAmount(amount)}</small>
                    ${primaryCurrencyEntry ? `<small>מטבע מוביל: ${primaryCurrencyEntry[0]} ${formatAmount(primaryCurrencyEntry[1])}</small>` : ''}
                </div>
            `;
            container.appendChild(card);
            
            // Add event listener for checkbox
            const checkbox = card.querySelector('.cashflow-type-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    selectedCashflowTypes[typeKey] = this.checked;
                    // Update counts if needed
                    updateCashflowTypeCounts();
                });
            }
        });

    setElementDisplay(section, 'block');
}

/**
 * Update cashflow type counts based on selected types
 * This function can be called when checkboxes change to update UI counts
 */
function updateCashflowTypeCounts() {
    // This function can be extended to update summary counts if needed
    // For now, it's a placeholder that can be called when checkboxes change
    // The actual filtering happens in displayPreviewData() and performImport()
}

/**
 * Render cashflow summary comparison table (import totals vs Cash Report totals)
 */
function renderCashflowSummaryComparison(summaryComparison = {}) {
    const section = document.getElementById('cashflowSummaryComparisonSection');
    const container = document.getElementById('cashflowSummaryComparisonTable');
    if (!section || !container) {
        return;
    }

    if (!summaryComparison || Object.keys(summaryComparison).length === 0) {
        setElementDisplay(section, 'none');
        return;
    }

    const entries = Object.entries(summaryComparison);
    if (entries.length === 0) {
        setElementDisplay(section, 'none');
        return;
    }

    let tableHTML = `
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>סוג תזרים</th>
                    <th>סכום ייבוא</th>
                    <th>סכום דוח</th>
                    <th>הפרש</th>
                    <th>סטטוס</th>
                </tr>
            </thead>
            <tbody>
    `;

    entries.forEach(([cashflowType, comparison]) => {
        const importTotal = safeToNumber(comparison.import_total || 0);
        const reportTotal = safeToNumber(comparison.report_total || 0);
        const difference = safeToNumber(comparison.difference || 0);
        const match = comparison.match === true;
        
        const statusClass = match ? 'text-success' : 'text-danger';
        const statusText = match ? '✅ תואם' : '⚠️ לא תואם';
        const rowClass = match ? '' : 'table-warning';

        tableHTML += `
            <tr class="${rowClass}">
                <td>${resolveCashflowTypeLabel(cashflowType)}</td>
                <td>${formatAmount(importTotal)}</td>
                <td>${formatAmount(reportTotal)}</td>
                <td>${formatAmount(difference)}</td>
                <td class="${statusClass}">${statusText}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
    setElementDisplay(section, 'block');
}

function renderCashflowCurrencyCards(totalsByCurrency = {}) {
    const section = document.getElementById('cashflowCurrencySummarySection');
    const container = document.getElementById('cashflowCurrencySummaryCards');
    if (!section || !container) {
        return;
    }

    container.innerHTML = '';
    const entries = Object.entries(totalsByCurrency)
        .filter(([currency]) => currency && currency !== 'undefined');

    if (!entries.length) {
        setElementDisplay(section, 'none');
        return;
    }

    entries
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .forEach(([currency, amount]) => {
            const card = document.createElement('div');
            card.className = 'analysis-card';
            card.innerHTML = `
                <div class="card-icon"><i class="bi bi-cash-stack"></i></div>
                <div class="card-content">
                    <div class="card-number">${currency}</div>
                    <div class="card-label">${formatAmount(amount)}</div>
                </div>
            `;
            container.appendChild(card);
        });

    setElementDisplay(section, 'block');
}

function renderCashflowIssuesSummary({
    issuesByType = {},
    missingAccountDetails = [],
    currencyIssues = []
} = {}) {
    const section = document.getElementById('cashflowIssuesSummarySection');
    const list = document.getElementById('cashflowIssuesSummaryList');
    if (!section || !list) {
        return;
    }

    list.innerHTML = '';
    const items = [];

    if (Array.isArray(missingAccountDetails) && missingAccountDetails.length > 0) {
        items.push({
            title: 'חשבונות חסרים',
            count: missingAccountDetails.length,
            description: 'רשומות הדורשות שיוך חשבון לפני הייבוא.',
            icon: 'bi-people-fill'
        });
    }

    if (Array.isArray(currencyIssues) && currencyIssues.length > 0) {
        items.push({
            title: 'בעיות מטבע',
            count: currencyIssues.length,
            description: 'נמצאו קודי מטבע שגויים או לא נתמכים בקובץ.',
            icon: 'bi-currency-exchange'
        });
    }

    Object.entries(issuesByType || {}).forEach(([typeKey, entries]) => {
        if (!Array.isArray(entries) || entries.length === 0) {
            return;
        }
        items.push({
            title: `שגיאות בסוג ${resolveCashflowTypeLabel(typeKey)}`,
            count: entries.length,
            description: 'הרשומות הללו הושמטו בשלב הניתוח ודורשות טיפול ידני.',
            icon: 'bi-exclamation-octagon'
        });
    });

    if (!items.length) {
        setElementDisplay(section, 'none');
        return;
    }

    items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <div class="summary-header">
                <div class="summary-title"><i class="bi ${item.icon}"></i> ${item.title}</div>
                <div class="summary-subtitle">${formatNumber(item.count)}</div>
            </div>
            <div class="summary-body">
                <p>${item.description}</p>
            </div>
        `;
        list.appendChild(card);
    });

    setElementDisplay(section, 'block');
}

function renderKeyValueCards(sectionId, containerId, entries = {}, { labelPrefix = '', emptyLabel = '' } = {}) {
    const section = document.getElementById(sectionId);
    const container = document.getElementById(containerId);
    if (!section || !container) {
        return;
    }

    container.innerHTML = '';
    const pairs = Object.entries(entries || {}).filter(([key]) => typeof key === 'string' && key.trim() !== '');
    if (!pairs.length) {
        setElementDisplay(section, 'none');
        return;
    }

    setElementDisplay(section, 'block');
    pairs
        .sort(([, valueA], [, valueB]) => Math.abs(valueB) - Math.abs(valueA))
        .forEach(([key, value]) => {
            const card = document.createElement('div');
            card.className = 'analysis-card';
            card.innerHTML = `
                <div class="card-icon"><i class="bi bi-bar-chart-steps"></i></div>
                <div class="card-content">
                    <div class="card-number">${labelPrefix ? `${labelPrefix} ${key}` : key}</div>
                    <div class="card-label">${formatAmount(value)}</div>
                </div>
            `;
            container.appendChild(card);
        });
}

function renderListSummary(sectionId, listId, items = [], formatter) {
    const section = document.getElementById(sectionId);
    const list = document.getElementById(listId);
    if (!section || !list) {
        return;
    }

    list.innerHTML = '';
    if (!Array.isArray(items) || !items.length) {
        setElementDisplay(section, 'none');
        return;
    }

    setElementDisplay(section, 'block');
    items.slice(0, 10).forEach((item) => {
        const li = document.createElement('li');
        const text = formatter ? formatter(item) : String(item);
        li.textContent = text;
        list.appendChild(li);
    });
}

function sanitizeRichText(html) {
    if (window.RichTextEditorService && typeof window.RichTextEditorService.sanitizeHTML === 'function') {
        return window.RichTextEditorService.sanitizeHTML(html);
    }
    return html;
}

function buildRichTextFromMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return '';
    }

    const links = metadata.links || {};
    const googleUrl = links.google_finance;
    const yahooUrl = links.yahoo_finance;
    const status = links.status;
    const parts = ['<div data-auto-generated="import-links">'];

    if (metadata.company_name) {
        parts.push(
            `<p><strong>Company:</strong> ${escapeHtml(metadata.company_name)}</p>`
        );
    }

    if (googleUrl || yahooUrl) {
        parts.push('<ul>');
        if (googleUrl) {
            parts.push(
                '<li>'
                + `<a href="${escapeAttribute(googleUrl)}" target="_blank" rel="noopener noreferrer">Google Finance</a>`
                + '</li>'
            );
        }
        if (yahooUrl) {
            parts.push(
                '<li>'
                + `<a href="${escapeAttribute(yahooUrl)}" target="_blank" rel="noopener noreferrer">Yahoo Finance</a>`
                + '</li>'
            );
        }
        parts.push('</ul>');
    } else {
        parts.push('<p>No external links available.</p>');
    }

    if (status) {
        parts.push(
            `<p><small>Link status: ${escapeHtml(status)}</small></p>`
        );
    }

    parts.push('</div>');
    return sanitizeRichText(parts.join(''));
}

function buildMetadataLinksList(metadata, options = {}) {
    if (!metadata || typeof metadata !== 'object') {
        return '';
    }

    const links = metadata.links || {};
    const googleUrl = links.google_finance;
    const yahooUrl = links.yahoo_finance;
    const status = links.status;
    const containerClass = options.containerClass || 'metadata-links';
    const listClass = options.listClass || 'metadata-links-list';
    const statusClass = options.statusClass || 'metadata-links-status';
    const items = [];

    if (googleUrl) {
        items.push(
            `<li><a href="${escapeAttribute(googleUrl)}" target="_blank" rel="noopener noreferrer">Google Finance</a></li>`
        );
    }

    if (yahooUrl) {
        items.push(
            `<li><a href="${escapeAttribute(yahooUrl)}" target="_blank" rel="noopener noreferrer">Yahoo Finance</a></li>`
        );
    }

    if (!items.length) {
        return '';
    }

    const statusHtml = options.showStatus && status
        ? `<div class="${statusClass}"><small>${escapeHtml(status)}</small></div>`
        : '';

    return `
        <div class="${containerClass}">
            <ul class="${listClass}">
                ${items.join('')}
            </ul>
            ${statusHtml}
        </div>
    `;
}

function renderMetadataSummaryBlock(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return '';
    }

    const parts = [];
    if (metadata.company_name) {
        parts.push(
            `<div class="metadata-company"><i class="bi bi-building"></i> ${escapeHtml(metadata.company_name)}</div>`
        );
    }

    const linksHtml = buildMetadataLinksList(metadata, {
        containerClass: 'metadata-links',
        listClass: 'metadata-links-list',
        statusClass: 'metadata-links-status',
        showStatus: true
    });

    if (linksHtml) {
        parts.push(linksHtml);
    }

    return parts.join('');
}

function ensureRichTextEditorForTickerRemarks(modalElement) {
    if (!modalElement) {
        return null;
    }

    const textarea = modalElement.querySelector('#tickerRemarks');
    if (!textarea || !window.initRichTextEditor) {
        return null;
    }

    if (textarea.getAttribute('data-rich-text-enhanced') === 'true') {
        return TICKER_REMARKS_EDITOR_ID;
    }

    const editorContainer = document.createElement('div');
    editorContainer.id = TICKER_REMARKS_EDITOR_ID;
    editorContainer.classList.add('rich-text-editor-container');

    setElementDisplay(textarea, 'none');
    textarea.setAttribute('data-rich-text-enhanced', 'true');
    textarea.parentNode.insertBefore(editorContainer, textarea.nextSibling);

    window.initRichTextEditor(TICKER_REMARKS_EDITOR_ID, {
        placeholder: 'הכנס הערות על הטיקר...',
        maxLength: 500
    });

    return TICKER_REMARKS_EDITOR_ID;
}

function syncTickerRemarksEditorToField(modalElement) {
    const effectiveModal = modalElement || document.getElementById('tickersModal');
    if (!effectiveModal) {
        return;
    }

    const textarea = effectiveModal.querySelector('#tickerRemarks');
    if (!textarea) {
        return;
    }

    if (window.RichTextEditorService && typeof window.RichTextEditorService.getEditorInstance === 'function') {
        const editor = window.RichTextEditorService.getEditorInstance(TICKER_REMARKS_EDITOR_ID);
        if (editor && typeof window.RichTextEditorService.getContent === 'function') {
            const htmlContent = window.RichTextEditorService.getContent(TICKER_REMARKS_EDITOR_ID) || '';
            textarea.value = htmlContent;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

function isSessionActive(status) {
    // Check if session status indicates it's still active (not closed)
    // Accepts both raw status (English) and translated status (Hebrew)
    if (!status) return false;
    const statusStr = String(status).toLowerCase();
    
    // Check for closed statuses first (more specific)
    const closedStatuses = ['completed', 'failed', 'cancelled', 'הושלם', 'נכשל', 'בוטל'];
    if (closedStatuses.some(closedStatus => statusStr === closedStatus.toLowerCase() || statusStr.includes(closedStatus.toLowerCase()))) {
        return false;
    }
    
    // Check for active statuses (both English and Hebrew)
    const activeStatuses = [
        'analyzing', 'ready', 'importing', 'created',
        'ניתוח בתהליך', 'מוכן לייבוא', 'ייבוא פעיל', 'התקבל',
        'מוכן', 'בתהליך', 'פעיל'
    ];
    return activeStatuses.some(activeStatus => statusStr === activeStatus.toLowerCase() || statusStr.includes(activeStatus.toLowerCase()));
}

function updateResetSessionButtonState() {
    const resetButton = document.getElementById('resetImportSessionBtn');
    const resumeButton = document.getElementById('resumeImportSessionBtn');
    // Only show buttons if there's an active (not closed) session
    // Use raw status if available (more reliable), otherwise use translated status
    const statusToCheck = activeSessionInfo?.statusRaw || activeSessionInfo?.status;
    const hasActiveSession = currentSessionId && activeSessionInfo && isSessionActive(statusToCheck);

    // CRITICAL: Always sync button visibility with session indicator
    // If there's no active session, hide both button and info
    if (!hasActiveSession) {
        if (resumeButton) {
            resumeButton.classList.add('d-none');
            resumeButton.style.display = 'none';
            resumeButton.disabled = true;
            resumeButton.setAttribute('aria-disabled', 'true');
        }
        if (resetButton) {
            resetButton.classList.add('d-none');
            resetButton.style.display = 'none';
            resetButton.disabled = true;
            resetButton.setAttribute('aria-disabled', 'true');
        }
        // Don't call updateActiveSessionIndicator here - it will be called separately
        return;
    }

    // If we have an active session, show buttons and ensure info is visible
    if (resumeButton) {
        resumeButton.classList.remove('d-none');
        resumeButton.style.display = 'inline-flex';
        // Force display if still hidden
        if (window.getComputedStyle(resumeButton).display === 'none') {
            resumeButton.style.display = 'inline-flex';
        }
        resumeButton.disabled = false;
        resumeButton.setAttribute('aria-disabled', 'false');
    }
    if (resetButton) {
        resetButton.classList.remove('d-none');
        resetButton.style.display = 'inline-flex';
        // Force display if still hidden
        if (window.getComputedStyle(resetButton).display === 'none') {
            resetButton.style.display = 'inline-flex';
        }
        resetButton.disabled = false;
        resetButton.setAttribute('aria-disabled', 'false');
    }
    
    // Ensure indicator is also visible (will be called separately, but ensure consistency)
}

function getApiErrorMessage(response, fallback = 'שגיאה לא ידועה') {
    if (!response || typeof response !== 'object') {
        return fallback;
    }
    return response.error || response.message || response.detail || response.details || fallback;
}

function updateActiveSessionInfo(updates = {}) {
    if (!currentSessionId) {
        // IMPORTANT: Don't clear stored session automatically - allow resuming incomplete sessions
        // Only clear if explicitly requested (e.g., after successful import or explicit reset)
        activeSessionInfo = null;
        updateActiveSessionIndicator();
        // Don't clear stored session here - allow resuming
        // clearStoredActiveSession(); // REMOVED: Allow resuming incomplete sessions
        updateImportModalNavigation();
        setActiveFileAccountNumber(null);
        return;
    }
    
    const connectorSelect = document.getElementById('connectorSelect');
    
    activeSessionInfo = {
        ...(activeSessionInfo || {}),
        sessionId: currentSessionId
    };
    
    const fileName = updates.fileName ?? window.selectedFile?.name ?? activeSessionInfo.fileName ?? '';
    const fileSize = updates.fileSize ?? window.selectedFile?.size ?? activeSessionInfo.fileSize ?? null;
    const accountName = updates.accountName 
        ?? activeSessionInfo.accountName 
        ?? '';
    const accountIdValue = updates.accountId ?? selectedAccount ?? activeSessionInfo.accountId ?? null;
    const connectorValue = updates.connector ?? selectedConnector ?? activeSessionInfo.connector ?? '';
    const connectorName = updates.connectorName 
        ?? connectorSelect?.selectedOptions?.[0]?.text?.trim() 
        ?? activeSessionInfo.connectorName 
        ?? '';
    const taskType = updates.taskType ?? activeSessionInfo.taskType ?? selectedDataTypeKey ?? 'executions';
    const fileAccountNumber = updates.fileAccountNumber
        ?? activeSessionInfo.fileAccountNumber
        ?? activeFileAccountNumber
        ?? null;
    
    activeSessionInfo.fileName = fileName;
    activeSessionInfo.fileSize = fileSize;
    activeSessionInfo.accountName = accountName;
    activeSessionInfo.accountId = accountIdValue;
    activeSessionInfo.connector = connectorValue;
    activeSessionInfo.connectorName = connectorName;
    activeSessionInfo.taskType = taskType;
    activeSessionInfo.fileAccountNumber = fileAccountNumber;
    activeSessionInfo.externalAccountNumber = updates.externalAccountNumber ?? activeSessionInfo.externalAccountNumber ?? null;
    activeSessionInfo.linkingStatus = updates.linkingStatus ?? activeSessionInfo.linkingStatus ?? null;
    selectedDataTypeKey = taskType;
    setActiveFileAccountNumber(fileAccountNumber);

    if (accountIdValue) {
        setLinkedAccountInfo({
            id: accountIdValue,
            name: accountName,
            external_account_number: activeSessionInfo.externalAccountNumber
        });
    }
    
    const dataTypeSelect = document.getElementById('importDataTypeSelect');
    if (dataTypeSelect) {
        dataTypeSelect.value = taskType;
    }
    updateSelectedDataTypeInfo();
    
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
    
    // Store raw status if provided (for isSessionActive check)
    if (updates.statusRaw !== undefined) {
        activeSessionInfo.statusRaw = updates.statusRaw;
    }
    
    updateActiveSessionIndicator();
    updateResetSessionButtonState();
    updateImportModalNavigation();
    syncAccountAndConnectorLockState();
}

function updateActiveSessionIndicator() {
    const indicator = document.getElementById('activeSessionIndicator');
    const controlsRow = document.getElementById('activeSessionControlsRow');
    const detailsRow = document.getElementById('activeSessionDetailsRow');
    if (!indicator) {
        return;
    }
    
    // Check if there's an active (not closed) session
    // Use raw status if available (more reliable), otherwise use translated status
    const statusToCheck = activeSessionInfo?.statusRaw || activeSessionInfo?.status;
    const hasActiveSession = currentSessionId && activeSessionInfo && isSessionActive(statusToCheck);
    
    if (!hasActiveSession) {
        indicator.classList.add('d-none');
        indicator.style.display = 'none';
        indicator.setAttribute('data-has-session', 'false');
        if (controlsRow) {
            controlsRow.classList.add('d-none');
            controlsRow.style.display = 'none';
        }
        if (detailsRow) {
            detailsRow.classList.add('d-none');
            detailsRow.style.display = 'none';
        }
        return;
    }
    
    // Show indicator and remove d-none class
    indicator.classList.remove('d-none');
    indicator.style.display = 'block';
    indicator.setAttribute('data-has-session', 'true');
    if (controlsRow) {
        controlsRow.classList.remove('d-none');
        controlsRow.style.display = ''; // Empty string removes inline style, allowing Bootstrap classes to work
        // Force display if still hidden
        if (window.getComputedStyle(controlsRow).display === 'none') {
            controlsRow.style.display = 'flex'; // Bootstrap row uses flex
        }
    }
    if (detailsRow) {
        detailsRow.classList.remove('d-none');
        detailsRow.style.display = ''; // Empty string removes inline style, allowing Bootstrap classes to work
        // Force display if still hidden
        if (window.getComputedStyle(detailsRow).display === 'none') {
            detailsRow.style.display = 'block'; // Bootstrap row uses block
        }
    }
    
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
    const brokerEl = document.getElementById('activeSessionBrokerAccountValue');
    if (brokerEl) {
        brokerEl.textContent = activeSessionInfo.fileAccountNumber
            || activeFileAccountNumber
            || 'לא זמין';
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
    
    const taskType = (results.task_type || selectedDataTypeKey || 'executions').toLowerCase();
    const fileAccountNumber = results.file_account_number
        || results.fileAccountNumber
        || activeSessionInfo?.fileAccountNumber
        || activeFileAccountNumber
        || null;

    if (taskType === 'cashflows') {
        const summary = results.cashflow_summary || {};
        const missingAccountsCount = (results.missing_accounts || summary.missing_accounts || []).length;
        const currencyIssuesCount = (results.currency_issues || summary.currency_issues || []).length;
        const duplicateRecords = results.duplicate_records || 0;
        const invalidRecords = results.invalid_records || 0;
        const totalRecords = results.total_records ?? summary.record_count ?? results.valid_records ?? 0;
        const readyRecords = summary.record_count ?? results.valid_records ?? Math.max(0, totalRecords - (missingAccountsCount + currencyIssuesCount + duplicateRecords + invalidRecords));
        const skipRecords = missingAccountsCount + currencyIssuesCount + duplicateRecords + invalidRecords;

        updateActiveSessionInfo({
            totalRecords,
            readyRecords,
            skipRecords,
            missingAccounts: missingAccountsCount,
            currencyIssues: currencyIssuesCount,
            duplicateRecords,
            status: activeSessionInfo?.status || 'ניתוח הושלם',
            fileAccountNumber,
            linkingStatus: results.linking_status || 'confirmed'
        });
        return;
    }

    if (taskType === 'account_reconciliation') {
        const missingAccountsCount = (results.missing_accounts || []).length;
        const baseCurrencyMismatches = (results.base_currency_mismatches || []).length;
        const entitlementWarnings = (results.entitlement_warnings || []).length;
        const missingDocuments = (results.missing_documents_report || []).length;
        const totalRecords = results.total_records || results.valid_records || missingAccountsCount || 0;
        const readyRecords = results.valid_records || Math.max(0, totalRecords - (missingAccountsCount + baseCurrencyMismatches + entitlementWarnings + missingDocuments));
        const skipRecords = missingAccountsCount + baseCurrencyMismatches + entitlementWarnings + missingDocuments + (results.invalid_records || 0);

        updateActiveSessionInfo({
            totalRecords,
            readyRecords,
            skipRecords,
            missingAccounts: missingAccountsCount,
            baseCurrencyMismatches,
            entitlementWarnings,
            missingDocuments,
            status: activeSessionInfo?.status || 'ניתוח הושלם',
            fileAccountNumber,
            linkingStatus: results.linking_status || 'confirmed'
        });
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
        status: activeSessionInfo?.status || 'ניתוח הושלם',
        fileAccountNumber,
        linkingStatus: results.linking_status || 'confirmed'
    });
}

function updateActiveSessionFromPreview(preview) {
    if (!currentSessionId || !preview) {
        return;
    }
    
    const summary = preview.summary || {};
    const readyRecords = summary.records_to_import
        ?? summary.cashflow_records
        ?? summary.valid_records
        ?? (Array.isArray(preview.records_to_import) ? preview.records_to_import.length : activeSessionInfo?.readyRecords || 0);
    
    const skipRecords = summary.records_to_skip
        ?? summary.invalid_records
        ?? (Array.isArray(preview.records_to_skip) ? preview.records_to_skip.length : activeSessionInfo?.skipRecords || 0);
    
    updateActiveSessionInfo({
        readyRecords,
        skipRecords,
        taskType: preview.task_type || selectedDataTypeKey || activeSessionInfo?.taskType,
        status: activeSessionInfo?.status || 'ממתין לאישור'
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

/**
 * Simple session management - check for active session on modal open
 * Returns true if active session found, false otherwise
 */
async function checkActiveSessionOnModalOpen() {
    try {
        const response = await fetch('/api/user-data-import/sessions/active');
        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        if (!data.session) {
            // No active session - clear UI and allow new session
            currentSessionId = null;
            window.currentSessionId = null;
            activeSessionInfo = null;
            updateActiveSessionIndicator();
            updateResetSessionButtonState();
            updateAnalyzeButton();
            return false;
        }
        
        const session = data.session;
        const sessionStatus = (session.status || '').toLowerCase();
        const closedStatuses = ['completed', 'failed', 'cancelled'];
        
        // If session is closed, treat as no session
        if (closedStatuses.includes(sessionStatus)) {
            currentSessionId = null;
            window.currentSessionId = null;
            activeSessionInfo = null;
            updateActiveSessionIndicator();
            updateResetSessionButtonState();
            updateAnalyzeButton();
            return false;
        }
        
        // Active session found - load it
        const summary = data.summary || {};
        const fileAccountNumber = summary.file_account_number
            ?? session.summary_data?.file_account_number
            ?? session.file_account_number
            ?? null;
        
        updateSymbolMetadataCache(summary?.symbol_metadata || session.symbol_metadata);
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
            statusRaw: session.status,
            totalRecords: summary.total_records ?? session.total_records ?? 0,
            readyRecords: summary.imported_records
                ?? summary.records_to_import
                ?? Math.max(0, (session.total_records || 0) - (session.skipped_records || 0)),
            skipRecords: summary.records_to_skip ?? session.skipped_records ?? 0,
            fileAccountNumber
        });
        
        await fetchExistingSessionDetails(session.id);
        updateActiveSessionIndicator();
        updateResetSessionButtonState();
        updateAnalyzeButton();
        
        return true;
    } catch (error) {
        window.Logger?.warn?.('[Import Modal] Failed to check active session', { error: error?.message });
        currentSessionId = null;
        window.currentSessionId = null;
        activeSessionInfo = null;
        updateActiveSessionIndicator();
        updateResetSessionButtonState();
        updateAnalyzeButton();
        return false;
    }
}

async function fetchExistingSessionDetails(sessionId) {
    window.Logger?.info('[ACCOUNT_LINKING] 🔄 Fetching existing session details', {
        sessionId,
        page: 'import-user-data'
    });
    
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
        const fileAccountNumber = summary.file_account_number
            ?? session.summary_data?.file_account_number
            ?? session.file_account_number
            ?? null;
        
        // Get linked account information from session
        const tradingAccountId = session.trading_account_id;
        const linkingMatchedAccountId = summary.linking_matched_account_id || tradingAccountId;
        const linkingStatus = summary.linking_status || 'unknown';
        const linkingConfirmed = summary.linking_confirmed || false;
        
        window.Logger?.info('[ACCOUNT_LINKING] 📊 Session details loaded', {
            sessionId,
            tradingAccountId,
            linkingMatchedAccountId,
            linkingStatus,
            linkingConfirmed,
            fileAccountNumber,
            hasTradingAccountInSession: !!session.trading_account,
            page: 'import-user-data'
        });
        
        // Try to get account info from session first (if included by backend)
        let linkedAccountInfo = session.trading_account || null;
        
        // If not in session, fetch from API
        if (!linkedAccountInfo && (linkingMatchedAccountId || tradingAccountId)) {
            const accountId = linkingMatchedAccountId || tradingAccountId;
            try {
                const accountResponse = await fetch(`/api/trading-accounts/${accountId}`);
                if (accountResponse.ok) {
                    const accountData = await accountResponse.json();
                    if (accountData.status === 'success' && accountData.data) {
                        linkedAccountInfo = accountData.data;
                        window.Logger?.info('[ACCOUNT_LINKING] ✅ Linked account details loaded from API', {
                            accountId,
                            accountName: linkedAccountInfo.name,
                            externalAccountNumber: linkedAccountInfo.external_account_number,
                            page: 'import-user-data'
                        });
                    }
                }
            } catch (error) {
                window.Logger?.warn('[ACCOUNT_LINKING] ⚠️ Failed to fetch linked account details', {
                    accountId: linkingMatchedAccountId || tradingAccountId,
                    error: error.message,
                    page: 'import-user-data'
                });
            }
        } else if (linkedAccountInfo) {
            window.Logger?.info('[ACCOUNT_LINKING] ✅ Linked account details loaded from session', {
                accountId: linkedAccountInfo.id,
                accountName: linkedAccountInfo.name,
                externalAccountNumber: linkedAccountInfo.external_account_number,
                page: 'import-user-data'
            });
        }
        
        updateSymbolMetadataCache(summary?.symbol_metadata || session.symbol_metadata);
        
        // Update active session info with account information
        const updates = {
            status: mapSessionStatusToLabel(session.status),
            statusRaw: session.status, // Store raw status for isSessionActive check
            totalRecords: summary.total_records ?? session.total_records ?? activeSessionInfo?.totalRecords ?? 0,
            readyRecords: summary.records_to_import ?? session.imported_records ?? activeSessionInfo?.readyRecords ?? 0,
            skipRecords: summary.records_to_skip ?? session.skipped_records ?? activeSessionInfo?.skipRecords ?? 0,
            missingTickers: Array.isArray(summary.missing_tickers) ? summary.missing_tickers.length : activeSessionInfo?.missingTickers ?? 0,
            duplicateRecords: summary.duplicate_records ?? activeSessionInfo?.duplicateRecords ?? 0,
            existingRecords: summary.existing_records ?? activeSessionInfo?.existingRecords ?? 0,
            provider: session.provider || activeSessionInfo?.provider,
            fileAccountNumber,
            linkingStatus: linkingConfirmed ? 'confirmed' : linkingStatus
        };
        
        // Add account information if available
        if (linkedAccountInfo) {
            updates.accountId = linkedAccountInfo.id;
            updates.accountName = linkedAccountInfo.name;
            updates.externalAccountNumber = linkedAccountInfo.external_account_number;
            setLinkedAccountInfo(linkedAccountInfo);
        } else if (tradingAccountId) {
            updates.accountId = tradingAccountId;
            // Try to get account name from select if available
            const accountSelect = document.getElementById('tradingAccountSelect');
            if (accountSelect) {
                const selectedOption = accountSelect.options[accountSelect.selectedIndex];
                if (selectedOption && selectedOption.text) {
                    updates.accountName = selectedOption.text.trim();
                }
            }
        }
        
        updateActiveSessionInfo(updates);
        
        // Update account detection summary
        updateAccountDetectionSummary(linkingConfirmed ? 'confirmed' : linkingStatus);
        
        window.Logger?.info('[ACCOUNT_LINKING] ✅ Session details updated in UI', {
            sessionId,
            accountId: updates.accountId,
            accountName: updates.accountName,
            page: 'import-user-data'
        });
    } catch (error) {
        window.Logger?.warn?.('[ACCOUNT_LINKING] ⚠️ Failed to fetch existing session details', {
            error: error?.message,
            sessionId,
            page: 'import-user-data'
        });
        if (currentSessionId === sessionId) {
            // IMPORTANT: Don't clear stored session on error - allow retrying/resuming
            // Only clear if session is explicitly invalid or user requests reset
            currentSessionId = null;
            window.currentSessionId = null;
            activeSessionInfo = null;
            updateResetSessionButtonState();
            updateActiveSessionIndicator();
            updateImportModalNavigation();
        }
        // Don't clear stored session on error - allow resuming
        // clearStoredActiveSession(); // REMOVED: Allow resuming after errors
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

async function ensureModalManagerReady(maxWaitMs = 5000) {
    const start = Date.now();

    const isReady = () => window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function';

    if (isReady()) {
        return true;
    }

    while (Date.now() - start < maxWaitMs) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (isReady()) {
            return true;
        }
    }

    window.Logger?.error('[Import Modal] ModalManagerV2 not ready for tickers modal', { page: 'import-user-data' });
    return false;
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

async function ensureTickersModalConfigLoaded(options = {}) {
    const { forceReload = false, timeoutMs = 6000 } = options;

    if (!window.tickersModalConfig && window.__TICKERS_MODAL_CONFIG_SOURCE__) {
        window.tickersModalConfig = window.__TICKERS_MODAL_CONFIG_SOURCE__;
    }

    const isConfigReady = () => Boolean(window.tickersModalConfig && typeof window.tickersModalConfig === 'object');
    if (!forceReload && isConfigReady()) {
        return true;
    }

    if (!forceReload && tickersModalConfigPromise) {
        return tickersModalConfigPromise;
    }

    const manifestEntry = window.PACKAGE_MANIFEST?.modules?.scripts?.find((script) => script.file === 'modal-configs/tickers-config.js');
    const scriptPath = manifestEntry?.file || 'modal-configs/tickers-config.js';
    const versionSuffix = getScriptVersionSuffix('modal-configs/tickers-config.js');

    const appendCacheBuster = (base) => {
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}reload=${Date.now()}`;
    };

    const loadScript = () => {
        let existingScript = document.querySelector('script[data-modal-config="tickers"]')
            || document.querySelector('script[src*="modal-configs/tickers-config.js"]');

        const requiresReload = forceReload || !existingScript || !isConfigReady();

        if (existingScript && requiresReload) {
            existingScript.remove();
            existingScript = null;
        }

        if (!existingScript) {
            const script = document.createElement('script');
            const baseSrc = `scripts/${scriptPath}${versionSuffix || ''}`;
            script.src = requiresReload ? appendCacheBuster(baseSrc) : baseSrc;
            script.async = false;
            script.setAttribute('data-modal-config', 'tickers');
            document.head.appendChild(script);
            return script;
        }

        if (requiresReload) {
            const baseSrc = existingScript.getAttribute('src')?.split('?')[0] || `scripts/${scriptPath}`;
            existingScript.src = appendCacheBuster(`${baseSrc}${versionSuffix || ''}`);
        }

        return existingScript;
    };

    const loaderPromise = (async () => {
        const scriptElement = loadScript();

        return await new Promise((resolve) => {
            const complete = (success) => {
                clearInterval(pollInterval);
                clearTimeout(timeoutId);
                resolve(success);
            };

            const checkReady = () => {
                if (isConfigReady()) {
                    complete(true);
                    return true;
                }
                return false;
            };

            if (checkReady()) {
                return;
            }

            const pollInterval = setInterval(() => {
                checkReady();
            }, 150);

            const timeoutId = setTimeout(() => {
                complete(checkReady());
            }, timeoutMs);

            scriptElement.addEventListener('load', () => {
                checkReady();
            }, { once: true });

            scriptElement.addEventListener('error', () => complete(false), { once: true });
        });
    })();

    tickersModalConfigPromise = loaderPromise;
    const loaded = await tickersModalConfigPromise;
    if (!loaded) {
        tickersModalConfigPromise = null;
        window.Logger?.warn('[Import Modal] Unable to load tickers modal configuration', { page: 'import-user-data' });
    }
    return loaded;
}

async function quickAddTicker(symbol, name, currencyCode = 'USD', metadata = null) {
    const trimmedSymbol = symbol?.trim();
    const normalizedMetadataName = metadata?.company_name?.trim();
    const trimmedName = (name ?? normalizedMetadataName)?.trim();
    if (!trimmedSymbol || !trimmedName) {
        showImportUserDataNotification('נא למלא את כל השדות', 'error');
        return;
    }

    try {
        const currencies = await loadCurrencyCache();
        const currency = currencies[currencyCode.toUpperCase()];
        const currencyId = currency?.id || 1;

        const remarksHtml = buildRichTextFromMetadata(metadata);

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
                remarks: remarksHtml || null,
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
        try {
            syncTickerRemarksEditorToField(document.getElementById('tickersModal'));
        } catch (syncError) {
            window.Logger?.debug?.('[Import Modal] Failed to sync rich text editor before saving ticker', {
                error: syncError?.message
            });
        }

        const result = await saveFn.apply(this, args);

        // Schedule refresh in background - don't block modal closing
        if (currentSessionId) {
            // Use setTimeout to run refresh after modal closes (non-blocking)
            setTimeout(() => {
                try {
                    refreshPreviewData();
                } catch (error) {
                    window.Logger?.warn('[Import Modal] Failed to refresh preview after ticker save', {
                        error: error?.message
                    });
                }
            }, 300); // Small delay to allow modal to close first
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
    
    const modal = getImportModalElement();
    if (!modal) {
        window.Logger.error('[Import Modal] Modal element not found in DOM', { page: 'import-user-data' });
        return;
    }
    
    // Reset state before displaying
    resetImportModal();
    
    // Ensure listeners are initialized once
    setupImportModalEventListeners();
    attachImportModalNavigationListeners(modal);
    
    if (window.ModalNavigationService?.registerModalOpen) {
        const activeEntry = window.ModalNavigationService.getActiveEntry?.();
        const navigationOverrides = {};
        if (activeEntry && activeEntry.modalId === IMPORT_MODAL_ID) {
            navigationOverrides.replaceActive = true;
        } else if (activeEntry) {
            navigationOverrides.parentInstanceId = activeEntry.instanceId;
            navigationOverrides.sourceInfo = {
                modalId: activeEntry.modalId,
                entityType: activeEntry.entityType,
                entityId: activeEntry.entityId,
                instanceId: activeEntry.instanceId
            };
        }
        await registerImportModalNavigation(navigationOverrides);
    } else {
        importNavigationInstanceId = null;
    }
    
    // Show modal using Bootstrap when available
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
        importModalBootstrapInstance = bootstrap.Modal.getInstance(modal);
        if (!importModalBootstrapInstance) {
            importModalBootstrapInstance = new bootstrap.Modal(modal, {
                backdrop: true,
                keyboard: true,
                focus: true
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
    
    // Load accounts
    await loadAccounts();
    
    // Check for active session - simple and direct
    const hasActiveSession = await checkActiveSessionOnModalOpen();
    
    const restoredStep = applyImportModalRestoreState();
    
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
    const initialStep = restoredStep && !Number.isNaN(Number(restoredStep))
        ? Number(restoredStep)
        : 1;
    goToStep(initialStep);
}

/**
 * Close import user data modal
 */
function closeImportUserDataModal() {
    window.Logger.info('[Import Modal] Closing import modal', { page: 'import-user-data' });
    
    const modal = getImportModalElement();
    if (!modal) {
        return;
    }
    
    modal.dataset.importClosing = 'true';
    
    const legacyHide = () => {
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal === 'function') {
            const instance = bootstrap.Modal.getInstance(modal) || importModalBootstrapInstance;
            if (instance) {
                instance.hide();
            } else {
                importModalBootstrapInstance = new bootstrap.Modal(modal, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                importModalBootstrapInstance.hide();
            }
        } else {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
        }
    };
    
    const finalizeClose = () => {
        setTimeout(() => {
            window.refreshDataImportHistory?.();
        }, 250);
        // Just reset modal state - don't clear session here
        // Session state is managed by handleSessionReset() and handleSessionCompletion()
        resetImportModal();
        modal.dataset.importClosing = 'false';
    };
    
    if (window.ModalNavigationService?.goBack && importNavigationInstanceId) {
        window.ModalNavigationService.goBack()
            .then((handled) => {
                if (!handled) {
                    legacyHide();
                }
                finalizeClose();
            })
            .catch((error) => {
                window.Logger?.warn?.('[Import Modal] Failed to close via navigation service', { error: error?.message });
                legacyHide();
                finalizeClose();
            });
        return;
    }
    
    legacyHide();
    finalizeClose();
}

/**
 * Reset import modal state
 */
function resetImportModal() {
    // Reset modal state but preserve session info
    // Session state is managed separately by handleSessionReset() and handleSessionCompletion()
    currentStep = 1;
    selectedFile = null;
    window.selectedFile = null; // Make it global
    activeFilePrecheckRequestId += 1;
    setFilePrecheckStatus('idle', FILE_PRECHECK_STATUS_MESSAGES.idle);
    analysisResults = null;
    previewData = null;
    dataTypeAvailabilityMap = {};
    selectedDataTypeKey = 'account_reconciliation';
    pendingAccountLinking = null;
    accountLinkingModalInstance = null;
    pendingImportModalRestoreState = null;
    importNavigationInstanceId = null;
    accountLinkingNavigationInstanceId = null;
    clearSymbolMetadataCache();
    clearProblemTrackingState();
    problemTrackingSessionId = null;
    
    // Note: currentSessionId, activeSessionInfo, selectedAccount, selectedConnector
    // are NOT cleared here - they are managed by session management functions
    if (window.destroyRichTextEditor) {
        try {
            window.destroyRichTextEditor(TICKER_REMARKS_EDITOR_ID);
        } catch (editorError) {
            window.Logger?.debug?.('[Import Modal] Failed to destroy ticker remarks editor during reset', {
                error: editorError?.message
            });
        }
    }
    
    // Reset form elements
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
        window.clearFieldValidation?.(fileInput);
    }
    
    const accountSelect = document.getElementById('tradingAccountSelect');
    if (accountSelect) {
        accountSelect.value = '';
        window.clearFieldValidation?.(accountSelect);
    }
    
    const connectorSelect = document.getElementById('connectorSelect');
    if (connectorSelect) {
        connectorSelect.value = '';
        window.clearFieldValidation?.(connectorSelect);
    }
    
    // Reset UI elements
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        setElementDisplay(fileInfo, 'none');
    }
    
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        setElementDisplay(dropZone, 'block');
    }
    
    const dataTypeSelect = document.getElementById('importDataTypeSelect');
    if (dataTypeSelect) {
        populateDataTypeSelect(dataTypeSelect);
        dataTypeSelect.disabled = false;
        dataTypeSelect.value = selectedDataTypeKey;
    }
    updateSelectedDataTypeInfo();
    
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
    
    setAnalysisLoadingState(false);
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
        setElementDisplay(problemResolutionSection, 'none');
    }

    const analysisActions = document.getElementById('analysisStepActions');
    const continueBtn = document.getElementById('analysisContinueBtn');
    if (analysisActions) {
        setElementDisplay(analysisActions, 'none');
    }
    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.setAttribute('aria-disabled', 'true');
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
    const targetStep = Number(step);
    if (Number.isNaN(targetStep)) {
        window.Logger.warn('[Import Modal] Invalid step navigation request', { requestedStep: step, page: 'import-user-data' });
        return;
    }

    if (targetStep === 3) {
        setAnalysisLoadingState(true, 'מכין תצוגה מקדימה...', 85);
    }

    window.Logger.info('[Import Modal] Navigating to step', { 
        from: currentStep, 
        to: targetStep, 
        page: 'import-user-data' 
    });
    
    currentStep = targetStep;

    if (typeof setAnalysisLoadingState === 'function' && targetStep !== 2) {
        setAnalysisLoadingState(false);
    }
    
    // Update step indicators
    updateStepIndicators();
    
    // Show step content
    showStepContent(step);
    
    // Load step-specific content
    if (targetStep === 1) {
        window.Logger.debug('[Import Modal] Loading step 1 content', { page: 'import-user-data' });
        // loadStep1Content now handles fetching and displaying active session info
        loadStep1Content().catch(error => {
            window.Logger?.warn?.('[Import Modal] Failed to load step 1 content', { error: error?.message });
        });
        // Note: updateActiveSessionIndicator is called inside loadStep1Content
    } else if (targetStep === 2) {
        window.Logger.debug('[Import Modal] Loading step 2 content (Analysis + Problems)', { page: 'import-user-data' });
        loadStep2Content();
        // loadProblemResolution will be called after analysis is complete
                    } else if (targetStep === 3) {
                        window.Logger.debug('[Import Modal] Loading step 3 content (Preview + Confirmation)', { page: 'import-user-data' });
                        loadPreviewData();
                    }
    
    // Process buttons in the modal after step change
    // This ensures all buttons are properly handled by the centralized button system
    const modal = document.getElementById('importUserDataModal');
    if (modal) {
        // Get the current visible step container
        const currentStepElement = modal.querySelector(`.import-step[data-step="${targetStep}"]`);
        if (currentStepElement) {
            if (window.processButtons) {
                window.processButtons(currentStepElement);
            } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
                window.advancedButtonSystem.processButtons(currentStepElement);
            }
            window.Logger.debug('[Import Modal] Buttons processed for step', { 
                targetStep, 
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
                step: targetStep, 
                page: 'import-user-data' 
            });
        }
    }
    
    window.Logger.info('[Import Modal] Step navigation completed', { 
        currentStep, 
        page: 'import-user-data' 
    });
    
    const headerActions = document.getElementById('stepsHeaderPrimaryActions');
    if (headerActions) {
        if (window.processButtons) {
            window.processButtons(headerActions);
        } else if (window.advancedButtonSystem && typeof window.advancedButtonSystem.processButtons === 'function') {
            window.advancedButtonSystem.processButtons(headerActions);
        }
    }
    
    updateImportModalNavigation();
}

/**
 * Update step indicators
 */
function updateStepIndicators() {
    const indicators = document.querySelectorAll('.import-steps-indicator .step');
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        indicator.classList.remove('active', 'completed');
        const numberEl = indicator.querySelector('.step-number');
        const labelEl = indicator.querySelector('.step-label');
        if (numberEl) {
            numberEl.classList.remove('active', 'completed');
        }
        if (labelEl) {
            labelEl.classList.remove('active', 'completed');
        }
        if (stepNumber < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
            if (numberEl) numberEl.classList.add('completed');
            if (labelEl) labelEl.classList.add('completed');
        } else if (stepNumber === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
            if (numberEl) numberEl.classList.add('active');
            if (labelEl) labelEl.classList.add('active');
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
        setElementDisplay(stepElement, 'none');
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
            setElementDisplay(problemSection, 'block');
        }
                    } else if (step === 3) {
                        currentStepContent = document.getElementById('step-preview');
                    }
    
    if (currentStepContent) {
        setElementDisplay(currentStepContent, 'block');
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

    updateHeaderActions(step);
}

/**
 * Load step 1 content (File & Account Selection)
 */
async function loadStep1Content() {
    // The HTML content is already in the DOM, just need to load accounts
    // Event listeners are already set up during initialization
    initializeDataTypeSelector();
    await loadAccounts();
    
    // CRITICAL: Fetch and display active session info when loading step 1
    // This ensures the button and session details are synchronized
    if (!currentSessionId || !activeSessionInfo) {
        await fetchLatestActiveSession();
    }
    
    // Update UI with session info
    updateActiveSessionIndicator();
    updateResetSessionButtonState();
    updateAnalyzeButton();
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
    attachImportModalNavigationListeners(modal);
    attachAccountLinkingNavigationListeners(getAccountLinkingModalElement());
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    window.Logger.debug('[Import Modal] Account select element found', { 
        exists: !!accountSelect, 
        id: accountSelect?.id,
        page: 'import-user-data' 
    });
    if (accountSelect) {
        accountSelect.addEventListener('change', handleAccountSelect);
        window.Logger.info('[Import Modal] Account select event listener added successfully', { page: 'import-user-data' });
        if (window.setupFieldValidation) {
            window.setupFieldValidation(accountSelect, {
                required: true,
                customValidation: (value) => (value ? true : 'חובה לבחור חשבון מסחר')
            });
        }
    } else {
        window.Logger.debug('[Import Modal] Account select not rendered (auto-detect account flow active)', { page: 'import-user-data' });
    }
    
    // Connector select - look INSIDE the modal
    const connectorSelect = modal?.querySelector('#connectorSelect');
    if (connectorSelect) {
        connectorSelect.addEventListener('change', handleConnectorSelect);
        window.Logger.debug('[Import Modal] Connector select event listener added', { page: 'import-user-data' });
        if (window.setupFieldValidation) {
            window.setupFieldValidation(connectorSelect, {
                required: true,
                customValidation: (value) => (value ? true : 'חובה לבחור ספק נתונים')
            });
        }
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

    if (modal && modal.dataset.backDelegationAttached !== 'true') {
        modal.addEventListener('click', (event) => {
            const trigger = event.target?.closest?.('[data-import-back-step]');
            if (!trigger || !modal.contains(trigger)) {
                return;
            }
            const targetStep = Number(trigger.getAttribute('data-import-back-step'));
            event?.preventDefault?.();
            event?.stopPropagation?.();
            goToStep(Number.isNaN(targetStep) ? 1 : targetStep);
        });
        modal.dataset.backDelegationAttached = 'true';
    }
    
    if (modal && modal.dataset.hideDelegationAttached !== 'true') {
        modal.addEventListener('hide.bs.modal', (event) => {
            if (modal.dataset.importClosing === 'true') {
                modal.dataset.importClosing = 'false';
                return;
            }
            event?.preventDefault?.();
            closeImportUserDataModal();
        });
        modal.dataset.hideDelegationAttached = 'true';
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

function updateHeaderActions(step) {
    const uploadActions = document.getElementById('uploadStepActions');
    if (uploadActions) {
        setElementDisplay(uploadActions, step === 1 ? 'flex' : 'none');
    }

    const analysisActions = document.getElementById('analysisStepActions');
    if (analysisActions) {
        setElementDisplay(analysisActions, step === 2 ? 'flex' : 'none');
    }

    const previewActions = document.getElementById('previewStepActions');
    if (previewActions) {
        setElementDisplay(previewActions, step === 3 ? 'flex' : 'none');
    }
}

/**
 * Load step 2 content (File Analysis)
 */
function loadStep2Content() {
    // The HTML content is already in the DOM, just need to display analysis results
    if (analysisResults) {
        displayAnalysisResults(analysisResults);
    }
}

/**
 * Load confirmation data (Step 5)
 */

async function reanalyseSessionForTask(taskKey, loadingMessage = 'טוען ומעבד נתונים...') {
    window.Logger?.info('[ACCOUNT_LINKING] 🔄 Starting session reanalysis', {
        taskKey,
        currentSessionId,
        loadingMessage,
        page: 'import-user-data'
    });
    
    if (!currentSessionId) {
        window.Logger?.error('[ACCOUNT_LINKING] ❌ No active session ID for reanalysis', { page: 'import-user-data' });
        throw new Error('לא נמצא מזהה סשן פעיל');
    }

    const encodedTask = encodeURIComponent(taskKey);
    setAnalysisLoadingState(true, loadingMessage, 90);

    try {
        window.Logger?.info('[ACCOUNT_LINKING] 📤 Sending reanalysis request', {
            sessionId: currentSessionId,
            taskType: encodedTask,
            page: 'import-user-data'
        });
        
        const analysisResponse = await fetch(`/api/user-data-import/session/${currentSessionId}/analyze?task_type=${encodedTask}`);
        
        window.Logger?.info('[ACCOUNT_LINKING] 📥 Received reanalysis response', {
            status: analysisResponse.status,
            ok: analysisResponse.ok,
            page: 'import-user-data'
        });
        
        const analysisJson = await analysisResponse.json();
        
        window.Logger?.info('[ACCOUNT_LINKING] 📊 Reanalysis response data', {
            success: analysisJson.success,
            status: analysisJson.status,
            hasAnalysisResults: !!analysisJson.analysis_results,
            page: 'import-user-data'
        });

        if (handleAccountLinkingBlockingResponse(analysisJson, 'reanalyze')) {
            setAnalysisLoadingState(false);
            return;
        }
        if (!(analysisJson.success || analysisJson.status === 'success')) {
            const message = getApiErrorMessage(analysisJson, 'ניתוח הקובץ נכשל');
            throw new Error(message);
        }

        analysisResults = analysisJson.analysis_results;
        const responseTask = analysisResults?.task_type || taskKey;
        selectedDataTypeKey = responseTask;
        updateActiveSessionFromAnalysis(analysisResults);
        displayAnalysisResults(analysisResults);
        setAnalysisLoadingState(true, 'מעדכן תוצאות ניתוח...', 92);

        const previewResponse = await fetch(`/api/user-data-import/session/${currentSessionId}/preview?task_type=${encodedTask}`);
        const previewJson = await previewResponse.json();

        if (handleAccountLinkingBlockingResponse(previewJson, 'reanalyze-preview')) {
            setAnalysisLoadingState(false);
            return;
        }
        if (!(previewJson.success || previewJson.status === 'success')) {
            const message = getApiErrorMessage(previewJson, 'טעינת התצוגה המקדימה נכשלה');
            throw new Error(message);
        }

        previewData = previewJson.preview_data;
        setAnalysisLoadingState(true, 'מכין תצוגה מקדימה...', 97);
        displayProblemResolutionDetailed(previewData);
        displayPreviewData(previewData);
        displayConfirmationData(analysisResults, previewData);
        updateActiveSessionFromPreview(previewData);
    } finally {
        setAnalysisLoadingState(false);
    }
}

/**
 * Clear problem sections
 */
function clearProblemSections() {
    const sections = [
        'missingTickersSection',
        'withinFileDuplicatesSection', 
        'existingRecordsSection',
        'cashflowMissingAccountsSection',
        'cashflowCurrencyIssuesSection',
        'accountMissingAccountsSection',
        'accountCurrencyMismatchesSection',
        'accountEntitlementWarningsSection',
        'accountImportWarningsSection',
        'accountExistingEntriesSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            setElementDisplay(section, 'none');
        }
    });
    
    const containers = [
        'missingTickersContainer',
        'missingAccountsContainer',
        'missingCashflowAccountsContainer'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    });
}

function initializeButtonsForProblemTable(tableElement) {
    if (!tableElement) {
        return;
    }

    const target = tableElement.querySelector('tbody') || tableElement;
    const processButtonsFn = window.ButtonSystem?.processButtons
        ? window.ButtonSystem.processButtons.bind(window.ButtonSystem)
        : (typeof window.processButtons === 'function' ? window.processButtons : null);
    const initializeButtonsFn = window.ButtonSystem?.initializeButtons
        ? window.ButtonSystem.initializeButtons.bind(window.ButtonSystem)
        : (typeof window.initializeButtons === 'function' ? window.initializeButtons : null);

    const runButtonProcessing = () => {
        try {
            if (processButtonsFn) {
                processButtonsFn(target);
            } else if (initializeButtonsFn) {
                initializeButtonsFn(target);
            }
        } catch (error) {
            window.Logger?.debug?.('[Import Modal] Failed to initialize buttons for problem table', {
                tableId: tableElement.id,
                error: error?.message
            });
        }
    };

    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(runButtonProcessing);
    } else {
        runButtonProcessing();
    }
}

function markProblemTableReady(tableId) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        return;
    }
    tableElement.setAttribute('data-table-initialized', 'true');
    initializeButtonsForProblemTable(tableElement);
}

function releaseProblemTables() {
    const problemTableIds = [
        'missingTickersTable',
        'cashflowMissingAccountsTable',
        'cashflowCurrencyIssuesTable',
        'accountMissingAccountsTable',
        'accountCurrencyMismatchesTable',
        'accountEntitlementWarningsTable',
        'accountMissingDocumentsTable',
        'existingRecordsTable',
        'withinFileDuplicatesTable'
    ];

    problemTableIds.forEach((tableId) => {
        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            return;
        }

        const tableType = tableElement.getAttribute('data-table-type');
        const initialized = tableElement.getAttribute('data-table-initialized');

        if (!tableType) {
            return;
        }

        try {
            if (window.TableDataRegistry?.clear) {
                window.TableDataRegistry.clear(tableType);
            }
            if (window.TableRegistry?.releaseTable) {
                window.TableRegistry.releaseTable(tableType);
                window.Logger?.debug?.('[Import Modal] Released table via TableRegistry', {
                    tableId,
                    tableType
                });
            } else if (window.UnifiedTableSystem?.releaseTable) {
                window.UnifiedTableSystem.releaseTable(tableType);
                window.Logger?.debug?.('[Import Modal] Released table via UnifiedTableSystem', {
                    tableId,
                    tableType
                });
            }
        } catch (releaseError) {
            window.Logger?.debug?.('[Import Modal] Failed to release table', {
                tableId,
                tableType,
                error: releaseError?.message
            });
        }

        if (initialized) {
            tableElement.setAttribute('data-table-initialized', 'false');
        }

        const tbody = tableElement.querySelector('tbody');
        if (tbody) {
            const columnCount = tableElement.querySelectorAll('thead th').length || 1;
            tbody.innerHTML = renderTableEmptyRow(columnCount, 'טוען נתונים...');
        }
    });
}

/**
 * Display existing records
 */
function displayExistingRecords(existingRecords) {
    const section = document.getElementById('existingRecordsSection');
    const tableBody = document.getElementById('existingRecordsTableBody');
    
    if (!section || !tableBody) return;
    
    const tracking = trackProblemStatus(
        'existingRecords',
        existingRecords,
        (record) => getDuplicateIdentifier(record, 'existing'),
        (record) => buildDuplicateResolvedMeta(record, 'רשימה קיימת')
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(7, 'אין רשומות קיימות למעקב.');
        markProblemTableReady('existingRecordsTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map((entry) => renderDuplicateRow(entry.item, 'existing_record', entry.index))
        .join('');
    markProblemTableReady('existingRecordsTable');
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
                <button class="btn btn-secondary" onclick="proceedToPreviewFromProblems()">
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
        setElementDisplay(fileInfo, 'block');
        
        // Hide drop zone
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            setElementDisplay(dropZone, 'none');
        }
        
        window.Logger.debug('[Import Modal] File info updated in UI', { page: 'import-user-data' });
        } else {
        window.Logger.error('File info elements not found:', { fileInfo, fileName, fileSize });
    }
    
    // Enable analyze button if account is also selected
    validateFileSelection({ showNotification: false });
    updateAnalyzeButton();
    triggerFilePrecheckIfReady({ file });
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
    
    let analyzeBtn = modal.querySelector('#analyzeBtn');
    if (!analyzeBtn) {
        analyzeBtn = modal.querySelector('[data-onclick="analyzeFile()"]');
    }
    if (!analyzeBtn) {
        window.Logger.warn('[Import Modal] Analyze button not found in modal', { page: 'import-user-data' });
        return;
    }

        // Check actual DOM values - more reliable than variables
        // Look for selects INSIDE the modal to avoid conflicts
        const connectorSelect = modal.querySelector('#connectorSelect');
    const dataTypeSelect = modal.querySelector('#importDataTypeSelect');
    const connectorValue = connectorSelect?.value || getSelectedConnectorValue() || '';
    const dataTypeValue = dataTypeSelect?.value || selectedDataTypeKey || '';
        
        // Check both local and global selectedFile variables
        const currentSelectedFile = selectedFile || window.selectedFile;
        const precheckPassed = getFilePrecheckStatus() === 'success';
    const dataTypeValid = Boolean(dataTypeValue && IMPORT_DATA_TYPE_DEFINITIONS[dataTypeValue]);
    
    // CRITICAL: Disable analyze button if there's an active session
    // User must resume or reset the active session before starting a new one
    const statusToCheck = activeSessionInfo?.statusRaw || activeSessionInfo?.status;
    const hasActiveSession = currentSessionId && activeSessionInfo && isSessionActive(statusToCheck);
    
    const allFieldsFilled = Boolean(currentSelectedFile && connectorValue && dataTypeValid && precheckPassed) && !hasActiveSession;
    
        const debugInfo = {
            selectedFile: !!currentSelectedFile,
            selectedFileName: currentSelectedFile?.name,
            connectorSelectExists: !!connectorSelect,
            connectorValue: connectorValue,
        dataTypeValue,
        dataTypeValid,
        precheckPassed,
        hasActiveSession,
            allFieldsFilled,
            page: 'import-user-data'
    };
    
    window.Logger.debug('[Import Modal] Analyze button state check', debugInfo);
        
        if (allFieldsFilled) {
        analyzeBtn.disabled = false;
        analyzeBtn.setAttribute('aria-disabled', 'false');
            window.Logger.info('[Import Modal] Analyze button enabled', { 
                connectorValue: connectorValue,
                page: 'import-user-data' 
            });
        } else {
        analyzeBtn.disabled = true;
        analyzeBtn.setAttribute('aria-disabled', 'true');
        window.Logger.debug('[Import Modal] Analyze button disabled - missing requirements', debugInfo);
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) {
        return '0 Bytes';
    }

    const UNITS = ['Bytes', 'KB', 'MB', 'GB'];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, unitIndex);
    return `${parseFloat(value.toFixed(2))} ${UNITS[unitIndex]}`;
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
        setElementDisplay(fileInfo, 'none');
    }
    if (dropZone) {
        setElementDisplay(dropZone, 'block');
    }
    
    if (window.clearFieldValidation) {
        window.clearFieldValidation(fileInput);
    }
    
    // Update analyze button
    validateFileSelection({ showNotification: false });
    updateAnalyzeButton();
    activeFilePrecheckRequestId += 1;
    setFilePrecheckStatus('idle', FILE_PRECHECK_STATUS_MESSAGES.idle);
}

/**
 * Handle account selection
 */
function handleAccountSelect() {
    showImportUserDataNotification('בחירת החשבון מתבצעת דרך תהליך שיוך אוטומטי.', 'info');
}

/**
 * Handle connector selection
 */
function handleConnectorSelect(event) {
    const modal = document.getElementById('importUserDataModal');
    const target = event?.target || modal?.querySelector('#connectorSelect');
    if (isAccountSelectionLocked() && activeSessionInfo?.connector
        && target?.value && target.value !== activeSessionInfo.connector) {
        if (target) {
            setSelectValue(target, activeSessionInfo.connector);
        }
        showImportUserDataNotification('סשן פעיל ניתן להריץ רק עם ספק הנתונים המקורי. לא ניתן להחליף ספק לפני איפוס.', 'warning');
        return;
    }
    selectedConnector = target?.value;
    window.Logger.info('[Import Modal] Connector selected', { 
        connector: selectedConnector,
        value: target?.value,
        page: 'import-user-data' 
    });
    
    // Validate connector selection using central validation system
    validateConnectorSelection({ showNotification: false });
    triggerFilePrecheckIfReady();
    
    // Wait a tick to ensure DOM is updated, then update button
    requestAnimationFrame(() => {
        updateAnalyzeButton();
    });
    
    updateImportModalNavigation();
    syncAccountAndConnectorLockState();
}

/**
 * Validate connector selection using central validation system
 */
function validateConnectorSelection(options = {}) {
    const { showNotification = false, touch = false } = options;
    const connectorSelect = document.getElementById('connectorSelect');
    if (!connectorSelect) {
        window.Logger.error('[Import Modal] connectorSelect element not found', { page: 'import-user-data' });
        return false;
    }
    
    const value = connectorSelect.value;
    if (!value) {
        if (touch) {
            const validationResult = window.validateSelectField(connectorSelect, {
                required: true,
                customValidation: () => 'חובה לבחור ספק נתונים'
            });
            if (validationResult !== true) {
                window.Logger.warn('[Import Modal] Connector validation failed', { error: validationResult, page: 'import-user-data' });
                if (showNotification) {
                    showImportUserDataNotification(validationResult, 'error', 'שגיאה');
                }
            }
        } else if (window.clearFieldValidation) {
            window.clearFieldValidation(connectorSelect);
        }
        return false;
    }
    
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
        return true;
    }

        window.Logger.warn('[Import Modal] Connector validation failed', { error: validationResult, page: 'import-user-data' });
    if (touch || showNotification) {
        showImportUserDataNotification(validationResult, 'error', 'שגיאה');
    }
    return false;
}

/**
 * Validate all required fields before proceeding
 */
function validateAccountSelection(options = {}) {
    const { showNotification = false } = options;
    const hasLinkedAccount = Boolean(
        linkedAccountInfo?.id
        || pendingAccountLinking?.status === 'pending_confirmation'
    );
    if (!hasLinkedAccount && showNotification) {
        showImportUserDataNotification('אנא השלם את תהליך שיוך החשבון לפני המשך הייבוא.', 'error');
    }
    return hasLinkedAccount;
}

function validateFileSelection(options = {}) {
    const { showNotification = false, touch = false } = options;
    const fileInput = document.getElementById('fileInput');
    const currentSelectedFile = selectedFile || window.selectedFile;

    if (!fileInput) {
        return !!currentSelectedFile;
    }

    if (!currentSelectedFile) {
        if (touch) {
            const errorMessage = 'חובה לבחור קובץ CSV';
            window.Logger.warn('[Import Modal] File validation failed - no file selected', { page: 'import-user-data' });
            if (window.showFieldError) {
                window.showFieldError(fileInput, errorMessage);
            }
            if (showNotification) {
                showImportUserDataNotification(errorMessage, 'error', 'שגיאה');
            }
        } else if (window.clearFieldValidation) {
            window.clearFieldValidation(fileInput);
        }
        return false;
    }

    window.showFieldSuccess?.(fileInput);
                return true;
            }

function validateAllRequiredFields(options = {}) {
    const { showNotifications = true } = options;
    const errors = [];

    const fileValid = validateFileSelection({ showNotification: false, touch: true });
    if (!fileValid) {
        errors.push('חובה לבחור קובץ CSV');
    }

    const connectorValid = validateConnectorSelection({ showNotification: false, touch: true });
    if (!connectorValid) {
        errors.push('חובה לבחור ספק נתונים');
    }

    const dataTypeSelect = document.getElementById('importDataTypeSelect');
    const dataTypeValue = dataTypeSelect?.value || selectedDataTypeKey || '';
    const dataTypeValid = Boolean(dataTypeValue && IMPORT_DATA_TYPE_DEFINITIONS[dataTypeValue]);
    if (!dataTypeValid) {
        errors.push('חובה לבחור תהליך ייבוא');
        if (dataTypeSelect && window.showFieldError) {
            window.showFieldError(dataTypeSelect, 'בחר תהליך ייבוא');
        }
    } else if (dataTypeSelect && window.showFieldSuccess) {
        window.showFieldSuccess(dataTypeSelect);
    }

    const precheckPassed = getFilePrecheckStatus() === 'success';
    if (!precheckPassed) {
        errors.push('הקובץ חייב לעבור בדיקה ראשונית לפני המשך הניתוח');
    }

    const isValid = fileValid && connectorValid && dataTypeValid && precheckPassed;

    if (!isValid && showNotifications) {
        const uniqueErrors = [...new Set(errors.filter(Boolean))];
        const message = uniqueErrors.length ? uniqueErrors.join('\n') : 'אנא מלא את כל השדות החובה';
        showImportUserDataNotification(message, 'error', 'שגיאה');
    }
    
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
        window.Logger.debug('[Import Modal] Account select not present in modal, skipping legacy account load', { page: 'import-user-data' });
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
            validateAccountSelection({ showNotification: false });
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
        window.Logger.debug('[Import Modal] Account select not present in modal (fallback)', { page: 'import-user-data' });
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
            validateAccountSelection({ showNotification: false });
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
    if (!validateAllRequiredFields({ showNotifications: true })) {
        window.Logger.warn('[Import Modal] Cannot proceed - validation failed', { page: 'import-user-data' });
        return;
    }
    
    window.Logger.info('[Import Modal] Starting file analysis', { sessionId: currentSessionId, page: 'import-user-data' });
    
    // Get actual values from DOM - more reliable than variables
    const modal = document.getElementById('importUserDataModal');
    const connectorSelect = modal?.querySelector('#connectorSelect');
    const dataTypeSelect = modal?.querySelector('#importDataTypeSelect');
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    
    const connectorValue = connectorSelect?.value || getSelectedConnectorValue();
    const dataTypeValue = dataTypeSelect?.value || selectedDataTypeKey || 'executions';
    const accountValue = accountSelect?.value || linkedAccountInfo?.id || activeSessionInfo?.accountId || null;
    
    // Validate values
    if (!selectedFile || !connectorValue) {
        window.Logger.error('[Import Modal] Missing required values', {
            selectedFile: !!selectedFile,
            connectorValue: connectorValue,
            page: 'import-user-data'
        });
        showImportUserDataNotification('אנא מלא את כל השדות הנדרשים', 'error');
        return;
    }
    
    window.Logger.info('[Import Modal] Analysis starting with values', {
        selectedFile: selectedFile?.name,
        connectorValue: connectorValue,
        page: 'import-user-data'
    });
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('connector_type', connectorValue);
    selectedDataTypeKey = dataTypeValue;
    formData.append('task_type', selectedDataTypeKey);
    const inferredAccountId = linkedAccountInfo?.id || activeSessionInfo?.accountId || null;
    if (inferredAccountId) {
        formData.append('trading_account_id', inferredAccountId);
    }
    
    // Debug: Log what's being sent
    window.Logger.debug('[Import Modal] FormData contents', {
        hasFile: formData.has('file'),
        fileSize: selectedFile?.size,
        trading_account_id: formData.get('trading_account_id'),
        connector_type: formData.get('connector_type'),
        page: 'import-user-data'
    });
    
    setAnalysisLoadingState(true, 'מעלה את הקובץ ומתחיל ניתוח...', 10);
    
    fetch('/api/user-data-import/upload', {
            method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        setAnalysisLoadingState(true, 'מעבד את הנתונים שהתקבלו...', 55);
        if (handleAccountLinkingBlockingResponse(data, 'upload')) {
            currentSessionId = data.session_id || currentSessionId;
            window.currentSessionId = currentSessionId;
            updateImportModalNavigation();
            setAnalysisLoadingState(false);
            return;
        }
        if (data.success || data.status === 'success') {
            window.Logger.info('[Import Modal] File analysis completed', { data, page: 'import-user-data' });
            currentSessionId = data.session_id;
            window.currentSessionId = data.session_id; // Make it global
            updateImportModalNavigation();
            analysisResults = data.analysis_results;
            const dataTypeSelect = document.getElementById('importDataTypeSelect');
            if (!analysisResults?.task_type && dataTypeSelect?.dataset?.serverValue) {
                selectedDataTypeKey = dataTypeSelect.dataset.serverValue;
            }
            if (analysisResults?.task_type) {
                selectedDataTypeKey = analysisResults.task_type;
            }
            if (dataTypeSelect) {
                dataTypeSelect.value = selectedDataTypeKey;
                dataTypeSelect.dataset.serverValue = selectedDataTypeKey;
            }
            updateSelectedDataTypeInfo();
            updateSymbolMetadataCache(data.analysis_results?.symbol_metadata);
            
            updateActiveSessionInfo({
                status: 'ניתוח הושלם',
                provider: data.provider,
                fileName: selectedFile?.name,
                fileSize: selectedFile?.size ?? null,
                accountName: accountSelect?.selectedOptions?.[0]?.text?.trim() || linkedAccountInfo?.name || activeSessionInfo?.accountName || null,
                accountId: accountValue,
                connector: connectorValue,
                connectorName: connectorSelect?.selectedOptions?.[0]?.text?.trim(),
                taskType: selectedDataTypeKey
            });
            updateActiveSessionFromAnalysis(data.analysis_results);
            updateResetSessionButtonState();
            
            // Display results
            displayAnalysisResults(data.analysis_results);
            
            // Go to next step immediately (no artificial delay)
            goToStep(2);
    } else {
            showImportUserDataNotification(`שגיאה בניתוח הקובץ: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        setAnalysisLoadingState(false);
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
        const taskType = (results?.task_type || selectedDataTypeKey || 'executions').toLowerCase();
        updateSymbolMetadataCache(results?.symbol_metadata);

        const dataTypeSelect = document.getElementById('importDataTypeSelect');
        if (dataTypeSelect && selectedDataTypeKey) {
            dataTypeSelect.value = selectedDataTypeKey;
        }

        if (taskType === 'cashflows') {
            renderCashflowAnalysisSummary(results);
        } else if (taskType === 'account_reconciliation') {
            renderAccountReconciliationAnalysisSummary(results);
        } else if (taskType === 'portfolio_positions') {
            renderPortfolioAnalysisSummary(results);
        } else if (taskType === 'taxes_and_fx') {
            renderTaxFxAnalysisSummary(results);
        } else {
            renderExecutionAnalysisSummary(results);
        }

        updateActiveSessionFromAnalysis(results);
        const availability = detectAvailableDataTypes(results);
        updateDataTypeAvailability(availability);

        const stepActions = document.getElementById('analysisStepActions');
        const continueBtn = document.getElementById('analysisContinueBtn');
        if (stepActions && continueBtn) {
            setElementDisplay(stepActions, 'flex');
            continueBtn.disabled = false;
            continueBtn.setAttribute('aria-disabled', 'false');
        }

        // Auto-load problem resolution data after analysis completes
        loadProblemResolution(true);
    } catch (error) {
        window.Logger.error('[Import Modal] Error displaying analysis results', { error: error.message, stack: error.stack, page: 'import-user-data' });
    }
}

function setAnalysisCardValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function renderExecutionAnalysisSummary(results) {
    clearCashflowAnalysisSections();
    setAnalysisCardLabel('missingTickersCount', 'טיקרים חסרים');
    setAnalysisCardLabel('missingTickerRecords', 'רשומות עם טיקר חסר');

    const totalRecords = results.total_records || 0;
    const missingTickersCountValue = Array.isArray(results.missing_tickers)
        ? results.missing_tickers.length
        : (results.missing_tickers_count || 0);
        const missingTickerRecordsCount = results.missing_ticker_records || 0;
    const cleanRecords = results.clean_records || results.valid_records || 0;
    const actualValidRecords = Math.max(0, cleanRecords - missingTickerRecordsCount);

    setAnalysisCardValue('totalRecords', totalRecords);
    setAnalysisCardValue('validRecords', actualValidRecords);
    setAnalysisCardValue('invalidRecords', results.invalid_records || 0);
    setAnalysisCardValue('duplicateRecords', results.duplicate_records || 0);
    setAnalysisCardValue('missingTickersCount', missingTickersCountValue);
    setAnalysisCardValue('missingTickerRecords', missingTickerRecordsCount);
    setAnalysisCardValue('existingRecords', results.existing_records || 0);
}

function renderCashflowAnalysisSummary(results) {
    clearCashflowAnalysisSections();
    setAnalysisCardLabel('missingTickersCount', 'חשבונות חסרים');
    setAnalysisCardLabel('missingTickerRecords', 'בעיות מטבע');

    const summary = results.cashflow_summary || {};
    const typeStats = results.cashflow_type_stats || summary.type_stats || {};
    const totalsByType = summary.totals_by_type || {};
    const totalsByCurrency = summary.totals_by_currency || {};
    const missingAccountDetails = results.missing_account_details || summary.missing_account_details || [];
    const currencyIssues = results.currency_issues || summary.currency_issues || [];
    const issuesByType = results.cashflow_issues_by_type || results.issues_by_type || {};

    const aggregatedValid = Object.values(typeStats).reduce(
        (acc, stats) => acc + safeToNumber(stats.valid_records ?? Math.max(0, safeToNumber(stats.total_records) - safeToNumber(stats.invalid_records))),
        0
    );
    const aggregatedInvalid = Object.values(typeStats).reduce(
        (acc, stats) => acc + safeToNumber(stats.invalid_records),
        0
    );
    const totalRecords = safeToNumber(
        results.total_records ??
        summary.record_count ??
        (aggregatedValid + aggregatedInvalid)
    );
    const validRecords = aggregatedValid || safeToNumber(results.valid_records ?? summary.valid_records);
    const invalidRecords = aggregatedInvalid || safeToNumber(results.invalid_records ?? summary.invalid_records);
    const duplicateRecords = safeToNumber(results.duplicate_records ?? summary.duplicate_records);
    const existingRecords = safeToNumber(results.existing_records ?? summary.existing_records);

    setAnalysisCardValue('totalRecords', totalRecords);
    setAnalysisCardValue('validRecords', validRecords);
    setAnalysisCardValue('invalidRecords', invalidRecords);
    setAnalysisCardValue('duplicateRecords', duplicateRecords);
    setAnalysisCardValue('missingTickersCount', missingAccountDetails.length || 0);
    setAnalysisCardValue('missingTickerRecords', currencyIssues.length || 0);
    setAnalysisCardValue('existingRecords', existingRecords);

    renderCashflowTypeCards(typeStats, totalsByType);
    renderCashflowCurrencyCards(totalsByCurrency);
    
    // Render summary comparison if available
    const summaryComparison = results.summary?.summary_comparison || results.summary_comparison || {};
    renderCashflowSummaryComparison(summaryComparison);
    
    renderCashflowIssuesSummary({
        issuesByType,
        missingAccountDetails,
        currencyIssues
    });
}

function renderAccountReconciliationAnalysisSummary(results) {
    clearCashflowAnalysisSections();
    setAnalysisCardLabel('missingTickersCount', 'חשבונות חסרים');
    setAnalysisCardLabel('missingTickerRecords', 'הרשאות חסרות');

    const issues = results.account_validation_results
        || results.reconciliation_summary
        || results.summary
        || {};
    const detectedTasks = results.detected_tasks
        || results.summary?.detected_tasks
        || results.summary_data?.detected_tasks
        || {};

    const missingAccounts = results.missing_accounts || issues.missing_accounts || [];
    const baseCurrencyMismatches = results.base_currency_mismatches || issues.base_currency_mismatches || [];
    const entitlementWarnings = results.entitlement_warnings || issues.entitlement_warnings || [];
    const missingDocuments = results.missing_documents_report || issues.missing_documents_report || [];

    const detectedAccounts = Number(
        detectedTasks.account_reconciliation?.records ??
        results.accounts_detected ??
        results.valid_records ??
        0
    );

    const totalRecords = results.total_records || detectedAccounts || missingAccounts.length || 0;
    const validRecords = detectedAccounts || (totalRecords - (missingAccounts.length + baseCurrencyMismatches.length));
    const invalidRecords = results.invalid_records || missingDocuments.length || 0;

    setAnalysisCardValue('totalRecords', totalRecords);
    setAnalysisCardValue('validRecords', validRecords);
    setAnalysisCardValue('invalidRecords', invalidRecords);
    setAnalysisCardValue('duplicateRecords', baseCurrencyMismatches.length || 0);
    setAnalysisCardValue('missingTickersCount', missingAccounts.length || 0);
    setAnalysisCardValue('missingTickerRecords', entitlementWarnings.length || 0);
    setAnalysisCardValue('existingRecords', (missingDocuments.length || 0));
}

function renderPortfolioAnalysisSummary(results = {}) {
    clearCashflowAnalysisSections();
    setAnalysisCardLabel('missingTickersCount', 'מטבעות עם חשיפה');
    setAnalysisCardLabel('missingTickerRecords', 'קטגוריות נכסים');

    const totalRecords = safeToNumber(
        results.total_records
        ?? results.summary?.total_records
        ?? results.summary_data?.total_records
        ?? results.positions_detected
        ?? results.summary?.positions_detected
        ?? results.valid_records
        ?? 0
    );
    const validRecords = safeToNumber(
        results.valid_records
        ?? results.positions_detected
        ?? results.summary?.positions_detected
        ?? 0
    );
    const invalidRecords = safeToNumber(results.invalid_records ?? 0);

    setAnalysisCardValue('totalRecords', totalRecords);
    setAnalysisCardValue('validRecords', validRecords);
    setAnalysisCardValue('invalidRecords', invalidRecords);
    setAnalysisCardValue('duplicateRecords', results.duplicate_records || 0);
    setAnalysisCardValue('missingTickersCount', Object.keys(results.currency_totals || {}).length || 0);
    setAnalysisCardValue('missingTickerRecords', Object.keys(results.asset_category_totals || {}).length || 0);
    setAnalysisCardValue('existingRecords', (results.zero_quantity_positions || []).length);

    renderKeyValueCards(
        'cashflowTypeSummarySection',
        'cashflowTypeSummaryCards',
        results.currency_totals || {},
        { labelPrefix: 'מטבע' }
    );
    renderKeyValueCards(
        'cashflowCurrencySummarySection',
        'cashflowCurrencySummaryCards',
        results.asset_category_totals || {},
        { labelPrefix: 'קטגוריה' }
    );
    renderListSummary(
        'cashflowIssuesSummarySection',
        'cashflowIssuesSummaryList',
        results.zero_quantity_positions || [],
        (item) => {
            if (!item) {
                return '';
            }
            const symbol = item.symbol || item.asset_symbol || 'N/A';
            const currency = item.currency || item.account_currency || '';
            return `סמל ${symbol} – כמות/שווי אפסיים (${currency})`;
        }
    );
}

function renderTaxFxAnalysisSummary(results = {}) {
    clearCashflowAnalysisSections();
    setAnalysisCardLabel('missingTickersCount', 'מטבעות מס/עמלות');
    setAnalysisCardLabel('missingTickerRecords', 'רכיבי NAV');

    const totalRecords = safeToNumber(
        results.total_records
        ?? results.summary?.total_records
        ?? results.summary_data?.total_records
        ?? 0
    );
    const validRecords = safeToNumber(
        results.valid_records
        ?? results.taxes_detected
        ?? results.summary?.taxes_detected
        ?? 0
    );
    const invalidRecords = safeToNumber(results.invalid_records ?? 0);

    setAnalysisCardValue('totalRecords', totalRecords);
    setAnalysisCardValue('validRecords', validRecords);
    setAnalysisCardValue('invalidRecords', invalidRecords);
    setAnalysisCardValue('duplicateRecords', results.duplicate_records || 0);
    setAnalysisCardValue('missingTickersCount', Object.keys(results.totals_by_currency || {}).length || 0);
    setAnalysisCardValue('missingTickerRecords', Object.keys(results.nav_components || {}).length || 0);
    setAnalysisCardValue('existingRecords', (results.forex_trades || []).length);

    renderKeyValueCards(
        'cashflowTypeSummarySection',
        'cashflowTypeSummaryCards',
        results.totals_by_currency || {},
        { labelPrefix: 'מטבע' }
    );
    renderKeyValueCards(
        'cashflowCurrencySummarySection',
        'cashflowCurrencySummaryCards',
        results.totals_by_type || {},
        { labelPrefix: 'סוג' }
    );
    const navEntries = Object.entries(results.nav_components || {});
    renderListSummary(
        'cashflowIssuesSummarySection',
        'cashflowIssuesSummaryList',
        navEntries,
        (entry) => {
            if (!Array.isArray(entry)) {
                return '';
            }
            const [component, value] = entry;
            return `${component}: ${formatAmount(value)}`;
        }
    );
}

function detectAvailableDataTypes(results = {}) {
    const detectedTasks =
        results.detected_tasks ||
        results.summary?.detected_tasks ||
        results.summary_data?.detected_tasks ||
        {};

    const builders = {
        account_reconciliation: () => {
            const definition = IMPORT_DATA_TYPE_DEFINITIONS.account_reconciliation;
            if (!definition) return null;
            const accountsDetected = Number(
                detectedTasks.account_reconciliation?.records ??
                results.accounts_detected ??
                results.summary?.accounts_detected ??
                results.summary_data?.accounts_detected ??
                0
            );
            return {
                ...definition,
                records: accountsDetected,
                status: ACTIVE_IMPORT_DATA_TYPES.has(definition.key) ? 'available' : 'planned'
            };
        },
        executions: () => {
            const definition = IMPORT_DATA_TYPE_DEFINITIONS.executions;
            if (!definition) return null;
            const totalExecutions = Number(
                detectedTasks.executions?.records ??
                results.total_records ??
                results.records_total ??
                0
            );
            return {
                ...definition,
                records: totalExecutions,
                status: ACTIVE_IMPORT_DATA_TYPES.has(definition.key) ? 'available' : 'planned'
            };
        },
        cashflows: () => {
            const definition = IMPORT_DATA_TYPE_DEFINITIONS.cashflows;
            if (!definition) return null;
            const cashflowsCount = Number(
                detectedTasks.cashflows?.records ??
                results.cashflow_records ??
                results.cashflow_summary?.record_count ??
                results.summary?.cashflows_total ??
                results.summary_data?.cashflows_total ??
                0
            );
            return {
                ...definition,
                records: cashflowsCount,
                status: ACTIVE_IMPORT_DATA_TYPES.has(definition.key) ? 'available' : 'planned'
            };
        },
        portfolio_positions: () => {
            const definition = IMPORT_DATA_TYPE_DEFINITIONS.portfolio_positions;
            if (!definition) return null;
            return {
                ...definition,
                records: Number(
                    detectedTasks.portfolio_positions?.records ??
                    results.positions_detected ??
                    results.summary?.positions_detected ??
                    results.summary_data?.positions_detected ??
                    results.valid_records ??
                    0
                ),
                status: ACTIVE_IMPORT_DATA_TYPES.has(definition.key) ? 'available' : 'planned'
            };
        },
        taxes_and_fx: () => {
            const definition = IMPORT_DATA_TYPE_DEFINITIONS.taxes_and_fx;
            if (!definition) return null;
            return {
                ...definition,
                records: Number(
                    detectedTasks.taxes_and_fx?.records ??
                    results.taxes_detected ??
                    results.summary?.taxes_detected ??
                    results.summary_data?.taxes_detected ??
                    results.valid_records ??
                    0
                ),
                status: ACTIVE_IMPORT_DATA_TYPES.has(definition.key) ? 'available' : 'planned'
            };
        }
    };

    const detected = [];
    IMPORT_DATA_TYPE_ORDER.forEach((key) => {
        const entryBuilder = builders[key];
        if (!entryBuilder) {
            return;
        }
        const entry = entryBuilder();
        if (entry) {
            detected.push(entry);
        }
    });
    return detected;
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

async function loadProblemResolution(autoTriggered = false) {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    const taskKey = selectedDataTypeKey || analysisResults?.task_type || activeSessionInfo?.taskType || 'executions';
    window.Logger.info('[Import Modal] Loading problem resolution data', {
        sessionId: currentSessionId,
        taskKey,
        autoTriggered,
        page: 'import-user-data'
    });
    const analysisFallback = buildProblemResolutionFromAnalysis(analysisResults);
    setAnalysisLoadingState(true, 'טוען נתוני פתרון בעיות...', 70);
    let overlayApplied = false;
    try {
        showProcessingOverlay('טוען נתוני פתרון בעיות...');
        overlayApplied = true;
    } catch (overlayError) {
        window.Logger?.debug?.('[Import Modal] Failed to show processing overlay', { error: overlayError?.message });
    }

    try {
        const response = await fetch(`/api/user-data-import/session/${currentSessionId}/preview?task_type=${encodeURIComponent(taskKey)}`, {
        method: 'GET'
        });
        const data = await response.json();

        if (handleAccountLinkingBlockingResponse(data, 'load-problem-resolution')) {
            setAnalysisLoadingState(false);
            if (overlayApplied) {
                hideProcessingOverlay();
            }
            return;
        }
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayProblemResolutionDetailed(data.preview_data);
            window.Logger.info('[Import Modal] Problem resolution data loaded', {
                summary: data.preview_data?.summary,
                autoTriggered,
                page: 'import-user-data'
            });
            setAnalysisLoadingState(true, 'מאתר פטרונות והצעות לשיפור...', 82);
            window.setTimeout(() => setAnalysisLoadingState(false), 1000);
            const stepActions = document.getElementById('analysisStepActions');
            const continueBtn = document.getElementById('analysisContinueBtn');
            if (stepActions) {
                setElementDisplay(stepActions, 'flex');
            }
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.setAttribute('aria-disabled', 'false');
            }
            if (overlayApplied) {
                hideProcessingOverlay();
                overlayApplied = false;
            }
            return;
        }

        window.Logger.warn('[Import Modal] Preview data unavailable, falling back to analysis results', {
            status: data.status,
            error: data.error || data.message,
            page: 'import-user-data'
        });
        window.Logger.warn('[Import Modal] Using analysis-based problem resolution fallback', {
            hasAnalysisFallback: Boolean(analysisFallback),
            autoTriggered,
            page: 'import-user-data'
        });
        showImportUserDataNotification('לא ניתן לטעון את נתוני הפתרון המלאים. מוצגים נתוני ניתוח זמניים.', 'warning');
    } catch (error) {
        window.Logger.error('Problem resolution fetch error - using analysis fallback', {
            error: error.message,
            autoTriggered,
            page: 'import-user-data'
        });
        showImportUserDataNotification('שגיאה בטעינת נתוני פתרון. מוצגים נתוני ניתוח זמניים.', 'warning');
    }

    if (analysisFallback) {
        if (overlayApplied) {
            hideProcessingOverlay();
            overlayApplied = false;
        }
        displayProblemResolutionDetailed({
            summary: analysisFallback.summary,
            records_to_skip: analysisFallback.records_to_skip,
            records_to_import: []
        });
        setAnalysisLoadingState(true, 'מאתר פטרונות והצעות לשיפור...', 78);
        window.setTimeout(() => setAnalysisLoadingState(false), 1000);
        const stepActions = document.getElementById('analysisStepActions');
        const continueBtn = document.getElementById('analysisContinueBtn');
        if (stepActions) {
            setElementDisplay(stepActions, 'flex');
        }
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.setAttribute('aria-disabled', 'false');
        }
    } else {
        showImportUserDataNotification('לא נמצאו נתוני ניתוח להצגה.', 'error');
        setAnalysisLoadingState(false);
        const stepActions = document.getElementById('analysisStepActions');
        const continueBtn = document.getElementById('analysisContinueBtn');
        if (stepActions) {
            setElementDisplay(stepActions, 'flex');
        }
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.setAttribute('aria-disabled', 'false');
        }
    }

    if (overlayApplied) {
        hideProcessingOverlay();
    }
}

function proceedToProblemResolution(autoTriggered = false) {
    if (!currentSessionId) {
        if (!autoTriggered) {
            showImportUserDataNotification('לא נמצא סשן פעיל להמשך', 'warning');
        }
        return;
    }
    const continueBtn = document.getElementById('analysisContinueBtn');
    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.setAttribute('aria-disabled', 'true');
    }
    loadProblemResolution(autoTriggered);
}

function proceedToPreviewFromProblems() {
    setAnalysisLoadingState(true, 'מכין תצוגה מקדימה...', 80);
    goToStep(3);
}

async function resumeActiveImportSession() {
    const resumeBtn = document.getElementById('resumeImportSessionBtn');
    try {
        if (resumeBtn) {
            resumeBtn.disabled = true;
            resumeBtn.setAttribute('aria-disabled', 'true');
        }

        if (!currentSessionId || !activeSessionInfo) {
            await fetchLatestActiveSession();
        }

        if (!currentSessionId || !activeSessionInfo) {
            showImportUserDataNotification('לא נמצא סשן ייבוא פעיל להמשך', 'warning');
            return;
        }

        const modal = document.getElementById('importUserDataModal');
        if (!modal) {
            showImportUserDataNotification('מודול הייבוא אינו זמין כעת', 'error');
            return;
        }

        const connectorKey = activeSessionInfo.connector
            || (typeof activeSessionInfo.provider === 'string'
                ? activeSessionInfo.provider.toLowerCase()
                : null);

        const connectorSelect = modal.querySelector('#connectorSelect');
        if (connectorSelect && connectorKey) {
            setSelectValue(connectorSelect, connectorKey);
            selectedConnector = connectorKey;
        }

        const accountSelect = modal.querySelector('#tradingAccountSelect');
        if (accountSelect && activeSessionInfo.accountId) {
            setSelectValue(accountSelect, activeSessionInfo.accountId);
            selectedAccount = activeSessionInfo.accountId;
        }

        const taskKey = activeSessionInfo.taskType || selectedDataTypeKey || 'executions';
        selectedDataTypeKey = taskKey;
        updateSelectedDataTypeInfo();
        updateAnalyzeButton();

        goToStep(2);
        setAnalysisLoadingState(true, 'טוען נתוני סשן פעיל...', 55);

        const encodedTask = encodeURIComponent(taskKey);
        const analysisResponse = await fetch(`/api/user-data-import/session/${currentSessionId}/analyze?task_type=${encodedTask}`);
        const analysisJson = await analysisResponse.json();

        if (handleAccountLinkingBlockingResponse(analysisJson, 'resume-session')) {
            setAnalysisLoadingState(false);
            return;
        }

        if (!(analysisJson.success || analysisJson.status === 'success')) {
            const message = getApiErrorMessage(analysisJson, 'טעינת נתוני הניתוח נכשלה');
            throw new Error(message);
        }

        analysisResults = analysisJson.analysis_results;
        displayAnalysisResults(analysisResults);

        setAnalysisLoadingState(false);
        showImportUserDataNotification('הסשן הופעל מחדש. ניתן להמשיך לפתרון בעיות.', 'success');
        updateResetSessionButtonState();
    } catch (error) {
        setAnalysisLoadingState(false);
        window.Logger?.error('[Import Modal] Failed to resume active session', { error: error?.message });
        showImportUserDataNotification(`שגיאה בשחזור הסשן: ${error?.message || 'שגיאה לא ידועה'}`, 'error');
        updateResetSessionButtonState();
    } finally {
        if (resumeBtn) {
            resumeBtn.disabled = false;
            resumeBtn.setAttribute('aria-disabled', 'false');
        }
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
    
    // CRITICAL: Load selectedCashflowTypes from preview_data if available
    // This ensures resume session works correctly
    if (data.selected_types && Array.isArray(data.selected_types) && data.selected_types.length > 0) {
        // Reset selectedCashflowTypes and set only the types from preview_data
        selectedCashflowTypes = {};
        data.selected_types.forEach(type => {
            selectedCashflowTypes[type] = true;
        });
        window.Logger.info('[Import Modal] Loaded selectedCashflowTypes from preview_data', {
            selectedTypes: data.selected_types,
            selectedCashflowTypes,
            page: 'import-user-data'
        });
    }
    
    const taskType = (data.task_type || analysisResults?.task_type || selectedDataTypeKey || 'executions').toLowerCase();
    let recordsToImport = data.records_to_import || [];
    const recordsToSkip = data.records_to_skip || [];
    const summary = data.summary || {};

    // Filter records by selectedCashflowTypes for cashflows task
    if (taskType === 'cashflows' && Object.keys(selectedCashflowTypes).length > 0) {
        const selectedTypes = Object.keys(selectedCashflowTypes).filter(
            type => selectedCashflowTypes[type] === true
        );
        if (selectedTypes.length > 0) {
            const originalCount = recordsToImport.length;
            recordsToImport = recordsToImport.filter(record => {
                const cashflowType = (record.cashflow_type || record.record?.cashflow_type || '').toLowerCase();
                return selectedTypes.some(selectedType => selectedType.toLowerCase() === cashflowType);
            });
            window.Logger.debug(
                '[Import Modal] Filtered preview records by selected types',
                { originalCount, filteredCount: recordsToImport.length, selectedTypes, page: 'import-user-data' }
            );
        }
    }

    const importCount = recordsToImport.length;
    const skipCount = recordsToSkip.length;
    const totalCount = importCount + skipCount;
    const importRate = totalCount > 0 ? Math.round((importCount / totalCount) * 100) : 0;
    
    const importCountEl = document.getElementById('previewImportCount');
    const skipCountEl = document.getElementById('previewSkipCount');
    const importRateEl = document.getElementById('previewImportRate');
    
    if (importCountEl) importCountEl.textContent = importCount;
    if (skipCountEl) skipCountEl.textContent = skipCount;
    if (importRateEl) importRateEl.textContent = `${importRate}%`;
    
    if (taskType === 'cashflows') {
        renderCashflowPreviewTables(recordsToImport, recordsToSkip, summary, importCount, skipCount);
        updateSummaryStats();
        return;
    }

    if (taskType === 'account_reconciliation') {
        renderAccountReconciliationPreview(recordsToImport, recordsToSkip, summary, importCount, skipCount);
        updateSummaryStats();
        return;
    }

    if (taskType === 'portfolio_positions') {
        renderPortfolioPreviewTables(recordsToImport, recordsToSkip, summary, importCount, skipCount);
        updateSummaryStats();
        return;
    }

    if (taskType === 'taxes_and_fx') {
        renderTaxFxPreviewTables(recordsToImport, recordsToSkip, summary, importCount, skipCount);
        updateSummaryStats();
        return;
    }

    renderExecutionPreviewTables(recordsToImport, recordsToSkip);
    updateSummaryStats();
}

function renderExecutionPreviewTables(recordsToImport, recordsToSkip) {
    const importTableHeadRow = document.querySelector('#importTable thead tr');
    if (importTableHeadRow) {
        importTableHeadRow.innerHTML = `
            <th>סמל</th>
            <th>פעולה</th>
            <th>כמות</th>
            <th>מחיר</th>
            <th>עמלה</th>
            <th>Realized P/L</th>
            <th>MTM P/L</th>
            <th>תאריך</th>
        `;
    }

    const skipTableHeadRow = document.querySelector('#skipTable thead tr');
    if (skipTableHeadRow) {
        skipTableHeadRow.innerHTML = `
            <th>סמל</th>
            <th>פעולה</th>
            <th>כמות</th>
            <th>מחיר</th>
            <th>עמלה</th>
            <th>Realized P/L</th>
            <th>MTM P/L</th>
            <th>תאריך</th>
            <th>סיבה</th>
        `;
    }

    const importTableBody = document.getElementById('importTableBody');
    if (importTableBody) {
        importTableBody.innerHTML = '';
        recordsToImport.forEach(entry => {
            const { record } = extractPreviewRecord(entry);
            if (!record) return;
            const row = document.createElement('tr');
            const realizedPL = record.realized_pl !== null && record.realized_pl !== undefined 
                ? (record.realized_pl >= 0 ? `$${record.realized_pl}` : `-$${Math.abs(record.realized_pl)}`) 
                : '-';
            const mtmPL = record.mtm_pl !== null && record.mtm_pl !== undefined 
                ? (record.mtm_pl >= 0 ? `$${record.mtm_pl}` : `-$${Math.abs(record.mtm_pl)}`) 
                : '-';
        const dateDisplay = renderImportDate(record.date, 'N/A');
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
            <td>${dateDisplay}</td>
            `;
            importTableBody.appendChild(row);
        });
    }
    
    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableBody) {
        skipTableBody.innerHTML = '';
        recordsToSkip.forEach(entry => {
            const { record, wrapper } = extractPreviewRecord(entry);
            if (!record) return;
            const row = document.createElement('tr');
            const realizedPL = record.realized_pl !== null && record.realized_pl !== undefined 
                ? (record.realized_pl >= 0 ? `$${record.realized_pl}` : `-$${Math.abs(record.realized_pl)}`) 
                : '-';
            const mtmPL = record.mtm_pl !== null && record.mtm_pl !== undefined 
                ? (record.mtm_pl >= 0 ? `$${record.mtm_pl}` : `-$${Math.abs(record.mtm_pl)}`) 
                : '-';
        const dateDisplay = renderImportDate(record.date, 'N/A');
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
            <td>${dateDisplay}</td>
                <td>${wrapper.reason || 'N/A'}</td>
            `;
            skipTableBody.appendChild(row);
        });
    }
}

function renderCashflowPreviewTables(recordsToImport, recordsToSkip, summary = {}, importCountFallback = recordsToImport.length, skipCountFallback = recordsToSkip.length) {
    const importTableHeadRow = document.querySelector('#importTable thead tr');
    if (importTableHeadRow) {
        importTableHeadRow.innerHTML = `
            <th>סוג תזרים</th>
            <th>סכום</th>
            <th>מטבע</th>
            <th>תאריך אפקטיבי</th>
            <th>חשבון מקור</th>
            <th>חשבון יעד</th>
            <th>נכס</th>
            <th>תיאור</th>
        `;
    }

    const skipTableHeadRow = document.querySelector('#skipTable thead tr');
    if (skipTableHeadRow) {
        skipTableHeadRow.innerHTML = `
            <th>סוג תזרים</th>
            <th>סכום</th>
            <th>מטבע</th>
            <th>תאריך אפקטיבי</th>
            <th>חשבון מקור</th>
            <th>חשבון יעד</th>
            <th>נכס</th>
            <th>סיבה</th>
        `;
    }

    const importTableBody = document.getElementById('importTableBody');
    if (importTableBody) {
        importTableBody.innerHTML = '';
        recordsToImport.forEach(entry => {
            const { record } = extractPreviewRecord(entry);
            if (!record) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${buildValueOrFallback(resolveCashflowTypeLabel(record.cashflow_type))}</td>
                <td>${buildValueOrFallback(record.amount)}</td>
                <td>${buildValueOrFallback(record.currency)}</td>
                <td>${buildValueOrFallback(record.effective_date)}</td>
                <td>${
                    (typeof window.getTradingAccountName === 'function' && record.source_account)
                        ? escapeHtml(window.getTradingAccountName(record.source_account))
                        : buildValueOrFallback(record.source_account)
                }</td>
                <td>${buildValueOrFallback(record.target_account)}</td>
                <td>${buildValueOrFallback(record.asset_symbol)}</td>
                <td>${buildValueOrFallback(record.memo)}</td>
            `;
            importTableBody.appendChild(row);
        });
    }

    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableBody) {
        skipTableBody.innerHTML = '';
        recordsToSkip.forEach(entry => {
            const { record, wrapper } = extractPreviewRecord(entry);
            if (!record) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${buildValueOrFallback(resolveCashflowTypeLabel(record.cashflow_type))}</td>
                <td>${buildValueOrFallback(record.amount)}</td>
                <td>${buildValueOrFallback(record.currency)}</td>
                <td>${buildValueOrFallback(record.effective_date)}</td>
                <td>${
                    (typeof window.getTradingAccountName === 'function' && record.source_account)
                        ? escapeHtml(window.getTradingAccountName(record.source_account))
                        : buildValueOrFallback(record.source_account)
                }</td>
                <td>${buildValueOrFallback(record.target_account)}</td>
                <td>${buildValueOrFallback(record.asset_symbol)}</td>
                <td>${buildValueOrFallback(wrapper.reason)}</td>
            `;
            skipTableBody.appendChild(row);
        });
    }

    const readyRecords = importCountFallback ?? summary.records_to_import ?? summary.cashflow_records ?? recordsToImport.length;
    const skippedRecords = skipCountFallback ?? summary.records_to_skip ?? summary.invalid_records ?? recordsToSkip.length;

    updateActiveSessionInfo({
        readyRecords,
        skipRecords: skippedRecords,
        taskType: 'cashflows',
        status: activeSessionInfo?.status || 'מוכן לייבוא'
    });
}

function renderPortfolioPreviewTables(recordsToImport, recordsToSkip, summary = {}, importCountFallback = recordsToImport.length, skipCountFallback = recordsToSkip.length) {
    const importTableHeadRow = document.querySelector('#importTable thead tr');
    if (importTableHeadRow) {
        importTableHeadRow.innerHTML = `
            <th>סמל</th>
            <th>קטגוריה</th>
            <th>מטבע</th>
            <th>כמות</th>
            <th>שווי שוק</th>
            <th>עלות כוללת</th>
            <th>רווח/הפסד</th>
            <th>תקופת דוח</th>
        `;
    }

    const skipTableHeadRow = document.querySelector('#skipTable thead tr');
    if (skipTableHeadRow) {
        skipTableHeadRow.innerHTML = `
            <th>סמל</th>
            <th>קטגוריה</th>
            <th>מטבע</th>
            <th>כמות</th>
            <th>שווי שוק</th>
            <th>עלות כוללת</th>
            <th>רווח/הפסד</th>
            <th>תקופת דוח</th>
            <th>סיבה</th>
        `;
    }

    const importTableBody = document.getElementById('importTableBody');
    if (importTableBody) {
        importTableBody.innerHTML = '';
        recordsToImport.forEach((entry) => {
            const { record } = extractPreviewRecord(entry);
            if (!record) {
                return;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.symbol || record.description || 'N/A')}</td>
                <td>${escapeHtml(record.asset_category || 'N/A')}</td>
                <td>${escapeHtml(record.currency || '')}</td>
                <td>${formatNumber(record.quantity ?? 0, 2)}</td>
                <td>${formatAmount(record.market_value ?? 0)}</td>
                <td>${formatAmount(record.cost_basis ?? 0)}</td>
                <td>${formatAmount(record.unrealized_pl ?? 0)}</td>
                <td>${renderImportDate(record.statement_period_end, record.statement_period || '—')}</td>
            `;
            importTableBody.appendChild(row);
        });
    }

    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableBody) {
        skipTableBody.innerHTML = '';
        recordsToSkip.forEach((entry) => {
            const { record, wrapper } = extractPreviewRecord(entry);
            if (!record) {
                return;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.symbol || record.description || 'N/A')}</td>
                <td>${escapeHtml(record.asset_category || 'N/A')}</td>
                <td>${escapeHtml(record.currency || '')}</td>
                <td>${formatNumber(record.quantity ?? 0, 2)}</td>
                <td>${formatAmount(record.market_value ?? 0)}</td>
                <td>${formatAmount(record.cost_basis ?? 0)}</td>
                <td>${formatAmount(record.unrealized_pl ?? 0)}</td>
                <td>${renderImportDate(record.statement_period_end, record.statement_period || '—')}</td>
                <td>${escapeHtml(wrapper.reason || 'validation_error')}</td>
            `;
            skipTableBody.appendChild(row);
        });
    }
}

function renderTaxFxPreviewTables(recordsToImport, recordsToSkip, summary = {}, importCountFallback = recordsToImport.length, skipCountFallback = recordsToSkip.length) {
    const importTableHeadRow = document.querySelector('#importTable thead tr');
    if (importTableHeadRow) {
        importTableHeadRow.innerHTML = `
            <th>סוג</th>
            <th>מטבע</th>
            <th>סכום</th>
            <th>תיאור</th>
            <th>תאריך</th>
            <th>מטבע מקור</th>
            <th>מטבע יעד</th>
            <th>כמות</th>
        `;
    }

    const skipTableHeadRow = document.querySelector('#skipTable thead tr');
    if (skipTableHeadRow) {
        skipTableHeadRow.innerHTML = `
            <th>סוג</th>
            <th>מטבע</th>
            <th>סכום</th>
            <th>תיאור</th>
            <th>תאריך</th>
            <th>סיבה</th>
        `;
    }

    const importTableBody = document.getElementById('importTableBody');
    if (importTableBody) {
        importTableBody.innerHTML = '';
        recordsToImport.forEach((entry) => {
            const { record } = extractPreviewRecord(entry);
            if (!record) {
                return;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.record_type || 'tax_cashflow')}</td>
                <td>${escapeHtml(record.currency || '')}</td>
                <td>${formatAmount(record.amount ?? 0)}</td>
                <td>${escapeHtml(record.description || '')}</td>
                <td>${renderImportDate(record.effective_date, record.statement_period || '—')}</td>
                <td>${escapeHtml(record.source_currency || '')}</td>
                <td>${escapeHtml(record.target_currency || '')}</td>
                <td>${formatNumber(record.quantity ?? 0, 4)}</td>
            `;
            importTableBody.appendChild(row);
        });
    }

    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableBody) {
        skipTableBody.innerHTML = '';
        recordsToSkip.forEach((entry) => {
            const { record, wrapper } = extractPreviewRecord(entry);
            if (!record) {
                return;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(record.record_type || 'tax_cashflow')}</td>
                <td>${escapeHtml(record.currency || '')}</td>
                <td>${formatAmount(record.amount ?? 0)}</td>
                <td>${escapeHtml(record.description || '')}</td>
                <td>${renderImportDate(record.effective_date, record.statement_period || '—')}</td>
                <td>${escapeHtml(wrapper.reason || 'validation_error')}</td>
            `;
            skipTableBody.appendChild(row);
        });
    }
}

function renderAccountReconciliationPreview(recordsToImport, recordsToSkip, summary, importCountFallback = recordsToImport.length, skipCountFallback = recordsToSkip.length) {
    const importTableHeadRow = document.querySelector('#importTable thead tr');
    const importTableBody = document.getElementById('importTableBody');
    if (importTableHeadRow) {
        importTableHeadRow.innerHTML = `
            <th>חשבון</th>
            <th>מטבע בסיס</th>
            <th>מצב הרשאות</th>
            <th>מסמכים חסרים</th>
        `;
    }
    if (importTableBody) {
        importTableBody.innerHTML = '';
        recordsToImport.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${buildValueOrFallback(record.account_id)}</td>
                <td>${buildValueOrFallback(record.base_currency)}</td>
                <td>${buildValueOrFallback((record.entitlements || []).join(', '), '—')}</td>
                <td>${buildValueOrFallback((record.missing_documents || []).join(', '), '—')}</td>
            `;
            importTableBody.appendChild(row);
        });
    }

    const skipTableHeadRow = document.querySelector('#skipTable thead tr');
    const skipTableBody = document.getElementById('skipTableBody');
    if (skipTableHeadRow) {
        skipTableHeadRow.innerHTML = `
            <th>סוג</th>
            <th>פרטים</th>
        `;
    }
    if (skipTableBody) {
        skipTableBody.innerHTML = '';

        recordsToSkip.forEach(entry => {
            const { record, wrapper } = extractPreviewRecord(entry);
            const errors = wrapper?.errors || wrapper?.message || wrapper?.reason || 'שגיאה לא ידועה';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>שגיאת ולידציה</td>
                <td>
                    ${record ? `<div><strong>חשבון:</strong> ${escapeHtml(record.account_id || 'לא ידוע')}</div>` : ''}
                    <div><strong>מידע:</strong> ${escapeHtml(Array.isArray(errors) ? errors.join(', ') : errors)}</div>
                </td>
            `;
            skipTableBody.appendChild(row);
        });

        const issueEntries = [
            { label: 'חשבונות חסרים', items: summary.missing_accounts || [] },
            { label: 'אי התאמות מטבע', items: summary.base_currency_mismatches || [] },
            { label: 'הרשאות חסרות', items: summary.entitlement_warnings || [] },
            { label: 'מסמכים חסרים', items: summary.missing_documents_report || [] }
        ];

        issueEntries.forEach(issue => {
            if (!issue.items || !issue.items.length) {
                return;
            }
            issue.items.forEach(item => {
                const serialized = typeof item === 'string' ? item : JSON.stringify(item);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(issue.label)}</td>
                    <td>${escapeHtml(serialized)}</td>
                `;
                skipTableBody.appendChild(row);
            });
        });
    }

    const readyRecords = importCountFallback ?? summary.valid_records ?? summary.records_to_import ?? recordsToImport.length;
    const skippedRecords = skipCountFallback ?? summary.invalid_records ?? summary.records_to_skip ?? recordsToSkip.length;

    updateActiveSessionInfo({
        readyRecords,
        skipRecords: skippedRecords,
        taskType: 'account_reconciliation',
        status: activeSessionInfo?.status || 'מוכן לייבוא'
    });
}

/**
 * Load preview data (Step 4)
 */
function loadPreviewData() {
    window.Logger.debug('[Import Modal] Loading preview data', { 
        currentSessionId, 
        page: 'import-user-data' 
    });
    setAnalysisLoadingState(true, 'טוען תצוגה מקדימה...', 90);
    
    if (!currentSessionId) {
        window.Logger.error('[Import Modal] No session ID for preview', { page: 'import-user-data' });
        showImportUserDataNotification('שגיאה: אין מזהה הפעלה', 'error');
        setAnalysisLoadingState(false);
        return;
    }
    
    // Load preview data from server
    const encodedTask = encodeURIComponent(selectedDataTypeKey || analysisResults?.task_type || 'executions');
    fetch(`/api/user-data-import/session/${currentSessionId}/preview?task_type=${encodedTask}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (handleAccountLinkingBlockingResponse(data, 'load-preview')) {
            setAnalysisLoadingState(false);
            return;
        }
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            setAnalysisLoadingState(true, 'מעבד תצוגה מקדימה...', 95);
            displayPreviewData(data.preview_data);
            displayConfirmationData(analysisResults, data.preview_data);
            window.Logger.info('[Import Modal] Preview and confirmation data loaded successfully', { 
                data: data.preview_data, 
                page: 'import-user-data' 
            });
            setAnalysisLoadingState(false);
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
                setAnalysisLoadingState(true, 'מעבד תצוגה מקדימה...', 95);
                displayPreviewData(analysisFallback);
                displayConfirmationData(analysisResults, analysisFallback);
                window.Logger.warn('[Import Modal] Using analysis-based preview fallback', {
                    page: 'import-user-data'
                });
                setAnalysisLoadingState(false);
            } else {
                showImportUserDataNotification('לא נמצאו נתוני ניתוח להצגה בתצוגה מקדימה.', 'error');
                setAnalysisLoadingState(false);
            }
        }
    })
    .catch(error => {
        window.Logger.error('[Import Modal] Preview data error:', error);
        showImportUserDataNotification('שגיאה בטעינת תצוגה מקדימה', 'warning');
        const analysisFallback = buildPreviewFromAnalysis(analysisResults);
        if (analysisFallback) {
            previewData = analysisFallback;
            setAnalysisLoadingState(true, 'מעבד תצוגה מקדימה...', 95);
            displayPreviewData(analysisFallback);
            displayConfirmationData(analysisResults, analysisFallback);
            window.Logger.warn('[Import Modal] Using analysis-based preview fallback after fetch error', {
                page: 'import-user-data'
            });
            setAnalysisLoadingState(false);
        } else {
            showImportUserDataNotification('לא נמצאו נתוני ניתוח להצגה בתצוגה מקדימה.', 'error');
            setAnalysisLoadingState(false);
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
    
    const taskType = (analysisResults.task_type || previewData.task_type || selectedDataTypeKey || 'executions').toLowerCase();
    
    const fileName = window.selectedFile?.name || 'קובץ לא ידוע';
    // Get account name from multiple sources (priority: activeSessionInfo > linkedAccountInfo > select > fallback)
    const accountSelect = document.getElementById('tradingAccountSelect');
    const accountName = activeSessionInfo?.accountName 
        || linkedAccountInfo?.name 
        || accountSelect?.selectedOptions[0]?.text 
        || 'חשבון לא ידוע';
    
    const previewSummary = previewData.summary || {};
    const analysisSummary = analysisResults.summary || {};
    const cashflowSummary = analysisResults.cashflow_summary || {};
    const accountSummary = analysisResults.account_validation_results || {};
    
    let totalRecords = analysisResults.total_records
        ?? previewSummary.total_records
        ?? cashflowSummary.record_count
        ?? previewSummary.record_count
        ?? 0;
    
    let importCount = previewData.records_to_import?.length
        ?? previewSummary.records_to_import
        ?? previewSummary.valid_records
        ?? cashflowSummary.record_count
        ?? 0;
    
    let skipCount = previewData.records_to_skip?.length
        ?? previewSummary.records_to_skip
        ?? previewSummary.invalid_records
        ?? 0;

    if (taskType === 'cashflows') {
        totalRecords = analysisResults.total_records
            ?? previewSummary.total_records
            ?? cashflowSummary.record_count
            ?? importCount + skipCount;
        importCount = previewSummary.records_to_import
            ?? previewSummary.cashflow_records
            ?? cashflowSummary.record_count
            ?? importCount;
        skipCount = previewSummary.records_to_skip
            ?? previewSummary.invalid_records
            ?? (Array.isArray(previewSummary.currency_issues) ? previewSummary.currency_issues.length : skipCount);
    }

    if (taskType === 'account_reconciliation') {
        totalRecords = analysisResults.total_records
            ?? previewSummary.total_records
            ?? importCount + skipCount;
        importCount = previewSummary.valid_records
            ?? accountSummary.valid_records
            ?? importCount;
        skipCount = previewSummary.invalid_records
            ?? accountSummary.invalid_records
            ?? skipCount;
    }
    
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
    
    updateActiveSessionInfo({
        readyRecords: importCount,
        skipRecords: skipCount,
        taskType,
        status: 'מוכן לייבוא'
    });
    
    window.Logger.info('[Import Modal] Confirmation data displayed successfully', { 
        fileName, 
        accountName, 
        totalRecords, 
        importCount, 
        skipCount, 
        taskType,
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
                                <span>${dup.symbol} - ${renderImportDate(dup.date || dup.record?.date, '—')}</span>
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
                                <span>${record.symbol} - ${renderImportDate(record.date || record.record?.date, '—')}</span>
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
                <button class="btn btn-secondary" onclick="goToStep(1)">
                    <i class="fas fa-arrow-left"></i> חזור לשלב העלאת הקובץ
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
        if (handleAccountLinkingBlockingResponse(data, 'accept-duplicate')) {
            return;
        }
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
        if (handleAccountLinkingBlockingResponse(data, 'reject-duplicate')) {
            return;
        }
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
    const metadata = getSymbolMetadata(normalizedSymbol);

    ensureTickerSaveHook();

    const modalManagerReady = await ensureModalManagerReady();
    if (!modalManagerReady) {
        showImportUserDataNotification('מערכת המודלים אינה זמינה. רענן את הדף ונסה שוב.', 'error');
        return;
    }

    const showModal = window.showModalSafe
        || (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function'
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
                const applyPrefill = async () => {
                    const symbolInput = modalElement.querySelector('#tickerSymbol');
                    const nameInput = modalElement.querySelector('#tickerName');
                    const typeSelect = modalElement.querySelector('#tickerType');
                    const currencySelect = modalElement.querySelector('#tickerCurrency');
                    const remarksField = modalElement.querySelector('#tickerRemarks');
                    const externalDataResult = modalElement.querySelector('#tickerExternalDataResult');
                    const externalDataWarning = modalElement.querySelector('#tickerExternalDataWarning');

                    const remarksHtml = buildRichTextFromMetadata(metadata);

                    if (symbolInput) {
                        setInputValue(symbolInput, normalizedSymbol);
                    }
                    if (nameInput) {
                        if (metadata?.company_name) {
                            setInputValue(nameInput, metadata.company_name);
                        } else if (!nameInput.value) {
                            setInputValue(nameInput, normalizedSymbol);
                        }
                    }
                    if (typeSelect) {
                        setSelectValue(typeSelect, metadata?.instrument_type || 'stock');
                    }
        if (currencySelect) {
                        await setCurrencySelectValue(currencySelect, normalizedCurrency);
                    }
                    if (remarksField) {
                        remarksField.value = remarksHtml || '';
                    }

                    const editorId = ensureRichTextEditorForTickerRemarks(modalElement);
                    if (editorId && typeof window.setRichTextContent === 'function') {
                        window.setRichTextContent(editorId, remarksHtml || '');
                    }

                    if (externalDataResult) {
                        const summaryHtml = renderMetadataSummaryBlock(metadata);
                        if (summaryHtml) {
                            externalDataResult.innerHTML = summaryHtml;
                            setElementDisplay(externalDataResult, 'block');
    } else {
                            externalDataResult.innerHTML = '';
                            setElementDisplay(externalDataResult, 'none');
                        }
                    }

                    if (externalDataWarning) {
                        if (metadata) {
                            setElementDisplay(externalDataWarning, 'none');
                            externalDataWarning.innerHTML = '';
                        } else {
                            setElementDisplay(externalDataWarning, 'block');
                            externalDataWarning.innerHTML = '<small>לא נמצאו נתוני רקע לטיקר זה. ניתן להוסיף ידנית.</small>';
                        }
                    }

                    const headerElement = modalElement.querySelector('.modal-header');
                    if (headerElement) {
                        headerElement.classList.add('entity-ticker');
                        if (!getComputedStyle(document.documentElement).getPropertyValue('--entity-ticker-color').trim()) {
                            headerElement.style.backgroundColor = '#26baac';
                            headerElement.style.borderBottomColor = '#26baac';
                            headerElement.style.color = '#ffffff';
                        }
                    }
                };

                await applyPrefill();
                setTimeout(applyPrefill, 150);
                window.ModalManagerV2?.applyUserColors?.(modalElement, 'ticker');
            }
        return;
        } catch (error) {
            window.Logger?.error('[Import Modal] Failed to open tickers modal via ModalManager', { error: error.message });
            showImportUserDataNotification('שגיאה בפתיחת מודול הטיקר', 'error');
        }
    }

    showImportUserDataNotification('לא ניתן לפתוח את מודול הטיקר הכללי. אנא רענן ונסה שוב.', 'error');
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
        if (handleAccountLinkingBlockingResponse(data, 'generate-preview')) {
            return;
        }
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            displayPreview(data.preview_data);
            
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
    
    updateSymbolMetadataCache(data?.symbol_metadata);
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
                                        <td>${renderImportDate(record.date, '—')}</td>
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
                                        <td>${renderImportDate(record.date, '—')}</td>
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
    
    const summary = previewData.summary || {};
    const readyRecords = summary.records_to_import
        ?? summary.cashflow_records
        ?? summary.valid_records
        ?? previewData.records_to_import?.length
        ?? 0;
    const skippedRecords = summary.records_to_skip
        ?? summary.invalid_records
        ?? previewData.records_to_skip?.length
        ?? 0;
    const total = summary.total_records
        ?? summary.record_count
        ?? (readyRecords + skippedRecords);
    const rate = total > 0 ? Math.round((readyRecords / total) * 100) : 0;

    if (importCount) importCount.textContent = readyRecords;
    if (skipCount) skipCount.textContent = skippedRecords;
    if (importRate) importRate.textContent = `${rate}%`;

    updateActiveSessionInfo({
        readyRecords,
        skipRecords: skippedRecords,
        status: activeSessionInfo?.status || 'מוכן לייבוא',
        taskType: previewData.task_type || selectedDataTypeKey
    });
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
 * Perform the final import operation
 * 
 * Executes the import process for the current session, imports records to database,
 * and clears session data after successful import.
 * 
 * @param {boolean} [generateReport=false] - Whether to generate a report after import
 * @returns {void}
 * 
 * @throws {Error} If import fails or session is invalid
 * 
 * @example
 * // Basic import
 * performImport();
 * 
 * @example
 * // Import with report generation
 * performImport(true);
 * 
 * @see {@link clearStoredActiveSession} For session cleanup after import
 * @see {@link showImportUserDataNotification} For user notifications
 * 
 * @since 2.0.0
 * @updated January 2025 - Added automatic session cleanup after successful import
 */
function performImport(generateReport = false) {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    setAnalysisLoadingState(true, 'מייבא נתונים...', 15);
    showImportUserDataNotification('מתחיל ייבוא נתונים...', 'info');
    
    // Get selected cashflow types (only types that are checked)
    const selectedTypes = Object.keys(selectedCashflowTypes).filter(
        type => selectedCashflowTypes[type] === true
    );
    
    // CRITICAL: Always send selected_types, even if empty array
    // This ensures the backend can filter correctly
    fetch(`/api/user-data-import/session/${currentSessionId}/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            generate_report: generateReport,
            selected_types: selectedTypes  // Always include, never undefined
        })
    })
    .then(response => response.json())
    .then(data => {
        if (handleAccountLinkingBlockingResponse(data, 'execute-import')) {
            setAnalysisLoadingState(false);
            return;
        }
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
            setAnalysisLoadingState(true, 'מסכם תהליך הייבוא...', 90);
            
            // Build success message
            let successMessage = `ייבוא הנתונים הושלם בהצלחה! נוספו ${importedCount} רשומות חדשות.`;
            if (skippedCount > 0) {
                successMessage += ` ${skippedCount} רשומות הושמטו (שגיאות/כפילויות).`;
            }
            
            // Build details message if there are warnings
            let detailsMessage = null;
            if (importErrors.length) {
                detailsMessage = importErrors
                    .map((message, idx) => `• (${idx + 1}) ${message}`)
                    .join('\n');
            }
            if (generateReport && data.report_url) {
                if (detailsMessage) {
                    detailsMessage += '\n\nדוח ייבוא זמין להורדה.';
                } else {
                    detailsMessage = 'דוח ייבוא זמין להורדה.';
                }
            }
            
            // Handle session completion
            handleSessionCompletion('completed', successMessage, detailsMessage);
            
            // Clear cache and refresh data
            clearImportCacheLayers({ reason: 'import-user-data:execute' });
            if (typeof window.loadExecutionsData === 'function') {
                window.loadExecutionsData();
            }
            
            closeImportUserDataModal();
            return;
        }

        // Import failed
        const errorMessage = getApiErrorMessage(
            data,
            apiSucceeded && importedCount === 0
                ? 'הייבוא הסתיים ללא רשומות חדשות. בדוק את נתוני הקובץ והמשך לטפל בבעיות.'
                : 'שגיאה בייבוא הנתונים'
        );

        // Build error details
        let errorDetails = null;
        if (importErrors.length) {
            errorDetails = importErrors
                .map((message, idx) => `• (${idx + 1}) ${message}`)
                .join('\n');
        }

        // Handle session completion with failure
        handleSessionCompletion('failed', errorMessage, errorDetails);
        
        closeImportUserDataModal();
    })
    .catch(error => {
        window.Logger.error('Import error:', error);
        handleSessionCompletion('failed', 'שגיאה בייבוא הנתונים', error?.message || 'שגיאה לא ידועה');
        closeImportUserDataModal();
    })
    .finally(() => {
        setAnalysisLoadingState(false);
    });
}

/**
 * Handle session reset - cancels session, clears cache, refreshes UI
 * Session is permanently closed after this operation
 */
async function handleSessionReset(sessionId) {
    if (!sessionId) {
        // No session to reset - just clear UI and cache
        resetImportModal();
        clearImportCacheLayers({ reason: 'import-user-data:reset' });
        updateActiveSessionIndicator();
        updateResetSessionButtonState();
        updateAnalyzeButton();
        goToStep(1);
        return;
    }

    try {
        showImportUserDataNotification('מאפס את סשן הייבוא...', 'info');

        const response = await fetch(`/api/user-data-import/session/${sessionId}/reset`, {
            method: 'POST'
        });
        const data = await response.json().catch(() => ({}));
        const success = data?.success === true || data?.status === 'success';
        const sessionNotFound = (data?.message || '').toLowerCase().includes('session not found');

        if (success || sessionNotFound) {
            // Session cancelled successfully
            // Clear all state, cache, and refresh UI to "no session" state
            resetImportModal();
            clearImportCacheLayers({ reason: 'import-user-data:reset' });
            updateActiveSessionIndicator();
            updateResetSessionButtonState();
            updateAnalyzeButton();
            goToStep(1);
            
            showImportUserDataNotification('סשן הייבוא בוטל בהצלחה. ניתן להתחיל תהליך חדש.', 'success');
            return;
        }

        // Error resetting session
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
    } catch (error) {
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
    }
}

/**
 * Handle session completion - called when session ends (success, failure, or cancellation)
 * Shows appropriate notification and clears state
 */
function handleSessionCompletion(status, message, details = null) {
    // Clear session state
    currentSessionId = null;
    window.currentSessionId = null;
    activeSessionInfo = null;
    
    // Update UI to "no session" state
    updateActiveSessionIndicator();
    updateResetSessionButtonState();
    updateAnalyzeButton();
    
    // Show notification based on status
    const statusMessages = {
        'completed': { type: 'success', defaultMessage: 'ייבוא הנתונים הושלם בהצלחה' },
        'failed': { type: 'error', defaultMessage: 'ייבוא הנתונים נכשל' },
        'cancelled': { type: 'info', defaultMessage: 'ייבוא הנתונים בוטל' }
    };
    
    const statusInfo = statusMessages[status] || { type: 'info', defaultMessage: 'ייבוא הנתונים הסתיים' };
    const finalMessage = message || statusInfo.defaultMessage;
    
    showImportUserDataNotification(finalMessage, statusInfo.type);
    
    if (details && typeof window.showDetailedNotification === 'function') {
        window.showDetailedNotification(
            'פרטי ייבוא',
            details,
            statusInfo.type,
            10000,
            'import-user-data'
        );
    }
    
    // Refresh import history
    setTimeout(() => {
        window.refreshDataImportHistory?.();
    }, 500);
}

function confirmResetImportSession() {
    if (!currentSessionId) {
        handleSessionReset(null);
        return;
    }

    const confirmationMessage = 'הפעולה תבטל את סשן הייבוא הנוכחי, תנקה נתוני ביניים ומטמון, ותאפשר להתחיל תהליך חדש.\nהאם להמשיך?';
    if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
            'ביטול תהליך ייבוא',
            confirmationMessage,
            () => handleSessionReset(currentSessionId),
            null,
            'warning'
        );
    } else if (window.confirm(confirmationMessage)) {
        handleSessionReset(currentSessionId);
    }
}

/**
 * Format file size
 */
const formatFileSizeLegacy = (bytes) => formatFileSize(bytes);

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
    
    if (!data) {
        return;
    }

    const taskType = (data.task_type || analysisResults?.task_type || selectedDataTypeKey || 'executions').toLowerCase();
    clearProblemSections();
    releaseProblemTables();
    updateSymbolMetadataCache(data?.symbol_metadata || data?.summary?.symbol_metadata);

    if (taskType === 'cashflows') {
        // Adjust duplicate/existing tables headers for cashflows context
        try {
            const existingHead = document.querySelector('#existingRecordsTable thead tr');
            if (existingHead) {
                existingHead.innerHTML = `
                    <th>סוג</th>
                    <th>סכום</th>
                    <th>מטבע</th>
                    <th>תאריך</th>
                    <th>חשבון</th>
                    <th>רמת ביטחון</th>
                    <th class="text-center">פעולות</th>
                `;
            }
            const withinHead = document.querySelector('#withinFileDuplicatesTable thead tr');
            if (withinHead) {
                withinHead.innerHTML = `
                    <th>סוג</th>
                    <th>סכום</th>
                    <th>מטבע</th>
                    <th>תאריך</th>
                    <th>חשבון</th>
                    <th>רמת ביטחון</th>
                    <th class="text-center">פעולות</th>
                `;
            }
        } catch (e) {
            window.Logger?.warn('[Import Modal] Failed to set cashflow headers for duplicates tables', { error: e?.message });
        }
        renderCashflowProblemSections(data);
        renderExecutionStyleProblems(data); // duplicates / existing
        updateActiveSessionFromPreview(data);
        return;
    }

    if (taskType === 'account_reconciliation') {
        renderAccountReconciliationProblems(data);
        renderExecutionStyleProblems(data);
        updateActiveSessionFromPreview(data);
        return;
    }

    // Default executions flow
    renderExecutionProblemSections(data);
    updateActiveSessionFromPreview(data);
}

/**
 * Clear all problem sections
 */
function clearProblemSectionsForSession() {
    const sections = [
        'missingTickersSection',
        'withinFileDuplicatesSection', 
        'existingRecordsSection',
        'cashflowMissingAccountsSection',
        'cashflowCurrencyIssuesSection',
        'accountMissingAccountsSection',
        'accountCurrencyMismatchesSection',
        'accountEntitlementWarningsSection',
        'accountImportWarningsSection',
        'accountExistingEntriesSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            setElementDisplay(section, 'none');
        }
    });
    
    const containers = [
        'missingTickersContainer',
        'missingAccountsContainer',
        'missingCashflowAccountsContainer'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    });
}

/**
 * Display missing tickers
 */
function displayMissingTickers(missingTickers) {
    const section = document.getElementById('missingTickersSection');
    const tableBody = document.getElementById('missingTickersTableBody');
    
    if (!section || !tableBody) return;
    
    const tracking = trackProblemStatus(
        'missingTickers',
        missingTickers,
        (ticker) => normalizeProblemTicker(ticker),
        (ticker) => {
            const symbol = normalizeProblemTicker(ticker);
            return {
                id: symbol,
                title: `${symbol} \u2013 טופל`,
                description: `הטיקר ${symbol} נוסף למערכת והוסר מרשימת הבעיות.`,
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(5, 'אין טיקרים חסרים.');
        markProblemTableReady('missingTickersTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map((entry) => renderMissingTickerRow(entry.item))
        .join('');
    markProblemTableReady('missingTickersTable');
}

/**
 * Display within-file duplicates
 */
function displayWithinFileDuplicates(duplicates, activeMatchIndexSet = new Set()) {
    const section = document.getElementById('withinFileDuplicatesSection');
    const tableBody = document.getElementById('withinFileDuplicatesTableBody');
    
    if (!section || !tableBody) return;
    
    const tracking = trackProblemStatus(
        'withinFileDuplicates',
        duplicates,
        (duplicate) => getDuplicateIdentifier(duplicate, 'within'),
        (duplicate) => buildDuplicateResolvedMeta(duplicate, 'כפילות בתוך הקובץ')
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(7, 'אין כפילויות פעילות בקובץ.');
        markProblemTableReady('withinFileDuplicatesTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map((entry) => renderDuplicateRow(entry.item, 'within_file', entry.index, activeMatchIndexSet))
        .join('');
    markProblemTableReady('withinFileDuplicatesTable');
}

function renderMissingTickerRow(ticker) {
    const normalizedSymbol = normalizeProblemTicker(ticker) || 'לא ידוע';
    const currency = typeof ticker === 'string'
        ? 'USD'
        : (ticker.currency || ticker.currency_code || '—');
    const metadata = getSymbolMetadata(normalizedSymbol) || (typeof ticker === 'object' ? ticker.metadata : null);
    const companyName = metadata?.company_name || ticker?.company_name || '—';
    const linksBlock = metadata
        ? buildMetadataLinksList(metadata, {
                    containerClass: 'missing-ticker-links',
                    listClass: 'missing-ticker-links-list',
                    statusClass: 'missing-ticker-links-status',
                    showStatus: true
        })
        : '';
    const linksHtml = linksBlock || '—';

    const addTickerBtn = `
        <button
            data-button-type="ADD"
            data-entity-type="ticker"
            data-variant="full"
            data-onclick="openAddTickerModal('${escapeAttribute(normalizedSymbol)}','${escapeAttribute(currency || 'USD')}')"
            data-text="הוסף טיקר"
            title="הוסף את הטיקר למערכת"
            aria-label="הוסף את הטיקר ${escapeAttribute(normalizedSymbol)} למערכת">
                </button>
    `;

    return `
        <tr>
            <td>${escapeHtml(normalizedSymbol)}</td>
            <td>${escapeHtml(currency || '—')}</td>
            <td>${escapeHtml(companyName || '—')}</td>
            <td>${linksHtml}</td>
            <td class="text-center">
                ${addTickerBtn}
            </td>
        </tr>
    `;
}

function renderCashflowMissingAccountRow(account) {
    const identifier = typeof account === 'string'
        ? account
        : (normalizeAccountIdentifier(account) || account.account_id || account.accountId || 'לא ידוע');
    const provider = typeof account === 'object'
        ? (account.provider || account.provider_name || account.metadata?.provider || account.source || '—')
        : '—';
    const status = typeof account === 'object'
        ? (account.status || account.account_status || account.state || 'missing')
        : 'missing';
    const detail = typeof account === 'object'
        ? (account.memo || account.note || account.metadata?.note || account.metadata?.description || '')
        : '';

    return `
        <tr>
            <td>${escapeHtml(identifier || 'לא ידוע')}</td>
            <td>${escapeHtml(provider || '—')}</td>
            <td>${escapeHtml(status)}</td>
            <td>${escapeHtml(detail || '—')}</td>
        </tr>
    `;
}

function renderCashflowCurrencyIssueRow(issue) {
    if (typeof issue === 'string') {
        return `
            <tr>
                <td>—</td>
                <td>${escapeHtml(issue)}</td>
                <td>—</td>
                <td>—</td>
            </tr>
        `;
    }

    const currency = issue.currency || issue.currency_code || issue.reported || 'לא ידוע';
    const message = issue.message || issue.detail || 'בעיה במטבע הרשומה';
    const sourceAccount = issue.source_account || issue.account || '—';
    const recordIndex = issue.record_index !== undefined ? issue.record_index : '—';

    return `
        <tr>
            <td>${escapeHtml(currency)}</td>
            <td>${escapeHtml(message)}</td>
            <td>${escapeHtml(sourceAccount)}</td>
            <td>${escapeHtml(recordIndex)}</td>
        </tr>
    `;
}

function renderAccountMissingAccountRow(account) {
    const identifier = typeof account === 'string'
        ? account
        : (normalizeAccountIdentifier(account) || account.account_id || account.accountId || 'לא ידוע');
    const status = typeof account === 'object'
        ? (account.status || account.account_status || account.state || 'missing')
        : 'missing';
    const detail = typeof account === 'object'
        ? (account.message || account.note || account.description || '')
        : '';

    return `
        <tr>
            <td>${escapeHtml(identifier || 'לא ידוע')}</td>
            <td>${escapeHtml(status)}</td>
            <td>${escapeHtml(detail || '—')}</td>
        </tr>
    `;
}

function renderAccountCurrencyMismatchRow(item) {
    if (typeof item === 'string') {
        return `
            <tr>
                <td>—</td>
                <td>—</td>
                <td>${escapeHtml(item)}</td>
            </tr>
        `;
    }

    const accountId = normalizeAccountIdentifier(item) || item.account_id || item.accountId || 'לא ידוע';
    const expected = item.expected || item.expected_currency || '—';
    const reported = item.reported || item.reported_currency || '—';

    return `
        <tr>
            <td>${escapeHtml(accountId)}</td>
            <td>${escapeHtml(expected)}</td>
            <td>${escapeHtml(reported)}</td>
        </tr>
    `;
}

function renderAccountEntitlementWarningRow(item) {
    if (typeof item === 'string') {
        return `
            <tr>
                <td>—</td>
                <td>${escapeHtml(item)}</td>
                <td>—</td>
            </tr>
        `;
    }

    const accountId = normalizeAccountIdentifier(item) || item.account_id || item.accountId || 'לא ידוע';
    const message = item.message || item.warning || 'חסרות הרשאות נדרשות';
    const entitlements = Array.isArray(item.entitlements)
        ? item.entitlements.join(', ')
        : (Array.isArray(item.current_entitlements) ? item.current_entitlements.join(', ') : '—');

    return `
        <tr>
            <td>${escapeHtml(accountId)}</td>
            <td>${escapeHtml(message)}</td>
            <td>${escapeHtml(entitlements || '—')}</td>
        </tr>
    `;
}

function renderAccountMissingDocumentsRow(item) {
    let accountId = 'לא ידוע';
    let documents = [];

    if (typeof item === 'string') {
        documents = [item];
    } else if (item && typeof item === 'object') {
        accountId = normalizeAccountIdentifier(item) || item.account_id || item.accountId || 'לא ידוע';
        if (Array.isArray(item.documents)) {
            documents = item.documents;
        } else if (Array.isArray(item.required_documents)) {
            documents = item.required_documents;
        }
    }

    if (!documents.length) {
        documents = ['—'];
    }

    return `
        <tr>
            <td>${escapeHtml(accountId)}</td>
            <td>${documents.map(doc => escapeHtml(doc)).join('<br>')}</td>
        </tr>
    `;
}

/**
 * Identify duplicate entries for tracking
 */
function getDuplicateIdentifier(duplicate, fallbackType = 'duplicate') {
    const { record } = extractPreviewRecord(duplicate);
    if (record?.external_id) {
        return `${fallbackType}:${record.external_id}`;
    }
    const symbol = normalizeProblemTicker(record?.symbol || duplicate.symbol);
    const date = record?.date || duplicate.date || '';
    const action = record?.action || duplicate.action || '';
    const amount = record?.amount || record?.quantity || duplicate.quantity || '';
    return `${fallbackType}:${symbol || 'UNKNOWN'}|${date}|${action}|${amount}`;
}

function buildDuplicateResolvedMeta(duplicate, typeLabel = 'כפילות') {
    const { record } = extractPreviewRecord(duplicate);
    const symbol = normalizeProblemTicker(record?.symbol || duplicate.symbol) || 'N/A';
    const dateValue = renderImportDate(record?.date || duplicate.date, '');
    return {
        id: getDuplicateIdentifier(duplicate, typeLabel),
        title: `${symbol} \u2013 ${typeLabel} טופלה`,
        description: dateValue
            ? `הרשומה מתאריך ${dateValue} הוסרה מרשימת הבעיות.`
            : 'הכפילות הוסרה מרשימת הבעיות.',
        icon: 'bi bi-check-circle'
    };
}

/**
 * Render duplicate/existing record card
 */
function extractPreviewRecord(entry) {
    if (!entry || typeof entry !== 'object') {
        return { record: entry, wrapper: entry };
    }
    if (entry.record && typeof entry.record === 'object') {
        return { record: entry.record, wrapper: entry };
    }
    return { record: entry, wrapper: entry };
}

function buildValueOrFallback(value, fallback = 'N/A') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    if (typeof value === 'object') {
        const hasDateEnvelopeShape = Boolean(
            value &&
            (
                Object.prototype.hasOwnProperty.call(value, 'utc') ||
                Object.prototype.hasOwnProperty.call(value, 'local') ||
                Object.prototype.hasOwnProperty.call(value, 'display') ||
                Object.prototype.hasOwnProperty.call(value, 'epochMs')
            )
        );
        if (hasDateEnvelopeShape) {
            const rendered = renderImportDate(value, fallback);
            return rendered || fallback;
        }
    }
    return value;
}

function renderTableEmptyRow(colspan, message) {
    return `
        <tr>
            <td colspan="${colspan}" class="empty-row">${escapeHtml(message)}</td>
        </tr>
    `;
}

function getPreviewRecordIndex(record, duplicate, fallbackIndex) {
    const candidates = [record, duplicate];
    for (const candidate of candidates) {
        if (!candidate || typeof candidate !== 'object') {
            continue;
        }
        if (typeof candidate.record_index === 'number') {
            return candidate.record_index;
        }
        if (typeof candidate.recordIndex === 'number') {
            return candidate.recordIndex;
        }
    }
    return typeof fallbackIndex === 'number' ? fallbackIndex : 0;
}

function renderDuplicateRow(duplicate, type, index, activeMatchIndexSet = new Set()) {
    const { record } = extractPreviewRecord(duplicate);
    const isCashflow = !!(record && (record.cashflow_type || typeof record.amount === 'number' || record.effective_date));
    // Executions-style defaults
    let col1 = record?.symbol || record?.ticker || duplicate.symbol || 'לא ידוע';
    let col2 = record?.action || duplicate.action || 'לא ידוע';
    let col3 = escapeHtml(buildValueOrFallback(record?.quantity ?? duplicate.quantity, '—'));
    let col4 = escapeHtml(buildValueOrFallback(record?.price ?? duplicate.price, '—'));
    let col5 = escapeHtml(renderImportDate(record?.date || duplicate.date, '—'));
    // Cashflows-style mapping
    if (isCashflow) {
        const typeLabel = resolveCashflowTypeLabel(record?.cashflow_type);
        const amountStr = formatAmount(record?.amount ?? duplicate.amount ?? 0);
        const currencyStr = record?.currency || duplicate.currency || '—';
        const dateStr = escapeHtml(renderImportDate(record?.effective_date || duplicate.effective_date, '—'));
        const accountDisplay = (typeof window.getTradingAccountName === 'function' && record?.source_account)
            ? escapeHtml(window.getTradingAccountName(record.source_account))
            : escapeHtml(buildValueOrFallback(record?.source_account ?? duplicate.source_account, '-'));
        col1 = typeLabel;
        col2 = amountStr;
        col3 = escapeHtml(currencyStr);
        col4 = dateStr;
        col5 = accountDisplay;
    }
    const confidence = duplicate.confidence_score || duplicate.confidence || 0;
    const confidenceClass = getConfidenceClass(confidence);
    const resolvedIndex = getPreviewRecordIndex(record, duplicate, index);
    const normalizedType = type === 'existing_record' ? 'existing_record' : 'within_file';
    const duplicateReason = record?.reason || duplicate.reason || (normalizedType === 'existing_record' ? 'existing_record' : 'within_file_duplicate');
    const matches = (duplicate?.details?.within_file_matches || []).filter(
        match => typeof match?.record_index === 'number' && activeMatchIndexSet.has(match.record_index)
    );
    const matchRows = renderDuplicateMatchRows(matches);

    const acceptButton = `
        <button
            data-button-type="APPROVE"
            data-variant="small"
            data-onclick="acceptDuplicate(${resolvedIndex}, '${duplicateReason}')"
            data-text="אשר"
            title="אשר רשומה זו"
            aria-label="אשר רשומה">
                </button>
    `;

    const rejectButton = `
        <button
            data-button-type="REJECT"
            data-variant="small"
            data-onclick="rejectDuplicate(${resolvedIndex}, '${duplicateReason}')"
            data-text="דחה"
            title="דחה רשומה זו"
            aria-label="דחה רשומה">
                </button>
    `;

    return `
        <tr>
            <td>${escapeHtml(col1)}</td>
            <td>${escapeHtml(col2)}</td>
            <td>${escapeHtml(col3)}</td>
            <td>${escapeHtml(col4)}</td>
            <td>${escapeHtml(col5)}</td>
            <td><span class="confidence-text ${confidenceClass}">${confidence}%</span></td>
            <td class="text-center table-action-buttons">
                ${acceptButton}
                ${rejectButton}
            </td>
        </tr>
        ${matchRows}
    `;
}

function renderDuplicateMatchRows(matches) {
    if (matches.length === 0) {
        return '';
    }

    return matches.map((match) => {
        const { record } = extractPreviewRecord(match);
        const isCashflow = !!(record && (record.cashflow_type || typeof record.amount === 'number' || record.effective_date));
        let m1 = record?.symbol || match.symbol || 'לא ידוע';
        let m2 = record?.action || match.action || 'לא ידוע';
        let m3 = escapeHtml(buildValueOrFallback(record?.quantity ?? match.quantity, '—'));
        let m4 = escapeHtml(buildValueOrFallback(record?.price ?? match.price, '—'));
        let m5 = escapeHtml(renderImportDate(record?.date || match.date, '—'));
        if (isCashflow) {
            const typeLabel = resolveCashflowTypeLabel(record?.cashflow_type);
            const amountStr = formatAmount(record?.amount ?? match.amount ?? 0);
            const currencyStr = record?.currency || match.currency || '—';
            const dateStr = escapeHtml(renderImportDate(record?.effective_date || match.effective_date, '—'));
            const accountDisplay = (typeof window.getTradingAccountName === 'function' && record?.source_account)
                ? escapeHtml(window.getTradingAccountName(record.source_account))
                : escapeHtml(buildValueOrFallback(record?.source_account ?? match.source_account, '-'));
            m1 = typeLabel;
            m2 = amountStr;
            m3 = escapeHtml(currencyStr);
            m4 = dateStr;
            m5 = accountDisplay;
        }
        const confidence = match.confidence_score || match.confidence || 0;
        const confidenceClass = getConfidenceClass(confidence);
        const matchIndex = getPreviewRecordIndex(record, match, match.record_index);

        const acceptMatchButton = `
            <button
                data-button-type="APPROVE"
                data-variant="small"
                data-onclick="acceptDuplicate(${matchIndex}, 'within_file_duplicate_match')"
                data-text="אשר"
                title="אשר רשומה תואמת"
                aria-label="אשר רשומה תואמת">
            </button>
        `;

        const rejectMatchButton = `
            <button
                data-button-type="REJECT"
                data-variant="small"
                data-onclick="rejectDuplicate(${matchIndex}, 'within_file_duplicate_match')"
                data-text="דחה"
                title="דחה רשומה תואמת"
                aria-label="דחה רשומה תואמת">
            </button>
        `;

        return `
            <tr class="duplicate-match-row">
                <td colspan="7">
                    <div class="duplicate-match-container">
                        <div class="duplicate-match-details">
                            <strong>רשומה תואמת:</strong>
                            <span>${escapeHtml(m1)}</span>
                            <span>${escapeHtml(m2)}</span>
                            <span>${escapeHtml(m3)}</span>
                            <span>${escapeHtml(m4)}</span>
                            <span>${escapeHtml(m5)}</span>
                            <span class="confidence-text ${confidenceClass}">${confidence}%</span>
                        </div>
                        <div class="duplicate-match-actions">
                            ${acceptMatchButton}
                            ${rejectMatchButton}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
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
    
    // Run refresh in background - don't block UI
    fetch(`/api/user-data-import/session/${currentSessionId}/refresh-preview`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (handleAccountLinkingBlockingResponse(data, 'refresh-preview')) {
            return;
        }
        if (data.success || data.status === 'success') {
            previewData = data.preview_data;
            updateSymbolMetadataCache(data.preview_data?.symbol_metadata || data.preview_data?.summary?.symbol_metadata);
            updateActiveSessionFromPreview(data.preview_data);
            // Refresh the current step display only if modal is still open
            if (currentStep === 2) {
                displayProblemResolutionDetailed(data.preview_data);
            } else if (currentStep === 3) {
                displayProblemResolutionDetailed(data.preview_data);
            } else if (currentStep === 4) {
                displayPreview(data.preview_data);
            }
        } else {
            // Don't show error notification if modal is closed - user already moved on
            if (document.getElementById('importUserDataModal')?.classList.contains('show')) {
                showImportUserDataNotification(`שגיאה ברענון התצוגה: ${data.error}`, 'error');
            }
        }
    })
    .catch(error => {
        window.Logger?.warn('[Import Modal] Refresh preview error (non-blocking)', {
            error: error?.message,
            page: 'import-user-data'
        });
        // Don't show error notification if modal is closed
        if (document.getElementById('importUserDataModal')?.classList.contains('show')) {
            showImportUserDataNotification('שגיאה ברענון התצוגה', 'error');
        }
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

function getImportDebugState(symbol) {
    const normalizedSymbol = typeof symbol === 'string' ? symbol.trim().toUpperCase() : null;
    const cacheSnapshot = { ...symbolMetadataCache };
    const analysisMeta = analysisResults?.symbol_metadata || {};
    const previewMeta = previewData?.symbol_metadata || {};

    return {
        currentSessionId,
        currentStep,
        selectedDataTypeKey,
        dataTypeAvailability: { ...dataTypeAvailabilityMap },
        metadata: normalizedSymbol
            ? {
                symbol: normalizedSymbol,
                cacheEntry: cacheSnapshot[normalizedSymbol] || null,
                analysisEntry: analysisMeta[normalizedSymbol] || null,
                previewEntry: previewMeta[normalizedSymbol] || null
            }
            : {
                cacheKeys: Object.keys(cacheSnapshot),
                analysisKeys: Object.keys(analysisMeta),
                previewKeys: Object.keys(previewMeta)
            },
        raw: {
            analysisResults,
            previewData
        }
    };
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
window.proceedToPreviewFromProblems = proceedToPreviewFromProblems;
window.proceedToProblemResolution = proceedToProblemResolution;
window.resumeActiveImportSession = resumeActiveImportSession;
window.getImportDebugState = getImportDebugState;
window.linkExternalAccountToTradingAccount = linkExternalAccountToTradingAccount;
window.confirmAutoLinkedAccount = confirmAutoLinkedAccount;
window.openAccountLinkingModalManually = openAccountLinkingModalManually;
window.showAccountLinkingSelection = showAccountLinkingSelection;
window.submitAccountLinkSelection = submitAccountLinkSelection;
window.hideAccountLinkingModal = hideAccountLinkingModal;
function renderExecutionProblemSections(data) {
    const summary = data.summary || {};
    const availableMissingTikcers = []
        .concat(Array.isArray(data.missing_tickers) ? data.missing_tickers : [])
        .concat(Array.isArray(summary.missing_tickers) ? summary.missing_tickers : []);

    const missingFromSkip = (data.records_to_skip || [])
        .filter(record => record.reason === 'missing_ticker')
        .map(record => ({
            symbol: record.missing_ticker || record.record?.symbol,
            currency: record.record?.currency || 'USD'
        }));

    const combinedMissing = [...availableMissingTikcers, ...missingFromSkip];

    const uniqueMissing = [];
    const seenSymbols = new Set();

    combinedMissing.forEach((entry) => {
        if (!entry) {
            return;
        }
        if (typeof entry === 'string') {
            if (!seenSymbols.has(entry)) {
                seenSymbols.add(entry);
                uniqueMissing.push(entry);
            }
            return;
        }
        const symbol = entry.symbol || entry.ticker || entry.display_symbol;
        if (!symbol || seenSymbols.has(symbol)) {
            return;
        }
        seenSymbols.add(symbol);
        uniqueMissing.push({
            symbol,
            currency: entry.currency || entry.currency_code || 'USD'
        });
    });

    displayMissingTickers(uniqueMissing);

    renderExecutionStyleProblems(data);
}

function renderExecutionStyleProblems(data) {
    const skipRecords = data.records_to_skip || [];
    const withinFileDuplicates = skipRecords.filter(record => record.reason === 'within_file_duplicate');
    const activeMatchIndexSet = new Set(
        skipRecords
            .filter(record => record.reason === 'within_file_duplicate_match' && typeof record.record_index === 'number')
            .map(record => record.record_index)
    );

    displayWithinFileDuplicates(withinFileDuplicates, activeMatchIndexSet);

    const existingRecords = skipRecords.filter(record => record.reason === 'existing_record');
    displayExistingRecords(existingRecords);
}

function renderCashflowProblemSections(data) {
    const missingAccounts = data.missing_accounts || data.summary?.missing_accounts || [];
    displayCashflowMissingAccounts(missingAccounts);

    const currencyIssues = data.currency_issues || data.summary?.currency_issues || [];
    displayCashflowCurrencyIssues(currencyIssues);
}

function renderAccountReconciliationProblems(data) {
    const issues = data.summary?.issues || {};

    const missingAccounts = data.missing_accounts || issues.missing_accounts || [];
    displayAccountMissingAccounts(missingAccounts);

    const currencyMismatches = data.base_currency_mismatches || issues.base_currency_mismatches || [];
    displayAccountCurrencyMismatches(currencyMismatches);

    const entitlementWarnings = data.entitlement_warnings || issues.entitlement_warnings || [];
    displayAccountEntitlementWarnings(entitlementWarnings);

    const missingDocuments = data.missing_documents_report || issues.missing_documents_report || [];
    displayAccountMissingDocuments(missingDocuments);
}

function displayCashflowMissingAccounts(accounts) {
    const section = document.getElementById('cashflowMissingAccountsSection');
    const tableBody = document.getElementById('cashflowMissingAccountsTableBody');
    if (!section || !tableBody) return;

    const tracking = trackProblemStatus(
        'cashflowMissingAccounts',
        accounts,
        (account) => {
            const identifier = normalizeAccountIdentifier(account);
            return identifier ? `cashflow-missing-account:${identifier}` : null;
        },
        (account) => {
            const identifier = normalizeAccountIdentifier(account) || 'חשבון';
            return {
                id: identifier,
                title: `${identifier} \u2013 טופל`,
                description: 'החשבון שויך או נוצר בהצלחה והוסר מרשימת הבעיות.',
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(4, 'אין חשבונות חסרים.');
        markProblemTableReady('cashflowMissingAccountsTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map(({ item }) => renderCashflowMissingAccountRow(item))
        .join('');
    markProblemTableReady('cashflowMissingAccountsTable');
}

function displayCashflowCurrencyIssues(issues) {
    const section = document.getElementById('cashflowCurrencyIssuesSection');
    const tableBody = document.getElementById('cashflowCurrencyIssuesTableBody');
    if (!section || !tableBody) return;

    const tracking = trackProblemStatus(
        'cashflowCurrencyIssues',
        issues,
        (issue) => {
            if (typeof issue === 'string') {
                return buildGenericIdentifier(issue, 'cashflow-currency');
            }
            const currency = issue.currency || issue.currency_code || issue.reported || 'unknown';
            const source = issue.source_account || issue.account || '';
            const index = issue.record_index ?? '';
            return `cashflow-currency:${currency}|${source}|${index}`;
        },
        (issue) => {
            const currency = typeof issue === 'string'
                ? issue
                : (issue.currency || issue.currency_code || issue.reported || 'מטבע');
            return {
                id: typeof issue === 'string' ? issue : JSON.stringify(issue),
                title: `${currency} \u2013 טופל`,
                description: 'בעיית המטבע נפתרה והוסרה מהרשימה.',
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(4, 'אין בעיות מטבע פעילות.');
        markProblemTableReady('cashflowCurrencyIssuesTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map(({ item }) => renderCashflowCurrencyIssueRow(item))
        .join('');
    markProblemTableReady('cashflowCurrencyIssuesTable');
}

function displayAccountMissingAccounts(accounts) {
    const section = document.getElementById('accountMissingAccountsSection');
    const tableBody = document.getElementById('accountMissingAccountsTableBody');
    if (!section || !tableBody) return;

    const tracking = trackProblemStatus(
        'accountMissingAccounts',
        accounts,
        (account) => {
            const identifier = normalizeAccountIdentifier(account);
            return identifier ? `account-missing:${identifier}` : null;
        },
        (account) => {
            const identifier = normalizeAccountIdentifier(account) || 'חשבון';
            return {
                id: identifier,
                title: `${identifier} \u2013 טופל`,
                description: 'החשבון שויך או נוצר בהצלחה והוסר מרשימת הבעיות.',
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(3, 'אין חשבונות חסרים.');
        markProblemTableReady('accountMissingAccountsTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map(({ item }) => renderAccountMissingAccountRow(item))
        .join('');
    markProblemTableReady('accountMissingAccountsTable');
}

function displayAccountCurrencyMismatches(items) {
    const section = document.getElementById('accountCurrencyMismatchesSection');
    const tableBody = document.getElementById('accountCurrencyMismatchesTableBody');
    if (!section || !tableBody) return;

    const tracking = trackProblemStatus(
        'accountCurrencyMismatches',
        items,
        (item) => {
            if (typeof item === 'string') {
                return buildGenericIdentifier(item, 'account-currency');
            }
            const accountId = item.account_id || item.accountId || 'unknown';
            const expected = item.expected || item.expected_currency || '';
            const reported = item.reported || item.reported_currency || '';
            return `account-currency:${accountId}|${expected}|${reported}`;
        },
        (item) => {
            const accountId = typeof item === 'string'
                ? 'חשבון'
                : (item.account_id || item.accountId || 'חשבון');
            return {
                id: accountId,
                title: `${accountId} \u2013 טופל`,
                description: 'אי ההתאמה במטבע נפתרה והוסרה מהרשימה.',
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(3, 'אין אי התאמות במטבעי בסיס.');
        markProblemTableReady('accountCurrencyMismatchesTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map(({ item }) => renderAccountCurrencyMismatchRow(item))
        .join('');
    markProblemTableReady('accountCurrencyMismatchesTable');
}

function displayAccountEntitlementWarnings(items) {
    const section = document.getElementById('accountEntitlementWarningsSection');
    const tableBody = document.getElementById('accountEntitlementWarningsTableBody');
    if (!section || !tableBody) return;

    const tracking = trackProblemStatus(
        'accountEntitlementWarnings',
        items,
        (item) => {
            if (typeof item === 'string') {
                return buildGenericIdentifier(item, 'account-entitlement');
            }
            const accountId = item.account_id || item.accountId || 'unknown';
            const restriction = item.restriction || item.restriction_type || '';
            return `account-entitlement:${accountId}|${restriction}`;
        },
        (item) => {
            const accountId = typeof item === 'string'
                ? 'חשבון'
                : (item.account_id || item.accountId || 'חשבון');
            return {
                id: accountId,
                title: `${accountId} \u2013 הרשאות טופלו`,
                description: 'אזהרת ההרשאות סומנה כפתורה.',
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(3, 'אין התראות הרשאות פעילות.');
        markProblemTableReady('accountEntitlementWarningsTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map(({ item }) => renderAccountEntitlementWarningRow(item))
        .join('');
    markProblemTableReady('accountEntitlementWarningsTable');
}

function displayAccountMissingDocuments(items) {
    const section = document.getElementById('accountMissingDocumentsSection');
    const tableBody = document.getElementById('accountMissingDocumentsTableBody');
    if (!section || !tableBody) return;

    const tracking = trackProblemStatus(
        'accountMissingDocuments',
        items,
        (item) => {
            if (typeof item === 'string') {
                return buildGenericIdentifier(item, 'account-doc');
            }
            const accountId = item.account_id || item.accountId || 'unknown';
            const docs = Array.isArray(item.documents)
                ? item.documents.join('|')
                : Array.isArray(item.required_documents)
                    ? item.required_documents.join('|')
                    : '';
            return `account-doc:${accountId}|${docs}`;
        },
        (item) => {
            const accountId = typeof item === 'string'
                ? 'חשבון'
                : (item.account_id || item.accountId || 'חשבון');
            return {
                id: accountId,
                title: `${accountId} \u2013 מסמכים הושלמו`,
                description: 'המסמכים החסרים הועלו או אושרו.',
                icon: 'bi bi-check-circle'
            };
        }
    );

    const unresolvedEntries = tracking.unresolvedItems || [];

    if (unresolvedEntries.length === 0) {
        setElementDisplay(section, 'none');
        tableBody.innerHTML = renderTableEmptyRow(2, 'אין מסמכים חסרים.');
        markProblemTableReady('accountMissingDocumentsTable');
        return;
    }

    setElementDisplay(section, 'block');
    tableBody.innerHTML = unresolvedEntries
        .map(({ item }) => renderAccountMissingDocumentsRow(item))
        .join('');
    markProblemTableReady('accountMissingDocumentsTable');
}

function getEntityTypeForImport(key) {
    return IMPORT_DATA_TYPE_DEFINITIONS[key]?.entityType || 'cash_flow';
}

function applyEntityTypeToImportButtons(entityType = 'cash_flow') {
    const entityButtons = [
        'analyzeBtn',
        'analysisContinueBtn',
        'confirmImportHeaderBtn',
        'confirmImportAndReportHeaderBtn',
        'resetImportSessionBtn',
        'cancelImportStepBtn'
    ];

    entityButtons.forEach((id) => {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }

        const current = button.getAttribute('data-entity-type');
        if (current === entityType) {
            return;
        }

        button.setAttribute('data-entity-type', entityType);

        const buttonType = (button.getAttribute('data-button-type') || '').toUpperCase();
        if (buttonType && window.advancedButtonSystem?.constructor?.ENTITY_VARIANT_BUTTONS?.includes(buttonType)) {
            try {
                window.advancedButtonSystem.applyEntityColors(button, entityType);
            } catch (error) {
                window.Logger?.debug?.('[Import Modal] Failed to apply entity colors directly', {
                    error: error.message
                });
            }
        }
    });

    const entityCssKey = String(entityType || '')
        .trim()
        .toLowerCase()
        .replace(/_/g, '-');
    const entityColorVar = entityCssKey
        ? `var(--entity-${entityCssKey}-color, var(--warning-color, #fd7e14))`
        : `var(--warning-color, #fd7e14)`;
    const entityTextVar = entityCssKey
        ? `var(--entity-${entityCssKey}-text, var(--warning-text-color, #0c5460))`
        : `var(--warning-text-color, #0c5460)`;

    document
        .querySelectorAll('.active-session-warning-card')
        .forEach((card) => {
            card.setAttribute('data-entity-type', entityType || '');
            card.style.setProperty('--active-session-entity-color', entityColorVar);
            card.style.setProperty('--active-session-entity-text', entityTextVar);
        });
}

const displayExistingRecordsLegacy = (records) => displayExistingRecords(records);

const clearProblemSectionsLegacy = () => clearProblemSections();
