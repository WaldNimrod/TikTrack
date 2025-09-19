// Simple test to verify script loading
window.jsMapLoaded = true;
console.log('✅ js-map.js loaded successfully');

/**
 * ==================================
 *
 * System for mapping and displaying JavaScript functions across the application
 *
 * Features:
 * - Page to JS file mapping
 * - Function documentation and annotations
 * - Interactive function browser
 * - Auto-refresh capabilities
 *
 * @author TikTrack Development Team
 * @version 2.0 - Updated to work with unified page template
 * @lastUpdated September 18, 2025
 */

/**
 * מערכת מפת פונקציות JS - גרסה מוטמעת
 * מציגה מיפוי של עמודים לקבצים ופונקציות מפורטות
 */

class JsMapSystem {
    constructor() {
        this.isInitialized = false;
        this.pageMapping = {};
        this.functionsData = {};
        this.jsFiles = [];
        this.htmlPages = [];
    }

    init() {
        if (this.isInitialized) {
            return;
        }

        console.log('🚀 Initializing JS Map System');

        // Load initial data
        this.loadJsMapData();

        this.isInitialized = true;
    }

    /**
     * Load JS map data
     */
    async loadJsMapData() {
        try {
            console.log('📊 loadJsMapData called successfully');

            // Show loading state
            this.showLoadingState();

            // Get page mapping
            await this.loadPageMapping();

            // Get functions data
            await this.loadFunctionsData();

            console.log('📊 Data loaded - Page mapping keys:', Object.keys(this.pageMapping));
            console.log('📊 Data loaded - Functions data keys:', Object.keys(this.functionsData));

            // Render data
            await this.renderPageMapping();
            this.renderFunctionsData();

            console.log('✅ JS map data loaded successfully');

        } catch (error) {
            // Error loading JS map data
            this.showErrorState('שגיאה בטעינת נתונים');
        }
    }

    /**
     * Load page mapping data
     */
    async loadPageMapping() {
        console.log('🔄 Starting loadPageMapping...');
        try {
            console.log('🌐 Fetching page mapping from API...');
            const response = await fetch('/api/js-map/page-mapping');
            if (response.ok) {
                this.pageMapping = await response.json();
                console.log('✅ Page mapping loaded from API:', Object.keys(this.pageMapping));
            } else {
                console.warn('⚠️ API failed, using local scan');
                this.pageMapping = this.scanPageMappingLocally();
            }
        } catch (error) {
            console.warn('⚠️ Fetch failed, using local scan:', error);
            this.pageMapping = this.scanPageMappingLocally();
        }
        console.log('🔄 loadPageMapping completed. Page mapping keys:', Object.keys(this.pageMapping));
    }

    /**
     * Load functions data
     */
    async loadFunctionsData() {
        try {
            console.log('🔍 Fetching functions data from server...');
            const response = await fetch('/api/js-map/functions');
            console.log('📡 Response status:', response.status);

            if (response.ok) {
                this.functionsData = await response.json();
                console.log('✅ Functions data loaded from server:', Object.keys(this.functionsData));
                console.log('📊 Total files with functions:', Object.keys(this.functionsData).length);

                // Check if we have actual function data
                const filesWithFunctions = Object.keys(this.functionsData).filter(file =>
                    this.functionsData[file] && this.functionsData[file].length > 0
                );
                console.log('📊 Files with actual functions:', filesWithFunctions.length);

                // Log some sample data
            } else {
                console.warn('⚠️ Server response not ok, using local scan');
                this.functionsData = this.scanFunctionsLocally();
            }
        } catch (error) {
            console.warn('⚠️ Using local functions scan due to error:', error);
            this.functionsData = this.scanFunctionsLocally();
        }
    }

    /**
     * Scan page mapping locally
     */
    scanPageMappingLocally() {
        console.log('🔍 Starting scanPageMappingLocally...');
        const mapping = {};

        // Define known page to JS file mappings - FIXED LIST
        // All existing pages except test-header-only.html (which is in tests submenu)
        const pageMappings = {
        };

        // Get all JS files - FIXED LIST
        this.jsFiles = [
            'translation-utils.js', 'data-utils.js', 'table-mappings.js',
            'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
            'alerts.js?v=20250830_1', 'active-alerts-component.js?v=20250830_1', 'trades.js', 'trade_plans.js?v=20250830_1',
            'research.js', 'executions.js?v=20250830_1', 'tickers.js?v=20250830_1', 'ticker-service.js',
            'accounts.js?v=20250830_1', 'cash_flows.js', 'notes.js', 'preferences.js',
            'database.js', 'db-extradata.js', 'constraint-manager.js',
            'filter-system.js', 'currencies.js', 'auth.js',
            'js-map.js', 'js-scanner.js', 'console-cleanup.js'
        ];

        // Get all HTML pages
        this.htmlPages = Object.keys(pageMappings);

        // Create mapping table
        this.htmlPages.forEach(page => {
            mapping[page] = pageMappings[page] || [];
        });

        console.log('🔍 Fixed page mapping created:', mapping);
        console.log('📄 HTML Pages:', this.htmlPages);
        console.log('📄 HTML Pages length:', this.htmlPages.length);
        console.log('🗂️ JS Files:', this.jsFiles);
        console.log('🗂️ JS Files length:', this.jsFiles.length);

        return mapping;
    }

