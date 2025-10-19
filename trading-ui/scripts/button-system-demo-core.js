/**
 * Button System Demo - Configuration and Functions
 * Displays all available buttons in the centralized system
 */

const BUTTON_SYSTEM_DEMO = {
    buttons: [
        {
            type: 'EDIT',
            name: 'עריכה',
            description: 'כפתור לעריכת רשומות',
            category: 'פעולות',
            icon: '✏️',
            text: 'ערוך',
            class: 'btn-secondary',
            colorVariable: '--color-action-edit',
            variants: {
                small: { icon: '✏️', text: '' },
                normal: { icon: '', text: 'ערוך' },
                full: { icon: '✏️', text: 'ערוך' }
            },
            oldHtml: '<button class="btn btn-secondary" onclick="editRecord()"><i class="fas fa-edit"></i> ערוך</button>',
            newHtml: '<button data-button-type="EDIT" data-onclick="editRecord()" data-classes="btn-secondary" data-text="ערוך"></button>',
            jsCode: 'createEditButton(\'editRecord()\')'
        },
        {
            type: 'DELETE',
            name: 'מחיקה',
            description: 'כפתור למחיקת רשומות',
            category: 'פעולות',
            icon: '🗑️',
            text: 'מחק',
            class: 'btn-danger',
            colorVariable: '--color-action-delete',
            variants: {
                small: { icon: '🗑️', text: '' },
                normal: { icon: '', text: 'מחק' },
                full: { icon: '🗑️', text: 'מחק' }
            },
            oldHtml: '<button class="btn btn-danger" onclick="deleteRecord()"><i class="fas fa-trash"></i> מחק</button>',
            newHtml: '<button data-button-type="DELETE" data-onclick="deleteRecord()" data-classes="btn-danger" data-text="מחק"></button>',
            jsCode: 'createDeleteButton(\'deleteRecord()\')'
        },
        {
            type: 'ADD',
            name: 'הוספה',
            description: 'כפתור להוספת רשומות חדשות',
            category: 'פעולות',
            icon: '➕',
            text: 'הוסף',
            class: 'btn-success',
            colorVariable: '--color-action-add',
            variants: {
                small: { icon: '➕', text: '' },
                normal: { icon: '', text: 'הוסף' },
                full: { icon: '➕', text: 'הוסף' }
            },
            oldHtml: '<button class="btn btn-success" onclick="showAddModal()"><i class="fas fa-plus"></i> הוסף</button>',
            newHtml: '<button data-button-type="ADD" data-onclick="showAddModal()" data-classes="btn-success" data-text="הוסף"></button>',
            jsCode: 'createButton(\'ADD\', \'showAddModal()\')'
        },
        {
            type: 'SAVE',
            name: 'שמירה',
            description: 'כפתור לשמירת נתונים',
            category: 'פעולות',
            icon: '💾',
            text: 'שמור',
            class: 'btn-success',
            colorVariable: '--color-action-save',
            variants: {
                small: { icon: '💾', text: '' },
                normal: { icon: '', text: 'שמור' },
                full: { icon: '💾', text: 'שמור' }
            },
            oldHtml: '<button class="btn btn-success" onclick="saveData()"><i class="fas fa-save"></i> שמור</button>',
            newHtml: '<button data-button-type="SAVE" data-onclick="saveData()" data-classes="btn-success" data-text="שמור"></button>',
            jsCode: 'createButton(\'SAVE\', \'saveData()\')'
        },
        {
            type: 'CANCEL',
            name: 'ביטול',
            description: 'כפתור לביטול פעולות',
            category: 'פעולות',
            icon: '❌',
            text: 'ביטול',
            class: 'btn-secondary',
            colorVariable: '--color-action-cancel',
            variants: {
                small: { icon: '❌', text: '' },
                normal: { icon: '', text: 'ביטול' },
                full: { icon: '❌', text: 'ביטול' }
            },
            oldHtml: '<button class="btn btn-secondary" onclick="closeModal()" data-bs-dismiss="modal">❌ ביטול</button>',
            newHtml: '<button data-button-type="CANCEL" data-onclick="closeModal()" data-classes="btn-secondary" data-text="ביטול" data-attributes="data-bs-dismiss=\'modal\'"></button>',
            jsCode: 'createButton(\'CANCEL\', \'closeModal()\')'
        },
        {
            type: 'LINK',
            name: 'קישור',
            description: 'כפתור לקישור לרשומות קשורות',
            category: 'ניווט',
            icon: '🔗',
            text: 'קישור',
            class: 'btn-info',
            colorVariable: '--color-action-link',
            variants: {
                small: { icon: '🔗', text: '' },
                normal: { icon: '', text: 'קישור' },
                full: { icon: '🔗', text: 'קישור' }
            },
            oldHtml: '<button class="btn btn-info" onclick="openLink()"><i class="fas fa-link"></i> קישור</button>',
            newHtml: '<button data-button-type="LINK" data-onclick="openLink()" data-classes="btn-info" data-text="קישור"></button>',
            jsCode: 'createLinkButton(\'openLink()\')'
        },
        {
            type: 'REFRESH',
            name: 'רענון',
            description: 'כפתור לרענון נתונים',
            category: 'פעולות',
            icon: '🔄',
            text: 'רענן',
            class: 'btn-outline-secondary',
            colorVariable: '--color-action-refresh',
            variants: {
                small: { icon: '🔄', text: '' },
                normal: { icon: '', text: 'רענן' },
                full: { icon: '🔄', text: 'רענן' }
            },
            oldHtml: '<button class="btn btn-outline-secondary" onclick="refreshData()"><i class="fas fa-sync-alt"></i> רענן</button>',
            newHtml: '<button data-button-type="REFRESH" data-onclick="refreshData()" data-classes="btn-outline-secondary" data-text="רענן"></button>',
            jsCode: 'createButton(\'REFRESH\', \'refreshData()\')'
        },
        {
            type: 'EXPORT',
            name: 'ייצוא',
            description: 'כפתור לייצוא נתונים',
            category: 'פעולות',
            icon: '📤',
            text: 'ייצא',
            class: 'btn-outline-primary',
            colorVariable: '--color-action-export',
            variants: {
                small: { icon: '📤', text: '' },
                normal: { icon: '', text: 'ייצא' },
                full: { icon: '📤', text: 'ייצא' }
            },
            oldHtml: '<button class="btn btn-outline-primary" onclick="exportData()"><i class="fas fa-download"></i> ייצא</button>',
            newHtml: '<button data-button-type="EXPORT" data-onclick="exportData()" data-classes="btn-outline-primary" data-text="ייצא"></button>',
            jsCode: 'createButton(\'EXPORT\', \'exportData()\')'
        },
        {
            type: 'IMPORT',
            name: 'ייבוא',
            description: 'כפתור לייבוא נתונים',
            category: 'פעולות',
            icon: '📥',
            text: 'ייבא',
            class: 'btn-outline-success',
            colorVariable: '--color-action-import',
            variants: {
                small: { icon: '📥', text: '' },
                normal: { icon: '', text: 'ייבא' },
                full: { icon: '📥', text: 'ייבא' }
            },
            oldHtml: '<button class="btn btn-outline-success" onclick="importData()"><i class="fas fa-upload"></i> ייבא</button>',
            newHtml: '<button data-button-type="IMPORT" data-onclick="importData()" data-classes="btn-outline-success" data-text="ייבא"></button>',
            jsCode: 'createButton(\'IMPORT\', \'importData()\')'
        },
        {
            type: 'SEARCH',
            name: 'חיפוש',
            description: 'כפתור לחיפוש נתונים',
            category: 'פעולות',
            icon: '🔍',
            text: 'חיפוש',
            class: 'btn-outline-info',
            colorVariable: '--color-action-search',
            variants: {
                small: { icon: '🔍', text: '' },
                normal: { icon: '', text: 'חיפוש' },
                full: { icon: '🔍', text: 'חיפוש' }
            },
            oldHtml: '<button class="btn btn-outline-info" onclick="searchData()"><i class="fas fa-search"></i> חיפוש</button>',
            newHtml: '<button data-button-type="SEARCH" data-onclick="searchData()" data-classes="btn-outline-info" data-text="חיפוש"></button>',
            jsCode: 'createButton(\'SEARCH\', \'searchData()\')'
        },
        {
            type: 'FILTER',
            name: 'פילטר',
            description: 'כפתור לפילטור נתונים',
            category: 'פעולות',
            icon: '🔧',
            text: 'פילטר',
            class: 'btn-outline-warning',
            colorVariable: '--color-action-filter',
            variants: {
                small: { icon: '🔧', text: '' },
                normal: { icon: '', text: 'פילטר' },
                full: { icon: '🔧', text: 'פילטר' }
            },
            oldHtml: '<button class="btn btn-outline-warning" onclick="filterData()"><i class="fas fa-filter"></i> פילטר</button>',
            newHtml: '<button data-button-type="FILTER" data-onclick="filterData()" data-classes="btn-outline-warning" data-text="פילטר"></button>',
            jsCode: 'createButton(\'FILTER\', \'filterData()\')'
        },
        {
            type: 'VIEW',
            name: 'צפייה',
            description: 'כפתור לצפייה בפרטים',
            category: 'פעולות',
            icon: '👁️',
            text: 'צפה',
            class: 'btn-outline-info',
            colorVariable: '--color-action-view',
            variants: {
                small: { icon: '👁️', text: '' },
                normal: { icon: '', text: 'צפה' },
                full: { icon: '👁️', text: 'צפה' }
            },
            oldHtml: '<button class="btn btn-outline-info" onclick="viewDetails()"><i class="fas fa-eye"></i> צפה</button>',
            newHtml: '<button data-button-type="VIEW" data-onclick="viewDetails()" data-classes="btn-outline-info" data-text="צפה"></button>',
            jsCode: 'createButton(\'VIEW\', \'viewDetails()\')'
        },
        {
            type: 'TOGGLE',
            name: 'הצג/הסתר',
            description: 'כפתור להצגה והסתרה של סקשנים',
            category: 'ניווט',
            icon: '▼',
            text: 'הצג/הסתר',
            class: 'btn-outline-warning',
            oldHtml: '<button class="btn btn-outline-warning" onclick="toggleSection()">▼ הצג/הסתר</button>',
            newHtml: '<button data-button-type="TOGGLE" data-onclick="toggleSection()" data-classes="btn-outline-warning" data-text="הצג/הסתר"></button>',
            jsCode: 'createToggleButton(\'toggleSection()\')'
        },
        {
            type: 'CLOSE',
            name: 'סגירה',
            description: 'כפתור לסגירת מודלים',
            category: 'ניווט',
            icon: '✖️',
            text: 'סגור',
            class: 'btn-secondary',
            oldHtml: '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>',
            newHtml: '<button data-button-type="CLOSE" data-attributes="type=\'button\' class=\'btn-close\' data-bs-dismiss=\'modal\'"></button>',
            jsCode: 'createCloseButton()'
        },
        {
            type: 'SORT',
            name: 'מיון',
            description: 'כפתור למיון טבלאות',
            category: 'פעולות',
            icon: '↕️',
            text: 'מיון',
            class: 'btn-link',
            oldHtml: '<button class="btn btn-link" onclick="sortTable()">↕️ מיון</button>',
            newHtml: '<button data-button-type="SORT" data-onclick="sortTable()" data-classes="btn-link" data-text="מיון"></button>',
            jsCode: 'createSortButton(\'sortTable()\')'
        },
        {
            type: 'DUPLICATE',
            name: 'שכפול',
            description: 'כפתור לשכפול רשומות',
            category: 'פעולות',
            icon: '📋',
            text: 'שכפל',
            class: 'btn-outline-secondary',
            oldHtml: '<button class="btn btn-outline-secondary" onclick="duplicateRecord()"><i class="fas fa-copy"></i> שכפל</button>',
            newHtml: '<button data-button-type="DUPLICATE" data-onclick="duplicateRecord()" data-classes="btn-outline-secondary" data-text="שכפל"></button>',
            jsCode: 'createButton(\'DUPLICATE\', \'duplicateRecord()\')'
        },
        {
            type: 'ARCHIVE',
            name: 'ארכוב',
            description: 'כפתור לארכוב רשומות',
            category: 'פעולות',
            icon: '📦',
            text: 'ארכב',
            class: 'btn-outline-warning',
            oldHtml: '<button class="btn btn-outline-warning" onclick="archiveRecord()"><i class="fas fa-archive"></i> ארכב</button>',
            newHtml: '<button data-button-type="ARCHIVE" data-onclick="archiveRecord()" data-classes="btn-outline-warning" data-text="ארכב"></button>',
            jsCode: 'createButton(\'ARCHIVE\', \'archiveRecord()\')'
        },
        {
            type: 'RESTORE',
            name: 'שחזור',
            description: 'כפתור לשחזור רשומות',
            category: 'פעולות',
            icon: '📤',
            text: 'שחזר',
            class: 'btn-outline-success',
            oldHtml: '<button class="btn btn-outline-success" onclick="restoreRecord()"><i class="fas fa-undo"></i> שחזר</button>',
            newHtml: '<button data-button-type="RESTORE" data-onclick="restoreRecord()" data-classes="btn-outline-success" data-text="שחזר"></button>',
            jsCode: 'createButton(\'RESTORE\', \'restoreRecord()\')'
        },
        {
            type: 'APPROVE',
            name: 'אישור',
            description: 'כפתור לאישור פעולות',
            category: 'פעולות',
            icon: '✅',
            text: 'אשר',
            class: 'btn-success',
            oldHtml: '<button class="btn btn-success" onclick="approveRecord()"><i class="fas fa-check"></i> אשר</button>',
            newHtml: '<button data-button-type="APPROVE" data-onclick="approveRecord()" data-classes="btn-success" data-text="אשר"></button>',
            jsCode: 'createButton(\'APPROVE\', \'approveRecord()\')'
        },
        {
            type: 'REJECT',
            name: 'דחייה',
            description: 'כפתור לדחיית פעולות',
            category: 'פעולות',
            icon: '❌',
            text: 'דחה',
            class: 'btn-danger',
            oldHtml: '<button class="btn btn-danger" onclick="rejectRecord()"><i class="fas fa-times"></i> דחה</button>',
            newHtml: '<button data-button-type="REJECT" data-onclick="rejectRecord()" data-classes="btn-danger" data-text="דחה"></button>',
            jsCode: 'createButton(\'REJECT\', \'rejectRecord()\')'
        },
        {
            type: 'PAUSE',
            name: 'השהיה',
            description: 'כפתור להשהיית פעולות',
            category: 'פעולות',
            icon: '⏸️',
            text: 'השהה',
            class: 'btn-warning',
            oldHtml: '<button class="btn btn-warning" onclick="pauseRecord()"><i class="fas fa-pause"></i> השהה</button>',
            newHtml: '<button data-button-type="PAUSE" data-onclick="pauseRecord()" data-classes="btn-warning" data-text="השהה"></button>',
            jsCode: 'createButton(\'PAUSE\', \'pauseRecord()\')'
        },
        {
            type: 'PLAY',
            name: 'הפעלה',
            description: 'כפתור להפעלת פעולות',
            category: 'פעולות',
            icon: '▶️',
            text: 'הפעל',
            class: 'btn-success',
            oldHtml: '<button class="btn btn-success" onclick="playRecord()"><i class="fas fa-play"></i> הפעל</button>',
            newHtml: '<button data-button-type="PLAY" data-onclick="playRecord()" data-classes="btn-success" data-text="הפעל"></button>',
            jsCode: 'createButton(\'PLAY\', \'playRecord()\')'
        },
        {
            type: 'STOP',
            name: 'עצירה',
            description: 'כפתור לעצירת פעולות',
            category: 'פעולות',
            icon: '⏹️',
            text: 'עצור',
            class: 'btn-danger',
            oldHtml: '<button class="btn btn-danger" onclick="stopRecord()"><i class="fas fa-stop"></i> עצור</button>',
            newHtml: '<button data-button-type="STOP" data-onclick="stopRecord()" data-classes="btn-danger" data-text="עצור"></button>',
            jsCode: 'createButton(\'STOP\', \'stopRecord()\')'
        },
        {
            type: 'READ',
            name: 'קריאה',
            description: 'כפתור לסימון כנקרא',
            category: 'פעולות',
            icon: '✓',
            text: 'קראתי',
            class: 'btn-outline-success',
            oldHtml: '<button class="btn btn-outline-success" onclick="markAsRead()"><i class="fas fa-check"></i> קראתי</button>',
            newHtml: '<button data-button-type="READ" data-onclick="markAsRead()" data-classes="btn-outline-success" data-text="קראתי"></button>',
            jsCode: 'createButton(\'READ\', \'markAsRead()\')'
        },
        {
            type: 'CHECK',
            name: 'סימון',
            description: 'כפתור לסימון כללי',
            category: 'פעולות',
            icon: '✓',
            text: 'סמן',
            class: 'btn-outline-success',
            oldHtml: '<button class="btn btn-outline-success" onclick="checkRecord()"><i class="fas fa-check"></i> סמן</button>',
            newHtml: '<button data-button-type="CHECK" data-onclick="checkRecord()" data-classes="btn-outline-success" data-text="סמן"></button>',
            jsCode: 'createButton(\'CHECK\', \'checkRecord()\')'
        },
        {
            type: 'COPY',
            name: 'העתקה',
            description: 'כפתור להעתקת נתונים',
            category: 'פעולות',
            icon: '📋',
            text: 'העתק',
            class: 'btn-outline-secondary',
            oldHtml: '<button class="btn btn-outline-secondary" onclick="copyData()"><i class="fas fa-copy"></i> העתק</button>',
            newHtml: '<button data-button-type="COPY" data-onclick="copyData()" data-classes="btn-outline-secondary" data-text="העתק"></button>',
            jsCode: 'createButton(\'COPY\', \'copyData()\')'
        },
        {
            type: 'REACTIVATE',
            name: 'הפעלה מחדש',
            description: 'כפתור להפעלה מחדש של פריטים',
            category: 'פעולות',
            icon: '🔄',
            text: 'הפעל מחדש',
            class: 'btn-success',
            oldHtml: '<button class="btn btn-success" onclick="reactivateItem()"><i class="fas fa-redo"></i> הפעל מחדש</button>',
            newHtml: '<button data-button-type="REACTIVATE" data-onclick="reactivateItem()" data-classes="btn-success" data-text="הפעל מחדש"></button>',
            jsCode: 'createButton(\'REACTIVATE\', \'reactivateItem()\')'
        }
    ]
};

