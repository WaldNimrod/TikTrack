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
 *   - renderMissingTickerCard()
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
let selectedDataTypeKey = 'executions';
let currencyCacheByCode = null;
let tickersModalConfigPromise = null;
let activeSessionInfo = null;
let symbolMetadataCache = {};
const TICKER_REMARKS_EDITOR_ID = 'tickerRemarksRichText';
const ACTIVE_SESSION_STORAGE_KEY = 'tiktrack_import_user_data_session';
const ACTIVE_SESSION_SOURCE = 'import-user-data';
let importModalBootstrapInstance = null;
let problemTrackingSessionId = null;

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
        description: 'פלייסהולדר: השוואת פוזיציות פתוחות, NAV ושווי שוק מול נתוני המערכת.',
        documentationAnchor: '#portfolio-reconciliation-pipeline',
        entityType: 'position'
    },
    taxes_and_fx: {
        key: 'taxes_and_fx',
        label: 'ריביות, מיסים והפרשי מטבע',
        description: 'פלייסהולדר: זיהוי הפרשים בריביות, מיסים ותרגומי מטבע ביחס לנתוני הבסיס.',
        documentationAnchor: '#taxes-and-fx-pipeline',
        entityType: 'cash_flow'
    }
};
const ACTIVE_IMPORT_DATA_TYPES = new Set(['executions', 'cashflows', 'account_reconciliation']);

const PROBLEM_RESOLUTION_TTL = 5 * 60 * 1000; // 5 minutes

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
    (items || []).forEach((item) => {
        const id = identifierFn(item);
        if (!id) {
            return;
        }
        const meta = metadataFn ? metadataFn(item) : { id, title: id };
        currentMap.set(id, meta);
    });

    prevMap.forEach((meta, id) => {
        if (!currentMap.has(id)) {
            resolvedMap.set(id, {
                meta,
                resolvedAt: now
            });
        }
    });

    currentMap.forEach((meta, id) => {
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
        resolvedEntries: Array.from(resolvedMap.values()).map(entry => entry.meta),
        currentMap
    };
}

function renderResolvedProblemCard(meta = {}) {
    const title = escapeHtml(meta.title || meta.id || 'בעיה טופלה');
    const description = escapeHtml(meta.description || 'הבעיה טופלה בהצלחה.');
    const icon = meta.icon || 'bi bi-check-circle';
    return `
        <div class="problem-card resolved-card">
            <div class="problem-card-header">
                <i class="${icon}"></i>
                <span>${title}</span>
            </div>
            <div class="problem-card-body">
                <p>${description}</p>
            </div>
        </div>
    `;
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
        processingOverlayElement.style.display = 'flex';
    }
}

function hideProcessingOverlay() {
    if (processingOverlayElement) {
        processingOverlayElement.style.display = 'none';
    }
}

