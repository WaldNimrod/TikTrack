/**
 * Trade Plans Page Enhancements - TikTrack
 * שיפורים לעמוד התוכניות
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Trade Plans Page Enhancement System
class TradePlansPageEnhancements {
    constructor() {
        this.enhancements = {
            performance: true,
            ux: true,
            data: true,
            design: true
        };
        
        this.stats = {
            loadTime: 0,
            plansCount: 0,
            dataPoints: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize enhancements
     */
    async init() {
        try {
            window.Logger.info('🚀 Initializing Trade Plans Page Enhancements', { page: 'trade-plans-enhancements' });
            
            // Apply all enhancements
            await this.applyPerformanceEnhancements();
            await this.applyUXEnhancements();
            await this.applyDataEnhancements();
            await this.applyDesignEnhancements();
            
            window.Logger.info('✅ Trade Plans Page Enhancements initialized successfully', { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error initializing Trade Plans Page Enhancements:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Apply performance enhancements
     */
    async applyPerformanceEnhancements() {
        if (!this.enhancements.performance) return;
        
        try {
            // Lazy loading for plan cards
            this.setupLazyCardLoading();
            
            // Optimize plan rendering
            this.setupPlanOptimization();
            
            // Cache management
            this.setupCacheOptimization();
            
            window.Logger.info('✅ Performance enhancements applied', { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying performance enhancements:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Apply UX enhancements
     */
    async applyUXEnhancements() {
        if (!this.enhancements.ux) return;
        
        try {
            // Add plan creation wizard
            this.addPlanCreationWizard();
            
            // Add plan templates
            this.addPlanTemplates();
            
            // Add plan actions
            this.addPlanActions();
            
            // Add plan search
            this.addPlanSearch();
            
            window.Logger.info('✅ UX enhancements applied', { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying UX enhancements:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Apply data enhancements
     */
    async applyDataEnhancements() {
        if (!this.enhancements.data) return;
        
        try {
            // Real-time plan updates
            this.setupRealTimeUpdates();
            
            // Plan validation
            this.setupPlanValidation();
            
            // Plan analytics
            this.setupPlanAnalytics();
            
            window.Logger.info('✅ Data enhancements applied', { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying data enhancements:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Apply design enhancements
     */
    async applyDesignEnhancements() {
        if (!this.enhancements.design) return;
        
        try {
            // Add visual indicators
            this.addVisualIndicators();
            
            // Add animations
            this.addAnimations();
            
            // Add responsive design
            this.addResponsiveDesign();
            
            window.Logger.info('✅ Design enhancements applied', { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying design enhancements:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Setup lazy card loading
     */
    setupLazyCardLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const cardId = entry.target.dataset.planId;
                    this.loadPlanCard(cardId);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        // Observe all plan cards
        document.querySelectorAll('.plan-card').forEach(card => {
            observer.observe(card);
        });
    }
    
    /**
     * Load plan card when visible
     */
    async loadPlanCard(planId) {
        try {
            window.Logger.info(`📋 Loading plan card: ${planId}`, { page: 'trade-plans-enhancements' });
            
            // Add loading indicator
            this.addCardLoadingIndicator(planId);
            
            // Load plan data
            const planData = await this.fetchPlanData(planId);
            
            // Render plan card
            this.renderPlanCard(planId, planData);
            
            // Remove loading indicator
            this.removeCardLoadingIndicator(planId);
            
            this.stats.plansCount++;
            window.Logger.info(`✅ Plan card ${planId} loaded successfully`, { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error(`❌ Error loading plan card ${planId}:`, error, { page: 'trade-plans-enhancements' });
            this.showCardError(planId);
        }
    }
    
    /**
     * Add card loading indicator
     */
    addCardLoadingIndicator(planId) {
        const card = document.querySelector(`[data-plan-id="${planId}"]`);
        if (card) {
            card.innerHTML = `
                <div class="card-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">טוען תוכנית...</span>
                    </div>
                    <p class="mt-2">טוען תוכנית...</p>
                </div>
            `;
        }
    }
    
    /**
     * Remove card loading indicator
     */
    removeCardLoadingIndicator(planId) {
        const card = document.querySelector(`[data-plan-id="${planId}"]`);
        if (card) {
            const loadingElement = card.querySelector('.card-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }
    
    /**
     * Show card error
     */
    showCardError(planId) {
        const card = document.querySelector(`[data-plan-id="${planId}"]`);
        if (card) {
            card.innerHTML = `
                <div class="card-error">
                    <i class="bi bi-exclamation-triangle text-warning"></i>
                    <p class="mt-2">שגיאה בטעינת התוכנית</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="this.loadPlanCard('${planId}')">
                        נסה שוב
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Fetch plan data
     */
    async fetchPlanData(planId) {
        try {
            const response = await fetch(`/api/trade-plans/${planId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            window.Logger.error('❌ Error fetching plan data:', error, { page: 'trade-plans-enhancements' });
            return null;
        }
    }
    
    /**
     * Render plan card
     */
    renderPlanCard(planId, planData) {
        const card = document.querySelector(`[data-plan-id="${planId}"]`);
        if (!card || !planData) return;
        
        card.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">${planData.name || 'תוכנית ללא שם'}</h5>
                    <span class="badge ${this.getStatusColor(planData.status)}">${planData.status || 'לא ידוע'}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">${planData.description || 'אין תיאור'}</p>
                    <div class="plan-stats">
                        <div class="stat-item">
                            <span class="stat-label">מטרה:</span>
                            <span class="stat-value">${planData.target || 'N/A'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">תאריך יעד:</span>
                            <span class="stat-value">${planData.targetDate || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="this.editPlan('${planId}')">
                        <i class="bi bi-pencil"></i> ערוך
                    </button>
                    <button class="btn btn-sm btn-success" onclick="this.executePlan('${planId}')">
                        <i class="bi bi-play"></i> הפעל
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="this.deletePlan('${planId}')">
                        <i class="bi bi-trash"></i> מחק
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Get status color
     */
    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'pending': return 'bg-warning';
            case 'completed': return 'bg-info';
            case 'cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
    
    /**
     * Setup plan optimization
     */
    setupPlanOptimization() {
        // Optimize plan rendering
        this.optimizePlanRendering();
        
        // Setup plan caching
        this.setupPlanCaching();
    }
    
    /**
     * Optimize plan rendering
     */
    optimizePlanRendering() {
        // Use document fragments for better performance
        this.useDocumentFragments = true;
        
        // Batch DOM updates
        this.batchDOMUpdates = true;
    }
    
    /**
     * Setup plan caching
     */
    setupPlanCaching() {
        // Cache plan data
        this.planCache = {
            data: null,
            timestamp: 0,
            ttl: 300000 // 5 minutes
        };
    }
    
    /**
     * Add plan creation wizard
     */
    addPlanCreationWizard() {
        const wizardContainer = document.querySelector('.section-actions');
        if (!wizardContainer) return;
        
        const wizardHTML = `
            <div class="plan-wizard">
                <button class="btn btn-primary" onclick="this.openPlanWizard()">
                    <i class="bi bi-plus-circle"></i> צור תוכנית חדשה
                </button>
            </div>
        `;
        
        wizardContainer.insertAdjacentHTML('beforeend', wizardHTML);
    }
    
    /**
     * Open plan wizard
     */
    openPlanWizard() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">צור תוכנית חדשה</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="planForm">
                            <div class="mb-3">
                                <label for="planName" class="form-label">שם התוכנית</label>
                                <input type="text" class="form-control" id="planName" required>
                            </div>
                            <div class="mb-3">
                                <label for="planDescription" class="form-label">תיאור</label>
                                <textarea class="form-control" id="planDescription" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="planTarget" class="form-label">מטרה</label>
                                <input type="number" class="form-control" id="planTarget" step="0.01">
                            </div>
                            <div class="mb-3">
                                <label for="planTargetDate" class="form-label">תאריך יעד</label>
                                <input type="date" class="form-control" id="planTargetDate">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-primary" onclick="this.savePlan()">שמור</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Clean up when modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    /**
     * Save plan
     */
    async savePlan() {
        try {
            const form = document.getElementById('planForm');
            const formData = new FormData(form);
            
            const planData = {
                name: formData.get('planName'),
                description: formData.get('planDescription'),
                target: parseFloat(formData.get('planTarget')),
                targetDate: formData.get('planTargetDate'),
                status: 'pending'
            };
            
            const response = await fetch('/api/trade-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(planData)
            });
            
            if (response.ok) {
                window.showNotification('תוכנית נשמרה בהצלחה', 'success', 'business');
                this.refreshPlans();
            } else {
                throw new Error('Failed to save plan');
            }
        } catch (error) {
            window.Logger.error('❌ Error saving plan:', error, { page: 'trade-plans-enhancements' });
            window.showNotification('שגיאה בשמירת התוכנית', 'error', 'business');
        }
    }
    
    /**
     * Add plan templates
     */
    addPlanTemplates() {
        const templatesContainer = document.querySelector('.section-actions');
        if (!templatesContainer) return;
        
        const templatesHTML = `
            <div class="plan-templates">
                <button class="btn btn-outline-secondary" onclick="this.showTemplates()">
                    <i class="bi bi-layout-text-window"></i> תבניות
                </button>
            </div>
        `;
        
        templatesContainer.insertAdjacentHTML('beforeend', templatesHTML);
    }
    
    /**
     * Show templates
     */
    showTemplates() {
        const templates = [
            { name: 'תוכנית יומית', description: 'תוכנית מסחר יומית', target: 100, targetDate: this.getTomorrowDate() },
            { name: 'תוכנית שבועית', description: 'תוכנית מסחר שבועית', target: 500, targetDate: this.getNextWeekDate() },
            { name: 'תוכנית חודשית', description: 'תוכנית מסחר חודשית', target: 2000, targetDate: this.getNextMonthDate() }
        ];
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">בחר תבנית</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            ${templates.map(template => `
                                <div class="col-md-4">
                                    <div class="card template-card" onclick="this.selectTemplate('${template.name}')">
                                        <div class="card-body">
                                            <h6 class="card-title">${template.name}</h6>
                                            <p class="card-text">${template.description}</p>
                                            <small class="text-muted">מטרה: ${template.target}</small>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Clean up when modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    /**
     * Select template
     */
    selectTemplate(templateName) {
        // Implement template selection logic
        window.Logger.info(`📋 Template selected: ${templateName}`, { page: 'trade-plans-enhancements' });
        this.openPlanWizard();
    }
    
    /**
     * Add plan actions
     */
    addPlanActions() {
        const actionsContainer = document.querySelector('.section-actions');
        if (!actionsContainer) return;
        
        const actionsHTML = `
            <div class="plan-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="this.refreshPlans()">
                    <i class="bi bi-arrow-clockwise"></i> רענן
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="this.exportPlans()">
                    <i class="bi bi-download"></i> ייצא
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="this.importPlans()">
                    <i class="bi bi-upload"></i> ייבוא
                </button>
            </div>
        `;
        
        actionsContainer.insertAdjacentHTML('beforeend', actionsHTML);
    }
    
    /**
     * Add plan search
     */
    addPlanSearch() {
        const searchContainer = document.querySelector('.section-actions');
        if (!searchContainer) return;
        
        const searchHTML = `
            <div class="plan-search">
                <input type="text" class="form-control" id="planSearchInput" placeholder="חיפוש תוכניות...">
            </div>
        `;
        
        searchContainer.insertAdjacentHTML('beforeend', searchHTML);
        
        // Add search event listener
        const searchInput = document.getElementById('planSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    }
    
    /**
     * Handle search
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.searchPlans(searchTerm);
    }
    
    /**
     * Search plans
     */
    searchPlans(searchTerm) {
        const planCards = document.querySelectorAll('.plan-card');
        
        planCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const showCard = cardText.includes(searchTerm);
            card.style.display = showCard ? '' : 'none';
        });
    }
    
    /**
     * Setup real-time updates
     */
    setupRealTimeUpdates() {
        // Update plans every 30 seconds
        setInterval(() => {
            this.refreshPlans();
        }, 30000);
    }
    
    /**
     * Setup plan validation
     */
    setupPlanValidation() {
        // Validate plan data before display
        this.originalLoadPlanCard = this.loadPlanCard;
        this.loadPlanCard = async (planId) => {
            const planData = await this.fetchPlanData(planId);
            return this.validatePlanData(planData);
        };
    }
    
    /**
     * Validate plan data
     */
    validatePlanData(planData) {
        if (!planData) return null;
        
        // Validate required fields
        if (!planData.name) {
            planData.name = 'תוכנית ללא שם';
        }
        
        if (!planData.status) {
            planData.status = 'pending';
        }
        
        return planData;
    }
    
    /**
     * Setup plan analytics
     */
    setupPlanAnalytics() {
        // Track plan performance
        this.trackPlanPerformance();
        
        // Generate analytics reports
        this.generateAnalyticsReports();
    }
    
    /**
     * Track plan performance
     */
    trackPlanPerformance() {
        // Implement plan performance tracking
        this.performanceMetrics = {
            totalPlans: 0,
            activePlans: 0,
            completedPlans: 0,
            successRate: 0
        };
    }
    
    /**
     * Generate analytics reports
     */
    generateAnalyticsReports() {
        // Implement analytics report generation
        this.analyticsReports = {
            performance: null,
            trends: null,
            recommendations: null
        };
    }
    
    /**
     * Add visual indicators
     */
    addVisualIndicators() {
        // Add status indicators
        this.addStatusIndicators();
        
        // Add progress bars
        this.addProgressBars();
        
        // Add trend indicators
        this.addTrendIndicators();
    }
    
    /**
     * Add status indicators
     */
    addStatusIndicators() {
        // Add status indicators to plan cards
        document.querySelectorAll('.plan-card').forEach(card => {
            const statusElement = card.querySelector('.badge');
            if (statusElement) {
                statusElement.classList.add('status-indicator');
            }
        });
    }
    
    /**
     * Add progress bars
     */
    addProgressBars() {
        // Add progress bars to plan cards
        document.querySelectorAll('.plan-card').forEach(card => {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress mt-2';
            progressBar.innerHTML = `
                <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            `;
            card.querySelector('.card-body').appendChild(progressBar);
        });
    }
    
    /**
     * Add trend indicators
     */
    addTrendIndicators() {
        // Add trend indicators to plan stats
        document.querySelectorAll('.plan-stats').forEach(stats => {
            const targetElement = stats.querySelector('.stat-value');
            if (targetElement) {
                const indicator = document.createElement('span');
                indicator.className = 'trend-indicator ms-2';
                indicator.innerHTML = '<i class="bi bi-arrow-up text-success"></i>';
                targetElement.appendChild(indicator);
            }
        });
    }
    
    /**
     * Add animations
     */
    addAnimations() {
        // Add fade-in animations
        this.addFadeInAnimations();
        
        // Add slide animations
        this.addSlideAnimations();
        
        // Add pulse animations
        this.addPulseAnimations();
    }
    
    /**
     * Add fade-in animations
     */
    addFadeInAnimations() {
        // Add fade-in to plan cards
        document.querySelectorAll('.plan-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    /**
     * Add slide animations
     */
    addSlideAnimations() {
        // Add slide animations to sections
        document.querySelectorAll('.content-section').forEach((section, index) => {
            section.style.transform = 'translateX(-20px)';
            section.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                section.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }
    
    /**
     * Add pulse animations
     */
    addPulseAnimations() {
        // Add pulse to loading elements
        document.querySelectorAll('.spinner-border').forEach(spinner => {
            spinner.style.animation = 'pulse 1s infinite';
        });
    }
    
    /**
     * Add responsive design
     */
    addResponsiveDesign() {
        // Add responsive breakpoints
        this.addResponsiveBreakpoints();
        
        // Add mobile optimizations
        this.addMobileOptimizations();
    }
    
    /**
     * Add responsive breakpoints
     */
    addResponsiveBreakpoints() {
        // Add responsive classes to plan cards
        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.add('col-12', 'col-md-6', 'col-lg-4');
        });
    }
    
    /**
     * Add mobile optimizations
     */
    addMobileOptimizations() {
        // Add touch events
        this.addTouchEvents();
        
        // Add mobile-specific styles
        this.addMobileStyles();
    }
    
    /**
     * Add touch events
     */
    addTouchEvents() {
        // Add touch events to plan cards
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    /**
     * Add mobile styles
     */
    addMobileStyles() {
        // Add mobile-specific CSS
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .plan-card {
                    margin-bottom: 1rem;
                }
                .btn {
                    padding: 0.5rem 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Refresh plans
     */
    async refreshPlans() {
        try {
            window.Logger.info('🔄 Refreshing plans...', { page: 'trade-plans-enhancements' });
            
            // Reload all plan cards
            document.querySelectorAll('.plan-card').forEach(card => {
                const planId = card.dataset.planId;
                if (planId) {
                    this.loadPlanCard(planId);
                }
            });
            
            window.Logger.info('✅ Plans refreshed successfully', { page: 'trade-plans-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error refreshing plans:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Export plans
     */
    async exportPlans() {
        try {
            const plans = await this.fetchAllPlans();
            const csv = this.convertPlansToCSV(plans);
            this.downloadCSV(csv, 'trade-plans.csv');
        } catch (error) {
            window.Logger.error('❌ Error exporting plans:', error, { page: 'trade-plans-enhancements' });
        }
    }
    
    /**
     * Fetch all plans
     */
    async fetchAllPlans() {
        try {
            const response = await fetch('/api/trade-plans');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            window.Logger.error('❌ Error fetching all plans:', error, { page: 'trade-plans-enhancements' });
            return [];
        }
    }
    
    /**
     * Convert plans to CSV
     */
    convertPlansToCSV(plans) {
        if (!plans.length) return '';
        
        const headers = ['name', 'description', 'target', 'targetDate', 'status'];
        const csvContent = [
            headers.join(','),
            ...plans.map(plan => headers.map(header => plan[header] || '').join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    /**
     * Download CSV
     */
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    /**
     * Get tomorrow date
     */
    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    
    /**
     * Get next week date
     */
    getNextWeekDate() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
    }
    
    /**
     * Get next month date
     */
    getNextMonthDate() {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.toISOString().split('T')[0];
    }
    
    /**
     * Get enhancement statistics
     */
    getStats() {
        return {
            ...this.stats,
            enhancements: Object.keys(this.enhancements).filter(key => this.enhancements[key]).length,
            totalEnhancements: Object.keys(this.enhancements).length
        };
    }
}

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.TradePlansPageEnhancements = new TradePlansPageEnhancements();
});

// Export for global access
window.TradePlansPageEnhancements = TradePlansPageEnhancements;
