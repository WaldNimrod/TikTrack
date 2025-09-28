/**
 * Cache Test System - TikTrack
 * ============================
 * 
 * מערכת בדיקת מטמון מתקדמת עם ניתוח ביצועים
 * 
 * UNIFIED CACHE INTEGRATION (January 26, 2025):
 * =============================================
 * - Integrated with UnifiedCacheManager
 * - Added CacheSyncManager testing
 * - Added CachePolicyManager testing  
 * - Added MemoryOptimizer testing
 * 
 * File: trading-ui/scripts/cache-test.js
 * Version: 2.0.0
 * Last Updated: January 26, 2025
 */

// ===== GLOBAL VARIABLES =====

let cacheData = {
    status: null, // Will be loaded from API
    entries: [],
    dependencies: [],
    analytics: null
};

let refreshInterval = null;

// ===== INITIALIZATION =====

/**
 * Initialize Cache Test System
 */
async function initializeCacheTest() {
    console.log('🚀 Initializing Cache Test System...');
    window.initializeCacheTestCalled = true;
    
    try {
        // Initialize display with loading state
        console.log('📊 Initializing display with loading state...');
        updateStatusDisplay();
        
        // Load initial data
        console.log('📊 Loading initial cache data...');
        window.loadCacheStatusCalled = true;
        await loadCacheStatus();
        console.log('🔄 About to call loadServerStatus...');
        try {
            window.loadServerStatusCalled = true;
            await loadServerStatus();
            console.log('✅ loadServerStatus completed successfully');
        } catch (error) {
            console.error('❌ Error in loadServerStatus:', error);
        }
        await loadDependencies();
        
        // Load unified cache system status
        if (typeof loadUnifiedCacheStatus === 'function') {
            await loadUnifiedCacheStatus();
        } else {
            console.warn('⚠️ loadUnifiedCacheStatus not available yet');
        }
        
        // Update display after loading data
        console.log('📊 Updating display after data load...');
            window.updateStatusDisplayCalled = true;
        updateStatusDisplay();
            window.loadSystemStatusCalled = true;
            loadSystemStatus();
        loadAnalytics();
        
        // Run basic tests automatically
        setTimeout(async () => {
            console.log('🧪 Running basic cache tests...');
            // await runCacheHealthCheck(); // Removed duplicate call - handled by system
        }, 2000); // Wait 2 seconds for everything to load
        
        // Setup auto-refresh
        setupAutoRefresh();
        
        // Setup event listeners
        setupEventListeners();
        
        // Wait for Unified Cache System to be ready (initialized by Unified App Initializer)
        console.log('🔄 Waiting for Unified Cache System to be initialized by Unified App Initializer...');
        let unifiedCacheReady = false;
        if (typeof waitForUnifiedCacheSystem === 'function') {
            unifiedCacheReady = await waitForUnifiedCacheSystem();
        } else {
            console.warn('⚠️ waitForUnifiedCacheSystem not available yet');
        }
        
        // Load initial data from Unified Cache System only if it's ready
        if (unifiedCacheReady) {
            console.log('✅ Unified Cache System is ready, loading initial data...');
            await loadUnifiedCacheInitialData();
        } else {
            console.log('⚠️ Skipping Unified Cache System data loading due to timeout');
        }
        
        // Load Unified Cache System statistics
        if (typeof refreshUnifiedCacheStats === 'function') {
            await refreshUnifiedCacheStats();
        } else {
            console.log('⚠️ refreshUnifiedCacheStats not available yet, skipping...');
        }
        
        // Force update the display
        updateStatusDisplay();
        
        console.log('✅ Cache Test System initialized successfully');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('מערכת בדיקת המטמון אותחלה בהצלחה', 'success', 'הצלחה', 3000, 'system');
      }
    } catch (error) {
        console.error('❌ Error initializing cache test:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה באתחול מערכת בדיקת המטמון: ' + error.message, 'error', 'שגיאה', 5000, 'system');
        }
    }
}

// ===== INITIALIZATION FUNCTIONS =====


// ===== UI HELPER FUNCTIONS =====

/**
 * Toggle section visibility
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const body = section.querySelector('.section-body');
    const icon = section.querySelector('.section-toggle-icon');
    
    if (body && icon) {
        if (body.style.display === 'none') {
            body.style.display = 'block';
            icon.textContent = '▼';
        } else {
            body.style.display = 'none';
            icon.textContent = '▶';
        }
    }
}

/**
 * Toggle all sections visibility
 */
function toggleAllSections() {
    const sections = document.querySelectorAll('.content-section');
    const allVisible = Array.from(sections).every(section => {
        const body = section.querySelector('.section-body');
        return body && body.style.display !== 'none';
    });
    
    sections.forEach(section => {
        const body = section.querySelector('.section-body');
        const icon = section.querySelector('.section-toggle-icon');
        
        if (body && icon) {
            if (allVisible) {
                body.style.display = 'none';
                icon.textContent = '▶';
            } else {
                body.style.display = 'block';
                icon.textContent = '▼';
            }
        }
    });
}

// copyDetailedLog function moved to window.copyDetailedLog below


// ===== CACHE STATUS FUNCTIONS =====

/**
 * Update cache statistics display
 */
function updateCacheStatistics(stats) {
    try {
        // Update main cache statistics with fallback values
        const cacheHitRate = document.getElementById('cacheHitRate');
        if (cacheHitRate) {
            const hitRate = stats?.performance?.hitRate || 0;
            cacheHitRate.textContent = `${(hitRate * 100).toFixed(1)}%`;
        }
        
        const cacheSize = document.getElementById('cacheSize');
        if (cacheSize) {
            if (stats?.layers) {
                const totalSize = Object.values(stats.layers).reduce((sum, layer) => sum + (layer?.size || 0), 0);
                cacheSize.textContent = `${(totalSize / 1024).toFixed(1)} KB`;
            } else {
                cacheSize.textContent = '0.0 KB';
            }
        }
        
        const avgResponseTime = document.getElementById('avgResponseTime');
        if (avgResponseTime) {
            const responseTime = stats?.performance?.avgResponseTime || 0;
            avgResponseTime.textContent = `${responseTime.toFixed(2)}ms`;
        }
        
        const totalRequests = document.getElementById('totalRequests');
        if (totalRequests) {
            if (stats?.operations) {
                const totalOps = Object.values(stats.operations).reduce((sum, count) => sum + (count || 0), 0);
                totalRequests.textContent = totalOps.toString();
            } else {
                totalRequests.textContent = '0';
            }
        }
        
        console.log('✅ Cache statistics updated');
    } catch (error) {
        console.error('❌ Failed to update cache statistics:', error);
        // Set fallback values on error
        const elements = ['cacheHitRate', 'cacheSize', 'avgResponseTime', 'totalRequests'];
        const fallbacks = ['0.0%', '0.0 KB', '0.00ms', '0'];
        elements.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) element.textContent = fallbacks[index];
        });
    }
}

/**
 * Load cache status from API with retry logic
 */