/**
 * Load button table with all available buttons
 */
function loadButtonTable() {
    const tbody = document.getElementById('buttonTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    BUTTON_SYSTEM_DEMO.buttons.forEach((button, index) => {
        const row = createButtonRow(button, index);
        tbody.appendChild(row);
    });
    
    // Initialize button variants demo
    initializeButtonVariantsDemo();
    
    updateStats();
}

/**
 * Get color name from CSS class
 */
function getColorName(cssClass) {
    const colorMap = {
        'btn-secondary': 'אפור',
        'btn-danger': 'אדום',
        'btn-success': 'ירוק',
        'btn-primary': 'כחול',
        'btn-info': 'כחול בהיר',
        'btn-warning': 'צהוב',
        'btn-outline-secondary': 'אפור מסגרת',
        'btn-outline-primary': 'כחול מסגרת',
        'btn-outline-success': 'ירוק מסגרת',
        'btn-outline-danger': 'אדום מסגרת',
        'btn-outline-info': 'כחול בהיר מסגרת',
        'btn-outline-warning': 'צהוב מסגרת'
    };
    return colorMap[cssClass] || cssClass;
}

function getColorVariable(cssClass) {
    const variableMap = {
        'btn-secondary': '--secondary-color',
        'btn-danger': '--danger-color',
        'btn-success': '--success-color',
        'btn-primary': '--primary-color',
        'btn-info': '--info-color',
        'btn-warning': '--warning-color',
        'btn-outline-secondary': '--secondary-color',
        'btn-outline-primary': '--primary-color',
        'btn-outline-success': '--success-color',
        'btn-outline-danger': '--danger-color',
        'btn-outline-info': '--info-color',
        'btn-outline-warning': '--warning-color'
    };
    return variableMap[cssClass] || '--secondary-color';
}

