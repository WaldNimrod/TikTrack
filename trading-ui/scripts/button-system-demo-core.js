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
    { id: 'actions', label: 'צבעי כפתורים' },
    { id: 'entities', label: 'צבעי ישויות' }
];

let currentButtonCategory = 'all';
let currentColorGroup = 'actions';
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

function getEntityVariantSet() {
    return new Set(
        (window.advancedButtonSystem?.constructor?.ENTITY_VARIANT_BUTTONS) ||
        window.ENTITY_VARIANT_BUTTONS ||
        ['CLOSE', 'ADD', 'LINK', 'SAVE']
    );
}

function escapeAttributeValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).replace(/"/g, '&quot;');
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

function buildVariantData(type, icon, text) {
    return {
        small: { icon, text: '' },
        normal: { icon: '', text },
        full: { icon, text }
    };
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

function buildButtonSystemDemo() {
    const entitySet = getEntityVariantSet();

    const buttons = BUTTON_DEMO_CONFIGS.map((config) => {
        const type = config.type;
        const text = resolveButtonText(type);
        const icon = resolveButtonIcon(type);
        const colorVariable = resolveColorVariable(type, config.colorVariable);
        const supportsEntity = entitySet.has(type);

        return {
            type,
            name: text,
            description: config.description,
            category: config.category,
            colorVariable,
            classes: config.classes || '',
            attributes: config.attributes || '',
            supportsEntity,
            icon,
            text,
            variants: buildVariantData(type, icon, text),
            legacyHtml: buildLegacyHtml(config, text),
            modernHtml: buildModernHtml(type, text, icon, config, supportsEntity),
            jsCode: buildJsSnippet(type)
        };
    });

    const buttonMap = buttons.reduce((acc, button) => {
        acc[button.type] = button;
        return acc;
    }, {});

    return { buttons, buttonMap };
}

const BUTTON_SYSTEM_DEMO = {
    buttons: [],
    buttonMap: {},
    refresh() {
        const data = buildButtonSystemDemo();
        this.buttons = data.buttons;
        this.buttonMap = data.buttonMap;
    }
};

BUTTON_SYSTEM_DEMO.refresh();

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
    getButtons() {
        return BUTTON_SYSTEM_DEMO.buttons;
    },
    getButton(type) {
        return BUTTON_SYSTEM_DEMO.buttonMap[type] || null;
    }
};

function createVariantButton(button, variant, size = 'normal', style = 'default', entityType = null) {
    const btn = document.createElement('button');
    btn.className = 'btn me-1 mb-1';
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

    if (variant === 'small') {
        btn.setAttribute('data-text', '');
        btn.setAttribute('data-icon', icon);
    } else if (variant === 'normal') {
        btn.setAttribute('data-text', text);
        btn.setAttribute('data-icon', '');
    } else {
        btn.setAttribute('data-text', text);
        btn.setAttribute('data-icon', icon);
    }
    
    btn.setAttribute('data-onclick', `window.ButtonSystemDemo.handleButtonClick('${button.type}')`);
    return btn;
}

function createColorPreview(colorVariable, type) {
    const container = document.createElement('div');
    container.className = 'd-flex align-items-center gap-2';

    const swatch = document.createElement('div');
    swatch.style.width = '20px';
    swatch.style.height = '20px';
    swatch.style.borderRadius = '4px';
    swatch.style.border = '1px solid #ccc';

    if (colorVariable) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(colorVariable).trim();
        swatch.style.backgroundColor = value || '#e9ecef';
    } else {
        swatch.style.backgroundColor = '#e9ecef';
    }

    const details = document.createElement('div');
    details.innerHTML = `
        <div><strong>${resolveButtonText(type)}</strong></div>
        <code style="font-size: 10px;">${colorVariable || 'ללא משתנה צבע ייעודי'}</code>
    `;

    container.appendChild(swatch);
    container.appendChild(details);
    return container;
}

function getCssVariableValue(variableName) {
    if (!variableName) {
        return null;
    }
    return getComputedStyle(document.documentElement).getPropertyValue(variableName)?.trim() || null;
}

function createDetailRow(label, value) {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center justify-content-between small mb-1';

    const labelEl = document.createElement('span');
    labelEl.className = 'text-muted';
    labelEl.textContent = label;

    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'd-flex align-items-center gap-2';

    const chip = document.createElement('span');
    chip.className = 'rounded-pill border';
    chip.style.display = 'inline-block';
    chip.style.width = '16px';
    chip.style.height = '16px';
    chip.style.background = value || '#e9ecef';

    const code = document.createElement('code');
    code.textContent = value || '—';

    infoWrapper.appendChild(chip);
    infoWrapper.appendChild(code);

    row.appendChild(labelEl);
    row.appendChild(infoWrapper);

    return row;
}

