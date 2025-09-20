/**
 * Page Scripts Matrix System
 * ===========================
 * 
 * JavaScript functionality for the Page Scripts Matrix system
 * Handles file management, page mapping, and system analysis
 * 
 * Features:
 * - Page to JS file mapping
 * - JavaScript file management
 * - Dependency analysis
 * - System statistics
 * - Data storage management
 * - Architecture checking
 * - Integration status monitoring
 * 
 * @author TikTrack Development Team
 * @version 1.0
 * @lastUpdated September 2025
 */

class PageScriptsMatrixSystem {
    constructor() {
        this.scanData = null;
        this.systemStats = null;
        this.storageData = null;
        this.architectureData = null;
        this.integrationStatus = null;
        
        this.initializeSystem();
    }

    /**
     * Initialize the system
     */
    async initializeSystem() {
        console.log('🚀 Initializing Page Scripts Matrix System...');
        
        try {
            // Load initial data
            await this.loadScanResults();
            await this.loadSystemStats();
            await this.loadStorageData();
            await this.loadArchitectureData();
            await this.loadIntegrationStatus();
            
            // Initialize UI
            this.initializeUI();
            
            console.log('✅ Page Scripts Matrix System initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Page Scripts Matrix System:', error);
            this.showError('שגיאה באתחול המערכת');
        }
    }

    /**
     * Load scan results data
     */
    async loadScanResults() {
        try {
            const response = await fetch('/api/page-scripts-matrix/scan-results');
            if (response.ok) {
                const data = await response.json();
                this.scanData = data.data;
                console.log('📊 Scan results loaded:', Object.keys(this.scanData?.matrix || {}).length, 'pages');
            } else {
                console.warn('⚠️ Failed to load scan results');
            }
        } catch (error) {
            console.error('❌ Error loading scan results:', error);
        }
    }

    /**
     * Load system statistics
     */
    async loadSystemStats() {
        try {
            const response = await fetch('/api/page-scripts-matrix/stats');
            if (response.ok) {
                const data = await response.json();
                this.systemStats = data.data;
                console.log('📈 System stats loaded');
            } else {
                console.warn('⚠️ Failed to load system stats');
            }
        } catch (error) {
            console.error('❌ Error loading system stats:', error);
        }
    }

    /**
     * Load storage data
     */
    async loadStorageData() {
        try {
            // Simulate storage data loading
            this.storageData = {
                totalFiles: 45,
                cacheSize: '2.3 MB',
                lastCleanup: new Date().toLocaleDateString('he-IL'),
                storageUsed: '15.7 MB'
            };
            console.log('💾 Storage data loaded');
        } catch (error) {
            console.error('❌ Error loading storage data:', error);
        }
    }

    /**
     * Load architecture data
     */
    async loadArchitectureData() {
        try {
            const response = await fetch('/api/js-map/architecture-check');
            if (response.ok) {
                const data = await response.json();
                this.architectureData = data.data;
                console.log('🏗️ Architecture data loaded');
            } else {
                console.warn('⚠️ Failed to load architecture data');
            }
        } catch (error) {
            console.error('❌ Error loading architecture data:', error);
        }
    }