/**
 * Initialize button variants demo
 */
function initializeButtonVariantsDemo() {
    const smallDemo = document.getElementById('smallButtonsDemo');
    const normalDemo = document.getElementById('normalButtonsDemo');
    const fullDemo = document.getElementById('fullButtonsDemo');
    
    if (!smallDemo || !normalDemo || !fullDemo) return;
    
    // Clear existing content
    smallDemo.innerHTML = '';
    normalDemo.innerHTML = '';
    fullDemo.innerHTML = '';
    
    // Get first 3 buttons for demo
    const demoButtons = BUTTON_SYSTEM_DEMO.buttons.slice(0, 3);
    
    demoButtons.forEach(button => {
        // Small variant (icon only)
        const smallBtn = createVariantButton(button, 'small');
        smallDemo.appendChild(smallBtn);
        
        // Normal variant (text only)
        const normalBtn = createVariantButton(button, 'normal');
        normalDemo.appendChild(normalBtn);
        
        // Full variant (icon + text)
        const fullBtn = createVariantButton(button, 'full');
        fullDemo.appendChild(fullBtn);
    });
}

/**
 * Create a button variant
 */
function createVariantButton(button, variant, size = 'normal', style = 'default', entityType = null) {
    const btn = document.createElement('button');
    btn.className = `btn`;
    btn.style.fontSize = '12px';
    btn.style.padding = '4px 8px';
    btn.style.height = '28px';
    btn.style.marginRight = '4px';
    
    // Set data attributes for new system
    btn.setAttribute('data-button-type', button.type);
    btn.setAttribute('data-variant', variant);
    if (size !== 'normal') btn.setAttribute('data-size', size);
    if (style !== 'default') btn.setAttribute('data-style', style);
    if (entityType) btn.setAttribute('data-entity-type', entityType);
    
    // Set default variant to normal if not specified
    if (!variant || variant === 'default' || variant === '') {
        btn.setAttribute('data-variant', 'normal');
        variant = 'normal';
    }
    
    // Auto-generate variant data for all buttons
    let variantData;
    switch (variant) {
        case 'small':
            variantData = { icon: button.icon || '', text: '' };
            break;
        case 'normal':
            variantData = { icon: '', text: button.text || '' };
            break;
        case 'full':
            variantData = { icon: button.icon || '', text: button.text || '' };
            break;
        default:
            variantData = { icon: button.icon || '', text: button.text || '' };
    }
    
    // Set content based on variant - let the button system handle the content
    if (variant === 'small') {
        btn.setAttribute('data-text', '');
        btn.setAttribute('data-icon', variantData.icon);
    } else if (variant === 'normal') {
        btn.setAttribute('data-text', variantData.text);
        btn.setAttribute('data-icon', '');
    } else if (variant === 'full') {
        btn.setAttribute('data-text', variantData.text);
        btn.setAttribute('data-icon', variantData.icon);
    } else {
        // Default to normal variant
        btn.setAttribute('data-text', variantData.text);
        btn.setAttribute('data-icon', '');
    }
    
    btn.onclick = () => {
        alert(`כפתור ${button.name} (${variant}) נלחץ!`);
    };
    
    return btn;
}