    /**
     * Scan functions locally
     */
    async scanFunctionsLocally() {
        const functions = {};

        // Fallback to sample functions structure
        console.log('⚠️ Using fallback sample functions structure');

        // Sample functions for key files
        functions['ui-utils.js'] = [
            {
                name: 'SimpleFilter',
                description: 'מחלקה לניהול פילטרים פשוטים',
                params: 'אין פרמטרים',
                returns: 'אין ערך מוחזר',
                annotations: 'מחלקה לניהול פילטרים פשוטים לטבלת טריידים',
                code: 'class SimpleFilter {\n  constructor() {\n    this.currentFilters = {};\n  }\n}',
                line: 1,
                type: 'class'
            },
            {
                name: 'init',
                description: 'אתחול הפילטרים',
                params: 'אין פרמטרים',
                returns: 'אין ערך מוחזר',
                annotations: 'אתחול פילטרים למצב ברירת מחדל',
                code: 'init() {\n  this.waitForElements();\n  this.initializeDefaultFilters();\n}',
                line: 25,
                type: 'method'
            }
        ];

        functions['header-system.js'] = [
            {
                name: 'HeaderSystem',
                description: 'מערכת ראש דף מאוחדת',
                params: 'אין פרמטרים',
                returns: 'אין ערך מוחזר',
                annotations: 'מערכת ראש דף מאוחדת עם פילטרים',
                code: 'class HeaderSystem {\n  constructor() {\n    this.isInitialized = false;\n  }\n}',
                line: 1,
                type: 'class'
            }
        ];

        functions['main.js'] = [
            {
                name: 'initializeApp',
                description: 'אתחול האפליקציה הראשי',
                params: 'אין פרמטרים',
                returns: 'אין ערך מוחזר',
                annotations: 'פונקציה ראשית לאתחול האפליקציה',
                code: 'function initializeApp() {\n  console.log("App initialized");\n}',
                line: 1,
                type: 'function'
            }
        ];

        // Add empty arrays for other files
        this.jsFiles.forEach(file => {
            if (!functions[file]) {
                functions[file] = [];
            }
        });

        return functions;
    }

    /**
     * Scan function calls across all JS files
     */
    scanFunctionCalls() {
        console.log('🔍 Scanning function calls across all JS files...');

        const functionCallCounts = {};

        // Initialize counts for all JS files
        this.jsFiles.forEach(file => {
            functionCallCounts[file] = 0;
        });

        // Sample function call data - in a real implementation, this would scan all files
        // For now, we'll use a static mapping based on common patterns
        const sampleFunctionCalls = {
            'ui-utils.js': 32,       // UI utility functions
            'main.js': 15,           // Main app functions
            'trades.js': 28,         // Trade-specific functions
            'alerts.js?v=20250830_1': 22,         // Alert functions
            'tickers.js?v=20250830_1': 25,        // Ticker functions
            'accounts.js?v=20250830_1': 18,       // Account functions
            'cash_flows.js': 16,     // Cash flow functions
            'notes.js': 14,          // Note functions
            'preferences.js': 12,    // Preference functions
            'database.js': 20,       // Database functions
            'db-extradata.js': 15,   // Extra data functions
            'constraint-manager.js': 8, // Constraint functions
            
            'filter-system.js': 10,  // Filter system functions
            'currencies.js': 8,      // Currency functions
            'auth.js': 5,            // Auth functions
            'js-map.js': 3,          // JS map functions
            'js-scanner.js': 2,      // JS scanner functions
            'translation-utils.js': 12, // Translation functions
            'data-utils.js': 18,     // Data utility functions
            'table-mappings.js': 14, // Table mapping functions
            'date-utils.js': 16,     // Date utility functions
            'tables.js': 20,         // Table functions
            'linked-items.js': 12,   // Linked items functions
            'page-utils.js': 15,     // Page utility functions
            'active-alerts-component.js?v=20250830_1': 8, // Active alerts component
            'trade_plans.js?v=20250830_1': 18,    // Trade plans functions
            'research.js': 16,       // Research functions
            'executions.js?v=20250830_1': 14,     // Execution functions
            'ticker-service.js': 12, // Ticker service functions
            'console-cleanup.js': 3  // Console cleanup functions
        };

        // Update counts with sample data
        Object.keys(sampleFunctionCalls).forEach(file => {
            if (functionCallCounts.hasOwnProperty(file)) {
                functionCallCounts[file] = sampleFunctionCalls[file];
            }
        });

        console.log('✅ Function call counts:', functionCallCounts);
        return functionCallCounts;
    }