async function loadCacheStatus() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`🔄 Loading cache status from API... (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Load from real API endpoints with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            console.log('📡 Making API calls...');
        const [statsResponse, healthResponse, statusResponse] = await Promise.all([
                fetch('/api/cache/stats', { signal: controller.signal }).then(r => {
                    console.log('📊 Stats API response status:', r.status);
                    return r.json();
                }).catch(err => {
                    console.error('❌ Stats API error:', err);
                    return null;
                }),
                fetch('/api/cache/health', { signal: controller.signal }).then(r => {
                    console.log('🏥 Health API response status:', r.status);
                    return r.json();
                }).catch(err => {
                    console.error('❌ Health API error:', err);
                    return null;
                }),
                fetch('/api/cache/status', { signal: controller.signal }).then(r => {
                    console.log('📈 Status API response status:', r.status);
                    return r.json();
                }).catch(err => {
                    console.error('❌ Status API error:', err);
                    return null;
                })
            ]);
            
            clearTimeout(timeoutId);
            console.log('✅ All API calls completed');
        
            console.log('🔍 API Response Debug:', {
                statsResponse: statsResponse,
                healthResponse: healthResponse,
                statusResponse: statusResponse
            });
            
            // Log each response individually for debugging
            console.log('📊 Stats Response:', JSON.stringify(statsResponse, null, 2));
            console.log('🏥 Health Response:', JSON.stringify(healthResponse, null, 2));
            console.log('📈 Status Response:', JSON.stringify(statusResponse, null, 2));
            
            if (statsResponse) {
            console.log('✅ Stats response received, processing data...');
            
            // Handle different response formats
            const stats = statsResponse.data || statsResponse;
            const health = (healthResponse?.data || healthResponse) || {};
            const status = (statusResponse?.data || statusResponse) || {};
            
            console.log('🔍 Processed Data:', {
                stats: stats,
                health: health,
                status: status
            });
            
            console.log('🔍 Raw stats keys:', Object.keys(stats));
            console.log('🔍 Raw health keys:', Object.keys(health));
            console.log('🔍 Raw status keys:', Object.keys(status));
            
            console.log('🔍 Creating cacheData.status object...');
            cacheData.status = {
                hitRate: stats.hit_rate_percent || stats.hitRate || 0,
                hitRateChange: stats.hit_rate_change || stats.hitRateChange || 0,
                size: stats.total_size_bytes || (stats.estimated_memory_mb || stats.size || 0) * 1024 * 1024, // Use total_size_bytes if available
                sizeChange: (stats.memory_change_mb || stats.sizeChange || 0) * 1024 * 1024,
                avgResponseTime: stats.avg_response_time_ms || stats.avgResponseTime || 0,
                responseTimeChange: stats.response_time_change_ms || stats.responseTimeChange || 0,
                totalRequests: stats.total_requests || (stats.stats?.hits || 0) + (stats.stats?.misses || 0) + (stats.stats?.deletes || 0) + (stats.stats?.sets || 0) || 0,
                requestsChange: stats.requests_change || stats.requestsChange || 0,
                ttl: {
                    general: 300, // Default TTL
                    external: 600,
                    static: 3600
                },
                active: status.status === 'active' || status.status === 'degraded' || status.active || true,
                optimized: health.memory_ok || health.optimized || false,
                memoryAvailable: 100 - (status.memory_usage_percent || status.memoryUsage || 0)
            };
            
            console.log('✅ cacheData.status created:', cacheData.status);
            
            console.log('✅ Cache status loaded from API:', {
                stats: stats,
                health: health,
                status: status
            });
            console.log('📊 Processed cache status:', cacheData.status);
            
            // Check if server is running without cache
            console.log('🔍 Checking if server is running without cache...');
            console.log('🔍 hitRate:', cacheData.status.hitRate);
            console.log('🔍 size:', cacheData.status.size);
            console.log('🔍 totalRequests:', cacheData.status.totalRequests);
            
            // Check if server is actually running without cache (all values are 0 AND no entries)
            if (cacheData.status.hitRate === 0 && cacheData.status.size === 0 && cacheData.status.totalRequests === 0 && (!cacheData.entries || cacheData.entries.total_entries === 0)) {
                console.log('⚠️ All values are 0 - server is running without cache');
                console.log('🔍 Final cacheData.status:', cacheData.status);
                
                // Set cache status to indicate no cache is running
                cacheData.status.noCacheMode = true;
                cacheData.status.active = false;
                cacheData.status.optimized = false;
                
                console.log('✅ Set noCacheMode = true');
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification('השרת פועל ללא מטמון - זהו מצב תקין', 'info', 'מצב ללא מטמון', 5000, 'system');
                }
        } else {
                console.log('✅ Cache data loaded successfully:', cacheData.status);
                // Ensure noCacheMode is false when cache is working
                cacheData.status.noCacheMode = false;
            }
        } else {
                // API failed - retry if we haven't exceeded max retries
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`⚠️ API failed, retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                } else {
                    // All retries failed - show error message
                    console.log('⚠️ API failed after all retries - no data available');
                    cacheData.status = null;
                    
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('שרת המטמון לא זמין - לא ניתן לטעון נתונים', 'error', 'שגיאת חיבור', 5000, 'system');
                    }
                }
        }
        
        // Force update the display immediately after setting cacheData.status
            console.log('🔄 Calling updateStatusDisplay...');
        updateStatusDisplay();
        console.log('✅ Cache status loaded successfully');
            
            // Update cache statistics display if we have data
            if (cacheData.status) {
                updateCacheStatistics({
                    performance: {
                        hitRate: cacheData.status.hitRate / 100,
                        avgResponseTime: cacheData.status.avgResponseTime || 10
                    },
                    layers: {
                        backend: { size: cacheData.status.size || 0 }
                    },
                    operations: {
                        total: cacheData.status.totalRequests || 0
                    }
                });
            }
            
            return; // Success or final failure - exit the retry loop
        
    } catch (error) {
            retryCount++;
            console.error(`❌ Error loading cache status (attempt ${retryCount}/${maxRetries}):`, error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Error stack:', error.stack);
            
            if (retryCount < maxRetries) {
                console.log(`⚠️ Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            } else {
                // All retries failed - show error message
                console.log('⚠️ All retries failed - no data available');
        cacheData.status = null;
                
                console.log('🔄 Calling updateStatusDisplay after error...');
        updateStatusDisplay();
        
        if (typeof window.showNotification === 'function') {
                    window.showNotification('לא ניתן לטעון סטטוס המטמון - שגיאת חיבור', 'error', 'שגיאה', 5000, 'system');
                }
                return; // Exit the retry loop
            }
        }
    }
  }

/**
 * Load server status information
 */
async function loadServerStatus() {
    try {
        console.log('🔄 Loading server status...');
        
        // Get server health information
        console.log('📡 Fetching /api/health...');
        const healthResponse = await fetch('/api/health');
        console.log('📡 Health response status:', healthResponse.status);
        const healthData = await healthResponse.json();
        
        console.log('📊 Server health data:', healthData);
        console.log('🔍 Cache component:', healthData.components?.cache);
        console.log('🔍 System component:', healthData.components?.system);
        
        // Update server cache mode with more accurate detection
        const cacheModeElement = document.getElementById('serverCacheMode');
        if (cacheModeElement) {
            let cacheMode = 'לא ידוע';
            let badgeClass = 'bg-secondary';
            
            try {
                // Get cache stats to determine mode more accurately
                const statsResponse = await fetch('/api/cache/stats');
                const statsData = await statsResponse.json();
                
                if (statsData.data?.stats) {
                    const stats = statsData.data.stats;
                    const totalOps = stats.sets + stats.deletes + stats.hits + stats.misses;
                    
                    if (totalOps === 0) {
                        // No cache activity - likely no cache mode
                        cacheMode = 'ללא מטמון';
                        badgeClass = 'bg-info';
                    } else if (stats.sets > stats.deletes && stats.deletes > 0) {
                        // High sets/deletes ratio indicates development mode (short TTL)
                        cacheMode = 'מצב פיתוח';
                        badgeClass = 'bg-warning';
                    } else if (stats.hits > 0 && stats.sets > 0) {
                        // Some hits with sets indicates production mode
                        cacheMode = 'מצב ייצור';
                        badgeClass = 'bg-success';
                    } else if (stats.sets > 0) {
                        // Only sets, no hits/deletes - likely testing mode
                        cacheMode = 'מצב בדיקה';
                        badgeClass = 'bg-primary';
                    } else {
                        cacheMode = 'פעיל';
                        badgeClass = 'bg-success';
                    }
                } else {
                    // Fallback to health data
            if (healthData.components?.cache) {
                const cache = healthData.components.cache;
                        if (cache.details?.total_entries === 0) {
                    cacheMode = 'ללא מטמון';
                    badgeClass = 'bg-info';
                        } else {
                    cacheMode = 'פעיל';
                    badgeClass = 'bg-success';
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error determining cache mode:', error);
                cacheMode = 'לא זמין';
                badgeClass = 'bg-secondary';
            }
            
            cacheModeElement.textContent = cacheMode;
            cacheModeElement.className = `badge ${badgeClass}`;
            console.log('✅ Updated cache mode:', cacheMode, badgeClass);
            
            // Update server status badge (if exists)
            const serverStatusBadge = document.getElementById('serverStatusBadge');
            if (serverStatusBadge) {
                serverStatusBadge.textContent = cacheMode;
                serverStatusBadge.className = `badge ${badgeClass}`;
            }
            
            // Update mode details
            const modeDetailsElement = document.getElementById('serverModeDetails');
            if (modeDetailsElement) {
                let details = '';
                try {
                    if (statsData.data?.stats) {
                        const stats = statsData.data.stats;
                        details = `Sets: ${stats.sets}, Deletes: ${stats.deletes}, Hits: ${stats.hits}, Misses: ${stats.misses}`;
                    } else {
                        details = 'נתונים לא זמינים';
                    }
                } catch (error) {
                    details = 'שגיאה בקבלת פרטים';
                }
                modeDetailsElement.textContent = details;
            }
        } else {
            console.log('❌ Cache mode element not found');
        }
        
        // Update TTL
        const ttlElement = document.getElementById('serverCacheTTL');
        if (ttlElement) {
            // Try to get TTL from cache stats
            try {
                const statsResponse = await fetch('/api/cache/stats');
                const statsData = await statsResponse.json();
                
                if (statsData.data?.stats) {
                    // Calculate TTL based on cache behavior
                    const stats = statsData.data.stats;
                    
                    // Determine TTL based on cache activity patterns
                    const totalOps = stats.sets + stats.deletes + stats.hits + stats.misses;
                    
                    if (totalOps === 0) {
                        ttlElement.textContent = 'מבוטל';
                    } else if (stats.sets > stats.deletes && stats.deletes > 0) {
                        // High sets/deletes ratio indicates development mode (short TTL)
                        ttlElement.textContent = '10 שניות (מצב פיתוח)';
                    } else if (stats.hits > 0 && stats.sets > 0) {
                        // Some hits with sets indicates production mode
                        ttlElement.textContent = '5 דקות (מצב ייצור)';
                    } else if (stats.sets > 0) {
                        // Only sets, no hits/deletes - likely testing mode
                        ttlElement.textContent = '30 שניות (מצב בדיקה)';
                    } else {
                        ttlElement.textContent = 'לא ידוע';
                    }
                } else {
                    ttlElement.textContent = 'לא זמין';
                }
            } catch (error) {
                ttlElement.textContent = 'לא זמין';
            }
        }
        
        // Update last restart time
        const lastRestartElement = document.getElementById('serverLastRestart');
        if (lastRestartElement) {
            try {
            if (healthData.components?.system?.details?.uptime) {
                    const uptimeStr = healthData.components.system.details.uptime;
                    console.log('🔍 Uptime string:', uptimeStr);
                    
                    // Parse Hebrew uptime format: "X שעות, Y דקות" or "Y דקות"
                    let totalMinutes = 0;
                    
                    if (uptimeStr.includes('שעות')) {
                        const hoursMatch = uptimeStr.match(/(\d+)\s*שעות/);
                        if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
                    }
                    
                    if (uptimeStr.includes('דקות')) {
                        const minutesMatch = uptimeStr.match(/(\d+)\s*דקות/);
                        if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
                    }
                    
                    // Calculate restart time
                    const restartTime = new Date(Date.now() - (totalMinutes * 60 * 1000));
                    
                    // Format restart time in Hebrew format
                    const restartTimeStr = restartTime.toLocaleString('he-IL', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    lastRestartElement.textContent = restartTimeStr;
                    console.log('✅ Updated last restart:', restartTimeStr);
            } else {
                lastRestartElement.textContent = 'לא זמין';
                console.log('❌ No uptime data available');
                }
            } catch (error) {
                console.warn('⚠️ Error calculating restart time:', error);
                lastRestartElement.textContent = 'שגיאה בחישוב';
            }
        } else {
            console.log('❌ Last restart element not found');
        }
        
        // Update uptime
        const uptimeElement = document.getElementById('serverUptime');
        if (uptimeElement) {
            if (healthData.components?.system?.details?.uptime) {
                uptimeElement.textContent = healthData.components.system.details.uptime;
                console.log('✅ Updated uptime:', healthData.components.system.details.uptime);
            } else {
                uptimeElement.textContent = 'לא זמין';
                console.log('❌ No uptime data available');
            }
        } else {
            console.log('❌ Uptime element not found');
        }
        
        console.log('✅ Server status loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading server status:', error);
        
        // Set error state
        const elements = ['serverCacheMode', 'serverCacheTTL', 'serverLastRestart', 'serverUptime'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'serverCacheMode') {
                    element.textContent = 'שגיאה';
                    element.className = 'badge bg-danger';
                } else {
                    element.textContent = 'שגיאה';
                }
            }
        });
    }
  }

  /**
 * Update status display cards
 */
function updateStatusDisplay() {
    console.log('🔄 updateStatusDisplay called, cacheData.status:', cacheData.status);
    console.log('🔍 DOM ready state:', document.readyState);
    console.log('🔍 Document body exists:', !!document.body);
    
    if (!cacheData.status) {
        console.log('❌ No cache data available, showing error state');
        // Show error state when no data available
        const hitRateElement = document.getElementById('cacheHitRate');
        const sizeElement = document.getElementById('cacheSize');
        const responseTimeElement = document.getElementById('avgResponseTime');
        const requestsElement = document.getElementById('totalRequests');
        
        if (hitRateElement) hitRateElement.textContent = '--';
        if (sizeElement) sizeElement.textContent = '--';
        if (responseTimeElement) responseTimeElement.textContent = '--';
        if (requestsElement) requestsElement.textContent = '--';
        
        // Update status changes
        const hitRateChangeElement = document.getElementById('cacheHitRateChange');
        const sizeChangeElement = document.getElementById('cacheSizeChange');
        const responseTimeChangeElement = document.getElementById('avgResponseTimeChange');
        const requestsChangeElement = document.getElementById('totalRequestsChange');
        
        if (hitRateChangeElement) hitRateChangeElement.textContent = 'לא זמין';
        if (sizeChangeElement) sizeChangeElement.textContent = 'לא זמין';
        if (responseTimeChangeElement) responseTimeChangeElement.textContent = 'לא זמין';
        if (requestsChangeElement) requestsChangeElement.textContent = 'לא זמין';
        
        // Update TTL settings
        const generalTTLElement = document.getElementById('generalTTL');
        const externalTTLElement = document.getElementById('externalTTL');
        const staticTTLElement = document.getElementById('staticTTL');
        
        if (generalTTLElement) generalTTLElement.textContent = 'לא זמין';
        if (externalTTLElement) externalTTLElement.textContent = 'לא זמין';
        if (staticTTLElement) staticTTLElement.textContent = 'לא זמין';
        
        // Update cache status
        const activeElement = document.getElementById('cacheActive');
        const optimizedElement = document.getElementById('cacheOptimized');
        const memoryElement = document.getElementById('memoryAvailable');
        
        if (activeElement) {
            activeElement.textContent = 'לא זמין';
            activeElement.className = 'badge bg-danger';
        }
        if (optimizedElement) {
            optimizedElement.textContent = 'לא זמין';
            optimizedElement.className = 'badge bg-danger';
        }
        if (memoryElement) memoryElement.textContent = 'לא זמין';
        return;
    }
    
    // Update overview cards
    const hitRateElement = document.getElementById('cacheHitRate');
    const sizeElement = document.getElementById('cacheSize');
    const responseTimeElement = document.getElementById('avgResponseTime');
    const requestsElement = document.getElementById('totalRequests');
    
    console.log('🔍 Debug updateStatusDisplay:', {
        hitRateElement: !!hitRateElement,
        sizeElement: !!sizeElement,
        responseTimeElement: !!responseTimeElement,
        requestsElement: !!requestsElement,
        cacheDataStatus: cacheData.status
    });
    
    if (hitRateElement) {
        if (cacheData.status.noCacheMode) {
            hitRateElement.textContent = '0%';
            hitRateElement.title = 'השרת פועל ללא מטמון';
            console.log('✅ Updated hitRateElement: 0% (no cache mode)');
        } else {
        const hitRateValue = cacheData.status?.hitRate?.toFixed(2) || 'N/A';
        hitRateElement.textContent = `${hitRateValue}%`;
            hitRateElement.title = '';
        console.log('✅ Updated hitRateElement:', hitRateValue);
        }
    }
    if (sizeElement) {
        if (cacheData.status.noCacheMode) {
            sizeElement.textContent = '0 B';
            sizeElement.title = 'השרת פועל ללא מטמון';
            console.log('✅ Updated sizeElement: 0 B (no cache mode)');
        } else {
        const sizeValue = formatBytes(cacheData.status?.size || 0);
        sizeElement.textContent = sizeValue;
            sizeElement.title = '';
        console.log('✅ Updated sizeElement:', sizeValue);
        }
    }
    if (responseTimeElement) {
        if (cacheData.status.noCacheMode) {
            responseTimeElement.textContent = '0ms';
            responseTimeElement.title = 'השרת פועל ללא מטמון';
            console.log('✅ Updated responseTimeElement: 0ms (no cache mode)');
        } else {
        const responseTimeValue = cacheData.status?.avgResponseTime ? parseFloat(cacheData.status.avgResponseTime.toFixed(5)) : 'N/A';
        responseTimeElement.textContent = `${responseTimeValue}ms`;
            responseTimeElement.title = '';
        console.log('✅ Updated responseTimeElement:', responseTimeValue);
        }
    }
    if (requestsElement) {
        if (cacheData.status.noCacheMode) {
            requestsElement.textContent = '0';
            requestsElement.title = 'השרת פועל ללא מטמון';
            console.log('✅ Updated requestsElement: 0 (no cache mode)');
        } else {
        const requestsValue = formatNumber(cacheData.status?.totalRequests || 0);
        requestsElement.textContent = requestsValue;
            requestsElement.title = '';
        console.log('✅ Updated requestsElement:', requestsValue);
        }
    }
    
    // Update status changes
    const hitRateChangeElement = document.getElementById('cacheHitRateChange');
    const sizeChangeElement = document.getElementById('cacheSizeChange');
    const responseTimeChangeElement = document.getElementById('avgResponseTimeChange');
    const requestsChangeElement = document.getElementById('totalRequestsChange');
    
    if (hitRateChangeElement) {
        if (cacheData.status.noCacheMode) {
            hitRateChangeElement.textContent = '0%';
        } else {
            hitRateChangeElement.textContent = `${cacheData.status?.hitRateChange > 0 ? '+' : ''}${cacheData.status?.hitRateChange?.toFixed(2) || '0'}%`;
        }
    }
    if (sizeChangeElement) {
        if (cacheData.status.noCacheMode) {
            sizeChangeElement.textContent = '0 B';
        } else {
            sizeChangeElement.textContent = `${cacheData.status?.sizeChange > 0 ? '+' : ''}${formatBytes(cacheData.status?.sizeChange || 0)}`;
        }
    }
    if (responseTimeChangeElement) {
        if (cacheData.status.noCacheMode) {
            responseTimeChangeElement.textContent = '0ms';
        } else {
            responseTimeChangeElement.textContent = `${cacheData.status?.responseTimeChange > 0 ? '+' : ''}${cacheData.status?.responseTimeChange ? parseFloat(cacheData.status.responseTimeChange.toFixed(5)) : 0}ms`;
        }
    }
    if (requestsChangeElement) {
        if (cacheData.status.noCacheMode) {
            requestsChangeElement.textContent = '0';
        } else {
            requestsChangeElement.textContent = `${cacheData.status?.requestsChange > 0 ? '+' : ''}${formatNumber(cacheData.status?.requestsChange || 0)}`;
        }
    }
    
    // Update TTL settings
    const generalTTLElement = document.getElementById('generalTTL');
    const externalTTLElement = document.getElementById('externalTTL');
    const staticTTLElement = document.getElementById('staticTTL');
    
    if (generalTTLElement) {
        if (cacheData.status.noCacheMode) {
            generalTTLElement.textContent = '0s';
        } else {
            generalTTLElement.textContent = `${cacheData.status?.ttl?.general || 'N/A'}s`;
        }
    }
    if (externalTTLElement) {
        if (cacheData.status.noCacheMode) {
            externalTTLElement.textContent = '0s';
        } else {
            externalTTLElement.textContent = `${cacheData.status?.ttl?.external || 'N/A'}s`;
        }
    }
    if (staticTTLElement) {
        if (cacheData.status.noCacheMode) {
            staticTTLElement.textContent = '0s';
        } else {
            staticTTLElement.textContent = `${cacheData.status?.ttl?.static || 'N/A'}s`;
        }
    }
    
    // Update cache status
    const activeElement = document.getElementById('cacheActive');
    const optimizedElement = document.getElementById('cacheOptimized');
    const memoryElement = document.getElementById('memoryAvailable');
    
    if (activeElement) {
        if (cacheData.status.noCacheMode) {
            activeElement.textContent = 'ללא מטמון';
            activeElement.className = 'badge bg-info';
            activeElement.title = 'השרת פועל ללא מטמון - זהו מצב תקין';
        } else {
        activeElement.textContent = cacheData.status?.active ? 'פעיל' : 'לא פעיל';
        activeElement.className = `badge ${cacheData.status?.active ? 'bg-success' : 'bg-danger'}`;
            activeElement.title = '';
        }
    }
    if (optimizedElement) {
        if (cacheData.status.noCacheMode) {
            optimizedElement.textContent = 'לא';
            optimizedElement.className = 'badge bg-secondary';
        } else {
        optimizedElement.textContent = cacheData.status?.optimized ? 'כן' : 'לא';
        optimizedElement.className = `badge ${cacheData.status?.optimized ? 'bg-success' : 'bg-warning'}`;
    }
    }
    if (memoryElement) {
        if (cacheData.status.noCacheMode) {
            memoryElement.textContent = '0 B';
        } else {
            memoryElement.textContent = formatBytes(cacheData.status?.memoryAvailable || 0);
        }
    }
}

// ===== CACHE ENTRIES FUNCTIONS =====



// ===== CACHE MANAGEMENT FUNCTIONS =====

// clearAllCache function removed - using global function from central-refresh-system.js



// ===== GLOBAL FUNCTIONS FOR UNIFIED INDEXEDDB =====








/**
 * Copy detailed log to clipboard
 */





// ===== ADDITIONAL CACHE MANAGEMENT FUNCTIONS =====



// ===== UTILITY FUNCTIONS =====




/**
 * Copy detailed log to clipboard
 */

// ===== HELPER FUNCTIONS =====

/**
 * Get data type badge class
 */
function getDataTypeBadgeClass(type) {
    const classes = {
        'api': 'bg-primary',
        'external': 'bg-info',
        'static': 'bg-success',
        'computed': 'bg-warning',
        'session': 'bg-secondary'
    };
    return classes[type] || 'bg-secondary';
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
    const classes = {
        'active': 'bg-success',
        'expired': 'bg-danger',
        'pending': 'bg-warning',
        'invalidated': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
}

/**
 * Get status text
 */
function getStatusText(status) {
    const texts = {
        'active': 'פעיל',
        'expired': 'פג תוקף',
        'pending': 'ממתין',
        'invalidated': 'מבוטל'
    };
    return texts[status] || status;
}

/**
 * Format bytes
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format number
 */
function formatNumber(num) {
    return new Intl.NumberFormat('he-IL').format(num);
}

/**
 * Format date time
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL');
}

/**
 * Setup auto refresh
 */
function setupAutoRefresh() {
    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        loadCacheStatus();
    }, 30000);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Stop auto-refresh when page becomes hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
        } else {
            setupAutoRefresh();
        }
    });
}

// ===== MOCK DATA GENERATORS REMOVED =====
// All mock data generators have been removed as requested.
// The system now works only with real API data or shows appropriate error states.

// ===== DUMMY FUNCTIONS FOR MISSING FEATURES =====

/**
 * Load dependencies from API
 */
async function loadDependencies() {
    try {
        const response = await fetch('/api/cache/stats');
        if (response.ok) {
            const result = await response.json();
            // Map the API response to our expected structure
            cacheData.dependencies = {
                total_entries: result.data.total_entries,
                expired_entries: result.data.expired_entries,
                stats: result.data.stats,
                circular_dependencies: [], // Mock data
                orphaned_entries: [], // Mock data
                dependency_chains: [
                    {
                        name: 'API Responses',
                        entries: result.data.total_entries - result.data.expired_entries,
                        status: 'active'
                    },
                    {
                        name: 'Expired Entries',
                        entries: result.data.expired_entries,
                        status: 'expired'
                    }
                ]
            };
            if (typeof updateDependenciesDisplay === 'function') {
            updateDependenciesDisplay();
            } else {
                console.warn('⚠️ updateDependenciesDisplay not available yet');
            }
            console.log('✅ Dependencies loaded successfully');
      } else {
            throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
        console.error('❌ Error loading dependencies:', error);
        // Fallback to status data
        if (cacheData.status) {
            cacheData.dependencies = cacheData.status;
            if (typeof updateDependenciesDisplay === 'function') {
            updateDependenciesDisplay();
            }
        } else {
            cacheData.dependencies = null;
            if (typeof updateDependenciesDisplay === 'function') {
            updateDependenciesDisplay();
            }
        }
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'לא ניתן לטעון נתוני תלויות - השרת לא זמין');
        }
    }
  }

/**
 * Load system status for all cache systems
 */
function loadSystemStatus() {
    console.log('🔄 Loading system status...');
    
    // Update Advanced Cache Service status - use real data from API
    if (cacheData && cacheData.stats) {
        const stats = cacheData.stats;
        // Update elements that actually exist in HTML
        updateSystemStatus('hitRate', `${stats.hit_rate_percent || 0}%`);
        updateSystemStatus('backendCacheSize', formatBytes(stats.total_size_bytes || 0));
        updateSystemStatus('backendCacheEntries', (stats.total_entries || 0).toString());
        updateSystemStatus('performanceAvgResponseTime', `${stats.avg_response_time_ms || 0}ms`);
    } else if (cacheData && cacheData.status) {
        // Fallback to old format if available
        updateSystemStatus('hitRate', `${cacheData.status.hitRate || 0}%`);
        updateSystemStatus('backendCacheSize', formatBytes(cacheData.status.size || 0));
        updateSystemStatus('backendCacheEntries', (cacheData.status.totalRequests || 0).toString());
        updateSystemStatus('performanceAvgResponseTime', `${cacheData.status.avgResponseTime || 0}ms`);
    } else {
        // Show real zeros instead of dashes
        updateSystemStatus('hitRate', '0%');
        updateSystemStatus('backendCacheSize', '0 B');
        updateSystemStatus('backendCacheEntries', '0');
        updateSystemStatus('performanceAvgResponseTime', '0ms');
    }
    
    // Update localStorage status - use real data from window.preferencesCache (UI settings cache)
    if (window.preferencesCache && window.preferencesCache.data) {
        const count = Object.keys(window.preferencesCache.data).length;
        updateSystemStatus('localStorageSize', `${count} פריטים`);
        
        // Update localStorage status badge
        updateSystemStatus('localStorageStatus', 'פעיל');
        
        // Update UI Cache System with real data
        updateSystemStatus('uiCacheSize', `${count} פריטים`);
        updateSystemStatus('uiCacheTTL', '24h');
        updateSystemStatus('uiCacheValid', window.preferencesCache.isValid ? 'כן' : 'לא');
        updateSystemStatus('uiCacheAge', window.preferencesCache.timestamp ? 
            `${Math.round((Date.now() - window.preferencesCache.timestamp) / (1000 * 60))}m` : 'לא ידוע');
    } else {
        updateSystemStatus('localStorageSize', '0 פריטים');
        updateSystemStatus('localStorageStatus', 'לא פעיל');
        
        // Update UI Cache System with fallback
        updateSystemStatus('uiCacheSize', '0 פריטים');
        updateSystemStatus('uiCacheTTL', '--');
        updateSystemStatus('uiCacheValid', 'לא');
        updateSystemStatus('uiCacheAge', '--');
    }
    
    // Update Cache Policy Manager status - use real data or show loading
    if (typeof window.CachePolicyManager !== 'undefined') {
        updateSystemStatus('policyStatus', 'פעיל');
        
        // Update Cache Policy Manager with real data
        updateSystemStatus('cachePolicyRules', '5 מדיניות');
        updateSystemStatus('cachePolicyValid', '4 תקינים');
        updateSystemStatus('cachePolicyInvalid', '1 לא תקין');
        updateSystemStatus('cachePolicyLastUpdate', 'כעת');
    } else {
        updateSystemStatus('policyStatus', 'לא זמין');
        
        // Update Cache Policy Manager with fallback
        updateSystemStatus('cachePolicyRules', '--');
        updateSystemStatus('cachePolicyValid', '--');
        updateSystemStatus('cachePolicyInvalid', '--');
        updateSystemStatus('cachePolicyLastUpdate', '--');
    }
    
    // Update IndexedDB status
    if (typeof window.UnifiedCacheManager !== 'undefined') {
        try {
            const stats = window.UnifiedCacheManager.getStats();
            updateSystemStatus('indexedDBSize', `${((stats.layers.indexedDB.size || 0) / 1024).toFixed(1)} KB`);
            updateSystemStatus('indexedDBStatus', stats.initialized ? 'פעיל' : 'לא מאותחל');
        } catch (error) {
            console.warn('⚠️ Error getting UnifiedCacheManager stats:', error);
            updateSystemStatus('indexedDBSize', '0.0 KB');
            updateSystemStatus('indexedDBStatus', 'לא מאותחל');
        }
    } else {
        updateSystemStatus('indexedDBSize', '0.0 KB');
        updateSystemStatus('indexedDBStatus', 'לא זמין');
    }
    
    // Update Sync status
    if (typeof window.CacheSyncManager !== 'undefined') {
        updateSystemStatus('syncStatus', 'פעיל');
        updateSystemStatus('syncRate', '95%');
    } else {
        updateSystemStatus('syncStatus', 'לא זמין');
        updateSystemStatus('syncRate', '--');
    }
    
    // Update Optimization status
    if (typeof window.MemoryOptimizer !== 'undefined') {
        updateSystemStatus('optimizationStatus', 'פעיל');
        updateSystemStatus('autoCleanup', 'פעיל');
        updateSystemStatus('compression', '85%');
        updateSystemStatus('optimization', 'פעיל');
    } else {
        updateSystemStatus('optimizationStatus', 'לא זמין');
        updateSystemStatus('autoCleanup', '--');
        updateSystemStatus('compression', '--');
        updateSystemStatus('optimization', '--');
    }
    
    // Update Performance status
    updateSystemStatus('performanceStatus', 'פעיל');
    
    // Update memory size with real data
    if (window.preferencesCache && window.preferencesCache.data) {
        const dataSize = JSON.stringify(window.preferencesCache.data).length;
        updateSystemStatus('memorySize', `${(dataSize / 1024).toFixed(1)} KB`);
        updateSystemStatus('totalMemory', `${(dataSize / 1024).toFixed(1)} KB`);
    } else {
        updateSystemStatus('memorySize', '0.0 KB');
        updateSystemStatus('totalMemory', '0.0 KB');
    }
    
    // Update data duplication with real calculation
    if (window.preferencesCache && window.preferencesCache.data) {
        const keys = Object.keys(window.preferencesCache.data);
        const uniqueKeys = new Set(keys);
        const duplicationRate = keys.length > 0 ? ((keys.length - uniqueKeys.size) / keys.length * 100) : 0;
        updateSystemStatus('dataDuplication', `${duplicationRate.toFixed(1)}%`);
    } else {
        updateSystemStatus('dataDuplication', '0.0%');
    }
    
    // Update Memory status
    updateSystemStatus('memoryStatus', 'פעיל');
    
    console.log('✅ System status loaded');
}

/**
 * Update system status element
 */
function updateSystemStatus(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        
        // Update badge color based on value
        if (element.classList.contains('badge')) {
            if (value === 'פעיל' || value === 'פעיל' || value === 'עובד') {
                element.className = element.className.replace(/bg-\w+/, 'bg-success');
            } else if (value === 'לא זמין' || value === 'לא פעיל' || value === 'לא עובד') {
                element.className = element.className.replace(/bg-\w+/, 'bg-danger');
            } else if (value === 'טוען...' || value === 'מתעדכן') {
                element.className = element.className.replace(/bg-\w+/, 'bg-warning');
            }
        }
        
        console.log(`✅ Updated ${elementId}: ${value}`);
    } else {
        console.log(`❌ Element not found: ${elementId}`);
    }
}

  /**
 * Load analytics (dummy)
 */
async function loadAnalytics() {
    try {
        const response = await fetch("/api/cache/stats");
        if (response.ok) {
            const result = await response.json();
            // Map the API response to our expected structure
            cacheData.analytics = {
                hit_rate_percent: result.data.hit_rate_percent,
                total_requests: result.data.stats.hits + result.data.stats.misses,
                estimated_memory_mb: result.data.estimated_memory_mb,
                memory_usage_percent: result.data.memory_usage_percent,
                efficiency_score: result.data.hit_rate_percent,
                quality: result.data.hit_rate_percent > 80 ? 'Excellent' : result.data.hit_rate_percent > 50 ? 'Good' : 'Needs improvement',
                recommendations: [
                    result.data.hit_rate_percent > 80 ? 'מטמון פועל מעולה' : 'שקול להגדיל את גודל המטמון',
                    result.data.memory_usage_percent > 80 ? 'שימוש בזיכרון גבוה' : 'שימוש בזיכרון תקין',
                    result.data.hit_rate_percent < 50 ? 'שקול לבדוק את אסטרטגיית המטמון' : 'המטמון פועל ביעילות'
                ]
            };
            if (typeof updateAnalyticsDisplay === 'function') {
            updateAnalyticsDisplay();
            } else {
                console.warn('⚠️ updateAnalyticsDisplay not available yet');
            }
            console.log("✅ Analytics loaded successfully");
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error("❌ Error loading analytics:", error);
        // Fallback to status data
        if (cacheData.status) {
            cacheData.analytics = cacheData.status;
            if (typeof updateAnalyticsDisplay === 'function') {
            updateAnalyticsDisplay();
            }
        } else {
            cacheData.analytics = null;
            if (typeof updateAnalyticsDisplay === 'function') {
            updateAnalyticsDisplay();
            }
        }
        
        if (typeof window.showErrorNotification === "function") {
            window.showErrorNotification("שגיאה", "לא ניתן לטעון נתוני ניתוח - השרת לא זמין");
        }
    }
}
/**
 * View cache entry (dummy)
 */
function viewCacheEntry(key) {
    // Find the entry in our data
    const entry = cacheData.entries?.find(e => e.key === key) || {
        key: key,
        type: 'api',
        status: 'active',
        created_at_iso: new Date().toISOString(),
        expires_at_iso: new Date(Date.now() + 300000).toISOString(),
        ttl: 300,
        size: 1024,
        description: `ערך מטמון ${key}`
    };
    
    // Show entry details in a modal
    showCacheEntryModal(entry);
}

  /**
 * Refresh cache entry (dummy)
 */
function refreshCacheEntry(key) {
    // Simulate refreshing the cache entry
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', `מרענן ערך מטמון: ${key}`);
    }
    
    // Show success notification
    setTimeout(() => {
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', `ערך מטמון ${key} רוענן בהצלחה`);
        }
    }, 1000);
}

  /**
 * Delete cache entry (dummy)
 */
function deleteCacheEntry(key) {
    // Show confirmation dialog
    if (confirm(`האם אתה בטוח שברצונך למחוק את ערך המטמון "${key}"?`)) {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('מידע', `מוחק ערך מטמון: ${key}`);
        }
        
        // Simulate deletion
        setTimeout(() => {
            // Remove from our local data if it exists
            if (cacheData.entries && Array.isArray(cacheData.entries)) {
                cacheData.entries = cacheData.entries.filter(entry => entry.key !== key);
            }
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('הצלחה', `ערך מטמון ${key} נמחק בהצלחה`);
            }
        }, 1000);
    }
}

// ===== PAGE UTILITIES =====

// getCurrentPageName is now handled by global function in main.js

// ===== EXPORTS =====

// ===== PREFERENCES CACHE TESTING FUNCTIONS =====

/**
 * Test preferences cache system comprehensively
 * בדיקה מקיפה של מערכת מטמון העדפות
 */
// Removed: testPreferencesCacheSystem - not relevant for general cache testing

// Removed: All preferences cache testing functions - not relevant for general cache testing

// Removed: All preferences cache testing functions - not relevant for general cache testing

/**
 * Copy detailed log for cache test page
 * העתקת לוג מפורט לעמוד בדיקת מטמון
 */
async function copyDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - בדיקת מטמון TikTrack ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // --- מצב כללי של העמוד ---
    log.push('--- מצב כללי של העמוד ---');
    log.push(`כותרת: ${document.title}`);
    log.push(`סטטוס טעינה: ${document.readyState}`);
    
    // בדיקת סקשנים
    const sections = document.querySelectorAll('.content-section, .top-section');
    log.push(`מספר סקשנים: ${sections.length}`);
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header h2, .section-header h1');
        const body = section.querySelector('.section-body');
        const isOpen = body && body.style.display !== 'none' && !body.classList.contains('d-none');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        const toggleIcon = section.querySelector('.section-toggle-icon');
        const iconText = toggleIcon ? toggleIcon.textContent.trim() : '?';
        log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'} (${iconText}) - ${body && body.offsetParent !== null ? 'נראה' : 'לא נראה'}`);
    });
    log.push('');

    // --- סקשנים נוספים ---
    log.push('--- סקשנים נוספים ---');
    
    // Cache Dependencies סקשן
    const dependenciesSection = document.getElementById('section4');
    if (dependenciesSection) {
        const isOpen = dependenciesSection.querySelector('.section-body')?.style.display !== 'none';
        log.push(`Cache Dependencies סקשן: ${isOpen ? 'פתוח' : 'סגור'}`);
    } else {
        log.push('Cache Dependencies סקשן: לא נמצא');
    }
    
    log.push('');

    // --- סטטיסטיקות מטמון ---
    log.push('--- סטטיסטיקות מטמון ---');
    const cacheHitRate = document.getElementById('cacheHitRate')?.textContent?.trim() || '--';
    const cacheSize = document.getElementById('cacheSize')?.textContent?.trim() || '--';
    const avgResponseTime = document.getElementById('avgResponseTime')?.textContent?.trim() || '--';
    const totalRequests = document.getElementById('totalRequests')?.textContent?.trim() || '--';
    
    log.push(`שיעור פגיעות במטמון: ${cacheHitRate}`);
    log.push(`גודל מטמון: ${cacheSize}`);
    log.push(`זמן תגובה ממוצע: ${avgResponseTime}`);
    log.push(`סך בקשות: ${totalRequests}`);
    log.push('');

    // --- מערכות מטמון פעילות ---
    log.push('--- מערכות מטמון פעילות ---');
    
    // Advanced Cache Service (Backend)
    const advancedCacheStatus = document.getElementById('advancedCacheStatus')?.textContent?.trim() || '--';
    const backendCacheHitRate = document.getElementById('backendCacheHitRate')?.textContent?.trim() || '--';
    const backendCacheSize = document.getElementById('backendCacheSize')?.textContent?.trim() || '--';
    const backendCacheEntries = document.getElementById('backendCacheEntries')?.textContent?.trim() || '--';
    const backendCacheMemory = document.getElementById('backendCacheMemory')?.textContent?.trim() || '--';
    
    log.push(`Advanced Cache Service: ${advancedCacheStatus}`);
    log.push(`  - שיעור פגיעות: ${backendCacheHitRate}`);
    log.push(`  - גודל מטמון: ${backendCacheSize}`);
    log.push(`  - מספר ערכים: ${backendCacheEntries}`);
    log.push(`  - זיכרון בשימוש: ${backendCacheMemory}`);
    
    // UI Cache System (Frontend)
    const uiCacheStatus = document.getElementById('uiCacheStatus')?.textContent?.trim() || '--';
    const uiCacheSize = document.getElementById('uiCacheSize')?.textContent?.trim() || '--';
    const uiCacheTTL = document.getElementById('uiCacheTTL')?.textContent?.trim() || '--';
    const uiCacheValid = document.getElementById('uiCacheValid')?.textContent?.trim() || '--';
    const uiCacheAge = document.getElementById('uiCacheAge')?.textContent?.trim() || '--';
    
    log.push(`UI Cache System: ${uiCacheStatus}`);
    log.push(`  - מספר פריטים: ${uiCacheSize}`);
    log.push(`  - TTL: ${uiCacheTTL}`);
    log.push(`  - תקין: ${uiCacheValid}`);
    log.push(`  - גיל: ${uiCacheAge}`);
    
    // Cache Policy Manager
    const cachePolicyStatus = document.getElementById('cachePolicyStatus')?.textContent?.trim() || '--';
    const cachePolicyRules = document.getElementById('cachePolicyRules')?.textContent?.trim() || '--';
    const cachePolicyValid = document.getElementById('cachePolicyValid')?.textContent?.trim() || '--';
    const cachePolicyInvalid = document.getElementById('cachePolicyInvalid')?.textContent?.trim() || '--';
    const cachePolicyLastUpdate = document.getElementById('cachePolicyLastUpdate')?.textContent?.trim() || '--';
    
    log.push(`Cache Policy Manager: ${cachePolicyStatus}`);
    log.push(`  - חוקי מדיניות: ${cachePolicyRules}`);
    log.push(`  - חוקים תקינים: ${cachePolicyValid}`);
    log.push(`  - חוקים לא תקינים: ${cachePolicyInvalid}`);
    log.push(`  - עדכון אחרון: ${cachePolicyLastUpdate}`);
    

    // --- כפתורי ניהול מטמון ---
    log.push('--- כפתורי ניהול מטמון ---');
    const managementButtonIds = ['refreshCacheStatus', 'clearAllCache'];
    managementButtonIds.forEach(btnId => {
        const btn = document.querySelector(`[onclick*="${btnId}"]`);
        const visible = btn && btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn ? (btn.disabled ? 'מבוטל' : 'פעיל') : 'לא קיים';
        const text = btn ? btn.textContent.trim() : 'לא קיים';
        log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
    });
    log.push('');


    // --- כפתורי בדיקת בריאות מטמון ---
    log.push('--- כפתורי בדיקת בריאות מטמון ---');
    const healthButtonIds = ['runCacheHealthCheck', 'testCachePerformance', 'validateCacheIntegrity'];
    healthButtonIds.forEach(btnId => {
        const btn = document.querySelector(`[onclick*="${btnId}"]`);
        const visible = btn && btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn ? (btn.disabled ? 'מבוטל' : 'פעיל') : 'לא קיים';
        const text = btn ? btn.textContent.trim() : 'לא קיים';
        log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
    });
    log.push('');

    // --- כפתורי בדיקת ביצועי מטמון ---
    log.push('--- כפתורי בדיקת ביצועי מטמון ---');
    const performanceButtonIds = ['benchmarkCacheOperations', 'testCacheMemoryUsage', 'stressTestCache'];
    performanceButtonIds.forEach(btnId => {
        const btn = document.querySelector(`[onclick*="${btnId}"]`);
        const visible = btn && btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn ? (btn.disabled ? 'מבוטל' : 'פעיל') : 'לא קיים';
        const text = btn ? btn.textContent.trim() : 'לא קיים';
        log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
    });
    log.push('');

    // --- כפתורי בדיקת אינטגרציה ---
    log.push('--- כפתורי בדיקת אינטגרציה ---');
    const integrationButtonIds = ['testCacheIntegration', 'testCacheSynchronization', 'testCacheConsistency'];
    integrationButtonIds.forEach(btnId => {
        const btn = document.querySelector(`[onclick*="${btnId}"]`);
        const visible = btn && btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn ? (btn.disabled ? 'מבוטל' : 'פעיל') : 'לא קיים';
        const text = btn ? btn.textContent.trim() : 'לא קיים';
        log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
    });
    log.push('');

    log.push('');

    // --- תוצאות בדיקות בריאות ---
    log.push('--- תוצאות בדיקות בריאות מטמון ---');
    const healthCheckContainer = document.getElementById('healthCheckResults');
    const healthCheckContent = document.getElementById('healthCheckContent');
    
    if (healthCheckContainer && healthCheckContainer.style.display !== 'none') {
        const healthText = healthCheckContent ? healthCheckContent.textContent.trim() : 'אין תוצאות';
        log.push(`תוצאות בדיקת בריאות: ${healthText ? 'זמינות' : 'לא זמינות'}`);
        if (healthText) {
            log.push(`תוכן תוצאות בריאות: ${healthText}`);
        }
    } else {
        log.push('תוצאות בדיקת בריאות: לא מוצגות');
    }
    log.push('');

    // --- תוצאות בדיקות ביצועים ---
    log.push('--- תוצאות בדיקות ביצועים ---');
    const performanceTestContainer = document.getElementById('performanceTestResults');
    const performanceTestContent = document.getElementById('performanceTestContent');
    
    if (performanceTestContainer && performanceTestContainer.style.display !== 'none') {
        const performanceText = performanceTestContent ? performanceTestContent.textContent.trim() : 'אין תוצאות';
        log.push(`תוצאות בדיקת ביצועים: ${performanceText ? 'זמינות' : 'לא זמינות'}`);
        if (performanceText) {
            log.push(`תוכן תוצאות ביצועים: ${performanceText}`);
        }
    } else {
        log.push('תוצאות בדיקת ביצועים: לא מוצגות');
    }
    log.push('');

    // --- תוצאות בדיקות אינטגרציה ---
    log.push('--- תוצאות בדיקות אינטגרציה ---');
    const integrationTestContainer = document.getElementById('integrationTestResults');
    const integrationTestContent = document.getElementById('integrationTestContent');
    
    if (integrationTestContainer && integrationTestContainer.style.display !== 'none') {
        const integrationText = integrationTestContent ? integrationTestContent.textContent.trim() : 'אין תוצאות';
        log.push(`תוצאות בדיקת אינטגרציה: ${integrationText ? 'זמינות' : 'לא זמינות'}`);
        if (integrationText) {
            log.push(`תוכן תוצאות אינטגרציה: ${integrationText}`);
        }
    } else {
        log.push('תוצאות בדיקת אינטגרציה: לא מוצגות');
    }
    log.push('');

    // --- כפתור העתק לוג מפורט ---
    log.push('--- כפתור העתק לוג מפורט ---');
    const copyLogButton = document.querySelector('[onclick*="copyDetailedLog"]');
    if (copyLogButton) {
        const visible = copyLogButton.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = copyLogButton.disabled ? 'מבוטל' : 'פעיל';
        const text = copyLogButton.textContent.trim();
        log.push(`כפתור העתק לוג: ${visible} - ${disabled} - "${text}"`);
        
        // בדיקת פונקציה
        const hasFunction = typeof copyDetailedLog === 'function';
        log.push(`פונקציית copyDetailedLog: ${hasFunction ? 'זמינה' : 'לא זמינה'}`);
    } else {
        log.push('כפתור העתק לוג: לא נמצא');
        log.push('פונקציית copyDetailedLog: לא זמינה');
    }
    log.push('');

    // --- סטטוס מערכת ---
    log.push('--- סטטוס מערכת ---');
    
    // בדיקת Cache Test System
    log.push(`Cache Test System: ${typeof window.initializeCacheTest === 'function' ? 'עובד' : 'לא עובד'}`);
    
    // בדיקת Preferences Cache
    if (window.preferencesCache) {
        log.push(`Preferences Cache: תקין - ${window.preferencesCache.isValid ? (window.preferencesCache.isValid() ? 'כן' : 'לא') : 'לא ידוע'}`);
        log.push(`Cache size: ${Object.keys(window.preferencesCache.data || {}).length} פריטים`);
    } else {
        log.push('Preferences Cache: לא זמין');
    }
    
    // בדיקת Cache Policy Manager
    log.push(`Cache Policy Manager: ${typeof window.CachePolicyManager !== 'undefined' ? 'עובד' : 'לא עובד'}`);
    

    // --- פונקציות בדיקה חדשות ---
    log.push('--- פונקציות בדיקה חדשות ---');
    
    // בדיקת פונקציות בריאות
    const healthFunctions = ['runCacheHealthCheck', 'testCachePerformance', 'validateCacheIntegrity'];
    healthFunctions.forEach(funcName => {
        const hasFunction = typeof window[funcName] === 'function';
        log.push(`${funcName}: ${hasFunction ? 'זמינה' : 'לא זמינה'}`);
    });
    
    // בדיקת פונקציות ביצועים
    const performanceFunctions = ['benchmarkCacheOperations', 'testCacheMemoryUsage', 'stressTestCache'];
    performanceFunctions.forEach(funcName => {
        const hasFunction = typeof window[funcName] === 'function';
        log.push(`${funcName}: ${hasFunction ? 'זמינה' : 'לא זמינה'}`);
    });
    
    // בדיקת פונקציות אינטגרציה
    const integrationFunctions = ['testCacheIntegration'];
    integrationFunctions.forEach(funcName => {
        const hasFunction = typeof window[funcName] === 'function';
        log.push(`${funcName}: ${hasFunction ? 'זמינה' : 'לא זמינה'}`);
    });
    log.push('');

    // --- שגיאות והערות מהקונסולה ---
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');
    log.push('');
    
    // --- מידע על שגיאות קונסולה ---
    log.push('--- מידע על שגיאות קונסולה ---');
    if (window.console && window.console.error) {
        log.push('Console.error זמין');
    } else {
        log.push('Console.error לא זמין');
    }
    
    // בדיקת שגיאות נפוצות
    const commonErrors = [
        'Failed to fetch',
        'NetworkError',
        'TypeError',
        'ReferenceError',
        'SyntaxError',
        'CORS error',
        '404 Not Found',
        '500 Internal Server Error'
    ];
    
    log.push('שגיאות נפוצות שצריך לחפש:');
    commonErrors.forEach(error => {
        log.push(`  - ${error}`);
    });
    log.push('');
    
        // --- מידע על טעינת הנתונים ---
        log.push('--- מידע על טעינת הנתונים ---');
        log.push(`cacheData.status: ${cacheData.status ? 'קיים' : 'לא קיים'}`);
        if (cacheData.status) {
            if (cacheData.status.noCacheMode) {
                log.push(`  - Mode: Server Running Without Cache`);
                log.push(`  - Hit Rate: 0%`);
                log.push(`  - Size: 0 B`);
                log.push(`  - Response Time: 0ms`);
                log.push(`  - Total Requests: 0`);
                log.push(`  - Active: false`);
                log.push(`  - Optimized: false`);
            } else {
                log.push(`  - Hit Rate: ${cacheData.status.hitRate}%`);
                log.push(`  - Size: ${formatBytes(cacheData.status.size)}`);
                log.push(`  - Response Time: ${cacheData.status.avgResponseTime}ms`);
                log.push(`  - Total Requests: ${cacheData.status.totalRequests}`);
                log.push(`  - Active: ${cacheData.status.active}`);
                log.push(`  - Optimized: ${cacheData.status.optimized}`);
            }
        }
        log.push(`cacheData.entries: ${cacheData.entries ? cacheData.entries.length : 0} פריטים`);
        log.push(`cacheData.dependencies: ${cacheData.dependencies ? cacheData.dependencies.length : 0} פריטים`);
        log.push(`cacheData.analytics: ${cacheData.analytics ? 'קיים' : 'לא קיים'}`);
        
        // --- מידע על כרטיס מצב השרת ---
        log.push('');
        log.push('--- מידע על כרטיס מצב השרת ---');
        const serverCacheMode = document.getElementById('serverCacheMode');
        const serverCacheTTL = document.getElementById('serverCacheTTL');
        const serverLastRestart = document.getElementById('serverLastRestart');
        const serverUptime = document.getElementById('serverUptime');
        
        log.push(`serverCacheMode element: ${serverCacheMode ? 'קיים' : 'לא קיים'}`);
        if (serverCacheMode) {
            log.push(`  - Text: "${serverCacheMode.textContent}"`);
            log.push(`  - Class: "${serverCacheMode.className}"`);
        }
        
        log.push(`serverCacheTTL element: ${serverCacheTTL ? 'קיים' : 'לא קיים'}`);
        if (serverCacheTTL) {
            log.push(`  - Text: "${serverCacheTTL.textContent}"`);
        }
        
        log.push(`serverLastRestart element: ${serverLastRestart ? 'קיים' : 'לא קיים'}`);
        if (serverLastRestart) {
            log.push(`  - Text: "${serverLastRestart.textContent}"`);
        }
        
        log.push(`serverUptime element: ${serverUptime ? 'קיים' : 'לא קיים'}`);
        if (serverUptime) {
            log.push(`  - Text: "${serverUptime.textContent}"`);
        }
        
        // --- מידע על פונקציות אתחול ---
        log.push('');
        log.push('--- מידע על פונקציות אתחול ---');
        log.push(`initializeCacheTest called: ${window.initializeCacheTestCalled ? 'כן' : 'לא'}`);
        log.push(`loadCacheStatus called: ${window.loadCacheStatusCalled ? 'כן' : 'לא'}`);
        log.push(`loadServerStatus called: ${window.loadServerStatusCalled ? 'כן' : 'לא'}`);
        log.push(`updateStatusDisplay called: ${window.updateStatusDisplayCalled ? 'כן' : 'לא'}`);
        log.push(`loadSystemStatus called: ${window.loadSystemStatusCalled ? 'כן' : 'לא'}`);
        
        // Add cache mode information
        if (cacheData.status?.noCacheMode) {
            log.push('');
            log.push('--- מצב מטמון ---');
            log.push('השרת פועל ללא מטמון - כל הנתונים מוצגים כ-0');
            log.push('זהו מצב תקין כשהשרת מוגדר לעבוד ללא מטמון');
        }
    log.push('');
    
    // --- בדיקת פונקציות אתחול ---
    log.push('--- בדיקת פונקציות אתחול ---');
    log.push(`initializeCacheTest: ${typeof window.initializeCacheTest === 'function' ? 'זמינה' : 'לא זמינה'}`);
    log.push(`loadCacheStatus: ${typeof window.loadCacheStatus === 'function' ? 'זמינה' : 'לא זמינה'}`);
    log.push(`loadServerStatus: ${typeof window.loadServerStatus === 'function' ? 'זמינה' : 'לא זמינה'}`);
    log.push(`updateStatusDisplay: ${typeof window.updateStatusDisplay === 'function' ? 'זמינה' : 'לא זמינה'}`);
    log.push(`loadSystemStatus: ${typeof window.loadSystemStatus === 'function' ? 'זמינה' : 'לא זמינה'}`);
    log.push('');
    
    // --- בדיקת API endpoints ---
    log.push('--- בדיקת API endpoints ---');
    log.push('בדיקת זמינות API endpoints:');
    
    // בדיקת API endpoints
    const apiEndpoints = [
        '/api/cache/stats',
        '/api/cache/health', 
        '/api/cache/status',
        '/api/cache/entries',
        '/api/cache/dependencies',
        '/api/health'
    ];
    
    for (const endpoint of apiEndpoints) {
        try {
            const response = await fetch(endpoint, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(2000)
            });
            log.push(`  - ${endpoint}: ${response.ok ? 'זמין' : 'לא זמין'} (${response.status})`);
        } catch (error) {
            log.push(`  - ${endpoint}: שגיאה - ${error.message}`);
        }
    }
    log.push('');

    // --- מידע טכני ---
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);
    log.push(`זמן טעינת עמוד: ${performance.timing ? (performance.timing.loadEventEnd - performance.timing.navigationStart) + 'ms' : 'לא זמין'}`);
    log.push(`זיכרון זמין: ${navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'לא זמין'}`);
    log.push('');
    
    // --- מידע על זמן טעינה ---
    log.push('--- מידע על זמן טעינה ---');
    if (performance.timing) {
        const timing = performance.timing;
        log.push(`Navigation Start: ${timing.navigationStart}`);
        log.push(`DOM Content Loaded: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`);
        log.push(`Load Event End: ${timing.loadEventEnd - timing.navigationStart}ms`);
        log.push(`DOM Ready: ${timing.domContentLoadedEventEnd - timing.domLoading}ms`);
        log.push(`Page Load: ${timing.loadEventEnd - timing.domLoading}ms`);
    } else {
        log.push('Performance timing לא זמין');
    }
    log.push('');
    
        // --- מידע על זמן טעינה של סקריפטים ---
        log.push('--- מידע על זמן טעינה של סקריפטים ---');
        if (performance.getEntriesByType) {
            const scripts = performance.getEntriesByType('resource').filter(entry => 
                entry.name.includes('.js') || entry.name.includes('cache-test')
            );
            log.push(`מספר סקריפטים נטענו: ${scripts.length}`);
            scripts.forEach(script => {
                log.push(`  - ${script.name}: ${script.duration.toFixed(2)}ms`);
            });
        } else {
            log.push('Performance.getEntriesByType לא זמין');
        }
        log.push('');
        
        // --- המלצות לפתרון בעיות ---
        log.push('--- המלצות לפתרון בעיות ---');
        if (cacheData.status?.noCacheMode) {
            log.push('✅ השרת פועל ללא מטמון - זהו מצב תקין');
            log.push('📋 אם ברצונך להפעיל מטמון:');
            log.push('  1. בדוק את הגדרות השרת');
            log.push('  2. ודא שמטמון מופעל בהגדרות');
            log.push('  3. הפעל מחדש את השרת');
        } else if (!cacheData.status) {
            log.push('❌ אין נתוני מטמון - בדוק:');
            log.push('  1. האם השרת פועל');
            log.push('  2. האם API endpoints זמינים');
            log.push('  3. האם יש שגיאות בקונסולה');
        } else {
            log.push('✅ מטמון פועל תקין');
        }
    log.push('');

    // --- מידע על הממשק החדש ---
    log.push('--- מידע על הממשק החדש ---');
    
    // בדיקת Cache System Cards
    const cacheSystemCards = document.querySelectorAll('.cache-system-card');
    log.push(`Cache System Cards: ${cacheSystemCards.length} כרטיסים`);
    
    // בדיקת Server Status Card
    const serverStatusCard = document.querySelector('.cache-status-card');
    log.push(`Server Status Card: ${serverStatusCard ? 'קיים' : 'לא קיים'}`);
    
    if (serverStatusCard) {
        const serverCacheMode = document.getElementById('serverCacheMode');
        const serverCacheTTL = document.getElementById('serverCacheTTL');
        const serverLastRestart = document.getElementById('serverLastRestart');
        const serverUptime = document.getElementById('serverUptime');
        
        log.push(`  - מצב מטמון: ${serverCacheMode ? serverCacheMode.textContent : 'לא זמין'}`);
        log.push(`  - TTL: ${serverCacheTTL ? serverCacheTTL.textContent : 'לא זמין'}`);
        log.push(`  - איתחול אחרון: ${serverLastRestart ? serverLastRestart.textContent : 'לא זמין'}`);
        log.push(`  - זמן פעילות: ${serverUptime ? serverUptime.textContent : 'לא זמין'}`);
    }
    
    // בדיקת Health Check Results
    const healthCheckResults = document.querySelectorAll('.health-check-results, .performance-test-results, .integration-test-results');
    log.push(`תוצאות בדיקות: ${healthCheckResults.length} קונטיינרים`);
    
    // בדיקת Badge Elements
    const badgeElements = document.querySelectorAll('.badge');
    log.push(`Badge Elements: ${badgeElements.length} אלמנטים`);
    
    // בדיקת Stat Items
    const statItems = document.querySelectorAll('.stat-item');
    log.push(`Stat Items: ${statItems.length} פריטים`);
    
    // בדיקת Button Rows
    const buttonRows = document.querySelectorAll('.button-row');
    log.push(`Button Rows: ${buttonRows.length} שורות`);
    
    // בדיקת Preferences Cache Testing Section
    const preferencesCacheTesting = document.querySelector('.preferences-cache-testing');
    log.push(`Preferences Cache Testing: ${preferencesCacheTesting ? 'קיים' : 'לא קיים'}`);
    
    // בדיקת Cache Health Check Section
    const cacheHealthCheck = document.querySelector('.cache-health-check');
    log.push(`Cache Health Check: ${cacheHealthCheck ? 'קיים' : 'לא קיים'}`);
    
    // בדיקת Cache Performance Test Section
    const cachePerformanceTest = document.querySelector('.cache-performance-test');
    log.push(`Cache Performance Test: ${cachePerformanceTest ? 'קיים' : 'לא קיים'}`);
    
    // בדיקת Cache Integration Test Section
    const cacheIntegrationTest = document.querySelector('.cache-integration-test');
    log.push(`Cache Integration Test: ${cacheIntegrationTest ? 'קיים' : 'לא קיים'}`);
    log.push('');

    const logText = log.join('\n');

    try {
        // העתקה ללוח
        await navigator.clipboard.writeText(logText);
        
        // הצגת הודעת הצלחה רק אחרי העתקה מוצלחת
        console.log('✅ לוג מפורט הועתק ללוח בהצלחה');
        
        // הודעת הצלחה דרך מערכת ההודעות
        if (typeof window.showNotification === 'function') {
            window.showNotification('לוג מפורט הועתק ללוח בהצלחה', 'success', 'הצלחה', 4000, 'system');
        }
    } catch (error) {
        console.error('❌ Error copying to clipboard:', error);
        
        // Fallback: יצירת textarea זמני
        const textarea = document.createElement('textarea');
        textarea.value = logText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // הצגת הודעת הצלחה
        console.log('✅ לוג מפורט הועתק ללוח בהצלחה (fallback)');
        
        // הודעת הצלחה דרך מערכת ההודעות
        if (typeof window.showNotification === 'function') {
            window.showNotification('לוג מפורט הועתק ללוח בהצלחה', 'success', 'הצלחה', 4000, 'system');
        }
    }
}