/**
 * Create a table row for a button
 */
function createButtonRow(button, index) {
    const row = document.createElement('tr');
    row.setAttribute('data-category', button.category);
    row.setAttribute('data-type', button.type);
    
    // Live example cell
    const liveExampleCell = document.createElement('td');
    liveExampleCell.style.minWidth = '200px';
    
    // Create container for all three variants
    const variantsContainer = document.createElement('div');
    variantsContainer.className = 'button-variants-container';
    
    // Small variant
    const smallContainer = document.createElement('div');
    smallContainer.className = 'mb-2';
    smallContainer.innerHTML = '<small class="text-muted">קטן:</small>';
    const smallButton = createVariantButton(button, 'small');
    smallContainer.appendChild(smallButton);
    
    // Normal variant
    const normalContainer = document.createElement('div');
    normalContainer.className = 'mb-2';
    normalContainer.innerHTML = '<small class="text-muted">רגיל:</small>';
    const normalButton = createVariantButton(button, 'normal');
    normalContainer.appendChild(normalButton);
    
    // Full variant
    const fullContainer = document.createElement('div');
    fullContainer.className = 'mb-2';
    fullContainer.innerHTML = '<small class="text-muted">מלא:</small>';
    const fullButton = createVariantButton(button, 'full');
    fullContainer.appendChild(fullButton);
    
    // XLarge variant
    const xlargeContainer = document.createElement('div');
    xlargeContainer.className = 'mb-2';
    xlargeContainer.innerHTML = '<small class="text-muted">גדול מאוד:</small>';
    const xlargeButton = createVariantButton(button, 'full', 'xlarge');
    xlargeContainer.appendChild(xlargeButton);
    
    // Negative variant
    const negativeContainer = document.createElement('div');
    negativeContainer.className = 'mb-2';
    negativeContainer.innerHTML = '<small class="text-muted">נגטיב:</small>';
    const negativeButton = createVariantButton(button, 'full', 'normal', 'negative');
    negativeContainer.appendChild(negativeButton);
    
    // Entity variant (if supported)
    if (['CLOSE', 'ADD', 'LINK', 'SAVE'].includes(button.type)) {
        const entityContainer = document.createElement('div');
        entityContainer.className = 'mb-2';
        entityContainer.innerHTML = '<small class="text-muted">ישות:</small>';
        const entityButton = createVariantButton(button, 'full', 'normal', 'default', 'trade_plan');
        entityContainer.appendChild(entityButton);
        
        variantsContainer.appendChild(entityContainer);
    }
    
    variantsContainer.appendChild(smallContainer);
    variantsContainer.appendChild(normalContainer);
    variantsContainer.appendChild(fullContainer);
    variantsContainer.appendChild(xlargeContainer);
    variantsContainer.appendChild(negativeContainer);
    liveExampleCell.appendChild(variantsContainer);
    
    // Name cell
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `<strong>${button.name}</strong><br><small class="text-muted">${button.type}</small>`;
    
    // Description cell
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = button.description;
    
    // Color variable cell
    const colorVariableCell = document.createElement('td');
    const colorName = getColorName(button.class);
    const colorVariable = button.colorVariable || 'לא מוגדר';
    colorVariableCell.innerHTML = `
        <div><strong>${colorName}</strong></div>
        <code style="font-size: 10px;">${colorVariable}</code>
        <div><small class="text-muted">תומך בישויות: ${['CLOSE', 'ADD', 'LINK', 'SAVE'].includes(button.type) ? 'כן' : 'לא'}</small></div>
    `;
    
    // Create hidden cells for code columns (for developers)
    const oldHtmlCell = document.createElement('td');
    oldHtmlCell.style.display = 'none';
    const oldCode = document.createElement('code');
    oldCode.textContent = button.oldHtml;
    oldCode.className = 'small';
    oldHtmlCell.appendChild(oldCode);
    
    const newHtmlCell = document.createElement('td');
    newHtmlCell.style.display = 'none';
    const newCode = document.createElement('code');
    newCode.textContent = button.newHtml;
    newCode.className = 'small';
    newHtmlCell.appendChild(newCode);
    
    const jsCodeCell = document.createElement('td');
    jsCodeCell.style.display = 'none';
    const jsCode = document.createElement('code');
    jsCode.textContent = button.jsCode;
    jsCode.className = 'small';
    jsCodeCell.appendChild(jsCode);
    
    const actionsCell = document.createElement('td');
    actionsCell.style.display = 'none';
    
    row.appendChild(liveExampleCell);
    row.appendChild(nameCell);
    row.appendChild(descriptionCell);
    row.appendChild(colorVariableCell);
    row.appendChild(oldHtmlCell);
    row.appendChild(newHtmlCell);
    row.appendChild(jsCodeCell);
    row.appendChild(actionsCell);
    
    // Add row to table
    document.getElementById('buttonTableBody').appendChild(row);
    
    return row;
}

