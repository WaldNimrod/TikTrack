/**
 * Button System Demo - Centralized Overview
 * Builds the designs page dynamically from the unified button & color systems.
 */

const BUTTON_COLOR_VARIABLES = {
    EDIT: '--color-action-edit',
    DELETE: '--color-action-delete',
    ADD: '--color-action-add',
    SAVE: '--color-action-save',
    CANCEL: '--color-action-cancel',
    LINK: '--color-action-link',
    REFRESH: '--color-action-refresh',
    EXPORT: '--color-action-export',
    IMPORT: '--color-action-import',
    SEARCH: '--color-action-search',
    FILTER: '--color-action-filter',
    VIEW: '--color-action-view',
    TOGGLE: '--color-action-toggle',
    CLOSE: '--color-action-close',
    SORT: '--color-action-sort',
    DUPLICATE: '--color-action-duplicate',
    ARCHIVE: '--color-action-archive',
    RESTORE: '--color-action-restore',
    APPROVE: '--color-action-approve',
    REJECT: '--color-action-reject',
    PAUSE: '--color-action-pause',
    PLAY: '--color-action-play',
    STOP: '--color-action-stop',
    READ: '--color-action-read',
    CHECK: '--color-action-check',
    COPY: '--color-action-copy',
    REACTIVATE: '--color-action-reactivate'
};

const BUTTON_CATEGORY_FILTERS = [
    { id: 'all', label: 'כל הכפתורים' },
    { id: 'actions', label: 'כפתורי פעולות' },
    { id: 'navigation', label: 'כפתורי ניווט' }
];

const COLOR_GROUP_FILTERS = [
    { id: 'brand', label: 'צבעי מערכת' },
    { id: 'actions', label: 'צבעי כפתורים' },
    { id: 'entities', label: 'צבעי ישויות' },
    { id: 'statuses', label: 'סטטוסים' },
    { id: 'investments', label: 'סוגי השקעה' },
    { id: 'numeric', label: 'ערכים מספריים' }
];

const DESIGNS_PAGE_STATE_KEY = 'designs';
const DESIGNS_FILTERS_STORAGE_KEY = 'designs:filters';

const STATUS_LABELS = {
    active: 'פעיל',
    inactive: 'לא פעיל',
    pending: 'ממתין',
    completed: 'הושלם',
    cancelled: 'בוטל',
    error: 'שגיאה',
    warning: 'אזהרה',
    info: 'מידע',
    success: 'הצלחה'
};

const INVESTMENT_LABELS = {
    swing: 'Swing (סווינג)',
    day: 'Day Trading (מסחר יומי)',
    scalping: 'Scalping (סקאלפינג)'
};

const NUMERIC_LABELS = {
    positive: 'חיובי',
    negative: 'שלילי',
    zero: 'אפס'
};

let designsFilterState = {
    buttonCategory: 'all',
    colorGroup: 'brand'
};

let currentButtonCategory = designsFilterState.buttonCategory;
let currentColorGroup = designsFilterState.colorGroup;
let buttonFiltersInitialized = false;
let colorFiltersInitialized = false;

