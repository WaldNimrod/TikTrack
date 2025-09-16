/**
 * Numeric Value Colors Demo Page Script
 * Handles content injection into locked template sections
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Numeric Value Colors Demo Page Loaded ===');

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

    // Initialize section toggle functionality
    initializeSectionToggles();
});

/**
 * Inject content into Section 1 (Numeric Values)
 */
function injectSection1Content() {
    const sectionContent = `
        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4" id="colorSchemeTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="numeric-tab" data-bs-toggle="tab" data-bs-target="#numeric-content" type="button" role="tab">
                    <i class="fas fa-hashtag"></i> ערכים מספריים
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="colorSchemeTabContent">
            <!-- Numeric Values Tab -->
            <div class="tab-pane fade show active" id="numeric-content" role="tabpanel">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h2 class="mb-0"><i class="fas fa-hashtag"></i> מערכת צבעים לערכים מספריים</h2>
                    </div>
                    <div class="card-body">
                        <!-- Display Controls -->
                        <div class="alert alert-info">
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showAllNumeric()">הצג הכול</button>
                                <button class="btn btn-outline-secondary btn-sm" onclick="hideAllNumeric()">הסתר הכול</button>
                            </div>
                            <div class="d-flex flex-wrap gap-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showText" checked onchange="toggleNumericDisplay()">
                                    <label class="form-check-label" for="showText">צביעת טקסט</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showBackground" checked onchange="toggleNumericDisplay()">
                                    <label class="form-check-label" for="showBackground">צביעת רקע</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showBorder" checked onchange="toggleNumericDisplay()">
                                    <label class="form-check-label" for="showBorder">צביעת מסגרת</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showCards" checked onchange="toggleNumericDisplay()">
                                    <label class="form-check-label" for="showCards">כרטיסיות</label>
                                </div>
                            </div>
                        </div>

                        <!-- Demo Grid -->
                        <div class="row g-3">
                            <!-- Text Coloring -->
                            <div class="col-md-6 col-lg-3 demo-item" data-type="text">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">צביעת טקסט</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="numeric-text-positive">+15.50%</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="numeric-text-negative">-8.25%</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="numeric-text-zero">0.00%</span>
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;span class="numeric-text-positive"&gt;+15.50%&lt;/span&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <!-- Background Coloring -->
                            <div class="col-md-6 col-lg-3 demo-item" data-type="background">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">צביעת רקע</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="numeric-bg-positive">+15.50%</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="numeric-bg-negative">-8.25%</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="numeric-bg-zero">0.00%</span>
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;span class="numeric-bg-positive"&gt;+15.50%&lt;/span&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <!-- Border Coloring -->
                            <div class="col-md-6 col-lg-3 demo-item" data-type="border">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">צביעת מסגרת</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="numeric-border-positive">+15.50%</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="numeric-border-negative">-8.25%</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="numeric-border-zero">0.00%</span>
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;span class="numeric-border-positive"&gt;+15.50%&lt;/span&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <!-- Full Cards -->
                            <div class="col-md-6 col-lg-3 demo-item" data-type="cards">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">כרטיסיות מלאות</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="numeric-card-positive mb-2">
                                            <strong>רווח:</strong> +15.50%
                                        </div>
                                        <div class="numeric-card-negative mb-2">
                                            <strong>הפסד:</strong> -8.25%
                                        </div>
                                        <div class="numeric-card-zero mb-2">
                                            <strong>איזון:</strong> 0.00%
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;div class="numeric-card-positive"&gt;רווח: +15.50%&lt;/div&gt;
                                        </code>
                                    </div>
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
        sectionElement.innerHTML = sectionContent;
    }
}

/**
 * Inject content into Section 2 (Entity Types)
 */
function injectSection2Content() {
    const sectionContent = `
        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4" id="entityTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="entity-tab" data-bs-toggle="tab" data-bs-target="#entity-content" type="button" role="tab">
                    <i class="fas fa-tags"></i> ישויות מערכת
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="entityTabContent">
            <!-- Entity Types Tab -->
            <div class="tab-pane fade show active" id="entity-content" role="tabpanel">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h2 class="mb-0"><i class="fas fa-tags"></i> מערכת צבעים לפי ישויות</h2>
                    </div>
                    <div class="card-body">
                        <!-- Display Controls -->
                        <div class="alert alert-info">
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <button class="btn btn-outline-primary btn-sm" onclick="showAllEntities()">הצג הכול</button>
                                <button class="btn btn-outline-secondary btn-sm" onclick="hideAllEntities()">הסתר הכול</button>
                            </div>
                            <div class="d-flex flex-wrap gap-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showTradeEntities" checked onchange="toggleEntityDisplay()">
                                    <label class="form-check-label" for="showTradeEntities">טריידים ותכנונים</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showAccountEntities" checked onchange="toggleEntityDisplay()">
                                    <label class="form-check-label" for="showAccountEntities">חשבונות ותזרים מזומנים</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showOtherEntities" checked onchange="toggleEntityDisplay()">
                                    <label class="form-check-label" for="showOtherEntities">טיקרים והתראות</label>
                                </div>
                            </div>
                        </div>

                        <!-- Demo Grid -->
                        <div class="row g-3">
                            <!-- Trade Entities -->
                            <div class="col-md-6 col-lg-4 demo-item" data-category="trade">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">טריידים ותכנונים</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="entity-trade">טרייד רגיל</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="entity-trade_plan">תכנון השקעה</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="entity-execution">ביצוע עסקה</span>
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;span class="entity-trade"&gt;טרייד רגיל&lt;/span&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <!-- Account Entities -->
                            <div class="col-md-6 col-lg-4 demo-item" data-category="account">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">חשבונות ותזרים מזומנים</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="entity-account">חשבון בנק</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="entity-cash_flow">תזרים מזומנים</span>
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;span class="entity-account"&gt;חשבון בנק&lt;/span&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <!-- Other Entities -->
                            <div class="col-md-6 col-lg-4 demo-item" data-category="other">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h5 class="card-title">טיקרים והתראות</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="entity-ticker">טיקר מניה</span>
                                        </div>
                                        <div class="mb-2">
                                            <span class="entity-alert">התראה</span>
                                        </div>
                                        <code class="small d-block mt-2">
                                            &lt;span class="entity-ticker"&gt;טיקר מניה&lt;/span&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section2-content');
    if (sectionElement) {
        sectionElement.innerHTML = sectionContent;
    }
}