function createColorTokenCard({ title, subtitle, variable, value, details = [] }) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'border rounded p-3 h-100 shadow-sm bg-white';

    const swatch = document.createElement('div');
    swatch.className = 'rounded mb-3';
    swatch.style.height = '48px';
    swatch.style.background = value || '#e9ecef';

    const heading = document.createElement('h6');
    heading.className = 'fw-semibold mb-1';
    heading.textContent = subtitle ? `${subtitle} (${title})` : title;

    const variableEl = document.createElement('code');
    variableEl.className = 'd-block mb-2';
    variableEl.textContent = variable || '—';

    card.appendChild(swatch);
    card.appendChild(heading);
    card.appendChild(variableEl);

    details.forEach((detail) => {
        card.appendChild(createDetailRow(detail.label, detail.value));
    });

    col.appendChild(card);
    return col;
}

function renderActionColorMap() {
    const container = document.getElementById('actionColorMap');
    if (!container) {
        return;
    }
    container.innerHTML = '';

    const configsByType = BUTTON_DEMO_CONFIGS.reduce((acc, cfg) => {
        acc[cfg.type] = cfg;
        return acc;
    }, {});

    Object.entries(BUTTON_COLOR_VARIABLES)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([type, cssVariable]) => {
            const computedValue = getCssVariableValue(cssVariable);
            const config = configsByType[type] || {};
            const card = createColorTokenCard({
                title: type,
                subtitle: resolveButtonText(type),
                variable: cssVariable,
                value: computedValue,
                details: [
                    { label: 'ערך מחושב', value: computedValue },
                    { label: 'תיאור', value: config.description || '' }
                ]
            });
            container.appendChild(card);
        });
}

function renderEntityColorMap() {
    const container = document.getElementById('entityColorMap');
    if (!container) {
        return;
    }
    container.innerHTML = '';

    const entities = Object.entries(window.ENTITY_COLORS || {})
        .sort(([a], [b]) => a.localeCompare(b));

    entities.forEach(([entity, mainColor]) => {
        const label = typeof window.getEntityLabel === 'function'
            ? window.getEntityLabel(entity)
            : entity;

        const details = [
            { label: 'Main', value: mainColor },
            { label: 'Background', value: window.ENTITY_BACKGROUND_COLORS?.[entity] },
            { label: 'Border', value: window.ENTITY_BORDER_COLORS?.[entity] },
            { label: 'Text', value: window.ENTITY_TEXT_COLORS?.[entity] }
        ].filter((detail) => detail.value);

        const card = createColorTokenCard({
            title: entity,
            subtitle: label,
            variable: `entity-${entity}`,
            value: mainColor,
            details
        });

        container.appendChild(card);
    });
}

function renderColorMaps() {
    renderActionColorMap();
    renderEntityColorMap();
}

function createButtonRow(button) {
    const row = document.createElement('tr');
    row.setAttribute('data-category', button.category);
    row.setAttribute('data-type', button.type);
    
    const liveCell = document.createElement('td');
    const variantsContainer = document.createElement('div');
    variantsContainer.className = 'button-variants-container';
    
    const variantDescriptors = [
        { label: 'קטן', variant: 'small' },
        { label: 'רגיל', variant: 'normal' },
        { label: 'מלא', variant: 'full' },
        { label: 'גדול מאוד', variant: 'full', size: 'xlarge' },
        { label: 'נגטיב', variant: 'full', style: 'negative' }
    ];

    variantDescriptors.forEach((descriptor) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'mb-2 d-flex align-items-center gap-1';
        const label = document.createElement('small');
        label.className = 'text-muted';
        label.textContent = descriptor.label + ':';
        wrapper.appendChild(label);
        wrapper.appendChild(createVariantButton(button, descriptor.variant, descriptor.size, descriptor.style));
        variantsContainer.appendChild(wrapper);
    });

    if (button.supportsEntity) {
        const entityWrapper = document.createElement('div');
        entityWrapper.className = 'mb-2 d-flex align-items-center gap-1';
        const label = document.createElement('small');
        label.className = 'text-muted';
        label.textContent = 'ישות:';
        entityWrapper.appendChild(label);
        entityWrapper.appendChild(createVariantButton(button, 'full', 'normal', 'default', 'trade'));
        variantsContainer.appendChild(entityWrapper);
    }

    liveCell.appendChild(variantsContainer);

    const nameCell = document.createElement('td');
    nameCell.innerHTML = `<strong>${button.name}</strong><br><small class="text-muted">${button.type}</small>`;
    
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = button.description;
    
    const colorCell = document.createElement('td');
    colorCell.appendChild(createColorPreview(button.colorVariable, button.type));

    row.appendChild(liveCell);
    row.appendChild(nameCell);
    row.appendChild(descriptionCell);
    row.appendChild(colorCell);
    
    return row;
}