const BUTTON_DEMO_CONFIGS = [
    { type: 'EDIT', group: 'actions', category: 'פעולות', description: 'כפתור לעריכת רשומות', classes: 'btn-secondary', legacy: { classes: 'btn btn-secondary', icon: 'fas fa-edit', action: 'editRecord()' } },
    { type: 'DELETE', group: 'actions', category: 'פעולות', description: 'כפתור למחיקת רשומות', classes: 'btn-danger', legacy: { classes: 'btn btn-danger', icon: 'fas fa-trash', action: 'deleteRecord()' } },
    { type: 'ADD', group: 'actions', category: 'פעולות', description: 'כפתור להוספת רשומות חדשות', classes: 'btn-success', legacy: { classes: 'btn btn-success', icon: 'fas fa-plus', action: 'showAddModal()' } },
    { type: 'SAVE', group: 'actions', category: 'פעולות', description: 'כפתור לשמירת נתונים', classes: 'btn-success', legacy: { classes: 'btn btn-success', icon: 'fas fa-save', action: 'saveData()' } },
    { type: 'CANCEL', group: 'actions', category: 'פעולות', description: 'כפתור לביטול פעולות', classes: 'btn-secondary', attributes: "data-bs-dismiss='modal'", legacy: { classes: 'btn btn-secondary', icon: '', action: 'closeModal()', extraAttributes: "data-bs-dismiss='modal'" } },
    { type: 'LINK', group: 'navigation', category: 'ניווט', description: 'כפתור לקישור לרשומות קשורות', classes: 'btn-info', legacy: { classes: 'btn btn-info', icon: 'fas fa-link', action: 'openLink()' } },
    { type: 'REFRESH', group: 'actions', category: 'פעולות', description: 'כפתור לרענון נתונים', classes: 'btn-outline-secondary', legacy: { classes: 'btn btn-outline-secondary', icon: 'fas fa-sync-alt', action: 'refreshData()' } },
    { type: 'EXPORT', group: 'actions', category: 'פעולות', description: 'כפתור לייצוא נתונים', classes: 'btn-outline-primary', legacy: { classes: 'btn btn-outline-primary', icon: 'fas fa-download', action: 'exportData()' } },
    { type: 'IMPORT', group: 'actions', category: 'פעולות', description: 'כפתור לייבוא נתונים', classes: 'btn-outline-success', legacy: { classes: 'btn btn-outline-success', icon: 'fas fa-upload', action: 'importData()' } },
    { type: 'SEARCH', group: 'actions', category: 'פעולות', description: 'כפתור לחיפוש נתונים', classes: 'btn-outline-info', legacy: { classes: 'btn btn-outline-info', icon: 'fas fa-search', action: 'searchData()' } },
    { type: 'FILTER', group: 'actions', category: 'פעולות', description: 'כפתור לפילטור נתונים', classes: 'btn-outline-warning', legacy: { classes: 'btn btn-outline-warning', icon: 'fas fa-filter', action: 'filterData()' } },
    { type: 'VIEW', group: 'actions', category: 'פעולות', description: 'כפתור לצפייה בפרטים', classes: 'btn-outline-info', legacy: { classes: 'btn btn-outline-info', icon: 'fas fa-eye', action: 'viewDetails()' } },
    { type: 'TOGGLE', group: 'navigation', category: 'ניווט', description: 'כפתור להצגה והסתרה של סקשנים', classes: 'btn-outline-warning', legacy: { classes: 'btn btn-outline-warning', icon: '', action: 'toggleSection()' } },
    { type: 'CLOSE', group: 'navigation', category: 'ניווט', description: 'כפתור לסגירת מודלים', attributes: "type='button' class='btn-close' data-bs-dismiss='modal'", legacy: { classes: 'btn-close', icon: '', action: null, extraAttributes: "type='button' data-bs-dismiss='modal'" } },
    { type: 'SORT', group: 'actions', category: 'פעולות', description: 'כפתור למיון טבלאות', classes: 'btn-link', legacy: { classes: 'btn btn-link', icon: '', action: 'sortTable()' } },
    { type: 'DUPLICATE', group: 'actions', category: 'פעולות', description: 'כפתור לשכפול רשומות', classes: 'btn-outline-secondary', legacy: { classes: 'btn btn-outline-secondary', icon: 'fas fa-copy', action: 'duplicateRecord()' } },
    { type: 'ARCHIVE', group: 'actions', category: 'פעולות', description: 'כפתור לארכוב רשומות', classes: 'btn-outline-warning', legacy: { classes: 'btn btn-outline-warning', icon: 'fas fa-archive', action: 'archiveRecord()' } },
    { type: 'RESTORE', group: 'actions', category: 'פעולות', description: 'כפתור לשחזור רשומות', classes: 'btn-outline-success', legacy: { classes: 'btn btn-outline-success', icon: 'fas fa-undo', action: 'restoreRecord()' } },
    { type: 'APPROVE', group: 'actions', category: 'פעולות', description: 'כפתור לאישור פעולות', classes: 'btn-success', legacy: { classes: 'btn btn-success', icon: 'fas fa-check', action: 'approveRecord()' } },
    { type: 'REJECT', group: 'actions', category: 'פעולות', description: 'כפתור לדחיית פעולות', classes: 'btn-danger', legacy: { classes: 'btn btn-danger', icon: 'fas fa-times', action: 'rejectRecord()' } },
    { type: 'PAUSE', group: 'actions', category: 'פעולות', description: 'כפתור להשהיית פעולות', classes: 'btn-warning', legacy: { classes: 'btn btn-warning', icon: 'fas fa-pause', action: 'pauseRecord()' } },
    { type: 'PLAY', group: 'actions', category: 'פעולות', description: 'כפתור להפעלת פעולות', classes: 'btn-success', legacy: { classes: 'btn btn-success', icon: 'fas fa-play', action: 'playRecord()' } },
    { type: 'STOP', group: 'actions', category: 'פעולות', description: 'כפתור לעצירת פעולות', classes: 'btn-danger', legacy: { classes: 'btn btn-danger', icon: 'fas fa-stop', action: 'stopRecord()' } },
    { type: 'READ', group: 'actions', category: 'פעולות', description: 'כפתור לסימון כנקרא', classes: 'btn-outline-success', legacy: { classes: 'btn btn-outline-success', icon: 'fas fa-check', action: 'markAsRead()' } },
    { type: 'CHECK', group: 'actions', category: 'פעולות', description: 'כפתור לסימון כללי', classes: 'btn-outline-success', legacy: { classes: 'btn btn-outline-success', icon: 'fas fa-check', action: 'checkRecord()' } },
    { type: 'COPY', group: 'actions', category: 'פעולות', description: 'כפתור להעתקת נתונים', classes: 'btn-outline-secondary', legacy: { classes: 'btn btn-outline-secondary', icon: 'fas fa-copy', action: 'copyData()' } },
    { type: 'REACTIVATE', group: 'actions', category: 'פעולות', description: 'כפתור להפעלה מחדש של פריטים', classes: 'btn-success', legacy: { classes: 'btn btn-success', icon: 'fas fa-redo', action: 'reactivateItem()' } }
];

function getCssVariableValue(variableName) {
    if (!variableName) {
        return null;
    }
    return getComputedStyle(document.documentElement).getPropertyValue(variableName)?.trim() || null;
}

function escapeAttributeValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function resolveButtonText(type) {
    const key = type?.toUpperCase?.() || type;
    return (window.BUTTON_TEXTS && window.BUTTON_TEXTS[key]) || key || '';
}

