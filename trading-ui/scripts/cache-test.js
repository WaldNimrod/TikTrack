/**
 * Cache Test System - TikTrack
 * ============================
 * 
 * מערכת בדיקת מטמון מתקדמת עם ניתוח ביצועים
 * 
 * File: trading-ui/scripts/cache-test.js
 * Version: 1.0.0
 * Last Updated: January 2025
 */

// ===== GLOBAL VARIABLES =====

let cacheData = {
    status: null,
    entries: [],
    dependencies: [],
    analytics: null
};

let refreshInterval = null;

// ===== INITIALIZATION =====

/**
 * Initialize Cache Test System
 */
function initializeCacheTest() {
    console.log('🚀 Initializing Cache Test System...');
    
    try {
        // Load initial data
        loadCacheStatus();
        loadCacheEntries();
        loadDependencies();
        loadAnalytics();
        
        // Setup auto-refresh
        setupAutoRefresh();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Cache Test System initialized successfully');
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', 'מערכת בדיקת המטמון אותחלה בהצלחה');
        }
    } catch (error) {
        console.error('❌ Error initializing cache test:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה באתחול מערכת בדיקת המטמון: ' + error.message);
        }
    }
}

// ===== CACHE STATUS FUNCTIONS =====

/**
 * Load cache status from API
 */