function initializeButtonVariantsDemo() {
    const smallDemo = document.getElementById('smallButtonsDemo');
    const normalDemo = document.getElementById('normalButtonsDemo');
    const fullDemo = document.getElementById('fullButtonsDemo');

    if (!smallDemo || !normalDemo || !fullDemo) {
        return;
    }

    smallDemo.innerHTML = '';
    normalDemo.innerHTML = '';
    fullDemo.innerHTML = '';

    BUTTON_SYSTEM_DEMO.buttons.slice(0, 3).forEach((button) => {
        smallDemo.appendChild(createVariantButton(button, 'small'));
        normalDemo.appendChild(createVariantButton(button, 'normal'));
        fullDemo.appendChild(createVariantButton(button, 'full'));
    });

    if (window.advancedButtonSystem?.processButtons) {
        window.advancedButtonSystem.processButtons(smallDemo);
        window.advancedButtonSystem.processButtons(normalDemo);
        window.advancedButtonSystem.processButtons(fullDemo);
    }
}

function loadButtonTable() {
    BUTTON_SYSTEM_DEMO.refresh();
    const tbody = document.getElementById('buttonTableBody');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '';

    BUTTON_SYSTEM_DEMO.buttons.forEach((button) => {
        tbody.appendChild(createButtonRow(button));
    });

    initializeButtonVariantsDemo();
    updateStats();

    if (window.advancedButtonSystem?.processButtons) {
        window.advancedButtonSystem.processButtons(tbody);
    }
}

function filterButtons() {
    const filter = document.getElementById('buttonFilter');
    if (!filter) {
        return;
    }
    
    const searchTerm = filter.value.toLowerCase();
    const rows = document.querySelectorAll('#buttonTableBody tr');
    
    rows.forEach((row) => {
        const name = row.querySelector('td:nth-child(2)')?.textContent?.toLowerCase() || '';
        const description = row.querySelector('td:nth-child(3)')?.textContent?.toLowerCase() || '';
        const type = row.getAttribute('data-type')?.toLowerCase() || '';

        if (name.includes(searchTerm) || description.includes(searchTerm) || type.includes(searchTerm)) {
            row.classList.remove('d-none');
        } else {
            row.classList.add('d-none');
        }
    });
    
    updateStats();
}

function updateStats() {
    const totalButtons = BUTTON_SYSTEM_DEMO.buttons.length;
    const visibleRows = document.querySelectorAll('#buttonTableBody tr:not(.d-none)');
    const activeButtons = visibleRows.length;
    const categories = [...new Set(BUTTON_SYSTEM_DEMO.buttons.map((btn) => btn.category))];
    
    const totalElement = document.getElementById('totalButtons');
    const activeElement = document.getElementById('activeButtons');
    const categoriesElement = document.getElementById('categoriesCount');
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    if (totalElement) totalElement.textContent = totalButtons;
    if (activeElement) activeElement.textContent = activeButtons;
    if (categoriesElement) categoriesElement.textContent = categories.length;
    if (lastUpdateElement) lastUpdateElement.textContent = new Date().toLocaleTimeString('he-IL');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔘 Button System Demo: Initializing...');
    setTimeout(() => {
        loadButtonTable();
        renderColorMaps();
        console.log('✅ Button System Demo: Table loaded');
    }, 500);
});

function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'designs',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            buttonSystemStats: {
                totalButtons: document.getElementById('totalButtons')?.textContent || 'לא נמצא',
                activeButtons: document.getElementById('activeButtons')?.textContent || 'לא נמצא',
                categoriesCount: document.getElementById('categoriesCount')?.textContent || 'לא נמצא',
                lastUpdate: document.getElementById('lastUpdate')?.textContent || 'לא נמצא'
            },
            buttonCatalog: BUTTON_SYSTEM_DEMO.buttons.map((btn) => ({
                type: btn.type,
                name: btn.name,
                category: btn.category,
                colorVariable: btn.colorVariable,
                supportsEntity: btn.supportsEntity,
                modernHtml: btn.modernHtml,
                legacyHtml: btn.legacyHtml
            }))
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}

async function copyButtonSystemDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את סטטוס עמוד העיצובים');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
        console.error('שגיאה בהעתקה:', err);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (window.showSuccessNotification) {
            window.showSuccessNotification('הועתק ללוח', text.slice(0, 60));
        } else {
            alert('✅ הועתק ללוח!');
        }
    }).catch((err) => {
        console.error('שגיאה בהעתקה:', err);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקה ללוח');
        } else {
            alert('שגיאה בהעתקה ללוח');
        }
    });
}

window.loadButtonTable = loadButtonTable;
window.filterButtons = filterButtons;
window.copyToClipboard = copyToClipboard;
window.generateDetailedLog = generateDetailedLog;
window.copyButtonSystemDetailedLog = copyButtonSystemDetailedLog;
window.renderColorMaps = renderColorMaps;