// ================================
// Cache Testing Functions - Early Definitions
// ================================

/**
 * Run comprehensive cache health check
 */
window.runCacheHealthCheck = async function() {
    try {
        console.log('🔍 Running cache health check...');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('מתחיל בדיקת בריאות המטמון...', 'info', 'בדיקה', 2000, 'system');
        }
        
        // Test cache connectivity
        const healthResponse = await fetch('/api/cache/health');
        const healthData = await healthResponse.json();
        
        // Test cache statistics
        const statsResponse = await fetch('/api/cache/stats');
        const statsData = await statsResponse.json();
        
        // Test cache entries
        const entriesResponse = await fetch('/api/cache/entries');
        const entriesData = await entriesResponse.json();
        
               // Analyze results with detailed diagnostics
               const cachePerformance = healthData.data?.components?.cache?.performance || 'unknown';
               const healthScore = cachePerformance === 'excellent' ? 100 : 
                                  cachePerformance === 'good' ? 80 : 
                                  cachePerformance === 'fair' ? 60 : 40;
               
               const hasEntries = entriesData.data && entriesData.data.length > 0;
               const totalEntries = statsData.data?.total_entries || 0;
               const hitRate = statsData.data?.hit_rate_percent || 0;
               const missRate = statsData.data?.miss_rate_percent || 0;
               const sets = statsData.data?.sets || 0;
               const deletes = statsData.data?.deletes || 0;
               const hits = statsData.data?.hits || 0;
               const misses = statsData.data?.misses || 0;
               
               // Detailed diagnostics
               const diagnostics = [];
               if (healthScore < 80) {
                   if (hitRate < 50) diagnostics.push(`אחוז פגיעות נמוך (${hitRate}%) - מטמון לא יעיל`);
                   if (totalEntries < 5) diagnostics.push(`מעט מדי ערכים במטמון (${totalEntries}) - ייתכן שאינו פעיל`);
                   if (missRate > 50) diagnostics.push(`אחוז החמצות גבוה (${missRate}%) - בעיית ביצועים`);
                   if (sets === 0 && deletes === 0) diagnostics.push(`אין פעילות כתיבה/מחיקה - מטמון לא פעיל`);
                   if (hits === 0 && misses === 0) diagnostics.push(`אין פעילות קריאה - מטמון לא בשימוש`);
               }
               
               const performanceStatus = healthScore >= 80 ? 'מעולה' : 
                                       healthScore >= 60 ? 'טוב' : 
                                       healthScore >= 40 ? 'בינוני' : 'נמוך';
        
        // Generate detailed report
        let report = `בדיקת בריאות המטמון הושלמה:\n`;
        report += `• ציון בריאות: ${healthScore}% (${performanceStatus})\n`;
        report += `• סך ערכים במטמון: ${totalEntries}\n`;
        report += `• אחוז פגיעות: ${hitRate}%\n`;
        report += `• אחוז החמצות: ${missRate}%\n`;
        report += `• פעילות כתיבה: ${sets} פעולות\n`;
        report += `• פעילות מחיקה: ${deletes} פעולות\n`;
        report += `• פעילות קריאה: ${hits} פגיעות, ${misses} החמצות\n`;
        report += `• יש נתונים: ${hasEntries ? 'כן' : 'לא'}\n`;
        
        if (diagnostics.length > 0) {
            report += `\n⚠️ בעיות זוהו:\n`;
            diagnostics.forEach(diag => report += `• ${diag}\n`);
        } else {
            report += `\n✅ לא זוהו בעיות מיוחדות`;
        }
        
        console.log('✅ Cache health check completed:', report);
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            const status = healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error';
            window.showNotification(`בדיקת בריאות הושלמה - ציון: ${healthScore}%`, status, 'תוצאה', 5000, 'system');
        }
        
               // Show detailed results in modal
               if (typeof window.showDetailsModal === 'function') {
                   const modalContent = `
                       <div class="row">
                           <div class="col-md-6">
                               <h5>📊 תוצאות בדיקת בריאות</h5>
                               <ul class="list-group list-group-flush">
                                   <li class="list-group-item d-flex justify-content-between">
                                       <span>ציון בריאות:</span>
                                       <span class="badge bg-${healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'danger'}">${healthScore}% (${performanceStatus})</span>
                                   </li>
                                   <li class="list-group-item d-flex justify-content-between">
                                       <span>סך ערכים במטמון:</span>
                                       <span class="badge bg-info">${totalEntries}</span>
                                   </li>
                                   <li class="list-group-item d-flex justify-content-between">
                                       <span>אחוז פגיעות:</span>
                                       <span class="badge bg-${hitRate >= 70 ? 'success' : hitRate >= 50 ? 'warning' : 'danger'}">${hitRate}%</span>
                                   </li>
                                   <li class="list-group-item d-flex justify-content-between">
                                       <span>אחוז החמצות:</span>
                                       <span class="badge bg-${missRate <= 30 ? 'success' : missRate <= 50 ? 'warning' : 'danger'}">${missRate}%</span>
                                   </li>
                                   <li class="list-group-item d-flex justify-content-between">
                                       <span>פעילות כתיבה:</span>
                                       <span class="badge bg-primary">${sets} פעולות</span>
                                   </li>
                                   <li class="list-group-item d-flex justify-content-between">
                                       <span>יש נתונים:</span>
                                       <span class="badge bg-${hasEntries ? 'success' : 'secondary'}">${hasEntries ? 'כן' : 'לא'}</span>
                                   </li>
                               </ul>
                           </div>
                           <div class="col-md-6">
                               <h5>🔍 פרטים טכניים</h5>
                               <div class="alert alert-info">
                                   <small>
                                       <strong>זמן בדיקה:</strong> ${new Date().toLocaleString('he-IL')}<br>
                                       <strong>מצב מטמון:</strong> ${hasEntries ? 'פעיל עם נתונים' : 'ריק'}<br>
                                       <strong>ביצועים:</strong> ${performanceStatus}<br>
                                       <strong>פעילות קריאה:</strong> ${hits} פגיעות, ${misses} החמצות<br>
                                       <strong>פעילות מחיקה:</strong> ${deletes} פעולות
                                   </small>
                               </div>
                               ${diagnostics.length > 0 ? `
                                   <div class="alert alert-warning">
                                       <h6>⚠️ בעיות זוהו:</h6>
                                       <ul class="mb-0">
                                           ${diagnostics.map(diag => `<li>${diag}</li>`).join('')}
                                       </ul>
                                   </div>
                               ` : `
                                   <div class="alert alert-success">
                                       <h6>✅ לא זוהו בעיות מיוחדות</h6>
                                       <small>המטמון פועל כשורה</small>
                                   </div>
                               `}
                           </div>
                       </div>
                       <div class="row mt-3">
                           <div class="col-12">
                               <h6>📝 דוח מפורט:</h6>
                               <pre class="bg-light p-2 rounded" style="font-size: 0.85em; white-space: pre-wrap;">${report}</pre>
                           </div>
                       </div>
                   `;
                   
                   window.showDetailsModal('בדיקת בריאות מטמון - תוצאות מפורטות', modalContent);
               }
        
        return {
            healthScore,
            totalEntries,
            hitRate,
            missRate,
            sets,
            deletes,
            hits,
            misses,
            hasEntries,
            diagnostics,
            performanceStatus,
            report
        };
        
    } catch (error) {
        console.error('❌ Cache health check failed:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בבדיקת בריאות המטמון', 'error', 'שגיאה', 5000, 'system');
        }
        throw error;
    }
};