function resolveButtonIcon(type) {
    const key = type?.toUpperCase?.() || type;
    return (window.BUTTON_ICONS && window.BUTTON_ICONS[key]) || '';
}

function resolveColorVariable(type, fallback) {
    return BUTTON_COLOR_VARIABLES[type] || fallback || null;
}

function buildLegacyHtml(config, text) {
    if (!config.legacy) {
        return '—';
    }
    const classes = config.legacy.classes || 'btn';
    const action = config.legacy.action ? ` onclick="${config.legacy.action}"` : '';
    const extra = config.legacy.extraAttributes ? ` ${config.legacy.extraAttributes}` : '';
    const iconHtml = config.legacy.icon ? `<i class="${config.legacy.icon}"></i> ` : '';
    return `<button class="${classes}"${action}${extra}>${iconHtml}${text}</button>`;
}

function buildModernHtml(type, text, icon, config, supportsEntity) {
    const attrs = [
        `data-button-type="${type}"`,
        `data-onclick="window.ButtonSystemDemo.handleButtonClick('${type}')"`
    ];

    if (config.classes) {
        attrs.push(`data-classes="${config.classes}"`);
    }

    if (config.attributes) {
        attrs.push(`data-attributes="${config.attributes}"`);
    }

    if (supportsEntity && !config.attributes?.includes('data-entity-type')) {
        attrs.push(`data-entity-type="${config.entityPreview || 'trade'}"`);
    }

    if (icon) {
        attrs.push(`data-icon="${escapeAttributeValue(icon)}"`);
    }

    attrs.push(`data-text="${escapeAttributeValue(text)}"`);

    return `<button ${attrs.join(' ')}></button>`;
}

function buildJsSnippet(type) {
    return `data-onclick="window.ButtonSystemDemo.handleButtonClick('${type}')"`;
}

function getEntityVariantSet() {
    return new Set(
        (window.advancedButtonSystem?.constructor?.ENTITY_VARIANT_BUTTONS) ||
        window.ENTITY_VARIANT_BUTTONS ||
        ['CLOSE', 'ADD', 'LINK', 'SAVE']
    );
}

function buildVariantData(type, icon, text) {
    return {
        small: { icon, text: '' },
        normal: { icon: '', text },
        full: { icon, text }
    };
}

function createVariantButton(button, variant, size = 'normal', style = 'default', entityType = null) {
    const btn = document.createElement('button');
    btn.className = 'btn me-2 mb-2';
    btn.setAttribute('data-button-type', button.type);
    btn.setAttribute('data-variant', variant);
    if (size !== 'normal') {
        btn.setAttribute('data-size', size);
    }
    if (style !== 'default') {
        btn.setAttribute('data-style', style);
    }
    if (entityType) {
        btn.setAttribute('data-entity-type', entityType);
    }

    const icon = button.icon || resolveButtonIcon(button.type);
    const text = button.text || resolveButtonText(button.type);

    switch (variant) {
        case 'small':
            btn.setAttribute('data-text', '');
            btn.setAttribute('data-icon', icon);
            break;
        case 'normal':
            btn.setAttribute('data-text', text);
            btn.setAttribute('data-icon', '');
            break;
        default:
            btn.setAttribute('data-text', text);
            btn.setAttribute('data-icon', icon);
            break;
    }

    btn.setAttribute('data-onclick', `window.ButtonSystemDemo.handleButtonClick('${button.type}')`);
    return btn;
}

function createColorPreview(variable, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex align-items-center gap-2';

    const computedValue = variable ? getCssVariableValue(variable) : null;
    const chip = document.createElement('span');
    chip.className = 'color-chip';
    chip.style.background = computedValue || variable || '#e9ecef';

    const labelWrapper = document.createElement('div');
    labelWrapper.textContent = '';
    const div = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = resolveButtonText(type);
    div.appendChild(strong);
    labelWrapper.appendChild(div);
    const code = document.createElement('code');
    code.textContent = variable || '—';
    labelWrapper.appendChild(code);

    wrapper.appendChild(chip);
    wrapper.appendChild(labelWrapper);
    return wrapper;
}

const BUTTON_SYSTEM_DEMO = {
    buttons: [],
    buttonMap: {},
    refresh() {
        const entitySet = getEntityVariantSet();
        const buttons = BUTTON_DEMO_CONFIGS.map((config) => {
            const text = resolveButtonText(config.type);
            const icon = resolveButtonIcon(config.type);
            const colorVariable = resolveColorVariable(config.type, config.colorVariable);
            const supportsEntity = entitySet.has(config.type);

            return {
                type: config.type,
                group: config.group,
                category: config.category,
                name: text,
                description: config.description,
                colorVariable,
                classes: config.classes || '',
                attributes: config.attributes || '',
                supportsEntity,
                icon,
                text,
                variants: buildVariantData(config.type, icon, text),
                legacyHtml: buildLegacyHtml(config, text),
                modernHtml: buildModernHtml(config.type, text, icon, config, supportsEntity),
                jsCode: buildJsSnippet(config.type)
            };
        });

        this.buttons = buttons;
        this.buttonMap = buttons.reduce((acc, button) => {
            acc[button.type] = button;
            return acc;
        }, {});
    }
};

BUTTON_SYSTEM_DEMO.refresh();

