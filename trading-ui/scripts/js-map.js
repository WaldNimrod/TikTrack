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
            // Load data from APIs
            await this.loadDataFromAPIs();
            
            // Initialize UI components
            this.initializeUIComponents();
            
            // Update dashboard stats
            this.updateDashboardStats();
            
            this.isInitialized = true;
            console.log('✅ JS-Map System initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize JS-Map System:', error);
            this.showErrorNotification('שגיאה באתחול מערכת JS-Map', error.message);
        }
    }

    /**
     * Load data from APIs using existing global systems
     * טוען נתונים מה-APIs באמצעות מערכות כלליות קיימות
     */
    async loadDataFromAPIs() {
        console.log('🔄 Loading data from APIs...');
        
        try {
            console.log('📡 Using direct fetch for API requests');
            
            // Load functions data
            const functionsResponse = await fetch('/api/js-map/functions');
            if (!functionsResponse.ok) {
                throw new Error(`HTTP ${functionsResponse.status}: ${functionsResponse.statusText}`);
            }
            const functionsData = await functionsResponse.json();
            this.functionsData = functionsData.data || functionsData;
            console.log('✅ Functions data loaded:', Object.keys(this.functionsData || {}));
            
            // Load page mapping data
            const mappingResponse = await fetch('/api/js-map/page-mapping');
            if (!mappingResponse.ok) {
                throw new Error(`HTTP ${mappingResponse.status}: ${mappingResponse.statusText}`);
            }
            const mappingData = await mappingResponse.json();
            this.pageMapping = mappingData.data || mappingData;
            console.log('✅ Page mapping data loaded:', Object.keys(this.pageMapping || {}));
            
            // Show success notification
            this.showSuccessNotification('הצלחה', 'נתונים נטענו מהשרת בהצלחה');
            
            // Render all sections with the loaded data
            this.renderAllSections();
            
        } catch (error) {
            console.error('❌ Failed to load data from APIs:', error);
            this.showErrorNotification('שגיאה', `שגיאה בטעינת נתונים: ${error.message}`);
            
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
            const [functionsResponse, mappingResponse] = await Promise.all([
                fetch('/api/js-map/functions'),
                fetch('/api/js-map/page-mapping')
            ]);

            if (functionsResponse.ok) {
                const functionsData = await functionsResponse.json();
                this.functionsData = functionsData.data || functionsData;
                console.log('✅ Functions data loaded via fetch:', Object.keys(this.functionsData || {}));
            } else {
                console.warn('⚠️ Functions API returned:', functionsResponse.status);
            }

            if (mappingResponse.ok) {
                const mappingData = await mappingResponse.json();
                this.pageMapping = mappingData.data || mappingData;
                console.log('✅ Page mapping data loaded via fetch:', Object.keys(this.pageMapping || {}));
            } else {
                console.warn('⚠️ Page mapping API returned:', mappingResponse.status);
            }

            // Show success notification
            this.showSuccessNotification('הצלחה', 'נתונים נטענו מהשרת (מצב fallback)');

        } catch (error) {
            console.error('❌ Fallback fetch failed:', error);
            this.showErrorNotification('שגיאה', `שגיאה בטעינת נתונים (fallback): ${error.message}`);
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
            'accounts.html': ['main.js', 'ui-utils.js', 'data-utils.js'],
            'trades.html': ['main.js', 'data-utils.js'],
            'alerts.html': ['main.js', 'ui-utils.js'],
            'js-map.html': ['main.js', 'ui-utils.js', 'js-map.js']
        };

        console.log('✅ Fallback data loaded with', Object.keys(this.functionsData).length, 'files and', Object.keys(this.pageMapping).length, 'pages');
        this.showSuccessNotification('מידע', 'נתוני דמה נטענו - השרת לא זמין');
    }

    /**
     * Initialize UI components
     * מאתחל רכיבי ממשק המשתמש
     */
    initializeUIComponents() {
        console.log('🎨 Initializing UI components...');
        
        // Render all sections with loaded data
        this.renderAllSections();
        
        // Initialize function tabs system if available
        this.initializeFunctionTabsSystem();
        
        // Initialize development sections
        if (window.initializeDevelopmentSections) {
            window.initializeDevelopmentSections();
            console.log('✅ Development sections initialized');
        }
    }

    /**
     * Render all sections with loaded data
     * מציג את כל הסקשנים עם הנתונים שנטענו
     */
    renderAllSections() {
        console.log('🎨 Rendering all sections...');
        
        this.renderSystemStats();
        this.renderPageMapping();
        this.renderDependencies();
        this.renderFunctionsData();
        
        console.log('✅ All sections rendered');
    }

    // Tab-specific render methods
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

    // Tab-specific refresh methods
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
        const totalPages = this.pageMapping ? Object.keys(this.pageMapping).length : 0;
        const totalJsFiles = this.functionsData ? Object.keys(this.functionsData).length : 0;
        
        let totalFunctions = 0;
        let globalFunctions = 0;
        
        if (this.functionsData) {
            Object.values(this.functionsData).forEach(fileData => {
                if (fileData.functions) {
                    totalFunctions += fileData.functions.length;
                    globalFunctions += fileData.functions.length; // Simplified for now
                }
            });
        }
        
        return {
            totalPages,
            totalJsFiles,
            totalFunctions,
            globalFunctions
        };
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
     * Initialize function tabs system with retry mechanism
     * מאתחל מערכת טאבים של פונקציות עם מנגנון ניסיון חוזר
     */
    initializeFunctionTabsSystem() {
        console.log('🔄 Initializing function tabs system...');
        
        const maxRetries = 20;
        let retries = 0;
        
        const tryInitialize = () => {
            console.log(`🔍 Checking functionsTabsSystem availability (${retries + 1}/${maxRetries})...`);
            console.log('window.functionsTabsSystem exists:', !!window.functionsTabsSystem);
            console.log('setFunctionsData method exists:', !!(window.functionsTabsSystem && typeof window.functionsTabsSystem.setFunctionsData === 'function'));
            
            if (window.functionsTabsSystem && typeof window.functionsTabsSystem.setFunctionsData === 'function') {
                try {
                    window.functionsTabsSystem.setFunctionsData(this.functionsData);
                    console.log('✅ Function tabs system initialized successfully');
                    return;
                } catch (error) {
                    console.error('❌ Error calling setFunctionsData:', error);
                }
            }
            
            retries++;
            if (retries < maxRetries) {
                console.log(`⏳ Waiting for functionsTabsSystem... (${retries}/${maxRetries})`);
                setTimeout(tryInitialize, 200);
            } else {
                console.warn('⚠️ functionsTabsSystem not available after retries');
                console.log('Available methods on functionsTabsSystem:', window.functionsTabsSystem ? Object.getOwnPropertyNames(window.functionsTabsSystem) : 'undefined');
            }
        };
        
        tryInitialize();
    }

    /**
     * Show error notification using global system
     * מציג הודעת שגיאה באמצעות המערכת הכללית
     */
    showErrorNotification(title, message) {
        if (window.showNotification) {
            window.showNotification(title, message, 'error');
        } else {
            console.error(`${title}: ${message}`);
        }
    }

    /**
     * Show success notification using global system
     * מציג הודעת הצלחה באמצעות המערכת הכללית
     */
    showSuccessNotification(title, message) {
        if (window.showNotification) {
            window.showNotification(title, message, 'success');
        } else {
            console.log(`${title}: ${message}`);
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
            this.showErrorNotification('שגיאה', `שגיאה ברענון נתונים: ${error.message}`);
        }
    }

    /**
     * Render system statistics section
     * מציג את סקשן סטטיסטיקות המערכת
     */
    renderSystemStats() {
        console.log('📊 Rendering system statistics...');
        
        const container = document.getElementById('systemStatsContent');
        if (!container) {
            console.error('❌ systemStatsContent container not found');
            return;
        }

        const stats = this.calculateStats();
        
        const html = `
            <div class="system-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-number">${stats.totalPages}</div>
                    <div class="stat-label">עמודי HTML</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📁</div>
                    <div class="stat-number">${stats.totalJsFiles}</div>
                    <div class="stat-label">קבצי JavaScript</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚙️</div>
                    <div class="stat-number">${stats.totalFunctions}</div>
                    <div class="stat-label">פונקציות JavaScript</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🌐</div>
                    <div class="stat-number">${stats.globalFunctions}</div>
                    <div class="stat-label">פונקציות גלובליות</div>
                </div>
            </div>
            
            <div class="stats-details">
                <h4>📋 פירוט נוסף:</h4>
                <ul>
                    <li>עמודים פעילים: <strong>${stats.totalPages}</strong></li>
                    <li>קבצי JS פעילים: <strong>${stats.totalJsFiles}</strong></li>
                    <li>פונקציות כולל: <strong>${stats.totalFunctions}</strong></li>
                    <li>פונקציות גלובליות: <strong>${stats.globalFunctions}</strong></li>
                </ul>
            </div>
        `;

        container.innerHTML = html;
        console.log('✅ System statistics rendered successfully');
    }

    /**
     * Render page mapping section
     * מציג את סקשן מיפוי עמודים
     */
    renderPageMapping() {
        console.log('🗺️ Rendering page mapping...');
        
        const container = document.getElementById('pageMappingContent');
        if (!container) {
            console.error('❌ pageMappingContent container not found');
            return;
        }

        if (!this.pageMapping || Object.keys(this.pageMapping).length === 0) {
            container.innerHTML = '<div class="no-data">אין נתוני מיפוי זמינים</div>';
            return;
        }

        let html = '<div class="page-mapping-container">';
        html += '<h4>📄 מיפוי עמודים לקבצי JavaScript</h4>';
        html += '<div class="mapping-list">';

        Object.entries(this.pageMapping).forEach(([page, scripts]) => {
            html += `
                <div class="mapping-item">
                    <div class="page-name">
                        <i class="fas fa-file-alt"></i>
                        <strong>${page}</strong>
                    </div>
                    <div class="scripts-list">
                        ${Array.isArray(scripts) ? scripts.map(script => 
                            `<span class="script-tag">${script}</span>`
                        ).join('') : 'אין קבצי JS'}
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        container.innerHTML = html;
        console.log('✅ Page mapping rendered successfully');
    }

    /**
     * Render dependencies analysis section
     * מציג את סקשן ניתוח תלויות
     */
    renderDependencies() {
        console.log('🔗 Rendering dependencies analysis...');
        
        const container = document.getElementById('dependenciesContent');
        if (!container) {
            console.error('❌ dependenciesContent container not found');
            return;
        }

        const html = `
            <div class="dependencies-analysis">
                <h4>🔗 ניתוח תלויות בין קבצים</h4>
                
                <div class="dependencies-summary">
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-number">${this.calculateDependenciesStats().totalDependencies}</div>
                        <div class="stat-label">תלויות כולל</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-number">${this.calculateDependenciesStats().mostUsedFile}</div>
                        <div class="stat-label">הקובץ הנפוץ ביותר</div>
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

        container.innerHTML = html;
        console.log('✅ Dependencies analysis rendered successfully');
    }

    /**
     * Render functions data section
     * מציג את סקשן נתוני פונקציות
     */
    renderFunctionsData() {
        console.log('⚙️ Rendering functions data...');
        
        const container = document.getElementById('functionsMapContent');
        if (!container) {
            console.error('❌ functionsMapContent container not found');
            return;
        }

        if (!this.functionsData || Object.keys(this.functionsData).length === 0) {
            container.innerHTML = '<div class="no-data">אין נתוני פונקציות זמינים</div>';
            return;
        }

        const html = `
            <div class="functions-map-container">
                <h4>⚙️ מפת פונקציות מפורטת</h4>
                
                <div class="functions-summary">
                    <div class="stat-card">
                        <div class="stat-icon">📁</div>
                        <div class="stat-number">${Object.keys(this.functionsData).length}</div>
                        <div class="stat-label">קבצים</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚙️</div>
                        <div class="stat-number">${this.calculateTotalFunctions()}</div>
                        <div class="stat-label">פונקציות</div>
                    </div>
                </div>
                
                <div class="functions-by-file">
                    ${this.renderFunctionsByFile()}
                </div>
            </div>
        `;

        container.innerHTML = html;
        console.log('✅ Functions data rendered successfully');
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

        Object.values(this.pageMapping).forEach(scripts => {
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
        
        Object.entries(this.pageMapping).forEach(([page, scripts]) => {
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
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Check if this is a development section
    if (section.classList.contains('development-section')) {
        if (window.toggleDevelopmentSection) {
            window.toggleDevelopmentSection(sectionId);
        }
        return;
    }
    
    const body = section.querySelector('.section-body');
    const icon = section.querySelector('.section-toggle-icon');
    
    if (body && icon) {
        if (body.style.display === 'none' || body.style.display === '') {
            body.style.display = 'block';
            icon.textContent = '▼';
            console.log(`📂 Opened section: ${sectionId}`);
        } else {
            body.style.display = 'none';
            icon.textContent = '▶';
            console.log(`📁 Closed section: ${sectionId}`);
        }
    }
}

/**
 * Copy detailed log using global system
 * מעתיק לוג מפורט באמצעות המערכת הכללית
 */
function copyJsMapDetailedLog() {
    console.log('📋 Copying JS-Map detailed log...');
    
    try {
        const logData = {
            system: 'JS-Map',
            timestamp: new Date().toLocaleString('he-IL'),
            data: {
                functionsData: window.jsMapSystem?.functionsData || 'לא זמין',
                pageMapping: window.jsMapSystem?.pageMapping || 'לא זמין',
                stats: window.jsMapSystem ? 'מערכת זמינה' : 'מערכת לא זמינה'
            }
        };
        
        const logText = `🔔 לוג מפורט - מערכת JS-Map
📅 תאריך ושעה: ${logData.timestamp}
📊 נתונים:
${JSON.stringify(logData.data, null, 2)}`;
        
        navigator.clipboard.writeText(logText).then(() => {
            console.log('✅ Detailed log copied to clipboard');
            if (window.jsMapSystem) {
                window.jsMapSystem.showSuccessNotification('הצלחה', 'לוג מפורט הועתק ללוח');
            }
        }).catch(error => {
            console.error('❌ Failed to copy to clipboard:', error);
            if (window.jsMapSystem) {
                window.jsMapSystem.showErrorNotification('שגיאה', 'לא ניתן להעתיק ללוח');
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating detailed log:', error);
        if (window.jsMapSystem) {
            window.jsMapSystem.showErrorNotification('שגיאה', 'שגיאה ביצירת הלוג המפורט');
        }
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
        if (window.showNotification) {
            window.showNotification('שגיאה', 'מערכת JS-Map לא זמינה', 'error');
        }
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
            if (window.showNotification) {
                window.showNotification('🚧 פיתוח עתידי', 'פונקציונליות זו בפיתוח עתידי. ראה דוקומנטציה לפרטים נוספים.', 'info');
            }
        } else {
            sectionBody.style.display = 'none';
            toggleIcon.textContent = '▶';
            console.log(`🔧 Closed development section: ${sectionId}`);
        }
    }
}

// ========================================
// Export Functions to Global Scope
// ========================================

// Export initialization function
window.initializeJsMapPage = initializeJsMapPage;

// Export section toggle functions
window.toggleSection = toggleSection;
window.initializeDevelopmentSections = initializeDevelopmentSections;
window.toggleDevelopmentSection = toggleDevelopmentSection;

// Export log and refresh functions
window.copyJsMapDetailedLog = copyJsMapDetailedLog;
window.copyDetailedLog = copyJsMapDetailedLog; // Alias for compatibility

// Export missing functions to global scope
window.refreshJsMapData = refreshJsMapData;
window.refreshDashboardData = refreshJsMapData; // Alias
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.generateReport = generateReport;

// Export the main class to global scope
window.JsMapSystem = JsMapSystem;

console.log('✅ JS-Map System - Clean Implementation ready');
