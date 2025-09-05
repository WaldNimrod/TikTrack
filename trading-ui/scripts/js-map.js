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

    // Load initial data
    this.loadJsMapData();

    this.isInitialized = true;
  }

  /**
     * Load JS map data from server
     */
  async loadJsMapData() {
    try {

      // Show loading state
      this.showLoadingState();

      // Get page mapping
      await this.loadPageMapping();

      // Get functions data
      await this.loadFunctionsData();

      // Render data
      await this.renderPageMapping();
      this.renderFunctionsData();

    } catch (_error) {
      // Error loading JS map data
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

      } else {
        // Fallback to local scanning
        // console.warn('⚠️ Server response not ok, using local scan');
        this.pageMapping = this.scanPageMappingLocally();
      }
    } catch (_error) {
      // console.warn('⚠️ Using local page mapping scan due to error:', _error);
      this.pageMapping = this.scanPageMappingLocally();
    }
  }

  /**
     * Load functions data
     */
  async loadFunctionsData() {
    try {

      const response = await fetch('/api/js-map/functions');

      if (response.ok) {
        this.functionsData = await response.json();

        // Check if we have actual function data
        // const filesWithFunctions = Object.keys(this.functionsData).filter(file =>
        //   this.functionsData[file] && this.functionsData[file].length > 0,
        // );

        // Log some sample data
        // console.log('Functions data loaded successfully');
      } else {
        // Fallback to local scanning
        // console.warn('⚠️ Server response not ok, using local scan');
        this.functionsData = this.scanFunctionsLocally();
      }
    } catch (_error) {
      // console.warn('⚠️ Using local functions scan due to error:', _error);
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
    };

    // Get all JS files - FIXED LIST
    this.jsFiles = [
      'translation-utils.js', 'data-utils.js', 'table-mappings.js',
      'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
      'alerts.js', 'active-alerts-component.js', 'trades.js', 'trade_plans.js',
      'research.js', 'executions.js', 'tickers.js', 'ticker-service.js',
      'accounts.js', 'cash_flows.js', 'notes.js', 'preferences.js',
      'database.js', 'db-extradata.js', 'constraint-manager.js',
      'js-map.js', 'js-scanner.js',
    ];

    // Get all HTML pages
    this.htmlPages = Object.keys(pageMappings);

    // Create mapping table
    this.htmlPages.forEach(page => {
      mapping[page] = pageMappings[page] || [];
    });

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

        const scanResult = await window.jsScanner.scanAllJsFiles();

        return scanResult.functions;
      } catch (error) {
        // console.warn('⚠️ Could not scan functions, using fallback structure:', error);
      }
    }

    // Fallback to sample functions structure

    functions['header-system.js'] = [
      {
        name: 'HeaderSystem',
        description: 'מערכת ראש דף מאוחדת',
        params: 'אין פרמטרים',
        returns: 'אין ערך מוחזר',
        annotations: 'מערכת ראש דף מאוחדת עם פילטרים',
        code: 'class HeaderSystem {\n  constructor() {\n    this.isInitialized = false;\n  }\n}',
        line: 1,
        type: 'class',
      },
    ];

    functions['main.js'] = [
      {
        name: 'initializeApp',
        description: 'אתחול האפליקציה הראשי',
        params: 'אין פרמטרים',
        returns: 'אין ערך מוחזר',
        annotations: 'פונקציה ראשית לאתחול האפליקציה',
        code: 'function initializeApp() {\n  // App initialized\n}',
        line: 1,
        type: 'function',
      },
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
  async scanFunctionCalls() {

    // Try to use the JS scanner for real data
    if (window.jsScanner) {
      try {

        const scanResult = await window.jsScanner.scanFunctionCalls();

        return scanResult.counts;
      } catch (error) {
        // console.warn('⚠️ Could not scan function calls, using fallback data:', error);
      }
    }

    // Fallback to static data

    const functionCallCounts = {};

    // Initialize counts for all JS files
    this.jsFiles.forEach(file => {
      functionCallCounts[file] = 0;
    });

    // Sample function call data - in a real implementation, this would scan all files
    // For now, we'll use a static mapping based on common patterns
    const sampleFunctionCalls = {
      'header-system.js': 45,  // Most used - header system functions

      'ui-utils.js': 32,       // UI utility functions
      'main.js': 15,           // Main app functions
      'trades.js': 28,         // Trade-specific functions
      'alerts.js': 22,         // Alert functions
      'tickers.js': 25,        // Ticker functions
      'accounts.js': 18,       // Account functions
      'cash_flows.js': 16,     // Cash flow functions
      'notes.js': 14,          // Note functions
      'preferences.js': 12,    // Preference functions
      'database.js': 20,       // Database functions
      'db-extradata.js': 15,   // Extra data functions
      'constraint-manager.js': 8, // Constraint functions

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
      'active-alerts-component.js': 8, // Active alerts component
      'trade_plans.js': 18,    // Trade plans functions
      'research.js': 16,       // Research functions
      'executions.js': 14,     // Execution functions
      'ticker-service.js': 12, // Ticker service functions
      'console-cleanup.js': 3,  // Console cleanup functions
    };

    // Update counts with sample data
    Object.keys(sampleFunctionCalls).forEach(file => {
      if (Object.prototype.hasOwnProperty.call(functionCallCounts, file)) {
        functionCallCounts[file] = sampleFunctionCalls[file];
      }
    });

    return functionCallCounts;
  }

  /**
     * Render page mapping table
     */
  async renderPageMapping() {
    const container = document.getElementById('pageMappingContent');
    if (!container) {return;}

    // Sort JS files by generality (most general first)
    const sortedJsFiles = this.sortJsFilesByGenerality();

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
    return `<td class="js-file-cell function-call-count ${colorClass}">${count}</td>`;
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

  }

  /**
     * Render functions data
     */
  renderFunctionsData() {
    const container = document.getElementById('functionsContent');
    if (!container) {return;}

    let html = '';

    Object.keys(this.functionsData).forEach(file => {
      const functions = this.functionsData[file];

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

  }

  /**
     * Sort JS files by generality (most general first)
     */
  sortJsFilesByGenerality() {
    const generalityOrder = [
      // Most general files first
      'translation-utils.js', 'data-utils.js', 'table-mappings.js',
      'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
      // Specific page files
      'alerts.js', 'active-alerts-component.js', 'trades.js', 'trade_plans.js',
      'research.js', 'executions.js', 'tickers.js', 'ticker-service.js',
      'accounts.js', 'cash_flows.js', 'notes.js', 'preferences.js',
      'database.js', 'db-extradata.js', 'constraint-manager.js',
      'currencies.js', 'auth.js',
    ];

    return generalityOrder.filter(file => this.jsFiles.includes(file));
  }

  /**
     * Show loading state
     */
  static showLoadingState() {
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
  static showErrorState(message) {
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

    } catch (error) {
      // Error refreshing JS map data
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

  // Get function details from scanner
  if (window.jsScanner) {
    const functionDetails = window.jsScanner.getFunctionDetails(file, functionName);
    if (functionDetails) {
      openFunctionModal(
        functionDetails.name,
        functionDetails.annotations || 'No annotations available',
        functionDetails.code || 'No code available',
      );
      return;
    }
  }

  // Fallback to basic info
  const annotations = `Function: ${functionName}\nFile: ${file}\n\nAnnotations will be loaded from actual function parsing.`;
  const code = `// Function code will be loaded from actual file scanning\nfunction ${functionName}() {\n  // Implementation details...\n}`;

  openFunctionModal(functionName, annotations, code);
}