function getFilteredButtons() {
    const searchTerm = document.getElementById('buttonFilter')?.value?.toLowerCase() || '';
    return BUTTON_SYSTEM_DEMO.buttons.filter((button) => {
        const matchesCategory = currentButtonCategory === 'all' || button.group === currentButtonCategory;
        if (!matchesCategory) {
            return false;
        }
        if (!searchTerm) {
            return true;
        }
        const haystack = [
            button.type,
            button.name,
            button.description,
            button.category
        ].join(' ').toLowerCase();
        return haystack.includes(searchTerm);
    });
}

function createCodeCell(snippet, buttonType, snippetKey) {
    const cell = document.createElement('td');

    if (!snippet || snippet === '—') {
        cell.textContent = '';
        const span = document.createElement('span');
        span.className = 'text-muted';
        span.textContent = '—';
        cell.appendChild(span);
        return cell;
    }

    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    codeBlock.textContent = snippet;
    cell.appendChild(codeBlock);

    const actions = document.createElement('div');
    actions.className = 'code-actions';

    const copyBtn = document.createElement('button');
    copyBtn.setAttribute('data-button-type', 'COPY');
    copyBtn.setAttribute('data-variant', 'small');
    copyBtn.setAttribute('data-text', 'העתק');
    copyBtn.setAttribute('data-onclick', `window.DesignGallery.copySnippet('${buttonType}', '${snippetKey}')`);
    actions.appendChild(copyBtn);

    cell.appendChild(actions);
    return cell;
}

function createButtonRow(button) {
    const row = document.createElement('tr');
    row.setAttribute('data-type', button.type);
    row.setAttribute('data-group', button.group || '');
    row.setAttribute('data-category', button.category || '');

    const liveCell = document.createElement('td');
    liveCell.className = 'live-example-cell';
    const variantsWrapper = document.createElement('div');
    variantsWrapper.className = 'variant-grid';

    const variants = [
        { label: 'קטן', variant: 'small' },
        { label: 'רגיל', variant: 'normal' },
        { label: 'מלא', variant: 'full' }
    ];

    variants.forEach((variantConfig) => {
        const item = document.createElement('div');
        item.className = 'variant-grid-item';

        const label = document.createElement('span');
        label.className = 'variant-label';
        label.textContent = variantConfig.label;
        item.appendChild(label);

        item.appendChild(createVariantButton(button, variantConfig.variant));
        variantsWrapper.appendChild(item);
    });

    if (button.supportsEntity) {
        const entityRow = document.createElement('div');
        entityRow.className = 'entity-variant-row';
        const label = document.createElement('span');
        label.className = 'variant-label';
        label.textContent = 'ישות';
        entityRow.appendChild(label);
        entityRow.appendChild(createVariantButton(button, 'full', 'normal', 'default', 'trade'));
        variantsWrapper.appendChild(entityRow);
    }

    liveCell.appendChild(variantsWrapper);
    row.appendChild(liveCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = '';
    const strong = document.createElement('strong');
    strong.textContent = button.name;
    nameCell.appendChild(strong);
    nameCell.appendChild(document.createElement('br'));
    const small = document.createElement('small');
    small.className = 'text-muted';
    small.textContent = button.type;
    nameCell.appendChild(small);
    row.appendChild(nameCell);

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = button.description;
    row.appendChild(descriptionCell);

    const colorCell = document.createElement('td');
    colorCell.appendChild(createColorPreview(button.colorVariable, button.type));
    row.appendChild(colorCell);

    row.appendChild(createCodeCell(button.legacyHtml, button.type, 'legacyHtml'));
    row.appendChild(createCodeCell(button.modernHtml, button.type, 'modernHtml'));
    row.appendChild(createCodeCell(button.jsCode, button.type, 'jsCode'));

    const actionsCell = document.createElement('td');
    actionsCell.className = 'text-center';

    const copyModern = document.createElement('button');
    copyModern.setAttribute('data-button-type', 'COPY');
    copyModern.setAttribute('data-variant', 'small');
    copyModern.setAttribute('data-text', 'HTML');
    copyModern.setAttribute('data-onclick', `window.DesignGallery.copySnippet('${button.type}', 'modernHtml')`);
    actionsCell.appendChild(copyModern);

    const copyJs = document.createElement('button');
    copyJs.setAttribute('data-button-type', 'COPY');
    copyJs.setAttribute('data-variant', 'small');
    copyJs.setAttribute('data-text', 'JS');
    copyJs.setAttribute('data-onclick', `window.DesignGallery.copySnippet('${button.type}', 'jsCode')`);
    actionsCell.appendChild(copyJs);

    row.appendChild(actionsCell);
    return row;
}

function updateStats(filteredButtons) {
    const totalElement = document.getElementById('totalButtons');
    const activeElement = document.getElementById('activeButtons');
    const categoriesElement = document.getElementById('categoriesCount');
    const lastUpdateElement = document.getElementById('lastUpdate');
    const headerCountElement = document.getElementById('buttonTableCount');

    if (totalElement) {
        totalElement.textContent = BUTTON_SYSTEM_DEMO.buttons.length;
    }
    if (activeElement) {
        activeElement.textContent = filteredButtons.length;
    }
    if (categoriesElement) {
        const categories = new Set(BUTTON_SYSTEM_DEMO.buttons.map((btn) => btn.group));
        categoriesElement.textContent = categories.size;
    }
    if (lastUpdateElement) {
        lastUpdateElement.textContent = new Date().toLocaleTimeString('he-IL');
    }
    if (headerCountElement) {
        headerCountElement.textContent = `${filteredButtons.length} מתוך ${BUTTON_SYSTEM_DEMO.buttons.length} רשומות`;
    }
}

function renderButtonTable() {
    const tbody = document.getElementById('buttonTableBody');
    if (!tbody) {
        return;
    }

    const filteredButtons = getFilteredButtons();
    tbody.textContent = '';

    filteredButtons.forEach((button) => {
        tbody.appendChild(createButtonRow(button));
    });

    if (window.advancedButtonSystem?.processButtons) {
        window.advancedButtonSystem.processButtons(tbody);
    }

    updateStats(filteredButtons);
    updateFilterSelection(document.getElementById('buttonCategoryFilters'), currentButtonCategory);
}

function filterButtons() {
    renderButtonTable();
}

function updateFilterSelection(container, activeId) {
    if (!container) {
        return;
    }
    container.querySelectorAll('button[data-filter-id]').forEach((button) => {
        if (button.getAttribute('data-filter-id') === activeId) {
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        }
    });
}

function initializeButtonFilters() {
    if (buttonFiltersInitialized) {
        updateFilterSelection(document.getElementById('buttonCategoryFilters'), currentButtonCategory);
        return;
    }

    const container = document.getElementById('buttonCategoryFilters');
    if (!container) {
        return;
    }

    container.textContent = '';
    BUTTON_CATEGORY_FILTERS.forEach((filter) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-secondary btn-sm';
        button.textContent = filter.label;
        button.setAttribute('data-filter-id', filter.id);
        button.addEventListener('click', () => {
            if (currentButtonCategory === filter.id) {
                return;
            }
            currentButtonCategory = filter.id;
            designsFilterState.buttonCategory = filter.id;
            updateFilterSelection(container, filter.id);
            persistFiltersState();
            renderButtonTable();
        });
        container.appendChild(button);
    });

    updateFilterSelection(container, currentButtonCategory);
    buttonFiltersInitialized = true;
}

