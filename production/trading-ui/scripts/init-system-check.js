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

if (window.Logger) {
  window.Logger.info('🔍 Loading Init System Check...', { page: 'init-check' });
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
          window.Logger.info('✅ Init System Check initialized', { page: 'init-check' });
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

        // יצירת כפתור הבדיקה עם תפריט משנה
        const monitoringButton = document.createElement('li');
        monitoringButton.className = 'tiktrack-nav-item dropdown';
        monitoringButton.innerHTML = `
            <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" id="initSystemCheckBtn" 
               title="ניטור מערכת איתחול">
                <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">🔍</span>
                <span class="tiktrack-dropdown-arrow">▼</span>
            </a>
            <ul class="tiktrack-dropdown-menu">
                <li><a class="tiktrack-dropdown-item" href="#" data-onclick="initSystemCheck?.runPageCheck(event)">בדיקת מערכת איתחול</a></li>
                <li><a class="tiktrack-dropdown-item" href="#" data-onclick="initSystemCheck?.generateScriptLoadingCode(event)">ייצר קוד טעינה</a></li>
            </ul>
        `;

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
        const pageName = path.split('/').pop().replace('.html', '');
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
     * הצגת תוצאות הבדיקה
     */
    displayResults(results, pageName) {
        const totalIssues = results.criticalErrors + results.mismatches + (results.loadOrderIssues ? results.loadOrderIssues.length : 0);
        
        if (totalIssues === 0) {
            if (typeof showNotification === 'function') {
                showNotification('✅ מערכת תקינה - לא נמצאו בעיות!', 'success');
            }
            return;
        }

        // יצירת הודעת שגיאה מפורטת
        let errorMessage = `🔍 תוצאות בדיקת מערכת - ${pageName}\n\n`;
        errorMessage += `📊 סיכום:\n`;
        errorMessage += `• בעיות שזוהו: ${totalIssues}\n`;
        errorMessage += `• שגיאות קריטיות: ${results.criticalErrors}\n`;
        errorMessage += `• אי-התאמות: ${results.mismatches}\n`;
        errorMessage += `• כפילויות: ${results.duplicates.length}\n`;
        errorMessage += `• בעיות סדר טעינה: ${results.loadOrderIssues ? results.loadOrderIssues.length : 0}\n\n`;

        if (results.mismatchDetails && results.mismatchDetails.length > 0) {
            errorMessage += `🔧 בעיות שזוהו:\n`;
            results.mismatchDetails.forEach((m, index) => {
                errorMessage += `${index + 1}. ${m.type}: ${m.message}\n`;
            });
        }

        // הוספת בעיות סדר טעינה
        if (results.loadOrderIssues && results.loadOrderIssues.length > 0) {
            errorMessage += `\n⏱️ בעיות סדר טעינה:\n`;
            results.loadOrderIssues.forEach((issue, index) => {
                errorMessage += `${index + 1}. ${issue.type}: ${issue.message}\n`;
            });
        }

        // הצגת הודעת שגיאה מפורטת
        if (typeof window.showDetailsModal === 'function') {
            // יצירת HTML מפורט לתוצאות
            let detailsHtml = `
                <div class="row mb-3">
                    <div class="col-md-3">
                        <div class="card ${results.criticalErrors > 0 ? 'bg-danger' : results.mismatches > 0 ? 'bg-warning' : 'bg-success'} text-white">
                            <div class="card-body text-center">
                                <h6>${totalIssues}</h6>
                                <small>בעיות שזוהו</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card ${results.criticalErrors > 0 ? 'bg-danger' : 'bg-light'} text-center">
                            <div class="card-body">
                                <h6>${results.criticalErrors}</h6>
                                <small>שגיאות קריטיות</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card ${results.mismatches > 0 ? 'bg-warning' : 'bg-light'} text-center">
                            <div class="card-body">
                                <h6>${results.mismatches}</h6>
                                <small>אי-התאמות</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card ${results.duplicates.length > 0 ? 'bg-danger' : 'bg-light'} text-center">
                            <div class="card-body">
                                <h6>${results.duplicates.length}</h6>
                                <small>כפילויות</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-3">
                        <div class="card ${results.loadOrderIssues.length > 0 ? 'bg-warning' : 'bg-light'} text-center">
                            <div class="card-body">
                                <h6>${results.loadOrderIssues.length}</h6>
                                <small>בעיות סדר טעינה</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // הוספת פרטי הבעיות
            if (results.mismatchDetails && results.mismatchDetails.length > 0) {
                detailsHtml += `
                    <div class="alert alert-warning">
                        <h6><i class="fas fa-info-circle"></i> בעיות שזוהו (${results.mismatchDetails.length})</h6>
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

            // הוספת בעיות סדר טעינה
            if (results.loadOrderIssues && results.loadOrderIssues.length > 0) {
                detailsHtml += `
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
            
            // הוספת כפתור העתקה
            detailsHtml += `
                <div class="text-center mt-3">
                    <button class="btn btn-primary" onclick="copyMonitoringResults()">
                        <i class="fas fa-copy"></i> העתק תוצאות
                    </button>
                </div>
            `;
            
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
}

/**
 * Copy Monitoring Results
 */
function copyMonitoringResults() {
    if (!window.lastMonitoringResults) {
        if (typeof showNotification === 'function') {
            showNotification('אין תוצאות להעתקה', 'warning');
        }
        return;
    }
    
    const results = window.lastMonitoringResults;
    const totalIssues = results.criticalErrors + results.mismatches + (results.loadOrderIssues ? results.loadOrderIssues.length : 0);
    
    let copyText = `=== TikTrack Page Monitoring Results ===\n`;
    copyText += `Date: ${new Date().toISOString()}\n`;
    copyText += `Page: ${results.pageName}\n\n`;
    copyText += `SUMMARY:\n`;
    copyText += `- בעיות שזוהו: ${totalIssues}\n`;
    copyText += `- שגיאות קריטיות: ${results.criticalErrors}\n`;
    copyText += `- אי-התאמות: ${results.mismatches}\n`;
    copyText += `- כפילויות: ${results.duplicates.length}\n`;
    copyText += `- בעיות סדר טעינה: ${results.loadOrderIssues ? results.loadOrderIssues.length : 0}\n\n`;
    
    if (results.mismatchDetails && results.mismatchDetails.length > 0) {
        copyText += `MISMATCHES:\n`;
        results.mismatchDetails.forEach((m, index) => {
            copyText += `${index + 1}. ${m.type}: ${m.message}\n`;
        });
    }
    
    if (results.loadOrderIssues && results.loadOrderIssues.length > 0) {
        copyText += `\nLOADING ORDER ISSUES:\n`;
        results.loadOrderIssues.forEach((issue, index) => {
            copyText += `${index + 1}. ${issue.type}: ${issue.message}\n`;
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
            const navList = document.querySelector('.tiktrack-nav-list');
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
        const navList = document.querySelector('.tiktrack-nav-list');
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