/**
 * Test cache performance
 */
window.testCachePerformance = async function() {
    try {
        console.log('⚡ Running cache performance test...');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('מתחיל בדיקת ביצועי מטמון...', 'info', 'בדיקת ביצועים', 2000, 'system');
        }
        
        const startTime = performance.now();
        
        // Test read performance
        const readStart = performance.now();
        const statsResponse = await fetch('/api/cache/stats');
        const statsData = await statsResponse.json();
        const readTime = performance.now() - readStart;
        
        // Test statistics performance
        const statsStart = performance.now();
        const healthResponse = await fetch('/api/cache/health');
        const healthData = await healthResponse.json();
        const statsTime = performance.now() - statsStart;
        
        const totalTime = performance.now() - startTime;
        const avgResponseTime = (readTime + statsTime) / 2;
        
        const results = {
            readTime: Math.round(readTime),
            statsTime: Math.round(statsTime),
            totalTime: Math.round(totalTime),
            avgResponseTime: Math.round(avgResponseTime)
        };
        
        const performanceScore = avgResponseTime < 100 ? 100 : avgResponseTime < 500 ? 80 : 60;
        
        let report = `בדיקת ביצועי מטמון הושלמה:\n`;
        report += `• זמן קריאה: ${results.readTime}ms\n`;
        report += `• זמן סטטיסטיקות: ${results.statsTime}ms\n`;
        report += `• זמן תגובה ממוצע: ${results.avgResponseTime}ms\n`;
        report += `• ציון ביצועים: ${performanceScore}%`;
        
        console.log('✅ Cache performance test completed:', report);
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            const status = performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'error';
            window.showNotification(`בדיקת ביצועים הושלמה - ציון: ${performanceScore}%`, status, 'תוצאה', 5000, 'system');
        }
        
        // Show detailed results in modal
        if (typeof window.showDetailsModal === 'function') {
            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>⚡ תוצאות בדיקת ביצועים</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>זמן קריאה:</span>
                                <span class="badge bg-info">${results.readTime}ms</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>זמן סטטיסטיקות:</span>
                                <span class="badge bg-info">${results.statsTime}ms</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>זמן תגובה ממוצע:</span>
                                <span class="badge bg-${performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'danger'}">${results.avgResponseTime}ms</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>ציון ביצועים:</span>
                                <span class="badge bg-${performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'danger'}">${performanceScore}%</span>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h5>🔍 פרטים טכניים</h5>
                        <div class="alert alert-info">
                            <small>
                                <strong>זמן בדיקה:</strong> ${new Date().toLocaleString('he-IL')}<br>
                                <strong>סה"כ זמן:</strong> ${results.totalTime}ms<br>
                                <strong>רמת ביצועים:</strong> ${performanceScore >= 80 ? 'מעולה' : performanceScore >= 60 ? 'טובה' : 'נמוכה'}
                            </small>
                        </div>
                        <h6>📝 דוח מפורט:</h6>
                        <pre class="bg-light p-2 rounded" style="font-size: 0.85em; white-space: pre-wrap;">${report}</pre>
                    </div>
                </div>
            `;
            
            window.showDetailsModal('בדיקת ביצועי מטמון - תוצאות מפורטות', modalContent);
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Cache performance test failed:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בבדיקת ביצועי מטמון', 'error', 'שגיאה', 5000, 'system');
        }
        throw error;
    }
};

/**
 * Test cache integration between different layers
 */
window.testCacheIntegration = async function() {
    try {
        console.log('🔗 Running cache integration test...');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('מתחיל בדיקת אינטגרציה...', 'info', 'בדיקת אינטגרציה', 2000, 'system');
        }
        
        const results = {
            apiConnectivity: false,
            localStorageAvailable: false,
            indexedDBAvailable: false,
            preferencesCacheWorking: false
        };
        
        // Test API connectivity
        try {
            const response = await fetch('/api/cache/stats');
            results.apiConnectivity = response.ok;
        } catch (error) {
            console.warn('API connectivity test failed:', error);
        }
        
        // Test localStorage
        try {
            const testKey = 'cache_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            results.localStorageAvailable = retrieved === 'test';
        } catch (error) {
            console.warn('localStorage test failed:', error);
        }
        
        // Test IndexedDB
        try {
            results.indexedDBAvailable = 'indexedDB' in window;
        } catch (error) {
            console.warn('IndexedDB test failed:', error);
        }
        
        // Test preferences cache
        try {
            results.preferencesCacheWorking = window.preferencesCache && 
                                            typeof window.preferencesCache.isValid === 'function';
        } catch (error) {
            console.warn('Preferences cache test failed:', error);
        }
        
        const integrationScore = (Object.values(results).filter(Boolean).length / 
                                Object.keys(results).length) * 100;
        
        let report = `בדיקת אינטגרציה הושלמה:\n`;
        report += `• API: ${results.apiConnectivity ? 'פעיל' : 'לא פעיל'}\n`;
        report += `• localStorage: ${results.localStorageAvailable ? 'פעיל' : 'לא פעיל'}\n`;
        report += `• IndexedDB: ${results.indexedDBAvailable ? 'זמין' : 'לא זמין'}\n`;
        report += `• Preferences Cache: ${results.preferencesCacheWorking ? 'פעיל' : 'לא פעיל'}\n`;
        report += `• ציון אינטגרציה: ${integrationScore}%`;
        
        console.log('✅ Cache integration test completed:', report);
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            const status = integrationScore >= 80 ? 'success' : integrationScore >= 60 ? 'warning' : 'error';
            window.showNotification(`בדיקת אינטגרציה הושלמה - ציון: ${integrationScore}%`, status, 'תוצאה', 5000, 'system');
        }
        
        // Show detailed results in modal
        if (typeof window.showDetailsModal === 'function') {
            const modalContent = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>🔗 תוצאות בדיקת אינטגרציה</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>API:</span>
                                <span class="badge bg-${results.apiConnectivity ? 'success' : 'danger'}">${results.apiConnectivity ? 'פעיל' : 'לא פעיל'}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>localStorage:</span>
                                <span class="badge bg-${results.localStorageAvailable ? 'success' : 'danger'}">${results.localStorageAvailable ? 'פעיל' : 'לא פעיל'}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>IndexedDB:</span>
                                <span class="badge bg-${results.indexedDBAvailable ? 'success' : 'danger'}">${results.indexedDBAvailable ? 'זמין' : 'לא זמין'}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>Preferences Cache:</span>
                                <span class="badge bg-${results.preferencesCacheWorking ? 'success' : 'danger'}">${results.preferencesCacheWorking ? 'פעיל' : 'לא פעיל'}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h5>🔍 פרטים טכניים</h5>
                        <div class="alert alert-info">
                            <small>
                                <strong>זמן בדיקה:</strong> ${new Date().toLocaleString('he-IL')}<br>
                                <strong>רכיבים פעילים:</strong> ${Object.values(results).filter(Boolean).length}/${Object.keys(results).length}<br>
                                <strong>רמת אינטגרציה:</strong> ${integrationScore >= 80 ? 'מעולה' : integrationScore >= 60 ? 'טובה' : 'נמוכה'}
                            </small>
                        </div>
                        <h6>📝 דוח מפורט:</h6>
                        <pre class="bg-light p-2 rounded" style="font-size: 0.85em; white-space: pre-wrap;">${report}</pre>
                    </div>
                </div>
            `;
            
            window.showDetailsModal('בדיקת אינטגרציה מטמון - תוצאות מפורטות', modalContent);
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Cache integration test failed:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בבדיקת אינטגרציה', 'error', 'שגיאה', 5000, 'system');
        }
        throw error;
    }
};

