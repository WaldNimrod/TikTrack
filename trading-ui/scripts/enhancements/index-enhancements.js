/**
 * Index Page Enhancements - TikTrack
 * שיפורים לעמוד הבית
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Index Page Enhancement System
class IndexPageEnhancements {
    constructor() {
        this.enhancements = {
            performance: true,
            ux: true,
            data: true,
            design: true
        };
        
        this.stats = {
            loadTime: 0,
            chartCount: 0,
            dataPoints: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize enhancements
     */
    async init() {
        try {
            window.Logger.info('🚀 Initializing Index Page Enhancements', { page: 'index-enhancements' });
            
            // Apply all enhancements
            await this.applyPerformanceEnhancements();
            await this.applyUXEnhancements();
            await this.applyDataEnhancements();
            await this.applyDesignEnhancements();
            
            window.Logger.info('✅ Index Page Enhancements initialized successfully', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error initializing Index Page Enhancements:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Apply performance enhancements
     */
    async applyPerformanceEnhancements() {
        if (!this.enhancements.performance) return;
        
        try {
            // Lazy load charts
            this.setupLazyChartLoading();
            
            // Optimize data loading
            this.setupDataOptimization();
            
            // Cache management
            this.setupCacheOptimization();
            
            window.Logger.info('✅ Performance enhancements applied', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying performance enhancements:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Apply UX enhancements
     */
    async applyUXEnhancements() {
        if (!this.enhancements.ux) return;
        
        try {
            // Add quick action buttons
            this.addQuickActionButtons();
            
            // Add refresh indicators
            this.addRefreshIndicators();
            
            // Add loading states
            this.addLoadingStates();
            
            // Add error handling
            this.addErrorHandling();
            
            window.Logger.info('✅ UX enhancements applied', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying UX enhancements:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Apply data enhancements
     */
    async applyDataEnhancements() {
        if (!this.enhancements.data) return;
        
        try {
            // Real-time data updates
            this.setupRealTimeUpdates();
            
            // Data validation
            this.setupDataValidation();
            
            // Statistics calculation
            this.setupStatisticsCalculation();
            
            window.Logger.info('✅ Data enhancements applied', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying data enhancements:', error, { page: 'index-enhancements' });
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
            
            window.Logger.info('✅ Design enhancements applied', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying design enhancements:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Setup lazy chart loading
     */
    setupLazyChartLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartId = entry.target.id;
                    this.loadChart(chartId);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        // Observe all chart containers
        document.querySelectorAll('[id$="Chart"]').forEach(chart => {
            observer.observe(chart);
        });
    }
    
    /**
     * Load chart when visible
     */
    async loadChart(chartId) {
        try {
            // Charts removed - no longer used on index page
            window.Logger.warn(`⚠️ Chart loading requested but charts are no longer used: ${chartId}`, { page: 'index-enhancements' });
            return;
        } catch (error) {
            window.Logger.error(`❌ Error loading chart ${chartId}:`, error, { page: 'index-enhancements' });
            this.showChartError(chartId);
        }
    }
    
    /**
     * Add chart loading indicator
     */
    addChartLoadingIndicator(chartId) {
        const chartContainer = document.getElementById(chartId);
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">טוען גרף...</span>
                    </div>
                    <p class="mt-2">טוען גרף...</p>
                </div>
            `;
        }
    }
    
    /**
     * Remove chart loading indicator
     */
    removeChartLoadingIndicator(chartId) {
        const chartContainer = document.getElementById(chartId);
        if (chartContainer) {
            const loadingElement = chartContainer.querySelector('.chart-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }
    
    /**
     * Show chart error
     */
    showChartError(chartId) {
        const chartContainer = document.getElementById(chartId);
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-error">
                    <i class="bi bi-exclamation-triangle text-warning"></i>
                    <p class="mt-2">שגיאה בטעינת הגרף</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.refreshChart('${chartId}')">
                        נסה שוב
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Setup data optimization
     */
    setupDataOptimization() {
        // Debounce data updates
        this.debouncedDataUpdate = this.debounce(this.updateData, 300);
        
        // Setup data caching
        this.setupDataCaching();
    }
    
    /**
     * Setup cache optimization
     */
    setupCacheOptimization() {
        if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
            window.Logger.warn('⚠️ UnifiedCacheManager not available for cache optimization', { page: 'index-enhancements' });
            return;
        }
        
        try {
            // Setup cache invalidation listeners
            if (window.CacheSyncManager && typeof window.CacheSyncManager.on === 'function') {
                window.CacheSyncManager.on('cache:invalidate', (keys) => {
                    // Clear local data cache when unified cache is invalidated
                    if (this.dataCache) {
                        window.Logger.info('🔄 Clearing local data cache due to unified cache invalidation', { page: 'index-enhancements' });
                        this.setupDataCaching(); // Reset cache
                    }
                });
            }
            
            window.Logger.info('✅ Cache optimization setup completed', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error setting up cache optimization:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Setup data caching
     */
    setupDataCaching() {
        // Cache data for 5 minutes
        this.dataCache = {
            trades: { data: null, timestamp: 0, ttl: 300000 },
            alerts: { data: null, timestamp: 0, ttl: 300000 },
            stats: { data: null, timestamp: 0, ttl: 300000 }
        };
    }
    
    /**
     * Update data with caching
     */
    async updateData() {
        try {
            const now = Date.now();
            
            // Check cache validity
            if (this.dataCache.trades.timestamp + this.dataCache.trades.ttl > now) {
                return this.dataCache.trades.data;
            }
            
            // Fetch fresh data
            const data = await this.fetchData();
            
            // Update cache
            this.dataCache.trades.data = data;
            this.dataCache.trades.timestamp = now;
            
            return data;
        } catch (error) {
            window.Logger.error('❌ Error updating data:', error, { page: 'index-enhancements' });
            return null;
        }
    }
    
    /**
     * Fetch data from API
     */
    async fetchData() {
        try {
            const response = await fetch('/api/dashboard-data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            window.Logger.error('❌ Error fetching data:', error, { page: 'index-enhancements' });
            return null;
        }
    }
    
    /**
     * Add quick action buttons
     */
    addQuickActionButtons() {
        const quickActionsContainer = document.querySelector('.section-actions');
        if (!quickActionsContainer) return;
        
        const quickActions = `
            <div class="quick-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="window.refreshOverview()">
                    <i class="bi bi-arrow-clockwise"></i> רענן
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="window.exportOverview()">
                    <i class="bi bi-download"></i> ייצא
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="window.quickAction('settings')">
                    <i class="bi bi-gear"></i> הגדרות
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="window.quickAction('help')">
                    <i class="bi bi-question-circle"></i> עזרה
                </button>
            </div>
        `;
        
        quickActionsContainer.insertAdjacentHTML('beforeend', quickActions);
    }
    
    /**
     * Add refresh indicators
     */
    addRefreshIndicators() {
        // Add refresh button to each section
        document.querySelectorAll('.section-header').forEach(header => {
            const actions = header.querySelector('.table-actions');
            if (actions && !actions.querySelector('.refresh-indicator')) {
                const refreshButton = document.createElement('button');
                refreshButton.className = 'btn btn-sm btn-outline-secondary refresh-indicator';
                refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
                refreshButton.title = 'רענן סקשן';
                refreshButton.onclick = () => this.refreshSection(header);
                actions.appendChild(refreshButton);
            }
        });
    }
    
    /**
     * Refresh section
     */
    async refreshSection(header) {
        const section = header.closest('.content-section');
        if (!section) return;
        
        try {
            // Add loading state
            header.classList.add('refreshing');
            
            // Refresh section data
            await this.refreshSectionData(section);
            
            // Remove loading state
            header.classList.remove('refreshing');
            
            window.Logger.info('✅ Section refreshed successfully', { page: 'index-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error refreshing section:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Refresh section data
     */
    async refreshSectionData(section) {
        // Implement section-specific refresh logic
        const sectionId = section.id;
        
        switch (sectionId) {
            case 'main':
                await this.refreshMainSection();
                break;
            case 'top':
                await this.refreshTopSection();
                break;
        }
    }
    
    /**
     * Refresh main section
     */
    async refreshMainSection() {
        // Refresh charts
        await window.refreshAllCharts();
        
        // Refresh data
        await this.updateData();
    }
    
    /**
     * Refresh top section
     */
    async refreshTopSection() {
        // Refresh statistics
        await this.updateStatistics();
    }
    
    /**
     * Add loading states
     */
    addLoadingStates() {
        // Add loading states to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                if (this.classList.contains('btn')) {
                    this.classList.add('loading');
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 1000);
                }
            });
        });
    }
    
    /**
     * Add error handling
     */
    addErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            window.Logger.error('❌ Global error:', event.error, { page: 'index-enhancements' });
            this.showErrorNotification('שגיאה כללית במערכת');
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            window.Logger.error('❌ Unhandled promise rejection:', event.reason, { page: 'index-enhancements' });
            this.showErrorNotification('שגיאה בפעולה אסינכרונית');
        });
    }
    
    /**
     * Show error notification
     */
    showErrorNotification(message) {
        if (window.showNotification) {
            window.showNotification(message, 'error', 'system');
        }
    }
    
    /**
     * Setup real-time updates
     */
    setupRealTimeUpdates() {
        // Update data every 30 seconds - הושבת זמנית למניעת לופים
        // setInterval(() => {
        //     this.debouncedDataUpdate();
        // }, 30000);
    }
    
    /**
     * Setup data validation
     */
    setupDataValidation() {
        // Validate data before display
        this.originalUpdateData = this.updateData;
        this.updateData = async () => {
            const data = await this.originalUpdateData();
            return this.validateData(data);
        };
    }
    
    /**
     * Validate data
     */
    validateData(data) {
        if (!data) return null;
        
        // Validate required fields
        const requiredFields = ['trades', 'alerts', 'stats'];
        for (const field of requiredFields) {
            if (!data[field]) {
                window.Logger.warn(`⚠️ Missing required field: ${field}`, { page: 'index-enhancements' });
                data[field] = { data: [], error: 'Missing data' };
            }
        }
        
        return data;
    }
    
    /**
     * Setup statistics calculation
     */
    setupStatisticsCalculation() {
        // Calculate statistics from data
        this.calculateStatistics = this.debounce(this.performStatisticsCalculation, 1000);
    }
    
    /**
     * Perform statistics calculation
     */
    async performStatisticsCalculation() {
        try {
            const data = await this.updateData();
            if (!data) return;
            
            const stats = {
                totalTrades: data.trades?.length || 0,
                totalAlerts: data.alerts?.length || 0,
                currentBalance: data.stats?.balance || 0,
                totalPnL: data.stats?.pnl || 0
            };
            
            this.updateStatisticsDisplay(stats);
            this.stats.dataPoints += Object.keys(stats).length;
            
        } catch (error) {
            window.Logger.error('❌ Error calculating statistics:', error, { page: 'index-enhancements' });
        }
    }
    
    /**
     * Update statistics display
     */
    updateStatisticsDisplay(stats) {
        // Update DOM elements
        const elements = {
            totalTrades: document.getElementById('totalTrades'),
            totalAlerts: document.getElementById('totalAlerts'),
            currentBalance: document.getElementById('currentBalance'),
            totalPnL: document.getElementById('totalPnL')
        };
        
        Object.entries(elements).forEach(([key, element]) => {
            if (element && stats[key] !== undefined) {
                element.textContent = stats[key];
            }
        });
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
        // Add status indicators to cards
        document.querySelectorAll('.card').forEach(card => {
            const header = card.querySelector('.card-header');
            if (header && !header.querySelector('.status-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'status-indicator badge bg-success';
                indicator.textContent = 'פעיל';
                header.appendChild(indicator);
            }
        });
    }
    
    /**
     * Add progress bars
     */
    addProgressBars() {
        // Add progress bars to statistics
        const statsContainer = document.getElementById('summaryStats');
        if (statsContainer) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress mt-2';
            progressBar.innerHTML = `
                <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            `;
            statsContainer.appendChild(progressBar);
        }
    }
    
    /**
     * Add trend indicators
     */
    addTrendIndicators() {
        // Add trend indicators to statistics
        document.querySelectorAll('.hero-stat-number').forEach(stat => {
            if (!stat.querySelector('.trend-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'trend-indicator ms-2';
                indicator.innerHTML = '<i class="bi bi-arrow-up text-success"></i>';
                stat.appendChild(indicator);
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
        // Add fade-in to cards
        document.querySelectorAll('.card').forEach((card, index) => {
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
        // Add responsive classes
        document.querySelectorAll('.card').forEach(card => {
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
        // Add touch events to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            button.addEventListener('touchend', function() {
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
                .card {
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
     * Debounce function
     */
    debounce(func, wait) {
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
    window.IndexPageEnhancements = new IndexPageEnhancements();
});

// Export for global access
window.IndexPageEnhancements = IndexPageEnhancements;
