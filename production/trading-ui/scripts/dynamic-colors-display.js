/**
 * Dynamic Colors Display Page Script
 * Handles content injection into locked template sections
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeSectionToggles() - Initializesectiontoggles

// === Event Handlers ===
// - injectSection1Content() - Injectsection1Content
// - injectSection2Content() - Injectsection2Content
// - injectSection3Content() - Injectsection3Content
// - injectSection4Content() - Injectsection4Content

// === Other ===
// - generateDetailedLog() - Generatedetailedlog
// - copyDetailedLogLocal() - Copydetailedloglocal

// document.addEventListener('DOMContentLoaded', function() {
//     Logger.info('=== Dynamic Colors Display Page Loaded ===');

    // Initialize color scheme system
    if (window.generateNumericValueCSS) {
        window.generateNumericValueCSS();
    }

    if (window.generateEntityCSS) {
        window.generateEntityCSS();
    }

    // Inject content into sections
    injectSection1Content();
    injectSection2Content();
    injectSection3Content();
    injectSection4Content();

//     // Initialize section toggle functionality
//     initializeSectionToggles();
// });

/**
 * Inject content into Section 1 (Dynamic Colors - Numeric Values)
 */
function injectSection1Content() {
    // Get current colors from the system
    const positiveColor = window.getNumericValueColor(1, 'medium') || '#28a745';
    const negativeColor = window.getNumericValueColor(-1, 'medium') || '#dc3545';
    const zeroColor = window.getNumericValueColor(0, 'medium') || '#6c757d';

    const sectionContent = `
        <div class="row">
            <div class="col-12">
                <div class="alert alert-info">
                    <h5><i class="fas fa-info-circle"></i> מערכת צבעים דינמית לערכים מספריים</h5>
                    <p class="mb-0">הצבעים מוצגים לפי ההגדרות בעמוד ההעדפות. שנה את הצבעים שם וראה את השינויים כאן בזמן אמת.</p>
                </div>
            </div>
        </div>

        <!-- Numeric Values Examples -->
        <div class="row g-4">
            <!-- Positive Values -->
            <div class="col-md-6 col-lg-4">
                <div class="card h-100" style="border-color: ${positiveColor}; border-width: 2px;">
                    <div class="card-header" style="background-color: ${window.getNumericValueColor(1, 'light')}; color: ${window.getNumericValueColor(1, 'dark')}">
                        <h5 class="mb-0"><i class="fas fa-arrow-up"></i> ערכים חיוביים</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(1, 'light')}; color: ${window.getNumericValueColor(1, 'dark')}">
                                <span class="numeric-text-positive">+15.50%</span> - רווח יומי
                            </div>
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(1, 'light')}; color: ${window.getNumericValueColor(1, 'dark')}">
                                <span class="numeric-text-positive">+2,850.75 ₪</span> - רווח נקי
                                </div>
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(1, 'light')}; color: ${window.getNumericValueColor(1, 'dark')}">
                                <span class="numeric-text-positive">+0.75%</span> - שינוי חיובי
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">
                            צבע: ${positiveColor}
                        </small>
                                    </div>
                                </div>
                            </div>

            <!-- Negative Values -->
            <div class="col-md-6 col-lg-4">
                <div class="card h-100" style="border-color: ${negativeColor}; border-width: 2px;">
                    <div class="card-header" style="background-color: ${window.getNumericValueColor(-1, 'light')}; color: ${window.getNumericValueColor(-1, 'dark')}">
                        <h5 class="mb-0"><i class="fas fa-arrow-down"></i> ערכים שליליים</h5>
                                    </div>
                                    <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(-1, 'light')}; color: ${window.getNumericValueColor(-1, 'dark')}">
                                <span class="numeric-text-negative">-8.25%</span> - הפסד יומי
                            </div>
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(-1, 'light')}; color: ${window.getNumericValueColor(-1, 'dark')}">
                                <span class="numeric-text-negative">-1,420.50 ₪</span> - הפסד נקי
                                        </div>
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(-1, 'light')}; color: ${window.getNumericValueColor(-1, 'dark')}">
                                <span class="numeric-text-negative">-0.35%</span> - שינוי שלילי
                                        </div>
                                        </div>
                        <small class="text-muted mt-2 d-block">
                            צבע: ${negativeColor}
                        </small>
                                    </div>
                                </div>
                            </div>

            <!-- Zero/Neutral Values -->
            <div class="col-md-6 col-lg-4">
                <div class="card h-100" style="border-color: ${zeroColor}; border-width: 2px;">
                    <div class="card-header" style="background-color: ${window.getNumericValueColor(0, 'light')}; color: ${window.getNumericValueColor(0, 'dark')}">
                        <h5 class="mb-0"><i class="fas fa-minus"></i> ערכים נייטרליים</h5>
                                    </div>
                                    <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(0, 'light')}; color: ${window.getNumericValueColor(0, 'dark')}">
                                <span class="numeric-text-zero">0.00%</span> - ללא שינוי
                            </div>
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(0, 'light')}; color: ${window.getNumericValueColor(0, 'dark')}">
                                <span class="numeric-text-zero">0.00 ₪</span> - איזון
                            </div>
                            <div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(0, 'light')}; color: ${window.getNumericValueColor(0, 'dark')}">
                                <span class="numeric-text-zero">N/A</span> - לא זמין
                                        </div>
                                        </div>
                        <small class="text-muted mt-2 d-block">
                            צבע: ${zeroColor}
                        </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

        <!-- System Colors Info -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                                    <div class="card-body">
                        <h6><i class="fas fa-palette"></i> צבעי המערכת הנוכחיים:</h6>
                        <div class="row g-3 mt-2">
                            <div class="col-md-4">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="badge" style="background-color: ${positiveColor}; color: white;">רווחים</div>
                                    <code class="small">${positiveColor}</code>
                                        </div>
                                        </div>
                            <div class="col-md-4">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="badge" style="background-color: ${negativeColor}; color: white;">הפסדים</div>
                                    <code class="small">${negativeColor}</code>
                                        </div>
                                    </div>
                            <div class="col-md-4">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="badge" style="background-color: ${zeroColor}; color: white;">נייטרלי</div>
                                    <code class="small">${zeroColor}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section1-content');
    if (sectionElement) {
        sectionElement.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(sectionContent, 'text/html');
        doc.body.childNodes.forEach(node => {
            sectionElement.appendChild(node.cloneNode(true));
        });
    }
}

/**
 * Inject content into Section 2 (Entity Types)
 */
function injectSection2Content() {
    // Define entity groups with their types
    const entityGroups = [
        {
            title: 'טריידים ותכנונים',
            entities: ['trade', 'trade_plan', 'execution'],
            icon: 'fas fa-chart-line'
        },
        {
            title: 'חשבונות ותזרים מזומנים',
            entities: ['account', 'cash_flow'],
            icon: 'fas fa-university'
        },
        {
            title: 'טיקרים והתראות',
            entities: ['ticker', 'alert', 'note'],
            icon: 'fas fa-bell'
        }
    ];

    const sectionContent = `
        <div class="row">
            <div class="col-12">
                        <div class="alert alert-info">
                    <h5><i class="fas fa-tags"></i> צבעים לפי ישויות מערכת</h5>
                    <p class="mb-0">כל ישות במערכת (טרייד, חשבון, התראה וכו') מקבלת צבע ייחודי. ניתן לשנות את הצבעים בעמוד ההעדפות.</p>
                                </div>
                            </div>
                        </div>

        <!-- Entity Groups -->
        <div class="row g-4">
            ${entityGroups.map(group => {
                const entityCards = group.entities.map(entityType => {
                    const bgColor = window.getEntityBackgroundColor(entityType) || '#f8f9fa';
                    const textColor = window.getEntityTextColor(entityType) || '#495057';
                    const borderColor = window.getEntityBorderColor(entityType) || '#dee2e6';

                    return `
                        <div class="col-md-6 col-lg-4 mb-3">
                            <div class="card h-100" style="border-color: ${borderColor}; border-width: 2px;">
                                <div class="card-body p-3" style="background-color: ${bgColor}; color: ${textColor};">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <span class="entity-${entityType}">${window.getEntityLabel ? window.getEntityLabel(entityType) : entityType}</span>
                                        <small class="text-muted">${borderColor}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="col-12">
                        <div class="card">
                                    <div class="card-header">
                                <h5 class="mb-0"><i class="${group.icon}"></i> ${group.title}</h5>
                                    </div>
                                    <div class="card-body">
                                <div class="row g-3">
                                    ${entityCards}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
                                    </div>

        <!-- Color Legend -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                                    <div class="card-body">
                        <h6><i class="fas fa-palette"></i> צבעי ישויות נוכחיים:</h6>
                        <div class="row g-3 mt-2">
                            ${['trade', 'account', 'ticker', 'alert', 'cash_flow', 'note', 'trade_plan', 'execution'].map(entity => {
                                const color = window.getEntityColor(entity) || '#6c757d';
                                const label = window.getEntityLabel ? window.getEntityLabel(entity) : entity;
                                return `
                                    <div class="col-md-3">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="badge" style="background-color: ${color}; color: white; min-width: 80px;">${label}</div>
                                            <code class="small">${color}</code>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section2-content');
    if (sectionElement) {
        sectionElement.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(sectionContent, 'text/html');
        doc.body.childNodes.forEach(node => {
            sectionElement.appendChild(node.cloneNode(true));
        });
    }
}

/**
 * Inject content into Section 3 (Statuses and Modals)
 */
function injectSection3Content() {
    // Define status types and investment types
    const statuses = ['open', 'closed', 'cancelled'];
    const investmentTypes = ['swing', 'investment', 'passive'];

    const sectionContent = `
        <div class="row">
            <div class="col-12">
                <div class="alert alert-info">
                    <h5><i class="fas fa-chart-bar"></i> צבעים לסטטוסים ומודלים</h5>
                    <p class="mb-0">סטטוסי טריידים, סוגי השקעה וכותרות מודלים מקבלים צבעים ייחודיים הניתנים לשינוי בעמוד ההעדפות.</p>
                </div>
            </div>
                </div>

        <!-- Status and Investment Types -->
        <div class="row g-4">
            <!-- Trade Statuses -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-tasks"></i> סטטוסי טרייד</h5>
                            </div>
                            <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            ${statuses.map(status => {
                                const bgColor = window.getStatusBackgroundColor(status) || '#f8f9fa';
                                const textColor = window.getStatusTextColor(status) || '#495057';
                                const borderColor = window.getStatusBorderColor(status) || '#dee2e6';

                                return `
                                    <div class="p-3 rounded" style="background-color: ${bgColor}; color: ${textColor}; border: 2px solid ${borderColor};">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <span class="status-${status}">${status === 'open' ? 'פתוח' : status === 'closed' ? 'סגור' : 'מבוטל'}</span>
                                            <small class="text-muted">${borderColor}</small>
                                </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                        </div>
                    </div>

            <!-- Investment Types -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-pie"></i> סוגי השקעה</h5>
                            </div>
                            <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            ${investmentTypes.map(type => {
                                const bgColor = window.getInvestmentTypeBackgroundColor(type) || '#f8f9fa';
                                const textColor = window.getInvestmentTypeTextColor(type) || '#495057';
                                const borderColor = window.getInvestmentTypeBorderColor(type) || '#dee2e6';
                                const label = type === 'swing' ? 'Swing Trading' : type === 'investment' ? 'Investment' : 'Passive';

                                return `
                                    <div class="p-3 rounded" style="background-color: ${bgColor}; color: ${textColor}; border: 2px solid ${borderColor};">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <span class="investment-type-${type}">${label}</span>
                                            <small class="text-muted">${borderColor}</small>
                                </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                        </div>
                    </div>
                </div>

        <!-- Modal Headers Examples -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                                <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-window-maximize"></i> דוגמאות לכותרות מודלים</h5>
                                </div>
                                <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h6>כותרת מודל תכנון</h6>
                                    <div class="modal-header modal-header-colored planning-page mb-3">
                                            <h4>כותרת מודל תכנון השקעה</h4>
                                        </div>
                                        <small class="text-muted">צבע ירוק לפי הגדרת ישות "trade_plan"</small>
                                    </div>
                                </div>
                            </div>
                        <div class="col-md-6">
                                <div class="card">
                                <div class="card-body">
                                        <h6>כותרת מודל מקושרים</h6>
                                    <div class="modal-header linkedItems_modal-header-colored modal-header-view mb-3">
                                            <h4>כותרת מודל פריטים מקושרים</h4>
                                        </div>
                                        <small class="text-muted">צבע כתום לפי הגדרת ישות "alert"</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Color Legend -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h6><i class="fas fa-palette"></i> צבעי סטטוסים וסוגי השקעה נוכחיים:</h6>
                        <div class="row g-3 mt-2">
                            <!-- Status Colors -->
                            ${statuses.map(status => {
                                const color = window.getStatusColor(status, 'medium') || '#6c757d';
                                const label = status === 'open' ? 'פתוח' : status === 'closed' ? 'סגור' : 'מבוטל';
                                return `
                                    <div class="col-md-2">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="badge" style="background-color: ${color}; color: white;">${label}</div>
                                            <code class="small">${color}</code>
                                        </div>
                                    </div>
                                `;
                            }).join('')}

                            <!-- Investment Type Colors -->
                            ${investmentTypes.map(type => {
                                const color = window.getInvestmentTypeColor(type, 'medium') || '#6c757d';
                                const label = type === 'swing' ? 'Swing' : type === 'investment' ? 'Invest' : 'Passive';
                                return `
                                    <div class="col-md-2">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="badge" style="background-color: ${color}; color: white;">${label}</div>
                                            <code class="small">${color}</code>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section3-content');
    if (sectionElement) {
        sectionElement.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(sectionContent, 'text/html');
        doc.body.childNodes.forEach(node => {
            sectionElement.appendChild(node.cloneNode(true));
        });
    }
}

/**
 * Inject content into Section 4 (API Functions)
 */
function injectSection4Content() {
    const sectionContent = `
        <div class="row">
            <div class="col-12">
                <div class="alert alert-info">
                    <h5><i class="fas fa-code"></i> פונקציות API למערכת הצבעים הדינמית</h5>
                    <p class="mb-0">פונקציות JavaScript זמינות לשימוש בכל עמודי המערכת להצגת צבעים דינמיים.</p>
                </div>
            </div>
        </div>

        <!-- API Function Groups -->
        <div class="row g-4">
            <!-- Numeric Value Functions -->
            <div class="col-lg-4">
                <div class="card h-100">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="fas fa-hashtag"></i> ערכים מספריים</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>פונקציות עיקריות:</h6>
                            <div class="d-flex flex-column gap-2">
                                <code class="bg-light p-2 rounded small">getNumericValueColor(value, intensity)</code>
                                <code class="bg-light p-2 rounded small">getNumericValueBackgroundColor(value)</code>
                                <code class="bg-light p-2 rounded small">getNumericValueTextColor(value)</code>
                                <code class="bg-light p-2 rounded small">getNumericValueBorderColor(value)</code>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>דוגמה שימוש:</h6>
                            <pre class="bg-light p-3 rounded small">// קבלת צבע חיובי
const positiveColor = getNumericValueColor(15.5, 'medium');

// הצגת ערך עם צבע דינמי
element.style.color = getNumericValueTextColor(profit);</pre>
                        </div>
                        <div class="alert alert-success small">
                            <strong>Intensity:</strong> 'light', 'medium', 'dark', 'border'
                        </div>
                        </div>
                    </div>
                </div>

            <!-- Entity Functions -->
            <div class="col-lg-4">
                        <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-tags"></i> ישויות מערכת</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>פונקציות עיקריות:</h6>
                            <div class="d-flex flex-column gap-2">
                                <code class="bg-light p-2 rounded small">getEntityColor(entityType)</code>
                                <code class="bg-light p-2 rounded small">getEntityBackgroundColor(entityType)</code>
                                <code class="bg-light p-2 rounded small">getEntityTextColor(entityType)</code>
                                <code class="bg-light p-2 rounded small">getEntityBorderColor(entityType)</code>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>דוגמה שימוש:</h6>
                            <pre class="bg-light p-3 rounded small">// צביעת אלמנט לפי ישות
element.style.backgroundColor = getEntityBackgroundColor('trade');

// יצירת כיתוב עם צבע ישות
statusBadge.style.color = getEntityTextColor('alert');</pre>
                        </div>
                        <div class="alert alert-primary small">
                            <strong>ישויות:</strong> trade, account, ticker, alert, cash_flow, note, trade_plan, execution
                        </div>
                                </div>
                                </div>
                                </div>

            <!-- Status & Investment Functions -->
            <div class="col-lg-4">
                <div class="card h-100">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="mb-0"><i class="fas fa-chart-bar"></i> סטטוסים והשקעות</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6>פונקציות סטטוס:</h6>
                            <div class="d-flex flex-column gap-2">
                                <code class="bg-light p-2 rounded small">getStatusColor(status, intensity)</code>
                                <code class="bg-light p-2 rounded small">getStatusBackgroundColor(status)</code>
                            </div>
                        </div>
                        <div class="mb-3">
                            <h6>פונקציות סוגי השקעה:</h6>
                            <div class="d-flex flex-column gap-2">
                                <code class="bg-light p-2 rounded small">getInvestmentTypeColor(type, intensity)</code>
                                <code class="bg-light p-2 rounded small">getInvestmentTypeBackgroundColor(type)</code>
                            </div>
                        </div>
                        <div class="alert alert-warning small">
                            <strong>סטטוסים:</strong> open, closed, cancelled<br>
                            <strong>סוגי השקעה:</strong> swing, investment, passive
                        </div>
                    </div>
                            </div>
                        </div>
                    </div>

        <!-- Utility Functions -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                            <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-tools"></i> פונקציות עזר וניהול</h5>
                            </div>
                            <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <h6>ניהול צבעים:</h6>
                                <div class="d-flex flex-column gap-2">
                                    <code class="bg-light p-2 rounded small">updateEntityColor(entityType, hexColor)</code>
                                    <code class="bg-light p-2 rounded small">resetEntityColors()</code>
                                    <code class="bg-light p-2 rounded small">generateEntityCSS()</code>
                                    <code class="bg-light p-2 rounded small">generateNumericValueCSS()</code>
                                </div>
                                </div>
                            <div class="col-md-6">
                                <h6>יצירת רכיבי UI:</h6>
                                <div class="d-flex flex-column gap-2">
                                    <code class="bg-light p-2 rounded small">createEntityLegend()</code>
                                    <code class="bg-light p-2 rounded small">getTableColors()</code>
                                    <code class="bg-light p-2 rounded small">applyEntityColorsToHeaders(entityType)</code>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h6>דוגמה שימוש מתקדם:</h6>
                            <pre class="bg-light p-3 rounded small">// יצירת טבלה עם צבעים דינמיים
const colors = getTableColors();
tableElement.style.setProperty('--positive-color', colors.positive);
tableElement.style.setProperty('--negative-color', colors.negative);

// יישום צבעי ישות על כותרות מודלים
applyEntityColorsToHeaders('trade_plan');</pre>
                        </div>
                    </div>
                            </div>
                        </div>
                    </div>

        <!-- Quick Reference -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6><i class="fas fa-lightbulb"></i> הפניה מהירה לשימוש:</h6>
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <strong>לערכים מספריים:</strong>
                                <pre class="bg-white p-2 rounded small border">// רווח/הפסד
element.classList.add(value > 0 ? 'numeric-text-positive' : 'numeric-text-negative');</pre>
                            </div>
                            <div class="col-md-6">
                                <strong>לישויות:</strong>
                                <pre class="bg-white p-2 rounded small border">// לפי סוג ישות
element.classList.add('entity-' + entityType);</pre>
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">
                            כל הצבעים מתעדכנים אוטומטית כאשר משנים הגדרות בעמוד ההעדפות
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section4-content');
    if (sectionElement) {
        sectionElement.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(sectionContent, 'text/html');
        doc.body.childNodes.forEach(node => {
            sectionElement.appendChild(node.cloneNode(true));
        });
    }
}

/**
 * Initialize section toggle functionality
 */
function initializeSectionToggles() {
    // Section toggles are handled by the global section toggle system
    // No additional initialization needed
}

/**
 * Toggle top section visibility
 */

/**
 * Toggle all sections visibility
 */

/**
 * Toggle specific section visibility
 */

/**
 * Generate detailed log for Dynamic Colors Display
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - מערכת הצבעים הדינמית ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // סטטוס כללי
    log.push('--- סטטוס כללי ---');
    const topSection = document.querySelector('.top-section .section-body');
    const isTopOpen = topSection && topSection.style.display !== 'none';
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    
    // תצוגה מפורטת לפי סקשנים
    log.push('--- תצוגה מפורטת לפי סקשנים ---');
    
    // סקשן 1 - ערכים מספריים
    const section1 = document.getElementById('section1-content');
    if (section1) {
        const isSection1Open = section1.style.display !== 'none';
        log.push(`סקשן ערכים מספריים: ${isSection1Open ? 'פתוח' : 'סגור'}`);
        
        const numericItems = section1.querySelectorAll('.color-item');
        numericItems.forEach((item, index) => {
            const label = item.querySelector('.color-label')?.textContent || 'לא זמין';
            const value = item.querySelector('.color-value')?.textContent || 'לא זמין';
            log.push(`  פריט ${index + 1}: ${label} = "${value}"`);
        });
    }

    // סקשן 2 - ישויות מערכת
    const section2 = document.getElementById('section2-content');
    if (section2) {
        const isSection2Open = section2.style.display !== 'none';
        log.push(`סקשן ישויות מערכת: ${isSection2Open ? 'פתוח' : 'סגור'}`);
        
        const entityItems = section2.querySelectorAll('.color-item');
        entityItems.forEach((item, index) => {
            const label = item.querySelector('.color-label')?.textContent || 'לא זמין';
            const value = item.querySelector('.color-value')?.textContent || 'לא זמין';
            log.push(`  פריט ${index + 1}: ${label} = "${value}"`);
        });
    }

    // סקשן 3 - סטטוסים ומודלים
    const section3 = document.getElementById('section3-content');
    if (section3) {
        const isSection3Open = section3.style.display !== 'none';
        log.push(`סקשן סטטוסים ומודלים: ${isSection3Open ? 'פתוח' : 'סגור'}`);
        
        const statusItems = section3.querySelectorAll('.color-item');
        statusItems.forEach((item, index) => {
            const label = item.querySelector('.color-label')?.textContent || 'לא זמין';
            const value = item.querySelector('.color-value')?.textContent || 'לא זמין';
            log.push(`  פריט ${index + 1}: ${label} = "${value}"`);
        });
    }

    // סטטיסטיקות וביצועים
    log.push('--- סטטיסטיקות וביצועים ---');
    log.push(`זמן טעינת עמוד: ${Date.now() - performance.timing.navigationStart}ms`);
    if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        log.push(`זיכרון בשימוש: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // לוגים ושגיאות
    log.push('--- לוגים ושגיאות ---');
    if (window.consoleLogs && window.consoleLogs.length > 0) {
        const recentLogs = window.consoleLogs.slice(-10);
        recentLogs.forEach(entry => {
            log.push(`[${entry.timestamp}] ${entry.level}: ${entry.message}`);
        });
    } else {
        log.push('אין לוגים זמינים');
    }

    // מידע טכני
    log.push('--- מידע טכני ---');
    log.push(`User Agent: ${navigator.userAgent}`);
    log.push(`Language: ${navigator.language}`);
    log.push(`Platform: ${navigator.platform}`);

    log.push('=== סוף הלוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */

// ===== GLOBAL FUNCTION EXPORTS =====

// window.toggleAllSections export removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js
// window. export removed - using global version from system-management.js

// Local copyDetailedLog function for dynamic-colors-display page
async function copyDetailedLogLocal() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                window.showErrorNotification('לוג מפורט הועתק ללוח!', "שגיאה");
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                window.showErrorNotification('אין לוג להעתקה', "שגיאה");
            }
        }
    } catch (err) {
        window.Logger?.error('שגיאה בהעתקה:', err);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            window.showErrorNotification('שגיאה בהעתקת הלוג', "שגיאה");
        }
    }
}
