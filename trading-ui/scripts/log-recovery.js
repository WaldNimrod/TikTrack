/**
 * ========================================
 * Log Recovery Module - Linter Realtime Monitor
 * ========================================
 * 
 * מודול ניהול לוגים למערכת ניטור Linter
 * כולל שחזור לוגים וניהול הודעות
 * 
 * תכונות:
 * - טעינת לוגים
 * - שחזור לוגים
 * - ניהול הודעות לוג
 * - העתקת לוגים מפורטים
 * 
 * ========================================
 * 
 * מחבר: TikTrack Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

/**
 * טעינת לוגים
 * Load logs
 */
function loadLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('linterLogs') || '[]');
        // Just update the display once with all logs, don't call handleLogEntry for each
        updateLogDisplay();
        // נטענו רשומות לוג
        
        // Try to load scanning results from localStorage as backup
        const savedResults = localStorage.getItem('linterScanningResults');
        if (savedResults) {
            try {
                const parsedResults = JSON.parse(savedResults);
                if (parsedResults && (parsedResults.errors?.length > 0 || parsedResults.warnings?.length > 0)) {
                    window.scanningResults = parsedResults;
                    console.log('✅ Loaded scanning results from localStorage backup');
                }
            } catch (parseError) {
                console.error('Error parsing saved scanning results:', parseError);
            }
        }
        
        console.log('✅ Logs loaded successfully');
    } catch (error) {
        console.error('❌ Error loading logs:', error);
        addLogEntry('ERROR', 'שגיאה בטעינת לוגים', { error: error.message });
    }
}

/**
 * קבלת כל רשומות הלוג
 * Get all log entries
 */
function getAllLogEntries() {
    try {
        return JSON.parse(localStorage.getItem('linterLogs') || '[]');
    } catch (error) {
        console.error('❌ Error getting log entries:', error);
        return [];
    }
}

/**
 * הוספת רשומת לוג
 * Add log entry
 */
function addLogEntry(level, message, details = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        details: details
    };
    
    // Store in localStorage
    try {
        const logs = getAllLogEntries();
        logs.push(entry);
        
        // Keep only last 1000 entries to prevent localStorage overflow
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('linterLogs', JSON.stringify(logs));
        
        // Handle the log entry
        handleLogEntry(entry);
        
        console.log(`📝 Log entry added: ${level} - ${message}`);
    } catch (error) {
        console.error('❌ Error adding log entry:', error);
    }
}

/**
 * טיפול ברשומת לוג
 * Handle log entry
 */
function handleLogEntry(entry) {
    // Update log display
    updateLogDisplay();
    
    // Handle different log levels
    switch (entry.level) {
        case 'ERROR':
            handleCriticalError(entry);
            break;
        case 'WARNING':
            handleWarning(entry);
            break;
        case 'SUCCESS':
            handleSuccess(entry);
            break;
        case 'INFO':
            // Just log to console for info messages
            console.log(`ℹ️ ${entry.message}`);
            break;
    }
    
    // Monitor performance for relevant entries
    monitorPerformance(entry);
    
    // Monitor security for relevant entries
    monitorSecurity(entry);
}

/**
 * טיפול בשגיאות קריטיות
 * Handle critical errors
 */
function handleCriticalError(entry) {
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`שגיאה קריטית: ${entry.message}`, 'error');
    }
    
    // Log to console
    console.error(`🚨 Critical Error: ${entry.message}`, entry.details);
    
    // Attempt recovery if possible
    if (entry.details && entry.details.recoverable) {
        attemptRecovery(entry);
    }
}

/**
 * טיפול באזהרות
 * Handle warnings
 */
function handleWarning(entry) {
    if (typeof showNotification === 'function') {
        showNotification(`אזהרה: ${entry.message}`, 'warning');
    }
    
    console.warn(`⚠️ Warning: ${entry.message}`, entry.details);
}

/**
 * טיפול בהודעות הצלחה
 * Handle success messages
 */
function handleSuccess(entry) {
    if (typeof showNotification === 'function') {
        showNotification(entry.message, 'success');
    }
    
    console.log(`✅ Success: ${entry.message}`, entry.details);
}

/**
 * ניטור ביצועים
 * Monitor performance
 */
function monitorPerformance(entry) {
    if (entry.details && entry.details.scanDuration) {
        const duration = entry.details.scanDuration;
        if (duration > 30000) { // More than 30 seconds
            addLogEntry('WARNING', 'סריקה איטית זוהתה', { 
                duration: duration,
                performance: 'slow'
            });
        }
    }
}

/**
 * ניטור אבטחה
 * Monitor security
 */