function createColorDetailsList(details) {
    const list = document.createElement('ul');
    list.className = 'color-details-list';

    details.forEach((detail) => {
        const item = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = detail.label;

        const valueWrapper = document.createElement('div');
        valueWrapper.className = 'd-flex align-items-center gap-2';

        if (detail.color) {
            const chip = document.createElement('span');
            chip.className = 'color-chip';
            chip.style.background = detail.color;
            valueWrapper.appendChild(chip);
        }

        const value = document.createElement('code');
        value.textContent = detail.value || '—';
        valueWrapper.appendChild(value);

        item.appendChild(label);
        item.appendChild(valueWrapper);
        list.appendChild(item);
    });

    return list;
}

function createColorTableRow(entry) {
    const row = document.createElement('tr');

    const groupCell = document.createElement('td');
    groupCell.textContent = entry.groupLabel;
    row.appendChild(groupCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = '';
    const strong = document.createElement('strong');
    strong.textContent = entry.name;
    nameCell.appendChild(strong);
    if (entry.subtitle) {
        nameCell.appendChild(document.createElement('br'));
        const small = document.createElement('small');
        small.className = 'text-muted';
        small.textContent = entry.subtitle;
        nameCell.appendChild(small);
    }
    row.appendChild(nameCell);

    const identifierCell = document.createElement('td');
    identifierCell.textContent = '';
    const code = document.createElement('code');
    code.textContent = entry.identifier || '—';
    identifierCell.appendChild(code);
    row.appendChild(identifierCell);

    const valueCell = document.createElement('td');
    const valueWrapper = document.createElement('div');
    valueWrapper.className = 'd-flex align-items-center gap-2';
    const chip = document.createElement('span');
    chip.className = 'color-chip';
    chip.style.background = entry.value || '#e9ecef';
    valueWrapper.appendChild(chip);
    const valueCode = document.createElement('code');
    valueCode.textContent = entry.value || '—';
    valueWrapper.appendChild(valueCode);
    valueCell.appendChild(valueWrapper);
    row.appendChild(valueCell);

    const detailsCell = document.createElement('td');
    if (entry.details?.length) {
        detailsCell.appendChild(createColorDetailsList(entry.details));
    } else {
        detailsCell.textContent = '';
        const span = document.createElement('span');
        span.className = 'text-muted';
        span.textContent = '—';
        detailsCell.appendChild(span);
    }
    row.appendChild(detailsCell);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'text-center d-flex flex-column gap-1';

    const safeIdentifier = escapeAttributeValue(entry.identifier || '');
    const safeValue = escapeAttributeValue(entry.value || '');

    if (entry.identifier) {
        const copyId = document.createElement('button');
        copyId.setAttribute('data-button-type', 'COPY');
        copyId.setAttribute('data-variant', 'small');
        copyId.setAttribute('data-text', 'מזהה');
        copyId.setAttribute('data-onclick', `window.DesignGallery.copyColorValue('${safeIdentifier}', '${safeValue}', 'identifier')`);
        actionsCell.appendChild(copyId);
    }

    if (entry.value) {
        const copyValue = document.createElement('button');
        copyValue.setAttribute('data-button-type', 'COPY');
        copyValue.setAttribute('data-variant', 'small');
        copyValue.setAttribute('data-text', 'ערך');
        copyValue.setAttribute('data-onclick', `window.DesignGallery.copyColorValue('${safeIdentifier}', '${safeValue}', 'value')`);
        actionsCell.appendChild(copyValue);
    }

    row.appendChild(actionsCell);
    return row;
}

function getBrandColorRows() {
    const tokens = [
        {
            name: 'צבע ראשי',
            subtitle: 'Primary',
            identifier: '--primary-color',
            preferenceKey: 'primaryColor',
            variants: [
                { label: 'Light', var: '--primary-color-light' },
                { label: 'Dark', var: '--primary-color-dark' },
                { label: 'Border', var: '--primary-color-border' }
            ]
        },
        {
            name: 'צבע משני',
            subtitle: 'Secondary',
            identifier: '--secondary-color',
            preferenceKey: 'secondaryColor',
            variants: [
                { label: 'Light', var: '--secondary-color-light' },
                { label: 'Dark', var: '--secondary-color-dark' },
                { label: 'Border', var: '--secondary-color-border' }
            ]
        },
        {
            name: 'הצלחה',
            subtitle: 'Success',
            identifier: '--color-success',
            preferenceKey: 'successColor',
            variants: [
                { label: 'Light', var: '--color-success-light' },
                { label: 'Dark', var: '--color-success-dark' },
                { label: 'Border', var: '--color-success-border' },
                { label: 'Background', var: '--color-success-bg' }
            ]
        },
        {
            name: 'שגיאה',
            subtitle: 'Danger',
            identifier: '--color-danger',
            preferenceKey: 'dangerColor',
            variants: [
                { label: 'Light', var: '--color-danger-light' },
                { label: 'Dark', var: '--color-danger-dark' },
                { label: 'Border', var: '--color-danger-border' },
                { label: 'Background', var: '--color-danger-bg' }
            ]
        },
        {
            name: 'אזהרה',
            subtitle: 'Warning',
            identifier: '--color-warning',
            preferenceKey: 'warningColor',
            variants: [
                { label: 'Light', var: '--color-warning-light' },
                { label: 'Dark', var: '--color-warning-dark' },
                { label: 'Border', var: '--color-warning-border' },
                { label: 'Background', var: '--color-warning-bg' }
            ]
        },
        {
            name: 'מידע',
            subtitle: 'Info',
            identifier: '--color-info',
            preferenceKey: 'infoColor',
            variants: [
                { label: 'Light', var: '--color-info-light' },
                { label: 'Dark', var: '--color-info-dark' },
                { label: 'Border', var: '--color-info-border' },
                { label: 'Background', var: '--color-info-bg' }
            ]
        }
    ];

    return tokens
        .map((token) => {
            const value = getCssVariableValue(token.identifier);
            if (!value) {
                return null;
            }

            const details = [];
            if (token.preferenceKey) {
                details.push({ label: 'Preference Key', value: token.preferenceKey });
            }

            (token.variants || []).forEach((variant) => {
                const variantValue = getCssVariableValue(variant.var);
                if (variantValue) {
                    details.push({ label: variant.label, value: variantValue, color: variantValue });
                }
            });

            return {
                groupLabel: 'מערכת',
                name: token.name,
                subtitle: token.subtitle,
                identifier: token.identifier,
                value,
                details
            };
        })
        .filter(Boolean);
}

function getActionColorRows() {
    const configsByType = BUTTON_DEMO_CONFIGS.reduce((acc, config) => {
        acc[config.type] = config;
        return acc;
    }, {});

    return Object.entries(BUTTON_COLOR_VARIABLES)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([type, variable]) => {
            const config = configsByType[type];
            const text = resolveButtonText(type);
            const value = getCssVariableValue(variable);
            return {
                groupLabel: 'כפתורים',
                name: text,
                subtitle: type,
                identifier: variable,
                value,
                details: [
                    { label: 'סוג כפתור', value: type },
                    { label: 'תיאור', value: config?.description || '' },
                    { label: 'מחלקות CSS', value: config?.classes || '—' }
                ]
            };
        });
}

