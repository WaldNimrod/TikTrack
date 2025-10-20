/**
 * Init System Management Page
 * עמוד ניהול מערכת האתחול
 */

// Global variables
let runtimeValidator = null;
let scriptAnalyzer = null;
let pageTemplateGenerator = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Initializing Init System Management page...');
    
    try {
        // Initialize tools
        runtimeValidator = new RuntimeValidator();
        scriptAnalyzer = new ScriptAnalyzer();
        pageTemplateGenerator = new PageTemplateGenerator();
        
        // Load initial data
        await loadSystemStatus();
        await loadPackagesList();
        await loadPagesMapping();
        await loadPerformanceReport();
        loadPackagesCheckboxes();
        
        // Load advanced monitoring
        await loadAdvancedMonitoring();
        
        console.log('✅ Init System Management page initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Init System Management page:', error);
        showNotification('שגיאה באתחול עמוד ניהול מערכת', 'error');
    }
});

/**
 * Load system status
 */
async function loadSystemStatus() {
    try {
        // Get unified app status
        const status = window.getUnifiedAppStatus ? window.getUnifiedAppStatus() : null;
        
        // Get package manifest stats
        const packageStats = window.PackageManifest ? window.PackageManifest.getStats() : null;
        
        // Get current page info
        const pageName = window.location.pathname.split('/').pop().replace('.html', '');
        const pageConfig = window.PAGE_CONFIGS ? window.PAGE_CONFIGS[pageName] : null;
        
        // Update status cards
        const systemStatusCard = document.getElementById('systemStatusCard');
        const pagesCountCard = document.getElementById('pagesCountCard');
        const packagesCountCard = document.getElementById('packagesCountCard');
        
        if (systemStatusCard) {
            const isInitialized = status && status.initialized;
            const statusText = isInitialized ? 'פעילה' : 'לא פעילה';
            const statusIcon = isInitialized ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
            systemStatusCard.innerHTML = `<i class="fas ${statusIcon}"></i> ${statusText}`;
        }
        
        if (pagesCountCard) {
            const pagesCount = Object.keys(window.PAGE_CONFIGS || {}).length;
            pagesCountCard.innerHTML = `<i class="fas fa-file-alt"></i> ${pagesCount}`;
        }
        
        if (packagesCountCard) {
            const packagesCount = Object.keys(window.PACKAGE_MANIFEST || {}).length;
            packagesCountCard.innerHTML = `<i class="fas fa-boxes"></i> ${packagesCount}`;
        }
        
        
    } catch (error) {
        console.error('❌ Failed to load system status:', error);
    }
}

/**
 * Load pages mapping
 */
