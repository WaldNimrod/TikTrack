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

console.log('🔍 Loading Init System Check...');

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
        console.log('✅ Init System Check initialized');
    }

    /**
     * הוספת כפתור בדיקה לראש הדף
     */
    addMonitoringButtonToHeader() {
        // נחכה שהכותרת תיטען
        setTimeout(() => {
            const navList = document.querySelector('.tiktrack-nav-list');
            if (!navList) {
                console.warn('⚠️ Navigation list not found, retrying...');
                setTimeout(() => this.addMonitoringButtonToHeader(), 500);
                return;
            }

            // בדיקה אם הכפתור כבר קיים
            if (document.getElementById('initSystemCheckBtn')) {
                return;
            }

            // יצירת כפתור הבדיקה
            const monitoringButton = document.createElement('li');
            monitoringButton.className = 'tiktrack-nav-item';
            monitoringButton.innerHTML = `
                <a href="#" class="tiktrack-nav-link" id="initSystemCheckBtn" 
                   onclick="initSystemCheck.runPageCheck(event)" 
                   title="בדיקת מערכת איתחול">
                    <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">🔍</span>
                </a>
            `;

            // הוספת הכפתור בסוף הרשימה
            navList.appendChild(monitoringButton);

            console.log('✅ Monitoring check button added to header');
        }, 2000); // הגדלנו את הזמן ל-2 שניות
    }

    /**
     * הרצת בדיקת מערכת איתחול
     */
    async runPageCheck(event) {
        if (event) {
            event.preventDefault();
        }

        console.log('🔍 Starting page monitoring check...');
        
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
            console.error('Error running page monitoring check:', error);
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
     * הצגת תוצאות הבדיקה
     */
    displayResults(results, pageName) {
        const totalIssues = results.criticalErrors + results.mismatches;
        
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
        errorMessage += `• כפילויות: ${results.duplicates.length}\n\n`;

        if (results.mismatchDetails && results.mismatchDetails.length > 0) {
            errorMessage += `🔧 בעיות שזוהו:\n`;
            results.mismatchDetails.forEach((m, index) => {
                errorMessage += `${index + 1}. ${m.type}: ${m.message}\n`;
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
            console.log('📋 Detailed results:', results);
        } else {
            console.log('📋 Monitoring check results:', results);
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
    const totalIssues = results.criticalErrors + results.mismatches;
    
    let copyText = `=== TikTrack Page Monitoring Results ===\n`;
    copyText += `Date: ${new Date().toISOString()}\n`;
    copyText += `Page: ${results.pageName}\n\n`;
    copyText += `SUMMARY:\n`;
    copyText += `- בעיות שזוהו: ${totalIssues}\n`;
    copyText += `- שגיאות קריטיות: ${results.criticalErrors}\n`;
    copyText += `- אי-התאמות: ${results.mismatches}\n`;
    copyText += `- כפילויות: ${results.duplicates.length}\n\n`;
    
    if (results.mismatchDetails && results.mismatchDetails.length > 0) {
        copyText += `MISMATCHES:\n`;
        results.mismatchDetails.forEach((m, index) => {
            copyText += `${index + 1}. ${m.type}: ${m.message}\n`;
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

// אתחול אוטומטי כשהדף נטען
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSystemCheck.init();
    });
} else {
    initSystemCheck.init();
}

// ייצוא גלובלי
window.initSystemCheck = initSystemCheck;