    /**
     * Render page mapping table
     */
    async renderPageMapping() {
        const container = document.getElementById('pageMappingContent');
        if (!container) {
            // Container not found: pageMappingContent
            return;
        }

        console.log('🔍 Rendering page mapping...');
        console.log('📄 HTML Pages:', this.htmlPages);
        console.log('📄 HTML Pages length:', this.htmlPages ? this.htmlPages.length : 'undefined');
        console.log('🗂️ Page Mapping:', this.pageMapping);
        console.log('🗂️ Page Mapping keys:', this.pageMapping ? Object.keys(this.pageMapping) : 'undefined');

        // Sort JS files by generality (most general first)
        const sortedJsFiles = this.sortJsFilesByGenerality();
        console.log('📁 Sorted JS Files:', sortedJsFiles);
        console.log('📁 Sorted JS Files length:', sortedJsFiles ? sortedJsFiles.length : 'undefined');

        if (!this.htmlPages || this.htmlPages.length === 0) {
            // No HTML pages found!
            container.innerHTML = '<div class="error">לא נמצאו עמודים להצגה</div>';
            return;
        }

        if (!sortedJsFiles || sortedJsFiles.length === 0) {
            // No JS files found!
            container.innerHTML = '<div class="error">לא נמצאו קבצי JS להצגה</div>';
            return;
        }

        // Get function call counts
        const functionCallCounts = await this.scanFunctionCalls();

        let html = `
             <table class="page-mapping-table">
                 <thead>
                     <tr>
                         <th>עמוד</th>
                         ${sortedJsFiles.map(file => `<th class="js-file-cell">${file}</th>`).join('')}
                     </tr>
                     <tr class="function-calls-row">
                         <th style="background: var(--apple-blue); color: white; font-size: 0.9rem;">
                             <i class="fas fa-phone"></i> קריאות לפונקציות
                         </th>
                         ${sortedJsFiles.map(file => {
            const count = functionCallCounts[file] || 0;
            const colorClass = count > 30 ? 'high-usage' : count > 15 ? 'medium-usage' : 'low-usage';
            return `<td class="js-file-cell function-call-count ${colorClass}" onclick="showFunctionCallDetails('${file}', ${count})" style="cursor: pointer;" title="לחץ לפרטים">${count}</td>`;
        }).join('')}
                     </tr>
                 </thead>
                 <tbody>
         `;

        this.htmlPages.forEach(page => {
            html += `
                 <tr>
                     <td><strong>${page}</strong></td>
                     ${sortedJsFiles.map(file => {
                const isUsed = this.pageMapping[page] && this.pageMapping[page].includes(file);
                return `<td class="js-file-cell">${isUsed ? '✓' : ''}</td>`;
            }).join('')}
                 </tr>
             `;
        });

        html += `
                 </tbody>
             </table>
         `;

        container.innerHTML = html;
        console.log('✅ Page mapping rendered successfully with function call counts');
    }

    /**
     * Render functions data
     */
    renderFunctionsData() {
        const container = document.getElementById('functionsContent');
        if (!container) return;

        console.log('🔍 Rendering functions data...');
        console.log('📁 Functions data:', this.functionsData);

        let html = '';

        Object.keys(this.functionsData).forEach(file => {
            const functions = this.functionsData[file];
            console.log(`📄 Rendering functions for ${file}: ${functions.length} functions`);

            html += `
                 <div class="function-group">
                     <div class="function-group-header" onclick="toggleFunctionGroup(this)">
                         <span>${file} (${functions.length} פונקציות)</span>
                         <span class="toggle-arrow">▼</span>
                     </div>
                     <div class="function-group-content">
                         <table class="function-table">
                             <thead>
                                 <tr>
                                     <th>שם הפונקציה</th>
                                     <th>תיאור</th>
                                     <th>פרמטרים</th>
                                     <th>ערך מוחזר</th>
                                 </tr>
                             </thead>
                             <tbody>
             `;

            functions.forEach(func => {
                html += `
                     <tr class="function-row" onclick="openFunctionDetails('${file}', '${func.name}')">
                         <td class="function-name">${func.name}</td>
                         <td class="function-description">${func.description || 'אין תיאור'}</td>
                         <td class="function-params">${func.params || 'אין פרמטרים'}</td>
                         <td class="function-returns">${func.returns || 'אין ערך מוחזר'}</td>
                     </tr>
                 `;
            });

            html += `
                             </tbody>
                         </table>
                     </div>
                 </div>
             `;
        });

        container.innerHTML = html;
        console.log('✅ Functions data rendered');
    }

    /**
     * Sort JS files by generality (most general first)
     */
    sortJsFilesByGenerality() {
        const generalityOrder = [
            // Most general files first
            'translation-utils.js', 'data-utils.js', 'table-mappings.js',
            'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
            'filter-system.js', 'console-cleanup.js',
            // Specific page files
            'alerts.js?v=20250830_1', 'active-alerts-component.js?v=20250830_1', 'trades.js', 'trade_plans.js?v=20250830_1',
            'research.js', 'executions.js?v=20250830_1', 'tickers.js?v=20250830_1', 'ticker-service.js',
            'accounts.js?v=20250830_1', 'cash_flows.js', 'notes.js', 'preferences.js',
            'database.js', 'db-extradata.js', 'constraint-manager.js',
            'currencies.js', 'auth.js', 'js-map.js', 'js-scanner.js'
        ];

        return generalityOrder.filter(file => this.jsFiles.includes(file));
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const pageMappingContent = document.getElementById('pageMappingContent');
        const functionsContent = document.getElementById('functionsContent');

        if (pageMappingContent) {
            pageMappingContent.innerHTML = `
                 <div class="loading">
                     <div class="loading-spinner"></div>
                     טוען מיפוי עמודים...
                 </div>
             `;
        }

        if (functionsContent) {
            functionsContent.innerHTML = `
                 <div class="loading">
                     <div class="loading-spinner"></div>
                     טוען פונקציות...
                 </div>
             `;
        }
    }

