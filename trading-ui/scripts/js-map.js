/**
 * JS Map System - TikTrack Frontend
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
 * Architecture:
 * - File scanning and parsing
 * - Function extraction with annotations
 * - Dynamic table generation
 * - Modal display for function details
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - ui-utils.js (UI utilities)
 * 
 * @author TikTrack Development Team
 * @version 1.0
 * @lastUpdated August 26, 2025
 * 
 * INDEX:
 * ======
 * 
 * CLASSES:
 * - JsMapSystem: Main system class for managing JS map functionality
 * 
 * METHODS (JsMapSystem):
 * - init(): Initialize the JS map system
 * - loadJsMapData(): Load JS map data from server
 * - loadPageMapping(): Load page mapping data
 * - loadFunctionsData(): Load functions data
 * - scanPageMappingLocally(): Scan page mapping locally
 * - scanFunctionsLocally(): Scan functions locally
 * - renderPageMapping(): Render page mapping table
 * - renderFunctionsData(): Render functions data
 * - sortJsFilesByGenerality(): Sort JS files by generality
 * - showLoadingState(): Show loading state
 * - showErrorState(): Show error state
 * - refreshJsMapData(): Refresh JS map data
 * 
 * GLOBAL FUNCTIONS:
 * - loadJsMapData(): Initialize and load JS map data
 * - refreshJsMap(): Refresh JS map data
 * - toggleFunctionGroup(): Toggle function group visibility
 * - openFunctionDetails(): Open function details modal
 */

