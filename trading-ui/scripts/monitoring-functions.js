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
 * Check for mismatches between documentation and actual page
 */
async function checkForMismatches(pageName, pageConfig) {
    console.log(`🔍 checkForMismatches: Starting for page ${pageName}`);
    
    const loadedScripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src.split('/').pop().split('?')[0])
        .filter(src => src && !src.includes('bootstrap') && !src.includes('font-awesome'));
    
    console.log(`🔍 checkForMismatches: Found ${loadedScripts.length} loaded scripts:`, loadedScripts);
    
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
            !loadedScript.includes('init-system-check')) {
            mismatches.push({
                type: 'extra_script',
                message: `סקריפט נוסף: ${loadedScript} - נטען אבל לא מתועד`,
                severity: 'warning'
            });
        }
    });
    
    // Check for duplicates
    const scriptCounts = {};
    loadedScripts.forEach(script => {
        scriptCounts[script] = (scriptCounts[script] || 0) + 1;
    });
    
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