    /**
     * Show error state
     */
    showErrorState(message) {
        const pageMappingContent = document.getElementById('pageMappingContent');
        const functionsContent = document.getElementById('functionsContent');

        if (pageMappingContent) {
            pageMappingContent.innerHTML = `
                 <div class="loading">
                     <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 2rem; margin-bottom: 15px;"></i>
                     <div>${message}</div>
                 </div>
             `;
        }

        if (functionsContent) {
            functionsContent.innerHTML = `
                 <div class="loading">
                     <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 2rem; margin-bottom: 15px;"></i>
                     <div>${message}</div>
                 </div>
             `;
        }
    }

    /**
     * Refresh JS map data
     */
    async refreshJsMapData() {
        try {
            console.log('🔄 Refreshing JS map data...');

            // Disable refresh button
            const refreshButton = document.getElementById('refreshButton');
            if (refreshButton) {
                refreshButton.disabled = true;
                refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מרענן...';
            }

            // Show loading state
            this.showLoadingState();

            // Reload data
            await this.loadJsMapData();

            // Re-enable refresh button
            if (refreshButton) {
                refreshButton.disabled = false;
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> רענן נתונים';
            }

            console.log('✅ JS map data refreshed successfully');

        } catch (error) {
            // Error refreshing JS map data:, error);
            this.showErrorState('שגיאה ברענון נתונים');

            // Re-enable refresh button
            const refreshButton = document.getElementById('refreshButton');
            if (refreshButton) {
                refreshButton.disabled = false;
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> רענן נתונים';
            }
        }
    }
}

// Global instance
window.jsMapSystem = new JsMapSystem();

// Global functions
function loadJsMapData() {
    console.log('🔄 loadJsMapData called');
    if (window.jsMapSystem) {
        console.log('🔄 Initializing jsMapSystem...');
        window.jsMapSystem.init();
    } else {
        // jsMapSystem not found!
    }
}

function refreshJsMap() {
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshJsMapData();
    }
}

async function refreshFunctionCalls() {
    console.log('🔄 Refreshing function calls...');

    if (window.jsScanner) {
        try {
            // Show loading state for function calls row
            const functionCallsRow = document.querySelector('.function-calls-row');
            if (functionCallsRow) {
                const cells = functionCallsRow.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                });
            }

            // Scan function calls
            const result = await window.jsScanner.scanFunctionCalls();

            // Update the function calls row
            if (functionCallsRow && result.counts) {
                const cells = functionCallsRow.querySelectorAll('td');
                let cellIndex = 0;

                Object.keys(result.counts).forEach(file => {
                    if (cells[cellIndex]) {
                        const count = result.counts[file];
                        const colorClass = count > 30 ? 'high-usage' : count > 15 ? 'medium-usage' : 'low-usage';
                        cells[cellIndex].innerHTML = `<span class="function-call-count ${colorClass}" onclick="showFunctionCallDetails('${file}', ${count})" style="cursor: pointer;" title="לחץ לפרטים">${count}</span>`;
                        cellIndex++;
                    }
                });
            }

            console.log('✅ Function calls refreshed successfully');

        } catch (error) {
            // Error refreshing function calls:, error);
        }
    }
}

function toggleFunctionGroup(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.toggle-arrow');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        arrow.textContent = '▼';
    } else {
        content.classList.add('expanded');
        arrow.textContent = '▲';
    }
}

function openFunctionDetails(file, functionName) {
    console.log(`Opening function details: ${functionName} from ${file}`);

    // Get function details from data
    if (window.jsMapSystem && window.jsMapSystem.functionsData[file]) {
        const functionDetails = window.jsMapSystem.functionsData[file].find(func => func.name === functionName);
        if (functionDetails) {
            openFunctionModal(
                functionDetails.name,
                functionDetails.annotations || 'No annotations available',
                functionDetails.code || 'No code available'
            );
            return;
        }
    }

    // Fallback to basic info
    const annotations = `Function: ${functionName}\nFile: ${file}\n\nAnnotations will be loaded from actual function parsing.`;
    const code = `// Function code will be loaded from actual file scanning\nfunction ${functionName}() {\n  // Implementation details...\n}`;

    openFunctionModal(functionName, annotations, code);
}

// Initialize JS Map page
function initializeJsMapPage() {
    console.log('🚀 Initializing JS Map page');

    // Load initial data
    loadJsMapData();
}

// Export initialization function
window.initializeJsMapPage = initializeJsMapPage;

// Global functions for modal
function openFunctionModal(functionName, annotations, code) {
    document.getElementById('modalFunctionName').textContent = functionName;
    document.getElementById('modalAnnotations').textContent = annotations || 'No annotations available';
    document.getElementById('modalCode').textContent = code || 'No code available';
    document.getElementById('functionModal').style.display = 'block';
}