/**
 * Create a live button example
 */
function createLiveButton(button) {
    const liveButton = document.createElement('button');
    liveButton.className = `btn`;
    liveButton.setAttribute('data-button-type', button.type);
    
    // Use full variant by default
    const variant = button.variants?.full || { icon: button.icon, text: button.text };
    liveButton.setAttribute('data-text', variant.text);
    liveButton.setAttribute('data-icon', variant.icon);
    
    liveButton.onclick = () => {
        alert(`כפתור ${button.name} נלחץ!`);
    };
    
    return liveButton;
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = '✅ הועתק ללוח!';
        toast.classList.add('toast-notification-style');
        document.body.appendChild(toast);
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }).catch(err => {
        console.error('שגיאה בהעתקה:', err);
        alert('שגיאה בהעתקה ללוח');
    });
}

/**
 * Filter buttons by search term
 */
function filterButtons() {
    const filter = document.getElementById('buttonFilter');
    if (!filter) return;
    
    const searchTerm = filter.value.toLowerCase();
    const rows = document.querySelectorAll('#buttonTableBody tr');
    
    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const description = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const type = row.getAttribute('data-type').toLowerCase();
        
        if (name.includes(searchTerm) || 
            description.includes(searchTerm) || 
            type.includes(searchTerm)) {
            row.classList.remove('d-none');
        } else {
            row.classList.add('d-none');
        }
    });
    
    updateStats();
}