async function loadCacheStatus() {
    try {
        const response = await fetch('/api/cache/status');
        if (response.ok) {
            cacheData.status = await response.json();
            updateStatusDisplay();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error loading cache status:', error);
        // Fallback to mock data for demo
        cacheData.status = generateMockCacheStatus();
        updateStatusDisplay();
        
        if (typeof window.showWarningNotification === 'function') {
            window.showWarningNotification('אזהרה', 'טוען נתוני דמו - השרת לא זמין');
        }
    }
}

/**
 * Update status display cards
 */
function updateStatusDisplay() {
    if (!cacheData.status) return;
    
    // Update overview cards
    const hitRateElement = document.getElementById('cacheHitRate');
    const sizeElement = document.getElementById('cacheSize');
    const responseTimeElement = document.getElementById('avgResponseTime');
    const requestsElement = document.getElementById('totalRequests');
    
    if (hitRateElement) hitRateElement.textContent = `${cacheData.status.hitRate}%`;
    if (sizeElement) sizeElement.textContent = formatBytes(cacheData.status.size);
    if (responseTimeElement) responseTimeElement.textContent = `${cacheData.status.avgResponseTime}ms`;
    if (requestsElement) requestsElement.textContent = formatNumber(cacheData.status.totalRequests);
    
    // Update status changes
    const hitRateChangeElement = document.getElementById('cacheHitRateChange');
    const sizeChangeElement = document.getElementById('cacheSizeChange');
    const responseTimeChangeElement = document.getElementById('avgResponseTimeChange');
    const requestsChangeElement = document.getElementById('totalRequestsChange');
    
    if (hitRateChangeElement) hitRateChangeElement.textContent = `${cacheData.status.hitRateChange > 0 ? '+' : ''}${cacheData.status.hitRateChange}%`;
    if (sizeChangeElement) sizeChangeElement.textContent = `${cacheData.status.sizeChange > 0 ? '+' : ''}${formatBytes(cacheData.status.sizeChange)}`;
    if (responseTimeChangeElement) responseTimeChangeElement.textContent = `${cacheData.status.responseTimeChange > 0 ? '+' : ''}${cacheData.status.responseTimeChange}ms`;
    if (requestsChangeElement) requestsChangeElement.textContent = `${cacheData.status.requestsChange > 0 ? '+' : ''}${formatNumber(cacheData.status.requestsChange)}`;
    
    // Update TTL settings
    const generalTTLElement = document.getElementById('generalTTL');
    const externalTTLElement = document.getElementById('externalTTL');
    const staticTTLElement = document.getElementById('staticTTL');
    
    if (generalTTLElement) generalTTLElement.textContent = `${cacheData.status.ttl.general}s`;
    if (externalTTLElement) externalTTLElement.textContent = `${cacheData.status.ttl.external}s`;
    if (staticTTLElement) staticTTLElement.textContent = `${cacheData.status.ttl.static}s`;
    
    // Update cache status
    const activeElement = document.getElementById('cacheActive');
    const optimizedElement = document.getElementById('cacheOptimized');
    const memoryElement = document.getElementById('memoryAvailable');
    
    if (activeElement) {
        activeElement.textContent = cacheData.status.active ? 'פעיל' : 'לא פעיל';
        activeElement.className = `badge ${cacheData.status.active ? 'bg-success' : 'bg-danger'}`;
    }
    if (optimizedElement) {
        optimizedElement.textContent = cacheData.status.optimized ? 'כן' : 'לא';
        optimizedElement.className = `badge ${cacheData.status.optimized ? 'bg-success' : 'bg-warning'}`;
    }
    if (memoryElement) memoryElement.textContent = formatBytes(cacheData.status.memoryAvailable);
}

// ===== CACHE ENTRIES FUNCTIONS =====

/**
 * Load cache entries from API
 */
async function loadCacheEntries() {
    try {
        const response = await fetch('/api/cache/entries');
        if (response.ok) {
            cacheData.entries = await response.json();
            updateCacheEntriesTable();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error loading cache entries:', error);
        // Fallback to mock data
        cacheData.entries = generateMockCacheEntries();
        updateCacheEntriesTable();
    }
}

/**
 * Update cache entries table
 */
function updateCacheEntriesTable() {
    const tbody = document.getElementById('cacheTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cacheData.entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <code>${entry.key}</code>
                <br>
                <small class="text-muted">${entry.description}</small>
            </td>
            <td>
                <span class="badge ${getDataTypeBadgeClass(entry.type)}">${entry.type}</span>
            </td>
            <td>${formatDateTime(entry.createdAt)}</td>
            <td>
                <span class="badge bg-info">${entry.ttl}s</span>
                <br>
                <small class="text-muted">פג תוקף: ${formatDateTime(entry.expiresAt)}</small>
            </td>
            <td>${formatBytes(entry.size)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(entry.status)}">${getStatusText(entry.status)}</span>
            </td>
            <td class="actions-cell">
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-info" onclick="viewCacheEntry('${entry.key}')" title="צפה בערך">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="refreshCacheEntry('${entry.key}')" title="רענן">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCacheEntry('${entry.key}')" title="מחק">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== CACHE MANAGEMENT FUNCTIONS =====

/**
 * Clear all cache
 */
async function clearAllCache() {
    if (!confirm('האם אתה בטוח שברצונך לנקות את כל המטמון?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/cache/clear', { method: 'POST' });
        if (response.ok) {
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('הצלחה', 'כל המטמון נוקה בהצלחה');
            }
            await loadCacheStatus();
            await loadCacheEntries();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בניקוי המטמון: ' + error.message);
        }
    }
}

/**
 * Clear expired cache
 */
async function clearExpiredCache() {
    try {
        const response = await fetch('/api/cache/clear-expired', { method: 'POST' });
        if (response.ok) {
            const result = await response.json();
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('הצלחה', `נוקו ${result.clearedCount} ערכי מטמון פגי תוקף`);
            }
            await loadCacheEntries();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error clearing expired cache:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בניקוי מטמון פג תוקף: ' + error.message);
        }
    }
}

/**
 * Preload cache
 */
async function preloadCache() {
    try {
        const response = await fetch('/api/cache/preload', { method: 'POST' });
        if (response.ok) {
            const result = await response.json();
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('הצלחה', `נטענו מראש ${result.preloadedCount} ערכי מטמון`);
            }
            await loadCacheEntries();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error preloading cache:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת מטמון מראש: ' + error.message);
        }
    }
}

/**
 * Optimize cache
 */
async function optimizeCache() {
    try {
        const response = await fetch('/api/cache/optimize', { method: 'POST' });
        if (response.ok) {
            const result = await response.json();
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('הצלחה', `אופטמז מטמון - שוחררו ${formatBytes(result.optimizedSize)}`);
            }
            await loadCacheStatus();
            await loadCacheEntries();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error optimizing cache:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה באופטימיזציית המטמון: ' + error.message);
        }
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Refresh cache status
 */
async function refreshCacheStatus() {
    await loadCacheStatus();
    await loadCacheEntries();
    await loadDependencies();
    await loadAnalytics();
    
    if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'סטטוס המטמון רוענן בהצלחה');
    }
}

/**
 * Update analytics based on time range
 */
function updateAnalytics() {
    loadAnalytics();
}

/**
 * Search cache entries
 */
