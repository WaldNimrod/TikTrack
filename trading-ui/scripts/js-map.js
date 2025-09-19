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
     * Load global functions index from functions data
     */
    async loadGlobalFunctionsIndex() {
        try {
            console.log('🔍 Loading global functions index...');
            
            // Try to load from the functions endpoint
            const response = await fetch('/api/js-map/functions');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    // Extract global functions from the functions data
                    this.globalFunctionsIndex = this.extractGlobalFunctions(data.data);
                    console.log('✅ Global functions index loaded:', Object.keys(this.globalFunctionsIndex).length, 'functions');
                } else {
                    console.warn('⚠️ No functions data available for global index');
                }
            } else {
                console.warn('⚠️ Could not load functions data for global index');
            }
        } catch (error) {
            console.error('❌ Error loading global functions index:', error);
        }
    }

    /**
     * Extract global functions from functions data
     */
    extractGlobalFunctions(functionsData) {
        const globalFunctions = {};
        
        // Define files that typically contain global functions
        const globalFiles = [
            'main.js', 'ui-utils.js', 'data-utils.js', 'translation-utils.js',
            'tables.js', 'date-utils.js', 'linked-items.js', 'page-utils.js',
            'header-system.js', 'notification-system.js', 'color-scheme-system.js'
        ];
        
        for (const filename in functionsData) {
            if (globalFiles.includes(filename) && functionsData[filename].functions) {
                const functions = functionsData[filename].functions;
                for (const func of functions) {
                    if (func.name && this.isGlobalFunction(func)) {
                        globalFunctions[func.name] = {
                            file: filename,
                            description: func.description || 'אין תיאור',
                            line: func.line || 0,
                            type: func.type || 'unknown'
                        };
                    }
                }
            }
        }
        
        return globalFunctions;
    }

    /**
     * Check if a function should be considered global
     */
    isGlobalFunction(func) {
        // Functions that are typically global
        const globalPatterns = [
            'show', 'hide', 'toggle', 'load', 'save', 'update', 'delete', 'create',
            'format', 'validate', 'get', 'set', 'init', 'setup', 'configure',
            'apiCall', 'showNotification', 'formatDate', 'formatDateTime'
        ];
        
        const funcName = func.name.toLowerCase();
        return globalPatterns.some(pattern => funcName.includes(pattern));
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
            
            // Load global functions index
            await this.loadGlobalFunctionsIndex();

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
            console.log('🌐 Fetching page mapping from Page Scripts Matrix API...');
            const response = await fetch('/api/page-scripts-matrix/scan-results');
            if (response.ok) {
                const data = await response.json();
                // Convert Page Scripts Matrix format to JS-Map format
                this.pageMapping = this.convertPageScriptsMatrixToJsMap(data.data);
                console.log('✅ Page mapping loaded from Page Scripts Matrix API:', Object.keys(this.pageMapping));
            } else {
                console.warn('⚠️ Page Scripts Matrix API failed, trying JS-Map API...');
                const fallbackResponse = await fetch('/api/js-map/page-mapping');
                if (fallbackResponse.ok) {
                    this.pageMapping = await fallbackResponse.json();
                    console.log('✅ Page mapping loaded from JS-Map API:', Object.keys(this.pageMapping));
                } else {
                    console.warn('⚠️ Both APIs failed, using local scan');
                    this.pageMapping = this.scanPageMappingLocally();
                }
            }
        } catch (error) {
            console.warn('⚠️ Fetch failed, using local scan:', error);
            this.pageMapping = this.scanPageMappingLocally();
        }
        console.log('🔄 loadPageMapping completed. Page mapping keys:', Object.keys(this.pageMapping));
    }

    /**
     * Convert Page Scripts Matrix format to JS-Map format
     */
    convertPageScriptsMatrixToJsMap(pageScriptsData) {
        console.log('🔄 Converting Page Scripts Matrix data to JS-Map format...');
        
        const jsMapFormat = {};
        
        if (pageScriptsData && pageScriptsData.matrix) {
            for (const [pageName, scripts] of Object.entries(pageScriptsData.matrix)) {
                // Get scripts that are actually used by this page
                const usedScripts = Object.entries(scripts)
                    .filter(([scriptName, isUsed]) => isUsed === true)
                    .map(([scriptName]) => scriptName);
                
                jsMapFormat[pageName] = {
                    files: usedScripts,
                    page_type: 'standard',
                    functions_count: 0, // Will be calculated later
                    last_modified: new Date().toISOString(),
                    file_sizes: {},
                    dependencies: usedScripts
                };
            }
        }
        
        console.log('✅ Converted Page Scripts Matrix data:', Object.keys(jsMapFormat));
        return jsMapFormat;
    }

    /**
     * Check integration status with Page Scripts Matrix
     */
    async checkIntegrationStatus() {
        console.log('🔍 Checking integration status with Page Scripts Matrix...');
        
        try {
            // Test Page Scripts Matrix API
            const response = await fetch('/api/page-scripts-matrix/scan-results');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Page Scripts Matrix API is working');
                console.log('📊 Available pages:', Object.keys(data.data.matrix || {}).length);
                console.log('📊 Available scripts:', Object.keys(data.data.scripts || {}).length);
                return {
                    status: 'integrated',
                    pages: Object.keys(data.data.matrix || {}).length,
                    scripts: Object.keys(data.data.scripts || {}).length,
                    lastScan: data.data.lastScan
                };
            } else {
                console.warn('⚠️ Page Scripts Matrix API not available');
                return { status: 'fallback', reason: 'API not available' };
            }
        } catch (error) {
            console.warn('⚠️ Page Scripts Matrix integration check failed:', error);
            return { status: 'fallback', reason: error.message };
        }
    }

    /**
     * Load integration status
     */
    async loadIntegrationStatus() {
        try {
            console.log('🔍 Loading integration status...');
            
            const integrationStatus = await this.checkIntegrationStatus();
            
            const container = document.getElementById('integrationContent');
            if (!container) {
                console.warn('⚠️ integrationContent container not found');
                return;
            }

            let html = `
                <div class="integration-status">
                    <h3>🔗 סטטוס אינטגרציה עם מערכת Page Scripts Matrix</h3>
                    <div class="status-info">
                        <div class="status-item">
                            <span class="status-label">סטטוס:</span>
                            <span class="status-value ${integrationStatus.status === 'integrated' ? 'status-success' : 'status-warning'}">
                                ${integrationStatus.status === 'integrated' ? '✅ מחובר' : '⚠️ מצב גיבוי'}
                            </span>
                        </div>
            `;

            if (integrationStatus.status === 'integrated') {
                html += `
                        <div class="status-item">
                            <span class="status-label">עמודים זמינים:</span>
                            <span class="status-value">${integrationStatus.pages}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">סקריפטים זמינים:</span>
                            <span class="status-value">${integrationStatus.scripts}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">סריקה אחרונה:</span>
                            <span class="status-value">${new Date(integrationStatus.lastScan).toLocaleString('he-IL')}</span>
                        </div>
                `;
            } else {
                html += `
                        <div class="status-item">
                            <span class="status-label">סיבה:</span>
                            <span class="status-value">${integrationStatus.reason}</span>
                        </div>
                `;
            }

            html += `
                    </div>
                    <div class="integration-actions">
                        <button class="action-btn" onclick="checkIntegrationStatus()">🔄 בדוק שוב</button>
                        <button class="action-btn" onclick="loadPageMapping()">📊 טען נתונים מחדש</button>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            console.log('✅ Integration status loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading integration status:', error);
            
            const container = document.getElementById('integrationContent');
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <p>❌ שגיאה בטעינת סטטוס האינטגרציה</p>
                        <button class="retry-btn" onclick="window.jsMapSystem.loadIntegrationStatus()">🔄 נסה שוב</button>
                    </div>
                `;
            }
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
                const filesWithFunctions = Object.keys(this.functionsData).filter(file => {
                    const fileData = this.functionsData[file];
                    if (fileData) {
                        if (Array.isArray(fileData)) {
                            return fileData.length > 0;
                        } else if (fileData.functions && Array.isArray(fileData.functions)) {
                            return fileData.functions.length > 0;
                        }
                    }
                    return false;
                });
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
            const fileData = this.functionsData[file];
            let functions = [];
            
            // Handle different data structures
            if (fileData) {
                if (Array.isArray(fileData)) {
                    functions = fileData;
                } else if (fileData.functions && Array.isArray(fileData.functions)) {
                    functions = fileData.functions;
                }
            }
            
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
        const fileData = window.jsMapSystem.functionsData[file];
        let functions = [];
        
        // Handle different data structures
        if (fileData) {
            if (Array.isArray(fileData)) {
                functions = fileData;
            } else if (fileData.functions && Array.isArray(fileData.functions)) {
                functions = fileData.functions;
            }
        }
        
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
            
            // Check if endpoint exists first
            const testResponse = await fetch('/api/js-map/analyze-duplicates', { method: 'HEAD' });
            if (!testResponse.ok) {
                console.warn('⚠️ Duplicates analysis endpoint not available, showing placeholder');
                showDuplicatesPlaceholder();
                return;
            }
            
            const response = await fetch('/api/js-map/analyze-duplicates');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // שמירה ב-IndexedDB
                if (window.jsMapIndexedDBAdapter && window.jsMapIndexedDBAdapter.isReady()) {
                    try {
                        await window.jsMapIndexedDBAdapter.saveDuplicatesAnalysis(data.data);
                        console.log('✅ ניתוח כפילויות נשמר ב-IndexedDB');
                    } catch (saveError) {
                        console.warn('⚠️ שגיאה בשמירת ניתוח כפילויות:', saveError);
                    }
                }
                
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
        // בדיקה שהקבוצה קיימת ויש לה קבצים
        if (!group || !group.files || !Array.isArray(group.files)) {
            console.warn('⚠️ קבוצת כפילויות לא תקינה:', group);
            return;
        }
        
        html += `
            <div class="duplicate-group">
                <h4>קבוצה ${index + 1}: דמיון ${group.similarity_score || 0}%</h4>
                <div class="duplicate-files">
                    ${group.files.map(file => `
                        <div class="duplicate-file">
                            <span class="file-name">${file.filename || 'לא ידוע'}</span>
                            <span class="function-name">${file.function_name || 'לא ידוע'}</span>
                            <span class="line-number">שורה ${file.line_number || 0}</span>
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
 * Show duplicates placeholder when endpoint is not available
 */
function showDuplicatesPlaceholder() {
    const container = document.getElementById('duplicatesContent');
    if (container) {
        container.innerHTML = `
            <div class="placeholder-message">
                <div class="placeholder-icon">
                    <i class="fas fa-cog fa-spin"></i>
                </div>
                <h3>🔧 ניתוח כפילויות - בפיתוח</h3>
                <p>הפונקציונליות הזו נמצאת בפיתוח. ה-API endpoint לא זמין כרגע.</p>
                <div class="placeholder-features">
                    <h4>מה יקרה כאן:</h4>
                    <ul>
                        <li>זיהוי פונקציות זהות או דומות</li>
                        <li>הצגת המלצות לאיחוד קוד</li>
                        <li>ניתוח חתימות פונקציות</li>
                        <li>דירוג רמת הדמיון</li>
                    </ul>
                </div>
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
            
            // Check if endpoint exists first
            const testResponse = await fetch('/api/js-map/detect-local-functions', { method: 'HEAD' });
            if (!testResponse.ok) {
                console.warn('⚠️ Local functions analysis endpoint not available, showing placeholder');
                showLocalFunctionsPlaceholder();
                return;
            }
            
            const response = await fetch('/api/js-map/detect-local-functions');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // שמירה ב-IndexedDB
                if (window.jsMapIndexedDBAdapter && window.jsMapIndexedDBAdapter.isReady()) {
                    try {
                        await window.jsMapIndexedDBAdapter.saveLocalFunctionsAnalysis(data.data);
                        console.log('✅ ניתוח פונקציות מקומיות נשמר ב-IndexedDB');
                    } catch (saveError) {
                        console.warn('⚠️ שגיאה בשמירת ניתוח פונקציות מקומיות:', saveError);
                    }
                }
                
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
    // בדיקה שהנתונים תקינים
    if (!fileAnalysis || !Array.isArray(fileAnalysis) || fileAnalysis.length === 0) {
        console.warn('⚠️ נתוני ניתוח קבצים לא תקינים:', fileAnalysis);
        return '<p>לא נמצאו בעיות בפונקציות מקומיות</p>';
    }
    
    let html = '';
    
    fileAnalysis.forEach((file, index) => {
        // בדיקה שהקובץ תקין
        if (!file || !file.filename) {
            console.warn('⚠️ נתוני קובץ לא תקינים:', file);
            return;
        }
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
 * Show local functions placeholder when endpoint is not available
 */
function showLocalFunctionsPlaceholder() {
    const container = document.getElementById('localFunctionsContent');
    if (container) {
        container.innerHTML = `
            <div class="placeholder-message">
                <div class="placeholder-icon">
                    <i class="fas fa-home fa-spin"></i>
                </div>
                <h3>🏠 זיהוי פונקציות מקומיות - בפיתוח</h3>
                <p>הפונקציונליות הזו נמצאת בפיתוח. ה-API endpoint לא זמין כרגע.</p>
                <div class="placeholder-features">
                    <h4>מה יקרה כאן:</h4>
                    <ul>
                        <li>זיהוי פונקציות מקומיות שניתן להעביר לגלובליות</li>
                        <li>השוואה עם פונקציות גלובליות קיימות</li>
                        <li>הצעות לאיחוד פונקציות דומות</li>
                        <li>ניתוח שימוש בפונקציות מקומיות</li>
                    </ul>
                </div>
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
                // שמירה ב-IndexedDB
                if (window.jsMapIndexedDBAdapter && window.jsMapIndexedDBAdapter.isReady()) {
                    try {
                        await window.jsMapIndexedDBAdapter.saveArchitectureCheck(data.data);
                        console.log('✅ בדיקת ארכיטקטורה נשמרה ב-IndexedDB');
                    } catch (saveError) {
                        console.warn('⚠️ שגיאה בשמירת בדיקת ארכיטקטורה:', saveError);
                    }
                }
                
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
                    case 'section2-duplicates':
                        if (typeof loadDuplicatesAnalysis === 'function') {
                            loadDuplicatesAnalysis();
                        } else {
                            console.warn('⚠️ loadDuplicatesAnalysis לא זמין');
                        }
                        break;
                    case 'section3':
                        if (typeof loadLocalFunctionsAnalysis === 'function') {
                            loadLocalFunctionsAnalysis();
                        } else {
                            console.warn('⚠️ loadLocalFunctionsAnalysis לא זמין');
                        }
                        break;
                    case 'section7':
                        if (window.jsMapSystem) {
                            window.jsMapSystem.loadIntegrationStatus();
                        } else {
                            console.warn('⚠️ jsMapSystem לא זמין');
                        }
                        break;
                    case 'section8':
                        if (typeof loadArchitectureCheck === 'function') {
                            loadArchitectureCheck();
                        } else {
                            console.warn('⚠️ loadArchitectureCheck לא זמין');
                        }
                        break;
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe sections
    ['section2-duplicates', 'section3', 'section7'].forEach(sectionId => {
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
        
        // Initialize IndexedDB integration
        setTimeout(initializeIndexedDBIntegration, 1500);
    });

    /**
     * Initialize IndexedDB integration
     */
    async function initializeIndexedDBIntegration() {
        try {
            if (window.jsMapIndexedDBAdapter && window.jsMapIndexedDBAdapter.isReady()) {
                console.log('✅ IndexedDB Adapter מוכן לשימוש');
                
                // טעינת היסטוריית ניתוחים
                await loadAnalysisHistory();
                
                // הוספת כפתורי ניהול אחסון
                addStorageManagementButtons();
            } else {
                console.warn('⚠️ IndexedDB Adapter לא מוכן');
            }
        } catch (error) {
            console.error('❌ שגיאה באתחול IndexedDB integration:', error);
        }
    }

    /**
     * Load and display analysis history
     */
    async function loadAnalysisHistory() {
        try {
            const history = await window.jsMapIndexedDBAdapter.loadAnalysisHistory(null, 20);
            
            if (history.length > 0) {
                console.log(`📊 נטענו ${history.length} ניתוחים מההיסטוריה`);
                
                // הצגת היסטוריה בסקשן 6 (ניהול אחסון)
                displayAnalysisHistory(history);
            }
        } catch (error) {
            console.error('❌ שגיאה בטעינת היסטוריית ניתוחים:', error);
        }
    }

    /**
     * Display analysis history
     */
    function displayAnalysisHistory(history) {
        const container = document.getElementById('storageContent');
        if (!container) {
            console.warn('⚠️ storageContent container not found');
            return;
        }

        let html = `
            <div class="analysis-history">
                <h3>📊 היסטוריית ניתוחים</h3>
                <div class="history-list">
                    ${history.map(item => `
                        <div class="history-item">
                            <div class="history-header">
                                <span class="analysis-type">${getAnalysisTypeDisplay(item.id)}</span>
                                <span class="timestamp">${formatTimestamp(item.timestamp)}</span>
                            </div>
                            <div class="history-summary">
                                ${getAnalysisSummary(item)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // הוספה לתחילת התוכן
        container.innerHTML = html + container.innerHTML;
    }

    /**
     * Get analysis type display name
     */
    function getAnalysisTypeDisplay(id) {
        if (id.startsWith('duplicates_')) return 'ניתוח כפילויות';
        if (id.startsWith('local_functions_')) return 'ניתוח פונקציות מקומיות';
        if (id.startsWith('architecture_')) return 'בדיקת ארכיטקטורה';
        if (id.startsWith('stats_')) return 'סטטיסטיקות מערכת';
        return 'ניתוח כללי';
    }

    /**
     * Format timestamp for display
     */
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('he-IL');
    }

    /**
     * Get analysis summary
     */
    function getAnalysisSummary(item) {
        if (item.summary) {
            if (item.summary.total_exact_duplicates !== undefined) {
                return `כפילויות מדויקות: ${item.summary.total_exact_duplicates}, פוטנציאליות: ${item.summary.total_potential_duplicates}`;
            }
            if (item.summary.files_analyzed !== undefined) {
                return `קבצים נסרקו: ${item.summary.files_analyzed}, בעיות: ${item.summary.total_local_function_issues}`;
            }
            if (item.total_html_files !== undefined) {
                return `קבצי HTML: ${item.total_html_files}, הפרות: ${item.violations?.length || 0}`;
            }
        }
        return 'ניתוח כללי';
    }

    /**
     * Add storage management buttons
     */
    function addStorageManagementButtons() {
        const container = document.getElementById('storageContent');
        if (!container) {
            return;
        }

        const buttonsHtml = `
            <div class="storage-management">
                <h3>🗂️ ניהול אחסון</h3>
                <div class="storage-actions">
                    <button class="action-btn" onclick="showStorageStats()">📊 סטטיסטיקות אחסון</button>
                    <button class="action-btn" onclick="cleanupOldData()">🧹 ניקוי נתונים ישנים</button>
                    <button class="action-btn" onclick="backupData()">💾 גיבוי נתונים</button>
                    <button class="action-btn" onclick="loadAnalysisHistory()">🔄 רענון היסטוריה</button>
                </div>
            </div>
        `;

        container.innerHTML = buttonsHtml + container.innerHTML;
    }

    /**
     * Show storage statistics
     */
    async function showStorageStats() {
        try {
            const stats = await window.jsMapIndexedDBAdapter.getStorageStats();
            
            const message = `
                📊 סטטיסטיקות אחסון:
                
                ניתוח כפילויות: ${stats.duplicatesAnalysis}
                ניתוח פונקציות מקומיות: ${stats.localFunctionsAnalysis}
                בדיקות ארכיטקטורה: ${stats.architectureCheck}
                סטטיסטיקות מערכת: ${stats.systemStats}
                
                סה"כ: ${stats.total} ניתוחים
                עודכן: ${new Date(stats.lastUpdated).toLocaleString('he-IL')}
            `;
            
            if (window.showNotification) {
                window.showNotification(message, 'info');
            } else {
                alert(message);
            }
        } catch (error) {
            console.error('❌ שגיאה בטעינת סטטיסטיקות אחסון:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בטעינת סטטיסטיקות אחסון', 'error');
            } else {
                alert('שגיאה בטעינת סטטיסטיקות אחסון');
            }
        }
    }

    /**
     * Cleanup old data
     */
    async function cleanupOldData() {
        try {
            const deleted = await window.jsMapIndexedDBAdapter.cleanupOldData(30); // 30 ימים
            
            if (window.showNotification) {
                window.showNotification(`נוקו ${deleted} רשומות ישנות (מעל 30 ימים)`, 'success');
            } else {
                alert(`נוקו ${deleted} רשומות ישנות (מעל 30 ימים)`);
            }
            
            // רענון היסטוריה
            await loadAnalysisHistory();
        } catch (error) {
            console.error('❌ שגיאה בניקוי נתונים ישנים:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בניקוי נתונים ישנים', 'error');
            } else {
                alert('שגיאה בניקוי נתונים ישנים');
            }
        }
    }

    /**
     * Backup data
     */
    async function backupData() {
        try {
            const backup = await window.jsMapIndexedDBAdapter.backupData();
            
            // יצירת קובץ להורדה
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `js-map-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.showNotification) {
                window.showNotification('גיבוי נתונים הושלם והורד', 'success');
            } else {
                alert('גיבוי נתונים הושלם והורד');
            }
        } catch (error) {
            console.error('❌ שגיאה בגיבוי נתונים:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בגיבוי נתונים', 'error');
            } else {
                alert('שגיאה בגיבוי נתונים');
            }
        }
    }

// Export global functions for advanced sections
window.loadDuplicatesAnalysis = loadDuplicatesAnalysis;
window.loadLocalFunctionsAnalysis = loadLocalFunctionsAnalysis;
window.loadArchitectureCheck = loadArchitectureCheck;

/**
 * Generate and copy detailed system log
 * This function creates a comprehensive log of all system interfaces and their current state
 */
async function copyDetailedLog() {
    console.log('📋 Generating detailed system log...');
    
    // Show loading message
    if (window.showNotification) {
        window.showNotification('יוצר לוג מפורט...', 'info');
    }
    
    const timestamp = new Date().toLocaleString('he-IL');
    let detailedLog = `=== לוג מפורט של מערכת JS-Map ===\n`;
    detailedLog += `זמן: ${timestamp}\n`;
    detailedLog += `URL: ${window.location.href}\n\n`;
    
    // System Status
    detailedLog += `=== סטטוס מערכת ===\n`;
    detailedLog += `User Agent: ${navigator.userAgent}\n`;
    detailedLog += `Viewport: ${window.innerWidth}x${window.innerHeight}\n`;
    detailedLog += `Language: ${navigator.language}\n`;
    detailedLog += `Online: ${navigator.onLine ? 'כן' : 'לא'}\n\n`;
    
        // JS-Map System Status
        detailedLog += `=== סטטוס מערכת JS-Map ===\n`;
        if (window.jsMapSystem) {
            detailedLog += `מערכת JS-Map: ✅ טעונה\n`;
            detailedLog += `Page Mapping: ${window.jsMapSystem.pageMapping ? Object.keys(window.jsMapSystem.pageMapping).length + ' עמודים' : '❌ לא זמין'}\n`;
            detailedLog += `Functions Data: ${window.jsMapSystem.functionsData ? Object.keys(window.jsMapSystem.functionsData).length + ' קבצים' : '❌ לא זמין'}\n`;
            detailedLog += `Global Functions Index: ${window.jsMapSystem.globalFunctionsIndex ? Object.keys(window.jsMapSystem.globalFunctionsIndex).length + ' פונקציות' : '❌ לא זמין'}\n`;
        } else {
            detailedLog += `מערכת JS-Map: ❌ לא טעונה\n`;
        }
    
    // IndexedDB Status
    detailedLog += `\n=== סטטוס IndexedDB ===\n`;
    if (window.jsMapIndexedDBAdapter) {
        try {
            const stats = await window.jsMapIndexedDBAdapter.getStatistics();
            detailedLog += `מסד נתונים: ✅ זמין\n`;
            detailedLog += `סך רשומות: ${stats.totalRecords}\n`;
            detailedLog += `גודל נתונים: ${(stats.totalSize / 1024).toFixed(2)} KB\n`;
            detailedLog += `תאריך עדכון אחרון: ${stats.lastUpdated}\n`;
        } catch (error) {
            detailedLog += `מסד נתונים: ❌ שגיאה - ${error.message}\n`;
        }
    } else {
        detailedLog += `מסד נתונים: ❌ לא זמין\n`;
    }
    
    // Section Visibility Status
    detailedLog += `\n=== סטטוס תצוגת סקשנים ===\n`;
    const sections = ['section1', 'section2', 'section2-duplicates', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const isVisible = section.style.display !== 'none';
            const body = section.querySelector('.section-body');
            const hasContent = body && body.children.length > 0;
            detailedLog += `${sectionId}: ${isVisible ? '✅ גלוי' : '❌ מוסתר'} | תוכן: ${hasContent ? '✅' : '❌'}\n`;
        } else {
            detailedLog += `${sectionId}: ❌ לא קיים\n`;
        }
    });
    
        // API Endpoints Status
        detailedLog += `\n=== סטטוס API Endpoints ===\n`;
        const endpoints = [
            '/api/js-map/page-mapping',
            '/api/js-map/functions',
            '/api/js-map/analyze-duplicates',
            '/api/js-map/detect-local-functions',
            '/api/js-map/architecture-check',
            '/api/page-scripts-matrix/scan-results'
        ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, { method: 'HEAD' });
            detailedLog += `${endpoint}: ${response.ok ? '✅ זמין' : '❌ שגיאה ' + response.status}\n`;
        } catch (error) {
            detailedLog += `${endpoint}: ❌ לא זמין - ${error.message}\n`;
        }
    }
    
    // Console Errors
    detailedLog += `\n=== שגיאות JavaScript (10 האחרונות) ===\n`;
    if (window.consoleErrors) {
        window.consoleErrors.slice(-10).forEach(error => {
            detailedLog += `${error.timestamp}: ${error.message}\n`;
            if (error.stack) {
                detailedLog += `Stack: ${error.stack.substring(0, 200)}...\n`;
            }
        });
    } else {
        detailedLog += `אין מעקב אחר שגיאות JavaScript\n`;
    }
    
    // Network Status
    detailedLog += `\n=== סטטוס רשת ===\n`;
    if ('connection' in navigator) {
        const connection = navigator.connection;
        detailedLog += `חיבור: ${connection.effectiveType || 'לא זמין'}\n`;
        detailedLog += `מהירות: ${connection.downlink || 'לא זמין'} Mbps\n`;
        detailedLog += `RTT: ${connection.rtt || 'לא זמין'} ms\n`;
    } else {
        detailedLog += `מידע חיבור: לא זמין בדפדפן זה\n`;
    }
    
    // Memory Usage (if available)
    if ('memory' in performance) {
        detailedLog += `\n=== שימוש בזיכרון ===\n`;
        detailedLog += `זיכרון משומש: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
        detailedLog += `זיכרון כולל: ${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
        detailedLog += `זיכרון מקסימלי: ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n`;
    }
    
    // Always show modal for manual copying - more reliable than clipboard API
    console.log('🔄 Showing log modal for manual copying...');
    showLogModal(detailedLog);
    
    console.log('📋 Detailed System Log:');
    console.log(detailedLog);
}

// Make copyDetailedLog globally available
window.copyDetailedLog = copyDetailedLog;

/**
 * Show log in modal with copy functionality
 */
function showLogModal(logText) {
    // Remove existing modal if any
    const existingModal = document.getElementById('logModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'logModal';
    modal.className = 'log-modal-overlay';
        modal.innerHTML = `
            <div class="log-modal-content">
                <div class="log-modal-header">
                    <h3>📋 לוג מפורט של מערכת JS-Map</h3>
                    <button class="log-modal-close" onclick="closeLogModal()">&times;</button>
                </div>
                <div class="log-modal-body">
                    <div class="log-actions">
                        <button class="log-copy-btn" onclick="copyFromModal()">
                            <i class="fas fa-copy"></i> העתק ללוח
                        </button>
                        <button class="log-download-btn" onclick="downloadLog()">
                            <i class="fas fa-download"></i> הורד כקובץ
                        </button>
                    </div>
                    <div class="log-instructions">
                        <p><strong>הוראות:</strong> הטקסט נבחר אוטומטית. אם ההעתקה האוטומטית לא עובדת, השתמש ב-<kbd>Cmd+C</kbd> (Mac) או <kbd>Ctrl+C</kbd> (Windows/Linux) להעתקה ידנית.</p>
                    </div>
                    <textarea id="logTextarea" readonly class="log-textarea">${logText}</textarea>
                </div>
            </div>
        `;
    
    document.body.appendChild(modal);
    
    // Auto-select text for easy copying
    const textarea = document.getElementById('logTextarea');
    textarea.focus();
    textarea.select();
}

/**
 * Close log modal
 */
function closeLogModal() {
    const modal = document.getElementById('logModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Copy from modal textarea
 */
function copyFromModal() {
    const textarea = document.getElementById('logTextarea');
    if (textarea) {
        console.log('🔄 Attempting to copy from modal...');
        
        // Select all text first
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        
        // Try multiple copy methods
        let copySuccess = false;
        
        // Method 1: Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    console.log('✅ Modern clipboard API successful');
                    if (window.showNotification) {
                        window.showNotification('לוג הועתק ללוח', 'success');
                    } else {
                        alert('לוג הועתק ללוח');
                    }
                    copySuccess = true;
                }).catch(error => {
                    console.warn('⚠️ Modern clipboard API failed:', error.message);
                    tryFallbackCopy();
                });
                return; // Exit early if modern API is available
            } catch (error) {
                console.warn('⚠️ Modern clipboard API not available:', error.message);
            }
        }
        
        // Method 2: Fallback with execCommand
        function tryFallbackCopy() {
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    console.log('✅ execCommand copy successful');
                    if (window.showNotification) {
                        window.showNotification('לוג הועתק ללוח', 'success');
                    } else {
                        alert('לוג הועתק ללוח');
                    }
                    copySuccess = true;
                } else {
                    throw new Error('execCommand returned false');
                }
            } catch (error) {
                console.error('❌ All copy methods failed:', error);
                if (window.showNotification) {
                    window.showNotification('הטקסט נבחר - העתק ידנית (Cmd+C או Ctrl+C)', 'info');
                } else {
                    alert('הטקסט נבחר - העתק ידנית (Cmd+C או Ctrl+C)');
                }
            }
        }
        
        // Try fallback if modern API is not available
        if (!copySuccess) {
            tryFallbackCopy();
        }
    }
}

/**
 * Download log as file
 */
function downloadLog() {
    const textarea = document.getElementById('logTextarea');
    if (textarea) {
        const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `js-map-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.showNotification) {
            window.showNotification('לוג הורד כקובץ', 'success');
        } else {
            alert('לוג הורד כקובץ');
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('logModal');
    if (modal && event.target === modal) {
        closeLogModal();
    }
});

// Make functions globally available
window.showLogModal = showLogModal;
window.closeLogModal = closeLogModal;
window.copyFromModal = copyFromModal;
window.downloadLog = downloadLog;

/**
 * Initialize error tracking for detailed logging
 */
function initializeErrorTracking() {
    console.log('🔍 Initializing error tracking...');
    
    // Initialize console errors array
    if (!window.consoleErrors) {
        window.consoleErrors = [];
    }
    
    // Override console.error to track errors
    const originalError = console.error;
    console.error = function(...args) {
        // Call original error function
        originalError.apply(console, args);
        
        // Track the error
        const errorMessage = args.join(' ');
        const errorEntry = {
            timestamp: new Date().toLocaleString('he-IL'),
            message: errorMessage,
            stack: new Error().stack
        };
        
        window.consoleErrors.push(errorEntry);
        
        // Keep only last 50 errors
        if (window.consoleErrors.length > 50) {
            window.consoleErrors = window.consoleErrors.slice(-50);
        }
    };
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const errorEntry = {
            timestamp: new Date().toLocaleString('he-IL'),
            message: `Unhandled Promise Rejection: ${event.reason}`,
            stack: event.reason?.stack || 'No stack trace'
        };
        
        window.consoleErrors.push(errorEntry);
        
        // Keep only last 50 errors
        if (window.consoleErrors.length > 50) {
            window.consoleErrors = window.consoleErrors.slice(-50);
        }
    });
    
    // Track global JavaScript errors
    window.addEventListener('error', function(event) {
        const errorEntry = {
            timestamp: new Date().toLocaleString('he-IL'),
            message: `JavaScript Error: ${event.message}`,
            stack: event.error?.stack || 'No stack trace',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        };
        
        window.consoleErrors.push(errorEntry);
        
        // Keep only last 50 errors
        if (window.consoleErrors.length > 50) {
            window.consoleErrors = window.consoleErrors.slice(-50);
        }
    });
    
    console.log('✅ Error tracking initialized');
}

// Initialize error tracking when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeErrorTracking);
} else {
    initializeErrorTracking();
}

