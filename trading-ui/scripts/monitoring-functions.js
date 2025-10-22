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

console.log('🔍 Loading Monitoring Functions...');

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
    console.log(`🔍 checkForMismatches: Starting enhanced monitoring for page ${pageName}`);
    
    // Real-time error detection
    const errorLog = [];
    const originalConsoleError = console.error;
    console.error = function(...args) {
        errorLog.push({
            timestamp: new Date().toISOString(),
            message: args.join(' '),
            stack: new Error().stack
        });
        originalConsoleError.apply(console, args);
    };
    
    const loadedScripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src.split('/').pop().split('?')[0])
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));
    
    // Also collect full paths for duplicate detection
    const loadedScriptsFullPaths = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src.split('?')[0])
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));
    
    console.log(`🔍 checkForMismatches: Found ${loadedScripts.length} loaded scripts:`, loadedScripts);
    
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
    
    const undefinedScripts = loadedScripts.filter(script => 
        !manifestScripts.includes(script) && 
        !script.includes('bootstrap') && 
        !script.includes('font-awesome')
    );
    
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
    if (pageConfig.packages && window.PACKAGE_MANIFEST) {
        pageConfig.packages.forEach(packageId => {
            const pkg = window.PACKAGE_MANIFEST[packageId];
            if (pkg && pkg.scripts) {
                pkg.scripts.forEach(script => {
                    if (script.required) {
                        requiredScripts.push(script.file);
                    }
                });
            }
        });
    }
    
    console.log(`🔍 checkForMismatches: Required scripts:`, requiredScripts);
    
    const mismatches = [];
    const duplicates = [];
    const loadOrderIssues = [];
    
    // Check for missing scripts
    requiredScripts.forEach(requiredScript => {
        // Extract filename from path (e.g., "services/data-collection-service.js" -> "data-collection-service.js")
        const scriptFilename = requiredScript.split('/').pop();
        
        if (!loadedScripts.includes(requiredScript) && !loadedScripts.includes(scriptFilename)) {
            mismatches.push({
                type: 'missing_script',
                message: `סקריפט חסר: ${requiredScript} - מתועד אבל לא נטען`,
                severity: 'error'
            });
        }
    });
    
    // Check for extra scripts (loaded but not documented)
    loadedScripts.forEach(loadedScript => {
        // Check if this script is documented (either as full path or just filename)
        const isDocumented = requiredScripts.some(requiredScript => {
            const requiredFilename = requiredScript.split('/').pop();
            return requiredScript === loadedScript || requiredFilename === loadedScript;
        });
        
        // Check if this is a page-specific script (same name as page)
        const isPageSpecificScript = loadedScript === `${pageName}.js`;
        
        if (!isDocumented && 
            !isPageSpecificScript &&
            !loadedScript.includes('init-system') && 
            !loadedScript.includes('bootstrap') && 
            !loadedScript.includes('font-awesome') &&
            !loadedScript.includes('monitoring-functions') &&
            !loadedScript.includes('init-system-check') &&
            !loadedScript.includes('package-manifest') &&
            !loadedScript.includes('page-initialization-configs') &&
            !loadedScript.includes('unified-app-initializer')) {
            mismatches.push({
                type: 'extra_script',
                message: `סקריפט נוסף: ${loadedScript} - נטען אבל לא מתועד`,
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
    
    // Check package loading order - IMPROVED: Check actual page order vs package dependencies
    if (pageConfig.packages && window.PACKAGE_MANIFEST) {
        // Get all packages for this page
        const pagePackages = pageConfig.packages.map(pkgName => {
            // Find package by name in the manifest object
            for (const [key, pkg] of Object.entries(window.PACKAGE_MANIFEST)) {
                if (pkg.name && pkg.name.toLowerCase().includes(pkgName.toLowerCase())) {
                    return pkg;
                }
            }
            return null;
        }).filter(Boolean);
        
        // Sort packages by loadOrder
        const sortedPackages = pagePackages.sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
        
        // Check if scripts are loaded in the correct package order
        let expectedOrder = [];
        const seenScripts = new Set(); // Prevent duplicates
        sortedPackages.forEach(pkg => {
            if (pkg.scripts) {
                pkg.scripts.forEach(script => {
                    if (script.required !== false && !seenScripts.has(script.file)) {
                        expectedOrder.push(script.file);
                        seenScripts.add(script.file);
                    }
                });
            }
        });
        
        // Check actual order vs expected order
        const processedScripts = new Set(); // Prevent duplicate checks
        expectedOrder.forEach((expectedScript, expectedIndex) => {
            const actualIndex = loadedScripts.indexOf(expectedScript);
            if (actualIndex !== -1 && !processedScripts.has(expectedScript)) {
                processedScripts.add(expectedScript);
                
                // Check if this script is loaded before its dependencies
                const dependencies = expectedOrder.slice(0, expectedIndex);
                dependencies.forEach(dep => {
                    const depIndex = loadedScripts.indexOf(dep);
                    if (depIndex !== -1 && actualIndex < depIndex) {
                        loadOrderIssues.push({
                            type: 'loading_order',
                            message: `סדר טעינה שגוי: ${expectedScript} נטען במקום ${expectedIndex + 1} אבל נמצא במקום ${actualIndex + 1}`,
                            severity: 'error'
                        });
                    }
                });
            }
        });
    }
    
    // Check for missing globals
    requiredGlobals.forEach(globalVar => {
        const globalName = globalVar.replace('window.', '');
        if (typeof window[globalName] === 'undefined') {
            mismatches.push({
                type: 'missing_global',
                message: `גלובל חסר: ${globalVar} - נדרש לפי התיעוד אבל לא זמין`,
                severity: 'error'
            });
        }
    });
    
    console.log(`🔍 checkForMismatches: Found ${mismatches.length} mismatches`);
    
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
    console.log(`🔍 runDetailedPageScan: Starting for page ${pageName}`);
    
    // Check if we're on the correct page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    if (currentPage !== pageName) {
        console.log(`🔍 runDetailedPageScan: Not on target page. Current: ${currentPage}, Target: ${pageName}`);
        console.log(`🔍 runDetailedPageScan: Skipping detailed scan - need to be on the actual page`);

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
    console.log(`🔍 runDetailedPageScan: Page ${pageName} fully loaded, proceeding with scan...`);

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
    
    console.log(`🔍 runDetailedPageScan: Completed for page ${pageName}`, results);
    return results;
}

// Export functions globally
window.runDetailedPageScan = runDetailedPageScan;
window.waitForPageFullyLoaded = waitForPageFullyLoaded;
window.checkForMismatches = checkForMismatches;

console.log('✅ Monitoring Functions loaded successfully');
