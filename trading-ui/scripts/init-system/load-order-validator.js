/**
 * Load Order Validator - TikTrack Initialization System
 * =====================================================
 * 
 * בדיקת סדר טעינה בפועל בעמודים
 * 
 * Features:
 * - השוואת סדר טעינה בפועל למניפסט
 * - זיהוי אי-התאמות בסדר טעינה
 * - זיהוי סקריפטים שנטענו בסדר שגוי
 * - דוח מפורט עם המלצות תיקון
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


if (window.Logger) {
  window.Logger.debug('🔍 Loading Load Order Validator...', { page: 'load-order-validator' });
}

// #region agent log - H1: Global error detection for script loading blocks
window.addEventListener('error', function(event) {
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      location:'load-order-validator.js:global-error',
      message:'global_script_error_detected',
      data:{
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? event.error.toString() : 'no error object',
        page: window.location.pathname,
        timestamp: Date.now()
      },
      sessionId:'init-loading-debug',
      runId:'init-loading-debug-1',
      hypothesisId:'H1'
    })
  }).catch(()=>{});
});
// #endregion

// #region agent log - H4: Browser cache state detection
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    location:'load-order-validator.js:24',
    message:'browser_cache_state_check',
    data:{
      userAgent: navigator.userAgent,
      cacheEnabled: 'caches' in window,
      performanceNavigationType: performance.getEntriesByType('navigation')[0]?.type,
      page: window.location.pathname,
      timestamp: Date.now()
    },
    sessionId:'init-loading-debug',
    runId:'init-loading-debug-1',
    hypothesisId:'H4'
  })
}).catch(()=>{});
// #endregion

/**
 * Load Order Validator Class
 */
// #region agent log - LoadOrderValidator loaded
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    location:'load-order-validator.js:29',
    message:'LoadOrderValidator_class_defined',
    data:{
      timestamp: Date.now(),
      location: window.location.href
    },
    sessionId:'load-order-debug',
    runId:'load-order-debug-1',
    hypothesisId:'load-order-validator-loading'
  })
}).catch(()=>{});
// #endregion

class LoadOrderValidator {
    constructor() {
        this.manifest = null;
        this.pageConfig = null;
        this.actualLoadOrder = [];
        this.expectedLoadOrder = [];
        this.mismatches = [];
    }

    /**
     * Initialize with package manifest and page config
     */
    init(pageName) {
        if (typeof window.PACKAGE_MANIFEST === 'undefined') {
            if (window.Logger) {
                window.Logger.error('PACKAGE_MANIFEST not found', {}, { page: 'load-order-validator' });
            }
            return false;
        }

        this.manifest = window.PACKAGE_MANIFEST;

        // Get page config
        if (typeof window.PAGE_CONFIGS !== 'undefined' && window.PAGE_CONFIGS[pageName]) {
            this.pageConfig = window.PAGE_CONFIGS[pageName];
        } else if (typeof window.pageInitializationConfigs !== 'undefined' && window.pageInitializationConfigs[pageName]) {
            this.pageConfig = window.pageInitializationConfigs[pageName];
        } else {
            if (window.Logger) {
                window.Logger.warn(`Page config not found for ${pageName}`, {}, { page: 'load-order-validator' });
            }
            return false;
        }

        return true;
    }

