/**
 * Init System Check - TikTrack Frontend
 * =====================================
 * 
 * מערכת בדיקת איתחול - מאפשרת בדיקת מערכת האיתחול מכל עמוד
 * 
 * Features:
 * - בדיקת מערכת איתחול מכל עמוד
 * - הצגת תוצאות דרך מערכת ההודעות
 * - קוד חיצוני שנטען לכל העמודים
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 20, 2025
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - copyMonitoringResults() - Copymonitoringresults

// === Other ===
// - waitForNavList() - Waitfornavlist

if (window.Logger) {
  window.Logger.debug('🔍 Loading Init System Check...', { page: 'init-check' });
}

/**
 * Init System Check
 */
class InitSystemCheck {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) {
            return;
        }

        // הוספת כפתור בדיקה לראש הדף
        this.addMonitoringButtonToHeader();
        
        this.isInitialized = true;
        if (window.Logger) {
          window.Logger.debug('✅ Init System Check initialized', { page: 'init-check' });
        }
    }

    /**
     * הוספת כפתור בדיקה לראש הדף
     */
    addMonitoringButtonToHeader() {
        // נחכה שהרשימה תהיה קיימת
        const waitForNavList = () => {
            const navList = document.querySelector('.tiktrack-nav-list') || document.querySelector('#unified-header');
            if (navList) {
                this.addButtonToNavList(navList);
            } else {
                setTimeout(waitForNavList, 100);
            }
        };
        
        waitForNavList();
    }

    /**
     * הוספת כפתור לרשימת הניווט
     */
    addButtonToNavList(navList) {
        // בדיקה אם הכפתור כבר קיים
        if (document.getElementById('initSystemCheckBtn')) {
            return;
        }

        // יצירת כפתור הבדיקה
        const monitoringButton = document.createElement('li');
        monitoringButton.className = 'tiktrack-nav-item';
        const buttonHTML = `
            <a href="#" class="tiktrack-nav-link" id="initSystemCheckBtn" 
               title="ניטור מערכת איתחול"
               data-onclick="initSystemCheck?.runPageCheck(event)">
                <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">🔍</span>
            </a>
        `;
        monitoringButton.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(buttonHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          monitoringButton.appendChild(node.cloneNode(true));
        });

        // הוספת הכפתור בסוף הרשימה
        navList.appendChild(monitoringButton);

        if (window.Logger) { 
            window.Logger.info('✅ Monitoring check button added to header', { page: "init-check" }); 
        }
    }

    /**
     * הרצת בדיקת מערכת איתחול
     */
    async runPageCheck(event) {
        if (event) {
            event.preventDefault();
        }

        if (window.Logger) { window.Logger.info('🔍 Starting page monitoring check...', { page: "init-check" }); }
        
        // קבלת שם העמוד הנוכחי
        const currentPage = this.getCurrentPageName();
        
        // הצגת הודעת טעינה
        if (typeof showNotification === 'function') {
            showNotification('מבצע בדיקת מערכת...', 'info');
        }

        try {
            // בדיקה אם מערכת הניתור זמינה
            if (typeof window.runDetailedPageScan === 'undefined') {
                throw new Error('מערכת הניתור לא זמינה - נא לטעון את העמוד מחדש');
            }

            // קבלת קונפיגורציית העמוד
            const pageConfig = window.PAGE_CONFIGS?.[currentPage];
            if (!pageConfig) {
                throw new Error(`לא נמצא קונפיגורציה לעמוד ${currentPage}`);
            }

            // הרצת הסריקה המפורטת
            const scanResults = await window.runDetailedPageScan(currentPage, pageConfig);
            
            // הצגת התוצאות
            this.displayResults(scanResults, currentPage);
            
        } catch (error) {
            if (window.Logger) { window.Logger.error('Error running page monitoring check:', error, { page: "init-check" }); }
            if (typeof showNotification === 'function') {
                showNotification('שגיאה בבדיקת המערכת: ' + error.message, 'error');
            }
        }
    }

    /**
     * קבלת שם העמוד הנוכחי
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        let pageName = path.split('/').pop();
        
        // Handle case where URL doesn't have .html extension
        if (!pageName || pageName === '' || pageName === '/') {
            pageName = 'index';
        } else {
            pageName = pageName.replace('.html', '');
        }
        
        // Handle tag-management specifically (URL might be /tag-management without .html)
        if (path.includes('tag-management')) {
            pageName = 'tag-management';
        }
        
        // Handle historical pages with specific URL patterns
        if (path.includes('trade-history')) {
            pageName = 'trade-history';
        } else if (path.includes('portfolio-state')) {
            pageName = 'portfolio-state';
        } else if (path.includes('trading-journal')) {
            pageName = 'trading-journal';
        }
        
        // For mockup pages, check if there's a class on html element
        if (document.documentElement && document.documentElement.className) {
            const htmlClass = document.documentElement.className;
            // Check if class matches a known page name pattern (e.g., "trading-journal-page")
            if (htmlClass && htmlClass.includes('-page') && !htmlClass.includes(' ')) {
                // Verify it exists in PAGE_CONFIGS
                if (window.PAGE_CONFIGS && window.PAGE_CONFIGS[htmlClass]) {
                    return htmlClass;
                }
            }
        }
        
        // If pageName exists in PAGE_CONFIGS, use it
        if (window.PAGE_CONFIGS && window.PAGE_CONFIGS[pageName]) {
            return pageName;
        }
        
        return pageName || 'index';
    }

    /**
     * ייצור קוד טעינת סקריפטים עבור העמוד הנוכחי
     */
    async generateScriptLoadingCode(event) {
        if (event) {
            event.preventDefault();
        }

        const currentPage = this.getCurrentPageName();
        
        if (window.Logger) { 
            window.Logger.info(`📝 Generating script loading code for page: ${currentPage}`, { page: "init-check" }); 
        }

        // בדיקה אם הכלי זמין
        if (!window.PageTemplateGenerator) {
            const errorMsg = '❌ כלי יצירת הקוד לא זמין - נא לטעון את העמוד מחדש';
            if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
            return;
        }

        try {
            // יצירת הקוד
            const generatedCode = window.PageTemplateGenerator.generateCompleteScriptSection(currentPage);
            
            if (!generatedCode) {
                throw new Error('לא נוצר קוד - בדוק את הקונסולה לשגיאות');
            }

            // הצגת הקוד ב-modal עם כפתור העתקה
            this.displayGeneratedCode(generatedCode, currentPage);
            
        } catch (error) {
            if (window.Logger) { 
                window.Logger.error('Error generating script loading code:', error, { page: "init-check" }); 
            }
            const errorMsg = `שגיאה בייצור הקוד: ${error.message}`;
            if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
        }
    }

    /**
     * הצגת קוד שנוצר ב-modal עם כפתור העתקה
     */
    displayGeneratedCode(generatedCode, pageName) {
        // יצירת HTML להצגת הקוד
        const contentHtml = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>קוד טעינת סקריפטים עבור: ${pageName}</strong>
                <br>
                <small>העתק את הקוד למטה והדבק אותו בעמוד במקום קוד הטעינה הישן</small>
            </div>
            
            <div class="code-container" style="position: relative;">
                <pre id="generated-code-content" style="background: #f5f5f5; padding: 15px; border-radius: 4px; max-height: 600px; overflow-y: auto; direction: ltr; text-align: left; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(generatedCode)}</pre>
                <button class="btn btn-primary btn-sm" id="copy-generated-code-btn" 
                        style="position: absolute; top: 10px; left: 10px; z-index: 10;"
                        onclick="initSystemCheck.copyGeneratedCode()">
                    <i class="fas fa-copy"></i> העתק קוד
                </button>
            </div>
            
            <div class="alert alert-warning mt-3">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>הוראות:</strong>
                <ol style="margin: 10px 0; padding-right: 20px;">
                    <li>העתק את כל הקוד (לחץ על כפתור ההעתקה או בחר הכל והעתק)</li>
                    <li>פתח את קובץ ${pageName}.html</li>
                    <li>מצא את המקטע עם ההערה "Script loading code will be generated"</li>
                    <li>החלף את כל התוכן בין ההערות בקוד החדש</li>
                    <li>שמור את הקובץ</li>
                </ol>
            </div>
        `;

        // שמירת הקוד להעתקה
        window.lastGeneratedCode = generatedCode;
        window.lastGeneratedPageName = pageName;

        // הצגת המודאל
        if (typeof window.showDetailsModal === 'function') {
            window.showDetailsModal(
                `📝 קוד טעינת סקריפטים - ${pageName}`,
                contentHtml,
                { includeCopyButton: true }
            );
        } else {
            // Fallback - הצגה ב-alert (לא מומלץ)
            alert('קוד שנוצר:\n\n' + generatedCode.substring(0, 500) + '\n\n... (נראה בקונסולה)');
            console.log('📝 Generated script loading code:', generatedCode);
        }
    }

    /**
     * העתקת הקוד שנוצר ללוח
     */
    copyGeneratedCode() {
        const code = window.lastGeneratedCode;
        if (!code) {
            if (typeof showNotification === 'function') {
                showNotification('אין קוד להעתקה', 'error');
            }
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(code).then(() => {
                    if (typeof showNotification === 'function') {
                        showNotification('✅ הקוד הועתק ללוח בהצלחה!', 'success');
                    } else {
                        alert('✅ הקוד הועתק ללוח בהצלחה!');
                    }
                }).catch(err => {
                    console.error('Clipboard API failed:', err);
                    this.fallbackCopyToClipboard(code);
                });
            } else {
                this.fallbackCopyToClipboard(code);
            }
        } catch (error) {
            console.error('Error copying code:', error);
            this.fallbackCopyToClipboard(code);
        }
    }

    /**
     * Fallback העתקה ללוח (למקרה שהדפדפן לא תומך ב-Clipboard API)
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            if (typeof showNotification === 'function') {
                showNotification('✅ הקוד הועתק ללוח בהצלחה!', 'success');
            } else {
                alert('✅ הקוד הועתק ללוח בהצלחה!');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            if (typeof showNotification === 'function') {
                showNotification('❌ שגיאה בהעתקה - נא להעתיק ידנית', 'error');
            } else {
                alert('❌ שגיאה בהעתקה - נא להעתיק ידנית מהקונסולה');
            }
            console.log('📝 Code to copy:', text);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Escaping HTML לתוכן
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * הצגת תוצאות הבדיקה המשופרת עם HTML+DOM comparison
     */
    displayResults(results, pageName) {
        const versionMismatchesCount = results.versionMismatchesCount || 0;
        const totalIssues = results.summary ? results.summary.totalIssues : 
                           (results.criticalErrors + results.mismatches + (results.loadOrderIssues ? results.loadOrderIssues.length : 0) + versionMismatchesCount);
        
        // Always show results if there are version mismatches (even if no critical errors)
        if (totalIssues === 0 && (!results.summary || results.summary.differencesCount === 0) && versionMismatchesCount === 0) {
            if (typeof showNotification === 'function') {
                showNotification('✅ מערכת תקינה - לא נמצאו בעיות!', 'success');
            }
            return;
        }
        
        // If only version mismatches (non-critical), show warning instead of error
        if (versionMismatchesCount > 0 && totalIssues === versionMismatchesCount) {
            if (typeof showNotification === 'function') {
                showNotification(`⚠️ נמצאו ${versionMismatchesCount} אי-התאמות גרסאות (לא קריטי)`, 'warning');
            }
        }

        // הצגת הודעת שגיאה מפורטת
        if (typeof window.showDetailsModal === 'function') {
            let detailsHtml = this.buildEnhancedResultsHTML(results, pageName);
            
            // שמירת התוצאות להעתקה
            window.lastMonitoringResults = results;
            
            // הצגת המודול
            window.showDetailsModal(`🔍 תוצאות בדיקת מערכת - ${pageName}`, detailsHtml);
        } else if (typeof showNotification === 'function') {
            showNotification(`נמצאו ${totalIssues} בעיות במערכת`, 'error');
            if (window.Logger) { window.Logger.info('📋 Detailed results:', results, { page: "init-check" }); }
        } else {
            if (window.Logger) { window.Logger.info('📋 Monitoring check results:', results, { page: "init-check" }); }
        }
    }

    /**
     * Build enhanced results HTML with tabs/sections
     */
    buildEnhancedResultsHTML(results, pageName) {
        const versionMismatchesCount = results.versionMismatchesCount || 0;
        const summary = results.summary || {
            totalIssues: results.criticalErrors + results.mismatches + (results.loadOrderIssues ? results.loadOrderIssues.length : 0) + versionMismatchesCount,
            criticalErrors: results.criticalErrors || 0,
            warnings: (results.loadOrderIssues ? results.loadOrderIssues.length : 0) + versionMismatchesCount,
            htmlScriptsCount: 0,
            domScriptsCount: 0,
            differencesCount: 0
        };

        let html = `
            <style>
                .monitoring-tab { cursor: pointer; padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; display: inline-block; }
                .monitoring-tab.active { background: #26baac; color: white; }
                .monitoring-section { display: none; margin-top: 20px; }
                .monitoring-section.active { display: block; }
                .script-item { padding: 5px; margin: 2px 0; border-left: 3px solid #ddd; padding-left: 10px; }
                .script-item.matches { border-left-color: #28a745; }
                .script-item.mismatch { border-left-color: #dc3545; }
                .script-item.warning { border-left-color: #ffc107; }
                .collapsible { cursor: pointer; }
                .collapsible-content { display: none; margin-top: 10px; }
                .collapsible-content.expanded { display: block; }
                .summary-cards { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
                .summary-card { flex: 1 1 calc(16.666% - 10px); min-width: 120px; max-width: 180px; }
                .summary-card .card { height: 100%; margin: 0; }
                .summary-card .card-body { padding: 15px; text-align: center; }
                .summary-card h6 { font-size: 1.5rem; font-weight: bold; margin-bottom: 5px; }
                .summary-card small { font-size: 0.85rem; display: block; }
                @media (max-width: 768px) {
                    .summary-card { flex: 1 1 calc(50% - 10px); }
                }
            </style>
            
            <!-- Summary Cards -->
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="card ${summary.totalIssues > 0 ? 'bg-warning' : 'bg-success'} text-white">
                        <div class="card-body">
                            <h6>${summary.totalIssues}</h6>
                            <small>סה"כ בעיות</small>
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card ${summary.criticalErrors > 0 ? 'bg-danger' : 'bg-light'}">
                        <div class="card-body">
                            <h6>${summary.criticalErrors}</h6>
                            <small>שגיאות קריטיות</small>
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card ${summary.warnings > 0 ? 'bg-warning' : 'bg-light'}">
                        <div class="card-body">
                            <h6>${summary.warnings}</h6>
                            <small>אזהרות</small>
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6>${summary.htmlScriptsCount}</h6>
                            <small>סקריפטים ב-HTML</small>
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6>${summary.domScriptsCount}</h6>
                            <small>סקריפטים ב-DOM</small>
                        </div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card ${summary.differencesCount > 0 ? 'bg-warning' : 'bg-success'} text-white">
                        <div class="card-body">
                            <h6>${summary.differencesCount}</h6>
                            <small>הבדלים</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="mb-3" style="border-bottom: 2px solid #ddd;">
                <span class="monitoring-tab active" onclick="initSystemCheck.switchTab('summary')">סיכום</span>
                <span class="monitoring-tab" onclick="initSystemCheck.switchTab('html')">ניתוח HTML</span>
                <span class="monitoring-tab" onclick="initSystemCheck.switchTab('dom')">ניתוח DOM</span>
                <span class="monitoring-tab" onclick="initSystemCheck.switchTab('comparison')">השוואה</span>
                <span class="monitoring-tab" onclick="initSystemCheck.switchTab('packages')">תיעוד חבילות</span>
                <span class="monitoring-tab" onclick="initSystemCheck.switchTab('errors')">שגיאות מפורטות</span>
            </div>

            <!-- Summary Section -->
            <div id="tab-summary" class="monitoring-section active">
                ${this.buildSummarySection(results, summary)}
            </div>

            <!-- HTML Analysis Section -->
            <div id="tab-html" class="monitoring-section">
                ${this.buildHTMLAnalysisSection(results)}
            </div>

            <!-- DOM Analysis Section -->
            <div id="tab-dom" class="monitoring-section">
                ${this.buildDOMAnalysisSection(results)}
            </div>

            <!-- Comparison Section -->
            <div id="tab-comparison" class="monitoring-section">
                ${this.buildComparisonSection(results)}
            </div>

            <!-- Package Documentation Section -->
            <div id="tab-packages" class="monitoring-section">
                ${this.buildPackageDocumentationSection(results)}
            </div>

            <!-- Detailed Errors Section -->
            <div id="tab-errors" class="monitoring-section">
                ${this.buildDetailedErrorsSection(results)}
            </div>

            <!-- Action Buttons -->
            <div class="text-center mt-3">
                <button class="btn btn-primary" onclick="copyMonitoringResults()">
                    <i class="fas fa-copy"></i> העתק תוצאות
                </button>
                <button class="btn btn-secondary" onclick="initSystemCheck.exportResults()">
                    <i class="fas fa-download"></i> ייצא JSON
                </button>
            </div>
        `;

        return html;
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Hide all sections
        document.querySelectorAll('.monitoring-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active from all tabs
        document.querySelectorAll('.monitoring-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(`tab-${tabName}`);
        if (section) {
            section.classList.add('active');
        }
        
        // Activate selected tab
        event.target.classList.add('active');
    }

    /**
     * Build summary section
     */
    buildSummarySection(results, summary) {
        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-info-circle"></i> סיכום כללי</h6>
                <p><strong>עמוד:</strong> ${results.pageName}</p>
                <p><strong>תאריך:</strong> ${results.timestamp ? new Date(results.timestamp).toLocaleString('he-IL') : new Date().toLocaleString('he-IL')}</p>
                <p><strong>סה"כ בעיות:</strong> ${summary.totalIssues}</p>
                <p><strong>שגיאות קריטיות:</strong> ${summary.criticalErrors}</p>
                <p><strong>אזהרות:</strong> ${summary.warnings}</p>
            </div>
        `;

        if (results.mismatchDetails && results.mismatchDetails.length > 0) {
            html += `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-triangle"></i> בעיות שזוהו (${results.mismatchDetails.length})</h6>
                    <ul class="mb-2">
                        ${results.mismatchDetails.map(m => `
                            <li class="mb-1">
                                <span class="badge ${m.severity === 'error' ? 'bg-danger' : 'bg-warning'}">${m.type}</span>
                                <strong>${m.message}</strong>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (results.loadOrderIssues && results.loadOrderIssues.length > 0) {
            html += `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-clock"></i> בעיות סדר טעינה (${results.loadOrderIssues.length})</h6>
                    <ul class="mb-2">
                        ${results.loadOrderIssues.map(issue => `
                            <li class="mb-1">
                                <span class="badge bg-warning">${issue.type}</span>
                                <strong>${issue.message}</strong>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (results.versionMismatches && results.versionMismatches.length > 0) {
            html += `
                <div class="alert alert-info">
                    <h6><i class="fas fa-code-branch"></i> אי-התאמות גרסאות (${results.versionMismatches.length})</h6>
                    <p class="mb-2"><small>זה לא קריטי - הגרסאות בקוד לא תואמות למניפסט. זה לא משפיע על פעולת המערכת.</small></p>
                    <details class="mt-2">
                        <summary style="cursor: pointer; color: #0d6efd;">לחץ להצגת פרטים (${results.versionMismatches.length} סקריפטים)</summary>
                        <ul class="mb-2 mt-2" style="max-height: 300px; overflow-y: auto;">
                            ${results.versionMismatches.slice(0, 20).map(vm => `
                                <li class="mb-1">
                                    <code>${vm.script}</code>: צפוי <strong>v${vm.expected}</strong>, בפועל <strong>v${vm.actual}</strong>
                                </li>
                            `).join('')}
                            ${results.versionMismatches.length > 20 ? `<li class="text-muted">... ועוד ${results.versionMismatches.length - 20} סקריפטים</li>` : ''}
                        </ul>
                    </details>
                </div>
            `;
        }

        return html;
    }

    /**
     * Build HTML analysis section
     */
    buildHTMLAnalysisSection(results) {
        if (!results.htmlAnalysis) {
            return '<div class="alert alert-info">אין נתוני HTML זמינים</div>';
        }

        const htmlAnalysis = results.htmlAnalysis;
        const scripts = htmlAnalysis.scripts || [];

        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-file-code"></i> ניתוח קובץ HTML</h6>
                <p><strong>סה"כ סקריפטים:</strong> ${htmlAnalysis.totalScripts}</p>
                <p><strong>התאמה למניפסט:</strong> ${htmlAnalysis.manifestCompliance}%</p>
                ${htmlAnalysis.error ? `<p class="text-danger"><strong>שגיאה:</strong> ${htmlAnalysis.error}</p>` : ''}
            </div>
        `;

        if (scripts.length > 0) {
            html += `
                <div class="collapsible" onclick="this.nextElementSibling.classList.toggle('expanded')">
                    <h6><i class="fas fa-chevron-down"></i> רשימת סקריפטים (${scripts.length})</h6>
                </div>
                <div class="collapsible-content">
                    ${scripts.map((script, index) => `
                        <div class="script-item ${script.matchesManifest ? 'matches' : 'mismatch'}">
                            <strong>${index + 1}. ${script.file}</strong>
                            <br>
                            <small>
                                מיקום: ${script.position} | 
                                LoadOrder: ${script.loadOrder || 'N/A'} | 
                                חבילה: ${script.package || 'לא מזוהה'} |
                                ${script.matchesManifest ? '✅ במניפסט' : '❌ לא במניפסט'}
                            </small>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return html;
    }

    /**
     * Build DOM analysis section
     */
    buildDOMAnalysisSection(results) {
        if (!results.domAnalysis) {
            return '<div class="alert alert-info">אין נתוני DOM זמינים</div>';
        }

        const domAnalysis = results.domAnalysis;
        const scripts = domAnalysis.scripts || [];

        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-code"></i> ניתוח DOM בפועל</h6>
                <p><strong>סה"כ סקריפטים:</strong> ${domAnalysis.totalScripts}</p>
                <p><strong>נטענו בהצלחה:</strong> ${scripts.filter(s => s.loaded).length}</p>
                <p><strong>נכשלו בטעינה:</strong> ${domAnalysis.failedLoads.length}</p>
            </div>
        `;

        if (domAnalysis.failedLoads.length > 0) {
            html += `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-circle"></i> סקריפטים שנכשלו בטעינה</h6>
                    <ul>
                        ${domAnalysis.failedLoads.map(f => `<li>${f.file}: ${f.error}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (scripts.length > 0) {
            html += `
                <div class="collapsible" onclick="this.nextElementSibling.classList.toggle('expanded')">
                    <h6><i class="fas fa-chevron-down"></i> רשימת סקריפטים (${scripts.length})</h6>
                </div>
                <div class="collapsible-content">
                    ${scripts.map((script, index) => `
                        <div class="script-item ${script.loaded ? 'matches' : 'mismatch'}">
                            <strong>${index + 1}. ${script.file}</strong>
                            <br>
                            <small>
                                מיקום: ${script.position} | 
                                LoadOrder: ${script.loadOrder || 'N/A'} | 
                                חבילה: ${script.package || 'לא מזוהה'} |
                                ${script.loaded ? '✅ נטען' : '❌ נכשל'} |
                                ${script.loadTime ? `זמן טעינה: ${script.loadTime.toFixed(2)}ms` : ''}
                            </small>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return html;
    }

    /**
     * Build comparison section
     */
    buildComparisonSection(results) {
        if (!results.comparison) {
            return '<div class="alert alert-info">אין נתוני השוואה זמינים</div>';
        }

        const comparison = results.comparison;

        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-balance-scale"></i> השוואה בין HTML ל-DOM</h6>
                <p><strong>סה"כ הבדלים:</strong> ${comparison.summary.differencesCount}</p>
            </div>
        `;

        if (comparison.orderDifferences.length > 0) {
            html += `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exchange-alt"></i> הבדלים בסדר טעינה (${comparison.orderDifferences.length})</h6>
                    <ul>
                        ${comparison.orderDifferences.map(diff => `
                            <li>
                                <strong>${diff.script}</strong><br>
                                <small>
                                    HTML: מיקום ${diff.htmlPosition} | 
                                    DOM: מיקום ${diff.domPosition} | 
                                    צפוי: LoadOrder ${diff.expectedOrder} |
                                    חבילה: ${diff.package || 'לא מזוהה'} |
                                    <span class="badge ${diff.severity === 'error' ? 'bg-danger' : 'bg-warning'}">${diff.severity}</span>
                                </small>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (comparison.missingInDOM.length > 0) {
            html += `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-minus-circle"></i> סקריפטים ב-HTML שלא נטענו ב-DOM (${comparison.missingInDOM.length})</h6>
                    <ul>
                        ${comparison.missingInDOM.map(m => `
                            <li>
                                <strong>${m.file}</strong><br>
                                <small>
                                    מיקום ב-HTML: ${m.htmlPosition} | 
                                    חבילה: ${m.package || 'לא מזוהה'} |
                                    צפוי LoadOrder: ${m.expectedOrder}
                                </small>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (comparison.extraInDOM.length > 0) {
            html += `
                <div class="alert alert-info">
                    <h6><i class="fas fa-plus-circle"></i> סקריפטים ב-DOM שלא ב-HTML (${comparison.extraInDOM.length})</h6>
                    <ul>
                        ${comparison.extraInDOM.map(e => `
                            <li>
                                <strong>${e.file}</strong><br>
                                <small>
                                    מיקום ב-DOM: ${e.domPosition} | 
                                    מקור: ${e.source} |
                                    חבילה: ${e.package || 'לא מזוהה'}
                                </small>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (comparison.pathDifferences.length > 0) {
            html += `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-route"></i> הבדלים בנתיבים (${comparison.pathDifferences.length})</h6>
                    <ul>
                        ${comparison.pathDifferences.map(p => `
                            <li>
                                <strong>${p.script}</strong><br>
                                <small>
                                    HTML: ${p.htmlPath} | 
                                    DOM: ${p.domPath} |
                                    חבילה: ${p.package || 'לא מזוהה'}
                                </small>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (comparison.summary.differencesCount === 0) {
            html += '<div class="alert alert-success">✅ אין הבדלים בין HTML ל-DOM!</div>';
        }

        return html;
    }

    /**
     * Build package documentation section
     */
    buildPackageDocumentationSection(results) {
        if (!results.packageDocumentation) {
            return '<div class="alert alert-info">אין נתוני תיעוד חבילות זמינים</div>';
        }

        const pkgDocs = results.packageDocumentation;
        const packages = pkgDocs.packages || [];

        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-book"></i> תיעוד החבילות</h6>
                <p><strong>סה"כ חבילות:</strong> ${packages.length}</p>
                <p><strong>התאמה לתיעוד:</strong> ${pkgDocs.documentationCompliance}%</p>
                <p><strong>סה"כ סקריפטים:</strong> ${pkgDocs.totalScripts || 0}</p>
                <p><strong>סקריפטים שנטענו:</strong> ${pkgDocs.loadedScripts || 0}</p>
            </div>
        `;

        if (pkgDocs.issues && pkgDocs.issues.length > 0) {
            html += `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-triangle"></i> בעיות תיעוד (${pkgDocs.issues.length})</h6>
                    <ul>
                        ${pkgDocs.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (packages.length > 0) {
            html += packages.map(pkg => `
                <div class="card mb-3">
                    <div class="card-header">
                        <h6>
                            ${pkg.name} (${pkg.id})
                            ${pkg.issues.length > 0 ? '<span class="badge bg-warning">בעיות</span>' : '<span class="badge bg-success">תקין</span>'}
                        </h6>
                    </div>
                    <div class="card-body">
                        <p><strong>תיאור:</strong> ${pkg.description}</p>
                        <p><strong>גרסה:</strong> ${pkg.version} | <strong>LoadOrder:</strong> ${pkg.loadOrder}</p>
                        <p><strong>תלויות:</strong> ${pkg.dependencies.length > 0 ? pkg.dependencies.join(', ') : 'אין'}</p>
                        <p><strong>סקריפטים:</strong> ${pkg.scripts.length}</p>
                        ${pkg.issues.length > 0 ? `
                            <div class="alert alert-warning">
                                <strong>בעיות:</strong>
                                <ul>
                                    ${pkg.issues.map(issue => `<li>${issue}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <div class="collapsible" onclick="this.nextElementSibling.classList.toggle('expanded')">
                            <small><i class="fas fa-chevron-down"></i> רשימת סקריפטים</small>
                        </div>
                        <div class="collapsible-content">
                            <ul>
                                ${pkg.scripts.map(script => `
                                    <li>
                                        ${script.file} 
                                        (LoadOrder: ${script.loadOrder}) 
                                        ${script.loaded ? '<span class="badge bg-success">נטען</span>' : '<span class="badge bg-danger">לא נטען</span>'}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        return html;
    }

    /**
     * Build detailed errors section
     */
    buildDetailedErrorsSection(results) {
        const errors = [];
        
        // Collect all errors from different sources
        if (results.mismatchDetails) {
            results.mismatchDetails.forEach(m => {
                errors.push({
                    type: m.type,
                    severity: m.severity || 'warning',
                    message: m.message,
                    location: 'both',
                    script: m.file || 'unknown',
                    expected: null,
                    actual: null,
                    recommendation: this.generateRecommendation(m),
                    documentationLink: this.getDocumentationLink(m.type)
                });
            });
        }

        if (results.comparison) {
            results.comparison.orderDifferences.forEach(diff => {
                errors.push({
                    type: 'loading_order',
                    severity: diff.severity,
                    message: `סדר טעינה שגוי: ${diff.script}`,
                    location: 'both',
                    script: diff.script,
                    expected: `מיקום ${diff.htmlPosition} (LoadOrder ${diff.expectedOrder})`,
                    actual: `מיקום ${diff.domPosition}`,
                    recommendation: `תקן את סדר הטעינה בקובץ HTML - ${diff.script} צריך להיות לפני סקריפטים אחרים בחבילה ${diff.package || 'לא מזוהה'}`,
                    documentationLink: this.getDocumentationLink('loading_order')
                });
            });

            results.comparison.missingInDOM.forEach(m => {
                errors.push({
                    type: 'missing_script',
                    severity: 'error',
                    message: `סקריפט חסר ב-DOM: ${m.file}`,
                    location: 'dom',
                    script: m.file,
                    expected: `מיקום ${m.htmlPosition} ב-HTML`,
                    actual: 'לא נטען ב-DOM',
                    recommendation: `בדוק למה ${m.file} לא נטען - ייתכן שזה 404 או שגיאת טעינה אחרת`,
                    documentationLink: this.getDocumentationLink('missing_script')
                });
            });
        }

        if (errors.length === 0) {
            return '<div class="alert alert-success">✅ אין שגיאות מפורטות!</div>';
        }

        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-bug"></i> שגיאות מפורטות (${errors.length})</h6>
            </div>
        `;

        html += errors.map((error, index) => `
            <div class="card mb-2">
                <div class="card-header ${error.severity === 'error' ? 'bg-danger' : 'bg-warning'} text-white">
                    <strong>${index + 1}. ${error.type}</strong>
                    <span class="badge bg-light text-dark">${error.severity}</span>
                </div>
                <div class="card-body">
                    <p><strong>הודעה:</strong> ${error.message}</p>
                    <p><strong>מיקום:</strong> ${error.location} | <strong>סקריפט:</strong> ${error.script}</p>
                    ${error.expected ? `<p><strong>צפוי:</strong> ${error.expected}</p>` : ''}
                    ${error.actual ? `<p><strong>פועל:</strong> ${error.actual}</p>` : ''}
                    <p><strong>המלצה:</strong> ${error.recommendation}</p>
                    ${error.documentationLink ? `<p><a href="${error.documentationLink}" target="_blank">📖 קישור לתיעוד</a></p>` : ''}
                </div>
            </div>
        `).join('');

        return html;
    }

    /**
     * Generate recommendation for an error
     */
    generateRecommendation(error) {
        const type = error.type;
        const message = error.message || '';

        if (type === 'missing_script') {
            return 'הוסף את הסקריפט לקובץ HTML או וודא שהוא נטען דרך חבילה';
        } else if (type === 'extra_script') {
            return 'הסר את הסקריפט מהקובץ HTML או הוסף אותו למניפסט';
        } else if (type === 'duplicate_script') {
            return 'הסר את הכפילות מהקובץ HTML';
        } else if (type === 'loading_order') {
            return 'תקן את סדר הטעינה בקובץ HTML לפי המניפסט';
        } else if (type === 'missing_global') {
            return 'הוסף את החבילה המתאימה ל-PAGE_CONFIGS או וודא שהסקריפט נטען';
        }

        return 'בדוק את התיעוד לפרטים נוספים';
    }

    /**
     * Get documentation link for error type
     */
    getDocumentationLink(errorType) {
        const links = {
            'missing_script': '/documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md',
            'loading_order': '/documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md',
            'missing_global': '/documentation/02-ARCHITECTURE/FRONTEND/PAGE_INITIALIZATION_SYSTEM.md'
        };
        return links[errorType] || null;
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        if (!window.lastMonitoringResults) {
            if (typeof showNotification === 'function') {
                showNotification('אין תוצאות לייצוא', 'warning');
            }
            return;
        }

        const json = JSON.stringify(window.lastMonitoringResults, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitoring-results-${window.lastMonitoringResults.pageName}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
            showNotification('תוצאות יוצאו בהצלחה', 'success');
        }
    }
}

/**
 * Copy Monitoring Results (Enhanced)
 */
function copyMonitoringResults() {
    if (!window.lastMonitoringResults) {
        if (typeof showNotification === 'function') {
            showNotification('אין תוצאות להעתקה', 'warning');
        }
        return;
    }
    
    const results = window.lastMonitoringResults;
    const summary = results.summary || {
        totalIssues: results.criticalErrors + results.mismatches + (results.loadOrderIssues ? results.loadOrderIssues.length : 0),
        criticalErrors: results.criticalErrors || 0,
        warnings: results.loadOrderIssues ? results.loadOrderIssues.length : 0,
        htmlScriptsCount: 0,
        domScriptsCount: 0,
        differencesCount: 0
    };
    
    let copyText = `=== TikTrack Page Monitoring Results ===\n`;
    copyText += `Date: ${results.timestamp || new Date().toISOString()}\n`;
    copyText += `Page: ${results.pageName}\n\n`;
    copyText += `SUMMARY:\n`;
    copyText += `- בעיות שזוהו: ${summary.totalIssues}\n`;
    copyText += `- שגיאות קריטיות: ${summary.criticalErrors}\n`;
    copyText += `- אזהרות: ${summary.warnings}\n`;
    copyText += `- כפילויות: ${results.duplicates ? results.duplicates.length : 0}\n`;
    copyText += `- בעיות סדר טעינה: ${results.loadOrderIssues ? results.loadOrderIssues.length : 0}\n`;
    copyText += `- סקריפטים ב-HTML: ${summary.htmlScriptsCount}\n`;
    copyText += `- סקריפטים ב-DOM: ${summary.domScriptsCount}\n`;
    copyText += `- הבדלים: ${summary.differencesCount}\n\n`;
    
    if (results.htmlAnalysis) {
        copyText += `HTML ANALYSIS:\n`;
        copyText += `- סה"כ סקריפטים: ${results.htmlAnalysis.totalScripts}\n`;
        copyText += `- התאמה למניפסט: ${results.htmlAnalysis.manifestCompliance}%\n`;
        if (results.htmlAnalysis.error) {
            copyText += `- שגיאה: ${results.htmlAnalysis.error}\n`;
        }
        copyText += `\n`;
    }
    
    if (results.domAnalysis) {
        copyText += `DOM ANALYSIS:\n`;
        copyText += `- סה"כ סקריפטים: ${results.domAnalysis.totalScripts}\n`;
        copyText += `- נטענו בהצלחה: ${results.domAnalysis.scripts.filter(s => s.loaded).length}\n`;
        copyText += `- נכשלו בטעינה: ${results.domAnalysis.failedLoads.length}\n`;
        copyText += `\n`;
    }
    
    if (results.comparison) {
        copyText += `COMPARISON:\n`;
        copyText += `- סה"כ הבדלים: ${results.comparison.summary.differencesCount}\n`;
        copyText += `- הבדלים בסדר: ${results.comparison.orderDifferences.length}\n`;
        copyText += `- חסרים ב-DOM: ${results.comparison.missingInDOM.length}\n`;
        copyText += `- נוספים ב-DOM: ${results.comparison.extraInDOM.length}\n`;
        copyText += `- הבדלים בנתיבים: ${results.comparison.pathDifferences.length}\n`;
        copyText += `\n`;
    }
    
    if (results.packageDocumentation) {
        copyText += `PACKAGE DOCUMENTATION:\n`;
        copyText += `- סה"כ חבילות: ${results.packageDocumentation.packages.length}\n`;
        copyText += `- התאמה לתיעוד: ${results.packageDocumentation.documentationCompliance}%\n`;
        copyText += `- סה"כ סקריפטים: ${results.packageDocumentation.totalScripts || 0}\n`;
        copyText += `- סקריפטים שנטענו: ${results.packageDocumentation.loadedScripts || 0}\n`;
        copyText += `\n`;
    }
    
    if (results.mismatchDetails && results.mismatchDetails.length > 0) {
        copyText += `MISMATCHES:\n`;
        results.mismatchDetails.forEach((m, index) => {
            copyText += `${index + 1}. ${m.type}: ${m.message}\n`;
        });
        copyText += `\n`;
    }
    
    if (results.loadOrderIssues && results.loadOrderIssues.length > 0) {
        copyText += `LOADING ORDER ISSUES:\n`;
        results.loadOrderIssues.forEach((issue, index) => {
            copyText += `${index + 1}. ${issue.type}: ${issue.message}\n`;
        });
        copyText += `\n`;
    }
    
    if (results.comparison && results.comparison.orderDifferences.length > 0) {
        copyText += `ORDER DIFFERENCES:\n`;
        results.comparison.orderDifferences.forEach((diff, index) => {
            copyText += `${index + 1}. ${diff.script}: HTML position ${diff.htmlPosition}, DOM position ${diff.domPosition}, Expected LoadOrder ${diff.expectedOrder}\n`;
        });
        copyText += `\n`;
    }
    
    if (results.comparison && results.comparison.missingInDOM.length > 0) {
        copyText += `MISSING IN DOM:\n`;
        results.comparison.missingInDOM.forEach((m, index) => {
            copyText += `${index + 1}. ${m.file} (HTML position: ${m.htmlPosition})\n`;
        });
        copyText += `\n`;
    }
    
    if (results.comparison && results.comparison.extraInDOM.length > 0) {
        copyText += `EXTRA IN DOM:\n`;
        results.comparison.extraInDOM.forEach((e, index) => {
            copyText += `${index + 1}. ${e.file} (DOM position: ${e.domPosition}, Source: ${e.source})\n`;
        });
        copyText += `\n`;
    }
    
    if (results.comparison && results.comparison.pathDifferences.length > 0) {
        copyText += `PATH DIFFERENCES:\n`;
        results.comparison.pathDifferences.forEach((p, index) => {
            copyText += `${index + 1}. ${p.script}: HTML="${p.htmlPath}" vs DOM="${p.domPath}"\n`;
        });
        copyText += `\n`;
    }
    
    if (results.packageDocumentation && results.packageDocumentation.issues && results.packageDocumentation.issues.length > 0) {
        copyText += `PACKAGE DOCUMENTATION ISSUES:\n`;
        results.packageDocumentation.issues.forEach((issue, index) => {
            copyText += `${index + 1}. ${issue}\n`;
        });
        copyText += `\n`;
    }
    
    if (results.packageDocumentation && results.packageDocumentation.packages) {
        copyText += `PACKAGES DETAILS:\n`;
        results.packageDocumentation.packages.forEach((pkg, index) => {
            copyText += `${index + 1}. ${pkg.name} (${pkg.id}):\n`;
            copyText += `   - Version: ${pkg.version}\n`;
            copyText += `   - LoadOrder: ${pkg.loadOrder}\n`;
            copyText += `   - Scripts: ${pkg.scripts.length} (${pkg.scripts.filter(s => s.loaded).length} loaded)\n`;
            if (pkg.issues && pkg.issues.length > 0) {
                copyText += `   - Issues: ${pkg.issues.join(', ')}\n`;
            }
            copyText += `\n`;
        });
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(copyText).then(() => {
        if (typeof showNotification === 'function') {
            showNotification('תוצאות הבדיקה הועתקו ללוח', 'success');
        }
    }).catch(() => {
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בהעתקה ללוח', 'error');
        }
    });
}

// Export function globally
window.copyMonitoringResults = copyMonitoringResults;

// יצירת instance גלובלי
const initSystemCheck = new InitSystemCheck();

// אתחול אוטומטי כשהדף נטען - נחכה שהרשימה תהיה קיימת
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // נחכה שהרשימה תהיה קיימת
        const waitForNavList = () => {
            const navList =
                document.querySelector('.tiktrack-nav-list') ||
                document.querySelector('#unified-header');
            if (navList) {
                initSystemCheck.init();
            } else {
                setTimeout(waitForNavList, 100);
            }
        };
        waitForNavList();
    });
} else {
    // נחכה שהרשימה תהיה קיימת
    const waitForNavList = () => {
        const navList =
            document.querySelector('.tiktrack-nav-list') ||
            document.querySelector('#unified-header');
        if (navList) {
            initSystemCheck.init();
        } else {
            setTimeout(waitForNavList, 100);
        }
    };
    waitForNavList();
}

// ייצוא גלובלי
window.initSystemCheck = initSystemCheck;
