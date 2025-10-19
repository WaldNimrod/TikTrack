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
        await loadPerformanceReport();
        loadPackagesCheckboxes();
        
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
    const statusContainer = document.getElementById('systemStatus');
    
    try {
        // Get unified app status
        const status = window.getUnifiedAppStatus ? window.getUnifiedAppStatus() : null;
        
        // Get package manifest stats
        const packageStats = window.PackageManifest ? window.PackageManifest.getStats() : null;
        
        // Get current page info
        const pageName = window.location.pathname.split('/').pop().replace('.html', '');
        const pageConfig = window.PAGE_CONFIGS ? window.PAGE_CONFIGS[pageName] : null;
        
        let statusHTML = `
            <div class="system-status-grid">
                <div class="status-card">
                    <h4><i class="fas fa-info-circle"></i> מידע כללי</h4>
                    <div class="status-item">
                        <span class="label">עמוד נוכחי:</span>
                        <span class="value">${pageName}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">מערכת מאוחדת:</span>
                        <span class="value ${status?.initialized ? 'success' : 'error'}">
                            ${status?.initialized ? 'מאותחלת' : 'לא מאותחלת'}
                        </span>
                    </div>
                </div>
                
                <div class="status-card">
                    <h4><i class="fas fa-boxes"></i> חבילות</h4>
                    <div class="status-item">
                        <span class="label">סה"כ חבילות:</span>
                        <span class="value">${packageStats?.totalPackages || 0}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">חבילות קריטיות:</span>
                        <span class="value">${packageStats?.criticalPackages || 0}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">סה"כ סקריפטים:</span>
                        <span class="value">${packageStats?.totalScripts || 0}</span>
                    </div>
                </div>
                
                <div class="status-card">
                    <h4><i class="fas fa-cog"></i> קונפיגורציה</h4>
                    <div class="status-item">
                        <span class="label">חבילות נדרשות:</span>
                        <span class="value">${pageConfig?.packages?.length || 0}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Globals נדרשים:</span>
                        <span class="value">${pageConfig?.requiredGlobals?.length || 0}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">אתחולים מותאמים:</span>
                        <span class="value">${pageConfig?.customInitializers?.length || 0}</span>
                    </div>
                </div>
            </div>
        `;
        
        statusContainer.innerHTML = statusHTML;
        
    } catch (error) {
        console.error('❌ Failed to load system status:', error);
        statusContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                שגיאה בטעינת סטטוס מערכת: ${error.message}
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
        // Get performance report from unified initializer
        const report = window.unifiedAppInit?.getPerformanceReport ? 
            window.unifiedAppInit.getPerformanceReport() : null;
        
        if (!report) {
            reportContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    אין נתוני ביצועים זמינים
                </div>
            `;
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
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}
