/**
 * Monitoring Functions - TikTrack Frontend
 * ========================================
 * 
 * פונקציות ניטור משופרות - בדיקה כפולה HTML+DOM
 * 
 * Features:
 * - runDetailedPageScan - סריקה מפורטת של עמוד
 * - waitForPageFullyLoaded - המתנה לטעינה מלאה
 * - checkForMismatches - בדיקת אי-התאמות (משופרת עם HTML+DOM)
 * - parseHTMLFile - קריאת ופרסור קובץ HTML
 * - extractScriptsFromHTML - חילוץ סקריפטים מקובץ HTML
 * - compareHTMLvsDOM - השוואה מפורטת בין HTML ל-DOM
 * - getPackageDocumentation - מידע על תיעוד החבילות
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md
 * 
 * @author TikTrack Development Team
 * @version 2.0.0
 * @lastUpdated January 27, 2025
 */

if (window.Logger) {
  window.Logger.info('🔍 Loading Monitoring Functions...', { page: 'monitoring' });
}

/**
 * Wait for page to be fully loaded
 */
async function waitForPageFullyLoaded() {
    return new Promise((resolve) => {
        // Check if page is already fully loaded
        if (document.readyState === 'complete') {
            // Wait a bit more for all scripts to initialize
            setTimeout(resolve, 1000);
            return;
        }

        // Wait for page to be fully loaded
        window.addEventListener('load', () => {
            // Wait a bit more for all scripts to initialize
            setTimeout(resolve, 1000);
        });
    });
}

/**
 * Enhanced monitoring with real-time error detection and HTML+DOM comparison
 * @param {string} pageName - Name of the page
 * @param {Object} pageConfig - Page configuration
 * @param {Array<Object>} htmlScripts - Optional: Scripts extracted from HTML file
 */