function setAnalysisLoadingState(isLoading, message = 'טוען ומעבד נתונים...', progress = null) {
    const indicator = document.getElementById('analysisLoadingIndicator');
    if (indicator) {
        indicator.style.display = isLoading ? 'flex' : 'none';
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

    Object.values(IMPORT_DATA_TYPE_DEFINITIONS).forEach((definition) => {
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
        { section: 'cashflowIssuesSummarySection', content: 'cashflowIssuesSummaryList' }
    ];

    sections.forEach(({ section, content }) => {
        const sectionElement = document.getElementById(section);
        const contentElement = content ? document.getElementById(content) : null;
        if (contentElement) {
            contentElement.innerHTML = '';
        }
        if (sectionElement) {
            sectionElement.style.display = 'none';
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
    const entries = Object.entries(typeStats);
    if (!entries.length) {
        section.style.display = 'none';
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

            const card = document.createElement('div');
            card.className = 'analysis-card';
            card.innerHTML = `
                <div class="card-icon"><i class="bi bi-diagram-3"></i></div>
                <div class="card-content">
                    <div class="card-number">${formatNumber(total)}</div>
                    <div class="card-label">${resolveCashflowTypeLabel(typeKey)}</div>
                    <small>✅ ${formatNumber(valid)} | ⚠️ ${formatNumber(invalid)}</small>
                    <small>סה״כ סכום: ${formatAmount(amount)}</small>
                    ${primaryCurrencyEntry ? `<small>מטבע מוביל: ${primaryCurrencyEntry[0]} ${formatAmount(primaryCurrencyEntry[1])}</small>` : ''}
                </div>
            `;
            container.appendChild(card);
        });

    section.style.display = 'block';
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
        section.style.display = 'none';
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

    section.style.display = 'block';
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
        section.style.display = 'none';
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

    section.style.display = 'block';
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

    textarea.style.display = 'none';
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

function updateResetSessionButtonState() {
    const resetButton = document.getElementById('resetImportSessionBtn');
    const resumeButton = document.getElementById('resumeImportSessionBtn');
    const hasSession = Boolean(currentSessionId);

    if (!resetButton) {
        if (resumeButton) {
            resumeButton.style.display = hasSession ? 'inline-flex' : 'none';
            resumeButton.disabled = !hasSession;
            resumeButton.setAttribute('aria-disabled', hasSession ? 'false' : 'true');
        }
        updateActiveSessionIndicator();
        return;
    }

    resetButton.style.display = hasSession ? 'inline-flex' : 'none';
    resetButton.disabled = !hasSession;
    resetButton.setAttribute('aria-disabled', hasSession ? 'false' : 'true');

    if (resumeButton) {
        resumeButton.style.display = hasSession ? 'inline-flex' : 'none';
        resumeButton.disabled = !hasSession;
        resumeButton.setAttribute('aria-disabled', hasSession ? 'false' : 'true');
    }

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
    const taskType = updates.taskType ?? activeSessionInfo.taskType ?? selectedDataTypeKey ?? 'executions';
    
    activeSessionInfo.fileName = fileName;
    activeSessionInfo.fileSize = fileSize;
    activeSessionInfo.accountName = accountName;
    activeSessionInfo.accountId = accountIdValue;
    activeSessionInfo.connector = connectorValue;
    activeSessionInfo.connectorName = connectorName;
    activeSessionInfo.taskType = taskType;
    selectedDataTypeKey = taskType;
    
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
    
    updateActiveSessionIndicator();
    updateResetSessionButtonState();
    persistActiveSession();
}

function updateActiveSessionIndicator() {
    const indicator = document.getElementById('activeSessionIndicator');
    const controlsRow = document.getElementById('activeSessionControlsRow');
    const detailsRow = document.getElementById('activeSessionDetailsRow');
    if (!indicator) {
        return;
    }
    
    if (!currentSessionId || !activeSessionInfo) {
        indicator.style.display = 'none';
        indicator.setAttribute('data-has-session', 'false');
        if (controlsRow) {
            controlsRow.style.display = 'none';
        }
        if (detailsRow) {
            detailsRow.style.display = 'none';
        }
        return;
    }
    
    indicator.style.display = 'block';
    indicator.setAttribute('data-has-session', 'true');
    if (controlsRow) {
        controlsRow.style.display = '';
    }
    if (detailsRow) {
        detailsRow.style.display = '';
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
            status: activeSessionInfo?.status || 'ניתוח הושלם'
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
            status: activeSessionInfo?.status || 'ניתוח הושלם'
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
        status: activeSessionInfo?.status || 'ניתוח הושלם'
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
        
        updateSymbolMetadataCache(summary?.symbol_metadata || session.symbol_metadata);
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
    }
    
    setTimeout(() => {
        window.refreshDataImportHistory?.();
    }, 250);

    resetImportModal();
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
    dataTypeAvailabilityMap = {};
    selectedDataTypeKey = 'executions';
    activeSessionInfo = null;
    clearSymbolMetadataCache();
    clearProblemTrackingState();
    problemTrackingSessionId = null;
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
        fileInfo.style.display = 'none';
    }
    
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.style.display = 'block';
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

    const analysisActions = document.getElementById('analysisStepActions');
    const continueBtn = document.getElementById('analysisContinueBtn');
    if (analysisActions) {
        analysisActions.style.display = 'none';
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
        loadStep1Content();
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

    updateHeaderActions(step);
}

/**
 * Load step 1 content (File & Account Selection)
 */
function loadStep1Content() {
    // The HTML content is already in the DOM, just need to load accounts
    // Event listeners are already set up during initialization
    initializeDataTypeSelector();
    loadAccounts();
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
        window.Logger.error('[Import Modal] Account select element not found in modal!', { page: 'import-user-data' });
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

    const backButtons = modal?.querySelectorAll('[data-import-back-step]');
    if (backButtons && backButtons.length) {
        backButtons.forEach((button) => {
            if (button.dataset.backListenerAttached === 'true') {
                return;
            }
            const targetStep = Number(button.getAttribute('data-import-back-step'));
            button.addEventListener('click', (event) => {
                event?.preventDefault?.();
                event?.stopPropagation?.();
                goToStep(Number.isNaN(targetStep) ? 1 : targetStep);
            });
            button.dataset.backListenerAttached = 'true';
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

function updateHeaderActions(step) {
    const uploadActions = document.getElementById('uploadStepActions');
    if (uploadActions) {
        uploadActions.style.display = step === 1 ? 'flex' : 'none';
    }

    const analysisActions = document.getElementById('analysisStepActions');
    if (analysisActions) {
        analysisActions.style.display = step === 2 ? 'flex' : 'none';
    }

    const previewActions = document.getElementById('previewStepActions');
    if (previewActions) {
        previewActions.style.display = step === 3 ? 'flex' : 'none';
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
    if (!currentSessionId) {
        throw new Error('לא נמצא מזהה סשן פעיל');
    }

    const encodedTask = encodeURIComponent(taskKey);
    setAnalysisLoadingState(true, loadingMessage, 90);

    try {
        const analysisResponse = await fetch(`/api/user-data-import/session/${currentSessionId}/analyze?task_type=${encodedTask}`);
        const analysisJson = await analysisResponse.json();

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
            section.style.display = 'none';
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
 * Display existing records
 */
function displayExistingRecords(existingRecords) {
    const section = document.getElementById('existingRecordsSection');
    const container = document.getElementById('existingRecordsContainer');
    
    if (!section || !container) return;
    
    const tracking = trackProblemStatus(
        'existingRecords',
        existingRecords,
        (record) => getDuplicateIdentifier(record, 'existing'),
        (record) => buildDuplicateResolvedMeta(record, 'רשימה קיימת')
    );

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (existingRecords || []).map((record, index) => 
        renderDuplicateCard(record, 'existing_record', index)
    );
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
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
    validateFileSelection({ showNotification: false });
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
        const accountSelect = modal.querySelector('#tradingAccountSelect');
        
    const dataTypeSelect = modal.querySelector('#importDataTypeSelect');
    const connectorValue = connectorSelect?.value || '';
    const accountValue = accountSelect?.value || '';
    const dataTypeValue = dataTypeSelect?.value || selectedDataTypeKey || '';
    const accountSelectedIndex = accountSelect?.selectedIndex ?? -1;
    const accountSelectedOption = accountSelect?.options?.[accountSelectedIndex];
        
        // Check both local and global selectedFile variables
        const currentSelectedFile = selectedFile || window.selectedFile;
        
    const accountValid = Boolean(accountValue && accountValue !== '0' && !Number.isNaN(Number(accountValue)));
    const dataTypeValid = Boolean(dataTypeValue && IMPORT_DATA_TYPE_DEFINITIONS[dataTypeValue]);
    const allFieldsFilled = Boolean(currentSelectedFile && connectorValue && accountValid && dataTypeValid);
    
        const debugInfo = {
            selectedFile: !!currentSelectedFile,
            selectedFileName: currentSelectedFile?.name,
            connectorSelectExists: !!connectorSelect,
            connectorValue: connectorValue,
            accountSelectExists: !!accountSelect,
            accountValue: accountValue,
        accountSelectedIndex,
            accountSelectedOptionText: accountSelectedOption?.text,
            accountSelectedOptionValue: accountSelectedOption?.value,
        accountValid,
        dataTypeValue,
        dataTypeValid,
            allFieldsFilled,
            page: 'import-user-data'
    };
    
    window.Logger.debug('[Import Modal] Analyze button state check', debugInfo);
        
        if (allFieldsFilled) {
        analyzeBtn.disabled = false;
        analyzeBtn.setAttribute('aria-disabled', 'false');
            window.Logger.info('[Import Modal] Analyze button enabled', { 
                accountValue: accountValue,
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
        fileInfo.style.display = 'none';
    }
    if (dropZone) {
        dropZone.style.display = 'block';
    }
    
    if (window.clearFieldValidation) {
        window.clearFieldValidation(fileInput);
    }
    
    // Update analyze button
    validateFileSelection({ showNotification: false });
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
        validateAccountSelection({ showNotification: false });
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
    validateConnectorSelection({ showNotification: false });
    
    // Wait a tick to ensure DOM is updated, then update button
    requestAnimationFrame(() => {
        updateAnalyzeButton();
    });
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
    const { showNotification = false, touch = false } = options;
    const accountSelect = document.getElementById('tradingAccountSelect');

    if (!accountSelect) {
        window.Logger.error('[Import Modal] Account select element not found for validation', { page: 'import-user-data' });
        if (showNotification) {
            showImportUserDataNotification('שדה חשבון מסחר לא נמצא', 'error', 'שגיאה');
        }
        return false;
    }

    const value = accountSelect.value;
    if (!value) {
        if (touch) {
            const validationResult = window.validateSelectField(accountSelect, {
                required: true,
                customValidation: () => 'חובה לבחור חשבון מסחר'
            });
            if (validationResult !== true) {
                window.Logger.warn('[Import Modal] Account validation failed', { error: validationResult, page: 'import-user-data' });
                if (showNotification) {
                    showImportUserDataNotification(validationResult, 'error', 'שגיאה');
                }
            }
        } else if (window.clearFieldValidation) {
            window.clearFieldValidation(accountSelect);
        }
        return false;
    }

    const validationResult = window.validateSelectField(accountSelect, {
            required: true,
            customValidation: (value) => {
                if (!value || value === '') {
                return 'חובה לבחור חשבון מסחר';
                }
                return true;
            }
        });
        
    if (validationResult === true) {
        window.Logger.debug('[Import Modal] Account validation passed', { page: 'import-user-data' });
        return true;
    }

    window.Logger.warn('[Import Modal] Account validation failed', { error: validationResult, page: 'import-user-data' });
    if (touch || showNotification) {
        showImportUserDataNotification(validationResult, 'error', 'שגיאה');
    }
    return false;
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

    const accountValid = validateAccountSelection({ showNotification: false, touch: true });
    if (!accountValid) {
        errors.push('חובה לבחור חשבון מסחר');
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

    const isValid = fileValid && connectorValid && accountValid && dataTypeValid;

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
    const accountSelect = modal?.querySelector('#tradingAccountSelect');
    const dataTypeSelect = modal?.querySelector('#importDataTypeSelect');
    
    const connectorValue = connectorSelect?.value;
    const accountValue = accountSelect?.value;
    const dataTypeValue = dataTypeSelect?.value || selectedDataTypeKey || 'executions';
    
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
    selectedDataTypeKey = dataTypeValue;
    formData.append('task_type', selectedDataTypeKey);
    
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
        if (data.success || data.status === 'success') {
            window.Logger.info('[Import Modal] File analysis completed', { data, page: 'import-user-data' });
            currentSessionId = data.session_id;
            window.currentSessionId = data.session_id; // Make it global
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
                accountName: accountSelect?.selectedOptions?.[0]?.text?.trim(),
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
        } else {
            renderExecutionAnalysisSummary(results);
        }

        updateActiveSessionFromAnalysis(results);
        const availability = detectAvailableDataTypes(results);
        updateDataTypeAvailability(availability);

        const stepActions = document.getElementById('analysisStepActions');
        const continueBtn = document.getElementById('analysisContinueBtn');
        if (stepActions && continueBtn) {
            stepActions.style.display = 'flex';
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

function detectAvailableDataTypes(results = {}) {
    const detected = [];
    const detectedTasks =
        results.detected_tasks ||
        results.summary?.detected_tasks ||
        results.summary_data?.detected_tasks ||
        {};
    const executionsDefinition = IMPORT_DATA_TYPE_DEFINITIONS.executions;
    const totalExecutions = Number(
        detectedTasks.executions?.records ??
        results.total_records ??
        results.records_total ??
        0
    );
    detected.push({
        ...executionsDefinition,
        records: totalExecutions,
        status: ACTIVE_IMPORT_DATA_TYPES.has(executionsDefinition.key) ? 'available' : 'planned'
    });
    
    const cashflowsDefinition = IMPORT_DATA_TYPE_DEFINITIONS.cashflows;
    const cashflowsCount = Number(
        detectedTasks.cashflows?.records ??
        results.cashflow_records ??
        results.cashflow_summary?.record_count ??
        results.summary?.cashflows_total ??
        results.summary_data?.cashflows_total ??
        0
    );
    detected.push({
        ...cashflowsDefinition,
        records: cashflowsCount,
        status: ACTIVE_IMPORT_DATA_TYPES.has(cashflowsDefinition.key) ? 'available' : 'planned'
    });
    
    const accountDefinition = IMPORT_DATA_TYPE_DEFINITIONS.account_reconciliation;
    const accountsDetected = Number(
        detectedTasks.account_reconciliation?.records ??
        results.accounts_detected ??
        results.summary?.accounts_detected ??
        results.summary_data?.accounts_detected ??
        0
    );
    detected.push({
        ...accountDefinition,
        records: accountsDetected,
        status: ACTIVE_IMPORT_DATA_TYPES.has(accountDefinition.key) ? 'available' : 'planned'
    });
    
    const portfolioDefinition = IMPORT_DATA_TYPE_DEFINITIONS.portfolio_positions;
    detected.push({
        ...portfolioDefinition,
        records: Number(results.positions_detected ?? 0),
        status: ACTIVE_IMPORT_DATA_TYPES.has(portfolioDefinition.key) ? 'available' : 'planned'
    });
    
    const taxesDefinition = IMPORT_DATA_TYPE_DEFINITIONS.taxes_and_fx;
    detected.push({
        ...taxesDefinition,
        records: Number(results.taxes_detected ?? results.fx_adjustments ?? 0),
        status: ACTIVE_IMPORT_DATA_TYPES.has(taxesDefinition.key) ? 'available' : 'planned'
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

    try {
        const response = await fetch(`/api/user-data-import/session/${currentSessionId}/preview?task_type=${encodeURIComponent(taskKey)}`, {
        method: 'GET'
        });
        const data = await response.json();

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
                stepActions.style.display = 'flex';
            }
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.setAttribute('aria-disabled', 'false');
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
            stepActions.style.display = 'flex';
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
            stepActions.style.display = 'flex';
        }
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.setAttribute('aria-disabled', 'false');
        }
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
    try {
        const resumeBtn = document.getElementById('resumeImportSessionBtn');
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
    
    const taskType = (data.task_type || analysisResults?.task_type || selectedDataTypeKey || 'executions').toLowerCase();
    const recordsToImport = data.records_to_import || [];
    const recordsToSkip = data.records_to_skip || [];
    const summary = data.summary || {};

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
            row.innerHTML = `
                <td>${record.symbol || record.ticker || 'N/A'}</td>
                <td>${record.action || 'N/A'}</td>
                <td>${record.quantity || 'N/A'}</td>
                <td>${record.price || 'N/A'}</td>
                <td>${record.fee || record.commission || 'N/A'}</td>
                <td>${realizedPL}</td>
                <td>${mtmPL}</td>
                <td>${record.date || 'N/A'}</td>
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
                <td>${buildValueOrFallback(record.cashflow_type)}</td>
                <td>${buildValueOrFallback(record.amount)}</td>
                <td>${buildValueOrFallback(record.currency)}</td>
                <td>${buildValueOrFallback(record.effective_date)}</td>
                <td>${buildValueOrFallback(record.source_account)}</td>
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
                <td>${buildValueOrFallback(record.cashflow_type)}</td>
                <td>${buildValueOrFallback(record.amount)}</td>
                <td>${buildValueOrFallback(record.currency)}</td>
                <td>${buildValueOrFallback(record.effective_date)}</td>
                <td>${buildValueOrFallback(record.source_account)}</td>
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
    const accountSelect = document.getElementById('tradingAccountSelect');
    const accountName = accountSelect?.selectedOptions[0]?.text || 'חשבון לא ידוע';
    
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
                            externalDataResult.style.display = 'block';
    } else {
                            externalDataResult.innerHTML = '';
                            externalDataResult.style.display = 'none';
                        }
                    }

                    if (externalDataWarning) {
                        if (metadata) {
                            externalDataWarning.style.display = 'none';
                            externalDataWarning.innerHTML = '';
                        } else {
                            externalDataWarning.style.display = 'block';
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
 * Perform import
 */
function performImport(generateReport = false) {
    if (!currentSessionId) {
        showImportUserDataNotification('לא נמצא מזהה סשן', 'error');
        return;
    }
    
    setAnalysisLoadingState(true, 'מייבא נתונים...', 15);
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
            setAnalysisLoadingState(true, 'מסכם תהליך הייבוא...', 90);
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
            window.refreshDataImportHistory?.();
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
    })
    .finally(() => {
        setAnalysisLoadingState(false);
        window.refreshDataImportHistory?.();
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
    updateSymbolMetadataCache(data?.symbol_metadata || data?.summary?.symbol_metadata);

    if (taskType === 'cashflows') {
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
            section.style.display = 'none';
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
    const container = document.getElementById('missingTickersContainer');
    
    if (!section || !container) return;
    
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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (missingTickers || []).map((ticker) => renderMissingTickerCard(ticker));
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

/**
 * Display within-file duplicates
 */
function displayWithinFileDuplicates(duplicates) {
    const section = document.getElementById('withinFileDuplicatesSection');
    const container = document.getElementById('withinFileDuplicatesContainer');
    
    if (!section || !container) return;
    
    const tracking = trackProblemStatus(
        'withinFileDuplicates',
        duplicates,
        (duplicate) => getDuplicateIdentifier(duplicate, 'within'),
        (duplicate) => buildDuplicateResolvedMeta(duplicate, 'כפילות בתוך הקובץ')
    );

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (duplicates || []).map((duplicate, index) => 
        renderDuplicateCard(duplicate, 'within_file', index)
    );
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

/**
 * Render missing ticker card
 */
function renderMissingTickerCard(ticker) {
    const symbol = typeof ticker === 'string' ? ticker : ticker.symbol;
    const currency = typeof ticker === 'string' ? 'USD' : ticker.currency;
    const metadata = getSymbolMetadata(symbol);
    const metadataSummary = metadata
        ? `
            <div class="missing-ticker-metadata">
                ${metadata.company_name ? `<div class="missing-ticker-company"><i class="bi bi-building"></i> ${escapeHtml(metadata.company_name)}</div>` : ''}
                ${buildMetadataLinksList(metadata, {
                    containerClass: 'missing-ticker-links',
                    listClass: 'missing-ticker-links-list',
                    statusClass: 'missing-ticker-links-status',
                    showStatus: true
                })}
            </div>
        `
        : '';
    
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
                ${metadataSummary}
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
    const dateValue = record?.date || duplicate.date || '';
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
    return value;
}

function renderDuplicateCard(duplicate, type, index) {
    const { record } = extractPreviewRecord(duplicate);
    const symbol = record?.symbol || record?.ticker || duplicate.symbol || 'לא ידוע';
    const action = record?.action || duplicate.action || 'לא ידוע';
    const quantity = record?.quantity || duplicate.quantity || 'לא ידוע';
    const price = record?.price || duplicate.price || 'לא ידוע';
    const dateValue = record?.date || duplicate.date || 'לא ידוע';
    const confidence = duplicate.confidence_score || duplicate.confidence || 0;
    const confidenceClass = getConfidenceClass(confidence);
    
    return `
        <div class="problem-card ${type === 'within_file' ? 'within-file-duplicate' : 'existing-record-card'}">
            <div class="problem-card-header">
                <i class="bi ${type === 'within_file' ? 'bi-files' : 'bi-exclamation-triangle'}"></i>
                <span>${symbol}</span>
            </div>
            <div class="problem-card-body">
                <div class="problem-card-details">
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">פעולה:</span>
                        <span class="problem-card-detail-value">${action}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">כמות:</span>
                        <span class="problem-card-detail-value">${quantity}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">מחיר:</span>
                        <span class="problem-card-detail-value">${price}</span>
                    </div>
                    <div class="problem-card-detail">
                        <span class="problem-card-detail-label">תאריך:</span>
                        <span class="problem-card-detail-value">${dateValue}</span>
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
            updateSymbolMetadataCache(data.preview_data?.symbol_metadata || data.preview_data?.summary?.symbol_metadata);
            updateActiveSessionFromPreview(data.preview_data);
            // Refresh the current step display
            if (currentStep === 2) {
                displayProblemResolutionDetailed(data.preview_data);
            } else if (currentStep === 3) {
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
    const withinFileDuplicates = skipRecords.filter(record => 
        record.reason === 'within_file_duplicate' || record.reason === 'within_file_duplicate_match'
    );
    displayWithinFileDuplicates(withinFileDuplicates);

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
    const container = document.getElementById('cashflowMissingAccountsContainer');
    if (!section || !container) return;

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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (accounts || []).map(account => {
        if (typeof account === 'string') {
            return `
                <div class="problem-card cashflow-missing-account-card">
                    <div class="problem-card-header">
                        <i class="bi bi-person-dash"></i>
                        <span>${escapeHtml(account)}</span>
                    </div>
                    <div class="problem-card-body">
                        <p>חשבון זה לא נמצא במערכת. יש לשייך או ליצור אותו.</p>
                    </div>
                </div>
            `;
        }

        const accountId = account.account_id || account.accountId || account.id || 'לא ידוע';
        const provider = account.provider || account.provider_name || '';
        return `
            <div class="problem-card cashflow-missing-account-card">
                <div class="problem-card-header">
                    <i class="bi bi-person-dash"></i>
                    <span>${escapeHtml(accountId)}</span>
                </div>
                <div class="problem-card-body">
                    <p>חשבון זה לא נמצא במערכת. יש לשייך או ליצור אותו.</p>
                    ${provider ? `<p><small>ספק: ${escapeHtml(provider)}</small></p>` : ''}
                </div>
            </div>
        `;
    });
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

function displayCashflowCurrencyIssues(issues) {
    const section = document.getElementById('cashflowCurrencyIssuesSection');
    const container = document.getElementById('cashflowCurrencyIssuesContainer');
    if (!section || !container) return;

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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (issues || []).map(issue => {
        if (typeof issue === 'string') {
            return `
                <div class="problem-card cashflow-currency-issue-card">
                    <div class="problem-card-header">
                        <i class="bi bi-currency-exchange"></i>
                        <span>מטבע לא מזוהה</span>
                    </div>
                    <div class="problem-card-body">
                        <p>${escapeHtml(issue)}</p>
                    </div>
                </div>
            `;
        }

        const currency = issue.currency || issue.currency_code || 'לא ידוע';
        const sourceAccount = issue.source_account || issue.account || '';
        const message = issue.message || issue.detail || 'בעיה במטבע הרשומה';
        return `
            <div class="problem-card cashflow-currency-issue-card">
                <div class="problem-card-header">
                    <i class="bi bi-currency-exchange"></i>
                    <span>${escapeHtml(currency)}</span>
                </div>
                <div class="problem-card-body">
                    <p>${escapeHtml(message)}</p>
                    ${sourceAccount ? `<p><small>חשבון מקור: ${escapeHtml(sourceAccount)}</small></p>` : ''}
                    ${issue.record_index !== undefined ? `<p><small>אינדקס רשומה: ${issue.record_index}</small></p>` : ''}
                </div>
            </div>
        `;
    });
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

function displayAccountMissingAccounts(accounts) {
    const section = document.getElementById('accountMissingAccountsSection');
    const container = document.getElementById('accountMissingAccountsContainer');
    if (!section || !container) return;

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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (accounts || []).map(account => {
        if (typeof account === 'string') {
            return `
                <div class="problem-card account-missing-account-card">
                    <div class="problem-card-header">
                        <i class="bi bi-person-x"></i>
                        <span>${escapeHtml(account)}</span>
                    </div>
                    <div class="problem-card-body">
                        <p>חשבון זה לא קיים במערכת. יש ליצור או לשייך אותו לפני המשך הייבוא.</p>
                    </div>
                </div>
            `;
        }

        const accountId = account.account_id || account.accountId || account.id || 'לא ידוע';
        return `
            <div class="problem-card account-missing-account-card">
                <div class="problem-card-header">
                    <i class="bi bi-person-x"></i>
                    <span>${escapeHtml(accountId)}</span>
                </div>
                <div class="problem-card-body">
                    <p>חשבון זה לא קיים במערכת. יש ליצור או לשייך אותו לפני המשך הייבוא.</p>
                </div>
            </div>
        `;
    });
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

function displayAccountCurrencyMismatches(items) {
    const section = document.getElementById('accountCurrencyMismatchesSection');
    const container = document.getElementById('accountCurrencyMismatchesContainer');
    if (!section || !container) return;

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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (items || []).map(item => {
        if (typeof item === 'string') {
            return `
                <div class="problem-card account-currency-mismatch-card">
                    <div class="problem-card-header">
                        <i class="bi bi-cash-stack"></i>
                        <span>אי התאמה במטבע</span>
                    </div>
                    <div class="problem-card-body">
                        <p>${escapeHtml(item)}</p>
                    </div>
                </div>
            `;
        }

        const accountId = item.account_id || item.accountId || 'לא ידוע';
        const expected = item.expected || item.expected_currency || '—';
        const reported = item.reported || item.reported_currency || '—';
        return `
            <div class="problem-card account-currency-mismatch-card">
                <div class="problem-card-header">
                    <i class="bi bi-cash-stack"></i>
                    <span>${escapeHtml(accountId)}</span>
                </div>
                <div class="problem-card-body">
                    <p>מטבע בסיס מדווח: <strong>${escapeHtml(reported)}</strong></p>
                    <p>מטבע בסיס במערכת: <strong>${escapeHtml(expected)}</strong></p>
                </div>
            </div>
        `;
    });
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

function displayAccountEntitlementWarnings(items) {
    const section = document.getElementById('accountEntitlementWarningsSection');
    const container = document.getElementById('accountEntitlementWarningsContainer');
    if (!section || !container) return;

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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (items || []).map(item => {
        if (typeof item === 'string') {
            return `
                <div class="problem-card account-entitlement-warning-card">
                    <div class="problem-card-header">
                        <i class="bi bi-shield-exclamation"></i>
                        <span>הרשאות חסרות</span>
                    </div>
                    <div class="problem-card-body">
                        <p>${escapeHtml(item)}</p>
                    </div>
                </div>
            `;
        }

        const accountId = item.account_id || item.accountId || 'לא ידוע';
        const message = item.message || 'חסרות הרשאות נדרשות';
        const entitlements = Array.isArray(item.entitlements) ? item.entitlements : [];
        return `
            <div class="problem-card account-entitlement-warning-card">
                <div class="problem-card-header">
                    <i class="bi bi-shield-exclamation"></i>
                    <span>${escapeHtml(accountId)}</span>
                </div>
                <div class="problem-card-body">
                    <p>${escapeHtml(message)}</p>
                    ${entitlements.length ? `<p><small>הרשאות קיימות: ${escapeHtml(entitlements.join(', '))}</small></p>` : ''}
                </div>
            </div>
        `;
    });
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
}

function displayAccountMissingDocuments(items) {
    const section = document.getElementById('accountMissingDocumentsSection');
    const container = document.getElementById('accountMissingDocumentsContainer');
    if (!section || !container) return;

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

    const resolvedCards = tracking.resolvedEntries.map(renderResolvedProblemCard);
    const unresolvedCards = (items || []).map(item => {
        let accountId = 'לא ידוע';
        let documents = [];

        if (typeof item === 'string') {
            documents = [item];
        } else if (item && typeof item === 'object') {
            accountId = item.account_id || item.accountId || 'לא ידוע';
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
            <div class="problem-card account-missing-documents-card">
                <div class="problem-card-header">
                    <i class="bi bi-file-earmark-excel"></i>
                    <span>${escapeHtml(accountId)}</span>
                </div>
                <div class="problem-card-body">
                    <p>יש להשלים את המסמכים הבאים:</p>
                    <ul>
                        ${documents.map(doc => `<li>${escapeHtml(doc)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    const cards = [...resolvedCards, ...unresolvedCards];

    if (cards.length === 0) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = cards.join('');
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
        'resetImportSessionBtn'
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
}

const displayExistingRecordsLegacy = (records) => displayExistingRecords(records);

const clearProblemSectionsLegacy = () => clearProblemSections();