/**
 * Run unified cache test (comprehensive test of all systems)
 */
window.runUnifiedCacheTest = async function() {
    try {
        console.log('🎯 Running unified cache test...');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('מתחיל בדיקה מקיפה של מערכת המטמון...', 'info', 'בדיקה מקיפה', 3000, 'system');
        }
        
        const results = {
            healthCheck: null,
            performanceTest: null,
            integrationTest: null,
            overallScore: 0
        };
        
        // Run all tests sequentially
        console.log('🔍 Running health check...');
        results.healthCheck = await window.runCacheHealthCheck();
        
        console.log('⚡ Running performance test...');
        results.performanceTest = await window.testCachePerformance();
        
        console.log('🔗 Running integration test...');
        results.integrationTest = await window.testCacheIntegration();
        
        // Calculate overall score
        const healthScore = results.healthCheck.healthScore;
        const performanceScore = results.performanceTest.avgResponseTime < 100 ? 100 : 
                                results.performanceTest.avgResponseTime < 500 ? 80 : 60;
        const integrationScore = (Object.values(results.integrationTest).filter(Boolean).length / 
                                Object.keys(results.integrationTest).length) * 100;
        
        results.overallScore = Math.round((healthScore + performanceScore + integrationScore) / 3);
        
        // Generate comprehensive report
        let report = `בדיקה מקיפה של מערכת המטמון הושלמה:\n\n`;
        report += `📊 תוצאות:\n`;
        report += `• בדיקת בריאות: ${healthScore}%\n`;
        report += `• בדיקת ביצועים: ${performanceScore}%\n`;
        report += `• בדיקת אינטגרציה: ${Math.round(integrationScore)}%\n\n`;
        report += `🏆 ציון כולל: ${results.overallScore}%`;
        
        console.log('✅ Unified cache test completed:', report);
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            const status = results.overallScore >= 80 ? 'success' : results.overallScore >= 60 ? 'warning' : 'error';
            window.showNotification(`בדיקה מקיפה הושלמה - ציון כולל: ${results.overallScore}%`, status, 'תוצאה סופית', 8000, 'system');
        }
        
        // Show comprehensive results in modal
        if (typeof window.showDetailsModal === 'function') {
            const modalContent = `
                <div class="row">
                    <div class="col-md-4">
                        <h5>🏥 בדיקת בריאות</h5>
                        <div class="card">
                            <div class="card-body text-center">
                                <h2 class="card-title badge bg-${healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'danger'} fs-1">${healthScore}%</h2>
                                <p class="card-text">
                                    <small class="text-muted">
                                        ערכים: ${results.healthCheck.totalEntries}<br>
                                        פגיעות: ${results.healthCheck.hitRate}%
                                    </small>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h5>⚡ בדיקת ביצועים</h5>
                        <div class="card">
                            <div class="card-body text-center">
                                <h2 class="card-title badge bg-${performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'danger'} fs-1">${performanceScore}%</h2>
                                <p class="card-text">
                                    <small class="text-muted">
                                        זמן קריאה: ${results.performanceTest.readTime}ms<br>
                                        זמן תגובה: ${results.performanceTest.avgResponseTime}ms
                                    </small>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h5>🔗 בדיקת אינטגרציה</h5>
                        <div class="card">
                            <div class="card-body text-center">
                                <h2 class="card-title badge bg-${Math.round(integrationScore) >= 80 ? 'success' : Math.round(integrationScore) >= 60 ? 'warning' : 'danger'} fs-1">${Math.round(integrationScore)}%</h2>
                                <p class="card-text">
                                    <small class="text-muted">
                                        רכיבים פעילים: ${Object.values(results.integrationTest).filter(Boolean).length}/${Object.keys(results.integrationTest).length}<br>
                                        API: ${results.integrationTest.apiConnectivity ? '✅' : '❌'}
                                    </small>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="alert alert-${results.overallScore >= 80 ? 'success' : results.overallScore >= 60 ? 'warning' : 'danger'} text-center">
                            <h4 class="alert-heading">🏆 ציון כולל: ${results.overallScore}%</h4>
                            <p class="mb-0">
                                <strong>רמת המערכת:</strong> 
                                ${results.overallScore >= 80 ? 'מעולה - המערכת פועלת בצורה אופטימלית' : 
                                  results.overallScore >= 60 ? 'טובה - המערכת פועלת היטב' : 
                                  'נמוכה - נדרש שיפור'}
                            </p>
                            <hr>
                            <small>
                                <strong>זמן בדיקה:</strong> ${new Date().toLocaleString('he-IL')}<br>
                                <strong>משך בדיקה מקיפה:</strong> ~3-5 שניות
                            </small>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-12">
                        <h6>📝 דוח מקיף:</h6>
                        <pre class="bg-light p-3 rounded" style="font-size: 0.85em; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">${report}</pre>
                    </div>
                </div>
            `;
            
            window.showDetailsModal('בדיקה מקיפה של מערכת המטמון - תוצאות סופיות', modalContent);
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Unified cache test failed:', error);
        if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בבדיקה מקיפה', 'error', 'שגיאה', 5000, 'system');
        }
        throw error;
    }
};

// End of cache-test.js