async function checkForMismatches(pageName, pageConfig, htmlScripts = null) {
    
    // Real-time error detection - capture 404 errors for scripts
    const errorLog = [];
    const script404Errors = []; // Track script 404 errors specifically
    
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const errorMessage = args.join(' ');
        // Check for script 404 errors
        if (errorMessage.includes('404') || errorMessage.includes('NOT FOUND') || errorMessage.includes('ERR_ABORTED')) {
            // Try to extract script name from error
            const scriptMatch = errorMessage.match(/scripts\/[^\s'"]+\.js/);
            if (scriptMatch) {
                const scriptPath = scriptMatch[0].replace('scripts/', '');
                if (!script404Errors.find(e => e.file === scriptPath)) {
                    script404Errors.push({
                        file: scriptPath,
                        error: errorMessage,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
        errorLog.push({
            timestamp: new Date().toISOString(),
            message: errorMessage,
            stack: new Error().stack
        });
        originalConsoleError.apply(console, args);
    };
    
    // Also monitor network errors via Performance API
    const networkErrors = [];
    const performanceEntries = performance.getEntriesByType('resource');
    performanceEntries.forEach(entry => {
        if (entry.name.includes('.js') && (entry.name.includes('/scripts/') || entry.name.includes('scripts/'))) {
            // Check if script failed to load (status 0 means network error or 404)
            // Note: Performance API doesn't always show HTTP status, so we check transferSize
            // transferSize === 0 often indicates a failed load, but not always reliable
            // Better to rely on console errors captured above
        }
    });
    
    const loadedScripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src.split('/').pop().split('?')[0])
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));
    
    // Also collect full paths for duplicate detection
    const loadedScriptsFullPaths = Array.from(document.querySelectorAll('script[src]'))
        .map(script => {
            const src = script.src.split('?')[0];
            try {
                // Extract relative path from full URL (remove protocol, host, port)
                const url = new URL(src, window.location.origin);
                const relativePath = url.pathname;
                // Remove leading slash and normalize
                return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            } catch (e) {
                // Fallback: if URL parsing fails, try to extract path manually
                // Remove protocol and domain
                let relativePath = src;
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    const pathMatch = src.match(/https?:\/\/[^\/]+(\/.*)/);
                    if (pathMatch) {
                        relativePath = pathMatch[1];
                    }
                }
                // Remove leading slash
                return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            }
        })
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));
    
    
    // Check for scripts not defined in manifest
    const manifestScripts = [];
    if (window.PACKAGE_MANIFEST) {
        Object.values(window.PACKAGE_MANIFEST).forEach(pkg => {
            if (pkg.scripts) {
                pkg.scripts.forEach(script => {
                    manifestScripts.push(script.file);
                });
            }
        });
    }
    
    // Known dynamic scripts that are expected (page-specific or mockup-specific)
    const knownDynamicScripts = [
        'mockups-icon-initializer.js',
        'trading-journal-page.js',
        'date-comparison-modal.js',
        'trade-history-page.js',
        'portfolio-state-page.js',
        'price-history-page.js',
        'comparative-analysis-page.js',
        'strategy-analysis-page.js',
        'economic-calendar-page.js',
        'history-widget.js',
        'emotional-tracking-widget.js',
        'tradingview-test-page.js',
        'heatmap-visual-example.js'
    ];
    
    // Check undefined scripts - compare both full paths and filenames
    const undefinedScripts = loadedScripts.filter(loadedScript => {
        // Check if script exists in manifest (by filename or full path)
        const scriptFilename = loadedScript.split('/').pop().split('?')[0];
        const foundInManifest = manifestScripts.some(manifestScript => {
            const manifestFilename = manifestScript.split('/').pop().split('?')[0];
            return manifestScript.includes(loadedScript) || 
                   loadedScript.includes(manifestScript) || 
                   scriptFilename === manifestFilename;
        });
        
        // Check if it's a known dynamic script
        const isKnownDynamic = knownDynamicScripts.some(name => 
            loadedScript.includes(name) || scriptFilename === name
        );
        
        // Check if it's a page-specific script (same name as page)
        const isPageSpecific = scriptFilename === `${pageName}.js` || 
                              loadedScript.includes(`${pageName}.js`);
        
        return !foundInManifest && 
               !isKnownDynamic &&
               !isPageSpecific &&
               !loadedScript.includes('bootstrap') && 
               !loadedScript.includes('font-awesome');
    });
    
    if (undefinedScripts.length > 0) {
        console.warn(`⚠️ Undefined scripts found:`, undefinedScripts);
    }
    
    // Check for circular dependencies
    const circularDependencies = [];
    if (window.PACKAGE_MANIFEST) {
        Object.entries(window.PACKAGE_MANIFEST).forEach(([pkgName, pkg]) => {
            if (pkg.dependencies) {
                pkg.dependencies.forEach(dep => {
                    const depPkg = window.PACKAGE_MANIFEST[dep];
                    if (depPkg && depPkg.dependencies && depPkg.dependencies.includes(pkgName)) {
                        circularDependencies.push(`${pkgName} ↔ ${dep}`);
                    }
                });
            }
        });
    }
    
    if (circularDependencies.length > 0) {
        console.error(`🔄 Circular dependencies detected:`, circularDependencies);
    }
    
    // Version validation
    const versionMismatches = [];
    if (window.PACKAGE_MANIFEST) {
        Object.entries(window.PACKAGE_MANIFEST).forEach(([pkgName, pkg]) => {
            if (pkg.version && pkg.scripts) {
                pkg.scripts.forEach(script => {
                    const scriptElement = document.querySelector(`script[src*="${script.file}"]`);
                    if (scriptElement) {
                        const src = scriptElement.src;
                        const expectedVersion = pkg.version;
                        const actualVersion = src.match(/v=([^&]+)/)?.[1] || 'unknown';
                        if (expectedVersion !== actualVersion && actualVersion !== 'unknown') {
                            versionMismatches.push({
                                script: script.file,
                                expected: expectedVersion,
                                actual: actualVersion
                            });
                        }
                    }
                });
            }
        });
    }
    
    if (versionMismatches.length > 0) {
        console.warn(`📦 Version mismatches detected:`, versionMismatches);
    }
    
    const requiredScripts = [];
    const pageSpecificScripts =
        Array.isArray(pageConfig?.pageSpecificScripts) ? pageConfig.pageSpecificScripts.filter(Boolean) : [];
    const normalizedPageSpecificScripts = pageSpecificScripts.map(script =>
        script.split('/').pop().split('?')[0]
    );
    const requiredGlobals = pageConfig.requiredGlobals || [];
    
    // Collect required scripts from packages
    // Also collect optional scripts (required: false) for reference
    const optionalScripts = [];
    if (pageConfig.packages && window.PACKAGE_MANIFEST) {
        pageConfig.packages.forEach(packageId => {
            const pkg = window.PACKAGE_MANIFEST[packageId];
            if (pkg && pkg.scripts) {
                pkg.scripts.forEach(script => {
                    if (script.required !== false) { // Include required: true and undefined (defaults to required)
                        requiredScripts.push(script.file);
                    } else {
                        optionalScripts.push(script.file); // Track optional scripts separately
                    }
                });
            }
        });
    }

    if (pageSpecificScripts.length > 0) {
        pageSpecificScripts.forEach(script => {
            requiredScripts.push(script);
        });
    }
    
    
    const mismatches = [];
    const duplicates = [];
    const loadOrderIssues = [];
    
    // Check for missing scripts
    requiredScripts.forEach(requiredScript => {
        // Extract filename from path (e.g., "services/data-collection-service.js" -> "data-collection-service.js")
        const scriptFilename = requiredScript.split('/').pop();
        
        // Check if this is an external script (CDN) - need to check full URL
        const isExternalScript = requiredScript.startsWith('http://') || requiredScript.startsWith('https://');
        
        // Check if script is in 404 errors list
        const script404 = script404Errors.find(e => {
            const errorFilename = e.file.split('/').pop();
            const requiredFilename = scriptFilename.split('?')[0];
            return errorFilename === requiredFilename || e.file === requiredScript;
        });
        
        // For external scripts, check full URL in DOM
        let isLoaded = false;
        if (isExternalScript) {
            // Check if external script is loaded by checking DOM for full URL
            const scriptElement = Array.from(document.querySelectorAll('script[src]')).find(script => {
                const src = script.src.split('?')[0]; // Remove query params
                return src === requiredScript || src.includes(requiredScript.split('/').pop());
            });
            isLoaded = !!scriptElement;
        } else {
            // Normalize required script - handle both relative and absolute paths
            const normalizedRequired = requiredScript.split('?')[0].toLowerCase();
            const requiredFilename = normalizedRequired.split('/').pop();
            
            // Generate all possible path variations for the required script
            const possiblePaths = [
                normalizedRequired, // Original: "api-config.js" or "scripts/api-config.js"
                `scripts/${normalizedRequired}`, // With scripts/ prefix: "scripts/api-config.js"
                normalizedRequired.replace(/^scripts\//, ''), // Without scripts/ prefix: "api-config.js"
                requiredFilename // Just filename: "api-config.js"
            ];
            
            // First, check against loadedScriptsFullPaths (full paths from DOM)
            isLoaded = loadedScriptsFullPaths.some(loadedScriptFullPath => {
                const normalizedLoaded = loadedScriptFullPath.toLowerCase();
                const loadedFilename = normalizedLoaded.split('/').pop();
                
                // Check all possible path variations
                for (const possiblePath of possiblePaths) {
                    if (normalizedLoaded === possiblePath ||
                        normalizedLoaded.endsWith('/' + possiblePath) ||
                        normalizedLoaded.endsWith(possiblePath) ||
                        normalizedLoaded.includes('/' + possiblePath)) {
                        return true;
                    }
                }
                
                // Final check: filename match (case-insensitive)
                return loadedFilename === requiredFilename;
            });
            
            // If not found in full paths, check against filenames only
            if (!isLoaded) {
                isLoaded = loadedScripts.some(loadedScript => {
                    // Extract filename from both (case-insensitive)
                    const loadedFilename = loadedScript.split('/').pop().split('?')[0].toLowerCase();
                    return loadedFilename === requiredFilename;
                });
            }
        }
        
        if (!isLoaded || script404) {
            mismatches.push({
                type: 'missing_script',
                message: script404 
                    ? `סקריפט חסר: ${requiredScript} - שגיאת 404 (קובץ לא קיים בשרת)`
                    : `סקריפט חסר: ${requiredScript} - מתועד אבל לא נטען`,
                severity: 'error',
                fileNotFound: !!script404,
                error: script404?.error
            });
        }
    });
    
    // Also check for 404 errors on scripts that ARE in manifest but failed to load
    script404Errors.forEach(error => {
        // Check if this script is in required scripts (already handled above)
        // or if it's an optional script that failed
        const isRequired = requiredScripts.some(req => {
            const reqFilename = req.split('/').pop().split('?')[0];
            const errorFilename = error.file.split('/').pop();
            return reqFilename === errorFilename;
        });
        
        if (!isRequired) {
            // This is an optional script or undefined script that failed
            mismatches.push({
                type: 'script_404_error',
                message: `שגיאת 404: ${error.file} - קובץ לא קיים בשרת (לא במניפסט)`,
                severity: 'error',
                fileNotFound: true,
                error: error.error
            });
        }
    });
    
    // Check for extra scripts (loaded but not documented)
    loadedScripts.forEach(loadedScript => {
        // Check if this script is documented (either as full path or just filename)
        // Also check optional scripts (required: false)
        const loadedFilename = loadedScript.split('/').pop().split('?')[0];
        let isDocumented = requiredScripts.some(requiredScript => {
            const requiredFilename = requiredScript.split('/').pop().split('?')[0];
            return requiredScript === loadedScript || requiredFilename === loadedFilename || loadedScript.includes(requiredScript);
        });
        
        // Check if script exists in manifest as optional (required: false)
        // IMPORTANT: Check ALL packages in manifest, not just those in pageConfig.packages
        // because optional scripts may be in packages not listed in PAGE_CONFIGS
        let isOptionalScript = false;
        if (window.PACKAGE_MANIFEST) {
            // Check all packages in manifest
            for (const pkgName of Object.keys(window.PACKAGE_MANIFEST)) {
                const pkg = window.PACKAGE_MANIFEST[pkgName];
                if (pkg && pkg.scripts) {
                    const scriptFilename = loadedScript.split('/').pop().split('?')[0];
                    const foundScript = pkg.scripts.find(s => {
                        const scriptFile = s.file.split('/').pop().split('?')[0];
                        return scriptFile === scriptFilename || loadedScript.includes(s.file);
                    });
                    if (foundScript) {
                        // Script is in manifest - if required: false, it's optional but documented
                        if (foundScript.required === false) {
                            isOptionalScript = true;
                            break;
                        } else {
                            // Check if this package is in pageConfig.packages for required scripts
                            if (pageConfig.packages && pageConfig.packages.includes(pkgName)) {
                                isDocumented = true; // It's a required script in a page package
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Check if this is a page-specific script (same name as page)
        const isPageSpecificScript = loadedScript.includes(`${pageName}.js`);
        const isCustomPageSpecificScript = normalizedPageSpecificScripts.includes(loadedFilename);
        
        // Allowed system scripts that don't need to be in manifest
        // Also check if script is part of entity-details package (modal-navigation-manager, modal-manager-v2)
        const allowedSystemScripts = [
            'init-system', 'bootstrap', 'font-awesome', 'monitoring-functions',
            'init-system-check', 'package-manifest', 'page-initialization-configs',
            'unified-app-initializer', 'info-summary-system', 'info-summary-configs',
            'modal-navigation-manager', 'modal-manager-v2', // These are loaded manually but are valid
            'mockups-icon-initializer' // Mockup-specific icon initializer
        ];
        let isAllowedSystemScript = allowedSystemScripts.some(allowed => loadedScript.includes(allowed));
        
        // Check if script is part of entity-details package (even if modules package is not included)
        // modal-navigation-manager and modal-manager-v2 are often loaded with entity-details
        if (!isAllowedSystemScript && pageConfig.packages && pageConfig.packages.includes('entity-details')) {
            const entityDetailsScripts = ['modal-navigation-manager', 'modal-manager-v2'];
            const scriptName = loadedScript.split('/').pop().split('?')[0];
            if (entityDetailsScripts.some(name => scriptName.includes(name))) {
                isAllowedSystemScript = true; // Consider it allowed if entity-details is included
            }
        }
        
        if (!isDocumented && !isOptionalScript &&
            !isPageSpecificScript &&
            !isCustomPageSpecificScript &&
            !isAllowedSystemScript) {
            mismatches.push({
                type: 'extra_script',
                message: `סקריפט נוסף: ${loadedScript.split('/').pop().split('?')[0]} - נטען אבל לא מתועד`,
                severity: 'warning'
            });
        }
    });
    
    // Check for duplicates (both filename and full path)
    const scriptCounts = {};
    const scriptCountsFullPaths = {};
    
    // Check filename duplicates
    loadedScripts.forEach(script => {
        scriptCounts[script] = (scriptCounts[script] || 0) + 1;
    });
    
    // Check full path duplicates
    loadedScriptsFullPaths.forEach(script => {
        scriptCountsFullPaths[script] = (scriptCountsFullPaths[script] || 0) + 1;
    });
    
    // Report filename duplicates
    Object.entries(scriptCounts).forEach(([script, count]) => {
        if (count > 1) {
            duplicates.push(script);
            mismatches.push({
                type: 'duplicate_script',
                message: `כפילות: ${script} נטען ${count} פעמים`,
                severity: 'error'
            });
        }
    });
    
    // Report full path duplicates
    Object.entries(scriptCountsFullPaths).forEach(([script, count]) => {
        if (count > 1) {
            const filename = script.split('/').pop();
            if (!duplicates.includes(filename)) { // Avoid double reporting
                duplicates.push(script);
                mismatches.push({
                    type: 'duplicate_script',
                    message: `כפילות: ${script} נטען ${count} פעמים`,
                    severity: 'error'
                });
            }
        }
    });
    
    // Check loading order for page-specific scripts
    const pageSpecificScript = `${pageName}.js`;
    const pageScriptIndex = loadedScripts.indexOf(pageSpecificScript);
    
    const pageSpecificScriptLoadedViaPackage =
        pageConfig.packages &&
        window.PACKAGE_MANIFEST &&
        pageConfig.packages.some(pkgName => {
            const pkg = window.PACKAGE_MANIFEST[pkgName];
            if (!pkg || !pkg.scripts) {
                return false;
            }
            return pkg.scripts.some(script => {
                const scriptFilename = script.file.split('/').pop().split('?')[0];
                return scriptFilename === pageSpecificScript;
            });
        });
    
    if (pageScriptIndex !== -1) {
        // Page-specific script should be loaded after initialization scripts
        const initScripts = ['package-manifest.js', 'page-initialization-configs.js', 'unified-app-initializer.js'];
        const lastInitIndex = Math.max(...initScripts.map(script => loadedScripts.indexOf(script)).filter(i => i !== -1));
        
        if (!pageSpecificScriptLoadedViaPackage && lastInitIndex !== -1 && pageScriptIndex < lastInitIndex) {
            loadOrderIssues.push({
                type: 'loading_order',
                message: `סדר טעינה שגוי: ${pageSpecificScript} נטען לפני סקריפטי האתחול`,
                severity: 'warning'
            });
        }
    }
    
    // Check modal config loading order - modal configs MUST load before ModalManagerV2
    const allScripts = Array.from(document.querySelectorAll('script[src]'));
    const modalManagerIndex = allScripts.findIndex(s => s.src.includes('modal-manager-v2.js'));
    
    if (modalManagerIndex !== -1 && window.PACKAGE_MANIFEST) {
        // Check all modal configs
        Object.values(window.PACKAGE_MANIFEST).forEach(pkg => {
            if (pkg.scripts) {
                pkg.scripts.forEach(script => {
                    if (script.file.includes('modal-configs/') && script.required !== false) {
                        const configScriptIndex = allScripts.findIndex(s => s.src.includes(script.file));
                        if (configScriptIndex !== -1 && configScriptIndex > modalManagerIndex) {
                            loadOrderIssues.push({
                                type: 'modal_config_order',
                                message: `⚠️ סדר טעינה שגוי: ${script.file} נטען אחרי modal-manager-v2.js - צריך להיות לפני! ModalManagerV2 צריך את הקונפיגורציה כדי ליצור את המודל.`,
                                severity: 'error',
                                script: script.file,
                                shouldLoadBefore: 'modal-manager-v2.js'
                            });
                        }
                    }
                });
            }
        });
    }
    
    // Check package loading order - IMPROVED: Check relative order within packages and between packages
    if (pageConfig.packages && window.PACKAGE_MANIFEST) {
        // Get all packages for this page
        const pagePackages = pageConfig.packages.map(pkgName => {
            // Find package by ID (exact match first)
            const pkgById = window.PACKAGE_MANIFEST[pkgName];
            if (pkgById) return { ...pkgById, id: pkgName };
            
            // Fallback: Find by name
            for (const [key, pkg] of Object.entries(window.PACKAGE_MANIFEST)) {
                if (key === pkgName || (pkg.name && pkg.name.toLowerCase().includes(pkgName.toLowerCase()))) {
                    return { ...pkg, id: key };
                }
            }
            return null;
        }).filter(Boolean);
        
        // Sort packages by loadOrder
        const sortedPackages = pagePackages.sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
        
        // Check relative order within each package and between packages
        sortedPackages.forEach((pkg, pkgIndex) => {
            if (!pkg.scripts || pkg.scripts.length === 0) return;
            
            // Get all scripts from this package that should be loaded (required only)
            const pkgScripts = pkg.scripts
                .filter(script => script.required !== false)
                .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0)); // Sort by loadOrder within package
            
            // Find where these scripts are actually loaded
            const pkgScriptPositions = pkgScripts.map(script => {
                const scriptFilename = script.file.split('/').pop().split('?')[0];
                const actualIndex = loadedScripts.findIndex(loaded => loaded === scriptFilename);
                return { 
                    script: script.file, 
                    scriptName: script.file.split('/').pop(),
                    expectedOrder: script.loadOrder || 999, 
                    actualIndex 
                };
            }).filter(pos => pos.actualIndex !== -1); // Only scripts that are actually loaded
            
            // Check relative order within the package
            for (let i = 0; i < pkgScriptPositions.length - 1; i++) {
                const current = pkgScriptPositions[i];
                const next = pkgScriptPositions[i + 1];
                
                // If current script comes after next script, order is wrong
                if (current.actualIndex > next.actualIndex) {
                    console.warn('[init-monitor] Package script order mismatch detected', {
                        packageName: pkg.name || pkg.id,
                        currentScript: current,
                        nextScript: next,
                        loadedScripts
                    });
                    loadOrderIssues.push({
                        type: 'loading_order',
                        message: `סדר טעינה שגוי בחבילה ${pkg.name || pkg.id}: ${current.scriptName} נטען אחרי ${next.scriptName} (צריך להיות לפני)`,
                        severity: 'warning'
                    });
                }
            }
            
            // Check if package scripts come before scripts from later packages
            if (pkgIndex < sortedPackages.length - 1) {
                const nextPkg = sortedPackages[pkgIndex + 1];
                const nextPkgScripts = (nextPkg.scripts || [])
                    .filter(script => script.required !== false)
                    .map(script => {
                        const scriptFilename = script.file.split('/').pop().split('?')[0];
                        const actualIndex = loadedScripts.findIndex(loaded => loaded === scriptFilename);
                        return { script: script.file, actualIndex };
                    })
                    .filter(pos => pos.actualIndex !== -1);
                
                if (nextPkgScripts.length > 0 && pkgScriptPositions.length > 0) {
                    const lastCurrentPkgScript = Math.max(...pkgScriptPositions.map(p => p.actualIndex));
                    const firstNextPkgScript = Math.min(...nextPkgScripts.map(p => p.actualIndex));
                    
                    if (lastCurrentPkgScript > firstNextPkgScript) {
                        console.warn('[init-monitor] Cross-package order mismatch detected', {
                            currentPackage: pkg.name || pkg.id,
                            nextPackage: nextPkg.name || nextPkg.id,
                            currentPackageScripts: pkgScriptPositions,
                            nextPackageScripts: nextPkgScripts,
                            loadedScripts
                        });
                        loadOrderIssues.push({
                            type: 'loading_order',
                            message: `סדר טעינה שגוי בין חבילות: סקריפטים מחבילה ${pkg.name || pkg.id} נטענו אחרי סקריפטים מחבילה ${nextPkg.name || nextPkg.id}`,
                            severity: 'error'
                        });
                    }
                }
            }
        });
    }
    
    // Check for missing globals
    requiredGlobals.forEach(globalVar => {
        // Handle both 'window.GlobalName' and 'GlobalName' formats
        const globalName = globalVar.replace(/^window\./, '');
        const globalPath = globalVar.startsWith('window.') ? globalVar.split('.') : [globalVar];
        
        // Check if global exists (handle nested paths like window.tickerService.getTickers)
        let exists = false;
        if (globalPath.length === 1) {
            exists = typeof window[globalName] !== 'undefined';
        } else {
            // For nested paths like window.tickerService, check if the object exists
            let obj = window;
            for (let i = 1; i < globalPath.length; i++) {
                if (typeof obj[globalPath[i]] === 'undefined') {
                    exists = false;
                    break;
                }
                obj = obj[globalPath[i]];
                exists = true;
            }
        }
        
        if (!exists) {
            // Check if this global should come from a package
            let suggestedPackage = null;
            let loadOrderIssue = null;
            
            if (window.PACKAGE_MANIFEST) {
                // Check modules package for loadUserPreferences
                if (globalName === 'loadUserPreferences' || globalVar.includes('loadUserPreferences')) {
                    const modulesPkg = window.PACKAGE_MANIFEST['modules'];
                    if (modulesPkg && !pageConfig.packages?.includes('modules')) {
                        suggestedPackage = 'modules';
                    }
                }
                // Check entity-services package for tickerService
                if (globalName === 'tickerService' || globalVar.includes('tickerService')) {
                    const entityServicesPkg = window.PACKAGE_MANIFEST['entity-services'];
                    if (entityServicesPkg && !pageConfig.packages?.includes('entity-services')) {
                        suggestedPackage = 'entity-services';
                    }
                }
                
                // Check for modal configs - they must load BEFORE ModalManagerV2
                if (globalName.includes('ModalConfig') || globalVar.includes('ModalConfig')) {
                    // Find the script that should provide this global
                    Object.values(window.PACKAGE_MANIFEST).forEach(pkg => {
                        if (pkg.scripts) {
                            pkg.scripts.forEach(script => {
                                if (script.globalCheck === globalVar || script.globalCheck === `window.${globalName}`) {
                                    // Check if modal-manager-v2.js loads before this config
                                    const allScripts = Array.from(document.querySelectorAll('script[src]'));
                                    const configScriptIndex = allScripts.findIndex(s => s.src.includes(script.file));
                                    const modalManagerIndex = allScripts.findIndex(s => s.src.includes('modal-manager-v2.js'));
                                    
                                    if (configScriptIndex !== -1 && modalManagerIndex !== -1 && configScriptIndex > modalManagerIndex) {
                                        loadOrderIssue = `⚠️ ${script.file} נטען אחרי modal-manager-v2.js - צריך להיות לפני!`;
                                    }
                                }
                            });
                        }
                    });
                }
            }
            
            const suggestion = suggestedPackage 
                ? ` - ייתכן שחסרה חבילת "${suggestedPackage}" ב-PAGE_CONFIGS`
                : '';
            
            const loadOrderWarning = loadOrderIssue 
                ? ` ${loadOrderIssue}`
                : '';
            
            mismatches.push({
                type: 'missing_global',
                message: `גלובל חסר: ${globalVar} - נדרש לפי התיעוד אבל לא זמין${suggestion}${loadOrderWarning}`,
                severity: loadOrderIssue ? 'warning' : 'error'
            });
        }
    });
    
    
    return {
        mismatches: mismatches.length,
        mismatchDetails: mismatches,
        duplicates: duplicates,
        loadOrderIssues: loadOrderIssues,
        versionMismatches: versionMismatches
    };
}

/**
 * Run detailed page scan with HTML+DOM comparison
 */
async function runDetailedPageScan(pageName, pageConfig) {
    // Validate pageName is a string, not a Promise
    if (typeof pageName !== 'string') {
        const error = new Error(`runDetailedPageScan: pageName must be a string, got ${typeof pageName}. If you have a Promise, await it first.`);
        console.error('❌ runDetailedPageScan invalid pageName type:', error);
        if (window.Logger?.error) {
            window.Logger.error('❌ runDetailedPageScan invalid pageName type', error, { page: 'monitoring', pageNameType: typeof pageName });
        }
        throw error;
    }
    
    // Check if we're on the correct page
    const path = window.location.pathname;
    let currentPage = path.split('/').pop();
    
    // Handle case where URL doesn't have .html extension
    if (!currentPage || currentPage === '' || currentPage === '/') {
        currentPage = 'index';
    } else {
        currentPage = currentPage.replace('.html', '');
    }
    
    // Handle specific pages with custom URL mapping (without .html and /trading-ui/)
    if (path.includes('tag-management')) {
        currentPage = 'tag-management';
    } else if (path.includes('ai-analysis')) {
        currentPage = 'ai-analysis';
    }
    
    if (currentPage !== pageName) {
        // Return empty results since we can't scan a different page
        return {
            pageName: pageName,
            criticalErrors: 0,
            mismatches: 1,
            duplicates: [],
            loadOrderIssues: [],
            mismatchDetails: [{
                type: 'page_mismatch',
                message: `⚠️ לא ניתן לסרוק עמוד ${pageName} - צריך להיות על העמוד בפועל. עבור לעמוד ${pageName}.html והרץ את הבדיקה משם.`,
                severity: 'warning'
            }],
            htmlAnalysis: null,
            domAnalysis: null,
            comparison: null,
            packageDocumentation: null
        };
    }

    // Wait for page to be fully loaded
    await waitForPageFullyLoaded();

    // Parse HTML file
    const htmlData = await parseHTMLFile(pageName);
    const htmlScripts = htmlData.scripts || [];

    // Enrich HTML scripts with manifest data
    const packageManifest = window.PACKAGE_MANIFEST || {};
    const enrichedHtmlScripts = htmlScripts.map(htmlScript => {
        const manifestInfo = getScriptLoadOrder(htmlScript.file, packageManifest);
        return {
            ...htmlScript,
            loadOrder: manifestInfo?.loadOrder || 999,
            package: manifestInfo?.package || null,
            packageName: manifestInfo?.packageName || null,
            matchesManifest: !!manifestInfo
        };
    });

    // Get DOM scripts
    const domScripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src.split('/').pop().split('?')[0])
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));

    // Get DOM scripts with performance data
    const domScriptsWithData = Array.from(document.querySelectorAll('script[src]'))
        .map((script, index) => {
            const filename = script.src.split('/').pop().split('?')[0];
            if (filename.includes('bootstrap') || filename.includes('font-awesome')) {
                return null;
            }
            
            // Get performance entry for this script
            const perfEntry = performance.getEntriesByName(script.src, 'resource')[0];
            const manifestInfo = getScriptLoadOrder(filename, packageManifest);
            
            return {
                file: filename,
                position: index,
                loadOrder: manifestInfo?.loadOrder || 999,
                package: manifestInfo?.package || null,
                loaded: script.src && !script.src.includes('404'),
                loadTime: perfEntry ? perfEntry.responseEnd - perfEntry.requestStart : null,
                fullPath: script.src
            };
        })
        .filter(Boolean);

    // Run mismatch check with HTML scripts
    const mismatchResults = await checkForMismatches(pageName, pageConfig, enrichedHtmlScripts);

    // Compare HTML vs DOM
    const comparison = compareHTMLvsDOM(enrichedHtmlScripts, domScripts, pageConfig, packageManifest);

    // Get package documentation
    const packageDocumentation = getPackageDocumentation(pageConfig, packageManifest);

    // Calculate manifest compliance for HTML
    const htmlManifestCompliance = enrichedHtmlScripts.length > 0
        ? Math.round((enrichedHtmlScripts.filter(s => s.matchesManifest).length / enrichedHtmlScripts.length) * 100)
        : 100;

    // Count version mismatches from checkForMismatches
    const versionMismatchesCount = mismatchResults.versionMismatches ? mismatchResults.versionMismatches.length : 0;
    
    // Build enhanced results
    const results = {
        pageName: pageName,
        timestamp: new Date().toISOString(),
        criticalErrors: mismatchResults.mismatches > 0 ? 1 : 0,
        mismatches: mismatchResults.mismatches,
        duplicates: mismatchResults.duplicates,
        loadOrderIssues: mismatchResults.loadOrderIssues,
        mismatchDetails: mismatchResults.mismatchDetails,
        versionMismatches: mismatchResults.versionMismatches || [],
        versionMismatchesCount: versionMismatchesCount,
        
        // HTML Analysis
        htmlAnalysis: {
            scripts: enrichedHtmlScripts,
            totalScripts: enrichedHtmlScripts.length,
            manifestCompliance: htmlManifestCompliance,
            error: htmlData.error || null
        },
        
        // DOM Analysis
        domAnalysis: {
            scripts: domScriptsWithData,
            totalScripts: domScriptsWithData.length,
            failedLoads: domScriptsWithData.filter(s => !s.loaded).map(s => ({
                file: s.file,
                error: 'Failed to load'
            }))
        },
        
        // Comparison
        comparison: comparison,
        
        // Package Documentation
        packageDocumentation: packageDocumentation,
        
        // Summary
        summary: {
            totalIssues: mismatchResults.mismatches + 
                        (mismatchResults.loadOrderIssues ? mismatchResults.loadOrderIssues.length : 0) +
                        versionMismatchesCount +
                        comparison.summary.differencesCount,
            criticalErrors: mismatchResults.mismatches > 0 ? 1 : 0,
            warnings: (mismatchResults.loadOrderIssues ? mismatchResults.loadOrderIssues.length : 0) +
                     comparison.orderDifferences.filter(d => d.severity === 'warning').length,
            htmlScriptsCount: enrichedHtmlScripts.length,
            domScriptsCount: domScriptsWithData.length,
            differencesCount: comparison.summary.differencesCount
        }
    };
    
    return results;
}

/**
 * Parse HTML file and extract script information
 * @param {string} pageName - Name of the page (without .html extension)
 * @returns {Promise<Object>} Object with htmlContent and scripts array
 */
async function parseHTMLFile(pageName) {
    try {
        // Validate pageName is a string, not a Promise
        if (typeof pageName !== 'string') {
            const error = new Error(`parseHTMLFile: pageName must be a string, got ${typeof pageName}. If you have a Promise, await it first.`);
            console.error('❌ parseHTMLFile invalid pageName type:', error);
            if (window.Logger?.error) {
                window.Logger.error('❌ parseHTMLFile invalid pageName type', error, { page: 'monitoring', pageNameType: typeof pageName });
            }
            throw error;
        }
        
        // Get page config to determine if it's a mockup page
        const pageConfig = window.PAGE_CONFIGS?.[pageName];
        const currentPath = window.location.pathname;
        const isMockup = pageConfig?.pageType === 'mockup' || 
                        currentPath.includes('/mockups/') ||
                        currentPath.includes('mockup');
        
        // Determine the correct path based on page type
        let htmlPath;
        let altPath = null;
        
        if (isMockup) {
            // Mockup pages are in trading-ui/mockups/daily-snapshots/
            htmlPath = `/trading-ui/mockups/daily-snapshots/${pageName}.html`;
        } else {
            // Regular pages - try trading-ui/ first (standard location)
            htmlPath = `/trading-ui/${pageName}.html`;
            // Also try root path as fallback
            altPath = `/${pageName}.html`;
        }
        
        // Try primary path
        let response = await fetch(htmlPath);
        
        // If primary path fails and we have an alternative, try it
        if (!response.ok && altPath) {
            response = await fetch(altPath);
            if (response.ok) {
                htmlPath = altPath; // Update path for reference
            }
        }
        
        // If still not ok, try alternative paths
        if (!response.ok) {
            // Try mockup path if not already tried
            if (!htmlPath.includes('/mockups/')) {
                const mockupPath = `/trading-ui/mockups/daily-snapshots/${pageName}.html`;
                const mockupResponse = await fetch(mockupPath);
                if (mockupResponse.ok) {
                    response = mockupResponse;
                    htmlPath = mockupPath;
                }
            }
            
            // If still not ok, throw error
            if (!response.ok) {
                throw new Error(`Failed to fetch HTML file: ${response.status} ${response.statusText}`);
            }
        }
        
        const htmlContent = await response.text();
        return {
            htmlContent,
            scripts: extractScriptsFromHTML(htmlContent, pageName)
        };
    } catch (error) {
        console.error(`Error parsing HTML file for ${pageName}:`, error);
        return {
            htmlContent: null,
            scripts: [],
            error: error.message
        };
    }
}

/**
 * Extract script tags from HTML content
 * @param {string} htmlContent - HTML content to parse
 * @param {string} pageName - Name of the page (for context)
 * @returns {Array<Object>} Array of script objects with position, file, fullPath, etc.
 */
function extractScriptsFromHTML(htmlContent, pageName) {
    const scripts = [];
    const scriptRegex = /<script\s+src=["']([^"']+)["']/gi;
    let match;
    let position = 0;

    while ((match = scriptRegex.exec(htmlContent)) !== null) {
        const fullPath = match[1];
        const filename = fullPath.split('/').pop().split('?')[0];
        
        // Skip bootstrap and font-awesome
        if (filename.includes('bootstrap') || filename.includes('font-awesome')) {
            continue;
        }

        // Extract version from query string if present
        const versionMatch = fullPath.match(/[?&]v=([^&]+)/);
        const version = versionMatch ? versionMatch[1] : null;

        // Normalize path (remove scripts/ prefix if present, remove query params)
        const normalizedPath = fullPath.replace(/^scripts\//, '').split('?')[0];

        scripts.push({
            position: position++,
            file: filename,
            fullPath: fullPath,
            normalizedPath: normalizedPath,
            version: version,
            htmlPosition: match.index,
            // Will be populated later with manifest data
            loadOrder: null,
            package: null,
            matchesManifest: false
        });
    }

    return scripts;
}

/**
 * Normalize script path for comparison
 * @param {string} path - Script path to normalize
 * @returns {string} Normalized path
 */
function normalizeScriptPath(path) {
    // Handle external URLs (CDN) - keep them as-is for comparison
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path.split('?')[0].toLowerCase();
    }
    
    // Remove scripts/ prefix, query params, and version
    return path
        .replace(/^scripts\//, '')
        .replace(/^\/scripts\//, '')
        .split('?')[0]
        .toLowerCase();
}

/**
 * Get script loadOrder from package manifest
 * @param {string} scriptFile - Script file path
 * @param {Object} packageManifest - Package manifest object
 * @returns {Object|null} Object with loadOrder and package info, or null if not found
 */
function getScriptLoadOrder(scriptFile, packageManifest) {
    if (!packageManifest) return null;

    const normalizedFile = normalizeScriptPath(scriptFile);
    
    for (const [pkgId, pkg] of Object.entries(packageManifest)) {
        if (!pkg.scripts) continue;
        
        for (const script of pkg.scripts) {
            const normalizedScript = normalizeScriptPath(script.file);
            if (normalizedScript === normalizedFile || 
                script.file.includes(normalizedFile) || 
                normalizedFile.includes(script.file)) {
                return {
                    loadOrder: script.loadOrder || 999,
                    package: pkgId,
                    packageName: pkg.name || pkgId,
                    required: script.required !== false,
                    description: script.description || ''
                };
            }
        }
    }
    
    return null;
}

/**
 * Compare HTML scripts vs DOM scripts
 * @param {Array<Object>} htmlScripts - Scripts extracted from HTML file
 * @param {Array<string>} domScripts - Scripts loaded in DOM (filenames only)
 * @param {Object} pageConfig - Page configuration
 * @param {Object} packageManifest - Package manifest
 * @returns {Object} Comparison results with differences
 */
function compareHTMLvsDOM(htmlScripts, domScripts, pageConfig, packageManifest) {
    const comparison = {
        orderDifferences: [],
        missingInDOM: [],
        extraInDOM: [],
        pathDifferences: [],
        summary: {
            htmlScriptsCount: htmlScripts.length,
            domScriptsCount: domScripts.length,
            differencesCount: 0
        }
    };

    // Enrich HTML scripts with manifest data
    const enrichedHtmlScripts = htmlScripts.map(htmlScript => {
        const manifestInfo = getScriptLoadOrder(htmlScript.file, packageManifest);
        return {
            ...htmlScript,
            loadOrder: manifestInfo?.loadOrder || 999,
            package: manifestInfo?.package || null,
            packageName: manifestInfo?.packageName || null,
            matchesManifest: !!manifestInfo
        };
    });

    // Create maps for quick lookup
    const htmlScriptMap = new Map();
    const domScriptMap = new Map();
    
    enrichedHtmlScripts.forEach((script, index) => {
        const normalized = normalizeScriptPath(script.file);
        htmlScriptMap.set(normalized, { ...script, htmlIndex: index });
    });

    domScripts.forEach((script, index) => {
        const normalized = normalizeScriptPath(script);
        if (!domScriptMap.has(normalized)) {
            domScriptMap.set(normalized, { file: script, domIndex: index });
        }
    });

    // Find scripts in HTML but not in DOM
    enrichedHtmlScripts.forEach(htmlScript => {
        const normalized = normalizeScriptPath(htmlScript.file);
        if (!domScriptMap.has(normalized)) {
            comparison.missingInDOM.push({
                file: htmlScript.file,
                htmlPosition: htmlScript.position,
                fullPath: htmlScript.fullPath,
                package: htmlScript.package,
                expectedOrder: htmlScript.loadOrder
            });
        }
    });

    // Find scripts in DOM but not in HTML (dynamically loaded)
    domScripts.forEach(domScript => {
        const normalized = normalizeScriptPath(domScript);
        if (!htmlScriptMap.has(normalized)) {
            // Try to find source - check if it's from a package
            const manifestInfo = getScriptLoadOrder(domScript, packageManifest);
            
            // Known dynamic scripts that are expected (page-specific or mockup-specific)
            const knownDynamicScripts = [
                'mockups-icon-initializer.js',
                'trading-journal-page.js'
            ];
            const isKnownDynamic = knownDynamicScripts.some(name => 
                domScript.includes(name) || normalized.includes(name)
            );
            
            comparison.extraInDOM.push({
                file: domScript,
                domPosition: domScripts.indexOf(domScript),
                source: manifestInfo ? `package: ${manifestInfo.package}` : (isKnownDynamic ? 'dynamic' : 'unknown'),
                package: manifestInfo?.package || null,
                expected: manifestInfo !== null || isKnownDynamic // Expected if from package or known dynamic
            });
        }
    });

    // Find order differences
    enrichedHtmlScripts.forEach(htmlScript => {
        const normalized = normalizeScriptPath(htmlScript.file);
        const domScript = domScriptMap.get(normalized);
        
        if (domScript) {
            const htmlIndex = htmlScript.position;
            const domIndex = domScript.domIndex;
            
            // Check if order differs significantly (more than 2 positions)
            if (Math.abs(htmlIndex - domIndex) > 2) {
                comparison.orderDifferences.push({
                    script: htmlScript.file,
                    htmlPosition: htmlIndex,
                    domPosition: domIndex,
                    expectedOrder: htmlScript.loadOrder,
                    package: htmlScript.package,
                    severity: Math.abs(htmlIndex - domIndex) > 5 ? 'error' : 'warning'
                });
            }

            // Check for path differences (version, query params)
            // Note: This requires DOM access, so we do it carefully
            try {
                const htmlPath = htmlScript.fullPath.split('?')[0];
                const domScriptElement = Array.from(document.querySelectorAll('script[src]'))
                    .find(s => {
                        const scriptFilename = s.src.split('/').pop().split('?')[0];
                        return normalizeScriptPath(scriptFilename) === normalized;
                    });
                
                if (domScriptElement) {
                    const domPath = domScriptElement.src.split('?')[0];
                    // Normalize paths for comparison (remove leading /scripts/ if present)
                    const normalizedHtmlPath = htmlPath.replace(/^\/?scripts\//, '');
                    const normalizedDomPath = domPath.replace(/^\/?scripts\//, '');
                    
                    if (normalizedHtmlPath !== normalizedDomPath && 
                        !normalizedHtmlPath.includes(normalizedDomPath) && 
                        !normalizedDomPath.includes(normalizedHtmlPath)) {
                        comparison.pathDifferences.push({
                            script: htmlScript.file,
                            htmlPath: htmlPath,
                            domPath: domPath,
                            package: htmlScript.package
                        });
                    }
                }
            } catch (error) {
                // DOM might not be fully available, skip path comparison
                console.warn('Could not compare paths for', htmlScript.file, error);
            }
        }
    });

    comparison.summary.differencesCount = 
        comparison.orderDifferences.length +
        comparison.missingInDOM.length +
        comparison.extraInDOM.length +
        comparison.pathDifferences.length;

    return comparison;
}

/**
 * Get package documentation information
 * @param {Object} pageConfig - Page configuration
 * @param {Object} packageManifest - Package manifest
 * @returns {Object} Package documentation information
 */
function getPackageDocumentation(pageConfig, packageManifest) {
    if (!pageConfig.packages || !packageManifest) {
        return {
            packages: [],
            documentationCompliance: 0,
            issues: []
        };
    }

    const packages = [];
    const issues = [];
    let totalScripts = 0;
    let loadedScripts = 0;

    // Get DOM scripts for checking if loaded (including external URLs and full paths)
    const domScripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => {
            const src = script.src;
            // For external URLs, keep full URL; for local scripts, use filename
            if (src.startsWith('http://') || src.startsWith('https://')) {
                return src.split('?')[0].toLowerCase();
            }
            return src.split('/').pop().split('?')[0];
        })
        .filter(src => src && !src.includes('font-awesome')); // Keep bootstrap for checking

    // Also collect full paths for more accurate comparison (same as checkForMismatches)
    const loadedScriptsFullPaths = Array.from(document.querySelectorAll('script[src]'))
        .map(script => {
            const src = script.src.split('?')[0];
            try {
                // Extract relative path from full URL (remove protocol, host, port)
                const url = new URL(src, window.location.origin);
                const relativePath = url.pathname;
                // Remove leading slash and normalize
                return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            } catch (e) {
                // Fallback: if URL parsing fails, try to extract path manually
                let relativePath = src;
                if (src.startsWith('http://') || src.startsWith('https://')) {
                    const pathMatch = src.match(/https?:\/\/[^\/]+(\/.*)/);
                    if (pathMatch) {
                        relativePath = pathMatch[1];
                    }
                }
                // Remove leading slash
                return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            }
        })
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));

    pageConfig.packages.forEach(pkgId => {
        const pkg = packageManifest[pkgId];
        if (!pkg) {
            issues.push(`Package ${pkgId} not found in manifest`);
            return;
        }

        const pkgScripts = (pkg.scripts || [])
            .filter(script => script.required !== false)
            .map(script => {
                const scriptFile = script.file;
                let loaded = false;
                
                // Use the same improved logic as checkForMismatches
                if (scriptFile.startsWith('http://') || scriptFile.startsWith('https://')) {
                    // External script - check full URL
                    const normalizedScript = scriptFile.split('?')[0].toLowerCase();
                    loaded = domScripts.some(domScript => domScript === normalizedScript || domScript.includes(scriptFile.split('/').pop()));
                } else {
                    // Local script - use improved path matching logic
                    const normalizedRequired = scriptFile.split('?')[0].toLowerCase();
                    const requiredFilename = normalizedRequired.split('/').pop();
                    
                    // Generate all possible path variations
                    const possiblePaths = [
                        normalizedRequired, // Original: "api-config.js" or "scripts/api-config.js"
                        `scripts/${normalizedRequired}`, // With scripts/ prefix: "scripts/api-config.js"
                        normalizedRequired.replace(/^scripts\//, ''), // Without scripts/ prefix: "api-config.js"
                        requiredFilename // Just filename: "api-config.js"
                    ];
                    
                    // First, check against loadedScriptsFullPaths (full paths from DOM)
                    loaded = loadedScriptsFullPaths.some(loadedScriptFullPath => {
                        const normalizedLoaded = loadedScriptFullPath.toLowerCase();
                        const loadedFilename = normalizedLoaded.split('/').pop();
                        
                        // Check all possible path variations
                        for (const possiblePath of possiblePaths) {
                            if (normalizedLoaded === possiblePath ||
                                normalizedLoaded.endsWith('/' + possiblePath) ||
                                normalizedLoaded.endsWith(possiblePath) ||
                                normalizedLoaded.includes('/' + possiblePath)) {
                                return true;
                            }
                        }
                        
                        // Final check: filename match (case-insensitive)
                        return loadedFilename === requiredFilename;
                    });
                    
                    // If not found in full paths, check against filenames only
                    if (!loaded) {
                        loaded = domScripts.some(loadedScript => {
                            const loadedFilename = loadedScript.split('/').pop().split('?')[0].toLowerCase();
                            return loadedFilename === requiredFilename;
                        });
                    }
                }
                
                totalScripts++;
                if (loaded) loadedScripts++;
                
                return {
                    file: script.file,
                    loadOrder: script.loadOrder || 999,
                    required: script.required !== false,
                    loaded: loaded,
                    description: script.description || ''
                };
            });

        const pkgIssues = [];
        const missingScripts = pkgScripts.filter(s => !s.loaded);
        if (missingScripts.length > 0) {
            pkgIssues.push(`Missing ${missingScripts.length} required scripts: ${missingScripts.map(s => s.file).join(', ')}`);
        }

        packages.push({
            id: pkgId,
            name: pkg.name || pkgId,
            description: pkg.description || '',
            version: pkg.version || 'unknown',
            loadOrder: pkg.loadOrder || 999,
            dependencies: pkg.dependencies || [],
            scripts: pkgScripts,
            documented: true,
            issues: pkgIssues
        });

        issues.push(...pkgIssues);
    });

    const documentationCompliance = totalScripts > 0 
        ? Math.round((loadedScripts / totalScripts) * 100) 
        : 100;

    return {
        packages,
        documentationCompliance,
        issues,
        totalScripts,
        loadedScripts
    };
}

/**
 * Format comparison report for display
 * @param {Object} comparison - Comparison results
 * @returns {string} Formatted report text
 */
function formatComparisonReport(comparison) {
    let report = '=== HTML vs DOM Comparison Report ===\n\n';
    
    report += `Summary:\n`;
    report += `- HTML Scripts: ${comparison.summary.htmlScriptsCount}\n`;
    report += `- DOM Scripts: ${comparison.summary.domScriptsCount}\n`;
    report += `- Total Differences: ${comparison.summary.differencesCount}\n\n`;
    
    if (comparison.orderDifferences.length > 0) {
        report += `Order Differences (${comparison.orderDifferences.length}):\n`;
        comparison.orderDifferences.forEach((diff, index) => {
            report += `${index + 1}. ${diff.script}: HTML pos ${diff.htmlPosition} → DOM pos ${diff.domPosition} (Expected: ${diff.expectedOrder})\n`;
        });
        report += '\n';
    }
    
    if (comparison.missingInDOM.length > 0) {
        report += `Missing in DOM (${comparison.missingInDOM.length}):\n`;
        comparison.missingInDOM.forEach((m, index) => {
            report += `${index + 1}. ${m.file} (HTML position: ${m.htmlPosition})\n`;
        });
        report += '\n';
    }
    
    if (comparison.extraInDOM.length > 0) {
        report += `Extra in DOM (${comparison.extraInDOM.length}):\n`;
        comparison.extraInDOM.forEach((e, index) => {
            report += `${index + 1}. ${e.file} (DOM position: ${e.domPosition}, Source: ${e.source})\n`;
        });
        report += '\n';
    }
    
    if (comparison.pathDifferences.length > 0) {
        report += `Path Differences (${comparison.pathDifferences.length}):\n`;
        comparison.pathDifferences.forEach((p, index) => {
            report += `${index + 1}. ${p.script}: HTML="${p.htmlPath}" vs DOM="${p.domPath}"\n`;
        });
        report += '\n';
    }
    
    return report;
}

/**
 * Generate fix recommendations for issues
 * @param {Array<Object>} issues - Array of issue objects
 * @returns {Array<Object>} Array of recommendation objects
 */
function generateFixRecommendations(issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
        const type = issue.type || 'unknown';
        let recommendation = {
            type: type,
            severity: issue.severity || 'warning',
            message: issue.message || '',
            fix: '',
            priority: issue.severity === 'error' ? 'high' : 'medium'
        };
        
        switch (type) {
            case 'missing_script':
                recommendation.fix = `הוסף את הסקריפט ${issue.file || 'החסר'} לקובץ HTML או וודא שהוא נטען דרך חבילה`;
                break;
            case 'extra_script':
                recommendation.fix = `הסר את הסקריפט ${issue.file || 'הנוסף'} מהקובץ HTML או הוסף אותו למניפסט`;
                break;
            case 'duplicate_script':
                recommendation.fix = `הסר את הכפילות של ${issue.file || 'הסקריפט'} מהקובץ HTML`;
                break;
            case 'loading_order':
                recommendation.fix = `תקן את סדר הטעינה בקובץ HTML לפי המניפסט - ${issue.message || ''}`;
                break;
            case 'missing_global':
                recommendation.fix = `הוסף את החבילה המתאימה ל-PAGE_CONFIGS או וודא שהסקריפט נטען`;
                break;
            case 'order_difference':
                recommendation.fix = `תקן את סדר הטעינה של ${issue.script || 'הסקריפט'} בקובץ HTML`;
                break;
            case 'missing_in_dom':
                recommendation.fix = `בדוק למה ${issue.file || 'הסקריפט'} לא נטען - ייתכן שזה 404 או שגיאת טעינה אחרת`;
                break;
            default:
                recommendation.fix = `תקן את הבעיה לפי התיעוד`;
        }
        
        recommendations.push(recommendation);
    });
    
    return recommendations;
}

// Export functions globally
window.runDetailedPageScan = runDetailedPageScan;
window.waitForPageFullyLoaded = waitForPageFullyLoaded;
window.checkForMismatches = checkForMismatches;
window.parseHTMLFile = parseHTMLFile;
window.extractScriptsFromHTML = extractScriptsFromHTML;
window.normalizeScriptPath = normalizeScriptPath;
window.getScriptLoadOrder = getScriptLoadOrder;
window.compareHTMLvsDOM = compareHTMLvsDOM;
window.getPackageDocumentation = getPackageDocumentation;
window.formatComparisonReport = formatComparisonReport;
window.generateFixRecommendations = generateFixRecommendations;

if (window.Logger) {
  window.Logger.info('✅ Monitoring Functions loaded successfully', { page: 'monitoring' });
}
