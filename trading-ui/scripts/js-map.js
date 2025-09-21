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
            // Use existing data-utils for API calls
            if (window.apiCall) {
                console.log('📡 Using window.apiCall for API requests');
                
                // Load functions data
                const functionsResponse = await window.apiCall('/api/js-map/functions');
                this.functionsData = functionsResponse.data || functionsResponse;
                console.log('✅ Functions data loaded:', Object.keys(this.functionsData || {}));
                
                // Load page mapping data
                const mappingResponse = await window.apiCall('/api/js-map/page-mapping');
                this.pageMapping = mappingResponse.data || mappingResponse;
                console.log('✅ Page mapping data loaded:', Object.keys(this.pageMapping || {}));
                
            } else {
                console.warn('⚠️ apiCall not available, using direct fetch');
                await this.loadDataWithFallback();
            }
            
            // Show success notification
            this.showSuccessNotification('הצלחה', 'נתונים נטענו מהשרת בהצלחה');
            
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
        
        // Initialize function tabs system if available
        this.initializeFunctionTabsSystem();
        
        // Initialize development sections
        if (window.initializeDevelopmentSections) {
            window.initializeDevelopmentSections();
            console.log('✅ Development sections initialized');
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
        
        const maxRetries = 10;
        let retries = 0;
        
        const tryInitialize = () => {
            if (window.functionsTabsSystem && typeof window.functionsTabsSystem.setFunctionsData === 'function') {
                window.functionsTabsSystem.setFunctionsData(this.functionsData);
                console.log('✅ Function tabs system initialized');
                return;
            }
            
            retries++;
            if (retries < maxRetries) {
                console.log(`⏳ Waiting for functionsTabsSystem... (${retries}/${maxRetries})`);
                setTimeout(tryInitialize, 100);
            } else {
                console.warn('⚠️ functionsTabsSystem not available after retries');
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
                functionsData: window.jsMapSystem?.functionsData,
                pageMapping: window.jsMapSystem?.pageMapping,
                stats: window.jsMapSystem?.calculateStats()
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
window.refreshJsMapData = refreshJsMapData;

console.log('✅ JS-Map System - Clean Implementation ready');