    /**
     * Get actual load order from DOM
     */
    getActualLoadOrder() {
        const normalizePath = (path) => {
            // Remove protocol, domain, and query params
            let normalized = path.split('?')[0];
            
            // For external URLs (CDN), keep full URL
            if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
                return normalized.toLowerCase();
            }
            
            // For local scripts, remove scripts/ prefix and get filename
            normalized = normalized.replace(/^.*\/scripts\//, '');
            normalized = normalized.replace(/^scripts\//, '');
            normalized = normalized.replace(/^\//, '');
            
            return normalized.toLowerCase();
        };

        // #region agent log - H1: Script loading blocked by errors
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            location:'load-order-validator.js:105',
            message:'DOM_script_counting_started',
            data:{
              totalScriptsInDOM: document.querySelectorAll('script[src]').length,
              page: window.location.pathname,
              timestamp: Date.now(),
              allScriptTags: Array.from(document.querySelectorAll('script')).map(s => ({src: s.src, type: s.type, defer: s.defer, async: s.async}))
            },
            sessionId:'init-loading-debug',
            runId:'init-loading-debug-1',
            hypothesisId:'H1'
          })
        }).catch(()=>{});
        // #endregion

        const scripts = Array.from(document.querySelectorAll('script[src]'))
            .map((script, index) => {
                const src = script.src;

                // #region agent log - H3: Script timing registration
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
                  method:'POST',
                  headers:{'Content-Type':'application/json'},
                  body:JSON.stringify({
                    location:'load-order-validator.js:106',
                    message:'script_processing_started',
                    data:{
                      index: index,
                      src: src,
                      scriptReadyState: script.readyState,
                      scriptLoaded: script.complete,
                      timestamp: Date.now()
                    },
                    sessionId:'init-loading-debug',
                    runId:'init-loading-debug-1',
                    hypothesisId:'H3'
                  })
                }).catch(()=>{});
                // #endregion

                // Normalize path for comparison
                const normalized = normalizePath(src);

                // Extract filename from path for display
                let filename = src.split('/').pop().split('?')[0];

                // For external URLs, keep full URL
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    filename = src.split('?')[0];
                }

                // Skip bootstrap and font-awesome for now (they're handled separately)
                if (normalized.includes('bootstrap') || normalized.includes('font-awesome')) {
                    return null;
                }

                return {
                    index: index,
                    filename: filename,
                    normalized: normalized,
                    fullPath: src,
                    loadTime: this.getScriptLoadTime(src)
                };
            })
            .filter(Boolean);

        // #region agent log - H5: Script source URL validation
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            location:'load-order-validator.js:133',
            message:'script_processing_completed',
            data:{
              filteredScriptsCount: scripts.length,
              scriptsList: scripts.map(s => ({filename: s.filename, normalized: s.normalized})),
              page: window.location.pathname,
              timestamp: Date.now()
            },
            sessionId:'init-loading-debug',
            runId:'init-loading-debug-1',
            hypothesisId:'H5'
          })
        }).catch(()=>{});
        // #endregion

        this.actualLoadOrder = scripts;
        return scripts;
    }

    /**
     * Get script load time from performance API
     */
    getScriptLoadTime(src) {
        try {
            const perfEntry = performance.getEntriesByName(src, 'resource')[0];
            if (perfEntry) {
                return {
                    start: perfEntry.startTime,
                    duration: perfEntry.duration,
                    end: perfEntry.startTime + perfEntry.duration
                };
            }
        } catch (error) {
            // Performance API might not be available
        }
        return null;
    }

    /**
     * Get expected load order from manifest
     */
    getExpectedLoadOrder() {
        if (!this.pageConfig || !this.pageConfig.packages) {
            return [];
        }

        const expectedScripts = [];
        const packageLoadOrders = [];

        // Get packages and their load orders
        this.pageConfig.packages.forEach(pkgId => {
            const pkg = this.manifest[pkgId];
            if (pkg) {
                packageLoadOrders.push({
                    packageId: pkgId,
                    packageName: pkg.name || pkgId,
                    loadOrder: pkg.loadOrder || 999,
                    scripts: (pkg.scripts || []).map(script => ({
                        file: script.file,
                        loadOrder: script.loadOrder || 999,
                        package: pkgId,
                        packageName: pkg.name || pkgId,
                        required: script.required !== false,
                        description: script.description || ''
                    }))
                });
            }
        });

        // Sort packages by loadOrder
        packageLoadOrders.sort((a, b) => a.loadOrder - b.loadOrder);

        // Flatten scripts and sort by loadOrder within each package
        packageLoadOrders.forEach(pkg => {
            pkg.scripts
                .sort((a, b) => a.loadOrder - b.loadOrder)
                .forEach((script, index) => {
                    expectedScripts.push({
                        file: script.file,
                        filename: script.file.split('/').pop().split('?')[0],
                        loadOrder: script.loadOrder,
                        package: script.package,
                        packageName: script.packageName,
                        required: script.required,
                        description: script.description,
                        expectedIndex: expectedScripts.length
                    });
                });
        });

        this.expectedLoadOrder = expectedScripts;
        return expectedScripts;
    }

    /**
     * Compare actual vs expected load order
     */
    compareLoadOrder() {
        // #region agent log - H2: Load order comparison start
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            location:'load-order-validator.js:324',
            message:'load_order_comparison_started',
            data:{
              expectedScriptsCount: this.expectedLoadOrder.length,
              actualScriptsCount: this.actualLoadOrder.length,
              page: window.location.pathname,
              timestamp: Date.now()
            },
            sessionId:'init-loading-debug',
            runId:'init-loading-debug-1',
            hypothesisId:'H2'
          })
        }).catch(()=>{});
        // #endregion

        this.mismatches = [];

        // Normalize script paths for comparison
        const normalizePath = (path) => {
            // Remove query params
            let normalized = path.split('?')[0];
            
            // For external URLs (CDN), keep full URL
            if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
                return normalized.toLowerCase();
            }
            
            // For local scripts, remove everything before /scripts/ and get relative path
            // Handle both full URLs and relative paths
            const scriptsMatch = normalized.match(/(?:.*\/)?scripts\/(.+)$/);
            if (scriptsMatch) {
                normalized = scriptsMatch[1];
            } else {
                // If no scripts/ found, try to get just the filename
                normalized = normalized.split('/').pop();
            }
            
            return normalized.toLowerCase();
        };

        // Create maps for quick lookup using normalized paths
        const actualMap = new Map();
        this.actualLoadOrder.forEach(script => {
            // Use normalized path from getActualLoadOrder if available, otherwise normalize
            const normalized = script.normalized || normalizePath(script.filename);
            actualMap.set(normalized, script);
        });

        const expectedMap = new Map();
        this.expectedLoadOrder.forEach(script => {
            const normalized = normalizePath(script.file);
            expectedMap.set(normalized, script);
        });

        // Check each expected script
        this.expectedLoadOrder.forEach((expectedScript, expectedIndex) => {
            const normalized = normalizePath(expectedScript.file);
            const actualScript = actualMap.get(normalized);

            if (!actualScript) {
                // Script not found in actual load order
                this.mismatches.push({
                    type: 'missing',
                    script: expectedScript.file,
                    filename: expectedScript.filename,
                    expectedIndex: expectedIndex,
                    expectedLoadOrder: expectedScript.loadOrder,
                    package: expectedScript.package,
                    severity: expectedScript.required ? 'error' : 'warning'
                });
            } else {
                // Check if order matches
                const orderDifference = Math.abs(actualScript.index - expectedIndex);
                
                if (orderDifference > 2) {
                    // Significant order difference
                    this.mismatches.push({
                        type: 'order_mismatch',
                        script: expectedScript.file,
                        filename: expectedScript.filename,
                        expectedIndex: expectedIndex,
                        actualIndex: actualScript.index,
                        expectedLoadOrder: expectedScript.loadOrder,
                        orderDifference: orderDifference,
                        package: expectedScript.package,
                        severity: orderDifference > 5 ? 'error' : 'warning'
                    });
                }
            }
        });

        // Check for scripts in actual but not in expected (extra scripts)
        this.actualLoadOrder.forEach((actualScript, actualIndex) => {
            // Use normalized path from getActualLoadOrder if available
            const normalized = actualScript.normalized || normalizePath(actualScript.filename);
            const expectedScript = expectedMap.get(normalized);

            if (!expectedScript) {
                // Script found in actual but not in expected
                this.mismatches.push({
                    type: 'extra',
                    script: actualScript.fullPath,
                    filename: actualScript.filename,
                    actualIndex: actualIndex,
                    severity: 'info'
                });
            }
        });

        return this.mismatches;
    }

    /**
     * Validate load order for a page
     */
    validate(pageName) {
        // #region agent log - H2: Loading order validation start
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            location:'load-order-validator.js:425',
            message:'load_order_validation_started',
            data:{
              pageName: pageName,
              timestamp: Date.now(),
              page: window.location.pathname
            },
            sessionId:'init-loading-debug',
            runId:'init-loading-debug-1',
            hypothesisId:'H2'
          })
        }).catch(()=>{});
        // #endregion

        if (!this.init(pageName)) {
            // #region agent log - H2: Init failed
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify({
                location:'load-order-validator.js:427',
                message:'load_order_init_failed',
                data:{
                  pageName: pageName,
                  timestamp: Date.now()
                },
                sessionId:'init-loading-debug',
                runId:'init-loading-debug-1',
                hypothesisId:'H2'
              })
            }).catch(()=>{});
            // #endregion
            return null;
        }

        // Get actual and expected load orders
        this.getActualLoadOrder();
        this.getExpectedLoadOrder();

        // Compare
        const mismatches = this.compareLoadOrder();

        // Calculate statistics
        const stats = {
            totalExpected: this.expectedLoadOrder.length,
            totalActual: this.actualLoadOrder.length,
            matches: this.expectedLoadOrder.length - mismatches.filter(m => m.type === 'missing' || m.type === 'order_mismatch').length,
            mismatches: mismatches.length,
            missing: mismatches.filter(m => m.type === 'missing').length,
            orderMismatches: mismatches.filter(m => m.type === 'order_mismatch').length,
            extra: mismatches.filter(m => m.type === 'extra').length,
            errors: mismatches.filter(m => m.severity === 'error').length,
            warnings: mismatches.filter(m => m.severity === 'warning').length,
            info: mismatches.filter(m => m.severity === 'info').length
        };

        return {
            pageName: pageName,
            timestamp: new Date().toISOString(),
            actualLoadOrder: this.actualLoadOrder,
            expectedLoadOrder: this.expectedLoadOrder,
            mismatches: mismatches,
            stats: stats
        };
    }

    /**
     * Display validation results
     */
    displayResults(results) {
        if (!results) {
            if (typeof showNotification === 'function') {
                showNotification('לא ניתן לבצע בדיקה - חסרים נתונים', 'error');
            }
            return;
        }

        const html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-list-ol"></i> סיכום בדיקת סדר טעינה - ${results.pageName}</h6>
                <p><strong>סקריפטים צפויים:</strong> ${results.stats.totalExpected}</p>
                <p><strong>סקריפטים בפועל:</strong> ${results.stats.totalActual}</p>
                <p><strong>התאמות:</strong> ${results.stats.matches}</p>
                <p><strong>אי-התאמות:</strong> ${results.stats.mismatches}</p>
                <p><strong>סקריפטים חסרים:</strong> ${results.stats.missing}</p>
                <p><strong>אי-התאמות בסדר:</strong> ${results.stats.orderMismatches}</p>
                <p><strong>סקריפטים נוספים:</strong> ${results.stats.extra}</p>
                <p><strong>שגיאות:</strong> ${results.stats.errors}</p>
                <p><strong>אזהרות:</strong> ${results.stats.warnings}</p>
            </div>

            ${results.mismatches.length > 0 ? `
                <div class="alert ${results.stats.errors > 0 ? 'alert-danger' : 'alert-warning'}">
                    <h6><i class="fas fa-exclamation-triangle"></i> אי-התאמות שנמצאו (${results.mismatches.length})</h6>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>סוג</th>
                                    <th>סקריפט</th>
                                    <th>פרטים</th>
                                    <th>חומרה</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.mismatches.map((mismatch, index) => `
                                    <tr>
                                        <td><span class="badge bg-info">${mismatch.type}</span></td>
                                        <td><code>${mismatch.filename || mismatch.script}</code></td>
                                        <td>
                                            ${mismatch.type === 'missing' ? `
                                                צפוי במיקום ${mismatch.expectedIndex}, LoadOrder: ${mismatch.expectedLoadOrder}
                                            ` : ''}
                                            ${mismatch.type === 'order_mismatch' ? `
                                                צפוי: ${mismatch.expectedIndex}, בפועל: ${mismatch.actualIndex}, הפרש: ${mismatch.orderDifference}
                                            ` : ''}
                                            ${mismatch.type === 'extra' ? `
                                                נמצא במיקום ${mismatch.actualIndex} אבל לא צפוי
                                            ` : ''}
                                        </td>
                                        <td>
                                            <span class="badge ${mismatch.severity === 'error' ? 'bg-danger' : mismatch.severity === 'warning' ? 'bg-warning' : 'bg-info'}">
                                                ${mismatch.severity}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : `
                <div class="alert alert-success">
                    <h6><i class="fas fa-check-circle"></i> סדר טעינה תקין!</h6>
                    <p>כל הסקריפטים נטענו בסדר הנכון.</p>
                </div>
            `}

            <div class="text-center mt-3">
                <button class="btn btn-primary" onclick="loadOrderValidator.exportResults()">
                    <i class="fas fa-download"></i> ייצא תוצאות JSON
                </button>
            </div>
        `;

        if (typeof window.showDetailsModal === 'function') {
            window.showDetailsModal(`🔍 תוצאות בדיקת סדר טעינה - ${results.pageName}`, html);
        } else {
            console.log('Load Order Validation Results:', results);
        }

        // Save results globally
        window.loadOrderValidationResults = results;
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        if (!window.loadOrderValidationResults) {
            if (typeof showNotification === 'function') {
                showNotification('אין תוצאות לייצוא', 'warning');
            }
            return;
        }

        const json = JSON.stringify(window.loadOrderValidationResults, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `load-order-validation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('תוצאות יוצאו בהצלחה', 'success');
        }
    }

    /**
     * Run validation and display results
     */
    run(pageName) {
        const results = this.validate(pageName);
        this.displayResults(results);
        return results;
    }
}

// Create global instance
const loadOrderValidator = new LoadOrderValidator();

// Export globally
window.loadOrderValidator = loadOrderValidator;
window.LoadOrderValidator = LoadOrderValidator;

if (window.Logger) {
  window.Logger.debug('✅ Load Order Validator loaded successfully', { page: 'load-order-validator' });
}

// #region agent log - LoadOrderValidator fully loaded
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    location:'load-order-validator.js:483',
    message:'LoadOrderValidator_fully_loaded',
    data:{
      timestamp: Date.now(),
      LoadOrderValidator: typeof window.LoadOrderValidator,
      loadOrderValidator: typeof window.loadOrderValidator,
      location: window.location.href
    },
    sessionId:'load-order-debug',
    runId:'load-order-debug-1',
    hypothesisId:'load-order-validator-loading'
  })
}).catch(()=>{});
// #endregion