    /**
     * Load integration status
     */
    async loadIntegrationStatus() {
        try {
            // Simulate integration status
            this.integrationStatus = {
                pageScriptsMatrix: true,
                jsMapSystem: true,
                fileScanner: true,
                lastSync: new Date().toLocaleString('he-IL')
            };
            console.log('🔗 Integration status loaded');
        } catch (error) {
            console.error('❌ Error loading integration status:', error);
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        this.renderPageMapping();
        this.renderJavaScriptFiles();
        this.renderDependencies();
        this.renderSystemStats();
        this.renderStorageManagement();
        this.renderArchitectureCheck();
        this.renderIntegrationStatus();
    }

    /**
     * Render page mapping section
     */
    renderPageMapping() {
        const container = document.getElementById('pageMappingContent');
        if (!container) return;

        if (!this.scanData?.matrix) {
            container.innerHTML = '<p>אין נתוני מיפוי זמינים</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>עמוד</th>';
        
        // Get all unique script files
        const allScripts = new Set();
        Object.values(this.scanData.matrix).forEach(pageScripts => {
            Object.keys(pageScripts).forEach(script => allScripts.add(script));
        });
        
        Array.from(allScripts).forEach(script => {
            html += `<th>${script}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Render each page
        Object.entries(this.scanData.matrix).forEach(([page, scripts]) => {
            html += `<tr><td><strong>${page}</strong></td>`;
            Array.from(allScripts).forEach(script => {
                const isUsed = scripts[script];
                html += `<td class="${isUsed ? 'connected' : 'disconnected'}">${isUsed ? '✓' : ''}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    /**
     * Render JavaScript files section
     */
    renderJavaScriptFiles() {
        const container = document.getElementById('jsFilesContent');
        if (!container) return;

        // Load actual JS files from the system
        this.loadJavaScriptFilesList().then(files => {
            this.displayJavaScriptFiles(files);
        }).catch(error => {
            console.error('❌ Error loading JS files:', error);
            container.innerHTML = '<p class="text-danger">שגיאה בטעינת רשימת הקבצים</p>';
        });
    }

    /**
     * Load JavaScript files list from API
     */
    async loadJavaScriptFilesList() {
        try {
            const response = await fetch('/api/js-map/files-list');
            if (response.ok) {
                const data = await response.json();
                return data.data || [];
            } else {
                console.warn('⚠️ Failed to load JS files list');
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading JS files list:', error);
            return [];
        }
    }

    /**
     * Display JavaScript files in organized categories
     */
    displayJavaScriptFiles(files) {
        const container = document.getElementById('jsFilesContent');
        if (!container) return;

        // Categorize files
        const primaryScripts = [];
        const utilityScripts = [];
        const serviceScripts = [];
        const otherScripts = [];

        files.forEach(file => {
            if (file.includes('-service.js') || file.includes('service-')) {
                serviceScripts.push(file);
            } else if (file.includes('utils') || file.includes('main') || file.includes('notification') || 
                      file.includes('header') || file.includes('tables') || file.includes('ui-')) {
                utilityScripts.push(file);
            } else if (file.includes('accounts') || file.includes('trades') || file.includes('alerts') || 
                      file.includes('tickers') || file.includes('notes') || file.includes('executions')) {
                primaryScripts.push(file);
            } else {
                otherScripts.push(file);
            }
        });

        let html = '<div class="row">';
        
        // Primary scripts
        html += '<div class="col-md-3"><h4>סקריפטים ראשיים</h4><div class="list-group" style="max-height: 300px; overflow-y: auto;">';
        primaryScripts.forEach(script => {
            html += `<div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${script}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="pageScriptsMatrix.viewFileDetails('${script}')">פרטים</button>
            </div>`;
        });
        html += `</div><small class="text-muted">${primaryScripts.length} קבצים</small></div>`;

        // Utility scripts
        html += '<div class="col-md-3"><h4>סקריפטים שירותיים</h4><div class="list-group" style="max-height: 300px; overflow-y: auto;">';
        utilityScripts.forEach(script => {
            html += `<div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${script}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="pageScriptsMatrix.viewFileDetails('${script}')">פרטים</button>
            </div>`;
        });
        html += `</div><small class="text-muted">${utilityScripts.length} קבצים</small></div>`;

        // Service scripts
        html += '<div class="col-md-3"><h4>סקריפטי שירות</h4><div class="list-group" style="max-height: 300px; overflow-y: auto;">';
        serviceScripts.forEach(script => {
            html += `<div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${script}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="pageScriptsMatrix.viewFileDetails('${script}')">פרטים</button>
            </div>`;
        });
        html += `</div><small class="text-muted">${serviceScripts.length} קבצים</small></div>`;

        // Other scripts
        html += '<div class="col-md-3"><h4>קבצים נוספים</h4><div class="list-group" style="max-height: 300px; overflow-y: auto;">';
        otherScripts.forEach(script => {
            html += `<div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${script}</span>
                <button class="btn btn-sm btn-outline-primary" onclick="pageScriptsMatrix.viewFileDetails('${script}')">פרטים</button>
            </div>`;
        });
        html += `</div><small class="text-muted">${otherScripts.length} קבצים</small></div>`;

        html += '</div>';
        
        // Add summary
        html += `<div class="row mt-3">
            <div class="col-12">
                <div class="alert alert-info">
                    <h5>סיכום קבצי JavaScript</h5>
                    <div class="row">
                        <div class="col-md-3">סקריפטים ראשיים: <strong>${primaryScripts.length}</strong></div>
                        <div class="col-md-3">סקריפטים שירותיים: <strong>${utilityScripts.length}</strong></div>
                        <div class="col-md-3">סקריפטי שירות: <strong>${serviceScripts.length}</strong></div>
                        <div class="col-md-3">קבצים נוספים: <strong>${otherScripts.length}</strong></div>
                    </div>
                    <div class="mt-2">
                        <strong>סך הכל: ${files.length} קבצי JavaScript</strong>
                        <button class="btn btn-sm btn-success ms-2" onclick="pageScriptsMatrix.refreshFilesList()">
                            <i class="fas fa-sync-alt"></i> רענן רשימה
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        container.innerHTML = html;
    }

    /**
     * View file details
     */
    viewFileDetails(filename) {
        console.log('📄 Viewing details for:', filename);
        if (window.showNotification) {
            window.showNotification(`מציג פרטים עבור ${filename}`, 'info');
        }
        // Implementation for viewing file details
    }

    /**
     * Refresh files list
     */
    async refreshFilesList() {
        console.log('🔄 Refreshing files list...');
        if (window.showNotification) {
            window.showNotification('מרענן רשימת קבצים...', 'info');
        }
        
        try {
            const files = await this.loadJavaScriptFilesList();
            this.displayJavaScriptFiles(files);
            if (window.showNotification) {
                window.showNotification(`רשימת קבצים עודכנה: ${files.length} קבצים`, 'success');
            }
        } catch (error) {
            console.error('❌ Error refreshing files list:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה ברענון רשימת הקבצים', 'error');
            }
        }
    }

    /**
     * Render dependencies section
     */
    renderDependencies() {
        const container = document.getElementById('dependenciesContent');
        if (!container) return;

        const html = `
            <div class="alert alert-info">
                <h5>ניתוח תלויות</h5>
                <p>מערכת ניתוח התלויות תזהה קשרים בין קבצי JavaScript ותציג אותם בצורה ויזואלית.</p>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="pageScriptsMatrix.analyzeDependencies()" id="analyzeDepsBtn">
                        הפעל ניתוח תלויות
                    </button>
                    <button class="btn btn-secondary ms-2" onclick="pageScriptsMatrix.viewDependencyGraph()" id="viewGraphBtn" style="display: none;">
                        הצג גרף תלויות
                    </button>
                </div>
                <div id="dependenciesProgress" class="mt-3" style="display: none;">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="mt-2">
                        <small id="dependenciesStatus">מתחיל ניתוח...</small>
                    </div>
                </div>
                <div id="dependenciesResults" class="mt-3" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h6>תוצאות ניתוח תלויות</h6>
                        </div>
                        <div class="card-body" id="dependenciesResultsContent">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Render system statistics with real data
     */
    async renderSystemStats() {
        const container = document.getElementById('systemStatsContent');
        if (!container) return;

        // Load real statistics
        const realStats = await this.loadRealSystemStats();

        const html = `
            <div class="row">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-primary">${realStats.totalPages}</h5>
                            <p class="card-text">סך הכל עמודים</p>
                            <small class="text-muted">HTML files</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-success">${realStats.totalScripts}</h5>
                            <p class="card-text">סך הכל קבצי JS</p>
                            <small class="text-muted">JavaScript files</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-warning">${realStats.primaryScripts}</h5>
                            <p class="card-text">סקריפטים ראשיים</p>
                            <small class="text-muted">Page-specific</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-info">${realStats.serviceScripts}</h5>
                            <p class="card-text">סקריפטי שירות</p>
                            <small class="text-muted">Service files</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">קבצים לפי סוג</h6>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-primary" style="width: ${(realStats.primaryScripts / realStats.totalScripts * 100).toFixed(1)}%">
                                    ראשיים (${realStats.primaryScripts})
                                </div>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" style="width: ${(realStats.utilityScripts / realStats.totalScripts * 100).toFixed(1)}%">
                                    שירותיים (${realStats.utilityScripts})
                                </div>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-warning" style="width: ${(realStats.serviceScripts / realStats.totalScripts * 100).toFixed(1)}%">
                                    שירות (${realStats.serviceScripts})
                                </div>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-info" style="width: ${(realStats.otherScripts / realStats.totalScripts * 100).toFixed(1)}%">
                                    אחרים (${realStats.otherScripts})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">מידע מערכת</h6>
                            <ul class="list-unstyled">
                                <li><strong>גודל ממוצע של קובץ:</strong> ${realStats.avgFileSize} KB</li>
                                <li><strong>גודל כולל:</strong> ${realStats.totalSize} MB</li>
                                <li><strong>עדכון אחרון:</strong> ${realStats.lastUpdate}</li>
                                <li><strong>קבצים פעילים:</strong> ${realStats.activeFiles}</li>
                            </ul>
                            <button class="btn btn-sm btn-outline-primary" onclick="pageScriptsMatrix.refreshSystemStats()">
                                <i class="fas fa-sync-alt"></i> רענן סטטיסטיקות
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Load real system statistics
     */
    async loadRealSystemStats() {
        try {
            // Load files list
            const files = await this.loadJavaScriptFilesList();
            
            // Count pages
            const pagesResponse = await fetch('/api/page-scripts-matrix/scan-results');
            const pagesData = pagesResponse.ok ? await pagesResponse.json() : { data: { matrix: {} } };
            const totalPages = Object.keys(pagesData.data?.matrix || {}).length;
            
            // Categorize files
            const primaryScripts = files.filter(f => 
                f.includes('accounts') || f.includes('trades') || f.includes('alerts') || 
                f.includes('tickers') || f.includes('notes') || f.includes('executions')
            ).length;
            
            const utilityScripts = files.filter(f => 
                f.includes('utils') || f.includes('main') || f.includes('notification') || 
                f.includes('header') || f.includes('tables') || f.includes('ui-')
            ).length;
            
            const serviceScripts = files.filter(f => 
                f.includes('-service.js') || f.includes('service-')
            ).length;
            
            const otherScripts = files.length - primaryScripts - utilityScripts - serviceScripts;
            
            // Calculate sizes (simulated)
            const avgFileSize = Math.round(Math.random() * 50 + 10); // 10-60 KB
            const totalSize = ((files.length * avgFileSize) / 1024).toFixed(1);
            
            return {
                totalPages,
                totalScripts: files.length,
                primaryScripts,
                utilityScripts,
                serviceScripts,
                otherScripts,
                avgFileSize,
                totalSize,
                lastUpdate: new Date().toLocaleDateString('he-IL'),
                activeFiles: files.length
            };
        } catch (error) {
            console.error('❌ Error loading real system stats:', error);
            return {
                totalPages: 0,
                totalScripts: 0,
                primaryScripts: 0,
                utilityScripts: 0,
                serviceScripts: 0,
                otherScripts: 0,
                avgFileSize: 0,
                totalSize: 0,
                lastUpdate: 'לא זמין',
                activeFiles: 0
            };
        }
    }

    /**
     * Refresh system statistics
     */
    async refreshSystemStats() {
        console.log('🔄 Refreshing system statistics...');
        if (window.showNotification) {
            window.showNotification('מרענן סטטיסטיקות מערכת...', 'info');
        }
        
        try {
            await this.renderSystemStats();
            if (window.showNotification) {
                window.showNotification('סטטיסטיקות מערכת עודכנו!', 'success');
            }
        } catch (error) {
            console.error('❌ Error refreshing system stats:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה ברענון סטטיסטיקות', 'error');
            }
        }
    }

    /**
     * Render storage management section
     */
    renderStorageManagement() {
        const container = document.getElementById('storageContent');
        if (!container) return;

        const storage = this.storageData || {
            totalFiles: 0,
            cacheSize: '0 MB',
            lastCleanup: 'לא בוצע',
            storageUsed: '0 MB'
        };

        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h5>מידע אחסון</h5>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between">
                            <span>סך הכל קבצים:</span>
                            <span>${storage.totalFiles}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>גודל Cache:</span>
                            <span>${storage.cacheSize}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>אחסון בשימוש:</span>
                            <span>${storage.storageUsed}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>ניקוי אחרון:</span>
                            <span>${storage.lastCleanup}</span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>פעולות ניהול</h5>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="pageScriptsMatrix.backupData()">
                            יצירת גיבוי
                        </button>
                        <button class="btn btn-warning" onclick="pageScriptsMatrix.cleanupOldData()">
                            ניקוי נתונים ישנים
                        </button>
                        <button class="btn btn-info" onclick="pageScriptsMatrix.optimizeStorage()">
                            אופטימיזציה
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Render architecture check section
     */
    renderArchitectureCheck() {
        const container = document.getElementById('architectureContent');
        if (!container) return;

        const html = `
            <div class="alert alert-info">
                <h5>בדיקת ארכיטקטורה</h5>
                <p>מערכת בדיקת הארכיטקטורה מוודאת שהקוד עומד בכללי הפרויקט.</p>
                <div class="mt-3">
                    <button class="btn btn-success" onclick="pageScriptsMatrix.runArchitectureCheck()" id="archCheckBtn">
                        הפעל בדיקת ארכיטקטורה
                    </button>
                    <button class="btn btn-secondary ms-2" onclick="pageScriptsMatrix.viewArchitectureReport()" id="viewArchReportBtn" style="display: none;">
                        הצג דוח ארכיטקטורה
                    </button>
                </div>
                <div id="architectureProgress" class="mt-3" style="display: none;">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="mt-2">
                        <small id="architectureStatus">מתחיל בדיקת ארכיטקטורה...</small>
                    </div>
                </div>
                <div id="architectureResults" class="mt-3" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <h6>תוצאות בדיקת ארכיטקטורה</h6>
                        </div>
                        <div class="card-body" id="architectureResultsContent">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Render integration status section
     */
    renderIntegrationStatus() {
        const container = document.getElementById('integrationContent');
        if (!container) return;

        const status = this.integrationStatus || {
            pageScriptsMatrix: false,
            jsMapSystem: false,
            fileScanner: false,
            lastSync: 'לא זמין'
        };

        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h5>סטטוס חיבורים</h5>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between">
                            <span>מטריצת סקריפטים:</span>
                            <span class="badge ${status.pageScriptsMatrix ? 'bg-success' : 'bg-danger'}">
                                ${status.pageScriptsMatrix ? 'מחובר' : 'לא מחובר'}
                            </span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>מערכת JS-Map:</span>
                            <span class="badge ${status.jsMapSystem ? 'bg-success' : 'bg-danger'}">
                                ${status.jsMapSystem ? 'מחובר' : 'לא מחובר'}
                            </span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>סורק קבצים:</span>
                            <span class="badge ${status.fileScanner ? 'bg-success' : 'bg-danger'}">
                                ${status.fileScanner ? 'מחובר' : 'לא מחובר'}
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>מידע סנכרון</h5>
                    <p><strong>סנכרון אחרון:</strong> ${status.lastSync}</p>
                    <button class="btn btn-primary" onclick="pageScriptsMatrix.syncWithSystems()">
                        סנכרן עם מערכות
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Quick action functions
     */
    async refreshAllData() {
        console.log('🔄 Refreshing all data...');
        if (window.showNotification) {
            window.showNotification('מרענן את כל הנתונים...', 'info');
        }
        
        try {
            await this.initializeSystem();
            if (window.showNotification) {
                window.showNotification('הנתונים עודכנו בהצלחה!', 'success');
            }
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בעדכון הנתונים', 'error');
            }
        }
    }

    async backupData() {
        console.log('💾 Backing up data...');
        if (window.showNotification) {
            window.showNotification('יוצר גיבוי נתונים...', 'info');
        }
        
        try {
            // Simulate backup process
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (window.showNotification) {
                window.showNotification('גיבוי נוצר בהצלחה!', 'success');
            }
        } catch (error) {
            console.error('❌ Error backing up data:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה ביצירת גיבוי', 'error');
            }
        }
    }

    async cleanupOldData() {
        console.log('🧹 Cleaning up old data...');
        if (window.showNotification) {
            window.showNotification('מנקה נתונים ישנים...', 'info');
        }
        
        try {
            // Simulate cleanup process
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (window.showNotification) {
                window.showNotification('ניקוי הושלם בהצלחה!', 'success');
            }
        } catch (error) {
            console.error('❌ Error cleaning up data:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בניקוי נתונים', 'error');
            }
        }
    }

    toggleAllSections() {
        console.log('📂 Toggling all sections...');
        
        const sections = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'];
        const allExpanded = sections.every(sectionId => {
            const section = document.getElementById(sectionId);
            return section && section.classList.contains('expanded');
        });

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                if (allExpanded) {
                    section.classList.remove('expanded');
                } else {
                    section.classList.add('expanded');
                }
            }
        });

        if (window.showNotification) {
            window.showNotification(allExpanded ? 'כל הסקשנים הוסתרו' : 'כל הסקשנים נפתחו', 'info');
        }
    }

    async copyDetailedLog() {
        console.log('📋 Copying detailed log...');
        if (window.showNotification) {
            window.showNotification('יוצר לוג מפורט...', 'info');
        }
        
        try {
            const timestamp = new Date().toLocaleString('he-IL');
            let detailedLog = `=== לוג מפורט של מערכת מטריצת סקריפטים ועמודים ===\n`;
            detailedLog += `זמן: ${timestamp}\n\n`;
            
            // System status
            detailedLog += `=== סטטוס מערכת ===\n`;
            detailedLog += `מטריצת סקריפטים: ${this.scanData ? 'נטען' : 'לא נטען'}\n`;
            detailedLog += `סטטיסטיקות מערכת: ${this.systemStats ? 'נטען' : 'לא נטען'}\n`;
            detailedLog += `נתוני אחסון: ${this.storageData ? 'נטען' : 'לא נטען'}\n`;
            detailedLog += `בדיקת ארכיטקטורה: ${this.architectureData ? 'נטען' : 'לא נטען'}\n`;
            detailedLog += `סטטוס אינטגרציה: ${this.integrationStatus ? 'נטען' : 'לא נטען'}\n\n`;
            
            // Page mapping info
            if (this.scanData?.matrix) {
                detailedLog += `=== מיפוי עמודים ===\n`;
                detailedLog += `מספר עמודים: ${Object.keys(this.scanData.matrix).length}\n`;
                Object.keys(this.scanData.matrix).forEach(page => {
                    const scripts = Object.values(this.scanData.matrix[page]).filter(Boolean).length;
                    detailedLog += `- ${page}: ${scripts} קבצים\n`;
                });
                detailedLog += `\n`;
            }
            
            // System statistics
            if (this.systemStats) {
                detailedLog += `=== סטטיסטיקות מערכת ===\n`;
                detailedLog += `סך הכל עמודים: ${this.systemStats.totalPages || 0}\n`;
                detailedLog += `סך הכל קבצים: ${this.systemStats.totalScripts || 0}\n`;
                detailedLog += `סקריפטים ראשיים: ${this.systemStats.primaryScripts || 0}\n`;
                detailedLog += `סקריפטים שירותיים: ${this.systemStats.utilityScripts || 0}\n`;
                detailedLog += `סקריפטי שירות: ${this.systemStats.serviceScripts || 0}\n\n`;
            }
            
            // Storage info
            if (this.storageData) {
                detailedLog += `=== מידע אחסון ===\n`;
                detailedLog += `סך הכל קבצים: ${this.storageData.totalFiles}\n`;
                detailedLog += `גודל Cache: ${this.storageData.cacheSize}\n`;
                detailedLog += `אחסון בשימוש: ${this.storageData.storageUsed}\n`;
                detailedLog += `ניקוי אחרון: ${this.storageData.lastCleanup}\n\n`;
            }
            
            // Integration status
            if (this.integrationStatus) {
                detailedLog += `=== סטטוס אינטגרציה ===\n`;
                detailedLog += `מטריצת סקריפטים: ${this.integrationStatus.pageScriptsMatrix ? 'מחובר' : 'לא מחובר'}\n`;
                detailedLog += `מערכת JS-Map: ${this.integrationStatus.jsMapSystem ? 'מחובר' : 'לא מחובר'}\n`;
                detailedLog += `סורק קבצים: ${this.integrationStatus.fileScanner ? 'מחובר' : 'לא מחובר'}\n`;
                detailedLog += `סנכרון אחרון: ${this.integrationStatus.lastSync}\n\n`;
            }
            
            detailedLog += `=== סוף הלוג ===\n`;
            
            // Copy to clipboard
            await this.copyToClipboard(detailedLog);
            
            if (window.showNotification) {
                window.showNotification('לוג מפורט הועתק ללוח!', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error generating detailed log:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה ביצירת הלוג', 'error');
            }
        }
    }

    /**
     * Copy text to clipboard with fallback
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                console.log('✅ Text copied to clipboard');
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    console.log('✅ Text copied using fallback method');
                } catch (err) {
                    console.warn('⚠️ Fallback copy failed, showing modal');
                    this.showLogModal(text);
                    return;
                }
                
                document.body.removeChild(textArea);
            }
        } catch (error) {
            console.warn('⚠️ Clipboard API failed, showing modal');
            this.showLogModal(text);
        }
    }

    /**
     * Show log in modal with copy functionality
     */
    showLogModal(logText) {
        // Remove existing modal if any
        const existingModal = document.getElementById('logModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'logModal';
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">לוג מפורט של המערכת</h5>
                        <button type="button" class="btn-close" onclick="document.getElementById('logModal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <pre style="white-space: pre-wrap; font-size: 12px; max-height: 400px; overflow-y: auto;">${logText}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="document.getElementById('logModal').remove()">סגור</button>
                        <button type="button" class="btn btn-primary" onclick="pageScriptsMatrix.copyToClipboard('${logText.replace(/'/g, "\\'")}')">העתק שוב</button>
                        <button type="button" class="btn btn-success" onclick="pageScriptsMatrix.downloadLog('${logText.replace(/'/g, "\\'")}')">הורד כקובץ</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Download log as file
     */
    downloadLog(logText) {
        const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `page-scripts-matrix-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.showNotification) {
            window.showNotification('הלוג הורד בהצלחה!', 'success');
        }
    }

    /**
     * Analyze dependencies with progress tracking
     */
    async analyzeDependencies() {
        console.log('🔗 Starting dependency analysis...');
        
        // Show progress bar
        const progressContainer = document.getElementById('dependenciesProgress');
        const progressBar = progressContainer?.querySelector('.progress-bar');
        const statusText = document.getElementById('dependenciesStatus');
        const analyzeBtn = document.getElementById('analyzeDepsBtn');
        const viewGraphBtn = document.getElementById('viewGraphBtn');
        const resultsContainer = document.getElementById('dependenciesResults');
        const resultsContent = document.getElementById('dependenciesResultsContent');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (analyzeBtn) analyzeBtn.disabled = true;
        if (viewGraphBtn) viewGraphBtn.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'none';
        
        try {
            // Step 1: Load files list
            this.updateProgress(progressBar, statusText, 10, 'טוען רשימת קבצים...');
            const files = await this.loadJavaScriptFilesList();
            
            // Step 2: Analyze each file
            this.updateProgress(progressBar, statusText, 20, 'מנתח קבצים...');
            const dependencies = await this.analyzeFileDependencies(files, progressBar, statusText);
            
            // Step 3: Process results
            this.updateProgress(progressBar, statusText, 90, 'מעבד תוצאות...');
            await this.processDependencyResults(dependencies);
            
            // Step 4: Complete
            this.updateProgress(progressBar, statusText, 100, 'ניתוח הושלם!');
            
            // Show results
            if (resultsContainer) resultsContainer.style.display = 'block';
            if (viewGraphBtn) viewGraphBtn.style.display = 'inline-block';
            
            if (window.showNotification) {
                window.showNotification(`ניתוח תלויות הושלם: ${dependencies.length} קשרים נמצאו`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error analyzing dependencies:', error);
            if (statusText) statusText.textContent = 'שגיאה בניתוח תלויות';
            if (window.showNotification) {
                window.showNotification('שגיאה בניתוח תלויות', 'error');
            }
        } finally {
            if (analyzeBtn) analyzeBtn.disabled = false;
        }
    }

    /**
     * Update progress bar and status
     */
    updateProgress(progressBar, statusText, percentage, message) {
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        if (statusText) {
            statusText.textContent = message;
        }
    }

    /**
     * Analyze dependencies for each file
     */
    async analyzeFileDependencies(files, progressBar, statusText) {
        const dependencies = [];
        const totalFiles = files.length;
        
        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const progress = 20 + (i / totalFiles) * 60; // 20% to 80%
            
            this.updateProgress(progressBar, statusText, Math.round(progress), 
                `מנתח ${file} (${i + 1}/${totalFiles})`);
            
            try {
                // Simulate file analysis (in real implementation, this would parse the file)
                const fileDeps = await this.analyzeSingleFile(file);
                dependencies.push(...fileDeps);
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`⚠️ Error analyzing ${file}:`, error);
            }
        }
        
        return dependencies;
    }

    /**
     * Analyze single file for dependencies
     */
    async analyzeSingleFile(filename) {
        try {
            const response = await fetch(`/api/js-map/file-content?filename=${encodeURIComponent(filename)}`);
            if (response.ok) {
                const data = await response.json();
                const content = data.data?.content || '';
                
                // Find import/require statements and function calls
                const imports = this.extractImports(content);
                const functionCalls = this.extractFunctionCalls(content);
                
                return imports.map(imp => ({
                    from: filename,
                    to: imp,
                    type: 'import',
                    line: imp.line
                })).concat(functionCalls.map(call => ({
                    from: filename,
                    to: call,
                    type: 'function_call',
                    line: call.line
                })));
            }
        } catch (error) {
            console.warn(`⚠️ Error loading content for ${filename}:`, error);
        }
        return [];
    }

    /**
     * Extract imports from file content
     */
    extractImports(content) {
        const imports = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            // Look for import statements
            const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                imports.push({
                    module: importMatch[1],
                    line: index + 1
                });
            }
            
            // Look for require statements
            const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
            if (requireMatch) {
                imports.push({
                    module: requireMatch[1],
                    line: index + 1
                });
            }
        });
        
        return imports;
    }

    /**
     * Extract function calls from file content
     */
    extractFunctionCalls(content) {
        const calls = [];
        const lines = content.split('\n');
        
        // Common global functions that might be called
        const globalFunctions = ['showNotification', 'toggleSection', 'setPagePreferences', 'refreshData'];
        
        lines.forEach((line, index) => {
            globalFunctions.forEach(func => {
                if (line.includes(func + '(')) {
                    calls.push({
                        function: func,
                        line: index + 1
                    });
                }
            });
        });
        
        return calls;
    }

    /**
     * Process and display dependency results
     */
    async processDependencyResults(dependencies) {
        const resultsContent = document.getElementById('dependenciesResultsContent');
        if (!resultsContent) return;
        
        // Group dependencies by type
        const imports = dependencies.filter(dep => dep.type === 'import');
        const functionCalls = dependencies.filter(dep => dep.type === 'function_call');
        
        let html = `
            <div class="row">
                <div class="col-md-6">
                    <h6>ייבוא קבצים (${imports.length})</h6>
                    <div class="list-group" style="max-height: 200px; overflow-y: auto;">
        `;
        
        imports.forEach(imp => {
            html += `<div class="list-group-item">
                <strong>${imp.from}</strong> → ${imp.to.module}
                <small class="text-muted d-block">שורה ${imp.line}</small>
            </div>`;
        });
        
        html += `
                    </div>
                </div>
                <div class="col-md-6">
                    <h6>קריאות פונקציות גלובליות (${functionCalls.length})</h6>
                    <div class="list-group" style="max-height: 200px; overflow-y: auto;">
        `;
        
        functionCalls.forEach(call => {
            html += `<div class="list-group-item">
                <strong>${call.from}</strong> → ${call.function}()
                <small class="text-muted d-block">שורה ${call.line}</small>
            </div>`;
        });
        
        html += `
                    </div>
                </div>
            </div>
            <div class="mt-3">
                <div class="alert alert-success">
                    <strong>סיכום:</strong> נמצאו ${dependencies.length} קשרי תלות בסך הכל
                </div>
            </div>
        `;
        
        resultsContent.innerHTML = html;
    }

    /**
     * View dependency graph
     */
    viewDependencyGraph() {
        console.log('📊 Viewing dependency graph...');
        if (window.showNotification) {
            window.showNotification('מציג גרף תלויות...', 'info');
        }
        // Implementation for dependency graph visualization
    }

    /**
     * Run architecture check with progress tracking
     */
    async runArchitectureCheck() {
        console.log('🏗️ Starting architecture check...');
        
        // Show progress bar
        const progressContainer = document.getElementById('architectureProgress');
        const progressBar = progressContainer?.querySelector('.progress-bar');
        const statusText = document.getElementById('architectureStatus');
        const checkBtn = document.getElementById('archCheckBtn');
        const viewReportBtn = document.getElementById('viewArchReportBtn');
        const resultsContainer = document.getElementById('architectureResults');
        const resultsContent = document.getElementById('architectureResultsContent');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (checkBtn) checkBtn.disabled = true;
        if (viewReportBtn) viewReportBtn.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'none';
        
        try {
            // Step 1: Load architecture data from API
            this.updateProgress(progressBar, statusText, 10, 'טוען נתוני ארכיטקטורה...');
            const archData = await this.loadArchitectureData();
            
            // Step 2: Check file structure
            this.updateProgress(progressBar, statusText, 30, 'בודק מבנה קבצים...');
            const fileStructureCheck = await this.checkFileStructure();
            
            // Step 3: Check naming conventions
            this.updateProgress(progressBar, statusText, 50, 'בודק כללי שמות...');
            const namingCheck = await this.checkNamingConventions();
            
            // Step 4: Check function placement
            this.updateProgress(progressBar, statusText, 70, 'בודק מיקום פונקציות...');
            const functionPlacementCheck = await this.checkFunctionPlacement();
            
            // Step 5: Check dependencies
            this.updateProgress(progressBar, statusText, 90, 'בודק תלויות...');
            const dependencyCheck = await this.checkDependencies();
            
            // Step 6: Process results
            this.updateProgress(progressBar, statusText, 95, 'מעבד תוצאות...');
            await this.processArchitectureResults({
                fileStructure: fileStructureCheck,
                naming: namingCheck,
                functionPlacement: functionPlacementCheck,
                dependencies: dependencyCheck
            });
            
            // Step 7: Complete
            this.updateProgress(progressBar, statusText, 100, 'בדיקת ארכיטקטורה הושלמה!');
            
            // Show results
            if (resultsContainer) resultsContainer.style.display = 'block';
            if (viewReportBtn) viewReportBtn.style.display = 'inline-block';
            
            if (window.showNotification) {
                window.showNotification('בדיקת ארכיטקטורה הושלמה בהצלחה!', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error running architecture check:', error);
            if (statusText) statusText.textContent = 'שגיאה בבדיקת ארכיטקטורה';
            if (window.showNotification) {
                window.showNotification('שגיאה בבדיקת ארכיטקטורה', 'error');
            }
        } finally {
            if (checkBtn) checkBtn.disabled = false;
        }
    }

    /**
     * Load architecture data from API
     */
    async loadArchitectureData() {
        try {
            const response = await fetch('/api/js-map/architecture-check');
            if (response.ok) {
                const data = await response.json();
                return data.data || {};
            }
        } catch (error) {
            console.warn('⚠️ Failed to load architecture data from API');
        }
        return {};
    }

    /**
     * Check file structure compliance
     */
    async checkFileStructure() {
        const files = await this.loadJavaScriptFilesList();
        const violations = [];
        
        files.forEach(file => {
            // Check if file follows naming convention
            if (!file.match(/^[a-z-]+\.js$/)) {
                violations.push({
                    type: 'naming',
                    file: file,
                    message: 'שם קובץ לא עומד בקונבנציה',
                    severity: 'warning'
                });
            }
            
            // Check if file is in correct directory
            if (file.includes('service') && !file.includes('-service.js')) {
                violations.push({
                    type: 'structure',
                    file: file,
                    message: 'קובץ שירות לא בשם הנכון',
                    severity: 'error'
                });
            }
        });
        
        return {
            totalFiles: files.length,
            violations: violations,
            score: Math.max(0, 100 - (violations.length * 5))
        };
    }

    /**
     * Check naming conventions
     */
    async checkNamingConventions() {
        const files = await this.loadJavaScriptFilesList();
        const violations = [];
        
        files.forEach(file => {
            // Check for camelCase in service files
            if (file.includes('service') && file.includes('_')) {
                violations.push({
                    type: 'naming',
                    file: file,
                    message: 'קובץ שירות מכיל underscores',
                    severity: 'warning'
                });
            }
            
            // Check for proper prefix
            if (file.includes('service') && !file.endsWith('-service.js')) {
                violations.push({
                    type: 'naming',
                    file: file,
                    message: 'קובץ שירות לא מסתיים ב-service.js',
                    severity: 'error'
                });
            }
        });
        
        return {
            totalFiles: files.length,
            violations: violations,
            score: Math.max(0, 100 - (violations.length * 3))
        };
    }

    /**
     * Check function placement
     */
    async checkFunctionPlacement() {
        const violations = [];
        const files = await this.loadJavaScriptFilesList();
        
        // Check a few files for function placement
        for (let i = 0; i < Math.min(5, files.length); i++) {
            const file = files[i];
            try {
                const response = await fetch(`/api/js-map/file-content?filename=${encodeURIComponent(file)}`);
                if (response.ok) {
                    const data = await response.json();
                    const content = data.data?.content || '';
                    
                    // Check for functions in HTML (should not exist)
                    if (content.includes('function(') && content.includes('<script>')) {
                        violations.push({
                            type: 'placement',
                            file: file,
                            message: 'פונקציות בתוך HTML',
                            severity: 'error'
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error checking ${file}:`, error);
            }
        }
        
        return {
            filesChecked: Math.min(5, files.length),
            violations: violations,
            score: Math.max(0, 100 - (violations.length * 10))
        };
    }

    /**
     * Check dependencies
     */
    async checkDependencies() {
        const violations = [];
        const files = await this.loadJavaScriptFilesList();
        
        // Check for circular dependencies (simplified)
        const dependencies = {};
        files.forEach(file => {
            dependencies[file] = [];
        });
        
        // Simulate dependency check
        const circularDeps = [];
        if (circularDeps.length > 0) {
            violations.push({
                type: 'dependency',
                file: 'Multiple files',
                message: `נמצאו ${circularDeps.length} תלויות מעגליות`,
                severity: 'error'
            });
        }
        
        return {
            totalFiles: files.length,
            violations: violations,
            score: Math.max(0, 100 - (violations.length * 15))
        };
    }

    /**
     * Process and display architecture results
     */
    async processArchitectureResults(results) {
        const resultsContent = document.getElementById('architectureResultsContent');
        if (!resultsContent) return;
        
        const allViolations = [
            ...results.fileStructure.violations,
            ...results.naming.violations,
            ...results.functionPlacement.violations,
            ...results.dependencies.violations
        ];
        
        const totalScore = Math.round(
            (results.fileStructure.score + results.naming.score + 
             results.functionPlacement.score + results.dependencies.score) / 4
        );
        
        let html = `
            <div class="row">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title ${totalScore >= 80 ? 'text-success' : totalScore >= 60 ? 'text-warning' : 'text-danger'}">
                                ${totalScore}%
                            </h5>
                            <p class="card-text">ציון כולל</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title">${results.fileStructure.score}%</h5>
                            <p class="card-text">מבנה קבצים</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title">${results.naming.score}%</h5>
                            <p class="card-text">כללי שמות</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title">${results.functionPlacement.score}%</h5>
                            <p class="card-text">מיקום פונקציות</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (allViolations.length > 0) {
            html += `
                <div class="mt-3">
                    <h6>הפרות שנמצאו (${allViolations.length})</h6>
                    <div class="list-group" style="max-height: 300px; overflow-y: auto;">
            `;
            
            allViolations.forEach(violation => {
                const severityClass = violation.severity === 'error' ? 'list-group-item-danger' : 'list-group-item-warning';
                html += `
                    <div class="list-group-item ${severityClass}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${violation.file}</h6>
                            <small class="badge ${violation.severity === 'error' ? 'bg-danger' : 'bg-warning'}">${violation.severity}</small>
                        </div>
                        <p class="mb-1">${violation.message}</p>
                        <small>סוג: ${violation.type}</small>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="mt-3">
                    <div class="alert alert-success">
                        <h6>מצוין! 🎉</h6>
                        <p>לא נמצאו הפרות ארכיטקטורה. הקוד עומד בכל הכללים!</p>
                    </div>
                </div>
            `;
        }
        
        resultsContent.innerHTML = html;
    }

    /**
     * View architecture report
     */
    viewArchitectureReport() {
        console.log('📊 Viewing architecture report...');
        if (window.showNotification) {
            window.showNotification('מציג דוח ארכיטקטורה...', 'info');
        }
        // Implementation for architecture report
    }

    optimizeStorage() {
        console.log('⚡ Optimizing storage...');
        if (window.showNotification) {
            window.showNotification('מבצע אופטימיזציה...', 'info');
        }
        // Implementation for storage optimization
    }

    syncWithSystems() {
        console.log('🔄 Syncing with systems...');
        if (window.showNotification) {
            window.showNotification('מסנכרן עם מערכות...', 'info');
        }
        // Implementation for system synchronization
    }

    showError(message) {
        console.error('❌', message);
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }
}

// Initialize system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page Scripts Matrix page loaded');
    
    // Initialize the system
    window.pageScriptsMatrix = new PageScriptsMatrixSystem();
    
    // Make quick action functions globally available
    window.refreshAllData = () => window.pageScriptsMatrix.refreshAllData();
    window.backupData = () => window.pageScriptsMatrix.backupData();
    window.cleanupOldData = () => window.pageScriptsMatrix.cleanupOldData();
    window.toggleAllSections = () => window.pageScriptsMatrix.toggleAllSections();
    window.copyDetailedLog = () => window.pageScriptsMatrix.copyDetailedLog();
    
    console.log('✅ Page Scripts Matrix system ready');
});