/**
 * מערכת מפת פונקציות JS
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
     * Load JS map data from server
     */
    async loadJsMapData() {
        try {
            console.log('📊 Loading JS map data...');

            // Show loading state
            this.showLoadingState();

            // Get page mapping
            await this.loadPageMapping();

            // Get functions data
            await this.loadFunctionsData();

            console.log('📊 Data loaded - Page mapping keys:', Object.keys(this.pageMapping));
            console.log('📊 Data loaded - Functions data keys:', Object.keys(this.functionsData));

            // Render data
            this.renderPageMapping();
            this.renderFunctionsData();

            console.log('✅ JS map data loaded successfully');

        } catch (error) {
            console.error('❌ Error loading JS map data:', error);
            this.showErrorState('שגיאה בטעינת נתונים');
        }
    }

    /**
     * Load page mapping data
     */
    async loadPageMapping() {
        try {
            const response = await fetch('/api/js-map/page-mapping');
            if (response.ok) {
                this.pageMapping = await response.json();
                console.log('✅ Page mapping loaded from server:', this.pageMapping);
            } else {
                // Fallback to local scanning
                console.warn('⚠️ Server response not ok, using local scan');
                this.pageMapping = this.scanPageMappingLocally();
            }
        } catch (error) {
            console.warn('⚠️ Using local page mapping scan due to error:', error);
            this.pageMapping = this.scanPageMappingLocally();
        }
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
                if (this.functionsData['simple-filter.js']) {
                    console.log('📄 Sample functions from simple-filter.js:', this.functionsData['simple-filter.js'].length);
                }
            } else {
                // Fallback to local scanning
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
        const mapping = {};

        // Define known page to JS file mappings - FIXED LIST
        const pageMappings = {
            'index.html': ['main.js', 'header-system.js', 'simple-filter.js'],
            'trades.html': ['trades.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'trade_plans.html': ['trade_plans.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'research.html': ['research.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'alerts.html': ['alerts.js', 'active-alerts-component.js', 'header-system.js', 'simple-filter.js'],
            'executions.html': ['executions.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'tickers.html': ['tickers.js', 'ticker-service.js', 'header-system.js', 'simple-filter.js'],
            'accounts.html': ['accounts.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'cash_flows.html': ['cash_flows.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'notes.html': ['notes.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'preferences.html': ['preferences.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'db_display.html': ['database.js', 'db-extradata.js', 'header-system.js', 'simple-filter.js'],
            'db_extradata.html': ['db-extradata.js', 'header-system.js', 'simple-filter.js'],
            'constraints.html': ['constraint-manager.js', 'header-system.js', 'simple-filter.js'],
            'tests.html': ['tests.js', 'header-system.js', 'simple-filter.js'],
            'styles.html': ['header-system.js', 'simple-filter.js'],
            'js-map.html': ['js-map.js', 'js-scanner.js', 'header-system.js', 'simple-filter.js']
        };

        // Get all JS files - FIXED LIST
        this.jsFiles = [
            'main.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js',
            'translation-utils.js', 'data-utils.js', 'table-mappings.js',
            'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
            'alerts.js', 'active-alerts-component.js', 'trades.js', 'trade_plans.js',
            'research.js', 'executions.js', 'tickers.js', 'ticker-service.js',
            'accounts.js', 'cash_flows.js', 'notes.js', 'preferences.js',
            'database.js', 'db-extradata.js', 'constraint-manager.js',
            'tests.js', 'filter-system.js', 'currencies.js', 'auth.js',
            'js-map.js', 'js-scanner.js'
        ];

        // Get all HTML pages
        this.htmlPages = Object.keys(pageMappings);

        // Create mapping table
        this.htmlPages.forEach(page => {
            mapping[page] = pageMappings[page] || [];
        });

        console.log('🔍 Fixed page mapping created:', mapping);
        console.log('📄 HTML Pages:', this.htmlPages);
        console.log('🗂️ JS Files:', this.jsFiles);

        return mapping;
    }

    /**
     * Scan functions locally
     */
    async scanFunctionsLocally() {
        const functions = {};

        // Use the JS scanner to get actual function data
        if (window.jsScanner) {
            try {
                console.log('🔍 Using JS scanner to get functions...');
                const scanResult = await window.jsScanner.scanAllJsFiles();
                console.log('✅ JS scanner result:', Object.keys(scanResult.functions));
                return scanResult.functions;
            } catch (error) {
                console.warn('⚠️ Could not scan functions, using fallback structure:', error);
            }
        }

        // Fallback to sample functions structure
        console.log('⚠️ Using fallback sample functions structure');
        
        // Sample functions for key files
        functions['simple-filter.js'] = [
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
     * Render page mapping table
     */
    renderPageMapping() {
        const container = document.getElementById('pageMappingContent');
        if (!container) return;

        console.log('🔍 Rendering page mapping...');
        console.log('📄 HTML Pages:', this.htmlPages);
        console.log('🗂️ Page Mapping:', this.pageMapping);

        // Sort JS files by generality (most general first)
        const sortedJsFiles = this.sortJsFilesByGenerality();

        let html = `
            <table class="page-mapping-table">
                <thead>
                    <tr>
                        <th>עמוד</th>
                        ${sortedJsFiles.map(file => `<th class="js-file-cell">${file}</th>`).join('')}
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
        console.log('✅ Page mapping rendered');
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
            'main.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js',
            'translation-utils.js', 'data-utils.js', 'table-mappings.js',
            'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
            'filter-system.js', 'console-cleanup.js',
            // Specific page files
            'alerts.js', 'active-alerts-component.js', 'trades.js', 'trade_plans.js',
            'research.js', 'executions.js', 'tickers.js', 'ticker-service.js',
            'accounts.js', 'cash_flows.js', 'notes.js', 'preferences.js',
            'database.js', 'db-extradata.js', 'constraint-manager.js',
            'tests.js', 'currencies.js', 'auth.js'
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
            console.error('❌ Error refreshing JS map data:', error);
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
    if (window.jsMapSystem) {
        window.jsMapSystem.init();
    }
}

function refreshJsMap() {
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshJsMapData();
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

    // Get function details from scanner
    if (window.jsScanner) {
        const functionDetails = window.jsScanner.getFunctionDetails(file, functionName);
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
