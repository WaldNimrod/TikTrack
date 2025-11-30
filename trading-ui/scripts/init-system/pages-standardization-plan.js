/**
 * Pages Standardization Plan - TikTrack Frontend
 * ===============================================
 * 
 * רשימת עמודים מסודרת לסטנדרטיזציה מול מערכת הניטור
 * 
 * Features:
 * - רשימת כל העמודים במערכת
 * - סיווג לפי סוג (main, settings, management, test)
 * - סטטוס ניטור לכל עמוד
 * - תוכנית עבודה מסודרת
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/MONITORING_SYSTEM_V2.md
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

if (window.Logger) {
  window.Logger.info('📋 Loading Pages Standardization Plan...', { page: 'pages-standardization-plan' });
}

/**
 * Pages Standardization Plan Class
 */
class PagesStandardizationPlan {
    constructor() {
        this.pages = this.initializePagesList();
        this.results = {};
    }

    /**
     * Initialize pages list from PAGE_CONFIGS
     */
    initializePagesList() {
        const pages = [];
        
        // Get pages from PAGE_CONFIGS
        if (window.PAGE_CONFIGS) {
            Object.keys(window.PAGE_CONFIGS).forEach(pageName => {
                const config = window.PAGE_CONFIGS[pageName];
                
                // Skip test pages and backup pages
                if (pageName.includes('test') || 
                    pageName.includes('backup') || 
                    pageName.includes('smart') ||
                    pageName.includes('debug')) {
                    return;
                }

                // Determine page category
                let category = 'main';
                if (pageName.includes('management') || pageName.includes('monitor') || pageName.includes('dashboard')) {
                    category = 'management';
                } else if (pageName === 'preferences' || pageName === 'constraints' || pageName === 'designs') {
                    category = 'settings';
                } else if (pageName.includes('test') || pageName.includes('debug')) {
                    category = 'test';
                }

                pages.push({
                    name: pageName,
                    displayName: config.name || pageName,
                    category: category,
                    pageType: config.pageType || 'general',
                    packages: config.packages || [],
                    requiredGlobals: config.requiredGlobals || [],
                    requiresFilters: config.requiresFilters || false,
                    requiresValidation: config.requiresValidation || false,
                    requiresTables: config.requiresTables || false,
                    description: config.description || '',
                    lastModified: config.lastModified || 'unknown',
                    status: 'pending', // pending, tested, fixed, verified
                    issues: [],
                    priority: this.calculatePriority(config, category)
                });
            });
        } else {
            // Fallback: common pages
            const commonPages = [
                { name: 'index', category: 'main', priority: 'high' },
                { name: 'trades', category: 'main', priority: 'high' },
                { name: 'trade_plans', category: 'main', priority: 'high' },
                { name: 'executions', category: 'main', priority: 'high' },
                { name: 'cash_flows', category: 'main', priority: 'high' },
                { name: 'trading_accounts', category: 'main', priority: 'high' },
                { name: 'tickers', category: 'main', priority: 'high' },
                { name: 'alerts', category: 'main', priority: 'high' },
                { name: 'notes', category: 'main', priority: 'high' },
                { name: 'research', category: 'main', priority: 'medium' },
                { name: 'preferences', category: 'settings', priority: 'high' },
                { name: 'tag-management', category: 'management', priority: 'medium' },
                { name: 'data_import', category: 'management', priority: 'medium' }
            ];

            commonPages.forEach(page => {
                pages.push({
                    ...page,
                    displayName: page.name,
                    pageType: 'general',
                    packages: [],
                    requiredGlobals: [],
                    requiresFilters: false,
                    requiresValidation: false,
                    requiresTables: false,
                    description: '',
                    lastModified: 'unknown',
                    status: 'pending',
                    issues: []
                });
            });
        }

        // Sort by priority and name
        return pages.sort((a, b) => {
            const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Calculate priority based on page config and category
     */
    calculatePriority(config, category) {
        // High priority: main pages with many dependencies
        if (category === 'main' && config.packages && config.packages.length > 5) {
            return 'high';
        }
        
        // High priority: preferences and critical settings
        if (category === 'settings') {
            return 'high';
        }
        
        // Medium priority: management pages
        if (category === 'management') {
            return 'medium';
        }
        
        // Low priority: test pages
        if (category === 'test') {
            return 'low';
        }
        
        return 'medium';
    }

    /**
     * Get pages by category
     */
    getPagesByCategory(category) {
        return this.pages.filter(page => page.category === category);
    }

    /**
     * Get pages by priority
     */
    getPagesByPriority(priority) {
        return this.pages.filter(page => page.priority === priority);
    }

    /**
     * Get pages by status
     */
    getPagesByStatus(status) {
        return this.pages.filter(page => page.status === status);
    }

    /**
     * Display pages list
     */
    displayPagesList() {
        const html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-list"></i> רשימת עמודים לסטנדרטיזציה</h6>
                <p><strong>סה"כ עמודים:</strong> ${this.pages.length}</p>
                <p><strong>עמודים ראשיים:</strong> ${this.getPagesByCategory('main').length}</p>
                <p><strong>עמודים מנהליים:</strong> ${this.getPagesByCategory('management').length}</p>
                <p><strong>עמודים הגדרות:</strong> ${this.getPagesByCategory('settings').length}</p>
                <p><strong>עדיפות גבוהה:</strong> ${this.getPagesByPriority('high').length}</p>
                <p><strong>עדיפות בינונית:</strong> ${this.getPagesByPriority('medium').length}</p>
                <p><strong>עדיפות נמוכה:</strong> ${this.getPagesByPriority('low').length}</p>
            </div>

            <div class="mb-3">
                <label><strong>סינון:</strong></label>
                <select id="pagesFilter" class="form-select" onchange="pagesStandardizationPlan.filterPages()">
                    <option value="all">כל העמודים</option>
                    <option value="main">עמודים ראשיים</option>
                    <option value="management">עמודים מנהליים</option>
                    <option value="settings">עמודים הגדרות</option>
                    <option value="high">עדיפות גבוהה</option>
                    <option value="medium">עדיפות בינונית</option>
                    <option value="low">עדיפות נמוכה</option>
                    <option value="pending">ממתין לבדיקה</option>
                    <option value="tested">נבדק</option>
                    <option value="fixed">תוקן</option>
                    <option value="verified">אומת</option>
                </select>
            </div>

            <div id="pagesListContainer" style="max-height: 600px; overflow-y: auto;">
                ${this.renderPagesList(this.pages)}
            </div>

            <div class="text-center mt-3">
                <button class="btn btn-primary" onclick="pagesStandardizationPlan.runMonitoringOnAllPages()">
                    <i class="fas fa-play"></i> הרץ ניטור על כל העמודים
                </button>
                <button class="btn btn-secondary" onclick="pagesStandardizationPlan.exportPagesList()">
                    <i class="fas fa-download"></i> ייצא רשימת עמודים
                </button>
            </div>
        `;

        if (typeof window.showDetailsModal === 'function') {
            window.showDetailsModal('📋 רשימת עמודים לסטנדרטיזציה', html);
        } else {
            console.log('Pages Standardization Plan:', this.pages);
        }
    }

    /**
     * Render pages list
     */
    renderPagesList(pages) {
        return `
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>עמוד</th>
                        <th>קטגוריה</th>
                        <th>עדיפות</th>
                        <th>חבילות</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    ${pages.map(page => `
                        <tr>
                            <td>
                                <strong>${page.displayName}</strong><br>
                                <small class="text-muted">${page.name}</small>
                            </td>
                            <td>
                                <span class="badge bg-info">${page.category}</span>
                            </td>
                            <td>
                                <span class="badge ${page.priority === 'high' ? 'bg-danger' : page.priority === 'medium' ? 'bg-warning' : 'bg-secondary'}">
                                    ${page.priority}
                                </span>
                            </td>
                            <td>
                                <small>${page.packages.length} חבילות</small>
                            </td>
                            <td>
                                <span class="badge ${this.getStatusBadgeClass(page.status)}">${page.status}</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="pagesStandardizationPlan.runMonitoringOnPage('${page.name}')">
                                    <i class="fas fa-search"></i> בדוק
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-secondary',
            'tested': 'bg-info',
            'fixed': 'bg-success',
            'verified': 'bg-primary'
        };
        return classes[status] || 'bg-secondary';
    }

    /**
     * Filter pages
     */
    filterPages() {
        // Use DataCollectionService to get value if available
        let filter;
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
          filter = window.DataCollectionService.getValue('pagesFilter', 'text', 'all');
        } else {
          const filterEl = document.getElementById('pagesFilter');
          filter = filterEl ? filterEl.value : 'all';
        }
        let filteredPages = [];

        if (filter === 'all') {
            filteredPages = this.pages;
        } else if (['main', 'management', 'settings'].includes(filter)) {
            filteredPages = this.getPagesByCategory(filter);
        } else if (['high', 'medium', 'low'].includes(filter)) {
            filteredPages = this.getPagesByPriority(filter);
        } else if (['pending', 'tested', 'fixed', 'verified'].includes(filter)) {
            filteredPages = this.getPagesByStatus(filter);
        }

        document.getElementById('pagesListContainer').innerHTML = this.renderPagesList(filteredPages);
    }

    /**
     * Run monitoring on single page
     */
    async runMonitoringOnPage(pageName) {
        const page = this.pages.find(p => p.name === pageName);
        if (!page) {
            if (typeof showNotification === 'function') {
                showNotification(`עמוד ${pageName} לא נמצא`, 'error');
            }
            return;
        }

        // Check if we're on the correct page
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        
        if (currentPage !== pageName) {
            // Navigate to the page
            window.location.href = `/${pageName}.html`;
            return;
        }

        // Get page config
        const pageConfig = window.PAGE_CONFIGS?.[pageName];
        if (!pageConfig) {
            if (typeof showNotification === 'function') {
                showNotification(`לא נמצא קונפיגורציה לעמוד ${pageName}`, 'error');
            }
            return;
        }

        // Run monitoring check
        if (typeof window.runDetailedPageScan === 'undefined') {
            if (typeof showNotification === 'function') {
                showNotification('מערכת הניטור לא זמינה', 'error');
            }
            return;
        }

        try {
            const scanResults = await window.runDetailedPageScan(pageName, pageConfig);
            
            // Update page status
            page.status = scanResults.summary?.totalIssues === 0 ? 'verified' : 'tested';
            page.issues = scanResults.mismatchDetails || [];
            
            // Save results
            this.results[pageName] = scanResults;
            
            // Display results
            if (typeof window.initSystemCheck !== 'undefined' && window.initSystemCheck.displayResults) {
                window.initSystemCheck.displayResults(scanResults, pageName);
            } else {
                console.log('Monitoring results for', pageName, ':', scanResults);
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error(`Error running monitoring on ${pageName}:`, error, { page: 'pages-standardization-plan' });
            }
            if (typeof showNotification === 'function') {
                showNotification(`שגיאה בבדיקת ${pageName}: ${error.message}`, 'error');
            }
        }
    }

    /**
     * Run monitoring on all pages
     */
    async runMonitoringOnAllPages() {
        if (typeof window.allPagesMonitoringTest !== 'undefined') {
            // Use existing all-pages monitoring test
            await window.allPagesMonitoringTest.runAllPagesTest();
        } else {
            if (typeof showNotification === 'function') {
                showNotification('מערכת הניטור האוטומטית לא זמינה', 'error');
            }
        }
    }

    /**
     * Export pages list
     */
    exportPagesList() {
        const data = {
            timestamp: new Date().toISOString(),
            totalPages: this.pages.length,
            pages: this.pages.map(page => ({
                name: page.name,
                displayName: page.displayName,
                category: page.category,
                priority: page.priority,
                status: page.status,
                packages: page.packages,
                issues: page.issues.length
            }))
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pages-standardization-plan-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('רשימת עמודים יוצאה בהצלחה', 'success');
        }
    }
}

// Create global instance
const pagesStandardizationPlan = new PagesStandardizationPlan();

// Export globally
window.pagesStandardizationPlan = pagesStandardizationPlan;

if (window.Logger) {
  window.Logger.info('✅ Pages Standardization Plan loaded successfully', { page: 'pages-standardization-plan' });
}


