/**
 * Duplicate Detector UI
 * User interface for the advanced duplicate code detection system
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @since January 2025
 */

window.Logger.info('🔍 Loading Duplicate Detector UI...', { page: 'duplicate-detector' });

class DuplicateDetectorUI {
    constructor() {
        this.duplicates = [];
        this.filteredDuplicates = [];
        this.currentReport = null;
        this.init();
    }

    /**
     * Initialize the UI
     */
    init() {
        window.Logger.info('🔧 Initializing Duplicate Detector UI...', { page: 'duplicate-detector' });
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup similarity range slider
        this.setupSimilaritySlider();
        
        window.Logger.info('✅ Duplicate Detector UI initialized', { page: 'duplicate-detector' });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter change events
        document.getElementById('duplicateTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('similarityRange').addEventListener('input', () => this.updateSimilarityValue());
    }

    /**
     * Setup similarity slider
     */
    setupSimilaritySlider() {
        const slider = document.getElementById('similarityRange');
        const valueDisplay = document.getElementById('similarityValue');
        
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value + '%';
        });
    }

    /**
     * Update similarity value display
     */
    updateSimilarityValue() {
        const slider = document.getElementById('similarityRange');
        const valueDisplay = document.getElementById('similarityValue');
        valueDisplay.textContent = slider.value + '%';
    }

    /**
     * Run duplicate detection
     */
    async runDuplicateDetection() {
        try {
            window.Logger.info('🔍 Starting duplicate detection...', { page: 'duplicate-detector' });
            
            // Show loading modal
            const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
            loadingModal.show();
            
            // Show notification
            window.showNotification('מתחיל זיהוי כפילויות קוד...', 'info');
            
            // Call the detection API
            const response = await fetch('/api/quality-check/duplicates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.currentReport = result.data;
                this.duplicates = result.data.duplicates;
                this.updateStatistics();
                this.displayDuplicates();
                
                window.showSuccessNotification('זיהוי כפילויות הושלם בהצלחה');
                window.Logger.info('✅ Duplicate detection completed', { page: 'duplicate-detector' });
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            window.Logger.error('Error running duplicate detection:', error, { page: 'duplicate-detector' });
            window.showErrorNotification('שגיאה בזיהוי כפילויות', error.message);
        } finally {
            // Hide loading modal
            const loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
            if (loadingModal) {
                loadingModal.hide();
            }
        }
    }

    /**
     * Update statistics cards
     */
    updateStatistics() {
        if (!this.currentReport) return;
        
        const summary = this.currentReport.summary;
        
        document.getElementById('exactDuplicates').textContent = summary.exactDuplicates;
        document.getElementById('nearDuplicates').textContent = summary.nearDuplicates;
        document.getElementById('similarPatterns').textContent = summary.similarPatterns;
        document.getElementById('totalFunctions').textContent = summary.totalFunctions;
        
        // Update statistics cards visibility
        document.getElementById('statisticsCards').style.display = 'block';
    }

    /**
     * Display duplicates list
     */
    displayDuplicates() {
        const container = document.getElementById('duplicatesList');
        
        if (this.duplicates.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
                    <p>לא נמצאו כפילויות קוד</p>
                </div>
            `;
            return;
        }
        
        // Apply filters first
        this.applyFilters();
        
        // Display filtered results
        this.renderDuplicatesList();
    }

    /**
     * Apply filters to duplicates
     */
    applyFilters() {
        const typeFilter = document.getElementById('duplicateTypeFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const similarityThreshold = parseInt(document.getElementById('similarityRange').value) / 100;
        
        this.filteredDuplicates = this.duplicates.filter(duplicate => {
            // Type filter
            if (typeFilter !== 'all' && duplicate.type.toLowerCase() !== typeFilter) {
                return false;
            }
            
            // Category filter
            if (categoryFilter !== 'all' && duplicate.category !== categoryFilter) {
                return false;
            }
            
            // Similarity threshold
            if (duplicate.similarity < similarityThreshold) {
                return false;
            }
            
            return true;
        });
        
        this.renderDuplicatesList();
    }

    /**
     * Render duplicates list
     */
    renderDuplicatesList() {
        const container = document.getElementById('duplicatesList');
        
        if (this.filteredDuplicates.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-filter fa-3x mb-3"></i>
                    <p>לא נמצאו כפילויות העונות על המסננים</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        // Group by type
        const grouped = this.groupDuplicatesByType(this.filteredDuplicates);
        
        for (const [type, duplicates] of Object.entries(grouped)) {
            html += this.renderDuplicateGroup(type, duplicates);
        }
        
        container.innerHTML = html;
        
        // Add click handlers
        this.addDuplicateClickHandlers();
    }

    /**
     * Group duplicates by type
     */
    groupDuplicatesByType(duplicates) {
        const grouped = {
            exact: [],
            near: [],
            similar: [],
            potential: []
        };
        
        duplicates.forEach(duplicate => {
            grouped[duplicate.type.toLowerCase()].push(duplicate);
        });
        
        return grouped;
    }

    /**
     * Render duplicate group
     */
    renderDuplicateGroup(type, duplicates) {
        if (duplicates.length === 0) return '';
        
        const typeConfig = {
            exact: { title: 'כפילויות מדויקות', icon: 'fas fa-exclamation-triangle', color: 'danger' },
            near: { title: 'כפילויות קרובות', icon: 'fas fa-exclamation-circle', color: 'warning' },
            similar: { title: 'דפוסים דומים', icon: 'fas fa-info-circle', color: 'info' },
            potential: { title: 'כפילויות פוטנציאליות', icon: 'fas fa-question-circle', color: 'primary' }
        };
        
        const config = typeConfig[type];
        
        let html = `
            <div class="mb-4">
                <h6 class="text-${config.color} mb-3">
                    <i class="${config.icon} me-2"></i>
                    ${config.title} (${duplicates.length})
                </h6>
        `;
        
        duplicates.forEach(duplicate => {
            html += this.renderDuplicateCard(duplicate);
        });
        
        html += '</div>';
        
        return html;
    }

    /**
     * Render individual duplicate card
     */
    renderDuplicateCard(duplicate) {
        const confidenceClass = this.getConfidenceClass(duplicate.confidence);
        const similarityPercent = Math.round(duplicate.similarity * 100);
        
        return `
            <div class="card duplicate-card ${duplicate.type.toLowerCase()}" data-duplicate-id="${duplicate.func1.name}-${duplicate.func2.name}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="card-title mb-2">
                                ${duplicate.func1.name} ↔ ${duplicate.func2.name}
                            </h6>
                            <div class="mb-2">
                                <span class="badge category-badge bg-secondary me-2">${duplicate.category}</span>
                                <span class="badge category-badge bg-primary me-2">${duplicate.func1.file}</span>
                                <span class="badge category-badge bg-primary">${duplicate.func2.file}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="me-3">דמיון: ${similarityPercent}%</span>
                                <div class="similarity-bar flex-grow-1 me-3" style="max-width: 200px;">
                                    <div class="similarity-indicator" style="left: ${similarityPercent}%;"></div>
                                </div>
                                <span class="confidence-indicator ${confidenceClass}" title="רמת ביטחון: ${Math.round(duplicate.confidence * 100)}%"></span>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-outline-primary btn-sm" onclick="showDuplicateDetails('${duplicate.func1.name}-${duplicate.func2.name}')">
                                <i class="fas fa-eye me-1"></i>
                                צפה בפרטים
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get confidence class
     */
    getConfidenceClass(confidence) {
        if (confidence >= 0.8) return 'confidence-high';
        if (confidence >= 0.6) return 'confidence-medium';
        return 'confidence-low';
    }

    /**
     * Add click handlers for duplicate cards
     */
    addDuplicateClickHandlers() {
        // Handlers are added via onclick attributes in the HTML
    }

    /**
     * Show duplicate details modal
     */
    showDuplicateDetails(duplicateId) {
        const duplicate = this.findDuplicateById(duplicateId);
        if (!duplicate) return;
        
        const modal = new bootstrap.Modal(document.getElementById('duplicateDetailsModal'));
        const content = document.getElementById('duplicateDetailsContent');
        
        content.innerHTML = this.renderDuplicateDetails(duplicate);
        modal.show();
    }

    /**
     * Find duplicate by ID
     */
    findDuplicateById(duplicateId) {
        return this.filteredDuplicates.find(d => 
            `${d.func1.name}-${d.func2.name}` === duplicateId
        );
    }

    /**
     * Render duplicate details
     */
    renderDuplicateDetails(duplicate) {
        const similarityPercent = Math.round(duplicate.similarity * 100);
        const confidencePercent = Math.round(duplicate.confidence * 100);
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6>פונקציה 1: ${duplicate.func1.name}</h6>
                    <p><strong>קובץ:</strong> ${duplicate.func1.file}</p>
                    <p><strong>שורה:</strong> ${duplicate.func1.startLine}</p>
                    <p><strong>קטגוריה:</strong> ${duplicate.category}</p>
                    <p><strong>מורכבות:</strong> ${duplicate.func1.complexity}</p>
                </div>
                <div class="col-md-6">
                    <h6>פונקציה 2: ${duplicate.func2.name}</h6>
                    <p><strong>קובץ:</strong> ${duplicate.func2.file}</p>
                    <p><strong>שורה:</strong> ${duplicate.func2.startLine}</p>
                    <p><strong>קטגוריה:</strong> ${duplicate.category}</p>
                    <p><strong>מורכבות:</strong> ${duplicate.func2.complexity}</p>
                </div>
            </div>
            
            <hr>
            
            <div class="row">
                <div class="col-md-6">
                    <h6>מטריקות דמיון</h6>
                    <p><strong>דמיון כללי:</strong> ${similarityPercent}%</p>
                    <p><strong>רמת ביטחון:</strong> ${confidencePercent}%</p>
                    <p><strong>סוג כפילות:</strong> ${duplicate.type}</p>
                </div>
                <div class="col-md-6">
                    <h6>תכונות פונקציות</h6>
                    <p><strong>Try-Catch:</strong> ${duplicate.func1.hasTryCatch ? '✓' : '✗'} / ${duplicate.func2.hasTryCatch ? '✓' : '✗'}</p>
                    <p><strong>Logger:</strong> ${duplicate.func1.hasLogger ? '✓' : '✗'} / ${duplicate.func2.hasLogger ? '✓' : '✗'}</p>
                    <p><strong>Notification:</strong> ${duplicate.func1.hasNotification ? '✓' : '✗'} / ${duplicate.func2.hasNotification ? '✓' : '✗'}</p>
                </div>
            </div>
            
            ${this.renderRecommendations(duplicate)}
            
            <div class="file-comparison">
                <div>
                    <h6>${duplicate.func1.name} (${duplicate.func1.file})</h6>
                    <div class="file-content">${this.escapeHtml(duplicate.func1.content.substring(0, 500))}...</div>
                </div>
                <div>
                    <h6>${duplicate.func2.name} (${duplicate.func2.file})</h6>
                    <div class="file-content">${this.escapeHtml(duplicate.func2.content.substring(0, 500))}...</div>
                </div>
            </div>
        `;
    }

    /**
     * Render recommendations
     */
    renderRecommendations(duplicate) {
        if (!duplicate.recommendation || duplicate.recommendation.length === 0) {
            return '';
        }
        
        let html = `
            <hr>
            <h6>המלצות</h6>
            <div class="recommendation-box">
        `;
        
        duplicate.recommendation.forEach(rec => {
            html += `
                <div class="mb-3">
                    <h6 class="text-${rec.priority === 'HIGH' ? 'danger' : rec.priority === 'MEDIUM' ? 'warning' : 'info'}">
                        ${rec.priority}: ${rec.description}
                    </h6>
                    <p><strong>פעולה:</strong> ${rec.action}</p>
                    ${rec.steps ? `
                        <p><strong>שלבים:</strong></p>
                        <ol>
                            ${rec.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        
        return html;
    }

    /**
     * Escape HTML for display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Export report
     */
    async exportReport() {
        if (!this.currentReport) {
            window.showErrorNotification('אין דוח לייצוא', 'הרץ בדיקה קודם');
            return;
        }
        
        try {
            const blob = new Blob([JSON.stringify(this.currentReport, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `duplicate-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.showSuccessNotification('דוח יוצא בהצלחה');
            
        } catch (error) {
            window.Logger.error('Error exporting report:', error, { page: 'duplicate-detector' });
            window.showErrorNotification('שגיאה בייצוא דוח', error.message);
        }
    }
}

// Global functions for HTML onclick handlers
window.runDuplicateDetection = function() {
    if (window.duplicateDetectorUI) {
        window.duplicateDetectorUI.runDuplicateDetection();
    }
};

window.applyFilters = function() {
    if (window.duplicateDetectorUI) {
        window.duplicateDetectorUI.applyFilters();
    }
};

window.showDuplicateDetails = function(duplicateId) {
    if (window.duplicateDetectorUI) {
        window.duplicateDetectorUI.showDuplicateDetails(duplicateId);
    }
};

window.exportReport = function() {
    if (window.duplicateDetectorUI) {
        window.duplicateDetectorUI.exportReport();
    }
};

window.openInEditor = function() {
    window.showInfoNotification('פתיחה בעורך', 'תכונה זו תהיה זמינה בקרוב');
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.Logger.info('🚀 Initializing Duplicate Detector UI...', { page: 'duplicate-detector' });
    window.duplicateDetectorUI = new DuplicateDetectorUI();
    window.Logger.info('✅ Duplicate Detector UI ready', { page: 'duplicate-detector' });
});

window.Logger.info('✅ Duplicate Detector UI loaded', { page: 'duplicate-detector' });