function getEntityColorRows() {
    const entities = Object.entries(window.ENTITY_COLORS || {})
        .sort(([a], [b]) => a.localeCompare(b));

    return entities.map(([entity, mainColor]) => {
        const label = typeof window.getEntityLabel === 'function' ? window.getEntityLabel(entity) : entity;
        return {
            groupLabel: 'ישויות',
            name: label,
            subtitle: entity,
            identifier: `entity-${entity}`,
            value: mainColor,
            details: [
                { label: 'Background', value: window.ENTITY_BACKGROUND_COLORS?.[entity], color: window.ENTITY_BACKGROUND_COLORS?.[entity] },
                { label: 'Border', value: window.ENTITY_BORDER_COLORS?.[entity], color: window.ENTITY_BORDER_COLORS?.[entity] },
                { label: 'Text', value: window.ENTITY_TEXT_COLORS?.[entity], color: window.ENTITY_TEXT_COLORS?.[entity] }
            ].filter((detail) => detail.value)
        };
    });
}

function getStatusColorRows() {
    const statuses = Object.entries(window.STATUS_COLORS || {}).sort(([a], [b]) => a.localeCompare(b));

    return statuses
        .map(([statusKey]) => {
            const name = STATUS_LABELS[statusKey] || statusKey;
            const identifier = `status-${statusKey}`;
            const value = typeof window.getStatusColor === 'function'
                ? window.getStatusColor(statusKey)
                : window.STATUS_COLORS?.[statusKey];

            if (!value) {
                return null;
            }

            const details = [];
            const bg = typeof window.getStatusBackgroundColor === 'function'
                ? window.getStatusBackgroundColor(statusKey)
                : getCssVariableValue(`--user-status-${statusKey}-bg`);
            const border = typeof window.getStatusBorderColor === 'function'
                ? window.getStatusBorderColor(statusKey)
                : getCssVariableValue(`--user-status-${statusKey}-border`);
            const text = typeof window.getStatusTextColor === 'function'
                ? window.getStatusTextColor(statusKey)
                : getCssVariableValue(`--user-status-${statusKey}-color`);

            if (bg) {
                details.push({ label: 'Background', value: bg, color: bg });
            }
            if (border) {
                details.push({ label: 'Border', value: border, color: border });
            }
            if (text) {
                details.push({ label: 'Text', value: text, color: text });
            }

            const cssVar = getCssVariableValue(`--user-status-${statusKey}-color`);
            if (cssVar) {
                details.push({ label: 'CSS Variable', value: `--user-status-${statusKey}-color` });
            }

            return {
                groupLabel: 'סטטוסים',
                name,
                subtitle: statusKey,
                identifier,
                value,
                details
            };
        })
        .filter(Boolean);
}