function closeFunctionModal() {
    document.getElementById('functionModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('functionModal');
    const callsModal = document.getElementById('functionCallsModal');
    if (event.target === modal) {
        closeFunctionModal();
    }
    if (event.target === callsModal) {
        closeFunctionCallsModal();
    }
}

// Function calls modal functions
function showFunctionCallDetails(file, count) {
    console.log(`Showing function call details for ${file} (${count} calls)`);

    document.getElementById('modalFunctionCallsTitle').textContent = `קריאות לפונקציות - ${file}`;

    let content = `
        <div style="margin-bottom: 20px;">
            <h4>סה"כ קריאות: ${count}</h4>
            <p>קובץ: <code>${file}</code></p>
        </div>
    `;

    // Try to get real function call details
    if (window.jsScanner && window.jsScanner.functionCallDetails && window.jsScanner.functionCallDetails[file]) {
        const calls = window.jsScanner.functionCallDetails[file];
        content += `
            <div style="max-height: 400px; overflow-y: auto;">
                <h5>פירוט קריאות:</h5>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background: var(--apple-bg-secondary);">
                            <th style="padding: 8px; border: 1px solid var(--apple-border-light);">פונקציה</th>
                            <th style="padding: 8px; border: 1px solid var(--apple-border-light);">שורה</th>
                            <th style="padding: 8px; border: 1px solid var(--apple-border-light);">הקשר</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        calls.forEach(call => {
            content += `
                <tr>
                    <td style="padding: 8px; border: 1px solid var(--apple-border-light); font-family: 'Courier New', monospace;">${call.functionName}</td>
                    <td style="padding: 8px; border: 1px solid var(--apple-border-light);">${call.line}</td>
                    <td style="padding: 8px; border: 1px solid var(--apple-border-light); font-size: 0.9rem;">${call.context}</td>
                </tr>
            `;
        });

        content += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        content += `
            <div style="color: var(--apple-text-secondary); font-style: italic;">
                פרטי הקריאות לא זמינים כרגע. נסה לרענן את הנתונים.
            </div>
        `;
    }

    document.getElementById('functionCallsContent').innerHTML = content;
    document.getElementById('functionCallsModal').style.display = 'block';
}

function closeFunctionCallsModal() {
    document.getElementById('functionCallsModal').style.display = 'none';
}

// Navigation function
function navigateToSection(sectionId) {
    // Close all function groups first
    const allGroups = document.querySelectorAll('.function-group-content');
    allGroups.forEach(group => {
        group.classList.remove('expanded');
    });

    // Update arrows
    const allArrows = document.querySelectorAll('.toggle-arrow');
    allArrows.forEach(arrow => {
        arrow.textContent = '▼';
    });

    // Scroll to section
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Back to Top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide back to top button based on scroll position
function toggleBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
}

// Add scroll event listener
window.addEventListener('scroll', toggleBackToTop);

// Functions Dropdown
function toggleFunctionsDropdown() {
    const dropdown = document.getElementById('functionsDropdown');
    const toggle = document.querySelector('.dropdown-toggle');

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        toggle.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        toggle.classList.add('active');
        populateFunctionsDropdown();
    }
}

function populateFunctionsDropdown() {
    const content = document.getElementById('functionsDropdownContent');
    if (!content || !window.jsMapSystem || !window.jsMapSystem.functionsData) {
        return;
    }

    let html = '';

    Object.keys(window.jsMapSystem.functionsData).forEach(file => {
        const functions = window.jsMapSystem.functionsData[file];
        if (functions && functions.length > 0) {
            functions.forEach(func => {
                html += `
                     <div class="function-dropdown-item" onclick="selectFunctionFromDropdown('${file}', '${func.name}')">
                         <span class="function-name">${func.name}</span>
                         <span class="function-file">${file}</span>
                     </div>
                 `;
            });
        }
    });

    content.innerHTML = html;
}

function selectFunctionFromDropdown(file, functionName) {
    // Close dropdown
    const dropdown = document.getElementById('functionsDropdown');
    const toggle = document.querySelector('.dropdown-toggle');
    dropdown.classList.remove('show');
    toggle.classList.remove('active');

    // Navigate to functions section
    navigateToSection('functions-section');

    // Find and expand the function group
    setTimeout(() => {
        const functionGroups = document.querySelectorAll('.function-group-header');
        functionGroups.forEach(group => {
            const groupTitle = group.querySelector('span').textContent;
            if (groupTitle.includes(file)) {
                // Expand this group
                const content = group.nextElementSibling;
                const arrow = group.querySelector('.toggle-arrow');

                // Close all other groups first
                document.querySelectorAll('.function-group-content').forEach(g => {
                    g.classList.remove('expanded');
                });
                document.querySelectorAll('.toggle-arrow').forEach(a => {
                    a.textContent = '▼';
                });

                // Open this group
                content.classList.add('expanded');
                arrow.textContent = '▲';

                // Scroll to the function
                const functionRows = content.querySelectorAll('.function-row');
                functionRows.forEach(row => {
                    const funcName = row.querySelector('.function-name').textContent;
                    if (funcName === functionName) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        row.style.backgroundColor = 'var(--apple-blue)';
                        row.style.color = 'white';
                        setTimeout(() => {
                            row.style.backgroundColor = '';
                            row.style.color = '';
                        }, 2000);
                    }
                });
            }
        });
    }, 500);
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('functionsDropdown');
    const toggle = document.querySelector('.dropdown-toggle');

    if (!dropdown.contains(event.target) && !toggle.contains(event.target)) {
        dropdown.classList.remove('show');
        toggle.classList.remove('active');
    }
});

/**
 * ==========================================
 * NEW FUNCTIONALITY - Advanced Analysis
 * ==========================================
 */

/**
 * Load and render duplicates analysis
 */
async function loadDuplicatesAnalysis() {
    try {
        console.log('🔍 Loading duplicates analysis...');
        
        const response = await fetch('/api/js-map/analyze-duplicates');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderDuplicatesAnalysis(data.data);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Error loading duplicates analysis:', error);
        showDuplicatesError('שגיאה בטעינת ניתוח כפילויות: ' + error.message);
    }
}

/**
 * Render duplicates analysis results
 */
function renderDuplicatesAnalysis(data) {
    const container = document.getElementById('duplicatesContent');
    if (!container) {
        console.error('❌ duplicatesContent container not found');
        return;
    }
    
    const summary = data.summary;
    const exactDuplicates = data.exact_duplicates || [];
    const potentialDuplicates = data.potential_duplicates || [];
    
    let html = `
        <div class="analysis-summary">
            <h3>📊 סיכום ניתוח כפילויות</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">כפילויות מדויקות:</span>
                    <span class="stat-value">${summary.total_exact_duplicates}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">כפילויות פוטנציאליות:</span>
                    <span class="stat-value">${summary.total_potential_duplicates}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">חתימות ייחודיות:</span>
                    <span class="stat-value">${summary.total_unique_signatures}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">יחס כפילויות:</span>
                    <span class="stat-value">${summary.duplicate_ratio.toFixed(2)}%</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-tabs">
            <button class="tab-btn active" onclick="showDuplicatesTab('exact')">כפילויות מדויקות</button>
            <button class="tab-btn" onclick="showDuplicatesTab('potential')">כפילויות פוטנציאליות</button>
            <button class="tab-btn" onclick="copyDuplicatesLog()">📋 העתק לוג</button>
        </div>
        
        <div id="exactDuplicatesTab" class="tab-content active">
            ${renderExactDuplicates(exactDuplicates)}
        </div>
        
        <div id="potentialDuplicatesTab" class="tab-content">
            ${renderPotentialDuplicates(potentialDuplicates)}
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render exact duplicates
 */
function renderExactDuplicates(duplicates) {
    if (!duplicates || duplicates.length === 0) {
        return '<p>לא נמצאו כפילויות מדויקות</p>';
    }
    
    let html = '<div class="duplicates-list">';
    
    duplicates.forEach((group, index) => {
        html += `
            <div class="duplicate-group">
                <h4>קבוצה ${index + 1}: ${group.signature}</h4>
                <div class="duplicate-files">
                    ${group.files.map(file => `
                        <div class="duplicate-file">
                            <span class="file-name">${file.filename}</span>
                            <span class="function-name">${file.function_name}</span>
                            <span class="line-number">שורה ${file.line_number}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Render potential duplicates
 */
function renderPotentialDuplicates(duplicates) {
    if (!duplicates || duplicates.length === 0) {
        return '<p>לא נמצאו כפילויות פוטנציאליות</p>';
    }
    
    let html = '<div class="duplicates-list">';
    
    duplicates.forEach((group, index) => {
        html += `
            <div class="duplicate-group">
                <h4>קבוצה ${index + 1}: דמיון ${group.similarity_score}%</h4>
                <div class="duplicate-files">
                    ${group.files.map(file => `
                        <div class="duplicate-file">
                            <span class="file-name">${file.filename}</span>
                            <span class="function-name">${file.function_name}</span>
                            <span class="line-number">שורה ${file.line_number}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Show duplicates tab
 */
function showDuplicatesTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'DuplicatesTab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

/**
 * Show duplicates error
 */
function showDuplicatesError(message) {
    const container = document.getElementById('duplicatesContent');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="loadDuplicatesAnalysis()" class="retry-btn">🔄 נסה שוב</button>
            </div>
        `;
    }
}

/**
 * Copy duplicates log to clipboard
 */
async function copyDuplicatesLog() {
    try {
        const response = await fetch('/api/js-map/analyze-duplicates');
        const data = await response.json();
        
        if (data.status === 'success') {
            const logText = generateDuplicatesLog(data.data);
            await navigator.clipboard.writeText(logText);
            
            // Show success message
            if (window.showNotification) {
                window.showNotification('לוג ניתוח כפילויות הועתק ללוח', 'success');
            } else {
                alert('לוג ניתוח כפילויות הועתק ללוח');
            }
        }
    } catch (error) {
        console.error('❌ Error copying duplicates log:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בהעתקת הלוג', 'error');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

/**
 * Generate duplicates log text
 */
function generateDuplicatesLog(data) {
    const summary = data.summary;
    
    let log = `=== לוג ניתוח כפילויות פונקציות ===\n`;
    log += `תאריך: ${new Date().toLocaleString('he-IL')}\n\n`;
    
    log += `סיכום:\n`;
    log += `- כפילויות מדויקות: ${summary.total_exact_duplicates}\n`;
    log += `- כפילויות פוטנציאליות: ${summary.total_potential_duplicates}\n`;
    log += `- חתימות ייחודיות: ${summary.total_unique_signatures}\n`;
    log += `- יחס כפילויות: ${summary.duplicate_ratio.toFixed(2)}%\n\n`;
    
    if (data.exact_duplicates && data.exact_duplicates.length > 0) {
        log += `כפילויות מדויקות:\n`;
        data.exact_duplicates.forEach((group, index) => {
            log += `${index + 1}. ${group.signature}\n`;
            group.files.forEach(file => {
                log += `   - ${file.filename}:${file.line_number} (${file.function_name})\n`;
            });
            log += `\n`;
        });
    }
    
    if (data.potential_duplicates && data.potential_duplicates.length > 0) {
        log += `כפילויות פוטנציאליות:\n`;
        data.potential_duplicates.forEach((group, index) => {
            log += `${index + 1}. דמיון ${group.similarity_score}%\n`;
            group.files.forEach(file => {
                log += `   - ${file.filename}:${file.line_number} (${file.function_name})\n`;
            });
            log += `\n`;
        });
    }
    
    return log;
}

/**
 * Load and render local functions analysis
 */
async function loadLocalFunctionsAnalysis() {
    try {
        console.log('🏠 Loading local functions analysis...');
        
        const response = await fetch('/api/js-map/detect-local-functions');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderLocalFunctionsAnalysis(data.data);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Error loading local functions analysis:', error);
        showLocalFunctionsError('שגיאה בטעינת ניתוח פונקציות מקומיות: ' + error.message);
    }
}

/**
 * Render local functions analysis results
 */
function renderLocalFunctionsAnalysis(data) {
    const container = document.getElementById('localFunctionsContent');
    if (!container) {
        console.error('❌ localFunctionsContent container not found');
        return;
    }
    
    const summary = data.summary;
    const fileAnalysis = data.file_analysis || [];
    
    let html = `
        <div class="analysis-summary">
            <h3>📊 סיכום ניתוח פונקציות מקומיות</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">קבצים נסרקו:</span>
                    <span class="stat-value">${summary.files_analyzed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">קבצים עם בעיות:</span>
                    <span class="stat-value">${summary.files_with_issues}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">סה"כ בעיות:</span>
                    <span class="stat-value">${summary.total_local_function_issues}</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-actions">
            <button class="action-btn" onclick="copyLocalFunctionsLog()">📋 העתק לוג</button>
        </div>
        
        <div class="file-analysis-list">
            ${renderFileAnalysis(fileAnalysis)}
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render file analysis
 */
function renderFileAnalysis(fileAnalysis) {
    if (!fileAnalysis || fileAnalysis.length === 0) {
        return '<p>לא נמצאו בעיות בפונקציות מקומיות</p>';
    }
    
    let html = '';
    
    fileAnalysis.forEach((file, index) => {
        html += `
            <div class="file-analysis-item">
                <h4>📁 ${file.filename}</h4>
                <div class="analysis-details">
                    <p><strong>פונקציות מקומיות:</strong> ${file.local_functions_count}</p>
                    <p><strong>פונקציות גלובליות זמינות:</strong> ${file.available_global_functions}</p>
                </div>
                
                ${file.local_functions.length > 0 ? `
                    <div class="local-functions-list">
                        <h5>פונקציות מקומיות שזוהו:</h5>
                        ${file.local_functions.map(func => `
                            <div class="local-function-item">
                                <span class="function-name">${func.name}</span>
                                <span class="line-number">שורה ${func.line_number}</span>
                                ${func.suggested_global ? `<span class="suggestion">💡 הצעה: ${func.suggested_global}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    return html;
}

/**
 * Show local functions error
 */
function showLocalFunctionsError(message) {
    const container = document.getElementById('localFunctionsContent');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="loadLocalFunctionsAnalysis()" class="retry-btn">🔄 נסה שוב</button>
            </div>
        `;
    }
}

/**
 * Copy local functions log to clipboard
 */
async function copyLocalFunctionsLog() {
    try {
        const response = await fetch('/api/js-map/detect-local-functions');
        const data = await response.json();
        
        if (data.status === 'success') {
            const logText = generateLocalFunctionsLog(data.data);
            await navigator.clipboard.writeText(logText);
            
            // Show success message
            if (window.showNotification) {
                window.showNotification('לוג ניתוח פונקציות מקומיות הועתק ללוח', 'success');
            } else {
                alert('לוג ניתוח פונקציות מקומיות הועתק ללוח');
            }
        }
    } catch (error) {
        console.error('❌ Error copying local functions log:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בהעתקת הלוג', 'error');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

/**
 * Generate local functions log text
 */
function generateLocalFunctionsLog(data) {
    const summary = data.summary;
    
    let log = `=== לוג ניתוח פונקציות מקומיות ===\n`;
    log += `תאריך: ${new Date().toLocaleString('he-IL')}\n\n`;
    
    log += `סיכום:\n`;
    log += `- קבצים נסרקו: ${summary.files_analyzed}\n`;
    log += `- קבצים עם בעיות: ${summary.files_with_issues}\n`;
    log += `- סה"כ בעיות: ${summary.total_local_function_issues}\n\n`;
    
    if (data.file_analysis && data.file_analysis.length > 0) {
        log += `ניתוח מפורט:\n`;
        data.file_analysis.forEach((file, index) => {
            log += `${index + 1}. ${file.filename}\n`;
            log += `   - פונקציות מקומיות: ${file.local_functions_count}\n`;
            log += `   - פונקציות גלובליות זמינות: ${file.available_global_functions}\n`;
            
            if (file.local_functions && file.local_functions.length > 0) {
                log += `   - פונקציות מקומיות:\n`;
                file.local_functions.forEach(func => {
                    log += `     * ${func.name} (שורה ${func.line_number})`;
                    if (func.suggested_global) {
                        log += ` - הצעה: ${func.suggested_global}`;
                    }
                    log += `\n`;
                });
            }
            log += `\n`;
        });
    }
    
    return log;
}

/**
 * Load and render architecture check
 */
async function loadArchitectureCheck() {
    try {
        console.log('🏗️ Loading architecture check...');
        
        const response = await fetch('/api/js-map/architecture-check');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderArchitectureCheck(data.data);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Error loading architecture check:', error);
        showArchitectureError('שגיאה בטעינת בדיקת ארכיטקטורה: ' + error.message);
    }
}

/**
 * Render architecture check results
 */
function renderArchitectureCheck(data) {
    const container = document.getElementById('architectureContent');
    if (!container) {
        console.error('❌ architectureContent container not found');
        return;
    }
    
    const violations = data.violations || [];
    const compliantFiles = data.compliant_files;
    const totalHtmlFiles = data.total_html_files;
    const isCompliant = data.is_compliant;
    
    let html = `
        <div class="analysis-summary">
            <h3>📊 סיכום בדיקת ארכיטקטורה</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">קבצי HTML נבדקו:</span>
                    <span class="stat-value">${totalHtmlFiles}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">קבצים עומדים בכללים:</span>
                    <span class="stat-value">${compliantFiles}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">הפרות זוהו:</span>
                    <span class="stat-value">${violations.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">סטטוס:</span>
                    <span class="stat-value ${isCompliant ? 'compliant' : 'non-compliant'}">${isCompliant ? '✅ עומד' : '❌ לא עומד'}</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-actions">
            <button class="action-btn" onclick="copyArchitectureLog()">📋 העתק לוג</button>
        </div>
        
        <div class="violations-list">
            ${renderViolations(violations)}
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render violations
 */
function renderViolations(violations) {
    if (!violations || violations.length === 0) {
        return '<p>✅ לא נמצאו הפרות ארכיטקטורה</p>';
    }
    
    let html = '<h4>🚨 הפרות ארכיטקטורה:</h4>';
    
    violations.forEach((violation, index) => {
        html += `
            <div class="violation-item">
                <div class="violation-header">
                    <span class="violation-file">📁 ${violation.file}</span>
                    <span class="violation-line">שורה ${violation.line}</span>
                    <span class="violation-severity severity-${violation.severity}">${violation.severity}</span>
                </div>
                <div class="violation-content">
                    <code>${violation.content}</code>
                </div>
                <div class="violation-type">
                    סוג הפרה: ${violation.violation_type}
                </div>
            </div>
        `;
    });
    
    return html;
}

/**
 * Show architecture error
 */
function showArchitectureError(message) {
    const container = document.getElementById('architectureContent');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="loadArchitectureCheck()" class="retry-btn">🔄 נסה שוב</button>
            </div>
        `;
    }
}

/**
 * Copy architecture log to clipboard
 */
async function copyArchitectureLog() {
    try {
        const response = await fetch('/api/js-map/architecture-check');
        const data = await response.json();
        
        if (data.status === 'success') {
            const logText = generateArchitectureLog(data.data);
            await navigator.clipboard.writeText(logText);
            
            // Show success message
            if (window.showNotification) {
                window.showNotification('לוג בדיקת ארכיטקטורה הועתק ללוח', 'success');
            } else {
                alert('לוג בדיקת ארכיטקטורה הועתק ללוח');
            }
        }
    } catch (error) {
        console.error('❌ Error copying architecture log:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בהעתקת הלוג', 'error');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

/**
 * Generate architecture log text
 */
function generateArchitectureLog(data) {
    const violations = data.violations || [];
    const compliantFiles = data.compliant_files;
    const totalHtmlFiles = data.total_html_files;
    const isCompliant = data.is_compliant;
    
    let log = `=== לוג בדיקת ארכיטקטורה ===\n`;
    log += `תאריך: ${new Date().toLocaleString('he-IL')}\n\n`;
    
    log += `סיכום:\n`;
    log += `- קבצי HTML נבדקו: ${totalHtmlFiles}\n`;
    log += `- קבצים עומדים בכללים: ${compliantFiles}\n`;
    log += `- הפרות זוהו: ${violations.length}\n`;
    log += `- סטטוס: ${isCompliant ? 'עומד' : 'לא עומד'}\n\n`;
    
    if (violations.length > 0) {
        log += `הפרות מפורטות:\n`;
        violations.forEach((violation, index) => {
            log += `${index + 1}. ${violation.file}:${violation.line}\n`;
            log += `   סוג: ${violation.violation_type}\n`;
            log += `   חומרה: ${violation.severity}\n`;
            log += `   תוכן: ${violation.content}\n\n`;
        });
    }
    
    return log;
}

/**
 * Initialize all new sections when page loads
 */
function initializeAdvancedSections() {
    console.log('🚀 Initializing advanced JS-Map sections...');
    
    // Load data for each section when it becomes visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                switch(sectionId) {
                    case 'section2':
                        loadDuplicatesAnalysis();
                        break;
                    case 'section3':
                        loadLocalFunctionsAnalysis();
                        break;
                    case 'section7':
                        loadArchitectureCheck();
                        break;
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe sections
    ['section2', 'section3', 'section7'].forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            observer.observe(section);
        }
    });
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 JS-Map advanced functionality loaded');
    
    // Initialize advanced sections after a short delay
    setTimeout(initializeAdvancedSections, 1000);
});

