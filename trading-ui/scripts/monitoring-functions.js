/**
 * Monitoring Functions - TikTrack Frontend
 * ========================================
 * 
 * פונקציות ניטור בסיסיות - נדרשות לבדיקת מערכת איתחול
 * 
 * Features:
 * - runDetailedPageScan - סריקה מפורטת של עמוד
 * - waitForPageFullyLoaded - המתנה לטעינה מלאה
 * - checkForMismatches - בדיקת אי-התאמות
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 20, 2025
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
 * Enhanced monitoring with real-time error detection
 */
async function checkForMismatches(pageName, pageConfig) {
    
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
        .map(script => script.src.split('?')[0])
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
        
        return !foundInManifest && 
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
    
    
    const mismatches = [];
    const duplicates = [];
    const loadOrderIssues = [];
    
    // Check for missing scripts
    requiredScripts.forEach(requiredScript => {
        // Extract filename from path (e.g., "services/data-collection-service.js" -> "data-collection-service.js")
        const scriptFilename = requiredScript.split('/').pop();
        
        // Check if script is in 404 errors list
        const script404 = script404Errors.find(e => {
            const errorFilename = e.file.split('/').pop();
            const requiredFilename = scriptFilename.split('?')[0];
            return errorFilename === requiredFilename || e.file === requiredScript;
        });
        
        // Check both full path and filename (to handle cases where path might differ)
        const isLoaded = loadedScripts.some(loadedScript => {
            // Check full path match
            if (loadedScript === requiredScript || loadedScript.includes(requiredScript)) {
                return true;
            }
            // Check filename match (extract filename from loaded script)
            const loadedFilename = loadedScript.split('/').pop().split('?')[0]; // Remove query params
            const requiredFilename = scriptFilename.split('?')[0];
            return loadedFilename === requiredFilename;
        });
        
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
        let isDocumented = requiredScripts.some(requiredScript => {
            const requiredFilename = requiredScript.split('/').pop().split('?')[0];
            const loadedFilename = loadedScript.split('/').pop().split('?')[0];
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
        
        // Allowed system scripts that don't need to be in manifest
        // Also check if script is part of entity-details package (modal-navigation-manager, modal-manager-v2)
        const allowedSystemScripts = [
            'init-system', 'bootstrap', 'font-awesome', 'monitoring-functions',
            'init-system-check', 'package-manifest', 'page-initialization-configs',
            'unified-app-initializer', 'info-summary-system', 'info-summary-configs',
            'modal-navigation-manager', 'modal-manager-v2' // These are loaded manually but are valid
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
    
    if (pageScriptIndex !== -1) {
        // Page-specific script should be loaded after initialization scripts
        const initScripts = ['package-manifest.js', 'page-initialization-configs.js', 'unified-app-initializer.js'];
        const lastInitIndex = Math.max(...initScripts.map(script => loadedScripts.indexOf(script)).filter(i => i !== -1));
        
        if (lastInitIndex !== -1 && pageScriptIndex < lastInitIndex) {
            loadOrderIssues.push({
                type: 'loading_order',
                message: `סדר טעינה שגוי: ${pageSpecificScript} נטען לפני סקריפטי האתחול`,
                severity: 'warning'
            });
        }
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
            }
            
            const suggestion = suggestedPackage 
                ? ` - ייתכן שחסרה חבילת "${suggestedPackage}" ב-PAGE_CONFIGS`
                : '';
            
            mismatches.push({
                type: 'missing_global',
                message: `גלובל חסר: ${globalVar} - נדרש לפי התיעוד אבל לא זמין${suggestion}`,
                severity: 'error'
            });
        }
    });
    
    
    return {
        mismatches: mismatches.length,
        mismatchDetails: mismatches,
        duplicates: duplicates,
        loadOrderIssues: loadOrderIssues
    };
}

/**
 * Run detailed page scan
 */
async function runDetailedPageScan(pageName, pageConfig) {
    
    // Check if we're on the correct page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
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
            }]
        };
    }

    // Wait for page to be fully loaded
    await waitForPageFullyLoaded();

    // Run mismatch check
    const mismatchResults = await checkForMismatches(pageName, pageConfig);
    
    const results = {
        pageName: pageName,
        criticalErrors: 0,
        mismatches: mismatchResults.mismatches,
        duplicates: mismatchResults.duplicates,
        loadOrderIssues: mismatchResults.loadOrderIssues,
        mismatchDetails: mismatchResults.mismatchDetails
    };
    
    return results;
}

// Export functions globally
window.runDetailedPageScan = runDetailedPageScan;
window.waitForPageFullyLoaded = waitForPageFullyLoaded;
window.checkForMismatches = checkForMismatches;

if (window.Logger) {
  window.Logger.info('✅ Monitoring Functions loaded successfully', { page: 'monitoring' });
}