async function loadPagesMapping() {
    const mappingContainer = document.getElementById('pagesMapping');
    const statsContainer = document.getElementById('pagesStats');
    
    try {
        if (!window.PAGE_CONFIGS) {
            if (mappingContainer) {
                mappingContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        PAGE_CONFIGS לא זמין
                    </div>
                `;
            }
            return;
        }
        
        const pages = Object.entries(window.PAGE_CONFIGS);
        
        // Update pages stats card
        if (statsContainer) {
            const totalPages = pages.length;
            const pagesWithPackages = pages.filter(([_, config]) => config.packages && config.packages.length > 0).length;
            const pagesWithGlobals = pages.filter(([_, config]) => config.requiredGlobals && config.requiredGlobals.length > 0).length;
            
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${totalPages}</div>
                        <div class="stat-label">סך עמודים</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${pagesWithPackages}</div>
                        <div class="stat-label">עם חבילות</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${pagesWithGlobals}</div>
                        <div class="stat-label">עם Globals</div>
                    </div>
                </div>
            `;
        }
        
        let mappingHTML = `
            <div class="pages-grid">
        `;
        
        pages.forEach(([pageId, config]) => {
            const packagesList = config.packages?.map(pkg => {
                const pkgInfo = window.PACKAGE_MANIFEST?.[pkg];
                return pkgInfo ? `${pkgInfo.name} (${pkg})` : pkg;
            }).join(', ') || 'אין חבילות';
            
            const globalsList = config.requiredGlobals?.join(', ') || 'אין globals';
            
            mappingHTML += `
                <div class="page-card">
                    <div class="page-header">
                        <h5>${config.name || pageId}</h5>
                        <span class="page-id">${pageId}</span>
                    </div>
                    <div class="page-body">
                        <div class="page-info">
                            <div class="info-item">
                                <strong>תיאור:</strong> ${config.description || 'ללא תיאור'}
                            </div>
                            <div class="info-item">
                                <strong>סוג עמוד:</strong> ${config.pageType || 'standard'}
                            </div>
                            <div class="info-item">
                                <strong>חבילות:</strong> ${packagesList}
                            </div>
                            <div class="info-item">
                                <strong>Globals נדרשים:</strong> ${globalsList}
                            </div>
                            <div class="info-item">
                                <strong>דורש פילטרים:</strong> ${config.requiresFilters ? 'כן' : 'לא'}
                            </div>
                            <div class="info-item">
                                <strong>דורש ולידציה:</strong> ${config.requiresValidation ? 'כן' : 'לא'}
                            </div>
                            <div class="info-item">
                                <strong>דורש טבלאות:</strong> ${config.requiresTables ? 'כן' : 'לא'}
                            </div>
                            <div class="info-item">
                                <strong>אתחולים מותאמים:</strong> ${config.customInitializers?.length || 0}
                            </div>
                            <div class="info-item">
                                <strong>עודכן לאחרונה:</strong> ${config.lastModified || 'לא ידוע'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        mappingHTML += `
            </div>
            <div class="mapping-summary mt-3">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    סה"כ <strong>${pages.length}</strong> עמודים מוגדרים במערכת
                </div>
            </div>
        `;
        
        mappingContainer.innerHTML = mappingHTML;
        
    } catch (error) {
        console.error('❌ Failed to load pages mapping:', error);
        mappingContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בטעינת מיפוי עמודים: ${error.message}
            </div>
        `;
    }
}

/**
 * Load packages list
 */
async function loadPackagesList() {
    const packagesContainer = document.getElementById('packagesList');
    
    try {
        if (!window.PACKAGE_MANIFEST) {
            packagesContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Package Manifest לא זמין
                </div>
            `;
            return;
        }
        
        const packages = Object.values(window.PACKAGE_MANIFEST);
        let packagesHTML = '';
        
        packages.forEach(pkg => {
            const criticalClass = pkg.critical ? 'border-danger' : 'border-primary';
            const dependenciesText = pkg.dependencies?.length > 0 ? 
                `תלויות: ${pkg.dependencies.join(', ')}` : 'אין תלויות';
            
            packagesHTML += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 ${criticalClass}">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${pkg.name}</h6>
                            <div>
                                ${pkg.critical ? '<span class="badge bg-danger">קריטי</span>' : '<span class="badge bg-primary">אופציונלי</span>'}
                                <small class="text-muted">${pkg.id}</small>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="card-text">${pkg.description}</p>
                            <div class="row g-2">
                                <div class="col-6">
                                    <small class="text-muted">סקריפטים:</small>
                                    <div class="fw-bold">${pkg.scripts?.length || 0}</div>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">גודל:</small>
                                    <div class="fw-bold">${pkg.estimatedSize || 'לא ידוע'}</div>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">סדר טעינה:</small>
                                    <div class="fw-bold">${pkg.loadOrder || 'לא מוגדר'}</div>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">גרסה:</small>
                                    <div class="fw-bold">${pkg.version || '1.0.0'}</div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <small class="text-muted">${dependenciesText}</small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        packagesContainer.innerHTML = packagesHTML;
        
    } catch (error) {
        console.error('❌ Failed to load packages list:', error);
        packagesContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בטעינת רשימת חבילות: ${error.message}
            </div>
        `;
    }
}

/**
 * Load performance report
 */
async function loadPerformanceReport() {
    const reportContainer = document.getElementById('performanceReport');
    
    try {
        // Update performance cards
        const performanceCard1 = document.getElementById('performanceCard1');
        const performanceCard2 = document.getElementById('performanceCard2');
        const performanceCard3 = document.getElementById('performanceCard3');
        
        // Get performance report from unified initializer
        const report = window.unifiedAppInit?.getPerformanceReport ? 
            window.unifiedAppInit.getPerformanceReport() : null;
        
        if (performanceCard1) {
            performanceCard1.innerHTML = report ? 
                `<i class="fas fa-clock"></i> ${report.averageLoadTime || 'N/A'}ms` : 
                '<i class="fas fa-spinner fa-spin"></i> טוען...';
        }
        
        if (performanceCard2) {
            performanceCard2.innerHTML = report ? 
                `<i class="fas fa-memory"></i> ${report.memoryUsage || 'N/A'}MB` : 
                '<i class="fas fa-spinner fa-spin"></i> טוען...';
        }
        
        if (performanceCard3) {
            const trendIcon = report && report.trend === 'improving' ? 'fa-arrow-up text-success' : 
                             report && report.trend === 'degrading' ? 'fa-arrow-down text-danger' : 'fa-minus text-muted';
            performanceCard3.innerHTML = report ? 
                `<i class="fas ${trendIcon}"></i> ${report.overallScore || 'N/A'}/100` : 
                '<i class="fas fa-spinner fa-spin"></i> טוען...';
        }
        
        if (!report) {
            if (reportContainer) {
                reportContainer.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        אין נתוני ביצועים זמינים
                    </div>
                `;
            }
            return;
        }
        
        const trendIcon = report.trend === 'improving' ? 'fa-arrow-up text-success' : 
                         report.trend === 'degrading' ? 'fa-arrow-down text-danger' : 'fa-minus text-muted';
        
        let reportHTML = `
            <div class="performance-grid">
                <div class="performance-card">
                    <h4><i class="fas fa-clock"></i> זמני טעינה</h4>
                    <div class="performance-item">
                        <span class="label">זמן נוכחי:</span>
                        <span class="value">${report.current.totalTime}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">זמן ממוצע:</span>
                        <span class="value">${report.average || 'N/A'}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">טרנד:</span>
                        <span class="value">
                            <i class="fas ${trendIcon}"></i>
                            ${report.trend || 'לא זמין'}
                        </span>
                    </div>
                </div>
                
                <div class="performance-card">
                    <h4><i class="fas fa-memory"></i> זיכרון</h4>
                    <div class="performance-item">
                        <span class="label">זיכרון בשימוש:</span>
                        <span class="value">${report.current.memoryUsage ? 
                            Math.round(report.current.memoryUsage.used / 1024 / 1024) + 'MB' : 'N/A'}</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">זיכרון כולל:</span>
                        <span class="value">${report.current.memoryUsage ? 
                            Math.round(report.current.memoryUsage.total / 1024 / 1024) + 'MB' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="performance-card">
                    <h4><i class="fas fa-layer-group"></i> שלבי אתחול</h4>
                    <div class="performance-item">
                        <span class="label">זיהוי:</span>
                        <span class="value">${report.current.stages.detect || 0}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">הכנה:</span>
                        <span class="value">${report.current.stages.prepare || 0}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">ביצוע:</span>
                        <span class="value">${report.current.stages.execute || 0}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">סיום:</span>
                        <span class="value">${report.current.stages.finalize || 0}ms</span>
                    </div>
                </div>
            </div>
        `;
        
        reportContainer.innerHTML = reportHTML;
        
    } catch (error) {
        console.error('❌ Failed to load performance report:', error);
        reportContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בטעינת דוח ביצועים: ${error.message}
            </div>
        `;
    }
}

/**
 * Load packages checkboxes for page generator
 */
function loadPackagesCheckboxes() {
    const checkboxesContainer = document.getElementById('packagesCheckboxes');
    
    if (!window.PACKAGE_MANIFEST) {
        checkboxesContainer.innerHTML = '<div class="alert alert-warning">Package Manifest לא זמין</div>';
        return;
    }
    
    const packages = Object.values(window.PACKAGE_MANIFEST);
    let checkboxesHTML = '';
    
    packages.forEach(pkg => {
        const isChecked = pkg.critical ? 'checked' : '';
        const disabled = pkg.critical ? 'disabled' : '';
        
        checkboxesHTML += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                       value="${pkg.id}" id="pkg-${pkg.id}" 
                       ${isChecked} ${disabled}>
                <label class="form-check-label" for="pkg-${pkg.id}">
                    ${pkg.name}
                    ${pkg.critical ? '<span class="badge bg-danger ms-1">קריטי</span>' : ''}
                    <small class="text-muted d-block">${pkg.description}</small>
                </label>
            </div>
        `;
    });
    
    checkboxesContainer.innerHTML = checkboxesHTML;
}

/**
 * Run validator
 */
function runValidator() {
    const resultsContainer = document.getElementById('toolsResults');
    
    try {
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> מריץ בדיקות...</div>';
        
        const report = runtimeValidator.runChecks();
        const detailedReport = runtimeValidator.getDetailedReport();
        
        let resultsHTML = `
            <div class="validator-results">
                <h4>🔍 תוצאות בדיקות תקינות</h4>
                <div class="results-summary">
                    <span class="badge ${detailedReport.summary.status === 'success' ? 'bg-success' : 'bg-warning'}">
                        ${detailedReport.summary.totalIssues} בעיות נמצאו
                    </span>
                </div>
        `;
        
        if (detailedReport.issues.duplicates.count > 0) {
            resultsHTML += `
                <div class="issue-section">
                    <h5 class="text-danger">🔴 סקריפטים כפולים (${detailedReport.issues.duplicates.count})</h5>
                    <ul>
                        ${detailedReport.issues.duplicates.items.map(item => 
                            `<li>${item.src} - ${item.message}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (detailedReport.issues.missing.count > 0) {
            resultsHTML += `
                <div class="issue-section">
                    <h5 class="text-danger">🔴 מערכות חסרות (${detailedReport.issues.missing.count})</h5>
                    <ul>
                        ${detailedReport.issues.missing.items.map(item => 
                            `<li>${item.global} - ${item.message}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (detailedReport.issues.orderIssues.count > 0) {
            resultsHTML += `
                <div class="issue-section">
                    <h5 class="text-warning">⚠️ בעיות סדר טעינה (${detailedReport.issues.orderIssues.count})</h5>
                    <ul>
                        ${detailedReport.issues.orderIssues.items.map(item => 
                            `<li>${item.message}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (detailedReport.issues.versionIssues.count > 0) {
            resultsHTML += `
                <div class="issue-section">
                    <h5 class="text-warning">⚠️ סקריפטים ללא גרסה (${detailedReport.issues.versionIssues.count})</h5>
                    <ul>
                        ${detailedReport.issues.versionIssues.items.map(item => 
                            `<li>${item.src} - ${item.message}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (detailedReport.summary.totalIssues === 0) {
            resultsHTML += `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    כל הבדיקות עברו בהצלחה!
                </div>
            `;
        }
        
        resultsHTML += '</div>';
        resultsContainer.innerHTML = resultsHTML;
        
    } catch (error) {
        console.error('❌ Failed to run validator:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בהרצת בדיקות: ${error.message}
            </div>
        `;
    }
}

/**
 * Analyze scripts
 */
function analyzeScripts() {
    const resultsContainer = document.getElementById('toolsResults');
    
    try {
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> מנתח סקריפטים...</div>';
        
        const report = scriptAnalyzer.analyze();
        const suggestions = scriptAnalyzer.getOptimizationSuggestions();
        
        let resultsHTML = `
            <div class="script-analysis-results">
                <h4>📊 ניתוח סקריפטים</h4>
                <div class="analysis-summary">
                    <div class="stat">
                        <span class="label">סה"כ סקריפטים:</span>
                        <span class="value">${report.totalScripts}</span>
                    </div>
                    <div class="stat">
                        <span class="label">כפילויות:</span>
                        <span class="value ${report.duplicates.length > 0 ? 'error' : 'success'}">${report.duplicates.length}</span>
                    </div>
                    <div class="stat">
                        <span class="label">חסרי גרסה:</span>
                        <span class="value ${report.missingVersions.length > 0 ? 'warning' : 'success'}">${report.missingVersions.length}</span>
                    </div>
                    <div class="stat">
                        <span class="label">חוסמים:</span>
                        <span class="value ${report.performance.blockingScripts > 5 ? 'warning' : 'success'}">${report.performance.blockingScripts}</span>
                    </div>
                </div>
        `;
        
        if (report.packages.length > 0) {
            resultsHTML += `
                <div class="packages-section">
                    <h5>📦 חבילות נטענות</h5>
                    <ul>
                        ${report.packages.map(pkg => 
                            `<li>${pkg.displayName}: ${pkg.scripts} סקריפטים, ${pkg.size}, ${pkg.loadTime}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (suggestions.length > 0) {
            resultsHTML += `
                <div class="suggestions-section">
                    <h5>💡 הצעות אופטימיזציה</h5>
                    <ul>
                        ${suggestions.map(suggestion => `
                            <li class="suggestion ${suggestion.priority}">
                                <strong>${suggestion.message}</strong>
                                ${suggestion.details ? `<br><small>${suggestion.details}</small>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        resultsHTML += '</div>';
        resultsContainer.innerHTML = resultsHTML;
        
    } catch (error) {
        console.error('❌ Failed to analyze scripts:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בניתוח סקריפטים: ${error.message}
            </div>
        `;
    }
}

/**
 * Show performance
 */
function showPerformance() {
    const resultsContainer = document.getElementById('toolsResults');
    
    try {
        const report = window.unifiedAppInit?.getPerformanceReport ? 
            window.unifiedAppInit.getPerformanceReport() : null;
        
        if (!report) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    אין נתוני ביצועים זמינים
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="performance-results">
                <h4>📊 דוח ביצועים מפורט</h4>
                <div class="performance-details">
                    <div class="performance-item">
                        <span class="label">זמן טעינה נוכחי:</span>
                        <span class="value">${report.current.totalTime}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">זמן טעינה ממוצע:</span>
                        <span class="value">${report.average || 'N/A'}ms</span>
                    </div>
                    <div class="performance-item">
                        <span class="label">טרנד ביצועים:</span>
                        <span class="value">${report.trend || 'לא זמין'}</span>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Failed to show performance:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בהצגת ביצועים: ${error.message}
            </div>
        `;
    }
}

/**
 * Run standardization analysis
 */
function runStandardizationAnalysis() {
    const resultsContainer = document.getElementById('toolsResults');
    
    try {
        if (!window.PageStandardizer) {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    PageStandardizer לא זמין
                </div>
            `;
            return;
        }
        
        const standardizer = new window.PageStandardizer();
        const results = standardizer.analyzeAllPages();
        
        let html = `
            <div class="standardization-report">
                <h4><i class="fas fa-cogs"></i> דוח סטנדרטיזציה</h4>
                <div class="report-summary mb-3">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="card-title">${results.length}</h5>
                                    <p class="card-text">סה"כ עמודים</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="card-title">${results.filter(r => window.PAGE_CONFIGS?.[r.pageName]).length}</h5>
                                    <p class="card-text">עם קונפיג</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="card-title">${(results.reduce((sum, r) => sum + r.scriptCount, 0) / results.length).toFixed(1)}</h5>
                                    <p class="card-text">סקריפטים ממוצע</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h5 class="card-title">${results.reduce((sum, r) => sum + r.scriptCount, 0)}</h5>
                                    <p class="card-text">סה"כ סקריפטים</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="pages-analysis">
                    <h5>ניתוח עמודים:</h5>
                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>עמוד</th>
                                    <th>חבילות</th>
                                    <th>סקריפטים</th>
                                    <th>סטטוס</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        results.forEach(result => {
            const hasConfig = !!window.PAGE_CONFIGS?.[result.pageName];
            const status = hasConfig ? '✅ מוגדר' : '❌ חסר';
            const statusClass = hasConfig ? 'text-success' : 'text-danger';
            
            html += `
                <tr>
                    <td><code>${result.pageName}</code></td>
                    <td>${result.packages.join(', ')}</td>
                    <td>${result.scriptCount}</td>
                    <td class="${statusClass}">${status}</td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="recommendations mt-3">
                    <h5>המלצות:</h5>
                    <ul class="list-group">
                        <li class="list-group-item">✅ עדכן HTML files להשתמש בטעינת סקריפטים סטנדרטית</li>
                        <li class="list-group-item">🗑️ הסר סקריפטים כפולים ומיותרים</li>
                        <li class="list-group-item">🔧 וודא שכל העמודים משתמשים ב-unified-app-initializer</li>
                        <li class="list-group-item">🧪 בדוק כל עמוד אחרי סטנדרטיזציה</li>
                    </ul>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Failed to run standardization analysis:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בניתוח סטנדרטיזציה: ${error.message}
            </div>
        `;
    }
}

/**
 * Check for duplicate initialization across all pages
 */
async function checkDuplicateInitialization() {
    const resultsContainer = document.getElementById('toolsResults');
    
    try {
        if (!window.DuplicateInitializationChecker) {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    DuplicateInitializationChecker לא זמין
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">בודק עמודים...</span>
                </div>
                <p class="mt-2">בודק אתחול כפול ונוסף בכל העמודים...</p>
            </div>
        `;
        
        const checker = new window.DuplicateInitializationChecker();
        const results = await checker.checkAllPages();
        const report = checker.generateReport(results);
        
        // Convert console report to HTML
        const htmlReport = report
            .replace(/\n/g, '<br>')
            .replace(/=/g, '═')
            .replace(/✅/g, '<span class="text-success">✅</span>')
            .replace(/❌/g, '<span class="text-danger">❌</span>')
            .replace(/🔄/g, '<span class="text-warning">🔄</span>')
            .replace(/⚠️/g, '<span class="text-warning">⚠️</span>')
            .replace(/📊/g, '<span class="text-info">📊</span>')
            .replace(/📈/g, '<span class="text-info">📈</span>')
            .replace(/🔴/g, '<span class="text-danger">🔴</span>')
            .replace(/📋/g, '<span class="text-primary">📋</span>')
            .replace(/🎯/g, '<span class="text-success">🎯</span>');
        
        resultsContainer.innerHTML = `
            <div class="duplicate-check-report">
                <h4><i class="fas fa-exclamation-triangle"></i> דוח בדיקת אתחול כפול</h4>
                <div class="report-content" style="font-family: monospace; white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 600px; overflow-y: auto;">
                    ${htmlReport}
                </div>
                
                <div class="action-buttons mt-3">
                    <button onclick="copyReportToClipboard()" class="btn btn-outline-primary">
                        <i class="fas fa-copy"></i> העתק דוח
                    </button>
                    <button onclick="exportReportAsFile()" class="btn btn-outline-success">
                        <i class="fas fa-download"></i> ייצא לקובץ
                    </button>
                </div>
            </div>
        `;
        
        // Store report for copying/exporting
        window.lastDuplicateCheckReport = report;
        
    } catch (error) {
        console.error('❌ Failed to check duplicate initialization:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בבדיקת אתחול כפול: ${error.message}
            </div>
        `;
    }
}

/**
 * Copy report to clipboard
 */
function copyReportToClipboard() {
    if (window.lastDuplicateCheckReport) {
        navigator.clipboard.writeText(window.lastDuplicateCheckReport).then(() => {
            if (window.NotificationSystem) {
                window.NotificationSystem.showNotification('דוח הועתק ללוח', 'success');
            }
        }).catch(err => {
            console.error('Failed to copy report:', err);
        });
    }
}

/**
 * Export report as file
 */
function exportReportAsFile() {
    if (window.lastDuplicateCheckReport) {
        const blob = new Blob([window.lastDuplicateCheckReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-initialization-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.NotificationSystem) {
            window.NotificationSystem.showNotification('דוח יוצא לקובץ', 'success');
        }
    }
}

/**
 * Show package stats
 */
function showPackageStats() {
    const resultsContainer = document.getElementById('toolsResults');
    
    try {
        const stats = window.PackageManifest?.getStats ? 
            window.PackageManifest.getStats() : null;
        
        if (!stats) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    אין נתוני חבילות זמינים
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="package-stats-results">
                <h4>📦 סטטיסטיקות חבילות</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h5>סה"כ חבילות</h5>
                        <div class="stat-value">${stats.totalPackages}</div>
                    </div>
                    <div class="stat-card">
                        <h5>חבילות קריטיות</h5>
                        <div class="stat-value">${stats.criticalPackages}</div>
                    </div>
                    <div class="stat-card">
                        <h5>סה"כ סקריפטים</h5>
                        <div class="stat-value">${stats.totalScripts}</div>
                    </div>
                    <div class="stat-card">
                        <h5>גודל משוער</h5>
                        <div class="stat-value">${stats.estimatedTotalSize}</div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Failed to show package stats:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בהצגת סטטיסטיקות חבילות: ${error.message}
            </div>
        `;
    }
}

/**
 * Generate page
 */
function generatePage() {
    const pageName = document.getElementById('newPageName').value.trim();
    const selectedPackages = getSelectedPackages();
    
    if (!pageName) {
        showNotification('אנא הזן שם עמוד', 'warning');
        return;
    }
    
    try {
        const html = pageTemplateGenerator.generate(pageName, selectedPackages);
        displayGeneratedContent('HTML', html);
        
    } catch (error) {
        console.error('❌ Failed to generate page:', error);
        showNotification('שגיאה ביצירת עמוד', 'error');
    }
}

/**
 * Generate config
 */
function generateConfig() {
    const pageName = document.getElementById('newPageName').value.trim();
    const selectedPackages = getSelectedPackages();
    
    if (!pageName) {
        showNotification('אנא הזן שם עמוד', 'warning');
        return;
    }
    
    try {
        const config = pageTemplateGenerator.generateConfig(pageName, selectedPackages);
        displayGeneratedContent('Config', config);
        
    } catch (error) {
        console.error('❌ Failed to generate config:', error);
        showNotification('שגיאה ביצירת קונפיג', 'error');
    }
}

/**
 * Generate JavaScript
 */
function generateJavaScript() {
    const pageName = document.getElementById('newPageName').value.trim();
    const selectedPackages = getSelectedPackages();
    
    if (!pageName) {
        showNotification('אנא הזן שם עמוד', 'warning');
        return;
    }
    
    try {
        const javascript = pageTemplateGenerator.generateJavaScriptTemplate(pageName);
        displayGeneratedContent('JavaScript', javascript);
        
    } catch (error) {
        console.error('❌ Failed to generate JavaScript:', error);
        showNotification('שגיאה ביצירת JavaScript', 'error');
    }
}

/**
 * Get selected packages
 */
function getSelectedPackages() {
    const checkboxes = document.querySelectorAll('#packagesCheckboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Display generated content
 */
function displayGeneratedContent(type, content) {
    const container = document.getElementById('generatedContent');
    
    container.innerHTML = `
        <div class="generated-content">
            <div class="generated-header">
                <h4>📄 ${type} שנוצר</h4>
                <button onclick="copyToClipboard('${type.toLowerCase()}')" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-copy"></i> העתק
                </button>
            </div>
            <pre class="generated-code"><code>${escapeHtml(content)}</code></pre>
        </div>
    `;
    
    // Store content for copying
    window.generatedContent = {
        html: type === 'HTML' ? content : null,
        config: type === 'Config' ? content : null,
        javascript: type === 'JavaScript' ? content : null
    };
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(type) {
    const content = window.generatedContent?.[type.toLowerCase()];
    
    if (!content) {
        showNotification('אין תוכן להעתקה', 'warning');
        return;
    }
    
    try {
        await pageTemplateGenerator.copyToClipboard(content);
    } catch (error) {
        console.error('❌ Failed to copy to clipboard:', error);
        showNotification('שגיאה בהעתקה ללוח', 'error');
    }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    if (typeof window.NotificationSystem !== 'undefined' && window.NotificationSystem.showNotification) {
        window.NotificationSystem.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// ===== ADVANCED MONITORING SYSTEM =====

/**
 * Load advanced monitoring data
 */
async function loadAdvancedMonitoring() {
    console.log('🔍 Loading advanced monitoring...');
    
    try {
        await Promise.all([
            loadScriptTests(),
            loadDependencyTests(),
            loadPerformanceTests(),
            loadValidationTests()
        ]);
        
        console.log('✅ Advanced monitoring loaded');
    } catch (error) {
        console.error('❌ Failed to load advanced monitoring:', error);
        showNotification('שגיאה בטעינת ניטור מתקדם', 'error');
    }
}

/**
 * Load script tests
 */
async function loadScriptTests() {
    const container = document.getElementById('scriptTests');
    
    try {
        const tests = await runScriptTests();
        displayTestResults(container, 'בדיקות סקריפטים', tests);
    } catch (error) {
        container.innerHTML = `<div class="error">שגיאה בטעינת בדיקות סקריפטים: ${error.message}</div>`;
    }
}

/**
 * Load dependency tests
 */
async function loadDependencyTests() {
    const container = document.getElementById('dependencyTests');
    
    try {
        const tests = await runDependencyTests();
        displayTestResults(container, 'בדיקות תלויות', tests);
    } catch (error) {
        container.innerHTML = `<div class="error">שגיאה בטעינת בדיקות תלויות: ${error.message}</div>`;
    }
}

/**
 * Load performance tests
 */
async function loadPerformanceTests() {
    const container = document.getElementById('performanceTests');
    
    try {
        const tests = await runPerformanceTests();
        displayTestResults(container, 'בדיקות ביצועים', tests);
    } catch (error) {
        container.innerHTML = `<div class="error">שגיאה בטעינת בדיקות ביצועים: ${error.message}</div>`;
    }
}

/**
 * Load validation tests
 */
async function loadValidationTests() {
    const container = document.getElementById('validationTests');
    
    try {
        const tests = await runValidationTests();
        displayTestResults(container, 'בדיקות ולידציה', tests);
    } catch (error) {
        container.innerHTML = `<div class="error">שגיאה בטעינת בדיקות ולידציה: ${error.message}</div>`;
    }
}

/**
 * Run script tests
 */
async function runScriptTests() {
    const tests = [];
    
    // Test 1: Check if all required scripts are loaded
    const requiredScripts = [
        'unified-app-initializer.js',
        'package-manifest.js',
        'page-initialization-configs.js',
        'notification-system.js',
        'ui-utils.js'
    ];
    
    for (const script of requiredScripts) {
        const isLoaded = document.querySelector(`script[src*="${script}"]`) !== null;
        tests.push({
            name: `סקריפט ${script}`,
            status: isLoaded ? 'success' : 'error',
            message: isLoaded ? 'נטען בהצלחה' : 'לא נטען',
            details: isLoaded ? `סקריפט ${script} נמצא בעמוד` : `סקריפט ${script} חסר מהעמוד`
        });
    }
    
    // Test 2: Check script loading order
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const initScriptIndex = scripts.findIndex(s => s.src.includes('unified-app-initializer.js'));
    const manifestScriptIndex = scripts.findIndex(s => s.src.includes('package-manifest.js'));
    
    const correctOrder = manifestScriptIndex < initScriptIndex;
    tests.push({
        name: 'סדר טעינת סקריפטים',
        status: correctOrder ? 'success' : 'warning',
        message: correctOrder ? 'סדר נכון' : 'סדר שגוי',
        details: correctOrder ? 
            'package-manifest.js נטען לפני unified-app-initializer.js' : 
            'package-manifest.js צריך להיטען לפני unified-app-initializer.js'
    });
    
    // Test 3: Check for duplicate scripts
    const scriptSources = scripts.map(s => s.src);
    const duplicates = scriptSources.filter((src, index) => scriptSources.indexOf(src) !== index);
    
    tests.push({
        name: 'סקריפטים כפולים',
        status: duplicates.length === 0 ? 'success' : 'error',
        message: duplicates.length === 0 ? 'אין כפילויות' : `${duplicates.length} כפילויות נמצאו`,
        details: duplicates.length === 0 ? 
            'כל הסקריפטים נטענים פעם אחת בלבד' : 
            `סקריפטים כפולים: ${duplicates.join(', ')}`
    });
    
    return tests;
}

/**
 * Run dependency tests
 */
async function runDependencyTests() {
    const tests = [];
    
    // Test 1: Check package dependencies
    if (window.PACKAGE_MANIFEST) {
        const packages = Object.keys(window.PACKAGE_MANIFEST);
        tests.push({
            name: 'חבילות זמינות',
            status: packages.length > 0 ? 'success' : 'error',
            message: `${packages.length} חבילות זמינות`,
            details: `חבילות: ${packages.join(', ')}`
        });
        
        // Test 2: Check base package
        const basePackage = window.PACKAGE_MANIFEST.base;
        if (basePackage) {
            tests.push({
                name: 'חבילת Base',
                status: 'success',
                message: 'חבילת Base זמינה',
                details: `${basePackage.scripts.length} סקריפטים בחבילת Base`
            });
        } else {
            tests.push({
                name: 'חבילת Base',
                status: 'error',
                message: 'חבילת Base חסרה',
                details: 'חבילת Base חובה לכל העמודים'
            });
        }
    } else {
        tests.push({
            name: 'מנפסט חבילות',
            status: 'error',
            message: 'מנפסט חבילות לא זמין',
            details: 'window.PACKAGE_MANIFEST לא מוגדר'
        });
    }
    
    // Test 3: Check page configurations
    if (window.PAGE_CONFIGS) {
        const pageName = window.location.pathname.split('/').pop().replace('.html', '');
        const pageConfig = window.PAGE_CONFIGS[pageName];
        
        if (pageConfig) {
            tests.push({
                name: 'קונפיגורציית עמוד',
                status: 'success',
                message: 'קונפיגורציה זמינה',
                details: `עמוד ${pageName} מוגדר עם ${pageConfig.packages?.length || 0} חבילות`
            });
        } else {
            tests.push({
                name: 'קונפיגורציית עמוד',
                status: 'warning',
                message: 'קונפיגורציה חסרה',
                details: `עמוד ${pageName} לא מוגדר ב-PAGE_CONFIGS`
            });
        }
    }
    
    return tests;
}

/**
 * Run performance tests
 */
async function runPerformanceTests() {
    const tests = [];
    
    // Test 1: Check page load time
    const loadTime = performance.now();
    tests.push({
        name: 'זמן טעינת עמוד',
        status: loadTime < 1000 ? 'success' : loadTime < 3000 ? 'warning' : 'error',
        message: `${Math.round(loadTime)}ms`,
        details: loadTime < 1000 ? 'טעינה מהירה' : loadTime < 3000 ? 'טעינה בינונית' : 'טעינה איטית'
    });
    
    // Test 2: Check memory usage
    if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
        tests.push({
            name: 'שימוש בזיכרון',
            status: memoryUsage < 50 ? 'success' : memoryUsage < 100 ? 'warning' : 'error',
            message: `${Math.round(memoryUsage)}MB`,
            details: memoryUsage < 50 ? 'שימוש נמוך בזיכרון' : memoryUsage < 100 ? 'שימוש בינוני בזיכרון' : 'שימוש גבוה בזיכרון'
        });
    }
    
    // Test 3: Check script count
    const scriptCount = document.querySelectorAll('script[src]').length;
    tests.push({
        name: 'מספר סקריפטים',
        status: scriptCount < 20 ? 'success' : scriptCount < 30 ? 'warning' : 'error',
        message: `${scriptCount} סקריפטים`,
        details: scriptCount < 20 ? 'מספר סקריפטים סביר' : scriptCount < 30 ? 'מספר סקריפטים גבוה' : 'מספר סקריפטים גבוה מאוד'
    });
    
    return tests;
}

/**
 * Run validation tests
 */
async function runValidationTests() {
    const tests = [];
    
    // Test 1: Check unified app initializer
    if (window.unifiedAppInit) {
        const statusObj = window.unifiedAppInit.getStatus ? window.unifiedAppInit.getStatus() : null;
        const isInitialized = statusObj && statusObj.initialized;
        const statusText = isInitialized ? 'מאותחלת' : 'לא מאותחלת';
        const statusValue = isInitialized ? 'initialized' : 'not-initialized';
        
        tests.push({
            name: 'מערכת אתחול מאוחדת',
            status: isInitialized ? 'success' : 'warning',
            message: statusText,
            details: `סטטוס: ${statusValue}`
        });
    } else {
        tests.push({
            name: 'מערכת אתחול מאוחדת',
            status: 'error',
            message: 'לא זמינה',
            details: 'window.unifiedAppInit לא מוגדר'
        });
    }
    
    // Test 2: Check notification system
    if (window.NotificationSystem) {
        tests.push({
            name: 'מערכת התראות',
            status: 'success',
            message: 'זמינה',
            details: 'window.NotificationSystem זמין'
        });
    } else {
        tests.push({
            name: 'מערכת התראות',
            status: 'error',
            message: 'לא זמינה',
            details: 'window.NotificationSystem לא מוגדר'
        });
    }
    
    // Test 3: Check button system
    if (window.ButtonSystem || window.advancedButtonSystem) {
        tests.push({
            name: 'מערכת כפתורים',
            status: 'success',
            message: 'זמינה',
            details: 'מערכת כפתורים זמינה'
        });
    } else {
        tests.push({
            name: 'מערכת כפתורים',
            status: 'error',
            message: 'לא זמינה',
            details: 'מערכת כפתורים לא מוגדרת'
        });
    }
    
    return tests;
}

/**
 * Display test results
 */
function displayTestResults(container, title, tests) {
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.status === 'success').length;
    const failedTests = tests.filter(t => t.status === 'error').length;
    const warningTests = tests.filter(t => t.status === 'warning').length;
    
    // Add monitoring system explanation if there are errors
    let explanationHtml = '';
    if (failedTests > 0) {
        explanationHtml = `
            <div class="monitoring-explanation error">
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle"></i> Critical Errors Detected</h6>
                    <p><strong>These are REAL ERRORS that must be fixed:</strong></p>
                    <ul>
                        <li>Script duplicates (performance issue)</li>
                        <li>Wrong load order (dependency failure)</li>
                        <li>Failed script loading (404 or syntax error)</li>
                    </ul>
                    <p><strong>Action Required:</strong> Fix these issues in the HTML pages immediately.</p>
                </div>
            </div>
        `;
    } else if (warningTests > 0) {
        explanationHtml = `
            <div class="monitoring-explanation warning">
                <div class="alert alert-warning">
                    <h6><i class="fas fa-info-circle"></i> Documentation Mismatch Detected</h6>
                    <p><strong>The monitoring system found differences between documentation and reality.</strong></p>
                    <p>This is NOT an error - it's a mismatch that requires your decision:</p>
                    <ol>
                        <li><strong>Is the documentation correct?</strong> → Update the HTML page to load the documented scripts</li>
                        <li><strong>Is the page correct?</strong> → Update package-manifest.js and page-configs to match reality</li>
                    </ol>
                    <p><strong>Remember:</strong> The monitoring system does NOT load scripts automatically. It only compares and warns.</p>
                </div>
            </div>
        `;
    }
    
    let html = `
        <div class="test-summary">
            <div class="test-stats">
                <span class="badge bg-success">${passedTests} הצלחות</span>
                <span class="badge bg-warning">${warningTests} אזהרות</span>
                <span class="badge bg-danger">${failedTests} שגיאות</span>
            </div>
        </div>
        ${explanationHtml}
        <div class="test-list">
    `;
    
    tests.forEach(test => {
        const statusIcon = test.status === 'success' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
        const statusClass = test.status === 'success' ? 'text-success' : test.status === 'warning' ? 'text-warning' : 'text-danger';
        
        html += `
            <div class="test-item">
                <div class="test-header">
                    <span class="test-icon">${statusIcon}</span>
                    <span class="test-name">${test.name}</span>
                    <span class="test-status ${statusClass}">${test.message}</span>
                </div>
                <div class="test-details">${test.details}</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Run advanced monitoring
 */
async function runAdvancedMonitoring() {
    console.log('🔍 Running advanced monitoring...');
    
    try {
        await loadAdvancedMonitoring();
        showNotification('בדיקות ניטור מתקדמות הושלמו', 'success');
    } catch (error) {
        console.error('❌ Failed to run advanced monitoring:', error);
        showNotification('שגיאה בהרצת בדיקות ניטור', 'error');
    }
}

/**
 * Copy detailed log
 */
function copyDetailedLog() {
    const logData = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        tests: {
            scripts: document.getElementById('scriptTests').innerHTML,
            dependencies: document.getElementById('dependencyTests').innerHTML,
            performance: document.getElementById('performanceTests').innerHTML,
            validation: document.getElementById('validationTests').innerHTML
        },
        systemInfo: {
            unifiedAppStatus: window.unifiedAppInit?.getStatus?.() || 'unknown',
            packageManifest: window.PACKAGE_MANIFEST ? Object.keys(window.PACKAGE_MANIFEST) : [],
            pageConfigs: window.PAGE_CONFIGS ? Object.keys(window.PAGE_CONFIGS) : [],
            loadedScripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
        }
    };
    
    const logText = `
=== TikTrack Advanced Monitoring Log ===
תאריך: ${logData.timestamp}
עמוד: ${logData.page}
דפדפן: ${logData.userAgent}

=== מערכת אתחול ===
סטטוס: ${logData.systemInfo.unifiedAppStatus}
חבילות זמינות: ${logData.systemInfo.packageManifest.join(', ')}
קונפיגורציות עמודים: ${logData.systemInfo.pageConfigs.join(', ')}

=== סקריפטים נטענים ===
${logData.systemInfo.loadedScripts.map((script, index) => `${index + 1}. ${script}`).join('\n')}

=== תוצאות בדיקות ===
${JSON.stringify(logData.tests, null, 2)}
    `.trim();
    
    navigator.clipboard.writeText(logText).then(() => {
        showNotification('לוג מפורט הועתק ללוח', 'success');
    }).catch(err => {
        console.error('Failed to copy log:', err);
        showNotification('שגיאה בהעתקת לוג', 'error');
    });
}

/**
 * Run Comprehensive Tests on All Pages
 */
async function runComprehensiveTests() {
    console.log('🔍 Starting comprehensive tests for all pages...');
    
    // Get all page configs
    const allPages = Object.keys(window.PAGE_CONFIGS || {});
    const results = [];
    
    // Summary counters
    let criticalErrors = 0;
    let mismatches = 0;
    let healthyPages = 0;
    
    // Test each page
    for (const pageName of allPages) {
        const pageConfig = window.PAGE_CONFIGS[pageName];
        const pageResult = await testSinglePage(pageName, pageConfig);
        results.push(pageResult);
        
        // Update counters
        if (pageResult.criticalErrors > 0) {
            criticalErrors++;
        } else if (pageResult.mismatches > 0) {
            mismatches++;
        } else {
            healthyPages++;
        }
    }
    
    // Update summary cards
    document.getElementById('totalPagesCount').textContent = allPages.length;
    document.getElementById('criticalErrorsCount').textContent = criticalErrors;
    document.getElementById('mismatchCount').textContent = mismatches;
    document.getElementById('healthyPagesCount').textContent = healthyPages;
    
    // Display results in table
    displayComprehensiveResults(results);
    
    console.log('✅ Comprehensive tests completed');
}

/**
 * Test Single Page
 */
async function testSinglePage(pageName, pageConfig) {
    const result = {
        pageName: pageName,
        displayName: pageConfig.name || pageName,
        status: 'unknown',
        criticalErrors: 0,
        mismatches: 0,
        duplicates: [],
        loadOrderIssues: [],
        details: []
    };
    
    // Check for duplicates
    const duplicates = checkForDuplicates(pageConfig);
    result.duplicates = duplicates;
    result.criticalErrors += duplicates.length;
    
    // Check load order
    const loadOrderIssues = checkLoadOrder(pageConfig);
    result.loadOrderIssues = loadOrderIssues;
    result.criticalErrors += loadOrderIssues.length;
    
    // Check for mismatches (documented vs actual)
    const mismatches = await checkForMismatches(pageName, pageConfig);
    result.mismatches = mismatches.length;
    
    // Determine overall status
    if (result.criticalErrors > 0) {
        result.status = 'error';
    } else if (result.mismatches > 0) {
        result.status = 'warning';
    } else {
        result.status = 'success';
    }
    
    return result;
}

/**
 * Check for Script Duplicates
 */
function checkForDuplicates(pageConfig) {
    const duplicates = [];
    const scriptCounts = {};
    
    // Count script occurrences across all packages
    if (pageConfig.packages) {
        for (const pkgName of pageConfig.packages) {
            const pkg = window.PACKAGE_MANIFEST?.[pkgName];
            if (pkg && pkg.scripts) {
                pkg.scripts.forEach(script => {
                    scriptCounts[script.file] = (scriptCounts[script.file] || 0) + 1;
                });
            }
        }
    }
    
    // Find duplicates
    for (const [script, count] of Object.entries(scriptCounts)) {
        if (count > 1) {
            duplicates.push({ script, count });
        }
    }
    
    return duplicates;
}

/**
 * Check Load Order
 */
function checkLoadOrder(pageConfig) {
    const issues = [];
    
    if (pageConfig.packages) {
        for (const pkgName of pageConfig.packages) {
            const pkg = window.PACKAGE_MANIFEST?.[pkgName];
            if (pkg && pkg.dependencies) {
                // Check if dependencies are loaded before this package
                pkg.dependencies.forEach(dep => {
                    if (!pageConfig.packages.includes(dep)) {
                        issues.push({
                            package: pkgName,
                            missingDependency: dep
                        });
                    }
                });
            }
        }
    }
    
    return issues;
}

/**
 * Check for Mismatches
 */
async function checkForMismatches(pageName, pageConfig) {
    const mismatches = [];
    
    // Wait for globals to be available
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (pageConfig.packages) {
        for (const pkgName of pageConfig.packages) {
            const pkg = window.PACKAGE_MANIFEST?.[pkgName];
            if (pkg && pkg.scripts) {
                for (const script of pkg.scripts) {
                    if (script.required && script.globalCheck) {
                        // Check if global exists
                        if (!checkGlobalExists(script.globalCheck)) {
                            mismatches.push({
                                script: script.file,
                                package: pkgName,
                                global: script.globalCheck,
                                description: script.description
                            });
                        }
                    }
                }
            }
        }
    }
    
    return mismatches;
}

/**
 * Check if Global Exists
 */
function checkGlobalExists(globalPath) {
    try {
        const parts = globalPath.replace('window.', '').split('.');
        let obj = window;
        for (const part of parts) {
            if (obj[part] === undefined) {
                return false;
            }
            obj = obj[part];
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Display Comprehensive Results
 */
function displayComprehensiveResults(results) {
    const tbody = document.getElementById('comprehensiveTestResults');
    tbody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        
        // Status icon and color
        let statusIcon, statusColor;
        if (result.status === 'error') {
            statusIcon = '❌';
            statusColor = 'text-danger';
        } else if (result.status === 'warning') {
            statusIcon = '⚠️';
            statusColor = 'text-warning';
        } else {
            statusIcon = '✅';
            statusColor = 'text-success';
        }
        
        row.innerHTML = `
            <td><strong>${result.displayName}</strong><br><small class="text-muted">${result.pageName}</small></td>
            <td class="${statusColor}">${statusIcon} ${getStatusText(result.status)}</td>
            <td class="text-center">${result.criticalErrors > 0 ? `<span class="badge bg-danger">${result.criticalErrors}</span>` : '-'}</td>
            <td class="text-center">${result.mismatches > 0 ? `<span class="badge bg-warning">${result.mismatches}</span>` : '-'}</td>
            <td class="text-center">${result.duplicates.length > 0 ? `<span class="badge bg-danger">${result.duplicates.length}</span>` : '-'}</td>
            <td class="text-center">${result.loadOrderIssues.length > 0 ? `<span class="badge bg-danger">${result.loadOrderIssues.length}</span>` : '-'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showPageDetails('${result.pageName}')">
                    <i class="fas fa-eye"></i> פרטים
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Get Status Text
 */
function getStatusText(status) {
    switch(status) {
        case 'error': return 'שגיאות קריטיות';
        case 'warning': return 'אי-התאמות';
        case 'success': return 'תקין';
        default: return 'לא ידוע';
    }
}

/**
 * Show Page Details Modal - Detailed Scan Results
 */
async function showPageDetails(pageName) {
    const pageConfig = window.PAGE_CONFIGS[pageName];
    
    // Run detailed scan for this specific page
    const scanResults = await runDetailedPageScan(pageName, pageConfig);
    
    let detailsHtml = `
        <h5>🔍 תוצאות סריקה מפורטת: ${pageConfig.name || pageName}</h5>
        <hr>
        
        <div class="row mb-3">
            <div class="col-md-3">
                <div class="card ${scanResults.criticalErrors > 0 ? 'bg-danger' : scanResults.mismatches > 0 ? 'bg-warning' : 'bg-success'} text-white">
                    <div class="card-body text-center">
                        <h6>${scanResults.criticalErrors + scanResults.mismatches}</h6>
                        <small>בעיות שזוהו</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card ${scanResults.criticalErrors > 0 ? 'bg-danger' : 'bg-light'} text-center">
                    <div class="card-body">
                        <h6>${scanResults.criticalErrors}</h6>
                        <small>שגיאות קריטיות</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card ${scanResults.mismatches > 0 ? 'bg-warning' : 'bg-light'} text-center">
                    <div class="card-body">
                        <h6>${scanResults.mismatches}</h6>
                        <small>אי-התאמות</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card ${scanResults.duplicates.length > 0 ? 'bg-danger' : 'bg-light'} text-center">
                    <div class="card-body">
                        <h6>${scanResults.duplicates.length}</h6>
                        <small>כפילויות</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Critical Errors Section
    if (scanResults.criticalErrors > 0) {
        detailsHtml += `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle"></i> שגיאות קריטיות (${scanResults.criticalErrors})</h6>
                <p><strong>בעיות שדורשות תיקון מיידי:</strong></p>
        `;
        
        if (scanResults.duplicates.length > 0) {
            detailsHtml += `
                <h6>🔴 כפילויות סקריפטים:</h6>
                <ul>
                    ${scanResults.duplicates.map(d => `
                        <li><strong>${d.script}</strong> - נטען ${d.count} פעמים</li>
                    `).join('')}
                </ul>
            `;
        }
        
        if (scanResults.loadOrderIssues.length > 0) {
            detailsHtml += `
                <h6>🔴 בעיות סדר טעינה:</h6>
                <ul>
                    ${scanResults.loadOrderIssues.map(issue => `
                        <li>חבילה <strong>${issue.package}</strong> דורשת <strong>${issue.missingDependency}</strong></li>
                    `).join('')}
                </ul>
            `;
        }
        
        detailsHtml += `
                <div class="mt-2">
                    <strong>🔧 פעולה נדרשת:</strong> תקן את הבעיות ב-HTML של העמוד
                </div>
            </div>
        `;
    }
    
    // Mismatches Section
    if (scanResults.mismatches > 0) {
        detailsHtml += `
            <div class="alert alert-warning">
                <h6><i class="fas fa-info-circle"></i> אי-התאמות תיעוד (${scanResults.mismatches})</h6>
                <p><strong>התיעוד לא תואם למה שנטען בפועל:</strong></p>
                <ul class="mb-2">
                    ${scanResults.mismatchDetails.map(m => `
                        <li class="mb-1">
                            <strong>📄 ${m.script}</strong> 
                            <small class="text-muted">(${m.package})</small><br>
                            <small class="text-muted">מצפה ל: <code>${m.global}</code></small>
                        </li>
                    `).join('')}
                </ul>
                <small class="text-info"><strong>💡 זכור:</strong> מערכת הניטור לא טוענת סקריפטים אוטומטית</small>
            </div>
        `;
    }
    
    // Success Section
    if (scanResults.criticalErrors === 0 && scanResults.mismatches === 0) {
        detailsHtml += `
            <div class="alert alert-success">
                <h6><i class="fas fa-check-circle"></i> עמוד תקין לחלוטין</h6>
                <p>לא נמצאו שגיאות קריטיות או אי-התאמות. העמוד עובד כמתוכנן.</p>
            </div>
        `;
    }
    
    // Package Information
    detailsHtml += `
        <div class="mt-3">
            <h6>📦 חבילות מוגדרות:</h6>
            <div class="row">
                ${(pageConfig.packages || []).map(pkg => `
                    <div class="col-md-4 mb-2">
                        <span class="badge bg-primary">${pkg}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add copy button to the modal
    detailsHtml += `
        <div class="mt-3 text-center">
            <button class="btn btn-outline-primary btn-sm" onclick="copyDetailedPageResults()">
                <i class="fas fa-copy"></i> העתק תוצאות
            </button>
        </div>
    `;
    
    if (typeof window.showDetailsModal === 'function') {
        window.showDetailsModal(`🔍 סריקה מפורטת: ${pageName}`, detailsHtml);
    }
}

/**
 * Run Detailed Page Scan
 */
async function runDetailedPageScan(pageName, pageConfig) {
    const result = {
        pageName: pageName,
        criticalErrors: 0,
        mismatches: 0,
        duplicates: [],
        loadOrderIssues: [],
        mismatchDetails: []
    };
    
    // Check for duplicates
    const duplicates = checkForDuplicates(pageConfig);
    result.duplicates = duplicates;
    result.criticalErrors += duplicates.length;
    
    // Check load order
    const loadOrderIssues = checkLoadOrder(pageConfig);
    result.loadOrderIssues = loadOrderIssues;
    result.criticalErrors += loadOrderIssues.length;
    
    // Wait for globals to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for mismatches (documented vs actual)
    const mismatches = await checkForMismatches(pageName, pageConfig);
    result.mismatchDetails = mismatches;
    result.mismatches = mismatches.length;
    
    return result;
}

/**
 * Get Detailed Mismatches for a Page
 */
function getDetailedMismatches(pageName, pageConfig) {
    const mismatches = [];
    
    if (pageConfig.packages) {
        for (const pkgName of pageConfig.packages) {
            const pkg = window.PACKAGE_MANIFEST?.[pkgName];
            if (pkg && pkg.scripts) {
                for (const script of pkg.scripts) {
                    if (script.required && script.globalCheck) {
                        // Check if global exists
                        if (!checkGlobalExists(script.globalCheck)) {
                            mismatches.push({
                                script: script.file,
                                package: pkgName,
                                global: script.globalCheck,
                                description: script.description
                            });
                        }
                    }
                }
            }
        }
    }
    
    return mismatches;
}

/**
 * Check if Global Exists
 */
function checkGlobalExists(globalPath) {
    try {
        const parts = globalPath.replace('window.', '').split('.');
        let obj = window;
        for (const part of parts) {
            if (obj[part] === undefined) {
                return false;
            }
            obj = obj[part];
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Export Test Results
 */
function exportTestResults() {
    // Collect all test data
    const allPages = Object.keys(window.PAGE_CONFIGS || {});
    const exportData = {
        timestamp: new Date().toISOString(),
        totalPages: allPages.length,
        results: []
    };
    
    // Add summary from UI
    exportData.summary = {
        total: document.getElementById('totalPagesCount').textContent,
        criticalErrors: document.getElementById('criticalErrorsCount').textContent,
        mismatches: document.getElementById('mismatchCount').textContent,
        healthy: document.getElementById('healthyPagesCount').textContent
    };
    
    // Create downloadable JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `init-system-tests-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('✅ Test results exported');
}

/**
 * Copy All Results from Tools
 */
function copyAllResults() {
    const resultsContainer = document.getElementById('toolsResults');
    if (!resultsContainer || resultsContainer.innerHTML.trim() === '') {
        showNotification('אין תוצאות להעתקה', 'warning');
        return;
    }
    
    const resultsText = resultsContainer.innerText || resultsContainer.textContent;
    navigator.clipboard.writeText(resultsText).then(() => {
        showNotification('תוצאות הועתקו ללוח', 'success');
    }).catch(err => {
        console.error('Failed to copy results:', err);
        showNotification('שגיאה בהעתקת תוצאות', 'error');
    });
}

/**
 * Copy Comprehensive Test Results
 */
function copyComprehensiveResults() {
    const table = document.getElementById('comprehensiveTestResults');
    if (!table || table.rows.length <= 1) {
        showNotification('אין תוצאות בדיקות להעתקה', 'warning');
        return;
    }
    
    let resultsText = '=== תוצאות בדיקות מקיפות ===\n\n';
    
    // Add summary
    const totalPages = document.getElementById('totalPagesCount').textContent;
    const criticalErrors = document.getElementById('criticalErrorsCount').textContent;
    const mismatches = document.getElementById('mismatchCount').textContent;
    const healthy = document.getElementById('healthyPagesCount').textContent;
    
    resultsText += `סך עמודים: ${totalPages}\n`;
    resultsText += `שגיאות קריטיות: ${criticalErrors}\n`;
    resultsText += `אי-התאמות: ${mismatches}\n`;
    resultsText += `עמודים תקינים: ${healthy}\n\n`;
    
    // Add table data
    resultsText += '=== פרטי עמודים ===\n';
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const cells = row.cells;
        if (cells.length >= 7) {
            resultsText += `${cells[0].textContent.trim()} - ${cells[1].textContent.trim()}\n`;
            resultsText += `  שגיאות קריטיות: ${cells[2].textContent.trim()}\n`;
            resultsText += `  אי-התאמות: ${cells[3].textContent.trim()}\n`;
            resultsText += `  כפילויות: ${cells[4].textContent.trim()}\n`;
            resultsText += `  סדר טעינה: ${cells[5].textContent.trim()}\n\n`;
        }
    }
    
    navigator.clipboard.writeText(resultsText).then(() => {
        showNotification('תוצאות בדיקות הועתקו ללוח', 'success');
    }).catch(err => {
        console.error('Failed to copy comprehensive results:', err);
        showNotification('שגיאה בהעתקת תוצאות בדיקות', 'error');
    });
}

/**
 * Copy detailed page scan results
 */
function copyDetailedPageResults() {
    // Get the current modal content
    const modalContent = document.querySelector('.modal-body .details-content');
    if (!modalContent) {
        showNotification('לא נמצא תוכן להעתקה', 'error');
        return;
    }
    
    let copyText = '=== TikTrack Detailed Page Scan Results ===\n';
    copyText += `Date: ${new Date().toISOString()}\n\n`;
    
    // Extract title
    const title = modalContent.querySelector('h5')?.textContent || 'Unknown Page';
    copyText += `Page: ${title}\n\n`;
    
    // Extract summary cards
    const cards = modalContent.querySelectorAll('.card');
    copyText += 'SUMMARY:\n';
    cards.forEach(card => {
        const number = card.querySelector('h6')?.textContent || '0';
        const label = card.querySelector('small')?.textContent || 'Unknown';
        copyText += `- ${label}: ${number}\n`;
    });
    
    // Extract mismatches
    const mismatches = modalContent.querySelectorAll('.alert-warning li');
    if (mismatches.length > 0) {
        copyText += '\nMISMATCHES:\n';
        mismatches.forEach((mismatch, index) => {
            const script = mismatch.querySelector('strong')?.textContent || '';
            const package = mismatch.querySelector('small')?.textContent || '';
            const global = mismatch.querySelector('code')?.textContent || '';
            
            copyText += `${index + 1}. ${script}\n`;
            copyText += `   Package: ${package}\n`;
            copyText += `   Expected Global: ${global}\n`;
        });
    }
    
    // Extract packages
    const packages = modalContent.querySelectorAll('.badge.bg-primary');
    if (packages.length > 0) {
        copyText += '\nPACKAGES:\n';
        packages.forEach(pkg => {
            copyText += `- ${pkg.textContent}\n`;
        });
    }
    
    navigator.clipboard.writeText(copyText).then(() => {
        showNotification('תוצאות הסריקה המפורטת הועתקו ללוח', 'success');
    }).catch(err => {
        console.error('Failed to copy detailed results:', err);
        showNotification('שגיאה בהעתקת התוצאות המפורטות', 'error');
    });
}