/**
 * Inject content into Section 3 (Statuses and Modals)
 */
function injectSection3Content() {
    const sectionContent = `
        <!-- Status Tab -->
        <div class="card">
            <div class="card-header bg-info text-white">
                <h2 class="mb-0"><i class="fas fa-chart-bar"></i> מערכת צבעים לסטטוסים</h2>
            </div>
            <div class="card-body">
                <!-- Display Controls -->
                <div class="alert alert-info">
                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="showAllStatuses()">הצג הכול</button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="hideAllStatuses()">הסתר הכול</button>
                    </div>
                </div>

                <!-- Demo Grid -->
                <div class="row g-3">
                    <!-- Investment Types -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title">סוגי השקעה</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="investment-type-swing">Swing Trading</span>
                                </div>
                                <div class="mb-2">
                                    <span class="investment-type-investment">Investment</span>
                                </div>
                                <div class="mb-2">
                                    <span class="investment-type-passive">Passive</span>
                                </div>
                                <code class="small d-block mt-2">
                                    &lt;span class="investment-type-swing"&gt;Swing Trading&lt;/span&gt;
                                </code>
                            </div>
                        </div>
                    </div>

                    <!-- Trade Statuses -->
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title">סטטוסי טרייד</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <span class="status-open">פתוח</span>
                                </div>
                                <div class="mb-2">
                                    <span class="status-closed">סגור</span>
                                </div>
                                <div class="mb-2">
                                    <span class="status-canceled">מבוטל</span>
                                </div>
                                <code class="small d-block mt-2">
                                    &lt;span class="status-open"&gt;פתוח&lt;/span&gt;
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Headers Section -->
                <div class="mt-4">
                    <h3 class="mb-3"><i class="fas fa-window-maximize"></i> צבעי כותרות מודלים</h3>
                    <div class="row g-3">
                        <!-- Planning Page Modal -->
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header">
                                    <h5 class="card-title">עמוד תכנון - כותרת ירוקה</h5>
                                </div>
                                <div class="card-body">
                                    <div class="modal-header modal-header-colored planning-page mb-3">
                                        <h3>כותרת מודל תכנון</h3>
                                    </div>
                                    <code class="small d-block">
                                        &lt;div class="modal-header modal-header-colored planning-page"&gt;<br>
                                        &nbsp;&nbsp;&lt;h3&gt;כותרת מודל תכנון&lt;/h3&gt;<br>
                                        &lt;/div&gt;
                                    </code>
                                </div>
                            </div>
                        </div>

                        <!-- Linked Items Modal -->
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-header">
                                    <h5 class="card-title">מודול מקושרים - כותרת כתומה</h5>
                                </div>
                                <div class="card-body">
                                    <div class="modal-header linkedItems_modal-header-colored modal-header-view mb-3">
                                        <h3>כותרת מודל מקושרים</h3>
                                    </div>
                                    <code class="small d-block">
                                        &lt;div class="modal-header linkedItems_modal-header-colored modal-header-view"&gt;<br>
                                        &nbsp;&nbsp;&lt;h3&gt;כותרת מודל מקושרים&lt;/h3&gt;<br>
                                        &lt;/div&gt;
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section3-content');
    if (sectionElement) {
        sectionElement.innerHTML = sectionContent;
    }
}

/**
 * Inject content into Section 4 (API Functions)
 */
function injectSection4Content() {
    const sectionContent = `
        <!-- API Functions Tab -->
        <div class="card">
            <div class="card-header bg-secondary text-white">
                <h2 class="mb-0"><i class="fas fa-cogs"></i> API ופונקציות מערכת הצבעים</h2>
            </div>
            <div class="card-body">
                <!-- Display Controls -->
                <div class="alert alert-info">
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <button class="btn btn-outline-primary btn-sm" onclick="showAllAPIs()">הצג הכול</button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="hideAllAPIs()">הסתר הכול</button>
                    </div>
                    <div class="d-flex flex-wrap gap-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="showNumericAPI" checked onchange="toggleAPIDisplay()">
                            <label class="form-check-label" for="showNumericAPI">פונקציות ערכים מספריים</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="showEntityAPI" checked onchange="toggleAPIDisplay()">
                            <label class="form-check-label" for="showEntityAPI">פונקציות ישויות</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="showUtilityAPI" checked onchange="toggleAPIDisplay()">
                            <label class="form-check-label" for="showUtilityAPI">פונקציות עזר</label>
                        </div>
                    </div>
                </div>

                <!-- Demo Grid -->
                <div class="row g-3">
                    <!-- Numeric Value Functions -->
                    <div class="col-lg-4 demo-item" data-api-type="numeric">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title">פונקציות ערכים מספריים</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <code>getNumericValueColor(15.5)</code>
                                </div>
                                <div class="mb-2">
                                    <code>getNumericValueCSSClass(-8.25)</code>
                                </div>
                                <div class="mb-2">
                                    <code>isPositiveValue(0)</code>
                                </div>
                                <pre class="small mt-2">
// קבלת צבע לפי ערך
const color = getNumericValueColor(15.5, 'medium');

// קבלת CSS class
const cssClass = getNumericValueCSSClass(-8.25);
                                </pre>
                            </div>
                        </div>
                    </div>

                    <!-- Entity Functions -->
                    <div class="col-lg-4 demo-item" data-api-type="entity">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title">פונקציות ישויות</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <code>getEntityColor('trade')</code>
                                </div>
                                <div class="mb-2">
                                    <code>getEntityBackgroundColor('trade_plan')</code>
                                </div>
                                <div class="mb-2">
                                    <code>isValidEntityType('trade')</code>
                                </div>
                                <pre class="small mt-2">
// קבלת צבע ישות
const color = getEntityColor('trade');

// קבלת צבע רקע
const bgColor = getEntityBackgroundColor('trade_plan');
                                </pre>
                            </div>
                        </div>
                    </div>

                    <!-- Utility Functions -->
                    <div class="col-lg-4 demo-item" data-api-type="utility">
                        <div class="card h-100">
                            <div class="card-header">
                                <h5 class="card-title">פונקציות עזר</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-2">
                                    <code>generateNumericValueCSS()</code>
                                </div>
                                <div class="mb-2">
                                    <code>updateEntityColor('trade', '#ff0000')</code>
                                </div>
                                <div class="mb-2">
                                    <code>createEntityLegend()</code>
                                </div>
                                <pre class="small mt-2">
// יצירת CSS דינמי
generateNumericValueCSS();

// עדכון צבע ישות
updateEntityColor('trade', '#ff0000');
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sectionElement = document.getElementById('section4-content');
    if (sectionElement) {
        sectionElement.innerHTML = sectionContent;
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
function toggleTopSection() {
    const topSection = document.querySelector('.top-section');
    const toggleIcon = document.querySelector('.top-section .section-toggle-icon');

    if (topSection && toggleIcon) {
        const isExpanded = topSection.classList.contains('expanded') || topSection.querySelector('.section-body').style.display !== 'none';

        if (isExpanded) {
            // Collapse
            topSection.querySelector('.section-body').style.display = 'none';
            topSection.classList.remove('expanded');
            toggleIcon.textContent = '▶';
        } else {
            // Expand
            topSection.querySelector('.section-body').style.display = 'block';
            topSection.classList.add('expanded');
            toggleIcon.textContent = '▼';
        }
    }
}

/**
 * Toggle specific section visibility
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleIcon = section ? section.querySelector('.section-toggle-icon') : null;

    if (section && toggleIcon) {
        const sectionBody = section.querySelector('.section-body');
        const isExpanded = section.classList.contains('expanded') || (sectionBody && sectionBody.style.display !== 'none');

        if (isExpanded) {
            // Collapse
            if (sectionBody) sectionBody.style.display = 'none';
            section.classList.remove('expanded');
            toggleIcon.textContent = '▶';
        } else {
            // Expand
            if (sectionBody) sectionBody.style.display = 'block';
            section.classList.add('expanded');
            toggleIcon.textContent = '▼';
        }
    }
}

/**
 * Toggle all sections visibility
 */
function toggleAllSections() {
    const allSectionsBtn = document.querySelector('.all-sections-btn');
    const allSectionsIcon = document.querySelector('.all-sections-icon');

    if (!allSectionsBtn || !allSectionsIcon) return;

    // Check if any section is currently expanded
    const sections = ['.top-section', '#section1', '#section2', '#section3', '#section4'];
    let anyExpanded = false;

    sections.forEach(selector => {
        const section = selector.startsWith('.') ? document.querySelector(selector) : document.getElementById(selector);
        if (section) {
            const sectionBody = section.querySelector('.section-body');
            const isExpanded = section.classList.contains('expanded') ||
                             (sectionBody && sectionBody.style.display !== 'none' && sectionBody.style.display !== '');
            if (isExpanded) anyExpanded = true;
        }
    });

    if (anyExpanded) {
        // Collapse all sections
        sections.forEach(selector => {
            const section = selector.startsWith('.') ? document.querySelector(selector) : document.getElementById(selector);
            if (section) {
                const sectionBody = section.querySelector('.section-body');
                const toggleIcon = section.querySelector('.section-toggle-icon');

                if (sectionBody) sectionBody.style.display = 'none';
                section.classList.remove('expanded');
                if (toggleIcon) toggleIcon.textContent = '▶';
            }
        });

        allSectionsIcon.textContent = '▶';
        allSectionsBtn.title = 'הצג את כל הסקשנים';
    } else {
        // Expand all sections
        sections.forEach(selector => {
            const section = selector.startsWith('.') ? document.querySelector(selector) : document.getElementById(selector);
            if (section) {
                const sectionBody = section.querySelector('.section-body');
                const toggleIcon = section.querySelector('.section-toggle-icon');

                if (sectionBody) sectionBody.style.display = 'block';
                section.classList.add('expanded');
                if (toggleIcon) toggleIcon.textContent = '▼';
            }
        });

        allSectionsIcon.textContent = '▼';
        allSectionsBtn.title = 'הסתר את כל הסקשנים';
    }
}

// ===== DISPLAY CONTROL FUNCTIONS =====

/**
 * Numeric Values Display Controls
 */
function toggleNumericDisplay() {
    const types = ['text', 'background', 'border', 'cards'];
    types.forEach(type => {
        const items = document.querySelectorAll(`[data-type="${type}"]`);
        const checkbox = document.getElementById(`show${type.charAt(0).toUpperCase() + type.slice(1)}`);

        items.forEach(item => {
            if (checkbox && checkbox.checked) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function showAllNumeric() {
    document.querySelectorAll('[data-type]').forEach(item => {
        item.style.display = '';
    });
    document.querySelectorAll('#numeric-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
}

function hideAllNumeric() {
    document.querySelectorAll('[data-type]').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('#numeric-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Entity Display Controls
 */
function toggleEntityDisplay() {
    const categories = ['trade', 'account', 'other'];
    categories.forEach(category => {
        const items = document.querySelectorAll(`[data-category="${category}"]`);
        let checkbox;

        switch(category) {
            case 'trade':
                checkbox = document.getElementById('showTradeEntities');
                break;
            case 'account':
                checkbox = document.getElementById('showAccountEntities');
                break;
            case 'other':
                checkbox = document.getElementById('showOtherEntities');
                break;
        }

        if (checkbox && checkbox.checked) {
            items.forEach(item => item.style.display = '');
        } else {
            items.forEach(item => item.style.display = 'none');
        }
    });
}

function showAllEntities() {
    document.querySelectorAll('[data-category]').forEach(item => {
        item.style.display = '';
    });
    document.querySelectorAll('#entity-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
}

function hideAllEntities() {
    document.querySelectorAll('[data-category]').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('#entity-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Status Display Controls
 */
function showAllStatuses() {
    document.querySelectorAll('#status-content .demo-item, #status-content .col-md-6').forEach(item => {
        item.style.display = '';
    });
}

function hideAllStatuses() {
    document.querySelectorAll('#status-content .demo-item, #status-content .col-md-6').forEach(item => {
        item.style.display = 'none';
    });
}

/**
 * API Display Controls
 */
function toggleAPIDisplay() {
    const types = ['numeric', 'entity', 'utility'];
    types.forEach(type => {
        const items = document.querySelectorAll(`[data-api-type="${type}"]`);
        let checkbox;

        switch(type) {
            case 'numeric':
                checkbox = document.getElementById('showNumericAPI');
                break;
            case 'entity':
                checkbox = document.getElementById('showEntityAPI');
                break;
            case 'utility':
                checkbox = document.getElementById('showUtilityAPI');
                break;
        }

        if (checkbox && checkbox.checked) {
            items.forEach(item => item.style.display = '');
        } else {
            items.forEach(item => item.style.display = 'none');
        }
    });
}

function showAllAPIs() {
    document.querySelectorAll('[data-api-type]').forEach(item => {
        item.style.display = '';
    });
    document.querySelectorAll('#api-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
}

function hideAllAPIs() {
    document.querySelectorAll('[data-api-type]').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('#api-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}
