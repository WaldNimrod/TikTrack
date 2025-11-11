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
        this.isCheckingExternalData = false;
        this.isRefreshing = false;
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

        // Server Logs
        this.logTypes.set('serverAppLogs', {
            name: 'לוג שרת - אפליקציה',
            icon: 'fa-server',
            color: '#ffc107',
            description: 'לוגי אפליקציית השרת',
            fields: ['level', 'message', 'timestamp', 'source', 'module'],
            defaultFilters: ['level', 'module', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('serverErrorLogs', {
            name: 'לוג שרת - שגיאות',
            icon: 'fa-exclamation-triangle',
            color: '#dc3545',
            description: 'לוגי שגיאות השרת',
            fields: ['level', 'error', 'timestamp', 'source', 'stack'],
            defaultFilters: ['level', 'source', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('serverPerformanceLogs', {
            name: 'לוג שרת - ביצועים',
            icon: 'fa-tachometer-alt',
            color: '#ffc107',
            description: 'לוגי ביצועי השרת',
            fields: ['operation', 'duration', 'timestamp', 'source', 'metrics'],
            defaultFilters: ['operation', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('serverDatabaseLogs', {
            name: 'לוג שרת - בסיס נתונים',
            icon: 'fa-database',
            color: '#17a2b8',
            description: 'לוגי פעולות בסיס הנתונים',
            fields: ['operation', 'duration', 'timestamp', 'table', 'query'],
            defaultFilters: ['operation', 'table', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('serverCacheLogs', {
            name: 'לוג שרת - מטמון',
            icon: 'fa-memory',
            color: '#28a745',
            description: 'לוגי פעולות המטמון',
            fields: ['operation', 'key', 'timestamp', 'ttl', 'size'],
            defaultFilters: ['operation', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        this.logTypes.set('backgroundTasksFileLog', {
            name: 'לוג שרת - משימות ברקע',
            icon: 'fa-tasks',
            color: '#28a745',
            description: 'לוג שרת - משימות ברקע (מקובץ)',
            fields: ['taskName', 'timestamp', 'status', 'duration', 'result', 'error', 'user_id'],
            defaultFilters: ['status', 'taskName', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc',
            endpoint: '/api/logs/raw/background_tasks'
        });

        // Cache System Log
        this.logTypes.set('cacheLog', {
            name: 'לוג מטמון',
            icon: 'fa-memory',
            color: '#28a745',
            description: 'לוג פעולות המטמון המערכת',
            fields: ['operation', 'key', 'timestamp', 'ttl', 'size', 'source'],
            defaultFilters: ['operation', 'timeRange'],
            sortBy: 'timestamp',
            sortOrder: 'desc'
        });

        // Chart System
        this.logTypes.set('chartHistory', {
            name: 'היסטוריית גרפים',
            icon: 'fa-chart-line',
            color: '#007bff',
            description: 'היסטוריית גרפים וניתוחים',
            fields: ['chartType', 'timestamp', 'data', 'source'],
            defaultFilters: ['chartType', 'timeRange'],
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
            } else if (!window.cacheSystemReady) {
                console.warn('⚠️ Cache system not ready yet, using fallback');
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
            
            // Use the new unified data fetching method
            let data = await this.getDataForLogType(logType, options);

            // Apply filters
            if (options.filters && data && Array.isArray(data)) {
                data = this.applyFilters(data, options.filters, logConfig);
            }

            // Apply sorting
            if ((options.sortBy || logConfig.sortBy) && data && Array.isArray(data)) {
                data = this.sortData(data, options.sortBy || logConfig.sortBy, options.sortOrder || logConfig.sortOrder);
            }

            // Apply pagination
            if (options.pagination && data && Array.isArray(data)) {
                data = this.applyPagination(data, options.pagination);
            }

            // Ensure data is always an array
            if (!data || !Array.isArray(data)) {
                data = [];
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
            // Return empty data instead of throwing error
            return {
                data: [],
                totalCount: 0,
                logType,
                logConfig: this.logTypes.get(logType),
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    /**
     * Get data for specific log type with fallback methods
     */
    async getDataForLogType(logType, options = {}) {
        try {
            let data = [];
            
            // Try UnifiedCacheManager first
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                data = await window.UnifiedCacheManager.get(logType);
                if (data && Array.isArray(data) && data.length > 0) {
                    console.log(`📊 Loaded ${data.length} records from UnifiedCacheManager for ${logType}`);
                    return data;
                }
            }
            
            // Check if this is a server log type
            if (this.isServerLogType(logType)) {
                data = await this.getServerLogData(logType, options);
                return data;
            }
            
            // Try specific methods based on log type
            switch (logType) {
                case 'notificationHistory':
                    data = await this.getNotificationHistory();
                    break;
                case 'notificationStats':
                    data = await this.getNotificationStats();
                    break;
                case 'externalDataLog':
                    data = await this.getExternalDataLog();
                    break;
                case 'cacheLog':
                    data = await this.getCacheLog();
                    break;
                case 'linterHistory':
                case 'systemLogs':
                case 'errorReports':
                case 'fileMappings':
                case 'scanningResults':
                case 'jsMapAnalysis':
                case 'duplicatesAnalysis':
                case 'chartHistory':
                    data = await this.getGenericLogData(logType);
                    break;
                default:
                    console.warn(`⚠️ Unknown log type: ${logType}`);
                    data = [];
            }
            
            return data || [];
        } catch (error) {
            console.error(`❌ Error getting data for ${logType}:`, error);
            return [];
        }
    }

    /**
     * Get notification history
     */
    async getNotificationHistory() {
        try {
            const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
            if (savedHistory) {
                const data = JSON.parse(savedHistory);
                console.log(`📊 Loaded ${data.length} notification history records from localStorage`);
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load notification history from localStorage:', error);
        }
        return [];
    }

    /**
     * Get notification stats
     */
    async getNotificationStats() {
        try {
            const savedStats = localStorage.getItem('tiktrack_global_notifications_stats');
            if (savedStats) {
                const data = JSON.parse(savedStats);
                console.log(`📊 Loaded ${data.length} notification stats records from localStorage`);
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Failed to load notification stats from localStorage:', error);
        }
        return [];
    }


    /**
     * Get external data log
     */
    async getExternalDataLog() {
        try {
            // First, try to get cached log entries
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                const cachedData = await window.UnifiedCacheManager.get('externalDataLog');
                if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
                    console.log(`📊 Loaded ${cachedData.length} cached external data log entries`);
                    return cachedData;
                }
            }
            
            // If no cached data, try to load real system data
            console.log('📊 No cached external data log found, loading real system data...');
            
            try {
                // Get system status to understand what data we have
                const statusResponse = await fetch('/api/external-data/status/');
                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    const totalQuotes = statusData.cache?.total_quotes || 0;
                    const providers = statusData.providers?.details || [];
                    
                    console.log(`📊 Found ${totalQuotes} total quotes in system`);
                    
                    // Create comprehensive log entries based on real system data
                    const logEntries = [];
                    
                    // Add system overview entry
                    logEntries.push({
                        timestamp: new Date().toISOString(),
                        type: 'info',
                        level: 'info',
                        title: 'סקירת מערכת נתונים חיצוניים',
                        message: `מערכת נתונים חיצוניים פעילה - ${totalQuotes.toLocaleString()} רשומות זמינות`,
                        category: 'system',
                        page: 'external-data-dashboard.html',
                        source: 'system_overview',
                        details: {
                            total_quotes: totalQuotes,
                            providers_count: providers.length,
                            system_health: statusData.overall_health
                        }
                    });
                    
                    // Add provider status entries
                    providers.forEach(provider => {
                        logEntries.push({
                            timestamp: new Date().toISOString(),
                            type: provider.is_healthy ? 'success' : 'error',
                            level: provider.is_healthy ? 'success' : 'error',
                            title: `ספק ${provider.display_name || provider.name}`,
                            message: `ספק ${provider.display_name || provider.name}: ${provider.is_healthy ? 'פעיל' : 'לא פעיל'}`,
                            category: 'api',
                            page: 'external-data-dashboard.html',
                            source: 'provider_status',
                            details: {
                                provider: provider.name,
                                status: provider.is_healthy ? 'active' : 'inactive',
                                last_update: provider.last_successful_request,
                                success_rate: provider.recent_success_rate
                            }
                        });
                    });
                    
                    // Add cache statistics entry
                    if (statusData.cache) {
                        logEntries.push({
                            timestamp: new Date().toISOString(),
                            type: 'info',
                            level: 'info',
                            title: 'סטטיסטיקות מטמון',
                            message: `מטמון פעיל - ${statusData.cache.total_quotes?.toLocaleString() || 0} רשומות, ${statusData.cache.cache_hit_rate || 0}% הצלחה`,
                            category: 'cache',
                            page: 'external-data-dashboard.html',
                            source: 'cache_stats',
                            details: {
                                total_quotes: statusData.cache.total_quotes,
                                hit_rate: statusData.cache.cache_hit_rate,
                                last_update: statusData.cache.last_update
                            }
                        });
                    }
                    
                    // Add recent activity if available
                    if (statusData.recent_activity && statusData.recent_activity.length > 0) {
                        statusData.recent_activity.forEach(activity => {
                            logEntries.push({
                                timestamp: activity.timestamp || new Date().toISOString(),
                                type: activity.type === 'success' ? 'success' : activity.type === 'error' ? 'error' : 'info',
                                level: activity.type === 'success' ? 'success' : activity.type === 'error' ? 'error' : 'info',
                                title: 'פעילות אחרונה במערכת',
                                message: activity.message || 'פעילות במערכת',
                                category: 'system',
                                page: 'external-data-dashboard.html',
                                source: 'recent_activity',
                                details: activity
                            });
                        });
                    }
                    
                    // If we have real data, save it to cache
                    if (logEntries.length > 0) {
                        if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                            await window.UnifiedCacheManager.save('externalDataLog', logEntries);
                            console.log(`💾 Saved ${logEntries.length} real external data log entries to cache`);
                        }
                        return logEntries;
                    }
                }
            } catch (apiError) {
                console.warn('⚠️ Failed to load real system data:', apiError);
            }
            
            // Fallback: Initialize with basic log entry
            const initialLogEntry = [{
                timestamp: new Date().toISOString(),
                type: 'info',
                level: 'info',
                title: 'אתחול מערכת נתונים חיצוניים',
                message: 'מערכת נתונים חיצוניים אותחלה - מחפש נתונים...',
                category: 'system',
                page: 'external-data-dashboard.html',
                source: 'external_data_system'
            }];
            
            // Save initial log to cache
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                await window.UnifiedCacheManager.save('externalDataLog', initialLogEntry);
                console.log('💾 Initialized basic external data log in cache');
            }
            
            return initialLogEntry;
        } catch (error) {
            console.warn('⚠️ Failed to load external data from cache:', error);
            return [{
                timestamp: new Date().toISOString(),
                type: 'error',
                level: 'error',
                title: 'שגיאה במערכת נתונים חיצוניים',
                message: 'שגיאה בטעינת נתונים חיצוניים: ' + error.message,
                category: 'system',
                page: 'external-data-dashboard.html',
                source: 'error_handler'
            }];
        }
    }

    /**
     * Get server app logs
     */
    async getServerAppLogs() {
        return await this.getServerLogData('app');
    }

    /**
     * Get server error logs
     */
    async getServerErrorLogs() {
        return await this.getServerLogData('errors');
    }

    /**
     * Get server performance logs
     */
    async getServerPerformanceLogs() {
        return await this.getServerLogData('performance');
    }

    /**
     * Get server database logs
     */
    async getServerDatabaseLogs() {
        return await this.getServerLogData('database');
    }

    /**
     * Get server cache logs
     */
    async getServerCacheLogs() {
        return await this.getServerLogData('cache');
    }

    /**
     * Get server background tasks logs
     */
    async getServerBackgroundTasksLogs() {
        return await this.getServerLogData('background_tasks');
    }

    /**
     * Get cache log data
     */
    async getCacheLog() {
        try {
            // Get cache log data from server API
            const response = await fetch('/api/logs/raw/cache');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data) {
                    // Parse log entries
                    const logEntries = data.data.split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                            try {
                                // Parse log line format: "timestamp - logger - level - message"
                                const parts = line.split(' - ');
                                if (parts.length >= 4) {
                                    return {
                                        timestamp: parts[0],
                                        source: parts[1],
                                        level: parts[2],
                                        operation: parts[3].includes('Cache SET') ? 'SET' : 
                                                  parts[3].includes('Cache HIT') ? 'HIT' :
                                                  parts[3].includes('Cache MISS') ? 'MISS' :
                                                  parts[3].includes('Cache DELETE') ? 'DELETE' :
                                                  parts[3].includes('Cache EXPIRED') ? 'EXPIRED' : 'UNKNOWN',
                                        message: parts[3],
                                        key: parts[3].match(/key: ([^\s]+)/)?.[1] || null,
                                        ttl: parts[3].match(/TTL: (\d+)s/)?.[1] || null,
                                        size: parts[3].match(/Data size: (\d+) chars/)?.[1] || null
                                    };
                                }
                                return {
                                    timestamp: new Date().toISOString(),
                                    source: 'cache',
                                    level: 'info',
                                    operation: 'UNKNOWN',
                                    message: line
                                };
                            } catch (parseError) {
                                return {
                                    timestamp: new Date().toISOString(),
                                    source: 'cache',
                                    level: 'error',
                                    operation: 'PARSE_ERROR',
                                    message: line
                                };
                            }
                        })
                        .filter(entry => entry.message.includes('Cache'));
                    
                    console.log(`📊 Loaded ${logEntries.length} cache log entries from server`);
                    return logEntries;
                }
            }
            
            // Fallback to empty log
            return [{
                timestamp: new Date().toISOString(),
                level: 'info',
                operation: 'INIT',
                message: 'לוג מטמון אותחל - מחפש נתונים...',
                source: 'cache_system'
            }];
            
        } catch (error) {
            console.warn('⚠️ Failed to load cache log from server:', error);
            return [{
                timestamp: new Date().toISOString(),
                level: 'error',
                operation: 'ERROR',
                message: 'שגיאה בטעינת לוג מטמון: ' + error.message,
                source: 'error_handler'
            }];
        }
    }

    /**
     * Check if log type is a server log type
     */
    isServerLogType(logType) {
        const serverLogTypes = [
            'serverAppLogs',
            'serverErrorLogs', 
            'serverPerformanceLogs',
            'serverDatabaseLogs',
            'backgroundTasksFileLog'
        ];
        return serverLogTypes.includes(logType);
    }

    /**
     * Get server log data from backend API
     */
    async getServerLogData(logType, options = {}) {
        try {
            const logConfig = this.logTypes.get(logType);
            if (!logConfig || !logConfig.endpoint) {
                console.warn(`⚠️ No endpoint configured for server log type: ${logType}`);
                return [];
            }

            // Build URL with parameters
            const maxLines = options.maxLines || 1000;
            const url = `${logConfig.endpoint}?max_lines=${maxLines}`;
            
            console.log(`🔍 Fetching server log data from: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Unknown error from server');
            }

            // Parse the raw log content
            const parsedData = this.parseServerLog(result.content, logType);
            
            console.log(`✅ Successfully loaded ${parsedData.length} server log entries for ${logType}`);
            
            // Cache the data if cache system is available
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                await window.UnifiedCacheManager.save(logType, parsedData);
                console.log(`💾 Cached server log data for ${logType}`);
            }
            
            return parsedData;
            
        } catch (error) {
            console.error(`❌ Error fetching server log data for ${logType}:`, error);
            
            // Return error entry
            return [{
                timestamp: new Date().toISOString(),
                level: 'error',
                message: `שגיאה בטעינת לוג שרת: ${error.message}`,
                source: 'server_log_loader',
                error: error.message
            }];
        }
    }

    /**
     * Parse raw server log content into structured data
     */
    parseServerLog(rawContent, logType) {
        try {
            if (!rawContent || typeof rawContent !== 'string') {
                return [];
            }

            const lines = rawContent.split('\n').filter(line => line.trim());
            const parsedLines = [];

            for (const line of lines) {
                try {
                    const parsed = this.parseLogLine(line, logType);
                    if (parsed) {
                        parsedLines.push(parsed);
                    }
                } catch (lineError) {
                    console.warn(`⚠️ Failed to parse log line: ${line.substring(0, 100)}...`);
                    // Add as unparsed line
                    parsedLines.push({
                        timestamp: new Date().toISOString(),
                        level: 'unknown',
                        message: line,
                        source: 'unparsed',
                        raw: line
                    });
                }
            }

            return parsedLines;
            
        } catch (error) {
            console.error(`❌ Error parsing server log content for ${logType}:`, error);
            return [{
                timestamp: new Date().toISOString(),
                level: 'error',
                message: `שגיאה בפרסור לוג שרת: ${error.message}`,
                source: 'log_parser',
                error: error.message
            }];
        }
    }

    /**
     * Parse individual log line based on log type
     */
    parseLogLine(line, logType) {
        try {
            // Common log format: TIMESTAMP - LOGGER - LEVEL - MESSAGE
            const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/);
            if (!timestampMatch) {
                return null; // Skip lines that don't match expected format
            }

            const timestamp = timestampMatch[1];
            const remainingLine = line.substring(timestamp.length + 3); // Remove timestamp and " - "

            // Extract source (logger)
            const sourceMatch = remainingLine.match(/^([^-]+) -/);
            const source = sourceMatch ? sourceMatch[1].trim() : 'unknown';

            // Extract level
            const levelMatch = remainingLine.match(/^[^-]+ - (\w+) -/);
            const level = levelMatch ? levelMatch[1].toLowerCase() : 'unknown';

            // Extract message (everything after the level)
            const messageStart = remainingLine.indexOf(' - ') + 3;
            const message = remainingLine.substring(messageStart);

            // Special handling for background tasks log
            if (logType === 'backgroundTasksFileLog') {
                return this.parseBackgroundTasksLogLine(line, timestamp, level, source, message);
            }

            return {
                timestamp: this.parseTimestamp(timestamp),
                level: level,
                message: message,
                source: source,
                details: {
                    rawLine: line,
                    logType: logType
                }
            };

        } catch (error) {
            console.warn(`⚠️ Error parsing log line: ${error.message}`);
            return null;
        }
    }

    /**
     * Parse background tasks log line specifically
     */
    parseBackgroundTasksLogLine(line, timestamp, level, source, message) {
        try {
            // Try to extract structured data from background tasks log
            // This will be adapted based on the actual log format when available
            
            return {
                timestamp: this.parseTimestamp(timestamp),
                level: level,
                message: message,
                source: source,
                taskName: source, // Use source as task name for now
                status: level === 'error' ? 'failed' : 'success',
                duration: null, // Will be extracted when format is known
                result: message,
                error: level === 'error' ? message : null,
                user_id: 1, // Default user ID
                details: {
                    rawLine: line,
                    logType: 'backgroundTasksFileLog'
                }
            };
            
        } catch (error) {
            console.warn(`⚠️ Error parsing background tasks log line: ${error.message}`);
            return null;
        }
    }

    /**
     * Parse timestamp string to ISO format
     */
    parseTimestamp(timestampStr) {
        try {
            // Convert "2025-09-28 03:34:46,758" to ISO format
            const isoStr = timestampStr.replace(',', '.').replace(' ', 'T') + 'Z';
            return new Date(isoStr).toISOString();
        } catch (error) {
            console.warn(`⚠️ Error parsing timestamp: ${timestampStr}`);
            return new Date().toISOString();
        }
    }

    /**
     * Get generic log data from IndexedDB
     */
    async getGenericLogData(logType) {
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.layers && window.UnifiedCacheManager.layers.indexedDB) {
                const db = window.UnifiedCacheManager.layers.indexedDB.db;
                if (db) {
                    const transaction = db.transaction(['unified-cache'], 'readonly');
                    const store = transaction.objectStore('unified-cache');
                    const request = store.getAll();
                    
                    return new Promise((resolve, reject) => {
                        request.onsuccess = () => {
                            const results = request.result || [];
                            console.log(`🔍 Found ${results.length} total items in IndexedDB for ${logType}`);
                            
                            // Filter results by log type
                            const filteredResults = results.filter(item => {
                                if (item.key && item.key.includes(logType)) {
                                    try {
                                        let logData = item.data;
                                        if (typeof logData === 'string') {
                                            logData = JSON.parse(logData);
                                        }
                                        return logData;
                                    } catch (error) {
                                        console.warn(`⚠️ Failed to parse data for ${item.key}:`, error);
                                        return false;
                                    }
                                }
                                return false;
                            });
                            
                            const data = filteredResults.map(item => {
                                try {
                                    let logData = item.data;
                                    if (typeof logData === 'string') {
                                        logData = JSON.parse(logData);
                                    }
                                    return logData;
                                } catch (error) {
                                    console.warn(`⚠️ Failed to parse data for ${item.key}:`, error);
                                    return null;
                                }
                            }).filter(item => item !== null);
                            
                            console.log(`📊 Loaded ${data.length} records from IndexedDB for ${logType}`);
                            resolve(data);
                        };
                        request.onerror = () => reject(request.error);
                    });
                }
            }
        } catch (error) {
            console.warn(`⚠️ Failed to load ${logType} from IndexedDB:`, error);
        }
        return [];
    }

    /**
     * Check if external data cache is empty and trigger automatic refresh if needed
     */
    async checkAndRefreshExternalDataIfNeeded() {
        try {
            // Prevent multiple simultaneous calls
            if (this.isCheckingExternalData) {
                console.log('🔄 External data check already in progress, skipping...');
                return;
            }
            
            this.isCheckingExternalData = true;
            console.log('🔍 Checking external data cache status...');
            
            // Check if we have any external data in the cache
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                const externalData = await window.UnifiedCacheManager.get('externalDataLog');
                const hasRecentData = externalData && Array.isArray(externalData) && externalData.length > 0;
                
                // Also check if we're in no-cache mode
                const isNoCacheMode = window.cacheMode === 'no-cache' || 
                                     localStorage.getItem('cache_mode') === 'no-cache' ||
                                     !hasRecentData;
                
                if (isNoCacheMode) {
                    console.log('📊 External data cache is empty or no-cache mode - showing user confirmation dialog...');
                    
                    // Show confirmation dialog instead of automatic refresh
                    await this.showCacheEmptyConfirmationDialog();
                } else {
                    console.log('✅ External data cache has recent data, no refresh needed');
                }
            } else {
                console.log('⚠️ Cache system not ready, skipping external data check');
            }
        } catch (error) {
            console.error('❌ Error checking external data cache:', error);
        } finally {
            this.isCheckingExternalData = false;
        }
    }

    /**
     * Show confirmation dialog when cache is empty
     */
    async showCacheEmptyConfirmationDialog() {
        try {
            // Prevent multiple dialogs
            if (document.getElementById('cache-empty-dialog')) {
                console.log('🔄 Cache empty dialog already shown, skipping...');
                return;
            }
            
            console.log('🔔 Showing cache empty confirmation dialog...');
            
            // Create confirmation dialog
            const dialogHtml = `
                <div id="cache-empty-dialog" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-exclamation-triangle text-warning me-2"></i>
                                    אין נתונים במטמון
                                </h5>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info mb-3">
                                    <i class="bi bi-info-circle me-2"></i>
                                    <strong>מצב המטמון:</strong> לא נמצאו נתונים עדכניים במערכת
                                </div>
                                <p>המערכת לא מצאה נתונים עדכניים במטמון. האם תרצה לעדכן את הנתונים עכשיו מהספק הראשי?</p>
                                <div class="row">
                                    <div class="col-6">
                                        <small class="text-muted">
                                            <i class="bi bi-clock me-1"></i>
                                            תהליך העדכון יארך כ-30-60 שניות
                                        </small>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted">
                                            <i class="bi bi-database me-1"></i>
                                            הנתונים יישמרו במטמון לשימוש עתידי
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn" onclick="window.cacheEmptyDialogChoice = 'no'; document.getElementById('cache-empty-dialog').remove();">
                                    <i class="bi bi-x-circle me-2"></i>
                                    לא עכשיו
                                </button>
                                <button type="button" class="btn" onclick="window.cacheEmptyDialogChoice = 'yes'; document.getElementById('cache-empty-dialog').remove(); window.UnifiedLogManager.triggerAutomaticDataRefresh();">
                                    <i class="bi bi-arrow-clockwise me-2"></i>
                                    כן, עדכן עכשיו
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add dialog to page
            document.body.insertAdjacentHTML('beforeend', dialogHtml);
            
            // Make sure the dialog is visible
            const dialog = document.getElementById('cache-empty-dialog');
            if (dialog) {
                dialog.style.display = 'block';
                dialog.classList.add('show');
            }
            
            console.log('✅ Cache empty confirmation dialog displayed');
            
        } catch (error) {
            console.error('❌ Error showing cache empty dialog:', error);
            
            // Fallback: show notification instead of dialog
            if (window.showWarningNotification) {
                window.showWarningNotification('מטמון ריק', 'לא נמצאו נתונים עדכניים במטמון. לחץ על "רענון כל הנתונים" לעדכון ידני.');
            }
        }
    }

    /**
     * Show loading indicator for data refresh
     */
    showRefreshLoadingIndicator() {
        try {
            // Create loading indicator
            const loadingHtml = `
                <div id="data-refresh-loading" class="position-fixed top-50 start-50 translate-middle" style="z-index: 9999;">
                    <div class="card shadow-lg">
                        <div class="card-body text-center p-4">
                            <div class="spinner-border text-primary mb-3" role="status">
                                <span class="visually-hidden">טוען...</span>
                            </div>
                            <h5 class="card-title">מעדכן נתונים חיצוניים</h5>
                            <p class="card-text text-muted">
                                <i class="bi bi-download me-2"></i>
                                מוריד נתונים מהספק הראשי...
                            </p>
                            <div class="progress mb-2" style="height: 6px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                     role="progressbar" style="width: 0%" id="refresh-progress"></div>
                            </div>
                            <small class="text-muted">זה יכול לקחת 30-60 שניות</small>
                        </div>
                    </div>
                </div>
            `;
            
            // Add loading indicator to page
            document.body.insertAdjacentHTML('beforeend', loadingHtml);
            
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress > 90) progress = 90; // Don't complete until actual refresh is done
                
                const progressBar = document.getElementById('refresh-progress');
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
            }, 500);
            
            // Store interval for cleanup
            window.dataRefreshProgressInterval = progressInterval;
            
            console.log('✅ Data refresh loading indicator displayed');
            
        } catch (error) {
            console.error('❌ Error showing refresh loading indicator:', error);
        }
    }

    /**
     * Hide loading indicator for data refresh
     */
    hideRefreshLoadingIndicator() {
        try {
            // Clear progress interval
            if (window.dataRefreshProgressInterval) {
                clearInterval(window.dataRefreshProgressInterval);
                window.dataRefreshProgressInterval = null;
            }
            
            // Complete progress bar
            const progressBar = document.getElementById('refresh-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            
            // Remove loading indicator after a short delay
            setTimeout(() => {
                const loadingElement = document.getElementById('data-refresh-loading');
                if (loadingElement) {
                    loadingElement.remove();
                }
            }, 1000);
            
            console.log('✅ Data refresh loading indicator hidden');
            
        } catch (error) {
            console.error('❌ Error hiding refresh loading indicator:', error);
        }
    }

    /**
     * Trigger automatic data refresh from primary provider
     */
    async triggerAutomaticDataRefresh() {
        try {
            // Check if refresh is already in progress
            if (this.isRefreshing) {
                console.log('🔄 Data refresh already in progress, skipping...');
                return;
            }
            
            // Check rate limiting (minimum 30 seconds between requests)
            const now = Date.now();
            const lastRefresh = localStorage.getItem('lastExternalDataRefresh');
            if (lastRefresh && (now - parseInt(lastRefresh)) < 30000) {
                const remainingTime = Math.ceil((30000 - (now - parseInt(lastRefresh))) / 1000);
                if (window.showWarningNotification) {
                    window.showWarningNotification('מערכת נתונים חיצוניים', `נא להמתין ${remainingTime} שניות לפני רענון נוסף`);
                }
                return;
            }
            
            this.isRefreshing = true;
            console.log('🚀 Starting automatic external data refresh...');
            
            // Show notification to user
            if (window.showInfoNotification) {
                window.showInfoNotification('מערכת נתונים חיצוניים', 'מבצע רענון נתונים מהספק הראשי... זה יכול לקחת 30-60 שניות');
            }
            
            // Show loading indicator
            this.showRefreshLoadingIndicator();
            
            // Store refresh timestamp
            localStorage.setItem('lastExternalDataRefresh', now.toString());
            
            // Call the external data refresh API
            const response = await fetch('/api/external-data/refresh/all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Automatic data refresh completed:', result);
                
                // Hide loading indicator
                this.hideRefreshLoadingIndicator();
                
                // Show success notification
                if (window.showSuccessNotification) {
                    window.showSuccessNotification('רענון נתונים הושלם', `עודכנו ${result.successful_updates || 0} נתונים בהצלחה`);
                }
                
                // Refresh the dashboard data
                if (window.ExternalDataDashboard) {
                    await window.ExternalDataDashboard.loadSystemStatus();
                    await window.ExternalDataDashboard.loadProviders();
                    await window.ExternalDataDashboard.loadCacheStats();
                }
                
                // Save the refresh result to cache
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                    const refreshLogEntry = {
                        timestamp: new Date().toISOString(),
                        level: 'success',
                        message: `רענון אוטומטי הושלם - עודכנו ${result.successful_updates || 0} נתונים`,
                        source: 'automatic_refresh_system',
                        details: result
                    };
                    
                    // Get existing logs and add new entry
                    let existingLogs = await window.UnifiedCacheManager.get('externalDataLog') || [];
                    if (!Array.isArray(existingLogs)) {
                        existingLogs = [];
                    }
                    existingLogs.unshift(refreshLogEntry);
                    
                    // Keep only last 50 entries
                    if (existingLogs.length > 50) {
                        existingLogs = existingLogs.slice(0, 50);
                    }
                    
                    await window.UnifiedCacheManager.save('externalDataLog', existingLogs);
                    console.log('💾 Saved refresh result to external data log cache');
                }
                
            } else {
                console.error('❌ Failed to refresh external data:', response.status, response.statusText);
                
                // Hide loading indicator
                this.hideRefreshLoadingIndicator();
                
                // Show error notification
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה ברענון נתונים', 'לא ניתן לבצע רענון נתונים אוטומטי');
                }
            }
            
        } catch (error) {
            console.error('❌ Error during automatic data refresh:', error);
            
            // Hide loading indicator
            this.hideRefreshLoadingIndicator();
            
            // Show error notification
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה ברענון נתונים', 'שגיאה טכנית ברענון הנתונים: ' + error.message);
            }
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Apply filters to data
     */
    applyFilters(data, filters, logConfig) {
        // Ensure data is an array
        if (!data || !Array.isArray(data)) {
            console.warn('⚠️ applyFilters received invalid data:', data);
            return [];
        }
        
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
     * Get all available log data for testing
     */
    async getAllLogData() {
        const results = {};
        const logTypes = Array.from(this.logTypes.keys());
        
        console.log(`🔍 Testing all ${logTypes.length} log types...`);
        
        for (const logType of logTypes) {
            try {
                const data = await this.getDataForLogType(logType);
                results[logType] = {
                    success: true,
                    count: data.length,
                    data: data.slice(0, 3), // Show first 3 items for preview
                    logConfig: this.logTypes.get(logType)
                };
                console.log(`✅ ${logType}: ${data.length} records`);
            } catch (error) {
                results[logType] = {
                    success: false,
                    error: error.message,
                    count: 0,
                    logConfig: this.logTypes.get(logType)
                };
                console.log(`❌ ${logType}: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Test all log types and show results
     */
    async testAllLogTypes() {
        console.log('🧪 Testing all log types in Unified Log System...');
        const results = await this.getAllLogData();
        
        const summary = {
            total: Object.keys(results).length,
            successful: Object.values(results).filter(r => r.success).length,
            failed: Object.values(results).filter(r => !r.success).length,
            totalRecords: Object.values(results).reduce((sum, r) => sum + r.count, 0)
        };
        
        console.log('📊 Test Results Summary:', summary);
        console.log('📋 Detailed Results:', results);
        
        return { summary, results };
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

// Add global test function
window.testAllLogTypes = async function() {
    console.log('🧪 Starting comprehensive test of all log types...');
    return await window.UnifiedLogManager.testAllLogTypes();
};

// Add global function to get all log data
window.getAllLogData = async function() {
    console.log('📊 Getting all log data...');
    return await window.UnifiedLogManager.getAllLogData();
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedLogManager;
}

console.log('📊 UnifiedLogManager loaded successfully');
console.log('🔧 Available test functions: window.testAllLogTypes(), window.getAllLogData()');


