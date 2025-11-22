/**
 * Unified Log Display - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the unified log display component for TikTrack.
 * Provides flexible and responsive log display with advanced filtering and export functionality.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_LOG_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Unified Log Display Component - TikTrack
 * ========================================
 *
 * קומפוננט תצוגת לוג גמיש וכללי לכל סוגי הלוגים במערכת
 * עם עיצוב אחיד ומרכזי לפי ITCSS
 *
 * FEATURES:
 * =========
 * 1. Flexible Display - תצוגה גמישה לכל סוג לוג
 * 2. Unified Design - עיצוב אחיד ומרכזי
 * 3. Advanced Filtering - סינון מתקדם
 * 4. Export Functionality - פונקציונליות ייצוא
 * 5. Real-time Updates - עדכונים בזמן אמת
 * 6. Responsive Design - עיצוב רספונסיבי
 * 7. RTL Support - תמיכה מלאה בעברית
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== UNIFIED LOG DISPLAY COMPONENT =====

class UnifiedLogDisplay {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            logType: null,
            displayConfig: 'default',
            autoLoad: true,
            showLoading: true,
            ...options
        };
        
        this.currentData = [];
        this.currentFilters = {};
        this.currentSort = { by: null, order: 'desc' };
        this.currentPagination = { page: 1, itemsPerPage: 3 }; // Will be updated from preferences
        this.isLoading = false;
        this.paginationInstance = null;
        this.autoRefreshInterval = null;
        
        // Initialize if container exists
        if (this.container) {
            this.initialize();
        } else {
            console.warn(`⚠️ Container ${containerId} not found`);
        }
    }

    /**
     * Initialize the display component
     */
    /**
     * Initialize the log display component
     * @function initialize
     * @async
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            console.log(`🚀 Initializing UnifiedLogDisplay for container: ${this.containerId}`);
            
            // Check if UnifiedLogManager is available
            if (!window.UnifiedLogManager) {
                throw new Error('UnifiedLogManager not available');
            }

            // Initialize LogManager if needed
            if (!window.UnifiedLogManager.initialized) {
                await window.UnifiedLogManager.initialize();
            }

            // Load pagination size from preferences
            await this.loadPaginationPreferences();
            
            // Render the component
            this.render();
            
            // Load data if autoLoad is enabled
            if (this.options.autoLoad && this.options.logType) {
                await this.loadData();
            }

            console.log(`✅ UnifiedLogDisplay initialized successfully`);
        } catch (error) {
            console.error('❌ Failed to initialize UnifiedLogDisplay:', error);
            this.renderError(error.message);
        }
    }

    /**
     * Load pagination preferences from user settings
     */
    /**
     * Load pagination preferences
     * @function loadPaginationPreferences
     * @async
     * @returns {Promise<void>}
     */
    async loadPaginationPreferences() {
        try {
            if (window.getPaginationSize) {
                const paginationSize = await window.getPaginationSize('logs');
                this.currentPagination.itemsPerPage = paginationSize;
                console.log(`📊 Loaded pagination size from preferences: ${paginationSize}`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load pagination preferences, using default:', error);
        }
    }

    /**
     * Render the display component
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="unified-log-display" data-log-type="${this.options.logType || ''}">
                <!-- Header -->
                <div class="log-display-header d-flex justify-content-between align-items-center">
                    <div class="log-display-title">
                        <span class="title-text">📊 תצוגת לוג</span>
                    </div>
                    <div class="stats-container d-flex gap-3">
                        <div class="stat-item">
                            <span class="stat-label">סה"כ רשומות:</span>
                            <span class="stat-value total-count">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">מוצגות:</span>
                            <span class="stat-value displayed-count">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">עודכן:</span>
                            <span class="stat-value last-updated">-</span>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="log-display-filters">
                    <div class="filters-container d-flex flex-wrap align-items-end gap-2">
                        <div class="log-display-controls d-flex gap-1 me-2">
                            <button class="btn btn-icon log-refresh-btn" title="רענון">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="btn btn-icon log-export-btn" title="ייצוא">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-icon log-config-btn" title="הגדרות">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                        <div class="filters-wrapper me-auto">
                            <div class="filter-group">
                                <label class="filter-label">חיפוש:</label>
                                <input type="text" class="form-control filter-search" placeholder="חפש...">
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">סוג:</label>
                                <select class="form-select filter-type">
                                    <option value="">כל הסוגים</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">קטגוריה:</label>
                                <select class="form-select filter-category">
                                    <option value="">כל הקטגוריות</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">עמוד/ממשק:</label>
                                <select class="form-select filter-page">
                                    <option value="">כל העמודים</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">טווח זמן:</label>
                                <select class="form-select filter-time-range">
                                    <option value="all">כל הזמנים</option>
                                    <option value="last15min">15 דקות אחרונות</option>
                                    <option value="lastHour">שעה אחרונה</option>
                                    <option value="last6hours">6 שעות אחרונות</option>
                                    <option value="lastDay">יום אחרון</option>
                                    <option value="last3days">3 ימים אחרונים</option>
                                    <option value="lastWeek">שבוע אחרון</option>
                                    <option value="last2weeks">2 שבועות אחרונים</option>
                                    <option value="lastMonth">חודש אחרון</option>
                                    <option value="last3months">3 חודשים אחרונים</option>
                                    <option value="lastYear">שנה אחרונה</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="filter-actions d-flex justify-content-end gap-2 mt-2">
                        <button class="btn btn-icon filter-apply" title="החל סינון">
                            <i class="fas fa-filter"></i>
                        </button>
                        <button class="btn btn-icon filter-clear" title="נקה">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>


                <!-- Loading -->
                <div class="log-display-loading" style="display: none;">
                    <div class="loading-container">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">טוען...</span>
                        </div>
                        <span class="loading-text">טוען נתונים...</span>
                    </div>
                </div>

                <!-- Error -->
                <div class="log-display-error" style="display: none;">
                    <div class="error-container">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                        <span class="error-message">שגיאה בטעינת הנתונים</span>
                    </div>
                </div>

                <!-- Empty -->
                <div class="log-display-empty" style="display: none;">
                    <div class="empty-container">
                        <i class="fas fa-database text-muted"></i>
                        <div class="empty-message">
                            <h5>אין נתונים להצגה</h5>
                            <p class="text-muted">לא נמצאו רשומות במסד הנתונים עבור סוג הלוג הזה</p>
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i>
                                הנתונים יופיעו כאן לאחר שייווצרו במערכת
                            </small>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="log-display-content">
                    <div class="log-table-container">
                        <table class="table table-striped table-hover log-table" id="unified-log-table">
                            <thead class="log-table-header">
                                <tr>
                                    <th class="sortable" data-sort="timestamp">
                                        זמן ↕️
                                    </th>
                                    <th class="sortable" data-sort="type">
                                        סוג ↕️
                                    </th>
                                    <th class="sortable" data-sort="title">
                                        כותרת ↕️
                                    </th>
                                    <th class="sortable" data-sort="message">
                                        הודעה ↕️
                                    </th>
                                    <th class="sortable" data-sort="category">
                                        קטגוריה ↕️
                                    </th>
                                    <th class="sortable" data-sort="page">
                                        עמוד/ממשק ↕️
                                    </th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody class="log-table-body">
                                <!-- Data rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="log-display-pagination" style="display: none;">
                    <nav aria-label="ניווט בדפים">
                        <ul class="pagination pagination-sm justify-content-center">
                            <li class="page-item disabled">
                                <a class="page-link" href="#" data-action="prev">← הקודם</a>
                            </li>
                            <li class="page-item active">
                                <a class="page-link" href="#" data-page="1">1</a>
                            </li>
                            <li class="page-item disabled">
                                <a class="page-link" href="#" data-action="next">הבא →</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (!this.container) return;

        // Refresh button
        const refreshBtn = this.container.querySelector('.log-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Export button
        const exportBtn = this.container.querySelector('.log-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportModal());
        }

        // Config button
        const configBtn = this.container.querySelector('.log-config-btn');
        if (configBtn) {
            configBtn.addEventListener('click', () => this.showConfigModal());
        }

        // Filter controls
        const applyBtn = this.container.querySelector('.filter-apply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }

        const clearBtn = this.container.querySelector('.filter-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        // Search input
        const searchInput = this.container.querySelector('.filter-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.loadData();
            }, 300));
        }

        // Sortable headers
        const sortableHeaders = this.container.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                const currentOrder = this.currentSort.by === sortBy ? this.currentSort.order : 'desc';
                const newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
                this.setSort(sortBy, newOrder);
            });
        });

        // Pagination
        const paginationLinks = this.container.querySelectorAll('.pagination .page-link');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = link.dataset.action;
                const page = parseInt(link.dataset.page);
                
                if (action === 'prev' && this.currentPagination.page > 1) {
                    this.setPage(this.currentPagination.page - 1);
                } else if (action === 'next') {
                    this.setPage(this.currentPagination.page + 1);
                } else if (page) {
                    this.setPage(page);
                }
            });
        });
    }

    /**
     * Load data from LogManager
     */
    /**
     * Load log data
     * @function loadData
     * @async
     * @returns {Promise<void>}
     */
    async loadData() {
        if (!this.options.logType || !window.UnifiedLogManager) return;

        try {
            this.showLoading();
            this.isLoading = true;

            const logData = await window.UnifiedLogManager.getLogData(this.options.logType, {
                filters: this.currentFilters,
                sortBy: this.currentSort.by,
                sortOrder: this.currentSort.order,
                pagination: this.currentPagination
            });

            this.currentData = logData.data;
            this.renderData(logData);
            this.updateStats(logData);
            
            this.isLoading = false;
            this.hideLoading();
        } catch (error) {
            console.error('❌ Failed to load log data:', error);
            this.renderError(error.message);
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Render data in the table
     */
    renderData(logData) {
        // Store the data for pagination and filters
        this.currentData = logData.data || [];
        this.allData = logData.data || []; // Store all data for filter options
        
        if (!this.currentData || this.currentData.length === 0) {
            this.showEmpty();
            return;
        }

        // Update pagination with new data
        this.updatePagination();
        
        // Get current page data from pagination
        const currentPageData = this.paginationInstance ? 
            this.paginationInstance.getCurrentPageData() : this.currentData.slice(0, this.currentPagination.itemsPerPage);
        
        // Render the current page data
        this.renderTableData(currentPageData);
        
        this.showContent();
    }

    /**
     * Create data row
     */
    createDataRow(item) {
        const row = document.createElement('tr');
        
        // Format timestamp - handle different timestamp formats
        let timestamp;
        if (item.timestamp) {
            timestamp = this.formatTimestamp(item.timestamp);
        } else if (item.started_at) {
            timestamp = this.formatTimestamp(item.started_at);
        } else {
            timestamp = '-';
        }
        
        // Format type with icon and color - handle different type formats
        let typeDisplay;
        if (item.type || item.level) {
            typeDisplay = this.formatType(item.type || item.level);
        } else if (item.status) {
            typeDisplay = this.formatType(item.status);
        } else {
            typeDisplay = '-';
        }
        
        // Format title - handle different title formats
        let title;
        if (item.title) {
            title = item.title;
        } else if (item.task_name) {
            title = item.task_name;
        } else if (item.message) {
            title = item.message;
        } else {
            title = '-';
        }
        
        // Format message (truncate if too long) - handle different message formats
        let message;
        if (item.message) {
            message = item.message;
        } else if (item.error) {
            message = item.error;
        } else if (item.result && typeof item.result === 'object') {
            message = JSON.stringify(item.result);
        } else if (item.result) {
            message = item.result;
        } else {
            message = '-';
        }
        const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message;

        // Format category with icon and color - handle different category formats
        let categoryDisplay;
        if (item.category) {
            categoryDisplay = this.formatCategory(item.category);
        } else if (item.task_name) {
            categoryDisplay = this.formatCategory('background_task');
        } else {
            categoryDisplay = '-';
        }
        
        // Format page with icon - handle different page formats
        let pageDisplay;
        if (item.page) {
            pageDisplay = this.formatPage(item.page);
        } else if (item.task_name) {
            pageDisplay = this.formatPage('background_tasks');
        } else {
            pageDisplay = '-';
        }

        row.innerHTML = `
            <td class="timestamp-cell">${timestamp}</td>
            <td class="type-cell">${typeDisplay}</td>
            <td class="title-cell">${title}</td>
            <td class="message-cell" title="${message}">${truncatedMessage}</td>
            <td class="category-cell">${categoryDisplay}</td>
            <td class="page-cell">${pageDisplay}</td>
            <td class="actions-cell">
                <button data-button-type="VIEW" data-variant="small" data-text="" title="פרטים"></button>
                <button data-button-type="COPY" data-variant="small" data-text="" title="העתקה"></button>
            </td>
        `;

        // Add event listeners for action buttons
        const viewBtn = row.querySelector('.view-details-btn');
        const copyBtn = row.querySelector('.copy-btn');
        
        // Debug: Check button styling
        setTimeout(() => {
            console.log('🔍 DEBUG: Action buttons analysis for row');
            console.log('📊 View button:', {
                element: viewBtn,
                classes: viewBtn?.className,
                computedStyle: viewBtn ? window.getComputedStyle(viewBtn) : null,
                width: viewBtn?.offsetWidth,
                height: viewBtn?.offsetHeight,
                display: viewBtn ? window.getComputedStyle(viewBtn).display : null,
                position: viewBtn ? viewBtn.getBoundingClientRect() : null
            });
            console.log('📊 Copy button:', {
                element: copyBtn,
                classes: copyBtn?.className,
                computedStyle: copyBtn ? window.getComputedStyle(copyBtn) : null,
                width: copyBtn?.offsetWidth,
                height: copyBtn?.offsetHeight,
                display: copyBtn ? window.getComputedStyle(copyBtn).display : null,
                position: copyBtn ? copyBtn.getBoundingClientRect() : null
            });
            
            // Check if btn-action class is applied
            if (viewBtn) {
                console.log('🎯 View button has btn-action class:', viewBtn.classList.contains('btn-action'));
                console.log('🎯 View button computed styles:', {
                    width: window.getComputedStyle(viewBtn).width,
                    height: window.getComputedStyle(viewBtn).height,
                    padding: window.getComputedStyle(viewBtn).padding,
                    display: window.getComputedStyle(viewBtn).display,
                    alignItems: window.getComputedStyle(viewBtn).alignItems,
                    justifyContent: window.getComputedStyle(viewBtn).justifyContent
                });
            }
            
            // Check for conflicting styles
            const allButtons = document.querySelectorAll('.btn-action');
            console.log('🔍 All btn-action buttons found:', allButtons.length);
            allButtons.forEach((btn, i) => {
                const rect = btn.getBoundingClientRect();
                const style = window.getComputedStyle(btn);
                console.log(`   Button ${i+1}:`, {
                    width: rect.width,
                    height: rect.height,
                    classes: btn.className,
                    display: style.display,
                    position: style.position,
                    zIndex: style.zIndex
                });
            });
            
            // Check for CSS conflicts
            const testBtn = document.createElement('button');
            testBtn.className = 'btn btn-action';
            testBtn.innerHTML = '<i class="fas fa-info"></i>';
            testBtn.style.position = 'absolute';
            testBtn.style.top = '-1000px';
            testBtn.style.left = '-1000px';
            document.body.appendChild(testBtn);
            
            setTimeout(() => {
                const testStyle = window.getComputedStyle(testBtn);
                console.log('🧪 Test button styles:', {
                    width: testStyle.width,
                    height: testStyle.height,
                    padding: testStyle.padding,
                    display: testStyle.display,
                    alignItems: testStyle.alignItems,
                    justifyContent: testStyle.justifyContent,
                    border: testStyle.border,
                    borderRadius: testStyle.borderRadius
                });
                document.body.removeChild(testBtn);
            }, 100);
            
        }, 100);
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => this.showItemDetails(item));
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyItem(item));
        }

        return row;
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return '-';
        
        const date = new Date(timestamp);
        return date.toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Format type with icon and color
     */
    formatType(type) {
        if (!type) return '<span class="badge bg-secondary">לא ידוע</span>';
        
        const typeConfig = {
            'success': { emoji: '✅', color: 'success', label: 'הצלחה' },
            'error': { emoji: '❌', color: 'danger', label: 'שגיאה' },
            'warning': { emoji: '⚠️', color: 'warning', label: 'אזהרה' },
            'info': { emoji: 'ℹ️', color: 'info', label: 'מידע' },
            'debug': { emoji: '🐛', color: 'secondary', label: 'דיבוג' },
            'executing': { emoji: '🔄', color: 'primary', label: 'מתבצע' },
            'completed': { emoji: '✅', color: 'success', label: 'הושלם' },
            'failed': { emoji: '❌', color: 'danger', label: 'נכשל' }
        };

        const config = typeConfig[type.toLowerCase()] || { emoji: '❓', color: 'secondary', label: type };
        
        return `
            <span class="badge bg-${config.color}">
                ${config.emoji} ${config.label}
            </span>
        `;
    }

    /**
     * Format category with icon and color
     */
    formatCategory(category) {
        if (!category) return '<span class="badge bg-secondary">כללי</span>';
        
        // Use the category detector system if available
        if (window.getCategoryIcon) {
            const categoryInfo = window.getCategoryIcon(category, { format: 'object' });
            return `
                <span class="badge" style="background-color: ${categoryInfo.color}; color: white;">
                    ${categoryInfo.emoji} ${categoryInfo.title}
                </span>
            `;
        }
        
        // Fallback category mapping
        const categoryConfig = {
            'development': { emoji: '🛠️', color: '#6c757d', label: 'פיתוח' },
            'system': { emoji: '⚙️', color: '#dc3545', label: 'מערכת' },
            'business': { emoji: '💼', color: '#28a745', label: 'עסקי' },
            'performance': { emoji: '⚡', color: '#ffc107', label: 'ביצועים' },
            'ui': { emoji: '🎨', color: '#17a2b8', label: 'ממשק משתמש' },
            'security': { emoji: '🔒', color: '#6f42c1', label: 'אבטחה' },
            'background_task': { emoji: '🔄', color: '#fd7e14', label: 'משימה ברקע' },
            'network': { emoji: '🌐', color: '#20c997', label: 'רשת' },
            'database': { emoji: '🗄️', color: '#fd7e14', label: 'מסד נתונים' },
            'api': { emoji: '🔌', color: '#e83e8c', label: 'API' },
            'cache': { emoji: '💾', color: '#6c757d', label: 'מטמון' }
        };

        const config = categoryConfig[category.toLowerCase()] || { emoji: '📋', color: '#6c757d', label: 'כללי' };
        
        return `
            <span class="badge" style="background-color: ${config.color}; color: white;">
                ${config.emoji} ${config.label}
            </span>
        `;
    }

    /**
     * Format page with icon
     */
    formatPage(page) {
        if (!page) return '<span class="text-muted">-</span>';
        
        // Extract page name from full path
        const pageName = page.includes('/') ? page.split('/').pop() : page;
        
        // Get page icon based on page type
        const pageIcon = this.getPageIcon(pageName);
        
        return `
            <span class="page-display" title="${page}">
                ${pageIcon} ${pageName}
            </span>
        `;
    }

    /**
     * Get page icon based on page name
     */
    getPageIcon(pageName) {
        const pageIcons = {
            'index.html': '🏠',
            'trades.html': '📈',
            'alerts.html': '🔔',
            'accounts.html': '👤',
            'system-management.html': '⚙️',
            'notifications-center.html': '📬',
            'preferences.html': '⚙️',
            'tickers.html': '💰',
            'executions.html': '⚡',
            'cash_flows.html': '💸',
            'notes.html': '📝',
            'research.html': '🔍',
            'trade_plans.html': '📋',
            'db_display.html': '🗄️',
            'db_extradata.html': '📊',
            'cache-management.html': '⚙️',
            'linter-realtime-monitor.html': '🔍',
            'crud-testing-dashboard.html': '🧪',
            'external-data-dashboard.html': '🌐',
            'server-monitor.html': '🖥️',
            'css-management.html': '🎨',
            'constraints.html': '🔒'
        };
        
        return pageIcons[pageName] || '📄';
    }

    /**
     * Show item details modal
     */
    showItemDetails(item) {
        console.log('🔍 showItemDetails called with item:', item);
        
        // Create dynamic modal title
        const type = item.type || item.level || 'לא ידוע';
        const title = item.title || '';
        let modalTitle = `פרטי רשומה - ${type}`;
        if (title && title !== 'ללא כותרת') {
            modalTitle += ` - ${title}`;
        }
        
        // Create a detailed notification with formatted content
        const details = this.formatItemDetails(item);
        console.log('📝 Formatted details:', details);
        
        // Convert line breaks to HTML breaks for proper display
        const detailsHtml = details.replace(/\n/g, '<br>');
        console.log('📝 Formatted details HTML:', detailsHtml);
        
        // Use the site's details modal system
        if (window.showDetailsModal) {
            console.log('✅ Using showDetailsModal');
            // Show details in a modal dialog
            window.showDetailsModal(modalTitle, detailsHtml);
            
            // Debug: Check if notification elements are created
            setTimeout(() => {
                const notifications = document.querySelectorAll('.notification, .alert, [class*="notification"]');
                console.log('🔍 DEBUG: Notifications found after showInfoNotification:', notifications.length);
                
                notifications.forEach((notification, i) => {
                    const rect = notification.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(notification);
                    console.log(`   ${i+1}. Notification:`, {
                        text: notification.textContent?.substring(0, 50) + '...',
                        visible: rect.width > 0 && rect.height > 0,
                        position: `x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`,
                        display: computedStyle.display,
                        opacity: computedStyle.opacity,
                        zIndex: computedStyle.zIndex,
                        position: computedStyle.position
                    });
                });
                
                // Check notification container
                const container = document.getElementById('notification-container');
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const containerStyle = window.getComputedStyle(container);
                    console.log('📦 Notification container:', {
                        children: container.children.length,
                        visible: containerRect.width > 0 && containerRect.height > 0,
                        position: `x=${containerRect.x}, y=${containerRect.y}, w=${containerRect.width}, h=${containerRect.height}`,
                        display: containerStyle.display,
                        opacity: containerStyle.opacity,
                        zIndex: containerStyle.zIndex,
                        position: containerStyle.position
                    });
                } else {
                    console.log('❌ No notification container found');
                }
            }, 500);
            
            // Also copy to clipboard
            navigator.clipboard.writeText(details).then(() => {
                console.log('📋 Details copied to clipboard');
                if (window.showSuccessNotification) {
                    window.showSuccessNotification('פרטי הרשומה הועתקו ללוח');
                }
            }).catch((error) => {
                console.log('❌ Failed to copy to clipboard:', error);
                console.log('פרטי הרשומה:', details);
            });
        } else if (window.showInfoNotification) {
            console.log('✅ Using showInfoNotification fallback');
            // Fallback to info notification with unlimited duration (0 = no auto-close)
            window.showInfoNotification('פרטי רשומה', details, 0);
        } else {
            console.log('❌ No notification system available, using console fallback');
            // Final fallback to console
            console.log('פרטי רשומה:', details);
        }
    }

    /**
     * Format item details for display
     */
    formatItemDetails(item) {
        const timestamp = this.formatTimestamp(item.timestamp);
        const type = item.type || item.level || 'לא ידוע';
        const title = item.title || 'ללא כותרת';
        const message = item.message || item.error || 'ללא הודעה';
        const page = item.page || 'לא ידוע';
        const category = item.category || 'כללי';
        const id = item.id || 'ללא מזהה';
        
        // Format with bold headers and better structure with line breaks
        return `<strong>📅 זמן:</strong> ${timestamp}

<strong>🏷️ סוג:</strong> ${type}

<strong>📝 כותרת:</strong> ${title}

<strong>📄 עמוד:</strong> ${page}

<strong>📂 קטגוריה:</strong> ${category}

<strong>🆔 מזהה:</strong> ${id}

<strong>💬 הודעה מלאה:</strong>
${message}`;
    }

    /**
     * Copy item to clipboard
     */
    /**
     * Copy log item to clipboard
     * @function copyItem
     * @async
     * @param {Object} item - Log item to copy
     * @returns {Promise<void>}
     */
    async copyItem(item) {
        try {
            await navigator.clipboard.writeText(JSON.stringify(item, null, 2));
            if (window.showNotification) {
                window.showNotification('הנתונים הועתקו ללוח', 'success');
            }
        } catch (error) {
            console.error('Failed to copy item:', error);
            if (window.showNotification) {
                window.showNotification('שגיאה בהעתקה', 'error');
            }
        }
    }

    /**
     * Apply filters
     */
    applyFilters() {
        const searchInput = this.container.querySelector('.filter-search');
        const typeSelect = this.container.querySelector('.filter-type');
        const categorySelect = this.container.querySelector('.filter-category');
        const pageSelect = this.container.querySelector('.filter-page');
        const timeRangeSelect = this.container.querySelector('.filter-time-range');

        this.currentFilters = {
            search: searchInput?.value || '',
            type: typeSelect?.value || '',
            category: categorySelect?.value || '',
            page: pageSelect?.value || '',
            timeRange: timeRangeSelect?.value || 'all'
        };

        this.currentPagination.page = 1; // Reset to first page
        this.loadData();
    }

    /**
     * Clear filters
     */
    clearFilters() {
        this.currentFilters = {};
        this.currentPagination.page = 1;
        
        // Reset form inputs
        const searchInput = this.container.querySelector('.filter-search');
        const typeSelect = this.container.querySelector('.filter-type');
        const categorySelect = this.container.querySelector('.filter-category');
        const pageSelect = this.container.querySelector('.filter-page');
        const timeRangeSelect = this.container.querySelector('.filter-time-range');
        
        if (searchInput) searchInput.value = '';
        if (typeSelect) typeSelect.value = '';
        if (categorySelect) categorySelect.value = '';
        if (pageSelect) pageSelect.value = '';
        if (timeRangeSelect) timeRangeSelect.value = 'all';
        
        this.loadData();
    }

    /**
     * Set sort
     */
    setSort(sortBy, order) {
        this.currentSort = { by: sortBy, order };
        this.currentPagination.page = 1; // Reset to first page
        this.loadData();
    }

    /**
     * Set page
     */
    setPage(page) {
        this.currentPagination.page = page;
        this.loadData();
    }

    /**
     * Refresh data
     */
    /**
     * Refresh log display
     * @function refresh
     * @async
     * @returns {Promise<void>}
     */
    async refresh() {
        await this.loadData();
        if (window.showNotification) {
            window.showNotification('הנתונים רוענו', 'success');
        }
    }

    /**
     * Show export modal
     */
    showExportModal() {
        // Implementation for export modal
        console.log('Show export modal');
    }

    /**
     * Show config modal
     */
    showConfigModal() {
        // Implementation for config modal
        console.log('Show config modal');
    }

    /**
     * Update stats display
     */
    updateStats(logData) {
        const totalCount = this.container.querySelector('.total-count');
        const displayedCount = this.container.querySelector('.displayed-count');
        const lastUpdated = this.container.querySelector('.last-updated');

        // Show total count from allData (before pagination)
        if (totalCount) totalCount.textContent = this.allData?.length || 0;
        
        // Show displayed count (current page items)
        const currentPageSize = this.paginationInstance ? 
            Math.min(this.currentPagination.itemsPerPage, this.allData?.length || 0) : 
            this.currentData?.length || 0;
        if (displayedCount) displayedCount.textContent = currentPageSize;
        if (lastUpdated) lastUpdated.textContent = new Date().toLocaleString('he-IL');
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.hideAllStates();
        const loading = this.container.querySelector('.log-display-loading');
        if (loading) loading.style.display = 'block';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = this.container.querySelector('.log-display-loading');
        if (loading) loading.style.display = 'none';
    }

    /**
     * Show content
     */
    showContent() {
        this.hideAllStates();
        const content = this.container.querySelector('.log-display-content');
        if (content) content.style.display = 'block';
        
        // Populate filter options after content is shown
        this.populateFilterOptions();
        
        // Initialize pagination system
        this.initializePagination();
    }

    /**
     * Render error state
     */
    renderError(message) {
        this.hideAllStates();
        const errorState = this.container.querySelector('.log-display-error');
        if (errorState) {
            errorState.style.display = 'block';
            const errorMessage = errorState.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    }

    /**
     * Populate filter options
     */
    populateFilterOptions() {
        // Populate type filter
        const typeSelect = this.container.querySelector('.filter-type');
        if (typeSelect) {
            const types = [...new Set(this.allData.map(item => item.type || item.level).filter(Boolean))];
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }

        // Populate category filter
        const categorySelect = this.container.querySelector('.filter-category');
        if (categorySelect) {
            const categories = [...new Set(this.allData.map(item => item.category).filter(Boolean))];
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        // Populate page filter
        const pageSelect = this.container.querySelector('.filter-page');
        if (pageSelect) {
            const pages = [...new Set(this.allData.map(item => item.page).filter(Boolean))];
            pages.forEach(page => {
                const option = document.createElement('option');
                option.value = page;
                option.textContent = page;
                pageSelect.appendChild(option);
            });
        }
    }

    /**
     * Show empty state
     */
    showEmpty() {
        this.hideAllStates();
        const empty = this.container.querySelector('.log-display-empty');
        if (empty) empty.style.display = 'block';
    }

    /**
     * Show error state
     */
    showError(message) {
        this.hideAllStates();
        const error = this.container.querySelector('.log-display-error');
        const errorMessage = this.container.querySelector('.error-message');
        
        if (error) error.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
    }

    /**
     * Hide all states
     */
    hideAllStates() {
        const states = [
            '.log-display-loading',
            '.log-display-content',
            '.log-display-empty',
            '.log-display-error'
        ];

        states.forEach(selector => {
            const element = this.container.querySelector(selector);
            if (element) element.style.display = 'none';
        });
    }

    /**
     * Set log type
     */
    setLogType(logType) {
        this.options.logType = logType;
        const logDisplay = this.container.querySelector('.unified-log-display');
        if (logDisplay) {
            logDisplay.dataset.logType = logType;
        }
        
        // Update title
        const titleText = this.container.querySelector('.title-text');
        if (titleText && window.UnifiedLogManager) {
            const logConfig = window.UnifiedLogManager.getLogTypeConfig(logType);
            if (logConfig) {
                titleText.textContent = logConfig.name;
            }
        }
        
        this.loadData();
    }

    /**
     * Set display configuration
     */
    setDisplayConfig(configName) {
        this.options.displayConfig = configName;
        // Apply configuration changes
        this.loadData();
    }

    /**
     * Initialize pagination system
     */
    initializePagination() {
        // Destroy existing pagination if any
        if (this.paginationInstance) {
            this.paginationInstance.destroy();
        }
        
        // Create new pagination instance
        const tableId = this.container.querySelector('.log-table')?.id || 'unified-log-table';
        this.paginationInstance = window.createPagination(tableId, {
            pageSize: this.currentPagination.itemsPerPage,
            maxPageSize: 200,
            minPageSize: 10,
            showPageSizeSelector: true,
            showPageInfo: true,
            showNavigation: true,
            onPageChange: (data, page) => {
                this.currentPagination.page = page;
                this.renderTableData(data);
            },
            onPageSizeChange: (newPageSize) => {
                this.currentPagination.itemsPerPage = newPageSize;
                this.currentPagination.page = 1;
                this.loadData();
            },
            data: this.currentData
        });
    }

    /**
     * Update pagination with new data
     */
    updatePagination() {
        if (this.paginationInstance) {
            this.paginationInstance.setData(this.currentData);
        }
    }

    /**
     * Render table data (called by pagination)
     */
    renderTableData(data) {
        const tbody = this.container.querySelector('.log-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-info-circle"></i> אין נתונים להצגה
                    </td>
                </tr>
            `;
            return;
        }
        
        data.forEach(item => {
            const row = this.createDataRow(item);
            tbody.appendChild(row);
        });
    }

    /**
     * Destroy component
     */
    destroy() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        if (this.paginationInstance) {
            this.paginationInstance.destroy();
            this.paginationInstance = null;
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== GLOBAL FUNCTIONS =====

/**
 * Create a new log display instance
 */
window.createLogDisplay = function(containerId, options = {}) {
    return new UnifiedLogDisplay(containerId, options);
};

/**
 * Get existing log display instance
 */
window.getLogDisplay = function(containerId) {
    const container = document.getElementById(containerId);
    return container?.unifiedLogDisplay;
};

// Export to global scope
window.UnifiedLogDisplay = UnifiedLogDisplay;

/**
 * Debug function to analyze action buttons styling
 */
window.debugActionButtons = function() {
    console.log('🔍 === ACTION BUTTONS DEBUG ANALYSIS ===');
    
    // Check all action buttons
    const actionButtons = document.querySelectorAll('.btn-action');
    console.log(`📊 Found ${actionButtons.length} action buttons`);
    
    actionButtons.forEach((btn, i) => {
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        console.log(`🔘 Button ${i+1}:`, {
            element: btn,
            classes: btn.className,
            visible: rect.width > 0 && rect.height > 0,
            dimensions: {
                width: rect.width,
                height: rect.height,
                computedWidth: style.width,
                computedHeight: style.height
            },
            layout: {
                display: style.display,
                position: style.position,
                alignItems: style.alignItems,
                justifyContent: style.justifyContent,
                flexDirection: style.flexDirection
            },
            spacing: {
                padding: style.padding,
                margin: style.margin,
                border: style.border
            },
            appearance: {
                backgroundColor: style.backgroundColor,
                color: style.color,
                borderRadius: style.borderRadius,
                boxShadow: style.boxShadow
            },
            position: {
                x: rect.x,
                y: rect.y,
                zIndex: style.zIndex
            }
        });
    });
    
    // Check for CSS conflicts
    console.log('🎨 Checking CSS conflicts...');
    const testBtn = document.createElement('button');
    testBtn.className = 'btn btn-action';
    testBtn.innerHTML = '<i class="fas fa-info"></i>';
    testBtn.style.position = 'absolute';
    testBtn.style.top = '-1000px';
    testBtn.style.left = '-1000px';
    testBtn.style.visibility = 'hidden';
    document.body.appendChild(testBtn);
    
    setTimeout(() => {
        const testStyle = window.getComputedStyle(testBtn);
        const testRect = testBtn.getBoundingClientRect();
        console.log('🧪 Test button analysis:', {
            classes: testBtn.className,
            dimensions: {
                width: testRect.width,
                height: testRect.height,
                computedWidth: testStyle.width,
                computedHeight: testStyle.height
            },
            layout: {
                display: testStyle.display,
                alignItems: testStyle.alignItems,
                justifyContent: testStyle.justifyContent,
                flexDirection: testStyle.flexDirection
            },
            spacing: {
                padding: testStyle.padding,
                margin: testStyle.margin,
                border: testStyle.border
            },
            appearance: {
                backgroundColor: testStyle.backgroundColor,
                color: testStyle.color,
                borderRadius: testStyle.borderRadius
            }
        });
        
        // Check if btn-action styles are being applied
        const hasBtnAction = testBtn.classList.contains('btn-action');
        console.log('✅ Has btn-action class:', hasBtnAction);
        
        // Check for conflicting CSS rules
        const allStyles = document.styleSheets;
        let btnActionRules = [];
        for (let sheet of allStyles) {
            try {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText && rule.selectorText.includes('.btn-action')) {
                        btnActionRules.push({
                            selector: rule.selectorText,
                            styles: rule.style.cssText,
                            source: sheet.href || 'inline'
                        });
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        }
        console.log('📋 Found btn-action CSS rules:', btnActionRules);
        
        document.body.removeChild(testBtn);
    }, 100);
    
    // Check for JavaScript conflicts
    console.log('⚙️ Checking for JavaScript conflicts...');
    const btnActionElements = document.querySelectorAll('.btn-action');
    btnActionElements.forEach((btn, i) => {
        const inlineStyles = btn.style.cssText;
        if (inlineStyles) {
            console.log(`🔧 Button ${i+1} has inline styles:`, inlineStyles);
        }
    });
    
    console.log('🔍 === END DEBUG ANALYSIS ===');
};

console.log('📊 UnifiedLogDisplay component loaded successfully');
console.log('🔧 Use window.debugActionButtons() to analyze action button styling');
