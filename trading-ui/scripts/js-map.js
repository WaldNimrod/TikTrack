/**
 * JS-Map System - Clean Implementation
 * ====================================
 * 
 * Clean, minimal implementation that integrates with existing global systems
 * Uses page-scripts-matrix, data-utils, ui-utils, and other global systems
 * 
 * @version 3.0
 * @author TikTrack Development Team
 * @lastUpdated January 21, 2025
 */

console.log('🚀 JS-Map System - Clean Implementation loaded');

// ========================================
// JS-Map System Class
// ========================================

class JsMapSystem {
    constructor() {
        this.functionsData = null;
        this.pageMapping = null;
        this.systemStats = null;
        this.isInitialized = false;
        this.indexedDB = null;
        this.cacheEnabled = true;
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.pageScriptsMatrix = null;
        this.dependencyGraph = null;
        this.architectureAnalysis = null;
        
        console.log('📊 JS-Map System constructor called');
    }

    /**
     * Initialize the JS-Map system
     * מאתחל את מערכת JS-Map
     */
    async init() {
        if (this.isInitialized) {
            console.log('⚠️ JS-Map System already initialized');
            return;
        }

        console.log('🚀 Initializing JS-Map System...');
        
        try {
            // Initialize IndexedDB first
            await this.initializeIndexedDB();
            
            // Initialize Page Scripts Matrix integration
            await this.initializePageScriptsMatrix();
            
            // Load fresh data from APIs
            console.log('🌐 Loading fresh data from APIs...');
            await this.loadDataFromAPIs(true); // Show notification on initial load
            
            // Skip advanced analysis for now
            console.log('⚠️ Advanced analysis skipped - focusing on basic functionality');
            
            // Initialize UI components
            console.log('🎨 Initializing UI components...');
            this.initializeUIComponents();
            
            // Render all sections after data is loaded
            console.log('🎨 Rendering all sections...');
            this.renderAllSections();
            
            // Update dashboard stats after rendering with a small delay
            setTimeout(() => {
                console.log('📊 Updating dashboard stats...');
            this.updateDashboardStats();
            }, 100);
            
            // Skip system status update for now
            console.log('⚠️ System status update skipped - focusing on basic functionality');
            
            this.isInitialized = true;
            console.log('✅ JS-Map System initialized successfully');
            
            // Update system statistics in UI
            setTimeout(() => {
                this.updateSystemStats();
            }, 200);
            
        } catch (error) {
            console.error('❌ Failed to initialize JS-Map System:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה באתחול מערכת JS-Map', error.message);
            }
        }
    }

    /**
     * Load data from APIs using existing global systems
     * טוען נתונים מה-APIs באמצעות מערכות כלליות קיימות
     */
    async loadDataFromAPIs(showNotification = false) {
        console.log('🔄 Loading data from APIs...');
        
        try {
            console.log('📡 Using direct fetch for API requests');
                
                // Load functions data
            const functionsData = await window.apiCall('/api/file-scanner/functions');
            this.functionsData = functionsData.data || functionsData;
                console.log('✅ Functions data loaded:', Object.keys(this.functionsData || {}));
                console.log('📊 Functions data sample:', JSON.stringify(this.functionsData, null, 2).substring(0, 200) + '...');
                
                // Load page mapping data
            const mappingData = await window.apiCall('/api/file-scanner/page-mapping');
            this.pageMapping = mappingData.data || mappingData;
                console.log('✅ Page mapping data loaded:', Object.keys(this.pageMapping || {}));
                console.log('📊 Page mapping sample:', JSON.stringify(this.pageMapping, null, 2).substring(0, 200) + '...');
            
            // Show success notification for API data only when requested
            if (showNotification && window.showSuccessNotification) {
                window.showSuccessNotification('הצלחה', 'נתונים נטענו מהשרת בהצלחה');
            }
            
        } catch (error) {
            console.error('❌ Failed to load data from APIs:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', `שגיאה בטעינת נתונים: ${error.message}`);
            }
            
            // Use fallback data for development
            this.loadFallbackData();
        }
    }

    /**
     * Fallback data loading using direct fetch
     * טעינת נתונים חלופית באמצעות fetch ישיר
     */
    async loadDataWithFallback() {
        console.log('🔄 Using direct fetch as fallback...');
        
        try {
            const [functionsData, mappingData] = await Promise.all([
                window.apiCall('/api/file-scanner/functions'),
                window.apiCall('/api/file-scanner/page-mapping')
            ]);

                this.functionsData = functionsData.data || functionsData;
            console.log('✅ Functions data loaded via apiCall:', Object.keys(this.functionsData || {}));

                this.pageMapping = mappingData.data || mappingData;
            console.log('✅ Page mapping data loaded via apiCall:', Object.keys(this.pageMapping || {}));

            // No notification here - fallback is silent

        } catch (error) {
            console.error('❌ Fallback fetch failed:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', `שגיאה בטעינת נתונים (fallback): ${error.message}`);
            }
            this.loadFallbackData();
        }
    }

    /**
     * Load fallback data for development
     * טוען נתוני חלופית לפיתוח
     */
    loadFallbackData() {
        console.log('🔄 Loading fallback data for development...');
        
        this.functionsData = {
            'main.js': {
                functions: [
                    { name: 'initializeCurrentPage', line: 10, description: 'Initialize current page' },
                    { name: 'showNotification', line: 50, description: 'Show notification' },
                    { name: 'formatDate', line: 75, description: 'Format date string' }
                ]
            },
            'ui-utils.js': {
                functions: [
                    { name: 'createModal', line: 5, description: 'Create modal dialog' },
                    { name: 'formatDate', line: 25, description: 'Format date string' },
                    { name: 'colorAmount', line: 45, description: 'Color amount based on value' }
                ]
            },
            'data-utils.js': {
                functions: [
                    { name: 'apiCall', line: 15, description: 'Make API call' },
                    { name: 'formatCurrency', line: 35, description: 'Format currency value' }
                ]
            }
        };

        this.pageMapping = {
            'trading_accounts.html': ['main.js', 'ui-utils.js', 'data-utils.js'],
            'trades.html': ['main.js', 'data-utils.js'],
            'alerts.html': ['main.js', 'ui-utils.js'],
            'js-map.html': ['main.js', 'ui-utils.js', 'js-map.js']
        };

        console.log('✅ Fallback data loaded with', Object.keys(this.functionsData).length, 'files and', Object.keys(this.pageMapping).length, 'pages');
        // No notification for fallback data - it's expected in development
    }

    /**
     * Initialize UI components
     * מאתחל רכיבי ממשק המשתמש
     */
    initializeUIComponents() {
        console.log('🎨 Initializing UI components...');
        
        // Don't render here - it's already called in init()
        // this.renderAllSections();
        
        
        // Skip development sections initialization for now
        console.log('⚠️ Development sections initialization skipped - focusing on basic functionality');
    }

    /**
     * Render all sections with loaded data
     * מציג את כל הסקשנים עם הנתונים שנטענו
     */
    renderAllSections() {
        console.log('🎨 Rendering all sections...');
        console.log('📊 Available data - functionsData:', !!this.functionsData, 'pageMapping:', !!this.pageMapping);
        
        try {
            console.log('🎨 Rendering system stats...');
        this.renderSystemStats();
            
            console.log('🎨 Rendering page mapping...');
            this.renderPageMappingData();
            
            console.log('🎨 Rendering dependencies...');
            this.renderDependenciesData();
            
            console.log('🎨 Rendering functions...');
        this.renderFunctionsData();
        
            console.log('🎨 Rendering duplicates...');
            this.renderDuplicatesData();
            
            console.log('✅ All sections rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering sections:', error);
        }
    }

    renderStatistics() {
        console.log('📊 Rendering statistics...');
        this.updateDashboardStats();
    }

    renderFunctions() {
        console.log('⚙️ Rendering functions...');
        this.renderFunctionsData();
    }

    renderPageMapping() {
        console.log('🗺️ Rendering page mapping...');
        this.renderPageMappingData();
    }

    renderDependencies() {
        console.log('🔗 Rendering dependencies...');
        this.renderDependenciesData();
    }

    renderAnalysis() {
        console.log('🔍 Rendering analysis...');
        this.renderDuplicatesData();
    }


    /**
     * Render future features
     * מציג פיצ'רים עתידיים
     */
    renderFutureFeatures() {
        console.log('🚧 Rendering future features...');
        // This is handled by the HTML content
    }

    refreshStatistics() {
        console.log('🔄 Refreshing statistics...');
        this.loadDataFromAPIs();
    }

    refreshFunctions() {
        console.log('🔄 Refreshing functions...');
        this.loadDataFromAPIs();
    }

    refreshPages() {
        console.log('🔄 Refreshing pages...');
        this.loadDataFromAPIs();
    }

    refreshDependencies() {
        console.log('🔄 Refreshing dependencies...');
        this.loadDataFromAPIs();
    }

    refreshAnalysis() {
        console.log('🔄 Refreshing analysis...');
        this.loadDataFromAPIs();
    }

    exportAnalysis() {
        console.log('📊 Exporting analysis...');
        if (window.exportToCSV) {
            window.exportToCSV();
        } else {
            console.error('❌ exportToCSV function not available');
        }
    }

    /**
     * Update system statistics in the UI
     * מעדכן את הסטטיסטיקות של המערכת בממשק
     */
    updateSystemStats(isManual = false) {
        console.log('📊 Updating system statistics...');
        
        try {
            // Get system data
            const pagesCount = this.pageMapping ? Object.keys(this.pageMapping).length : 0;
            const functionsCount = this.functionsData ? Object.keys(this.functionsData).length : 0;
            const jsFilesCount = this.functionsData ? new Set(Object.values(this.functionsData).map(f => f.file)).size : 0;
            
            // Calculate global functions (functions that appear in multiple files)
            const globalFunctions = this.calculateGlobalFunctions();
            
            // Calculate duplicates
            const duplicates = this.calculateDuplicates();
            
            // Calculate local functions (functions that appear in only one file)
            const localFunctions = functionsCount - globalFunctions;
            
            // Update UI elements
            this.updateStatCard('systemTotalPages', pagesCount);
            this.updateStatCard('systemTotalJsFiles', jsFilesCount);
            this.updateStatCard('systemTotalFunctions', functionsCount);
            this.updateStatCard('systemGlobalFunctions', globalFunctions);
            this.updateStatCard('systemDuplicates', duplicates);
            this.updateStatCard('systemLocalFunctions', localFunctions);
            
            console.log('✅ System statistics updated successfully');
            console.log(`📊 Stats: ${pagesCount} pages, ${jsFilesCount} JS files, ${functionsCount} functions, ${globalFunctions} global, ${duplicates} duplicates, ${localFunctions} local`);
            
            // Show success notification only when called manually
            if (isManual) {
                if (window.showNotification) {
                    window.showNotification('סטטיסטיקות מערכת עודכנו בהצלחה', 'success', 'הצלחה', 2000, 'system');
                }
            }
            
        } catch (error) {
            console.error('❌ Error updating system statistics:', error);
        }
    }
    
    /**
     * Update a single stat card
     * מעדכן כרטיס סטטיסטיקה יחיד
     */
    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toString();
        } else {
            console.warn(`⚠️ Stat card element not found: ${elementId}`);
        }
    }
    
    /**
     * Calculate global functions (appear in multiple files)
     * מחשב פונקציות גלובליות (מופיעות במספר קבצים)
     */
    calculateGlobalFunctions() {
        if (!this.functionsData) return 0;
        
        const functionFiles = {};
        Object.values(this.functionsData).forEach(func => {
            if (!functionFiles[func.name]) {
                functionFiles[func.name] = new Set();
            }
            functionFiles[func.name].add(func.file);
        });
        
        return Object.values(functionFiles).filter(files => files.size > 1).length;
    }
    
    /**
     * Calculate duplicate functions
     * מחשב פונקציות כפולות
     */
    calculateDuplicates() {
        if (!this.functionsData) return 0;
        
        const functionCounts = {};
        Object.values(this.functionsData).forEach(func => {
            functionCounts[func.name] = (functionCounts[func.name] || 0) + 1;
        });
        
        return Object.values(functionCounts).filter(count => count > 1).length;
    }

    /**
     * Refresh system status
     * רענון מצב מערכת
     */
    async refreshSystemStatus() {
        console.log('🔄 Refreshing system status...');
        await this.updateSystemStatus();
        this.addRecentAction('רענון מצב מערכת');
    }

    /**
     * Export system status
     * ייצוא מצב מערכת
     */
    exportSystemStatus() {
        console.log('📤 Exporting system status...');
        const systemStatus = this.getSystemStatus();
        const blob = new Blob([JSON.stringify(systemStatus, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `js-map-system-status-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.addRecentAction('ייצוא מצב מערכת');
    }

    /**
     * Test system connectivity
     * בדיקת חיבור מערכת
     */
    async testSystemConnectivity() {
        console.log('🌐 Testing system connectivity...');
        try {
            const startTime = Date.now();
            const response = await window.apiCall('/api/file-scanner/functions');
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            this.addRecentAction(`בדיקת חיבור - ${responseTime}ms`);
        } catch (error) {
            console.error('❌ Connectivity test failed:', error);
            this.addRecentAction('בדיקת חיבור נכשלה');
        }
    }

    /**
     * Clear system cache
     * ניקוי מטמון מערכת
     */
    async clearSystemCache() {
        console.log('🗑️ Clearing system cache...');
        try {
            // Clear JS-Map localStorage
            const keys = Object.keys(localStorage);
            let clearedCount = 0;
            
            for (const key of keys) {
                if (key.startsWith('jsMap') || key.startsWith('js-map')) {
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        await window.UnifiedCacheManager.remove(key, { layer: 'localStorage' });
                    } else {
                        localStorage.removeItem(key); // fallback
                    }
                    clearedCount++;
                }
            }
            
            console.log(`✅ Cleared ${clearedCount} JS-Map cache entries`);
            
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`מטמון מערכת נוקה בהצלחה (${clearedCount} פריטים)`, 'success', 'הצלחה', 3000, 'system');
            }
            
            this.addRecentAction('ניקוי מטמון');
            this.updateSystemStatus();
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה בניקוי מטמון מערכת: ' + error.message, 'error', 'שגיאה', 5000, 'system');
            }
        }
    }

    /**
     * Reload system data
     * טעינה מחדש של נתוני מערכת
     */
    async reloadSystemData() {
        console.log('🔄 Reloading system data...');
        try {
            await this.loadDataFromAPIs();
            this.updateSystemStatus();
            this.addRecentAction('טעינה מחדש של נתונים');
        } catch (error) {
            console.error('❌ Failed to reload data:', error);
        }
    }

    /**
     * Show system diagnostics
     * הצגת אבחון מערכת
     */
    showSystemDiagnostics() {
        console.log('🔍 Showing system diagnostics...');
        const diagnostics = this.getSystemDiagnostics();
        
        // Create modal for diagnostics
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🔍 אבחון מערכת JS-Map</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <pre style="white-space: pre-wrap; font-size: 12px;">${JSON.stringify(diagnostics, null, 2)}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                        <button type="button" class="btn btn-primary" onclick="copyDiagnostics()">העתק</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Clean up when modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
        
        // Copy function
        window.copyDiagnostics = () => {
            navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
        };
        
        this.addRecentAction('הצגת אבחון מערכת');
    }

    /**
     * Update system status display
     * עדכון תצוגת מצב מערכת
     */
    async updateSystemStatus() {
        const status = await this.getSystemStatus();
        
        // Update status values
        const systemInitialized = document.getElementById('systemInitialized');
        const jsFilesLoaded = document.getElementById('jsFilesLoaded');
        const pagesMapped = document.getElementById('pagesMapped');
        const functionsDetected = document.getElementById('functionsDetected');
        
        if (systemInitialized) systemInitialized.textContent = status.system.initialized ? 'כן' : 'לא';
        if (jsFilesLoaded) jsFilesLoaded.textContent = status.data.jsFiles ? 'כן' : 'לא';
        if (pagesMapped) pagesMapped.textContent = status.data.pages ? 'כן' : 'לא';
        if (functionsDetected) functionsDetected.textContent = status.data.functions ? 'כן' : 'לא';
        
        // Update system info
        const currentUrl = document.getElementById('currentUrl');
        const loadTime = document.getElementById('loadTime');
        const userAgent = document.getElementById('userAgent');
        const currentTime = document.getElementById('currentTime');
        
        if (currentUrl) currentUrl.textContent = status.system.url;
        if (loadTime) loadTime.textContent = status.system.loadTime;
        if (userAgent) userAgent.textContent = status.system.userAgent.substring(0, 50) + '...';
        if (currentTime) currentTime.textContent = window.formatDateTime(new Date());
        
        // Update data status
        const functionsFilesCount = document.getElementById('functionsFilesCount');
        const functionsFilesPreview = document.getElementById('functionsFilesPreview');
        const pagesCount = document.getElementById('pagesCount');
        const pagesPreview = document.getElementById('pagesPreview');
        const localStorageStatus = document.getElementById('localStorageStatus');
        const localStoragePreview = document.getElementById('localStoragePreview');
        
        if (functionsFilesCount) functionsFilesCount.textContent = status.data.functionsCount || 0;
        if (functionsFilesPreview) functionsFilesPreview.textContent = status.data.functionsFiles?.slice(0, 3).join(', ') + '...' || 'אין נתונים';
        if (pagesCount) pagesCount.textContent = status.data.pagesCount || 0;
        if (pagesPreview) pagesPreview.textContent = status.data.pages?.slice(0, 3).join(', ') + '...' || 'אין נתונים';
        if (localStorageStatus) localStorageStatus.textContent = status.storage.hasData ? 'יש נתונים' : 'אין נתונים';
        if (localStoragePreview) localStoragePreview.textContent = status.storage.keys?.join(', ') || 'אין מפתחות';
    }

    /**
     * Get system status
     * קבלת מצב מערכת
     */
    async getSystemStatus() {
        const startTime = performance.timing?.loadEventEnd || Date.now();
        const loadTime = startTime - (performance.timing?.navigationStart || 0);
        
        return {
            system: {
                initialized: !!window.jsMapSystem,
                url: window.location.href,
                userAgent: navigator.userAgent,
                loadTime: `${loadTime}ms`,
                timestamp: new Date().toISOString()
            },
            data: {
                jsFiles: !!this.functionsData,
                pages: !!this.pageMappingData,
                functions: !!this.functionsData,
                functionsCount: this.functionsData ? Object.keys(this.functionsData).length : 0,
                functionsFiles: this.functionsData ? Object.keys(this.functionsData).slice(0, 10) : [],
                pagesCount: this.pageMappingData ? Object.keys(this.pageMappingData).length : 0,
                pages: this.pageMappingData ? Object.keys(this.pageMappingData).slice(0, 10) : []
            },
            storage: {
                hasData: this.checkLocalStorageData(),
                keys: this.getLocalStorageKeys()
            }
        };
    }

    /**
     * Check if localStorage data exists
     * בדיקת קיום נתוני localStorage
     */
    checkLocalStorageData() {
        try {
            const keys = Object.keys(localStorage);
            return keys.some(key => key.startsWith('jsMap') || key.startsWith('js-map'));
        } catch (error) {
            console.warn('Error checking localStorage data:', error);
            return false;
        }
    }

    /**
     * Get localStorage keys
     * קבלת מפתחות localStorage
     */
    getLocalStorageKeys() {
        try {
            const keys = Object.keys(localStorage);
            return keys.filter(key => key.startsWith('jsMap') || key.startsWith('js-map'));
        } catch (error) {
            console.warn('Error getting localStorage keys:', error);
            return [];
        }
    }

    /**
     * Check if localStorage key exists
     * בדיקת קיום מפתח localStorage
     */
    async checkLocalStorageKeyExists(key) {
        try {
            let value = null;
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                value = await window.UnifiedCacheManager.get(key);
            } else {
                value = localStorage.getItem(key); // fallback
            }
            return value !== null ? 'קיים' : 'לא קיים';
        } catch (error) {
            console.warn(`Error checking localStorage key ${key}:`, error);
            return 'לא זמין';
        }
    }

    /**
     * Get system diagnostics
     * קבלת אבחון מערכת
     */
    async getSystemDiagnostics() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            systemStatus: await this.getSystemStatus(),
            performance: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                } : 'לא זמין',
                timing: performance.timing ? {
                    navigationStart: performance.timing.navigationStart,
                    loadEventEnd: performance.timing.loadEventEnd,
                    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
                } : 'לא זמין'
            },
            localStorage: {
                keys: this.getLocalStorageKeys(),
                jsMapKeys: this.getLocalStorageKeys()
            },
            windowObjects: {
                jsMapSystem: !!window.jsMapSystem,
                JsMapSystem: !!window.JsMapSystem
            }
        };
    }

    /**
     * Add recent action
     * הוספת פעולה אחרונה
     */
    addRecentAction(action) {
        const actionsLog = document.getElementById('recentActions');
        if (!actionsLog) return;
        
        const now = new Date();
        const timeStr = window.formatTimeOnly(now);
        
        const actionItem = document.createElement('div');
        actionItem.className = 'action-item';
        actionItem.innerHTML = `
            <span class="action-time">${timeStr}</span>
            <span class="action-text">${action}</span>
        `;
        
        actionsLog.insertBefore(actionItem, actionsLog.firstChild);
        
        // Keep only last 10 actions
        while (actionsLog.children.length > 10) {
            actionsLog.removeChild(actionsLog.lastChild);
        }
    }

    async analyzeDuplicates() {
        console.log('🔍 Starting duplicates analysis...');
        try {
            const result = await window.apiCall('/api/file-scanner/duplicates');
            
            if (result.status === 'success') {
                console.log('✅ Duplicates analysis completed:', result.data);
                
                // Update UI with results
                this.updateDuplicatesContent(result.data);
                
                return result.data;
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('❌ Failed to analyze duplicates:', error);
        }
    }

    async detectLocalFunctions() {
        console.log('🏠 Starting local functions detection...');
        try {
            const result = await window.apiCall('/api/file-scanner/local-functions');
            
            if (result.status === 'success') {
                console.log('✅ Local functions detection completed:', result.data);
                
                // Update UI with results
                this.updateLocalFunctionsContent(result.data);
                
                return result.data;
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('❌ Failed to detect local functions:', error);
        }
    }

    updateDuplicatesContent(result) {
        const container = document.getElementById('duplicatesContent');
        if (!container) return;

        if (result && result.potential_duplicates && result.potential_duplicates.length > 0) {
            let html = '<div class="duplicates-results">';
            html += `<h4>🔍 נמצאו ${result.potential_duplicates.length} כפילויות פוטנציאליות</h4>`;
            
            // Show first 10 duplicates
            const duplicatesToShow = result.potential_duplicates.slice(0, 10);
            
            duplicatesToShow.forEach((dup, index) => {
                html += `
                    <div class="duplicate-item">
                        <h5>${index + 1}. ${dup.function1} ↔ ${dup.function2}</h5>
                        <p><strong>קבצים 1:</strong> ${dup.files1.join(', ')}</p>
                        <p><strong>קבצים 2:</strong> ${dup.files2.join(', ')}</p>
                        <p><strong>דמיון:</strong> ${Math.round(dup.similarity_score * 100)}%</p>
                        <p><strong>סוג:</strong> ${dup.duplicate_type}</p>
                    </div>
                `;
            });
            
            if (result.potential_duplicates.length > 10) {
                html += `<p class="more-results">... ועוד ${result.potential_duplicates.length - 10} כפילויות</p>`;
            }
            
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="no-results">✅ לא נמצאו כפילויות</div>';
        }
    }

    updateLocalFunctionsContent(result) {
        const container = document.getElementById('localFunctionsContent');
        if (!container) {
            // Create container if it doesn't exist
            const duplicatesContainer = document.getElementById('duplicatesContent');
            if (duplicatesContainer && duplicatesContainer.parentNode) {
                const newContainer = document.createElement('div');
                newContainer.id = 'localFunctionsContent';
                newContainer.className = 'local-functions-results';
                duplicatesContainer.parentNode.appendChild(newContainer);
            }
        }

        if (result && result.data) {
            let html = '<div class="local-functions-results">';
            html += `<h4>🏠 ניתוח פונקציות מקומיות</h4>`;
            
            let totalIssues = 0;
            let filesWithIssues = 0;
            
            // Count total issues and files
            Object.values(result.data).forEach(fileData => {
                if (fileData.local_functions && fileData.local_functions.length > 0) {
                    totalIssues += fileData.local_functions.length;
                    filesWithIssues++;
                }
            });
            
            html += `<p><strong>סה"כ בעיות:</strong> ${totalIssues} פונקציות מקומיות ב-${filesWithIssues} קבצים</p>`;
            
            // Show first 10 files with issues
            const filesToShow = Object.entries(result.data)
                .filter(([_, fileData]) => fileData.local_functions && fileData.local_functions.length > 0)
                .slice(0, 10);
            
            filesToShow.forEach(([fileName, fileData]) => {
                html += `<div class="file-section">`;
                html += `<h5>📄 ${fileName}</h5>`;
                html += `<p><strong>בעיות:</strong> ${fileData.local_functions.length}</p>`;
                
                // Show first 5 functions from this file
                const functionsToShow = fileData.local_functions.slice(0, 5);
                functionsToShow.forEach(func => {
                    html += `
                        <div class="local-function-item">
                            <p><strong>${func.name}</strong> (שורה ${func.line}) - ${func.reason}</p>
                        </div>
                    `;
                });
                
                if (fileData.local_functions.length > 5) {
                    html += `<p class="more-functions">... ועוד ${fileData.local_functions.length - 5} פונקציות</p>`;
                }
                
                html += `</div>`;
            });
            
            if (filesWithIssues > 10) {
                html += `<p class="more-files">... ועוד ${filesWithIssues - 10} קבצים עם בעיות</p>`;
            }
            
            html += '</div>';
            if (container) {
                container.innerHTML = html;
            }
        } else {
            const html = '<div class="no-results">✅ לא נמצאו פונקציות מקומיות</div>';
            if (container) {
                container.innerHTML = html;
            }
        }
    }

    /**
     * Update dashboard statistics
     * מעדכן סטטיסטיקות הדשבורד
     */
    updateDashboardStats() {
        console.log('📊 Updating dashboard stats...');
        
        try {
            const stats = this.calculateStats();
            
            // Update UI elements
            this.updateElement('totalPagesCount', stats.totalPages);
            this.updateElement('totalJsFilesCount', stats.totalJsFiles);
            this.updateElement('totalFunctionsCount', stats.totalFunctions);
            this.updateElement('globalFunctionsCount', stats.globalFunctions);
            
            console.log('✅ Dashboard stats updated:', stats);
            
        } catch (error) {
            console.error('❌ Failed to update dashboard stats:', error);
        }
    }

    /**
     * Calculate system statistics
     * מחשב סטטיסטיקות המערכת
     */
    calculateStats() {
        console.log('📊 Calculating stats...');
        console.log('📊 pageMapping:', this.pageMapping);
        console.log('📊 functionsData:', this.functionsData);
        
        const totalPages = this.pageMapping ? Object.keys(this.pageMapping).length : 0;
        const totalJsFiles = this.functionsData ? Object.keys(this.functionsData).length : 0;
        
        let totalFunctions = 0;
        let globalFunctions = 0;
        
        if (this.functionsData) {
            Object.values(this.functionsData).forEach(fileData => {
                if (fileData && fileData.functions) {
                    totalFunctions += fileData.functions.length;
                    globalFunctions += fileData.functions.length; // Simplified for now
                } else if (Array.isArray(fileData)) {
                    // Handle old format where fileData is directly an array of functions
                    totalFunctions += fileData.length;
                    globalFunctions += fileData.length;
                }
            });
        }
        
        // Calculate duplicates and local functions
        const duplicates = this.calculateDuplicates();
        const localFunctions = totalFunctions - globalFunctions;
        
        const stats = {
            totalPages,
            totalJsFiles,
            totalFunctions,
            globalFunctions,
            duplicates,
            localFunctions
        };
        
        console.log('📊 Calculated stats:', stats);
        return stats;
    }

    /**
     * Update a single element
     * מעדכן אלמנט בודד
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`📊 Updated ${id}: ${value}`);
        } else {
            console.warn(`⚠️ Element ${id} not found`);
        }
    }


    /**
     * Show error notification using global system
     * מציג הודעת שגיאה באמצעות המערכת הכללית
     */
    showErrorNotification(title, message) {
        if (window.showNotification) {
            window.showNotification(message, 'error', title, 8000, 'system');
        } else {
            console.error(`${title}: ${message}`);
        }
    }

    /**
     * Refresh data from server
     * מרענן נתונים מהשרת
     */
    async refreshData() {
        console.log('🔄 Refreshing data from server...');
        
        try {
            // Reload data from APIs
            await this.loadDataFromAPIs();
            
            // Update dashboard stats
            this.updateDashboardStats();
            
            // Update UI components
            this.initializeUIComponents();
            
            console.log('✅ Data refreshed successfully');
            
        } catch (error) {
            console.error('❌ Failed to refresh data:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', `שגיאה ברענון נתונים: ${error.message}`);
            }
        }
    }

    /**
     * Render system statistics section
     * מציג את סקשן סטטיסטיקות המערכת
     */
    renderSystemStats() {
        console.log('📊 Rendering system statistics...');
        
        // Statistics are now displayed in the top section, no need to find a separate container
        
        // Update the stat cards directly in the HTML structure
        this.updateDashboardStats();

        const stats = this.calculateStats();
        
        // Update individual stat cards without replacing the entire HTML
        this.updateStatCard('systemTotalPages', stats.totalPages);
        this.updateStatCard('systemTotalJsFiles', stats.totalJsFiles);
        this.updateStatCard('systemTotalFunctions', stats.totalFunctions);
        this.updateStatCard('systemGlobalFunctions', stats.globalFunctions);
        this.updateStatCard('systemDuplicates', stats.duplicates || 0);
        this.updateStatCard('systemLocalFunctions', stats.localFunctions || 0);
        
        console.log('✅ System statistics updated successfully');
    }

    /**
     * Render page mapping section
     * מציג את סקשן מיפוי עמודים
     */
    renderPageMappingData() {
        console.log('🗺️ Rendering page mapping...');
        
        const container = document.getElementById('pageMappingContent');
        if (!container) {
            console.error('❌ pageMappingContent container not found');
            return;
        }
        
        console.log('✅ Found pageMappingContent container');
        
        // Use the container directly since it's already the content area
        const contentArea = container;

        if (!this.pageMapping || Object.keys(this.pageMapping).length === 0) {
            contentArea.innerHTML = '<div class="no-data">אין נתוני מיפוי זמינים</div>';
            return;
        }

        let html = '<div class="page-mapping-container">';
        html += '<h4>📄 מיפוי עמודים לקבצי JavaScript</h4>';
        
        // Add summary statistics
        const totalPages = Object.keys(this.pageMapping).length;
        const totalScripts = Object.values(this.pageMapping).reduce((sum, scripts) => {
            return sum + (Array.isArray(scripts) ? scripts.length : 0);
        }, 0);
        
        html += `<div class="mapping-summary">
            <div class="summary-stats">
                <span class="stat-item">
                    <i class="fas fa-file-alt"></i>
                    <strong>${totalPages}</strong> עמודים
                </span>
                <span class="stat-item">
                    <i class="fas fa-code"></i>
                    <strong>${totalScripts}</strong> קבצי JS
                </span>
            </div>
        </div>`;
        
        html += '<div class="mapping-list">';

        Object.entries(this.pageMapping).forEach(([page, scripts]) => {
            const scriptCount = Array.isArray(scripts) ? scripts.length : 0;
            html += `
                <div class="mapping-item">
                    <div class="page-info">
                        <div class="page-name">
                            <i class="fas fa-file-alt"></i>
                            <strong>${page}</strong>
                            <span class="script-count">(${scriptCount} קבצים)</span>
                        </div>
                        <div class="scripts-list">
                            ${Array.isArray(scripts) ? scripts.map(script => 
                                `<span class="script-tag" title="קובץ JavaScript">${script}</span>`
                            ).join('') : '<span class="no-scripts">אין קבצי JS</span>'}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        contentArea.innerHTML = html;
        console.log('✅ Page mapping rendered successfully');
    }

    /**
     * Refresh page mapping data
     * מרענן נתוני מיפוי עמודים
     */
    async refreshPageMapping() {
        console.log('🔄 Refreshing page mapping data...');
        
        try {
            // Show loading state
            const container = document.getElementById('pageMappingContent');
            if (container) {
                container.innerHTML = `
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        מרענן מיפוי עמודים...
                    </div>
                `;
            }

            // Load fresh data from server
            const mappingData = await window.apiCall('/api/file-scanner/page-mapping');
            this.pageMapping = mappingData.data || mappingData;
            
            console.log('✅ Page mapping data refreshed:', Object.keys(this.pageMapping || {}));

            // Re-render the section
            this.renderPageMappingData();
            
            // Show success notification
            if (window.showSuccessNotification) {
                window.showSuccessNotification('הצלחה', 'מיפוי עמודים רוענן בהצלחה');
            }

        } catch (error) {
            console.error('❌ Failed to refresh page mapping:', error);
            
            // Show error notification
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', `שגיאה ברענון מיפוי עמודים: ${error.message}`);
            }
            
            // Restore previous content
            if (container) {
                container.innerHTML = '<div class="no-data">שגיאה בטעינת נתונים</div>';
            }
        }
    }

    /**
     * Export page mapping data
     * מייצא נתוני מיפוי עמודים
     */
    exportPageMapping() {
        console.log('📥 Exporting page mapping data...');
        
        if (!this.pageMapping || Object.keys(this.pageMapping).length === 0) {
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'אין נתוני מיפוי לייצוא');
            }
            return;
        }

        try {
            // Create export data
            const exportData = {
                timestamp: new Date().toISOString(),
                totalPages: Object.keys(this.pageMapping).length,
                totalScripts: Object.values(this.pageMapping).reduce((sum, scripts) => {
                    return sum + (Array.isArray(scripts) ? scripts.length : 0);
                }, 0),
                pageMapping: this.pageMapping
            };

            // Create and download JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `page-mapping-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ Page mapping exported successfully');
            
            // Show success notification
            if (window.showSuccessNotification) {
                window.showSuccessNotification('הצלחה', 'מיפוי עמודים יוצא בהצלחה');
            }

        } catch (error) {
            console.error('❌ Failed to export page mapping:', error);
            
            // Show error notification
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', `שגיאה בייצוא מיפוי עמודים: ${error.message}`);
            }
        }
    }

    /**
     * Render dependencies analysis section
     * מציג את סקשן ניתוח תלויות
     */
    renderDependenciesData() {
        console.log('🔗 Rendering dependencies analysis...');
        
        const container = document.getElementById('dependenciesContent');
        if (!container) {
            console.error('❌ dependenciesContent container not found');
            return;
        }
        
        console.log('✅ Found dependenciesContent container');
        
        // Use the container directly since it's already the content area
        const contentArea = container;

        const html = `
            <div class="dependencies-analysis">
                <h4>🔗 ניתוח תלויות בין קבצים</h4>
                
                <div class="dependencies-summary">
                    <div class="small-row-card">
                        <div class="small-row-card-label">תלויות כולל</div>
                        <div class="small-row-card-value">${this.calculateDependenciesStats().totalDependencies}</div>
                        <div class="small-row-card-icon">📊</div>
                    </div>
                    <div class="small-row-card">
                        <div class="small-row-card-label">הקובץ הנפוץ ביותר</div>
                        <div class="small-row-card-value">${this.calculateDependenciesStats().mostUsedFile}</div>
                        <div class="small-row-card-icon">🎯</div>
                    </div>
                </div>
                
                <div class="dependencies-list">
                    <h5>📋 פירוט תלויות:</h5>
                    ${this.renderDependenciesList()}
                </div>
                
                <div class="dependencies-info">
                    <p><strong>💡 מידע:</strong> ניתוח התלויות מסייע בהבנת המבנה והתלות בין הקבצים במערכת.</p>
                </div>
            </div>
        `;

        contentArea.innerHTML = html;
        console.log('✅ Dependencies analysis rendered successfully');
    }

    /**
     * Render functions data section
     * מציג את סקשן נתוני פונקציות
     */
    renderFunctionsData() {
        console.log('⚙️ Rendering functions data...');
        
        const container = document.getElementById('functionsListContent');
        if (!container) {
            console.error('❌ functionsListContent container not found');
            return;
        }
        
        console.log('✅ Found functionsListContent container');
        
        // Use the container directly since it's already the content area
        const contentArea = container;

        if (!this.functionsData || Object.keys(this.functionsData).length === 0) {
            contentArea.innerHTML = '<div class="no-data">אין נתוני פונקציות זמינים</div>';
            return;
        }

        console.log('📊 Functions data structure:', Object.keys(this.functionsData));
        console.log('📊 First file data:', Object.values(this.functionsData)[0]);

        const html = `
            <div class="functions-map-container">
                <h4>⚙️ מפת פונקציות מפורטת</h4>
                
                <div class="functions-summary">
                    <div class="small-row-card">
                        <div class="small-row-card-label">קבצים</div>
                        <div class="small-row-card-value">${Object.keys(this.functionsData).length}</div>
                        <div class="small-row-card-icon">📁</div>
                    </div>
                    <div class="small-row-card">
                        <div class="small-row-card-label">פונקציות</div>
                        <div class="small-row-card-value">${this.calculateTotalFunctions()}</div>
                        <div class="small-row-card-icon">⚙️</div>
                    </div>
                </div>
                
                <div class="functions-by-file">
                    ${this.renderFunctionsByFile()}
                </div>
            </div>
        `;

        contentArea.innerHTML = html;
        console.log('✅ Functions data rendered successfully');
    }

    /**
     * Render duplicates analysis section
     * מציג את סקשן ניתוח כפילויות
     */
    renderDuplicatesData() {
        console.log('🔍 Rendering duplicates analysis...');
        
        // Duplicates analysis is now part of the advanced analysis section
        const container = document.getElementById('analysisContent');
        if (!container) {
            console.log('⚠️ analysisContent container not found, skipping duplicates rendering');
            return;
        }
        
        console.log('✅ Found analysisContent container for duplicates');
        
        // Use the container directly since it's already the content area
        const contentArea = container;

        const html = `
            <div class="duplicates-analysis">
                <h4>🔍 ניתוח כפילויות</h4>
                
                <div class="duplicates-summary">
                    <div class="small-row-card">
                        <div class="small-row-card-label">כפילויות נמצאו</div>
                        <div class="small-row-card-value">0</div>
                        <div class="small-row-card-icon">🔍</div>
                    </div>
                    <div class="small-row-card">
                        <div class="small-row-card-label">המלצות לתיקון</div>
                        <div class="small-row-card-value">0</div>
                        <div class="small-row-card-icon">⚠️</div>
                    </div>
                </div>
                
                <div class="duplicates-info">
                    <p><strong>💡 מידע:</strong> ניתוח הכפילויות יסייע בזיהוי פונקציות דומות והמלצות לאופטימיזציה.</p>
                    <p><em>פונקציונליות זו תהיה זמינה בעתיד עם חיבור ל-API המתקדם.</em></p>
                </div>
            </div>
        `;

        contentArea.innerHTML = html;
        console.log('✅ Duplicates analysis rendered successfully');
    }

    /**
     * Calculate dependencies statistics
     * מחשב סטטיסטיקות תלויות
     */
    calculateDependenciesStats() {
        if (!this.pageMapping) {
            return { totalDependencies: 0, mostUsedFile: 'אין נתונים' };
        }

        let totalDependencies = 0;
        const fileUsage = {};

        Object.values(this.pageMapping).forEach(pageData => {
            // Handle new format with pageData object
            const scripts = pageData.files || pageData;
            if (Array.isArray(scripts)) {
                totalDependencies += scripts.length;
                scripts.forEach(script => {
                    fileUsage[script] = (fileUsage[script] || 0) + 1;
                });
            }
        });

        const mostUsedFile = Object.keys(fileUsage).length > 0 
            ? Object.keys(fileUsage).reduce((a, b) => fileUsage[a] > fileUsage[b] ? a : b)
            : 'אין נתונים';

        return { totalDependencies, mostUsedFile };
    }

    /**
     * Render dependencies list
     * מציג רשימת תלויות
     */
    renderDependenciesList() {
        if (!this.pageMapping) return '<p>אין נתוני תלויות זמינים</p>';

        let html = '<div class="dependencies-grid">';
        
        Object.entries(this.pageMapping).forEach(([page, pageData]) => {
            // Handle new format with pageData object
            const scripts = pageData.files || pageData;
            if (Array.isArray(scripts) && scripts.length > 0) {
                html += `
                    <div class="dependency-item">
                        <div class="dependency-page">${page}</div>
                        <div class="dependency-scripts">
                            ${scripts.map(script => `<span class="script-badge">${script}</span>`).join('')}
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        return html;
    }

    /**
     * Calculate total functions count
     * מחשב סך הפונקציות
     */
    calculateTotalFunctions() {
        if (!this.functionsData) return 0;
        
        let total = 0;
        Object.values(this.functionsData).forEach(fileData => {
            if (fileData.functions && Array.isArray(fileData.functions)) {
                total += fileData.functions.length;
            }
        });
        return total;
    }

    /**
     * Render functions by file
     * מציג פונקציות לפי קובץ
     */
    renderFunctionsByFile() {
        if (!this.functionsData) return '<p>אין נתוני פונקציות זמינים</p>';

        let html = '<div class="functions-by-file-list">';
        
        Object.entries(this.functionsData).forEach(([fileName, fileData]) => {
            if (fileData.functions && Array.isArray(fileData.functions)) {
                html += `
                    <div class="file-functions-item">
                        <div class="file-header">
                            <h5><i class="fas fa-file-code"></i> ${fileName}</h5>
                            <span class="functions-count">${fileData.functions.length} פונקציות</span>
                        </div>
                        <div class="functions-list">
                            ${fileData.functions.map(func => `
                                <div class="function-item">
                                    <span class="function-name">${func.name || 'פונקציה ללא שם'}</span>
                                    ${func.line ? `<span class="function-line">שורה ${func.line}</span>` : ''}
                                    ${func.description ? `<span class="function-description">${func.description}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        return html;
    }
}

// ========================================
// Global Functions for HTML Integration
// ========================================

/**
 * Initialize JS-Map page
 * מאתחל עמוד JS-Map
 */
function initializeJsMapPage() {
    console.log('🚀 Initializing JS Map page...');
    
    // Create global instance
    window.jsMapSystem = new JsMapSystem();
    
    // Initialize the system
    window.jsMapSystem.init();
    
    console.log('✅ JS Map page initialized');
}

/**
 * Toggle section visibility
 * מציג/מסתיר סקשן
 */

/**
 * Copy detailed log using global system
 * מעתיק לוג מפורט באמצעות המערכת הכללית
 */
async function copyDetailedLog() {
    console.log('📋 Copying JS-Map detailed log...');
    
    try {
        // Get current data from the system
        const system = window.jsMapSystem;
        if (!system) {
            throw new Error('מערכת JS-Map לא זמינה');
        }
        
        // Show loading notification using local method
        
        // Get additional data from server
        let serverData = {};
        try {
            const [functionsResponse, mappingResponse] = await Promise.all([
                window.apiCall('http://localhost:8080/api/file-scanner/functions'),
                window.apiCall('http://localhost:8080/api/file-scanner/page-mapping')
            ]);
            
            serverData = {
                functionsCount: functionsResponse.data ? Object.keys(functionsResponse.data).length : 0,
                pagesCount: mappingResponse.data ? Object.keys(mappingResponse.data).length : 0,
                functionsFiles: functionsResponse.data ? Object.keys(functionsResponse.data).slice(0, 10) : [],
                pages: mappingResponse.data ? Object.keys(mappingResponse.data) : []
            };
        } catch (fetchError) {
            console.warn('⚠️ Could not fetch server data:', fetchError);
            serverData = { error: 'לא ניתן לקבל נתונים מהשרת' };
        }
        
        const logData = {
            system: 'JS-Map',
            timestamp: window.formatDateTime(new Date()),
            url: window.location.href,
            userAgent: navigator.userAgent,
            systemStatus: {
                isInitialized: system.isInitialized || false,
                hasFunctionsData: !!(system.functionsData && Object.keys(system.functionsData).length > 0),
                hasPageMapping: !!(system.pageMapping && Object.keys(system.pageMapping).length > 0),
                functionsCount: system.functionsData ? Object.keys(system.functionsData).length : 0,
                pagesCount: system.pageMapping ? Object.keys(system.pageMapping).length : 0
            },
            serverData: serverData,
            localStorage: {
                jsMapData: system.checkLocalStorageKeyExists('jsMapData'),
                jsMapStats: system.checkLocalStorageKeyExists('jsMapStats')
            },
            errors: system.errors || [],
            performance: {
                memoryUsage: performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'לא זמין',
                loadTime: performance.timing ? `${performance.timing.loadEventEnd - performance.timing.navigationStart}ms` : 'לא זמין',
                domElements: document.querySelectorAll('*').length,
                scriptsLoaded: document.querySelectorAll('script').length,
                stylesheetsLoaded: document.querySelectorAll('link[rel="stylesheet"]').length
            }
        };
        
        // Get detailed UI information
        console.log('🔍 About to call getDetailedUIInfo');
        const uiInfo = system.getDetailedUIInfo();
        console.log('🔍 getDetailedUIInfo returned:', uiInfo.length, 'characters');
        
        const logText = `🔔 לוג מפורט - מערכת JS-Map
📅 תאריך ושעה: ${logData.timestamp}
🌐 URL: ${logData.url}
👤 User Agent: ${logData.userAgent}

📊 סטטוס מערכת:
• מערכת מאותחלת: ${logData.systemStatus.isInitialized ? 'כן' : 'לא'}
• נתוני פונקציות: ${logData.systemStatus.hasFunctionsData ? 'כן' : 'לא'} (${logData.systemStatus.functionsCount} קבצים)
• נתוני מיפוי עמודים: ${logData.systemStatus.hasPageMapping ? 'כן' : 'לא'} (${logData.systemStatus.pagesCount} עמודים)

🖥️ נתוני שרת:
• קבצי פונקציות: ${serverData.functionsCount || 0}
• עמודים: ${serverData.pagesCount || 0}
• קבצים ראשונים: ${serverData.functionsFiles ? serverData.functionsFiles.join(', ') : 'אין'}
• עמודים: ${serverData.pages ? serverData.pages.join(', ') : 'אין'}

💾 אחסון מקומי:
• jsMapData: ${logData.localStorage.jsMapData}
• jsMapStats: ${logData.localStorage.jsMapStats}

⚡ ביצועים:
• זיכרון: ${logData.performance.memoryUsage}
• זמן טעינה: ${logData.performance.loadTime}

🖼️ מידע מפורט על הממשקים:
${uiInfo}

🔧 נתונים מפורטים:
${JSON.stringify(logData, null, 2)}`;
        
        // Show the log in a modal instead of copying (more reliable)
        system.showLogModal(logText);
        
        
    } catch (error) {
        console.error('❌ Error creating detailed log:', error);
        
        // Show error notification using local method
        const system = window.jsMapSystem;
    }
}

        
function refreshStatistics() {
    console.log('📊 Refreshing statistics...');
    
            if (window.jsMapSystem) {
        window.jsMapSystem.refreshData();
    } else {
        console.error('❌ jsMapSystem not available');
    }
}

// Show log in a modal dialog - added to JsMapSystem class
JsMapSystem.prototype.showLogModal = function(logText) {
    console.log('📋 Showing log in modal...');
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'log-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999999998;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'log-modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 90%;
        max-height: 90%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #dee2e6;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '🔔 לוג מפורט - מערכת JS-Map';
    title.style.cssText = `
        margin: 0;
        color: #495057;
        font-size: 1.2rem;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6c757d;
        padding: 5px 10px;
        border-radius: 4px;
        transition: all 0.2s ease;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#f8f9fa';
    closeBtn.onmouseout = () => closeBtn.style.background = 'none';
    closeBtn.onclick = () => document.body.removeChild(modalOverlay);
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create textarea for log content
    const textarea = document.createElement('textarea');
    textarea.value = logText;
    textarea.style.cssText = `
        width: 100%;
        height: 400px;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.4;
        resize: vertical;
        direction: ltr;
        text-align: left;
    `;
    textarea.readOnly = true;
    
    // Create action buttons
    const actions = document.createElement('div');
    actions.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 15px;
        justify-content: flex-end;
    `;
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 העתק ללוח';
    copyBtn.style.cssText = `
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    `;
    copyBtn.onmouseover = () => copyBtn.style.background = '#0056b3';
    copyBtn.onmouseout = () => copyBtn.style.background = '#007bff';
    copyBtn.onclick = () => {
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        if (document.execCommand('copy')) {
            // Note: 'this' context is lost in onclick, need to get system reference
            const system = window.jsMapSystem;
        }
    };
    
    const closeModalBtn = document.createElement('button');
    closeModalBtn.textContent = 'סגור';
    closeModalBtn.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
    `;
    closeModalBtn.onmouseover = () => closeModalBtn.style.background = '#545b62';
    closeModalBtn.onmouseout = () => closeModalBtn.style.background = '#6c757d';
    closeModalBtn.onclick = () => document.body.removeChild(modalOverlay);
    
    actions.appendChild(copyBtn);
    actions.appendChild(closeModalBtn);
    
    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(textarea);
    modalContent.appendChild(actions);
    modalOverlay.appendChild(modalContent);
    
    // Add to page
    document.body.appendChild(modalOverlay);
    
    // Focus textarea
    textarea.focus();
    
    console.log('✅ Log modal displayed');
    
}

// Note: Using global notification system instead of local notifications

/**
 * Get detailed UI information for the log
 * איסוף מידע מפורט על הממשקים
 */
JsMapSystem.prototype.getDetailedUIInfo = function() {
    let uiInfo = '';
    console.log('🔍 getDetailedUIInfo called');
    
    try {
        // 1. Top Section Information
        uiInfo += '📋 סקשן עליון:\n';
        const topSection = document.querySelector('.top-section');
        if (topSection) {
            const quickActions = topSection.querySelectorAll('.btn');
            uiInfo += `  • כפתורי פעולה מהירה: ${quickActions.length}\n`;
            
            const statCards = topSection.querySelectorAll('.stat-card, .overview-stat-card, .overview-card, .small-row-card');
            uiInfo += `  • כרטיסי סטטיסטיקה: ${statCards.length}\n`;
            
            const searchBox = topSection.querySelector('.central-quick-search');
            if (searchBox) {
                uiInfo += `  • תיבת חיפוש: קיימת\n`;
            }
        } else {
            uiInfo += `  • סקשן עליון: לא נמצא\n`;
        }
        
        // 2. Content Sections Information
        uiInfo += '\n📄 סקשנים לתוכן:\n';
        const contentSections = document.querySelectorAll('.content-section');
        uiInfo += `  • סך הכל סקשנים: ${contentSections.length}\n`;
        
        contentSections.forEach((section, index) => {
            const sectionId = section.id || `section${index + 1}`;
            const header = section.querySelector('.section-header');
            const body = section.querySelector('.section-body');
            
            if (header) {
                const title = header.querySelector('h2, h3, h4');
                const titleText = title ? title.textContent.trim() : 'ללא כותרת';
                uiInfo += `  • ${sectionId}: "${titleText}"\n`;
                
                // Check if section is expanded
                const isExpanded = body && body.style.display !== 'none';
                uiInfo += `    - פתוח: ${isExpanded ? 'כן' : 'לא'}\n`;
                
                // Count content elements
                if (body) {
                    const tables = body.querySelectorAll('table');
                    const cards = body.querySelectorAll('.card, .stat-card, .overview-stat-card, .small-row-card');
                    const buttons = body.querySelectorAll('.btn, button');
                    const lists = body.querySelectorAll('ul, ol');
                    uiInfo += `    - טבלאות: ${tables.length}\n`;
                    uiInfo += `    - כרטיסים: ${cards.length}\n`;
                    uiInfo += `    - כפתורים: ${buttons.length}\n`;
                    uiInfo += `    - רשימות: ${lists.length}\n`;
                }
                
                // Count header buttons (section actions)
                const headerButtons = header.querySelectorAll('.section-actions .btn, .section-actions button');
                if (headerButtons.length > 0) {
                    uiInfo += `    - כפתורי כותרת: ${headerButtons.length}\n`;
                }
                    
                    // Check for specific content
                    if (body.textContent.trim() === '' || body.textContent.trim() === 'טוען...') {
                        uiInfo += `    - תוכן: ריק או טוען\n`;
                    } else {
                        const contentLength = body.textContent.trim().length;
                        uiInfo += `    - תוכן: ${contentLength} תווים\n`;
                    }
                }
            }
        });
        
        
        // 3. Form Elements
        uiInfo += '\n📝 אלמנטי טופס:\n';
        const inputs = document.querySelectorAll('input, select, textarea');
        const forms = document.querySelectorAll('form');
        uiInfo += `  • שדות קלט: ${inputs.length}\n`;
        uiInfo += `  • טפסים: ${forms.length}\n`;
        
        // 4. Interactive Elements
        uiInfo += '\n🖱️ אלמנטים אינטראקטיביים:\n';
        const clickableElements = document.querySelectorAll('button, .btn, a, [onclick]');
        uiInfo += `  • אלמנטים ניתנים ללחיצה: ${clickableElements.length}\n`;
        
        // 5. Data Tables
        uiInfo += '\n📊 טבלאות נתונים:\n';
        const dataTables = document.querySelectorAll('table');
        uiInfo += `  • טבלאות: ${dataTables.length}\n`;
        dataTables.forEach((table, index) => {
            const rows = table.querySelectorAll('tr');
            const cells = table.querySelectorAll('td, th');
            uiInfo += `    - טבלה ${index + 1}: ${rows.length} שורות, ${cells.length} תאים\n`;
        });
        
        // 6. Notifications
        uiInfo += '\n🔔 התראות:\n';
        const notifications = document.querySelectorAll('.notification, .alert, .toast');
        uiInfo += `  • התראות פעילות: ${notifications.length}\n`;
        
        // 7. Modal Dialogs
        uiInfo += '\n🪟 חלונות מודאליים:\n';
        const modals = document.querySelectorAll('.modal, .dialog');
        uiInfo += `  • חלונות מודאליים: ${modals.length}\n`;
        
        // 8. Loading States
        uiInfo += '\n⏳ מצבי טעינה:\n';
        const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], .fa-spinner');
        uiInfo += `  • אלמנטי טעינה: ${loadingElements.length}\n`;
        
        // 9. Error States
        uiInfo += '\n❌ מצבי שגיאה:\n';
        const errorElements = document.querySelectorAll('[class*="error"], [class*="danger"], .text-danger');
        uiInfo += `  • אלמנטי שגיאה: ${errorElements.length}\n`;
        
    } catch (error) {
        uiInfo += `\n❌ שגיאה באיסוף מידע על הממשקים: ${error.message}\n`;
        console.error('❌ Error in getDetailedUIInfo:', error);
    }
    
    console.log('🔍 getDetailedUIInfo returning:', uiInfo.length, 'characters');
    return uiInfo;
};

// ========================================
// Page Scripts Matrix Integration Methods
// ========================================

/**
 * Initialize Page Scripts Matrix integration
 * מאתחל אינטגרציה עם Page Scripts Matrix
 */
JsMapSystem.prototype.initializePageScriptsMatrix = async function() {
    try {
        // Skip Page Scripts Matrix initialization for now
        console.log('⚠️ PageScriptsMatrixSystem initialization skipped - not available');
    } catch (error) {
        console.error('❌ Failed to initialize Page Scripts Matrix:', error);
    }
}

/**
 * Perform advanced analysis using Page Scripts Matrix
 * מבצע ניתוח מתקדם באמצעות Page Scripts Matrix
 */
JsMapSystem.prototype.performAdvancedAnalysis = async function() {
    try {
        console.log('🔍 Performing advanced analysis...');
        
        // Build dependency graph
        this.dependencyGraph = this.buildDependencyGraph();
        
        // Perform architecture analysis
        this.architectureAnalysis = this.performArchitectureAnalysis();
        
        // Analyze circular dependencies
        this.analyzeCircularDependencies();
        
        // Analyze unused files
        this.analyzeUnusedFiles();
        
        console.log('✅ Advanced analysis completed');
    } catch (error) {
        console.error('❌ Failed to perform advanced analysis:', error);
    }
}

/**
 * Global functions for page mapping actions
 * פונקציות גלובליות לפעולות מיפוי עמודים
 */

/**
 * Refresh page mapping data
 * מרענן נתוני מיפוי עמודים
 */
async function refreshPageMapping() {
    if (window.jsMapSystem) {
        await window.jsMapSystem.refreshPageMapping();
    } else {
        console.error('❌ JS-Map System not initialized');
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת JS-Map לא מאותחלת');
        }
    }
}

/**
 * Export page mapping data
 * מייצא נתוני מיפוי עמודים
 */
function exportPageMapping() {
    if (window.jsMapSystem) {
        window.jsMapSystem.exportPageMapping();
    } else {
        console.error('❌ JS-Map System not initialized');
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת JS-Map לא מאותחלת');
        }
    }
}

/**
 * Build dependency graph from functions and page mapping data
 * בונה גרף תלויות מנתוני הפונקציות ומיפוי העמודים
 */
JsMapSystem.prototype.buildDependencyGraph = function() {
    const graph = {
        nodes: [],
        edges: [],
        stats: {
            totalNodes: 0,
            totalEdges: 0,
            circularDependencies: 0,
            orphanNodes: 0
        }
    };
    
    try {
        // Add function files as nodes
        if (this.functionsData) {
            Object.keys(this.functionsData).forEach(fileName => {
                graph.nodes.push({
                    id: fileName,
                    type: 'js-file',
                    name: fileName,
                    size: Object.keys(this.functionsData[fileName] || {}).length,
                    functions: Object.keys(this.functionsData[fileName] || {})
                });
            });
        }
        
        // Add HTML pages as nodes
        if (this.pageMapping) {
            Object.keys(this.pageMapping).forEach(pageName => {
                graph.nodes.push({
                    id: pageName,
                    type: 'html-page',
                    name: pageName,
                    scripts: this.pageMapping[pageName] || []
                });
            });
        }
        
        // Add edges between pages and their scripts
        if (this.pageMapping) {
            Object.keys(this.pageMapping).forEach(pageName => {
                const scripts = this.pageMapping[pageName] || [];
                if (Array.isArray(scripts)) {
                    scripts.forEach(scriptName => {
                        graph.edges.push({
                            from: pageName,
                            to: scriptName,
                            type: 'page-script',
                            weight: 1
                        });
                    });
                }
            });
        }
        
        // Calculate stats
        graph.stats.totalNodes = graph.nodes.length;
        graph.stats.totalEdges = graph.edges.length;
        
        console.log('📊 Dependency graph built:', graph.stats);
        return graph;
    } catch (error) {
        console.error('❌ Failed to build dependency graph:', error);
        return graph;
    }
}

/**
 * Perform architecture analysis
 * מבצע ניתוח ארכיטקטורה
 */
JsMapSystem.prototype.performArchitectureAnalysis = function() {
    const analysis = {
        layers: {
            presentation: [],
            business: [],
            data: [],
            utils: []
        },
        patterns: {
            mvc: false,
            mvp: false,
            mvvm: false,
            service: false,
            component: false
        },
        metrics: {
            coupling: 0,
            cohesion: 0,
            complexity: 0,
            maintainability: 0
        },
        recommendations: []
    };
    
    try {
        // Analyze file patterns
        if (this.functionsData) {
            Object.keys(this.functionsData).forEach(fileName => {
                const lowerName = fileName.toLowerCase();
                
                // Categorize files by layer
                if (lowerName.includes('ui') || lowerName.includes('component') || lowerName.includes('view')) {
                    analysis.layers.presentation.push(fileName);
                } else if (lowerName.includes('service') || lowerName.includes('manager') || lowerName.includes('controller')) {
                    analysis.layers.business.push(fileName);
                } else if (lowerName.includes('data') || lowerName.includes('model') || lowerName.includes('db')) {
                    analysis.layers.data.push(fileName);
                } else if (lowerName.includes('util') || lowerName.includes('helper') || lowerName.includes('common')) {
                    analysis.layers.utils.push(fileName);
                }
                
                // Detect architectural patterns
                if (lowerName.includes('controller')) analysis.patterns.mvc = true;
                if (lowerName.includes('presenter')) analysis.patterns.mvp = true;
                if (lowerName.includes('viewmodel')) analysis.patterns.mvvm = true;
                if (lowerName.includes('service')) analysis.patterns.service = true;
                if (lowerName.includes('component')) analysis.patterns.component = true;
            });
        }
        
        // Calculate metrics
        const totalFiles = Object.keys(this.functionsData || {}).length;
        const totalEdges = this.dependencyGraph ? this.dependencyGraph.stats.totalEdges : 0;
        
        analysis.metrics.coupling = totalFiles > 0 ? (totalEdges / totalFiles) : 0;
        analysis.metrics.cohesion = this.calculateCohesion();
        analysis.metrics.complexity = this.calculateComplexity();
        analysis.metrics.maintainability = this.calculateMaintainability();
        
        // Generate recommendations
        this.generateArchitectureRecommendations(analysis);
        
        console.log('🏗️ Architecture analysis completed:', analysis.metrics);
        return analysis;
    } catch (error) {
        console.error('❌ Failed to perform architecture analysis:', error);
        return analysis;
    }
}

/**
 * Calculate cohesion metric
 * מחשב מטריקת לכידות
 */
JsMapSystem.prototype.calculateCohesion = function() {
    // Simplified cohesion calculation based on function similarity
    let cohesion = 0;
    let totalComparisons = 0;
    
    if (this.functionsData) {
        Object.keys(this.functionsData).forEach(fileName => {
            const functions = this.functionsData[fileName];
            const funcNames = Object.keys(functions);
            
            for (let i = 0; i < funcNames.length; i++) {
                for (let j = i + 1; j < funcNames.length; j++) {
                    const func1 = functions[funcNames[i]];
                    const func2 = functions[funcNames[j]];
                    
                    // Simple similarity based on naming patterns
                    if (this.functionsSimilar(func1, func2)) {
                        cohesion += 1;
                    }
                    totalComparisons++;
                }
            }
        });
    }
    
    return totalComparisons > 0 ? (cohesion / totalComparisons) : 0;
}

/**
 * Calculate complexity metric
 * מחשב מטריקת מורכבות
 */
JsMapSystem.prototype.calculateComplexity = function() {
    let totalComplexity = 0;
    let totalFunctions = 0;
    
    if (this.functionsData) {
        Object.keys(this.functionsData).forEach(fileName => {
            const functions = this.functionsData[fileName];
            Object.keys(functions).forEach(funcName => {
                const func = functions[funcName];
                // Simple complexity based on function calls and parameters
                const complexity = (func.calls ? func.calls.length : 0) + (func.parameters ? func.parameters.length : 0);
                totalComplexity += complexity;
                totalFunctions++;
            });
        });
    }
    
    return totalFunctions > 0 ? (totalComplexity / totalFunctions) : 0;
}

/**
 * Calculate maintainability metric
 * מחשב מטריקת תחזוקה
 */
JsMapSystem.prototype.calculateMaintainability = function() {
    const cohesion = this.calculateCohesion();
    const complexity = this.calculateComplexity();
    const coupling = this.dependencyGraph ? this.dependencyGraph.stats.totalEdges : 0;
    
    // Maintainability index (higher is better)
    // Simplified formula: cohesion - complexity - coupling
    return Math.max(0, cohesion - (complexity * 0.1) - (coupling * 0.01));
}

/**
 * Check if two functions are similar
 * בודק אם שתי פונקציות דומות
 */
JsMapSystem.prototype.functionsSimilar = function(func1, func2) {
    if (!func1 || !func2) return false;
    
    const name1 = func1.name || '';
    const name2 = func2.name || '';
    
    // Check for common prefixes/suffixes
    const commonPrefixes = ['get', 'set', 'create', 'update', 'delete', 'handle', 'process'];
    const commonSuffixes = ['data', 'info', 'config', 'settings', 'state'];
    
    for (const prefix of commonPrefixes) {
        if (name1.startsWith(prefix) && name2.startsWith(prefix)) return true;
    }
    
    for (const suffix of commonSuffixes) {
        if (name1.endsWith(suffix) && name2.endsWith(suffix)) return true;
    }
    
    return false;
}

/**
 * Generate architecture recommendations
 * יוצר המלצות ארכיטקטורה
 */
JsMapSystem.prototype.generateArchitectureRecommendations = function(analysis) {
    const recommendations = [];
    
    // High coupling recommendation
    if (analysis.metrics.coupling > 2) {
        recommendations.push({
            type: 'warning',
            title: 'High Coupling Detected',
            message: `Coupling metric is ${analysis.metrics.coupling.toFixed(2)}. Consider reducing dependencies between modules.`,
            priority: 'high'
        });
    }
    
    // Low cohesion recommendation
    if (analysis.metrics.cohesion < 0.3) {
        recommendations.push({
            type: 'warning',
            title: 'Low Cohesion Detected',
            message: `Cohesion metric is ${analysis.metrics.cohesion.toFixed(2)}. Consider reorganizing functions into more cohesive modules.`,
            priority: 'medium'
        });
    }
    
    // High complexity recommendation
    if (analysis.metrics.complexity > 5) {
        recommendations.push({
            type: 'warning',
            title: 'High Complexity Detected',
            message: `Complexity metric is ${analysis.metrics.complexity.toFixed(2)}. Consider simplifying functions and reducing nesting.`,
            priority: 'high'
        });
    }
    
    // Low maintainability recommendation
    if (analysis.metrics.maintainability < 0.5) {
        recommendations.push({
            type: 'error',
            title: 'Low Maintainability',
            message: `Maintainability index is ${analysis.metrics.maintainability.toFixed(2)}. Consider refactoring for better code organization.`,
            priority: 'critical'
        });
    }
    
    // Missing patterns recommendation
    if (!analysis.patterns.service && !analysis.patterns.component) {
        recommendations.push({
            type: 'info',
            title: 'Consider Service Pattern',
            message: 'No service pattern detected. Consider implementing service layer for better separation of concerns.',
            priority: 'low'
        });
    }
    
    analysis.recommendations = recommendations;
}

/**
 * Analyze circular dependencies
 * מנתח תלויות מעגליות
 */
JsMapSystem.prototype.analyzeCircularDependencies = function() {
    if (!this.dependencyGraph) return;
    
    const circularDeps = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (node) => {
        visited.add(node);
        recursionStack.add(node);
        
        const edges = this.dependencyGraph.edges.filter(edge => edge.from === node);
        for (const edge of edges) {
            if (!visited.has(edge.to)) {
                dfs(edge.to);
            } else if (recursionStack.has(edge.to)) {
                circularDeps.push({
                    from: node,
                    to: edge.to,
                    type: edge.type
                });
            }
        }
        
        recursionStack.delete(node);
    };
    
    // Check each node for circular dependencies
    this.dependencyGraph.nodes.forEach(node => {
        if (!visited.has(node.id)) {
            dfs(node.id);
        }
    });
    
    this.dependencyGraph.stats.circularDependencies = circularDeps.length;
    
    if (circularDeps.length > 0) {
        console.warn('⚠️ Circular dependencies detected:', circularDeps);
    }
}

/**
 * Analyze unused files
 * מנתח קבצים לא בשימוש
 */
JsMapSystem.prototype.analyzeUnusedFiles = function() {
    if (!this.dependencyGraph) return;
    
    const unusedFiles = [];
    
    // Check JS files that are not referenced by any page
    this.dependencyGraph.nodes
        .filter(node => node.type === 'js-file')
        .forEach(node => {
            const isReferenced = this.dependencyGraph.edges.some(edge => 
                edge.to === node.id && edge.type === 'page-script'
            );
            
            if (!isReferenced) {
                unusedFiles.push({
                    fileName: node.id,
                    reason: 'Not referenced by any HTML page'
                });
            }
        });
    
    this.dependencyGraph.stats.orphanNodes = unusedFiles.length;
    
    if (unusedFiles.length > 0) {
        console.warn('⚠️ Unused files detected:', unusedFiles);
    }
}

// ========================================
// IndexedDB Integration Methods
// ========================================

/**
 * Initialize IndexedDB connection
 * מאתחל חיבור IndexedDB
 */
JsMapSystem.prototype.initializeIndexedDB = async function() {
    try {
        if (window.UnifiedIndexedDB) {
            this.indexedDB = window.UnifiedIndexedDB;
            await this.indexedDB.initialize();
            console.log('✅ IndexedDB initialized for JS-Map');
        } else {
            console.warn('⚠️ UnifiedIndexedDB not available');
        }
    } catch (error) {
        console.error('❌ Failed to initialize IndexedDB:', error);
        this.cacheEnabled = false;
    }
}

/**
 * Load data from cache
 * טוען נתונים מהמטמון
 */
JsMapSystem.prototype.loadDataFromCache = async function() {
    if (!this.cacheEnabled || !this.indexedDB) {
        return null;
    }
    
    try {
        const cacheData = await this.indexedDB.getSystemStats('js_map_cache');
        return cacheData;
    } catch (error) {
        console.warn('⚠️ Failed to load from cache:', error);
        return null;
    }
}

/**
 * Check if cache is valid
 * בודק אם המטמון תקין
 */
JsMapSystem.prototype.isCacheValid = function(cacheData) {
    if (!cacheData || !cacheData.timestamp) {
        return false;
    }
    
    const now = Date.now();
    const cacheTime = new Date(cacheData.timestamp).getTime();
    const age = now - cacheTime;
    
    return age < this.cacheExpiry;
}

/**
 * Load data from cache data
 * טוען נתונים מנתוני המטמון
 */
JsMapSystem.prototype.loadDataFromCacheData = function(cacheData) {
    try {
        if (cacheData.functionsData) {
            this.functionsData = cacheData.functionsData;
            console.log('📦 Loaded functions data from cache:', Object.keys(this.functionsData || {}));
        }
        
        if (cacheData.pageMapping) {
            this.pageMapping = cacheData.pageMapping;
            console.log('📦 Loaded page mapping from cache:', Object.keys(this.pageMapping || {}));
        }
        
        if (cacheData.systemStats) {
            this.systemStats = cacheData.systemStats;
            console.log('📦 Loaded system stats from cache');
        }
        
        console.log('✅ Data loaded from cache successfully');
    } catch (error) {
        console.error('❌ Failed to load data from cache:', error);
    }
}

/**
 * Save data to cache
 * שומר נתונים למטמון
 */
JsMapSystem.prototype.saveDataToCache = async function() {
    if (!this.cacheEnabled || !this.indexedDB) {
        return;
    }
    
    try {
        const cacheData = {
            timestamp: new Date().toISOString(),
            functionsData: this.functionsData,
            pageMapping: this.pageMapping,
            systemStats: this.systemStats,
            version: '1.0'
        };
        
        await this.indexedDB.saveSystemStats('js_map_cache', cacheData);
        console.log('💾 Data saved to cache successfully');
    } catch (error) {
        console.error('❌ Failed to save data to cache:', error);
    }
}

/**
 * Clear cache
 * מנקה את המטמון
 */
JsMapSystem.prototype.clearCache = async function() {
    if (!this.indexedDB) {
        return;
    }
    
    try {
        await this.indexedDB.deleteSystemStats('js_map_cache');
        console.log('🗑️ Cache cleared successfully');
        
    } catch (error) {
        console.error('❌ Failed to clear cache:', error);
    }
}

/**
 * Refresh data with cache management
 * מרענן נתונים עם ניהול מטמון
 */
JsMapSystem.prototype.refreshData = async function() {
    console.log('🔄 Refreshing JS-Map data...');
    
    try {
        // Clear cache first
        await this.clearCache();
        
        // Load fresh data
        await this.loadDataFromAPIs();
        
        // Save to cache
        await this.saveDataToCache();
        
        // Re-render all sections
        this.renderAllSections();
        this.updateDashboardStats();
        
        console.log('✅ Data refreshed successfully');
        
    } catch (error) {
        console.error('❌ Failed to refresh data:', error);
    }
}

/**
 * Refresh JS-Map data
 * מרענן נתוני JS-Map
 */
function refreshJsMapData() {
    console.log('🔄 Refreshing JS-Map data...');
    
    if (window.jsMapSystem) {
        window.jsMapSystem.refreshData();
    } else {
        console.error('❌ jsMapSystem not available');
    }
}

// ========================================
// Development Sections Functions
// ========================================

/**
 * Initialize development sections
 * מאתחל סקשנים לפיתוח עתידי
 */
function initializeDevelopmentSections() {
    console.log('🚧 Initializing development sections...');
    
    // Set all development sections to closed by default
    const developmentSections = document.querySelectorAll('.development-section');
    developmentSections.forEach(section => {
        const sectionBody = section.querySelector('.section-body');
        if (sectionBody) {
            sectionBody.style.display = 'none';
            const toggleIcon = section.querySelector('.section-toggle-icon');
            if (toggleIcon) {
                toggleIcon.textContent = '▶';
            }
        }
    });
    
    console.log('✅ Development sections initialized');
}

/**
 * Toggle development section visibility
 * מציג/מסתיר סקשן לפיתוח עתידי
 */
function toggleDevelopmentSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const sectionBody = section.querySelector('.section-body');
    const toggleIcon = section.querySelector('.section-toggle-icon');
    
    if (sectionBody && toggleIcon) {
        if (sectionBody.style.display === 'none') {
            sectionBody.style.display = 'block';
            toggleIcon.textContent = '▼';
            console.log(`🔧 Opened development section: ${sectionId}`);
            
            // Show development notification
        } else {
            sectionBody.style.display = 'none';
            toggleIcon.textContent = '▶';
            console.log(`🔧 Closed development section: ${sectionId}`);
        }
    }
}

// ========================================
// MISSING ANALYSIS FUNCTIONS - IMPLEMENTED
// ========================================

/**
 * Analyze duplicates - זיהוי פונקציות כפולות
 */
JsMapSystem.prototype.analyzeDuplicates = async function() {
    try {
        console.log('🔍 Starting duplicates analysis...');
        
        if (!this.functionsData) {
            await this.loadData();
        }
        
        const duplicates = [];
        const functions = Object.values(this.functionsData).flat();
        
        // Compare all functions with each other
        for (let i = 0; i < functions.length; i++) {
            for (let j = i + 1; j < functions.length; j++) {
                const func1 = functions[i];
                const func2 = functions[j];
                
                if (func1.name === func2.name) {
                    const similarity = this.calculateFunctionSimilarity(func1, func2);
                    
                    if (similarity > 70) { // 70% similarity threshold
                        duplicates.push({
                            function_name: func1.name,
                            files: [func1.file, func2.file],
                            similarity_score: similarity,
                            similarity_reason: this.getSimilarityReason(func1, func2),
                            recommendation: `Use global function from ${func1.file}`,
                            lines: [func1.line, func2.line]
                        });
                    }
                }
            }
        }
        
        const result = {
            duplicates: duplicates,
            statistics: {
                total_duplicates: duplicates.length,
                high_similarity: duplicates.filter(d => d.similarity_score >= 90).length,
                medium_similarity: duplicates.filter(d => d.similarity_score >= 70 && d.similarity_score < 90).length,
                low_similarity: 0
            }
        };
        
        console.log('✅ Duplicates analysis completed:', result.statistics);
        return result;
        
    } catch (error) {
        console.error('❌ Failed to analyze duplicates:', error);
        throw error;
    }
};

/**
 * Detect local functions - זיהוי פונקציות מקומיות
 */
JsMapSystem.prototype.detectLocalFunctions = async function() {
    try {
        console.log('🏠 Starting local functions detection...');
        
        if (!this.functionsData) {
            await this.loadData();
        }
        
        const localFunctions = [];
        const globalFunctions = ['showNotification', 'formatDate', 'formatDateTime', 'apiCall', 'toggleSection'];
        
        // Check each file for local functions that might be global
        for (const [fileName, functions] of Object.entries(this.functionsData)) {
            for (const func of functions) {
                // Check if function name suggests it could be global
                if (this.isPotentialGlobalFunction(func.name)) {
                    // Check if similar global function exists
                    const globalAlternative = this.findGlobalAlternative(func.name, globalFunctions);
                    
                    if (globalAlternative) {
                        localFunctions.push({
                            page: fileName.replace('.js', '.html'),
                            local_function: func.name,
                            global_alternative: globalAlternative,
                            usage_count: 1,
                            recommendation: 'Replace with global function',
                            files_affected: [fileName]
                        });
                    }
                }
            }
        }
        
        const result = {
            local_functions: localFunctions,
            statistics: {
                pages_with_local_functions: new Set(localFunctions.map(f => f.page)).size,
                total_local_functions: localFunctions.length,
                global_alternatives_found: localFunctions.length
            }
        };
        
        console.log('✅ Local functions detection completed:', result.statistics);
        return result;
        
    } catch (error) {
        console.error('❌ Failed to detect local functions:', error);
        throw error;
    }
};

/**
 * Sync global functions - סנכרון עם אינדקס פונקציות גלובליות
 */
JsMapSystem.prototype.syncGlobalFunctions = async function() {
    try {
        console.log('🔄 Starting global functions sync...');
        const result = await window.apiCall('/api/file-scanner/sync-global-functions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (result.status === 'success') {
            console.log('✅ Global functions sync completed:', result.data);
            return result.data;
        } else {
            throw new Error(result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ Failed to sync global functions:', error);
        throw error;
    }
};

/**
 * Generate detailed report - יצירת דוח מפורט
 */
JsMapSystem.prototype.generateDetailedReport = async function() {
    try {
        console.log('📝 Generating detailed report...');
        
        const reportId = `report_${new Date().toISOString().replace(/[:.]/g, '')}`;
        
        const summary = {
            total_files_scanned: Object.keys(this.functionsData || {}).length,
            total_functions_found: Object.values(this.functionsData || {}).flat().length,
            duplicates_detected: 0,
            local_functions_found: 0,
            recommendations_count: 0
        };
        
        const detailedLog = this.generateDetailedLogContent();
        
        const result = {
            report_id: reportId,
            summary: summary,
            detailed_log: detailedLog,
            export_formats: ['csv', 'json', 'txt']
        };
        
        console.log('✅ Detailed report generated:', result.report_id);
        return result;
        
    } catch (error) {
        console.error('❌ Failed to generate detailed report:', error);
        throw error;
    }
};

// Helper functions for analysis
JsMapSystem.prototype.calculateFunctionSimilarity = function(func1, func2) {
    let similarity = 0;
    
    // Name similarity (40%)
    if (func1.name === func2.name) {
        similarity += 40;
    } else if (func1.name.includes(func2.name) || func2.name.includes(func1.name)) {
        similarity += 20;
    }
    
    // Code similarity (60%)
    if (func1.code && func2.code) {
        const code1 = func1.code.replace(/\s+/g, '');
        const code2 = func2.code.replace(/\s+/g, '');
        
        if (code1 === code2) {
            similarity += 60;
        } else if (code1.length > 0 && code2.length > 0) {
            // Simple similarity based on common substrings
            const commonLength = this.findCommonSubstringLength(code1, code2);
            const maxLength = Math.max(code1.length, code2.length);
            similarity += (commonLength / maxLength) * 60;
        }
    }
    
    return Math.round(similarity);
};

JsMapSystem.prototype.findCommonSubstringLength = function(str1, str2) {
    let maxLength = 0;
    
    for (let i = 0; i < str1.length; i++) {
        for (let j = 0; j < str2.length; j++) {
            let length = 0;
            while (i + length < str1.length && 
                   j + length < str2.length && 
                   str1[i + length] === str2[j + length]) {
                length++;
            }
            maxLength = Math.max(maxLength, length);
        }
    }
    
    return maxLength;
};

JsMapSystem.prototype.getSimilarityReason = function(func1, func2) {
    if (func1.code === func2.code) {
        return 'Identical function code';
    } else if (func1.name === func2.name) {
        return 'Same function name with similar code';
    } else {
        return 'Similar function structure and logic';
    }
};

JsMapSystem.prototype.isPotentialGlobalFunction = function(functionName) {
    const globalPatterns = [
        /^format/, /^validate/, /^show/, /^hide/, /^toggle/,
        /^get/, /^set/, /^update/, /^delete/, /^create/,
        /^load/, /^save/, /^export/, /^import/
    ];
    
    return globalPatterns.some(pattern => pattern.test(functionName));
};

JsMapSystem.prototype.findGlobalAlternative = function(functionName, globalFunctions) {
    return globalFunctions.find(globalFunc => 
        globalFunc.toLowerCase().includes(functionName.toLowerCase()) ||
        functionName.toLowerCase().includes(globalFunc.toLowerCase())
    );
};

JsMapSystem.prototype.generateDetailedLogContent = function() {
    let log = `=== JS-Map Analysis Report ===\n`;
    log += `Date: ${window.formatDate(new Date())}\n`;
    log += `Time: ${window.formatTimeOnly(new Date())}\n\n`;
    
    log += `System Statistics:\n`;
    log += `- Total JS Files: ${Object.keys(this.functionsData || {}).length}\n`;
    log += `- Total Functions: ${Object.values(this.functionsData || {}).flat().length}\n`;
    log += `- Cache Status: ${this.cacheEnabled ? 'Enabled' : 'Disabled'}\n`;
    log += `- IndexedDB: ${this.indexedDB ? 'Available' : 'Not Available'}\n\n`;
    
    log += `Analysis completed successfully.\n`;
    
    return log;
};

// ========================================
// Export Functions to Global Scope
// ========================================

// Export initialization function
window.initializeJsMapPage = initializeJsMapPage;

// Export section toggle functions
// window.toggleSection export removed - using global version from ui-utils.js
window.initializeDevelopmentSections = initializeDevelopmentSections;
window.toggleDevelopmentSection = toggleDevelopmentSection;

// Export log and refresh functions
window. = ;
// // window. export removed - using global version from system-management.js

// Local  function for js-map page
async function  {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
        console.error('שגיאה בהעתקה:', err);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

// Export missing functions to global scope
window.refreshJsMapData = refreshJsMapData;
window.refreshDashboardData = refreshJsMapData; // Alias
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.generateReport = generateReport;
window.refreshStatistics = refreshStatistics;

// Export new analysis functions
window.analyzeDuplicates = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.analyzeDuplicates();
    }
    console.error('❌ jsMapSystem not available');
};

window.detectLocalFunctions = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.detectLocalFunctions();
    }
    console.error('❌ jsMapSystem not available');
};

window.syncGlobalFunctions = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.syncGlobalFunctions();
    }
    console.error('❌ jsMapSystem not available');
};

window.generateDetailedReport = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.generateDetailedReport();
    }
    console.error('❌ jsMapSystem not available');
};

// Export missing UI functions
window.refreshAnalysis = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.refreshAnalysis();
    }
    console.error('❌ jsMapSystem not available');
};

window.exportAnalysis = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.exportAnalysis();
    }
    console.error('❌ jsMapSystem not available');
};

// System Statistics Functions
window.updateSystemStats = function() {
    if (window.jsMapSystem) {
        window.jsMapSystem.updateSystemStats(true); // true = manual call
        return true;
    }
    console.error('❌ jsMapSystem not available');
    return false;
};

// System Status Functions
window.refreshSystemStatus = async function() {
    if (window.jsMapSystem) {
        return await window.jsMapSystem.refreshSystemStatus();
    }
    console.error('❌ jsMapSystem not available');
};

window.exportSystemStatus = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.exportSystemStatus();
    }
    console.error('❌ jsMapSystem not available');
};

window.testSystemConnectivity = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.testSystemConnectivity();
    }
    console.error('❌ jsMapSystem not available');
};

window.clearSystemCache = async function() {
    if (window.jsMapSystem) {
        return await window.jsMapSystem.clearSystemCache();
    }
    console.error('❌ jsMapSystem not available');
    if (typeof window.showNotification === 'function') {
        window.showNotification('מערכת JS-Map לא זמינה', 'error', 'שגיאה', 3000, 'system');
    }
};

window.reloadSystemData = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.reloadSystemData();
    }
    console.error('❌ jsMapSystem not available');
};

window.showSystemDiagnostics = function() {
    if (window.jsMapSystem) {
        return window.jsMapSystem.showSystemDiagnostics();
    }
    console.error('❌ jsMapSystem not available');
};

// Export the main class to global scope
window.JsMapSystem = JsMapSystem;

console.log('✅ JS-Map System - Clean Implementation ready');