/**
 * Update statistics display
 */
function updateStats() {
    const totalButtons = BUTTON_SYSTEM_DEMO.buttons.length;
    const visibleRows = document.querySelectorAll('#buttonTableBody tr:not(.d-none)');
    const activeButtons = visibleRows.length;
    const categories = [...new Set(BUTTON_SYSTEM_DEMO.buttons.map(btn => btn.category))];
    
    const totalElement = document.getElementById('totalButtons');
    const activeElement = document.getElementById('activeButtons');
    const categoriesElement = document.getElementById('categoriesCount');
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    if (totalElement) totalElement.textContent = totalButtons;
    if (activeElement) activeElement.textContent = activeButtons;
    if (categoriesElement) categoriesElement.textContent = categories.length;
    if (lastUpdateElement) lastUpdateElement.textContent = new Date().toLocaleTimeString('he-IL');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔘 Button System Demo: Initializing...');
    setTimeout(() => {
        loadButtonTable();
        console.log('✅ Button System Demo: Table loaded');
    }, 1000);
});

/**
 * Generate detailed log for Button System Demo
 */
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
            sections: {
                topSection: {
                    title: 'מערכת הכפתורים המרכזית',
                    visible: !document.getElementById('topSection')?.classList.contains('d-none'),
                    description: document.querySelector('.top-section .section-body p')?.textContent || 'לא נמצא'
                },
                section2: {
                    title: 'כל הכפתורים הזמינים במערכת',
                    visible: !document.getElementById('section2')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#buttonTableBody tr').length,
                    hasFilter: document.getElementById('buttonFilter') ? 'זמין' : 'לא זמין'
                }
            },
            buttonTableData: {
                totalRows: document.querySelectorAll('#buttonTableBody tr').length,
                headers: Array.from(document.querySelectorAll('#buttonSystemTable thead th')).map(th => th.textContent?.trim()),
                visibleRows: document.querySelectorAll('#buttonTableBody tr:not(.d-none)').length,
                hasData: document.querySelectorAll('#buttonTableBody tr').length > 0,
                filterValue: document.getElementById('buttonFilter')?.value || ''
            },
            buttonCategories: {
                categories: [...new Set(BUTTON_SYSTEM_DEMO.buttons.map(btn => btn.category))],
                totalCategories: [...new Set(BUTTON_SYSTEM_DEMO.buttons.map(btn => btn.category))].length,
                actionButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.category === 'פעולות').length,
                navigationButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.category === 'ניווט').length
            },
            buttonTypes: {
                editButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.type === 'EDIT').length,
                deleteButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.type === 'DELETE').length,
                addButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.type === 'ADD').length,
                saveButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.type === 'SAVE').length,
                cancelButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.type === 'CANCEL').length,
                toggleButtons: BUTTON_SYSTEM_DEMO.buttons.filter(btn => btn.type === 'TOGGLE').length
            },
            functions: {
                loadButtonTable: typeof window.loadButtonTable === 'function' ? 'זמין' : 'לא זמין',
                filterButtons: typeof window.filterButtons === 'function' ? 'זמין' : 'לא זמין',
                copyToClipboard: typeof window.copyToClipboard === 'function' ? 'זמין' : 'לא זמין',
                copyDetailedLog: typeof window.copyDetailedLog === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                toggleAllSections: typeof window.toggleAllSections === 'function' ? 'זמין' : 'לא זמין'
            },
            buttonSystemInit: {
                buttonSystemLoaded: typeof window.AdvancedButtonSystem !== 'undefined' ? 'זמין' : 'לא זמין',
                buttonIconsLoaded: typeof window.BUTTON_ICONS !== 'undefined' ? 'זמין' : 'לא זמין',
                buttonTextsLoaded: typeof window.BUTTON_TEXTS !== 'undefined' ? 'זמין' : 'לא זמין'
            },
            domElements: {
                buttonTable: document.getElementById('buttonSystemTable') ? 'זמין' : 'לא זמין',
                buttonTableBody: document.getElementById('buttonTableBody') ? 'זמין' : 'לא זמין',
                buttonFilter: document.getElementById('buttonFilter') ? 'זמין' : 'לא זמין',
                unifiedHeader: document.getElementById('unified-header') ? 'זמין' : 'לא זמין',
                notificationContainer: document.getElementById('notificationContainer') ? 'זמין' : 'לא זמין',
                toastContainer: document.getElementById('toastContainer') ? 'זמין' : 'לא זמין'
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages (temporary override)
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}

/**
 * Copy detailed log to clipboard for Button System Demo
 */
async function copyButtonSystemDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
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

// Export functions for global access
window.loadButtonTable = loadButtonTable;
window.filterButtons = filterButtons;
window.copyToClipboard = copyToClipboard;
window.generateDetailedLog = generateDetailedLog;
// window.copyButtonSystemDetailedLog export removed - using local function only