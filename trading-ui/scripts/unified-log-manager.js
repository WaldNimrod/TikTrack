/**
 * Unified Log Manager - TikTrack
 * ==============================
 *
 * מערכת כללית לתצוגת לוג של כל סוגי IndexedDB הקיימים במערכת
 * בצורה גמישה ופשוטה עם עיצוב אחיד ומרכזי
 *
 * ARCHITECTURE PRINCIPLES:
 * ========================
 * 1. Single Source of Truth - מקור אחד לאמת
 * 2. Flexible Display - תצוגה גמישה לכל סוג לוג
 * 3. Unified Design - עיצוב אחיד ומרכזי
 * 4. Simple API - ממשק פשוט לשימוש
 * 5. Performance Optimized - מותאם לביצועים
 * 6. Error Resilient - עמיד בשגיאות
 *
 * SUPPORTED LOG TYPES:
 * ====================
 * - notificationHistory/Stats (התראות)
 * - linterHistory/systemLogs/errorReports (Linter)
 * - fileMappings/scanningResults (קבצים)
 * - jsMapAnalysis/duplicatesAnalysis (ניתוח JS)
 * - chartHistory (גרפים)
 * - externalDataLog (נתונים חיצוניים)
 * - Future: priceData, userStatistics
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== UNIFIED LOG MANAGER =====

class UnifiedLogManager {
    constructor() {
        this.initialized = false;
        this.logTypes = new Map();
        this.displayConfigs = new Map();
        this.filterConfigs = new Map();
        this.exportConfigs = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            filterTime: 0
        };
        
        // Initialize supported log types
        this.initializeLogTypes();
        this.initializeDisplayConfigs();
        this.initializeFilterConfigs();
        this.initializeExportConfigs();
    }

    /**
     * Initialize supported log types
     */
    initializeLogTypes() {
        // Notification System
        this.logTypes.set('notificationHistory', {
            name: 'היסטוריית התראות',
            icon: 'fa-bell',
            color: '#28a745',
            description: 'היסטוריית כל ההתראות במערכת',
            fields: ['type', 'title', 'message', 'timestamp', 'page', 'category'],
            defaultFilters: ['type', 'category', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('notificationStats', {
            name: 'סטטיסטיקות התראות',
            icon: 'fa-chart-bar',
            color: '#17a2b8',
            description: 'סטטיסטיקות התראות לפי סוג וזמן',
            fields: ['type', 'count', 'date', 'percentage'],
            defaultFilters: ['type', 'dateRange'],
            sortBy: 'date',
            sortOrder: 'desc'
        });

        // Linter System
        this.logTypes.set('linterHistory', {
            name: 'היסטוריית Linter',
            icon: 'fa-code',
            color: '#fd7e14',
            description: 'היסטוריית סריקות Linter',
            fields: ['filePath', 'timestamp', 'errors', 'warnings', 'source'],
            defaultFilters: ['filePath', 'timeRange', 'severity'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('systemLogs', {
            name: 'לוגים מערכתיים',
            icon: 'fa-cog',
            color: '#6c757d',
            description: 'לוגים מערכתיים כלליים',
            fields: ['level', 'message', 'timestamp', 'source', 'details'],
            defaultFilters: ['level', 'source', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('errorReports', {
            name: 'דוחות שגיאות',
            icon: 'fa-exclamation-triangle',
            color: '#dc3545',
            description: 'דוחות שגיאות מפורטים',
            fields: ['error', 'stack', 'timestamp', 'page', 'userAgent'],
            defaultFilters: ['severity', 'page', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        // File Management
        this.logTypes.set('fileMappings', {
            name: 'מיפוי קבצים',
            icon: 'fa-folder',
            color: '#6f42c1',
            description: 'מיפוי קבצי הפרויקט',
            fields: ['filePath', 'fileType', 'size', 'lastModified', 'source'],
            defaultFilters: ['fileType', 'timeRange'],
            sortBy: 'lastModified',
            sortOrder: 'desc'
        });

        this.logTypes.set('scanningResults', {
            name: 'תוצאות סריקה',
            icon: 'fa-search',
            color: '#20c997',
            description: 'תוצאות סריקת קבצים',
            fields: ['scannedFiles', 'errors', 'warnings', 'lastScanTime', 'source'],
            defaultFilters: ['timeRange'],
            sortBy: 'lastScanTime',
            sortOrder: 'desc'
        });

        // JS-Map Analysis
        this.logTypes.set('jsMapAnalysis', {
            name: 'ניתוח JS-Map',
            icon: 'fa-sitemap',
            color: '#e83e8c',
            description: 'ניתוח מבנה JavaScript',
            fields: ['analysisType', 'timestamp', 'results', 'source'],
            defaultFilters: ['analysisType', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('duplicatesAnalysis', {
            name: 'ניתוח כפילויות',
            icon: 'fa-copy',
            color: '#ffc107',
            description: 'ניתוח כפילויות בקוד',
            fields: ['duplicateType', 'count', 'files', 'timestamp'],
            defaultFilters: ['duplicateType', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        // Charts & Monitoring
        this.logTypes.set('chartHistory', {
            name: 'היסטוריית גרפים',
            icon: 'fa-chart-line',
            color: '#007bff',
            description: 'היסטוריית נתוני גרפים',
            fields: ['chartType', 'data', 'timestamp', 'source'],
            defaultFilters: ['chartType', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        // Future log types
        this.logTypes.set('priceData', {
            name: 'נתוני מחירים',
            icon: 'fa-dollar-sign',
            color: '#28a745',
            description: 'נתוני מחירים חיצוניים',
            fields: ['symbol', 'price', 'timestamp', 'source'],
            defaultFilters: ['symbol', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('userStatistics', {
            name: 'סטטיסטיקות משתמש',
            icon: 'fa-user-chart',
            color: '#17a2b8',
            description: 'סטטיסטיקות כלליות של משתמש',
            fields: ['metric', 'value', 'timestamp', 'category'],
            defaultFilters: ['category', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        // External Data Log
        this.logTypes.set('externalDataLog', {
            name: 'לוג נתונים חיצוניים',
            icon: 'fa-globe',
            color: '#17a2b8',
            description: 'לוג פעילות נתונים חיצוניים',
            fields: ['provider', 'action', 'timestamp', 'status', 'details', 'dataCount'],
            defaultFilters: ['provider', 'status', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });
    }

    /**
     * Initialize display configurations
     */
    initializeDisplayConfigs() {
        // Common display configurations
        this.displayConfigs.set('default', {
            itemsPerPage: 50,
            showPagination: true,
            showSearch: true,
            showFilters: true,
            showExport: true,
            showRefresh: true,
            showStats: true,
            compactMode: false,
            autoRefresh: false,
            refreshInterval: 30000 // 30 seconds
        });

        this.displayConfigs.set('compact', {
            itemsPerPage: 20,
            showPagination: true,
            showSearch: false,
            showFilters: false,
            showExport: true,
            showRefresh: true,
            showStats: false,
            compactMode: true,
            autoRefresh: false,
            refreshInterval: 0
        });

        this.displayConfigs.set('full', {
            itemsPerPage: 100,
            showPagination: true,
            showSearch: true,
            showFilters: true,
            showExport: true,
            showRefresh: true,
            showStats: true,
            compactMode: false,
            autoRefresh: true,
            refreshInterval: 10000 // 10 seconds
        });
    }

    /**
     * Initialize filter configurations
     */
    initializeFilterConfigs() {
        // Time range filters
        this.filterConfigs.set('timeRange', {
            type: 'timeRange',
            label: 'טווח זמן',
            options: [
                { value: 'all', label: 'כל הזמנים' },
                { value: 'last15min', label: '15 דקות אחרונות' },
                { value: 'lastHour', label: 'שעה אחרונה' },
                { value: 'last6hours', label: '6 שעות אחרונות' },
                { value: 'lastDay', label: 'יום אחרון' },
                { value: 'last3days', label: '3 ימים אחרונים' },
                { value: 'lastWeek', label: 'שבוע אחרון' },
                { value: 'last2weeks', label: '2 שבועות אחרונים' },
                { value: 'lastMonth', label: 'חודש אחרון' },
                { value: 'last3months', label: '3 חודשים אחרונים' },
                { value: 'lastYear', label: 'שנה אחרונה' }
            ]
        });

        // Type filters
        this.filterConfigs.set('type', {
            type: 'select',
            label: 'סוג',
            options: 'dynamic' // Will be populated from data
        });

        // Category filters
        this.filterConfigs.set('category', {
            type: 'select',
            label: 'קטגוריה',
            options: 'dynamic'
        });

        // Severity filters
        this.filterConfigs.set('severity', {
            type: 'select',
            label: 'חומרה',
            options: [
                { value: 'error', label: 'שגיאה' },
                { value: 'warning', label: 'אזהרה' },
                { value: 'info', label: 'מידע' },
                { value: 'success', label: 'הצלחה' }
            ]
        });
    }

    /**
     * Initialize export configurations
     */
    initializeExportConfigs() {
        this.exportConfigs.set('csv', {
            name: 'CSV',
            icon: 'fa-file-csv',
            description: 'ייצוא לקובץ CSV',
            mimeType: 'text/csv',
            extension: 'csv'
        });

        this.exportConfigs.set('json', {
            name: 'JSON',
            icon: 'fa-file-code',
            description: 'ייצוא לקובץ JSON',
            mimeType: 'application/json',
            extension: 'json'
        });

        this.exportConfigs.set('clipboard', {
            name: 'העתקה ללוח',
            icon: 'fa-clipboard',
            description: 'העתקה ללוח העתקה',
            mimeType: 'text/plain',
            extension: 'txt'
        });
    }

    /**
     * Initialize the log manager
     */
    async initialize() {
        if (this.initialized) {
            console.log('✅ UnifiedLogManager already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing UnifiedLogManager...');
            
            // Check if UnifiedCacheManager is available and initialize if needed
            if (!window.UnifiedCacheManager) {
                console.warn('⚠️ UnifiedCacheManager not available, using fallback');
                this.useFallback = true;
            } else {
                // Try to initialize cache system if not already initialized
                try {
                    if (!window.UnifiedCacheManager.initialized) {
                        console.log('🔧 Initializing UnifiedCacheManager for UnifiedLogManager...');
                        await window.UnifiedCacheManager.initialize();
                        console.log('✅ IndexedDB initialized for UnifiedLogManager');
                    } else {
                        console.log('✅ IndexedDB already initialized for UnifiedLogManager');
                    }
                    this.useFallback = false;
                } catch (error) {
                    console.warn('⚠️ IndexedDB initialization failed, using fallback:', error);
                    this.useFallback = true;
                }
            }

            this.initialized = true;
            console.log('✅ UnifiedLogManager initialized successfully');
            
            return this.getStatus();
        } catch (error) {
            console.error('❌ Failed to initialize UnifiedLogManager:', error);
            // Don't throw error, continue with fallback
            this.initialized = true;
            this.useFallback = true;
        }
    }


    /**
     * Get log data from IndexedDB
     */
    async getLogData(logType, options = {}) {
        try {
            if (!this.logTypes.has(logType)) {
                throw new Error(`Unsupported log type: ${logType}`);
            }

            const logConfig = this.logTypes.get(logType);
            let data = [];

            if (window.UnifiedCacheManager) {
                data = await window.UnifiedCacheManager.get(logType);
                console.log(`📊 Loaded ${data ? 1 : 0} records from UnifiedCacheManager for ${logType}`);
            } else {
                console.warn('⚠️ IndexedDB not available, trying localStorage fallback');
                // Try localStorage fallback for notifications only
                if (logType === 'notificationHistory') {
                    try {
                        const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
                        if (savedHistory) {
                            data = JSON.parse(savedHistory);
                            console.log(`📊 Loaded ${data.length} records from localStorage for ${logType}`);
                        } else {
                            data = [];
                            console.log(`📊 No data found in localStorage for ${logType}`);
                        }
                    } catch (error) {
                        console.warn('⚠️ Failed to load from localStorage:', error);
                        data = [];
                    }
                } else {
                    data = [];
                    console.log(`📊 No fallback available for ${logType} - returning empty data`);
                }
            }

            // Apply filters
            if (options.filters) {
                data = this.applyFilters(data, options.filters, logConfig);
            }

            // Apply sorting
            if (options.sortBy || logConfig.sortBy) {
                data = this.sortData(data, options.sortBy || logConfig.sortBy, options.sortOrder || logConfig.sortOrder);
            }

            // Apply pagination
            if (options.pagination) {
                data = this.applyPagination(data, options.pagination);
            }

            return {
                data,
                totalCount: data.length,
                logType,
                logConfig,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Failed to get log data for ${logType}:`, error);
            throw error;
        }
    }

    /**
     * Apply filters to data
     */
    applyFilters(data, filters, logConfig) {
        return data.filter(item => {
            for (const [filterKey, filterValue] of Object.entries(filters)) {
                if (!filterValue || filterValue === 'all') continue;

                switch (filterKey) {
                    case 'timeRange':
                        if (!this.isInTimeRange(item.timestamp, filterValue)) {
                            return false;
                        }
                        break;
                    case 'type':
                        if (item.type !== filterValue) {
                            return false;
                        }
                        break;
                    case 'category':
                        if (item.category !== filterValue) {
                            return false;
                        }
                        break;
                    case 'severity':
                        if (item.level !== filterValue) {
                            return false;
                        }
                        break;
                    case 'search':
                        if (!this.matchesSearch(item, filterValue, logConfig.fields)) {
                            return false;
                        }
                        break;
                }
            }
            return true;
        });
    }

    /**
     * Check if timestamp is in time range
     */
    isInTimeRange(timestamp, timeRange) {
        const now = Date.now();
        const itemTime = new Date(timestamp).getTime();
        const diff = now - itemTime;

        switch (timeRange) {
            case 'last15min':
                return diff <= 15 * 60 * 1000;
            case 'lastHour':
                return diff <= 60 * 60 * 1000;
            case 'last6hours':
                return diff <= 6 * 60 * 60 * 1000;
            case 'lastDay':
                return diff <= 24 * 60 * 60 * 1000;
            case 'last3days':
                return diff <= 3 * 24 * 60 * 60 * 1000;
            case 'lastWeek':
                return diff <= 7 * 24 * 60 * 60 * 1000;
            case 'last2weeks':
                return diff <= 14 * 24 * 60 * 60 * 1000;
            case 'lastMonth':
                return diff <= 30 * 24 * 60 * 60 * 1000;
            case 'last3months':
                return diff <= 90 * 24 * 60 * 60 * 1000;
            case 'lastYear':
                return diff <= 365 * 24 * 60 * 60 * 1000;
            case 'all':
            default:
                return true;
        }
    }

    /**
     * Check if item matches search query
     */
    matchesSearch(item, searchQuery, fields) {
        const query = searchQuery.toLowerCase();
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(query);
        });
    }

    /**
     * Sort data
     */
    sortData(data, sortBy, sortOrder = 'desc') {
        return data.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortOrder === 'desc') {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            } else {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            }
        });
    }

    /**
     * Apply pagination
     */
    applyPagination(data, pagination) {
        const { page = 1, itemsPerPage = 50 } = pagination;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }

    /**
     * Export log data
     */
    async exportLogData(logType, format, options = {}) {
        try {
            const logData = await this.getLogData(logType, options);
            const exportConfig = this.exportConfigs.get(format);
            
            if (!exportConfig) {
                throw new Error(`Unsupported export format: ${format}`);
            }

            let exportData;
            let filename;

            switch (format) {
                case 'csv':
                    exportData = this.convertToCSV(logData.data);
                    filename = `${logType}_${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'json':
                    exportData = JSON.stringify(logData, null, 2);
                    filename = `${logType}_${new Date().toISOString().split('T')[0]}.json`;
                    break;
                case 'clipboard':
                    exportData = this.convertToText(logData.data);
                    await navigator.clipboard.writeText(exportData);
                    return { success: true, message: 'נתונים הועתקו ללוח בהצלחה' };
                default:
                    throw new Error(`Unknown export format: ${format}`);
            }

            // Download file
            this.downloadFile(exportData, filename, exportConfig.mimeType);
            
            return { success: true, filename };
        } catch (error) {
            console.error(`❌ Failed to export ${logType} as ${format}:`, error);
            throw error;
        }
    }

    /**
     * Convert data to CSV
     */
    convertToCSV(data) {
        if (!data.length) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    /**
     * Convert data to text
     */
    convertToText(data) {
        return data.map((item, index) => {
            return `${index + 1}. ${JSON.stringify(item, null, 2)}`;
        }).join('\n\n');
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Get available log types
     */
    getAvailableLogTypes() {
        return Array.from(this.logTypes.keys()).map(key => ({
            key,
            ...this.logTypes.get(key)
        }));
    }

    /**
     * Get log type configuration
     */
    getLogTypeConfig(logType) {
        return this.logTypes.get(logType);
    }

    /**
     * Get display configuration
     */
    getDisplayConfig(configName = 'default') {
        return this.displayConfigs.get(configName);
    }

    /**
     * Get filter configuration
     */
    getFilterConfig(filterType) {
        return this.filterConfigs.get(filterType);
    }

    /**
     * Get export configuration
     */
    getExportConfig(format) {
        return this.exportConfigs.get(format);
    }

    /**
     * Get manager status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            logTypesCount: this.logTypes.size,
            displayConfigsCount: this.displayConfigs.size,
            filterConfigsCount: this.filterConfigs.size,
            exportConfigsCount: this.exportConfigs.size,
            performanceMetrics: this.performanceMetrics,
            useFallback: this.useFallback || false
        };
    }
}

// ===== GLOBAL INSTANCE =====

// Create global instance
window.UnifiedLogManager = new UnifiedLogManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedLogManager;
}

console.log('📊 UnifiedLogManager loaded successfully');