function monitorSecurity(entry) {
    const securityPatterns = [
        'password', 'token', 'key', 'secret', 'auth'
    ];
    
    const message = entry.message.toLowerCase();
    const hasSecurityPattern = securityPatterns.some(pattern => 
        message.includes(pattern)
    );
    
    if (hasSecurityPattern) {
        addLogEntry('WARNING', 'זוהה תוכן רגיש בלוג', {
            pattern: 'security-sensitive',
            message: entry.message
        });
    }
}

/**
 * עדכון תצוגת לוגים
 * Update log display
 */
function updateLogDisplay() {
    const logContainer = document.getElementById('logsContainer');
    if (!logContainer) return;
    
    const logs = getAllLogEntries();
    const recentLogs = logs.slice(-50); // Show last 50 entries
    
    // Clear existing content
    logContainer.innerHTML = '';
    
    // Add log entries
    recentLogs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `log-entry log-${log.level.toLowerCase()}`;
        
        const timestamp = new Date(log.timestamp).toLocaleString('he-IL');
        logElement.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-level">${log.level}</span>
            <span class="log-message">${log.message}</span>
        `;
        
        logContainer.appendChild(logElement);
    });
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * העתקת לוג מפורט
 * Copy detailed log
 */
function copyDetailedLog() {
    const logs = getAllLogEntries();
    
    if (logs.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('אין לוגים להעתקה', 'warning');
        }
        return;
    }
    
    // Format logs for copying
    const formattedLogs = logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString('he-IL');
        return `[${timestamp}] ${log.level}: ${log.message}`;
    }).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedLogs).then(() => {
        if (typeof showNotification === 'function') {
            showNotification('לוג מפורט הועתק ללוח', 'success');
        }
        console.log('✅ Detailed log copied to clipboard');
    }).catch(error => {
        console.error('❌ Error copying log:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בהעתקת לוג', 'error');
        }
    });
}

/**
 * העתקת לוג בעיות לא פתורות
 * Copy unresolved issues log
 */
function copyUnresolvedIssuesLog() {
    if (!window.scanningResults) {
        if (typeof showNotification === 'function') {
            showNotification('אין נתוני סריקה זמינים', 'warning');
        }
        return;
    }
    
    const unresolvedIssues = [
        ...window.scanningResults.errors,
        ...window.scanningResults.warnings
    ];
    
    if (unresolvedIssues.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('אין בעיות לא פתורות', 'info');
        }
        return;
    }
    
    // Format issues for copying
    const formattedIssues = unresolvedIssues.map(issue => {
        return `${issue.file}:${issue.line} - ${issue.type.toUpperCase()}: ${issue.message}`;
    }).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedIssues).then(() => {
        if (typeof showNotification === 'function') {
            showNotification('לוג בעיות לא פתורות הועתק ללוח', 'success');
        }
        console.log('✅ Unresolved issues log copied to clipboard');
    }).catch(error => {
        console.error('❌ Error copying unresolved issues log:', error);
        if (typeof showNotification === 'function') {
            showNotification('שגיאה בהעתקת לוג בעיות', 'error');
        }
    });
}

/**
 * ניסיון שחזור
 * Attempt recovery
 */
function attemptRecovery(entry) {
    console.log('🔄 Attempting recovery for:', entry.message);
    
    // Implement recovery logic based on error type
    if (entry.details && entry.details.type === 'chart') {
        if (typeof window.attemptChartRecovery === 'function') {
            window.attemptChartRecovery();
        }
    } else if (entry.details && entry.details.type === 'storage') {
        if (typeof window.attemptStorageRecovery === 'function') {
            window.attemptStorageRecovery();
        }
    } else if (entry.details && entry.details.type === 'network') {
        if (typeof window.attemptNetworkRecovery === 'function') {
            window.attemptNetworkRecovery();
        }
    }
}

// Export functions to global scope
window.loadLogs = loadLogs;
window.getAllLogEntries = getAllLogEntries;
window.addLogEntry = addLogEntry;
window.handleLogEntry = handleLogEntry;
window.updateLogDisplay = updateLogDisplay;
/**
 * העתקת לוג מפורט של Linter Realtime Monitor
 */
window.copyDetailedLog = async function() {
    try {
        const timestamp = new Date().toLocaleString('he-IL');
        
        // קבלת מידע על המשתמש הפעיל
        let activeProfile = 'לא זמין';
        if (typeof window.TikTrackAuth !== 'undefined' && window.TikTrackAuth.getCurrentUser) {
            const currentUser = window.TikTrackAuth.getCurrentUser();
            if (currentUser) {
                activeProfile = currentUser.name || currentUser.username || 'נימרוד';
            }
        }
        
        // קבלת מידע על סריקות
        let totalFiles = 0;
        let totalErrors = 0;
        let totalWarnings = 0;
        let lastScanTime = 'לא בוצעה';
        
        if (window.scanningResults) {
            totalFiles = window.scanningResults.scannedFiles || window.scanningResults.totalFiles || 0;
            totalErrors = window.scanningResults.errors ? window.scanningResults.errors.length : 0;
            totalWarnings = window.scanningResults.warnings ? window.scanningResults.warnings.length : 0;
            lastScanTime = window.scanningResults.lastScanTime || window.scanningResults.timestamp || 
                          (window.scanningResults.endTime ? new Date(window.scanningResults.endTime).toLocaleString('he-IL') : 'לא בוצעה');
        } else {
            // Debug: Check localStorage for data
            const savedResults = localStorage.getItem('linterScanningResults');
            if (savedResults) {
                try {
                    const results = JSON.parse(savedResults);
                    totalFiles = results.scannedFiles || results.totalFiles || 0;
                    totalErrors = results.errors ? results.errors.length : 0;
                    totalWarnings = results.warnings ? results.warnings.length : 0;
                    lastScanTime = results.timestamp || (results.endTime ? new Date(results.endTime).toLocaleString('he-IL') : 'לא בוצעה');
                } catch (error) {
                    console.error('Error parsing localStorage data:', error);
                }
            } else {
                // Debug: Check IndexedDB for data
                if (typeof window.LinterIndexedDBAdapter !== 'undefined') {
                    try {
                        const adapter = new window.LinterIndexedDBAdapter();
                        await adapter.initialize();
                        const latestData = await adapter.getLatestData();
                        if (latestData && latestData.length > 0) {
                            const latestScan = latestData[latestData.length - 1];
                            totalFiles = latestScan.filesScanned || latestScan.metrics?.totalFiles || 0;
                            totalErrors = latestScan.errors ? latestScan.errors.length : 0;
                            totalWarnings = latestScan.warnings ? latestScan.warnings.length : 0;
                            lastScanTime = latestScan.timestamp || (latestScan.endTime ? new Date(latestScan.endTime).toLocaleString('he-IL') : 'לא בוצעה');
                        }
                    } catch (error) {
                        console.error('Error checking IndexedDB:', error);
                    }
                }
            }
        }
        
        // קבלת מידע על גרפים
        let chartsStatus = 'לא מאותחלים';
        if (typeof window.initializeCharts === 'function') {
            chartsStatus = 'מוכנים';
        }
        
        // קבלת מידע על לוגים
        let logEntries = 0;
        if (typeof window.getAllLogEntries === 'function') {
            const logs = window.getAllLogEntries();
            logEntries = logs ? logs.length : 0;
        }
        
        const logContent = `🔔 לוג מפורט - Linter Realtime Monitor
📅 תאריך ושעה: ${timestamp}
👤 משתמש פעיל: ${activeProfile}

📊 סטטיסטיקות סריקה:
  - קבצים נסרקו: ${totalFiles}
  - שגיאות: ${totalErrors}
  - אזהרות: ${totalWarnings}
  - סריקה אחרונה: ${lastScanTime}

📈 מצב גרפים: ${chartsStatus}
📝 מספר רשומות לוג: ${logEntries}

🔧 מידע טכני:
  - מערכת Linter: פעילה
  - IndexedDB: ${typeof window.LinterIndexedDBAdapter !== 'undefined' ? 'זמין' : 'לא זמין'}
  - מערכת אימות: ${typeof window.TikTrackAuth !== 'undefined' ? 'זמין' : 'לא זמין'}
  - מערכת העדפות: ${typeof window.getPreference === 'function' ? 'זמין' : 'לא זמין'}

       📝 הערות:
         - לוג זה מכיל מידע על מצב מערכת Linter Realtime Monitor
         - כולל סטטיסטיקות סריקה, גרפים, ולוגים
         - נוצר אוטומטית על ידי מערכת Linter
         
       🔍 Debug Info:
         - window.scanningResults: ${window.scanningResults ? 'קיים' : 'לא קיים'}
         - localStorage data: ${localStorage.getItem('linterScanningResults') ? 'קיים' : 'לא קיים'}
         - IndexedDB adapter: ${typeof window.LinterIndexedDBAdapter !== 'undefined' ? 'זמין' : 'לא זמין'}`;

        navigator.clipboard.writeText(logContent).then(() => {
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט של Linter הועתק ללוח');
            } else {
                console.log('✅ לוג מפורט של Linter הועתק ללוח');
            }
        }).catch(error => {
            console.error('❌ שגיאה בהעתקת הלוג:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בהעתקת הלוג');
            }
        });
        
    } catch (error) {
        console.error('❌ שגיאה ביצירת לוג מפורט:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה ביצירת הלוג המפורט');
        }
    }
};
window.copyUnresolvedIssuesLog = copyUnresolvedIssuesLog;

console.log('📝 Log Recovery Module loaded successfully');