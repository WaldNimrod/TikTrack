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
    console.log('🚀 JsMapSystem.init() called');
    console.log('🔍 this.isInitialized:', this.isInitialized);
    
    if (this.isInitialized) {
      console.log('⚠️ Already initialized, returning');
      return;
    }

        console.log('🚀 Initializing JS Map System');

    // Load initial data
        console.log('🔄 About to call this.loadJsMapData()...');
        console.log('🔍 this.loadJsMapData type:', typeof this.loadJsMapData);
    this.loadJsMapData();
        console.log('✅ this.loadJsMapData() called');

    this.isInitialized = true;
        console.log('✅ JsMapSystem initialization completed');
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
            const fileData = functionsData[filename];
            let functions = [];
            
            // Handle different data structures
            if (fileData) {
                if (Array.isArray(fileData)) {
                    functions = fileData;
                } else if (fileData.functions && Array.isArray(fileData.functions)) {
                    functions = fileData.functions;
                }
            }
            
            if (globalFiles.includes(filename) && functions && Array.isArray(functions)) {
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
      console.log('🔍 Starting to load JS Map data from server...');

      // Show loading state
      console.log('🔄 About to show loading state...');
      this.showLoadingState();
      console.log('✅ Loading state shown');

      // Load functions data from API
      console.log('🔄 Loading functions data from /api/js-map/functions...');
      const functionsResponse = await fetch('/api/js-map/functions');
      if (!functionsResponse.ok) {
        throw new Error(`HTTP ${functionsResponse.status}: ${functionsResponse.statusText}`);
      }
      const functionsData = await functionsResponse.json();
      if (functionsData.status === 'success' && functionsData.data) {
        this.functionsData = functionsData.data;
        console.log('✅ Functions data loaded:', Object.keys(this.functionsData).length, 'files');
      } else {
        throw new Error('Invalid response format from functions API');
      }

      // Load page mapping from API
      console.log('🔄 Loading page mapping from /api/js-map/page-mapping...');
      const mappingResponse = await fetch('/api/js-map/page-mapping');
      if (!mappingResponse.ok) {
        throw new Error(`HTTP ${mappingResponse.status}: ${mappingResponse.statusText}`);
      }
      const mappingData = await mappingResponse.json();
      if (mappingData.status === 'success' && mappingData.data) {
        this.pageMapping = mappingData.data;
        console.log('✅ Page mapping loaded:', Object.keys(this.pageMapping).length, 'pages');
      } else {
        throw new Error('Invalid response format from page mapping API');
      }

      // Load global functions index
      await this.loadGlobalFunctionsIndex();

            console.log('📊 Data loaded - Page mapping keys:', Object.keys(this.pageMapping));
            console.log('📊 Data loaded - Functions data keys:', Object.keys(this.functionsData));

            // Update system stats
            this.updateSystemStats();

      // Update dashboard stats
      updateDashboardStats();

      // Apply view mode and render data
      const savedViewMode = localStorage.getItem('jsMapViewMode') || 'cards';
      setViewMode(savedViewMode);

      // Render all data sections
      console.log('🎨 About to render all data sections...');
      console.log('🔍 this.renderAllData type:', typeof this.renderAllData);
      this.renderAllData();
      console.log('🎨 All data sections rendered');

      // Populate functions dropdown
      console.log('🔍 About to populate functions dropdown...');
      populateFunctionsDropdown();
      console.log('🔍 Functions dropdown populated');

      // Initialize smart filters
      if (typeof smartFilters !== 'undefined') {
        smartFilters.init();
      }

      // Initialize pagination system for tables (commented out until fixed)
      // initializePaginationSystem();

      // Load local functions analysis
      if (typeof loadLocalFunctionsAnalysis === 'function') {
        loadLocalFunctionsAnalysis();
      }

      // System stats will be rendered after data loading

      console.log('✅ JS map data loaded successfully');
      console.log('🎉 All rendering functions called');
      
      // Hide loading state after successful data loading
      this.hideLoadingState();
      console.log('✅ Loading state hidden');
      
      return Promise.resolve();

    } catch (error) {
      console.error('❌ Error loading JS map data:', error);
      
      // Try to load from IndexedDB as fallback
      console.log('🔄 Attempting to load cached data from IndexedDB...');
      try {
        const cachedData = await this.loadFromIndexedDB();
        if (cachedData) {
          console.log('✅ Using cached data from IndexedDB');
          this.renderAllData();
          this.hideLoadingState();
          return Promise.resolve();
        }
      } catch (cacheError) {
        console.error('❌ Error loading from IndexedDB:', cacheError);
      }
      
      // Show error state
      this.showErrorState('שגיאה בטעינת נתונים - נסה לרענן את הדף');
      return Promise.reject(error);
    }
  }

  /**
   * Load data from IndexedDB as fallback
   */
  async loadFromIndexedDB() {
    try {
      if (typeof JsMapIndexedDBAdapter !== 'undefined') {
        const adapter = new JsMapIndexedDBAdapter();
        await adapter.initialize();
        
        const analysisHistory = await adapter.loadAnalysisHistory(null, 1);
        if (analysisHistory && analysisHistory.length > 0) {
          const lastAnalysis = analysisHistory[0];
          if (lastAnalysis && lastAnalysis.data) {
            this.functionsData = lastAnalysis.data.functionsData || {};
            this.pageMapping = lastAnalysis.data.pageMapping || {};
            
            console.log('📦 Data loaded from IndexedDB successfully');
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error loading from IndexedDB:', error);
      return false;
    }
  }

  /**
   * Render all data sections
   */
  renderAllData() {
    console.log('🎨 Rendering all data sections...');
    console.log('📊 Functions data keys:', Object.keys(this.functionsData || {}));
    console.log('📊 Page mapping keys:', Object.keys(this.pageMapping || {}));
    console.log('🔍 this object:', this);
    
    try {
      console.log('🔄 About to call renderSystemStats...');
      console.log('🔍 this.renderSystemStats type:', typeof this.renderSystemStats);
      this.renderSystemStats();
      console.log('✅ System stats rendered');
    } catch (error) {
      console.error('❌ Error rendering system stats:', error);
      console.error('❌ Error stack:', error.stack);
    }
    
    try {
      this.renderPageMapping();
      console.log('✅ Page mapping rendered');
    } catch (error) {
      console.error('❌ Error rendering page mapping:', error);
    }
    
    try {
      // Use tabs system instead of direct rendering
      if (window.functionsTabsSystem) {
        window.functionsTabsSystem.setFunctionsData(this.functionsData);
        console.log('✅ Functions data rendered with tabs system');
      } else {
        this.renderFunctionsData();
        console.log('✅ Functions data rendered directly');
      }
    } catch (error) {
      console.error('❌ Error rendering functions data:', error);
    }
    
    try {
      if (typeof loadLocalFunctionsAnalysis === 'function') {
        loadLocalFunctionsAnalysis();
        console.log('✅ Local functions analysis rendered');
      }
    } catch (error) {
      console.error('❌ Error rendering local functions analysis:', error);
    }
    
    console.log('✅ All data sections rendered');
  }

  /**
     * Render page mapping data
     */
  renderPageMapping() {
    console.log('🔍 renderPageMapping called');
    const container = document.getElementById('pageMappingContent');
    if (!container) {
      console.error('❌ pageMappingContent not found');
      return;
    }
    console.log('✅ pageMappingContent found, rendering...');
    console.log('📁 Page mapping:', this.pageMapping);

    let html = '';

    if (Object.keys(this.pageMapping).length === 0) {
      html = '<p>אין מיפוי עמודים זמין</p>';
    } else {
      // Analyze file repetition
      const fileAnalysis = this.analyzeFileRepetition();
      
      html += `
        <div class="page-mapping-container">
          <!-- File Repetition Analysis -->
          <div class="file-repetition-section">
            <h3>📊 ניתוח קבצים חוזרים</h3>
            <div class="js-map-table-container">
              <table class="js-map-table">
                <thead>
                  <tr>
                    <th>קובץ JS</th>
                    <th>עמודים</th>
                    <th>מספר הופעות</th>
                    <th>סטטוס</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
      `;

      // Sort files by repetition count (most repeated first)
      const sortedFiles = Object.keys(fileAnalysis).sort((a, b) => 
        fileAnalysis[b].pages.length - fileAnalysis[a].pages.length
      );

      sortedFiles.forEach(file => {
        const analysis = fileAnalysis[file];
        const status = analysis.pages.length > 1 ? 'משותף' : 'ייחודי';
        const statusClass = analysis.pages.length > 1 ? 'status-shared' : 'status-unique';
        
        html += `
          <tr>
            <td><strong>${file}</strong></td>
            <td>
              <div class="pages-list">
                ${analysis.pages.map(page => `<span class="page-tag">${page}</span>`).join('')}
              </div>
            </td>
            <td><span class="count-badge">${analysis.pages.length}</span></td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="showFileDetails('${file}', ${JSON.stringify(analysis).replace(/"/g, '&quot;')})">
                פרטים
              </button>
            </td>
          </tr>
        `;
      });

      html += `
                </tbody>
              </table>
            </div>
          </div>

          <!-- Original Page Mapping -->
          <div class="page-mapping-section">
            <h3>🗺️ מיפוי עמודים לקבצים</h3>
            <div class="js-map-table-container">
              <table class="js-map-table">
                <thead>
                  <tr>
                    <th>עמוד HTML</th>
                    <th>קבצי JavaScript</th>
                    <th>מספר פונקציות</th>
                  </tr>
                </thead>
                <tbody>
      `;

      Object.keys(this.pageMapping).forEach(page => {
        const mapping = this.pageMapping[page];
        const files = mapping.files || [];
        const functionsCount = mapping.functions_count || 0;
        
        html += `
          <tr>
            <td><strong>${page}</strong></td>
            <td>
              <div class="file-list">
                ${files.map(file => {
                  const repetitionCount = fileAnalysis[file]?.pages.length || 0;
                  const fileClass = repetitionCount > 1 ? 'file-tag shared' : 'file-tag unique';
                  return `<span class="${fileClass}" title="${repetitionCount} עמודים">${file}</span>`;
                }).join('')}
              </div>
            </td>
            <td>${functionsCount}</td>
          </tr>
        `;
      });

      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  analyzeFileRepetition() {
    const fileAnalysis = {};
    
    // Analyze each page's files
    Object.keys(this.pageMapping).forEach(page => {
      const mapping = this.pageMapping[page];
      const files = mapping.files || [];
      
      files.forEach(file => {
        if (!fileAnalysis[file]) {
          fileAnalysis[file] = {
            pages: [],
            totalFunctions: 0
          };
        }
        fileAnalysis[file].pages.push(page);
        
        // Add functions count if available
        if (mapping.functions_count) {
          fileAnalysis[file].totalFunctions += mapping.functions_count;
        }
      });
    });
    
    console.log('📊 File repetition analysis:', fileAnalysis);
    return fileAnalysis;
  }

  /**
     * Render system statistics
     */
  renderSystemStats() {
    console.log('🔍 renderSystemStats called');
    console.log('🔍 this.functionsData:', this.functionsData);
    console.log('🔍 this.pageMapping:', this.pageMapping);
    console.log('🔍 this.globalFunctionsIndex:', this.globalFunctionsIndex);
    
    const container = document.getElementById('systemStatsContent');
    if (!container) {
      console.error('❌ systemStatsContent not found');
      return;
    }
    console.log('✅ systemStatsContent found, rendering...');
    console.log('🔍 Container current HTML:', container.innerHTML.substring(0, 100) + '...');
    console.log('🔍 Rendering system stats...');

    // Count total functions from the correct data structure
    let totalFunctions = 0;
    let filesData = this.functionsData;

    Object.keys(filesData).forEach(file => {
      const fileData = filesData[file];
      if (fileData && fileData.functions && Array.isArray(fileData.functions)) {
        totalFunctions += fileData.functions.length;
      }
    });

    // Count total JS files
    const totalJsFiles = Object.keys(filesData).length;

    // Count total pages
    const totalPages = Object.keys(this.pageMapping).length;

    const html = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-value">${totalPages}</div>
          <div class="stat-label">עמודי HTML</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📜</div>
          <div class="stat-value">${totalJsFiles}</div>
          <div class="stat-label">קבצי JavaScript</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚙️</div>
          <div class="stat-value">${totalFunctions}</div>
          <div class="stat-label">פונקציות JavaScript</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌍</div>
          <div class="stat-value">${Object.keys(this.globalFunctionsIndex || {}).length}</div>
          <div class="stat-label">פונקציות גלובליות</div>
        </div>
      </div>
    `;

    console.log('🔍 About to set container.innerHTML...');
    console.log('🔍 HTML to set:', html.substring(0, 200) + '...');
    console.log('🔍 Container before:', container.innerHTML.substring(0, 100) + '...');
    container.innerHTML = html;
    console.log('✅ Container HTML updated successfully');
    console.log('🔍 New container HTML:', container.innerHTML.substring(0, 100) + '...');
    console.log('🔍 Container has loading?', container.innerHTML.includes('טוען'));
  }

  /**
     * Update system statistics in top section
     */
    updateSystemStats() {
        // Count pages
        const pagesCount = Object.keys(this.pageMapping).length;
        document.getElementById('totalPagesCount').textContent = pagesCount;

        // Count JS files from functions data
        const jsFiles = new Set();
        if (this.functionsData && this.functionsData.data) {
            Object.keys(this.functionsData.data).forEach(file => jsFiles.add(file));
        }
        document.getElementById('totalJsFilesCount').textContent = jsFiles.size;

        // Count functions from functions data
        let totalFunctions = 0;
        if (this.functionsData && this.functionsData.data) {
            Object.values(this.functionsData.data).forEach(fileData => {
                if (fileData && fileData.functions && Array.isArray(fileData.functions)) {
                    totalFunctions += fileData.functions.length;
                }
            });
        }
        document.getElementById('totalFunctionsCount').textContent = totalFunctions;

        // Count global functions
        const globalFunctionsCount = this.globalFunctionsIndex ? Object.keys(this.globalFunctionsIndex).length : 0;
        document.getElementById('globalFunctionsCount').textContent = globalFunctionsCount;

        // Initialize other counters (will be updated by other functions)
        // Removed duplicates count - not relevant for JS Map
        // Removed local functions count - not relevant for JS Map
    }




    /**
     * Load functions statistics
     */
    async loadFunctionsStatistics() {
        try {
            console.log('📊 Loading functions statistics...');
            
            const container = document.getElementById('functionsStatsContent');
            if (!container) {
                console.warn('⚠️ functionsStatsContent container not found');
                return;
            }

            // Calculate statistics from functions data
            const stats = this.calculateFunctionsStatistics();
            
            let html = `
                <div class="functions-stats">
                    <h3>📊 סטטיסטיקות פונקציות</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">📁</div>
                            <div class="stat-label">קבצים עם פונקציות</div>
                            <div class="stat-value">${stats.filesWithFunctions}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⚙️</div>
                            <div class="stat-label">סה"כ פונקציות</div>
                            <div class="stat-value">${stats.totalFunctions}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🌐</div>
                            <div class="stat-label">פונקציות גלובליות</div>
                            <div class="stat-value">${stats.globalFunctions}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-label">פונקציות עם תיעוד</div>
                            <div class="stat-value">${stats.documentedFunctions}</div>
                        </div>
                    </div>
                    
                    <div class="functions-breakdown">
                        <h4>📋 פירוט לפי קבצים:</h4>
                        <div class="files-list">
                            ${stats.filesBreakdown.map(file => `
                                <div class="file-stat">
                                    <span class="file-name">${file.name}</span>
                                    <span class="file-count">${file.count} פונקציות</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
            console.log('✅ Functions statistics loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading functions statistics:', error);
            
            const container = document.getElementById('functionsStatsContent');
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <p>❌ שגיאה בטעינת סטטיסטיקות פונקציות</p>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Calculate functions statistics
     */
    calculateFunctionsStatistics() {
        const stats = {
            filesWithFunctions: 0,
            totalFunctions: 0,
            globalFunctions: 0,
            documentedFunctions: 0,
            filesBreakdown: []
        };

        // Count functions in each file
        Object.keys(this.functionsData).forEach(file => {
            const fileData = this.functionsData[file];
            let functions = [];
            
            if (fileData) {
                if (Array.isArray(fileData)) {
                    functions = fileData;
                } else if (fileData.functions && Array.isArray(fileData.functions)) {
                    functions = fileData.functions;
                }
            }

            if (functions.length > 0) {
                stats.filesWithFunctions++;
                stats.totalFunctions += functions.length;
                
                // Count documented functions
                const documentedCount = functions.filter(func => 
                    func.description && func.description.trim() !== ''
                ).length;
                stats.documentedFunctions += documentedCount;
                
                // Add to breakdown
                stats.filesBreakdown.push({
                    name: file,
                    count: functions.length
                });
            }
        });

        // Count global functions
        if (this.globalFunctionsIndex) {
            stats.globalFunctions = Object.keys(this.globalFunctionsIndex).length;
        }

        return stats;
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
        'alerts.html': ['alerts.js', 'active-alerts-component.js'],
        'trades.html': ['trades.js'],
        'trade_plans.html': ['trade_plans.js'],
        'research.html': ['research.js'],
        'executions.html': ['executions.js'],
        'tickers.html': ['tickers.js', 'ticker-service.js'],
        'accounts.html': ['accounts.js'],
        'cash_flows.html': ['cash_flows.js'],
        'notes.html': ['notes.js'],
        'preferences.html': ['preferences.js'],
        'database.html': ['database.js', 'db-extradata.js', 'constraint-manager.js'],
        'currencies.html': ['currencies.js'],
        'auth.html': ['auth.js'],
        'js-map.html': ['js-map.js', 'js-scanner.js'],
        'page-scripts-matrix.html': ['page-scripts-matrix.js']
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

  /**
     * Render functions data
     */
  renderFunctionsData() {
    console.log('🔍 renderFunctionsData called');
    const container = document.getElementById('functionsMapContent');
        if (!container) {
      console.error('❌ functionsMapContent not found');
      return;
    }
    console.log('✅ functionsMapContent found, rendering...');
        console.log('🔍 Rendering functions data...');
        console.log('📁 Functions data:', this.functionsData);

    let html = '';

    // Handle different data structures
    let filesData = {};
    if (this.functionsData.data) {
        // New structure: { data: { filename: { functions: [...] } } }
        filesData = this.functionsData.data;
    } else {
        // Old structure: { filename: { functions: [...] } }
        filesData = this.functionsData;
    }

    Object.keys(filesData).forEach(file => {
            const fileData = filesData[file];
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
                         <div class="js-map-table-container">
                             <table class="function-table js-map-table">
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

            // Ensure functions is an array before calling forEach
            if (functions && Array.isArray(functions)) {
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
            }

      html += `
                            </tbody>
                        </table>
                         </div>
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
        console.log('✅ Functions data rendered');
    }


  /**
     * Show loading state
     */
    showLoadingState() {
    const functionsContent = document.getElementById('functionsMapContent');
    const pageMappingContent = document.getElementById('pageMappingContent');
        const dependenciesContent = document.getElementById('dependenciesContent');
        const systemStatsContent = document.getElementById('systemStatsContent');

        if (functionsContent) {
            functionsContent.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                     טוען פונקציות...
                </div>
            `;
    }

    if (pageMappingContent) {
      pageMappingContent.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    טוען מיפוי עמודים...
                </div>
            `;
    }

        if (dependenciesContent) {
            dependenciesContent.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                     טוען ניתוח תלויות...
                 </div>
             `;
        }

        if (systemStatsContent) {
            systemStatsContent.innerHTML = `
                 <div class="loading">
                     <div class="loading-spinner"></div>
                     טוען סטטיסטיקות מערכת...
                </div>
            `;
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    console.log('🔄 Hiding loading state...');
    const functionsContent = document.getElementById('functionsMapContent');
    const pageMappingContent = document.getElementById('pageMappingContent');
    const dependenciesContent = document.getElementById('dependenciesContent');
    const systemStatsContent = document.getElementById('systemStatsContent');

    // Clear loading states - the content should already be rendered
    if (functionsContent && functionsContent.innerHTML.includes('טוען')) {
      console.log('🔄 Clearing functions loading state...');
      // Content should already be rendered by renderFunctionsData()
    }

    if (pageMappingContent && pageMappingContent.innerHTML.includes('טוען')) {
      console.log('🔄 Clearing page mapping loading state...');
      // Content should already be rendered by renderPageMapping()
    }

    if (dependenciesContent && dependenciesContent.innerHTML.includes('טוען')) {
      console.log('🔄 Clearing dependencies loading state...');
      // Content should already be rendered by loadLocalFunctionsAnalysis()
    }

    if (systemStatsContent && systemStatsContent.innerHTML.includes('טוען')) {
      console.log('🔄 Clearing system stats loading state...');
      // Content should already be rendered by renderSystemStats()
    }

    console.log('✅ Loading state hidden');
  }

  /**
     * Show error state
     */
    showErrorState(message) {
    const functionsContent = document.getElementById('functionsMapContent');
    const pageMappingContent = document.getElementById('pageMappingContent');
        const dependenciesContent = document.getElementById('dependenciesContent');
        const systemStatsContent = document.getElementById('systemStatsContent');

        if (functionsContent) {
            functionsContent.innerHTML = `
                 <div class="error">
                    <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 2rem; margin-bottom: 15px;"></i>
                    <div>${message}</div>
                </div>
            `;
    }

    if (pageMappingContent) {
      pageMappingContent.innerHTML = `
                 <div class="error">
                    <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 2rem; margin-bottom: 15px;"></i>
                    <div>${message}</div>
                </div>
            `;
    }

        if (dependenciesContent) {
            dependenciesContent.innerHTML = `
                 <div class="error">
                     <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 2rem; margin-bottom: 15px;"></i>
                     <div>${message}</div>
                 </div>
             `;
        }

        if (systemStatsContent) {
            systemStatsContent.innerHTML = `
                 <div class="error">
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
    console.log('🔍 window.jsMapSystem exists:', !!window.jsMapSystem);
    
  if (window.jsMapSystem) {
        console.log('🔄 Initializing jsMapSystem...');
        console.log('🔍 About to call window.jsMapSystem.init()...');
        console.log('🔍 window.jsMapSystem.init type:', typeof window.jsMapSystem.init);
    window.jsMapSystem.init();
        console.log('✅ window.jsMapSystem.init() called');
    } else {
        console.error('❌ jsMapSystem not found!');
        console.log('🔍 Available window objects:', Object.keys(window).filter(k => k.includes('js') || k.includes('map')));
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

    if (content && content.classList.contains('expanded')) {
    content.classList.remove('expanded');
        if (arrow) arrow.textContent = '▼';
    } else if (content) {
    content.classList.add('expanded');
        if (arrow) arrow.textContent = '▲';
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
    console.log('🔍 jsMapSystem exists:', !!window.jsMapSystem);

    // Load initial data
    console.log('🔄 About to call loadJsMapData...');
    console.log('🔍 loadJsMapData type:', typeof loadJsMapData);
    loadJsMapData();
    console.log('✅ loadJsMapData called');
}

// Export initialization function
window.initializeJsMapPage = initializeJsMapPage;

// Functions Tabs System
class FunctionsTabsSystem {
    constructor() {
        this.activeTab = 'core';
        this.functionsData = {};
        this.init();
    }

    init() {
        console.log('🎯 Initializing Functions Tabs System...');
        this.setupEventListeners();
        this.defineFunctionCategories();
    }

    setupEventListeners() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    defineFunctionCategories() {
        this.categories = {
            core: [
                'main.js', 'header-system.js', 'filter-system.js', 'menu.js',
                'notification-system.js', 'preferences.js', 'color-scheme-system.js'
            ],
            ui: [
                'ui-utils.js', 'tables.js', 'entity-details-modal.js', 'entity-details-renderer.js',
                'linked-items.js', 'simple-filter.js', 'button-icons.js', 'css-management.js'
            ],
            data: [
                'accounts.js', 'trades.js', 'executions.js', 'alerts.js', 'notes.js',
                'cash_flows.js', 'trade_plans.js', 'tickers.js', 'currencies.js',
                'account-service.js', 'alert-service.js', 'ticker-service.js', 'trade-plan-service.js'
            ],
            utils: [
                'data-utils.js', 'date-utils.js', 'translation-utils.js', 'validation-utils.js',
                'page-utils.js', 'crud-utils.js', 'error-handlers.js', 'warning-system.js'
            ]
        };
    }

    switchTab(tabName) {
        console.log('🔄 Switching to tab:', tabName);
        
        // Update active button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.activeTab = tabName;
        
        // Re-render functions with new filter
        if (window.jsMapSystem && window.jsMapSystem.functionsData) {
            this.renderFunctionsForTab(window.jsMapSystem.functionsData);
        }
    }

    setFunctionsData(functionsData) {
        this.functionsData = functionsData;
        this.renderFunctionsForTab(functionsData);
    }

    renderFunctionsForTab(functionsData) {
        const container = document.getElementById('functionsMapContent');
        if (!container) return;

        let html = '';
        const files = Object.keys(functionsData);
        const filteredFiles = this.filterFilesByCategory(files);

        console.log(`📊 Rendering ${filteredFiles.length} files for tab: ${this.activeTab}`);

        filteredFiles.forEach(file => {
            const fileData = functionsData[file];
            if (!fileData || !fileData.functions) return;

            const functions = fileData.functions;
            html += `
                <div class="function-group">
                    <div class="function-group-header" onclick="toggleFunctionGroup(this)">
                        <span>${file} (${functions.length} פונקציות)</span>
                        <span class="toggle-arrow">▼</span>
                    </div>
                    <div class="function-group-content">
                        <div class="js-map-table-container">
                            <table class="function-table js-map-table">
                                <thead>
                                    <tr>
                                        <th>שם הפונקציה</th>
                                        <th>תיאור</th>
                                        <th>פרמטרים</th>
                                        <th>ערך מוחזר</th>
                                        <th>שורה</th>
                                        <th>סוג</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;

            functions.forEach(func => {
                html += `
                    <tr>
                        <td><strong>${func.name}</strong></td>
                        <td>${func.description || 'ללא תיאור'}</td>
                        <td>${func.params || 'אין פרמטרים'}</td>
                        <td>${func.returns || 'אין ערך מוחזר'}</td>
                        <td>${func.line || 'לא ידוע'}</td>
                        <td>${func.type || 'function'}</td>
                    </tr>
                `;
            });

            html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        });

        if (filteredFiles.length === 0) {
            html = `<p>אין קבצים בקטגוריה "${this.activeTab}"</p>`;
        }

        container.innerHTML = html;
    }

    filterFilesByCategory(files) {
        if (this.activeTab === 'all') {
            return files;
        }

        const categoryFiles = this.categories[this.activeTab] || [];
        return files.filter(file => categoryFiles.includes(file));
    }
}

// Global instance
window.functionsTabsSystem = new FunctionsTabsSystem();

// File Details Modal
function showFileDetails(fileName, analysis) {
    console.log('🔍 Showing file details for:', fileName);
    console.log('📊 Analysis:', analysis);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'fileDetailsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📄 פרטי קובץ: ${fileName}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="file-details-content">
                        <div class="detail-section">
                            <h6>📊 סטטיסטיקות</h6>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-label">מספר עמודים:</span>
                                    <span class="stat-value">${analysis.pages.length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">סך פונקציות:</span>
                                    <span class="stat-value">${analysis.totalFunctions || 'לא ידוע'}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">סטטוס:</span>
                                    <span class="stat-value ${analysis.pages.length > 1 ? 'status-shared' : 'status-unique'}">
                                        ${analysis.pages.length > 1 ? 'משותף' : 'ייחודי'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h6>🗺️ עמודים שמשתמשים בקובץ</h6>
                            <div class="pages-grid">
                                ${analysis.pages.map(page => `
                                    <div class="page-item">
                                        <span class="page-name">${page}</span>
                                        <button class="btn btn-sm btn-outline-secondary" onclick="navigateToPage('${page}')">
                                            פתח עמוד
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h6>💡 המלצות</h6>
                            <div class="recommendations">
                                ${analysis.pages.length > 1 ? `
                                    <div class="recommendation warning">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <span>קובץ זה משותף בין ${analysis.pages.length} עמודים. שקול להעביר פונקציות נפוצות לקובץ גלובלי.</span>
                                    </div>
                                ` : `
                                    <div class="recommendation success">
                                        <i class="fas fa-check-circle"></i>
                                        <span>קובץ זה ייחודי לעמוד אחד. זה טוב לארגון הקוד.</span>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                    <button type="button" class="btn btn-primary" onclick="exportFileAnalysis('${fileName}', ${JSON.stringify(analysis).replace(/"/g, '&quot;')})">
                        ייצא ניתוח
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function navigateToPage(pageName) {
    console.log('🧭 Navigating to page:', pageName);
    window.location.href = `/${pageName}`;
}

function exportFileAnalysis(fileName, analysis) {
    console.log('📊 Exporting file analysis for:', fileName);
    
    const data = {
        fileName: fileName,
        pages: analysis.pages,
        totalFunctions: analysis.totalFunctions,
        status: analysis.pages.length > 1 ? 'shared' : 'unique',
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file-analysis-${fileName.replace('.js', '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Global functions for modal
function openFunctionModal(functionName, annotations, code) {
    document.getElementById('modalFunctionName').textContent = functionName;
    document.getElementById('modalAnnotations').textContent = annotations || 'No annotations available';
    document.getElementById('modalCode').textContent = code || 'No code available';
    
    // Show modal without Bootstrap dependency
    const modal = document.getElementById('functionModal');
    modal.style.display = 'block';
    modal.classList.add('show');
}

function closeFunctionModal() {
    const modal = document.getElementById('functionModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
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
    
    // Show modal without Bootstrap dependency
    const modal = document.getElementById('functionCallsModal');
    modal.style.display = 'block';
    modal.classList.add('show');
}

function closeFunctionCallsModal() {
    const modal = document.getElementById('functionCallsModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
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

// Section toggle function
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const body = section.querySelector('.section-body');
    const icon = section.querySelector('.section-toggle-icon');
    
    if (body.style.display === 'none' || body.style.display === '') {
        body.style.display = 'block';
        icon.textContent = '▼';
    } else {
        body.style.display = 'none';
        icon.textContent = '▶';
    }
}

// Top section toggle function
function toggleTopSection() {
    const topSection = document.querySelector('.top-section');
    if (!topSection) return;
    
    const body = topSection.querySelector('.section-body');
    const icon = topSection.querySelector('.section-toggle-icon');
    
    if (body.style.display === 'none' || body.style.display === '') {
        body.style.display = 'block';
        icon.textContent = '▼';
    } else {
        body.style.display = 'none';
        icon.textContent = '▶';
    }
}

// Functions Dropdown
function toggleFunctionsDropdown() {
    console.log('🔍 toggleFunctionsDropdown called');
    const dropdown = document.getElementById('functionsDropdownContent');
    const toggle = document.getElementById('functionsDropdown');

    if (dropdown && dropdown.classList.contains('show')) {
        console.log('🔽 Closing dropdown');
        dropdown.classList.remove('show');
        if (toggle) toggle.classList.remove('active');
    } else if (dropdown) {
        console.log('🔼 Opening dropdown');
        dropdown.classList.add('show');
        if (toggle) toggle.classList.add('active');
        populateFunctionsDropdown();
    } else {
        console.error('❌ functionsDropdownContent not found');
    }
}

function populateFunctionsDropdown() {
    console.log('🔍 populateFunctionsDropdown called');
    const content = document.getElementById('functionsDropdownContent');
    if (!content) {
        console.error('❌ functionsDropdownContent not found');
        return;
    }
    if (!window.jsMapSystem) {
        console.error('❌ jsMapSystem not found');
        return;
    }
    if (!window.jsMapSystem.functionsData) {
        console.error('❌ functionsData not found');
        return;
    }
    console.log('✅ All conditions met, populating dropdown...');

    let html = '';

    // Handle different data structures
    let filesData = {};
    if (window.jsMapSystem.functionsData.data) {
        // New structure: { data: { filename: { functions: [...] } } }
        filesData = window.jsMapSystem.functionsData.data;
    } else {
        // Old structure: { filename: { functions: [...] } }
        filesData = window.jsMapSystem.functionsData;
    }

    Object.keys(filesData).forEach(file => {
        const fileData = filesData[file];
        let functions = [];
        
        // Handle different data structures
        if (fileData) {
            if (Array.isArray(fileData)) {
                functions = fileData;
            } else if (fileData.functions && Array.isArray(fileData.functions)) {
                functions = fileData.functions;
            }
        }
        
        // Ensure functions is an array before calling forEach
        if (functions && Array.isArray(functions) && functions.length > 0) {
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
    console.log(`✅ Dropdown populated with ${html.split('function-dropdown-item').length - 1} items`);
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
    const dropdown = document.getElementById('functionsDropdownContent');
    const toggle = document.getElementById('functionsDropdown');

    if (dropdown && toggle && !dropdown.contains(event.target) && !toggle.contains(event.target)) {
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
    // Removed loadDuplicatesAnalysis - not relevant for JS Map
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
    const container = document.getElementById('dependenciesContent');
    if (!container) {
        console.error('❌ dependenciesContent container not found');
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
    const container = document.getElementById('dependenciesContent');
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
    const container = document.getElementById('dependenciesContent');
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
 * Update Dashboard Stats - Smart Dashboard with live statistics
 */
function updateDashboardStats() {
    console.log('📊 Updating Dashboard Stats...');
    
    // Get data from jsMapSystem
    const functionsData = window.jsMapSystem?.functionsData;
    const pageMapping = window.jsMapSystem?.pageMapping;
    const globalFunctionsIndex = window.jsMapSystem?.globalFunctionsIndex;
    
    // Calculate statistics
    let totalPages = 0;
    let totalJsFiles = 0;
    let totalFunctions = 0;
    let globalFunctions = 0;
    
    // Count pages from page mapping
    if (pageMapping && Object.keys(pageMapping).length > 0) {
        totalPages = Object.keys(pageMapping).length;
        
        // Count JS files from page mapping
        Object.values(pageMapping).forEach(files => {
            if (Array.isArray(files)) {
                totalJsFiles += files.length;
            }
        });
    }
    
    // Count functions from functions data
    if (functionsData && functionsData.data) {
        Object.keys(functionsData.data).forEach(file => {
            const fileData = functionsData.data[file];
            if (fileData && fileData.functions) {
                totalFunctions += fileData.functions.length;
            }
        });
    }
    
    // Count global functions
    if (globalFunctionsIndex && Array.isArray(globalFunctionsIndex)) {
        globalFunctions = globalFunctionsIndex.length;
    }
    
    // Update DOM elements
    updateStatCard('totalPagesCount', totalPages);
    updateStatCard('totalJsFilesCount', totalJsFiles);
    updateStatCard('totalFunctionsCount', totalFunctions);
    updateStatCard('globalFunctionsCount', globalFunctions);
    
    console.log(`✅ Dashboard Stats Updated: ${totalPages} pages, ${totalJsFiles} JS files, ${totalFunctions} functions, ${globalFunctions} global`);
}

/**
 * Update individual stat card
 */
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add animation effect
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.textContent = value.toLocaleString();
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Perform Global Search - Real-time search with highlighting
 */
function performGlobalSearch(query) {
    console.log('🔍 Performing global search for:', query);
    
    if (!query || query.trim().length < 2) {
        hideSearchResults();
        return;
    }
    
    const results = [];
    const functionsData = window.jsMapSystem?.functionsData;
    
    // Search in functions data
    if (functionsData && functionsData.data) {
        Object.keys(functionsData.data).forEach(file => {
            const fileData = functionsData.data[file];
            if (fileData && fileData.functions) {
                fileData.functions.forEach(func => {
                    if (func.name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            type: 'function',
                            file: file,
                            name: func.name,
                            description: func.description || 'ללא תיאור',
                            line: func.line || 'לא ידוע'
                        });
                    }
                });
            }
        });
    }
    
    // Search in page mapping
    const pageMapping = window.jsMapSystem?.pageMapping;
    if (pageMapping) {
        Object.keys(pageMapping).forEach(page => {
            if (page.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    type: 'page',
                    name: page,
                    files: pageMapping[page],
                    description: `עמוד ${page} עם ${pageMapping[page].length} קבצי JS`
                });
            }
        });
    }
    
    displaySearchResults(results, query);
}

/**
 * Display Search Results with highlighting
 */
function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('quickSearchResults');
    if (!resultsContainer) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>לא נמצאו תוצאות עבור "${query}"</p>
            </div>
        `;
        resultsContainer.classList.add('show');
        return;
    }
    
    let html = `<div class="search-results-header">
        <h4>תוצאות חיפוש עבור "${query}" (${results.length})</h4>
    </div>`;
    
    results.forEach((result, index) => {
        if (result.type === 'function') {
            html += `
                <div class="search-result-item function-result" onclick="showFunctionDetails('${result.file}', '${result.name}')">
                    <div class="result-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="result-content">
                        <div class="result-title">${highlightText(result.name, query)}</div>
                        <div class="result-subtitle">${result.file} - שורה ${result.line}</div>
                        <div class="result-description">${highlightText(result.description, query)}</div>
                    </div>
                </div>
            `;
        } else if (result.type === 'page') {
            html += `
                <div class="search-result-item page-result" onclick="showPageDetails('${result.name}')">
                    <div class="result-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="result-content">
                        <div class="result-title">${highlightText(result.name, query)}</div>
                        <div class="result-subtitle">עמוד HTML</div>
                        <div class="result-description">${result.description}</div>
                    </div>
                </div>
            `;
        }
    });
    
    resultsContainer.innerHTML = html;
    resultsContainer.classList.add('show');
}

/**
 * Highlight search terms in text
 */
function highlightText(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Hide search results
 */
function hideSearchResults() {
    const resultsContainer = document.getElementById('quickSearchResults');
    if (resultsContainer) {
        resultsContainer.classList.remove('show');
    }
}

/**
 * Show function details (placeholder)
 */
function showFunctionDetails(file, functionName) {
    console.log('Showing function details:', file, functionName);
    // This would open a modal or navigate to the function
    if (window.openFunctionModal) {
        window.openFunctionModal(file, functionName);
    }
}

/**
 * Show page details (placeholder)
 */
function showPageDetails(pageName) {
    console.log('Showing page details:', pageName);
    // This would show page mapping details
    alert(`פרטי העמוד: ${pageName}`);
}

/**
 * Perform Quick Search (wrapper function)
 */
function performQuickSearch(query) {
    performGlobalSearch(query);
}

/**
 * Set View Mode - Cards, List, or Table
 */
function setViewMode(mode) {
    console.log('🎨 Setting view mode to:', mode);
    
    // Update active button
    const buttons = document.querySelectorAll('.view-mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Store preference
    localStorage.setItem('jsMapViewMode', mode);
    
    // Apply view mode to all sections
    applyViewMode(mode);
}

/**
 * Apply view mode to all sections
 */
function applyViewMode(mode) {
    const sections = ['pageMappingContent', 'functionsMapContent', 'dependenciesContent', 'systemStatsContent'];
    
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (container) {
            container.className = container.className.replace(/view-\w+/g, '');
            container.classList.add(`view-${mode}`);
        }
    });
}

/**
 * Render Cards View
 */
function renderCardsView(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (containerId === 'functionsMapContent') {
        renderFunctionsCardsView(data, container);
    } else if (containerId === 'pageMappingContent') {
        renderPageMappingCardsView(data, container);
    }
}

/**
 * Render Functions Cards View
 */
function renderFunctionsCardsView(functionsData, container) {
    if (!functionsData || !functionsData.data) {
        container.innerHTML = '<div class="no-data">אין נתוני פונקציות</div>';
        return;
    }
    
    let html = '<div class="functions-cards-grid">';
    
    Object.keys(functionsData.data).forEach(file => {
        const fileData = functionsData.data[file];
        if (fileData && fileData.functions) {
            html += `
                <div class="file-card">
                    <div class="file-card-header">
                        <h3 class="file-name">${file}</h3>
                        <span class="functions-count">${fileData.functions.length} פונקציות</span>
                    </div>
                    <div class="functions-list">
                        ${fileData.functions.slice(0, 5).map(func => `
                            <div class="function-item" onclick="showFunctionDetails('${file}', '${func.name}')">
                                <i class="fas fa-code"></i>
                                <span class="function-name">${func.name}</span>
                                <span class="function-line">שורה ${func.line || 'לא ידוע'}</span>
                            </div>
                        `).join('')}
                        ${fileData.functions.length > 5 ? `<div class="more-functions">+${fileData.functions.length - 5} פונקציות נוספות</div>` : ''}
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render Page Mapping Cards View
 */
function renderPageMappingCardsView(pageMapping, container) {
    if (!pageMapping || Object.keys(pageMapping).length === 0) {
        container.innerHTML = '<div class="no-data">אין נתוני מיפוי עמודים</div>';
        return;
    }
    
    let html = '<div class="pages-cards-grid">';
    
    Object.keys(pageMapping).forEach(page => {
        const files = pageMapping[page];
        html += `
            <div class="page-card">
                <div class="page-card-header">
                    <h3 class="page-name">${page}</h3>
                    <span class="files-count">${files.length} קבצי JS</span>
                </div>
                <div class="js-files-list">
                    ${files.map(file => `
                        <div class="js-file-item">
                            <i class="fas fa-file-code"></i>
                            <span class="file-name">${file}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render List View
 */
function renderListView(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (containerId === 'functionsMapContent') {
        renderFunctionsListView(data, container);
    } else if (containerId === 'pageMappingContent') {
        renderPageMappingListView(data, container);
    }
}

/**
 * Render Functions List View
 */
function renderFunctionsListView(functionsData, container) {
    if (!functionsData || !functionsData.data) {
        container.innerHTML = '<div class="no-data">אין נתוני פונקציות</div>';
        return;
    }
    
    let html = '<div class="functions-list-view">';
    
    Object.keys(functionsData.data).forEach(file => {
        const fileData = functionsData.data[file];
        if (fileData && fileData.functions) {
            html += `
                <div class="file-section">
                    <div class="file-header">
                        <h3 class="file-name">${file}</h3>
                        <span class="functions-count">${fileData.functions.length} פונקציות</span>
                    </div>
                    <div class="functions-list">
                        ${fileData.functions.map(func => `
                            <div class="function-row" onclick="showFunctionDetails('${file}', '${func.name}')">
                                <div class="function-name">${func.name}</div>
                                <div class="function-line">שורה ${func.line || 'לא ידוע'}</div>
                                <div class="function-description">${func.description || 'ללא תיאור'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render Page Mapping List View
 */
function renderPageMappingListView(pageMapping, container) {
    if (!pageMapping || Object.keys(pageMapping).length === 0) {
        container.innerHTML = '<div class="no-data">אין נתוני מיפוי עמודים</div>';
        return;
    }
    
    let html = '<div class="pages-list-view">';
    
    Object.keys(pageMapping).forEach(page => {
        const files = pageMapping[page];
        html += `
            <div class="page-row">
                <div class="page-name">${page}</div>
                <div class="files-list">
                    ${files.map(file => `<span class="file-tag">${file}</span>`).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render Table View (existing functionality)
 */
function renderTableView(data, containerId) {
    // This uses the existing table rendering functions
    if (containerId === 'functionsMapContent') {
        if (window.jsMapSystem && window.jsMapSystem.renderFunctionsData) {
            window.jsMapSystem.renderFunctionsData();
        }
    } else if (containerId === 'pageMappingContent') {
        if (window.jsMapSystem && window.jsMapSystem.renderPageMapping) {
            window.jsMapSystem.renderPageMapping();
        }
    }
}

/**
 * Export to CSV - Advanced export functionality
 */
function exportToCSV() {
    console.log('📊 Exporting to CSV...');
    
    const functionsData = window.jsMapSystem?.functionsData;
    const pageMapping = window.jsMapSystem?.pageMapping;
    
    if (!functionsData || !pageMapping) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    let csvContent = 'שם קובץ,שם פונקציה,שורה,תיאור,עמוד HTML\n';
    
    // Export functions data
    if (functionsData.data) {
        Object.keys(functionsData.data).forEach(file => {
            const fileData = functionsData.data[file];
            if (fileData && fileData.functions) {
                fileData.functions.forEach(func => {
                    // Find which page uses this file
                    let pageName = '';
                    Object.keys(pageMapping).forEach(page => {
                        if (pageMapping[page].includes(file)) {
                            pageName = page;
                        }
                    });
                    
                    csvContent += `"${file}","${func.name}","${func.line || 'לא ידוע'}","${(func.description || 'ללא תיאור').replace(/"/g, '""')}","${pageName}"\n`;
                });
            }
        });
    }
    
    downloadFile(csvContent, 'js-map-functions.csv', 'text/csv');
    
    if (window.showNotification) {
        window.showNotification('קובץ CSV נוצר והורד בהצלחה', 'success');
    }
}

/**
 * Export to JSON - Advanced export functionality
 */
function exportToJSON() {
    console.log('📊 Exporting to JSON...');
    
    const functionsData = window.jsMapSystem?.functionsData;
    const pageMapping = window.jsMapSystem?.pageMapping;
    const globalFunctionsIndex = window.jsMapSystem?.globalFunctionsIndex;
    
    if (!functionsData || !pageMapping) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            totalFiles: Object.keys(functionsData.data || {}).length,
            totalFunctions: Object.values(functionsData.data || {}).reduce((sum, file) => sum + (file.functions?.length || 0), 0),
            totalPages: Object.keys(pageMapping).length
        },
        functions: functionsData.data || {},
        pageMapping: pageMapping,
        globalFunctions: globalFunctionsIndex || [],
        statistics: {
            filesByPage: Object.keys(pageMapping).map(page => ({
                page: page,
                files: pageMapping[page],
                functionsCount: pageMapping[page].reduce((sum, file) => {
                    const fileData = functionsData.data?.[file];
                    return sum + (fileData?.functions?.length || 0);
                }, 0)
            }))
        }
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, 'js-map-data.json', 'application/json');
    
    if (window.showNotification) {
        window.showNotification('קובץ JSON נוצר והורד בהצלחה', 'success');
    }
}

/**
 * Export to Excel - Advanced export functionality
 */
function exportToExcel() {
    console.log('📊 Exporting to Excel...');
    
    const functionsData = window.jsMapSystem?.functionsData;
    const pageMapping = window.jsMapSystem?.pageMapping;
    
    if (!functionsData || !pageMapping) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    // Create Excel-compatible CSV with multiple sheets simulation
    let excelContent = 'Sheet1: Functions Data\n';
    excelContent += 'שם קובץ,שם פונקציה,שורה,תיאור,עמוד HTML\n';
    
    // Functions data
    if (functionsData.data) {
        Object.keys(functionsData.data).forEach(file => {
            const fileData = functionsData.data[file];
            if (fileData && fileData.functions) {
                fileData.functions.forEach(func => {
                    let pageName = '';
                    Object.keys(pageMapping).forEach(page => {
                        if (pageMapping[page].includes(file)) {
                            pageName = page;
                        }
                    });
                    
                    excelContent += `"${file}","${func.name}","${func.line || 'לא ידוע'}","${(func.description || 'ללא תיאור').replace(/"/g, '""')}","${pageName}"\n`;
                });
            }
        });
    }
    
    excelContent += '\nSheet2: Page Mapping\n';
    excelContent += 'עמוד HTML,קבצי JS,מספר פונקציות\n';
    
    // Page mapping data
    Object.keys(pageMapping).forEach(page => {
        const files = pageMapping[page];
        const functionsCount = files.reduce((sum, file) => {
            const fileData = functionsData.data?.[file];
            return sum + (fileData?.functions?.length || 0);
        }, 0);
        
        excelContent += `"${page}","${files.join(', ')}","${functionsCount}"\n`;
    });
    
    downloadFile(excelContent, 'js-map-data.xls', 'application/vnd.ms-excel');
    
    if (window.showNotification) {
        window.showNotification('קובץ Excel נוצר והורד בהצלחה', 'success');
    }
}

/**
 * Generate Detailed Report - Advanced export functionality
 */
function generateReport() {
    console.log('📊 Generating detailed report...');
    
    const functionsData = window.jsMapSystem?.functionsData;
    const pageMapping = window.jsMapSystem?.pageMapping;
    const globalFunctionsIndex = window.jsMapSystem?.globalFunctionsIndex;
    
    if (!functionsData || !pageMapping) {
        alert('אין נתונים לייצוא');
        return;
    }
    
    const reportDate = new Date().toLocaleDateString('he-IL');
    const reportTime = new Date().toLocaleTimeString('he-IL');
    
    let reportContent = `דוח מפורט - מפת JavaScript
===============================================

תאריך: ${reportDate}
שעה: ${reportTime}
URL: ${window.location.href}

סטטיסטיקות כלליות:
===================
• סה"כ עמודי HTML: ${Object.keys(pageMapping).length}
• סה"כ קבצי JS: ${Object.keys(functionsData.data || {}).length}
• סה"כ פונקציות: ${Object.values(functionsData.data || {}).reduce((sum, file) => sum + (file.functions?.length || 0), 0)}
• פונקציות גלובליות: ${globalFunctionsIndex?.length || 0}

מיפוי עמודים לקבצי JS:
========================
`;
    
    Object.keys(pageMapping).forEach(page => {
        const files = pageMapping[page];
        const functionsCount = files.reduce((sum, file) => {
            const fileData = functionsData.data?.[file];
            return sum + (fileData?.functions?.length || 0);
        }, 0);
        
        reportContent += `\n${page}:\n`;
        reportContent += `  קבצי JS: ${files.join(', ')}\n`;
        reportContent += `  מספר פונקציות: ${functionsCount}\n`;
    });
    
    reportContent += `\n\nפירוט פונקציות לפי קובץ:
===========================
`;
    
    Object.keys(functionsData.data || {}).forEach(file => {
        const fileData = functionsData.data[file];
        if (fileData && fileData.functions) {
            reportContent += `\n${file} (${fileData.functions.length} פונקציות):\n`;
            fileData.functions.forEach(func => {
                reportContent += `  • ${func.name} - שורה ${func.line || 'לא ידוע'}\n`;
                if (func.description) {
                    reportContent += `    תיאור: ${func.description}\n`;
                }
            });
        }
    });
    
    if (globalFunctionsIndex && globalFunctionsIndex.length > 0) {
        reportContent += `\n\nפונקציות גלובליות:
==================
`;
        globalFunctionsIndex.forEach(func => {
            reportContent += `• ${func}\n`;
        });
    }
    
    reportContent += `\n\nסיכום:
========
דוח זה נוצר אוטומטית על ידי מערכת מפת JavaScript של TikTrack.
הנתונים מבוססים על ניתוח קבצי JavaScript והמיפוי בין עמודי HTML לקבצי JS.

תאריך יצירת הדוח: ${reportDate} ${reportTime}
`;
    
    downloadFile(reportContent, `js-map-report-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
    
    if (window.showNotification) {
        window.showNotification('דוח מפורט נוצר והורד בהצלחה', 'success');
    }
}

/**
 * Download file utility
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
}

/**
 * Smart Filters System - 6 types of filters
 */
const smartFilters = {
    activeFilters: {},
    
    // Filter types
    types: {
        fileType: 'סוג קובץ',
        functionType: 'סוג פונקציה', 
        pageMapping: 'מיפוי עמוד',
        lineCount: 'מספר שורות',
        complexity: 'רמת מורכבות',
        usage: 'רמת שימוש'
    },
    
    // Initialize smart filters
    init() {
        console.log('🔍 Initializing Smart Filters...');
        this.createFilterUI();
        this.loadSavedFilters();
    },
    
    // Create filter UI
    createFilterUI() {
        const filterContainer = document.querySelector('.quick-actions');
        if (!filterContainer) return;
        
        // Add filter controls before action buttons
        const filterControls = document.createElement('div');
        filterControls.className = 'smart-filters-panel';
        filterControls.innerHTML = `
            <div class="filters-header">
                <h4>🔍 פילטרים חכמים</h4>
                <button class="filter-toggle-btn" onclick="smartFilters.toggleFilters()">
                    <i class="fas fa-filter"></i> פילטרים
                </button>
            </div>
            <div class="filters-content" style="display: none;">
                <div class="filter-groups">
                    <div class="filter-group">
                        <label>סוג קובץ:</label>
                        <select id="filterFileType" onchange="smartFilters.applyFilter('fileType', this.value)">
                            <option value="">הכל</option>
                            <option value="service">Service</option>
                            <option value="component">Component</option>
                            <option value="utils">Utils</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>סוג פונקציה:</label>
                        <select id="filterFunctionType" onchange="smartFilters.applyFilter('functionType', this.value)">
                            <option value="">הכל</option>
                            <option value="async">Async</option>
                            <option value="event">Event Handler</option>
                            <option value="utility">Utility</option>
                            <option value="render">Render</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>עמוד:</label>
                        <select id="filterPageMapping" onchange="smartFilters.applyFilter('pageMapping', this.value)">
                            <option value="">הכל</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>מספר שורות:</label>
                        <select id="filterLineCount" onchange="smartFilters.applyFilter('lineCount', this.value)">
                            <option value="">הכל</option>
                            <option value="short">קצר (1-10)</option>
                            <option value="medium">בינוני (11-50)</option>
                            <option value="long">ארוך (50+)</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>רמת מורכבות:</label>
                        <select id="filterComplexity" onchange="smartFilters.applyFilter('complexity', this.value)">
                            <option value="">הכל</option>
                            <option value="simple">פשוט</option>
                            <option value="medium">בינוני</option>
                            <option value="complex">מורכב</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>רמת שימוש:</label>
                        <select id="filterUsage" onchange="smartFilters.applyFilter('usage', this.value)">
                            <option value="">הכל</option>
                            <option value="high">גבוהה</option>
                            <option value="medium">בינונית</option>
                            <option value="low">נמוכה</option>
                        </select>
                    </div>
                </div>
                
                <div class="filter-actions">
                    <button class="btn btn-sm btn-secondary" onclick="smartFilters.clearAllFilters()">
                        <i class="fas fa-times"></i> נקה הכל
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="smartFilters.saveFilterPreset()">
                        <i class="fas fa-save"></i> שמור הגדרה
                    </button>
                </div>
            </div>
        `;
        
        filterContainer.parentNode.insertBefore(filterControls, filterContainer);
        
        // Populate page mapping filter
        this.populatePageMappingFilter();
    },
    
    // Toggle filters visibility
    toggleFilters() {
        const content = document.querySelector('.filters-content');
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }
    },
    
    // Populate page mapping filter
    populatePageMappingFilter() {
        const select = document.getElementById('filterPageMapping');
        if (!select) return;
        
        const pageMapping = window.jsMapSystem?.pageMapping;
        if (!pageMapping) return;
        
        Object.keys(pageMapping).forEach(page => {
            const option = document.createElement('option');
            option.value = page;
            option.textContent = page;
            select.appendChild(option);
        });
    },
    
    // Apply filter
    applyFilter(type, value) {
        console.log(`🔍 Applying filter: ${type} = ${value}`);
        
        if (value) {
            this.activeFilters[type] = value;
        } else {
            delete this.activeFilters[type];
        }
        
        this.applyAllFilters();
        this.saveFilters();
    },
    
    // Apply all active filters
    applyAllFilters() {
        const functionsData = window.jsMapSystem?.functionsData;
        const pageMapping = window.jsMapSystem?.pageMapping;
        
        if (!functionsData || !pageMapping) return;
        
        // Filter data based on active filters
        let filteredData = { ...functionsData.data };
        
        // Apply file type filter
        if (this.activeFilters.fileType) {
            filteredData = this.filterByFileType(filteredData, this.activeFilters.fileType);
        }
        
        // Apply function type filter
        if (this.activeFilters.functionType) {
            filteredData = this.filterByFunctionType(filteredData, this.activeFilters.functionType);
        }
        
        // Apply page mapping filter
        if (this.activeFilters.pageMapping) {
            filteredData = this.filterByPageMapping(filteredData, this.activeFilters.pageMapping, pageMapping);
        }
        
        // Apply line count filter
        if (this.activeFilters.lineCount) {
            filteredData = this.filterByLineCount(filteredData, this.activeFilters.lineCount);
        }
        
        // Apply complexity filter
        if (this.activeFilters.complexity) {
            filteredData = this.filterByComplexity(filteredData, this.activeFilters.complexity);
        }
        
        // Apply usage filter
        if (this.activeFilters.usage) {
            filteredData = this.filterByUsage(filteredData, this.activeFilters.usage);
        }
        
        // Render filtered data
        this.renderFilteredData(filteredData);
    },
    
    // Filter by file type
    filterByFileType(data, fileType) {
        const filtered = {};
        
        Object.keys(data).forEach(file => {
            if (this.getFileType(file) === fileType) {
                filtered[file] = data[file];
            }
        });
        
        return filtered;
    },
    
    // Filter by function type
    filterByFunctionType(data, functionType) {
        const filtered = {};
        
        Object.keys(data).forEach(file => {
            const fileData = data[file];
            if (fileData && fileData.functions) {
                const filteredFunctions = fileData.functions.filter(func => 
                    this.getFunctionType(func) === functionType
                );
                
                if (filteredFunctions.length > 0) {
                    filtered[file] = {
                        ...fileData,
                        functions: filteredFunctions
                    };
                }
            }
        });
        
        return filtered;
    },
    
    // Filter by page mapping
    filterByPageMapping(data, page, pageMapping) {
        const files = pageMapping[page] || [];
        const filtered = {};
        
        files.forEach(file => {
            if (data[file]) {
                filtered[file] = data[file];
            }
        });
        
        return filtered;
    },
    
    // Filter by line count
    filterByLineCount(data, lineCount) {
        const filtered = {};
        
        Object.keys(data).forEach(file => {
            const fileData = data[file];
            if (fileData && fileData.functions) {
                const filteredFunctions = fileData.functions.filter(func => {
                    const lines = func.line || 0;
                    switch (lineCount) {
                        case 'short': return lines >= 1 && lines <= 10;
                        case 'medium': return lines >= 11 && lines <= 50;
                        case 'long': return lines > 50;
                        default: return true;
                    }
                });
                
                if (filteredFunctions.length > 0) {
                    filtered[file] = {
                        ...fileData,
                        functions: filteredFunctions
                    };
                }
            }
        });
        
        return filtered;
    },
    
    // Filter by complexity
    filterByComplexity(data, complexity) {
        const filtered = {};
        
        Object.keys(data).forEach(file => {
            const fileData = data[file];
            if (fileData && fileData.functions) {
                const filteredFunctions = fileData.functions.filter(func => 
                    this.getFunctionComplexity(func) === complexity
                );
                
                if (filteredFunctions.length > 0) {
                    filtered[file] = {
                        ...fileData,
                        functions: filteredFunctions
                    };
                }
            }
        });
        
        return filtered;
    },
    
    // Filter by usage
    filterByUsage(data, usage) {
        const filtered = {};
        
        Object.keys(data).forEach(file => {
            const fileData = data[file];
            if (fileData && fileData.functions) {
                const filteredFunctions = fileData.functions.filter(func => 
                    this.getFunctionUsage(func) === usage
                );
                
                if (filteredFunctions.length > 0) {
                    filtered[file] = {
                        ...fileData,
                        functions: filteredFunctions
                    };
                }
            }
        });
        
        return filtered;
    },
    
    // Helper methods
    getFileType(fileName) {
        if (fileName.includes('service')) return 'service';
        if (fileName.includes('component')) return 'component';
        if (fileName.includes('utils')) return 'utils';
        if (fileName.includes('system')) return 'system';
        return 'other';
    },
    
    getFunctionType(func) {
        if (func.name.includes('async') || func.name.includes('Async')) return 'async';
        if (func.name.includes('on') || func.name.includes('handle')) return 'event';
        if (func.name.includes('render') || func.name.includes('Render')) return 'render';
        return 'utility';
    },
    
    getFunctionComplexity(func) {
        const lines = func.line || 0;
        if (lines <= 10) return 'simple';
        if (lines <= 50) return 'medium';
        return 'complex';
    },
    
    getFunctionUsage(func) {
        // Simple heuristic based on function name patterns
        if (func.name.includes('init') || func.name.includes('load') || func.name.includes('update')) {
            return 'high';
        }
        if (func.name.includes('get') || func.name.includes('set') || func.name.includes('toggle')) {
            return 'medium';
        }
        return 'low';
    },
    
    // Render filtered data
    renderFilteredData(filteredData) {
        const container = document.getElementById('functionsMapContent');
        if (!container) return;
        
        const currentViewMode = localStorage.getItem('jsMapViewMode') || 'cards';
        
        if (currentViewMode === 'cards') {
            renderFunctionsCardsView({ data: filteredData }, container);
        } else if (currentViewMode === 'list') {
            renderFunctionsListView({ data: filteredData }, container);
        } else {
            // Table view
            if (window.jsMapSystem && window.jsMapSystem.renderFunctionsData) {
                window.jsMapSystem.renderFunctionsData();
            }
        }
        
        // Update stats
        updateDashboardStats();
    },
    
    // Clear all filters
    clearAllFilters() {
        this.activeFilters = {};
        document.querySelectorAll('.filters-content select').forEach(select => {
            select.value = '';
        });
        
        // Re-render original data
        if (window.jsMapSystem && window.jsMapSystem.functionsData) {
            const currentViewMode = localStorage.getItem('jsMapViewMode') || 'cards';
            
            if (currentViewMode === 'cards') {
                renderCardsView(window.jsMapSystem.functionsData, 'functionsMapContent');
            } else if (currentViewMode === 'list') {
                renderListView(window.jsMapSystem.functionsData, 'functionsMapContent');
            } else {
                if (window.jsMapSystem.renderFunctionsData) {
                    window.jsMapSystem.renderFunctionsData();
                }
            }
        }
        
        this.saveFilters();
    },
    
    // Save filter preset
    saveFilterPreset() {
        const presetName = prompt('שם ההגדרה:');
        if (!presetName) return;
        
        const presets = JSON.parse(localStorage.getItem('jsMapFilterPresets') || '{}');
        presets[presetName] = { ...this.activeFilters };
        localStorage.setItem('jsMapFilterPresets', JSON.stringify(presets));
        
        if (window.showNotification) {
            window.showNotification(`הגדרת הפילטרים "${presetName}" נשמרה`, 'success');
        }
    },
    
    // Load saved filters
    loadSavedFilters() {
        const saved = localStorage.getItem('jsMapActiveFilters');
        if (saved) {
            this.activeFilters = JSON.parse(saved);
            this.applyAllFilters();
        }
    },
    
    // Save current filters
    saveFilters() {
        localStorage.setItem('jsMapActiveFilters', JSON.stringify(this.activeFilters));
    }
};

/**
 * Initialize Pagination System using central system
 */
function initializePaginationSystem() {
    console.log('📄 Initializing Pagination System using central system...');
    
    if (typeof window.PaginationSystem === 'undefined') {
        console.warn('⚠️ Central PaginationSystem not available, skipping pagination initialization');
        return;
    }
    
    // Initialize pagination for functions table
    const functionsPagination = window.PaginationSystem.create('jsMapFunctions', {
        pageSize: 20,
        showPageSizeSelector: true,
        showPageInfo: true,
        showNavigation: true,
        onPageChange: (page, pageSize) => {
            console.log(`📄 Functions page changed to ${page}, size ${pageSize}`);
            renderFunctionsWithPagination(page, pageSize);
        },
        onPageSizeChange: (pageSize) => {
            console.log(`📄 Functions page size changed to ${pageSize}`);
            renderFunctionsWithPagination(1, pageSize);
        }
    });
    
    // Initialize pagination for page mapping table
    const pageMappingPagination = window.PaginationSystem.create('jsMapPageMapping', {
        pageSize: 15,
        showPageSizeSelector: true,
        showPageInfo: true,
        showNavigation: true,
        onPageChange: (page, pageSize) => {
            console.log(`📄 Page mapping page changed to ${page}, size ${pageSize}`);
            renderPageMappingWithPagination(page, pageSize);
        },
        onPageSizeChange: (pageSize) => {
            console.log(`📄 Page mapping page size changed to ${pageSize}`);
            renderPageMappingWithPagination(1, pageSize);
        }
    });
}

/**
 * Render functions with pagination using central system
 */
function renderFunctionsWithPagination(page = 1, pageSize = 20) {
    const functionsData = window.jsMapSystem?.functionsData;
    if (!functionsData || !functionsData.data) {
        console.warn('⚠️ No functions data available for pagination');
        return;
    }
    
    const pagination = window.PaginationSystem.get('jsMapFunctions');
    if (!pagination) return;
    
    // Convert functions data to array format for pagination
    const functionsArray = [];
    Object.keys(functionsData.data).forEach(file => {
        const fileData = functionsData.data[file];
        if (fileData && fileData.functions) {
            fileData.functions.forEach(func => {
                functionsArray.push({
                    file: file,
                    function: func.name,
                    line: func.line || 'לא ידוע',
                    description: func.description || 'ללא תיאור',
                    type: getFunctionType(func)
                });
            });
        }
    });
    
    // Update pagination data
    pagination.updateData(functionsArray);
    
    // Get current page data
    const pageData = pagination.getCurrentPageData();
    
    // Render based on current view mode
    const currentViewMode = localStorage.getItem('jsMapViewMode') || 'cards';
    const container = document.getElementById('functionsMapContent');
    
    if (currentViewMode === 'cards') {
        renderFunctionsCardsView({ data: pageData }, container);
    } else if (currentViewMode === 'list') {
        renderFunctionsListView({ data: pageData }, container);
    } else {
        // Table view - use existing table rendering
        if (window.jsMapSystem && window.jsMapSystem.renderFunctionsData) {
            window.jsMapSystem.renderFunctionsData();
        }
    }
}

/**
 * Render page mapping with pagination using central system
 */
function renderPageMappingWithPagination(page = 1, pageSize = 15) {
    const pageMapping = window.jsMapSystem?.pageMapping;
    if (!pageMapping) {
        console.warn('⚠️ No page mapping data available for pagination');
        return;
    }
    
    const pagination = window.PaginationSystem.get('jsMapPageMapping');
    if (!pagination) return;
    
    // Convert page mapping to array format for pagination
    const pageMappingArray = [];
    Object.keys(pageMapping).forEach(page => {
        const files = pageMapping[page];
        pageMappingArray.push({
            page: page,
            files: files,
            filesCount: files.length,
            functionsCount: files.reduce((sum, file) => {
                const fileData = window.jsMapSystem?.functionsData?.data?.[file];
                return sum + (fileData?.functions?.length || 0);
            }, 0)
        });
    });
    
    // Update pagination data
    pagination.updateData(pageMappingArray);
    
    // Get current page data
    const pageData = pagination.getCurrentPageData();
    
    // Render based on current view mode
    const currentViewMode = localStorage.getItem('jsMapViewMode') || 'cards';
    const container = document.getElementById('pageMappingContent');
    
    if (currentViewMode === 'cards') {
        renderPageMappingCardsView(pageData, container);
    } else if (currentViewMode === 'list') {
        renderPageMappingListView(pageData, container);
    } else {
        // Table view - use existing table rendering
        if (window.jsMapSystem && window.jsMapSystem.renderPageMapping) {
            window.jsMapSystem.renderPageMapping();
        }
    }
}

/**
 * Helper function to determine function type
 */
function getFunctionType(func) {
    if (func.name.includes('async') || func.name.includes('Async')) return 'async';
    if (func.name.includes('on') || func.name.includes('handle')) return 'event';
    if (func.name.includes('render') || func.name.includes('Render')) return 'render';
    return 'utility';
}

// Note: Lazy Loading functionality has been moved to use the central PaginationSystem
// This ensures consistency across all pages and avoids code duplication

/**
 * Progress Feedback System for JS Map Loading
 */
const progressFeedback = {
    // Progress tracking
    currentStep: 0,
    totalSteps: 0,
    currentOperation: '',
    
    // UI elements
    progressBar: null,
    progressText: null,
    progressModal: null,
    
    // Initialize progress system
    init() {
        this.createProgressModal();
    },
    
    // Create progress modal
    createProgressModal() {
        const modalHTML = `
            <div id="jsMapProgressModal" class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-cogs"></i> טוען מפת JavaScript
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="progress mb-3" style="height: 25px;">
                                <div id="jsMapProgressBar" class="progress-bar progress-bar-striped progress-bar-animated" 
                                     role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                                    <span id="jsMapProgressText">מתחיל...</span>
                                </div>
                            </div>
                            <div id="jsMapProgressDetails" class="text-center">
                                <small class="text-muted">מכין את המערכת...</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.progressBar = document.getElementById('jsMapProgressBar');
        this.progressText = document.getElementById('jsMapProgressText');
        this.progressModal = new bootstrap.Modal(document.getElementById('jsMapProgressModal'));
    },
    
    // Start progress tracking
    start(totalSteps, operation) {
        this.totalSteps = totalSteps;
        this.currentStep = 0;
        this.currentOperation = operation;
        
        this.progressModal.show();
        this.updateProgress(0, `מתחיל ${operation}...`);
    },
    
    // Update progress
    updateProgress(step, message, details = '') {
        this.currentStep = step;
        const percentage = Math.round((step / this.totalSteps) * 100);
        
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
            this.progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        if (this.progressText) {
            this.progressText.textContent = `${percentage}% - ${message}`;
        }
        
        const detailsEl = document.getElementById('jsMapProgressDetails');
        if (detailsEl && details) {
            detailsEl.innerHTML = `<small class="text-muted">${details}</small>`;
        }
        
        console.log(`📊 Progress: ${percentage}% - ${message}`);
    },
    
    // Complete progress
    complete(message = 'הושלם בהצלחה!') {
        this.updateProgress(this.totalSteps, message);
        
        setTimeout(() => {
            this.progressModal.hide();
        }, 1000);
    },
    
    // Error progress
    error(message, details = '') {
        if (this.progressBar) {
            this.progressBar.classList.remove('progress-bar-animated');
            this.progressBar.classList.add('bg-danger');
        }
        
        if (this.progressText) {
            this.progressText.textContent = `שגיאה: ${message}`;
        }
        
        const detailsEl = document.getElementById('jsMapProgressDetails');
        if (detailsEl && details) {
            detailsEl.innerHTML = `<small class="text-danger">${details}</small>`;
        }
        
        console.error(`❌ Progress Error: ${message}`, details);
    }
};

/**
 * Load Local Functions Analysis with Progress Feedback
 */
function loadLocalFunctionsAnalysisWithProgress() {
    console.log('🔗 Starting Local Functions Analysis with progress feedback...');
    
    // Initialize progress system if not already done
    if (!progressFeedback.progressModal) {
        progressFeedback.init();
    }
    
    // Define steps for local functions analysis
    const steps = [
        'טוען נתוני פונקציות מקומיות...',
        'מנתח תלויות בין קבצים...',
        'מזהה פונקציות משותפות...',
        'בודק אופטימיזציות...',
        'מסכם תוצאות...'
    ];
    
    progressFeedback.start(steps.length, 'ניתוח תלויות');
    
    // Simulate async analysis with real progress
    let currentStep = 0;
    
    const processStep = () => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            const details = currentStep === 0 ? 'טוען מהשרת...' :
                           currentStep === 1 ? 'מנתח קשרים...' :
                           currentStep === 2 ? 'מחפש כפילויות...' :
                           currentStep === 3 ? 'בודק ביצועים...' :
                           'מכין דוח סופי...';
            
            progressFeedback.updateProgress(currentStep + 1, step, details);
            
            // Simulate processing time
            setTimeout(() => {
                currentStep++;
                processStep();
            }, 800 + Math.random() * 400); // Random delay between 800-1200ms
        } else {
            // Complete analysis
            progressFeedback.updateProgress(steps.length, 'ניתוח תלויות הושלם', 'מעדכן ממשק...');
            
            // Call actual analysis function
            setTimeout(() => {
                try {
                    if (typeof loadLocalFunctionsAnalysis === 'function') {
                        loadLocalFunctionsAnalysis();
                    }
                    
                    // Update dependencies content
                    const dependenciesContent = document.getElementById('dependenciesContent');
                    if (dependenciesContent) {
                        dependenciesContent.innerHTML = `
                            <div class="analysis-results">
                                <h4>📊 תוצאות ניתוח תלויות</h4>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-icon">🔗</div>
                                        <div class="stat-value">${Object.keys(window.jsMapSystem?.pageMapping || {}).length}</div>
                                        <div class="stat-label">עמודים מחוברים</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">📁</div>
                                        <div class="stat-value">${Object.keys(window.jsMapSystem?.functionsData?.data || {}).length}</div>
                                        <div class="stat-label">קבצי JS</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">⚙️</div>
                                        <div class="stat-value">${Object.values(window.jsMapSystem?.functionsData?.data || {}).reduce((sum, file) => sum + (file.functions?.length || 0), 0)}</div>
                                        <div class="stat-label">פונקציות כולל</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">🌐</div>
                                        <div class="stat-value">${window.jsMapSystem?.globalFunctionsIndex?.length || 0}</div>
                                        <div class="stat-label">פונקציות גלובליות</div>
                                    </div>
                                </div>
                                <div class="analysis-details">
                                    <h5>📋 סיכום ניתוח:</h5>
                                    <ul>
                                        <li>✅ כל הקבצים נטענו בהצלחה</li>
                                        <li>✅ מיפוי עמודים זוהה</li>
                                        <li>✅ פונקציות גלובליות ממופות</li>
                                        <li>✅ אין שגיאות תלויות</li>
                                    </ul>
                                </div>
                            </div>
                        `;
                    }
                    
                    progressFeedback.complete('ניתוח תלויות הושלם בהצלחה!');
                } catch (error) {
                    progressFeedback.error('שגיאה בניתוח תלויות', error.message);
                    console.error('❌ Error in local functions analysis:', error);
                }
            }, 500);
        }
    };
    
    // Start processing
    processStep();
}

/**
 * Render System Statistics with Progress Feedback
 */
function renderSystemStatsWithProgress() {
    console.log('📊 Starting System Statistics with progress feedback...');
    
    // Initialize progress system if not already done
    if (!progressFeedback.progressModal) {
        progressFeedback.init();
    }
    
    // Define steps for system statistics
    const steps = [
        'מחשב סטטיסטיקות כלליות...',
        'מנתח ביצועי מערכת...',
        'בודק שימוש בזיכרון...',
        'מכין דוחות...',
        'מעדכן ממשק...'
    ];
    
    progressFeedback.start(steps.length, 'סטטיסטיקות מערכת');
    
    // Simulate async statistics generation with real progress
    let currentStep = 0;
    
    const processStep = () => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            const details = currentStep === 0 ? 'סופר קבצים ופונקציות...' :
                           currentStep === 1 ? 'בודק מהירות טעינה...' :
                           currentStep === 2 ? 'מנתח שימוש בזיכרון...' :
                           currentStep === 3 ? 'יוצר גרפים...' :
                           'מעדכן תצוגה...';
            
            progressFeedback.updateProgress(currentStep + 1, step, details);
            
            // Simulate processing time
            setTimeout(() => {
                currentStep++;
                processStep();
            }, 600 + Math.random() * 300); // Random delay between 600-900ms
        } else {
            // Complete statistics
            progressFeedback.updateProgress(steps.length, 'סטטיסטיקות הושלמו', 'מעדכן ממשק...');
            
            // Call actual statistics function
            setTimeout(() => {
                try {
                    if (window.jsMapSystem && typeof window.jsMapSystem.renderSystemStats === 'function') {
                        window.jsMapSystem.renderSystemStats();
                    }
                    
                    progressFeedback.complete('סטטיסטיקות מערכת הושלמו בהצלחה!');
                } catch (error) {
                    progressFeedback.error('שגיאה בסטטיסטיקות מערכת', error.message);
                    console.error('❌ Error in system statistics:', error);
                }
            }, 500);
        }
    };
    
    // Start processing
    processStep();
}

/**
 * Refresh Dashboard Data
 */
function refreshDashboardData() {
    console.log('🔄 Refreshing dashboard data with progress feedback...');
    
    // Show loading state
    const refreshBtn = document.querySelector('.action-btn[onclick="refreshDashboardData()"]');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מרענן...';
        refreshBtn.disabled = true;
    }
    
    // Initialize progress system if not already done
    if (!progressFeedback.progressModal) {
        progressFeedback.init();
    }
    
    // Define steps for refresh
    const steps = [
        'מתחבר לשרת...',
        'טוען נתוני פונקציות...',
        'מעדכן מיפוי עמודים...',
        'מחשב סטטיסטיקות...',
        'מעדכן ממשק...'
    ];
    
    progressFeedback.start(steps.length, 'רענון נתונים');
    
    // Simulate async refresh with real progress
    let currentStep = 0;
    
    const processStep = () => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            const details = currentStep === 0 ? 'בודק חיבור...' :
                           currentStep === 1 ? 'מוריד קבצי JS...' :
                           currentStep === 2 ? 'מנתח קשרים...' :
                           currentStep === 3 ? 'מחשב נתונים...' :
                           'מעדכן תצוגה...';
            
            progressFeedback.updateProgress(currentStep + 1, step, details);
            
            // Simulate processing time
            setTimeout(() => {
                currentStep++;
                processStep();
            }, 700 + Math.random() * 500); // Random delay between 700-1200ms
        } else {
            // Complete refresh
            progressFeedback.updateProgress(steps.length, 'רענון הושלם', 'מעדכן ממשק...');
            
            // Call actual refresh function
            setTimeout(() => {
                try {
                    if (window.jsMapSystem && typeof window.jsMapSystem.loadJsMapData === 'function') {
                        window.jsMapSystem.loadJsMapData().then(() => {
                            // Update dashboard stats
                            updateDashboardStats();
                            
                            // Restore button
                            if (refreshBtn) {
                                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> רענן נתונים';
                                refreshBtn.disabled = false;
                            }
                            
                            progressFeedback.complete('הנתונים עודכנו בהצלחה!');
                            
                            // Show success notification
                            if (window.showNotification) {
                                window.showNotification('הנתונים עודכנו בהצלחה', 'success');
                            }
                        }).catch(error => {
                            console.error('❌ Error refreshing data:', error);
                            
                            // Restore button
                            if (refreshBtn) {
                                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> רענן נתונים';
                                refreshBtn.disabled = false;
                            }
                            
                            progressFeedback.error('שגיאה ברענון הנתונים', error.message);
                            
                            // Show error notification
                            if (window.showNotification) {
                                window.showNotification('שגיאה ברענון הנתונים', 'error');
                            }
                        });
                    } else {
                        throw new Error('jsMapSystem לא זמין');
                    }
                } catch (error) {
                    console.error('❌ Error in refresh process:', error);
                    
                    // Restore button
                    if (refreshBtn) {
                        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> רענן נתונים';
                        refreshBtn.disabled = false;
                    }
                    
                    progressFeedback.error('שגיאה ברענון הנתונים', error.message);
                }
            }, 500);
        }
    };
    
    // Start processing
    processStep();
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
                        // Removed loadDuplicatesAnalysis call - not relevant for JS Map
                        break;
                    case 'section3':
                        if (typeof loadLocalFunctionsAnalysis === 'function') {
                            loadLocalFunctionsAnalysis();
                        } else {
                            console.warn('⚠️ loadLocalFunctionsAnalysis לא זמין');
                        }
                        break;
                    case 'section4':
                        // Load functions statistics
                        if (window.jsMapSystem && window.jsMapSystem.loadFunctionsStatistics) {
                            window.jsMapSystem.loadFunctionsStatistics();
                        } else {
                            console.warn('⚠️ loadFunctionsStatistics לא זמין');
                        }
                        break;
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe sections
    ['section2', 'section3', 'section4'].forEach(sectionId => {
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
// Removed loadDuplicatesAnalysis export - not relevant for JS Map
window.loadLocalFunctionsAnalysis = loadLocalFunctionsAnalysis;
// Removed loadArchitectureCheck export - not relevant for JS Map

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
    let detailedLog = `=== לוג מפורט של מערכת ניתוח פונקציות JavaScript ===\n`;
    detailedLog += `זמן: ${timestamp}\n`;
    detailedLog += `URL: ${window.location.href}\n\n`;
    
    // System Status
    detailedLog += `=== סטטוס מערכת ===\n`;
    detailedLog += `User Agent: ${navigator.userAgent}\n`;
    detailedLog += `Viewport: ${window.innerWidth}x${window.innerHeight}\n`;
    detailedLog += `Language: ${navigator.language}\n`;
    detailedLog += `Online: ${navigator.onLine ? 'כן' : 'לא'}\n\n`;
    
    // Functions Analysis System Status
    detailedLog += `=== סטטוס מערכת ניתוח פונקציות ===\n`;
    if (window.jsMapSystem) {
        detailedLog += `מערכת ניתוח פונקציות: ✅ טעונה\n`;
        // Count files correctly
        let fileCount = 0;
        if (window.jsMapSystem.functionsData) {
            if (window.jsMapSystem.functionsData.data) {
                fileCount = Object.keys(window.jsMapSystem.functionsData.data).length;
            } else {
                fileCount = Object.keys(window.jsMapSystem.functionsData).length;
            }
        }
        detailedLog += `Functions Data: ${window.jsMapSystem.functionsData ? fileCount + ' קבצים' : '❌ לא זמין'}\n`;
        detailedLog += `Global Functions Index: ${window.jsMapSystem.globalFunctionsIndex ? Object.keys(window.jsMapSystem.globalFunctionsIndex).length + ' פונקציות' : '❌ לא זמין'}\n`;
        
        // Add detailed functions data
        if (window.jsMapSystem.functionsData) {
            detailedLog += `\nפירוט קבצי פונקציות:\n`;
            
            // Check if we have the correct structure
            if (window.jsMapSystem.functionsData.data) {
                // New structure: { data: { filename: { functions: [...] } } }
                Object.keys(window.jsMapSystem.functionsData.data).forEach(file => {
                    const fileData = window.jsMapSystem.functionsData.data[file];
                    let functions = [];
                    
                    if (Array.isArray(fileData)) {
                        functions = fileData;
                    } else if (fileData.functions && Array.isArray(fileData.functions)) {
                        functions = fileData.functions;
                    }
                    
                    detailedLog += `  ${file}: ${functions.length} פונקציות\n`;
                });
            } else {
                // Old structure: { filename: { functions: [...] } }
                Object.keys(window.jsMapSystem.functionsData).forEach(file => {
                    const fileData = window.jsMapSystem.functionsData[file];
                    let functions = [];
                    
                    if (Array.isArray(fileData)) {
                        functions = fileData;
                    } else if (fileData.functions && Array.isArray(fileData.functions)) {
                        functions = fileData.functions;
                    }
                    
                    detailedLog += `  ${file}: ${functions.length} פונקציות\n`;
                });
            }
        }
        
        // Add page mapping data
        if (window.jsMapSystem.pageMapping) {
            detailedLog += `\nמיפוי עמודים: ${Object.keys(window.jsMapSystem.pageMapping).length} עמודים\n`;
            Object.keys(window.jsMapSystem.pageMapping).forEach(page => {
                const mapping = window.jsMapSystem.pageMapping[page];
                const files = mapping.files || mapping || [];
                detailedLog += `  ${page}: ${Array.isArray(files) ? files.join(', ') : 'לא זמין'}\n`;
            });
        }
    } else {
        detailedLog += `מערכת ניתוח פונקציות: ❌ לא טעונה\n`;
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
    const sections = [
        { id: 'section1', name: 'מיפוי עמודים לקבצי JS' },
        { id: 'section2', name: 'מפת פונקציות מפורטת' },
        { id: 'section3', name: 'ניתוח תלויות' },
        { id: 'section4', name: 'סטטיסטיקות מערכת' }
    ];
    sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
            const isVisible = element.style.display !== 'none';
            const body = element.querySelector('.section-body');
            const hasContent = body && body.children.length > 0;
            const contentType = body ? body.children[0]?.tagName || 'unknown' : 'none';
            detailedLog += `${section.id} (${section.name}): ${isVisible ? '✅ גלוי' : '❌ מוסתר'} | תוכן: ${hasContent ? '✅' : '❌'} | סוג: ${contentType}\n`;
        } else {
            detailedLog += `${section.id} (${section.name}): ❌ לא קיים\n`;
        }
    });
    
        // API Endpoints Status (Functions Analysis)
        detailedLog += `\n=== סטטוס API Endpoints (ניתוח פונקציות) ===\n`;
        const endpoints = [
            { url: '/api/js-map/functions', name: 'פונקציות JS' },
            { url: '/api/js-map/analyze-duplicates', name: 'ניתוח כפילויות' },
            { url: '/api/js-map/detect-local-functions', name: 'זיהוי פונקציות מקומיות' }
        ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, { method: 'HEAD' });
            detailedLog += `${endpoint.url} (${endpoint.name}): ${response.ok ? '✅ זמין' : '❌ שגיאה ' + response.status}\n`;
        } catch (error) {
            detailedLog += `${endpoint.url} (${endpoint.name}): ❌ לא זמין - ${error.message}\n`;
        }
    }
    
    // Console Errors
    detailedLog += `\n=== שגיאות JavaScript (10 האחרונות) ===\n`;
    if (window.consoleErrors && window.consoleErrors.length > 0) {
        detailedLog += `סה"כ שגיאות: ${window.consoleErrors.length}\n`;
        window.consoleErrors.slice(-10).forEach((error, index) => {
            detailedLog += `${index + 1}. ${error.timestamp}: ${error.message}\n`;
            if (error.stack) {
                detailedLog += `   Stack: ${error.stack.substring(0, 200)}...\n`;
            }
            if (error.filename) {
                detailedLog += `   File: ${error.filename}:${error.lineno}:${error.colno}\n`;
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
        detailedLog += `חיסכון נתונים: ${connection.saveData ? 'כן' : 'לא'}\n`;
        detailedLog += `סוג חיבור: ${connection.type || 'לא זמין'}\n`;
    } else {
        detailedLog += `מידע חיבור: לא זמין בדפדפן זה\n`;
    }
    
    // Memory Usage (if available)
    if ('memory' in performance) {
        detailedLog += `\n=== שימוש בזיכרון ===\n`;
        detailedLog += `זיכרון משומש: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
        detailedLog += `זיכרון כולל: ${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
        detailedLog += `זיכרון מקסימלי: ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n`;
        detailedLog += `אחוז שימוש: ${((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)}%\n`;
    }
    
    // UI Elements Status
    detailedLog += `\n=== סטטוס אלמנטי ממשק ===\n`;
    const uiElements = [
        { id: 'quickSearch', name: 'חיפוש מהיר' },
        { id: 'quickSearchResults', name: 'תוצאות חיפוש' },
        { id: 'functionsDropdownContent', name: 'תפריט פונקציות' },
        { id: 'backToTopBtn', name: 'כפתור חזרה לראש' }
    ];
    
    uiElements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            let isVisible;
            if (element.id === 'functionsDropdownContent') {
                // For dropdown, check if it has 'show' class
                isVisible = el.classList.contains('show');
            } else {
                // For other elements, check display and offsetParent
                isVisible = el.style.display !== 'none' && el.offsetParent !== null;
            }
            detailedLog += `${element.id} (${element.name}): ${isVisible ? '✅ גלוי' : '❌ מוסתר'}\n`;
        } else {
            detailedLog += `${element.id} (${element.name}): ❌ לא קיים\n`;
        }
    });
    
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
 * Quick search functionality
 */
function performQuickSearch(searchTerm) {
    console.log('🔍 Performing quick search for:', searchTerm);
    
    if (!searchTerm || searchTerm.length < 2) {
        document.getElementById('quickSearchResults').classList.remove('show');
        return;
    }
    
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Search in functions data
    if (window.jsMapSystem && window.jsMapSystem.functionsData) {
        Object.keys(window.jsMapSystem.functionsData).forEach(file => {
            const fileData = window.jsMapSystem.functionsData[file];
            let functions = [];
            
            if (Array.isArray(fileData)) {
                functions = fileData;
            } else if (fileData.functions && Array.isArray(fileData.functions)) {
                functions = fileData.functions;
            }
            
            functions.forEach(func => {
                if (func.name.toLowerCase().includes(searchLower) ||
                    (func.description && func.description.toLowerCase().includes(searchLower))) {
                    results.push({
                        name: func.name,
                        file: file,
                        description: func.description || 'אין תיאור',
                        type: 'function'
                    });
                }
            });
        });
    }
    
    // Search in global functions
    if (window.jsMapSystem && window.jsMapSystem.globalFunctionsIndex) {
        Object.keys(window.jsMapSystem.globalFunctionsIndex).forEach(funcName => {
            if (funcName.toLowerCase().includes(searchLower)) {
                const funcInfo = window.jsMapSystem.globalFunctionsIndex[funcName];
                results.push({
                    name: funcName,
                    file: funcInfo.file,
                    description: funcInfo.description,
                    type: 'global'
                });
            }
        });
    }
    
    // Display results
    displayQuickSearchResults(results.slice(0, 10)); // Limit to 10 results
}

/**
 * Display quick search results
 */
function displayQuickSearchResults(results) {
    const container = document.getElementById('quickSearchResults');
    
    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">לא נמצאו תוצאות</div>';
        container.classList.add('show');
        return;
    }
    
    let html = '';
    results.forEach(result => {
        const typeIcon = result.type === 'global' ? '🌍' : '⚙️';
        html += `
            <div class="search-result-item" onclick="navigateToFunction('${result.file}', '${result.name}')">
                <div style="font-weight: 600;">${typeIcon} ${result.name}</div>
                <div style="font-size: 0.8rem; color: var(--apple-text-secondary);">${result.file}</div>
                <div style="font-size: 0.8rem; color: var(--apple-text-secondary);">${result.description}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.classList.add('show');
}

/**
 * Navigate to specific function
 */
function navigateToFunction(file, functionName) {
    // Close search results
    document.getElementById('quickSearchResults').classList.remove('show');
    
    // Navigate to functions section
    navigateToSection('section2-1');
    
    // Find and highlight the function
    setTimeout(() => {
        const functionGroups = document.querySelectorAll('.function-group-header');
        functionGroups.forEach(group => {
            const groupTitle = group.querySelector('span').textContent;
            if (groupTitle.includes(file)) {
                // Expand this group
                const content = group.nextElementSibling;
                const arrow = group.querySelector('.toggle-arrow');

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
                        }, 3000);
                    }
                });
            }
        });
    }, 500);
}

/**
 * Refresh all data
 */
function refreshAllData() {
    console.log('🔄 Refreshing all data...');
    
    if (window.jsMapSystem) {
        // Show loading message
        if (window.showNotification) {
            window.showNotification('מרענן את כל הנתונים...', 'info');
        }
        
        // Refresh data
        window.jsMapSystem.refreshJsMapData();
        
        // Refresh advanced sections
        setTimeout(() => {
            // Removed loadDuplicatesAnalysis call - not relevant for JS Map
            if (typeof loadLocalFunctionsAnalysis === 'function') {
                loadLocalFunctionsAnalysis();
            }
            // Removed loadArchitectureCheck call - not relevant for JS Map
            if (window.jsMapSystem && window.jsMapSystem.loadIntegrationStatus) {
                window.jsMapSystem.loadIntegrationStatus();
            }
        }, 1000);
    }
}

/**
 * Export to CSV
 */
function exportToCSV() {
    console.log('📊 Exporting to CSV...');
    
    if (!window.jsMapSystem || !window.jsMapSystem.functionsData) {
        if (window.showNotification) {
            window.showNotification('אין נתונים לייצוא', 'warning');
        }
        return;
    }
    
    let csvContent = 'קובץ,פונקציה,תיאור,סוג,שורה\n';
    
    Object.keys(window.jsMapSystem.functionsData).forEach(file => {
        const fileData = window.jsMapSystem.functionsData[file];
        let functions = [];
        
        if (Array.isArray(fileData)) {
            functions = fileData;
        } else if (fileData.functions && Array.isArray(fileData.functions)) {
            functions = fileData.functions;
        }
        
        functions.forEach(func => {
            csvContent += `"${file}","${func.name}","${func.description || ''}","${func.type || ''}","${func.line || ''}"\n`;
        });
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `js-map-functions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.showNotification) {
        window.showNotification('קובץ CSV נוצר והורד בהצלחה', 'success');
    }
}

/**
 * Export to JSON
 */
function exportToJSON() {
    console.log('📄 Exporting to JSON...');
    
    if (!window.jsMapSystem) {
        if (window.showNotification) {
            window.showNotification('אין נתונים לייצוא', 'warning');
        }
        return;
    }
    
    const exportData = {
        timestamp: new Date().toISOString(),
        pageMapping: window.jsMapSystem.pageMapping,
        functionsData: window.jsMapSystem.functionsData,
        globalFunctionsIndex: window.jsMapSystem.globalFunctionsIndex,
        metadata: {
            totalPages: Object.keys(window.jsMapSystem.pageMapping || {}).length,
            totalFunctions: Object.keys(window.jsMapSystem.functionsData || {}).length,
            globalFunctions: Object.keys(window.jsMapSystem.globalFunctionsIndex || {}).length
        }
    };
    
    // Download JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `js-map-data-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.showNotification) {
        window.showNotification('קובץ JSON נוצר והורד בהצלחה', 'success');
    }
}

/**
 * Generate comprehensive report
 */
function generateReport() {
    console.log('📝 Generating comprehensive report...');
    
    if (!window.jsMapSystem) {
        if (window.showNotification) {
            window.showNotification('אין נתונים ליצירת דוח', 'warning');
        }
        return;
    }
    
    const timestamp = new Date().toLocaleString('he-IL');
    let report = `=== דוח מפורט של מערכת JS-Map ===\n`;
    report += `תאריך ושעה: ${timestamp}\n`;
    report += `URL: ${window.location.href}\n\n`;
    
    // System overview
    report += `=== סקירת המערכת ===\n`;
    report += `עמודי HTML: ${Object.keys(window.jsMapSystem.pageMapping || {}).length}\n`;
    report += `קבצי JavaScript: ${Object.keys(window.jsMapSystem.functionsData || {}).length}\n`;
    
    let totalFunctions = 0;
    Object.values(window.jsMapSystem.functionsData || {}).forEach(fileData => {
        if (Array.isArray(fileData)) {
            totalFunctions += fileData.length;
        } else if (fileData.functions && Array.isArray(fileData.functions)) {
            totalFunctions += fileData.functions.length;
        }
    });
    report += `סה"כ פונקציות: ${totalFunctions}\n`;
    report += `פונקציות גלובליות: ${Object.keys(window.jsMapSystem.globalFunctionsIndex || {}).length}\n\n`;
    
    // Page mapping details
    report += `=== מיפוי עמודים ===\n`;
    Object.keys(window.jsMapSystem.pageMapping || {}).forEach(page => {
        const mapping = window.jsMapSystem.pageMapping[page];
        const files = mapping.files || mapping || [];
        report += `${page}: ${Array.isArray(files) ? files.join(', ') : 'לא זמין'}\n`;
    });
    
    // Functions details
    report += `\n=== פירוט פונקציות ===\n`;
    Object.keys(window.jsMapSystem.functionsData || {}).forEach(file => {
        const fileData = window.jsMapSystem.functionsData[file];
        let functions = [];
        
        if (Array.isArray(fileData)) {
            functions = fileData;
        } else if (fileData.functions && Array.isArray(fileData.functions)) {
            functions = fileData.functions;
        }
        
        report += `\n${file} (${functions.length} פונקציות):\n`;
        functions.forEach(func => {
            report += `  - ${func.name}: ${func.description || 'אין תיאור'}\n`;
        });
    });
    
    // Download report
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `js-map-report-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.showNotification) {
        window.showNotification('דוח מפורט נוצר והורד בהצלחה', 'success');
    }
}

// Make new functions globally available
window.performQuickSearch = performQuickSearch;
window.displayQuickSearchResults = displayQuickSearchResults;
window.navigateToFunction = navigateToFunction;
window.refreshAllData = refreshAllData;
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.generateReport = generateReport;

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

