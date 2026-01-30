// Init/Loading Manifest Loader
// This is the ONLY script allowed to orchestrate loading at runtime

(function() {
    'use strict';

    // Global state tracking for duplicate loading prevention
    let pageScriptsLoaded = false;

    // Global registry for manifest-loaded scripts to prevent duplicates
    window.loadedByManifest = new Set();
    window.loadingRegistry = {};

    // Runtime duplicate tracking for verification
    window.runtimeScriptLoads = new Map(); // script -> load count
    window.runtimeDuplicateLog = []; // log of all script loads

    // System initialization state tracking
    window.systemInitializationState = {
        UnifiedCacheManager: false,
        UIBannerSystem: false,
        Logger: false,
        API_CONFIG: false,
        DashboardData: false,
        // Add other core systems as needed
    };

    // Define functions first
    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            // Runtime duplicate tracking
            const loadCount = window.runtimeScriptLoads.get(src) || 0;
            window.runtimeScriptLoads.set(src, loadCount + 1);

            const duplicateEntry = {
                script: src,
                loadCount: loadCount + 1,
                timestamp: Date.now(),
                stack: new Error().stack,
                isDuplicate: loadCount > 0
            };
            window.runtimeDuplicateLog.push(duplicateEntry);

            // #region agent log - runtime duplicate tracking
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:loadScript',message:'Script load attempt',data:{script:src,loadCount:loadCount+1,isDuplicate:loadCount>0,totalUniqueScripts:window.runtimeScriptLoads.size,totalDuplicateEvents:window.runtimeDuplicateLog.filter(e=>e.isDuplicate).length,timestamp:Date.now()},sessionId:'runtime_duplicate_verification',runId:'crud_testing_dashboard',hypothesisId:'runtime_duplicate_tracking'})}).catch(()=>{});
            // #endregion

            // Check if script already exists to prevent duplicates
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`DEBUG: Script already exists, skipping: ${src} (found existing script)`);
                // #region agent log - duplicate prevented
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:loadScript',message:'Duplicate script prevented',data:{script:src,reason:'existing_script_tag',timestamp:Date.now()},sessionId:'runtime_duplicate_verification',runId:'crud_testing_dashboard',hypothesisId:'runtime_duplicate_tracking'})}).catch(()=>{});
                // #endregion
                resolve();
                return;
            }

            // Also check by src attribute to be thorough
            const allScripts = document.querySelectorAll('script[src]');
            for (let script of allScripts) {
                if (script.src.includes(src.split('/').pop())) {
                    console.log(`DEBUG: Script already loaded by src match, skipping: ${src}`);
                    resolve();
                    return;
                }
            }

            console.log(`DEBUG: Loading script: ${src}`);
            const script = document.createElement('script');
            script.src = src;
            script.setAttribute('data-loader', 'true'); // Mark as loader-created
            script.onload = function() {
                console.log(`DEBUG: Script loaded successfully: ${src}`);
                resolve();
            };
            script.onerror = function() {
                console.error(`DEBUG: Script failed to load: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    // Load scripts from packages (package-based architecture)
    function loadPackageScripts(packageIds) {
        return new Promise(function(resolve, reject) {
            // #region agent log - H1: Package loading start
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'loader.js:loadPackageScripts:start',message:'H1: Starting package loading',data:{packages:packageIds,manifestExists:!!window.PACKAGE_MANIFEST,timestamp:Date.now()},sessionId:'auth-regression-debug',runId:'manifest_auth_fix',hypothesisId:'H1_package_loading'})}).catch(()=>{});
            // #endregion
            
            // Wait for PACKAGE_MANIFEST to be available
            const waitForManifest = function() {
                if (window.PACKAGE_MANIFEST) {
                    console.log('DEBUG: PACKAGE_MANIFEST available, loading packages:', packageIds);
                    
                    // #region agent log - H4: PACKAGE_MANIFEST available
                    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'loader.js:loadPackageScripts:manifest_ready',message:'H4: PACKAGE_MANIFEST ready',data:{packages:packageIds,manifestPackages:Object.keys(window.PACKAGE_MANIFEST),timestamp:Date.now()},sessionId:'auth-regression-debug',runId:'manifest_auth_fix',hypothesisId:'H4_manifest_available'})}).catch(()=>{});
                    // #endregion
                    
                    // Collect all scripts from requested packages
                    const allScripts = [];
                    packageIds.forEach(function(packageId) {
                        const pkg = window.PACKAGE_MANIFEST[packageId];
                        if (pkg && pkg.scripts) {
                            pkg.scripts.forEach(function(scriptDef) {
                                // Only load required scripts
                                if (scriptDef.required !== false) {
                                    allScripts.push(scriptDef.file);
                                }
                            });
                        } else {
                            console.warn('DEBUG: Package not found or has no scripts:', packageId);
                            // #region agent log - H3: Package not found
                            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'loader.js:loadPackageScripts:package_not_found',message:'H3: Package not found!',data:{packageId,availablePackages:Object.keys(window.PACKAGE_MANIFEST).slice(0,10),timestamp:Date.now()},sessionId:'auth-regression-debug',runId:'manifest_auth_fix',hypothesisId:'H3_missing_package'})}).catch(()=>{});
                            // #endregion
                        }
                    });
                    
                    console.log('DEBUG: Total scripts to load from packages:', allScripts.length);
                    
                    // #region agent log - H2: Scripts collected
                    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'loader.js:loadPackageScripts:scripts_collected',message:'H2: Scripts collected from packages',data:{scriptCount:allScripts.length,scripts:allScripts.slice(0,5),hasAuthJs:allScripts.some(s=>s.includes('auth.js')),timestamp:Date.now()},sessionId:'auth-regression-debug',runId:'manifest_auth_fix',hypothesisId:'H2_scripts_collected'})}).catch(()=>{});
                    // #endregion
                    
                    // Load all scripts
                    loadDependencies(allScripts).then(function() {
                        // #region agent log - H5: Scripts loaded
                        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'loader.js:loadPackageScripts:complete',message:'H5: All scripts loaded',data:{scriptCount:allScripts.length,tikTrackAuthExists:!!window.TikTrackAuth,authInitialized:window.TikTrackAuth?.initialized,timestamp:Date.now()},sessionId:'auth-regression-debug',runId:'manifest_auth_fix',hypothesisId:'H5_auth_initialized'})}).catch(()=>{});
                        // #endregion
                        resolve();
                    }).catch(reject);
                } else {
                    // PACKAGE_MANIFEST not available yet, wait
                    setTimeout(waitForManifest, 50);
                }
            };
            
            waitForManifest();
        });
    }

    function loadManifest() {
        console.log('DEBUG: loadManifest called');

        // #region agent log - loader manifest load
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'loader.js:loadManifest:start',
            message: 'Starting manifest load process',
            data: {
              timestamp: Date.now(),
              page: window.location.pathname,
              pageKey: document.body?.getAttribute('data-page-key')
            },
            sessionId: 'loader_debug_session',
            hypothesisId: 'H4_loader_manifest'
          })
        }).catch(() => {});
        // #endregion
        // region agent log - manifest_fetch
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'loader.js:20',
            message: 'Manifest fetch started',
            data: {
              page: window.location.pathname,
              manifestUrl: '/scripts/manifest.json',
              hasAuthToken: !!sessionStorage.getItem('authToken')
            },
            timestamp: Date.now(),
            sessionId: 'auth_enforcement_debug',
            hypothesisId: 'manifest_loading_sequence'
          })
        }).catch(() => {});
        // endregion agent log - manifest_fetch

        return fetch('/scripts/manifest.json')
            .then(response => {
                console.log('DEBUG: Manifest fetch response received, status:', response.status);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(manifest => {
                console.log('DEBUG: Manifest parsed successfully, pages count:', Object.keys(manifest.pages || {}).length);
                return manifest;
            })
            .catch(error => {
                console.error('DEBUG: Manifest loading failed:', error);
                throw error;
            });
    }

    function loadDependencies(deps) {
        // region agent log - deps_loading_start
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'loader.js:loadDependencies',
            message: 'Dependencies loading started',
            data: {
              page: window.location.pathname,
              dependencyCount: deps.length,
              dependencies: deps,
              hasAuthToken: !!sessionStorage.getItem('authToken')
            },
            timestamp: Date.now(),
            sessionId: 'auth_enforcement_debug',
            hypothesisId: 'manifest_loading_sequence'
          })
        }).catch(() => {});
        // endregion agent log - deps_loading_start

        console.log(`DEBUG: Loading ${deps.length} dependencies:`, deps);
        const promises = deps.map(dep => loadScript(dep));
        return Promise.all(promises).then(results => {
            console.log(`DEBUG: All ${deps.length} dependencies loaded successfully`);
            return results;
        }).catch(error => {
            console.error(`DEBUG: Failed to load dependencies:`, error);
            throw error;
        });
    }

    function verifyGlobals(required) {
        const missing = [];
        const available = [];

        required.forEach(globalPath => {
            try {
                // Handle dotted paths like window.Logger, window.API_BASE_URL
                // Split path and traverse object hierarchy safely
                const parts = globalPath.split('.');
                let value = window;
                for (const part of parts) {
                    if (value && typeof value === 'object' && part in value) {
                        value = value[part];
                    } else {
                        value = undefined;
                        break;
                    }
                }
                if (typeof value === 'undefined') {
                    missing.push(globalPath);
                } else {
                    available.push(globalPath);
                }
            } catch (e) {
                missing.push(globalPath);
            }
        });

        console.log('DEBUG: verifyGlobals - Total:', required.length, 'Available:', available.length, 'Missing:', missing.length);
        console.log('DEBUG: Available globals:', available.slice(0, 5)); // Show first 5
        console.log('DEBUG: Missing globals:', missing);

        if (missing.length > 0) {
            console.error('INIT: Missing globals:', missing);
        }
        return missing.length === 0;
    }

    /**
     * Wait for a global variable to become available
     * @param {string} globalName - Name of global variable
     * @param {number} maxAttempts - Maximum number of attempts
     * @param {number} intervalMs - Interval between attempts in milliseconds
     * @returns {Promise} Resolves when global is available or max attempts reached
     */
    function waitForGlobal(globalName, maxAttempts, intervalMs) {
        return new Promise(function(resolve) {
            let attempts = 0;
            const checkGlobal = function() {
                attempts++;
                if (window[globalName] || attempts >= maxAttempts) {
                    resolve();
                } else {
                    setTimeout(checkGlobal, intervalMs);
                }
            };
            checkGlobal();
        });
    }

    // Main loader execution
console.log('DEBUG: About to start loader');    console.log('INIT: Loader starting...');

// Load UI Banner System FIRST - needed for enforcement
// region agent log - loader_ui_banner_start
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'loader.js:ui_banner_load',
    message: 'UI Banner System loading started',
    data: {
      page: window.location.pathname,
      hasAuthToken: !!sessionStorage.getItem('authToken'),
      timestamp: new Date().toISOString()
    },
    timestamp: Date.now(),
    sessionId: 'auth_enforcement_debug',
    hypothesisId: 'manifest_loading_sequence'
  })
}).catch(() => {});
// endregion agent log - loader_ui_banner_start

// REMOVED: Obsolete UIBannerSystem loading - file ui-banner-system.js does not exist
// The UIBannerSystem was removed from the codebase but loader code wasn't updated.
// This was causing 404 errors on all pages, preventing proper initialization.

// Continue directly with page loading
const pageKey = document.querySelector('meta[name="page-key"]')?.getAttribute('content') ||
               document.body.getAttribute('data-page-key');

if (!pageKey) {
    console.error('INIT: No page key found');
    return;
}

console.log('INIT: Loading page:', pageKey);
// #region agent log - H1/H3: Script loading order
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:loadPage',message:'Loading page scripts',data:{pageKey,ucmExists:!!window.UnifiedCacheManager,ucmInitialized:window.UnifiedCacheManager?.initialized,dashboardDataExists:!!window.DashboardData,apiConfigExists:!!window.API_CONFIG,apiBaseUrlExists:!!window.API_BASE_URL,authTokenExists:!!sessionStorage.getItem('authToken'),timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H1_H3'})}).catch(()=>{});
// #endregion

// Load manifest and process
loadManifest().then(function(manifest) {
                console.log('DEBUG: Manifest loaded, looking for pageKey:', pageKey);
                console.log('DEBUG: Available pages in manifest:', Object.keys(manifest.pages || {}));
                const pageEntry = manifest.pages[pageKey];
                if (!pageEntry) {
                    console.error('INIT: No entry found for page:', pageKey);
                    console.log('DEBUG: Available pages:', Object.keys(manifest.pages || {}));
                    return;
                }
                console.log('DEBUG: Found pageEntry for', pageKey, 'with entry:', pageEntry.entry);

                // All pages now use package-based architecture
                if (!pageEntry.packages) {
                    console.error('INIT: Page missing packages:', pageKey);
                    console.error('INIT: All pages must use package-based architecture');
                    return;
                }

                console.log('DEBUG: Loading packages:', pageEntry.packages);

                // #region agent log - loader packages start
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    location: 'loader.js:loadPackages:start',
                    message: 'Starting package loading',
                    data: {
                      timestamp: Date.now(),
                      pageKey: pageKey,
                      packages: pageEntry.packages,
                      packageCount: pageEntry.packages.length
                    },
                    sessionId: 'loader_debug_session',
                    hypothesisId: 'H4_loader_packages'
                  })
                }).catch(() => {});
                // #endregion

                loadPackageScripts(pageEntry.packages).then(function() {
                    console.log('DEBUG: Packages loaded successfully for page:', pageKey);
                    // #region agent log - packages loaded
                    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:loadPage',message:'Packages loaded successfully',data:{pageKey,packages:pageEntry.packages,manifestLoadedCount:window.loadedByManifest.size,totalRuntimeLoads:window.runtimeScriptLoads.size,duplicatesFound:window.runtimeDuplicateLog.filter(e=>e.isDuplicate).length,timestamp:Date.now()},sessionId:'loader_audit_checklist',runId:'package_based_loading',hypothesisId:'package_loading_verification'})}).catch(()=>{});
                    // #endregion

                    // Load entry script
                    loadScript(pageEntry.entry).then(function() {
                        console.log('DEBUG: Entry script loaded successfully for page:', pageKey);
                        // Mark entry script as loaded by manifest
                        window.loadedByManifest.add(pageEntry.entry);
                        pageScriptsLoaded = true;  // Mark as loaded to prevent fallback

                        // #region agent log - entry script loaded
                        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:loadPage',message:'Entry script loaded successfully',data:{pageKey,entryScript:pageEntry.entry,manifestLoadedCount:window.loadedByManifest.size,totalRuntimeLoads:window.runtimeScriptLoads.size,duplicatesFound:window.runtimeDuplicateLog.filter(e=>e.isDuplicate).length,coreSystems:{UnifiedCacheManager:!!window.UnifiedCacheManager,Logger:!!window.Logger,UIBannerSystem:!!window.UIBannerSystem,API_CONFIG:!!window.API_CONFIG,DashboardData:!!window.DashboardData},timestamp:Date.now()},sessionId:'loader_audit_checklist',runId:'crud_testing_dashboard',hypothesisId:'entry_loading_verification'})}).catch(()=>{});
                        // #endregion
                        // Verify globals
                        // region agent log - globals_verification
                        // #region agent log - check required_globals before map
                        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:globals_verification:before_map',message:'[A] Checking required_globals before map',data:{timestamp:Date.now(),pageKey,hasRequiredGlobals:!!pageEntry.required_globals,requiredGlobalsType:typeof pageEntry.required_globals,requiredGlobalsIsArray:Array.isArray(pageEntry.required_globals),requiredGlobalsValue:pageEntry.required_globals,pageEntryKeys:Object.keys(pageEntry)},sessionId:'debug-session',runId:'reset_password_loader_fix',hypothesisId:'A_required_globals_undefined'})}).catch(()=>{});
                        // #endregion
                        
                        // Handle missing required_globals field (defensive programming)
                        const requiredGlobals = pageEntry.required_globals || [];
                        
                        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            location: 'loader.js:149',
                            message: 'Globals verification completed',
                            data: {
                              page: window.location.pathname,
                              pageKey: pageKey,
                              requiredGlobals: requiredGlobals,
                              availableGlobals: requiredGlobals.map(global => ({
                                name: global,
                                available: !!window[global]
                              })),
                              hasAuthToken: !!sessionStorage.getItem('authToken'),
                              entryScript: pageEntry.entry
                            },
                            timestamp: Date.now(),
                            sessionId: 'auth_enforcement_debug',
                            hypothesisId: 'globals_availability'
                          })
                        }).catch(() => {});
                        // endregion agent log - globals_verification

                        console.log('DEBUG: About to verify globals for page:', pageKey, 'globals count:', requiredGlobals.length);
                        // Wait for key initialization globals to be available
                        console.log('DEBUG: Waiting for key globals to initialize');

                        // Check each global individually with longer timeout
                        const keyGlobals = ['PACKAGE_MANIFEST', 'UnifiedAppInitializer', 'Logger'];
                        const promises = keyGlobals.map(globalName =>
                            waitForGlobal(globalName, 100, 100) // 100 attempts * 100ms = 10 seconds
                                .then(() => {
                                    console.log(`DEBUG: ✅ ${globalName} is now available`);
                                    return globalName;
                                })
                                .catch(() => {
                                    console.warn(`DEBUG: ❌ ${globalName} not available within timeout`);
                                    return null;
                                })
                        );

                        Promise.all(promises).then(function(results) {
                            const available = results.filter(r => r !== null);
                            console.log(`DEBUG: Key globals check complete: ${available.length}/${keyGlobals.length} available`);
                            verifyGlobals(requiredGlobals);
                        });
                        // #region agent log - H1/H3/H4: Page loaded - final state
                        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/loader.js:pageLoaded',message:'Page loaded successfully',data:{pageKey,ucmExists:!!window.UnifiedCacheManager,ucmInitialized:window.UnifiedCacheManager?.initialized,dashboardDataExists:!!window.DashboardData,apiConfigExists:!!window.API_CONFIG,apiBaseUrlExists:!!window.API_BASE_URL,authTokenExists:!!sessionStorage.getItem('authToken'),currentUserExists:!!sessionStorage.getItem('currentUser'),timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H1_H3_H4'})}).catch(()=>{});
                        // #endregion
                        console.log('INIT: Page loaded successfully');
                    });
                });
            });

// REMOVED: All obsolete UIBannerSystem fallback code - no longer needed since UIBannerSystem loading was removed

    // Enhanced loadScriptOnce with manifest awareness
    function loadScriptOnceWithManifestCheck(src) {
        // Check if already loaded by manifest
        if (window.loadedByManifest.has(src)) {
            console.log(`DEBUG: Skipping ${src} - already loaded by manifest`);
            return Promise.resolve();
        }

        // Check if currently loading (prevent concurrent loads)
        if (window.loadingRegistry[src]) {
            console.log(`DEBUG: Skipping ${src} - already loading`);
            return Promise.resolve();
        }

        // Check existing script tags
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            console.log(`DEBUG: Skipping ${src} - script already exists in DOM`);
            return Promise.resolve();
        }

        // Mark as loading and load
        window.loadingRegistry[src] = true;
        return loadScript(src).finally(() => {
            window.loadingRegistry[src] = false;
        });
    }

    // Loading coordination for bundles vs individual
    function coordinateLoading(componentName, loadFunction) {
        if (window.loadingRegistry[componentName]) {
            console.log(`DEBUG: Component ${componentName} already loading/loaded`);
            return Promise.resolve();
        }

        window.loadingRegistry[componentName] = true;
        return loadFunction().finally(() => {
            window.loadingRegistry[componentName] = false;
        });
    }

    // System initialization tracking
    function markSystemInitialized(systemName) {
        window.systemInitializationState[systemName] = true;
        console.log(`✅ ${systemName} initialized`);
    }

    function isSystemInitialized(systemName) {
        return window.systemInitializationState[systemName];
    }

    // Runtime duplicate verification function
    window.generateRuntimeResolvedList = function() {
        const uniqueScripts = Array.from(window.runtimeScriptLoads.keys()).sort();
        const duplicates = window.runtimeDuplicateLog.filter(entry => entry.isDuplicate);
        const coreSystemsStatus = {
            UnifiedCacheManager: !!window.UnifiedCacheManager,
            Logger: !!window.Logger,
            UIBannerSystem: !!window.UIBannerSystem,
            API_CONFIG: !!window.API_CONFIG,
            DashboardData: !!window.DashboardData
        };
        const coreSystemsCount = Object.values(coreSystemsStatus).filter(Boolean).length;

        const summary = {
            totalUniqueScripts: uniqueScripts.length,
            totalLoadAttempts: window.runtimeDuplicateLog.length,
            totalDuplicates: duplicates.length,
            duplicateScripts: duplicates.map(d => ({script: d.script, loadCount: d.loadCount, firstLoad: d.timestamp})),
            uniqueScripts: uniqueScripts,
            coreSystemsStatus: coreSystemsStatus,
            coreSystemsScore: `${coreSystemsCount}/5`,
            manifestLoaded: window.loadedByManifest.size,
            pageScriptsLoaded: !!pageScriptsLoaded,
            timestamp: Date.now()
        };

        console.log('=== RUNTIME RESOLVED LIST ===');
        console.log('Scripts:', summary.totalUniqueScripts, 'unique,', summary.totalLoadAttempts, 'attempts,', summary.totalDuplicates, 'duplicates');
        console.log('Core Systems:', summary.coreSystemsScore);
        console.log('Manifest Scripts Loaded:', summary.manifestLoaded);
        console.log('Page Scripts Loaded:', summary.pageScriptsLoaded);

        if (duplicates.length > 0) {
            console.log('❌ DUPLICATES FOUND:');
            duplicates.forEach(dup => {
                console.log(`  - ${dup.script} (loaded ${dup.loadCount} times)`);
            });
        } else {
            console.log('✅ NO DUPLICATES DETECTED');
        }

        console.log('Core Systems Status:');
        Object.entries(coreSystemsStatus).forEach(([system, loaded]) => {
            console.log(`  - ${system}: ${loaded ? '✅' : '❌'}`);
        });

        return summary;
    };

    // Make functions globally available for dynamic loading
    window.loadScript = loadScript;
    window.loadManifest = loadManifest;
    window.loadScriptOnceWithManifestCheck = loadScriptOnceWithManifestCheck;
    window.coordinateLoading = coordinateLoading;
    window.markSystemInitialized = markSystemInitialized;
    window.isSystemInitialized = isSystemInitialized;
    window.generateRuntimeResolvedList = window.generateRuntimeResolvedList;

})();