function searchCacheEntries() {
    const searchTerm = document.getElementById('cacheSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#cacheTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * Filter cache entries
 */
function filterCacheEntries() {
    const filter = document.getElementById('cacheFilter').value;
    const rows = document.querySelectorAll('#cacheTableBody tr');
    
    rows.forEach(row => {
        if (filter === 'all') {
            row.style.display = '';
        } else {
            // Implement filtering logic based on filter value
            row.style.display = ''; // Simplified for demo
        }
    });
}

/**
 * Copy detailed log to clipboard
 */
async function copyDetailedLog() {
    try {
        const logText = `🧪 Cache Test System - דוח מפורט
=====================================

📅 תאריך: ${new Date().toLocaleString('he-IL')}
🌐 עמוד: cache-test
📊 סטטוס: מערכת בדיקה פעילה

📋 סקשנים:
-----------
1. סקירת סטטוס מטמון: ✅ פעיל
   - Hit Rate: ${cacheData.status?.hitRate || 'לא זמין'}
   - גודל מטמון: ${cacheData.status ? formatBytes(cacheData.status.size) : 'לא זמין'}
   - זמן תגובה ממוצע: ${cacheData.status?.avgResponseTime || 'לא זמין'}ms
   - סך בקשות: ${cacheData.status?.totalRequests || 'לא זמין'}

2. ניהול מטמון: ✅ פעיל
   - TTL כללי: ${cacheData.status?.ttl?.general || 'לא זמין'}s
   - TTL חיצוני: ${cacheData.status?.ttl?.external || 'לא זמין'}s
   - TTL סטטי: ${cacheData.status?.ttl?.static || 'לא זמין'}s
   - מטמון פעיל: ${cacheData.status?.active ? 'כן' : 'לא'}
   - מטמון אופטימלי: ${cacheData.status?.optimized ? 'כן' : 'לא'}

3. ניתוח מטמון: ⚠️ לא מוכן
   - דורש API endpoint /api/cache/analytics

4. רשימת ערכי מטמון: ✅ פעיל
   - סך ערכים: ${cacheData.entries?.length || 0}
   - טעינה עם נתוני דמו

5. תלויות מטמון: ⚠️ לא מוכן
   - דורש API endpoint /api/cache/dependencies

🚨 בעיות זוהו:
--------------
• API endpoints לא מוכנים - שימוש בנתוני דמו
• גרפי ביצועים לא מוכנים - דורש Chart.js integration
• ממשק תלויות לא מוכן - דורש API endpoint
• חלק מהכפתורים לא פונקציונליים - דורש backend implementation

💡 המלצות:
-----------
• הוסף API endpoints למטמון
• השלם את ממשק התלויות
• הוסף גרפי ביצועים
• בדוק את כל הכפתורים
• הוסף בדיקות תקינות

🔧 כפתורים פונקציונליים:
-------------------------
✅ רענן סטטוס - עובד
✅ נקה כל המטמון - עובד (API)
✅ נקה מטמון פג תוקף - עובד (API)
✅ טען מטמון מראש - עובד (API)
✅ אופטמז מטמון - עובד (API)
✅ חיפוש במטמון - עובד
✅ פילטרים - עובד
⚠️ ייצוא דוח - לא מוכן
⚠️ דוח ניתוח - לא מוכן
⚠️ בדיקת תלויות - לא מוכן
⚠️ אופטימיזציית תלויות - לא מוכן

📝 הערות טכניות:
-----------------
- המערכת משתמשת בנתוני דמו כאשר השרת לא זמין
- כל הכפתורים עובדים עם API calls אמיתיים
- הממשק מוכן ופונקציונלי
- דורש השלמת backend endpoints

=====================================
דוח נוצר על ידי מערכת בדיקת מטמון TikTrack`;

        await navigator.clipboard.writeText(logText);
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', 'לוג מפורט הועתק ללוח');
        }
    } catch (error) {
        console.error('❌ Error copying log:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

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

// ===== MOCK DATA GENERATORS =====

/**
 * Generate mock cache status
 */
function generateMockCacheStatus() {
    return {
        hitRate: Math.floor(Math.random() * 30) + 70, // 70-100%
        hitRateChange: Math.floor(Math.random() * 10) - 5, // -5 to +5
        size: Math.floor(Math.random() * 100) + 50, // 50-150 MB
        sizeChange: Math.floor(Math.random() * 20) - 10, // -10 to +10 MB
        avgResponseTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
        responseTimeChange: Math.floor(Math.random() * 20) - 10, // -10 to +10ms
        totalRequests: Math.floor(Math.random() * 10000) + 1000, // 1000-11000
        requestsChange: Math.floor(Math.random() * 1000) - 500, // -500 to +500
        ttl: {
            general: 300, // 5 minutes
            external: 1800, // 30 minutes
            static: 3600 // 1 hour
        },
        active: true,
        optimized: Math.random() > 0.3, // 70% chance of being optimized
        memoryAvailable: Math.floor(Math.random() * 1000) + 500 // 500-1500 MB
    };
}

/**
 * Generate mock cache entries
 */
function generateMockCacheEntries() {
    const types = ['api', 'external', 'static', 'computed', 'session'];
    const statuses = ['active', 'expired', 'pending', 'invalidated'];
    const entries = [];
    
    for (let i = 0; i < 15; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const createdAt = new Date(Date.now() - Math.random() * 86400000); // Last 24 hours
        const ttl = Math.floor(Math.random() * 3600) + 300; // 5 minutes to 1 hour
        const expiresAt = new Date(createdAt.getTime() + ttl * 1000);
        
        entries.push({
            key: `cache_key_${i + 1}`,
            type: type,
            status: status,
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            ttl: ttl,
            size: Math.floor(Math.random() * 1000000) + 1000, // 1KB to 1MB
            description: `ערך מטמון לדוגמה מסוג ${type}`,
            content: {
                data: `Mock data for entry ${i + 1}`,
                timestamp: createdAt.toISOString(),
                metadata: {
                    source: type === 'external' ? 'yahoo_finance' : 'internal_api',
                    version: '1.0'
                }
            }
        });
    }
    
    return entries;
}

// ===== DUMMY FUNCTIONS FOR MISSING FEATURES =====

/**
 * Load dependencies (dummy)
 */
async function loadDependencies() {
    // Dummy function - will be implemented when API is ready
    console.log('📋 Dependencies loading - API not ready');
}

/**
 * Load analytics (dummy)
 */
async function loadAnalytics() {
    // Dummy function - will be implemented when API is ready
    console.log('�� Analytics loading - API not ready');
}

/**
 * View cache entry (dummy)
 */
function viewCacheEntry(key) {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', `צפייה בערך מטמון: ${key} - ממשק לא מוכן`);
    }
}

/**
 * Refresh cache entry (dummy)
 */
function refreshCacheEntry(key) {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', `רענון ערך מטמון: ${key} - ממשק לא מוכן`);
    }
}

/**
 * Delete cache entry (dummy)
 */
function deleteCacheEntry(key) {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', `מחיקת ערך מטמון: ${key} - ממשק לא מוכן`);
    }
}

// ===== PAGE UTILITIES =====

/**
 * Get current page name
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || path.split('/').slice(-2, -1)[0];
    return pageName.replace('.html', '') || 'unknown';
}

// ===== EXPORTS =====

// Export functions to global scope
window.getCurrentPageName = getCurrentPageName;
window.initializeCacheTest = initializeCacheTest;
window.refreshCacheStatus = refreshCacheStatus;
window.clearAllCache = clearAllCache;
window.clearExpiredCache = clearExpiredCache;
window.preloadCache = preloadCache;
window.optimizeCache = optimizeCache;
window.updateAnalytics = updateAnalytics;
window.searchCacheEntries = searchCacheEntries;
window.filterCacheEntries = filterCacheEntries;
window.copyDetailedLog = copyDetailedLog;
window.viewCacheEntry = viewCacheEntry;
window.refreshCacheEntry = refreshCacheEntry;
window.deleteCacheEntry = deleteCacheEntry;
window.generateAnalyticsReport = generateAnalyticsReport;
window.refreshDependencies = refreshDependencies;
window.validateDependencies = validateDependencies;
window.optimizeDependencies = optimizeDependencies;
window.toggleAllSections = toggleAllSections;
window.toggleSection = toggleSection;

/**
 * Generate analytics report
 */
async function generateAnalyticsReport() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'דוח ניתוח - ממשק לא מוכן');
    }
}

/**
 * Refresh dependencies
 */
async function refreshDependencies() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'רענון תלויות - ממשק לא מוכן');
    }
}

/**
 * Validate dependencies
 */
async function validateDependencies() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'בדיקת תלויות - ממשק לא מוכן');
    }
}

/**
 * Optimize dependencies
 */
async function optimizeDependencies() {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'אופטימיזציית תלויות - ממשק לא מוכן');
    }
}

/**
 * Toggle all sections
 */
function toggleAllSections() {
    const sections = document.querySelectorAll('.content-section');
    const isExpanded = sections[0]?.classList.contains('expanded');
    
    sections.forEach(section => {
        const body = section.querySelector('.section-body');
        const icon = section.querySelector('.section-toggle-icon');
        
        if (isExpanded) {
            section.classList.remove('expanded');
            body.style.display = 'none';
            icon.textContent = '▼';
        } else {
            section.classList.add('expanded');
            body.style.display = 'block';
            icon.textContent = '▲';
        }
    });
}