function getInvestmentColorRows() {
    const investments = Object.entries(window.INVESTMENT_TYPE_COLORS || {}).sort(([a], [b]) => a.localeCompare(b));

    return investments
        .map(([type, tokens]) => {
            const name = INVESTMENT_LABELS[type] || type;
            const identifier = `investment-${type}`;
            const medium = typeof window.getInvestmentTypeColor === 'function'
                ? window.getInvestmentTypeColor(type, 'medium')
                : tokens?.medium;

            if (!medium) {
                return null;
            }

            const details = [
                { label: 'Light', value: tokens?.light, color: tokens?.light },
                { label: 'Border', value: tokens?.border, color: tokens?.border }
            ].filter((detail) => detail.value);

            return {
                groupLabel: 'סוגי השקעה',
                name,
                subtitle: type,
                identifier,
                value: medium,
                details
            };
        })
        .filter(Boolean);
}

function getNumericColorRows() {
    const numeric = Object.entries(window.NUMERIC_VALUE_COLORS || {}).sort(([a], [b]) => a.localeCompare(b));

    return numeric
        .map(([key, tokens]) => {
            const name = NUMERIC_LABELS[key] || key;
            const identifier = `numeric-${key}`;
            const medium = typeof window.getNumericValueColor === 'function'
                ? window.getNumericValueColor(key === 'positive' ? 1 : key === 'negative' ? -1 : 0)
                : tokens?.medium;

            if (!medium) {
                return null;
            }

            const details = [
                { label: 'Light', value: tokens?.light, color: tokens?.light },
                { label: 'Border', value: tokens?.border, color: tokens?.border },
                { label: 'Dark', value: tokens?.dark, color: tokens?.dark }
            ].filter((detail) => detail.value);

            return {
                groupLabel: 'ערכים מספריים',
                name,
                subtitle: key,
                identifier,
                value: medium,
                details
            };
        })
        .filter(Boolean);
}

function getColorRowsByGroup(groupId) {
    switch (groupId) {
        case 'brand':
            return getBrandColorRows();
        case 'actions':
            return getActionColorRows();
        case 'entities':
            return getEntityColorRows();
        case 'statuses':
            return getStatusColorRows();
        case 'investments':
            return getInvestmentColorRows();
        case 'numeric':
            return getNumericColorRows();
        default:
            return [];
    }
}

function renderColorTables() {
    const tbody = document.getElementById('colorTokensBody');
    if (!tbody) {
        return;
    }

    const rows = getColorRowsByGroup(currentColorGroup);

    tbody.textContent = '';
    rows.forEach((rowData) => tbody.appendChild(createColorTableRow(rowData)));

    if (window.advancedButtonSystem?.processButtons) {
        window.advancedButtonSystem.processButtons(tbody);
    }

    updateFilterSelection(document.getElementById('colorGroupFilters'), currentColorGroup);

    const colorCountElement = document.getElementById('colorTokensCount');
    if (colorCountElement) {
        colorCountElement.textContent = rows.length ? `${rows.length} צבעים` : 'אין צבעים להצגה';
    }
}

function initializeColorFilters() {
    if (colorFiltersInitialized) {
        updateFilterSelection(document.getElementById('colorGroupFilters'), currentColorGroup);
        return;
    }

    const container = document.getElementById('colorGroupFilters');
    if (!container) {
        return;
    }

    container.textContent = '';
    COLOR_GROUP_FILTERS.forEach((filter) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-secondary btn-sm';
        button.textContent = filter.label;
        button.setAttribute('data-filter-id', filter.id);
        button.addEventListener('click', () => {
            if (currentColorGroup === filter.id) {
                return;
            }
            currentColorGroup = filter.id;
            designsFilterState.colorGroup = filter.id;
            updateFilterSelection(container, filter.id);
            persistFiltersState();
            renderColorTables();
        });
        container.appendChild(button);
    });

    updateFilterSelection(container, currentColorGroup);
    colorFiltersInitialized = true;
}

function persistFiltersState() {
    const payload = { filters: designsFilterState };

    if (window.PageStateManager?.initialized) {
        window.PageStateManager.loadPageState(DESIGNS_PAGE_STATE_KEY)
            .then((previous = {}) => window.PageStateManager.savePageState(DESIGNS_PAGE_STATE_KEY, { ...previous, ...payload }))
            .catch((error) => {
                window.Logger?.warn('Designs filters: failed to persist via PageStateManager', { error });
            });
        return;
    }

    try {
        localStorage.setItem(DESIGNS_FILTERS_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageError) {
        window.Logger?.warn('Designs filters: failed to persist in localStorage', { storageError });
    }
}

async function loadFiltersState() {
    let state = null;

    if (window.PageStateManager?.initialized) {
        try {
            state = await window.PageStateManager.loadPageState(DESIGNS_PAGE_STATE_KEY);
        } catch (error) {
            window.Logger?.warn('Designs filters: failed to load from PageStateManager', { error });
        }
    }

    if (!state) {
        try {
            const stored = localStorage.getItem(DESIGNS_FILTERS_STORAGE_KEY);
            if (stored) {
                state = JSON.parse(stored);
            }
        } catch (storageError) {
            window.Logger?.warn('Designs filters: failed to load from localStorage', { storageError });
        }
    }

    if (state?.filters) {
        designsFilterState = { ...designsFilterState, ...state.filters };
    }

    currentButtonCategory = designsFilterState.buttonCategory || 'all';
    currentColorGroup = designsFilterState.colorGroup || 'brand';
}

async function initializeDesignsPage() {
    BUTTON_SYSTEM_DEMO.refresh();
    await loadFiltersState();

    initializeButtonFilters();
    initializeColorFilters();
    renderButtonTable();
    renderColorTables();

    if (typeof window.loadDiagnosticsState === 'function') {
        window.loadDiagnosticsState();
    }
}

function loadButtonTable() {
    renderButtonTable();
}

window.ButtonSystemDemo = {
    handleButtonClick(buttonType) {
        const button = BUTTON_SYSTEM_DEMO.buttonMap[buttonType];
        const buttonName = button?.name || resolveButtonText(buttonType);
        const message = `כפתור ${buttonName} (${buttonType}) נלחץ במצב הדגמה`;

        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification(message, 'דוגמת מערכת הכפתורים');
        } else if (window.Logger?.info) {
            window.Logger.info('ButtonSystemDemo: demo click', { buttonType, buttonName });
        } else {
            console.log('ButtonSystemDemo:', message);
        }
    },
    getButton(type) {
        return BUTTON_SYSTEM_DEMO.buttonMap[type] || null;
    }
};

window.DesignGallery = {
    getFilters() {
        return { ...designsFilterState };
    },
    setButtonCategory(categoryId) {
        if (!categoryId || currentButtonCategory === categoryId) {
            return;
        }
        currentButtonCategory = categoryId;
        designsFilterState.buttonCategory = categoryId;
        persistFiltersState();
        renderButtonTable();
    },
    setColorGroup(groupId) {
        if (!groupId || currentColorGroup === groupId) {
            return;
        }
        currentColorGroup = groupId;
        designsFilterState.colorGroup = groupId;
        persistFiltersState();
        renderColorTables();
    },
    copySnippet(buttonType, snippetKey) {
        const button = BUTTON_SYSTEM_DEMO.buttonMap[buttonType];
        if (!button) {
            return;
        }

        let snippet = null;
        if (snippetKey === 'modernHtml') {
            snippet = button.modernHtml;
        } else if (snippetKey === 'legacyHtml') {
            snippet = button.legacyHtml;
        } else if (snippetKey === 'jsCode') {
            snippet = button.jsCode;
        }

        if (!snippet || snippet === '—') {
            window.showWarningNotification?.('אין תוכן להעתיק', 'בחר כפתור אחר');
            return;
        }

        if (typeof window.copyToClipboard === 'function') {
            window.copyToClipboard(snippet);
        } else if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(snippet).catch((error) => {
                window.Logger?.warn('Designs copy: clipboard write failed', { error });
            });
        }
    },
    copyColorValue(identifier, value, type) {
        const payload = type === 'identifier' ? identifier : value;
        if (!payload) {
            window.showWarningNotification?.('אין ערך להעתקה', 'בחר צבע אחר');
            return;
        }

        if (typeof window.copyToClipboard === 'function') {
            window.copyToClipboard(payload);
        } else if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(payload).catch((error) => {
                window.Logger?.warn('Designs copy color: clipboard write failed', { error });
            });
        }
    },
    getButtonMetadata(type) {
        return BUTTON_SYSTEM_DEMO.buttonMap[type] || null;
    },
    getColorTokens(groupId = currentColorGroup) {
        return getColorRowsByGroup(groupId);
    }
};

window.renderColorTables = renderColorTables;
window.loadButtonTable = loadButtonTable;

window.loadDesigns = async function loadDesigns() {
    await initializeDesignsPage();
};

document.addEventListener('DOMContentLoaded', () => {
    initializeDesignsPage();

    window.addEventListener('colorSchemeChanged', () => {
        renderButtonTable();
        renderColorTables();
    });
});